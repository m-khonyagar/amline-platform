export type AccountCollectionItem = {
  id: string;
  title: string;
  city?: string;
  budget?: string;
  status?: string;
};

export type AccountProfileDetails = {
  completionPercent: number;
  identityStatus: 'verified' | 'pending';
  agencyName: string;
  supportPhone: string;
  supportHours: string;
  whatsapp: string;
  preferences: Array<{ key: string; label: string; enabled: boolean }>;
};
type ProfilePreference = AccountProfileDetails['preferences'][number];

const listings: AccountCollectionItem[] = [
  { id: 'listing-1', title: 'آپارتمان خوش‌نقشه ۱۸۰ متری', city: 'قم، پردیسان', status: 'منتشر شده' },
  { id: 'listing-2', title: 'ویلا باغ ۴۵۰ متری', city: 'دماوند', status: 'در انتظار تایید' },
];

const needs: AccountCollectionItem[] = [
  { id: 'need-1', title: 'نیازمندی خرید آپارتمان ۲۵۰ متری', city: 'قم، نیروگاه', budget: 'تا ۴ میلیارد' },
  { id: 'need-2', title: 'نیازمندی رهن و اجاره واحد ۱۲۰ متری', city: 'قم، سالاریه', budget: 'رهن کامل' },
];

const bookmarks: AccountCollectionItem[] = [
  { id: 'bookmark-1', title: 'آپارتمان خوش‌نقشه ۱۸۰ متری', city: 'قم، پردیسان' },
  { id: 'bookmark-2', title: 'ویلا باغ ۴۵۰ متری', city: 'دماوند' },
];

const requests: AccountCollectionItem[] = [
  { id: 'req-1', title: 'درخواست بازدید آپارتمان خوش‌نقشه', status: 'در انتظار پاسخ کارشناس' },
  { id: 'req-2', title: 'درخواست استعلام مالکیت', status: 'ثبت شده و در صف بررسی' },
];

const profile = {
  id: 'acct_1',
  fullName: 'آراد صالحی',
  role: 'seller',
  mobile: '09121234567',
  city: 'تهران',
  membership: 'Amline Plus',
};

const profileDetails: AccountProfileDetails = {
  completionPercent: 86,
  identityStatus: 'verified',
  agencyName: 'املاک امن تهران',
  supportPhone: '+982532048000',
  supportHours: 'هر روز از ساعت ۹ تا ۲۱',
  whatsapp: 'https://wa.me/989127463726',
  preferences: [
    { key: 'sms', label: 'اعلان پیامکی قرارداد', enabled: true },
    { key: 'push', label: 'اعلان فوری اپلیکیشن', enabled: true },
    { key: 'email', label: 'گزارش هفتگی ایمیلی', enabled: false },
  ],
};

export const accountService = {
  profile() {
    return profile;
  },
  profileDetails(): AccountProfileDetails {
    return profileDetails;
  },
  updateProfileDetails(input: Partial<Pick<AccountProfileDetails, 'agencyName' | 'supportPhone' | 'supportHours' | 'whatsapp'>>) {
    if (typeof input.agencyName === 'string' && input.agencyName.trim()) {
      profileDetails.agencyName = input.agencyName.trim();
    }
    if (typeof input.supportPhone === 'string' && input.supportPhone.trim()) {
      profileDetails.supportPhone = input.supportPhone.trim();
    }
    if (typeof input.supportHours === 'string' && input.supportHours.trim()) {
      profileDetails.supportHours = input.supportHours.trim();
    }
    if (typeof input.whatsapp === 'string' && input.whatsapp.trim()) {
      profileDetails.whatsapp = input.whatsapp.trim();
    }
    return profileDetails;
  },
  setPreference(key: string, enabled: boolean): ProfilePreference | null {
    const pref = profileDetails.preferences.find((item) => item.key === key);
    if (!pref) return null;
    pref.enabled = enabled;
    return pref;
  },
  listings(): AccountCollectionItem[] {
    return listings;
  },
  needs(): AccountCollectionItem[] {
    return needs;
  },
  bookmarks(): AccountCollectionItem[] {
    return bookmarks;
  },
  requests(): AccountCollectionItem[] {
    return requests;
  },
};
