// Firestore rejects `undefined` field values with
// "Function setDoc() called with invalid data. Unsupported field value: undefined".
// Optional model fields (facilityId, legalName, parentId, …) are frequently
// undefined during seeding/creation, so every write must strip them first.
// This does a deep, structural pass: arrays are mapped, plain objects pruned,
// Dates/Blobs/etc. are preserved. Returns the input when nothing changed.

export function sanitizeForFirestore<T>(value: T, seen: WeakSet<object> = new WeakSet()): T {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (seen.has(value as object)) return value;
  seen.add(value as object);

  if (value instanceof Date) return value as unknown as T;
  if (value instanceof Blob) return value as unknown as T;
  if (Array.isArray(value)) {
    const arr = value.map((v) => sanitizeForFirestore(v, seen));
    return arr as unknown as T;
  }
  const out: Record<string, unknown> = {};
  let changed = false;
  for (const key of Object.keys(value as Record<string, unknown>)) {
    const v = (value as Record<string, unknown>)[key];
    if (v === undefined) { changed = true; continue; }
    if (typeof v === 'object' && v !== null) {
      const cleaned = sanitizeForFirestore(v, seen);
      if (cleaned !== v) changed = true;
      if (cleaned === undefined) { changed = true; continue; }
      out[key] = cleaned;
    } else {
      out[key] = v;
    }
  }
  if (changed) return out as unknown as T;
  return value;
}
