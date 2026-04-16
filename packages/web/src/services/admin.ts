import {
  api,
  type ContractDetailSummary,
  type PaymentSummary,
  fetchContractDetail,
  fetchPayments,
} from './api';

export type ReviewQueueItem = {
  id: string;
  contractId: string;
  priority: 'high' | 'normal' | 'low';
  state: 'unassigned' | 'assigned_to_me' | 'escalated' | 'sla_breached';
  assignee: string;
  slaHoursLeft: number;
};

export type FraudCaseSummary = {
  id: string;
  entityType: 'contract' | 'payment' | 'user';
  entityId: string;
  riskScore: number;
  reason: string;
  status: 'open' | 'monitor' | 'blocked' | 'resolved';
};

export type ContractAdminDetails = {
  detail: ContractDetailSummary | null;
  payments: PaymentSummary[];
  auditLog: AuditLogEntry[];
};

export type AuditLogEntry = {
  id: string;
  entityType: 'contract' | 'review_case' | 'fraud_case';
  entityId: string;
  action: string;
  actor: string;
  channel: 'people' | 'advisor' | 'ops' | 'system';
  createdAt: string;
  note: string;
};

const fallbackReviewQueue: ReviewQueueItem[] = [
  { id: 'rv-101', contractId: 'ct-1001', priority: 'high', state: 'sla_breached', assignee: 'کارشناس ۱۲', slaHoursLeft: -2 },
  { id: 'rv-102', contractId: 'ct-1002', priority: 'normal', state: 'assigned_to_me', assignee: 'کارشناس ۸', slaHoursLeft: 6 },
  { id: 'rv-103', contractId: 'ct-1003', priority: 'high', state: 'escalated', assignee: 'سرپرست بررسی', slaHoursLeft: 1 },
  { id: 'rv-104', contractId: 'ct-1004', priority: 'low', state: 'unassigned', assignee: '—', slaHoursLeft: 22 },
];

const fallbackFraudCases: FraudCaseSummary[] = [
  { id: 'fr-1', entityType: 'payment', entityId: 'pay-991', riskScore: 92, reason: 'تغییر ناگهانی IP هنگام پرداخت', status: 'open' },
  { id: 'fr-2', entityType: 'contract', entityId: 'ct-1003', riskScore: 81, reason: 'الگوی امضای مشکوک', status: 'monitor' },
  { id: 'fr-3', entityType: 'user', entityId: 'usr-221', riskScore: 97, reason: 'Mismatch هویتی با دعوت', status: 'blocked' },
];

export async function fetchReviewQueue(): Promise<ReviewQueueItem[]> {
  const response = await fetch(`${api.baseUrl}/admin/review-queue`);
  if (!response.ok) {
    return fallbackReviewQueue;
  }
  const payload = (await response.json()) as { items?: ReviewQueueItem[] };
  return payload.items ?? fallbackReviewQueue;
}

export async function assignReviewCase(id: string): Promise<{ ok: boolean }> {
  const response = await fetch(`${api.baseUrl}/admin/review-queue/${id}/assign`, {
    method: 'POST',
  });
  return { ok: response.ok };
}

export async function escalateReviewCase(id: string): Promise<{ ok: boolean }> {
  const response = await fetch(`${api.baseUrl}/admin/review-queue/${id}/escalate`, {
    method: 'POST',
  });
  return { ok: response.ok };
}

export async function fetchFraudCases(): Promise<FraudCaseSummary[]> {
  const response = await fetch(`${api.baseUrl}/admin/fraud-cases`);
  if (!response.ok) {
    return fallbackFraudCases;
  }
  const payload = (await response.json()) as { items?: FraudCaseSummary[] };
  return payload.items ?? fallbackFraudCases;
}

export async function decideFraudCase(id: string, decision: 'allow' | 'monitor' | 'block'): Promise<{ ok: boolean }> {
  const response = await fetch(`${api.baseUrl}/admin/fraud-cases/${id}/decision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ decision }),
  });
  return { ok: response.ok };
}

export async function fetchAuditLog(entityId?: string): Promise<AuditLogEntry[]> {
  const searchParams = new URLSearchParams();
  if (entityId) {
    searchParams.set('entityId', entityId);
  }

  const query = searchParams.toString();
  const response = await fetch(`${api.baseUrl}/admin/audit-log${query ? `?${query}` : ''}`);
  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { items?: AuditLogEntry[] };
  return payload.items ?? [];
}

export async function fetchContractAdminDetails(contractId: string): Promise<ContractAdminDetails> {
  const [detail, payments, auditLog] = await Promise.all([
    fetchContractDetail(contractId, { client: 'ops', actorId: 'ops_1', teamId: 'ops_central' }).catch(() => null),
    fetchPayments(),
    fetchAuditLog(contractId),
  ]);

  return {
    detail,
    payments,
    auditLog,
  };
}
