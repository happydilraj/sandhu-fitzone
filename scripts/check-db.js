#!/usr/bin/env node

/**
 * Database Check Script
 * Verifies that all tables exist and shows sample data
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const sql = neon(process.env.DATABASE_URL);

async function checkDatabase() {
  console.log('🔍 Checking database status...\n');

  try {
    // Check tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('📊 Tables found:');
    tables.forEach(t => console.log(`   ✓ ${t.table_name}`));
    console.log('');

    // Check users
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`👥 Users: ${users[0].count}`);

    // Check membership plans
    const plans = await sql`SELECT COUNT(*) as count FROM membership_plans`;
    console.log(`💳 Membership Plans: ${plans[0].count}`);

    // Check equipment
    const equipment = await sql`SELECT COUNT(*) as count FROM equipment`;
    console.log(`🏋️  Equipment: ${equipment[0].count}`);

    // Check gallery
    const gallery = await sql`SELECT COUNT(*) as count FROM gallery_images`;
    console.log(`🖼️  Gallery Images: ${gallery[0].count}`);

    console.log('\n✅ Database is properly configured!');

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
}

checkDatabase();
