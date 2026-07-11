import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities";
import { TechnicianVerification } from "../technician-verification/entities/technician-verification.entity";
import { TechnicianVerificationDocument } from "../technician-verification/entities/technician-verification-document.entity";
import { VerificationDocumentType } from "../technician-verification/entities/verification-document-type.entity";
import { AdminVerificationController } from "./admin-verification.controller";
import { AdminVerificationService } from "./admin-verification.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      TechnicianVerification,
      TechnicianVerificationDocument,
      VerificationDocumentType,
    ]),
  ],
  controllers: [AdminVerificationController],
  providers: [AdminVerificationService],
})
export class AdminVerificationModule {}