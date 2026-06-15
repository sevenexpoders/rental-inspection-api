import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInspectionDto {
  @IsUUID()
  property_id!: string;

  @IsUUID()
  lease_id!: string;

  @IsDateString()
  inspection_date!: Date;

  @IsOptional()
  @IsDateString()
  agreement_start_date?: Date;

  @IsOptional()
  @IsDateString()
  report_return_date?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}