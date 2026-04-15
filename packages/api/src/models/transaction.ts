export interface Transaction {
  id: string;
  propertyId: string;
  amount: number;
  gateway: string;
  status: 'pending' | 'paid' | 'failed';
}
