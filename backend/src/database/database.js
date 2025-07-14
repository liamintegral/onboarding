const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'database', 'onboarding.db');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }

  async migrate() {
    const migrations = [
      // Clients table
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        website TEXT,
        industry TEXT,
        goals TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Platform types table
      `CREATE TABLE IF NOT EXISTS platform_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        setup_steps TEXT,
        validation_criteria TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Platform connections table
      `CREATE TABLE IF NOT EXISTS platform_connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        platform_type_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'error', 'skipped')),
        progress_percentage INTEGER DEFAULT 0,
        access_granted BOOLEAN DEFAULT FALSE,
        credentials_provided BOOLEAN DEFAULT FALSE,
        validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validating', 'valid', 'invalid', 'error')),
        notes TEXT,
        error_message TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (platform_type_id) REFERENCES platform_types (id)
      )`,

      // Chat sessions table
      `CREATE TABLE IF NOT EXISTS chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        session_id TEXT UNIQUE NOT NULL,
        platform_context TEXT,
        current_step TEXT,
        messages TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // User sessions table (for authentication)
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        refresh_token TEXT UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // Admin users table
      `CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )`,

      // Activity logs table
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        admin_id INTEGER,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id INTEGER,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (admin_id) REFERENCES admin_users (id)
      )`,

      // Indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_clients_email ON clients (email)`,
      `CREATE INDEX IF NOT EXISTS idx_platform_connections_client ON platform_connections (client_id)`,
      `CREATE INDEX IF NOT EXISTS idx_platform_connections_status ON platform_connections (status)`,
      `CREATE INDEX IF NOT EXISTS idx_chat_sessions_client ON chat_sessions (client_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions (session_token)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_client ON activity_logs (client_id)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at)`
    ];

    for (const migration of migrations) {
      await this.run(migration);
    }

    console.log('Database migrations completed');
  }

  async seed() {
    // Insert default platform types
    const platformTypes = [
      {
        name: 'google_analytics',
        display_name: 'Google Analytics',
        description: 'Web analytics service',
        category: 'google',
        setup_steps: JSON.stringify([
          'Go to Google Analytics account',
          'Navigate to Admin → User Management',
          'Add email with Edit permissions',
          'Confirm access grant'
        ]),
        validation_criteria: JSON.stringify({
          required_permissions: ['edit'],
          validation_url: 'https://analytics.google.com'
        })
      },
      {
        name: 'google_ads',
        display_name: 'Google Ads',
        description: 'Online advertising platform',
        category: 'google',
        setup_steps: JSON.stringify([
          'Sign in to Google Ads',
          'Click Tools & Settings → Access and security',
          'Invite user with Admin access',
          'Share account ID'
        ]),
        validation_criteria: JSON.stringify({
          required_permissions: ['admin'],
          validation_url: 'https://ads.google.com'
        })
      },
      {
        name: 'google_search_console',
        display_name: 'Google Search Console',
        description: 'Website performance monitoring',
        category: 'google',
        setup_steps: JSON.stringify([
          'Open Google Search Console',
          'Select your property',
          'Go to Settings → Users and permissions',
          'Add user with Full permissions'
        ]),
        validation_criteria: JSON.stringify({
          required_permissions: ['full'],
          validation_url: 'https://search.google.com/search-console'
        })
      },
      {
        name: 'facebook_business_manager',
        display_name: 'Facebook Business Manager',
        description: 'Meta business platform',
        category: 'meta',
        setup_steps: JSON.stringify([
          'Go to business.facebook.com',
          'Navigate to Business Settings → People',
          'Add user with appropriate permissions',
          'Assign to relevant accounts and pages'
        ]),
        validation_criteria: JSON.stringify({
          required_permissions: ['admin'],
          validation_url: 'https://business.facebook.com'
        })
      },
      {
        name: 'tiktok_ads_manager',
        display_name: 'TikTok Ads Manager',
        description: 'TikTok advertising platform',
        category: 'tiktok',
        setup_steps: JSON.stringify([
          'Go to ads.tiktok.com',
          'Navigate to Assets → User Management',
          'Add user with Admin role',
          'Assign to relevant ad accounts'
        ]),
        validation_criteria: JSON.stringify({
          required_permissions: ['admin'],
          validation_url: 'https://ads.tiktok.com'
        })
      },
      {
        name: 'linkedin_campaign_manager',
        display_name: 'LinkedIn Campaign Manager',
        description: 'LinkedIn advertising platform',
        category: 'linkedin',
        setup_steps: JSON.stringify([
          'Go to campaign.linkedin.com',
          'Click Account Assets → Account users',
          'Add user as Account Manager',
          'Confirm permissions'
        ]),
        validation_criteria: JSON.stringify({
          required_permissions: ['account_manager'],
          validation_url: 'https://campaign.linkedin.com'
        })
      }
    ];

    for (const platform of platformTypes) {
      try {
        await this.run(
          `INSERT OR IGNORE INTO platform_types (name, display_name, description, category, setup_steps, validation_criteria)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [platform.name, platform.display_name, platform.description, platform.category, platform.setup_steps, platform.validation_criteria]
        );
      } catch (error) {
        console.log(`Platform type ${platform.name} already exists or error:`, error.message);
      }
    }

    console.log('Database seeded with platform types');
  }
}

// Export singleton instance
const database = new Database();
module.exports = database;