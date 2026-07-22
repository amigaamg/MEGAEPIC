// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Clinical Constitution — Doctor Specialist Operational Engine (Part II)
// Book III Volume II: Every doctor sees a workspace tailored to their specialty
// ═══════════════════════════════════════════════════════════════════════════════

import type { MedicalSpecialty } from '../constitution/types';
import type {
  DoctorContext, DoctorWorkspace, DoctorQuickAction,
  WorkspaceSection, RightPanelConfig,
  DoctorAssignment, DoctorLocation,
  AssignmentType,
} from './types';

// ── Specialty Workspace Overrides ─────────────────────────────────────────────
// Each specialty can override the base workspace for specific assignment types.
// Sections, quickActions, and rightPanel are merged with the base workspace.

export interface SpecialtyWorkspaceOverride {
  sections?: { id: string; title: string; priority: number }[];
  quickActions?: { id: string; label: string; shortcut: string; action: string; requiresPatient: boolean }[];
  rightPanel?: Partial<RightPanelConfig>;
}

export type SpecialtyWorkspaceMap = Partial<Record<AssignmentType, SpecialtyWorkspaceOverride>>;

// ── Specialty Workflow Templates ──────────────────────────────────────────────
// Common clinical workflows specific to each specialty.

export interface SpecialtyWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  defaultPriority: 1 | 2 | 3 | 4 | 5;
  suggestedTasks: { title: string; type: string; order: number }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKSPACE OVERRIDES BY SPECIALTY
// ═══════════════════════════════════════════════════════════════════════════════

