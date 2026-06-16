import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';


export class CreatePropertyDto {
  @IsString()
  address!: string;

  @IsOptional()
  @IsUUID()
  state_id?: string;

  @IsOptional()
  @IsUUID()
  city_id?: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsOptional()
  @IsUUID()
  property_type_id?: string;

  @IsOptional()
  @IsString()
  house_unit_no?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  beds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  baths?: number;

  @IsOptional()
  @IsString()
  owner_name?: string;

  @IsOptional()
  @IsEmail()
  owner_email?: string;

  @IsOptional()
  @IsString()
  owner_phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  country?: string;
}



