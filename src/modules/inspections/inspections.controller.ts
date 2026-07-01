import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { InspectionsService } from './inspections.service';
import { SaveInspectionItemDto } from './dto/create-inspection.dto';
import { multerS3Options } from '../upload/upload.provider';
import { FilesInterceptor } from '@nestjs/platform-express';
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

  // @Post(':inspection_id/items')
  // async saveInspectionItem(@Param('inspection_id') inspection_id: string, @Body() dto: SaveInspectionItemDto, @CurrentUser() user: any,) {

  //   return await this.inspectionsService.saveInspectionItem(
  //     inspection_id,
  //     dto,
  //     user.userId
  //   );
  // }

  @Post(':inspection_id/items')
@UseInterceptors(
  FilesInterceptor('files', 10, multerS3Options),
)
async saveInspectionItem(
  @Param('inspection_id') inspectionId: string,
  @Body() dto: SaveInspectionItemDto,
  @UploadedFiles() files: Express.MulterS3.File[],
  @CurrentUser() user: any,
) {
  return await this.inspectionsService.saveInspectionItem(
    inspectionId,
    dto,
    files,
    user.userId,
  );
}

  @Patch(':inspection_id/complete')
  async completeInspection(@Param('inspection_id') inspection_id: string, @CurrentUser() user: any,) {
    return await this.inspectionsService.completeInspection(inspection_id, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user: any,) {
    return this.inspectionsService.findAll(user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.inspectionsService.remove(id);
  }
}