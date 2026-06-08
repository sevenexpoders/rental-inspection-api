import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Inspection } from './inspection.entity';
import { User } from '../../users/entities/user.entity';

@Entity('signatures')
export class Signature extends BaseEntity {

  @ManyToOne(() => Inspection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inspection_id' })
  inspection!: Inspection;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text' })
  signature_url!: string;

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  signed_at!: Date;

  @Column({ type: 'varchar', nullable: true })
  ip_address!: string;
}