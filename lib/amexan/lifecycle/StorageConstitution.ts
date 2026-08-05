// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN STORAGE CONSTITUTION (BOOK VIII — PostgreSQL / Neo4j Responsibility)
//
// Two databases, two responsibilities, one constitution.
//
//   PostgreSQL  →  operational truth (users, organizations, patients, encounters,
//                  orders, results, billing, HR, inventory, scheduling,
//                  notifications, messages, permissions). Fast, transactional,
//                  reliable.
//
//   Neo4j       →  intelligence (disease relationships, drug interactions, clinical
//                  pathways, teaching graphs, research, guidelines, evidence,
//                  symptom graphs, reasoning, knowledge). This powers Clinical AI.
//
// This constitution declares, for every center, exactly which tables PostgreSQL
// owns and which graph relationships Neo4j mirrors. Dashboards, HMIS, EMR, AI,
// notifications, and analytics all emerge naturally from these declarations.
//
// Pure data. No persistence is performed here.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── PostgreSQL: operational truth ──────────────────────────────────────────────

export interface PostgresTable {
  name: string;
  center: 'person' | 'patient' | 'encounter' | 'knowledge' | 'organization';
  columns: string[];
  description: string;
}

export interface PostgresSchema {
  tables: PostgresTable[];
}

export const POSTGRES_SCHEMA: PostgresSchema = {
  tables: [
    // Center 1 — PERSON
    { name: 'person', center: 'person', description: 'Every human in the system, patient or staff.', columns: ['id', 'identity_id', 'created_at', 'updated_at'] },
    { name: 'actor', center: 'person', description: 'A role a person plays (doctor, nurse, patient, student).', columns: ['id', 'person_id', 'primary_category', 'categories', 'active'] },
    { name: 'identity', center: 'person', description: 'Verified identity attributes.', columns: ['id', 'person_id', 'national_id', 'verified', 'verified_at'] },
    { name: 'credentials', center: 'person', description: 'Login credentials.', columns: ['id', 'person_id', 'username', 'password_hash', 'mfa_enabled'] },
    { name: 'preferences', center: 'person', description: 'User display and workflow preferences.', columns: ['id', 'person_id', 'language', 'timezone', 'theme'] },
    { name: 'memberships', center: 'person', description: 'Organization memberships.', columns: ['id', 'person_id', 'organization_id', 'role', 'active'] },
    { name: 'sessions', center: 'person', description: 'Active and historical sessions.', columns: ['id', 'actor_id', 'started_at', 'last_active_at', 'ended_at', 'active'] },
    // Center 2 — PATIENT
    { name: 'patients', center: 'patient', description: 'Core patient record, owned by the patient.', columns: ['id', 'person_id', 'created_at'] },
    { name: 'demographics', center: 'patient', description: 'Demographic attributes.', columns: ['patient_id', 'dob', 'gender', 'blood_group', 'marital_status', 'occupation'] },
    { name: 'contacts', center: 'patient', description: 'Phone, email, address, next-of-kin.', columns: ['id', 'patient_id', 'type', 'value', 'is_primary'] },
    { name: 'insurance', center: 'patient', description: 'Insurance policies.', columns: ['id', 'patient_id', 'provider', 'policy_number', 'valid_until', 'active'] },
    { name: 'consent', center: 'patient', description: 'Consent grants and revocations.', columns: ['id', 'patient_id', 'type', 'scope', 'granted_at', 'revoked_at'] },
    { name: 'guardians', center: 'patient', description: 'Legal guardians and consent levels.', columns: ['id', 'patient_id', 'person_id', 'relationship', 'consent_level'] },
    { name: 'alerts', center: 'patient', description: 'Allergy and warning alerts.', columns: ['id', 'patient_id', 'type', 'severity', 'title', 'active'] },
    // Center 3 — ENCOUNTER
    { name: 'encounter', center: 'encounter', description: 'The encounter — the unit of hospital operation.', columns: ['id', 'patient_id', 'organization_id', 'type', 'stage', 'status', 'registered_at', 'closed_at'] },
    { name: 'encounter_events', center: 'encounter', description: 'Every event in an encounter lifecycle.', columns: ['id', 'encounter_id', 'type', 'at', 'actor_id', 'payload'] },
    { name: 'orders', center: 'encounter', description: 'Investigations and interventions ordered.', columns: ['id', 'encounter_id', 'type', 'tests', 'status', 'ordered_by', 'ordered_at'] },
    { name: 'results', center: 'encounter', description: 'Investigation results.', columns: ['id', 'order_id', 'summary', 'resulted_at', 'verified_by'] },
    { name: 'notes', center: 'encounter', description: 'Clinical notes.', columns: ['id', 'encounter_id', 'author_id', 'body', 'created_at'] },
    { name: 'procedures', center: 'encounter', description: 'Procedures performed.', columns: ['id', 'encounter_id', 'type', 'performed_at', 'performed_by'] },
    { name: 'billing', center: 'encounter', description: 'Billable activity per encounter.', columns: ['id', 'encounter_id', 'kind', 'amount', 'status'] },
    { name: 'medications', center: 'encounter', description: 'Medication orders.', columns: ['id', 'encounter_id', 'medication_id', 'dose', 'route', 'status'] },
    { name: 'vitals', center: 'encounter', description: 'Vital sign observations.', columns: ['id', 'encounter_id', 'systolic_bp', 'diastolic_bp', 'heart_rate', 'respiratory_rate', 'temperature', 'spo2'] },
    { name: 'appointments', center: 'encounter', description: 'Scheduled appointments.', columns: ['id', 'patient_id', 'clinician_id', 'scheduled_at', 'status'] },
    { name: 'discharge', center: 'encounter', description: 'Discharge summaries.', columns: ['id', 'encounter_id', 'summary', 'disposition', 'completed_at', 'completed_by'] },
    // Center 5 — ORGANIZATION
    { name: 'users', center: 'organization', description: 'Organization users.', columns: ['id', 'person_id', 'department_id', 'roles', 'active'] },
    { name: 'organizations', center: 'organization', description: 'The organization itself.', columns: ['id', 'name', 'type', 'status'] },
    { name: 'permissions', center: 'organization', description: 'Permission grants.', columns: ['id', 'actor_id', 'role', 'actions', 'granted_at'] },
    { name: 'inventory', center: 'organization', description: 'Stock and inventory.', columns: ['id', 'name', 'category', 'quantity', 'reorder_level'] },
    { name: 'scheduling', center: 'organization', description: 'Rooms, theatres, clinics, staff schedules.', columns: ['id', 'resource_kind', 'resource_id', 'start_at', 'end_at', 'assignee_id'] },
    { name: 'notifications', center: 'organization', description: 'Fan-out notifications.', columns: ['id', 'actor_id', 'event_id', 'title', 'message', 'read', 'created_at'] },
    { name: 'messages', center: 'organization', description: 'Secure messaging.', columns: ['id', 'sender_id', 'recipient_id', 'body', 'sent_at', 'read_at'] },
  ],
};

