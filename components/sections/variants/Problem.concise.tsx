export default function ProblemConcise({ bullets = [] as string[] }) {
  return (
    <section style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Problem (concise)</h2>
      <ul>{bullets.slice(0,3).map((b, i) => <li key={i}>{b}</li>)}</ul>
    </section>
  );
}
