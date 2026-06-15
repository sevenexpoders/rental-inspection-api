import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLeaseDto {
  @IsUUID()
  property_id!: string;

  @IsDateString()
  start_date!: Date;

  @IsOptional()
  @IsDateString()
  end_date?: Date;

  @IsOptional()
  @IsString()
  lease_number?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}