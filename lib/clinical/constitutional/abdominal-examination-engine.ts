// ═══════════════════════════════════════════════════════════════
// AMEXAN Universal Abdominal Examination Engine (UAEE)
// Constitutional Volume — full structured abdominal exam flow
// Follows Hutchison's, Macleod's, Talley & O'Connor, Bates
// ═══════════════════════════════════════════════════════════════

export type AgeBand = 'neonate' | 'infant' | 'toddler' | 'child' | 'adolescent' | 'adult' | 'elderly';

export type AbdExamMode = 'primary' | 'secondary';

export type AbdSection =
  | 'preparation' | 'positioning' | 'inspection' | 'auscultation'
  | 'percussion' | 'palpation_superficial' | 'palpation_deep'
  | 'organ_examination' | 'special_manoeuvres' | 'local_cascades' | 'summary';

export interface AbdContext {
  ageBand: AgeBand;
  sex: 'male' | 'female';
  pregnant: boolean;
  knownDiseases: string[];
  chiefComplaints: string[];
  activeModules: string[];
  findings: Record<string, unknown>;
}

export interface AbdOption {
  value: string;
  label: string;
  documentationPhrase: string;
  triggersCascade?: string;
  triggersFindings?: string[];
}

export interface AbdEvidenceLink {
  mechanism?: string;
  phenotype?: string;
  disease?: string;
  supportsDisease: string[];
  weight: number;
  documentationPhrase: string;
}

export interface AbdConditionalExpand {
  triggerValues: string[];
  expandCardIds: string[];
}

export interface AbdCascadeTrigger {
  findingValuePattern: string[];
  expandSection: AbdSection;
  expandCardIds: string[];
  explanation: string;
}

export interface AbdCardDef {
  id: string;
  section: AbdSection;
  sectionOrder: number;
  cardNumber: number;
  label: string;
  question: string;
  type: 'single_select' | 'multi_select' | 'boolean' | 'numeric' | 'text';
  options: AbdOption[];
  documentationTemplate: string;
  contextVisibility: {
    showForAgeBands?: AgeBand[];
    hideForAgeBands?: AgeBand[];
    showForSex?: ('male' | 'female')[];
    showForPregnancy?: boolean;
    alwaysShow?: boolean;
    screeningMode?: boolean;
  };
  conditionalExpand?: AbdConditionalExpand;
  cascadeTrigger?: AbdCascadeTrigger;
  evidenceLinks: AbdEvidenceLink[];
}

// ─────────────────────────────────────────────────────────────────
// MODE DETECTION
// ─────────────────────────────────────────────────────────────────

export function detectAbdominalMode(ctx: AbdContext): AbdExamMode {
  const abdKeywords = [
    'abdominal pain', 'stomach ache', 'belly pain', 'abdominal swelling',
    'distension', 'vomiting', 'diarrhea', 'diarrhoea', 'constipation',
    'gi bleeding', 'hematemesis', 'haematemesis', 'melena', 'haematochezia',
    'jaundice', 'abdominal trauma', 'nausea', 'dysphagia', 'heartburn',
    'indigestion', 'ascites', 'mass', 'hernia',
  ];
  const abdDiseases = [
    'appendicitis', 'cholecystitis', 'pancreatitis', 'hepatitis', 'cirrhosis',
    'peptic_ulcer', 'gastritis', 'ibs', 'ibd', 'crohns', 'ulcerative_colitis',
    'diverticulitis', 'intestinal_obstruction', 'peritonitis', 'ascites',
    'hernia', 'gi_bleeding', 'varices', 'splenomegaly', 'hepatomegaly',
    'pancreatic_cancer', 'gastric_cancer', 'colon_cancer', 'liver_cancer',
    'aa_aneurysm', 'renal_colic', 'uti', 'pyelonephritis',
  ];
  const abdModules = ['gastroenterology', 'hepatology', 'colorectal', 'upper_gi', 'general_surgery', 'obstetric'];

  const hasAbdComplaint = ctx.chiefComplaints.some(c =>
    abdKeywords.some(k => c.toLowerCase().includes(k)),
  );
  const hasAbdDisease = ctx.knownDiseases.some(d => abdDiseases.includes(d));
  const hasAbdModule = ctx.activeModules.some(m =>
    abdModules.includes(m.toLowerCase()),
  );

  if (hasAbdComplaint || hasAbdDisease || hasAbdModule) return 'primary';

  const abdFindings = [
    'abd_shape', 'abd_tenderness', 'abd_masses',
    'abd_organomegaly', 'abd_bowel_sounds',
  ];
  const hasAbdFindings = abdFindings.some(f => {
    const v = ctx.findings[f];
    return v != null && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0);
  });
  if (hasAbdFindings) return 'primary';

  return 'secondary';
}

// ─────────────────────────────────────────────────────────────────
// AUTO-ESCALATION RULES
// ─────────────────────────────────────────────────────────────────

export const ABD_AUTO_ESCALATION_RULES: AbdCascadeTrigger[] = [
  {
    findingValuePattern: ['right_upper', 'right_hypochondrium', 'epigastric'],
    expandSection: 'organ_examination',
    expandCardIds: ['abd_liver', 'abd_gallbladder', 'abd_murphy'],
    explanation: 'RUQ/epigastric tenderness — expanding for hepatobiliary assessment',
  },
  {
    findingValuePattern: ['right_lower', 'right_iliac'],
    expandSection: 'special_manoeuvres',
    expandCardIds: ['abd_mcburney', 'abd_rovsing', 'abd_psoas', 'abd_obturator'],
    explanation: 'RLQ tenderness — expanding for appendicitis assessment',
  },
  {
    findingValuePattern: ['distended', 'rounded', 'asymmetrical'],
    expandSection: 'inspection',
    expandCardIds: ['abd_umbilicus', 'abd_visible_veins', 'abd_visible_mass', 'abd_scars'],
    explanation: 'Abdominal distension detected — expanding inspection',
  },
  {
    findingValuePattern: ['positive'],
    expandSection: 'percussion',
    expandCardIds: ['abd_shifting_dullness', 'abd_fluid_thrill'],
    explanation: 'Ascites suspected — expanding for ascites assessment',
  },
  {
    findingValuePattern: ['mass', 'palpable'],
    expandSection: 'local_cascades',
    expandCardIds: ['abd_mass_cascade'],
    explanation: 'Mass detected — expanding mass cascade',
  },
];

// ─────────────────────────────────────────────────────────────────
// SECONDARY (SCREENING) CARDS — 5-card minimal set
// ─────────────────────────────────────────────────────────────────

