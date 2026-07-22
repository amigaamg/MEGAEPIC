// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Examination Schema Registry — field definitions per body system
// ═══════════════════════════════════════════════════════════════════════════════
// This is the single source of "what to examine and how to capture it."
// Mirrors symptomSchemas.ts but for physical examination.
// Each body system (GI, Respiratory, CVS, CNS, MSK) has its own schema.
// Examination follows: Inspection → Palpation → Percussion → Auscultation → Special Signs
// ═══════════════════════════════════════════════════════════════════════════════

// ── Field Types ──────────────────────────────────────────────────────────────

export type ExamFieldType = 'boolean' | 'select' | 'text' | 'number' | 'multi_select';

export type ExamPhase =
  | 'inspection'
  | 'palpation'
  | 'deep_palpation'
  | 'percussion'
  | 'auscultation'
  | 'special_signs'
  | 'dre'
  | 'inguinal';

export type FindingSignificance = 'normal_variant' | 'abnormal' | 'danger' | 'critical';

export interface ExamField {
  id: string;
  label: string;
  shortLabel: string;
  type: ExamFieldType;
  options?: string[];
  /** If true, must be documented before this system is considered examined */
  mandatory: boolean;
  /** Clinical priority: critical findings must always be assessed first */
  priority: 'critical' | 'high' | 'medium' | 'low';
  /** Which phase of examination this belongs to */
  phase: ExamPhase;
  /** If this field only applies when another field has a specific value */
  dependsOn?: { field: string; value: string | boolean };
  /** Clinical interpretation guide — what this finding means */
  clinicalGuide?: string;
  /** Significance level for alerting */
  significance?: FindingSignificance;
  /** Diseases associated with this finding (for DDx mapping) */
  associatedDifferentials?: string[];
  /** What to do if this finding is present */
  recommendedAction?: string;
}

// ── Exam Schema — complete field requirements for one body system ───────────

export interface ExamSchema {
  systemId: string;
  label: string;
  description: string;
  fields: ExamField[];
  /** Minimum fields needed before examination of this system is adequate */
  minimumForAdequacy: string[];
  /** Fields that must be documented for completeness */
  requiredForCompletion: string[];
  /** Which ROS/history findings should trigger this exam */
  activatedBySymptoms: string[];
  /** Which chief complaint keywords should trigger this exam */
  activatedByCCKeywords: string[];
}

// ── GI System — Complete Abdominal Examination Schema ────────────────────
// Following Hutchison's Clinical Methods approach:
// Inspection → Palpation (superficial → deep) → Percussion → Auscultation → Special Signs
// ══════════════════════════════════════════════════════════════════════════

