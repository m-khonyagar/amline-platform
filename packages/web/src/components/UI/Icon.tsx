type IconName =
  | 'back'
  | 'search'
  | 'account'
  | 'contracts'
  | 'chat'
  | 'home'
  | 'add'
  | 'listing'
  | 'needs'
  | 'payments'
  | 'bookmarks'
  | 'requests'
  | 'support'
  | 'info'
  | 'legal'
  | 'logout'
  | 'sync'
  | 'send'
  | 'attachment'
  | 'chevronLeft'
  | 'chevronDown'
  | 'check'
  | 'externalLink';

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const shared = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'back':
    case 'chevronLeft':
      return <svg {...shared}><path d="m15 18-6-6 6-6" /></svg>;
    case 'chevronDown':
      return <svg {...shared}><path d="m6 9 6 6 6-6" /></svg>;
    case 'check':
      return <svg {...shared}><path d="m5 13 4 4L19 7" /></svg>;
    case 'externalLink':
      return <svg {...shared}><path d="M14 5h5v5" /><path d="M10 14 19 5" /><path d="M19 13v5h-5" /><path d="M5 10V5h5" /></svg>;
    case 'search':
      return <svg {...shared}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>;
    case 'account':
      return <svg {...shared}><circle cx="12" cy="8" r="3.2" /><path d="M5 19c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" /></svg>;
    case 'contracts':
      return <svg {...shared}><rect x="4" y="4" width="16" height="16" rx="2.5" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>;
    case 'chat':
      return <svg {...shared}><path d="M6 7.5h12A2.5 2.5 0 0 1 20.5 10v5a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 3v-3H6A2.5 2.5 0 0 1 3.5 15v-5A2.5 2.5 0 0 1 6 7.5Z" /></svg>;
    case 'home':
      return <svg {...shared}><path d="m4 11.5 8-6.5 8 6.5" /><path d="M7 10.5V19h10v-8.5" /></svg>;
    case 'add':
      return <svg {...shared}><path d="M12 5v14M5 12h14" /></svg>;
    case 'listing':
      return <svg {...shared}><path d="M5 6h14M5 12h14M5 18h10" /></svg>;
    case 'needs':
      return <svg {...shared}><path d="M12 4v16M4 12h16" /><circle cx="12" cy="12" r="8" /></svg>;
    case 'payments':
      return <svg {...shared}><rect x="3.5" y="6" width="17" height="12" rx="2.5" /><path d="M3.5 10h17" /></svg>;
    case 'bookmarks':
      return <svg {...shared}><path d="M7 4.5h10v15l-5-3.2-5 3.2z" /></svg>;
    case 'requests':
      return <svg {...shared}><path d="M12 4.5v15M7 9.5l5-5 5 5" /></svg>;
    case 'support':
      return <svg {...shared}><circle cx="12" cy="12" r="8.5" /><path d="M9.8 9.4a2.3 2.3 0 1 1 4.4 1c-.5 1-1.7 1.3-2.2 2.1" /><path d="M12 16.8h.01" /></svg>;
    case 'info':
      return <svg {...shared}><circle cx="12" cy="12" r="8.5" /><path d="M12 10v6M12 7.7h.01" /></svg>;
    case 'legal':
      return <svg {...shared}><path d="M12 5v14" /><path d="M7 9h10" /><path d="M7.5 9 5 14h5L7.5 9ZM16.5 9 14 14h5l-2.5-5Z" /></svg>;
    case 'logout':
      return <svg {...shared}><path d="M9 5.5H6A2.5 2.5 0 0 0 3.5 8v8A2.5 2.5 0 0 0 6 18.5h3" /><path d="m13 8.5 4 3.5-4 3.5" /><path d="M17 12H9" /></svg>;
    case 'sync':
      return <svg {...shared}><path d="M20 7.5V4h-3.5" /><path d="M4 16.5V20h3.5" /><path d="M18.5 10a7 7 0 0 0-12-3.5L4 9" /><path d="M5.5 14A7 7 0 0 0 17.5 17.5L20 15" /></svg>;
    case 'send':
      return <svg {...shared}><path d="m21 3-9.5 9.5" /><path d="M21 3 14.5 21l-3-8-8-3z" /></svg>;
    case 'attachment':
      return <svg {...shared}><path d="M8.5 12.5 14 7a3 3 0 1 1 4.2 4.2l-7.1 7.1a5 5 0 1 1-7.1-7.1L11 4.3" /></svg>;
    default:
      return <svg {...shared}><circle cx="12" cy="12" r="8.5" /></svg>;
  }
}
