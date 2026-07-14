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

import { AdminPropertiesService } from './admin-properties.service';
import { GetAdminPropertiesDto } from './dto/get-admin-properties.dto';

@Controller('admin/properties')
@UseGuards(
    JwtAuthGuard,
    new RolesGuard([ROLES.SUPER_ADMIN]),
)
export class AdminPropertiesController {

    constructor(
        private readonly adminPropertiesService: AdminPropertiesService,
    ) { }

    @Get()
    async getProperties(
        @Query() query: GetAdminPropertiesDto,
    ) {
        return this.adminPropertiesService.getProperties(query);
    }

    @Get(':id')
    async getPropertyById(
        @Param('id') id: string,
    ) {
        return this.adminPropertiesService.getPropertyById(id);
    }

}