export default function AmplificationContent({ 
  leftTitle, 
  leftDescription, 
  leftNote, 
  rightTitle, 
  rightDescription, 
  rightBullets 
}: { 
  leftTitle?: string; 
  leftDescription?: string; 
  leftNote?: string; 
  rightTitle?: string; 
  rightDescription?: string; 
  rightBullets?: string[]; 
}) {
  return (
    <section style={{ 
      padding: '64px 0',
      background: '#f6f6f6'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: 'auto', 
        padding: '0 20px',
        display: 'grid',
        gap: '24px',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 6px 24px rgba(0,0,0,.08)'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(24px,3vw,36px)', 
            lineHeight: 1.2, 
            margin: '0 0 16px' 
          }}>
            {leftTitle || '[Left Amplification Title - Please fill in]'}
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: '1.5' }}>
            {leftDescription || '[Left amplification description goes here - Please fill in]'}
          </p>
          {leftNote && (
            <p style={{ 
              letterSpacing: '.12em', 
              textTransform: 'uppercase', 
              color: '#70757a', 
              fontSize: '.78rem',
              margin: '0'
            }}>
              {leftNote}
            </p>
          )}
        </div>
        <div style={{
          background: '#fff',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 6px 24px rgba(0,0,0,.08)'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(24px,3vw,36px)', 
            lineHeight: 1.2, 
            margin: '0 0 16px' 
          }}>
            {rightTitle || '[Right Amplification Title - Please fill in]'}
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: '1.5' }}>
            {rightDescription || '[Right amplification description goes here - Please fill in]'}
          </p>
          {rightBullets && rightBullets.length > 0 && (
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              {rightBullets.map((bullet, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
