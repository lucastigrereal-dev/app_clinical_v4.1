// One-time script to run migrations in production
// Execute: node dist/run-migrations-prod.js

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runMigrations() {
  console.log('🚀 Starting production migrations...');
  console.log('');

  try {
    // Run TypeORM migrations
    const { stdout, stderr } = await execPromise('npm run migration:run:prod');

    console.log('✅ Migrations executed successfully!');
    console.log('');
    console.log(stdout);

    if (stderr) {
      console.log('⚠️  Warnings:');
      console.log(stderr);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed!');
    console.error(error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

runMigrations();
