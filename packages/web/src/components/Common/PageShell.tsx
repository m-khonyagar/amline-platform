import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '2.5rem 1.25rem 3rem' }}>
        <section
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #fef3c7 100%)',
            borderRadius: '28px',
            padding: '1.75rem 2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>{title}</h1>
          <p style={{ margin: 0, color: '#334155', lineHeight: 1.8 }}>{subtitle}</p>
        </section>
        {children}
      </main>
      <Footer />
    </div>
  );
}
