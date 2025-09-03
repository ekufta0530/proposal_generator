import { Suspense } from "react";
import PortalLayout from "@/components/PortalLayout";
import PortalEditor from "@/components/PortalEditor";
import { metadata } from "@/components/sections/registry";
import { getTenantProfile, getProposalLayout, getProposalContent } from "@/lib/db";

// Server-side data fetching functions
async function getTenantProfileData(tenant: string) {
  try {
    const profileRecord = await getTenantProfile(tenant);
    return profileRecord ? profileRecord.data : null;
  } catch (error) {
    console.error('Failed to fetch tenant profile:', error);
    return null;
  }
}

async function getTenantLayoutData(tenant: string) {
  try {
    const layout = await getProposalLayout(tenant);
    return layout?.data?.sections || [];
  } catch (error) {
    console.error('Failed to fetch tenant layout:', error);
    return [];
  }
}

async function getInitialProposalData(tenant: string, slug?: string, isDraft?: boolean) {
  if (!slug) return {};
  
  try {
    const proposal = await getProposalContent(tenant, slug, isDraft);
    return proposal?.data || {};
  } catch (error) {
    console.error('Failed to fetch proposal:', error);
    return {};
  }
}

export default async function PortalPage({
  searchParams,
}: {
  searchParams: { slug?: string; editDraft?: string };
}) {
  // Get default tenant (could be enhanced with user authentication)
  const defaultTenant = "default";
  
  // Fetch initial data on the server
  const [profile, sections, proposal] = await Promise.all([
    getTenantProfileData(defaultTenant),
    getTenantLayoutData(defaultTenant),
    getInitialProposalData(defaultTenant, searchParams.slug, searchParams.editDraft === 'true')
  ]);

  // Compute derived constants on the server
  const sectionTypes = Object.keys(metadata);

  return (
    <PortalLayout title="Create Proposal">
      <Suspense fallback={<div>Loading portal editor...</div>}>
        <PortalEditor
          initialTenant={defaultTenant}
          initialProfile={profile}
          initialSections={sections}
          initialProposal={proposal}
          sectionTypes={sectionTypes}
          metadata={metadata}
        />
      </Suspense>
    </PortalLayout>
  );
}