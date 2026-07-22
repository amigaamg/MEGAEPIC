// ═══════════════════════════════════════════════════════════════════
// AMEXAN CANONICAL RELATIONSHIP SPECIFICATION (CRS)
// Document: ACDM-CRS-001
// Every relationship between canonical entities.
// ═══════════════════════════════════════════════════════════════════

export type RelationshipCardinality = '1:1' | '1:N' | 'N:1' | 'N:N';
export type RelationshipDirection = 'unidirectional' | 'bidirectional';
export type RelationshipType =
  | 'owns' | 'contains' | 'belongs_to' | 'performs' | 'receives'
  | 'records' | 'generates' | 'supports' | 'requires' | 'references'
  | 'uses' | 'produces' | 'allocates' | 'assigns' | 'supervises'
  | 'authorizes' | 'communicates_with' | 'depends_on' | 'derived_from'
  | 'associated_with' | 'prescribes' | 'administers' | 'treats'
  | 'diagnoses' | 'orders' | 'results_in' | 'leads_to'
  | 'addresses' | 'includes' | 'excludes' | 'contraindicates';

export type RelationshipLifecycleState =
  | 'proposed' | 'established' | 'active' | 'suspended' | 'ended' | 'archived';

export interface RelationshipSpec {
  relationshipName: string;
  relationshipCode: string;
  description: string;
  sourceEntity: string;
  targetEntity: string;
  relationshipType: RelationshipType;
  cardinality: RelationshipCardinality;
  multiplicitySource: 'required' | 'optional' | 'conditional';
  multiplicityTarget: 'required' | 'optional' | 'conditional';
  direction: RelationshipDirection;
  lifecycle: RelationshipLifecycleState[];
  validityPeriod: { start?: boolean; end?: boolean; reason?: boolean };
  businessRules: Array<{ ruleId: string; description: string; severity: 'info' | 'warning' | 'error' | 'critical' }>;
  domainEvents: Array<{ eventName: string; trigger: string }>;
  auditRequired: boolean;
  aiRelevance: 'high' | 'medium' | 'low' | 'none';
  version: string;
}

export const RELATIONSHIP_CATALOG: Record<string, RelationshipSpec> = {};

export function defineRelationship(spec: RelationshipSpec): RelationshipSpec {
  RELATIONSHIP_CATALOG[spec.relationshipCode] = spec;
  return spec;
}

// ─── PATIENT RELATIONSHIPS ────────────────────────────────────────

