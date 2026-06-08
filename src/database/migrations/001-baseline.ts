import { MigrationInterface, QueryRunner } from "typeorm";

export class Baseline001 implements MigrationInterface {
  name = 'Baseline001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // IMPORTANT:
    // DO NOTHING HERE because tables already exist in DB
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // optional rollback (not required for baseline)
  }
}