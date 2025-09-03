export default function ObjectivesStrategy({ 
  title, 
  subtitle, 
  objectives 
}: { 
  title?: string; 
  subtitle?: string; 
  objectives?: Array<{ title: string; description: string }>; 
}) {
  return (
    <section style={{ 
      padding: '64px 0',
      background: '#f6f6f6'
    }}>
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
          {title || '[Objectives Title - Please fill in]'}
        </h2>
        {subtitle && (
          <p style={{ 
            letterSpacing: '.12em', 
            textTransform: 'uppercase', 
            color: '#70757a', 
            fontSize: '.78rem',
            marginBottom: '18px'
          }}>
            {subtitle}
          </p>
        )}
        <div style={{ 
          display: 'grid', 
          gap: '24px', 
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' 
        }}>
          {(objectives || [
            { title: 'Objective 1', description: '[Objective 1 description - Please fill in]' },
            { title: 'Objective 2', description: '[Objective 2 description - Please fill in]' },
            { title: 'Objective 3', description: '[Objective 3 description - Please fill in]' }
          ]).map((objective, index) => (
            <div key={index} style={{
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
                {objective.title}
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: '1.5' }}>
                {objective.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
