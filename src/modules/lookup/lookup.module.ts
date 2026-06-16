import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LookupController } from './lookup.controller';
import { LookupService } from './lookup.service';

import { State } from './entities/state.entity';
import { City } from './entities/city.entity';
import { PropertyType } from './entities/property-type.entity';
import { Role } from './entities/role.entity';
import { InspectionType } from './entities/inspection_types.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      State,
      City,
      PropertyType,
      Role,
      InspectionType
    ]),
  ],
  controllers: [LookupController],
  providers: [LookupService],
  exports: [LookupService],
})
export class LookupModule {}