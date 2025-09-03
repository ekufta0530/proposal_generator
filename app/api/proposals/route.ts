import { NextRequest, NextResponse } from 'next/server';
import { listProposals, getProposalDetails } from '@/lib/db';

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

    // Get both drafts and live proposals
    const [draftProposals, liveProposals] = await Promise.all([
      listProposals(tenant, true),  // drafts
      listProposals(tenant, false)  // live
    ]);
    
    // Get detailed information for all proposals
    const allProposals = [...draftProposals, ...liveProposals];
    const detailedProposals = await Promise.all(
      allProposals.map(async (proposal) => {
        const details = await getProposalDetails(tenant, proposal.slug);
        return {
          slug: proposal.slug,
          title: details?.title || proposal.slug,
          updated_at: proposal.updated_at,
          is_draft: details?.is_draft || false
        };
      })
    );

    // Sort by updated_at (most recent first)
    detailedProposals.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return NextResponse.json({
      success: true,
      tenant,
      proposals: detailedProposals,
      count: detailedProposals.length
    });

  } catch (error: any) {
    console.error('Failed to list proposals:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to list proposals',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
