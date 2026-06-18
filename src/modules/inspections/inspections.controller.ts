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
import { SaveInspectionItemDto } from './dto/create-inspection.dto';
@Controller('inspections')
@UseGuards(JwtAuthGuard)
export class InspectionsController {
  constructor(
    private readonly inspectionsService: InspectionsService,
  ) { }


  @Get('start/:property_id')
  async start(@CurrentUser() user: any, @Param('property_id') property_id: string,) {
    return await this.inspectionsService.startInspection(
      property_id,
      user.userId,
    );
  }

  @Post(':inspection_id/items')
  async saveInspectionItem(@Param('inspection_id') inspection_id: string, @Body() dto: SaveInspectionItemDto, @CurrentUser() user: any,) {

    return await this.inspectionsService.saveInspectionItem(
      inspection_id,
      dto,
      user.userId
    );
  }

  @Get()
  findAll() {
    return this.inspectionsService.findAll();
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.inspectionsService.remove(id);
  }
}