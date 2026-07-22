// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Diagnostic Schemas — Provisional Diagnosis, Differentials, Problem List
// ═══════════════════════════════════════════════════════════════════════════════
// Structured card definitions for the diagnostic phase of the encounter.
// Each card follows Hutchison's: what is it, what supports it, what contradicts.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Diagnosis ──────────────────────────────────────────────────────────────────

export type DiagnosisConfidence = 'suspected' | 'likely' | 'confirmed' | 'ruled_out';
export type DiagnosisCertainty = 'definitive' | 'probable' | 'possible' | 'unlikely';

export interface DiagnosisCard {
  id: string;
  diagnosis: string;
  specialty?: string;
  confidence: DiagnosisConfidence;
  certainty: DiagnosisCertainty;
  icd10?: string;
  snomed?: string;
  supportingFindings: string[];
  contradictingFindings: string[];
  missingEvidence: string[];
  requiredInvestigations: string[];
  clinicalReasoning: string;
  createdAt: number;
  updatedAt: number;
}

// ── Section-specific cards ─────────────────────────────────────────────────────

export interface ProvisionalDiagnosisCard extends DiagnosisCard {
  isPrimary: boolean;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  requiresUrgentAction: boolean;
  actionMessage?: string;
}

export interface DifferentialDiagnosisCard extends DiagnosisCard {
  rank: number;
  dangerLevel: 'low' | 'moderate' | 'high' | 'critical';
  mustNotMiss: boolean;
  canBecomeProvisional: boolean;
}

// ── Problem List ───────────────────────────────────────────────────────────────

export type ProblemCategory =
  | 'symptom'
  | 'sign'
  | 'syndrome'
  | 'diagnosis'
  | 'risk_factor'
  | 'social'
  | 'functional'
  | 'psychiatric'
  | 'nutritional'
  | 'other';

export interface ProblemListItem {
  id: string;
  problem: string;
  category: ProblemCategory;
  priority: number;
  dateIdentified: number;
  status: 'active' | 'resolved' | 'monitoring' | 'chronic';
  icd10?: string;
  snomed?: string;
  linkedDiagnosisId?: string;
  notes: string;
}

// ── ICD-10 quick reference ─────────────────────────────────────────────────────

export interface ICD10Entry {
  code: string;
  description: string;
  chapter: string;
}

