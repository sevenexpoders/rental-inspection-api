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
import { AuditAction } from '../../common/enum/audit-action.enum';
import { TableName } from '../../common/enum/table-name.enum';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { PropertyHelper } from '../../common/helpers/property.helper';
import { InspectionStatus } from 'src/common/enum/inspection-status.enum';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
    private readonly auditLogService: AuditLogService,
  ) { }

  async create(dto: CreatePropertyDto, userId: string) {
    try {

      if (dto.owner_email) {
        dto.owner_email = CryptoUtil.encrypt(
          dto.owner_email.toLowerCase().trim(),
        );
      }

      if (dto.owner_phone) {
        dto.owner_phone = CryptoUtil.encrypt(
          dto.owner_phone.trim(),
        );
      }

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
    try {


      const qb = this.propertyRepo.createQueryBuilder('property');

      qb.leftJoinAndSelect('property.city', 'city')
        .leftJoinAndSelect('property.state', 'state')
        .leftJoinAndSelect('property.propertyType', 'propertyType')
        .leftJoin(
          (subQuery) => {
            return subQuery
              .select('i.property_id', 'property_id')
              .addSelect('i.status', 'status')
              .addSelect(
                'ROW_NUMBER() OVER (PARTITION BY i.property_id ORDER BY i.created_at DESC)',
                'rn',
              )
              .from('inspections', 'i')
              .where('i.deleted_at IS NULL');
          },
          'inspection',
          'inspection.property_id = property.id AND inspection.rn = 1',
        )
        .addSelect('inspection.status', 'inspection_status');

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
      
      const { entities, raw } = await qb.getRawAndEntities();
      return entities.map((property, index) => ({
        ...PropertyHelper.decrypt(property),
        inspection_status: raw[index]?.inspection_status ?? InspectionStatus.IN_PROGRESS,

      }));
    } catch (error) {
      console.log("error==>", error);
      throw error;
    }
  }

  async findOne(id: string) {
    const property = await this.propertyRepo.findOne({
      where: { id, status: Status.ACTIVE },
    });

    if (!property) {
      throw new NotFoundException(
        'Property not found',
      );
    }
    return PropertyHelper.decrypt(property);
  }

  async update(
    id: string,
    dto: UpdatePropertyDto,
    userId: string
  ) {
    const propertyOld = await this.propertyRepo.findOne({ where: { id } });

    if (!propertyOld) {
      throw new NotFoundException('Property not found');
    }
    if (dto.owner_email) {
      dto.owner_email = CryptoUtil.encrypt(
        dto.owner_email.toLowerCase().trim(),
      );
    }

    if (dto.owner_phone) {
      dto.owner_phone = CryptoUtil.encrypt(
        dto.owner_phone.trim(),
      );
    }
    await this.propertyRepo.update(id, dto);
    const propertyNew = await this.findOne(id)

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