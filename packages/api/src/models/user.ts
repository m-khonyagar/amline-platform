export interface User {
  id: string;
  fullName: string;
  role: 'buyer' | 'seller' | 'agent' | 'admin';
  mobile: string;
}
