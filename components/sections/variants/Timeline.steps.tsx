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
          {title || '[Timeline Title - Please fill in]'}
        </h2>
        <div style={{ 
          display: 'grid', 
          gap: '14px',
          marginTop: '12px'
        }}>
          {(steps || [
            { title: 'Step 1', description: '[Step 1 description - Please fill in]' },
            { title: 'Step 2', description: '[Step 2 description - Please fill in]' },
            { title: 'Step 3', description: '[Step 3 description - Please fill in]' },
            { title: 'Step 4', description: '[Step 4 description - Please fill in]' }
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
              <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
