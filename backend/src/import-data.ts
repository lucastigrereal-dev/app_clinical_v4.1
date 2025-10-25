import { createConnection } from 'typeorm';
import csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

// Importa dados dos CSVs e JSON para o banco PostgreSQL

async function importData() {
  console.log('🚀 INICIANDO IMPORTAÇÃO DOS DADOS - CLINIC COMPANION');
  console.log('='.repeat(70));

  try {
    // Conectar ao banco
    const connection = await createConnection();
    console.log('✅ Conectado ao PostgreSQL');

    // 1. Importar Top 50 Procedimentos
    console.log('\n📄 1. Importando Top 50 Procedimentos...');
    const proceduresData = [];

    fs.createReadStream(path.join(__dirname, '../../data/raw/1_top_50_procedimentos_esteticos_brasil_2024.csv'))
      .pipe(csv())
      .on('data', (row) => {
        proceduresData.push({
          position: parseInt(row['Posição']),
          name: row['Procedimento'],
          category: row['Categoria'],
          volume_2024: parseInt(row['Número_2024']),
          market_share: row['Percentual'],
          body_area: row['Área']
        });
      })
      .on('end', async () => {
        // Inserir no banco
        await connection.getRepository('Procedure').save(proceduresData);
        console.log(`✅ ${proceduresData.length} procedimentos importados`);

        // 2. Importar Mapeamento Emocional
        await importEmotionalMapping(connection);

        // 3. Importar Alertas
        await importAlerts(connection);

        // 4. Importar Protocolos
        await importProtocols(connection);

        console.log('\n🎯 IMPORTAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('='.repeat(70));
        await connection.close();
      });

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    process.exit(1);
  }
}

async function importEmotionalMapping(connection) {
  console.log('\n📄 2. Importando Mapeamento Emocional...');
  const emotionalData = [];

  fs.createReadStream(path.join(__dirname, '../../data/raw/2_mapeamento_emocional_procedimentos_esteticos.csv'))
    .pipe(csv())
    .on('data', (row) => {
      emotionalData.push({
        procedure_name: row['Procedimento'],
        motivations: row['Motivações'],
        expectations: row['O que Buscam'],
        happiness_triggers: row['O que Deixa Feliz'],
        real_quotes: row['Frases Reais'],
        motivational_persona: row['Persona Motivacional']
      });
    })
    .on('end', async () => {
      await connection.getRepository('EmotionalMapping').save(emotionalData);
      console.log(`✅ ${emotionalData.length} mapeamentos emocionais importados`);
    });
}

async function importAlerts(connection) {
  console.log('\n📄 3. Importando Sistema de Alertas...');
  const alertsData = [];

  fs.createReadStream(path.join(__dirname, '../../data/raw/4_alerts_master.csv'))
    .pipe(csv())
    .on('data', (row) => {
      alertsData.push({
        procedure_name: row['procedure_name'],
        severity: row['severity'],
        alert_sign_ptbr: row['alert_sign_ptbr'],
        recommended_action_ptbr: row['recommended_action_ptbr'],
        source_refs: row['source_refs'],
        last_reviewed: row['last_reviewed_yyyy_mm']
      });
    })
    .on('end', async () => {
      await connection.getRepository('Alert').save(alertsData);
      console.log(`✅ ${alertsData.length} alertas importados`);
    });
}

async function importProtocols(connection) {
  console.log('\n📄 4. Importando Protocolos Completos...');

  const protocolsJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../data/raw/3_protocolos_50_procedimentos_completo.json'), 'utf8')
  );

  const protocolsData = protocolsJson.map(protocol => ({
    procedure_name: protocol.procedure_name,
    type: protocol.type,
    protocol_data: JSON.stringify(protocol.protocol),
    created_at: new Date(),
    updated_at: new Date()
  }));

  await connection.getRepository('Protocol').save(protocolsData);
  console.log(`✅ ${protocolsData.length} protocolos completos importados`);
}

// Executar importação
importData().catch(console.error);
