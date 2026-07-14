import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards';
import { ROLES } from '../../common/constants/roles.constant';

import { AdminReportsService } from './admin-reports.service';
import { GetAdminReportsDto } from './dto/get-admin-reports.dto';

@Controller('admin/reports')
@UseGuards(
    JwtAuthGuard,
    new RolesGuard([ROLES.SUPER_ADMIN]),
)
export class AdminReportsController {

    constructor(
        private readonly adminReportsService: AdminReportsService,
    ) { }

    @Get()
    async getReports(
        @Query() dto: GetAdminReportsDto,
    ) {
        return this.adminReportsService.getReports(dto);
    }

    @Get(':id')
    async getReportById(
        @Param('id') id: string,
    ) {
        return this.adminReportsService.getReportById(id);
    }

}