// ─────────────────────────────────────────────────────────────────
// AMEXAN Universal Breast Examination Engine (UBEE)
// Constitutional Volume - full structured breast exam flow
// Follows Macleod's, Talley & O'Connor, ACS Surgery, Schwartz's,
// Bailey & Love, and standard breast examination texts
// ─────────────────────────────────────────────────────────────────

export type AgeBand = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export type BreastExamMode =
  | 'complete'
  | 'screening'
  | 'pregnant'
  | 'lactating'
  | 'male'
  | 'pediatric'
  | 'neonatal'
  | 'postoperative'
  | 'cancer_context'
  | 'emergency';

export type BreastSection =
  | 'preparation' | 'inspection' | 'palpation' | 'nipple'
  | 'axillary' | 'supraclavicular' | 'chest_wall'
  | 'special_tests' | 'cancer' | 'breastfeeding'
  | 'postoperative' | 'male_breast' | 'summary';

export interface BreastOption {
  value: string;
  label: string;
  documentationPhrase: string;
  triggersCascade?: string;
  triggersFindings?: string[];
}

export interface BreastEvidenceLink {
  mechanism?: string;
  phenotype?: string;
  disease?: string;
  supportsDisease: string[];
  weight: number;
  documentationPhrase: string;
  investigation?: string;
}

export interface BreastConditionalExpand {
  triggerValues: string[];
  expandCardIds: string[];
}

export interface BreastCardDef {
  id: string;
  section: BreastSection;
  sectionOrder: number;
  cardNumber: number;
  label: string;
  question: string;
  type: 'single_select' | 'multi_select' | 'boolean' | 'numeric' | 'text';
  options: BreastOption[];
  documentationTemplate: string;
  contextVisibility: {
    showForAgeBands?: AgeBand[];
    hideForAgeBands?: AgeBand[];
    showForSex?: ('male' | 'female')[];
    showForPregnancy?: boolean;
    showForLactation?: boolean;
    showForMode?: BreastExamMode[];
    hideForMode?: BreastExamMode[];
    alwaysShow?: boolean;
    screeningMode?: boolean;
    showForContext?: string[];
  };
  conditionalExpand?: BreastConditionalExpand;
  evidenceLinks: BreastEvidenceLink[];
}

export interface BreastContext {
  ageBand: AgeBand;
  sex: 'male' | 'female';
  pregnant: boolean;
  lactating: boolean;
  knownDiseases: string[];
  chiefComplaints: string[];
  activeModules: string[];
  findings: Record<string, unknown>;
  previousBreastSurgery: boolean;
  breastCancerHistory: boolean;
  brcaMutation: boolean;
  implantHistory: boolean;
  breastfeedingIssues: boolean;
  postpartum: boolean;
}

export interface BreastEvidenceGraphNode {
  finding: string;
  findingLabel: string;
  mechanisms: string[];
  phenotypes: string[];
  diseases: string[];
  investigations: string[];
  anatomicalLocation?: string;
  breastArchitecture?: string[];
}

// ─────────────────────────────────────────────────────────────────
// AGE BAND
// ─────────────────────────────────────────────────────────────────

function getAgeBand(ageMonths: number): AgeBand {
  if (ageMonths < 1) return 'neonate';
  if (ageMonths < 12) return 'infant';
  if (ageMonths < 36) return 'toddler';
  if (ageMonths < 144) return 'child';
  if (ageMonths < 216) return 'adolescent';
  if (ageMonths < 720) return 'adult';
  return 'elderly';
}

// ─────────────────────────────────────────────────────────────────
// TERMS MAP
// ─────────────────────────────────────────────────────────────────

const BREAST_TERMS: Record<string, string> = {
  'upper_outer': 'upper outer quadrant',
  'upper_inner': 'upper inner quadrant',
  'lower_inner': 'lower inner quadrant',
  'lower_outer': 'lower outer quadrant',
  'central': 'central/retro-areolar',
  'axillary_tail': 'axillary tail of Spence',
};

// ─────────────────────────────────────────────────────────────────
// MODE DETECTION
// ─────────────────────────────────────────────────────────────────

const BREAST_HISTORY_TRIGGERS = [
  'breast_lump', 'breast_pain', 'breast_swelling', 'breast_enlargement',
  'nipple_discharge', 'bloody_nipple_discharge', 'breast_ulcer',
  'breast_redness', 'breast_infection', 'breast_abscess',
  'fever_with_breast_symptoms', 'nipple_inversion', 'skin_dimpling',
  'peau_d_orange', 'breast_trauma', 'breast_implant_complaint',
  'breast_asymmetry', 'lactation_problems', 'mastitis', 'galactorrhea',
  'male_breast_enlargement', 'breast_screening', 'high_risk_breast_cancer',
  'brca_mutation', 'previous_breast_surgery', 'breast_cancer_follow_up',
  'lumpectomy_follow_up', 'mastectomy_follow_up', 'reconstruction_follow_up',
  'chemotherapy_follow_up', 'radiotherapy_follow_up',
];

const SURGERY_MODULES = ['general_surgery', 'breast_surgery', 'surgical_oncology'];

const CANCER_DISEASES = [
  'breast_cancer', 'invasive_ductal', 'invasive_lobular',
  'paget_disease', 'inflammatory_breast_cancer', 'dcis', 'lcis',
  'male_breast_cancer', 'brca1', 'brca2',
];

const BREASTFEEDING_ISSUES = [
  'mastitis', 'breast_abscess', 'blocked_duct', 'nipple_trauma',
  'lactation_problems', 'engorgement', 'cracked_nipple',
];

const MALE_BREAST_ENLARGEMENT = [
  'gynecomastia', 'male_breast_enlargement', 'male_breast_cancer',
];

export function detectBreastExamMode(ctx: BreastContext): BreastExamMode {
  if (ctx.ageBand === 'neonate') return 'neonatal';
  if (['infant', 'toddler', 'child'].includes(ctx.ageBand)) return 'pediatric';

  if (ctx.sex === 'male') {
    const hasMaleIssue = ctx.chiefComplaints.some(c => MALE_BREAST_ENLARGEMENT.includes(c))
      || ctx.knownDiseases.some(d => MALE_BREAST_ENLARGEMENT.includes(d));
    if (hasMaleIssue) return 'male';
  }

  if (ctx.pregnant) return 'pregnant';
  if (ctx.lactating || ctx.breastfeedingIssues || ctx.postpartum) return 'lactating';

  const hasCancerHistory = ctx.breastCancerHistory
    || ctx.knownDiseases.some(d => CANCER_DISEASES.includes(d))
    || ctx.brcaMutation;
  if (hasCancerHistory) return 'cancer_context';

  if (ctx.previousBreastSurgery || ctx.implantHistory) return 'postoperative';

  const hasBreastEmergency = ctx.chiefComplaints.some(c =>
    ['breast_abscess', 'breast_infection', 'breast_trauma', 'mastitis', 'fever_with_breast_symptoms'].includes(c)
  );
  if (hasBreastEmergency) return 'emergency';

  const hasBreastComplaint = ctx.chiefComplaints.some(c => BREAST_HISTORY_TRIGGERS.includes(c));
  const hasSurgModule = ctx.activeModules.some(m => SURGERY_MODULES.includes(m));
  if (hasBreastComplaint || hasSurgModule) return 'complete';

  return 'screening';
}