const GI_INSPECTION_FIELDS: ExamField[] = [
  // ── General Inspection ────────────────────────────────────────────────
  {
    id: 'contour',
    label: 'Abdominal contour',
    shortLabel: 'Contour',
    type: 'select',
    options: ['flat', 'scaphoid', 'distended', 'obese', 'protuberant'],
    mandatory: true,
    priority: 'high',
    phase: 'inspection',
    clinicalGuide: 'Scaphoid suggests malnutrition/cachexia. Distended suggests ascites, obstruction, or mass. Protuberant may be obesity or organomegaly.',
    associatedDifferentials: ['ascites', 'intestinal_obstruction', 'hepatomegaly', 'splenomegaly', 'malnutrition'],
  },
  {
    id: 'distensionPattern',
    label: 'Pattern of distension',
    shortLabel: 'Distension pattern',
    type: 'select',
    options: ['generalized', 'upper_abdomen', 'lower_abdomen', 'flanks', 'localized_mass', 'not_distended'],
    mandatory: false,
    priority: 'medium',
    phase: 'inspection',
    dependsOn: { field: 'contour', value: 'distended' },
    clinicalGuide: 'Generalized with flank fullness = ascites. Upper = gastric/distal oesophageal. Lower = ovarian/uterine/bladder. Localized = mass or hernia.',
  },
  {
    id: 'abdominalScars',
    label: 'Abdominal scars',
    shortLabel: 'Scars',
    type: 'multi_select',
    options: ['midline_laparotomy', 'pfannenstiel', 'right_iliac_fossa', 'left_iliac_fossa', 'subcostal_kocher', 'paramedian', 'umbilical_hernia_repair', 'inguinal_hernia_repair', 'laparoscopic_port_sites', 'stoma', 'drain_site', 'none'],
    mandatory: true,
    priority: 'high',
    phase: 'inspection',
    clinicalGuide: 'Previous surgical history should correlate with scars present. Kocher = biliary surgery. RIF = appendicectomy. Midline = exploratory laparotomy.',
  },
  {
    id: 'striae',
    label: 'Striae',
    shortLabel: 'Striae',
    type: 'select',
    options: ['none', 'pink_recent', 'silver_old', 'purple_cushings'],
    mandatory: false,
    priority: 'medium',
    phase: 'inspection',
    clinicalGuide: 'Pink/purple striae suggest Cushings or rapid weight gain. Silver striae are old/physiological (pregnancy, growth).',
    significance: 'abnormal',
    associatedDifferentials: ['cushings_syndrome', 'pregnancy', 'obesity'],
  },
  {
    id: 'visibleVeins',
    label: 'Visible abdominal veins',
    shortLabel: 'Visible veins',
    type: 'select',
    options: ['none', 'dilated_non_tortuous', 'dilated_tortuous', 'superior_to_umbilicus', 'inferior_to_umbilicus'],
    mandatory: false,
    priority: 'medium',
    phase: 'inspection',
    clinicalGuide: 'Dilated tortuous veins radiating from umbilicus (caput medusae) = portal hypertension. Veins filling from below = IVC obstruction.',
    significance: 'abnormal',
    associatedDifferentials: ['portal_hypertension', 'ivc_obstruction', 'cirrhosis'],
  },
  {
    id: 'caputMedusae',
    label: 'Caput medusae',
    shortLabel: 'Caput medusae',
    type: 'boolean',
    mandatory: false,
    priority: 'high',
    phase: 'inspection',
    clinicalGuide: 'Distended, tortuous veins radiating from umbilicus — pathognomonic for portal hypertension with collateral circulation.',
    significance: 'danger',
    associatedDifferentials: ['portal_hypertension', 'cirrhosis', 'schistosomiasis'],
    recommendedAction: 'Assess for other signs of chronic liver disease. Check LFTs, coagulation, platelets.',
  },
  {
    id: 'visiblePeristalsis',
    label: 'Visible peristalsis',
    shortLabel: 'Visible peristalsis',
    type: 'boolean',
    mandatory: false,
    priority: 'high',
    phase: 'inspection',
    clinicalGuide: 'Visible peristalsis in adults suggests intestinal obstruction. In thin individuals may be normal. In infants, visible peristalsis with vomiting suggests pyloric stenosis.',
    significance: 'abnormal',
    associatedDifferentials: ['intestinal_obstruction', 'pyloric_stenosis'],
  },
  {
    id: 'hernialOrifices',
    label: 'Hernial orifices',
    shortLabel: 'Herniae',
    type: 'select',
    options: ['normal', 'inguinal_hernia', 'umbilical_hernia', 'incisional_hernia', 'epigastric_hernia', 'femoral_hernia', 'spigelian_hernia', 'multiple'],
    mandatory: true,
    priority: 'high',
    phase: 'inspection',
    clinicalGuide: 'Always inspect hernial orifices. Femoral hernias have higher strangulation risk than inguinal. Cough impulse suggests reducible hernia.',
  },
  {
    id: 'umbilicus',
    label: 'Umbilicus appearance',
    shortLabel: 'Umbilicus',
    type: 'select',
    options: ['normal_inverted', 'everted', 'inflamed', 'herniated', 'discharge', 'nodule_sister_mary_joseph'],
    mandatory: false,
    priority: 'medium',
    phase: 'inspection',
    clinicalGuide: 'Everted umbilicus suggests ascites. Sister Mary Joseph nodule (umbilical metastasis) suggests intra-abdominal malignancy (commonly gastric, ovarian, colorectal).',
    significance: 'abnormal',
    associatedDifferentials: ['ascites', 'gastric_cancer', 'ovarian_cancer', 'colorectal_cancer'],
  },
  {
    id: 'flankFullness',
    label: 'Flank fullness',
    shortLabel: 'Flank fullness',
    type: 'boolean',
    mandatory: false,
    priority: 'high',
    phase: 'inspection',
    clinicalGuide: 'Bilateral flank fullness is classic for ascites. Unilateral flank fullness may suggest psoas abscess, retroperitoneal mass, or renal enlargement.',
    significance: 'abnormal',
    associatedDifferentials: ['ascites', 'psoas_abscess', 'retroperitoneal_mass', 'nephromegaly'],
  },
  {
    id: 'skinChanges',
    label: 'Skin changes on abdomen',
    shortLabel: 'Skin changes',
    type: 'multi_select',
    options: ['normal', 'rash', 'pigmentation', 'sinus', 'fistula', 'excoriations', 'cellulitis', 'dermatitis'],
    mandatory: false,
    priority: 'medium',
    phase: 'inspection',
    clinicalGuide: 'Excoriations may indicate scabies or cholestatic pruritus. Sinus may connect to deep abscess or inflammatory bowel disease. Fistula suggests Crohn disease.',
  },
  {
    id: 'cullensSign',
    label: "Cullen's sign — periumbilical bruising",
    shortLabel: "Cullen's sign",
    type: 'boolean',
    mandatory: false,
    priority: 'critical',
    phase: 'inspection',
    clinicalGuide: "Periumbilical ecchymosis — indicates retroperitoneal haemorrhage (pancreatitis, ruptured AAA, ectopic pregnancy). Surgical emergency.",
    significance: 'critical',
    associatedDifferentials: ['acute_haemorrhagic_pancreatitis', 'ruptured_aaa', 'ruptured_ectopic'],
    recommendedAction: 'Immediate surgical consult. CT abdomen. Full blood count, cross-match, amylase.',
  },
  {
    id: 'greyTurnerSign',
    label: "Grey-Turner's sign — flank bruising",
    shortLabel: "Grey-Turner sign",
    type: 'boolean',
    mandatory: false,
    priority: 'critical',
    phase: 'inspection',
    clinicalGuide: "Flank ecchymosis — indicates retroperitoneal haemorrhage. Most commonly associated with severe acute pancreatitis. Also seen in ruptured AAA.",
    significance: 'critical',
    associatedDifferentials: ['acute_haemorrhagic_pancreatitis', 'ruptured_aaa', 'retroperitoneal_haematoma'],
    recommendedAction: 'Immediate surgical consult. CT abdomen. Haemodynamic monitoring.',
  },
];

