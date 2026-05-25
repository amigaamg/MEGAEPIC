import { PatientForm } from '../../types';
import { PatientContext } from './types';
import { runInference, symptomMap, signMap } from './scorer';

function extractSimpleContext(form: PatientForm): PatientContext {
  return {
    ageMonths: parseInt(form.biodata.ageMonths) || 0,
    isHIVPositive: form.pmh.hiv,
    isMalnourished: parseFloat(form.vitals.muac) < 12.5 || form.nutrition.malnutritionSigns.length > 0,
    hasAtopy: form.family.atopyFamily || form.pmh.asthmaDx,
    hasFamilyAsthma: form.family.asthmaFamily,
    isSmokingExposure: form.family.smokingExposure,
    hasTbContact: !!form.hpi.tbContact,
    isOvercrowding: !!(form.family.housingConditions?.toLowerCase().includes('crowded')),
    isUnvaccinated: !!(form.immunization.status?.toLowerCase() === 'none' || form.immunization.status?.toLowerCase() === 'incomplete'),
  };
}

const PHASE_IDS = ['biodata','complaints','hpi','pmh','birth','nutrition','family','ros','exam_general','exam_systemic','summary','management','note'];

interface FeatureEntry {
  field: string;
  phase: string;
  label: string;
}

const SYMPTOM_ENTRIES: Record<string, FeatureEntry> = {
  cough: { field: '', phase: 'complaints', label: 'Cough' },
  fever: { field: '', phase: 'complaints', label: 'Fever' },
  wheeze: { field: '', phase: 'complaints', label: 'Wheeze' },
  difficulty_breathing: { field: '', phase: 'complaints', label: 'Difficulty breathing' },
  stridor: { field: '', phase: 'complaints', label: 'Stridor' },
  chest_pain: { field: '', phase: 'complaints', label: 'Chest pain' },
  hemoptysis: { field: '', phase: 'complaints', label: 'Hemoptysis' },
  noisy_breathing: { field: '', phase: 'complaints', label: 'Noisy breathing' },
  reduced_feeding: { field: '', phase: 'hpi', label: 'Reduced feeding' },
  lethargy: { field: '', phase: 'complaints', label: 'Lethargy' },
  cyanosis: { field: '', phase: 'complaints', label: 'Cyanosis' },
  night_sweats: { field: '', phase: 'hpi', label: 'Night sweats' },
  weight_loss: { field: '', phase: 'hpi', label: 'Weight loss' },
  nasal_discharge: { field: '', phase: 'complaints', label: 'Nasal discharge' },
  sore_throat: { field: '', phase: 'complaints', label: 'Sore throat' },
  chest_tightness: { field: '', phase: 'complaints', label: 'Chest tightness' },
  rash: { field: '', phase: 'complaints', label: 'Rash' },
  ear_pain: { field: '', phase: 'complaints', label: 'Ear pain' },
  abdominal_pain: { field: '', phase: 'complaints', label: 'Abdominal pain' },
  fast_breathing: { field: '', phase: 'exam_general', label: 'Fast breathing / Tachypnoea' },
  difficulty_feeding: { field: '', phase: 'hpi', label: 'Difficulty feeding' },
  poor_feeding: { field: '', phase: 'hpi', label: 'Poor feeding' },
  barking_cough: { field: '', phase: 'hpi', label: 'Barking cough (croup)' },
  hoarseness: { field: '', phase: 'hpi', label: 'Hoarseness' },
  dysphagia: { field: '', phase: 'hpi', label: 'Drooling / dysphagia' },
  choking_episode: { field: '', phase: 'hpi', label: 'Sudden choking episode' },
  unilateral_wheeze: { field: '', phase: 'hpi', label: 'Unilateral wheeze' },
  sudden_cough: { field: '', phase: 'hpi', label: 'Sudden onset cough' },
  chronic_cough: { field: '', phase: 'hpi', label: 'Chronic cough (>4 weeks)' },
  tb_contact: { field: '', phase: 'hpi', label: 'TB contact history' },
  sweating_during_feeds: { field: '', phase: 'hpi', label: 'Sweating during feeds' },
  recurrent_respiratory_infections: { field: '', phase: 'pmh', label: 'Recurrent respiratory infections' },
  orthopnea: { field: '', phase: 'hpi', label: 'Orthopnoea' },
  fatigue: { field: '', phase: 'ros', label: 'Easy fatigability' },
  palpitations: { field: '', phase: 'ros', label: 'Palpitations' },
  headache: { field: '', phase: 'ros', label: 'Headache' },
  irritability: { field: '', phase: 'hpi', label: 'Irritability / vomiting' },
  seizures: { field: '', phase: 'ros', label: 'Seizures' },
  vomiting: { field: '', phase: 'ros', label: 'Vomiting' },
  altered_mental_state: { field: '', phase: 'exam_systemic', label: 'Altered mental state / conscious level' },
  difficulty_swallowing: { field: '', phase: 'hpi', label: 'Difficulty swallowing' },
  paroxysmal_cough: { field: '', phase: 'hpi', label: 'Paroxysmal / whooping cough' },
  post_tussive_vomiting: { field: '', phase: 'hpi', label: 'Post-tussive vomiting' },
  exercise_triggered_symptoms: { field: '', phase: 'hpi', label: 'Exercise-triggered symptoms' },
  constipation: { field: '', phase: 'ros', label: 'Constipation' },
  hypothermia: { field: '', phase: 'exam_general', label: 'Hypothermia' },
  lymphadenopathy: { field: '', phase: 'exam_general', label: 'Lymphadenopathy' },
};

