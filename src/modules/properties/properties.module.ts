import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Property } from './entities/property.entity';

import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertyParty } from './entities/property-party.entity';
import { Lease } from './entities/lease.entity';
import { Inspection } from '../inspections/entities/inspection.entity';
import { InspectionSection } from '../inspections/entities/inspection-section.entity';
import { InspectionItem } from '../inspections/entities/inspection-item.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            Property, PropertyParty, Lease, Inspection, InspectionSection, InspectionItem
        ]),
    ],
    controllers: [
        PropertiesController,
    ],
    providers: [
        PropertiesService,
    ],
})
export class PropertiesModule { }