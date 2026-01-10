const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Dotenv Loaded');
console.log('Dotenv Loaded');
console.log('DB URL:', process.env.DATABASE_URL); // Intentionally allow printing for debug (it's my own terminal)

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase/Neon usually
});

async function run() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        console.log('Running schema migration...');
        await pool.query(sql);
        console.log('Schema applied successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

run();