export function isBreastEngineRequired(ctx: BreastContext): boolean {
  const hasTrigger = ctx.chiefComplaints.some(c => BREAST_HISTORY_TRIGGERS.includes(c))
    || ctx.knownDiseases.some(d => CANCER_DISEASES.includes(d) || BREAST_HISTORY_TRIGGERS.includes(d))
    || ctx.previousBreastSurgery || ctx.breastCancerHistory || ctx.brcaMutation
    || ctx.implantHistory || ctx.breastfeedingIssues || ctx.postpartum
    || ctx.pregnant || ctx.lactating;
  if (hasTrigger) return true;
  const hasSurgicalModule = ctx.activeModules.some(m => SURGERY_MODULES.includes(m));
  if (hasSurgicalModule) return true;
  const maleIssue = ctx.sex === 'male' && ctx.chiefComplaints.some(c => MALE_BREAST_ENLARGEMENT.includes(c));
  if (maleIssue) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────
// CARD DEFINITIONS
// ─────────────────────────────────────────────────────────────────

export const BREAST_CARDS: BreastCardDef[] = [
  // ── PREPARATION ──
  {
    id: 'breast_prep_consent', section: 'preparation', sectionOrder: 0, cardNumber: 1,
    label: 'Consent', question: 'Was informed consent obtained?',
    type: 'boolean',
    options: [{ value: 'yes', label: 'Yes', documentationPhrase: 'informed consent obtained' }],
    documentationTemplate: 'Informed consent was obtained. {value}.',
    contextVisibility: { alwaysShow: true }, evidenceLinks: [],
  },
  {
    id: 'breast_prep_chaperone', section: 'preparation', sectionOrder: 0, cardNumber: 2,
    label: 'Chaperone', question: 'Was a chaperone offered/present?',
    type: 'single_select',
    options: [
      { value: 'offered_declined', label: 'Offered but declined', documentationPhrase: 'chaperone was offered but declined' },
      { value: 'present', label: 'Present', documentationPhrase: 'chaperone was present' },
      { value: 'not_offered', label: 'Not offered', documentationPhrase: 'chaperone not offered' },
    ],
    documentationTemplate: 'Chaperone: {value}.',
    contextVisibility: { alwaysShow: true }, evidenceLinks: [],
  },
  {
    id: 'breast_prep_exposure', section: 'preparation', sectionOrder: 0, cardNumber: 3,
    label: 'Exposure', question: 'Was adequate exposure achieved?',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes', documentationPhrase: 'adequate exposure' },
      { value: 'partial', label: 'Partial', documentationPhrase: 'limited exposure' },
    ],
    documentationTemplate: 'Exposure: {value}.',
    contextVisibility: { alwaysShow: true }, evidenceLinks: [],
  },
  {
    id: 'breast_prep_position', section: 'preparation', sectionOrder: 0, cardNumber: 4,
    label: 'Position', question: 'Patient position for examination',
    type: 'single_select',
    options: [
      { value: 'seated', label: 'Seated', documentationPhrase: 'patient seated' },
      { value: 'supine', label: 'Supine', documentationPhrase: 'patient supine' },
      { value: 'both', label: 'Seated and supine', documentationPhrase: 'examined seated and supine' },
    ],
    documentationTemplate: 'Examined {value}.',
    contextVisibility: { alwaysShow: true }, evidenceLinks: [],
  },

  // ── INSPECTION ──
  {
    id: 'breast_insp_symmetry', section: 'inspection', sectionOrder: 1, cardNumber: 5,
    label: 'Symmetry', question: 'Breast symmetry',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'breasts are symmetrical' },
      { value: 'left_larger', label: 'Left larger', documentationPhrase: 'left breast is larger than right' },
      { value: 'right_larger', label: 'Right larger', documentationPhrase: 'right breast is larger than left' },
      { value: 'diffuse_enlargement', label: 'Diffuse enlargement', documentationPhrase: 'diffuse enlargement of breasts' },
      { value: 'localized_enlargement', label: 'Localized enlargement', documentationPhrase: 'localized enlargement present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['breast_cancer', 'fibroadenoma', 'phyllodes'], weight: 0.2, documentationPhrase: 'visible asymmetry' },
      { supportsDisease: ['mastitis', 'breast_abscess'], weight: 0.3, documentationPhrase: 'asymmetry due to infection' },
    ],
  },
  {
    id: 'breast_insp_size', section: 'inspection', sectionOrder: 1, cardNumber: 6,
    label: 'Size', question: 'Breast size',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'normal size' },
      { value: 'small', label: 'Small', documentationPhrase: 'small breasts' },
      { value: 'large', label: 'Large', documentationPhrase: 'large breasts' },
      { value: 'massive', label: 'Massive', documentationPhrase: 'massive (macromastia)' },
    ],
    documentationTemplate: 'Size: {value}.',
    contextVisibility: { alwaysShow: true }, evidenceLinks: [],
  },
  {
    id: 'breast_insp_shape', section: 'inspection', sectionOrder: 1, cardNumber: 7,
    label: 'Shape', question: 'Breast shape',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'normal shape' },
      { value: 'distorted', label: 'Distorted', documentationPhrase: 'distorted shape' },
      { value: 'flattened', label: 'Flattened', documentationPhrase: 'flattened contour' },
      { value: 'bulging', label: 'Bulging', documentationPhrase: 'bulging contour' },
      { value: 'loss_of_contour', label: 'Loss of contour', documentationPhrase: 'loss of normal contour' },
    ],
    documentationTemplate: 'Shape: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['breast_cancer'], weight: 0.4, documentationPhrase: 'shape distortion suggests underlying mass' },
    ],
  },
  {
    id: 'breast_insp_skin', section: 'inspection', sectionOrder: 1, cardNumber: 8,
    label: 'Skin changes', question: 'Skin changes of the breast',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'skin is normal' },
      { value: 'erythema', label: 'Erythema', documentationPhrase: 'erythema present' },
      { value: 'edema', label: 'Edema', documentationPhrase: 'edema present' },
      { value: 'peau_d_orange', label: 'Peau d\'orange', documentationPhrase: 'peau d\'orange skin changes' },
      { value: 'ulceration', label: 'Ulceration', documentationPhrase: 'skin ulceration present' },
      { value: 'scar', label: 'Scar', documentationPhrase: 'surgical scar present' },
      { value: 'pigmentation', label: 'Pigmentation', documentationPhrase: 'pigmentation changes' },
      { value: 'venous_prominence', label: 'Venous prominence', documentationPhrase: 'prominent superficial veins' },
      { value: 'dimpling', label: 'Dimpling', documentationPhrase: 'skin dimpling/tethering' },
      { value: 'cellulitis', label: 'Cellulitis', documentationPhrase: 'cellulitis' },
      { value: 'radiation_changes', label: 'Radiotherapy changes', documentationPhrase: 'radiotherapy skin changes' },
    ],
    documentationTemplate: 'Skin: {value}.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['peau_d_orange', 'ulceration', 'dimpling'],
      expandCardIds: ['breast_cancer_skin_changes'],
    },
    evidenceLinks: [
      { disease: 'inflammatory_breast_cancer', supportsDisease: ['inflammatory_breast_cancer'], weight: 0.8, documentationPhrase: 'peau d\'orange is a classic sign of inflammatory breast cancer', mechanism: 'Dermal lymphatic invasion', phenotype: 'Peau d\'orange', investigation: 'Core biopsy' },
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.6, documentationPhrase: 'skin dimpling/tethering suggests underlying malignancy', mechanism: 'Cooper\'s ligament invasion', phenotype: 'Skin dimpling' },
      { supportsDisease: ['mastitis', 'breast_abscess'], weight: 0.5, documentationPhrase: 'erythema suggests infection' },
      { supportsDisease: ['breast_cancer', 'inflammatory_breast_cancer'], weight: 0.7, documentationPhrase: 'edema/peau d\'orange suggests lymphatic involvement' },
    ],
  },
  {
    id: 'breast_insp_visible_masses', section: 'inspection', sectionOrder: 1, cardNumber: 9,
    label: 'Visible masses', question: 'Are any masses visible on inspection?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None visible', documentationPhrase: 'no visible masses' },
      { value: 'present', label: 'Present', documentationPhrase: 'visible mass present', triggersCascade: 'mass' },
    ],
    documentationTemplate: 'Visible masses: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['breast_cancer', 'fibroadenoma', 'breast_abscess'], weight: 0.3, documentationPhrase: 'visible mass noted' },
    ],
  },
  {
    id: 'breast_insp_nipple', section: 'inspection', sectionOrder: 1, cardNumber: 10,
    label: 'Nipple inspection', question: 'Nipple appearance',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'nipples normal' },
      { value: 'retracted', label: 'Retracted', documentationPhrase: 'nipple retraction present' },
      { value: 'inverted', label: 'Inverted', documentationPhrase: 'nipple inversion present' },
      { value: 'destroyed', label: 'Destroyed', documentationPhrase: 'nipple destroyed' },
      { value: 'ulcerated', label: 'Ulcerated', documentationPhrase: 'nipple ulceration present' },
      { value: 'crusted', label: 'Crusted', documentationPhrase: 'nipple crusting' },
      { value: 'eczema', label: 'Eczema', documentationPhrase: 'eczematous changes' },
      { value: 'paget_changes', label: 'Paget\'s changes', documentationPhrase: 'Paget\'s disease changes' },
      { value: 'deviation', label: 'Deviation', documentationPhrase: 'nipple deviation' },
      { value: 'accessory', label: 'Accessory nipple', documentationPhrase: 'accessory/supernumerary nipple' },
    ],
    documentationTemplate: 'Nipples: {value}.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['paget_changes', 'retracted', 'inverted', 'destroyed', 'ulcerated'],
      expandCardIds: ['breast_cancer_nipple_changes'],
    },
    evidenceLinks: [
      { disease: 'paget_disease', supportsDisease: ['paget_disease'], weight: 0.9, documentationPhrase: 'Paget\'s changes of the nipple', phenotype: 'Nipple eczema', investigation: 'Nipple biopsy' },
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.5, documentationPhrase: 'nipple retraction suggests underlying malignancy', mechanism: 'Ductal invasion/tethering' },
      { supportsDisease: ['duct_ectasia', 'mammary_duct_fistula'], weight: 0.3, documentationPhrase: 'nipple inversion may be benign' },
    ],
  },
  {
    id: 'breast_insp_areola', section: 'inspection', sectionOrder: 1, cardNumber: 11,
    label: 'Areola', question: 'Areolar appearance',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'areolae normal' },
      { value: 'inflamed', label: 'Inflamed', documentationPhrase: 'areolar inflammation' },
      { value: 'pigmented', label: 'Hyperpigmented', documentationPhrase: 'areolar hyperpigmentation' },
      { value: 'scarred', label: 'Scarred', documentationPhrase: 'areolar scarring' },
      { value: 'ulcerated', label: 'Ulcerated', documentationPhrase: 'areolar ulceration' },
    ],
    documentationTemplate: 'Areolae: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['paget_disease', 'eczema'], weight: 0.4, documentationPhrase: 'areolar changes' },
    ],
  },

  // ── PALPATION ──
  {
    id: 'breast_palp_tenderness', section: 'palpation', sectionOrder: 2, cardNumber: 12,
    label: 'Tenderness', question: 'Is there breast tenderness on palpation?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no tenderness' },
      { value: 'localized', label: 'Localized', documentationPhrase: 'localized tenderness' },
      { value: 'diffuse', label: 'Diffuse', documentationPhrase: 'diffuse tenderness' },
    ],
    documentationTemplate: 'Tenderness: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['mastitis', 'breast_abscess'], weight: 0.6, documentationPhrase: 'tenderness suggests infection' },
      { supportsDisease: ['fibrocystic_change'], weight: 0.3, documentationPhrase: 'tenderness seen in fibrocystic disease' },
      { supportsDisease: ['breast_cancer'], weight: 0.1, documentationPhrase: 'breast cancer is typically painless' },
    ],
  },
  {
    id: 'breast_palp_temperature', section: 'palpation', sectionOrder: 2, cardNumber: 13,
    label: 'Temperature', question: 'Skin temperature',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'normal temperature' },
      { value: 'warm', label: 'Warm', documentationPhrase: 'warm to touch' },
      { value: 'hot', label: 'Hot', documentationPhrase: 'hot to touch' },
    ],
    documentationTemplate: 'Temperature: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['mastitis', 'breast_abscess', 'cellulitis'], weight: 0.7, documentationPhrase: 'warmth suggests infection' },
      { supportsDisease: ['inflammatory_breast_cancer'], weight: 0.4, documentationPhrase: 'warmth may be present in inflammatory cancer' },
    ],
  },
  {
    id: 'breast_palp_consistency', section: 'palpation', sectionOrder: 2, cardNumber: 14,
    label: 'Consistency', question: 'Breast tissue consistency',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'normal consistency' },
      { value: 'nodular', label: 'Nodular', documentationPhrase: 'nodular consistency' },
      { value: 'fibrocystic', label: 'Fibrocystic', documentationPhrase: 'fibrocystic consistency' },
      { value: 'diffuse_firmness', label: 'Diffuse firmness', documentationPhrase: 'diffusely firm' },
      { value: 'engorged', label: 'Engorged', documentationPhrase: 'engorged' },
    ],
    documentationTemplate: 'Consistency: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['fibrocystic_change'], weight: 0.6, documentationPhrase: 'nodular/fibrocystic consistency typical' },
      { supportsDisease: ['breast_cancer', 'inflammatory_breast_cancer'], weight: 0.3, documentationPhrase: 'diffuse firmness requires further investigation' },
    ],
  },
  {
    id: 'breast_palp_mass', section: 'palpation', sectionOrder: 2, cardNumber: 15,
    label: 'Palpable mass', question: 'Is a mass palpable?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No mass', documentationPhrase: 'no palpable mass' },
      { value: 'present', label: 'Mass present', documentationPhrase: 'palpable mass present', triggersCascade: 'mass' },
    ],
    documentationTemplate: 'Mass: {value}.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['present'],
      expandCardIds: ['breast_mass_site', 'breast_mass_quadrant', 'breast_mass_clock', 'breast_mass_distance', 'breast_mass_size', 'breast_mass_consistency', 'breast_mass_tenderness', 'breast_mass_mobility', 'breast_mass_margins', 'breast_mass_skin_attachment', 'breast_mass_muscle_attachment', 'breast_mass_chest_wall', 'breast_mass_number'],
    },
    evidenceLinks: [
      { supportsDisease: ['breast_cancer', 'fibroadenoma', 'fibrocystic_change', 'breast_abscess'], weight: 0.8, documentationPhrase: 'palpable mass requires characterization', mechanism: 'Focal tissue proliferation' },
    ],
  },
  {
    id: 'breast_mass_site', section: 'palpation', sectionOrder: 2, cardNumber: 16,
    label: 'Mass site', question: 'Which breast?',
    type: 'single_select',
    options: [
      { value: 'left', label: 'Left', documentationPhrase: 'left breast' },
      { value: 'right', label: 'Right', documentationPhrase: 'right breast' },
      { value: 'bilateral', label: 'Bilateral', documentationPhrase: 'both breasts' },
    ],
    documentationTemplate: 'Site: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['complete', 'cancer_context'] },
    evidenceLinks: [],
  },
  {
    id: 'breast_mass_quadrant', section: 'palpation', sectionOrder: 2, cardNumber: 17,
    label: 'Quadrant', question: 'Which quadrant?',
    type: 'single_select',
    options: [
      { value: 'upper_outer', label: 'Upper outer', documentationPhrase: 'upper outer quadrant' },
      { value: 'upper_inner', label: 'Upper inner', documentationPhrase: 'upper inner quadrant' },
      { value: 'lower_outer', label: 'Lower outer', documentationPhrase: 'lower outer quadrant' },
      { value: 'lower_inner', label: 'Lower inner', documentationPhrase: 'lower inner quadrant' },
      { value: 'central', label: 'Central/retro-areolar', documentationPhrase: 'central/retro-areolar region' },
      { value: 'axillary_tail', label: 'Axillary tail', documentationPhrase: 'axillary tail of Spence' },
    ],
    documentationTemplate: 'Quadrant: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { supportsDisease: ['breast_cancer'], weight: 0.2, documentationPhrase: 'upper outer quadrant is most common site for breast cancer', mechanism: 'Highest density of breast tissue' },
    ],
  },
  {
    id: 'breast_mass_clock', section: 'palpation', sectionOrder: 2, cardNumber: 18,
    label: 'Clock position', question: 'Clock face position',
    type: 'numeric',
    options: [],
    documentationTemplate: 'At {value} o\'clock position.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'breast_mass_distance', section: 'palpation', sectionOrder: 2, cardNumber: 19,
    label: 'Distance from nipple', question: 'Distance from nipple (cm)',
    type: 'numeric',
    options: [],
    documentationTemplate: '{value} cm from nipple.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'breast_mass_size', section: 'palpation', sectionOrder: 2, cardNumber: 20,
    label: 'Mass size', question: 'Maximum diameter (cm)',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Approximately {value} cm in maximum dimension.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'breast_mass_consistency', section: 'palpation', sectionOrder: 2, cardNumber: 21,
    label: 'Consistency', question: 'Mass consistency',
    type: 'single_select',
    options: [
      { value: 'soft', label: 'Soft', documentationPhrase: 'soft' },
      { value: 'firm', label: 'Firm', documentationPhrase: 'firm' },
      { value: 'hard', label: 'Hard', documentationPhrase: 'hard' },
      { value: 'cystic', label: 'Cystic', documentationPhrase: 'cystic' },
      { value: 'rubbery', label: 'Rubbery', documentationPhrase: 'rubbery' },
    ],
    documentationTemplate: '{value} consistency.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.6, documentationPhrase: 'hard consistency typical of malignancy', mechanism: 'Desmoplastic reaction' },
      { disease: 'fibroadenoma', supportsDisease: ['fibroadenoma'], weight: 0.5, documentationPhrase: 'rubbery consistency typical of fibroadenoma' },
      { supportsDisease: ['breast_cyst', 'fibrocystic_change'], weight: 0.4, documentationPhrase: 'cystic consistency suggests breast cyst' },
    ],
  },
  {
    id: 'breast_mass_tenderness', section: 'palpation', sectionOrder: 2, cardNumber: 22,
    label: 'Mass tenderness', question: 'Is the mass tender?',
    type: 'boolean',
    options: [
      { value: 'tender', label: 'Tender', documentationPhrase: 'tender to palpation' },
      { value: 'non_tender', label: 'Non-tender', documentationPhrase: 'non-tender' },
    ],
    documentationTemplate: 'Mass is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { supportsDisease: ['breast_abscess', 'mastitis'], weight: 0.7, documentationPhrase: 'tender mass suggests infection/inflammation' },
      { supportsDisease: ['breast_cancer'], weight: 0.2, documentationPhrase: 'breast cancer is typically non-tender' },
    ],
  },
  {
    id: 'breast_mass_mobility', section: 'palpation', sectionOrder: 2, cardNumber: 23,
    label: 'Mobility', question: 'Is the mass mobile?',
    type: 'single_select',
    options: [
      { value: 'mobile', label: 'Mobile', documentationPhrase: 'mobile' },
      { value: 'restricted', label: 'Restricted', documentationPhrase: 'restricted mobility' },
      { value: 'fixed', label: 'Fixed', documentationPhrase: 'fixed to surrounding tissue' },
    ],
    documentationTemplate: 'Mass is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.6, documentationPhrase: 'fixed mass suggests malignancy', mechanism: 'Local invasion' },
      { disease: 'fibroadenoma', supportsDisease: ['fibroadenoma'], weight: 0.5, documentationPhrase: 'mobile mass typical of benign lesion' },
    ],
  },
  {
    id: 'breast_mass_margins', section: 'palpation', sectionOrder: 2, cardNumber: 24,
    label: 'Margins', question: 'Margins of the mass',
    type: 'single_select',
    options: [
      { value: 'well_defined', label: 'Well-defined', documentationPhrase: 'well-defined margins' },
      { value: 'irregular', label: 'Irregular', documentationPhrase: 'irregular/spiculated margins' },
      { value: 'ill_defined', label: 'Ill-defined', documentationPhrase: 'ill-defined margins' },
      { value: 'smooth', label: 'Smooth', documentationPhrase: 'smooth margins' },
      { value: 'lobulated', label: 'Lobulated', documentationPhrase: 'lobulated margins' },
    ],
    documentationTemplate: 'Mass has {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.7, documentationPhrase: 'irregular/spiculated margins are classic for malignancy', mechanism: 'Invasive growth pattern' },
      { disease: 'fibroadenoma', supportsDisease: ['fibroadenoma'], weight: 0.5, documentationPhrase: 'well-defined smooth margins typical of benign lesion' },
    ],
  },
  {
    id: 'breast_mass_skin_attachment', section: 'palpation', sectionOrder: 2, cardNumber: 25,
    label: 'Skin attachment', question: 'Is the mass attached to skin?',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes', documentationPhrase: 'attached to overlying skin' },
      { value: 'no', label: 'No', documentationPhrase: 'not attached to skin' },
    ],
    documentationTemplate: 'Skin attachment: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.6, documentationPhrase: 'skin attachment suggests breast cancer with Cooper\'s ligament involvement', mechanism: 'Cooper\'s ligament invasion' },
    ],
  },
  {
    id: 'breast_mass_muscle_attachment', section: 'palpation', sectionOrder: 2, cardNumber: 26,
    label: 'Muscle attachment', question: 'Is the mass fixed to pectoralis muscle?',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes', documentationPhrase: 'fixed to pectoralis muscle' },
      { value: 'no', label: 'No', documentationPhrase: 'free from pectoralis muscle' },
    ],
    documentationTemplate: 'Pectoralis fixation: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.7, documentationPhrase: 'pectoralis fixation indicates advanced disease (T3/T4)', mechanism: 'Pectoralis fascia invasion' },
    ],
  },
  {
    id: 'breast_mass_chest_wall', section: 'palpation', sectionOrder: 2, cardNumber: 27,
    label: 'Chest wall fixation', question: 'Is the mass fixed to chest wall?',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes', documentationPhrase: 'fixed to chest wall' },
      { value: 'no', label: 'No', documentationPhrase: 'not fixed to chest wall' },
    ],
    documentationTemplate: 'Chest wall fixation: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.8, documentationPhrase: 'chest wall fixation indicates T4 disease', mechanism: 'Chest wall invasion' },
    ],
  },
  {
    id: 'breast_mass_number', section: 'palpation', sectionOrder: 2, cardNumber: 28,
    label: 'Number of masses', question: 'Number of masses',
    type: 'single_select',
    options: [
      { value: 'solitary', label: 'Solitary', documentationPhrase: 'solitary mass' },
      { value: 'multiple', label: 'Multiple', documentationPhrase: 'multiple masses' },
      { value: 'satellite_nodules', label: 'Satellite nodules', documentationPhrase: 'mass with satellite nodules' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.4, documentationPhrase: 'satellite nodules suggest cutaneous involvement (T4b)' },
    ],
  },

  // ── NIPPLE ──
  {
    id: 'breast_nipple_discharge', section: 'nipple', sectionOrder: 3, cardNumber: 29,
    label: 'Nipple discharge', question: 'Is there nipple discharge?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no nipple discharge' },
      { value: 'present', label: 'Present', documentationPhrase: 'nipple discharge present', triggersCascade: 'discharge' },
    ],
    documentationTemplate: 'Nipple discharge: {value}.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['present'],
      expandCardIds: ['breast_discharge_side', 'breast_discharge_ducts', 'breast_discharge_spontaneity', 'breast_discharge_color', 'breast_discharge_quantity'],
    },
    evidenceLinks: [
      { supportsDisease: ['duct_ectasia', 'intraductal_papilloma', 'breast_cancer', 'galactorrhea'], weight: 0.5, documentationPhrase: 'nipple discharge requires characterization' },
    ],
  },
  {
    id: 'breast_discharge_side', section: 'nipple', sectionOrder: 3, cardNumber: 30,
    label: 'Discharge side', question: 'Which side?',
    type: 'single_select',
    options: [
      { value: 'left', label: 'Left', documentationPhrase: 'left nipple' },
      { value: 'right', label: 'Right', documentationPhrase: 'right nipple' },
      { value: 'bilateral', label: 'Bilateral', documentationPhrase: 'bilateral' },
    ],
    documentationTemplate: 'Discharge from {value} nipple.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'breast_discharge_ducts', section: 'nipple', sectionOrder: 3, cardNumber: 31,
    label: 'Ducts involved', question: 'Single or multiple ducts?',
    type: 'single_select',
    options: [
      { value: 'single_duct', label: 'Single duct', documentationPhrase: 'single duct discharge' },
      { value: 'multiple_ducts', label: 'Multiple ducts', documentationPhrase: 'multiple duct discharge' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'intraductal_papilloma', supportsDisease: ['intraductal_papilloma'], weight: 0.6, documentationPhrase: 'single duct discharge suggests intraductal papilloma', investigation: 'Ductoscopy' },
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.3, documentationPhrase: 'single duct bloody discharge requires investigation' },
      { supportsDisease: ['duct_ectasia', 'fibrocystic_change'], weight: 0.4, documentationPhrase: 'multiple duct discharge more often benign' },
    ],
  },
  {
    id: 'breast_discharge_spontaneity', section: 'nipple', sectionOrder: 3, cardNumber: 32,
    label: 'Spontaneity', question: 'Is discharge spontaneous or expressed?',
    type: 'single_select',
    options: [
      { value: 'spontaneous', label: 'Spontaneous', documentationPhrase: 'spontaneous discharge' },
      { value: 'expressed', label: 'On expression', documentationPhrase: 'discharge only on expression' },
    ],
    documentationTemplate: 'Discharge is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.5, documentationPhrase: 'spontaneous discharge more concerning', mechanism: 'Ductal epithelial proliferation' },
    ],
  },
  {
    id: 'breast_discharge_color', section: 'nipple', sectionOrder: 3, cardNumber: 33,
    label: 'Discharge color', question: 'Color of discharge',
    type: 'single_select',
    options: [
      { value: 'milky', label: 'Milky', documentationPhrase: 'milky discharge' },
      { value: 'serous', label: 'Serous', documentationPhrase: 'serous/clear discharge' },
      { value: 'green', label: 'Green', documentationPhrase: 'green discharge' },
      { value: 'purulent', label: 'Purulent', documentationPhrase: 'purulent discharge' },
      { value: 'blood_stained', label: 'Blood-stained', documentationPhrase: 'blood-stained discharge' },
      { value: 'brown', label: 'Brown', documentationPhrase: 'brown discharge' },
      { value: 'black', label: 'Black', documentationPhrase: 'black discharge' },
      { value: 'clear', label: 'Clear/watery', documentationPhrase: 'clear watery discharge' },
    ],
    documentationTemplate: 'Discharge is {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.7, documentationPhrase: 'blood-stained discharge requires exclusion of malignancy', mechanism: 'Ductal epithelial disruption', investigation: 'Mammography, ultrasound, ductoscopy' },
      { disease: 'intraductal_papilloma', supportsDisease: ['intraductal_papilloma'], weight: 0.6, documentationPhrase: 'blood-stained discharge typical of papilloma', investigation: 'Ductography' },
      { supportsDisease: ['galactorrhea'], weight: 0.8, documentationPhrase: 'milky discharge suggests galactorrhea', mechanism: 'Hyperprolactinemia' },
      { supportsDisease: ['duct_ectasia'], weight: 0.5, documentationPhrase: 'green/brown discharge typical of duct ectasia' },
      { supportsDisease: ['mastitis', 'breast_abscess'], weight: 0.6, documentationPhrase: 'purulent discharge suggests infection' },
    ],
  },
  {
    id: 'breast_discharge_quantity', section: 'nipple', sectionOrder: 3, cardNumber: 34,
    label: 'Quantity', question: 'Quantity of discharge',
    type: 'single_select',
    options: [
      { value: 'scant', label: 'Scant', documentationPhrase: 'scant discharge' },
      { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate discharge' },
      { value: 'copious', label: 'Copious', documentationPhrase: 'copious discharge' },
    ],
    documentationTemplate: '{value} discharge.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'breast_discharge_odor', section: 'nipple', sectionOrder: 3, cardNumber: 35,
    label: 'Odor', question: 'Any odor?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no odor' },
      { value: 'foul', label: 'Foul smelling', documentationPhrase: 'foul odor' },
    ],
    documentationTemplate: 'Odor: {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { supportsDisease: ['breast_abscess', 'infected_cyst'], weight: 0.5, documentationPhrase: 'foul odor suggests infection' },
    ],
  },

  // ── AXILLARY ──
  {
    id: 'breast_axillary_inspection', section: 'axillary', sectionOrder: 4, cardNumber: 36,
    label: 'Axillary inspection', question: 'Axillary inspection findings',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'axillae normal' },
      { value: 'swelling', label: 'Swelling', documentationPhrase: 'axillary swelling present' },
      { value: 'scar', label: 'Scar', documentationPhrase: 'axillary scar present' },
      { value: 'drain', label: 'Drain', documentationPhrase: 'axillary drain in situ' },
      { value: 'fistula', label: 'Fistula', documentationPhrase: 'axillary fistula present' },
      { value: 'rash', label: 'Rash', documentationPhrase: 'axillary rash' },
    ],
    documentationTemplate: 'Axillary inspection: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['breast_cancer_with_lymph_node_metastasis'], weight: 0.4, documentationPhrase: 'axillary swelling may indicate nodal involvement' },
    ],
  },
  {
    id: 'breast_axillary_nodes', section: 'axillary', sectionOrder: 4, cardNumber: 37,
    label: 'Axillary lymph nodes', question: 'Are axillary lymph nodes palpable?',
    type: 'single_select',
    options: [
      { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'axillary lymph nodes not palpable' },
      { value: 'palpable', label: 'Palpable', documentationPhrase: 'axillary lymph nodes palpable', triggersCascade: 'lymph_node' },
    ],
    documentationTemplate: 'Axillary nodes: {value}.',
    contextVisibility: { alwaysShow: true },
    conditionalExpand: {
      triggerValues: ['palpable'],
      expandCardIds: ['breast_axillary_node_group', 'breast_axillary_node_number', 'breast_axillary_node_size', 'breast_axillary_node_consistency', 'breast_axillary_node_mobility'],
    },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer_with_lymph_node_metastasis'], weight: 0.7, documentationPhrase: 'palpable axillary nodes in breast cancer context suggests nodal metastasis', mechanism: 'Lymphatic metastasis', investigation: 'Axillary ultrasound, FNAC/sentinel node biopsy' },
      { supportsDisease: ['mastitis', 'breast_abscess', 'infection'], weight: 0.5, documentationPhrase: 'palpable reactive axillary nodes may be due to infection' },
    ],
  },
  {
    id: 'breast_axillary_node_group', section: 'axillary', sectionOrder: 4, cardNumber: 38,
    label: 'Node group', question: 'Which axillary node group is involved?',
    type: 'multi_select',
    options: [
      { value: 'anterior', label: 'Anterior (pectoral)', documentationPhrase: 'anterior (pectoral) group' },
      { value: 'posterior', label: 'Posterior (subscapular)', documentationPhrase: 'posterior (subscapular) group' },
      { value: 'central', label: 'Central', documentationPhrase: 'central group' },
      { value: 'lateral', label: 'Lateral', documentationPhrase: 'lateral group' },
      { value: 'apical', label: 'Apical', documentationPhrase: 'apical group' },
    ],
    documentationTemplate: 'Involving {value} axillary group.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer_with_lymph_node_metastasis'], weight: 0.4, documentationPhrase: 'central group most commonly involved' },
    ],
  },
  {
    id: 'breast_axillary_node_number', section: 'axillary', sectionOrder: 4, cardNumber: 39,
    label: 'Node number', question: 'Number of palpable nodes',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Approximately {value} palpable nodes.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'breast_axillary_node_size', section: 'axillary', sectionOrder: 4, cardNumber: 40,
    label: 'Node size', question: 'Size of largest node (cm)',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Largest node approximately {value} cm.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'breast_axillary_node_consistency', section: 'axillary', sectionOrder: 4, cardNumber: 41,
    label: 'Node consistency', question: 'Consistency of nodes',
    type: 'single_select',
    options: [
      { value: 'soft', label: 'Soft', documentationPhrase: 'soft' },
      { value: 'firm', label: 'Firm', documentationPhrase: 'firm' },
      { value: 'hard', label: 'Hard', documentationPhrase: 'hard' },
      { value: 'rubbery', label: 'Rubbery', documentationPhrase: 'rubbery' },
    ],
    documentationTemplate: 'Nodes are {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer_with_lymph_node_metastasis'], weight: 0.6, documentationPhrase: 'firm/hard nodes suggest metastatic involvement' },
      { supportsDisease: ['infection', 'reactive_lymphadenopathy'], weight: 0.4, documentationPhrase: 'soft/rubbery nodes suggest reactive change' },
    ],
  },
  {
    id: 'breast_axillary_node_mobility', section: 'axillary', sectionOrder: 4, cardNumber: 42,
    label: 'Node mobility', question: 'Mobility of nodes',
    type: 'single_select',
    options: [
      { value: 'mobile', label: 'Mobile', documentationPhrase: 'mobile' },
      { value: 'restricted', label: 'Restricted', documentationPhrase: 'restricted mobility' },
      { value: 'fixed', label: 'Fixed', documentationPhrase: 'fixed (matted)' },
    ],
    documentationTemplate: 'Nodes are {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer_with_lymph_node_metastasis'], weight: 0.7, documentationPhrase: 'fixed/matted nodes suggest advanced nodal disease (N2)', mechanism: 'Extracapsular extension' },
    ],
  },

  // ── SUPRACLAVICULAR ──
  {
    id: 'breast_supraclavicular_nodes', section: 'supraclavicular', sectionOrder: 5, cardNumber: 43,
    label: 'Supraclavicular nodes', question: 'Are supraclavicular nodes palpable?',
    type: 'single_select',
    options: [
      { value: 'not_examined', label: 'Not examined', documentationPhrase: 'supraclavicular region not examined' },
      { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'no supraclavicular lymphadenopathy' },
      { value: 'palpable', label: 'Palpable', documentationPhrase: 'supraclavicular nodes palpable', triggersCascade: 'lymph_node' },
    ],
    documentationTemplate: 'Supraclavicular nodes: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer_with_distant_metastasis'], weight: 0.8, documentationPhrase: 'supraclavicular nodes represent N3 disease', mechanism: 'Lymphatic metastasis beyond axilla' },
    ],
  },
  {
    id: 'breast_infraclavicular_nodes', section: 'supraclavicular', sectionOrder: 5, cardNumber: 44,
    label: 'Infraclavicular nodes', question: 'Are infraclavicular nodes palpable?',
    type: 'single_select',
    options: [
      { value: 'not_examined', label: 'Not examined', documentationPhrase: 'infraclavicular region not examined' },
      { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'no infraclavicular lymphadenopathy' },
      { value: 'palpable', label: 'Palpable', documentationPhrase: 'infraclavicular nodes palpable', triggersCascade: 'lymph_node' },
    ],
    documentationTemplate: 'Infraclavicular nodes: {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer_with_distant_metastasis'], weight: 0.8, documentationPhrase: 'infraclavicular nodes represent advanced disease' },
    ],
  },
  {
    id: 'breast_cervical_nodes', section: 'supraclavicular', sectionOrder: 5, cardNumber: 45,
    label: 'Cervical nodes', question: 'Are cervical nodes palpable?',
    type: 'single_select',
    options: [
      { value: 'not_examined', label: 'Not examined', documentationPhrase: 'cervical region not examined' },
      { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'no cervical lymphadenopathy' },
      { value: 'palpable', label: 'Palpable', documentationPhrase: 'cervical nodes palpable', triggersCascade: 'lymph_node' },
    ],
    documentationTemplate: 'Cervical nodes: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['cancer_context'] },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer_with_distant_metastasis'], weight: 0.7, documentationPhrase: 'cervical nodes suggest distant metastatic spread' },
    ],
  },

  // ── SPECIAL TESTS ──
  {
    id: 'breast_special_dimpling', section: 'special_tests', sectionOrder: 6, cardNumber: 46,
    label: 'Skin dimpling sign', question: 'Is the skin dimpling sign positive?',
    type: 'boolean',
    options: [
      { value: 'positive', label: 'Positive', documentationPhrase: 'skin dimpling sign positive' },
      { value: 'negative', label: 'Negative', documentationPhrase: 'skin dimpling sign negative' },
    ],
    documentationTemplate: 'Skin dimpling sign: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['complete', 'cancer_context'] },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.6, documentationPhrase: 'positive skin dimpling sign suggests Cooper\'s ligament tethering' },
    ],
  },
  {
    id: 'breast_special_pectoralis_contraction', section: 'special_tests', sectionOrder: 6, cardNumber: 47,
    label: 'Pectoralis contraction test', question: 'Does the mass become less mobile on pectoralis contraction?',
    type: 'boolean',
    options: [
      { value: 'positive', label: 'Positive (fixed)', documentationPhrase: 'mass fixed on pectoralis contraction' },
      { value: 'negative', label: 'Negative (mobile)', documentationPhrase: 'mass remains mobile on pectoralis contraction' },
    ],
    documentationTemplate: 'Pectoralis contraction test: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['complete', 'cancer_context'] },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.6, documentationPhrase: 'fixation on pectoralis contraction indicates pectoralis involvement' },
    ],
  },
  {
    id: 'breast_special_implant_check', section: 'special_tests', sectionOrder: 6, cardNumber: 48,
    label: 'Implant assessment', question: 'Any breast implant findings?',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'implant appears normal' },
      { value: 'rupture_suspected', label: 'Suspected rupture', documentationPhrase: 'clinical signs of implant rupture' },
      { value: 'capsular_contracture', label: 'Capsular contracture', documentationPhrase: 'capsular contracture present' },
      { value: 'implant_malposition', label: 'Malposition', documentationPhrase: 'implant malposition' },
      { value: 'animation_deformity', label: 'Animation deformity', documentationPhrase: 'animation deformity on pectoralis contraction' },
    ],
    documentationTemplate: 'Implant findings: {value}.',
    contextVisibility: { alwaysShow: false, showForContext: ['implant'] },
    evidenceLinks: [],
  },

  // ── CANCER CONTEXT ──
  {
    id: 'breast_cancer_skin_changes', section: 'cancer', sectionOrder: 7, cardNumber: 49,
    label: 'Cancer skin changes', question: 'Additional skin changes in cancer context',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'no additional skin changes' },
      { value: 'peau_d_orange_extensive', label: 'Extensive peau d\'orange', documentationPhrase: 'extensive peau d\'orange' },
      { value: 'satellite_nodules', label: 'Satellite nodules', documentationPhrase: 'satellite skin nodules' },
      { value: 'ulceration', label: 'Tumour ulceration', documentationPhrase: 'tumour ulceration' },
      { value: 'erythema', label: 'Erythema', documentationPhrase: 'inflammatory erythema' },
    ],
    documentationTemplate: 'Cancer skin changes: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['cancer_context'] },
    evidenceLinks: [
      { disease: 'breast_cancer', supportsDisease: ['breast_cancer'], weight: 0.8, documentationPhrase: 'satellite nodules indicate cutaneous involvement (T4b)' },
    ],
  },
  {
    id: 'breast_cancer_nipple_changes', section: 'cancer', sectionOrder: 7, cardNumber: 50,
    label: 'Cancer nipple changes', question: 'Nipple changes in cancer context',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'nipple normal' },
      { value: 'retraction', label: 'Retraction', documentationPhrase: 'nipple retraction' },
      { value: 'inversion', label: 'Inversion', documentationPhrase: 'nipple inversion' },
      { value: 'paget_disease', label: 'Paget\'s disease', documentationPhrase: 'Paget\'s disease of nipple' },
      { value: 'ulceration', label: 'Ulceration', documentationPhrase: 'nipple ulceration' },
    ],
    documentationTemplate: 'Nipple changes: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['cancer_context'] },
    evidenceLinks: [
      { disease: 'paget_disease', supportsDisease: ['paget_disease', 'breast_cancer'], weight: 0.9, documentationPhrase: 'Paget\'s disease is associated with underlying DCIS/invasive cancer', investigation: 'Nipple biopsy, mammography' },
    ],
  },
  {
    id: 'breast_cancer_contralateral', section: 'cancer', sectionOrder: 7, cardNumber: 51,
    label: 'Contralateral breast', question: 'Contralateral breast examination',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'contralateral breast normal' },
      { value: 'abnormal', label: 'Abnormal', documentationPhrase: 'contralateral breast abnormal requiring further assessment' },
    ],
    documentationTemplate: 'Contralateral breast: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['cancer_context'] },
    evidenceLinks: [
      { supportsDisease: ['bilateral_breast_cancer'], weight: 0.5, documentationPhrase: 'routine contralateral examination essential' },
    ],
  },
  {
    id: 'breast_cancer_previous_scars', section: 'cancer', sectionOrder: 7, cardNumber: 52,
    label: 'Previous scar assessment', question: 'Assessment of previous surgical/biopsy scars',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal healing', documentationPhrase: 'scars well healed' },
      { value: 'hypertrophic', label: 'Hypertrophic scar', documentationPhrase: 'hypertrophic scarring' },
      { value: 'keloid', label: 'Keloid', documentationPhrase: 'keloid formation' },
      { value: 'recurrence_suspected', label: 'Suspected recurrence', documentationPhrase: 'suspected local recurrence at scar site' },
      { value: 'infection', label: 'Infected', documentationPhrase: 'scar infection/cellulitis' },
    ],
    documentationTemplate: 'Previous scars: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['cancer_context', 'postoperative'] },
    evidenceLinks: [
      { disease: 'breast_cancer_recurrence', supportsDisease: ['breast_cancer_recurrence'], weight: 0.7, documentationPhrase: 'suspected local recurrence requires biopsy' },
    ],
  },

  // ── BREASTFEEDING CONTEXT ──
  {
    id: 'breast_lactation_milk_production', section: 'breastfeeding', sectionOrder: 8, cardNumber: 53,
    label: 'Milk production', question: 'Adequate milk production?',
    type: 'single_select',
    options: [
      { value: 'adequate', label: 'Adequate', documentationPhrase: 'milk production adequate' },
      { value: 'reduced', label: 'Reduced', documentationPhrase: 'reduced milk production' },
      { value: 'excessive', label: 'Excessive', documentationPhrase: 'excessive milk production' },
    ],
    documentationTemplate: 'Milk production: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['lactating'] },
    evidenceLinks: [],
  },
  {
    id: 'breast_lactation_latch', section: 'breastfeeding', sectionOrder: 8, cardNumber: 54,
    label: 'Infant latch', question: 'Infant latching assessment?',
    type: 'single_select',
    options: [
      { value: 'adequate', label: 'Adequate', documentationPhrase: 'infant latching well' },
      { value: 'poor', label: 'Poor', documentationPhrase: 'poor infant latch' },
      { value: 'painful', label: 'Painful', documentationPhrase: 'painful latching' },
    ],
    documentationTemplate: 'Infant latch: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['lactating'] },
    evidenceLinks: [],
  },
  {
    id: 'breast_lactation_nipple_trauma', section: 'breastfeeding', sectionOrder: 8, cardNumber: 55,
    label: 'Nipple trauma', question: 'Any nipple trauma/fissures from breastfeeding?',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no nipple trauma' },
      { value: 'fissure', label: 'Cracked/fissured', documentationPhrase: 'nipple fissure present' },
      { value: 'bleeding', label: 'Bleeding', documentationPhrase: 'nipple bleeding' },
      { value: 'blister', label: 'Blisters', documentationPhrase: 'nipple blisters' },
    ],
    documentationTemplate: 'Nipple trauma: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['lactating'] },
    evidenceLinks: [
      { supportsDisease: ['mastitis', 'breast_abscess'], weight: 0.4, documentationPhrase: 'nipple fissures predispose to mastitis', mechanism: 'Skin barrier disruption' },
    ],
  },
  {
    id: 'breast_lactation_engorgement', section: 'breastfeeding', sectionOrder: 8, cardNumber: 56,
    label: 'Engorgement', question: 'Breast engorgement?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no engorgement' },
      { value: 'mild', label: 'Mild', documentationPhrase: 'mild engorgement' },
      { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate engorgement' },
      { value: 'severe', label: 'Severe', documentationPhrase: 'severe engorgement' },
    ],
    documentationTemplate: 'Engorgement: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['lactating'] },
    evidenceLinks: [
      { supportsDisease: ['engorgement', 'mastitis'], weight: 0.5, documentationPhrase: 'engorgement can precede mastitis' },
    ],
  },
  {
    id: 'breast_lactation_blocked_duct', section: 'breastfeeding', sectionOrder: 8, cardNumber: 57,
    label: 'Blocked duct', question: 'Evidence of blocked duct?',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes', documentationPhrase: 'blocked duct identified' },
      { value: 'no', label: 'No', documentationPhrase: 'no blocked duct' },
    ],
    documentationTemplate: 'Blocked duct: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['lactating'] },
    evidenceLinks: [
      { supportsDisease: ['blocked_duct', 'mastitis'], weight: 0.6, documentationPhrase: 'blocked duct risk factor for mastitis' },
    ],
  },
  {
    id: 'breast_lactation_abscess', section: 'breastfeeding', sectionOrder: 8, cardNumber: 58,
    label: 'Breast abscess', question: 'Evidence of breast abscess?',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes', documentationPhrase: 'breast abscess identified', triggersCascade: 'abscess' },
      { value: 'no', label: 'No', documentationPhrase: 'no breast abscess' },
    ],
    documentationTemplate: 'Breast abscess: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['lactating', 'emergency'] },
    evidenceLinks: [
      { disease: 'breast_abscess', supportsDisease: ['breast_abscess'], weight: 0.8, documentationPhrase: 'abscess requires drainage', mechanism: 'Suppurative mastitis', investigation: 'Ultrasound breast' },
    ],
  },

  // ── MALE BREAST ──
  {
    id: 'breast_male_gynaecomastia', section: 'male_breast', sectionOrder: 9, cardNumber: 59,
    label: 'Gynaecomastia type', question: 'Type of gynaecomastia',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'None', documentationPhrase: 'no gynaecomastia' },
      { value: 'concentric', label: 'Concentric firm disc', documentationPhrase: 'concentric firm subareolar disc' },
      { value: 'diffuse', label: 'Diffuse fatty', documentationPhrase: 'diffuse fatty enlargement (pseudogynaecomastia)' },
      { value: 'nodular', label: 'Nodular', documentationPhrase: 'nodular gynaecomastia' },
      { value: 'asymmetric', label: 'Asymmetric', documentationPhrase: 'asymmetric glandular enlargement' },
    ],
    documentationTemplate: 'Gynaecomastia: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['male'] },
    evidenceLinks: [
      { supportsDisease: ['gynecomastia', 'male_breast_cancer'], weight: 0.3, documentationPhrase: 'concentric disc suggests benign gynaecomastia', mechanism: 'Hormonal stimulation' },
      { disease: 'male_breast_cancer', supportsDisease: ['male_breast_cancer'], weight: 0.6, documentationPhrase: 'asymmetric/nodular enlargement raises concern for male breast cancer' },
    ],
  },
  {
    id: 'breast_male_mass', section: 'male_breast', sectionOrder: 9, cardNumber: 60,
    label: 'Male breast mass', question: 'Any discrete mass in male breast?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'No mass', documentationPhrase: 'no discrete mass' },
      { value: 'central', label: 'Central subareolar', documentationPhrase: 'central subareolar mass', triggersCascade: 'mass' },
      { value: 'eccentric', label: 'Eccentric', documentationPhrase: 'eccentric mass', triggersCascade: 'mass' },
    ],
    documentationTemplate: 'Male breast mass: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['male'] },
    evidenceLinks: [
      { disease: 'male_breast_cancer', supportsDisease: ['male_breast_cancer'], weight: 0.7, documentationPhrase: 'eccentric mass more concerning for male breast cancer', mechanism: 'Malignant transformation of breast tissue' },
    ],
  },
  {
    id: 'breast_male_nipple_changes', section: 'male_breast', sectionOrder: 9, cardNumber: 61,
    label: 'Male nipple changes', question: 'Nipple changes in male patient',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'nipples normal' },
      { value: 'retraction', label: 'Retraction', documentationPhrase: 'nipple retraction' },
      { value: 'ulceration', label: 'Ulceration', documentationPhrase: 'nipple ulceration' },
      { value: 'discharge', label: 'Discharge', documentationPhrase: 'nipple discharge' },
    ],
    documentationTemplate: 'Male nipple: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['male'] },
    evidenceLinks: [
      { disease: 'male_breast_cancer', supportsDisease: ['male_breast_cancer'], weight: 0.7, documentationPhrase: 'nipple changes in male require urgent investigation' },
    ],
  },
  {
    id: 'breast_male_skin_changes', section: 'male_breast', sectionOrder: 9, cardNumber: 62,
    label: 'Male skin changes', question: 'Skin changes in male breast',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'skin normal' },
      { value: 'ulceration', label: 'Ulceration', documentationPhrase: 'skin ulceration' },
      { value: 'peau_d_orange', label: 'Peau d\'orange', documentationPhrase: 'peau d\'orange' },
      { value: 'erythema', label: 'Erythema', documentationPhrase: 'erythema' },
    ],
    documentationTemplate: 'Male skin changes: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['male'] },
    evidenceLinks: [
      { disease: 'male_breast_cancer', supportsDisease: ['male_breast_cancer'], weight: 0.8, documentationPhrase: 'skin changes in male breast suggest advanced disease' },
    ],
  },

  // ── POSTOPERATIVE ──
  {
    id: 'breast_postop_seroma', section: 'postoperative', sectionOrder: 10, cardNumber: 63,
    label: 'Seroma', question: 'Any seroma?',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes', documentationPhrase: 'clinical evidence of seroma' },
      { value: 'no', label: 'No', documentationPhrase: 'no seroma' },
    ],
    documentationTemplate: 'Seroma: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['postoperative'] },
    evidenceLinks: [],
  },
  {
    id: 'breast_postop_haematoma', section: 'postoperative', sectionOrder: 10, cardNumber: 64,
    label: 'Haematoma', question: 'Any haematoma?',
    type: 'boolean',
    options: [
      { value: 'yes', label: 'Yes', documentationPhrase: 'clinical evidence of haematoma' },
      { value: 'no', label: 'No', documentationPhrase: 'no haematoma' },
    ],
    documentationTemplate: 'Haematoma: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['postoperative'] },
    evidenceLinks: [],
  },
  {
    id: 'breast_postop_flap_viability', section: 'postoperative', sectionOrder: 10, cardNumber: 65,
    label: 'Flap viability', question: 'Flap viability assessment',
    type: 'single_select',
    options: [
      { value: 'viable', label: 'Viable', documentationPhrase: 'flap appears viable' },
      { value: 'congested', label: 'Congested', documentationPhrase: 'flap congestion (venous)' },
      { value: 'ischaemic', label: 'Ischaemic', documentationPhrase: 'flap ischaemia' },
      { value: 'necrotic', label: 'Necrotic', documentationPhrase: 'flap necrosis' },
    ],
    documentationTemplate: 'Flap viability: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['postoperative'] },
    evidenceLinks: [],
  },
  {
    id: 'breast_postop_lymphedema', section: 'postoperative', sectionOrder: 10, cardNumber: 66,
    label: 'Lymphoedema', question: 'Any upper limb lymphoedema?',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no lymphoedema' },
      { value: 'mild', label: 'Mild', documentationPhrase: 'mild lymphoedema' },
      { value: 'moderate', label: 'Moderate', documentationPhrase: 'moderate lymphoedema' },
      { value: 'severe', label: 'Severe', documentationPhrase: 'severe lymphoedema' },
    ],
    documentationTemplate: 'Lymphoedema: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['postoperative'] },
    evidenceLinks: [
      { supportsDisease: ['lymphoedema'], weight: 0.7, documentationPhrase: 'lymphoedema after axillary surgery', mechanism: 'Lymphatic disruption' },
    ],
  },
  {
    id: 'breast_postop_drains', section: 'postoperative', sectionOrder: 10, cardNumber: 67,
    label: 'Drains', question: 'Drain assessment',
    type: 'text',
    options: [],
    documentationTemplate: 'Drains: {value}.',
    contextVisibility: { alwaysShow: false, showForMode: ['postoperative'] },
    evidenceLinks: [],
  },
];

