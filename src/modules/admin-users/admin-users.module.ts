import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities';
import { Role } from '../lookup/entities';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { Inspection } from '../inspections/entities';
import { Property, PropertyParty } from '../properties/entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Role,
            Property,
            PropertyParty,
            Inspection
        ]),
    ],
    controllers: [
        AdminUsersController,
    ],
    providers: [
        AdminUsersService,
    ],
})
export class AdminUsersModule { }