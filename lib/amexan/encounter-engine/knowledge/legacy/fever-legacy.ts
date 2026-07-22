// ═══════════════════════════════════════════════════════════════════════════════
// LEGACY — Fever-specific DDx, management, and red-flag knowledge
// Kept for backward compatibility. New code should use SymptomNode.phenotypes
// and a generic management protocol registry instead.
// ═══════════════════════════════════════════════════════════════════════════════

export interface FeverDdxEntry {
  diseaseId: string
  diseaseName: string
  weight: number
  featuresFor: string[]
  featuresAgainst: string[]
  investigations: string[]
  managementSummary: string
}

export interface FeverProtocol {
  diseaseId: string
  diseaseName: string
  icd10: string
  severity: 'mild' | 'moderate' | 'severe' | 'critical'
  investigations: { test: string; rationale: string; tier: number }[]
  management: { action: string; details: string; category: 'emergency' | 'definitive' | 'supportive' | 'monitoring' | 'referral' }[]
  admissionCriteria: string[]
  dischargeCriteria: string[]
}

export const FEVER_RED_FLAGS: { id: string; label: string; condition: (answers: Record<string, any>) => boolean; severity: 'critical' | 'warning' }[] = [
  {
    id: 'rf_fever_rigors',
    label: 'Rigors suggest bacteraemia or severe malaria — high-risk',
    severity: 'critical',
    condition: (a) => a['fever_rigors'] === true || a['fever_rigors'] === 'true' || String(a['fever_rigors'] || '').toLowerCase() === 'yes',
  },
  {
    id: 'rf_fever_high_temp',
    label: 'High fever (>40°C) with any neurological symptom — suspect cerebral malaria or meningitis',
    severity: 'critical',
    condition: (a) => {
      const temp = a['exam_temp'] || a['fever_severity']
      return String(temp || '').includes('>40') || String(temp || '').includes('Very high')
    },
  },
  {
    id: 'rf_fever_neuro',
    label: 'Fever with neurological symptoms — exclude CNS infection',
    severity: 'critical',
    condition: (a) => {
      const altered = a['exam_consciousness'] && String(a['exam_consciousness']).toLowerCase() !== 'alert'
      return !!altered
    },
  },
  {
    id: 'rf_fever_petechiae',
    label: 'Fever with petechial/purpuric rash — suspect meningococcaemia, dengue, or leptospirosis',
    severity: 'critical',
    condition: (a) => {
      return String(a['fever_rash'] || '').toLowerCase() === 'true' && String(a['fever_headache'] || '').toLowerCase() === 'true'
    },
  },
  {
    id: 'rf_fever_dehydration',
    label: 'Fever with signs of dehydration — risk of hypovolaemic shock',
    severity: 'warning',
    condition: (a) => {
      const dehydration = a['exam_dehydration']
      return String(dehydration || '').toLowerCase() === 'moderate' || String(dehydration || '').toLowerCase() === 'severe'
    },
  },
  {
    id: 'rf_fever_travel',
    label: 'Fever with travel history to endemic area — must exclude malaria, typhoid, dengue',
    severity: 'warning',
    condition: (a) => String(a['fever_travel'] || '').toLowerCase() === 'true' || String(a['fever_travel'] || '').toLowerCase() === 'yes',
  },
]

