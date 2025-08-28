import { headers } from "next/headers";
import { loaders } from "@/components/sections/registry";
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



export default async function ProposalPage({
  params, searchParams
}: { params:{ slug:string }, searchParams?: { draft?: string } }) {
  const draft = searchParams?.draft === "1";
  const slug = params.slug;
  
  // For live proposals: automatically detect which tenant has published this proposal
  // For drafts: use a default tenant (since drafts are typically tenant-specific)
  let tenant: string;
  
  if (draft) {
    // For drafts, use a default tenant since drafts are typically tenant-specific
    tenant = "default";
  } else {
    // For live proposals, find which tenant has published this slug
    const foundTenant = await findTenantForProposal(slug);
    if (!foundTenant) {
      throw new Error(`No published proposal found with slug: ${slug}`);
    }
    tenant = foundTenant;
  }

  // 1) Profile & references
  let profileRaw:any, referencesRaw:any;
  if (draft) {
    // For drafts: Database first, fallback to local
    try { 
      const profileRecord = await getTenantProfile(tenant, true);
      if (profileRecord) {
        profileRaw = profileRecord.data;
      } else {
        throw new Error('No draft profile in database');
      }
    } catch { 
      profileRaw = await localJson(`/seed/tenants/${tenant}/profile.json`).catch(()=>localJson(`/seed/tenants/default/profile.json`)); 
    }
    try { 
      const referencesRecord = await getTenantReferences(tenant, true);
      if (referencesRecord) {
        referencesRaw = referencesRecord.data;
      } else {
        throw new Error('No draft references in database');
      }
    } catch { 
      referencesRaw = await localJson(`/seed/tenants/${tenant}/references.json`).catch(()=>localJson(`/seed/tenants/default/references.json`)); 
    }
  } else {
    // For live: Database only, no fallbacks
    const profileRecord = await getTenantProfile(tenant, false);
    if (!profileRecord) throw new Error(`No live profile found for tenant: ${tenant}`);
    profileRaw = profileRecord.data;
    
    const referencesRecord = await getTenantReferences(tenant, false);
    if (!referencesRecord) throw new Error(`No live references found for tenant: ${tenant}`);
    referencesRaw = referencesRecord.data;
  }
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
  if (draft) {
    // For drafts: Database only
    const layoutRecord = await getProposalLayout(tenant, true);
    if (!layoutRecord) throw new Error(`No draft layout found for tenant: ${tenant}`);
    layoutRaw = layoutRecord.data;
  } else {
    // For live: Database only, no fallbacks
    const layoutRecord = await getProposalLayout(tenant, false);
    if (!layoutRecord) throw new Error(`No live layout found for tenant: ${tenant}`);
    layoutRaw = layoutRecord.data;
  }
  const layout = LayoutSchema.parse(layoutRaw);

  // 3) Content
  let proposalRaw:any = null;
  if (draft) {
    // For drafts: Database -> local -> stub
    try { 
      const contentRecord = await getProposalContent(tenant, slug, true);
      if (contentRecord) {
        proposalRaw = contentRecord.data;
      }
    } catch {}
    if (!proposalRaw) {
      proposalRaw = await localJson(`/seed/content/${tenant}/proposals/${slug}.json`).catch(()=> ({
        Hero: { title: `Proposal for ${slug}` },
        Problem: { bullets: [] }
      }));
    }
  } else {
    // For live: Database only, no fallbacks
    const contentRecord = await getProposalContent(tenant, slug, false);
    if (!contentRecord) throw new Error(`No live proposal found: ${tenant}/${slug}`);
    proposalRaw = contentRecord.data;
  }
  const proposal = ProposalSchema.parse(proposalRaw);

  // 4) Compose + render
  const ctx = { branding: profile.branding };
  const sections = layout.sections.filter((s:any)=>s.enabled!==false);

  const models = await Promise.all(sections.map(async (s:any) => {
    const base = (proposal as any)[s.type] || {};
    const withTokens = interpolateTokens(base, ctx);
    if (s.type === "CustomerStories") {
      (withTokens as any).items = resolveReferences(withTokens, references);
    }
    const finalData = deepMerge(withTokens, s.props || {});
    const loader = loaders[s.type]?.[s.variant];
    if (!loader) return { key: `${s.type}-${s.variant}`, element: <div style={{color:'red',padding:12}}>Missing {s.type}.{s.variant}</div> };
    const Section = (await loader()).default;
    return { key: `${s.type}-${s.variant}`, element: <Section {...finalData} /> };
  }));

  return <main>{models.map(m => <div key={m.key}>{m.element}</div>)}</main>;
}