export const ICD10_COMMON: Record<string, ICD10Entry> = {
  A09: { code: 'A09', description: 'Infectious gastroenteritis', chapter: 'Infectious diseases' },
  A15: { code: 'A15', description: 'Respiratory tuberculosis', chapter: 'Infectious diseases' },
  B20: { code: 'B20', description: 'HIV disease', chapter: 'Infectious diseases' },
  B54: { code: 'B54', description: 'Unspecified malaria', chapter: 'Infectious diseases' },
  C16: { code: 'C16', description: 'Malignant neoplasm of stomach', chapter: 'Neoplasms' },
  C18: { code: 'C18', description: 'Malignant neoplasm of colon', chapter: 'Neoplasms' },
  C50: { code: 'C50', description: 'Malignant neoplasm of breast', chapter: 'Neoplasms' },
  D50: { code: 'D50', description: 'Iron deficiency anaemia', chapter: 'Blood disorders' },
  D57: { code: 'D57', description: 'Sickle cell disorders', chapter: 'Blood disorders' },
  E10: { code: 'E10', description: 'Type 1 diabetes mellitus', chapter: 'Endocrine' },
  E11: { code: 'E11', description: 'Type 2 diabetes mellitus', chapter: 'Endocrine' },
  E44: { code: 'E44', description: 'Protein-energy malnutrition', chapter: 'Endocrine' },
  E86: { code: 'E86', description: 'Volume depletion', chapter: 'Endocrine' },
  G40: { code: 'G40', description: 'Epilepsy', chapter: 'Neurological' },
  I10: { code: 'I10', description: 'Essential hypertension', chapter: 'Cardiovascular' },
  I21: { code: 'I21', description: 'Acute myocardial infarction', chapter: 'Cardiovascular' },
  I48: { code: 'I48', description: 'Atrial fibrillation', chapter: 'Cardiovascular' },
  I50: { code: 'I50', description: 'Heart failure', chapter: 'Cardiovascular' },
  J15: { code: 'J15', description: 'Bacterial pneumonia', chapter: 'Respiratory' },
  J45: { code: 'J45', description: 'Asthma', chapter: 'Respiratory' },
  J18: { code: 'J18', description: 'Pneumonia, unspecified', chapter: 'Respiratory' },
  K25: { code: 'K25', description: 'Gastric ulcer', chapter: 'Digestive' },
  K29: { code: 'K29', description: 'Gastritis', chapter: 'Digestive' },
  K35: { code: 'K35', description: 'Acute appendicitis', chapter: 'Digestive' },
  K40: { code: 'K40', description: 'Inguinal hernia', chapter: 'Digestive' },
  K70: { code: 'K70', description: 'Alcoholic liver disease', chapter: 'Digestive' },
  K74: { code: 'K74', description: 'Hepatic fibrosis/cirrhosis', chapter: 'Digestive' },
  K80: { code: 'K80', description: 'Cholelithiasis', chapter: 'Digestive' },
  M54: { code: 'M54', description: 'Dorsalgia (back pain)', chapter: 'Musculoskeletal' },
  N17: { code: 'N17', description: 'Acute kidney injury', chapter: 'Renal' },
  N20: { code: 'N20', description: 'Renal calculus', chapter: 'Renal' },
  N39: { code: 'N39', description: 'Urinary tract infection', chapter: 'Renal' },
  O10: { code: 'O10', description: 'Pre-existing hypertension in pregnancy', chapter: 'Pregnancy' },
  O14: { code: 'O14', description: 'Pre-eclampsia', chapter: 'Pregnancy' },
  O20: { code: 'O20', description: 'Early pregnancy haemorrhage', chapter: 'Pregnancy' },
  O48: { code: 'O48', description: 'Post-term pregnancy', chapter: 'Pregnancy' },
  P07: { code: 'P07', description: 'Preterm infant', chapter: 'Perinatal' },
  P22: { code: 'P22', description: 'Respiratory distress of newborn', chapter: 'Perinatal' },
  P36: { code: 'P36', description: 'Neonatal sepsis', chapter: 'Perinatal' },
  R05: { code: 'R05', description: 'Cough', chapter: 'Symptoms' },
  R06: { code: 'R06', description: 'Dyspnoea', chapter: 'Symptoms' },
  R10: { code: 'R10', description: 'Abdominal pain', chapter: 'Symptoms' },
  R11: { code: 'R11', description: 'Nausea and vomiting', chapter: 'Symptoms' },
  R50: { code: 'R50', description: 'Fever of unknown origin', chapter: 'Symptoms' },
  R57: { code: 'R57', description: 'Shock', chapter: 'Symptoms' },
  S06: { code: 'S06', description: 'Intracranial injury', chapter: 'Injury' },
  T81: { code: 'T81', description: 'Post-procedural complication', chapter: 'Injury' },
  Z03: { code: 'Z03', description: 'Observation for suspected disease', chapter: 'Factors' },
  Z51: { code: 'Z51', description: 'Palliative care', chapter: 'Factors' },
};

// ── Problem category options ───────────────────────────────────────────────────

export const PROBLEM_CATEGORY_OPTIONS: { value: ProblemCategory; label: string; examples: string }[] = [
  { value: 'symptom', label: 'Symptom', examples: 'Abdominal pain, dyspnoea, fever' },
  { value: 'sign', label: 'Sign', examples: 'Jaundice, oedema, crepitations' },
  { value: 'syndrome', label: 'Syndrome', examples: 'Sepsis, heart failure, acute coronary syndrome' },
  { value: 'diagnosis', label: 'Diagnosis', examples: 'Pneumonia, appendicitis, malaria' },
  { value: 'risk_factor', label: 'Risk factor', examples: 'Smoking, obesity, poor social support' },
  { value: 'social', label: 'Social', examples: 'Homelessness, food insecurity, financial barrier' },
  { value: 'functional', label: 'Functional', examples: 'Bedridden, dependent for ADLs, falls risk' },
  { value: 'psychiatric', label: 'Psychiatric', examples: 'Depression, anxiety, delirium' },
  { value: 'nutritional', label: 'Nutritional', examples: 'SAM, MAM, obesity, micronutrient deficiency' },
  { value: 'other', label: 'Other', examples: 'Palliative care, social admission' },
];

