export type NormalReferenceCategory =
  | 'vital_signs'
  | 'hematology'
  | 'chemistry'
  | 'endocrine'
  | 'cardiac'
  | 'hepatic'
  | 'renal'
  | 'coagulation'
  | 'microbiology'
  | 'immunology'
  | 'therapeutic_drug'
  | 'urinalysis'
  | 'arterial_blood_gas'

export interface NormalReferenceValue {
  testId: string
  testName: string
  category: NormalReferenceCategory
  unit: string
  low?: number
  high?: number
  criticalLow?: number
  criticalHigh?: number
  ageRanges?: {
    ageMin: number
    ageMax: number
    ageUnit: 'years' | 'months' | 'days'
    low?: number
    high?: number
  }[]
  sexSpecific?: {
    sex: 'male' | 'female'
    low?: number
    high?: number
  }[]
  pregnancyAdjustment?: {
    trimester: 'first' | 'second' | 'third'
    low?: number
    high?: number
  }[]
  textRange?: string
  interpretiveGuidance?: string
  panicValue?: boolean
}

export interface ReferenceQuery {
  testId: string
  age: number
  ageUnit: 'years' | 'months' | 'days'
  sex: 'male' | 'female' | 'other'
  pregnant?: boolean
  trimester?: 'first' | 'second' | 'third'
}

export interface ReferenceResult {
  testId: string
  testName: string
  unit: string
  low?: number
  high?: number
  criticalLow?: number
  criticalHigh?: number
  interpretiveGuidance?: string
  adjustedFor: string[]
}

const REFERENCE_LIBRARY: Record<string, NormalReferenceValue> = {};

export function registerReferenceValue(value: NormalReferenceValue): void {
  REFERENCE_LIBRARY[value.testId] = value;
}

export function registerReferenceValues(values: NormalReferenceValue[]): void {
  for (const v of values) {
    REFERENCE_LIBRARY[v.testId] = v;
  }
}

export function getReferenceValue(testId: string): NormalReferenceValue | undefined {
  return REFERENCE_LIBRARY[testId];
}

export function getNormalRange(query: ReferenceQuery): ReferenceResult | null {
  const ref = REFERENCE_LIBRARY[query.testId];
  if (!ref) return null;

  const adjustedFor: string[] = [];
  let low = ref.low;
  let high = ref.high;
  let criticalLow = ref.criticalLow;
  let criticalHigh = ref.criticalHigh;

  const ageInYears = query.ageUnit === 'years' ? query.age
    : query.ageUnit === 'months' ? query.age / 12
    : query.age / 365;

  if (ref.ageRanges && ref.ageRanges.length > 0) {
    for (const range of ref.ageRanges) {
      const rangeMax = range.ageUnit === 'years' ? range.ageMax
        : range.ageUnit === 'months' ? range.ageMax / 12
        : range.ageMax / 365;
      const rangeMin = range.ageUnit === 'years' ? range.ageMin
        : range.ageUnit === 'months' ? range.ageMin / 12
        : range.ageMin / 365;

      if (ageInYears >= rangeMin && ageInYears <= rangeMax) {
        low = range.low ?? low;
        high = range.high ?? high;
        adjustedFor.push(`age_${query.age}${query.ageUnit}`);
        break;
      }
    }
  }

  if (ref.sexSpecific && query.sex !== 'other') {
    for (const spec of ref.sexSpecific) {
      if (spec.sex === query.sex) {
        low = spec.low ?? low;
        high = spec.high ?? high;
        adjustedFor.push(`sex_${query.sex}`);
        break;
      }
    }
  }

  if (query.pregnant && ref.pregnancyAdjustment && query.trimester) {
    for (const adj of ref.pregnancyAdjustment) {
      if (adj.trimester === query.trimester) {
        low = adj.low ?? low;
        high = adj.high ?? high;
        adjustedFor.push(`pregnancy_${query.trimester}_trimester`);
        break;
      }
    }
  }

  return {
    testId: ref.testId,
    testName: ref.testName,
    unit: ref.unit,
    low,
    high,
    criticalLow,
    criticalHigh,
    interpretiveGuidance: ref.interpretiveGuidance,
    adjustedFor,
  };
}

export function isWithinNormalRange(value: number, range: ReferenceResult): 'normal' | 'low' | 'high' | 'critical_low' | 'critical_high' {
  if (range.criticalLow !== undefined && value < range.criticalLow) return 'critical_low';
  if (range.criticalHigh !== undefined && value > range.criticalHigh) return 'critical_high';
  if (range.low !== undefined && value < range.low) return 'low';
  if (range.high !== undefined && value > range.high) return 'high';
  return 'normal';
}

