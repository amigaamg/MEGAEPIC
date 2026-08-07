// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Asset Repository — Engine VI Persistence Abstraction
// The engine calls ONLY this interface. Today Firestore implements it; tomorrow a
// PostgresRepository can be the authoritative source of truth and a
// Neo4jProjection can listen for the relationship graph (Asset → LOCATED_IN → Dept
// → USED_BY → Clinician · SERVICED_BY → Biomedical · GENERATES → Service) with
// zero changes to the AssetIntelligenceEngine or the UI.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AssetModel } from './constitutional-types';

export interface AssetRepository {
  loadAll(): Promise<AssetModel | null>;
  save(model: AssetModel): Promise<void>;
}

/** Null repository — in-memory only, used for tests and offline mode. */
export class MemoryAssetRepository implements AssetRepository {
  private store = new Map<string, AssetModel>();

  async loadAll(): Promise<AssetModel | null> {
    return this.store.get(this.organizationId) ?? null;
  }
  async save(model: AssetModel): Promise<void> {
    this.organizationId = model.organizationId;
    this.store.set(model.organizationId, model);
  }
  private organizationId = '';
}