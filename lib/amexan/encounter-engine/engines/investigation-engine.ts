import type { LabOrder, ImagingOrder, InvestigationCategory, OrderStatus } from '../types/ces';
import type { AutoExecutionPlan } from './protocol-auto-executor';

const LAB_CATEGORIES: Record<string, { category: InvestigationCategory; reason: string }> = {
  'fbc': { category: 'supportive_baseline', reason: 'Baseline blood counts, assess for infection, anemia, thrombocytopenia' },
  'full blood count': { category: 'supportive_baseline', reason: 'Baseline blood counts, assess for infection, anemia, thrombocytopenia' },
  'cbc': { category: 'supportive_baseline', reason: 'Baseline blood counts, assess for infection, anemia, thrombocytopenia' },
  'u&e': { category: 'supportive_baseline', reason: 'Assess renal function and electrolytes' },
  'creatinine': { category: 'supportive_baseline', reason: 'Assess renal function' },
  'lfts': { category: 'supportive_baseline', reason: 'Assess liver function and synthetic capacity' },
  'lft': { category: 'supportive_baseline', reason: 'Assess liver function and synthetic capacity' },
  'crp': { category: 'diagnostic', reason: 'Inflammatory marker — elevated in infection, inflammation' },
  'procalcitonin': { category: 'diagnostic', reason: 'Differentiate bacterial from viral infection' },
  'blood culture': { category: 'diagnostic', reason: 'Identify causative organism and sensitivity pattern' },
  'blood cultures': { category: 'diagnostic', reason: 'Identify causative organism and sensitivity pattern' },
  'lactate': { category: 'diagnostic', reason: 'Tissue hypoperfusion marker — guides resuscitation' },
  'abg': { category: 'diagnostic', reason: 'Assess oxygenation, ventilation, and acid-base status' },
  'blood gas': { category: 'diagnostic', reason: 'Assess oxygenation, ventilation, and acid-base status' },
  'blood glucose': { category: 'supportive_baseline', reason: 'Screen for hypoglycemia/hyperglycemia' },
  'urinalysis': { category: 'supportive_baseline', reason: 'Screen for UTI, ketones, protein, blood' },
  'urine culture': { category: 'diagnostic', reason: 'Confirm UTI and identify organism' },
  'hiv test': { category: 'supportive_baseline', reason: 'Routine screening — guides management' },
  'hiv': { category: 'supportive_baseline', reason: 'Routine screening — guides management' },
  'malaria smear': { category: 'diagnostic', reason: 'Confirm malaria diagnosis and quantify parasitemia' },
  'blood film': { category: 'diagnostic', reason: 'Identify hemoparasites and cell morphology' },
  'blood film for parasites': { category: 'diagnostic', reason: 'Identify hemoparasites and cell morphology' },
  'coagulation': { category: 'supportive_baseline', reason: 'Assess coagulation profile before procedures' },
  'coagulation profile': { category: 'supportive_baseline', reason: 'Assess coagulation profile before procedures' },
  'bnp': { category: 'diagnostic', reason: 'Assess for heart failure' },
  'troponin': { category: 'diagnostic', reason: 'Assess for myocardial injury' },
  'pregnancy test': { category: 'supportive_baseline', reason: 'Rule out pregnancy in women of reproductive age' },
  'hba1c': { category: 'supportive_baseline', reason: 'Assess glycemic control over preceding 3 months' },
  'tsh': { category: 'supportive_baseline', reason: 'Assess thyroid function' },
  'urine pregnancy': { category: 'supportive_baseline', reason: 'Rule out pregnancy in women of reproductive age' },
  'stool culture': { category: 'diagnostic', reason: 'Identify enteric pathogen' },
  'stool microscopy': { category: 'diagnostic', reason: 'Identify ova, cysts, parasites' },
  'csf analysis': { category: 'diagnostic', reason: 'Analyze cerebrospinal fluid for meningitis/encephalitis' },
  'csf culture': { category: 'diagnostic', reason: 'Identify CNS pathogen' },
  'sputum culture': { category: 'diagnostic', reason: 'Identify respiratory pathogen' },
  'sputum gram stain': { category: 'diagnostic', reason: 'Initial identification of respiratory pathogen' },
  'genexpert': { category: 'diagnostic', reason: 'Detect TB and rifampicin resistance' },
  'gene xpert': { category: 'diagnostic', reason: 'Detect TB and rifampicin resistance' },
};

