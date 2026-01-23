# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PetHelper is a Next.js 14 web application that provides AI-powered symptom checking for pets (dogs and cats). Pet owners can create pet profiles, describe symptoms, and receive AI-generated guidance on possible causes, severity, and when to visit a vet.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: SQLite with Prisma ORM v7 (uses @prisma/adapter-better-sqlite3)
- **Authentication**: NextAuth.js v5 (beta)
- **AI**: Anthropic Claude API

## Common Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma migrate dev --name <migration_name>  # Create and apply migration
npx prisma generate                              # Regenerate Prisma client
npx prisma studio                                # Open database GUI
npx prisma db push                               # Push schema changes (dev only)
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, signup)
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── pets/           # Pet CRUD endpoints
│   │   └── symptoms/       # Symptom analysis endpoint
│   ├── dashboard/          # User dashboard
│   └── pets/[id]/          # Pet detail pages (check, edit, history)
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components (Navbar)
│   ├── pets/               # Pet-related components (PetForm)
│   └── symptoms/           # Symptom checker components
├── lib/
│   ├── ai/                 # Claude API integration
│   │   ├── claude.ts       # API client
│   │   └── prompts.ts      # System prompts
│   ├── auth.ts             # NextAuth configuration
│   └── db.ts               # Prisma client singleton
└── types/                  # TypeScript type definitions
```

## Key Architecture Patterns

### Authentication Flow
- NextAuth.js v5 with credentials provider
- Session stored in JWT
- Protected routes use `auth()` from `@/lib/auth` to check session
- User ID available via `session.user.id`

### Database Access
- Prisma 7 with better-sqlite3 adapter in `src/lib/db.ts`
- Database config in `prisma.config.ts` (Prisma 7 pattern)
- JSON arrays stored as strings in SQLite (parse with `JSON.parse()`)
- Relations: User → Pet → SymptomCheck (cascade delete)

### AI Integration
- Claude API called from `/api/symptoms/analyze` route
- System prompt in `src/lib/ai/prompts.ts` defines AI behavior and safety rules
- Response must be valid JSON with specific structure
- Pet context (age, breed, conditions) included in each request

### Safety Features
- Client-side emergency keyword detection in `SymptomForm.tsx`
- Emergency keywords defined in `src/types/index.ts` (EMERGENCY_KEYWORDS array)
- AI system prompt enforces severity escalation for young/senior pets
- Non-dismissible disclaimer in every AI response

## Environment Variables

Required in `.env`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

## Data Models

- **User**: id, email, password (hashed), name, pets[]
- **Pet**: id, name, species (dog/cat), breed, age (months), weight, knownConditions, allergies, medications, userId
- **SymptomCheck**: id, petId, symptoms, possibleCauses, severityCategory, recommendations, whenToVisitVet, disclaimer

Severity categories: "Emergency", "Urgent", "Non-Urgent", "Monitor"

## Adding New Features

### New API Route
1. Create route file in `src/app/api/[path]/route.ts`
2. Use `auth()` to verify session
3. Use `prisma` from `@/lib/db` for database operations
4. Return `NextResponse.json()`

### New Page
1. Create page in `src/app/[path]/page.tsx`
2. Use `auth()` and `redirect("/login")` for protected pages
3. Use `await params` for dynamic route parameters (Next.js 15+ pattern)

### New Component
1. Add to appropriate directory under `src/components/`
2. Use shadcn/ui primitives from `@/components/ui/`
3. Add "use client" directive for client components
