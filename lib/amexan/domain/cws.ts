// ═══════════════════════════════════════════════════════════════════
// AMEXAN CANONICAL WORKFLOW SPECIFICATION (CWS)
// Document: ACDM-CWS-001
// Every clinical, operational, and administrative workflow.
// ═══════════════════════════════════════════════════════════════════

export type WorkflowCategory =
  | 'clinical' | 'operational' | 'diagnostic' | 'financial'
  | 'governance' | 'research' | 'ai' | 'integration';
export type WorkflowLifecycleState =
  | 'designed' | 'approved' | 'available' | 'initiated' | 'active'
  | 'waiting' | 'suspended' | 'resumed' | 'completed' | 'archived';
export type ActivityExecution = 'sequential' | 'parallel' | 'conditional';
export type DecisionType = 'clinical' | 'operational' | 'financial' | 'governance';

export interface WorkflowActivity {
  activityId: string;
  description: string;
  responsibleRole: string;
  requiredInputs: string[];
  producedOutputs: string[];
  expectedDurationMinutes?: number;
  generatedEvents: string[];
  executionType: ActivityExecution;
}

export interface WorkflowDecision {
  decisionId: string;
  description: string;
  decisionType: DecisionType;
  options: Array<{
    label: string;
    outcome: string;
    nextActivities: string[];
  }>;
  decisionLogic: string;
  responsibleRole: string;
}

export interface ExceptionHandler {
  exception: string;
  recoveryAction: string;
  alternativePath: string[];
  escalationRequired: boolean;
  escalationsTo?: string;
}

export interface WorkflowSpec {
  workflowName: string;
  workflowCode: string;
  category: WorkflowCategory;
  owningEngine: string;
  objective: string;
  trigger: string;
  preconditions: string[];
  inputs: string[];
  actors: string[];
  activities: WorkflowActivity[];
  decisions: WorkflowDecision[];
  resources: string[];
  events: string[];
  outputs: string[];
  outcomes: string[];
  exceptions: ExceptionHandler[];
  expectedDurationMinutes?: number;
  maxDurationMinutes?: number;
  timeoutAction?: string;
  securityRequired: string[];
  auditRequired: boolean;
  aiIntegration: string[];
  version: string;
}

export const WORKFLOW_CATALOG: Record<string, WorkflowSpec> = {};

export function defineWorkflow(spec: WorkflowSpec): WorkflowSpec {
  WORKFLOW_CATALOG[spec.workflowCode] = spec;
  return spec;
}

// ─── WORKFLOW: OUTPATIENT CONSULTATION ───────────────────────────

