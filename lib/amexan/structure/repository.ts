// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Structure Repository — Engine I Persistence Abstraction
// The engine calls ONLY this interface. Today Firestore implements it. Tomorrow
// a PostgresRepository can become the authoritative source of truth, and a
// Neo4jProjection can listen to the same mutations for the relationship graph —
// with zero changes to the StructureEngine or the UI.
// ═══════════════════════════════════════════════════════════════════════════════

import type { StructureNode } from './types';

export interface StructureRepository {
  /** Loads the full structural tree for an organization. */
  loadAll(organizationId: string): Promise<StructureNode[]>;
  /** Persists a set of nodes (upsert). */
  save(nodes: StructureNode[]): Promise<void>;
  /** Deletes nodes by id. */
  remove(ids: string[]): Promise<void>;
}

/** Null repository — in-memory only, used for tests and offline mode. */
export class MemoryStructureRepository implements StructureRepository {
  private store = new Map<string, StructureNode>();

  async loadAll(): Promise<StructureNode[]> {
    return Array.from(this.store.values());
  }
  async save(nodes: StructureNode[]): Promise<void> {
    nodes.forEach((n) => this.store.set(n.id, { ...n }));
  }
  async remove(ids: string[]): Promise<void> {
    ids.forEach((id) => this.store.delete(id));
  }
}
