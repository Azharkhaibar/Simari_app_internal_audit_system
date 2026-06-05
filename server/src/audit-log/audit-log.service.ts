import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere, In } from 'typeorm';
import { AuditLog, ActionType, ModuleType } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(auditLogData: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const { userId, ip_address, ...rest } = auditLogData;

      this.logger.log(`Menerima audit log: module=${rest.module}, action=${rest.action}, userId=${userId}`);

      const auditLog = this.auditLogRepository.create({
        ...rest,
        userId: userId ?? null,
        ip_address: ip_address || 'unknown',
      });

      const savedLog = await this.auditLogRepository.save(auditLog);
      
      this.logger.log(`Audit log berhasil dibuat: id=${savedLog.id}, userId=${savedLog.userId}, module=${savedLog.module}, action=${savedLog.action}`);
      
      return savedLog;
    } catch (error) {
      this.logger.error('Error creating audit log:', error);
      throw error;
    }
  }

  async findAll(query: AuditLogQueryDto) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        action,
        module,
        start_date,
        end_date,
      } = query;

      const skip = (page - 1) * limit;

      const whereConditions: FindOptionsWhere<AuditLog> = {};

      if (search) {
        whereConditions.description = Like(`%${search}%`);
      }
      if (action) {
        whereConditions.action = action;
      }
      if (module) {
        whereConditions.module = module;
      }
      if (start_date && end_date) {
        whereConditions.timestamp = Between(
          new Date(start_date),
          new Date(`${end_date}T23:59:59.999Z`),
        );
      }

      this.logger.log(`Query conditions: ${JSON.stringify(whereConditions)}`);

      const [data, total] = await this.auditLogRepository.findAndCount({
        where: whereConditions,
        relations: {
          user: true,
        },
        order: { timestamp: 'DESC' },
        skip,
        take: limit,
      });

      this.logger.log(`Audit logs loaded: ${data.length} of ${total}`);

      // Debug sample
      if (data.length > 0) {
        const sampleLog = data[0];
        this.logger.debug('Sample log structure:', {
          id: sampleLog.id,
          userId: sampleLog.userId,
          hasUser: !!sampleLog.user,
          user: sampleLog.user
            ? {
                user_id: sampleLog.user.user_id,
                userID: sampleLog.user.userID,
                role: sampleLog.user.role,
                gender: sampleLog.user.gender,
              }
            : 'No user',
        });
      }

      return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error finding audit logs:', error);
      throw error;
    }
  }

  // ✅ PERBAIKAN UTAMA: Semua kondisi pakai andWhere() — tidak ada if-else where()/andWhere()
  async findAllWithUser(query: AuditLogQueryDto) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        action,
        module,
        start_date,
        end_date,
      } = query;

      const skip = (page - 1) * limit;

      const queryBuilder = this.auditLogRepository
        .createQueryBuilder('audit_log')
        .leftJoinAndSelect('audit_log.user', 'user')
        .orderBy('audit_log.timestamp', 'DESC')
        .skip(skip)
        .take(limit);

      // ✅ SEMUA pakai andWhere — tanpa where() sama sekali
      // Ini memastikan query tetap jalan meskipun tidak ada filter
      if (search) {
        queryBuilder.andWhere('audit_log.description LIKE :search', {
          search: `%${search}%`,
        });
      }

      if (action) {
        queryBuilder.andWhere('audit_log.action = :action', { action });
      }

      if (module) {
        queryBuilder.andWhere('audit_log.module = :module', { module });
      }

      if (start_date && end_date) {
        queryBuilder.andWhere('audit_log.timestamp BETWEEN :start AND :end', {
          start: new Date(start_date),
          end: new Date(`${end_date}T23:59:59.999Z`),
        });
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      this.logger.log(`Enhanced query - Audit logs loaded: ${data.length} of ${total}`);

      // Debug sample
      if (data.length > 0) {
        const firstLog = data[0];
        this.logger.debug('First log with user:', {
          id: firstLog.id,
          userId: firstLog.userId,
          hasUser: !!firstLog.user,
          user: firstLog.user
            ? {
                user_id: firstLog.user.user_id,
                userID: firstLog.user.userID,
                role: firstLog.user.role,
                gender: firstLog.user.gender,
              }
            : null,
        });
      }

      return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error finding audit logs with user:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const now = new Date();

      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayStats = await this.auditLogRepository
        .createQueryBuilder('audit_log')
        .select('audit_log.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .where('audit_log.timestamp BETWEEN :start AND :end', {
          start: startOfToday,
          end: endOfToday,
        })
        .groupBy('audit_log.action')
        .getRawMany();

      const weekStats = await this.auditLogRepository
        .createQueryBuilder('audit_log')
        .select('audit_log.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .where('audit_log.timestamp BETWEEN :start AND :end', {
          start: startOfWeek,
          end: endOfToday,
        })
        .groupBy('audit_log.action')
        .getRawMany();

      const monthStats = await this.auditLogRepository
        .createQueryBuilder('audit_log')
        .select('audit_log.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .where('audit_log.timestamp BETWEEN :start AND :end', {
          start: startOfMonth,
          end: endOfToday,
        })
        .groupBy('audit_log.action')
        .getRawMany();

      const modules = await this.auditLogRepository
        .createQueryBuilder('audit_log')
        .select('DISTINCT audit_log.module', 'module')
        .where('audit_log.module IS NOT NULL')
        .getRawMany();

      return {
        today: todayStats,
        week: weekStats,
        month: monthStats,
        modules: modules.map((m) => m.module).filter(Boolean),
      };
    } catch (error) {
      this.logger.error('Error getting stats:', error);
      throw error;
    }
  }

  async exportToExcel(query: AuditLogQueryDto): Promise<AuditLog[]> {
    try {
      const { data } = await this.findAllWithUser({ ...query, limit: 1000 });
      return data;
    } catch (error) {
      this.logger.error('Error exporting to excel:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      this.logger.log(`Menghapus audit log ID: ${id}`);
      
      const auditLog = await this.auditLogRepository.findOne({
        where: { id },
      });

      if (!auditLog) {
        throw new NotFoundException(`Audit log dengan ID ${id} tidak ditemukan`);
      }

      await this.auditLogRepository.remove(auditLog);

      this.logger.log(`Berhasil menghapus log ID: ${id}`);
      
      return {
        message: 'Data log audit berhasil dihapus',
      };
    } catch (error) {
      this.logger.error(`Error deleting audit log ${id}:`, error);
      throw error;
    }
  }

  async deleteMultiple(
    ids: number[],
  ): Promise<{ message: string; deletedCount: number }> {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new Error('ID logs tidak valid');
      }

      this.logger.log(`Menghapus ${ids.length} audit logs: [${ids.join(', ')}]`);

      const auditLogs = await this.auditLogRepository.find({
        where: { id: In(ids) },
      });

      if (auditLogs.length === 0) {
        throw new NotFoundException('Tidak ada audit log yang ditemukan dengan ID yang diberikan');
      }

      await this.auditLogRepository.remove(auditLogs);

      this.logger.log(`Berhasil menghapus ${auditLogs.length} audit logs`);

      return {
        message: `${auditLogs.length} audit log berhasil dihapus`,
        deletedCount: auditLogs.length,
      };
    } catch (error) {
      this.logger.error('Error deleting multiple audit logs:', error);
      throw error;
    }
  }

  async deleteAll(): Promise<{ message: string; deletedCount: number }> {
    try {
      const count = await this.auditLogRepository.count();
      
      if (count === 0) {
        return {
          message: 'Tidak ada log audit untuk dihapus',
          deletedCount: 0,
        };
      }

      await this.auditLogRepository.clear();

      this.logger.log(`Berhasil menghapus semua ${count} audit logs`);

      return {
        message: `Semua ${count} audit log berhasil dihapus`,
        deletedCount: count,
      };
    } catch (err) {
      this.logger.error('Error deleting all audit logs:', err);
      throw new Error(`Gagal menghapus semua audit logs: ${err.message}`);
    }
  }

  async deleteByFilter(filters: {
    start_date?: string;
    end_date?: string;
    action?: string;
    module?: string;
  }): Promise<{ message: string; deletedCount: number }> {
    try {
      const whereConditions: FindOptionsWhere<AuditLog> = {};

      if (filters.action) {
        if (Object.values(ActionType).includes(filters.action as ActionType)) {
          whereConditions.action = filters.action as ActionType;
        } else {
          throw new Error(`Action '${filters.action}' tidak valid`);
        }
      }

      if (filters.module) {
        if (Object.values(ModuleType).includes(filters.module as ModuleType)) {
          whereConditions.module = filters.module as ModuleType;
        } else {
          throw new Error(`Module '${filters.module}' tidak valid`);
        }
      }

      if (filters.start_date && filters.end_date) {
        whereConditions.timestamp = Between(
          new Date(filters.start_date),
          new Date(`${filters.end_date}T23:59:59.999Z`),
        );
      }

      const auditLogs = await this.auditLogRepository.find({
        where: whereConditions,
      });

      if (auditLogs.length === 0) {
        return {
          message: 'Tidak ada log yang sesuai dengan filter',
          deletedCount: 0,
        };
      }

      await this.auditLogRepository.remove(auditLogs);

      this.logger.log(`Berhasil menghapus ${auditLogs.length} audit logs berdasarkan filter`);

      return {
        message: `${auditLogs.length} log berhasil dihapus berdasarkan filter`,
        deletedCount: auditLogs.length,
      };
    } catch (error) {
      this.logger.error('Error deleting audit logs by filter:', error);
      throw new Error(`Gagal menghapus audit logs berdasarkan filter: ${error.message}`);
    }
  }

  async checkUserRelation() {
    try {
      const testLog = await this.auditLogRepository.findOne({
        where: { userId: 1 },
        relations: {
          user: true,
        },
      });

      this.logger.log('Relation test:', {
        hasLog: !!testLog,
        userId: testLog?.userId,
        hasUser: !!testLog?.user,
        user: testLog?.user
          ? {
              user_id: testLog.user.user_id,
              userID: testLog.user.userID,
              role: testLog.user.role,
              gender: testLog.user.gender,
            }
          : null,
      });

      return testLog;
    } catch (error) {
      this.logger.error('Relation test error:', error);
      throw error;
    }
  }

  async getLogsWithUserInfo(query: AuditLogQueryDto) {
    try {
      const result = await this.findAllWithUser(query);
      return result;
    } catch (error) {
      this.logger.error('Error getting logs with user info:', error);
      throw error;
    }
  }

  getUserDisplayName(user: User | null): string {
    if (!user) return 'System';
    if (user.userID) {
      return user.userID;
    }
    return `User ${user.user_id}`;
  }

  getUserRoleDisplay(user: User | null): string {
    if (!user) return 'System';
    return user.role || 'User';
  }
}