// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Chronic Disease Engine — Disease state objects & surgical history
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  ChronicDiseaseObject,
  PreviousSurgeryObject,
  PostOperativeState,
} from '../encounter-brain/types';

// ── Disease question maps ──────────────────────────────────────────────────

const DISEASE_QUESTIONS: Record<string, readonly string[]> = {
  diabetes: [
    'diagnosis_year', 'diagnosis_facility', 'current_clinic',
    'diabetes_medications', 'medication_compliance', 'last_hba1c',
    'hba1c_value', 'diabetes_complications', 'dka_admissions',
    'hypoglycemia_episodes', 'neuropathy_symptoms', 'retinopathy_screening',
    'nephropathy_screening', 'foot_ulcer_history', 'current_control_status',
  ],
  hypertension: [
    'diagnosis_year', 'diagnosis_facility', 'current_clinic',
    'antihypertensives', 'medication_compliance', 'last_bp_reading',
    'target_organ_damage', 'cv_risk_factors', 'ecg_done',
    'renal_function', 'urinalysis', 'lipid_profile',
  ],
  asthma: [
    'diagnosis_year', 'diagnosis_facility', 'current_clinic',
    'asthma_medications', 'inhaler_technique', 'exacerbation_frequency',
    'hospital_admissions', 'icu_admissions', 'peak_flow_values',
    'triggers', 'nocturnal_symptoms', 'exercise_tolerance',
  ],
  hiv: [
    'diagnosis_year', 'diagnosis_facility', 'current_clinic',
    'art_regimen', 'medication_compliance', 'last_cd4', 'cd4_value',
    'last_viral_load', 'viral_load_value', 'opportunistic_infections',
    'tb_status', 'arv_side_effects',
  ],
  ckd: [
    'diagnosis_year', 'diagnosis_facility', 'current_clinic',
    'ckd_stage', 'last_creatinine', 'creatinine_value',
    'last_egfr', 'egfr_value', 'dialysis_status', 'transplant_status',
    'anemia', 'bone_disease',
  ],
};

const DEFAULT_QUESTIONS: readonly string[] = [
  'diagnosis_year', 'diagnosis_facility', 'current_clinic',
  'medications', 'compliance',
];

// ── Complication maps ──────────────────────────────────────────────────────

const COMPLICATION_SCREENING: Record<string, string[]> = {
  diabetes: [
    'Diabetic retinopathy', 'Diabetic nephropathy', 'Diabetic neuropathy',
    'Peripheral vascular disease', 'Diabetic foot ulcer', 'Cardiovascular disease',
  ],
  hypertension: [
    'Stroke', 'Myocardial infarction', 'Heart failure', 'Chronic kidney disease',
    'Hypertensive retinopathy', 'Peripheral arterial disease',
  ],
  asthma: [
    'Status asthmaticus', 'Respiratory failure', 'Pneumothorax',
    'Atelectasis', 'Chronic obstructive pulmonary disease',
  ],
  hiv: [
    'Tuberculosis', 'Pneumocystis pneumonia', 'Cryptococcal meningitis',
    'Cytomegalovirus retinitis', 'HIV wasting syndrome', 'Non-Hodgkin lymphoma',
  ],
  ckd: [
    'End stage renal disease', 'Hyperkalemia', 'Metabolic acidosis',
    'Renal osteodystrophy', 'Anemia', 'Cardiovascular disease',
  ],
};

// ── Public API ──────────────────────────────────────────────────────────────

export function createChronicDiseaseObject(
  diseaseId: string,
  diseaseName: string,
  diagnosisYear: number,
): ChronicDiseaseObject {
  return {
    diseaseId,
    diseaseName,
    diagnosisYear,
    medications: [],
    compliance: 'unknown',
    monitoring: [],
    complications: [],
    admissions: [],
    currentControl: 'unknown',
    owner: 'chronic_disease_engine',
  };
}

export function getChronicDiseaseQuestions(diseaseId: string): readonly string[] {
  const key = diseaseId.toLowerCase();
  return DISEASE_QUESTIONS[key] ?? DEFAULT_QUESTIONS;
}