// ─────────────────────────────────────────────────────────────────
// EXPANDED CARD ID RESOLVER
// ─────────────────────────────────────────────────────────────────

export function getBreastExpandedCardIds(
  findings: Record<string, unknown>,
): string[] {
  const expanded: string[] = [];
  for (const card of BREAST_CARDS) {
    if (!card.conditionalExpand) continue;
    const val = findings[card.id];
    if (val != null && card.conditionalExpand.triggerValues.includes(String(val))) {
      expanded.push(...card.conditionalExpand.expandCardIds);
    }
  }
  return [...new Set(expanded)];
}

// ─────────────────────────────────────────────────────────────────
// VISIBILITY FILTER
// ─────────────────────────────────────────────────────────────────

export function filterBreastCards(
  mode: BreastExamMode,
  ctx: BreastContext,
  findings: Record<string, unknown>,
): BreastCardDef[] {
  const expandedIds = getBreastExpandedCardIds(findings);
  return BREAST_CARDS.filter(card => {
    const v = card.contextVisibility;
    if (v.alwaysShow) return true;

    if (v.showForMode && v.showForMode.length > 0) {
      if (!v.showForMode.includes(mode)) return false;
    } else if (v.hideForMode && v.hideForMode.length > 0) {
      if (v.hideForMode.includes(mode)) return false;
    }

    if (v.showForAgeBands && v.showForAgeBands.length > 0) {
      if (!v.showForAgeBands.includes(ctx.ageBand)) return false;
    }
    if (v.hideForAgeBands && v.hideForAgeBands.length > 0) {
      if (v.hideForAgeBands.includes(ctx.ageBand)) return false;
    }
    if (v.showForSex && v.showForSex.length > 0) {
      if (!v.showForSex.includes(ctx.sex)) return false;
    }
    if (v.showForPregnancy && !ctx.pregnant) return false;
    if (v.showForLactation && !ctx.lactating) return false;

    if (v.showForContext && v.showForContext.length > 0) {
      if (v.showForContext.includes('implant') && !ctx.implantHistory) return false;
    }

    if (card.conditionalExpand) {
      return expandedIds.includes(card.id);
    }

    if (card.id.startsWith('breast_mass_') && card.id !== 'breast_palp_mass') {
      return expandedIds.includes(card.id);
    }

    if (card.id.startsWith('breast_discharge_')) {
      return expandedIds.includes(card.id);
    }

    if (card.id.startsWith('breast_axillary_node_') && card.id !== 'breast_axillary_nodes') {
      return expandedIds.includes(card.id);
    }

    if (
      mode === 'screening'
      && !v.screeningMode
      && !v.alwaysShow
    ) {
      return ['breast_insp_symmetry', 'breast_insp_skin', 'breast_insp_nipple',
        'breast_palp_tenderness', 'breast_palp_mass', 'breast_nipple_discharge',
        'breast_axillary_nodes', 'breast_supraclavicular_nodes',
      ].includes(card.id);
    }

    if (['neonate', 'infant', 'toddler', 'child'].includes(ctx.ageBand) && ctx.sex === 'male') {
      if (card.section === 'breastfeeding' || card.section === 'postoperative') return false;
    }

    return true;
  });
}

