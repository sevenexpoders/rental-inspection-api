import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards';
import { ROLES } from '../../common/constants/roles.constant';

import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin/dashboard')
@UseGuards(
  JwtAuthGuard,
  new RolesGuard([ROLES.SUPER_ADMIN]),
)
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  @Get()
  async getDashboard() {
    return this.adminDashboardService.getDashboard();
  }
}