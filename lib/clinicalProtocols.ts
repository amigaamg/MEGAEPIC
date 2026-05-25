// ═══════════════════════════════════════════════════════════════════════════
// lib/clinicalProtocols.ts
// AMEXAN Clinical Intelligence — Disease Protocols + Drug Database
// Covers: 15 departments, 12 disease protocols, 11 drug profiles,
//         full interaction matrix, alert rules, dose calculators
// ═══════════════════════════════════════════════════════════════════════════

// ─── Department Registry ────────────────────────────────────────────────────
export const DEPARTMENTS: Record<string, { label: string; color: string; icon: string }> = {
  IM:    { label: 'Internal Medicine',   color: '#3b82f6', icon: '🏥' },
  CARD:  { label: 'Cardiology',          color: '#ef4444', icon: '❤️'  },
  ENDO:  { label: 'Endocrinology',       color: '#f59e0b', icon: '🔬' },
  RESP:  { label: 'Respiratory',         color: '#06b6d4', icon: '🫁' },
  RENAL: { label: 'Nephrology',          color: '#8b5cf6', icon: '💧' },
  NEURO: { label: 'Neurology',           color: '#ec4899', icon: '🧠' },
  GI:    { label: 'Gastroenterology',    color: '#10b981', icon: '🩺' },
  OB:    { label: 'Obstetrics',          color: '#f97316', icon: '🤱' },
  PAED:  { label: 'Paediatrics',         color: '#22d3ee', icon: '👶' },
  PSYCH: { label: 'Psychiatry',          color: '#a78bfa', icon: '💬' },
  SURG:  { label: 'Surgery',             color: '#94a3b8', icon: '🔪' },
  ORTHO: { label: 'Orthopaedics',        color: '#d97706', icon: '🦴' },
  DERM:  { label: 'Dermatology',         color: '#fb7185', icon: '🩹' },
  HAEM:  { label: 'Haematology',         color: '#ef4444', icon: '🩸' },
  ONCO:  { label: 'Oncology',            color: '#6366f1', icon: '⚕️' },
};

// ─── Types ───────────────────────────────────────────────────────────────────
export type AlertLevel = 'emergency' | 'urgent' | 'watch' | 'normal';
export type AlertOperator = '>' | '>=' | '<' | '<=' | '==';

export interface AlertRule {
  param: string;
  op: AlertOperator;
  val: number;
  level: AlertLevel;
  msg: string;
}

export interface ProtocolTargets {
  [key: string]: string;
}

export interface DiseaseProtocol {
  name: string;
  dept: string;                // key into DEPARTMENTS
  icd: string;
  monitoring: string[];        // monitoring tool IDs
  alerts: AlertRule[];
  targets: ProtocolTargets;
  firstLine: string[];         // drug IDs from DRUG_DB
  stepProtocol: string[];
  complications: string[];
  review: string;
}

export interface DrugDose {
  indication: string;
  start: string;
  max: string;
  renal?: string;
  hepatic?: string;
}

export interface DrugInteraction {
  drug: string;
  severity: 'mild' | 'moderate' | 'severe';
  msg: string;
}

export interface DrugProfile {
  name: string;
  class: string;
  doses: DrugDose[];
  route: string;
  forms: string[];
  ci: string[];
  cautions: string[];
  interactions: DrugInteraction[];
  monitoring: string[];
  instructions: string;
  sideEffects: string[];
  pregnancy: string;
  counselling: string;
}

export interface TriggeredAlert {
  id: string;
  disease: string;
  level: AlertLevel;
  message: string;
  param: string;
  value: number;
  threshold: number;
}

export interface PrescriptionIntelligence {
  warnings: { level: AlertLevel; msg: string }[];
  suggestions: string[];
  doseGuide: DrugDose | null;
  interactions: { level: AlertLevel; msg: string }[];
}

