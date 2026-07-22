// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Vitals Interpretation Engine — age-specific intelligence
// ═══════════════════════════════════════════════════════════════════════════════
// Every vital sign is an intelligent object:
//   measurement → reference range → severity → interpretation → recommendation
// ═══════════════════════════════════════════════════════════════════════════════

import type { IntelligentVitals, VitalSignMeasurement, FindingTrend } from '../examination/examinationTypes';

// ── Age-specific reference ranges ──────────────────────────────────────────────

export interface VitalsReference {
  hr: { low: number; high: number; criticalLow: number; criticalHigh: number; label: string };
  rr: { low: number; high: number; criticalLow: number; criticalHigh: number; label: string };
  sbp: { low: number; high: number; criticalLow: number; criticalHigh: number; label: string };
  dbp: { low: number; high: number; criticalLow: number; criticalHigh: number; label: string };
  spo2: { low: number; criticalLow: number; label: string };
  temp: { low: number; high: number; criticalLow: number; criticalHigh: number; label: string };
  glucose: { fastingLow: number; fastingHigh: number; randomLow: number; randomHigh: number; criticalLow: number; criticalHigh: number; label: string };
}

const VITALS_REFERENCE_BY_AGE: Record<string, VitalsReference> = {
  // Neonate <1 month
  neonate: {
    hr: { low: 100, high: 160, criticalLow: 80, criticalHigh: 180, label: 'Neonate' },
    rr: { low: 30, high: 60, criticalLow: 20, criticalHigh: 70, label: 'Neonate' },
    sbp: { low: 60, high: 90, criticalLow: 50, criticalHigh: 100, label: 'Neonate' },
    dbp: { low: 30, high: 60, criticalLow: 25, criticalHigh: 65, label: 'Neonate' },
    spo2: { low: 95, criticalLow: 90, label: 'Neonate' },
    temp: { low: 36.0, high: 37.5, criticalLow: 35.5, criticalHigh: 38.0, label: 'Neonate' },
    glucose: { fastingLow: 2.5, fastingHigh: 5.5, randomLow: 2.5, randomHigh: 6.5, criticalLow: 2.2, criticalHigh: 8.0, label: 'Neonate' },
  },
  // Infant 1-12 months
  infant: {
    hr: { low: 100, high: 160, criticalLow: 80, criticalHigh: 180, label: 'Infant' },
    rr: { low: 24, high: 40, criticalLow: 20, criticalHigh: 50, label: 'Infant' },
    sbp: { low: 70, high: 100, criticalLow: 60, criticalHigh: 110, label: 'Infant' },
    dbp: { low: 40, high: 65, criticalLow: 35, criticalHigh: 70, label: 'Infant' },
    spo2: { low: 95, criticalLow: 90, label: 'Infant' },
    temp: { low: 36.0, high: 37.5, criticalLow: 35.5, criticalHigh: 38.5, label: 'Infant' },
    glucose: { fastingLow: 3.3, fastingHigh: 5.5, randomLow: 3.3, randomHigh: 6.5, criticalLow: 2.5, criticalHigh: 8.0, label: 'Infant' },
  },
  // Toddler 1-3 years
  toddler: {
    hr: { low: 90, high: 150, criticalLow: 70, criticalHigh: 170, label: 'Toddler' },
    rr: { low: 22, high: 34, criticalLow: 18, criticalHigh: 40, label: 'Toddler' },
    sbp: { low: 80, high: 105, criticalLow: 70, criticalHigh: 115, label: 'Toddler' },
    dbp: { low: 45, high: 70, criticalLow: 40, criticalHigh: 75, label: 'Toddler' },
    spo2: { low: 95, criticalLow: 90, label: 'Toddler' },
    temp: { low: 36.0, high: 37.5, criticalLow: 35.5, criticalHigh: 39.0, label: 'Toddler' },
    glucose: { fastingLow: 3.3, fastingHigh: 5.5, randomLow: 3.3, randomHigh: 7.0, criticalLow: 3.0, criticalHigh: 10.0, label: 'Toddler' },
  },
  // Preschool 3-6 years
  preschool: {
    hr: { low: 80, high: 140, criticalLow: 60, criticalHigh: 160, label: 'Preschool' },
    rr: { low: 20, high: 30, criticalLow: 16, criticalHigh: 35, label: 'Preschool' },
    sbp: { low: 85, high: 110, criticalLow: 75, criticalHigh: 120, label: 'Preschool' },
    dbp: { low: 50, high: 75, criticalLow: 45, criticalHigh: 80, label: 'Preschool' },
    spo2: { low: 95, criticalLow: 90, label: 'Preschool' },
    temp: { low: 36.0, high: 37.5, criticalLow: 35.5, criticalHigh: 39.0, label: 'Preschool' },
    glucose: { fastingLow: 3.3, fastingHigh: 5.5, randomLow: 3.3, randomHigh: 7.0, criticalLow: 3.0, criticalHigh: 10.0, label: 'Preschool' },
  },
  // School-age 6-12 years
  school: {
    hr: { low: 70, high: 120, criticalLow: 55, criticalHigh: 140, label: 'School-age' },
    rr: { low: 18, high: 28, criticalLow: 14, criticalHigh: 32, label: 'School-age' },
    sbp: { low: 90, high: 120, criticalLow: 80, criticalHigh: 130, label: 'School-age' },
    dbp: { low: 55, high: 80, criticalLow: 50, criticalHigh: 85, label: 'School-age' },
    spo2: { low: 95, criticalLow: 90, label: 'School-age' },
    temp: { low: 36.0, high: 37.5, criticalLow: 35.5, criticalHigh: 39.0, label: 'School-age' },
    glucose: { fastingLow: 3.3, fastingHigh: 5.6, randomLow: 3.3, randomHigh: 7.8, criticalLow: 3.0, criticalHigh: 11.0, label: 'School-age' },
  },
  // Adolescent 12-18 years
  adolescent: {
    hr: { low: 60, high: 100, criticalLow: 50, criticalHigh: 120, label: 'Adolescent' },
    rr: { low: 12, high: 20, criticalLow: 10, criticalHigh: 24, label: 'Adolescent' },
    sbp: { low: 100, high: 130, criticalLow: 90, criticalHigh: 140, label: 'Adolescent' },
    dbp: { low: 60, high: 85, criticalLow: 55, criticalHigh: 90, label: 'Adolescent' },
    spo2: { low: 95, criticalLow: 90, label: 'Adolescent' },
    temp: { low: 36.0, high: 37.5, criticalLow: 35.5, criticalHigh: 39.0, label: 'Adolescent' },
    glucose: { fastingLow: 3.9, fastingHigh: 5.6, randomLow: 3.9, randomHigh: 7.8, criticalLow: 3.0, criticalHigh: 11.0, label: 'Adolescent' },
  },
  // Adult >18 years
  adult: {
    hr: { low: 60, high: 100, criticalLow: 40, criticalHigh: 130, label: 'Adult' },
    rr: { low: 12, high: 20, criticalLow: 8, criticalHigh: 28, label: 'Adult' },
    sbp: { low: 90, high: 140, criticalLow: 80, criticalHigh: 180, label: 'Adult' },
    dbp: { low: 60, high: 90, criticalLow: 50, criticalHigh: 110, label: 'Adult' },
    spo2: { low: 95, criticalLow: 90, label: 'Adult' },
    temp: { low: 36.0, high: 37.5, criticalLow: 35.0, criticalHigh: 39.5, label: 'Adult' },
    glucose: { fastingLow: 3.9, fastingHigh: 6.1, randomLow: 3.9, randomHigh: 7.8, criticalLow: 3.0, criticalHigh: 11.1, label: 'Adult' },
  },
};

