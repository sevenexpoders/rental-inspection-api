import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Property } from './property.entity';
import { Inspection } from '../../inspections/entities/inspection.entity';

@Entity('leases')
export class Lease extends BaseEntity {

  @ManyToOne(() => Property, property => property.leases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date', nullable: true })
  end_date!: Date;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @OneToMany(() => Inspection, inspection => inspection.lease)
  inspections!: Inspection[];
}