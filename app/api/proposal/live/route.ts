import { NextRequest, NextResponse } from 'next/server';
import { findTenantForProposal, getProposalContent } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: slug' },
        { status: 400 }
      );
    }

    // Find which tenant has published this proposal
    const tenant = await findTenantForProposal(slug);

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: `No published proposal found with slug: ${slug}` },
        { status: 404 }
      );
    }

    // Get the live proposal content (is_draft = false)
    const proposal = await getProposalContent(tenant, slug, false);

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: `No live proposal found: ${tenant}/${slug}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      proposal,
      tenant,
      slug
    });

  } catch (error: any) {
    console.error('Failed to load live proposal:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to load live proposal',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
