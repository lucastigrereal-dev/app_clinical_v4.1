import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Seed Admin User
 *
 * Cria usuário admin padrão se não existir
 *
 * Credenciais:
 * - Email: admin@clinic.com
 * - Senha: Admin@123
 * - Role: admin
 */
export class SeedAdminUser1761100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash bcrypt da senha 'Admin@123'
    const passwordHash = '$2b$10$eeUlGIOUIiec8uFb4RWmguDGPm1O/xewBt3JxkSKILy3vgV8zj8Ge';

    // Inserir admin user (se não existir)
    await queryRunner.query(`
      INSERT INTO users (email, password, name, role, "createdAt", "updatedAt")
      SELECT
        'admin@clinic.com',
        '${passwordHash}',
        'Admin User',
        'admin',
        NOW(),
        NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'admin@clinic.com'
      );
    `);

    console.log('✅ Admin user created (email: admin@clinic.com, password: Admin@123)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover admin user
    await queryRunner.query(`
      DELETE FROM users WHERE email = 'admin@clinic.com';
    `);

    console.log('❌ Admin user removed');
  }
}
