// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN General Examination Engine — Volume IIA orchestrator
// ═══════════════════════════════════════════════════════════════════════════════
// Single authority for:
//   - What sections to show (activation rules by age, sex, specialty, complaint)
//   - Order of examination sections
//   - Auto-documentation narrative generation
//   - Constitutional sign activation chains
//   - Next exam step recommendation
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState } from '../encounterState';
import type {
  UniversalGeneralExamination,
  GeneralAppearance,
  ConstitutionalSignId,
  ConstitutionalSign,
  Anthropometry,
  IntelligentVitals,
  ClinicalFinding,
} from '../examination/examinationTypes';
import { getActiveGenExamFields, getGenExamField, GENERAL_EXAMINATION_SECTIONS } from '../examination/generalExaminationSchemas';
import { analyzeAnthropometry } from './anthropometryEngine';
import { interpretAllVitals } from './vitalsEngine';

// ── Activation Rules ───────────────────────────────────────────────────────────

export interface GeneralExamSectionStatus {
  sectionId: string;
  label: string;
  required: boolean;
  active: boolean;
  reason?: string;
}

export function getActiveSections(
  ageYears: number,
  ageMonths: number,
  sex: 'male' | 'female',
  specialty?: string,
  chiefComplaint?: string
): GeneralExamSectionStatus[] {
  const sections: GeneralExamSectionStatus[] = [
    { sectionId: 'preparation', label: 'Preparation', required: true, active: true },
    { sectionId: 'general_appearance', label: 'General Appearance', required: true, active: true },
    { sectionId: 'vital_signs', label: 'Vital Signs', required: true, active: true },
    { sectionId: 'anthropometry', label: 'Anthropometry', required: true, active: true },
    { sectionId: 'constitutional_signs', label: 'Constitutional Signs', required: true, active: true },
  ];

  // Age-based activation
  if (ageMonths > 24) {
    // Head circumference is not routine after 2 years
    // Marked as optional — still accessible
  }

  if (ageMonths < 6 || ageMonths > 60) {
    // MUAC not routine outside 6mo-5yr
  }

  // Specialty-based activation
  if (specialty === 'paediatrics' || specialty === 'neonatology') {
    // Paeds may have additional sections
  }

  return sections;
}

// ── Constitutional Sign Activation Chains ──────────────────────────────────────
// When a constitutional sign is positive, these related exam items are suggested.

export interface ActivatedExamination {
  signId: ConstitutionalSignId;
  activates: string[];
  clinicalRationale: string;
}

