const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

console.log('Connecting to database...');
const client = new Client({
    connectionString: connectionString,
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected successfully.');

        console.log('Adding "active" column to "User" table...');
        await client.query(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
    `);

        console.log('Migration successful: Column "active" added.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
