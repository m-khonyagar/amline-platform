import { contractService, type ClientContext } from './contractService';
import { paymentService } from './paymentService';
import { propertyService } from './propertyService';

export type ReviewQueueItem = {
  id: string;
  contractId: string;
  priority: 'high' | 'normal' | 'low';
  state: 'unassigned' | 'assigned_to_me' | 'escalated' | 'sla_breached';
  assignee: string;
  slaHoursLeft: number;
};

export type FraudCaseItem = {
  id: string;
  entityType: 'contract' | 'payment' | 'user';
  entityId: string;
  riskScore: number;
  reason: string;
  status: 'open' | 'monitor' | 'blocked' | 'resolved';
};

export type AuditLogItem = {
  id: string;
  entityType: 'contract' | 'review_case' | 'fraud_case' | 'commission';
  entityId: string;
  action: string;
  actor: string;
  channel: ClientContext | 'system';
  createdAt: string;
  note: string;
};

type FunnelScope = 'marketplace' | 'operations';

const reviewQueue: ReviewQueueItem[] = [
  { id: 'rv-101', contractId: 'ct-1005', priority: 'high', state: 'sla_breached', assignee: 'Legal Operator 12', slaHoursLeft: -2 },
  { id: 'rv-102', contractId: 'ct-1006', priority: 'normal', state: 'assigned_to_me', assignee: 'Legal Operator 8', slaHoursLeft: 6 },
  { id: 'rv-103', contractId: 'ct-1003', priority: 'high', state: 'escalated', assignee: 'Review Supervisor', slaHoursLeft: 1 },
  { id: 'rv-104', contractId: 'ct-1004', priority: 'low', state: 'unassigned', assignee: 'Unassigned', slaHoursLeft: 22 },
];

const fraudCases: FraudCaseItem[] = [
  { id: 'fr-1', entityType: 'payment', entityId: 'txn_1', riskScore: 92, reason: 'Payment fingerprint changed during checkout.', status: 'open' },
  { id: 'fr-2', entityType: 'contract', entityId: 'ct-1003', riskScore: 81, reason: 'Signature pattern mismatch detected.', status: 'monitor' },
  { id: 'fr-3', entityType: 'user', entityId: 'usr-221', riskScore: 97, reason: 'Identity mismatch between invite and profile.', status: 'blocked' },
];

const auditLog: AuditLogItem[] = [
  {
    id: 'audit-101',
    entityType: 'contract',
    entityId: 'ct-1005',
    action: 'entered_legal_review',
    actor: 'system',
    channel: 'system',
    createdAt: '1404/10/19 11:20',
    note: 'Contract entered the legal review queue after signatures were collected.',
  },
  {
    id: 'audit-102',
    entityType: 'review_case',
    entityId: 'rv-103',
    action: 'escalated_to_supervisor',
    actor: 'ops.supervisor',
    channel: 'ops',
    createdAt: '1404/10/19 13:05',
    note: 'Escalated because the review case was close to breaching SLA.',
  },
  {
    id: 'audit-103',
    entityType: 'fraud_case',
    entityId: 'fr-2',
    action: 'risk_monitoring_enabled',
    actor: 'ops.risk',
    channel: 'ops',
    createdAt: '1404/10/19 14:10',
    note: 'Risk monitoring stayed active after a signature anomaly was detected.',
  },
];

function timestamp(): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

export function recordAudit(
  entityType: AuditLogItem['entityType'],
  entityId: string,
  action: string,
  note: string,
  actor = 'ops.agent',
  channel: AuditLogItem['channel'] = 'ops',
): void {
  auditLog.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    entityType,
    entityId,
    action,
    actor,
    channel,
    createdAt: timestamp(),
    note,
  });
}

export const adminService = {
  reviewQueue(): ReviewQueueItem[] {
    return reviewQueue;
  },
  assignReviewCase(id: string): boolean {
    const item = reviewQueue.find((entry) => entry.id === id);
    if (!item) return false;
    item.state = 'assigned_to_me';
    item.assignee = 'Current operator';
    recordAudit('review_case', item.id, 'assigned_to_me', `Review case ${item.id} assigned to the active operator.`);
    return true;
  },
  escalateReviewCase(id: string): boolean {
    const item = reviewQueue.find((entry) => entry.id === id);
    if (!item) return false;
    item.state = 'escalated';
    item.assignee = 'Review Supervisor';
    recordAudit('review_case', item.id, 'escalated', `Review case ${item.id} escalated to supervisor.`);
    return true;
  },
  fraudCases(): FraudCaseItem[] {
    return fraudCases;
  },
  decideFraudCase(id: string, decision: 'allow' | 'monitor' | 'block'): boolean {
    const item = fraudCases.find((entry) => entry.id === id);
    if (!item) return false;
    item.status = decision === 'allow' ? 'resolved' : decision === 'block' ? 'blocked' : 'monitor';
    recordAudit('fraud_case', item.id, `decision_${decision}`, `Fraud case ${item.id} moved to ${item.status}.`, 'ops.risk', 'ops');
    return true;
  },
  auditLog(filters?: { entityId?: string; actor?: string; action?: string }): AuditLogItem[] {
    let rows = auditLog;
    if (filters?.entityId) {
      const id = filters.entityId.toLowerCase();
      rows = rows.filter((item) => item.entityId.toLowerCase() === id);
    }
    if (filters?.actor) {
      const a = filters.actor.toLowerCase();
      rows = rows.filter((item) => item.actor.toLowerCase().includes(a));
    }
    if (filters?.action) {
      const ac = filters.action.toLowerCase();
      rows = rows.filter((item) => item.action.toLowerCase().includes(ac));
    }
    return rows;
  },

  auditLogExportCsv(filters?: { entityId?: string }): string {
    const rows = this.auditLog(filters);
    const header = 'زمان,موجودیت,شناسه,عملیات,عامل,توضیح';
    const lines = rows.map((r) =>
      [r.createdAt, r.entityType, r.entityId, r.action, r.actor, `"${r.note.replace(/"/g, '""')}"`].join(','),
    );
    return [header, ...lines].join('\n');
  },
  funnel(scope: FunnelScope): Array<{ key: string; label: string; value: number }> {
    const properties = propertyService.list();
    const payments = paymentService.history();
    const contracts = contractService.list('ops');

    if (scope === 'operations') {
      const leads = Math.max(10, properties.length * 3);
      const openCases = contracts.filter((item) => item.tab === 'active').length;
      const paid = payments.filter((item) => item.status === 'paid').length;
      const retained = Math.max(1, Math.round(paid * 0.6));
      return [
        { key: 'lead', label: 'Active leads', value: leads },
        { key: 'contract', label: 'Operational contracts', value: openCases },
        { key: 'paid', label: 'Successful settlements', value: paid },
        { key: 'retention', label: 'Repeat customers', value: retained },
      ];
    }

    const visits = Math.max(120, properties.length * 20);
    const leads = Math.max(24, Math.round(visits * 0.32));
    const contractCount = Math.max(8, contracts.length);
    const successfulPayments = Math.max(4, payments.filter((item) => item.status === 'paid').length);
    const retained = Math.max(2, Math.round(successfulPayments * 0.65));
    return [
      { key: 'visit', label: 'Discovery visits', value: visits },
      { key: 'lead', label: 'Qualified leads', value: leads },
      { key: 'contract', label: 'Contracts started', value: contractCount },
      { key: 'payment', label: 'Successful payments', value: successfulPayments },
      { key: 'retain', label: 'Repeat rate', value: retained },
    ];
  },
};