export const FEVER_DDX: FeverDdxEntry[] = [
  {
    diseaseId: 'malaria',
    diseaseName: 'Malaria',
    weight: 10,
    featuresFor: ['fever_rigors', 'fever_headache', 'fever_vomiting', 'fever_travel', 'fever_joint_pain'],
    featuresAgainst: ['fever_cough', 'fever_diarrhea'],
    investigations: ['RDT (Malaria rapid diagnostic test)', 'Blood film for malaria parasites', 'FBC', 'CRP'],
    managementSummary: 'Artemether-lumefantrine (or IV artesunate if severe) + supportive care',
  },
  {
    diseaseId: 'typhoid',
    diseaseName: 'Typhoid Fever',
    weight: 8,
    featuresFor: ['fever_const_high', 'fever_headache', 'fever_abdominal_pain', 'fever_diarrhea', 'fever_travel'],
    featuresAgainst: ['fever_rigors', 'fever_cough'],
    investigations: ['Blood culture', 'Widal test', 'Stool culture', 'FBC'],
    managementSummary: 'Ceftriaxone or azithromycin — avoid fluoroquinolones if resistant strain suspected',
  },
  {
    diseaseId: 'sepsis',
    diseaseName: 'Sepsis / Bacteraemia',
    weight: 8,
    featuresFor: ['fever_rigors', 'fever_high_temp', 'fever_rapid_onset'],
    featuresAgainst: [],
    investigations: ['Blood culture x2', 'FBC', 'CRP', 'PCT', 'Lactate', 'Urinalysis'],
    managementSummary: 'IV antibiotics (broad-spectrum per local protocol) + fluid resuscitation + source control',
  },
  {
    diseaseId: 'pneumonia',
    diseaseName: 'Pneumonia',
    weight: 8,
    featuresFor: ['fever_cough', 'fever_rigors', 'fever_rapid_onset'],
    featuresAgainst: ['fever_diarrhea', 'fever_joint_pain'],
    investigations: ['Chest X-ray', 'FBC', 'CRP', 'Sputum culture', 'Blood culture'],
    managementSummary: 'Antibiotics per CURB-65 (amoxicillin + clarithromycin or ceftriaxone)',
  },
  {
    diseaseId: 'uti',
    diseaseName: 'Urinary Tract Infection',
    weight: 7,
    featuresFor: ['fever_urinary', 'fever_rigors', 'fever_abdominal_pain'],
    featuresAgainst: ['fever_cough', 'fever_headache'],
    investigations: ['Urinalysis', 'Urine culture', 'FBC', 'CRP'],
    managementSummary: 'Antibiotics per local guideline (nitrofurantoin, ciprofloxacin, or ceftriaxone)',
  },
  {
    diseaseId: 'dengue',
    diseaseName: 'Dengue Fever',
    weight: 7,
    featuresFor: ['fever_joint_pain', 'fever_headache', 'fever_rash', 'fever_travel', 'fever_joint_pain'],
    featuresAgainst: ['fever_rigors', 'fever_cough'],
    investigations: ['Dengue NS1 antigen', 'Dengue IgM/IgG', 'FBC (platelet count)', 'Haematocrit'],
    managementSummary: 'Supportive — IV fluids if warning signs, monitor platelets/haematocrit',
  },
  {
    diseaseId: 'tb',
    diseaseName: 'Pulmonary Tuberculosis',
    weight: 6,
    featuresFor: ['fever_night_sweats', 'fever_cough', 'fever_duration_gt_2wks'],
    featuresAgainst: ['fever_rigors', 'fever_rapid_onset'],
    investigations: ['Chest X-ray', 'GeneXpert', 'Sputum AFB x3', 'TST/IGRA'],
    managementSummary: 'RIPE regimen (rifampicin, isoniazid, pyrazinamide, ethambutol) for 6 months',
  },
  {
    diseaseId: 'meningitis',
    diseaseName: 'Meningitis',
    weight: 6,
    featuresFor: ['fever_headache', 'fever_neck_stiffness', 'fever_vomiting', 'fever_rash'],
    featuresAgainst: ['fever_cough', 'fever_diarrhea'],
    investigations: ['LP (CSF analysis)', 'Blood culture', 'CRP', 'CT head (if mass suspected)'],
    managementSummary: 'IV ceftriaxone + dexamethasone + acyclovir if encephalitis suspected',
  },
  {
    diseaseId: 'brucellosis',
    diseaseName: 'Brucellosis',
    weight: 4,
    featuresFor: ['fever_night_sweats', 'fever_joint_pain', 'fever_pattern_intermittent'],
    featuresAgainst: ['fever_rigors', 'fever_rapid_onset'],
    investigations: ['Blood culture (prolonged)', 'Brucella serology', 'Bone marrow culture'],
    managementSummary: 'Doxycycline + rifampicin or streptomycin for 6-8 weeks',
  },
  {
    diseaseId: 'rickettsial',
    diseaseName: 'Rickettsial Infection',
    weight: 4,
    featuresFor: ['fever_headache', 'fever_rash', 'fever_joint_pain', 'fever_travel'],
    featuresAgainst: ['fever_cough', 'fever_diarrhea'],
    investigations: ['Weil-Felix test', 'Rickettsial serology', 'FBC', 'LFT'],
    managementSummary: 'Doxycycline 100mg BD for 7-14 days',
  },
  {
    diseaseId: 'amoebic_liver_abscess',
    diseaseName: 'Amebic Liver Abscess',
    weight: 5,
    featuresFor: ['fever_abdominal_pain', 'fever_right_upper_quadrant', 'fever_night_sweats'],
    featuresAgainst: ['fever_cough', 'fever_urinary'],
    investigations: ['Abdominal US', 'Serology (E. histolytica)', 'FBC', 'LFT'],
    managementSummary: 'Metronidazole + tinidazole followed by luminal amoebicide (diloxanide)',
  },
  {
    diseaseId: 'kawasaki',
    diseaseName: 'Kawasaki Disease',
    weight: 4,
    featuresFor: ['fever_duration_gt_5days', 'fever_rash', 'fever_joint_pain'],
    featuresAgainst: ['fever_rigors', 'fever_travel'],
    investigations: ['ECHO', 'ECG', 'CRP', 'ESR', 'FBC'],
    managementSummary: 'IVIG + high-dose aspirin — monitor coronary arteries',
  },
  {
    diseaseId: 'covid',
    diseaseName: 'COVID-19',
    weight: 6,
    featuresFor: ['fever_cough', 'fever_headache', 'fever_joint_pain', 'fever_fatigue'],
    featuresAgainst: ['fever_rigors', 'fever_diarrhea'],
    investigations: ['SARS-CoV-2 PCR/RAT', 'Chest X-ray', 'FBC', 'CRP', 'D-dimer'],
    managementSummary: 'Supportive — oxygen if hypoxic, dexamethasone if severe, anticoagulation',
  },
  {
    diseaseId: 'infective_endocarditis',
    diseaseName: 'Infective Endocarditis',
    weight: 5,
    featuresFor: ['fever_night_sweats', 'fever_joint_pain', 'fever_duration_gt_1wk', 'known_valve_disease'],
    featuresAgainst: ['fever_cough', 'fever_diarrhea'],
    investigations: ['Blood culture x3', 'ECHO (transthoracic + transoesophageal)', 'CRP', 'FBC', 'ESR'],
    managementSummary: 'IV antibiotics per culture sensitivity — surgical referral if indicated',
  },
]

