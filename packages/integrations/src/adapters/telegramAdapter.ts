export function telegramAdapter(payload: Record<string, unknown>) {
  return { target: 'telegram', payload };
}
