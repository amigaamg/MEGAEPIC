// ═══════════════════════════════════════════════════════════════
// AMEXAN Universal Anthropometry & Growth Engine (UPGAE)
// Constitutional Volume — Examination Subsystem
// ═══════════════════════════════════════════════════════════════

import {
  interpretGrowth,
  interpretAdultBmi,
  interpretAdultMuac,
  computeCorrectedAge,
  getExpectedRange,
  type GrowthIndicator,
  type GrowthInterpretation,
  type Sex,
  type AdultBmiInterpretation,
} from './growth-standards';

export type AgeBand = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export interface PatientGrowthContext {
  ageMonths: number;
  ageBand: AgeBand;
  sex: Sex;
  pregnant: boolean;
  gestationalWeeksAtBirth?: number;
  knownDiseases: string[];
  activeModules: string[];
  chiefComplaints: string[];
  hasPreviousMeasurements: boolean;
}

export interface RawMeasurement {
  id: string;
  value: number;
  unit: string;
  measuredAt?: number;
  equipment?: string;
  reliability?: 'reliable' | 'estimated' | 'unreliable';
}

export interface AnthropometryMeasurement {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  interpretation: GrowthInterpretation | AdultBmiInterpretation | null;
  visibility: 'visible' | 'hidden' | 'overridden';
  overrideReason?: string;
  required: boolean;
}

export interface AnthropometryEngineOutput {
  measurements: AnthropometryMeasurement[];
  narrative: string;
  alerts: AnthropometryAlert[];
  growthVelocity?: GrowthVelocityAnalysis;
  summary: string;
}

export interface AnthropometryAlert {
  measurementId: string;
  severity: 'info' | 'caution' | 'warning' | 'critical';
  message: string;
}

export interface GrowthVelocityAnalysis {
  weightVelocity?: string;
  heightVelocity?: string;
  hcVelocity?: string;
  alerts: string[];
}

// ─── Age band resolution ───

export function getAgeBand(ageMonths: number): AgeBand {
  if (ageMonths <= 1) return 'neonate';
  if (ageMonths <= 12) return 'infant';
  if (ageMonths <= 36) return 'toddler';
  if (ageMonths <= 144) return 'child';
  if (ageMonths <= 216) return 'adolescent';
  if (ageMonths <= 720) return 'adult';
  return 'elderly';
}

// ─── Disease-based override rules ───

const DISEASE_OVERRIDES: Record<string, {
  showMeasurements: string[];
  reason: string;
}> = {
  cerebral_palsy: {
    showMeasurements: ['head_circumference', 'height', 'weight'],
    reason: 'Neurology follow-up — head growth monitoring',
  },
  hydrocephalus: {
    showMeasurements: ['head_circumference'],
    reason: 'Hydrocephalus follow-up — head circumference surveillance',
  },
  microcephaly: {
    showMeasurements: ['head_circumference'],
    reason: 'Microcephaly follow-up — head circumference surveillance',
  },
  macrocephaly: {
    showMeasurements: ['head_circumference'],
    reason: 'Macrocephaly follow-up — head circumference surveillance',
  },
  developmental_delay: {
    showMeasurements: ['head_circumference', 'height', 'weight'],
    reason: 'Developmental delay — growth monitoring',
  },
  epilepsy: {
    showMeasurements: ['head_circumference'],
    reason: 'Seizure disorder — neurological growth monitoring',
  },
  genetic_syndrome: {
    showMeasurements: ['head_circumference', 'height', 'weight'],
    reason: 'Genetic syndrome — growth surveillance',
  },
  malnutrition: {
    showMeasurements: ['weight', 'height', 'muac', 'head_circumference'],
    reason: 'Malnutrition — detailed anthropometric monitoring',
  },
  sam: {
    showMeasurements: ['weight', 'height', 'muac'],
    reason: 'Severe Acute Malnutrition — therapeutic monitoring',
  },
  hiv: {
    showMeasurements: ['weight', 'height', 'muac'],
    reason: 'HIV — growth monitoring per visit',
  },
  tb: {
    showMeasurements: ['weight', 'muac'],
    reason: 'Tuberculosis — weight monitoring',
  },
  ckd: {
    showMeasurements: ['height', 'weight'],
    reason: 'Chronic Kidney Disease — height velocity monitoring',
  },
  sickle_cell: {
    showMeasurements: ['weight', 'height'],
    reason: 'Sickle Cell Disease — growth monitoring per visit',
  },
  down_syndrome: {
    showMeasurements: ['weight', 'height', 'head_circumference'],
    reason: 'Down Syndrome — growth surveillance (WHO Down-specific charts)',
  },
  cancer: {
    showMeasurements: ['weight', 'height', 'muac'],
    reason: 'Oncology — nutritional monitoring',
  },
  eating_disorder: {
    showMeasurements: ['weight', 'bmi', 'muac'],
    reason: 'Eating disorder — weight and nutritional monitoring',
  },
};

// ─── Module-based override rules ───

const MODULE_OVERRIDES: Record<string, {
  showMeasurements: string[];
  reason: string;
}> = {
  neurological: {
    showMeasurements: ['head_circumference'],
    reason: 'Neurology module active — head circumference',
  },
  nutrition: {
    showMeasurements: ['weight', 'height', 'muac', 'head_circumference'],
    reason: 'Nutrition module active — full anthropometry',
  },
  neonatology: {
    showMeasurements: ['weight', 'height', 'head_circumference', 'chest_circumference'],
    reason: 'Neonatal assessment — complete measurements',
  },
};

// ─── Measurement definitions with age visibility rules ───

interface MeasurementDef {
  id: string;
  label: string;
  unit: string;
  indicator?: GrowthIndicator;
  showForAgeBands: AgeBand[];
  hideForAgeBands?: AgeBand[];
  alwaysShowForDiseases?: string[];
  alwaysShowForModules?: string[];
  alwaysShow?: boolean;
  required: boolean;
  allowOverride: boolean;
}

const MEASUREMENT_DEFS: MeasurementDef[] = [
  {
    id: 'weight', label: 'Weight', unit: 'kg',
    indicator: 'weight_for_age',
    showForAgeBands: ['neonate', 'infant', 'toddler', 'child', 'adolescent', 'adult', 'elderly'],
    required: true, allowOverride: false,
  },
  {
    id: 'length', label: 'Recumbent Length', unit: 'cm',
    indicator: 'length_for_age',
    showForAgeBands: ['neonate', 'infant', 'toddler'],
    hideForAgeBands: ['child', 'adolescent', 'adult', 'elderly'],
    required: true, allowOverride: false,
  },
  {
    id: 'height', label: 'Standing Height', unit: 'cm',
    indicator: 'height_for_age',
    showForAgeBands: ['toddler', 'child', 'adolescent', 'adult', 'elderly'],
    hideForAgeBands: ['neonate', 'infant'],
    required: true, allowOverride: false,
  },
  {
    id: 'head_circumference', label: 'Head Circumference', unit: 'cm',
    indicator: 'head_circumference_for_age',
    showForAgeBands: ['neonate', 'infant', 'toddler', 'child'],
    hideForAgeBands: ['adolescent', 'adult', 'elderly'],
    alwaysShowForDiseases: ['cerebral_palsy', 'hydrocephalus', 'microcephaly', 'macrocephaly',
      'developmental_delay', 'epilepsy', 'genetic_syndrome', 'down_syndrome', 'neurocutaneous',
      'raised_icp', 'follow_up_neurology'],
    alwaysShowForModules: ['neurological', 'nutrition', 'neonatology'],
    required: false, allowOverride: true,
  },
  {
    id: 'muac', label: 'Mid-Upper Arm Circumference', unit: 'cm',
    indicator: 'muac_for_age',
    showForAgeBands: ['infant', 'toddler', 'child'],
    hideForAgeBands: ['neonate', 'adolescent', 'adult', 'elderly'],
    alwaysShowForDiseases: ['sam', 'mam', 'malnutrition', 'hiv', 'tb', 'cancer',
      'eating_disorder', 'ckd'],
    alwaysShowForModules: ['nutrition', 'neonatology'],
    required: false, allowOverride: true,
  },
  {
    id: 'bmi', label: 'BMI', unit: 'kg/m²',
    indicator: 'bmi_for_age',
    showForAgeBands: ['toddler', 'child', 'adolescent', 'adult', 'elderly'],
    hideForAgeBands: ['neonate', 'infant'],
    alwaysShowForDiseases: ['eating_disorder', 'obesity', 'overweight', 'underweight'],
    required: false, allowOverride: false,
    alwaysShow: false,
  },
  {
    id: 'chest_circumference', label: 'Chest Circumference', unit: 'cm',
    showForAgeBands: ['neonate', 'infant'],
    required: false, allowOverride: false,
  },
];

// ─── Measurement visibility resolver ───

export function resolveMeasurementVisibility(
  ctx: PatientGrowthContext,
): { id: string; visible: boolean; reason?: string }[] {
  return MEASUREMENT_DEFS.map(def => {
    const ageBand = ctx.ageBand;

    // Check disease overrides
    if (def.alwaysShowForDiseases) {
      for (const disease of ctx.knownDiseases) {
        if (def.alwaysShowForDiseases.includes(disease)) {
          return { id: def.id, visible: true, reason: DISEASE_OVERRIDES[disease]?.reason };
        }
      }
    }

    // Check module overrides
    if (def.alwaysShowForModules) {
      for (const module of ctx.activeModules) {
        if (def.alwaysShowForModules.includes(module)) {
          return { id: def.id, visible: true, reason: MODULE_OVERRIDES[module]?.reason };
        }
      }
    }

    // Complaint-based overrides
    if (def.id === 'head_circumference') {
      const neuroComplaints = ['developmental delay', 'seizure', 'head injury', 'hydrocephalus', 'raised icp', 'neurology'];
      for (const comp of ctx.chiefComplaints) {
        if (neuroComplaints.some(nc => comp.toLowerCase().includes(nc))) {
          return { id: def.id, visible: true, reason: 'Neurological complaint — head circumference indicated' };
        }
      }
    }

    // Age band visibility
    if (def.hideForAgeBands?.includes(ageBand)) {
      return { id: def.id, visible: false };
    }

    if (def.showForAgeBands.includes(ageBand)) {
      return { id: def.id, visible: true };
    }

    return { id: def.id, visible: false };
  });
}

// ─── BMI auto-calculation ───

export function calculateBmi(weightKg: number | null, heightCm: number | null): number | null {
  if (weightKg == null || heightCm == null || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 100) / 100;
}

// ─── Length vs Height switching ───

export function getLengthOrHeightLabel(ageBand: AgeBand): string {
  if (ageBand === 'neonate' || ageBand === 'infant' || (ageBand === 'toddler' && ageBand === 'toddler')) {
    return 'Recumbent Length';
  }
  return 'Standing Height';
}

// ─── Velocity analysis helpers ───

export interface PreviousMeasurement {
  id: string;
  value: number;
  ageMonths: number;
  date: string;
}

export function computeGrowthVelocity(
  current: number,
  previous: PreviousMeasurement,
  ageIntervalMonths: number,
): string {
  if (!previous || ageIntervalMonths <= 0) return 'Insufficient data for velocity calculation';
  const difference = current - previous.value;
  const monthlyRate = difference / ageIntervalMonths;
  return `${difference > 0 ? '+' : ''}${difference.toFixed(1)} over ${ageIntervalMonths.toFixed(1)}mo (${monthlyRate.toFixed(2)}/mo)`;
}

export function checkCentileCrossing(
  currentZScore: number,
  previousZScore: number,
): string | null {
  const diff = currentZScore - previousZScore;
  if (diff < -1.0) return `Alert: Growth deceleration — Z-score dropped by ${Math.abs(diff).toFixed(1)}. Clinical evaluation warranted.`;
  if (diff > 1.5) return `Alert: Rapid growth acceleration — Z-score increased by ${diff.toFixed(1)}. Assess for endocrine or nutritional changes.`;
  if (diff < -0.67) return `Caution: Downward centile crossing detected. Monitor growth trajectory.`;
  return null;
}

// ─── Main UPGAE processor ───

export function processAnthropometry(
  ctx: PatientGrowthContext,
  rawValues: Record<string, number | null>,
  previousMeasurements?: Record<string, PreviousMeasurement>,
): AnthropometryEngineOutput {
  const visibility = resolveMeasurementVisibility(ctx);
  const visibilityMap = new Map(visibility.map(v => [v.id, v]));

  const measurements: AnthropometryMeasurement[] = [];
  const alerts: AnthropometryAlert[] = [];
  const narrativeParts: string[] = [];

  let weightVal = rawValues['weight'] ?? null;
  let lengthVal = rawValues['length'] ?? null;
  let heightVal = rawValues['height'] ?? null;
  const hcVal = rawValues['head_circumference'] ?? null;
  const muacVal = rawValues['muac'] ?? null;

  // Auto-calculate BMI
  const bmiVal = calculateBmi(weightVal, heightVal || lengthVal);
  const effectiveHeight = heightVal || lengthVal;

  for (const vis of visibility) {
    const def = MEASUREMENT_DEFS.find(m => m.id === vis.id);
    if (!def) continue;

    let rawValue: number | null = null;
    if (vis.id === 'weight') rawValue = weightVal;
    else if (vis.id === 'length') rawValue = lengthVal;
    else if (vis.id === 'height') rawValue = heightVal;
    else if (vis.id === 'head_circumference') rawValue = hcVal;
    else if (vis.id === 'muac') rawValue = muacVal;
    else if (vis.id === 'bmi') rawValue = bmiVal;
    else if (vis.id === 'chest_circumference') rawValue = rawValues['chest_circumference'] ?? null;

    let interpretation: GrowthInterpretation | AdultBmiInterpretation | null = null;

    if (rawValue != null && vis.visible) {
      if (vis.id === 'bmi') {
        if (ctx.ageBand === 'adult' || ctx.ageBand === 'elderly') {
          interpretation = interpretAdultBmi(rawValue, ctx.sex);
        } else if (ctx.ageBand !== 'neonate' && ctx.ageBand !== 'infant' && def.indicator) {
          const isHeight = ctx.ageBand === 'toddler' && ctx.ageMonths >= 24;
          interpretation = interpretGrowth(
            def.indicator,
            rawValue,
            ctx.ageMonths,
            ctx.sex,
            { gestationalWeeksAtBirth: ctx.gestationalWeeksAtBirth },
          );
        }
      } else if (vis.id === 'muac' && (ctx.ageBand === 'adult' || ctx.ageBand === 'elderly')) {
        interpretation = interpretAdultMuac(rawValue, ctx.sex, ctx.pregnant);
      } else if (def.indicator) {
        const useHeight = (vis.id === 'height' || vis.id === 'weight') && ctx.ageMonths >= 24;
        interpretation = interpretGrowth(
          def.indicator,
          rawValue,
          ctx.ageMonths,
          ctx.sex,
          {
            gestationalWeeksAtBirth: ctx.gestationalWeeksAtBirth,
            lengthCm: lengthVal ?? undefined,
            heightCm: heightVal ?? undefined,
          },
        );
      }
    }

    measurements.push({
      id: vis.id,
      label: def.label,
      value: rawValue,
      unit: def.unit,
      interpretation,
      visibility: vis.visible ? 'visible' : 'hidden',
      overrideReason: vis.reason,
      required: def.required,
    });

    if (interpretation && 'alertLevel' in interpretation) {
      if (interpretation.alertLevel === 'critical' || interpretation.alertLevel === 'warning') {
        alerts.push({
          measurementId: vis.id,
          severity: interpretation.alertLevel === 'critical' ? 'critical' : 'warning',
          message: interpretation.narrative,
        });
      }
    }

    if (interpretation) {
      narrativeParts.push(interpretation.narrative);
    }
  }

  // Growth velocity analysis
  let velocityAnalysis: GrowthVelocityAnalysis | undefined;
  if (previousMeasurements) {
    const velocityAlerts: string[] = [];
    let weightVelocity: string | undefined;
    let heightVelocity: string | undefined;
    let hcVelocity: string | undefined;

    if (weightVal != null && previousMeasurements['weight']) {
      const prev = previousMeasurements['weight'];
      const interval = (ctx.ageMonths - prev.ageMonths) || 1;
      weightVelocity = computeGrowthVelocity(weightVal, prev, interval);
    }
    if (effectiveHeight != null && previousMeasurements['height']) {
      const prev = previousMeasurements['height'];
      const interval = (ctx.ageMonths - prev.ageMonths) || 1;
      heightVelocity = computeGrowthVelocity(effectiveHeight, prev, interval);
    }
    if (hcVal != null && previousMeasurements['head_circumference']) {
      const prev = previousMeasurements['head_circumference'];
      const interval = (ctx.ageMonths - prev.ageMonths) || 1;
      hcVelocity = computeGrowthVelocity(hcVal, prev, interval);
    }

    velocityAnalysis = { weightVelocity, heightVelocity, hcVelocity, alerts: velocityAlerts };
  }

  // Summary
  const totalRequired = measurements.filter(m => m.required).length;
  const totalCaptured = measurements.filter(m => m.value != null && m.visibility === 'visible').length;
  const summary = totalCaptured >= totalRequired
    ? 'All required anthropometric measurements captured.'
    : `Anthropometry: ${totalCaptured}/${totalRequired} required measurements captured.`;

  const narrative = narrativeParts.length > 0
    ? `**Anthropometry:** ${narrativeParts.join(' ')}`
    : 'Anthropometry pending.';

  return { measurements, narrative, alerts, growthVelocity: velocityAnalysis, summary };
}
