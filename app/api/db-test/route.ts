import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection, listTenants, getTenantProfile, listProposals, getTenantReferences } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'connection') {
      // Test database connection
      const result = await testDatabaseConnection();
      return NextResponse.json(result);
    }
    
    if (action === 'tenants') {
      // List all tenants
      const tenants = await listTenants();
      return NextResponse.json({
        success: true,
        tenants
      });
    }
    
    if (action === 'profile') {
      // Get specific tenant profile
      const tenant = searchParams.get('tenant') || 'default';
      const isDraft = searchParams.get('draft') === 'true';
      
      const profile = await getTenantProfile(tenant, isDraft);
      return NextResponse.json({
        success: true,
        tenant,
        isDraft,
        profile: profile ? {
          id: profile.id,
          data: profile.data,
          version: profile.version,
          updated_at: profile.updated_at
        } : null
      });
    }
    
    if (action === 'references') {
      // Get specific tenant references
      const tenant = searchParams.get('tenant') || 'default';
      const isDraft = searchParams.get('draft') === 'true';
      
      const references = await getTenantReferences(tenant, isDraft);
      return NextResponse.json({
        success: true,
        tenant,
        isDraft,
        references: references ? {
          id: references.id,
          data: references.data,
          version: references.version,
          updated_at: references.updated_at
        } : null
      });
    }
    
    if (action === 'proposals') {
      // List proposals for a tenant
      const tenant = searchParams.get('tenant') || 'default';
      const isDraft = searchParams.get('draft') === 'true';
      
      const proposals = await listProposals(tenant, isDraft);
      return NextResponse.json({
        success: true,
        tenant,
        isDraft,
        proposals
      });
    }
    
    // Default: return connection test
    const result = await testDatabaseConnection();
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database test failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
