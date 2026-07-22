export type CptCodeType = 'evaluation' | 'procedure' | 'imaging' | 'lab' | 'consult' | 'preventive' | 'critical_care'
export type Icd10Type = 'diagnosis' | 'symptom' | 'finding' | 'external_cause' | 'factor'

export interface CptCode {
  code: string
  description: string
  type: CptCodeType
  rvu: number
  globalDays?: number
  modifiers?: string[]
  facilityPricing?: number
  nonFacilityPricing?: number
  specialty?: string
  ageRange?: { low: number; high: number }
  addOnCodes?: string[]
}

export interface Icd10Code {
  code: string
  description: string
  type: Icd10Type
  chapter: string
  category: string
  subcategory: string
  billable: boolean
  manifestation: boolean
  excludes1?: string[]
  excludes2?: string[]
  forDiagnosis: string[]
}

export interface CptCodeInput {
  cptCode: string
  modifiers?: string[]
  units?: number
  diagnosisPointer?: string[]
}

export interface BillingLineItem {
  cptCode: string
  cptDescription: string
  modifiers: string[]
  units: number
  type: CptCodeType
  rvu: number
  charge: number
  diagnosisPointers: string[]
}

export interface EncounterBillingSummary {
  encounterDate: string
  encounterType: string
  provider: string
  department: string
  lineItems: BillingLineItem[]
  icd10Codes: Icd10Code[]
  totalRvu: number
  totalCharge: number
  billingStatus: 'draft' | 'coded' | 'submitted' | 'paid' | 'denied'
}

// ── CPT Code Registry ─────────────────────────────────────────────────────────

const CPT_REGISTRY: Record<string, CptCode> = {};
const ICD10_REGISTRY: Record<string, Icd10Code> = {};

export function registerCptCode(code: CptCode): void {
  CPT_REGISTRY[code.code] = code;
}

export function registerIcd10Code(code: Icd10Code): void {
  ICD10_REGISTRY[code.code] = code;
}

export function getCptCode(code: string): CptCode | undefined {
  return CPT_REGISTRY[code];
}

export function getIcd10Code(code: string): Icd10Code | undefined {
  return ICD10_REGISTRY[code];
}

export function searchCptByCode(query: string): CptCode[] {
  const q = query.toUpperCase();
  return Object.values(CPT_REGISTRY).filter(c => c.code.startsWith(q));
}

export function searchIcd10ByKeyword(keyword: string): Icd10Code[] {
  const kw = keyword.toLowerCase();
  return Object.values(ICD10_REGISTRY).filter(c =>
    c.description.toLowerCase().includes(kw)
    || c.category.toLowerCase().includes(kw)
    || c.code.includes(kw),
  );
}

export function searchCptByKeyword(keyword: string): CptCode[] {
  const kw = keyword.toLowerCase();
  return Object.values(CPT_REGISTRY).filter(c =>
    c.description.toLowerCase().includes(kw),
  );
}

// ── Default CPT Codes ─────────────────────────────────────────────────────────

