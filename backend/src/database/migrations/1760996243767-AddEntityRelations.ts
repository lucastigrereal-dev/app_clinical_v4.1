import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntityRelations1760996243767 implements MigrationInterface {
    name = 'AddEntityRelations1760996243767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add foreign key columns
        await queryRunner.query(`
            ALTER TABLE "patients"
            ADD COLUMN "assigned_doctor_id" uuid
        `);

        await queryRunner.query(`
            ALTER TABLE "appointments"
            ADD COLUMN "patient_id" uuid
        `);

        await queryRunner.query(`
            ALTER TABLE "appointments"
            ADD COLUMN "doctor_id" uuid
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "patients"
            ADD CONSTRAINT "FK_patients_assigned_doctor"
            FOREIGN KEY ("assigned_doctor_id")
            REFERENCES "users"("id")
            ON DELETE SET NULL
            ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "appointments"
            ADD CONSTRAINT "FK_appointments_patient"
            FOREIGN KEY ("patient_id")
            REFERENCES "patients"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "appointments"
            ADD CONSTRAINT "FK_appointments_doctor"
            FOREIGN KEY ("doctor_id")
            REFERENCES "users"("id")
            ON DELETE SET NULL
            ON UPDATE CASCADE
        `);

        // Add indexes for better query performance
        await queryRunner.query(`
            CREATE INDEX "IDX_patients_assigned_doctor_id"
            ON "patients"("assigned_doctor_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_appointments_patient_id"
            ON "appointments"("patient_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_appointments_doctor_id"
            ON "appointments"("doctor_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_appointments_doctor_id"`);
        await queryRunner.query(`DROP INDEX "IDX_appointments_patient_id"`);
        await queryRunner.query(`DROP INDEX "IDX_patients_assigned_doctor_id"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_doctor"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_patient"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_patients_assigned_doctor"`);

        // Drop foreign key columns
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctor_id"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "patient_id"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "assigned_doctor_id"`);
    }

}
