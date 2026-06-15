import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

import { Inspection } from '../../inspections/entities/inspection.entity'; 
import { InspectionItem } from 'src/modules/inspections/entities/inspection-item.entity';

@Entity('inspection_sections')
export class InspectionSection extends BaseEntity {
  @ManyToOne(
    () => Inspection,
    inspection => inspection.sections,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'inspection_id',
  })
  inspection!: Inspection;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @Column({
    default: 0,
  })
  order_index!: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes?: string;

  @OneToMany(
    () => InspectionItem,
    item => item.section,
  )
  items!: InspectionItem[];
}