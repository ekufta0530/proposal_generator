create extension if not exists pgcrypto;

-- Core organization and tenant management
create table if not exists organizations (
  id text primary key check (length(id) = 8 and id ~ '^[A-Za-z0-9_-]+$'),
  name text not null,
  default_tenant text references tenants(id) on delete set null,
  created_at timestamptz default now()
);

-- Core tenant and user management
create table if not exists tenants (
  id text primary key,
  name text not null,
  org_id text not null references organizations(id) on delete cascade,
  root_domain text,
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User-Organization relationships
create table if not exists user_organizations (
  user_id uuid references users(id) on delete cascade,
  org_id text references organizations(id) on delete cascade,
  role text check (role in ('owner','admin','member')) not null default 'member',
  created_at timestamptz default now(),
  primary key (user_id, org_id)
);

-- User-Tenant relationships removed - all access controlled via organization membership

-- Legacy memberships table removed - using organization-based access control only

-- Tenant profiles (branding, company information, etc.)
create table if not exists tenant_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  data jsonb not null,
  version text default '1.0.0',
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id)
);

-- Tenant references (customer stories, testimonials, etc.)
create table if not exists tenant_references (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  data jsonb not null,
  version text default '1.0.0',
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id)
);

-- Proposal layouts (section configurations)
create table if not exists proposal_layouts (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  data jsonb not null,
  version text default '1.0.0',
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id)
);

-- Proposal content (actual proposal data)
create table if not exists proposal_content (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  slug text not null,
  data jsonb not null,
  version text default '1.0.0',
  is_draft boolean default false,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id, slug, is_draft)
);

-- Indexes for better performance
create index if not exists idx_tenants_org on tenants(org_id);
create index if not exists idx_user_organizations_user on user_organizations(user_id);
create index if not exists idx_user_organizations_org on user_organizations(org_id);
-- User-tenant indexes removed
create index if not exists idx_tenant_profiles_tenant on tenant_profiles(tenant_id);
create index if not exists idx_tenant_references_tenant on tenant_references(tenant_id);
create index if not exists idx_proposal_layouts_tenant on proposal_layouts(tenant_id);
create index if not exists idx_proposal_content_tenant_slug_draft on proposal_content(tenant_id, slug, is_draft);
create index if not exists idx_proposal_content_tenant_draft on proposal_content(tenant_id, is_draft);

-- JSONB indexes for common query patterns
create index if not exists idx_tenant_profiles_branding on tenant_profiles using gin ((data->'branding'));
create index if not exists idx_proposal_content_sections on proposal_content using gin ((data->'sections'));

-- Triggers to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger update_tenant_profiles_updated_at before update on tenant_profiles
  for each row execute function update_updated_at_column();

create or replace trigger update_tenant_references_updated_at before update on tenant_references
  for each row execute function update_updated_at_column();

create or replace trigger update_proposal_layouts_updated_at before update on proposal_layouts
  for each row execute function update_updated_at_column();

create or replace trigger update_proposal_content_updated_at before update on proposal_content
  for each row execute function update_updated_at_column();

create or replace trigger update_users_updated_at before update on users
  for each row execute function update_updated_at_column();

-- Insert default organization and tenant if they don't exist
insert into organizations (id, name, default_tenant) values ('X9kL3mPq', 'Default Organization', 'default') 
on conflict (id) do nothing;

insert into tenants (id, name, org_id) values ('default', 'Default Co', 'X9kL3mPq') 
on conflict (id) do nothing;
