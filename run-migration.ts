import { pool } from './server/db';
import { readFileSync } from 'fs';

async function runMigration() {
  try {
    console.log('📖 Reading migration file...');
    const migration = readFileSync('./migrations/0000_skinny_bloodstrike.sql', 'utf-8');
    
    console.log('🔌 Connecting to Supabase...');
    console.log('📊 Applying migration (63 tables)...');
    
    await pool.query(migration);
    
    console.log('✅ SUCCESS! All tables created in your Supabase database!');
    console.log('🎉 FramCart database schema is now fully set up.');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