const GI_PALPATION_FIELDS: ExamField[] = [
  // ── Superficial Palpation ─────────────────────────────────────────────
  {
    id: 'tenderness',
    label: 'Abdominal tenderness',
    shortLabel: 'Tenderness',
    type: 'select',
    options: ['none', 'localized', 'generalized', 'rebound_present'],
    mandatory: true,
    priority: 'high',
    phase: 'palpation',
    clinicalGuide: 'Localized tenderness suggests underlying organ pathology. Generalized + rebound = peritonitis until proven otherwise. Rebound = peritoneal irritation.',
    significance: 'abnormal',
    associatedDifferentials: ['peritonitis', 'appendicitis', 'cholecystitis', 'diverticulitis', 'pancreatitis'],
  },
  {
    id: 'tendernessLocation',
    label: 'Location of tenderness',
    shortLabel: 'Tender area',
    type: 'multi_select',
    options: ['right_hypochondrium', 'epigastrium', 'left_hypochondrium', 'right_lumbar', 'umbilical', 'left_lumbar', 'right_iliac_fossa', 'hypogastrium', 'left_iliac_fossa', 'generalized'],
    mandatory: false,
    priority: 'high',
    phase: 'palpation',
    dependsOn: { field: 'tenderness', value: 'localized' },
    clinicalGuide: 'RUQ = liver/gallbladder. Epigastric = stomach/pancreas/duodenum. RIF = appendix/caecum. LIF = sigmoid/diverticulitis. Hypogastric = bladder/uterus.',
    associatedDifferentials: ['cholecystitis', 'appendicitis', 'diverticulitis', 'pancreatitis', 'gastritis', 'pid', 'cystitis'],
  },
  {
    id: 'guarding',
    label: 'Guarding',
    shortLabel: 'Guarding',
    type: 'select',
    options: ['none', 'voluntary', 'involuntary_rigidity'],
    mandatory: true,
    priority: 'high',
    phase: 'palpation',
    clinicalGuide: 'Voluntary guarding = patient guarding (can relax with breathing). Involuntary rigidity = true peritonism (persistent, board-like). Board-like rigidity is a surgical emergency.',
    significance: 'danger',
    associatedDifferentials: ['peritonitis', 'perforated_viscus', 'acute_abdomen'],
    recommendedAction: 'Involuntary rigidity requires immediate surgical assessment. Erect CXR for free air. Full blood count, amylase.',
  },
  {
    id: 'mcburneysTenderness',
    label: "McBurney's point tenderness",
    shortLabel: "McBurney's point",
    type: 'boolean',
    mandatory: false,
    priority: 'high',
    phase: 'palpation',
    clinicalGuide: "Tenderness at McBurney's point (2/3 distance from umbilicus to ASIS) is classic for acute appendicitis. Sensitivity ~50-60%, specificity ~80%.",
    significance: 'abnormal',
    associatedDifferentials: ['acute_appendicitis'],
  },
  {
    id: 'rovsignsSign',
    label: "Rovsing's sign",
    shortLabel: "Rovsing's sign",
    type: 'select',
    options: ['not_assessed', 'negative', 'positive'],
    mandatory: false,
    priority: 'medium',
    phase: 'palpation',
    clinicalGuide: "Pain in RIF when palpating LIF = Rovsing's sign positive. Suggests peritoneal irritation from appendicitis. Moderate specificity.",
    significance: 'abnormal',
    associatedDifferentials: ['acute_appendicitis'],
  },
  {
    id: 'psoasSign',
    label: "Psoas sign (iliopsoas irritation)",
    shortLabel: "Psoas sign",
    type: 'select',
    options: ['not_assessed', 'negative', 'positive'],
    mandatory: false,
    priority: 'medium',
    phase: 'palpation',
    clinicalGuide: 'Pain on passive extension of right hip = positive psoas sign. Suggests retrocaecal appendicitis or psoas abscess.',
    significance: 'abnormal',
    associatedDifferentials: ['retrocaecal_appendicitis', 'psoas_abscess'],
  },
  {
    id: 'obturatorSign',
    label: "Obturator sign",
    shortLabel: "Obturator sign",
    type: 'select',
    options: ['not_assessed', 'negative', 'positive'],
    mandatory: false,
    priority: 'medium',
    phase: 'palpation',
    clinicalGuide: 'Pain on internal rotation of flexed right hip = positive obturator sign. Suggests pelvic appendicitis or pelvic inflammatory mass.',
    significance: 'abnormal',
    associatedDifferentials: ['pelvic_appendicitis', 'pelvic_inflammatory_disease', 'tubo_ovarian_abscess'],
  },
  {
    id: 'murphysSign',
    label: "Murphy's sign",
    shortLabel: "Murphy's sign",
    type: 'select',
    options: ['not_assessed', 'negative', 'positive'],
    mandatory: false,
    priority: 'high',
    phase: 'palpation',
    clinicalGuide: 'Inspiratory arrest on deep palpation of RUQ = positive Murphy\'s sign. Highly specific for acute cholecystitis (specificity ~95%).',
    significance: 'abnormal',
    associatedDifferentials: ['acute_cholecystitis'],
  },
  {
    id: 'blumbergSign',
    label: "Blumberg's sign (rebound tenderness)",
    shortLabel: "Blumberg's sign",
    type: 'select',
    options: ['not_assessed', 'negative', 'positive'],
    mandatory: false,
    priority: 'high',
    phase: 'palpation',
    clinicalGuide: 'Pain on sudden release of deep pressure = positive Blumberg sign. Indicates parietal peritoneal inflammation. Core sign of peritonitis.',
    significance: 'danger',
    associatedDifferentials: ['peritonitis', 'perforated_viscus', 'acute_abdomen'],
    recommendedAction: 'Positive Blumberg sign with other peritonism signs = surgical abdomen. Urgent surgical consult.',
  },

  // ── Deep Palpation ────────────────────────────────────────────────────
  {
    id: 'liverPalpable',
    label: 'Liver — palpable?',
    shortLabel: 'Liver palpable?',
    type: 'boolean',
    mandatory: true,
    priority: 'high',
    phase: 'deep_palpation',
    clinicalGuide: 'Palpable liver below costal margin = hepatomegaly. Measure span in cm from upper border (percussion) to lower border (palpation). Normal span 6-12 cm at midclavicular line.',
    significance: 'abnormal',
  },
  {
    id: 'liverSpan',
    label: 'Liver span (cm)',
    shortLabel: 'Liver span',
    type: 'number',
    mandatory: false,
    priority: 'high',
    phase: 'deep_palpation',
    dependsOn: { field: 'liverPalpable', value: true },
    clinicalGuide: 'Normal liver span: 6-12 cm MCL. >12 cm = hepatomegaly. <6 cm = small liver (cirrhosis). Measure from upper border (percussion) to lower edge (palpation).',
  },
  {
    id: 'liverSurface',
    label: 'Liver surface',
    shortLabel: 'Liver surface',
    type: 'select',
    options: ['smooth', 'nodular', 'irregular', 'hard'],
    mandatory: false,
    priority: 'high',
    phase: 'deep_palpation',
    dependsOn: { field: 'liverPalpable', value: true },
    clinicalGuide: 'Smooth = congestion/hepatitis. Nodular = cirrhosis or metastases. Irregular/hard = malignancy (hepatocellular carcinoma, metastatic disease).',
    significance: 'abnormal',
    associatedDifferentials: ['cirrhosis', 'hepatocellular_carcinoma', 'liver_metastases', 'hepatitis'],
  },
  {
    id: 'liverEdge',
    label: 'Liver edge',
    shortLabel: 'Liver edge',
    type: 'select',
    options: ['sharp', 'rounded', 'irregular', 'tender'],
    mandatory: false,
    priority: 'medium',
    phase: 'deep_palpation',
    dependsOn: { field: 'liverPalpable', value: true },
    clinicalGuide: 'Sharp edge = normal/cirrhosis. Rounded/tender = acute congestion (right heart failure, acute hepatitis). Irregular = malignancy.',
    associatedDifferentials: ['right_heart_failure', 'acute_hepatitis', 'cirrhosis', 'hcc'],
  },
  {
    id: 'liverTenderness',
    label: 'Liver tenderness',
    shortLabel: 'Liver tender?',
    type: 'boolean',
    mandatory: false,
    priority: 'high',
    phase: 'deep_palpation',
    dependsOn: { field: 'liverPalpable', value: true },
    clinicalGuide: 'Tender hepatomegaly suggests acute hepatitis, congestive hepatomegaly, or hepatic abscess. Non-tender hepatomegaly suggests cirrhosis, malignancy, or infiltrative disease.',
    significance: 'abnormal',
    associatedDifferentials: ['acute_hepatitis', 'hepatic_abscess', 'right_heart_failure', 'cirrhosis'],
  },
  {
    id: 'spleenPalpable',
    label: 'Spleen — palpable?',
    shortLabel: 'Spleen palpable?',
    type: 'boolean',
    mandatory: true,
    priority: 'high',
    phase: 'deep_palpation',
    clinicalGuide: 'Spleen must be >2x normal size to be palpable. Palpable spleen = splenomegaly. Start palpation from RIF, moving diagonally toward LUQ. Cannot be palpated above the costal margin.',
    significance: 'abnormal',
    associatedDifferentials: ['splenomegaly', 'malaria', 'leukaemia', 'lymphoma', 'portal_hypertension', 'sickle_cell'],
  },
  {
    id: 'spleenGrade',
    label: 'Spleen grade (Hackett)',
    shortLabel: 'Spleen grade',
    type: 'select',
    options: ['not_palpable', 'just_palpable_deep_inspiration', 'palpable_midway_umbilicus', 'palpable_to_umbilicus', 'palpable_beyond_umbilicus', 'extends_into_pelvis'],
    mandatory: false,
    priority: 'high',
    phase: 'deep_palpation',
    dependsOn: { field: 'spleenPalpable', value: true },
    clinicalGuide: 'Hackett grading: 1=just palpable on deep inspiration, 2=midway to umbilicus, 3=at umbilicus, 4=beyond umbilicus, 5=into pelvis. Massive splenomegaly = malaria, leishmaniasis, CML, myelofibrosis.',
  },
  {
    id: 'spleenTenderness',
    label: 'Spleen tenderness',
    shortLabel: 'Spleen tender?',
    type: 'boolean',
    mandatory: false,
    priority: 'medium',
    phase: 'deep_palpation',
    dependsOn: { field: 'spleenPalpable', value: true },
    clinicalGuide: 'Tender splenomegaly suggests splenic infarct, perisplenitis, or splenic abscess. Splenic rupture may present with left upper quadrant pain and Kehr sign.',
    significance: 'abnormal',
    associatedDifferentials: ['splenic_infarct', 'splenic_abscess', 'splenic_rupture'],
  },
  {
    id: 'kidneysPalpable',
    label: 'Kidneys — ballotable?',
    shortLabel: 'Kidneys',
    type: 'select',
    options: ['not_palpable', 'right_ballotable', 'left_ballotable', 'both_ballotable'],
    mandatory: false,
    priority: 'medium',
    phase: 'deep_palpation',
    clinicalGuide: 'Ballotable kidney suggests renal enlargement (hydronephrosis, polycystic, tumour, solitary). Bimanual palpation: one hand posterior (loin), one hand anterior. Normal kidneys are usually not palpable.',
    significance: 'abnormal',
    associatedDifferentials: ['hydronephrosis', 'polycystic_kidney_disease', 'renal_cell_carcinoma', 'nephromegaly'],
  },
  {
    id: 'abdominalMass',
    label: 'Abdominal mass — present?',
    shortLabel: 'Abdominal mass?',
    type: 'boolean',
    mandatory: true,
    priority: 'high',
    phase: 'deep_palpation',
    clinicalGuide: 'Characterize any mass: location, size, shape, consistency (hard/firm/soft/cystic), surface (smooth/nodular), edge (sharp/rounded), mobility, tenderness, pulsatility, respiratory movement, and bruit.',
    significance: 'abnormal',
    associatedDifferentials: ['abdominal_malignancy', 'ovarian_cyst', 'aaa', 'mesenteric_cyst', 'renal_tumour'],
  },
  {
    id: 'massLocation',
    label: 'Mass location',
    shortLabel: 'Mass location',
    type: 'select',
    options: ['ruq', 'epigastric', 'luq', 'right_flank', 'umbilical', 'left_flank', 'rif', 'hypogastric', 'lif', 'generalized'],
    mandatory: false,
    priority: 'high',
    phase: 'deep_palpation',
    dependsOn: { field: 'abdominalMass', value: true },
    clinicalGuide: 'RUQ mass = liver/gallbladder. Epigastric = stomach/pancreas/transverse colon. LUQ = spleen. Flank = kidney/colon. RIF = appendix/caecum. LIF = sigmoid. Hypogastric = bladder/uterus/ovaries.',
  },
  {
    id: 'massConsistency',
    label: 'Mass consistency',
    shortLabel: 'Mass consistency',
    type: 'select',
    options: ['soft', 'firm', 'hard_irregular', 'cystic', 'pulsatile'],
    mandatory: false,
    priority: 'high',
    phase: 'deep_palpation',
    dependsOn: { field: 'abdominalMass', value: true },
    clinicalGuide: 'Hard/irregular = malignancy. Cystic = ovarian cyst, pancreatic pseudocyst, mesenteric cyst. Pulsatile = AAA (expansile, not transmitted). Firm = inflammatory mass or benign tumour.',
    associatedDifferentials: ['malignancy', 'ovarian_cyst', 'aaa', 'pancreatic_pseudocyst', 'inflammatory_mass'],
  },
  {
    id: 'massMobility',
    label: 'Mass mobility',
    shortLabel: 'Mass mobility',
    type: 'select',
    options: ['mobile', 'fixed', 'moves_with_respiration'],
    mandatory: false,
    priority: 'medium',
    phase: 'deep_palpation',
    dependsOn: { field: 'abdominalMass', value: true },
    clinicalGuide: 'Fixed mass suggests malignant infiltration into retroperitoneum. Mobile with respiration suggests liver, spleen, or kidney origin. Non-respiratory mobile = bowel/ovarian/mesenteric.',
  },
  {
    id: 'aorticWidth',
    label: 'Abdominal aorta — palpable width',
    shortLabel: 'Aortic width',
    type: 'select',
    options: ['normal_not_palpable', 'palpable_normal_width', 'wide_expansile', 'tender'],
    mandatory: true,
    priority: 'high',
    phase: 'deep_palpation',
    clinicalGuide: 'Normal aorta may be palpable in thin individuals. Expansile pulsation >3 cm width = AAA until proven otherwise. Tender AAA = expanding/leaking — surgical emergency.',
    significance: 'danger',
    associatedDifferentials: ['abdominal_aortic_aneurysm', 'aortic_rupture'],
    recommendedAction: 'If wide/expansile: urgent ultrasound within 1 hour. If tender: immediate surgical consult. Do NOT press deeply on a known/worrisome AAA.',
  },
];

