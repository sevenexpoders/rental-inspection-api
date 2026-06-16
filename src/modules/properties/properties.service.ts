import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Repository,
  ILike,
  Brackets
} from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';

import { Property } from './entities/property.entity';

import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Status } from '../../common/enum/status';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { AuditAction } from 'src/common/enum/audit-action.enum';
import { TableName } from 'src/common/enum/table-name.enum';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
    private readonly auditLogService: AuditLogService,
  ) { }

  async create(dto: CreatePropertyDto, userId: string) {
    try {
      const property = this.propertyRepo.create({
        ...dto,
        created_by: userId,
        user_id: userId,
      });

      const savedProperty = await this.propertyRepo.save(property);

      await this.auditLogService.logAudit(
        userId,
        TableName.PROPERTIES,
        savedProperty.id,
        AuditAction.CREATE,
        null,
        savedProperty,
      );
      return savedProperty;
    } catch (error) {
      console.log("error==>", error);
      throw error;
    }
  }

  async findAll(userId: string, search?: string) {

    const qb = this.propertyRepo.createQueryBuilder('property');

    qb.leftJoinAndSelect('property.city', 'city')
      .leftJoinAndSelect('property.state', 'state')
      .leftJoinAndSelect('property.propertyType', 'propertyType');

    qb.where('property.user_id = :userId', { userId });

    if (search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('property.address ILIKE :search', { search: `%${search}%` })
            .orWhere('property.city ILIKE :search', { search: `%${search}%` })
            .orWhere('property.state ILIKE :search', { search: `%${search}%` })
            .orWhere('property.country ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const result = await qb.getMany();
    return result;
    // if (search) {
    //   return this.propertyRepo.find({
    //     where: [
    //       { address: ILike(`%${search}%`) },
    //       { city: ILike(`%${search}%`) },
    //       { state: ILike(`%${search}%`) },
    //       { country: ILike(`%${search}%`) },
    //     ],
    //   });
    // }


    // return this.propertyRepo.find();
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
    userId: string
  ) {
    const propertyOld = await this.propertyRepo.findOne({ where: { id } });

    await this.propertyRepo.update(id, dto);
    const propertyNew = this.findOne(id)

    await this.auditLogService.logAudit(
      userId,
      TableName.PROPERTIES,
      id,
      AuditAction.UPDATE,
      propertyOld,
      propertyNew,
    );
    return propertyNew;
  }

  async remove(userId: string, id: string) {

    const property = await this.propertyRepo.findOne({ where: { id } });

    if (!property) return;

    property.deleted_by = userId;
    property.status = Status.DELETED;

    await this.propertyRepo.softRemove(property);
    //await this.propertyRepo.softDelete(id);

    return {
      message: 'Property deleted',
    };
  }
}