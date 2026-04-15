export function ensureAuthenticated(token?: string): boolean {
  return Boolean(token && token.length > 10);
}
