import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fix: Aumentar tamanho do campo motivational_persona
 * Dados reais têm frases motivacionais longas (não apenas nomes)
 */
export class FixPersonaLength1736975100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE emotional_mappings
      ALTER COLUMN motivational_persona TYPE TEXT
    `);

    console.log('✅ Campo motivational_persona alterado para TEXT');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE emotional_mappings
      ALTER COLUMN motivational_persona TYPE VARCHAR(100)
    `);
  }
}
