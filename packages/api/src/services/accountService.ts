import { readJsonState, writeJsonState } from '../utils/stateStore';
import { needsService } from './needsService';

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
type AccountState = {
  version: 1;
  profile: {
    id: string;
    fullName: string;
    role: string;
    mobile: string;
    city: string;
    membership: string;
  };
  profileDetails: AccountProfileDetails;
  listings: AccountCollectionItem[];
  bookmarks: AccountCollectionItem[];
  requests: AccountCollectionItem[];
};

const stateFile = 'amline-account-store.json';
const state = readJsonState<AccountState>(stateFile, {
  version: 1,
  profile: {
    id: 'acct_1',
    fullName: 'آراد صالحی',
    role: 'seller',
    mobile: '09121234567',
    city: 'تهران',
    membership: 'Amline Plus',
  },
  profileDetails: {
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
  },
  listings: [
    { id: 'listing-1', title: 'آپارتمان خوش‌نقشه ۱۸۰ متری', city: 'قم، پردیسان', status: 'منتشر شده' },
    { id: 'listing-2', title: 'ویلا باغ ۴۵۰ متری', city: 'دماوند', status: 'در انتظار تایید' },
  ],
  bookmarks: [
    { id: 'bookmark-1', title: 'آپارتمان خوش‌نقشه ۱۸۰ متری', city: 'قم، پردیسان' },
    { id: 'bookmark-2', title: 'ویلا باغ ۴۵۰ متری', city: 'دماوند' },
  ],
  requests: [
    { id: 'req-1', title: 'درخواست بازدید آپارتمان خوش‌نقشه', status: 'در انتظار پاسخ کارشناس' },
    { id: 'req-2', title: 'درخواست استعلام مالکیت', status: 'ثبت شده و در صف بررسی' },
  ],
});

function persist(): void {
  writeJsonState(stateFile, state);
}

export const accountService = {
  profile() {
    return state.profile;
  },
  profileDetails(): AccountProfileDetails {
    return state.profileDetails;
  },
  updateProfileDetails(input: Partial<Pick<AccountProfileDetails, 'agencyName' | 'supportPhone' | 'supportHours' | 'whatsapp'>>) {
    if (typeof input.agencyName === 'string' && input.agencyName.trim()) {
      state.profileDetails.agencyName = input.agencyName.trim();
    }
    if (typeof input.supportPhone === 'string' && input.supportPhone.trim()) {
      state.profileDetails.supportPhone = input.supportPhone.trim();
    }
    if (typeof input.supportHours === 'string' && input.supportHours.trim()) {
      state.profileDetails.supportHours = input.supportHours.trim();
    }
    if (typeof input.whatsapp === 'string' && input.whatsapp.trim()) {
      state.profileDetails.whatsapp = input.whatsapp.trim();
    }
    persist();
    return state.profileDetails;
  },
  setPreference(key: string, enabled: boolean): ProfilePreference | null {
    const pref = state.profileDetails.preferences.find((item) => item.key === key);
    if (!pref) return null;
    pref.enabled = enabled;
    persist();
    return pref;
  },
  listings(): AccountCollectionItem[] {
    return state.listings;
  },
  removeListing(id: string): { ok: true } | { ok: false; error: string } {
    const index = state.listings.findIndex((item) => item.id === id);
    if (index === -1) {
      return { ok: false, error: 'آگهی یافت نشد' };
    }

    state.listings.splice(index, 1);
    persist();
    return { ok: true };
  },
  needs(): AccountCollectionItem[] {
    return needsService.list();
  },
  bookmarks(): AccountCollectionItem[] {
    return state.bookmarks;
  },
  requests(): AccountCollectionItem[] {
    return state.requests;
  },
};
