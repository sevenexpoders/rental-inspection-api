import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropertyParty } from './entities/property-party.entity';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';

import { PropertyPartiesController } from './property-parties.controller';
import { PropertyPartiesService } from './property-parties.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyParty,
      Property,
      User,
    ]),
  ],
  controllers: [
    PropertyPartiesController,
  ],
  providers: [
    PropertyPartiesService,
  ],
  exports: [
    PropertyPartiesService,
  ],
})
export class PropertyPartiesModule {}