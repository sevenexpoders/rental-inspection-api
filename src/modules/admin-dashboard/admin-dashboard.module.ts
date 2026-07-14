import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

import { User } from '../users/entities/user.entity';
import { Role } from '../lookup/entities';
import { Property } from '../properties/entities/property.entity';
import { Inspection } from '../inspections/entities/inspection.entity';
import { TechnicianVerification } from '../technician-verification/entities/technician-verification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Property,
      Inspection,
      TechnicianVerification,
    ]),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}