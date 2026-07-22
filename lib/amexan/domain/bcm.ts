// ═══════════════════════════════════════════════════════════════════
// AMEXAN BOUNDED CONTEXT MAP (BCM)
// Document: MIR-BCM-001
// Every Engine, its ownership, responsibilities, and interfaces.
// ═══════════════════════════════════════════════════════════════════

export type EngineCategory = 'business' | 'platform' | 'experience';

export interface EngineDependency {
  engineCode: string;
  dependencyType: 'api' | 'event' | 'reference_data';
}

export interface EngineSpec {
  engineName: string;
  engineCode: string;
  category: EngineCategory;
  purpose: string;
  owns: string[];
  doesNotOwn: string[];
  responsibilities: string[];
  publishes: string[];
  consumes: string[];
  dependencies: EngineDependency[];
  publicApis: string[];
  mvpPriority: number;
  version: string;
}

export const ENGINE_CATALOG: Record<string, EngineSpec> = {};

export function defineEngine(spec: EngineSpec): EngineSpec {
  ENGINE_CATALOG[spec.engineCode] = spec;
  return spec;
}

// ═══════════════════════════════════════════════════════════════════
//  BUSINESS ENGINES
// ═══════════════════════════════════════════════════════════════════

export const IDENTITY_ENGINE = defineEngine({
  engineName: 'Identity Engine',
  engineCode: 'ENG-IDENTITY',
  category: 'business',
  purpose: 'Manage digital identities across the platform.',
  owns: ['User', 'Login Credential', 'Authentication Session', 'MFA Config', 'Digital Identity', 'Device Registration'],
  doesNotOwn: ['Patient clinical data', 'Encounters', 'Diagnoses'],
  responsibilities: ['Authenticate users', 'Manage sessions', 'Verify identities', 'Support SSO'],
  publishes: ['User Created', 'User Disabled', 'Login Successful', 'Login Failed', 'Session Expired'],
  consumes: ['Organization Created', 'Role Updated'],
  dependencies: [],
  publicApis: ['Authenticate', 'Logout', 'Refresh Session', 'Verify Identity', 'Reset Credential'],
  mvpPriority: 1,
  version: '1.0.0',
});

export const ORGANIZATION_ENGINE = defineEngine({
  engineName: 'Organization Engine',
  engineCode: 'ENG-ORGANIZATION',
  category: 'business',
  purpose: 'Manage organizational hierarchy and facility structure.',
  owns: ['Organization', 'Facility', 'Building', 'Department', 'Ward', 'Room', 'Bed', 'Service Line'],
  doesNotOwn: ['Users', 'Patients'],
  responsibilities: ['Define organization hierarchy', 'Manage facilities', 'Track bed availability'],
  publishes: ['Organization Created', 'Organization Merged', 'Facility Added', 'Bed Status Changed'],
  consumes: [],
  dependencies: [],
  publicApis: ['Create Organization', 'Get Facilities', 'Get Bed Availability', 'Update Department'],
  mvpPriority: 2,
  version: '1.0.0',
});

export const PATIENT_ENGINE = defineEngine({
  engineName: 'Patient Engine',
  engineCode: 'ENG-PATIENT',
  category: 'business',
  purpose: 'Own patient identity and demographics — not clinical data.',
  owns: ['Patient', 'Demographics', 'Identifiers', 'Contacts', 'Next of Kin', 'Deceased Status'],
  doesNotOwn: ['Diagnoses', 'Encounters', 'Medications', 'Observations'],
  responsibilities: ['Register patients', 'Manage identifiers', 'Support merge/split', 'Track patient status'],
  publishes: ['Patient Registered', 'Patient Updated', 'Patient Merged', 'Patient Deceased'],
  consumes: [],
  dependencies: [{ engineCode: 'ENG-IDENTITY', dependencyType: 'api' }],
  publicApis: ['Register Patient', 'Search Patients', 'Merge Patients', 'Get Patient', 'Update Demographics'],
  mvpPriority: 1,
  version: '1.0.0',
});