// ─── Disease Protocol Registry ───────────────────────────────────────────────
export const DISEASE_PROTOCOLS: Record<string, DiseaseProtocol> = {
  hypertension: {
    name: 'Hypertension', dept: 'CARD', icd: 'I10',
    monitoring: ['bp_monitor', 'weight_tracker', 'ecg_monitor', 'renal_panel', 'electrolytes'],
    alerts: [
      { param: 'sbp', op: '>=', val: 180, level: 'emergency', msg: 'Hypertensive emergency — IV management required. Consider IV labetalol/hydralazine.' },
      { param: 'sbp', op: '>=', val: 160, level: 'urgent',    msg: 'Hypertensive urgency — reassess within 1 hour. Oral antihypertensive required.' },
      { param: 'dbp', op: '>=', val: 110, level: 'urgent',    msg: 'Diastolic critically elevated — high end-organ damage risk.' },
      { param: 'sbp', op: '<',  val: 90,  level: 'urgent',    msg: 'Hypotension — review antihypertensive doses urgently.' },
    ],
    targets: { sbp: '<130 mmHg', dbp: '<80 mmHg', map: '<93 mmHg' },
    firstLine: ['amlodipine', 'lisinopril', 'losartan', 'bisoprolol'],
    stepProtocol: [
      'Step 1: CCB (amlodipine) or ACEI/ARB monotherapy',
      'Step 2: CCB + ACEI/ARB combination — preferred if not at target',
      'Step 3: Add low-dose thiazide diuretic (indapamide/HCTZ)',
      'Step 4: Add spironolactone 25mg OD — resistant hypertension',
      'Refer to specialist if BP uncontrolled on 4 agents',
    ],
    complications: ['LVH', 'CKD', 'Stroke', 'MI', 'Aortic dissection', 'Retinopathy'],
    review: 'Monthly until controlled, 3-monthly when stable',
  },

  diabetes_t2: {
    name: 'Type 2 Diabetes', dept: 'ENDO', icd: 'E11',
    monitoring: ['glucose_tracker', 'hba1c_tracker', 'weight_tracker', 'bp_monitor', 'renal_panel', 'foot_check', 'eye_check'],
    alerts: [
      { param: 'glucose', op: '>',  val: 13.9, level: 'urgent',    msg: 'Severe hyperglycaemia — check ketones, assess hydration, review medications.' },
      { param: 'glucose', op: '<',  val: 3.9,  level: 'emergency', msg: 'HYPOGLYCAEMIA — administer 15g fast-acting glucose NOW. Recheck in 15 min.' },
      { param: 'glucose', op: '<',  val: 2.8,  level: 'emergency', msg: 'SEVERE HYPOGLYCAEMIA — IV Dextrose 50ml of 50% or Glucagon 1mg IM.' },
      { param: 'hba1c',   op: '>',  val: 10,   level: 'urgent',    msg: 'HbA1c critically elevated — intensify therapy, consider insulin.' },
    ],
    targets: { hba1c: '<53 mmol/mol (<7%)', fasting_glucose: '4–7 mmol/L', postmeal_glucose: '<8.5 mmol/L', bp: '<130/80 mmHg' },
    firstLine: ['metformin', 'empagliflozin', 'sitagliptin', 'semaglutide'],
    stepProtocol: [
      'Step 1: Lifestyle intensification + Metformin (if eGFR ≥30)',
      'Step 2: Add SGLT2 inhibitor (empagliflozin) — especially if CVD/CKD',
      'Step 3: Add GLP-1 RA (semaglutide) — weight benefit, CV protective',
      'Step 4: Basal insulin (glargine) if HbA1c >10% or symptomatic',
      'Step 5: Intensified insulin or dual GIP/GLP-1 agonist (tirzepatide)',
    ],
    complications: ['DKA', 'HHS', 'Hypoglycaemia', 'Retinopathy', 'Nephropathy', 'Neuropathy', 'Cardiovascular disease', 'Foot ulcers'],
    review: '3-monthly HbA1c, annual foot/eye/renal/lipid review',
  },

  heart_failure: {
    name: 'Heart Failure (HFrEF)', dept: 'CARD', icd: 'I50.0',
    monitoring: ['weight_tracker', 'bp_monitor', 'hr_monitor', 'fluid_balance', 'electrolytes', 'bnp_monitor', 'renal_panel'],
    alerts: [
      { param: 'weight_gain_24h', op: '>=', val: 2,   level: 'urgent',    msg: '≥2kg weight gain in 24h — fluid overload, restrict fluids, contact doctor.' },
      { param: 'sbp',             op: '<',  val: 90,  level: 'emergency', msg: 'Cardiogenic shock risk — urgent clinical assessment. Suspend diuretics/vasodilators.' },
      { param: 'hr',              op: '>',  val: 110, level: 'urgent',    msg: 'Tachycardia in HF — review volume status, electrolytes and medications.' },
      { param: 'potassium',       op: '>',  val: 5.5, level: 'urgent',    msg: 'Hyperkalaemia — withhold ACEI/ARB/MRA. ECG required.' },
    ],
    targets: { weight: 'Stable daily weight (±0.5kg)', bp: 'Systolic 90–130 mmHg', hr: '60–70 bpm at rest', ef: 'Target EF improvement with therapy' },
    firstLine: ['sacubitril_valsartan', 'bisoprolol', 'spironolactone', 'empagliflozin'],
    stepProtocol: [
      'Initiate ACEI/ARB → switch to ARNI (sacubitril/valsartan) when stable',
      'Beta-blocker: Start low (bisoprolol 1.25mg) and double every 2 weeks',
      'MRA: Add spironolactone/eplerenone if eGFR >30 and K+ <5.0',
      'SGLT2i: Add empagliflozin 10mg OD — proven mortality benefit',
      'Consider ICD/CRT referral if EF remains <35% on optimal therapy',
    ],
    complications: ['Acute decompensation', 'Arrhythmia', 'Cardiogenic shock', 'Sudden cardiac death', 'Renal failure'],
    review: '2-weekly until optimised, 3-monthly when stable',
  },

  asthma: {
    name: 'Asthma', dept: 'RESP', icd: 'J45',
    monitoring: ['peak_flow', 'spo2_monitor', 'symptom_score', 'exacerbation_log', 'medication_adherence'],
    alerts: [
      { param: 'pef',  op: '<', val: 50, level: 'emergency', msg: 'LIFE-THREATENING attack — 10 puffs salbutamol via spacer, nebulise, call 999.' },
      { param: 'pef',  op: '<', val: 75, level: 'urgent',    msg: 'Moderate-severe attack — initiate rescue protocol, consider oral prednisolone.' },
      { param: 'spo2', op: '<', val: 92, level: 'emergency', msg: 'Hypoxia in asthma — O2 therapy required, target SpO2 94–98%.' },
    ],
    targets: { pef: '>80% personal best', spo2: '94–98%', symptom_control: 'Daytime symptoms ≤2/week, no night waking' },
    firstLine: ['salbutamol', 'beclometasone', 'salmeterol_fluticasone', 'montelukast'],
    stepProtocol: [
      'Step 1: SABA (salbutamol) PRN only — if symptoms <3/week',
      'Step 2: Low-dose ICS (beclometasone 200mcg/day) + SABA PRN',
      'Step 3: ICS-LABA fixed combination — preferred over ICS uptitration',
      'Step 4: Medium-high ICS-LABA (symbicort MART or Fostair)',
      'Step 5: Specialist review — consider biologics (dupilumab, omalizumab)',
    ],
    complications: ['Status asthmaticus', 'Pneumothorax', 'Respiratory failure', 'Medication side effects (ICS osteoporosis)'],
    review: '4–6 weekly until controlled, 6-monthly review',
  },

  ckd: {
    name: 'Chronic Kidney Disease', dept: 'RENAL', icd: 'N18',
    monitoring: ['renal_panel', 'bp_monitor', 'electrolytes', 'urine_acr', 'fluid_balance', 'hb_monitor', 'phosphate'],
    alerts: [
      { param: 'egfr',      op: '<',  val: 15,  level: 'emergency', msg: 'eGFR <15 — CKD Stage 5. Urgent nephrology referral for RRT planning.' },
      { param: 'egfr',      op: '<',  val: 30,  level: 'urgent',    msg: 'eGFR <30 — review all medications for renal dosing. Nephrology referral.' },
      { param: 'potassium', op: '>=', val: 6.0, level: 'emergency', msg: 'HYPERKALAEMIA ≥6.0 — ECG urgently, consider calcium gluconate + resonium.' },
      { param: 'potassium', op: '>=', val: 5.5, level: 'urgent',    msg: 'Hyperkalaemia — restrict dietary K+, hold K+-sparing agents.' },
    ],
    targets: { bp: '<130/80 mmHg', egfr_decline: '<2 mL/min/yr', acr: '<3 mg/mmol', hb: '100–120 g/L' },
    firstLine: ['lisinopril', 'amlodipine', 'furosemide', 'sodium_bicarbonate'],
    stepProtocol: [
      'BP: ACEI/ARB first line — renoprotective (hold if K+>5.5 or eGFR drops >25%)',
      'Anaemia: Ferritin-guided IV iron, then erythropoietin (ESA) if Hb <100',
      'Bone disease: Phosphate binders (calcium carbonate), active Vitamin D',
      'Acidosis: Sodium bicarbonate if serum bicarb <22 mmol/L',
      'Refer nephrology: eGFR <30, proteinuria >1g/day, uncertain diagnosis',
    ],
    complications: ['Hyperkalaemia', 'Fluid overload', 'Renal anaemia', 'Renal osteodystrophy', 'ESRD', 'Cardiovascular disease'],
    review: '3-monthly (CKD 3–4), monthly (CKD 5)',
  },

  af: {
    name: 'Atrial Fibrillation', dept: 'CARD', icd: 'I48',
    monitoring: ['ecg_monitor', 'hr_monitor', 'bp_monitor', 'inr_monitor', 'stroke_risk'],
    alerts: [
      { param: 'hr',  op: '>',  val: 120, level: 'urgent', msg: 'Uncontrolled ventricular rate — rate control needed. Consider bisoprolol or digoxin.' },
      { param: 'inr', op: '>',  val: 4.0, level: 'urgent', msg: 'Supratherapeutic INR — hold warfarin, major bleeding risk. Recheck in 24h.' },
      { param: 'inr', op: '<',  val: 1.5, level: 'urgent', msg: 'Sub-therapeutic INR — stroke risk increased. Increase warfarin dose.' },
    ],
    targets: { hr: '60–80 bpm rest, <110 bpm exercise', inr: '2.0–3.0 (warfarin patients)' },
    firstLine: ['bisoprolol', 'apixaban', 'warfarin', 'digoxin'],
    stepProtocol: [
      'CHA₂DS₂-VASc: Anticoagulate if score ≥1 (male) or ≥2 (female)',
      'DOAC preferred over warfarin (apixaban/rivaroxaban) unless valve disease',
      'Rate control: Bisoprolol or diltiazem first line',
      'Rhythm control: Consider if <1yr AF, young, symptomatic',
      'EP referral: Pulmonary vein isolation if drug-refractory',
    ],
    complications: ['Stroke', 'Systemic embolism', 'Heart failure', 'Tachycardia-induced cardiomyopathy', 'Bleeding on anticoagulation'],
    review: '4–6 weekly on warfarin, 6-monthly stable AF',
  },

  copd: {
    name: 'COPD', dept: 'RESP', icd: 'J44',
    monitoring: ['spo2_monitor', 'peak_flow', 'exacerbation_log', 'symptom_score', 'nutrition'],
    alerts: [
      { param: 'spo2', op: '<',  val: 88, level: 'emergency', msg: 'Severe hypoxia — controlled O2 24–28%, call 999. Avoid high-flow O2 (hypercapnia risk).' },
      { param: 'spo2', op: '<',  val: 92, level: 'urgent',    msg: 'Hypoxia — review O2 therapy, inhaler technique and exacerbation status.' },
    ],
    targets: { spo2: '88–92% (COPD target range)', exacerbations: 'Reduce to <2/yr', catscore: 'CAT score <10' },
    firstLine: ['tiotropium', 'salmeterol_fluticasone', 'salbutamol', 'prednisolone'],
    stepProtocol: [
      'GOLD A: SAMA or SABA PRN',
      'GOLD B: LAMA (tiotropium) + SABA rescue',
      'GOLD E: LAMA + LABA combination (umeclidinium-vilanterol)',
      'Add ICS if eosinophils ≥300/μL, frequent exacerbations',
      'Pulmonary rehab: All symptomatic patients after first exacerbation',
    ],
    complications: ['Acute exacerbation', 'Cor pulmonale', 'Polycythaemia', 'Respiratory failure', 'Anxiety/depression'],
    review: '6–12 monthly stable, 4-weekly post-exacerbation',
  },

  epilepsy: {
    name: 'Epilepsy', dept: 'NEURO', icd: 'G40',
    monitoring: ['seizure_log', 'medication_adherence', 'eeg_trend', 'sleep_monitor', 'driving_status'],
    alerts: [
      { param: 'seizures_week',    op: '>',  val: 3, level: 'urgent',    msg: 'Increased seizure frequency — urgent neurology review. Check compliance.' },
      { param: 'seizure_duration', op: '>=', val: 5, level: 'emergency', msg: 'POSSIBLE STATUS EPILEPTICUS — Diazepam 10mg PR or IV. Call 999.' },
    ],
    targets: { seizure_free: 'Goal: seizure-free on monotherapy', compliance: '>90% medication adherence' },
    firstLine: ['levetiracetam', 'lamotrigine', 'valproate', 'carbamazepine'],
    stepProtocol: [
      'Monotherapy: Choose based on seizure type (focal/generalised)',
      'Lamotrigine preferred in women of childbearing age (avoid valproate)',
      'Inadequate control: Optimise dose before switching or adding',
      'Add-on therapy: Add second agent appropriate to seizure type',
      'Drug-resistant: Refer for epilepsy surgery evaluation (VNS, ketogenic diet)',
    ],
    complications: ['Status epilepticus', 'SUDEP', 'Medication teratogenicity', 'Cognitive effects', 'Driving restriction'],
    review: 'Monthly until seizure-free, 6-monthly thereafter',
  },

  hypothyroidism: {
    name: 'Hypothyroidism', dept: 'ENDO', icd: 'E03.9',
    monitoring: ['tsh_monitor', 't4_monitor', 'weight_tracker', 'hr_monitor', 'cholesterol'],
    alerts: [
      { param: 'tsh', op: '>',  val: 10,  level: 'urgent',    msg: 'Overt hypothyroidism — initiate or uptitrate levothyroxine.' },
      { param: 'tsh', op: '>',  val: 100, level: 'emergency', msg: 'MYXOEDEMA COMA risk — urgent hospital admission. IV T4 + hydrocortisone.' },
      { param: 'tsh', op: '<',  val: 0.1, level: 'urgent',    msg: 'Suppressed TSH — over-replacement risk. Reduce levothyroxine dose.' },
    ],
    targets: { tsh: '0.4–2.0 mIU/L', ft4: '12–22 pmol/L' },
    firstLine: ['levothyroxine'],
    stepProtocol: [
      'Young healthy adult: Start 1.6 mcg/kg/day',
      'Elderly or cardiac disease: Start 12.5–25 mcg OD, titrate cautiously',
      'Increase by 25 mcg every 6–8 weeks until TSH in target',
      'Take 30–60 min before food; separate from calcium/iron by 4h',
      'Pregnancy: Increase dose ~30–50%, monitor TSH every 4 weeks',
    ],
    complications: ['Myxoedema coma', 'Cardiovascular disease', 'Subfertility', 'Hyponatraemia', 'Over-replacement: AF/osteoporosis'],
    review: '6-weekly until stable, annual thereafter',
  },

  depression: {
    name: 'Major Depressive Disorder', dept: 'PSYCH', icd: 'F32',
    monitoring: ['phq9_tracker', 'sleep_monitor', 'medication_adherence', 'suicide_risk', 'mood_tracker'],
    alerts: [
      { param: 'phq9',    op: '>=', val: 15, level: 'urgent',    msg: 'Moderately-severe depression — urgent psychiatric review. Safety assessment needed.' },
      { param: 'phq9_q9', op: '>',  val: 0,  level: 'emergency', msg: 'SUICIDAL IDEATION FLAGGED — immediate safety assessment. Do not leave patient alone.' },
    ],
    targets: { phq9: '<5 (remission)', response: '≥50% reduction in PHQ-9 at 8 weeks', remission: 'PHQ-9 <5 at 12–16 weeks' },
    firstLine: ['sertraline', 'fluoxetine', 'venlafaxine', 'mirtazapine'],
    stepProtocol: [
      'First line: SSRI (sertraline 50mg OD) — monitor at 2, 4, 8 weeks',
      'Inadequate response at 8 weeks: Increase dose to maximum tolerated',
      'Second line: Switch to SNRI (venlafaxine) or mirtazapine',
      'Augmentation: Add lithium, quetiapine or aripiprazole',
      'Severe/refractory: ECT evaluation. Inpatient if suicide risk.',
    ],
    complications: ['Suicidality', 'Treatment-resistant depression', 'Manic switch', 'Social/occupational impairment'],
    review: '2-weekly initially, monthly when improving',
  },

  peptic_ulcer: {
    name: 'Peptic Ulcer Disease', dept: 'GI', icd: 'K27',
    monitoring: ['symptom_score', 'hp_test', 'medication_adherence', 'endoscopy_follow'],
    alerts: [
      { param: 'hb_drop', op: '>',  val: 20, level: 'emergency', msg: 'Acute GI bleed suspected — urgent gastroscopy. IV PPI + fluid resuscitation.' },
      { param: 'pain',    op: '>=', val: 8,  level: 'urgent',    msg: 'Severe epigastric pain — urgent assessment, rule out perforation (AXR erect).' },
    ],
    targets: { hp_eradication: 'Confirmed HP eradication at 4–6 weeks post-treatment', symptoms: 'Pain-free at 4 weeks of therapy' },
    firstLine: ['omeprazole', 'amoxicillin', 'clarithromycin', 'lansoprazole'],
    stepProtocol: [
      'HP-positive: Triple therapy 7–14 days (PPI + Amoxicillin + Clarithromycin)',
      'Confirm eradication: Urea breath test 4–6 weeks post-treatment',
      'HP-negative: PPI 4–8 weeks. Identify and remove cause (NSAIDs, stress)',
      'NSAID-induced: Stop NSAID → PPI 8 weeks. Switch to COX-2 inhibitor.',
      'Refractory/2nd eradication failure: Quadruple therapy with bismuth',
    ],
    complications: ['GI haemorrhage', 'Perforation', 'Gastric outlet obstruction', 'Malignant transformation'],
    review: '4–6 weeks post-treatment for HP eradication test',
  },

  preeclampsia: {
    name: 'Pre-eclampsia', dept: 'OB', icd: 'O14',
    monitoring: ['bp_monitor', 'urine_protein', 'fluid_balance', 'fetal_hr', 'platelet_count', 'lft_monitor', 'maternal_symptoms'],
    alerts: [
      { param: 'sbp', op: '>=', val: 160, level: 'emergency', msg: 'SEVERE HYPERTENSION — IV Labetalol stat. MgSO4 for seizure prophylaxis. Call obstetrics.' },
      { param: 'sbp', op: '>=', val: 140, level: 'urgent',    msg: 'Hypertension in pregnancy — start oral antihypertensive. Increase monitoring.' },
    ],
    targets: { sbp: '130–150 mmHg', dbp: '80–100 mmHg', urine_protein: '<0.3g/24h' },
    firstLine: ['labetalol', 'nifedipine', 'hydralazine', 'magnesium_sulfate'],
    stepProtocol: [
      'Mild (140–159/90–109): Oral labetalol or nifedipine + twice-weekly review',
      'Severe (≥160/110): IV labetalol loading + MgSO4 seizure prophylaxis',
      'Fluid management: Restrict to 80ml/hr to prevent pulmonary oedema',
      'Delivery: 37 weeks (mild), immediate if severe/HELLP/uncontrolled',
      'Postpartum: Continue antihypertensives ≥6 weeks. Aspirin next pregnancy.',
    ],
    complications: ['Eclampsia', 'HELLP syndrome', 'Placental abruption', 'Fetal growth restriction', 'Maternal stroke'],
    review: 'Twice-weekly until delivery',
  },
};

