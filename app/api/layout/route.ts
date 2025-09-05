import { NextRequest, NextResponse } from 'next/server';
import { getProposalLayout, validateTenantForOrganization } from '@/lib/db';
import { isValidOrgId } from '@/lib/nanoid';
import { getUserFromHeaders } from '@/lib/middleware-auth';

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

    if (!tenant) {
      return NextResponse.json(
        { error: 'Missing required parameter: tenant' },
        { status: 400 }
      );
    }

    // Use user's organization if org_id not provided
    const targetOrgId = orgId || user.orgId;

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

    // Get layout for the tenant
    const layout = await getProposalLayout(tenant);

    return NextResponse.json({
      success: true,
      tenant,
      orgId: targetOrgId,
      layout
    });

  } catch (error: any) {
    console.error('Failed to load layout:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to load layout',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
