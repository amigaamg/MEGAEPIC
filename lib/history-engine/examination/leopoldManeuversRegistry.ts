// ── LEOPOLD'S MANEUVERS REGISTRY ──
// For pregnant abdominal examination

export interface LeopoldField {
  id: string;
  maneuver: string;
  label: string;
  type: 'select' | 'text' | 'number';
  options?: string[];
  placeholder?: string;
  description: string;
}

export const LEOPOLD_FIELDS: LeopoldField[] = [
  // First Maneuver — Fundal grip
  {
    id: 'leopold_first', maneuver: 'First Maneuver (Fundal Grip)',
    label: 'What is felt in the fundus?',
    type: 'select',
    options: ['Fetal head (smooth, hard, round)', 'Fetal breech (soft, irregular, broad)', 'Empty (transverse lie)', 'Unable to determine'],
    description: 'Face the mother. Place both hands on the fundus. Palpate to identify which fetal part occupies the fundus.',
    placeholder: undefined,
  },
  {
    id: 'leopold_first_height', maneuver: 'First Maneuver (Fundal Grip)',
    label: 'Fundal height (cm)',
    type: 'number',
    placeholder: '32',
    description: 'Measure from pubic symphysis to fundus with tape measure.',
  },

  // Second Maneuver — Lateral grip
  {
    id: 'leopold_second_back', maneuver: 'Second Maneuver (Lateral Grip)',
    label: 'Fetal back position',
    type: 'select',
    options: ['Right side — smooth, firm, curved', 'Left side — smooth, firm, curved', 'Cannot identify back', 'Anterior', 'Posterior'],
    description: 'Move hands from fundus to sides of uterus. Palpate with alternating hands to find the fetal back (smooth, firm) and small parts (irregular).',
    placeholder: undefined,
  },
  {
    id: 'leopold_second_small_parts', maneuver: 'Second Maneuver (Lateral Grip)',
    label: 'Small parts felt on',
    type: 'select',
    options: ['Right side', 'Left side', 'Anterior', 'Not palpable'],
    description: 'The side opposite the back where fetal limbs are felt.',
    placeholder: undefined,
  },

  // Third Maneuver — Pawlick grip
  {
    id: 'leopold_third_presenting', maneuver: 'Third Maneuver (Pawlick\'s Grip)',
    label: 'Presenting part',
    type: 'select',
    options: ['Head (cephalic)', 'Breech', 'Shoulder', 'Unable to determine'],
    description: 'Use thumb and fingers of dominant hand just above pubic symphysis. Grasp the presenting part between thumb and fingers.',
    placeholder: undefined,
  },
  {
    id: 'leopold_third_engagement', maneuver: 'Third Maneuver (Pawlick\'s Grip)',
    label: 'Engagement',
    type: 'select',
    options: ['Engaged (fixed, not ballotable)', 'Not engaged (mobile, ballotable)', 'Partially engaged'],
    description: 'Determine if the presenting part is engaged in the pelvis.',
    placeholder: undefined,
  },

  // Fourth Maneuver — Pelvic grip
  {
    id: 'leopold_fourth_descent', maneuver: 'Fourth Maneuver (Pelvic Grip)',
    label: 'Descent / Flexion',
    type: 'select',
    options: ['Well flexed (cephalic prominence on same side as small parts)', 'Deflexed (cephalic prominence on same side as back)', 'Extended (face presentation)', 'Unable to determine'],
    description: 'Face the mother\'s feet. Slide both hands down the sides of the uterus toward the pubis. Assess cephalic prominence for flexion.',
    placeholder: undefined,
  },
  {
    id: 'leopold_fourth_station', maneuver: 'Fourth Maneuver (Pelvic Grip)',
    label: 'Station (relative to ischial spines)',
    type: 'select',
    options: ['-5', '-4', '-3', '-2', '-1', '0', '+1', '+2', '+3', '+4', '+5'],
    description: 'Relationship of the presenting part to the maternal ischial spines.',
    placeholder: undefined,
  },

  // Fetal lie & presentation summary
  {
    id: 'leopold_lie', maneuver: 'Summary',
    label: 'Fetal lie',
    type: 'select',
    options: ['Longitudinal', 'Transverse', 'Oblique', 'Unstable'],
    description: 'Relationship of fetal long axis to maternal long axis.',
    placeholder: undefined,
  },
  {
    id: 'leopold_presentation', maneuver: 'Summary',
    label: 'Presentation',
    type: 'select',
    options: ['Cephalic', 'Breech (frank)', 'Breech (complete)', 'Breech (footling)', 'Shoulder', 'Face', 'Brow', 'Compound'],
    description: 'The fetal part that enters the pelvis first.',
    placeholder: undefined,
  },
  {
    id: 'leopold_position', maneuver: 'Summary',
    label: 'Position',
    type: 'select',
    options: ['LOA (Left Occipito-Anterior)', 'LOT (Left Occipito-Transverse)', 'LOP (Left Occipito-Posterior)',
      'ROA (Right Occipito-Anterior)', 'ROT (Right Occipito-Transverse)', 'ROP (Right Occipito-Posterior)',
      'LSA (Left Sacro-Anterior)', 'RSA (Right Sacro-Anterior)', 'LSP (Left Sacro-Posterior)', 'RSP (Right Sacro-Posterior)',
      'LMA (Left Mento-Anterior)', 'RMA (Right Mento-Anterior)'],
    description: 'Relationship of presenting part reference point to maternal pelvis.',
    placeholder: undefined,
  },
  {
    id: 'leopold_fhr', maneuver: 'Summary',
    label: 'Fetal heart rate (/min)',
    type: 'number',
    placeholder: '140',
    description: 'Auscultate fetal heart rate using Pinard stethoscope or Doppler.',
  },
  {
    id: 'leopold_contractions', maneuver: 'Summary',
    label: 'Uterine contractions',
    type: 'text',
    placeholder: 'Frequency: q10min, Duration: 30s, Strength: mild',
    description: 'Frequency, duration, and strength of contractions.',
  },
  {
    id: 'leopold_amniotic', maneuver: 'Summary',
    label: 'Amniotic fluid / Liquor',
    type: 'select',
    options: ['Adequate', 'Reduced (oligohydramnios)', 'Excessive (polyhydramnios)', 'Ruptured (SROM/ARM)'],
    description: 'Estimate of amniotic fluid volume.',
    placeholder: undefined,
  },
];

export const LEOPOLD_MANEUVERS = [
  { id: 'first', label: 'First Maneuver', subtitle: 'Fundal Grip' },
  { id: 'second', label: 'Second Maneuver', subtitle: 'Lateral Grip / Umbilical Grip' },
  { id: 'third', label: 'Third Maneuver', subtitle: 'Pawlick\'s Grip / Lower Pole Grip' },
  { id: 'fourth', label: 'Fourth Maneuver', subtitle: 'Pelvic Grip' },
  { id: 'summary', label: 'Summary', subtitle: 'Lie, Presentation, Position' },
];

export default LEOPOLD_FIELDS;
