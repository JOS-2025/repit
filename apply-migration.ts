import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function migrate() {
  try {
    console.log('Reading migration file...');
    const migration = readFileSync('./migrations/0000_skinny_bloodstrike.sql', 'utf-8');
    
    console.log('Applying migration to Supabase...');
    await pool.query(migration);
    
    console.log('✅ Migration applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
