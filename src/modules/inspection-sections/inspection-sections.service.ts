import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Repository,
} from 'typeorm';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import { Inspection } from '../inspections/entities/inspection.entity';

import { InspectionSection } from './entities/inspection-section.entity';

import { CreateInspectionSectionDto } from './dto/create-inspection-section.dto';
import { UpdateInspectionSectionDto } from './dto/update-inspection-section.dto';

@Injectable()
export class InspectionSectionsService {
  constructor(
    @InjectRepository(InspectionSection)
    private sectionRepo: Repository<InspectionSection>,

    @InjectRepository(Inspection)
    private inspectionRepo: Repository<Inspection>,
  ) {}

  async create(
    dto: CreateInspectionSectionDto,
  ) {
    const inspection =
      await this.inspectionRepo.findOne({
        where: {
          id: dto.inspection_id,
        },
      });

    if (!inspection) {
      throw new NotFoundException(
        'Inspection not found',
      );
    }

    const section =
      this.sectionRepo.create({
        name: dto.name,
        order_index:
          dto.order_index ?? 0,
        notes: dto.notes,
        inspection,
      });

    return this.sectionRepo.save(
      section,
    );
  }

  async findByInspection(
    inspectionId: string,
  ) {
    return this.sectionRepo.find({
      where: {
        inspection: {
          id: inspectionId,
        },
      },
      order: {
        order_index: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const section =
      await this.sectionRepo.findOne({
        where: { id },
      });

    if (!section) {
      throw new NotFoundException(
        'Section not found',
      );
    }

    return section;
  }

  async update(
    id: string,
    dto: UpdateInspectionSectionDto,
  ) {
    await this.sectionRepo.update(
      id,
      dto,
    );

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.sectionRepo.softDelete(
      id,
    );

    return {
      message:
        'Section deleted successfully',
    };
  }
}