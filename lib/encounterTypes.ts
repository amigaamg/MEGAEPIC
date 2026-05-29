export type OrganizationLevel = 'referral_hospital' | 'county_hospital' | 'private_hospital' | 'clinic' | 'specialist_center' | 'telemedicine' | 'teaching_hospital';

export const ORGANIZATION_LABELS: Record<OrganizationLevel, string> = {
  referral_hospital: 'Referral Hospital',
  county_hospital: 'County Hospital',
  private_hospital: 'Private Hospital',
  clinic: 'Clinic',
  specialist_center: 'Specialist Center',
  telemedicine: 'Telemedicine Center',
  teaching_hospital: 'Teaching Hospital',
};

export type EncounterType =
  | 'outpatient'
  | 'emergency'
  | 'inpatient'
  | 'ward_round'
  | 'follow_up'
  | 'procedure'
  | 'operative_note'
  | 'icu_review'
  | 'telemedicine'
  | 'antenatal'
  | 'post_op'
  | 'discharge_summary'
  | 'referral'
  | 'mdt_review';

export const ENCOUNTER_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  full_history:     { label: 'Full History',      icon: '📋', color: '#22d3ee' },
  outpatient:       { label: 'Outpatient Visit',    icon: '🏥', color: '#3b82f6' },
  emergency:        { label: 'Emergency Visit',     icon: '🚨', color: '#ef4444' },
  inpatient:        { label: 'Inpatient Admission', icon: '🛏️', color: '#f59e0b' },
  ward_round:       { label: 'Ward Round',          icon: '👨‍⚕️', color: '#06b6d4' },
  follow_up:        { label: 'Follow-up Visit',     icon: '📅', color: '#8b5cf6' },
  procedure:        { label: 'Procedure Note',      icon: '🔧', color: '#ec4899' },
  operative_note:   { label: 'Operative Note',      icon: '🔪', color: '#10b981' },
  icu_review:       { label: 'ICU Review',          icon: '💓', color: '#ef4444' },
  telemedicine:     { label: 'Teleconsultation',    icon: '📹', color: '#6366f1' },
  antenatal:        { label: 'Antenatal Review',    icon: '🤰', color: '#f97316' },
  post_op:          { label: 'Post-op Review',      icon: '🩹', color: '#14b8a6' },
  discharge_summary:{ label: 'Discharge Summary',   icon: '📋', color: '#94a3b8' },
  referral:         { label: 'Referral Note',       icon: '🔄', color: '#a78bfa' },
  mdt_review:       { label: 'MDT Review',          icon: '👥', color: '#22d3ee' },
};

export const ENCOUNTER_PHASES: Record<string, string[]> = {
  outpatient:  ['registration','triage','presenting_complaint','hpi','systems_review','pmh','drug_allergy','social_history','examination','scores','ddx','investigations','imaging','procedures','treatment','progress','team_comm','disposition','follow_up','audit'],
  emergency:   ['registration','triage','abcde','presenting_complaint','hpi','exam','scores','ddx','investigations','imaging','treatment','disposition','follow_up'],
  inpatient:   ['registration','admission_note','hpi','pmh','exam','scores','ddx','investigations','treatment','daily_progress','multidisciplinary','discharge','follow_up'],
  ward_round:  ['handover','review','exam','scores','investigations','plan','team_comm'],
  follow_up:   ['interval_history','exam','scores','ddx','investigations','plan','next_review'],
  procedure:   ['indication','consent','pre_procedure','procedure_details','post_procedure','complications','pathology'],
  operative_note: ['pre_op_diagnosis','post_op_diagnosis','procedure','surgeons','anaesthesia','findings','specimens','complications','plan'],
  icu_review:  ['ventilation','haemodynamics','sedation','infection','nutrition','labs','plan'],
  telemedicine:['presenting_complaint','history','review_systems','exam_limited','ddx','plan','prescriptions'],
  antenatal:   ['gestational_age','vitals','weight','fundal_height','fetal_hr','screening','plan'],
  post_op:     ['recovery_status','wound','pain','drains','mobilisation','plan'],
  discharge_summary: ['admission_summary','course','discharge_diagnoses','medications','follow_up','advice'],
  referral:    ['reason','history','exam','investigations','reason_for_referral','urgency'],
  mdt_review:  ['case_summary','discussion','recommendations','action_items'],
};

