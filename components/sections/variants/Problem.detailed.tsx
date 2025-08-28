export default function ProblemDetailed({ bullets = [] as string[] }) {
  return (
    <section style={{ padding: 24, background: '#f8fafc' }}>
      <h2 style={{ marginTop: 0 }}>Problem (detailed)</h2>
      <ol>{bullets.map((b, i) => <li key={i} style={{ marginBottom: 8 }}>{b}</li>)}</ol>
    </section>
  );
}