// ─── Drug Database ────────────────────────────────────────────────────────────
export const DRUG_DB: Record<string, DrugProfile> = {
  amlodipine: {
    name: 'Amlodipine', class: 'Calcium Channel Blocker (Dihydropyridine)',
    doses: [
      { indication: 'Hypertension / Angina', start: '5mg OD', max: '10mg OD', renal: 'No dose adjustment required', hepatic: 'Start 2.5mg OD in severe hepatic impairment' },
    ],
    route: 'Oral', forms: ['2.5mg tablet', '5mg tablet', '10mg tablet'],
    ci: ['Cardiogenic shock', 'Severe aortic stenosis', 'Haemodynamically significant hypotension', 'Hypersensitivity to CCBs'],
    cautions: ['Heart failure with reduced EF (use cautiously)', 'Hepatic impairment', 'Elderly (fall and hypotension risk)'],
    interactions: [
      { drug: 'simvastatin',   severity: 'moderate', msg: 'Increases simvastatin AUC — cap simvastatin at 20mg/day when co-prescribed with amlodipine' },
      { drug: 'cyclosporine',  severity: 'severe',   msg: 'Significantly elevated cyclosporine blood levels — avoid or monitor trough levels closely' },
      { drug: 'tacrolimus',    severity: 'moderate', msg: 'Elevated tacrolimus levels — monitor drug levels; may need dose reduction' },
    ],
    monitoring: ['BP 2–4 weeks after initiation or dose change', 'LFTs if hepatic disease', 'Ankle oedema assessment at each visit'],
    instructions: 'Take once daily at the same time. Can be taken with or without food. Do not crush.',
    sideEffects: ['Peripheral oedema (most common — dose-dependent)', 'Flushing', 'Headache', 'Dizziness', 'Reflex tachycardia', 'Gingival hyperplasia (rare)'],
    pregnancy: 'Category C — limited data. Avoid in 1st trimester. Use only if benefit outweighs risk in later pregnancy.',
    counselling: 'Ankle swelling is common and not dangerous — elevate legs when resting. Contact your doctor immediately if you develop chest pain or severe dizziness.',
  },

  lisinopril: {
    name: 'Lisinopril', class: 'ACE Inhibitor',
    doses: [
      { indication: 'Hypertension',  start: '5mg OD',   max: '40mg OD',  renal: 'eGFR 10–30: start 2.5–5mg OD. eGFR <10: avoid.' },
      { indication: 'Heart Failure', start: '2.5mg OD', max: '35mg OD',  renal: 'Start 2.5mg if eGFR <30. Monitor K+ and creatinine.' },
      { indication: 'Post-MI',       start: '5mg BD',   max: '10mg BD',  renal: 'Reduce if eGFR <30' },
      { indication: 'Diabetic Nephropathy', start: '10mg OD', max: '20mg OD', renal: 'Monitor eGFR and K+ closely' },
    ],
    route: 'Oral', forms: ['2.5mg tablet', '5mg tablet', '10mg tablet', '20mg tablet'],
    ci: ['History of ACEI-induced angioedema', 'Bilateral renal artery stenosis', 'Pregnancy (all trimesters)', 'K+ >5.5 mmol/L', 'Concurrent aliskiren in DM or CKD'],
    cautions: ['CKD — monitor K+ and creatinine at 1–2 weeks then 3-monthly', 'First-dose hypotension especially if hypovolaemic', 'Aortic/mitral stenosis', 'Hypertrophic cardiomyopathy'],
    interactions: [
      { drug: 'potassium_sparing_diuretics', severity: 'severe',   msg: 'Severe hyperkalaemia risk — monitor K+ weekly initially. Avoid unless specialist guidance.' },
      { drug: 'nsaids',                      severity: 'moderate', msg: 'Reduced antihypertensive effect + increased nephrotoxicity — avoid; use paracetamol instead' },
      { drug: 'aliskiren',                   severity: 'severe',   msg: 'Dual RAAS blockade — CONTRAINDICATED in DM/CKD (increased adverse renal events)' },
      { drug: 'lithium',                     severity: 'moderate', msg: 'Increases lithium levels — monitor lithium carefully; reduce dose if needed' },
    ],
    monitoring: ['eGFR + K+ at baseline, 1–2 weeks post-start, then 3-monthly', 'BP monitoring — first-dose hypotension especially in volume-depleted', 'Serum creatinine — acceptable rise up to 30% of baseline'],
    instructions: 'Take at the same time each day. Rise slowly from sitting or lying to prevent dizziness, especially on first dose.',
    sideEffects: ['Dry cough (10–20% — switch to ARB if intolerable)', 'First-dose hypotension', 'Hyperkalaemia', 'Angioedema (STOP immediately — medical emergency)', 'Acute kidney injury'],
    pregnancy: 'CONTRAINDICATED in all trimesters — causes renal agenesis and skull ossification defects. STOP immediately if pregnancy confirmed.',
    counselling: 'If you develop sudden swelling of face, lips, tongue or throat — STOP this medicine and seek emergency care IMMEDIATELY. Report persistent dry cough to your doctor.',
  },

  metformin: {
    name: 'Metformin', class: 'Biguanide',
    doses: [
      { indication: 'Type 2 Diabetes', start: '500mg OD–BD with meals', max: '1000mg TDS (3g/day max)', renal: 'eGFR 30–45: use 1g/day max. eGFR <30: CONTRAINDICATED.', hepatic: 'Avoid in significant hepatic impairment (lactic acidosis risk)' },
    ],
    route: 'Oral', forms: ['500mg tablet', '850mg tablet', '1000mg tablet', '500mg SR tablet'],
    ci: ['eGFR <30 mL/min (lactic acidosis risk)', 'Acute illness with dehydration, sepsis or shock', 'Planned iodinated contrast (hold 48h)', 'Hepatic failure (ALT >3x ULN)', 'Significant alcohol use', 'Lactic acidosis history'],
    cautions: ['Monitor eGFR 3–6 monthly', 'Hold perioperatively if major surgery', 'Vitamin B12 deficiency with long-term use', 'eGFR 30–45: reduce dose and monitor carefully'],
    interactions: [
      { drug: 'alcohol',            severity: 'severe',   msg: 'Significantly increases lactic acidosis risk — advise to minimise alcohol intake' },
      { drug: 'iodinated_contrast', severity: 'severe',   msg: 'Hold metformin 48h before contrast procedure — acute kidney injury → lactic acidosis risk' },
      { drug: 'cimetidine',         severity: 'mild',     msg: 'Reduces renal clearance of metformin by 40% — monitor for metformin toxicity' },
    ],
    monitoring: ['eGFR at baseline and every 3–6 months', 'HbA1c 3-monthly until stable, then 6-monthly', 'Vitamin B12 annually in long-term users', 'LFTs annually'],
    instructions: 'Take with or immediately after meals to minimise GI side effects. Start on lowest dose and increase weekly to improve GI tolerance.',
    sideEffects: ['Nausea/vomiting/diarrhoea (very common initially — usually resolves)', 'Metallic taste', 'Reduced vitamin B12 absorption', 'Rare: Lactic acidosis (medical emergency)'],
    pregnancy: 'Generally considered safe — may be used in gestational diabetes under specialist guidance. Insulin remains gold standard.',
    counselling: 'GI side effects are very common when starting — take with food and start on the lowest dose. Report severe muscle pain, difficulty breathing or extreme fatigue urgently (lactic acidosis warning signs).',
  },

  salbutamol: {
    name: 'Salbutamol (Albuterol)', class: 'Short-Acting Beta-2 Agonist (SABA)',
    doses: [
      { indication: 'Acute Asthma — Inhaler', start: '100–200 mcg (1–2 puffs) PRN', max: 'Up to 10 puffs via spacer in emergency' },
      { indication: 'Acute Asthma — Nebuliser', start: '2.5mg via nebuliser PRN', max: '5mg q20min in severe attack' },
    ],
    route: 'Inhaled / Nebulised / IV (ICU only)', forms: ['100 mcg/actuation MDI', '2.5mg/2.5mL nebuliser solution'],
    ci: ['Hypersensitivity to salbutamol or excipients'],
    cautions: ['Tachyarrhythmias', 'Hypokalaemia (high doses → K+ depletion)', 'Hyperthyroidism', 'Hypertension', 'Diabetes (may elevate blood glucose)'],
    interactions: [
      { drug: 'beta_blockers', severity: 'severe',   msg: 'NON-SELECTIVE beta-blockers BLOCK bronchodilator effect — contraindicated in asthma. Use cardioselective only with caution.' },
      { drug: 'theophylline',  severity: 'moderate', msg: 'Additive hypokalaemia — monitor serum K+ especially in acute severe asthma' },
      { drug: 'diuretics',     severity: 'moderate', msg: 'Additive hypokalaemia with loop and thiazide diuretics — monitor K+' },
    ],
    monitoring: ['HR, BP and SpO2 during acute attack', 'Serum K+ if high-dose nebulisation (>3 back-to-back)', 'Peak flow before and 20 min after dose in acute attack'],
    instructions: 'Shake inhaler before use. Exhale fully, then inhale slowly and deeply while pressing. Hold breath for 10 seconds. Wait 30 seconds between puffs. Use spacer for most effective delivery.',
    sideEffects: ['Fine tremor (most common)', 'Tachycardia', 'Headache', 'Hypokalaemia (high doses)', 'Paradoxical bronchospasm (rare — STOP and seek help)'],
    pregnancy: 'Safe to use — benefits outweigh risks. Essential for acute asthma control in pregnancy.',
    counselling: 'Use ONLY for relief of symptoms. If you need it more than 3 times a week, your asthma is not controlled — contact your doctor. If no improvement after 10 puffs via spacer — call 999 immediately.',
  },

  warfarin: {
    name: 'Warfarin', class: 'Vitamin K Antagonist (Anticoagulant)',
    doses: [
      { indication: 'Atrial Fibrillation', start: 'Loading: 5–10mg OD × 2 days, then dose by INR', max: 'Titrated to maintain INR 2.0–3.0' },
      { indication: 'Mechanical Heart Valve', start: 'As above — titrate to INR 2.5–3.5', max: 'INR target: 2.5–3.5 (higher risk valves)' },
      { indication: 'VTE Treatment', start: '5–10mg OD × 2 days with LMWH bridge', max: 'INR 2.0–3.0 — stop LMWH once INR ≥2 for 2 days' },
    ],
    route: 'Oral', forms: ['1mg tablet (brown)', '3mg tablet (blue)', '5mg tablet (pink)'],
    ci: ['Active clinically significant bleeding', 'Pregnancy (all trimesters — warfarin embryopathy)', 'Severe hepatic disease with coagulopathy', 'Confirmed intracranial haemorrhage'],
    cautions: ['HUNDREDS of drug interactions — always check BNF', 'Consistent dietary Vit K intake critical', 'Fall risk (elderly)', 'Recent major surgery', 'Peptic ulcer disease', 'Uncontrolled hypertension'],
    interactions: [
      { drug: 'aspirin',          severity: 'severe',   msg: 'Significantly increased bleeding risk — avoid combination. If essential, use minimum dose with PPI.' },
      { drug: 'nsaids',           severity: 'severe',   msg: 'Potentiates anticoagulant effect AND GI bleed risk — avoid combination, use paracetamol.' },
      { drug: 'clarithromycin',   severity: 'severe',   msg: 'CYP2C9 inhibitor — markedly elevates INR. Reduce warfarin dose ~25–50%, check INR in 3–4 days.' },
      { drug: 'fluconazole',      severity: 'severe',   msg: 'Strong CYP2C9 inhibitor — can double INR. Reduce warfarin 25–50%, check INR urgently in 3 days.' },
      { drug: 'amiodarone',       severity: 'severe',   msg: 'Potentiates warfarin markedly and durably — reduce dose 30–50%, weekly INR monitoring for 1 month.' },
      { drug: 'st_johns_wort',    severity: 'severe',   msg: 'CYP450 inducer — significantly reduces warfarin effect. AVOID combination.' },
      { drug: 'metronidazole',    severity: 'severe',   msg: 'CYP2C9 inhibitor — increases INR significantly. Monitor INR every 2–3 days during course.' },
      { drug: 'ciprofloxacin',    severity: 'moderate', msg: 'Increases INR — check INR after 2–3 days and adjust warfarin if necessary.' },
    ],
    monitoring: ['INR daily until stable (2 consecutive therapeutic results), then weekly × 4, then monthly', 'Check INR 3–5 days after ANY dose change or new interacting drug', 'Baseline FBC, LFTs, renal function'],
    instructions: 'Take at the same time each day (usually evening). Carry your anticoagulant alert card at all times. Report any unusual bleeding immediately.',
    sideEffects: ['Haemorrhage (major risk — epistaxis, haematuria, intracranial)', 'Skin necrosis (rare, first week — protein C deficiency)', 'Purple toe syndrome', 'Alopecia (rare)'],
    pregnancy: 'CONTRAINDICATED — crosses placenta. Causes warfarin embryopathy (nasal hypoplasia, stippled epiphyses). Use LMWH throughout pregnancy.',
    counselling: 'Maintain a CONSISTENT diet — sudden large changes in leafy green vegetables (high Vit K: spinach, kale, broccoli) will change your INR. NEVER take aspirin or ibuprofen without doctor approval. Tell every healthcare provider you are taking warfarin.',
  },

  bisoprolol: {
    name: 'Bisoprolol', class: 'Beta-1 Selective Beta-Blocker',
    doses: [
      { indication: 'Hypertension',    start: '2.5–5mg OD',  max: '20mg OD' },
      { indication: 'Heart Failure',   start: '1.25mg OD (very low — uptitrate every 2 weeks)', max: '10mg OD' },
      { indication: 'Rate Control AF', start: '2.5–5mg OD',  max: '10mg OD' },
      { indication: 'Angina',          start: '5mg OD',       max: '20mg OD' },
    ],
    route: 'Oral', forms: ['1.25mg tablet', '2.5mg tablet', '5mg tablet', '10mg tablet'],
    ci: ['Significant asthma or bronchospasm', 'Decompensated heart failure', 'Cardiogenic shock', '2nd/3rd degree AV block', 'Sick sinus syndrome', 'HR <50 bpm', 'Severe peripheral arterial disease', 'Pheochromocytoma (without alpha-blocker cover)'],
    cautions: ['COPD — use with caution, monitor for bronchospasm', 'Diabetes — masks hypoglycaemia symptoms (except sweating)', 'Depression — beta-blockers may worsen', 'Peripheral vascular disease', 'NEVER stop abruptly — taper over 2–4 weeks'],
    interactions: [
      { drug: 'verapamil',   severity: 'severe',   msg: 'Severe bradycardia/AV block — AVOID IV verapamil with bisoprolol. Oral combination requires close monitoring.' },
      { drug: 'diltiazem',   severity: 'moderate', msg: 'Additive bradycardia and AV block — monitor ECG. Avoid in LV dysfunction.' },
      { drug: 'amiodarone',  severity: 'moderate', msg: 'Additive bradycardia and AV node suppression — monitor heart rate and BP closely.' },
      { drug: 'insulin',     severity: 'moderate', msg: 'Masks hypoglycaemia symptoms (except sweating) — educate patient to monitor glucose more frequently.' },
      { drug: 'clonidine',   severity: 'moderate', msg: 'Rebound hypertension if clonidine withdrawn — taper clonidine after stopping bisoprolol' },
    ],
    monitoring: ['Heart rate at each visit (target 60–70 bpm in HF; <110 bpm in AF)', 'BP monitoring', 'Symptoms of bradycardia, AV block, or HF decompensation', 'Spirometry in COPD patients before initiating'],
    instructions: 'Take at the same time each day. Do NOT stop this medicine suddenly — always taper over 2–4 weeks under medical guidance.',
    sideEffects: ['Fatigue/lethargy (common)', 'Bradycardia', 'Cold extremities', 'Bronchospasm (avoid in asthma)', 'Erectile dysfunction', 'Masked hypoglycaemia', 'Nightmare/sleep disturbance'],
    pregnancy: 'Relatively safe (Category C) — may cause neonatal bradycardia, IUGR. Monitor closely. Discontinue 2–3 days before delivery if possible.',
    counselling: 'Never stop this medication suddenly — it can trigger rebound angina or heart attack. Tell your doctor if you develop a pulse <50 bpm or excessive dizziness.',
  },

  apixaban: {
    name: 'Apixaban', class: 'Direct Oral Anticoagulant — Factor Xa Inhibitor',
    doses: [
      { indication: 'AF — Stroke Prevention (standard)', start: '5mg BD', max: '5mg BD standard; 2.5mg BD if ≥2 of: age≥80, weight≤60kg, Cr≥133', renal: 'eGFR 15–29: consider 2.5mg BD; eGFR <15: avoid' },
      { indication: 'VTE Treatment', start: '10mg BD × 7 days', max: 'Then 5mg BD × 6 months; 2.5mg BD for extended prophylaxis' },
    ],
    route: 'Oral', forms: ['2.5mg tablet', '5mg tablet'],
    ci: ['Active clinically significant bleeding', 'Hepatic disease associated with coagulopathy', 'Prosthetic mechanical heart valves (valvular AF — use warfarin)', 'eGFR <15 mL/min', 'Antiphospholipid syndrome (triple positive)'],
    cautions: ['Spinal/epidural: Hold 24–48h before procedure', 'Moderate hepatic impairment (Child-Pugh B)', 'Elderly with high fall risk', 'Concurrent strong CYP3A4 inhibitors'],
    interactions: [
      { drug: 'ketoconazole',    severity: 'severe',   msg: '5-fold increase in apixaban exposure — CONTRAINDICATED. Avoid systemic azole antifungals.' },
      { drug: 'clarithromycin',  severity: 'moderate', msg: 'Increases apixaban exposure ~60% — use with caution, consider dose reduction to 2.5mg BD' },
      { drug: 'rifampicin',      severity: 'severe',   msg: 'Strong inducer — reduces apixaban levels 54%. Significant stroke risk. Avoid combination.' },
      { drug: 'carbamazepine',   severity: 'severe',   msg: 'CYP3A4 inducer — markedly reduces apixaban. Avoid combination; consider warfarin instead.' },
    ],
    monitoring: ['No routine INR monitoring — advantage over warfarin', 'Annual eGFR and FBC', 'LFTs if hepatic disease', 'Signs and symptoms of bleeding at each visit'],
    instructions: 'Take twice daily approximately 12 hours apart. Can be taken with or without food. Do not crush tablets.',
    sideEffects: ['Bleeding (most significant risk)', 'Anaemia', 'Bruising/haematoma', 'Nausea'],
    pregnancy: 'AVOID — no adequate safety data in humans. Use LMWH throughout pregnancy.',
    counselling: 'Unlike warfarin, this does NOT require regular blood tests. Never miss a dose — if missed, take as soon as possible unless nearly time for next dose. Tell dentist and surgeon before any procedures. Avoid aspirin and ibuprofen.',
  },

  levothyroxine: {
    name: 'Levothyroxine', class: 'Thyroid Hormone Replacement (T4)',
    doses: [
      { indication: 'Hypothyroidism — young healthy adult', start: '1.6 mcg/kg/day', max: 'Titrate to TSH 0.4–2.0 mIU/L; usual max 200 mcg/day' },
      { indication: 'Hypothyroidism — elderly or cardiac disease', start: '12.5–25 mcg OD, uptitrate 12.5–25 mcg every 4–6 weeks', max: 'Lowest dose achieving TSH target' },
      { indication: 'TSH Suppression (differentiated thyroid cancer)', start: 'Higher dose to achieve TSH <0.1 mIU/L', max: 'Specialist guidance — lowest suppressive dose' },
    ],
    route: 'Oral', forms: ['25 mcg tablet', '50 mcg tablet', '100 mcg tablet'],
    ci: ['Untreated adrenal insufficiency — precipitates adrenal crisis. Treat cortisol deficiency first.', 'Thyrotoxicosis', 'Acute MI or acute myocarditis'],
    cautions: ['Cardiac disease (atrial fibrillation, angina — start very low)', 'Osteoporosis risk with over-replacement (especially post-menopausal women)', 'Diabetes (thyroid hormones alter glycaemia)', 'Pituitary or adrenal disease'],
    interactions: [
      { drug: 'calcium',    severity: 'moderate', msg: 'Reduces levothyroxine absorption by ~40% — separate doses by at least 4 hours' },
      { drug: 'iron',       severity: 'moderate', msg: 'Reduces levothyroxine absorption — separate doses by at least 4 hours' },
      { drug: 'antacids',   severity: 'mild',     msg: 'Aluminium/magnesium antacids reduce absorption — separate by 2–4 hours' },
      { drug: 'warfarin',   severity: 'moderate', msg: 'Thyroid hormones increase warfarin sensitivity — check INR 4–6 weeks after any levothyroxine dose change' },
      { drug: 'colestyramine', severity: 'moderate', msg: 'Binds levothyroxine in GI tract — separate by 4–5 hours' },
    ],
    monitoring: ['TSH 6–8 weeks after initiation or any dose change', 'Once stable: annual TSH (6-monthly in elderly)', 'FT4 if TSH is suppressed or symptoms inconsistent with TSH', 'Bone density (DEXA) in women on long-term suppressive therapy'],
    instructions: 'Take on an EMPTY stomach, 30–60 minutes before breakfast. Do not take within 4 hours of calcium supplements, iron tablets, or antacids.',
    sideEffects: ['Dose-dependent over-treatment: Tachycardia, palpitations, tremor, excessive sweating, weight loss, insomnia, diarrhoea', 'Angina exacerbation at high doses', 'Osteoporosis with long-term suppression'],
    pregnancy: 'ESSENTIAL to continue — hypothyroidism is dangerous to fetal development. Dose typically needs 30–50% increase in pregnancy. Monitor TSH every 4 weeks in first trimester.',
    counselling: 'Take 30 minutes before breakfast every single day — consistency is important. Take your calcium, iron or vitamins at a different time of day. Contact your doctor if you develop palpitations, chest pain or excessive sweating.',
  },

  sertraline: {
    name: 'Sertraline', class: 'SSRI (Selective Serotonin Reuptake Inhibitor)',
    doses: [
      { indication: 'Depression / Generalised Anxiety', start: '50mg OD', max: '200mg OD' },
      { indication: 'PTSD / OCD', start: '25mg OD (start low, especially PTSD)', max: '200mg OD' },
      { indication: 'Panic Disorder', start: '25mg OD', max: '200mg OD' },
    ],
    route: 'Oral', forms: ['50mg tablet', '100mg tablet'],
    ci: ['Concurrent MAOIs — 14-day washout required before and after', 'Pimozide (QTc prolongation)', 'Linezolid or IV methylene blue (serotonin syndrome)'],
    cautions: ['Suicidal ideation — monitor closely especially in <25yr, first 1–4 weeks', 'Bipolar — may precipitate mania (prescribe with mood stabiliser)', 'Seizure disorder', 'Bleeding tendency (reduces platelet aggregation)', 'Hyponatraemia risk (especially elderly)', 'NEVER stop abruptly — taper over weeks to prevent discontinuation syndrome'],
    interactions: [
      { drug: 'maoi',       severity: 'severe',   msg: 'SEROTONIN SYNDROME — potentially fatal. 14-day washout from MAOI before starting sertraline. 7-day washout before MAOI after sertraline.' },
      { drug: 'tramadol',   severity: 'severe',   msg: 'Serotonin syndrome risk — avoid combination or monitor very closely (confusion, tremor, hyperthermia)' },
      { drug: 'triptans',   severity: 'moderate', msg: 'Serotonin syndrome risk — use cautiously; monitor for agitation, tachycardia, tremor' },
      { drug: 'warfarin',   severity: 'moderate', msg: 'Increases anticoagulant effect — monitor INR carefully after initiation or dose change' },
      { drug: 'lithium',    severity: 'moderate', msg: 'Increased serotonergic effects — monitor closely for signs of serotonin syndrome' },
    ],
    monitoring: ['Suicidality, agitation and mood at 1, 2, 4 weeks initially', 'PHQ-9 score at 4, 8, 12 weeks', 'Weight and appetite', 'Serum sodium (especially elderly — hyponatraemia)', 'Liver function annually'],
    instructions: 'Take once daily, morning or evening (be consistent). Full therapeutic effect takes 4–6 weeks. Do not stop abruptly — always taper with medical guidance.',
    sideEffects: ['Nausea (very common initially — usually resolves by week 2)', 'Insomnia or sedation', 'Sexual dysfunction (20–40%)', 'Headache', 'Diarrhoea', 'Increased sweating', 'Hyponatraemia (elderly)', 'Discontinuation syndrome'],
    pregnancy: 'Category C — generally preferred SSRI if antidepressant needed in pregnancy. Neonatal adaptation syndrome risk near term (transient).',
    counselling: 'It takes 4–6 weeks to work fully — do not stop if you feel no improvement in the first 2 weeks. If you have any thoughts of harming yourself, contact your doctor or go to A&E immediately. Do not stop suddenly without discussing with your doctor first.',
  },

  omeprazole: {
    name: 'Omeprazole', class: 'Proton Pump Inhibitor (PPI)',
    doses: [
      { indication: 'Peptic Ulcer / GERD', start: '20mg OD', max: '40mg OD for severe/refractory disease' },
      { indication: 'H. Pylori Eradication (part of triple therapy)', start: '20mg BD for 7–14 days', max: '20mg BD' },
      { indication: 'NSAID prophylaxis / GI protection', start: '20mg OD', max: '20mg OD (lower dose sufficient for prophylaxis)' },
      { indication: 'Zollinger-Ellison Syndrome', start: '60mg OD', max: 'Up to 120mg TDS (specialist use)' },
    ],
    route: 'Oral / IV', forms: ['10mg capsule', '20mg capsule', '40mg capsule', '40mg IV vial'],
    ci: ['Co-prescription with atazanavir or nelfinavir (critically reduces levels)', 'Hypersensitivity to omeprazole or other PPIs'],
    cautions: ['Long-term use risks: Hypomagnesaemia, B12 deficiency, C.difficile, hip fractures', 'Masking gastric malignancy — investigate ALARM symptoms before starting (dysphagia, weight loss, haematemesis)', 'Reassess indication every 6–12 months — step down if possible'],
    interactions: [
      { drug: 'clopidogrel',     severity: 'severe',   msg: 'Omeprazole inhibits CYP2C19 — significantly reduces clopidogrel antiplatelet effect. USE PANTOPRAZOLE INSTEAD.' },
      { drug: 'methotrexate',    severity: 'moderate', msg: 'PPIs reduce methotrexate clearance — increased toxicity risk. Monitor methotrexate levels.' },
      { drug: 'atazanavir',      severity: 'severe',   msg: 'PPIs markedly reduce atazanavir absorption — CONTRAINDICATED with atazanavir.' },
      { drug: 'warfarin',        severity: 'mild',     msg: 'May slightly increase warfarin effect — check INR after starting PPI if on warfarin' },
    ],
    monitoring: ['Magnesium at baseline and annually in long-term use', 'Vitamin B12 if symptomatic or >3 years use', 'Reassess need every 6–12 months', 'Endoscopy if alarm symptoms arise'],
    instructions: 'Take 30–60 minutes before the first meal of the day for maximum acid suppression. Swallow capsules whole — do not crush if possible.',
    sideEffects: ['Headache', 'Diarrhoea or constipation', 'Nausea', 'Hypomagnesaemia (long-term — cramps, tremor)', 'Clostridium difficile infection risk (long-term)', 'Osteoporosis (long-term high-dose)', 'B12 deficiency'],
    pregnancy: 'Generally considered safe — use lowest effective dose for shortest necessary duration.',
    counselling: 'Take 30 minutes before breakfast for best effect. Long-term use can deplete magnesium — eat magnesium-rich foods (nuts, seeds, dark chocolate). Seek URGENT help for vomiting blood or black tarry stools.',
  },

  sacubitril_valsartan: {
    name: 'Sacubitril/Valsartan (Entresto)', class: 'ARNI — Angiotensin Receptor Neprilysin Inhibitor',
    doses: [
      { indication: 'HFrEF (EF ≤40%)', start: '24/26mg BD if on ACEI; 49/51mg BD if on high-dose ACEI/already on ARNI', max: '97/103mg BD — uptitrate every 2–4 weeks', renal: 'eGFR 30–60: start 24/26mg BD; eGFR <30: use with caution', hepatic: 'Avoid Child-Pugh C hepatic impairment' },
    ],
    route: 'Oral', forms: ['24/26mg tablet', '49/51mg tablet', '97/103mg tablet'],
    ci: ['Current or prior ACEI-induced angioedema', 'Concurrent ACE inhibitor — MUST stop ACEI 36h before starting', 'Severe hepatic impairment (Child-Pugh C)', 'Pregnancy', 'Concurrent aliskiren in DM/CKD'],
    cautions: ['Hypotension — start low, uptitrate with BP monitoring', 'Hyperkalaemia — monitor K+', 'Renal impairment — monitor eGFR', 'Angioedema history (even non-ACEI related)'],
    interactions: [
      { drug: 'acei',                        severity: 'severe',   msg: 'ANGIOEDEMA RISK — MUST stop ACE inhibitor 36 hours before starting sacubitril/valsartan. NEVER co-prescribe.' },
      { drug: 'potassium_sparing_diuretics', severity: 'moderate', msg: 'Hyperkalaemia risk — monitor K+ weekly during uptitration' },
      { drug: 'aliskiren',                   severity: 'severe',   msg: 'Dual RAAS blockade — avoid in DM/CKD (adverse renal outcomes)' },
    ],
    monitoring: ['BP at each visit — uptitrate every 2–4 weeks as tolerated', 'eGFR and K+ at 1, 4, 12 weeks then 3-monthly', 'BNP/NT-proBNP to assess HF response', 'Echocardiography after 3–6 months to assess EF improvement'],
    instructions: 'Take twice daily at the same times. Can be taken with or without food. Start 36 hours after stopping ACE inhibitor.',
    sideEffects: ['Hypotension (most common reason for stopping or reducing dose)', 'Hyperkalaemia', 'Renal impairment', 'Angioedema', 'Dizziness'],
    pregnancy: 'CONTRAINDICATED — causes fetal renal dysgenesis (mechanism identical to ACEI). Discontinue immediately if pregnancy confirmed.',
    counselling: 'Rise slowly from lying or sitting to avoid dizziness. If you develop sudden swelling of face, lips or tongue — STOP immediately and seek emergency care. Do not take ibuprofen or naproxen.',
  },
};

