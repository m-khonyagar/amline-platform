import { randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { achievementRoutes } from './routes/achievements';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';
import { billingRoutes } from './routes/billing';
import { hrRoutes } from './routes/hr';
import { licenseRoutes } from './routes/licenses';
import { paymentRoutes } from './routes/payments';
import { propertyRoutes } from './routes/properties';
import { accountService } from './services/accountService';
import { adminService } from './services/adminService';
import { aiService } from './services/aiService';
import { authService, validateIranMobile } from './services/authService';
import { chatService } from './services/chatService';
import { commissionService } from './services/commissionService';
import { contractService } from './services/contractService';
import { crmService } from './services/crmService';
import { needsService } from './services/needsService';
import { supportService } from './services/supportService';
import { logger } from './utils/logger';

type AppRouteMap = ReturnType<typeof createApp>;
type ContractClientContext = 'people' | 'advisor' | 'ops';

const MAX_BODY_BYTES = Number(process.env.MAX_BODY_BYTES ?? 1024 * 1024);
const MAX_IN_FLIGHT_REQUESTS = Number(process.env.MAX_IN_FLIGHT_REQUESTS ?? 5000);
const OVERLOAD_RETRY_AFTER_SECONDS = Number(process.env.OVERLOAD_RETRY_AFTER_SECONDS ?? 5);
const READY_IN_FLIGHT_THRESHOLD = Number(
  process.env.READY_IN_FLIGHT_THRESHOLD ?? Math.max(1, Math.floor(MAX_IN_FLIGHT_REQUESTS * 0.9)),
);
const SERVER_KEEP_ALIVE_TIMEOUT_MS = Number(process.env.SERVER_KEEP_ALIVE_TIMEOUT_MS ?? 65000);
const SERVER_HEADERS_TIMEOUT_MS = Number(process.env.SERVER_HEADERS_TIMEOUT_MS ?? 66000);
const SERVER_REQUEST_TIMEOUT_MS = Number(process.env.SERVER_REQUEST_TIMEOUT_MS ?? 15000);
const SERVER_MAX_CONNECTIONS = Number(process.env.SERVER_MAX_CONNECTIONS ?? 50000);
const SHUTDOWN_GRACE_PERIOD_MS = Number(process.env.SHUTDOWN_GRACE_PERIOD_MS ?? 15000);

const runtimeState = {
  startedAt: Date.now(),
  inFlightRequests: 0,
  totalRequests: 0,
  totalErrors: 0,
  overloadRejections: 0,
  shuttingDown: false,
};

/** SEC-005 — سقف تقریبی درخواست در هر دقیقه برای هر IP */
const ipRateBuckets = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 100;

function clientIpFrom(request: IncomingMessage): string {
  const xff = request.headers['x-forwarded-for'];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  if (raw) {
    return raw.split(',')[0].trim();
  }
  return request.socket.remoteAddress ?? 'local';
}

function allowIpRateLimit(ip: string): boolean {
  const now = Date.now();
  let bucket = ipRateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    bucket = { count: 0, windowStart: now };
  }
  bucket.count += 1;
  ipRateBuckets.set(ip, bucket);
  return bucket.count <= RATE_LIMIT_MAX;
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
  extraHeaders: Record<string, string> = {},
): void {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Request-Id,Authorization',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    ...extraHeaders,
  });
  response.end(JSON.stringify(payload));
}

function sendText(
  response: ServerResponse,
  statusCode: number,
  payload: string,
  contentType: string,
  extraHeaders: Record<string, string> = {},
): void {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
    ...extraHeaders,
  });
  response.end(payload);
}

function readJsonBody<T>(request: IncomingMessage): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytesRead = 0;

    request.on('data', (chunk) => {
      const buffer = Buffer.from(chunk);
      bytesRead += buffer.length;

      if (bytesRead > MAX_BODY_BYTES) {
        reject(new Error(`Request body exceeds limit of ${MAX_BODY_BYTES} bytes.`));
        request.destroy();
        return;
      }

      chunks.push(buffer);
    });

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

function parseContractClient(rawValue: string | null): ContractClientContext {
  return rawValue === 'advisor' || rawValue === 'ops' ? rawValue : 'people';
}