// ── Age-group resolution ───────────────────────────────────────────────────────

export function getVitalsAgeGroup(ageYears: number): keyof typeof VITALS_REFERENCE_BY_AGE {
  if (ageYears < 1 / 12) return 'neonate';
  if (ageYears < 1) return 'infant';
  if (ageYears < 3) return 'toddler';
  if (ageYears < 6) return 'preschool';
  if (ageYears < 12) return 'school';
  if (ageYears < 18) return 'adolescent';
  return 'adult';
}

export function getVitalsReference(ageYears: number): VitalsReference {
  const group = getVitalsAgeGroup(ageYears);
  return VITALS_REFERENCE_BY_AGE[group];
}

// ── Individual vital sign interpretation ───────────────────────────────────────

export function interpretHeartRate(value: number, ageYears: number, rhythm?: string): VitalSignMeasurement {
  const ref = getVitalsReference(ageYears);
  const { low, high, criticalLow, criticalHigh } = ref.hr;

  let severity: VitalSignMeasurement['severity'];
  let interpretation: string;

  if (value <= criticalLow) {
    severity = 'critical_low';
    interpretation = `Severe bradycardia (${value}/min) — critical in ${ref.hr.label}`;
  } else if (value < low) {
    severity = 'low';
    interpretation = `Bradycardia (${value}/min) — below expected range of ${low}-${high}`;
  } else if (value >= criticalHigh) {
    severity = 'critical_high';
    interpretation = `Severe tachycardia (${value}/min) — critical in ${ref.hr.label}`;
  } else if (value > high) {
    severity = 'elevated';
    interpretation = `Tachycardia (${value}/min) — above expected range of ${low}-${high}`;
  } else {
    severity = 'normal';
    interpretation = `Heart rate ${value}/min — within normal range (${low}-${high})`;
  }

  if (rhythm && rhythm !== 'regular') {
    interpretation += ` — rhythm: ${rhythm.replace('_', ' ')}`;
  }

  return { value, unit: '/min', lowNormal: low, highNormal: high, severity, interpretation };
}

