import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/entities";
import { IsNull, Repository } from "typeorm";
import { Role } from "../lookup/entities";
import { Property } from "../properties/entities";
import { Inspection } from "../inspections/entities";
import { TechnicianVerification } from "../technician-verification/entities/technician-verification.entity";

@Injectable()
export class AdminDashboardService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,

        @InjectRepository(Property)
        private readonly propertyRepo: Repository<Property>,

        @InjectRepository(Inspection)
        private readonly inspectionRepo: Repository<Inspection>,

        @InjectRepository(TechnicianVerification)
        private readonly verificationRepo: Repository<TechnicianVerification>,
    ) { }
    async getDashboard() {
        // ---------- USERS ----------
        const totalUsers = await this.userRepo.count({
            where: {
                deleted_at: IsNull(),
            },
        });

        const landlords = await this.userRepo
            .createQueryBuilder('user')
            .innerJoin('user.roles', 'role')
            .where('role.name = :role', { role: 'landlord' })
            .andWhere('user.deleted_at IS NULL')
            .getCount();

        const propertyManagers = await this.userRepo
            .createQueryBuilder('user')
            .innerJoin('user.roles', 'role')
            .where('role.name = :role', {
                role: 'property_manager',
            })
            .andWhere('user.deleted_at IS NULL')
            .getCount();

        const technicians = await this.userRepo
            .createQueryBuilder('user')
            .innerJoin('user.roles', 'role')
            .where('role.name = :role', {
                role: 'technician',
            })
            .andWhere('user.deleted_at IS NULL')
            .getCount();

        // ---------- PROPERTIES ----------
        const totalProperties =
            await this.propertyRepo.count({
                where: {
                    deleted_at: IsNull(),
                },
            });

        // ---------- INSPECTIONS ----------
        const totalInspections =
            await this.inspectionRepo.count({
                where: {
                    deleted_at: IsNull(),
                },
            });

        const draftInspections =
            await this.inspectionRepo.count({
                where: {
                    status: 'draft',
                    deleted_at: IsNull(),
                },
            });

        const completedInspections =
            await this.inspectionRepo.count({
                where: {
                    status: 'completed',
                    deleted_at: IsNull(),
                },
            });

        // ---------- REPORTS ----------
        // Reports are generated from completed inspections
        const totalReports = completedInspections;

        // ---------- VERIFICATIONS ----------
        const draftVerification =
            await this.verificationRepo.count({
                where: {
                    status: 'draft',
                    deleted_at: IsNull(),
                },
            });

        const submittedVerification =
            await this.verificationRepo.count({
                where: {
                    status: 'submitted',
                    deleted_at: IsNull(),
                },
            });

        const approvedVerification =
            await this.verificationRepo.count({
                where: {
                    status: 'approved',
                    deleted_at: IsNull(),
                },
            });

        const rejectedVerification =
            await this.verificationRepo.count({
                where: {
                    status: 'rejected',
                    deleted_at: IsNull(),
                },
            });

        return {
            overview: {
                total_users: totalUsers,
                landlords,
                property_managers: propertyManagers,
                technicians,
            },

            properties: {
                total: totalProperties,
            },

            inspections: {
                total: totalInspections,
                draft: draftInspections,
                completed: completedInspections,
            },

            reports: {
                total: totalReports,
            },

            technician_verification: {
                draft: draftVerification,
                submitted: submittedVerification,
                approved: approvedVerification,
                rejected: rejectedVerification,
            },
        };
    }
}