import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';

import { CreatePropertyInvitationDto } from './dto/create-property-invitation.dto';
import { EmailUtil } from 'src/common/utils/email.util';
import { PropertyInvitation } from './entities/property-invitation.entity';

@Injectable()
export class PropertyInvitationsService {

    constructor(

        @InjectRepository(PropertyInvitation)
        private readonly propertyInvitationRepo: Repository<PropertyInvitation>,

        @InjectRepository(Property)
        private readonly propertyRepo: Repository<Property>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

    ) { }

    //---------------------------------------
    // Create Property Invitation
    //---------------------------------------

    async create(
        user: any,
        dto: CreatePropertyInvitationDto,
    ) {

        //---------------------------------------
        // Check Property
        //---------------------------------------

        const property = await this.propertyRepo.findOne({
            where: {
                id: dto.propertyId,
            },
        });

        if (!property) {

            throw new BadRequestException(
                'Property not found.',
            );

        }

        //---------------------------------------
        // Prevent duplicate pending invitation
        //---------------------------------------

        const existingInvitation =
            await this.propertyInvitationRepo.findOne({

                where: {

                    property_id: dto.propertyId,

                    email: dto.email,

                    status: 'PENDING',

                },

            });

        if (existingInvitation) {

            throw new BadRequestException(
                'A pending invitation already exists.',
            );

        }

        //---------------------------------------
        // Create Invitation
        //---------------------------------------

        const invitation =
            this.propertyInvitationRepo.create({

                property_id: dto.propertyId,

                email: dto.email,

                role_type: dto.roleType,

                invited_by_user_id: user.userId,

                message: dto.message,

                token: randomUUID(),

                status: 'PENDING',

                expires_at: new Date(
                    Date.now() +
                    7 * 24 * 60 * 60 * 1000,
                ),

            });

        await this.propertyInvitationRepo.save(
            invitation,
        );

        //---------------------------------------
        // Send Email
        //---------------------------------------

        const inviteLink =
            `${process.env.FRONTEND_URL}/accept-property-invitation?token=${invitation.token}`;

        await EmailUtil.sendPropertyInvitation(

            dto.email,

            inviteLink,

            property.owner_name ?? 'Property',

            dto.roleType,

            dto.message,

        );

        //---------------------------------------

        return {

            message:
                'Property invitation sent successfully.',

            data: invitation,

        };

    }

}