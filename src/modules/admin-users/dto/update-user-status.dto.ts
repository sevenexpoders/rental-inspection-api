import {
  IsEnum,
} from 'class-validator';

import { Status } from '../../../common/enum/status';

export class UpdateUserStatusDto {

  @IsEnum(Status)
  status!: Status;

}