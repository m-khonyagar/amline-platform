import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { achievementRoutes } from './routes/achievements';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';
import { billingRoutes } from './routes/billing';
import { hrRoutes } from './routes/hr';
import { paymentRoutes } from './routes/payments';
import { propertyRoutes } from './routes/properties';
import { licenseRoutes } from './routes/licenses';
import { aiService } from './services/aiService';
import { logger } from './utils/logger';

type AppRouteMap = ReturnType<typeof createApp>;

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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
    aiService,
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
