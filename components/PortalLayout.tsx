'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface Tenant {
  id: string;
  name: string;
}

export default function PortalLayout({ children, title = "Portal" }: PortalLayoutProps) {
  const pathname = usePathname();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('default');
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);

  const navItems = [
    { href: '/portal', label: 'Create Proposal', icon: '📝' },
    { href: '/proposals', label: 'View Proposals', icon: '📋' },
  ];

  // Load tenants on component mount
  useEffect(() => {
    async function loadTenants() {
      console.log('PortalLayout - loading tenants...');
      try {
        const response = await fetch('/api/tenants');
        const data = await response.json();
        console.log('PortalLayout - tenants API response:', data);
        if (data.success) {
          setTenants(data.tenants || []);
          // Set default tenant if available
          if (data.tenants.length > 0) {
            const savedTenant = localStorage.getItem('selectedTenant');
            console.log('PortalLayout - savedTenant from localStorage:', savedTenant);
            const defaultTenant = savedTenant && data.tenants.find((t: Tenant) => t.id === savedTenant) 
              ? savedTenant 
              : data.tenants[0].id;
            console.log('PortalLayout - setting default tenant:', defaultTenant);
            setSelectedTenant(defaultTenant);
          }
        }
      } catch (error) {
        console.error('Failed to load tenants:', error);
      } finally {
        setIsLoadingTenants(false);
      }
    }
    loadTenants();
  }, []);

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenant(tenantId);
    localStorage.setItem('selectedTenant', tenantId);
    
    // Dispatch custom event for same-tab listeners
    window.dispatchEvent(new CustomEvent('localStorageChange', {
      detail: {
        key: 'selectedTenant',
        newValue: tenantId,
        oldValue: selectedTenant
      }
    }));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          {/* Logo/Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              P
            </div>
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
              Proposals Portal
            </span>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: pathname === item.href ? '#3b82f6' : '#6b7280',
                  backgroundColor: pathname === item.href ? '#eff6ff' : 'transparent',
                  fontWeight: pathname === item.href ? '500' : '400',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side - Tenant selector and Back to Site */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Tenant Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}>
                Tenant:
              </label>
              <select 
                value={selectedTenant}
                onChange={(e) => handleTenantChange(e.target.value)}
                disabled={isLoadingTenants}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  minWidth: '120px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {isLoadingTenants ? (
                  <option>Loading...</option>
                ) : (
                  tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <Link
              href="/"
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#6b7280',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                transition: 'all 0.2s ease'
              }}
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        minHeight: 'calc(100vh - 64px)'
      }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            {title}
          </h1>
          <div style={{
            height: '4px',
            width: '60px',
            backgroundColor: '#3b82f6',
            borderRadius: '2px'
          }} />
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
