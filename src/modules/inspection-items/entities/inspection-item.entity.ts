import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

import { InspectionSection } from '../../inspection-sections/entities/inspection-section.entity';

@Entity('inspection_items')
export class InspectionItem extends BaseEntity {
  @ManyToOne(
    () => InspectionSection,
    section => section.items,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'section_id',
  })
  section!: InspectionSection;

  @Column({
    type: 'varchar',
    length: 100,
  })
  item_name!: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_clean!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_undamaged!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_working!: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  agent_comment?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  renter_comment?: string;
}