import { billingService } from '../services/billingService';

export const billingRoutes = {
  issue: (accountId: string, amount: number) => billingService.issueInvoice(accountId, amount),
  list: () => billingService.listInvoices(),
};
