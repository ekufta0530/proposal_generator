import { Pool } from "pg";

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/proposals" 
});

// Helper function to set tenant context for RLS
async function withTenantContext<T>(tenantId: string, operation: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('SELECT set_tenant_context($1)', [tenantId]);
    return await operation(client);
  } catch (error) {
    throw error;
  } finally {
    await client.query('SELECT clear_tenant_context()');
    client.release();
  }
}

// Types for better type safety
export interface TenantProfile {
  id: string;
  tenant_id: string;
  data: any;
  version: string;
  is_draft: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TenantReferences {
  id: string;
  tenant_id: string;
  data: any;
  version: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProposalLayout {
  id: string;
  tenant_id: string;
  data: any;
  version: string;
  is_draft: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProposalContent {
  id: string;
  tenant_id: string;
  slug: string;
  data: any;
  version: string;
  is_draft: boolean;
  created_at: Date;
  updated_at: Date;
}

// Tenant Profile functions
export async function getTenantProfile(tenantId: string): Promise<TenantProfile | null> {
  return withTenantContext(tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM tenant_profiles WHERE tenant_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [tenantId]
    );
    return rows[0] || null;
  });
}

export async function saveTenantProfile(tenantId: string, data: any): Promise<TenantProfile> {
  return withTenantContext(tenantId, async (client) => {
    const { rows } = await client.query(
      `INSERT INTO tenant_profiles (tenant_id, data) 
       VALUES ($1, $2) 
       ON CONFLICT (tenant_id) 
       DO UPDATE SET data = $2, updated_at = now() 
       RETURNING *`,
      [tenantId, data]
    );
    return rows[0];
  });
}

// Tenant References functions
export async function getTenantReferences(tenantId: string): Promise<TenantReferences | null> {
  return withTenantContext(tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM tenant_references WHERE tenant_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [tenantId]
    );
    return rows[0] || null;
  });
}

export async function saveTenantReferences(tenantId: string, data: any, isDraft: boolean = false): Promise<TenantReferences> {
  return withTenantContext(tenantId, async (client) => {
    const { rows } = await client.query(
      `INSERT INTO tenant_references (tenant_id, data, is_draft) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (tenant_id, is_draft) 
       DO UPDATE SET data = $2, updated_at = now() 
       RETURNING *`,
      [tenantId, data, isDraft]
    );
    return rows[0];
  });
}

// Proposal Layout functions
export async function getProposalLayout(tenantId: string): Promise<ProposalLayout | null> {
  return withTenantContext(tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM proposal_layouts WHERE tenant_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [tenantId]
    );
    return rows[0] || null;
  });
}

export async function saveProposalLayout(tenantId: string, data: any): Promise<ProposalLayout> {
  return withTenantContext(tenantId, async (client) => {
    const { rows } = await client.query(
      `INSERT INTO proposal_layouts (tenant_id, data) 
       VALUES ($1, $2) 
       ON CONFLICT (tenant_id) 
       DO UPDATE SET data = $2, updated_at = now() 
       RETURNING *`,
      [tenantId, data]
    );
    return rows[0];
  });
}

// Proposal Content functions
export async function getProposalContent(tenantId: string, slug: string, isDraft: boolean = false): Promise<ProposalContent | null> {
  return withTenantContext(tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT * FROM proposal_content WHERE tenant_id = $1 AND slug = $2 AND is_draft = $3 ORDER BY updated_at DESC LIMIT 1`,
      [tenantId, slug, isDraft]
    );
    return rows[0] || null;
  });
}

export async function saveProposalContent(tenantId: string, slug: string, data: any, isDraft: boolean = false): Promise<ProposalContent> {
  return withTenantContext(tenantId, async (client) => {
    const { rows } = await client.query(
      `INSERT INTO proposal_content (tenant_id, slug, data, is_draft) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (tenant_id, slug, is_draft) 
       DO UPDATE SET data = $3, updated_at = now() 
       RETURNING *`,
      [tenantId, slug, data, isDraft]
    );
    return rows[0];
  });
}

// Organization functions
export async function getOrganization(orgId: string): Promise<{id: string, name: string, default_tenant: string | null} | null> {
  const { rows } = await pool.query(`SELECT id, name, default_tenant FROM organizations WHERE id = $1`, [orgId]);
  return rows[0] || null;
}

export async function createOrganization(name: string, orgId?: string): Promise<{id: string, name: string}> {
  const { nanoid } = await import('nanoid');
  const id = orgId || nanoid(8);
  
  const { rows } = await pool.query(
    `INSERT INTO organizations (id, name) VALUES ($1, $2) RETURNING id, name`,
    [id, name]
  );
  return rows[0];
}

export async function listOrganizations(): Promise<Array<{id: string, name: string, default_tenant: string | null}>> {
  const { rows } = await pool.query(`SELECT id, name, default_tenant FROM organizations ORDER BY name`);
  return rows;
}

export async function listTenantsForOrganization(orgId: string): Promise<Array<{id: string, name: string}>> {
  const { rows } = await pool.query(`SELECT id, name FROM tenants WHERE org_id = $1 ORDER BY name`, [orgId]);
  return rows;
}

export async function validateTenantForOrganization(tenantId: string, orgId: string): Promise<boolean> {
  const { rows } = await pool.query(`SELECT 1 FROM tenants WHERE id = $1 AND org_id = $2`, [tenantId, orgId]);
  return rows.length > 0;
}

// List functions
export async function listTenants(): Promise<Array<{id: string, name: string}>> {
  const { rows } = await pool.query(`SELECT id, name FROM tenants ORDER BY name`);
  return rows;
}

export async function listProposals(tenantId: string, isDraft: boolean = false): Promise<Array<{slug: string, updated_at: Date}>> {
  return withTenantContext(tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT slug, updated_at FROM proposal_content WHERE tenant_id = $1 AND is_draft = $2 ORDER BY updated_at DESC`,
      [tenantId, isDraft]
    );
    return rows;
  });
}

