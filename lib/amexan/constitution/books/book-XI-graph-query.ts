import { ObjectType } from './book-I-objects';
import { RelationshipType } from './book-II-relationships';
import { ClinicalContext } from './book-III-context';

export interface QueryResult {
  nodes: QueryNode[];
  edges: QueryEdge[];
}

export interface QueryNode {
  id: string;
  type: ObjectType;
  name: string;
  properties: Record<string, unknown>;
}

export interface QueryEdge {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  properties: Record<string, unknown>;
}

export abstract class GraphQuery {
  abstract execute(context: QueryContext): Promise<QueryResult>;
  abstract toCypher(): string;
}

export interface QueryContext {
  patientId?: string;
  encounterId?: string;
  symptomId?: string;
  diseaseId?: string;
  findingIds?: string[];
  contexts?: ClinicalContext[];
}

export class FindDifferentials extends GraphQuery {
  constructor(private symptomIds: string[], private contexts: ClinicalContext[] = []) { super(); }

  async execute(_context: QueryContext): Promise<QueryResult> {
    return { nodes: [], edges: [] };
  }

  toCypher(): string {
    return `
      MATCH (s:Symptom)-[:HAS_MECHANISM]->(m:Mechanism)
      WHERE s.id IN $symptomIds
      OPTIONAL MATCH (m)-[:PRODUCES_PHENOTYPE]->(ph:Phenotype)
      OPTIONAL MATCH (ph)-[:SUGGESTS_DISEASE]->(d:Disease)
      ${this.contexts.length > 0 ? `
      OPTIONAL MATCH (d)-[:MODIFIED_BY]->(c:Context)
      WHERE c.id IN $contexts` : ''}
      RETURN DISTINCT d.id, d.name, d.probability
      ORDER BY d.probability DESC
      LIMIT 20
    `;
  }
}

export class FindMechanisms extends GraphQuery {
  constructor(private symptomId: string) { super(); }

  async execute(_context: QueryContext): Promise<QueryResult> {
    return { nodes: [], edges: [] };
  }

  toCypher(): string {
    return `
      MATCH (s:Symptom {id: $symptomId})-[:HAS_MECHANISM]->(m:Mechanism)
      OPTIONAL MATCH (m)-[:SUPPORTED_BY_SIGN]->(sign:Sign)
      RETURN m, collect(sign) as supportingSigns
    `;
  }
}

export class FindQuestions extends GraphQuery {
  constructor(private symptomId: string, private contexts: ClinicalContext[] = []) { super(); }

  async execute(_context: QueryContext): Promise<QueryResult> {
    return { nodes: [], edges: [] };
  }

  toCypher(): string {
    return `
      MATCH (s:Symptom {id: $symptomId})-[:TRIGGERS]->(q:Question)
      WHERE NOT EXISTS((q)-[:HIDES]->(:Context {id: $contexts}))
      OPTIONAL MATCH (q)-[:CAPTURES_FACT]->(f:Fact)
      OPTIONAL MATCH (q)-[:ENABLES]->(nextQ:Question)
      RETURN q, collect(f) as capturedFacts, collect(nextQ) as enabledQuestions
      ORDER BY q.order
    `;
  }
}

export class FindInvestigations extends GraphQuery {
  constructor(private diseaseId: string, private contexts: ClinicalContext[] = []) { super(); }

  async execute(_context: QueryContext): Promise<QueryResult> {
    return { nodes: [], edges: [] };
  }

  toCypher(): string {
    return `
      MATCH (d:Disease {id: $diseaseId})-[:HAS_INVESTIGATION]->(inv:Investigation)
      OPTIONAL MATCH (d)-[:MODIFIED_BY]->(c:Context)
      WHERE c.id IN $contexts
      RETURN inv, collect(c) as contexts
      ORDER BY inv.priority
    `;
  }
}

export class FindTreatments extends GraphQuery {
  constructor(private diseaseId: string, private contexts: ClinicalContext[] = []) { super(); }

  async execute(_context: QueryContext): Promise<QueryResult> {
    return { nodes: [], edges: [] };
  }

