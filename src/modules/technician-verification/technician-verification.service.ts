import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { VerificationDocumentType } from './entities/verification-document-type.entity';
import { DocumentTypeResponseDto } from './dto/document-type-response.dto';
import { TechnicianVerification } from './entities/technician-verification.entity';
import { TechnicianVerificationDocument } from './entities/technician-verification-document.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { getPresignedS3Url } from 'src/common/helpers/s3-presigned.helper';
import { User } from '../users/entities';
import { s3, S3_BUCKET } from 'src/config/s3.config';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { VerificationStatus } from 'src/common/constants/verificationstatus.constant';

@Injectable()
export class TechnicianVerificationService {
    constructor(
        @InjectRepository(TechnicianVerification)
        private readonly verificationRepo: Repository<TechnicianVerification>,

        @InjectRepository(TechnicianVerificationDocument)
        private readonly documentRepo: Repository<TechnicianVerificationDocument>,

        @InjectRepository(VerificationDocumentType)
        private readonly documentTypeRepo: Repository<VerificationDocumentType>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async getDocumentTypes(): Promise<DocumentTypeResponseDto[]> {
        const documentTypes = await this.documentTypeRepo.find({
            where: { is_active: true },
            order: {
                display_order: 'ASC',
                points: 'DESC',
            },
        });

        return documentTypes.map((item) => ({
            id: item.id,
            name: item.name,
            points: item.points,
            is_primary: item.is_primary,
            requires_name: item.requires_name,
            requires_photo: item.requires_photo,
            requires_address: item.requires_address,
            requires_signature: item.requires_signature,
        }));
    }

    async uploadDocument(
        dto: UploadDocumentDto,
        file: Express.MulterS3.File,
        userId: string,
    ) {
        try {
            if (!file) {
                throw new BadRequestException('Document file is required.');
            }

            // Check document type
            const documentType = await this.documentTypeRepo.findOne({
                where: {
                    id: dto.document_type_id,
                    is_active: true,
                    deleted_at: IsNull(),
                },
            });

            if (!documentType) {
                throw new NotFoundException(
                    'Verification document type not found.',
                );
            }

            // Find existing verification
            let verification = await this.verificationRepo.findOne({
                where: {
                    user_id: userId,
                    status: VerificationStatus.DRAFT,
                    deleted_at: IsNull(),
                },
            });

            // Create verification if not exists
            if (!verification) {
                verification = await this.verificationRepo.save({
                    user_id: userId,
                    status: VerificationStatus.DRAFT,
                    total_points: 0,
                });
            }

            // Check whether this document type already exists
            let document = await this.documentRepo.findOne({
                where: {
                    verification_id: verification.id,
                    document_type_id: dto.document_type_id,
                    deleted_at: IsNull(),
                },
            });

            if (document) {
                // Update existing document
                document.file_url = file.key;
                document.document_number = dto.document_number;
                document.expiry_date = dto.expiry_date
                    ? new Date(dto.expiry_date)
                    : undefined;
                document.status = 'uploaded';

                document = await this.documentRepo.save(document);
            } else {
                // Create new document
                document = await this.documentRepo.save({
                    verification_id: verification.id,
                    document_type_id: dto.document_type_id,
                    file_url: file.key,
                    document_number: dto.document_number,
                    expiry_date: dto.expiry_date
                        ? new Date(dto.expiry_date)
                        : undefined,
                    status: 'uploaded',
                    created_by: userId,
                });
            }

            // Calculate total points
            const uploadedDocuments = await this.documentRepo.find({
                where: {
                    verification_id: verification.id,
                    deleted_at: IsNull(),
                },
                relations: {
                    documentType: true,
                },
            });

            const totalPoints = uploadedDocuments.reduce(
                (sum, item) => sum + item.documentType.points,
                0,
            );

            verification.total_points = totalPoints;

            await this.verificationRepo.save(verification);

            return {
                message: 'Document uploaded successfully.',
                verification_id: verification.id,
                document_id: document.id,
                total_points: totalPoints,
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getMyDocuments(userId: string) {
        try {
            const verification = await this.verificationRepo.findOne({
                where: {
                    user_id: userId,
                    deleted_at: IsNull(),
                },
                relations: {
                    documents: {
                        documentType: true,
                    },
                },
            });

            if (!verification) {
                return {
                    verification_id: null,
                    status: 'not_started',
                    total_points: 0,
                    documents: [],
                };
            }


            const expiresIn = parseInt(
                process.env.FILE_EXPIRES_SECONDS || '172800',
                10,
            );

            const bucketName = process.env.AWS_BUCKET_NAME;

            if (!bucketName) {
                throw new Error('AWS_BUCKET_NAME is not configured');
            }

            const documents = await Promise.all(
                verification.documents.map(async (doc) => ({
                    id: doc.id,
                    document_type_id: doc.document_type_id,
                    document_name: doc.documentType.name,
                    points: doc.documentType.points,
                    is_primary: doc.documentType.is_primary,
                    fileUrl: doc.file_url
                        ? await getPresignedS3Url(
                            doc.file_url,
                            expiresIn,
                            bucketName,
                        )
                        : null,
                    document_number: doc.document_number,
                    expiry_date: doc.expiry_date,
                    status: doc.status,
                    remarks: doc.remarks,
                })),
            );

            return {
                verification_id: verification.id,
                status: verification.status,
                total_points: verification.total_points,
                submitted_at: verification.submitted_at,
                verified_at: verification.verified_at,
                remarks: verification.remarks,
                documents,
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async submitVerification(userId: string) {
        try {
            // Find technician verification
            const verification = await this.verificationRepo.findOne({
                where: {
                    user_id: userId,
                    deleted_at: IsNull(),
                },
            });

            if (!verification) {
                throw new NotFoundException(
                    'Verification not found.',
                );
            }

            if (verification.status !== VerificationStatus.DRAFT) {
                throw new BadRequestException(
                    `Verification is already ${verification.status}.`,
                );
            }

            // Get uploaded documents
            const documents = await this.documentRepo.find({
                where: {
                    verification_id: verification.id,
                    deleted_at: IsNull(),
                },
                relations: {
                    documentType: true,
                },
            });

            if (!documents.length) {
                throw new BadRequestException(
                    'Please upload at least one verification document.',
                );
            }

            // Calculate total points
            const totalPoints = documents.reduce(
                (sum, doc) => sum + doc.documentType.points,
                0,
            );

            // Minimum 100 points validation
            if (totalPoints < 100) {
                throw new BadRequestException(
                    `Minimum 100 points required. Current points: ${totalPoints}.`,
                );
            }

            // Check primary document
            const hasPrimaryDocument = documents.some(
                (doc) => doc.documentType.is_primary,
            );

            if (!hasPrimaryDocument) {
                throw new BadRequestException(
                    'At least one primary document is required.',
                );
            }

            // Update verification
            verification.total_points = totalPoints;
            verification.status = VerificationStatus.PENDING;
            verification.submitted_at = new Date();

            await this.verificationRepo.save(verification);

            await this.userRepo.update(
                { id: userId },
                {
                    verification_status: VerificationStatus.PENDING,
                },
            );

            return {
                message: 'Verification submitted successfully.',
                verification_id: verification.id,
                status: verification.status,
                total_points: verification.total_points,
                submitted_at: verification.submitted_at,
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getVerificationStatus(userId: string) {
        try {
            const user = await this.userRepo.findOne({
                where: {
                    id: userId,
                    deleted_at: IsNull(),
                },
                select: {
                    id: true,
                    verification_status: true,
                    verified_at: true,
                },
            });

            if (!user) {
                throw new NotFoundException('User not found.');
            }

            const verification = await this.verificationRepo.findOne({
                where: {
                    user_id: userId,
                    deleted_at: IsNull(),
                },
                order: {
                    created_at: 'DESC',
                },
            });

            if (!verification) {
                return {
                    verification_status: user.verification_status ?? VerificationStatus.NOT_VERIFIED,
                    can_access_dashboard: false,
                    total_points: 0,
                    submitted_at: null,
                    verified_at: null,
                    remarks: null,
                };
            }

            return {
                verification_id: verification.id,
                verification_status: verification.status,
                can_access_dashboard:
                    verification.status === VerificationStatus.APPROVED,
                total_points: verification.total_points,
                submitted_at: verification.submitted_at,
                verified_at: verification.verified_at,
                remarks: verification.remarks,
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async deleteDocument(
        documentId: string,
        userId: string,
    ) {
        try {
            // Find document
            const document = await this.documentRepo.findOne({
                where: {
                    id: documentId,
                    deleted_at: IsNull(),
                },
                relations: {
                    verification: true,
                    documentType: true,
                },
            });

            if (!document) {
                throw new NotFoundException(
                    'Verification document not found.',
                );
            }

            // Verify owner
            if (document.verification.user_id !== userId) {
                throw new ForbiddenException(
                    'You are not allowed to delete this document.',
                );
            }

            // Allow delete only in Draft or Rejected state
            if (
                ![VerificationStatus.DRAFT.toString(), VerificationStatus.REJECTED.toString()].includes(
                    document.verification.status,
                )
            ) {
                throw new BadRequestException(
                    'Documents cannot be deleted after verification is submitted.',
                );
            }

            // Delete file from S3
            if (document.file_url) {
                try {
                    await s3.send(
                        new DeleteObjectCommand({
                            Bucket: S3_BUCKET!,
                            Key: document.file_url,
                        }),
                    );
                } catch (error) {
                    console.error(
                        `Failed to delete S3 object: ${document.file_url}`,
                        error,
                    );
                }
            }

            // Soft delete document
            await this.documentRepo.softDelete(document.id);

            // Get remaining documents
            const remainingDocuments = await this.documentRepo.find({
                where: {
                    verification_id: document.verification.id,
                    deleted_at: IsNull(),
                },
                relations: {
                    documentType: true,
                },
            });

            // Calculate remaining points
            const totalPoints = remainingDocuments.reduce(
                (sum, doc) => sum + doc.documentType.points,
                0,
            );

            // Determine verification status
            const verificationStatus =
                remainingDocuments.length > 0 ? VerificationStatus.DRAFT : VerificationStatus.NOT_VERIFIED;

            // Update verification
            await this.verificationRepo.update(
                { id: document.verification.id },
                {
                    total_points: totalPoints,
                    status: VerificationStatus.DRAFT,
                    submitted_at: null,
                },
            );

            // Update user verification status
            await this.userRepo.update(
                { id: userId },
                {
                    verification_status: verificationStatus,
                },
            );

            return {
                message: 'Document deleted successfully.',
                verification_status: verificationStatus,
                total_points: totalPoints,
                remaining_documents: remainingDocuments.length,
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}