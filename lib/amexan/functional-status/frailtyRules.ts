import type {
  FrailtyAssessment,
  FunctionalStatus,
  SymptomObject,
  SymptomAttribute,
} from '../encounter-brain/types';

function findSymptomAttribute(
  symptoms: Record<string, SymptomObject>,
  featureId: string,
): SymptomAttribute | undefined {
  for (const symptom of Object.values(symptoms)) {
    if (symptom.attributes[featureId]) {
      return symptom.attributes[featureId];
    }
  }
  return undefined;
}

function getAttributeValue(
  symptoms: Record<string, SymptomObject>,
  featureId: string,
): string | boolean | number | string[] | undefined {
  return findSymptomAttribute(symptoms, featureId)?.value;
}

function parseNumericValue(val: string | boolean | number | string[] | undefined): number {
  if (val === undefined) return 0;
  if (typeof val === 'number') return val;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parseBooleanValue(val: string | boolean | number | string[] | undefined): boolean {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') return val === 'true' || val === 'yes' || val === 'present';
  return false;
}

function parseStringValue(val: string | boolean | number | string[] | undefined): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return val[0] ?? '';
  return '';
}

function computeDvtRisk(
  functionalStatus: FunctionalStatus,
  age: number,
  hasSurgery: boolean,
): FrailtyAssessment['dvtRisk'] {
  const isBedridden = functionalStatus.overallImpact === 'bedridden' ||
    functionalStatus.dailyActivities.some(a => a.domain === 'mobility' && a.independence === 'dependent');
  const isOld = age > 70;

  if (isBedridden || (isOld && hasSurgery)) return 'high';
  if (isOld || hasSurgery) return 'moderate';
  return 'low';
}

function computePeRisk(
  dvtRisk: FrailtyAssessment['dvtRisk'],
  hasObesity: boolean,
  hasCancer: boolean,
): FrailtyAssessment['peRisk'] {
  if (dvtRisk === 'high' || hasObesity || hasCancer) return 'high';
  if (dvtRisk === 'moderate') return 'moderate';
  return 'low';
}

export function assessFrailty(
  age: number,
  symptoms: Record<string, SymptomObject>,
  functionalStatus: FunctionalStatus,
): FrailtyAssessment {
  if (age < 65) {
    return {
      assessed: false,
      fallsInLastYear: 0,
      mobilityAid: 'none',
      pressureSores: false,
      incontinence: 'none',
      nutritionStatus: 'good',
      cognitiveStatus: 'normal',
      turnsInBed: 'unknown',
      dvtRisk: 'low',
      peRisk: 'low',
    };
  }

  const fallsInLastYear = parseNumericValue(getAttributeValue(symptoms, 'falls_history'));
  const mobilityAidRaw = parseStringValue(getAttributeValue(symptoms, 'mobility_aid'));
  const pressureSores = parseBooleanValue(getAttributeValue(symptoms, 'pressure_sore'));
  const incontinenceRaw = parseStringValue(getAttributeValue(symptoms, 'incontinence'));
  const nutritionRaw = parseStringValue(getAttributeValue(symptoms, 'nutrition_status'));
  const cognitiveRaw = parseStringValue(getAttributeValue(symptoms, 'cognitive_status'));
  const turnsRaw = parseStringValue(getAttributeValue(symptoms, 'turns_in_bed'));

  const mobilityAidMap: Record<string, FrailtyAssessment['mobilityAid']> = {
    none: 'none', cane: 'cane', walker: 'walker', wheelchair: 'wheelchair', bedridden: 'bedridden',
  };
  const mobilityAid: FrailtyAssessment['mobilityAid'] = mobilityAidMap[mobilityAidRaw] ?? 'none';

  const incontinenceMap: Record<string, FrailtyAssessment['incontinence']> = {
    none: 'none', urinary: 'urinary', fecal: 'fecal', both: 'both',
  };
  const incontinence: FrailtyAssessment['incontinence'] = incontinenceMap[incontinenceRaw] ?? 'none';

  const nutritionMap: Record<string, FrailtyAssessment['nutritionStatus']> = {
    good: 'good', at_risk: 'at_risk', malnourished: 'malnourished',
  };
  const nutritionStatus: FrailtyAssessment['nutritionStatus'] = nutritionMap[nutritionRaw] ?? 'good';

  const cognitiveMap: Record<string, FrailtyAssessment['cognitiveStatus']> = {
    normal: 'normal', mild_impairment: 'mild_impairment',
    moderate_impairment: 'moderate_impairment', severe_impairment: 'severe_impairment',
  };
  const cognitiveStatus: FrailtyAssessment['cognitiveStatus'] = cognitiveMap[cognitiveRaw] ?? 'normal';

  const turnsMap: Record<string, FrailtyAssessment['turnsInBed']> = {
    independently: 'independently', with_help: 'with_help',
    needs_turning: 'needs_turning', unknown: 'unknown',
  };
  const turnsInBed: FrailtyAssessment['turnsInBed'] = turnsMap[turnsRaw] ?? 'unknown';

  const hasSurgery = parseBooleanValue(getAttributeValue(symptoms, 'recent_surgery'));
  const hasObesity = parseBooleanValue(getAttributeValue(symptoms, 'obesity'));
  const hasCancer = parseBooleanValue(getAttributeValue(symptoms, 'cancer_diagnosis'));

  const dvtRisk = computeDvtRisk(functionalStatus, age, hasSurgery);
  const peRisk = computePeRisk(dvtRisk, hasObesity, hasCancer);

  return {
    assessed: true,
    fallsInLastYear,
    mobilityAid,
    pressureSores,
    incontinence,
    nutritionStatus,
    cognitiveStatus,
    turnsInBed,
    dvtRisk,
    peRisk,
  };
}

