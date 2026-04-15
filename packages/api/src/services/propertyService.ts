import type { Property } from '../models/property';
import { createId } from '../utils/helpers';

const properties: Property[] = [
  { id: 'prop_1', title: 'آپارتمان نوساز سعادت‌آباد', city: 'تهران', price: 18500000000, status: 'published' },
];

export const propertyService = {
  list(): Property[] {
    return properties;
  },
  create(input: Omit<Property, 'id'>): Property {
    const property = { ...input, id: createId('prop') };
    properties.push(property);
    return property;
  },
};
