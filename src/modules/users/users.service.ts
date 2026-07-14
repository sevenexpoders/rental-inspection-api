import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


import { UpdateUserDto, ChangePasswordDto } from './dto';
import { CryptoUtil } from '../../common/utils/crypto.util';

import { Property } from '../properties/entities';
import { Inspection, InspectionItem } from '../inspections/entities';

import { User } from './entities/user.entity';
import { InspectionStatus, Status } from '../../common/enum';
import { getPresignedS3Url } from 'src/common/helpers/s3-presigned.helper';
import { PropertyParty } from '../property-parties/entities';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,

    @InjectRepository(Inspection)
    private inspectionRepo: Repository<Inspection>,

    @InjectRepository(InspectionItem)
    private inspectionItemRepo: Repository<InspectionItem>,

    @InjectRepository(PropertyParty)
    private readonly propertyPartyRepo: Repository<PropertyParty>,

  ) { }

  // GET PROFILE
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId, status: Status.ACTIVE, deleted_at: IsNull() },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        phone: true,
        status: true,
        terms_accepted: true,
        email_encrypted: true,
        roles: {
          id: true,
          name: true,
          display_name: true,
        },
      },
      relations: {
        roles: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // delete (user as any).password_hash;
    const decryptedEmail = CryptoUtil.decrypt(user.email_encrypted,);
    const decryptedPhone = user?.phone ? CryptoUtil.decrypt(user.phone,) : "";

    const totalProperties = await this.propertyRepo.count({
      where: {
        user_id: userId,
        deleted_at: IsNull(),
      },
    });

    const completedInspections = await this.inspectionRepo
      .createQueryBuilder('inspection')
      .innerJoin('properties', 'property', 'property.id = inspection.property_id')
      .where('property.user_id = :userId', { userId })
      .andWhere('property.deleted_at IS NULL')
      .andWhere('inspection.deleted_at IS NULL')
      .andWhere('inspection.status = :status', {
        status: InspectionStatus.COMPLETED,
      })
      .getCount();

    const inProgressInspections = await this.propertyRepo
      .createQueryBuilder('property')
      .leftJoin(
        'inspections',
        'inspection',
        'inspection.property_id = property.id AND inspection.deleted_at IS NULL',
      )
      .where('property.user_id = :userId', { userId })
      .andWhere('property.deleted_at IS NULL')
      .andWhere('inspection.id IS NULL')
      .getCount();


    const draftInspections = await this.inspectionRepo
      .createQueryBuilder('inspection')
      .innerJoin(
        'properties',
        'property',
        'property.id = inspection.property_id',
      )
      .where('property.user_id = :userId', { userId })
      .andWhere('property.deleted_at IS NULL')
      .andWhere('inspection.deleted_at IS NULL')
      .andWhere('inspection.status = :status', {
        status: InspectionStatus.DRAFT,
      })
      .getCount();

    const result = await this.inspectionItemRepo
      .createQueryBuilder('item')
      .innerJoin(
        Inspection,
        'inspection',
        'inspection.id = item.inspection_id',
      )
      .innerJoin(
        Property,
        'property',
        'property.id = inspection.property_id',
      )
      .where('property.user_id = :userId', { userId })
      .andWhere('property.deleted_at IS NULL')
      .andWhere('inspection.deleted_at IS NULL')
      .andWhere('item.deleted_at IS NULL')
      .select([
        `COUNT(CASE WHEN LOWER(item.answer) = 'yes' THEN 1 END) as pass`,
        `COUNT(CASE WHEN LOWER(item.answer) = 'no' THEN 1 END) as fail`,
      ])
      .getRawOne();

    const pass = Number(result.pass ?? 0);
    const fail = Number(result.fail ?? 0);

    const compliancePercentage =
      pass + fail > 0
        ? Math.round((pass / (pass + fail)) * 100)
        : 0;
    return {
      ...user,
      email: decryptedEmail,
      email_encrypted: decryptedEmail,
      phone: decryptedPhone,
      total_properties: totalProperties,
      completed_inspections: completedInspections,
      draft_inspections: draftInspections,
      compliance_percentage: compliancePercentage,
      in_progress_inspections: inProgressInspections

    };
  }

  // UPDATE PROFILE
  async updateProfile(userId: string, dto: UpdateUserDto) {
    try {
      const updateData: any = { ...dto };
      if (dto.phone) {
        updateData.phone = CryptoUtil.encrypt(dto.phone);
      }

      await this.userRepo.update(userId, updateData);
      return await this.getProfile(userId);
    } catch (error) {
      console.log("error==>", error);
      throw error;
    }

  }

  // CHANGE PASSWORD
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId, status: Status.ACTIVE, deleted_at: IsNull() },
    });

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.password_hash,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Current password incorrect');
    }

    user.password_hash = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepo.save(user);

    return { message: 'Password updated successfully' };
  }

  // GET ALL USERS (ADMIN)
  async findAll() {
    return this.userRepo.find({
      where: { status: Status.ACTIVE, deleted_at: IsNull() },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        status: true,
      },
    });
  }

  // DELETE USER (SOFT STYLE)
  async deleteUser(userId: string) {
    await this.userRepo.update(userId, {
      status: Status.DELETED,
    });

    return { message: 'User deleted' };
  }

  async getDashboard(userId: string) {

    const totalProperties = await this.propertyRepo.count({
      where: {
        user_id: userId,
        deleted_at: IsNull(),
      },
    });

    const pendingInspections = await this.inspectionRepo
      .createQueryBuilder('inspection')
      .innerJoin(
        'properties',
        'property',
        'property.id = inspection.property_id',
      )
      .where('property.user_id = :userId', { userId })
      .andWhere('property.deleted_at IS NULL')
      .andWhere('inspection.deleted_at IS NULL')
      .andWhere('inspection.status = :status', {
        status: InspectionStatus.DRAFT,
      })
      .getCount();

    const completedInspections = await this.inspectionRepo
      .createQueryBuilder('inspection')
      .innerJoin('properties', 'property', 'property.id = inspection.property_id')
      .where('property.user_id = :userId', { userId })
      .andWhere('property.deleted_at IS NULL')
      .andWhere('inspection.deleted_at IS NULL')
      .andWhere('inspection.status = :status', {
        status: InspectionStatus.COMPLETED,
      })
      .getCount();

    const totalInspections = await this.inspectionRepo
      .createQueryBuilder('inspection')
      .innerJoin('properties', 'property', 'property.id = inspection.property_id')
      .where('property.user_id = :userId', { userId })
      .andWhere('property.deleted_at IS NULL')
      .andWhere('inspection.deleted_at IS NULL')
      .getCount();

    const inProgressInspections = await this.propertyRepo
      .createQueryBuilder('property')
      .leftJoin(
        'inspections',
        'inspection',
        'inspection.property_id = property.id AND inspection.deleted_at IS NULL',
      )
      .where('property.user_id = :userId', { userId })
      .andWhere('property.deleted_at IS NULL')
      .andWhere('inspection.id IS NULL')
      .getCount();


    // const compliancePercentage =
    //   totalInspections > 0
    //     ? Math.round((completedInspections / (totalInspections + inProgressInspections)) * 100)
    //     : 0;

    //  const compliancePercentage =
    //   totalInspections > 0
    //     ? Math.round((completedInspections / totalInspections ) * 100)
    //     : 0;

    const result = await this.inspectionItemRepo
      .createQueryBuilder('item')
      .innerJoin(
        Inspection,
        'inspection',
        'inspection.id = item.inspection_id',
      )
      .innerJoin(
        Property,
        'property',
        'property.id = inspection.property_id',
      )
      .where('property.user_id = :userId', { userId })
      .andWhere('property.deleted_at IS NULL')
      .andWhere('inspection.deleted_at IS NULL')
      .andWhere('item.deleted_at IS NULL')
      .select([
        `COUNT(CASE WHEN LOWER(item.answer) = 'yes' THEN 1 END) as pass`,
        `COUNT(CASE WHEN LOWER(item.answer) = 'no' THEN 1 END) as fail`,
      ])
      .getRawOne();

    const pass = Number(result.pass ?? 0);
    const fail = Number(result.fail ?? 0);

    const compliancePercentage =
      pass + fail > 0
        ? Math.round((pass / (pass + fail)) * 100)
        : 0;


    return {
      overview: {
        total_properties: totalProperties,
        total_inspections: totalInspections,
        completed_inspections: completedInspections,
        in_progress_inspections: inProgressInspections,
        draft_inspections: pendingInspections,
        compliance_percentage: compliancePercentage,
      }
    };
  }

  // async getReportsSummary(userId: string) {
  //   const inspections = await this.inspectionRepo.find({
  //     where: {
  //       user_id: userId,
  //       status: InspectionStatus.COMPLETED,
  //       deleted_at: IsNull(),
  //     },
  //     relations: {
  //       property: {
  //         city: true,
  //         state: true,
  //         propertyType: true,
  //       },
  //       items: {
  //         media: true,
  //         inspectionType: true,
  //       },
  //     },
  //     order: {
  //       completed_at: 'DESC',
  //     },
  //   });

  //   // Get all property creator ids
  //   const createdByIds = [
  //     ...new Set(
  //       inspections
  //         .map((i) => i.property?.created_by)
  //         .filter((id): id is string => !!id),
  //     ),
  //   ];

  //   // Fetch all creators in one query
  //   const users = await this.userRepo.find({
  //     where: {
  //       id: In(createdByIds),
  //     },
  //     select: {
  //       id: true,
  //       first_name: true,
  //       last_name: true,
  //       email_encrypted: true,
  //       phone: true
  //     },
  //   });

  //   const reports = await Promise.all(
  //     inspections.map(async (inspection) => {
  //       const items = inspection.items ?? [];

  //       const propertyOwner =
  //         users.find((u) => u.id === inspection.property.created_by) ?? null;

  //       const passCount = items.filter(
  //         (item) => String(item.answer).toLowerCase() === 'yes',
  //       ).length;

  //       const failCount = items.filter(
  //         (item) => String(item.answer).toLowerCase() === 'no',
  //       ).length;

  //       const score =
  //         passCount + failCount > 0
  //           ? Math.round((passCount / (passCount + failCount)) * 100)
  //           : 0;
  //       const expiresIn = parseInt(
  //         process.env.FILE_EXPIRES_SECONDS || '172800',
  //         10,
  //       );

  //       const bucketName = process.env.AWS_BUCKET_NAME;

  //       if (!bucketName) {
  //         throw new Error('AWS_BUCKET_NAME is not configured');
  //       }
  //       return {
  //         inspectionId: inspection.id,
  //         status: inspection.status,
  //         completedAt: inspection.completed_at,

  //         property: {
  //           id: inspection.property.id,
  //           address: inspection.property.address,
  //           postalCode: inspection.property.postal_code,
  //           country: inspection.property.country,
  //           houseUnitNo: inspection.property.house_unit_no,
  //           beds: inspection.property.beds,
  //           baths: inspection.property.baths,

  //           ownerName: inspection.property.owner_name,
  //           ownerEmail: inspection.property.owner_email
  //             ? CryptoUtil.decrypt(inspection.property.owner_email)
  //             : null,
  //           ownerPhone: inspection.property.owner_phone
  //             ? CryptoUtil.decrypt(inspection.property.owner_phone)
  //             : null,

  //           city: inspection.property.city,
  //           state: inspection.property.state,
  //           propertyType: inspection.property.propertyType,

  //           createdBy: propertyOwner && {
  //             id: propertyOwner.id,
  //             firstName: propertyOwner.first_name,
  //             lastName: propertyOwner.last_name,
  //             email: propertyOwner.email_encrypted
  //               ? CryptoUtil.decrypt(propertyOwner.email_encrypted)
  //               : null,
  //             phone: propertyOwner.phone,
  //           },
  //         },

  //         summary: {
  //           pass: passCount,
  //           fail: failCount,
  //           score,
  //         },

  //         items: await Promise.all(
  //           items
  //             .sort(
  //               (a, b) =>
  //                 (a.inspectionType?.order_index ?? 0) -
  //                 (b.inspectionType?.order_index ?? 0),
  //             )
  //             .map(async (item) => ({
  //               id: item.id,
  //               inspectionId: item.inspection_id,
  //               inspectionTypeId: item.inspection_type_id,

  //               title: item.inspectionType?.title,
  //               subtitle: item.inspectionType?.subtitle,
  //               image: item.inspectionType?.image,
  //               inputType: item.inspectionType?.input_type,
  //               orderIndex: item.inspectionType?.order_index,

  //               answer: item.answer,
  //               note: item.note,

  //               media: await Promise.all(
  //                 (item.media ?? []).map(async (media) => ({
  //                   id: media.id,
  //                   fileName: media.file_name,
  //                   fileUrl: media.file_url
  //                     ? await getPresignedS3Url(
  //                       media.file_url,
  //                       expiresIn,
  //                       bucketName,
  //                     )
  //                     : null,
  //                   createdAt: media.created_at,
  //                   createdBy: media.created_by,
  //                 })),
  //               ),
  //             })),
  //         ),
  //       };
  //     }),
  //   );
  //   const totalPass = reports.reduce(
  //     (sum, report) => sum + report.summary.pass,
  //     0,
  //   );

  //   const totalFail = reports.reduce(
  //     (sum, report) => sum + report.summary.fail,
  //     0,
  //   );

  //   const overallScore =
  //     totalPass + totalFail > 0
  //       ? Math.round((totalPass / (totalPass + totalFail)) * 100)
  //       : 0;

  //   return {
  //     reports: reports.length,
  //     pass: totalPass,
  //     fail: totalFail,
  //     score: overallScore,
  //     available_reports: reports,
  //   };
  // }
  async getReportsSummary(userId: string) {
     
    const myProperties =
      await this.propertyRepo.find({

        where: {

          user_id: userId,

          deleted_at: IsNull(),

        },

        select: {

          id: true,

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
    // Merge Property Ids
    //---------------------------------------

    const propertyIds = [

      ...new Set([

        ...myProperties.map((p) => p.id),

        ...sharedProperties.map((p) => p.property.id),

      ]),

    ];

    //---------------------------------------
    // Get Reports
    //---------------------------------------

    const inspections =
      await this.inspectionRepo.find({

        where: {

          property_id: In(propertyIds),

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

            media: true,

            inspectionType: true,

          },

        },

        order: {

          completed_at: 'DESC',

        },

      });
    const createdByIds = [
      ...new Set(
        inspections
          .map((i) => i.property?.created_by)
          .filter((id): id is string => !!id),
      ),
    ];

    // Fetch all creators in one query
    const users = await this.userRepo.find({
      where: {
        id: In(createdByIds),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email_encrypted: true,
        phone: true
      },
    });

    const reports = await Promise.all(
      inspections.map(async (inspection) => {
        const items = inspection.items ?? [];

        const propertyOwner =
          users.find((u) => u.id === inspection.property.created_by) ?? null;

        const passCount = items.filter(
          (item) => String(item.answer).toLowerCase() === 'yes',
        ).length;

        const failCount = items.filter(
          (item) => String(item.answer).toLowerCase() === 'no',
        ).length;

        const score =
          passCount + failCount > 0
            ? Math.round((passCount / (passCount + failCount)) * 100)
            : 0;
        const expiresIn = parseInt(
          process.env.FILE_EXPIRES_SECONDS || '172800',
          10,
        );

        const bucketName = process.env.AWS_BUCKET_NAME;

        if (!bucketName) {
          throw new Error('AWS_BUCKET_NAME is not configured');
        }
        return {
          inspectionId: inspection.id,
          status: inspection.status,
          completedAt: inspection.completed_at,

          property: {
            id: inspection.property.id,
            address: inspection.property.address,
            postalCode: inspection.property.postal_code,
            country: inspection.property.country,
            houseUnitNo: inspection.property.house_unit_no,
            beds: inspection.property.beds,
            baths: inspection.property.baths,

            ownerName: inspection.property.owner_name,
            ownerEmail: inspection.property.owner_email
              ? CryptoUtil.decrypt(inspection.property.owner_email)
              : null,
            ownerPhone: inspection.property.owner_phone
              ? CryptoUtil.decrypt(inspection.property.owner_phone)
              : null,

            city: inspection.property.city,
            state: inspection.property.state,
            propertyType: inspection.property.propertyType,

            createdBy: propertyOwner && {
              id: propertyOwner.id,
              firstName: propertyOwner.first_name,
              lastName: propertyOwner.last_name,
              email: propertyOwner.email_encrypted
                ? CryptoUtil.decrypt(propertyOwner.email_encrypted)
                : null,
              phone: propertyOwner.phone,
            },
          },

          summary: {
            pass: passCount,
            fail: failCount,
            score,
          },

          items: await Promise.all(
            items
              .sort(
                (a, b) =>
                  (a.inspectionType?.order_index ?? 0) -
                  (b.inspectionType?.order_index ?? 0),
              )
              .map(async (item) => ({
                id: item.id,
                inspectionId: item.inspection_id,
                inspectionTypeId: item.inspection_type_id,

                title: item.inspectionType?.title,
                subtitle: item.inspectionType?.subtitle,
                image: item.inspectionType?.image,
                inputType: item.inspectionType?.input_type,
                orderIndex: item.inspectionType?.order_index,

                answer: item.answer,
                note: item.note,

                media: await Promise.all(
                  (item.media ?? []).map(async (media) => ({
                    id: media.id,
                    fileName: media.file_name,
                    fileUrl: media.file_url
                      ? await getPresignedS3Url(
                        media.file_url,
                        expiresIn,
                        bucketName,
                      )
                      : null,
                    createdAt: media.created_at,
                    createdBy: media.created_by,
                  })),
                ),
              })),
          ),
        };
      }),
    );
    const totalPass = reports.reduce(
      (sum, report) => sum + report.summary.pass,
      0,
    );

    const totalFail = reports.reduce(
      (sum, report) => sum + report.summary.fail,
      0,
    );

    const overallScore =
      totalPass + totalFail > 0
        ? Math.round((totalPass / (totalPass + totalFail)) * 100)
        : 0;

    return {
      reports: reports.length,
      pass: totalPass,
      fail: totalFail,
      score: overallScore,
      available_reports: reports,
    };
  }
}