import { Role } from 'src/modules/lookup/entities';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
 

@Entity('property_invitations')
export class PropertyInvitation {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'uuid',
    })
    property_id!: string;

    @Column({
        length: 255,
    })
    email!: string;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @Column({
        type: 'uuid',
    })
    role_id!: string;

    @Column({
        type: 'uuid',
    })
    invited_by_user_id!: string;

    @Column({
        type: 'uuid',
        nullable: true,
    })
    accepted_by_user_id?: string;

    @Column({
        type: 'uuid',
        unique: true,
    })
    token!: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    message?: string;

    @Column({
        length: 20,
        default: 'PENDING',
    })
    status!: string;

    @Column({
        type: 'timestamp',
    })
    expires_at!: Date;

    @Column({
        type: 'timestamp',
        nullable: true,
    })
    accepted_at?: Date;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @DeleteDateColumn()
    deleted_at?: Date;

}