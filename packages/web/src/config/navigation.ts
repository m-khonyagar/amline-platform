export type AppNavItem = {
  href: string;
  label: string;
  icon?: 'home' | 'contracts' | 'chat' | 'account' | 'support' | 'legal' | 'listing' | 'payments';
};

export const publicNavItems: AppNavItem[] = [
  { href: '/', label: 'خانه' },
  { href: '/contracts/new', label: 'قرارداد دیجیتال' },
  { href: '/support', label: 'پشتیبانی' },
  { href: '/legal', label: 'مرکز حقوقی' },
];

export const accountNavItems: AppNavItem[] = [
  { href: '/', label: 'خانه', icon: 'home' },
  { href: '/contracts', label: 'قراردادها', icon: 'contracts' },
  { href: '/chat', label: 'گفتگو', icon: 'chat' },
  { href: '/account/profile', label: 'حساب من', icon: 'account' },
];

export const accountSidebarLinks: AppNavItem[] = [
  { href: '/account/profile', label: 'حساب کاربری' },
  { href: '/contracts', label: 'قراردادهای من' },
  { href: '/account/payment-history', label: 'پرداخت و تسویه' },
  { href: '/support', label: 'پشتیبانی و راهنما' },
];

export const agentSidebarLinks: AppNavItem[] = [
  { href: '/agent/dashboard', label: 'مرکز عملیات' },
  { href: '/contracts', label: 'قراردادهای تیم' },
  { href: '/account/listings', label: 'آگهی‌ها و نیازها' },
  { href: '/support', label: 'پشتیبانی و شکایات' },
];

export const adminSidebarLinks: AppNavItem[] = [
  { href: '/admin', label: 'داشبورد ادمین' },
  { href: '/admin/review-queue', label: 'صف بررسی' },
  { href: '/admin/fraud-desk', label: 'میز تقلب' },
  { href: '/admin/reports-kpi', label: 'گزارش و KPI' },
  { href: '/admin/contracts/ct-1001', label: 'نمونه پرونده قرارداد' },
];
