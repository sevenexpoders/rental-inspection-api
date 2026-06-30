import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities';
import { InspectionItemMedia } from '../inspections/entities';



@Module({
    imports: [TypeOrmModule.forFeature([User , InspectionItemMedia])],
    controllers: [UploadController],
    providers: [UploadService],
})
export class UploadModule { }