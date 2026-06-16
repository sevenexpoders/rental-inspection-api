import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; 
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { PropertyPartiesModule } from './modules/property-parties/property-parties.module';
import { LeasesModule } from './modules/leases/leases.module';
import { InspectionsModule } from './modules/inspections/inspections.module';
import { InspectionSectionsModule } from './modules/inspection-sections/inspection-sections.module';
import { LookupModule } from './modules/lookup/lookup.module';

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
    LeasesModule,
    InspectionsModule,
    InspectionSectionsModule,
    LookupModule
  ],
})
export class AppModule {}