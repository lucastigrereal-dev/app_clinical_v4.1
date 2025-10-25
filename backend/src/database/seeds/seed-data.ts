import { AppDataSource } from '../data-source';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

/**
 * Script de Seed - Popular banco com dados reais
 * MVP: Importa dados dos CSVs para PostgreSQL
 */

async function seedData() {
  console.log('🚀 INICIANDO SEED DE DADOS - CLINIC COMPANION MVP');
  console.log('='.repeat(70));

  try {
    // Conectar ao banco
    await AppDataSource.initialize();
    console.log('✅ Conectado ao PostgreSQL');

    // Importar na ordem correta (procedures primeiro, depois dependentes)
    await importProcedures();
    await importEmotionalMappings();
    await importAlerts();
    await importProtocols();

    console.log('\n🎯 SEED COMPLETO COM SUCESSO!');
    console.log('='.repeat(70));
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

/**
 * Importar Top 50 Procedimentos
 */
async function importProcedures(): Promise<void> {
  console.log('\n📄 1. Importando Top 50 Procedimentos...');

  const filePath = path.join(
    'C:',
    'Users',
    'JAIANE',
    'Desktop',
    'arquivosclinical',
    '1_top_50_procedimentos_esteticos_brasil_2024.csv',
  );

  const procedures = await parseCSV(filePath);

  const data = procedures.map((row: any, index: number) => ({
    position: index + 1,
    name: row['Procedimento'] || row['procedimento'] || row['name'],
    category: row['Categoria'] || row['categoria'] || row['category'],
    volume_2024:
      parseInt(row['Número_2024'] || row['numero_2024'] || row['volume']) || 0,
    market_share:
      row['Percentual'] || row['percentual'] || row['market_share'] || '0%',
    body_area: row['Área'] || row['area'] || row['body_area'] || 'Geral',
  }));

  await AppDataSource.query(
    `INSERT INTO procedures (position, name, category, volume_2024, market_share, body_area)
     VALUES ${data
       .map(
         (_, i) =>
           `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`,
       )
       .join(', ')}
     ON CONFLICT (name) DO NOTHING`,
    data.flatMap((p) => [
      p.position,
      p.name,
      p.category,
      p.volume_2024,
      p.market_share,
      p.body_area,
    ]),
  );

  console.log(`✅ ${data.length} procedimentos importados`);
}

/**
 * Importar Mapeamento Emocional
 */
async function importEmotionalMappings(): Promise<void> {
  console.log('\n📄 2. Importando Mapeamento Emocional...');

  const filePath = path.join(
    'C:',
    'Users',
    'JAIANE',
    'Desktop',
    'arquivosclinical',
    '2_mapeamento_emocional_procedimentos_esteticos.csv',
  );

  const mappings = await parseCSV(filePath);

  const data = mappings.map((row: any) => ({
    procedure_name: row['Procedimento'] || row['procedimento'] || row['name'],
    motivations:
      row['Motivações'] || row['motivacoes'] || row['motivations'] || '',
    expectations: row['O que Buscam'] || row['expectations'] || '',
    happiness_triggers:
      row['O que Deixa Feliz'] || row['happiness_triggers'] || '',
    real_quotes: row['Frases Reais'] || row['real_quotes'] || '',
    motivational_persona:
      row['Persona Motivacional'] ||
      row['persona_motivacional'] ||
      row['persona'] ||
      'Geral',
  }));

  for (const mapping of data) {
    await AppDataSource.query(
      `INSERT INTO emotional_mappings
       (procedure_name, motivations, expectations, happiness_triggers, real_quotes, motivational_persona)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (procedure_name) DO NOTHING`,
      [
        mapping.procedure_name,
        mapping.motivations,
        mapping.expectations,
        mapping.happiness_triggers,
        mapping.real_quotes,
        mapping.motivational_persona,
      ],
    );
  }

  console.log(`✅ ${data.length} mapeamentos emocionais importados`);
}

/**
 * Importar Alertas
 */
async function importAlerts(): Promise<void> {
  console.log('\n📄 3. Importando Alertas...');

  const filePath = path.join(
    'C:',
    'Users',
    'JAIANE',
    'Desktop',
    'arquivosclinical',
    '4_alerts_master.csv',
  );

  const alerts = await parseCSV(filePath);

  const data = alerts.map((row: any) => ({
    procedure_name:
      row['procedure_name'] || row['Procedimento'] || row['procedimento'],
    severity: row['severity'] || row['severidade'] || 'info',
    alert_sign_ptbr:
      row['alert_sign_ptbr'] ||
      row['alerta'] ||
      row['symptom'] ||
      'Alerta não especificado',
    recommended_action_ptbr:
      row['recommended_action_ptbr'] ||
      row['acao_recomendada'] ||
      row['action'] ||
      'Consulte um médico',
    source_refs:
      row['source_refs'] || row['fontes'] || row['sources'] || 'Não informado',
    last_reviewed:
      row['last_reviewed'] ||
      row['last_reviewed_yyyy_mm'] ||
      row['revisao'] ||
      '2025-01',
  }));

  // Batch insert (mais rápido)
  const batchSize = 50;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    await AppDataSource.query(
      `INSERT INTO alerts
       (procedure_name, severity, alert_sign_ptbr, recommended_action_ptbr, source_refs, last_reviewed)
       VALUES ${batch
         .map(
           (_, idx) =>
             `($${idx * 6 + 1}, $${idx * 6 + 2}, $${idx * 6 + 3}, $${idx * 6 + 4}, $${idx * 6 + 5}, $${idx * 6 + 6})`,
         )
         .join(', ')}`,
      batch.flatMap((a) => [
        a.procedure_name,
        a.severity,
        a.alert_sign_ptbr,
        a.recommended_action_ptbr,
        a.source_refs,
        a.last_reviewed,
      ]),
    );
  }

  console.log(`✅ ${data.length} alertas importados`);
}

/**
 * Importar Protocolos
 */
async function importProtocols(): Promise<void> {
  console.log('\n📄 4. Importando Protocolos...');

  const filePath = path.join(
    'C:',
    'Users',
    'JAIANE',
    'Desktop',
    'arquivosclinical',
    '3_protocolos_50_procedimentos_completo.json',
  );

  const protocolsJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const data = protocolsJson.map((protocol: any) => ({
    procedure_name:
      protocol.procedure_name || protocol.procedimento || protocol.name,
    type: protocol.type || protocol.tipo || 'geral',
    protocol_data: protocol.protocol || protocol.dados || protocol.data || {},
  }));

  for (const protocol of data) {
    await AppDataSource.query(
      `INSERT INTO protocols (procedure_name, type, protocol_data)
       VALUES ($1, $2, $3)`,
      [protocol.procedure_name, protocol.type, JSON.stringify(protocol.protocol_data)],
    );
  }

  console.log(`✅ ${data.length} protocolos importados`);
}

/**
 * Helper: Parse CSV
 */
function parseCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    if (!fs.existsSync(filePath)) {
      reject(new Error(`Arquivo não encontrado: ${filePath}`));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Executar seed
seedData();