export const PATIENT_HAS_ENCOUNTER = defineRelationship({
  relationshipName: 'Patient has Encounter',
  relationshipCode: 'REL-PATIENT-HAS-ENCOUNTER',
  description: 'A patient may have many encounters over their lifetime. Each encounter belongs to exactly one patient.',
  sourceEntity: 'Patient',
  targetEntity: 'Encounter',
  relationshipType: 'belongs_to',
  cardinality: '1:N',
  multiplicitySource: 'required',
  multiplicityTarget: 'optional',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'ended', 'archived'],
  validityPeriod: { start: true, end: true, reason: false },
  businessRules: [
    { ruleId: 'REL-BR-001', description: 'An Encounter cannot exist without exactly one Patient', severity: 'critical' },
    { ruleId: 'REL-BR-002', description: 'A deceased Patient may have existing Encounters but no new ones', severity: 'error' },
  ],
  domainEvents: [
    { eventName: 'Patient Linked to Encounter', trigger: 'Encounter created' },
    { eventName: 'Encounter Reassigned', trigger: 'Patient correction' },
  ],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

export const PATIENT_HAS_DIAGNOSIS = defineRelationship({
  relationshipName: 'Patient has Diagnosis',
  relationshipCode: 'REL-PATIENT-HAS-DIAGNOSIS',
  description: 'A patient may have one or more diagnoses recorded.',
  sourceEntity: 'Patient',
  targetEntity: 'Diagnosis',
  relationshipType: 'diagnoses',
  cardinality: '1:N',
  multiplicitySource: 'required',
  multiplicityTarget: 'optional',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: true, reason: false },
  businessRules: [
    { ruleId: 'REL-BR-003', description: 'A Diagnosis must belong to a Patient', severity: 'critical' },
  ],
  domainEvents: [{ eventName: 'Diagnosis Added', trigger: 'Diagnosis recorded' }],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

export const PATIENT_HAS_ALLERGY = defineRelationship({
  relationshipName: 'Patient has Allergy',
  relationshipCode: 'REL-PATIENT-HAS-ALLERGY',
  description: 'A patient may have zero or more allergies or intolerances.',
  sourceEntity: 'Patient',
  targetEntity: 'Allergy',
  relationshipType: 'associated_with',
  cardinality: '1:N',
  multiplicitySource: 'required',
  multiplicityTarget: 'optional',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: true, reason: true },
  businessRules: [
    { ruleId: 'REL-BR-004', description: 'Allergy must reference a valid Patient', severity: 'critical' },
  ],
  domainEvents: [{ eventName: 'Allergy Recorded', trigger: 'Allergy documented' }],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

export const PATIENT_HAS_MEDICATION_ORDER = defineRelationship({
  relationshipName: 'Patient has Medication Order',
  relationshipCode: 'REL-PATIENT-HAS-MEDICATION-ORDER',
  description: 'A patient may have medication orders prescribed.',
  sourceEntity: 'Patient',
  targetEntity: 'Medication Order',
  relationshipType: 'receives',
  cardinality: '1:N',
  multiplicitySource: 'required',
  multiplicityTarget: 'optional',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: true, reason: true },
  businessRules: [
    { ruleId: 'REL-BR-005', description: 'A Medication Order must belong to a Patient', severity: 'critical' },
    { ruleId: 'REL-BR-006', description: 'Allergy check required before prescribing', severity: 'critical' },
  ],
  domainEvents: [{ eventName: 'Medication Prescribed', trigger: 'Order created' }],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

// ─── ENCOUNTER RELATIONSHIPS ─────────────────────────────────────

export const ENCOUNTER_CONTAINS_OBSERVATION = defineRelationship({
  relationshipName: 'Encounter contains Observation',
  relationshipCode: 'REL-ENCOUNTER-CONTAINS-OBSERVATION',
  description: 'An encounter may contain many clinical observations.',
  sourceEntity: 'Encounter',
  targetEntity: 'Observation',
  relationshipType: 'contains',
  cardinality: '1:N',
  multiplicitySource: 'optional',
  multiplicityTarget: 'optional',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'archived'],
  validityPeriod: { start: true, end: false, reason: false },
  businessRules: [
    { ruleId: 'REL-BR-007', description: 'An Observation should reference an Encounter', severity: 'warning' },
  ],
  domainEvents: [{ eventName: 'Observation Recorded', trigger: 'Observation added to encounter' }],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

export const ENCOUNTER_INCLUDES_PROCEDURE = defineRelationship({
  relationshipName: 'Encounter includes Procedure',
  relationshipCode: 'REL-ENCOUNTER-INCLUDES-PROCEDURE',
  description: 'An encounter may include one or more procedures.',
  sourceEntity: 'Encounter',
  targetEntity: 'Procedure',
  relationshipType: 'contains',
  cardinality: '1:N',
  multiplicitySource: 'optional',
  multiplicityTarget: 'required',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: true, reason: false },
  businessRules: [],
  domainEvents: [{ eventName: 'Procedure Added to Encounter', trigger: 'Procedure started' }],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

export const ENCOUNTER_GENERATES_DOCUMENT = defineRelationship({
  relationshipName: 'Encounter generates Clinical Document',
  relationshipCode: 'REL-ENCOUNTER-GENERATES-DOCUMENT',
  description: 'An encounter may generate one or more clinical documents.',
  sourceEntity: 'Encounter',
  targetEntity: 'Clinical Document',
  relationshipType: 'generates',
  cardinality: '1:N',
  multiplicitySource: 'optional',
  multiplicityTarget: 'required',
  direction: 'unidirectional',
  lifecycle: ['established', 'active', 'archived'],
  validityPeriod: { start: true, end: false, reason: false },
  businessRules: [],
  domainEvents: [{ eventName: 'Document Generated', trigger: 'Document created in encounter' }],
  auditRequired: true,
  aiRelevance: 'medium',
  version: '1.0.0',
});

// ─── DIAGNOSIS RELATIONSHIPS ─────────────────────────────────────

export const DIAGNOSIS_SUPPORTED_BY_OBSERVATION = defineRelationship({
  relationshipName: 'Diagnosis supported by Observation',
  relationshipCode: 'REL-DIAGNOSIS-SUPPORTED-BY-OBSERVATION',
  description: 'A diagnosis may be supported by one or more clinical observations.',
  sourceEntity: 'Diagnosis',
  targetEntity: 'Observation',
  relationshipType: 'supports',
  cardinality: 'N:N',
  multiplicitySource: 'optional',
  multiplicityTarget: 'optional',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: false, reason: false },
  businessRules: [
    { ruleId: 'REL-BR-008', description: 'A confirmed Diagnosis should have at least one supporting Observation', severity: 'warning' },
  ],
  domainEvents: [{ eventName: 'Diagnosis Linked to Observation', trigger: 'Evidence association' }],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

export const DIAGNOSIS_DRIVES_CARE_PLAN = defineRelationship({
  relationshipName: 'Diagnosis drives Care Plan',
  relationshipCode: 'REL-DIAGNOSIS-DRIVES-CARE-PLAN',
  description: 'A diagnosis may drive one or more care plans.',
  sourceEntity: 'Diagnosis',
  targetEntity: 'Care Plan',
  relationshipType: 'leads_to',
  cardinality: '1:N',
  multiplicitySource: 'optional',
  multiplicityTarget: 'optional',
  direction: 'unidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: true, reason: true },
  businessRules: [],
  domainEvents: [{ eventName: 'Care Plan Created from Diagnosis', trigger: 'Care plan activation' }],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

// ─── PROVIDER RELATIONSHIPS ──────────────────────────────────────

export const PROVIDER_PERFORMS_ENCOUNTER = defineRelationship({
  relationshipName: 'Provider performs Encounter',
  relationshipCode: 'REL-PROVIDER-PERFORMS-ENCOUNTER',
  description: 'A healthcare provider may perform many encounters.',
  sourceEntity: 'Provider',
  targetEntity: 'Encounter',
  relationshipType: 'performs',
  cardinality: '1:N',
  multiplicitySource: 'required',
  multiplicityTarget: 'optional',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: true, reason: false },
  businessRules: [
    { ruleId: 'REL-BR-009', description: 'An Encounter must have at least one assigned Provider', severity: 'critical' },
  ],
  domainEvents: [{ eventName: 'Provider Assigned to Encounter', trigger: 'Provider assigned' }],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

export const PROVIDER_EMPLOYED_BY_ORGANIZATION = defineRelationship({
  relationshipName: 'Provider employed by Organization',
  relationshipCode: 'REL-PROVIDER-EMPLOYED-BY-ORGANIZATION',
  description: 'A provider is employed by an organization.',
  sourceEntity: 'Provider',
  targetEntity: 'Organization',
  relationshipType: 'belongs_to',
  cardinality: 'N:1',
  multiplicitySource: 'required',
  multiplicityTarget: 'required',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: true, reason: true },
  businessRules: [],
  domainEvents: [{ eventName: 'Provider Employed', trigger: 'Employment created' }],
  auditRequired: true,
  aiRelevance: 'low',
  version: '1.0.0',
});

export const PROVIDER_PRESCRIBES_MEDICATION = defineRelationship({
  relationshipName: 'Provider prescribes Medication',
  relationshipCode: 'REL-PROVIDER-PRESCRIBES-MEDICATION',
  description: 'A provider prescribes medications for patients.',
  sourceEntity: 'Provider',
  targetEntity: 'Medication Order',
  relationshipType: 'prescribes',
  cardinality: '1:N',
  multiplicitySource: 'required',
  multiplicityTarget: 'required',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: false, reason: false },
  businessRules: [
    { ruleId: 'REL-BR-010', description: 'Only licensed prescribers may create Medication Orders', severity: 'critical' },
  ],
  domainEvents: [{ eventName: 'Medication Prescribed by Provider', trigger: 'Order signed' }],
  auditRequired: true,
  aiRelevance: 'medium',
  version: '1.0.0',
});

// ─── ORGANIZATION RELATIONSHIPS ──────────────────────────────────

export const ORGANIZATION_OWNS_FACILITY = defineRelationship({
  relationshipName: 'Organization owns Facility',
  relationshipCode: 'REL-ORGANIZATION-OWNS-FACILITY',
  description: 'An organization may own one or more facilities.',
  sourceEntity: 'Organization',
  targetEntity: 'Facility',
  relationshipType: 'owns',
  cardinality: '1:N',
  multiplicitySource: 'required',
  multiplicityTarget: 'optional',
  direction: 'bidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: true, reason: true },
  businessRules: [],
  domainEvents: [{ eventName: 'Facility Added to Organization', trigger: 'Facility created' }],
  auditRequired: true,
  aiRelevance: 'low',
  version: '1.0.0',
});

// ─── MEDICATION RELATIONSHIPS ────────────────────────────────────

export const MEDICATION_ORDER_AUTHORIZES_ADMIN = defineRelationship({
  relationshipName: 'Medication Order authorizes Administration',
  relationshipCode: 'REL-MEDICATION-ORDER-AUTHORIZES-ADMINISTRATION',
  description: 'A medication order authorizes multiple administrations.',
  sourceEntity: 'Medication Order',
  targetEntity: 'Medication Administration',
  relationshipType: 'authorizes',
  cardinality: '1:N',
  multiplicitySource: 'required',
  multiplicityTarget: 'optional',
  direction: 'unidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: true, reason: false },
  businessRules: [
    { ruleId: 'REL-BR-011', description: 'Medication Administration must reference an active Order', severity: 'critical' },
  ],
  domainEvents: [{ eventName: 'Medication Administered', trigger: 'Dose given' }],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

export const ALLERGY_CONTRAINDICATES_MEDICATION = defineRelationship({
  relationshipName: 'Allergy contraindicates Medication',
  relationshipCode: 'REL-ALLERGY-CONTRAINDICATES-MEDICATION',
  description: 'An allergy may contraindicate specific medications.',
  sourceEntity: 'Allergy',
  targetEntity: 'Medication Order',
  relationshipType: 'contraindicates',
  cardinality: 'N:N',
  multiplicitySource: 'optional',
  multiplicityTarget: 'optional',
  direction: 'unidirectional',
  lifecycle: ['established', 'active', 'ended'],
  validityPeriod: { start: true, end: true, reason: false },
  businessRules: [
    { ruleId: 'REL-BR-012', description: 'Allergy check must be performed before prescribing', severity: 'critical' },
  ],
  domainEvents: [{ eventName: 'Allergy Alert Triggered', trigger: 'Contraindication detected' }],
  auditRequired: true,
  aiRelevance: 'high',
  version: '1.0.0',
});

// ─── KNOWLEDGE GRAPH EDGE SET ────────────────────────────────────

/**
 * The relationship catalog forms the edges of the AMEXAN Knowledge Graph.
 * Entities are nodes, relationships are edges.
 *
 * Patient ──has──▶ Encounter
 * Encounter ──contains──▶ Observation
 * Observation ──supports──▶ Diagnosis
 * Diagnosis ──drives──▶ Care Plan
 * Care Plan ──includes──▶ Intervention
 * Provider ──performs──▶ Encounter
 * Provider ──prescribes──▶ Medication Order
 * Medication Order ──authorizes──▶ Medication Administration
 * Allergy ──contraindicates──▶ Medication Order
 * Patient ──has──▶ Allergy
 * Patient ──has──▶ Diagnosis
 * Organization ──owns──▶ Facility
 * Facility ──contains──▶ Department
 * Patient ──assigned to──▶ Provider
 * Encounter ──generates──▶ Clinical Document
 * Encounter ──includes──▶ Procedure
 * Investigation ──produces──▶ Observation
 * Specimen ──used for──▶ Investigation
 * Appointment ──generates──▶ Encounter
 * Consent ──authorizes──▶ Procedure
 */
