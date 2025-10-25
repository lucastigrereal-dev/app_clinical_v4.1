import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePatientIdToVarchar1761275000000 implements MigrationInterface {
  name = 'ChangePatientIdToVarchar1761275000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Starting migration: Changing patientId from UUID to VARCHAR...');

    // Remove FK constraint if exists
    try {
      await queryRunner.query(`
        ALTER TABLE "photo_analyses"
        DROP CONSTRAINT IF EXISTS "FK_photo_analyses_patient"
      `);
    } catch (e) {
      console.log('No FK to drop, continuing...');
    }

    // Change column type
    await queryRunner.query(`
      ALTER TABLE "photo_analyses"
      ALTER COLUMN "patientId" TYPE VARCHAR(255) USING "patientId"::VARCHAR
    `);

    console.log('✅ Migration completed: patientId is now VARCHAR(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "photo_analyses"
      ALTER COLUMN "patientId" TYPE UUID USING "patientId"::UUID
    `);
  }
}