export function interpretRespiratoryRate(value: number, ageYears: number, pattern?: string): VitalSignMeasurement {
  const ref = getVitalsReference(ageYears);
  const { low, high, criticalLow, criticalHigh } = ref.rr;

  let severity: VitalSignMeasurement['severity'];
  let interpretation: string;

  if (value <= criticalLow) {
    severity = 'critical_low';
    interpretation = `Severe bradypnoea (${value}/min) — critical in ${ref.rr.label}`;
  } else if (value < low) {
    severity = 'low';
    interpretation = `Bradypnoea (${value}/min) — below expected range of ${low}-${high}`;
  } else if (value >= criticalHigh) {
    severity = 'critical_high';
    interpretation = `Severe tachypnoea (${value}/min) — critical in ${ref.rr.label}`;
  } else if (value > high) {
    severity = 'elevated';
    interpretation = `Tachypnoea (${value}/min) — above expected range of ${low}-${high}`;
  } else {
    severity = 'normal';
    interpretation = `Respiratory rate ${value}/min — within normal range (${low}-${high})`;
  }

  if (pattern && pattern !== 'regular') {
    interpretation += ` — pattern: ${pattern.replace('_', ' ')}`;
  }

  return { value, unit: '/min', lowNormal: low, highNormal: high, severity, interpretation };
}

export function interpretBloodPressure(
  systolic: number,
  diastolic: number,
  ageYears: number
): { systolic: VitalSignMeasurement; diastolic: VitalSignMeasurement; map: number } {
  const ref = getVitalsReference(ageYears);

  const interpretSBP = (): VitalSignMeasurement => {
    const { low, high, criticalLow, criticalHigh } = ref.sbp;
    let severity: VitalSignMeasurement['severity'];
    let interpretation: string;

    if (systolic <= criticalLow) {
      severity = 'critical_low';
      interpretation = `Severe hypotension (SBP ${systolic} mmHg) — critical`;
    } else if (systolic < low) {
      severity = 'low';
      interpretation = `Hypotension (SBP ${systolic} mmHg) — below expected (${low}-${high})`;
    } else if (systolic >= criticalHigh) {
      severity = 'critical_high';
      interpretation = `Hypertensive urgency (SBP ${systolic} mmHg) — critical`;
    } else if (systolic > high) {
      severity = 'elevated';
      interpretation = `Elevated SBP (${systolic} mmHg) — above expected (${low}-${high})`;
    } else {
      severity = 'normal';
      interpretation = `SBP ${systolic} mmHg — within normal range`;
    }

    return { value: systolic, unit: 'mmHg', lowNormal: low, highNormal: high, severity, interpretation };
  };

  const interpretDBP = (): VitalSignMeasurement => {
    const { low, high, criticalLow, criticalHigh } = ref.dbp;
    let severity: VitalSignMeasurement['severity'];
    let interpretation: string;

    if (diastolic <= criticalLow) {
      severity = 'critical_low';
      interpretation = `Critical low DBP (${diastolic} mmHg)`;
    } else if (diastolic < low) {
      severity = 'low';
      interpretation = `Low DBP (${diastolic} mmHg) — below expected`;
    } else if (diastolic >= criticalHigh) {
      severity = 'critical_high';
      interpretation = `Hypertensive urgency (DBP ${diastolic} mmHg) — critical`;
    } else if (diastolic > high) {
      severity = 'elevated';
      interpretation = `Elevated DBP (${diastolic} mmHg) — above expected (${low}-${high})`;
    } else {
      severity = 'normal';
      interpretation = `DBP ${diastolic} mmHg — within normal range`;
    }

    return { value: diastolic, unit: 'mmHg', lowNormal: low, highNormal: high, severity, interpretation };
  };

  const map = diastolic + (systolic - diastolic) / 3;

  return { systolic: interpretSBP(), diastolic: interpretDBP(), map: Math.round(map) };
}

