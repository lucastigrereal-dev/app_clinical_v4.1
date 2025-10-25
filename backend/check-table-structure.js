const { Client } = require('pg');

const client = new Client({
  host: 'nozomi.proxy.rlwy.net',
  port: 23483,
  user: 'postgres',
  password: 'kfLomPIFIyvrojWOCZwvclxyKLQtgCSH',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

async function checkTable() {
  try {
    await client.connect();
    console.log('✅ Connected to Railway\n');

    // Get table structure
    const structure = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'photo_analyses'
      ORDER BY ordinal_position
    `);

    console.log('📋 Table structure:');
    console.table(structure.rows);

    // Get sample data
    const data = await client.query(`SELECT * FROM photo_analyses LIMIT 1`);
    console.log('\n📄 Sample record:');
    console.log(JSON.stringify(data.rows[0], null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTable();
