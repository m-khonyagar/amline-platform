export const api = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api',
};

export interface PropertySummary {
  id: string;
  title: string;
  city: string;
  price: number;
  status: string;
}

export interface AchievementSummary {
  userId: string;
  title: string;
  points: number;
}

export interface LicenseSummary {
  id: string;
  authority: string;
  status: string;
  expiresAt: string;
}

export interface JobOpening {
  id: string;
  title: string;
  location: string;
  type: string;
}

export interface PaymentSummary {
  id: string;
  propertyId: string;
  amount: number;
  gateway: string;
  status: string;
}

export interface InvoiceSummary {
  id: string;
  accountId: string;
  amount: number;
  status: string;
  issuedAt: string;
}

export interface AccountProfile {
  id: string;
  fullName: string;
  role: string;
  mobile: string;
  city: string;
  membership: string;
}

export interface AccountProfileDetails {
  completionPercent: number;
  identityStatus: 'verified' | 'pending';
  agencyName: string;
  supportPhone: string;
  supportHours: string;
  whatsapp: string;
  preferences: Array<{ key: string; label: string; enabled: boolean }>;
}

export interface ContractSummary {
  id: string;
  title: string;
  counterpartLabel?: string;
  date: string;
  tab: 'active' | 'completed' | 'cancelled';
  status:
    | 'awaiting_you'
    | 'awaiting_owner'
    | 'awaiting_tenant'
    | 'awaiting_legal'
    | 'awaiting_tracking'
    | 'finalized'
    | 'cancelled';
  message: string;
  draft?: boolean;
  visibilityScope?: 'people_only' | 'shared' | 'advisor_managed' | 'team';
  createdByClient?: 'people' | 'advisor';
  advisorId?: string;
  teamId?: string;
  propertyLabel?: string;
  peopleNextStep?: string;
  advisorNextStep?: string;
  opsNextStep?: string;
}

export type ContractClientContext = 'people' | 'advisor' | 'ops';

export interface ContractDetailSummary {
  contract: ContractSummary;
  client: ContractClientContext;
  viewKind: 'people_view' | 'advisor_view' | 'ops_view';
  timeline: Array<{ label: string; status: 'done' | 'current' | 'next' }>;
  actions: string[];
  visibilityReason: string;
}

export interface AccountCollectionItem {
  id: string;
  title: string;
  city?: string;
  budget?: string;
  status?: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  subtitle: string;
  preview: string;
  timeLabel: string;
  unread?: number;
  pinned?: boolean;
  kind: 'listing' | 'need' | 'support';
}

export interface ChatMessageSummary {
  id: string;
  sender: 'user' | 'support';
  text: string;
  time: string;
  state?: 'sent' | 'read' | 'failed';
  quoted?: { author: string; text: string };
}

export interface SessionUser {
  id: string;
  fullName: string;
  mobile: string;
  city: string;
  role: string;
  membership: string;
  /** ذخیره‌شده برای درخواست‌های بعدی به API (در صورت نیاز به هدر Authorization) */
  accessToken?: string;
  refreshToken?: string;
}

export interface SupportComplaintPayload {
  subject: string;
  description: string;
  category?: string;
}

export interface SupportComplaintResult {
  id: string;
  status: string;
  trackingCode: string;
  message: string;
}

export interface FunnelMetricSummary {
  key: string;
  label: string;
  value: number;
}

async function fetchCollection<T>(path: string): Promise<T[]> {
  const response = await fetch(`${api.baseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  const payload = (await response.json()) as { items?: T[] };
  return payload.items ?? [];
}

export async function fetchProperties(): Promise<PropertySummary[]> {
  return fetchCollection<PropertySummary>('/properties');
}

export async function fetchAchievements(): Promise<AchievementSummary[]> {
  return fetchCollection<AchievementSummary>('/achievements');
}

export async function fetchLicenses(): Promise<LicenseSummary[]> {
  return fetchCollection<LicenseSummary>('/licenses');
}

export async function fetchJobs(): Promise<JobOpening[]> {
  return fetchCollection<JobOpening>('/hr/openings');
}

export async function fetchPayments(): Promise<PaymentSummary[]> {
  return fetchCollection<PaymentSummary>('/payments');
}

export async function fetchInvoices(): Promise<InvoiceSummary[]> {
  return fetchCollection<InvoiceSummary>('/billing/invoices');
}

export async function fetchProfile(): Promise<AccountProfile> {
  const response = await fetch(`${api.baseUrl}/account/profile`);

  if (!response.ok) {
    throw new Error('Failed to load account profile.');
  }

  return (await response.json()) as AccountProfile;
}

export async function fetchProfileDetails(): Promise<AccountProfileDetails> {
  const response = await fetch(`${api.baseUrl}/account/details`);

  if (!response.ok) {
    throw new Error('Failed to load account details.');
  }

  return (await response.json()) as AccountProfileDetails;
}

export async function updateProfileDetails(
  payload: Partial<Pick<AccountProfileDetails, 'agencyName' | 'supportPhone' | 'supportHours' | 'whatsapp'>>,
): Promise<AccountProfileDetails> {
  const response = await fetch(`${api.baseUrl}/account/details`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update account details.');
  }

  return (await response.json()) as AccountProfileDetails;
}

export async function updateProfilePreference(
  key: string,
  enabled: boolean,
): Promise<{ key: string; label: string; enabled: boolean }> {
  const response = await fetch(`${api.baseUrl}/account/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, enabled }),
  });

  if (!response.ok) {
    throw new Error('Failed to update preference.');
  }

  return (await response.json()) as { key: string; label: string; enabled: boolean };
}

