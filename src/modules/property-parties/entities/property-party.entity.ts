import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Property } from '../../properties/entities/property.entity';
import { User } from '../../users/entities/user.entity';

@Entity('property_parties')
export class PropertyParty extends BaseEntity {
  @ManyToOne(() => Property)
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'varchar',
    length: 20,
  })
  role_type!: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  lease_id?: string;

  @Column({
    default: true,
  })
  is_active!: boolean;
}