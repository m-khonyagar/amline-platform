import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { achievementRoutes } from './routes/achievements';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';
import { billingRoutes } from './routes/billing';
import { hrRoutes } from './routes/hr';
import { licenseRoutes } from './routes/licenses';
import { paymentRoutes } from './routes/payments';
import { propertyRoutes } from './routes/properties';
import { accountService } from './services/accountService';
import { aiService } from './services/aiService';
import { chatService } from './services/chatService';
import { contractService } from './services/contractService';
import { supportService } from './services/supportService';
import { logger } from './utils/logger';

type AppRouteMap = ReturnType<typeof createApp>;

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody<T>(request: IncomingMessage): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    request.on('end', () => {
      if (chunks.length === 0) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as T);
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

export function createApp() {
  return {
    authRoutes,
    propertyRoutes,
    paymentRoutes,
    billingRoutes,
    licenseRoutes,
    achievementRoutes,
    hrRoutes,
    adminRoutes,
    accountService,
    aiService,
    chatService,
    contractService,
    supportService,
  };
}

export async function requestListener(
  request: IncomingMessage,
  response: ServerResponse,
  app: AppRouteMap = createApp(),
): Promise<void> {
  const method = request.method ?? 'GET';
  const url = new URL(request.url ?? '/', 'http://localhost');

  if (method === 'OPTIONS') {
    sendJson(response, 200, { ok: true });
    return;
  }

  try {
    if (method === 'GET' && (url.pathname === '/health' || url.pathname === '/api/health')) {
      sendJson(response, 200, app.adminRoutes.health());
      return;
    }

    if (method === 'GET' && url.pathname === '/api/properties') {
      sendJson(response, 200, { items: app.propertyRoutes.list() });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/properties') {
      const body = await readJsonBody<{ title: string; city: string; price: number }>(request);
      if (!body?.title || !body.city || typeof body.price !== 'number') {
        sendJson(response, 400, { error: 'title, city, and price are required.' });
        return;
      }

      const property = app.propertyRoutes.create({
        title: body.title,
        city: body.city,
        price: body.price,
        status: 'published',
      });
      sendJson(response, 201, property);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/payments') {
      sendJson(response, 200, { items: app.paymentRoutes.history() });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/contracts') {
      sendJson(response, 200, { items: app.contractService.list() });
      return;
    }

    if (method === 'DELETE' && url.pathname.startsWith('/api/contracts/')) {
      const id = url.pathname.replace('/api/contracts/', '');
      const removed = app.contractService.removeDraft(id);
      sendJson(response, removed ? 200 : 404, removed ? { ok: true } : { error: 'Draft not found.' });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readJsonBody<{ mobile: string }>(request);
      if (!body?.mobile) {
        sendJson(response, 400, { error: 'mobile is required.' });
        return;
      }

      sendJson(response, 200, app.authRoutes.login(body.mobile));
      return;
    }

    if (method === 'GET' && url.pathname === '/api/licenses') {
      sendJson(response, 200, { items: app.licenseRoutes.list() });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/achievements') {
      sendJson(response, 200, { items: app.achievementRoutes.leaderboard() });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/hr/openings') {
      sendJson(response, 200, { items: app.hrRoutes.openings() });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/billing/invoices') {
      const body = await readJsonBody<{ accountId: string; amount: number }>(request);
      if (!body?.accountId || typeof body.amount !== 'number') {
        sendJson(response, 400, { error: 'accountId and amount are required.' });
        return;
      }

      sendJson(response, 201, app.billingRoutes.issue(body.accountId, body.amount));
      return;
    }

    if (method === 'GET' && url.pathname === '/api/billing/invoices') {
      sendJson(response, 200, { items: app.billingRoutes.list() });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/profile') {
      sendJson(response, 200, {
        id: 'acct_1',
        fullName: 'آراد صالحی',
        role: 'seller',
        mobile: '09121234567',
        city: 'تهران',
        membership: 'Amline Plus',
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/listings') {
      sendJson(response, 200, { items: app.accountService.listings() });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/needs') {
      sendJson(response, 200, { items: app.accountService.needs() });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/bookmarks') {
      sendJson(response, 200, { items: app.accountService.bookmarks() });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/requests') {
      sendJson(response, 200, { items: app.accountService.requests() });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/chat/conversations') {
      sendJson(response, 200, { items: app.chatService.list() });
      return;
    }

    if (method === 'GET' && url.pathname.startsWith('/api/chat/conversations/')) {
      const id = url.pathname.replace('/api/chat/conversations/', '');
      sendJson(response, 200, { items: app.chatService.messages(id) });
      return;
    }

    if (method === 'POST' && url.pathname.startsWith('/api/chat/conversations/') && url.pathname.endsWith('/messages')) {
      const id = url.pathname.replace('/api/chat/conversations/', '').replace('/messages', '');
      const body = await readJsonBody<{ text: string }>(request);
      if (!body?.text?.trim()) {
        sendJson(response, 400, { error: 'text is required.' });
        return;
      }

      sendJson(response, 201, app.chatService.appendMessage(id, body.text.trim()));
      return;
    }

    if (method === 'POST' && url.pathname === '/api/support/complaints') {
      const body = await readJsonBody<{ subject: string; description: string; category?: string }>(request);
      if (!body?.subject?.trim() || !body.description?.trim()) {
        sendJson(response, 400, { error: 'subject and description are required.' });
        return;
      }

      const complaint = app.supportService.submit(body.subject.trim(), body.description.trim(), body.category?.trim() || 'general');
      sendJson(response, 201, {
        id: complaint.id,
        status: complaint.status,
        trackingCode: complaint.trackingCode,
        message: `Complaint ${complaint.trackingCode} submitted successfully.`,
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/ai/estimate') {
      const city = url.searchParams.get('city') ?? 'تهران';
      const area = Number(url.searchParams.get('area') ?? '100');
      sendJson(response, 200, app.aiService.estimatePropertyPrice(city, area));
      return;
    }

    sendJson(response, 404, { error: 'Route not found.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unhandled server error';
    logger.error('Request handling failed', { method, path: url.pathname, message });
    sendJson(response, 500, { error: message });
  }
}

export function startServer(port = Number(process.env.PORT ?? 8080)) {
  const server = createServer((request, response) => {
    void requestListener(request, response);
  });

  server.listen(port, () => {
    logger.info('Amline API server started', { port });
  });

  return server;
}

if (require.main === module) {
  startServer();
}
