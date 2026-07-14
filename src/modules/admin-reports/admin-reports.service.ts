import { Injectable, NotFoundException } from "@nestjs/common";
import { Inspection } from "../inspections/entities";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { GetAdminReportsDto } from "./dto/get-admin-reports.dto";
import { CryptoUtil } from "src/common/utils";
import { getPresignedS3Url } from "src/common/helpers/s3-presigned.helper";

@Injectable()
export class AdminReportsService {

    constructor(
        @InjectRepository(Inspection)
        private readonly inspectionRepo: Repository<Inspection>,
    ) { }

    async getReports(
        dto: GetAdminReportsDto,
    ) {
        const {
            page = 1,
            limit = 10,
            search,
        } = dto;

        try {

            const qb = this.inspectionRepo
                .createQueryBuilder('inspection')

                .leftJoinAndSelect(
                    'inspection.property',
                    'property',
                )

                .leftJoinAndSelect(
                    'inspection.user',
                    'user',
                )

                .leftJoinAndSelect(
                    'inspection.items',
                    'items',
                )

                .where(
                    'inspection.deleted_at IS NULL',
                )

                .andWhere(
                    'inspection.status = :status',
                    {
                        status: 'completed',
                    },
                );

            //------------------------------------------------

            if (search) {

                qb.andWhere(
                    `(LOWER(property.address) LIKE LOWER(:search)
                OR LOWER(property.house_unit_no) LIKE LOWER(:search))`,
                    {
                        search: `%${search}%`,
                    },
                );

            }

            //------------------------------------------------

            qb.orderBy(
                'inspection.completed_at',
                'DESC',
            );

            qb.skip(
                (page - 1) * limit,
            );

            qb.take(limit);

            //------------------------------------------------

            console.log('SQL:', qb.getSql());
            console.log('Params:', qb.getParameters());

            const [reports, total] = await qb.getManyAndCount();

            //------------------------------------------------

            return {

                total,

                page,

                limit,

                totalPages: Math.ceil(total / limit),

                items: reports.map(report => {

                    const items = report.items ?? [];

                    const pass = items.filter(
                        item =>
                            String(item.answer).toLowerCase() === 'yes',
                    ).length;

                    const fail = items.filter(
                        item =>
                            String(item.answer).toLowerCase() === 'no',
                    ).length;

                    const score =
                        pass + fail > 0
                            ? Math.round((pass / (pass + fail)) * 100)
                            : 0;

                    return {

                        id: report.id,

                        completed_at: report.completed_at,

                        property: report.property
                            ? {
                                id: report.property.id,
                                house_unit_no: report.property.house_unit_no,
                                address: report.property.address,
                            }
                            : null,

                        technician: report.user
                            ? {
                                id: report.user.id,
                                first_name: report.user.first_name,
                                last_name: report.user.last_name,
                            }
                            : null,

                        summary: {
                            pass,
                            fail,
                            score,
                        },

                    };

                }),

            };

        } catch (error) {

            console.error('========== GET REPORTS ERROR ==========');
            console.error(error);
            console.error('=======================================');

            throw error;

        }
    }

    async getReportById(
        reportId: string,
    ) {

        //---------------------------------------
        // Get Report (Completed Inspection)
        //---------------------------------------

        const inspection =
            await this.inspectionRepo.findOne({

                where: {
                    id: reportId,
                    status: 'completed',
                    deleted_at: IsNull(),
                },

                relations: {

                    property: {
                        city: true,
                        state: true,
                        propertyType: true,
                    },

                    user: true,

                    items: {
                        inspectionType: true,
                        media: true,
                    },

                },

            });

        if (!inspection) {

            throw new NotFoundException(
                'Report not found.',
            );

        }

        //---------------------------------------
        // Summary
        //---------------------------------------

        const passCount =
            inspection.items.filter(
                item =>
                    String(item.answer).toLowerCase() === 'yes',
            ).length;

        const failCount =
            inspection.items.filter(
                item =>
                    String(item.answer).toLowerCase() === 'no',
            ).length;

        const score =
            passCount + failCount > 0
                ? Math.round(
                    (passCount /
                        (passCount + failCount)) *
                    100,
                )
                : 0;

        //---------------------------------------

        const expiresIn = parseInt(
            process.env.FILE_EXPIRES_SECONDS || '172800',
            10,
        );

        const bucketName =
            process.env.AWS_BUCKET_NAME;

        //---------------------------------------

        return {

            id: inspection.id,

            status: inspection.status,

            created_at: inspection.created_at,

            completed_at:
                inspection.completed_at,

            technician: {

                id: inspection.user.id,

                first_name:
                    inspection.user.first_name,

                last_name:
                    inspection.user.last_name,

                phone:
                    inspection.user.phone,

                email:
                    inspection.user.email_encrypted
                        ? CryptoUtil.decrypt(
                            inspection.user.email_encrypted,
                        )
                        : null,

            },

            property: {

                id: inspection.property.id,

                house_unit_no:
                    inspection.property.house_unit_no,

                address:
                    inspection.property.address,

                postal_code:
                    inspection.property.postal_code,

                country:
                    inspection.property.country,

                beds:
                    inspection.property.beds,

                baths:
                    inspection.property.baths,

                owner_name:
                    inspection.property.owner_name,

                owner_email:
                    inspection.property.owner_email
                        ? CryptoUtil.decrypt(
                            inspection.property.owner_email,
                        )
                        : null,

                owner_phone:
                    inspection.property.owner_phone
                        ? CryptoUtil.decrypt(
                            inspection.property.owner_phone,
                        )
                        : null,

                city:
                    inspection.property.city,

                state:
                    inspection.property.state,

                property_type:
                    inspection.property.propertyType,

            },

            summary: {

                pass: passCount,

                fail: failCount,

                score,

            },

            items: await Promise.all(

                inspection.items

                    .sort(
                        (a, b) =>
                            (a.inspectionType?.order_index ?? 0) -
                            (b.inspectionType?.order_index ?? 0),
                    )

                    .map(async item => ({

                        id: item.id,

                        inspection_type_id:
                            item.inspection_type_id,

                        title:
                            item.inspectionType?.title,

                        subtitle:
                            item.inspectionType?.subtitle,

                        image:
                            item.inspectionType?.image,

                        input_type:
                            item.inspectionType?.input_type,

                        order_index:
                            item.inspectionType?.order_index,

                        answer:
                            item.answer,

                        note:
                            item.note,

                        media: await Promise.all(

                            (item.media ?? []).map(
                                async media => ({

                                    id: media.id,

                                    file_name:
                                        media.file_name,

                                    file_url:
                                        media.file_url
                                            ? await getPresignedS3Url(
                                                media.file_url,
                                                expiresIn,
                                                bucketName!,
                                            )
                                            : null,

                                    created_at:
                                        media.created_at,

                                }),
                            ),

                        ),

                    })),

            ),

        };

    }
}