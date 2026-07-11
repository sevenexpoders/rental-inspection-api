import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicianVerification } from './entities/technician-verification.entity';
import { TechnicianVerificationDocument } from './entities/technician-verification-document.entity';
import { User } from '../users/entities';
import { VerificationDocumentType } from './entities/verification-document-type.entity';
import { TechnicianVerificationService } from './technician-verification.service';
import { TechnicianVerificationController } from './technician-verification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TechnicianVerification,   
      TechnicianVerificationDocument,
      VerificationDocumentType,
      User,
    ]),
  ],
  controllers: [TechnicianVerificationController],
  providers: [TechnicianVerificationService],
  exports: [TechnicianVerificationService],
})
export class TechnicianVerificationModule {}