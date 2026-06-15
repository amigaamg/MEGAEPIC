import type { RosFindings, RosSystem, RosSymptom } from './types';

export interface RosPriorityResult {
  systems: RosFindings;
  priorityOrder: string[];
}

const ALL_ROS_SYSTEMS: RosSystem[] = [
  {
    id: 'constitutional',
    label: 'Constitutional',
    priority: 1,
    symptoms: [
      { id: 'ros_fever', label: 'Fever', present: null, details: '' },
      { id: 'ros_weight_loss', label: 'Weight Loss', present: null, details: '' },
      { id: 'ros_night_sweats', label: 'Night Sweats', present: null, details: '' },
      { id: 'ros_fatigue', label: 'Fatigue / Malaise', present: null, details: '' },
      { id: 'ros_anorexia', label: 'Loss of Appetite', present: null, details: '' },
    ],
  },
  {
    id: 'respiratory',
    label: 'Respiratory',
    priority: 2,
    symptoms: [
      { id: 'ros_cough', label: 'Cough', present: null, details: '' },
      { id: 'ros_dyspnea', label: 'Shortness of Breath', present: null, details: '' },
      { id: 'ros_wheeze', label: 'Wheezing', present: null, details: '' },
      { id: 'ros_hemoptysis', label: 'Coughing Blood', present: null, details: '' },
      { id: 'ros_sputum', label: 'Sputum Production', present: null, details: '' },
      { id: 'ros_chest_pain_resp', label: 'Chest Pain (Pleuritic)', present: null, details: '' },
    ],
  },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular',
    priority: 3,
    symptoms: [
      { id: 'ros_chest_pain_cv', label: 'Chest Pain / Discomfort', present: null, details: '' },
      { id: 'ros_palpitations', label: 'Palpitations', present: null, details: '' },
      { id: 'ros_orthopnea', label: 'Orthopnea', present: null, details: '' },
      { id: 'ros_pnd', label: 'PND', present: null, details: '' },
      { id: 'ros_leg_swelling', label: 'Leg Swelling', present: null, details: '' },
      { id: 'ros_dizziness_cv', label: 'Dizziness / Syncope', present: null, details: '' },
      { id: 'ros_claudication', label: 'Intermittent Claudication', present: null, details: '' },
    ],
  },
  {
    id: 'gastrointestinal',
    label: 'Gastrointestinal',
    priority: 4,
    symptoms: [
      { id: 'ros_abdominal_pain', label: 'Abdominal Pain', present: null, details: '' },
      { id: 'ros_nausea', label: 'Nausea / Vomiting', present: null, details: '' },
      { id: 'ros_diarrhea', label: 'Diarrhoea', present: null, details: '' },
      { id: 'ros_constipation', label: 'Constipation', present: null, details: '' },
      { id: 'ros_dysphagia', label: 'Difficulty Swallowing', present: null, details: '' },
      { id: 'ros_heartburn', label: 'Heartburn / Reflux', present: null, details: '' },
      { id: 'ros_hematemesis', label: 'Vomiting Blood', present: null, details: '' },
      { id: 'ros_melena', label: 'Black Tarry Stools', present: null, details: '' },
      { id: 'ros_rectal_bleeding', label: 'Rectal Bleeding', present: null, details: '' },
      { id: 'ros_jaundice', label: 'Jaundice', present: null, details: '' },
    ],
  },
  {
    id: 'neurological',
    label: 'Neurological',
    priority: 5,
    symptoms: [
      { id: 'ros_headache', label: 'Headache', present: null, details: '' },
      { id: 'ros_dizziness_neuro', label: 'Dizziness / Vertigo', present: null, details: '' },
      { id: 'ros_seizures', label: 'Seizures / Fits', present: null, details: '' },
      { id: 'ros_weakness', label: 'Limb Weakness', present: null, details: '' },
      { id: 'ros_numbness', label: 'Numbness / Tingling', present: null, details: '' },
      { id: 'ros_vision', label: 'Visual Changes', present: null, details: '' },
      { id: 'ros_hearing', label: 'Hearing Loss / Tinnitus', present: null, details: '' },
      { id: 'ros_tremor', label: 'Tremor / Involuntary Movements', present: null, details: '' },
      { id: 'ros_balance', label: 'Balance / Coordination Problems', present: null, details: '' },
    ],
  },
  {
    id: 'musculoskeletal',
    label: 'Musculoskeletal',
    priority: 6,
    symptoms: [
      { id: 'ros_joint_pain', label: 'Joint Pain / Swelling', present: null, details: '' },
      { id: 'ros_back_pain', label: 'Back Pain', present: null, details: '' },
      { id: 'ros_muscle_pain', label: 'Muscle Pain / Tenderness', present: null, details: '' },
      { id: 'ros_muscle_weakness', label: 'Muscle Weakness', present: null, details: '' },
      { id: 'ros_morning_stiffness', label: 'Morning Stiffness', present: null, details: '' },
    ],
  },
  {
    id: 'genitourinary',
    label: 'Genitourinary',
    priority: 7,
    symptoms: [
      { id: 'ros_dysuria', label: 'Painful Urination', present: null, details: '' },
      { id: 'ros_frequency', label: 'Urinary Frequency', present: null, details: '' },
      { id: 'ros_urgency', label: 'Urinary Urgency', present: null, details: '' },
      { id: 'ros_hematuria', label: 'Blood in Urine', present: null, details: '' },
      { id: 'ros_oliguria', label: 'Decreased Urine Output', present: null, details: '' },
      { id: 'ros_polyuria', label: 'Increased Urine Output', present: null, details: '' },
      { id: 'ros_incontinence', label: 'Urinary Incontinence', present: null, details: '' },
      { id: 'ros_vaginal_discharge', label: 'Abnormal Discharge', present: null, details: '' },
      { id: 'ros_penile_discharge', label: 'Penile Discharge', present: null, details: '' },
    ],
  },
  {
    id: 'skin',
    label: 'Skin',
    priority: 8,
    symptoms: [
      { id: 'ros_rash', label: 'Rash', present: null, details: '' },
      { id: 'ros_itching', label: 'Itching / Pruritus', present: null, details: '' },
      { id: 'ros_ulcers', label: 'Skin Ulcers / Wounds', present: null, details: '' },
      { id: 'ros_skin_changes', label: 'Nail / Hair / Skin Changes', present: null, details: '' },
    ],
  },
  {
    id: 'ent',
    label: 'ENT',
    priority: 9,
    symptoms: [
      { id: 'ros_sore_throat', label: 'Sore Throat', present: null, details: '' },
      { id: 'ros_ear_pain', label: 'Ear Pain', present: null, details: '' },
      { id: 'ros_nasal_congestion', label: 'Nasal Congestion / Discharge', present: null, details: '' },
      { id: 'ros_hearing_loss_ent', label: 'Hearing Loss', present: null, details: '' },
      { id: 'ros_tinnitus', label: 'Tinnitus', present: null, details: '' },
      { id: 'ros_epistaxis', label: 'Nosebleeds', present: null, details: '' },
    ],
  },
  {
    id: 'endocrine',
    label: 'Endocrine',
    priority: 10,
    symptoms: [
      { id: 'ros_polydipsia', label: 'Excessive Thirst', present: null, details: '' },
      { id: 'ros_polyphagia', label: 'Excessive Hunger', present: null, details: '' },
      { id: 'ros_heat_intolerance', label: 'Heat / Cold Intolerance', present: null, details: '' },
      { id: 'ros_goiter', label: 'Neck Swelling / Goiter', present: null, details: '' },
    ],
  },
  {
    id: 'psychiatric',
    label: 'Psychiatric',
    priority: 11,
    symptoms: [
      { id: 'ros_depression', label: 'Low Mood / Depression', present: null, details: '' },
      { id: 'ros_anxiety', label: 'Anxiety / Nervousness', present: null, details: '' },
      { id: 'ros_sleep_disturbance', label: 'Sleep Disturbance', present: null, details: '' },
      { id: 'ros_hallucinations', label: 'Hallucinations / Delusions', present: null, details: '' },
      { id: 'ros_suicidal', label: 'Suicidal Thoughts', present: null, details: '' },
    ],
  },
];