export const OUTPATIENT_CONSULTATION = defineWorkflow({
  workflowName: 'Outpatient Consultation',
  workflowCode: 'WF-OUTPATIENT-CONSULTATION',
  category: 'clinical',
  owningEngine: 'Encounter Engine',
  objective: 'Assess, diagnose, treat, educate, and arrange follow-up for a patient attending an outpatient clinic.',
  trigger: 'Patient arrival or scheduled appointment start',
  preconditions: ['Patient identity verified', 'Encounter created', 'Consent available if required'],
  inputs: ['Patient record', 'Previous encounters', 'Vital signs', 'Referral letter', 'Insurance details'],
  actors: ['Patient', 'Physician', 'Nurse', 'Registration', 'Pharmacist', 'AI Assistant'],
  activities: [
    { activityId: 'ACT-001', description: 'Patient check-in and identity verification', responsibleRole: 'Registration', requiredInputs: ['Appointment ID'], producedOutputs: ['Verified identity'], expectedDurationMinutes: 2, generatedEvents: ['EVT-ENCOUNTER-STARTED'], executionType: 'sequential' },
    { activityId: 'ACT-002', description: 'Vital signs measurement', responsibleRole: 'Nurse', requiredInputs: ['Patient ID'], producedOutputs: ['Vital signs'], expectedDurationMinutes: 5, generatedEvents: ['EVT-OBSERVATION-RECORDED'], executionType: 'parallel' },
    { activityId: 'ACT-003', description: 'History taking and clinical documentation', responsibleRole: 'Physician', requiredInputs: ['Chief complaint', 'Vital signs'], producedOutputs: ['Clinical history', 'HPI'], expectedDurationMinutes: 10, generatedEvents: ['EVT-HISTORY-RECORDED'], executionType: 'sequential' },
    { activityId: 'ACT-004', description: 'Physical examination', responsibleRole: 'Physician', requiredInputs: ['Clinical history'], producedOutputs: ['Examination findings'], expectedDurationMinutes: 8, generatedEvents: ['EVT-OBSERVATION-RECORDED'], executionType: 'sequential' },
    { activityId: 'ACT-005', description: 'Diagnosis formulation', responsibleRole: 'Physician', requiredInputs: ['History', 'Examination', 'Investigations'], producedOutputs: ['Diagnosis', 'Differential'], expectedDurationMinutes: 3, generatedEvents: ['EVT-DIAGNOSIS-CONFIRMED'], executionType: 'sequential' },
    { activityId: 'ACT-006', description: 'Prescribing and management planning', responsibleRole: 'Physician', requiredInputs: ['Diagnosis'], producedOutputs: ['Prescription', 'Management plan'], expectedDurationMinutes: 5, generatedEvents: ['EVT-MEDICATION-PRESCRIBED'], executionType: 'sequential' },
    { activityId: 'ACT-007', description: 'Patient education and counselling', responsibleRole: 'Physician', requiredInputs: ['Diagnosis', 'Management plan'], producedOutputs: ['Patient understanding confirmed'], expectedDurationMinutes: 3, generatedEvents: [], executionType: 'sequential' },
    { activityId: 'ACT-008', description: 'Follow-up scheduling', responsibleRole: 'Registration', requiredInputs: ['Follow-up plan'], producedOutputs: ['Follow-up appointment'], expectedDurationMinutes: 2, generatedEvents: ['EVT-APPOINTMENT-SCHEDULED'], executionType: 'sequential' },
  ],
  decisions: [
    { decisionId: 'DEC-001', description: 'Does the patient require investigations?', decisionType: 'clinical', options: [{ label: 'Yes', outcome: 'Route to Investigation ordering', nextActivities: ['ACT-005'] }, { label: 'No', outcome: 'Proceed to Diagnosis', nextActivities: ['ACT-005'] }], decisionLogic: 'Based on clinical suspicion after history and examination', responsibleRole: 'Physician' },
    { decisionId: 'DEC-002', description: 'Is admission required?', decisionType: 'clinical', options: [{ label: 'Yes', outcome: 'Route to Admission workflow', nextActivities: ['ACT-008'] }, { label: 'No', outcome: 'Discharge with follow-up', nextActivities: ['ACT-007', 'ACT-008'] }], decisionLogic: 'Based on severity, diagnosis, and clinical stability', responsibleRole: 'Physician' },
  ],
  resources: ['Consultation room', 'Examination bed', 'Diagnostic equipment', 'Medication stock'],
  events: ['EVT-ENCOUNTER-STARTED', 'EVT-HISTORY-RECORDED', 'EVT-DIAGNOSIS-CONFIRMED', 'EVT-MEDICATION-PRESCRIBED', 'EVT-ENCOUNTER-COMPLETED'],
  outputs: ['Clinical note', 'Prescription', 'Discharge summary', 'Follow-up appointment'],
  outcomes: ['Correct diagnosis', 'Appropriate treatment', 'Patient educated', 'Follow-up arranged'],
  exceptions: [
    { exception: 'Patient leaves before review', recoveryAction: 'Document incomplete encounter', alternativePath: ['Complete documentation', 'Notify provider'], escalationRequired: true, escalationsTo: 'Department head' },
    { exception: 'Critical vital signs detected', recoveryAction: 'Initiate emergency protocol', alternativePath: ['Stabilize patient', 'Activate emergency team'], escalationRequired: true, escalationsTo: 'Emergency team' },
  ],
  expectedDurationMinutes: 30,
  maxDurationMinutes: 60,
  timeoutAction: 'Escalate to queue manager',
  securityRequired: ['Patient confidentiality', 'Clinician authentication'],
  auditRequired: true,
  aiIntegration: ['Clinical documentation assistance', 'Differential diagnosis suggestions', 'Medication interaction checking'],
  version: '1.0.0',
});

// ─── WORKFLOW: EMERGENCY RESUSCITATION ───────────────────────────

