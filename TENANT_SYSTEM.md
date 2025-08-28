# Tenant System

The proposal platform supports multiple tenants with isolated data and branding.

## Architecture

- **Multi-tenant data isolation** - Each tenant has separate database records
- **Profile management** - Tenant profiles are stored in PostgreSQL with JSONB
- **Branding customization** - Colors, logos, and layout defaults per tenant
- **Public proposal access** - Live proposals are publicly accessible

## Database Schema

### Core Tables

```sql
-- Tenant management
tenants (id, name, root_domain, created_at)

-- Tenant data (JSONB)
tenant_profiles (tenant_id, data, is_draft, created_at, updated_at)
tenant_references (tenant_id, data, is_draft, created_at, updated_at)
proposal_layouts (tenant_id, data, is_draft, created_at, updated_at)
proposal_content (tenant_id, slug, data, is_draft, created_at, updated_at)
```

### Data Structure

Each tenant's data includes:

- **Profile**: Branding, colors, layout defaults
- **References**: Customer stories, testimonials, case studies
- **Layouts**: Section configurations and styling
- **Content**: Actual proposal data

## API Endpoints

### `/api/tenants`

**GET** - List all tenants or get specific tenant profile

```bash
# List all tenants
GET /api/tenants

# Get specific tenant profile
GET /api/tenants?tenant=acme
```

**Response:**
```json
{
  "success": true,
  "tenant": "acme",
  "profile": {
    "branding": {
      "name": "Acme Corp",
      "colors": {
        "primary": "#4f46e5",
        "secondary": "#10b981"
      }
    },
    "layoutDefaults": {
      "sections": [...]
    }
  }
}
```

### `/api/sections`

**POST** - Save proposal data to database

```json
{
  "tenant": "acme",
  "layout": { "sections": [...] },
  "proposal": {
    "slug": "yeti",
    "Hero": { "title": "Proposal Title" },
    "profile": { ... },
    "references": { ... }
  },
  "isDraft": false
}
```

## Portal Interface

### Tenant Selection

The portal includes a tenant dropdown that:

1. **Loads available tenants** from the database
2. **Displays tenant branding** (name and primary color)
3. **Saves selection** to localStorage for persistence
4. **Updates profile data** when tenant changes

### Data Flow

1. **Portal loads** → Fetches tenant list from `/api/tenants`
2. **Tenant selected** → Loads profile from database
3. **Proposal created** → Uses tenant's layout defaults
4. **Draft saved** → Stored in localStorage
5. **Published** → Saved to database with tenant association

## Proposal Rendering

### Live Proposals (`/proposal/[slug]`)

1. **Database** - Check for live profile in database
2. **Tenant detection** - Automatically find which tenant published the proposal
3. **Data loading** - Load profile, references, layout, and content from database
4. **Rendering** - Compose and render with tenant branding

### Draft Previews (`/proposal/[slug]?draft=1`)

1. **Database** - Try to load draft data from database
2. **Local fallback** - Use localStorage for draft content
3. **Seed fallback** - Use local seed files for development
4. **Rendering** - Compose and render with tenant branding

## Benefits

### Data Isolation

- Each tenant's data is completely separate
- No cross-tenant data leakage
- Independent branding and content

### Scalability

- PostgreSQL handles complex queries efficiently
- JSONB allows flexible document evolution
- Proper indexing for performance

### Development

- Local database for testing
- Seed data fallbacks for development
- Easy tenant switching in portal

### Production

- Database transactions ensure data integrity
- ACID compliance for critical operations
- Easy backup and restore procedures

## Security Considerations

- **Database permissions** - Check tenant access in API routes
- **Data validation** - Zod schemas ensure data integrity
- **Public access** - Live proposals are publicly accessible
- **Draft isolation** - Drafts are tenant-specific

## Future Enhancements

1. **Authentication** - User management and RBAC
2. **Subdomain routing** - `acme.yourdomain.com/proposal/slug`
3. **API rate limiting** - Protect against abuse
4. **Audit logging** - Track data changes
5. **Data export** - Backup and migration tools