export function interpretSpO2(value: number, ageYears: number, onOxygen?: boolean): VitalSignMeasurement {
  const ref = getVitalsReference(ageYears);
  const { low, criticalLow } = ref.spo2;

  let severity: VitalSignMeasurement['severity'];
  let interpretation: string;

  if (value <= criticalLow) {
    severity = 'critical_low';
    interpretation = `Severe hypoxaemia (SpO₂ ${value}%) — critical`;
  } else if (value < low) {
    severity = 'elevated';
    interpretation = `Hypoxaemia (SpO₂ ${value}%) — below expected ≥${low}%`;
  } else if (value >= 98) {
    severity = 'normal';
    interpretation = `SpO₂ ${value}% — within normal range`;
  } else {
    severity = 'normal';
    interpretation = `SpO₂ ${value}% — adequate oxygenation`;
  }

  if (onOxygen) {
    interpretation += ' (on supplemental oxygen)';
  }

  return { value, unit: '%', lowNormal: low, highNormal: 100, severity, interpretation };
}

export function interpretTemperature(value: number, ageYears: number, method?: string): VitalSignMeasurement {
  const ref = getVitalsReference(ageYears);
  const { low, high, criticalLow, criticalHigh } = ref.temp;

  let severity: VitalSignMeasurement['severity'];
  let interpretation: string;

  if (value <= criticalLow) {
    severity = 'critical_low';
    interpretation = `Severe hypothermia (${value}°C) — critical`;
  } else if (value < low) {
    severity = 'low';
    interpretation = `Hypothermia (${value}°C) — below expected range`;
  } else if (value >= criticalHigh) {
    severity = 'critical_high';
    interpretation = `Severe hyperpyrexia (${value}°C) — critical`;
  } else if (value > high) {
    severity = 'elevated';
    interpretation = `Pyrexia (${value}°C) — above expected range (${low}-${high})`;
  } else {
    severity = 'normal';
    interpretation = `Temperature ${value}°C — within normal range`;
  }

  if (method) interpretation += ` (${method})`;

  return { value, unit: '°C', lowNormal: low, highNormal: high, severity, interpretation };
}

export function interpretBloodGlucose(value: number, ageYears: number, fasting?: boolean): VitalSignMeasurement {
  const ref = getVitalsReference(ageYears);
  const { criticalLow, criticalHigh } = ref.glucose;
  const low = fasting ? ref.glucose.fastingLow : ref.glucose.randomLow;
  const high = fasting ? ref.glucose.fastingHigh : ref.glucose.randomHigh;

  let severity: VitalSignMeasurement['severity'];
  let interpretation: string;

  if (value <= criticalLow) {
    severity = 'critical_low';
    interpretation = `Severe hypoglycaemia (${value} mmol/L) — critical`;
  } else if (value < low) {
    severity = 'low';
    interpretation = `Hypoglycaemia (${value} mmol/L) — below expected (${low}-${high})`;
  } else if (value >= criticalHigh) {
    severity = 'critical_high';
    interpretation = `Severe hyperglycaemia (${value} mmol/L) — critical`;
  } else if (value > high) {
    severity = 'elevated';
    interpretation = `Hyperglycaemia (${value} mmol/L) — above expected (${low}-${high})`;
  } else {
    severity = 'normal';
    interpretation = `Blood glucose ${value} mmol/L — within normal range`;
  }

  if (fasting !== undefined) interpretation += fasting ? ' (fasting)' : ' (random)';

  return { value, unit: 'mmol/L', lowNormal: low, highNormal: high, severity, interpretation };
}

