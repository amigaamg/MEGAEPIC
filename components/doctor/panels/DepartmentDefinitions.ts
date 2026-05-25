// ─── DEPARTMENT & PATHWAY DEFINITIONS ─────────────────────────────────────────
// Central registry for all clinical departments, their pathways, tools,
// monitoring metrics, and education topics.

export interface ToolDef {
  id: string;
  label: string;
  icon: string;
  type: 'calculator' | 'tracker' | 'assessment' | 'protocol' | 'education' | 'order' | 'screening' | 'score';
  description: string;
  demoMode?: boolean;
  opensIn?: 'modal' | 'panel' | 'fullpage';
}

export interface MonitoringMetric {
  key: string;
  label: string;
  unit: string;
  normalRange: string;
  frequency: string;
  icon: string;
  chartType?: 'line' | 'bar' | 'gauge';
}

export interface PathwayDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  colorDim: string;
  duration: string;
  category: string;
  departmentId: string;
  milestones: string[];
  tools: ToolDef[];
  monitoringMetrics?: MonitoringMetric[];
  educationTopics: string[];
  description: string;
  isActive?: boolean;
}

export interface DepartmentDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  colorDim: string;
  description: string;
  pathways: string[];
  patientCount?: number;
}

// ─── RISK & HELPER CONSTANTS ──────────────────────────────────────────────────

export const RISK_COLORS = {
  low: '#38a169', medium: '#d69e2e', high: '#e53e3e', critical: '#9b2c2c',
} as const;

export const RISK_COLORS_DIM = {
  low: 'rgba(56,161,105,0.10)',
  medium: 'rgba(214,158,46,0.10)',
  high: 'rgba(229,62,62,0.10)',
  critical: 'rgba(155,44,44,0.15)',
} as const;

export const STATUS_COLORS = {
  active: '#38a169', paused: '#d69e2e', completed: '#5a67d8', discharged: '#8fa3bd',
} as const;

export function bpCategory(s: number, d: number) {
  if (s < 120 && d < 80) return { label: 'Normal', color: '#38a169' };
  if (s < 130 && d < 80) return { label: 'Elevated', color: '#d69e2e' };
  if (s < 140 || d < 90) return { label: 'Stage 1 HTN', color: '#dd6b20' };
  return { label: 'Stage 2 HTN', color: '#e53e3e' };
}

