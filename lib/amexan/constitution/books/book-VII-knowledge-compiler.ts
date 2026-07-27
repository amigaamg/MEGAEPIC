import { ObjectType } from './book-I-objects';
import { RelationshipType } from './book-II-relationships';

export interface KnowledgePackage {
  id: string;
  name: string;
  version: string;
  symptom?: string;
  disease?: string;
  objects: PackageObject[];
  relationships: PackageRelationship[];
  contexts: string[];
  rules: PackageRule[];
  documentation: PackageDocumentation[];
}

export interface PackageObject {
  type: ObjectType;
  id: string;
  name: string;
  properties: Record<string, unknown>;
}

export interface PackageRelationship {
  sourceId: string;
  sourceType: ObjectType;
  targetId: string;
  targetType: ObjectType;
  type: RelationshipType;
  evidence?: string;
  confidence?: number;
}

export interface PackageRule {
  id: string;
  description: string;
  condition: string;
  action: string;
  priority: number;
}

export interface PackageDocumentation {
  objectId: string;
  narrativeTemplate: string;
  variables: string[];
}

export interface CompilationResult {
  success: boolean;
  packageName: string;
  version: string;
  errors: CompilationError[];
  warnings: string[];
  stats: CompilationStats;
}

export interface CompilationError {
  phase: CompilationPhase;
  severity: 'error' | 'warning';
  message: string;
  code: string;
  location?: string;
}

export type CompilationPhase =
  | 'schema_validation'
  | 'relationship_validation'
  | 'context_validation'
  | 'rule_validation'
  | 'documentation_validation'
  | 'investigation_validation'
  | 'treatment_validation'
  | 'graph_validation'
  | 'consistency_validation';

export interface CompilationStats {
  objectsValidated: number;
  relationshipsValidated: number;
  contextsChecked: number;
  rulesVerified: number;
  documentationSlots: number;
  errors: number;
  warnings: number;
}

export class KnowledgeCompiler {
  compile(pkg: KnowledgePackage): CompilationResult {
    const errors: CompilationError[] = [];
    const warnings: string[] = [];

    this.validateSchema(pkg, errors, warnings);
    this.validateRelationships(pkg, errors, warnings);
    this.validateContexts(pkg, errors, warnings);
    this.validateRules(pkg, errors, warnings);
    this.validateDocumentation(pkg, errors, warnings);
    this.validateGraphConsistency(pkg, errors, warnings);

    return {
      success: errors.filter(e => e.severity === 'error').length === 0,
      packageName: pkg.name,
      version: pkg.version,
      errors,
      warnings,
      stats: {
        objectsValidated: pkg.objects.length,
        relationshipsValidated: pkg.relationships.length,
        contextsChecked: pkg.contexts.length,
        rulesVerified: pkg.rules.length,
        documentationSlots: pkg.documentation.length,
        errors: errors.filter(e => e.severity === 'error').length,
        warnings: warnings.length,
      },
    };
  }

  private validateSchema(pkg: KnowledgePackage, errors: CompilationError[], _warnings: string[]): void {
    if (pkg.objects.length === 0) {
      errors.push({ phase: 'schema_validation', severity: 'error', message: 'Package contains no objects', code: 'EMPTY_PACKAGE' });
    }
    const objectIds = new Set(pkg.objects.map(o => o.id));
    const duplicates = pkg.objects.filter((o, i) => pkg.objects.findIndex(x => x.id === o.id) !== i);
    for (const d of duplicates) {
      errors.push({ phase: 'schema_validation', severity: 'error', message: `Duplicate object ID: ${d.id}`, code: 'DUPLICATE_ID', location: d.id });
    }

    const validTypes = new Set(Object.values(ObjectType));
    for (const obj of pkg.objects) {
      if (!validTypes.has(obj.type)) {
        errors.push({ phase: 'schema_validation', severity: 'error', message: `Invalid object type: ${obj.type}`, code: 'INVALID_TYPE', location: obj.id });
      }
    }

    if (!pkg.symptom && !pkg.disease) {
      errors.push({ phase: 'schema_validation', severity: 'warning', message: 'Package has no symptom or disease association', code: 'NO_PRIMARY_CONCEPT' });
    }
  }

