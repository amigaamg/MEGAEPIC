export interface SystemicExamFeature {
  id: string;
  label: string;
  systemId: string;
}

export interface SystemicExamSystem {
  systemId: string;
  systemName: string;
  icon: string;
  features: SystemicExamFeature[];
}

const SYSTEMIC_EXAM_SYSTEMS: SystemicExamSystem[] = [
  {
    systemId: 'respiratory',
    systemName: 'Respiratory System',
    icon: '🫁',
    features: [
      { id: 'resp_inspection', label: 'Inspection — chest shape, symmetry, scars, breathing pattern', systemId: 'respiratory' },
      { id: 'resp_trachea', label: 'Trachea — central or deviated', systemId: 'respiratory' },
      { id: 'resp_expansion', label: 'Chest expansion — equal/reduced (side)', systemId: 'respiratory' },
      { id: 'resp_percussion', label: 'Percussion note — resonant, dull, stony dull, hyperresonant', systemId: 'respiratory' },
      { id: 'resp_auscultation', label: 'Breath sounds — vesicular, bronchial, reduced, absent', systemId: 'respiratory' },
      { id: 'resp_added', label: 'Added sounds — crackles, wheeze, pleural rub, stridor', systemId: 'respiratory' },
      { id: 'resp_vocal', label: 'Vocal resonance — normal, increased, decreased', systemId: 'respiratory' },
      { id: 'resp_summary', label: 'Respiratory system summary', systemId: 'respiratory' },
    ],
  },
  {
    systemId: 'cardiovascular',
    systemName: 'Cardiovascular System',
    icon: '❤️',
    features: [
      { id: 'cvs_inspection', label: 'Inspection — scars, visible pulsations, JVP', systemId: 'cardiovascular' },
      { id: 'cvs_palpation', label: 'Palpation — apex beat, thrills, heaves', systemId: 'cardiovascular' },
      { id: 'cvs_auscultation', label: 'Heart sounds — S1, S2, S3, S4, murmurs, rub', systemId: 'cardiovascular' },
      { id: 'cvs_murmur_site', label: 'Murmur site — apex, left sternal edge, aortic, pulmonary', systemId: 'cardiovascular' },
      { id: 'cvs_murmur_timing', label: 'Murmur timing — systolic, diastolic, continuous', systemId: 'cardiovascular' },
      { id: 'cvs_murmur_grade', label: 'Murmur grade (1-6)', systemId: 'cardiovascular' },
      { id: 'cvs_radiation', label: 'Radiation — carotids, axilla, back', systemId: 'cardiovascular' },
      { id: 'cvs_peripheral', label: 'Peripheral pulses — radial, femoral, dorsalis pedis, posterior tibial', systemId: 'cardiovascular' },
      { id: 'cvs_capillary', label: 'Capillary refill time (seconds)', systemId: 'cardiovascular' },
      { id: 'cvs_summary', label: 'Cardiovascular system summary', systemId: 'cardiovascular' },
    ],
  },
  {
    systemId: 'gastrointestinal',
    systemName: 'Gastrointestinal / Abdomen',
    icon: '🫃',
    features: [
      { id: 'gi_inspection', label: 'Inspection — distension, scars, visible peristalsis, hernias', systemId: 'gastrointestinal' },
      { id: 'gi_auscultation', label: 'Bowel sounds — present, absent, hyperactive, tinkling', systemId: 'gastrointestinal' },
      { id: 'gi_palpation_superficial', label: 'Superficial palpation — tenderness, guarding, rigidity', systemId: 'gastrointestinal' },
      { id: 'gi_palpation_deep', label: 'Deep palpation — masses, organomegaly', systemId: 'gastrointestinal' },
      { id: 'gi_liver', label: 'Liver — palpable size (cm below costal margin), tender, smooth/nodular', systemId: 'gastrointestinal' },
      { id: 'gi_spleen', label: 'Spleen — palpable (cm), from costal margin', systemId: 'gastrointestinal' },
      { id: 'gi_percussion', label: 'Percussion — tympanic, dull, shifting dullness', systemId: 'gastrointestinal' },
      { id: 'gi_hernial', label: 'Hernial orifices — examine', systemId: 'gastrointestinal' },
      { id: 'gi_dre', label: 'Digital rectal examination — findings', systemId: 'gastrointestinal' },
      { id: 'gi_summary', label: 'Gastrointestinal system summary', systemId: 'gastrointestinal' },
    ],
  },
  {
    systemId: 'neurological',
    systemName: 'Neurological System',
    icon: '🧠',
    features: [
      { id: 'neuro_mental', label: 'Mental state — alertness, orientation, speech, cognition', systemId: 'neurological' },
      { id: 'neuro_cranial', label: 'Cranial nerves — I-XII (summarize abnormalities)', systemId: 'neurological' },
      { id: 'neuro_motor', label: 'Motor system — tone, power (MRC 0-5), bulk, coordination', systemId: 'neurological' },
      { id: 'neuro_sensory', label: 'Sensory system — light touch, pain, temperature, proprioception, vibration', systemId: 'neurological' },
      { id: 'neuro_reflexes', label: 'Reflexes — biceps, triceps, supinator, knee, ankle, plantar', systemId: 'neurological' },
      { id: 'neuro_cerebellar', label: 'Cerebellar signs — nystagmus, dysmetria, dysdiadochokinesia, gait', systemId: 'neurological' },
      { id: 'neuro_meningeal', label: 'Meningeal signs — neck stiffness, Kernig, Brudzinski', systemId: 'neurological' },
      { id: 'neuro_signs', label: 'Abnormal signs — clonus, fasciculations, spasticity', systemId: 'neurological' },
      { id: 'neuro_summary', label: 'Neurological system summary', systemId: 'neurological' },
    ],
  },
  {
    systemId: 'musculoskeletal',
    systemName: 'Musculoskeletal System',
    icon: '💪',
    features: [
      { id: 'msk_inspection', label: 'Inspection — swelling, deformity, muscle wasting, erythema', systemId: 'musculoskeletal' },
      { id: 'msk_palpation', label: 'Palpation — tenderness, warmth, crepitus', systemId: 'musculoskeletal' },
      { id: 'msk_rom', label: 'Range of motion — active and passive (joints affected)', systemId: 'musculoskeletal' },
      { id: 'msk_spine', label: 'Spine — tenderness, deformity, scoliosis', systemId: 'musculoskeletal' },
      { id: 'msk_summary', label: 'Musculoskeletal system summary', systemId: 'musculoskeletal' },
    ],
  },
  {
    systemId: 'genitourinary',
    systemName: 'Genitourinary System',
    icon: '🚽',
    features: [
      { id: 'gu_inspection', label: 'Inspection — suprapubic fullness, genital examination', systemId: 'genitourinary' },
      { id: 'gu_kidney', label: 'Kidney — ballotable, tender, costovertebral angle tenderness', systemId: 'genitourinary' },
      { id: 'gu_bladder', label: 'Bladder — palpable, distended', systemId: 'genitourinary' },
      { id: 'gu_dre', label: 'Prostate / pelvic examination — findings', systemId: 'genitourinary' },
      { id: 'gu_summary', label: 'Genitourinary system summary', systemId: 'genitourinary' },
    ],
  },
  {
    systemId: 'endocrine',
    systemName: 'Endocrine System',
    icon: '🔬',
    features: [
      { id: 'endo_thyroid', label: 'Thyroid gland — palpable, size, nodules, bruit', systemId: 'endocrine' },
      { id: 'endo_signs', label: 'Signs of endocrinopathy — acromegaly, Cushing, hirsutism, virilization', systemId: 'endocrine' },
      { id: 'endo_summary', label: 'Endocrine system summary', systemId: 'endocrine' },
    ],
  },
  {
    systemId: 'skin_msk',
    systemName: 'Skin, Hair & Nails',
    icon: '🧴',
    features: [
      { id: 'skin_rash', label: 'Rash — type, distribution, morphology', systemId: 'skin_msk' },
      { id: 'skin_ulcers', label: 'Ulcers — site, size, depth, edges, base, surrounding skin', systemId: 'skin_msk' },
      { id: 'skin_nails', label: 'Nails — pitting, onycholysis, koilonychia, splinter hemorrhages', systemId: 'skin_msk' },
      { id: 'skin_hair', label: 'Hair — distribution, loss, texture', systemId: 'skin_msk' },
      { id: 'skin_summary', label: 'Skin, hair & nails summary', systemId: 'skin_msk' },
    ],
  },
];

export function getSystemicExamSystems(): SystemicExamSystem[] {
  return SYSTEMIC_EXAM_SYSTEMS;
}

export function getSystemFeatures(systemId: string): SystemicExamFeature[] {
  const system = SYSTEMIC_EXAM_SYSTEMS.find(s => s.systemId === systemId);
  return system?.features || [];
}

export default SYSTEMIC_EXAM_SYSTEMS;
