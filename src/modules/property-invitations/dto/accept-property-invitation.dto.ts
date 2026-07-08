import { IsNotEmpty, IsUUID } from 'class-validator';

export class AcceptPropertyInvitationDto {

    @IsUUID()
    @IsNotEmpty()
    token!: string;

}