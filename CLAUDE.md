# Claude Code Instructions for Onboarding Dashboard Project

## Project Overview
This is a client onboarding dashboard system for a digital marketing agency. The system helps clients connect their various platforms (Google, Meta, TikTok, LinkedIn, CMS, DNS, hosting) with AI assistance for technical challenges.

## Architecture
- **Frontend**: Modern dashboard interface (React/vanilla JS)
- **Backend**: Node.js/Express API server with AI integration
- **Database**: SQLite for development, PostgreSQL for production
- **AI**: Integrated chat assistant for real-time technical support
- **Real-time**: WebSocket connections for live updates

## Project Structure
```
Onboarding Dashboard/
├── frontend/          # Dashboard UI
├── backend/           # API server
├── database/          # Database schemas and migrations
├── Documentation/     # All project documentation
│   ├── planning/      # Architecture and design docs
│   ├── devlog/        # Development progress logs
│   └── instructions/  # Setup and deployment guides
├── CLAUDE.md         # This file - AI assistant instructions
└── README.md         # Project overview
```

## Key Components to Implement

### 1. Dashboard Features
- Multi-step onboarding wizard
- Progress tracking for each platform connection
- Visual status indicators (pending, in-progress, completed, error)
- Responsive design for mobile/desktop
- Real-time notifications

### 2. AI Assistant Integration
- Context-aware technical support chat
- Platform-specific guidance
- Troubleshooting workflows
- Screen sharing/screenshot analysis
- Step-by-step visual confirmations

### 3. Platform Connections
- Google (Analytics, Ads, Search Console, My Business)
- Meta (Facebook Business Manager, Instagram, Pixel)
- TikTok (Ads Manager, Business Account, Pixel)
- LinkedIn (Campaign Manager, Company Page, Insight Tag)
- Website (CMS access, hosting, DNS)

### 4. Backend API
- RESTful endpoints for client data
- AI model integration (OpenAI/Anthropic)
- Authentication and session management
- WebSocket for real-time updates
- Progress tracking and validation

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
- **Development**: `npm run dev` (starts both frontend and backend)
- **Backend only**: `cd backend && npm start`
- **Frontend only**: `cd frontend && npm start`
- **Tests**: `npm test`
- **Build**: `npm run build`
- **Database**: `npm run db:migrate`

## Environment Variables Required
```
# AI Integration
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Database
DATABASE_URL=sqlite://./database/onboarding.db
DATABASE_URL_PROD=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## Current Development Status
Check `Documentation/devlog/` for the latest development progress and `Documentation/planning/` for detailed specifications.

## Working with Multiple Claude Instances
1. Always read this CLAUDE.md file first
2. Check the latest devlog entry in `Documentation/devlog/`
3. Review the current todo list status
4. Update devlog when making significant changes
5. Keep this file updated with new requirements or architecture changes

## Important Notes
- This is a defensive security project focused on helping clients securely share platform access
- Never generate code for malicious purposes
- Always follow security best practices
- Prioritize user data protection and secure credential handling