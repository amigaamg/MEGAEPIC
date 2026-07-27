import { ObjectType } from './book-I-objects';
import { RelationshipType } from './book-II-relationships';
import { ClinicalContext } from './book-III-context';

export type VisibilityAction = 'show' | 'hide' | 'disable' | 'require' | 'optional';

export interface VisibilityEdge {
  id: string;
  context: ClinicalContext;
  action: VisibilityAction;
  targetType: ObjectType;
  targetId: string;
  reason: string;
  priority: number;
  conditions?: VisibilityCondition[];
}

export interface VisibilityCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'exists';
  value: unknown;
}

export type VisibilityRelationship =
  | RelationshipType.Shows
  | RelationshipType.Hides
  | RelationshipType.Enables
  | RelationshipType.Disables;

export const VISIBILITY_GRAPH: VisibilityEdge[] = [
  { id: 'v001', context: ClinicalContext.Pregnant, action: 'show', targetType: ObjectType.Question, targetId: 'anc_booking', reason: 'ANC booking required for pregnant patients', priority: 10 },
  { id: 'v002', context: ClinicalContext.Pregnant, action: 'show', targetType: ObjectType.PhysicalFinding, targetId: 'leopolds_manoeuvres', reason: 'Obstetric examination', priority: 10 },
  { id: 'v003', context: ClinicalContext.Pregnant, action: 'show', targetType: ObjectType.Measurement, targetId: 'fundal_height', reason: 'Fundal height measurement', priority: 10 },
  { id: 'v004', context: ClinicalContext.Pregnant, action: 'hide', targetType: ObjectType.PhysicalFinding, targetId: 'prostate_exam', reason: 'Not applicable in pregnancy', priority: 10 },
  { id: 'v005', context: ClinicalContext.Neonate, action: 'show', targetType: ObjectType.Measurement, targetId: 'head_circumference', reason: 'WHO growth standard', priority: 10 },
  { id: 'v006', context: ClinicalContext.Neonate, action: 'hide', targetType: ObjectType.Question, targetId: 'smoking_history', reason: 'Not applicable', priority: 10 },
  { id: 'v007', context: ClinicalContext.Child, action: 'show', targetType: ObjectType.Score, targetId: 'peds_glasgow', reason: 'Pediatric GCS', priority: 10 },
  { id: 'v008', context: ClinicalContext.Adult, action: 'show', targetType: ObjectType.Score, targetId: 'glasgow_coma_scale', reason: 'Standard GCS', priority: 10 },
  { id: 'v009', context: ClinicalContext.HIV, action: 'show', targetType: ObjectType.Question, targetId: 'cd4_count', reason: 'HIV monitoring', priority: 10 },
  { id: 'v010', context: ClinicalContext.HIV, action: 'show', targetType: ObjectType.Question, targetId: 'viral_load', reason: 'HIV monitoring', priority: 10 },
  { id: 'v011', context: ClinicalContext.HIV, action: 'show', targetType: ObjectType.Drug, targetId: 'art_regimen', reason: 'ART required', priority: 10 },
];

export class VisibilityGraphEngine {
  private edges: VisibilityEdge[] = [...VISIBILITY_GRAPH];

  evaluate(contexts: ClinicalContext[], targetType: ObjectType, targetId: string): VisibilityAction {
    const applicable = this.edges.filter(
      e => contexts.includes(e.context) && e.targetType === targetType && e.targetId === targetId,
    );
    if (applicable.length === 0) return 'optional';
    applicable.sort((a, b) => b.priority - a.priority);
    return applicable[0].action;
  }

  evaluateAll(contexts: ClinicalContext[]): Map<string, VisibilityAction> {
    const results = new Map<string, VisibilityAction>();
    for (const edge of this.edges) {
      if (contexts.includes(edge.context)) {
        const key = `${edge.targetType}:${edge.targetId}`;
        const existing = results.get(key);
        if (!existing || this.priority(edge.action) > this.priority(existing)) {
          results.set(key, edge.action);
        }
      }
    }
    return results;
  }

  registerEdge(edge: VisibilityEdge): void {
    this.edges.push(edge);
  }

  getVisible(contexts: ClinicalContext[]): string[] {
    const visible: string[] = [];
    for (const edge of this.edges) {
      if (contexts.includes(edge.context) && edge.action === 'show') {
        visible.push(`${edge.targetType}:${edge.targetId}`);
      }
    }
    return visible;
  }

  getHidden(contexts: ClinicalContext[]): string[] {
    const hidden: string[] = [];
    for (const edge of this.edges) {
      if (contexts.includes(edge.context) && edge.action === 'hide') {
        hidden.push(`${edge.targetType}:${edge.targetId}`);
      }
    }
    return hidden;
  }

  toNeo4jEdges(): { source: string; target: string; type: RelationshipType; properties: Record<string, unknown> }[] {
    return this.edges.map(e => ({
      source: `context:${e.context}`,
      target: `${e.targetType}:${e.targetId}`,
      type: e.action === 'show' ? RelationshipType.Shows : e.action === 'hide' ? RelationshipType.Hides : RelationshipType.Triggers,
      properties: { reason: e.reason, priority: e.priority },
    }));
  }

  private priority(a: VisibilityAction): number {
    return a === 'hide' ? 4 : a === 'disable' ? 3 : a === 'require' ? 2 : a === 'show' ? 1 : 0;
  }
}

export const visibilityEngine = new VisibilityGraphEngine();
