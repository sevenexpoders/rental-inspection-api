import { Status } from '../../../common/enum/status';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('inspection_types')
export class InspectionType {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 200 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    subtitle?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image?: string;

    @Column({ type: 'varchar', length: 20, default: 'yes_no', })
    input_type!: string;

    @Column({ type: 'enum', enum: Status, default: Status.ACTIVE, })
    status!: Status;

    @Column({ type: 'int', default: 0 })
    order_index!: number;

    @Column({ type: 'uuid', nullable: true })
    created_by?: string;

    @Column({ type: 'uuid', nullable: true })
    updated_by?: string;

    @Column({ type: 'uuid', nullable: true })
    deleted_by?: string;

    @Column({ type: 'timestamptz', default: () => 'NOW()' })
    created_at!: Date;

    @Column({ type: 'timestamptz', default: () => 'NOW()' })
    updated_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    deleted_at?: Date;
}