import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants/jwt.constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { UserFcmToken, UserOtp, RefreshToken } from './entities';
import { User } from '../users/entities';
import { Role } from '../lookup/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, User, Role, UserFcmToken, UserOtp]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }