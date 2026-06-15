import {
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateInspectionSectionDto {
  @IsUUID()
  inspection_id!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsNumber()
  order_index?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}