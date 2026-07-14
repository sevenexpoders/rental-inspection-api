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
import { InvitationsModule } from './modules/invitations/invitations.module';
import { PropertyInvitationsModule } from './modules/property-invitations/property-invitations.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WellKnownController } from './well-known.controller';
import { TechnicianVerificationModule } from './modules/technician-verification/technician-verification.module';
import { AdminVerificationModule } from './modules/admin-verification/admin-verification.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { TechnicianDashboardModule } from './modules/technician-dashboard/technician-dashboard.module';
import { TechnicianInspectionsModule } from './modules/technician-inspections/technician-inspections.module';
import { TechnicianReportsModule } from './modules/technician-reports/technician-reports.module';
import { AdminPropertiesModule } from './modules/admin-properties/admin-properties.module';
import { AdminInspectionsModule } from './modules/admin-inspections/admin-inspections.module';
import { AdminReportsModule } from './modules/admin-reports/admin-reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api*'],
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
    UploadModule,
    InvitationsModule,
    PropertyInvitationsModule,
    TechnicianVerificationModule,
    AdminVerificationModule,
    AdminDashboardModule,
    AdminUsersModule,
    TechnicianDashboardModule,
    TechnicianInspectionsModule,
    TechnicianReportsModule,
    AdminPropertiesModule,
    AdminInspectionsModule,
    AdminReportsModule
  ],
  controllers: [AppController, WellKnownController],
  providers: [AppService],
})
export class AppModule { }