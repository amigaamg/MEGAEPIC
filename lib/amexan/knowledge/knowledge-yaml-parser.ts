import { ObjectType } from '@/lib/amexan/constitution/books/book-I-objects';
import { RelationshipType } from '@/lib/amexan/constitution/books/book-II-relationships';
import { KnowledgePackage, PackageObject, PackageRelationship, PackageRule, PackageDocumentation } from '@/lib/amexan/constitution/books/book-VII-knowledge-compiler';

export interface YamlKnowledgePackage {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  source?: string;
  symptom?: string;
  disease?: string;
  objects: YamlObject[];
  relationships: YamlRelationship[];
  contexts?: string[];
  rules?: YamlRule[];
  documentation?: YamlDocumentation[];
}

export interface YamlObject {
  id: string;
  type: string;
  name: string;
  aliases?: string[];
  category?: string;
  description?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  onset?: 'acute' | 'subacute' | 'chronic';
  duration?: string;
  characteristics?: string[];
  synonyms?: string[];
  properties?: Record<string, unknown>;
}

export interface YamlRelationship {
  source: string;
  target: string;
  type: string;
  evidence?: string;
  confidence?: number;
  strength?: number;
  metadata?: Record<string, unknown>;
}

export interface YamlRule {
  id: string;
  description: string;
  when: string;
  then: string;
  priority?: number;
}

export interface YamlDocumentation {
  object: string;
  template: string;
  variables?: string[];
}

const TYPE_MAP: Record<string, ObjectType> = {
  symptom: ObjectType.Symptom,
  sign: ObjectType.Sign,
  mechanism: ObjectType.Mechanism,
  phenotype: ObjectType.Phenotype,
  syndrome: ObjectType.Syndrome,
  disease: ObjectType.Disease,
  diagnosis: ObjectType.Diagnosis,
  complication: ObjectType.Complication,
  investigation: ObjectType.Investigation,
  treatment: ObjectType.Treatment,
  drug: ObjectType.Drug,
  procedure: ObjectType.MedicalProcedure,
  protocol: ObjectType.Protocol,
  guideline: ObjectType.Guideline,
  risk_factor: ObjectType.RiskFactor,
  score: ObjectType.Score,
  decision_rule: ObjectType.DecisionRule,
  differential: ObjectType.Differential,
  contraindication: ObjectType.Contraindication,
  adverse_effect: ObjectType.AdverseEffect,
  question: ObjectType.Question,
  answer: ObjectType.Answer,
  finding: ObjectType.Finding,
};

const RELATIONSHIP_MAP: Record<string, RelationshipType> = {
  presents_with: RelationshipType.PresentsWith,
  has_mechanism: RelationshipType.HasMechanism,
  produces: RelationshipType.ProducesPhenotype,
  suggests: RelationshipType.SuggestsDisease,
  diagnoses: RelationshipType.Confirms,
  investigates: RelationshipType.Investigates,
  treats: RelationshipType.Treats,
  contraindicates: RelationshipType.Contraindicates,
  causes: RelationshipType.HasCause,
  complicates: RelationshipType.Complicates,
  manifests_as: RelationshipType.PresentsWith,
  requires: RelationshipType.Requires,
  excludes: RelationshipType.Excludes,
};

export class KnowledgeYamlParser {
  parse(yamlContent: string): KnowledgePackage {
    const parsed = this.parseYaml(yamlContent);
    return this.convert(parsed);
  }

  parseObject(obj: YamlKnowledgePackage): KnowledgePackage {
    return this.convert(obj);
  }

  convert(yaml: YamlKnowledgePackage): KnowledgePackage {
    const objects = yaml.objects.map(o => this.convertObject(o));
    const relationships = yaml.relationships.map(r => this.convertRelationship(r, objects));
    const rules = (yaml.rules || []).map(r => this.convertRule(r));
    const documentation = (yaml.documentation || []).map(d => this.convertDocumentation(d));

    return {
      id: yaml.id,
      name: yaml.name,
      version: yaml.version,
      symptom: yaml.symptom,
      disease: yaml.disease,
      objects,
      relationships,
      contexts: yaml.contexts || [],
      rules,
      documentation,
    };
  }

  private convertObject(obj: YamlObject): PackageObject {
    const objectType = this.resolveType(obj.type);
    return {
      type: objectType,
      id: obj.id,
      name: obj.name,
      properties: {
        ...(obj.category && { category: obj.category }),
        ...(obj.description && { description: obj.description }),
        ...(obj.severity && { severity: obj.severity }),
        ...(obj.onset && { onset: obj.onset }),
        ...(obj.duration && { duration: obj.duration }),
        ...(obj.characteristics && { characteristics: obj.characteristics }),
        ...(obj.aliases && { aliases: obj.aliases }),
        ...(obj.synonyms && { synonyms: obj.synonyms }),
        ...(obj.properties || {}),
      },
    };
  }

  private convertRelationship(rel: YamlRelationship, objects: PackageObject[]): PackageRelationship {
    const objectIds = new Set(objects.map(o => o.id));
    return {
      sourceId: rel.source,
      sourceType: this.resolveTypeForObject(rel.source, objects),
      targetId: rel.target,
      targetType: this.resolveTypeForObject(rel.target, objects),
      type: this.resolveRelationshipType(rel.type),
      evidence: rel.evidence,
      confidence: rel.confidence,
    };
  }

  private convertRule(rule: YamlRule): PackageRule {
    return {
      id: rule.id,
      description: rule.description,
      condition: rule.when,
      action: rule.then,
      priority: rule.priority ?? 5,
    };
  }

  private convertDocumentation(doc: YamlDocumentation): PackageDocumentation {
    return {
      objectId: doc.object,
      narrativeTemplate: doc.template,
      variables: doc.variables || [],
    };
  }

  private resolveType(type: string): ObjectType {
    return TYPE_MAP[type.toLowerCase()] || ObjectType.Symptom;
  }

  private resolveRelationshipType(type: string): RelationshipType {
    return RELATIONSHIP_MAP[type.toLowerCase()] || RelationshipType.HasCause;
  }

  private resolveTypeForObject(id: string, objects: PackageObject[]): ObjectType {
    return objects.find(o => o.id === id)?.type || ObjectType.Symptom;
  }

  private parseYaml(_content: string): YamlKnowledgePackage {
    throw new Error('YAML parsing requires a runtime YAML library. Use parseObject() with a pre-parsed object instead.');
  }
}

export const knowledgeYamlParser = new KnowledgeYamlParser();

export { TYPE_MAP, RELATIONSHIP_MAP };