const GI_PERCUSSION_FIELDS: ExamField[] = [
  {
    id: 'percussionNote',
    label: 'General percussion note',
    shortLabel: 'Percussion note',
    type: 'select',
    options: ['tympanic', 'dull', 'shifting_dullness', 'hyperresonant'],
    mandatory: true,
    priority: 'high',
    phase: 'percussion',
    clinicalGuide: 'Tympanic = normal (gas-filled bowel). Dull = solid organ, mass, or fluid. Shifting dullness = ascites (>500 mL fluid). Hyperresonant = gaseous distension/obstruction.',
    significance: 'abnormal',
    associatedDifferentials: ['ascites', 'intestinal_obstruction', 'abdominal_mass', 'organomegaly'],
  },
  {
    id: 'shiftingDullness',
    label: 'Shifting dullness',
    shortLabel: 'Shifting dullness?',
    type: 'boolean',
    mandatory: false,
    priority: 'high',
    phase: 'percussion',
    clinicalGuide: 'Positive = ascites (minimum ~500 mL). Percuss from resonant to dull, then turn patient laterally and re-percuss. Dullness shifts with gravity = free fluid. Does not shift = loculated fluid/solid mass.',
    significance: 'abnormal',
    associatedDifferentials: ['ascites', 'liver_disease', 'heart_failure', 'peritoneal_carcinomatosis', 'tb_abdomen'],
  },
  {
    id: 'fluidThrill',
    label: 'Fluid thrill',
    shortLabel: 'Fluid thrill?',
    type: 'boolean',
    mandatory: false,
    priority: 'medium',
    phase: 'percussion',
    clinicalGuide: 'Positive fluid thrill indicates tense ascites (large volume). One hand on flank, flick opposite flank, feel transmitted impulse. An assistant\'s hand on midline interrupts transmission through fat (not fluid).',
    significance: 'abnormal',
    associatedDifferentials: ['tense_ascites', 'cirrhosis', 'peritoneal_carcinomatosis'],
  },
  {
    id: 'liverSpanPercussion',
    label: 'Liver span by percussion (cm)',
    shortLabel: 'Liver span',
    type: 'number',
    mandatory: false,
    priority: 'medium',
    phase: 'percussion',
    clinicalGuide: 'Measure from upper border (dull to resonant at 5th intercostal space MCL) to lower border (dull to tympanic). Normal = 6-12 cm MCL. Correlate with palpation.',
  },
  {
    id: 'splenicDullness',
    label: 'Splenic dullness',
    shortLabel: 'Splenic dullness',
    type: 'boolean',
    mandatory: false,
    priority: 'medium',
    phase: 'percussion',
    clinicalGuide: 'Percuss in lowest intercostal space, anterior axillary line. Dullness = splenomegaly (Traube space dullness). Not reliable alone — confirm with palpation.',
    significance: 'abnormal',
    associatedDifferentials: ['splenomegaly'],
  },
  {
    id: 'bladderDullness',
    label: 'Bladder dullness (suprapubic)',
    shortLabel: 'Bladder',
    type: 'boolean',
    mandatory: false,
    priority: 'low',
    phase: 'percussion',
    clinicalGuide: 'Dull suprapubic percussion suggests distended bladder. Confirm with palpation. Common post-operative or with obstruction (enlarged prostate, stricture).',
  },
];

