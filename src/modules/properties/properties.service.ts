import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Repository,
  ILike,
} from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';

import { Property } from './entities/property.entity';

import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  async create(
    dto: CreatePropertyDto,
    userId: string,
  ) {
    const property = this.propertyRepo.create({
      ...dto,
      createdBy: {
        id: userId,
      } as any,
    });

    return this.propertyRepo.save(property);
  }

  async findAll(search?: string) {
    if (search) {
      return this.propertyRepo.find({
        where: [
          { city: ILike(`%${search}%`) },
          { address: ILike(`%${search}%`) },
        ],
      });
    }

    return this.propertyRepo.find();
  }

  async findOne(id: string) {
    const property = await this.propertyRepo.findOne({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException(
        'Property not found',
      );
    }

    return property;
  }

  async update(
    id: string,
    dto: UpdatePropertyDto,
  ) {
    await this.propertyRepo.update(id, dto);

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.propertyRepo.softDelete(id);

    return {
      message: 'Property deleted',
    };
  }
}