export const EMERGENCY_RESUSCITATION = defineWorkflow({
  workflowName: 'Emergency Resuscitation',
  workflowCode: 'WF-EMERGENCY-RESUSCITATION',
  category: 'clinical',
  owningEngine: 'Emergency Engine',
  objective: 'Rapidly assess, stabilize, and initiate treatment for critically ill or injured patients.',
  trigger: 'Emergency presentation with unstable vital signs or trauma activation',
  preconditions: ['Resuscitation bay available', 'Emergency team available', 'Airway equipment ready'],
  inputs: ['Patient identity (minimal)', 'Mechanism of injury', 'Presenting complaint', 'Triage category'],
  actors: ['Emergency Physician', 'Nurse', 'Anesthetist', 'Surgeon', 'Radiographer', 'Pharmacist', 'AI Assistant'],
  activities: [
    { activityId: 'ACT-E001', description: 'Primary survey (ABCDE)', responsibleRole: 'Emergency Team', requiredInputs: ['Patient', 'Monitoring equipment'], producedOutputs: ['Primary survey findings', 'Immediate interventions'], expectedDurationMinutes: 5, generatedEvents: ['EVT-OBSERVATION-RECORDED'], executionType: 'sequential' },
    { activityId: 'ACT-E002', description: 'Resuscitation interventions', responsibleRole: 'Emergency Team', requiredInputs: ['Primary survey findings'], producedOutputs: ['IV access', 'Airway secured', 'Fluids/Blood administered'], expectedDurationMinutes: 10, generatedEvents: ['EVT-PROCEDURE-COMPLETED'], executionType: 'parallel' },
    { activityId: 'ACT-E003', description: 'Secondary survey', responsibleRole: 'Emergency Physician', requiredInputs: ['Stabilized patient'], producedOutputs: ['Full examination findings'], expectedDurationMinutes: 10, generatedEvents: ['EVT-OBSERVATION-RECORDED'], executionType: 'sequential' },
    { activityId: 'ACT-E004', description: 'Investigations (bedside and laboratory)', responsibleRole: 'Emergency Team', requiredInputs: ['Clinical suspicion'], producedOutputs: ['Lab results', 'Imaging results'], expectedDurationMinutes: 15, generatedEvents: ['EVT-RESULT-VERIFIED'], executionType: 'parallel' },
    { activityId: 'ACT-E005', description: 'Diagnosis and disposition decision', responsibleRole: 'Emergency Physician', requiredInputs: ['All findings', 'Investigations'], producedOutputs: ['Working diagnosis', 'Disposition plan'], expectedDurationMinutes: 5, generatedEvents: ['EVT-DIAGNOSIS-CONFIRMED'], executionType: 'sequential' },
  ],
  decisions: [
    { decisionId: 'DEC-E001', description: 'Is the airway secure?', decisionType: 'clinical', options: [{ label: 'Yes', outcome: 'Proceed with breathing assessment', nextActivities: ['ACT-E002'] }, { label: 'No', outcome: 'Emergency airway management', nextActivities: ['ACT-E001'] }], decisionLogic: 'ABCDE algorithm — airway is always first priority', responsibleRole: 'Emergency Team' },
    { decisionId: 'DEC-E002', description: 'Does the patient need immediate surgery?', decisionType: 'clinical', options: [{ label: 'Yes', outcome: 'Activate trauma team / prepare theatre', nextActivities: ['ACT-E005'] }, { label: 'No', outcome: 'Continue resuscitation and investigations', nextActivities: ['ACT-E004', 'ACT-E005'] }], decisionLogic: 'Based on mechanism, injuries, and hemodynamic status', responsibleRole: 'Emergency Physician' },
  ],
  resources: ['Resuscitation bay', 'Ventilator', 'Defibrillator', 'Ultrasound', 'Blood products', 'Emergency medications', 'Chest tube set', 'Surgical pack'],
  events: ['EVT-ENCOUNTER-STARTED', 'EVT-OBSERVATION-RECORDED', 'EVT-PROCEDURE-COMPLETED', 'EVT-RESULT-VERIFIED', 'EVT-CRITICAL-RESULT', 'EVT-DIAGNOSIS-CONFIRMED'],
  outputs: ['Resuscitation record', 'Diagnosis', 'Disposition decision', 'Referral'],
  outcomes: ['Patient stabilized', 'Correct diagnosis identified', 'Appropriate disposition arranged'],
  exceptions: [
    { exception: 'Cardiac arrest', recoveryAction: 'Initiate ALS protocol', alternativePath: ['CPR', 'Defibrillation', 'Medication administration'], escalationRequired: true, escalationsTo: 'Code Blue team' },
    { exception: 'Mass casualty', recoveryAction: 'Activate disaster protocol', alternativePath: ['Triage', 'Resource mobilization', 'External notification'], escalationRequired: true, escalationsTo: 'Hospital incident command' },
  ],
  expectedDurationMinutes: 30,
  maxDurationMinutes: 120,
  timeoutAction: 'Automatic escalation to senior clinician',
  securityRequired: ['Minimal documentation during resuscitation', 'Complete documentation post-stabilization'],
  auditRequired: true,
  aiIntegration: ['Clinical decision support', 'Risk prediction', 'Drug dose calculation'],
  version: '1.0.0',
});

