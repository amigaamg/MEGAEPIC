// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Communication Repository — Engine IV Persistence Abstraction
// The engine calls ONLY this interface. Today Firestore implements it; tomorrow a
// PostgresRepository can be the authoritative source of truth and a
// Neo4jProjection can listen for the relationship graph (Administrator → CREATED
// → Announcement → TARGETS → Department → READ_BY → Actor) with zero changes to
// the CommunicationEngine or the UI.
// ═══════════════════════════════════════════════════════════════════════════════

import type { CommunicationModel } from './constitutional-types';

export interface CommunicationRepository {
  /** Loads the full communication model for an organization. */
  loadAll(organizationId: string): Promise<CommunicationModel | null>;
  /** Persists the full model (upsert). */
  save(model: CommunicationModel): Promise<void>;
}

/** Null repository — in-memory only, used for tests and offline mode. */
export class MemoryCommunicationRepository implements CommunicationRepository {
  private store = new Map<string, CommunicationModel>();

  async loadAll(organizationId: string): Promise<CommunicationModel | null> {
    return this.store.get(organizationId) ?? null;
  }
  async save(model: CommunicationModel): Promise<void> {
    this.store.set(model.organizationId, model);
  }
}