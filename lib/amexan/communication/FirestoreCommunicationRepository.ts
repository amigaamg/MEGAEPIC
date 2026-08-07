// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Firestore Communication Repository — Engine IV (current persistence lane)
// One doc per organization: `organizations/{orgId}/communication/{current}`.
// Every write is sanitised so `undefined` future-proof fields never break setDoc.
// Later, this same interface is re-implemented by Postgres (authoritative) with
// a Neo4j projection — no engine/UI changes required.
// ═══════════════════════════════════════════════════════════════════════════════

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeForFirestore } from '@/lib/firebase/sanitize';
import type { CommunicationModel } from './constitutional-types';
import type { CommunicationRepository } from './repository';

const COLLECTION = 'communication';

export class FirestoreCommunicationRepository implements CommunicationRepository {
  /** The organization this repository instance is scoped to. */
  constructor(private readonly organizationId: string) {}

  private ref() {
    return doc(db, 'organizations', this.organizationId, COLLECTION, 'current');
  }

  async loadAll(): Promise<CommunicationModel | null> {
    try {
      const snap = await getDoc(this.ref());
      if (!snap.exists()) return null;
      const data = snap.data() as CommunicationModel;
      return { ...data, organizationId: this.organizationId };
    } catch {
      return null;
    }
  }

  async save(model: CommunicationModel): Promise<void> {
    await setDoc(this.ref(), sanitizeForFirestore({ ...model, updatedAt: Date.now() }));
  }
}

// ── High-level helpers used by the UI ─────────────────────────────────────────

export async function loadCommunicationModel(orgId: string): Promise<CommunicationModel | null> {
  return new FirestoreCommunicationRepository(orgId).loadAll();
}

export async function saveCommunicationModel(model: CommunicationModel): Promise<void> {
  await new FirestoreCommunicationRepository(model.organizationId).save(model);
}