export const FEVER_MANAGEMENT_PROTOCOLS: Record<string, FeverProtocol> = {
  malaria: {
    diseaseId: 'malaria',
    diseaseName: 'Malaria',
    icd10: 'B50',
    severity: 'severe',
    investigations: [
      { test: 'RDT (Malaria rapid diagnostic test)', rationale: 'First-line test — result in 15 min', tier: 2 },
      { test: 'Blood film for malaria parasites', rationale: 'Confirm species and quantify parasitaemia', tier: 2 },
      { test: 'FBC', rationale: 'Assess for anaemia, thrombocytopenia', tier: 2 },
      { test: 'CRP', rationale: 'Assess inflammation severity', tier: 2 },
      { test: 'Blood glucose', rationale: 'Hypoglycaemia is common in severe malaria', tier: 2 },
      { test: 'LFT', rationale: 'Assess hepatic involvement', tier: 3 },
    ],
    management: [
      { action: 'Artesunate IV (if severe) or Artemether-lumefantrine PO (if uncomplicated)', details: 'WHO weight-based dosing. IV artesunate: 2.4mg/kg at 0, 12, 24, 48h then daily', category: 'definitive' },
      { action: 'Admit if severe malaria (any organ dysfunction, parasitaemia >5%, or unable to take PO)', details: 'Monitor GCS, urine output, blood glucose q4h', category: 'emergency' },
      { action: 'IV fluids — maintenance + replacement', details: 'Use 5% dextrose / 0.9% saline. Avoid overhydration', category: 'supportive' },
      { action: 'Antipyretics — paracetamol PR/PO q4-6h', details: 'Avoid NSAIDs if thrombocytopenic', category: 'supportive' },
      { action: 'Monitor for complications: anaemia, hypoglycaemia, AKI, ARDS', details: 'Check GCS q2h, urine output, blood glucose q6h', category: 'monitoring' },
      { action: 'Refer to infectious disease / internal medicine', details: 'If severe malaria or treatment failure', category: 'referral' },
    ],
    admissionCriteria: ['Severe malaria (any organ dysfunction)', 'Parasitaemia >5%', 'Unable to tolerate PO', 'Age <5 years or >65 with comorbidities'],
    dischargeCriteria: ['Afebrile for 48h', 'Able to tolerate PO', 'Parasitaemia <1%', 'Haemodynamically stable'],
  },
  pneumonia: {
    diseaseId: 'pneumonia',
    diseaseName: 'Pneumonia',
    icd10: 'J18.9',
    severity: 'moderate',
    investigations: [
      { test: 'Chest X-ray', rationale: 'Confirm infiltrate', tier: 2 },
      { test: 'FBC with differential', rationale: 'WBC count', tier: 2 },
      { test: 'CRP', rationale: 'Assess inflammation', tier: 2 },
      { test: 'Sputum culture', rationale: 'Identify pathogen', tier: 3 },
      { test: 'Blood culture', rationale: 'Identify bacteraemia', tier: 3 },
    ],
    management: [
      { action: 'Antibiotics per CURB-65 severity score', details: 'Low (0-1): amoxicillin PO. Moderate (2): amoxicillin + clarithromycin PO/IV. High (3-5): IV ceftriaxone + azithromycin', category: 'definitive' },
      { action: 'Oxygen if SpO2 <92%', details: 'Target SpO2 ≥94%. Nasal cannula 2-4 L/min', category: 'supportive' },
      { action: 'Antipyretics — paracetamol', details: 'PR/PO q4-6h prn', category: 'supportive' },
      { action: 'Chest physiotherapy', details: 'If productive cough or consolidation', category: 'supportive' },
      { action: 'Monitor: SpO2, RR, temp, clinical status', details: 'Reassess at 48h', category: 'monitoring' },
    ],
    admissionCriteria: ['CURB-65 ≥2', 'SpO2 <92% on room air', 'Age >65 with comorbidities', 'Unable to take PO'],
    dischargeCriteria: ['Afebrile for 48h', 'SpO2 ≥94% on room air', 'Stable comorbidities', 'Able to take PO'],
  },
  uti: {
    diseaseId: 'uti',
    diseaseName: 'Urinary Tract Infection',
    icd10: 'N39.0',
    severity: 'mild',
    investigations: [
      { test: 'Urinalysis / dipstick', rationale: 'Nitrites, leucocytes', tier: 2 },
      { test: 'Urine culture + sensitivity', rationale: 'Identify uropathogen', tier: 3 },
      { test: 'FBC', rationale: 'WBC count', tier: 3 },
      { test: 'CRP', rationale: 'Assess severity', tier: 3 },
    ],
    management: [
      { action: 'Antibiotics per local guideline', details: 'First-line: nitrofurantoin 100mg BD x5d. Alternative: ciprofloxacin 500mg BD, ceftriaxone 1g IV', category: 'definitive' },
      { action: 'Hydration — encourage PO fluids', details: '2-3L daily', category: 'supportive' },
      { action: 'Antipyretics if febrile', details: 'Paracetamol PR/PO', category: 'supportive' },
      { action: 'Admit if: pyelonephritis, sepsis, unable to take PO', details: 'IV antibiotics + IV fluids', category: 'emergency' },
    ],
    admissionCriteria: ['Pyelonephritis (flank pain, high fever)', 'Sepsis', 'Unable to take PO', 'Male UTI with obstruction risk'],
    dischargeCriteria: ['Afebrile for 24h', 'Able to take PO', 'Urine culture results available'],
  },
  meningitis: {
    diseaseId: 'meningitis',
    diseaseName: 'Meningitis',
    icd10: 'G03.9',
    severity: 'critical',
    investigations: [
      { test: 'LP (CSF analysis)', rationale: 'Cell count, protein, glucose, Gram stain, culture', tier: 2 },
      { test: 'Blood culture x2', rationale: 'Identify bloodstream pathogen', tier: 2 },
      { test: 'CRP / PCT', rationale: 'Assess inflammation', tier: 2 },
      { test: 'CT head (if mass suspected)', rationale: 'Exclude mass before LP', tier: 3 },
      { test: 'GeneXpert / PCR', rationale: 'TB, viral, bacterial panels', tier: 3 },
    ],
    management: [
      { action: 'IV ceftriaxone 2g BD + dexamethasone 0.15mg/kg q6h', details: 'Start dexamethasone before/with first antibiotic dose. Continue 2-4 days', category: 'emergency' },
      { action: 'Acyclovir 10mg/kg IV TDS if encephalitis suspected', details: 'If HSV encephalitis on differential', category: 'definitive' },
      { action: 'IV fluids — avoid overhydration', details: 'Monitor for SIADH', category: 'supportive' },
      { action: 'Antipyretics — paracetamol', details: 'PR/PO q4-6h', category: 'supportive' },
      { action: 'Monitor: GCS q1h, vital signs q4h, seizure watch', details: 'Transfer to ICU if GCS <12', category: 'monitoring' },
    ],
    admissionCriteria: ['All meningitis/suspected meningitis patients require admission', 'GCS <15', 'Seizures', 'Focal neurological signs'],
    dischargeCriteria: ['Completed antibiotic course', 'Afebrile for 48h', 'GCS 15', 'Able to take PO'],
  },
  sepsis: {
    diseaseId: 'sepsis',
    diseaseName: 'Sepsis / Bacteraemia',
    icd10: 'A41',
    severity: 'critical',
    investigations: [
      { test: 'Blood culture x2', rationale: 'Identify causative organism', tier: 3 },
      { test: 'FBC with differential', rationale: 'WBC count, neutrophils', tier: 2 },
      { test: 'CRP / Procalcitonin', rationale: 'Assess inflammation severity', tier: 2 },
      { test: 'Lactate', rationale: 'Tissue hypoperfusion marker', tier: 2 },
      { test: 'Urinalysis / Urine culture', rationale: 'Common source of sepsis', tier: 2 },
      { test: 'Chest X-ray', rationale: 'Exclude pneumonia as source', tier: 2 },
    ],
    management: [
      { action: 'IV antibiotics within 1 hour — broad spectrum per local protocol', details: 'Common: ceftriaxone 2g IV + metronidazole 500mg IV. Adjust per culture results', category: 'emergency' },
      { action: 'IV fluid resuscitation — 30mL/kg crystalloid within 3 hours', details: 'Monitor response: BP, HR, urine output, lactate', category: 'emergency' },
      { action: 'Vasopressors if fluid-refractory hypotension', details: 'Norepinephrine — titrate to MAP ≥65mmHg', category: 'emergency' },
      { action: 'Source control — identify and manage infection source', details: 'Surgical drainage, line removal, etc.', category: 'definitive' },
      { action: 'Monitor q1h: vitals, urine output, GCS', details: 'Transfer to ICU if organ dysfunction', category: 'monitoring' },
    ],
    admissionCriteria: ['Any organ dysfunction (qSOFA ≥2)', 'Lactate >2 mmol/L', 'Hypotension after fluids', 'All sepsis patients require admission'],
    dischargeCriteria: ['Haemodynamically stable off vasopressors', 'Afebrile for 48h', 'Cultures negative for 48h', 'Oral antibiotics established'],
  },
}

