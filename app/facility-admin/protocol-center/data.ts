// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Protocol Center — Clinical Intelligence Engine Configuration Center
// Data model + seed intelligence for the facility administrator console.
// Protocols are living executable clinical intelligence, not PDFs.
// ═══════════════════════════════════════════════════════════════════════════════

export type ProtocolStatus = 'active' | 'draft' | 'review' | 'archived'

// ── Rich content blocks rendered by the center workspace ──────────────────────
export interface Block {
  t: 'p' | 'list' | 'table' | 'timeline' | 'bundle' | 'rule' | 'note' | 'warning' | 'quote'
  text?: string
  items?: string[]
  headers?: string[]
  rows?: string[][]
  title?: string
}

export interface ProtocolSection {
  id: string
  title: string
  blocks: Block[]
}

export interface ActivationTrigger {
  label: string
  when: string
  action: string
}

export interface LinkedAssets {
  orderSets: string[]
  careBundles: string[]
  drugs: string[]
  labRules: string[]
  dependencies: string[]
}

export interface OutcomeStats {
  uses: number
  compliance: number
  mortality: number
  deviations: number
  triggers: number
}

export interface Protocol {
  id: string
  name: string
  version: string
  status: ProtocolStatus
  lastReview: string
  nextReview: string
  sources: string[]
  departments: string[]
  category: string
  description: string
  activation: { text: string; triggers: ActivationTrigger[] }
  sections: ProtocolSection[]
  linked: LinkedAssets
  outcome: OutcomeStats
}

export interface AlgorithmNode {
  id: string
  question: string
  branches: { label: string; next: string | AlgorithmNode }[]
  leaf?: boolean
  result?: string
  level: number
}

export interface PathwayStep {
  label: string
  detail: string
  owner: string
  duration: string
  decision?: boolean
}

export interface CareBundle {
  id: string
  name: string
  owner: string
  compliance: number
  items: { label: string; done?: boolean }[]
  timed: boolean
  targetMinutes: number
}

export interface OrderSetGroup {
  group: string
  items: string[]
  auto?: boolean
}

export interface OrderSet {
  id: string
  name: string
  indication: string
  status: 'active' | 'draft' | 'archived'
  groups: OrderSetGroup[]
  version: string
}

export interface DrugEntry {
  id: string
  name: string
  class: string
  dose: string
  indications: string
  contraindications: string
  interactions: string
  pregnancy: string
  pediatric: string
  renal: string
  hepatic: string
  availability: 'available' | 'limited' | 'backorder'
  cost: string
}

export interface ReferenceRange {
  id: string
  test: string
  labs: { lab: string; value: string }[]
  criticalLow: string
  criticalHigh: string
  unit: string
  gender: string
}

export interface SopItem {
  id: string
  title: string
  dept: string
  version: string
  status: 'current' | 'review' | 'archived'
  owner: string
  steps: string[]
}

export interface AiRule {
  id: string
  name: string
  ifConditions: string[]
  operator: 'AND' | 'OR'
  trigger: string
  notify: string[]
  severity: 'info' | 'warning' | 'critical'
  active: boolean
  triggersCount: number
  engine: string
}

export interface EscalationStep {
  label: string
  action: string
  delay: string
  role: string
}

export interface MarketplacePack {
  id: string
  authority: string
  name: string
  description: string
  items: string[]
  installed: boolean
  featured?: boolean
}

export interface ProtocolVersion {
  version: string
  status: 'current' | 'archived' | 'draft'
  author: string
  date: string
  summary: string
  changes: string[]
  sections: { name: string; present: boolean }[]
}

