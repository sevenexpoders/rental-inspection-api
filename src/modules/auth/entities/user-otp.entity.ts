import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('user_otps')
export class UserOtp {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ length: 10 })
  otp!: string;

  @Column({ length: 30 })
  type!: string;

  @Column({ default: false })
  is_used!: boolean;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  used_at?: Date;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  created_by?: string;
}