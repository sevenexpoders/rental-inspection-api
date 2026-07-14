import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    Patch,
    Body,
    Delete,
    HttpCode,
    HttpStatus,
    Req
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards';
import { ROLES } from '../../common/constants/roles.constant';

import { AdminUsersService } from './admin-users.service';
import { GetAdminUsersDto } from './dto/get-admin-users.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Controller('admin/users')
@UseGuards(
    JwtAuthGuard,
    new RolesGuard([ROLES.SUPER_ADMIN]),
)
export class AdminUsersController {
    constructor(
        private readonly adminUsersService: AdminUsersService,
    ) { }

    @Get()
    async getUsers(
        @Query() query: GetAdminUsersDto,
    ) {
        return await this.adminUsersService.getUsers(query);
    }

    @Get(':userId')
    async getUserById(
        @Param('userId') userId: string,
    ) {
        return await this.adminUsersService.getUserById(
            userId,
        );
    }

    @Patch(':id/status')
    async updateUserStatus(
        @Param('id') id: string,
        @Body() dto: UpdateUserStatusDto,
    ) {
        return this.adminUsersService.updateUserStatus(
            id,
            dto,
        );
    }

    @Delete(':id')
    async deleteUser(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        return this.adminUsersService.deleteUser(
            id,
            req.user.userId,
        );
    }
}