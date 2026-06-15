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

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { InspectionsService } from './inspections.service';

import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';

@Controller('inspections')
@UseGuards(JwtAuthGuard)
export class InspectionsController {
  constructor(
    private readonly inspectionsService: InspectionsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateInspectionDto,
    @CurrentUser() user: any,
  ) {
    return this.inspectionsService.create(
      dto,
      user.userId,
    );
  }

  @Get()
  findAll() {
    return this.inspectionsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.inspectionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInspectionDto,
  ) {
    return this.inspectionsService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.inspectionsService.remove(id);
  }
}