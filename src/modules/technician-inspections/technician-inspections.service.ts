import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  Brackets,
  IsNull,
  Repository,
} from 'typeorm';

import { Inspection } from '../inspections/entities/inspection.entity';

import { GetTechnicianInspectionsDto } from './dto/get-technician-inspections.dto';
import { getPresignedS3Url } from 'src/common/helpers/s3-presigned.helper';

@Injectable()
export class TechnicianInspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepo: Repository<Inspection>,
  ) {}

  async getInspections(
    userId: string,
    dto: GetTechnicianInspectionsDto,
  ) {
    const page = Number(dto.page);
    const limit = Number(dto.limit);

    const qb =
      this.inspectionRepo.createQueryBuilder('inspection')

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

        .where('inspection.user_id = :userId', {
          userId,
        })

        .andWhere(
          'inspection.deleted_at IS NULL',
        );

    //------------------------------------------

    if (
      dto.status &&
      dto.status !== 'all'
    ) {
      qb.andWhere(
        'LOWER(inspection.status)=LOWER(:status)',
        {
          status: dto.status,
        },
      );
    }

    //------------------------------------------

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

    //------------------------------------------

    qb.orderBy(
      'inspection.created_at',
      'DESC',
    );

    qb.skip((page - 1) * limit);

    qb.take(limit);

    //------------------------------------------

    const [inspections, total] =
      await qb.getManyAndCount();

    //------------------------------------------

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),

      items: inspections.map((inspection) => ({
        inspectionId: inspection.id,

        status: inspection.status,

        createdAt: inspection.created_at,

        completedAt: inspection.completed_at,

        property: {
          id: inspection.property.id,

          address:
            inspection.property.address,

          houseUnitNo:
            inspection.property.house_unit_no,

          postalCode:
            inspection.property.postal_code,

          city: inspection.property.city,

          state: inspection.property.state,
        },
      })),
    };
  }
  async getInspectionById(
  inspectionId: string,
  userId: string,
) {
  //----------------------------------------
  // Find Inspection
  //----------------------------------------

  const inspection = await this.inspectionRepo.findOne({
    where: {
      id: inspectionId,
      user_id: userId,
      deleted_at: IsNull(),
    },
    relations: {
      property: {
        city: true,
        state: true,
        propertyType: true,
      },
      items: {
        media: true,
        inspectionType: true,
      },
    },
  });

  if (!inspection) {
    throw new NotFoundException(
      'Inspection not found.',
    );
  }

  //----------------------------------------

  const expiresIn = parseInt(
    process.env.FILE_EXPIRES_SECONDS || '172800',
    10,
  );

  const bucketName = process.env.AWS_BUCKET_NAME;

  //----------------------------------------

  return {
    inspectionId: inspection.id,

    status: inspection.status,

    completedAt: inspection.completed_at,

    createdAt: inspection.created_at,

    property: {
      id: inspection.property.id,

      address: inspection.property.address,

      houseUnitNo:
        inspection.property.house_unit_no,

      postalCode:
        inspection.property.postal_code,

      country:
        inspection.property.country,

      beds:
        inspection.property.beds,

      baths:
        inspection.property.baths,

      city:
        inspection.property.city,

      state:
        inspection.property.state,

      propertyType:
        inspection.property.propertyType,
    },

    items: await Promise.all(

      inspection.items

        .sort(
          (a, b) =>
            (a.inspectionType?.order_index ?? 0) -
            (b.inspectionType?.order_index ?? 0),
        )

        .map(async (item) => ({

          id: item.id,

          inspectionTypeId:
            item.inspection_type_id,

          title:
            item.inspectionType?.title,

          subtitle:
            item.inspectionType?.subtitle,

          image:
            item.inspectionType?.image,

          inputType:
            item.inspectionType?.input_type,

          answer:
            item.answer,

          note:
            item.note,

          media: await Promise.all(

            (item.media ?? []).map(
              async (media) => ({

                id: media.id,

                fileName:
                  media.file_name,

                fileUrl:
                  media.file_url
                    ? await getPresignedS3Url(
                        media.file_url,
                        expiresIn,
                        bucketName!,
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