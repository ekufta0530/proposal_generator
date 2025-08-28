export default function HeroSimple({ title, subtitle, color }:{ title?:string; subtitle?:string; color?:string }) {
  return (
    <section style={{ background: color || '#4f46e5', color: 'white', padding: 24 }}>
      <h1 style={{ margin: 0 }}>{title || 'Hero (simple)'}</h1>
      {subtitle && <p style={{ marginTop: 8 }}>{subtitle}</p>}
    </section>
  );
}
