export default function CustomerStoriesList({ items = [] as any[] }) {
  return (
    <section style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Customer Stories</h2>
      <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>
        {items.map((r:any, i:number) => (
          <li key={r.id || i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <strong>{r.title}</strong>
            {r.quote && <p style={{ margin: '6px 0' }}>“{r.quote}”</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
