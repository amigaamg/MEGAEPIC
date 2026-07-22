// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Anthropometry Engine — WHO-standard growth analysis
// ═══════════════════════════════════════════════════════════════════════════════
// Single authority for:
//   - Age/sex-specific reference ranges
//   - WHO Z-score computation
//   - Percentile calculation
//   - Growth interpretation (normal, SAM, MAM, overweight, obese, microcephaly)
//   - Automated commentary generation
// ═══════════════════════════════════════════════════════════════════════════════

import type { GrowthMeasurement, Anthropometry } from '../examination/examinationTypes';

// ── WHO Reference LMS tables (Lambda-Mu-Sigma) ─────────────────────────────────
// Simplified LMS parameters for common age/sex groups.
// In production, these would be loaded from WHO .txt reference files.

interface LMS {
  l: number;  // Box-Cox power
  m: number;  // Median
  s: number;  // Coefficient of variation
}

// ── Weight-for-age LMS (0-60 months) ─────────────────────────────────────────

const WEIGHT_FOR_AGE_BOYS: Record<number, LMS> = {
  0:   { l: 0.3487, m: 3.3464, s: 0.14602 },
  3:   { l: 0.2293, m: 6.0434, s: 0.11685 },
  6:   { l: 0.1069, m: 7.9320, s: 0.10228 },
  12:  { l: 0.0226, m: 9.6480, s: 0.09174 },
  24:  { l: -0.0846, m: 12.2015, s: 0.08891 },
  36:  { l: -0.1474, m: 14.1285, s: 0.09095 },
  48:  { l: -0.1914, m: 15.9285, s: 0.09450 },
  60:  { l: -0.2239, m: 17.9235, s: 0.10177 },
};

const WEIGHT_FOR_AGE_GIRLS: Record<number, LMS> = {
  0:   { l: 0.3809, m: 3.2322, s: 0.14329 },
  3:   { l: 0.1746, m: 5.5310, s: 0.11317 },
  6:   { l: 0.0428, m: 7.3150, s: 0.09903 },
  12:  { l: -0.0214, m: 8.9520, s: 0.09033 },
  24:  { l: -0.0890, m: 11.5090, s: 0.08964 },
  36:  { l: -0.1292, m: 13.4565, s: 0.09243 },
  48:  { l: -0.1594, m: 15.2460, s: 0.09718 },
  60:  { l: -0.1845, m: 17.1155, s: 0.10382 },
};

// ── Length/Height-for-age LMS (0-60 months) ──────────────────────────────────

const LENGTH_FOR_AGE_BOYS: Record<number, LMS> = {
  0:   { l: 1, m: 49.8842, s: 0.03795 },
  3:   { l: 1, m: 60.2799, s: 0.03546 },
  6:   { l: 1, m: 66.5175, s: 0.03410 },
  12:  { l: 1, m: 75.3546, s: 0.03279 },
  24:  { l: 1, m: 86.4810, s: 0.03331 },
  36:  { l: 1, m: 95.3822, s: 0.03496 },
  48:  { l: 1, m: 102.6873, s: 0.03645 },
  60:  { l: 1, m: 108.7436, s: 0.03796 },
};

const LENGTH_FOR_AGE_GIRLS: Record<number, LMS> = {
  0:   { l: 1, m: 49.2861, s: 0.03679 },
  3:   { l: 1, m: 58.9421, s: 0.03469 },
  6:   { l: 1, m: 65.1071, s: 0.03363 },
  12:  { l: 1, m: 73.8333, s: 0.03272 },
  24:  { l: 1, m: 85.1100, s: 0.03388 },
  36:  { l: 1, m: 94.2180, s: 0.03561 },
  48:  { l: 1, m: 101.6317, s: 0.03733 },
  60:  { l: 1, m: 107.8400, s: 0.03905 },
};

// ── Head circumference-for-age LMS (0-24 months) ────────────────────────────

const HC_FOR_AGE_BOYS: Record<number, LMS> = {
  0:   { l: 1, m: 34.4618, s: 0.03486 },
  3:   { l: 1, m: 40.5228, s: 0.02864 },
  6:   { l: 1, m: 43.2545, s: 0.02622 },
  12:  { l: 1, m: 46.0846, s: 0.02469 },
  24:  { l: 1, m: 48.2783, s: 0.02426 },
};

const HC_FOR_AGE_GIRLS: Record<number, LMS> = {
  0:   { l: 1, m: 33.8786, s: 0.03496 },
  3:   { l: 1, m: 39.5720, s: 0.02845 },
  6:   { l: 1, m: 42.1148, s: 0.02643 },
  12:  { l: 1, m: 44.9948, s: 0.02528 },
  24:  { l: 1, m: 47.2604, s: 0.02506 },
};

// ── MUAC-for-age LMS (6-60 months) ──────────────────────────────────────────

const MUAC_FOR_AGE_BOYS: Record<number, LMS> = {
  6:  { l: 0.124, m: 14.35, s: 0.0865 },
  12: { l: 0.097, m: 14.96, s: 0.0862 },
  24: { l: 0.052, m: 15.48, s: 0.0850 },
  36: { l: 0.025, m: 15.74, s: 0.0854 },
  48: { l: 0.005, m: 15.94, s: 0.0870 },
  60: { l: -0.010, m: 16.16, s: 0.0885 },
};

const MUAC_FOR_AGE_GIRLS: Record<number, LMS> = {
  6:  { l: 0.110, m: 14.02, s: 0.0885 },
  12: { l: 0.084, m: 14.65, s: 0.0889 },
  24: { l: 0.040, m: 15.21, s: 0.0882 },
  36: { l: 0.016, m: 15.47, s: 0.0888 },
  48: { l: -0.003, m: 15.66, s: 0.0910 },
  60: { l: -0.018, m: 15.90, s: 0.0930 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function interpolateLMS(table: Record<number, LMS>, ageMonths: number): LMS {
  const ages = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (ageMonths <= ages[0]) return table[ages[0]];
  if (ageMonths >= ages[ages.length - 1]) return table[ages[ages.length - 1]];

  let lower = ages[0];
  let upper = ages[ages.length - 1];
  for (let i = 0; i < ages.length - 1; i++) {
    if (ageMonths >= ages[i] && ageMonths <= ages[i + 1]) {
      lower = ages[i];
      upper = ages[i + 1];
      break;
    }
  }

  const lmsLower = table[lower];
  const lmsUpper = table[upper];
  const ratio = (ageMonths - lower) / (upper - lower);

  return {
    l: lmsLower.l + (lmsUpper.l - lmsLower.l) * ratio,
    m: lmsLower.m + (lmsUpper.m - lmsLower.m) * ratio,
    s: lmsLower.s + (lmsUpper.s - lmsLower.s) * ratio,
  };
}

function computeZScore(value: number, lms: LMS): number {
  if (lms.l === 0) {
    return Math.log(value / lms.m) / lms.s;
  }
  return (Math.pow(value / lms.m, lms.l) - 1) / (lms.l * lms.s);
}

function computePercentile(z: number): number {
  // Approximation using the error function
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);
  const t = 1 / (1 + p * z);
  const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return 50 * (1 + sign * erf);
}

function computeExpected(lms: LMS): number {
  return lms.m;
}

// ── Age-specific reference ranges ──────────────────────────────────────────────

function getAgeGroup(ageMonths: number): string {
  if (ageMonths < 1) return 'Neonate';
  if (ageMonths < 12) return 'Infant';
  if (ageMonths < 24) return 'Toddler';
  if (ageMonths < 72) return 'Early childhood';
  if (ageMonths < 144) return 'Childhood';
  if (ageMonths < 216) return 'Adolescent';
  return 'Adult';
}

function getNormalVitalRange(ageYears: number): {
  hr: { low: number; high: number };
  rr: { low: number; high: number };
  sbp: { low: number; high: number };
  dbp: { low: number; high: number };
} {
  if (ageYears < 1) return { hr: { low: 100, high: 160 }, rr: { low: 30, high: 60 }, sbp: { low: 60, high: 90 }, dbp: { low: 30, high: 60 } };
  if (ageYears < 3) return { hr: { low: 90, high: 150 }, rr: { low: 24, high: 40 }, sbp: { low: 80, high: 100 }, dbp: { low: 40, high: 65 } };
  if (ageYears < 6) return { hr: { low: 80, high: 140 }, rr: { low: 22, high: 34 }, sbp: { low: 85, high: 105 }, dbp: { low: 45, high: 70 } };
  if (ageYears < 12) return { hr: { low: 70, high: 120 }, rr: { low: 18, high: 30 }, sbp: { low: 90, high: 115 }, dbp: { low: 55, high: 80 } };
  if (ageYears < 18) return { hr: { low: 60, high: 100 }, rr: { low: 12, high: 20 }, sbp: { low: 100, high: 130 }, dbp: { low: 60, high: 85 } };
  return { hr: { low: 60, high: 100 }, rr: { low: 12, high: 20 }, sbp: { low: 90, high: 140 }, dbp: { low: 60, high: 90 } };
}

// ── Public API ─────────────────────────────────────────────────────────────────

export interface AnthropometryResult {
  measurement: GrowthMeasurement;
  zScore: number;
  percentile: number;
  expected: number;
  interpretation: string;
  severity: 'normal' | 'borderline' | 'abnormal' | 'critical';
}

export interface AnthropometryReport {
  ageMonths: number;
  sex: 'male' | 'female';
  ageGroup: string;
  weight?: AnthropometryResult;
  height?: AnthropometryResult;
  length?: AnthropometryResult;
  headCircumference?: AnthropometryResult;
  muac?: AnthropometryResult;
  bmi?: AnthropometryResult & { bmiValue: number };
  chestCircumference?: AnthropometryResult;
  commentary: string[];
  overallAssessment: string;
}

// ── Main analysis function ─────────────────────────────────────────────────────

export function analyzeAnthropometry(
  anthropometry: Anthropometry,
  ageMonths: number,
  sex: 'male' | 'female'
): AnthropometryReport {
  const report: AnthropometryReport = {
    ageMonths,
    sex,
    ageGroup: getAgeGroup(ageMonths),
    commentary: [],
    overallAssessment: 'Normal growth parameters.',
  };

  const results: AnthropometryResult[] = [];

  // ── Weight-for-age ────────────────────────────────────────────────────
  if (anthropometry.weight && ageMonths <= 60) {
    const table = sex === 'male' ? WEIGHT_FOR_AGE_BOYS : WEIGHT_FOR_AGE_GIRLS;
    const lms = interpolateLMS(table, ageMonths);
    const z = computeZScore(anthropometry.weight.value, lms);
    const expectedValue = computeExpected(lms);
    const result: AnthropometryResult = {
      measurement: anthropometry.weight,
      zScore: Math.round(z * 100) / 100,
      percentile: Math.round(computePercentile(z) * 10) / 10,
      expected: Math.round(expectedValue * 100) / 100,
      interpretation: interpretWeight(z, ageMonths),
      severity: zToSeverity(z, 2, 3),
    };
    report.weight = result;
    results.push(result);
  } else if (anthropometry.weight) {
    // Adults — simple BMI or weight interpretation
    report.weight = {
      measurement: anthropometry.weight,
      zScore: 0,
      percentile: 50,
      expected: 0,
      interpretation: `Weight: ${anthropometry.weight.value} kg`,
      severity: 'normal',
    };
  }

  // ── Length/Height-for-age ─────────────────────────────────────────────
  const lengthOrHeight = anthropometry.length || anthropometry.height;
  if (lengthOrHeight && ageMonths <= 60) {
    const table = sex === 'male' ? LENGTH_FOR_AGE_BOYS : LENGTH_FOR_AGE_GIRLS;
    const lms = interpolateLMS(table, ageMonths);
    const z = computeZScore(lengthOrHeight.value, lms);
    const expectedValue = computeExpected(lms);
    const result: AnthropometryResult = {
      measurement: lengthOrHeight,
      zScore: Math.round(z * 100) / 100,
      percentile: Math.round(computePercentile(z) * 10) / 10,
      expected: Math.round(expectedValue * 100) / 100,
      interpretation: interpretLength(z),
      severity: zToSeverity(z, 2, 3),
    };
    report.height = result;
    results.push(result);
  }

  // ── Head circumference ────────────────────────────────────────────────
  if (anthropometry.headCircumference && ageMonths <= 24) {
    const table = sex === 'male' ? HC_FOR_AGE_BOYS : HC_FOR_AGE_GIRLS;
    const lms = interpolateLMS(table, ageMonths);
    const z = computeZScore(anthropometry.headCircumference.value, lms);
    const expectedValue = computeExpected(lms);
    const result: AnthropometryResult = {
      measurement: anthropometry.headCircumference,
      zScore: Math.round(z * 100) / 100,
      percentile: Math.round(computePercentile(z) * 10) / 10,
      expected: Math.round(expectedValue * 100) / 100,
      interpretation: interpretHC(z),
      severity: zToSeverity(z, 2, 3),
    };
    report.headCircumference = result;
    results.push(result);
  }

  // ── MUAC ───────────────────────────────────────────────────────────────
  if (anthropometry.muac && ageMonths >= 6 && ageMonths <= 60) {
    const table = sex === 'male' ? MUAC_FOR_AGE_BOYS : MUAC_FOR_AGE_GIRLS;
    const lms = interpolateLMS(table, ageMonths);
    const z = computeZScore(anthropometry.muac.value, lms);
    const expectedValue = computeExpected(lms);
    const result: AnthropometryResult = {
      measurement: anthropometry.muac,
      zScore: Math.round(z * 100) / 100,
      percentile: Math.round(computePercentile(z) * 10) / 10,
      expected: Math.round(expectedValue * 100) / 100,
      interpretation: interpretMUAC(anthropometry.muac.value),
      severity: zToSeverity(z, 2, 3),
    };
    report.muac = result;
    results.push(result);
  }

  // ── BMI ────────────────────────────────────────────────────────────────
  if (anthropometry.bmi) {
    const bmiValue = anthropometry.bmi.value;
    let interpretation = interpretBMI(bmiValue, ageMonths);
    report.bmi = {
      measurement: anthropometry.bmi,
      zScore: 0,
      percentile: 50,
      expected: 0,
      interpretation,
      severity: bmiToSeverity(bmiValue, ageMonths),
      bmiValue,
    };
    results.push(report.bmi);
  }

  // ── Generate commentary ────────────────────────────────────────────────
  report.commentary = generateGrowthCommentary(report, results);

  // ── Overall assessment ─────────────────────────────────────────────────
  const worst = results.reduce((worst, r) => {
    const order = ['normal', 'borderline', 'abnormal', 'critical'];
    return order.indexOf(r.severity) > order.indexOf(worst) ? r.severity : worst;
  }, 'normal' as AnthropometryResult['severity']);

  if (worst === 'critical') report.overallAssessment = 'Critical anthropometric findings — requires immediate intervention.';
  else if (worst === 'abnormal') report.overallAssessment = 'Abnormal growth parameters — requires further assessment.';
  else if (worst === 'borderline') report.overallAssessment = 'Growth parameters at lower limit of normal — monitor closely.';
  else report.overallAssessment = 'All growth parameters within normal limits.';

  return report;
}

// ── Interpretation helpers ─────────────────────────────────────────────────────

function interpretWeight(z: number, ageMonths: number): string {
  if (z < -3) return 'Severely underweight (Z-score < -3)';
  if (z < -2) return 'Underweight (Z-score < -2)';
  if (z > 2 && ageMonths < 60) return 'Above expected range (Z-score > 2)';
  if (z > 3) return 'Severely overweight (Z-score > 3)';
  return 'Weight appropriate for age';
}

function interpretLength(z: number): string {
  if (z < -3) return 'Severe stunting (Z-score < -3)';
  if (z < -2) return 'Stunted (Z-score < -2)';
  if (z > 2) return 'Tall stature (Z-score > 2)';
  return 'Length/height appropriate for age';
}

function interpretHC(z: number): string {
  if (z < -3) return 'Severe microcephaly (Z-score < -3)';
  if (z < -2) return 'Microcephaly (Z-score < -2)';
  if (z > 2) return 'Macrocephaly (Z-score > 2)';
  return 'Head circumference within normal range';
}

function interpretMUAC(value: number): string {
  if (value < 11.5) return 'Severe acute malnutrition (MUAC < 11.5 cm)';
  if (value < 12.5) return 'Moderate acute malnutrition (MUAC 11.5–12.4 cm)';
  if (value < 13.5) return 'At risk of malnutrition (MUAC 12.5–13.4 cm)';
  return 'Normal nutritional status';
}

function interpretBMI(value: number, ageMonths: number): string {
  if (ageMonths < 24) return 'BMI not routinely interpreted under 2 years';
  if (ageMonths < 216) {
    if (value < 16) return 'Severe thinness';

    if (value < 18.5) return 'Underweight';
    if (value < 25) return 'Normal weight';
    if (value < 30) return 'Overweight';
    if (value < 35) return 'Obese Class I';
    if (value < 40) return 'Obese Class II';
    return 'Obese Class III (severe obesity)';
  }
  return `BMI: ${value.toFixed(1)} kg/m²`;
}

// ── Severity mapping ───────────────────────────────────────────────────────────

function zToSeverity(z: number, warnThreshold: number, critThreshold: number): AnthropometryResult['severity'] {
  const absZ = Math.abs(z);
  if (absZ >= critThreshold) return 'critical';
  if (absZ >= warnThreshold) return 'abnormal';
  if (absZ >= warnThreshold - 0.5) return 'borderline';
  return 'normal';
}

function bmiToSeverity(value: number, ageMonths: number): AnthropometryResult['severity'] {
  if (ageMonths < 24) return 'normal';
  if (ageMonths < 216) {
    if (value < 16) return 'critical';
    if (value < 18.5) return 'abnormal';
    if (value >= 30) return 'abnormal';
    return 'normal';
  }
  if (value < 16) return 'critical';
  if (value < 18.5) return 'abnormal';
  if (value >= 40) return 'critical';
  if (value >= 30) return 'abnormal';
  return 'normal';
}

// ── Commentary generation ──────────────────────────────────────────────────────

function generateGrowthCommentary(report: AnthropometryReport, results: AnthropometryResult[]): string[] {
  const commentary: string[] = [];

  if (results.length === 0) {
    commentary.push('No growth measurements recorded.');
    return commentary;
  }

  if (report.weight) {
    const w = report.weight;
    if (w.severity === 'normal') {
      commentary.push(`Weight is appropriate for age (${w.measurement.value} kg, expected ${w.expected} kg, Z-score ${w.zScore}).`);
    } else {
      commentary.push(`Weight: ${w.measurement.value} kg (expected ${w.expected} kg, Z-score ${w.zScore}). ${w.interpretation}.`);
    }
  }

  if (report.height) {
    const h = report.height;
    if (h.severity === 'normal') {
      commentary.push(`Height follows expected growth trajectory (${h.measurement.value} cm, expected ${h.expected} cm, Z-score ${h.zScore}).`);
    } else {
      commentary.push(`Height: ${h.measurement.value} cm (expected ${h.expected} cm, Z-score ${h.zScore}). ${h.interpretation}.`);
    }
  }

  if (report.headCircumference) {
    const hc = report.headCircumference;
    commentary.push(`Head circumference: ${hc.measurement.value} cm (expected ${hc.expected} cm, Z-score ${hc.zScore}). ${hc.interpretation}.`);
  }

  if (report.muac) {
    const m = report.muac;
    commentary.push(`MUAC: ${m.measurement.value} cm (Z-score ${m.zScore}). ${m.interpretation}.`);
  }

  if (report.bmi) {
    commentary.push(`BMI: ${report.bmi.bmiValue?.toFixed(1)} kg/m². ${report.bmi.interpretation}.`);
  }

  // Growth pattern assessment
  if (report.weight && report.height) {
    const wZ = report.weight.zScore;
    const hZ = report.height.zScore;
    if (Math.abs(wZ - hZ) > 2) {
      if (wZ < hZ) commentary.push('Weight-for-height indicates wasting — disproportionate weight deficit relative to height.');
      if (wZ > hZ) commentary.push('Weight exceeds expected for height — suggests overweight/obesity.');
    }
  }

  return commentary;
}

// ── Reference range queries ────────────────────────────────────────────────────

export function getExpectedWeight(ageMonths: number, sex: 'male' | 'female'): number | null {
  if (ageMonths > 60) return null;
  const table = sex === 'male' ? WEIGHT_FOR_AGE_BOYS : WEIGHT_FOR_AGE_GIRLS;
  const lms = interpolateLMS(table, ageMonths);
  return Math.round(computeExpected(lms) * 100) / 100;
}

export function getExpectedLength(ageMonths: number, sex: 'male' | 'female'): number | null {
  if (ageMonths > 60) return null;
  const table = sex === 'male' ? LENGTH_FOR_AGE_BOYS : LENGTH_FOR_AGE_GIRLS;
  const lms = interpolateLMS(table, ageMonths);
  return Math.round(computeExpected(lms) * 100) / 100;
}

export function getExpectedHC(ageMonths: number, sex: 'male' | 'female'): number | null {
  if (ageMonths > 24) return null;
  const table = sex === 'male' ? HC_FOR_AGE_BOYS : HC_FOR_AGE_GIRLS;
  const lms = interpolateLMS(table, ageMonths);
  return Math.round(computeExpected(lms) * 100) / 100;
}

export { getNormalVitalRange, getAgeGroup };
