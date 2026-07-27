export type EventType =
  | 'patient.registered' | 'patient.updated' | 'patient.merged'
  | 'encounter.started' | 'encounter.completed' | 'encounter.cancelled'
  | 'symptom.recorded' | 'symptom.updated' | 'symptom.resolved'
  | 'fact.recorded' | 'fact.updated' | 'fact.invalidated'
  | 'examination.performed' | 'examination.section_completed'
  | 'finding.recorded' | 'finding.updated'
  | 'investigation.ordered' | 'investigation.resulted' | 'investigation.cancelled'
  | 'diagnosis.added' | 'diagnosis.updated' | 'diagnosis.removed'
  | 'differential.updated'
  | 'treatment.prescribed' | 'treatment.administered' | 'treatment.discontinued'
  | 'medication.ordered' | 'medication.administered' | 'medication.discontinued'
  | 'procedure.performed' | 'procedure.cancelled'
  | 'guideline.activated' | 'guideline.deactivated'
  | 'rule.evaluated' | 'rule.triggered' | 'rule.suppressed'
  | 'alert.raised' | 'alert.acknowledged' | 'alert.resolved'
  | 'workflow.transitioned' | 'workflow.blocked'
  | 'task.created' | 'task.completed' | 'task.assigned' | 'task.escalated'
  | 'notification.sent' | 'notification.read'
  | 'document.generated' | 'document.signed' | 'document.amended'
  | 'discharge.ordered' | 'discharge.completed'
  | 'referral.made' | 'referral.accepted' | 'referral.declined'
  | 'admission.ordered' | 'admission.completed' | 'transfer.ordered'
  | 'outcome.recorded'
  | 'vital.recorded' | 'vital.alert'
  | 'score.calculated' | 'score.threshold_exceeded'
  | 'monitoring.alert' | 'monitoring.triggered'
  | 'public_health.notification' | 'public_health.case_reported'
  | 'audit.access' | 'audit.modify' | 'audit.view';

export interface EventActor {
  id: string;
  type: 'clinician' | 'nurse' | 'lab_technician' | 'pharmacist' | 'admin' | 'system' | 'patient';
  name?: string;
  role?: string;
}

export interface EventPatient {
  id: string;
  encounterId?: string;
  mrn?: string;
}

export interface ClinicalEvent {
  id: string;
  type: EventType;
  timestamp: number;
  source: string;
  actor: EventActor;
  patient: EventPatient;
  context: Record<string, unknown>;
  payload: unknown;
  previousEventId?: string;
  metadata: {
    version: string;
    provenance: 'user_input' | 'system_generated' | 'imported' | 'calculated' | 'ai_suggested';
    tags: string[];
    correlationId?: string;
  };
}

export interface EventSubscription {
  id: string;
  eventType: EventType | '*';
  handler: EventHandler;
  filter?: (event: ClinicalEvent) => boolean;
  priority: number;
  description: string;
  once?: boolean;
}

export type EventHandler = (event: ClinicalEvent) => void;

export interface CascadeRule {
  id: string;
  triggerEvent: EventType;
  condition?: (event: ClinicalEvent) => boolean;
  effects: CascadeEffect[];
  priority: number;
  active: boolean;
  description: string;
}

export type CascadeEffectType =
  | 'evaluate_rules' | 'generate_task' | 'send_notification'
  | 'update_differential' | 'suggest_investigation' | 'suggest_treatment'
  | 'trigger_workflow' | 'calculate_score' | 'generate_document'
  | 'publish_public_health' | 'flag_red_flag';

export interface CascadeEffect {
  type: CascadeEffectType;
  params: Record<string, unknown>;
  target?: string;
  delay?: number;
}

export interface EventFilter {
  types?: EventType[];
  patientId?: string;
  actorId?: string;
  startTime?: number;
  endTime?: number;
  source?: string;
  limit?: number;
}