export function getFrailtyQuestions(): string[] {
  return [
    'falls_history',
    'fall_count',
    'mobility_aid',
    'pressure_sore',
    'incontinence_type',
    'nutrition_status',
    'cognitive_status',
    'turns_in_bed',
    'caregiver_available',
    'caregiver_name',
  ];
}

export function getFrailtyNarrative(assessment: FrailtyAssessment): string {
  if (!assessment.assessed) {
    return 'Frailty assessment not indicated (patient is under 65 years).';
  }

  const parts: string[] = [];

  parts.push('Frailty Assessment:');

  if (assessment.fallsInLastYear > 0) {
    parts.push(`${assessment.fallsInLastYear} fall(s) in the last year.`);
  } else {
    parts.push('No falls in the last year.');
  }

  parts.push(`Mobility aid: ${assessment.mobilityAid.replace('_', ' ')}.`);
  parts.push(`Pressure sores: ${assessment.pressureSores ? 'Present' : 'Absent'}.`);
  parts.push(`Incontinence: ${assessment.incontinence}.`);
  parts.push(`Nutrition status: ${assessment.nutritionStatus.replace('_', ' ')}.`);
  parts.push(`Cognitive status: ${assessment.cognitiveStatus.replace('_', ' ')}.`);
  parts.push(`Turns in bed: ${assessment.turnsInBed.replace('_', ' ')}.`);

  parts.push(`DVT risk: ${assessment.dvtRisk.toUpperCase()}.`);
  parts.push(`PE risk: ${assessment.peRisk.toUpperCase()}.`);

  return parts.join(' ');
}

export function getDvtProphylaxisRecommendation(
  assessment: FrailtyAssessment,
  isPostOp: boolean,
): string {
  if (!assessment.assessed) {
    return 'Frailty assessment not performed. DVT prophylaxis not indicated based on age criteria alone.';
  }

  const parts: string[] = [];

  if (assessment.dvtRisk === 'high') {
    parts.push('High DVT risk.');
    if (isPostOp) {
      parts.push('Recommend pharmacological prophylaxis (LMWH/UFH) plus mechanical prophylaxis (compression stockings/IPC).');
    } else {
      parts.push('Recommend pharmacological prophylaxis (LMWH/UFH) if no contraindications.');
    }
  } else if (assessment.dvtRisk === 'moderate') {
    parts.push('Moderate DVT risk.');
    if (isPostOp) {
      parts.push('Recommend pharmacological prophylaxis (LMWH/UFH) or mechanical prophylaxis.');
    } else {
      parts.push('Recommend mechanical prophylaxis and early mobilization.');
    }
  } else {
    parts.push('Low DVT risk.');
    parts.push('Recommend early mobilization and hydration. No pharmacological prophylaxis indicated.');
  }

  if (assessment.peRisk === 'high') {
    parts.push('High PE risk — ensure strict adherence to prophylaxis protocol.');
  }

  return parts.join(' ');
}
