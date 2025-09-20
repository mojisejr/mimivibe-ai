#!/usr/bin/env node

/**
 * Sync Local Database Script
 * 
 * This script cleans up the local development database and imports staging data
 * from the transfer-to-staging.sql file for local development and testing.
 * 
 * Usage: node scripts/sync-local-data.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Local database connection string from .env.local
const LOCAL_DATABASE_URL = "postgresql://mimi:mimi_dev@localhost:5433/mimivibe_dev?schema=public";

// SQL file path
const SQL_FILE = path.join(__dirname, '..', 'local-docs', 'transfer-to-staging.sql');

// Tables to clean up (in dependency order - child tables first)
const CLEANUP_TABLES = [
  'UserCampaign',
  'Campaign',
  'CreditTransaction',
  'Payment',
  'UserAchievement',
  'Achievement',
  'UserStats',
  'Reading',
  'User',
  'Spread',
  'TarotCard'
];

/**
 * Prompt user for confirmation
 */
function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
    });
  });
}

/**
 * Check if local database is accessible
 */
async function checkDatabaseConnection() {
  console.log('🔍 Checking local database connection...');
  
  try {
    // Remove schema parameter from URL for psql compatibility
    const cleanUrl = LOCAL_DATABASE_URL.replace(/\?schema=public/, '');
    execSync(`psql "${cleanUrl}" -c "SELECT 1;"`, { stdio: 'pipe' });
    console.log('✅ Local database connection successful!');
  } catch (error) {
    console.error('❌ Cannot connect to local database!');
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   - Ensure PostgreSQL Docker container is running');
    console.error('   - Check DATABASE_URL in .env.local file');
    console.error('   - Verify database credentials and port (5433)');
    console.error('   - Run: docker-compose up -d postgres');
    throw error;
  }
}

/**
 * Clean up local database
 */
async function cleanupLocalDatabase() {
  console.log('🧹 Starting local database cleanup...');
  
  try {
    // Remove schema parameter from URL for psql compatibility
    const cleanUrl = LOCAL_DATABASE_URL.replace(/\?schema=public/, '');
    
    // Disable foreign key constraints
    console.log('  🔓 Disabling foreign key constraints...');
    execSync(`psql "${cleanUrl}" -c "SET session_replication_role = replica;"`, { stdio: 'inherit' });
    
    // Clean up tables in reverse dependency order
    for (const table of CLEANUP_TABLES) {
      console.log(`  🗑️  Cleaning table: ${table}`);
      try {
        execSync(`psql "${cleanUrl}" -c "TRUNCATE TABLE \\"${table}\\" CASCADE;"`, { stdio: 'pipe' });
        console.log(`    ✅ ${table} cleaned successfully`);
      } catch (error) {
        console.warn(`    ⚠️  Warning: Could not clean table ${table}: ${error.message}`);
      }
    }
    
    // Re-enable foreign key constraints
    console.log('  🔒 Re-enabling foreign key constraints...');
    execSync(`psql "${cleanUrl}" -c "SET session_replication_role = DEFAULT;"`, { stdio: 'inherit' });
    
    console.log('✅ Local database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

/**
 * Import staging data to local database
 */
async function importStagingData() {
  console.log('📥 Starting staging data import to local database...');
  
  try {
    // Check if SQL file exists
    if (!fs.existsSync(SQL_FILE)) {
      throw new Error(`SQL file not found: ${SQL_FILE}`);
    }
    
    console.log(`  📄 Importing from: ${SQL_FILE}`);
    
    // Get file size for progress indication
    const stats = fs.statSync(SQL_FILE);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`  📊 File size: ${fileSizeMB} MB`);
    
    // Remove schema parameter from URL for psql compatibility
    const cleanUrl = LOCAL_DATABASE_URL.replace(/\?schema=public/, '');
    
    // Import the SQL file
    console.log('  🚀 Executing SQL import...');
    execSync(`psql "${cleanUrl}" -f "${SQL_FILE}"`, { stdio: 'inherit' });
    
    console.log('✅ Staging data import to local database completed!');
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    throw error;
  }
}

/**
 * Verify import success
 */
async function verifyImport() {
  console.log('🔍 Verifying import success...');
  
  try {
    // Remove schema parameter from URL for psql compatibility
    const cleanUrl = LOCAL_DATABASE_URL.replace(/\?schema=public/, '');
    
    const verificationQueries = [
      'SELECT COUNT(*) as user_count FROM "User";',
      'SELECT COUNT(*) as reading_count FROM "readings";',
      'SELECT COUNT(*) as card_count FROM "Card";',
      'SELECT COUNT(*) as payment_count FROM "PaymentHistory";'
    ];
    
    for (const query of verificationQueries) {
      try {
        const result = execSync(`psql "${cleanUrl}" -t -c "${query}"`, { encoding: 'utf8' });
        const count = result.trim();
        const tableName = query.match(/FROM "(\w+)"/)[1];
        console.log(`  📊 ${tableName}: ${count} records`);
      } catch (error) {
        console.warn(`  ⚠️  Could not verify ${query}: ${error.message}`);
      }
    }
    
    console.log('✅ Import verification completed!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  }
}

/**
 * Main sync function
 */
async function syncLocalData() {
  try {
    console.log('🎯 MiMiVibes Local Database Sync');
    console.log('==================================');
    console.log('');
    console.log('⚠️  WARNING: This will completely replace local database data!');
    console.log('   - All existing local development data will be deleted');
    console.log('   - Staging data will be imported to local database');
    console.log('   - This operation cannot be undone');
    console.log('   - Local database: localhost:5433/mimivibe_dev');
    console.log('');
    
    // Check database connection first
    await checkDatabaseConnection();
    console.log('');
    
    // Ask for confirmation
    const confirmed = await askConfirmation('Are you sure you want to proceed? (y/N): ');
    
    if (!confirmed) {
      console.log('❌ Operation cancelled by user.');
      process.exit(0);
    }
    
    console.log('');
    console.log('🚀 Starting local database synchronization...');
    console.log('');
    
    // Step 1: Cleanup local database
    await cleanupLocalDatabase();
    console.log('');
    
    // Step 2: Import staging data
    await importStagingData();
    console.log('');
    
    // Step 3: Verify import
    await verifyImport();
    console.log('');
    
    console.log('🎉 Local database sync completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Test local development environment functionality');
    console.log('   2. Verify data integrity and relationships');
    console.log('   3. Run local development tests');
    console.log('   4. Start development server: npm run dev');
    console.log('');
    console.log('🔒 Security reminder:');
    console.log('   - Local database is for development only');
    console.log('   - Do not use production credentials locally');
    console.log('   - Monitor local environment for any issues');
    
  } catch (error) {
    console.error('');
    console.error('❌ Local sync failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   - Ensure psql is installed and accessible');
    console.error('   - Verify local PostgreSQL Docker container is running');
    console.error('   - Check DATABASE_URL in .env.local file');
    console.error('   - Ensure SQL file exists and is readable');
    console.error('   - Check Docker container: docker ps | grep postgres');
    console.error('   - Restart container: docker-compose restart postgres');
    process.exit(1);
  }
}

// Run the sync if this script is executed directly
if (require.main === module) {
  syncLocalData();
}

module.exports = { syncLocalData, cleanupLocalDatabase, importStagingData, verifyImport };