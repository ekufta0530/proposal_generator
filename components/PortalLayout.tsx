'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import TenantSelector from './TenantSelector';

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function PortalLayout({ children, title = "Portal" }: PortalLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Extract current tenant and org_id from URL
  const currentTenant = searchParams.get('tenant') || '';
  const orgId = searchParams.get('org_id') || '';

  // Build navigation items with current org_id and tenant parameters
  const buildNavUrl = (path: string) => {
    const url = new URL(path, window.location.origin);
    if (orgId) url.searchParams.set('org_id', orgId);
    if (currentTenant) url.searchParams.set('tenant', currentTenant);
    return url.pathname + url.search;
  };

  const navItems = [
    { href: buildNavUrl('/portal'), label: 'Create Proposal', icon: '📝' },
    { href: buildNavUrl('/proposals'), label: 'View Proposals', icon: '📋' },
  ];

  // Tenant management removed - now handled via URL parameters only

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

          {/* Right side - Tenant Selector, Logout and Back to Site */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Tenant Selector */}
            {currentTenant && (
              <TenantSelector 
                currentTenant={currentTenant} 
                orgId={orgId} 
              />
            )}
            
            <button
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/';
                } catch (error) {
                  console.error('Logout failed:', error);
                  // Still redirect to home even if logout fails
                  window.location.href = '/';
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              <span>🚪</span>
              Logout
            </button>

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
