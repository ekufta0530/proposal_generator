'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '24px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        padding: '48px 24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Error Icon */}
        <div style={{
          fontSize: '64px',
          marginBottom: '24px'
        }}>
          🔍
        </div>
        
        {/* Error Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 16px 0'
        }}>
          Page Not Found
        </h1>
        
        {/* Error Description */}
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: '0 0 32px 0',
          lineHeight: '1.6'
        }}>
          The page you're looking for doesn't exist or the URL parameters are invalid.
          This might happen if the organization or tenant ID is malformed or doesn't exist.
        </p>
        
        {/* Return to Home Button */}
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          ← Return to Home
        </Link>
        
        {/* Additional Help */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
            Common issues:
          </p>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li>Invalid organization ID format</li>
            <li>Tenant doesn't belong to the specified organization</li>
            <li>Organization or tenant doesn't exist</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
