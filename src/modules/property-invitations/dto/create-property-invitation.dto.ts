import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class CreatePropertyInvitationDto {

    @IsUUID()
    @IsNotEmpty()
    propertyId!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsUUID()
    @IsNotEmpty()
    roleId!: string;

    @IsOptional()
    @IsString()
    message?: string;

}