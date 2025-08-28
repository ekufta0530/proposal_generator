create extension if not exists pgcrypto;

-- Core tenant and user management
create table if not exists tenants (
  id text primary key,
  name text not null,
  root_domain text,
  created_at timestamptz default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists memberships (
  user_id uuid references users(id) on delete cascade,
  tenant_id text references tenants(id) on delete cascade,
  role text check (role in ('owner','editor','viewer')) not null,
  primary key (user_id, tenant_id)
);

-- Tenant profiles (branding, layout defaults, etc.)
create table if not exists tenant_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  data jsonb not null,
  version text default '1.0.0',
  is_draft boolean default false,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id, is_draft)
);

-- Tenant references (customer stories, testimonials, etc.)
create table if not exists tenant_references (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  data jsonb not null,
  version text default '1.0.0',
  is_draft boolean default false,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id, is_draft)
);

-- Proposal layouts (section configurations)
create table if not exists proposal_layouts (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  data jsonb not null,
  version text default '1.0.0',
  is_draft boolean default false,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id, is_draft)
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
create index if not exists idx_tenant_profiles_tenant_draft on tenant_profiles(tenant_id, is_draft);
create index if not exists idx_tenant_references_tenant_draft on tenant_references(tenant_id, is_draft);
create index if not exists idx_proposal_layouts_tenant_draft on proposal_layouts(tenant_id, is_draft);
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

create trigger update_tenant_profiles_updated_at before update on tenant_profiles
  for each row execute function update_updated_at_column();

create trigger update_tenant_references_updated_at before update on tenant_references
  for each row execute function update_updated_at_column();

create trigger update_proposal_layouts_updated_at before update on proposal_layouts
  for each row execute function update_updated_at_column();

create trigger update_proposal_content_updated_at before update on proposal_content
  for each row execute function update_updated_at_column();

-- Insert default tenant if it doesn't exist
insert into tenants (id, name) values ('default', 'Default Co') 
on conflict (id) do nothing;