export function getPostgresTables(center: PostgresTable['center']): PostgresTable[] {
  return POSTGRES_SCHEMA.tables.filter(t => t.center === center);
}

// ── Neo4j: intelligence ────────────────────────────────────────────────────────

export interface Neo4jRelationship {
  label: string;
  from: string;
  to: string;
  description: string;
}

export interface Neo4jSchema {
  centers: Record<string, { nodes: string[] }>;
  relationships: Neo4jRelationship[];
}

export const NEO4J_SCHEMA: Neo4jSchema = {
  centers: {
    person: { nodes: ['Person', 'Actor'] },
    patient: { nodes: ['Patient', 'Disease', 'Medication', 'Doctor', 'Hospital', 'Family', 'Research', 'Education'] },
    encounter: { nodes: ['Encounter', 'Symptom', 'Sign', 'Diagnosis', 'Investigation', 'Treatment', 'Outcome'] },
    knowledge: { nodes: ['Concept', 'Symptom', 'Condition', 'Diagnosis', 'Investigation', 'Treatment', 'Drug', 'Pathway', 'Guideline', 'Evidence'] },
    organization: { nodes: ['Organization', 'Department', 'Building', 'Bed', 'Theatre', 'Clinic'] },
  },
  relationships: [
    // Person
    { label: 'WORKS_AT', from: 'Person', to: 'Organization', description: 'Employment relationship.' },
    { label: 'TREATS', from: 'Person', to: 'Patient', description: 'Clinical relationship.' },
    { label: 'SUPERVISES', from: 'Person', to: 'Person', description: 'Supervision hierarchy.' },
    { label: 'TEACHES', from: 'Person', to: 'Person', description: 'Education relationship.' },
    // Patient
    { label: 'HAS_DISEASE', from: 'Patient', to: 'Disease', description: 'Diagnosed disease.' },
    { label: 'ON_MEDICATION', from: 'Patient', to: 'Medication', description: 'Active medication.' },
    { label: 'TREATED_BY', from: 'Patient', to: 'Doctor', description: 'Treating clinician.' },
    { label: 'ATTENDS', from: 'Patient', to: 'Hospital', description: 'Facility attended.' },
    { label: 'HAS_FAMILY', from: 'Patient', to: 'Family', description: 'Family member.' },
    { label: 'IN_STUDY', from: 'Patient', to: 'Research', description: 'Research participation.' },
    { label: 'RECEIVED_EDUCATION', from: 'Patient', to: 'Education', description: 'Patient education.' },
    // Encounter — the AI reasoning graph
    { label: 'HAS_SYMPTOM', from: 'Encounter', to: 'Symptom', description: 'Reported symptom.' },
    { label: 'HAS_SIGN', from: 'Encounter', to: 'Sign', description: 'Exam finding.' },
    { label: 'HAS_DIAGNOSIS', from: 'Encounter', to: 'Diagnosis', description: 'Diagnosis.' },
    { label: 'REQUIRES', from: 'Encounter', to: 'Investigation', description: 'Ordered investigation.' },
    { label: 'RECEIVED_TREATMENT', from: 'Encounter', to: 'Treatment', description: 'Treatment.' },
    { label: 'LED_TO_OUTCOME', from: 'Encounter', to: 'Outcome', description: 'Outcome.' },
    // Knowledge — graph traversal reasoning
    { label: 'SUGGESTS', from: 'Symptom', to: 'Condition', description: 'Symptom suggests condition.' },
    { label: 'CONFIRMED_BY', from: 'Condition', to: 'Investigation', description: 'Condition confirmed by investigation.' },
    { label: 'REQUIRES', from: 'Condition', to: 'Treatment', description: 'Condition requires treatment.' },
    { label: 'INTERACTS_WITH', from: 'Drug', to: 'Drug', description: 'Drug interaction.' },
    { label: 'GUIDED_BY', from: 'Pathway', to: 'Guideline', description: 'Pathway is guided by guideline.' },
    { label: 'SUPPORTED_BY', from: 'Guideline', to: 'Evidence', description: 'Guideline supported by evidence.' },
    // Organization
    { label: 'HAS_DEPARTMENT', from: 'Organization', to: 'Department', description: 'Department structure.' },
    { label: 'HOUSED_IN', from: 'Department', to: 'Building', description: 'Building location.' },
    { label: 'HAS_BED', from: 'Department', to: 'Bed', description: 'Bed resource.' },
    { label: 'OPERATES', from: 'Organization', to: 'Theatre', description: 'Theatre resource.' },
    { label: 'RUNS', from: 'Organization', to: 'Clinic', description: 'Clinic resource.' },
  ],
};

