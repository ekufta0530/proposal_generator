"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { metadata } from "@/components/sections/registry";
import FormField from "@/components/FormField";
import PortalLayout from "@/components/PortalLayout";
import { Button, Input, Select, Card, StatusMessage } from "@/components/ui/PortalStyles";

/**
 * Enhanced portal with draft/publish workflow:
 * - Choose tenant + slug
 * - Compose sections and fill fields (based on registry metadata)
 * - Save draft to localStorage for preview
 * - Publish draft to database for live access
 */
type SectionChoice = { type: string; variant: string; enabled?: boolean; props?: Record<string,any> };
type Tenant = { id: string; name: string; colors: { primary: string } };
type Profile = { branding: { name: string; colors: { primary: string } }; layoutDefaults?: { sections: SectionChoice[] } };

export default function Portal(){
  const [tenant,setTenant]=useState(() => {
    // Try to get tenant from localStorage, fallback to "default"
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedTenant') || "default";
    }
    return "default";
  });
  const [slug,setSlug]=useState("bigco");
  const [sections,setSections]=useState<SectionChoice[]>([
    {type:"Hero",variant:"simple",props:{}},{type:"Problem",variant:"concise",props:{}}
  ]);
  const [proposal,setProposal]=useState<any>({Hero:{title:"Proposal Title",subtitle:"Subtitle"},Problem:{bullets:["One","Two","Three"]},CustomerStories:{useCollection:"default"}});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string>("");
  
  // Profile management
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingProposal, setIsLoadingProposal] = useState(false);

  const sectionTypes=useMemo(()=>Object.keys(metadata),[]);

  // Load profile when tenant changes
  useEffect(() => {
    async function loadProfile() {
      if (!tenant) return;
      
      setIsLoadingProfile(true);
      try {
        const response = await fetch(`/api/tenants?tenant=${tenant}`);
        const data = await response.json();
        if (data.success) {
          setCurrentProfile(data.profile);
          // Update sections with profile defaults if available
          if (data.profile.layoutDefaults?.sections) {
            setSections(data.profile.layoutDefaults.sections);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, [tenant]);

  // Load existing proposal data when editing (check URL params)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const editSlug = urlParams.get('slug');
    
    if (editSlug && editSlug !== slug) {
      setIsLoadingProposal(true);
      setSlug(editSlug);
      
      // Try to load from localStorage first (draft)
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
        // If no draft, try to load from database
        loadProposalFromDatabase(editSlug);
      }
    }
  }, [tenant, slug]);

  async function loadProposalFromDatabase(proposalSlug: string) {
    try {
      const response = await fetch(`/api/proposal?tenant=${tenant}&slug=${proposalSlug}`);
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
      console.error('Failed to load proposal from database:', error);
    } finally {
      setIsLoadingProposal(false);
    }
  }

  function updateSection(i:number,patch:Partial<SectionChoice>){setSections(p=>p.map((s,idx)=>idx===i?{...s,...patch}:s));}
  function addSection(){const t=sectionTypes[0];const v=(metadata as any)[t].variants[0].id;setSections(p=>[...p,{type:t,variant:v}]);}
  function removeSection(i:number){setSections(p=>p.filter((_,idx)=>idx!==i));}
  function move(i:number,dir:-1|1){setSections(p=>{const n=[...p];const j=i+dir;if(j<0||j>=n.length)return p;[n[i],n[j]]=[n[j],n[i]];return n;});}

  function saveDraft(){
    localStorage.setItem(`layoutOverride:${tenant}:${slug}`,JSON.stringify({sections}));
    localStorage.setItem(`proposal:${tenant}:${slug}`,JSON.stringify(proposal));
    alert("✅ Draft saved locally. You can now preview it.");
  }

  async function publishDraft() {
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

  const preview=`/proposal/${slug}?draft=1`;
  const live=`/proposal/${slug}`;

  return (
    <PortalLayout title="Create Proposal">
      {/* Proposal Configuration */}
      <Card title="Proposal Configuration">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
          <Input
            label="Proposal Slug"
            value={slug}
            onChange={setSlug}
            placeholder="Enter proposal slug"
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
            <span><strong>Brand:</strong> {currentProfile.branding.name}</span>
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
            <span><strong>Default Sections:</strong> {currentProfile.layoutDefaults?.sections?.length || 0}</span>
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

      {/* Action Buttons */}
      <Card title="Actions">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button onClick={saveDraft}>
            💾 Save Draft
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
    </PortalLayout>
  );
}
