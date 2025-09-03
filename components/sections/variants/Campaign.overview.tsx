export default function CampaignOverview({ 
  activateTitle, 
  activateDescription, 
  activateBullets, 
  activateLink, 
  amplifyTitle, 
  amplifyDescription, 
  amplifyBullets, 
  amplifyLink 
}: { 
  activateTitle?: string; 
  activateDescription?: string; 
  activateBullets?: string[]; 
  activateLink?: string; 
  amplifyTitle?: string; 
  amplifyDescription?: string; 
  amplifyBullets?: string[]; 
  amplifyLink?: string; 
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
            {activateTitle || '[Activate Title - Please fill in]'}
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: '1.5' }}>
            {activateDescription || '[Activate description goes here - Please fill in]'}
          </p>
          {activateBullets && activateBullets.length > 0 && (
            <ul style={{ margin: '0 0 12px', paddingLeft: '20px' }}>
              {activateBullets.map((bullet, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>{bullet}</li>
              ))}
            </ul>
          )}
          {activateLink && (
            <p style={{ margin: '0' }}>
              <a href={activateLink} style={{ color: '#e10600', textDecoration: 'none' }}>
                See conference details →
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
          <h2 style={{ 
            fontSize: 'clamp(24px,3vw,36px)', 
            lineHeight: 1.2, 
            margin: '0 0 16px' 
          }}>
            {amplifyTitle || '[Amplify Title - Please fill in]'}
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '16px', lineHeight: '1.5' }}>
            {amplifyDescription || '[Amplify description goes here - Please fill in]'}
          </p>
          {amplifyBullets && amplifyBullets.length > 0 && (
            <ul style={{ margin: '0 0 12px', paddingLeft: '20px' }}>
              {amplifyBullets.map((bullet, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>{bullet}</li>
              ))}
            </ul>
          )}
          {amplifyLink && (
            <p style={{ margin: '0' }}>
              <a href={amplifyLink} style={{ color: '#e10600', textDecoration: 'none' }}>
                See amplification →
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
