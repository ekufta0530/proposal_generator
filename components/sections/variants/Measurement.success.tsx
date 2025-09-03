export default function MeasurementSuccess({ 
  leftTitle, 
  leftBullets, 
  rightTitle, 
  rightBullets 
}: { 
  leftTitle?: string; 
  leftBullets?: string[]; 
  rightTitle?: string; 
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
            {leftTitle || '[Left Title - Please fill in]'}
          </h2>
          {(leftBullets || ['[Left bullet 1 - Please fill in]', '[Left bullet 2 - Please fill in]', '[Left bullet 3 - Please fill in]']).map((bullet, index) => (
            <ul key={index} style={{ margin: '0', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>{bullet}</li>
            </ul>
          ))}
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
            {rightTitle || '[Right Title - Please fill in]'}
          </h2>
          {(rightBullets || ['[Right bullet 1 - Please fill in]', '[Right bullet 2 - Please fill in]', '[Right bullet 3 - Please fill in]', '[Right bullet 4 - Please fill in]']).map((bullet, index) => (
            <ul key={index} style={{ margin: '0', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>{bullet}</li>
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