  private validateRelationships(pkg: KnowledgePackage, errors: CompilationError[], _warnings: string[]): void {
    const objectIds = new Set(pkg.objects.map(o => o.id));
    for (const rel of pkg.relationships) {
      if (!objectIds.has(rel.sourceId)) {
        errors.push({ phase: 'relationship_validation', severity: 'error', message: `Relationship source not found: ${rel.sourceId}`, code: 'MISSING_SOURCE', location: rel.sourceId });
      }
      if (!objectIds.has(rel.targetId)) {
        errors.push({ phase: 'relationship_validation', severity: 'error', message: `Relationship target not found: ${rel.targetId}`, code: 'MISSING_TARGET', location: rel.targetId });
      }
    }

    const symptoms = pkg.objects.filter(o => o.type === ObjectType.Symptom);
    const mechanisms = pkg.objects.filter(o => o.type === ObjectType.Mechanism);
    const diseases = pkg.objects.filter(o => o.type === ObjectType.Disease);
    const investigations = pkg.objects.filter(o => o.type === ObjectType.Investigation);
    const treatments = pkg.objects.filter(o => o.type === ObjectType.Treatment || o.type === ObjectType.Drug);

    if (symptoms.length > 0 && mechanisms.length === 0) {
      errors.push({ phase: 'relationship_validation', severity: 'warning', message: `Symptom '${symptoms[0].name}' has no mechanisms`, code: 'NO_MECHANISMS' });
    }
    if (mechanisms.length > 0 && diseases.length === 0) {
      errors.push({ phase: 'relationship_validation', severity: 'warning', message: `Mechanisms exist but no diseases connected`, code: 'NO_DISEASES' });
    }
    if (diseases.length > 0 && investigations.length === 0) {
      errors.push({ phase: 'investigation_validation', severity: 'warning', message: `Disease '${diseases[0]?.name}' has no investigations`, code: 'NO_INVESTIGATIONS' });
    }
    if (diseases.length > 0 && treatments.length === 0) {
      errors.push({ phase: 'treatment_validation', severity: 'warning', message: `Disease '${diseases[0]?.name}' has no treatments`, code: 'NO_TREATMENTS' });
    }

    const hasQuestionLinks = pkg.relationships.some(r => r.type === RelationshipType.CapturesFact);
    if (symptoms.length > 0 && !hasQuestionLinks) {
      errors.push({ phase: 'relationship_validation', severity: 'warning', message: `Symptom '${symptoms[0]?.name}' has no question links`, code: 'NO_QUESTIONS' });
    }
  }

  private validateContexts(pkg: KnowledgePackage, errors: CompilationError[], _warnings: string[]): void {
    if (pkg.contexts.length === 0) {
      errors.push({ phase: 'context_validation', severity: 'warning', message: 'Package has no context definitions', code: 'NO_CONTEXTS' });
    }
  }

  private validateRules(pkg: KnowledgePackage, errors: CompilationError[], _warnings: string[]): void {
    for (const rule of pkg.rules) {
      if (!rule.condition) {
        errors.push({ phase: 'rule_validation', severity: 'error', message: `Rule '${rule.id}' has no condition`, code: 'MISSING_CONDITION', location: rule.id });
      }
      if (!rule.action) {
        errors.push({ phase: 'rule_validation', severity: 'error', message: `Rule '${rule.id}' has no action`, code: 'MISSING_ACTION', location: rule.id });
      }
    }
  }

  private validateDocumentation(pkg: KnowledgePackage, errors: CompilationError[], _warnings: string[]): void {
    const objectIds = new Set(pkg.objects.map(o => o.id));
    for (const doc of pkg.documentation) {
      if (!objectIds.has(doc.objectId)) {
        errors.push({ phase: 'documentation_validation', severity: 'error', message: `Documentation references unknown object: ${doc.objectId}`, code: 'MISSING_DOC_OBJECT', location: doc.objectId });
      }
    }
  }

  private validateGraphConsistency(pkg: KnowledgePackage, errors: CompilationError[], warnings: string[]): void {
    const symptomToMechanism = pkg.relationships.filter(r => r.type === RelationshipType.HasMechanism);
    const mechanismToPhenotype = pkg.relationships.filter(r => r.type === RelationshipType.ProducesPhenotype);
    const phenotypeToDisease = pkg.relationships.filter(r => r.type === RelationshipType.SuggestsDisease);

    const chainBroken = symptomToMechanism.length > 0 && mechanismToPhenotype.length === 0 && phenotypeToDisease.length > 0;
    if (chainBroken) {
      warnings.push('Knowledge chain may be incomplete: symptom→mechanism exists but mechanism→phenotype is missing');
    }

    const hasEvidence = pkg.relationships.some(r => r.evidence);
    if (!hasEvidence) {
      warnings.push('No relationships have evidence citations');
    }
  }
}

export const knowledgeCompiler = new KnowledgeCompiler();