const GI_AUSCULTATION_FIELDS: ExamField[] = [
  {
    id: 'bowelSounds',
    label: 'Bowel sounds',
    shortLabel: 'Bowel sounds',
    type: 'select',
    options: ['normal', 'increased', 'reduced', 'absent', 'tinkling', 'rushing'],
    mandatory: true,
    priority: 'high',
    phase: 'auscultation',
    clinicalGuide: 'Normal = 5-35 sounds/min. Absent (listen for full 2 min before declaring) = ileus/peritonitis. Tinkling/rushing = early obstruction. Increased = gastroenteritis/bowel obstruction. Reduced = ileus/peritonitis.',
    significance: 'abnormal',
    associatedDifferentials: ['intestinal_obstruction', 'paralytic_ileus', 'peritonitis', 'gastroenteritis', 'post_operative_ileus'],
  },
  {
    id: 'bruits',
    label: 'Abdominal bruits',
    shortLabel: 'Bruits',
    type: 'select',
    options: ['none', 'aortic', 'renal', 'hepatic', 'femoral', 'splenic'],
    mandatory: false,
    priority: 'high',
    phase: 'auscultation',
    clinicalGuide: 'Listen over aorta, renals, iliacs, femorals. Renal bruit = renal artery stenosis (hypertension). Aortic bruit = atherosclerotic disease. Hepatic bruit = hepatocellular carcinoma or alcoholic hepatitis.',
    significance: 'abnormal',
    associatedDifferentials: ['renal_artery_stenosis', 'atherosclerosis', 'hepatocellular_carcinoma', 'splenic_av_fistula'],
  },
  {
    id: 'frictionRub',
    label: 'Peritoneal friction rub',
    shortLabel: 'Friction rub',
    type: 'boolean',
    mandatory: false,
    priority: 'medium',
    phase: 'auscultation',
    clinicalGuide: 'Rare finding. Grating sound synchronous with respiration suggests hepatic or splenic capsular inflammation (perihepatitis = Fitz-Hugh-Curtis syndrome, splenic infarct).',
    significance: 'abnormal',
    associatedDifferentials: ['fitz_hugh_curtis_syndrome', 'splenic_infarct', 'perihepatitis'],
  },
  {
    id: 'succussionSplash',
    label: 'Succussion splash',
    shortLabel: 'Succussion splash',
    type: 'boolean',
    mandatory: false,
    priority: 'medium',
    phase: 'auscultation',
    clinicalGuide: 'Shake patient side-to-side, listen with stethoscope. Splash sound = gas + fluid in dilated stomach/gastric outlet obstruction. Also heard in dilated bowel loops.',
    significance: 'abnormal',
    associatedDifferentials: ['gastric_outlet_obstruction', 'pyloric_stenosis', 'intestinal_obstruction'],
  },
];

