import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TechnicianReportsController } from './technician-reports.controller';
import { TechnicianReportsService } from './technician-reports.service';

import { Inspection } from '../inspections/entities/inspection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
    ]),
  ],
  controllers: [TechnicianReportsController],
  providers: [TechnicianReportsService],
})
export class TechnicianReportsModule {}