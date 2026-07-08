import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  display_name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'active' })
  status!: string;

  @OneToMany(
    () => RolePermission,
    rp => rp.permission,
  )
  rolePermissions!: RolePermission[];
}