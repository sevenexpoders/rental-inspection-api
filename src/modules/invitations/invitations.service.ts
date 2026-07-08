import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import {
    InjectRepository,
} from '@nestjs/typeorm';

import {
    DataSource,
    Repository,
} from 'typeorm';

import {
    randomUUID,
} from 'crypto';

import {
    Invitation,
    InvitationStatus,
} from './entities/invitation.entity';

import { Role } from '../lookup/entities/role.entity';

import { CreateInvitationDto } from './dto/create-invitation.dto';
import { EmailUtil } from 'src/common/utils/email.util';
import { User } from '../users/entities';
import { CryptoUtil, HashUtil, PasswordUtil } from 'src/common/utils';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Injectable()
export class InvitationsService {

    constructor(

        @InjectRepository(Invitation)
        private readonly invitationRepo: Repository<Invitation>,

        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        private readonly dataSource: DataSource,

    ) { }

    //---------------------------------------
    // Allowed Roles
    //---------------------------------------

    async getAllowedRoles(user: any) {

        const role = user.roles[0];

        let allowed: string[] = [];

        if (role === 'landlord') {

            allowed = [
                'landlord',
                'property_manager',
                'technician',
            ];

        }

        if (role === 'property_manager') {

            allowed = [
                'landlord',
                'technician',
            ];

        }

        if (role === 'technician') {

            allowed = [];

        }

        return this.roleRepo.find({
            where: allowed.map(name => ({ name })),
            order: {
                order_index: 'ASC',
            },
        });

    }

    //---------------------------------------
    // Create Invitation
    //---------------------------------------

