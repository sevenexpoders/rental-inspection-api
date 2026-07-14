import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { User } from "../users/entities";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Role } from "../lookup/entities";
import { GetAdminUsersDto } from "./dto/get-admin-users.dto";
import { CryptoUtil } from "src/common/utils";
import { Property, PropertyParty } from "../properties/entities";
import { Inspection } from "../inspections/entities";
import { ROLES } from '../../common/constants/roles.constant';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class AdminUsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,

        @InjectRepository(Property)
        private readonly propertyRepo: Repository<Property>,

        @InjectRepository(PropertyParty)
        private readonly propertyPartyRepo: Repository<PropertyParty>,

        @InjectRepository(Inspection)
        private readonly inspectionRepo: Repository<Inspection>,
    ) { }

    async getUsers(dto: GetAdminUsersDto) {
        const {
            page,
            limit,
            search,
            role,
            status,
        } = dto;

        const qb = this.userRepo
            .createQueryBuilder('user')
            .leftJoinAndSelect(
                'user.roles',
                'role',
            )
            .where('user.deleted_at IS NULL')

            // Exclude Super Admin users
            .andWhere(
                'role.name <> :superAdmin',
                {
                    superAdmin: 'super_admin',
                },
            );

        //---------------------------------------
        // Search
        //---------------------------------------

        if (search) {
            qb.andWhere(
                `(
        LOWER(user.first_name) LIKE LOWER(:search)
        OR LOWER(user.last_name) LIKE LOWER(:search)
        OR LOWER(user.phone) LIKE LOWER(:search)
      )`,
                {
                    search: `%${search}%`,
                },
            );
        }

        //---------------------------------------
        // Status Filter
        //---------------------------------------

        if (status) {
            qb.andWhere(
                'user.status = :status',
                {
                    status,
                },
            );
        }

        //---------------------------------------
        // Role Filter
        //---------------------------------------

        if (role) {
            qb.andWhere(
                'role.name = :role',
                {
                    role,
                },
            );
        }

        //---------------------------------------
        // Sorting
        //---------------------------------------

        qb.orderBy(
            'user.created_at',
            'DESC',
        );

        //---------------------------------------
        // Pagination
        //---------------------------------------

        qb.skip((page - 1) * limit);

        qb.take(limit);

        //---------------------------------------

        const [users, total] =
            await qb.getManyAndCount();

        //---------------------------------------

        return {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),

            items: users.map((user) => ({
                id: user.id,

                first_name: user.first_name,

                last_name: user.last_name,

                email: user.email_encrypted
                    ? CryptoUtil.decrypt(user.email_encrypted)
                    : null,

                phone: user.phone ? CryptoUtil.decrypt(user.phone) : null,

                status: user.status,

                verification_status:
                    user.verification_status,

                created_at: user.created_at,

                roles: user.roles.map((r) => ({
                    id: r.id,
                    name: r.name,
                    display_name: r.display_name,
                })),
            })),
        };
    }

    async getUserById(
        userId: string,
    ) {

        //---------------------------------------
        // User
        //---------------------------------------

        const user = await this.userRepo.findOne({

            where: {
                id: userId,
                deleted_at: IsNull(),
            },

            relations: {
                roles: true,
            },

        });

        if (!user) {

            throw new NotFoundException(
                'User not found.',
            );

        }

        //---------------------------------------
        // Owned Properties
        //---------------------------------------

        const ownedProperties =
            await this.propertyRepo.find({

                where: {
                    user_id: userId,
                    deleted_at: IsNull(),
                },

                select: {
                    id: true,
                    address: true,
                    house_unit_no: true,
                    status: true,
                    created_at: true,
                },

            });

        //---------------------------------------
        // Shared Properties
        //---------------------------------------

        const sharedProperties =
            await this.propertyPartyRepo.find({

                where: {
                    user: {
                        id: userId,
                    },
                    is_active: true,
                },

                relations: {
                    property: true,
                },

            });

        //---------------------------------------
        // Inspections
        //---------------------------------------

        const totalInspections =
            await this.inspectionRepo.count({

                where: {
                    user_id: userId,
                    deleted_at: IsNull(),
                },

            });

        //---------------------------------------

        const completedInspections =
            await this.inspectionRepo.count({

                where: {
                    user_id: userId,
                    status: 'completed',
                    deleted_at: IsNull(),
                },

            });

        //---------------------------------------

        return {

            id: user.id,

            first_name: user.first_name,

            last_name: user.last_name,

            email: user.email_encrypted
                ? CryptoUtil.decrypt(
                    user.email_encrypted,
                )
                : null,

            phone: user.phone,

            status: user.status,

            verification_status:
                user.verification_status,

            verified_at:
                user.verified_at,

            created_at:
                user.created_at,

            roles:
                user.roles.map(role => ({

                    id: role.id,

                    name: role.name,

                    display_name:
                        role.display_name,

                })),

            statistics: {

                owned_properties:
                    ownedProperties.length,

                shared_properties:
                    sharedProperties.length,

                total_inspections:
                    totalInspections,

                completed_inspections:
                    completedInspections,

            },

            owned_properties:
                ownedProperties.map(property => ({

                    id: property.id,

                    address:
                        property.address,

                    house_unit_no:
                        property.house_unit_no,

                    status:
                        property.status,

                    created_at:
                        property.created_at,

                })),

            shared_properties:
                sharedProperties.map(item => ({

                    id: item.property.id,

                    address:
                        item.property.address,

                    house_unit_no:
                        item.property.house_unit_no,

                    status:
                        item.property.status,

                    created_at:
                        item.property.created_at,

                })),

        };

    }

    async updateUserStatus(
        userId: string,
        dto: UpdateUserStatusDto,
    ) {

        //---------------------------------------
        // Find User
        //---------------------------------------

        const user = await this.userRepo.findOne({

            where: {
                id: userId,
                deleted_at: IsNull(),
            },

            relations: {
                roles: true,
            },

        });

        if (!user) {

            throw new NotFoundException(
                'User not found.',
            );

        }

        //---------------------------------------
        // Prevent updating Super Admin
        //---------------------------------------

        const isSuperAdmin =
            user.roles.some(
                role => role.name === ROLES.SUPER_ADMIN,
            );

        if (isSuperAdmin) {

            throw new BadRequestException(
                'Super Admin status cannot be changed.',
            );

        }

        //---------------------------------------

        user.status = dto.status;

        await this.userRepo.save(user);

        //---------------------------------------

        return {

            message:
                'User status updated successfully.',

            data: {

                id: user.id,

                status: user.status,

            },

        };

    }

    async deleteUser(
        userId: string,
        currentUserId: string,
    ) {

        //---------------------------------------
        // Prevent self delete
        //---------------------------------------

        if (userId === currentUserId) {
            throw new BadRequestException(
                'You cannot delete your own account.',
            );
        }

        //---------------------------------------
        // Find user
        //---------------------------------------

        const user = await this.userRepo.findOne({

            where: {
                id: userId,
                deleted_at: IsNull(),
            },

            relations: {
                roles: true,
            },

        });

        if (!user) {
            throw new NotFoundException(
                'User not found.',
            );
        }

        //---------------------------------------
        // Prevent deleting Super Admin
        //---------------------------------------

        const isSuperAdmin = user.roles.some(
            role => role.name === ROLES.SUPER_ADMIN,
        );

        if (isSuperAdmin) {
            throw new BadRequestException(
                'Super Admin cannot be deleted.',
            );
        }

        //---------------------------------------
        // Soft Delete
        //---------------------------------------

        await this.userRepo.softDelete(user.id);

        //---------------------------------------

        return {
            message: 'User deleted successfully.',
        };
    }
}