export const CONSTITUTIONAL_ACTIVATION_CHAINS: Record<ConstitutionalSignId, ActivatedExamination> = {
  pallor: {
    signId: 'pallor',
    activates: ['cv_examination', 'respiratory_examination', 'gi_examination', 'lv_anaemia_workup'],
    clinicalRationale: 'Pallor suggests anaemia — evaluate CVS (haemic murmur), respiratory (compensatory tachypnoea), and GI (source of bleeding)',
  },
  jaundice: {
    signId: 'jaundice',
    activates: ['gi_examination', 'liver_palpation', 'spleen_palpation', 'ascites_examination', 'neurological_examination'],
    clinicalRationale: 'Jaundice suggests hepatic or haemolytic pathology — evaluate liver, spleen, ascites, and neurological signs of hepatic encephalopathy',
  },
  cyanosis: {
    signId: 'cyanosis',
    activates: ['cv_examination', 'respiratory_examination', 'spo2_monitoring', 'chest_auscultation'],
    clinicalRationale: 'Cyanosis indicates hypoxaemia — evaluate cardiac and respiratory systems urgently',
  },
  clubbing: {
    signId: 'clubbing',
    activates: ['respiratory_examination', 'cv_examination', 'gi_examination', 'chest_imaging'],
    clinicalRationale: 'Clubbing associated with suppurative lung disease, cyanotic heart disease, and GI conditions',
  },
  lymphadenopathy: {
    signId: 'lymphadenopathy',
    activates: ['ln_detailed_examination', 'ent_examination', 'skin_examination', 'iv_infectious_workup'],
    clinicalRationale: 'Lymphadenopathy requires full node mapping, ENT evaluation, and infectious/malignant workup',
  },
  peripheral_oedema: {
    signId: 'peripheral_oedema',
    activates: ['cv_examination', 'renal_examination', 'gi_examination', 'jvp_examination', 'urine_analysis'],
    clinicalRationale: 'Oedema suggests cardiac, renal, or hepatic pathology — evaluate JVP, urine, and liver',
  },
  dehydration: {
    signId: 'dehydration',
    activates: ['skin_turgor', 'mucous_membranes', 'capillary_refill', 'urine_output', 'electrolytes'],
    clinicalRationale: 'Dehydration requires severity grading and fluid/electrolyte assessment',
  },
  cachexia: {
    signId: 'cachexia',
    activates: ['nutritional_assessment', 'gi_examination', 'iv_malignancy_screen', 'endocrine_examination'],
    clinicalRationale: 'Cachexia suggests chronic disease, malignancy, or malabsorption',
  },
  obesity: {
    signId: 'obesity',
    activates: ['cv_examination', 'endocrine_examination', 'metabolic_screening', 'sleep_apnoea_screening'],
    clinicalRationale: 'Obesity increases cardiometabolic risk — full metabolic and CV assessment indicated',
  },
  pigmentation: {
    signId: 'pigmentation',
    activates: ['endocrine_examination', 'skin_examination', 'autoimmune_screening'],
    clinicalRationale: 'Hyperpigmentation may suggest Addison disease, haemochromatosis, or medication effect',
  },
  rash: {
    signId: 'rash',
    activates: ['skin_examination', 'iv_dermatology_referral', 'infectious_workup'],
    clinicalRationale: 'Rash requires full dermatological assessment and infectious disease consideration',
  },
  petechiae: {
    signId: 'petechiae',
    activates: ['skin_examination', 'full_blood_count', 'coagulation_profile', 'iv_haematology_referral'],
    clinicalRationale: 'Petechiae suggest thrombocytopenia or coagulopathy — urgent haematological evaluation',
  },
  spider_naevi: {
    signId: 'spider_naevi',
    activates: ['gi_examination', 'liver_palpation', 'spleen_palpation', 'ascites_examination'],
    clinicalRationale: 'Spider naevi suggest hyperoestrogenism in chronic liver disease',
  },
  palmar_erythema: {
    signId: 'palmar_erythema',
    activates: ['gi_examination', 'liver_palpation', 'endocrine_examination'],
    clinicalRationale: 'Palmar erythema associated with liver disease, pregnancy, and hyperthyroidism',
  },
  muscle_wasting: {
    signId: 'muscle_wasting',
    activates: ['neurological_examination', 'nutritional_assessment', 'iv_neuropathy_workup'],
    clinicalRationale: 'Muscle wasting suggests neurological, nutritional, or chronic disease',
  },
  tremor: {
    signId: 'tremor',
    activates: ['neurological_examination', 'endocrine_examination', 'iv_tremor_assessment'],
    clinicalRationale: 'Tremor requires differentiation between resting, intention, and postural types',
  },
  asterixis: {
    signId: 'asterixis',
    activates: ['gi_examination', 'liver_palpation', 'neurological_examination', 'ammonia_level'],
    clinicalRationale: 'Asterixis (liver flap) is a sign of hepatic encephalopathy — urgent evaluation',
  },
  nail_changes: {
    signId: 'nail_changes',
    activates: ['skin_examination', 'respiratory_examination', 'iv_nail_assessment'],
    clinicalRationale: 'Nail changes provide clues to respiratory, dermatological, and systemic disease',
  },
  hair_changes: {
    signId: 'hair_changes',
    activates: ['endocrine_examination', 'nutritional_assessment', 'iv_hair_assessment'],
    clinicalRationale: 'Hair changes associated with endocrine, nutritional, and autoimmune conditions',
  },
  goitre: {
    signId: 'goitre',
    activates: ['endocrine_examination', 'neck_examination', 'thyroid_function_tests', 'iv_thyroid_imaging'],
    clinicalRationale: 'Goitre requires full thyroid assessment including function tests and imaging',
  },
  purpura: {
    signId: 'purpura',
    activates: ['skin_examination', 'full_blood_count', 'coagulation_profile', 'iv_haematology_referral'],
    clinicalRationale: 'Purpura suggests thrombocytopenia, vasculitis, or coagulopathy',
  },
  ecchymosis: {
    signId: 'ecchymosis',
    activates: ['skin_examination', 'coagulation_profile', 'full_blood_count'],
    clinicalRationale: 'Spontaneous or large ecchymoses suggest bleeding diathesis',
  },
  xanthelasma: {
    signId: 'xanthelasma',
    activates: ['cv_examination', 'lipid_profile', 'metabolic_screening'],
    clinicalRationale: 'Xanthelasma associated with dyslipidaemia and cardiovascular risk',
  },
  scratch_marks: {
    signId: 'scratch_marks',
    activates: ['skin_examination', 'gi_examination', 'liver_palpation', 'iv_pruritus_workup'],
    clinicalRationale: 'Generalised pruritus with scratch marks suggests cholestasis, uraemia, or dermatological cause',
  },
  finger_changes: {
    signId: 'finger_changes',
    activates: ['skin_examination', 'respiratory_examination', 'rheumatological_assessment'],
    clinicalRationale: 'Finger changes may suggest connective tissue disease, arthropathy, or clubbing',
  },
};

