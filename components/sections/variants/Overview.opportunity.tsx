export default function OverviewOpportunity({ 
  title, 
  description, 
  kpis, 
  imageUrl, 
  imageAlt 
}: { 
  title?: string; 
  description?: string; 
  kpis?: Array<{ label: string; value: string }>; 
  imageUrl?: string; 
  imageAlt?: string; 
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
            {title || 'The Opportunity'}
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: 1.5 }}>
            {description || 'Description of the opportunity goes here.'}
          </p>
          {kpis && kpis.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gap: '12px', 
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              marginTop: '16px'
            }}>
              {kpis.map((kpi, index) => (
                <div key={index} style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  border: '1px solid #eee'
                }}>
                  <div style={{ color: '#70757a', fontSize: '.9rem' }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 6px 24px rgba(0,0,0,.08)'
        }}>
          <img 
            src={imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop'} 
            alt={imageAlt || 'Placeholder image'}
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '12px'
            }}
          />
          <p style={{ 
            marginTop: '10px', 
            color: '#70757a', 
            fontSize: '14px' 
          }}>
            Placeholder image — replace with brand asset.
          </p>
        </div>
      </div>
    </section>
  );
}
