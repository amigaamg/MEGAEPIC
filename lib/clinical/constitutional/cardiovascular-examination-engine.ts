// ═══════════════════════════════════════════════════════════════
// AMEXAN Universal Cardiovascular Examination Engine (UCEE)
// Constitutional Volume — full structured CVS exam flow
// Follows Hutchison's, Macleod's, Talley & O'Connor, Bates
// ═══════════════════════════════════════════════════════════════

export type AgeBand = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export type CvsExamMode = 'primary' | 'secondary';

export type CvsSection =
  | 'preparation' | 'general_survey' | 'hands' | 'arms' | 'face'
  | 'neck' | 'precordial_inspection' | 'palpation'
  | 'percussion' | 'auscultation' | 'murmur_engine'
  | 'peripheral_vascular' | 'special_manoeuvres' | 'summary';

export interface CvsContext {
  ageBand: AgeBand;
  sex: 'male' | 'female';
  pregnant: boolean;
  knownDiseases: string[];
  chiefComplaints: string[];
  activeModules: string[];
  findings: Record<string, unknown>;
}

export interface CvsOption {
  value: string;
  label: string;
  documentationPhrase: string;
  triggersCascade?: string;
  triggersFindings?: string[];
}

export interface CvsEvidenceLink {
  mechanism?: string;
  phenotype?: string;
  disease?: string;
  supportsDisease: string[];
  weight: number;
  documentationPhrase: string;
}

export interface CvsConditionalExpand {
  triggerValues: string[];
  expandCardIds: string[];
}

export interface CvsCardDef {
  id: string;
  section: CvsSection;
  sectionOrder: number;
  cardNumber: number;
  label: string;
  question: string;
  type: 'single_select' | 'multi_select' | 'boolean' | 'numeric' | 'text';
  options: CvsOption[];
  documentationTemplate: string;
  contextVisibility: {
    showForAgeBands?: AgeBand[];
    hideForAgeBands?: AgeBand[];
    showForSex?: ('male' | 'female')[];
    showForPregnancy?: boolean;
    alwaysShow?: boolean;
    screeningMode?: boolean;
  };
  conditionalExpand?: CvsConditionalExpand;
  evidenceLinks: CvsEvidenceLink[];
}

// ─────────────────────────────────────────────────────────────────
// MODE DETECTION
// ─────────────────────────────────────────────────────────────────

export function detectCardiovascularMode(ctx: CvsContext): CvsExamMode {
  const cvsKeywords = [
    'chest pain', 'palpitations', 'syncope', 'dyspnea', 'shortness of breath',
    'orthopnea', 'pnd', 'paroxysmal nocturnal', 'peripheral edema', 'leg swelling',
    'cyanosis', 'murmur', 'hypertension', 'high blood pressure', 'cardiac',
    'heart failure', 'heart attack', 'mi', 'myocardial', 'angina',
  ];
  const cvsDiseases = [
    'heart_failure', 'cad', 'ihd', 'mi', 'angina', 'hypertension', 'afib',
    'atrial_fibrillation', 'valvular', 'aortic_stenosis', 'mitral_regurgitation',
    'mitral_stenosis', 'cardiomyopathy', 'hocm', 'congenital_heart_disease',
    'vhf', 'pulmonary_hypertension', 'pericarditis', 'endocarditis', 'chd',
    'cyanotic_chd', 'coarctation', 'aa_aneurysm', 'dvt', 'pe',
  ];
  const cvsModules = ['cardiology', 'cardiothoracic', 'cardiac', 'vascular'];

  const hasCvsComplaint = ctx.chiefComplaints.some(c =>
    cvsKeywords.some(k => c.toLowerCase().includes(k)),
  );
  const hasCvsDisease = ctx.knownDiseases.some(d => cvsDiseases.includes(d));
  const hasCvsModule = ctx.activeModules.some(m =>
    cvsModules.includes(m.toLowerCase()),
  );

  if (hasCvsComplaint || hasCvsDisease || hasCvsModule) return 'primary';

  const cvsFindings = [
    'cvs_jvp', 'cvs_apex_beat', 'cvs_heart_sounds', 'cvs_murmurs',
    'cvs_peripheral_edema', 'pulse_irregular',
  ];
  const hasCvsFindings = cvsFindings.some(f => {
    const v = ctx.findings[f];
    return v != null && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0);
  });
  if (hasCvsFindings) return 'primary';

  return 'secondary';
}

// ─────────────────────────────────────────────────────────────────
// SECONDARY (SCREENING) CARDS — 6-card minimal set
// ─────────────────────────────────────────────────────────────────

