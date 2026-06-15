import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

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

   @IsIn([
    'landlord',
    'property_manager',
    'technician'
  ])
  role!: string;
}