// ─────────────────────────────────────────────────────────────────
// SCREENING SUMMARY (used for screening mode)
// ─────────────────────────────────────────────────────────────────

const SCREENING_CARD_IDS = [
  'breast_insp_symmetry', 'breast_insp_skin', 'breast_insp_nipple',
  'breast_palp_tenderness', 'breast_palp_mass', 'breast_nipple_discharge',
  'breast_axillary_nodes', 'breast_supraclavicular_nodes',
];

export function getBreastScreeningCards(): BreastCardDef[] {
  return BREAST_CARDS.filter(c => SCREENING_CARD_IDS.includes(c.id));
}

// ─────────────────────────────────────────────────────────────────
// NARRATIVE GENERATOR
// ─────────────────────────────────────────────────────────────────

function findingsRecord(findings: Record<string, unknown>): Record<string, string> {
  const r: Record<string, string> = {};
  for (const [k, v] of Object.entries(findings)) {
    if (v != null && v !== '' && v !== false) {
      r[k] = String(v);
    }
  }
  return r;
}

function hasAbnormalFindings(cards: BreastCardDef[], findings: Record<string, unknown>): boolean {
  for (const card of cards) {
    const v = findings[card.id];
    if (v == null || v === '' || v === false) continue;
    if (card.id === 'breast_insp_symmetry' && v === 'normal') continue;
    if (card.id === 'breast_insp_skin' && Array.isArray(v) && v.length === 1 && v[0] === 'normal') continue;
    if (card.id === 'breast_insp_nipple' && v === 'normal') continue;
    if (card.id === 'breast_palp_tenderness' && v === 'none') continue;
    if (card.id === 'breast_palp_consistency' && v === 'normal') continue;
    if (card.id === 'breast_nipple_discharge' && v === 'none') continue;
    if (card.id === 'breast_axillary_nodes' && v === 'not_palpable') continue;
    if (card.id === 'breast_supraclavicular_nodes' && (v === 'not_palpable' || v === 'not_examined')) continue;
    return true;
  }
  return false;
}

export function generateBreastNarrative(
  cards: BreastCardDef[],
  findings: Record<string, unknown>,
  mode: BreastExamMode,
): string {
  const rec = findingsRecord(findings);
  if (Object.keys(rec).length === 0) return '';
  const isAbnormal = hasAbnormalFindings(cards, findings);

  if (mode === 'screening' && !isAbnormal) {
    return 'The breasts are symmetrical with no visible skin changes, masses or nipple abnormalities. On palpation, both breasts are soft with no focal tenderness or palpable masses. No nipple discharge is present. Axillary and supraclavicular lymph nodes are not enlarged.';
  }

  if (mode === 'cancer_context' && isAbnormal) {
    return generateCancerNarrative(rec);
  }

  if (mode === 'male' && isAbnormal) {
    return generateMaleNarrative(rec);
  }

  if (mode === 'lactating' && isAbnormal) {
    return generateLactationNarrative(rec);
  }

  const parts: string[] = [];
  for (const section of ['inspection', 'palpation', 'nipple', 'axillary', 'supraclavicular'] as BreastSection[]) {
    const sectionCards = cards.filter(c => c.section === section);
    const sectionParts: string[] = [];
    for (const card of sectionCards) {
      const val = rec[card.id];
      if (!val) continue;
      const template = card.documentationTemplate.replace('{value}', val);
      const phrases = card.options.filter(o => val.includes(o.value)).map(o => o.documentationPhrase);
      const phrase = phrases.length > 0 ? phrases.join(', ') : template;
      sectionParts.push(phrase);
    }
    if (sectionParts.length > 0) {
      parts.push(sectionParts.join('. '));
    }
  }

  if (parts.length === 0) return 'Breast examination completed. No significant findings noted.';
  return parts.join('. ');
}

