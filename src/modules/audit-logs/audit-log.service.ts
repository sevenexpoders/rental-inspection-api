import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async logAudit(
    userId: string,
    entityType: string,
    entityId: string,
    action: string,
    oldValue?: any,
    newValue?: any,
  ) {
    return this.auditRepo.save({
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      old_value: oldValue,
      new_value: newValue,
    });
  }
}