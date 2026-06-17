import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Lease } from './lease.entity';
import { PropertyParty } from './property-party.entity';
import { Inspection } from 'src/modules/inspections/entities/inspection.entity';
import { PropertyType } from 'src/modules/lookup/entities/property-type.entity';
import { State } from '../../../modules/lookup/entities/state.entity';
import { City } from '../../../modules/lookup/entities/city.entity';
import { Status } from 'src/common/enum/status';

@Entity('properties')
export class Property extends BaseEntity {

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'uuid', nullable: true })
  city_id?: string;

  @Column({ type: 'uuid', nullable: true })
  state_id?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;


  @Column({ type: 'uuid', nullable: true })
  property_type_id?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  house_unit_no?: string;

  @Column({ type: 'int', nullable: true })
  beds?: number;

  @Column({ type: 'int', nullable: true })
  baths?: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  owner_name?: string;

  @Column({ type: 'text', nullable: true })
  owner_email?: string;

  @Column({ type: 'text', nullable: true })
  owner_phone?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;


  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by?: string;

  @Column({ type: 'uuid', nullable: true })
  deleted_by?: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @Column({ type: 'enum', enum: Status, default: Status.ACTIVE, })
  status!: Status;

  @OneToMany(() => Lease, lease => lease.property)
  leases!: Lease[];

  @OneToMany(() => PropertyParty, party => party.property)
  parties!: PropertyParty[];

  @OneToMany(() => Inspection, inspection => inspection.property)
  inspections!: Inspection[];


  @ManyToOne(() => City, { nullable: true })
  @JoinColumn({ name: 'city_id' })
  city!: City;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'state_id' })
  state!: State;

  @ManyToOne(() => PropertyType)
  @JoinColumn({ name: 'property_type_id' })
  propertyType!: PropertyType;
}