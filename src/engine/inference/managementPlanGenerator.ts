import { PatientForm, ManagementPlan, Prescription } from '../../types';
import { ScoredDisease } from './types';
import { ESSENTIAL_DRUGS } from '../knowledge-graph/reference';

const ROUTE_ALIASES: Record<string, string> = {
  po: 'PO', oral: 'PO', 'by mouth': 'PO',
  iv: 'IV', intravenous: 'IV',
  im: 'IM', intramuscular: 'IM',
  neb: 'Nebulised', nebulised: 'Nebulised', nebulized: 'Nebulised', inhaled: 'Inhaled',
  pr: 'PR', rectal: 'PR',
  sc: 'SC', subcutaneous: 'SC',
  sl: 'SL', sublingual: 'SL',
  topical: 'Topical',
  'mdi + spacer': 'Inhaled', inhaler: 'Inhaled',
  ng: 'NG', nasogastric: 'NG',
  io: 'IO', intraosseous: 'IO',
  intrapleural: 'Intrapleural',
  buccal: 'Buccal',
};

const KNOWN_DRUG_NAMES: { name: string; keywords: string[] }[] = [
  { name: 'Amoxicillin (pneumonia)', keywords: ['amoxicillin'] },
  { name: 'Amoxicillin (simple infection)', keywords: ['amoxicillin'] },
  { name: 'Benzylpenicillin', keywords: ['benzylpenicillin', 'penicillin'] },
  { name: 'Gentamicin', keywords: ['gentamicin'] },
  { name: 'Ceftriaxone', keywords: ['ceftriaxone'] },
  { name: 'Ceftazidime', keywords: ['ceftazidime'] },
  { name: 'Metronidazole', keywords: ['metronidazole'] },
  { name: 'Prednisolone (asthma)', keywords: ['prednisolone'] },
  { name: 'Dexamethasone (croup)', keywords: ['dexamethasone'] },
  { name: 'Salbutamol (nebulised)', keywords: ['salbutamol', 'ventolin', 'albuterol'] },
  { name: 'Salbutamol MDI + spacer', keywords: ['salbutamol', 'ventolin'] },
  { name: 'Ipratropium bromide', keywords: ['ipratropium'] },
  { name: 'Magnesium sulphate (severe asthma)', keywords: ['magnesium sulphate', 'magnesium sulfate', 'mgso4'] },
  { name: 'Adrenaline nebulised (croup)', keywords: ['adrenaline', 'epinephrine'] },
  { name: 'Adrenaline 1:1,000 IM (anaphylaxis)', keywords: ['adrenaline', 'epinephrine'] },
  { name: 'Adrenaline 1:10,000 (cardiac arrest)', keywords: ['adrenaline', 'epinephrine'] },
  { name: 'Rifampicin (TB)', keywords: ['rifampicin', 'rifampin', 'r'] },
  { name: 'Isoniazid (INH, TB)', keywords: ['isoniazid', 'inh'] },
  { name: 'Pyrazinamide (TB)', keywords: ['pyrazinamide', 'pza'] },
  { name: 'Ethambutol (TB)', keywords: ['ethambutol'] },
  { name: 'Amikacin', keywords: ['amikacin'] },
  { name: 'Aminophylline (loading)', keywords: ['aminophylline'] },
  { name: 'Ampicillin (>1 month)', keywords: ['ampicillin'] },
  { name: 'Artesunate IV (<=20 kg)', keywords: ['artesunate'] },
  { name: 'Artesunate IV (>20 kg)', keywords: ['artesunate'] },
  { name: 'Azithromycin', keywords: ['azithromycin'] },
  { name: 'Caffeine citrate (apnoea)', keywords: ['caffeine'] },
  { name: 'Calcium gluconate 10%', keywords: ['calcium gluconate'] },
  { name: 'Ciprofloxacin', keywords: ['ciprofloxacin'] },
  { name: 'Co-trimoxazole (prophylaxis)', keywords: ['co-trimoxazole', 'cotrimoxazole', 'septrin'] },
  { name: 'Diazepam (IV/IO)', keywords: ['diazepam'] },
  { name: 'Diazepam (rectal)', keywords: ['diazepam'] },
  { name: 'Dextrose 10% (hypoglycaemia)', keywords: ['dextrose'] },
  { name: 'Flucloxacillin', keywords: ['flucloxacillin'] },
  { name: 'Hydroxyurea (sickle cell)', keywords: ['hydroxyurea'] },
  { name: 'Ibuprofen', keywords: ['ibuprofen', 'brufen'] },
  { name: 'Levetiracetam (loading)', keywords: ['levetiracetam', 'keppra'] },
  { name: 'Lorazepam (IV)', keywords: ['lorazepam', 'ativan'] },
  { name: 'Mannitol 20% (cerebral oedema)', keywords: ['mannitol'] },
  { name: 'Midazolam (buccal)', keywords: ['midazolam'] },
  { name: 'Morphine (oral)', keywords: ['morphine'] },
  { name: 'Naloxone', keywords: ['naloxone', 'narcan'] },
  { name: 'Nystatin (oral thrush)', keywords: ['nystatin'] },
  { name: 'Omeprazole', keywords: ['omeprazole'] },
  { name: 'Paracetamol', keywords: ['paracetamol', 'acetaminophen'] },
  { name: 'Phenobarbitone (loading)', keywords: ['phenobarbitone', 'phenobarbital'] },
  { name: 'Phenobarbitone (maintenance)', keywords: ['phenobarbitone', 'phenobarbital'] },
  { name: 'Phenytoin (loading)', keywords: ['phenytoin', 'dilantin'] },
  { name: 'Sodium valproate (status)', keywords: ['sodium valproate', 'valproate', 'depakine'] },
  { name: '3% Hypertonic saline', keywords: ['hypertonic saline'] },
  { name: 'Vitamin A', keywords: ['vitamin a'] },
  { name: 'Zinc', keywords: ['zinc'] },
  { name: 'Urokinase (intrapleural)', keywords: ['urokinase'] },
];

