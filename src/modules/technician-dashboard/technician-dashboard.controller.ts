import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards';
import { ROLES } from '../../common/constants/roles.constant';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { TechnicianDashboardService } from './technician-dashboard.service';

@Controller('technician/dashboard')
@UseGuards(
    JwtAuthGuard,
    new RolesGuard([ROLES.TECHNICIAN]),
)
export class TechnicianDashboardController {
    constructor(
        private readonly technicianDashboardService: TechnicianDashboardService,
    ) { }

    @Get()
    async getDashboard(
        @CurrentUser() user: any,
    ) {
        return this.technicianDashboardService.getDashboard(
            user.userId,
        );
    }
    @Get('recent-properties')
    @UseGuards(
        JwtAuthGuard,
        new RolesGuard([ROLES.TECHNICIAN]),
    )
    async getRecentProperties(
        @CurrentUser() user: any,
    ) {
        return this.technicianDashboardService.getRecentProperties(
            user.userId,
        );
    }

    @Get('recent-activities')
    async getRecentActivities(
        @CurrentUser() user: any,
    ) {
        return this.technicianDashboardService.getRecentActivities(
            user.userId,
        );
    }
}