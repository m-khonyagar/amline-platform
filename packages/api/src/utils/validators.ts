export function requireFields<T extends Record<string, unknown>>(payload: T, fields: string[]): string[] {
  return fields.filter((field) => !payload[field]);
}
