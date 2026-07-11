import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';

import { CreatePropertyInvitationDto } from './dto/create-property-invitation.dto';
import { EmailUtil } from 'src/common/utils/email.util';
import { PropertyInvitation } from './entities/property-invitation.entity';
import { AcceptPropertyInvitationDto } from './dto/accept-property-invitation.dto';
import { PropertyParty } from '../property-parties/entities/property-party.entity';
import { Role } from '../lookup/entities';
import { CryptoUtil } from 'src/common/utils';


@Injectable()
export class PropertyInvitationsService {

    constructor(

        @InjectRepository(PropertyInvitation)
        private readonly propertyInvitationRepo: Repository<PropertyInvitation>,

        @InjectRepository(Property)
        private readonly propertyRepo: Repository<Property>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(PropertyParty)
        private readonly propertyPartyRepo: Repository<PropertyParty>,

        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,

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
        // Check Role
        //---------------------------------------

        const role = await this.roleRepo.findOne({
            where: {
                id: dto.roleId,
            },
        });

        if (!role) {

            throw new BadRequestException(
                'Role not found.',
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

                role_id: role.id,

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

        const propertyName = property
            ? `${property.house_unit_no}, ${property.address}`
            : 'Property';

        // Send email in background
        EmailUtil.sendPropertyInvitation(
            dto.email,
            inviteLink,
            propertyName,
            role.display_name ?? role.name,
            dto.message,
        ).catch((error) => {
            console.error(
                'Property invitation email failed:',
                error,
            );
        });

        //---------------------------------------

        return {

            message:
                'Property invitation sent successfully.',

            data: invitation,

        };

    }

    async validate(
        token: string,
    ) {

        const invitation =
            await this.propertyInvitationRepo.findOne({

                where: {

                    token,

                    status: 'PENDING',

                },

                relations: {

                    role: true,

                },

            });

        if (!invitation) {

            throw new BadRequestException(
                'Invalid invitation.',
            );

        }

        if (
            invitation.expires_at < new Date()
        ) {

            throw new BadRequestException(
                'Invitation has expired.',
            );

        }

        const property =
            await this.propertyRepo.findOne({

                where: {

                    id: invitation.property_id,

                },

            });

        return {

            valid: true,

            data: {

                email: invitation.email,

                roleId: invitation.role_id,

                roleName:
                    invitation.role.display_name ??
                    invitation.role.name,

                property,

                expiresAt: invitation.expires_at,

            },

        };

    }

    async accept(
        user: any,
        dto: AcceptPropertyInvitationDto,
    ) {

        const invitation =
            await this.propertyInvitationRepo.findOne({

                where: {

                    token: dto.token,

                    status: 'PENDING',

                },

                relations: {

                    role: true,

                },

            });

        if (!invitation) {

            throw new BadRequestException(
                'Invalid invitation.',
            );

        }

        if (invitation.expires_at < new Date()) {

            throw new BadRequestException(
                'Invitation has expired.',
            );

        }

        //---------------------------------------
        // Find Property
        //---------------------------------------

        const property =
            await this.propertyRepo.findOne({

                where: {

                    id: invitation.property_id,

                },

            });

        if (!property) {

            throw new BadRequestException(
                'Property not found.',
            );

        }

        //---------------------------------------
        // Find User
        //---------------------------------------

        const acceptedUser =
            await this.userRepo.findOne({

                where: {

                    id: user.userId,

                },

            });

        if (!acceptedUser) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        //---------------------------------------
        // Already Added?
        //---------------------------------------

        const existingParty =
            await this.propertyPartyRepo.findOne({

                where: {

                    property: {

                        id: property.id,

                    },

                    user: {

                        id: acceptedUser.id,

                    },

                },

                relations: {

                    property: true,

                    user: true,

                },

            });

        if (existingParty) {

            throw new BadRequestException(
                'You already have access to this property.',
            );

        }

        //---------------------------------------
        // Create Property Party
        //---------------------------------------

        const propertyParty =
            this.propertyPartyRepo.create({

                property,

                user: acceptedUser,

                role_type: invitation.role.name,

                is_active: true,

            });

        await this.propertyPartyRepo.save(
            propertyParty,
        );

        //---------------------------------------
        // Update Invitation
        //---------------------------------------

        invitation.status = 'ACCEPTED';

        invitation.accepted_by_user_id =
            acceptedUser.id;

        invitation.accepted_at =
            new Date();

        await this.propertyInvitationRepo.save(
            invitation,
        );

        return {

            message:
                'Property invitation accepted successfully.',

            data: propertyParty,

        };

    }

    async findAll(user: any) {

        const invitations =
            await this.propertyInvitationRepo.find({

                where: {

                    invited_by_user_id: user.userId,

                },

                order: {

                    created_at: 'DESC',

                },

            });

        return {

            message: 'Property invitations fetched successfully.',

            data: invitations,

        };

    }

    async findOne(
        user: any,
        id: string,
    ) {

        const invitation =
            await this.propertyInvitationRepo.findOne({

                where: {

                    id,

                    invited_by_user_id: user.userId,

                },

            });

        if (!invitation) {

            throw new NotFoundException(
                'Invitation not found.',
            );

        }

        return {

            data: invitation,

        };

    }

    async cancel(
        user: any,
        id: string,
    ) {

        const invitation =
            await this.propertyInvitationRepo.findOne({

                where: {

                    id,

                    // invited_by_user_id: user.userId,

                },

            });

        if (!invitation) {

            throw new BadRequestException(
                'Property invitation not found.',
            );

        }

        if (invitation.status !== 'PENDING') {

            throw new BadRequestException(
                'Only pending invitations can be cancelled.',
            );

        }

        invitation.status = 'CANCELLED';

        await this.propertyInvitationRepo.save(
            invitation,
        );

        return {

            message:
                'Property invitation cancelled successfully.',

        };

    }

    async resend(
        user: any,
        id: string,
    ) {

        const invitation =
            await this.propertyInvitationRepo.findOne({

                where: {

                    id,

                    invited_by_user_id: user.userId,

                },

                relations: {

                    role: true,

                },

            });

        if (!invitation) {

            throw new BadRequestException(
                'Property invitation not found.',
            );

        }

        if (invitation.status !== 'PENDING') {

            throw new BadRequestException(
                'Only pending invitations can be resent.',
            );

        }

        //---------------------------------------
        // Refresh Token & Expiry
        //---------------------------------------

        invitation.token = randomUUID();

        invitation.expires_at = new Date(
            Date.now() +
            7 * 24 * 60 * 60 * 1000,
        );

        await this.propertyInvitationRepo.save(
            invitation,
        );

        //---------------------------------------
        // Property Details
        //---------------------------------------

        const property =
            await this.propertyRepo.findOne({

                where: {

                    id: invitation.property_id,

                },

            });

        //---------------------------------------
        // Send Email
        //---------------------------------------

        const inviteLink =
            `${process.env.FRONTEND_URL}/accept-property-invitation?token=${invitation.token}`;

        const propertyName = property
            ? `${property.house_unit_no}, ${property.address}`
            : 'Property';


        // Send email in background
        EmailUtil.sendPropertyInvitation(
            invitation.email,
            inviteLink,
            propertyName,
            invitation.role.display_name ?? invitation.role.name,
            invitation.message,
        ).catch((error) => {
            console.error(
                'Property invitation email failed:',
                error,
            );
        });

        return {

            message:
                'Property invitation resent successfully.',

        };

    }

    async received(
        user: any,
    ) {

        //---------------------------------------
        // Find Logged-in User
        //---------------------------------------

        const dbUser =
            await this.userRepo.findOne({

                where: {

                    id: user.userId,

                },

            });

        if (!dbUser) {

            throw new BadRequestException(
                'User not found.',
            );

        }

        //---------------------------------------
        // Get Invitations
        //---------------------------------------
        const decryptedEmail =
            CryptoUtil.decrypt(
                dbUser.email_encrypted,
            );
        const invitations =
            await this.propertyInvitationRepo.find({

                where: {

                    email: decryptedEmail,

                    status: 'PENDING',

                },

                relations: {

                    role: true,

                },

                order: {

                    created_at: 'DESC',

                },

            });

        //---------------------------------------
        // Load Property Details
        //---------------------------------------

        const data = await Promise.all(

            invitations.map(async (invitation) => {

                const property =
                    await this.propertyRepo.findOne({

                        where: {

                            id: invitation.property_id,

                        },

                    });

                return {

                    id: invitation.id,

                    token: invitation.token,

                    email: invitation.email,

                    roleId: invitation.role_id,

                    roleName:
                        invitation.role.display_name ??
                        invitation.role.name,

                    property,

                    message: invitation.message,

                    status: invitation.status,

                    expiresAt: invitation.expires_at,

                    createdAt: invitation.created_at,

                };

            }),

        );

        return {

            message:
                'Received property invitations fetched successfully.',

            data,

        };

    }
}