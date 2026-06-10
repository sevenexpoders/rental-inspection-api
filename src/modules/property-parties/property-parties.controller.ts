import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { PropertyPartiesService } from './property-parties.service';

import { CreatePropertyPartyDto } from './dto/create-property-party.dto';

@Controller('property-parties')
@UseGuards(JwtAuthGuard)
export class PropertyPartiesController {
  constructor(
    private readonly propertyPartiesService: PropertyPartiesService,
  ) {}

  @Post()
  create(
    @Body() dto: CreatePropertyPartyDto,
  ) {
    return this.propertyPartiesService.create(dto);
  }

  @Get('property/:propertyId')
  findByProperty(
    @Param('propertyId') propertyId: string,
  ) {
    return this.propertyPartiesService.findByProperty(
      propertyId,
    );
  }

  @Patch(':id/deactivate')
  deactivate(
    @Param('id') id: string,
  ) {
    return this.propertyPartiesService.deactivate(id);
  }
}