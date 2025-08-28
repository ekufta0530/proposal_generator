# Row Level Security (RLS) Implementation

This document explains the Row Level Security implementation that protects multi-tenant data in the proposals platform.

## Overview

Row Level Security (RLS) ensures that when proper authorization is implemented, tenants can only access their own data, even if they somehow gain access to the database directly.

## Database Security

### RLS Policies

RLS is enabled on all tenant-specific tables:

- `tenant_profiles`
- `tenant_references` 
- `proposal_layouts`
- `proposal_content`

Each table has a policy that restricts access based on the `tenant_id` matching the current tenant context.

### Context Functions

Two PostgreSQL functions manage tenant context:

- `set_tenant_context(tenant_id)` - Sets the current tenant for the session
- `clear_tenant_context()` - Clears the tenant context

### Policy Structure

```sql
CREATE POLICY tenant_profiles_tenant_isolation ON tenant_profiles
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::text);
```

This policy ensures that:
- All operations (SELECT, INSERT, UPDATE, DELETE) are restricted
- Only rows where `tenant_id` matches the current context are accessible
- If no tenant context is set, no rows are accessible

## Application Integration

### Database Helper Function

The `withTenantContext` function in `lib/db.ts` manages RLS context:

```typescript
async function withTenantContext<T>(tenantId: string, operation: () => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('SELECT set_tenant_context($1)', [tenantId]);
    return await operation();
  } finally {
    await client.query('SELECT clear_tenant_context()');
    client.release();
  }
}
```

### Updated Database Functions

Most database functions use explicit tenant filtering for better reliability:

- `getTenantProfile()` - Only returns profile for current tenant
- `saveTenantProfile()` - Only saves to current tenant
- `listProposals()` - Only lists proposals for current tenant (explicit filtering)
- `getProposalDetails()` - Only returns content for current tenant (explicit filtering)
- `getProposalContent()` - Only returns content for current tenant

## Security Benefits

### 1. Data Isolation

Even if a tenant somehow gains direct database access, they can only see their own data.

### 2. SQL Injection Protection

RLS policies are enforced at the database level, providing an additional layer of protection.

### 3. Audit Trail

All database operations are automatically filtered by tenant, ensuring no cross-tenant data leakage.

### 4. Future-Proof

When proper authentication is implemented, the RLS policies will automatically enforce tenant isolation.

## Current Implementation

### Portal Security

Currently, tenant selection is done via UI dropdown (not secure for production). However:

- Database queries are protected by explicit tenant filtering
- API endpoints validate tenant parameters
- All data access goes through tenant-protected functions
- RLS policies are in place but some functions use explicit filtering for reliability

### API Endpoints

- `/api/proposals?tenant=<id>` - Lists proposals for specific tenant
- `/api/tenants` - Lists available tenants
- `/api/sections` - Saves data with tenant context

## Future Authentication Integration

When implementing proper authentication:

1. **JWT/Session Tokens** - Include tenant ID in user session
2. **Middleware** - Extract tenant from token and set context
3. **API Routes** - Validate tenant access before processing requests
4. **Database Layer** - RLS automatically enforces tenant isolation

### Example Future Implementation

```typescript
// Middleware to set tenant context
export function withTenantAuth(handler: NextApiHandler) {
  return async (req: NextRequest, res: NextResponse) => {
    const tenantId = extractTenantFromToken(req);
    if (!tenantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Set tenant context for all database operations
    await setTenantContext(tenantId);
    
    return handler(req, res);
  };
}
```

## Testing RLS

To verify RLS is working:

1. **Direct Database Access** - Try querying without tenant context
2. **Cross-Tenant Access** - Attempt to access another tenant's data
3. **API Testing** - Verify API endpoints respect tenant isolation

### Example Test

```sql
-- This should return no rows (no tenant context)
SELECT * FROM tenant_profiles;

-- This should return rows for the specific tenant
SELECT set_tenant_context('coca-cola');
SELECT * FROM tenant_profiles;
SELECT clear_tenant_context();
```

## Best Practices

1. **Always use RLS context** - Never bypass tenant context in database operations
2. **Validate tenant access** - Check tenant permissions in API routes
3. **Log tenant operations** - Track which tenant performed which actions
4. **Regular audits** - Periodically verify RLS policies are working correctly

## Migration Notes

- RLS policies are applied to existing data
- No data migration required
- Existing API endpoints continue to work
- New endpoints automatically benefit from RLS protection
