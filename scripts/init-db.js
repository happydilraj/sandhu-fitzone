#!/usr/bin/env node

/**
 * Database Initialization Script
 * This script runs the SQL schema and seed files on your Neon database
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

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  console.error('Please add your Neon database connection string to .env.local');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function initDatabase() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Read SQL files
    const schemaPath = path.join(__dirname, '001-init-schema.sql');
    const seedPath = path.join(__dirname, '002-seed-data.sql');

    console.log('📖 Reading SQL files...');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    // Split SQL into individual statements and execute them
    console.log('📊 Creating database schema...');
    
    // Execute schema as raw SQL
    const schemaStatements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of schemaStatements) {
      await sql.query(statement);
    }
    console.log('✅ Schema created successfully!\n');

    // Execute seed data
    console.log('🌱 Seeding initial data...');
    const seedStatements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of seedStatements) {
      await sql.query(statement);
    }
    console.log('✅ Seed data inserted successfully!\n');

    console.log('🎉 Database initialization complete!');
    console.log('\n📝 Default admin credentials:');
    console.log('   Email: admin@futurefit.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the admin password after first login!\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.error('Details:', error.message);
    process.exit(1);
  }
}

// Run initialization
initDatabase();
