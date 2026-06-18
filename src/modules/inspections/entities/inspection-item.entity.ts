import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { InspectionItemMedia } from './inspection-media.entity';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('inspection_items')
export class InspectionItem extends BaseEntity {

  @Column({ type: 'uuid' })
  inspection_id!: string;

  @Column({ type: 'uuid' })
  inspection_type_id!: string;

  @Column({ type: 'varchar', length: 400, nullable: true, })
  answer?: string;

  @Column({ type: 'text', nullable: true, })
  note?: string;


  @Column({ type: 'uuid', nullable: true, })
  created_by?: string;

  @Column({ type: 'uuid', nullable: true, })
  updated_by?: string;

  @Column({type: 'uuid',nullable: true,})
  deleted_by?: string;

  @OneToMany(() => InspectionItemMedia, (media) => media.inspectionItem,)
  media!: InspectionItemMedia[];
}