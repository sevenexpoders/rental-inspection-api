import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Property } from './entities/property.entity';

import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertyParty } from './entities/property-party.entity';

import { Inspection } from '../inspections/entities/inspection.entity';

import { InspectionItem } from '../inspections/entities/inspection-item.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            Property, PropertyParty,  Inspection, InspectionItem
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