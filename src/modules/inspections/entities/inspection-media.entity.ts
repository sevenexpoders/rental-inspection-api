import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Inspection } from './inspection.entity';
import { User } from '../../users/entities/user.entity';

@Entity('inspection_media')
export class InspectionMedia extends BaseEntity {

  @ManyToOne(() => Inspection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inspection_id' })
  inspection!: Inspection;

  @Column({ type: 'uuid', nullable: true })
  section_id!: string;

  @Column({ type: 'uuid', nullable: true })
  item_id!: string;

  @Column({ type: 'text' })
  file_url!: string;

  @Column({ type: 'varchar', default: 'photo' })
  media_type!: string; // photo | video

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy!: User;
}