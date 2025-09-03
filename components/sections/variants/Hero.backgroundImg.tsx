export default function HeroBackgroundImg({ 
  eyebrow, 
  title, 
  subtitle, 
  backgroundImage, 
  ctaText, 
  ctaLink 
}: { 
  eyebrow?: string; 
  title?: string; 
  subtitle?: string; 
  backgroundImage?: string; 
  ctaText?: string; 
  ctaLink?: string; 
}) {
  return (
    <section 
      className="hero" 
      style={{ 
        minHeight: '72vh',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        color: '#fff',
        background: `linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.55)), url('${backgroundImage || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop'}') center/cover no-repeat`
      }}
    >
      <div style={{ maxWidth: '900px', textAlign: 'center', padding: '64px 20px' }}>
        {eyebrow && (
          <div style={{ 
            letterSpacing: '.12em', 
            textTransform: 'uppercase', 
            color: '#70757a', 
            fontSize: '.78rem',
            marginBottom: '16px'
          }}>
            {eyebrow}
          </div>
        )}
        <h1 style={{ 
          fontSize: 'clamp(32px,4.5vw,56px)', 
          lineHeight: 1.2, 
          margin: '0 0 16px',
          color: '#fff'
        }}>
          {title || '[Hero Title - Please fill in]'}
        </h1>
        {subtitle && (
          <p style={{ margin: '0 0 12px', fontSize: '18px' }}>
            {subtitle}
          </p>
        )}
        {(ctaText && ctaLink) && (
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center', 
            marginTop: '18px', 
            flexWrap: 'wrap' 
          }}>
            <a 
              href={ctaLink}
              style={{
                display: 'inline-block',
                padding: '12px 18px',
                borderRadius: '999px',
                fontWeight: 600,
                border: '2px solid #fff',
                color: '#fff',
                background: 'transparent',
                textDecoration: 'none'
              }}
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
