# Database Setup

This directory contains the database schema and seed data for the proposals platform.

## Quick Setup

Follow these SQL commands step by step to set up the complete database:

### Step 1: Clear Database (if needed)
```bash
psql "postgresql://postgres:postgres@localhost:5432/proposals" -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
"
```

### Step 2: Create Core Tables
```bash
psql "postgresql://postgres:postgres@localhost:5432/proposals" -c "
-- Create extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create organizations table without default_tenant foreign key first
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY CHECK (length(id) = 8 AND id ~ '^[A-Za-z0-9_-]+$'),
  name TEXT NOT NULL,
  default_tenant TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  root_domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now add the foreign key constraint to organizations
ALTER TABLE organizations ADD CONSTRAINT organizations_default_tenant_fkey 
  FOREIGN KEY (default_tenant) REFERENCES tenants(id) ON DELETE SET NULL;
"
```

### Step 3: Create Remaining Tables
```bash
psql "postgresql://postgres:postgres@localhost:5432/proposals" -c "
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_organizations table
CREATE TABLE IF NOT EXISTS user_organizations (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner','admin','member')) NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, org_id)
);

-- Create tenant_profiles table
CREATE TABLE IF NOT EXISTS tenant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  version TEXT DEFAULT '1.0.0',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- Create tenant_references table
CREATE TABLE IF NOT EXISTS tenant_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  version TEXT DEFAULT '1.0.0',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- Create proposal_layouts table
CREATE TABLE IF NOT EXISTS proposal_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  version TEXT DEFAULT '1.0.0',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- Create proposal_content table
CREATE TABLE IF NOT EXISTS proposal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  data JSONB NOT NULL,
  version TEXT DEFAULT '1.0.0',
  is_draft BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug, is_draft)
);
"
```

### Step 4: Create Indexes and Triggers
```bash
psql "postgresql://postgres:postgres@localhost:5432/proposals" -c "
-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenants_org ON tenants(org_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org ON user_organizations(org_id);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_tenant ON tenant_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_references_tenant ON tenant_references(tenant_id);
CREATE INDEX IF NOT EXISTS idx_proposal_layouts_tenant ON proposal_layouts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_proposal_content_tenant_slug_draft ON proposal_content(tenant_id, slug, is_draft);
CREATE INDEX IF NOT EXISTS idx_proposal_content_tenant_draft ON proposal_content(tenant_id, is_draft);

-- JSONB indexes
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_branding ON tenant_profiles USING gin ((data->'branding'));
CREATE INDEX IF NOT EXISTS idx_proposal_content_sections ON proposal_content USING gin ((data->'sections'));

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Create triggers
CREATE OR REPLACE TRIGGER update_tenant_profiles_updated_at BEFORE UPDATE ON tenant_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_tenant_references_updated_at BEFORE UPDATE ON tenant_references
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_proposal_layouts_updated_at BEFORE UPDATE ON proposal_layouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_proposal_content_updated_at BEFORE UPDATE ON proposal_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
"
```

### Step 5: Load Seed Data
```bash
psql "postgresql://postgres:postgres@localhost:5432/proposals" -f scripts/seed-complete.sql
```

## Verification

After setup, verify everything is working:

```bash
# Check organizations and tenants
psql "postgresql://postgres:postgres@localhost:5432/proposals" -c "
SELECT 
  o.name as org_name, 
  o.id as org_id, 
  o.default_tenant,
  t.name as tenant_name,
  t.id as tenant_id
FROM organizations o
JOIN tenants t ON o.id = t.org_id;
"

# Check users and roles
psql "postgresql://postgres:postgres@localhost:5432/proposals" -c "
SELECT 
  u.email, 
  u.name, 
  uo.role,
  o.name as org_name
FROM users u
JOIN user_organizations uo ON u.id = uo.user_id
JOIN organizations o ON uo.org_id = o.id;
"

# Check proposal content
psql "postgresql://postgres:postgres@localhost:5432/proposals" -c "
SELECT 
  tenant_id, 
  slug, 
  is_draft,
  jsonb_array_length(data->'sections') as section_count
FROM proposal_content;
"
```

## What Gets Created

### Database Schema
- **organizations**: Organization management with nanoid format validation
- **tenants**: Tenant management linked to organizations  
- **users**: User accounts with authentication
- **user_organizations**: User-organization relationships with roles
- **tenant_profiles**: Tenant branding and configuration data
- **tenant_references**: Tenant testimonials and references
- **proposal_layouts**: Proposal section layouts per tenant
- **proposal_content**: Actual proposal content with sections array structure

### Sample Data
- **Organization**: Hive Gaming (`Kj8mN2pQ`)
- **Tenant**: hive-gaming with red branding (`#e10600`)
- **User**: eric@example.com / password (owner role)
- **Complete Proposal**: Coca-Cola & A8 Esports proposal with 11 sections
- **Tenant Profile**: Branding configuration
- **Proposal Layout**: All section types configured

## Troubleshooting

### Circular Dependency Issue
The `infra/sql/schema.sql` file has a circular dependency between `organizations` and `tenants` tables. Use the manual commands above instead of running the schema file directly.

### Connection Issues
Make sure PostgreSQL is running and accessible:
```bash
# Test connection
psql "postgresql://postgres:postgres@localhost:5432/proposals" -c "SELECT version();"
```

## Prerequisites

- PostgreSQL server running on localhost:5432
- Database `proposals` exists
- User `postgres` with password `postgres` has access
- `psql` command-line tool installed

## Files

- `seed-complete.sql` - Complete seed data with sample organization, tenant, user, and proposal
- `infra/sql/schema.sql` - Database schema (has circular dependency issues, use manual commands above)