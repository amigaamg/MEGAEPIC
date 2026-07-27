// ═══════════════════════════════════════════════════════════════
// AMEXAN CLINICAL CONSTITUTION — BOOK VII–VIII, XIII
// KNOWLEDGE GRAPH ENGINE
// Everything is nodes: symptoms, mechanisms, phenotypes, diseases,
// investigations, treatments. Relationships connect all knowledge.
// ═══════════════════════════════════════════════════════════════

import type {
  KnowledgeGraph, KnowledgeNode, KnowledgeNodeType,
  KnowledgeRelationship, KnowledgeRelationshipType,
  DiseaseObject,
} from './clinical-knowledge-constitution';
import type { FactObject, MechanismCategoryUniversal } from './hpi-constitution';

let nodeCounter = 0;
function nextNodeId(prefix: string): string { return `${prefix}_${++nodeCounter}`; }

// ─────────────────────────────────────────────────────────────────
// BOOK VII: KNOWLEDGE GRAPH CONSTRUCTION
// ─────────────────────────────────────────────────────────────────

export function createEmptyKnowledgeGraph(): KnowledgeGraph {
  return {
    nodes: new Map(),
    relationships: [],
    version: '1.0.0',
  };
}

export function addNode(graph: KnowledgeGraph, type: KnowledgeNodeType, label: string, weight: number = 1.0, metadata: Record<string, unknown> = {}): KnowledgeGraph {
  const node: KnowledgeNode = {
    id: nextNodeId(type),
    type, label, weight, metadata,
  };
  const newNodes = new Map(graph.nodes);
  newNodes.set(node.id, node);
  return { ...graph, nodes: newNodes };
}

export function addRelationship(
  graph: KnowledgeGraph,
  sourceId: string,
  targetId: string,
  type: KnowledgeRelationshipType,
  strength: number = 1.0,
  evidence: KnowledgeRelationship['evidence'] = 'expert_opinion',
): KnowledgeGraph {
  return {
    ...graph,
    relationships: [...graph.relationships, { sourceId, targetId, type, strength, evidence }],
  };
}

export function findNodesByType(graph: KnowledgeGraph, type: KnowledgeNodeType): KnowledgeNode[] {
  return Array.from(graph.nodes.values()).filter(n => n.type === type);
}

export function findRelationshipsFrom(graph: KnowledgeGraph, nodeId: string): KnowledgeRelationship[] {
  return graph.relationships.filter(r => r.sourceId === nodeId);
}

export function findRelationshipsTo(graph: KnowledgeGraph, nodeId: string): KnowledgeRelationship[] {
  return graph.relationships.filter(r => r.targetId === nodeId);
}

