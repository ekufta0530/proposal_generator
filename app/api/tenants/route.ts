import { NextRequest, NextResponse } from 'next/server';
import { listTenants, getTenantProfile, listTenantsForOrganization, validateTenantForOrganization } from '@/lib/db';
import { isValidOrgId } from '@/lib/nanoid';

// Helper function to get user from request headers (set by middleware)
function getUserFromHeaders(request: NextRequest): {
  id: string;
  orgId: string;
  role: string;
} | null {
  const userId = request.headers.get('x-user-id');
  const orgId = request.headers.get('x-user-org-id');
  const role = request.headers.get('x-user-role');

  if (!userId || !orgId || !role) {
    return null;
  }

  return {
    id: userId,
    orgId,
    role: role as 'owner' | 'admin' | 'member'
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from middleware headers
    const user = getUserFromHeaders(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant');
    const orgId = searchParams.get('org_id');
    
    // Use user's organization if org_id not provided
    const targetOrgId = orgId || user.orgId;
    
    if (tenant) {
      // Validate org ID format if provided
      if (targetOrgId && !isValidOrgId(targetOrgId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid organization ID format. Must be 8 characters using A-Z, a-z, 0-9, _, -' },
          { status: 400 }
        );
      }
      
      // Ensure user has access to the requested organization
      if (targetOrgId !== user.orgId) {
        return NextResponse.json(
          { success: false, error: 'Access denied: Invalid organization' },
          { status: 403 }
        );
      }
      
      // Validate tenant belongs to organization
      if (targetOrgId) {
        const isValid = await validateTenantForOrganization(tenant, targetOrgId);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: `Tenant ${tenant} does not belong to organization ${targetOrgId}` },
            { status: 403 }
          );
        }
      }
      
      // Get specific tenant profile
      const profileRecord = await getTenantProfile(tenant);
      
      if (profileRecord) {
        return NextResponse.json({
          success: true,
          tenant,
          orgId: targetOrgId,
          profile: profileRecord.data
        });
      } else {
        return NextResponse.json(
          { success: false, error: `Tenant not found: ${tenant}` },
          { status: 404 }
        );
      }
    } else if (targetOrgId) {
      // Validate org ID format
      if (!isValidOrgId(targetOrgId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid organization ID format. Must be 8 characters using A-Z, a-z, 0-9, _, -' },
          { status: 400 }
        );
      }
      
      // Ensure user has access to the requested organization
      if (targetOrgId !== user.orgId) {
        return NextResponse.json(
          { success: false, error: 'Access denied: Invalid organization' },
          { status: 403 }
        );
      }
      
      // List tenants for specific organization
      const tenants = await listTenantsForOrganization(targetOrgId);
      
      return NextResponse.json({
        success: true,
        orgId: targetOrgId,
        tenants
      });
    } else {
      // List all tenants for user's organization
      const tenants = await listTenantsForOrganization(user.orgId);
      
      return NextResponse.json({
        success: true,
        tenants
      });
    }
  } catch (error: any) {
    console.error('Tenants API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tenant data', details: error.message },
      { status: 500 }
    );
  }
}
