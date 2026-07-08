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

    @IsString()
    @IsNotEmpty()
    roleType!: string;

    @IsOptional()
    @IsString()
    message?: string;

}