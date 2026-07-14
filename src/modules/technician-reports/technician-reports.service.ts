import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  Brackets,
  IsNull,
  Repository,
} from 'typeorm';

import { Inspection } from '../inspections/entities/inspection.entity';
import { InspectionStatus } from '../../common/enum/inspection-status.enum';
import { GetTechnicianReportsDto } from './dto/get-technician-reports.dto';
import { getPresignedS3Url } from 'src/common/helpers/s3-presigned.helper';
import { CryptoUtil } from 'src/common/utils';

@Injectable()
export class TechnicianReportsService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepo: Repository<Inspection>,
  ) {}

  async getReports(
    userId: string,
    dto: GetTechnicianReportsDto,
  ) {
    const page = Number(dto.page);
    const limit = Number(dto.limit);

    const qb =
      this.inspectionRepo
        .createQueryBuilder('inspection')

        .leftJoinAndSelect(
          'inspection.property',
          'property',
        )

        .leftJoinAndSelect(
          'property.city',
          'city',
        )

        .leftJoinAndSelect(
          'property.state',
          'state',
        )

        .leftJoinAndSelect(
          'inspection.items',
          'items',
        )

        .where(
          'inspection.user_id = :userId',
          { userId },
        )

        .andWhere(
          'inspection.deleted_at IS NULL',
        )

        .andWhere(
          'LOWER(inspection.status)=LOWER(:status)',
          {
            status: InspectionStatus.COMPLETED,
          },
        );

    //-----------------------------------------------------

    if (dto.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where(
            'LOWER(property.address) LIKE LOWER(:search)',
            {
              search: `%${dto.search}%`,
            },
          )
            .orWhere(
              'LOWER(property.house_unit_no) LIKE LOWER(:search)',
              {
                search: `%${dto.search}%`,
              },
            )
            .orWhere(
              'LOWER(city.name) LIKE LOWER(:search)',
              {
                search: `%${dto.search}%`,
              },
            )
            .orWhere(
              'LOWER(state.name) LIKE LOWER(:search)',
              {
                search: `%${dto.search}%`,
              },
            );
        }),
      );
    }

    //-----------------------------------------------------

    qb.orderBy(
      'inspection.completed_at',
      'DESC',
    );

    qb.skip((page - 1) * limit);

    qb.take(limit);

    //-----------------------------------------------------

    const [reports, total] =
      await qb.getManyAndCount();

    //-----------------------------------------------------

    return {
      total,

      page,

      limit,

      totalPages:
        Math.ceil(total / limit),

      items: reports.map((inspection) => {

        const pass =
          inspection.items.filter(
            (i) =>
              String(i.answer).toLowerCase() ===
              'yes',
          ).length;

        const fail =
          inspection.items.filter(
            (i) =>
              String(i.answer).toLowerCase() ===
              'no',
          ).length;

        const score =
          pass + fail > 0
            ? Math.round(
                (pass / (pass + fail)) * 100,
              )
            : 0;

        return {

          inspectionId:
            inspection.id,

          completedAt:
            inspection.completed_at,

          property: {

            id:
              inspection.property.id,

            address:
              inspection.property.address,

            houseUnitNo:
              inspection.property.house_unit_no,

            city:
              inspection.property.city,

            state:
              inspection.property.state,

          },

          summary: {

            pass,

            fail,

            score,

          },

        };
      }),
    };
  }

  async getReportById(
  inspectionId: string,
  userId: string,
) {
  const inspection =
    await this.inspectionRepo.findOne({

      where: {
        id: inspectionId,
        user_id: userId,
        status: InspectionStatus.COMPLETED,
        deleted_at: IsNull(),
      },

      relations: {
        property: {
          city: true,
          state: true,
          propertyType: true,
        },

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

  //----------------------------------------------------

  const pass =
    inspection.items.filter(
      i => String(i.answer).toLowerCase() === 'yes',
    ).length;

  const fail =
    inspection.items.filter(
      i => String(i.answer).toLowerCase() === 'no',
    ).length;

  const score =
    pass + fail > 0
      ? Math.round(
          (pass / (pass + fail)) * 100,
        )
      : 0;

  //----------------------------------------------------

  const expiresIn = parseInt(
    process.env.FILE_EXPIRES_SECONDS || '172800',
    10,
  );

  const bucket =
    process.env.AWS_BUCKET_NAME!;

  //----------------------------------------------------

  return {

    inspectionId: inspection.id,

    completedAt: inspection.completed_at,

    status: inspection.status,

    property: {

      id: inspection.property.id,

      address: inspection.property.address,

      houseUnitNo:
        inspection.property.house_unit_no,

      postalCode:
        inspection.property.postal_code,

      ownerName:
        inspection.property.owner_name,

      ownerEmail:
        inspection.property.owner_email
          ? CryptoUtil.decrypt(
              inspection.property.owner_email,
            )
          : null,

      ownerPhone:
        inspection.property.owner_phone
          ? CryptoUtil.decrypt(
              inspection.property.owner_phone,
            )
          : null,

      city: inspection.property.city,

      state: inspection.property.state,

      propertyType:
        inspection.property.propertyType,
    },

    summary: {

      pass,

      fail,

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

          inspectionTypeId:
            item.inspection_type_id,

          title:
            item.inspectionType?.title,

          subtitle:
            item.inspectionType?.subtitle,

          image:
            item.inspectionType?.image,

          answer:
            item.answer,

          note:
            item.note,

          media: await Promise.all(

            (item.media ?? []).map(
              async media => ({

                id: media.id,

                fileUrl:
                  media.file_url
                    ? await getPresignedS3Url(
                        media.file_url,
                        expiresIn,
                        bucket,
                      )
                    : null,

                createdAt:
                  media.created_at,
              }),
            ),
          ),
        })),
    ),
  };
}
}