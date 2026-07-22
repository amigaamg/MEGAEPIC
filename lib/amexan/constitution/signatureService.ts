// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitution — Digital Signature Service
// Cryptographic signing of clinical documents with hash-chain integrity
// ═══════════════════════════════════════════════════════════════════════════════

import { collection, addDoc, getDoc, getDocs, query, where, orderBy, limit, doc, updateDoc, type CollectionReference, type DocumentReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AmxUid, DigitalSignature } from './types';
import { createAuditEntry } from './audit';

// ── Collections ───────────────────────────────────────────────────────────────

export function signaturesCol(): CollectionReference {
  return collection(db, 'signatures');
}

export function signatureRef(id: string): DocumentReference {
  return doc(db, 'signatures', id);
}

// ── Hashing ───────────────────────────────────────────────────────────────────

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function computeDocumentHash(documentContent: string): Promise<string> {
  return sha256(documentContent);
}

// ── Create Signature ──────────────────────────────────────────────────────────
// Signs a document by computing its hash and recording the signature.
// Returns the DigitalSignature and the document hash.

export async function signDocument(
  personId: AmxUid,
  signedBy: AmxUid,
  signedByName: string,
  signedByRole: string,
  signedByOrganizationId: string,
  signedByDepartmentId: string,
  documentType: string,
  documentId: string,
  documentContent: string,
  options?: {
    signatureType?: 'full' | 'initial' | 'witness' | 'co_sign' | 'approval';
    meaning?: string;
    ipAddress?: string;
    deviceInfo?: string;
    location?: string;
  },
): Promise<{ signature: DigitalSignature; documentHash: string }> {
  const documentHash = await computeDocumentHash(documentContent);

  const signature: Omit<DigitalSignature, 'id'> = {
    personId,
    signedBy,
    signedByName,
    signedByRole,
    signedByOrganizationId,
    signedByDepartmentId,
    signedAt: Date.now(),
    signatureType: options?.signatureType ?? 'full',
    documentType,
    documentId,
    documentHash,
    meaning: options?.meaning ?? `${signedByName} (${signedByRole}) — ${documentType}`,
    ipAddress: options?.ipAddress,
    deviceInfo: options?.deviceInfo,
    location: options?.location,
    isValid: true,
  };

  const ref = await addDoc(signaturesCol(), signature);

  const fullSignature: DigitalSignature = { ...signature, id: ref.id };

  // Record audit trail
  await createAuditEntry({
    timestamp: Date.now(),
    actor: signedBy,
    actorName: signedByName,
    actorRole: signedByRole,
    actorOrganizationId: signedByOrganizationId,
    action: 'sign',
    resourceType: documentType,
    resourceId: documentId,
    newValue: { signatureId: ref.id, documentHash },
    digitalSignatureId: ref.id,
    reason: options?.meaning,
    ipAddress: options?.ipAddress,
    deviceInfo: options?.deviceInfo,
  });

  return { signature: fullSignature, documentHash };
}

// ── Verify Signature ──────────────────────────────────────────────────────────
// Checks if a signature exists, is valid, and the document hash matches.

export async function verifySignature(
  signatureId: string,
  documentContent: string,
): Promise<{
  valid: boolean;
  signature?: DigitalSignature;
  reason?: string;
}> {
  const snap = await getDoc(signatureRef(signatureId));
  if (!snap.exists()) {
    return { valid: false, reason: 'Signature not found' };
  }

  const signature = { id: snap.id, ...snap.data() } as DigitalSignature;

  if (!signature.isValid) {
    return { valid: false, signature, reason: `Signature revoked: ${signature.revocationReason ?? 'Unknown'}` };
  }

  const currentHash = await computeDocumentHash(documentContent);
  if (currentHash !== signature.documentHash) {
    return { valid: false, signature, reason: 'Document content has been modified since signing' };
  }

  return { valid: true, signature };
}

// ── Revoke Signature ──────────────────────────────────────────────────────────

export async function revokeSignature(
  signatureId: string,
  revokedBy: AmxUid,
  revocationReason: string,
): Promise<void> {
  await updateDoc(signatureRef(signatureId), {
    isValid: false,
    revokedAt: Date.now(),
    revocationReason,
  });

  // Record revocation in audit trail
  const snap = await getDoc(signatureRef(signatureId));
  const sig = snap.data() as DigitalSignature;
  await createAuditEntry({
    timestamp: Date.now(),
    actor: revokedBy,
    actorName: '',
    actorRole: '',
    actorOrganizationId: sig.signedByOrganizationId,
    action: 'revoke_signature',
    resourceType: sig.documentType,
    resourceId: sig.documentId,
    previousValue: { signatureId, isValid: true },
    newValue: { signatureId, isValid: false, revocationReason },
    digitalSignatureId: signatureId,
    reason: revocationReason,
  });
}

// ── List Signatures for Document ──────────────────────────────────────────────

export async function getDocumentSignatures(
  documentType: string,
  documentId: string,
): Promise<DigitalSignature[]> {
  const q = query(
    signaturesCol(),
    where('documentType', '==', documentType),
    where('documentId', '==', documentId),
    orderBy('signedAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as DigitalSignature);
}

// ── List Signatures by Person ─────────────────────────────────────────────────

export async function getPersonSignatures(
  personId: AmxUid,
  maxResults?: number,
): Promise<DigitalSignature[]> {
  const constraints: any[] = [
    where('personId', '==', personId),
    orderBy('signedAt', 'desc'),
  ];
  if (maxResults) constraints.push(limit(maxResults));

  const q = query(signaturesCol(), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as DigitalSignature);
}
