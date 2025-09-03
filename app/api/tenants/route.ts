import { NextRequest, NextResponse } from 'next/server';
import { listTenants, getTenantProfile } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant');
    
    if (tenant) {
      // Get specific tenant profile
      const profileRecord = await getTenantProfile(tenant);
      
      if (profileRecord) {
        return NextResponse.json({
          success: true,
          tenant,
          profile: profileRecord.data
        });
      } else {
        return NextResponse.json(
          { success: false, error: `Tenant not found: ${tenant}` },
          { status: 404 }
        );
      }
    } else {
      // List all tenants
      const tenants = await listTenants();
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
