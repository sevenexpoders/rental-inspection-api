import { User } from '../../../modules/users/entities';
import { Status } from '../../../common/enum/status';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    OneToMany,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, length: 100, })
    name!: string;

    @Column({ nullable: true, type: 'text', })
    description?: string;

    @Column({ nullable: true, length: 100, })
    icon_name?: string;

    @Column({ type: 'enum', enum: Status, default: Status.ACTIVE, })
    status!: Status;

    @Column({ type: 'integer', default: 0, })
    order_index!: number;

    @Column({ nullable: true, length: 100, })
    display_name?: string;

    @ManyToMany(() => User, user => user.roles)
    users!: User[];

    @OneToMany(() => RolePermission, rp => rp.role,)
    rolePermissions!: RolePermission[];
}