export const CVS_SCREENING_CARDS: CvsCardDef[] = [
  {
    id: 'scr_cvs_pulse', section: 'hands', sectionOrder: 1, cardNumber: 1,
    label: 'Pulse',
    question: 'Pulse assessment',
    type: 'single_select',
    options: [
      { value: 'regular_normal', label: 'Regular, normal volume', documentationPhrase: 'Pulse is regular with normal rate, rhythm and volume' },
      { value: 'irregular', label: 'Irregular', documentationPhrase: 'irregular pulse' },
      { value: 'low_volume', label: 'Low volume', documentationPhrase: 'low volume pulse' },
      { value: 'bounding', label: 'Bounding', documentationPhrase: 'bounding pulse' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['afib', 'heart_failure', 'aortic_stenosis'], weight: 0.4, documentationPhrase: 'abnormal pulse' },
    ],
  },
  {
    id: 'scr_cvs_bp', section: 'arms', sectionOrder: 2, cardNumber: 2,
    label: 'Blood Pressure',
    question: 'Blood pressure (from vitals)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Within normal limits', documentationPhrase: 'Blood pressure is within normal limits' },
      { value: 'elevated', label: 'Elevated', documentationPhrase: 'elevated blood pressure' },
      { value: 'low', label: 'Low', documentationPhrase: 'low blood pressure' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { disease: 'Hypertension', supportsDisease: ['hypertension'], weight: 0.5, documentationPhrase: 'hypertension' },
    ],
  },
  {
    id: 'scr_cvs_heart_sounds', section: 'auscultation', sectionOrder: 3, cardNumber: 3,
    label: 'Heart Sounds',
    question: 'Heart sounds',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'S1 S2 normal', documentationPhrase: 'Heart sounds S1 and S2 are normal' },
      { value: 'abnormal', label: 'Abnormal', documentationPhrase: 'heart sounds are abnormal' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['valvular', 'heart_failure'], weight: 0.5, documentationPhrase: 'abnormal heart sounds' },
    ],
  },
  {
    id: 'scr_cvs_murmur', section: 'auscultation', sectionOrder: 4, cardNumber: 4,
    label: 'Murmur',
    question: 'Audible murmur?',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'No audible murmur', documentationPhrase: 'with no audible murmurs' },
      { value: 'present', label: 'Murmur heard', documentationPhrase: 'a murmur is heard' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['valvular', 'aortic_stenosis', 'mitral_regurgitation'], weight: 0.6, documentationPhrase: 'cardiac murmur' },
    ],
  },
  {
    id: 'scr_cvs_peripheral_edema', section: 'peripheral_vascular', sectionOrder: 5, cardNumber: 5,
    label: 'Peripheral Edema',
    question: 'Peripheral edema',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'There is no peripheral edema' },
      { value: 'present', label: 'Present', documentationPhrase: 'peripheral edema is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { mechanism: 'Fluid overload', supportsDisease: ['heart_failure', 'renal_failure', 'cirrhosis'], weight: 0.5, documentationPhrase: 'peripheral edema' },
    ],
  },
  {
    id: 'scr_cvs_jvp', section: 'neck', sectionOrder: 6, cardNumber: 6,
    label: 'JVP',
    question: 'Jugular venous pressure',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Not elevated', documentationPhrase: 'Jugular venous pressure is not elevated' },
      { value: 'elevated', label: 'Raised / Elevated', documentationPhrase: 'elevated jugular venous pressure' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { mechanism: 'Right heart failure', supportsDisease: ['heart_failure', 'constrictive_pericarditis'], weight: 0.6, documentationPhrase: 'elevated JVP' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// PRIMARY CARDS — full cardiovascular examination flow
// ─────────────────────────────────────────────────────────────────

export const CVS_CARDS: CvsCardDef[] = [

  // ══ PART 0: PREPARATION ══
  {
    id: 'cvs_prep', section: 'preparation', sectionOrder: 0, cardNumber: 0,
    label: 'Preparation',
    question: 'Preparation complete',
    type: 'single_select',
    options: [
      { value: 'complete', label: '✓ Explained, consented, exposed, warm room, good lighting', documentationPhrase: '' },
    ],
    documentationTemplate: '',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },

  // ══ PART 1: GENERAL SURVEY ══
  {
    id: 'cvs_breathlessness', section: 'general_survey', sectionOrder: 1, cardNumber: 1,
    label: 'Breathlessness',
    question: 'Breathlessness at rest or on exertion',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'patient is not breathless at rest' },
      { value: 'exertion', label: 'On exertion', documentationPhrase: 'breathless on minimal exertion' },
      { value: 'rest', label: 'At rest', documentationPhrase: 'breathless at rest' },
      { value: 'orthopnea', label: 'Orthopnea', documentationPhrase: 'orthopnea requiring multiple pillows' },
      { value: 'pnd', label: 'Paroxysmal nocturnal dyspnea', documentationPhrase: 'paroxysmal nocturnal dyspnea' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Pulmonary congestion', phenotype: 'Left heart failure', supportsDisease: ['heart_failure', 'valvular', 'cad'], weight: 0.6, documentationPhrase: 'breathlessness' },
    ],
  },
  {
    id: 'cvs_walking_tolerance', section: 'general_survey', sectionOrder: 2, cardNumber: 2,
    label: 'Walking Tolerance',
    question: 'Walking distance (flights / meters)',
    type: 'single_select',
    options: [
      { value: 'unlimited', label: 'Unlimited', documentationPhrase: 'walking tolerance is unlimited' },
      { value: 'mild', label: '1 flight / >200m', documentationPhrase: 'walking tolerance reduced to one flight of stairs' },
      { value: 'moderate', label: '<1 flight / 50-200m', documentationPhrase: 'walking tolerance significantly reduced' },
      { value: 'severe', label: '<50m or at rest', documentationPhrase: 'severely limited walking tolerance' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { phenotype: 'Heart failure', supportsDisease: ['heart_failure', 'copd', 'cad'], weight: 0.4, documentationPhrase: 'reduced exercise tolerance' },
    ],
  },
  {
    id: 'cvs_distress', section: 'general_survey', sectionOrder: 3, cardNumber: 3,
    label: 'Distress / Comfort',
    question: 'Patient comfort level',
    type: 'single_select',
    options: [
      { value: 'comfortable', label: 'Comfortable at rest', documentationPhrase: 'patient is comfortable at rest' },
      { value: 'mild', label: 'Mild distress', documentationPhrase: 'patient appears mildly distressed' },
      { value: 'moderate', label: 'Moderate distress', documentationPhrase: 'patient is in moderate distress' },
      { value: 'severe', label: 'Severe distress', documentationPhrase: 'patient appears in severe distress' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['heart_failure', 'mi', 'pe'], weight: 0.3, documentationPhrase: 'in distress' },
    ],
  },

  // ══ PART 2: HANDS ══
  {
    id: 'cvs_hand_temp', section: 'hands', sectionOrder: 4, cardNumber: 4,
    label: 'Hand Temperature',
    question: 'Peripheral temperature',
    type: 'single_select',
    options: [
      { value: 'warm', label: 'Warm', documentationPhrase: 'hands are warm' },
      { value: 'cool', label: 'Cool', documentationPhrase: 'hands are cool' },
      { value: 'cold', label: 'Cold / Clammy', documentationPhrase: 'hands are cold and clammy' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Low cardiac output', supportsDisease: ['heart_failure', 'shock'], weight: 0.5, documentationPhrase: 'cold peripheries' },
    ],
  },
  {
    id: 'cvs_cap_refill', section: 'hands', sectionOrder: 5, cardNumber: 5,
    label: 'Capillary Refill',
    question: 'Capillary refill time (seconds)',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Capillary refill time is {value} seconds.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Poor perfusion', supportsDisease: ['shock', 'heart_failure', 'dehydration'], weight: 0.5, documentationPhrase: 'prolonged capillary refill' },
    ],
  },
  {
    id: 'cvs_pulse_rate', section: 'hands', sectionOrder: 6, cardNumber: 6,
    label: 'Pulse Rate',
    question: 'Pulse rate (from vitals / manual)',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Pulse rate is {value} beats per minute.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['heart_failure', 'afib', 'sepsis'], weight: 0.3, documentationPhrase: 'pulse {value}/min' },
    ],
  },
  {
    id: 'cvs_pulse_rhythm', section: 'hands', sectionOrder: 7, cardNumber: 7,
    label: 'Pulse Rhythm',
    question: 'Pulse rhythm',
    type: 'single_select',
    options: [
      { value: 'regular', label: 'Regular', documentationPhrase: 'pulse is regular' },
      { value: 'irregular', label: 'Irregularly irregular', documentationPhrase: 'pulse is irregularly irregular' },
      { value: 'regularly_irregular', label: 'Regularly irregular', documentationPhrase: 'pulse is regularly irregular' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Atrial fibrillation', supportsDisease: ['afib', 'atrial_fibrillation', 'flutter'], weight: 0.6, documentationPhrase: 'irregularly irregular pulse' },
    ],
  },
  {
    id: 'cvs_pulse_volume', section: 'hands', sectionOrder: 8, cardNumber: 8,
    label: 'Pulse Volume',
    question: 'Pulse volume / character',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'normal volume pulse' },
      { value: 'low_volume', label: 'Low volume (pulsus parvus)', documentationPhrase: 'low volume pulse (pulsus parvus)' },
      { value: 'bounding', label: 'Bounding / Collapsing (Corrigan)', documentationPhrase: 'bounding collapsing pulse (Corrigan pulse)' },
      { value: 'bisferiens', label: 'Bisferiens', documentationPhrase: 'bisferiens pulse' },
      { value: 'dicrotic', label: 'Dicrotic', documentationPhrase: 'dicrotic pulse' },
      { value: 'alternans', label: 'Pulsus alternans', documentationPhrase: 'pulsus alternans' },
      { value: 'paradoxus', label: 'Pulsus paradoxus', documentationPhrase: 'pulsus paradoxus' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Aortic stenosis', supportsDisease: ['aortic_stenosis'], weight: 0.5, documentationPhrase: 'pulsus parvus' },
      { disease: 'Aortic regurgitation', supportsDisease: ['aortic_regurgitation'], weight: 0.6, documentationPhrase: 'collapsing pulse' },
      { disease: 'HOCM', supportsDisease: ['hocm'], weight: 0.4, documentationPhrase: 'bisferiens pulse' },
      { mechanism: 'Low cardiac output', supportsDisease: ['heart_failure'], weight: 0.4, documentationPhrase: 'pulsus alternans' },
      { mechanism: 'Cardiac tamponade', supportsDisease: ['cardiac_tamponade', 'constrictive_pericarditis'], weight: 0.6, documentationPhrase: 'pulsus paradoxus' },
    ],
  },
  {
    id: 'cvs_radial_radial_delay', section: 'hands', sectionOrder: 9, cardNumber: 9,
    label: 'Radial-Radial Delay',
    question: 'Radial-radial delay (both arms)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Synchronous', documentationPhrase: 'no radial-radial delay' },
      { value: 'present', label: 'Present (difference)', documentationPhrase: 'radial-radial delay is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, hideForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { disease: 'Aortic dissection', supportsDisease: ['aortic_dissection', 'subclavian_stenosis'], weight: 0.6, documentationPhrase: 'radial-radial delay' },
    ],
  },
  {
    id: 'cvs_splinter_hemorrhages', section: 'hands', sectionOrder: 10, cardNumber: 10,
    label: 'Splinter Hemorrhages',
    question: 'Splinter hemorrhages (nails)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no splinter hemorrhages' },
      { value: 'present', label: 'Present', documentationPhrase: 'splinter hemorrhages are present in the nail beds' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Infective endocarditis', supportsDisease: ['endocarditis'], weight: 0.6, documentationPhrase: 'splinter hemorrhages suggesting endocarditis' },
    ],
  },
  {
    id: 'cvs_janeway', section: 'hands', sectionOrder: 11, cardNumber: 11,
    label: 'Janeway Lesions',
    question: 'Janeway lesions (palms/soles)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no Janeway lesions' },
      { value: 'present', label: 'Present', documentationPhrase: 'Janeway lesions are present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Infective endocarditis', supportsDisease: ['endocarditis'], weight: 0.7, documentationPhrase: 'Janeway lesions' },
    ],
  },
  {
    id: 'cvs_osler_nodes', section: 'hands', sectionOrder: 12, cardNumber: 12,
    label: 'Osler Nodes',
    question: 'Osler nodes (finger pads)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no Osler nodes' },
      { value: 'present', label: 'Present', documentationPhrase: 'Osler nodes are present in the finger pulps' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Infective endocarditis', supportsDisease: ['endocarditis'], weight: 0.7, documentationPhrase: 'Osler nodes' },
    ],
  },

  // ══ PART 3: ARMS ══
  {
    id: 'cvs_bp_both_arms', section: 'arms', sectionOrder: 13, cardNumber: 13,
    label: 'BP Both Arms',
    question: 'Blood pressure difference between arms',
    type: 'single_select',
    options: [
      { value: 'equal', label: 'Equal / <10mmHg difference', documentationPhrase: 'blood pressure is equal in both arms' },
      { value: 'reduced_left', label: 'Reduced in left arm', documentationPhrase: 'blood pressure is reduced in the left arm' },
      { value: 'reduced_right', label: 'Reduced in right arm', documentationPhrase: 'blood pressure is reduced in the right arm' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, hideForAgeBands: ['neonate', 'infant', 'toddler'] },
    evidenceLinks: [
      { disease: 'Aortic dissection', supportsDisease: ['aortic_dissection', 'subclavian_stenosis'], weight: 0.6, documentationPhrase: 'blood pressure asymmetry' },
    ],
  },

  // ══ PART 4: FACE ══
  {
    id: 'cvs_conjunctival_pallor', section: 'face', sectionOrder: 14, cardNumber: 14,
    label: 'Conjunctival Pallor',
    question: 'Conjunctival pallor',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no conjunctival pallor' },
      { value: 'present', label: 'Present', documentationPhrase: 'conjunctival pallor suggestive of anaemia' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Anaemia', supportsDisease: ['anaemia', 'endocarditis', 'chronic_disease'], weight: 0.5, documentationPhrase: 'conjunctival pallor' },
    ],
  },
  {
    id: 'cvs_central_cyanosis', section: 'face', sectionOrder: 15, cardNumber: 15,
    label: 'Central Cyanosis',
    question: 'Central cyanosis (lips / tongue)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no central cyanosis' },
      { value: 'present', label: 'Present', documentationPhrase: 'central cyanosis is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Hypoxemia', supportsDisease: ['congenital_heart_disease', 'heart_failure', 'pneumonia'], weight: 0.6, documentationPhrase: 'central cyanosis' },
    ],
  },
  {
    id: 'cvs_xanthelasma', section: 'face', sectionOrder: 16, cardNumber: 16,
    label: 'Xanthelasma',
    question: 'Xanthelasma (eyelids)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no xanthelasma' },
      { value: 'present', label: 'Present', documentationPhrase: 'xanthelasma is present suggesting hyperlipidemia' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, hideForAgeBands: ['neonate', 'infant', 'toddler', 'child'] },
    evidenceLinks: [
      { disease: 'Hyperlipidemia', supportsDisease: ['hyperlipidemia', 'cad'], weight: 0.5, documentationPhrase: 'xanthelasma' },
    ],
  },
  {
    id: 'cvs_corneal_arcus', section: 'face', sectionOrder: 17, cardNumber: 17,
    label: 'Corneal Arcus',
    question: 'Corneal arcus senilis',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no corneal arcus' },
      { value: 'present_young', label: 'Present (<45 years — suspect hyperlipidemia)', documentationPhrase: 'corneal arcus present in a young patient suggesting hyperlipidemia' },
      { value: 'present_elderly', label: 'Present (age-appropriate)', documentationPhrase: 'corneal arcus consistent with age' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, hideForAgeBands: ['neonate', 'infant', 'toddler', 'child'] },
    evidenceLinks: [
      { disease: 'Hyperlipidemia', supportsDisease: ['hyperlipidemia', 'cad'], weight: 0.4, documentationPhrase: 'corneal arcus' },
    ],
  },
  {
    id: 'cvs_malar_flush', section: 'face', sectionOrder: 18, cardNumber: 18,
    label: 'Malar Flush',
    question: 'Malar flush (mitral facies)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no malar flush' },
      { value: 'present', label: 'Present (mitral facies)', documentationPhrase: 'malar flush (mitral facies) is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Mitral stenosis', supportsDisease: ['mitral_stenosis'], weight: 0.5, documentationPhrase: 'malar flush of mitral stenosis' },
    ],
  },
  {
    id: 'cvs_oral_lesions', section: 'face', sectionOrder: 19, cardNumber: 19,
    label: 'Oral Lesions',
    question: 'Oral / dental lesions',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal / Good dentition', documentationPhrase: 'dentition is normal' },
      { value: 'poor_dentition', label: 'Poor dentition', documentationPhrase: 'poor dentition — risk for infective endocarditis' },
      { value: 'petechiae_palate', label: 'Petechiae on palate', documentationPhrase: 'palatal petechiae suggesting endocarditis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Endocarditis', supportsDisease: ['endocarditis'], weight: 0.5, documentationPhrase: 'poor dentition / palatal petechiae' },
    ],
  },

  // ══ PART 5: NECK ══
  {
    id: 'cvs_jvp', section: 'neck', sectionOrder: 20, cardNumber: 20,
    label: 'Jugular Venous Pressure',
    question: 'JVP (patient at 45°)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal (<3cm above sternal angle)', documentationPhrase: 'Jugular venous pressure is not elevated' },
      { value: 'elevated', label: 'Elevated', documentationPhrase: 'jugular venous pressure is elevated' },
      { value: 'unable', label: 'Unable to assess', documentationPhrase: 'JVP could not be assessed' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Right heart failure', phenotype: 'Right heart failure', supportsDisease: ['heart_failure', 'constrictive_pericarditis', 'pulmonary_hypertension'], weight: 0.7, documentationPhrase: 'elevated JVP' },
    ],
  },
  {
    id: 'cvs_jvp_waveform', section: 'neck', sectionOrder: 21, cardNumber: 21,
    label: 'JVP Waveform',
    question: 'JVP waveform',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal a and v waves', documentationPhrase: 'normal JVP waveform' },
      { value: 'giant_a', label: 'Giant a waves', documentationPhrase: 'giant a waves suggesting tricuspid stenosis or pulmonary hypertension' },
      { value: 'giant_v', label: 'Giant v waves', documentationPhrase: 'giant v waves suggesting tricuspid regurgitation' },
      { value: 'cannon', label: 'Cannon a waves', documentationPhrase: 'cannon a waves suggesting complete heart block' },
      { value: 'kussmaul', label: 'Kussmaul sign (rise with inspiration)', documentationPhrase: 'Kussmaul sign suggesting constrictive pericarditis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Tricuspid regurgitation', supportsDisease: ['tricuspid_regurgitation'], weight: 0.5, documentationPhrase: 'giant v waves' },
      { disease: 'Constrictive pericarditis', supportsDisease: ['constrictive_pericarditis'], weight: 0.6, documentationPhrase: 'Kussmaul sign' },
    ],
  },
  {
    id: 'cvs_hepatic_reflux', section: 'neck', sectionOrder: 22, cardNumber: 22,
    label: 'Hepatojugular Reflux',
    question: 'Hepatojugular reflux (abdominjugular test)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'hepatojugular reflux is negative' },
      { value: 'positive', label: 'Positive (sustained JVP rise)', documentationPhrase: 'hepatojugular reflux is positive, suggesting right heart failure' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { mechanism: 'Right heart failure', supportsDisease: ['heart_failure', 'tricuspid_regurgitation'], weight: 0.5, documentationPhrase: 'positive hepatojugular reflux' },
    ],
  },
  {
    id: 'cvs_carotids', section: 'neck', sectionOrder: 23, cardNumber: 23,
    label: 'Carotid Pulse',
    question: 'Carotid pulse volume and character',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'carotid pulses are normal with normal volume and character' },
      { value: 'low_volume', label: 'Low volume (slow-rising)', documentationPhrase: 'carotid pulses are low volume and slow-rising (pulsus parvus et tardus)' },
      { value: 'bounding', label: 'Bounding (water-hammer)', documentationPhrase: 'carotid pulses are bounding (water-hammer pulse)' },
      { value: 'bisferiens', label: 'Bisferiens', documentationPhrase: 'bisferiens carotid pulse' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Aortic stenosis', supportsDisease: ['aortic_stenosis'], weight: 0.7, documentationPhrase: 'slow-rising carotid pulse' },
      { disease: 'Aortic regurgitation', supportsDisease: ['aortic_regurgitation'], weight: 0.6, documentationPhrase: 'water-hammer carotid pulse' },
    ],
  },
  {
    id: 'cvs_carotid_bruit', section: 'neck', sectionOrder: 24, cardNumber: 24,
    label: 'Carotid Bruit',
    question: 'Carotid bruit',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no carotid bruit' },
      { value: 'present', label: 'Present', documentationPhrase: 'carotid bruit is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, hideForAgeBands: ['neonate', 'infant', 'toddler'] },
    evidenceLinks: [
      { disease: 'Carotid stenosis', supportsDisease: ['carotid_stenosis', 'atherosclerosis'], weight: 0.6, documentationPhrase: 'carotid bruit' },
    ],
  },

  // ══ PART 6: PRECORDIAL INSPECTION ══
  {
    id: 'cvs_chest_deformity', section: 'precordial_inspection', sectionOrder: 25, cardNumber: 25,
    label: 'Chest Deformity',
    question: 'Chest wall deformity',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'chest wall is normal' },
      { value: 'pectus_excavatum', label: 'Pectus excavatum', documentationPhrase: 'pectus excavatum' },
      { value: 'pectus_carinatum', label: 'Pectus carinatum', documentationPhrase: 'pectus carinatum' },
      { value: 'praecordial_bulge', label: 'Praecordial bulge', documentationPhrase: 'praecordial bulge suggesting cardiomegaly' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Cardiomegaly', supportsDisease: ['cardiomegaly', 'congenital_heart_disease'], weight: 0.4, documentationPhrase: 'praecordial bulge' },
    ],
  },
  {
    id: 'cvs_cardiac_scars', section: 'precordial_inspection', sectionOrder: 26, cardNumber: 26,
    label: 'Cardiac Scars',
    question: 'Cardiac surgical scars',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no cardiac surgical scars' },
      { value: 'sternotomy', label: 'Median sternotomy', documentationPhrase: 'median sternotomy scar suggesting previous cardiac surgery' },
      { value: 'thoracotomy', label: 'Thoracotomy (lateral)', documentationPhrase: 'lateral thoracotomy scar' },
      { value: 'pacemaker', label: 'Pacemaker / ICD pocket', documentationPhrase: 'pacemaker/ICD pocket in the left infraclavicular area' },
      { value: 'chest_drain', label: 'Chest drain scar', documentationPhrase: 'previous chest drain entry site' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['post_cardiac_surgery', 'post_pacemaker'], weight: 0.3, documentationPhrase: 'previous cardiac surgery' },
    ],
  },
  {
    id: 'cvs_visible_apex', section: 'precordial_inspection', sectionOrder: 27, cardNumber: 27,
    label: 'Visible Apex Beat',
    question: 'Visible apex beat / precordial activity',
    type: 'single_select',
    options: [
      { value: 'not_visible', label: 'Not visible', documentationPhrase: 'apex beat is not visible' },
      { value: 'visible', label: 'Visible', documentationPhrase: 'apex beat is visible and hyperdynamic' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['hyperdynamic_state', 'lvh', 'cardiomegaly'], weight: 0.3, documentationPhrase: 'visible apex beat' },
    ],
  },

  // ══ PART 7: PALPATION ══
  {
    id: 'cvs_apex_beat', section: 'palpation', sectionOrder: 28, cardNumber: 28,
    label: 'Apex Beat Palpation',
    question: 'Apex beat location and character',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal — 5th ICS, MCL', documentationPhrase: 'apex beat is located in the 5th left intercostal space at the mid-clavicular line' },
      { value: 'displaced_left', label: 'Displaced left (lateral)', documentationPhrase: 'apex beat is displaced laterally suggesting left ventricular enlargement' },
      { value: 'displaced_down', label: 'Displaced down and left', documentationPhrase: 'apex beat is displaced down and to the left' },
      { value: 'heaving', label: 'Heaving / Sustained (pressure-loaded)', documentationPhrase: 'apex beat is heaving and sustained, suggesting left ventricular hypertrophy' },
      { value: 'tapping', label: 'Tapping (palpable S1)', documentationPhrase: 'apex beat is tapping, characteristic of mitral stenosis' },
      { value: 'diffuse', label: 'Diffuse / Hyperdynamic', documentationPhrase: 'apex beat is diffuse and hyperdynamic' },
      { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'apex beat is not palpable' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'LVH', supportsDisease: ['lvh', 'aortic_stenosis', 'hypertension'], weight: 0.6, documentationPhrase: 'heaving apex beat' },
      { disease: 'Mitral stenosis', supportsDisease: ['mitral_stenosis'], weight: 0.5, documentationPhrase: 'tapping apex beat' },
      { phenotype: 'Cardiomegaly', supportsDisease: ['cardiomyopathy', 'heart_failure'], weight: 0.5, documentationPhrase: 'displaced apex beat' },
    ],
  },
  {
    id: 'cvs_parasternal_heave', section: 'palpation', sectionOrder: 29, cardNumber: 29,
    label: 'Parasternal Heave',
    question: 'Left parasternal heave',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no parasternal heave' },
      { value: 'present', label: 'Present (right ventricular hypertrophy)', documentationPhrase: 'left parasternal heave is present suggesting right ventricular hypertrophy' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'RVH', supportsDisease: ['rvh', 'pulmonary_hypertension', 'pulmonary_stenosis'], weight: 0.7, documentationPhrase: 'parasternal heave' },
    ],
  },
  {
    id: 'cvs_thrills', section: 'palpation', sectionOrder: 30, cardNumber: 30,
    label: 'Thrills',
    question: 'Palpable thrills',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no palpable thrills' },
      { value: 'aortic', label: 'Aortic area (R 2nd ICS)', documentationPhrase: 'aortic thrill in the right 2nd intercostal space' },
      { value: 'pulmonary', label: 'Pulmonary area (L 2nd ICS)', documentationPhrase: 'pulmonary thrill in the left 2nd intercostal space' },
      { value: 'tricuspid', label: 'Tricuspid area (L 4th ICS)', documentationPhrase: 'tricuspid thrill' },
      { value: 'mitral', label: 'Mitral area (apex)', documentationPhrase: 'mitral thrill at the apex' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Valvular', supportsDisease: ['aortic_stenosis', 'pulmonary_stenosis', 'vhf'], weight: 0.6, documentationPhrase: 'palpable thrill' },
    ],
  },
  {
    id: 'cvs_epigastric_pulsation', section: 'palpation', sectionOrder: 31, cardNumber: 31,
    label: 'Epigastric Pulsation',
    question: 'Epigastric pulsation',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no epigastric pulsation' },
      { value: 'present', label: 'Present (RVH / aortic aneurysm)', documentationPhrase: 'epigastric pulsation is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'RVH', supportsDisease: ['rvh', 'aa_aneurysm'], weight: 0.4, documentationPhrase: 'epigastric pulsation' },
    ],
  },

  // ══ PART 8: AUSCULTATION ══
  {
    id: 'cvs_heart_sounds_s1', section: 'auscultation', sectionOrder: 32, cardNumber: 32,
    label: 'S1 (First Heart Sound)',
    question: 'First heart sound (mitral/tricuspid closure)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'S1 is normal' },
      { value: 'soft', label: 'Soft / Reduced', documentationPhrase: 'S1 is soft suggesting mitral regurgitation, poor LV function' },
      { value: 'loud', label: 'Loud / Accentuated', documentationPhrase: 'S1 is loud suggesting mitral stenosis, hyperdynamic state' },
      { value: 'variable', label: 'Variable intensity', documentationPhrase: 'S1 is variable in intensity suggesting atrial fibrillation or complete heart block' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Mitral stenosis', supportsDisease: ['mitral_stenosis'], weight: 0.5, documentationPhrase: 'loud S1' },
      { disease: 'Mitral regurgitation', supportsDisease: ['mitral_regurgitation', 'heart_failure'], weight: 0.3, documentationPhrase: 'soft S1' },
    ],
  },
  {
    id: 'cvs_heart_sounds_s2', section: 'auscultation', sectionOrder: 33, cardNumber: 33,
    label: 'S2 (Second Heart Sound)',
    question: 'Second heart sound (aortic/pulmonary closure)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'S2 is normal' },
      { value: 'loud', label: 'Loud / Accentuated', documentationPhrase: 'S2 is loud suggesting pulmonary hypertension or systemic hypertension' },
      { value: 'soft', label: 'Soft / Reduced', documentationPhrase: 'S2 is soft suggesting aortic stenosis' },
      { value: 'single', label: 'Single S2', documentationPhrase: 'S2 is single suggesting severe aortic stenosis or pulmonary atresia' },
      { value: 'wide_split', label: 'Wide split (delayed P2)', documentationPhrase: 'wide splitting of S2 suggesting pulmonary stenosis, RBBB' },
      { value: 'fixed_split', label: 'Fixed split (ASD)', documentationPhrase: 'fixed splitting of S2 suggesting atrial septal defect' },
      { value: 'paradoxical', label: 'Paradoxical split (delayed A2)', documentationPhrase: 'paradoxical splitting of S2 suggesting aortic stenosis, LBBB, HOCM' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Pulmonary hypertension', supportsDisease: ['pulmonary_hypertension'], weight: 0.5, documentationPhrase: 'loud S2' },
      { disease: 'ASD', supportsDisease: ['atrial_septal_defect'], weight: 0.6, documentationPhrase: 'fixed split S2' },
      { disease: 'Aortic stenosis', supportsDisease: ['aortic_stenosis', 'lbbb', 'hocm'], weight: 0.5, documentationPhrase: 'paradoxical split S2' },
    ],
  },
  {
    id: 'cvs_s3', section: 'auscultation', sectionOrder: 34, cardNumber: 34,
    label: 'S3 (Third Heart Sound)',
    question: 'Third heart sound (ventricular gallop)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no third heart sound' },
      { value: 'present', label: 'Present (S3 gallop)', documentationPhrase: 'a third heart sound (S3 gallop) is present suggesting left ventricular failure or volume overload' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Ventricular volume overload', phenotype: 'Heart failure', supportsDisease: ['heart_failure', 'cardiomyopathy', 'mitral_regurgitation'], weight: 0.6, documentationPhrase: 'S3 gallop rhythm' },
    ],
  },
  {
    id: 'cvs_s4', section: 'auscultation', sectionOrder: 35, cardNumber: 35,
    label: 'S4 (Fourth Heart Sound)',
    question: 'Fourth heart sound (atrial gallop)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no fourth heart sound' },
      { value: 'present', label: 'Present (S4 gallop)', documentationPhrase: 'a fourth heart sound (S4 gallop) is present suggesting reduced LV compliance' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Reduced ventricular compliance', supportsDisease: ['hypertension', 'aortic_stenosis', 'hocm', 'cad'], weight: 0.5, documentationPhrase: 'S4 gallop' },
    ],
  },
  {
    id: 'cvs_click', section: 'auscultation', sectionOrder: 36, cardNumber: 36,
    label: 'Ejection Click',
    question: 'Ejection click or opening snap',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no ejection click' },
      { value: 'ejection_click_aortic', label: 'Aortic ejection click', documentationPhrase: 'aortic ejection click suggesting bicuspid aortic valve' },
      { value: 'ejection_click_pulmonary', label: 'Pulmonary ejection click', documentationPhrase: 'pulmonary ejection click suggesting pulmonary stenosis' },
      { value: 'opening_snap', label: 'Opening snap (mitral stenosis)', documentationPhrase: 'opening snap suggesting mitral stenosis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Mitral stenosis', supportsDisease: ['mitral_stenosis'], weight: 0.5, documentationPhrase: 'opening snap' },
      { disease: 'Bicuspid aortic valve', supportsDisease: ['bicuspid_aortic_valve', 'aortic_stenosis'], weight: 0.4, documentationPhrase: 'aortic ejection click' },
    ],
  },
  {
    id: 'cvs_pericardial_rub', section: 'auscultation', sectionOrder: 37, cardNumber: 37,
    label: 'Pericardial Rub',
    question: 'Pericardial friction rub',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no pericardial rub' },
      { value: 'present', label: 'Present', documentationPhrase: 'pericardial friction rub is heard, suggesting pericarditis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Pericarditis', supportsDisease: ['pericarditis'], weight: 0.7, documentationPhrase: 'pericardial rub' },
    ],
  },

  // ══ PART 8b: MURMUR ENGINE ══
  {
    id: 'cvs_murmur_present', section: 'murmur_engine', sectionOrder: 38, cardNumber: 38,
    label: 'Murmur',
    question: 'Is a murmur heard?',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'No murmur', documentationPhrase: 'no murmurs are heard' },
      { value: 'present', label: 'Murmur present', documentationPhrase: 'a cardiac murmur is heard' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['valvular', 'aortic_stenosis', 'mitral_regurgitation', 'mitral_stenosis', 'vhf'], weight: 0.6, documentationPhrase: 'cardiac murmur' },
    ],
    conditionalExpand: {
      triggerValues: ['present'],
      expandCardIds: ['cvs_murmur_site', 'cvs_murmur_timing', 'cvs_murmur_shape', 'cvs_murmur_grade', 'cvs_murmur_radiation', 'cvs_murmur_quality', 'cvs_murmur_dynamics'],
    },
  },
  {
    id: 'cvs_murmur_site', section: 'murmur_engine', sectionOrder: 39, cardNumber: 39,
    label: 'Murmur Site',
    question: 'Best heard at which area?',
    type: 'single_select',
    options: [
      { value: 'aortic', label: 'Aortic (R 2nd ICS)', documentationPhrase: 'best heard at the aortic area' },
      { value: 'pulmonary', label: 'Pulmonary (L 2nd ICS)', documentationPhrase: 'best heard at the pulmonary area' },
      { value: 'tricuspid', label: 'Tricuspid (L 4th ICS)', documentationPhrase: 'best heard at the tricuspid area' },
      { value: 'mitral', label: 'Mitral / Apex', documentationPhrase: 'best heard at the mitral area / apex' },
      { value: 'left_sternal', label: 'Left sternal border', documentationPhrase: 'best heard along the left sternal border' },
    ],
    documentationTemplate: 'The murmur is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'cvs_murmur_timing', section: 'murmur_engine', sectionOrder: 40, cardNumber: 40,
    label: 'Murmur Timing',
    question: 'Timing in cardiac cycle',
    type: 'single_select',
    options: [
      { value: 'systolic', label: 'Systolic', documentationPhrase: 'systolic murmur' },
      { value: 'diastolic', label: 'Diastolic', documentationPhrase: 'diastolic murmur' },
      { value: 'continuous', label: 'Continuous (systolic and diastolic)', documentationPhrase: 'continuous machinery murmur' },
    ],
    documentationTemplate: 'The murmur is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'PDA', supportsDisease: ['patent_ductus_arteriosus'], weight: 0.6, documentationPhrase: 'continuous machinery murmur' },
    ],
  },
  {
    id: 'cvs_murmur_shape', section: 'murmur_engine', sectionOrder: 41, cardNumber: 41,
    label: 'Murmur Shape',
    question: 'Configuration / shape of murmur',
    type: 'single_select',
    options: [
      { value: 'ejection', label: 'Ejection (crescendo-decrescendo)', documentationPhrase: 'ejection systolic murmur' },
      { value: 'pansystolic', label: 'Pansystolic / Holosystolic', documentationPhrase: 'pansystolic murmur' },
      { value: 'mid_diastolic', label: 'Mid-diastolic (rumbling)', documentationPhrase: 'mid-diastolic rumbling murmur' },
      { value: 'early_diastolic', label: 'Early diastolic (decrescendo)', documentationPhrase: 'early diastolic decrescendo murmur' },
      { value: 'late_systolic', label: 'Late systolic', documentationPhrase: 'late systolic murmur' },
      { value: 'presystolic', label: 'Presystolic', documentationPhrase: 'presystolic accentuation' },
    ],
    documentationTemplate: 'The murmur has a {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Aortic stenosis', supportsDisease: ['aortic_stenosis'], weight: 0.6, documentationPhrase: 'ejection systolic murmur' },
      { disease: 'Mitral regurgitation', supportsDisease: ['mitral_regurgitation'], weight: 0.6, documentationPhrase: 'pansystolic murmur' },
      { disease: 'Aortic regurgitation', supportsDisease: ['aortic_regurgitation'], weight: 0.6, documentationPhrase: 'early diastolic murmur' },
      { disease: 'Mitral stenosis', supportsDisease: ['mitral_stenosis'], weight: 0.6, documentationPhrase: 'mid-diastolic rumbling murmur' },
      { disease: 'MVP', supportsDisease: ['mitral_valve_prolapse'], weight: 0.5, documentationPhrase: 'late systolic murmur' },
    ],
  },
  {
    id: 'cvs_murmur_grade', section: 'murmur_engine', sectionOrder: 42, cardNumber: 42,
    label: 'Murmur Grade',
    question: 'Grade (I–VI)',
    type: 'single_select',
    options: [
      { value: '1', label: 'I/VI — Barely audible', documentationPhrase: 'grade I/VI' },
      { value: '2', label: 'II/VI — Quiet but audible', documentationPhrase: 'grade II/VI' },
      { value: '3', label: 'III/VI — Loud, no thrill', documentationPhrase: 'grade III/VI' },
      { value: '4', label: 'IV/VI — Loud with thrill', documentationPhrase: 'grade IV/VI' },
      { value: '5', label: 'V/VI — Audible with stethoscope edge', documentationPhrase: 'grade V/VI' },
      { value: '6', label: 'VI/VI — Audible without stethoscope', documentationPhrase: 'grade VI/VI' },
    ],
    documentationTemplate: 'The murmur is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { supportsDisease: ['severe_valvular'], weight: 0.3, documentationPhrase: 'grade {value} murmur' },
    ],
  },
  {
    id: 'cvs_murmur_radiation', section: 'murmur_engine', sectionOrder: 43, cardNumber: 43,
    label: 'Murmur Radiation',
    question: 'Where does the murmur radiate?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'No radiation', documentationPhrase: 'no radiation' },
      { value: 'carotids', label: 'To both carotids', documentationPhrase: 'radiates to both carotids' },
      { value: 'axilla', label: 'To left axilla', documentationPhrase: 'radiates to the left axilla' },
      { value: 'back', label: 'To back', documentationPhrase: 'radiates to the back' },
      { value: 'apex', label: 'To apex', documentationPhrase: 'radiates to the apex' },
    ],
    documentationTemplate: 'The murmur {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Aortic stenosis', supportsDisease: ['aortic_stenosis'], weight: 0.5, documentationPhrase: 'radiation to carotids' },
      { disease: 'Mitral regurgitation', supportsDisease: ['mitral_regurgitation'], weight: 0.5, documentationPhrase: 'radiation to axilla' },
    ],
  },
  {
    id: 'cvs_murmur_quality', section: 'murmur_engine', sectionOrder: 44, cardNumber: 44,
    label: 'Murmur Quality',
    question: 'Quality / pitch',
    type: 'multi_select',
    options: [
      { value: 'blowing', label: 'Blowing', documentationPhrase: 'blowing quality' },
      { value: 'harsh', label: 'Harsh', documentationPhrase: 'harsh quality' },
      { value: 'rumbling', label: 'Rumbling', documentationPhrase: 'rumbling quality' },
      { value: 'musical', label: 'Musical', documentationPhrase: 'musical quality' },
      { value: 'machinery', label: 'Machinery', documentationPhrase: 'machinery quality' },
    ],
    documentationTemplate: 'The murmur has a {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'cvs_murmur_dynamics', section: 'murmur_engine', sectionOrder: 45, cardNumber: 45,
    label: 'Murmur Dynamics',
    question: 'Changes with maneuvers?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'No significant change', documentationPhrase: 'no significant change with maneuvers' },
      { value: 'inspiration', label: 'Increases with inspiration', documentationPhrase: 'murmur increases with inspiration (right-sided)' },
      { value: 'expiration', label: 'Increases with expiration', documentationPhrase: 'murmur increases with expiration (left-sided)' },
      { value: 'valsalva', label: 'Decreases with Valsalva', documentationPhrase: 'murmur decreases with Valsalva (most murmurs)' },
      { value: 'valsalva_increase', label: 'Increases with Valsalva (HOCM)', documentationPhrase: 'murmur increases with Valsalva suggesting HOCM' },
      { value: 'squatting', label: 'Increases with squatting', documentationPhrase: 'murmur increases with squatting' },
      { value: 'standing', label: 'Decreases with standing', documentationPhrase: 'murmur decreases with standing' },
      { value: 'handgrip', label: 'Increases with handgrip', documentationPhrase: 'murmur increases with sustained handgrip' },
      { value: 'leaning_forward', label: 'Louder leaning forward (AR)', documentationPhrase: 'murmur becomes louder when patient leans forward suggesting aortic regurgitation' },
      { value: 'left_lateral', label: 'Louder in left lateral (MS)', documentationPhrase: 'murmur becomes louder in left lateral position suggesting mitral stenosis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'HOCM', supportsDisease: ['hocm'], weight: 0.6, documentationPhrase: 'increases with Valsalva suggesting HOCM' },
      { disease: 'MVP', supportsDisease: ['mitral_valve_prolapse'], weight: 0.5, documentationPhrase: 'changes with position' },
    ],
  },

  // ══ PART 9: PERIPHERAL VASCULAR ══
  {
    id: 'cvs_pedal_pulses', section: 'peripheral_vascular', sectionOrder: 46, cardNumber: 46,
    label: 'Pedal Pulses',
    question: 'Dorsalis pedis and posterior tibial pulses',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Present and symmetrical', documentationPhrase: 'pedal pulses are present and symmetrical' },
      { value: 'reduced_left', label: 'Reduced left', documentationPhrase: 'reduced pedal pulses on the left' },
      { value: 'reduced_right', label: 'Reduced right', documentationPhrase: 'reduced pedal pulses on the right' },
      { value: 'absent_left', label: 'Absent left', documentationPhrase: 'pedal pulses are absent on the left' },
      { value: 'absent_right', label: 'Absent right', documentationPhrase: 'pedal pulses are absent on the right' },
      { value: 'absent_bilateral', label: 'Absent bilaterally', documentationPhrase: 'pedal pulses are absent bilaterally' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Peripheral vascular disease', supportsDisease: ['pvd', 'atherosclerosis'], weight: 0.6, documentationPhrase: 'reduced pedal pulses' },
    ],
  },
  {
    id: 'cvs_femoral_pulses', section: 'peripheral_vascular', sectionOrder: 47, cardNumber: 47,
    label: 'Femoral Pulses',
    question: 'Femoral pulses',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Present and symmetrical', documentationPhrase: 'femoral pulses are present and symmetrical' },
      { value: 'weak', label: 'Weak / Reduced', documentationPhrase: 'femoral pulses are weak' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'femoral pulses are absent' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Coarctation', supportsDisease: ['coarctation_of_aorta', 'pvd'], weight: 0.5, documentationPhrase: 'weak femoral pulses' },
    ],
  },
  {
    id: 'cvs_radiofemoral_delay', section: 'peripheral_vascular', sectionOrder: 48, cardNumber: 48,
    label: 'Radio-Femoral Delay',
    question: 'Radio-femoral delay',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent (synchronous)', documentationPhrase: 'no radio-femoral delay' },
      { value: 'present', label: 'Present (femoral delayed)', documentationPhrase: 'radio-femoral delay is present suggesting coarctation of the aorta' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, hideForAgeBands: ['neonate'] },
    evidenceLinks: [
      { disease: 'Coarctation of aorta', supportsDisease: ['coarctation_of_aorta'], weight: 0.7, documentationPhrase: 'radio-femoral delay' },
    ],
  },
  {
    id: 'cvs_peripheral_edema', section: 'peripheral_vascular', sectionOrder: 49, cardNumber: 49,
    label: 'Peripheral Edema',
    question: 'Lower limb edema',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no peripheral edema' },
      { value: 'pitting_mild', label: 'Pitting + (mild)', documentationPhrase: 'mild pitting pedal edema' },
      { value: 'pitting_moderate', label: 'Pitting ++ (moderate)', documentationPhrase: 'moderate pitting edema' },
      { value: 'pitting_severe', label: 'Pitting +++ (severe)', documentationPhrase: 'severe pitting edema extending to the thighs' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Fluid overload', phenotype: 'Heart failure', supportsDisease: ['heart_failure', 'renal_failure', 'cirrhosis'], weight: 0.5, documentationPhrase: 'peripheral edema' },
    ],
  },
  {
    id: 'cvs_varicose_veins', section: 'peripheral_vascular', sectionOrder: 50, cardNumber: 50,
    label: 'Varicose Veins',
    question: 'Varicose veins / chronic venous changes',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no varicose veins or chronic venous changes' },
      { value: 'varicose', label: 'Varicose veins', documentationPhrase: 'varicose veins are present' },
      { value: 'skin_changes', label: 'Chronic venous skin changes', documentationPhrase: 'chronic venous skin changes including hemosiderin deposition and lipodermatosclerosis' },
      { value: 'venous_ulcer', label: 'Venous ulcer', documentationPhrase: 'venous ulcer is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'CVI', supportsDisease: ['chronic_venous_insufficiency', 'dvt'], weight: 0.5, documentationPhrase: 'chronic venous insufficiency' },
    ],
  },

  // ══ NEONATAL-SPECIFIC CARDS ══
  {
    id: 'cvs_neonatal', section: 'general_survey', sectionOrder: 51, cardNumber: 51,
    label: 'Neonatal Cardiac Assessment',
    question: 'Neonatal cardiovascular assessment',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'neonatal cardiovascular assessment is normal' },
      { value: 'cyanosis', label: 'Cyanosis / hypoxia', documentationPhrase: 'cyanosis suggesting congenital heart disease' },
      { value: 'respiratory_distress', label: 'Respiratory distress', documentationPhrase: 'respiratory distress with cardiac etiology' },
      { value: 'precordial_activity', label: 'Increased precordial activity', documentationPhrase: 'increased precordial activity' },
      { value: 'murmur', label: 'Murmur on auscultation', documentationPhrase: 'cardiac murmur is heard' },
      { value: 'weak_femoral', label: 'Weak or absent femoral pulses', documentationPhrase: 'weak or absent femoral pulses suggesting coarctation' },
      { value: 'hepatomegaly', label: 'Hepatomegaly', documentationPhrase: 'hepatomegaly suggesting heart failure' },
      { value: 'failure_to_thrive', label: 'Failure to thrive', documentationPhrase: 'failure to thrive with cardiac cause' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { showForAgeBands: ['neonate'] },
    evidenceLinks: [
      { supportsDisease: ['congenital_heart_disease', 'chd', 'pda', 'coarctation_of_aorta', 'heart_failure'], weight: 0.6, documentationPhrase: 'neonatal cardiac finding' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// FILTER CARDS BY AGE, SEX, PREGNANCY, MODE
// ─────────────────────────────────────────────────────────────────

export function filterCvsCards(
  cards: CvsCardDef[],
  ctx: CvsContext,
  mode: CvsExamMode,
): CvsCardDef[] {
  return cards.filter(card => {
    const cv = card.contextVisibility;
    if (mode === 'secondary' && !cv.screeningMode) return false;
    if (cv.hideForAgeBands?.includes(ctx.ageBand)) return false;
    if (cv.showForAgeBands && !cv.showForAgeBands.includes(ctx.ageBand)) return false;
    if (cv.showForSex && !cv.showForSex.includes(ctx.sex)) return false;
    if (cv.showForPregnancy && !ctx.pregnant) return false;
    return true;
  });
}

// ─────────────────────────────────────────────────────────────────
// GET EXPANDED CARD IDS
// ─────────────────────────────────────────────────────────────────

export function getCvsExpandedCardIds(
  findings: Record<string, unknown>,
  cards: CvsCardDef[],
): Set<string> {
  const expanded = new Set<string>();
  for (const card of cards) {
    const val = findings[card.id];
    if (val == null || val === '' || val === false) continue;
    if (card.conditionalExpand) {
      const vals = Array.isArray(val) ? val : [val];
      const triggerHit = card.conditionalExpand.triggerValues.some(tv =>
        vals.some((v: unknown) => String(v) === tv),
      );
      if (triggerHit) {
        for (const eid of card.conditionalExpand.expandCardIds) {
          expanded.add(eid);
        }
      }
    }
  }
  return expanded;
}

// ─────────────────────────────────────────────────────────────────
// CHECK IF SCREENING → PRIMARY AUTO-ESCALATION
// ─────────────────────────────────────────────────────────────────

export function shouldEscalateCvsToPrimary(findings: Record<string, unknown>): boolean {
  const escalationFindings = [
    'scr_cvs_pulse', 'scr_cvs_bp', 'scr_cvs_heart_sounds',
    'scr_cvs_murmur', 'scr_cvs_peripheral_edema', 'scr_cvs_jvp',
  ];
  for (const fId of escalationFindings) {
    const val = findings[fId];
    if (val != null && val !== '' && val !== false) {
      const strVal = String(val);
      if (strVal !== 'regular_normal' && strVal !== 'normal' &&
          strVal !== 'absent' && strVal !== 'equal') {
        return true;
      }
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────
// GENERATE CARDIOVASCULAR NARRATIVE
// ─────────────────────────────────────────────────────────────────

export function generateCardiovascularNarrative(
  cards: CvsCardDef[],
  findings: Record<string, unknown>,
  mode: CvsExamMode,
): string {
  if (mode === 'secondary') {
    const pulse = findings['scr_cvs_pulse'];
    const bp = findings['scr_cvs_bp'];
    const heartSounds = findings['scr_cvs_heart_sounds'];
    const murmur = findings['scr_cvs_murmur'];
    const edema = findings['scr_cvs_peripheral_edema'];
    const jvp = findings['scr_cvs_jvp'];

    const hasAbnormal =
      (pulse && String(pulse) !== 'regular_normal') ||
      (bp && String(bp) !== 'normal') ||
      (heartSounds && String(heartSounds) !== 'normal') ||
      (murmur && String(murmur) !== 'absent') ||
      (edema && String(edema) !== 'absent') ||
      (jvp && String(jvp) !== 'normal');

    if (hasAbnormal) {
      const parts: string[] = ['**Cardiovascular System:**'];
      if (pulse && String(pulse) !== 'regular_normal') parts.push(findDocPhrase(cards, 'scr_cvs_pulse', pulse));
      if (bp && String(bp) !== 'normal') parts.push(findDocPhrase(cards, 'scr_cvs_bp', bp));
      if (heartSounds && String(heartSounds) !== 'normal') parts.push(findDocPhrase(cards, 'scr_cvs_heart_sounds', heartSounds));
      if (murmur && String(murmur) !== 'absent') parts.push(findDocPhrase(cards, 'scr_cvs_murmur', murmur));
      if (edema && String(edema) !== 'absent') parts.push(findDocPhrase(cards, 'scr_cvs_peripheral_edema', edema));
      if (jvp && String(jvp) !== 'normal') parts.push(findDocPhrase(cards, 'scr_cvs_jvp', jvp));
      return parts.join(' ');
    }

    return '**Cardiovascular System:** Pulse is regular with normal rate, rhythm and volume. Blood pressure is within normal limits. Heart sounds S1 and S2 are normal with no audible murmurs. There is no peripheral edema or elevation of the jugular venous pressure.';
  }

  const sections: CvsSection[] = [
    'general_survey', 'hands', 'arms', 'face', 'neck',
    'precordial_inspection', 'palpation', 'auscultation',
    'murmur_engine', 'peripheral_vascular',
  ];
  const paraParts: string[] = [];

  for (const section of sections) {
    const sectionCards = cards.filter(c => c.section === section);
    const phrases: string[] = [];

    for (const card of sectionCards) {
      const val = findings[card.id];
      if (val == null || val === '' || val === false) continue;

      const vals = Array.isArray(val) ? val : [val];
      for (const v of vals) {
        if (v === 'none' || v === 'absent' || v === 'normal' || v === 'not_palpable' || v === 'equal') continue;
        const phrase = findDocPhrase(cards, card.id, v);
        if (phrase) phrases.push(phrase);
      }
    }

    if (phrases.length > 0) {
      paraParts.push(phrases.join('; '));
    }
  }

  if (paraParts.length === 0) {
    return '**Cardiovascular System:** The patient is comfortable at rest with no central cyanosis. Pulse is regular with normal volume and character. Blood pressure is within normal limits. Jugular venous pressure is not elevated. The apex beat is not displaced. No parasternal heave or thrills. Heart sounds S1 and S2 are normal with no murmurs or added sounds. Peripheral pulses are symmetrical with no edema.';
  }

  return '**Cardiovascular Examination:** ' + paraParts.join('. ');
}

function findDocPhrase(cards: CvsCardDef[], cardId: string, value: unknown): string {
  const card = cards.find(c => c.id === cardId);
  if (!card) return String(value);
  if (card.type === 'numeric' || card.type === 'text') {
    return card.documentationTemplate.replace(/\{value\}/g, String(value));
  }
  const opt = card.options.find(o => o.value === String(value));
  return opt ? opt.documentationPhrase : String(value);
}

// ─────────────────────────────────────────────────────────────────
// EVIDENCE GRAPH
// ─────────────────────────────────────────────────────────────────

export interface CvsEvidenceGraphNode {
  finding: string;
  findingLabel: string;
  mechanisms: string[];
  phenotypes: string[];
  diseases: string[];
  investigations: string[];
  monitoring: string[];
}

export function buildCvsEvidenceGraph(
  findings: Record<string, unknown>,
  cards: CvsCardDef[],
): CvsEvidenceGraphNode[] {
  const graph: CvsEvidenceGraphNode[] = [];

  for (const card of cards) {
    const val = findings[card.id];
    if (val == null || val === '' || val === false) continue;
    if (card.evidenceLinks.length === 0) continue;

    const mechanisms = [...new Set(card.evidenceLinks.map(l => l.mechanism).filter(Boolean))] as string[];
    const phenotypes = [...new Set(card.evidenceLinks.map(l => l.phenotype).filter(Boolean))] as string[];
    const diseases = [...new Set(card.evidenceLinks.flatMap(l => l.supportsDisease))];

    const node: CvsEvidenceGraphNode = {
      finding: card.id,
      findingLabel: card.label,
      mechanisms,
      phenotypes,
      diseases,
      investigations: getCvsInvestigations(diseases),
      monitoring: ['Heart rate', 'Blood pressure', 'ECG', 'SpO₂'],
    };
    graph.push(node);
  }

  return graph;
}

function getCvsInvestigations(diseases: string[]): string[] {
  const map: Record<string, string[]> = {
    heart_failure: ['ECG', 'Chest X-ray', 'BNP', 'Echocardiogram', 'CMP'],
    aortic_stenosis: ['ECG', 'Echocardiogram', 'Chest X-ray', 'CT aortogram'],
    mitral_regurgitation: ['ECG', 'Echocardiogram', 'Chest X-ray'],
    mitral_stenosis: ['ECG', 'Echocardiogram', 'Chest X-ray'],
    aortic_regurgitation: ['ECG', 'Echocardiogram', 'Chest X-ray', 'MRI aorta'],
    endocarditis: ['Blood cultures', 'Echocardiogram', 'CBC', 'CRP', 'ESR'],
    pericarditis: ['ECG', 'Echocardiogram', 'CRP', 'Chest X-ray'],
    atrial_fibrillation: ['ECG', 'Echo', 'Thyroid function', 'CMP'],
    pulmonary_hypertension: ['Echocardiogram', 'Chest X-ray', 'PFTs', 'RHC'],
    cardiomyopathy: ['Echocardiogram', 'ECG', 'BNP', 'Cardiac MRI'],
    hypertension: ['ECG', 'CMP', 'Urinalysis', 'Echocardiogram'],
    cad: ['ECG', 'Troponin', 'Echocardiogram', 'Stress test', 'Angiogram'],
    congenital_heart_disease: ['Echocardiogram', 'ECG', 'Chest X-ray', 'Cardiac MRI'],
    coarctation_of_aorta: ['Echocardiogram', 'CT aortogram', 'BP all limbs'],
    pvd: ['Ankle-brachial index', 'Doppler US', 'CBC'],
    atrial_septal_defect: ['Echocardiogram', 'ECG', 'Chest X-ray'],
    pda: ['Echocardiogram', 'ECG', 'Chest X-ray'],
    hocm: ['Echocardiogram', 'ECG', 'Cardiac MRI', 'Exercise test'],
  };
  const invs = new Set<string>();
  for (const d of diseases) {
    if (map[d]) {
      for (const inv of map[d]) invs.add(inv);
    }
  }
  return [...invs];
}
