# Proposals Platform — Next.js + PostgreSQL

A modern proposal management platform built with:

- **Next.js 14** with App Router for the frontend and API
- **PostgreSQL** with JSONB for flexible document storage
- **TypeScript** for type safety
- **Zod** for schema validation
- **Multi-tenant architecture** with isolated data per tenant
- **Draft/Live workflow** with localStorage drafts and database publishing

## Architecture

```
Browser (Portal) ──> Next.js (API routes) ──> PostgreSQL (JSONB)
Browser (View) ──> Next.js (Server Components) ──> PostgreSQL (JSONB)
```

## Quick Start

### 1. Database Setup

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Apply database schema
psql postgresql://postgres:postgres@localhost:5432/proposals -f infra/sql/schema.sql

# Apply Row Level Security policies
psql postgresql://postgres:postgres@localhost:5432/proposals -f infra/sql/rls-policies.sql

# Seed with A8 Esports tenant and Coca-Cola proposal
psql postgresql://postgres:postgres@localhost:5432/proposals -f seed-complete.sql
```

### 2. Environment Variables

Create `.env.local`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/proposals
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Development

```bash
npm install
npm run dev
```

### 4. Access the Platform

- **Portal (Editor)**: http://localhost:3000/portal
- **pgAdmin**: http://localhost:5050 (admin@admin.com / admin)

## Database Schema

The platform uses PostgreSQL with JSONB for flexible document storage and Row Level Security (RLS) for multi-tenant data isolation.

### Core Tables

```sql
-- Tenant management
tenants (id, name, root_domain, created_at)

-- User management  
users (id, email, created_at)
memberships (user_id, tenant_id, role)

-- Tenant data (JSONB)
tenant_profiles (tenant_id, data, created_at, updated_at)
tenant_references (tenant_id, data, created_at, updated_at)
proposal_layouts (tenant_id, data, created_at, updated_at)
proposal_content (tenant_id, slug, data, is_draft, created_at, updated_at)
```

### Data Structure

Each tenant's data includes:

- **Profile**: Branding, colors, company information
- **References**: Customer stories, testimonials, case studies
- **Layouts**: Section configurations and styling (multiple layouts per tenant)
- **Content**: Actual proposal data with sections

### Draft vs Live Separation

Some tables support draft/live separation with `is_draft` boolean:
- **Draft data** (`is_draft = true`): Work-in-progress content
- **Live data** (`is_draft = false`): Published, publicly accessible content

**Note**: Tenant profiles, proposal layouts, and tenant references do not have draft functionality since they represent company branding, structure, and customer stories that don't change frequently.

## Data Flow

### Portal Workflow (`/portal`)

1. **Load tenant profile** from database
2. **Compose proposal** using section components
3. **Save draft** to localStorage for immediate preview
4. **Publish to live** saves to database for public access

### Proposal Rendering (`/proposal/[slug]`)

1. **Live proposals**: Database only (no fallbacks)
2. **Draft previews**: Database only (no seed file fallbacks)
3. **Tenant detection**: Automatically finds which tenant published the proposal

### API Endpoints

- **`/api/tenants`** - List tenants and get tenant profiles
- **`/api/sections`** - Save proposal data to database
- **`/api/proposals`** - List proposals for a tenant
- **`/api/db-test`** - Database connection testing

## Multi-Tenant Architecture

### Data Isolation

- **Row Level Security (RLS)** ensures tenants can only access their own data
- **Tenant context functions** manage session-based tenant isolation
- **Database-level security** prevents cross-tenant data leakage

### Tenant Management

- **Tenant profiles** store branding and company information
- **Multiple layouts** per tenant for different proposal types
- **Isolated references** and content per tenant

## Development Workflow

### Creating Proposals

1. **Access portal** at `/portal`
2. **Select tenant** from dropdown
3. **Add sections** using the "+ Add section" button
4. **Fill in content** for each section
5. **Save draft** for immediate preview
6. **Publish to live** for public access

### Editing Existing Proposals

1. **Navigate** to `/portal?tenant=<tenant>&slug=<slug>`
2. **Form auto-loads** with current data
3. **Make changes** to any fields
4. **Save draft** or **publish updates**

### Section Components

The platform includes pre-built section components:

- **Hero** (simple, imageLeft, backgroundImg)
- **Overview** (opportunity)
- **Objectives** (strategy)
- **Campaign** (overview)
- **Activation** (details)
- **Timeline** (steps)
- **Amplification** (content)
- **Measurement** (success)
- **Roles** (responsibilities)
- **Budget** (pricing)
- **Contact** (info)

## Database Management

### pgAdmin Access

- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Password**: admin
- **Database**: `db` (service name in docker-compose)

### Common Database Queries

```sql
-- List all tenants
SELECT * FROM tenants;

