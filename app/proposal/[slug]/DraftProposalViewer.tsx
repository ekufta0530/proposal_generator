"use client";

import { useState, useEffect } from "react";
import { loaders, metadata } from "@/components/sections/registry";
import { LayoutSchema, ProfileSchema, ProposalSchema, ReferencesSchema } from "@/lib/schemas";
import { deepMerge } from "@/lib/merge";
import { interpolateTokens } from "@/lib/interpolate";
import { resolveReferences } from "@/lib/references";

interface DraftProposalViewerProps {
  tenant: string;
  slug: string;
}

export default function DraftProposalViewer({ tenant, slug }: DraftProposalViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<any>(null);
  const [layout, setLayout] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [references, setReferences] = useState<any>(null);

  useEffect(() => {
    async function loadDraftData() {
      try {
        // Load profile and references from database (these don't have draft functionality)
        const [profileResponse, referencesResponse, layoutResponse] = await Promise.all([
          fetch(`/api/tenants?tenant=${tenant}`),
          fetch(`/api/tenants?tenant=${tenant}`), // We'll get references from the same endpoint
          fetch(`/api/layout?tenant=${tenant}`)
        ]);

        const profileData = await profileResponse.json();
        const layoutData = await layoutResponse.json();

        if (!profileData.success) {
          throw new Error(`Failed to load profile for tenant: ${tenant}`);
        }

        if (!layoutData.success) {
          throw new Error(`Failed to load layout for tenant: ${tenant}`);
        }

        setProfile(profileData.profile);
        setLayout(layoutData.layout.data);
        
        // For references, we'll use a default structure since they don't have draft functionality
        setReferences({
          templateVersion: "1.0.0",
          references: []
        });

        // Load draft data from localStorage first, then database as fallback
        const draftLayout = localStorage.getItem(`layoutOverride:${tenant}:${slug}`);
        const draftProposal = localStorage.getItem(`proposal:${tenant}:${slug}`);

        let proposalData;
        let draftLayoutData;

        // Try localStorage first
        if (draftProposal) {
          try {
            proposalData = JSON.parse(draftProposal);
            console.log('Loaded draft from localStorage:', proposalData);
          } catch (e) {
            console.warn('Invalid localStorage draft data, trying database');
          }
        }

        // If no localStorage data, try database
        if (!proposalData) {
          try {
            const draftResponse = await fetch(`/api/proposal?tenant=${tenant}&slug=${slug}&draft=true`);
            const draftData = await draftResponse.json();
            
            if (draftData.success && draftData.proposal) {
              proposalData = draftData.proposal.data;
              console.log('Loaded draft from database');
            }
          } catch (e) {
            console.warn('Failed to load draft from database:', e);
          }
        }

        if (!proposalData) {
          throw new Error(`No draft found for ${tenant}/${slug}. Please save a draft first.`);
        }

        // Handle layout data
        if (draftLayout) {
          try {
            const parsedLayout = JSON.parse(draftLayout);
            if (parsedLayout.sections) {
              draftLayoutData = { ...layoutData.layout.data, sections: parsedLayout.sections };
            }
          } catch (e) {
            console.warn('Invalid draft layout data, using database layout');
          }
        }

        console.log('DraftProposalViewer - loaded proposal data:', proposalData);
        console.log('DraftProposalViewer - loaded layout data:', layoutData.layout.data);
        
        setProposal(proposalData);
        if (draftLayoutData) {
          setLayout(draftLayoutData);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDraftData();
  }, [tenant, slug]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading draft...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ 
          fontSize: '18px', 
          color: '#ef4444',
          textAlign: 'center'
        }}>
          ❌ {error}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Make sure you've saved a draft first in the portal.
        </div>
      </div>
    );
  }

  if (!proposal || !layout || !profile) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '18px',
        color: '#ef4444'
      }}>
        Missing draft data
      </div>
    );
  }

  // Render the proposal using the same logic as the server component
  const ctx = { branding: profile.branding };
  const sections = layout.sections.filter((s: any) => s.enabled !== false);

  return (
    <main>
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        backgroundColor: '#fbbf24',
        color: '#92400e',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        📝 Draft Preview
      </div>
      
      <DraftSections 
        sections={sections} 
        proposal={proposal} 
        ctx={ctx} 
        references={references} 
      />
    </main>
  );
}

// Separate component to handle async section loading
function DraftSections({ sections, proposal, ctx, references }: any) {
  const [sectionComponents, setSectionComponents] = useState<React.ReactNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSections() {
      const components = await Promise.all(
        sections.map(async (s: any, index: number) => {
          const base = (proposal as any)[s.type] || {};
          console.log(`DraftSections - section ${s.type}:`, { base, props: s.props });
          
          // Get defaults from metadata
          const sectionMetadata = (metadata as any)[s.type];
          const variantMetadata = sectionMetadata?.variants?.find((v: any) => v.id === s.variant);
          const defaults = variantMetadata?.defaults || {};
          
          console.log(`DraftSections - defaults for ${s.type}.${s.variant}:`, defaults);
          
          const withTokens = interpolateTokens(base, ctx);
          if (s.type === "CustomerStories") {
            (withTokens as any).items = resolveReferences(withTokens, references);
          }
          
          // Merge in this order: defaults -> proposal data -> section props
          const withDefaults = deepMerge(defaults, withTokens);
          const finalData = deepMerge(withDefaults, s.props || {});
          console.log(`DraftSections - final data for ${s.type}:`, finalData);
          const loader = loaders[s.type]?.[s.variant];
          
          if (!loader) {
            return (
              <div key={`${s.type}-${s.variant}`} style={{color:'red',padding:12}}>
                Missing {s.type}.{s.variant}
              </div>
            );
          }
          
          const Section = (await loader()).default;
          return (
            <div key={`${s.type}-${s.variant}-${index}`}>
              <Section {...finalData} />
            </div>
          );
        })
      );
      
      setSectionComponents(components);
      setIsLoading(false);
    }

    loadSections();
  }, [sections, proposal, ctx, references]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Loading sections...
      </div>
    );
  }

  return <>{sectionComponents}</>;
}
