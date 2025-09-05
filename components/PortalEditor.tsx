"use client";

import { useMemo, useState, useEffect } from "react";
import FormField from "@/components/FormField";
import { Button, Input, Select, Card, StatusMessage } from "@/components/ui/PortalStyles";

type SectionChoice = { type: string; variant: string; enabled?: boolean; props?: Record<string,any> };
type Profile = { branding: { name: string; colors: { primary: string } } };

interface PortalEditorProps {
  initialTenant: string;
  initialOrgId?: string;
  initialProfile: Profile | null;
  initialSections: SectionChoice[];
  initialProposal: any;
  sectionTypes: string[];
  metadata: any;
}

export default function PortalEditor({
  initialTenant,
  initialOrgId,
  initialProfile,
  initialSections,
  initialProposal,
  sectionTypes,
  metadata
}: PortalEditorProps) {
  const [tenant, setTenant] = useState(initialTenant);
  const [slug, setSlug] = useState("");
  const [sections, setSections] = useState<SectionChoice[]>(initialSections);
  const [proposal, setProposal] = useState<any>(initialProposal);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string>("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftStatus, setDraftStatus] = useState<string>("");
  
  // Profile management
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(initialProfile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingProposal, setIsLoadingProposal] = useState(false);

  // Load profile when tenant changes
  useEffect(() => {
    async function loadProfile() {
      if (!tenant || tenant === initialTenant) return; // Skip if it's the initial tenant
      
      setIsLoadingProfile(true);
      try {
        const url = initialOrgId 
          ? `/api/tenants?tenant=${tenant}&org_id=${initialOrgId}`
          : `/api/tenants?tenant=${tenant}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          setCurrentProfile(data.profile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, [tenant, initialTenant]);

  // Load layout when tenant changes
  useEffect(() => {
    async function loadLayout() {
      if (!tenant || tenant === initialTenant) return; // Skip if it's the initial tenant
      
      try {
        const url = initialOrgId 
          ? `/api/layout?tenant=${tenant}&org_id=${initialOrgId}`
          : `/api/layout?tenant=${tenant}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.success && data.layout?.data?.sections) {
          console.log('Portal - loaded layout sections:', data.layout.data.sections);
          setSections(data.layout.data.sections);
        }
      } catch (error) {
        console.error('Failed to load layout:', error);
      }
    }
    loadLayout();
  }, [tenant, initialTenant]);

  // Tenant is now managed via URL parameters only

  // Load existing proposal data when editing (check URL params)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const editSlug = urlParams.get('slug');
    const editDraft = urlParams.get('editDraft') === 'true';
    
    console.log('Portal useEffect - URL params:', { editSlug, editDraft, currentSlug: slug });
    
    if (editSlug && editSlug !== slug) {
      console.log('Portal useEffect - Loading proposal for edit:', editSlug);
      setIsLoadingProposal(true);
      setSlug(editSlug);
      
      if (editDraft) {
        // Load draft for editing
        const draftLayout = localStorage.getItem(`layoutOverride:${tenant}:${editSlug}`);
        const draftProposal = localStorage.getItem(`proposal:${tenant}:${editSlug}`);
        
        if (draftLayout) {
          try {
            const layoutData = JSON.parse(draftLayout);
            if (layoutData.sections) {
              setSections(layoutData.sections);
            }
          } catch (e) {
            console.error('Failed to parse draft layout:', e);
          }
        }
        
        if (draftProposal) {
          try {
            const proposalData = JSON.parse(draftProposal);
            setProposal(proposalData);
          } catch (e) {
            console.error('Failed to parse draft proposal:', e);
          }
          setIsLoadingProposal(false);
        } else {
          // If no localStorage draft, try to load draft from database
          loadProposalFromDatabase(editSlug, true);
        }
      } else {
        // Load live version for editing
        loadProposalFromDatabase(editSlug, false);
      }
    }
  }, [tenant, slug]);

  async function loadProposalFromDatabase(proposalSlug: string, isDraft: boolean = false) {
    console.log('loadProposalFromDatabase called with:', { proposalSlug, isDraft, tenant });
    
    try {
      // Load proposal from database (draft or live)
      const baseUrl = isDraft 
        ? `/api/proposal?tenant=${tenant}&slug=${proposalSlug}&draft=true`
        : `/api/proposal?tenant=${tenant}&slug=${proposalSlug}`;
      const url = initialOrgId ? `${baseUrl}&org_id=${initialOrgId}` : baseUrl;
      
      console.log('loadProposalFromDatabase - fetching from:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.proposal) {
        // Load sections from database
        if (data.layout?.data?.sections) {
          setSections(data.layout.data.sections);
        }
        
        // Load proposal data from database
        if (data.proposal.data) {
          setProposal(data.proposal.data);
        }
      }
    } catch (error) {
      console.error(`Failed to load ${isDraft ? 'draft' : 'proposal'} from database:`, error);
    } finally {
      setIsLoadingProposal(false);
    }
  }

  function updateSection(i:number,patch:Partial<SectionChoice>){setSections(p=>p.map((s,idx)=>idx===i?{...s,...patch}:s));}
  function addSection(){const t=sectionTypes[0];const v=(metadata as any)[t].variants[0].id;setSections(p=>[...p,{type:t,variant:v}]);}
  function removeSection(i:number){setSections(p=>p.filter((_,idx)=>idx!==i));}
  function move(i:number,dir:-1|1){setSections(p=>{const n=[...p];const j=i+dir;if(j<0||j>=n.length)return p;[n[i],n[j]]=[n[j],n[i]];return n;});}

  async function saveDraft(){
    if (!slug.trim()) {
      setDraftStatus("❌ Please enter a proposal slug before saving");
      setTimeout(() => setDraftStatus(""), 3000);
      return;
    }
    
    setIsSavingDraft(true);
    setDraftStatus("Saving draft...");
    
    try {
      // Save to localStorage for immediate access
      localStorage.setItem(`layoutOverride:${tenant}:${slug}`,JSON.stringify({sections}));
      localStorage.setItem(`proposal:${tenant}:${slug}`,JSON.stringify(proposal));
      
      console.log('Portal - current tenant state:', tenant);
      
      const requestBody = {
        tenant,
        layout: { sections },
        proposal: {
          slug,
          ...proposal,
          profile: currentProfile,
          references: {} // Add references if you have them
        },
        isDraft: true
      };
      
      console.log('Saving draft to database:', requestBody);
      
      // Save to database for persistence
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log('Database save response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save draft to database');
      }

      setDraftStatus("✅ Draft saved locally and to database");
      setTimeout(() => setDraftStatus(""), 3000);
    } catch (error: any) {
      console.error('Draft save failed:', error);
      setDraftStatus(`❌ Failed to save draft to database: ${error.message}. Local draft saved.`);
      setTimeout(() => setDraftStatus(""), 5000);
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function publishDraft() {
    if (!slug.trim()) {
      setPublishStatus("❌ Please enter a proposal slug before publishing");
      setTimeout(() => setPublishStatus(""), 3000);
      return;
    }
    
    setIsPublishing(true);
    setPublishStatus("Publishing...");
    
    try {
      // Save to database (live version)
      const response = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant,
          layout: { sections },
          proposal: {
            slug,
            ...proposal,
            profile: currentProfile,
            references: {} // Add references if you have them
          },
          isDraft: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish');
      }

      const result = await response.json();
      setPublishStatus(`✅ Published successfully! (${result.results.length} items saved)`);
      
      // Clear local draft after successful publish
      localStorage.removeItem(`layoutOverride:${tenant}:${slug}`);
      localStorage.removeItem(`proposal:${tenant}:${slug}`);
      

      
      setTimeout(() => setPublishStatus(""), 3000);
      
    } catch (error: any) {
      console.error('Publish failed:', error);
      setPublishStatus(`❌ Publish failed: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  }

  const preview = initialOrgId 
    ? `/proposal/${slug}?draft=1&tenant=${tenant}&org_id=${initialOrgId}`
    : `/proposal/${slug}?draft=1&tenant=${tenant}`;
  const live = initialOrgId 
    ? `/proposal/${slug}?tenant=${tenant}&org_id=${initialOrgId}`
    : `/proposal/${slug}`;

  return (
    <>
      {/* Proposal Configuration */}
      <Card title="Proposal Configuration">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
          <Input
            label="Proposal Slug *"
            value={slug}
            onChange={setSlug}
            placeholder="Enter proposal slug (required)"
          />
        </div>
        
        {isLoadingProfile && (
          <StatusMessage type="info">Loading profile...</StatusMessage>
        )}
        {isLoadingProposal && (
          <StatusMessage type="info">Loading proposal...</StatusMessage>
        )}
        
        {currentProfile && (
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            fontSize: '14px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <span><strong>Client:</strong> {currentProfile.branding.name}</span>
            <span><strong>Primary Color:</strong> 
              <span style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                backgroundColor: currentProfile.branding.colors.primary,
                borderRadius: '2px',
                marginLeft: '4px',
                verticalAlign: 'middle'
              }}/>
              {currentProfile.branding.colors.primary}
            </span>
          </div>
        )}
      </Card>

      {/* Status Messages */}
      {publishStatus && (
        <StatusMessage 
          type={publishStatus.includes('✅') ? 'success' : 'error'}
          style={{ marginBottom: '20px' }}
        >
          {publishStatus}
        </StatusMessage>
      )}
      {draftStatus && (
        <StatusMessage 
          type={draftStatus.includes('✅') ? 'success' : 'error'}
          style={{ marginBottom: '20px' }}
        >
          {draftStatus}
        </StatusMessage>
      )}

      {/* Action Buttons */}
      <Card title="Actions">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button 
            onClick={saveDraft}
            disabled={isSavingDraft}
            variant={isSavingDraft ? 'disabled' : 'secondary'}
          >
            {isSavingDraft ? '⏳ Saving...' : '💾 Save Draft'}
          </Button>
          <a href={preview} target="_blank" style={{ textDecoration: 'none' }}>
            <Button variant="success">
              👁️ Preview Draft
            </Button>
          </a>
          <Button 
            onClick={publishDraft} 
            disabled={isPublishing}
            variant={isPublishing ? 'disabled' : 'success'}
          >
            {isPublishing ? '⏳ Publishing...' : '🚀 Publish to Live'}
          </Button>
          <a href={live} target="_blank" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">
              🌐 View Live
            </Button>
          </a>
        </div>
      </Card>

      {/* Sections */}
      <Card title="Proposal Sections">
        {isLoadingProposal ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading proposal data...
          </div>
        ) : (
          <>
            {sections.map((s, i) => {
              const meta = (metadata as any)[s.type];
              const variants = meta.variants;
              const v = variants.find((x: any) => x.id === s.variant) || variants[0];
              
              return (
                <div key={i} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  backgroundColor: 'white'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <Select
                      value={s.type}
                      onChange={(value) => updateSection(i, { type: value, variant: (metadata as any)[value].variants[0].id })}
                      options={sectionTypes.map(t => ({ value: t, label: t }))}
                      style={{ minWidth: '150px' }}
                    />
                    <Select
                      value={s.variant}
                      onChange={(value) => updateSection(i, { variant: value })}
                      options={variants.map((vv: any) => ({ value: vv.id, label: vv.label }))}
                      style={{ minWidth: '150px' }}
                    />
                    <Button variant="secondary" onClick={() => move(i, -1)}>↑</Button>
                    <Button variant="secondary" onClick={() => move(i, 1)}>↓</Button>
                    <Button variant="danger" onClick={() => removeSection(i)}>Remove</Button>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {v.fields.map((f: any) => {
                      const sec = proposal[s.type] ?? (proposal[s.type] = {});
                      const val = sec[f.name] ?? (f.kind === 'list' ? [] : "");
                      const setVal = (x: any) => {
                        proposal[s.type] = { ...sec, [f.name]: x };
                        setProposal({ ...proposal });
                      };
                      return (
                        <FormField
                          key={f.name}
                          field={f}
                          value={val}
                          onChange={setVal}
                          sectionType={s.type}
                          fieldPath={`${s.type}.${f.name}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            <Button onClick={addSection} variant="secondary">
              + Add Section
            </Button>
          </>
        )}
      </Card>

      {/* Workflow Info */}
      <Card title="Workflow Guide">
        <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>Save Draft</strong> - Saves to localStorage for preview</li>
          <li><strong>Preview Draft</strong> - Opens draft version in new tab</li>
          <li><strong>Publish to Live</strong> - Saves to database for live access</li>
          <li><strong>View Live</strong> - Opens published version</li>
        </ol>
      </Card>
    </>
  );
}
