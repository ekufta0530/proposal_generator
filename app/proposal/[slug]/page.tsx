import { headers } from "next/headers";
import { loaders, metadata } from "@/components/sections/registry";
import { LayoutSchema, ProfileSchema, ProposalSchema, ReferencesSchema } from "@/lib/schemas";
import { deepMerge } from "@/lib/merge";
import { interpolateTokens } from "@/lib/interpolate";
import { resolveReferences } from "@/lib/references";
import { 
  getTenantProfile, 
  getTenantReferences, 
  getProposalLayout, 
  getProposalContent,
  findTenantForProposal
} from "@/lib/db";
import DraftProposalViewer from "./DraftProposalViewer";

export default async function ProposalPage({
  params, searchParams
}: { params:{ slug:string }, searchParams?: { draft?: string, tenant?: string } }) {
  const draft = searchParams?.draft === "1";
  const slug = params.slug;
  
  // For live proposals: automatically detect which tenant has published this proposal
  // For drafts: use the tenant from URL parameters
  let tenant: string;
  
  if (draft) {
    // For drafts, use the tenant from URL parameters
    tenant = searchParams?.tenant || "default";
  } else {
    // For live proposals, find which tenant has published this slug
    const foundTenant = await findTenantForProposal(slug);
    if (!foundTenant) {
      throw new Error(`No published proposal found with slug: ${slug}`);
    }
    tenant = foundTenant;
  }

  // If this is a draft, use the client-side component that can access localStorage
  if (draft) {
    return <DraftProposalViewer tenant={tenant} slug={slug} />;
  }

  // 1) Profile & references
  let profileRaw:any, referencesRaw:any;
  
  // Profile is always the same (no draft functionality)
  const profileRecord = await getTenantProfile(tenant);
  if (!profileRecord) throw new Error(`No profile found for tenant: ${tenant}`);
  profileRaw = profileRecord.data;
  
  // References are always the same (no draft functionality)
  const referencesRecord = await getTenantReferences(tenant);
  if (!referencesRecord) throw new Error(`No references found for tenant: ${tenant}`);
  referencesRaw = referencesRecord.data;
  const profile = ProfileSchema.parse(profileRaw);
  
  // Handle incomplete references data by providing defaults
  const referencesWithDefaults = {
    templateVersion: "1.0.0",
    references: [],
    ...referencesRaw
  };
  const references = ReferencesSchema.parse(referencesWithDefaults);

  // 2) Layout
  let layoutRaw:any = null;
  
  // Layout is always the same (no draft functionality)
  const layoutRecord = await getProposalLayout(tenant);
  if (!layoutRecord) throw new Error(`No layout found for tenant: ${tenant}`);
  layoutRaw = layoutRecord.data;
  const layout = LayoutSchema.parse(layoutRaw);

  // 3) Content
  let proposalRaw:any = null;
  
  // For live: Database only, no fallbacks
  const contentRecord = await getProposalContent(tenant, slug, false);
  if (!contentRecord) throw new Error(`No live proposal found: ${tenant}/${slug}`);
  proposalRaw = contentRecord.data;
  
  const proposal = ProposalSchema.parse(proposalRaw);

  // 4) Compose + render
  const ctx = { branding: profile.branding };
  const sections = layout.sections.filter((s:any)=>s.enabled!==false);

  const models = await Promise.all(sections.map(async (s:any) => {
    const base = (proposal as any)[s.type] || {};
    
    // Get defaults from metadata
    const sectionMetadata = (metadata as any)[s.type];
    const variantMetadata = sectionMetadata?.variants?.find((v: any) => v.id === s.variant);
    const defaults = variantMetadata?.defaults || {};
    
    const withTokens = interpolateTokens(base, ctx);
    if (s.type === "CustomerStories") {
      (withTokens as any).items = resolveReferences(withTokens, references);
    }
    
    // Merge in this order: defaults -> proposal data -> section props
    const withDefaults = deepMerge(defaults, withTokens);
    const finalData = deepMerge(withDefaults, s.props || {});
    
    const loader = loaders[s.type]?.[s.variant];
    if (!loader) return { key: `${s.type}-${s.variant}`, element: <div style={{color:'red',padding:12}}>Missing {s.type}.{s.variant}</div> };
    const Section = (await loader()).default;
    return { key: `${s.type}-${s.variant}`, element: <Section {...finalData} /> };
  }));

  return <main>{models.map(m => <div key={m.key}>{m.element}</div>)}</main>;
}
