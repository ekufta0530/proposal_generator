export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Proposals Platform — PostgreSQL</h1>
      <ul>
        <li><a href="/portal">Portal</a></li>
        <li><a href="/proposal?tenant=acme">/proposal?tenant=acme</a></li>
        <li><a href="/proposal/bigco?tenant=acme">/proposal/bigco?tenant=acme</a></li>
        <li><a href="/api/sections" target="_blank">/api/sections</a></li>
        <li><a href="/api/profile?tenant=acme" target="_blank">/api/profile?tenant=acme</a></li>
      </ul>
    </main>
  );
}
