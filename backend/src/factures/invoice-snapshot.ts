import { createHash } from 'crypto';

function normalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    if ('toFixed' in value && typeof (value as { toFixed?: unknown }).toFixed === 'function') return String(value);
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, normalize(item)]));
  }
  return value;
}

export function createInvoiceSnapshot(input: unknown) {
  const snapshot = normalize(input);
  const serialized = JSON.stringify(snapshot);
  return { snapshot, contentHash: createHash('sha256').update(serialized).digest('hex') };
}
