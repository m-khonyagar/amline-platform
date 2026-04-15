import { propertyService } from '../src/services/propertyService';

describe('propertyService', () => {
  it('returns seeded properties', () => {
    expect(propertyService.list().length).toBeGreaterThan(0);
  });
});
