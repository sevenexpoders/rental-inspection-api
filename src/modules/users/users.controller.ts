import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // PROFILE
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.userId);
  }

  // UPDATE PROFILE
  @Patch('me')
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  // CHANGE PASSWORD
  @Patch('change-password')
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.userId, dto);
  }

  // ADMIN - ALL USERS
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // DELETE USER
  @Delete(':id')
  deleteUser(@CurrentUser() user: any) {
    return this.usersService.deleteUser(user.userId);
  }
}