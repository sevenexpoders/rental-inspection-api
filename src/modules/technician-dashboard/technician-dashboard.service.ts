import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    IsNull,
    Repository,
} from 'typeorm';

import { Property } from '../properties/entities/property.entity';
import { PropertyParty } from '../property-parties/entities/property-party.entity';
import { Inspection } from '../inspections/entities/inspection.entity';
import { TechnicianVerification } from '../technician-verification/entities/technician-verification.entity';

@Injectable()
export class TechnicianDashboardService {
    constructor(
        @InjectRepository(Property)
        private readonly propertyRepo: Repository<Property>,

        @InjectRepository(PropertyParty)
        private readonly propertyPartyRepo: Repository<PropertyParty>,

        @InjectRepository(Inspection)
        private readonly inspectionRepo: Repository<Inspection>,

        @InjectRepository(TechnicianVerification)
        private readonly verificationRepo: Repository<TechnicianVerification>
    ) { }

    async getDashboard(userId: string) {
        //------------------------------------------
        // Assigned Properties
        //------------------------------------------

        const assignedProperties =
            await this.propertyPartyRepo.find({
                where: {
                    user: {
                        id: userId,
                    },
                    is_active: true,
                },
                relations: {
                    property: {
                        city: true,
                        state: true,
                    },
                },
                order: {
                    created_at: 'DESC',
                },
            });

        //------------------------------------------
        // Inspections
        //------------------------------------------

        const inspections =
            await this.inspectionRepo.find({
                where: {
                    user_id: userId,
                    deleted_at: IsNull(),
                },
                relations: {
                    property: true,
                },
                order: {
                    created_at: 'DESC',
                },
            });

        //------------------------------------------
        // Overview
        //------------------------------------------

        const draftInspections =
            inspections.filter(
                (x) => x.status === 'draft',
            ).length;

        const completedInspections =
            inspections.filter(
                (x) => x.status === 'completed',
            ).length;

        //------------------------------------------
        // Recent Properties
        //------------------------------------------

        const recentProperties =
            assignedProperties
                .slice(0, 5)
                .map((x) => ({
                    id: x.property.id,
                    address: x.property.address,
                    house_unit_no: x.property.house_unit_no,
                    city: x.property.city,
                    state: x.property.state,
                    created_at: x.property.created_at,
                }));

        //------------------------------------------
        // Recent Activity
        //------------------------------------------

        const recentActivity =
            inspections
                .slice(0, 5)
                .map((inspection) => ({
                    inspectionId: inspection.id,
                    propertyId: inspection.property?.id,
                    propertyAddress:
                        inspection.property?.address,
                    status: inspection.status,
                    createdAt: inspection.created_at,
                    completedAt: inspection.completed_at,
                }));

        //------------------------------------------

        return {
            overview: {
                assigned_properties:
                    assignedProperties.length,

                draft_inspections:
                    draftInspections,

                completed_inspections:
                    completedInspections,

                reports:
                    completedInspections,
            },

            assigned_properties:
                assignedProperties.map((item) => ({
                    property_id: item.property.id,
                    address: item.property.address,
                    house_unit_no:
                        item.property.house_unit_no,
                    city: item.property.city,
                    state: item.property.state,
                })),

            recent_properties:
                recentProperties,

            recent_activity:
                recentActivity,
        };
    }

    async getRecentProperties(userId: string) {
        const inspections = await this.inspectionRepo.find({
            where: {
                user_id: userId,
                deleted_at: IsNull(),
            },
            relations: {
                property: {
                    city: true,
                    state: true,
                    propertyType: true,
                },
            },
            order: {
                updated_at: 'DESC',
            },
            take: 5,
        });

        const propertyMap = new Map();

        for (const inspection of inspections) {
            if (!inspection.property) {
                continue;
            }

            if (!propertyMap.has(inspection.property.id)) {
                propertyMap.set(inspection.property.id, {
                    inspectionId: inspection.id,
                    propertyId: inspection.property.id,
                    address: inspection.property.address,
                    houseUnitNo: inspection.property.house_unit_no,
                    postalCode: inspection.property.postal_code,
                    city: inspection.property.city,
                    state: inspection.property.state,
                    propertyType: inspection.property.propertyType,
                    status: inspection.status,
                    completedAt: inspection.completed_at,
                    updatedAt: inspection.updated_at,
                });
            }
        }

        return {
            total: propertyMap.size,
            items: Array.from(propertyMap.values()),
        };
    }

    async getRecentActivities(userId: string) {

        //---------------------------------------
        // Recent Inspections
        //---------------------------------------

        const inspections =
            await this.inspectionRepo.find({

                where: {
                    user_id: userId,
                    deleted_at: IsNull(),
                },

                relations: {
                    property: true,
                },

                order: {
                    updated_at: 'DESC',
                },

                take: 5,
            });

        //---------------------------------------
        // Verification
        //---------------------------------------

        const verification =
            await this.verificationRepo.findOne({

                where: {
                    user_id: userId,
                    deleted_at: IsNull(),
                },

            });

        //---------------------------------------
        // Activities
        //---------------------------------------

        const activities: any[] = [];

        for (const inspection of inspections) {

            activities.push({

                type:
                    inspection.status.toLowerCase() === 'completed'
                        ? 'inspection_completed'
                        : 'inspection_draft',

                title:
                    inspection.status.toLowerCase() === 'completed'
                        ? 'Inspection Completed'
                        : 'Inspection Saved',

                description:
                    inspection.property
                        ? `${inspection.property.house_unit_no}, ${inspection.property.address}`
                        : 'Property Inspection',

                status: inspection.status,

                referenceId: inspection.id,

                activityDate:
                    inspection.completed_at ??
                    inspection.updated_at,

            });

        }

        //---------------------------------------

        if (verification) {

            if (verification.submitted_at) {

                activities.push({

                    type: 'verification_submitted',

                    title: 'Verification Submitted',

                    description:
                        'Your technician verification has been submitted.',

                    status: verification.status,

                    referenceId: verification.id,

                    activityDate:
                        verification.submitted_at,

                });

            }

            if (verification.verified_at) {

                activities.push({

                    type:
                        verification.status === 'approved'
                            ? 'verification_approved'
                            : 'verification_reviewed',

                    title:
                        verification.status === 'approved'
                            ? 'Verification Approved'
                            : 'Verification Reviewed',

                    description:
                        verification.status === 'approved'
                            ? 'Your technician verification has been approved.'
                            : 'Your technician verification has been reviewed.',

                    status: verification.status,

                    referenceId: verification.id,

                    activityDate:
                        verification.verified_at,

                });

            }

        }

        //---------------------------------------
        // Sort Latest First
        //---------------------------------------

        activities.sort(

            (a, b) =>
                new Date(b.activityDate).getTime() -
                new Date(a.activityDate).getTime(),

        );

        //---------------------------------------

        return {

            total: activities.length,

            items: activities.slice(0, 10),

        };

    }
}