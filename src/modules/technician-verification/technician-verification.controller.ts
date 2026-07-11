import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { TechnicianVerificationService } from './technician-verification.service';
import { ROLES } from 'src/common/constants/roles.constant';
import { RolesGuard } from '../auth/guards';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerS3Options } from '../upload/upload.provider';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { multerVerificationOptions } from 'src/common/config/multer-verification.config';

@Controller('verification')
export class TechnicianVerificationController {
    constructor(
        private readonly technicianVerificationService: TechnicianVerificationService,
    ) { }

    @Get('document-types')
    @UseGuards(
        JwtAuthGuard,
        new RolesGuard([ROLES.TECHNICIAN]),
    )
    async getDocumentTypes() {
        return this.technicianVerificationService.getDocumentTypes();
    }

    @Post('upload')
    @UseGuards(
        JwtAuthGuard,
        new RolesGuard([ROLES.TECHNICIAN]),
    )
    @UseInterceptors(
        FileInterceptor('file', multerVerificationOptions),
    )
    async uploadDocument(
        @Body() dto: UploadDocumentDto,
        @UploadedFile() file: Express.MulterS3.File,
        @CurrentUser() user: any,
    ) {
        return this.technicianVerificationService.uploadDocument(
            dto,
            file,
            user.userId,
        );
    }

    @Get('my-documents')
    @UseGuards(
        JwtAuthGuard,
        new RolesGuard([ROLES.TECHNICIAN]),
    )
    async getMyDocuments(
        @CurrentUser() user: any,
    ) {
        return await this.technicianVerificationService.getMyDocuments(
            user.userId,
        );
    }

    @Post('submit')
    @UseGuards(
        JwtAuthGuard,
        new RolesGuard([ROLES.TECHNICIAN]),
    )
    async submitVerification(
        @CurrentUser() user: any,
    ) {
        return await this.technicianVerificationService.submitVerification(
            user.userId,
        );
    }

    @Get('status')
    @UseGuards(
        JwtAuthGuard,
        new RolesGuard([ROLES.TECHNICIAN]),
    )
    async getVerificationStatus(
        @CurrentUser() user: any,
    ) {
        return await this.technicianVerificationService.getVerificationStatus(
            user.userId,
        );
    }

    @Delete('documents/:documentId')
    @UseGuards(
        JwtAuthGuard,
        new RolesGuard([ROLES.TECHNICIAN]),
    )
    async deleteDocument(
        @Param('documentId') documentId: string,
        @CurrentUser() user: any,
    ) {
        return this.technicianVerificationService.deleteDocument(
            documentId,
            user.userId,
        );
    }
}