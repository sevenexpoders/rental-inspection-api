import { PartialType } from '@nestjs/mapped-types';
import { CreateInspectionSectionDto } from './create-inspection-section.dto';

export class UpdateInspectionSectionDto extends PartialType(
  CreateInspectionSectionDto,
) {}