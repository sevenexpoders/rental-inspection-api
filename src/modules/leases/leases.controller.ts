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

import { LeasesService } from './leases.service';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { CreateLeaseDto } from './dto/create-lease.dto';
import { UpdateLeaseDto } from './dto/update-lease.dto';

@Controller('leases')
@UseGuards(JwtAuthGuard)
export class LeasesController {
  constructor(
    private readonly leasesService: LeasesService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateLeaseDto,
    @CurrentUser() user: any,
  ) {
    return this.leasesService.create(
      dto,
      user.userId,
    );
  }

  @Get()
  findAll() {
    return this.leasesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.leasesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLeaseDto,
  ) {
    return this.leasesService.update(
      id,
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.leasesService.remove(id);
  }
}