export function calculateRosPriority(topDiseaseIds: string[]): RosPriorityResult {
  const diseaseSystemMap: Record<string, string[]> = {
    tb_pulm: ['constitutional', 'respiratory'],
    pneumonia_pulm: ['respiratory', 'constitutional'],
    asthma_pulm: ['respiratory'],
    copd_pulm: ['respiratory', 'cardiovascular'],
    heart_failure_card: ['cardiovascular', 'respiratory', 'constitutional'],
    chest_pain: ['cardiovascular', 'gastrointestinal'],
    malaria: ['constitutional', 'neurological', 'gastrointestinal'],
    typhoid: ['constitutional', 'gastrointestinal'],
    sepsis: ['constitutional', 'cardiovascular', 'respiratory'],
    meningitis: ['neurological', 'constitutional'],
    appendicitis: ['gastrointestinal', 'constitutional'],
    cholecystitis: ['gastrointestinal', 'constitutional'],
    peptic_ulcer: ['gastrointestinal'],
    diabetes_t1: ['endocrine', 'constitutional', 'genitourinary'],
    diabetes_t2: ['endocrine', 'cardiovascular', 'neurological'],
    anemia: ['constitutional', 'cardiovascular'],
    hypothyroidism: ['endocrine', 'constitutional', 'psychiatric'],
    depression: ['psychiatric', 'constitutional'],
    ckd: ['genitourinary', 'cardiovascular', 'constitutional'],
    hiv: ['constitutional', 'respiratory', 'gastrointestinal', 'skin'],
  };

  const targetSystems = new Set<string>();
  const defaultSystems = new Set<string>(['constitutional', 'respiratory', 'cardiovascular', 'gastrointestinal', 'neurological']);

  for (const did of topDiseaseIds) {
    const systems = diseaseSystemMap[did];
    if (systems) systems.forEach(s => targetSystems.add(s));
  }

  if (targetSystems.size < 3) {
    defaultSystems.forEach(s => targetSystems.add(s));
  }

  const priorityMap: Record<string, number> = {};
  targetSystems.forEach(s => {
    const existing = ALL_ROS_SYSTEMS.find(sys => sys.id === s);
    if (existing) priorityMap[s] = existing.priority;
  });

  const sortedPriority = Array.from(targetSystems).sort((a, b) => (priorityMap[a] || 99) - (priorityMap[b] || 99));

  const orderedSystems = sortedPriority
    .map(id => ALL_ROS_SYSTEMS.find(s => s.id === id))
    .filter(Boolean) as RosSystem[];

  const remaining = ALL_ROS_SYSTEMS.filter(s => !targetSystems.has(s.id))
    .sort((a, b) => a.priority - b.priority);

  return {
    systems: [...orderedSystems, ...remaining],
    priorityOrder: sortedPriority,
  };
}

export function getInitialRos(): RosFindings {
  return ALL_ROS_SYSTEMS.map(s => ({
    ...s,
    symptoms: s.symptoms.map(sym => ({ ...sym })),
  }));
}
