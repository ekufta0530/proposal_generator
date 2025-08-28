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
  const [showDrafts, setShowDrafts] = useState(false);

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

  // Load proposals when tenant or draft filter changes
  useEffect(() => {
    async function loadProposals() {
      console.log('Proposals page - loading proposals for tenant:', tenant, 'showDrafts:', showDrafts);
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/proposals?tenant=${tenant}&draft=${showDrafts}`);
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
  }, [tenant, showDrafts]);

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
      {/* Filters */}
      <Card title="Filters">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="showDrafts"
            checked={showDrafts}
            onChange={(e) => setShowDrafts(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <label htmlFor="showDrafts" style={{ fontSize: '14px', color: '#374151' }}>
            Show drafts only
          </label>
        </div>
      </Card>

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
                No {showDrafts ? 'draft' : 'published'} proposals found
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
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      color: proposal.is_draft ? '#6b7280' : '#111827'
                    }}>
                      {proposal.title}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6b7280' }}>
                      <span>Slug: {proposal.slug}</span>
                      <span>Updated: {formatDate(proposal.updated_at)}</span>
                    </div>
                    {proposal.is_draft && (
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        marginTop: '8px'
                      }}>
                        Draft
                      </span>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      href={`/proposal/${proposal.slug}${proposal.is_draft ? '?draft=1' : ''}`}
                      target="_blank"
                      style={{ textDecoration: 'none' }}
                    >
                      <Button variant="secondary">
                        {proposal.is_draft ? 'Preview' : 'View'}
                      </Button>
                    </Link>
                    <Link
                      href={`/portal?tenant=${tenant}&slug=${proposal.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Button variant="primary">
                        Edit
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