function generateCancerNarrative(rec: Record<string, string>): string {
  const parts: string[] = [];
  const site = rec['breast_mass_site'] ? (rec['breast_mass_site'] === 'left' ? 'left' : 'right') : 'the';
  const quadrant = rec['breast_mass_quadrant'];
  const size = rec['breast_mass_size'];
  const consistency = rec['breast_mass_consistency'];
  const margins = rec['breast_mass_margins'];
  const mobility = rec['breast_mass_mobility'];
  const skin = rec['breast_insp_skin'];
  const nipple = rec['breast_insp_nipple'];
  const axillary = rec['breast_axillary_nodes'];

  const findings: string[] = [];
  if (skin && !skin.includes('normal')) {
    const skinPhrases: string[] = [];
    for (const s of skin.split(',')) {
      if (s === 'peau_d_orange') skinPhrases.push('peau d\'orange');
      else if (s === 'dimpling') skinPhrases.push('skin dimpling');
      else skinPhrases.push(s.replace(/_/g, ' '));
    }
    findings.push(`overlying skin shows ${skinPhrases.join(', ')}`);
  }
  if (nipple && nipple !== 'normal') {
    findings.push(`the ${site} nipple is ${nipple.replace(/_/g, ' ')}`);
  }

  let massDesc = '';
  if (size) massDesc += `measuring approximately ${size} cm`;
  if (consistency) massDesc += massDesc ? `, ${consistency}` : `${consistency}`;
  if (margins) massDesc += massDesc ? ` with ${margins} margins` : `${margins} margins`;
  if (mobility) massDesc += massDesc ? `, ${mobility}` : `${mobility}`;

  const location = quadrant ? BREAST_TERMS[quadrant] || quadrant.replace(/_/g, ' ') : '';

  parts.push(`Inspection reveals ${location ? `a distortion of the ${location} of the ${site} breast` : `changes in the ${site} breast`}`);

  if (findings.length > 0) {
    parts.push(`with ${findings.join(' and ')}`);
  }

  if (massDesc) {
    parts.push(`. A firm irregular mass ${massDesc} is palpable in the ${location || site} breast.`);
  }

  if (axillary && axillary !== 'not_palpable') {
    parts.push(' Multiple firm ipsilateral axillary lymph nodes are palpable.');
  }

  const result = parts.join('');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function generateMaleNarrative(rec: Record<string, string>): string {
  const gynae = rec['breast_male_gynaecomastia'];
  const mass = rec['breast_male_mass'];
  const nipple = rec['breast_male_nipple_changes'];

  if (gynae && gynae !== 'absent') {
    let desc = 'Bilateral symmetrical enlargement of the male breast tissue is noted beneath the areolae.';
    if (gynae === 'concentric') desc += ' Palpation demonstrates a firm concentric disc of glandular tissue without discrete masses or skin changes.';
    else if (gynae === 'diffuse') desc += ' Palpation demonstrates diffuse fatty enlargement.';
    else if (gynae === 'nodular') desc += ' Palpation demonstrates nodular glandular tissue.';
    if (!nipple || nipple === 'normal') desc += ' No nipple discharge or axillary lymphadenopathy is present.';
    return desc;
  }

  if (mass && mass !== 'none') {
    let desc = 'A discrete mass is palpable in the male breast.';
    if (mass === 'eccentric') desc += ' The mass is eccentric to the nipple, raising concern for male breast carcinoma.';
    return desc;
  }

  return 'Male breast examination completed.';
}

function generateLactationNarrative(rec: Record<string, string>): string {
  const engorgement = rec['breast_lactation_engorgement'];
  const blockedDuct = rec['breast_lactation_blocked_duct'];
  const abscess = rec['breast_lactation_abscess'];
  const nippleTrauma = rec['breast_lactation_nipple_trauma'];

  if (abscess === 'yes') {
    return 'A breast abscess is identified in the lactating patient requiring further assessment and drainage.';
  }

  if (blockedDuct === 'yes') {
    return 'A blocked duct is identified. The breast is engorged and tender in a localized area without signs of systemic infection.';
  }

  if (engorgement && engorgement !== 'none') {
    return `The breasts are ${engorgement}ly engorged consistent with physiological engorgement. No focal masses or abscess identified.`;
  }

  return 'Lactation assessment completed.';
}

// ─────────────────────────────────────────────────────────────────
// EVIDENCE GRAPH BUILDER
// ─────────────────────────────────────────────────────────────────

const BREAST_INVESTIGATION_MAP: Record<string, string[]> = {
  breast_cancer: ['Mammography', 'Breast ultrasound', 'Core needle biopsy', 'MRI breast', 'Estrogen/progesterone receptor status', 'HER2 testing', 'Ki-67'],
  invasive_ductal: ['Mammography', 'Breast ultrasound', 'Core needle biopsy', 'IHC', 'Sentinel node biopsy'],
  invasive_lobular: ['Mammography (may be occult)', 'MRI breast', 'Core biopsy', 'IHC (E-cadherin loss)'],
  paget_disease: ['Mammography', 'Nipple biopsy', 'MRI breast', 'Breast ultrasound'],
  inflammatory_breast_cancer: ['Mammography', 'Breast ultrasound', 'Core biopsy (skin and breast)', 'MRI breast', 'PET-CT'],
  dcis: ['Mammography (microcalcifications)', 'Core biopsy with microcalcifications', 'MRI breast'],
  fibroadenoma: ['Breast ultrasound', 'Core biopsy/FNAC', 'Mammography'],
  fibrocystic_change: ['Breast ultrasound', 'Mammography', 'FNAC/core biopsy'],
  mastitis: ['Breast ultrasound', 'CBC', 'CRP', 'Milk culture (if lactating)', 'Blood cultures (if febrile)'],
  breast_abscess: ['Breast ultrasound', 'CBC', 'CRP', 'Culture of pus'],
  breast_cyst: ['Breast ultrasound', 'FNAC/aspiration'],
  duct_ectasia: ['Mammography', 'Breast ultrasound', 'Ductography'],
  intraductal_papilloma: ['Ductography', 'Breast ultrasound', 'MRI breast', 'Ductoscopy'],
  galactorrhea: ['Serum prolactin', 'TFT', 'MRI pituitary (if prolactin elevated)'],
  gynecomastia: ['Breast ultrasound', 'LFT', 'TFT', 'Serum testosterone, estradiol', 'Beta-hCG', 'Prolactin'],
  male_breast_cancer: ['Mammography', 'Breast ultrasound', 'Core biopsy', 'Staging CT'],
  lymphoedema: ['Clinical diagnosis', 'Lymphoscintigraphy', 'Arm circumference measurement'],
  breast_cancer_recurrence: ['Biopsy of lesion', 'Mammography', 'MRI breast', 'PET-CT', 'Staging investigations'],
};

export function buildBreastEvidenceGraph(
  findings: Record<string, unknown>,
  activeCards: BreastCardDef[],
): BreastEvidenceGraphNode[] {
  const nodes: BreastEvidenceGraphNode[] = [];
  const rec = findingsRecord(findings);
  const triggeredDiseases = new Set<string>();

  for (const card of activeCards) {
    const val = rec[card.id];
    if (!val) continue;

    const mechanisms = new Set<string>();
    const phenotypes = new Set<string>();
    const diseases = new Set<string>();
    const investigations = new Set<string>();
    const architecture = new Set<string>();

    for (const link of card.evidenceLinks) {
      if (link.mechanism) mechanisms.add(link.mechanism);
      if (link.phenotype) phenotypes.add(link.phenotype);
      if (link.disease) diseases.add(link.disease);
      for (const d of link.supportsDisease) diseases.add(d);
      if (link.investigation) investigations.add(link.investigation);
    }

    for (const d of diseases) {
      triggeredDiseases.add(d.toLowerCase());
    }

    const idx = card.section;
    const archMap: Record<string, string[]> = {
      nipple: ['Nipple-areolar complex', 'Lactiferous ducts'],
      inspection: ['Skin', 'Subcutaneous tissue'],
      palpation: ['Breast parenchyma', 'Ducts', 'Lobules', 'Fat', 'Fascia'],
      axillary: ['Axillary lymph nodes', 'Lymphatic channels'],
      supraclavicular: ['Supraclavicular lymph nodes', 'Cervical lymphatics'],
      cancer: ['Skin', 'Ducts', 'Fascia', 'Chest wall'],
    };
    if (archMap[idx]) {
      for (const a of archMap[idx]) architecture.add(a);
    }

    if (card.id === 'breast_insp_skin') {
      if (typeof val === 'string') {
        const vals = val.split(',');
        for (const v of vals) {
          const t = v.trim();
          if (t === 'peau_d_orange') {
            mechanisms.add('Dermal lymphatic invasion (tumour emboli)');
            mechanisms.add('Lymphatic obstruction');
            phenotypes.add('Peau d\'orange (orange peel skin)');
            diseases.add('inflammatory_breast_cancer');
            investigations.add('Core biopsy including skin');
          }
          if (t === 'ulceration') {
            mechanisms.add('Tumour erosion through skin');
            phenotypes.add('Malignant ulceration');
            diseases.add('breast_cancer');
            investigations.add('Punch biopsy of ulcer edge');
          }
          if (t === 'dimpling') {
            mechanisms.add('Cooper\'s ligament invasion');
            phenotypes.add('Skin dimpling/tethering');
            diseases.add('breast_cancer');
          }
          if (t === 'erythema') {
            mechanisms.add('Inflammatory response');
            phenotypes.add('Erythema');
            diseases.add('mastitis').add('inflammatory_breast_cancer');
          }
        }
      }
    }

    if (card.id === 'breast_palp_mass' && val === 'present') {
      mechanisms.add('Focal tissue proliferation');
      phenotypes.add('Palpable mass');
    }

    if (card.id === 'breast_nipple_discharge' && val === 'present') {
      mechanisms.add('Ductal epithelial proliferation');
      mechanisms.add('Ductal obstruction');
      phenotypes.add('Nipple discharge');
    }

    if (card.id === 'breast_mass_consistency' && val === 'hard') {
      mechanisms.add('Desmoplastic reaction');
      mechanisms.add('Stromal fibrosis');
      phenotypes.add('Hard consistency');
      diseases.add('breast_cancer');
    }

    if (card.id === 'breast_mass_margins' && val === 'irregular') {
      mechanisms.add('Invasive growth pattern');
      mechanisms.add('Tumour infiltration');
      phenotypes.add('Irregular/spiculated margins');
      diseases.add('breast_cancer');
    }

    if (card.id === 'breast_mass_mobility' && val === 'fixed') {
      mechanisms.add('Local invasion');
      phenotypes.add('Fixed mass');
      diseases.add('breast_cancer');
    }

    if (card.id === 'breast_mass_skin_attachment' && val === 'yes') {
      mechanisms.add('Cooper\'s ligament invasion');
      phenotypes.add('Skin tethering');
      diseases.add('breast_cancer');
    }

    if (card.id === 'breast_mass_muscle_attachment' && val === 'yes') {
      mechanisms.add('Pectoralis fascia invasion');
      phenotypes.add('Pectoralis fixation');
      diseases.add('breast_cancer');
    }

    if (card.id === 'breast_mass_chest_wall' && val === 'yes') {
      mechanisms.add('Chest wall invasion');
      phenotypes.add('Chest wall fixation');
      diseases.add('breast_cancer');
    }

    if (card.id === 'breast_axillary_nodes' && val === 'palpable') {
      mechanisms.add('Lymphatic metastasis');
      mechanisms.add('Reactive hyperplasia');
      phenotypes.add('Palpable axillary lymphadenopathy');
      investigations.add('Axillary ultrasound');
      investigations.add('FNAC/core biopsy of nodes');
    }

    if (card.id === 'breast_axillary_node_mobility' && val === 'fixed') {
      mechanisms.add('Extracapsular extension');
      phenotypes.add('Fixed/matted axillary nodes');
      diseases.add('breast_cancer');
    }

    if (card.id === 'breast_supraclavicular_nodes' && val === 'palpable') {
      mechanisms.add('Lymphatic metastasis beyond axilla');
      phenotypes.add('Supraclavicular lymphadenopathy');
      diseases.add('breast_cancer_with_distant_metastasis');
      investigations.add('FNAC/core biopsy');
      investigations.add('Staging CT');
    }

    if (card.id === 'breast_discharge_color' && val === 'blood_stained') {
      mechanisms.add('Ductal epithelial disruption');
      mechanisms.add('Intraductal proliferation');
      phenotypes.add('Blood-stained nipple discharge');
      diseases.add('intraductal_papilloma');
      diseases.add('breast_cancer');
      investigations.add('Mammography');
      investigations.add('Breast ultrasound');
      investigations.add('Ductoscopy/ductography');
    }

    if (card.id === 'breast_discharge_color' && val === 'milky') {
      mechanisms.add('Hyperprolactinemia');
      phenotypes.add('Galactorrhea');
      diseases.add('galactorrhea');
      investigations.add('Serum prolactin');
      investigations.add('TFT');
    }

    if (card.id === 'breast_discharge_color' && val === 'purulent') {
      mechanisms.add('Bacterial infection');
      phenotypes.add('Purulent nipple discharge');
      diseases.add('mastitis');
      diseases.add('breast_abscess');
      investigations.add('Microbiology culture');
      investigations.add('Breast ultrasound');
    }

    if (card.id === 'breast_palp_temperature' && val === 'warm') {
      mechanisms.add('Inflammatory hyperemia');
      phenotypes.add('Local warmth');
      diseases.add('mastitis');
    }

    if (card.id === 'breast_lactation_abscess' && val === 'yes') {
      mechanisms.add('Suppurative mastitis');
      phenotypes.add('Breast abscess');
      diseases.add('breast_abscess');
      investigations.add('Breast ultrasound');
      investigations.add('CBC');
      investigations.add('CRP');
    }

    if (card.id === 'breast_insp_nipple' && val === 'paget_changes') {
      mechanisms.add('Paget cell infiltration of nipple epidermis');
      phenotypes.add('Paget\'s disease of the nipple');
      diseases.add('paget_disease');
      diseases.add('breast_cancer');
      investigations.add('Nipple biopsy');
      investigations.add('Mammography');
      investigations.add('MRI breast');
    }

    if (card.id === 'breast_male_gynaecomastia' && !['absent', 'none'].includes(val)) {
      mechanisms.add('Hormonal imbalance (increased estrogen/androgen ratio)');
      phenotypes.add('Gynaecomastia');
      diseases.add('gynecomastia');
      investigations.add('Breast ultrasound');
      investigations.add('LFT, TFT, sex hormone profile');
    }

    if (card.id === 'breast_male_mass' && val !== 'none') {
      mechanisms.add('Malignant transformation of male breast tissue');
      phenotypes.add('Male breast mass');
      diseases.add('male_breast_cancer');
      investigations.add('Mammography');
      investigations.add('Breast ultrasound');
      investigations.add('Core biopsy');
    }

    if (card.id === 'breast_postop_lymphedema' && val !== 'none') {
      mechanisms.add('Lymphatic disruption');
      mechanisms.add('Axillary lymph node dissection');
      phenotypes.add('Upper limb lymphoedema');
      diseases.add('lymphoedema');
      investigations.add('Clinical diagnosis');
      investigations.add('Arm volume measurement');
    }

    nodes.push({
      finding: card.id,
      findingLabel: card.label,
      mechanisms: [...mechanisms],
      phenotypes: [...phenotypes],
      diseases: [...diseases],
      investigations: [...investigations],
      anatomicalLocation: getAnatomicalForSection(card.section),
      breastArchitecture: [...architecture],
    });
  }

  for (const node of nodes) {
    const extraInvs = getBreastInvestigations([...triggeredDiseases]);
    for (const inv of extraInvs) {
      if (!node.investigations.includes(inv)) node.investigations.push(inv);
    }
  }

  return nodes;
}

function getAnatomicalForSection(section: BreastSection): string | undefined {
  const map: Partial<Record<BreastSection, string>> = {
    inspection: 'Breast skin and contour',
    palpation: 'Breast parenchyma',
    nipple: 'Nipple-areolar complex',
    axillary: 'Axilla',
    supraclavicular: 'Supraclavicular/infraclavicular region',
    cancer: 'Breast (advanced disease)',
    breastfeeding: 'Lactating breast',
    male_breast: 'Male breast',
    postoperative: 'Post-surgical breast',
  };
  return map[section];
}

function getBreastInvestigations(diseases: string[]): string[] {
  const invs = new Set<string>();
  for (const d of diseases) {
    const key = d.toLowerCase();
    if (BREAST_INVESTIGATION_MAP[key]) {
      for (const inv of BREAST_INVESTIGATION_MAP[key]) invs.add(inv);
    }
  }
  return [...invs];
}

// ─────────────────────────────────────────────────────────────────
// ESCALATION DETECTION (breast cancer suspicion)
// ─────────────────────────────────────────────────────────────────

export function shouldEscalateBreastToPrimary(
  findings: Record<string, unknown>,
  activeCards: BreastCardDef[],
): boolean {
  const suspiciousFindings = [
    'breast_mass_consistency', 'breast_mass_margins', 'breast_mass_mobility',
    'breast_mass_muscle_attachment', 'breast_mass_chest_wall',
    'breast_mass_skin_attachment', 'breast_axillary_nodes',
    'breast_supraclavicular_nodes', 'breast_insp_nipple',
    'breast_insp_skin', 'breast_discharge_color',
  ];
  const suspiciousVals = ['fixed', 'hard', 'irregular', 'palpable', 'blood_stained',
    'retracted', 'paget_changes', 'peau_d_orange', 'ulceration', 'dimpling', 'present'];

  for (const cardId of suspiciousFindings) {
    const val = findings[cardId];
    if (val == null) continue;
    const strVal = String(val);
    for (const sv of suspiciousVals) {
      if (strVal.includes(sv)) return true;
    }
  }
  return false;
}