// Get proposal details for listing
export async function getProposalDetails(tenantId: string, slug: string): Promise<{
  slug: string;
  title?: string;
  updated_at: Date;
  is_draft: boolean;
} | null> {
  return withTenantContext(tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT slug, data, updated_at, is_draft FROM proposal_content WHERE tenant_id = $1 AND slug = $2 ORDER BY updated_at DESC LIMIT 1`,
      [tenantId, slug]
    );
    if (rows.length === 0) return null;
    
    const row = rows[0];
    const data = row.data;
    // Try to extract title from various possible locations in the data
    const title = data?.Hero?.title || 
                  data?.title || 
                  data?.sections?.[0]?.props?.title ||
                  slug;
    
    return {
      slug: row.slug,
      title,
      updated_at: row.updated_at,
      is_draft: row.is_draft
    };
  });
}

// Find which tenant has published data for a given slug
export async function findTenantForProposal(slug: string): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT tenant_id FROM proposal_content WHERE slug = $1 AND is_draft = false ORDER BY updated_at DESC LIMIT 1`,
    [slug]
  );
  return rows[0]?.tenant_id || null;
}

// Delete proposal function
export async function deleteProposal(tenantId: string, slug: string, isDraft: boolean = false): Promise<boolean> {
  return withTenantContext(tenantId, async (client) => {
    const { rowCount } = await client.query(
      `DELETE FROM proposal_content WHERE tenant_id = $1 AND slug = $2 AND is_draft = $3`,
      [tenantId, slug, isDraft]
    );
    return rowCount > 0;
  });
}

// Bulk delete proposals function
export async function deleteMultipleProposals(tenantId: string, proposals: Array<{slug: string, isDraft: boolean}>): Promise<{success: boolean, deleted: number, errors: string[]}> {
  return withTenantContext(tenantId, async (client) => {
    const errors: string[] = [];
    let deleted = 0;
    
    for (const proposal of proposals) {
      try {
        const { rowCount } = await client.query(
          `DELETE FROM proposal_content WHERE tenant_id = $1 AND slug = $2 AND is_draft = $3`,
          [tenantId, proposal.slug, proposal.isDraft]
        );
        if (rowCount > 0) {
          deleted++;
        }
      } catch (error: any) {
        errors.push(`Failed to delete ${proposal.slug}: ${error.message}`);
      }
    }
    
    return {
      success: errors.length === 0,
      deleted,
      errors
    };
  });
}

// Authentication functions
export async function createUser(email: string, passwordHash: string, name: string): Promise<{id: string, email: string, name: string}> {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name`,
    [email, passwordHash, name]
  );
  return rows[0];
}

export async function getUserByEmail(email: string): Promise<{id: string, email: string, name: string, password_hash: string, is_active: boolean} | null> {
  const { rows } = await pool.query(
    `SELECT id, email, name, password_hash, is_active FROM users WHERE email = $1 AND is_active = true`,
    [email]
  );
  return rows[0] || null;
}

export async function getUserById(id: string): Promise<{id: string, email: string, name: string, is_active: boolean} | null> {
  const { rows } = await pool.query(
    `SELECT id, email, name, is_active FROM users WHERE id = $1 AND is_active = true`,
    [id]
  );
  return rows[0] || null;
}

// User-Organization relationship functions
export async function addUserToOrganization(userId: string, orgId: string, role: 'owner' | 'admin' | 'member' = 'member'): Promise<void> {
  await pool.query(
    `INSERT INTO user_organizations (user_id, org_id, role) VALUES ($1, $2, $3) ON CONFLICT (user_id, org_id) DO UPDATE SET role = $3`,
    [userId, orgId, role]
  );
}

export async function getUserOrganizations(userId: string): Promise<Array<{org_id: string, role: string}>> {
  const { rows } = await pool.query(
    `SELECT org_id, role FROM user_organizations WHERE user_id = $1`,
    [userId]
  );
  return rows;
}

export async function getUserOrganization(userId: string, orgId: string): Promise<{org_id: string, role: string} | null> {
  const { rows } = await pool.query(
    `SELECT org_id, role FROM user_organizations WHERE user_id = $1 AND org_id = $2`,
    [userId, orgId]
  );
  return rows[0] || null;
}

// User-Tenant relationship functions removed - all access controlled via organization membership

// Database health check
export async function testDatabaseConnection(): Promise<{success: boolean, message: string}> {
  try {
    const { rows } = await pool.query('SELECT NOW() as current_time');
    return {
      success: true,
      message: `Database connection successful. Current time: ${rows[0].current_time}`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Database connection failed: ${error.message}`
    };
  }
}
