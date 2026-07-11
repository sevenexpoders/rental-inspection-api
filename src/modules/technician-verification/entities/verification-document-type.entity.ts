import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { TechnicianVerificationDocument } from './technician-verification-document.entity';

@Entity('verification_document_types')
export class VerificationDocumentType extends BaseEntity {

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'int' })
  points!: number;

  @Column({ type: 'boolean', default: false })
  is_primary!: boolean;

  @Column({ type: 'boolean', default: false })
  requires_name!: boolean;

  @Column({ type: 'boolean', default: false })
  requires_photo!: boolean;

  @Column({ type: 'boolean', default: false })
  requires_address!: boolean;

  @Column({ type: 'boolean', default: false })
  requires_signature!: boolean;

  @Column({ type: 'int', default: 1 })
  display_order!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @OneToMany(
    () => TechnicianVerificationDocument,
    document => document.documentType,
  )
  documents!: TechnicianVerificationDocument[];
}