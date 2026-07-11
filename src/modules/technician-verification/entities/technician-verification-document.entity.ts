import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';

import { TechnicianVerification } from './technician-verification.entity';
import { VerificationDocumentType } from './verification-document-type.entity';

@Entity('technician_verification_documents')
export class TechnicianVerificationDocument extends BaseEntity {

  @Column({ type: 'uuid' })
  verification_id!: string;

  @Column({ type: 'uuid' })
  document_type_id!: string;

  @Column({ type: 'text' })
  file_url!: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  document_number?: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  expiry_date?: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'uploaded',
  })
  status!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  remarks?: string;

  @ManyToOne(
    () => TechnicianVerification,
    verification => verification.documents,
  )
  @JoinColumn({ name: 'verification_id' })
  verification!: TechnicianVerification;

  @ManyToOne(
    () => VerificationDocumentType,
    documentType => documentType.documents,
  )
  @JoinColumn({ name: 'document_type_id' })
  documentType!: VerificationDocumentType;
}