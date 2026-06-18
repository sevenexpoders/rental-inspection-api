import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { Status } from 'src/common/enum/status';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { }

  // GET PROFILE
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId, status: Status.ACTIVE, deleted_at: IsNull() },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        phone: true,
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

    if (!user) throw new NotFoundException('User not found');

    // delete (user as any).password_hash;
    const decryptedEmail = CryptoUtil.decrypt(user.email_encrypted,);
    const decryptedPhone = user?.phone ? CryptoUtil.decrypt(user.phone,) : "";
    return {
      ...user,
      email: decryptedEmail,
      phone: decryptedPhone,
    };
  }

  // UPDATE PROFILE
  async updateProfile(userId: string, dto: UpdateUserDto) {
    try {
      const updateData: any = { ...dto };
      if (dto.phone) {
        updateData.phone = CryptoUtil.encrypt(dto.phone);
      }

      await this.userRepo.update(userId, updateData);
      return await this.getProfile(userId);
    } catch (error) {
      console.log("error==>", error);
      throw error;
    }

  }

  // CHANGE PASSWORD
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId, status: Status.ACTIVE, deleted_at: IsNull() },
    });

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Current password incorrect');
    }

    user.password_hash = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepo.save(user);

    return { message: 'Password updated successfully' };
  }

  // GET ALL USERS (ADMIN)
  async findAll() {
    return this.userRepo.find({
      where: { status: Status.ACTIVE, deleted_at: IsNull() },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        status: true,
      },
    });
  }

  // DELETE USER (SOFT STYLE)
  async deleteUser(userId: string) {
    await this.userRepo.update(userId, {
      status: Status.DELETED,
    });

    return { message: 'User deleted' };
  }
}