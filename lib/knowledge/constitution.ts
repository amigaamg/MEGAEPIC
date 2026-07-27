export type KnowledgeVersion = string;

export type NodeType =
  | 'symptom' | 'sign' | 'mechanism' | 'phenotype' | 'syndrome'
  | 'disease' | 'etiology' | 'risk_factor' | 'complication'
  | 'investigation' | 'investigation_result' | 'imaging' | 'imaging_finding'
  | 'treatment' | 'drug' | 'procedure' | 'surgery' | 'therapy'
  | 'guideline' | 'protocol' | 'clinical_pathway'
  | 'body_system' | 'anatomy' | 'organ' | 'tissue'
  | 'score' | 'score_component'
  | 'question' | 'question_group'
  | 'monitoring_parameter' | 'monitoring_protocol'
  | 'documentation_template'
  | 'age_group' | 'population' | 'context'
  | 'specialty' | 'department'
  | 'organization' | 'country' | 'region'
  | 'learning_module' | 'teaching_resource'
  | 'public_health_indicator' | 'registry'
  | 'code_system' | 'code_mapping';

export type RelationshipType =
  | 'HAS_MECHANISM'
  | 'HAS_PHENOTYPE'
  | 'HAS_SYMPTOM'
  | 'HAS_SIGN'
  | 'HAS_RISK_FACTOR'
  | 'HAS_ETIOLOGY'
  | 'HAS_COMPLICATION'
  | 'HAS_TREATMENT'
  | 'HAS_INVESTIGATION'
  | 'HAS_GUIDELINE'
  | 'HAS_MONITORING'
  | 'HAS_SCORE'
  | 'HAS_ANATOMY'
  | 'HAS_BODY_SYSTEM'
  | 'HAS_AGE_GROUP'
  | 'HAS_CONTEXT'
  | 'HAS_DOCUMENTATION'
  | 'HAS_PROTOCOL'
  | 'HAS_PATHWAY'
  | 'HAS_QUESTION'
  | 'HAS_QUESTION_GROUP'
  | 'PART_OF'
  | 'SUGGESTS'
  | 'SUPPORTS'
  | 'CONFIRMED_BY'
  | 'CONTRADICTS'
  | 'EXCLUDES'
  | 'REQUIRES'
  | 'TREATED_BY'
  | 'MONITORED_BY'
  | 'DIAGNOSED_BY'
  | 'MANAGED_BY'
  | 'CAUSES'
  | 'COMPLICATES'
  | 'PREDISPOSES'
  | 'ASSOCIATED_WITH'
  | 'TRIGGERS'
  | 'ACTIVATES'
  | 'ENABLES'
  | 'HIDES'
  | 'MODIFIES'
  | 'OVERRIDES'
  | 'INHERITS_FROM'
  | 'APPLIES_TO'
  | 'FOLLOWS'
  | 'PRECEDES'
  | 'DIFFERENTIATE'
  | 'MIMICS'
  | 'MAPS_TO'
  | 'REFERENCED_BY'
  | 'LEARNING_RESOURCE'
  | 'TEACHING_OBJECTIVE';

export interface PropertySchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'array' | 'object' | 'reference';
  required: boolean;
  description: string;
  enumValues?: string[];
  arrayOf?: PropertySchema['type'];
  defaultValue?: unknown;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  rule: 'range' | 'pattern' | 'min' | 'max' | 'min_length' | 'max_length' | 'required_if' | 'unique';
  value: unknown;
  message: string;
}

export interface NodeTypeSchema {
  type: NodeType;
  label: string;
  description: string;
  properties: PropertySchema[];
  requiredRelationships: { type: RelationshipType; targetTypes: NodeType[]; min?: number; max?: number }[];
  optionalRelationships: { type: RelationshipType; targetTypes: NodeType[] }[];
  versionable: boolean;
  inheritable: boolean;
  color: string;
}

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  properties: Record<string, unknown>;
  version: KnowledgeVersion;
  source: 'constitutional' | 'organization' | 'department' | 'custom';
  sourceId?: string;
  createdAt: number;
  updatedAt: number;
  supersededBy?: string;
  tags: string[];
}

export interface GraphRelationship {
  id: string;
  type: RelationshipType;
  sourceId: string;
  targetId: string;
  strength: number;
  direction: 'directed' | 'bidirectional';
  evidence: EvidenceLevel;
  metadata: Record<string, unknown>;
  version: KnowledgeVersion;
  active: boolean;
}

export type EvidenceLevel = 'gold_standard' | 'guideline' | 'expert_opinion' | 'case_series' | 'mechanistic_reasoning' | 'consensus';