function matchDrugName(step: string): string | null {
  const lower = step.toLowerCase();
  for (const entry of KNOWN_DRUG_NAMES) {
    if (entry.keywords.every(k => lower.includes(k))) return entry.name;
  }
  return null;
}

function extractDosePerKg(step: string): { doseText: string; perKg: number | null } | null {
  const lower = step.toLowerCase();
  // Match patterns like "40-45 mg/kg/dose", "7.5 mg/kg", "50,000 IU/kg"
  const mgKgMatch = lower.match(/([\d,.]+)\s*(?:-?\s*([\d,.]+))?\s*(mg|mcg|µg|g|iu)\s*\/\s*kg/i);
  if (mgKgMatch) {
    const low = parseFloat(mgKgMatch[1].replace(/,/g, ''));
    const high = mgKgMatch[2] ? parseFloat(mgKgMatch[2].replace(/,/g, '')) : low;
    const unit = mgKgMatch[3].toLowerCase();
    const mid = (low + high) / 2;
    let perKg: number | null = mid;
    if (unit === 'mcg' || unit === 'µg') perKg = mid / 1000;
    if (unit === 'g') perKg = mid * 1000;
    if (unit === 'iu') perKg = mid; // IU/kg stays as-is
    const rangeStr = low === high ? `${low}` : `${low}-${high}`;
    return { doseText: `${rangeStr} ${mgKgMatch[3]}/kg/dose`, perKg };
  }
  // Match patterns like "2.5 mg" (fixed dose, not per kg) — return null, handled by ESSENTIAL_DRUGS
  return null;
}

function extractRoute(step: string): string {
  const lower = step.toLowerCase();
  for (const [alias, route] of Object.entries(ROUTE_ALIASES)) {
    const regex = new RegExp(`\\b${alias}\\b`, 'i');
    if (regex.test(lower)) return route;
  }
  // Try to detect route from common prepositions
  if (/\b(po|orally|oral)\b/i.test(lower)) return 'PO';
  if (/\b(iv|intravenous)\b/i.test(lower)) return 'IV';
  if (/\b(im|intramuscular)\b/i.test(lower)) return 'IM';
  if (/\b(neb|nebulised|inhal)\b/i.test(lower)) return 'Nebulised';
  if (/\bpr\b/i.test(lower)) return 'PR';
  return '';
}

