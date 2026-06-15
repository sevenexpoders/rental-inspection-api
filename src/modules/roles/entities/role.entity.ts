import {
  Entity,
  Column,
  ManyToMany,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({
    unique: true,
  })
  name!: string;

  @ManyToMany(
    () => User,
    user => user.roles,
  )
  users!: User[];
}