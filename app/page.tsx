export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Zenith MVP</h1>
      <p>Welcome to the Zenith Minimal Viable Product</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>Status</h2>
        <ul>
          <li>✅ Next.js App Running</li>
          <li>✅ TypeScript Configured</li>
          <li>✅ API Route Available</li>
        </ul>
      </section>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>Test API</h2>
        <p>
          <a href="/api/health" style={{ color: 'blue', textDecoration: 'underline' }}>
            Check Health Endpoint
          </a>
        </p>
      </section>
    </main>
  )
}