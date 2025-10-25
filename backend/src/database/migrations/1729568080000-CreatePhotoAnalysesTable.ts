import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePhotoAnalysesTable1729568080000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'photo_analyses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'patientId',
            type: 'uuid',
          },
          {
            name: 'photoUrl',
            type: 'varchar',
          },
          {
            name: 'daysPostOp',
            type: 'int',
          },
          {
            name: 'procedureType',
            type: 'varchar',
          },
          // AI Analysis Results
          {
            name: 'recoveryScore',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'confidenceLevel',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'overallSeverity',
            type: 'enum',
            enum: ['none', 'low', 'medium', 'high', 'critical'],
            default: "'none'",
          },
          // Hematoma
          {
            name: 'hasHematoma',
            type: 'boolean',
            default: false,
          },
          {
            name: 'hematomaSeverity',
            type: 'int',
            default: 0,
          },
          // Edema
          {
            name: 'hasEdema',
            type: 'boolean',
            default: false,
          },
          {
            name: 'edemaSeverity',
            type: 'int',
            default: 0,
          },
          // Infection
          {
            name: 'hasInfection',
            type: 'boolean',
            default: false,
          },
          {
            name: 'infectionSeverity',
            type: 'int',
            default: 0,
          },
          // Asymmetry
          {
            name: 'hasAsymmetry',
            type: 'boolean',
            default: false,
          },
          {
            name: 'asymmetrySeverity',
            type: 'int',
            default: 0,
          },
          // Other complications
          {
            name: 'hasDehiscence',
            type: 'boolean',
            default: false,
          },
          {
            name: 'hasNecrosis',
            type: 'boolean',
            default: false,
          },
          {
            name: 'hasSeroma',
            type: 'boolean',
            default: false,
          },
          // Metadata
          {
            name: 'detectedFeatures',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'recommendations',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'requiresDoctorReview',
            type: 'boolean',
            default: false,
          },
          {
            name: 'alertSent',
            type: 'boolean',
            default: false,
          },
          {
            name: 'aiNotes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'doctorNotes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'reviewedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'reviewedBy',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign key to patients table
    await queryRunner.createForeignKey(
      'photo_analyses',
      new TableForeignKey({
        columnNames: ['patientId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'patients',
        onDelete: 'CASCADE',
      }),
    );

    // Índice para busca rápida por paciente
    await queryRunner.query(
      `CREATE INDEX "IDX_photo_analyses_patient" ON "photo_analyses" ("patientId")`,
    );

    // Índice para análises pendentes de revisão
    await queryRunner.query(
      `CREATE INDEX "IDX_photo_analyses_pending_review" ON "photo_analyses" ("requiresDoctorReview", "reviewedAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'photo_analyses',
      'IDX_photo_analyses_pending_review',
    );
    await queryRunner.dropIndex('photo_analyses', 'IDX_photo_analyses_patient');

    const table = await queryRunner.getTable('photo_analyses');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('patientId') !== -1,
    );
    await queryRunner.dropForeignKey('photo_analyses', foreignKey);

    await queryRunner.dropTable('photo_analyses');
  }
}