export function interpretCapillaryRefill(seconds: number): { value: number; unit: 'seconds'; normal: boolean; interpretation: string } {
  const normal = seconds < 2;
  return {
    value: seconds,
    unit: 'seconds',
    normal,
    interpretation: normal
      ? `Capillary refill ${seconds}s — normal (<2s)`
      : `Prolonged capillary refill ${seconds}s — abnormal (≥2s), suggests reduced peripheral perfusion`,
  };
}

export function interpretAVPU(avpu: 'alert' | 'voice' | 'pain' | 'unresponsive'): { value: string; severity: VitalSignMeasurement['severity']; interpretation: string } {
  switch (avpu) {
    case 'alert': return { value: avpu, severity: 'normal', interpretation: 'AVPU: Alert — conscious level normal' };
    case 'voice': return { value: avpu, severity: 'low', interpretation: 'AVPU: Responds to Voice — reduced consciousness' };
    case 'pain': return { value: avpu, severity: 'elevated', interpretation: 'AVPU: Responds to Pain — significantly reduced consciousness' };
    case 'unresponsive': return { value: avpu, severity: 'critical_low', interpretation: 'AVPU: Unresponsive — critical, immediate intervention required' };
  }
}

export function interpretGCS(eye: number, verbal: number, motor: number): { eye: number; verbal: number; motor: number; total: number; interpretation: string } {
  const total = eye + verbal + motor;
  let interpretation: string;
  if (total <= 8) interpretation = `GCS ${total}/15 — severe brain injury (≤8, consider intubation)`;
  else if (total <= 12) interpretation = `GCS ${total}/15 — moderate brain injury`;
  else if (total <= 14) interpretation = `GCS ${total}/15 — mild brain injury`;
  else interpretation = `GCS ${total}/15 — normal consciousness`;
  return { eye, verbal, motor, total, interpretation };
}

// ── Full vitals panel interpretation ───────────────────────────────────────────

export interface VitalsPanelResult {
  ageGroup: string;
  temperature?: VitalSignMeasurement & { method?: string };
  heartRate?: VitalSignMeasurement & { rhythm?: string };
  respiratoryRate?: VitalSignMeasurement & { pattern?: string };
  bloodPressure?: { systolic: VitalSignMeasurement; diastolic: VitalSignMeasurement; map: number };
  spo2?: VitalSignMeasurement & { onOxygen?: boolean };
  painScore?: { value: number; max: number; scale: string; interpretation: string };
  bloodGlucose?: VitalSignMeasurement & { fasting?: boolean };
  capillaryRefill?: { value: number; unit: 'seconds'; normal: boolean; interpretation: string };
  avpu?: { value: string; severity: VitalSignMeasurement['severity']; interpretation: string };
  gcs?: { eye: number; verbal: number; motor: number; total: number; interpretation: string };
  urineOutput?: VitalSignMeasurement & { periodHours: number };
  allNormal: boolean;
  criticalFindings: string[];
  summary: string;
}

