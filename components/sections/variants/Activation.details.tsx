export default function ActivationDetails({ 
  title, 
  details, 
  themes 
}: { 
  title?: string; 
  details?: Array<{ label: string; value: string }>; 
  themes?: Array<{ title: string; items: string[] }>; 
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
          {title || 'Activation Details'}
        </h2>
        <div style={{ 
          display: 'grid', 
          gap: '12px', 
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          marginTop: '12px'
        }}>
          {(details || [
            { label: 'What', value: '2-day micro-influencer conference (within TwitchCon AMS)' },
            { label: 'Why', value: 'Grassroots authenticity → brand love' },
            { label: 'When', value: 'Mid-July (2 days), plus TwitchCon day' },
            { label: 'Who', value: '25 diverse micro-influencers (UK & EU)' },
            { label: 'Where', value: 'Amsterdam: office / show floor / hotel' },
            { label: 'Communities', value: 'LoL, Rocket League, FIFA, Wild Rift, Variety, Cosplay' }
          ]).map((detail, index) => (
            <div key={index} style={{
              background: '#fff',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 6px 24px rgba(0,0,0,.08)'
            }}>
              <strong style={{ display: 'block', marginBottom: '8px' }}>
                {detail.label}
              </strong>
              <p style={{ margin: '0', fontSize: '16px', lineHeight: 1.5 }}>
                {detail.value}
              </p>
            </div>
          ))}
        </div>

        {themes && themes.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 6px 24px rgba(0,0,0,.08)',
            marginTop: '24px'
          }}>
            <h3 style={{ 
              fontSize: '20px',
              lineHeight: 1.2, 
              margin: '0 0 16px' 
            }}>
              Conference Themes
            </h3>
            <div style={{ 
              display: 'grid', 
              gap: '24px', 
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' 
            }}>
              {themes.map((theme, index) => (
                <div key={index}>
                  <h4 style={{ 
                    fontSize: '18px',
                    lineHeight: 1.2, 
                    margin: '0 0 12px' 
                  }}>
                    {theme.title}
                  </h4>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    {theme.items.map((item, itemIndex) => (
                      <li key={itemIndex} style={{ marginBottom: '8px' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
