# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack AI character chat application with:
- **Frontend**: Next.js 14.1.0 (App Router) with React 18.2.0
- **Backend**: Express 5.1.0 with MongoDB/Mongoose
- **Features**: AI character conversations, subscription management (Stripe), multi-language support (ja/en)

## Essential Commands

```bash
# Development (runs both frontend and backend)
npm run dev

# Frontend only
cd frontend && npm run dev

# Backend only  
cd backend && npm run dev

# Testing
npm test                    # Run unit tests (frontend)
npm run test:coverage       # Run tests with coverage report
npm run test:e2e           # Run Playwright E2E tests
npm run test:e2e:ui        # Run E2E tests with UI
npm run test:e2e:debug     # Debug E2E tests

# Build
cd frontend && npm run build

# Linting
cd frontend && npm run lint
```

## Architecture & Key Patterns

### API Communication
- Frontend calls backend API through Next.js rewrites: `/api/*` → `http://localhost:5000/api/*`
- This prevents cookie domain mismatch issues in development
- Set `NEXT_PUBLIC_API_URL=/api` in frontend `.env`

### Authentication
- JWT-based authentication stored in httpOnly cookies
- Separate admin authentication system
- Auth middleware protects API routes
- `useRequireAuth` hook for frontend route protection

### Database Models
- **User**: Subscription management, authentication
- **Character**: AI character definitions with voice/image
- **Chat**: Conversation history
- **Admin**: Separate admin accounts

### Routing Structure
- **User Pages**: `/app/[locale]/` - Supports ja/en localization
- **Admin Pages**: `/app/admin/` - Japanese only, no i18n
- **API Routes**: RESTful design under `/api/`
- **Admin API**: `/api/admin/*` with admin auth middleware

## Critical Development Rules

### Styling
- **CSS classes only** - No inline styles except when absolutely necessary
- Use CSS Modules or regular CSS files
- If inline style is needed, add comment explaining why

### Internationalization (i18n)
- User-facing pages: Support both Japanese (ja) and English (en)
- Admin pages (`/admin/*`): Japanese only - do NOT use `t()` or i18n
- Translation files: `/frontend/messages/[locale].json`

### Git Workflow
- Always create new branches from `main` for any work
- Never commit directly to main
- All communication in Japanese

### Code Conventions
- Follow existing patterns in the codebase
- Check neighboring files for framework/library usage
- Never assume a library is available - verify in package.json
- No comments unless specifically requested

## Environment Variables

### Backend (.env)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL=/api` - API base URL (use `/api` for development)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Testing Requirements
- Jest with React Testing Library for unit tests
- Playwright for E2E tests (Chrome, Firefox, Safari)
- Coverage target: 80% (branches, functions, lines, statements)

## Common Tasks

### Adding a New Character
1. Create character in admin panel (`/admin/characters/new`)
2. Upload image and voice sample
3. Define personality and conversation style

### Subscription Management
- Handled via Stripe webhooks
- Automatic downgrade script: `/scripts/downgradeExpiredUsers.js`
- Premium features controlled by `user.subscriptionStatus`

### Database Operations
- Migrations in `/backend/migrations/`
- Seed scripts in `/backend/scripts/`
- Test data: `npm run seed` (backend directory)