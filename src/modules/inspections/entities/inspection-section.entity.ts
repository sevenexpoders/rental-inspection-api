import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Inspection } from './inspection.entity';
import { InspectionItem } from './inspection-item.entity';

@Entity('inspection_sections')
export class InspectionSection extends BaseEntity {

  @ManyToOne(() => Inspection, inspection => inspection.sections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inspection_id' })
  inspection!: Inspection;

  @Column({ type: 'varchar', length: 100 })
  name!: string; // Kitchen, Bathroom, etc.

  @Column({ type: 'int', default: 0 })
  order_index!: number;

  @OneToMany(() => InspectionItem, item => item.section)
  items!: InspectionItem[];
}