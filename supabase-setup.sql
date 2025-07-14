-- Client Onboarding Dashboard - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- 1. Clients table
CREATE TABLE IF NOT EXISTS clients (
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
);

-- 2. Platform types table
CREATE TABLE IF NOT EXISTS platform_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  setup_steps JSONB,
  validation_criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Platform connections table
CREATE TABLE IF NOT EXISTS platform_connections (
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
);

-- 4. Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  platform_context TEXT,
  current_step TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- 7. Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
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
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients (email);
CREATE INDEX IF NOT EXISTS idx_platform_connections_client ON platform_connections (client_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_status ON platform_connections (status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_client ON chat_sessions (client_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions (session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_client ON activity_logs (client_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs (created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at 
BEFORE UPDATE ON clients 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at 
BEFORE UPDATE ON chat_sessions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert platform types
INSERT INTO platform_types (name, display_name, description, category, setup_steps, validation_criteria) VALUES
('google_analytics', 'Google Analytics', 'Web analytics service', 'google', 
 '["Go to Google Analytics account", "Navigate to Admin → User Management", "Add email with Edit permissions", "Confirm access grant"]'::jsonb,
 '{"required_permissions": ["edit"], "validation_url": "https://analytics.google.com"}'::jsonb
) ON CONFLICT (name) DO NOTHING;

INSERT INTO platform_types (name, display_name, description, category, setup_steps, validation_criteria) VALUES
('google_ads', 'Google Ads', 'Online advertising platform', 'google',
 '["Sign in to Google Ads", "Click Tools & Settings → Access and security", "Invite user with Admin access", "Share account ID"]'::jsonb,
 '{"required_permissions": ["admin"], "validation_url": "https://ads.google.com"}'::jsonb
) ON CONFLICT (name) DO NOTHING;

INSERT INTO platform_types (name, display_name, description, category, setup_steps, validation_criteria) VALUES
('google_search_console', 'Google Search Console', 'Website performance monitoring', 'google',
 '["Open Google Search Console", "Select your property", "Go to Settings → Users and permissions", "Add user with Full permissions"]'::jsonb,
 '{"required_permissions": ["full"], "validation_url": "https://search.google.com/search-console"}'::jsonb
) ON CONFLICT (name) DO NOTHING;

INSERT INTO platform_types (name, display_name, description, category, setup_steps, validation_criteria) VALUES
('facebook_business_manager', 'Facebook Business Manager', 'Meta business platform', 'meta',
 '["Go to business.facebook.com", "Navigate to Business Settings → People", "Add user with appropriate permissions", "Assign to relevant accounts and pages"]'::jsonb,
 '{"required_permissions": ["admin"], "validation_url": "https://business.facebook.com"}'::jsonb
) ON CONFLICT (name) DO NOTHING;

INSERT INTO platform_types (name, display_name, description, category, setup_steps, validation_criteria) VALUES
('tiktok_ads_manager', 'TikTok Ads Manager', 'TikTok advertising platform', 'tiktok',
 '["Go to ads.tiktok.com", "Navigate to Assets → User Management", "Add user with Admin role", "Assign to relevant ad accounts"]'::jsonb,
 '{"required_permissions": ["admin"], "validation_url": "https://ads.tiktok.com"}'::jsonb
) ON CONFLICT (name) DO NOTHING;

INSERT INTO platform_types (name, display_name, description, category, setup_steps, validation_criteria) VALUES
('linkedin_campaign_manager', 'LinkedIn Campaign Manager', 'LinkedIn advertising platform', 'linkedin',
 '["Go to campaign.linkedin.com", "Click Account Assets → Account users", "Add user as Account Manager", "Confirm permissions"]'::jsonb,
 '{"required_permissions": ["account_manager"], "validation_url": "https://campaign.linkedin.com"}'::jsonb
) ON CONFLICT (name) DO NOTHING;