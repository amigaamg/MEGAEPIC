// ═══════════════════════════════════════════════════════════════════════════════
// Shared Feature Library — every feature in the system has a canonical definition
// DiseaseNodes reference these by featureId. The labels and types live here.
// ═══════════════════════════════════════════════════════════════════════════════

import type { FeatureRecord } from '../diseaseNode';

export const FEATURES: Record<string, FeatureRecord> = {

  // ── Pain characteristics ──────────────────────────────────────────────────
  pain_onset: {
    featureId: 'pain_onset', label: 'How quickly did the pain develop?',
    shortLabel: 'Pain onset speed', category: 'symptom',
    type: 'select', options: ['Gradual over hours', 'Sudden over minutes', 'Instantaneous — peak in seconds'],
    sensitivity: 0.9, specificity: 0.7, stageRelevance: [1],
    clinicalGuide: 'Instant onset suggests perforation, rupture, or ischaemia.',
  },
  pain_onset_sudden: {
    featureId: 'pain_onset_sudden', label: 'Was the pain sudden in onset?',
    shortLabel: 'Sudden onset', category: 'symptom',
    type: 'boolean', sensitivity: 0.85, specificity: 0.75, stageRelevance: [1],
  },
  pain_initial_location: {
    featureId: 'pain_initial_location', label: 'Where did the pain FIRST begin?',
    shortLabel: 'Initial pain site', category: 'symptom',
    type: 'select', options: ['Periumbilical (around the navel)', 'Epigastrium (upper middle)',
      'Right upper quadrant', 'Left upper quadrant', 'Right lower quadrant',
      'Left lower quadrant', 'Suprapubic (lower middle)', 'Flank or back', 'Diffuse — all over'],
    sensitivity: 0.9, specificity: 0.6, stageRelevance: [1],
    canBeFromCC: true,
  },
  pain_location_now: {
    featureId: 'pain_location_now', label: 'Where is the pain NOW?',
    shortLabel: 'Current pain site', category: 'symptom',
    type: 'select', options: ['Right lower quadrant', 'Epigastrium', 'Right upper quadrant',
      'Left upper quadrant', 'Left lower quadrant', 'Periumbilical', 'Suprapubic',
      'Diffuse — whole abdomen', 'Flank or back'],
    sensitivity: 0.9, specificity: 0.65, stageRelevance: [2, 3],
  },
  pain_migration: {
    featureId: 'pain_migration', label: 'Has the pain moved or spread since it started?',
    shortLabel: 'Pain migration', category: 'symptom',
    type: 'select', options: ['No — stayed where it began', 'Started around navel → moved to lower right',
      'Started in upper abdomen → spread all over', 'Started in flank → moved to groin',
      'Started in chest → moved to abdomen'],
    sensitivity: 0.7, specificity: 0.85, stageRelevance: [1, 2],
    canBeFromCC: true,
  },
  pain_character: {
    featureId: 'pain_character', label: 'How would you describe the pain?',
    shortLabel: 'Pain character', category: 'symptom',
    type: 'select', options: ['Sharp or stabbing', 'Cramping — comes in waves',
      'Burning', 'Dull ache', 'Gnawing', 'Tearing or ripping'],
    sensitivity: 0.85, specificity: 0.6, stageRelevance: [1, 2],
    canBeFromCC: true,
  },
  pain_severity: {
    featureId: 'pain_severity', label: 'How severe is the pain on a scale of 0–10?',
    shortLabel: 'Pain severity', category: 'symptom',
    type: 'number', sensitivity: 0.7, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  pain_radiation: {
    featureId: 'pain_radiation', label: 'Does the pain spread anywhere else?',
    shortLabel: 'Pain radiation', category: 'symptom',
    type: 'select', options: ['No radiation', 'To the back', 'To the right shoulder',
      'To the left shoulder', 'To the groin or genitals'],
    sensitivity: 0.6, specificity: 0.85, stageRelevance: [1, 2],
  },
  pain_worsening_factors: {
    featureId: 'pain_worsening_factors', label: 'What makes the pain worse?',
    shortLabel: 'Aggravating factors', category: 'symptom',
    type: 'multi_select', options: ['Movement or coughing', 'Eating or drinking',
      'Deep breathing', 'Lying flat', 'Touching the area', 'Nothing specific'],
    sensitivity: 0.6, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  pain_relieving_factors: {
    featureId: 'pain_relieving_factors', label: 'What makes the pain better?',
    shortLabel: 'Relieving factors', category: 'symptom',
    type: 'multi_select', options: ['Lying still', 'Bending forward', 'Passing stool or gas',
      'Nothing helps', 'Medication'],
    sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },

  // ── Associated GI symptoms ─────────────────────────────────────────────────
  nausea: {
    featureId: 'nausea', label: 'Do you feel nauseated?',
    shortLabel: 'Nausea', category: 'symptom',
    type: 'boolean', sensitivity: 0.75, specificity: 0.5, stageRelevance: [1, 2, 3],
    canBeFromCC: true,
  },
  vomiting: {
    featureId: 'vomiting', label: 'Have you vomited?',
    shortLabel: 'Vomiting', category: 'symptom',
    type: 'boolean', sensitivity: 0.7, specificity: 0.55, stageRelevance: [1, 2, 3],
    canBeFromCC: true,
  },
  vomiting_timing: {
    featureId: 'vomiting_timing', label: 'Did the vomiting start before or after the pain?',
    shortLabel: 'Vomiting timing', category: 'symptom',
    type: 'select', options: ['Before the pain', 'After the pain began', 'At the same time', 'No pain — vomiting is main symptom'],
    sensitivity: 0.6, specificity: 0.7, stageRelevance: [2, 3],
  },
  vomiting_description: {
    featureId: 'vomiting_description', label: 'What did the vomit look like?',
    shortLabel: 'Vomit appearance', category: 'symptom',
    type: 'select', options: ['Stomach contents / food', 'Bile — yellow-green',
      'Dark / coffee-ground', 'Blood — bright red', 'Feculent — like stool'],
    sensitivity: 0.5, specificity: 0.85, stageRelevance: [2, 3, 4],
  },
  vomiting_frequency: {
    featureId: 'vomiting_frequency', label: 'How many times have you vomited?',
    shortLabel: 'Vomiting frequency', category: 'symptom',
    type: 'select', options: ['Once or twice', '3–5 times', 'More than 5 times', 'Continuous / unable to keep anything down'],
    sensitivity: 0.5, specificity: 0.6, stageRelevance: [2, 3],
  },
  anorexia: {
    featureId: 'anorexia', label: 'Have you lost your appetite?',
    shortLabel: 'Anorexia', category: 'symptom',
    type: 'boolean', sensitivity: 0.8, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  fever: {
    featureId: 'fever', label: 'Have you had a fever or felt feverish?',
    shortLabel: 'Fever', category: 'symptom',
    type: 'boolean', sensitivity: 0.7, specificity: 0.6, stageRelevance: [2, 3, 4],
  },
  fever_chills: {
    featureId: 'fever_chills', label: 'Have you had rigors (shaking chills)?',
    shortLabel: 'Rigors', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.9, stageRelevance: [3, 4],
  },
  bowel_habits: {
    featureId: 'bowel_habits', label: 'How have your bowel movements been?',
    shortLabel: 'Bowel habits', category: 'symptom',
    type: 'select', options: ['Normal', 'Constipated — not gone in days',
      'Diarrhoea — loose or watery', 'Obstipated — not passing gas or stool',
      'Blood in stool', 'Mucus in stool'],
    sensitivity: 0.65, specificity: 0.6, stageRelevance: [1, 2, 3],
    canBeFromCC: true,
  },
  diarrhea: {
    featureId: 'diarrhea', label: 'Do you have diarrhoea?',
    shortLabel: 'Diarrhoea', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    canBeFromCC: true,
  },
  constipation: {
    featureId: 'constipation', label: 'Are you constipated?',
    shortLabel: 'Constipation', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.75, stageRelevance: [1, 2],
  },
  obstipation: {
    featureId: 'obstipation', label: 'Have you been unable to pass gas or stool?',
    shortLabel: 'Obstipation', category: 'symptom',
    type: 'boolean', sensitivity: 0.85, specificity: 0.85, stageRelevance: [2, 3],
  },
  hematochezia: {
    featureId: 'hematochezia', label: 'Have you noticed blood in your stool?',
    shortLabel: 'Blood in stool', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.95, stageRelevance: [3, 4],
  },
  melena: {
    featureId: 'melena', label: 'Have you passed black or tarry stools?',
    shortLabel: 'Melena', category: 'symptom',
    type: 'boolean', sensitivity: 0.7, specificity: 0.9, stageRelevance: [3, 4],
  },
  dysphagia: {
    featureId: 'dysphagia', label: 'Do you have difficulty swallowing?',
    shortLabel: 'Dysphagia', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.8, stageRelevance: [1],
  },
  heartburn: {
    featureId: 'heartburn', label: 'Do you have heartburn or acid reflux?',
    shortLabel: 'Heartburn', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2],
  },
  belching: {
    featureId: 'belching', label: 'Have you been belching excessively?',
    shortLabel: 'Belching', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.6, stageRelevance: [1],
  },

  // ── Peritoneal / surgical ──────────────────────────────────────────────────
  peritonism: {
    featureId: 'peritonism', label: 'Does the abdomen feel stiff or tender when touched?',
    shortLabel: 'Peritoneal irritation', category: 'symptom',
    type: 'boolean', sensitivity: 0.8, specificity: 0.85, stageRelevance: [2, 3, 4],
  },
  guarding: {
    featureId: 'guarding', label: 'Do you find yourself tensing your stomach muscles because of the pain?',
    shortLabel: 'Guarding', category: 'symptom',
    type: 'boolean', sensitivity: 0.75, specificity: 0.8, stageRelevance: [2, 3],
  },
  rebound_history: {
    featureId: 'rebound_history', label: 'Does the pain get worse when pressure is released quickly?',
    shortLabel: 'Rebound tenderness', category: 'symptom',
    type: 'boolean', sensitivity: 0.65, specificity: 0.8, stageRelevance: [2, 3, 4],
  },
  rigidity: {
    featureId: 'rigidity', label: 'Is your abdominal wall rock-hard?',
    shortLabel: 'Abdominal rigidity', category: 'symptom',
    type: 'boolean', sensitivity: 0.6, specificity: 0.9, stageRelevance: [3, 4],
  },

  // ── Urinary symptoms ───────────────────────────────────────────────────────
  dysuria: {
    featureId: 'dysuria', label: 'Does it hurt when you pass urine?',
    shortLabel: 'Dysuria', category: 'symptom',
    type: 'boolean', sensitivity: 0.6, specificity: 0.75, stageRelevance: [1, 2],
  },
  urinary_frequency: {
    featureId: 'urinary_frequency', label: 'Are you passing urine more often than usual?',
    shortLabel: 'Urinary frequency', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
  },
  urinary_retention: {
    featureId: 'urinary_retention', label: 'Are you having difficulty passing urine?',
    shortLabel: 'Urinary retention', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.8, stageRelevance: [2, 3],
  },
  hematuria: {
    featureId: 'hematuria', label: 'Have you noticed blood in your urine?',
    shortLabel: 'Haematuria', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.9, stageRelevance: [2, 3],
  },
  flank_pain: {
    featureId: 'flank_pain', label: 'Do you have pain in your flank (side) or back?',
    shortLabel: 'Flank pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.7, specificity: 0.75, stageRelevance: [1, 2],
  },

  // ── Gynaecological / obstetric ─────────────────────────────────────────────
  last_menstrual_period: {
    featureId: 'last_menstrual_period', label: 'When was your last menstrual period?',
    shortLabel: 'LMP', category: 'symptom',
    type: 'select', options: ['Within the past month', '1–2 months ago',
      'More than 2 months ago', 'Unsure', 'Not applicable — post-menopausal or on contraception'],
    sensitivity: 0.85, specificity: 0.8, stageRelevance: [1],
    clinicalGuide: 'Essential for all reproductive-age women — ectopic pregnancy is a surgical emergency.',
  },
  vaginal_bleeding: {
    featureId: 'vaginal_bleeding', label: 'Do you have any vaginal bleeding?',
    shortLabel: 'Vaginal bleeding', category: 'symptom',
    type: 'boolean', sensitivity: 0.6, specificity: 0.85, stageRelevance: [1, 2, 3],
    canBeFromCC: true,
  },
  vaginal_discharge: {
    featureId: 'vaginal_discharge', label: 'Do you have any unusual vaginal discharge?',
    shortLabel: 'Vaginal discharge', category: 'symptom',
    type: 'boolean', sensitivity: 0.55, specificity: 0.8, stageRelevance: [2, 3],
    canBeFromCC: true,
  },
  dyspareunia: {
    featureId: 'dyspareunia', label: 'Have you had pain during intercourse?',
    shortLabel: 'Dyspareunia', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.75, stageRelevance: [1, 2],
  },
  pregnancy_status: {
    featureId: 'pregnancy_status', label: 'Could you be pregnant?',
    shortLabel: 'Pregnancy status', category: 'contextual',
    type: 'boolean', sensitivity: 0.9, specificity: 0.85, stageRelevance: [1],
  },
  pregnancy_gestational_age: {
    featureId: 'pregnancy_gestational_age', label: 'How many weeks pregnant are you?',
    shortLabel: 'Gestational age', category: 'contextual',
    type: 'select', options: ['First trimester (<13 weeks)', 'Second trimester (13–27 weeks)',
      'Third trimester (≥28 weeks)', 'Unsure'],
    sensitivity: 0.8, specificity: 0.8, stageRelevance: [1],
  },

  // ── Constitutional ─────────────────────────────────────────────────────────
  weight_loss: {
    featureId: 'weight_loss', label: 'Have you lost weight unintentionally?',
    shortLabel: 'Weight loss', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [3, 4],
  },
  fatigue: {
    featureId: 'fatigue', label: 'Have you felt unusually tired or weak?',
    shortLabel: 'Fatigue', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3, 4],
  },
  night_sweats: {
    featureId: 'night_sweats', label: 'Have you had night sweats?',
    shortLabel: 'Night sweats', category: 'symptom',
    type: 'boolean', sensitivity: 0.2, specificity: 0.9, stageRelevance: [3, 4],
  },

  // ── Risk factors ───────────────────────────────────────────────────────────
  prior_abdominal_surgery: {
    featureId: 'prior_abdominal_surgery', label: 'Have you had any previous abdominal surgeries?',
    shortLabel: 'Prior abdominal surgery', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1],
  },
  smoking: {
    featureId: 'smoking', label: 'Do you smoke?',
    shortLabel: 'Smoking', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.4, specificity: 0.65, stageRelevance: [1],
  },
  alcohol_use: {
    featureId: 'alcohol_use', label: 'How much alcohol do you drink?',
    shortLabel: 'Alcohol use', category: 'risk_factor',
    type: 'select', options: ['None', 'Occasional — social only', 'Regular — daily',
      'Heavy — binge drinking'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [1],
  },
  nsaid_use: {
    featureId: 'nsaid_use', label: 'Have you been taking any painkillers like ibuprofen, aspirin, or other anti-inflammatories?',
    shortLabel: 'NSAID use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.4, specificity: 0.75, stageRelevance: [1],
  },
  steroid_use: {
    featureId: 'steroid_use', label: 'Are you taking steroid medications?',
    shortLabel: 'Steroid use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.2, specificity: 0.9, stageRelevance: [1],
  },
  recent_travel: {
    featureId: 'recent_travel', label: 'Have you travelled recently?',
    shortLabel: 'Recent travel', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.3, specificity: 0.8, stageRelevance: [1],
  },
  family_history_gi_cancer: {
    featureId: 'family_history_gi_cancer', label: 'Is there a family history of bowel or stomach cancer?',
    shortLabel: 'Family GI cancer', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.2, specificity: 0.85, stageRelevance: [1],
  },
  known_gallstones: {
    featureId: 'known_gallstones', label: 'Do you have known gallstones?',
    shortLabel: 'Known gallstones', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.4, specificity: 0.85, stageRelevance: [1],
  },
  diabetes: {
    featureId: 'diabetes', label: 'Do you have diabetes?',
    shortLabel: 'Diabetes', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.3, specificity: 0.8, stageRelevance: [1],
  },
  htn_cad: {
    featureId: 'htn_cad', label: 'Do you have high blood pressure, heart disease, or high cholesterol?',
    shortLabel: 'Vascular risk factors', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.4, specificity: 0.65, stageRelevance: [1],
  },
  anticoagulant_use: {
    featureId: 'anticoagulant_use', label: 'Are you taking blood-thinning medication?',
    shortLabel: 'Anticoagulant use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.2, specificity: 0.9, stageRelevance: [1],
  },

  // ── Red flags ──────────────────────────────────────────────────────────────
  syncope: {
    featureId: 'syncope', label: 'Have you fainted or felt like you might faint?',
    shortLabel: 'Syncope / near-syncope', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.9, stageRelevance: [1, 2],
  },
  hematemesis: {
    featureId: 'hematemesis', label: 'Have you vomited blood?',
    shortLabel: 'Haematemesis', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.95, stageRelevance: [3, 4],
    canBeFromCC: true,
  },
  jaundice: {
    featureId: 'jaundice', label: 'Have you noticed yellowing of your skin or eyes?',
    shortLabel: 'Jaundice', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.9, stageRelevance: [2, 3, 4],
  },

  // ── DIARRHOEA SOCRATES CHARACTERIZATION ──────────────────
  diarrhoea_duration: {
    featureId: 'diarrhoea_duration', label: 'How long have you had diarrhoea?',
    shortLabel: 'Diarrhoea duration', category: 'symptom',
    type: 'select', options: ['Less than 2 weeks (acute)', '2–4 weeks (persistent)', 'More than 4 weeks (chronic)'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_stool_type: {
    featureId: 'diarrhoea_stool_type', label: 'What does your diarrhoea look like?',
    shortLabel: 'Stool appearance', category: 'symptom',
    type: 'select', options: ['Watery — clear or brown liquid', 'Bloody — mixed with blood', 'Mucoid — slimy with mucus', 'Fatty — bulky, foul, floats', 'Mixed blood and mucus'],
    sensitivity: 0.6, specificity: 0.75, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_frequency: {
    featureId: 'diarrhoea_frequency', label: 'How many times per day?',
    shortLabel: 'Stool frequency', category: 'symptom',
    type: 'select', options: ['3–5 times', '5–10 times', 'More than 10 times', 'Continuous — cannot leave the toilet'],
    sensitivity: 0.5, specificity: 0.6, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_volume: {
    featureId: 'diarrhoea_volume', label: 'How large is each bowel movement?',
    shortLabel: 'Stool volume', category: 'symptom',
    type: 'select', options: ['Small volume', 'Moderate', 'Large volume', 'Very large (more than a cupful)'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_nocturnal: {
    featureId: 'diarrhoea_nocturnal', label: 'Does the diarrhoea wake you up from sleep?',
    shortLabel: 'Nocturnal diarrhoea', category: 'symptom',
    type: 'boolean', sensitivity: 0.6, specificity: 0.85, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_relation_to_food: {
    featureId: 'diarrhoea_relation_to_food', label: 'Is the diarrhoea related to eating?',
    shortLabel: 'Relation to food', category: 'symptom',
    type: 'select', options: ['Worse after eating', 'Better with fasting', 'No relation to food', 'Worse after milk/dairy', 'Worse after wheat/gluten'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_tenesmus: {
    featureId: 'diarrhoea_tenesmus', label: 'Do you feel like you need to go urgently or cannot fully empty?',
    shortLabel: 'Tenesmus / urgency', category: 'symptom',
    type: 'select', options: ['No', 'Mild urgency', 'Severe urgency — cannot hold', 'Feeling of incomplete emptying'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_mucus: {
    featureId: 'diarrhoea_mucus', label: 'Have you noticed mucus in your stool?',
    shortLabel: 'Mucus in stool', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_improves_fasting: {
    featureId: 'diarrhoea_improves_fasting', label: 'Does the diarrhoea stop if you stop eating?',
    shortLabel: 'Fasting response', category: 'symptom',
    type: 'boolean', sensitivity: 0.6, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_weight_loss: {
    featureId: 'diarrhoea_weight_loss', label: 'Have you lost weight with this diarrhoea?',
    shortLabel: 'Diarrhoea + weight loss', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_dehydration: {
    featureId: 'diarrhoea_dehydration', label: 'Do you feel dehydrated — thirsty, dizzy, or passing less urine?',
    shortLabel: 'Dehydration', category: 'symptom',
    type: 'select', options: ['No dehydration', 'Mild — thirsty', 'Moderate — dizzy on standing', 'Severe — very weak, cannot stand'],
    sensitivity: 0.6, specificity: 0.75, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_fever: {
    featureId: 'diarrhoea_fever', label: 'Do you have fever with the diarrhoea?',
    shortLabel: 'Diarrhoea + fever', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_travel_related: {
    featureId: 'diarrhoea_travel_related', label: 'Did the diarrhoea start during or after travel?',
    shortLabel: 'Travel-related', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.85, stageRelevance: [1],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_antibiotics_related: {
    featureId: 'diarrhoea_antibiotics_related', label: 'Did the diarrhoea start after antibiotics?',
    shortLabel: 'Post-antibiotic', category: 'symptom',
    type: 'boolean', sensitivity: 0.6, specificity: 0.9, stageRelevance: [1],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhoea_flushing: {
    featureId: 'diarrhoea_flushing', label: 'Do you have facial flushing with the diarrhoea?',
    shortLabel: 'Flushing', category: 'symptom',
    type: 'boolean', sensitivity: 0.7, specificity: 0.9, stageRelevance: [2, 3],
  },
  diarrhoea_perianal: {
    featureId: 'diarrhoea_perianal', label: 'Do you have sores or fistulas around your anus?',
    shortLabel: 'Perianal disease', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.85, stageRelevance: [2, 3],
  },
  diarrhoea_oral_ulcers: {
    featureId: 'diarrhoea_oral_ulcers', label: 'Do you have mouth ulcers?',
    shortLabel: 'Oral ulcers', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
  },
  diarrhoea_arthritis: {
    featureId: 'diarrhoea_arthritis', label: 'Do you have joint pains with the diarrhoea?',
    shortLabel: 'Arthritis', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
  },
  diarrhoea_rash: {
    featureId: 'diarrhoea_rash', label: 'Do you have a skin rash with the diarrhoea?',
    shortLabel: 'Rash', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
  },
  steatorrhea: {
    featureId: 'steatorrhea', label: 'Are your stools pale, bulky, foul-smelling, or hard to flush?',
    shortLabel: 'Steatorrhea', category: 'symptom',
    type: 'boolean', sensitivity: 0.6, specificity: 0.85, stageRelevance: [2, 3],
  },

  abdominal_distension: {
    featureId: 'abdominal_distension', label: 'Has your abdomen felt swollen or bloated?',
    shortLabel: 'Abdominal distension', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [2, 3],
    canBeFromCC: true,
  },

  // ── Chronicity markers ────────────────────────────────────────────────────
  previous_similar_episodes: {
    featureId: 'previous_similar_episodes', label: 'Have you had pain like this before?',
    shortLabel: 'Previous similar episodes', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1],
  },
  pain_duration_hours: {
    featureId: 'pain_duration_hours', label: 'How long has the pain been going on?',
    shortLabel: 'Pain duration', category: 'symptom',
    type: 'number', sensitivity: 0.6, specificity: 0.5, stageRelevance: [1],
    clinicalGuide: 'Duration in hours, e.g. "6", "24", "48"',
    canBeFromCC: true,
  },

  // ── Cardiovascular / chest ────────────────────────────────────────────────
  chest_pain: {
    featureId: 'chest_pain', label: 'Do you have any chest pain or discomfort?',
    shortLabel: 'Chest pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.8, stageRelevance: [1, 2],
  },
  dyspnea: {
    featureId: 'dyspnea', label: 'Are you short of breath?',
    shortLabel: 'Dyspnoea', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.75, stageRelevance: [1, 2, 3],
  },
  cough: {
    featureId: 'cough', label: 'Do you have a cough?',
    shortLabel: 'Cough', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.8, stageRelevance: [1],
    canBeFromCC: true,
  },
  cough_sputum: {
    featureId: 'cough_sputum', label: 'Are you coughing up phlegm?',
    shortLabel: 'Productive cough', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.7, stageRelevance: [2, 3],
    canBeFromCC: true,
  },
  pleuritic_pain: {
    featureId: 'pleuritic_pain', label: 'Does your pain get worse when you take a deep breath?',
    shortLabel: 'Pleuritic pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2],
  },

  // ── Metabolic ──────────────────────────────────────────────────────────────
  polydipsia: {
    featureId: 'polydipsia', label: 'Have you been excessively thirsty lately?',
    shortLabel: 'Polydipsia', category: 'symptom',
    type: 'boolean', sensitivity: 0.7, specificity: 0.75, stageRelevance: [1, 2],
    canBeFromCC: true,
  },
  polyuria: {
    featureId: 'polyuria', label: 'Have you been passing urine more often than usual?',
    shortLabel: 'Polyuria', category: 'symptom',
    type: 'boolean', sensitivity: 0.7, specificity: 0.75, stageRelevance: [1, 2],
  },

  // ── Testicular ─────────────────────────────────────────────────────────────
  testicular_pain: {
    featureId: 'testicular_pain', label: 'Do you have pain in your testicle or scrotum?',
    shortLabel: 'Testicular pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.85, specificity: 0.9, stageRelevance: [1, 2],
  },
  scrotal_swelling: {
    featureId: 'scrotal_swelling', label: 'Is your scrotum swollen or tender?',
    shortLabel: 'Scrotal swelling', category: 'symptom',
    type: 'boolean', sensitivity: 0.7, specificity: 0.85, stageRelevance: [1, 2],
  },

  // ── Gynaecological ─────────────────────────────────────────────────────────
  dysmenorrhea: {
    featureId: 'dysmenorrhea', label: 'Do you have painful periods?',
    shortLabel: 'Dysmenorrhea', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
  },
  menorrhagia: {
    featureId: 'menorrhagia', label: 'Are your periods heavy or prolonged?',
    shortLabel: 'Menorrhagia', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.75, stageRelevance: [1, 2],
  },

  // ── Colorectal ─────────────────────────────────────────────────────────────
  tenesmus: {
    featureId: 'tenesmus', label: 'Do you feel like you need to pass stool even when nothing comes?',
    shortLabel: 'Tenesmus', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.8, stageRelevance: [2, 3],
  },
  mucus_stool: {
    featureId: 'mucus_stool', label: 'Have you noticed mucus in your stool?',
    shortLabel: 'Mucus in stool', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
  },
  bloating: {
    featureId: 'bloating', label: 'Do you feel bloated after meals?',
    shortLabel: 'Bloating', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.55, stageRelevance: [1, 2],
  },
  alternat_bowel: {
    featureId: 'alternat_bowel', label: 'Do you alternate between constipation and diarrhoea?',
    shortLabel: 'Alternating bowel habit', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.8, stageRelevance: [1, 2],
  },
  stool_relief: {
    featureId: 'stool_relief', label: 'Does passing stool relieve your pain?',
    shortLabel: 'Relief with stool', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.75, stageRelevance: [1, 2],
  },

  // ── Hernia ─────────────────────────────────────────────────────────────────
  hernia_mass: {
    featureId: 'hernia_mass', label: 'Have you noticed a lump or bulge in your groin or abdomen?',
    shortLabel: 'Hernia mass', category: 'symptom',
    type: 'boolean', sensitivity: 0.8, specificity: 0.85, stageRelevance: [1, 2],
    canBeFromCC: true,
  },

  // ── Dermatological ──────────────────────────────────────────────────────────
  skin_rash: {
    featureId: 'skin_rash', label: 'Do you have a rash?',
    shortLabel: 'Rash', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [1, 2],
    canBeFromCC: true,
  },
  joint_pain: {
    featureId: 'joint_pain', label: 'Do you have joint pains?',
    shortLabel: 'Joint pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.8, stageRelevance: [1, 2],
  },
  headache: {
    featureId: 'headache', label: 'Do you have a headache?',
    shortLabel: 'Headache', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.7, stageRelevance: [1, 2],
  },

  // ── Urinary / defecatory urgency ────────────────────────────────────────────
  urgency: {
    featureId: 'urgency', label: 'Do you feel a sudden, urgent need to pass urine or stool?',
    shortLabel: 'Urgency', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
  },

  // ── Eating relationship ────────────────────────────────────────────────────
  eating_worsens: {
    featureId: 'eating_worsens', label: 'Does eating make the pain worse?',
    shortLabel: 'Pain after eating', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.6, stageRelevance: [1, 2],
  },
  eating_relief: {
    featureId: 'eating_relief', label: 'Does eating relieve the pain?',
    shortLabel: 'Pain relief with eating', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2],
  },

  // ── Alcohol specific ────────────────────────────────────────────────────────
  recent_binge: {
    featureId: 'recent_binge', label: 'Have you had a heavy drinking session recently?',
    shortLabel: 'Recent binge drinking', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.4, specificity: 0.75, stageRelevance: [1],
  },
  ivdu: {
    featureId: 'ivdu', label: 'Do you use intravenous drugs?',
    shortLabel: 'IV drug use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.2, specificity: 0.9, stageRelevance: [1],
  },
  hiv_status: {
    featureId: 'hiv_status', label: 'Do you have HIV or a weakened immune system?',
    shortLabel: 'HIV / immunocompromised', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.2, specificity: 0.85, stageRelevance: [1],
  },
  known_cancer: {
    featureId: 'known_cancer', label: 'Do you have a history of cancer?',
    shortLabel: 'Cancer history', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.15, specificity: 0.9, stageRelevance: [1],
  },

  // ── VOMITING CHARACTERIZATION ──────────────────────────────
  vomiting_bilious: {
    featureId: 'vomiting_bilious', label: 'Is the vomit yellow or green (bilious)?',
    shortLabel: 'Bilious vomiting', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'vomiting', value: true },
  },
  vomiting_projectile: {
    featureId: 'vomiting_projectile', label: 'Is the vomiting projectile (forceful, shooting out)?',
    shortLabel: 'Projectile vomiting', category: 'symptom',
    type: 'boolean', sensitivity: 0.2, specificity: 0.9, stageRelevance: [1, 2],
    dependsOn: { featureId: 'vomiting', value: true },
  },
  vomiting_relation_to_eating: {
    featureId: 'vomiting_relation_to_eating', label: 'When does the vomiting happen relative to eating?',
    shortLabel: 'Vomiting vs meals', category: 'symptom',
    type: 'select', options: ['Before meals', 'Immediately after eating', '30-60 minutes after', 'Unrelated to eating'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'vomiting', value: true },
  },
  vomiting_relief: {
    featureId: 'vomiting_relief', label: 'Does vomiting make the pain better?',
    shortLabel: 'Vomiting relieves pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'vomiting', value: true },
  },
  vomiting_force: {
    featureId: 'vomiting_force', label: 'How forceful is the vomiting?',
    shortLabel: 'Force of vomiting', category: 'symptom',
    type: 'select', options: ['Effortless regurgitation', 'Retching', 'Forceful', 'Projectile'],
    sensitivity: 0.3, specificity: 0.75, stageRelevance: [1, 2],
    dependsOn: { featureId: 'vomiting', value: true },
  },

  // ── CONSTIPATION CHARACTERIZATION ──────────────────────────
  constipation_duration_days: {
    featureId: 'constipation_duration_days', label: 'How many days since your last bowel movement?',
    shortLabel: 'Days since last BM', category: 'symptom',
    type: 'number', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_laxative_use: {
    featureId: 'constipation_laxative_use', label: 'Do you use laxatives?',
    shortLabel: 'Laxative use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.2, specificity: 0.9, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },

  // ── DIARRHEA CHARACTERIZATION ─────────────────────────────
  diarrhea_duration_days: {
    featureId: 'diarrhea_duration_days', label: 'How many days have you had diarrhoea?',
    shortLabel: 'Diarrhoea duration', category: 'symptom',
    type: 'number', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhea_frequency: {
    featureId: 'diarrhea_frequency', label: 'How many times per day are you passing loose stool?',
    shortLabel: 'Stool frequency', category: 'symptom',
    type: 'select', options: ['1-3 times/day', '4-6 times/day', '>6 times/day', 'Continuous/Unable to count'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhea_consistency: {
    featureId: 'diarrhea_consistency', label: 'What is the consistency of the diarrhoea?',
    shortLabel: 'Stool consistency', category: 'symptom',
    type: 'select', options: ['Soft blobs', 'Mushy', 'Watery', 'Gushes of water'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhea_nocturnal: {
    featureId: 'diarrhea_nocturnal', label: 'Does the diarrhoea wake you up from sleep?',
    shortLabel: 'Nocturnal diarrhoea', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },
  diarrhea_volume: {
    featureId: 'diarrhea_volume', label: 'How large is each stool volume?',
    shortLabel: 'Stool volume', category: 'symptom',
    type: 'select', options: ['Small volume', 'Moderate', 'Large volume', 'Watery gushes'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'diarrhea', value: true },
  },

  // ── ABDOMINAL DISTENSION CHARACTERIZATION ─────────────────
  distension_onset: {
    featureId: 'distension_onset', label: 'Did the distension come on suddenly or gradually?',
    shortLabel: 'Distension onset', category: 'symptom',
    type: 'select', options: ['Sudden (hours)', 'Gradual (days)', 'Slow (weeks/months)'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'abdominal_distension', value: true },
  },
  distension_progression: {
    featureId: 'distension_progression', label: 'Is the distension getting worse?',
    shortLabel: 'Distension progression', category: 'symptom',
    type: 'select', options: ['Stable', 'Getting worse', 'Coming and going', 'Getting better'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'abdominal_distension', value: true },
  },
  distension_gas_passage_relief: {
    featureId: 'distension_gas_passage_relief', label: 'Does passing gas relieve the distension?',
    shortLabel: 'Relief with flatus', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'abdominal_distension', value: true },
  },
  distension_pain_relation: {
    featureId: 'distension_pain_relation', label: 'Is the distension related to the pain?',
    shortLabel: 'Distension-pain relation', category: 'symptom',
    type: 'select', options: ['Pain started first, then distension', 'Distension first, then pain', 'Both started together', 'No clear relation'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'abdominal_distension', value: true },
  },
  distension_site: {
    featureId: 'distension_site', label: 'Which part of your abdomen is most enlarged?',
    shortLabel: 'Distension site', category: 'symptom',
    type: 'select', options: ['Whole abdomen (generalised)', 'Upper abdomen', 'Lower abdomen', 'Left side only', 'Right side only', 'Around the navel'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'abdominal_distension', value: true },
  },
  distension_character: {
    featureId: 'distension_character', label: 'How would you describe the feeling of distension?',
    shortLabel: 'Distension character', category: 'symptom',
    type: 'select', options: ['Tight and tense', 'Bloated but soft', 'Hard/firm to touch', 'Comes and goes (intermittent)', 'Feels like a mass'],
    sensitivity: 0.4, specificity: 0.75, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'abdominal_distension', value: true },
  },
  distension_worse_after_meals: {
    featureId: 'distension_worse_after_meals', label: 'Is the distension worse after eating?',
    shortLabel: 'Postprandial distension', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.65, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'abdominal_distension', value: true },
  },
  distension_timing_cyclical: {
    featureId: 'distension_timing_cyclical', label: 'Does the distension come and go in cycles?',
    shortLabel: 'Cyclical distension', category: 'symptom',
    type: 'select', options: ['No — constant', 'Yes — daily pattern', 'Yes — weekly pattern', 'Yes — related to menstrual cycle'],
    sensitivity: 0.3, specificity: 0.8, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'abdominal_distension', value: true },
  },
  early_satiety: {
    featureId: 'early_satiety', label: 'Do you feel full soon after starting to eat?',
    shortLabel: 'Early satiety', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [2, 3],
  },
  leg_swelling: {
    featureId: 'leg_swelling', label: 'Have you noticed swelling in your feet or legs?',
    shortLabel: 'Leg swelling / pedal oedema', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.75, stageRelevance: [2, 3],
  },
  splenomegaly: {
    featureId: 'splenomegaly', label: 'Have you been told you have an enlarged spleen or do you feel fullness in your left upper abdomen?',
    shortLabel: 'Splenomegaly', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.9, stageRelevance: [2, 3],
  },

  // ── DYSPHAGIA CHARACTERIZATION ────────────────────────────
  dysphagia_solids_liquids: {
    featureId: 'dysphagia_solids_liquids', label: 'Do you have trouble swallowing solids, liquids, or both?',
    shortLabel: 'Dysphagia to', category: 'symptom',
    type: 'select', options: ['Solids only', 'Liquids only', 'Both solids and liquids', 'Neither, just pain on swallowing'],
    sensitivity: 0.6, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_progressive: {
    featureId: 'dysphagia_progressive', label: 'Has the swallowing difficulty been getting worse over time?',
    shortLabel: 'Progressive dysphagia', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.85, stageRelevance: [1, 2],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_odynophagia: {
    featureId: 'dysphagia_odynophagia', label: 'Is swallowing painful?',
    shortLabel: 'Painful swallowing', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_level: {
    featureId: 'dysphagia_level', label: 'Where do you feel food getting stuck?',
    shortLabel: 'Level of obstruction', category: 'symptom',
    type: 'select', options: ['Throat/neck', 'Behind the breastbone', 'Lower chest', 'At the top of the stomach'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_regurgitation: {
    featureId: 'dysphagia_regurgitation', label: 'Does food come back up after swallowing?',
    shortLabel: 'Regurgitation', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_onset: {
    featureId: 'dysphagia_onset', label: 'When did the swallowing difficulty begin?',
    shortLabel: 'Dysphagia onset', category: 'symptom',
    type: 'select', options: ['Suddenly (hours to days)', 'Over weeks to months', 'Over many months to years', 'Comes and goes'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_aspiration: {
    featureId: 'dysphagia_aspiration', label: 'Do you cough or choke when eating or drinking?',
    shortLabel: 'Aspiration/choking', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.85, stageRelevance: [1, 2],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_weight_loss: {
    featureId: 'dysphagia_weight_loss', label: 'Have you lost weight because of the swallowing difficulty?',
    shortLabel: 'Weight loss', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.9, stageRelevance: [2, 3],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_neck_mass: {
    featureId: 'dysphagia_neck_mass', label: 'Do you have a lump or swelling in your neck?',
    shortLabel: 'Neck mass', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.95, stageRelevance: [2, 3],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_hoarseness: {
    featureId: 'dysphagia_hoarseness', label: 'Have you noticed any hoarseness or voice change?',
    shortLabel: 'Hoarseness', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_heartburn: {
    featureId: 'dysphagia_heartburn', label: 'Do you have frequent heartburn or acid reflux?',
    shortLabel: 'Heartburn history', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_neurological: {
    featureId: 'dysphagia_neurological', label: 'Do you have any other neurological symptoms like slurred speech or weakness?',
    shortLabel: 'Neurological symptoms', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_nasal_regurgitation: {
    featureId: 'dysphagia_nasal_regurgitation', label: 'Does food or liquid come through your nose?',
    shortLabel: 'Nasal regurgitation', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.95, stageRelevance: [2, 3],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_drooling: {
    featureId: 'dysphagia_drooling', label: 'Do you have difficulty managing your saliva?',
    shortLabel: 'Drooling', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.9, stageRelevance: [2, 3],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_alcohol_smoking: {
    featureId: 'dysphagia_alcohol_smoking', label: 'Do you smoke tobacco or drink alcohol regularly?',
    shortLabel: 'Smoking/alcohol', category: 'risk_factor',
    type: 'select', options: ['Neither', 'Smokes', 'Drinks alcohol', 'Both'],
    sensitivity: 0.6, specificity: 0.7, stageRelevance: [3, 4],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_caustic: {
    featureId: 'dysphagia_caustic', label: 'Have you ever swallowed a chemical or cleaner?',
    shortLabel: 'Caustic ingestion', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.2, specificity: 0.99, stageRelevance: [3, 4],
    dependsOn: { featureId: 'dysphagia', value: true },
  },
  dysphagia_medication_induced: {
    featureId: 'dysphagia_medication_induced', label: 'Do you take any medications that might cause swallowing problems?',
    shortLabel: 'Pill-induced', category: 'risk_factor',
    type: 'select', options: ['No', 'Bisphosphonates', 'NSAIDs', 'Doxycycline', 'Potassium', 'Iron', 'Other'],
    sensitivity: 0.3, specificity: 0.9, stageRelevance: [3, 4],
    dependsOn: { featureId: 'dysphagia', value: true },
  },

  // ── ODYNOPHAGIA CHARACTERIZATION ──────────────────────────
  odynophagia: {
    featureId: 'odynophagia', label: 'Do you have pain when swallowing?', shortLabel: 'Odynophagia',
    category: 'symptom', type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [1],
  },
  odynophagia_location: {
    featureId: 'odynophagia_location', label: 'Where do you feel the pain when swallowing?',
    shortLabel: 'Pain location', category: 'symptom',
    type: 'select', options: ['Throat/neck', 'Behind the breastbone', 'Lower chest', 'Radiating to the back'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'odynophagia', value: true },
  },
  odynophagia_pain_character: {
    featureId: 'odynophagia_pain_character', label: 'What does the pain feel like?',
    shortLabel: 'Pain character', category: 'symptom',
    type: 'select', options: ['Burning', 'Sharp/stabbing', 'Deep ache', 'Pressure-like', 'Cramping'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'odynophagia', value: true },
  },
  odynophagia_fever: {
    featureId: 'odynophagia_fever', label: 'Do you have a fever?',
    shortLabel: 'Fever', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'odynophagia', value: true },
  },
  odynophagia_immunocompromised: {
    featureId: 'odynophagia_immunocompromised', label: 'Are you immunocompromised (HIV, chemotherapy, steroids)?',
    shortLabel: 'Immunocompromised', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.3, specificity: 0.9, stageRelevance: [3, 4],
    dependsOn: { featureId: 'odynophagia', value: true },
  },

  // ── HEMATEMESIS CHARACTERIZATION ──────────────────────────
  hematemesis_volume: {
    featureId: 'hematemesis_volume', label: 'How much blood have you vomited?',
    shortLabel: 'Vomit blood volume', category: 'symptom',
    type: 'select', options: ['Streaks of blood', 'Small amount (< half a cup)', 'Moderate (cup-sized)', 'Massive / gushing'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematemesis', value: true },
  },
  hematemesis_color: {
    featureId: 'hematemesis_color', label: 'What colour was the blood you vomited?',
    shortLabel: 'Vomit blood colour', category: 'symptom',
    type: 'select', options: ['Bright red', 'Dark red', 'Like coffee grounds', 'Mixed with food'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematemesis', value: true },
  },
  hematemesis_frequency: {
    featureId: 'hematemesis_frequency', label: 'How many times have you vomited blood?',
    shortLabel: 'Haematemesis episodes', category: 'symptom',
    type: 'select', options: ['Once', '2-3 times', 'Multiple ongoing episodes', 'Recurrent over days'],
    sensitivity: 0.4, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematemesis', value: true },
  },

  // ── MELENA CHARACTERIZATION ───────────────────────────────
  melena_frequency: {
    featureId: 'melena_frequency', label: 'How many times have you passed black/tarry stool?',
    shortLabel: 'Melena frequency', category: 'symptom',
    type: 'select', options: ['Once', '2-3 times', 'Every bowel movement', 'Continuous/ongoing'],
    sensitivity: 0.4, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'melena', value: true },
  },
  melena_volume: {
    featureId: 'melena_volume', label: 'How much black stool are you passing each time?',
    shortLabel: 'Melena volume', category: 'symptom',
    type: 'select', options: ['Spotty / streaks', 'Small amounts', 'Large volume', 'Profuse / running off'],
    sensitivity: 0.4, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'melena', value: true },
  },
  melena_duration_days: {
    featureId: 'melena_duration_days', label: 'How many days have you had black stool?',
    shortLabel: 'Melena duration', category: 'symptom',
    type: 'number', sensitivity: 0.4, specificity: 0.7, stageRelevance: [2, 3],
    dependsOn: { featureId: 'melena', value: true },
  },
  melena_hematemesis_association: {
    featureId: 'melena_hematemesis_association', label: 'Have you also vomited blood?',
    shortLabel: 'Associated haematemesis', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'melena', value: true },
  },

  // ── HEMATOCHEZIA CHARACTERIZATION ─────────────────────────
  hematochezia_volume: {
    featureId: 'hematochezia_volume', label: 'How much blood are you passing per rectum?',
    shortLabel: 'PR bleed volume', category: 'symptom',
    type: 'select', options: ['Streaks on toilet paper', 'On surface of stool', 'Mixed with stool', 'Clots', 'Profuse / running off'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematochezia', value: true },
  },
  hematochezia_color: {
    featureId: 'hematochezia_color', label: 'What colour is the blood?',
    shortLabel: 'Blood colour', category: 'symptom',
    type: 'select', options: ['Bright red', 'Dark red', 'Maroon / Burgundy', 'Mixed with mucus'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematochezia', value: true },
  },
  hematochezia_relation_to_stool: {
    featureId: 'hematochezia_relation_to_stool', label: 'How is the blood related to your stool?',
    shortLabel: 'Blood-stool relation', category: 'symptom',
    type: 'select', options: ['On toilet paper only', 'On surface of stool', 'Mixed throughout stool', 'Separate from stool', 'Only in toilet bowl'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematochezia', value: true },
  },
  hematochezia_frequency: {
    featureId: 'hematochezia_frequency', label: 'How often are you passing blood?',
    shortLabel: 'Bleeding frequency', category: 'symptom',
    type: 'select', options: ['Single episode', 'With every stool', 'Occasional stools', 'Continuous oozing'],
    sensitivity: 0.4, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematochezia', value: true },
  },

  // ── GI BLEEDING CONTEXT FEATURES ──────────────────────────
  gi_bleeding_vomiting_first: {
    featureId: 'gi_bleeding_vomiting_first', label: 'Did the vomiting start before the bleeding?',
    shortLabel: 'Vomit before blood', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematemesis', value: true },
  },
  gi_bleeding_painless: {
    featureId: 'gi_bleeding_painless', label: 'Is the bleeding painless?',
    shortLabel: 'Painless bleeding', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematochezia', value: true },
  },
  gi_bleeding_liver_disease: {
    featureId: 'gi_bleeding_liver_disease', label: 'Do you have known liver disease or cirrhosis?',
    shortLabel: 'Liver disease', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.3, specificity: 0.95, stageRelevance: [3, 4],
    dependsOn: { featureId: 'hematemesis', value: true },
  },
  gi_bleeding_known_varices: {
    featureId: 'gi_bleeding_known_varices', label: 'Have you been told you have esophageal varices?',
    shortLabel: 'Known varices', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.2, specificity: 0.99, stageRelevance: [3, 4],
    dependsOn: { featureId: 'hematemesis', value: true },
  },
  gi_bleeding_known_aaa: {
    featureId: 'gi_bleeding_known_aaa', label: 'Do you have an aortic aneurysm or have you had aortic surgery?',
    shortLabel: 'AAA history', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.2, specificity: 0.99, stageRelevance: [3, 4],
    dependsOn: { featureId: 'hematochezia', value: true },
  },
  gi_bleeding_dysphagia: {
    featureId: 'gi_bleeding_dysphagia', label: 'Have you had difficulty swallowing recently?',
    shortLabel: 'Dysphagia history', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.9, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematemesis', value: true },
  },
  gi_bleeding_weight_loss: {
    featureId: 'gi_bleeding_weight_loss', label: 'Have you lost weight unintentionally?',
    shortLabel: 'Weight loss with bleeding', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematochezia', value: true },
  },
  gi_bleeding_prior_gi_bleed: {
    featureId: 'gi_bleeding_prior_gi_bleed', label: 'Have you ever had GI bleeding before?',
    shortLabel: 'Prior GI bleed', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.3, specificity: 0.9, stageRelevance: [3, 4],
    dependsOn: { featureId: 'hematemesis', value: true },
  },
  gi_bleeding_syncope: {
    featureId: 'gi_bleeding_syncope', label: 'Have you fainted or felt lightheaded during this episode?',
    shortLabel: 'Syncope with bleeding', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.9, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematemesis', value: true },
  },
  gi_bleeding_iron_deficiency: {
    featureId: 'gi_bleeding_iron_deficiency', label: 'Have you been told you have low iron or anemia?',
    shortLabel: 'Iron deficiency', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematochezia', value: true },
  },

  // ── JAUNDICE CHARACTERIZATION ─────────────────────────────
  jaundice_onset: {
    featureId: 'jaundice_onset', label: 'Did the yellowing come on suddenly or gradually?',
    shortLabel: 'Jaundice onset', category: 'symptom',
    type: 'select', options: ['Sudden (days)', 'Gradual (weeks)', 'Fluctuating / comes and goes'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_progression: {
    featureId: 'jaundice_progression', label: 'Is the yellowing getting worse?',
    shortLabel: 'Jaundice progression', category: 'symptom',
    type: 'select', options: ['Getting worse', 'Staying the same', 'Fluctuating', 'Getting better'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_pruritus: {
    featureId: 'jaundice_pruritus', label: 'Do you have itching along with the yellowing?',
    shortLabel: 'Itching (pruritus)', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_dark_urine: {
    featureId: 'jaundice_dark_urine', label: 'Is your urine dark like tea or cola?',
    shortLabel: 'Dark urine', category: 'symptom',
    type: 'boolean', sensitivity: 0.6, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_pale_stool: {
    featureId: 'jaundice_pale_stool', label: 'Are your stools pale or clay-coloured?',
    shortLabel: 'Pale stool', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.9, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_abdominal_pain: {
    featureId: 'jaundice_abdominal_pain', label: 'Do you have pain in your abdomen?',
    shortLabel: 'Jaundice pain', category: 'symptom',
    type: 'select', options: ['None', 'RUQ discomfort', 'Severe RUQ pain', 'Epigastric pain', 'Generalised abdominal pain'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_fever: {
    featureId: 'jaundice_fever', label: 'Do you have a fever?',
    shortLabel: 'Jaundice fever', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_weight_loss: {
    featureId: 'jaundice_weight_loss', label: 'Have you lost weight unintentionally?',
    shortLabel: 'Jaundice weight loss', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_ascites: {
    featureId: 'jaundice_ascites', label: 'Has your abdomen been swelling up?',
    shortLabel: 'Ascites', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.9, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_confusion: {
    featureId: 'jaundice_confusion', label: 'Have you been confused or unusually sleepy?',
    shortLabel: 'Confusion/encephalopathy', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.9, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_anemia: {
    featureId: 'jaundice_anemia', label: 'Have you been told you are anaemic or felt very tired?',
    shortLabel: 'Anaemia symptoms', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.7, stageRelevance: [2, 3],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_alcohol_history: {
    featureId: 'jaundice_alcohol_history', label: 'How much alcohol do you drink?',
    shortLabel: 'Alcohol history', category: 'risk_factor',
    type: 'select', options: ['None', 'Moderate', 'Heavy daily', 'Binge drinker'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [3, 4],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_viral_risk: {
    featureId: 'jaundice_viral_risk', label: 'Do you have any risk factors for hepatitis?',
    shortLabel: 'Hepatitis risk', category: 'risk_factor',
    type: 'select', options: ['None', 'Blood transfusion', 'IV drug use', 'Tattoo/piercing', 'Travel to endemic area', 'Unprotected sex'],
    sensitivity: 0.4, specificity: 0.85, stageRelevance: [3, 4],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_drug_history: {
    featureId: 'jaundice_drug_history', label: 'Are you taking any medications or herbal remedies?',
    shortLabel: 'Drug history', category: 'risk_factor',
    type: 'select', options: ['None', 'Acetaminophen/Paracetamol', 'Anti-TB drugs', 'Statins', 'Antiepileptics', 'Herbal remedies', 'Other'],
    sensitivity: 0.4, specificity: 0.85, stageRelevance: [3, 4],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_pregnancy: {
    featureId: 'jaundice_pregnancy', label: 'Are you pregnant?',
    shortLabel: 'Pregnancy status', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.2, specificity: 0.95, stageRelevance: [3, 4],
    dependsOn: { featureId: 'jaundice', value: true },
  },
  jaundice_family_history: {
    featureId: 'jaundice_family_history', label: 'Is there a family history of jaundice or liver disease?',
    shortLabel: 'Family history', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.3, specificity: 0.9, stageRelevance: [3, 4],
    dependsOn: { featureId: 'jaundice', value: true },
  },

  // ── HEARTBURN / REFLUX CHARACTERIZATION ───────────────────
  heartburn_frequency: {
    featureId: 'heartburn_frequency', label: 'How often do you get heartburn?',
    shortLabel: 'Heartburn frequency', category: 'symptom',
    type: 'select', options: ['Less than once a week', 'A few times a week', 'Daily', 'Multiple times daily'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'heartburn', value: true },
  },
  heartburn_relation_to_meals: {
    featureId: 'heartburn_relation_to_meals', label: 'When does the heartburn occur?',
    shortLabel: 'Heartburn timing', category: 'symptom',
    type: 'select', options: ['After meals', 'On empty stomach', 'When lying down', 'Any time / no pattern'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'heartburn', value: true },
  },
  heartburn_nocturnal: {
    featureId: 'heartburn_nocturnal', label: 'Does heartburn wake you from sleep?',
    shortLabel: 'Nocturnal heartburn', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'heartburn', value: true },
  },
  heartburn_regurgitation: {
    featureId: 'heartburn_regurgitation', label: 'Do you get a bitter or sour taste in your mouth?',
    shortLabel: 'Acid regurgitation', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'heartburn', value: true },
  },

  // ── ANOREXIA CHARACTERIZATION ─────────────────────────────
  anorexia_duration_days: {
    featureId: 'anorexia_duration_days', label: 'How many days have you had poor appetite?',
    shortLabel: 'Anorexia duration', category: 'symptom',
    type: 'number', sensitivity: 0.4, specificity: 0.6, stageRelevance: [1, 2],
    dependsOn: { featureId: 'anorexia', value: true },
  },
  anorexia_severity: {
    featureId: 'anorexia_severity', label: 'How severe is your appetite loss?',
    shortLabel: 'Anorexia severity', category: 'symptom',
    type: 'select', options: ['Mild (eating less but still eating)', 'Moderate (only small amounts)', 'Severe (cannot eat at all / aversion to food)'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'anorexia', value: true },
  },

  // ── WEIGHT LOSS CHARACTERIZATION ──────────────────────────
  weight_loss_amount_kg: {
    featureId: 'weight_loss_amount_kg', label: 'How much weight have you lost? (in kg)',
    shortLabel: 'Weight loss amount', category: 'symptom',
    type: 'number', sensitivity: 0.5, specificity: 0.7, stageRelevance: [2, 3],
    dependsOn: { featureId: 'weight_loss', value: true },
  },
  weight_loss_period_weeks: {
    featureId: 'weight_loss_period_weeks', label: 'Over how many weeks have you lost this weight?',
    shortLabel: 'Weight loss period', category: 'symptom',
    type: 'number', sensitivity: 0.4, specificity: 0.7, stageRelevance: [2, 3],
    dependsOn: { featureId: 'weight_loss', value: true },
  },
  weight_loss_intentional: {
    featureId: 'weight_loss_intentional', label: 'Is the weight loss intentional (diet/exercise)?',
    shortLabel: 'Intentional weight loss', category: 'symptom',
    type: 'boolean', sensitivity: 0.2, specificity: 0.9, stageRelevance: [2, 3],
    dependsOn: { featureId: 'weight_loss', value: true },
  },

  // ── NAUSEA CHARACTERIZATION ───────────────────────────────
  nausea_severity: {
    featureId: 'nausea_severity', label: 'How severe is the nausea?',
    shortLabel: 'Nausea severity', category: 'symptom',
    type: 'select', options: ['Mild (aware but eating normally)', 'Moderate (limits eating)', 'Severe (cannot eat, incapacitating)'],
    sensitivity: 0.4, specificity: 0.6, stageRelevance: [1, 2],
    dependsOn: { featureId: 'nausea', value: true },
  },
  nausea_relation_to_eating: {
    featureId: 'nausea_relation_to_eating', label: 'When do you feel nauseous?',
    shortLabel: 'Nausea timing', category: 'symptom',
    type: 'select', options: ['Before meals', 'After meals', 'On empty stomach', 'All the time', 'Only in mornings'],
    sensitivity: 0.4, specificity: 0.6, stageRelevance: [1, 2],
    dependsOn: { featureId: 'nausea', value: true },
  },

  // ── FEVER CHARACTERIZATION ────────────────────────────────
  fever_temperature: {
    featureId: 'fever_temperature', label: 'What is the highest temperature measured? (°C)',
    shortLabel: 'Fever height', category: 'symptom',
    type: 'number', sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'fever', value: true },
  },
  fever_duration_days: {
    featureId: 'fever_duration_days', label: 'How many days have you had fever?',
    shortLabel: 'Fever duration', category: 'symptom',
    type: 'number', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'fever', value: true },
  },
  fever_pattern: {
    featureId: 'fever_pattern', label: 'What pattern does the fever follow?',
    shortLabel: 'Fever pattern', category: 'symptom',
    type: 'select', options: ['Continuous (always elevated)', 'Intermittent (spikes and falls)', 'Comes and goes in cycles', 'Only in the evenings'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'fever', value: true },
  },

  // ── DYSURIA CHARACTERIZATION ──────────────────────────────
  dysuria_character: {
    featureId: 'dysuria_character', label: 'How would you describe the pain when passing urine?',
    shortLabel: 'Dysuria character', category: 'symptom',
    type: 'select', options: ['Burning sensation', 'Stinging', 'Sharp pain', 'Discomfort / heaviness', 'Difficulty starting'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'dysuria', value: true },
  },
  dysuria_timing: {
    featureId: 'dysuria_timing', label: 'When during urination do you feel the pain?',
    shortLabel: 'Dysuria timing', category: 'symptom',
    type: 'select', options: ['At start of stream', 'During urination', 'At end of stream', 'After urination', 'Throughout'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'dysuria', value: true },
  },

  // ── HEMATURIA CHARACTERIZATION ────────────────────────────
  hematuria_visible: {
    featureId: 'hematuria_visible', label: 'Can you see the blood in your urine?',
    shortLabel: 'Visible blood', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'hematuria', value: true },
  },
  hematuria_painful: {
    featureId: 'hematuria_painful', label: 'Is the bloody urine painful?',
    shortLabel: 'Painful haematuria', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'hematuria', value: true },
  },
  hematuria_timing: {
    featureId: 'hematuria_timing', label: 'When does the blood appear?',
    shortLabel: 'Blood timing in stream', category: 'symptom',
    type: 'select', options: ['At the start', 'Throughout the stream', 'At the end', 'Only in the morning', 'After exercise'],
    sensitivity: 0.4, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'hematuria', value: true },
  },
  hematuria_clots: {
    featureId: 'hematuria_clots', label: 'Are there clots (jelly-like lumps) in the urine?',
    shortLabel: 'Blood clots', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'hematuria', value: true },
  },

  // ── VAGINAL BLEEDING CHARACTERIZATION ─────────────────────
  vaginal_bleeding_volume: {
    featureId: 'vaginal_bleeding_volume', label: 'How heavy is the vaginal bleeding?',
    shortLabel: 'Bleeding volume', category: 'symptom',
    type: 'select', options: ['Spotting only', 'Light (like period)', 'Moderate', 'Heavy (soaking pad <1 hour)', 'Flooding / gushing'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'vaginal_bleeding', value: true },
  },
  vaginal_bleeding_relation_to_period: {
    featureId: 'vaginal_bleeding_relation_to_period', label: 'How does this bleeding relate to your period?',
    shortLabel: 'Bleeding vs period', category: 'symptom',
    type: 'select', options: ['During normal period', 'Between periods', 'After sex', 'After menopause', 'Continuous / unpredictable'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'vaginal_bleeding', value: true },
  },
  vaginal_bleeding_duration_days: {
    featureId: 'vaginal_bleeding_duration_days', label: 'How many days has the bleeding lasted?',
    shortLabel: 'Bleeding duration', category: 'symptom',
    type: 'number', sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'vaginal_bleeding', value: true },
  },
  vaginal_bleeding_color: {
    featureId: 'vaginal_bleeding_color', label: 'What colour is the blood?',
    shortLabel: 'Blood colour', category: 'symptom',
    type: 'select', options: ['Bright red', 'Dark red / brown', 'Mixed with clots', 'Pink / watery'],
    sensitivity: 0.3, specificity: 0.8, stageRelevance: [1, 2, 3],
    dependsOn: { featureId: 'vaginal_bleeding', value: true },
  },

  // ── VAGINAL DISCHARGE CHARACTERIZATION ────────────────────
  vaginal_discharge_color: {
    featureId: 'vaginal_discharge_color', label: 'What colour is the discharge?',
    shortLabel: 'Discharge colour', category: 'symptom',
    type: 'select', options: ['Clear', 'White', 'Yellow', 'Green', 'Brown', 'Bloody'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'vaginal_discharge', value: true },
  },
  vaginal_discharge_odor: {
    featureId: 'vaginal_discharge_odor', label: 'Does the discharge have a smell?',
    shortLabel: 'Discharge odour', category: 'symptom',
    type: 'select', options: ['No smell', 'Foul / offensive', 'Fishy', 'Musty'],
    sensitivity: 0.4, specificity: 0.85, stageRelevance: [1, 2],
    dependsOn: { featureId: 'vaginal_discharge', value: true },
  },
  vaginal_discharge_consistency: {
    featureId: 'vaginal_discharge_consistency', label: 'What is the consistency of the discharge?',
    shortLabel: 'Discharge consistency', category: 'symptom',
    type: 'select', options: ['Watery', 'Thin', 'Thick', 'Curd-like / clumpy', 'Frothy / bubbly'],
    sensitivity: 0.5, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'vaginal_discharge', value: true },
  },
  vaginal_discharge_itching: {
    featureId: 'vaginal_discharge_itching', label: 'Do you have itching or irritation along with the discharge?',
    shortLabel: 'Vaginal itching', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.8, stageRelevance: [1, 2],
    dependsOn: { featureId: 'vaginal_discharge', value: true },
  },

  // ── URINARY RETENTION CHARACTERIZATION ────────────────────
  urinary_retention_acuity: {
    featureId: 'urinary_retention_acuity', label: 'Did the difficulty passing urine come on suddenly or gradually?',
    shortLabel: 'Retention onset', category: 'symptom',
    type: 'select', options: ['Sudden (could not pass urine at all)', 'Gradual (getting worse over time)'],
    sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'urinary_retention', value: true },
  },
  urinary_retention_painful: {
    featureId: 'urinary_retention_painful', label: 'Is the inability to pass urine painful?',
    shortLabel: 'Painful retention', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'urinary_retention', value: true },
  },
  urinary_retention_hesitancy: {
    featureId: 'urinary_retention_hesitancy', label: 'Do you have difficulty starting to pass urine?',
    shortLabel: 'Hesitancy', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.75, stageRelevance: [1, 2],
    dependsOn: { featureId: 'urinary_retention', value: true },
  },
  urinary_retention_weak_stream: {
    featureId: 'urinary_retention_weak_stream', label: 'Is your urine stream weak?',
    shortLabel: 'Weak stream', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.75, stageRelevance: [1, 2],
    dependsOn: { featureId: 'urinary_retention', value: true },
  },

  // ── BLOATING CHARACTERIZATION ─────────────────────────────
  bloating_relation_to_meals: {
    featureId: 'bloating_relation_to_meals', label: 'Does the bloating come after meals?',
    shortLabel: 'Bloating after meals', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.6, stageRelevance: [1, 2],
    dependsOn: { featureId: 'bloating', value: true },
  },
  bloating_timing: {
    featureId: 'bloating_timing', label: 'When is the bloating worst?',
    shortLabel: 'Bloating timing', category: 'symptom',
    type: 'select', options: ['Worse in the evening', 'After meals', 'Throughout the day', 'On waking in the morning'],
    sensitivity: 0.4, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'bloating', value: true },
  },
  bloating_relief_gas: {
    featureId: 'bloating_relief_gas', label: 'Does passing gas relieve the bloating?',
    shortLabel: 'Relief with flatus', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.75, stageRelevance: [1, 2],
    dependsOn: { featureId: 'bloating', value: true },
  },

  // ── CONSTIPATION SOCRATES FEATURES ──────────────────────────

  constipation_duration: {
    featureId: 'constipation_duration', label: 'How long have you had constipation?',
    shortLabel: 'Constipation duration', category: 'symptom',
    type: 'select', options: ['Days (acute)', 'Weeks', 'Months', 'Years (lifelong)', 'Since birth'],
    sensitivity: 0.6, specificity: 0.7, stageRelevance: [1],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_stool_frequency: {
    featureId: 'constipation_stool_frequency', label: 'How often do you pass stool per week?',
    shortLabel: 'Stool frequency', category: 'symptom',
    type: 'select', options: ['3–5 times per week', '1–2 times per week', 'Less than once per week', 'No stool for days'],
    sensitivity: 0.7, specificity: 0.6, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_stool_consistency: {
    featureId: 'constipation_stool_consistency', label: 'What are your stools like?',
    shortLabel: 'Stool consistency', category: 'symptom',
    type: 'select', options: ['Hard pellets (rabbit-like)', 'Large and painful to pass', 'Ribbon-like or pencil-thin', 'Normal consistency but hard to pass', 'Watery leakage around hard stool (overflow)'],
    sensitivity: 0.65, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_straining: {
    featureId: 'constipation_straining', label: 'Do you have to strain to pass stool?',
    shortLabel: 'Straining', category: 'symptom',
    type: 'boolean', sensitivity: 0.6, specificity: 0.65, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_incomplete_evacuation: {
    featureId: 'constipation_incomplete_evacuation', label: 'Do you feel like you haven\'t fully emptied your bowels?',
    shortLabel: 'Incomplete evacuation', category: 'symptom',
    type: 'boolean', sensitivity: 0.55, specificity: 0.65, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_manual_maneuvers: {
    featureId: 'constipation_manual_maneuvers', label: 'Do you need to use your fingers to help pass stool?',
    shortLabel: 'Manual maneuvers', category: 'symptom',
    type: 'boolean', sensitivity: 0.7, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_abdominal_pain: {
    featureId: 'constipation_abdominal_pain', label: 'Do you have abdominal pain with your constipation?',
    shortLabel: 'Pain with constipation', category: 'symptom',
    type: 'select', options: ['No pain', 'Pain relieved by passing stool', 'Pain not relieved by passing stool'],
    sensitivity: 0.5, specificity: 0.65, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_bloating: {
    featureId: 'constipation_bloating', label: 'Do you feel bloated with the constipation?',
    shortLabel: 'Constipation bloating', category: 'symptom',
    type: 'boolean', sensitivity: 0.45, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_rectal_bleeding: {
    featureId: 'constipation_rectal_bleeding', label: 'Have you noticed blood with your constipation?',
    shortLabel: 'Rectal bleeding', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.9, stageRelevance: [2, 3],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_tenesmus: {
    featureId: 'constipation_tenesmus', label: 'Do you have a persistent feeling of needing to pass stool even when nothing comes?',
    shortLabel: 'Tenesmus', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_mucus: {
    featureId: 'constipation_mucus', label: 'Do you pass mucus with your stool?',
    shortLabel: 'Mucus in stool', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_overflow: {
    featureId: 'constipation_overflow', label: 'Do you have episodes of watery leakage despite being constipated?',
    shortLabel: 'Overflow diarrhoea', category: 'symptom',
    type: 'boolean', sensitivity: 0.75, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_neurological: {
    featureId: 'constipation_neurological', label: 'Do you have any numbness, weakness, or difficulty passing urine?',
    shortLabel: 'Neurological symptoms', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_endocrine: {
    featureId: 'constipation_endocrine', label: 'Do you have any cold intolerance, weight gain, or fatigue?',
    shortLabel: 'Endocrine symptoms', category: 'symptom',
    type: 'boolean', sensitivity: 0.4, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_medication_related: {
    featureId: 'constipation_medication_related', label: 'Did the constipation start after starting a new medication?',
    shortLabel: 'Medication related', category: 'symptom',
    type: 'boolean', sensitivity: 0.6, specificity: 0.75, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_obstipation: {
    featureId: 'constipation_obstipation', label: 'Are you passing any gas at all?',
    shortLabel: 'Obstipation check', category: 'symptom',
    type: 'select', options: ['Yes, passing gas', 'No gas at all (absolute constipation)', 'Not sure'],
    sensitivity: 0.85, specificity: 0.8, stageRelevance: [2, 3],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_abdominal_distension: {
    featureId: 'constipation_abdominal_distension', label: 'Is your abdomen swollen or distended with the constipation?',
    shortLabel: 'Distension with constipation', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.75, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_weight_loss: {
    featureId: 'constipation_weight_loss', label: 'Have you lost weight unintentionally with this constipation?',
    shortLabel: 'Weight loss', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.9, stageRelevance: [3, 4],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_vomiting: {
    featureId: 'constipation_vomiting', label: 'Are you vomiting along with the constipation?',
    shortLabel: 'Vomiting', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.85, stageRelevance: [2, 3],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_painful_defecation: {
    featureId: 'constipation_painful_defecation', label: 'Is passing stool painful?',
    shortLabel: 'Painful defecation', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [1, 2],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_dietary_fiber: {
    featureId: 'constipation_dietary_fiber', label: 'Do you eat enough fruits, vegetables, and fiber-rich foods?',
    shortLabel: 'Dietary fiber', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.5, stageRelevance: [1],
    dependsOn: { featureId: 'constipation', value: true },
  },
  constipation_fluid_intake: {
    featureId: 'constipation_fluid_intake', label: 'Do you drink enough water during the day?',
    shortLabel: 'Fluid intake', category: 'symptom',
    type: 'boolean', sensitivity: 0.3, specificity: 0.5, stageRelevance: [1],
    dependsOn: { featureId: 'constipation', value: true },
  },

  // ── MISSING FEATURES (used by disease nodes — added to fix Vercel build) ──
  abdominal_pain: {
    featureId: 'abdominal_pain', label: 'Do you have abdominal pain?',
    shortLabel: 'Abdominal pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  aluminum_antacid_use: {
    featureId: 'aluminum_antacid_use', label: 'Do you take aluminum-containing antacids?',
    shortLabel: 'Aluminum antacid use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  anal_pruritus: {
    featureId: 'anal_pruritus', label: 'Do you have anal itching?',
    shortLabel: 'Anal pruritus', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  anhedonia: {
    featureId: 'anhedonia', label: 'Have you lost interest in things you used to enjoy?',
    shortLabel: 'Anhedonia', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  anticholinergic_drug_use: {
    featureId: 'anticholinergic_drug_use', label: 'Do you take anticholinergic medications?',
    shortLabel: 'Anticholinergic use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  antipsychotic_use: {
    featureId: 'antipsychotic_use', label: 'Do you take antipsychotic medications?',
    shortLabel: 'Antipsychotic use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  ccb_use: {
    featureId: 'ccb_use', label: 'Do you take calcium channel blockers?',
    shortLabel: 'CCB use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  chagas_endemic_area: {
    featureId: 'chagas_endemic_area', label: 'Have you lived in or visited a Chagas-endemic area?',
    shortLabel: 'Chagas endemic area', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  chemotherapy_exposure: {
    featureId: 'chemotherapy_exposure', label: 'Have you had chemotherapy?',
    shortLabel: 'Chemotherapy exposure', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  chronic_diarrhoea: {
    featureId: 'chronic_diarrhoea', label: 'Do you have chronic diarrhoea?',
    shortLabel: 'Chronic diarrhoea', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  chronic_fatigue: {
    featureId: 'chronic_fatigue', label: 'Do you have chronic fatigue?',
    shortLabel: 'Chronic fatigue', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  cognitive_impairment: {
    featureId: 'cognitive_impairment', label: 'Do you have any cognitive impairment?',
    shortLabel: 'Cognitive impairment', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  congenital_anorectal_malformation: {
    featureId: 'congenital_anorectal_malformation', label: 'Do you have a history of congenital anorectal malformation?',
    shortLabel: 'Congenital anorectal malformation', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  diabetes_duration: {
    featureId: 'diabetes_duration', label: 'How long have you had diabetes?',
    shortLabel: 'Diabetes duration', category: 'contextual',
    type: 'number', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  diuretic_use: {
    featureId: 'diuretic_use', label: 'Do you take diuretics?',
    shortLabel: 'Diuretic use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  diverticulitis_history: {
    featureId: 'diverticulitis_history', label: 'Have you had diverticulitis before?',
    shortLabel: 'Diverticulitis history', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  dry_mouth: {
    featureId: 'dry_mouth', label: 'Do you have a dry mouth?',
    shortLabel: 'Dry mouth', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  dry_skin: {
    featureId: 'dry_skin', label: 'Do you have dry skin?',
    shortLabel: 'Dry skin', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  dysarthria: {
    featureId: 'dysarthria', label: 'Do you have slurred speech?',
    shortLabel: 'Dysarthria', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  familial_hht: {
    featureId: 'familial_hht', label: 'Do you have a family history of HHT (hereditary haemorrhagic telangiectasia)?',
    shortLabel: 'Familial HHT', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  heliotrope_rash: {
    featureId: 'heliotrope_rash', label: 'Do you have a purplish rash around your eyes?',
    shortLabel: 'Heliotrope rash', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  insomnia: {
    featureId: 'insomnia', label: 'Do you have trouble sleeping?',
    shortLabel: 'Insomnia', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  iron_supplement_use: {
    featureId: 'iron_supplement_use', label: 'Do you take iron supplements?',
    shortLabel: 'Iron supplement use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  leucocytosis: {
    featureId: 'leucocytosis', label: 'White blood cell count is elevated',
    shortLabel: 'Leucocytosis', category: 'investigation_result',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  loss_of_body_hair: {
    featureId: 'loss_of_body_hair', label: 'Have you lost body hair?',
    shortLabel: 'Loss of body hair', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  low_back_pain: {
    featureId: 'low_back_pain', label: 'Do you have lower back pain?',
    shortLabel: 'Lower back pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  lower_abdominal_pain_left: {
    featureId: 'lower_abdominal_pain_left', label: 'Do you have pain in the left lower abdomen?',
    shortLabel: 'LLQ pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  lower_abdominal_pain_right: {
    featureId: 'lower_abdominal_pain_right', label: 'Do you have pain in the right lower abdomen?',
    shortLabel: 'RLQ pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  macroglossia: {
    featureId: 'macroglossia', label: 'Is your tongue enlarged?',
    shortLabel: 'Macroglossia', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  morning_sickness: {
    featureId: 'morning_sickness', label: 'Do you have morning sickness?',
    shortLabel: 'Morning sickness', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  mucous_discharge: {
    featureId: 'mucous_discharge', label: 'Do you have mucus in your stool?',
    shortLabel: 'Mucous discharge', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  myalgia: {
    featureId: 'myalgia', label: 'Do you have muscle aches?',
    shortLabel: 'Myalgia', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  nausea_vomiting: {
    featureId: 'nausea_vomiting', label: 'Do you have nausea or vomiting?',
    shortLabel: 'Nausea / vomiting', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  neck_pain: {
    featureId: 'neck_pain', label: 'Do you have neck pain?',
    shortLabel: 'Neck pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  nephrolithiasis: {
    featureId: 'nephrolithiasis', label: 'Have you had kidney stones?',
    shortLabel: 'Nephrolithiasis', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  nocturnal_sweats: {
    featureId: 'nocturnal_sweats', label: 'Do you have night sweats?',
    shortLabel: 'Nocturnal sweats', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  numbness_tingling: {
    featureId: 'numbness_tingling', label: 'Do you have numbness or tingling?',
    shortLabel: 'Numbness / tingling', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  optic_neuritis: {
    featureId: 'optic_neuritis', label: 'Have you had optic neuritis?',
    shortLabel: 'Optic neuritis', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  palpitations: {
    featureId: 'palpitations', label: 'Do you feel your heart racing or pounding?',
    shortLabel: 'Palpitations', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  pelvic_pain: {
    featureId: 'pelvic_pain', label: 'Do you have pelvic pain?',
    shortLabel: 'Pelvic pain', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  pelvic_radiation_history: {
    featureId: 'pelvic_radiation_history', label: 'Have you had pelvic radiation therapy?',
    shortLabel: 'Pelvic radiation history', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  perianal_fistula: {
    featureId: 'perianal_fistula', label: 'Do you have a perianal fistula?',
    shortLabel: 'Perianal fistula', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  peripheral_oedema: {
    featureId: 'peripheral_oedema', label: 'Do you have swelling in your legs or ankles?',
    shortLabel: 'Peripheral oedema', category: 'sign',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  postural_hypotension: {
    featureId: 'postural_hypotension', label: 'Do you feel dizzy when standing up?',
    shortLabel: 'Postural hypotension', category: 'sign',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  prior_gi_bleed: {
    featureId: 'prior_gi_bleed', label: 'Have you had a GI bleed before?',
    shortLabel: 'Prior GI bleed', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  prior_volvulus: {
    featureId: 'prior_volvulus', label: 'Have you had a volvulus before?',
    shortLabel: 'Prior volvulus', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  proteinuria: {
    featureId: 'proteinuria', label: 'Protein is present in your urine',
    shortLabel: 'Proteinuria', category: 'investigation_result',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  proximal_muscle_weakness: {
    featureId: 'proximal_muscle_weakness', label: 'Do you have weakness in your shoulders or hips?',
    shortLabel: 'Proximal muscle weakness', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  sedation: {
    featureId: 'sedation', label: 'Do you feel sedated or drowsy?',
    shortLabel: 'Sedation', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  sensory_level: {
    featureId: 'sensory_level', label: 'Do you have a distinct level of numbness on your body?',
    shortLabel: 'Sensory level', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  spina_bifida: {
    featureId: 'spina_bifida', label: 'Do you have spina bifida?',
    shortLabel: 'Spina bifida', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  spinal_cord_injury: {
    featureId: 'spinal_cord_injury', label: 'Do you have a spinal cord injury?',
    shortLabel: 'Spinal cord injury', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  tachycardia: {
    featureId: 'tachycardia', label: 'Do you have a fast heart rate?',
    shortLabel: 'Tachycardia', category: 'sign',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1, 2, 3],
  },
  tca_use: {
    featureId: 'tca_use', label: 'Do you take tricyclic antidepressants?',
    shortLabel: 'TCA use', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },
  vitamin_k_prophylaxis: {
    featureId: 'vitamin_k_prophylaxis', label: 'Did the baby receive vitamin K at birth?',
    shortLabel: 'Vitamin K prophylaxis', category: 'risk_factor',
    type: 'boolean', sensitivity: 0.5, specificity: 0.5, stageRelevance: [1],
  },

  // ── PLACEHOLDER FEATURES (used by disease nodes) ───────────
  none: {
    featureId: 'none', label: 'None of the above',
    shortLabel: 'None', category: 'symptom',
    type: 'boolean', sensitivity: 0.01, specificity: 0.99, stageRelevance: [],
  },
  neurological: {
    featureId: 'neurological', label: 'Do you have any neurological symptoms?',
    shortLabel: 'Neurological symptoms', category: 'symptom',
    type: 'boolean', sensitivity: 0.5, specificity: 0.7, stageRelevance: [2, 3],
  },
};

/** Get a feature definition by ID */
export function getFeature(id: string): FeatureRecord {
  const f = FEATURES[id];
  if (!f) throw new Error(`Feature "${id}" not found in library`);
  return f;
}

/** LR+ computed from sensitivity and specificity */
export function computeLrPlus(sens: number, spec: number): number {
  return sens / (1 - spec);
}

/** LR- computed from sensitivity and specificity */
export function computeLrMinus(sens: number, spec: number): number {
  return (1 - sens) / spec;
}

/** Safely get LR+ with fallback */
export function getLrPlus(f: FeatureRecord): number {
  return f.LR_positive ?? computeLrPlus(f.sensitivity, f.specificity);
}

/** Safely get LR- with fallback */
export function getLrMinus(f: FeatureRecord): number {
  return f.LR_negative ?? computeLrMinus(f.sensitivity, f.specificity);
}
