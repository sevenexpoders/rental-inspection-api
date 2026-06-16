import { Equals, IsBoolean, IsEmail, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsUUID()
  role_id!: string;


  @IsBoolean()
  @Equals(true, { message: 'You must accept the Terms & Conditions', })
  terms_accepted!: boolean;

  @IsOptional()
  @IsString()
  phone?: string;
}