export interface VersionedProtocol {
  id: string
  name: string
  versions: ProtocolVersion[]
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const OVERVIEW_STATS = [
  { label: 'Protocols', value: 318, color: '#0ea5e9' },
  { label: 'Clinical Pathways', value: 74, color: '#8b5cf6' },
  { label: 'Algorithms', value: 126, color: '#f59e0b' },
  { label: 'Care Bundles', value: 58, color: '#10b981' },
  { label: 'Order Sets', value: 231, color: '#ef4444' },
  { label: 'Drug Rules', value: 840, color: '#06b6d4' },
  { label: 'AI Rules', value: 2916, color: '#6366f1' },
  { label: 'Hospital SOPs', value: 187, color: '#f97316' },
]

export const RECENT_UPDATES = [
  { id: 'ru1', title: 'New Sepsis Bundle', detail: 'Sepsis Six v4.1 published to Emergency, Medicine & ICU', when: '2h ago', ok: true },
  { id: 'ru2', title: 'WHO PPH Protocol', detail: 'Postpartum Haemorrhage protocol imported from WHO / MOH Kenya', when: '5h ago', ok: true },
  { id: 'ru3', title: 'Updated ACLS 2026', detail: 'Cardiac arrest algorithm synced to AHA ACLS 2026', when: 'Yesterday', ok: true },
  { id: 'ru4', title: 'New Antibiotic Stewardship Rules', detail: '18 new microbiology AI rules deployed hospital-wide', when: 'Yesterday', ok: true },
  { id: 'ru5', title: 'Updated DKA Protocol', detail: 'Fluid & insulin order set regenerated v2.3', when: '2 days ago', ok: true },
]

export const AI_RECOMMENDATIONS = [
  { id: 'rec1', dept: 'Medicine Department', text: 'Using outdated stroke protocol (v2.0). AMEXAN has v4.1 with updated thrombolysis window.', severity: 'critical' as const },
  { id: 'rec2', dept: 'Emergency', text: 'No pediatric trauma algorithm installed. 14 trauma activations this month triggered no algorithm.', severity: 'warning' as const },
  { id: 'rec3', dept: 'ICU', text: 'Missing ventilator weaning bundle. Average ventilation days exceed target by 1.8x.', severity: 'warning' as const },
]

// ── Protocol Library ──────────────────────────────────────────────────────────
const baseSepsisSections: ProtocolSection[] = [
  {
    id: 'overview', title: 'Overview',
    blocks: [
      { t: 'p', text: 'Adult Sepsis (v4.1) — Surviving Sepsis Campaign aligned, WHO-adapted for resource-limited settings. Sepsis is life-threatening organ dysfunction caused by a dysregulated host response to infection. AMEXAN activates this protocol automatically when systemic inflammatory response + organ dysfunction criteria are met.' },
      { t: 'table', title: 'Quick Reference', headers: ['Domain', 'Value'], rows: [['Suspicion trigger', 'Lactate ≥ 2 mmol/L OR SBP < 90 mmHg'], ['Time zero', 'First hypotension / lactate draw'], ['Target door-to-antibiotics', '≤ 60 minutes'], ['Target lactate clearance', '≥ 20% in 6 hours'], ['First fluid bolus', '30 mL/kg crystalloid']] },
    ],
  },
  {
    id: 'recognition', title: 'Recognition',
    blocks: [
      { t: 'p', text: 'Recognize sepsis early using the qSOFA screen at triage: altered mentation (GCS < 15), SBP ≤ 100 mmHg, respiratory rate ≥ 22/min. Two or more qSOFA points → screen for organ dysfunction and lactate.' },
      { t: 'list', title: 'Recognition cues', items: ['Temperature > 38.3°C or < 36°C', 'Heart rate > 90/min', 'Respiratory rate > 22/min', 'Altered consciousness', 'New organ dysfunction (oliguria, hypoxaemia, coagulopathy, thrombocytopenia, hyperbilirubinaemia)', 'Capillary refill > 3 s', 'Lactate > 2 mmol/L'] },
    ],
  },
  {
    id: 'diagnostic', title: 'Diagnostic Criteria',
    blocks: [
      { t: 'note', text: 'SEPSIS-3: suspected or confirmed infection PLUS a rise in SOFA score ≥ 2. Septic shock = sepsis with vasopressor requirement to maintain MAP ≥ 65 mmHg AND lactate > 2 mmol/L despite adequate fluid resuscitation.' },
      { t: 'table', title: 'SOFA (simplified for the ward)', headers: ['System', '1 point', '2 points'], rows: [['Respiratory', 'PaO2/FiO2 < 400', 'PaO2/FiO2 < 300'], ['Coagulation', 'Platelets < 150', 'Platelets < 100'], ['Liver', 'Bilirubin 1.2–1.9', 'Bilirubin 2.0–5.9'], ['Cardiovascular', 'MAP < 70', 'Dopamine ≤ 5'], ['Renal', 'Creatinine 1.2–1.9', 'Creatinine 2.0–3.4']] },
    ],
  },
  {
    id: 'risk-factors', title: 'Risk Factors',
    blocks: [
      { t: 'list', items: ['Age ≥ 65 years', 'Immunosuppression (HIV, cancer, steroids, chemotherapy)', 'Diabetes mellitus', 'Chronic kidney / liver disease', 'Indwelling devices (lines, catheters)', 'Prolonged hospital stay', 'Recent surgery', 'Malnutrition', 'Pregnancy / postpartum'] },
    ],
  },
  {
    id: 'red-flags', title: 'Red Flags',
    blocks: [
      { t: 'warning', text: 'Any ONE red flag → activate Sepsis Six immediately, do not wait for all criteria.' },
      { t: 'list', items: ['SBP < 90 mmHg or MAP < 65 mmHg', 'Lactate ≥ 4 mmol/L', 'SpO₂ < 90% on room air', 'Respiratory rate > 30/min', 'Unresponsive or new confusion', 'Purpura / non-blanching rash', 'Not passing urine in 12 h'] },
    ],
  },
  {
    id: 'investigations', title: 'Investigations',
    blocks: [
      { t: 'table', title: 'Initial workup (auto-ordered)', headers: ['Test', 'Priority', 'Notes'], rows: [['Lactate', 'STAT', 'Repeat at 6 h for clearance'], ['Blood cultures ×2', 'STAT', 'BEFORE antibiotics'], ['Full blood count', 'STAT', 'Platelets, WBC'], ['Urea & electrolytes', 'STAT', 'Creatinine, K+'], ['Glucose', 'STAT', 'Exclude hypoglycaemia'], ['Chest X-ray', 'Urgent', 'Focus of infection'], ['Urinalysis', 'Routine', 'UTI source'], ['LFTs + coag', 'Urgent', 'Organ dysfunction screen']] },
      { t: 'list', title: 'Source-directed by clinical suspicion', items: ['Sputum culture — pneumonia source', 'CSF analysis — meningitis source', 'Abdominal imaging — intra-abdominal source', 'Wound cultures — skin/soft tissue source'] },
    ],
  },
  {
    id: 'treatment', title: 'Treatment',
    blocks: [
      { t: 'bundle', title: 'Sepsis Six Bundle', items: ['Oxygen', 'Blood Cultures', 'Antibiotics', 'Fluids', 'Lactate', 'Urine Output'] },
      { t: 'table', title: 'Empiric antimicrobials (adult)', headers: ['Setting', 'Regimen'], rows: [['Community-acquired (no focus)', 'IV Ceftriaxone 2 g daily'], ['HAP / recent antibiotics', 'IV Piperacillin–tazobactam 4.5 g Q6H'], ['Suspected MRSA', 'Add IV Vancomycin 15–20 mg/kg'], ['Immunocompromised', 'Broad-spectrum per microbiology'], ['Meningitis suspicion', 'IV Ceftriaxone + Ampicillin + Acyclovir']] },
      { t: 'list', title: 'Resuscitation principles', items: ['Give 30 mL/kg crystalloid over 30 min for hypotension or lactate ≥ 4', 'Re-assess dynamically: lactate, urine output, capillary refill', 'Vasopressors (noradrenaline) when MAP < 65 despite fluids', 'Norepinephrine via central line; may start peripheral if central delayed', 'Target MAP ≥ 65 mmHg'] },
    ],
  },
  {
    id: 'escalation', title: 'Escalation',
    blocks: [
      { t: 'rule', text: 'Escalate to ICU when MAP < 65 mmHg after 30 mL/kg fluids OR lactate remains ≥ 4 mmol/L OR any red flag persists after 1 hour of treatment.' },
      { t: 'timeline', title: 'Escalation path', items: ['00:00 — Sepsis Six activated, admitting team notified', '00:15 — No response / deterioration → Consultant notified', '00:30 — Persistent shock → ICU bed request (STAT)', '00:60 — Medical Director dashboard flag for sepsis review'] },
    ],
  },
  {
    id: 'monitoring', title: 'Monitoring',
    blocks: [
      { t: 'table', title: 'Monitoring orders', headers: ['Parameter', 'Frequency', 'Target'], rows: [['Vitals (BP, HR, RR, SpO₂, Temp)', 'Every 15 min ×1h, then Q1H', 'MAP ≥ 65'], ['Lactate', 'Q6H', 'Clearance ≥ 20%'], ['Urine output', 'Hourly', '≥ 0.5 mL/kg/h'], ['GCS / consciousness', 'Q1H', 'No deterioration'], ['Fluid balance', 'Q4H', 'Trending positive'], ['SpO₂ / oxygen', 'Continuous', '≥ 94%']] },
      { t: 'list', items: ['Document Sepsis Six completion time in the bundle timer', 'Re-screen for organ dysfunction at 6, 12 and 24 h'] },
    ],
  },
  {
    id: 'discharge', title: 'Discharge',
    blocks: [
      { t: 'p', text: 'Step-down from ICU when MAP stable ≥ 65 mmHg off vasopressors for 24 h, lactate normalized, and no organ support required. Ward handover must include antibiotic stop date and culture follow-up.' },
    ],
  },
  {
    id: 'follow-up', title: 'Follow-up',
    blocks: [
      { t: 'list', items: ['Reconcile antimicrobial course — review daily for narrowing/de-escalation', 'Culture results follow-through within 48 h', 'Vaccination review (pneumococcal, influenza) at recovery', 'Cognitive screen at 90 days — post-sepsis syndrome', 'ICU follow-up clinic referral where available'] },
    ],
  },
  {
    id: 'references', title: 'References',
    blocks: [
      { t: 'list', items: ['Surviving Sepsis Campaign: International Guidelines 2024/2025', 'WHO: Sepsis Technical Expert Consultation', 'MOH Kenya: Clinical Management Guidelines', 'Sepsis-3 Definition Consensus 2016', 'AMEXAN Enhanced — local adaptations validated by hospital council'] },
    ],
  },
]

const baseDkaSections: ProtocolSection[] = [
  { id: 'overview', title: 'Overview', blocks: [{ t: 'p', text: 'Diabetic Ketoacidosis (v2.3) — hyperglycaemic emergency with ketonaemia and metabolic acidosis. AMEXAN auto-activates on glucose > 14 mmol/L with ketones present and pH < 7.3.' }, { t: 'table', headers: ['Domain', 'Value'], rows: [['Diagnosis', 'Glucose > 13.9, pH < 7.3, HCO3 < 15, ketonaemia'], ['First-line', 'IV fluids + fixed-rate insulin'], ['Target glucose fall', '3–6 mmol/L/hour'], ['Resolution', 'pH > 7.3, HCO3 ≥ 18, ketones clear']] }] },
  { id: 'recognition', title: 'Recognition', blocks: [{ t: 'list', items: ['Polyuria / polydipsia', 'Nausea, vomiting, abdominal pain', 'Kussmaul breathing', 'Fruity breath', 'Dehydration, shock'] }] },
]

const baseStrokeSections: ProtocolSection[] = [
  { id: 'overview', title: 'Overview', blocks: [{ t: 'p', text: 'Acute Ischaemic Stroke (v4.1) — time-critical reperfusion protocol aligned to AHA 2026. Door-to-needle target 45 minutes.' }, { t: 'table', headers: ['Domain', 'Value'], rows: [['Time window', 'Within 4.5 h for thrombolysis'], ['Door-to-CT', '≤ 20 minutes'], ['Door-to-needle', '≤ 45 minutes'], ['Imaging', 'Non-contrast CT + CT angiography']] }] },
  { id: 'recognition', title: 'Recognition', blocks: [{ t: 'warning', text: 'FAST screen positive → activate stroke algorithm immediately.' }, { t: 'list', items: ['Facial droop', 'Arm weakness', 'Speech disturbance', 'Time of onset (crucial)'] }] },
]

export const PROTOCOLS: Protocol[] = [
  {
    id: 'adult-sepsis', name: 'Adult Sepsis', version: '4.1', status: 'active',
    lastReview: '15 Jul 2026', nextReview: '15 Jul 2027',
    sources: ['MOH Kenya', 'Surviving Sepsis Campaign', 'WHO', 'AMEXAN Enhanced'],
    departments: ['Emergency', 'Medicine', 'ICU'], category: 'Protocol',
    description: 'End-to-end sepsis recognition, Sepsis Six resuscitation bundle, antimicrobial stewardship and escalation.',
    activation: {
      text: 'Activates when Lactate ≥ 4 mmol/L OR SBP < 90 mmHg OR qSOFA ≥ 2 with suspected infection.',
      triggers: [
        { label: 'Lactate ≥ 4', when: 'Lactate result arrives > 4 mmol/L', action: 'Sepsis Six bundle activated, ICU/Consultant alerted' },
        { label: 'SBP < 90', when: 'Systolic BP drops below 90 mmHg', action: 'Fluid bolus + vasopressor readiness' },
        { label: 'qSOFA ≥ 2', when: 'Triage screen scores 2+', action: 'Stat sepsis workup + antibiotics' },
      ],
    },
    sections: baseSepsisSections,
    linked: {
      orderSets: ['Sepsis Admission Pack', 'Severe Sepsis ICU Pack'],
      careBundles: ['Sepsis Six', 'Ventilator Bundle'],
      drugs: ['Ceftriaxone', 'Piperacillin–tazobactam', 'Vancomycin', 'Noradrenaline', '0.9% Sodium Chloride'],
      labRules: ['Lactate critical high', 'Blood culture collection rule', 'C-reactive protein trending'],
      dependencies: ['Surviving Sepsis Campaign v2025', 'MOH Kenya Sepsis Guideline', 'Reference Ranges v12'],
    },
    outcome: { uses: 1284, compliance: 86, mortality: 21, deviations: 44, triggers: 3910 },
  },
  {
    id: 'septic-shock', name: 'Septic Shock', version: '3.7', status: 'active',
    lastReview: '02 Jun 2026', nextReview: '02 Jun 2027',
    sources: ['Surviving Sepsis Campaign', 'WHO', 'AMEXAN Enhanced'],
    departments: ['ICU', 'Emergency', 'Medicine'], category: 'Protocol',
    description: 'Vasopressor-first haemodynamic management for sepsis with persistent hypotension and lactate > 2.',
    activation: {
      text: 'Activates when MAP < 65 mmHg persists after 30 mL/kg fluids with lactate > 2 mmol/L.',
      triggers: [{ label: 'Persistent hypotension', when: 'MAP < 65 after fluid', action: 'Noradrenaline start, central line, ICU bed' }],
    },
    sections: [
      { id: 'overview', title: 'Overview', blocks: [{ t: 'p', text: 'Septic shock requires prompt vasopressors, dynamic fluid assessment and source control. Target MAP ≥ 65 mmHg.' }, { t: 'table', headers: ['Vasopressor', 'Starting dose', 'Notes'], rows: [['Noradrenaline', '0.05–0.1 µg/kg/min', 'First line'], ['Vasopressin', '0.03 units/min', 'Add-on for refractory shock'], ['Adrenaline', '0.05–0.1 µg/kg/min', 'Alternative when cardiac output low']] }] },
      { id: 'escalation', title: 'Escalation', blocks: [{ t: 'rule', text: 'Refractory shock → hydrocortisone 50 mg IV Q6H after 4+ hours of vasopressor dependence. Escalate to critical care outreach.' }] },
    ],
    linked: { orderSets: ['Severe Sepsis ICU Pack'], careBundles: ['Sepsis Six'], drugs: ['Noradrenaline', 'Vasopressin', 'Hydrocortisone'], labRules: ['Lactate critical high'], dependencies: ['Adult Sepsis v4.1'] },
    outcome: { uses: 512, compliance: 74, mortality: 32, deviations: 61, triggers: 1480 },
  },
  {
    id: 'dka', name: 'Diabetic Ketoacidosis', version: '2.3', status: 'active',
    lastReview: '21 Apr 2026', nextReview: '21 Apr 2027',
    sources: ['MOH Kenya', 'ADA', 'AMEXAN Enhanced'],
    departments: ['Emergency', 'Medicine', 'Endocrinology'], category: 'Protocol',
    description: 'Structured DKA pathway — fluid resuscitation, fixed-rate insulin, potassium replacement and resolution criteria.',
    activation: {
      text: 'Activates when glucose > 14 mmol/L with ketones ≥ 3+ and acidosis.',
      triggers: [{ label: 'DKA criteria met', when: 'Glucose + ketones + pH', action: 'DKA order set fires, endocrinology notified' }],
    },
    sections: baseDkaSections,
    linked: { orderSets: ['DKA Admission Pack'], careBundles: ['Hypoglycaemia Prevention'], drugs: ['IV Insulin', '0.9% Sodium Chloride', 'Potassium chloride', '0.45% Sodium Chloride'], labRules: ['Potassium critical', 'Glucose trending'], dependencies: ['Diabetes Clinical Pathway v2'] },
    outcome: { uses: 402, compliance: 91, mortality: 3, deviations: 18, triggers: 744 },
  },
  {
    id: 'stroke', name: 'Acute Stroke', version: '4.1', status: 'review',
    lastReview: '30 Mar 2026', nextReview: '30 Mar 2027',
    sources: ['AHA 2026', 'MOH Kenya', 'AMEXAN Enhanced'],
    departments: ['Emergency', 'Neurology', 'Radiology'], category: 'Protocol',
    description: 'Time-critical reperfusion pathway — FAST, CT triage, thrombolysis and thrombectomy decision support.',
    activation: {
      text: 'Activates on positive FAST screen at triage.',
      triggers: [{ label: 'FAST positive', when: 'Facial/Arm/Speech deficit', action: 'Stroke algorithm runs, CT team alerted' }],
    },
    sections: baseStrokeSections,
    linked: { orderSets: ['Acute Stroke Admission Pack'], careBundles: ['Stroke Bundle'], drugs: ['Alteplase', 'Aspirin', 'Tenesclipase'], labRules: ['INR rapid', 'Glucose'], dependencies: ['AHA Stroke Guidelines 2026'] },
    outcome: { uses: 366, compliance: 62, mortality: 18, deviations: 52, triggers: 612 },
  },
  {
    id: 'acs', name: 'Acute Coronary Syndrome', version: '3.4', status: 'active',
    lastReview: '10 May 2026', nextReview: '10 May 2027',
    sources: ['ESC 2025', 'AHA', 'AMEXAN Enhanced'],
    departments: ['Emergency', 'Cardiology', 'ICU'], category: 'Protocol',
    description: 'Chest pain triage through ECG, troponin, risk scoring to catheter-lab or medical management.',
    activation: { text: 'Activates on chest pain with ischaemic ECG changes or elevated high-sensitivity troponin.', triggers: [{ label: 'STEMI', when: 'ST elevation', action: 'Cath lab activation, aspirin + P2Y12 load' }] },
    sections: [
      { id: 'overview', title: 'Overview', blocks: [{ t: 'p', text: 'Rapid identification of STEMI vs NSTEMI vs unstable angina. Door-to-balloon target ≤ 90 minutes for STEMI.' }] },
      { id: 'treatment', title: 'Treatment', blocks: [{ t: 'table', headers: ['Presentation', 'Action'], rows: [['STEMI', 'Primary PCI ≤ 90 min, or fibrinolysis if PCI > 120 min'], ['NSTEMI', 'Risk-stratify; early invasive strategy'], ['Unstable angina', 'Medical therapy + observation']] }] },
    ],
    linked: { orderSets: ['ACS Admission Pack'], careBundles: ['Heart Failure Bundle'], drugs: ['Aspirin', 'Ticagrelor', 'Heparin', 'Atorvastatin'], labRules: ['Troponin high-sensitivity', 'BNP trending'], dependencies: ['ESC ACS Guidelines 2025'] },
    outcome: { uses: 640, compliance: 78, mortality: 11, deviations: 39, triggers: 1304 },
  },
  {
    id: 'pph', name: 'Postpartum Haemorrhage', version: '2.1', status: 'active',
    lastReview: '08 Jun 2026', nextReview: '08 Jun 2027',
    sources: ['WHO', 'MOH Kenya', 'RCOG', 'AMEXAN Enhanced'],
    departments: ['Obstetrics', 'Maternal & Child', 'Theatre'], category: 'Protocol',
    description: 'WHO PPH response — massive transfusion activation, uterine massage, uterotonics and surgical escalation.',
    activation: { text: 'Activates on estimated blood loss ≥ 500 mL vaginal / ≥ 1000 mL caesarean with signs of shock.', triggers: [{ label: 'PPH threshold', when: 'Blood loss + instability', action: 'PPH pack, theatre notified, blood bank alerted' }] },
    sections: [
      { id: 'overview', title: 'Overview', blocks: [{ t: 'p', text: 'PPH remains a leading cause of maternal death. Seconds matter. This protocol orchestrates the entire team response.' }] },
      { id: 'treatment', title: 'Treatment', blocks: [{ t: 'list', items: ['Uterine massage + assess tone', 'IV/IM Oxytocin 10 IU first-line', 'Tranexamic acid 1 g IV within 3 hours of birth', 'Methylergometrine / carboprost if available', 'Bimanual compression', 'Surgical: uterine compression sutures, hysterectomy'] }] },
    ],
    linked: { orderSets: ['PPH Massive Transfusion Pack'], careBundles: ['Maternal Early Warning'], drugs: ['Oxytocin', 'Tranexamic acid', 'Methylergometrine', 'Carboprost'], labRules: ['Cross-match urgent', 'Fibrinogen'], dependencies: ['WHO PPH Guideline'] },
    outcome: { uses: 178, compliance: 88, mortality: 6, deviations: 21, triggers: 328 },
  },
  {
    id: 'malaria', name: 'Severe Malaria', version: '5.0', status: 'active',
    lastReview: '12 Feb 2026', nextReview: '12 Feb 2027',
    sources: ['WHO', 'MOH Kenya'],
    departments: ['Medicine', 'Pediatrics', 'Emergency'], category: 'Protocol',
    description: 'Severe falciparum malaria — IV artesunate, organ support and follow-through cure.',
    activation: { text: 'Activates on positive RDT/microscopy with any severity feature.', triggers: [{ label: 'Severity feature', when: 'Confirmed malaria + organ dysfunction', action: 'IV artesunate started, HDU admission' }] },
    sections: [
      { id: 'overview', title: 'Overview', blocks: [{ t: 'p', text: 'IV artesunate for all severe disease. Parasite count and organ function drive monitoring.' }] },
      { id: 'treatment', title: 'Treatment', blocks: [{ t: 'table', headers: ['Drug', 'Dose'], rows: [['IV Artesunate', '2.4 mg/kg at 0, 12, 24 h then daily'], ['Then oral ACT', 'Complete course once tolerating']] }] },
    ],
    linked: { orderSets: ['Severe Malaria Admission Pack'], careBundles: ['Severe Malaria Care'], drugs: ['Artesunate', 'Artemether–lumefantrine', 'Paracetamol'], labRules: ['Parasite count', 'Glucose'], dependencies: ['WHO Malaria Guidelines'] },
    outcome: { uses: 920, compliance: 83, mortality: 8, deviations: 33, triggers: 1902 },
  },
  {
    id: 'dka-extra', name: 'Acute Kidney Injury', version: '1.9', status: 'draft',
    lastReview: '—', nextReview: '—',
    sources: ['KDIGO', 'AMEXAN Enhanced'],
    departments: ['Medicine', 'ICU', 'Nephrology'], category: 'Protocol',
    description: 'KDIGO-aligned AKI detection, staged response and renal replacement triggers.',
    activation: { text: 'Activates on creatinine rise ≥ 1.5x baseline or urine output < 0.5 mL/kg/h ×6 h.', triggers: [{ label: 'KDIGO stage 1', when: 'Creatinine or UO criteria', action: 'Review volume status, stop nephrotoxins' }] },
    sections: [{ id: 'overview', title: 'Overview', blocks: [{ t: 'p', text: 'Prevent, detect, treat. Nephrotoxin stewardship and RRT trigger rules are embedded.' }] }],
    linked: { orderSets: ['AKI Monitoring Pack'], careBundles: [], drugs: ['0.9% Sodium Chloride'], labRules: ['Creatinine trending', 'Potassium critical'], dependencies: ['KDIGO 2024'] },
    outcome: { uses: 254, compliance: 0, mortality: 0, deviations: 0, triggers: 406 },
  },
]

export const PROTOCOL_NAMES = [
  'Sepsis', 'Septic Shock', 'DKA', 'Stroke', 'ACS', 'Hypertension', 'Asthma', 'COPD',
  'Trauma', 'Burns', 'PPH', 'Eclampsia', 'Neonatal Sepsis', 'Malaria', 'TB', 'HIV',
  'AKI', 'Heart Failure', 'Shock', 'Pneumonia', 'Meningitis', 'Typhoid', 'Dengue',
  'Appendicitis', 'Cholera', 'Rabies', 'Tetanus', 'Snake Bite', 'Fracture', 'C-section',
  'Pre-eclampsia', 'Postnatal Sepsis', 'Sickle Cell Crisis', 'Status Epilepticus', 'Anaphylaxis',
  'UGI Bleed', 'Pancreatitis', 'Hyperthyroid Crisis', 'Addisonian Crisis', 'Meningococcal Sepsis',
]

export const PROTOCOL_STATUS_POOL: ProtocolStatus[] = ['active', 'active', 'active', 'active', 'review', 'draft']

// ── Algorithms (decision trees) ───────────────────────────────────────────────
export interface DecisionTree {
  id: string
  name: string
  dept: string
  version: string
  updated: string
  steps: { q: string; branches: { label: string; next?: string; result?: string }[]; result?: string }[]
}

export const DECISION_TREES: DecisionTree[] = [
  {
    id: 'stroke-algo', name: 'Suspected Stroke', dept: 'Emergency', version: '4.1', updated: '01 Jun 2026',
    steps: [
      { q: 'FAST screen positive at triage?', branches: [{ label: 'YES', next: 'CT available?' }, { label: 'NO', next: 'Observe — not a stroke trigger' }] },
      { q: 'CT available?', branches: [{ label: 'YES', next: 'Haemorrhage on CT?' }, { label: 'NO', next: 'Transfer to stroke centre' }] },
      { q: 'Haemorrhage on CT?', branches: [{ label: 'YES', result: 'ICH pathway — BP control, neurosurgery consult' }, { label: 'NO', next: 'Thrombolysis candidate?' }] },
      { q: 'Thrombolysis candidate?', branches: [{ label: 'YES', result: 'Alteplase within 4.5 h — door-to-needle ≤ 45 min' }, { label: 'NO', result: 'Medical management + thrombectomy screen' }] },
      { q: 'Transfer to stroke centre', branches: [{ label: 'Continue', result: 'Reperfusion support en route' }] },
    ],
  },
  {
    id: 'chest-algo', name: 'Acute Chest Pain', dept: 'Emergency', version: '3.2', updated: '18 Apr 2026',
    steps: [
      { q: 'Haemodynamically stable?', branches: [{ label: 'NO', result: 'Resuscitate + immediate ECG' }, { label: 'YES', next: 'ECG within 10 minutes' }] },
      { q: 'ST elevation present?', branches: [{ label: 'YES', result: 'STEMI — activate cath lab' }, { label: 'NO', next: 'High-sensitivity troponin' }] },
      { q: 'Troponin elevated / dynamic?', branches: [{ label: 'YES', result: 'NSTEMI — early invasive strategy' }, { label: 'NO', result: 'Risk score (HEART/GRACE) → discharge or observe' }] },
    ],
  },
  {
    id: 'dka-algo', name: 'DKA vs HHS', dept: 'Emergency', version: '2.0', updated: '22 May 2026',
    steps: [
      { q: 'Glucose + ketones + pH', branches: [{ label: 'pH < 7.3 + ketones', result: 'DKA pathway — fluids + fixed-rate insulin' }, { label: 'pH normal + high glucose', result: 'HHS pathway — aggressive rehydration' }] },
    ],
  },
  {
    id: 'sepsis-algo', name: 'Sepsis Screening', dept: 'Triage', version: '5.1', updated: '09 Jul 2026',
    steps: [
      { q: 'qSOFA ≥ 2 at triage?', branches: [{ label: 'YES', next: 'Lactate result' }, { label: 'NO', next: 'Standard triage — re-screen in 1 h' }] },
      { q: 'Lactate ≥ 4 mmol/L?', branches: [{ label: 'YES', result: 'SEPSIS SIX ACTIVATED — ICU/consultant alerted' }, { label: 'NO', result: 'Sepsis workup + antibiotics ≤ 1 h' }] },
    ],
  },
  {
    id: 'trauma-algo', name: 'Major Trauma', dept: 'Emergency', version: '6.0', updated: '03 Feb 2026',
    steps: [
      { q: 'Mechanism + physiology abnormal?', branches: [{ label: 'YES', result: 'Trauma team activation, C-collar, massive transfusion readiness' }, { label: 'NO', result: 'Focused secondary survey' }] },
    ],
  },
]

// ── Clinical Pathways ─────────────────────────────────────────────────────────
export interface Pathway {
  id: string
  name: string
  owner: string
  version: string
  steps: PathwayStep[]
  status: 'active' | 'draft' | 'archived'
  patients: number
}

export const PATHWAYS: Pathway[] = [
  {
    id: 'chest-pain-path', name: 'Chest Pain Clinical Pathway', owner: 'Cardiology', version: '3.4', status: 'active', patients: 862,
    steps: [
      { label: 'Triage', detail: 'Vitals, pain scoring, ECG within 10 min', owner: 'Nurse Triage', duration: '0–10 min' },
      { label: 'ECG', detail: '12-lead, physician reviewed immediately', owner: 'Emergency', duration: '≤ 10 min' },
      { label: 'Troponin', detail: 'High-sensitivity at 0 h and 3 h', owner: 'Laboratory', duration: '≤ 60 min' },
      { label: 'Risk Score', detail: 'HEART / GRACE calculation', owner: 'Clinician', duration: 'During workup' },
      { label: 'Admission?', detail: 'High risk → admit to observation/cardiology', owner: 'Clinician', duration: 'Decision point', decision: true },
      { label: 'Cath Lab?', detail: 'STEMI / high-risk NSTEMI → PCI', owner: 'Cardiology', duration: '≤ 90 min', decision: true },
      { label: 'Discharge?', detail: 'Low risk → stress test / home with follow-up', owner: 'Clinician', duration: '6–12 h' },
    ],
  },
  {
    id: 'sepsis-path', name: 'Sepsis Inpatient Pathway', owner: 'Medicine', version: '4.1', status: 'active', patients: 1284,
    steps: [
      { label: 'Activation', detail: 'Sepsis Six triggered from vitals/labs', owner: 'AMEXAN Engine', duration: 'Automatic' },
      { label: 'Resuscitation', detail: 'Oxygen, cultures, antibiotics, fluids, lactate, urine output', owner: 'Nursing + Medical', duration: '≤ 1 h' },
      { label: 'ICU / Ward decision', detail: 'MAP < 65 → ICU; else ward', owner: 'Consultant', duration: '1 h', decision: true },
      { label: 'Monitoring', detail: 'Lactate clearance, vitals, organ support', owner: 'Nursing', duration: '6–24 h' },
      { label: 'De-escalation', detail: 'Culture-directed antimicrobial narrowing', owner: 'Pharmacy + ID', duration: '48–72 h' },
      { label: 'Outcome tracking', detail: 'Survival, LOS, readmission', owner: 'Quality', duration: '30 days' },
    ],
  },
  {
    id: 'maternal-path', name: 'Labour & Delivery Pathway', owner: 'Maternal & Child', version: '2.0', status: 'active', patients: 645,
    steps: [
      { label: 'Admission', detail: 'CTG, partograph start', owner: 'Midwife', duration: '0 min' },
      { label: 'Active labour', detail: 'Partograph monitoring Q4H', owner: 'Midwife', duration: 'Progress' },
      { label: 'Delivery', detail: 'PPH prophylaxis, skin-to-skin', owner: 'Obstetrics', duration: 'At birth' },
      { label: 'Postpartum', detail: 'PPH watch, sepsis screen', owner: 'Midwife', duration: '0–24 h', decision: true },
      { label: 'Discharge', detail: 'Newborn screening, follow-up booking', owner: 'Midwife', duration: '24–48 h' },
    ],
  },
  {
    id: 'postop-path', name: 'Post-Operative Recovery Pathway', owner: 'Theatre', version: '1.8', status: 'active', patients: 903,
    steps: [
      { label: 'PACU', detail: 'Airway, vitals, pain, bleeding watch', owner: 'PACU Nurse', duration: '1–2 h' },
      { label: 'Ward transfer', detail: 'Handover + enhanced recovery starts', owner: 'Nursing', duration: '2–4 h' },
      { label: 'Mobilisation', detail: 'Early mobilisation, thromboprophylaxis', owner: 'Physiotherapy', duration: 'Day 0–1' },
      { label: 'Wound review', detail: 'SSI surveillance daily', owner: 'Surgical team', duration: 'Daily' },
      { label: 'Discharge', detail: 'Safety criteria + follow-up', owner: 'Surgical team', duration: 'Day 1–4', decision: true },
    ],
  },
]

// ── Care Bundles ──────────────────────────────────────────────────────────────
export const CARE_BUNDLES: CareBundle[] = [
  { id: 'sepsis-six', name: 'Sepsis Six', owner: 'Emergency / Medicine', compliance: 86, timed: true, targetMinutes: 60,
    items: [{ label: 'Oxygen', done: false }, { label: 'Blood Cultures', done: true }, { label: 'Antibiotics', done: true }, { label: 'Fluids', done: false }, { label: 'Lactate', done: false }, { label: 'Urine Output', done: false }] },
  { id: 'vent', name: 'Ventilator Bundle', owner: 'ICU', compliance: 64, timed: false, targetMinutes: 0,
    items: [{ label: 'Head of bed 30–45°' }, { label: 'Daily sedation holiday' }, { label: 'Peptic ulcer prophylaxis' }, { label: 'DVT prophylaxis' }, { label: 'Oral care Q4H' }] },
  { id: 'clabsi', name: 'CLABSI Bundle', owner: 'ICU / Oncology', compliance: 81, timed: false, targetMinutes: 0,
    items: [{ label: 'Hand hygiene' }, { label: 'Max barrier precautions' }, { label: 'Chlorhexidine skin prep' }, { label: 'Daily line necessity review' }] },
  { id: 'cauti', name: 'CAUTI Bundle', owner: 'Nursing', compliance: 79, timed: false, targetMinutes: 0,
    items: [{ label: 'Catheter necessity review' }, { label: 'Aseptic insertion' }, { label: 'Closed drainage' }, { label: 'Daily perineal care' }] },
  { id: 'ssi', name: 'SSI Bundle', owner: 'Theatre', compliance: 90, timed: false, targetMinutes: 0,
    items: [{ label: 'Pre-op antibiotics ≤ 60 min' }, { label: 'Normothermia' }, { label: 'Hair removal — clippers only' }, { label: 'Glycaemic control' }] },
  { id: 'falls', name: 'Falls Prevention', owner: 'Nursing', compliance: 92, timed: false, targetMinutes: 0,
    items: [{ label: 'Morse score on admission' }, { label: 'Bed rails / low bed' }, { label: 'Call bell reachable' }, { label: 'Hourly rounding' }] },
  { id: 'pui', name: 'Pressure Ulcer Bundle', owner: 'Nursing', compliance: 88, timed: false, targetMinutes: 0,
    items: [{ label: 'Braden score' }, { label: 'Turn Q2H' }, { label: 'Skin inspection' }, { label: 'Pressure-relieving surfaces' }] },
  { id: 'stroke-b', name: 'Stroke Bundle', owner: 'Neurology', compliance: 68, timed: false, targetMinutes: 0,
    items: [{ label: 'Aspirin ≤ 48 h' }, { label: 'Dysphagia screen' }, { label: 'Swallow assessment' }, { label: 'Early rehab' }, { label: 'DVT prophylaxis' }] },
  { id: 'hf-b', name: 'Heart Failure Bundle', owner: 'Cardiology', compliance: 85, timed: false, targetMinutes: 0,
    items: [{ label: 'Echocardiogram within 48 h' }, { label: 'Daily weight' }, { label: 'Medication reconciliation' }, { label: 'Diet counselling' }] },
  { id: 'maternal-ews', name: 'Maternal Early Warning', owner: 'Obstetrics', compliance: 94, timed: false, targetMinutes: 0,
    items: [{ label: 'MEWS charting Q4H' }, { label: 'Sepsis screen if temp ≥ 38' }, { label: 'PPH observation post-delivery' }] },
]

// ── Order Sets ────────────────────────────────────────────────────────────────
export const ORDER_SETS: OrderSet[] = [
  {
    id: 'dka-pack', name: 'DKA Admission Pack', indication: 'Diabetic ketoacidosis', status: 'active', version: '2.3',
    groups: [
      { group: 'Labs', items: ['CBC', 'Urea & Electrolytes', 'ABG / VBG', 'Ketones', 'Glucose Q1H', 'ECG'], auto: true },
      { group: 'Fluids', items: ['0.9% NaCl 1 L over 1 h', '0.9% NaCl 500 mL Q4H', 'Switch to 0.45% NaCl + 5% dextrose when glucose < 14'], auto: true },
      { group: 'Insulin', items: ['Fixed-rate IV insulin 0.1 units/kg/h', 'Hold if K+ < 3.3 — replace first'], auto: true },
      { group: 'Monitoring', items: ['Vitals Q15 min × 2 h', 'Urine output hourly', 'K+ Q2H × 4', 'GCS Q1H'], auto: true },
      { group: 'Nursing Orders', items: ['DKA monitoring chart', 'Fluid balance chart', 'Insulin pump check'], auto: true },
      { group: 'Documentation', items: ['DKA clerking template', 'Resolution criteria note'], auto: true },
    ],
  },
  {
    id: 'sepsis-pack', name: 'Sepsis Admission Pack', indication: 'Sepsis / septic shock', status: 'active', version: '4.1',
    groups: [
      { group: 'Labs', items: ['Lactate STAT', 'Blood cultures ×2', 'CBC', 'U&E', 'Glucose', 'LFTs + Coag'], auto: true },
      { group: 'Resuscitation', items: ['Oxygen to SpO₂ ≥ 94%', '30 mL/kg crystalloid', 'Antibiotics ≤ 1 h'], auto: true },
      { group: 'Imaging', items: ['Chest X-ray'], auto: true },
      { group: 'Monitoring', items: ['Vitals Q15 min × 1 h', 'Lactate Q6H', 'Urine output hourly'], auto: true },
    ],
  },
  {
    id: 'stroke-pack', name: 'Acute Stroke Admission Pack', indication: 'Acute ischaemic stroke', status: 'draft', version: '4.0',
    groups: [
      { group: 'Imaging', items: ['Non-contrast CT brain STAT', 'CT angiography'], auto: true },
      { group: 'Labs', items: ['Glucose', 'INR', 'CBC', 'U&E', 'Troponin', 'ECG'], auto: true },
      { group: 'Medications', items: ['Alteplase per weight (if candidate)', 'Aspirin 300 mg after ICH excluded'], auto: true },
      { group: 'Monitoring', items: ['Neuro obs Q15 min', 'BP per protocol', 'Dysphagia screen'], auto: true },
    ],
  },
  {
    id: 'pph-pack', name: 'PPH Massive Transfusion Pack', indication: 'Postpartum haemorrhage', status: 'active', version: '2.0',
    groups: [
      { group: 'Immediate', items: ['2 large-bore IV lines', 'Cross-match + group & save', 'Oxytocin 10 IU IV/IM'], auto: true },
      { group: 'Medications', items: ['Tranexamic acid 1 g IV', 'Methylergometrine 0.2 mg IM'], auto: true },
      { group: 'Blood', items: ['O-negative if uncrossed', 'Packed cells 4 units', 'FFP', 'Fibrinogen / cryoprecipitate'], auto: true },
      { group: 'Theatre', items: ['Obstetric team alert', 'Tamponade balloon', 'Surgical standby'], auto: true },
    ],
  },
  {
    id: 'trauma-pack', name: 'Major Trauma Admission Pack', indication: 'Polytrauma', status: 'active', version: '5.2',
    groups: [
      { group: 'Primary Survey', items: ['Airway assessment', 'C-spine precautions', 'Chest X-ray + pelvis X-ray', 'FAST scan'], auto: true },
      { group: 'Blood', items: ['Group & cross-match', 'Massive transfusion trigger'], auto: true },
      { group: 'Analgesia', items: ['IV analgesia per protocol', 'Tetanus prophylaxis'], auto: true },
    ],
  },
]

// ── Clinical Guidelines & Hospital Policies ───────────────────────────────────
export const GUIDELINES = [
  { id: 'g1', title: 'Antimicrobial Stewardship', authority: 'WHO / MOH Kenya', version: '3.0', status: 'current', updated: 'Mar 2026' },
  { id: 'g2', title: 'Hand Hygiene', authority: 'WHO', version: '2.1', status: 'current', updated: 'Jan 2026' },
  { id: 'g3', title: 'Blood Transfusion', authority: 'MOH Kenya / WHO', version: '4.2', status: 'current', updated: 'Feb 2026' },
  { id: 'g4', title: 'TB Management', authority: 'WHO / MOH Kenya', version: '6.0', status: 'current', updated: 'Nov 2025' },
  { id: 'g5', title: 'HIV / ART', authority: 'WHO / MOH Kenya', version: '7.4', status: 'current', updated: 'Jan 2026' },
  { id: 'g6', title: 'Pain Management', authority: 'WHO Ladder', version: '2.0', status: 'review', updated: 'Apr 2026' },
  { id: 'g7', title: 'Pressure Injury Prevention', authority: 'EPUAP / NICE', version: '1.6', status: 'current', updated: 'Jun 2026' },
  { id: 'g8', title: 'Venous Thromboembolism Prophylaxis', authority: 'NICE', version: '2.2', status: 'current', updated: 'May 2026' },
]

export const POLICIES = [
  { id: 'p1', title: 'Visitation Policy', dept: 'Administration', version: '1.4', status: 'current', updated: 'Feb 2026' },
  { id: 'p2', title: 'Consent & Capacity', dept: 'Legal / Clinical Governance', version: '2.0', status: 'current', updated: 'Dec 2025' },
  { id: 'p3', title: 'Incident Reporting & Open Disclosure', dept: 'Quality', version: '3.1', status: 'current', updated: 'Apr 2026' },
  { id: 'p4', title: 'Data Protection & Confidentiality', dept: 'ICT / Legal', version: '5.0', status: 'current', updated: 'Jan 2026' },
  { id: 'p5', title: 'Staff Code of Conduct', dept: 'HR', version: '2.3', status: 'current', updated: 'Mar 2026' },
  { id: 'p6', title: 'Medication Handling & Storage', dept: 'Pharmacy', version: '1.9', status: 'review', updated: 'Jun 2026' },
  { id: 'p7', title: 'Infection Control & Isolation', dept: 'IPC', version: '4.0', status: 'current', updated: 'Feb 2026' },
  { id: 'p8', title: 'Patient Identification & Safety', dept: 'Quality', version: '1.2', status: 'current', updated: 'May 2026' },
]

// ── SOP Library ───────────────────────────────────────────────────────────────
export const SOPS: SopItem[] = [
  { id: 'sop1', title: 'Blood Transfusion Administration', dept: 'Laboratory / Nursing', version: '4.2', status: 'current', owner: 'Chief Lab Officer', steps: ['Verify prescription & consent', 'Patient identity check ×2', 'Pre-transfusion vitals', 'Compatibility check at bedside', 'Start within 30 min, monitor 15 min', 'Complete post-transfusion record'] },
  { id: 'sop2', title: 'MRI Safety Screening', dept: 'Radiology', version: '2.0', status: 'current', owner: 'Radiology Lead', steps: ['Metal screening questionnaire', 'Ferromagnetic check', 'Contrast allergy review', 'Contraindication log'] },
  { id: 'sop3', title: 'Fire Response', dept: 'Facilities', version: '3.3', status: 'current', owner: 'Safety Officer', steps: ['R.A.C.E. — Rescue, Alarm, Contain, Evacuate', 'Fire extinguisher P.A.S.S.', 'Ward assembly points', 'Head count & report'] },
  { id: 'sop4', title: 'Specimen Handling & Transport', dept: 'Laboratory', version: '5.0', status: 'current', owner: 'Lab Quality Lead', steps: ['Label with 2 identifiers', 'Correct container & additive', 'Cold chain where required', 'Transporter handover log'] },
  { id: 'sop5', title: 'Mortuary Procedures', dept: 'Mortuary', version: '1.6', status: 'review', owner: 'Mortuary Manager', steps: ['Legal documentation', 'Body identification chain', 'Storage & release protocol', 'Decedent dignity checklist'] },
  { id: 'sop6', title: 'Clinical Waste Disposal', dept: 'IPC / Facilities', version: '4.1', status: 'current', owner: 'IPC Lead', steps: ['Segregate by colour coding', 'Sharps in puncture-proof bins', 'Incinerator / licensed transporter', 'Waste log'] },
  { id: 'sop7', title: 'Sterilization (Autoclave)', dept: 'CSSD', version: '6.0', status: 'current', owner: 'CSSD Lead', steps: ['Decontamination rinse', 'Packing with indicators', 'Autoclave cycle log', 'Spore testing weekly'] },
  { id: 'sop8', title: 'Operating Theatre Cleaning', dept: 'Theatre', version: '2.4', status: 'current', owner: 'Theatre Manager', steps: ['Between-case wipe down', 'Terminal clean at day end', 'Blood spill protocol', 'Air handling check'] },
]

// ── Drug Formulary ────────────────────────────────────────────────────────────
export const FORMULARY: DrugEntry[] = [
  { id: 'dr1', name: 'Ceftriaxone', class: 'Cephalosporin (3rd gen)', dose: '1–2 g IV Q24H', indications: 'Sepsis, pneumonia, meningitis, UTI', contraindications: 'Known cephalosporin allergy', interactions: 'Anticoagulants (bleeding)', pregnancy: 'Category B — safe', pediatric: '50–75 mg/kg/day', renal: 'No adjustment', hepatic: 'No adjustment', availability: 'available', cost: 'KES 180 / g' },
  { id: 'dr2', name: 'Piperacillin–Tazobactam', class: 'Penicillin + β-lactamase inhibitor', dose: '4.5 g IV Q6–8H', indications: 'HAP, intra-abdominal sepsis', contraindications: 'Penicillin allergy', interactions: 'Aminoglycosides (inactivation)', pregnancy: 'Category B', pediatric: '90 mg/kg Q6H', renal: 'Reduce in CrCl < 20', hepatic: 'No adjustment', availability: 'limited', cost: 'KES 950 / dose' },
  { id: 'dr3', name: 'Vancomycin', class: 'Glycopeptide', dose: '15–20 mg/kg IV Q8–12H', indications: 'MRSA, severe Gram-positive sepsis', contraindications: 'Renal failure (dose), allergy', interactions: 'Nephrotoxins', pregnancy: 'Category C — monitor', pediatric: '15 mg/kg Q6H', renal: 'Dose by level', hepatic: 'No adjustment', availability: 'available', cost: 'KES 620 / 500 mg' },
  { id: 'dr4', name: 'Noradrenaline (Norepinephrine)', class: 'Vasopressor', dose: '0.05–0.1 µg/kg/min IV', indications: 'Septic shock, cardiogenic shock', contraindications: 'Mesenteric ischaemia', interactions: 'MAOIs', pregnancy: 'Only if life-saving', pediatric: '0.05–0.3 µg/kg/min', renal: 'No adjustment', hepatic: 'No adjustment', availability: 'limited', cost: 'KES 4,800 / vial' },
  { id: 'dr5', name: 'Insulin (IV fixed-rate)', class: 'Hormone / antihyperglycaemic', dose: '0.1 units/kg/h IV', indications: 'DKA, HHS', contraindications: 'Hypoglycaemia', interactions: 'β-blockers mask hypoglycaemia', pregnancy: 'Safe', pediatric: '0.05–0.1 units/kg/h', renal: 'No adjustment', hepatic: 'No adjustment', availability: 'available', cost: 'KES 240 / vial' },
  { id: 'dr6', name: 'Oxytocin', class: 'Uterotonic', dose: '10 IU IV/IM', indications: 'PPH, labour augmentation', contraindications: 'Hypertonic uterus', interactions: 'Vasopressors', pregnancy: 'Used for labour', pediatric: 'n/a', renal: 'No adjustment', hepatic: 'No adjustment', availability: 'available', cost: 'KES 150 / amp' },
  { id: 'dr7', name: 'Tranexamic Acid', class: 'Antifibrinolytic', dose: '1 g IV over 10 min', indications: 'PPH, trauma haemorrhage', contraindications: 'Active thrombosis', interactions: 'Oral contraceptives', pregnancy: 'Use in PPH', pediatric: '15 mg/kg', renal: 'Reduce in renal failure', hepatic: 'No adjustment', availability: 'available', cost: 'KES 380 / 1 g' },
  { id: 'dr8', name: 'Artesunate', class: 'Antimalarial', dose: '2.4 mg/kg IV 0, 12, 24 h', indications: 'Severe falciparum malaria', contraindications: '—', interactions: '—', pregnancy: 'Safe in all trimesters', pediatric: '2.4 mg/kg same', renal: 'No adjustment', hepatic: 'No adjustment', availability: 'backorder', cost: 'KES 1,200 / vial' },
  { id: 'dr9', name: 'Alteplase', class: 'Thrombolytic', dose: '0.9 mg/kg (max 90 mg)', indications: 'Acute ischaemic stroke, MI', contraindications: 'Recent surgery, bleeding, BP > 185/110', interactions: 'Anticoagulants', pregnancy: 'Risk–benefit', pediatric: 'Contraindicated < 18 y in stroke', renal: 'No adjustment', hepatic: 'Caution', availability: 'available', cost: 'KES 32,000 / 50 mg' },
  { id: 'dr10', name: 'Potassium Chloride', class: 'Electrolyte', dose: '20–40 mmol IV over 1 h', indications: 'Hypokalaemia, DKA replacement', contraindications: 'Hyperkalaemia, renal failure', interactions: 'K+ sparing diuretics', pregnancy: 'Safe', pediatric: '0.5–1 mmol/kg', renal: 'Dose cautiously', hepatic: 'No adjustment', availability: 'available', cost: 'KES 90 / 20 mmol' },
  { id: 'dr11', name: 'Methylergometrine', class: 'Uterotonic / ergot', dose: '0.2 mg IM', indications: 'PPH (second line)', contraindications: 'Hypertension, cardiac disease', interactions: 'Macrolides, antifungals', pregnancy: 'Postpartum only', pediatric: 'n/a', renal: 'No adjustment', hepatic: 'Caution', availability: 'limited', cost: 'KES 210 / amp' },
  { id: 'dr12', name: 'Hydrocortisone', class: 'Corticosteroid', dose: '50 mg IV Q6H', indications: 'Refractory shock, adrenal crisis', contraindications: 'Systemic fungal infection', interactions: 'Hypoglycaemics, anticoagulants', pregnancy: 'Caution', pediatric: '0.5–1 mg/kg', renal: 'No adjustment', hepatic: 'No adjustment', availability: 'available', cost: 'KES 110 / 100 mg' },
]

// ── Reference Ranges ──────────────────────────────────────────────────────────
export const REFERENCE_RANGES: ReferenceRange[] = [
  { id: 'rr1', test: 'Troponin (high-sensitivity)', unit: 'ng/L', gender: 'Both', criticalLow: '—', criticalHigh: '> 52 (Lab A)', labs: [{ lab: 'Lab A (Abbott)', value: '14' }, { lab: 'Lab B (Roche)', value: '19' }, { lab: 'Lab C (Siemens)', value: '26' }] },
  { id: 'rr2', test: 'Lactate', unit: 'mmol/L', gender: 'Both', criticalLow: '—', criticalHigh: '> 4', labs: [{ lab: 'Lab A', value: '0.5–2.0' }, { lab: 'Lab B', value: '0.5–2.0' }, { lab: 'Lab C', value: '0.5–2.0' }] },
  { id: 'rr3', test: 'Haemoglobin', unit: 'g/dL', gender: 'Male', criticalLow: '< 6', criticalHigh: '> 20', labs: [{ lab: 'Lab A', value: '13.5–17.5' }, { lab: 'Lab B', value: '13.0–17.0' }, { lab: 'Lab C', value: '13.5–18.0' }] },
  { id: 'rr4', test: 'Haemoglobin', unit: 'g/dL', gender: 'Female', criticalLow: '< 6', criticalHigh: '> 20', labs: [{ lab: 'Lab A', value: '12.0–15.5' }, { lab: 'Lab B', value: '11.5–15.0' }, { lab: 'Lab C', value: '12.0–16.0' }] },
  { id: 'rr5', test: 'Potassium', unit: 'mmol/L', gender: 'Both', criticalLow: '< 2.5', criticalHigh: '> 6.5', labs: [{ lab: 'Lab A', value: '3.5–5.1' }, { lab: 'Lab B', value: '3.5–5.0' }, { lab: 'Lab C', value: '3.5–5.2' }] },
  { id: 'rr6', test: 'Creatinine', unit: 'µmol/L', gender: 'Both', criticalLow: '—', criticalHigh: '> 400', labs: [{ lab: 'Lab A', value: '49–90' }, { lab: 'Lab B', value: '50–95' }, { lab: 'Lab C', value: '48–92' }] },
  { id: 'rr7', test: 'eGFR', unit: 'mL/min/1.73m²', gender: 'Both', criticalLow: '< 15', criticalHigh: '—', labs: [{ lab: 'Lab A', value: '≥ 90' }, { lab: 'Lab B', value: '≥ 90' }, { lab: 'Lab C', value: '≥ 90' }] },
  { id: 'rr8', test: 'CRP', unit: 'mg/L', gender: 'Both', criticalLow: '—', criticalHigh: '> 100', labs: [{ lab: 'Lab A', value: '< 5' }, { lab: 'Lab B', value: '< 6' }, { lab: 'Lab C', value: '< 5' }] },
  { id: 'rr9', test: 'Platelets', unit: '×10⁹/L', gender: 'Both', criticalLow: '< 20', criticalHigh: '> 1000', labs: [{ lab: 'Lab A', value: '150–400' }, { lab: 'Lab B', value: '150–410' }, { lab: 'Lab C', value: '140–400' }] },
  { id: 'rr10', test: 'Bilirubin (total)', unit: 'µmol/L', gender: 'Both', criticalLow: '—', criticalHigh: '> 200', labs: [{ lab: 'Lab A', value: '5–21' }, { lab: 'Lab B', value: '3–20' }, { lab: 'Lab C', value: '5–21' }] },
]

// ── AI Rules ──────────────────────────────────────────────────────────────────
export const AI_RULES: AiRule[] = [
  { id: 'rule1', name: 'Septic Shock Alert', engine: 'Sepsis Engine', severity: 'critical', active: true, triggersCount: 1480, operator: 'AND', ifConditions: ['Lactate > 4 mmol/L', 'SBP < 90 mmHg'], trigger: 'Septic Shock Alert', notify: ['ICU', 'Emergency', 'Consultant'] },
  { id: 'rule2', name: 'Critical Potassium', engine: 'Lab Engine', severity: 'critical', active: true, triggersCount: 212, operator: 'AND', ifConditions: ['K+ > 6.5 mmol/L'], trigger: 'Critical Potassium Alert', notify: ['Doctor on call', 'Renal team'] },
  { id: 'rule3', name: 'Severe Hypoxia', engine: 'Vitals Engine', severity: 'critical', active: true, triggersCount: 334, operator: 'AND', ifConditions: ['SpO₂ < 85%', 'FiO₂ > 60%'], trigger: 'Refractory Hypoxia Alert', notify: ['ICU', 'Respiratory therapist'] },
  { id: 'rule4', name: 'Stroke FAST Positive', engine: 'Stroke Engine', severity: 'critical', active: true, triggersCount: 612, operator: 'AND', ifConditions: ['FAST screen positive'], trigger: 'Stroke Code Activated', notify: ['Neurology', 'Radiology', 'Emergency'] },
  { id: 'rule5', name: 'Antibiotic Delay > 60 min', engine: 'Sepsis Engine', severity: 'warning', active: true, triggersCount: 97, operator: 'AND', ifConditions: ['Sepsis activated', 'No antibiotic order after 60 min'], trigger: 'Sepsis Six compliance flag', notify: ['Ward in-charge', 'Pharmacy'] },
  { id: 'rule6', name: 'DKA Insulin Hold', engine: 'Endocrine Engine', severity: 'warning', active: true, triggersCount: 41, operator: 'AND', ifConditions: ['DKA active', 'K+ < 3.3 mmol/L'], trigger: 'Hold insulin, replace potassium', notify: ['Doctor on call'] },
  { id: 'rule7', name: 'PPH Trigger', engine: 'Obstetric Engine', severity: 'critical', active: true, triggersCount: 328, operator: 'OR', ifConditions: ['Blood loss ≥ 500 mL', 'HR > 110 with bleeding'], trigger: 'PPH Response Activated', notify: ['Obstetrics', 'Theatre', 'Blood bank'] },
  { id: 'rule8', name: 'Troponin Rising', engine: 'Cardiac Engine', severity: 'warning', active: true, triggersCount: 405, operator: 'AND', ifConditions: ['Troponin delta > 30%', 'ECG ischaemic change'], trigger: 'ACS alert', notify: ['Cardiology', 'Emergency'] },
  { id: 'rule9', name: 'Neonatal Hypoglycaemia', engine: 'Neonatal Engine', severity: 'warning', active: false, triggersCount: 0, operator: 'AND', ifConditions: ['Neonatal glucose < 2.6 mmol/L'], trigger: 'Neonatal hypoglycaemia alert', notify: ['Pediatrics', 'Nursery'] },
  { id: 'rule10', name: 'Falls Risk High', engine: 'Safety Engine', severity: 'info', active: true, triggersCount: 2100, operator: 'AND', ifConditions: ['Morse score > 45'], trigger: 'Falls prevention activation', notify: ['Nursing station'] },
]

// ── Escalation Rules ──────────────────────────────────────────────────────────
export const ESCALATION_RULES = [
  {
    id: 'esc1', name: 'Critical Potassium', trigger: 'K+ > 6.5 mmol/L on ANY sample', steps: [
      { label: 'Lab validates', action: 'Critical result confirmed, flagged in LIS', delay: '0 min', role: 'Laboratory' },
      { label: 'Doctor notified', action: 'Page + in-app alert to covering doctor', delay: '0 min', role: 'Doctor on call' },
      { label: 'No acknowledgement', action: 'Alert repeats, escalates', delay: '10 min', role: 'System' },
      { label: 'Consultant notified', action: 'Direct escalation to consultant + renal team', delay: '10 min', role: 'Consultant' },
      { label: 'Ward in-charge notified', action: 'Nursing lead + safety huddle', delay: '15 min', role: 'Ward in-charge' },
      { label: 'Medical Director', action: 'Hospital-wide flag, incident review', delay: '30 min', role: 'Medical Director' },
    ] as EscalationStep[],
  },
  {
    id: 'esc2', name: 'Refractory Septic Shock', trigger: 'MAP < 65 mmHg after 30 mL/kg fluids', steps: [
      { label: 'Sepsis alert', action: 'Sepsis Six + ICU notification', delay: '0 min', role: 'System' },
      { label: 'Vasopressor start', action: 'Noradrenaline order auto-created', delay: '0 min', role: 'Medical team' },
      { label: 'ICU bed request', action: 'If no ICU bed in 30 min', delay: '30 min', role: 'ICU coordinator' },
      { label: 'Consultant escalation', action: 'Senior review + critical care outreach', delay: '30 min', role: 'Consultant' },
      { label: 'Transfer co-ordination', action: 'Stabilise + transfer logistics', delay: '60 min', role: 'Medical Director' },
    ] as EscalationStep[],
  },
  {
    id: 'esc3', name: 'Postpartum Haemorrhage', trigger: 'Estimated blood loss ≥ 500 mL with instability', steps: [
      { label: 'PPH pack activation', action: 'Team call, theatre notified', delay: '0 min', role: 'Midwife' },
      { label: 'Massive transfusion', action: 'Blood bank + O-negative release', delay: '0 min', role: 'Blood bank' },
      { label: 'Senior obstetrician', action: 'Operative escalation decision', delay: '10 min', role: 'Obstetrician' },
      { label: 'Surgical team', action: 'Theatre readiness, hysterectomy standby', delay: '15 min', role: 'Theatre' },
    ] as EscalationStep[],
  },
  {
    id: 'esc4', name: 'Missed Critical Result', trigger: 'No clinician acknowledgment of critical lab in 20 min', steps: [
      { label: 'First alert', action: 'Critical result paged', delay: '0 min', role: 'Laboratory' },
      { label: 'Second alert', action: 'Escalated to covering doctor + senior nurse', delay: '10 min', role: 'System' },
      { label: 'Consultant', action: 'Direct escalation', delay: '20 min', role: 'Consultant' },
      { label: 'Quality event', action: 'Open patient-safety event, M&M review', delay: '60 min', role: 'Quality' },
    ] as EscalationStep[],
  },
]

// ── Protocol Simulator ────────────────────────────────────────────────────────
export const SIM_PROFILES = [
  { id: 'sp1', label: 'Adult Sepsis — 74 y', age: 74, bmi: 26, bp: '78/40', hr: 118, rr: 28, spo2: 89, temp: 39.4, lactate: 6.8, gcs: 'A', urine: 'Reduced' },
  { id: 'sp2', label: 'Young Septic Male', age: 32, bmi: 24, bp: '95/60', hr: 104, rr: 24, spo2: 94, temp: 38.6, lactate: 3.1, gcs: 'A', urine: 'Normal' },
  { id: 'sp3', label: 'DKA — 21 y', age: 21, bmi: 22, bp: '110/70', hr: 96, rr: 20, spo2: 98, temp: 36.8, lactate: 1.8, gcs: 'A', urine: 'Ketones 3+' },
  { id: 'sp4', label: 'PPH — Post Delivery', age: 29, bmi: 28, bp: '84/50', hr: 124, rr: 26, spo2: 93, temp: 37.0, lactate: 4.2, gcs: 'A', urine: 'Reduced' },
  { id: 'sp5', label: 'Chest Pain — 60 y', age: 60, bmi: 30, bp: '142/88', hr: 88, rr: 18, spo2: 97, temp: 36.6, lactate: 1.2, gcs: 'A', urine: 'Normal' },
]

// ── Version Control ───────────────────────────────────────────────────────────
export const VERSIONED_PROTOCOLS: VersionedProtocol[] = [
  {
    id: 'vp-sepsis', name: 'Adult Sepsis',
    versions: [
      { version: 'v4.1', status: 'current', author: 'Dr. A. Wanjiru', date: '15 Jul 2026', summary: 'Lactate clearance target, updated empiric antibiotics', changes: ['New Sepsis Six bundle card', 'Antibiotic timing rule reinforced', 'Vasopressor start criteria'], sections: [['Overview', true], ['Recognition', true], ['Diagnostic Criteria', true], ['Treatment', true], ['Escalation', true]].map(([name, present]) => ({ name: name as string, present: present as boolean })) },
      { version: 'v4.0', status: 'archived', author: 'Dr. A. Wanjiru', date: '02 Mar 2026', summary: 'WHO 2024 alignment, added red flags section', changes: ['Red flags section added', 'SOFA table simplified'], sections: [['Overview', true], ['Recognition', true], ['Diagnostic Criteria', true], ['Treatment', true], ['Escalation', false]].map(([name, present]) => ({ name: name as string, present: present as boolean })) },
      { version: 'v3.2', status: 'archived', author: 'Dr. P. Otieno', date: '11 Sep 2025', summary: 'Antibiotic stewardship integration', changes: ['De-escalation rules', 'Renal dose adjustments'], sections: [['Overview', true], ['Recognition', false], ['Diagnostic Criteria', true], ['Treatment', true], ['Escalation', false]].map(([name, present]) => ({ name: name as string, present: present as boolean })) },
      { version: 'v3.0', status: 'archived', author: 'Dr. P. Otieno', date: '18 Jan 2025', summary: 'Initial sepsis-3 adoption', changes: ['qSOFA screening introduced'], sections: [['Overview', true], ['Recognition', false], ['Diagnostic Criteria', false], ['Treatment', true], ['Escalation', false]].map(([name, present]) => ({ name: name as string, present: present as boolean })) },
    ],
  },
  {
    id: 'vp-stroke', name: 'Acute Stroke',
    versions: [
      { version: 'v4.1', status: 'current', author: 'Dr. S. Kimani', date: '30 Mar 2026', summary: 'AHA 2026 thrombolysis window', changes: ['Tenecteplase alternative added', 'Door-to-needle 45 min'], sections: [['Overview', true], ['Recognition', true], ['Treatment', true]].map(([name, present]) => ({ name: name as string, present: present as boolean })) },
      { version: 'v4.0', status: 'archived', author: 'Dr. S. Kimani', date: '10 Oct 2025', summary: 'CTA for thrombectomy screen', changes: ['Thrombectomy pathway'], sections: [['Overview', true], ['Recognition', true], ['Treatment', false]].map(([name, present]) => ({ name: name as string, present: present as boolean })) },
      { version: 'v3.0', status: 'archived', author: 'Dr. M. Njeri', date: '14 May 2025', summary: 'Legacy protocol', changes: ['PDF converted to executable'], sections: [['Overview', true], ['Recognition', true], ['Treatment', false]].map(([name, present]) => ({ name: name as string, present: present as boolean })) },
    ],
  },
]

// ── Analytics ─────────────────────────────────────────────────────────────────
export const ANALYTICS = {
  mostUsed: [
    { name: 'Sepsis', value: 1284 },
    { name: 'Malaria', value: 920 },
    { name: 'Chest Pain', value: 862 },
    { name: 'ACS', value: 640 },
    { name: 'Septic Shock', value: 512 },
    { name: 'DKA', value: 402 },
    { name: 'Stroke', value: 366 },
    { name: 'PPH', value: 178 },
  ],
  lowestCompliance: [
    { name: 'Ventilator Bundle', value: 64 },
    { name: 'Stroke Bundle', value: 68 },
    { name: 'Septic Shock Protocol', value: 74 },
    { name: 'ACS Protocol', value: 78 },
    { name: 'CAUTI Bundle', value: 79 },
    { name: 'CLABSI Bundle', value: 81 },
  ],
  mortality: [
    { name: 'Septic Shock', value: 32 },
    { name: 'Sepsis', value: 21 },
    { name: 'Stroke', value: 18 },
    { name: 'ACS', value: 11 },
    { name: 'Severe Malaria', value: 8 },
    { name: 'PPH', value: 6 },
  ],
  deviations: [
    { name: 'Septic Shock', value: 61 },
    { name: 'Stroke', value: 52 },
    { name: 'Sepsis', value: 44 },
    { name: 'ACS', value: 39 },
    { name: 'Malaria', value: 33 },
  ],
  triggerFreq: [
    { name: 'Sepsis Engine', value: 3910 },
    { name: 'Falls Safety', value: 2100 },
    { name: 'Malaria Engine', value: 1902 },
    { name: 'Sepsis Shock', value: 1480 },
    { name: 'ACS Engine', value: 1304 },
    { name: 'Stroke Engine', value: 612 },
  ],
  aiTriggerByHour: [
    { hour: '00', value: 34 }, { hour: '02', value: 22 }, { hour: '04', value: 18 }, { hour: '06', value: 26 },
    { hour: '08', value: 61 }, { hour: '10', value: 89 }, { hour: '12', value: 74 }, { hour: '14', value: 82 },
    { hour: '16', value: 71 }, { hour: '18', value: 58 }, { hour: '20', value: 47 }, { hour: '22', value: 39 },
  ],
  outcomes: [
    { name: 'Survival', value: 78 },
    { name: 'Improved', value: 61 },
    { name: 'Stable', value: 44 },
    { name: 'Deaths', value: 21 },
    { name: 'Readmission', value: 12 },
  ],
}

// ── Marketplace ───────────────────────────────────────────────────────────────
export const MARKETPLACE: MarketplacePack[] = [
  { id: 'm1', authority: 'WHO', name: 'WHO Essential Protocols Pack', description: 'Maternal, newborn, child, TB, HIV, malaria and emergency protocols', items: ['WHO PPH', 'IMCI', 'Emergency Triage Assessment', 'TB Management'], installed: true, featured: true },
  { id: 'm2', authority: 'NICE', name: 'NICE Clinical Guidelines Pack', description: 'Evidence-based quality standards for UK-validated pathways', items: ['VTE Prophylaxis', 'Sepsis Recognition', 'Pressure Injury'], installed: true },
  { id: 'm3', authority: 'MOH Kenya', name: 'MOH Kenya National Guidelines', description: 'Kenyan national clinical guidelines and formulary', items: ['Kenya EML', 'Malaria Case Management', 'ART Guidelines'], installed: true },
  { id: 'm4', authority: 'CDC', name: 'CDC Infection Control Pack', description: 'Isolation precautions, vaccination, outbreak response', items: ['Isolation Types', 'HICPAC Precautions', 'Outbreak SOP'], installed: false },
  { id: 'm5', authority: 'Surviving Sepsis', name: 'Surviving Sepsis Campaign Pack', description: 'Hour-1 bundle, sepsis six and resuscitation guidance', items: ['Hour-1 Bundle', 'Sepsis Six', 'Vasopressor Guidance'], installed: true, featured: true },
  { id: 'm6', authority: 'AHA', name: 'AHA Cardiovascular Pack', description: 'CPR, ACS, stroke and heart failure guidelines', items: ['ACLS 2026', 'STEMI/NSTEMI', 'Stroke Guidelines'], installed: true },
  { id: 'm7', authority: 'ATLS', name: 'ATLS Trauma Pack', description: 'Advanced trauma life support decision trees', items: ['Primary Survey', 'Massive Transfusion', 'Trauma Team'], installed: false },
  { id: 'm8', authority: 'ACLS', name: 'ACLS 2026 Update', description: 'Adult cardiac arrest algorithm updates', items: ['Cardiac Arrest Algorithm', 'Post-ROSC Care'], installed: false },
  { id: 'm9', authority: 'PALS', name: 'PALS Pediatric Pack', description: 'Pediatric advanced life support protocols', items: ['Pediatric Arrest', 'Pediatric Septic Shock', 'Respiratory Distress'], installed: false },
  { id: 'm10', authority: 'NRP', name: 'NRP Neonatal Pack', description: 'Neonatal resuscitation program', items: ['NRP Algorithm', 'Neonatal Sepsis', 'Hypoglycaemia'], installed: false },
  { id: 'm11', authority: 'RCOG', name: 'RCOG Obstetric Pack', description: 'Obstetric emergencies: PPH, eclampsia, sepsis', items: ['PPH Green-top', 'Pre-eclampsia', 'Maternal Sepsis'], installed: false },
  { id: 'm12', authority: 'AAOS', name: 'AAOS Orthopaedic Pack', description: 'Fracture, joint and spine management pathways', items: ['Open Fracture', 'Hip Fracture', 'Spinal Injury'], installed: false },
  { id: 'm13', authority: 'AMEXAN', name: 'AMEXAN Intelligence Packs', description: 'Auto-generated AI rules, order sets and dashboards from your own data', items: ['AI Rules Generator', 'Compliance Auto-Report', 'Outcome Tracking'], installed: false, featured: true },
]

// ── FHIR CDS Hooks ────────────────────────────────────────────────────────────
export const CDS_HOOKS = [
  { id: 'hook1', name: 'medication-prescribe', active: true, hits: 4820, action: 'Drug interaction & allergy check on prescribe' },
  { id: 'hook2', name: 'order-select', active: true, hits: 3910, action: 'Order set recommendation & sepsis screening' },
  { id: 'hook3', name: 'patient-view', active: true, hits: 12050, action: 'Protocol status banner on patient record' },
  { id: 'hook4', name: 'encounter-start', active: true, hits: 9410, action: 'Best practice advisory on encounter open' },
  { id: 'hook5', name: 'appointment-book', active: false, hits: 0, action: 'Risk-based scheduling advisory' },
]