function extractFrequency(step: string): string {
  const lower = step.toLowerCase();
  if (/\b(od|once daily|daily)\b/i.test(lower) && !/\bevery\s+h/i.test(lower)) return 'Every 24 h';
  if (/\b(bd|twice daily|every 12 h)\b/i.test(lower)) return 'Every 12 h';
  if (/\b(tds|three times daily|every 8 h)\b/i.test(lower)) return 'Every 8 h';
  if (/\b(qds|four times daily|every 6 h)\b/i.test(lower)) return 'Every 6 h';
  if (/\b(stat|single dose)\b/i.test(lower)) return 'Stat';
  if (/\bprn\b/i.test(lower)) return 'PRN';

  const qPattern = lower.match(/\bq(\d+)\s*h\b/i);
  if (qPattern) {
    const h = qPattern[1];
    const count = lower.match(/x\s*(\d+)/i);
    return count ? `Every ${h} h x ${count[1]} doses` : `Every ${h} h`;
  }

  const hourly = lower.match(/\bevery\s+(\d+)\s*h(?:ours?)?/i);
  if (hourly) {
    const h = hourly[1];
    const count = lower.match(/x\s*(\d+)/i);
    return count ? `Every ${h} h x ${count[1]} doses` : `Every ${h} h`;
  }

  const minutely = lower.match(/\bevery\s+(\d+)\s*min/i);
  if (minutely) return `Every ${minutely[1]} min`;

  return '';
}

function extractDuration(step: string): string {
  const lower = step.toLowerCase();
  const dayMatch = lower.match(/x\s+(\d+)\s*(?:days?|d)/i);
  if (dayMatch) return `${dayMatch[1]} days`;
  const weekMatch = lower.match(/x\s+(\d+)\s*weeks?/i);
  if (weekMatch) return `${weekMatch[1]} weeks`;
  const monthMatch = lower.match(/x\s+(\d+)\s*months?/i);
  if (monthMatch) return `${monthMatch[1]} months`;
  const courseMatch = lower.match(/for\s+(\d+)\s*(?:days?|d)/i);
  if (courseMatch) return `${courseMatch[1]} days`;
  return '';
}

function lookupDrug(drugName: string): typeof ESSENTIAL_DRUGS[0] | null {
  const lower = drugName.toLowerCase();
  // Exact match first
  const exact = ESSENTIAL_DRUGS.find(d => d.drug.toLowerCase() === lower);
  if (exact) return exact;
  // Partial match
  return ESSENTIAL_DRUGS.find(d => {
    const dl = d.drug.toLowerCase();
    const keyParts = lower.replace(/[()].*$/, '').trim();
    return dl.includes(keyParts) || keyParts.includes(dl.split('(')[0].trim());
  }) || null;
}