// ─── Drug Interaction Matrix ─────────────────────────────────────────────────
export const DRUG_INTERACTIONS: Record<string, string> = {
  'amlodipine+simvastatin':    'Simvastatin AUC increased — maximum simvastatin 20mg/day',
  'lisinopril+potassium_sparing_diuretics': 'Severe hyperkalaemia risk',
  'warfarin+aspirin':          'Major bleeding risk — avoid combination',
  'warfarin+clarithromycin':   'INR markedly elevated — reduce warfarin, check INR in 3 days',
  'warfarin+nsaids':           'Increased anticoagulation + GI bleed risk',
  'warfarin+amiodarone':       'Warfarin potentiated markedly — reduce dose 30–50%, weekly INR',
  'warfarin+fluconazole':      'Strong CYP2C9 inhibition — INR can double',
  'metformin+iodinated_contrast': 'Hold 48h before contrast — lactic acidosis risk',
  'bisoprolol+verapamil':      'Severe bradycardia/AV block — avoid IV verapamil',
  'salbutamol+beta_blockers':  'Beta-blockers BLOCK bronchodilator effect — avoid in asthma',
  'sertraline+maoi':           'SEROTONIN SYNDROME — potentially fatal — NEVER combine',
  'sertraline+tramadol':       'Serotonin syndrome risk — avoid or monitor very closely',
  'omeprazole+clopidogrel':    'Reduced antiplatelet effect — use pantoprazole instead',
  'apixaban+ketoconazole':     '5-fold apixaban increase — CONTRAINDICATED',
  'apixaban+rifampicin':       'Apixaban levels reduced 54% — use warfarin instead',
  'sacubitril_valsartan+acei': 'ANGIOEDEMA risk — NEVER co-prescribe',
  'levothyroxine+calcium':     'Absorption reduced 40% — separate by 4h',
  'levothyroxine+iron':        'Absorption reduced — separate by 4h',
};

