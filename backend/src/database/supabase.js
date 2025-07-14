const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

class SupabaseDatabase {
  constructor() {
    this.supabase = null;
    this.pool = null;
  }

  async connect() {
    try {
      // Initialize Supabase client
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Initialize PostgreSQL connection pool for direct queries
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Test connection
      await this.pool.query('SELECT NOW()');
      console.log('Connected to Supabase PostgreSQL database');
      
    } catch (error) {
      console.error('Error connecting to Supabase:', error);
      throw error;
    }
  }

  async query(text, params = []) {
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async run(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return { 
        id: result.rows[0]?.id || result.insertId,
        changes: result.rowCount || 0,
        rows: result.rows
      };
    } catch (error) {
      console.error('Database run error:', error);
      throw error;
    }
  }

  async get(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Database get error:', error);
      throw error;
    }
  }

  async all(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows || [];
    } catch (error) {
      console.error('Database all error:', error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.pool) {
        await this.pool.end();
        console.log('Database connection pool closed');
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
      throw error;
    }
  }

  async migrate() {
    const migrations = [
      // Enable RLS (Row Level Security)
      'ALTER DATABASE postgres SET "app.jwt_secret" TO \'' + (process.env.JWT_SECRET || 'your-secret-key') + '\';',
      
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
      )`,

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
      )`,

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
      )`,

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
      )`,

      // User sessions table (for authentication)
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        session_token TEXT UNIQUE NOT NULL,
        refresh_token TEXT UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Admin users table
      `CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      )`,

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
      )`,

      // Function to update updated_at timestamp
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
       END;
       $$ language 'plpgsql';`,

      // Triggers for updated_at
      `DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
       CREATE TRIGGER update_clients_updated_at 
       BEFORE UPDATE ON clients 
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

      `DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
       CREATE TRIGGER update_chat_sessions_updated_at 
       BEFORE UPDATE ON chat_sessions 
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

      `DROP TRIGGER IF EXISTS update_platform_connections_last_updated ON platform_connections;
       CREATE TRIGGER update_platform_connections_last_updated 
       BEFORE UPDATE ON platform_connections 
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

      // Indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_clients_email ON clients (email)`,
      `CREATE INDEX IF NOT EXISTS idx_platform_connections_client ON platform_connections (client_id)`,
      `CREATE INDEX IF NOT EXISTS idx_platform_connections_status ON platform_connections (status)`,
      `CREATE INDEX IF NOT EXISTS idx_chat_sessions_client ON chat_sessions (client_id)`,
      `CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions (session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions (session_token)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions (expires_at)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_client ON activity_logs (client_id)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at)`
    ];

    for (const migration of migrations) {
      try {
        await this.pool.query(migration);
      } catch (error) {
        console.error('Migration error:', error);
        // Continue with other migrations even if one fails
      }
    }

    console.log('Supabase database migrations completed');
  }

  async seed() {
    // Insert default platform types
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

    for (const platform of platformTypes) {
      try {
        await this.pool.query(
          `INSERT INTO platform_types (name, display_name, description, category, setup_steps, validation_criteria)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (name) DO NOTHING`,
          [
            platform.name, 
            platform.display_name, 
            platform.description, 
            platform.category, 
            JSON.stringify(platform.setup_steps), 
            JSON.stringify(platform.validation_criteria)
          ]
        );
      } catch (error) {
        console.log(`Platform type ${platform.name} error:`, error.message);
      }
    }

    console.log('Supabase database seeded with platform types');
  }

  // Supabase-specific methods using the JS client
  async insertWithSupabase(table, data) {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
  }

  async selectWithSupabase(table, filters = {}) {
    try {
      let query = this.supabase.from(table).select('*');
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase select error:', error);
      throw error;
    }
  }

  async updateWithSupabase(table, id, data) {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const database = new SupabaseDatabase();
module.exports = database;