export const ENCOUNTER_ENGINE = defineEngine({
  engineName: 'Encounter Engine',
  engineCode: 'ENG-ENCOUNTER',
  category: 'business',
  purpose: 'Manage the encounter lifecycle — the temporal container for care delivery.',
  owns: ['Encounter', 'Episode of Care', 'Visit', 'Admission Episode', 'Discharge Episode', 'Transfer Episode'],
  doesNotOwn: ['Diagnoses', 'Observations', 'Medications'],
  responsibilities: ['Create and manage encounters', 'Track encounter lifecycle', 'Manage admissions and discharges', 'Coordinate transfers'],
  publishes: ['Encounter Started', 'Encounter Closed', 'Patient Admitted', 'Patient Discharged', 'Patient Transferred'],
  consumes: ['Patient Registered', 'Appointment Checked In'],
  dependencies: [{ engineCode: 'ENG-PATIENT', dependencyType: 'api' }],
  publicApis: ['Start Encounter', 'Complete Encounter', 'Cancel Encounter', 'Get Encounter', 'Search Encounters'],
  mvpPriority: 1,
  version: '1.0.0',
});

export const CLINICAL_DOCUMENTATION_ENGINE = defineEngine({
  engineName: 'Clinical Documentation Engine',
  engineCode: 'ENG-CLINICAL-DOC',
  category: 'business',
  purpose: 'Record, store, and manage all clinical documentation.',
  owns: ['Clinical Document', 'History', 'Examination', 'Clinical Note', 'Progress Note', 'Operative Note', 'Discharge Summary', 'Referral Letter'],
  doesNotOwn: ['Diagnoses', 'Observations'],
  responsibilities: ['Create clinical documents', 'Support structured and narrative documentation', 'Manage document lifecycle', 'Enable document signing and amendment'],
  publishes: ['Document Created', 'Document Signed', 'Document Amended'],
  consumes: ['Encounter Started', 'Encounter Completed'],
  dependencies: [{ engineCode: 'ENG-ENCOUNTER', dependencyType: 'api' }],
  publicApis: ['Create Document', 'Sign Document', 'Amend Document', 'Get Document', 'Search Documents'],
  mvpPriority: 1,
  version: '1.0.0',
});

export const OBSERVATION_ENGINE = defineEngine({
  engineName: 'Observation Engine',
  engineCode: 'ENG-OBSERVATION',
  category: 'business',
  purpose: 'Capture, store, and serve all clinical observations and measurements.',
  owns: ['Observation', 'Vital Sign', 'Physical Finding', 'Clinical Score', 'Measurement'],
  doesNotOwn: ['Diagnoses', 'Medication Orders'],
  responsibilities: ['Record observations', 'Flag abnormal values', 'Support trending', 'Enable decision support'],
  publishes: ['Observation Recorded', 'Critical Result'],
  consumes: ['Encounter Started'],
  dependencies: [{ engineCode: 'ENG-ENCOUNTER', dependencyType: 'api' }],
  publicApis: ['Record Observation', 'Get Observations', 'Get Vitals', 'Search Observations'],
  mvpPriority: 2,
  version: '1.0.0',
});

export const DIAGNOSIS_ENGINE = defineEngine({
  engineName: 'Diagnosis Engine',
  engineCode: 'ENG-DIAGNOSIS',
  category: 'business',
  purpose: 'Manage all clinical diagnoses — the authoritative source for patient conditions.',
  owns: ['Diagnosis', 'Differential Diagnosis', 'Problem List', 'Condition', 'Allergy', 'Clinical Impression'],
  doesNotOwn: ['Observations', 'Care Plans'],
  responsibilities: ['Record diagnoses', 'Manage differential lists', 'Track diagnosis lifecycle', 'Support clinical coding'],
  publishes: ['Diagnosis Added', 'Diagnosis Confirmed', 'Diagnosis Resolved', 'Diagnosis Refuted'],
  consumes: ['Encounter Started'],
  dependencies: [{ engineCode: 'ENG-ENCOUNTER', dependencyType: 'api' }],
  publicApis: ['Add Diagnosis', 'Confirm Diagnosis', 'Get Diagnoses', 'Get Problem List', 'Search Diagnoses'],
  mvpPriority: 2,
  version: '1.0.0',
});

export const ORDERS_ENGINE = defineEngine({
  engineName: 'Orders Engine',
  engineCode: 'ENG-ORDERS',
  category: 'business',
  purpose: 'Manage all clinical orders and route them to downstream engines.',
  owns: ['Order', 'Order Set', 'Standing Order'],
  doesNotOwn: ['Investigations', 'Medications'],
  responsibilities: ['Create orders', 'Route to appropriate engines', 'Track order status', 'Manage order sets'],
  publishes: ['Order Created', 'Order Completed', 'Order Cancelled'],
  consumes: ['Encounter Started'],
  dependencies: [{ engineCode: 'ENG-ENCOUNTER', dependencyType: 'api' }],
  publicApis: ['Create Order', 'Cancel Order', 'Get Orders', 'Get Order Status'],
  mvpPriority: 2,
  version: '1.0.0',
});