export const ABD_SCREENING_CARDS: AbdCardDef[] = [
  {
    id: 'scr_abd_distension', section: 'inspection', sectionOrder: 1, cardNumber: 1,
    label: 'Abdominal Distension',
    question: 'Abdominal shape / distension',
    type: 'single_select',
    options: [
      { value: 'non_distended', label: 'Non-distended / Flat', documentationPhrase: 'abdomen is non-distended' },
      { value: 'distended', label: 'Distended', documentationPhrase: 'abdomen is distended' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['ascites', 'intestinal_obstruction', 'hepatomegaly'], weight: 0.4, documentationPhrase: 'abdominal distension' },
    ],
  },
  {
    id: 'scr_abd_tenderness', section: 'palpation_superficial', sectionOrder: 2, cardNumber: 2,
    label: 'Tenderness',
    question: 'Abdominal tenderness',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'it is soft and non-tender on palpation' },
      { value: 'present', label: 'Present', documentationPhrase: 'tenderness is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['appendicitis', 'cholecystitis', 'pancreatitis', 'peritonitis'], weight: 0.5, documentationPhrase: 'abdominal tenderness' },
    ],
  },
  {
    id: 'scr_abd_masses', section: 'palpation_deep', sectionOrder: 3, cardNumber: 3,
    label: 'Palpable Masses',
    question: 'Palpable abdominal masses',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no palpable masses' },
      { value: 'present', label: 'Present', documentationPhrase: 'a palpable mass is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['malignancy', 'hepatomegaly', 'splenomegaly', 'aa_aneurysm'], weight: 0.6, documentationPhrase: 'palpable abdominal mass' },
    ],
  },
  {
    id: 'scr_abd_organomegaly', section: 'organ_examination', sectionOrder: 4, cardNumber: 4,
    label: 'Organomegaly',
    question: 'Palpable organomegaly',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no palpable organomegaly' },
      { value: 'hepatomegaly', label: 'Hepatomegaly', documentationPhrase: 'hepatomegaly' },
      { value: 'splenomegaly', label: 'Splenomegaly', documentationPhrase: 'splenomegaly' },
      { value: 'hepatosplenomegaly', label: 'Hepatosplenomegaly', documentationPhrase: 'hepatosplenomegaly' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['hepatitis', 'cirrhosis', 'heart_failure', 'malaria', 'leukemia'], weight: 0.6, documentationPhrase: 'organomegaly' },
    ],
  },
  {
    id: 'scr_abd_bowel_sounds', section: 'auscultation', sectionOrder: 5, cardNumber: 5,
    label: 'Bowel Sounds',
    question: 'Bowel sounds',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'bowel sounds are present and normal' },
      { value: 'increased', label: 'Increased', documentationPhrase: 'hyperactive bowel sounds' },
      { value: 'reduced', label: 'Reduced', documentationPhrase: 'hypoactive bowel sounds' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'absent bowel sounds' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, screeningMode: true },
    evidenceLinks: [
      { supportsDisease: ['intestinal_obstruction'], weight: 0.6, documentationPhrase: 'hyperactive bowel sounds' },
      { supportsDisease: ['ileus', 'peritonitis'], weight: 0.6, documentationPhrase: 'hypoactive bowel sounds' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// PRIMARY CARDS — full abdominal examination flow
// ─────────────────────────────────────────────────────────────────

export const ABD_CARDS: AbdCardDef[] = [

  // ══ PART 0: PREPARATION ══
  {
    id: 'abd_prep', section: 'preparation', sectionOrder: 0, cardNumber: 0,
    label: 'Preparation',
    question: 'Preparation complete',
    type: 'single_select',
    options: [
      { value: 'complete', label: '✓ Explained, consented, exposed, supine, empty bladder, good lighting', documentationPhrase: '' },
    ],
    documentationTemplate: '',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },

  // ══ PART 1: POSITIONING ══
  {
    id: 'abd_position', section: 'positioning', sectionOrder: 1, cardNumber: 1,
    label: 'Positioning',
    question: 'Patient positioning',
    type: 'single_select',
    options: [
      { value: 'supine', label: 'Supine, arms by sides, one pillow', documentationPhrase: 'patient is supine with arms by the sides' },
      { value: 'supine_flexed', label: 'Supine with knees flexed', documentationPhrase: 'patient is supine with knees slightly flexed' },
    ],
    documentationTemplate: 'The patient is positioned {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },

  // ══ PART 2: INSPECTION ══
  {
    id: 'abd_shape', section: 'inspection', sectionOrder: 2, cardNumber: 2,
    label: 'Abdominal Shape',
    question: 'Abdominal shape and contour',
    type: 'single_select',
    options: [
      { value: 'flat', label: 'Flat / Normal', documentationPhrase: 'abdomen is flat and symmetrical' },
      { value: 'scaphoid', label: 'Scaphoid', documentationPhrase: 'abdomen is scaphoid' },
      { value: 'rounded', label: 'Rounded', documentationPhrase: 'abdomen is rounded' },
      { value: 'distended', label: 'Distended', documentationPhrase: 'abdomen is distended' },
      { value: 'asymmetrical', label: 'Asymmetrical', documentationPhrase: 'abdomen is asymmetrical' },
      { value: 'localized_swelling', label: 'Localized swelling', documentationPhrase: 'localized abdominal swelling' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Increased intra-abdominal pressure', supportsDisease: ['ascites', 'intestinal_obstruction', 'pregnancy'], weight: 0.4, documentationPhrase: 'abdominal distension' },
      { supportsDisease: ['hepatomegaly', 'splenomegaly', 'mass'], weight: 0.3, documentationPhrase: 'abdominal asymmetry' },
    ],
  },
  {
    id: 'abd_resp_movement', section: 'inspection', sectionOrder: 3, cardNumber: 3,
    label: 'Respiratory Movement',
    question: 'Abdominal movement with respiration',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Moves normally', documentationPhrase: 'abdomen moves normally with respiration' },
      { value: 'reduced', label: 'Reduced / Splinting', documentationPhrase: 'reduced abdominal movement with respiration' },
      { value: 'absent', label: 'Absent / Frozen', documentationPhrase: 'absent abdominal respiratory movement' },
      { value: 'paradoxical', label: 'Paradoxical', documentationPhrase: 'paradoxical abdominal movement' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Peritoneal irritation', phenotype: 'Acute abdomen', supportsDisease: ['peritonitis', 'appendicitis', 'cholecystitis', 'pancreatitis'], weight: 0.6, documentationPhrase: 'reduced abdominal movement' },
    ],
  },
  {
    id: 'abd_scars', section: 'inspection', sectionOrder: 4, cardNumber: 4,
    label: 'Abdominal Scars',
    question: 'Surgical scars',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no abdominal scars' },
      { value: 'midline', label: 'Midline laparotomy', documentationPhrase: 'midline laparotomy scar' },
      { value: 'pfannenstiel', label: 'Pfannenstiel', documentationPhrase: 'Pfannenstiel scar' },
      { value: 'kocher', label: 'Kocher / Right subcostal', documentationPhrase: 'Kocher incision scar (right subcostal)' },
      { value: 'left_subcostal', label: 'Left subcostal', documentationPhrase: 'left subcostal scar' },
      { value: 'right_iliac_fossa', label: 'Right iliac fossa (gridiron)', documentationPhrase: 'right iliac fossa scar (gridiron incision)' },
      { value: 'left_iliac_fossa', label: 'Left iliac fossa', documentationPhrase: 'left iliac fossa scar' },
      { value: 'paramedian', label: 'Paramedian', documentationPhrase: 'paramedian scar' },
      { value: 'umbilical', label: 'Umbilical / Laparoscopic', documentationPhrase: 'laparoscopic / umbilical scar' },
      { value: 'stoma', label: 'Stoma', documentationPhrase: 'stoma present' },
    ],
    documentationTemplate: '{value} noted on abdominal inspection.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['post_surgical', 'adhesions'], weight: 0.3, documentationPhrase: 'previous abdominal surgery' },
    ],
  },
  {
    id: 'abd_striae', section: 'inspection', sectionOrder: 5, cardNumber: 5,
    label: 'Striae',
    question: 'Abdominal striae',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no abdominal striae' },
      { value: 'white', label: 'White / Old striae', documentationPhrase: 'old white striae' },
      { value: 'purple', label: 'Purple / Recent striae', documentationPhrase: 'purple striae suggesting Cushing syndrome' },
      { value: 'pregnancy', label: 'Striae gravidarum', documentationPhrase: 'striae gravidarum' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Cushing syndrome', supportsDisease: ['cushing_syndrome', 'obesity'], weight: 0.4, documentationPhrase: 'purple striae' },
    ],
  },
  {
    id: 'abd_visible_veins', section: 'inspection', sectionOrder: 6, cardNumber: 6,
    label: 'Abdominal Veins',
    question: 'Dilated abdominal veins',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no dilated abdominal veins' },
      { value: 'caput_medusae', label: 'Caput medusae (portal HTN)', documentationPhrase: 'caput medusae suggesting portal hypertension' },
      { value: 'ivc_collaterals', label: 'IVC collateral pattern', documentationPhrase: 'dilated veins suggesting IVC obstruction' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Portal hypertension', supportsDisease: ['cirrhosis', 'portal_hypertension'], weight: 0.7, documentationPhrase: 'caput medusae' },
      { disease: 'IVC obstruction', supportsDisease: ['ivc_obstruction'], weight: 0.6, documentationPhrase: 'ivc collateral pattern' },
    ],
  },
  {
    id: 'abd_umbilicus', section: 'inspection', sectionOrder: 7, cardNumber: 7,
    label: 'Umbilicus',
    question: 'Umbilical appearance',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'umbilicus is normal' },
      { value: 'inverted', label: 'Inverted', documentationPhrase: 'umbilicus is inverted' },
      { value: 'everted', label: 'Everted', documentationPhrase: 'umbilicus is everted' },
      { value: 'discharge', label: 'Discharge', documentationPhrase: 'umbilical discharge' },
      { value: 'hernia', label: 'Umbilical hernia', documentationPhrase: 'umbilical hernia' },
      { value: 'mass', label: 'Periumbilical mass (Sister Joseph nodule)', documentationPhrase: 'Sister Joseph nodule suggesting intra-abdominal malignancy' },
      { value: 'piercing', label: 'Piercing', documentationPhrase: 'umbilical piercing' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Intra-abdominal malignancy', supportsDisease: ['gastric_cancer', 'pancreatic_cancer', 'colon_cancer'], weight: 0.7, documentationPhrase: 'Sister Joseph nodule' },
      { disease: 'Portal hypertension', supportsDisease: ['cirrhosis', 'portal_hypertension'], weight: 0.3, documentationPhrase: 'everted umbilicus' },
    ],
  },
  {
    id: 'abd_visible_mass', section: 'inspection', sectionOrder: 8, cardNumber: 8,
    label: 'Visible Mass',
    question: 'Visible abdominal mass',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no visible abdominal masses' },
      { value: 'present', label: 'Present', documentationPhrase: 'a visible abdominal mass is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },
  {
    id: 'abd_visible_peristalsis', section: 'inspection', sectionOrder: 9, cardNumber: 9,
    label: 'Visible Peristalsis',
    question: 'Visible peristalsis',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no visible peristalsis' },
      { value: 'present', label: 'Present', documentationPhrase: 'visible gastric or intestinal peristalsis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, hideForAgeBands: ['adult', 'elderly'] },
    evidenceLinks: [
      { disease: 'Intestinal obstruction', supportsDisease: ['pyloric_stenosis', 'intestinal_obstruction'], weight: 0.6, documentationPhrase: 'visible peristalsis' },
    ],
  },
  {
    id: 'abd_visible_pulsations', section: 'inspection', sectionOrder: 10, cardNumber: 10,
    label: 'Visible Pulsations',
    question: 'Visible abdominal pulsations',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no visible pulsations' },
      { value: 'epigastric', label: 'Epigastric (aortic)', documentationPhrase: 'visible epigastric aortic pulsations' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'AA aneurysm', supportsDisease: ['aa_aneurysm'], weight: 0.5, documentationPhrase: 'visible aortic pulsations' },
    ],
  },
  {
    id: 'abd_hernia_orifices', section: 'inspection', sectionOrder: 11, cardNumber: 11,
    label: 'Hernia Orifices',
    question: 'Hernial orifices',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'hernial orifices are normal' },
      { value: 'inguinal_hernia', label: 'Inguinal hernia', documentationPhrase: 'inguinal hernia is present' },
      { value: 'femoral_hernia', label: 'Femoral hernia', documentationPhrase: 'femoral hernia is present' },
      { value: 'incisional_hernia', label: 'Incisional hernia', documentationPhrase: 'incisional hernia is present' },
      { value: 'epigastric_hernia', label: 'Epigastric hernia', documentationPhrase: 'epigastric hernia' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['hernia'], weight: 0.5, documentationPhrase: 'hernia' },
    ],
  },

  // ══ PART 3: AUSCULTATION ══
  {
    id: 'abd_bowel_sounds', section: 'auscultation', sectionOrder: 12, cardNumber: 12,
    label: 'Bowel Sounds',
    question: 'Bowel sounds (auscultate before percussion/palpation)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'bowel sounds are present and normal' },
      { value: 'hyperactive', label: 'Hyperactive', documentationPhrase: 'hyperactive bowel sounds' },
      { value: 'hypoactive', label: 'Hypoactive', documentationPhrase: 'hypoactive bowel sounds' },
      { value: 'absent', label: 'Absent', documentationPhrase: 'absent bowel sounds' },
      { value: 'high_pitched', label: 'High-pitched / Tinkling', documentationPhrase: 'high-pitched tinkling bowel sounds suggestive of obstruction' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Intestinal obstruction', phenotype: 'Obstructive syndrome', supportsDisease: ['intestinal_obstruction'], weight: 0.7, documentationPhrase: 'high-pitched tinkling bowel sounds' },
      { mechanism: 'Ileus', phenotype: 'Peritonitis', supportsDisease: ['ileus', 'peritonitis', 'post_surgical'], weight: 0.6, documentationPhrase: 'absent bowel sounds' },
    ],
  },
  {
    id: 'abd_bruits', section: 'auscultation', sectionOrder: 13, cardNumber: 13,
    label: 'Bruits',
    question: 'Abdominal bruits',
    type: 'multi_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no abdominal bruits' },
      { value: 'aortic', label: 'Aortic bruit', documentationPhrase: 'aortic bruit' },
      { value: 'renal', label: 'Renal bruit', documentationPhrase: 'renal artery bruit' },
      { value: 'iliac', label: 'Iliac bruit', documentationPhrase: 'iliac bruit' },
      { value: 'femoral', label: 'Femoral bruit', documentationPhrase: 'femoral bruit' },
      { value: 'hepatic', label: 'Hepatic bruit', documentationPhrase: 'hepatic bruit suggesting hepatic tumour' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Renal artery stenosis', supportsDisease: ['renal_artery_stenosis'], weight: 0.6, documentationPhrase: 'renal bruit' },
      { disease: 'AA aneurysm', supportsDisease: ['aa_aneurysm'], weight: 0.4, documentationPhrase: 'aortic bruit' },
      { disease: 'HCC', supportsDisease: ['hepatocellular_carcinoma'], weight: 0.5, documentationPhrase: 'hepatic bruit' },
    ],
  },

  // ══ PART 4: PERCUSSION ══
  {
    id: 'abd_percussion_note', section: 'percussion', sectionOrder: 14, cardNumber: 14,
    label: 'Percussion Note (General)',
    question: 'General percussion note',
    type: 'single_select',
    options: [
      { value: 'tympanic', label: 'Tympanic / Resonant', documentationPhrase: 'tympanic percussion note throughout' },
      { value: 'dull', label: 'Dull', documentationPhrase: 'diffuse dullness on percussion' },
      { value: 'localized_dullness', label: 'Localized dullness', documentationPhrase: 'localized dullness' },
      { value: 'shifting_dullness', label: 'Shifting dullness', documentationPhrase: 'shifting dullness suggestive of ascites' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Ascites', supportsDisease: ['ascites', 'liver_disease', 'heart_failure'], weight: 0.7, documentationPhrase: 'shifting dullness' },
      { supportsDisease: ['hepatomegaly', 'splenomegaly', 'mass', 'pregnancy'], weight: 0.3, documentationPhrase: 'dull percussion note' },
    ],
  },
  {
    id: 'abd_liver_span', section: 'percussion', sectionOrder: 15, cardNumber: 15,
    label: 'Liver Span',
    question: 'Liver span on percussion (cm)',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Liver span is {value} cm on percussion.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Hepatomegaly', supportsDisease: ['hepatomegaly', 'heart_failure', 'hepatitis', 'cirrhosis'], weight: 0.5, documentationPhrase: 'liver span {value} cm' },
    ],
  },
  {
    id: 'abd_splenic_dullness', section: 'percussion', sectionOrder: 16, cardNumber: 16,
    label: 'Splenic Dullness',
    question: 'Splenic percussion (Traube\'s space)',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal (resonant)', documentationPhrase: 'Traube\'s space is normally resonant' },
      { value: 'obliterated', label: 'Obliterated / Dull', documentationPhrase: 'Traube\'s space is dull, suggesting splenomegaly' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Splenomegaly', supportsDisease: ['splenomegaly', 'malaria', 'leukemia', 'portal_hypertension'], weight: 0.6, documentationPhrase: 'dull Traube space suggesting splenomegaly' },
    ],
  },
  {
    id: 'abd_shifting_dullness', section: 'percussion', sectionOrder: 17, cardNumber: 17,
    label: 'Shifting Dullness',
    question: 'Shifting dullness (ascites)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'no shifting dullness' },
      { value: 'positive', label: 'Positive', documentationPhrase: 'shifting dullness is positive, consistent with ascites' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false, hideForAgeBands: ['neonate'] },
    evidenceLinks: [
      { disease: 'Ascites', supportsDisease: ['ascites', 'liver_disease', 'heart_failure', 'nephrotic_syndrome'], weight: 0.7, documentationPhrase: 'shifting dullness' },
    ],
  },
  {
    id: 'abd_fluid_thrill', section: 'percussion', sectionOrder: 18, cardNumber: 18,
    label: 'Fluid Thrill',
    question: 'Fluid thrill (large ascites)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'no fluid thrill' },
      { value: 'positive', label: 'Positive', documentationPhrase: 'fluid thrill is positive, suggesting large volume ascites' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false, hideForAgeBands: ['neonate'] },
    evidenceLinks: [
      { disease: 'Ascites', supportsDisease: ['ascites', 'liver_disease', 'heart_failure'], weight: 0.6, documentationPhrase: 'fluid thrill' },
    ],
  },

  // ══ PART 5: SUPERFICIAL PALPATION ══
  {
    id: 'abd_tenderness', section: 'palpation_superficial', sectionOrder: 19, cardNumber: 19,
    label: 'Tenderness (Superficial)',
    question: 'Superficial palpation tenderness',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no tenderness on superficial palpation' },
      { value: 'generalized', label: 'Generalized', documentationPhrase: 'generalized abdominal tenderness' },
      { value: 'right_upper', label: 'Right upper quadrant', documentationPhrase: 'tenderness in the right upper quadrant' },
      { value: 'left_upper', label: 'Left upper quadrant', documentationPhrase: 'tenderness in the left upper quadrant' },
      { value: 'right_lower', label: 'Right lower quadrant', documentationPhrase: 'tenderness in the right lower quadrant' },
      { value: 'left_lower', label: 'Left lower quadrant', documentationPhrase: 'tenderness in the left lower quadrant' },
      { value: 'epigastric', label: 'Epigastric', documentationPhrase: 'epigastric tenderness' },
      { value: 'periumbilical', label: 'Periumbilical', documentationPhrase: 'periumbilical tenderness' },
      { value: 'suprapubic', label: 'Suprapubic', documentationPhrase: 'suprapubic tenderness' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Peritoneal irritation', phenotype: 'Acute abdomen', supportsDisease: ['appendicitis', 'cholecystitis', 'pancreatitis', 'peritonitis', 'diverticulitis'], weight: 0.5, documentationPhrase: 'abdominal tenderness' },
    ],
  },
  {
    id: 'abd_guarding', section: 'palpation_superficial', sectionOrder: 20, cardNumber: 20,
    label: 'Guarding',
    question: 'Voluntary or involuntary guarding',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no guarding' },
      { value: 'voluntary', label: 'Voluntary guarding', documentationPhrase: 'voluntary guarding' },
      { value: 'involuntary', label: 'Involuntary guarding', documentationPhrase: 'involuntary guarding suggesting peritonitis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Peritoneal irritation', phenotype: 'Peritonitis', supportsDisease: ['peritonitis', 'appendicitis', 'cholecystitis', 'pancreatitis'], weight: 0.7, documentationPhrase: 'involuntary guarding' },
    ],
  },
  {
    id: 'abd_rigidity', section: 'palpation_superficial', sectionOrder: 21, cardNumber: 21,
    label: 'Rigidity',
    question: 'Abdominal wall rigidity',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no rigidity' },
      { value: 'localized', label: 'Localized', documentationPhrase: 'localized abdominal rigidity' },
      { value: 'generalized', label: 'Generalized / Board-like', documentationPhrase: 'generalized board-like rigidity' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { mechanism: 'Peritoneal irritation', phenotype: 'Peritonitis', supportsDisease: ['peritonitis', 'perforated_viscus'], weight: 0.8, documentationPhrase: 'generalized rigidity' },
    ],
  },
  {
    id: 'abd_superficial_masses', section: 'palpation_superficial', sectionOrder: 22, cardNumber: 22,
    label: 'Superficial Masses',
    question: 'Superficial abdominal masses',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no superficial abdominal masses' },
      { value: 'present', label: 'Present', documentationPhrase: 'a superficial abdominal mass is palpable' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },

  // ══ PART 6: DEEP PALPATION ══
  {
    id: 'abd_deep_tenderness', section: 'palpation_deep', sectionOrder: 23, cardNumber: 23,
    label: 'Deep Tenderness',
    question: 'Deep palpation tenderness',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no deep tenderness' },
      { value: 'generalized', label: 'Generalized', documentationPhrase: 'generalized deep tenderness' },
      { value: 'right_upper', label: 'Right upper quadrant', documentationPhrase: 'deep tenderness in the right upper quadrant' },
      { value: 'left_upper', label: 'Left upper quadrant', documentationPhrase: 'deep tenderness in the left upper quadrant' },
      { value: 'right_lower', label: 'Right lower quadrant', documentationPhrase: 'deep tenderness in the right lower quadrant' },
      { value: 'left_lower', label: 'Left lower quadrant', documentationPhrase: 'deep tenderness in the left lower quadrant' },
      { value: 'epigastric', label: 'Epigastric', documentationPhrase: 'deep epigastric tenderness' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['appendicitis', 'cholecystitis', 'pancreatitis', 'diverticulitis'], weight: 0.5, documentationPhrase: 'deep tenderness' },
    ],
  },
  {
    id: 'abd_deep_masses', section: 'palpation_deep', sectionOrder: 24, cardNumber: 24,
    label: 'Deep Masses',
    question: 'Deep abdominal masses',
    type: 'single_select',
    options: [
      { value: 'none', label: 'None', documentationPhrase: 'no deep abdominal masses' },
      { value: 'right_upper', label: 'RUQ mass', documentationPhrase: 'deep mass in the right upper quadrant' },
      { value: 'left_upper', label: 'LUQ mass', documentationPhrase: 'deep mass in the left upper quadrant' },
      { value: 'epigastric', label: 'Epigastric mass', documentationPhrase: 'deep epigastric mass' },
      { value: 'right_lower', label: 'RLQ mass', documentationPhrase: 'deep mass in the right lower quadrant' },
      { value: 'left_lower', label: 'LLQ mass', documentationPhrase: 'deep mass in the left lower quadrant' },
      { value: 'suprapubic', label: 'Suprapubic mass', documentationPhrase: 'suprapubic mass' },
      { value: 'umbilical', label: 'Periumbilical mass', documentationPhrase: 'periumbilical mass' },
    ],
    documentationTemplate: 'A {value} is palpable.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { supportsDisease: ['malignancy', 'hepatomegaly', 'splenomegaly', 'aa_aneurysm'], weight: 0.5, documentationPhrase: 'palpable mass' },
    ],
  },
  {
    id: 'abd_rebound', section: 'palpation_deep', sectionOrder: 25, cardNumber: 25,
    label: 'Rebound Tenderness',
    question: 'Rebound tenderness / Blumberg sign',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'no rebound tenderness' },
      { value: 'positive', label: 'Positive', documentationPhrase: 'rebound tenderness is positive, suggesting peritoneal irritation' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true, hideForAgeBands: ['neonate'] },
    evidenceLinks: [
      { mechanism: 'Peritoneal irritation', phenotype: 'Peritonitis', supportsDisease: ['peritonitis', 'appendicitis', 'perforated_viscus'], weight: 0.7, documentationPhrase: 'rebound tenderness' },
    ],
  },

  // ══ PART 7: ORGAN EXAMINATION ══
  {
    id: 'abd_liver', section: 'organ_examination', sectionOrder: 26, cardNumber: 26,
    label: 'Liver Palpation',
    question: 'Is the liver palpable?',
    type: 'single_select',
    options: [
      { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'liver is not palpable' },
      { value: 'palpable', label: 'Palpable', documentationPhrase: 'liver is palpable' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },
  {
    id: 'abd_liver_details', section: 'organ_examination', sectionOrder: 27, cardNumber: 27,
    label: 'Liver Details',
    question: 'Liver characteristics',
    type: 'multi_select',
    options: [
      { value: 'smooth', label: 'Smooth surface', documentationPhrase: 'smooth liver surface' },
      { value: 'nodular', label: 'Nodular / Irregular surface', documentationPhrase: 'nodular liver surface suggesting cirrhosis' },
      { value: 'firm', label: 'Firm consistency', documentationPhrase: 'firm liver consistency' },
      { value: 'hard', label: 'Hard consistency', documentationPhrase: 'hard liver consistency suggesting malignancy' },
      { value: 'tender', label: 'Tender', documentationPhrase: 'tender hepatomegaly suggesting hepatitis or CHF' },
      { value: 'pulsatile', label: 'Pulsatile (tricuspid regurgitation)', documentationPhrase: 'pulsatile liver suggesting tricuspid regurgitation' },
    ],
    documentationTemplate: 'The liver has a {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Cirrhosis', supportsDisease: ['cirrhosis'], weight: 0.6, documentationPhrase: 'nodular firm liver' },
      { disease: 'Hepatitis', supportsDisease: ['hepatitis', 'heart_failure'], weight: 0.5, documentationPhrase: 'tender hepatomegaly' },
      { disease: 'Malignancy', supportsDisease: ['hcc', 'liver_metastases'], weight: 0.6, documentationPhrase: 'hard nodular liver' },
    ],
  },
  {
    id: 'abd_liver_size', section: 'organ_examination', sectionOrder: 28, cardNumber: 28,
    label: 'Liver Size (below costal margin)',
    question: 'Liver span below costal margin (cm)',
    type: 'numeric',
    options: [],
    documentationTemplate: 'Liver extends {value} cm below the right costal margin.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Hepatomegaly', supportsDisease: ['hepatomegaly', 'heart_failure', 'hepatitis'], weight: 0.5, documentationPhrase: 'liver {value} cm below costal margin' },
    ],
  },
  {
    id: 'abd_gallbladder', section: 'organ_examination', sectionOrder: 29, cardNumber: 29,
    label: 'Gallbladder',
    question: 'Is the gallbladder palpable?',
    type: 'single_select',
    options: [
      { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'gallbladder is not palpable' },
      { value: 'palpable_non_tender', label: 'Palpable, non-tender (Courvoisier)', documentationPhrase: 'palpable non-tender gallbladder (Courvoisier sign) suggesting pancreatic malignancy' },
      { value: 'palpable_tender', label: 'Palpable, tender', documentationPhrase: 'palpable tender gallbladder' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Pancreatic cancer', supportsDisease: ['pancreatic_cancer', 'cholangiocarcinoma'], weight: 0.6, documentationPhrase: 'Courvoisier gallbladder' },
      { disease: 'Cholecystitis', supportsDisease: ['cholecystitis'], weight: 0.5, documentationPhrase: 'tender palpable gallbladder' },
    ],
  },
  {
    id: 'abd_spleen', section: 'organ_examination', sectionOrder: 30, cardNumber: 30,
    label: 'Spleen Palpation',
    question: 'Is the spleen palpable?',
    type: 'single_select',
    options: [
      { value: 'not_palpable', label: 'Not palpable', documentationPhrase: 'spleen is not palpable' },
      { value: 'palpable', label: 'Palpable', documentationPhrase: 'spleen is palpable' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [],
  },
  {
    id: 'abd_spleen_details', section: 'organ_examination', sectionOrder: 31, cardNumber: 31,
    label: 'Spleen Details',
    question: 'Splenic characteristics',
    type: 'multi_select',
    options: [
      { value: 'notch', label: 'Splenic notch palpable', documentationPhrase: 'splenic notch is palpable' },
      { value: 'firm', label: 'Firm consistency', documentationPhrase: 'firm spleen' },
      { value: 'tender', label: 'Tender', documentationPhrase: 'tender spleen' },
      { value: 'smooth', label: 'Smooth surface', documentationPhrase: 'smooth splenic surface' },
      { value: 'massive', label: 'Massive splenomegaly (crosses midline)', documentationPhrase: 'massive splenomegaly extending across the midline' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Splenomegaly', supportsDisease: ['malaria', 'leukemia', 'lymphoma', 'portal_hypertension', 'kala_azar'], weight: 0.5, documentationPhrase: 'splenomegaly' },
    ],
  },
  {
    id: 'abd_spleen_grade', section: 'organ_examination', sectionOrder: 32, cardNumber: 32,
    label: 'Splenomegaly Grade',
    question: 'Splenomegaly grading (cm below costal margin)',
    type: 'single_select',
    options: [
      { value: 'mild', label: 'Mild (1-3 cm)', documentationPhrase: 'mild splenomegaly (1-3 cm below costal margin)' },
      { value: 'moderate', label: 'Moderate (3-8 cm)', documentationPhrase: 'moderate splenomegaly (3-8 cm below costal margin)' },
      { value: 'severe', label: 'Severe (>8 cm / massive)', documentationPhrase: 'massive splenomegaly (>8 cm below costal margin)' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [],
  },
  {
    id: 'abd_kidneys', section: 'organ_examination', sectionOrder: 33, cardNumber: 33,
    label: 'Kidney Palpation',
    question: 'Ballotable kidneys',
    type: 'single_select',
    options: [
      { value: 'not_palpable', label: 'Not ballotable', documentationPhrase: 'kidneys are not ballotable' },
      { value: 'left_palpable', label: 'Left kidney ballotable', documentationPhrase: 'the left kidney is ballotable' },
      { value: 'right_palpable', label: 'Right kidney ballotable', documentationPhrase: 'the right kidney is ballotable' },
      { value: 'bilateral', label: 'Both kidneys ballotable', documentationPhrase: 'both kidneys are ballotable' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Renal enlargement', supportsDisease: ['polycystic_kidney', 'hydronephrosis', 'renal_tumour'], weight: 0.5, documentationPhrase: 'ballotable kidney' },
    ],
  },
  {
    id: 'abd_kidney_tenderness', section: 'organ_examination', sectionOrder: 34, cardNumber: 34,
    label: 'Renal Tenderness',
    question: 'Costovertebral angle tenderness',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no costovertebral angle tenderness' },
      { value: 'left', label: 'Left CVA tenderness', documentationPhrase: 'left costovertebral angle tenderness' },
      { value: 'right', label: 'Right CVA tenderness', documentationPhrase: 'right costovertebral angle tenderness' },
      { value: 'bilateral', label: 'Bilateral CVA tenderness', documentationPhrase: 'bilateral costovertebral angle tenderness' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Pyelonephritis', supportsDisease: ['pyelonephritis', 'uti', 'renal_colic'], weight: 0.6, documentationPhrase: 'costovertebral angle tenderness' },
    ],
  },
  {
    id: 'abd_bladder', section: 'organ_examination', sectionOrder: 35, cardNumber: 35,
    label: 'Bladder',
    question: 'Is the bladder distended?',
    type: 'single_select',
    options: [
      { value: 'not_distended', label: 'Not distended', documentationPhrase: 'bladder is not distended' },
      { value: 'distended', label: 'Distended (palpable/percussable)', documentationPhrase: 'bladder is distended' },
    ],
    documentationTemplate: 'The {value}.',
    contextVisibility: { alwaysShow: true },
    evidenceLinks: [
      { disease: 'Urinary retention', supportsDisease: ['urinary_retention', 'bph', 'neurogenic_bladder'], weight: 0.6, documentationPhrase: 'palpable bladder' },
    ],
  },
  {
    id: 'abd_aorta', section: 'organ_examination', sectionOrder: 36, cardNumber: 36,
    label: 'Abdominal Aorta',
    question: 'Abdominal aorta palpation',
    type: 'single_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'abdominal aorta is normal' },
      { value: 'aneurysmal', label: 'Aneurysmal (widened)', documentationPhrase: 'widened abdominal aorta suggestive of aneurysm' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { hideForAgeBands: ['neonate', 'infant', 'toddler', 'child'] },
    evidenceLinks: [
      { disease: 'AA aneurysm', supportsDisease: ['aa_aneurysm'], weight: 0.7, documentationPhrase: 'abdominal aortic aneurysm' },
    ],
  },

  // ══ PART 8: SPECIAL MANOEUVRES ══
  {
    id: 'abd_murphy', section: 'special_manoeuvres', sectionOrder: 37, cardNumber: 37,
    label: 'Murphy Sign',
    question: 'Murphy sign (catch in inspiration — RUQ)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'Murphy sign is negative' },
      { value: 'positive', label: 'Positive', documentationPhrase: 'Murphy sign is positive, suggesting cholecystitis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false, hideForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { disease: 'Cholecystitis', supportsDisease: ['cholecystitis'], weight: 0.7, documentationPhrase: 'positive Murphy sign' },
    ],
  },
  {
    id: 'abd_mcburney', section: 'special_manoeuvres', sectionOrder: 38, cardNumber: 38,
    label: 'McBurney Point',
    question: 'McBurney point tenderness',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'no McBurney point tenderness' },
      { value: 'positive', label: 'Positive', documentationPhrase: 'McBurney point tenderness is present' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false, hideForAgeBands: ['neonate', 'infant'] },
    evidenceLinks: [
      { disease: 'Appendicitis', supportsDisease: ['appendicitis'], weight: 0.6, documentationPhrase: 'McBurney point tenderness' },
    ],
  },
  {
    id: 'abd_rovsing', section: 'special_manoeuvres', sectionOrder: 39, cardNumber: 39,
    label: 'Rovsing Sign',
    question: 'Rovsing sign (RLQ pain with LLQ pressure)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'Rovsing sign is negative' },
      { value: 'positive', label: 'Positive', documentationPhrase: 'Rovsing sign is positive, suggesting appendicitis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false, hideForAgeBands: ['neonate', 'infant', 'toddler'] },
    evidenceLinks: [
      { disease: 'Appendicitis', supportsDisease: ['appendicitis'], weight: 0.5, documentationPhrase: 'positive Rovsing sign' },
    ],
  },
  {
    id: 'abd_psoas', section: 'special_manoeuvres', sectionOrder: 40, cardNumber: 40,
    label: 'Psoas Sign',
    question: 'Psoas sign (pain on hip extension)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'psoas sign is negative' },
      { value: 'positive', label: 'Positive', documentationPhrase: 'psoas sign is positive, suggesting retrocaecal appendicitis or psoas abscess' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false, hideForAgeBands: ['neonate', 'infant', 'toddler'] },
    evidenceLinks: [
      { disease: 'Appendicitis', supportsDisease: ['appendicitis', 'psoas_abscess'], weight: 0.5, documentationPhrase: 'positive psoas sign' },
    ],
  },
  {
    id: 'abd_obturator', section: 'special_manoeuvres', sectionOrder: 41, cardNumber: 41,
    label: 'Obturator Sign',
    question: 'Obturator sign (pain on internal rotation)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative', documentationPhrase: 'obturator sign is negative' },
      { value: 'positive', label: 'Positive', documentationPhrase: 'obturator sign is positive, suggesting pelvic appendicitis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false, hideForAgeBands: ['neonate', 'infant', 'toddler'] },
    evidenceLinks: [
      { disease: 'Appendicitis', supportsDisease: ['appendicitis'], weight: 0.5, documentationPhrase: 'positive obturator sign' },
    ],
  },
  {
    id: 'abd_carnett', section: 'special_manoeuvres', sectionOrder: 42, cardNumber: 42,
    label: 'Carnett Sign',
    question: 'Carnett sign (abdominal wall vs visceral pain)',
    type: 'single_select',
    options: [
      { value: 'negative', label: 'Negative (visceral)', documentationPhrase: 'Carnett sign is negative — pain likely visceral' },
      { value: 'positive', label: 'Positive (abdominal wall)', documentationPhrase: 'Carnett sign is positive — pain originates from abdominal wall' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { supportsDisease: ['abdominal_wall_pain', 'rectus_sheath_haematoma'], weight: 0.5, documentationPhrase: 'positive Carnett sign' },
    ],
  },
  {
    id: 'abd_succussion', section: 'special_manoeuvres', sectionOrder: 43, cardNumber: 43,
    label: 'Succussion Splash',
    question: 'Succussion splash (gastric outlet obstruction)',
    type: 'single_select',
    options: [
      { value: 'absent', label: 'Absent', documentationPhrase: 'no succussion splash' },
      { value: 'present', label: 'Present', documentationPhrase: 'succussion splash is present, suggesting gastric outlet obstruction' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { alwaysShow: false },
    evidenceLinks: [
      { disease: 'Gastric outlet obstruction', supportsDisease: ['gastric_outlet_obstruction', 'pyloric_stenosis', 'gastric_cancer'], weight: 0.6, documentationPhrase: 'succussion splash' },
    ],
  },

  // ══ NEONATAL-SPECIFIC CARDS ══
  {
    id: 'abd_neonatal', section: 'inspection', sectionOrder: 44, cardNumber: 44,
    label: 'Neonatal Abdominal Inspection',
    question: 'Neonatal abdominal assessment',
    type: 'multi_select',
    options: [
      { value: 'normal', label: 'Normal', documentationPhrase: 'neonatal abdomen is normal' },
      { value: 'cord_normal', label: 'Cord normal', documentationPhrase: 'umbilical cord is normal' },
      { value: 'cord_infected', label: 'Cord infected', documentationPhrase: 'umbilical cord with signs of infection' },
      { value: 'cord_granuloma', label: 'Cord granuloma', documentationPhrase: 'umbilical granuloma' },
      { value: 'abdominal_wall_defect', label: 'Abdominal wall defect', documentationPhrase: 'abdominal wall defect' },
      { value: 'scaphoid', label: 'Scaphoid abdomen (CDH)', documentationPhrase: 'scaphoid abdomen suggesting congenital diaphragmatic hernia' },
      { value: 'distended', label: 'Distended', documentationPhrase: 'abdominal distension' },
      { value: 'visible_veins', label: 'Prominent abdominal veins', documentationPhrase: 'prominent abdominal veins' },
      { value: 'omphalocele', label: 'Omphalocele', documentationPhrase: 'omphalocele' },
      { value: 'gastroschisis', label: 'Gastroschisis', documentationPhrase: 'gastroschisis' },
    ],
    documentationTemplate: '{value}.',
    contextVisibility: { showForAgeBands: ['neonate'] },
    evidenceLinks: [
      { mechanism: 'Congenital anomaly', supportsDisease: ['congenital_diaphragmatic_hernia', 'omphalocele', 'gastroschisis', 'nec'], weight: 0.6, documentationPhrase: 'neonatal abdominal abnormality' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// FILTER CARDS BY AGE, SEX, PREGNANCY, MODE
// ─────────────────────────────────────────────────────────────────

export function filterAbdCards(
  cards: AbdCardDef[],
  ctx: AbdContext,
  mode: AbdExamMode,
): AbdCardDef[] {
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

export function getAbdExpandedCardIds(
  findings: Record<string, unknown>,
  cards: AbdCardDef[],
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
// CHECK IF SCREENING → PRIMARY AUTO-ESCALATION IS NEEDED
// ─────────────────────────────────────────────────────────────────

export function shouldEscalateAbdToPrimary(findings: Record<string, unknown>): boolean {
  const escalationFindings = [
    'scr_abd_distension', 'scr_abd_tenderness', 'scr_abd_masses',
    'scr_abd_organomegaly', 'scr_abd_bowel_sounds',
  ];
  for (const fId of escalationFindings) {
    const val = findings[fId];
    if (val != null && val !== '' && val !== false) {
      const strVal = String(val);
      if (strVal !== 'non_distended' && strVal !== 'none' &&
          strVal !== 'normal' && strVal !== 'symmetrical') {
        return true;
      }
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────
// GENERATE ABDOMINAL NARRATIVE
// ─────────────────────────────────────────────────────────────────

export function generateAbdominalNarrative(
  cards: AbdCardDef[],
  findings: Record<string, unknown>,
  mode: AbdExamMode,
): string {
  if (mode === 'secondary') {
    const distension = findings['scr_abd_distension'];
    const tenderness = findings['scr_abd_tenderness'];
    const masses = findings['scr_abd_masses'];
    const organomegaly = findings['scr_abd_organomegaly'];
    const bowelSounds = findings['scr_abd_bowel_sounds'];

    const hasAbnormal =
      (distension && String(distension) !== 'non_distended') ||
      (tenderness && String(tenderness) !== 'none') ||
      (masses && String(masses) !== 'none') ||
      (organomegaly && String(organomegaly) !== 'none') ||
      (bowelSounds && String(bowelSounds) !== 'normal');

    if (hasAbnormal) {
      const parts: string[] = ['**Abdomen:**'];
      if (distension && String(distension) !== 'non_distended') parts.push(findAbdDocPhrase(cards, 'scr_abd_distension', distension));
      if (tenderness && String(tenderness) !== 'none') parts.push(findAbdDocPhrase(cards, 'scr_abd_tenderness', tenderness));
      if (masses && String(masses) !== 'none') parts.push(findAbdDocPhrase(cards, 'scr_abd_masses', masses));
      if (organomegaly && String(organomegaly) !== 'none') parts.push(findAbdDocPhrase(cards, 'scr_abd_organomegaly', organomegaly));
      if (bowelSounds && String(bowelSounds) !== 'normal') parts.push(findAbdDocPhrase(cards, 'scr_abd_bowel_sounds', bowelSounds));
      return parts.join(' ');
    }

    return '**Abdomen:** The abdomen is non-distended and moves normally with respiration. It is soft and non-tender on palpation with no palpable masses or organomegaly. Bowel sounds are present and normal.';
  }

  const sections: AbdSection[] = [
    'inspection', 'auscultation', 'percussion', 'palpation_superficial',
    'palpation_deep', 'organ_examination', 'special_manoeuvres',
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
        if (v === 'none' || v === 'absent' || v === 'negative' || v === 'not_palpable' || v === 'not_distended') continue;
        const phrase = findAbdDocPhrase(cards, card.id, v);
        if (phrase) phrases.push(phrase);
      }
    }

    if (phrases.length > 0) {
      paraParts.push(phrases.join('; '));
    }
  }

  if (paraParts.length === 0) {
    return '**Abdomen:** The abdomen is flat and moves normally with respiration. It is soft and non-tender on palpation with no palpable masses or organomegaly. Bowel sounds are present and normal. Percussion is tympanic throughout. No organomegaly is detected.';
  }

  return '**Abdominal Examination:** ' + paraParts.join('. ');
}

function findAbdDocPhrase(cards: AbdCardDef[], cardId: string, value: unknown): string {
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

export interface AbdEvidenceGraphNode {
  finding: string;
  findingLabel: string;
  mechanisms: string[];
  phenotypes: string[];
  diseases: string[];
  investigations: string[];
  monitoring: string[];
}

export function buildAbdEvidenceGraph(
  findings: Record<string, unknown>,
  cards: AbdCardDef[],
): AbdEvidenceGraphNode[] {
  const graph: AbdEvidenceGraphNode[] = [];

  for (const card of cards) {
    const val = findings[card.id];
    if (val == null || val === '' || val === false) continue;
    if (card.evidenceLinks.length === 0) continue;

    const mechanisms = [...new Set(card.evidenceLinks.map(l => l.mechanism).filter(Boolean))] as string[];
    const phenotypes = [...new Set(card.evidenceLinks.map(l => l.phenotype).filter(Boolean))] as string[];
    const diseases = [...new Set(card.evidenceLinks.flatMap(l => l.supportsDisease))];

    const node: AbdEvidenceGraphNode = {
      finding: card.id,
      findingLabel: card.label,
      mechanisms,
      phenotypes,
      diseases,
      investigations: getAbdInvestigations(diseases),
      monitoring: ['Abdominal exam', 'Pain assessment', 'Vital signs'],
    };
    graph.push(node);
  }

  return graph;
}

function getAbdInvestigations(diseases: string[]): string[] {
  const map: Record<string, string[]> = {
    appendicitis: ['CBC', 'CRP', 'Abdominal US', 'CT abdomen'],
    cholecystitis: ['CBC', 'LFTs', 'Abdominal US', 'MRCP'],
    pancreatitis: ['Lipase', 'Amylase', 'CBC', 'LFTs', 'CT abdomen'],
    hepatitis: ['LFTs', 'Viral serology', 'Abdominal US'],
    cirrhosis: ['LFTs', 'PT/INR', 'Albumin', 'Abdominal US', 'FibroScan'],
    peritonitis: ['CBC', 'CRP', 'Abdominal X-ray', 'CT abdomen', 'Diagnostic tap'],
    intestinal_obstruction: ['CBC', 'Abdominal X-ray', 'CT abdomen'],
    ascites: ['Abdominal US', 'Diagnostic tap', 'SAAG', 'LFTs'],
    splenomegaly: ['CBC', 'Peripheral smear', 'Abdominal US', 'CT'],
    aa_aneurysm: ['Abdominal US', 'CT aortogram'],
    pyelonephritis: ['Urinalysis', 'Urine culture', 'CBC', 'Renal US'],
    hernia: ['Clinical diagnosis', 'Abdominal US'],
    gastric_cancer: ['Upper GI endoscopy', 'CT abdomen', 'Biopsy'],
    hcc: ['AFP', 'Triphasic CT', 'Abdominal US'],
  };
  const invs = new Set<string>();
  for (const d of diseases) {
    if (map[d]) {
      for (const inv of map[d]) invs.add(inv);
    }
  }
  return [...invs];
}
