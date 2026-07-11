import { IsOptional, IsString } from 'class-validator';

export class GetVerificationsDto {
  @IsOptional()
  @IsString()
  status?: string;
}