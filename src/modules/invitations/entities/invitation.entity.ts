import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../lookup/entities/role.entity';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('invitations')
export class Invitation extends BaseEntity {

  @Column({
    type: 'varchar',
    length: 255,
  })
  email!: string;

  @Column({
    type: 'uuid',
  })
  invited_role_id!: string;

  @Column({
    type: 'uuid',
  })
  invited_by_user_id!: string;

  @Column({
    type: 'uuid',
  })
  token!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  message?: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status!: InvitationStatus;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  accepted_by_user_id?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  accepted_at?: Date;

  @Column({
    type: 'timestamp',
  })
  expires_at!: Date;

  @ManyToOne(() => Role)
  @JoinColumn({
    name: 'invited_role_id',
  })
  invitedRole!: Role;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'invited_by_user_id',
  })
  invitedBy!: User;

  @ManyToOne(() => User, {
    nullable: true,
  })
  @JoinColumn({
    name: 'accepted_by_user_id',
  })
  acceptedBy?: User;
}