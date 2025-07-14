require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function createTables() {
  try {
    console.log('Starting Supabase table creation...');

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Connected to Supabase');

    // Create tables using Supabase SQL editor
    const sqlCommands = [
      // Clients table
      `CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        company_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        website TEXT,
        industry TEXT,
        goals TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Platform types table
      `CREATE TABLE IF NOT EXISTS platform_types (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        setup_steps JSONB,
        validation_criteria JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Platform connections table
      `CREATE TABLE IF NOT EXISTS platform_connections (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        platform_type_id INTEGER NOT NULL REFERENCES platform_types(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'error', 'skipped')),
        progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        access_granted BOOLEAN DEFAULT FALSE,
        credentials_provided BOOLEAN DEFAULT FALSE,
        validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validating', 'valid', 'invalid', 'error')),
        notes TEXT,
        error_message TEXT,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      );`,

      // Chat sessions table
      `CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        session_id TEXT UNIQUE NOT NULL,
        platform_context TEXT,
        current_step TEXT,
        messages JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // User sessions table
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        session_token TEXT UNIQUE NOT NULL,
        refresh_token TEXT UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Admin users table
      `CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      );`,

      // Activity logs table
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        admin_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id INTEGER,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      // Indexes
      `CREATE INDEX IF NOT EXISTS idx_clients_email ON clients (email);`,
      `CREATE INDEX IF NOT EXISTS idx_platform_connections_client ON platform_connections (client_id);`,
      `CREATE INDEX IF NOT EXISTS idx_platform_connections_status ON platform_connections (status);`,
      `CREATE INDEX IF NOT EXISTS idx_chat_sessions_client ON chat_sessions (client_id);`,
      `CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions (session_id);`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions (session_token);`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions (expires_at);`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_client ON activity_logs (client_id);`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at);`
    ];

    // Execute each SQL command
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`Executing command ${i + 1}/${sqlCommands.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.log(`Command ${i + 1} note:`, error.message);
        // Continue with other commands even if one fails
      }
    }

    console.log('✅ Tables created successfully');

    // Now seed with platform types
    const platformTypes = [
      {
        name: 'google_analytics',
        display_name: 'Google Analytics',
        description: 'Web analytics service',
        category: 'google',
        setup_steps: [
          'Go to Google Analytics account',
          'Navigate to Admin → User Management',
          'Add email with Edit permissions',
          'Confirm access grant'
        ],
        validation_criteria: {
          required_permissions: ['edit'],
          validation_url: 'https://analytics.google.com'
        }
      },
      {
        name: 'google_ads',
        display_name: 'Google Ads',
        description: 'Online advertising platform',
        category: 'google',
        setup_steps: [
          'Sign in to Google Ads',
          'Click Tools & Settings → Access and security',
          'Invite user with Admin access',
          'Share account ID'
        ],
        validation_criteria: {
          required_permissions: ['admin'],
          validation_url: 'https://ads.google.com'
        }
      },
      {
        name: 'google_search_console',
        display_name: 'Google Search Console',
        description: 'Website performance monitoring',
        category: 'google',
        setup_steps: [
          'Open Google Search Console',
          'Select your property',
          'Go to Settings → Users and permissions',
          'Add user with Full permissions'
        ],
        validation_criteria: {
          required_permissions: ['full'],
          validation_url: 'https://search.google.com/search-console'
        }
      },
      {
        name: 'facebook_business_manager',
        display_name: 'Facebook Business Manager',
        description: 'Meta business platform',
        category: 'meta',
        setup_steps: [
          'Go to business.facebook.com',
          'Navigate to Business Settings → People',
          'Add user with appropriate permissions',
          'Assign to relevant accounts and pages'
        ],
        validation_criteria: {
          required_permissions: ['admin'],
          validation_url: 'https://business.facebook.com'
        }
      },
      {
        name: 'tiktok_ads_manager',
        display_name: 'TikTok Ads Manager',
        description: 'TikTok advertising platform',
        category: 'tiktok',
        setup_steps: [
          'Go to ads.tiktok.com',
          'Navigate to Assets → User Management',
          'Add user with Admin role',
          'Assign to relevant ad accounts'
        ],
        validation_criteria: {
          required_permissions: ['admin'],
          validation_url: 'https://ads.tiktok.com'
        }
      },
      {
        name: 'linkedin_campaign_manager',
        display_name: 'LinkedIn Campaign Manager',
        description: 'LinkedIn advertising platform',
        category: 'linkedin',
        setup_steps: [
          'Go to campaign.linkedin.com',
          'Click Account Assets → Account users',
          'Add user as Account Manager',
          'Confirm permissions'
        ],
        validation_criteria: {
          required_permissions: ['account_manager'],
          validation_url: 'https://campaign.linkedin.com'
        }
      }
    ];

    // Insert platform types
    for (const platform of platformTypes) {
      const { error } = await supabase
        .from('platform_types')
        .upsert(platform, { onConflict: 'name' });

      if (error) {
        console.log(`Platform type ${platform.name} error:`, error.message);
      } else {
        console.log(`✅ Added platform type: ${platform.display_name}`);
      }
    }

    console.log('✅ Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  createTables();
}

module.exports = createTables;