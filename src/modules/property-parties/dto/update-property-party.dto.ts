import { IsBoolean } from 'class-validator';

export class UpdatePropertyPartyDto {
  @IsBoolean()
  is_active!: boolean;
}