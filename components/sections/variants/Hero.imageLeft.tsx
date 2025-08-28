export default function HeroImageLeft({ title, subtitle, color }:{ title?:string; subtitle?:string; color?:string }) {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems: 'center', background: color || '#0ea5e9', color: 'white', padding: 24 }}>
      <div style={{ width: 120, height: 80, background: 'rgba(255,255,255,0.2)', borderRadius: 8 }} />
      <div>
        <h1 style={{ margin: 0 }}>{title || 'Hero (imageLeft)'}</h1>
        {subtitle && <p style={{ marginTop: 8 }}>{subtitle}</p>}
      </div>
    </section>
  );
}