// ─── Alert Evaluation Engine ─────────────────────────────────────────────────
export function evaluateAlerts(
  vitals: Record<string, number>,
  labs: Record<string, number>,
  diagnoses: string[]
): TriggeredAlert[] {
  const alerts: TriggeredAlert[] = [];
  const params: Record<string, number> = { ...vitals, ...labs };

  diagnoses.forEach((dxId) => {
    const proto = DISEASE_PROTOCOLS[dxId];
    if (!proto) return;
    proto.alerts.forEach((rule) => {
      const val = params[rule.param];
      if (val === undefined || val === null) return;
      let triggered = false;
      if (rule.op === '>'  && val >  rule.val) triggered = true;
      if (rule.op === '>=' && val >= rule.val) triggered = true;
      if (rule.op === '<'  && val <  rule.val) triggered = true;
      if (rule.op === '<=' && val <= rule.val) triggered = true;
      if (rule.op === '==' && val === rule.val) triggered = true;
      if (triggered) {
        alerts.push({
          id: `${dxId}-${rule.param}-${rule.val}`,
          disease: proto.name,
          level: rule.level,
          message: rule.msg,
          param: rule.param,
          value: val,
          threshold: rule.val,
        });
      }
    });
  });

  // Deduplicate — keep highest severity per param
  const deduped: Record<string, TriggeredAlert> = {};
  alerts.forEach((a) => {
    const existing = deduped[a.param];
    if (!existing) { deduped[a.param] = a; return; }
    const priority = { emergency: 3, urgent: 2, watch: 1, normal: 0 };
    if (priority[a.level] > priority[existing.level]) deduped[a.param] = a;
  });

  return Object.values(deduped);
}

