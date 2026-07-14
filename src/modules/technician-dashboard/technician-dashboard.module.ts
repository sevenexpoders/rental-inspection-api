import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TechnicianDashboardController } from './technician-dashboard.controller';
import { TechnicianDashboardService } from './technician-dashboard.service';

import { Property } from '../properties/entities/property.entity';
import { PropertyParty } from '../property-parties/entities/property-party.entity';
import { Inspection } from '../inspections/entities/inspection.entity';
import { TechnicianVerification } from '../technician-verification/entities/technician-verification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      PropertyParty,
      Inspection,
      TechnicianVerification
    ]),
  ],
  controllers: [TechnicianDashboardController],
  providers: [TechnicianDashboardService],
})
export class TechnicianDashboardModule {}