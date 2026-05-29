import type { VitalsData } from '../ddx-engine';

export interface DischargeCriterion {
  criterion: string;
  met: boolean;
}

export interface DischargeReadiness {
  readyForDischarge: boolean;
  criteria: DischargeCriterion[];
  unmetCriteria: string[];
  recommendations: string[];
  followUpInterval: string;
}

function getFollowUpInterval(diseaseId: string, daysSinceAdmission: number): string {
  if (diseaseId.includes('tuberculosis') || diseaseId.includes('tb')) return '1-2 weeks';
  if (diseaseId.includes('pneumonia')) return '1 week';
  if (diseaseId.includes('asthma')) return '2 weeks';
  if (diseaseId.includes('surgery') || diseaseId.includes('surgical')) return '2 weeks';
  if (daysSinceAdmission > 5) return '1 week';
  return '2 weeks';
}

export function evaluateDischarge(
  diseaseId: string,
  currentSymptoms: string[],
  vitals: VitalsData,
  daysSinceAdmission: number
): DischargeReadiness {
  const criteria: DischargeCriterion[] = [];
  const unmetCriteria: string[] = [];
  const recommendations: string[] = [];

  const symptomSet = new Set(currentSymptoms.map(s => s.toLowerCase()));

  const vitalChecks: { criterion: string; check: () => boolean }[] = [
    { criterion: 'Oxygen saturation ≥ 92% on room air', check: () => vitals.oxygenSaturation !== undefined && vitals.oxygenSaturation >= 92 },
    { criterion: 'Heart rate 60-120 bpm', check: () => vitals.heartRate !== undefined && vitals.heartRate >= 60 && vitals.heartRate <= 120 },
    { criterion: 'Respiratory rate < 30/min', check: () => vitals.respiratoryRate !== undefined && vitals.respiratoryRate < 30 },
    { criterion: 'Temperature 36-38°C', check: () => vitals.temperature !== undefined && vitals.temperature >= 36 && vitals.temperature <= 38 },
    { criterion: 'Systolic BP ≥ 90 mmHg', check: () => vitals.bloodPressureSystolic !== undefined && vitals.bloodPressureSystolic >= 90 },
  ];

  for (const vc of vitalChecks) {
    const met = vc.check();
    criteria.push({ criterion: vc.criterion, met });
    if (!met) {
      unmetCriteria.push(vc.criterion);
    }
  }

  const symptomCriteria: { criterion: string; symptoms: string[] }[] = [
    { criterion: 'No respiratory distress', symptoms: ['respiratory_distress', 'chest_indrawing', 'grunting', 'nasal_flaring'] },
    { criterion: 'No fever', symptoms: ['fever'] },
    { criterion: 'Able to feed orally', symptoms: ['feeding_difficulty', 'poor_feeding'] },
    { criterion: 'No altered consciousness', symptoms: ['altered_consciousness', 'lethargy'] },
  ];

  for (const sc of symptomCriteria) {
    const met = !sc.symptoms.some(s => symptomSet.has(s));
    criteria.push({ criterion: sc.criterion, met });
    if (!met) {
      unmetCriteria.push(sc.criterion);
    }
  }

  const additionalChecks: { criterion: string; check: boolean }[] = [
    { criterion: 'Adequate urine output documented', check: daysSinceAdmission >= 1 },
    { criterion: 'Oral medications tolerated', check: daysSinceAdmission >= 1 },
    { criterion: 'Caregiver understands follow-up plan', check: true },
  ];

  for (const ac of additionalChecks) {
    criteria.push({ criterion: ac.criterion, met: ac.check });
    if (!ac.check) {
      unmetCriteria.push(ac.criterion);
    }
  }

  if (unmetCriteria.length > 0) {
    recommendations.push('Address the following before discharge:');
    recommendations.push(...unmetCriteria.map(c => `- Resolve: ${c}`));
  }

  const readyForDischarge = unmetCriteria.length === 0;
  const followUpInterval = getFollowUpInterval(diseaseId, daysSinceAdmission);

  if (readyForDischarge) {
    recommendations.push(`Follow up in ${followUpInterval}`);
    recommendations.push('Provide written discharge instructions');
    recommendations.push('Ensure caregiver knows emergency warning signs');
  }

  return { readyForDischarge, criteria, unmetCriteria, recommendations, followUpInterval };
}
