import { NextRequest, NextResponse } from 'next/server';
import { 
  saveTenantProfile, 
  saveTenantReferences, 
  saveProposalLayout, 
  saveProposalContent 
} from '@/lib/db';
import { metadata } from "@/components/sections/registry";

/** Exposes registry metadata so the portal can auto-generate fields */
export async function GET(){ return NextResponse.json(metadata); }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant, layout, proposal, isDraft = false } = body;

    if (!tenant) {
      return NextResponse.json(
        { error: 'Missing required field: tenant' },
        { status: 400 }
      );
    }

    const results = [];

    // Save layout if provided
    if (layout) {
      const layoutResult = await saveProposalLayout(tenant, layout, isDraft);
      results.push({ type: 'layout', id: layoutResult.id });
    }

    // Save proposal content if provided
    if (proposal && proposal.slug) {
      const contentResult = await saveProposalContent(tenant, proposal.slug, proposal, isDraft);
      results.push({ type: 'proposal', slug: proposal.slug, id: contentResult.id });
    }

    // Save profile if provided
    if (proposal?.profile) {
      const profileResult = await saveTenantProfile(tenant, proposal.profile, isDraft);
      results.push({ type: 'profile', id: profileResult.id });
    }

    // Save references if provided
    if (proposal?.references) {
      const referencesResult = await saveTenantReferences(tenant, proposal.references);
      results.push({ type: 'references', id: referencesResult.id });
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully saved ${results.length} items to database`,
      results,
      isDraft
    });
    
  } catch (error: any) {
    console.error('Failed to save to database:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save to database',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
