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
            {leftTitle || 'How We Measure Success — Content'}
          </h2>
          {(leftBullets || ['Reach', 'Engagement', 'Brand Love (Affinity + Sentiment)']).map((bullet, index) => (
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
            {rightTitle || 'How We Measure Success — Event'}
          </h2>
          {(rightBullets || ['Attendance', 'Participation', 'Attendee Feedback', 'Onsite Content Sentiment']).map((bullet, index) => (
            <ul key={index} style={{ margin: '0', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>{bullet}</li>
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
