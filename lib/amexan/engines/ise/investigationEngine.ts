import type { FeatureRegistry } from '../../core/types';

export interface InvestigationOrder {
  id: string;
  name: string;
  category: 'lab' | 'imaging' | 'bedside';
  rationale: string;
  expectedFinding: string;
  priority: 'essential' | 'supportive' | 'optional';
  interpretation: string;
  supportsDiseaseIds: string[];
}

export interface InvestigationPlanOutput {
  diagnostic: InvestigationOrder[];
  preOperative: InvestigationOrder[];
  complications: InvestigationOrder[];
  notes: string;
}

interface AlvaradoSnapshot {
  score: number;
  risk: 'low' | 'moderate' | 'high' | 'very_high';
}

function calcAlvaradoFromRegistry(registry: FeatureRegistry): AlvaradoSnapshot {
  let score = 0;
  if (registry.pain_migration_to_RIF?.present) score += 1;
  if (registry.anorexia?.present) score += 1;
  if (registry.nausea?.present || registry.vomiting?.present) score += 1;
  if (registry.RIF_tenderness?.present) score += 2;
  if (registry.rebound_tenderness?.present) score += 1;
  if (registry.low_grade_fever?.present || registry.present_temp_above_37_3?.present) score += 1;
  if (registry.leukocytosis?.present || registry.wbc_above_10k?.present) score += 2;
  if (registry.neutrophilia?.present || registry.left_shift?.present) score += 1;

  let risk: AlvaradoSnapshot['risk'];
  if (score <= 3) risk = 'low';
  else if (score <= 6) risk = 'moderate';
  else if (score <= 8) risk = 'high';
  else risk = 'very_high';

  return { score, risk };
}

