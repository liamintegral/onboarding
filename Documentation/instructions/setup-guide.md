# Setup Guide - Client Onboarding Dashboard

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git for version control
- Code editor (VS Code recommended)

## Initial Setup

### 1. Environment Variables
Create `.env` files in both frontend and backend directories:

#### Backend `.env`
```bash
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

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend `.env`
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001
REACT_APP_NODE_ENV=development
```

### 2. Installation

```bash
# Clone/navigate to project directory
cd "Onboarding Dashboard"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Database Setup

```bash
# Initialize database (from backend directory)
cd backend
npm run db:migrate
npm run db:seed  # Optional: add sample data
```

### 4. Development Server

```bash
# Start both frontend and backend (from root directory)
npm run dev

# Or start individually:
npm run backend  # Backend only
npm run frontend # Frontend only
```

## Development Workflow

### File Structure
```
Onboarding Dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API calls
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS files
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   ├── database/
│   │   ├── migrations/    # Database migrations
│   │   └── seeds/         # Sample data
│   └── package.json
├── Documentation/
└── CLAUDE.md
```

### Available Scripts

#### Root Directory
- `npm run dev` - Start both frontend and backend
- `npm run backend` - Start backend only
- `npm run frontend` - Start frontend only
- `npm run build` - Build for production
- `npm test` - Run all tests

#### Backend Directory
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database
- `npm test` - Run backend tests

#### Frontend Directory
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run frontend tests
- `npm run lint` - Run ESLint

## API Documentation

### Authentication
All API requests (except registration/login) require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Base URL
Development: `http://localhost:3001/api`

### Key Endpoints
- `POST /auth/register` - Register new client
- `POST /auth/login` - Client login
- `GET /clients/:id` - Get client details
- `GET /clients/:id/platforms` - Get platform connection status
- `POST /chat/message` - Send message to AI assistant

## Working with Multiple Claude Code Instances

### Before Starting Work
1. Read `CLAUDE.md` for project context
2. Check latest devlog entry in `Documentation/devlog/`
3. Review current todo list status
4. Understand the current development phase

### During Development
1. Update todo list when starting/completing tasks
2. Document significant decisions in devlog
3. Follow established code patterns and conventions
4. Test changes before committing

### After Making Changes
1. Update devlog with progress made
2. Update CLAUDE.md if architecture changes
3. Run tests to ensure nothing is broken
4. Update documentation if APIs change

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

#### Database Connection Issues
```bash
# Reset database
cd backend
npm run db:reset
npm run db:migrate
```

#### Environment Variables Not Loading
- Ensure `.env` files are in correct directories
- Restart development servers after changing .env files
- Check file naming (should be exactly `.env`)

#### AI API Issues
- Verify API keys are valid and have sufficient credits
- Check network connectivity
- Review API rate limits

### Getting Help
1. Check existing documentation in `Documentation/`
2. Review error logs in terminal
3. Check API response status codes
4. Use browser developer tools for frontend issues

## Deployment

### Development
Already covered above - use `npm run dev`

### Production
```bash
# Build frontend
cd frontend
npm run build

# Start production backend
cd ../backend
NODE_ENV=production npm start
```

### Environment Setup for Production
- Use PostgreSQL instead of SQLite
- Set proper JWT secrets
- Configure HTTPS
- Set up monitoring and logging
- Use PM2 for process management

## Security Checklist
- [ ] Environment variables properly configured
- [ ] API keys not committed to version control
- [ ] HTTPS enabled in production
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Authentication working properly
- [ ] CORS configured correctly