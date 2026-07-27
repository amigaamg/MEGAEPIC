// ─────────────────────────────────────────────────────────────────
// AMEXAN Teaching Mode
// Optional overlay explaining why each finding matters,
// linking to anatomy, physiology, mechanisms, diseases
// ─────────────────────────────────────────────────────────────────

export interface TeachingPoint {
  cardId: string;
  cardLabel: string;
  concept: string;
  explanation: string;
  clinicalRelevance: string;
  relatedAnatomy?: string;
  relatedPhysiology?: string;
  commonMistake?: string;
  reference?: string;
}

export const TEACHING_POINTS: Record<string, TeachingPoint[]> = {
  // Respiratory
  'resp_ausc_breath_sounds': [
    { cardId: 'resp_ausc_breath_sounds', cardLabel: 'Breath Sounds', concept: 'Vesicular vs Bronchial Breathing',
      explanation: 'Vesicular sounds are soft, low-pitched, heard over most of the lung fields. Bronchial breathing is loud, high-pitched, heard over the trachea normally — if heard elsewhere it suggests consolidation.',
      clinicalRelevance: 'Bronchial breathing over lung periphery = consolidated lung tissue (pneumonia). Absent breath sounds = effusion, pneumothorax, or collapse.',
      relatedAnatomy: 'Trachea, main bronchi, segmental bronchi, alveoli',
      relatedPhysiology: 'Airflow turbulence in large airways vs laminar flow in small airways',
      commonMistake: 'Thin patients may have normally louder breath sounds — do not confuse with bronchial breathing.',
      reference: 'Macleod\'s Clinical Examination, 14th ed., Chapter 6' },
  ],
  'resp_perc_note': [
    { cardId: 'resp_perc_note', cardLabel: 'Percussion Note', concept: 'Percussion in Respiratory Examination',
      explanation: 'Percussion over air-filled lung produces a resonant note. Dullness indicates fluid or solid tissue replacing air. Hyperresonance indicates air trapping.',
      clinicalRelevance: 'Stony dull = pleural effusion. Dull = consolidation/collapse. Hyperresonant = pneumothorax/COPD.',
      relatedAnatomy: 'Chest wall, pleura, lung parenchyma',
      commonMistake: 'Percuss symmetrically — the liver normally produces dullness on the right lower chest.',
      reference: 'Talley & O\'Connor, Clinical Examination, 9th ed.' },
  ],
  // Cardiovascular
  'cvs_heart_sounds': [
    { cardId: 'cvs_heart_sounds', cardLabel: 'Heart Sounds', concept: 'S1, S2, Added Sounds',
      explanation: 'S1 = mitral and tricuspid valve closure (start of systole). S2 = aortic and pulmonary valve closure (start of diastole). S3 = rapid ventricular filling. S4 = atrial kick against stiff ventricle.',
      clinicalRelevance: 'Loud S1 = mitral stenosis. Wide fixed split S2 = ASD. S3 = heart failure/volume overload. S4 = LVH/amyloidosis.',
      relatedAnatomy: 'Mitral, tricuspid, aortic, pulmonary valves',
      relatedPhysiology: 'Valvular closure, ventricular filling, atrial contraction',
      commonMistake: 'S3 is normal in children and athletes — pathological over age 40.' },
  ],
  'cvs_jvp': [
    { cardId: 'cvs_jvp', cardLabel: 'Jugular Venous Pressure', concept: 'JVP Assessment',
      explanation: 'JVP reflects right atrial pressure. The patient is positioned at 45°. The vertical height of the internal jugular vein pulsation above the sternal angle is measured. Normal is <3 cm (or <8 cm from the right atrium).',
      clinicalRelevance: 'Elevated JVP = right heart failure, fluid overload, SVC obstruction, constrictive pericarditis, pulmonary hypertension. Kussmaul\'s sign (JVP rises on inspiration) = constrictive pericarditis.',
      relatedAnatomy: 'Internal jugular vein, superior vena cava, right atrium',
      relatedPhysiology: 'Central venous pressure, right ventricular function',
      commonMistake: 'Do not confuse carotid pulsation (palpable, moves medially) with JVP (non-palpable, moves with respiration, occludes with pressure).' },
  ],
  // Neurological
  'neuro_pupils_size': [
    { cardId: 'neuro_pupils_size', cardLabel: 'Pupil Size', concept: 'Pupillary Examination',
      explanation: 'Pupils are controlled by the autonomic nervous system: sympathetic (dilation) via the cervical chain, and parasympathetic (constriction) via CN III. Size, symmetry, and reaction to light are assessed.',
      clinicalRelevance: 'Fixed dilated pupil = CN III compression (uncal herniation, aneurysm). Pinpoint pupils = pontine haemorrhage/opiates. Anisocoria = Horner\'s syndrome (ptosis, miosis, anhidrosis) or CN III palsy.',
      relatedAnatomy: 'Midbrain (Edinger-Westphal nucleus), CN III, cervical sympathetic chain',
      commonMistake: 'Up to 20% of the population has physiological anisocoria (<1mm difference).' },
  ],
  'neuro_consciousness_avpu': [
    { cardId: 'neuro_consciousness_avpu', cardLabel: 'Level of Consciousness', concept: 'AVPU & GCS',
      explanation: 'AVPU is a rapid assessment: Alert, Voice, Pain, Unresponsive. GCS provides finer granularity (3-15). Both assess arousal, not content of thought.',
      clinicalRelevance: 'AVPU < Alert = need for full GCS. GCS ≤ 8 = airway protection required. Deteriorating GCS = neurosurgical emergency.',
      relatedAnatomy: 'Reticular activating system (brainstem), bilateral cerebral hemispheres',
      commonMistake: 'A patient can be alert but have severe cognitive deficits (e.g., fluent aphasia). AVPU only assesses arousal, not cognition.' },
  ],
  // Breast
  'breast_palp_mass': [
    { cardId: 'breast_palp_mass', cardLabel: 'Palpable Breast Mass', concept: 'Breast Mass Characterisation',
      explanation: 'A breast mass requires systematic characterisation: site, size, shape, consistency, margins, mobility, skin attachment, deep fixation. Each feature stratifies benign vs malignant risk.',
      clinicalRelevance: 'Hard, irregular, fixed mass with skin dimpling = malignant until proven otherwise. Smooth, mobile, rubbery mass = fibroadenoma. Tender, fluctuant mass = abscess.',
      relatedAnatomy: 'Breast parenchyma, Cooper\'s ligaments, pectoralis fascia, chest wall',
      relatedPhysiology: 'Desmoplastic reaction in malignancy causes hardness and fixation',
      commonMistake: 'A normal lumpy breast (fibrocystic change) can be mistaken for a mass. Always examine with the flat of the fingers and compare to the contralateral side.' },
  ],
  'breast_axillary_nodes': [
    { cardId: 'breast_axillary_nodes', cardLabel: 'Axillary Lymph Nodes', concept: 'Lymphatic Drainage of the Breast',
      explanation: 'The breast lymphatics drain primarily to the axillary nodes (75%), then to the internal mammary chain and supraclavicular nodes. Axillary nodes are grouped into five levels: anterior (pectoral), posterior (subscapular), central, lateral, and apical.',
      clinicalRelevance: 'Palpable axillary nodes in breast cancer = nodal metastasis (N1-N3). Fixed/matted nodes = advanced disease (N2). Supraclavicular nodes = N3.',
      relatedAnatomy: 'Axillary lymph node groups, internal mammary chain, supraclavicular nodes',
      commonMistake: 'Not all palpable axillary nodes are malignant — reactive enlargement occurs with infection/inflammation of the ipsilateral arm or breast.' },
  ],
  // General
  'ge_lymphadenopathy': [
    { cardId: 'ge_lymphadenopathy', cardLabel: 'Lymphadenopathy', concept: 'Lymph Node Examination',
      explanation: 'Lymph nodes are assessed for size, consistency, tenderness, mobility, matting, and overlying skin changes. Localised vs generalised lymphadenopathy narrows the differential.',
      clinicalRelevance: 'Hard, fixed, non-tender nodes = malignancy. Tender, warm, mobile nodes = infection. Rubbery, matted nodes = lymphoma/SLE. Generalised = TB, HIV, lymphoma, sarcoidosis.',
      relatedAnatomy: 'Cervical, supraclavicular, axillary, inguinal, epitrochlear, popliteal chains',
      commonMistake: 'Supraclavicular nodes (Virchow\'s node on the left) are always pathological — never normal.' },
  ],
  // Abdominal
  'abd_ausc_bowel_sounds': [
    { cardId: 'abd_ausc_bowel_sounds', cardLabel: 'Bowel Sounds', concept: 'Bowel Sound Patterns',
      explanation: 'Bowel sounds are produced by peristalsis mixing gas and fluid. Normal frequency is 5-35 sounds per minute. Auscultate for at least 30 seconds before concluding absence.',
      clinicalRelevance: 'Absent bowel sounds = ileus/peritonitis. Tinkling/high-pitched = mechanical obstruction. Hyperactive = gastroenteritis, IBD, early obstruction.',
      relatedAnatomy: 'Small and large intestine',
      relatedPhysiology: 'Peristalsis, smooth muscle contraction',
      commonMistake: 'Bowel sounds are NOT helpful in distinguishing ileus from obstruction in the acute setting — clinical context is key.' },
  ],
};

export function getTeachingPoints(cardIds: string[]): TeachingPoint[] {
  const points: TeachingPoint[] = [];
  for (const id of cardIds) {
    const found = TEACHING_POINTS[id];
    if (found) points.push(...found);
  }
  return points;
}

export function getRelatedCardIds(teachingPoint: TeachingPoint): string[] {
  const related: string[] = [];
  for (const [cardId, points] of Object.entries(TEACHING_POINTS)) {
    if (points.some(p => p.concept === teachingPoint.concept)) related.push(cardId);
  }
  return related;
}