type ContractFetchOptions = {
  client?: ContractClientContext;
  actorId?: string;
  teamId?: string;
};

function buildContractQuery(options?: ContractFetchOptions): string {
  const searchParams = new URLSearchParams();

  if (options?.client) {
    searchParams.set('client', options.client);
  }

  if (options?.actorId) {
    searchParams.set('actorId', options.actorId);
  }

  if (options?.teamId) {
    searchParams.set('teamId', options.teamId);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function fetchContracts(options?: ContractFetchOptions): Promise<ContractSummary[]> {
  return fetchCollection<ContractSummary>(`/contracts${buildContractQuery(options)}`);
}

export async function fetchContractDetail(id: string, options?: ContractFetchOptions): Promise<ContractDetailSummary> {
  const response = await fetch(`${api.baseUrl}/contracts/${id}${buildContractQuery(options)}`);

  if (!response.ok) {
    throw new Error('Failed to load contract detail.');
  }

  return (await response.json()) as ContractDetailSummary;
}

export async function deleteDraftContract(id: string): Promise<void> {
  const response = await fetch(`${api.baseUrl}/contracts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete draft contract.');
  }
}

export async function fetchAccountListings(): Promise<AccountCollectionItem[]> {
  return fetchCollection<AccountCollectionItem>('/account/listings');
}

export async function fetchAccountNeeds(): Promise<AccountCollectionItem[]> {
  return fetchCollection<AccountCollectionItem>('/account/needs');
}

export async function fetchAccountBookmarks(): Promise<AccountCollectionItem[]> {
  return fetchCollection<AccountCollectionItem>('/account/bookmarks');
}

export async function fetchAccountRequests(): Promise<AccountCollectionItem[]> {
  return fetchCollection<AccountCollectionItem>('/account/requests');
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  return fetchCollection<ConversationSummary>('/chat/conversations');
}

export async function fetchConversationMessages(id: string): Promise<ChatMessageSummary[]> {
  return fetchCollection<ChatMessageSummary>(`/chat/conversations/${id}`);
}

export async function sendConversationMessage(
  id: string,
  text: string,
): Promise<ChatMessageSummary> {
  const response = await fetch(`${api.baseUrl}/chat/conversations/${id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message.');
  }

  return (await response.json()) as ChatMessageSummary;
}

export async function submitComplaint(
  payload: SupportComplaintPayload,
): Promise<SupportComplaintResult> {
  const response = await fetch(`${api.baseUrl}/support/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to submit complaint.');
  }

  return (await response.json()) as SupportComplaintResult;
}

export async function requestAuthOtp(mobile: string): Promise<{ expiresInSeconds: number; devHint?: string }> {
  const response = await fetch(`${api.baseUrl}/auth/request-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile }),
  });

  const data = (await response.json()) as {
    error?: string;
    expiresInSeconds?: number;
    devHint?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? 'ارسال کد ناموفق بود.');
  }

  return {
    expiresInSeconds: data.expiresInSeconds ?? 120,
    devHint: data.devHint,
  };
}

export async function verifyAuthOtp(
  mobile: string,
  code: string,
): Promise<{ token: string; refreshToken: string; expiresIn: number; user: { id: string; mobile: string } }> {
  const response = await fetch(`${api.baseUrl}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile, code }),
  });

  const data = (await response.json()) as {
    error?: string;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
    user?: { id: string; mobile: string };
  };

  if (!response.ok) {
    throw new Error(data.error ?? 'ورود ناموفق بود.');
  }

  if (!data.token || !data.user) {
    throw new Error('پاسخ نامعتبر از سرور.');
  }

  return {
    token: data.token,
    refreshToken: data.refreshToken ?? '',
    expiresIn: data.expiresIn ?? 3600,
    user: data.user,
  };
}

/** سازگاری با کلاینت‌های قدیمی؛ اعتبارسنجی شماره در سرور انجام می‌شود. */
export async function loginWithMobile(mobile: string): Promise<{ token: string; expiresIn: number }> {
  const response = await fetch(`${api.baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile }),
  });

  const data = (await response.json()) as { error?: string; token?: string; expiresIn?: number };

  if (!response.ok) {
    throw new Error(data.error ?? 'Login failed.');
  }

  return { token: data.token ?? '', expiresIn: data.expiresIn ?? 3600 };
}

export async function requestPasswordReset(
  identity: string,
): Promise<{ message: string }> {
  return {
    message: `لینک بازیابی برای ${identity} ارسال شد.`,
  };
}

export async function fetchFunnelMetrics(scope: 'marketplace' | 'operations'): Promise<FunnelMetricSummary[]> {
  const response = await fetch(`${api.baseUrl}/analytics/funnel?scope=${scope}`);

  if (!response.ok) {
    throw new Error('Failed to load funnel metrics.');
  }

  const payload = (await response.json()) as { items?: FunnelMetricSummary[] };
  return payload.items ?? [];
}
