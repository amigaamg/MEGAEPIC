// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Constitution — Care Team Operational Context Engine
// Book II Volume IV: Every professional sees only what they need to do
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  CareTeamContext, CareTeamProfession, CareTeamShift, CareTeamAssignment,
  CareTeamLocation, CareTeamWorkspace, CareTeamAssignmentType,
  CareTeamNotification, CareTeamHandoverNote,
  ActivePatient, QueueItem, ClinicalTask, WorkflowInstance,
  WorkspaceSection, CareTeamRightPanelConfig,
  HandoverPatient,
} from './types';

import type { AmxUid } from '../constitution/types';

let _counter = 0;
function uid(prefix: string): string {
  _counter++;
  return `${prefix}_${Date.now()}_${_counter}`;
}

// ── Workspace Presets ─────────────────────────────────────────────────────────
// Each profession + assignment type produces a unique workspace configuration.

type WorkspacePreset = {
  title: string;
  sections: { id: string; title: string; priority: number }[];
  quickActions: { id: string; label: string; shortcut: string; action: string; requiresPatient: boolean }[];
  rightPanel: CareTeamRightPanelConfig;
};

const NURSE_WORKSPACES: Record<string, WorkspacePreset> = {
  ward_round: {
    title: 'Nursing Ward Round',
    sections: [
      { id: 'patient-list', title: 'Patients', priority: 1 },
      { id: 'observations-due', title: 'Observations Due', priority: 0 },
      { id: 'medications', title: 'Medications Due', priority: 2 },
      { id: 'alerts', title: 'Patient Alerts', priority: 3 },
    ],
    quickActions: [
      { id: 'vitals', label: 'Record Vitals', shortcut: 'Alt+V', action: 'record_vitals', requiresPatient: true },
      { id: 'med-admin', label: 'Administer Med', shortcut: 'Alt+M', action: 'administer_medication', requiresPatient: true },
      { id: 'glucose', label: 'Check Glucose', shortcut: 'Alt+G', action: 'check_glucose', requiresPatient: true },
      { id: 'dressing', label: 'Wound Dressing', shortcut: 'Alt+W', action: 'wound_dressing', requiresPatient: true },
      { id: 'escalate', label: 'Escalate to Doctor', shortcut: 'Alt+E', action: 'escalate_to_doctor', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
  triage: {
    title: 'Triage',
    sections: [
      { id: 'waiting', title: 'Waiting Patients', priority: 1 },
      { id: 'critical', title: 'Critical', priority: 0 },
      { id: 'resus', title: 'Resuscitation', priority: 0 },
    ],
    quickActions: [
      { id: 'esi-triage', label: 'ESI Triage', shortcut: 'Alt+T', action: 'esi_triage', requiresPatient: true },
      { id: 'vitals', label: 'Vitals', shortcut: 'Alt+V', action: 'record_vitals', requiresPatient: true },
      { id: 'ecg', label: 'ECG', shortcut: 'Alt+E', action: 'perform_ecg', requiresPatient: true },
      { id: 'escalate', label: 'Alert Doctor', shortcut: 'Alt+A', action: 'alert_doctor', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  medication_round: {
    title: 'Medication Round',
    sections: [
      { id: 'scheduled', title: 'Scheduled Medications', priority: 1 },
      { id: 'prn', title: 'PRN Requests', priority: 2 },
      { id: 'overdue', title: 'Overdue', priority: 0 },
      { id: 'controlled', title: 'Controlled Drugs', priority: 0 },
    ],
    quickActions: [
      { id: 'administer', label: 'Administer', shortcut: 'Alt+A', action: 'administer_medication', requiresPatient: true },
      { id: 'hold', label: 'Hold Medication', shortcut: 'Alt+H', action: 'hold_medication', requiresPatient: true },
      { id: 'prn-assess', label: 'PRN Assessment', shortcut: 'Alt+P', action: 'prn_assessment', requiresPatient: true },
      { id: 'cd-check', label: 'Controlled Drug Check', shortcut: 'Alt+C', action: 'controlled_drug_check', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  wound_care: {
    title: 'Wound Care Round',
    sections: [
      { id: 'scheduled', title: 'Scheduled Dressings', priority: 1 },
      { id: 'reassessment', title: 'Wound Reassessment', priority: 2 },
      { id: 'alerts', title: 'Infection Alerts', priority: 0 },
    ],
    quickActions: [
      { id: 'dressing', label: 'Change Dressing', shortcut: '', action: 'wound_dressing', requiresPatient: true },
      { id: 'assess', label: 'Wound Assessment', shortcut: '', action: 'wound_assessment', requiresPatient: true },
      { id: 'culture', label: 'Wound Swab', shortcut: '', action: 'wound_swab', requiresPatient: true },
      { id: 'photo', label: 'Take Photo', shortcut: '', action: 'wound_photo', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  icu: {
    title: 'ICU Nursing',
    sections: [
      { id: 'ventilated', title: 'Ventilated', priority: 1 },
      { id: 'weaning', title: 'Weaning', priority: 2 },
      { id: 'alerts', title: 'Alerts', priority: 0 },
      { id: 'charting', title: 'Charting Due', priority: 3 },
    ],
    quickActions: [
      { id: 'vitals', label: 'Full Vitals', shortcut: '', action: 'record_vitals', requiresPatient: true },
      { id: 'abg', label: 'ABG', shortcut: '', action: 'order_abg', requiresPatient: true },
      { id: 'vent', label: 'Vent Settings', shortcut: '', action: 'record_vent_settings', requiresPatient: true },
      { id: 'pressors', label: 'Pressor Check', shortcut: '', action: 'check_pressors', requiresPatient: true },
      { id: 'sedation', label: 'Sedation Score', shortcut: '', action: 'sedation_score', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
  clinic: {
    title: 'Nursing Clinic',
    sections: [
      { id: 'queue', title: 'Waiting Patients', priority: 1 },
      { id: 'current', title: 'Current Patient', priority: 0 },
    ],
    quickActions: [
      { id: 'vitals', label: 'Vitals', shortcut: 'Alt+V', action: 'record_vitals', requiresPatient: true },
      { id: 'vaccinate', label: 'Vaccinate', shortcut: 'Alt+I', action: 'administer_vaccine', requiresPatient: true },
      { id: 'health-ed', label: 'Health Education', shortcut: '', action: 'health_education', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  emergency: {
    title: 'Emergency Nursing',
    sections: [
      { id: 'resus', title: 'Resuscitation', priority: 0 },
      { id: 'critical', title: 'Critical', priority: 1 },
      { id: 'waiting', title: 'Waiting', priority: 3 },
      { id: 'observations', title: 'Observations Due', priority: 2 },
    ],
    quickActions: [
      { id: 'vitals', label: 'Vitals', shortcut: '', action: 'record_vitals', requiresPatient: true },
      { id: 'iv-access', label: 'IV Access', shortcut: '', action: 'establish_iv_access', requiresPatient: true },
      { id: 'ecg', label: 'ECG', shortcut: '', action: 'perform_ecg', requiresPatient: true },
      { id: 'bloods', label: 'Blood Draw', shortcut: '', action: 'draw_bloods', requiresPatient: true },
      { id: 'catheter', label: 'Catheterize', shortcut: '', action: 'catheterize', requiresPatient: true },
      { id: 'alert-doctor', label: 'Alert Doctor', shortcut: '', action: 'alert_doctor', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
};

const MIDWIFE_WORKSPACES: Record<string, WorkspacePreset> = {
  labour_ward: {
    title: 'Labour Ward',
    sections: [
      { id: 'active-labour', title: 'Active Labour', priority: 0 },
      { id: 'inductions', title: 'Inductions', priority: 1 },
      { id: 'triage', title: 'Triage', priority: 2 },
      { id: 'postnatal', title: 'Immediate Postnatal', priority: 3 },
    ],
    quickActions: [
      { id: 'ctg', label: 'Record CTG', shortcut: '', action: 'record_ctg', requiresPatient: true },
      { id: 've', label: 'Vaginal Exam', shortcut: '', action: 'vaginal_exam', requiresPatient: true },
      { id: 'partograph', label: 'Update Partograph', shortcut: '', action: 'update_partograph', requiresPatient: true },
      { id: 'med-admin', label: 'Administer Med', shortcut: '', action: 'administer_medication', requiresPatient: true },
      { id: 'alert-doctor', label: 'Alert Obstetrician', shortcut: '', action: 'alert_obstetrician', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
  antenatal_clinic: {
    title: 'Antenatal Clinic',
    sections: [
      { id: 'queue', title: 'Waiting Patients', priority: 1 },
      { id: 'current', title: 'Current Patient', priority: 0 },
      { id: 'high-risk', title: 'High Risk Follow-up', priority: 2 },
    ],
    quickActions: [
      { id: 'vitals', label: 'Vitals', shortcut: '', action: 'record_vitals', requiresPatient: true },
      { id: 'fundal', label: 'Fundal Height', shortcut: '', action: 'measure_fundal_height', requiresPatient: true },
      { id: 'doppler', label: 'Doppler', shortcut: '', action: 'doppler_heartbeat', requiresPatient: true },
      { id: 'vaccinate', label: 'Vaccinate', shortcut: '', action: 'administer_vaccine', requiresPatient: true },
      { id: 'lab', label: 'Order Labs', shortcut: '', action: 'order_antenatal_labs', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  postnatal_round: {
    title: 'Postnatal Round',
    sections: [
      { id: 'mothers', title: 'Mothers', priority: 1 },
      { id: 'newborns', title: 'Newborns', priority: 2 },
      { id: 'breastfeeding', title: 'Breastfeeding Support', priority: 3 },
      { id: 'alerts', title: 'Alerts', priority: 0 },
    ],
    quickActions: [
      { id: 'mother-review', label: 'Mother Review', shortcut: '', action: 'postnatal_mother_review', requiresPatient: true },
      { id: 'baby-review', label: 'Newborn Review', shortcut: '', action: 'newborn_review', requiresPatient: true },
      { id: 'bf-support', label: 'Breastfeeding Support', shortcut: '', action: 'breastfeeding_support', requiresPatient: true },
      { id: 'vaccinate', label: 'Baby Vaccination', shortcut: '', action: 'administer_vaccine', requiresPatient: true },
      { id: 'discharge-ed', label: 'Discharge Education', shortcut: '', action: 'postnatal_discharge_education', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
  home_visit: {
    title: 'Community Midwifery',
    sections: [
      { id: 'today-visits', title: "Today's Visits", priority: 1 },
      { id: 'pending', title: 'Pending Visits', priority: 2 },
      { id: 'follow-ups', title: 'Follow-ups Due', priority: 3 },
    ],
    quickActions: [
      { id: 'start-visit', label: 'Start Visit', shortcut: '', action: 'start_home_visit', requiresPatient: true },
      { id: 'assess', label: 'Maternal Assessment', shortcut: '', action: 'maternal_assessment', requiresPatient: true },
      { id: 'baby-check', label: 'Baby Check', shortcut: '', action: 'newborn_check', requiresPatient: true },
      { id: 'refer', label: 'Refer to Clinic', shortcut: '', action: 'refer_to_clinic', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
};

const PHARMACIST_WORKSPACES: Record<string, WorkspacePreset> = {
  clinical_review: {
    title: 'Clinical Pharmacy Review',
    sections: [
      { id: 'pending-review', title: 'Pending Reviews', priority: 1 },
      { id: 'interactions', title: 'Drug Interactions', priority: 0 },
      { id: 'therapeutic-review', title: 'Therapeutic Review', priority: 2 },
      { id: 'alerts', title: 'Clinical Alerts', priority: 0 },
    ],
    quickActions: [
      { id: 'verify', label: 'Verify Prescription', shortcut: 'Alt+V', action: 'verify_prescription', requiresPatient: true },
      { id: 'interaction', label: 'Check Interaction', shortcut: 'Alt+I', action: 'check_interaction', requiresPatient: true },
      { id: 'adjust-dose', label: 'Adjust Dose', shortcut: 'Alt+D', action: 'adjust_dose', requiresPatient: true },
      { id: 'counsel', label: 'Counsel Patient', shortcut: '', action: 'counsel_patient', requiresPatient: true },
      { id: 'therapeutic', label: 'Therapeutic Review', shortcut: '', action: 'therapeutic_drug_monitoring', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  dispensing: {
    title: 'Dispensing',
    sections: [
      { id: 'queue', title: 'Dispensing Queue', priority: 1 },
      { id: 'urgent', title: 'Urgent/Stat', priority: 0 },
      { id: 'controlled', title: 'Controlled Drugs', priority: 2 },
      { id: 'rechecks', title: 'Rechecks', priority: 3 },
    ],
    quickActions: [
      { id: 'dispense', label: 'Dispense', shortcut: 'Alt+D', action: 'dispense_medication', requiresPatient: true },
      { id: 'verify', label: 'Verify', shortcut: 'Alt+V', action: 'verify_prescription', requiresPatient: true },
      { id: 'counsel', label: 'Counsel', shortcut: 'Alt+C', action: 'counsel_patient', requiresPatient: true },
      { id: 'cd-log', label: 'Controlled Drug Log', shortcut: '', action: 'controlled_drug_log', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  reconciliation: {
    title: 'Medication Reconciliation',
    sections: [
      { id: 'admissions', title: 'New Admissions', priority: 1 },
      { id: 'transfers', title: 'Transfers', priority: 2 },
      { id: 'discharges', title: 'Discharges', priority: 3 },
    ],
    quickActions: [
      { id: 'reconcile', label: 'Reconcile', shortcut: '', action: 'reconcile_medications', requiresPatient: true },
      { id: 'discharge-rx', label: 'Discharge Rx', shortcut: '', action: 'prepare_discharge_prescription', requiresPatient: true },
      { id: 'interaction', label: 'Check Interactions', shortcut: '', action: 'check_interaction', requiresPatient: true },
      { id: 'counsel', label: 'Counsel', shortcut: '', action: 'counsel_patient', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  ward_round: {
    title: 'Pharmacy Ward Round',
    sections: [
      { id: 'patient-list', title: 'Ward Patients', priority: 1 },
      { id: 'reviews', title: 'Medication Reviews Due', priority: 0 },
      { id: 'interventions', title: 'My Interventions', priority: 2 },
    ],
    quickActions: [
      { id: 'review-chart', label: 'Review Chart', shortcut: 'Alt+R', action: 'review_medication_chart', requiresPatient: true },
      { id: 'intervention', label: 'Document Intervention', shortcut: 'Alt+I', action: 'document_pharmacy_intervention', requiresPatient: true },
      { id: 'verify', label: 'Verify Order', shortcut: 'Alt+V', action: 'verify_prescription', requiresPatient: true },
      { id: 'counsel', label: 'Patient Counseling', shortcut: '', action: 'counsel_patient', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
};

const LAB_WORKSPACES: Record<string, WorkspacePreset> = {
  specimen_processing: {
    title: 'Specimen Processing',
    sections: [
      { id: 'received', title: 'Received', priority: 1 },
      { id: 'processing', title: 'Processing', priority: 2 },
      { id: 'urgent', title: 'Urgent/Stat', priority: 0 },
      { id: 'rejected', title: 'Rejected/Issues', priority: 3 },
    ],
    quickActions: [
      { id: 'receive', label: 'Receive Specimen', shortcut: 'Alt+R', action: 'receive_specimen', requiresPatient: false },
      { id: 'process', label: 'Process', shortcut: 'Alt+P', action: 'process_specimen', requiresPatient: false },
      { id: 'reject', label: 'Reject Specimen', shortcut: 'Alt+J', action: 'reject_specimen', requiresPatient: false },
      { id: 'label', label: 'Print Label', shortcut: '', action: 'print_label', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  result_verification: {
    title: 'Result Verification',
    sections: [
      { id: 'pending', title: 'Pending Verification', priority: 1 },
      { id: 'critical', title: 'Critical Values', priority: 0 },
      { id: 'verified', title: 'Recently Verified', priority: 3 },
      { id: 'qaqc', title: 'QA/QC Alerts', priority: 0 },
    ],
    quickActions: [
      { id: 'verify', label: 'Verify Result', shortcut: 'Alt+V', action: 'verify_result', requiresPatient: false },
      { id: 'report-critical', label: 'Report Critical', shortcut: 'Alt+C', action: 'report_critical_value', requiresPatient: true },
      { id: 're-run', label: 'Re-run Test', shortcut: 'Alt+R', action: 'rerun_test', requiresPatient: false },
      { id: 'comment', label: 'Add Comment', shortcut: '', action: 'add_result_comment', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  quality_control: {
    title: 'Quality Control',
    sections: [
      { id: 'controls', title: 'QC Due', priority: 0 },
      { id: 'failures', title: 'QC Failures', priority: 0 },
      { id: 'logs', title: 'QC Logs', priority: 2 },
      { id: 'instruments', title: 'Instrument Status', priority: 1 },
    ],
    quickActions: [
      { id: 'run-qc', label: 'Run QC', shortcut: '', action: 'run_quality_control', requiresPatient: false },
      { id: 'document-failure', label: 'Document Failure', shortcut: '', action: 'document_qc_failure', requiresPatient: false },
      { id: 'calibrate', label: 'Calibrate', shortcut: '', action: 'calibrate_instrument', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: false, showGuidelines: true, showMessaging: true, showHandover: false },
  },
};

const RADIOGRAPHY_WORKSPACES: Record<string, WorkspacePreset> = {
  xray: {
    title: 'X-Ray',
    sections: [
      { id: 'scheduled', title: 'Scheduled', priority: 1 },
      { id: 'walk-in', title: 'Walk-in/Urgent', priority: 0 },
      { id: 'portable', title: 'Portable Requests', priority: 2 },
      { id: 'completed', title: 'Completed', priority: 3 },
    ],
    quickActions: [
      { id: 'start', label: 'Start Exam', shortcut: '', action: 'start_imaging', requiresPatient: true },
      { id: 'complete', label: 'Complete Exam', shortcut: '', action: 'complete_imaging', requiresPatient: false },
      { id: 'flag', label: 'Flag Abnormality', shortcut: '', action: 'flag_abnormal_finding', requiresPatient: false },
      { id: 'contrast', label: 'Request Contrast', shortcut: '', action: 'request_contrast', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  ct: {
    title: 'CT Scanning',
    sections: [
      { id: 'scheduled', title: 'Scheduled Scans', priority: 1 },
      { id: 'urgent', title: 'Urgent/Stat', priority: 0 },
      { id: 'contrast', title: 'Contrast Prep', priority: 2 },
      { id: 'reporting', title: 'To Report', priority: 3 },
    ],
    quickActions: [
      { id: 'start', label: 'Start Scan', shortcut: '', action: 'start_ct', requiresPatient: true },
      { id: 'contrast', label: 'Administer Contrast', shortcut: '', action: 'administer_contrast', requiresPatient: true },
      { id: 'complete', label: 'Complete Scan', shortcut: '', action: 'complete_ct', requiresPatient: false },
      { id: 'recon', label: 'Reconstruction', shortcut: '', action: 'run_reconstruction', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  mri: {
    title: 'MRI',
    sections: [
      { id: 'scheduled', title: 'Scheduled', priority: 1 },
      { id: 'safety', title: 'Safety Checklist', priority: 0 },
      { id: 'urgent', title: 'Urgent', priority: 2 },
    ],
    quickActions: [
      { id: 'safety-check', label: 'Safety Checklist', shortcut: '', action: 'mri_safety_checklist', requiresPatient: true },
      { id: 'start', label: 'Start Scan', shortcut: '', action: 'start_mri', requiresPatient: true },
      { id: 'complete', label: 'Complete Scan', shortcut: '', action: 'complete_mri', requiresPatient: false },
      { id: 'contrast', label: 'Contrast', shortcut: '', action: 'administer_contrast', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  ultrasound: {
    title: 'Ultrasound',
    sections: [
      { id: 'scheduled', title: 'Scheduled', priority: 1 },
      { id: 'urgent', title: 'Urgent', priority: 0 },
      { id: 'reporting', title: 'To Report', priority: 2 },
    ],
    quickActions: [
      { id: 'start', label: 'Start Scan', shortcut: '', action: 'start_ultrasound', requiresPatient: true },
      { id: 'complete', label: 'Complete Scan', shortcut: '', action: 'complete_ultrasound', requiresPatient: false },
      { id: 'flag', label: 'Flag Finding', shortcut: '', action: 'flag_abnormal_finding', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  imaging_reporting: {
    title: 'Imaging Reporting',
    sections: [
      { id: 'pending', title: 'Pending Reports', priority: 1 },
      { id: 'urgent', title: 'Urgent Reports', priority: 0 },
      { id: 'drafted', title: 'Drafts', priority: 2 },
      { id: 'completed', title: 'Completed', priority: 3 },
    ],
    quickActions: [
      { id: 'dictate', label: 'Dictate Report', shortcut: '', action: 'dictate_report', requiresPatient: false },
      { id: 'finalize', label: 'Finalize Report', shortcut: '', action: 'finalize_report', requiresPatient: false },
      { id: 'compare', label: 'Compare Prior', shortcut: '', action: 'compare_prior_imaging', requiresPatient: true },
      { id: 'flag-critical', label: 'Flag Critical', shortcut: '', action: 'flag_critical_finding', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
};

const PHYSIOTHERAPY_WORKSPACES: Record<string, WorkspacePreset> = {
  assessment: {
    title: 'Physiotherapy Assessment',
    sections: [
      { id: 'queue', title: 'Assessment Queue', priority: 1 },
      { id: 'current', title: 'Current Patient', priority: 0 },
      { id: 'referrals', title: 'New Referrals', priority: 2 },
    ],
    quickActions: [
      { id: 'assess', label: 'Functional Assessment', shortcut: '', action: 'functional_assessment', requiresPatient: true },
      { id: 'mobility', label: 'Mobility Assessment', shortcut: '', action: 'mobility_assessment', requiresPatient: true },
      { id: 'resp', label: 'Respiratory Assessment', shortcut: '', action: 'respiratory_assessment', requiresPatient: true },
      { id: 'document', label: 'Document Assessment', shortcut: '', action: 'document_assessment', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  treatment_session: {
    title: 'Physiotherapy Treatment',
    sections: [
      { id: 'today', title: "Today's Patients", priority: 1 },
      { id: 'exercises', title: 'Exercise Prescriptions', priority: 2 },
      { id: 'progress', title: 'Progress Notes', priority: 3 },
    ],
    quickActions: [
      { id: 'exercise-rx', label: 'Prescribe Exercise', shortcut: '', action: 'prescribe_exercise', requiresPatient: true },
      { id: 'manual-therapy', label: 'Manual Therapy', shortcut: '', action: 'manual_therapy', requiresPatient: true },
      { id: 'progress-note', label: 'Progress Note', shortcut: '', action: 'document_progress_note', requiresPatient: false },
      { id: 'electrotherapy', label: 'Electrotherapy', shortcut: '', action: 'electrotherapy', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  rehabilitation: {
    title: 'Rehabilitation',
    sections: [
      { id: 'inpatients', title: 'Inpatients', priority: 1 },
      { id: 'outpatients', title: 'Outpatients', priority: 2 },
      { id: 'goals', title: 'Goal Tracking', priority: 3 },
      { id: 'discharge', title: 'Discharge Planning', priority: 4 },
    ],
    quickActions: [
      { id: 'goal-set', label: 'Set Goal', shortcut: '', action: 'set_rehab_goal', requiresPatient: true },
      { id: 'progress', label: 'Review Progress', shortcut: '', action: 'review_progress', requiresPatient: true },
      { id: 'equipment', label: 'Order Equipment', shortcut: '', action: 'order_rehab_equipment', requiresPatient: true },
      { id: 'discharge', label: 'Discharge Physio', shortcut: '', action: 'discharge_physiotherapy', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
  home_visit: {
    title: 'Community Physiotherapy',
    sections: [
      { id: 'visits', title: "Today's Visits", priority: 1 },
      { id: 'pending', title: 'Pending Visits', priority: 2 },
      { id: 'follow-ups', title: 'Follow-ups Due', priority: 3 },
    ],
    quickActions: [
      { id: 'home-assess', label: 'Home Assessment', shortcut: '', action: 'home_assessment', requiresPatient: true },
      { id: 'modification', label: 'Recommend Modification', shortcut: '', action: 'recommend_modification', requiresPatient: true },
      { id: 'exercise', label: 'Prescribe Exercise', shortcut: '', action: 'prescribe_exercise', requiresPatient: true },
      { id: 'refer', label: 'Refer OT', shortcut: '', action: 'refer_occupational_therapy', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
};

const OT_WORKSPACES: Record<string, WorkspacePreset> = {
  assessment: {
    title: 'Occupational Therapy Assessment',
    sections: [
      { id: 'queue', title: 'Assessment Queue', priority: 1 },
      { id: 'referrals', title: 'New Referrals', priority: 2 },
      { id: 'current', title: 'Current Patient', priority: 0 },
    ],
    quickActions: [
      { id: 'functional', label: 'Functional Assessment', shortcut: '', action: 'functional_assessment', requiresPatient: true },
      { id: 'adl', label: 'ADL Assessment', shortcut: '', action: 'adl_assessment', requiresPatient: true },
      { id: 'cognitive', label: 'Cognitive Assessment', shortcut: '', action: 'cognitive_assessment', requiresPatient: true },
      { id: 'home-assess', label: 'Home Assessment', shortcut: '', action: 'home_assessment_ot', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  treatment_session: {
    title: 'OT Treatment',
    sections: [
      { id: 'today', title: "Today's Patients", priority: 1 },
      { id: 'activities', title: 'Activities', priority: 2 },
      { id: 'adaptive', title: 'Adaptive Equipment', priority: 3 },
    ],
    quickActions: [
      { id: 'activity-rx', label: 'Prescribe Activity', shortcut: '', action: 'prescribe_activity', requiresPatient: true },
      { id: 'equipment', label: 'Recommend Equipment', shortcut: '', action: 'recommend_adaptive_equipment', requiresPatient: true },
      { id: 'progress', label: 'Progress Note', shortcut: '', action: 'document_progress_note', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  home_visit: {
    title: 'OT Home Visit',
    sections: [
      { id: 'visits', title: "Today's Visits", priority: 1 },
      { id: 'modifications', title: 'Modifications Pending', priority: 2 },
    ],
    quickActions: [
      { id: 'home-safety', label: 'Home Safety Assessment', shortcut: '', action: 'home_safety_assessment', requiresPatient: true },
      { id: 'modification', label: 'Recommend Modification', shortcut: '', action: 'recommend_home_modification', requiresPatient: true },
      { id: 'equipment', label: 'Prescribe Equipment', shortcut: '', action: 'prescribe_adaptive_equipment', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
};

const NUTRITION_WORKSPACES: Record<string, WorkspacePreset> = {
  assessment: {
    title: 'Nutrition Assessment',
    sections: [
      { id: 'queue', title: 'Assessment Queue', priority: 1 },
      { id: 'current', title: 'Current Patient', priority: 0 },
      { id: 'referrals', title: 'New Referrals', priority: 2 },
    ],
    quickActions: [
      { id: 'assess', label: 'Nutritional Assessment', shortcut: '', action: 'nutritional_assessment', requiresPatient: true },
      { id: 'screen', label: 'Malnutrition Screen', shortcut: '', action: 'malnutrition_screen', requiresPatient: true },
      { id: 'plan', label: 'Create Meal Plan', shortcut: '', action: 'create_meal_plan', requiresPatient: true },
      { id: 'supplements', label: 'Order Supplements', shortcut: '', action: 'order_nutritional_supplements', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  follow_up: {
    title: 'Nutrition Follow-up',
    sections: [
      { id: 'today', title: "Today's Follow-ups", priority: 1 },
      { id: 'overdue', title: 'Overdue Reviews', priority: 2 },
      { id: 'monitoring', title: 'Monitoring Parameters', priority: 3 },
    ],
    quickActions: [
      { id: 'review', label: 'Review Progress', shortcut: '', action: 'review_nutrition_progress', requiresPatient: true },
      { id: 'adjust-plan', label: 'Adjust Meal Plan', shortcut: '', action: 'adjust_meal_plan', requiresPatient: true },
      { id: 'weight', label: 'Record Weight', shortcut: '', action: 'record_weight', requiresPatient: true },
      { id: 'document', label: 'Document Note', shortcut: '', action: 'document_nutrition_note', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  group_session: {
    title: 'Group Nutrition Session',
    sections: [
      { id: 'session', title: 'Current Session', priority: 0 },
      { id: 'participants', title: 'Participants', priority: 1 },
      { id: 'materials', title: 'Education Materials', priority: 2 },
    ],
    quickActions: [
      { id: 'register', label: 'Register Attendance', shortcut: '', action: 'register_attendance', requiresPatient: false },
      { id: 'teach', label: 'Start Education', shortcut: '', action: 'start_education_session', requiresPatient: false },
      { id: 'handout', label: 'Distribute Material', shortcut: '', action: 'distribute_material', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: false, showGuidelines: true, showMessaging: false, showHandover: false },
  },
};

const SOCIAL_WORK_WORKSPACES: Record<string, WorkspacePreset> = {
  assessment: {
    title: 'Social Work Assessment',
    sections: [
      { id: 'queue', title: 'Assessment Queue', priority: 1 },
      { id: 'current', title: 'Current Patient', priority: 0 },
      { id: 'referrals', title: 'Referrals', priority: 2 },
    ],
    quickActions: [
      { id: 'assess', label: 'Psychosocial Assessment', shortcut: '', action: 'psychosocial_assessment', requiresPatient: true },
      { id: 'financial', label: 'Financial Assessment', shortcut: '', action: 'financial_assessment', requiresPatient: true },
      { id: 'support', label: 'Arrange Support', shortcut: '', action: 'arrange_support_services', requiresPatient: true },
      { id: 'document', label: 'Document Assessment', shortcut: '', action: 'document_assessment', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  discharge_planning: {
    title: 'Discharge Planning',
    sections: [
      { id: 'pending', title: 'Pending Discharges', priority: 1 },
      { id: 'home-care', title: 'Home Care Setup', priority: 2 },
      { id: 'follow-ups', title: 'Community Follow-ups', priority: 3 },
      { id: 'delays', title: 'Delays/Barriers', priority: 0 },
    ],
    quickActions: [
      { id: 'plan', label: 'Create Discharge Plan', shortcut: '', action: 'create_discharge_plan', requiresPatient: true },
      { id: 'home-care', label: 'Arrange Home Care', shortcut: '', action: 'arrange_home_care', requiresPatient: true },
      { id: 'refer-community', label: 'Refer Community', shortcut: '', action: 'refer_community_services', requiresPatient: true },
      { id: 'document', label: 'Document Plan', shortcut: '', action: 'document_discharge_plan', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
  counselling: {
    title: 'Social Work Counselling',
    sections: [
      { id: 'today', title: "Today's Sessions", priority: 1 },
      { id: 'follow-ups', title: 'Follow-ups Due', priority: 2 },
      { id: 'crisis', title: 'Crisis/Urgent', priority: 0 },
    ],
    quickActions: [
      { id: 'start-session', label: 'Start Session', shortcut: '', action: 'start_counselling_session', requiresPatient: true },
      { id: 'document', label: 'Document Session', shortcut: '', action: 'document_session_note', requiresPatient: false },
      { id: 'refer', label: 'Refer Psychology', shortcut: '', action: 'refer_psychology', requiresPatient: true },
      { id: 'crisis', label: 'Crisis Intervention', shortcut: '', action: 'crisis_intervention', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: false },
  },
  home_visit: {
    title: 'Social Work Home Visit',
    sections: [
      { id: 'visits', title: "Today's Visits", priority: 1 },
      { id: 'pending', title: 'Pending Visits', priority: 2 },
    ],
    quickActions: [
      { id: 'assess', label: 'Home Assessment', shortcut: '', action: 'home_assessment_sw', requiresPatient: true },
      { id: 'safety', label: 'Safety Assessment', shortcut: '', action: 'home_safety_assessment', requiresPatient: true },
      { id: 'refer', label: 'Refer Services', shortcut: '', action: 'refer_community_services', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
};

const PSYCHOLOGY_WORKSPACES: Record<string, WorkspacePreset> = {
  assessment: {
    title: 'Psychological Assessment',
    sections: [
      { id: 'queue', title: 'Assessment Queue', priority: 1 },
      { id: 'current', title: 'Current Patient', priority: 0 },
      { id: 'referrals', title: 'Referrals Pending', priority: 2 },
    ],
    quickActions: [
      { id: 'risk', label: 'Risk Assessment', shortcut: '', action: 'risk_assessment', requiresPatient: true },
      { id: 'mental-state', label: 'Mental State Exam', shortcut: '', action: 'mental_state_exam', requiresPatient: true },
      { id: 'cognitive', label: 'Cognitive Assessment', shortcut: '', action: 'cognitive_assessment', requiresPatient: true },
      { id: 'document', label: 'Document Assessment', shortcut: '', action: 'document_assessment', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  therapy_session: {
    title: 'Therapy Session',
    sections: [
      { id: 'today', title: "Today's Sessions", priority: 1 },
      { id: 'current', title: 'Current Session', priority: 0 },
      { id: 'follow-ups', title: 'Follow-ups', priority: 2 },
    ],
    quickActions: [
      { id: 'start-session', label: 'Start Session', shortcut: '', action: 'start_therapy_session', requiresPatient: true },
      { id: 'cbt', label: 'CBT Tool', shortcut: '', action: 'cbt_tool', requiresPatient: true },
      { id: 'document', label: 'Document Session', shortcut: '', action: 'document_session_note', requiresPatient: false },
      { id: 'safety-plan', label: 'Safety Plan', shortcut: '', action: 'create_safety_plan', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: false, showHandover: true },
  },
  review: {
    title: 'Psychology Review',
    sections: [
      { id: 'reviews', title: 'Reviews Due', priority: 1 },
      { id: 'progress', title: 'Progress Tracking', priority: 2 },
      { id: 'reports', title: 'Reports Required', priority: 3 },
    ],
    quickActions: [
      { id: 'review', label: 'Review Progress', shortcut: '', action: 'review_progress', requiresPatient: true },
      { id: 'report', label: 'Write Report', shortcut: '', action: 'write_psychology_report', requiresPatient: true },
      { id: 'refer', label: 'Refer Psychiatrist', shortcut: '', action: 'refer_psychiatrist', requiresPatient: true },
      { id: 'document', label: 'Document Note', shortcut: '', action: 'document_progress_note', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
};

const CLINICAL_OFFICER_WORKSPACES: Record<string, WorkspacePreset> = {
  clinic: {
    title: 'Clinical Officer Clinic',
    sections: [
      { id: 'queue', title: 'Patient Queue', priority: 1 },
      { id: 'current', title: 'Current Patient', priority: 0 },
      { id: 'referrals', title: 'Referrals', priority: 2 },
    ],
    quickActions: [
      { id: 'consult', label: 'Consultation', shortcut: '', action: 'start_consultation', requiresPatient: true },
      { id: 'prescribe', label: 'Prescribe', shortcut: '', action: 'prescribe', requiresPatient: true },
      { id: 'lab', label: 'Order Lab', shortcut: '', action: 'order_lab', requiresPatient: true },
      { id: 'refer', label: 'Refer to Doctor', shortcut: '', action: 'refer_to_doctor', requiresPatient: true },
      { id: 'procedure', label: 'Minor Procedure', shortcut: '', action: 'minor_procedure', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  emergency: {
    title: 'Emergency CO',
    sections: [
      { id: 'resus', title: 'Resuscitation', priority: 0 },
      { id: 'critical', title: 'Critical', priority: 1 },
      { id: 'waiting', title: 'Waiting', priority: 3 },
    ],
    quickActions: [
      { id: 'triage', label: 'Triage', shortcut: '', action: 'triage', requiresPatient: true },
      { id: 'resuscitate', label: 'Resuscitate', shortcut: '', action: 'resuscitate', requiresPatient: true },
      { id: 'suture', label: 'Suture', shortcut: '', action: 'suture_wound', requiresPatient: true },
      { id: 'refer', label: 'Refer Doctor', shortcut: '', action: 'refer_to_doctor', requiresPatient: true },
      { id: 'lab', label: 'Stat Labs', shortcut: '', action: 'order_stat_lab', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
  ward_round: {
    title: 'Clinical Officer Ward Round',
    sections: [
      { id: 'patient-list', title: 'Patients', priority: 1 },
      { id: 'reviews', title: 'Daily Reviews', priority: 0 },
      { id: 'tasks', title: 'Pending Tasks', priority: 2 },
    ],
    quickActions: [
      { id: 'review', label: 'Review Patient', shortcut: '', action: 'review_patient', requiresPatient: true },
      { id: 'prescribe', label: 'Prescribe', shortcut: '', action: 'prescribe', requiresPatient: true },
      { id: 'lab', label: 'Order Lab', shortcut: '', action: 'order_lab', requiresPatient: true },
      { id: 'document', label: 'Document Note', shortcut: '', action: 'document_note', requiresPatient: false },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
};

const CHW_WORKSPACES: Record<string, WorkspacePreset> = {
  home_visit: {
    title: 'Community Health Visit',
    sections: [
      { id: 'visits', title: "Today's Visits", priority: 1 },
      { id: 'pending', title: 'Pending Visits', priority: 2 },
      { id: 'referrals', title: 'Referrals to Follow', priority: 3 },
    ],
    quickActions: [
      { id: 'start-visit', label: 'Start Visit', shortcut: '', action: 'start_home_visit', requiresPatient: true },
      { id: 'screen', label: 'Screen Patient', shortcut: '', action: 'screen_patient', requiresPatient: true },
      { id: 'health-ed', label: 'Health Education', shortcut: '', action: 'health_education', requiresPatient: true },
      { id: 'refer', label: 'Refer to Clinic', shortcut: '', action: 'refer_to_clinic', requiresPatient: true },
      { id: 'document', label: 'Document Visit', shortcut: '', action: 'document_visit', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: true },
  },
  community_screening: {
    title: 'Community Screening',
    sections: [
      { id: 'site', title: 'Current Site', priority: 0 },
      { id: 'queue', title: 'Screening Queue', priority: 1 },
      { id: 'positives', title: 'Positive Screens', priority: 2 },
      { id: 'referrals', title: 'Referrals Made', priority: 3 },
    ],
    quickActions: [
      { id: 'screen-bp', label: 'BP Screening', shortcut: '', action: 'bp_screening', requiresPatient: true },
      { id: 'screen-glucose', label: 'Glucose Check', shortcut: '', action: 'glucose_check', requiresPatient: true },
      { id: 'screen-hiv', label: 'HIV Test', shortcut: '', action: 'hiv_test', requiresPatient: true },
      { id: 'screen-malaria', label: 'Malaria RDT', shortcut: '', action: 'malaria_rdt', requiresPatient: true },
      { id: 'refer', label: 'Refer Positive', shortcut: '', action: 'refer_positive_screen', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  health_education: {
    title: 'Health Education',
    sections: [
      { id: 'sessions', title: 'Scheduled Sessions', priority: 1 },
      { id: 'materials', title: 'Education Materials', priority: 2 },
      { id: 'attendance', title: 'Attendance Log', priority: 3 },
    ],
    quickActions: [
      { id: 'start-session', label: 'Start Session', shortcut: '', action: 'start_education_session', requiresPatient: false },
      { id: 'register', label: 'Register Attendance', shortcut: '', action: 'register_attendance', requiresPatient: false },
      { id: 'distribute', label: 'Distribute Materials', shortcut: '', action: 'distribute_material', requiresPatient: false },
    ],
    rightPanel: { showAI: false, showOrders: false, showPatientInfo: false, showGuidelines: true, showMessaging: false, showHandover: false },
  },
};

const DENTIST_WORKSPACES: Record<string, WorkspacePreset> = {
  clinic: {
    title: 'Dental Clinic',
    sections: [
      { id: 'queue', title: 'Patient Queue', priority: 1 },
      { id: 'current', title: 'Current Patient', priority: 0 },
      { id: 'emergency', title: 'Dental Emergency', priority: 0 },
    ],
    quickActions: [
      { id: 'exam', label: 'Dental Exam', shortcut: '', action: 'dental_exam', requiresPatient: true },
      { id: 'xray', label: 'Dental X-Ray', shortcut: '', action: 'order_dental_xray', requiresPatient: true },
      { id: 'extraction', label: 'Extraction', shortcut: '', action: 'extraction', requiresPatient: true },
      { id: 'filling', label: 'Filling', shortcut: '', action: 'filling', requiresPatient: true },
      { id: 'prescribe', label: 'Prescribe', shortcut: '', action: 'prescribe', requiresPatient: true },
      { id: 'refer', label: 'Refer Oral Surgery', shortcut: '', action: 'refer_oral_surgery', requiresPatient: true },
    ],
    rightPanel: { showAI: true, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
  theatre: {
    title: 'Dental Theatre',
    sections: [
      { id: 'list', title: 'Surgical List', priority: 1 },
      { id: 'current', title: 'Current Case', priority: 0 },
      { id: 'recovery', title: 'Recovery', priority: 2 },
    ],
    quickActions: [
      { id: 'checklist', label: 'Surgical Checklist', shortcut: '', action: 'open_checklist', requiresPatient: true },
      { id: 'note', label: 'Operation Note', shortcut: '', action: 'write_op_note', requiresPatient: true },
    ],
    rightPanel: { showAI: false, showOrders: true, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
  },
};

const DEFAULT_WORKSPACE: WorkspacePreset = {
  title: 'Clinical Workspace',
  sections: [
    { id: 'tasks', title: 'Tasks', priority: 1 },
    { id: 'patients', title: 'Patients', priority: 2 },
  ],
  quickActions: [
    { id: 'search', label: 'Search Patient', shortcut: 'Ctrl+K', action: 'search', requiresPatient: false },
  ],
  rightPanel: { showAI: true, showOrders: false, showPatientInfo: true, showGuidelines: true, showMessaging: true, showHandover: false },
};

// ── Profession workspace registry ─────────────────────────────────────────────

const PROFESSION_WORKSPACES: Record<CareTeamProfession, Record<string, WorkspacePreset>> = {
  nurse: NURSE_WORKSPACES,
  midwife: MIDWIFE_WORKSPACES,
  pharmacist: PHARMACIST_WORKSPACES,
  lab_technologist: LAB_WORKSPACES,
  radiographer: RADIOGRAPHY_WORKSPACES,
  physiotherapist: PHYSIOTHERAPY_WORKSPACES,
  occupational_therapist: OT_WORKSPACES,
  nutritionist: NUTRITION_WORKSPACES,
  social_worker: SOCIAL_WORK_WORKSPACES,
  psychologist: PSYCHOLOGY_WORKSPACES,
  dentist: DENTIST_WORKSPACES,
  clinical_officer: CLINICAL_OFFICER_WORKSPACES,
  community_health_worker: CHW_WORKSPACES,
};

// ── Profession display names ──────────────────────────────────────────────────

const PROFESSION_LABELS: Record<CareTeamProfession, string> = {
  nurse: 'Nurse',
  midwife: 'Midwife',
  pharmacist: 'Pharmacist',
  lab_technologist: 'Lab Technologist',
  radiographer: 'Radiographer',
  physiotherapist: 'Physiotherapist',
  occupational_therapist: 'Occupational Therapist',
  nutritionist: 'Nutritionist',
  social_worker: 'Social Worker',
  psychologist: 'Psychologist',
  dentist: 'Dentist',
  clinical_officer: 'Clinical Officer',
  community_health_worker: 'Community Health Worker',
};

// ── Build Care Team Context ───────────────────────────────────────────────────
// The primary entry point. Generates the full operational context from
// the clinician's identity, profession, assignment, and current workload.

export function buildCareTeamContext(params: {
  clinicianId: AmxUid;
  clinicianName: string;
  profession: CareTeamProfession;
  organizationId: string;
  organizationName: string;
  departmentId?: string;
  departmentName?: string;
  unitId?: string;
  unitName?: string;
  shift: CareTeamShift;
  assignment: CareTeamAssignment;
  currentLocation: CareTeamLocation;
  activePatients: ActivePatient[];
  patientQueue: QueueItem[];
  pendingTasks: ClinicalTask[];
  notifications: CareTeamNotification[];
  workflows?: WorkflowInstance[];
}): CareTeamContext {
  const workspace = generateCareTeamWorkspace(
    params.profession,
    params.assignment.type,
    params.currentLocation,
  );

  const allNotifications = [...params.notifications];

  const escalatedTasks = params.pendingTasks.filter(t => t.status === 'escalated');
  if (escalatedTasks.length > 0) {
    allNotifications.push({
      id: uid('ct-notif'),
      profession: params.profession,
      type: 'escalation',
      title: `Escalated Tasks`,
      message: `${escalatedTasks.length} task(s) have been escalated`,
      priority: 'critical',
      timestamp: Date.now(),
      read: false,
      actionable: true,
      actionLabel: 'View Escalated Tasks',
      actionLink: '/tasks/escalated',
    });
  }

  const overdueTasks = params.pendingTasks.filter(t => t.status === 'overdue');
  if (overdueTasks.length > 0) {
    allNotifications.push({
      id: uid('ct-notif'),
      profession: params.profession,
      type: 'reminder',
      title: `Overdue Tasks`,
      message: `${overdueTasks.length} task(s) are overdue`,
      priority: 'urgent',
      timestamp: Date.now(),
      read: false,
      actionable: true,
      actionLabel: 'View Overdue Tasks',
      actionLink: '/tasks/overdue',
    });
  }

  return {
    clinicianId: params.clinicianId,
    clinicianName: params.clinicianName,
    profession: params.profession,
    organizationId: params.organizationId,
    organizationName: params.organizationName,
    departmentId: params.departmentId,
    departmentName: params.departmentName,
    unitId: params.unitId,
    unitName: params.unitName,
    shift: params.shift,
    assignment: params.assignment,
    currentLocation: params.currentLocation,
    activePatients: params.activePatients,
    patientQueue: params.patientQueue,
    pendingTasks: params.pendingTasks,
    notifications: allNotifications,
    workspace,
    aiAssistant: { enabled: true, suggestions: [], pendingActions: [] },
    loadedAt: Date.now(),
  };
}

// ── Workspace Generator ───────────────────────────────────────────────────────
// Generates the workspace based on profession + assignment type + location.

export function generateCareTeamWorkspace(
  profession: CareTeamProfession,
  assignmentType: CareTeamAssignmentType,
  location: CareTeamLocation,
): CareTeamWorkspace {
  const professionWorkspaces = PROFESSION_WORKSPACES[profession];
  const preset = professionWorkspaces?.[assignmentType] ?? DEFAULT_WORKSPACE;

  const locationSuffix = location.ward
    ? ` — ${location.ward}`
    : location.clinic
      ? ` — ${location.clinic}`
      : location.departmentName
        ? ` — ${location.departmentName}`
        : '';

  return {
    type: assignmentType,
    profession,
    title: `${preset.title}${locationSuffix}`,
    sections: preset.sections.map(s => ({ ...s, items: [] })),
    quickActions: preset.quickActions.map(q => ({ ...q })),
    rightPanel: { ...preset.rightPanel },
  };
}

// ── Available workspaces for a profession ─────────────────────────────────────
// Returns all workspace configurations available for the given profession.

export function getAvailableWorkspaces(profession: CareTeamProfession): {
  type: CareTeamAssignmentType;
  title: string;
}[] {
  const workspaces = PROFESSION_WORKSPACES[profession];
  if (!workspaces) return [];
  return Object.entries(workspaces).map(([type, preset]) => ({
    type: type as CareTeamAssignmentType,
    title: preset.title,
  }));
}

// ── Get profession label ──────────────────────────────────────────────────────

export function getProfessionLabel(profession: CareTeamProfession): string {
  return PROFESSION_LABELS[profession] ?? profession;
}

// ── Notification Triage ──────────────────────────────────────────────────────

export function triageCareTeamNotifications(notifications: CareTeamNotification[]): {
  critical: CareTeamNotification[];
  urgent: CareTeamNotification[];
  routine: CareTeamNotification[];
} {
  return {
    critical: notifications.filter(n => n.priority === 'critical' && !n.read),
    urgent: notifications.filter(n => n.priority === 'urgent' && !n.read),
    routine: notifications.filter(n => n.priority === 'routine' || n.read),
  };
}

// ── Handover ──────────────────────────────────────────────────────────────────

export function createCareTeamHandover(params: {
  fromClinicianId: string;
  fromClinicianName: string;
  profession: CareTeamProfession;
  toClinicianId: string;
  toClinicianName: string;
  shift: string;
  patients: Omit<HandoverPatient, 'status'>[];
  summary: string;
}): CareTeamHandoverNote {
  return {
    id: uid('ct-ho'),
    fromClinicianId: params.fromClinicianId,
    fromClinicianName: params.fromClinicianName,
    profession: params.profession,
    toClinicianId: params.toClinicianId,
    toClinicianName: params.toClinicianName,
    shift: params.shift,
    patients: params.patients.map(p => ({
      ...p,
      status: 'stable' as const,
    })),
    summary: params.summary,
    createdAt: Date.now(),
  };
}

export function acknowledgeCareTeamHandover(handover: CareTeamHandoverNote): CareTeamHandoverNote {
  return { ...handover, acknowledgedAt: Date.now() };
}

// ── End-of-Shift Summary ──────────────────────────────────────────────────────

export function generateCareTeamEndOfShiftSummary(
  activePatients: ActivePatient[],
  pendingTasks: ClinicalTask[],
  profession: CareTeamProfession,
): {
  outstandingPatients: number;
  outstandingTasks: number;
  pendingDocumentation: number;
  pendingEscalations: number;
  handoverRequired: boolean;
  profession: CareTeamProfession;
} {
  return {
    outstandingPatients: activePatients.filter(p => p.status !== 'stable').length,
    outstandingTasks: pendingTasks.filter(t => t.status !== 'completed').length,
    pendingDocumentation: pendingTasks.filter(t => t.type === 'documentation' && t.status !== 'completed').length,
    pendingEscalations: pendingTasks.filter(t => t.status === 'escalated').length,
    handoverRequired: activePatients.length > 0 || pendingTasks.length > 0,
    profession,
  };
}

// ── Care Team ADOS Questions ──────────────────────────────────────────────────

export function answerCareTeamADOSQuestions(context: CareTeamContext): {
  whereAmI: string;
  myPatients: string[];
  whoNeedsMeFirst: string;
  tasksWaiting: string[];
  whatHappensNext: string[];
  safeHandover: boolean;
} {
  const priorityPatient = context.patientQueue
    .filter(q => q.status === 'waiting')
    .sort((a, b) => a.priority - b.priority)[0];

  const professionLabel = PROFESSION_LABELS[context.profession] ?? context.profession;

  return {
    whereAmI: `${context.departmentName ?? 'Unknown'}, ${context.assignment.type} — ${context.assignment.location} (${professionLabel})`,
    myPatients: context.activePatients.map(p => `${p.name} (${p.bed ?? 'No bed'})`),
    whoNeedsMeFirst: priorityPatient
      ? `${priorityPatient.patientName} (Priority ${priorityPatient.priority})`
      : 'No waiting patients',
    tasksWaiting: context.pendingTasks
      .filter(t => t.status === 'pending')
      .map(t => t.title),
    whatHappensNext: [
      ...context.workspace.sections.map(s => s.title),
      ...context.workspace.quickActions.slice(0, 3).map(a => a.label),
    ],
    safeHandover: context.pendingTasks.filter(t => t.status !== 'completed').length === 0,
  };
}

// ── AI Assistant Helpers ──────────────────────────────────────────────────────

export function updateCareTeamAISuggestions(
  ai: CareTeamContext['aiAssistant'],
  suggestions: string[],
): CareTeamContext['aiAssistant'] {
  if (!ai) return { enabled: true, suggestions, pendingActions: [] };
  return { ...ai, suggestions };
}

export function addCareTeamAIAction(
  ai: CareTeamContext['aiAssistant'],
  action: string,
): CareTeamContext['aiAssistant'] {
  if (!ai) return { enabled: true, suggestions: [], pendingActions: [action] };
  return {
    ...ai,
    pendingActions: [...ai.pendingActions, action],
  };
}

export function clearCareTeamAIActions(
  ai: CareTeamContext['aiAssistant'],
): CareTeamContext['aiAssistant'] {
  if (!ai) return { enabled: true, suggestions: [], pendingActions: [] };
  return { ...ai, pendingActions: [] };
}