    async create(
        user: any,
        dto: CreateInvitationDto,
    ) {

        const role = user.roles[0];

        const invitedRole =
            await this.roleRepo.findOne({
                where: {
                    id: dto.roleId,
                },
            });

        if (!invitedRole) {

            throw new BadRequestException(
                'Role not found',
            );

        }

        //----------------------------------
        // Permission Check
        //----------------------------------

        if (
            role === 'property_manager' &&
            invitedRole.name === 'property_manager'
        ) {

            throw new BadRequestException(
                'Property Manager cannot invite another Property Manager',
            );

        }

        if (
            role === 'technician'
        ) {

            throw new BadRequestException(
                'Technician cannot invite users',
            );

        }

        //----------------------------------

        const invitation =
            this.invitationRepo.create({

                email: dto.email,

                invited_role_id:
                    invitedRole.id,

                invited_by_user_id:
                    user.userId,

                message:
                    dto.message,

                token:
                    randomUUID(),

                status:
                    InvitationStatus.PENDING,

                expires_at:
                    new Date(
                        Date.now() +
                        7 * 24 * 60 * 60 * 1000,
                    ),

            });

        await this.invitationRepo.save(
            invitation,
        );

        const inviteLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitation.token}`;

        await EmailUtil.sendInvitation(

            dto.email,

            inviteLink,

            invitedRole.display_name ?? invitedRole.name,

            dto.message,

        );

        return {

            message:
                'Invitation sent successfully.',

            data: invitation,

        };

    }

    //---------------------------------------
    // Validate Invitation
    //---------------------------------------

    async validate(token: string) {

        const invitation = await this.invitationRepo.findOne({
            where: {
                token,
            },
            relations: {
                invitedRole: true,
            },
        });

        if (!invitation) {
            throw new BadRequestException(
                'Invalid invitation.',
            );
        }

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new BadRequestException(
                'This invitation has already been used.',
            );
        }

        if (invitation.expires_at.getTime() < Date.now()) {
            throw new BadRequestException(
                'This invitation has expired.',
            );
        }

        return {
            message: 'Invitation is valid.',
            data: {
                email: invitation.email,
                role: {
                    id: invitation.invitedRole.id,
                    name: invitation.invitedRole.name,
                    display_name: invitation.invitedRole.display_name,
                },
                message: invitation.message,
                expires_at: invitation.expires_at,
            },
        };
    }

    //---------------------------------------
    // Accept Invitation
    //---------------------------------------

    async accept(dto: AcceptInvitationDto) {

        const queryRunner =
            this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            //----------------------------------
            // Find invitation
            //----------------------------------

            const invitation =
                await queryRunner.manager.findOne(
                    Invitation,
                    {
                        where: {
                            token: dto.token,
                        },
                        relations: {
                            invitedRole: true,
                        },
                    },
                );

            if (!invitation) {
                throw new BadRequestException(
                    'Invalid invitation.',
                );
            }

            if (
                invitation.status !==
                InvitationStatus.PENDING
            ) {
                throw new BadRequestException(
                    'Invitation has already been used.',
                );
            }

            if (
                invitation.expires_at.getTime() <
                Date.now()
            ) {
                throw new BadRequestException(
                    'Invitation has expired.',
                );
            }

            //----------------------------------
            // Check existing user
            //----------------------------------

            const emailHash =
                HashUtil.sha256(invitation.email);

            const existing =
                await queryRunner.manager.findOne(
                    User,
                    {
                        where: {
                            email_hash: emailHash,
                        },
                    },
                );

            if (existing) {
                throw new ConflictException(
                    'User already exists.',
                );
            }

            //----------------------------------
            // Prepare user
            //----------------------------------

            const hashedPassword =
                await PasswordUtil.hash(dto.password);

            const encryptedEmail =
                CryptoUtil.encrypt(invitation.email);

            const encryptedPhone =
                dto.phone
                    ? CryptoUtil.encrypt(dto.phone)
                    : "";

            //----------------------------------
            // Create user
            //----------------------------------

            const user =
                queryRunner.manager.create(User, {

                    first_name:
                        dto.first_name,

                    last_name:
                        dto.last_name,

                    email_hash:
                        emailHash,

                    email_encrypted:
                        encryptedEmail,

                    phone:
                        encryptedPhone,

                    password_hash:
                        hashedPassword,

                    status:
                        'active',

                    terms_accepted:
                        true,

                    terms_accepted_at:
                        new Date(),

                    roles: [
                        invitation.invitedRole,
                    ],

                });

            await queryRunner.manager.save(user);

            //----------------------------------
            // Update invitation
            //----------------------------------

            invitation.status =
                InvitationStatus.ACCEPTED;

            invitation.accepted_at =
                new Date();

            invitation.accepted_by_user_id =
                user.id;

            await queryRunner.manager.save(
                invitation,
            );

            //----------------------------------

            await queryRunner.commitTransaction();

            return {

                message:
                    'Invitation accepted successfully.',

                data: {

                    id: user.id,

                    first_name:
                        user.first_name,

                    last_name:
                        user.last_name,

                    email:
                        invitation.email,

                    role:
                        invitation.invitedRole.name,

                },

            };

        } catch (error) {

            await queryRunner.rollbackTransaction();

            throw error;

        } finally {

            await queryRunner.release();

        }

    }

    //---------------------------------------
    // List Invitations
    //---------------------------------------

    async findAll(user: any) {

        const invitations =
            await this.invitationRepo.find({

                where: {
                    invited_by_user_id: user.userId,
                },

                relations: {
                    invitedRole: true,
                    acceptedBy: true,
                },

                order: {
                    created_at: 'DESC',
                },

            });

        return {

            message:
                'Invitations fetched successfully.',

            data:
                invitations.map(invitation => ({

                    id:
                        invitation.id,

                    email:
                        invitation.email,

                    role: {

                        id:
                            invitation.invitedRole.id,

                        name:
                            invitation.invitedRole.name,

                        display_name:
                            invitation.invitedRole.display_name,

                    },

                    status:
                        invitation.status,

                    message:
                        invitation.message,

                    created_at:
                        invitation.created_at,

                    expires_at:
                        invitation.expires_at,

                    accepted_at:
                        invitation.accepted_at,

                    accepted_by:
                        invitation.acceptedBy
                            ? {

                                id:
                                    invitation.acceptedBy.id,

                                first_name:
                                    invitation.acceptedBy.first_name,

                                last_name:
                                    invitation.acceptedBy.last_name,

                            }
                            : null,

                })),

        };

    }

    //---------------------------------------
    // Cancel Invitation
    //---------------------------------------

    async cancel(
        user: any,
        id: string,
    ) {

        const invitation =
            await this.invitationRepo.findOne({

                where: {
                    id,
                },

            });

        if (!invitation) {

            throw new BadRequestException(
                'Invitation not found.',
            );

        }

        //----------------------------------
        // Ownership Check
        //----------------------------------

        if (
            invitation.invited_by_user_id !==
            user.userId
        ) {

            throw new BadRequestException(
                'You are not authorized to cancel this invitation.',
            );

        }

        //----------------------------------
        // Status Check
        //----------------------------------

        if (
            invitation.status !==
            InvitationStatus.PENDING
        ) {

            throw new BadRequestException(
                `Invitation is already ${invitation.status}.`,
            );

        }

        //----------------------------------

        invitation.status =
            InvitationStatus.CANCELLED;

        await this.invitationRepo.save(
            invitation,
        );

        return {

            message:
                'Invitation cancelled successfully.',

        };

    }


    //---------------------------------------
    // Resend Invitation
    //---------------------------------------

    async resend(
        user: any,
        id: string,
    ) {

        const invitation = await this.invitationRepo.findOne({
            where: { id },
            relations: {
                invitedRole: true,
            },
        });

        if (!invitation) {
            throw new NotFoundException(
                'Invitation not found.',
            );
        }

        //----------------------------------
        // Ownership Check
        //----------------------------------

        if (invitation.invited_by_user_id !== user.userId) {
            throw new ForbiddenException(
                'You are not authorized to resend this invitation.',
            );
        }

        //----------------------------------
        // Status Check
        //----------------------------------

        if (invitation.status !== InvitationStatus.PENDING) {
            throw new BadRequestException(
                `Invitation is already ${invitation.status}.`,
            );
        }

        //----------------------------------
        // Expiry Check
        //----------------------------------

        if (invitation.expires_at < new Date()) {

            invitation.status = InvitationStatus.EXPIRED;
            await this.invitationRepo.save(invitation);

            throw new BadRequestException(
                'Invitation has expired. Please create a new invitation.',
            );
        }

        //----------------------------------
        // Send Email
        //----------------------------------

        const inviteLink =
            `${process.env.FRONTEND_URL}/accept-invitation?token=${invitation.token}`;

        await EmailUtil.sendInvitation(
            invitation.email,
            inviteLink,
            invitation.invitedRole.display_name ?? invitation.invitedRole.name,
            invitation.message,
        );

        return {
            message: 'Invitation email sent successfully.',
        };
    }

    //---------------------------------------
    // Get Invitation Details
    //---------------------------------------

    async findOne(
        user: any,
        id: string,
    ) {

        const invitation =
            await this.invitationRepo.findOne({

                where: {
                    id,
                },

                relations: {
                    invitedRole: true,
                    invitedBy: true,
                    acceptedBy: true,
                },

            });

        if (!invitation) {

            throw new BadRequestException(
                'Invitation not found.',
            );

        }

        //----------------------------------
        // Ownership Check
        //----------------------------------

        if (
            invitation.invited_by_user_id !==
            user.userId
        ) {

            throw new BadRequestException(
                'You are not authorized to view this invitation.',
            );

        }

        //----------------------------------

        return {

            message:
                'Invitation fetched successfully.',

            data: {

                id:
                    invitation.id,

                email:
                    invitation.email,

                role: {

                    id:
                        invitation.invitedRole.id,

                    name:
                        invitation.invitedRole.name,

                    display_name:
                        invitation.invitedRole.display_name,

                },

                invited_by: {

                    id:
                        invitation.invitedBy.id,

                    first_name:
                        invitation.invitedBy.first_name,

                    last_name:
                        invitation.invitedBy.last_name,

                },

                status:
                    invitation.status,

                message:
                    invitation.message,

                created_at:
                    invitation.created_at,

                expires_at:
                    invitation.expires_at,

                accepted_at:
                    invitation.accepted_at,

                accepted_by:
                    invitation.acceptedBy
                        ? {

                            id:
                                invitation.acceptedBy.id,

                            first_name:
                                invitation.acceptedBy.first_name,

                            last_name:
                                invitation.acceptedBy.last_name,

                        }
                        : null,

            },

        };

    }
}