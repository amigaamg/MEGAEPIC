import type { Biodata, FeatureRegistry } from './types';

export interface RiskFactorContribution {
  factor: string;
  detail: string;
  diseases: { diseaseId: string; diseaseName: string; boost: number }[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high';
  contributions: RiskFactorContribution[];
}

const AGE_RISKS: Record<string, { threshold: number; diseases: { diseaseId: string; diseaseName: string; boost: number }[] }[]> = {
  '>50': [
    { threshold: 50, diseases: [{ diseaseId: 'chest_pain', diseaseName: 'Acute Coronary Syndrome', boost: 3 }] },
    { threshold: 55, diseases: [{ diseaseId: 'lung_cancer', diseaseName: 'Lung Cancer', boost: 3 }] },
    { threshold: 60, diseases: [{ diseaseId: 'copd_pulm', diseaseName: 'COPD', boost: 2 }, { diseaseId: 'oa', diseaseName: 'Osteoarthritis', boost: 2 }] },
    { threshold: 65, diseases: [{ diseaseId: 'ckd', diseaseName: 'Chronic Kidney Disease', boost: 2 }, { diseaseId: 'heart_failure_card', diseaseName: 'Heart Failure', boost: 2 }] },
    { threshold: 70, diseases: [{ diseaseId: 'dementia', diseaseName: 'Dementia', boost: 2 }, { diseaseId: 'parkinsons', diseaseName: 'Parkinsons Disease', boost: 1 }] },
  ],
  '<5': [
    { threshold: 5, diseases: [{ diseaseId: 'pneumonia_pulm', diseaseName: 'Pneumonia', boost: 2 }, { diseaseId: 'bronchiolitis', diseaseName: 'Bronchiolitis', boost: 3 }, { diseaseId: 'croup', diseaseName: 'Croup', boost: 2 }] },
  ],
};

const SEX_RISKS: Record<string, { diseaseId: string; diseaseName: string; boost: number }[]> = {
  male: [
    { diseaseId: 'chest_pain', diseaseName: 'Acute Coronary Syndrome', boost: 2 },
    { diseaseId: 'lung_cancer', diseaseName: 'Lung Cancer', boost: 1 },
    { diseaseId: 'gout', diseaseName: 'Gout', boost: 2 },
    { diseaseId: 'aaa', diseaseName: 'Abdominal Aortic Aneurysm', boost: 2 },
  ],
  female: [
    { diseaseId: 'sle', diseaseName: 'Systemic Lupus Erythematosus', boost: 3 },
    { diseaseId: 'hyperthyroidism', diseaseName: 'Hyperthyroidism', boost: 2 },
    { diseaseId: 'uti', diseaseName: 'UTI', boost: 2 },
    { diseaseId: 'autoimmune', diseaseName: 'Autoimmune Diseases', boost: 2 },
  ],
};

const OCCUPATION_RISKS: Record<string, { diseaseId: string; diseaseName: string; boost: number }[]> = {
  farmer: [
    { diseaseId: 'brucellosis', diseaseName: 'Brucellosis', boost: 4 },
    { diseaseId: 'leptospirosis', diseaseName: 'Leptospirosis', boost: 3 },
    { diseaseId: 'tb_pulm', diseaseName: 'Tuberculosis', boost: 2 },
    { diseaseId: 'skin_fungal', diseaseName: 'Fungal Skin Infection', boost: 2 },
    { diseaseId: 'heat_stroke', diseaseName: 'Heat Stroke', boost: 2 },
    { diseaseId: 'pesticide_poisoning', diseaseName: 'Pesticide Poisoning', boost: 2 },
  ],
  miner: [
    { diseaseId: 'tb_pulm', diseaseName: 'Tuberculosis', boost: 5 },
    { diseaseId: 'copd_pulm', diseaseName: 'COPD', boost: 4 },
    { diseaseId: 'silicosis', diseaseName: 'Silicosis', boost: 6 },
    { diseaseId: 'lung_cancer', diseaseName: 'Lung Cancer', boost: 2 },
  ],
  healthcare: [
    { diseaseId: 'tb_pulm', diseaseName: 'Tuberculosis', boost: 3 },
    { diseaseId: 'covid', diseaseName: 'COVID-19', boost: 3 },
    { diseaseId: 'hepatitis_b', diseaseName: 'Hepatitis B', boost: 2 },
    { diseaseId: 'needlestick_injury', diseaseName: 'Needlestick Injury', boost: 2 },
    { diseaseId: 'burnout', diseaseName: 'Burnout / Depression', boost: 2 },
  ],
  driver: [
    { diseaseId: 'oa_spine', diseaseName: 'Spine Osteoarthritis', boost: 2 },
    { diseaseId: 'prostatitis', diseaseName: 'Prostatitis', boost: 2 },
    { diseaseId: 'hypertension', diseaseName: 'Hypertension', boost: 2 },
  ],
};

const RESIDENCE_RISKS: { pattern: string; diseases: { diseaseId: string; diseaseName: string; boost: number }[] }[] = [
  { pattern: 'rural', diseases: [{ diseaseId: 'malaria', diseaseName: 'Malaria', boost: 3 }, { diseaseId: 'tb_pulm', diseaseName: 'Tuberculosis', boost: 2 }, { diseaseId: 'typhoid', diseaseName: 'Typhoid', boost: 2 }] },
  { pattern: 'urban', diseases: [{ diseaseId: 'hypertension', diseaseName: 'Hypertension', boost: 2 }, { diseaseId: 'diabetes_t2', diseaseName: 'Diabetes', boost: 2 }, { diseaseId: 'asthma_pulm', diseaseName: 'Asthma', boost: 1 }] },
  { pattern: 'coastal', diseases: [{ diseaseId: 'malaria', diseaseName: 'Malaria', boost: 2 }, { diseaseId: 'cholera', diseaseName: 'Cholera', boost: 2 }] },
  { pattern: 'high altitude', diseases: [{ diseaseId: 'pneumonia_pulm', diseaseName: 'Pneumonia', boost: 1 }] },
];

export function assessRiskFactors(biodata: Biodata, featureRegistry: FeatureRegistry): RiskAssessment {
  const contributions: RiskFactorContribution[] = [];

  // Age-based
  const age = biodata.age;
  if (age >= 70) {
    const highAgeRisks = AGE_RISKS['>50']?.filter(r => age >= r.threshold) || [];
    const diseases = highAgeRisks.flatMap(r => r.diseases);
    if (diseases.length > 0) {
      contributions.push({ factor: 'Age', detail: `Patient is ${age} years old`, diseases });
    }
  } else if (age >= 50) {
    const adultRisks = AGE_RISKS['>50']?.filter(r => age >= r.threshold) || [];
    const diseases = adultRisks.flatMap(r => r.diseases);
    if (diseases.length > 0) {
      contributions.push({ factor: 'Age', detail: `Patient is ${age} years old`, diseases });
    }
  }

  // Sex-based
  const sexRisks = SEX_RISKS[biodata.sex];
  if (sexRisks) {
    contributions.push({ factor: 'Sex', detail: `Patient is ${biodata.sex}`, diseases: sexRisks });
  }

  // Occupation
  const occType = biodata.occupationType;
  if (occType) {
    const occRisks = OCCUPATION_RISKS[occType];
    if (occRisks) {
      contributions.push({ factor: 'Occupation', detail: `Works as ${biodata.occupation}`, diseases: occRisks });
    }
  }

  // Residence
  const resLower = biodata.residence.toLowerCase();
  for (const rr of RESIDENCE_RISKS) {
    if (resLower.includes(rr.pattern)) {
      contributions.push({ factor: 'Residence', detail: `Resides in ${biodata.residence}`, diseases: rr.diseases });
    }
  }

  // Feature-registry based
  for (const [, entry] of Object.entries(featureRegistry)) {
    if (entry.present === true && entry.weight > 0) {
      const diseases = Object.entries(entry.diseaseWeights)
        .filter(([, w]) => w > 0)
        .map(([did, w]) => ({ diseaseId: did, diseaseName: did.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), boost: w }));
      if (diseases.length > 0) {
        contributions.push({ factor: entry.id, detail: entry.id.replace(/_/g, ' '), diseases });
      }
    }
  }

  const totalBoost = contributions.reduce((sum, c) => sum + c.diseases.reduce((s, d) => s + d.boost, 0), 0);
  const overallRisk: 'low' | 'moderate' | 'high' = totalBoost > 20 ? 'high' : totalBoost > 10 ? 'moderate' : 'low';

  return { overallRisk, contributions };
}
