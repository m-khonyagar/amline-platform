import Link from 'next/link';

const navItems = [
  { href: '/', label: 'خانه' },
  { href: '/admin/licenses', label: 'پنل ادمین' },
  { href: '/account/profile', label: 'حساب کاربری' },
  { href: '/agent/dashboard', label: 'مشاور' },
];

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
        gap: '1rem',
      }}
    >
      <Link href="/" style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
        Amline Platform
      </Link>
      <div style={{ display: 'flex', gap: '1rem', color: '#475569', fontSize: '0.95rem', flexWrap: 'wrap' }}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} style={{ color: '#475569', textDecoration: 'none' }}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
