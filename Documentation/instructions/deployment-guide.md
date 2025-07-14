# Deployment Guide - Client Onboarding Dashboard

## Infrastructure Setup

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down:
   - Project URL
   - Anon public key
   - Service role key (keep secret)

#### Configure Database
```sql
-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients (clients can only see their own data)
CREATE POLICY "Clients can view own data" ON clients FOR SELECT USING (id = current_user_id());
CREATE POLICY "Clients can update own data" ON clients FOR UPDATE USING (id = current_user_id());

-- Similar policies for other tables...
```

#### Environment Variables for Supabase
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres
```

### 2. Vercel Deployment

#### Frontend Deployment
1. Connect GitHub repository to Vercel
2. Set framework preset to "Create React App"
3. Set build command: `cd frontend && npm run build`
4. Set output directory: `frontend/build`

#### Backend Deployment (Serverless Functions)
1. Vercel automatically detects the backend structure
2. Functions are created from `/backend/src/` directory
3. Each route becomes a serverless function

#### Environment Variables in Vercel
```bash
# AI Integration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# Authentication
JWT_SECRET=your-32-char-secret
SESSION_SECRET=your-32-char-secret

# Application
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. DNS and Custom Domain

#### Vercel Custom Domain
1. Go to Vercel project settings
2. Add custom domain
3. Configure DNS records:
   - `A` record: `76.76.19.61`
   - `CNAME` record: `cname.vercel-dns.com`

#### SSL Certificate
- Vercel automatically provisions SSL certificates
- No additional configuration needed

## Deployment Process

### Automatic Deployment
1. Push to `main` branch triggers production deployment
2. Push to `develop` branch triggers preview deployment
3. Pull requests create preview deployments

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Deploy to production
vercel --prod
```

### Database Migration
```bash
# Run migrations on Supabase
# Execute from backend directory
node src/database/migrate.js
```

## Monitoring and Maintenance

### Vercel Analytics
- Enable Web Analytics in Vercel dashboard
- Monitor performance and errors
- Set up alerts for downtime

### Supabase Monitoring
- Monitor database performance
- Set up backup schedules
- Monitor API usage and limits

### Environment Management

#### Development
```bash
SUPABASE_URL=http://localhost:54321  # Local Supabase
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

#### Staging
```bash
SUPABASE_URL=https://staging-project.supabase.co
DATABASE_URL=postgresql://postgres:password@db.staging-project.supabase.co:5432/postgres
```

#### Production
```bash
SUPABASE_URL=https://your-project.supabase.co
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

## Security Checklist

### Supabase Security
- [ ] Enable Row Level Security (RLS)
- [ ] Configure proper RLS policies
- [ ] Use service role key only in backend
- [ ] Enable database backups
- [ ] Monitor database access logs

### Vercel Security
- [ ] Set environment variables securely
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Monitor function logs

### Application Security
- [ ] Validate all inputs
- [ ] Use HTTPS for all API calls
- [ ] Implement proper authentication
- [ ] Store sensitive data securely
- [ ] Regular security audits

## Scaling Considerations

### Database Scaling
- Supabase automatically handles read replicas
- Monitor connection pool usage
- Consider connection pooling for high traffic

### Function Scaling
- Vercel serverless functions auto-scale
- Monitor function duration and memory usage
- Optimize cold start times

### CDN and Caching
- Vercel Edge Network provides global CDN
- Configure cache headers appropriately
- Use static asset optimization

## Backup and Recovery

### Database Backups
- Supabase provides automatic daily backups
- Configure point-in-time recovery
- Test backup restoration process

### Code Backups
- Git repository serves as code backup
- Tag releases for easy rollback
- Maintain deployment documentation

## Cost Optimization

### Supabase Costs
- Monitor database size and API calls
- Optimize queries for performance
- Use appropriate subscription tier

### Vercel Costs
- Monitor function executions and bandwidth
- Optimize build times
- Use appropriate plan for usage

## Troubleshooting

### Common Deployment Issues
1. **Environment variables not set**: Check Vercel dashboard
2. **Database connection issues**: Verify Supabase credentials
3. **CORS errors**: Update CORS configuration
4. **Function timeouts**: Optimize function performance

### Debug Tools
- Vercel function logs
- Supabase dashboard logs
- Browser developer tools
- Application performance monitoring