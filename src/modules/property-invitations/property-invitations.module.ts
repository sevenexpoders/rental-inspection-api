import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyInvitation } from '../../modules/property-invitations/entities/property-invitation.entity';
import { PropertyInvitationsController } from '../../modules/property-invitations/property-invitations.controller';
import { PropertyInvitationsService } from '../../modules/property-invitations/property-invitations.service';
import { Property } from 'src/modules/properties/entities';
import { User } from 'src/modules/users/entities'; 
 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyInvitation,
      Property,
      User,
    ]),
  ],
  controllers: [
    PropertyInvitationsController,
  ],
  providers: [
    PropertyInvitationsService,
  ],
  exports: [
    PropertyInvitationsService,
  ],
})
export class PropertyInvitationsModule {}