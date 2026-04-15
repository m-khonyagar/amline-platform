export function webhookManager(eventName: string, payload: Record<string, unknown>) {
  return { eventName, payload, delivered: true };
}
