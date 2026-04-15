export interface Property {
  id: string;
  title: string;
  city: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
}
