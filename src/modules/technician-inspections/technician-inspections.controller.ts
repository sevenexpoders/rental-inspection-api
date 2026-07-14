import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards';
import { ROLES } from '../../common/constants/roles.constant';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { TechnicianInspectionsService } from './technician-inspections.service';
import { GetTechnicianInspectionsDto } from './dto/get-technician-inspections.dto';

@Controller('technician/inspections')
@UseGuards(
    JwtAuthGuard,
    new RolesGuard([ROLES.TECHNICIAN]),
)
export class TechnicianInspectionsController {
    constructor(
        private readonly technicianInspectionsService: TechnicianInspectionsService,
    ) { }

    @Get()
    async getInspections(
        @CurrentUser() user: any,
        @Query() dto: GetTechnicianInspectionsDto,
    ) {
        return this.technicianInspectionsService.getInspections(
            user.userId,
            dto,
        );
    }

    @Get(':inspectionId')
    async getInspectionById(
        @Param('inspectionId') inspectionId: string,
        @CurrentUser() user: any,
    ) {
        return this.technicianInspectionsService.getInspectionById(
            inspectionId,
            user.userId,
        );
    }
}