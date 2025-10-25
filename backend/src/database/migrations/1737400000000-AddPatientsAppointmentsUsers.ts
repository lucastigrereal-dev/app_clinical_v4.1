import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPatientsAppointmentsUsers1737400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create Patients table
    await queryRunner.query(`
      CREATE TABLE "patients" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "email" varchar(255) UNIQUE NOT NULL,
        "phone" varchar(50) NOT NULL,
        "birthDate" date NOT NULL,
        "cpf" varchar(14) NOT NULL,
        "address" varchar(500),
        "status" varchar(50) DEFAULT 'active',
        "medicalHistory" text,
        "allergies" text,
        "medications" text,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);

    // Create Appointments table
    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "scheduledDate" timestamp NOT NULL,
        "duration" integer NOT NULL,
        "status" varchar(50) DEFAULT 'scheduled',
        "type" varchar(50) DEFAULT 'consultation',
        "notes" text,
        "diagnosis" text,
        "treatment" text,
        "prescription" text,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);

    // Create Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) UNIQUE NOT NULL,
        "password" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "phone" varchar(50),
        "role" varchar(50) DEFAULT 'staff',
        "isActive" boolean DEFAULT true,
        "lastLogin" timestamp,
        "mfaSecret" varchar(255),
        "mfaEnabled" boolean DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_patients_email" ON "patients" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_patients_status" ON "patients" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_scheduledDate" ON "appointments" ("scheduledDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_appointments_status" ON "appointments" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP INDEX "IDX_appointments_status"`);
    await queryRunner.query(`DROP INDEX "IDX_appointments_scheduledDate"`);
    await queryRunner.query(`DROP INDEX "IDX_patients_status"`);
    await queryRunner.query(`DROP INDEX "IDX_patients_email"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TABLE "patients"`);
  }
}
