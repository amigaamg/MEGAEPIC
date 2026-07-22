// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitution — Audit Trail
// Immutable, hash-chained audit log with integrity verification
// ═══════════════════════════════════════════════════════════════════════════════

import {
  collection, addDoc, getDoc, getDocs, query,
  orderBy, where, limit, doc, Timestamp,
  type DocumentReference, type CollectionReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AmxUid, AuditEntry } from './types';

// ── Integrity hashing ─────────────────────────────────────────────────────────

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hashPayload(entry: Omit<AuditEntry, 'id' | 'integrityHash'> & { previousHash?: string }): string {
  const payload = [
    entry.timestamp.toString(),
    entry.actor,
    entry.actorName,
    entry.action,
    entry.resourceType,
    entry.resourceId,
    JSON.stringify(entry.previousValue ?? null),
    JSON.stringify(entry.newValue ?? null),
    entry.previousHash ?? '',
    entry.sessionId ?? '',
  ].join('|');
  return payload;
}

export async function computeIntegrityHash(
  entry: Omit<AuditEntry, 'id' | 'integrityHash'>,
  previousHash?: string,
): Promise<string> {
  const payload = hashPayload({ ...entry, previousHash });
  return sha256(payload);
}

// ── Collections ───────────────────────────────────────────────────────────────

export function globalAuditLogsCol(): CollectionReference {
  return collection(db, 'audit_logs');
}

export function orgAuditLogsCol(orgId: string): CollectionReference {
  return collection(db, 'organizations', orgId, 'auditLogs');
}

// ── Create audit entry ────────────────────────────────────────────────────────
// Creates an immutable audit entry with hash-chain integrity.
// Returns the full AuditEntry with computed id and integrityHash.

export async function createAuditEntry(
  data: Omit<AuditEntry, 'id' | 'integrityHash'>,
  options?: { orgId?: string; previousEntryId?: string },
): Promise<AuditEntry> {
  const col = options?.orgId ? orgAuditLogsCol(options.orgId) : globalAuditLogsCol();

  let previousHash: string | undefined;
  if (options?.previousEntryId) {
    const prevSnap = await getDoc(doc(col, options.previousEntryId));
    if (prevSnap.exists()) {
      previousHash = (prevSnap.data() as AuditEntry).integrityHash;
    }
  }

  const integrityHash = await computeIntegrityHash(data, previousHash);
  const entry: AuditEntry = { id: '', ...data, integrityHash };

  const ref = await addDoc(col, entry);
  return { ...entry, id: ref.id };
}

// ── Verify entry integrity ────────────────────────────────────────────────────
// Returns true if the entry's integrity hash matches its recomputed hash.

export async function verifyAuditEntryIntegrity(
  entry: AuditEntry,
  previousHash?: string,
): Promise<boolean> {
  const recomputed = await computeIntegrityHash(
    {
      timestamp: entry.timestamp,
      actor: entry.actor,
      actorName: entry.actorName,
      actorRole: entry.actorRole,
      actorOrganizationId: entry.actorOrganizationId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
      ipAddress: entry.ipAddress,
      deviceInfo: entry.deviceInfo,
      sessionId: entry.sessionId,
      digitalSignatureId: entry.digitalSignatureId,
      reason: entry.reason,
    },
    previousHash,
  );
  return recomputed === entry.integrityHash;
}

// ── Verify full chain ─────────────────────────────────────────────────────────
// Verifies every entry in the chain from start to end.

export async function verifyAuditChain(
  entries: AuditEntry[],
): Promise<{ valid: boolean; brokenAtIndex: number; reason?: string }> {
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isLast = i === entries.length - 1;

    const verified = await verifyAuditEntryIntegrity(
      entry,
      i > 0 ? entries[i - 1].integrityHash : undefined,
    );

    if (!verified) {
      return { valid: false, brokenAtIndex: i, reason: `Entry ${entry.id} hash mismatch` };
    }
  }
  return { valid: true, brokenAtIndex: -1 };
}

// ── Query audit logs ──────────────────────────────────────────────────────────

export async function getAuditLogs(
  options: { orgId?: string; actorId?: string; resourceId?: string; maxResults?: number } = {},
): Promise<AuditEntry[]> {
  const col = options.orgId ? orgAuditLogsCol(options.orgId) : globalAuditLogsCol();
  const constraints: any[] = [];

  if (options.actorId) constraints.push(where('actor', '==', options.actorId));
  if (options.resourceId) constraints.push(where('resourceId', '==', options.resourceId));
  constraints.push(orderBy('timestamp', 'desc'));
  if (options.maxResults) constraints.push(limit(options.maxResults));

  const q = query(col, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditEntry));
}

// ── Convenience: record an access audit entry ─────────────────────────────────

export async function recordAccess(
  actor: AmxUid,
  actorName: string,
  actorRole: string,
  actorOrgId: string,
  resourceType: string,
  resourceId: string,
  action: string,
  options?: { orgId?: string; sessionId?: string; reason?: string },
): Promise<AuditEntry> {
  return createAuditEntry({
    timestamp: Date.now(),
    actor,
    actorName,
    actorRole,
    actorOrganizationId: actorOrgId,
    action,
    resourceType,
    resourceId,
    previousValue: undefined,
    newValue: undefined,
    sessionId: options?.sessionId,
    reason: options?.reason,
  }, options);
}
