#!/usr/bin/env node

/**
 * Test Database Connection Script
 * Verifies that Supabase connection is working properly
 */

require('dotenv').config({ path: '.env.local' });

// Try to get DATABASE_URL from multiple sources
let DATABASE_URL = process.env.DATABASE_URL;

// Fallback to Vercel Postgres URL if available
if (!DATABASE_URL) {
  DATABASE_URL = process.env.NEXT_POSTGRES_URL_NON_POOLING || process.env.NEXT_POSTGRES_URL;
}

if (!DATABASE_URL) {
  console.error('❌ ERROR: Database URL not found');
  console.error('\n   Expected environment variables:');
  console.error('   - DATABASE_URL');
  console.error('   - NEXT_POSTGRES_URL');
  console.error('   - NEXT_POSTGRES_URL_NON_POOLING');
  console.error('\n   Please check your .env.local or Vercel environment variables');
  process.exit(1);
}

console.log('🔍 Testing Supabase Connection...\n');

async function testConnection() {
  try {
    // Import postgres package
    const { sql } = await import('postgres');
    
    console.log('📍 Connecting to Supabase...');
    console.log(`   Database URL: ${DATABASE_URL.substring(0, 50)}...`);
    
    const db = sql(DATABASE_URL);
    
    // Test 1: Simple query
    console.log('\n✓ Running test query...');
    const result = await db`SELECT NOW() as current_time, version() as db_version`;
    
    if (result.length > 0) {
      console.log('✅ SUCCESS: Connected to Supabase!');
      console.log(`   Current Time: ${result[0].current_time}`);
      console.log(`   PostgreSQL Version: ${result[0].db_version.substring(0, 50)}...`);
    }
    
    // Test 2: Check schema
    console.log('\n✓ Checking database schema...');
    const tables = await db`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log(`\n✅ Found ${tables.length} tables in database:`);
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.table_name}`);
      });
    } else {
      console.log('\n⚠️  WARNING: No tables found in database');
      console.log('   You may need to run migrations first');
    }
    
    // Test 3: Check enums
    console.log('\n✓ Checking custom types (enums)...');
    const enums = await db`
      SELECT t.typname 
      FROM pg_type t 
      WHERE t.typtype = 'e' 
      AND t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `;
    
    if (enums.length > 0) {
      console.log(`\n✅ Found ${enums.length} custom enums:`);
      enums.forEach((e, index) => {
        console.log(`   ${index + 1}. ${e.typname}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed! Supabase is connected correctly.');
    console.log('='.repeat(50) + '\n');
    
    await db.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR: Failed to connect to Supabase');
    console.error('\nError details:');
    console.error(error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check if DATABASE_URL is correct');
      console.error('   - Verify Supabase project is running');
      console.error('   - Check firewall/network settings');
    } else if (error.message.includes('password')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check if password in DATABASE_URL is correct');
      console.error('   - Try generating a new password in Supabase');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check if DATABASE_URL hostname is correct');
      console.error('   - Check your internet connection');
      console.error('   - Try copying DATABASE_URL again from Supabase');
    }
    
    process.exit(1);
  }
}

testConnection();