export function getChronicDiseaseIntroduction(diseases: ChronicDiseaseObject[]): string {
  if (diseases.length === 0) return 'No known chronic diseases.';

  const parts: string[] = [];
  const knownDiseases = diseases.filter(
    d => d.diseaseName && d.diagnosisYear && d.diagnosisYear > 0,
  );

  if (knownDiseases.length > 0) {
    const diseaseDescriptions = knownDiseases.map(
      d => `${d.diseaseName} diagnosed in ${d.diagnosisYear}`,
    );
    if (diseaseDescriptions.length === 1) {
      parts.push(`The patient has a known history of ${diseaseDescriptions[0]}.`);
    } else {
      const last = diseaseDescriptions.pop();
      parts.push(`The patient has a known history of ${diseaseDescriptions.join(', ')} and ${last}.`);
    }
  } else {
    parts.push('The patient has a known chronic disease history.');
  }

  const activeDisease = diseases[0];
  if (activeDisease?.currentClinic) {
    parts.push(`They are currently following up at ${activeDisease.currentClinic}.`);
  }

  if (activeDisease?.medications && activeDisease.medications.length > 0) {
    const medNames = activeDisease.medications.map(m => m.name).join(', ');
    parts.push(`They are on ${medNames} with ${activeDisease.compliance} compliance.`);
  }

  return parts.join(' ');
}

export function assessComplicationRisk(disease: ChronicDiseaseObject): string[] {
  const baseComplications = COMPLICATION_SCREENING[disease.diseaseId.toLowerCase()];
  if (!baseComplications) return [];

  if (
    disease.currentControl === 'poorly_controlled' ||
    disease.currentControl === 'unknown'
  ) {
    return baseComplications;
  }

  return baseComplications.slice(0, 3);
}

export function evaluateSurgicalHistory(surgeries: PreviousSurgeryObject[]): string {
  if (surgeries.length === 0) return 'No previous surgical history.';

  const parts = surgeries.map(s => {
    const approachStr = s.approach ? ` (${s.approach})` : '';
    const indicationStr = s.indication ? ` for ${s.indication}` : '';
    const complicationStr =
      s.complications && s.complications.length > 0
        ? ` complicated by ${s.complications.join(', ')}`
        : '';
    return `${s.procedureName}${approachStr} on ${s.date}${indicationStr}${complicationStr}`;
  });

  return `Previous surgical history: ${parts.join('; ')}.`;
}

export function createPostOperativeState(
  data: Partial<PostOperativeState>,
): PostOperativeState {
  return {
    postOpDay: data.postOpDay ?? 0,
    operationPerformed: data.operationPerformed ?? '',
    operationDate: data.operationDate ?? '',
    surgeon: data.surgeon ?? '',
    anaesthesia: data.anaesthesia ?? 'general',
    woundStatus: data.woundStatus ?? 'clean',
    painControl: data.painControl ?? 'unknown',
    ambulation: data.ambulation ?? 'unknown',
    feeding: data.feeding ?? 'unknown',
    urination: data.urination ?? 'unknown',
    flatus: data.flatus ?? 'unknown',
    bowelMotion: data.bowelMotion ?? 'unknown',
    drainOutput: data.drainOutput,
    dvtProphylaxis: data.dvtProphylaxis ?? false,
    antibiotics: data.antibiotics ?? false,
    fever: data.fever ?? false,
    complications: data.complications ?? [],
  };
}

export function getPostOpQuestions(state: PostOperativeState): readonly string[] {
  const base = [
    'pain_level', 'ambulation_status', 'feeding_status', 'urination_status',
    'flatus_passed', 'bowel_motion', 'drain_output', 'wound_status',
    'fever', 'dvt_prophylaxis', 'antibiotics',
  ];

  return base;
}

export function getPostOpNarrative(state: PostOperativeState): string {
  const parts: string[] = [];

  parts.push(
    `Post-operative day ${state.postOpDay} after ${state.operationPerformed} ` +
    `(performed on ${state.operationDate} by ${state.surgeon}).`,
  );

  parts.push(
    `Anaesthesia: ${state.anaesthesia}. Wound status: ${state.woundStatus}. ` +
    `Pain control: ${state.painControl}.`,
  );

  const ambMap: Record<string, string> = {
    independent: 'ambulating independently',
    with_assistance: 'ambulating with assistance',
    bedridden: 'bedridden',
    unknown: 'ambulation status unknown',
  };
  parts.push(`Patient is ${ambMap[state.ambulation] ?? 'ambulation status unknown'}.`);

  parts.push(
    `Feeding: ${state.feeding}. Urination: ${state.urination}. ` +
    `Flatus: ${state.flatus}. Bowel motion: ${state.bowelMotion}.`,
  );

  if (state.drainOutput) {
    parts.push(`Drain output: ${state.drainOutput}.`);
  }

  parts.push(
    `DVT prophylaxis: ${state.dvtProphylaxis ? 'Yes' : 'No'}. ` +
    `Antibiotics: ${state.antibiotics ? 'Yes' : 'No'}. ` +
    `Fever: ${state.fever ? 'Present' : 'Absent'}.`,
  );

  if (state.complications && state.complications.length > 0) {
    parts.push(`Complications: ${state.complications.join(', ')}.`);
  }

  return parts.join(' ');
}
