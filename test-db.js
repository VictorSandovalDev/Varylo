require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing connection to:', process.env.DATABASE_URL?.split('@')[1] || 'URL not set');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(client => {
        console.log('PG Connected successfully!');
        return client.query('SELECT NOW()').then(res => {
            console.log('Time:', res.rows[0]);
            client.release();
            pool.end();
        });
    })
    .catch(err => {
        console.error('PG Connection error:', err);
        pool.end();
    });
