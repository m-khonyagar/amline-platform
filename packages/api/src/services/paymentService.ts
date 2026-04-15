import type { Transaction } from '../models/transaction';
import { createId } from '../utils/helpers';

const transactions: Transaction[] = [
  {
    id: 'txn_1',
    propertyId: 'prop_1',
    amount: 425000000,
    gateway: 'sandbox',
    status: 'paid',
  },
  {
    id: 'txn_2',
    propertyId: 'prop_1',
    amount: 185000000,
    gateway: 'sandbox',
    status: 'pending',
  },
];

export const paymentService = {
  charge(propertyId: string, amount: number): Transaction {
    const transaction: Transaction = {
      id: createId('txn'),
      propertyId,
      amount,
      gateway: 'sandbox',
      status: 'pending',
    };
    transactions.push(transaction);
    return transaction;
  },
  history(): Transaction[] {
    return transactions;
  },
};
