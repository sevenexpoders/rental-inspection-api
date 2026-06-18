import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('user_fcm_tokens')
export class UserFcmToken {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', })
    user_id!: string;

    @Column({ type: 'text', })
    fcm_token!: string;

    @Column({ type: 'varchar', length: 255, nullable: true, })
    device_id?: string;

    @Column({ type: 'varchar', length: 255, nullable: true, })
    device_name?: string;

    @Column({type: 'varchar', length: 50, nullable: true, })
    device_type?: string;

    @CreateDateColumn()
    created_at!: Date;
}