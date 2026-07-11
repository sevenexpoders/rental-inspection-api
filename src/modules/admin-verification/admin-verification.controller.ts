import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards';
import { ROLES } from '../../common/constants/roles.constant';

import { AdminVerificationService } from './admin-verification.service';
import { GetVerificationsDto } from './dto/get-verifications.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RejectVerificationDto } from './dto/reject-verification.dto';

@Controller('admin/verifications')
@UseGuards(
    JwtAuthGuard,
    new RolesGuard([ROLES.SUPER_ADMIN]),
)
export class AdminVerificationController {
    constructor(
        private readonly adminVerificationService: AdminVerificationService,
    ) { }

    @Get()
    async getVerifications(
        @Query() query: GetVerificationsDto,
    ) {
        return this.adminVerificationService.getVerifications(query);
    }

    @Get('statistics')
    async getVerificationStatistics() {
        return await this.adminVerificationService.getVerificationStatistics();
    }

    @Get(':verificationId')
    async getVerificationById(
        @Param('verificationId') verificationId: string,
    ) {
        return this.adminVerificationService.getVerificationById(
            verificationId,
        );
    }

    @Patch(':verificationId/approve')
    async approveVerification(
        @Param('verificationId') verificationId: string,
        @CurrentUser() user: any,
    ) {
        return await this.adminVerificationService.approveVerification(
            verificationId,
            user.userId,
        );
    }

    @Patch(':verificationId/reject')
    async rejectVerification(
        @Param('verificationId') verificationId: string,
        @Body() dto: RejectVerificationDto,
        @CurrentUser() user: any,
    ) {
        return await this.adminVerificationService.rejectVerification(
            verificationId,
            dto,
            user.userId,
        );
    }
}