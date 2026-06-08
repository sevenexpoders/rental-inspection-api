import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class RefreshService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private jwtService: JwtService,
  ) {}

  async refreshToken(token: string) {
    // 1. Find refresh token in DB
    const storedToken = await this.refreshTokenRepo.findOne({
      where: { token },
      relations: { user: { roles: true } },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revoked) {
      throw new UnauthorizedException('Token revoked');
    }

    if (storedToken.expires_at < new Date()) {
      throw new UnauthorizedException('Token expired');
    }

    const user = storedToken.user;

    // 2. Create new payload
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map((r) => r.name),
    };

    // 3. Generate new tokens
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // 4. TOKEN ROTATION (VERY IMPORTANT)
    storedToken.revoked = true;
    await this.refreshTokenRepo.save(storedToken);

    await this.refreshTokenRepo.save({
      token: newRefreshToken,
      user,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}