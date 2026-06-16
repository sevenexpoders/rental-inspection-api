import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('audit_logs')
export class AuditLog {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @Column({ type: 'varchar', length: 100 })
  entity_type!: string;

  @Column({ type: 'uuid' })
  entity_id!: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ type: 'jsonb', nullable: true })
  old_value?: any;

  @Column({ type: 'jsonb', nullable: true })
  new_value?: any;
}