const GI_SPECIAL_SIGNS_FIELDS: ExamField[] = [
  {
    id: 'courvoisierSign',
    label: "Courvoisier's sign (palpable gallbladder)",
    shortLabel: "Courvoisier's sign",
    type: 'select',
    options: ['not_assessed', 'negative', 'positive'],
    mandatory: false,
    priority: 'high',
    phase: 'special_signs',
    clinicalGuide: "Courvoisier's law: In a jaundiced patient, a palpable, non-tender gallbladder is unlikely to be gallstones (likely pancreatic head malignancy). Tender gallbladder = cholecystitis.",
    significance: 'abnormal',
    associatedDifferentials: ['pancreatic_head_carcinoma', 'cholangiocarcinoma', 'chronic_cholecystitis'],
  },
  {
    id: 'kehrSign',
    label: "Kehr's sign (referred shoulder pain)",
    shortLabel: "Kehr's sign",
    type: 'select',
    options: ['not_assessed', 'negative', 'positive'],
    mandatory: false,
    priority: 'high',
    phase: 'special_signs',
    clinicalGuide: 'Left shoulder tip pain when patient lies flat + palpation of LUQ. Indicates diaphragmatic irritation from splenic rupture or subphrenic abscess. Classic for splenic injury after trauma.',
    significance: 'critical',
    associatedDifferentials: ['splenic_rupture', 'subphrenic_abscess', 'splenic_infarct'],
    recommendedAction: 'Suspected splenic rupture — urgent trauma assessment. FAST scan or CT. Surgical consult.',
  },
  {
    id: 'ballanceSign',
    label: "Ballance's sign",
    shortLabel: "Ballance's sign",
    type: 'select',
    options: ['not_assessed', 'negative', 'positive'],
    mandatory: false,
    priority: 'medium',
    phase: 'special_signs',
    clinicalGuide: 'Dullness in left flank (perisplenic haematoma) + tympany in right flank (gas-filled bowel pushed medially) = splenic rupture with haematoma. Rare but classic.',
    significance: 'abnormal',
    associatedDifferentials: ['splenic_rupture'],
  },
  {
    id: 'boasSign',
    label: "Boas' sign (referred back pain)",
    shortLabel: "Boas' sign",
    type: 'select',
    options: ['not_assessed', 'negative', 'positive'],
    mandatory: false,
    priority: 'medium',
    phase: 'special_signs',
    clinicalGuide: 'Hyperaesthesia and referred pain to right infrascapular region suggests acute cholecystitis. Viscerosomatic reflex through phrenic nerve (C3-5).',
    associatedDifferentials: ['acute_cholecystitis'],
  },
  {
    id: 'danceSign',
    label: "Dance's sign (empty RIF)",
    shortLabel: "Dance's sign",
    type: 'select',
    options: ['not_assessed', 'negative', 'positive'],
    mandatory: false,
    priority: 'low',
    phase: 'special_signs',
    clinicalGuide: 'Empty/hollow feeling in RIF on palpation + visible peristalsis = intussusception (caecum displaced by the intussusceptum). Classic in paediatric intussusception.',
    significance: 'abnormal',
    associatedDifferentials: ['intussusception'],
  },
];

