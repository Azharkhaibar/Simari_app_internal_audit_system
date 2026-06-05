// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from 'src/users/dto/register-user.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RequestUser } from './dto/get-auth-response.dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('login')
  async login(@Body() body: { userID: string; password: string }) {
    const result = await this.authService.login(body.userID, body.password);

    // Kirim notifikasi login secara asinkron agar tidak memblokir respon login
    try {
      const auth = await this.authService.findOneByUserID(body.userID);
      if (auth && auth.user) {
        // Buat notifikasi login untuk user tersebut
        await this.notificationService.create({
          user_id: auth.user.user_id,
          type: NotificationType.SUCCESS,
          title: 'Login Berhasil',
          message: `Selamat datang kembali, ${auth.userID}!`,
          category: 'security',
          metadata: {
            activity_type: 'login',
            action: 'login',
            user_id: auth.user.user_id,
            username: auth.userID,
            login_time: new Date().toISOString(),
          },
        });

        // Buat notifikasi broadcast untuk admin/user lain
        await this.notificationService.create({
          user_id: null, // Broadcast
          type: NotificationType.SUCCESS,
          title: 'User Login',
          message: `User ${auth.userID} telah masuk ke dalam sistem.`,
          category: 'system',
          metadata: {
            activity_type: 'user_status',
            action: 'login',
            user_id: auth.user.user_id,
            username: auth.userID,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (err) {
      console.error('Gagal membuat notifikasi login di backend:', err);
    }

    return result;
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.usersService.register(dto);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Register failed';
      throw new BadRequestException(message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request & { user: RequestUser }) {
    try {
      const auth = await this.authService.findOneByUserID(req.user.userID);
      if (auth && auth.user) {
        // Buat notifikasi logout untuk user tersebut
        await this.notificationService.create({
          user_id: auth.user.user_id,
          type: NotificationType.INFO,
          title: 'Logout Berhasil',
          message: 'Anda telah berhasil keluar dari sistem.',
          category: 'security',
          metadata: {
            activity_type: 'logout',
            action: 'logout',
            user_id: auth.user.user_id,
            username: auth.userID,
            logout_time: new Date().toISOString(),
          },
        });

        // Buat notifikasi broadcast untuk admin/user lain
        await this.notificationService.create({
          user_id: null, // Broadcast
          type: NotificationType.INFO,
          title: 'User Logout',
          message: `User ${auth.userID} telah keluar dari sistem.`,
          category: 'system',
          metadata: {
            activity_type: 'user_status',
            action: 'logout',
            user_id: auth.user.user_id,
            username: auth.userID,
            timestamp: new Date().toISOString(),
          },
        });
      }
      return { success: true, message: 'Logout successful' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      throw new BadRequestException(message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request & { user: RequestUser }) {
    const auth = await this.authService.findOneByUserID(req.user.userID);

    if (!auth) {
      throw new BadRequestException('User not found');
    }

    return {
      user_id: auth.user.user_id,
      userID: auth.userID,
      role: auth.user.role,
      gender: auth.user.gender,
      created_at: auth.user.created_at,
      updated_at: auth.user.updated_at,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @Req() req: Request & { user: RequestUser },
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    try {
      return await this.usersService.changePassword(
        req.user.userID,
        body.currentPassword,
        body.newPassword,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Password change failed';
      throw new BadRequestException(message);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { userID: string }) {
    try {
      return await this.usersService.requestPasswordReset(body.userID);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Password reset failed';
      throw new BadRequestException(message);
    }
  }
}