const SURGERY_WORKSPACES: SpecialtyWorkspaceMap = {
  ward_round: {
    sections: [
      { id: 'pre-op', title: 'Pre-Operative', priority: 1 },
      { id: 'post-op', title: 'Post-Operative', priority: 2 },
      { id: 'complications', title: 'Complications/Alerts', priority: 0 },
      { id: 'discharge-planning', title: 'Discharge Planning', priority: 3 },
    ],
    quickActions: [
      { id: 'wound-check', label: 'Wound Check', shortcut: 'Alt+W', action: 'wound_check', requiresPatient: true },
      { id: 'drain', label: 'Drain Review', shortcut: 'Alt+D', action: 'drain_review', requiresPatient: true },
      { id: 'op-note', label: 'Op Note Review', shortcut: 'Alt+O', action: 'review_op_note', requiresPatient: true },
      { id: 'imaging', label: 'Review Imaging', shortcut: 'Alt+I', action: 'review_imaging', requiresPatient: true },
      { id: 'pathology', label: 'Pathology Results', shortcut: 'Alt+P', action: 'review_pathology', requiresPatient: true },
    ],
    rightPanel: { showOrders: true, showCalculators: false },
  },
  clinic: {
    quickActions: [
      { id: 'exam', label: 'Surgical Exam', shortcut: 'Alt+E', action: 'surgical_exam', requiresPatient: true },
      { id: 'imaging', label: 'Order Imaging', shortcut: 'Alt+I', action: 'order_imaging', requiresPatient: true },
      { id: 'list', label: 'Add to Surgical List', shortcut: 'Alt+L', action: 'add_to_surgical_list', requiresPatient: true },
      { id: 'pre-op', label: 'Pre-Op Assessment', shortcut: 'Alt+P', action: 'pre_op_assessment', requiresPatient: true },
      { id: 'refer', label: 'Refer to Specialty', shortcut: 'Alt+R', action: 'refer_surgical', requiresPatient: true },
    ],
  },
  theatre: {
    sections: [
      { id: 'list', title: 'Operating List', priority: 1 },
      { id: 'current', title: 'Current Case', priority: 0 },
      { id: 'next', title: 'Next Case Prep', priority: 2 },
      { id: 'recovery', title: 'Recovery Patients', priority: 3 },
    ],
    quickActions: [
      { id: 'timeout', label: 'Surgical Timeout', shortcut: 'Alt+T', action: 'surgical_timeout', requiresPatient: true },
      { id: 'incision', label: 'Incision Time', shortcut: '', action: 'record_incision', requiresPatient: true },
      { id: 'op-note', label: 'Operation Note', shortcut: 'Alt+O', action: 'write_op_note', requiresPatient: true },
      { id: 'specimen', label: 'Specimen Label', shortcut: '', action: 'label_specimen', requiresPatient: true },
      { id: 'post-op', label: 'Post-Op Orders', shortcut: 'Alt+P', action: 'post_op_orders', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
};

const OBSTETRICS_WORKSPACES: SpecialtyWorkspaceMap = {
  ward_round: {
    sections: [
      { id: 'high-risk', title: 'High Risk Pregnancies', priority: 0 },
      { id: 'labour-ward', title: 'Labour Ward', priority: 1 },
      { id: 'postnatal', title: 'Postnatal', priority: 2 },
      { id: 'gynae', title: 'Gynaecology', priority: 3 },
    ],
    quickActions: [
      { id: 'ctg', label: 'Review CTG', shortcut: 'Alt+C', action: 'review_ctg', requiresPatient: true },
      { id: 've', label: 'Vaginal Exam', shortcut: 'Alt+V', action: 'vaginal_exam', requiresPatient: true },
      { id: 'scan', label: 'Bedside US', shortcut: 'Alt+U', action: 'bedside_ultrasound', requiresPatient: true },
      { id: 'c-section', label: 'C-Section Decision', shortcut: 'Alt+S', action: 'c_section_decision', requiresPatient: true },
      { id: 'induction', label: 'Induction Assessment', shortcut: 'Alt+I', action: 'induction_assessment', requiresPatient: true },
    ],
  },
  clinic: {
    quickActions: [
      { id: 'booking', label: 'Booking Visit', shortcut: '', action: 'booking_visit', requiresPatient: true },
      { id: 'scan', label: 'Obstetric US', shortcut: '', action: 'order_obstetric_us', requiresPatient: true },
      { id: 'high-risk', label: 'High Risk Referral', shortcut: '', action: 'refer_high_risk', requiresPatient: true },
      { id: 'lab', label: 'Antenatal Labs', shortcut: '', action: 'order_antenatal_labs', requiresPatient: true },
      { id: 'diabetes', label: 'GDM Screen', shortcut: '', action: 'gdm_screening', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
  emergency: {
    sections: [
      { id: 'resus', title: 'Resuscitation', priority: 0 },
      { id: 'triage', title: 'Obstetric Triage', priority: 1 },
      { id: 'gynae-emerg', title: 'Gynae Emergencies', priority: 2 },
    ],
    quickActions: [
      { id: 'ectopic', label: 'Ectopic Protocol', shortcut: '', action: 'ectopic_protocol', requiresPatient: true },
      { id: 'pre-eclampsia', label: 'Pre-Eclampsia', shortcut: '', action: 'pre_eclampsia_protocol', requiresPatient: true },
      { id: 'antepartum', label: 'Antepartum Haemorrhage', shortcut: '', action: 'antepartum_haemorrhage', requiresPatient: true },
      { id: 'emergency-cs', label: 'Emergency C-Section', shortcut: '', action: 'emergency_c_section', requiresPatient: true },
      { id: 'scan', label: 'Bedside US', shortcut: '', action: 'bedside_ultrasound', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
};

const PEDIATRICS_WORKSPACES: SpecialtyWorkspaceMap = {
  ward_round: {
    sections: [
      { id: 'nicu', title: 'NICU', priority: 0 },
      { id: 'ped-ward', title: 'Pediatric Ward', priority: 1 },
      { id: 'pcu', title: 'Pediatric Critical Care', priority: 2 },
      { id: 'vaccination', title: 'Vaccination Due', priority: 3 },
    ],
    quickActions: [
      { id: 'growth', label: 'Growth Chart', shortcut: '', action: 'review_growth_chart', requiresPatient: true },
      { id: 'vaccination', label: 'Vaccination Status', shortcut: '', action: 'check_vaccination_status', requiresPatient: true },
      { id: 'feeding', label: 'Feeding Assessment', shortcut: '', action: 'feeding_assessment', requiresPatient: true },
      { id: 'fluid', label: 'Pediatric Fluids', shortcut: '', action: 'calculate_pediatric_fluids', requiresPatient: true },
      { id: 'escalate', label: 'Escalate to PICU', shortcut: '', action: 'escalate_picu', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
  clinic: {
    quickActions: [
      { id: 'growth', label: 'Growth Assessment', shortcut: '', action: 'growth_assessment', requiresPatient: true },
      { id: 'vaccination', label: 'Vaccinate', shortcut: '', action: 'administer_vaccine', requiresPatient: true },
      { id: 'development', label: 'Developmental Screen', shortcut: '', action: 'developmental_screening', requiresPatient: true },
      { id: 'nutrition', label: 'Nutrition Assessment', shortcut: '', action: 'nutrition_assessment', requiresPatient: true },
      { id: 'refer', label: 'Refer to Specialist', shortcut: '', action: 'refer_pediatric_specialist', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
  emergency: {
    sections: [
      { id: 'resus', title: 'Resuscitation', priority: 0 },
      { id: 'critical', title: 'Critical', priority: 1 },
      { id: 'triage', title: 'Pediatric Triage', priority: 2 },
    ],
    quickActions: [
      { id: 'pews', label: 'PEWS Score', shortcut: '', action: 'pews_score', requiresPatient: true },
      { id: 'sepsis', label: 'Pediatric Sepsis', shortcut: '', action: 'pediatric_sepsis_protocol', requiresPatient: true },
      { id: 'airway', label: 'Pediatric Airway', shortcut: '', action: 'pediatric_airway', requiresPatient: true },
      { id: 'fluid', label: 'Bolus Calculator', shortcut: '', action: 'pediatric_bolus', requiresPatient: true },
      { id: 'escalate', label: 'Escalate PICU', shortcut: '', action: 'escalate_picu', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
};

const CARDIOLOGY_WORKSPACES: SpecialtyWorkspaceMap = {
  ward_round: {
    sections: [
      { id: 'ccu', title: 'CCU / Cardiac ICU', priority: 0 },
      { id: 'cardiology-ward', title: 'Cardiology Ward', priority: 1 },
      { id: 'telemetry', title: 'Telemetry Monitoring', priority: 2 },
      { id: 'pre-procedure', title: 'Pre-Procedure', priority: 3 },
    ],
    quickActions: [
      { id: 'ecg', label: 'Review ECG', shortcut: 'Alt+E', action: 'review_ecg', requiresPatient: true },
      { id: 'echo', label: 'Review Echo', shortcut: 'Alt+H', action: 'review_echo', requiresPatient: true },
      { id: 'troponin', label: 'Troponin Trend', shortcut: 'Alt+T', action: 'review_troponin_trend', requiresPatient: true },
      { id: 'anti-coag', label: 'Anticoagulation Review', shortcut: 'Alt+A', action: 'anticoagulation_review', requiresPatient: true },
      { id: 'arrhythmia', label: 'Arrhythmia Management', shortcut: 'Alt+R', action: 'arrhythmia_protocol', requiresPatient: true },
    ],
  },
  clinic: {
    quickActions: [
      { id: 'ecg', label: 'ECG', shortcut: '', action: 'order_ecg', requiresPatient: true },
      { id: 'echo', label: 'Echocardiogram', shortcut: '', action: 'order_echo', requiresPatient: true },
      { id: 'holter', label: 'Holter Monitor', shortcut: '', action: 'order_holter', requiresPatient: true },
      { id: 'stress', label: 'Stress Test', shortcut: '', action: 'order_stress_test', requiresPatient: true },
      { id: 'cath', label: 'Refer for Cath', shortcut: '', action: 'refer_cath', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
  emergency: {
    quickActions: [
      { id: 'stemi', label: 'STEMI Protocol', shortcut: '', action: 'stemi_protocol', requiresPatient: true },
      { id: 'acs', label: 'ACS Protocol', shortcut: '', action: 'acs_protocol', requiresPatient: true },
      { id: 'arrhythmia', label: 'Arrhythmia Protocol', shortcut: '', action: 'arrhythmia_protocol', requiresPatient: true },
      { id: 'cpr', label: 'Code Blue Team', shortcut: '', action: 'code_blue', requiresPatient: true },
      { id: 'cardioversion', label: 'Cardioversion', shortcut: '', action: 'cardioversion', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
};

const NEUROLOGY_WORKSPACES: SpecialtyWorkspaceMap = {
  ward_round: {
    sections: [
      { id: 'stroke-unit', title: 'Stroke Unit', priority: 0 },
      { id: 'neurology-ward', title: 'Neurology Ward', priority: 1 },
      { id: 'neuro-hdu', title: 'Neuro HDU', priority: 2 },
    ],
    quickActions: [
      { id: 'neuro-exam', label: 'Neurological Exam', shortcut: '', action: 'neurological_exam', requiresPatient: true },
      { id: 'stroke-assessment', label: 'Stroke Assessment', shortcut: '', action: 'stroke_assessment', requiresPatient: true },
      { id: 'ct-brain', label: 'CT Brain Review', shortcut: '', action: 'review_ct_brain', requiresPatient: true },
      { id: 'lumbar-puncture', label: 'Lumbar Puncture', shortcut: '', action: 'lumbar_puncture', requiresPatient: true },
      { id: 'eeg', label: 'EEG Review', shortcut: '', action: 'review_eeg', requiresPatient: true },
    ],
  },
  clinic: {
    quickActions: [
      { id: 'exam', label: 'Neuro Exam', shortcut: '', action: 'neurological_exam', requiresPatient: true },
      { id: 'imaging', label: 'Neuro Imaging', shortcut: '', action: 'order_neuro_imaging', requiresPatient: true },
      { id: 'electrophys', label: 'NCS/EMG', shortcut: '', action: 'order_ncs_emg', requiresPatient: true },
      { id: 'refer', label: 'Refer Neurosurgeon', shortcut: '', action: 'refer_neurosurgery', requiresPatient: true },
    ],
  },
  emergency: {
    quickActions: [
      { id: 'stroke-code', label: 'Stroke Code', shortcut: '', action: 'stroke_code', requiresPatient: true },
      { id: 'thrombolysis', label: 'Thrombolysis', shortcut: '', action: 'thrombolysis_assessment', requiresPatient: true },
      { id: 'seizure', label: 'Seizure Protocol', shortcut: '', action: 'seizure_protocol', requiresPatient: true },
      { id: 'ct-brain', label: 'Stat CT Brain', shortcut: '', action: 'order_stat_ct_brain', requiresPatient: true },
      { id: 'lumbar-puncture', label: 'Lumbar Puncture', shortcut: '', action: 'lumbar_puncture', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
};

const ENDOCRINOLOGY_WORKSPACES: SpecialtyWorkspaceMap = {
  ward_round: {
    sections: [
      { id: 'diabetes', title: 'Diabetes Inpatients', priority: 1 },
      { id: 'endocrine', title: 'Endocrine Ward', priority: 2 },
      { id: 'dka', title: 'DKA/HHS Alerts', priority: 0 },
    ],
    quickActions: [
      { id: 'insulin', label: 'Insulin Review', shortcut: '', action: 'insulin_review', requiresPatient: true },
      { id: 'hba1c', label: 'HbA1c Trend', shortcut: '', action: 'review_hba1c_trend', requiresPatient: true },
      { id: 'foot-exam', label: 'Foot Exam', shortcut: '', action: 'diabetic_foot_exam', requiresPatient: true },
      { id: 'dka', label: 'DKA Protocol', shortcut: '', action: 'dka_protocol', requiresPatient: true },
      { id: 'cgm', label: 'CGM Review', shortcut: '', action: 'review_cgm_data', requiresPatient: true },
    ],
  },
  clinic: {
    quickActions: [
      { id: 'hba1c', label: 'HbA1c', shortcut: '', action: 'order_hba1c', requiresPatient: true },
      { id: 'foot-screen', label: 'Foot Screening', shortcut: '', action: 'foot_screening', requiresPatient: true },
      { id: 'insulin', label: 'Insulin Adjustment', shortcut: '', action: 'adjust_insulin', requiresPatient: true },
      { id: 'thyroid', label: 'Thyroid Function', shortcut: '', action: 'review_thyroid', requiresPatient: true },
      { id: 'refer', label: 'Refer Diabetes Ed', shortcut: '', action: 'refer_diabetes_education', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
};

const NEPHROLOGY_WORKSPACES: SpecialtyWorkspaceMap = {
  ward_round: {
    sections: [
      { id: 'dialysis', title: 'Dialysis Patients', priority: 1 },
      { id: 'aki', title: 'AKI Monitoring', priority: 0 },
      { id: 'ckd', title: 'CKD Management', priority: 2 },
      { id: 'transplant', title: 'Transplant', priority: 3 },
    ],
    quickActions: [
      { id: 'renal-function', label: 'Renal Function Trend', shortcut: '', action: 'review_renal_trend', requiresPatient: true },
      { id: 'dialysis', label: 'Dialysis Orders', shortcut: '', action: 'dialysis_orders', requiresPatient: true },
      { id: 'fluids', label: 'Fluid Balance Review', shortcut: '', action: 'fluid_balance_review', requiresPatient: true },
      { id: 'electrolytes', label: 'Electrolyte Correction', shortcut: '', action: 'electrolyte_correction', requiresPatient: true },
      { id: 'access', label: 'Vascular Access Review', shortcut: '', action: 'vascular_access_review', requiresPatient: true },
    ],
  },
  clinic: {
    quickActions: [
      { id: 'renal', label: 'Renal Function', shortcut: '', action: 'order_renal_function', requiresPatient: true },
      { id: 'urine', label: 'Urinalysis', shortcut: '', action: 'order_urinalysis', requiresPatient: true },
      { id: 'bp', label: 'BP Management', shortcut: '', action: 'bp_management', requiresPatient: true },
      { id: 'dialysis', label: 'Dialysis Referral', shortcut: '', action: 'refer_dialysis', requiresPatient: true },
      { id: 'transplant', label: 'Transplant Referral', shortcut: '', action: 'refer_transplant', requiresPatient: true },
    ],
    rightPanel: { showCalculators: true },
  },
};

const GASTROENTEROLOGY_WORKSPACES: SpecialtyWorkspaceMap = {
  ward_round: {
    sections: [
      { id: 'gi-ward', title: 'GI Ward', priority: 1 },
      { id: 'hepatology', title: 'Hepatology', priority: 2 },
      { id: 'gi-bleeding', title: 'GI Bleeding', priority: 0 },
    ],
    quickActions: [
      { id: 'gi-bleed', label: 'GI Bleeding Assessment', shortcut: '', action: 'gi_bleeding_assessment', requiresPatient: true },
      { id: 'endoscopy', label: 'Endoscopy Results', shortcut: '', action: 'review_endoscopy', requiresPatient: true },
      { id: 'liver', label: 'Liver Function Review', shortcut: '', action: 'review_lft', requiresPatient: true },
      { id: 'nutrition', label: 'Nutrition Assessment', shortcut: '', action: 'nutrition_assessment', requiresPatient: true },
      { id: 'scope', label: 'Plan Endoscopy', shortcut: '', action: 'plan_endoscopy', requiresPatient: true },
    ],
  },
  clinic: {
    quickActions: [
      { id: 'scope', label: 'Refer Endoscopy', shortcut: '', action: 'refer_endoscopy', requiresPatient: true },
      { id: 'imaging', label: 'Abdominal Imaging', shortcut: '', action: 'order_abdominal_imaging', requiresPatient: true },
      { id: 'liver', label: 'Liver Assessment', shortcut: '', action: 'liver_assessment', requiresPatient: true },
      { id: 'ibs', label: 'IBS Management', shortcut: '', action: 'ibs_management', requiresPatient: true },
      { id: 'nutrition', label: 'Nutrition Referral', shortcut: '', action: 'refer_nutrition', requiresPatient: true },
    ],
  },
};

const PULMONOLOGY_WORKSPACES: SpecialtyWorkspaceMap = {
  ward_round: {
    sections: [
      { id: 'resp-ward', title: 'Respiratory Ward', priority: 1 },
      { id: 'icu-vent', title: 'ICU Ventilated', priority: 0 },
      { id: 'bronchoscopy', title: 'Bronchoscopy List', priority: 2 },
      { id: 'sleep', title: 'Sleep Studies', priority: 3 },
    ],
    quickActions: [
      { id: 'cxr', label: 'Chest XR Review', shortcut: '', action: 'review_cxr', requiresPatient: true },
      { id: 'abg', label: 'ABG Review', shortcut: '', action: 'review_abg', requiresPatient: true },
      { id: 'pft', label: 'PFT Results', shortcut: '', action: 'review_pft', requiresPatient: true },
      { id: 'bronch', label: 'Bronchoscopy Prep', shortcut: '', action: 'bronchoscopy_prep', requiresPatient: true },
      { id: 'oxygen', label: 'Oxygen Therapy Review', shortcut: '', action: 'oxygen_therapy_review', requiresPatient: true },
    ],
  },
  clinic: {
    quickActions: [
      { id: 'pft', label: 'PFT Order', shortcut: '', action: 'order_pft', requiresPatient: true },
      { id: 'cxr', label: 'Chest XR', shortcut: '', action: 'order_cxr', requiresPatient: true },
      { id: 'ct-chest', label: 'CT Chest', shortcut: '', action: 'order_ct_chest', requiresPatient: true },
      { id: 'bronch', label: 'Refer Bronchoscopy', shortcut: '', action: 'refer_bronchoscopy', requiresPatient: true },
      { id: 'sleep', label: 'Refer Sleep Study', shortcut: '', action: 'refer_sleep_study', requiresPatient: true },
    ],
  },
  emergency: {
    quickActions: [
      { id: 'pe', label: 'PE Protocol', shortcut: '', action: 'pe_protocol', requiresPatient: true },
      { id: 'asthma', label: 'Asthma Protocol', shortcut: '', action: 'asthma_protocol', requiresPatient: true },
      { id: 'copd', label: 'COPD Exacerbation', shortcut: '', action: 'copd_protocol', requiresPatient: true },
      { id: 'pneumothorax', label: 'Chest Drain', shortcut: '', action: 'chest_drain', requiresPatient: true },
      { id: 'non-invasive', label: 'NIV/BiPAP', shortcut: '', action: 'start_niv', requiresPatient: true },
    ],
  },
};

const EMERGENCY_WORKSPACES: SpecialtyWorkspaceMap = {
  emergency: {
    sections: [
      { id: 'resus', title: 'Resuscitation', priority: 0 },
      { id: 'critical', title: 'Critical Care', priority: 1 },
      { id: 'majors', title: 'Majors', priority: 2 },
      { id: 'minors', title: 'Minors', priority: 4 },
      { id: 'waiting', title: 'Waiting Room', priority: 5 },
      { id: 'results', title: 'Pending Results', priority: 3 },
    ],
    quickActions: [
      { id: 'intubate', label: 'Intubate', shortcut: '', action: 'airway', requiresPatient: true },
      { id: 'central-line', label: 'Central Line', shortcut: '', action: 'central_line', requiresPatient: true },
      { id: 'chest-drain', label: 'Chest Drain', shortcut: '', action: 'chest_drain', requiresPatient: true },
      { id: 'fast', label: 'FAST Scan', shortcut: '', action: 'fast_scan', requiresPatient: true },
      { id: 'blood-gas', label: 'Blood Gas', shortcut: '', action: 'order_blood_gas', requiresPatient: true },
      { id: 'ct-trauma', label: 'CT Trauma', shortcut: '', action: 'order_ct_trauma', requiresPatient: true },
      { id: 'massive-transfusion', label: 'Massive Transfusion', shortcut: '', action: 'massive_transfusion_protocol', requiresPatient: true },
      { id: 'dispo', label: 'Disposition Decision', shortcut: '', action: 'disposition', requiresPatient: true },
    ],
  },
  clinic: {
    sections: [
      { id: 'urgent-care', title: 'Urgent Care', priority: 1 },
      { id: 'fast-track', title: 'Fast Track', priority: 2 },
    ],
    quickActions: [
      { id: 'suture', label: 'Suture', shortcut: '', action: 'suture_wound', requiresPatient: true },
      { id: 'incision', label: 'I&D', shortcut: '', action: 'incision_drainage', requiresPatient: true },
      { id: 'splint', label: 'Splint', shortcut: '', action: 'apply_splint', requiresPatient: true },
      { id: 'prescribe', label: 'Prescribe', shortcut: '', action: 'prescribe', requiresPatient: true },
    ],
  },
};

const ICU_WORKSPACES: SpecialtyWorkspaceMap = {
  icu: {
    sections: [
      { id: 'ventilated', title: 'Ventilated', priority: 1 },
      { id: 'weaning', title: 'Weaning', priority: 2 },
      { id: 'new-admissions', title: 'New Admissions', priority: 0 },
      { id: 'step-down', title: 'Step-Down Candidates', priority: 3 },
      { id: 'alerts', title: 'Alerts', priority: 0 },
    ],
    quickActions: [
      { id: 'vent-settings', label: 'Ventilator Settings', shortcut: '', action: 'adjust_ventilator', requiresPatient: true },
      { id: 'abg', label: 'ABG', shortcut: '', action: 'order_abg', requiresPatient: true },
      { id: 'pressors', label: 'Pressor Management', shortcut: '', action: 'pressor_management', requiresPatient: true },
      { id: 'sedation', label: 'Sedation Protocol', shortcut: '', action: 'sedation_protocol', requiresPatient: true },
      { id: 'cxr', label: 'Chest XR', shortcut: '', action: 'order_cxr', requiresPatient: true },
      { id: 'cultures', label: 'Culture Review', shortcut: '', action: 'review_cultures', requiresPatient: true },
      { id: 'dialysis', label: 'CRRT Review', shortcut: '', action: 'crrt_review', requiresPatient: true },
    ],
  },
};

const PSYCHIATRY_WORKSPACES: SpecialtyWorkspaceMap = {
  ward_round: {
    sections: [
      { id: 'acute-ward', title: 'Acute Ward', priority: 1 },
      { id: 'picu', title: 'PICU', priority: 0 },
      { id: 'rehab', title: 'Rehabilitation', priority: 2 },
      { id: 'liaison', title: 'Liaison Referrals', priority: 3 },
    ],
    quickActions: [
      { id: 'mse', label: 'Mental State Exam', shortcut: '', action: 'mental_state_exam', requiresPatient: true },
      { id: 'risk', label: 'Risk Assessment', shortcut: '', action: 'risk_assessment', requiresPatient: true },
      { id: 'section', label: 'Section Papers', shortcut: '', action: 'section_papers', requiresPatient: true },
      { id: 'med-review', label: 'Medication Review', shortcut: '', action: 'psych_medication_review', requiresPatient: true },
      { id: 'ect', label: 'ECT Referral', shortcut: '', action: 'refer_ect', requiresPatient: true },
    ],
  },
  clinic: {
    quickActions: [
      { id: 'assessment', label: 'Psychiatric Assessment', shortcut: '', action: 'psychiatric_assessment', requiresPatient: true },
      { id: 'therapy', label: 'Therapy Referral', shortcut: '', action: 'refer_therapy', requiresPatient: true },
      { id: 'medication', label: 'Medication Review', shortcut: '', action: 'psych_medication_review', requiresPatient: true },
      { id: 'crisis', label: 'Crisis Plan', shortcut: '', action: 'crisis_plan', requiresPatient: true },
      { id: 'refer', label: 'Refer Psychology', shortcut: '', action: 'refer_psychology', requiresPatient: true },
    ],
  },
  emergency: {
    sections: [
      { id: 'crisis', title: 'Crisis Assessment', priority: 0 },
      { id: 'section', title: 'Section Assessment', priority: 1 },
      { id: 'liaison', title: 'ED Liaison', priority: 2 },
    ],
    quickActions: [
      { id: 'mse', label: 'Mental State Exam', shortcut: '', action: 'mental_state_exam', requiresPatient: true },
      { id: 'risk', label: 'Risk Assessment', shortcut: '', action: 'risk_assessment', requiresPatient: true },
      { id: 'section', label: 'Section Assessment', shortcut: '', action: 'section_assessment', requiresPatient: true },
      { id: 'sedation', label: 'Rapid Sedation', shortcut: '', action: 'rapid_sedation', requiresPatient: true },
      { id: 'admit', label: 'Admit Decision', shortcut: '', action: 'psych_admit_decision', requiresPatient: true },
    ],
  },
};

const FAMILY_MEDICINE_WORKSPACES: SpecialtyWorkspaceMap = {
  clinic: {
    sections: [
      { id: 'queue', title: 'Patient Queue', priority: 1 },
      { id: 'current', title: 'Current Patient', priority: 0 },
      { id: 'chronic', title: 'Chronic Disease Follow-up', priority: 2 },
      { id: 'preventive', title: 'Preventive Care Due', priority: 3 },
    ],
    quickActions: [
      { id: 'consult', label: 'Consultation', shortcut: '', action: 'start_consultation', requiresPatient: true },
      { id: 'prescribe', label: 'Prescribe', shortcut: '', action: 'prescribe', requiresPatient: true },
      { id: 'lab', label: 'Order Labs', shortcut: '', action: 'order_lab', requiresPatient: true },
      { id: 'vaccinate', label: 'Vaccinate', shortcut: '', action: 'administer_vaccine', requiresPatient: true },
      { id: 'refer', label: 'Refer Specialist', shortcut: '', action: 'refer_specialist', requiresPatient: true },
      { id: 'sick-note', label: 'Medical Certificate', shortcut: '', action: 'generate_certificate', requiresPatient: true },
    ],
  },
  home_visit: {
    sections: [
      { id: 'visits', title: "Today's Visits", priority: 1 },
      { id: 'pending', title: 'Pending', priority: 2 },
    ],
    quickActions: [
      { id: 'assess', label: 'Home Assessment', shortcut: '', action: 'home_assessment', requiresPatient: true },
      { id: 'prescribe', label: 'Prescribe', shortcut: '', action: 'prescribe', requiresPatient: true },
      { id: 'refer', label: 'Refer Home Care', shortcut: '', action: 'refer_home_care', requiresPatient: true },
    ],
  },
};

// ── Registry ──────────────────────────────────────────────────────────────────

const SPECIALTY_WORKSPACE_REGISTRY: Partial<Record<MedicalSpecialty, SpecialtyWorkspaceMap>> = {
  general_surgery: SURGERY_WORKSPACES,
  cardiothoracic_surgery: SURGERY_WORKSPACES,
  neurosurgery: SURGERY_WORKSPACES,
  orthopedic_surgery: SURGERY_WORKSPACES,
  pediatric_surgery: SURGERY_WORKSPACES,
  plastic_surgery: SURGERY_WORKSPACES,
  vascular_surgery: SURGERY_WORKSPACES,
  urology: SURGERY_WORKSPACES,
  ent: SURGERY_WORKSPACES,
  obstetrics_gynecology: OBSTETRICS_WORKSPACES,
  pediatrics: PEDIATRICS_WORKSPACES,
  neonatology: PEDIATRICS_WORKSPACES,
  cardiology: CARDIOLOGY_WORKSPACES,
  neurology: NEUROLOGY_WORKSPACES,
  endocrinology: ENDOCRINOLOGY_WORKSPACES,
  nephrology: NEPHROLOGY_WORKSPACES,
  gastroenterology: GASTROENTEROLOGY_WORKSPACES,
  pulmonology: PULMONOLOGY_WORKSPACES,
  emergency_medicine: EMERGENCY_WORKSPACES,
  intensive_care: ICU_WORKSPACES,
  psychiatry: PSYCHIATRY_WORKSPACES,
  family_medicine: FAMILY_MEDICINE_WORKSPACES,
  general_practice: FAMILY_MEDICINE_WORKSPACES,
  internal_medicine: {
    ward_round: {
      sections: [
        { id: 'general-ward', title: 'General Ward', priority: 1 },
        { id: 'high-dependency', title: 'HDU', priority: 0 },
        { id: 'decant', title: 'Decant Patients', priority: 2 },
      ],
      quickActions: [
        { id: 'review', label: 'Patient Review', shortcut: '', action: 'review_patient', requiresPatient: true },
        { id: 'imaging', label: 'Review Imaging', shortcut: '', action: 'review_imaging', requiresPatient: true },
        { id: 'lab', label: 'Lab Results', shortcut: '', action: 'review_labs', requiresPatient: true },
        { id: 'discharge', label: 'Discharge Summary', shortcut: '', action: 'write_discharge_summary', requiresPatient: true },
        { id: 'refer', label: 'Refer Specialty', shortcut: '', action: 'refer_specialty', requiresPatient: true },
      ],
    },
    clinic: {
      quickActions: [
        { id: 'consult', label: 'Consultation', shortcut: '', action: 'start_consultation', requiresPatient: true },
        { id: 'lab', label: 'Order Labs', shortcut: '', action: 'order_lab', requiresPatient: true },
        { id: 'imaging', label: 'Order Imaging', shortcut: '', action: 'order_imaging', requiresPatient: true },
        { id: 'refer', label: 'Refer Subspecialty', shortcut: '', action: 'refer_subspecialty', requiresPatient: true },
        { id: 'follow-up', label: 'Schedule Follow-up', shortcut: '', action: 'schedule_follow_up', requiresPatient: true },
      ],
    },
  },
  oncology: {
    ward_round: {
      sections: [
        { id: 'chemo', title: 'Chemotherapy Patients', priority: 1 },
        { id: 'palliative', title: 'Palliative Care', priority: 2 },
        { id: 'complications', title: 'Complications', priority: 0 },
        { id: 'clinical-trial', title: 'Clinical Trials', priority: 3 },
      ],
      quickActions: [
        { id: 'chemo-review', label: 'Chemo Review', shortcut: '', action: 'chemotherapy_review', requiresPatient: true },
        { id: 'pathology', label: 'Pathology Review', shortcut: '', action: 'review_pathology', requiresPatient: true },
        { id: 'imaging', label: 'Staging Review', shortcut: '', action: 'review_staging', requiresPatient: true },
        { id: 'palliative', label: 'Palliative Referral', shortcut: '', action: 'refer_palliative', requiresPatient: true },
        { id: 'trial', label: 'Trial Eligibility', shortcut: '', action: 'assess_trial_eligibility', requiresPatient: true },
      ],
    },
    clinic: {
      sections: [
        { id: 'new', title: 'New Referrals', priority: 1 },
        { id: 'follow-up', title: 'Follow-up', priority: 2 },
        { id: 'results', title: 'Results to Discuss', priority: 0 },
        { id: 'treatment', title: 'Treatment Planning', priority: 3 },
      ],
      quickActions: [
        { id: 'staging', label: 'Staging Assessment', shortcut: '', action: 'staging_assessment', requiresPatient: true },
        { id: 'chemo-plan', label: 'Chemo Plan', shortcut: '', action: 'chemotherapy_plan', requiresPatient: true },
        { id: 'pathology', label: 'Pathology Results', shortcut: '', action: 'review_pathology', requiresPatient: true },
        { id: 'refer', label: 'Refer MDT', shortcut: '', action: 'refer_mdt', requiresPatient: true },
        { id: 'trial', label: 'Clinical Trial Options', shortcut: '', action: 'discuss_trial_options', requiresPatient: true },
      ],
    },
  },
  dermatology: {
    clinic: {
      sections: [
        { id: 'queue', title: 'Patient Queue', priority: 1 },
        { id: 'current', title: 'Current Patient', priority: 0 },
        { id: 'photo', title: 'Photography Due', priority: 2 },
        { id: 'procedure', title: 'Minor Procedures', priority: 3 },
      ],
      quickActions: [
        { id: 'exam', label: 'Skin Exam', shortcut: '', action: 'skin_exam', requiresPatient: true },
        { id: 'biopsy', label: 'Skin Biopsy', shortcut: '', action: 'skin_biopsy', requiresPatient: true },
        { id: 'photo', label: 'Clinical Photo', shortcut: '', action: 'clinical_photography', requiresPatient: true },
        { id: 'dermoscopy', label: 'Dermoscopy', shortcut: '', action: 'dermoscopy', requiresPatient: true },
        { id: 'prescribe', label: 'Prescribe Topical', shortcut: '', action: 'prescribe_topical', requiresPatient: true },
        { id: 'refer', label: 'Refer Surgery', shortcut: '', action: 'refer_dermatology_surgery', requiresPatient: true },
      ],
    },
  },
  ophthalmology: {
    clinic: {
      sections: [
        { id: 'queue', title: 'Patient Queue', priority: 1 },
        { id: 'current', title: 'Current Patient', priority: 0 },
        { id: 'emergency', title: 'Eye Emergency', priority: 0 },
        { id: 'procedure', title: 'Minor Procedures', priority: 2 },
      ],
      quickActions: [
        { id: 'va', label: 'Visual Acuity', shortcut: '', action: 'visual_acuity', requiresPatient: true },
        { id: 'slit-lamp', label: 'Slit Lamp Exam', shortcut: '', action: 'slit_lamp_exam', requiresPatient: true },
        { id: 'fundoscopy', label: 'Fundoscopy', shortcut: '', action: 'fundoscopy', requiresPatient: true },
        { id: 'iop', label: 'IOP Measurement', shortcut: '', action: 'iop_measurement', requiresPatient: true },
        { id: 'refer', label: 'Refer Surgery', shortcut: '', action: 'refer_eye_surgery', requiresPatient: true },
      ],
    },
    theatre: {
      sections: [
        { id: 'list', title: 'Surgical List', priority: 1 },
        { id: 'current', title: 'Current Case', priority: 0 },
        { id: 'recovery', title: 'Recovery', priority: 2 },
      ],
      quickActions: [
        { id: 'timeout', label: 'Surgical Timeout', shortcut: '', action: 'surgical_timeout', requiresPatient: true },
        { id: 'op-note', label: 'Operation Note', shortcut: '', action: 'write_op_note', requiresPatient: true },
        { id: 'post-op', label: 'Post-Op Check', shortcut: '', action: 'post_op_check', requiresPatient: true },
      ],
    },
  },
  anesthesiology: {
    theatre: {
      sections: [
        { id: 'list', title: 'Theatre List', priority: 1 },
        { id: 'current', title: 'Current Case', priority: 0 },
        { id: 'pre-op', title: 'Pre-Op Assessment', priority: 2 },
        { id: 'recovery', title: 'Recovery/PACU', priority: 3 },
      ],
      quickActions: [
        { id: 'pre-op-assess', label: 'Pre-Op Assessment', shortcut: '', action: 'pre_op_assessment', requiresPatient: true },
        { id: 'induction', label: 'Induction', shortcut: '', action: 'induction', requiresPatient: true },
        { id: 'airway', label: 'Airway Management', shortcut: '', action: 'airway_management', requiresPatient: true },
        { id: 'fluids', label: 'Fluid Management', shortcut: '', action: 'fluid_management', requiresPatient: true },
        { id: 'pain', label: 'Pain Management', shortcut: '', action: 'pain_management', requiresPatient: true },
        { id: 'emergence', label: 'Emergence', shortcut: '', action: 'emergence', requiresPatient: true },
      ],
    },
  },
};

// ── Specialty workflow templates ──────────────────────────────────────────────

const SPECIALTY_WORKFLOW_TEMPLATES: Partial<Record<MedicalSpecialty, SpecialtyWorkflowTemplate[]>> = {
  general_surgery: [
    { id: 'swf-chole', name: 'Laparoscopic Cholecystectomy', description: 'Elective laparoscopic cholecystectomy pathway', triggerType: 'scheduled', defaultPriority: 4, suggestedTasks: [{ title: 'Pre-op Assessment', type: 'assessment', order: 1 }, { title: 'Informed Consent', type: 'documentation', order: 2 }, { title: 'Operation', type: 'procedure', order: 3 }, { title: 'Post-op Review', type: 'review', order: 4 }, { title: 'Discharge Summary', type: 'documentation', order: 5 }] },
    { id: 'swf-append', name: 'Emergency Appendicectomy', description: 'Emergency appendicectomy pathway', triggerType: 'emergency', defaultPriority: 2, suggestedTasks: [{ title: 'Assessment & Diagnosis', type: 'assessment', order: 1 }, { title: 'Pre-op Preparation', type: 'assessment', order: 2 }, { title: 'Emergency Operation', type: 'procedure', order: 3 }, { title: 'Post-op Monitoring', type: 'review', order: 4 }] },
  ],
  obstetrics_gynecology: [
    { id: 'owf-cs', name: 'Caesarean Section', description: 'Elective or emergency C-section', triggerType: 'scheduled', defaultPriority: 2, suggestedTasks: [{ title: 'Pre-op Assessment', type: 'assessment', order: 1 }, { title: 'Consent', type: 'documentation', order: 2 }, { title: 'C-Section', type: 'procedure', order: 3 }, { title: 'Postnatal Care', type: 'assessment', order: 4 }] },
    { id: 'owf-induction', name: 'Induction of Labour', description: 'IOL pathway', triggerType: 'scheduled', defaultPriority: 3, suggestedTasks: [{ title: 'Induction Assessment', type: 'assessment', order: 1 }, { title: 'Begin Induction', type: 'procedure', order: 2 }, { title: 'Monitor Labour', type: 'review', order: 3 }] },
  ],
  pediatrics: [
    { id: 'pwf-sepsis', name: 'Pediatric Sepsis', description: 'Pediatric sepsis protocol', triggerType: 'emergency', defaultPriority: 1, suggestedTasks: [{ title: 'Sepsis Assessment', type: 'assessment', order: 1 }, { title: 'IV Access & Labs', type: 'procedure', order: 2 }, { title: 'Antibiotics', type: 'medication_admin', order: 3 }, { title: 'Fluid Resuscitation', type: 'procedure', order: 4 }, { title: 'PICU Referral', type: 'consult_request', order: 5 }] },
  ],
  cardiology: [
    { id: 'cwf-stemi', name: 'STEMI Protocol', description: 'ST-elevation MI pathway', triggerType: 'emergency', defaultPriority: 1, suggestedTasks: [{ title: 'ECG & Diagnosis', type: 'assessment', order: 1 }, { title: 'Door-to-Balloon Prep', type: 'procedure', order: 2 }, { title: 'Cath Lab Activation', type: 'notification', order: 3 }, { title: 'PCI Procedure', type: 'procedure', order: 4 }, { title: 'CCU Admission', type: 'discharge_process', order: 5 }] },
  ],
  emergency_medicine: [
    { id: 'ewf-trauma', name: 'Major Trauma', description: 'Major trauma call pathway', triggerType: 'emergency', defaultPriority: 1, suggestedTasks: [{ title: 'Trauma Assessment (ATLS)', type: 'assessment', order: 1 }, { title: 'IV Access & Bloods', type: 'procedure', order: 2 }, { title: 'Imaging', type: 'ordering', order: 3 }, { title: 'Specialty Referral', type: 'consult_request', order: 4 }, { title: 'Disposition', type: 'discharge_process', order: 5 }] },
    { id: 'ewf-stroke', name: 'Acute Stroke', description: 'Stroke code pathway', triggerType: 'emergency', defaultPriority: 1, suggestedTasks: [{ title: 'Stroke Assessment (NIHSS)', type: 'assessment', order: 1 }, { title: 'Stat CT Brain', type: 'ordering', order: 2 }, { title: 'Thrombolysis Decision', type: 'review', order: 3 }, { title: 'Thrombolysis (if eligible)', type: 'medication_admin', order: 4 }, { title: 'Stroke Unit Admission', type: 'discharge_process', order: 5 }] },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

// ── Build Specialist Context ──────────────────────────────────────────────────
// Wraps a base DoctorContext with specialty-specific workspace overrides.

export function buildSpecialistContext(
  context: DoctorContext,
  specialty: MedicalSpecialty,
): DoctorContext {
  const overrides = getSpecialtyWorkspace(specialty, context.assignment.type);
  if (!overrides) return context;

  const sections: WorkspaceSection[] = overrides.sections
    ? overrides.sections.map(s => ({ ...s, items: [] }))
    : context.workspace.sections;

  const quickActions: DoctorQuickAction[] = overrides.quickActions
    ? overrides.quickActions.map(q => ({ ...q }))
    : context.workspace.quickActions;

  const rightPanel: RightPanelConfig = overrides.rightPanel
    ? { ...context.workspace.rightPanel, ...overrides.rightPanel }
    : context.workspace.rightPanel;

  return {
    ...context,
    workspace: {
      ...context.workspace,
      sections,
      quickActions,
      rightPanel,
    },
  };
}

// ── Get specialty workspace overrides for a given specialty + assignment ──────

export function getSpecialtyWorkspace(
  specialty: MedicalSpecialty,
  assignmentType: AssignmentType,
): SpecialtyWorkspaceOverride | undefined {
  const specialtyMap = SPECIALTY_WORKSPACE_REGISTRY[specialty];
  if (!specialtyMap) return undefined;
  return specialtyMap[assignmentType];
}

// ── Check if a specialty has workspace overrides for a given assignment ───────

export function hasSpecialtyWorkspace(
  specialty: MedicalSpecialty,
  assignmentType: AssignmentType,
): boolean {
  return getSpecialtyWorkspace(specialty, assignmentType) !== undefined;
}

// ── Get available assignment types for a specialty ────────────────────────────

export function getAvailableSpecialtyAssignments(specialty: MedicalSpecialty): AssignmentType[] {
  const specialtyMap = SPECIALTY_WORKSPACE_REGISTRY[specialty];
  if (!specialtyMap) return [];
  return Object.keys(specialtyMap) as AssignmentType[];
}

// ── Get specialty workflow templates ─────────────────────────────────────────

export function getSpecialtyWorkflowTemplates(specialty: MedicalSpecialty): SpecialtyWorkflowTemplate[] {
  return SPECIALTY_WORKFLOW_TEMPLATES[specialty] ?? [];
}

// ── Get all specialties that have workspace definitions ──────────────────────

export function getSupportedSpecialties(): MedicalSpecialty[] {
  return Object.keys(SPECIALTY_WORKSPACE_REGISTRY) as MedicalSpecialty[];
}

// ── Specialty label map ───────────────────────────────────────────────────────

export const SPECIALTY_LABELS: Record<MedicalSpecialty, string> = {
  general_surgery: 'General Surgery',
  cardiothoracic_surgery: 'Cardiothoracic Surgery',
  neurosurgery: 'Neurosurgery',
  orthopedic_surgery: 'Orthopedic Surgery',
  pediatric_surgery: 'Pediatric Surgery',
  plastic_surgery: 'Plastic Surgery',
  vascular_surgery: 'Vascular Surgery',
  urology: 'Urology',
  ent: 'ENT',
  ophthalmology: 'Ophthalmology',
  anesthesiology: 'Anesthesiology',
  emergency_medicine: 'Emergency Medicine',
  internal_medicine: 'Internal Medicine',
  pediatrics: 'Pediatrics',
  obstetrics_gynecology: 'Obstetrics & Gynecology',
  psychiatry: 'Psychiatry',
  radiology: 'Radiology',
  pathology: 'Pathology',
  dermatology: 'Dermatology',
  neurology: 'Neurology',
  cardiology: 'Cardiology',
  pulmonology: 'Pulmonology',
  gastroenterology: 'Gastroenterology',
  nephrology: 'Nephrology',
  endocrinology: 'Endocrinology',
  rheumatology: 'Rheumatology',
  oncology: 'Oncology',
  hematology: 'Hematology',
  infectious_disease: 'Infectious Disease',
  family_medicine: 'Family Medicine',
  general_practice: 'General Practice',
  public_health: 'Public Health',
  forensic_medicine: 'Forensic Medicine',
  sports_medicine: 'Sports Medicine',
  palliative_care: 'Palliative Care',
  pain_medicine: 'Pain Medicine',
  intensive_care: 'Intensive Care',
  neonatology: 'Neonatology',
  other: 'Other',
};
