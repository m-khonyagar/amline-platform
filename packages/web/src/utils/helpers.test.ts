import assert from 'node:assert/strict';
import test from 'node:test';

import { formatPrice } from './helpers';

test('formatPrice returns a localized string', () => {
  assert.equal(typeof formatPrice(1250000), 'string');
  assert.ok(formatPrice(1250000).length > 0);
});
