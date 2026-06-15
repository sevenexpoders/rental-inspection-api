import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { InspectionSectionsService } from './inspection-sections.service';

import { CreateInspectionSectionDto } from './dto/create-inspection-section.dto';
import { UpdateInspectionSectionDto } from './dto/update-inspection-section.dto';

@Controller('inspection-sections')
@UseGuards(JwtAuthGuard)
export class InspectionSectionsController {
  constructor(
    private readonly service: InspectionSectionsService,
  ) {}

  @Post()
  create(
    @Body()
    dto: CreateInspectionSectionDto,
  ) {
    return this.service.create(dto);
  }

  @Get('inspection/:inspectionId')
  findByInspection(
    @Param('inspectionId')
    inspectionId: string,
  ) {
    return this.service.findByInspection(
      inspectionId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateInspectionSectionDto,
  ) {
    return this.service.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.service.remove(id);
  }
}