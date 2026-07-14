import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ROLES } from '../../common/constants/roles.constant';

import { TechnicianReportsService } from './technician-reports.service';
import { GetTechnicianReportsDto } from './dto/get-technician-reports.dto';

@Controller('technician/reports')
@UseGuards(
    JwtAuthGuard,
    new RolesGuard([ROLES.TECHNICIAN]),
)
export class TechnicianReportsController {
    constructor(
        private readonly technicianReportsService: TechnicianReportsService,
    ) { }

    @Get()
    async getReports(
        @CurrentUser() user: any,
        @Query() dto: GetTechnicianReportsDto,
    ) {
        return this.technicianReportsService.getReports(
            user.userId,
            dto,
        );
    }

    @Get(':inspectionId')
    async getReportById(
        @Param('inspectionId') inspectionId: string,
        @CurrentUser() user: any,
    ) {
        return this.technicianReportsService.getReportById(
            inspectionId,
            user.userId,
        );
    }
}