export function interpretAllVitals(
  vitals: IntelligentVitals,
  ageYears: number
): VitalsPanelResult {
  const ageGroup = getVitalsAgeGroup(ageYears);
  const criticalFindings: string[] = [];
  let allNormal = true;

  const result: VitalsPanelResult = {
    ageGroup,
    allNormal: true,
    criticalFindings: [],
    summary: '',
  };

  if (vitals.heartRate !== undefined) {
    const hr = interpretHeartRate(vitals.heartRate.value, ageYears, vitals.heartRate.rhythm);
    result.heartRate = { ...hr, rhythm: vitals.heartRate.rhythm };
    if (hr.severity !== 'normal') allNormal = false;
    if (hr.severity === 'critical_high' || hr.severity === 'critical_low') criticalFindings.push(hr.interpretation);
  }

  if (vitals.respiratoryRate !== undefined) {
    const rr = interpretRespiratoryRate(vitals.respiratoryRate.value, ageYears, vitals.respiratoryRate.pattern);
    result.respiratoryRate = { ...rr, pattern: vitals.respiratoryRate.pattern };
    if (rr.severity !== 'normal') allNormal = false;
    if (rr.severity === 'critical_high' || rr.severity === 'critical_low') criticalFindings.push(rr.interpretation);
  }

  if (vitals.bloodPressure !== undefined) {
    const bp = interpretBloodPressure(vitals.bloodPressure.systolic.value, vitals.bloodPressure.diastolic.value, ageYears);
    result.bloodPressure = bp;
    result.bloodPressure.map = bp.map;
    if (bp.systolic.severity !== 'normal') allNormal = false;
    if (bp.diastolic.severity !== 'normal') allNormal = false;
    if (bp.systolic.severity === 'critical_high' || bp.systolic.severity === 'critical_low') criticalFindings.push(bp.systolic.interpretation);
    if (bp.diastolic.severity === 'critical_high' || bp.diastolic.severity === 'critical_low') criticalFindings.push(bp.diastolic.interpretation);
  }

  if (vitals.spo2 !== undefined) {
    const spo2 = interpretSpO2(vitals.spo2.value, ageYears, vitals.spo2.onOxygen);
    result.spo2 = { ...spo2, onOxygen: vitals.spo2.onOxygen };
    if (spo2.severity !== 'normal') allNormal = false;
    if (spo2.severity === 'critical_low') criticalFindings.push(spo2.interpretation);
  }

  if (vitals.temperature !== undefined) {
    const temp = interpretTemperature(vitals.temperature.value, ageYears, vitals.temperature.method);
    result.temperature = { ...temp, method: vitals.temperature.method };
    if (temp.severity !== 'normal') allNormal = false;
    if (temp.severity === 'critical_high' || temp.severity === 'critical_low') criticalFindings.push(temp.interpretation);
  }

  if (vitals.bloodGlucose !== undefined) {
    const bg = interpretBloodGlucose(vitals.bloodGlucose.value, ageYears, vitals.bloodGlucose.fasting);
    result.bloodGlucose = { ...bg, fasting: vitals.bloodGlucose.fasting };
    if (bg.severity !== 'normal') allNormal = false;
    if (bg.severity === 'critical_high' || bg.severity === 'critical_low') criticalFindings.push(bg.interpretation);
  }

  if (vitals.painScore !== undefined) {
    const severity = vitals.painScore.value <= 3 ? 'mild' : vitals.painScore.value <= 6 ? 'moderate' : 'severe';
    result.painScore = {
      ...vitals.painScore,
      interpretation: `${vitals.painScore.value}/${vitals.painScore.max} on ${vitals.painScore.scale} — ${severity} pain`,
    };
    if (vitals.painScore.value > 3) allNormal = false;
  }

  if (vitals.capillaryRefill !== undefined) {
    result.capillaryRefill = interpretCapillaryRefill(vitals.capillaryRefill.value);
    if (!result.capillaryRefill.normal) {
      allNormal = false;
      criticalFindings.push(result.capillaryRefill.interpretation);
    }
  }

  if (vitals.avpu) {
    result.avpu = interpretAVPU(vitals.avpu);
    if (result.avpu.severity !== 'normal') {
      allNormal = false;
      if (result.avpu.severity === 'critical_low') criticalFindings.push(result.avpu.interpretation);
    }
  }

  if (vitals.gcs) {
    result.gcs = interpretGCS(vitals.gcs.eye, vitals.gcs.verbal, vitals.gcs.motor);
    if (vitals.gcs.total <= 12) {
      allNormal = false;
      if (vitals.gcs.total <= 8) criticalFindings.push(result.gcs.interpretation);
    }
  }

  result.allNormal = allNormal;
  result.criticalFindings = criticalFindings;

  // Summary
  if (criticalFindings.length > 0) {
    result.summary = `${criticalFindings.length} critical vital sign finding(s): ${criticalFindings.join('; ')}`;
  } else if (!allNormal) {
    result.summary = 'Vital signs show non-critical abnormalities requiring attention';
  } else {
    result.summary = 'All vital signs within expected range for age';
  }

  return result;
}