export interface GraphProperty {
  nodeId: string;
  name: string;
  value: unknown;
  dataType: PropertySchema['type'];
  unit?: string;
  confidence: number;
  timestamp: number;
}

export interface InheritanceRule {
  level: 'global' | 'country' | 'region' | 'organization' | 'department' | 'individual';
  overrides: RelationshipType[];
  priority: number;
  propagateDown: boolean;
}

export interface VersionRecord {
  versionId: string;
  nodeId: string;
  changedProperties: string[];
  changedRelationships: string[];
  timestamp: number;
  author: string;
  reason: string;
  previousVersion?: string;
}

export interface KnowledgeGraph {
  id: string;
  name: string;
  version: KnowledgeVersion;
  nodes: Map<string, GraphNode>;
  relationships: Map<string, GraphRelationship>;
  properties: GraphProperty[];
  inheritanceRules: InheritanceRule[];
  versionHistory: VersionRecord[];
  createdAt: number;
  updatedAt: number;
}

export const NODE_TYPE_SCHEMAS: Record<NodeType, NodeTypeSchema> = {
  symptom: {
    type: 'symptom', label: 'Symptom', description: 'A subjective patient-reported experience',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Canonical symptom name' },
      { name: 'aliases', type: 'array', required: false, description: 'Alternative names', arrayOf: 'string' },
      { name: 'bodySystem', type: 'reference', required: false, description: 'Primary body system' },
      { name: 'urgency', type: 'enum', required: false, description: 'Default triage urgency', enumValues: ['red', 'orange', 'yellow', 'green'] },
    ],
    requiredRelationships: [
      { type: 'HAS_MECHANISM', targetTypes: ['mechanism'], min: 1 },
      { type: 'HAS_BODY_SYSTEM', targetTypes: ['body_system'], min: 1 },
    ],
    optionalRelationships: [
      { type: 'HAS_QUESTION', targetTypes: ['question', 'question_group'] },
      { type: 'TRIGGERS', targetTypes: ['sign'] },
      { type: 'SUGGESTS', targetTypes: ['phenotype', 'disease'] },
    ],
    versionable: true, inheritable: true, color: '#3B82F6',
  },
  mechanism: {
    type: 'mechanism', label: 'Mechanism', description: 'A pathophysiological process that produces symptoms and signs',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Mechanism name' },
      { name: 'category', type: 'enum', required: true, description: 'Mechanism category', enumValues: ['inflammatory', 'infectious', 'neoplastic', 'autoimmune', 'degenerative', 'vascular', 'traumatic', 'congenital', 'metabolic', 'toxic', 'idiopathic', 'iatrogenic', 'functional', 'psychogenic'] },
      { name: 'description', type: 'string', required: false, description: 'Detailed description' },
    ],
    requiredRelationships: [
      { type: 'HAS_PHENOTYPE', targetTypes: ['phenotype'], min: 1 },
    ],
    optionalRelationships: [
      { type: 'CAUSES', targetTypes: ['symptom', 'sign', 'complication'] },
      { type: 'ASSOCIATED_WITH', targetTypes: ['disease', 'etiology'] },
    ],
    versionable: true, inheritable: true, color: '#8B5CF6',
  },
  phenotype: {
    type: 'phenotype', label: 'Phenotype', description: 'A recognizable pattern of clinical features',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Phenotype name' },
      { name: 'features', type: 'array', required: true, description: 'Distinguishing features', arrayOf: 'string' },
      { name: 'urgency', type: 'enum', required: false, description: 'Clinical urgency', enumValues: ['routine', 'urgent', 'emergency', 'critical'] },
      { name: 'prevalence', type: 'number', required: false, description: 'Population prevalence 0-1' },
    ],
    requiredRelationships: [
      { type: 'SUGGESTS', targetTypes: ['disease', 'syndrome'], min: 1 },
    ],
    optionalRelationships: [
      { type: 'HAS_SYMPTOM', targetTypes: ['symptom'] },
      { type: 'HAS_SIGN', targetTypes: ['sign'] },
      { type: 'REQUIRES', targetTypes: ['investigation'] },
    ],
    versionable: true, inheritable: true, color: '#EC4899',
  },
  disease: {
    type: 'disease', label: 'Disease', description: 'A clinical condition with known etiology, pathophysiology, and management',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Disease name' },
      { name: 'icd10', type: 'string', required: false, description: 'ICD-10 code' },
      { name: 'snomed', type: 'string', required: false, description: 'SNOMED CT code' },
      { name: 'synonyms', type: 'array', required: false, description: 'Alternative names', arrayOf: 'string' },
      { name: 'specialties', type: 'array', required: true, description: 'Managing specialties', arrayOf: 'string' },
      { name: 'emergencyLevel', type: 'enum', required: true, description: 'Emergency level', enumValues: ['red', 'orange', 'yellow', 'green'] },
    ],
    requiredRelationships: [
      { type: 'HAS_MECHANISM', targetTypes: ['mechanism'], min: 1 },
      { type: 'HAS_INVESTIGATION', targetTypes: ['investigation'], min: 1 },
      { type: 'HAS_TREATMENT', targetTypes: ['treatment', 'drug', 'procedure'], min: 1 },
    ],
    optionalRelationships: [
      { type: 'HAS_SYMPTOM', targetTypes: ['symptom'] },
      { type: 'HAS_SIGN', targetTypes: ['sign'] },
      { type: 'HAS_RISK_FACTOR', targetTypes: ['risk_factor'] },
      { type: 'HAS_ETIOLOGY', targetTypes: ['etiology'] },
      { type: 'HAS_COMPLICATION', targetTypes: ['complication'] },
      { type: 'HAS_GUIDELINE', targetTypes: ['guideline'] },
      { type: 'HAS_MONITORING', targetTypes: ['monitoring_parameter', 'monitoring_protocol'] },
      { type: 'HAS_SCORE', targetTypes: ['score'] },
      { type: 'DIFFERENTIATE', targetTypes: ['disease'] },
      { type: 'MIMICS', targetTypes: ['disease'] },
    ],
    versionable: true, inheritable: true, color: '#EF4444',
  },
  investigation: {
    type: 'investigation', label: 'Investigation', description: 'A laboratory or diagnostic test',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Test name' },
      { name: 'loinc', type: 'string', required: false, description: 'LOINC code' },
      { name: 'category', type: 'enum', required: true, description: 'Test category', enumValues: ['hematology', 'biochemistry', 'microbiology', 'immunology', 'pathology', 'genetics', 'toxicology', 'other'] },
      { name: 'specimen', type: 'string', required: false, description: 'Required specimen type' },
      { name: 'turnaroundTime', type: 'string', required: false, description: 'Expected turnaround time' },
    ],
    requiredRelationships: [],
    optionalRelationships: [
      { type: 'CONFIRMED_BY', targetTypes: ['disease'] },
      { type: 'EXCLUDES', targetTypes: ['disease'] },
      { type: 'MONITORED_BY', targetTypes: ['disease', 'monitoring_parameter'] },
    ],
    versionable: true, inheritable: true, color: '#10B981',
  },
  drug: {
    type: 'drug', label: 'Drug', description: 'A pharmaceutical agent',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Drug name' },
      { name: 'genericName', type: 'string', required: true, description: 'Generic name' },
      { name: 'atcCode', type: 'string', required: false, description: 'ATC classification code' },
      { name: 'category', type: 'enum', required: true, description: 'Drug category', enumValues: ['antibiotic', 'antiviral', 'antifungal', 'antiparasitic', 'antihypertensive', 'diuretic', 'anticoagulant', 'antiplatelet', 'statin', 'antiarrhythmic', 'inotrope', 'bronchodilator', 'corticosteroid', 'immunosuppressant', 'analgesic', 'antiepileptic', 'antidepressant', 'antipsychotic', 'antidiabetic', 'chemotherapy', 'vaccine', 'other'] },
      { name: 'pregnancyCategory', type: 'string', required: false, description: 'Pregnancy safety category' },
      { name: 'renalAdjustment', type: 'string', required: false, description: 'Dose adjustment for renal impairment' },
      { name: 'contraindications', type: 'array', required: false, description: 'Contraindications', arrayOf: 'string' },
    ],
    requiredRelationships: [],
    optionalRelationships: [
      { type: 'TREATED_BY', targetTypes: ['disease'] },
      { type: 'CONTRADICTS', targetTypes: ['disease', 'drug', 'age_group', 'context'] },
      { type: 'HAS_MONITORING', targetTypes: ['monitoring_parameter'] },
    ],
    versionable: true, inheritable: true, color: '#F59E0B',
  },
  guideline: {
    type: 'guideline', label: 'Guideline', description: 'A clinical practice guideline',
    properties: [
      { name: 'title', type: 'string', required: true, description: 'Guideline title' },
      { name: 'issuingBody', type: 'string', required: true, description: 'Issuing organization' },
      { name: 'year', type: 'number', required: true, description: 'Publication year' },
      { name: 'level', type: 'enum', required: true, description: 'Jurisdiction level', enumValues: ['global', 'national', 'regional', 'local'] },
      { name: 'country', type: 'string', required: false, description: 'Applicable country' },
    ],
    requiredRelationships: [
      { type: 'APPLIES_TO', targetTypes: ['disease', 'symptom', 'population'], min: 1 },
    ],
    optionalRelationships: [
      { type: 'OVERRIDES', targetTypes: ['guideline'] },
      { type: 'INHERITS_FROM', targetTypes: ['guideline'] },
    ],
    versionable: true, inheritable: true, color: '#6366F1',
  },
  body_system: {
    type: 'body_system', label: 'Body System', description: 'An anatomical-physiological system',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'System name' },
      { name: 'description', type: 'string', required: false, description: 'System description' },
    ],
    requiredRelationships: [],
    optionalRelationships: [
      { type: 'PART_OF', targetTypes: ['body_system'] },
      { type: 'HAS_ANATOMY', targetTypes: ['anatomy'] },
    ],
    versionable: false, inheritable: false, color: '#14B8A6',
  },
  question: {
    type: 'question', label: 'Question', description: 'A clinical history question',
    properties: [
      { name: 'text', type: 'string', required: true, description: 'Question text' },
      { name: 'dataType', type: 'enum', required: true, description: 'Expected answer type', enumValues: ['boolean', 'number', 'text', 'single_choice', 'multiple_choice', 'date'] },
      { name: 'options', type: 'array', required: false, description: 'For choice questions', arrayOf: 'string' },
      { name: 'order', type: 'number', required: false, description: 'Display order' },
    ],
    requiredRelationships: [
      { type: 'PART_OF', targetTypes: ['question_group', 'symptom'], min: 1 },
    ],
    optionalRelationships: [
      { type: 'ENABLES', targetTypes: ['question'] },
      { type: 'HIDES', targetTypes: ['question'] },
      { type: 'MODIFIES', targetTypes: ['phenotype', 'disease'] },
    ],
    versionable: true, inheritable: true, color: '#06B6D4',
  },
  context: {
    type: 'context', label: 'Context', description: 'A clinical context modifier',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Context name' },
      { name: 'category', type: 'enum', required: true, description: 'Context category', enumValues: ['age', 'pregnancy', 'comorbidity', 'immunosuppression', 'icu', 'community', 'hospital', 'resource_limited'] },
      { name: 'description', type: 'string', required: false, description: 'Context description' },
    ],
    requiredRelationships: [],
    optionalRelationships: [
      { type: 'MODIFIES', targetTypes: ['disease', 'treatment', 'investigation', 'guideline'] },
      { type: 'INHERITS_FROM', targetTypes: ['context'] },
    ],
    versionable: true, inheritable: true, color: '#A855F7',
  },
  sign: {
    type: 'sign', label: 'Sign', description: 'An objective clinical finding on examination',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Sign name' },
      { name: 'examinationType', type: 'enum', required: true, description: 'Type of exam', enumValues: ['inspection', 'palpation', 'percussion', 'auscultation', 'measurement', 'special_test'] },
      { name: 'bodySystem', type: 'string', required: false, description: 'Related body system' },
    ],
    requiredRelationships: [
      { type: 'SUPPORTS', targetTypes: ['phenotype', 'disease'], min: 1 },
    ],
    optionalRelationships: [
      { type: 'PART_OF', targetTypes: ['body_system', 'anatomy'] },
      { type: 'REQUIRES', targetTypes: ['investigation'] },
    ],
    versionable: true, inheritable: true, color: '#22C55E',
  },
  syndrome: {
    type: 'syndrome', label: 'Syndrome', description: 'A recognizable complex of symptoms and signs',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Syndrome name' },
      { name: 'features', type: 'array', required: true, description: 'Key features', arrayOf: 'string' },
    ],
    requiredRelationships: [
      { type: 'SUGGESTS', targetTypes: ['disease'], min: 1 },
    ],
    optionalRelationships: [
      { type: 'HAS_SYMPTOM', targetTypes: ['symptom'] },
      { type: 'HAS_SIGN', targetTypes: ['sign'] },
    ],
    versionable: true, inheritable: true, color: '#E11D48',
  },
  etiology: {
    type: 'etiology', label: 'Etiology', description: 'A cause of disease',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Etiology name' },
      { name: 'category', type: 'enum', required: true, description: 'Category', enumValues: ['infectious', 'genetic', 'environmental', 'idiopathic', 'iatrogenic', 'autoimmune', 'degenerative', 'traumatic', 'neoplastic', 'congenital'] },
    ],
    requiredRelationships: [
      { type: 'CAUSES', targetTypes: ['disease'], min: 1 },
    ],
    optionalRelationships: [],
    versionable: true, inheritable: false, color: '#F97316',
  },
  risk_factor: {
    type: 'risk_factor', label: 'Risk Factor', description: 'A factor that increases disease risk',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Factor name' },
      { name: 'type', type: 'enum', required: true, description: 'Modifiability', enumValues: ['modifiable', 'non_modifiable', 'environmental', 'genetic'] },
      { name: 'relativeRisk', type: 'number', required: false, description: 'Relative risk increase' },
    ],
    requiredRelationships: [
      { type: 'PREDISPOSES', targetTypes: ['disease'], min: 1 },
    ],
    optionalRelationships: [],
    versionable: true, inheritable: false, color: '#D97706',
  },
  complication: {
    type: 'complication', label: 'Complication', description: 'An adverse event resulting from a disease or treatment',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Complication name' },
      { name: 'frequency', type: 'enum', required: true, description: 'How common', enumValues: ['common', 'uncommon', 'rare'] },
      { name: 'severity', type: 'enum', required: true, description: 'Severity', enumValues: ['mild', 'moderate', 'severe', 'life_threatening'] },
    ],
    requiredRelationships: [
      { type: 'COMPLICATES', targetTypes: ['disease', 'treatment', 'procedure'], min: 1 },
    ],
    optionalRelationships: [],
    versionable: true, inheritable: false, color: '#DC2626',
  },
  treatment: {
    type: 'treatment', label: 'Treatment', description: 'A therapeutic intervention',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Treatment name' },
      { name: 'type', type: 'enum', required: true, description: 'Treatment type', enumValues: ['medication', 'procedure', 'surgery', 'therapy', 'supportive', 'monitoring'] },
    ],
    requiredRelationships: [],
    optionalRelationships: [
      { type: 'TREATED_BY', targetTypes: ['disease'] },
      { type: 'REQUIRES', targetTypes: ['monitoring_parameter'] },
    ],
    versionable: true, inheritable: true, color: '#84CC16',
  },
  procedure: {
    type: 'procedure', label: 'Procedure', description: 'A medical or surgical procedure',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Procedure name' },
      { name: 'category', type: 'enum', required: false, description: 'Category', enumValues: ['diagnostic', 'therapeutic', 'palliative', 'cosmetic'] },
      { name: 'specialty', type: 'string', required: false, description: 'Performing specialty' },
    ],
    requiredRelationships: [],
    optionalRelationships: [
      { type: 'TREATED_BY', targetTypes: ['disease'] },
      { type: 'HAS_COMPLICATION', targetTypes: ['complication'] },
    ],
    versionable: true, inheritable: true, color: '#0EA5E9',
  },
  score: {
    type: 'score', label: 'Score', description: 'A clinical scoring system',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Score name' },
      { name: 'minScore', type: 'number', required: false, description: 'Minimum possible score' },
      { name: 'maxScore', type: 'number', required: false, description: 'Maximum possible score' },
      { name: 'thresholds', type: 'object', required: false, description: 'Risk thresholds' },
    ],
    requiredRelationships: [],
    optionalRelationships: [
      { type: 'HAS_SCORE', targetTypes: ['disease'] },
    ],
    versionable: true, inheritable: false, color: '#06B6D4',
  },
  monitoring_parameter: {
    type: 'monitoring_parameter', label: 'Monitoring Parameter', description: 'A parameter to monitor during treatment',
    properties: [
      { name: 'name', type: 'string', required: true, description: 'Parameter name' },
      { name: 'frequency', type: 'string', required: false, description: 'Monitoring frequency' },
      { name: 'target', type: 'string', required: false, description: 'Target value/range' },
    ],
    requiredRelationships: [],
    optionalRelationships: [
      { type: 'MONITORED_BY', targetTypes: ['disease', 'treatment', 'drug'] },
    ],
    versionable: true, inheritable: true, color: '#2DD4BF',
  },
  anatomy: { type: 'anatomy', label: 'Anatomy', description: 'An anatomical structure', properties: [{ name: 'name', type: 'string', required: true, description: 'Structure name' }], requiredRelationships: [], optionalRelationships: [{ type: 'PART_OF', targetTypes: ['anatomy', 'body_system'] }], versionable: false, inheritable: false, color: '#34D399' },
  age_group: { type: 'age_group', label: 'Age Group', description: 'A patient age category', properties: [{ name: 'name', type: 'string', required: true, description: 'Group name' }, { name: 'minAge', type: 'number', required: false, description: 'Minimum age in days' }, { name: 'maxAge', type: 'number', required: false, description: 'Maximum age in days' }], requiredRelationships: [], optionalRelationships: [{ type: 'MODIFIES', targetTypes: ['disease', 'symptom', 'treatment'] }], versionable: false, inheritable: true, color: '#A3E635' },
  population: { type: 'population', label: 'Population', description: 'A patient population group', properties: [{ name: 'name', type: 'string', required: true, description: 'Population name' }, { name: 'description', type: 'string', required: false, description: 'Population description' }], requiredRelationships: [], optionalRelationships: [{ type: 'APPLIES_TO', targetTypes: ['guideline', 'disease'] }], versionable: false, inheritable: true, color: '#65A30D' },
  question_group: { type: 'question_group', label: 'Question Group', description: 'A group of related questions', properties: [{ name: 'name', type: 'string', required: true, description: 'Group name' }, { name: 'order', type: 'number', required: false, description: 'Display order' }], requiredRelationships: [], optionalRelationships: [{ type: 'PART_OF', targetTypes: ['symptom'] }], versionable: true, inheritable: true, color: '#7DD3FC' },
  monitoring_protocol: { type: 'monitoring_protocol', label: 'Monitoring Protocol', description: 'A structured monitoring plan', properties: [{ name: 'name', type: 'string', required: true, description: 'Protocol name' }, { name: 'parameters', type: 'array', required: true, arrayOf: 'string', description: 'Parameters to monitor' }], requiredRelationships: [], optionalRelationships: [{ type: 'MONITORED_BY', targetTypes: ['disease'] }], versionable: true, inheritable: true, color: '#5EEAD4' },
  documentation_template: { type: 'documentation_template', label: 'Documentation Template', description: 'A clinical documentation template', properties: [{ name: 'name', type: 'string', required: true, description: 'Template name' }, { name: 'type', type: 'enum', required: true, enumValues: ['admission', 'discharge', 'ward_round', 'clinic_note', 'operative_note', 'referral', 'death_summary'], description: 'Document type' }], requiredRelationships: [], optionalRelationships: [{ type: 'HAS_DOCUMENTATION', targetTypes: ['disease', 'symptom'] }], versionable: true, inheritable: false, color: '#94A3B8' },
  specialty: { type: 'specialty', label: 'Specialty', description: 'A medical specialty', properties: [{ name: 'name', type: 'string', required: true, description: 'Specialty name' }], requiredRelationships: [], optionalRelationships: [], versionable: false, inheritable: false, color: '#CBD5E1' },
  department: { type: 'department', label: 'Department', description: 'A hospital department', properties: [{ name: 'name', type: 'string', required: true, description: 'Department name' }, { name: 'code', type: 'string', required: false, description: 'Department code' }], requiredRelationships: [], optionalRelationships: [{ type: 'PART_OF', targetTypes: ['organization'] }], versionable: false, inheritable: false, color: '#E2E8F0' },
  organization: { type: 'organization', label: 'Organization', description: 'A healthcare organization', properties: [{ name: 'name', type: 'string', required: true, description: 'Organization name' }], requiredRelationships: [], optionalRelationships: [], versionable: false, inheritable: false, color: '#F1F5F9' },
  country: { type: 'country', label: 'Country', description: 'A country', properties: [{ name: 'name', type: 'string', required: true, description: 'Country name' }, { name: 'code', type: 'string', required: false, description: 'ISO country code' }], requiredRelationships: [], optionalRelationships: [{ type: 'INHERITS_FROM', targetTypes: ['country'] }], versionable: false, inheritable: true, color: '#CBD5E1' },
  region: { type: 'region', label: 'Region', description: 'A subnational region', properties: [{ name: 'name', type: 'string', required: true, description: 'Region name' }], requiredRelationships: [], optionalRelationships: [{ type: 'PART_OF', targetTypes: ['country'] }], versionable: false, inheritable: true, color: '#E2E8F0' },
  protocol: { type: 'protocol', label: 'Protocol', description: 'A clinical protocol', properties: [{ name: 'name', type: 'string', required: true, description: 'Protocol name' }, { name: 'steps', type: 'array', required: true, arrayOf: 'string', description: 'Protocol steps' }], requiredRelationships: [], optionalRelationships: [{ type: 'HAS_PROTOCOL', targetTypes: ['disease'] }], versionable: true, inheritable: true, color: '#A78BFA' },
  clinical_pathway: { type: 'clinical_pathway', label: 'Clinical Pathway', description: 'A structured patient care pathway', properties: [{ name: 'name', type: 'string', required: true, description: 'Pathway name' }, { name: 'duration', type: 'string', required: false, description: 'Expected duration' }], requiredRelationships: [], optionalRelationships: [{ type: 'HAS_PATHWAY', targetTypes: ['disease'] }], versionable: true, inheritable: true, color: '#C084FC' },
  imaging: { type: 'imaging', label: 'Imaging', description: 'An imaging study', properties: [{ name: 'name', type: 'string', required: true, description: 'Study name' }, { name: 'modality', type: 'enum', required: true, enumValues: ['xray', 'ct', 'mri', 'ultrasound', 'nuclear_medicine', 'angiography'], description: 'Imaging modality' }], requiredRelationships: [], optionalRelationships: [{ type: 'CONFIRMED_BY', targetTypes: ['disease'] }], versionable: true, inheritable: false, color: '#22D3EE' },
  imaging_finding: { type: 'imaging_finding', label: 'Imaging Finding', description: 'A finding on an imaging study', properties: [{ name: 'name', type: 'string', required: true, description: 'Finding name' }, { name: 'description', type: 'string', required: false, description: 'Finding description' }], requiredRelationships: [], optionalRelationships: [{ type: 'SUPPORTS', targetTypes: ['disease', 'phenotype'] }], versionable: true, inheritable: false, color: '#67E8F9' },
  investigation_result: { type: 'investigation_result', label: 'Investigation Result', description: 'A specific pattern of investigation results', properties: [{ name: 'name', type: 'string', required: true, description: 'Result pattern name' }], requiredRelationships: [], optionalRelationships: [{ type: 'SUPPORTS', targetTypes: ['disease', 'phenotype'] }], versionable: true, inheritable: true, color: '#6EE7B7' },
  surgery: { type: 'surgery', label: 'Surgery', description: 'A surgical operation', properties: [{ name: 'name', type: 'string', required: true, description: 'Surgery name' }], requiredRelationships: [], optionalRelationships: [{ type: 'TREATED_BY', targetTypes: ['disease'] }], versionable: true, inheritable: true, color: '#FB923C' },
  therapy: { type: 'therapy', label: 'Therapy', description: 'A non-pharmacological, non-surgical therapy', properties: [{ name: 'name', type: 'string', required: true, description: 'Therapy name' }, { name: 'category', type: 'string', required: false, description: 'Therapy category' }], requiredRelationships: [], optionalRelationships: [{ type: 'TREATED_BY', targetTypes: ['disease'] }], versionable: true, inheritable: true, color: '#FBBF24' },
  learning_module: { type: 'learning_module', label: 'Learning Module', description: 'A medical education resource', properties: [{ name: 'name', type: 'string', required: true, description: 'Module name' }, { name: 'objectives', type: 'array', required: false, arrayOf: 'string', description: 'Learning objectives' }], requiredRelationships: [], optionalRelationships: [{ type: 'LEARNING_RESOURCE', targetTypes: ['disease', 'symptom'] }], versionable: true, inheritable: false, color: '#C4B5FD' },
  teaching_resource: { type: 'teaching_resource', label: 'Teaching Resource', description: 'A teaching resource', properties: [{ name: 'name', type: 'string', required: true, description: 'Resource name' }], requiredRelationships: [], optionalRelationships: [{ type: 'TEACHING_OBJECTIVE', targetTypes: ['disease'] }], versionable: true, inheritable: false, color: '#DDD6FE' },
  public_health_indicator: { type: 'public_health_indicator', label: 'Public Health Indicator', description: 'A public health reporting indicator', properties: [{ name: 'name', type: 'string', required: true, description: 'Indicator name' }, { name: 'code', type: 'string', required: false, description: 'Reporting code' }], requiredRelationships: [], optionalRelationships: [{ type: 'APPLIES_TO', targetTypes: ['disease'] }], versionable: true, inheritable: false, color: '#86EFAC' },
  registry: { type: 'registry', label: 'Registry', description: 'A disease registry', properties: [{ name: 'name', type: 'string', required: true, description: 'Registry name' }], requiredRelationships: [], optionalRelationships: [{ type: 'REFERENCED_BY', targetTypes: ['disease'] }], versionable: true, inheritable: false, color: '#BEF264' },
  code_system: { type: 'code_system', label: 'Code System', description: 'A medical coding system', properties: [{ name: 'name', type: 'string', required: true, description: 'System name' }, { name: 'version', type: 'string', required: false, description: 'System version' }], requiredRelationships: [], optionalRelationships: [{ type: 'MAPS_TO', targetTypes: ['code_system'] }], versionable: true, inheritable: false, color: '#FDE68A' },
  code_mapping: { type: 'code_mapping', label: 'Code Mapping', description: 'A mapping between codes in different systems', properties: [{ name: 'sourceCode', type: 'string', required: true, description: 'Source code' }, { name: 'targetCode', type: 'string', required: true, description: 'Target code' }], requiredRelationships: [], optionalRelationships: [], versionable: true, inheritable: false, color: '#FEF3C7' },
  organ: { type: 'organ', label: 'Organ', description: 'A body organ', properties: [{ name: 'name', type: 'string', required: true, description: 'Organ name' }], requiredRelationships: [], optionalRelationships: [{ type: 'PART_OF', targetTypes: ['body_system'] }], versionable: false, inheritable: false, color: '#6EE7B7' },
  tissue: { type: 'tissue', label: 'Tissue', description: 'A biological tissue type', properties: [{ name: 'name', type: 'string', required: true, description: 'Tissue name' }], requiredRelationships: [], optionalRelationships: [{ type: 'PART_OF', targetTypes: ['organ'] }], versionable: false, inheritable: false, color: '#A7F3D0' },
  score_component: { type: 'score_component', label: 'Score Component', description: 'A component of a clinical scoring system', properties: [{ name: 'name', type: 'string', required: true, description: 'Component name' }, { name: 'points', type: 'number', required: true, description: 'Points assigned' }], requiredRelationships: [{ type: 'PART_OF', targetTypes: ['score'], min: 1 }], optionalRelationships: [], versionable: true, inheritable: false, color: '#67E8F9' },
};

