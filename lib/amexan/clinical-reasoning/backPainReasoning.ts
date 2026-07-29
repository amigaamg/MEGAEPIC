import type { EncounterBrainState, InformationGap, DiseaseState } from '../encounter-brain/types';
import { FEATURES } from '../knowbase/features/featureLibrary';

type BackPainCategory = 'mechanical_non_specific' | 'radicular' | 'vertebral_fracture' | 'inflammatory_arthritis' | 'infectious' | 'neoplastic' | 'referred_visceral' | 'vascular_catastrophic';

interface BackPainDisease {
  diseaseId: string;
  diseaseName: string;
  icdCode: string;
  category: BackPainCategory;
  typicalOnset: 'sudden_minutes' | 'gradual_hours' | 'insidious_weeks' | 'chronic_years';
  location: string;
  radiation: string[];
  ageRange: [number, number];
  agePeak: [number, number];
  sexPredilection: 'none' | 'male' | 'female';
  backgroundPrevalence: number;
  riskFactors: string[];
  redFlags: string[];
  associatedSymptoms: string[];
  typicalDescription: string;
}

interface BackPainPatternRule {
  id: string;
  label: string;
  description: string;
  pattern: string[];
  suggests: string[];
  rulesOut: string[];
  priorityBoost: number;
}

