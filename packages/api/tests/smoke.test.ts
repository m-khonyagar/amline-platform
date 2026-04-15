import assert from 'node:assert/strict';
import test from 'node:test';

import { propertyService } from '../src/services/propertyService';

test('propertyService returns seeded properties', () => {
  assert.ok(propertyService.list().length > 0);
});
