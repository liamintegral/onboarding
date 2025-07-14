# Supabase Database Setup Instructions

## Step 1: Get Your Database Password

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/xwoawcacnaqjlcousygn
2. Click on **Settings** in the left sidebar
3. Click on **Database** 
4. Look for the **Connection string** section
5. Your database password should be displayed there, or you can reset it if needed

## Step 2: Update Environment Variables

Once you have your database password, update the `.env` file in the backend directory:

```bash
# Replace YOUR_DATABASE_PASSWORD with your actual password
DATABASE_URL=postgresql://postgres:YOUR_DATABASE_PASSWORD@db.xwoawcacnaqjlcousygn.supabase.co:5432/postgres
```

## Step 3: Run Database Migration

After updating the password, run the following commands to create the database tables:

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Run the database migration
npm run db:migrate
```

This will create all the necessary tables:
- `clients` - Client information
- `platform_types` - Available platforms (Google, Meta, TikTok, etc.)
- `platform_connections` - Client's platform setup progress
- `chat_sessions` - AI assistant conversations
- `user_sessions` - Authentication sessions
- `admin_users` - Admin accounts
- `activity_logs` - System activity tracking

## Step 4: Verify Database Setup

You can verify the setup worked by:

1. **Using Supabase Dashboard**:
   - Go to your project dashboard
   - Click on **Table Editor** in the sidebar
   - You should see all the created tables

2. **Or test the API**:
   ```bash
   # Start the backend server
   npm run dev
   
   # Test the health endpoint
   curl http://localhost:3001/health
   ```

## Step 5: Optional - Add Sample Data

The migration automatically seeds the database with platform types (Google Analytics, Facebook Business Manager, etc.). No additional action needed.

## Troubleshooting

### Common Issues:

1. **"Password authentication failed"**
   - Double-check your password in the .env file
   - Make sure there are no extra spaces or characters

2. **"Connection timeout"**
   - Verify your internet connection
   - Check that the Supabase project is active

3. **"Permission denied"**
   - Ensure you're using the service role key, not the anon key
   - Verify the service role key is correct

### Getting Help:

If you encounter issues:
1. Check the console output for specific error messages
2. Verify all environment variables are set correctly
3. Ensure your Supabase project is not paused

## Next Steps After Database Setup:

1. **Start the backend server**: `npm run dev`
2. **Set up the frontend**: Install React dependencies and start the dashboard
3. **Test the full system**: Register a client and test platform connections
4. **Deploy to Vercel**: Push to GitHub and connect to Vercel for live deployment

## Database Schema Overview

```sql
-- Main tables structure:
clients (id, company_name, contact_name, email, ...)
├── platform_connections (client_id → clients.id)
├── chat_sessions (client_id → clients.id)  
├── user_sessions (client_id → clients.id)
└── activity_logs (client_id → clients.id)

platform_types (id, name, display_name, category, ...)
└── platform_connections (platform_type_id → platform_types.id)
```

The database is designed with proper foreign key constraints and indexes for optimal performance.