const SIGN_ENTRIES: Record<string, FeatureEntry> = {
  crackles: { field: '', phase: 'exam_systemic', label: 'Crackles / crepitations' },
  bronchial_breathing: { field: '', phase: 'exam_systemic', label: 'Bronchial breath sounds' },
  chest_indrawing: { field: '', phase: 'exam_systemic', label: 'Chest indrawing' },
  tachypnea: { field: '', phase: 'exam_general', label: 'Tachypnoea (RR)' },
  hypoxia: { field: '', phase: 'exam_general', label: 'Hypoxia (SpO₂)' },
  wheeze: { field: '', phase: 'exam_systemic', label: 'Wheeze on auscultation' },
  stridor: { field: '', phase: 'exam_systemic', label: 'Inspiratory stridor' },
  prolonged_expiration: { field: '', phase: 'exam_systemic', label: 'Prolonged expiration' },
  hyperinflation: { field: '', phase: 'exam_systemic', label: 'Hyperinflation' },
  dullness_to_percussion: { field: '', phase: 'exam_systemic', label: 'Dullness to percussion' },
  reduced_air_entry: { field: '', phase: 'exam_systemic', label: 'Reduced air entry' },
  tracheal_deviation: { field: '', phase: 'exam_systemic', label: 'Tracheal deviation' },
  hyperresonance: { field: '', phase: 'exam_systemic', label: 'Hyperresonance' },
  absent_breath_sounds: { field: '', phase: 'exam_systemic', label: 'Absent breath sounds' },
  toxic_appearance: { field: '', phase: 'exam_general', label: 'Toxic / severely ill appearance' },
  drooling: { field: '', phase: 'hpi', label: 'Drooling (HPI)' },
  tripod_posture: { field: '', phase: 'hpi', label: 'Tripod posture' },
  asymmetrical_air_entry: { field: '', phase: 'exam_systemic', label: 'Asymmetrical air entry' },
  clubbing: { field: '', phase: 'exam_general', label: 'Digital clubbing' },
  murmur: { field: '', phase: 'exam_systemic', label: 'Heart murmur' },
  cyanosis: { field: '', phase: 'exam_general', label: 'Central cyanosis' },
  hepatomegaly: { field: '', phase: 'exam_systemic', label: 'Hepatomegaly' },
  gallop_rhythm: { field: '', phase: 'exam_systemic', label: 'S3 gallop rhythm' },
  tachycardia: { field: '', phase: 'exam_general', label: 'Tachycardia (HR)' },
  hypotension: { field: '', phase: 'exam_general', label: 'Hypotension (BP)' },
  prolonged_cap_refill: { field: '', phase: 'exam_systemic', label: 'Prolonged capillary refill' },
  pallor: { field: '', phase: 'exam_general', label: 'Pallor' },
  jaundice: { field: '', phase: 'exam_general', label: 'Jaundice' },
  petechiae: { field: '', phase: 'exam_systemic', label: 'Petechiae / purpura' },
  splenomegaly: { field: '', phase: 'exam_systemic', label: 'Splenomegaly' },
  neck_stiffness: { field: '', phase: 'exam_systemic', label: 'Neck stiffness' },
  bulging_fontanelle: { field: '', phase: 'exam_systemic', label: 'Bulging fontanelle' },
  altered_consciousness: { field: '', phase: 'exam_systemic', label: 'Altered consciousness level' },
  prolonged_convulsion: { field: '', phase: 'ros', label: 'Prolonged convulsion' },
  reduced_tone: { field: '', phase: 'exam_systemic', label: 'Reduced tone / hypotonia' },
  areflexia: { field: '', phase: 'exam_systemic', label: 'Areflexia / absent reflexes' },
  elevated_bp: { field: '', phase: 'exam_general', label: 'Elevated blood pressure' },
  cervical_lymphadenopathy: { field: '', phase: 'exam_general', label: 'Cervical lymphadenopathy' },
  rash: { field: '', phase: 'exam_systemic', label: 'Skin rash' },
};

