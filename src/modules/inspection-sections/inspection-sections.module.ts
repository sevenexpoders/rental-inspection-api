import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Inspection } from '../inspections/entities/inspection.entity';
import { InspectionSection } from './entities/inspection-section.entity';

import { InspectionSectionsController } from './inspection-sections.controller';
import { InspectionSectionsService } from './inspection-sections.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
      InspectionSection,
    ]),
  ],
  controllers: [
    InspectionSectionsController,
  ],
  providers: [
    InspectionSectionsService,
  ],
  exports: [
    InspectionSectionsService,
  ],
})
export class InspectionSectionsModule {}