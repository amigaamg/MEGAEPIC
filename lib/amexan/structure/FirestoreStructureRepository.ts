// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Firestore Structure Repository — Engine I (current persistence lane)
// One doc per node under `organizations/{orgId}/structure/{nodeId}` with the
// parentId denormalised (enables both subtree queries and full-tree hydration).
// Every write is sanitised so `undefined` future-proof fields never break setDoc.
// Later, this same interface is re-implemented by a PostgresRepository
// (authoritative) + Neo4jProjection (graph), with no engine/UI changes.
// ═══════════════════════════════════════════════════════════════════════════════

import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeForFirestore } from '@/lib/firebase/sanitize';
import { StructureEngine } from './StructureEngine';
import type { StructureNode } from './types';
import type { StructureRepository } from './repository';

export class FirestoreStructureRepository implements StructureRepository {
  /** The organization this repository instance is scoped to. */
  constructor(private readonly organizationId: string) {}

  async loadAll(): Promise<StructureNode[]> {
    try {
      const snap = await getDocs(collection(db, `organizations/${this.organizationId}/structure`));
      return snap.docs.map((d) => d.data() as StructureNode);
    } catch {
      return [];
    }
  }

  async save(nodes: StructureNode[]): Promise<void> {
    if (nodes.length === 0) return;
    const batch = writeBatch(db);
    for (const node of nodes) {
      batch.set(doc(db, `organizations/${node.organizationId}/structure`, node.id), sanitizeForFirestore(node));
    }
    await batch.commit();
  }

  async remove(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    for (const id of ids) {
      batch.delete(doc(db, `organizations/${this.organizationId}/structure`, id));
    }
    await batch.commit();
  }
}

// ── High-level helpers used by the UI ─────────────────────────────────────────

export async function loadStructureTree(orgId: string): Promise<StructureNode[] | null> {
  const nodes = await new FirestoreStructureRepository(orgId).loadAll();
  return nodes.length === 0 ? null : nodes;
}

export async function ensureRootNode(orgId: string, name: string): Promise<StructureNode[]> {
  const repo = new FirestoreStructureRepository(orgId);
  const existing = await repo.loadAll();
  if (existing.some((n) => n.type === 'organization')) return existing;
  const root = StructureEngine.create(orgId, {
    type: 'organization',
    name: name || 'Hospital',
    parentId: null,
    status: 'active',
  });
  await repo.save([root]);
  return [root];
}

export function mutateStructure(nodes: StructureNode[], fn: (nodes: StructureNode[]) => StructureNode[]): StructureNode[] {
  return fn(nodes);
}