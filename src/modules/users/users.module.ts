import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, Role } from './entities';
import { Property } from '../properties/entities';
import { Inspection, InspectionItem } from '../inspections/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Property, Inspection, InspectionItem])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }