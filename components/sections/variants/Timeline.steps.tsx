export default function TimelineSteps({ 
  title, 
  steps 
}: { 
  title?: string; 
  steps?: Array<{ title: string; description: string }>; 
}) {
  return (
    <section style={{ padding: '64px 0' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: 'auto', 
        padding: '0 20px' 
      }}>
        <h2 style={{ 
          fontSize: 'clamp(24px,3vw,36px)', 
          lineHeight: 1.2, 
          margin: '0 0 16px' 
        }}>
          {title || 'Program Timeline'}
        </h2>
        <div style={{ 
          display: 'grid', 
          gap: '14px',
          marginTop: '12px'
        }}>
          {(steps || [
            { title: 'Planning', description: 'Creator roster & show planning' },
            { title: 'Launch (April)', description: 'Refresh Your Plays flight begins' },
            { title: 'Conference (May–July)', description: '2-day event + TwitchCon' },
            { title: 'Reporting (August)', description: 'Reach, engagement, brand love, event KPIs' }
          ]).map((step, index) => (
            <div key={index} style={{
              display: 'grid',
              gap: '6px',
              padding: '18px',
              borderLeft: '4px solid #e10600',
              background: '#fff',
              borderRadius: '10px',
              boxShadow: '0 6px 24px rgba(0,0,0,.08)'
            }}>
              <strong style={{ fontSize: '16px', fontWeight: 600 }}>
                {step.title}
              </strong>
              <div style={{ fontSize: '16px', lineHeight: 1.5 }}>
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