function computePrescription(
  step: string,
  weightKg: number,
  ageMonths: number
): Prescription | null {
  // Skip non-drug steps
  const nonDrugPatterns = [
    /^(do not|maintain|keep|call|prepare|notify|admit|monitor|watch|oxygen|iv fluids|ng\/iv|ensure|if no)/i,
    /(cxr|chest x-ray|echo|ecg|fbc|crp|blood culture|abg|gastric aspirate|geneXpert|mantoux|igra|lft)/i,
    /(chest tube|needle decompression|underwater seal|vats|bronchoscopy|cpr)/i,
    /nasal suction|suctioning/i,
    /spacer/i,
    /heliox/i,
  ];
  for (const p of nonDrugPatterns) {
    if (p.test(step)) return null;
  }

  const drugKey = matchDrugName(step);
  if (!drugKey) {
    return parseGenericDrugStep(step, weightKg);
  }

  const route = extractRoute(step);
  const frequency = extractFrequency(step);
  const duration = extractDuration(step);
  const doseInfo = extractDosePerKg(step);

  const drugRef = lookupDrug(drugKey);
  let doseComputed = '';
  let notes = '';
  let maxCapped = false;
  let maxCappedDetail = '';
  const doseRaw = doseInfo?.doseText || '';

  if (drugRef) {
    try {
      doseComputed = drugRef.dose(weightKg, ageMonths);
    } catch {
      doseComputed = doseInfo ? `${Math.round((doseInfo.perKg || 0) * weightKg)} mg` : '';
    }
    notes = drugRef.note || '';

    // Check if computed dose hits the max-dose cap
    const cap = DRUG_MAX_CAP[drugKey];
    if (cap && weightKg > 0) {
      const perKg = extractNumericDosePerKg(drugRef.dose);
      if (perKg !== null) {
        const rawValue = perKg * weightKg;
        if (rawValue > cap.value) {
          maxCapped = true;
          maxCappedDetail = `⚠ capped at ${cap.value} ${cap.unit} (max safe paediatric dose — verify weight)`;
        }
      }
    }
  } else if (doseInfo && doseInfo.perKg) {
    doseComputed = `${Math.round(doseInfo.perKg * weightKg)} mg`;
  }

  const finalRoute = route || (drugRef?.route || '');
  const finalFreq = frequency || (drugRef?.freq || '');

  if (!doseComputed && !finalRoute && !finalFreq) return null;

  return {
    drugName: drugKey.split('(')[0].trim(),
    doseComputed: doseComputed || 'see protocol',
    doseRaw,
    route: finalRoute,
    frequency: finalFreq,
    duration: duration || '',
    indication: '',
    notes,
    drugClass: '',
    weightUsed: weightKg,
    maxCapped,
    maxCappedDetail: maxCapped ? maxCappedDetail : undefined,
  };
}

// ── MAX-DOSE SAFETY CAPS ──────────────────────────────────────────────────────
// These are silently applied to prevent toxic dosing from weight entry errors.
const DRUG_MAX_CAP: Record<string, { value: number; unit: string }> = {
  'Benzylpenicillin': { value: 4_000_000, unit: 'IU' },
  'Ceftriaxone': { value: 2000, unit: 'mg' },
  'Ceftazidime': { value: 2000, unit: 'mg' },
  'Gentamicin': { value: 500, unit: 'mg' },
  'Flucloxacillin': { value: 2000, unit: 'mg' },
  'Amoxicillin (pneumonia)': { value: 2000, unit: 'mg' },
  'Amoxicillin (simple infection)': { value: 1000, unit: 'mg' },
  'Ampicillin (>1 month)': { value: 500, unit: 'mg' },
  'Azithromycin': { value: 500, unit: 'mg' },
  'Metronidazole': { value: 500, unit: 'mg' },
  'Ciprofloxacin': { value: 500, unit: 'mg' },
  'Ibuprofen': { value: 400, unit: 'mg' },
  'Prednisolone (asthma)': { value: 40, unit: 'mg' },
  'Dexamethasone (croup)': { value: 16, unit: 'mg' },
  'Lorazepam (IV)': { value: 4, unit: 'mg' },
  'Omeprazole': { value: 20, unit: 'mg' },
  'Phenobarbitone (maintenance)': { value: 60, unit: 'mg' },
  'Calcium gluconate 10%': { value: 20, unit: 'ml' },
  'Diazepam (IV/IO)': { value: 10, unit: 'mg' },
  'Diazepam (rectal)': { value: 10, unit: 'mg' },
  'Magnesium sulphate (severe asthma)': { value: 2000, unit: 'mg' },
  'Rifampicin (TB)': { value: 600, unit: 'mg' },
  'Isoniazid (INH, TB)': { value: 300, unit: 'mg' },
  'Pyrazinamide (TB)': { value: 2000, unit: 'mg' },
  'Ethambutol (TB)': { value: 1200, unit: 'mg' },
};

function extractNumericDosePerKg(doseFn: (w: number, a?: number) => string): number | null {
  const src = doseFn.toString();
  const match = src.match(/([\d.]+)\s*\*\s*w/);
  if (match) return parseFloat(match[1]);
  return null;
}

function parseGenericDrugStep(step: string, weightKg: number): Prescription | null {
  // Try to extract drug name as the first word(s) before dose
  const drugMatch = step.match(/^([A-Za-z\s-]+?)\s+(\d[\d,.\s-]*(?:mg|mcg|g|iu)\/kg)/i);
  if (!drugMatch) return null;
  const drugName = drugMatch[1].trim();
  const route = extractRoute(step);
  const frequency = extractFrequency(step);
  const duration = extractDuration(step);
  const doseInfo = extractDosePerKg(step);

  let doseComputed = '';
  if (doseInfo && doseInfo.perKg) {
    doseComputed = `${Math.round(doseInfo.perKg * weightKg)} mg`;
  }

  return {
    drugName,
    doseComputed: doseComputed || 'see protocol',
    doseRaw: doseInfo?.doseText || '',
    route,
    frequency,
    duration,
    indication: '',
    notes: '',
    drugClass: '',
  };
}

export function computePrescriptionsFromSteps(
  steps: string[],
  weightKg: number,
  ageMonths: number
): Prescription[] {
  const result: Prescription[] = [];
  for (const step of steps) {
    const rx = computePrescription(step, weightKg, ageMonths);
    if (rx) result.push(rx);
  }
  return result;
}

function getDiseaseSeverity(form: PatientForm): string {
  const spo2 = parseFloat(form.vitals.spo2);
  if (spo2 < 88 || form.vitals.examGrunting) return 'severe';
  if (spo2 < 92) return 'moderate';
  return 'mild';
}

function getSafetyNetting(topDiseaseId: string, severity: string, form: PatientForm): string {
  const diseaseSpecific: Record<string, Record<string, string>> = {
    pneumonia: {
      mild: 'Return if: fever persists >48h on antibiotics, breathing becomes laboured, or child cannot feed.',
      moderate: 'Return immediately if: respiratory rate increases, oxygen saturation drops below 90%, chest indrawing worsens, or child becomes lethargic.',
      severe: 'Watch for: increasing oxygen requirement, rising work of breathing, inability to maintain saturations >90%, or deterioration in conscious level.',
    },
    asthma: {
      mild: 'Return if: reliever inhaler needed more than 4-hourly, symptoms wake child at night, or exercise tolerance drops.',
      moderate: 'Return immediately if: unable to speak in full sentences, reliever not helping, or severe distress at rest.',
      severe: 'Watch for: silent chest (no wheeze = critically obstructed), exhaustion, cyanosis, or deteriorating conscious level.',
    },
    bronchiolitis: {
      mild: 'Return if: feeding drops below half normal, breathing becomes faster, or pauses in breathing (apnoea).',
      moderate: 'Return immediately if: grunting, nasal flaring, severe chest indrawing, or oxygen saturation <90%.',
      severe: 'Watch for: apnoeic spells, exhaustion, inability to feed, or rising CO2 (drowsiness).',
    },
    croup: {
      mild: 'Return if: stridor at rest develops, child becomes distressed, or barking cough worsens at night.',
      moderate: 'Return immediately if: stridor becomes constant, child drools or looks toxic, or oxygen saturation falls.',
      severe: 'Watch for: severe sternal recession, fatigue, decreasing conscious level, or need for repeated nebulised adrenaline.',
    },
    epiglottitis: {
      mild: '',
      moderate: '',
      severe: 'Do NOT examine the throat — this can precipitate complete airway obstruction. Keep child upright, calm, and transfer immediately to ICU. Ensure airway equipment ready at all times.',
    },
    foreign_body_aspiration: {
      mild: '',
      moderate: '',
      severe: 'Maintain upright position. Do NOT attempt blind finger sweep. Prepare for bronchoscopy. Watch for sudden worsening from dislodgement.',
    },
    tuberculosis: {
      mild: 'Ensure completion of full course (6 months). Return if: haemoptysis, worsening cough, chest pain, or weight loss.',
      moderate: 'Monitor for drug-induced hepatitis (jaundice, vomiting). Ensure directly observed therapy if possible.',
      severe: 'Watch for:  respiratory distress from massive lymphadenopathy,  signs of miliary TB (meningism, hepatosplenomegaly),  or drug reactions.',
    },
    pleural_effusion: {
      mild: '',
      moderate: 'Return if: increasing breathlessness, chest pain, or fever persists after drainage.',
      severe: 'Watch for: tension physiology (tracheal deviation, distended neck veins, hypotension), rising respiratory rate, or persistent fever suggesting empyema.',
    },
    empyema: {
      mild: '',
      moderate: 'Return if: fever persists after 48h of antibiotics, chest pain worsens, or drainage output increases with purulent fluid.',
      severe: 'Watch for: signs of sepsis (hypotension, tachycardia, altered mental state),  respiratory failure,  or need for surgical decorication.',
    },
    pneumothorax: {
      mild: '',
      moderate: '',
      severe: 'Watch for: tension physiology — tracheal deviation, distended neck veins, hypotension, and falling SpO2. Needle decompression may be required before chest tube insertion.',
    },
  };

  const defMild = 'Return if: symptoms worsen, fever persists, or you have any concerns about your child\'s breathing or feeding.';
  const defModerate = 'Return immediately if: breathing difficulty increases, oxygen saturation falls, child becomes drowsy or lethargic, or feeding stops completely.';
  const defSevere = 'Watch for: rising respiratory rate, increasing oxygen requirement, decreasing conscious level, or inability to maintain airway.';

  const specific = diseaseSpecific[topDiseaseId];
  if (!specific) {
    if (severity === 'severe' || severity === 'critical') return defSevere;
    if (severity === 'moderate') return defModerate;
    return defMild;
  }

  const msg = specific[severity] || specific.moderate || defModerate;
  return msg;
}

export function generateManagementPlan(
  form: PatientForm,
  differentials: ScoredDisease[]
): ManagementPlan {
  const plan: ManagementPlan = {
    diagnosisSpecific: [],
    investigations: [],
    supportiveCare: [],
    monitoring: '',
    followUp: '',
    safetyNetting: '',
    healthEducation: '',
  };

  if (form.complaints.length === 0) return plan;  const weight = parseFloat(form.vitals.weight);
  const weightKg = !isNaN(weight) && weight > 0 ? weight : 0;
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;

  // Always include the top disease, plus any with probability >= 15%
  const sevLevel = getDiseaseSeverity(form);
  const isSevere = sevLevel === 'severe' || sevLevel === 'critical';

  const primaryDx = differentials[0];
  if (!primaryDx) return plan;
  const otherSignificant = differentials.filter(d => d.probability >= 0.15 && d !== primaryDx).slice(0, 2);
  const relevantDxs = [primaryDx, ...otherSignificant];

  // Management protocol driven by PRIMARY working impression only
  const disease = primaryDx.disease;
  const steps: string[] = [];

  if (disease.managementProtocols && disease.managementProtocols.length > 0) {
    let protocol = disease.managementProtocols.find(p => p.condition === sevLevel);
    if (!protocol && (sevLevel === 'mild' || sevLevel === 'moderate')) {
      protocol = disease.managementProtocols.find(p => p.condition === 'non-severe');
    }
    if (!protocol) {
      protocol = disease.managementProtocols[disease.managementProtocols.length - 1];
    }
    if (protocol) steps.push(...protocol.steps);
  }

  const prescriptions = weightKg > 0
    ? computePrescriptionsFromSteps(steps, weightKg, ageMonths)
    : [];

  plan.diagnosisSpecific.push({
    diseaseName: disease.name,
    severity: sevLevel,
    steps,
    prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
  });

  // Investigations collected from ALL significant differentials (primary + high-probability others)
  for (const dx of relevantDxs) {
    if (dx.disease.investigations) {
      const invNames = extractInvestigationNames(dx.disease.investigations);
      for (const name of invNames) {
        if (!plan.investigations.includes(name)) plan.investigations.push(name);
      }
    }
  }

  const spo2 = parseFloat(form.vitals.spo2);
  const hasRespDistress = form.vitals.examIndrawing || form.vitals.examGrunting || (spo2 < 92);
  const hasAlteredConsciousness = form.vitals.examConsciousLevel !== '' && form.vitals.examConsciousLevel !== 'alert';

  // Auto-trigger oxygen
  if (spo2 < 92) {
    plan.supportiveCare.push('Oxygen to maintain SpO₂ ≥ 94% (or 92% if bronchiolitis)');
  } else if (isSevere && spo2 <= 94 && spo2 >= 92) {
    plan.supportiveCare.push('Oxygen to maintain SpO₂ ≥ 94% — borderline saturations with respiratory distress');
  }

  // Auto-trigger admission for severe cases
  if (isSevere && !form.management.admission) {
    plan.supportiveCare.push('Admit to paediatric ward for monitoring and treatment');
  }
  if (isSevere && hasAlteredConsciousness) {
    plan.supportiveCare.push('Admit to HDU/ICU for close monitoring (altered consciousness)');
  }

  // Paracetamol with computed dose
  if (weightKg > 0) {
    plan.supportiveCare.push(`Paracetamol 15 mg/kg/dose (= ${Math.round(weightKg * 15)} mg) Q6H PRN fever`);
  } else {
    plan.supportiveCare.push(`Paracetamol 15 mg/kg/dose (= [enter weight to calculate] mg) Q6H PRN fever`);
  }

  // Auto-include standard investigations for moderate-severe disease
  if (isSevere && !plan.investigations.some(i => i.toLowerCase().includes('blood culture'))) {
    plan.investigations.push('Blood cultures x 2 (aerobic + anaerobic)');
  }
  if (isSevere && !plan.investigations.some(i => i.toLowerCase().includes('cbc') || i.toLowerCase().includes('full blood'))) {
    plan.investigations.push('Full blood count');
  }
  if (isSevere && !plan.investigations.some(i => i.toLowerCase().includes('crp'))) {
    plan.investigations.push('CRP');
  }
  if (isSevere && form.complaints.includes('fever') && !plan.investigations.some(i => i.toLowerCase().includes('malaria') || i.toLowerCase().includes('rdt'))) {
    plan.investigations.push('Malaria RDT or blood film (endemic area)');
  }
  if (isSevere && !plan.investigations.some(i => i.toLowerCase().includes('chest x-ray') || i.toLowerCase().includes('cxr'))) {
    plan.investigations.push('Chest X-ray PA');
  }
  // Altered consciousness auto-triggers RBS
  if ((isSevere || hasAlteredConsciousness) && !plan.investigations.some(i => i.toLowerCase().includes('glucose'))) {
    plan.investigations.push('Random blood sugar (bedside)');
  }

  plan.monitoring = hasRespDistress
    ? 'Continuous pulse oximetry, hourly respiratory rate and heart rate, conscious level monitoring, strict intake/output chart, daily weight'
    : 'SpO₂ 4-hourly, vitals 6-hourly, daily weight, fluid balance chart';

  plan.followUp = form.management.followUp || (hasRespDistress
    ? 'Review in 48-72 hours if improving. If discharged, review in outpatient clinic within 1 week.'
    : 'Review in outpatient clinic in 1 week.');

  const topId = primaryDx.disease.id || '';
  plan.safetyNetting = getSafetyNetting(topId, sevLevel, form);

  if (form.family.smokingExposure) plan.healthEducation += 'Eliminate passive smoke exposure — this is critical for recovery and preventing recurrence. ';
  if (form.family.tbHousehold) plan.healthEducation += 'Screen all household contacts for TB. The index case may be unidentified. ';
  if (form.pmh.hiv) plan.healthEducation += 'Ensure the child is on ART and co-trimoxazole prophylaxis. ';
  if (parseFloat(form.vitals.muac) < 12.5) plan.healthEducation += 'Refer for nutritional rehabilitation (SAM/MAM management per local protocol). ';

  return plan;
}

/**
 * Extracts investigation names from either the old flat array format
 * or the new structured format (Investigations with bedside/lab/imaging/advanced).
 */
function extractInvestigationNames(
  inv: any,
): string[] {
  if (!inv) return [];
  // New structured object format: { bedside: [...], laboratory: [...], ... }
  if (!Array.isArray(inv) && typeof inv === 'object') {
    const names: string[] = [];
    for (const tier of ['bedside', 'laboratory', 'lab', 'imaging', 'advanced'] as const) {
      const arr = inv[tier];
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (item && typeof item.name === 'string') names.push(item.name);
        }
      }
    }
    return names;
  }
  // Legacy array format: Investigation[] or InvestigationBedside[] etc.
  if (Array.isArray(inv)) {
    return inv.filter(i => i && typeof i.name === 'string').map(i => i.name);
  }
  return [];
}
