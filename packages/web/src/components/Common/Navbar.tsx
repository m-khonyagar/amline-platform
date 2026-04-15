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
      <div style={{ display: 'flex', gap: '1rem', color: '#475569', fontSize: '0.95rem' }}>
        <span>خانه</span>
        <span>پنل ادمین</span>
        <span>حساب کاربری</span>
        <span>مشاور</span>
      </div>
    </nav>
  );
}