export const EVENT_CATEGORIES: Record<string, EventType[]> = {
  patient: ['patient.registered', 'patient.updated', 'patient.merged'],
  encounter: ['encounter.started', 'encounter.completed', 'encounter.cancelled'],
  clinical: [
    'symptom.recorded', 'symptom.updated', 'symptom.resolved',
    'fact.recorded', 'fact.updated', 'fact.invalidated',
    'examination.performed', 'examination.section_completed',
    'finding.recorded', 'finding.updated',
  ],
  diagnostics: [
    'investigation.ordered', 'investigation.resulted', 'investigation.cancelled',
  ],
  diagnosis: [
    'diagnosis.added', 'diagnosis.updated', 'diagnosis.removed', 'differential.updated',
  ],
  treatment: [
    'treatment.prescribed', 'treatment.administered', 'treatment.discontinued',
    'medication.ordered', 'medication.administered', 'medication.discontinued',
    'procedure.performed', 'procedure.cancelled',
  ],
  decision_support: [
    'guideline.activated', 'guideline.deactivated',
    'rule.evaluated', 'rule.triggered', 'rule.suppressed',
    'alert.raised', 'alert.acknowledged', 'alert.resolved',
  ],
  workflow: [
    'workflow.transitioned', 'workflow.blocked',
    'task.created', 'task.completed', 'task.assigned', 'task.escalated',
    'notification.sent', 'notification.read',
  ],
  documentation: ['document.generated', 'document.signed', 'document.amended'],
  disposition: [
    'discharge.ordered', 'discharge.completed',
    'referral.made', 'referral.accepted', 'referral.declined',
    'admission.ordered', 'admission.completed', 'transfer.ordered',
    'outcome.recorded',
  ],
  monitoring: [
    'vital.recorded', 'vital.alert',
    'score.calculated', 'score.threshold_exceeded',
    'monitoring.alert', 'monitoring.triggered',
  ],
  public_health: ['public_health.notification', 'public_health.case_reported'],
  audit: ['audit.access', 'audit.modify', 'audit.view'],
};

export const EVENT_LABELS: Record<EventType, string> = {
  'patient.registered': 'Patient Registered',
  'patient.updated': 'Patient Updated',
  'patient.merged': 'Patient Records Merged',
  'encounter.started': 'Encounter Started',
  'encounter.completed': 'Encounter Completed',
  'encounter.cancelled': 'Encounter Cancelled',
  'symptom.recorded': 'Symptom Recorded',
  'symptom.updated': 'Symptom Updated',
  'symptom.resolved': 'Symptom Resolved',
  'fact.recorded': 'Clinical Fact Recorded',
  'fact.updated': 'Clinical Fact Updated',
  'fact.invalidated': 'Clinical Fact Invalidated',
  'examination.performed': 'Examination Performed',
  'examination.section_completed': 'Exam Section Completed',
  'finding.recorded': 'Clinical Finding Recorded',
  'finding.updated': 'Finding Updated',
  'investigation.ordered': 'Investigation Ordered',
  'investigation.resulted': 'Investigation Resulted',
  'investigation.cancelled': 'Investigation Cancelled',
  'diagnosis.added': 'Diagnosis Added',
  'diagnosis.updated': 'Diagnosis Updated',
  'diagnosis.removed': 'Diagnosis Removed',
  'differential.updated': 'Differential Updated',
  'treatment.prescribed': 'Treatment Prescribed',
  'treatment.administered': 'Treatment Administered',
  'treatment.discontinued': 'Treatment Discontinued',
  'medication.ordered': 'Medication Ordered',
  'medication.administered': 'Medication Administered',
  'medication.discontinued': 'Medication Discontinued',
  'procedure.performed': 'Procedure Performed',
  'procedure.cancelled': 'Procedure Cancelled',
  'guideline.activated': 'Guideline Activated',
  'guideline.deactivated': 'Guideline Deactivated',
  'rule.evaluated': 'Rule Evaluated',
  'rule.triggered': 'Rule Triggered',
  'rule.suppressed': 'Rule Suppressed',
  'alert.raised': 'Alert Raised',
  'alert.acknowledged': 'Alert Acknowledged',
  'alert.resolved': 'Alert Resolved',
  'workflow.transitioned': 'Workflow Transitioned',
  'workflow.blocked': 'Workflow Blocked',
  'task.created': 'Task Created',
  'task.completed': 'Task Completed',
  'task.assigned': 'Task Assigned',
  'task.escalated': 'Task Escalated',
  'notification.sent': 'Notification Sent',
  'notification.read': 'Notification Read',
  'document.generated': 'Document Generated',
  'document.signed': 'Document Signed',
  'document.amended': 'Document Amended',
  'discharge.ordered': 'Discharge Ordered',
  'discharge.completed': 'Discharge Completed',
  'referral.made': 'Referral Made',
  'referral.accepted': 'Referral Accepted',
  'referral.declined': 'Referral Declined',
  'admission.ordered': 'Admission Ordered',
  'admission.completed': 'Admission Completed',
  'transfer.ordered': 'Transfer Ordered',
  'outcome.recorded': 'Outcome Recorded',
  'vital.recorded': 'Vital Sign Recorded',
  'vital.alert': 'Vital Sign Alert',
  'score.calculated': 'Score Calculated',
  'score.threshold_exceeded': 'Score Threshold Exceeded',
  'monitoring.alert': 'Monitoring Alert',
  'monitoring.triggered': 'Monitoring Triggered',
  'public_health.notification': 'Public Health Notification',
  'public_health.case_reported': 'Public Health Case Reported',
  'audit.access': 'Audit: Access',
  'audit.modify': 'Audit: Modify',
  'audit.view': 'Audit: View',
};
