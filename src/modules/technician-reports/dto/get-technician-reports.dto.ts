import {
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetTechnicianReportsDto {
  @IsOptional()
  @IsNumberString()
  page = '1';

  @IsOptional()
  @IsNumberString()
  limit = '10';

  @IsOptional()
  @IsString()
  search?: string;
}