export function getNeo4jRelationships(center: string): Neo4jRelationship[] {
  return NEO4J_SCHEMA.relationships.filter(r => NEO4J_SCHEMA.centers[center]?.nodes.includes(r.from) || NEO4J_SCHEMA.centers[center]?.nodes.includes(r.to));
}

// ── Knowledge graph seed (Chest Pain → ACS → ECG → Troponin → STEMI → Cath Lab) ─

export interface GraphSeedEdge {
  from: string;
  relation: string;
  to: string;
  weight: number;
  evidence: string[];
}

export const KNOWLEDGE_GRAPH_SEED: GraphSeedEdge[] = [
  { from: 'Chest Pain', relation: 'suggests', to: 'ACS', weight: 0.9, evidence: ['NICE chest pain guideline'] },
  { from: 'Chest Pain', relation: 'radiates to', to: 'Left Arm', weight: 0.7, evidence: ['ACS classic presentation'] },
  { from: 'Chest Pain', relation: 'associated with', to: 'Sweating', weight: 0.6, evidence: ['ACS autonomic symptoms'] },
  { from: 'ACS', relation: 'requires', to: 'ECG', weight: 1.0, evidence: ['STEMI diagnosis requires ECG'] },
  { from: 'ACS', relation: 'confirmed by', to: 'Troponin', weight: 0.9, evidence: ['High-sensitivity troponin'] },
  { from: 'ECG', relation: 'identifies', to: 'STEMI', weight: 0.95, evidence: ['ST elevation criteria'] },
  { from: 'STEMI', relation: 'requires', to: 'Cath Lab', weight: 1.0, evidence: ['Primary PCI guidelines'] },
  { from: 'STEMI', relation: 'treated with', to: 'Primary PCI', weight: 1.0, evidence: ['ESC STEMI guidelines'] },
  { from: 'STEMI', relation: 'treated with', to: 'Antiplatelet Therapy', weight: 0.85, evidence: ['DAPT guideline'] },
  { from: 'Sweating', relation: 'suggests', to: 'Hypoglycaemia', weight: 0.5, evidence: ['Differential consideration'] },
];