function parseContractViewer(url: URL): { client: ContractClientContext; actorId: string; teamId: string } {
  return {
    client: parseContractClient(url.searchParams.get('client')),
    actorId: url.searchParams.get('actorId') ?? 'acct_1',
    teamId: url.searchParams.get('teamId') ?? 'team_north',
  };
}

function requestIdFrom(request: IncomingMessage): string {
  const rawHeader = request.headers['x-request-id'];
  const headerValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  return headerValue?.trim() || randomUUID();
}

function isReady(): boolean {
  return !runtimeState.shuttingDown && runtimeState.inFlightRequests < READY_IN_FLIGHT_THRESHOLD;
}

function runtimeMetrics(): string {
  const uptimeSeconds = Math.floor((Date.now() - runtimeState.startedAt) / 1000);
  return [
    '# HELP amline_api_uptime_seconds API uptime in seconds',
    '# TYPE amline_api_uptime_seconds gauge',
    `amline_api_uptime_seconds ${uptimeSeconds}`,
    '# HELP amline_api_in_flight_requests Number of requests currently in flight',
    '# TYPE amline_api_in_flight_requests gauge',
    `amline_api_in_flight_requests ${runtimeState.inFlightRequests}`,
    '# HELP amline_api_total_requests Total requests handled since process start',
    '# TYPE amline_api_total_requests counter',
    `amline_api_total_requests ${runtimeState.totalRequests}`,
    '# HELP amline_api_total_errors Total request handling errors since process start',
    '# TYPE amline_api_total_errors counter',
    `amline_api_total_errors ${runtimeState.totalErrors}`,
    '# HELP amline_api_overload_rejections_total Requests rejected by overload protection',
    '# TYPE amline_api_overload_rejections_total counter',
    `amline_api_overload_rejections_total ${runtimeState.overloadRejections}`,
    '# HELP amline_api_ready API readiness status',
    '# TYPE amline_api_ready gauge',
    `amline_api_ready ${isReady() ? 1 : 0}`,
  ].join('\n');
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
    adminService,
    accountService,
    aiService,
    authService,
    chatService,
    commissionService,
    contractService,
    crmService,
    needsService,
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
  const requestId = requestIdFrom(request);
  const startedAt = Date.now();

  response.setHeader('X-Request-Id', requestId);

  if (method === 'OPTIONS') {
    sendJson(response, 200, { ok: true }, { 'X-Request-Id': requestId });
    return;
  }

  const skipRateLimit =
    url.pathname === '/api/health' ||
    url.pathname === '/api/live' ||
    url.pathname === '/api/ready' ||
    url.pathname === '/api/metrics' ||
    url.pathname === '/health' ||
    url.pathname === '/live' ||
    url.pathname === '/ready' ||
    url.pathname === '/metrics';

  if (!skipRateLimit && !allowIpRateLimit(clientIpFrom(request))) {
    sendJson(
      response,
      429,
      { error: 'درخواست بیش از حد مجاز. لطفاً بعداً تلاش کنید.', requestId, code: 'SEC-005' },
      { 'Retry-After': '60', 'X-Request-Id': requestId },
    );
    return;
  }

  if (runtimeState.shuttingDown) {
    sendJson(response, 503, { error: 'Server is draining requests.', requestId }, {
      'Retry-After': String(OVERLOAD_RETRY_AFTER_SECONDS),
      'X-Request-Id': requestId,
    });
    return;
  }

  if (runtimeState.inFlightRequests >= MAX_IN_FLIGHT_REQUESTS) {
    runtimeState.overloadRejections += 1;
    logger.warn('Request rejected by overload protection', {
      requestId,
      method,
      path: url.pathname,
      inFlightRequests: runtimeState.inFlightRequests,
      maxInFlightRequests: MAX_IN_FLIGHT_REQUESTS,
    });
    sendJson(response, 503, { error: 'Server is temporarily overloaded.', requestId }, {
      'Retry-After': String(OVERLOAD_RETRY_AFTER_SECONDS),
      'X-Request-Id': requestId,
    });
    return;
  }

  runtimeState.inFlightRequests += 1;
  runtimeState.totalRequests += 1;

  try {
    if (method === 'GET' && (url.pathname === '/health' || url.pathname === '/api/health' || url.pathname === '/live' || url.pathname === '/api/live')) {
      sendJson(
        response,
        200,
        {
          status: 'ok',
          app: 'amline-platform-api',
          requestId,
          uptimeSeconds: Math.floor((Date.now() - runtimeState.startedAt) / 1000),
        },
        { 'X-Request-Id': requestId },
      );
      return;
    }

    if (method === 'GET' && (url.pathname === '/ready' || url.pathname === '/api/ready')) {
      const ready = isReady();
      sendJson(
        response,
        ready ? 200 : 503,
        {
          status: ready ? 'ready' : 'draining',
          requestId,
          inFlightRequests: runtimeState.inFlightRequests,
          maxInFlightRequests: MAX_IN_FLIGHT_REQUESTS,
          shuttingDown: runtimeState.shuttingDown,
        },
        { 'X-Request-Id': requestId },
      );
      return;
    }

    if (method === 'GET' && (url.pathname === '/metrics' || url.pathname === '/api/metrics')) {
      sendText(response, 200, runtimeMetrics(), 'text/plain; version=0.0.4; charset=utf-8', {
        'X-Request-Id': requestId,
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/properties') {
      sendJson(response, 200, { items: app.propertyRoutes.list() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/properties') {
      const body = await readJsonBody<{ title: string; city: string; price: number }>(request);
      if (!body?.title || !body.city || typeof body.price !== 'number') {
        sendJson(response, 400, { error: 'title, city, and price are required.', requestId }, { 'X-Request-Id': requestId });
        return;
      }

      const property = app.propertyRoutes.create({
        title: body.title,
        city: body.city,
        price: body.price,
        status: 'published',
      });
      sendJson(response, 201, property, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/payments') {
      sendJson(response, 200, { items: app.paymentRoutes.history() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/contracts') {
      const viewer = parseContractViewer(url);
      const status = url.searchParams.get('status') ?? undefined;
      const q = url.searchParams.get('q') ?? undefined;
      sendJson(
        response,
        200,
        { items: app.contractService.list(viewer.client, viewer.actorId, viewer.teamId, { status, q }) },
        { 'X-Request-Id': requestId },
      );
      return;
    }

    const contractPdfMatch = url.pathname.match(/^\/api\/contracts\/([^/]+)\/pdf$/);
    if (method === 'GET' && contractPdfMatch) {
      const viewer = parseContractViewer(url);
      const id = contractPdfMatch[1];
      const resolved = app.contractService.resolveDetail(id, viewer.client, viewer.actorId, viewer.teamId);
      if (resolved.kind === 'not_found') {
        sendJson(response, 404, { error: 'قرارداد یافت نشد', requestId }, { 'X-Request-Id': requestId });
        return;
      }
      if (resolved.kind === 'forbidden') {
        sendJson(response, 403, { error: resolved.message, scenarioId: resolved.scenarioId, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      const name = app.contractService.pdfFilename(id);
      sendJson(response, 200, { fileName: name, note: 'REP-001 — خروجی PDF شبیه‌سازی‌شده', requestId }, { 'X-Request-Id': requestId });
      return;
    }

    const contractSignMatch = url.pathname.match(/^\/api\/contracts\/([^/]+)\/sign$/);
    if (method === 'POST' && contractSignMatch) {
      const viewer = parseContractViewer(url);
      const id = contractSignMatch[1];
      const body = await readJsonBody<{ userId?: string }>(request);
      const userId = body?.userId ?? viewer.actorId;
      const result = app.contractService.signContract(id, userId, viewer.client);
      if (!result.ok) {
        sendJson(response, result.http, { error: result.error, code: result.code, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, { ok: true, message: result.message, requestId }, { 'X-Request-Id': requestId });
      return;
    }

    const contractDraftMatch = url.pathname.match(/^\/api\/contracts\/([^/]+)\/draft$/);
    if (method === 'PUT' && contractDraftMatch) {
      const id = contractDraftMatch[1];
      const body = await readJsonBody<{ version?: number }>(request);
      const version = typeof body?.version === 'number' ? body.version : -1;
      const result = app.contractService.saveDraft(id, version);
      if (!result.ok) {
        sendJson(response, result.http, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, { ok: true, version: result.version, requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname.startsWith('/api/contracts/')) {
      const viewer = parseContractViewer(url);
      const id = url.pathname.replace('/api/contracts/', '');
      const resolved = app.contractService.resolveDetail(id, viewer.client, viewer.actorId, viewer.teamId);
      if (resolved.kind === 'not_found') {
        sendJson(response, 404, { error: 'قرارداد یافت نشد', requestId }, { 'X-Request-Id': requestId });
        return;
      }
      if (resolved.kind === 'forbidden') {
        sendJson(response, 403, { error: resolved.message, scenarioId: resolved.scenarioId, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, resolved.detail, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/analytics/funnel') {
      const rawScope = url.searchParams.get('scope');
      const scope = rawScope === 'operations' ? 'operations' : 'marketplace';
      sendJson(response, 200, { items: app.adminService.funnel(scope) }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'DELETE' && url.pathname.startsWith('/api/contracts/')) {
      const id = url.pathname.replace('/api/contracts/', '');
      const removed = app.contractService.removeDraft(id);
      sendJson(response, removed ? 200 : 404, removed ? { ok: true } : { error: 'Draft not found.', requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/request-otp') {
      const body = await readJsonBody<{ mobile?: string }>(request);
      const ip = clientIpFrom(request);
      const result = app.authService.requestOtp(body?.mobile ?? '', { ip });
      if (!result.ok) {
        sendJson(response, 400, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(
        response,
        200,
        { ok: true, expiresInSeconds: result.expiresInSeconds, devHint: result.devHint, requestId },
        { 'X-Request-Id': requestId },
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/verify-otp') {
      const body = await readJsonBody<{ mobile?: string; code?: string }>(request);
      const ip = clientIpFrom(request);
      const result = app.authService.verifyOtp(body?.mobile ?? '', body?.code ?? '', { ip });
      if (!result.ok) {
        const code = result.code === 'OTP_EXPIRED' ? 400 : 401;
        sendJson(response, code, { error: result.error, code: result.code, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(
        response,
        200,
        {
          token: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn,
          user: result.user,
          requestId,
        },
        { 'X-Request-Id': requestId },
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/refresh') {
      const body = await readJsonBody<{ refreshToken?: string }>(request);
      const result = app.authService.refresh(body?.refreshToken ?? '');
      if (!result.ok) {
        sendJson(response, 401, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(
        response,
        200,
        { token: result.tokens.accessToken, refreshToken: result.tokens.refreshToken, expiresIn: result.tokens.expiresIn, requestId },
        { 'X-Request-Id': requestId },
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/logout') {
      const body = await readJsonBody<{ accessToken?: string; refreshToken?: string }>(request);
      app.authService.logout(body?.accessToken, body?.refreshToken);
      sendJson(response, 200, { ok: true, requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/register/national-id') {
      const body = await readJsonBody<{ nationalId?: string }>(request);
      const result = app.authService.registerNationalId(body?.nationalId ?? '');
      if (!result.ok) {
        sendJson(response, 400, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, { ok: true, requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/login') {
      const body = await readJsonBody<{ mobile: string }>(request);
      if (!body?.mobile) {
        sendJson(response, 400, { error: 'mobile is required.', requestId }, { 'X-Request-Id': requestId });
        return;
      }
      const v = validateIranMobile(body.mobile);
      if (!v.ok) {
        sendJson(response, 400, { error: v.error, requestId, code: 'AUTH-002' }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, app.authRoutes.login(v.mobile), { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/licenses') {
      sendJson(response, 200, { items: app.licenseRoutes.list() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/achievements') {
      sendJson(response, 200, { items: app.achievementRoutes.leaderboard() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/hr/openings') {
      sendJson(response, 200, { items: app.hrRoutes.openings() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/billing/invoices') {
      const body = await readJsonBody<{ accountId: string; amount: number }>(request);
      if (!body?.accountId || typeof body.amount !== 'number') {
        sendJson(response, 400, { error: 'accountId and amount are required.', requestId }, { 'X-Request-Id': requestId });
        return;
      }

      sendJson(response, 201, app.billingRoutes.issue(body.accountId, body.amount), { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/billing/invoices') {
      sendJson(response, 200, { items: app.billingRoutes.list() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/profile') {
      sendJson(response, 200, app.accountService.profile(), { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/details') {
      sendJson(response, 200, app.accountService.profileDetails(), { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'PUT' && url.pathname === '/api/account/details') {
      const body = await readJsonBody<{
        agencyName?: string;
        supportPhone?: string;
        supportHours?: string;
        whatsapp?: string;
      }>(request);
      if (!body) {
        sendJson(response, 400, { error: 'payload is required.', requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, app.accountService.updateProfileDetails(body), { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/account/preferences') {
      const body = await readJsonBody<{ key?: string; enabled?: boolean }>(request);
      if (!body?.key || typeof body.enabled !== 'boolean') {
        sendJson(response, 400, { error: 'key and enabled are required.', requestId }, { 'X-Request-Id': requestId });
        return;
      }
      const updated = app.accountService.setPreference(body.key, body.enabled);
      sendJson(response, updated ? 200 : 404, updated ?? { error: 'Preference not found.', requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/listings') {
      sendJson(response, 200, { items: app.accountService.listings() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'DELETE' && url.pathname.startsWith('/api/account/listings/')) {
      const id = url.pathname.replace('/api/account/listings/', '');
      const result = app.accountService.removeListing(id);
      if (!result.ok) {
        sendJson(response, 404, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, { ok: true, requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/needs') {
      sendJson(response, 200, { items: app.accountService.needs() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/account/needs') {
      const body = await readJsonBody<{ title?: string; city?: string; budget?: string }>(request);
      const actorId = url.searchParams.get('actorId') ?? 'acct_1';
      const result = app.needsService.create(body ?? {}, actorId);
      if (!result.ok) {
        sendJson(response, 400, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 201, result.need, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'PUT' && url.pathname.startsWith('/api/account/needs/')) {
      const id = url.pathname.replace('/api/account/needs/', '');
      const body = await readJsonBody<{ title?: string; city?: string; budget?: string }>(request);
      const result = app.needsService.update(id, body ?? {});
      if (!result.ok) {
        sendJson(response, 400, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, result.need, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname.startsWith('/api/account/needs/') && url.pathname.endsWith('/close')) {
      const id = url.pathname.replace('/api/account/needs/', '').replace('/close', '');
      const result = app.needsService.close(id);
      if (!result.ok) {
        sendJson(response, 400, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, { ok: true, message: 'نیازمندی بسته شد', requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'DELETE' && url.pathname.startsWith('/api/account/needs/')) {
      const id = url.pathname.replace('/api/account/needs/', '');
      const result = app.needsService.deleteHard(id);
      if (!result.ok) {
        sendJson(response, 400, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, { ok: true, message: 'نیازمندی حذف شد', requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/advisor/clients') {
      const advisorId = url.searchParams.get('advisorId') ?? 'adv_21';
      sendJson(response, 200, { items: app.crmService.list(advisorId) }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/advisor/clients') {
      const body = await readJsonBody<{ firstName?: string; lastName?: string; mobile?: string }>(request);
      const advisorId = url.searchParams.get('advisorId') ?? 'adv_21';
      const result = app.crmService.add(body ?? {}, advisorId);
      if (!result.ok) {
        sendJson(response, 400, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 201, result.client, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname.startsWith('/api/clients/') && url.pathname.endsWith('/full')) {
      const id = url.pathname.replace('/api/clients/', '').replace('/full', '');
      const profile = app.crmService.fullProfile(id);
      if (!profile) {
        sendJson(response, 404, { error: 'مشتری یافت نشد', requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, profile, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/advisor/commissions') {
      const advisorId = url.searchParams.get('advisorId') ?? 'adv_21';
      sendJson(response, 200, { items: app.commissionService.list(advisorId) }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname.match(/\/api\/advisor\/commissions\/[^/]+\/settle$/)) {
      const id = url.pathname.replace('/api/advisor/commissions/', '').replace('/settle', '');
      const advisorId = url.searchParams.get('advisorId') ?? 'adv_21';
      const result = app.commissionService.requestSettlement(id, advisorId);
      if (!result.ok) {
        sendJson(response, 400, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, { ok: true, message: result.message, requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname.match(/\/api\/ops\/commissions\/[^/]+\/approve$/)) {
      const id = url.pathname.replace('/api/ops/commissions/', '').replace('/approve', '');
      const result = app.commissionService.approve(id);
      if (!result.ok) {
        sendJson(response, 400, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, { ok: true, requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname.match(/\/api\/ops\/commissions\/[^/]+\/reject$/)) {
      const id = url.pathname.replace('/api/ops/commissions/', '').replace('/reject', '');
      const body = await readJsonBody<{ reason?: string }>(request);
      const result = app.commissionService.reject(id, body?.reason ?? '');
      if (!result.ok) {
        sendJson(response, 400, { error: result.error, requestId }, { 'X-Request-Id': requestId });
        return;
      }
      sendJson(response, 200, { ok: true, requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/bookmarks') {
      sendJson(response, 200, { items: app.accountService.bookmarks() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/account/requests') {
      sendJson(response, 200, { items: app.accountService.requests() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/chat/conversations') {
      sendJson(response, 200, { items: app.chatService.list() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname.startsWith('/api/chat/conversations/')) {
      const id = url.pathname.replace('/api/chat/conversations/', '');
      sendJson(response, 200, { items: app.chatService.messages(id) }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/review-queue') {
      sendJson(response, 200, { items: app.adminService.reviewQueue() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname.startsWith('/api/admin/review-queue/') && url.pathname.endsWith('/assign')) {
      const id = url.pathname.replace('/api/admin/review-queue/', '').replace('/assign', '');
      const updated = app.adminService.assignReviewCase(id);
      sendJson(response, updated ? 200 : 404, updated ? { ok: true } : { error: 'Review case not found.', requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname.startsWith('/api/admin/review-queue/') && url.pathname.endsWith('/escalate')) {
      const id = url.pathname.replace('/api/admin/review-queue/', '').replace('/escalate', '');
      const updated = app.adminService.escalateReviewCase(id);
      sendJson(response, updated ? 200 : 404, updated ? { ok: true } : { error: 'Review case not found.', requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/fraud-cases') {
      sendJson(response, 200, { items: app.adminService.fraudCases() }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/audit-log/export') {
      const entityId = url.searchParams.get('entityId') ?? undefined;
      const csv = app.adminService.auditLogExportCsv({ entityId });
      sendText(response, 200, csv, 'text/csv; charset=utf-8', {
        'Content-Disposition': 'attachment; filename="AuditLog_export.csv"',
        'X-Request-Id': requestId,
      });
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/audit-log') {
      const entityId = url.searchParams.get('entityId') ?? undefined;
      const actor = url.searchParams.get('actor') ?? undefined;
      const action = url.searchParams.get('action') ?? undefined;
      sendJson(response, 200, { items: app.adminService.auditLog({ entityId, actor, action }) }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname.startsWith('/api/admin/fraud-cases/') && url.pathname.endsWith('/decision')) {
      const id = url.pathname.replace('/api/admin/fraud-cases/', '').replace('/decision', '');
      const body = await readJsonBody<{ decision?: 'allow' | 'monitor' | 'block' }>(request);
      if (!body?.decision || !['allow', 'monitor', 'block'].includes(body.decision)) {
        sendJson(response, 400, { error: 'decision must be allow, monitor or block.', requestId }, { 'X-Request-Id': requestId });
        return;
      }
      const updated = app.adminService.decideFraudCase(id, body.decision);
      sendJson(response, updated ? 200 : 404, updated ? { ok: true } : { error: 'Fraud case not found.', requestId }, { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname.startsWith('/api/chat/conversations/') && url.pathname.endsWith('/messages')) {
      const id = url.pathname.replace('/api/chat/conversations/', '').replace('/messages', '');
      const body = await readJsonBody<{ text: string }>(request);
      if (!body?.text?.trim()) {
        sendJson(response, 400, { error: 'text is required.', requestId }, { 'X-Request-Id': requestId });
        return;
      }

      sendJson(response, 201, app.chatService.appendMessage(id, body.text.trim()), { 'X-Request-Id': requestId });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/support/complaints') {
      const body = await readJsonBody<{ subject: string; description: string; category?: string }>(request);
      if (!body?.subject?.trim() || !body.description?.trim()) {
        sendJson(response, 400, { error: 'subject and description are required.', requestId }, { 'X-Request-Id': requestId });
        return;
      }

      const complaint = app.supportService.submit(body.subject.trim(), body.description.trim(), body.category?.trim() || 'general');
      sendJson(
        response,
        201,
        {
          id: complaint.id,
          status: complaint.status,
          trackingCode: complaint.trackingCode,
          message: `Complaint ${complaint.trackingCode} submitted successfully.`,
        },
        { 'X-Request-Id': requestId },
      );
      return;
    }

    if (method === 'GET' && url.pathname === '/api/ai/estimate') {
      const city = url.searchParams.get('city') ?? 'تهران';
      const area = Number(url.searchParams.get('area') ?? '100');
      sendJson(response, 200, app.aiService.estimatePropertyPrice(city, area), { 'X-Request-Id': requestId });
      return;
    }

    sendJson(response, 404, { error: 'Route not found.', requestId }, { 'X-Request-Id': requestId });
  } catch (error) {
    runtimeState.totalErrors += 1;
    const message = error instanceof Error ? error.message : 'Unhandled server error';
    logger.error('Request handling failed', { requestId, method, path: url.pathname, message });
    sendJson(response, 500, { error: message, requestId }, { 'X-Request-Id': requestId });
  } finally {
    runtimeState.inFlightRequests = Math.max(0, runtimeState.inFlightRequests - 1);
    const durationMs = Date.now() - startedAt;
    if (durationMs > 1500) {
      logger.warn('Slow request detected', {
        requestId,
        method,
        path: url.pathname,
        durationMs,
        inFlightRequests: runtimeState.inFlightRequests,
      });
    }
  }
}

function installGracefulShutdown(server: Server): void {
  const shutdown = (signal: string) => {
    if (runtimeState.shuttingDown) {
      return;
    }

    runtimeState.shuttingDown = true;
    logger.warn('Graceful shutdown initiated', { signal, inFlightRequests: runtimeState.inFlightRequests });

    server.close((error) => {
      if (error) {
        logger.error('Graceful shutdown failed', {
          signal,
          message: error.message,
        });
        process.exit(1);
        return;
      }

      logger.info('Graceful shutdown completed', { signal });
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after grace period', {
        signal,
        gracePeriodMs: SHUTDOWN_GRACE_PERIOD_MS,
        inFlightRequests: runtimeState.inFlightRequests,
      });
      process.exit(1);
    }, SHUTDOWN_GRACE_PERIOD_MS).unref();
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

export function startServer(
  port = Number(process.env.PORT ?? 8080),
  options: { installShutdownHandlers?: boolean } = {},
) {
  const server = createServer((request, response) => {
    void requestListener(request, response);
  });

  server.keepAliveTimeout = SERVER_KEEP_ALIVE_TIMEOUT_MS;
  server.headersTimeout = SERVER_HEADERS_TIMEOUT_MS;
  server.requestTimeout = SERVER_REQUEST_TIMEOUT_MS;
  server.maxConnections = SERVER_MAX_CONNECTIONS;
  server.on('connection', (socket) => {
    socket.setNoDelay(true);
    socket.setKeepAlive(true, 1000);
  });

  server.listen(port, () => {
    logger.info('Amline API server started', {
      port,
      keepAliveTimeoutMs: SERVER_KEEP_ALIVE_TIMEOUT_MS,
      requestTimeoutMs: SERVER_REQUEST_TIMEOUT_MS,
      maxInFlightRequests: MAX_IN_FLIGHT_REQUESTS,
      maxConnections: SERVER_MAX_CONNECTIONS,
    });
  });

  if (options.installShutdownHandlers) {
    installGracefulShutdown(server);
  }

  return server;
}

if (require.main === module) {
  startServer(undefined, { installShutdownHandlers: true });
}
