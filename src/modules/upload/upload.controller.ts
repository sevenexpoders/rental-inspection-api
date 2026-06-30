import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UploadFileDto } from './dto/upload-file.dto';
import { multerS3Options } from './upload.provider';
import { UploadService } from './upload.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('single')
  @UseInterceptors(FileInterceptor('file', multerS3Options))
  async uploadSingle(@Body() dto: UploadFileDto, @UploadedFile() file: Express.MulterS3.File,) {
    if (!file || !file.location) {
      throw new BadRequestException('File not uploaded.');
    }
    const fileUrl = file?.key;
    return await this.uploadService.UploadsSingalFile(dto, fileUrl);
  }


  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, multerS3Options),)
  async uploadMultiple(
    @Body() dto: UploadFileDto,
    @UploadedFiles() files: Express.MulterS3.File[],
    @CurrentUser() user: any
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files not uploaded.');
    }

    const fileUrls = files.map((file) => file.key);

    return await this.uploadService.uploadMultipleFiles(dto, fileUrls, user.userId);
  }

}