import { ConflictException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { ApiResponse } from 'src/common/utils/api-response';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,

    private jwtService: JwtService,
  ) { }

  // ================= REGISTER =================
  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    const role = await this.roleRepo.findOne({
      where: {
        name: dto.role,
      },
    });

    if (!role) {
      throw new UnauthorizedException(
        'Invalid role',
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      10,
    );

    const user = this.userRepo.create({
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      password_hash: hashedPassword,
      roles: [role],
    });

    await this.userRepo.save(user);

    return {
      message:
        'User registered successfully',
    };
  }

  // ================= LOGIN =================
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: {
        email: dto.email,
      },
      relations: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const isMatch = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map(
        role => role.name,
      ),
    };

    const accessToken = this.jwtService.sign(
      payload,
      {
        expiresIn: '15m',
      },
    );

    const refreshToken =
      this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

    await this.refreshTokenRepo.save({
      token: refreshToken,
      user,
      expires_at: new Date(
        Date.now() +
        7 * 24 * 60 * 60 * 1000,
      ),
    });

    return {
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          role:
            user.roles?.[0]?.name ??
            null,
        },
      },
    }
  }
}