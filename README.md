# Client Onboarding Dashboard

A comprehensive dashboard system that guides digital marketing agency clients through the technical process of sharing access to their various platforms with AI-powered assistance.

## Features

- **Multi-step Onboarding Wizard**: Guided setup for multiple platforms
- **AI-Powered Technical Support**: Real-time chat assistance for technical challenges
- **Progress Tracking**: Visual indicators for each platform connection
- **Platform Integration**: Google, Meta, TikTok, LinkedIn, CMS, DNS, hosting
- **Real-time Updates**: Live notifications and status updates
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

```bash
# Clone and setup
cd "Onboarding Dashboard"
npm install

# Start development servers
npm run dev
```

Visit `http://localhost:3000` for the dashboard.

## Documentation

- **Setup Guide**: `Documentation/instructions/setup-guide.md`
- **Architecture**: `Documentation/planning/architecture.md`  
- **Development Log**: `Documentation/devlog/`
- **Claude Code Instructions**: `CLAUDE.md`

## Project Structure

```
├── frontend/          # React dashboard interface
├── backend/           # Node.js API server
├── database/          # Database schemas and migrations
├── Documentation/     # All project documentation
└── CLAUDE.md         # AI assistant instructions
```

## Tech Stack

- **Frontend**: React, CSS3, WebSocket client
- **Backend**: Node.js, Express, Socket.io
- **Database**: SQLite (dev), PostgreSQL (prod)
- **AI**: OpenAI GPT-4, Anthropic Claude
- **Authentication**: JWT tokens

## Platform Integrations

### Google Services
- Analytics, Search Console, Ads, My Business

### Meta (Facebook/Instagram)
- Business Manager, Pages, Pixel, Ads

### TikTok
- Ads Manager, Business Account, Pixel

### LinkedIn
- Campaign Manager, Company Pages, Insight Tag

### Website/Hosting
- CMS access, hosting panels, DNS management

## Development

See `Documentation/instructions/setup-guide.md` for detailed setup instructions.

### Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run backend` - Backend only
- `npm run frontend` - Frontend only
- `npm test` - Run tests
- `npm run build` - Build for production

## Contributing

This project uses multiple Claude Code instances. Before contributing:

1. Read `CLAUDE.md` for project context
2. Check latest devlog in `Documentation/devlog/`
3. Follow established patterns and conventions
4. Update documentation when making changes

## License

Private project for digital marketing agency use.