export const INVESTIGATION_ENGINE = defineEngine({
  engineName: 'Investigation Engine',
  engineCode: 'ENG-INVESTIGATION',
  category: 'business',
  purpose: 'Manage diagnostic investigations — laboratory, imaging, pathology.',
  owns: ['Investigation', 'Specimen', 'Result', 'Diagnostic Report'],
  doesNotOwn: ['Orders'],
  responsibilities: ['Process investigation orders', 'Track specimens', 'Verify results', 'Flag critical values'],
  publishes: ['Investigation Ordered', 'Specimen Collected', 'Result Verified', 'Critical Result'],
  consumes: ['Order Created'],
  dependencies: [{ engineCode: 'ENG-ORDERS', dependencyType: 'api' }],
  publicApis: ['Order Investigation', 'Get Results', 'Verify Result', 'Get Specimen Status'],
  mvpPriority: 2,
  version: '1.0.0',
});

export const MEDICATION_ENGINE = defineEngine({
  engineName: 'Medication Engine',
  engineCode: 'ENG-MEDICATION',
  category: 'business',
  purpose: 'Manage the complete medication lifecycle — prescribing, dispensing, administration.',
  owns: ['Medication Order', 'Medication Administration', 'Medication Dispensing', 'Medication Reconciliation', 'Adverse Drug Reaction'],
  doesNotOwn: ['Orders'],
  responsibilities: ['Manage prescriptions', 'Support dispensing', 'Track administration', 'Check interactions', 'Manage allergies'],
  publishes: ['Medication Prescribed', 'Medication Administered', 'Medication Discontinued', 'Adverse Reaction Recorded'],
  consumes: ['Order Created', 'Allergy Recorded'],
  dependencies: [{ engineCode: 'ENG-ORDERS', dependencyType: 'api' }, { engineCode: 'ENG-PATIENT', dependencyType: 'api' }],
  publicApis: ['Prescribe', 'Dispense', 'Administer', 'Reconcile', 'Get Medication History'],
  mvpPriority: 2,
  version: '1.0.0',
});

export const PROCEDURE_ENGINE = defineEngine({
  engineName: 'Procedure Engine',
  engineCode: 'ENG-PROCEDURE',
  category: 'business',
  purpose: 'Document and track all clinical procedures.',
  owns: ['Procedure', 'Surgery', 'Anesthesia Record', 'Implant', 'Theatre Case'],
  doesNotOwn: ['Orders'],
  responsibilities: ['Document procedures', 'Track intraoperative events', 'Manage implants', 'Support surgical workflows'],
  publishes: ['Procedure Scheduled', 'Procedure Started', 'Procedure Completed'],
  consumes: ['Order Created', 'Consent Granted'],
  dependencies: [{ engineCode: 'ENG-ENCOUNTER', dependencyType: 'api' }],
  publicApis: ['Schedule Procedure', 'Start Procedure', 'Complete Procedure', 'Get Procedure'],
  mvpPriority: 3,
  version: '1.0.0',
});

export const CARE_PLANNING_ENGINE = defineEngine({
  engineName: 'Care Planning Engine',
  engineCode: 'ENG-CARE-PLAN',
  category: 'business',
  purpose: 'Coordinate multidisciplinary care through structured care plans.',
  owns: ['Care Plan', 'Goal', 'Intervention', 'Outcome Evaluation'],
  doesNotOwn: ['Diagnoses'],
  responsibilities: ['Create care plans', 'Track goals', 'Manage interventions', 'Monitor outcomes'],
  publishes: ['Care Plan Activated', 'Goal Achieved', 'Care Plan Completed'],
  consumes: ['Diagnosis Confirmed'],
  dependencies: [{ engineCode: 'ENG-DIAGNOSIS', dependencyType: 'api' }],
  publicApis: ['Create Care Plan', 'Add Goal', 'Track Intervention', 'Evaluate Outcome'],
  mvpPriority: 3,
  version: '1.0.0',
});

