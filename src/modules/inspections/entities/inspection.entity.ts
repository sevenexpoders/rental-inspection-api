import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('inspections')
export class Inspection extends BaseEntity {

  @Column({ type: 'uuid' })
  property_id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 20,  default: 'draft',})
  status!: string;

  @Column({type: 'timestamp',nullable: true,})
  completed_at?: Date;

  
  @Column({ type: 'uuid', nullable: true,})
  created_by?: string;

  @Column({type: 'uuid',nullable: true, })
  updated_by?: string;

  @Column({ type: 'uuid',nullable: true,})
  deleted_by?: string;

  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}