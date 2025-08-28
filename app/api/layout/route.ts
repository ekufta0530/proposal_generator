import { NextRequest, NextResponse } from 'next/server';
import { getProposalLayout } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant');

    if (!tenant) {
      return NextResponse.json(
        { error: 'Missing required parameter: tenant' },
        { status: 400 }
      );
    }

    // Get layout for the tenant
    const layout = await getProposalLayout(tenant);

    return NextResponse.json({
      success: true,
      tenant,
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
