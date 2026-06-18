import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInspectionDto {
  @IsUUID()
  property_id!: string;
  items!: SaveInspectionItemDto[];
}

export class SaveInspectionItemDto {
  @IsUUID()
  inspection_type_id!: string;

  @IsString()
  answer!: string;

  @IsString()
  note!: string;
  // media?: CreateInspectionMediaDto[];
}

export class CreateInspectionMediaDto {
  fileName!: string;
  fileUrl!: string;
}