import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import {
  Repository,
} from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';

import { PropertyParty } from './entities/property-party.entity';
import { Property } from '../properties/entities/property.entity';
import { User } from '../users/entities/user.entity';

import { CreatePropertyPartyDto } from './dto/create-property-party.dto';

@Injectable()
export class PropertyPartiesService {
  constructor(
    @InjectRepository(PropertyParty)
    private partyRepo: Repository<PropertyParty>,

    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreatePropertyPartyDto) {
    const property = await this.propertyRepo.findOne({
      where: { id: dto.property_id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const user = await this.userRepo.findOne({
      where: { id: dto.user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const exists = await this.partyRepo.findOne({
      where: {
        property: { id: dto.property_id },
        user: { id: dto.user_id },
        role_type: dto.role_type,
      },
      relations: {
        property: true,
        user: true,
      },
    });

    if (exists) {
      throw new ConflictException(
        'Party already assigned',
      );
    }

    const party = this.partyRepo.create({
      property,
      user,
      role_type: dto.role_type,
      is_active: true,
    });

    return this.partyRepo.save(party);
  }

  async findByProperty(propertyId: string) {
    return this.partyRepo.find({
      where: {
        property: {
          id: propertyId,
        },
      },
      relations: {
        property: true,
        user: true,
      },
    });
  }

  async deactivate(id: string) {
    const party = await this.partyRepo.findOne({
      where: { id },
    });

    if (!party) {
      throw new NotFoundException(
        'Property party not found',
      );
    }

    party.is_active = false;

    return this.partyRepo.save(party);
  }
}