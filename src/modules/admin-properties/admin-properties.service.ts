import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { IsNull } from 'typeorm';

import { Property } from '../properties/entities/property.entity';

import { GetAdminPropertiesDto } from './dto/get-admin-properties.dto';
import { CryptoUtil } from 'src/common/utils';
import { InspectionStatus } from 'src/common/enum';

@Injectable()
export class AdminPropertiesService {

    constructor(

        @InjectRepository(Property)
        private readonly propertyRepo: Repository<Property>,

    ) { }

    async getProperties(
        dto: GetAdminPropertiesDto,
    ) {

        const {

            page,

            limit,

            search,

            propertyTypeId,

            cityId,

            stateId,

        } = dto;

        //------------------------------------------------

        const qb =
            this.propertyRepo.createQueryBuilder('property')

                .leftJoinAndSelect(
                    'property.city',
                    'city',
                )

                .leftJoinAndSelect(
                    'property.state',
                    'state',
                )

                .leftJoinAndSelect(
                    'property.propertyType',
                    'propertyType',
                )

                .leftJoinAndSelect(
                    'property.inspections',
                    'inspection',
                )

                .where(
                    'property.deleted_at IS NULL',
                );

        //------------------------------------------------

        if (search) {

            qb.andWhere(

                `(LOWER(property.address) LIKE LOWER(:search)
                OR LOWER(property.house_unit_no) LIKE LOWER(:search)
                OR LOWER(property.owner_name) LIKE LOWER(:search))`,

                {
                    search: `%${search}%`,
                },

            );

        }

        //------------------------------------------------

        if (propertyTypeId) {

            qb.andWhere(

                'property.property_type_id = :propertyTypeId',

                {
                    propertyTypeId,
                },

            );

        }

        //------------------------------------------------

        if (cityId) {

            qb.andWhere(

                'property.city_id = :cityId',

                {
                    cityId,
                },

            );

        }

        //------------------------------------------------

        if (stateId) {

            qb.andWhere(

                'property.state_id = :stateId',

                {
                    cityId,
                },

            );

        }

        //------------------------------------------------

        qb.orderBy(
            'property.created_at',
            'DESC',
        );

        qb.skip(
            (page - 1) * limit,
        );

        qb.take(limit);

        //------------------------------------------------

        const [properties, total] =
            await qb.getManyAndCount();

        //------------------------------------------------

        return {

            total,

            page,

            limit,

            totalPages:
                Math.ceil(total / limit),

            items:
                properties.map(property => ({

                    id: property.id,

                    house_unit_no:
                        property.house_unit_no,

                    address:
                        property.address,

                    postal_code:
                        property.postal_code,

                    owner_name:
                        property.owner_name,

                    owner_email: property.owner_email
                        ? CryptoUtil.decrypt(property.owner_email)
                        : null,

                    owner_phone: property.owner_phone
                        ? CryptoUtil.decrypt(property.owner_phone)
                        : null,

                    beds:
                        property.beds,

                    baths:
                        property.baths,

                    country:
                        property.country,

                    city:
                        property.city,

                    state:
                        property.state,

                    property_type:
                        property.propertyType,

                    inspections:
                        property.inspections.length,

                    created_at:
                        property.created_at,

                })),

        };

    }

    async getPropertyById(
        propertyId: string,
    ) {

        //---------------------------------------
        // Get Property
        //---------------------------------------

        const property = await this.propertyRepo.findOne({

            where: {
                id: propertyId,
                deleted_at: IsNull(),
            },

            relations: {
                city: true,
                state: true,
                propertyType: true,
                inspections: true,
                parties: {
                    user: {
                        roles: true,
                    },
                },
            },

        });

        if (!property) {

            throw new NotFoundException(
                'Property not found.',
            );

        }

        //---------------------------------------
        // Inspection Summary
        //---------------------------------------

        const totalInspections =
            property.inspections.length;

        const completedInspections =
            property.inspections.filter(
                inspection =>
                    inspection.status ===
                    InspectionStatus.COMPLETED,
            ).length;

        const draftInspections =
            property.inspections.filter(
                inspection =>
                    inspection.status ===
                    InspectionStatus.DRAFT,
            ).length;

        //---------------------------------------
        // Assigned Users
        //---------------------------------------

        const assignedUsers =
            property.parties.map(
                party => ({

                    id: party.user.id,

                    first_name:
                        party.user.first_name,

                    last_name:
                        party.user.last_name,

                    email:
                        party.user.email_encrypted
                            ? CryptoUtil.decrypt(
                                party.user.email_encrypted,
                            )
                            : null,

                    phone:
                        party.user.phone,

                    roles:
                        party.user.roles.map(
                            role => ({

                                id: role.id,

                                name: role.name,

                                display_name:
                                    role.display_name,

                            }),
                        ),

                    is_active:
                        party.is_active,

                }),
            );

        //---------------------------------------

        return {

            id: property.id,

            house_unit_no:
                property.house_unit_no,

            address:
                property.address,

            postal_code:
                property.postal_code,

            country:
                property.country,

            beds:
                property.beds,

            baths:
                property.baths,

            owner: {

                name:
                    property.owner_name,

                email:
                    property.owner_email
                        ? CryptoUtil.decrypt(
                            property.owner_email,
                        )
                        : null,

                phone:
                    property.owner_phone
                        ? CryptoUtil.decrypt(
                            property.owner_phone,
                        )
                        : null,

            },

            city: property.city,

            state: property.state,

            property_type:
                property.propertyType,

            inspection_summary: {

                total:
                    totalInspections,

                completed:
                    completedInspections,

                draft:
                    draftInspections,

            },

            assigned_users:
                assignedUsers,

            created_at:
                property.created_at,

            updated_at:
                property.updated_at,

        };

    }

}