export function traverseGraph(graph: KnowledgeGraph, startNodeId: string, relationshipType?: KnowledgeRelationshipType, maxDepth: number = 3): KnowledgeNode[] {
  const visited = new Set<string>();
  const result: KnowledgeNode[] = [];
  const queue: { nodeId: string; depth: number }[] = [{ nodeId: startNodeId, depth: 0 }];

  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift()!;
    if (visited.has(nodeId) || depth > maxDepth) continue;
    visited.add(nodeId);

    const node = graph.nodes.get(nodeId);
    if (node) result.push(node);

    const rels = relationshipType
      ? graph.relationships.filter(r => r.sourceId === nodeId && r.type === relationshipType)
      : graph.relationships.filter(r => r.sourceId === nodeId);

    for (const rel of rels) {
      if (!visited.has(rel.targetId)) {
        queue.push({ nodeId: rel.targetId, depth: depth + 1 });
      }
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────
// BOOK VIII: DISEASE GRAPH — build graph from disease objects
// ─────────────────────────────────────────────────────────────────

export function buildDiseaseKnowledgeGraph(diseases: DiseaseObject[]): KnowledgeGraph {
  let graph = createEmptyKnowledgeGraph();

  for (const disease of diseases) {
    graph = addNode(graph, 'disease', disease.name, 1.0, {
      icd10: disease.icd10, snomed: disease.snomed,
      emergencyLevel: disease.emergencyLevel,
    });
    const diseaseNodeId = Array.from(graph.nodes.values()).find(n => n.label === disease.name)!.id;

    for (const mech of disease.mechanisms) {
      const existingMechNode = Array.from(graph.nodes.values()).find(n => n.label === mech);
      const mechNodeId = existingMechNode?.id ?? (() => {
        graph = addNode(graph, 'mechanism', mech as string, 0.8);
        return Array.from(graph.nodes.values()).find(n => n.label === mech)!.id;
      })();
      graph = addRelationship(graph, diseaseNodeId, mechNodeId, 'supports', 1.0, 'gold_standard');
    }

    for (const symptom of disease.symptoms) {
      graph = addNode(graph, 'symptom', symptom.symptomId, symptom.discriminatingValue);
      const symptomNodeId = Array.from(graph.nodes.values()).find(n => n.label === symptom.symptomId)!.id;
      graph = addRelationship(graph, symptomNodeId, diseaseNodeId, 'supports', symptom.discriminatingValue, 'guideline');
    }

    for (const phenotype of disease.phenotypes) {
      const phenotypeId = `${disease.id}_${phenotype.name.replace(/\s+/g, '_')}`;
      graph = addNode(graph, 'phenotype', phenotype.name, phenotype.prevalence);
      const phenotypeNodeId = Array.from(graph.nodes.values()).find(n => n.label === phenotype.name)!.id;
      graph = addRelationship(graph, phenotypeNodeId, diseaseNodeId, 'supports', phenotype.prevalence, 'guideline');
    }

    for (const inv of disease.investigations) {
      const existingInvNode = Array.from(graph.nodes.values()).find(n => n.label === inv.investigationId);
      const invNodeId = existingInvNode?.id ?? (() => {
        graph = addNode(graph, 'investigation', inv.investigationId, inv.sensitivity);
        return Array.from(graph.nodes.values()).find(n => n.label === inv.investigationId)!.id;
      })();
      graph = addRelationship(graph, diseaseNodeId, invNodeId, 'diagnosed_by', inv.sensitivity, 'guideline');
    }

    for (const diffId of disease.differentials) {
      const diffDisease = diseases.find(d => d.id === diffId);
      if (diffDisease) {
        const diffNodeId = Array.from(graph.nodes.values()).find(n => n.label === diffDisease.name)!.id;
        graph = addRelationship(graph, diseaseNodeId, diffNodeId, 'differentiate', 0.5, 'expert_opinion');
      }
    }
  }

  return graph;
}

// ─────────────────────────────────────────────────────────────────
// BOOK XIII: REASONING CHAIN — traverse evidence to diagnosis
// ─────────────────────────────────────────────────────────────────

export interface ReasoningStep {
  layer: string;
  nodeIds: string[];
  evidenceIds: string[];
  confidence: number;
  activatedById: string[];
}

export interface ReasoningPath {
  steps: ReasoningStep[];
  finalDiseaseId: string | null;
  score: number;
  isComplete: boolean;
}

export function buildReasoningChain(
  graph: KnowledgeGraph,
  facts: FactObject[],
  activeMechanisms: MechanismCategoryUniversal[],
  diseases: DiseaseObject[],
): ReasoningPath {
  const steps: ReasoningStep[] = [];

  const mechanismNodes = activeMechanisms
    .map(m => Array.from(graph.nodes.values()).find(n => n.type === 'mechanism' && n.label === m))
    .filter((n): n is KnowledgeNode => !!n);

  steps.push({
    layer: 'mechanism',
    nodeIds: mechanismNodes.map(n => n.id),
    evidenceIds: facts.map(f => f.id),
    confidence: mechanismNodes.length > 0 ? Math.min(mechanismNodes.length * 0.2, 0.8) : 0,
    activatedById: [],
  });

  const phenotypeIds = new Set<string>();
  for (const mechNode of mechanismNodes) {
    const phenoRels = findRelationshipsTo(graph, mechNode.id).filter(r => {
      const target = graph.nodes.get(r.sourceId);
      return target?.type === 'phenotype';
    });
    for (const rel of phenoRels) phenotypeIds.add(rel.sourceId);
  }

  steps.push({
    layer: 'phenotype',
    nodeIds: Array.from(phenotypeIds),
    evidenceIds: facts.map(f => f.id),
    confidence: phenotypeIds.size > 0 ? Math.min(phenotypeIds.size * 0.25, 0.8) : 0,
    activatedById: mechanismNodes.map(n => n.id),
  });

  const scoredDiseases: { diseaseId: string; score: number; evidenceIds: string[] }[] = [];

  for (const disease of diseases) {
    const diseaseNode = Array.from(graph.nodes.values()).find(n => n.type === 'disease' && n.label === disease.name);
    if (!diseaseNode) continue;

    let score = 0;
    const matchingEvidence: string[] = [];

    for (const fact of facts) {
      const symptomNode = Array.from(graph.nodes.values()).find(n =>
        n.type === 'symptom' && n.label === fact.symptomId,
      );
      if (!symptomNode) continue;
      const relsFrom = findRelationshipsFrom(graph, symptomNode.id);
      const matching = relsFrom.find(r => r.targetId === diseaseNode.id);
      if (matching) {
        score += matching.strength * fact.confidence;
        matchingEvidence.push(fact.id);
      }
    }

    const mechOverlap = disease.mechanisms.filter(m => activeMechanisms.includes(m));
    score += mechOverlap.length * 0.15;

    const scoring = { diseaseId: disease.id, score, evidenceIds: matchingEvidence };
    scoredDiseases.push(scoring);
  }

  scoredDiseases.sort((a, b) => b.score - a.score);

  const diseaseStep = scoredDiseases.length > 0 ? {
    layer: 'disease' as const,
    nodeIds: scoredDiseases.map(s => {
      const node = Array.from(graph.nodes.values()).find(n => n.type === 'disease' && n.label === diseases.find(d => d.id === s.diseaseId)?.name);
      return node?.id ?? '';
    }).filter(Boolean),
    evidenceIds: scoredDiseases.flatMap(s => s.evidenceIds),
    confidence: scoredDiseases[0]?.score ?? 0,
    activatedById: Array.from(phenotypeIds),
  } : null;

  if (diseaseStep) steps.push(diseaseStep);

  return {
    steps,
    finalDiseaseId: scoredDiseases[0]?.diseaseId ?? null,
    score: scoredDiseases[0]?.score ?? 0,
    isComplete: scoredDiseases.length > 0 && scoredDiseases[0].score > 0.5,
  };
}
