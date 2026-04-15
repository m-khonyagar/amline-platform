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

export async function fetchProperties(): Promise<PropertySummary[]> {
  const response = await fetch(`${api.baseUrl}/properties`);

  if (!response.ok) {
    throw new Error('Failed to load properties from API.');
  }

  const payload = (await response.json()) as { items?: PropertySummary[] };
  return payload.items ?? [];
}