const GI_DRE_FIELDS: ExamField[] = [
  {
    id: 'drePerformed',
    label: 'Digital rectal examination — performed?',
    shortLabel: 'DRE performed?',
    type: 'boolean',
    mandatory: false,
    priority: 'medium',
    phase: 'dre',
    clinicalGuide: 'DRE is essential when: GI bleeding, altered bowel habit, suspected prostate pathology, rectal mass, tenesmus, or unexplained pelvic pain. Document indication if performed.',
  },
  {
    id: 'dreSphincterTone',
    label: 'Anal sphincter tone',
    shortLabel: 'Sphincter tone',
    type: 'select',
    options: ['normal', 'reduced', 'increased_spasm', 'absent'],
    mandatory: false,
    priority: 'medium',
    phase: 'dre',
    dependsOn: { field: 'drePerformed', value: true },
    clinicalGuide: 'Reduced tone = cauda equina syndrome, neuropathic, or post-obstetric injury. Increased/spasm = anal fissure. Absent tone = significant neurological deficit.',
    significance: 'abnormal',
    associatedDifferentials: ['cauda_equina_syndrome', 'anal_fissure', 'neuropathic_incontinence'],
  },
  {
    id: 'dreFecalLoading',
    label: 'Fecal loading on DRE',
    shortLabel: 'Fecal loading',
    type: 'boolean',
    mandatory: false,
    priority: 'low',
    phase: 'dre',
    dependsOn: { field: 'drePerformed', value: true },
    clinicalGuide: 'Rectal examination for fecal loading is essential in constipation assessment. Hard impacted stool suggests chronic constipation or obstruction.',
    associatedDifferentials: ['chronic_constipation', 'faecal_impaction'],
  },
  {
    id: 'dreMass',
    label: 'Rectal mass on DRE',
    shortLabel: 'Rectal mass',
    type: 'boolean',
    mandatory: false,
    priority: 'high',
    phase: 'dre',
    dependsOn: { field: 'drePerformed', value: true },
    clinicalGuide: 'Any rectal mass requires further characterization: distance from anal verge, size, location (anterior/posterior/lateral), consistency, mobility (tethered/fixed), and relationship to prostate/cervix.',
    significance: 'abnormal',
    associatedDifferentials: ['rectal_carcinoma', 'prostate_carcinoma', 'pelvic_mass'],
    recommendedAction: 'Refer for colonoscopy/sigmoidoscopy. MRI pelvis for staging if suspicious for malignancy.',
  },
  {
    id: 'dreBlood',
    label: 'Blood on examining finger',
    shortLabel: 'Blood on DRE',
    type: 'boolean',
    mandatory: false,
    priority: 'high',
    phase: 'dre',
    dependsOn: { field: 'drePerformed', value: true },
    clinicalGuide: 'Fresh blood on examining finger indicates distal bleeding (haemorrhoids, fissure, proctitis, or low rectal tumour). Melena (black/tarry) suggests upper GI source.',
    significance: 'abnormal',
    associatedDifferentials: ['haemorrhoids', 'anal_fissure', 'colorectal_cancer', 'proctitis', 'upper_gi_bleeding'],
  },
  {
    id: 'dreProstate',
    label: 'Prostate examination',
    shortLabel: 'Prostate',
    type: 'select',
    options: ['normal', 'enlarged_smooth', 'enlarged_nodular', 'tender', 'firm_hard', 'not_assessed_applicable'],
    mandatory: false,
    priority: 'medium',
    phase: 'dre',
    dependsOn: { field: 'drePerformed', value: true },
    clinicalGuide: 'Normal = walnut-sized, smooth, firm, median sulcus palpable. Enlarged smooth = BPH. Hard/nodular = prostate cancer (loss of median sulcus). Tender = prostatitis.',
    associatedDifferentials: ['benign_prostatic_hyperplasia', 'prostate_carcinoma', 'prostatitis'],
  },
];