export interface FeverDdxResult {
  diseaseId: string
  diseaseName: string
  probability: number
  rank: number
  supporting: string[]
  against: string[]
  investigations: string[]
  managementSummary: string
}

export function computeFeverDdx(
  answers: Record<string, any>,
  age: number,
  sex: string,
): FeverDdxResult[] {
  const results: FeverDdxResult[] = []

  for (const entry of FEVER_DDX) {
    let score = entry.weight
    const supporting: string[] = []
    const against: string[] = []

    for (const f of entry.featuresFor) {
      const val = answers[f] ?? answers[f.replace('fever_', '')]
      if (val === true || val === 'true' || String(val || '').toLowerCase() === 'yes') {
        score += 2
        supporting.push(f.replace('fever_', '').replace(/_/g, ' '))
      }
    }
    for (const f of entry.featuresAgainst) {
      const val = answers[f] ?? answers[f.replace('fever_', '')]
      if (val === true || val === 'true' || String(val || '').toLowerCase() === 'yes') {
        score -= 1.5
        against.push(f.replace('fever_', '').replace(/_/g, ' '))
      }
    }

    if (entry.diseaseId === 'malaria' || entry.diseaseId === 'dengue') {
      if (answers['fever_travel'] === true || answers['fever_travel'] === 'true') score += 3
    }
    if (entry.diseaseId === 'pneumonia') {
      if (answers['fever_cough'] === true || answers['fever_cough'] === 'true') score += 3
    }
    if (entry.diseaseId === 'uti') {
      if (answers['fever_urinary'] === true || answers['fever_urinary'] === 'true') score += 4
    }

    if (entry.diseaseId === 'malaria' && age < 5) score += 2
    if (entry.diseaseId === 'pneumonia' && (age < 5 || age > 65)) score += 2
    if (entry.diseaseId === 'kawasaki' && age > 5) score = 0

    if (score > 0) {
      results.push({
        diseaseId: entry.diseaseId,
        diseaseName: entry.diseaseName,
        probability: Math.round(score * 5),
        rank: 0,
        supporting,
        against,
        investigations: entry.investigations,
        managementSummary: entry.managementSummary,
      })
    }
  }

  results.sort((a, b) => b.probability - a.probability)
  results.forEach((d, i) => { d.rank = i + 1 })
  return results
}
