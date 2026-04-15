const counters = new Map<string, number>();

export function allowRequest(key: string, maxRequests = 60): boolean {
  const next = (counters.get(key) ?? 0) + 1;
  counters.set(key, next);
  return next <= maxRequests;
}
