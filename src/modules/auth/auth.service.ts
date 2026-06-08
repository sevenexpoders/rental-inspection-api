import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService
  ) {}

  // ================= REGISTER =================
  async register(dto: any) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      ...dto,
      password_hash: hashedPassword,
    });

    await this.userRepo.save(user);

    return {
      message: 'User registered successfully',
    };
  }

  // ================= LOGIN =================
  async login(dto: any) {
  const user = await this.userRepo.findOne({
    where: { email: dto.email },
    relations: { roles: true },
  });

  if (!user) throw new UnauthorizedException('Invalid credentials');

  const isMatch = await bcrypt.compare(dto.password, user.password_hash);
  if (!isMatch) throw new UnauthorizedException('Invalid credentials');

  const payload = {
    sub: user.id,
    email: user.email,
    roles: user.roles?.map(r => r.name),
  };

  const accessToken = this.jwtService.sign(payload, {
    expiresIn: '15m',
  });

  const refreshToken = this.jwtService.sign(payload, {
    expiresIn: '7d',
  });

  // STORE REFRESH TOKEN IN DB
  await this.refreshTokenRepo.save({
    token: refreshToken,
    user: user,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user,
  };
}
}