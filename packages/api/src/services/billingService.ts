import { createId, nowIso } from '../utils/helpers';

export const billingService = {
  issueInvoice(accountId: string, amount: number) {
    return {
      id: createId('inv'),
      accountId,
      amount,
      status: 'issued',
      issuedAt: nowIso(),
    };
  },
};
