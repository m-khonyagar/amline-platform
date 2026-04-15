export function Navbar() {
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.25rem',
        maxWidth: '1100px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      <strong>Amline Platform</strong>
      <span style={{ color: '#475569' }}>API-connected local demo</span>
    </nav>
  );
}
