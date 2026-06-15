import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

@Entity('leases')
export class Lease extends BaseEntity {
  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @Column({
    type: 'date',
  })
  start_date!: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  end_date?: Date;

  @Column({
    default: 'active',
  })
  status!: string;

  @Column({
    nullable: true,
  })
  lease_number?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;
}