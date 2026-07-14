import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Property } from "../properties/entities";
import { AdminPropertiesController } from "./admin-properties.controller";
import { AdminPropertiesService } from "./admin-properties.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Property,
        ]),
    ],
    controllers: [
        AdminPropertiesController,
    ],
    providers: [
        AdminPropertiesService,
    ],
})
export class AdminPropertiesModule {}