const DEFAULT_CPT: CptCode[] = [
  { code: '99201', description: 'Office/outpatient visit, new, low complexity', type: 'evaluation', rvu: 0.48, facilityPricing: 45, nonFacilityPricing: 76 },
  { code: '99202', description: 'Office/outpatient visit, new, moderate complexity', type: 'evaluation', rvu: 0.93, facilityPricing: 77, nonFacilityPricing: 125 },
  { code: '99203', description: 'Office/outpatient visit, new, high complexity', type: 'evaluation', rvu: 1.42, facilityPricing: 111, nonFacilityPricing: 184 },
  { code: '99204', description: 'Office/outpatient visit, new, very high complexity', type: 'evaluation', rvu: 2.00, facilityPricing: 178, nonFacilityPricing: 273 },
  { code: '99211', description: 'Office/outpatient visit, established, minimal', type: 'evaluation', rvu: 0.18, facilityPricing: 22, nonFacilityPricing: 45 },
  { code: '99212', description: 'Office/outpatient visit, established, low complexity', type: 'evaluation', rvu: 0.48, facilityPricing: 45, nonFacilityPricing: 76 },
  { code: '99213', description: 'Office/outpatient visit, established, moderate complexity', type: 'evaluation', rvu: 0.97, facilityPricing: 75, nonFacilityPricing: 130 },
  { code: '99214', description: 'Office/outpatient visit, established, high complexity', type: 'evaluation', rvu: 1.50, facilityPricing: 110, nonFacilityPricing: 185 },
  { code: '99215', description: 'Office/outpatient visit, established, very high complexity', type: 'evaluation', rvu: 2.11, facilityPricing: 148, nonFacilityPricing: 250 },
  { code: '99221', description: 'Initial hospital care, low complexity', type: 'evaluation', rvu: 1.14, facilityPricing: 88 },
  { code: '99222', description: 'Initial hospital care, moderate complexity', type: 'evaluation', rvu: 1.59, facilityPricing: 125 },
  { code: '99223', description: 'Initial hospital care, high complexity', type: 'evaluation', rvu: 2.29, facilityPricing: 178 },
  { code: '99231', description: 'Subsequent hospital care, low complexity', type: 'evaluation', rvu: 0.56, facilityPricing: 30 },
  { code: '99232', description: 'Subsequent hospital care, moderate complexity', type: 'evaluation', rvu: 0.88, facilityPricing: 55 },
  { code: '99233', description: 'Subsequent hospital care, high complexity', type: 'evaluation', rvu: 1.39, facilityPricing: 85 },
  { code: '99281', description: 'Emergency dept visit, low complexity', type: 'evaluation', rvu: 0.48 },
  { code: '99282', description: 'Emergency dept visit, moderate complexity', type: 'evaluation', rvu: 0.93 },
  { code: '99283', description: 'Emergency dept visit, high complexity', type: 'evaluation', rvu: 1.42 },
  { code: '99284', description: 'Emergency dept visit, very high complexity', type: 'evaluation', rvu: 2.00 },
  { code: '99285', description: 'Emergency dept visit, critical complexity', type: 'evaluation', rvu: 2.77 },
  { code: '99291', description: 'Critical care, first 30-74 minutes', type: 'critical_care', rvu: 4.17 },
  { code: '99292', description: 'Critical care, each additional 30 minutes', type: 'critical_care', rvu: 2.08 },
  { code: '99304', description: 'Nursing facility care, initial, low complexity', type: 'evaluation', rvu: 1.14 },
  { code: '99305', description: 'Nursing facility care, initial, moderate complexity', type: 'evaluation', rvu: 1.59 },
  { code: '99306', description: 'Nursing facility care, initial, high complexity', type: 'evaluation', rvu: 2.29 },
  { code: '99307', description: 'Nursing facility care, subsequent, low complexity', type: 'evaluation', rvu: 0.56 },
  { code: '99308', description: 'Nursing facility care, subsequent, moderate complexity', type: 'evaluation', rvu: 0.88 },
  { code: '99309', description: 'Nursing facility care, subsequent, high complexity', type: 'evaluation', rvu: 1.39 },
  { code: '99310', description: 'Nursing facility care, subsequent, very high complexity', type: 'evaluation', rvu: 2.22 },
  { code: '99341', description: 'Home visit, new, low complexity', type: 'evaluation', rvu: 0.82 },
  { code: '99342', description: 'Home visit, new, moderate complexity', type: 'evaluation', rvu: 1.39 },
  { code: '99344', description: 'Home visit, new, high complexity', type: 'evaluation', rvu: 2.00 },
  { code: '99345', description: 'Home visit, new, very high complexity', type: 'evaluation', rvu: 2.47 },
  { code: '99347', description: 'Home visit, established, low complexity', type: 'evaluation', rvu: 0.56 },
  { code: '99348', description: 'Home visit, established, moderate complexity', type: 'evaluation', rvu: 1.04 },
  { code: '99349', description: 'Home visit, established, high complexity', type: 'evaluation', rvu: 1.39 },
  { code: '99350', description: 'Home visit, established, very high complexity', type: 'evaluation', rvu: 2.11 },
  { code: '99381', description: 'Preventive visit, new, age <1', type: 'preventive', rvu: 1.25 },
  { code: '99382', description: 'Preventive visit, new, age 1-4', type: 'preventive', rvu: 1.36 },
  { code: '99383', description: 'Preventive visit, new, age 5-11', type: 'preventive', rvu: 1.47 },
  { code: '99384', description: 'Preventive visit, new, age 12-17', type: 'preventive', rvu: 1.58 },
  { code: '99385', description: 'Preventive visit, new, age 18-39', type: 'preventive', rvu: 1.69 },
  { code: '99386', description: 'Preventive visit, new, age 40-64', type: 'preventive', rvu: 1.80 },
  { code: '99387', description: 'Preventive visit, new, age 65+', type: 'preventive', rvu: 1.91 },
  { code: '99391', description: 'Preventive visit, established, age <1', type: 'preventive', rvu: 1.00 },
  { code: '99392', description: 'Preventive visit, established, age 1-4', type: 'preventive', rvu: 1.11 },
  { code: '99393', description: 'Preventive visit, established, age 5-11', type: 'preventive', rvu: 1.22 },
  { code: '99394', description: 'Preventive visit, established, age 12-17', type: 'preventive', rvu: 1.33 },
  { code: '99395', description: 'Preventive visit, established, age 18-39', type: 'preventive', rvu: 1.44 },
  { code: '99396', description: 'Preventive visit, established, age 40-64', type: 'preventive', rvu: 1.55 },
  { code: '99397', description: 'Preventive visit, established, age 65+', type: 'preventive', rvu: 1.66 },
  { code: '99417', description: 'Prolonged service, each 15 min', type: 'evaluation', rvu: 0.62 },
  { code: '99495', description: 'Transitional care management, moderate', type: 'evaluation', rvu: 2.11 },
  { code: '99496', description: 'Transitional care management, high', type: 'evaluation', rvu: 2.74 },
];