// ── Must-not-miss diagnoses by system ──────────────────────────────────────────

export interface MustNotMissEntry {
  diagnosis: string;
  system: string;
  redFlags: string[];
  suggestedInvestigations: string[];
}

export const MUST_NOT_MISS_DIAGNOSES: MustNotMissEntry[] = [
  { diagnosis: 'Acute coronary syndrome', system: 'Cardiovascular', redFlags: ['chest pain', 'diaphoresis', 'ECG changes'], suggestedInvestigations: ['ECG', 'Troponin', 'Chest X-ray'] },
  { diagnosis: 'Pulmonary embolism', system: 'Respiratory', redFlags: ['sudden dyspnoea', 'pleuritic pain', 'hypoxia', 'tachycardia'], suggestedInvestigations: ['D-dimer', 'CTPA', 'V/Q scan'] },
  { diagnosis: 'Sepsis', system: 'Infectious', redFlags: ['fever', 'tachycardia', 'hypotension', 'altered mental state', 'raised lactate'], suggestedInvestigations: ['Blood cultures', 'FBC', 'CRP', 'Lactate', 'Urinalysis'] },
  { diagnosis: 'Meningitis', system: 'Neurological', redFlags: ['fever', 'neck stiffness', 'photophobia', 'rash', 'altered consciousness'], suggestedInvestigations: ['LP/CSF analysis', 'Blood cultures', 'CT head'] },
  { diagnosis: 'Ectopic pregnancy', system: 'Obstetrics', redFlags: ['abdominal pain', 'vaginal bleeding', 'syncope', 'positive pregnancy test'], suggestedInvestigations: ['BhCG', 'Transvaginal US', 'Group & save'] },
  { diagnosis: 'Diabetic ketoacidosis', system: 'Endocrine', redFlags: ['polyuria', 'polydipsia', 'Kussmaul breathing', 'dehydration', 'altered consciousness'], suggestedInvestigations: ['Blood glucose', 'ABG', 'Urine ketones', 'Electrolytes'] },
  { diagnosis: 'Acute abdomen', system: 'Gastrointestinal', redFlags: ['severe pain', 'peritonism', 'vomiting', 'obstipation', 'fever'], suggestedInvestigations: ['FBC', 'Lipase', 'Abdominal X-ray', 'CT abdomen', 'US'] },
  { diagnosis: 'Airway obstruction', system: 'Respiratory', redFlags: ['stridor', 'drooling', 'tripod positioning', 'respiratory distress'], suggestedInvestigations: ['Flexible nasopharyngoscopy', 'Chest X-ray', 'ABG'] },
  { diagnosis: 'Pre-eclampsia / eclampsia', system: 'Obstetric', redFlags: ['hypertension', 'proteinuria', 'headache', 'visual disturbances', 'seizures'], suggestedInvestigations: ['BP monitoring', 'Urine protein', 'FBC', 'LFTs', 'U&E'] },
  { diagnosis: 'Upper GI bleed', system: 'Gastrointestinal', redFlags: ['haematemesis', 'melena', 'haemodynamic instability', 'syncope'], suggestedInvestigations: ['FBC', 'Coagulation', 'Cross-match', 'OGD'] },
  { diagnosis: 'Stroke/TIA', system: 'Neurological', redFlags: ['sudden unilateral weakness', 'speech disturbance', 'facial droop', 'ataxia'], suggestedInvestigations: ['CT head', 'MRI brain', 'Carotid Doppler'] },
  { diagnosis: 'Spinal cord compression', system: 'Musculoskeletal', redFlags: ['back pain', 'leg weakness', 'saddle anaesthesia', 'urinary retention'], suggestedInvestigations: ['Whole spine MRI', 'Urgent neurosurgery review'] },
];