  toCypher(): string {
    return `
      MATCH (d:Disease {id: $diseaseId})-[:TREATED_BY]->(tx:Treatment)
      OPTIONAL MATCH (d)-[:MODIFIED_BY]->(c:Context)
      WHERE c.id IN $contexts
      OPTIONAL MATCH (tx)-[:CONTRAINDICATES]->(contra:Drug)
      RETURN tx, collect(c) as contexts, collect(contra) as contraindications
    `;
  }
}

export class FindComplications extends GraphQuery {
  constructor(private diseaseId: string) { super(); }

  async execute(_context: QueryContext): Promise<QueryResult> {
    return { nodes: [], edges: [] };
  }

  toCypher(): string {
    return `
      MATCH (d:Disease {id: $diseaseId})-[:HAS_COMPLICATION]->(comp:Complication)
      OPTIONAL MATCH (comp)-[:REQUIRES_MONITORING]->(m:MonitoringPlan)
      RETURN comp, collect(m) as monitoring
    `;
  }
}

export class FindMonitoring extends GraphQuery {
  constructor(private diseaseId: string, private treatmentId?: string) { super(); }

  async execute(_context: QueryContext): Promise<QueryResult> {
    return { nodes: [], edges: [] };
  }

  toCypher(): string {
    return `
      MATCH (d:Disease {id: $diseaseId})-[:MONITORED_BY]->(m:MonitoringPlan)
      ${this.treatmentId ? 'OPTIONAL MATCH (tx:Treatment {id: $treatmentId})-[:REQUIRES_MONITORING]->(m2:MonitoringPlan)' : ''}
      RETURN m ${this.treatmentId ? ', m2' : ''}
    `;
  }
}

export class FindDocumentation extends GraphQuery {
  constructor(private objectType: ObjectType, private objectId: string) { super(); }

  async execute(_context: QueryContext): Promise<QueryResult> {
    return { nodes: [], edges: [] };
  }

  toCypher(): string {
    return `
      MATCH (obj:${this.objectType} {id: $objectId})-[:DOCUMENTED_AS]->(doc:Documentation)
      RETURN doc
    `;
  }
}

export class FindPatientJourney extends GraphQuery {
  constructor(private patientId: string) { super(); }

  async execute(_context: QueryContext): Promise<QueryResult> {
    return { nodes: [], edges: [] };
  }

  toCypher(): string {
    return `
      MATCH (p:Patient {id: $patientId})-[:HAS_ENCOUNTER]->(enc:Encounter)
      OPTIONAL MATCH (enc)-[:HAS_COMPLAINT]->(sym:Symptom)
      OPTIONAL MATCH (enc)-[:GENERATES]->(doc:Documentation)
      RETURN enc, collect(sym) as symptoms, collect(doc) as documents
      ORDER BY enc.createdAt DESC
    `;
  }
}

export class FindEvidencePath extends GraphQuery {
  constructor(private findingId: string) { super(); }

  async execute(_context: QueryContext): Promise<QueryResult> {
    return { nodes: [], edges: [] };
  }

  toCypher(): string {
    return `
      MATCH path = (f:Finding {id: $findingId})-[:FACT_SUPPORTS*1..4]->(d:Disease)
      RETURN path
    `;
  }
}

export class QueryConstitution {
  private queries: Map<string, new (...args: unknown[]) => GraphQuery> = new Map();

  register(name: string, query: new (...args: any[]) => GraphQuery): void {
    this.queries.set(name, query);
  }

  create<T extends GraphQuery>(name: string, ...args: unknown[]): T | null {
    const QueryClass = this.queries.get(name);
    if (!QueryClass) return null;
    return new QueryClass(...args) as T;
  }
}

export const queryConstitution = new QueryConstitution();

queryConstitution.register('differentials', FindDifferentials);
queryConstitution.register('mechanisms', FindMechanisms);
queryConstitution.register('questions', FindQuestions);
queryConstitution.register('investigations', FindInvestigations);
queryConstitution.register('treatments', FindTreatments);
queryConstitution.register('complications', FindComplications);
queryConstitution.register('monitoring', FindMonitoring);
queryConstitution.register('documentation', FindDocumentation);
queryConstitution.register('patientJourney', FindPatientJourney);
queryConstitution.register('evidencePath', FindEvidencePath);
