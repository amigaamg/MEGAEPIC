// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Firestore Asset Intelligence Repository — Engine VI (current lane)
// One doc per organization: `organizations/{orgId}/assets/{current}`.
// Every write is sanitised so `undefined` future-proof fields never break setDoc.
// Later, this same interface is re-implemented by Postgres (authoritative) with a
// Neo4j projection for the relationship graph — no engine/UI changes required.
// ═══════════════════════════════════════════════════════════════════════════════

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeForFirestore } from '@/lib/firebase/sanitize';
import type { AssetModel } from './constitutional-types';
import type { AssetRepository } from './repository';

const COLLECTION = 'assets';

export class FirestoreAssetRepository implements AssetRepository {
  constructor(private readonly organizationId: string) {}

  private ref() {
    return doc(db, 'organizations', this.organizationId, COLLECTION, 'current');
  }

  async loadAll(): Promise<AssetModel | null> {
    try {
      const snap = await getDoc(this.ref());
      if (!snap.exists()) return null;
      const data = snap.data() as AssetModel;
      return { ...data, organizationId: this.organizationId };
    } catch {
      return null;
    }
  }

  async save(model: AssetModel): Promise<void> {
    await setDoc(this.ref(), sanitizeForFirestore({ ...model, updatedAt: Date.now() }));
  }
}

export async function loadAssetModel(orgId: string): Promise<AssetModel | null> {
  return new FirestoreAssetRepository(orgId).loadAll();
}

export async function saveAssetModel(model: AssetModel): Promise<void> {
  await new FirestoreAssetRepository(model.organizationId).save(model);
}