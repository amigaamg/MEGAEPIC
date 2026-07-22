// ═══════════════════════════════════════════════════════════════════
// AMEXAN CANONICAL ENTITY SPECIFICATION (CES) — Entity Catalog
// Document: ACDM-CES-001
// Every entity in the AMEXAN Healthcare Operating System.
// ═══════════════════════════════════════════════════════════════════

import {
  EntitySpecification, EntityRelationshipSpec, EntityLifecycleSpec,
  BusinessRuleSpec, DomainEventSpec, AttributeSpec, ValidationSpec,
  AccessPolicy, AuditRequirement, PrivacyRequirement, InteropMapping,
  AiPermission, SecurityClassification,
} from './meta';

// ─── Helper to create entity specs ───────────────────────────────
export function defineEntity(spec: EntitySpecification): EntitySpecification {
  return spec;
}

// ═══════════════════════════════════════════════════════════════════
// CATALOG INDEX
// ═══════════════════════════════════════════════════════════════════

export const ENTITY_CATALOG: Record<string, EntitySpecification> = {};

export function register(...specs: EntitySpecification[]) {
  for (const s of specs) {
    ENTITY_CATALOG[s.canonicalCode] = s;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 1. PATIENT (ENTITY-PATIENT)
// ═══════════════════════════════════════════════════════════════════

export const PATIENT_SPEC = defineEntity({
  canonicalName: 'Patient',
  canonicalCode: 'ENTITY-PATIENT',
  entityCategory: 'entity',
  domain: 'Clinical',
  owningEngine: 'Patient Engine',
  definition: 'A Person who receives or is eligible to receive healthcare services. The Patient is the central entity around which all clinical activity revolves.',
  purpose: 'To uniquely identify and track an individual through all encounters, episodes, and healthcare interactions across the entire platform.',
  responsibilities: [
    'Maintain canonical patient identity across all modules',
    'Store demographic and contact information',
    'Track legal identifiers (national ID, hospital number, insurance ID)',
    'Record next of kin and emergency contacts',
    'Support patient merge and split operations',
    'Maintain deceased status',
  ],
  nonResponsibilities: [
    'Does NOT own clinical data (diagnoses, encounters, medications)',
    'Does NOT own billing information',
    'Does NOT own appointment scheduling',
  ],
  stakeholders: ['Registration', 'Clinicians', 'Nurses', 'Administrators', 'Patients', 'Researchers'],
  businessProcesses: ['Registration', 'Consultation', 'Admission', 'Billing', 'Discharge', 'Research'],
  clinicalSignificance: 'The Patient is the foundational entity. Every clinical action is performed on behalf of a patient. Patient identity integrity is critical for patient safety.',
  relationships: [
    { relatedEntity: 'Encounter', relationshipType: 'has', cardinality: '1:N', description: 'A patient may have many encounters', constraints: [] },
    { relatedEntity: 'Provider', relationshipType: 'assigned to', cardinality: 'N:N', description: 'Providers are assigned to patients', constraints: [] },
    { relatedEntity: 'Organization', relationshipType: 'registered at', cardinality: 'N:1', description: 'Patient is registered at an organization', constraints: [] },
    { relatedEntity: 'Allergy', relationshipType: 'has', cardinality: '1:N', description: 'Patient may have allergies', constraints: [] },
    { relatedEntity: 'Diagnosis', relationshipType: 'has', cardinality: '1:N', description: 'Patient may have diagnoses', constraints: [] },
  ],
  lifecycle: {
    states: ['Draft', 'Registered', 'Verified', 'Active', 'Deceased', 'Archived'],
    transitions: [
      { from: 'Draft', to: 'Registered', trigger: 'Identity captured and saved', actor: 'Registration', validationRules: ['Name required', 'DOB required'] },
      { from: 'Registered', to: 'Verified', trigger: 'Identity verified against legal document', actor: 'Registration', validationRules: ['Verification document required'] },
      { from: 'Verified', to: 'Active', trigger: 'Patient receives first clinical service', actor: 'System', validationRules: [] },
      { from: 'Active', to: 'Deceased', trigger: 'Death recorded', actor: 'Clinician', validationRules: ['Death certificate required'] },
      { from: '*', to: 'Archived', trigger: 'Inactive for defined period per policy', actor: 'System', validationRules: [] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-PAT-001', description: 'A verified patient record cannot be permanently deleted', severity: 'critical', rationale: 'Legal and clinical record-keeping requirements' },
    { ruleId: 'BR-PAT-002', description: 'Patient must have at least one legal identifier', severity: 'error', rationale: 'Necessary for identity management' },
    { ruleId: 'BR-PAT-003', description: 'Patient merge requires administrator authorization', severity: 'critical', rationale: 'Prevents accidental data loss' },
  ],
  domainEvents: [
    { eventName: 'Patient Registered', trigger: 'Registration completed', initiator: 'Registration', payloadSummary: 'Patient ID, demographics, identifiers', consumers: ['Identity Engine', 'Audit Engine', 'Analytics Engine'] },
    { eventName: 'Patient Updated', trigger: 'Demographic change', initiator: 'Registration/System', payloadSummary: 'Changed fields', consumers: ['Audit Engine', 'Search Engine'] },
    { eventName: 'Patient Merged', trigger: 'Duplicate records merged', initiator: 'Administrator', payloadSummary: 'Source ID, target ID', consumers: ['All Engines'] },
    { eventName: 'Patient Deceased', trigger: 'Death recorded', initiator: 'Clinician', payloadSummary: 'Date of death, cause', consumers: ['Identity Engine', 'Billing Engine', 'Analytics Engine'] },
  ],
  attributes: [
    { name: 'patientId', category: 'identity', type: 'UUID', mandatory: true, description: 'System-generated unique identifier' },
    { name: 'displayName', category: 'identity', type: 'string', mandatory: true, description: 'Full name for display' },
    { name: 'hospitalNumbers', category: 'identity', type: 'string[]', mandatory: false, description: 'Business identifiers per facility' },
    { name: 'legalName', category: 'core', type: 'string', mandatory: true, description: 'Full legal name' },
    { name: 'dateOfBirth', category: 'core', type: 'date', mandatory: true, description: 'Date of birth' },
    { name: 'sex', category: 'core', type: 'enum', mandatory: true, description: 'Biological sex' },
    { name: 'phoneNumber', category: 'core', type: 'string', mandatory: false, description: 'Primary contact number' },
    { name: 'emailAddress', category: 'core', type: 'string', mandatory: false, description: 'Email address' },
    { name: 'address', category: 'core', type: 'string', mandatory: false, description: 'Residential address' },
    { name: 'emergencyContactName', category: 'optional', type: 'string', mandatory: false, description: 'Emergency contact person' },
    { name: 'emergencyContactPhone', category: 'optional', type: 'string', mandatory: false, description: 'Emergency contact number' },
    { name: 'bloodGroup', category: 'optional', type: 'string', mandatory: false, description: 'ABO/Rh blood group' },
    { name: 'occupation', category: 'optional', type: 'string', mandatory: false, description: 'Patient occupation' },
    { name: 'maritalStatus', category: 'optional', type: 'string', mandatory: false, description: 'Marital status' },
    { name: 'nationality', category: 'optional', type: 'string', mandatory: false, description: 'Nationality' },
    { name: 'religion', category: 'optional', type: 'string', mandatory: false, description: 'Religious affiliation' },
    { name: 'ageInYears', category: 'derived', type: 'number', mandatory: false, description: 'Calculated from date of birth' },
    { name: 'ageGroup', category: 'derived', type: 'string', mandatory: false, description: 'Age-based group classification' },
    { name: 'isDeceased', category: 'derived', type: 'boolean', mandatory: false, description: 'Whether patient is deceased' },
    { name: 'createdAt', category: 'metadata', type: 'timestamp', mandatory: true, description: 'Record creation timestamp' },
    { name: 'updatedAt', category: 'metadata', type: 'timestamp', mandatory: false, description: 'Last update timestamp' },
  ],
  validation: {
    mandatory: ['legalName', 'dateOfBirth', 'sex'],
    optional: ['phoneNumber', 'emailAddress', 'address', 'occupation', 'maritalStatus', 'nationality', 'religion'],
    unique: ['patientId'],
    ranges: {},
    crossField: ['If isDeceased, deathDate must be present'],
    crossEntity: [],
  },
  securityClassification: 'confidential',
  accessPolicy: {
    createRoles: ['registration', 'admin'],
    readRoles: ['clinician', 'nurse', 'admin', 'researcher'],
    updateRoles: ['registration', 'admin'],
    archiveRoles: ['admin'],
    deleteRoles: [],
  },
  auditRequirements: [
    { action: 'create', requiredFields: ['legalName', 'dateOfBirth', 'sex', 'createdBy'], retentionYears: 10, immutable: true },
    { action: 'update', requiredFields: ['previousValue', 'newValue'], retentionYears: 10, immutable: true },
    { action: 'merge', requiredFields: ['sourceId', 'targetId'], retentionYears: 10, immutable: true },
  ],
  privacyRequirements: [
    { dataType: 'pii', deIdentificationRequired: true, maskingRule: 'name, phone, address masked for research', consentDependency: 'research_consent' },
    { dataType: 'phi', deIdentificationRequired: true, consentDependency: 'clinical_consent' },
  ],
  aiPermission: { canRead: true, canSummarize: true, canClassify: false, canSuggestModifications: false, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [
    { standard: 'FHIR R4', resourceType: 'Patient', mappingNotes: 'Direct mapping to FHIR Patient resource' },
    { standard: 'HL7 v2', resourceType: 'ADT^A01', mappingNotes: 'ADT messages for identity management' },
  ],
  extensibilityNotes: 'Extend through Patient extension mechanism rather than modifying core attributes. Future: veterinary patient support.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 2. PROVIDER (ENTITY-PROVIDER)
// ═══════════════════════════════════════════════════════════════════

export const PROVIDER_SPEC = defineEntity({
  canonicalName: 'Provider',
  canonicalCode: 'ENTITY-PROVIDER',
  entityCategory: 'entity',
  domain: 'Clinical',
  owningEngine: 'Identity Engine',
  definition: 'A healthcare professional who delivers clinical services. Includes physicians, nurses, clinical officers, pharmacists, and allied health professionals.',
  purpose: 'To uniquely identify, credential, and track all clinical service providers across the platform.',
  responsibilities: [
    'Maintain provider identity and credentials',
    'Track professional licenses and certifications',
    'Manage provider roles and specialties',
    'Support provider scheduling and assignment',
    'Track provider availability and status',
  ],
  nonResponsibilities: [],
  stakeholders: ['Clinicians', 'HR', 'Administrators', 'Scheduling'],
  businessProcesses: ['Consultation', 'Admission', 'Scheduling', 'Billing', 'Clinical Documentation'],
  clinicalSignificance: 'Providers deliver all clinical care. Every clinical action must be traceable to a responsible provider.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'treats', cardinality: 'N:N', description: 'Provider treats many patients', constraints: [] },
    { relatedEntity: 'Encounter', relationshipType: 'performs', cardinality: '1:N', description: 'Provider performs encounters', constraints: [] },
    { relatedEntity: 'Organization', relationshipType: 'employed by', cardinality: 'N:1', description: 'Provider works at an organization', constraints: [] },
    { relatedEntity: 'Department', relationshipType: 'assigned to', cardinality: 'N:1', description: 'Provider assigned to a department', constraints: [] },
  ],
  lifecycle: {
    states: ['Invited', 'Active', 'Suspended', 'Inactive', 'Archived'],
    transitions: [
      { from: 'Invited', to: 'Active', trigger: 'Onboarding completed', actor: 'HR', validationRules: ['License verified'] },
      { from: 'Active', to: 'Suspended', trigger: 'License expired or disciplinary', actor: 'Admin', validationRules: ['Reason documented'] },
      { from: 'Active', to: 'Inactive', trigger: 'Resignation or retirement', actor: 'HR', validationRules: ['End date recorded'] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-PROV-001', description: 'Provider must have at least one valid professional license', severity: 'error', rationale: 'Regulatory compliance' },
    { ruleId: 'BR-PROV-002', description: 'Suspended providers cannot create clinical documentation', severity: 'critical', rationale: 'Patient safety' },
  ],
  domainEvents: [
    { eventName: 'Provider Created', trigger: 'Onboarding completed', initiator: 'HR', payloadSummary: 'Provider ID, role, department', consumers: ['Scheduling Engine', 'Audit Engine'] },
    { eventName: 'Provider Suspended', trigger: 'License or disciplinary action', initiator: 'Admin', payloadSummary: 'Reason, effective date', consumers: ['Scheduling Engine', 'Workflow Engine'] },
  ],
  attributes: [
    { name: 'providerId', category: 'identity', type: 'UUID', mandatory: true, description: 'System-generated unique identifier' },
    { name: 'displayName', category: 'identity', type: 'string', mandatory: true, description: 'Display name' },
    { name: 'professionalLicense', category: 'core', type: 'string', mandatory: true, description: 'Professional license number' },
    { name: 'specialty', category: 'core', type: 'string', mandatory: false, description: 'Clinical specialty' },
    { name: 'role', category: 'core', type: 'enum', mandatory: true, description: 'Provider role' },
    { name: 'departmentId', category: 'core', type: 'UUID', mandatory: false, description: 'Assigned department' },
    { name: 'isActive', category: 'derived', type: 'boolean', mandatory: false, description: 'Active status' },
  ],
  validation: { mandatory: ['displayName', 'professionalLicense', 'role'], optional: ['specialty', 'departmentId'], unique: ['providerId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'internal',
  accessPolicy: { createRoles: ['admin', 'hr'], readRoles: ['*'], updateRoles: ['admin', 'hr', 'self'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['professionalLicense', 'role'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'pii', deIdentificationRequired: false, maskingRule: 'contact info masked for patients' }],
  aiPermission: { canRead: true, canSummarize: false, canClassify: false, canSuggestModifications: false, canGenerateInstances: false, requiresHumanReview: false },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'Practitioner', mappingNotes: 'Maps to FHIR Practitioner resource' }],
  extensibilityNotes: 'Provider extensions for different licensure types per country.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 3. ENCOUNTER (ENTITY-ENCOUNTER)
// ═══════════════════════════════════════════════════════════════════

export const ENCOUNTER_SPEC = defineEntity({
  canonicalName: 'Encounter',
  canonicalCode: 'ENTITY-ENCOUNTER',
  entityCategory: 'entity',
  domain: 'Clinical',
  owningEngine: 'Encounter Engine',
  definition: 'A temporal interaction between a Patient and one or more Providers for the purpose of healthcare delivery. The Encounter is the container for all clinical activity during a care episode.',
  purpose: 'To provide the temporal and clinical context for all documentation, orders, observations, and decisions made during a patient interaction.',
  responsibilities: [
    'Define the time period of clinical care',
    'Link the patient to clinical activities',
    'Track encounter type and location',
    'Manage encounter lifecycle (planned → active → completed)',
    'Serve as the container for clinical documentation',
  ],
  nonResponsibilities: [
    'Does NOT own clinical observations (they belong to Observation Engine)',
    'Does NOT own diagnoses (they belong to Diagnosis Engine)',
  ],
  stakeholders: ['Clinicians', 'Nurses', 'Registration', 'Billing', 'Administrators'],
  businessProcesses: ['Consultation', 'Admission', 'Emergency', 'Surgery', 'Ward Round', 'Telemedicine'],
  clinicalSignificance: 'The Encounter is the primary unit of clinical care. Documentation, billing, legal records, and research all depend on complete and accurate encounters.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'belongs to', cardinality: 'N:1', description: 'Each encounter belongs to exactly one patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Provider', relationshipType: 'performed by', cardinality: 'N:N', description: 'Providers participate in encounters', constraints: ['At least one provider'] },
    { relatedEntity: 'Organization', relationshipType: 'occurs at', cardinality: 'N:1', description: 'Encounter at an organization', constraints: [] },
    { relatedEntity: 'Diagnosis', relationshipType: 'includes', cardinality: '1:N', description: 'Encounter may have diagnoses', constraints: [] },
    { relatedEntity: 'Observation', relationshipType: 'contains', cardinality: '1:N', description: 'Encounter contains observations', constraints: [] },
    { relatedEntity: 'Medication Order', relationshipType: 'includes', cardinality: '1:N', description: 'Encounter may have medication orders', constraints: [] },
    { relatedEntity: 'Procedure', relationshipType: 'includes', cardinality: '1:N', description: 'Encounter may have procedures', constraints: [] },
  ],
  lifecycle: {
    states: ['Planned', 'Active', 'OnHold', 'Completed', 'Cancelled', 'Archived'],
    transitions: [
      { from: 'Planned', to: 'Active', trigger: 'Patient arrives for scheduled encounter', actor: 'Registration', validationRules: ['Patient present', 'Provider available'] },
      { from: 'Active', to: 'Completed', trigger: 'Clinical care delivered, documentation complete', actor: 'Provider', validationRules: ['Minimum required documentation exists'] },
      { from: 'Active', to: 'OnHold', trigger: 'Care interrupted (waiting for results, transfer)', actor: 'Provider', validationRules: ['Reason documented'] },
      { from: 'OnHold', to: 'Active', trigger: 'Care resumed', actor: 'Provider', validationRules: [] },
      { from: 'Planned', to: 'Cancelled', trigger: 'Encounter cancelled', actor: 'Registration/Patient', validationRules: ['Reason documented'] },
      { from: 'Completed', to: 'Archived', trigger: 'Retention period expired', actor: 'System', validationRules: ['Legal hold check'] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-ENC-001', description: 'An Encounter must belong to exactly one Patient', severity: 'critical', rationale: 'Clinical and legal requirement' },
    { ruleId: 'BR-ENC-002', description: 'An Encounter cannot be deleted after completion', severity: 'critical', rationale: 'Legal and clinical record-keeping' },
    { ruleId: 'BR-ENC-003', description: 'Completed encounters cannot have new clinical data added without reopening', severity: 'error', rationale: 'Data integrity' },
  ],
  domainEvents: [
    { eventName: 'Encounter Started', trigger: 'Patient check-in or encounter activation', initiator: 'Registration', payloadSummary: 'Patient ID, Encounter ID, type, timestamp', consumers: ['Workflow Engine', 'Analytics Engine', 'Notification Engine'] },
    { eventName: 'Encounter Completed', trigger: 'Clinical documentation finalized', initiator: 'Provider', payloadSummary: 'Encounter ID, duration', consumers: ['Billing Engine', 'Analytics Engine', 'Workflow Engine'] },
    { eventName: 'Encounter Cancelled', trigger: 'Cancellation', initiator: 'Registration/Patient', payloadSummary: 'Reason', consumers: ['Scheduling Engine', 'Notification Engine'] },
  ],
  attributes: [
    { name: 'encounterId', category: 'identity', type: 'UUID', mandatory: true, description: 'System-generated unique identifier' },
    { name: 'patientId', category: 'identity', type: 'UUID', mandatory: true, description: 'The patient being seen' },
    { name: 'encounterType', category: 'core', type: 'enum', mandatory: true, description: 'Outpatient, Emergency, Inpatient, Surgery, Telemedicine, etc.' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Current lifecycle state' },
    { name: 'startTime', category: 'core', type: 'timestamp', mandatory: true, description: 'When the encounter started' },
    { name: 'endTime', category: 'core', type: 'timestamp', mandatory: false, description: 'When the encounter ended' },
    { name: 'departmentId', category: 'core', type: 'UUID', mandatory: false, description: 'Department where encounter occurred' },
    { name: 'facilityId', category: 'core', type: 'UUID', mandatory: false, description: 'Facility location' },
    { name: 'referralSource', category: 'optional', type: 'string', mandatory: false, description: 'How the patient arrived' },
    { name: 'triageCategory', category: 'optional', type: 'enum', mandatory: false, description: 'Emergency triage level' },
    { name: 'chiefComplaint', category: 'derived', type: 'string', mandatory: false, description: 'Primary reason for visit' },
    { name: 'duration', category: 'derived', type: 'number', mandatory: false, description: 'Duration in minutes' },
    { name: 'createdAt', category: 'metadata', type: 'timestamp', mandatory: true, description: 'Record created' },
  ],
  validation: { mandatory: ['patientId', 'encounterType', 'startTime'], optional: ['endTime', 'departmentId', 'referralSource'], unique: ['encounterId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['registration', 'clinician', 'nurse'], readRoles: ['clinician', 'nurse', 'admin', 'researcher'], updateRoles: ['clinician', 'nurse'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['patientId', 'encounterType'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true, consentDependency: 'clinical_consent' }],
  aiPermission: { canRead: true, canSummarize: true, canClassify: true, canSuggestModifications: false, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'Encounter', mappingNotes: 'Direct mapping to FHIR Encounter resource' }],
  extensibilityNotes: 'Extend with encounter-type-specific sub-types.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 4. DIAGNOSIS (ENTITY-DIAGNOSIS)
// ═══════════════════════════════════════════════════════════════════

export const DIAGNOSIS_SPEC = defineEntity({
  canonicalName: 'Diagnosis',
  canonicalCode: 'ENTITY-DIAGNOSIS',
  entityCategory: 'entity',
  domain: 'Clinical',
  owningEngine: 'Diagnosis Engine',
  definition: 'A clinical assessment identifying a disease, condition, or injury affecting the patient. Includes confirmed diagnoses, working diagnoses, and differential diagnoses.',
  purpose: 'To record, track, and manage all clinical diagnoses across the patient journey with supporting evidence.',
  responsibilities: [
    'Record confirmed diagnoses with supporting evidence',
    'Manage differential diagnosis lists',
    'Track diagnosis lifecycle (suspected → confirmed → resolved)',
    'Link diagnoses to supporting observations and investigations',
    'Provide coded diagnoses (ICD, SNOMED)',
  ],
  nonResponsibilities: [],
  stakeholders: ['Clinicians', 'Coding', 'Research', 'Quality', 'Administrators'],
  businessProcesses: ['Consultation', 'Admission', 'Discharge', 'Coding', 'Research', 'Quality Improvement'],
  clinicalSignificance: 'Diagnoses drive clinical decision-making, treatment planning, prognosis, billing, research, and population health analytics.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'affects', cardinality: 'N:1', description: 'Diagnosis belongs to a patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Encounter', relationshipType: 'identified during', cardinality: 'N:1', description: 'Diagnosis recorded during encounter', constraints: ['Mandatory'] },
    { relatedEntity: 'Observation', relationshipType: 'supported by', cardinality: 'N:N', description: 'Observations support the diagnosis', constraints: [] },
    { relatedEntity: 'Care Plan', relationshipType: 'drives', cardinality: '1:N', description: 'Diagnosis drives care plan', constraints: [] },
  ],
  lifecycle: {
    states: ['Suspected', 'Working', 'Confirmed', 'Resolved', 'Refuted', 'Recurred'],
    transitions: [
      { from: 'Suspected', to: 'Working', trigger: 'Differential listed as likely', actor: 'Clinician', validationRules: ['Rationale documented'] },
      { from: 'Working', to: 'Confirmed', trigger: 'Diagnostic confirmation (clinical or investigation)', actor: 'Clinician', validationRules: ['Supporting evidence present'] },
      { from: 'Confirmed', to: 'Resolved', trigger: 'Condition resolved', actor: 'Clinician', validationRules: [] },
      { from: '*', to: 'Refuted', trigger: 'Diagnosis excluded', actor: 'Clinician', validationRules: ['Rationale documented'] },
      { from: 'Resolved', to: 'Recurred', trigger: 'Condition returned', actor: 'Clinician', validationRules: [] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-DX-001', description: 'A confirmed diagnosis must have at least one supporting observation or investigation', severity: 'warning', rationale: 'Clinical best practice' },
    { ruleId: 'BR-DX-002', description: 'Diagnosis codes must use a supported coding system (ICD-10, SNOMED)', severity: 'error', rationale: 'Interoperability and reporting' },
  ],
  domainEvents: [
    { eventName: 'Diagnosis Added', trigger: 'Diagnosis recorded', initiator: 'Clinician', payloadSummary: 'Diagnosis, code, encounter', consumers: ['Care Plan Engine', 'Analytics Engine', 'Research Engine'] },
    { eventName: 'Diagnosis Confirmed', trigger: 'Diagnosis moved to confirmed status', initiator: 'Clinician', payloadSummary: 'Diagnosis ID, evidence', consumers: ['Care Plan Engine', 'Billing Engine', 'Analytics Engine'] },
  ],
  attributes: [
    { name: 'diagnosisId', category: 'identity', type: 'UUID', mandatory: true, description: 'System-generated unique identifier' },
    { name: 'patientId', category: 'identity', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'encounterId', category: 'identity', type: 'UUID', mandatory: false, description: 'Encounter where identified' },
    { name: 'conditionName', category: 'core', type: 'string', mandatory: true, description: 'Clinical name of the condition' },
    { name: 'code', category: 'core', type: 'string', mandatory: false, description: 'ICD-10 or SNOMED code' },
    { name: 'codingSystem', category: 'core', type: 'enum', mandatory: false, description: 'ICD-10, SNOMED, etc.' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Lifecycle state' },
    { name: 'type', category: 'core', type: 'enum', mandatory: true, description: 'Confirmed, Differential, Working, etc.' },
    { name: 'onsetDate', category: 'core', type: 'date', mandatory: false, description: 'When condition began' },
    { name: 'resolvedDate', category: 'core', type: 'date', mandatory: false, description: 'When condition resolved' },
    { name: 'isChronic', category: 'derived', type: 'boolean', mandatory: false, description: 'Chronic condition flag' },
  ],
  validation: { mandatory: ['patientId', 'conditionName', 'status', 'type'], optional: ['code', 'codingSystem', 'onsetDate', 'resolvedDate'], unique: ['diagnosisId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['clinician'], readRoles: ['clinician', 'nurse', 'admin', 'researcher'], updateRoles: ['clinician'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['conditionName', 'clinician'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true, consentDependency: 'clinical_consent' }],
  aiPermission: { canRead: true, canSummarize: true, canClassify: true, canSuggestModifications: true, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'Condition', mappingNotes: 'Maps to FHIR Condition resource' }],
  extensibilityNotes: 'Support for specialty-specific diagnosis taxonomies.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 5. MEDICATION ORDER (ENTITY-MEDICATION-ORDER)
// ═══════════════════════════════════════════════════════════════════

export const MEDICATION_ORDER_SPEC = defineEntity({
  canonicalName: 'Medication Order',
  canonicalCode: 'ENTITY-MEDICATION-ORDER',
  entityCategory: 'entity',
  domain: 'Clinical',
  owningEngine: 'Medication Engine',
  definition: 'A prescription or order for a medication to be administered to a patient.',
  purpose: 'To authorize, track, and verify medication prescribing across the patient journey.',
  responsibilities: ['Record medication prescriptions', 'Track order lifecycle', 'Support dose calculation', 'Enable medication reconciliation'],
  nonResponsibilities: [],
  stakeholders: ['Clinicians', 'Pharmacists', 'Nurses'],
  businessProcesses: ['Prescribing', 'Dispensing', 'Administration', 'Reconciliation'],
  clinicalSignificance: 'Medication errors are a leading cause of preventable harm. Accurate medication ordering is essential for patient safety.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'prescribed for', cardinality: 'N:1', description: 'Order belongs to a patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Encounter', relationshipType: 'ordered during', cardinality: 'N:1', description: 'Order placed during an encounter', constraints: ['Mandatory'] },
    { relatedEntity: 'Provider', relationshipType: 'prescribed by', cardinality: 'N:1', description: 'Prescribing provider', constraints: ['Mandatory'] },
    { relatedEntity: 'Medication Administration', relationshipType: 'authorizes', cardinality: '1:N', description: 'Order authorizes administrations', constraints: [] },
  ],
  lifecycle: {
    states: ['Draft', 'Active', 'OnHold', 'Discontinued', 'Completed', 'Expired'],
    transitions: [
      { from: 'Draft', to: 'Active', trigger: 'Prescription signed', actor: 'Clinician', validationRules: ['Valid dose', 'No contraindications'] },
      { from: 'Active', to: 'OnHold', trigger: 'Clinical hold', actor: 'Clinician', validationRules: ['Reason documented'] },
      { from: 'Active', to: 'Discontinued', trigger: 'Order stopped', actor: 'Clinician', validationRules: ['Reason documented'] },
      { from: 'Active', to: 'Completed', trigger: 'All doses administered', actor: 'System', validationRules: [] },
      { from: 'Active', to: 'Expired', trigger: 'Duration exceeded', actor: 'System', validationRules: [] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-MED-001', description: 'Dose must be within safe range for patient age and weight', severity: 'critical', rationale: 'Patient safety' },
    { ruleId: 'BR-MED-002', description: 'Allergy check required before order activation', severity: 'critical', rationale: 'Prevent adverse reactions' },
  ],
  domainEvents: [
    { eventName: 'Medication Prescribed', trigger: 'Order activated', initiator: 'Clinician', payloadSummary: 'Medication, dose, route', consumers: ['Pharmacy Engine', 'Notification Engine'] },
    { eventName: 'Medication Discontinued', trigger: 'Order stopped', initiator: 'Clinician', payloadSummary: 'Reason', consumers: ['Pharmacy Engine', 'Nursing Workflow'] },
  ],
  attributes: [
    { name: 'orderId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'patientId', category: 'identity', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'medicationName', category: 'core', type: 'string', mandatory: true, description: 'Drug name' },
    { name: 'dose', category: 'core', type: 'string', mandatory: true, description: 'Dose amount and unit' },
    { name: 'route', category: 'core', type: 'enum', mandatory: true, description: 'Oral, IV, IM, SC, etc.' },
    { name: 'frequency', category: 'core', type: 'string', mandatory: true, description: 'Dosing schedule' },
    { name: 'duration', category: 'core', type: 'string', mandatory: false, description: 'Treatment duration' },
    { name: 'prescriberId', category: 'core', type: 'UUID', mandatory: true, description: 'Prescribing provider' },
    { name: 'pharmacyVerified', category: 'core', type: 'boolean', mandatory: false, description: 'Pharmacist verification' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Lifecycle state' },
  ],
  validation: { mandatory: ['patientId', 'medicationName', 'dose', 'route', 'frequency', 'prescriberId'], optional: ['duration'], unique: ['orderId'], ranges: {}, crossField: ['Dose must be valid for route'], crossEntity: ['Allergy check against patient allergies'] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['clinician'], readRoles: ['clinician', 'pharmacist', 'nurse'], updateRoles: ['clinician', 'pharmacist'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['medicationName', 'dose', 'prescriberId'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true }],
  aiPermission: { canRead: true, canSummarize: true, canClassify: false, canSuggestModifications: true, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'MedicationRequest', mappingNotes: 'Maps to FHIR MedicationRequest' }],
  extensibilityNotes: 'Support for compound medications, protocols, and tapering schedules.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 6. ORGANIZATION (ENTITY-ORGANIZATION)
// ═══════════════════════════════════════════════════════════════════

export const ORGANIZATION_SPEC = defineEntity({
  canonicalName: 'Organization',
  canonicalCode: 'ENTITY-ORGANIZATION',
  entityCategory: 'entity',
  domain: 'Operational',
  owningEngine: 'Organization Engine',
  definition: 'A legal or administrative entity that provides healthcare services or supports healthcare delivery.',
  purpose: 'To define the organizational structure within which all healthcare services are delivered and managed.',
  responsibilities: [
    'Define organizational hierarchy',
    'Manage facilities, departments, wards, and beds',
    'Track organizational identifiers and accreditation',
    'Support multi-site and multi-organization deployments',
  ],
  nonResponsibilities: [],
  stakeholders: ['Administrators', 'Executives', 'Ministries of Health'],
  businessProcesses: ['Registration', 'Operations', 'Reporting', 'Administration'],
  clinicalSignificance: 'All clinical activity occurs within an organizational context. Organizational data determines workflows, permissions, and reporting.',
  relationships: [
    { relatedEntity: 'Facility', relationshipType: 'owns', cardinality: '1:N', description: 'Organization may own facilities', constraints: [] },
    { relatedEntity: 'Provider', relationshipType: 'employs', cardinality: '1:N', description: 'Organization employs providers', constraints: [] },
    { relatedEntity: 'Patient', relationshipType: 'serves', cardinality: '1:N', description: 'Organization serves patients', constraints: [] },
  ],
  lifecycle: {
    states: ['Registered', 'Active', 'Suspended', 'Merged', 'Closed'],
    transitions: [
      { from: 'Registered', to: 'Active', trigger: 'Onboarding complete', actor: 'Admin', validationRules: ['Accreditation verified'] },
      { from: 'Active', to: 'Suspended', trigger: 'Regulatory suspension', actor: 'System Admin', validationRules: ['Reason documented'] },
      { from: 'Active', to: 'Merged', trigger: 'Organizational merger', actor: 'System Admin', validationRules: ['Legal documentation required'] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-ORG-001', description: 'An organization must have a unique national identifier where applicable', severity: 'error', rationale: 'Regulatory compliance' },
  ],
  domainEvents: [
    { eventName: 'Organization Created', trigger: 'Registration', initiator: 'Admin', payloadSummary: 'Organization details', consumers: ['All Engines'] },
    { eventName: 'Organization Merged', trigger: 'Merger', initiator: 'Admin', payloadSummary: 'Source, target IDs', consumers: ['All Engines'] },
  ],
  attributes: [
    { name: 'organizationId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'name', category: 'core', type: 'string', mandatory: true, description: 'Legal name' },
    { name: 'type', category: 'core', type: 'enum', mandatory: true, description: 'Hospital, Clinic, Ministry, Laboratory, etc.' },
    { name: 'registrationNumber', category: 'core', type: 'string', mandatory: false, description: 'Government registration' },
    { name: 'address', category: 'core', type: 'string', mandatory: false, description: 'Physical address' },
    { name: 'phone', category: 'core', type: 'string', mandatory: false, description: 'Contact number' },
    { name: 'email', category: 'core', type: 'string', mandatory: false, description: 'Contact email' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Active, Suspended, etc.' },
  ],
  validation: { mandatory: ['name', 'type', 'status'], optional: ['registrationNumber', 'address', 'phone', 'email'], unique: ['organizationId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'internal',
  accessPolicy: { createRoles: ['super_admin'], readRoles: ['*'], updateRoles: ['admin'], archiveRoles: ['super_admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['name', 'type'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'none', deIdentificationRequired: false }],
  aiPermission: { canRead: true, canSummarize: false, canClassify: false, canSuggestModifications: false, canGenerateInstances: false, requiresHumanReview: false },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'Organization', mappingNotes: 'Direct mapping' }],
  extensibilityNotes: 'Supports nested organizations for health system hierarchies.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 7. OBSERVATION (ENTITY-OBSERVATION)
// ═══════════════════════════════════════════════════════════════════

export const OBSERVATION_SPEC = defineEntity({
  canonicalName: 'Observation',
  canonicalCode: 'ENTITY-OBSERVATION',
  entityCategory: 'observation',
  domain: 'Clinical',
  owningEngine: 'Observation Engine',
  definition: 'A measurement, finding, or assessment about a patient. Includes vital signs, laboratory results, physical exam findings, clinical scores, and imaging interpretations.',
  purpose: 'To capture, store, and make accessible all clinical observations in a structured, computable format.',
  responsibilities: ['Record all clinical measurements', 'Support structured data capture', 'Flag abnormal and critical values', 'Enable trend analysis'],
  nonResponsibilities: [],
  stakeholders: ['Clinicians', 'Nurses', 'Laboratory', 'Radiology', 'Researchers'],
  businessProcesses: ['Clinical Assessment', 'Monitoring', 'Laboratory Testing', 'Imaging'],
  clinicalSignificance: 'Observations form the evidence base for clinical decision-making. Structured observations enable decision support, analytics, and research.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'recorded for', cardinality: 'N:1', description: 'Observation belongs to a patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Encounter', relationshipType: 'recorded during', cardinality: 'N:1', description: 'Observation in an encounter', constraints: ['Mandatory'] },
    { relatedEntity: 'Diagnosis', relationshipType: 'supports', cardinality: 'N:N', description: 'Observation supports diagnoses', constraints: [] },
  ],
  lifecycle: {
    states: ['Registered', 'Preliminary', 'Final', 'Amended', 'Cancelled'],
    transitions: [
      { from: 'Registered', to: 'Preliminary', trigger: 'Result entered but not verified', actor: 'Clinician/Lab', validationRules: [] },
      { from: 'Preliminary', to: 'Final', trigger: 'Result verified', actor: 'Clinician/Lab', validationRules: ['Verification by authorized professional'] },
      { from: 'Final', to: 'Amended', trigger: 'Result corrected', actor: 'Clinician/Lab', validationRules: ['Reason documented', 'Original preserved'] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-OBS-001', description: 'Critical results must generate immediate notification', severity: 'critical', rationale: 'Patient safety' },
    { ruleId: 'BR-OBS-002', description: 'Observations must use a standardized code (LOINC, SNOMED)', severity: 'warning', rationale: 'Interoperability' },
  ],
  domainEvents: [
    { eventName: 'Observation Recorded', trigger: 'Result entered', initiator: 'Clinician/System', payloadSummary: 'Observation type, value, flag', consumers: ['Decision Support Engine', 'Analytics Engine'] },
    { eventName: 'Critical Result', trigger: 'Value outside critical range', initiator: 'System', payloadSummary: 'Observation, value, patient', consumers: ['Notification Engine', 'Workflow Engine'] },
  ],
  attributes: [
    { name: 'observationId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'patientId', category: 'identity', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'conceptCode', category: 'core', type: 'string', mandatory: true, description: 'LOINC or SNOMED code' },
    { name: 'value', category: 'core', type: 'any', mandatory: true, description: 'Observed value' },
    { name: 'unit', category: 'core', type: 'string', mandatory: false, description: 'Unit of measurement' },
    { name: 'referenceRange', category: 'core', type: 'string', mandatory: false, description: 'Normal range' },
    { name: 'interpretation', category: 'core', type: 'enum', mandatory: false, description: 'Normal, Abnormal, Critical, etc.' },
    { name: 'method', category: 'core', type: 'string', mandatory: false, description: 'Measurement method' },
    { name: 'bodySite', category: 'optional', type: 'string', mandatory: false, description: 'Body location' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Preliminary, Final, etc.' },
    { name: 'observedAt', category: 'core', type: 'timestamp', mandatory: true, description: 'When observed' },
  ],
  validation: { mandatory: ['patientId', 'conceptCode', 'value', 'status', 'observedAt'], optional: ['unit', 'referenceRange', 'interpretation', 'method', 'bodySite'], unique: ['observationId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['clinician', 'nurse', 'lab'], readRoles: ['clinician', 'nurse', 'lab', 'researcher'], updateRoles: ['clinician', 'lab'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'amend', requiredFields: ['originalValue', 'newValue', 'reason'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true }],
  aiPermission: { canRead: true, canSummarize: true, canClassify: true, canSuggestModifications: false, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'Observation', mappingNotes: 'Direct mapping' }],
  extensibilityNotes: 'Support for continuous monitoring data streams.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 8. PROCEDURE (ENTITY-PROCEDURE)
// ═══════════════════════════════════════════════════════════════════

export const PROCEDURE_SPEC = defineEntity({
  canonicalName: 'Procedure',
  canonicalCode: 'ENTITY-PROCEDURE',
  entityCategory: 'activity',
  domain: 'Clinical',
  owningEngine: 'Procedure Engine',
  definition: 'A clinical intervention performed on a patient. Includes surgical operations, diagnostic procedures, therapeutic procedures, and minor bedside procedures.',
  purpose: 'To document, track, and manage all procedures performed on patients.',
  responsibilities: ['Record procedure details', 'Track intraoperative events', 'Manage implant documentation', 'Support procedure coding'],
  nonResponsibilities: [],
  stakeholders: ['Surgeons', 'Anesthetists', 'Nurses', 'Theatre Staff'],
  businessProcesses: ['Surgery', 'Interventional Radiology', 'Endoscopy', 'Bedside Procedures'],
  clinicalSignificance: 'Procedures carry significant clinical risk. Complete documentation is essential for patient safety, quality improvement, and legal purposes.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'performed on', cardinality: 'N:1', description: 'Procedure on a patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Encounter', relationshipType: 'occurred during', cardinality: 'N:1', description: 'Procedure during an encounter', constraints: ['Mandatory'] },
    { relatedEntity: 'Provider', relationshipType: 'performed by', cardinality: 'N:N', description: 'Performing providers', constraints: ['At least one'] },
  ],
  lifecycle: {
    states: ['Scheduled', 'InProgress', 'Completed', 'Cancelled', 'PostOp'],
    transitions: [
      { from: 'Scheduled', to: 'InProgress', trigger: 'Procedure started', actor: 'Clinician', validationRules: ['Consent verified', 'Time-out completed'] },
      { from: 'InProgress', to: 'Completed', trigger: 'Procedure finished', actor: 'Clinician', validationRules: ['Count complete', 'Specimen labeled'] },
      { from: 'Completed', to: 'PostOp', trigger: 'Recovery started', actor: 'Nurse', validationRules: [] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-PROC-001', description: 'Informed consent must be documented before invasive procedures', severity: 'critical', rationale: 'Legal and ethical requirement' },
    { ruleId: 'BR-PROC-002', description: 'Surgical time-out must be completed before incision', severity: 'critical', rationale: 'Patient safety (WHO checklist)' },
    { ruleId: 'BR-PROC-003', description: 'Implant documentation must include lot number and expiry', severity: 'error', rationale: 'Traceability' },
  ],
  domainEvents: [
    { eventName: 'Procedure Completed', trigger: 'Procedure ended', initiator: 'Clinician', payloadSummary: 'Procedure type, duration, complications', consumers: ['Analytics Engine', 'Billing Engine'] },
  ],
  attributes: [
    { name: 'procedureId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'procedureName', category: 'core', type: 'string', mandatory: true, description: 'Procedure name' },
    { name: 'procedureCode', category: 'core', type: 'string', mandatory: false, description: 'CPT/ICD-10-PCS code' },
    { name: 'patientId', category: 'core', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'encounterId', category: 'core', type: 'UUID', mandatory: true, description: 'Encounter' },
    { name: 'date', category: 'core', type: 'timestamp', mandatory: true, description: 'Date performed' },
    { name: 'duration', category: 'core', type: 'number', mandatory: false, description: 'Duration in minutes' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Lifecycle state' },
    { name: 'complications', category: 'optional', type: 'string[]', mandatory: false, description: 'Any complications' },
    { name: 'outcome', category: 'core', type: 'enum', mandatory: false, description: 'Successful, Partial, Failed, etc.' },
    { name: 'anesthesiaType', category: 'optional', type: 'string', mandatory: false, description: 'Type of anesthesia' },
    { name: 'consentObtained', category: 'core', type: 'boolean', mandatory: true, description: 'Consent status' },
  ],
  validation: { mandatory: ['procedureName', 'patientId', 'encounterId', 'date', 'status', 'consentObtained'], optional: ['procedureCode', 'duration', 'complications', 'outcome', 'anesthesiaType'], unique: ['procedureId'], ranges: {}, crossField: ['If status=Completed, duration must be present'], crossEntity: ['If invasive, consent must exist'] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['clinician'], readRoles: ['clinician', 'nurse', 'admin'], updateRoles: ['clinician'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['procedureName', 'surgeon'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true }],
  aiPermission: { canRead: true, canSummarize: true, canClassify: false, canSuggestModifications: false, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'Procedure', mappingNotes: 'Direct mapping' }],
  extensibilityNotes: 'Sub-types for surgical, endoscopic, interventional, and bedside procedures.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 9. CARE PLAN (ENTITY-CARE-PLAN)
// ═══════════════════════════════════════════════════════════════════

export const CARE_PLAN_SPEC = defineEntity({
  canonicalName: 'Care Plan',
  canonicalCode: 'ENTITY-CARE-PLAN',
  entityCategory: 'entity',
  domain: 'Clinical',
  owningEngine: 'Care Planning Engine',
  definition: 'A plan of care for a patient, including goals, interventions, and intended outcomes. Coordinates multidisciplinary care toward defined clinical objectives.',
  purpose: 'To structure, coordinate, and track the delivery of planned care across the care team.',
  responsibilities: ['Define care goals', 'Track interventions', 'Coordinate multidisciplinary care', 'Monitor outcomes'],
  nonResponsibilities: [],
  stakeholders: ['Clinicians', 'Nurses', 'Allied Health', 'Patients'],
  businessProcesses: ['Care Planning', 'Ward Round', 'Discharge Planning', 'Chronic Disease Management'],
  clinicalSignificance: 'Care plans ensure coordinated, goal-oriented care. They reduce fragmentation and improve outcomes in chronic and complex conditions.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'belongs to', cardinality: 'N:1', description: 'Plan belongs to a patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Diagnosis', relationshipType: 'addresses', cardinality: '1:N', description: 'Plan addresses diagnoses', constraints: [] },
    { relatedEntity: 'Goal', relationshipType: 'includes', cardinality: '1:N', description: 'Plan includes goals', constraints: [] },
    { relatedEntity: 'Intervention', relationshipType: 'includes', cardinality: '1:N', description: 'Plan includes interventions', constraints: [] },
  ],
  lifecycle: {
    states: ['Draft', 'Active', 'OnHold', 'Completed', 'Cancelled'],
    transitions: [
      { from: 'Draft', to: 'Active', trigger: 'Plan activated', actor: 'Clinician', validationRules: ['At least one goal defined'] },
      { from: 'Active', to: 'Completed', trigger: 'All goals achieved', actor: 'Clinician', validationRules: ['Outcome assessed'] },
      { from: 'Active', to: 'OnHold', trigger: 'Clinical pause', actor: 'Clinician', validationRules: ['Reason documented'] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-CP-001', description: 'A care plan must have at least one measurable goal', severity: 'error', rationale: 'Clinical effectiveness' },
  ],
  domainEvents: [
    { eventName: 'Care Plan Activated', trigger: 'Plan started', initiator: 'Clinician', payloadSummary: 'Plan ID, goals', consumers: ['Workflow Engine', 'Notification Engine'] },
    { eventName: 'Care Plan Completed', trigger: 'All goals met', initiator: 'Clinician', payloadSummary: 'Outcomes', consumers: ['Analytics Engine'] },
  ],
  attributes: [
    { name: 'planId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'patientId', category: 'core', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'planType', category: 'core', type: 'enum', mandatory: true, description: 'Acute, Chronic, Discharge, etc.' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Lifecycle state' },
    { name: 'startDate', category: 'core', type: 'date', mandatory: true, description: 'When plan started' },
    { name: 'endDate', category: 'core', type: 'date', mandatory: false, description: 'When plan completed' },
  ],
  validation: { mandatory: ['patientId', 'planType', 'status', 'startDate'], optional: ['endDate'], unique: ['planId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['clinician', 'nurse'], readRoles: ['clinician', 'nurse', 'allied_health', 'patient'], updateRoles: ['clinician', 'nurse'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['planType'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true }],
  aiPermission: { canRead: true, canSummarize: true, canClassify: true, canSuggestModifications: true, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'CarePlan', mappingNotes: 'Direct mapping' }],
  extensibilityNotes: 'Supports pathways, protocols, and order sets as care plan templates.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 10. APPOINTMENT (ENTITY-APPOINTMENT)
// ═══════════════════════════════════════════════════════════════════

export const APPOINTMENT_SPEC = defineEntity({
  canonicalName: 'Appointment',
  canonicalCode: 'ENTITY-APPOINTMENT',
  entityCategory: 'entity',
  domain: 'Operational',
  owningEngine: 'Scheduling Engine',
  definition: 'A scheduled interaction between a patient and healthcare provider at a specific time and location.',
  purpose: 'To manage patient scheduling and optimize resource utilization across the healthcare facility.',
  responsibilities: ['Manage appointment scheduling', 'Track appointment status', 'Support resource allocation', 'Enable patient reminders'],
  nonResponsibilities: [],
  stakeholders: ['Patients', 'Registration', 'Clinicians', 'Scheduling'],
  businessProcesses: ['Scheduling', 'Check-in', 'Consultation', 'Follow-up'],
  clinicalSignificance: 'Appointments organize patient flow and ensure timely access to care.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'belongs to', cardinality: 'N:1', description: 'Appointment belongs to a patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Provider', relationshipType: 'with', cardinality: 'N:1', description: 'Appointment with a provider', constraints: [] },
    { relatedEntity: 'Encounter', relationshipType: 'generates', cardinality: '1:1', description: 'Appointment generates an encounter', constraints: ['Conditional'] },
  ],
  lifecycle: {
    states: ['Scheduled', 'CheckedIn', 'InProgress', 'Completed', 'Cancelled', 'NoShow'],
    transitions: [
      { from: 'Scheduled', to: 'CheckedIn', trigger: 'Patient arrives', actor: 'Registration', validationRules: ['Patient identified'] },
      { from: 'CheckedIn', to: 'InProgress', trigger: 'Provider starts appointment', actor: 'Provider', validationRules: [] },
      { from: 'InProgress', to: 'Completed', trigger: 'Appointment finished', actor: 'Provider', validationRules: [] },
      { from: 'Scheduled', to: 'Cancelled', trigger: 'Cancellation', actor: 'Patient/Registration', validationRules: ['Reason recorded'] },
      { from: 'Scheduled', to: 'NoShow', trigger: 'Patient did not arrive', actor: 'System', validationRules: ['Wait time exceeded'] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-APT-001', description: 'An appointment cannot be double-booked for the same provider and time slot', severity: 'error', rationale: 'Scheduling integrity' },
    { ruleId: 'BR-APT-002', description: 'Cancellation requires notice period per policy', severity: 'warning', rationale: 'Resource optimization' },
  ],
  domainEvents: [
    { eventName: 'Appointment Scheduled', trigger: 'Booking confirmed', initiator: 'Patient/Registration', payloadSummary: 'Time, provider, department', consumers: ['Notification Engine', 'Queue Engine'] },
    { eventName: 'Appointment Cancelled', trigger: 'Cancellation', initiator: 'Patient/Registration', payloadSummary: 'Reason', consumers: ['Scheduling Engine', 'Notification Engine'] },
  ],
  attributes: [
    { name: 'appointmentId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'patientId', category: 'core', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'providerId', category: 'core', type: 'UUID', mandatory: false, description: 'Provider' },
    { name: 'departmentId', category: 'core', type: 'UUID', mandatory: false, description: 'Department' },
    { name: 'startTime', category: 'core', type: 'timestamp', mandatory: true, description: 'Scheduled start time' },
    { name: 'endTime', category: 'core', type: 'timestamp', mandatory: true, description: 'Scheduled end time' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Lifecycle state' },
    { name: 'reason', category: 'core', type: 'string', mandatory: false, description: 'Reason for visit' },
    { name: 'appointmentType', category: 'core', type: 'enum', mandatory: true, description: 'New, Follow-up, Emergency, etc.' },
  ],
  validation: { mandatory: ['patientId', 'startTime', 'endTime', 'status', 'appointmentType'], optional: ['providerId', 'departmentId', 'reason'], unique: ['appointmentId'], ranges: {}, crossField: ['endTime must be after startTime'], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['registration', 'patient'], readRoles: ['*'], updateRoles: ['registration', 'patient'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['patientId', 'startTime', 'providerId'], retentionYears: 5, immutable: true }],
  privacyRequirements: [{ dataType: 'pii', deIdentificationRequired: false }],
  aiPermission: { canRead: true, canSummarize: false, canClassify: false, canSuggestModifications: true, canGenerateInstances: false, requiresHumanReview: false },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'Appointment', mappingNotes: 'Direct mapping' }],
  extensibilityNotes: 'Support for recurring appointments, group visits, and telemedicine.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 11. CONSENT (ENTITY-CONSENT)
// ═══════════════════════════════════════════════════════════════════

export const CONSENT_SPEC = defineEntity({
  canonicalName: 'Consent',
  canonicalCode: 'ENTITY-CONSENT',
  entityCategory: 'artifact',
  domain: 'Governance',
  owningEngine: 'Governance Engine',
  definition: 'A record of permission granted by a patient (or authorized representative) for a specific healthcare activity, data use, or research participation.',
  purpose: 'To document, manage, and enforce patient consent for treatment, procedures, data sharing, and research.',
  responsibilities: ['Record patient consent', 'Track consent lifecycle', 'Support consent withdrawal', 'Enforce consent-based access controls'],
  nonResponsibilities: [],
  stakeholders: ['Patients', 'Clinicians', 'Researchers', 'Legal'],
  businessProcesses: ['Procedure Consent', 'Research Consent', 'Data Sharing', 'Treatment Consent'],
  clinicalSignificance: 'Consent is a legal and ethical requirement. Proper consent management protects patient autonomy and organizational compliance.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'given by', cardinality: 'N:1', description: 'Consent given by patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Procedure', relationshipType: 'authorizes', cardinality: '1:1', description: 'Consent for a specific procedure', constraints: ['Conditional'] },
  ],
  lifecycle: {
    states: ['Requested', 'Given', 'Withdrawn', 'Expired'],
    transitions: [
      { from: 'Requested', to: 'Given', trigger: 'Patient signs consent', actor: 'Patient', validationRules: ['Capacity confirmed', 'Information provided'] },
      { from: 'Given', to: 'Withdrawn', trigger: 'Patient withdraws consent', actor: 'Patient', validationRules: ['Withdrawal documented'] },
      { from: 'Given', to: 'Expired', trigger: 'Consent validity period passed', actor: 'System', validationRules: [] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-CONS-001', description: 'Informed consent must be obtained before any invasive procedure', severity: 'critical', rationale: 'Legal and ethical' },
    { ruleId: 'BR-CONS-002', description: 'Consent withdrawal must be immediately respected', severity: 'critical', rationale: 'Patient autonomy' },
    { ruleId: 'BR-CONS-003', description: 'Research consent must specify scope of data use', severity: 'error', rationale: 'Research governance' },
  ],
  domainEvents: [
    { eventName: 'Consent Given', trigger: 'Consent signed', initiator: 'Patient', payloadSummary: 'Type, scope, expiry', consumers: ['Workflow Engine', 'Research Engine'] },
    { eventName: 'Consent Withdrawn', trigger: 'Patient withdraws', initiator: 'Patient', payloadSummary: 'Consent ID, date', consumers: ['All Engines'] },
  ],
  attributes: [
    { name: 'consentId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'patientId', category: 'core', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'consentType', category: 'core', type: 'enum', mandatory: true, description: 'Treatment, Procedure, Research, Data Sharing' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Given, Withdrawn, Expired' },
    { name: 'givenDate', category: 'core', type: 'timestamp', mandatory: true, description: 'When consent given' },
    { name: 'expiryDate', category: 'core', type: 'date', mandatory: false, description: 'When consent expires' },
    { name: 'scope', category: 'core', type: 'string', mandatory: false, description: 'Scope of consent' },
    { name: 'witness', category: 'core', type: 'string', mandatory: false, description: 'Witness name' },
  ],
  validation: { mandatory: ['patientId', 'consentType', 'status', 'givenDate'], optional: ['expiryDate', 'scope', 'witness'], unique: ['consentId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['clinician', 'researcher'], readRoles: ['clinician', 'patient', 'admin'], updateRoles: ['patient'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['consentType', 'givenDate'], retentionYears: 15, immutable: true }],
  privacyRequirements: [{ dataType: 'pii', deIdentificationRequired: false }],
  aiPermission: { canRead: false, canSummarize: false, canClassify: false, canSuggestModifications: false, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'Consent', mappingNotes: 'Direct mapping' }],
  extensibilityNotes: 'Support for electronic consent, biometric verification, and delegated consent.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 12. CLINICAL DOCUMENT (ENTITY-CLINICAL-DOCUMENT)
// ═══════════════════════════════════════════════════════════════════

export const CLINICAL_DOCUMENT_SPEC = defineEntity({
  canonicalName: 'Clinical Document',
  canonicalCode: 'ENTITY-CLINICAL-DOCUMENT',
  entityCategory: 'artifact',
  domain: 'Clinical',
  owningEngine: 'Clinical Documentation Engine',
  definition: 'Any clinical note, report, or narrative documentation generated during patient care.',
  purpose: 'To capture, store, and retrieve all clinical documentation in structured and narrative formats.',
  responsibilities: [
    'Store clinical notes and reports',
    'Support structured documentation (SOAP, templates)',
    'Manage document lifecycle',
    'Enable document search and retrieval',
    'Support document signing and amendment',
  ],
  nonResponsibilities: [],
  stakeholders: ['Clinicians', 'Nurses', 'Coding', 'Legal', 'Researchers'],
  businessProcesses: ['Consultation', 'Ward Round', 'Discharge', 'Procedure', 'Referral'],
  clinicalSignificance: 'Clinical documents are the permanent record of patient care. They serve clinical, legal, billing, and research purposes.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'describes', cardinality: 'N:1', description: 'Document about a patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Encounter', relationshipType: 'generated during', cardinality: 'N:1', description: 'Document created in an encounter', constraints: ['Mandatory'] },
    { relatedEntity: 'Provider', relationshipType: 'authored by', cardinality: 'N:1', description: 'Document author', constraints: ['Mandatory'] },
  ],
  lifecycle: {
    states: ['Draft', 'Signed', 'Amended', 'Archived'],
    transitions: [
      { from: 'Draft', to: 'Signed', trigger: 'Clinician signs document', actor: 'Clinician', validationRules: ['All required sections complete'] },
      { from: 'Signed', to: 'Amended', trigger: 'Document corrected', actor: 'Clinician', validationRules: ['Original preserved', 'Reason documented'] },
      { from: '*', to: 'Archived', trigger: 'Retention period met', actor: 'System', validationRules: ['Legal hold check'] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-DOC-001', description: 'A signed clinical document cannot be deleted', severity: 'critical', rationale: 'Legal record' },
    { ruleId: 'BR-DOC-002', description: 'Amendments must preserve the original content', severity: 'critical', rationale: 'Clinical governance' },
  ],
  domainEvents: [
    { eventName: 'Document Signed', trigger: 'Clinician signs', initiator: 'Clinician', payloadSummary: 'Document type, encounter', consumers: ['Audit Engine', 'Workflow Engine'] },
    { eventName: 'Document Amended', trigger: 'Correction made', initiator: 'Clinician', payloadSummary: 'Reason, changes', consumers: ['Audit Engine', 'Notification Engine'] },
  ],
  attributes: [
    { name: 'documentId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'documentType', category: 'core', type: 'enum', mandatory: true, description: 'Progress Note, Discharge Summary, Operative Note, etc.' },
    { name: 'patientId', category: 'core', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'encounterId', category: 'core', type: 'UUID', mandatory: true, description: 'Encounter' },
    { name: 'authorId', category: 'core', type: 'UUID', mandatory: true, description: 'Document author' },
    { name: 'content', category: 'core', type: 'string', mandatory: true, description: 'Document content (structured or narrative)' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Draft, Signed, Amended' },
    { name: 'signedAt', category: 'core', type: 'timestamp', mandatory: false, description: 'When signed' },
  ],
  validation: { mandatory: ['documentType', 'patientId', 'encounterId', 'authorId', 'content', 'status'], optional: ['signedAt'], unique: ['documentId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['clinician', 'nurse'], readRoles: ['clinician', 'nurse', 'admin', 'researcher'], updateRoles: ['clinician'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'sign', requiredFields: ['documentType', 'authorId'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true }],
  aiPermission: { canRead: true, canSummarize: true, canClassify: true, canSuggestModifications: true, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'DocumentReference', mappingNotes: 'Maps to FHIR DocumentReference' }],
  extensibilityNotes: 'Support for specialty-specific document templates.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 13. INVESTIGATION (ENTITY-INVESTIGATION)
// ═══════════════════════════════════════════════════════════════════

export const INVESTIGATION_SPEC = defineEntity({
  canonicalName: 'Investigation',
  canonicalCode: 'ENTITY-INVESTIGATION',
  entityCategory: 'entity',
  domain: 'Clinical',
  owningEngine: 'Investigation Engine',
  definition: 'A request for a diagnostic test or study to be performed on a patient specimen, imaging, or physiological measurement.',
  purpose: 'To manage the lifecycle of diagnostic investigations from order through result.',
  responsibilities: ['Manage investigation orders', 'Track specimen lifecycle', 'Store and verify results', 'Support clinical decision-making'],
  nonResponsibilities: [],
  stakeholders: ['Clinicians', 'Laboratory', 'Radiology', 'Nurses'],
  businessProcesses: ['Ordering', 'Specimen Collection', 'Analysis', 'Reporting'],
  clinicalSignificance: 'Investigations provide objective evidence for clinical decision-making. Accuracy and timeliness directly impact patient outcomes.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'for', cardinality: 'N:1', description: 'Investigation for a patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Encounter', relationshipType: 'ordered during', cardinality: 'N:1', description: 'Ordered in an encounter', constraints: ['Mandatory'] },
    { relatedEntity: 'Specimen', relationshipType: 'uses', cardinality: '1:N', description: 'Investigation uses specimens', constraints: [] },
    { relatedEntity: 'Observation', relationshipType: 'produces', cardinality: '1:N', description: 'Investigation produces observations', constraints: [] },
  ],
  lifecycle: {
    states: ['Ordered', 'Collected', 'Received', 'InProgress', 'Verified', 'Cancelled'],
    transitions: [
      { from: 'Ordered', to: 'Collected', trigger: 'Specimen collected', actor: 'Nurse/Phlebotomist', validationRules: ['Correct container', 'Patient verified'] },
      { from: 'Collected', to: 'Received', trigger: 'Specimen arrives at lab', actor: 'Lab', validationRules: ['Specimen integrity check'] },
      { from: 'Received', to: 'InProgress', trigger: 'Analysis started', actor: 'Lab', validationRules: [] },
      { from: 'InProgress', to: 'Verified', trigger: 'Result validated', actor: 'Lab Scientist', validationRules: ['Quality control passed'] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-INV-001', description: 'Critical results must be flagged and communicated immediately', severity: 'critical', rationale: 'Patient safety' },
    { ruleId: 'BR-INV-002', description: 'Result amendments must preserve original results', severity: 'critical', rationale: 'Data integrity' },
  ],
  domainEvents: [
    { eventName: 'Investigation Ordered', trigger: 'Clinician places order', initiator: 'Clinician', payloadSummary: 'Test, patient, priority', consumers: ['Laboratory Engine', 'Workflow Engine'] },
    { eventName: 'Result Verified', trigger: 'Result validated', initiator: 'Lab', payloadSummary: 'Result, interpretation, flag', consumers: ['Clinical Engine', 'Notification Engine', 'Analytics Engine'] },
  ],
  attributes: [
    { name: 'investigationId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'testName', category: 'core', type: 'string', mandatory: true, description: 'Name of the test' },
    { name: 'testCode', category: 'core', type: 'string', mandatory: false, description: 'LOINC or local test code' },
    { name: 'patientId', category: 'core', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'encounterId', category: 'core', type: 'UUID', mandatory: true, description: 'Encounter' },
    { name: 'orderedBy', category: 'core', type: 'UUID', mandatory: true, description: 'Ordering provider' },
    { name: 'priority', category: 'core', type: 'enum', mandatory: true, description: 'Routine, Urgent, Stat' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Lifecycle state' },
    { name: 'result', category: 'core', type: 'string', mandatory: false, description: 'Numeric or text result' },
    { name: 'referenceRange', category: 'core', type: 'string', mandatory: false, description: 'Normal range' },
    { name: 'interpretation', category: 'core', type: 'enum', mandatory: false, description: 'Normal, Abnormal, Critical' },
    { name: 'category', category: 'core', type: 'enum', mandatory: true, description: 'Lab, Imaging, POC, Microbiology, Pathology' },
  ],
  validation: { mandatory: ['testName', 'patientId', 'encounterId', 'orderedBy', 'priority', 'status', 'category'], optional: ['testCode', 'result', 'referenceRange', 'interpretation'], unique: ['investigationId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['clinician'], readRoles: ['clinician', 'nurse', 'lab', 'researcher'], updateRoles: ['lab'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'verify', requiredFields: ['result', 'verifiedBy'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true }],
  aiPermission: { canRead: true, canSummarize: true, canClassify: true, canSuggestModifications: false, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'DiagnosticReport', mappingNotes: 'Maps to FHIR DiagnosticReport and Observation resources' }],
  extensibilityNotes: 'Support for molecular diagnostics, genetic testing, and point-of-care devices.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 14. ALLERGY (ENTITY-ALLERGY)
// ═══════════════════════════════════════════════════════════════════

export const ALLERGY_SPEC = defineEntity({
  canonicalName: 'Allergy',
  canonicalCode: 'ENTITY-ALLERGY',
  entityCategory: 'observation',
  domain: 'Clinical',
  owningEngine: 'Allergy Engine',
  definition: 'A recorded allergy or intolerance to a substance (medication, food, environmental agent).',
  purpose: 'To record, verify, and alert on patient allergies to prevent adverse reactions.',
  responsibilities: ['Record allergies and intolerances', 'Track reaction types and severity', 'Generate clinical alerts', 'Support medication safety'],
  nonResponsibilities: [],
  stakeholders: ['Clinicians', 'Pharmacists', 'Nurses', 'Patients'],
  businessProcesses: ['Registration', 'Prescribing', 'Medication Administration', 'Allergy Review'],
  clinicalSignificance: 'Allergy information is critical for medication safety. Failure to recognize allergies can lead to preventable harm.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'belongs to', cardinality: 'N:1', description: 'Allergy belongs to a patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Medication Order', relationshipType: 'contraindicates', cardinality: 'N:N', description: 'Allergy contraindicates medications', constraints: [] },
  ],
  lifecycle: {
    states: ['Unconfirmed', 'Confirmed', 'Resolved', 'Refuted'],
    transitions: [
      { from: 'Unconfirmed', to: 'Confirmed', trigger: 'Verified by clinician', actor: 'Clinician', validationRules: ['Reaction documented'] },
      { from: 'Confirmed', to: 'Resolved', trigger: 'Allergy resolved', actor: 'Clinician', validationRules: [] },
      { from: 'Unconfirmed', to: 'Refuted', trigger: 'Allergy ruled out', actor: 'Clinician', validationRules: ['Rationale documented'] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-ALG-001', description: 'Medication allergies must generate alerts during prescribing', severity: 'critical', rationale: 'Patient safety' },
    { ruleId: 'BR-ALG-002', description: 'Severe allergy (anaphylaxis) must be prominently displayed', severity: 'critical', rationale: 'Clinical visibility' },
  ],
  domainEvents: [
    { eventName: 'Allergy Recorded', trigger: 'Allergy documented', initiator: 'Clinician', payloadSummary: 'Substance, reaction, severity', consumers: ['Medication Engine', 'Decision Support Engine'] },
  ],
  attributes: [
    { name: 'allergyId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'patientId', category: 'core', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'substance', category: 'core', type: 'string', mandatory: true, description: 'Allergen name' },
    { name: 'reaction', category: 'core', type: 'string[]', mandatory: true, description: 'Reaction types' },
    { name: 'severity', category: 'core', type: 'enum', mandatory: true, description: 'Mild, Moderate, Severe, Anaphylaxis' },
    { name: 'type', category: 'core', type: 'enum', mandatory: true, description: 'Allergy, Intolerance' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Unconfirmed, Confirmed, etc.' },
    { name: 'recordedAt', category: 'core', type: 'timestamp', mandatory: true, description: 'When recorded' },
  ],
  validation: { mandatory: ['patientId', 'substance', 'reaction', 'severity', 'type', 'status', 'recordedAt'], optional: [], unique: ['allergyId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['clinician', 'pharmacist', 'nurse'], readRoles: ['clinician', 'pharmacist', 'nurse', 'patient'], updateRoles: ['clinician'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['substance', 'reaction', 'severity'], retentionYears: 10, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true }],
  aiPermission: { canRead: true, canSummarize: true, canClassify: false, canSuggestModifications: true, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'AllergyIntolerance', mappingNotes: 'Direct mapping' }],
  extensibilityNotes: 'Support for intolerance subtypes and environmental allergies.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 15. AI RECOMMENDATION (ENTITY-AI-RECOMMENDATION)
// ═══════════════════════════════════════════════════════════════════

export const AI_RECOMMENDATION_SPEC = defineEntity({
  canonicalName: 'AI Recommendation',
  canonicalCode: 'ENTITY-AI-RECOMMENDATION',
  entityCategory: 'entity',
  domain: 'Clinical',
  owningEngine: 'AI Engine',
  definition: 'A suggestion, recommendation, or output generated by an Artificial Intelligence model during patient care.',
  purpose: 'To record, track, and audit AI-generated clinical suggestions in a transparent and accountable manner.',
  responsibilities: [
    'Record AI-generated recommendations',
    'Track recommendation acceptance or rejection',
    'Provide confidence scores and rationale',
    'Support explainable AI',
    'Enable AI performance monitoring',
  ],
  nonResponsibilities: ['AI does NOT make clinical decisions', 'AI does NOT replace clinician judgment'],
  stakeholders: ['Clinicians', 'AI Engineers', 'Quality', 'Researchers'],
  businessProcesses: ['Clinical Documentation', 'Decision Support', 'Clinical Summarization', 'Risk Prediction'],
  clinicalSignificance: 'AI recommendations augment clinical decision-making. Transparency and accountability are essential for safe AI integration.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'related to', cardinality: 'N:1', description: 'Recommendation about a patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Provider', relationshipType: 'presented to', cardinality: 'N:1', description: 'Presented to a clinician', constraints: [] },
    { relatedEntity: 'Encounter', relationshipType: 'generated during', cardinality: 'N:1', description: 'Generated during an encounter', constraints: ['Mandatory'] },
  ],
  lifecycle: {
    states: ['Generated', 'Presented', 'Accepted', 'Rejected', 'Dismissed', 'Outdated'],
    transitions: [
      { from: 'Generated', to: 'Presented', trigger: 'Recommendation shown to clinician', actor: 'System', validationRules: [] },
      { from: 'Presented', to: 'Accepted', trigger: 'Clinician accepts recommendation', actor: 'Clinician', validationRules: ['Clinician identity recorded'] },
      { from: 'Presented', to: 'Rejected', trigger: 'Clinician rejects recommendation', actor: 'Clinician', validationRules: ['Reason may be optional'] },
      { from: 'Presented', to: 'Dismissed', trigger: 'Clinician dismisses without action', actor: 'Clinician', validationRules: [] },
      { from: '*', to: 'Outdated', trigger: 'New data supersedes recommendation', actor: 'System', validationRules: [] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-AI-001', description: 'All AI recommendations must include a confidence score', severity: 'error', rationale: 'Transparency' },
    { ruleId: 'BR-AI-002', description: 'Clinician acceptance or rejection must be auditable', severity: 'critical', rationale: 'Accountability' },
    { ruleId: 'BR-AI-003', description: 'AI recommendations are advisory only', severity: 'critical', rationale: 'Clinical safety' },
  ],
  domainEvents: [
    { eventName: 'AI Recommendation Generated', trigger: 'AI model output', initiator: 'AI Engine', payloadSummary: 'Type, confidence, summary', consumers: ['Audit Engine', 'Analytics Engine'] },
    { eventName: 'AI Recommendation Accepted', trigger: 'Clinician accepts', initiator: 'Clinician', payloadSummary: 'Recommendation ID, action taken', consumers: ['AI Engine', 'Analytics Engine'] },
  ],
  attributes: [
    { name: 'recommendationId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'patientId', category: 'core', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'encounterId', category: 'core', type: 'UUID', mandatory: false, description: 'Encounter' },
    { name: 'providerId', category: 'core', type: 'UUID', mandatory: false, description: 'Clinician who received it' },
    { name: 'recommendationType', category: 'core', type: 'enum', mandatory: true, description: 'Summarization, Coding, DDx, Risk, Treatment, etc.' },
    { name: 'content', category: 'core', type: 'string', mandatory: true, description: 'Recommendation text' },
    { name: 'confidence', category: 'core', type: 'number', mandatory: true, description: 'Confidence score 0-1' },
    { name: 'rationale', category: 'core', type: 'string', mandatory: false, description: 'AI reasoning' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Lifecycle state' },
    { name: 'modelVersion', category: 'core', type: 'string', mandatory: true, description: 'AI model identifier' },
    { name: 'feedback', category: 'optional', type: 'string', mandatory: false, description: 'Clinician feedback' },
  ],
  validation: { mandatory: ['patientId', 'recommendationType', 'content', 'confidence', 'status', 'modelVersion'], optional: ['encounterId', 'providerId', 'rationale', 'feedback'], unique: ['recommendationId'], ranges: { confidence: { min: 0, max: 1 } }, crossField: [], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['ai_engine'], readRoles: ['clinician', 'ai_engine', 'researcher'], updateRoles: ['clinician'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'create', requiredFields: ['recommendationType', 'confidence', 'modelVersion'], retentionYears: 5, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true }],
  aiPermission: { canRead: true, canSummarize: false, canClassify: false, canSuggestModifications: false, canGenerateInstances: true, requiresHumanReview: true },
  interoperabilityMappings: [],
  extensibilityNotes: 'Support for model-specific recommendation schemas and multi-model ensembles.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 16. FACILITY (ENTITY-FACILITY)
// ═══════════════════════════════════════════════════════════════════

export const FACILITY_SPEC = defineEntity({
  canonicalName: 'Facility',
  canonicalCode: 'ENTITY-FACILITY',
  entityCategory: 'location',
  domain: 'Operational',
  owningEngine: 'Organization Engine',
  definition: 'A physical location where healthcare services are delivered.',
  purpose: 'To define healthcare service delivery locations within an organization.',
  responsibilities: ['Define facility hierarchy', 'Track facility details', 'Support multi-site deployments'],
  nonResponsibilities: [],
  stakeholders: ['Administrators', 'Registration', 'Operations'],
  businessProcesses: ['Registration', 'Operations', 'Reporting'],
  clinicalSignificance: 'Facility context determines workflows, availability, and reporting.',
  relationships: [
    { relatedEntity: 'Organization', relationshipType: 'owned by', cardinality: 'N:1', description: 'Facility owned by an organization', constraints: ['Mandatory'] },
    { relatedEntity: 'Department', relationshipType: 'contains', cardinality: '1:N', description: 'Facility contains departments', constraints: [] },
  ],
  lifecycle: { states: ['Active', 'Inactive', 'Closed'], transitions: [] },
  businessRules: [{ ruleId: 'BR-FAC-001', description: 'A facility must belong to an organization', severity: 'error', rationale: 'Organizational structure' }],
  domainEvents: [],
  attributes: [
    { name: 'facilityId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'name', category: 'core', type: 'string', mandatory: true, description: 'Facility name' },
    { name: 'type', category: 'core', type: 'enum', mandatory: true, description: 'Hospital, Clinic, Laboratory, Pharmacy, etc.' },
    { name: 'organizationId', category: 'core', type: 'UUID', mandatory: true, description: 'Owning organization' },
    { name: 'address', category: 'core', type: 'string', mandatory: false, description: 'Physical address' },
    { name: 'phone', category: 'core', type: 'string', mandatory: false, description: 'Contact number' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Active, Inactive, Closed' },
  ],
  validation: { mandatory: ['name', 'type', 'organizationId', 'status'], optional: ['address', 'phone'], unique: ['facilityId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'internal',
  accessPolicy: { createRoles: ['admin'], readRoles: ['*'], updateRoles: ['admin'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [],
  privacyRequirements: [{ dataType: 'none', deIdentificationRequired: false }],
  aiPermission: { canRead: true, canSummarize: false, canClassify: false, canSuggestModifications: false, canGenerateInstances: false, requiresHumanReview: false },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'Location', mappingNotes: 'Maps to FHIR Location resource' }],
  extensibilityNotes: 'Support for facility networks and health system hierarchies.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// 17. SPECIMEN (ENTITY-SPECIMEN)
// ═══════════════════════════════════════════════════════════════════

export const SPECIMEN_SPEC = defineEntity({
  canonicalName: 'Specimen',
  canonicalCode: 'ENTITY-SPECIMEN',
  entityCategory: 'entity',
  domain: 'Clinical',
  owningEngine: 'Investigation Engine',
  definition: 'A biological sample collected from a patient for analysis.',
  purpose: 'To track biological specimens from collection through analysis and disposal.',
  responsibilities: ['Track specimen collection and transport', 'Ensure specimen integrity', 'Link specimens to investigations'],
  nonResponsibilities: [],
  stakeholders: ['Clinicians', 'Nurses', 'Laboratory', 'Phlebotomists'],
  businessProcesses: ['Specimen Collection', 'Laboratory Testing', 'Pathology'],
  clinicalSignificance: 'Specimen integrity directly impacts diagnostic accuracy.',
  relationships: [
    { relatedEntity: 'Patient', relationshipType: 'collected from', cardinality: 'N:1', description: 'Specimen from patient', constraints: ['Mandatory'] },
    { relatedEntity: 'Investigation', relationshipType: 'used for', cardinality: '1:N', description: 'Specimen used for investigations', constraints: [] },
  ],
  lifecycle: {
    states: ['NotCollected', 'Collected', 'InTransit', 'Received', 'Analyzed', 'Discarded', 'Rejected'],
    transitions: [
      { from: 'NotCollected', to: 'Collected', trigger: 'Specimen obtained', actor: 'Nurse/Phlebotomist', validationRules: ['Correct container', 'Patient verified'] },
      { from: 'Collected', to: 'InTransit', trigger: 'Specimen sent to lab', actor: 'Courier/System', validationRules: [] },
      { from: 'InTransit', to: 'Received', trigger: 'Specimen arrives at lab', actor: 'Lab', validationRules: ['Condition check'] },
      { from: 'Received', to: 'Rejected', trigger: 'Specimen unsuitable', actor: 'Lab', validationRules: ['Reason documented'] },
    ],
  },
  businessRules: [
    { ruleId: 'BR-SPEC-001', description: 'Specimen rejection must include reason', severity: 'error', rationale: 'Quality management' },
    { ruleId: 'BR-SPEC-002', description: 'Specimen must be tracked from collection to disposal', severity: 'critical', rationale: 'Chain of custody' },
  ],
  domainEvents: [
    { eventName: 'Specimen Collected', trigger: 'Collection completed', initiator: 'Nurse', payloadSummary: 'Type, container, patient', consumers: ['Laboratory Engine', 'Workflow Engine'] },
    { eventName: 'Specimen Rejected', trigger: 'Lab rejects specimen', initiator: 'Lab', payloadSummary: 'Reason', consumers: ['Notification Engine', 'Order Management'] },
  ],
  attributes: [
    { name: 'specimenId', category: 'identity', type: 'UUID', mandatory: true, description: 'Unique identifier' },
    { name: 'patientId', category: 'core', type: 'UUID', mandatory: true, description: 'Patient' },
    { name: 'type', category: 'core', type: 'enum', mandatory: true, description: 'Blood, Urine, Tissue, Sputum, Stool, etc.' },
    { name: 'bodySite', category: 'core', type: 'string', mandatory: false, description: 'Collection site' },
    { name: 'container', category: 'core', type: 'string', mandatory: true, description: 'Container type' },
    { name: 'collectedAt', category: 'core', type: 'timestamp', mandatory: true, description: 'Collection time' },
    { name: 'collectedBy', category: 'core', type: 'UUID', mandatory: true, description: 'Collector' },
    { name: 'status', category: 'core', type: 'enum', mandatory: true, description: 'Lifecycle state' },
    { name: 'condition', category: 'core', type: 'enum', mandatory: false, description: 'Acceptable, Hemolyzed, Clotted, Insufficient' },
    { name: 'rejectionReason', category: 'optional', type: 'string', mandatory: false, description: 'If rejected' },
  ],
  validation: { mandatory: ['patientId', 'type', 'container', 'collectedAt', 'collectedBy', 'status'], optional: ['bodySite', 'condition', 'rejectionReason'], unique: ['specimenId'], ranges: {}, crossField: [], crossEntity: [] },
  securityClassification: 'confidential',
  accessPolicy: { createRoles: ['nurse', 'phlebotomist'], readRoles: ['clinician', 'lab', 'nurse'], updateRoles: ['lab'], archiveRoles: ['admin'], deleteRoles: [] },
  auditRequirements: [{ action: 'reject', requiredFields: ['reason', 'rejectedBy'], retentionYears: 5, immutable: true }],
  privacyRequirements: [{ dataType: 'phi', deIdentificationRequired: true }],
  aiPermission: { canRead: true, canSummarize: false, canClassify: true, canSuggestModifications: false, canGenerateInstances: false, requiresHumanReview: true },
  interoperabilityMappings: [{ standard: 'FHIR R4', resourceType: 'Specimen', mappingNotes: 'Direct mapping' }],
  extensibilityNotes: 'Support for veterinary and environmental specimens.',
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
// Register all entities in the catalog
// ═══════════════════════════════════════════════════════════════════

register(
  PATIENT_SPEC,
  PROVIDER_SPEC,
  ENCOUNTER_SPEC,
  DIAGNOSIS_SPEC,
  MEDICATION_ORDER_SPEC,
  ORGANIZATION_SPEC,
  OBSERVATION_SPEC,
  PROCEDURE_SPEC,
  CARE_PLAN_SPEC,
  APPOINTMENT_SPEC,
  CONSENT_SPEC,
  CLINICAL_DOCUMENT_SPEC,
  INVESTIGATION_SPEC,
  ALLERGY_SPEC,
  AI_RECOMMENDATION_SPEC,
  FACILITY_SPEC,
  SPECIMEN_SPEC,
);
