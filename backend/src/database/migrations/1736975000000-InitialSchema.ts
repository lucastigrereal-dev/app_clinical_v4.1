import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration Inicial - Estrutura MVP Anti-Quebra
 *
 * OBJETIVO:
 * - Substituir synchronize: true por migrations controladas
 * - Adicionar foreign keys entre tabelas
 * - Criar índices para performance
 * - Manter IDs numéricos (UUID fica em standby)
 *
 * DECISÕES MVP:
 * - IDs numéricos são suficientes para MVP (não precisa UUID ainda)
 * - Foreign keys garantem integridade referencial
 * - Índices em campos mais consultados (procedure_name, severity)
 * - Campos obrigatórios vs opcionais bem definidos
 */
export class InitialSchema1736975000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. TABELA PROCEDURES (tabela principal)
    await queryRunner.createTable(
      new Table({
        name: 'procedures',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'position',
            type: 'int',
            comment: 'Posição no ranking de procedimentos mais realizados',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
            comment: 'Nome único do procedimento',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            comment: 'Categoria: Cirúrgico, Não-Cirúrgico, etc',
          },
          {
            name: 'volume_2024',
            type: 'int',
            comment: 'Volume de procedimentos realizados em 2024',
          },
          {
            name: 'market_share',
            type: 'varchar',
            length: '20',
            comment: 'Participação de mercado em percentual',
          },
          {
            name: 'body_area',
            type: 'varchar',
            length: '100',
            comment: 'Área do corpo: Corporal, Facial, Mama, Íntima, Capilar',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 2. TABELA ALERTS (depende de procedures)
    await queryRunner.createTable(
      new Table({
        name: 'alerts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'procedure_name',
            type: 'varchar',
            length: '255',
            comment: 'Nome do procedimento (FK para procedures.name)',
          },
          {
            name: 'severity',
            type: 'varchar',
            length: '20',
            comment: 'Severidade: critical, attention, info',
          },
          {
            name: 'alert_sign_ptbr',
            type: 'text',
            comment: 'Sinal de alerta em português brasileiro',
          },
          {
            name: 'recommended_action_ptbr',
            type: 'text',
            comment: 'Ação recomendada em português brasileiro',
          },
          {
            name: 'source_refs',
            type: 'text',
            comment: 'Referências das fontes médicas',
          },
          {
            name: 'last_reviewed',
            type: 'varchar',
            length: '20',
            comment: 'Data da última revisão médica (YYYY-MM)',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 3. TABELA PROTOCOLS (depende de procedures)
    await queryRunner.createTable(
      new Table({
        name: 'protocols',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'procedure_name',
            type: 'varchar',
            length: '255',
            comment: 'Nome do procedimento (FK para procedures.name)',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '100',
            comment: 'Tipo: medication, care, diet, activity, followup',
          },
          {
            name: 'protocol_data',
            type: 'jsonb',
            comment: 'Dados do protocolo em formato JSON (timeline, instruções)',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 4. TABELA EMOTIONAL_MAPPINGS (depende de procedures)
    await queryRunner.createTable(
      new Table({
        name: 'emotional_mappings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'procedure_name',
            type: 'varchar',
            length: '255',
            isUnique: true,
            comment: 'Nome do procedimento (FK para procedures.name) - único pois é 1:1',
          },
          {
            name: 'motivations',
            type: 'text',
            comment: 'Motivações principais dos pacientes',
          },
          {
            name: 'expectations',
            type: 'text',
            comment: 'O que os pacientes buscam',
          },
          {
            name: 'happiness_triggers',
            type: 'text',
            comment: 'Gatilhos de felicidade dos pacientes',
          },
          {
            name: 'real_quotes',
            type: 'text',
            comment: 'Frases reais de pacientes',
          },
          {
            name: 'motivational_persona',
            type: 'varchar',
            length: '100',
            comment: 'Persona motivacional associada',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // === ÍNDICES DE PERFORMANCE ===

    // Procedures: índices em campos mais consultados
    await queryRunner.createIndex(
      'procedures',
      new TableIndex({
        name: 'IDX_PROCEDURES_CATEGORY',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'procedures',
      new TableIndex({
        name: 'IDX_PROCEDURES_BODY_AREA',
        columnNames: ['body_area'],
      }),
    );

    await queryRunner.createIndex(
      'procedures',
      new TableIndex({
        name: 'IDX_PROCEDURES_NAME',
        columnNames: ['name'],
      }),
    );

    // Alerts: índices em campos mais consultados
    await queryRunner.createIndex(
      'alerts',
      new TableIndex({
        name: 'IDX_ALERTS_PROCEDURE_NAME',
        columnNames: ['procedure_name'],
      }),
    );

    await queryRunner.createIndex(
      'alerts',
      new TableIndex({
        name: 'IDX_ALERTS_SEVERITY',
        columnNames: ['severity'],
      }),
    );

    // Índice composto para busca por procedimento + severidade
    await queryRunner.createIndex(
      'alerts',
      new TableIndex({
        name: 'IDX_ALERTS_PROCEDURE_SEVERITY',
        columnNames: ['procedure_name', 'severity'],
      }),
    );

    // Protocols: índices em campos mais consultados
    await queryRunner.createIndex(
      'protocols',
      new TableIndex({
        name: 'IDX_PROTOCOLS_PROCEDURE_NAME',
        columnNames: ['procedure_name'],
      }),
    );

    await queryRunner.createIndex(
      'protocols',
      new TableIndex({
        name: 'IDX_PROTOCOLS_TYPE',
        columnNames: ['type'],
      }),
    );

    // Emotional Mappings: índices em campos mais consultados
    await queryRunner.createIndex(
      'emotional_mappings',
      new TableIndex({
        name: 'IDX_EMOTIONAL_PROCEDURE_NAME',
        columnNames: ['procedure_name'],
      }),
    );

    await queryRunner.createIndex(
      'emotional_mappings',
      new TableIndex({
        name: 'IDX_EMOTIONAL_PERSONA',
        columnNames: ['motivational_persona'],
      }),
    );

    // === FOREIGN KEYS (Integridade Referencial) ===

    // MVP: Comentadas por enquanto porque procedure_name é string (não FK integer)
    // Para implementar FKs corretas, precisamos:
    // 1. Adicionar procedure_id (int) nas tabelas dependentes
    // 2. Migrar os dados
    // 3. Remover procedure_name (ou mantê-lo denormalizado para performance)
    //
    // Isso fica para DIA 4 (refactoring avançado em standby)

    console.log('✅ Migration InitialSchema executada com sucesso');
    console.log('📊 4 tabelas criadas: procedures, alerts, protocols, emotional_mappings');
    console.log('🔍 10 índices criados para performance');
    console.log('⚠️  Foreign keys em standby (requerem refactoring de procedure_id)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover em ordem reversa (dependências primeiro)
    await queryRunner.dropTable('emotional_mappings', true);
    await queryRunner.dropTable('protocols', true);
    await queryRunner.dropTable('alerts', true);
    await queryRunner.dropTable('procedures', true);

    console.log('✅ Migration InitialSchema revertida com sucesso');
  }
}
