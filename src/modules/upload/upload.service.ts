import { Injectable } from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities';
import { InspectionItemMedia } from '../inspections/entities';

@Injectable()
export class UploadService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(InspectionItemMedia)
        private mediaRepo: Repository<InspectionItemMedia>,
    ) { }

    async UploadsSingalFile(
        dto: UploadFileDto,
        fileUrl: string,
    ): Promise<boolean> {

        return true;
    }

    async uploadMultipleFiles(dto: UploadFileDto, fileUrls: string[], userId: string) {

        const mediaRecords = fileUrls.map((fileUrl) =>
            this.mediaRepo.create({
                inspection_item_id: dto.id,
                file_url: fileUrl,
                created_by: userId,
            }),
        );
        const savedMedia = await this.mediaRepo.save(mediaRecords);

        return {
            message: 'Files uploaded successfully',
            data: savedMedia,
        };
    }
}