export function generateAppendicitisInvestigationPlan(
  registry: FeatureRegistry,
  context: {
    age?: number;
    sex?: string;
    pregnant?: boolean;
    isChild?: boolean;
    isElderly?: boolean;
  },
): InvestigationPlanOutput {
  const alvarado = calcAlvaradoFromRegistry(registry);
  const suspectedPerforation =
    registry.generalized_guarding?.present ||
    registry.generalized_rigidity?.present ||
    registry.absent_bowel_sounds?.present ||
    registry.septic_appearance?.present ||
    registry.high_fever?.present;

  const femaleOfReproductiveAge = context.sex === 'female' && (context.age ?? 20) >= 12 && (context.age ?? 20) <= 55;

  const diagnostic: InvestigationOrder[] = [];

  if (alvarado.score <= 3) {
    diagnostic.push({
      id: 'fbc_wbc',
      name: 'Full Blood Count (WBC count)',
      category: 'lab',
      rationale: 'Alvarado ≤3 — low probability. WBC helps rule in/out inflammation.',
      expectedFinding: 'WBC normal or borderline (if appendicitis unlikely). WBC >10,000 suggests alternative inflammatory pathology.',
      priority: 'essential',
      interpretation: 'WBC >10,000 with neutrophilia shifts suspicion toward appendicitis or other bacterial process. Normal WBC does NOT exclude appendicitis.',
      supportsDiseaseIds: ['appendicitis', 'mesenteric_adenitis', 'gastroenteritis'],
    });
    diagnostic.push({
      id: 'crp',
      name: 'C-Reactive Protein (CRP)',
      category: 'lab',
      rationale: 'Elevated CRP supports inflammation; helps trend progression.',
      expectedFinding: 'CRP >10 mg/L suggests inflammation. >50 mg/L supports bacterial process.',
      priority: 'supportive',
      interpretation: 'CRP rises 6-12h after onset. Normal CRP early in presentation does NOT rule out appendicitis.',
      supportsDiseaseIds: ['appendicitis'],
    });
    diagnostic.push({
      id: 'urinalysis',
      name: 'Urinalysis (UFEME)',
      category: 'lab',
      rationale: 'Exclude urinary tract infection or ureteric colic as alternative causes.',
      expectedFinding: 'Normal or few WBCs. Pyuria >10/hpf suggests UTI. Hematuria suggests ureteric stone.',
      priority: 'essential',
      interpretation: 'Significant pyuria or hematuria points away from appendicitis toward UTI or ureteric colic.',
      supportsDiseaseIds: ['appendicitis', 'ureteric_colic', 'urinary_tract_infection'],
    });
    if (context.isChild) {
      diagnostic.push({
        id: 'erect_cxr',
        name: 'Erect Chest X-Ray',
        category: 'imaging',
        rationale: 'Exclude right lower lobe pneumonia as mimic in children.',
        expectedFinding: 'Clear lung fields. No consolidation at right base.',
        priority: 'essential',
        interpretation: 'RLL pneumonia can present with referred right iliac fossa pain in children.',
        supportsDiseaseIds: ['pneumonia_rll'],
      });
    }
  } else if (alvarado.score <= 6) {
    diagnostic.push({
      id: 'fbc_wbc',
      name: 'Full Blood Count (WBC count)',
      category: 'lab',
      rationale: 'Alvarado 4-6 — moderate probability. WBC is a key Alvarado component.',
      expectedFinding: 'WBC 10,000-15,000 supports appendicitis. >15,000 supports complicated disease.',
      priority: 'essential',
      interpretation: 'Leukocytosis with left shift strongly supports appendicitis.',
      supportsDiseaseIds: ['appendicitis', 'mesenteric_adenitis'],
    });
    diagnostic.push({
      id: 'crp',
      name: 'C-Reactive Protein (CRP)',
      category: 'lab',
      rationale: 'CRP >50 mg/L supports appendicitis. CRP improves specificity when combined with WBC.',
      expectedFinding: 'CRP >50 mg/L (suggests bacterial inflammation). CRP >100 mg/L (complicated disease).',
      priority: 'essential',
      interpretation: 'Combined WBC >10,000 + CRP >50 mg/L has 90%+ PPV for acute appendicitis.',
      supportsDiseaseIds: ['appendicitis'],
    });
    diagnostic.push({
      id: 'abdominal_ultrasound',
      name: 'Abdominal Ultrasound (Graded Compression)',
      category: 'imaging',
      rationale: 'First-line imaging in moderate probability. Can diagnose appendicitis and exclude mimics.',
      expectedFinding: 'Non-compressible appendix >6mm diameter, target sign, periappendiceal fluid, appendicolith.',
      priority: 'essential',
      interpretation: 'Positive US: non-compressible appendix >6mm. Sensitivity 75-90%, specificity 90-95%. Negative US does not rule out appendicitis.',
      supportsDiseaseIds: ['appendicitis', 'mesenteric_adenitis', 'ovarian_torsion', 'ectopic_pregnancy', 'ureteric_colic'],
    });
    if (femaleOfReproductiveAge) {
      diagnostic.push({
        id: 'beta_hcg',
        name: 'Serum β-hCG (Pregnancy Test)',
        category: 'lab',
        rationale: 'Mandatory in females of reproductive age — rule out ectopic pregnancy.',
        expectedFinding: 'Negative (<5 mIU/mL). If positive, ectopic pregnancy must be excluded.',
        priority: 'essential',
        interpretation: 'Positive β-hCG with RLQ pain requires urgent US to exclude ectopic pregnancy.',
        supportsDiseaseIds: ['ectopic_pregnancy', 'appendicitis'],
      });
    }
    diagnostic.push({
      id: 'urinalysis',
      name: 'Urinalysis (UFEME)',
      category: 'lab',
      rationale: 'Exclude UTI and ureteric colic.',
      expectedFinding: 'Normal in appendicitis. Pyuria suggests UTI. Hematuria suggests stone.',
      priority: 'supportive',
      interpretation: 'May show mild pyuria from inflamed appendix abutting ureter/bladder.',
      supportsDiseaseIds: ['appendicitis', 'ureteric_colic'],
    });
    if (suspectedPerforation) {
      diagnostic.push({
        id: 'erect_cxr',
        name: 'Erect Chest X-Ray',
        category: 'imaging',
        rationale: 'Free air under diaphragm confirms perforation.',
        expectedFinding: 'No free air in uncomplicated appendicitis. Free air suggests perforation.',
        priority: 'essential',
        interpretation: 'Free air under diaphragm is diagnostic of perforated viscus.',
        supportsDiseaseIds: ['appendicitis_perforated', 'perforated_ulcer'],
      });
    }
  } else {
    diagnostic.push({
      id: 'fbc_wbc',
      name: 'Full Blood Count (WBC count)',
      category: 'lab',
      rationale: 'Alvarado ≥7 — high probability. WBC supports severity assessment.',
      expectedFinding: 'WBC >12,000. >15,000 suggests complicated disease.',
      priority: 'essential',
      interpretation: 'High WBC with left shift strongly supports acute appendicitis.',
      supportsDiseaseIds: ['appendicitis'],
    });
    diagnostic.push({
      id: 'crp',
      name: 'C-Reactive Protein (CRP)',
      category: 'lab',
      rationale: 'High CRP correlates with severity and risk of perforation.',
      expectedFinding: 'CRP >100 mg/L suggests complicated appendicitis.',
      priority: 'essential',
      interpretation: 'CRP >100 mg/L has 80% sensitivity for gangrenous/perforated appendicitis.',
      supportsDiseaseIds: ['appendicitis'],
    });
    diagnostic.push({
      id: 'abdominal_ultrasound',
      name: 'Abdominal Ultrasound (Graded Compression)',
      category: 'imaging',
      rationale: 'US can confirm diagnosis at bedside. Evaluate for complications.',
      expectedFinding: 'Non-compressible appendix >6mm, periappendiceal fluid, appendicolith, abscess.',
      priority: 'essential',
      interpretation: 'Positive US confirms diagnosis. Negative US with high clinical suspicion → proceed to CT.',
      supportsDiseaseIds: ['appendicitis', 'appendiceal_abscess', 'appendiceal_mass'],
    });
    if (alvarado.score >= 7 && !suspectedPerforation) {
      diagnostic.push({
        id: 'ct_abdomen_pelvis',
        name: 'CT Abdomen & Pelvis with IV Contrast',
        category: 'imaging',
        rationale: 'Gold standard when probability is high but US inconclusive.',
        expectedFinding: 'Enlarged appendix >7mm, wall enhancement, periappendiceal fat stranding, appendicolith.',
        priority: 'supportive',
        interpretation: 'CT has 95%+ sensitivity and specificity for acute appendicitis. Can identify complications and alternative diagnoses.',
        supportsDiseaseIds: ['appendicitis', 'appendiceal_abscess', 'appendiceal_mass', 'ureteric_colic', 'diverticulitis'],
      });
    }
    if (femaleOfReproductiveAge) {
      diagnostic.push({
        id: 'beta_hcg',
        name: 'Serum β-hCG (Pregnancy Test)',
        category: 'lab',
        rationale: 'Mandatory before surgery in women of reproductive age.',
        expectedFinding: 'Negative.',
        priority: 'essential',
        interpretation: 'Positive β-hCG: defer CT, use US or MRI. Pregnancy alters management and imaging choice.',
        supportsDiseaseIds: ['ectopic_pregnancy', 'appendicitis'],
      });
    }
    if (suspectedPerforation) {
      diagnostic.push({
        id: 'erect_cxr',
        name: 'Erect Chest X-Ray',
        category: 'imaging',
        rationale: 'Assess for free air under diaphragm suggesting perforation.',
        expectedFinding: 'May show free air under right diaphragm if perforation present.',
        priority: 'essential',
        interpretation: 'Free air confirms perforated viscus requires emergency surgery.',
        supportsDiseaseIds: ['appendicitis_perforated'],
      });
      diagnostic.push({
        id: 'ct_abdomen_pelvis',
        name: 'CT Abdomen & Pelvis with IV Contrast',
        category: 'imaging',
        rationale: 'Assess extent of perforation, abscess, or mass.',
        expectedFinding: 'Extraluminal air, abscess collection, phlegmon, appendicolith.',
        priority: 'essential',
        interpretation: 'CT defines extent of complicated appendicitis and guides management (drain vs surgery).',
        supportsDiseaseIds: ['appendicitis_perforated', 'appendiceal_abscess', 'appendiceal_mass'],
      });
    }
    if (context.isElderly) {
      diagnostic.push({
        id: 'ecg',
        name: 'ECG',
        category: 'bedside',
        rationale: 'Rule out inferoposterior MI mimicking acute abdomen in elderly.',
        expectedFinding: 'No ST elevation or depression in II, III, aVF.',
        priority: 'supportive',
        interpretation: 'Inferior MI can present with epigastric/RIF pain in elderly.',
        supportsDiseaseIds: ['myocardial_infarction_inferior'],
      });
    }
  }

  const preOperative: InvestigationOrder[] = [];

  preOperative.push({
    id: 'uecr',
    name: 'Urea, Electrolytes, Creatinine',
    category: 'lab',
    rationale: 'Baseline renal function, assess dehydration from vomiting/third-spacing.',
    expectedFinding: 'Normal or mildly elevated urea (prerenal). Normal creatinine.',
    priority: 'essential',
    interpretation: 'Elevated urea with normal creatinine suggests prerenal azotemia from dehydration.',
    supportsDiseaseIds: ['appendicitis'],
  });
  preOperative.push({
    id: 'blood_group_crossmatch',
    name: 'Blood Group & Crossmatch',
    category: 'lab',
    rationale: 'Pre-operative preparation — reserve 2 units if complicated disease.',
    expectedFinding: 'Blood group confirmation. Crossmatch compatible.',
    priority: 'supportive',
    interpretation: 'Mandatory if complicated appendicitis or high bleeding risk.',
    supportsDiseaseIds: ['appendicitis'],
  });
  preOperative.push({
    id: 'coagulation_profile',
    name: 'Coagulation Profile (PT/PTT/INR)',
    category: 'lab',
    rationale: 'Pre-operative baseline. Assess bleeding risk.',
    expectedFinding: 'Normal PT/PTT/INR.',
    priority: 'supportive',
    interpretation: 'Abnormal coagulation may need correction before surgery.',
    supportsDiseaseIds: ['appendicitis'],
  });

  if (suspectedPerforation || alvarado.score >= 7) {
    preOperative.push({
      id: 'blood_cultures',
      name: 'Blood Cultures (×2 sets)',
      category: 'lab',
      rationale: 'Febrile/septic patient — identify causative organism for targeted antibiotics.',
      expectedFinding: 'May grow E. coli, Bacteroides fragilis, Peptostreptococcus, Pseudomonas.',
      priority: 'essential',
      interpretation: 'Positive blood cultures guide antibiotic tailoring in complicated disease.',
      supportsDiseaseIds: ['appendicitis_perforated', 'sepsis'],
    });
  }

  if (context.isChild) {
    preOperative.push({
      id: 'random_blood_sugar',
      name: 'Random Blood Sugar',
      category: 'lab',
      rationale: 'Children are prone to hypoglycemia with NPO and IV fluids.',
      expectedFinding: 'Normal (3.5-7.0 mmol/L).',
      priority: 'supportive',
      interpretation: 'Hypoglycemia requires correction before surgery.',
      supportsDiseaseIds: ['appendicitis'],
    });
  }

  if (suspectedPerforation) {
    preOperative.push({
      id: 'lactate',
      name: 'Serum Lactate',
      category: 'lab',
      rationale: 'Assess tissue hypoperfusion from sepsis.',
      expectedFinding: 'Lactate <2 mmol/L normal. >2 mmol/L suggests hypoperfusion. >4 mmol/L indicates severe sepsis.',
      priority: 'essential',
      interpretation: 'Elevated lactate in suspected perforation requires aggressive resuscitation and emergency surgery.',
      supportsDiseaseIds: ['appendicitis_perforated', 'sepsis', 'septic_shock'],
    });
    preOperative.push({
      id: 'arterial_blood_gas',
      name: 'Arterial Blood Gas',
      category: 'lab',
      rationale: 'Assess acid-base status in septic patient.',
      expectedFinding: 'Normal or mild metabolic acidosis. Severe acidosis suggests shock.',
      priority: 'supportive',
      interpretation: 'Metabolic acidosis with elevated lactate is an ominous sign in perforated appendicitis.',
      supportsDiseaseIds: ['appendicitis_perforated', 'sepsis'],
    });
  }

  const complications: InvestigationOrder[] = [];

  if (suspectedPerforation) {
    if (!diagnostic.some(d => d.id === 'ct_abdomen_pelvis')) {
      complications.push({
        id: 'ct_abdomen_pelvis',
        name: 'CT Abdomen & Pelvis with IV Contrast',
        category: 'imaging',
        rationale: 'Define extent of perforation, abscess, or mass for surgical planning.',
        expectedFinding: 'Extraluminal air, abscess, phlegmon, appendicolith.',
        priority: 'essential',
        interpretation: 'CT defines extent of complicated disease and guides management.',
        supportsDiseaseIds: ['appendicitis_perforated', 'appendiceal_abscess', 'appendiceal_mass'],
      });
    }
    complications.push({
      id: 'repeat_crp_wbc',
      name: 'Serial WBC & CRP (48h)',
      category: 'lab',
      rationale: 'Monitor response to antibiotics and resolution of inflammation.',
      expectedFinding: 'Trending down after 48h of antibiotics.',
      priority: 'supportive',
      interpretation: 'Persistently elevated or rising WBC/CRP suggests ongoing infection or abscess.',
      supportsDiseaseIds: ['appendiceal_abscess'],
    });
  }

  let notes = '';
  if (alvarado.score <= 3) {
    notes = 'Low Alvarado score (≤3). Appendicitis unlikely. Observe for 6-12h, reassess. Consider alternative diagnoses. Discharge with safety netting if improving.';
  } else if (alvarado.score <= 6) {
    notes = 'Moderate Alvarado score (4-6). Proceed with imaging to confirm. If US positive → surgical consultation. If US negative but high suspicion → CT scan. If both negative → observe or consider alternative diagnosis.';
  } else {
    notes = 'High Alvarado score (≥7). High probability of appendicitis. Surgical consultation recommended. Start IV antibiotics. Pre-operative investigations as indicated above.';
  }
  if (suspectedPerforation) {
    notes += ' SUSPECTED PERFORATION/COMPLICATED DISEASE: Emergency surgical consultation. IV broad-spectrum antibiotics. Resuscitation with IV fluids. Lactate and blood cultures essential. CT for surgical planning.';
  }
  if (context.pregnant) {
    notes += ' PREGNANT PATIENT: Use graded compression US as first-line. If inconclusive, MRI without gadolinium. Avoid CT if possible. Laparoscopic appendectomy is safe in pregnancy. Consult obstetrics.';
  }
  if (context.isChild) {
    notes += ' PEDIATRIC PATIENT: Alvarado score modified for children. Consider US as first imaging. Lower threshold for CT if US negative with high suspicion. Monitor for dehydration.';
  }
  if (context.isElderly) {
    notes += ' ELDERLY PATIENT: Atypical presentation common. Lower threshold for CT. Higher risk of perforation (delay in diagnosis common). ECG to rule out MI. Monitor renal function with contrast.';
  }

  return { diagnostic, preOperative, complications, notes };
}

