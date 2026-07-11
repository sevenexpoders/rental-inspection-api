import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class UploadDocumentDto {
  @IsUUID()
  document_type_id!: string;

  @IsOptional()
  @IsString()
  document_number?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;
}