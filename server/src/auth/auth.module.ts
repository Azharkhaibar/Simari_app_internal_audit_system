import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtStrategy } from './jwt_strategy';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

import { Auth } from './entities/auth.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    forwardRef(() => NotificationModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRE') || '24h',
        },
      }),
    }),

    TypeOrmModule.forFeature([Auth, User]),
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy, JwtAuthGuard],

  exports: [JwtAuthGuard, PassportModule, JwtModule],
})
export class AuthModule {}

