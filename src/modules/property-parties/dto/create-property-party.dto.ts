import {
  IsUUID,
  IsEnum,
} from 'class-validator';
import { PropertyPartyRole } from '../../../common/enum';



export class CreatePropertyPartyDto {
  @IsUUID()
  property_id!: string;

  @IsUUID()
  user_id!: string;

  @IsEnum(PropertyPartyRole)
  role_type!: PropertyPartyRole;
}