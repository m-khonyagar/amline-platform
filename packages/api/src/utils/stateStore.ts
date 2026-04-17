import fs from 'node:fs';
import path from 'node:path';

function resolveStatePath(filename: string): string {
  const baseDir = process.env.AMLINE_STATE_STORE_DIR?.trim() || path.join(process.cwd(), 'database');
  return path.resolve(baseDir, filename);
}

export function readJsonState<T>(filename: string, fallback: T): T {
  const filePath = resolveStatePath(filename);

  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonState<T>(filename: string, state: T): void {
  const filePath = resolveStatePath(filename);
  const directory = path.dirname(filePath);
  const tempFilePath = `${filePath}.tmp`;

  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(tempFilePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  fs.renameSync(tempFilePath, filePath);
}
