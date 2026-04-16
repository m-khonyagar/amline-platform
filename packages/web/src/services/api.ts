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

export async function fetchContracts(): Promise<ContractSummary[]> {
  return fetchCollection<ContractSummary>('/contracts');
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

export async function loginWithMobile(mobile: string): Promise<{ token: string; expiresIn: number }> {
  const response = await fetch(`${api.baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobile }),
  });

  if (!response.ok) {
    throw new Error('Login failed.');
  }

  return (await response.json()) as { token: string; expiresIn: number };
}

export async function requestPasswordReset(
  identity: string,
): Promise<{ message: string }> {
  return {
    message: `لینک بازیابی برای ${identity} ارسال شد.`,
  };
}
