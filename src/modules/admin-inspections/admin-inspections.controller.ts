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

import { AdminInspectionsService } from './admin-inspections.service';
import { GetAdminInspectionsDto } from './dto/get-admin-inspections.dto';

@Controller('admin/inspections')
@UseGuards(
    JwtAuthGuard,
    new RolesGuard([ROLES.SUPER_ADMIN]),
)
export class AdminInspectionsController {

    constructor(
        private readonly adminInspectionsService: AdminInspectionsService,
    ) { }

    @Get()
    async getInspections(
        @Query() query: GetAdminInspectionsDto,
    ) {
        return this.adminInspectionsService.getInspections(query);
    }

    @Get(':id')
    async getInspectionById(
        @Param('id') id: string,
    ) {
        return this.adminInspectionsService.getInspectionById(id);
    }

}