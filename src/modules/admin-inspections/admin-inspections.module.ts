import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Inspection } from "../inspections/entities";
import { AdminInspectionsController } from "./admin-inspections.controller";
import { AdminInspectionsService } from "./admin-inspections.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection,
    ]),
  ],
  controllers: [
    AdminInspectionsController,
  ],
  providers: [
    AdminInspectionsService,
  ],
})
export class AdminInspectionsModule {}