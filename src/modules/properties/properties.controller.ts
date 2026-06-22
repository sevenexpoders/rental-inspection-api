import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { CreatePropertyDto, UpdatePropertyDto } from './dto';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
  ) { }

  @Post()
  create(
    @Body() dto: CreatePropertyDto,
    @CurrentUser() user: any,
  ) {
    return this.propertiesService.create(
      dto,
      user.userId,
    );
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,

  ) {
    return await this.propertiesService.findAll(user.userId, search, Number(page),
      Number(limit),);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: any,
  ) {
    return this.propertiesService.update(
      id,
      dto,
      user.userId
    );
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.propertiesService.remove(user.userId, id);
  }
}