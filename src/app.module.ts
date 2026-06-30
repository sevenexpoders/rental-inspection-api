import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { PropertyPartiesModule } from './modules/property-parties/property-parties.module';
import { InspectionsModule } from './modules/inspections/inspections.module';
import { LookupModule } from './modules/lookup/lookup.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLogModule } from './modules/audit-logs/audit-log.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    AuthModule,
    UsersModule,
    PropertiesModule,
    PropertyPartiesModule,
    InspectionsModule,
    LookupModule,
    AuditLogModule,
    NotificationsModule,
    UploadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }