// ─── AMEXAN — Treatment / Management Rules ─────────────────────────────────
import { TreatmentRule, Severity, DiseaseId } from '@/src/types';

export const treatmentRules: TreatmentRule[] = [
  // ── PNEUMONIA ─────────────────────────────────────────────────────────────
  {
    diseaseId: 'pneumonia',
    severity: 'mild',
    interventions: [
      { name: 'Oral amoxicillin',     detail: '40–50 mg/kg/day in 3 divided doses × 5 days (first-line outpatient)' },
      { name: 'Oral azithromycin',    detail: '10 mg/kg/day × 1, then 5 mg/kg/day × 4 days (if atypical suspected)' },
      { name: 'Paracetamol',          detail: '15 mg/kg/dose 6-hourly PRN for fever/pain' },
      { name: 'Adequate hydration',   detail: 'Oral fluids encouraged; monitor feeding' },
      { name: 'Follow-up in 48 hrs',  detail: 'Return immediately if worsening, no improvement in 48 h, or new red flags' },
    ],
  },
  {
    diseaseId: 'pneumonia',
    severity: 'moderate',
    interventions: [
      { name: 'Admit to ward',        detail: 'Hospital admission indicated' },
      { name: 'Supplemental oxygen',  detail: 'Target SpO2 ≥ 94% via nasal cannula or face mask', condition: 'SpO2 < 94%' },
      { name: 'IV/IM benzylpenicillin', detail: '50,000 units/kg/dose 6-hourly (step down to oral when improving)' },
      { name: 'IV fluids',            detail: 'If unable to maintain oral intake — 0.9% NaCl or Hartmann\'s at maintenance' },
      { name: 'Paracetamol',          detail: '15 mg/kg/dose 6-hourly PRN' },
    ],
  },
  {
    diseaseId: 'pneumonia',
    severity: 'severe',
    interventions: [
      { name: 'PICU/HDU admission',   detail: 'Severe pneumonia requires high-dependency care' },
      { name: 'High-flow oxygen',     detail: 'High-flow nasal cannula or non-rebreather mask; target SpO2 ≥ 94%' },
      { name: 'IV ampicillin + gentamicin', detail: 'Ampicillin 50 mg/kg/dose 6-hrly + Gentamicin 7.5 mg/kg/day OD (neonates/young infants)' },
      { name: 'IV ceftriaxone',       detail: '80 mg/kg/day OD — if concern for resistant organisms or no response' },
      { name: 'IV fluids careful',    detail: 'Restrict to 2/3 maintenance if SIADH risk — monitor electrolytes' },
      { name: 'Blood culture BEFORE antibiotics', detail: 'Do not delay antibiotics for culture result' },
      { name: 'Senior review',        detail: 'Consultant to be informed immediately' },
    ],
  },

  // ── ASTHMA ────────────────────────────────────────────────────────────────
  {
    diseaseId: 'asthma',
    severity: 'mild',
    interventions: [
      { name: 'Salbutamol MDI + spacer', detail: '2–4 puffs (100mcg/puff) every 20 min × 3, then 2–4 puffs 4-hourly' },
      { name: 'Oral prednisolone',    detail: '1–2 mg/kg/day (max 40 mg) × 3–5 days if not improving on bronchodilator alone' },
      { name: 'Reassess in 1 hour',  detail: 'If not improving, escalate to moderate protocol' },
    ],
  },
  {
    diseaseId: 'asthma',
    severity: 'moderate',
    interventions: [
      { name: 'Admit to ward',        detail: 'Hospital admission for monitoring' },
      { name: 'Oxygen',               detail: 'Nasal cannula or face mask; target SpO2 ≥ 94%', condition: 'SpO2 < 94%' },
      { name: 'Salbutamol nebulisation', detail: '2.5 mg (< 20 kg) or 5 mg (≥ 20 kg) every 20–30 min initially' },
      { name: 'Ipratropium bromide',  detail: '250 mcg nebulised — add to first 3 salbutamol nebs in moderate attack' },
      { name: 'IV/oral prednisolone', detail: '1–2 mg/kg (max 40 mg) OD × 3–5 days' },
    ],
  },
  {
    diseaseId: 'asthma',
    severity: 'severe',
    interventions: [
      { name: 'PICU alert',           detail: 'Inform PICU early — silent chest or cyanosis = call immediately' },
      { name: 'High-flow oxygen',     detail: 'Non-rebreather mask 10–15 L/min' },
      { name: 'Continuous salbutamol nebulisation', detail: 'Continuous until improvement — monitor HR' },
      { name: 'IV magnesium sulphate', detail: '25–40 mg/kg (max 2g) IV over 20 min — single dose' },
      { name: 'IV salbutamol',        detail: '5 mcg/kg bolus over 5 min, then infusion — if nebulised route failing' },
      { name: 'IV hydrocortisone',    detail: '4 mg/kg 6-hourly if unable to take oral steroids' },
      { name: 'Avoid sedation',       detail: 'Never sedate a severe asthmatic unless intubating in controlled setting' },
    ],
  },

  // ── BRONCHIOLITIS ─────────────────────────────────────────────────────────
  {
    diseaseId: 'bronchiolitis',
    severity: 'mild',
    interventions: [
      { name: 'Supportive care only',  detail: 'Antibiotics, bronchodilators, and steroids are NOT indicated in bronchiolitis' },
      { name: 'Maintain hydration',    detail: 'Continue breastfeeding/oral feeds; small frequent feeds if tiring' },
      { name: 'Nasal saline drops',    detail: 'Can help clear secretions and improve feeding' },
      { name: 'Parental education',    detail: 'Return if SpO2 drops, feeding < 50% normal, worsening work of breathing, or apnoea' },
    ],
  },
  {
    diseaseId: 'bronchiolitis',
    severity: 'moderate',
    interventions: [
      { name: 'Admit for monitoring',  detail: 'Admit if SpO2 < 92%, poor feeding, or significant respiratory distress' },
      { name: 'Supplemental oxygen',   detail: 'Nasal cannula; target SpO2 ≥ 92%', condition: 'SpO2 < 92%' },
      { name: 'NG tube feeding',       detail: 'If oral intake < 50–75% of normal — safer than IV in most cases' },
      { name: 'Frequent reassessment', detail: 'Monitor RR, SpO2, work of breathing, feeding 2–4 hourly' },
    ],
  },
  {
    diseaseId: 'bronchiolitis',
    severity: 'severe',
    interventions: [
      { name: 'PICU/HDU',             detail: 'Apnoea, severe hypoxia, or exhaustion requires escalation' },
      { name: 'High-flow nasal cannula (HFNC)', detail: 'Start at 1–2 L/kg/min; escalate if no response — heated humidified' },
      { name: 'IV fluids',            detail: 'If unable to feed and NGT not appropriate — cautious rate (SIADH risk)' },
      { name: 'Caffeine citrate',     detail: 'For apnoea of prematurity in infants < 34 weeks corrected' },
    ],
  },

  // ── TUBERCULOSIS ──────────────────────────────────────────────────────────
  {
    diseaseId: 'tb',
    severity: 'all',
    interventions: [
      { name: 'HRZE intensive phase',  detail: 'Isoniazid + Rifampicin + Pyrazinamide + Ethambutol × 2 months' },
      { name: 'HR continuation phase', detail: 'Isoniazid + Rifampicin × 4 months (total 6 months standard therapy)' },
      { name: 'Pyridoxine (Vit B6)',   detail: '1 mg/kg/day — prevents isoniazid-related peripheral neuropathy' },
      { name: 'Contact tracing',       detail: 'All household contacts must be screened — notify public health' },
      { name: 'Nutritional support',   detail: 'Address malnutrition — TB and malnutrition co-exist frequently' },
      { name: 'HIV co-infection screen', detail: 'Start ART if HIV positive — coordinate with HIV team for timing' },
      { name: 'LFT monitoring',        detail: 'Baseline and monthly — hepatotoxicity from rifampicin/isoniazid' },
    ],
  },

  // ── CROUP ─────────────────────────────────────────────────────────────────
  {
    diseaseId: 'croup',
    severity: 'mild',
    interventions: [
      { name: 'Single dose oral dexamethasone', detail: '0.15 mg/kg oral (max 10 mg) — reduces oedema, shortens course' },
      { name: 'Reassure and calm child', detail: 'Agitation worsens stridor — calm environment, keep on parent\'s lap' },
      { name: 'Discharge with safety netting', detail: 'Return if stridor at rest, cyanosis, drooling, or not improving' },
    ],
  },
  {
    diseaseId: 'croup',
    severity: 'severe',
    interventions: [
      { name: 'Nebulised adrenaline',  detail: '0.5 ml/kg of 1:1000 (max 5 ml) — rapid effect, monitor for rebound' },
      { name: 'IV/IM dexamethasone',   detail: '0.6 mg/kg (max 10 mg) — if oral route not possible' },
      { name: 'Oxygen',               detail: 'Humidified oxygen if SpO2 dropping or severe distress' },
      { name: 'Airway alert',         detail: 'Senior airway doctor to be present — have RSI drugs and intubation kit ready' },
    ],
  },

  // ── URTI ─────────────────────────────────────────────────────────────────
  {
    diseaseId: 'urti',
    severity: 'all',
    interventions: [
      { name: 'Supportive care',       detail: 'Rest, hydration, age-appropriate analgesia/antipyretics' },
      { name: 'Paracetamol',          detail: '15 mg/kg/dose 6-hrly PRN — for fever and discomfort' },
      { name: 'No antibiotics',       detail: 'Viral URTI — antibiotics not indicated unless bacterial superinfection confirmed' },
      { name: 'Parental education',   detail: 'Duration 7–10 days typical; return if high fever > 5 days, ear pain, difficulty breathing' },
    ],
  },

  // ── PLEURAL EFFUSION ──────────────────────────────────────────────────────
  {
    diseaseId: 'pleural_effusion',
    severity: 'moderate',
    interventions: [
      { name: 'Treat underlying cause', detail: 'Antibiotics for parapneumonic; anti-TB therapy for TB effusion' },
      { name: 'Supplemental oxygen',   detail: 'For hypoxia secondary to effusion', condition: 'SpO2 < 94%' },
      { name: 'Diagnostic tap',        detail: 'Always send fluid for protein, LDH, glucose, culture, cytology, AFB' },
    ],
  },
  {
    diseaseId: 'pleural_effusion',
    severity: 'severe',
    interventions: [
      { name: 'Intercostal drain (ICD)', detail: 'For large effusion, tension, or compromised breathing — US-guided preferred' },
      { name: 'Thoracic surgery referral', detail: 'For loculated empyema — may need VATS decortication' },
      { name: 'IV antibiotics',        detail: 'Co-amoxiclav 30 mg/kg/dose 8-hrly ± metronidazole for empyema' },
    ],
  },
];

// ─── Helper: get management steps for a disease at a given severity ──────────
export function getTreatmentPlan(
  diseaseId: DiseaseId,
  severity: Severity
): { name: string; detail: string; condition?: string }[] {
  const severityOrder: Severity[] = ['mild', 'moderate', 'severe', 'critical'];
  const effectiveSeverity = severity === 'critical' ? 'severe' : severity;

  // Find 'all' rule first
  const allRule = treatmentRules.find(
    r => r.diseaseId === diseaseId && r.severity === 'all'
  );

  // Find specific severity rule
  const specificRule = treatmentRules.find(
    r => r.diseaseId === diseaseId && r.severity === effectiveSeverity
  );

  // Fall back up severity ladder if no exact match
  if (!specificRule) {
    for (let i = severityOrder.indexOf(effectiveSeverity); i >= 0; i--) {
      const fallback = treatmentRules.find(
        r => r.diseaseId === diseaseId && r.severity === severityOrder[i]
      );
      if (fallback) {
        return [
          ...(allRule?.interventions ?? []),
          ...fallback.interventions,
        ];
      }
    }
  }

  return [
    ...(allRule?.interventions ?? []),
    ...(specificRule?.interventions ?? []),
  ];
}