import { NextRequest, NextResponse } from 'next/server';
import { listOrganizations, getOrganization, createOrganization } from '@/lib/db';
import { isValidOrgId } from '@/lib/nanoid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('org_id');
    
    if (orgId) {
      // Validate org ID format
      if (!isValidOrgId(orgId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid organization ID format. Must be 8 characters using A-Z, a-z, 0-9, _, -' },
          { status: 400 }
        );
      }
      
      // Get specific organization
      const organization = await getOrganization(orgId);
      
      if (organization) {
        return NextResponse.json({
          success: true,
          organization
        });
      } else {
        return NextResponse.json(
          { success: false, error: `Organization not found: ${orgId}` },
          { status: 404 }
        );
      }
    } else {
      // List all organizations
      const organizations = await listOrganizations();
      return NextResponse.json({
        success: true,
        organizations
      });
    }
  } catch (error: any) {
    console.error('Organizations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization data', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, orgId } = body;
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      );
    }
    
    // If orgId is provided, validate it
    if (orgId && !isValidOrgId(orgId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization ID format. Must be 8 characters using A-Z, a-z, 0-9, _, -' },
        { status: 400 }
      );
    }
    
    const organization = await createOrganization(name, orgId);
    
    return NextResponse.json({
      success: true,
      organization
    });
  } catch (error: any) {
    console.error('Organizations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create organization', details: error.message },
      { status: 500 }
    );
  }
}
