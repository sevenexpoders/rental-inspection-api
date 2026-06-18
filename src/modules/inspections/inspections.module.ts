import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inspection } from './entities/inspection.entity';
import { Property } from '../properties/entities/property.entity';
import { InspectionsController } from './inspections.controller';
import { InspectionsService } from './inspections.service';
import { InspectionItem } from './entities/inspection-item.entity';
import { InspectionItemMedia } from './entities/inspection-media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
      Property,
      InspectionItem,
      InspectionItemMedia
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