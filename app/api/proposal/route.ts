import { NextRequest, NextResponse } from 'next/server';
import { getProposalContent, getProposalLayout } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant');
    const slug = searchParams.get('slug');
    const isDraft = searchParams.get('draft') === 'true';

    if (!tenant || !slug) {
      return NextResponse.json(
        { error: 'Missing required parameters: tenant, slug' },
        { status: 400 }
      );
    }

    // Get proposal content and layout
    const [proposal, layout] = await Promise.all([
      getProposalContent(tenant, slug, isDraft),
      getProposalLayout(tenant, isDraft)
    ]);

    return NextResponse.json({
      success: true,
      proposal,
      layout,
      slug,
      tenant
    });

  } catch (error: any) {
    console.error('Failed to load proposal:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to load proposal',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
