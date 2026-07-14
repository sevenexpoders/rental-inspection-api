import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inspection } from '../inspections/entities/inspection.entity';

import { AdminReportsController } from './admin-reports.controller';
import { AdminReportsService } from './admin-reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
    ]),
  ],
  controllers: [
    AdminReportsController,
  ],
  providers: [
    AdminReportsService,
  ],
})
export class AdminReportsModule {}