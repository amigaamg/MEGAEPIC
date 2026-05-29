import type { VitalsData } from '../ddx-engine';

export interface AdmissionCriterion {
  criterion: string;
  weight: number;
  isAbsolute: boolean;
}

export interface AdmissionRecommendation {
  recommendAdmission: boolean;
  level: 'ward' | 'hdu' | 'icu';
  criteria: AdmissionCriterion[];
  reasons: string[];
}

const SEVERITY_LEVEL_MAP: Record<string, 'ward' | 'hdu' | 'icu'> = {
  critical: 'icu',
  severe: 'hdu',
  moderate: 'ward',
  mild: 'ward',
};

const ABSOLUTE_CRITERIA: { criterion: string; level: 'ward' | 'hdu' | 'icu'; check: (v: VitalsData) => boolean }[] = [
  { criterion: 'SpO₂ < 85%', level: 'icu', check: (v) => v.oxygenSaturation !== undefined && v.oxygenSaturation < 85 },
  { criterion: 'Heart rate < 60 or > 200 bpm', level: 'icu', check: (v) => v.heartRate !== undefined && (v.heartRate < 60 || v.heartRate > 200) },
  { criterion: 'Systolic BP < 70 mmHg', level: 'icu', check: (v) => v.bloodPressureSystolic !== undefined && v.bloodPressureSystolic < 70 },
  { criterion: 'Respiratory rate > 60/min', level: 'hdu', check: (v) => v.respiratoryRate !== undefined && v.respiratoryRate > 60 },
  { criterion: 'Temperature > 41°C or < 35°C', level: 'hdu', check: (v) => v.temperature !== undefined && (v.temperature > 41 || v.temperature < 35) },
  { criterion: 'SpO₂ 85-91%', level: 'hdu', check: (v) => v.oxygenSaturation !== undefined && v.oxygenSaturation >= 85 && v.oxygenSaturation < 92 },
];

export function evaluateAdmission(
  diseaseId: string,
  severity: string,
  vitals: VitalsData,
  riskFactors: string[]
): AdmissionRecommendation {
  const criteria: AdmissionCriterion[] = [];
  const reasons: string[] = [];

  const sev = severity.toLowerCase();

  for (const abs of ABSOLUTE_CRITERIA) {
    if (abs.check(vitals)) {
      criteria.push({ criterion: abs.criterion, weight: 10, isAbsolute: true });
      reasons.push(`Absolute criterion met: ${abs.criterion}`);
    }
  }

  const severityWeights: Record<string, number> = { critical: 8, severe: 6, moderate: 3, mild: 0 };
  const sevWeight = severityWeights[sev] || 0;
  if (sevWeight > 0) {
    criteria.push({ criterion: `Severity level: ${severity}`, weight: sevWeight, isAbsolute: sev === 'critical' });
    reasons.push(`Severity level warrants admission: ${severity}`);
  }

  for (const rf of riskFactors) {
    criteria.push({ criterion: `Risk factor: ${rf}`, weight: 1, isAbsolute: false });
    reasons.push(`Risk factor present: ${rf}`);
  }

  const hasAbsolute = criteria.some(c => c.isAbsolute);
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  let level: 'ward' | 'hdu' | 'icu' = 'ward';
  if (hasAbsolute) {
    for (const abs of ABSOLUTE_CRITERIA) {
      if (abs.check(vitals)) {
        level = abs.level;
        break;
      }
    }
  } else if (sev === 'critical' || sev === 'severe') {
    level = SEVERITY_LEVEL_MAP[sev];
  } else if (totalWeight >= 5) {
    level = 'ward';
  }

  const recommendAdmission = hasAbsolute || sevWeight >= 6 || totalWeight >= 3;

  return {
    recommendAdmission,
    level,
    criteria,
    reasons,
  };
}
