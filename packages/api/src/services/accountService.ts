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
    fullName: 'Ø¢Ø±Ø§Ø¯ ØµØ§Ù„Ø­ÛŒ',
    role: 'seller',
    mobile: '09121234567',
    city: 'ØªÙ‡Ø±Ø§Ù†',
    membership: 'Amline Plus',
  },
  profileDetails: {
    completionPercent: 86,
    identityStatus: 'verified',
    agencyName: 'Ø§Ù…Ù„Ø§Ú© Ø§Ù…Ù† ØªÙ‡Ø±Ø§Ù†',
    supportPhone: '+982532048000',
    supportHours: 'Ù‡Ø± Ø±ÙˆØ² Ø§Ø² Ø³Ø§Ø¹Øª Û¹ ØªØ§ Û²Û±',
    whatsapp: 'https://wa.me/989127463726',
    preferences: [
      { key: 'sms', label: 'Ø§Ø¹Ù„Ø§Ù† Ù¾ÛŒØ§Ù…Ú©ÛŒ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯', enabled: true },
      { key: 'push', label: 'Ø§Ø¹Ù„Ø§Ù† ÙÙˆØ±ÛŒ Ø§Ù¾Ù„ÛŒÚ©ÛŒØ´Ù†', enabled: true },
      { key: 'email', label: 'Ú¯Ø²Ø§Ø±Ø´ Ù‡ÙØªÚ¯ÛŒ Ø§ÛŒÙ…ÛŒÙ„ÛŒ', enabled: false },
    ],
  },
  listings: [
    { id: 'listing-1', title: 'Ø¢Ù¾Ø§Ø±ØªÙ…Ø§Ù† Ø®ÙˆØ´â€ŒÙ†Ù‚Ø´Ù‡ Û±Û¸Û° Ù…ØªØ±ÛŒ', city: 'Ù‚Ù…ØŒ Ù¾Ø±Ø¯ÛŒØ³Ø§Ù†', status: 'Ù…Ù†ØªØ´Ø± Ø´Ø¯Ù‡' },
    { id: 'listing-2', title: 'ÙˆÛŒÙ„Ø§ Ø¨Ø§Øº Û´ÛµÛ° Ù…ØªØ±ÛŒ', city: 'Ø¯Ù…Ø§ÙˆÙ†Ø¯', status: 'Ø¯Ø± Ø§Ù†ØªØ¸Ø§Ø± ØªØ§ÛŒÛŒØ¯' },
  ],
  bookmarks: [
    { id: 'bookmark-1', title: 'Ø¢Ù¾Ø§Ø±ØªÙ…Ø§Ù† Ø®ÙˆØ´â€ŒÙ†Ù‚Ø´Ù‡ Û±Û¸Û° Ù…ØªØ±ÛŒ', city: 'Ù‚Ù…ØŒ Ù¾Ø±Ø¯ÛŒØ³Ø§Ù†' },
    { id: 'bookmark-2', title: 'ÙˆÛŒÙ„Ø§ Ø¨Ø§Øº Û´ÛµÛ° Ù…ØªØ±ÛŒ', city: 'Ø¯Ù…Ø§ÙˆÙ†Ø¯' },
  ],
  requests: [
    { id: 'req-1', title: 'Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø¨Ø§Ø²Ø¯ÛŒØ¯ Ø¢Ù¾Ø§Ø±ØªÙ…Ø§Ù† Ø®ÙˆØ´â€ŒÙ†Ù‚Ø´Ù‡', status: 'Ø¯Ø± Ø§Ù†ØªØ¸Ø§Ø± Ù¾Ø§Ø³Ø® Ú©Ø§Ø±Ø´Ù†Ø§Ø³' },
    { id: 'req-2', title: 'Ø¯Ø±Ø®ÙˆØ§Ø³Øª Ø§Ø³ØªØ¹Ù„Ø§Ù… Ù…Ø§Ù„Ú©ÛŒØª', status: 'Ø«Ø¨Øª Ø´Ø¯Ù‡ Ùˆ Ø¯Ø± ØµÙ Ø¨Ø±Ø±Ø³ÛŒ' },
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
