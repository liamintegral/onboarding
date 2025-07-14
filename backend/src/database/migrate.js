require('dotenv').config();
const database = require('./supabase');

async function migrate() {
  try {
    console.log('Starting Supabase database migration...');

    // Connect to database
    await database.connect();
    console.log('Connected to Supabase for migration');

    // Run migrations
    await database.migrate();
    console.log('✅ Database migration completed successfully');

    // Seed with default data
    await database.seed();
    console.log('✅ Database seeded with default data');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;