export type DocumentEventType =
  | 'hpi_entered'
  | 'vitals_updated'
  | 'diagnosis_changed'
  | 'antibiotic_prescribed'
  | 'imaging_ordered'
  | 'lab_ordered'
  | 'procedure_completed'
  | 'medication_administered'
  | 'consultation_requested'
  | 'disposition_changed'
  | 'note_added'
  | 'ai_insight_generated'
  | 'team_message'
  | 'score_calculated';

export interface DocumentEvent {
  id: string;
  type: DocumentEventType;
  timestamp: number;
  actorId: string;
  actorName: string;
  actorRole: 'doctor' | 'nurse' | 'admin' | 'system';
  description: string;
  details?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'critical';
}

export interface EncounterParticipant {
  userId: string;
  name: string;
  role: string;
  department: string;
  joinedAt: number;
}

export interface Encounter {
  id: string;
  organizationId: string;
  departmentId: string;
  unitId: string;
  encounterType: EncounterType;
  patientId: string;
  patientName: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: number;
  createdBy: string;
  participants: EncounterParticipant[];
  timeline: DocumentEvent[];
  phases: Record<string, unknown>;
  aiInsights: AIInsight[];
  scores: Record<string, number>;
  diagnosis: string[];
  outcomes: Record<string, unknown>;
}

export interface AIInsight {
  id: string;
  type: 'alert' | 'suggestion' | 'differential' | 'protocol';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  acknowledged: boolean;
  source: string;
}

export interface ClinicalPathway {
  id: string;
  name: string;
  departmentKey: string;
  unitId: string;
  encounterTypes: EncounterType[];
  phases: string[];
  protocols: string[];
  alerts: string[];
  scores: { name: string; calc: string }[];
}

export const CLINICAL_PATHWAYS: ClinicalPathway[] = [
  { id: 'acute-abdomen', name: 'Acute Abdomen', departmentKey: 'SURG', unitId: 'general-surgery', encounterTypes: ['emergency','inpatient'],
    phases: ['triage','hpi','exam','scores','investigations','imaging','ddx','treatment','disposition'],
    protocols: ['WHO Emergency Triage','NICE Guidelines Acute Abdomen'], alerts: ['Peritonitis','Obstruction','Bleeding'],
    scores: [{ name:'Alvarado Score', calc:'migratory_pain+anorexia+nausea+tenderness+rebound+fever+leukocytosis' }] },
  { id: 'sepsis', name: 'Sepsis Pathway', departmentKey: 'IM', unitId: 'general-medicine', encounterTypes: ['emergency','inpatient'],
    phases: ['abcde','hpi','exam','scores','investigations','treatment','monitoring'],
    protocols: ['Surviving Sepsis Campaign','WHO Sepsis'], alerts: ['qSOFA≥2','Lactate>2','MAP<65'],
    scores: [{ name:'qSOFA', calc:'rr≥22+altered_mental+sbp≤100' },{ name:'SOFA', calc:'full_parameters' }] },
  { id: 'polytrauma', name: 'Polytrauma / ATLS', departmentKey: 'SURG', unitId: 'trauma', encounterTypes: ['emergency'],
    phases: ['abcde','hpi','exam','imaging','treatment','operative','icu'],
    protocols: ['ATLS 10th Ed','WHO Emergency Care'], alerts: ['Unstable Pelvis','Tension Pneumothorax','Cardiac Tamponade'],
    scores: [{ name:'GCS', calc:'eye+verbal+motor' },{ name:'ISS', calc:'anatomical_severity' }] },
  { id: 'severe-pneumonia', name: 'Severe Pneumonia', departmentKey: 'PAED', unitId: 'paediatric-respiratory', encounterTypes: ['emergency','inpatient'],
    phases: ['triage','abcde','hpi','exam','scores','investigations','treatment','monitoring','disposition'],
    protocols: ['WHO Integrated Management','Pocket Book Hospital Care'], alerts: ['Chest Indrawing','Hypoxia','Feeding Difficulty'],
    scores: [{ name:'Respiratory Rate', calc:'age_band_based' },{ name:'Oxygen Saturation', calc:'spo2_assessment' }] },
  { id: 'chest-pain', name: 'Chest Pain Pathway', departmentKey: 'CARD', unitId: 'general-cardiology', encounterTypes: ['emergency','outpatient'],
    phases: ['triage','hpi','exam','ecg','scores','investigations','treatment','disposition'],
    protocols: ['ESC Guidelines','NICE Chest Pain'], alerts: ['STEMI','NSTEMI','Aortic Dissection','PE'],
    scores: [{ name:'HEART Score', calc:'history+ecg+age+risk+troponin' },{ name:'TIMI', calc:'risk_factors' }] },
  { id: 'dka', name: 'DKA Protocol', departmentKey: 'ENDO', unitId: 'diabetes', encounterTypes: ['emergency','inpatient'],
    phases: ['abcde','hpi','exam','labs','treatment','monitoring'],
    protocols: ['ISPAD Guidelines','WHO DKA Protocol'], alerts: ['Cerebral Oedema','Hypokalaemia','Hypoglycaemia'],
    scores: [{ name:'DKA Severity', calc:'ph+glucose+ketones' }] },
];

