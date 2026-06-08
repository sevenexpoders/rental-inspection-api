import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Property } from './property.entity';
import { User } from '../../users/entities/user.entity';

@Entity('property_parties')
export class PropertyParty extends BaseEntity {

  @ManyToOne(() => Property, property => property.parties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 20 })
  role_type!: string; // landlord | agent | renter

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'uuid', nullable: true })
  lease_id!: string;
}