// ─── WORKFLOW: MEDICATION PRESCRIBING ────────────────────────────

export const MEDICATION_PRESCRIBING = defineWorkflow({
  workflowName: 'Medication Prescribing',
  workflowCode: 'WF-MEDICATION-PRESCRIBING',
  category: 'clinical',
  owningEngine: 'Medication Engine',
  objective: 'Safely prescribe, verify, dispense, and administer medications.',
  trigger: 'Clinician decision to prescribe',
  preconditions: ['Patient identified', 'Allergy information available', 'Weight recorded (for pediatric dosing)'],
  inputs: ['Patient ID', 'Diagnosis', 'Allergies', 'Current medications', 'Weight', 'Renal function'],
  actors: ['Clinician', 'Pharmacist', 'Nurse', 'Patient'],
  activities: [
    { activityId: 'ACT-M001', description: 'Select medication, dose, route, frequency', responsibleRole: 'Clinician', requiredInputs: ['Diagnosis', 'Formulary'], producedOutputs: ['Prescription draft'], expectedDurationMinutes: 2, generatedEvents: [], executionType: 'sequential' },
    { activityId: 'ACT-M002', description: 'Clinical decision support checks (allergy, interaction, dose)', responsibleRole: 'System', requiredInputs: ['Prescription details', 'Patient profile'], producedOutputs: ['CDS alerts'], expectedDurationMinutes: 0, generatedEvents: ['EVT-AI-RECOMMENDATION-GENERATED'], executionType: 'sequential' },
    { activityId: 'ACT-M003', description: 'Prescription signing', responsibleRole: 'Clinician', requiredInputs: ['Prescription draft', 'CDS results'], producedOutputs: ['Signed prescription'], expectedDurationMinutes: 1, generatedEvents: ['EVT-MEDICATION-PRESCRIBED'], executionType: 'sequential' },
    { activityId: 'ACT-M004', description: 'Pharmacy verification', responsibleRole: 'Pharmacist', requiredInputs: ['Signed prescription'], producedOutputs: ['Verified order'], expectedDurationMinutes: 5, generatedEvents: [], executionType: 'sequential' },
    { activityId: 'ACT-M005', description: 'Medication dispensing', responsibleRole: 'Pharmacist', requiredInputs: ['Verified order'], producedOutputs: ['Dispensed medication'], expectedDurationMinutes: 5, generatedEvents: [], executionType: 'sequential' },
    { activityId: 'ACT-M006', description: 'Medication administration', responsibleRole: 'Nurse', requiredInputs: ['Dispensed medication', 'Patient ID'], producedOutputs: ['Administration record'], expectedDurationMinutes: 5, generatedEvents: ['EVT-MEDICATION-ADMINISTERED'], executionType: 'sequential' },
  ],
  decisions: [
    { decisionId: 'DEC-M001', description: 'CDS alert generated?', decisionType: 'clinical', options: [{ label: 'Override', outcome: 'Document override reason and continue', nextActivities: ['ACT-M003'] }, { label: 'Cancel', outcome: 'Return to prescribing', nextActivities: ['ACT-M001'] }], decisionLogic: 'Based on severity of alert and clinical judgment', responsibleRole: 'Clinician' },
  ],
  resources: ['Medication formulary', 'Pharmacy stock', 'Dispensing equipment'],
  events: ['EVT-MEDICATION-PRESCRIBED', 'EVT-MEDICATION-ADMINISTERED', 'EVT-AI-RECOMMENDATION-GENERATED'],
  outputs: ['Signed prescription', 'Dispensed medication', 'Administration record'],
  outcomes: ['Safe medication administration', 'Allergy check performed', 'Interaction check performed'],
  exceptions: [
    { exception: 'Medication out of stock', recoveryAction: 'Suggest therapeutic alternative', alternativePath: ['Select alternative', 'Contact pharmacy'], escalationRequired: true, escalationsTo: 'Chief Pharmacist' },
    { exception: 'Adverse drug reaction', recoveryAction: 'Stop medication, document reaction, initiate treatment', alternativePath: ['Document ADR', 'Notify clinician', 'Update allergy record'], escalationRequired: true, escalationsTo: 'Clinician' },
  ],
  expectedDurationMinutes: 15,
  maxDurationMinutes: 60,
  timeoutAction: 'Reminder to pharmacy',
  securityRequired: ['Prescriber authentication', 'Pharmacist verification', 'Patient identity verification at admin'],
  auditRequired: true,
  aiIntegration: ['Drug interaction checking', 'Dose calculation', 'Therapeutic alternative suggestions'],
  version: '1.0.0',
});
