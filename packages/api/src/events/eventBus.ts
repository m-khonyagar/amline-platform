type EventHandler<T> = (payload: T) => void;

const subscriptions = new Map<string, EventHandler<unknown>[]>();

export function publish<T>(eventName: string, payload: T): void {
  for (const handler of subscriptions.get(eventName) ?? []) {
    handler(payload);
  }
}

export function subscribe<T>(eventName: string, handler: EventHandler<T>): void {
  const handlers = subscriptions.get(eventName) ?? [];
  subscriptions.set(eventName, [...handlers, handler as EventHandler<unknown>]);
}
