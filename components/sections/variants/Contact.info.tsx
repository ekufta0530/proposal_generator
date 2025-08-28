export default function ContactInfo({ 
  title, 
  company, 
  contactName, 
  contactTitle, 
  contactEmail, 
  assets 
}: { 
  title?: string; 
  company?: string; 
  contactName?: string; 
  contactTitle?: string; 
  contactEmail?: string; 
  assets?: Array<{ label: string; url: string }>; 
}) {
  return (
    <section style={{ padding: '64px 0' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: 'auto', 
        padding: '0 20px',
        display: 'grid',
        gap: '24px',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
      }}>
        <div>
          <h2 style={{ 
            fontSize: 'clamp(24px,3vw,36px)', 
            lineHeight: 1.2, 
            margin: '0 0 16px' 
          }}>
            {title || 'Thank You'}
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: 1.5 }}>
            By {company || 'Hive Gaming'}
          </p>
          <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: 1.5 }}>
            <strong>{contactName || 'Steve Buzby'}</strong> — {contactTitle || 'Founder | Chief Disruption Officer'}
          </p>
          {contactEmail && (
            <p style={{ margin: '0', fontSize: '16px', lineHeight: 1.5 }}>
              <a href={`mailto:${contactEmail}`} style={{ color: '#e10600', textDecoration: 'none' }}>
                {contactEmail}
              </a>
            </p>
          )}
        </div>
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 6px 24px rgba(0,0,0,.08)'
        }}>
          <h3 style={{ 
            fontSize: '20px',
            lineHeight: 1.2, 
            margin: '0 0 16px' 
          }}>
            Assets
          </h3>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            {(assets || [
              { label: 'Download one-pager (PDF)', url: '#' },
              { label: 'Brand kit', url: '#' },
              { label: 'Schedule (CSV)', url: '#' }
            ]).map((asset, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                <a href={asset.url} style={{ color: '#e10600', textDecoration: 'none' }}>
                  {asset.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
