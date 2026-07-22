// ═══════════════════════════════════════════════════════════════════
// AMEXAN CANONICAL EVENT SPECIFICATION (CEvS)
// Document: ACDM-CEVS-001
// Every domain event generated or consumed within AMEXAN.
// ═══════════════════════════════════════════════════════════════════

import { EventCategory } from './meta';

export type EventLifecycleState = 'created' | 'validated' | 'published' | 'consumed' | 'archived';
export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

export interface DomainEventSpec {
  eventName: string;
  eventCode: string;
  category: EventCategory;
  description: string;
  trigger: string;
  sourceEntity: string;
  relatedEntities: string[];
  initiatingActor: string | string[];
  mandatoryAttributes: string[];
  optionalAttributes: string[];
  priority: EventPriority;
  consumers: string[];
  orderingConstraints: string[];
  securityClassification: string;
  retentionDays: number;
  version: string;
}

export const EVENT_CATALOG: Record<string, DomainEventSpec> = {};

export function defineEvent(spec: DomainEventSpec): DomainEventSpec {
  EVENT_CATALOG[spec.eventCode] = spec;
  return spec;
}

// ─── IDENTITY EVENTS ─────────────────────────────────────────────

export const PATIENT_REGISTERED = defineEvent({
  eventName: 'Patient Registered',
  eventCode: 'EVT-PATIENT-REGISTERED',
  category: 'identity',
  description: 'A new patient record has been created in the system.',
  trigger: 'Successful completion of patient registration',
  sourceEntity: 'Patient',
  relatedEntities: ['Organization', 'Provider'],
  initiatingActor: ['Registration', 'Patient', 'System'],
  mandatoryAttributes: ['patientId', 'legalName', 'dateOfBirth', 'sex', 'timestamp'],
  optionalAttributes: ['phoneNumber', 'emailAddress', 'address', 'emergencyContact'],
  priority: 'high',
  consumers: ['Identity Engine', 'Audit Engine', 'Analytics Engine', 'Search Engine', 'Scheduling Engine'],
  orderingConstraints: [],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

export const PATIENT_UPDATED = defineEvent({
  eventName: 'Patient Updated',
  eventCode: 'EVT-PATIENT-UPDATED',
  category: 'identity',
  description: 'Patient demographic or identifier information has changed.',
  trigger: 'Demographic update by registration or self-service',
  sourceEntity: 'Patient',
  relatedEntities: [],
  initiatingActor: ['Registration', 'Patient', 'System'],
  mandatoryAttributes: ['patientId', 'changedFields', 'timestamp'],
  optionalAttributes: ['previousValues'],
  priority: 'normal',
  consumers: ['Audit Engine', 'Search Engine', 'Integration Engine'],
  orderingConstraints: [],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

export const PATIENT_MERGED = defineEvent({
  eventName: 'Patient Merged',
  eventCode: 'EVT-PATIENT-MERGED',
  category: 'identity',
  description: 'Two patient records have been merged into one.',
  trigger: 'Duplicate identification and merge operation',
  sourceEntity: 'Patient',
  relatedEntities: ['Patient (duplicate)'],
  initiatingActor: ['Administrator', 'System'],
  mandatoryAttributes: ['survivingPatientId', 'mergedPatientId', 'timestamp'],
  optionalAttributes: ['reason'],
  priority: 'critical',
  consumers: ['All Engines', 'Audit Engine', 'Notification Engine'],
  orderingConstraints: ['Must be processed before any new operations on merged patients'],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

// ─── CLINICAL EVENTS ─────────────────────────────────────────────

export const ENCOUNTER_STARTED = defineEvent({
  eventName: 'Encounter Started',
  eventCode: 'EVT-ENCOUNTER-STARTED',
  category: 'clinical',
  description: 'A clinical encounter has been initiated for a patient.',
  trigger: 'Patient check-in or encounter activation',
  sourceEntity: 'Encounter',
  relatedEntities: ['Patient', 'Provider', 'Department'],
  initiatingActor: ['Registration', 'Clinician', 'System'],
  mandatoryAttributes: ['encounterId', 'patientId', 'encounterType', 'startTime', 'timestamp'],
  optionalAttributes: ['departmentId', 'providerId', 'triageCategory'],
  priority: 'high',
  consumers: ['Workflow Engine', 'Analytics Engine', 'Notification Engine', 'Clinical Documentation Engine', 'Billing Engine'],
  orderingConstraints: ['Must follow Patient Registered or Patient Verified'],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

export const ENCOUNTER_COMPLETED = defineEvent({
  eventName: 'Encounter Completed',
  eventCode: 'EVT-ENCOUNTER-COMPLETED',
  category: 'clinical',
  description: 'A clinical encounter has been completed.',
  trigger: 'Clinician finalizes the encounter',
  sourceEntity: 'Encounter',
  relatedEntities: ['Patient', 'Provider'],
  initiatingActor: ['Clinician', 'System'],
  mandatoryAttributes: ['encounterId', 'endTime', 'timestamp'],
  optionalAttributes: ['duration', 'outcome'],
  priority: 'high',
  consumers: ['Billing Engine', 'Analytics Engine', 'Workflow Engine', 'Research Engine'],
  orderingConstraints: ['Must follow Encounter Started'],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

export const DIAGNOSIS_CONFIRMED = defineEvent({
  eventName: 'Diagnosis Confirmed',
  eventCode: 'EVT-DIAGNOSIS-CONFIRMED',
  category: 'clinical',
  description: 'A diagnosis has been confirmed with supporting evidence.',
  trigger: 'Clinician confirms diagnosis',
  sourceEntity: 'Diagnosis',
  relatedEntities: ['Patient', 'Encounter', 'Observation'],
  initiatingActor: ['Clinician'],
  mandatoryAttributes: ['diagnosisId', 'patientId', 'conditionName', 'timestamp'],
  optionalAttributes: ['code', 'evidence'],
  priority: 'high',
  consumers: ['Care Plan Engine', 'Billing Engine', 'Analytics Engine', 'Research Engine', 'Notification Engine'],
  orderingConstraints: [],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

export const HISTORY_RECORDED = defineEvent({
  eventName: 'History Recorded',
  eventCode: 'EVT-HISTORY-RECORDED',
  category: 'clinical',
  description: 'Clinical history has been documented for an encounter.',
  trigger: 'History section completed in clinical documentation',
  sourceEntity: 'Clinical Document',
  relatedEntities: ['Encounter', 'Patient'],
  initiatingActor: ['Clinician', 'AI Assistant'],
  mandatoryAttributes: ['documentId', 'encounterId', 'timestamp'],
  optionalAttributes: ['aiAssisted'],
  priority: 'normal',
  consumers: ['Analytics Engine', 'AI Engine'],
  orderingConstraints: [],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

export const PROCEDURE_COMPLETED = defineEvent({
  eventName: 'Procedure Completed',
  eventCode: 'EVT-PROCEDURE-COMPLETED',
  category: 'clinical',
  description: 'A clinical procedure has been completed.',
  trigger: 'Procedure finished',
  sourceEntity: 'Procedure',
  relatedEntities: ['Patient', 'Encounter', 'Provider'],
  initiatingActor: ['Clinician', 'System'],
  mandatoryAttributes: ['procedureId', 'procedureName', 'patientId', 'timestamp'],
  optionalAttributes: ['duration', 'complications', 'outcome'],
  priority: 'high',
  consumers: ['Billing Engine', 'Analytics Engine', 'Workflow Engine'],
  orderingConstraints: [],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

// ─── MEDICATION EVENTS ───────────────────────────────────────────

export const MEDICATION_PRESCRIBED = defineEvent({
  eventName: 'Medication Prescribed',
  eventCode: 'EVT-MEDICATION-PRESCRIBED',
  category: 'medication',
  description: 'A medication has been prescribed for a patient.',
  trigger: 'Prescription signed by clinician',
  sourceEntity: 'Medication Order',
  relatedEntities: ['Patient', 'Encounter', 'Provider'],
  initiatingActor: ['Clinician'],
  mandatoryAttributes: ['orderId', 'patientId', 'medicationName', 'dose', 'route', 'frequency', 'timestamp'],
  optionalAttributes: ['duration', 'instructions'],
  priority: 'high',
  consumers: ['Pharmacy Engine', 'Notification Engine', 'Analytics Engine', 'Decision Support Engine'],
  orderingConstraints: [],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

export const MEDICATION_ADMINISTERED = defineEvent({
  eventName: 'Medication Administered',
  eventCode: 'EVT-MEDICATION-ADMINISTERED',
  category: 'medication',
  description: 'A medication dose has been administered to a patient.',
  trigger: 'Nurse or clinician administers medication',
  sourceEntity: 'Medication Administration',
  relatedEntities: ['Patient', 'Medication Order', 'Provider'],
  initiatingActor: ['Nurse', 'Clinician'],
  mandatoryAttributes: ['administrationId', 'orderId', 'patientId', 'medicationName', 'dose', 'timestamp'],
  optionalAttributes: ['route', 'batchNumber', 'witness'],
  priority: 'high',
  consumers: ['Medication Engine', 'Audit Engine', 'Billing Engine'],
  orderingConstraints: ['Must reference an active Medication Order'],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

// ─── INVESTIGATION EVENTS ────────────────────────────────────────

export const INVESTIGATION_ORDERED = defineEvent({
  eventName: 'Investigation Ordered',
  eventCode: 'EVT-INVESTIGATION-ORDERED',
  category: 'investigation',
  description: 'A diagnostic investigation has been ordered.',
  trigger: 'Clinician places order',
  sourceEntity: 'Investigation',
  relatedEntities: ['Patient', 'Encounter', 'Provider'],
  initiatingActor: ['Clinician'],
  mandatoryAttributes: ['investigationId', 'testName', 'patientId', 'priority', 'timestamp'],
  optionalAttributes: ['clinicalQuestion', 'urgency'],
  priority: 'normal',
  consumers: ['Laboratory Engine', 'Workflow Engine', 'Order Management'],
  orderingConstraints: [],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

export const RESULT_VERIFIED = defineEvent({
  eventName: 'Result Verified',
  eventCode: 'EVT-RESULT-VERIFIED',
  category: 'investigation',
  description: 'A laboratory or diagnostic result has been verified.',
  trigger: 'Result validated by authorized professional',
  sourceEntity: 'Investigation',
  relatedEntities: ['Patient', 'Encounter'],
  initiatingActor: ['Lab Scientist', 'Clinician', 'System'],
  mandatoryAttributes: ['investigationId', 'result', 'interpretation', 'verifiedBy', 'timestamp'],
  optionalAttributes: ['flag', 'referenceRange'],
  priority: 'critical',
  consumers: ['Clinical Engine', 'Notification Engine', 'Analytics Engine', 'Decision Support Engine'],
  orderingConstraints: ['Must follow Investigation Ordered'],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

export const CRITICAL_RESULT = defineEvent({
  eventName: 'Critical Result',
  eventCode: 'EVT-CRITICAL-RESULT',
  category: 'investigation',
  description: 'A result outside the critical range has been identified.',
  trigger: 'Result exceeds critical threshold',
  sourceEntity: 'Observation',
  relatedEntities: ['Patient', 'Encounter', 'Investigation'],
  initiatingActor: ['System'],
  mandatoryAttributes: ['observationId', 'patientId', 'value', 'criticalRange', 'timestamp'],
  optionalAttributes: ['notifiedClinician'],
  priority: 'critical',
  consumers: ['Notification Engine', 'Workflow Engine', 'Escalation Engine'],
  orderingConstraints: ['Must follow Result Verified'],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

// ─── OPERATIONAL EVENTS ──────────────────────────────────────────

export const APPOINTMENT_SCHEDULED = defineEvent({
  eventName: 'Appointment Scheduled',
  eventCode: 'EVT-APPOINTMENT-SCHEDULED',
  category: 'operational',
  description: 'A patient appointment has been scheduled.',
  trigger: 'Booking confirmed',
  sourceEntity: 'Appointment',
  relatedEntities: ['Patient', 'Provider', 'Department'],
  initiatingActor: ['Patient', 'Registration', 'System'],
  mandatoryAttributes: ['appointmentId', 'patientId', 'startTime', 'endTime', 'timestamp'],
  optionalAttributes: ['providerId', 'departmentId', 'reason'],
  priority: 'normal',
  consumers: ['Notification Engine', 'Queue Engine', 'Scheduling Engine'],
  orderingConstraints: [],
  securityClassification: 'confidential',
  retentionDays: 365,
  version: '1.0.0',
});

export const PATIENT_DISCHARGED = defineEvent({
  eventName: 'Patient Discharged',
  eventCode: 'EVT-PATIENT-DISCHARGED',
  category: 'operational',
  description: 'A patient has been discharged from a care episode.',
  trigger: 'Discharge process completed',
  sourceEntity: 'Encounter',
  relatedEntities: ['Patient', 'Department'],
  initiatingActor: ['Clinician', 'System'],
  mandatoryAttributes: ['encounterId', 'patientId', 'dischargeDate', 'dischargeType', 'timestamp'],
  optionalAttributes: ['dischargeSummaryId', 'followUpPlan'],
  priority: 'high',
  consumers: ['Bed Management Engine', 'Billing Engine', 'Analytics Engine', 'Notification Engine'],
  orderingConstraints: ['Must follow Encounter Completed'],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

// ─── GOVERNANCE EVENTS ───────────────────────────────────────────

export const CONSENT_GRANTED = defineEvent({
  eventName: 'Consent Granted',
  eventCode: 'EVT-CONSENT-GRANTED',
  category: 'governance',
  description: 'Patient consent has been given for a specific purpose.',
  trigger: 'Consent signed by patient or representative',
  sourceEntity: 'Consent',
  relatedEntities: ['Patient', 'Procedure'],
  initiatingActor: ['Patient', 'Representative'],
  mandatoryAttributes: ['consentId', 'patientId', 'consentType', 'timestamp'],
  optionalAttributes: ['scope', 'expiryDate'],
  priority: 'high',
  consumers: ['Workflow Engine', 'Research Engine', 'Audit Engine'],
  orderingConstraints: ['Must precede the consent-dependent activity'],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

export const CONSENT_WITHDRAWN = defineEvent({
  eventName: 'Consent Withdrawn',
  eventCode: 'EVT-CONSENT-WITHDRAWN',
  category: 'governance',
  description: 'Patient consent has been withdrawn.',
  trigger: 'Patient withdraws consent',
  sourceEntity: 'Consent',
  relatedEntities: ['Patient'],
  initiatingActor: ['Patient', 'Representative'],
  mandatoryAttributes: ['consentId', 'patientId', 'timestamp'],
  optionalAttributes: ['reason'],
  priority: 'critical',
  consumers: ['All Engines', 'Workflow Engine', 'Research Engine'],
  orderingConstraints: ['Must be honored immediately'],
  securityClassification: 'confidential',
  retentionDays: 3650,
  version: '1.0.0',
});

// ─── AI EVENTS ───────────────────────────────────────────────────

export const AI_RECOMMENDATION_GENERATED = defineEvent({
  eventName: 'AI Recommendation Generated',
  eventCode: 'EVT-AI-RECOMMENDATION-GENERATED',
  category: 'ai',
  description: 'An AI model has produced a recommendation.',
  trigger: 'AI model output',
  sourceEntity: 'AI Recommendation',
  relatedEntities: ['Patient', 'Encounter'],
  initiatingActor: ['AI Engine', 'System'],
  mandatoryAttributes: ['recommendationId', 'patientId', 'recommendationType', 'content', 'confidence', 'modelVersion', 'timestamp'],
  optionalAttributes: ['rationale'],
  priority: 'normal',
  consumers: ['Audit Engine', 'Analytics Engine', 'AI Engine'],
  orderingConstraints: [],
  securityClassification: 'confidential',
  retentionDays: 1825,
  version: '1.0.0',
});

export const AI_RECOMMENDATION_ACCEPTED = defineEvent({
  eventName: 'AI Recommendation Accepted',
  eventCode: 'EVT-AI-RECOMMENDATION-ACCEPTED',
  category: 'ai',
  description: 'A clinician has accepted an AI recommendation.',
  trigger: 'Clinician action',
  sourceEntity: 'AI Recommendation',
  relatedEntities: ['Clinician'],
  initiatingActor: ['Clinician'],
  mandatoryAttributes: ['recommendationId', 'clinicianId', 'action', 'timestamp'],
  optionalAttributes: ['feedback'],
  priority: 'normal',
  consumers: ['AI Engine', 'Analytics Engine', 'Quality Engine'],
  orderingConstraints: ['Must follow AI Recommendation Generated'],
  securityClassification: 'confidential',
  retentionDays: 1825,
  version: '1.0.0',
});

// ─── EVENT SEQUENCE MAP ──────────────────────────────────────────

/**
 * Canonical event ordering for a typical outpatient encounter:
 *
 * Patient Registered
 *   └─▶ Appointment Scheduled (if pre-scheduled)
 *        └─▶ Appointment Checked In
 *             └─▶ Encounter Started
 *                  ├─▶ History Recorded
 *                  ├─▶ Observation Recorded
 *                  ├─▶ Diagnosis Added
 *                  │    └─▶ Diagnosis Confirmed
 *                  ├─▶ Investigation Ordered
 *                  │    └─▶ Specimen Collected
 *                  │         └─▶ Result Verified
 *                  │              └─▶ Critical Result (if applicable)
 *                  ├─▶ Medication Prescribed
 *                  │    └─▶ Medication Administered
 *                  └─▶ Procedure Completed
 *                       └─▶ Encounter Completed
 *                            └─▶ Patient Discharged
 */

export function getEventSequence(encounterType: string): string[] {
  const sequences: Record<string, string[]> = {
    outpatient: [
      'EVT-PATIENT-REGISTERED',
      'EVT-APPOINTMENT-SCHEDULED',
      'EVT-ENCOUNTER-STARTED',
      'EVT-HISTORY-RECORDED',
      'EVT-DIAGNOSIS-CONFIRMED',
      'EVT-ENCOUNTER-COMPLETED',
    ],
    emergency: [
      'EVT-PATIENT-REGISTERED',
      'EVT-ENCOUNTER-STARTED',
      'EVT-INVESTIGATION-ORDERED',
      'EVT-RESULT-VERIFIED',
      'EVT-DIAGNOSIS-CONFIRMED',
      'EVT-ENCOUNTER-COMPLETED',
      'EVT-PATIENT-DISCHARGED',
    ],
    inpatient: [
      'EVT-PATIENT-REGISTERED',
      'EVT-ENCOUNTER-STARTED',
      'EVT-DIAGNOSIS-CONFIRMED',
      'EVT-MEDICATION-PRESCRIBED',
      'EVT-PROCEDURE-COMPLETED',
      'EVT-ENCOUNTER-COMPLETED',
      'EVT-PATIENT-DISCHARGED',
    ],
    surgery: [
      'EVT-PATIENT-REGISTERED',
      'EVT-CONSENT-GRANTED',
      'EVT-ENCOUNTER-STARTED',
      'EVT-PROCEDURE-COMPLETED',
      'EVT-ENCOUNTER-COMPLETED',
      'EVT-PATIENT-DISCHARGED',
    ],
  };
  return sequences[encounterType] || sequences.outpatient;
}
