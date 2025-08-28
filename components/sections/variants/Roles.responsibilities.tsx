export default function RolesResponsibilities({ 
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
    <section style={{ padding: '64px 0' }}>
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
            {leftTitle || 'A8 Responsibilities'}
          </h2>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            {(leftBullets || [
              'Talent & partner management',
              'Activation strategy & event production',
              'Amplification & community engagement'
            ]).map((bullet, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>{bullet}</li>
            ))}
          </ul>
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
            {rightTitle || 'Brand Partner'}
          </h2>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            {(rightBullets || [
              'Brand guidance & approvals',
              'Co-marketing & promotion',
              'Measurement alignment'
            ]).map((bullet, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
