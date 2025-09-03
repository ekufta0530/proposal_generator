'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { Button, Select, Card, StatusMessage } from '@/components/ui/PortalStyles';

interface Proposal {
  slug: string;
  title: string;
  updated_at: string;
  is_draft: boolean;
}

interface ProposalsResponse {
  success: boolean;
  tenant: string;
  proposals: Proposal[];
  count: number;
  error?: string;
}

export default function ProposalsPage() {
  const [tenant, setTenant] = useState<string>(() => {
    // Initialize with localStorage value if available, otherwise 'default'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedTenant') || 'default';
    }
    return 'default';
  });
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Get tenant from localStorage (synced with navbar)
  useEffect(() => {
    const savedTenant = localStorage.getItem('selectedTenant');
    console.log('Proposals page - savedTenant from localStorage:', savedTenant);
    if (savedTenant && savedTenant !== tenant) {
      console.log('Proposals page - updating tenant from localStorage:', savedTenant);
      setTenant(savedTenant);
    }
  }, [tenant]);

  // Listen for localStorage changes (when tenant selector changes)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedTenant' && e.newValue && e.newValue !== tenant) {
        console.log('Proposals page - localStorage changed, updating tenant:', e.newValue);
        setTenant(e.newValue);
      }
    };

    // Listen for changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab changes)
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === 'selectedTenant' && e.detail?.newValue && e.detail.newValue !== tenant) {
        console.log('Proposals page - custom storage event, updating tenant:', e.detail.newValue);
        setTenant(e.detail.newValue);
      }
    };

    window.addEventListener('localStorageChange', handleCustomStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange as EventListener);
    };
  }, [tenant]);

  // Load proposals when tenant changes
  useEffect(() => {
    async function loadProposals() {
      console.log('Proposals page - loading proposals for tenant:', tenant);
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/proposals?tenant=${tenant}`);
        const data: ProposalsResponse = await response.json();
        
        console.log('Proposals page - API response:', data);
        
        if (data.success) {
          setProposals(data.proposals || []);
        } else {
          setError(data.error || 'Failed to load proposals');
        }
      } catch (err) {
        console.error('Failed to load proposals:', err);
        setError('Failed to load proposals');
      } finally {
        setLoading(false);
      }
    }

    if (tenant) {
      loadProposals();
    }
  }, [tenant]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PortalLayout title="View Proposals">


      {/* Error Message */}
      {error && (
        <StatusMessage type="error" style={{ marginBottom: '20px' }}>
          {error}
        </StatusMessage>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading proposals...
          </div>
        </Card>
      )}

      {/* Proposals List */}
      {!loading && !error && (
        <Card title={`Proposals (${proposals.length})`}>
          {proposals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>
                No proposals found
              </p>
              <p style={{ marginBottom: '20px' }}>Create your first proposal in the portal</p>
              <Link href="/portal" style={{ textDecoration: 'none' }}>
                <Button variant="success">
                  + Create New Proposal
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {proposals.map((proposal) => (
                <div 
                  key={proposal.slug}
                  style={{
                    padding: '20px',
                    border: proposal.is_draft ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: proposal.is_draft ? '#fefce8' : '#f9fafb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Draft overlay */}
                  {proposal.is_draft && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      backgroundColor: '#fbbf24',
                      color: '#92400e',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      borderBottomLeftRadius: '8px',
                      zIndex: 1
                    }}>
                      DRAFT
                    </div>
                  )}
                  
                  <div style={{ 
                    flex: 1,
                    marginRight: proposal.is_draft ? '60px' : '0' // Make room for draft badge
                  }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      color: proposal.is_draft ? '#92400e' : '#111827'
                    }}>
                      {proposal.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                      <span>Slug: {proposal.slug}</span>
                      <span>Updated: {formatDate(proposal.updated_at)}</span>
                    </div>
                    {proposal.is_draft && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#92400e'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#fbbf24',
                          borderRadius: '50%'
                        }}></span>
                        Draft version - not published
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/proposal/${proposal.slug}${proposal.is_draft ? '?draft=1&tenant=' + tenant : ''}`}
                      target="_blank"
                      style={{ textDecoration: 'none' }}
                    >
                      <Button variant="secondary">
                        {proposal.is_draft ? 'Preview Draft' : 'View Live'}
                      </Button>
                    </Link>
                    <Link
                      href={`/portal?tenant=${tenant}&slug=${proposal.slug}${proposal.is_draft ? '&editDraft=true' : ''}`}
                      style={{ textDecoration: 'none' }}
                    >
                                              <Button variant={proposal.is_draft ? 'secondary' : 'primary'}>
                        {proposal.is_draft ? 'Edit Draft' : 'Edit Live'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </PortalLayout>
  );
}
