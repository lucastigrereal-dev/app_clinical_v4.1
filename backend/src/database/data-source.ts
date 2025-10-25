import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Carrega variáveis de ambiente
config();

/**
 * DataSource para TypeORM CLI (migrations)
 * MVP: Configuração mínima necessária para migrations funcionarem
 * Suporta DATABASE_URL (Railway) ou variáveis separadas (desenvolvimento local)
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  // Railway/Produção: usa DATABASE_URL
  // Desenvolvimento: usa variáveis separadas
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
        username: process.env.DATABASE_USER || 'clinic_user',
        password: process.env.DATABASE_PASSWORD || 'clinic_password',
        database: process.env.DATABASE_NAME || 'clinic_companion',
      }),

  // Entities
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],

  // Migrations
  migrations: [join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations_history',

  // Configurações MVP
  synchronize: false, // IMPORTANTE: Sempre false em produção
  logging: process.env.NODE_ENV === 'development',

  // Connection pool
  extra: {
    max: 20, // Máximo de conexões
    min: 5,  // Mínimo de conexões
    idleTimeoutMillis: 30000,
  },
});
