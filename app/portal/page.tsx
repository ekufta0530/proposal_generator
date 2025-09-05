import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";
import PortalEditor from "@/components/PortalEditor";
import { metadata } from "@/components/sections/registry";
import { getTenantProfile, getProposalLayout, getProposalContent, getOrganization, validateTenantForOrganization } from "@/lib/db";
import { isValidOrgId } from "@/lib/nanoid";

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
  searchParams: { org_id?: string; tenant?: string; slug?: string; editDraft?: string };
}) {
  const orgId = searchParams.org_id;
  let tenant = searchParams.tenant;
  
  // Validate org_id format if provided
  if (orgId && !isValidOrgId(orgId)) {
    console.error('Invalid organization ID format:', orgId);
    notFound();
  }
  
  // If org_id is provided but no tenant, redirect to default tenant for that org
  if (orgId && !tenant) {
    try {
      const organization = await getOrganization(orgId);
      if (organization?.default_tenant) {
        const redirectUrl = `/portal?org_id=${orgId}&tenant=${organization.default_tenant}`;
        redirect(redirectUrl);
      } else {
        // Organization exists but has no default tenant
        console.error('Organization has no default tenant:', orgId);
        notFound();
      }
    } catch (error) {
      console.error('Failed to get organization:', error);
      notFound();
    }
  }
  
  // Get tenant from URL parameters or default
  tenant = tenant || "default";
  
  // If org_id is provided, validate tenant belongs to organization
  if (orgId && tenant) {
    try {
      const isValid = await validateTenantForOrganization(tenant, orgId);
      if (!isValid) {
        console.error(`Tenant ${tenant} does not belong to organization ${orgId}`);
        notFound();
      }
    } catch (error) {
      console.error('Failed to validate tenant-organization relationship:', error);
      notFound();
    }
  }
  
  // Fetch initial data on the server
  const [profile, sections, proposal] = await Promise.all([
    getTenantProfileData(tenant),
    getTenantLayoutData(tenant),
    getInitialProposalData(tenant, searchParams.slug, searchParams.editDraft === 'true')
  ]);

  // Compute derived constants on the server
  const sectionTypes = Object.keys(metadata);

  return (
    <PortalLayout title="Create Proposal">
      <Suspense fallback={<div>Loading portal editor...</div>}>
        <PortalEditor
          initialTenant={tenant}
          initialOrgId={orgId}
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