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

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionRepo: Repository<Inspection>,

    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,

    @InjectRepository(InspectionItem)
    private inspectionItemRepo: Repository<InspectionItem>,


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
      return {
        inspection_item: item
      }
    } catch (error) {
      console.log("error==>", error);
      throw error;
    }
  }
}