import { headers } from "next/headers";
import { ProfileSchema } from "@/lib/schemas";
import { getTenantProfile } from "@/lib/db";

/** Index page: provides navigation to proposal management */
export default async function ProposalIndex(){
  // In a real app, the tenant would be determined by user authentication
  // For now, we'll use a default tenant for the index page
  const tenant = "default";

  // Load default profile from database only
  const profileRecord = await getTenantProfile(tenant, false);
  if (!profileRecord) {
    throw new Error(`No live profile found for tenant: ${tenant}`);
  }
  const profile = profileRecord.data;

  const parsed = ProfileSchema.parse(profile);

  return (
    <main style={{ padding: 24 }}>
      <h1>Proposal Management (tenant: {tenant})</h1>
      
      <div style={{ marginBottom: 24 }}>
        <h2>Brand Information</h2>
        <p>Brand: <strong>{parsed.branding.name}</strong></p>
        <p>Primary color: <span style={{display:'inline-block',width:12,height:12,background:parsed.branding.colors.primary,verticalAlign:'middle',marginRight:6}}/> {parsed.branding.colors.primary}</p>
        <p>Default sections: {parsed.layoutDefaults?.sections?.length ?? 0}</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2>Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/portal" style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            display: 'inline-block'
          }}>
            🎨 Create/Edit Proposals
          </a>
          <a href="/portal" style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            display: 'inline-block'
          }}>
            👁️ Preview Drafts
          </a>
          <a href="/proposal/bigco" style={{
            backgroundColor: '#7c3aed',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            display: 'inline-block'
          }}>
            🌐 View Live Example
          </a>
        </div>
      </div>

      <div style={{ padding: 16, backgroundColor: '#f3f4f6', borderRadius: 8 }}>
        <h3>Workflow:</h3>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li><strong>Create/Edit Proposals</strong> - Go to the portal to build proposals</li>
          <li><strong>Save Draft</strong> - Save your work locally for preview</li>
          <li><strong>Preview Draft</strong> - See how your proposal looks</li>
          <li><strong>Publish to Live</strong> - Make your proposal publicly accessible</li>
          <li><strong>View Live</strong> - See the published version</li>
        </ol>
      </div>
    </main>
  );
}
