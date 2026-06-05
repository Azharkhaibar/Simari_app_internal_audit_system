import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditLogService } from '../audit-log.service';
import { ActionType, ModuleType } from '../entities/audit-log.entity';
import type { Request } from 'express';

interface SafeUser {
  sub?: number;
  user_id?: number;
  userID?: string;
  role?: string;
}
interface SafeError {
  message?: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  // ✅ HANYA skip endpoint audit-logs & static files
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();

    const url: string = req.originalUrl ?? req.url ?? '-';
    const method: string = req.method ?? 'GET';

    // Skip audit-logs endpoint sendiri (hindari infinite loop)
    if (url.includes('/audit-logs')) {
      return next.handle();
    }

    // Skip static files
    if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json|xml|txt|html|pdf)$/i.test(url)) {
      return next.handle();
    }

    const user = req.user as SafeUser | undefined;

    let userId: number | null = null;
    if (user?.sub != null) {
      userId = Number(user.sub);
    } else if (user?.user_id != null) {
      userId = Number(user.user_id);
    }

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.ip ??
      req.socket?.remoteAddress ??
      '-';

    this.logger.log(`Processing: ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        void this.createAuditLog({
          userId,
          method,
          url,
          ip,
          isSuccess: true,
        });
      }),

      catchError((err: unknown) => {
        const safeError = err as SafeError;

        void this.createAuditLog({
          userId,
          method,
          url,
          ip,
          isSuccess: false,
          description: safeError?.message ?? 'Request failed',
        });

        return throwError(() => err);
      }),
    );
  }

  private async createAuditLog(data: {
    userId: number | null;
    method: string;
    url: string;
    ip: string;
    isSuccess: boolean;
    description?: string;
  }): Promise<void> {
    try {
      const auditLogData = {
        userId: data.userId,
        action: this.getActionFromMethod(data.method),
        module: this.getModuleFromUrl(data.url),
        description: data.description ?? `${data.method} ${data.url}`,
        endpoint: data.url,
        ip_address: data.ip,
        isSuccess: data.isSuccess,
        metadata: {
          method: data.method,
          url: data.url,
          timestamp: new Date().toISOString(),
          source: 'interceptor',
        },
      };

      await this.auditLogService.create(auditLogData);
    } catch (error) {
      // Silent fail - audit log failure shouldn't break the app
    }
  }

  private getActionFromMethod(method: string): ActionType {
    const map: Record<string, ActionType> = {
      GET: ActionType.VIEW,
      POST: ActionType.CREATE,
      PUT: ActionType.UPDATE,
      PATCH: ActionType.UPDATE,
      DELETE: ActionType.DELETE,
    };
    return map[method.toUpperCase()] ?? ActionType.VIEW;
  }

  private getModuleFromUrl(url: string): ModuleType {
    const lower = url.toLowerCase();

    // ==========================================
    // DETEKSI OJK MODULES (13 Modules)
    // ==========================================

    // Konsentrasi OJK
    if (lower.includes('konsentrasi'))
      return ModuleType.KONSENTRASI_OJK;

    // Kredit Produk OJK
    if (lower.includes('kredit'))
      return ModuleType.KREDIT_OJK;

    // Permodalan OJK
    if (lower.includes('permodalan'))
      return ModuleType.PERMODALAN_OJK;

    // Rentabilitas OJK
    if (lower.includes('rentabilitas'))
      return ModuleType.RENTABILITAS_OJK;

    // Tatakelola OJK
    if (lower.includes('tatakelola'))
      return ModuleType.TATAKELOLA_OJK;

    // Hukum OJK
    if (lower.includes('hukum') && lower.includes('ojk'))
      return ModuleType.HUKUM_OJK;

    // Investasi OJK
    if (lower.includes('investasi') && lower.includes('ojk'))
      return ModuleType.INVESTASI_OJK;

    // Kepatuhan OJK
    if (lower.includes('kepatuhan') && lower.includes('ojk'))
      return ModuleType.KEPATUHAN_OJK;

    // Likuiditas Produk OJK
    if (lower.includes('likuiditas') && lower.includes('produk'))
      return ModuleType.LIKUIDITAS_OJK;

    // Operasional OJK
    if (lower.includes('operasional') && lower.includes('ojk'))
      return ModuleType.OPERASIONAL_OJK;

    // Pasar Produk OJK
    if (lower.includes('pasar') && lower.includes('ojk'))
      return ModuleType.PASAR_OJK;

    // Reputasi OJK
    if (lower.includes('reputasi') && lower.includes('ojk'))
      return ModuleType.REPUTASI_OJK;

    // Strategis OJK
    if (lower.includes('strategis') && lower.includes('ojk'))
      return ModuleType.STRATEGIS_OJK;

    // ==========================================
    // DETEKSI HOLDING MODULES
    // ==========================================

    // RAS
    if (lower.includes('/ras') || lower.includes('risk-assessment') || lower.includes('risk_assessment'))
      return ModuleType.RAS;

    // Investasi
    if (lower.includes('investasi') || lower.includes('investment'))
      return ModuleType.INVESTASI;

    // Pasar
    if (lower.includes('market') || lower.includes('pasar'))
      return ModuleType.PASAR;

    // Likuiditas
    if (lower.includes('likuiditas') || lower.includes('liquidity'))
      return ModuleType.LIKUIDITAS;

    // Operasional
    if (lower.includes('operasional') || lower.includes('operational'))
      return ModuleType.OPERASIONAL;

    // Hukum
    if (lower.includes('hukum') || lower.includes('legal'))
      return ModuleType.HUKUM;

    // Strategik
    if (lower.includes('strategi') || lower.includes('stratejik') || lower.includes('strategic'))
      return ModuleType.STRATEJIK;

    // Kepatuhan
    if (lower.includes('kepatuhan') || lower.includes('compliance'))
      return ModuleType.KEPATUHAN;

    // Reputasi
    if (lower.includes('reputasi') || lower.includes('reputation'))
      return ModuleType.REPUTASI;

    // User Management
    if (lower.includes('user') || lower.includes('auth') || lower.includes('login') || lower.includes('register'))
      return ModuleType.USER_MANAGEMENT;

    // System (audit/log)
    if (lower.includes('audit') || lower.includes('log'))
      return ModuleType.SYSTEM;

    return ModuleType.SYSTEM;
  }
}