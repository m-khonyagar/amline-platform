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
