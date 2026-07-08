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
    PropertyInvitationsModule
  ],
  controllers: [AppController, WellKnownController],
  providers: [AppService],
})
export class AppModule { }