export const INHERITANCE_HIERARCHY: InheritanceRule[] = [
  { level: 'global', overrides: [], priority: 0, propagateDown: true },
  { level: 'country', overrides: ['OVERRIDES', 'APPLIES_TO'], priority: 1, propagateDown: true },
  { level: 'region', overrides: ['OVERRIDES', 'APPLIES_TO'], priority: 2, propagateDown: true },
  { level: 'organization', overrides: ['OVERRIDES', 'APPLIES_TO'], priority: 3, propagateDown: false },
  { level: 'department', overrides: ['OVERRIDES', 'APPLIES_TO'], priority: 4, propagateDown: false },
  { level: 'individual', overrides: ['OVERRIDES'], priority: 5, propagateDown: false },
];

export function createEmptyGraph(name = 'AMEXAN Clinical Knowledge Graph'): KnowledgeGraph {
  return {
    id: `kg_${Date.now()}`,
    name,
    version: '1.0.0',
    nodes: new Map(),
    relationships: new Map(),
    properties: [],
    inheritanceRules: INHERITANCE_HIERARCHY,
    versionHistory: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function addNode(graph: KnowledgeGraph, node: GraphNode): KnowledgeGraph {
  const updated = new Map(graph.nodes);
  updated.set(node.id, node);
  return { ...graph, nodes: updated, updatedAt: Date.now() };
}

export function addRelationship(graph: KnowledgeGraph, rel: GraphRelationship): KnowledgeGraph {
  const updated = new Map(graph.relationships);
  updated.set(rel.id, rel);
  return { ...graph, relationships: updated, updatedAt: Date.now() };
}

export function findNodesByType(graph: KnowledgeGraph, type: NodeType): GraphNode[] {
  return Array.from(graph.nodes.values()).filter(n => n.type === type);
}

export function findRelationshipsFrom(graph: KnowledgeGraph, nodeId: string): GraphRelationship[] {
  return Array.from(graph.relationships.values()).filter(r => r.sourceId === nodeId);
}

export function findRelationshipsTo(graph: KnowledgeGraph, nodeId: string): GraphRelationship[] {
  return Array.from(graph.relationships.values()).filter(r => r.targetId === nodeId);
}

export function traverseGraph(graph: KnowledgeGraph, startId: string, maxDepth = 3): { nodes: GraphNode[]; relationships: GraphRelationship[] } {
  const visited = new Set<string>();
  const resultNodes: GraphNode[] = [];
  const resultRels: GraphRelationship[] = [];
  const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }];
  visited.add(startId);

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    const node = graph.nodes.get(id);
    if (node) resultNodes.push(node);
    if (depth >= maxDepth) continue;

    const outgoing = findRelationshipsFrom(graph, id);
    for (const rel of outgoing) {
      resultRels.push(rel);
      if (!visited.has(rel.targetId)) {
        visited.add(rel.targetId);
        queue.push({ id: rel.targetId, depth: depth + 1 });
      }
    }
    const incoming = findRelationshipsTo(graph, id);
    for (const rel of incoming) {
      resultRels.push(rel);
      if (!visited.has(rel.sourceId)) {
        visited.add(rel.sourceId);
        queue.push({ id: rel.sourceId, depth: depth + 1 });
      }
    }
  }

  return { nodes: resultNodes, relationships: resultRels };
}
