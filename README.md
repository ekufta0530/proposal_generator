# Proposals Platform — Next.js + PostgreSQL

A modern proposal management platform built with:

- **Next.js 14** with App Router for the frontend and API
- **PostgreSQL** with JSONB for flexible document storage
- **TypeScript** for type safety
- **Zod** for schema validation

## Architecture

```
Browser (Portal) ──> Next.js (API routes) ──> PostgreSQL (JSONB)
Browser (View) ──> Next.js (Server Components) ──> PostgreSQL (JSONB)
```

## Data Flow

- **Portal** (`/portal`) ──> loads tenant profile (DB) → composes proposal → saves to DB
- **Live View** (`/proposal/[slug]`) ──> loads profile + references (DB) → layout (DB) → content (DB)
- **Draft Preview** (`/proposal/[slug]?draft=1`) ──> loads from localStorage → falls back to seed data

## Database Schema

The platform uses PostgreSQL with JSONB for flexible document storage:

- **`tenant_profiles`** - Branding and layout defaults
- **`tenant_references`** - Customer stories and testimonials  
- **`proposal_layouts`** - Section configurations
- **`proposal_content`** - Actual proposal data

Each table supports draft/live separation with `is_draft` boolean.

## Setup

### 1) PostgreSQL Database

```bash
# Start the database
docker-compose up -d db

# Apply schema
psql postgresql://postgres:postgres@localhost:5432/proposals -f infra/sql/schema.sql
```

### 2) Environment Variables

Create `.env.local`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/proposals
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3) Development

```bash
npm install
npm run dev
```

## Key Features

- **Multi-tenant support** - Each tenant has isolated data
- **Draft/Live workflow** - Save drafts locally, publish to database
- **Flexible content** - JSONB allows easy schema evolution
- **Public URLs** - Live proposals are publicly accessible
- **Type safety** - Full TypeScript + Zod validation

## File Structure

```
app/
├── api/
│   ├── db-test/route.ts      # Database testing
│   ├── sections/route.ts     # Save layout/content (DB)
│   └── tenants/route.ts      # Tenant management (DB)
├── portal/page.tsx           # Proposal editor
├── proposal/
│   ├── page.tsx              # Index page
│   └── [slug]/page.tsx       # Proposal renderer
└── page.tsx                  # Landing page

lib/
├── db.ts                     # Database helpers
├── schemas.ts                # Zod schemas
├── merge.ts                  # Deep merge utilities
├── interpolate.ts            # Token interpolation
└── references.ts             # Reference resolution

infra/
└── sql/
    └── schema.sql            # Database schema
```

## Data Loading Strategy

1. **Live proposals**: Database only (no fallbacks)
2. **Draft previews**: Database → Local fallbacks for development
3. **Portal**: Database for tenant profiles, localStorage for drafts

## Development Workflow

1. **Create/Edit** - Use portal to build proposals
2. **Save Draft** - Save to localStorage for preview
3. **Preview Draft** - See how your proposal looks
4. **Publish to Live** - Save to database for public access
5. **View Live** - See the published version

