import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { PropertyParty } from './property-party.entity';
import { Lease } from './lease.entity';
import { Inspection } from '../../inspections/entities/inspection.entity';

@Entity('properties')
export class Property extends BaseEntity {

  @Column({ type: 'text' })
  address!: string;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @OneToMany(() => PropertyParty, party => party.property)
  parties!: PropertyParty[];

  @OneToMany(() => Lease, lease => lease.property)
  leases!: Lease[];

  @OneToMany(() => Inspection, inspection => inspection.property)
  inspections!: Inspection[];
}