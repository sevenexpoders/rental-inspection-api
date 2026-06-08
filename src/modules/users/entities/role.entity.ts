import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role extends BaseEntity {

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @ManyToMany(() => User, user => user.roles)
  users!: User[];
}