// ─── Prescription Intelligence Engine ────────────────────────────────────────
export interface PatientContext {
  age: number;
  sex: 'M' | 'F';
  weight: number;
  allergies: string[];
  labs: Record<string, number>;
  currentMeds: string[];  // e.g. ['amlodipine 10mg OD', 'metformin 1000mg BD']
  diagnoses: string[];
}

export function checkPrescriptionIntelligence(
  drugId: string,
  patient: PatientContext
): PrescriptionIntelligence {
  const drug = DRUG_DB[drugId];
  if (!drug) return { warnings: [], suggestions: [], doseGuide: null, interactions: [] };

  const warnings: { level: AlertLevel; msg: string }[] = [];
  const interactions: { level: AlertLevel; msg: string }[] = [];
  const suggestions: string[] = [];

  // 1. Allergy check
  patient.allergies.forEach((allergy) => {
    const allergenLower = allergy.toLowerCase();
    const drugLower = drug.name.toLowerCase();
    if (
      drugLower.includes(allergenLower.split(' ')[0]) ||
      allergenLower.includes(drugId)
    ) {
      warnings.push({ level: 'emergency', msg: `ALLERGY ALERT: Patient has documented allergy to ${allergy}` });
    }
    // Penicillin cross-reactivity
    if (allergenLower.includes('penicillin') && (drugId === 'amoxicillin' || drugId.includes('cillin'))) {
      warnings.push({ level: 'emergency', msg: `PENICILLIN ALLERGY: Cross-reactivity risk with ${drug.name}. Consider alternative.` });
    }
  });

  // 2. Contraindication screening
  drug.ci.forEach((ci) => {
    const ciLower = ci.toLowerCase();
    // Renal CI
    const renalMatch = ci.match(/eGFR\s*[<>]=?\s*(\d+)/i);
    if (renalMatch && patient.labs.egfr !== undefined) {
      const threshold = parseInt(renalMatch[1]);
      if (ciLower.includes('<') && patient.labs.egfr < threshold) {
        warnings.push({ level: 'urgent', msg: `RENAL CONTRAINDICATION: eGFR ${patient.labs.egfr} — ${ci}` });
      }
    }
    // Hyperkalaemia CI
    if (ciLower.includes('hyperkalaemia') || ciLower.includes('k+') || ciLower.includes('potassium')) {
      if (patient.labs.potassium !== undefined && patient.labs.potassium >= 5.5) {
        warnings.push({ level: 'urgent', msg: `CONTRAINDICATION: K+ ${patient.labs.potassium} mmol/L — ${ci}` });
      }
    }
    // Pregnancy CI
    if (ciLower.includes('pregnancy') && patient.sex === 'F' && patient.age < 55) {
      warnings.push({ level: 'urgent', msg: `PREGNANCY RISK: ${drug.name} — ${ci}. Confirm pregnancy status before prescribing.` });
    }
  });

  // 3. Drug-drug interaction check
  patient.currentMeds.forEach((med) => {
    const medId = med.split(' ')[0].toLowerCase().replace(/[^a-z_]/g, '');
    const key1 = `${drugId}+${medId}`;
    const key2 = `${medId}+${drugId}`;
    const matrixHit = DRUG_INTERACTIONS[key1] || DRUG_INTERACTIONS[key2];
    if (matrixHit) {
      interactions.push({ level: 'urgent', msg: `Interaction with ${med}: ${matrixHit}` });
    }
    // Check drug's own interaction table
    drug.interactions.forEach((ix) => {
      if (medId.includes(ix.drug) || ix.drug.includes(medId)) {
        const level: AlertLevel = ix.severity === 'severe' ? 'urgent' : ix.severity === 'moderate' ? 'watch' : 'normal';
        interactions.push({ level, msg: `Interaction with ${med}: ${ix.msg}` });
      }
    });
  });

  // 4. Dose suggestions based on patient context
  const doseGuide = drug.doses[0] || null;
  if (patient.labs.egfr !== undefined && doseGuide?.renal) {
    suggestions.push(`Renal function (eGFR ${patient.labs.egfr} mL/min): ${doseGuide.renal}`);
  }
  if (patient.age >= 65) {
    suggestions.push('Age ≥65 — consider lower starting dose, enhanced monitoring, fall risk assessment');
  }
  if (patient.weight < 50) {
    suggestions.push(`Low body weight (${patient.weight}kg) — consider dose reduction and close monitoring`);
  }

  return {
    warnings: [...warnings, ...interactions],
    suggestions,
    doseGuide,
    interactions,
  };
}