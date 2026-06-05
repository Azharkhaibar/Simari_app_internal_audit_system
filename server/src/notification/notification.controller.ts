import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  ParseIntPipe,
  DefaultValuePipe,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UserStatusDto } from './dto/user-status.dto';
import { GetUser } from './decorator/get-user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly notificationService: NotificationService,
    @Inject(NotificationGateway)
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Get()
  async findAll() {
    this.logger.log('Fetching all notifications');
    return await this.notificationService.findAll();
  }

  @Get('my')
  async getMyNotifications(
    @GetUser('user_id') userId: number,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    this.logger.log(`Fetching notifications for user ${userId}`);
    return await this.notificationService.findAllForUser(userId, {
      unreadOnly: unreadOnly === 'true',
      limit,
      page,
    });
  }

  @Get('user/:user_id')
  async findByUser(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    this.logger.log(`Fetching personal notifications for user ${user_id}`);
    return await this.notificationService.findByUser(user_id, {
      unreadOnly: unreadOnly === 'true',
      limit,
      page,
    });
  }

  @Get('user/:user_id/all')
  async getAllForUser(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    this.logger.log(`Fetching all notifications for user ${user_id}`);
    return await this.notificationService.findAllForUser(user_id, {
      unreadOnly: unreadOnly === 'true',
      limit,
      page,
    });
  }

  @Get('user/:user_id/unread-count')
  async getUnreadCount(@Param('user_id', ParseIntPipe) user_id: number) {
    this.logger.log(`Fetching unread count for user ${user_id}`);
    const count = await this.notificationService.getUnreadCount(user_id);
    return { count };
  }

  @Get('broadcast')
  async getBroadcastNotifications(
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
  ) {
    this.logger.log('Fetching broadcast notifications');
    return await this.notificationService.findBroadcastNotifications({
      unreadOnly: unreadOnly === 'true',
      limit,
      page,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching notification ${id}`);
    return await this.notificationService.findOne(id);
  }

  @Post()
  async create(
    @GetUser('user_id') userId: number,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    this.logger.log(`Creating notification for user ${userId}`);

    // DEBUG: Log incoming DTO
    this.logger.debug('Incoming DTO:', {
      dto: createNotificationDto,
      metadata: createNotificationDto.metadata,
      hasMetadata: !!createNotificationDto.metadata,
      metadataType: typeof createNotificationDto.metadata,
    });

    const dto = {
      ...createNotificationDto,
      user_id: createNotificationDto.user_id !== undefined ? createNotificationDto.user_id : userId,
    };

    const notification = await this.notificationService.create(dto);

    // DEBUG: Log created notification
    this.logger.debug('Created notification:', {
      notificationId: notification.notification_id,
      metadata: notification.metadata,
      hasMetadata: !!notification.metadata,
    });

    return notification;
  }

  @Post('bulk')
  async createMultiple(
    @Body() createNotificationDtos: CreateNotificationDto[],
  ) {
    this.logger.log(`Creating ${createNotificationDtos.length} notifications`);
    const notifications = await this.notificationService.createMultiple(
      createNotificationDtos,
    );

    return notifications;
  }

  @Post('broadcast')
  async broadcast(@Body() dto: CreateNotificationDto) {
    this.logger.log('Creating broadcast notification');
    const notification = await this.notificationService.create(dto);

    return notification;
  }

  @Post('user-status')
  async userStatusNotification(@Body() userStatusDto: UserStatusDto) {
    this.logger.log(
      `User status change: ${userStatusDto.userName} is ${userStatusDto.status}`,
    );

    // Buat notifikasi
    const notification = await this.notificationService.create({
      user_id: null,
      type: 'SYSTEM' as any,
      title: 'User Status Update',
      message: `${userStatusDto.userName} is now ${userStatusDto.status}`,
      category: 'user-status',
      metadata: {
        userId: userStatusDto.userId,
        userName: userStatusDto.userName,
        status: userStatusDto.status,
        timestamp: new Date(),
        isStatusUpdate: true,
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // ✅ BROADCAST STATUS KE SEMUA USER (SEKARANG SUDAH BISA KARENA METHOD PUBLIC)
    this.notificationGateway.broadcastUserStatus(
      userStatusDto.userId,
      userStatusDto.status,
    );

    return notification;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    this.logger.log(`Updating notification ${id}`);
    const updated = await this.notificationService.update(
      id,
      updateNotificationDto,
    );

    // ✅ KIRIM UPDATE REALTIME
    if (updated.user_id) {
      this.notificationGateway.sendNotificationToUser(updated.user_id, updated);
    } else {
      this.notificationGateway.sendNotificationToAll(updated);
    }

    return updated;
  }

  @Patch(':id/read')
  async markAsRead(
    @GetUser('user_id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.logger.log(`Marking notification ${id} as read by user ${userId}`);

    // Validasi kepemilikan
    const notification = await this.notificationService.findOne(id);
    if (notification.user_id !== userId) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.notificationService.markAsRead(id);

    // ✅ KIRIM UPDATE REALTIME
    if (updated.user_id) {
      this.notificationGateway.sendNotificationToUser(updated.user_id, updated);
    }

    return updated;
  }

  @Patch('mark-all-read')
  async markAllAsRead(@GetUser('user_id') userId: number) {
    this.logger.log(`Marking all notifications as read for user ${userId}`);
    await this.notificationService.markAllAsRead(userId);

    return {
      success: true,
      message: 'All notifications marked as read',
      user_id: userId,
    };
  }

  @Get('user/:user_id/recent')
  async getRecentUserNotifications(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours?: number,
  ) {
    this.logger.log(
      `Fetching recent notifications for user ${user_id} (last ${hours}h)`,
    );
    return await this.notificationService.getRecentUserNotifications(
      user_id,
      hours,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Deleting notification ${id}`);
    await this.notificationService.remove(id);

    return {
      success: true,
      message: 'Notification deleted successfully',
      notification_id: id,
    };
  }

  @Delete('cleanup/expired')
  async removeExpired() {
    this.logger.log('Removing expired notifications');
    await this.notificationService.removeExpired();

    return {
      success: true,
      message: 'Expired notifications removed successfully',
    };
  }
}
