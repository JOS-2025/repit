import { Client } from 'pg';
import { readFileSync } from 'fs';

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    
    console.log('✅ Connected successfully!');
    console.log('Reading migration file...');
    const migration = readFileSync('./migrations/0000_skinny_bloodstrike.sql', 'utf-8');
    
    console.log('Applying migration to Supabase database...');
    await client.query(migration);
    
    console.log('✅ Migration applied successfully! All tables created.');
    console.log('📊 Your Supabase database is now set up with the FramCart schema.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
