// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN KNOWLEDGE CENTER ENGINE (BOOK VIII — Center 4)
//
// Powers Clinical Intelligence. Contains protocols, guidelines, books, journals,
// teaching, research, evidence, AI reasoning, flows, algorithms, and disease
// graphs.
//
// Stored almost entirely in Neo4j because relationships matter. Instead of
// searching PDFs, AMEXAN traverses graphs:
//
//   Chest Pain → ACS → ECG → Troponin → STEMI → Cath Lab
//
// The patient graph, the symptom graph, the drug graph, the pathway graph —
// every node and every edge carries weight and evidence. This is the substrate
// the Clinical AI reasons over.
//
// Pure and deterministic. Persistence is orchestrated by the conductor.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { ClinicalProtocol, EvidenceSource, KnowledgeEdge, KnowledgeModel, KnowledgeNode } from './types';

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface CreateKnowledgeInput {
  organizationId?: string;
}

export class KnowledgeEngine {
  static create(input: CreateKnowledgeInput = {}): KnowledgeModel {
    return {
      organizationId: input.organizationId,
      nodes: {},
      edges: [],
      protocols: [],
      evidence: [],
      updatedAt: Date.now(),
    };
  }

  // ── Graph nodes ──────────────────────────────────────────────────────────────

  static addNode(model: KnowledgeModel, node: Omit<KnowledgeNode, 'id'>): KnowledgeModel {
    const id = nextId('kn');
    return { ...model, nodes: { ...model.nodes, [id]: { ...node, id } }, updatedAt: Date.now() };
  }

  static upsertNode(model: KnowledgeModel, node: KnowledgeNode): KnowledgeModel {
    return { ...model, nodes: { ...model.nodes, [node.id]: node }, updatedAt: Date.now() };
  }

  static findNode(model: KnowledgeModel, kind: string, label: string): KnowledgeNode | undefined {
    return Object.values(model.nodes).find(n => n.kind === kind && (n.label.toLowerCase() === label.toLowerCase() || n.aliases.some(a => a.toLowerCase() === label.toLowerCase())));
  }

  static getOrCreateNode(model: KnowledgeModel, kind: string, label: string): { model: KnowledgeModel; node: KnowledgeNode } {
    const existing = KnowledgeEngine.findNode(model, kind, label);
    if (existing) return { model, node: existing };
    return KnowledgeEngine.addNodeResult(model, kind, label);
  }

  private static addNodeResult(model: KnowledgeModel, kind: string, label: string): { model: KnowledgeModel; node: KnowledgeNode } {
    const node: KnowledgeNode = { id: nextId('kn'), kind, label, aliases: [], attributes: {} };
    return { model: { ...model, nodes: { ...model.nodes, [node.id]: node }, updatedAt: Date.now() }, node };
  }

  // ── Graph edges ──────────────────────────────────────────────────────────────

  static addEdge(model: KnowledgeModel, input: Omit<KnowledgeEdge, 'id'>): KnowledgeModel {
    if (!model.nodes[input.from] || !model.nodes[input.to]) {
      throw new Error(`[KnowledgeEngine] Edge references unknown node (${input.from} → ${input.to})`);
    }
    const duplicate = model.edges.some(e => e.from === input.from && e.to === input.to && e.relation === input.relation);
    if (duplicate) return model; // idempotent
    return { ...model, edges: [...model.edges, { ...input, id: nextId('ke') }], updatedAt: Date.now() };
  }

  /** Link two concepts, auto-creating the nodes when absent. */
  static link(model: KnowledgeModel, from: { kind: string; label: string }, relation: string, to: { kind: string; label: string }, weight = 1, evidence: string[] = []): KnowledgeModel {
    const fromResult = KnowledgeEngine.getOrCreateNode(model, from.kind, from.label);
    const toResult = KnowledgeEngine.getOrCreateNode(fromResult.model, to.kind, to.label);
    return KnowledgeEngine.addEdge(toResult.model, { from: fromResult.node.id, to: toResult.node.id, relation, weight, evidence });
  }

