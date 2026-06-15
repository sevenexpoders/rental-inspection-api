import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Repository,
} from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';

import { Lease } from './entities/lease.entity';
import { Property } from '../properties/entities/property.entity';

import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';

@Injectable()
export class LeasesService {
  constructor(
    @InjectRepository(Lease)
    private leaseRepo: Repository<Lease>,

    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  async create(
    dto: CreateLeaseDto,
    userId: string,
  ) {
    const property = await this.propertyRepo.findOne({
      where: {
        id: dto.property_id,
      },
    });

    if (!property) {
      throw new NotFoundException(
        'Property not found',
      );
    }

    const lease = this.leaseRepo.create({
      ...dto,
      property,
      createdBy: {
        id: userId,
      } as any,
    });

    return this.leaseRepo.save(lease);
  }

  async findAll() {
    return this.leaseRepo.find({
      relations: {
        property: true,
      },
    });
  }

  async findOne(id: string) {
    const lease = await this.leaseRepo.findOne({
      where: { id },
      relations: {
        property: true,
      },
    });

    if (!lease) {
      throw new NotFoundException(
        'Lease not found',
      );
    }

    return lease;
  }

  async update(
    id: string,
    dto: UpdateLeaseDto,
  ) {
    await this.leaseRepo.update(id, dto);

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.leaseRepo.softDelete(id);

    return {
      message: 'Lease deleted',
    };
  }
}