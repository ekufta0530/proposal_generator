export default function BudgetPricing({ 
  title, 
  tiers 
}: { 
  title?: string; 
  tiers?: Array<{ 
    title: string; 
    price: string; 
    description: string; 
    bullets: string[]; 
  }>; 
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
          {title || '[Budget Title - Please fill in]'}
        </h2>
        <div style={{ 
          display: 'grid', 
          gap: '24px', 
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          marginTop: '12px'
        }}>
          {(tiers || [
            {
              title: 'Tier 1',
              price: '[Price - Please fill in]',
              description: '[Tier 1 description - Please fill in]',
              bullets: ['[Bullet 1 - Please fill in]', '[Bullet 2 - Please fill in]', '[Bullet 3 - Please fill in]']
            },
            {
              title: 'Tier 2',
              price: '[Price - Please fill in]',
              description: '[Tier 2 description - Please fill in]',
              bullets: ['[Bullet 1 - Please fill in]', '[Bullet 2 - Please fill in]', '[Bullet 3 - Please fill in]']
            },
            {
              title: 'Tier 3',
              price: '[Price - Please fill in]',
              description: '[Tier 3 description - Please fill in]',
              bullets: ['[Bullet 1 - Please fill in]', '[Bullet 2 - Please fill in]', '[Bullet 3 - Please fill in]']
            }
          ]).map((tier, index) => (
            <div key={index} style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: '14px',
              padding: '20px'
            }}>
              <h3 style={{ 
                fontSize: '20px',
                lineHeight: 1.2, 
                margin: '0 0 8px' 
              }}>
                {tier.title}
              </h3>
              <p style={{ 
                letterSpacing: '.12em', 
                textTransform: 'uppercase', 
                color: '#70757a', 
                fontSize: '.78rem',
                margin: '0 0 12px'
              }}>
                {tier.price}
              </p>
              <ul style={{ margin: '0', paddingLeft: '20px' }}>
                {tier.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} style={{ marginBottom: '8px' }}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
