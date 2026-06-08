import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // ✅ FIX: support dev + prod
  entities: [
    'src/**/*.entity.ts',
    'dist/**/*.entity.js'
  ],

  migrations: [
    'src/database/migrations/*.ts',
    'dist/database/migrations/*.js'
  ],

  synchronize: false,
  logging: true,
});