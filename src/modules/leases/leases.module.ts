import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lease } from './entities/lease.entity';
import { Property } from '../properties/entities/property.entity';

import { LeasesController } from './leases.controller';
import { LeasesService } from './leases.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lease,
      Property,
    ]),
  ],
  controllers: [
    LeasesController,
  ],
  providers: [
    LeasesService,
  ],
  exports: [
    LeasesService,
  ],
})
export class LeasesModule {}