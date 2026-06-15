import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inspection } from './entities/inspection.entity';

import { Property } from '../properties/entities/property.entity';
import { Lease } from '../leases/entities/lease.entity';

import { InspectionsController } from './inspections.controller';
import { InspectionsService } from './inspections.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
      Property,
      Lease,
    ]),
  ],
  controllers: [
    InspectionsController,
  ],
  providers: [
    InspectionsService,
  ],
  exports: [
    InspectionsService,
  ],
})
export class InspectionsModule {}