import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { TechnicianVerification } from '../technician-verification/entities/technician-verification.entity';
import { User } from '../users/entities/user.entity';

import { GetVerificationsDto } from './dto/get-verifications.dto';
import { CryptoUtil } from 'src/common/utils';
import { RejectVerificationDto } from './dto/reject-verification.dto';

@Injectable()
export class AdminVerificationService {
    constructor(
        @InjectRepository(TechnicianVerification)
        private readonly verificationRepo: Repository<TechnicianVerification>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async getVerifications(
        query: GetVerificationsDto,
    ) {
        const qb = this.verificationRepo
            .createQueryBuilder('verification')
            .leftJoinAndSelect('verification.user', 'user')
            .where('verification.deleted_at IS NULL');

        if (query.status) {
            qb.andWhere(
                'LOWER(verification.status) = LOWER(:status)',
                {
                    status: query.status,
                },
            );
        }

        qb.orderBy(
            'verification.created_at',
            'DESC',
        );

        const verifications = await qb.getMany();
        return {
            total: verifications.length,
            items: verifications.map((verification) => ({
                verification_id: verification.id,

                technician: {
                    id: verification.user.id,
                    first_name: verification.user.first_name,
                    last_name: verification.user.last_name,
                    email: CryptoUtil.decrypt(verification.user.email_encrypted),
                    phone: verification.user.phone,
                },

                status: verification.status,
                total_points: verification.total_points,
                submitted_at: verification.submitted_at,
                created_at: verification.created_at,
            })),
        };
    }

    async getVerificationById(
        verificationId: string,
    ) {
        const verification = await this.verificationRepo.findOne({
            where: {
                id: verificationId,
                deleted_at: IsNull(),
            },
            relations: {
                user: true,
                documents: {
                    documentType: true,
                },
            },
        });

        if (!verification) {
            throw new NotFoundException(
                'Verification not found.',
            );
        }

        return {
            verification_id: verification.id,

            technician: {
                id: verification.user.id,
                first_name: verification.user.first_name,
                last_name: verification.user.last_name,
                email: CryptoUtil.decrypt(verification.user.email_encrypted),
                phone: verification.user.phone,
            },

            verification: {
                status: verification.status,
                total_points: verification.total_points,
                submitted_at: verification.submitted_at,
                remarks: verification.remarks,
                created_at: verification.created_at,
            },

            documents: verification.documents.map((doc) => ({
                id: doc.id,
                document_type_id: doc.document_type_id,
                document_type: doc.documentType.name,
                points: doc.documentType.points,
                document_number: doc.document_number,
                expiry_date: doc.expiry_date,
                file_url: doc.file_url,
                status: doc.status,
                remarks: doc.remarks,
                uploaded_at: doc.created_at,
            })),
        };
    }

    async approveVerification(
        verificationId: string,
        adminUserId: string,
    ) {
        const verification = await this.verificationRepo.findOne({
            where: {
                id: verificationId,
                deleted_at: IsNull(),
            },
            relations: {
                user: true,
                documents: {
                    documentType: true,
                },
            },
        });

        if (!verification) {
            throw new NotFoundException(
                'Verification not found.',
            );
        }

        if (verification.status === 'approved') {
            throw new BadRequestException(
                'Verification has already been approved.',
            );
        }

        if (verification.documents.length === 0) {
            throw new BadRequestException(
                'No verification documents uploaded.',
            );
        }

        const totalPoints = verification.documents.reduce(
            (sum, doc) => sum + doc.documentType.points,
            0,
        );

        if (totalPoints < 100) {
            throw new BadRequestException(
                `Minimum 100 points required. Current points: ${totalPoints}`,
            );
        }

        const verifiedAt = new Date();

        await this.verificationRepo.update(
            { id: verification.id },
            {
                status: 'approved',
                total_points: totalPoints,
                verified_at: verifiedAt,
                verified_by: adminUserId,
                remarks: "",
            },
        );

        await this.userRepo.update(
            { id: verification.user_id },
            {
                verification_status: 'approved',
                verified_at: verifiedAt,
                verified_by: adminUserId,
            },
        );

        return {
            message: 'Technician verification approved successfully.',
            verification_id: verification.id,
            technician_id: verification.user_id,
            total_points: totalPoints,
            verified_at: verifiedAt,
        };
    }

    async rejectVerification(
        verificationId: string,
        dto: RejectVerificationDto,
        adminUserId: string,
    ) {
        const verification = await this.verificationRepo.findOne({
            where: {
                id: verificationId,
                deleted_at: IsNull(),
            },
            relations: {
                user: true,
            },
        });

        if (!verification) {
            throw new NotFoundException(
                'Verification not found.',
            );
        }

        if (verification.status === 'approved') {
            throw new BadRequestException(
                'Approved verification cannot be rejected.',
            );
        }

        if (verification.status === 'rejected') {
            throw new BadRequestException(
                'Verification has already been rejected.',
            );
        }

        const verifiedAt = new Date();

        await this.verificationRepo.update(
            { id: verification.id },
            {
                status: 'rejected',
                remarks: dto.remarks,
                verified_at: verifiedAt,
                verified_by: adminUserId,
            },
        );

        await this.userRepo.update(
            { id: verification.user_id },
            {
                verification_status: 'rejected',
                verified_at: verifiedAt,
                verified_by: adminUserId,
            },
        );

        return {
            message: 'Verification rejected successfully.',
            verification_id: verification.id,
            technician_id: verification.user_id,
            remarks: dto.remarks,
            rejected_at: verifiedAt,
        };
    }

    async getVerificationStatistics() {
        const [
            total,
            draft,
            pending,
            approved,
            rejected,
        ] = await Promise.all([
            this.verificationRepo.count({
                where: {
                    deleted_at: IsNull(),
                },
            }),

            this.verificationRepo.count({
                where: {
                    status: 'draft',
                    deleted_at: IsNull(),
                },
            }),

            this.verificationRepo.count({
                where: {
                    status: 'pending',
                    deleted_at: IsNull(),
                },
            }),

            this.verificationRepo.count({
                where: {
                    status: 'approved',
                    deleted_at: IsNull(),
                },
            }),

            this.verificationRepo.count({
                where: {
                    status: 'rejected',
                    deleted_at: IsNull(),
                },
            }),
        ]);

        const completionRate =
            total === 0
                ? 0
                : Number(
                    ((approved / total) * 100).toFixed(2),
                );

        return {
            summary: {
                total,
                draft,
                pending,
                approved,
                rejected,
            },
            completion_rate: completionRate,
        };
    }
}