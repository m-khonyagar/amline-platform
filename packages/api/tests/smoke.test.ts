import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp, startServer } from '../src/server';
import { propertyService } from '../src/services/propertyService';

test('propertyService returns seeded properties', () => {
  assert.ok(propertyService.list().length > 0);
});

test('app exposes property and admin routes', () => {
  const app = createApp();
  assert.equal(typeof app.propertyRoutes.list, 'function');
  assert.equal(app.adminRoutes.health().status, 'ok');
});

test('support complaints endpoint accepts submissions', async () => {
  const server = startServer(0);
  const address = server.address();

  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Failed to resolve test server address.');
  }

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/support/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: 'Smoke complaint',
        description: 'Checking complaint endpoint.',
        category: 'support',
      }),
    });

    assert.equal(response.status, 201);
    const payload = (await response.json()) as { trackingCode: string; status: string };
    assert.match(payload.trackingCode, /^AML-/);
    assert.equal(payload.status, 'submitted');
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test('chat messages endpoint persists new messages', async () => {
  const server = startServer(0);
  const address = server.address();

  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Failed to resolve test server address.');
  }

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/chat/conversations/support/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Regression-safe test message',
      }),
    });

    assert.equal(response.status, 201);
    const payload = (await response.json()) as { text: string; sender: string };
    assert.equal(payload.text, 'Regression-safe test message');
    assert.equal(payload.sender, 'user');
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});
