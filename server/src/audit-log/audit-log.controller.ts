import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  Req,
  Delete,
  Param,
  HttpException,
  HttpStatus,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { ActionType, ModuleType } from './entities/audit-log.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {

  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  async create(@Body() dto: CreateAuditLogDto, @Req() req: Request) {
    console.log('🔍 [CONTROLLER] Creating audit log:', dto);

    let ipAddress = '';

    try {
      const forwarded = req.headers['x-forwarded-for'];
      if (typeof forwarded === 'string') {
        ipAddress = forwarded.split(',')[0].trim();
      } else if (Array.isArray(forwarded)) {
        ipAddress = forwarded[0];
      }

      if (!ipAddress) {
        const realIp = req.headers['x-real-ip'];
        if (typeof realIp === 'string') {
          ipAddress = realIp;
        }
      }

      if (!ipAddress && req.socket?.remoteAddress) {
        ipAddress = req.socket.remoteAddress;
        if (ipAddress === '::1') {
          ipAddress = '127.0.0.1';
        } else if (ipAddress.startsWith('::ffff:')) {
          ipAddress = ipAddress.substring(7);
        }
      }

      if (!ipAddress) {
        ipAddress = 'unknown';
      }

      console.log('🌐 [CONTROLLER] Detected IP:', ipAddress);
    } catch (error) {
      console.warn('⚠️ [CONTROLLER] Error detecting IP:', error);
      ipAddress = 'unknown';
    }

    let finalUserId = dto.userId;
    if (finalUserId == null) {
      const user = (req as any).user;
      if (user?.sub != null) {
        finalUserId = Number(user.sub);
      } else if (user?.user_id != null) {
        finalUserId = Number(user.user_id);
      } else if (user?.id != null) {
        finalUserId = Number(user.id);
      }
    }

    const auditLogData = {
      ...dto,
      userId: finalUserId,
      ip_address: ipAddress,
    };

    return await this.auditLogService.create(auditLogData);
  }

  @Get()
  async findAll(@Query() query: AuditLogQueryDto) {
    console.log('🔍 [CONTROLLER] Fetching audit logs with query:', query);

    const result = await this.auditLogService.getLogsWithUserInfo(query);

    console.log('✅ [CONTROLLER] Found logs:', result.total);
    console.log(
      '✅ [CONTROLLER] Sample log user data:',
      result.data.length > 0
        ? {
            userId: result.data[0].userId,
            user: result.data[0].user
              ? {
                  userID: result.data[0].user.userID,
                  role: result.data[0].user.role,
                }
              : 'No user',
          }
        : 'No data',
    );

    return result;
  }

  @Get('test-relation')
  async testRelation() {
    return await this.auditLogService.checkUserRelation();
  }

  @Get('stats')
  async getStats() {
    return await this.auditLogService.getStats();
  }

  @Get('export')
  async exportToExcel(
    @Query() query: AuditLogQueryDto,
    @Res() res: Response,
  ) {
    try {
      const data = await this.auditLogService.exportToExcel(query);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`,
      );

      return res.json(data);
    } catch (error) {
      throw new HttpException(
        'Gagal mengekspor data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteAuditLog(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    try {
      return await this.auditLogService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || 'Gagal menghapus audit log',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('batch/delete')
  async deleteMultipleAuditLogs(
    @Body() body: { ids: number[] },
  ): Promise<{ message: string; deletedCount: number }> {
    try {
      if (!body.ids || !Array.isArray(body.ids)) {
        throw new HttpException(
          'Format data tidak valid. IDs harus berupa array',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (body.ids.length === 0) {
        throw new HttpException(
          'Tidak ada ID yang diberikan untuk dihapus',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.auditLogService.deleteMultiple(body.ids);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Gagal menghapus audit logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('filter')
  async deleteByFilter(
    @Query()
    filters: {
      start_date?: string;
      end_date?: string;
      action?: string;
      module?: string;
    },
  ): Promise<{ message: string; deletedCount: number }> {
    try {
      // Validasi tanggal
      if (filters.start_date && filters.end_date) {
        const startDate = new Date(filters.start_date);
        const endDate = new Date(filters.end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new HttpException(
            'Format tanggal tidak valid',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (startDate > endDate) {
          throw new HttpException(
            'Tanggal mulai tidak boleh lebih besar dari tanggal akhir',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Validasi action jika ada
      if (filters.action && !Object.values(ActionType).includes(filters.action as ActionType)) {
        throw new HttpException(
          `Action '${filters.action}' tidak valid`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validasi module jika ada
      if (filters.module && !Object.values(ModuleType).includes(filters.module as ModuleType)) {
        throw new HttpException(
          `Module '${filters.module}' tidak valid`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const convertedFilters = {
        start_date: filters.start_date,
        end_date: filters.end_date,
        action: filters.action as ActionType,
        module: filters.module as ModuleType,
      };

      return await this.auditLogService.deleteByFilter(convertedFilters);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Gagal menghapus audit logs berdasarkan filter',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('all')
  async deleteAllAuditLogs(): Promise<{
    message: string;
    deletedCount: number;
  }> {
    try {
      return await this.auditLogService.deleteAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Gagal menghapus semua audit logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}