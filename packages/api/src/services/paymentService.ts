import type { Transaction } from '../models/transaction';
import { createId } from '../utils/helpers';

const transactions: Transaction[] = [];

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