-- Check tenant profiles
SELECT tenant_id, data->'branding'->>'name' as brand_name 
FROM tenant_profiles WHERE is_draft = false;

-- List proposals for a tenant
SELECT slug, updated_at FROM proposal_content 
WHERE tenant_id = 'coca-cola' AND is_draft = false;

-- Check layouts for a tenant
SELECT tenant_id, is_draft FROM proposal_layouts 
WHERE tenant_id = 'coca-cola';
```

### Resetting the Database

```bash
# Stop containers
docker-compose down

# Remove volume (complete reset)
docker volume rm proposal_generator_pgdata

# Start fresh
docker-compose up -d db

# Apply schema and seed data
psql postgresql://postgres:postgres@localhost:5432/proposals -f infra/sql/schema.sql
psql postgresql://postgres:postgres@localhost:5432/proposals -f infra/sql/rls-policies.sql
psql postgresql://postgres:postgres@localhost:5432/proposals -f seed-complete.sql
```

## File Structure

```
app/
├── api/
│   ├── db-test/route.ts      # Database testing
│   ├── sections/route.ts     # Save layout/content (DB)
│   ├── tenants/route.ts      # Tenant management (DB)
│   └── proposals/route.ts    # List proposals (DB)
├── portal/page.tsx           # Proposal editor
├── proposal/
│   ├── page.tsx              # Index page
│   └── [slug]/page.tsx       # Proposal renderer
└── page.tsx                  # Landing page

components/
├── sections/
│   ├── registry.ts           # Section component registry
│   └── variants/             # Section component variants
├── FormField.tsx             # Form field components
└── PortalLayout.tsx          # Portal layout

lib/
├── db.ts                     # Database helpers
├── schemas.ts                # Zod schemas
├── merge.ts                  # Deep merge utilities
├── interpolate.ts            # Token interpolation
└── references.ts             # Reference resolution

infra/
└── sql/
    ├── schema.sql            # Database schema
    └── rls-policies.sql      # Row Level Security policies
```

## Key Features

- **Multi-tenant support** - Each tenant has isolated data
- **Draft/Live workflow** - Save drafts locally, publish to database
- **Flexible content** - JSONB allows easy schema evolution
- **Public URLs** - Live proposals are publicly accessible
- **Type safety** - Full TypeScript + Zod validation
- **Database-only architecture** - No seed file fallbacks
- **Row Level Security** - Database-level tenant isolation
- **Multiple layouts per tenant** - Flexible layout management

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
curl http://localhost:3000/api/db-test

# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs db
```

### Missing Data

```sql
-- Check if tenant exists
SELECT * FROM tenants WHERE id = 'coca-cola';

-- Check if tenant has profiles
SELECT * FROM tenant_profiles WHERE tenant_id = 'coca-cola';

-- Check if tenant has layouts
SELECT * FROM proposal_layouts WHERE tenant_id = 'coca-cola';
```

### Reset Everything

```bash
# Complete reset
docker-compose down
docker volume rm proposal_generator_pgdata
docker-compose up -d
psql postgresql://postgres:postgres@localhost:5432/proposals -f infra/sql/schema.sql
psql postgresql://postgres:postgres@localhost:5432/proposals -f infra/sql/rls-policies.sql
psql postgresql://postgres:postgres@localhost:5432/proposals -f seed-complete.sql
```

## Production Considerations

- **Environment variables** - Set proper DATABASE_URL for production
- **Database backups** - Regular backups of PostgreSQL data
- **Security** - Implement proper authentication and authorization
- **Performance** - Monitor database performance and add indexes as needed
- **Scaling** - Consider read replicas for high-traffic proposals

