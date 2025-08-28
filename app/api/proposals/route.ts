import { NextRequest, NextResponse } from 'next/server';
import { listProposals, getProposalDetails } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant');
    const isDraft = searchParams.get('draft') === 'true';

    if (!tenant) {
      return NextResponse.json(
        { error: 'Missing required parameter: tenant' },
        { status: 400 }
      );
    }

    // Get basic proposal list
    const proposals = await listProposals(tenant, isDraft);
    
    // Get detailed information for each proposal
    const detailedProposals = await Promise.all(
      proposals.map(async (proposal) => {
        const details = await getProposalDetails(tenant, proposal.slug);
        return {
          slug: proposal.slug,
          title: details?.title || proposal.slug,
          updated_at: proposal.updated_at,
          is_draft: details?.is_draft || false
        };
      })
    );

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