export function fmtDate(ts: any) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateTime(ts: any) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtTime(ts: any) {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────────

export const DEPARTMENTS: DepartmentDef[] = [
  // ── GENERAL / OPD ──
  { id: 'general_opd', label: 'General OPD', icon: '🏥', color: '#0F766E', colorDim: 'rgba(15,118,110,0.08)',
    description: 'Primary care & general outpatient consultations', pathways: ['general_checkup', 'acute_fever', 'immunization'] },
  { id: 'internal_medicine', label: 'Internal Medicine', icon: '🫀', color: '#5a67d8', colorDim: 'rgba(90,103,216,0.08)',
    description: 'Adult medical conditions — acute & chronic', pathways: ['hypertension', 'diabetes_t2', 'ckd', 'asthma', 'copd', 'thyroid_disorders', 'dyslipidemia', 'anemia', 'gout', 'electrolyte'] },
  { id: 'cardiology', label: 'Cardiology', icon: '❤️', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    description: 'Cardiovascular disease management', pathways: ['hypertension', 'heart_failure', 'cad', 'afib', 'dyslipidemia', 'valvular'] },
  { id: 'endocrinology', label: 'Endocrinology', icon: '🍬', color: '#d69e2e', colorDim: 'rgba(214,158,46,0.08)',
    description: 'Hormonal & metabolic disorders', pathways: ['diabetes_t2', 'diabetes_t1', 'thyroid_disorders', 'osteoporosis', 'adrenal'] },
  { id: 'nephrology', label: 'Nephrology', icon: '🫘', color: '#3182ce', colorDim: 'rgba(49,130,206,0.08)',
    description: 'Kidney disease & hypertension', pathways: ['ckd', 'hypertension', 'dialysis', 'glomerulonephritis', 'uti'] },
  { id: 'pulmonology', label: 'Pulmonology', icon: '🫁', color: '#38a169', colorDim: 'rgba(56,161,105,0.08)',
    description: 'Respiratory & lung conditions', pathways: ['asthma', 'copd', 'tb', 'pneumonia', 'sleep_apnea', 'pulmonary_htn'] },
  { id: 'neurology', label: 'Neurology', icon: '🧠', color: '#7c3aed', colorDim: 'rgba(124,58,237,0.08)',
    description: 'Neurological disorders & stroke', pathways: ['stroke_rehab', 'epilepsy', 'migraine', 'parkinsons', 'dementia'] },

  // ── SURGICAL ──
  { id: 'general_surgery', label: 'General Surgery', icon: '🔪', color: '#dd6b20', colorDim: 'rgba(221,107,32,0.08)',
    description: 'Pre & post-operative surgical care', pathways: ['pre_op', 'post_op', 'wound_care', 'hernia'] },
  { id: 'orthopedics', label: 'Orthopedics', icon: '🦴', color: '#d69e2e', colorDim: 'rgba(214,158,46,0.08)',
    description: 'Bone, joint & musculoskeletal conditions', pathways: ['fracture', 'osteoarthritis', 'back_pain', 'joint_replacement'] },
  { id: 'urology', label: 'Urology', icon: '🚹', color: '#3b82f6', colorDim: 'rgba(59,130,246,0.08)',
    description: 'Urinary tract & male reproductive health', pathways: ['uti', 'bph', 'kidney_stones', 'incontinence'] },

  // ── WOMEN'S HEALTH ──
  { id: 'obgyn', label: 'Obstetrics & Gynaecology', icon: '🤰', color: '#d53f8c', colorDim: 'rgba(213,63,140,0.08)',
    description: 'Pregnancy, childbirth & women\'s health', pathways: ['antenatal', 'postnatal', 'pcos', 'menopause', 'cervical_cancer', 'contraception'] },

  // ── CHILDREN ──
  { id: 'pediatrics', label: 'Pediatrics', icon: '👶', color: '#38a169', colorDim: 'rgba(56,161,105,0.08)',
    description: 'Child & adolescent health', pathways: ['well_child', 'immunization', 'asthma_ped', 'malnutrition', 'neonatal'] },
  { id: 'neonatology', label: 'Neonatology', icon: '🍼', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    description: 'Newborn & neonatal intensive care', pathways: ['neonatal', 'preterm', 'jaundice', 'nicu_followup'] },

  // ── SPECIALTY ──
  { id: 'psychiatry', label: 'Psychiatry', icon: '🧘', color: '#805ad5', colorDim: 'rgba(128,90,213,0.08)',
    description: 'Mental health & psychiatric conditions', pathways: ['depression', 'anxiety', 'bipolar', 'schizophrenia', 'substance_abuse'] },
  { id: 'infectious_disease', label: 'Infectious Disease', icon: '🦠', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    description: 'Infectious disease management', pathways: ['hiv', 'tb', 'hepatitis', 'covid', 'sepsis'] },
  { id: 'oncology', label: 'Oncology', icon: '🎗️', color: '#9b2c2c', colorDim: 'rgba(155,44,44,0.08)',
    description: 'Cancer care & chemotherapy monitoring', pathways: ['cancer_screening', 'chemo_monitoring', 'palliative', 'breast_cancer'] },
  { id: 'emergency', label: 'Emergency Medicine', icon: '🚑', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    description: 'Acute & emergency care', pathways: ['acute_chest', 'acute_abdomen', 'acute_stroke', 'acute_asthma', 'trauma', 'sepsis'] },
  { id: 'geriatrics', label: 'Geriatrics', icon: '👴', color: '#718096', colorDim: 'rgba(113,128,150,0.08)',
    description: 'Elderly care & age-related conditions', pathways: ['dementia', 'falls_prevention', 'polymedication', 'palliative'] },
  { id: 'palliative', label: 'Palliative Care', icon: '🌅', color: '#a0aec0', colorDim: 'rgba(160,174,192,0.08)',
    description: 'End-of-life & symptom management', pathways: ['palliative', 'pain_management'] },
  { id: 'ophthalmology', label: 'Ophthalmology', icon: '👁️', color: '#2b6cb0', colorDim: 'rgba(43,108,176,0.08)',
    description: 'Eye conditions & vision care', pathways: ['glaucoma', 'cataract', 'diabetic_eye', 'refractive'] },
  { id: 'ent', label: 'ENT', icon: '👂', color: '#2c7a7b', colorDim: 'rgba(44,122,123,0.08)',
    description: 'Ear, nose & throat conditions', pathways: ['otitis', 'sinusitis', 'tonsillitis', 'hearing_loss'] },
  { id: 'dermatology', label: 'Dermatology', icon: '🧴', color: '#b83280', colorDim: 'rgba(184,50,128,0.08)',
    description: 'Skin conditions & allergies', pathways: ['eczema', 'psoriasis', 'acne', 'skin_cancer', 'allergy'] },
  { id: 'rheumatology', label: 'Rheumatology', icon: '🦵', color: '#6b46c1', colorDim: 'rgba(107,70,193,0.08)',
    description: 'Autoimmune & inflammatory conditions', pathways: ['rheumatoid', 'lupus', 'gout', 'vasculitis'] },
  { id: 'gastroenterology', label: 'Gastroenterology', icon: '🫃', color: '#d69e2e', colorDim: 'rgba(214,158,46,0.08)',
    description: 'Digestive system & liver conditions', pathways: ['gerd', 'ibs', 'hepatitis', 'cirrhosis', 'pancreatitis', 'nutrition'] },
  { id: 'hematology', label: 'Hematology', icon: '🩸', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    description: 'Blood disorders & transfusion', pathways: ['anemia', 'sickle_cell', 'coagulation', 'transfusion'] },
  { id: 'inpatient', label: 'Inpatient Wards', icon: '🛏️', color: '#4a5568', colorDim: 'rgba(74,85,104,0.08)',
    description: 'Admitted patients — ward round management', pathways: ['inpatient_general', 'inpatient_icu', 'inpatient_rounds'] },
  { id: 'rehabilitation', label: 'Rehabilitation', icon: '💪', color: '#38a169', colorDim: 'rgba(56,161,105,0.08)',
    description: 'Physical therapy & functional recovery', pathways: ['stroke_rehab', 'post_op_rehab', 'cardiac_rehab', 'pulmonary_rehab'] },
];

// ─── ALL PATHWAYS ─────────────────────────────────────────────────────────────

export const ALL_PATHWAYS: PathwayDef[] = [
  // ── CARDIOVASCULAR ──
  {
    id: 'hypertension', label: 'Hypertension Care', icon: '❤️', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    duration: 'Lifelong', category: 'Cardiovascular', departmentId: 'cardiology',
    description: 'Structured hypertension management from diagnosis to maintenance',
    milestones: ['Baseline assessment & risk stratification', 'Initiate antihypertensive therapy', 'First follow-up (4 weeks)', 'BP target achieved (<130/80)', 'Stable — 3-monthly review', 'Annual complication screening'],
    tools: [
      { id: 'bp_trend', label: 'BP Trend Chart', icon: '📈', type: 'tracker', description: 'Track blood pressure over time with classification', opensIn: 'panel' },
      { id: 'cv_risk', label: 'CV Risk (Framingham)', icon: '🧮', type: 'calculator', description: '10-year cardiovascular risk assessment', opensIn: 'modal' },
      { id: 'chads2', label: 'CHA₂DS₂-VASc Score', icon: '🧮', type: 'calculator', description: 'Stroke risk in atrial fibrillation', opensIn: 'modal' },
      { id: 'antihtn_protocol', label: 'Antihypertensive Protocol', icon: '📋', type: 'protocol', description: 'Stepwise medication protocol by stage', opensIn: 'panel' },
      { id: 'target_tracker', label: 'BP Target Achievement', icon: '🎯', type: 'tracker', description: 'Monitor if patient is at goal', opensIn: 'panel' },
      { id: 'adherence_monitor', label: 'Medication Adherence', icon: '💊', type: 'tracker', description: 'Track medication compliance', opensIn: 'panel' },
      { id: 'order_renal', label: 'Order Renal Function Panel', icon: '🧪', type: 'order', description: 'Creatinine, eGFR, electrolytes', opensIn: 'modal' },
      { id: 'order_echo', label: 'Request ECG / Echo', icon: '🩻', type: 'order', description: 'Cardiac imaging & rhythm strip', opensIn: 'modal' },
      { id: 'bp_home_monitor', label: 'Home BP Monitoring Guide', icon: '🏠', type: 'education', description: 'Teach patient to monitor at home', opensIn: 'panel' },
      { id: 'htn_severity', label: 'HTN Severity Staging', icon: '📊', type: 'assessment', description: 'Stage HTN by BP level', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<130/80', frequency: 'Every visit', icon: '❤️', chartType: 'line' },
      { key: 'pulse', label: 'Heart Rate', unit: 'bpm', normalRange: '60–100', frequency: 'Every visit', icon: '💓', chartType: 'line' },
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'BMI <25', frequency: 'Monthly', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Understanding blood pressure numbers', 'Salt restriction and DASH diet', 'Physical activity guidelines', 'Medication adherence importance', 'Recognising hypertensive emergency symptoms', 'Home blood pressure monitoring', 'Alcohol & smoking cessation'],
  },
  {
    id: 'heart_failure', label: 'Heart Failure Management', icon: '💔', color: '#c53030', colorDim: 'rgba(197,48,48,0.08)',
    duration: 'Lifelong', category: 'Cardiovascular', departmentId: 'cardiology',
    description: 'HFrEF & HFpEF management with diuresis, GDMT & monitoring',
    milestones: ['Diagnosis (echo BNP)', 'Initiate GDMT', 'Volume status optimization', 'Device therapy evaluation', 'Stable maintenance phase', 'Decompensation prevention'],
    tools: [
      { id: 'bnp_tracker', label: 'BNP / NT-proBNP Trend', icon: '📈', type: 'tracker', description: 'Track BNP over time', opensIn: 'panel' },
      { id: 'hf_protocol', label: 'HF GDMT Protocol', icon: '📋', type: 'protocol', description: 'Guideline-directed medical therapy', opensIn: 'panel' },
      { id: 'fluid_balance', label: 'Fluid Balance Tracker', icon: '🌊', type: 'tracker', description: 'Input/output monitoring', opensIn: 'panel' },
      { id: 'weight_tracker', label: 'Daily Weight Tracker', icon: '⚖️', type: 'tracker', description: 'Daily weight for fluid status', opensIn: 'panel' },
      { id: 'nyha_class', label: 'NYHA Functional Class', icon: '📊', type: 'assessment', description: 'Functional capacity assessment', opensIn: 'modal' },
      { id: 'order_echo', label: 'Order Echocardiogram', icon: '🩻', type: 'order', description: 'LVEF assessment', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'weight', label: 'Daily Weight', unit: 'kg', normalRange: 'Stable ±1kg', frequency: 'Daily', icon: '⚖️', chartType: 'line' },
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<130/80', frequency: 'Every visit', icon: '❤️', chartType: 'line' },
      { key: 'pulse', label: 'Heart Rate', unit: 'bpm', normalRange: '60–100', frequency: 'Every visit', icon: '💓', chartType: 'line' },
    ],
    educationTopics: ['Understanding heart failure', 'Daily weight monitoring', 'Low sodium diet', 'Medication adherence', 'Recognising worsening symptoms', 'When to seek emergency care'],
  },
  {
    id: 'cad', label: 'Coronary Artery Disease', icon: '🫀', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    duration: 'Lifelong', category: 'Cardiovascular', departmentId: 'cardiology',
    description: 'Stable angina, post-MI care & secondary prevention',
    milestones: ['Diagnosis & risk assessment', 'Anti-anginal therapy', 'Revascularization decision', 'Post-MI care', 'Cardiac rehabilitation', 'Secondary prevention maintenance'],
    tools: [
      { id: 'angina_tracker', label: 'Angina Symptom Log', icon: '📝', type: 'tracker', description: 'Track chest pain episodes', opensIn: 'panel' },
      { id: 'cad_risk', label: 'CAD Risk Calculator', icon: '🧮', type: 'calculator', description: 'ASCVD risk score', opensIn: 'modal' },
      { id: 'antiplatelet', label: 'Antiplatelet Protocol', icon: '📋', type: 'protocol', description: 'DAPT vs SAPT guidance', opensIn: 'panel' },
      { id: 'order_lipid', label: 'Order Lipid Panel', icon: '🧪', type: 'order', description: 'Fasting lipid profile', opensIn: 'modal' },
      { id: 'order_ecg', label: 'Request ECG', icon: '🩻', type: 'order', description: '12-lead ECG', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<130/80', frequency: 'Every visit', icon: '❤️', chartType: 'line' },
      { key: 'pulse', label: 'Heart Rate', unit: 'bpm', normalRange: '55–65', frequency: 'Every visit', icon: '💓', chartType: 'line' },
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'BMI <25', frequency: 'Monthly', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Understanding coronary artery disease', 'Chest pain action plan', 'Heart-healthy diet', 'Exercise after heart attack', 'Medication adherence', 'Smoking cessation resources'],
  },
  {
    id: 'dyslipidemia', label: 'Dyslipidemia', icon: '🧈', color: '#dd6b20', colorDim: 'rgba(221,107,32,0.08)',
    duration: 'Lifelong', category: 'Cardiovascular', departmentId: 'endocrinology',
    description: 'Cholesterol & triglyceride management',
    milestones: ['Baseline lipid panel', 'Initiate statin therapy', '3-month lipid review', 'Lipid targets achieved', 'Stable annual monitoring', 'Complication screening'],
    tools: [
      { id: 'lipid_trend', label: 'Lipid Trend Chart', icon: '📈', type: 'tracker', description: 'Track LDL, HDL, TG over time', opensIn: 'panel' },
      { id: 'ascvd_risk', label: 'ASCVD Risk Calculator', icon: '🧮', type: 'calculator', description: '10-year & lifetime risk', opensIn: 'modal' },
      { id: 'statin_protocol', label: 'Statin Intensity Protocol', icon: '📋', type: 'protocol', description: 'High/moderate/low intensity', opensIn: 'panel' },
      { id: 'order_lipid', label: 'Order Lipid Panel', icon: '🧪', type: 'order', description: 'Fasting lipid profile', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'ldl', label: 'LDL Cholesterol', unit: 'mmol/L', normalRange: '<2.6 (<1.8 high risk)', frequency: 'Every 3-6 months', icon: '🩸', chartType: 'line' },
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'BMI <25', frequency: 'Monthly', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Understanding cholesterol numbers', 'Dietary fat management', 'Statin benefits & side effects', 'Exercise for lipid control', 'Medication adherence', 'Heart-healthy cooking'],
  },
  {
    id: 'afib', label: 'Atrial Fibrillation', icon: '💓', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    duration: 'Lifelong', category: 'Cardiovascular', departmentId: 'cardiology',
    description: 'Rate/rhythm control & stroke prevention in AF',
    milestones: ['Diagnosis confirmation (ECG)', 'Stroke risk assessment (CHA₂DS₂-VASc)', 'Initiate anticoagulation', 'Rate/rhythm control strategy', 'Stable monitoring', 'Annual review'],
    tools: [
      { id: 'chads2', label: 'CHA₂DS₂-VASc Score', icon: '🧮', type: 'calculator', description: 'Stroke risk score', opensIn: 'modal' },
      { id: 'has_bled', label: 'HAS-BLED Score', icon: '🧮', type: 'calculator', description: 'Bleeding risk assessment', opensIn: 'modal' },
      { id: 'inr_tracker', label: 'INR/Warfarin Tracker', icon: '📈', type: 'tracker', description: 'INR monitoring log', opensIn: 'panel' },
      { id: 'doac_protocol', label: 'DOAC Dosing Protocol', icon: '📋', type: 'protocol', description: 'Apixaban, rivaroxaban, etc.', opensIn: 'panel' },
      { id: 'order_ecg', label: 'Request ECG / Holter', icon: '🩻', type: 'order', description: 'Rhythm monitoring', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'pulse', label: 'Heart Rate', unit: 'bpm', normalRange: '<110 (rate control)', frequency: 'Every visit', icon: '💓', chartType: 'line' },
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<140/90', frequency: 'Every visit', icon: '❤️', chartType: 'line' },
    ],
    educationTopics: ['Understanding atrial fibrillation', 'Anticoagulation & stroke prevention', 'Recognising AF symptoms', 'Medication adherence', 'When to seek emergency care', 'Lifestyle modification'],
  },
  {
    id: 'valvular', label: 'Valvular Heart Disease', icon: '🫀', color: '#c53030', colorDim: 'rgba(197,48,48,0.08)',
    duration: 'Lifelong', category: 'Cardiovascular', departmentId: 'cardiology',
    description: 'Aortic/mitral valve disease surveillance & intervention',
    milestones: ['Diagnosis & severity grading', 'Medical management', 'Surgical referral decision', 'Valve intervention', 'Post-procedure follow-up', 'Long-term surveillance'],
    tools: [
      { id: 'valve_protocol', label: 'Valve Disease Protocol', icon: '📋', type: 'protocol', description: 'AHA/ACC valve guidelines', opensIn: 'panel' },
      { id: 'ie_prophylaxis', label: 'IE Prophylaxis Guide', icon: '🦠', type: 'protocol', description: 'Infective endocarditis prophylaxis', opensIn: 'panel' },
      { id: 'order_echo', label: 'Order Echocardiogram', icon: '🩻', type: 'order', description: 'TTE/TEE for valve assessment', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: 'Individualized', frequency: 'Every visit', icon: '❤️', chartType: 'line' },
    ],
    educationTopics: ['Understanding valve disease', 'Monitoring for symptoms', 'Antibiotic prophylaxis', 'Surgical options', 'Follow-up schedule'],
  },

  // ── METABOLIC / ENDOCRINE ──
  {
    id: 'diabetes_t2', label: 'Type 2 Diabetes', icon: '🍬', color: '#d69e2e', colorDim: 'rgba(214,158,46,0.08)',
    duration: 'Lifelong', category: 'Metabolic', departmentId: 'endocrinology',
    description: 'Comprehensive T2DM care with glycemic control & complication prevention',
    milestones: ['Diagnosis confirmation + baseline HbA1c', 'Initiate Metformin + lifestyle counselling', 'HbA1c review at 3 months', 'HbA1c < 7% achieved', 'Complications screening initiated', 'Annual comprehensive review'],
    tools: [
      { id: 'hba1c_trend', label: 'HbA1c Trend', icon: '📈', type: 'tracker', description: 'Track HbA1c over time', opensIn: 'panel' },
      { id: 'glucose_log', label: 'Glucose Log', icon: '🩸', type: 'tracker', description: 'Daily blood glucose readings', opensIn: 'panel' },
      { id: 'insulin_dose', label: 'Insulin Dose Tracker', icon: '💉', type: 'tracker', description: 'Insulin titration & dosing', opensIn: 'panel' },
      { id: 'foot_exam', label: 'Foot Examination Score', icon: '🦶', type: 'assessment', description: 'Diabetic foot risk assessment', opensIn: 'modal' },
      { id: 'retinopathy', label: 'Retinopathy Status', icon: '👁️', type: 'assessment', description: 'Retinal exam findings', opensIn: 'modal' },
      { id: 'dm_nephropathy', label: 'Renal Function (DM Nephropathy)', icon: '🫘', type: 'tracker', description: 'eGFR & albuminuria tracking', opensIn: 'panel' },
      { id: 'adherence_monitor', label: 'Medication Adherence', icon: '💊', type: 'tracker', description: 'Track medication compliance', opensIn: 'panel' },
      { id: 'order_hba1c', label: 'Order HbA1c + Lipid Panel', icon: '🧪', type: 'order', description: 'Comprehensive metabolic panel', opensIn: 'modal' },
      { id: 'order_fundoscopy', label: 'Refer for Fundoscopy', icon: '👁️', type: 'order', description: 'Diabetic retinopathy screening', opensIn: 'modal' },
      { id: 'carb_counting', label: 'Carb Counting Guide', icon: '🍞', type: 'education', description: 'Patient education on carbs', opensIn: 'panel' },
    ],
    monitoringMetrics: [
      { key: 'glucose', label: 'Blood Glucose', unit: 'mmol/L', normalRange: '4.0–7.0 (fasting)', frequency: 'Daily (self)', icon: '🩸', chartType: 'line' },
      { key: 'hba1c', label: 'HbA1c', unit: '%', normalRange: '<7.0', frequency: 'Every 3 months', icon: '📊', chartType: 'line' },
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<130/80', frequency: 'Every visit', icon: '❤️', chartType: 'line' },
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'Target BMI <25', frequency: 'Monthly', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Understanding diabetes and HbA1c', 'Carbohydrate counting and glycaemic index', 'Self-monitoring of blood glucose', 'Sick day rules for diabetics', 'Hypoglycaemia recognition and management', 'Foot care and complication prevention', 'Healthy eating plate method', 'Physical activity guidelines'],
  },
  {
    id: 'diabetes_t1', label: 'Type 1 Diabetes', icon: '💉', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    duration: 'Lifelong', category: 'Metabolic', departmentId: 'endocrinology',
    description: 'Insulin-dependent diabetes management',
    milestones: ['New diagnosis stabilization', 'Insulin regimen establishment', 'Carbohydrate counting training', 'HbA1c < 7.5% achieved', 'Complication screening', 'Annual review + pump eval'],
    tools: [
      { id: 'hba1c_trend', label: 'HbA1c Trend', icon: '📈', type: 'tracker', description: 'Track HbA1c', opensIn: 'panel' },
      { id: 'glucose_log', label: 'CGM / Glucose Log', icon: '📱', type: 'tracker', description: 'Continuous glucose data', opensIn: 'panel' },
      { id: 'insulin_dose', label: 'Insulin Dose Calculator', icon: '💉', type: 'calculator', description: 'Bolus & basal dosing', opensIn: 'modal' },
      { id: 'dka_protocol', label: 'DKA Management Protocol', icon: '🚨', type: 'protocol', description: 'DKA treatment algorithm', opensIn: 'panel' },
      { id: 'order_cgm', label: 'Prescribe CGM', icon: '📱', type: 'order', description: 'Continuous glucose monitor', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'glucose', label: 'Blood Glucose', unit: 'mmol/L', normalRange: '4.0–10.0', frequency: 'Multiple daily', icon: '🩸', chartType: 'line' },
      { key: 'hba1c', label: 'HbA1c', unit: '%', normalRange: '<7.5', frequency: 'Every 3 months', icon: '📊', chartType: 'line' },
    ],
    educationTopics: ['Understanding T1D vs T2D', 'Carbohydrate counting', 'Insulin injection technique', 'Hypoglycemia management', 'Sick day rules', 'CGM interpretation'],
  },
  {
    id: 'thyroid_disorders', label: 'Thyroid Disorders', icon: '🦋', color: '#805ad5', colorDim: 'rgba(128,90,213,0.08)',
    duration: 'Lifelong', category: 'Endocrine', departmentId: 'endocrinology',
    description: 'Hypothyroidism, hyperthyroidism & thyroid nodule management',
    milestones: ['Diagnosis with TSH/FT4', 'Initiate treatment', 'Euthyroid state achieved', 'Stable maintenance dosing', 'Annual monitoring', 'Complication screening'],
    tools: [
      { id: 'tsh_tracker', label: 'TSH Trend Tracker', icon: '📈', type: 'tracker', description: 'Track TSH levels over time', opensIn: 'panel' },
      { id: 'thyroid_ultrasound', label: 'Thyroid Nodule Protocol', icon: '🩻', type: 'protocol', description: 'TIRADS & biopsy guidance', opensIn: 'panel' },
      { id: 'order_thyroid', label: 'Order Thyroid Function', icon: '🧪', type: 'order', description: 'TSH, FT4, FT3, antibodies', opensIn: 'modal' },
      { id: 'order_ultrasound', label: 'Order Thyroid US', icon: '🩻', type: 'order', description: 'Thyroid ultrasound', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'tsh', label: 'TSH', unit: 'mIU/L', normalRange: '0.4–4.0', frequency: 'Every 6-8 weeks until stable', icon: '🦋', chartType: 'line' },
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'Stable', frequency: 'Monthly', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Understanding thyroid function', 'Medication adherence (levothyroxine)', 'Recognising hypo/hyper symptoms', 'Diet and thyroid health', 'Follow-up blood test schedule'],
  },
  {
    id: 'osteoporosis', label: 'Osteoporosis', icon: '🦴', color: '#a0aec0', colorDim: 'rgba(160,174,192,0.08)',
    duration: 'Lifelong', category: 'Endocrine', departmentId: 'endocrinology',
    description: 'Bone density management & fracture prevention',
    milestones: ['DEXA scan & FRAX assessment', 'Initiate bone protective therapy', 'Fall risk assessment', '3-year DEXA follow-up', 'Stable maintenance', 'Fracture prevention review'],
    tools: [
      { id: 'frax', label: 'FRAX Score Calculator', icon: '🧮', type: 'calculator', description: '10-year fracture risk', opensIn: 'modal' },
      { id: 'fall_risk', label: 'Fall Risk Assessment', icon: '⚠️', type: 'assessment', description: 'Morse or STRATIFY scale', opensIn: 'modal' },
      { id: 'order_dexa', label: 'Order DEXA Scan', icon: '🩻', type: 'order', description: 'Dual-energy X-ray absorptiometry', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'Stable', frequency: 'Monthly', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Understanding bone density', 'Calcium & vitamin D intake', 'Fall prevention at home', 'Weight-bearing exercise', 'Medication for bone health'],
  },

  // ── RESPIRATORY ──
  {
    id: 'asthma', label: 'Asthma Management', icon: '🫁', color: '#38a169', colorDim: 'rgba(56,161,105,0.08)',
    duration: 'Lifelong', category: 'Respiratory', departmentId: 'pulmonology',
    description: 'Stepwise asthma control with inhaler therapy & action plans',
    milestones: ['Diagnosis confirmation (spirometry)', 'Inhaler start & education', 'Step-up/step-down review', 'Asthma action plan', 'Peak flow monitoring', '3-month control check'],
    tools: [
      { id: 'act_score', label: 'Asthma Control Test (ACT)', icon: '📝', type: 'assessment', description: '5-question control assessment', opensIn: 'modal' },
      { id: 'peak_flow', label: 'Peak Flow Tracker', icon: '📈', type: 'tracker', description: 'Peak expiratory flow monitoring', opensIn: 'panel' },
      { id: 'inhaler_check', label: 'Inhaler Technique Check', icon: '💨', type: 'assessment', description: 'Step-by-step inhaler use', opensIn: 'modal' },
      { id: 'asthma_action', label: 'Asthma Action Plan Builder', icon: '📋', type: 'protocol', description: 'Personalized action plan', opensIn: 'panel' },
      { id: 'stepwise_protocol', label: 'GINA Stepwise Protocol', icon: '📋', type: 'protocol', description: 'Step 1-5 treatment algorithm', opensIn: 'panel' },
      { id: 'order_spirometry', label: 'Order Spirometry', icon: '🫁', type: 'order', description: 'PFT with bronchodilator', opensIn: 'modal' },
      { id: 'order_ige', label: 'Order IgE / Allergy', icon: '🧪', type: 'order', description: 'Allergy workup', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'peak_flow', label: 'Peak Flow', unit: 'L/min', normalRange: '>80% personal best', frequency: 'Daily', icon: '💨', chartType: 'line' },
      { key: 'act', label: 'ACT Score', unit: '/25', normalRange: '>20 (controlled)', frequency: 'Every visit', icon: '📝', chartType: 'bar' },
    ],
    educationTopics: ['Understanding asthma triggers', 'Inhaler technique (MDI vs DPI)', 'Asthma action plan usage', 'Peak flow monitoring', 'When to seek emergency care', 'Allergen avoidance', 'Smoking cessation'],
  },
  {
    id: 'copd', label: 'COPD Management', icon: '🫁', color: '#dd6b20', colorDim: 'rgba(221,107,32,0.08)',
    duration: 'Lifelong', category: 'Respiratory', departmentId: 'pulmonology',
    description: 'Chronic obstructive pulmonary disease — exacerbation prevention & function',
    milestones: ['Diagnosis (spirometry GOLD)', 'Initiate bronchodilators', 'Exacerbation prevention plan', 'Pulmonary rehabilitation', 'Oxygen assessment', 'Advanced care planning'],
    tools: [
      { id: 'gold_staging', label: 'GOLD Staging (FEV1)', icon: '📊', type: 'assessment', description: 'GOLD 1-4 classification', opensIn: 'modal' },
      { id: 'cat_score', label: 'CAT Score', icon: '📝', type: 'assessment', description: 'COPD assessment test', opensIn: 'modal' },
      { id: 'mrc_dyspnea', label: 'mMRC Dyspnea Scale', icon: '🌬️', type: 'assessment', description: 'Breathlessness grading', opensIn: 'modal' },
      { id: 'o2_saturation', label: 'O₂ Saturation Tracker', icon: '🫧', type: 'tracker', description: 'SpO₂ monitoring', opensIn: 'panel' },
      { id: 'order_pft', label: 'Order Pulmonary Function', icon: '🫁', type: 'order', description: 'Spirometry + DLCO', opensIn: 'modal' },
      { id: 'order_o2', label: 'Order Home Oxygen', icon: '🫧', type: 'order', description: 'LTOT assessment', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'o2_saturation', label: 'SpO₂', unit: '%', normalRange: '>92%', frequency: 'Daily', icon: '🫧', chartType: 'line' },
      { key: 'peak_flow', label: 'FEV1', unit: '% predicted', normalRange: '>80%', frequency: 'Every 6 months', icon: '💨', chartType: 'line' },
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'Stable', frequency: 'Monthly', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Understanding COPD', 'Inhaler technique', 'Pulmonary rehabilitation', 'Oxygen therapy at home', 'Exacerbation action plan', 'Smoking cessation', 'Energy conservation techniques'],
  },
  {
    id: 'tb', label: 'TB Treatment', icon: '🦠', color: '#dd6b20', colorDim: 'rgba(221,107,32,0.08)',
    duration: '6-12 months', category: 'Infectious Disease', departmentId: 'infectious_disease',
    description: 'DOTS-based TB treatment with monitoring & adverse effect management',
    milestones: ['Diagnosis & registration (GeneXpert)', 'Intensive phase initiation', '2-month sputum conversion', 'Continuation phase start', '5-month treatment review', 'Treatment completion + cure'],
    tools: [
      { id: 'tb_symptom', label: 'TB Symptom Screening', icon: '🔍', type: 'screening', description: 'WHO TB symptom screen', opensIn: 'modal' },
      { id: 'dots_tracker', label: 'DOT Adherence Tracker', icon: '✅', type: 'tracker', description: 'Directly observed therapy log', opensIn: 'panel' },
      { id: 'tb_protocol', label: 'TB Treatment Protocol', icon: '📋', type: 'protocol', description: 'Intensive & continuation phase', opensIn: 'panel' },
      { id: 'mdr_tb', label: 'MDR-TB Protocol', icon: '⚠️', type: 'protocol', description: 'Multi-drug resistant TB', opensIn: 'panel' },
      { id: 'order_sputum', label: 'Order Sputum AFB/Culture', icon: '🧪', type: 'order', description: 'Acid-fast bacilli smear', opensIn: 'modal' },
      { id: 'order_xpert', label: 'Order GeneXpert', icon: '🧪', type: 'order', description: 'MTB/RIF assay', opensIn: 'modal' },
      { id: 'contact_tracing', label: 'Contact Tracing Log', icon: '👥', type: 'tracker', description: 'Track TB contacts', opensIn: 'panel' },
    ],
    monitoringMetrics: [
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'Gaining', frequency: 'Monthly', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Understanding TB transmission', 'DOT & treatment adherence', 'Managing medication side effects', 'Infection control at home', 'Nutrition during TB treatment', 'Follow-up sputum testing'],
  },
  {
    id: 'pneumonia', label: 'Pneumonia Care', icon: '🫁', color: '#3182ce', colorDim: 'rgba(49,130,206,0.08)',
    duration: '7-14 days', category: 'Respiratory', departmentId: 'pulmonology',
    description: 'Community-acquired pneumonia management',
    milestones: ['Diagnosis & severity (CURB-65)', 'Initiate antibiotics', 'De-escalation / response check', 'Switch to oral', 'Treatment completion', 'Follow-up chest X-ray'],
    tools: [
      { id: 'curb65', label: 'CURB-65 Score', icon: '🧮', type: 'calculator', description: 'Pneumonia severity score', opensIn: 'modal' },
      { id: 'abx_guide', label: 'Antibiotic Decision Guide', icon: '💊', type: 'protocol', description: 'Empiric abx by setting', opensIn: 'panel' },
      { id: 'order_cxr', label: 'Order Chest X-Ray', icon: '🩻', type: 'order', description: 'Chest radiograph PA/lat', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'o2_saturation', label: 'SpO₂', unit: '%', normalRange: '>94%', frequency: 'Daily', icon: '🫧', chartType: 'line' },
      { key: 'temperature', label: 'Temperature', unit: '°C', normalRange: '<37.5', frequency: 'Daily', icon: '🌡️', chartType: 'line' },
    ],
    educationTopics: ['Understanding pneumonia', 'Completing antibiotic course', 'Warning signs of worsening', 'Deep breathing exercises', 'Follow-up chest X-ray'],
  },

  // ── NEPHROLOGY ──
  {
    id: 'ckd', label: 'CKD Management', icon: '🫘', color: '#5a67d8', colorDim: 'rgba(90,103,216,0.08)',
    duration: 'Lifelong', category: 'Nephrology', departmentId: 'nephrology',
    description: 'Chronic kidney disease — staging, BP control & dialysis preparation',
    milestones: ['CKD staging (KDIGO) + baseline bloods', 'Identify and treat underlying cause', 'Initiate RAAS blockade if indicated', 'Dialysis preparation assessment', 'Specialist nephrology referral', 'Transplant evaluation'],
    tools: [
      { id: 'gfr_trend', label: 'GFR Trending', icon: '📈', type: 'tracker', description: 'eGFR over time with slope', opensIn: 'panel' },
      { id: 'ckd_staging', label: 'CKD Staging (KDIGO)', icon: '🏷️', type: 'assessment', description: 'G1-G5 with ACR', opensIn: 'modal' },
      { id: 'electrolyte_monitor', label: 'Electrolyte Monitor', icon: '⚗️', type: 'tracker', description: 'Na, K, Ca, PO4, HCO3', opensIn: 'panel' },
      { id: 'dialysis_log', label: 'Dialysis Session Log', icon: '💧', type: 'tracker', description: 'HD/PD session tracking', opensIn: 'panel' },
      { id: 'fluid_balance', label: 'Fluid Balance Tracker', icon: '🌊', type: 'tracker', description: 'Input/output monitoring', opensIn: 'panel' },
      { id: 'anemia_mgmt', label: 'Anemia in CKD Protocol', icon: '🩸', type: 'protocol', description: 'ESA & iron management', opensIn: 'panel' },
      { id: 'order_renal', label: 'Order Renal Panel + eGFR', icon: '🧪', type: 'order', description: 'Comprehensive renal function', opensIn: 'modal' },
      { id: 'order_urine_acr', label: 'Order Urine ACR', icon: '🧪', type: 'order', description: 'Albumin-to-creatinine ratio', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'creatinine', label: 'Creatinine / eGFR', unit: 'μmol/L / mL/min', normalRange: 'eGFR >60', frequency: 'Every 3 months', icon: '🫘', chartType: 'line' },
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<130/80', frequency: 'Every visit', icon: '❤️', chartType: 'line' },
      { key: 'weight', label: 'Dry Weight', unit: 'kg', normalRange: 'Stable', frequency: 'Weekly', icon: '⚖️', chartType: 'line' },
      { key: 'potassium', label: 'Potassium', unit: 'mmol/L', normalRange: '3.5–5.5', frequency: 'Monthly', icon: '⚗️', chartType: 'line' },
    ],
    educationTopics: ['Understanding kidney function and GFR', 'Dietary protein and potassium restriction', 'Fluid management in CKD', 'Avoiding nephrotoxic medications (NSAIDs)', 'When to expect dialysis', 'Transplant evaluation process', 'Phosphate binder medication'],
  },
  {
    id: 'dialysis', label: 'Dialysis Care', icon: '💧', color: '#3182ce', colorDim: 'rgba(49,130,206,0.08)',
    duration: 'Lifelong', category: 'Nephrology', departmentId: 'nephrology',
    description: 'Hemodialysis & peritoneal dialysis management',
    milestones: ['Access creation & maturation', 'Dialysis initiation', 'Adequacy assessment', 'Volume & BP optimization', 'Anemia & bone management', 'Transplant referral'],
    tools: [
      { id: 'dialysis_log', label: 'Dialysis Session Log', icon: '💧', type: 'tracker', description: 'HD/PD session data', opensIn: 'panel' },
      { id: 'access_monitor', label: 'Access Monitoring', icon: '🩺', type: 'tracker', description: 'AVF/AVG/CVC assessment', opensIn: 'panel' },
      { id: 'anemia_mgmt', label: 'Anemia Protocol', icon: '🩸', type: 'protocol', description: 'Hb target & ESA dosing', opensIn: 'panel' },
      { id: 'mineral_bone', label: 'Mineral & Bone Protocol', icon: '🦴', type: 'protocol', description: 'Ca, PO4, PTH management', opensIn: 'panel' },
      { id: 'order_access_doppler', label: 'Order Access Doppler', icon: '🩻', type: 'order', description: 'AVF/AVG surveillance', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'weight', label: 'Pre/Post Weight', unit: 'kg', normalRange: 'UF target met', frequency: 'Each session', icon: '⚖️', chartType: 'line' },
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<140/90', frequency: 'Each session', icon: '❤️', chartType: 'line' },
    ],
    educationTopics: ['Understanding dialysis', 'Access care (AVF/CVC/PD)', 'Fluid & diet restrictions', 'Medication management', 'Warning signs of complications', 'Transplant options'],
  },

  // ── NEUROLOGY ──
  {
    id: 'stroke_rehab', label: 'Stroke Rehabilitation', icon: '🧠', color: '#7c3aed', colorDim: 'rgba(124,58,237,0.08)',
    duration: '6-12 months', category: 'Neurology', departmentId: 'rehabilitation',
    description: 'Post-stroke recovery with rehabilitation & secondary prevention',
    milestones: ['Acute phase (0-72h)', 'Inpatient rehabilitation', 'Discharge planning', 'Outpatient PT/OT', '3-month functional assessment', 'Secondary prevention maintenance'],
    tools: [
      { id: 'nihss', label: 'NIHSS Score', icon: '📊', type: 'assessment', description: 'Stroke severity scale', opensIn: 'modal' },
      { id: 'rankin', label: 'Modified Rankin Scale', icon: '📝', type: 'assessment', description: 'Functional outcome', opensIn: 'modal' },
      { id: 'swallow_screen', label: 'Swallow Screening', icon: '🤤', type: 'assessment', description: 'Dysphagia screen', opensIn: 'modal' },
      { id: 'rehab_plan', label: 'Rehab Plan Builder', icon: '💪', type: 'protocol', description: 'PT/OT/SLP goals', opensIn: 'panel' },
      { id: 'order_ct_brain', label: 'Order CT Brain', icon: '🩻', type: 'order', description: 'Non-contrast CT head', opensIn: 'modal' },
      { id: 'order_mri', label: 'Order MRI Brain', icon: '🩻', type: 'order', description: 'MRI with DWI', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<130/80', frequency: 'Daily', icon: '❤️', chartType: 'line' },
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'Stable', frequency: 'Weekly', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Understanding stroke', 'Secondary prevention medications', 'Rehabilitation exercises', 'Caregiver support resources', 'Swallowing precautions', 'Fall prevention at home'],
  },
  {
    id: 'epilepsy', label: 'Epilepsy Management', icon: '⚡', color: '#805ad5', colorDim: 'rgba(128,90,213,0.08)',
    duration: 'Lifelong', category: 'Neurology', departmentId: 'neurology',
    description: 'Seizure control with AED optimization & monitoring',
    milestones: ['Diagnosis & seizure classification', 'Initiate first AED', 'Titration to therapeutic dose', 'Seizure-free for 3 months', 'Stable maintenance', 'Annual medication review'],
    tools: [
      { id: 'seizure_log', label: 'Seizure Diary', icon: '📝', type: 'tracker', description: 'Log seizure events', opensIn: 'panel' },
      { id: 'aed_protocol', label: 'AED Dosing Protocol', icon: '📋', type: 'protocol', description: 'Drug-specific titration', opensIn: 'panel' },
      { id: 'aed_levels', label: 'AED Level Tracker', icon: '🧪', type: 'tracker', description: 'Therapeutic drug monitoring', opensIn: 'panel' },
      { id: 'order_aed_levels', label: 'Order AED Levels', icon: '🧪', type: 'order', description: 'Valproate, carbamazepine, etc.', opensIn: 'modal' },
      { id: 'order_eeg', label: 'Order EEG', icon: '🧠', type: 'order', description: 'Electroencephalogram', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'seizure_freq', label: 'Seizure Frequency', unit: '/month', normalRange: '0', frequency: 'Monthly', icon: '⚡', chartType: 'bar' },
    ],
    educationTopics: ['Understanding epilepsy', 'AED medication adherence', 'Seizure first aid', 'Driving & safety restrictions', 'Sleep & trigger management', 'Emergency medication (buccal midazolam)'],
  },

  // ── SURGERY ──
  {
    id: 'pre_op', label: 'Pre-operative Assessment', icon: '📋', color: '#dd6b20', colorDim: 'rgba(221,107,32,0.08)',
    duration: 'Peri-operative', category: 'Surgery', departmentId: 'general_surgery',
    description: 'Pre-operative optimization & risk assessment',
    milestones: ['Medical history & ASA grade', 'Cardiac risk assessment (RCRI)', 'Pulmonary optimization', 'Lab investigations', 'Anaesthesia consultation', 'Informed consent'],
    tools: [
      { id: 'asa_grade', label: 'ASA Physical Status', icon: '📊', type: 'assessment', description: 'ASA I-V classification', opensIn: 'modal' },
      { id: 'rcri', label: 'RCRI (Revised Cardiac Risk)', icon: '🧮', type: 'calculator', description: 'MACE risk index', opensIn: 'modal' },
      { id: 'preop_checklist', label: 'Pre-op Checklist', icon: '✅', type: 'protocol', description: 'Surgical safety checklist', opensIn: 'panel' },
      { id: 'order_preop_labs', label: 'Order Pre-op Labs', icon: '🧪', type: 'order', description: 'CBC, coagulation, chemistry', opensIn: 'modal' },
      { id: 'order_ecg', label: 'Request ECG', icon: '🩻', type: 'order', description: 'Pre-operative ECG', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<140/90', frequency: 'Pre-op visit', icon: '❤️' },
    ],
    educationTopics: ['What to expect before surgery', 'Fasting instructions', 'Medication adjustments', 'Day of surgery timeline', 'Post-operative recovery plan'],
  },
  {
    id: 'post_op', label: 'Post-operative Care', icon: '🩹', color: '#38a169', colorDim: 'rgba(56,161,105,0.08)',
    duration: 'Peri-operative', category: 'Surgery', departmentId: 'general_surgery',
    description: 'Surgical recovery, wound care & complication monitoring',
    milestones: ['Immediate post-op recovery', 'Pain control optimization', 'Wound assessment', 'Mobilization & nutrition', 'Suture removal', 'Follow-up discharge'],
    tools: [
      { id: 'pain_score', label: 'Pain Score (NRS)', icon: '💉', type: 'assessment', description: 'Numerical rating scale', opensIn: 'modal' },
      { id: 'wound_tracker', label: 'Wound Assessment', icon: '🩹', type: 'tracker', description: 'Wound healing parameters', opensIn: 'panel' },
      { id: 'dvt_prophylaxis', label: 'DVT Prophylaxis Protocol', icon: '🩸', type: 'protocol', description: 'VTE risk assessment', opensIn: 'panel' },
      { id: 'order_cbc', label: 'Order CBC', icon: '🧪', type: 'order', description: 'Post-op hemoglobin', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'temperature', label: 'Temperature', unit: '°C', normalRange: '<37.5', frequency: 'Daily', icon: '🌡️', chartType: 'line' },
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: 'Stable', frequency: 'Daily', icon: '❤️', chartType: 'line' },
    ],
    educationTopics: ['Wound care at home', 'Pain management', 'Activity restrictions', 'Warning signs of infection', 'Follow-up appointment'],
  },
  {
    id: 'wound_care', label: 'Wound Care Management', icon: '🩹', color: '#38a169', colorDim: 'rgba(56,161,105,0.08)',
    duration: 'Variable', category: 'Surgery', departmentId: 'general_surgery',
    description: 'Acute & chronic wound management including diabetic foot',
    milestones: ['Wound assessment & classification', 'Debridement & dressing', 'Infection control', 'Granulation tissue formation', 'Wound closure progress', 'Complete healing'],
    tools: [
      { id: 'wound_tracker', label: 'Wound Assessment Tool', icon: '📝', type: 'tracker', description: 'Dimensions, exudate, tissue', opensIn: 'panel' },
      { id: 'bates_jensen', label: 'Bates-Jensen Wound Score', icon: '📊', type: 'assessment', description: 'Wound severity assessment', opensIn: 'modal' },
      { id: 'dressing_guide', label: 'Dressing Selection Guide', icon: '🩹', type: 'protocol', description: 'Modern wound dressings', opensIn: 'panel' },
      { id: 'order_wound_culture', label: 'Order Wound Culture', icon: '🧪', type: 'order', description: 'Microbiology swab/biopsy', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'wound_size', label: 'Wound Dimension', unit: 'cm²', normalRange: 'Decreasing', frequency: 'Each visit', icon: '📐', chartType: 'line' },
    ],
    educationTopics: ['Wound dressing at home', 'Signs of infection', 'Nutrition for wound healing', 'Activity modifications', 'When to return for review'],
  },

  // ── OBGYN ──
  {
    id: 'antenatal', label: 'Antenatal Care', icon: '🤰', color: '#38a169', colorDim: 'rgba(56,161,105,0.08)',
    duration: '40 weeks', category: 'Maternal Health', departmentId: 'obgyn',
    description: 'Full antenatal schedule from booking to delivery planning',
    milestones: ['Booking visit (before 12 weeks)', '1st trimester screening (12–14 weeks)', '2nd trimester review (18–20 weeks)', 'Anatomy scan + anomaly screening', '3rd trimester review (28–32 weeks)', 'Birth plan + 36-week assessment'],
    tools: [
      { id: 'gest_age', label: 'Gestational Age Calculator', icon: '🗓️', type: 'calculator', description: 'EDD & GA by LMP/US', opensIn: 'modal' },
      { id: 'fundal_height', label: 'Fundal Height Chart', icon: '📈', type: 'tracker', description: 'Symphysiofundal height', opensIn: 'panel' },
      { id: 'fetal_movement', label: 'Fetal Movement Log', icon: '👶', type: 'tracker', description: 'Kick count tracking', opensIn: 'panel' },
      { id: 'danger_signs', label: 'Danger Signs Checklist', icon: '⚠️', type: 'assessment', description: 'Obstetric alert signs', opensIn: 'modal' },
      { id: 'birth_plan', label: 'Birth Plan Builder', icon: '📋', type: 'protocol', description: 'Delivery preferences', opensIn: 'panel' },
      { id: 'ctg_workspace', label: 'CTG Interpretation Workspace', icon: '🩺', type: 'assessment', description: 'Fetal heart rate tracing', opensIn: 'fullpage' },
      { id: 'order_trimester', label: 'Order Trimester Investigations', icon: '🧪', type: 'order', description: 'ANC lab panel', opensIn: 'modal' },
      { id: 'order_ultrasound', label: 'Order Obstetric US', icon: '🩻', type: 'order', description: 'Obstetric ultrasound', opensIn: 'modal' },
      { id: 'oral_gtt', label: 'OGTT Protocol', icon: '🍬', type: 'protocol', description: '24-28 week GTT', opensIn: 'panel' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<140/90', frequency: 'Every visit', icon: '❤️', chartType: 'line' },
      { key: 'weight', label: 'Maternal Weight', unit: 'kg', normalRange: '+0.5kg/wk (2nd/3rd tri)', frequency: 'Every visit', icon: '⚖️', chartType: 'line' },
      { key: 'pulse', label: 'Fetal Heart Rate', unit: 'bpm', normalRange: '110–160', frequency: 'Every visit', icon: '💓', chartType: 'line' },
      { key: 'fundal_height', label: 'Fundal Height', unit: 'cm', normalRange: '= GA ±2cm', frequency: 'Every visit', icon: '📐', chartType: 'line' },
    ],
    educationTopics: ['Nutrition in pregnancy — folic acid, iron, calcium', 'What to expect at each antenatal visit', 'Danger signs requiring immediate care', 'Safe medications during pregnancy', 'Preparing for labour and delivery', 'Breastfeeding preparation', 'Newborn care basics', 'Postpartum family planning'],
  },
  {
    id: 'postnatal', label: 'Postnatal Care', icon: '👩‍👧', color: '#38a169', colorDim: 'rgba(56,161,105,0.08)',
    duration: '6 weeks', category: 'Maternal Health', departmentId: 'obgyn',
    description: 'Mother-baby dyad care after delivery',
    milestones: ['Immediate postpartum assessment', 'Day 3-5 follow-up', 'Breastfeeding establishment', '2-week wound/perineal check', '6-week comprehensive review', 'Family planning counselling'],
    tools: [
      { id: 'pph_assessment', label: 'PPH Risk Assessment', icon: '🩸', type: 'assessment', description: 'Postpartum hemorrhage risk', opensIn: 'modal' },
      { id: 'breastfeeding_log', label: 'Breastfeeding Tracker', icon: '🍼', type: 'tracker', description: 'Feed & wet nappy log', opensIn: 'panel' },
      { id: 'baby_weight', label: 'Newborn Weight Chart', icon: '📈', type: 'tracker', description: 'Infant growth tracking', opensIn: 'panel' },
      { id: 'contraception', label: 'Contraception Counselling', icon: '🩺', type: 'protocol', description: 'Postpartum contraceptive options', opensIn: 'panel' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<140/90', frequency: 'Each visit', icon: '❤️', chartType: 'line' },
    ],
    educationTopics: ['Perineal/wound care', 'Breastfeeding support', 'Newborn warning signs', 'Postpartum mental health', 'Family planning options'],
  },
  {
    id: 'pcos', label: 'PCOS Management', icon: '🩺', color: '#d53f8c', colorDim: 'rgba(213,63,140,0.08)',
    duration: 'Lifelong', category: 'Women\'s Health', departmentId: 'obgyn',
    description: 'Polycystic ovary syndrome — metabolic, reproductive & symptom management',
    milestones: ['Diagnosis (Rotterdam criteria)', 'Metabolic workup', 'Symptom management (OCP/metformin)', 'Fertility assessment', 'Long-term complication prevention', 'Annual metabolic review'],
    tools: [
      { id: 'pcos_screen', label: 'PCOS Rotterdam Criteria', icon: '📊', type: 'assessment', description: 'Diagnostic criteria', opensIn: 'modal' },
      { id: 'homa_ir', label: 'HOMA-IR Calculator', icon: '🧮', type: 'calculator', description: 'Insulin resistance index', opensIn: 'modal' },
      { id: 'order_ovarian_us', label: 'Order Ovarian US', icon: '🩻', type: 'order', description: 'Pelvic ultrasound', opensIn: 'modal' },
      { id: 'order_hormone', label: 'Order Hormone Panel', icon: '🧪', type: 'order', description: 'LH, FSH, testosterone, DHEA-S', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'BMI <25', frequency: 'Monthly', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Understanding PCOS', 'Lifestyle & weight management', 'Medication options', 'Fertility & pregnancy', 'Long-term health risks', 'Mental health support'],
  },

  // ── PEDIATRICS ──
  {
    id: 'immunization', label: 'Immunization Schedule', icon: '💉', color: '#38a169', colorDim: 'rgba(56,161,105,0.08)',
    duration: 'Birth-18 years', category: 'Pediatrics', departmentId: 'pediatrics',
    description: 'Routine childhood immunization tracking',
    milestones: ['Birth doses (BCG, OPV, HepB)', '6-week visit (DTP-Hib-HepB, PCV, Rota)', '10-week & 14-week visits', '9-month (Measles, Yellow Fever)', '18-month & booster doses', 'School-age & adolescent vaccines'],
    tools: [
      { id: 'imm_schedule', label: 'Immunization Schedule View', icon: '📅', type: 'protocol', description: 'KEPI schedule by age', opensIn: 'panel' },
      { id: 'imm_tracker', label: 'Vaccination Tracker', icon: '✅', type: 'tracker', description: 'Doses given & due', opensIn: 'panel' },
      { id: 'catch_up', label: 'Catch-up Schedule Guide', icon: '📋', type: 'protocol', description: 'Delayed vaccination plan', opensIn: 'panel' },
    ],
    monitoringMetrics: [
      { key: 'weight', label: 'Weight for Age', unit: 'kg', normalRange: 'WHO growth curve', frequency: 'Each visit', icon: '⚖️', chartType: 'line' },
      { key: 'height', label: 'Height for Age', unit: 'cm', normalRange: 'WHO growth curve', frequency: 'Each visit', icon: '📏', chartType: 'line' },
    ],
    educationTopics: ['Vaccine schedule & importance', 'Common vaccine side effects', 'When to delay vaccination', 'Catch-up vaccination', 'Vaccine safety evidence'],
  },

  // ── HIV / ID ──
  {
    id: 'hiv', label: 'HIV Care Program', icon: '🔴', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    duration: 'Lifelong', category: 'Infectious Disease', departmentId: 'infectious_disease',
    description: 'ART management with viral suppression & OI prevention',
    milestones: ['Baseline — CD4 + viral load', 'Initiate ART regimen', 'First ART follow-up (4 weeks)', 'Viral suppression achieved (<50 copies)', 'Annual comprehensive review', 'Opportunistic infection surveillance'],
    tools: [
      { id: 'cd4_trend', label: 'CD4 Count Trend', icon: '📈', type: 'tracker', description: 'CD4 trajectory tracking', opensIn: 'panel' },
      { id: 'viral_load', label: 'Viral Load Tracker', icon: '🦠', type: 'tracker', description: 'HIV RNA copies/mL', opensIn: 'panel' },
      { id: 'adherence_monitor', label: 'ART Adherence Monitor', icon: '💊', type: 'tracker', description: 'ART dose adherence', opensIn: 'panel' },
      { id: 'oi_screen', label: 'Opportunistic Infection Screen', icon: '🔍', type: 'assessment', description: 'TB, CMV, PCP, crypto screen', opensIn: 'modal' },
      { id: 'art_protocol', label: 'ART Regimen Protocol', icon: '📋', type: 'protocol', description: 'First & second-line ART', opensIn: 'panel' },
      { id: 'pep_prep', label: 'PEP / PrEP Protocol', icon: '🛡️', type: 'protocol', description: 'HIV prevention regimens', opensIn: 'panel' },
      { id: 'order_vl', label: 'Order Viral Load + CD4', icon: '🧪', type: 'order', description: 'VL & CD4 count', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'viral_load', label: 'Viral Load', unit: 'copies/mL', normalRange: '<50 (suppressed)', frequency: 'Every 6 months', icon: '🦠', chartType: 'line' },
      { key: 'cd4', label: 'CD4 Count', unit: 'cells/μL', normalRange: '>500', frequency: 'Every 6 months', icon: '🔬', chartType: 'line' },
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'Stable', frequency: 'Every visit', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['ART regimen and importance of adherence', 'Undetectable = Untransmittable (U=U)', 'Opportunistic infection prevention', 'Sexual health and disclosure', 'Nutrition in HIV care', 'Mental health and stigma support', 'Family planning with HIV'],
  },
  {
    id: 'hepatitis', label: 'Hepatitis B/C Care', icon: '🫁', color: '#d69e2e', colorDim: 'rgba(214,158,46,0.08)',
    duration: 'Variable', category: 'Infectious Disease', departmentId: 'infectious_disease',
    description: 'Chronic hepatitis management & cirrhosis prevention',
    milestones: ['Diagnosis & serology panel', 'Fibrosis assessment (FibroScan)', 'Initiate antiviral therapy', 'Viral suppression achieved', 'Cirrhosis surveillance', 'HCC screening (6-monthly US)'],
    tools: [
      { id: 'hepatitis_serology', label: 'Hepatitis Serology Guide', icon: '🩸', type: 'protocol', description: 'Interpretation of HBsAg, HBeAg, etc.', opensIn: 'panel' },
      { id: 'fibrosis_score', label: 'Fibrosis Score (APRI/FIB-4)', icon: '🧮', type: 'calculator', description: 'Non-invasive fibrosis markers', opensIn: 'modal' },
      { id: 'order_lft', label: 'Order LFT + Viral Load', icon: '🧪', type: 'order', description: 'Liver profile + HBV/HCV RNA', opensIn: 'modal' },
      { id: 'order_ultrasound', label: 'Order Liver US + AFP', icon: '🩻', type: 'order', description: 'HCC surveillance', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'lft', label: 'ALT / AST', unit: 'U/L', normalRange: '<40', frequency: 'Every 3-6 months', icon: '🫁', chartType: 'line' },
    ],
    educationTopics: ['Understanding hepatitis', 'Antiviral treatment adherence', 'Alcohol avoidance', 'HCC surveillance importance', 'Preventing transmission', 'Liver-friendly diet'],
  },

  // ── ONCOLOGY ──
  {
    id: 'palliative', label: 'Palliative Care', icon: '🌅', color: '#a0aec0', colorDim: 'rgba(160,174,192,0.08)',
    duration: 'Variable', category: 'Palliative', departmentId: 'palliative',
    description: 'Symptom management & quality of life in serious illness',
    milestones: ['Initial palliative assessment', 'Pain management optimization', 'Symptom control (nausea, dyspnea)', 'Psychosocial & spiritual support', 'Advanced care planning (ACP)', 'End-of-life care plan'],
    tools: [
      { id: 'pain_score', label: 'Pain Assessment (NRS)', icon: '💉', type: 'assessment', description: '0-10 numeric pain scale', opensIn: 'modal' },
      { id: 'esas', label: 'Edmonton Symptom Assessment', icon: '📝', type: 'assessment', description: '9-symptom screen', opensIn: 'modal' },
      { id: 'who_ladder', label: 'WHO Analgesic Ladder', icon: '📋', type: 'protocol', description: 'Stepwise pain management', opensIn: 'panel' },
      { id: 'acp_builder', label: 'Advance Care Directive', icon: '📋', type: 'protocol', description: 'Living will & goals of care', opensIn: 'panel' },
      { id: 'order_pain_mgmt', label: 'Order Palliative Medications', icon: '💊', type: 'order', description: 'Opioids, antiemetics', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'pain', label: 'Pain Score', unit: '/10', normalRange: '<4', frequency: 'Daily', icon: '💉', chartType: 'bar' },
    ],
    educationTopics: ['Understanding palliative care', 'Pain management options', 'Symptom management at home', 'Advance care planning', 'Family & caregiver support', 'Grief & bereavement resources'],
  },
  {
    id: 'pain_management', label: 'Pain Management', icon: '💊', color: '#805ad5', colorDim: 'rgba(128,90,213,0.08)',
    duration: 'Variable', category: 'Pain', departmentId: 'palliative',
    description: 'Acute & chronic pain management across conditions',
    milestones: ['Pain assessment & characterisation', 'Initiate non-opioid therapy', 'Opioid trial if indicated', 'Interventional pain referral', 'Functional improvement', 'Maintenance & weaning plan'],
    tools: [
      { id: 'pain_score', label: 'NRS / VAS Pain Scale', icon: '📊', type: 'assessment', description: 'Pain intensity rating', opensIn: 'modal' },
      { id: 'who_ladder', label: 'WHO Analgesic Ladder', icon: '📋', type: 'protocol', description: 'Step I-II-III', opensIn: 'panel' },
      { id: 'pain_body_map', label: 'Pain Body Map', icon: '🧍', type: 'assessment', description: 'Pain location diagram', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'pain', label: 'Pain Score', unit: '/10', normalRange: '<4', frequency: 'Daily', icon: '💉', chartType: 'bar' },
    ],
    educationTopics: ['Understanding pain types', 'Non-pharmacological pain relief', 'Medication schedule & adherence', 'Opioid safety', 'When to seek help'],
  },

  // ── GLAUCOMA ──
  {
    id: 'glaucoma', label: 'Glaucoma Management', icon: '👁️', color: '#2b6cb0', colorDim: 'rgba(43,108,176,0.08)',
    duration: 'Lifelong', category: 'Ophthalmology', departmentId: 'ophthalmology',
    description: 'Intraocular pressure control & vision preservation',
    milestones: ['Diagnosis & baseline IOP', 'Initiate topical therapy', 'IOP target achieved', 'Visual field stability', 'Laser/surgical referral', 'Lifelong surveillance'],
    tools: [
      { id: 'iop_tracker', label: 'IOP Trend Tracker', icon: '📈', type: 'tracker', description: 'Intraocular pressure log', opensIn: 'panel' },
      { id: 'visual_field', label: 'Visual Field Progression', icon: '👁️', type: 'assessment', description: 'VF defect tracking', opensIn: 'panel' },
      { id: 'glaucoma_protocol', label: 'Glaucoma Treatment Protocol', icon: '📋', type: 'protocol', description: 'Topical therapy algorithm', opensIn: 'panel' },
    ],
    monitoringMetrics: [
      { key: 'iop', label: 'IOP', unit: 'mmHg', normalRange: '10–21', frequency: 'Every 3-6 months', icon: '👁️', chartType: 'line' },
    ],
    educationTopics: ['Understanding glaucoma', 'Eye drop technique', 'Medication schedule', 'Importance of follow-up', 'Vision preservation strategies'],
  },

  // ── GERIATRICS ──
  {
    id: 'dementia', label: 'Dementia Care', icon: '🧠', color: '#718096', colorDim: 'rgba(113,128,150,0.08)',
    duration: 'Lifelong', category: 'Geriatrics', departmentId: 'geriatrics',
    description: 'Cognitive decline assessment & management',
    milestones: ['Cognitive screening (MMSE/MoCA)', 'Diagnosis & subtype classification', 'Initiate cognitive therapy', 'Behavioural symptom management', 'Caregiver support plan', 'Safety & capacity assessment'],
    tools: [
      { id: 'mmse', label: 'MMSE Assessment', icon: '📝', type: 'assessment', description: 'Mini-mental state exam', opensIn: 'modal' },
      { id: 'moca', label: 'MoCA Assessment', icon: '📝', type: 'assessment', description: 'Montreal cognitive assessment', opensIn: 'modal' },
      { id: 'cdr', label: 'Clinical Dementia Rating', icon: '📊', type: 'assessment', description: 'Dementia severity scale', opensIn: 'modal' },
      { id: 'order_ct_brain', label: 'Order CT/MRI Brain', icon: '🩻', type: 'order', description: 'Structural brain imaging', opensIn: 'modal' },
    ],
    educationTopics: ['Understanding dementia', 'Cognitive stimulation activities', 'Behaviour management strategies', 'Caregiver self-care', 'Safety at home', 'Legal & financial planning'],
  },

  // ── GASTRO ──
  {
    id: 'gerd', label: 'GERD Management', icon: '🫃', color: '#d69e2e', colorDim: 'rgba(214,158,46,0.08)',
    duration: 'Lifelong', category: 'Gastroenterology', departmentId: 'gastroenterology',
    description: 'Gastroesophageal reflux disease — symptom control & complication prevention',
    milestones: ['Diagnosis (clinical/endoscopy)', 'PPI trial (8 weeks)', 'Symptom control achieved', 'Step-down to maintenance', "Barrett's surveillance", 'Fundoplication evaluation'],
    tools: [
      { id: 'gerd_symptom', label: 'GERD Symptom Score', icon: '📝', type: 'assessment', description: 'Frequency & severity', opensIn: 'modal' },
      { id: 'ppi_protocol', label: 'PPI Dosing Protocol', icon: '📋', type: 'protocol', description: 'Standard & high-dose PPI', opensIn: 'panel' },
      { id: 'order_upper_gi', label: 'Order Upper GI Endoscopy', icon: '🩻', type: 'order', description: 'EGD with biopsy if indicated', opensIn: 'modal' },
    ],
    educationTopics: ['Understanding GERD', 'Dietary triggers & modification', 'PPI medication use', 'Sleep & elevation strategies', 'Red flags (dysphagia, weight loss)'],
  },
  {
    id: 'ibs', label: 'IBS Management', icon: '🫃', color: '#b83280', colorDim: 'rgba(184,50,128,0.08)',
    duration: 'Lifelong', category: 'Gastroenterology', departmentId: 'gastroenterology',
    description: 'Irritable bowel syndrome — symptom management & diet',
    milestones: ['Diagnosis (Rome IV criteria)', 'FODMAP diet trial', 'Symptom management plan', 'Pharmacotherapy', 'Psychological therapy referral', 'Long-term maintenance'],
    tools: [
      { id: 'rome_iv', label: 'Rome IV Criteria', icon: '📋', type: 'assessment', description: 'IBS diagnostic criteria', opensIn: 'modal' },
      { id: 'ibs_symptom', label: 'IBS Symptom Tracker', icon: '📝', type: 'tracker', description: 'Stool & symptom diary', opensIn: 'panel' },
      { id: 'fodmap', label: 'Low FODMAP Diet Guide', icon: '🥗', type: 'education', description: 'Elimination & reintroduction', opensIn: 'panel' },
    ],
    educationTopics: ['Understanding IBS', 'FODMAP diet protocol', 'Stress management', 'Fiber & hydration', 'Medication options'],
  },

  // ── GENERAL ──
  {
    id: 'general_checkup', label: 'General Health Check-up', icon: '🩺', color: '#0F766E', colorDim: 'rgba(15,118,110,0.08)',
    duration: 'Annual', category: 'General', departmentId: 'general_opd',
    description: 'Annual comprehensive health screening & prevention',
    milestones: ['History & vital signs', 'Physical examination', 'Laboratory screening', 'Risk factor assessment', 'Immunization update', 'Health promotion counselling'],
    tools: [
      { id: 'health_screen', label: 'Health Screening Checklist', icon: '✅', type: 'assessment', description: 'Age-appropriate screening', opensIn: 'panel' },
      { id: 'cv_risk', label: 'Cardiovascular Risk Assessment', icon: '🧮', type: 'calculator', description: '10-year CVD risk', opensIn: 'modal' },
      { id: 'order_basic_panel', label: 'Order Basic Health Panel', icon: '🧪', type: 'order', description: 'CBC, chemistry, lipids', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<120/80', frequency: 'Annual', icon: '❤️', chartType: 'line' },
      { key: 'weight', label: 'Body Weight', unit: 'kg', normalRange: 'BMI 18.5–24.9', frequency: 'Annual', icon: '⚖️', chartType: 'line' },
    ],
    educationTopics: ['Healthy diet & exercise', 'Stress management', 'Sleep hygiene', 'Alcohol moderation', 'Smoking cessation', 'Cancer screening schedules'],
  },
  {
    id: 'sepsis', label: 'Sepsis Management', icon: '🚨', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    duration: 'Acute', category: 'Emergency', departmentId: 'emergency',
    description: 'Sepsis recognition, resuscitation & antibiotic protocol',
    milestones: ['Sepsis screening (qSOFA)', 'Blood cultures & lactate', 'IV antibiotics within 1h', 'Fluid resuscitation', 'Source control', 'De-escalation & step-down'],
    tools: [
      { id: 'qsofa', label: 'qSOFA Score', icon: '📊', type: 'assessment', description: 'Quick SOFA for sepsis', opensIn: 'modal' },
      { id: 'sepsis_bundle', label: 'Sepsis 1-hour Bundle', icon: '📋', type: 'protocol', description: 'Surviving Sepsis bundle', opensIn: 'panel' },
      { id: 'order_blood_culture', label: 'Order Blood Cultures', icon: '🧪', type: 'order', description: 'Aerobic & anaerobic', opensIn: 'modal' },
      { id: 'order_lactate', label: 'Order Lactate', icon: '🧪', type: 'order', description: 'Serum lactate', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'temperature', label: 'Temperature', unit: '°C', normalRange: '36–38', frequency: 'Every 4h', icon: '🌡️', chartType: 'line' },
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: 'MAP >65', frequency: 'Continuous', icon: '❤️', chartType: 'line' },
      { key: 'lactate', label: 'Lactate', unit: 'mmol/L', normalRange: '<2', frequency: 'Every 4-6h', icon: '🧪', chartType: 'line' },
    ],
    educationTopics: ['Understanding sepsis', 'Infection prevention', 'Vaccination importance', 'When to seek emergency care'],
  },

  // ── INPATIENT ──
  {
    id: 'inpatient_general', label: 'Inpatient General Ward', icon: '🛏️', color: '#4a5568', colorDim: 'rgba(74,85,104,0.08)',
    duration: 'Admission episode', category: 'Inpatient', departmentId: 'inpatient',
    description: 'General ward patient management & rounds',
    milestones: ['Admission clerking & plan', 'Daily ward round review', 'Investigations & results review', 'Treatment response assessment', 'Discharge planning', 'Safe discharge & follow-up'],
    tools: [
      { id: 'ward_round', label: 'Ward Round Template', icon: '📋', type: 'protocol', description: 'Structured daily review', opensIn: 'panel' },
      { id: 'discharge_checklist', label: 'Discharge Checklist', icon: '✅', type: 'protocol', description: 'Safe discharge protocol', opensIn: 'panel' },
      { id: 'order_routine', label: 'Order Routine Labs', icon: '🧪', type: 'order', description: 'Daily monitoring labs', opensIn: 'modal' },
      { id: 'iv_fluids', label: 'IV Fluids Calculator', icon: '💧', type: 'calculator', description: 'Fluid maintenance & replacement', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: 'Stable', frequency: 'Daily', icon: '❤️', chartType: 'line' },
      { key: 'temperature', label: 'Temperature', unit: '°C', normalRange: '<37.5', frequency: 'Daily', icon: '🌡️', chartType: 'line' },
      { key: 'o2_saturation', label: 'SpO₂', unit: '%', normalRange: '>94%', frequency: 'Daily', icon: '🫧', chartType: 'line' },
    ],
    educationTopics: ['Understanding your condition', 'Medication schedule', 'What to expect during admission', 'Discharge planning process', 'Follow-up instructions'],
  },
  {
    id: 'inpatient_icu', label: 'ICU / HDU Care', icon: '🆘', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    duration: 'Admission episode', category: 'Inpatient', departmentId: 'inpatient',
    description: 'Intensive care & high dependency monitoring',
    milestones: ['ICU admission & stabilization', 'Ventilator / organ support', 'Daily goals assessment', 'Weaning trials', 'Step-down to ward', 'ICU follow-up clinic'],
    tools: [
      { id: 'sofa', label: 'SOFA Score', icon: '📊', type: 'assessment', description: 'Sequential organ failure', opensIn: 'modal' },
      { id: 'apache', label: 'APACHE IV Score', icon: '🧮', type: 'calculator', description: 'ICU mortality prediction', opensIn: 'modal' },
      { id: 'ventilator', label: 'Ventilator Settings Log', icon: '🫁', type: 'tracker', description: 'MV parameters & weaning', opensIn: 'panel' },
      { id: 'abg_tracker', label: 'ABG Tracker', icon: '🩸', type: 'tracker', description: 'Arterial blood gas trends', opensIn: 'panel' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'MAP', unit: 'mmHg', normalRange: '>65', frequency: 'Continuous', icon: '❤️', chartType: 'line' },
      { key: 'o2_saturation', label: 'SpO₂ / PaO₂', unit: '%', normalRange: '>94%', frequency: 'Continuous', icon: '🫧', chartType: 'line' },
      { key: 'urine', label: 'Urine Output', unit: 'mL/kg/h', normalRange: '>0.5', frequency: 'Hourly', icon: '💧', chartType: 'line' },
    ],
    educationTopics: ['ICU environment orientation', 'Family communication plan', 'Post-ICU recovery expectations'],
  },

  // ── ACUTE ──
  {
    id: 'acute_chest', label: 'Acute Chest Pain', icon: '⚡', color: '#e53e3e', colorDim: 'rgba(229,62,62,0.08)',
    duration: 'Acute episode', category: 'Emergency', departmentId: 'emergency',
    description: 'Chest pain evaluation & ACS rule-out',
    milestones: ['ECG & troponin', 'Risk stratification (HEART/TIMI)', 'ACS protocol initiation', 'Pain control', 'Cardiology referral', 'Stress test / angiogram'],
    tools: [
      { id: 'heart_score', label: 'HEART Score', icon: '🧮', type: 'calculator', description: 'MACE risk in chest pain', opensIn: 'modal' },
      { id: 'timi', label: 'TIMI Risk Score', icon: '🧮', type: 'calculator', description: 'UA/NSTEMI risk', opensIn: 'modal' },
      { id: 'stemi_protocol', label: 'STEMI Protocol', icon: '🚨', type: 'protocol', description: 'Primary PCI vs thrombolysis', opensIn: 'panel' },
      { id: 'order_ecg', label: 'Order STAT ECG', icon: '🩻', type: 'order', description: '12-lead ECG', opensIn: 'modal' },
      { id: 'order_troponin', label: 'Order Troponin', icon: '🧪', type: 'order', description: 'High-sensitivity troponin', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: 'Stable', frequency: 'Continuous', icon: '❤️', chartType: 'line' },
      { key: 'pulse', label: 'Heart Rate', unit: 'bpm', normalRange: '60–100', frequency: 'Continuous', icon: '💓', chartType: 'line' },
    ],
    educationTopics: ['Understanding chest pain', 'Heart attack warning signs', 'When to call 911', 'Cardiac rehab after discharge'],
  },
  {
    id: 'acute_stroke', label: 'Acute Stroke Care', icon: '🧠', color: '#7c3aed', colorDim: 'rgba(124,58,237,0.08)',
    duration: 'Acute episode', category: 'Neurology', departmentId: 'emergency',
    description: 'Hyperacute stroke management & thrombolysis decision',
    milestones: ['Code stroke activation', 'NIHSS assessment', 'CT brain (non-contrast)', 'Thrombolysis decision (0-4.5h)', 'Thrombectomy evaluation', 'Admission to stroke unit'],
    tools: [
      { id: 'nihss', label: 'NIHSS Score', icon: '📊', type: 'assessment', description: 'Stroke severity scale', opensIn: 'modal' },
      { id: 'thrombolysis', label: 'Thrombolysis Protocol', icon: '💉', type: 'protocol', description: 'tPA inclusion/exclusion', opensIn: 'panel' },
      { id: 'order_ct_brain', label: 'Order STAT CT Brain', icon: '🩻', type: 'order', description: 'Non-contrast CT head', opensIn: 'modal' },
    ],
    monitoringMetrics: [
      { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', normalRange: '<185/110 (pre-tPA)', frequency: 'Every 15min', icon: '❤️', chartType: 'line' },
      { key: 'pulse', label: 'Heart Rate', unit: 'bpm', normalRange: '60–100', frequency: 'Continuous', icon: '💓', chartType: 'line' },
    ],
    educationTopics: ['Stroke warning signs (FAST)', 'Thrombolysis information', 'Stroke unit care', 'Swallow precautions', 'Secondary prevention'],
  },
];

// ─── ALL TOOLS FLAT LIST ──────────────────────────────────────────────────────

export const ALL_TOOLS = ALL_PATHWAYS.flatMap(p => p.tools);

// ─── HELPER ───────────────────────────────────────────────────────────────────

export function getPathwayById(id: string): PathwayDef | undefined {
  return ALL_PATHWAYS.find(p => p.id === id);
}

export function getPathwaysByDepartment(departmentId: string): PathwayDef[] {
  return ALL_PATHWAYS.filter(p => p.departmentId === departmentId && p.isActive);
}

export function getDepartmentById(id: string): DepartmentDef | undefined {
  return DEPARTMENTS.find(d => d.id === id);
}

export function getPathwayColor(pathwayId: string): string {
  return ALL_PATHWAYS.find(p => p.id === pathwayId)?.color || '#0F766E';
}

export function getPathwayIcon(pathwayId: string): string {
  return ALL_PATHWAYS.find(p => p.id === pathwayId)?.icon || '🩺';
}
