import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TechnicianInspectionsController } from './technician-inspections.controller';
import { TechnicianInspectionsService } from './technician-inspections.service';

import { Inspection } from '../inspections/entities/inspection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
    ]),
  ],
  controllers: [TechnicianInspectionsController],
  providers: [TechnicianInspectionsService],
})
export class TechnicianInspectionsModule {}