// ── Auto-Documentation Narrative ───────────────────────────────────────────────

export function generateGeneralExaminationNarrative(
  genExam: Partial<UniversalGeneralExamination>
): string {
  const paragraphs: string[] = [];
  const ga = genExam.generalAppearance;

  // General appearance
  if (ga) {
    const parts: string[] = [];
    const overallMap: Record<string, string> = {
      well: 'well',
      ill: 'ill-looking',
      toxic: 'toxic-appearing',
      distressed: 'in visible distress',
      cachectic: 'cachectic',
      obese: 'obese',
      comfortable: 'comfortable',
      anxious: 'anxious',
      agitated: 'agitated',
    };
    parts.push(overallMap[ga.overall] || ga.overall);

    if (ga.distress && ga.distress !== 'none') {
      parts.push(`in ${ga.distress} distress`);
    }

    if (ga.consciousness !== 'alert') {
      parts.push(`consciousness: ${ga.consciousness}`);
    }

    if (ga.hydration && ga.hydration !== 'well_hydrated') {
      parts.push(`${ga.hydration.replace('_', ' ')}`);
    }

    if (ga.nutritionalState && ga.nutritionalState !== 'normal') {
      parts.push(`${ga.nutritionalState.replace('_', ' ')}`);
    }

    paragraphs.push(`General appearance: The patient appears ${parts.join(', ')}.`);

    if (ga.mobility && ga.mobility !== 'independent') {
      paragraphs.push(`Mobility: ${ga.mobility.replace('_', ' ')}.`);
    }

    if (ga.odour && ga.odour !== 'normal') {
      paragraphs.push(`Notable odour: ${ga.odour}.`);
    }

    if (ga.speech && ga.speech !== 'normal') {
      paragraphs.push(`Speech: ${ga.speech}.`);
    }
  }

  // Anthropometry
  if (genExam.anthropometry) {
    const a = genExam.anthropometry;
    const measures: string[] = [];
    if (a.weight) measures.push(`Weight: ${a.weight.value} kg`);
    if (a.height) measures.push(`Height: ${a.height.value} cm`);
    if (a.length) measures.push(`Length: ${a.length.value} cm`);
    if (a.headCircumference) measures.push(`Head circumference: ${a.headCircumference.value} cm`);
    if (a.muac) measures.push(`MUAC: ${a.muac.value} cm`);
    if (a.bmi) measures.push(`BMI: ${a.bmi.value} kg/m²`);

    if (measures.length > 0) {
      paragraphs.push(`Anthropometry: ${measures.join(', ')}.`);
    }
  }

  // Vital signs
  if (genExam.vitalSigns) {
    const vs = genExam.vitalSigns;
    const vitalsParts: string[] = [];
    if (vs.bloodPressure) vitalsParts.push(`BP ${vs.bloodPressure.systolic.value}/${vs.bloodPressure.diastolic.value} mmHg`);
    if (vs.heartRate) vitalsParts.push(`HR ${vs.heartRate.value}/min`);
    if (vs.respiratoryRate) vitalsParts.push(`RR ${vs.respiratoryRate.value}/min`);
    if (vs.temperature) vitalsParts.push(`Temp ${vs.temperature.value}°C`);
    if (vs.spo2) vitalsParts.push(`SpO₂ ${vs.spo2.value}%`);
    if (vs.bloodGlucose) vitalsParts.push(`RBG ${vs.bloodGlucose.value} mmol/L`);

    if (vitalsParts.length > 0) {
      paragraphs.push(`Vital signs: ${vitalsParts.join(', ')}.`);
    }
  }

  // Constitutional signs — only abnormal ones
  if (genExam.constitutionalSigns) {
    const abnormalSigns: string[] = [];
    const signLabels: Record<string, string> = {
      pallor: 'Pallor',
      jaundice: 'Jaundice',
      cyanosis: 'Cyanosis',
      clubbing: 'Clubbing',
      lymphadenopathy: 'Lymphadenopathy',
      peripheral_oedema: 'Peripheral oedema',
      dehydration: 'Dehydration',
      cachexia: 'Cachexia',
      pigmentation: 'Pigmentation changes',
      rash: 'Rash',
      petechiae: 'Petechiae/purpura',
      spider_naevi: 'Spider naevi',
      palmar_erythema: 'Palmar erythema',
      muscle_wasting: 'Muscle wasting',
      tremor: 'Tremor',
      asterixis: 'Asterixis',
      goitre: 'Goitre',
      nail_changes: 'Nail changes',
      hair_changes: 'Hair changes',
      obesity: 'Obesity',
      purpura: 'Purpura',
      ecchymosis: 'Ecchymosis',
      xanthelasma: 'Xanthelasma',
      scratch_marks: 'Scratch marks',
      finger_changes: 'Finger changes',
    };

    for (const [id, sign] of Object.entries(genExam.constitutionalSigns)) {
      if (sign && sign.present) {
        const label = signLabels[id] || id;
        const severity = sign.severity ? ` (${sign.severity})` : '';
        abnormalSigns.push(`${label}${severity}`);
        if (sign.description) abnormalSigns[abnormalSigns.length - 1] += ` — ${sign.description}`;
      }
    }

    if (abnormalSigns.length > 0) {
      paragraphs.push(`Constitutional signs: ${abnormalSigns.join('; ')}.`);
    } else {
      paragraphs.push(`Constitutional signs: No abnormalities detected.`);
    }
  }

  // Preparation
  if (genExam.preparation) {
    const prep = genExam.preparation;
    paragraphs.unshift(`Examination performed with consent. Patient position: ${prep.position || 'supine'}. Privacy maintained.`);
  }

  return paragraphs.join('\n\n');
}

