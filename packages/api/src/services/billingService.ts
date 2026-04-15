import { createId, nowIso } from '../utils/helpers';

const invoices = [
  {
    id: 'inv_1',
    accountId: 'acct_1',
    amount: 425000000,
    status: 'paid',
    issuedAt: '2026-04-10T09:00:00.000Z',
  },
  {
    id: 'inv_2',
    accountId: 'acct_1',
    amount: 185000000,
    status: 'issued',
    issuedAt: '2026-04-13T11:30:00.000Z',
  },
];

export const billingService = {
  issueInvoice(accountId: string, amount: number) {
    const invoice = {
      id: createId('inv'),
      accountId,
      amount,
      status: 'issued',
      issuedAt: nowIso(),
    };
    invoices.push(invoice);
    return invoice;
  },
  listInvoices() {
    return invoices;
  },
};