export function interpretLabResults(
  registry: FeatureRegistry,
  results: Record<string, string | number>,
): string[] {
  const interpretations: string[] = [];

  const wbc = results.wbc ?? results.WBC;
  const crp = results.crp ?? results.CRP;
  const lactate = results.lactate ?? results.Lactate;
  const hcg = results.beta_hcg ?? results['β-hCG'] ?? results.hCG;

  if (typeof wbc === 'number') {
    if (wbc > 15000) interpretations.push('WBC >15,000 — suggests complicated/gangrenous appendicitis. High probability of perforation.');
    else if (wbc > 10000) interpretations.push('WBC 10,000-15,000 — leukocytosis consistent with acute appendicitis.');
    else interpretations.push('WBC normal — does not rule out early appendicitis. Recheck in 6-12h if suspicion persists.');
  }

  if (typeof crp === 'number') {
    if (crp > 100) interpretations.push(`CRP ${crp} mg/L — markedly elevated, strongly suggests complicated or gangrenous appendicitis.`);
    else if (crp > 50) interpretations.push(`CRP ${crp} mg/L — elevated, supports acute bacterial inflammation consistent with appendicitis.`);
    else interpretations.push('CRP normal or mildly elevated — may be early in course or alternative diagnosis.');
  }

  if (typeof lactate === 'number') {
    if (lactate > 4) interpretations.push(`Lactate ${lactate} mmol/L — severe tissue hypoperfusion, concern for bowel ischemia/gangrene. EMERGENCY.`);
    else if (lactate > 2) interpretations.push(`Lactate ${lactate} mmol/L — mildly elevated, suggests tissue hypoperfusion. Resuscitate and recheck.`);
    else interpretations.push('Lactate normal — no evidence of significant tissue hypoperfusion.');
  }

  const hcgPositive = hcg === 'positive' || (typeof hcg === 'string' && hcg.toLowerCase().includes('pos'));
  if (hcgPositive) {
    interpretations.push('β-hCG POSITIVE — must exclude ectopic pregnancy. Urgent pelvic ultrasound required before any surgical decision.');
  }

  return interpretations;
}