const IMAGING_CATEGORIES: Record<string, { category: InvestigationCategory; reason: string }> = {
  'chest x-ray': { category: 'diagnostic', reason: 'Assess for pneumonia, effusion, cardiomegaly, TB' },
  'cxr': { category: 'diagnostic', reason: 'Assess for pneumonia, effusion, cardiomegaly, TB' },
  'chest ct': { category: 'diagnostic', reason: 'Detailed lung parenchymal assessment' },
  'ct head': { category: 'diagnostic', reason: 'Assess for intracranial pathology, hemorrhage, mass' },
  'ct abdomen': { category: 'diagnostic', reason: 'Assess for intra-abdominal pathology' },
  'abdominal x-ray': { category: 'diagnostic', reason: 'Assess for obstruction, perforation, free air' },
  'axr': { category: 'diagnostic', reason: 'Assess for obstruction, perforation, free air' },
  'abdominal us': { category: 'diagnostic', reason: 'Assess abdominal viscera, free fluid, masses' },
  'ultrasound abdomen': { category: 'diagnostic', reason: 'Assess abdominal viscera, free fluid, masses' },
  'echocardiogram': { category: 'diagnostic', reason: 'Assess cardiac structure and function' },
  'echo': { category: 'diagnostic', reason: 'Assess cardiac structure and function' },
  'ecg': { category: 'supportive_baseline', reason: 'Baseline cardiac assessment, assess for arrhythmia/ischemia' },
  'ekg': { category: 'supportive_baseline', reason: 'Baseline cardiac assessment, assess for arrhythmia/ischemia' },
  'mri': { category: 'diagnostic', reason: 'Detailed soft tissue assessment' },
  'ct pulmonary angiogram': { category: 'diagnostic', reason: 'Assess for pulmonary embolism' },
  'ctpa': { category: 'diagnostic', reason: 'Assess for pulmonary embolism' },
};

export function categorizeLab(testName: string): { category: InvestigationCategory; reason: string } {
  const key = testName.toLowerCase().trim();
  return LAB_CATEGORIES[key] || { category: 'supportive_baseline', reason: `Investigate per clinical presentation` };
}

export function categorizeImaging(studyName: string): { category: InvestigationCategory; reason: string } {
  const key = studyName.toLowerCase().trim();
  return IMAGING_CATEGORIES[key] || { category: 'diagnostic', reason: `Assess per clinical indication` };
}

export function extractLabOrders(plan: AutoExecutionPlan | null): LabOrder[] {
  if (!plan) return [];

  const seen = new Set<string>();
  const orders: LabOrder[] = [];
  const now = Date.now();

  const allLabs = plan.suggestedLabs || [];
  for (const lab of allLabs) {
    const key = lab.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    const { category, reason } = categorizeLab(lab);
    orders.push({
      id: `lab_${key.replace(/[^a-z0-9]/g, '_')}_${now}`,
      testName: lab,
      method: 'blood_work',
      category,
      reason,
      priority: plan.severity === 'severe' ? 'stat' : plan.severity === 'moderate' ? 'urgent' : 'routine',
      status: 'suggested',
      departmentId: 'lab',
    });
  }

  return orders;
}

export function extractImagingOrders(plan: AutoExecutionPlan | null): ImagingOrder[] {
  if (!plan) return [];

  const seen = new Set<string>();
  const orders: ImagingOrder[] = [];
  const now = Date.now();

  const allImaging = plan.suggestedImaging || [];
  for (const img of allImaging) {
    const key = img.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    const { category, reason } = categorizeImaging(img);
    const modality = detectModality(img);
    const region = detectBodyRegion(img);
    orders.push({
      id: `img_${key.replace(/[^a-z0-9]/g, '_')}_${now}`,
      studyName: img,
      method: 'imaging',
      category,
      reason,
      priority: plan.severity === 'severe' ? 'stat' : plan.severity === 'moderate' ? 'urgent' : 'routine',
      status: 'suggested',
      modality,
      bodyRegion: region,
      departmentId: 'radiology',
    });
  }

  return orders;
}

export function mergeInvestigationOrders(
  existingLabs: LabOrder[],
  existingImaging: ImagingOrder[],
  plan: AutoExecutionPlan | null,
): { labs: LabOrder[]; imaging: ImagingOrder[] } {
  const newLabs = extractLabOrders(plan);
  const newImaging = extractImagingOrders(plan);

  const existingLabKeys = new Set(existingLabs.map(l => l.testName.toLowerCase().trim()));
  const mergedLabs = [
    ...existingLabs,
    ...newLabs.filter(l => !existingLabKeys.has(l.testName.toLowerCase().trim())),
  ];

  const existingImgKeys = new Set(existingImaging.map(i => i.studyName.toLowerCase().trim()));
  const mergedImaging = [
    ...existingImaging,
    ...newImaging.filter(i => !existingImgKeys.has(i.studyName.toLowerCase().trim())),
  ];

  return { labs: mergedLabs, imaging: mergedImaging };
}

function detectModality(study: string): ImagingOrder['modality'] {
  const lower = study.toLowerCase();
  if (lower.includes('x-ray') || lower.includes('cxr') || lower.includes('axr')) return 'X-ray';
  if (lower.includes('ct ')) return 'CT';
  if (lower.includes('mri')) return 'MRI';
  if (lower.includes('us') || lower.includes('ultrasound') || lower.includes('abdominal u')) return 'Ultrasound';
  if (lower.includes('echo')) return 'Echocardiogram';
  if (lower.includes('ecg') || lower.includes('ekg')) return 'ECG';
  return 'Other';
}

function detectBodyRegion(study: string): string {
  const lower = study.toLowerCase();
  if (lower.includes('chest') || lower.includes('cxr') || lower.includes('pulmonary')) return 'Chest';
  if (lower.includes('head') || lower.includes('brain')) return 'Head';
  if (lower.includes('abdominal') || lower.includes('abdomen')) return 'Abdomen';
  if (lower.includes('cardiac') || lower.includes('echo')) return 'Cardiac';
  if (lower.includes('pelvic') || lower.includes('pelvis')) return 'Pelvis';
  if (lower.includes('spine') || lower.includes('vertebral')) return 'Spine';
  return 'As indicated';
}
