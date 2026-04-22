import fs from 'node:fs';
import path from 'node:path';

function mojibakeScore(value: string): number {
  const matches = value.match(/(?:Ã.|Ø.|Ù.|â€|âœ|â€“|â€”)/g);
  return matches?.length ?? 0;
}

function decodePossiblyBrokenString(value: string): string {
  let current = value;

  for (let iteration = 0; iteration < 3; iteration += 1) {
    if (mojibakeScore(current) === 0) {
      return current;
    }

    const decoded = Buffer.from(current, 'latin1').toString('utf8');
    if (!decoded || decoded === current) {
      return current;
    }

    const improved =
      mojibakeScore(decoded) < mojibakeScore(current) ||
      (/[\u0600-\u06FF]/.test(decoded) && !/[\u0600-\u06FF]/.test(current));

    if (!improved) {
      return current;
    }

    current = decoded;
  }

  return current;
}

function sanitizeState<T>(value: T): T {
  if (typeof value === 'string') {
    return decodePossiblyBrokenString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeState(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeState(nestedValue)]),
    ) as T;
  }

  return value;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

function resolveStatePath(filename: string): string {
  const baseDir = process.env.AMLINE_STATE_STORE_DIR?.trim() || path.join(process.cwd(), 'database');
  return path.resolve(baseDir, filename);
}

export function readJsonState<T>(filename: string, fallback: T): T {
  const filePath = resolveStatePath(filename);

  try {
    if (!fs.existsSync(filePath)) {
      return sanitizeState(fallback);
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) {
      return sanitizeState(fallback);
    }

    const parsed = JSON.parse(raw) as T;
    const sanitized = sanitizeState(parsed);

    if (stableJson(sanitized) !== stableJson(parsed)) {
      writeJsonState(filename, sanitized);
    }

    return sanitized;
  } catch {
    return sanitizeState(fallback);
  }
}

export function writeJsonState<T>(filename: string, state: T): void {
  const filePath = resolveStatePath(filename);
  const directory = path.dirname(filePath);
  const tempFilePath = `${filePath}.tmp`;
  const sanitized = sanitizeState(state);

  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(tempFilePath, `${JSON.stringify(sanitized, null, 2)}\n`, 'utf8');
  fs.renameSync(tempFilePath, filePath);
}
