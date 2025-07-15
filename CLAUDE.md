# Claude Code Instructions for Onboarding Dashboard Project

## Project Overview
This is a LIVE, fully-deployed client onboarding dashboard system for a digital marketing agency. The system helps clients connect their various platforms (Google, Meta, TikTok, LinkedIn, CMS, DNS, hosting) with AI assistance for technical challenges.

🚀 **PRODUCTION DEPLOYMENT**: https://onboarding-dashboard-nine.vercel.app/

## Architecture (COMPLETED & DEPLOYED)
- **Frontend**: React 18 application with routing, authentication, and responsive design
- **Backend**: Vercel serverless functions with Supabase PostgreSQL
- **Database**: Supabase PostgreSQL with complete schema and seeded data
- **Authentication**: JWT-based auth with protected routes
- **Deployment**: Vercel with automatic GitHub integration

## Project Structure (FINAL)
```
Onboarding Dashboard/
├── frontend/          # React dashboard (DEPLOYED)
├── api/               # Vercel serverless functions (DEPLOYED)
│   ├── auth/          # Authentication endpoints
│   ├── platforms/     # Platform management
│   └── index.js       # Main API router
├── public/            # Static files served by Vercel
├── Documentation/     # All project documentation
│   ├── planning/      # Architecture and design docs
│   ├── devlog/        # Development progress logs
│   └── instructions/  # Setup and deployment guides
├── CLAUDE.md         # This file - AI assistant instructions
└── README.md         # Project overview
```

## Implemented Features ✅

### 1. Dashboard Features (COMPLETED)
- ✅ Multi-step client registration wizard
- ✅ Progress tracking for each platform connection
- ✅ Visual status indicators (pending, in-progress, completed, error)
- ✅ Responsive design for mobile/desktop
- ✅ Protected routes with authentication

### 2. Authentication System (COMPLETED)
- ✅ JWT-based login/logout system
- ✅ Client registration with company details
- ✅ Token verification and protected routes
- ✅ Secure password-less authentication (email-based)

### 3. Platform Connections (COMPLETED)
- ✅ Google (Analytics, Ads, Search Console, My Business)
- ✅ Meta (Facebook Business Manager, Instagram, Pixel)
- ✅ TikTok (Ads Manager, Business Account, Pixel)
- ✅ LinkedIn (Campaign Manager, Company Page, Insight Tag)
- ✅ Website (CMS access, hosting, DNS)
- ✅ Platform types seeded in database

### 4. Backend API (COMPLETED)
- ✅ RESTful endpoints for client data
- ✅ Supabase PostgreSQL integration
- ✅ Authentication and session management
- ✅ CORS-enabled serverless functions
- ✅ Platform management endpoints

## Future Enhancements (Optional)
- AI chat assistant integration
- Real-time WebSocket updates
- Screen sharing/screenshot analysis
- Advanced progress tracking
- Email notifications

## Development Guidelines

### Code Standards
- Use modern ES6+ JavaScript
- Follow RESTful API conventions
- Implement proper error handling
- Add comprehensive logging
- Write unit tests for critical functions

### Security Requirements
- Secure credential handling
- Input validation and sanitization
- Rate limiting for API endpoints
- HTTPS enforcement
- Session management

### AI Integration
- Use environment variables for API keys
- Implement proper error handling for AI responses
- Add context awareness based on current platform
- Include fallback responses for AI failures

## Commands to Run
- **Frontend Development**: `cd frontend && npm start`
- **Frontend Build**: `cd frontend && npm run build`
- **Deploy**: `git push` (auto-deploys to Vercel)
- **Local API Testing**: `vercel dev`

## Environment Variables (CONFIGURED)
```
# Supabase (LIVE)
SUPABASE_URL=https://xwoawcacnaqjlcousygn.supabase.co
SUPABASE_ANON_KEY=[configured in Vercel]

# Authentication (LIVE)
JWT_SECRET=[configured in Vercel]

# Application
NODE_ENV=production
```

## API Endpoints (LIVE)
- **Main API**: https://onboarding-dashboard-nine.vercel.app/api/
- **Register**: POST /api/auth/register
- **Login**: POST /api/auth/login  
- **Verify Token**: GET /api/auth/verify
- **Platform Types**: GET /api/platforms/types
- **Test DB**: GET /api/test-db

## Current Development Status: COMPLETED ✅
**Project Status**: LIVE AND FULLY FUNCTIONAL
**Last Updated**: July 14, 2025
**Deployment**: Production-ready on Vercel
**Database**: Fully configured with seeded data
**Frontend**: React dashboard deployed and working
**Backend**: All API endpoints deployed and tested

### Recent Achievements
- ✅ Full-stack application deployed to production
- ✅ React frontend with authentication working perfectly
- ✅ All API endpoints functional
- ✅ Database schema complete with platform types seeded
- ✅ Responsive design confirmed working
- ✅ Git repository properly configured

## Working with Multiple Claude Instances
1. Always read this CLAUDE.md file first
2. Note that the project is COMPLETED and DEPLOYED
3. Check the live site: https://onboarding-dashboard-nine.vercel.app/
4. Any new features should be planned as enhancements to the existing system
5. Update this file if making significant architectural changes

## Important Notes
- ✅ This is a COMPLETED defensive security project for client onboarding
- ✅ All security best practices implemented (JWT auth, CORS, input validation)
- ✅ Production-ready with proper error handling
- ✅ Client data protection measures in place