import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  fcm_token!: string;

  @IsOptional()
  @IsString()
  device_id!: string;

  @IsOptional()
  @IsString()
  device_name!: string;

  @IsOptional()
  @IsString()
  device_type!: string;
}