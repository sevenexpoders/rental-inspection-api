import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,

  autoLoadEntities: true,
  synchronize: false,
  //logging: true,
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    max: 20, // pool size
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
});