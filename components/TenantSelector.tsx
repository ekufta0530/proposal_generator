'use client';

import { useState, useEffect } from 'react';
import { switchTenant, getUserContextFromUrl } from '@/lib/client-url-utils';

interface Tenant {
  id: string;
  name: string;
}

interface TenantSelectorProps {
  currentTenant: string;
  orgId?: string;
}

export default function TenantSelector({ currentTenant, orgId }: TenantSelectorProps) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenants for the organization
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = new URL('/api/tenants', window.location.origin);
        if (orgId) {
          url.searchParams.set('org_id', orgId);
        }
        
        const response = await fetch(url.toString());
        const data = await response.json();
        
        if (response.ok) {
          setTenants(data.tenants || []);
        } else {
          setError(data.error || 'Failed to fetch tenants');
        }
      } catch (err) {
        console.error('Error fetching tenants:', err);
        setError('Failed to fetch tenants');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [orgId]);

  const handleTenantChange = (newTenantId: string) => {
    if (newTenantId === currentTenant) return;
    
    const userContext = getUserContextFromUrl();
    if (userContext) {
      // Use the client-side utility to switch tenants
      switchTenant(newTenantId, userContext);
    } else {
      console.error('No user context found for tenant switching');
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '6px 12px',
        fontSize: '14px',
        color: '#6b7280',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#f9fafb'
      }}>
        Loading tenants...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '6px 12px',
        fontSize: '14px',
        color: '#dc2626',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        backgroundColor: '#fef2f2'
      }}>
        Error loading tenants
      </div>
    );
  }

  if (tenants.length <= 1) {
    // Don't show dropdown if there's only one tenant or no tenants
    return (
      <div style={{
        padding: '6px 12px',
        fontSize: '14px',
        color: '#6b7280',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#f9fafb'
      }}>
        {tenants.length === 1 ? tenants[0].name : 'No tenants'}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={currentTenant}
        onChange={(e) => handleTenantChange(e.target.value)}
        style={{
          padding: '6px 12px',
          fontSize: '14px',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          backgroundColor: 'white',
          cursor: 'pointer',
          appearance: 'none',
          paddingRight: '32px',
          minWidth: '120px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div style={{
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        color: '#6b7280'
      }}>
        ▼
      </div>
    </div>
  );
}