  // ── Graph traversal (constitutional reasoning) ───────────────────────────────

  /** Breadth-first traversal from a starting node over matching relations. */
  static traverse(model: KnowledgeModel, startLabel: string, relation?: string, maxDepth = 3): { node: KnowledgeNode; path: string[]; depth: number }[] {
    const start = Object.values(model.nodes).find(n => n.label.toLowerCase() === startLabel.toLowerCase());
    if (!start) return [];
    const results: { node: KnowledgeNode; path: string[]; depth: number }[] = [];
    const visited = new Set<string>([start.id]);
    let frontier: { nodeId: string; path: string[]; depth: number }[] = [{ nodeId: start.id, path: [start.label], depth: 0 }];
    while (frontier.length && frontier[0].depth < maxDepth) {
      const nextFrontier: { nodeId: string; path: string[]; depth: number }[] = [];
      for (const item of frontier) {
        for (const edge of model.edges) {
          const targets: { nodeId: string; relation: string }[] = [];
          if (edge.from === item.nodeId) targets.push({ nodeId: edge.to, relation: edge.relation });
          if (edge.to === item.nodeId) targets.push({ nodeId: edge.from, relation: edge.relation });
          for (const target of targets) {
            if (relation && target.relation !== relation) continue;
            if (visited.has(target.nodeId)) continue;
            visited.add(target.nodeId);
            const node = model.nodes[target.nodeId];
            const path = [...item.path, target.relation, node.label];
            results.push({ node, path, depth: item.depth + 1 });
            nextFrontier.push({ nodeId: target.nodeId, path, depth: item.depth + 1 });
          }
        }
      }
      frontier = nextFrontier;
    }
    return results;
  }

  /** Reasoning path builder — e.g. "Chest Pain → suggests → ACS → requires → ECG". */
  static reason(model: KnowledgeModel, startLabel: string): string[] {
    const hits = KnowledgeEngine.traverse(model, startLabel, undefined, 5);
    const paths = hits
      .filter(h => h.node.kind === 'condition' || h.node.kind === 'diagnosis' || h.node.kind === 'investigation' || h.node.kind === 'treatment')
      .map(h => h.path.join(' → '))
      .slice(0, 8);
    return paths;
  }

  // ── Protocols ────────────────────────────────────────────────────────────────

  static addProtocol(model: KnowledgeModel, protocol: Omit<ClinicalProtocol, 'id' | 'active'>): KnowledgeModel {
    return { ...model, protocols: [...model.protocols, { ...protocol, id: nextId('proto'), active: true }], updatedAt: Date.now() };
  }

  static getActiveProtocol(model: KnowledgeModel, specialty: string): ClinicalProtocol[] {
    return model.protocols.filter(p => p.active && p.specialty === specialty);
  }

  static archiveProtocol(model: KnowledgeModel, protocolId: string): KnowledgeModel {
    const protocols = model.protocols.map(p => (p.id === protocolId ? { ...p, active: false } : p));
    return { ...model, protocols, updatedAt: Date.now() };
  }

  // ── Evidence ─────────────────────────────────────────────────────────────────

  static addEvidence(model: KnowledgeModel, evidence: Omit<EvidenceSource, 'id'>): KnowledgeModel {
    return { ...model, evidence: [...model.evidence, { ...evidence, id: nextId('ev') }], updatedAt: Date.now() };
  }

  static getEvidenceByTopic(model: KnowledgeModel, query: string): EvidenceSource[] {
    const q = query.toLowerCase();
    return model.evidence.filter(e => e.title.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q));
  }

  // ── Convenience ──────────────────────────────────────────────────────────────

  static getDashboardSummary(model: KnowledgeModel): { nodes: number; edges: number; protocols: number; evidence: number } {
    return {
      nodes: Object.keys(model.nodes).length,
      edges: model.edges.length,
      protocols: model.protocols.filter(p => p.active).length,
      evidence: model.evidence.length,
    };
  }
}

export default KnowledgeEngine;
