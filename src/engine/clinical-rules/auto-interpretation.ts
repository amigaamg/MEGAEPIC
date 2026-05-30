export interface LabResult {
  testId: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: [number, number];
}

export interface Interpretation {
  testName: string;
  value: number;
  unit: string;
  flag: 'normal' | 'abnormal' | 'critical';
  interpretation: string;
  ddxImpact: number;
}

const THRESHOLDS: Record<string, {
  low?: { critical: number; abnormal: number };
  high?: { abnormal: number; critical: number };
  interpretation: (value: number, flag: string) => string;
  ddxImpact: (value: number, flag: string) => number;
}> = {
  'wbc': {
    high: { abnormal: 11, critical: 25 },
    interpretation: (v, f) => f === 'critical' ? 'Marked leukocytosis — concerning for sepsis or perforation'
      : f === 'abnormal' ? 'Leukocytosis — supports infectious/inflammatory process'
      : 'WBC within normal range',
    ddxImpact: (v, f) => f === 'critical' ? 20 : f === 'abnormal' ? 15 : -5,
  },
  'crp': {
    high: { abnormal: 10, critical: 200 },
    interpretation: (v, f) => f === 'critical' ? 'Markedly elevated CRP — severe inflammation or sepsis'
      : f === 'abnormal' ? 'Elevated CRP — active inflammation'
      : 'CRP normal',
    ddxImpact: (v, f) => f === 'critical' ? 15 : f === 'abnormal' ? 10 : -3,
  },
  'neutrophils': {
    high: { abnormal: 75, critical: 95 },
    interpretation: (v, f) => f === 'abnormal' ? 'Neutrophilia — suggests bacterial infection'
      : 'Neutrophils within normal range',
    ddxImpact: (v, f) => f === 'abnormal' ? 10 : -2,
  },
  'lactate': {
    high: { abnormal: 2, critical: 4 },
    interpretation: (v, f) => f === 'critical' ? 'Lactic acidosis — tissue hypoperfusion, sepsis concern'
      : f === 'abnormal' ? 'Mildly elevated lactate — consider early sepsis'
      : 'Lactate normal',
    ddxImpact: (v, f) => f === 'critical' ? 20 : f === 'abnormal' ? 10 : -3,
  },
  'creatinine': {
    high: { abnormal: 1.3, critical: 3 },
    interpretation: (v, f) => f === 'critical' ? 'Acute kidney injury — prerenal or intrinsic'
      : f === 'abnormal' ? 'Mildly elevated creatinine — monitor renal function'
      : 'Creatinine normal',
    ddxImpact: (v, f) => f === 'abnormal' ? 5 : 0,
  },
  'hemoglobin': {
    low: { abnormal: 11, critical: 7 },
    high: { abnormal: 18, critical: 20 },
    interpretation: (v, f) => f === 'critical' && v < 7 ? 'Severe anaemia — urgent transfusion criteria'
      : f === 'abnormal' && v < 11 ? 'Anaemia — evaluate for blood loss or nutritional deficiency'
      : f === 'abnormal' && v > 18 ? 'Polycythaemia — consider haemoconcentration or primary'
      : 'Haemoglobin normal',
    ddxImpact: (v, f) => f === 'critical' ? 10 : f === 'abnormal' ? 5 : 0,
  },
};

export function interpretLabResult(result: LabResult): Interpretation {
  const thresholds = THRESHOLDS[result.testId.replace(/[\s_-]/g, '').toLowerCase()];
  if (!thresholds) {
    return {
      testName: result.testName,
      value: result.value,
      unit: result.unit,
      flag: 'normal',
      interpretation: `${result.testName} = ${result.value} ${result.unit}`,
      ddxImpact: 0,
    };
  }

  let flag: 'normal' | 'abnormal' | 'critical' = 'normal';

  if (thresholds.high) {
    if (result.value >= thresholds.high.critical) flag = 'critical';
    else if (result.value >= thresholds.high.abnormal) flag = 'abnormal';
  }
  if (thresholds.low && flag === 'normal') {
    if (result.value <= thresholds.low.critical) flag = 'critical';
    else if (result.value <= thresholds.low.abnormal) flag = 'abnormal';
  }

  const interpretation = thresholds.interpretation(result.value, flag);
  const ddxImpact = thresholds.ddxImpact(result.value, flag);

  return {
    testName: result.testName,
    value: result.value,
    unit: result.unit,
    flag,
    interpretation,
    ddxImpact,
  };
}

export function interpretImagingFinding(
  studyName: string,
  finding: string,
  diseaseKeywords: { positive: string[]; negative: string[]; weight: number },
): { interpretation: string; positive: boolean; ddxImpact: number } {
  const lower = finding.toLowerCase();
  const isPositive = diseaseKeywords.positive.some((kw) => lower.includes(kw.toLowerCase()));
  const isNegative = diseaseKeywords.negative.some((kw) => lower.includes(kw.toLowerCase()));

  if (isPositive) {
    return {
      interpretation: `${studyName}: ${finding} — supports diagnosis`,
      positive: true,
      ddxImpact: diseaseKeywords.weight,
    };
  }
  if (isNegative) {
    return {
      interpretation: `${studyName}: No positive findings — reduces likelihood`,
      positive: false,
      ddxImpact: -diseaseKeywords.weight * 0.5,
    };
  }
  return {
    interpretation: `${studyName}: ${finding} — indeterminate impact on diagnosis`,
    positive: false,
    ddxImpact: 0,
  };
}

export function interpretBedsideScore(
  scoreName: string,
  totalPoints: number,
  maxPoints: number,
): { interpretation: string; riskCategory: string } {
  const percentage = (totalPoints / maxPoints) * 100;
  if (percentage >= 80) return { interpretation: `High risk (${totalPoints}/${maxPoints})`, riskCategory: 'high' };
  if (percentage >= 50) return { interpretation: `Moderate risk (${totalPoints}/${maxPoints})`, riskCategory: 'moderate' };
  return { interpretation: `Low risk (${totalPoints}/${maxPoints})`, riskCategory: 'low' };
}
