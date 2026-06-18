import { BadRequestException, ConflictException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../lookup/entities/role.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Status } from '../../common/enum/status';
import { CryptoUtil } from '../../common/utils/crypto.util';
import * as crypto from 'crypto';
import { UserFcmToken } from './entities/user-fcm-tokens.entity';
import { FirebaseUtil } from '../../common/utils/firebase.util';
import { NotificationsService } from '../notifications/notifications.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Role)
    private roleRepo: Repository<Role>,

    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,

    @InjectRepository(UserFcmToken)
    private userFcmTokenRepo: Repository<UserFcmToken>,

    @InjectRepository(UserFcmToken)
    private notificationRepo: Repository<UserFcmToken>,

    private jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) { }

  // ================= REGISTER =================
  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');

    const encryptedEmail = CryptoUtil.encrypt(email);
    const encryptedPhone = dto.phone ? CryptoUtil.encrypt(dto.phone) : "";
    const existing = await this.userRepo.findOne({
      where: {
        email_hash: emailHash,
      },
    });

    if (existing) {
      throw new ConflictException('Email already exists',);
    }

    const role = await this.roleRepo.findOne({
      where: {
        id: dto.role_id,
        status: Status.ACTIVE
      },
    });

    if (!role) {
      throw new UnauthorizedException('Invalid role',);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10,);

    const user = this.userRepo.create({
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: encryptedEmail,
      password_hash: hashedPassword,
      email_encrypted: encryptedEmail,
      email_hash: emailHash,
      terms_accepted: dto.terms_accepted,
      phone: encryptedPhone,
      terms_accepted_at: dto.terms_accepted
        ? new Date()
        : null,

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
    try {


      const email = dto.email.toLowerCase().trim();

      if (!email) {
        throw new BadRequestException('Email is required');
      }
      const emailHash = crypto.createHash('sha256').update(email).digest('hex');

      const user = await this.userRepo.findOne({
        where: {
          email_hash: emailHash,
          status: Status.ACTIVE,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          password_hash: true,
          status: true,
          terms_accepted: true,
          email_encrypted: true,
          roles: {
            id: true,
            name: true,
            display_name: true,
          },
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
      if (dto.fcm_token && dto.device_id) {

        const existing = await this.userFcmTokenRepo.findOne({
          where: {
            user_id: user.id,
            device_id: dto.device_id,
          },
        });

        if (existing) {
          existing.fcm_token = dto.fcm_token;
          await this.userFcmTokenRepo.save(existing);
        } else {
          await this.userFcmTokenRepo.save({
            user_id: user.id,
            fcm_token: dto.fcm_token,
            device_id: dto.device_id,
            device_name: dto.device_name,
            device_type: dto.device_type,
          });
        }

      }

      const decryptedEmail = CryptoUtil.decrypt(user.email_encrypted,);
      const decryptedPhone = user?.phone ? CryptoUtil.decrypt(user.phone,) : "";
      const payload = {
        sub: user.id,
        email: decryptedEmail,
        roles: user.roles?.map(
          role => role.name,
        ),
      };

      const accessToken = this.jwtService.sign(
        payload,
        {
          expiresIn: '60m',
        },
      );

      const refreshToken =
        this.jwtService.sign(payload, {
          expiresIn: '30d',
        });

      await this.refreshTokenRepo.save({
        token: refreshToken,
        user,
        expires_at: new Date(
          Date.now() +
          30 * 24 * 60 * 60 * 1000,
        ),
      });

      if (dto.fcm_token) {
        const fullName = [
          user.first_name,
          user.last_name,
        ]
          .filter(Boolean)
          .join(' ');
        try {
          const title = 'Login Successful';
          const message = `${fullName}, your account has been successfully signed in.`;
          await this.notificationsService.create(
            user.id,
            title,
            message,
            'LOGIN',
            'AUTH',
          );
          const result = await FirebaseUtil.sendNotification(
            dto.fcm_token,
            title,
            message,
            {
              type: 'LOGIN',
              userId: user.id,
            },
          );
          if (result.invalidToken) {
            await this.userFcmTokenRepo.delete({ fcm_token: result.invalidToken, });
          }
        } catch (error) {
          console.error('FCM Login Notification Error:', error,);
        }
      }
      return {
        message: 'Login successful',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: decryptedEmail,
            phone: decryptedPhone,
            status: user.status,
            role:
              user.roles?.[0]?.name ??
              null,
          },
        },
      }
    } catch (error) {
      console.log("error==>", error);
      throw error;
    }
  }



  async refresh(refreshToken: string,) {
    const OldPayload = this.jwtService.verify(refreshToken);

    const storedToken =
      await this.refreshTokenRepo.findOne({
        where: {
          token: refreshToken,
          user: {
            id: OldPayload.sub,
            status: Status.ACTIVE
          },
        },
        relations: {
          user: {
            roles: true,
          },
        },
      });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token',);
    }

    if (
      storedToken.expires_at <
      new Date()
    ) {
      throw new UnauthorizedException('Refresh token expired',);
    }

    const user = storedToken.user;

    const decryptedEmail =
      CryptoUtil.decrypt(
        user.email_encrypted,
      );

    const payload = {
      sub: user.id,
      email: decryptedEmail,
      roles: user.roles.map(
        r => r.name,
      ),
    };

    const accessToken =
      this.jwtService.sign(payload, {
        expiresIn: '15m',
      });

    return {
      accessToken,
    };
  }

  async logout(refreshToken: string,) {
    const OldPayload = this.jwtService.verify(refreshToken);
    await this.refreshTokenRepo.delete({
      token: refreshToken,
      user: {
        id: OldPayload.sub,
        status: Status.ACTIVE
      },
    });
    return {
      message: 'logout successfully',
    };
  }


}