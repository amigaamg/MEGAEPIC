// ═══════════════════════════════════════════════════════════════════════════════
// Abdominal Distension Manifestation Profiles
// Every disease that causes abdominal distension describes its typical pattern here.
// The engine uses these to ask discriminating questions and generate better HPI.
// ═══════════════════════════════════════════════════════════════════════════════

import type { DistensionManifestation } from '../diseaseNode';

export const DISTENSION_MANIFESTATIONS: Record<string, DistensionManifestation> = {

  // ── BOWEL OBSTRUCTION ──────────────────────────────────────

  sbo_adhesions: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'intermittent', postprandial: 'yes', associatedPain: 'always', painType: 'colicky_cramping', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Generalised abdominal distension that worsens over hours to days, accompanied by colicky periumbilical pain and obstipation. Distension is intermittent early, becoming constant as obstruction progresses.',
  },

  sbo_hernia: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Abdominal distension develops rapidly after hernia incarceration, with severe constant pain at the hernia site progressing to generalised tenderness. Distension is tense and progressive.',
  },

  sbo_tumor: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'intermittent', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'night_sweats'],
    typicalDescription: 'Gradually progressive abdominal distension over weeks to months with intermittent colicky pain. Weight loss and anorexia suggest underlying malignancy.',
  },

  intussusception: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'intermittent', postprandial: 'variable', associatedPain: 'always', painType: 'colicky_cramping', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Abdominal distension with colicky periumbilical pain and currant-jelly stools. Distension is progressive and painful.',
  },

  sbo_volvulus: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Rapidly progressive, tense abdominal distension with sudden severe colicky pain and obstipation. Distension becomes generalised and tight as strangulation develops.',
  },

  gallstone_ileus: {
    site: 'generalised', onset: 'gradual_days', progression: 'intermittent_cyclic', character: 'intermittent', postprandial: 'variable', associatedPain: 'always', painType: 'colicky_cramping', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Intermittent abdominal distension that comes and goes (tumbling obstruction), with colicky pain and vomiting. Distension becomes constant as the stone impacts at the ileocaecal valve.',
  },

  colorectal_cancer: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'night_sweats'],
    typicalDescription: 'Chronic progressive lower abdominal distension with worsening constipation and colicky pain. Weight loss and rectal bleeding are associated red flags.',
  },

  sigmoid_volvulus: {
    site: 'left_side', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'colicky_cramping', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Sudden massive left-sided abdominal distension with severe colicky pain and obstipation. The abdomen becomes tense and tympanitic, often described as a drum-like distension.',
  },

  // ── LARGE BOWEL ─────────────────────────────────────────────

  cecal_volvulus: {
    site: 'right_side', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'colicky_cramping', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Sudden right-sided abdominal distension with severe colicky RLQ pain. The distension is localised and tense, reflecting a twisted caecum.',
  },

  diverticular_stricture: {
    site: 'left_side', onset: 'slow_weeks_months', progression: 'progressive', character: 'intermittent', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['fever'],
    typicalDescription: 'Chronic progressive left-sided distension with worsening constipation and intermittent colicky pain. Distension is worse after meals and partially relieved by passing stool.',
  },

  fecal_impaction: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'stable', character: 'firm_hard', postprandial: 'variable', associatedPain: 'sometimes', painType: 'colicky_cramping', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['none'],
    typicalDescription: 'Chronic lower abdominal distension with hard, palpable stool in the left lower quadrant. Distension is firm and may partially improve with stool passage.',
  },

  hirschsprung_disease: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'firm_hard', postprandial: 'variable', associatedPain: 'sometimes', painType: 'colicky_cramping', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Chronic abdominal distension present from birth with failure to pass meconium and progressive constipation. Distension is firm and generalised.',
  },

  // ── FUNCTIONAL / ILEUS ──────────────────────────────────────

  postoperative_ileus: {
    site: 'generalised', onset: 'gradual_days', progression: 'stable', character: 'soft_bloated', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['none'],
    typicalDescription: 'Generalised abdominal distension developing after surgery, with inability to pass flatus or stool. Distension is soft and bloated, gradually improving as bowel function returns.',
  },

  septic_ileus: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Generalised abdominal distension in the setting of sepsis, with fever and obstipation. Distension is soft and reflects global ileus from systemic inflammation.',
  },

  ogilvie_syndrome: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['dyspnea'],
    typicalDescription: 'Massive generalised abdominal distension developing over days with obstipation. The abdomen is tense and tympanitic, often in a critically ill patient.',
  },

  chronic_pseudo_obstruction: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'intermittent', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'alternating', relievedByStoolGas: 'partial', systemicFeatures: ['weight_loss', 'early_satiety'],
    typicalDescription: 'Chronic recurrent episodes of abdominal distension with cramping pain, coming and going in cycles. Distension is worse after meals and may partially improve with stool or gas passage.',
  },

  chronic_constipation: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'sometimes', painType: 'colicky_cramping', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'yes', systemicFeatures: ['none'],
    typicalDescription: 'Chronic bloating and distension with infrequent bowel movements and straining. Distension is soft, worse after meals, and relieved by passing stool or gas.',
  },

  // ── INFLAMMATORY / INFECTIOUS GI ────────────────────────────

  crohns_distension: {
    site: 'right_side', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'firm_hard', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['weight_loss', 'fever', 'night_sweats'],
    typicalDescription: 'Right-sided abdominal distension with cramping pain, chronic diarrhoea, and weight loss. Distension is firm and worse after meals, reflecting inflammation or stricture of the terminal ileum.',
  },

  ulcerative_colitis_distension: {
    site: 'left_side', onset: 'gradual_days', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['fever', 'weight_loss'],
    typicalDescription: 'Left-sided abdominal distension during a colitis flare, with bloody diarrhoea, urgency, and cramping pain. Distension is soft and indicates colonic inflammation.',
  },

  toxic_megacolon: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Rapidly worsening generalised abdominal distension with high fever, bloody diarrhoea, and severe pain. The abdomen is tense and tender, signalling impending perforation.',
  },

  intestinal_tuberculosis: {
    site: 'right_side', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'alternating', relievedByStoolGas: 'partial', systemicFeatures: ['weight_loss', 'fever', 'night_sweats'],
    typicalDescription: 'Chronic right-sided abdominal distension with constitutional symptoms (weight loss, fever, night sweats). Distension is firm and reflects ileocaecal wall thickening.',
  },

  amoebic_colitis_distension: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['fever'],
    typicalDescription: 'Abdominal distension with bloody diarrhoea, cramping pain, and fever. Distension reflects colonic inflammation and may progress to toxic megacolon.',
  },

  typhoid_enteritis_distension: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Generalised abdominal distension with high fever, constipation, and abdominal discomfort. Distension reflects ileus from typhoid infection of the terminal ileum.',
  },

  // ── CIRRHOSIS / PORTAL HYPERTENSION ─────────────────────────

  cirrhosis_alcoholic: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'rare', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'jaundice', 'dyspnea'],
    typicalDescription: 'Slowly progressive generalised abdominal distension from ascites, with leg swelling and jaundice. The abdomen is soft and bulging with shifting dullness.',
  },

  cirrhosis_viral: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'rare', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'jaundice', 'dyspnea'],
    typicalDescription: 'Slowly progressive abdominal distension from ascites due to chronic viral hepatitis. The abdomen is soft and bulging with associated fatigue and jaundice.',
  },

  nash_cirrhosis: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'rare', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'dyspnea'],
    typicalDescription: 'Chronic abdominal distension from ascites in a patient with metabolic syndrome. The abdomen is soft and bulging, with leg swelling and dyspnoea.',
  },

  portal_vein_thrombosis: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'jaundice'],
    typicalDescription: 'Abdominal distension developing over days with epigastric pain and leg swelling. Distension reflects rapid accumulation of ascites from pre-hepatic portal hypertension.',
  },

  budd_chiari_distension: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['jaundice', 'leg_swelling', 'dyspnea'],
    typicalDescription: 'Rapidly developing tense abdominal distension from ascites with severe RUQ pain and jaundice. The abdomen becomes tight and bulging within days of hepatic vein obstruction.',
  },

  // ── PERITONEAL / ASCITES ────────────────────────────────────

  tb_peritonitis: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['fever', 'weight_loss', 'night_sweats'],
    typicalDescription: 'Chronic progressive abdominal distension from exudative ascites with fever, night sweats, and weight loss. The abdomen is soft but distended.',
  },

  sbp: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'always', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Worsening abdominal distension in a patient with ascites, accompanied by fever and diffuse abdominal pain. The distension is a sign of infected ascitic fluid.',
  },

  peritoneal_carcinomatosis: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'variable', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'night_sweats', 'leg_swelling'],
    typicalDescription: 'Progressive abdominal distension from malignant ascites with marked weight loss and cachexia. The abdomen is firm and distended with a palpable malignant feel.',
  },

  chf_ascites: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'rare', painType: 'none', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'dyspnea'],
    typicalDescription: 'Generalised abdominal distension from transudative ascites with bilateral leg swelling and dyspnoea. Distension is soft and worsens as right heart function declines.',
  },

  nephrotic_ascites: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'rare', painType: 'none', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling'],
    typicalDescription: 'Generalised abdominal distension from ascites with bilateral leg swelling and periorbital oedema. Distension is soft and reflects low oncotic pressure.',
  },

  pancreatic_ascites: {
    site: 'upper_abdomen', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss'],
    typicalDescription: 'Abdominal distension from pancreatic ascites with epigastric pain radiating to the back and weight loss. Distension is soft and progressive.',
  },

  // ── PANCREATIC ──────────────────────────────────────────────

  acute_pancreatitis_distension: {
    site: 'upper_abdomen', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'yes', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Upper abdominal distension with severe epigastric pain radiating to the back, vomiting, and fever. Distension reflects ileus from retroperitoneal inflammation and worsens with severity.',
  },

  chronic_pancreatitis_distension: {
    site: 'upper_abdomen', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['weight_loss'],
    typicalDescription: 'Epigastric distension with chronic pain radiating to the back, steatorrhoea, and weight loss. Distension is worse after meals and partially relieved by stool passage.',
  },

  pancreatic_cancer_distension: {
    site: 'upper_abdomen', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'yes', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'jaundice', 'early_satiety'],
    typicalDescription: 'Progressive upper abdominal distension with painless jaundice, weight loss, and epigastric mass. Distension is firm and reflects underlying tumour mass or hepatomegaly.',
  },

  pancreatic_pseudocyst_distension: {
    site: 'upper_abdomen', onset: 'gradual_days', progression: 'progressive', character: 'mass_like', postprandial: 'yes', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['early_satiety', 'weight_loss'],
    typicalDescription: 'Focal epigastric distension from a pseudocyst following acute pancreatitis. The distension is mass-like, worse after meals, and causes early satiety.',
  },

  // ── HEPATIC ─────────────────────────────────────────────────

  hepatomegaly_hcc: {
    site: 'right_side', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'jaundice', 'leg_swelling', 'early_satiety'],
    typicalDescription: 'Right-sided abdominal distension from massive hepatomegaly with dull RUQ pain, weight loss, and jaundice. The liver is hard and nodular on palpation.',
  },

  hepatomegaly_metastases: {
    site: 'right_side', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'jaundice', 'early_satiety'],
    typicalDescription: 'Right-sided abdominal distension from hepatomegaly with known primary malignancy. The liver is enlarged and firm with associated weight loss.',
  },

  hepatomegaly_fatty_liver: {
    site: 'right_side', onset: 'slow_weeks_months', progression: 'stable', character: 'soft_bloated', postprandial: 'no', associatedPain: 'rare', painType: 'none', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Mild right-sided abdominal distension from a diffusely enlarged liver. The liver edge is smooth and soft, often an incidental finding.',
  },

  // ── SPLENIC ─────────────────────────────────────────────────

  splenomegaly_malaria: {
    site: 'left_side', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Left-sided abdominal distension from massive splenomegaly with fever, rigors, and travel history. The spleen is firm and palpable below the left costal margin.',
  },

  splenomegaly_leukemia: {
    site: 'left_side', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'night_sweats'],
    typicalDescription: 'Left-sided abdominal distension from splenomegaly with fatigue, weight loss, and night sweats. The spleen is firm and often massively enlarged.',
  },

  splenomegaly_lymphoma: {
    site: 'left_side', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'fever', 'night_sweats'],
    typicalDescription: 'Left-sided abdominal distension from splenomegaly with B-symptoms (fever, night sweats, weight loss). The spleen is firm with associated lymphadenopathy.',
  },

  // ── UROLOGICAL ──────────────────────────────────────────────

  acute_urinary_retention: {
    site: 'lower_abdomen', onset: 'sudden_hours', progression: 'stable', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Sudden suprapubic distension from a palpable, tense bladder with severe lower abdominal pain and complete inability to pass urine.',
  },

  chronic_urinary_retention: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'stable', character: 'firm_hard', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Chronic lower abdominal distension from a distended bladder with hesitancy, weak stream, and overflow incontinence. The bladder is palpable and non-tender.',
  },

  hydronephrosis_massive: {
    site: 'localised_mass', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Focal flank mass causing localised abdominal distension with dull flank pain. The mass is ballotable and represents a hydronephrotic kidney.',
  },

  polycystic_kidney_disease: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['early_satiety'],
    typicalDescription: 'Bilateral flank fullness and generalised abdominal distension from massive polycystic kidneys. The kidneys are firm, irregular, and ballotable.',
  },

  // ── OBSTETRIC / GYNAECOLOGICAL ──────────────────────────────

  pregnancy_third_trimester: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'rare', painType: 'none', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Progressive abdominal distension in a third-trimester pregnant woman. The uterus is palpable as a firm, regular mass corresponding to gestational age.',
  },

  polyhydramnios: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['dyspnea'],
    typicalDescription: 'Rapidly enlarging, tense abdomen in a pregnant woman with dyspnoea and discomfort. The uterus is taut and difficult to palpate foetal parts.',
  },

  molar_pregnancy: {
    site: 'lower_abdomen', onset: 'gradual_days', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Rapid uterine enlargement out of proportion to gestational age with vaginal bleeding and hyperemesis. The uterus is firm and often described as doughy.',
  },

  ovarian_cyst_giant: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'progressive', character: 'mass_like', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['early_satiety'],
    typicalDescription: 'Progressive lower abdominal distension from a large ovarian cyst. The abdomen is asymmetrically enlarged with a palpable cystic mass arising from the pelvis.',
  },

  ovarian_cancer_distension: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'yes', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'alternating', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'early_satiety'],
    typicalDescription: 'Progressive abdominal distension with bloating, early satiety, and pelvic pain. The abdomen is firm with ascites and a palpable omental mass.',
  },

  uterine_fibroids_giant: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Lower abdominal distension from a firm, irregular uterine mass with heavy menstrual bleeding. The uterus is palpable as a hard, knobbly mass arising from the pelvis.',
  },

  endometriosis_distension: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'always', painType: 'colicky_cramping', bowelRelation: 'alternating', relievedByStoolGas: 'partial', systemicFeatures: ['none'],
    typicalDescription: 'Cyclical bloating and distension worsening during menstruation with severe period pain and painful intercourse. Distension is soft and associated with cramping pain.',
  },

  pelvic_inflammatory_disease_distension: {
    site: 'lower_abdomen', onset: 'gradual_days', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Lower abdominal distension with bilateral pelvic pain, fever, and vaginal discharge. Distension reflects pelvic peritonitis and ileus.',
  },

  // ── METABOLIC / ENDOCRINE ───────────────────────────────────

  hypothyroid_ileus: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'rare', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['none'],
    typicalDescription: 'Chronic bloating and distension with severe constipation, fatigue, and cold intolerance. Distension is soft and improves with thyroid replacement.',
  },

  diabetic_gastroparesis_distension: {
    site: 'upper_abdomen', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'partial', systemicFeatures: ['early_satiety', 'weight_loss'],
    typicalDescription: 'Postprandial bloating and upper abdominal distension in a diabetic patient, with nausea, vomiting of undigested food, and early satiety. Distension is worse after meals.',
  },

  hypokalemic_ileus: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'rare', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Generalised abdominal distension with constipation and muscle weakness in a patient with potassium depletion. Distension is soft and reflects poor bowel motility.',
  },

  hypercalcemic_constipation: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Abdominal distension with severe constipation, thirst, and frequent urination. Distension reflects slowed colonic transit from high calcium.',
  },

  // ── MALIGNANCY ──────────────────────────────────────────────

  gastric_cancer_distension: {
    site: 'upper_abdomen', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'yes', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'early_satiety'],
    typicalDescription: 'Epigastric fullness and distension with early satiety, weight loss, and vomiting. The upper abdomen may be firm with a palpable mass.',
  },

  colon_cancer_distension: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss'],
    typicalDescription: 'Progressive lower abdominal distension with constipation, colicky pain, and rectal bleeding. The abdomen is distended and firm.',
  },

  lymphoma_abdominal_mass: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'variable', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'alternating', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'fever', 'night_sweats'],
    typicalDescription: 'Generalised abdominal distension with B-symptoms and palpable lymphadenopathy. The abdomen may feel doughy with palpable mesenteric masses.',
  },

  retroperitoneal_sarcoma: {
    site: 'localised_mass', onset: 'slow_weeks_months', progression: 'progressive', character: 'mass_like', postprandial: 'no', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'early_satiety'],
    typicalDescription: 'Deep-seated abdominal mass causing asymmetrical distension with vague back pain and early satiety. The mass is fixed and retroperitoneal in location.',
  },

  // ── PAEDIATRIC ──────────────────────────────────────────────

  nec_neonatal: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'yes', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Rapidly progressive tense abdominal distension in a neonate with feeding intolerance, bloody stools, and fever. The abdomen is tender and tense.',
  },

  midgut_volvulus: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'yes', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Sudden abdominal distension in a neonate with bilious vomiting and distress. The abdomen is tense and the infant rapidly deteriorates.',
  },

  intestinal_atresia: {
    site: 'upper_abdomen', onset: 'sudden_hours', progression: 'stable', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Upper abdominal distension in a neonate with bilious vomiting and failure to pass meconium. The upper abdomen is distended while the lower abdomen is scaphoid.',
  },

  malrotation_distension: {
    site: 'generalised', onset: 'gradual_days', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'sometimes', painType: 'colicky_cramping', bowelRelation: 'alternating', relievedByStoolGas: 'partial', systemicFeatures: ['none'],
    typicalDescription: 'Intermittent abdominal distension and bilious vomiting in an infant with malrotation. Distension is worse after feeds.',
  },

  meconium_ileus: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'firm_hard', postprandial: 'yes', associatedPain: 'sometimes', painType: 'colicky_cramping', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Progressive abdominal distension in a neonate with failure to pass meconium, bilious vomiting, and palpable meconium loops on abdominal exam.',
  },

  ascariasis_distension: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'alternating', relievedByStoolGas: 'partial', systemicFeatures: ['weight_loss'],
    typicalDescription: 'Chronic intermittent abdominal distension with colicky pain in a child from an endemic area.',
  },

  // ── CARDIOVASCULAR ──────────────────────────────────────────

  constrictive_pericarditis: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'rare', painType: 'none', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'dyspnea'],
    typicalDescription: 'Chronic abdominal distension from ascites with leg swelling, dyspnoea, and fatigue. The abdomen is soft with signs of right heart failure but clear lungs.',
  },

  right_heart_failure: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'rare', painType: 'none', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'dyspnea'],
    typicalDescription: 'Generalised abdominal distension from ascites with bilateral leg swelling, dyspnoea, and elevated JVP. Distension improves with diuresis.',
  },

  // ── OTHER ───────────────────────────────────────────────────

  obesity_distension: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'stable', character: 'soft_bloated', postprandial: 'no', associatedPain: 'never', painType: 'none', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['dyspnea'],
    typicalDescription: 'Chronic generalised abdominal enlargement from central obesity with no pain or other GI symptoms. The abdomen is soft and diffusely enlarged.',
  },

  ibs_distension: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'always', painType: 'colicky_cramping', bowelRelation: 'alternating', relievedByStoolGas: 'yes', systemicFeatures: ['none'],
    typicalDescription: 'Chronic intermittent bloating and distension with cramping abdominal pain. Distension is worse after meals and relieved by passing stool or gas.',
  },

  celiac_disease_distension: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['weight_loss'],
    typicalDescription: 'Chronic bloating and distension with diarrhoea, weight loss, and fatigue. Distension is worse after gluten ingestion and improves with a gluten-free diet.',
  },

  // ── ADDITIONAL PROFILES ───────────────────────────────────────

  adenomyosis_distension: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'no', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'variable', systemicFeatures: ['none'],
    typicalDescription: 'Chronic lower abdominal enlargement and bloating that worsens during menstruation. Heavy periods and dysmenorrhoea are hallmark features.',
  },

  autoimmune_hepatitis: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'rare', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['jaundice', 'weight_loss'],
    typicalDescription: 'Gradual abdominal distension from hepatomegaly and early ascites in a patient with autoimmune disease. Jaundice and pruritus are common.',
  },

  bezoar_obstruction: {
    site: 'upper_abdomen', onset: 'gradual_days', progression: 'progressive', character: 'firm_hard', postprandial: 'yes', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss'],
    typicalDescription: 'Epigastric mass and fullness with early satiety. Post-prandial pain and vomiting of undigested food hours after eating.',
  },

  chf_hepatomegaly: {
    site: 'right_side', onset: 'gradual_days', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'dyspnea', 'jaundice'],
    typicalDescription: 'Tender right upper quadrant fullness from congestive hepatomegaly in a patient with right heart failure. Leg swelling and dyspnoea are prominent.',
  },

  congenital_metabolic_distension: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Acute abdominal distension in a neonate with vomiting, lethargy, and metabolic acidosis. Rapid deterioration without specific treatment.',
  },

  crohn_stricture_sbo: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'intermittent', postprandial: 'yes', associatedPain: 'always', painType: 'colicky_cramping', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'fever'],
    typicalDescription: 'Progressive abdominal distension with colicky pain and obstipation in a patient with known Crohn disease. Distension becomes constant as obstruction progresses.',
  },

  foreign_body_obstruction: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'colicky_cramping', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Acute abdominal distension following ingestion of a foreign body. Colicky periumbilical pain with vomiting and obstipation.',
  },

  functional_bloating: {
    site: 'generalised', onset: 'gradual_days', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'sometimes', painType: 'colicky_cramping', bowelRelation: 'alternating', relievedByStoolGas: 'yes', systemicFeatures: ['none'],
    typicalDescription: 'Chronic recurrent bloating without organic cause. Worse after meals, relieved by passing gas. No weight loss or systemic symptoms.',
  },

  gastroenteritis_ileus: {
    site: 'generalised', onset: 'sudden_hours', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['fever'],
    typicalDescription: 'Acute abdominal distension with diarrhoea, vomiting, and fever. Distension is from ileus secondary to gastrointestinal infection.',
  },

  giant_renal_cyst: {
    site: 'localised_mass', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['none'],
    typicalDescription: 'Unilateral flank mass that can be palpated as a firm, ballotable swelling. Dull ache in the flank with occasional haematuria.',
  },

  giardiasis_distension: {
    site: 'generalised', onset: 'gradual_days', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['weight_loss', 'fever'],
    typicalDescription: 'Bloating and distension with foul-smelling diarrhoea and weight loss. Onset after travel to endemic areas. Worse after meals.',
  },

  hemolytic_anemia_splenomegaly: {
    site: 'left_side', onset: 'slow_weeks_months', progression: 'stable', character: 'firm_hard', postprandial: 'variable', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['jaundice', 'dyspnea'],
    typicalDescription: 'Left upper quadrant fullness from splenomegaly in a patient with chronic hemolytic anaemia. Associated jaundice, fatigue, and pallor.',
  },

  hepatic_schistosomiasis: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'variable', associatedPain: 'rare', painType: 'none', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'no', systemicFeatures: ['jaundice', 'leg_swelling', 'fever', 'weight_loss'],
    typicalDescription: 'Progressive abdominal distension from hepatosplenomegaly and ascites in a patient from an endemic area. Intermittent fever and diarrhoea.',
  },

  hiv_ascites: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'rare', painType: 'constant_dull', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'fever', 'night_sweats', 'leg_swelling', 'dyspnea'],
    typicalDescription: 'Tense ascites in an HIV-positive patient with weight loss, fevers, and diarrhoea. Multifactorial from TB, Kaposi, lymphoma, or protein loss.',
  },

  hypoproteinemia_ascites: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'rare', painType: 'none', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'weight_loss', 'dyspnea'],
    typicalDescription: 'Generalised abdominal distension with bipedal oedema in a patient with severe malnutrition or protein loss. Soft, shifting dullness detectable.',
  },

  kala_azar: {
    site: 'left_side', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'variable', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'fever', 'night_sweats'],
    typicalDescription: 'Massive splenomegaly causing left-sided abdominal distension in a patient from a tropical region. Irregular fever, weight loss, and pancytopenia.',
  },

  lactose_intolerance: {
    site: 'generalised', onset: 'gradual_days', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'sometimes', painType: 'colicky_cramping', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'yes', systemicFeatures: ['none'],
    typicalDescription: 'Bloating, distension, and diarrhoea occurring 30-120 minutes after consuming dairy products. Relieved by passing flatus or stool.',
  },

  leukemia_hepatomegaly: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'variable', associatedPain: 'often', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['weight_loss', 'fever', 'night_sweats'],
    typicalDescription: 'Generalised abdominal distension from hepatosplenomegaly in a patient with acute or chronic leukaemia. Associated fatigue, bruising, and systemic symptoms.',
  },

  mesenteric_ischemia_distension: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Sudden, severe abdominal pain OUT OF PROPORTION to examination, followed by distension and obstipation. Rapid progression to shock. EMERGENCY.',
  },

  multiple_gestation: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'rare', painType: 'none', bowelRelation: 'no_change', relievedByStoolGas: 'variable', systemicFeatures: ['dyspnea', 'leg_swelling'],
    typicalDescription: 'More rapid and pronounced abdominal enlargement than singleton pregnancy. Uterus measures larger than expected for dates.',
  },

  neurogenic_bowel: {
    site: 'lower_abdomen', onset: 'slow_weeks_months', progression: 'stable', character: 'soft_bloated', postprandial: 'no', associatedPain: 'sometimes', painType: 'constant_dull', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['none'],
    typicalDescription: 'Chronic abdominal distension with severe constipation in a patient with neurological disease or spinal injury. Manual disimpaction may be needed.',
  },

  opioid_ileus: {
    site: 'generalised', onset: 'gradual_days', progression: 'stable', character: 'soft_bloated', postprandial: 'no', associatedPain: 'sometimes', painType: 'colicky_cramping', bowelRelation: 'constipation_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['none'],
    typicalDescription: 'Abdominal distension and constipation following opioid use. Bloating with nausea and reduced flatus. Improves when opioids are stopped.',
  },

  ovarian_torsion_cyst: {
    site: 'lower_abdomen', onset: 'sudden_hours', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Sudden severe lower abdominal pain with a palpable tender mass and distension. Nausea, vomiting, and signs of peritonism develop rapidly. SURGICAL EMERGENCY.',
  },

  perforation_peritonitis_distension: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Sudden catastrophic abdominal pain with board-like rigidity and distension. Patient lies perfectly still. RAPID SURGICAL EMERGENCY.',
  },

  peritonitic_ileus: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Generalised abdominal distension with severe pain, fever, and peritonism. Ileus develops as peritonitis progresses.',
  },

  portal_htn_splenomegaly: {
    site: 'left_side', onset: 'slow_weeks_months', progression: 'progressive', character: 'firm_hard', postprandial: 'no', associatedPain: 'rare', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['jaundice', 'leg_swelling', 'dyspnea'],
    typicalDescription: 'Left upper quadrant fullness with ascites in a patient with chronic liver disease or portal vein thrombosis. Splenomegaly may be massive.',
  },

  protein_losing_enteropathy: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'progressive', character: 'soft_bloated', postprandial: 'no', associatedPain: 'rare', painType: 'none', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'weight_loss'],
    typicalDescription: 'Abdominal distension with bipedal oedema and diarrhoea. Low serum protein causes ascites without liver or renal disease.',
  },

  secondary_bacterial_peritonitis: {
    site: 'generalised', onset: 'sudden_hours', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'always', painType: 'constant_severe', bowelRelation: 'obstipation', relievedByStoolGas: 'no', systemicFeatures: ['fever'],
    typicalDescription: 'Sudden diffuse abdominal distension with severe pain, high fever, and rigors. Abdomen is rigid and tender. SURGICAL EMERGENCY from perforation or anastomotic leak.',
  },

  severe_chf_distension: {
    site: 'generalised', onset: 'gradual_days', progression: 'progressive', character: 'tense_tight', postprandial: 'no', associatedPain: 'rare', painType: 'constant_dull', bowelRelation: 'no_change', relievedByStoolGas: 'no', systemicFeatures: ['leg_swelling', 'dyspnea'],
    typicalDescription: 'Abdominal distension from ascites and congestive hepatomegaly in a patient with severe heart failure. Bipedal oedema and orthopnoea are prominent.',
  },

  sibo: {
    site: 'generalised', onset: 'slow_weeks_months', progression: 'intermittent_cyclic', character: 'soft_bloated', postprandial: 'yes', associatedPain: 'often', painType: 'colicky_cramping', bowelRelation: 'diarrhea_predominant', relievedByStoolGas: 'partial', systemicFeatures: ['weight_loss'],
    typicalDescription: 'Chronic bloating and distension worse after meals, with diarrhoea and weight loss. Associated with diabetes, prior surgery, or hypomotility disorders.',
  },

};

// ── Helper functions ──────────────────────────────────────────

export function getDistensionDiseaseIds(): string[] {
  return Object.keys(DISTENSION_MANIFESTATIONS);
}

export function getDistensionManifestation(diseaseId: string): DistensionManifestation | undefined {
  return DISTENSION_MANIFESTATIONS[diseaseId];
}

export function hasDistensionManifestation(diseaseId: string): boolean {
  return diseaseId in DISTENSION_MANIFESTATIONS;
}
