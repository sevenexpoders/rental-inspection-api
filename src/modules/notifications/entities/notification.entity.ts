import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @Column()
  title!: string;

  @Column('text')
  message!: string;

  @Column()
  type!: string;

  @Column({
    nullable: true,
  })
  reference_type?: string;

  @Column({
    default: false,
  })
  is_read!: boolean;

  @Column({
    nullable: true,
  })
  read_at?: Date;

  @CreateDateColumn()
  created_at!: Date;
}