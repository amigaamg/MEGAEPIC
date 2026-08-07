// Firestore rejects `undefined` field values with
// "Function setDoc() called with invalid data. Unsupported field value: undefined".
// It also rejects NaN / ±Infinity at the top level. Optional model fields
// (facilityId, legalName, parentId, …) are frequently undefined during
// seeding/creation, so every write must strip them first.
//
// This is a genuinely deep, structural pass (Layer 1 of the workspace contract):
//   * object keys with `undefined` are dropped
//   * `undefined` array elements become `null` (shape-preserving, Firestore-safe)
//   * NaN / ±Infinity become `null`
//   * Dates / Blobs / Uint8Arrays are preserved
//   * shared references are normalized ONCE and re-used (never re-introduced raw)
//   * circular references are de-duplicated via a strong map (no infinite loop)
// Returns the input when nothing changed.

export function sanitizeForFirestore<T>(value: T): T {
  const normalized = new WeakMap<object, unknown>();
  const inProgress = new Set<object>();

  function clean(v: unknown): unknown {
    if (v === undefined || v === null) return v;
    const t = typeof v;
    if (t !== 'object') {
      return typeof v === 'number' && !Number.isFinite(v) ? null : v;
    }
    if (v instanceof Date) return v;
    if (v instanceof Blob) return v;
    if (v instanceof Uint8Array) return v;
    if (normalized.has(v as object)) return normalized.get(v as object);
    if (inProgress.has(v as object)) return null; // circular ref — cannot persist

    inProgress.add(v as object);
    let result: unknown;
    if (Array.isArray(v)) {
      result = v.map((el) => {
        const c = clean(el);
        return c === undefined ? null : c;
      });
    } else {
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(v as object)) {
        const c = clean((v as Record<string, unknown>)[key]);
        if (c === undefined) continue; // drop undefined properties
        out[key] = c;
      }
      result = out;
    }
    inProgress.delete(v as object);
    normalized.set(v as object, result);
    return result;
  }

  return clean(value) as T;
}