export interface GuideItem {
  label: string;
  diseaseName: string;
  diseaseId: string;
  priority: number;
  present: boolean;
}

export interface AdaptiveGuideData {
  topDisease: { name: string; prob: number } | null;
  secondaryDiseases: { name: string; prob: number }[];
  items: GuideItem[];
}

export function getAdaptiveGuidance(phaseIdx: number, form: PatientForm): AdaptiveGuideData | null {
  const scored = runInference(form).filter(d => d.probability > 0);
  if (scored.length === 0) return null;

  const top = scored.slice(0, 3);
  const phase = PHASE_IDS[phaseIdx];
  if (phase === 'biodata' || phase === 'summary' || phase === 'management' || phase === 'note') return null;

  const ctx = extractSimpleContext(form);
  const items: GuideItem[] = [];
  const seenFields = new Set<string>();

  for (const sd of top) {
    for (const feat of sd.disease.historyFeatures || []) {
      const entry = SYMPTOM_ENTRIES[feat.symptomId];
      if (!entry || entry.phase !== phase) continue;
      if (seenFields.has(feat.symptomId)) continue;
      seenFields.add(feat.symptomId);
      const present = symptomMap[feat.symptomId]?.(form, ctx) ?? false;
      items.push({
        label: entry.label,
        diseaseName: sd.disease.name,
        diseaseId: sd.disease.id,
        priority: feat.weight,
        present,
      });
    }

    for (const feat of sd.disease.examFeatures || []) {
      const entry = SIGN_ENTRIES[feat.signId];
      if (!entry || entry.phase !== phase) continue;
      if (seenFields.has(feat.signId)) continue;
      seenFields.add(feat.signId);
      const present = signMap[feat.signId]?.(form) ?? false;
      items.push({
        label: entry.label,
        diseaseName: sd.disease.name,
        diseaseId: sd.disease.id,
        priority: feat.baseWeight * (feat.doubleWeight ? 2 : 1),
        present,
      });
    }
  }

  items.sort((a, b) => b.priority - a.priority);

  return {
    topDisease: top[0] ? { name: top[0].disease.name, prob: Math.round(top[0].probability * 100) } : null,
    secondaryDiseases: top.slice(1).map(d => ({ name: d.disease.name, prob: Math.round(d.probability * 100) })),
    items: items.slice(0, 8),
  };
}
