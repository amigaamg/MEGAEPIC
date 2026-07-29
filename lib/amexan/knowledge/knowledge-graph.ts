import { KnowledgePackage, PackageObject, PackageRelationship } from '@/lib/amexan/constitution/books/book-VII-knowledge-compiler';
import { ObjectType } from '@/lib/amexan/constitution/books/book-I-objects';
import { RelationshipType } from '@/lib/amexan/constitution/books/book-II-relationships';
import { knowledgeRegistry } from './knowledge-registry';

export interface GraphNode {
  id: string;
  name: string;
  type: ObjectType;
  packageId: string;
  properties: Record<string, unknown>;
  relationships: GraphEdge[];
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  evidence?: string;
  confidence?: number;
}

export interface GraphQuery {
  sourceType?: ObjectType;
  targetType?: ObjectType;
  relationshipType?: RelationshipType;
  sourceId?: string;
  targetId?: string;
  packageId?: string;
}

export interface KnowledgePath {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalConfidence: number;
}

export class KnowledgeGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];

  build(packages: KnowledgePackage[]): void {
    this.nodes.clear();
    this.edges = [];

    for (const pkg of packages) {
      for (const obj of pkg.objects) {
        const node: GraphNode = {
          id: obj.id,
          name: obj.name,
          type: obj.type,
          packageId: pkg.id,
          properties: obj.properties,
          relationships: [],
        };
        this.nodes.set(obj.id, node);
      }

      for (const rel of pkg.relationships) {
        const edge: GraphEdge = {
          sourceId: rel.sourceId,
          targetId: rel.targetId,
          type: rel.type,
          evidence: rel.evidence,
          confidence: rel.confidence,
        };
        this.edges.push(edge);

        const sourceNode = this.nodes.get(rel.sourceId);
        if (sourceNode) sourceNode.relationships.push(edge);

        const targetNode = this.nodes.get(rel.targetId);
        if (targetNode) targetNode.relationships.push(edge);
      }
    }
  }

  rebuildFromRegistry(): void {
    this.build(knowledgeRegistry.getAll());
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getNodesByType(type: ObjectType): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  getEdges(query: GraphQuery): GraphEdge[] {
    return this.edges.filter(e => {
      if (query.sourceType || query.targetType) {
        const source = this.nodes.get(e.sourceId);
        const target = this.nodes.get(e.targetId);
        if (query.sourceType && source?.type !== query.sourceType) return false;
        if (query.targetType && target?.type !== query.targetType) return false;
      }
      if (query.relationshipType && e.type !== query.relationshipType) return false;
      if (query.sourceId && e.sourceId !== query.sourceId) return false;
      if (query.targetId && e.targetId !== query.targetId) return false;
      return true;
    });
  }

  getOutgoingEdges(nodeId: string): GraphEdge[] {
    return this.edges.filter(e => e.sourceId === nodeId);
  }

  getIncomingEdges(nodeId: string): GraphEdge[] {
    return this.edges.filter(e => e.targetId === nodeId);
  }

  getConnectedNodes(nodeId: string): GraphNode[] {
    const connectedIds = new Set<string>();
    for (const edge of this.edges) {
      if (edge.sourceId === nodeId) connectedIds.add(edge.targetId);
      if (edge.targetId === nodeId) connectedIds.add(edge.sourceId);
    }
    return Array.from(connectedIds).map(id => this.nodes.get(id)!);
  }

  getDiseaseFromSymptom(symptomId: string): KnowledgePath {
    const path: KnowledgePath = { nodes: [], edges: [], totalConfidence: 1 };
    const symptom = this.nodes.get(symptomId);
    if (!symptom) return path;

    path.nodes.push(symptom);
    const toMechanism = this.getOutgoingEdges(symptomId).filter(e => e.type === RelationshipType.HasMechanism);
    for (const edge of toMechanism) {
      path.edges.push(edge);
      const mechanism = this.nodes.get(edge.targetId);
      if (mechanism) {
        path.nodes.push(mechanism);
        path.totalConfidence *= (edge.confidence ?? 0.8);

        const toDisease = this.getOutgoingEdges(edge.targetId).filter(e => e.type === RelationshipType.SuggestsDisease);
        for (const de of toDisease) {
          path.edges.push(de);
          const disease = this.nodes.get(de.targetId);
          if (disease) {
            path.nodes.push(disease);
            path.totalConfidence *= (de.confidence ?? 0.8);
          }
        }
      }
    }

    return path;
  }

  getDifferentials(symptomId: string): Array<{ disease: GraphNode; confidence: number; path: GraphEdge[] }> {
    const results: Array<{ disease: GraphNode; confidence: number; path: GraphEdge[] }> = [];
    const seenDiseases = new Set<string>();

    // Path 1: symptom → disease (direct suggestion)
    const directEdges = this.getOutgoingEdges(symptomId).filter(e => e.type === RelationshipType.SuggestsDisease);
    for (const edge of directEdges) {
      const disease = this.nodes.get(edge.targetId);
      if (disease && !seenDiseases.has(disease.id)) {
        seenDiseases.add(disease.id);
        results.push({ disease, confidence: edge.confidence ?? 0.5, path: [edge] });
      }
    }

    // Path 2: symptom → mechanism → disease
    const mechanismEdges = this.getOutgoingEdges(symptomId).filter(e => e.type === RelationshipType.HasMechanism);
    for (const me of mechanismEdges) {
      const mechanism = this.nodes.get(me.targetId);
      if (!mechanism) continue;
      const diseaseEdges = this.getOutgoingEdges(me.targetId).filter(e => e.type === RelationshipType.SuggestsDisease);
      for (const de of diseaseEdges) {
        const disease = this.nodes.get(de.targetId);
        if (disease && !seenDiseases.has(disease.id)) {
          seenDiseases.add(disease.id);
          results.push({ disease, confidence: (me.confidence ?? 0.7) * (de.confidence ?? 0.7), path: [me, de] });
        }
      }
    }

    // Path 3: symptom → mechanism → phenotype → disease
    for (const me of mechanismEdges) {
      const mechanism = this.nodes.get(me.targetId);
      if (!mechanism) continue;
      const phenotypeEdges = this.getOutgoingEdges(me.targetId).filter(e => e.type === RelationshipType.ProducesPhenotype);
      for (const pe of phenotypeEdges) {
        const phenotype = this.nodes.get(pe.targetId);
        if (!phenotype) continue;
        const diseaseEdges = this.getOutgoingEdges(phenotype.id).filter(e => e.type === RelationshipType.SuggestsDisease);
        for (const de of diseaseEdges) {
          const disease = this.nodes.get(de.targetId);
          if (disease && !seenDiseases.has(disease.id)) {
            seenDiseases.add(disease.id);
            results.push({
              disease,
              confidence: (me.confidence ?? 0.7) * (pe.confidence ?? 0.7) * (de.confidence ?? 0.7),
              path: [me, pe, de],
            });
          }
        }
      }
    }

    results.sort((a, b) => b.confidence - a.confidence);
    return results;
  }

  getInvestigationsForDisease(diseaseId: string): GraphNode[] {
    const edges = this.getOutgoingEdges(diseaseId).filter(e => e.type === RelationshipType.Investigates);
    return edges.map(e => this.nodes.get(e.targetId)!);
  }

  getTreatmentsForDisease(diseaseId: string): GraphNode[] {
    const edges = this.getOutgoingEdges(diseaseId).filter(e => e.type === RelationshipType.Treats);
    return edges.map(e => this.nodes.get(e.targetId)!);
  }

  getComplications(diseaseId: string): GraphNode[] {
    const edges = this.getOutgoingEdges(diseaseId).filter(e => e.type === RelationshipType.Complicates);
    return edges.map(e => this.nodes.get(e.targetId)!);
  }

  getTeachingPoints(diseaseId: string): Record<string, unknown>[] {
    const node = this.nodes.get(diseaseId);
    if (!node) return [];
    const teachingProps = node.properties['teachingPoints'] as Record<string, unknown>[];
    return teachingProps || [];
  }

  findPath(sourceId: string, targetId: string, maxDepth: number = 4): KnowledgePath | null {
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: { nodes: GraphNode[]; edges: GraphEdge[] } }> = [
      { nodeId: sourceId, path: { nodes: [], edges: [] } },
    ];
    visited.add(sourceId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentNode = this.nodes.get(current.nodeId);
      if (!currentNode) continue;

      const newNodes = [...current.path.nodes, currentNode];

      if (current.nodeId === targetId) {
        return { nodes: newNodes, edges: current.path.edges, totalConfidence: 1 };
      }

      if (newNodes.length > maxDepth) continue;

      for (const edge of this.edges) {
        const nextId = edge.sourceId === current.nodeId ? edge.targetId :
                       edge.targetId === current.nodeId ? edge.sourceId : null;
        if (nextId && !visited.has(nextId)) {
          visited.add(nextId);
          queue.push({
            nodeId: nextId,
            path: { nodes: newNodes, edges: [...current.path.edges, edge] },
          });
        }
      }
    }

    return null;
  }

  getNodeCount(): number { return this.nodes.size; }
  getEdgeCount(): number { return this.edges.length; }
  clear(): void { this.nodes.clear(); this.edges = []; }
}

export const knowledgeGraph = new KnowledgeGraph();