// ── Storage responsibility maps ────────────────────────────────────────────────

export interface CenterStorage {
  center: string;
  postgresTables: string[];
  neo4jNodes: string[];
  neo4jRelationships: string[];
}

export const CENTER_STORAGE_MAP: CenterStorage[] = [
  { center: 'person', postgresTables: getPostgresTables('person').map(t => t.name), neo4jNodes: NEO4J_SCHEMA.centers.person.nodes, neo4jRelationships: getNeo4jRelationships('person').map(r => r.label) },
  { center: 'patient', postgresTables: getPostgresTables('patient').map(t => t.name), neo4jNodes: NEO4J_SCHEMA.centers.patient.nodes, neo4jRelationships: getNeo4jRelationships('patient').map(r => r.label) },
  { center: 'encounter', postgresTables: getPostgresTables('encounter').map(t => t.name), neo4jNodes: NEO4J_SCHEMA.centers.encounter.nodes, neo4jRelationships: getNeo4jRelationships('encounter').map(r => r.label) },
  { center: 'knowledge', postgresTables: getPostgresTables('knowledge').map(t => t.name), neo4jNodes: NEO4J_SCHEMA.centers.knowledge.nodes, neo4jRelationships: getNeo4jRelationships('knowledge').map(r => r.label) },
  { center: 'organization', postgresTables: getPostgresTables('organization').map(t => t.name), neo4jNodes: NEO4J_SCHEMA.centers.organization.nodes, neo4jRelationships: getNeo4jRelationships('organization').map(r => r.label) },
];

export function getStorageForCenter(center: string): CenterStorage | undefined {
  return CENTER_STORAGE_MAP.find(c => c.center === center);
}
