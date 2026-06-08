import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Property } from '../../properties/entities/property.entity';
import { Lease } from '../../properties/entities/lease.entity';
import { User } from '../../users/entities/user.entity';
import { InspectionSection } from './inspection-section.entity';

@Entity('inspections')
export class Inspection extends BaseEntity {

  @ManyToOne(() => Property, property => property.inspections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @ManyToOne(() => Lease, lease => lease.inspections, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'lease_id' })
  lease!: Lease;

  @Column({ type: 'timestamp' })
  inspection_date!: Date;

  @Column({ type: 'date', nullable: true })
  agreement_start_date!: Date;

  @Column({ type: 'date', nullable: true })
  report_return_date!: Date;

  @Column({ type: 'varchar', default: 'draft' })
  status!: string; // draft | in_progress | completed | approved

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @OneToMany(() => InspectionSection, section => section.inspection)
  sections!: InspectionSection[];
}