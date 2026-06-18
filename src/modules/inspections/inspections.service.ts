import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { Inspection } from './entities/inspection.entity';
import { Property } from '../properties/entities/property.entity';


import { CreateInspectionDto, SaveInspectionItemDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { InspectionStatus } from '../../common/enum/inspection-status.enum';
import { InspectionItem } from './entities/inspection-item.entity';
import { InspectionType } from '../lookup/entities/inspection_types.entity';
import { Status } from 'src/common/enum/status';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionRepo: Repository<Inspection>,

    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,

    @InjectRepository(InspectionItem)
    private inspectionItemRepo: Repository<InspectionItem>,

    @InjectRepository(InspectionType)
    private inspectionTypeRepo: Repository<InspectionType>,


  ) { }

  async create(
    dto: CreateInspectionDto,
    userId: string,
  ) {
    const property = await this.propertyRepo.findOne({
      where: { id: dto.property_id },
    });

    if (!property) {
      throw new NotFoundException('Property not found',);
    }

  }

  async findAll() {
    return this.inspectionRepo.find({
      relations: {
        property: true,
      },
    });
  }

  async findOne(id: string) {
    const inspection =
      await this.inspectionRepo.findOne({
        where: { id },
        relations: {
          property: true,
        },
      });

    if (!inspection) {
      throw new NotFoundException(
        'Inspection not found',
      );
    }

    return inspection;
  }

  async update(
    id: string,
    dto: UpdateInspectionDto,
  ) {
    await this.inspectionRepo.update(
      id,
      dto,
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.inspectionRepo.softDelete(
      id,
    );

    return {
      message: 'Inspection deleted',
    };
  }


  async startInspection(propertyId: string, userId: string,) {
    try {
      let inspection = await this.inspectionRepo.findOne({
        where: {
          property_id: propertyId,
          user_id: userId,
          deleted_at: IsNull(),
        },
      });

      if (inspection) {
        if (inspection.status === InspectionStatus.COMPLETED) {
          throw new BadRequestException(
            'Inspection already completed',
          );
        }
      } else {
        inspection = await this.inspectionRepo.save({
          property_id: propertyId,
          user_id: userId,
          status: InspectionStatus.DRAFT,
          created_by: userId,
        });
      }

      const items = await this.inspectionItemRepo.find({
        where: {
          inspection_id: inspection.id,
          deleted_at: IsNull(),
        },
        relations: {
          media: true,
        },
      });

      return {
        inspection: {
          id: inspection.id,
          property_id: inspection.property_id,
          status: inspection.status,
        },
        inspection_item: items,
        completed_items: items.length,
      };
    } catch (error) {
      console.log("error==>", error);
      throw error;
    }
  }

  async saveInspectionItem(
    inspectionId: string,
    dto: SaveInspectionItemDto,
    userId: string,
  ) {
    try {

      const inspection = await this.inspectionRepo.findOne({
        where: {
          id: inspectionId,
          user_id: userId,
          deleted_at: IsNull()
        },
        select: { id: true, status: true }
      });

      if (!inspection) {
        throw new NotFoundException('Inspection not found');
      }

      if (inspection.status.toLowerCase() === InspectionStatus.COMPLETED.toLowerCase()) {
        throw new BadRequestException('Inspection is already completed',);
      }
      let item = await this.inspectionItemRepo.findOne({
        where: {
          inspection_id: inspectionId,
          inspection_type_id: dto.inspection_type_id,
          deleted_at: IsNull(),
        },
      });

      if (item) {
        item.answer = dto.answer;
        item.note = dto.note;
        item.updated_by = userId;

        item = await this.inspectionItemRepo.save(item);
      } else {
        item = await this.inspectionItemRepo.save({
          inspection_id: inspectionId,
          inspection_type_id: dto.inspection_type_id,
          answer: dto.answer,
          note: dto.note,
          created_by: userId,
        });
      }

      // const totalItems = await this.inspectionItemRepo.count({
      //   where: {
      //     inspection_id: inspectionId,
      //     deleted_at: IsNull(),
      //   },
      // });
      // const expectedItems = await this.inspectionTypeRepo.count({ where: { status: Status.ACTIVE, deleted_at: IsNull() } });

      // if (totalItems >= expectedItems) {
      //   await this.inspectionRepo.update(inspectionId, {
      //     status: InspectionStatus.COMPLETED,
      //     completed_at: new Date(),
      //     updated_by: userId,
      //   });
      // }
      return {
        inspection_item: item
      }
    } catch (error) {
      console.log("error==>", error);
      throw error;
    }
  }

  async completeInspection(inspectionId: string, userId: string) {
    const inspection = await this.inspectionRepo.findOne({
      where: {
        id: inspectionId,
        user_id: userId,
        deleted_at: IsNull(),
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    if (
      inspection.status.toLowerCase() ===
      InspectionStatus.COMPLETED.toLowerCase()
    ) {
      throw new BadRequestException('Inspection already completed');
    }

    // 🔥 Check missing inspection types (BEST LOGIC)
    const missingItems = await this.inspectionTypeRepo
      .createQueryBuilder('type')
      .leftJoin(
        'inspection_items',
        'item',
        'item.inspection_type_id = type.id AND item.inspection_id = :inspectionId',
        { inspectionId }
      )
      .where('type.status = :status', { status: Status.ACTIVE })
      .andWhere('type.deleted_at IS NULL')
      .andWhere('item.id IS NULL')
      .getCount();

    if (missingItems > 0) {
      throw new BadRequestException(
        `Please complete all inspection items. Missing: ${missingItems}`
      );
    }

    await this.inspectionRepo.update(inspectionId, {
      status: InspectionStatus.COMPLETED,
      completed_at: new Date(),
      updated_by: userId,
    });

    return {
      message: 'Inspection completed successfully',
      inspectionId,
      status: InspectionStatus.COMPLETED,
    };
  }
}