import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { TechnicianVerificationDocument } from './technician-verification-document.entity';

@Entity('technician_verifications')
export class TechnicianVerification extends BaseEntity {

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'int', default: 0 })
  total_points!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status!: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  submitted_at?: Date | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  verified_at?: Date;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  verified_by?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  remarks?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy?: User;

  @OneToMany(
    () => TechnicianVerificationDocument,
    document => document.verification,
  )
  documents!: TechnicianVerificationDocument[];
}