export function getReferenceSuggestions(category: NormalReferenceCategory): NormalReferenceValue[] {
  return Object.values(REFERENCE_LIBRARY).filter(v => v.category === category);
}

// ── Default reference ranges ──────────────────────────────────────────────────

const DEFAULT_VITAL_SIGNS: NormalReferenceValue[] = [
  {
    testId: 'hr', testName: 'Heart Rate', category: 'vital_signs', unit: 'bpm',
    low: 60, high: 100, criticalLow: 40, criticalHigh: 140,
    ageRanges: [
      { ageMin: 0, ageMax: 1, ageUnit: 'days', low: 100, high: 160 },
      { ageMin: 1, ageMax: 12, ageUnit: 'months', low: 80, high: 140 },
      { ageMin: 1, ageMax: 5, ageUnit: 'years', low: 80, high: 120 },
      { ageMin: 6, ageMax: 12, ageUnit: 'years', low: 70, high: 110 },
      { ageMin: 13, ageMax: 17, ageUnit: 'years', low: 60, high: 105 },
      { ageMin: 18, ageMax: 120, ageUnit: 'years', low: 60, high: 100 },
    ],
  },
  {
    testId: 'rr', testName: 'Respiratory Rate', category: 'vital_signs', unit: 'breaths/min',
    low: 12, high: 20, criticalLow: 8, criticalHigh: 30,
    ageRanges: [
      { ageMin: 0, ageMax: 1, ageUnit: 'days', low: 30, high: 60 },
      { ageMin: 1, ageMax: 12, ageUnit: 'months', low: 20, high: 40 },
      { ageMin: 1, ageMax: 5, ageUnit: 'years', low: 20, high: 30 },
      { ageMin: 6, ageMax: 12, ageUnit: 'years', low: 16, high: 24 },
      { ageMin: 13, ageMax: 17, ageUnit: 'years', low: 14, high: 22 },
      { ageMin: 18, ageMax: 120, ageUnit: 'years', low: 12, high: 20 },
    ],
  },
  {
    testId: 'sbp', testName: 'Systolic Blood Pressure', category: 'vital_signs', unit: 'mmHg',
    low: 90, high: 120, criticalLow: 70, criticalHigh: 200,
    ageRanges: [
      { ageMin: 0, ageMax: 1, ageUnit: 'days', low: 50, high: 80 },
      { ageMin: 1, ageMax: 12, ageUnit: 'months', low: 80, high: 100 },
      { ageMin: 1, ageMax: 5, ageUnit: 'years', low: 80, high: 110 },
      { ageMin: 6, ageMax: 12, ageUnit: 'years', low: 90, high: 115 },
      { ageMin: 13, ageMax: 17, ageUnit: 'years', low: 100, high: 125 },
      { ageMin: 18, ageMax: 120, ageUnit: 'years', low: 90, high: 120 },
    ],
  },
  {
    testId: 'dbp', testName: 'Diastolic Blood Pressure', category: 'vital_signs', unit: 'mmHg',
    low: 60, high: 80, criticalHigh: 120,
  },
  {
    testId: 'temp', testName: 'Temperature', category: 'vital_signs', unit: '°C',
    low: 36.0, high: 37.5, criticalLow: 35.0, criticalHigh: 40.0,
  },
  {
    testId: 'spo2', testName: 'Oxygen Saturation', category: 'vital_signs', unit: '%',
    low: 95, high: 100, criticalLow: 90,
  },
  {
    testId: 'gcs', testName: 'Glasgow Coma Scale', category: 'vital_signs', unit: '',
    low: 15, high: 15, criticalLow: 8,
  },
];

