import { NextRequest, NextResponse } from 'next/server';
import { 
  saveTenantProfile, 
  saveTenantReferences, 
  saveProposalLayout, 
  saveProposalContent,
  deleteProposal,
  deleteMultipleProposals
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

    // Note: Layouts are default templates and should not be saved with proposals
    // They are loaded separately when creating new proposals

    // Save proposal content if provided
    if (proposal && proposal.slug) {
      const contentResult = await saveProposalContent(tenant, proposal.slug, proposal, isDraft);
      results.push({ type: 'proposal', slug: proposal.slug, id: contentResult.id });
    }

    // Save profile if provided
    if (proposal?.profile) {
      const profileResult = await saveTenantProfile(tenant, proposal.profile);
      results.push({ type: 'profile', id: profileResult.id });
    }

    // Save references if provided
    if (proposal?.references) {
      const referencesResult = await saveTenantReferences(tenant, proposal.references, isDraft);
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant = searchParams.get('tenant');
    const slug = searchParams.get('slug');
    const isDraft = searchParams.get('isDraft') === 'true';
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'Missing required parameter: tenant' },
        { status: 400 }
      );
    }

    // Check if this is a bulk delete request
    const body = await request.json().catch(() => null);
    
    if (body && body.proposals && Array.isArray(body.proposals)) {
      // Bulk delete
      const result = await deleteMultipleProposals(tenant, body.proposals);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Successfully deleted ${result.deleted} proposals`,
          deleted: result.deleted
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `Deleted ${result.deleted} proposals with some errors`,
          deleted: result.deleted,
          errors: result.errors
        }, { status: 207 }); // 207 Multi-Status
      }
    } else if (slug) {
      // Single delete
      const deleted = await deleteProposal(tenant, slug, isDraft);
      
      if (deleted) {
        return NextResponse.json({
          success: true,
          message: `Successfully deleted proposal: ${slug}`
        });
      } else {
        return NextResponse.json(
          { error: `Proposal not found: ${slug}` },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Missing required parameter: slug or proposals array' },
        { status: 400 }
      );
    }
    
  } catch (error: any) {
    console.error('Failed to delete proposal:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete proposal',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