const BACK_PAIN_DDX: BackPainDisease[] = [
  {
    diseaseId: 'mechanical_back_pain', diseaseName: 'Non-Specific Mechanical Low Back Pain', icdCode: 'M54.5',
    category: 'mechanical_non_specific', typicalOnset: 'gradual_hours',
    location: 'Lumbar', radiation: [],
    ageRange: [15, 80], agePeak: [25, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.4,
    riskFactors: ['heavy_lifting', 'prolonged_sitting', 'obesity', 'poor_posture', 'deconditioning'],
    redFlags: [],
    associatedSymptoms: ['muscle_spasm', 'stiffness', 'relieved_by_rest'],
    typicalDescription: 'Most common back pain. Lumbar pain without radiation, worse with movement, better with rest. No red flags.',
  },
  {
    diseaseId: 'lumbar_radiculopathy', diseaseName: 'Lumbar Radiculopathy / Sciatica (Disc Herniation)', icdCode: 'M51.1',
    category: 'radicular', typicalOnset: 'gradual_hours',
    location: 'Lumbar with leg radiation', radiation: ['Buttock', 'Posterior thigh', 'Leg', 'Foot'],
    ageRange: [20, 70], agePeak: [30, 55],
    sexPredilection: 'male', backgroundPrevalence: 0.03,
    riskFactors: ['heavy_lifting', 'prolonged_driving', 'smoking', 'obesity', 'physically_demanding_job'],
    redFlags: ['cauda_equina_syndrome', 'progressive_motor_weakness'],
    associatedSymptoms: ['leg_pain_below_knee', 'numbness', 'tingling', 'positive_slr'],
    typicalDescription: 'Unilateral leg pain worse than back pain, following a dermatomal distribution. Positive straight leg raise. May have sensory or motor deficit.',
  },
  {
    diseaseId: 'cauda_equina_syndrome', diseaseName: 'Cauda Equina Syndrome', icdCode: 'G83.4',
    category: 'radicular', typicalOnset: 'sudden_minutes',
    location: 'Lumbar', radiation: ['Both legs', 'Perineum', 'Saddle area'],
    ageRange: [20, 80], agePeak: [30, 60],
    sexPredilection: 'none', backgroundPrevalence: 0.001,
    riskFactors: ['large_disc_herniation', 'spinal_tumor', 'spinal_stenosis', 'trauma', 'hematoma'],
    redFlags: ['urinary_retention', 'fecal_incontinence', 'saddle_anesthesia', 'bilateral_leg_weakness'],
    associatedSymptoms: ['urinary_retention', 'saddle_anesthesia', 'bilateral_leg_weakness', 'loss_anal_sphincter_tone'],
    typicalDescription: 'SURGICAL EMERGENCY: Bilateral leg pain/weakness with saddle anesthesia and urinary retention. Immediate MRI and neurosurgical referral.',
  },
  {
    diseaseId: 'spinal_stenosis', diseaseName: 'Lumbar Spinal Stenosis (Neurogenic Claudication)', icdCode: 'M48.0',
    category: 'mechanical_non_specific', typicalOnset: 'chronic_years',
    location: 'Lumbar', radiation: ['Both legs', 'Buttocks'],
    ageRange: [40, 90], agePeak: [55, 80],
    sexPredilection: 'male', backgroundPrevalence: 0.005,
    riskFactors: ['age', 'degenerative_disc_disease', 'congenital_stenosis'],
    redFlags: ['cauda_equina', 'progressive_weakness'],
    associatedSymptoms: ['pseudoclaudication', 'relieved_by_sitting', 'relieved_by_leaning_forward'],
    typicalDescription: 'Leg pain/weakness with walking, relieved by sitting or leaning forward. Bicycle test: worse on upright bike, better on leaning bike.',
  },
  {
    diseaseId: 'vertebral_compression_fracture', diseaseName: 'Vertebral Compression Fracture (Osteoporotic)', icdCode: 'M80.0',
    category: 'vertebral_fracture', typicalOnset: 'sudden_minutes',
    location: 'Thoracic or lumbar', radiation: ['Flank', 'Rib area'],
    ageRange: [50, 90], agePeak: [65, 85],
    sexPredilection: 'female', backgroundPrevalence: 0.02,
    riskFactors: ['osteoporosis', 'age', 'steroid_use', 'menopause', 'rheumatoid_arthritis'],
    redFlags: ['neurological_deficit', 'multiple_fractures'],
    associatedSymptoms: ['sudden_onset', 'point_tenderness', 'height_loss', 'kyphosis'],
    typicalDescription: 'Sudden onset of severe localized back pain after minimal trauma (or none) in elderly or osteoporotic patient. Point tenderness over affected vertebra.',
  },
  {
    diseaseId: 'ankylosing_spondylitis', diseaseName: 'Ankylosing Spondylitis / Axial Spondyloarthropathy', icdCode: 'M45',
    category: 'inflammatory_arthritis', typicalOnset: 'insidious_weeks',
    location: 'Lumbar, sacroiliac, thoracic', radiation: ['Buttock', 'Anterior thigh'],
    ageRange: [15, 50], agePeak: [20, 35],
    sexPredilection: 'male', backgroundPrevalence: 0.004,
    riskFactors: ['hla_b27', 'family_history', 'psoriasis', 'ibd'],
    redFlags: ['atlantoaxial_subluxation', 'aortitis', 'cauda_equina'],
    associatedSymptoms: ['morning_stiffness', 'improves_with_exercise', 'nocturnal_pain', 'sacroiliitis'],
    typicalDescription: 'Chronic inflammatory back pain: insidious onset, age <40, morning stiffness >30 min, improves with exercise, not relieved by rest.',
  },
  {
    diseaseId: 'vertebral_osteomyelitis', diseaseName: 'Vertebral Osteomyelitis / Discitis', icdCode: 'M46.2',
    category: 'infectious', typicalOnset: 'insidious_weeks',
    location: 'Thoracic or lumbar', radiation: [],
    ageRange: [20, 80], agePeak: [40, 70],
    sexPredilection: 'male', backgroundPrevalence: 0.001,
    riskFactors: ['ivdu', 'immunosuppression', 'diabetes', 'recent_infection', 'spinal_surgery'],
    redFlags: ['epidural_abscess', 'neurological_deficit', 'sepsis'],
    associatedSymptoms: ['fever', 'night_sweats', 'weight_loss', 'severe_pain'],
    typicalDescription: 'Severe progressive back pain with fever and constitutional symptoms. Epidural extension can cause rapid neurological deterioration.',
  },
  {
    diseaseId: 'spinal_metastasis', diseaseName: 'Spinal Metastasis / Primary Bone Tumor', icdCode: 'C79.5',
    category: 'neoplastic', typicalOnset: 'insidious_weeks',
    location: 'Thoracic most common', radiation: [],
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.002,
    riskFactors: ['known_cancer', 'breast_cancer', 'lung_cancer', 'prostate_cancer', 'multiple_myeloma'],
    redFlags: ['spinal_cord_compression', 'neurological_deficit'],
    associatedSymptoms: ['night_pain', 'weight_loss', 'nocturnal_pain', 'pain_not_relieved_by_rest'],
    typicalDescription: 'Progressive back pain worse at night, not relieved by rest. Known primary cancer. Spinal cord compression is an emergency.',
  },
  {
    diseaseId: 'ruptured_aaa_back', diseaseName: 'Ruptured/Leaking AAA (Referred Back Pain)', icdCode: 'I71.3',
    category: 'vascular_catastrophic', typicalOnset: 'sudden_minutes',
    location: 'Mid-abdomen / lower back', radiation: ['Flank', 'Groin'],
    ageRange: [50, 90], agePeak: [65, 85],
    sexPredilection: 'male', backgroundPrevalence: 0.005,
    riskFactors: ['hypertension', 'smoking', 'male_sex', 'family_history_aaa'],
    redFlags: ['hypotension', 'pulsatile_mass', 'syncope'],
    associatedSymptoms: ['abdominal_pain', 'syncope', 'hypotension', 'pulsatile_abdominal_mass'],
    typicalDescription: 'Sudden severe back/abdominal pain with hemodynamic collapse. Pulsatile abdominal mass. Time-critical surgical emergency.',
  },
  {
    diseaseId: 'pancreatitis_back_pain', diseaseName: 'Acute Pancreatitis (Referred Back Pain)', icdCode: 'K85',
    category: 'referred_visceral', typicalOnset: 'gradual_hours',
    location: 'Epigastrium radiating to back', radiation: ['Upper back', 'Left flank'],
    ageRange: [20, 90], agePeak: [40, 70],
    sexPredilection: 'none', backgroundPrevalence: 0.02,
    riskFactors: ['gallstones', 'alcohol', 'hypertriglyceridemia'],
    redFlags: ['hypotension', 'respiratory_distress'],
    associatedSymptoms: ['epigastric_pain', 'nausea', 'vomiting', 'pain_better_leaning_forward'],
    typicalDescription: 'Epigastric pain with radiation to the back, relieved by leaning forward. Nausea and vomiting common.',
  },
  {
    diseaseId: 'renal_colic_back', diseaseName: 'Ureteric Colic (Referred Back/Flank Pain)', icdCode: 'N20',
    category: 'referred_visceral', typicalOnset: 'sudden_minutes',
    location: 'Flank', radiation: ['Groin', 'Testicle/Labia'],
    ageRange: [15, 80], agePeak: [20, 60],
    sexPredilection: 'male', backgroundPrevalence: 0.05,
    riskFactors: ['dehydration', 'family_history_stones', 'hyperparathyroidism', 'gout'],
    redFlags: ['anuria', 'sepsis', 'acute_renal_failure'],
    associatedSymptoms: ['colicky_pain', 'hematuria', 'nausea', 'vomiting', 'dysuria'],
    typicalDescription: 'Sudden severe colicky flank pain radiating to the groin. Patient cannot sit still. Hematuria is common.',
  },
  {
    diseaseId: 'herpes_zoster_back', diseaseName: 'Herpes Zoster (Pre-eruptive) — Thoracic', icdCode: 'B02.2',
    category: 'referred_visceral', typicalOnset: 'gradual_hours',
    location: 'Dermatomal (thoracic most common)', radiation: ['Unilateral dermatomal band'],
    ageRange: [30, 90], agePeak: [50, 80],
    sexPredilection: 'none', backgroundPrevalence: 0.01,
    riskFactors: ['age', 'immunosuppression', 'prior_chickenpox'],
    redFlags: ['disseminated', 'ophthalmic', 'postherpetic_neuralgia'],
    associatedSymptoms: ['burning_pain', 'rash', 'vesicles', 'allodynia'],
    typicalDescription: 'Burning/stabbing unilateral pain in dermatomal distribution before vesicular rash appears. Rash is diagnostic.',
  },
];

const BACK_PAIN_PATTERNS: BackPainPatternRule[] = [
  {
    id: 'cauda_equina', label: 'Cauda Equina Syndrome',
    description: 'Back pain + saddle anesthesia + urinary retention = cauda equina — SURGICAL EMERGENCY',
    pattern: ['low_back_pain', 'urinary_retention', 'numbness_tingling'],
    suggests: ['cauda_equina_syndrome'],
    rulesOut: ['mechanical_back_pain', 'lumbar_radiculopathy'],
    priorityBoost: 40,
  },
  {
    id: 'sciatica_pattern', label: 'Sciatica / Radiculopathy',
    description: 'Unilateral leg pain worse than back pain with dermatomal distribution = radiculopathy',
    pattern: ['low_back_pain', 'pain_radiation', 'numbness_tingling'],
    suggests: ['lumbar_radiculopathy', 'spinal_stenosis'],
    rulesOut: ['mechanical_back_pain'],
    priorityBoost: 20,
  },
  {
    id: 'inflammatory_back_pain', label: 'Inflammatory Back Pain',
    description: 'Age <40, insidious onset, morning stiffness >30 min, improves with exercise = axSpA',
    pattern: ['low_back_pain', 'morning_stiffness'],
    suggests: ['ankylosing_spondylitis'],
    rulesOut: ['mechanical_back_pain', 'lumbar_radiculopathy'],
    priorityBoost: 20,
  },
  {
    id: 'fracture_osteoporosis', label: 'Osteoporotic Fracture',
    description: 'Elderly with sudden localized back pain after minimal trauma = compression fracture',
    pattern: ['low_back_pain', 'pain_onset'],
    suggests: ['vertebral_compression_fracture'],
    rulesOut: ['mechanical_back_pain'],
    priorityBoost: 20,
  },
  {
    id: 'spinal_infection', label: 'Spinal Infection',
    description: 'Back pain + fever + IVDU/immunosuppression = vertebral osteomyelitis',
    pattern: ['low_back_pain', 'fever', 'ivdu'],
    suggests: ['vertebral_osteomyelitis'],
    rulesOut: ['mechanical_back_pain', 'lumbar_radiculopathy'],
    priorityBoost: 30,
  },
  {
    id: 'back_pain_cancer', label: 'Malignancy / Metastasis',
    description: 'Back pain worse at night + known cancer + weight loss = spinal metastasis',
    pattern: ['low_back_pain', 'weight_loss', 'night_pain'],
    suggests: ['spinal_metastasis'],
    rulesOut: ['mechanical_back_pain'],
    priorityBoost: 30,
  },
  {
    id: 'aaa_catastrophic', label: 'AAA Rupture',
    description: 'Age >50 + sudden back/abdominal pain + hypotension = ruptured AAA',
    pattern: ['low_back_pain', 'abdominal_pain', 'syncope'],
    suggests: ['ruptured_aaa_back'],
    rulesOut: ['mechanical_back_pain', 'lumbar_radiculopathy'],
    priorityBoost: 40,
  },
  {
    id: 'renal_colic_pattern', label: 'Renal Colic',
    description: 'Sudden colicky flank-to-groin pain with hematuria = ureteric colic',
    pattern: ['low_back_pain', 'pain_radiation', 'hematuria'],
    suggests: ['renal_colic_back'],
    rulesOut: ['mechanical_back_pain', 'lumbar_radiculopathy'],
    priorityBoost: 20,
  },
  {
    id: 'pancreatic_back_pain', label: 'Pancreatitis Referred Back Pain',
    description: 'Epigastric pain radiating to back, relieved leaning forward = pancreatitis',
    pattern: ['low_back_pain', 'vomiting', 'abdominal_pain'],
    suggests: ['pancreatitis_back_pain'],
    rulesOut: ['mechanical_back_pain'],
    priorityBoost: 20,
  },
  {
    id: 'neurogenic_claudication', label: 'Neurogenic Claudication',
    description: 'Leg pain with walking relieved by sitting/leaning forward = spinal stenosis',
    pattern: ['low_back_pain', 'numbness_tingling'],
    suggests: ['spinal_stenosis'],
    rulesOut: ['lumbar_radiculopathy', 'mechanical_back_pain'],
    priorityBoost: 15,
  },
];

export function getBackPainDdx(): BackPainDisease[] {
  return BACK_PAIN_DDX;
}

export function getBackPainPatterns(): BackPainPatternRule[] {
  return BACK_PAIN_PATTERNS;
}

export function classifyBackPain(
  age: number, onset: string, radiation: boolean, fever: boolean, knownCancer: boolean,
): { category: BackPainCategory; urgency: 'routine' | 'urgent' | 'emergency' } {
  if (knownCancer) return { category: 'neoplastic', urgency: 'urgent' };
  if (fever) return { category: 'infectious', urgency: 'urgent' };
  if (onset === 'sudden_minutes' && age > 50) return { category: 'vertebral_fracture', urgency: 'urgent' };
  if (radiation) return { category: 'radicular', urgency: 'routine' };
  return { category: 'mechanical_non_specific', urgency: 'routine' };
}

export function getBackPainGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  const BACK_PAIN_GAP_DEFS: { id: string; label: string; features: string[]; priority: number; rationale: string; category: InformationGap['category'] }[] = [
    { id: 'back_pain_presence', label: 'Back Pain Confirmation', features: ['low_back_pain'], priority: 85, rationale: 'Confirm pain location, onset, and severity.', category: 'documentation' },
    { id: 'back_pain_onset', label: 'Back Pain Onset', features: ['pain_onset'], priority: 80, rationale: 'Sudden = fracture, AAA, or disc. Insidious = inflammatory, infection, or neoplasm.', category: 'diagnostic' },
    { id: 'back_pain_radiation', label: 'Radiation Pattern', features: ['pain_radiation', 'pain_location_now'], priority: 82, rationale: 'Radiation to leg = radiculopathy. To groin = renal/AAA. To epigastrium = pancreatic.', category: 'diagnostic' },
    { id: 'back_pain_red_flag_ces', label: 'RED FLAG: Cauda Equina', features: ['urinary_retention', 'numbness_tingling', 'fecal_incontinence'], priority: 100, rationale: 'CRITICAL: Saddle anesthesia + urinary retention = cauda equina. EMERGENCY MRI/surgery.', category: 'life_threatening' },
    { id: 'back_pain_red_flag_malignancy', label: 'RED FLAG: Malignancy', features: ['known_cancer', 'weight_loss', 'night_pain'], priority: 95, rationale: 'Known cancer + back pain = metastasis. Night pain and weight loss = malignancy.', category: 'life_threatening' },
    { id: 'back_pain_red_flag_infection', label: 'RED FLAG: Infection', features: ['fever', 'fever_chills', 'ivdu'], priority: 90, rationale: 'Fever + back pain = spinal infection (osteomyelitis, discitis, epidural abscess).', category: 'life_threatening' },
    { id: 'back_pain_red_flag_aaa', label: 'RED FLAG: AAA', features: ['hypertension', 'smoking', 'abdominal_pain'], priority: 95, rationale: 'Age >50 + HTN/smoking + back/abdominal pain = AAA until proven.', category: 'life_threatening' },
    { id: 'back_pain_fracture', label: 'Fracture Risk', features: ['osteoporosis', 'steroid_use'], priority: 80, rationale: 'Osteoporotic patient with sudden back pain = compression fracture.', category: 'diagnostic' },
    { id: 'back_pain_inflammatory', label: 'Inflammatory Features', features: ['morning_stiffness', 'pain_relieving_factors'], priority: 75, rationale: 'Morning stiffness >30 min with exercise improvement = inflammatory arthritis.', category: 'diagnostic' },
    { id: 'back_pain_motor_sensory', label: 'Motor and Sensory Deficit', features: ['numbness_tingling', 'weakness', 'proximal_muscle_weakness'], priority: 85, rationale: 'Assess for neurological deficit — guides urgency of surgical referral.', category: 'diagnostic' },
    { id: 'back_pain_referred', label: 'Referred Visceral Causes', features: ['abdominal_pain', 'hematuria', 'nausea'], priority: 70, rationale: 'Assess for referred causes: renal colic, pancreatitis, AAA, PUD.', category: 'diagnostic' },
  ];

  for (const def of BACK_PAIN_GAP_DEFS) {
    const answeredCount = def.features.filter(f => answered.has(f)).length;
    if (answeredCount === 0) {
      const firstFeature = def.features[0];
      const feature = FEATURES[firstFeature];
      if (feature) {
        gaps.push({
          featureId: firstFeature,
          label: feature.label,
          category: def.category,
          priorityScore: def.priority,
          reasonEssential: def.rationale,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: 'Back Pain Assessment',
        });
      }
    } else if (answeredCount < def.features.length && def.features.length > 1) {
      const unanswered = def.features.find(f => !answered.has(f));
      if (unanswered) {
        const feature = FEATURES[unanswered];
        if (feature) {
          gaps.push({
            featureId: unanswered,
            label: feature.label,
            category: def.category,
            priorityScore: def.priority - 10,
            reasonEssential: def.rationale,
            type: feature.type,
            options: feature.options,
            clinicalGuide: feature.clinicalGuide,
            groupLabel: 'Back Pain Assessment',
          });
        }
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getBackPainPatternGaps(
  state: EncounterBrainState,
  answeredFeatureIds: string[],
  activeDiseaseStates: Record<string, DiseaseState>,
): InformationGap[] {
  const gaps: InformationGap[] = [];
  const answered = new Set(answeredFeatureIds);

  for (const pattern of BACK_PAIN_PATTERNS) {
    const patternAnswered = pattern.pattern.filter(f => answered.has(f));
    const patternUnanswered = pattern.pattern.filter(f => !answered.has(f));

    if (patternAnswered.length >= 2 && patternUnanswered.length > 0) {
      for (const featureId of patternUnanswered) {
        const feature = FEATURES[featureId];
        if (!feature) continue;

        const matchingDiseases = pattern.suggests.filter(d => activeDiseaseStates[d]?.currentProb > 0.01).length;
        const boost = matchingDiseases > 0 ? pattern.priorityBoost + 10 : pattern.priorityBoost;

        gaps.push({
          featureId,
          label: feature.label,
          category: 'diagnostic',
          priorityScore: Math.min(100, 60 + boost),
          reasonEssential: `Back pain pattern "${pattern.label}" partially matched (${patternAnswered.length}/${pattern.pattern.length}). ${pattern.description}`,
          type: feature.type,
          options: feature.options,
          clinicalGuide: feature.clinicalGuide,
          groupLabel: `Pattern: ${pattern.label}`,
        });
      }
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getBiodataAdjustedBackPainPriors(
  state: EncounterBrainState,
): Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> {
  const result: Record<string, { diseaseId: string; diseaseName: string; priorShift: number; rationale: string }> = {};
  const age = state.patient.ageYears;
  const sex = state.patient.sex;

  for (const ddx of BACK_PAIN_DDX) {
    let shift = 0;
    const reasons: string[] = [];

    if (age >= ddx.ageRange[0] && age <= ddx.ageRange[1]) {
      shift += 0.02;
      if (age >= ddx.agePeak[0] && age <= ddx.agePeak[1]) {
        shift += 0.05;
        reasons.push(`peak age ${ddx.agePeak[0]}-${ddx.agePeak[1]}`);
      }
    } else {
      shift -= 0.03;
    }

    if (ddx.sexPredilection === 'male' && sex === 'male') {
      shift += 0.03;
      reasons.push('male predominance');
    } else if (ddx.sexPredilection === 'female' && sex === 'female') {
      shift += 0.03;
      reasons.push('female predominance');
    }

    result[ddx.diseaseId] = {
      diseaseId: ddx.diseaseId,
      diseaseName: ddx.diseaseName,
      priorShift: Math.max(-0.03, Math.min(0.15, shift)),
      rationale: reasons.length > 0 ? reasons.join('; ') : 'no specific biodata adjustment',
    };
  }

  return result;
}