const DEFAULT_LABS: NormalReferenceValue[] = [
  {
    testId: 'hb', testName: 'Hemoglobin', category: 'hematology', unit: 'g/dL',
    low: 13.5, high: 17.5, criticalLow: 7.0,
    sexSpecific: [
      { sex: 'male', low: 13.5, high: 17.5 },
      { sex: 'female', low: 12.0, high: 15.5 },
    ],
    pregnancyAdjustment: [
      { trimester: 'first', low: 11.0, high: 14.5 },
      { trimester: 'second', low: 10.5, high: 14.0 },
      { trimester: 'third', low: 10.0, high: 14.0 },
    ],
  },
  {
    testId: 'wbc', testName: 'White Blood Cell Count', category: 'hematology', unit: 'x10^9/L',
    low: 4.0, high: 11.0, criticalLow: 1.0, criticalHigh: 30.0,
    ageRanges: [
      { ageMin: 0, ageMax: 1, ageUnit: 'days', low: 9.0, high: 30.0 },
      { ageMin: 1, ageMax: 12, ageUnit: 'months', low: 6.0, high: 17.5 },
      { ageMin: 1, ageMax: 5, ageUnit: 'years', low: 5.5, high: 15.5 },
      { ageMin: 6, ageMax: 12, ageUnit: 'years', low: 4.5, high: 13.5 },
      { ageMin: 13, ageMax: 17, ageUnit: 'years', low: 4.5, high: 11.5 },
    ],
    pregnancyAdjustment: [
      { trimester: 'first', low: 5.0, high: 14.0 },
      { trimester: 'second', low: 6.0, high: 16.0 },
      { trimester: 'third', low: 6.0, high: 16.0 },
    ],
  },
  {
    testId: 'plt', testName: 'Platelet Count', category: 'hematology', unit: 'x10^9/L',
    low: 150, high: 450, criticalLow: 50, criticalHigh: 900,
    pregnancyAdjustment: [
      { trimester: 'second', low: 130, high: 400 },
      { trimester: 'third', low: 120, high: 380 },
    ],
  },
  {
    testId: 'crp', testName: 'C-Reactive Protein', category: 'chemistry', unit: 'mg/L',
    low: 0, high: 5, criticalHigh: 100,
  },
  {
    testId: 'esr', testName: 'Erythrocyte Sedimentation Rate', category: 'chemistry', unit: 'mm/hr',
    low: 0, high: 15, criticalHigh: 100,
    sexSpecific: [
      { sex: 'male', low: 0, high: 15 },
      { sex: 'female', low: 0, high: 20 },
    ],
  },
  {
    testId: 'na', testName: 'Sodium', category: 'chemistry', unit: 'mmol/L',
    low: 135, high: 145, criticalLow: 120, criticalHigh: 160,
  },
  {
    testId: 'k', testName: 'Potassium', category: 'chemistry', unit: 'mmol/L',
    low: 3.5, high: 5.0, criticalLow: 2.5, criticalHigh: 6.5,
  },
  {
    testId: 'cr', testName: 'Creatinine', category: 'renal', unit: 'umol/L',
    low: 60, high: 110, criticalHigh: 400,
    sexSpecific: [
      { sex: 'male', low: 60, high: 110 },
      { sex: 'female', low: 45, high: 90 },
    ],
  },
  {
    testId: 'bun', testName: 'Blood Urea Nitrogen', category: 'renal', unit: 'mmol/L',
    low: 2.5, high: 7.5, criticalHigh: 30,
  },
  {
    testId: 'alt', testName: 'Alanine Aminotransferase', category: 'hepatic', unit: 'U/L',
    low: 0, high: 40, criticalHigh: 1000,
  },
  {
    testId: 'ast', testName: 'Aspartate Aminotransferase', category: 'hepatic', unit: 'U/L',
    low: 0, high: 40, criticalHigh: 1000,
  },
  {
    testId: 'inr', testName: 'International Normalized Ratio', category: 'coagulation', unit: '',
    low: 0.8, high: 1.2, criticalHigh: 5.0,
    interpretiveGuidance: 'Therapeutic range for anticoagulation: 2.0-3.0',
  },
  {
    testId: 'lactate', testName: 'Lactate', category: 'chemistry', unit: 'mmol/L',
    low: 0.5, high: 2.0, criticalHigh: 4.0,
  },
  {
    testId: 'procalcitonin', testName: 'Procalcitonin', category: 'chemistry', unit: 'ng/mL',
    low: 0, high: 0.5, criticalHigh: 2.0,
    interpretiveGuidance: '>0.5 suggests bacterial infection; >2.0 suggests severe sepsis',
  },
  {
    testId: 'hba1c', testName: 'Hemoglobin A1c', category: 'endocrine', unit: '%',
    low: 4.0, high: 5.7, criticalHigh: 12.0,
    interpretiveGuidance: '5.7-6.4% prediabetes; >=6.5% diabetes',
  },
  {
    testId: 'tsh', testName: 'Thyroid Stimulating Hormone', category: 'endocrine', unit: 'mIU/L',
    low: 0.4, high: 4.0, criticalLow: 0.01, criticalHigh: 50,
    pregnancyAdjustment: [
      { trimester: 'first', low: 0.2, high: 2.5 },
      { trimester: 'second', low: 0.3, high: 3.0 },
      { trimester: 'third', low: 0.3, high: 3.5 },
    ],
  },
];

registerReferenceValues(DEFAULT_VITAL_SIGNS);
registerReferenceValues(DEFAULT_LABS);

export function initializeDefaultReferences(): void {
  // Already registered at module load
}