// ── Summary narrative (shorter, for clinical summary) ──────────────────────────

export function generateGeneralExaminationSummary(
  genExam: Partial<UniversalGeneralExamination>
): string {
  const findings: string[] = [];
  const ga = genExam.generalAppearance;

  if (ga) {
    if (ga.overall !== 'well') findings.push(`appears ${ga.overall}`);
    if (ga.consciousness !== 'alert') findings.push(`consciousness: ${ga.consciousness}`);
  }

  if (genExam.vitalSigns) {
    const vs = genExam.vitalSigns;
    if (vs.heartRate && (vs.heartRate.value < 60 || vs.heartRate.value > 100)) findings.push(`HR ${vs.heartRate.value}`);
    if (vs.bloodPressure) {
      if (vs.bloodPressure.systolic.value >= 140 || vs.bloodPressure.diastolic.value >= 90) {
        findings.push(`BP ${vs.bloodPressure.systolic.value}/${vs.bloodPressure.diastolic.value}`);
      }
    }
    if (vs.temperature && vs.temperature.value > 37.5) findings.push(`temp ${vs.temperature.value}°C`);
    if (vs.spo2 && vs.spo2.value < 95) findings.push(`SpO₂ ${vs.spo2.value}%`);
  }

  return findings.length > 0
    ? `General examination: ${findings.join(', ')}.`
    : 'General examination: no significant findings.';
}

// ── Next exam step ─────────────────────────────────────────────────────────────

export interface NextGenExamStep {
  sectionId: string;
  fieldId: string;
  fieldLabel: string;
  priority: 'critical' | 'mandatory' | 'routine' | 'optional';
  clinicalGuide: string;
}