const DEFAULT_PNEUMONIA_ICD10: Icd10Code[] = [
  { code: 'J18.9', description: 'Pneumonia, unspecified organism', type: 'diagnosis', chapter: '10', category: 'J18', subcategory: 'J18.9', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J15.0', description: 'Pneumonia due to Klebsiella pneumoniae', type: 'diagnosis', chapter: '10', category: 'J15', subcategory: 'J15.0', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J15.1', description: 'Pneumonia due to Pseudomonas', type: 'diagnosis', chapter: '10', category: 'J15', subcategory: 'J15.1', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J15.2', description: 'Pneumonia due to Staphylococcus', type: 'diagnosis', chapter: '10', category: 'J15', subcategory: 'J15.2', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J15.3', description: 'Pneumonia due to Streptococcus group B', type: 'diagnosis', chapter: '10', category: 'J15', subcategory: 'J15.3', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J15.4', description: 'Pneumonia due to other streptococci', type: 'diagnosis', chapter: '10', category: 'J15', subcategory: 'J15.4', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J15.5', description: 'Pneumonia due to E. coli', type: 'diagnosis', chapter: '10', category: 'J15', subcategory: 'J15.5', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J15.6', description: 'Pneumonia due to other Gram-negative bacteria', type: 'diagnosis', chapter: '10', category: 'J15', subcategory: 'J15.6', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J15.7', description: 'Pneumonia due to Mycoplasma pneumoniae', type: 'diagnosis', chapter: '10', category: 'J15', subcategory: 'J15.7', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J15.8', description: 'Pneumonia due to other specified bacteria', type: 'diagnosis', chapter: '10', category: 'J15', subcategory: 'J15.8', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J15.9', description: 'Unspecified bacterial pneumonia', type: 'diagnosis', chapter: '10', category: 'J15', subcategory: 'J15.9', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J12.9', description: 'Viral pneumonia, unspecified', type: 'diagnosis', chapter: '10', category: 'J12', subcategory: 'J12.9', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J13', description: 'Pneumonia due to Streptococcus pneumoniae', type: 'diagnosis', chapter: '10', category: 'J13', subcategory: 'J13', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J14', description: 'Pneumonia due to Haemophilus influenzae', type: 'diagnosis', chapter: '10', category: 'J14', subcategory: 'J14', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'J16.8', description: 'Pneumonia due to other specified infectious organisms', type: 'diagnosis', chapter: '10', category: 'J16', subcategory: 'J16.8', billable: true, manifestation: false, forDiagnosis: ['pneumonia'] },
  { code: 'R05.1', description: 'Acute cough', type: 'symptom', chapter: '18', category: 'R05', subcategory: 'R05.1', billable: true, manifestation: false, forDiagnosis: ['cough'] },
  { code: 'R05.3', description: 'Chronic cough', type: 'symptom', chapter: '18', category: 'R05', subcategory: 'R05.3', billable: true, manifestation: false, forDiagnosis: ['cough'] },
  { code: 'R50.9', description: 'Fever, unspecified', type: 'symptom', chapter: '18', category: 'R50', subcategory: 'R50.9', billable: true, manifestation: false, forDiagnosis: ['fever'] },
  { code: 'R06.02', description: 'Shortness of breath', type: 'symptom', chapter: '18', category: 'R06', subcategory: 'R06.02', billable: true, manifestation: false, forDiagnosis: ['shortness of breath', 'dyspnea'] },
  { code: 'R11.2', description: 'Nausea with vomiting, unspecified', type: 'symptom', chapter: '18', category: 'R11', subcategory: 'R11.2', billable: true, manifestation: false, forDiagnosis: ['vomiting'] },
  { code: 'R19.7', description: 'Diarrhea, unspecified', type: 'symptom', chapter: '18', category: 'R19', subcategory: 'R19.7', billable: true, manifestation: false, forDiagnosis: ['diarrhea'] },
  { code: 'R10.9', description: 'Unspecified abdominal pain', type: 'symptom', chapter: '18', category: 'R10', subcategory: 'R10.9', billable: true, manifestation: false, forDiagnosis: ['abdominal pain'] },
  { code: 'R51', description: 'Headache', type: 'symptom', chapter: '18', category: 'R51', subcategory: 'R51', billable: true, manifestation: false, forDiagnosis: ['headache'] },
  { code: 'R52', description: 'Pain, unspecified', type: 'symptom', chapter: '18', category: 'R52', subcategory: 'R52', billable: true, manifestation: false, forDiagnosis: ['pain', 'body aches'] },
  { code: 'Z01.818', description: 'Encounter for other specified examination', type: 'factor', chapter: '21', category: 'Z01', subcategory: 'Z01.818', billable: true, manifestation: false, forDiagnosis: ['checkup', 'preventive'] },
];

for (const cpt of DEFAULT_CPT) registerCptCode(cpt);
for (const icd of DEFAULT_PNEUMONIA_ICD10) registerIcd10Code(icd);

// ── Billing Logic ─────────────────────────────────────────────────────────────

export interface BillingAssessmentConfig {
  encounterType: 'new' | 'established' | 'hospital' | 'emergency' | 'nursing_home' | 'home' | 'preventive' | 'critical_care' | 'consult'
  complexity: 'minimal' | 'low' | 'moderate' | 'high' | 'very_high' | 'critical'
  patientAge: number
  department: string
  timeSpentMinutes?: number
  prolongedService?: boolean
  diagnoses: string[]
  procedures: { cpt: string; units?: number }[]
  providerType?: string
}

export function suggestEvalCptCode(config: BillingAssessmentConfig): CptCode | null {
  const age = config.patientAge;

  if (config.encounterType === 'critical_care') {
    return getCptCode('99291') ?? null;
  }

  if (config.encounterType === 'preventive') {
    const pCodes = searchCptByCode('9938');
    const pCode = pCodes.find(c => {
      const ageRange = ageRangeForPreventive(c.code);
      return ageRange && age >= ageRange[0] && age <= ageRange[1];
    });
    return pCode || null;
  }

  const codePrefix = mapEncounterToCptPrefix(config.encounterType);
  const complexityCode = mapComplexityToCode(config.complexity);
  const code = `${codePrefix}${complexityCode}`;
  return getCptCode(code) ?? null;
}

export function generateBillingLineItems(config: BillingAssessmentConfig): BillingLineItem[] {
  const items: BillingLineItem[] = [];

  const evalCpt = suggestEvalCptCode(config);
  if (evalCpt) {
    items.push({
      cptCode: evalCpt.code,
      cptDescription: evalCpt.description,
      modifiers: [],
      units: 1,
      type: evalCpt.type,
      rvu: evalCpt.rvu,
      charge: evalCpt.nonFacilityPricing || evalCpt.facilityPricing || 0,
      diagnosisPointers: config.diagnoses.slice(0, 4),
    });
  }

  if (config.prolongedService && config.timeSpentMinutes && config.timeSpentMinutes > 60) {
    const prolongedCpt = getCptCode('99417');
    if (prolongedCpt) {
      const extraUnits = Math.floor((config.timeSpentMinutes - 60) / 15);
      items.push({
        cptCode: prolongedCpt.code,
        cptDescription: prolongedCpt.description,
        modifiers: [],
        units: Math.max(0, extraUnits),
        type: prolongedCpt.type,
        rvu: prolongedCpt.rvu * Math.max(0, extraUnits),
        charge: (prolongedCpt.nonFacilityPricing || 80) * Math.max(0, extraUnits),
        diagnosisPointers: config.diagnoses.slice(0, 4),
      });
    }
  }

  for (const proc of config.procedures) {
    const cpt = getCptCode(proc.cpt);
    if (cpt) {
      items.push({
        cptCode: cpt.code,
        cptDescription: cpt.description,
        modifiers: [],
        units: proc.units || 1,
        type: cpt.type,
        rvu: cpt.rvu * (proc.units || 1),
        charge: (cpt.nonFacilityPricing || cpt.facilityPricing || 0) * (proc.units || 1),
        diagnosisPointers: config.diagnoses.slice(0, 4),
      });
    }
  }

  return items;
}

export function suggestIcd10Codes(diagnosisKeywords: string[]): Icd10Code[] {
  const found: Icd10Code[] = [];
  const usedCodes = new Set<string>();

  for (const keyword of diagnosisKeywords) {
    const matches = searchIcd10ByKeyword(keyword);
    for (const match of matches) {
      if (!usedCodes.has(match.code)) {
        usedCodes.add(match.code);
        found.push(match);
      }
    }
  }

  return found;
}

export function calculateTotalCharge(items: BillingLineItem[]): number {
  return items.reduce((sum, item) => sum + item.charge, 0);
}

export function calculateTotalRvu(items: BillingLineItem[]): number {
  return items.reduce((sum, item) => sum + item.rvu, 0);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapEncounterToCptPrefix(encounterType: string): string {
  switch (encounterType) {
    case 'new': return '9920';
    case 'established': return '9921';
    case 'hospital': return '9922';
    case 'emergency': return '9928';
    case 'nursing_home': return '9930';
    case 'home': return '9934';
    case 'consult': return '9924';
    default: return '9921';
  }
}

function mapComplexityToCode(complexity: string): string {
  switch (complexity) {
    case 'minimal': return '1';
    case 'low': return '2';
    case 'moderate': return '3';
    case 'high': return '4';
    case 'very_high': return '5';
    default: return '2';
  }
}

function ageRangeForPreventive(code: string): [number, number] | null {
  const map: Record<string, [number, number]> = {
    '99381': [0, 0], '99382': [1, 4], '99383': [5, 11], '99384': [12, 17],
    '99385': [18, 39], '99386': [40, 64], '99387': [65, 120],
    '99391': [0, 0], '99392': [1, 4], '99393': [5, 11], '99394': [12, 17],
    '99395': [18, 39], '99396': [40, 64], '99397': [65, 120],
  };
  return map[code] || null;
}