export const WORKSPACE_PHASES: { id: string; label: string; icon: string; description: string }[] = [
  { id: 'registration', label: 'Registration', icon: '📋', description: 'Patient identification and registration' },
  { id: 'triage', label: 'Triage', icon: '🚦', description: 'Vital signs and acuity assessment' },
  { id: 'abcde', label: 'ABCDE Assessment', icon: '🔍', description: 'Systematic emergency assessment' },
  { id: 'presenting_complaint', label: 'Presenting Complaint', icon: '🗣️', description: 'Chief complaint in patient\'s words' },
  { id: 'hpi', label: 'History of Presenting Illness', icon: '📝', description: 'Structured HPI with timeline' },
  { id: 'systems_review', label: 'Review of Systems', icon: '🔬', description: 'Systematic review of all systems' },
  { id: 'pmh', label: 'Past Medical History', icon: '🏥', description: 'Chronic conditions, surgeries, allergies' },
  { id: 'drug_allergy', label: 'Drug & Allergy', icon: '💊', description: 'Current medications and allergies' },
  { id: 'social_history', label: 'Social History', icon: '👨‍👩‍👧', description: 'Social context, habits, support' },
  { id: 'examination', label: 'Examination', icon: '🩺', description: 'Physical examination findings' },
  { id: 'scores', label: 'Bedside Scores', icon: '📊', description: 'Clinical scoring systems' },
  { id: 'ddx', label: 'Differential Diagnosis', icon: '🧠', description: 'AI-powered differential generation' },
  { id: 'investigations', label: 'Investigations', icon: '🧪', description: 'Lab tests and results' },
  { id: 'imaging', label: 'Imaging', icon: '📡', description: 'Radiology and imaging' },
  { id: 'procedures', label: 'Procedures', icon: '🔧', description: 'Bedside procedures' },
  { id: 'treatment', label: 'Treatment', icon: '💉', description: 'Medications, fluids, interventions' },
  { id: 'progress', label: 'Progress Notes', icon: '📄', description: 'Ongoing clinical notes' },
  { id: 'team_comm', label: 'Team Communication', icon: '👥', description: 'Team discussions and handover' },
  { id: 'disposition', label: 'Disposition', icon: '🚪', description: 'Discharge, transfer, admission' },
  { id: 'follow_up', label: 'Follow-up Plan', icon: '📅', description: 'Review schedule and instructions' },
  { id: 'audit', label: 'Analytics & Audit', icon: '📈', description: 'Quality metrics and review' },
];

export type UserRole = 'doctor' | 'nurse' | 'admin';

export const ROLE_WORKSPACES: Record<UserRole, string[]> = {
  doctor: ['registration','presenting_complaint','hpi','pmh','systems_review','examination','scores','ddx','investigations','imaging','treatment','disposition'],
  nurse:  ['registration','triage','abcde','drug_allergy','examination','scores','procedures','treatment','progress','team_comm'],
  admin:  ['registration','disposition','follow_up','audit'],
};
