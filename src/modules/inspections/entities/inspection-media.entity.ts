import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InspectionItem } from './inspection-item.entity';

@Entity('inspection_item_media')
export class InspectionItemMedia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  inspection_item_id!: string;

  @Column({ type: 'varchar', length: 500, nullable: true, })
  file_name?: string;

  @Column({ type: 'text', nullable: true, })
  file_url?: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'uuid', nullable: true, })
  created_by?: string;

  @ManyToOne(() => InspectionItem, (inspectionItem) => inspectionItem.media, { onDelete: 'CASCADE', },)
  @JoinColumn({ name: 'inspection_item_id', })
  inspectionItem!: InspectionItem;
}