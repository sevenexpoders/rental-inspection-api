import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Inspection } from './entities/inspection.entity';
import { Property } from '../properties/entities/property.entity';
import { Lease } from '../leases/entities/lease.entity';

import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionRepo: Repository<Inspection>,

    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,

    @InjectRepository(Lease)
    private leaseRepo: Repository<Lease>,
  ) {}

  async create(
    dto: CreateInspectionDto,
    userId: string,
  ) {
    const property = await this.propertyRepo.findOne({
      where: { id: dto.property_id },
    });

    if (!property) {
      throw new NotFoundException(
        'Property not found',
      );
    }

    const lease = await this.leaseRepo.findOne({
      where: { id: dto.lease_id },
    });

    if (!lease) {
      throw new NotFoundException(
        'Lease not found',
      );
    }

    const inspection = this.inspectionRepo.create({
      ...dto,
      property,
      lease,
      createdBy: {
        id: userId,
      } as any,
    });

    return this.inspectionRepo.save(
      inspection,
    );
  }

  async findAll() {
    return this.inspectionRepo.find({
      relations: {
        property: true,
        lease: true,
      },
    });
  }

  async findOne(id: string) {
    const inspection =
      await this.inspectionRepo.findOne({
        where: { id },
        relations: {
          property: true,
          lease: true,
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
}