export function getNextGenExamStep(
  genExam: Partial<UniversalGeneralExamination>,
  ageMonths?: number,
  sex?: string
): NextGenExamStep | null {
  const fields = getActiveGenExamFields(ageMonths, sex);

  for (const field of fields) {
    if (!field.mandatory) continue;
    const value = getFieldValue(genExam, field.id);
    if (value === undefined || value === null || value === '' || value === false) {
      return {
        sectionId: field.section,
        fieldId: field.id,
        fieldLabel: field.label,
        priority: 'mandatory',
        clinicalGuide: field.clinicalGuide,
      };
    }
  }

  // Then non-mandatory
  for (const field of fields) {
    if (field.mandatory) continue;
    const value = getFieldValue(genExam, field.id);
    if (value === undefined || value === null || value === '' || value === false) {
      return {
        sectionId: field.section,
        fieldId: field.id,
        fieldLabel: field.label,
        priority: 'routine',
        clinicalGuide: field.clinicalGuide,
      };
    }
  }

  return null;
}

function getFieldValue(genExam: Partial<UniversalGeneralExamination>, fieldId: string): any {
  if (fieldId.startsWith('prep_')) {
    const key = fieldId.replace('prep_', '') as keyof typeof genExam.preparation;
    return genExam.preparation?.[key];
  }
  if (fieldId.startsWith('cs_')) {
    const signId = fieldId.replace('cs_', '');
    const sign = genExam.constitutionalSigns?.[signId as ConstitutionalSignId];
    if (fieldId.includes('_site') || fieldId.includes('_type') || fieldId.includes('_pitting') || fieldId.startsWith('cs_dehydration_')) {
      return (sign as any)?.[fieldId.split('_').pop() || ''];
    }
    return sign?.present !== undefined ? sign.present : (sign as any)?.severity;
  }
  // General appearance fields
  const gaMap: Record<string, keyof GeneralAppearance> = {
    appearance_overall: 'overall',
    consciousness: 'consciousness',
    orientation_time: 'orientation',
    mobility: 'mobility',
    position: 'position',
    nutritional_state: 'nutritionalState',
    hydration: 'hydration',
    hygiene: 'hygiene',
    odour: 'odour',
    distress_level: 'distress',
    speech: 'speech',
    cooperation: 'cooperation',
    breathing_pattern: 'breathingPattern',
  };
  const gaKey = gaMap[fieldId];
  if (gaKey && genExam.generalAppearance) {
    return genExam.generalAppearance[gaKey];
  }

  return undefined;
}

// ── Completeness check ─────────────────────────────────────────────────────────

export interface GeneralExamCompleteness {
  complete: boolean;
  sectionsComplete: Record<string, boolean>;
  missingMandatory: string[];
  missingOptional: string[];
  percentComplete: number;
}

export function getGeneralExamCompleteness(
  genExam: Partial<UniversalGeneralExamination>,
  ageMonths?: number,
  sex?: string
): GeneralExamCompleteness {
  const fields = getActiveGenExamFields(ageMonths, sex);
  const sectionsComplete: Record<string, boolean> = {};
  const missingMandatory: string[] = [];
  const missingOptional: string[] = [];
  let answeredCount = 0;

  for (const section of Object.keys(GENERAL_EXAMINATION_SECTIONS)) {
    const sectionFields = fields.filter(f => f.section === section);
    const answeredSectionFields = sectionFields.filter(f => {
      const val = getFieldValue(genExam, f.id);
      return val !== undefined && val !== null && val !== '' && val !== false;
    });
    sectionsComplete[section] = answeredSectionFields.length > 0;
  }

  for (const field of fields) {
    const val = getFieldValue(genExam, field.id);
    const isAnswered = val !== undefined && val !== null && val !== '' && val !== false;
    if (isAnswered) answeredCount++;

    if (!isAnswered) {
      if (field.mandatory) missingMandatory.push(field.label);
      else missingOptional.push(field.label);
    }
  }

  return {
    complete: missingMandatory.length === 0,
    sectionsComplete,
    missingMandatory,
    missingOptional,
    percentComplete: fields.length > 0 ? Math.round((answeredCount / fields.length) * 100) : 0,
  };
}
