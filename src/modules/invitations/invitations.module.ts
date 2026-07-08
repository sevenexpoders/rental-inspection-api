import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Invitation } from './entities/invitation.entity';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Role } from '../lookup/entities';
import { User } from '../users/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invitation,
      Role,
      User
    ]),
  ],
  controllers: [
    InvitationsController,
  ],
  providers: [
    InvitationsService,
  ],
  exports: [
    InvitationsService,
  ],
})
export class InvitationsModule {}