export const SCHEDULING_ENGINE = defineEngine({
  engineName: 'Scheduling Engine',
  engineCode: 'ENG-SCHEDULING',
  category: 'business',
  purpose: 'Manage appointments, calendars, queues, and resource booking.',
  owns: ['Appointment', 'Calendar', 'Clinic Session', 'Queue', 'Resource Booking'],
  doesNotOwn: ['Encounters'],
  responsibilities: ['Schedule appointments', 'Manage queues', 'Book resources', 'Send reminders'],
  publishes: ['Appointment Scheduled', 'Appointment Cancelled', 'Appointment Checked In', 'Queue Updated'],
  consumes: ['Patient Registered'],
  dependencies: [{ engineCode: 'ENG-PATIENT', dependencyType: 'api' }],
  publicApis: ['Create Appointment', 'Cancel Appointment', 'Check In', 'Get Queue', 'Get Availability'],
  mvpPriority: 3,
  version: '1.0.0',
});

export const AI_ENGINE = defineEngine({
  engineName: 'AI Engine',
  engineCode: 'ENG-AI',
  category: 'business',
  purpose: 'Provide AI-powered clinical assistance while preserving clinician authority.',
  owns: ['AI Recommendation', 'AI Summary', 'AI Risk Assessment', 'AI Confidence', 'AI Feedback'],
  doesNotOwn: ['Clinical decisions', 'Diagnoses', 'Prescriptions'],
  responsibilities: ['Generate clinical summaries', 'Suggest differential diagnoses', 'Calculate risk scores', 'Assist with documentation', 'Monitor AI performance'],
  publishes: ['AI Recommendation Generated', 'AI Recommendation Accepted', 'AI Recommendation Rejected'],
  consumes: ['Encounter Started', 'Observation Recorded', 'Diagnosis Confirmed', 'Medication Prescribed'],
  dependencies: [{ engineCode: 'ENG-CLINICAL-DOC', dependencyType: 'api' }],
  publicApis: ['Generate Summary', 'Get Recommendations', 'Submit Feedback', 'Get Risk Assessment'],
  mvpPriority: 4,
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
//  PLATFORM ENGINES
// ═══════════════════════════════════════════════════════════════════

export const WORKFLOW_ENGINE = defineEngine({
  engineName: 'Workflow Engine',
  engineCode: 'ENG-WORKFLOW',
  category: 'platform',
  purpose: 'Orchestrate clinical and operational workflows across all engines.',
  owns: ['Workflow Definition', 'Workflow Instance', 'Workflow State', 'Workflow Task'],
  doesNotOwn: ['Clinical data'],
  responsibilities: ['Execute workflow definitions', 'Track workflow state', 'Manage tasks', 'Handle escalations'],
  publishes: ['Workflow Started', 'Workflow Completed', 'Task Assigned', 'Escalation Triggered'],
  consumes: ['All domain events'],
  dependencies: [],
  publicApis: ['Start Workflow', 'Get Workflow State', 'Complete Task', 'Get Pending Tasks'],
  mvpPriority: 1,
  version: '1.0.0',
});

export const NOTIFICATION_ENGINE = defineEngine({
  engineName: 'Notification Engine',
  engineCode: 'ENG-NOTIFICATION',
  category: 'platform',
  purpose: 'Deliver timely notifications across all channels.',
  owns: ['Notification', 'Notification Template', 'Notification Channel', 'Subscription'],
  doesNotOwn: ['Clinical data'],
  responsibilities: ['Send notifications', 'Manage subscriptions', 'Track delivery', 'Support multi-channel (in-app, email, SMS)'],
  publishes: ['Notification Sent', 'Notification Read'],
  consumes: ['All domain events that require notification'],
  dependencies: [],
  publicApis: ['Send Notification', 'Get Notifications', 'Mark Read', 'Manage Subscriptions'],
  mvpPriority: 2,
  version: '1.0.0',
});

export const AUDIT_ENGINE = defineEngine({
  engineName: 'Audit Engine',
  engineCode: 'ENG-AUDIT',
  category: 'platform',
  purpose: 'Record every significant action for compliance, security, and analysis.',
  owns: ['Audit Entry', 'Audit Trail'],
  doesNotOwn: ['Business data'],
  responsibilities: ['Record all significant events', 'Support audit queries', 'Enforce retention policies', 'Enable compliance reporting'],
  publishes: [],
  consumes: ['All domain events'],
  dependencies: [],
  publicApis: ['Query Audit Log', 'Get Audit Trail', 'Export Audit Report'],
  mvpPriority: 2,
  version: '1.0.0',
});

export const SEARCH_ENGINE = defineEngine({
  engineName: 'Search Engine',
  engineCode: 'ENG-SEARCH',
  category: 'platform',
  purpose: 'Provide fast, secure, unified search across all platform data.',
  owns: ['Search Index', 'Search Query'],
  doesNotOwn: ['Source data'],
  responsibilities: ['Index platform data', 'Execute searches', 'Respect security boundaries', 'Provide relevance ranking'],
  publishes: [],
  consumes: ['Patient Registered', 'Patient Updated', 'Document Created', 'Encounter Started'],
  dependencies: [],
  publicApis: ['Search', 'Get Search Suggestions', 'Rebuild Index'],
  mvpPriority: 2,
  version: '1.0.0',
});

export const SYNCHRONIZATION_ENGINE = defineEngine({
  engineName: 'Synchronization Engine',
  engineCode: 'ENG-SYNC',
  category: 'platform',
  purpose: 'Enable offline-first operation with reliable data synchronization.',
  owns: ['Sync Queue', 'Sync Session', 'Conflict Resolution'],
  doesNotOwn: ['Business data'],
  responsibilities: ['Manage offline queues', 'Resolve conflicts', 'Ensure eventual consistency', 'Handle connectivity changes'],
  publishes: ['Sync Completed', 'Conflict Detected'],
  consumes: ['All domain events (for offline queue)'],
  dependencies: [],
  publicApis: ['Push Changes', 'Pull Changes', 'Get Sync Status', 'Resolve Conflict'],
  mvpPriority: 2,
  version: '1.0.0',
});

export const INTEGRATION_ENGINE = defineEngine({
  engineName: 'Integration Engine',
  engineCode: 'ENG-INTEGRATION',
  category: 'platform',
  purpose: 'Handle all external system communication via standards-based interfaces.',
  owns: ['Integration Connection', 'Message Queue', 'Mapping Configuration', 'External Credential'],
  doesNotOwn: ['Clinical data'],
  responsibilities: ['Manage external connections', 'Transform messages (FHIR, HL7)', 'Handle retries and errors', 'Log all exchanges'],
  publishes: ['Integration Message Sent', 'Integration Message Received', 'Connection Status Changed'],
  consumes: ['Domain events requiring external communication'],
  dependencies: [],
  publicApis: ['Send Message', 'Get Connection Status', 'Get Message Log'],
  mvpPriority: 4,
  version: '1.0.0',
});

// ═══════════════════════════════════════════════════════════════════
//  ENGINE DEPENDENCY MAP
// ═══════════════════════════════════════════════════════════════════

export const ENGINE_DEPENDENCY_GRAPH: Record<string, string[]> = {
  'ENG-IDENTITY': [],
  'ENG-ORGANIZATION': [],
  'ENG-PATIENT': ['ENG-IDENTITY'],
  'ENG-ENCOUNTER': ['ENG-PATIENT', 'ENG-ORGANIZATION'],
  'ENG-CLINICAL-DOC': ['ENG-ENCOUNTER', 'ENG-PATIENT'],
  'ENG-OBSERVATION': ['ENG-ENCOUNTER', 'ENG-PATIENT'],
  'ENG-DIAGNOSIS': ['ENG-ENCOUNTER', 'ENG-OBSERVATION'],
  'ENG-ORDERS': ['ENG-ENCOUNTER', 'ENG-PATIENT'],
  'ENG-INVESTIGATION': ['ENG-ORDERS', 'ENG-PATIENT'],
  'ENG-MEDICATION': ['ENG-ORDERS', 'ENG-PATIENT', 'ENG-DIAGNOSIS'],
  'ENG-PROCEDURE': ['ENG-ENCOUNTER', 'ENG-ORDERS'],
  'ENG-CARE-PLAN': ['ENG-DIAGNOSIS', 'ENG-PATIENT'],
  'ENG-SCHEDULING': ['ENG-PATIENT', 'ENG-ORGANIZATION'],
  'ENG-AI': ['ENG-CLINICAL-DOC', 'ENG-OBSERVATION', 'ENG-DIAGNOSIS'],
  'ENG-WORKFLOW': [],
  'ENG-NOTIFICATION': [],
  'ENG-AUDIT': [],
  'ENG-SEARCH': [],
  'ENG-SYNC': [],
  'ENG-INTEGRATION': [],
};
