import { Entity, Column, ManyToMany, JoinTable, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from './role.entity';
import { RefreshToken } from '../../../modules/auth/entities/refresh-token.entity';

@Entity('users')
export class User extends BaseEntity {

  @Column({ type: 'varchar', length: 100 })
  first_name!: string;

  @Column({ type: 'varchar', length: 100 })
  last_name!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', unique: true })
  email_hash!: string;

  @Column({ type: 'varchar', unique: true })
  email_encrypted!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string;

  @Column({ type: 'text' })
  password_hash!: string;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  terms_accepted!: boolean;

 @Column({type: 'timestamptz', nullable: true,})
  terms_accepted_at?: Date | null;

  @OneToMany(() => RefreshToken, (t) => t.user)
  refreshTokens!: RefreshToken[];

  // RELATION: USER ↔ ROLES (MANY TO MANY)
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles!: Role[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deleted_by' })
  deletedBy?: User;
}