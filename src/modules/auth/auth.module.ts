import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { jwtConstants } from './constants/jwt.constants';
import { RefreshController } from './refresh/refresh.controller';
import { RefreshService } from './refresh/refresh.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Role } from '../lookup/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, User, Role]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController, RefreshController],
  providers: [AuthService, RefreshService, JwtStrategy],
})
export class AuthModule {}