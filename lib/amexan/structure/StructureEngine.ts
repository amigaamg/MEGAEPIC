// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Structure Engine — Engine I (Organization Structure) — PURE KERNEL
// The engine has ZERO knowledge of Firestore, Postgres, or Neo4j. It resolves
// every structural operation against the constitutional Node Registry and a
// flat `StructureNode[]` array. Persistence lives behind the Repository, so the
// source-of-truth can move (Firestore → Postgres) and a graph projection
// (Neo4j) can be added without touching any engine logic.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  NODE_TYPE_IDS,
  childrenOf,
  getNodeType,
  isAllowedChild,
  typeLabel,
} from './nodeTypes';
import type {
  CreateStructureNodeInput,
  StructureNode,
  StructureTreeNode,
} from './types';

/** Stable short id built from a prefix + time + entropy. */
export function genNodeId(prefix = 'STR'): string {
  return `AMX-${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function genCode(type: string, name: string, index: number): string {
  const prefix = getNodeType(type)?.codePrefix ?? 'NODE';
  const slug = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'X';
  const seq = String(index).padStart(2, '0');
  return `${prefix}-${slug}-${seq}`;
}

export class StructureEngine {
  // ── Validation ───────────────────────────────────────────────────────────────

  static canHaveChild(parentType: string, childType: string): boolean {
    return isAllowedChild(parentType, childType);
  }

  static isRegistered(type: string): boolean {
    return NODE_TYPE_IDS.includes(type);
  }

  // ── Creation ───────────────────────────────────────────────────────────────

  static create(orgId: string, input: CreateStructureNodeInput): StructureNode {
    if (!input.type) throw new Error('[StructureEngine] type is required');
    if (!StructureEngine.isRegistered(input.type)) {
      throw new Error(`[StructureEngine] Unknown node type "${input.type}". Register it in the Node Registry.`);
    }
    if (input.parentId === null && input.type !== 'organization') {
      throw new Error('[StructureEngine] Only an organization node may be the root.');
    }
    const typeDef = getNodeType(input.type);
    const now = Date.now();
    return {
      id: genNodeId(),
      organizationId: orgId,
      parentId: input.parentId ?? null,
      type: input.type,
      name: input.name.trim(),
      code: '',
      status: input.status ?? 'planned',
      order: 0,
      capacity: input.capacity ?? typeDef?.defaultCapacity,
      createdAt: now,
      updatedAt: now,
    };
  }

  /** Creates a node against an existing tree (validates parent + assigns order/code). */
  static createNode(nodes: StructureNode[], orgId: string, parentId: string | null, input: CreateStructureNodeInput): StructureNode {
    const node = StructureEngine.create(orgId, input);
    if (parentId !== null) {
      const parent = nodes.find((n) => n.id === parentId);
      if (!parent) throw new Error(`[StructureEngine] Parent "${parentId}" not found.`);
      if (!isAllowedChild(parent.type, node.type)) {
        throw new Error(`[StructureEngine] A ${typeLabel(parent.type)} cannot contain a ${typeLabel(node.type)}.`);
      }
      node.parentId = parentId;
      node.order = nodes.filter((n) => n.parentId === parentId).length;
    }
    node.code = genCode(node.type, node.name, node.order);
    return node;
  }

  // ── Mutations (return a NEW array, pure) ──────────────────────────────────

  static rename(nodes: StructureNode[], id: string, name: string): StructureNode[] {
    const clean = name.trim();
    if (!clean) return nodes;
    return nodes.map((n) =>
      n.id === id
        ? { ...n, name: clean, code: genCode(n.type, clean, n.order), updatedAt: Date.now() }
        : n
    );
  }

  static setStatus(nodes: StructureNode[], id: string, status: StructureNode['status']): StructureNode[] {
    return nodes.map((n) => (n.id === id ? { ...n, status, updatedAt: Date.now() } : n));
  }

  static setCapacity(nodes: StructureNode[], id: string, capacity: number): StructureNode[] {
    return nodes.map((n) => (n.id === id ? { ...n, capacity, updatedAt: Date.now() } : n));
  }

  /** Removes a node and all of its descendants (cascade). */
  static remove(nodes: StructureNode[], id: string): StructureNode[] {
    const doomed = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const n of nodes) {
        if (n.parentId && doomed.has(n.parentId) && !doomed.has(n.id)) {
          doomed.add(n.id);
          changed = true;
        }
      }
    }
    return nodes.filter((n) => !doomed.has(n.id));
  }

  /** Re-parents `id` to `newParentId` (null = root) with cycle + type guards. */
  static move(nodes: StructureNode[], id: string, newParentId: string | null): StructureNode[] {
    const node = nodes.find((n) => n.id === id);
    if (!node || node.id === newParentId) return nodes;

    if (newParentId) {
      if (StructureEngine.isDescendant(nodes, id, newParentId)) return nodes;
      const newParent = nodes.find((n) => n.id === newParentId);
      if (newParent && !isAllowedChild(newParent.type, node.type)) {
        throw new Error(`[StructureEngine] A ${typeLabel(newParent.type)} cannot contain a ${typeLabel(node.type)}.`);
      }
    } else if (node.type !== 'organization') {
      throw new Error('[StructureEngine] Only an organization node may be the root.');
    }

    return nodes.map((n) =>
      n.id === id
        ? {
            ...n,
            parentId: newParentId,
            order: newParentId === null ? 0 : nodes.filter((x) => x.parentId === newParentId).length,
            updatedAt: Date.now(),
          }
        : n
    );
  }

  /** Reorders a node within its siblings (drag-and-drop ordering). */
  static reorder(nodes: StructureNode[], id: string, targetIndex: number): StructureNode[] {
    const node = nodes.find((n) => n.id === id);
    if (!node) return nodes;
    const siblings = nodes
      .filter((n) => n.parentId === node.parentId)
      .slice()
      .sort((a, b) => a.order - b.order);
    const from = siblings.findIndex((s) => s.id === id);
    if (from === -1) return nodes;
    siblings.splice(from, 1);
    const clamped = Math.max(0, Math.min(targetIndex, siblings.length));
    siblings.splice(clamped, 0, node);
    const orderMap = new Map<string, number>();
    siblings.forEach((s, i) => orderMap.set(s.id, i));
    return nodes.map((n) => {
      if (!orderMap.has(n.id)) return n;
      return { ...n, order: orderMap.get(n.id)!, updatedAt: n.id === id ? Date.now() : n.updatedAt };
    });
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  static findById(nodes: StructureNode[], id: string): StructureNode | undefined {
    return nodes.find((n) => n.id === id);
  }

  static childrenOf(nodes: StructureNode[], parentId: string | null): StructureNode[] {
    return nodes
      .filter((n) => n.parentId === parentId)
      .slice()
      .sort((a, b) => a.order - b.order);
  }

  static isDescendant(nodes: StructureNode[], ancestorId: string, probedId: string): boolean {
    let current = nodes.find((n) => n.id === probedId);
    let guard = 0;
    while (current && guard < 1000) {
      if (current.parentId === ancestorId) return true;
      current = current.parentId ? nodes.find((n) => n.id === current!.parentId) : undefined;
      guard++;
    }
    return false;
  }

  static descendants(nodes: StructureNode[], id: string): string[] {
    const out: string[] = [];
    const stack = [...StructureEngine.childrenOf(nodes, id)];
    while (stack.length) {
      const c = stack.pop()!;
      out.push(c.id);
      stack.push(...StructureEngine.childrenOf(nodes, c.id));
    }
    return out;
  }

  /** Materialises the flat array into a rooted tree. */
  static materialize(nodes: StructureNode[]): StructureTreeNode[] {
    const byId = new Map<string, StructureTreeNode>();
    nodes.forEach((n) => byId.set(n.id, { ...n, children: [] }));
    const roots: StructureTreeNode[] = [];
    byId.forEach((node) => {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    const sort = (list: StructureTreeNode[]) => list.sort((a, b) => a.order - b.order);
    const recurse = (list: StructureTreeNode[]) => {
      sort(list);
      list.forEach((n) => recurse(n.children));
    };
    recurse(roots);
    return roots;
  }

  /** Human-readable breadcrumb path to a node (e.g. "Hospital / Ward 3B / Bed 12"). */
  static path(nodes: StructureNode[], id: string): string[] {
    const path: string[] = [];
    let cur = nodes.find((n) => n.id === id);
    let guard = 0;
    while (cur && guard < 1000) {
      path.unshift(cur.name);
      cur = cur.parentId ? nodes.find((n) => n.id === cur!.parentId) : undefined;
      guard++;
    }
    return path;
  }

  static counts(nodes: StructureNode[]): Record<string, number> {
    const out: Record<string, number> = {};
    nodes.forEach((n) => { out[n.type] = (out[n.type] ?? 0) + 1; });
    return out;
  }

  /** Flat depth-ordered list of visible rows (for virtual rendering). */
  static flattenVisible(
    nodes: StructureNode[],
    expanded: Set<string>
  ): { node: StructureNode; depth: number }[] {
    const rows: { node: StructureNode; depth: number }[] = [];
    const roots = StructureEngine.childrenOf(nodes, null);
    const push = (children: StructureNode[], depth: number) => {
      for (const c of children) {
        rows.push({ node: c, depth });
        if (expanded.has(c.id)) {
          push(StructureEngine.childrenOf(nodes, c.id), depth + 1);
        }
      }
    };
    push(roots, 0);
    return rows;
  }
}
