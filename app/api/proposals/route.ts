import { NextRequest, NextResponse } from 'next/server';
import { 
  listProposals,               // (tenantId, isDraft) => Promise<{ slug, updated_at }[]>
  getProposalDetails,          // (tenantId, slug)    => Promise<{ title?: string, is_draft?: boolean }>
  listTenantsForOrganization            // NEW: (orgId) => Promise<{ id: string, name?: string }[]>
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantParam = searchParams.get('tenant');     // 'all' | tenantId | null
    const orgId = searchParams.get('org_id');

    // 1) if tenant is provided and not "all",
    if (tenantParam && tenantParam !== 'all') {
      const tenantId = tenantParam;

// to-do: refactor this so we aren't making two db calls for live and draft + updat client componenet proposal interface to have is_draft: bool

      const [draftProposals, liveProposals] = await Promise.all([
        listProposals(tenantId, true),   // drafts
        listProposals(tenantId, false)   // live
      ]);

      const allProposals = [...draftProposals, ...liveProposals];

      const detailedProposals = await Promise.all(
        allProposals.map(async (proposal) => {
          const details = await getProposalDetails(tenantId, proposal.slug);
          return {
            slug: proposal.slug,
            title: details?.title || proposal.slug,
            updated_at: proposal.updated_at,
            is_draft: details?.is_draft || false,
            tenant_id: tenantId     // include tenant for consistency
          };
        })
      );

      detailedProposals.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      return NextResponse.json({
        success: true,
        org_id: orgId ?? null,
        tenant: tenantId,
        proposals: detailedProposals,
        count: detailedProposals.length
      });
    }

    // 2) New behavior: tenant is "all" (or missing) -> require org_id and return all tenants' proposals
    if (!orgId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: org_id' },
        { status: 400 }
      );
    }

    // Get all tenants for the org
    const tenants = await listTenantsForOrganization(orgId); // [{ id, name? }, ...]
    if (!tenants || tenants.length === 0) {
      return NextResponse.json({
        success: true,
        org_id: orgId,
        tenant: 'all',
        proposals: [],
        count: 0
      });
    }

    // Helper to fetch + decorate proposals for a single tenant
    async function fetchProposalsForTenant(tenantId: string, tenantName?: string) {
      const [drafts, live] = await Promise.all([
        listProposals(tenantId, true),
        listProposals(tenantId, false)
      ]);

      const all = [...drafts, ...live];

      const detailed = await Promise.all(
        all.map(async (proposal) => {
          const details = await getProposalDetails(tenantId, proposal.slug);
          return {
            slug: proposal.slug,
            title: details?.title || proposal.slug,
            updated_at: proposal.updated_at,
            is_draft: details?.is_draft || false,
            tenant_id: tenantId,
            tenant_name: tenantName
          };
        })
      );

      return detailed;
    }

    // Fetch proposals for all tenants in parallel, then flatten
    const perTenant = await Promise.all(
      tenants.map(t => fetchProposalsForTenant(t.id, t.name))
    );
    const detailedProposals = perTenant.flat();

    // Sort all proposals by updated_at desc
    detailedProposals.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return NextResponse.json({
      success: true,
      org_id: orgId,
      tenant: 'all',
      proposals: detailedProposals,
      count: detailedProposals.length
    });
  } catch (error: any) {
    console.error('Failed to list proposals:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to list proposals',
        details: error?.message ?? 'Unknown error'
      },
      { status: 500 }
    );
  }
}