const GI_INGUINAL_FIELDS: ExamField[] = [
  {
    id: 'inguinalHernia',
    label: 'Inguinal hernia',
    shortLabel: 'Inguinal hernia',
    type: 'select',
    options: ['none', 'direct_inguinal', 'indirect_inguinal', 'femoral', 'incisional', 'irreducible'],
    mandatory: false,
    priority: 'high',
    phase: 'inguinal',
    clinicalGuide: 'Assess with patient standing. Direct = bulges forward (medial to inferior epigastric vessels), rarely strangulates. Indirect = descends into scrotum (lateral to vessels), higher strangulation risk. Femoral = below inguinal ligament, highest strangulation risk.',
    associatedDifferentials: ['inguinal_hernia', 'femoral_hernia', 'hydrocoele', 'varicocoele'],
  },
  {
    id: 'coughImpulse',
    label: 'Cough impulse',
    shortLabel: 'Cough impulse',
    type: 'boolean',
    mandatory: false,
    priority: 'medium',
    phase: 'inguinal',
    dependsOn: { field: 'inguinalHernia', value: 'direct_inguinal' },
    clinicalGuide: 'Palpable impulse on coughing suggests reducible hernia. Absent cough impulse raises concern for incarcerated/strangulated hernia (surgical emergency if tender/irreducible).',
    significance: 'abnormal',
  },
  {
    id: 'inguinalLymphNodes',
    label: 'Inguinal lymph nodes',
    shortLabel: 'Groin nodes',
    type: 'select',
    options: ['not_palpable', 'palpable_benign', 'palpable_suspicious', 'matted', 'discharging_sinus'],
    mandatory: false,
    priority: 'medium',
    phase: 'inguinal',
    clinicalGuide: 'Small, soft, mobile nodes are often benign/reactive. Firm, fixed, matted nodes suggest malignancy or TB. Discharging sinus suggests TB lymphadenitis (scrofula) or actinomycosis.',
    significance: 'abnormal',
    associatedDifferentials: ['lymphadenitis', 'tb_lymphadenitis', 'lymphoma', 'metastatic_cancer', 'hiv'],
  },
];

// ── Free-text field for additional findings ─────────────────────────────────

const GI_NOTES_FIELD: ExamField = {
  id: 'giNotes',
  label: 'Additional GI examination notes',
  shortLabel: 'Notes',
  type: 'text',
  mandatory: false,
  priority: 'low',
  phase: 'inspection',
  clinicalGuide: 'Document any additional findings not captured by structured fields: ascites drainage, stoma appearance, feeding tube, drains, fistulae, etc.',
};

// ── Complete GI Schema ──────────────────────────────────────────────────────

export const GI_EXAM_SCHEMA: ExamSchema = {
  systemId: 'gastrointestinal',
  label: 'Gastrointestinal Examination',
  description: 'Complete abdominal examination following Inspection → Palpation → Percussion → Auscultation → Special Signs → DRE → Inguinal',
  fields: [
    ...GI_INSPECTION_FIELDS,
    ...GI_PALPATION_FIELDS,
    ...GI_PERCUSSION_FIELDS,
    ...GI_AUSCULTATION_FIELDS,
    ...GI_SPECIAL_SIGNS_FIELDS,
    ...GI_DRE_FIELDS,
    ...GI_INGUINAL_FIELDS,
    GI_NOTES_FIELD,
  ],
  minimumForAdequacy: [
    'contour', 'abdominalScars', 'hernialOrifices',
    'tenderness', 'guarding',
    'liverPalpable', 'spleenPalpable', 'abdominalMass',
    'percussionNote',
    'bowelSounds',
    'aorticWidth',
  ],
  requiredForCompletion: [
    'contour', 'abdominalScars', 'hernialOrifices',
    'tenderness', 'guarding',
    'liverPalpable', 'spleenPalpable', 'abdominalMass',
    'percussionNote', 'bowelSounds',
    'aorticWidth',
  ],
  activatedBySymptoms: ['abdominal_pain', 'nausea_vomiting', 'diarrhea', 'constipation', 'dysphagia', 'gi_bleeding', 'jaundice', 'distension'],
  activatedByCCKeywords: ['abdominal pain', 'stomach', 'belly', 'nausea', 'vomit', 'diarrhoea', 'constipat', 'blood in stool', 'jaundice', 'bloated', 'swallow'],
};

// ── Schema Registry — maps systemId → ExamSchema ───────────────────────────
// Start with GI. Add Respiratory, CVS, CNS, MSK, etc. as separate schemas.

export const EXAM_SCHEMAS: Record<string, ExamSchema> = {
  gastrointestinal: GI_EXAM_SCHEMA,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getExamSchema(systemId: string): ExamSchema | undefined {
  return EXAM_SCHEMAS[systemId];
}

export function getMandatoryExamFields(systemId: string): string[] {
  return EXAM_SCHEMAS[systemId]?.fields.filter(f => f.mandatory).map(f => f.id) ?? [];
}

export function getFieldsForPhase(systemId: string, phase: ExamPhase): ExamField[] {
  return EXAM_SCHEMAS[systemId]?.fields.filter(f => f.phase === phase) ?? [];
}

export function getCriticalExamFields(systemId: string): ExamField[] {
  return EXAM_SCHEMAS[systemId]?.fields.filter(f => f.priority === 'critical' || f.significance === 'critical') ?? [];
}

export function getUnansweredExamFields(
  systemId: string,
  answeredFieldIds: Set<string>,
  currentValues?: Record<string, any>,
): ExamField[] {
  const schema = EXAM_SCHEMAS[systemId];
  if (!schema) return [];
  return schema.fields.filter(f => {
    if (answeredFieldIds.has(f.id)) return false;
    if (f.dependsOn) {
      if (!answeredFieldIds.has(f.dependsOn.field)) return false;
      if (currentValues && currentValues[f.dependsOn.field] !== f.dependsOn.value) return false;
    }
    return true;
  });
}

export function getExamSystemsActivatedBySymptom(symptomId: string): string[] {
  const activated: string[] = [];
  for (const [systemId, schema] of Object.entries(EXAM_SCHEMAS)) {
    if (schema.activatedBySymptoms.includes(symptomId)) {
      activated.push(systemId);
    }
  }
  return activated;
}

export function getExamSystemsActivatedByCC(ccText: string): string[] {
  const activated: string[] = [];
  const lower = ccText.toLowerCase();
  for (const [systemId, schema] of Object.entries(EXAM_SCHEMAS)) {
    for (const keyword of schema.activatedByCCKeywords) {
      if (lower.includes(keyword)) {
        activated.push(systemId);
        break;
      }
    }
  }
  return activated;
}
