import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from '../src/server';
import { propertyService } from '../src/services/propertyService';

test('propertyService returns seeded properties', () => {
  assert.ok(propertyService.list().length > 0);
});

test('app exposes property and admin routes', () => {
  const app = createApp();
  assert.equal(typeof app.propertyRoutes.list, 'function');
  assert.equal(app.adminRoutes.health().status, 'ok');
});
