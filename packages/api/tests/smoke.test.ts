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

test('ready endpoint returns success under nominal load', async () => {
  const server = startServer(0);
  const address = server.address();

  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Failed to resolve test server address.');
  }

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/ready`);
    assert.equal(response.status, 200);
    const payload = (await response.json()) as { status: string };
    assert.equal(payload.status, 'ready');
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

test('metrics endpoint exposes counters', async () => {
  const server = startServer(0);
  const address = server.address();

  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Failed to resolve test server address.');
  }

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/metrics`);
    assert.equal(response.status, 200);
    const body = await response.text();
    assert.match(body, /amline_api_total_requests/);
    assert.match(body, /amline_api_ready/);
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

test('advisor contract list hides people-only contracts', async () => {
  const server = startServer(0);
  const address = server.address();

  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Failed to resolve test server address.');
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/contracts?client=advisor&actorId=adv_21&teamId=team_north`,
    );

    assert.equal(response.status, 200);
    const payload = (await response.json()) as { items: Array<{ id: string }> };
    assert.equal(payload.items.some((item) => item.id === 'ct-1001'), false);
    assert.equal(payload.items.some((item) => item.id === 'ct-1002'), true);
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

test('advisor cannot access people-only contract detail', async () => {
  const server = startServer(0);
  const address = server.address();

  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Failed to resolve test server address.');
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:${address.port}/api/contracts/ct-1001?client=advisor&actorId=adv_21&teamId=team_north`,
    );

    assert.equal(response.status, 404);
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

test('ops audit log endpoint returns operational records', async () => {
  const server = startServer(0);
  const address = server.address();

  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Failed to resolve test server address.');
  }

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/admin/audit-log?entityId=ct-1005`);

    assert.equal(response.status, 200);
    const payload = (await response.json()) as { items: Array<{ entityId: string }> };
    assert.equal(payload.items.some((item) => item.entityId === 'ct-1005'), true);
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
