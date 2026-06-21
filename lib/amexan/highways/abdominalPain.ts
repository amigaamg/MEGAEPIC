// ═══════════════════════════════════════════════════════════════════════════════
// Abdominal Pain Symptom Highway
// Routes from "abdominal pain" to all plausible disease clusters.
// ═══════════════════════════════════════════════════════════════════════════════

import type { DiseaseNode, FeatureRecord } from '../knowbase/diseaseNode';
import { ABDOMINAL_PAIN_DISEASE_MAP } from '../knowbase/diseases/abdominalPainNodes';
import { FEATURES } from '../knowbase/features/featureLibrary';
import { EXTENDED_DISEASE_MAP } from '../knowbase/diseases/nodes/index';
import { VOMITING_NODES } from '../knowbase/diseases/nodes/vomitingNodes';
import { DISTENSION_NODES } from '../knowbase/diseases/nodes/distensionNodes';
import { DIARRHOEA_NODES } from '../knowbase/diseases/nodes/diarrhoeaNodes';
import { CONSTIPATION_NODES } from '../knowbase/diseases/nodes/constipationNodes';
import { DYSPHAGIA_NODES } from '../knowbase/diseases/nodes/dysphagiaNodes';
import { GI_BLEEDING_NODES } from '../knowbase/diseases/nodes/giBleedingNodes';
import { getVomitingDiseaseIds } from '../knowbase/diseases/vomitingManifestations';
import { getDistensionDiseaseIds } from '../knowbase/diseases/abdominalDistensionManifestations';
import { getDiarrhoeaDiseaseIds } from '../knowbase/diseases/diarrhoeaManifestations';
import { getConstipationDiseaseIds } from '../knowbase/diseases/constipationManifestations';
import { getDysphagiaDiseaseIds } from '../knowbase/diseases/dysphagiaManifestations';
import { getGiBleedingDiseaseIds } from '../knowbase/diseases/giBleedingManifestations';

export interface SymptomHighway {
  id: string;                        // "abdominal_pain"
  label: string;                     // "Abdominal Pain"
  diseaseIds: string[];              // All disease IDs reachable via this highway
  initialQuestionIds: string[];      // The first questions to ask (triage)
  preloadFromCC: {
    featureId: string;
    extractKeyword: string[];        // if chief complaint contains these words, pre-answer
  }[];
}

export const abdominalPainHighway: SymptomHighway = {
  id: 'abdominal_pain',
  label: 'Abdominal Pain',
  diseaseIds: Array.from(ABDOMINAL_PAIN_DISEASE_MAP.keys()),
  initialQuestionIds: [
    'pain_onset', 'pain_initial_location', 'pain_character',
    'pain_severity', 'syncope', 'peritonism',
  ],
  preloadFromCC: [
    { featureId: 'vomiting', extractKeyword: ['vomit', 'nause', 'sick to stomach', 'throwing up'] },
    { featureId: 'nausea', extractKeyword: ['nause', 'sick to stomach'] },
    { featureId: 'diarrhea', extractKeyword: ['diarrhoea', 'diarrhea', 'loose stool', 'watery stool'] },
    { featureId: 'constipation', extractKeyword: ['constipat', 'not passed stool', 'hard stool'] },
    { featureId: 'hematochezia', extractKeyword: ['blood in stool', 'bloody stool', 'blood per rectum', 'PR bleed'] },
    { featureId: 'hematemesis', extractKeyword: ['vomit blood', 'blood in vomit', 'coffee ground vomit'] },
    { featureId: 'fever', extractKeyword: ['fever', 'feverish', 'temperature', 'hot'] },
    { featureId: 'vaginal_bleeding', extractKeyword: ['vaginal bleed', 'spotting', 'period bleed'] },
    { featureId: 'vaginal_discharge', extractKeyword: ['vaginal discharge', 'abnormal discharge'] },
    { featureId: 'cough', extractKeyword: ['cough', 'coughing'] },
    { featureId: 'dyspnea', extractKeyword: ['short of breath', 'breathless', 'difficulty breathing'] },
    { featureId: 'chest_pain', extractKeyword: ['chest pain', 'chest discomfort'] },
  ],
};

/** Get highway by ID */
export function getHighway(id: string): SymptomHighway | undefined {
  return HIGHWAYS.get(id);
}

/** Build pre-filled features from a chief complaint text */
export function prefillFromChiefComplaint(
  highway: SymptomHighway,
  complaintText: string,
): { featureId: string; answerValue: string }[] {
  const results: { featureId: string; answerValue: string }[] = [];
  const lower = complaintText.toLowerCase();

  for (const rule of highway.preloadFromCC) {
    for (const kw of rule.extractKeyword) {
      if (lower.includes(kw)) {
        results.push({ featureId: rule.featureId, answerValue: 'Yes (from chief complaint)' });
        break;
      }
    }
  }

  return results;
}

// ── VOMITING SYMPTOM HIGHWAY ─────────────────────────────────
// Activated as a cross-highway when vomiting co-presents with abdominal pain.
// Helps distinguish "vomiting caused by abdominal disease" from "independent vomiting + separate abdominal pain"

/** Build the vomiting highway disease list: specialized nodes + all abdominal diseases with vomitingManifestation */
function buildVomitingDiseaseIds(): string[] {
  const ids = new Set(VOMITING_NODES.map(n => n.id));
  for (const vid of getVomitingDiseaseIds()) {
    ids.add(vid);
  }
  return Array.from(ids);
}

export const vomitingHighway: SymptomHighway = {
  id: 'vomiting',
  label: 'Vomiting / Nausea',
  diseaseIds: buildVomitingDiseaseIds(),
  initialQuestionIds: ['vomiting_timing', 'vomiting_description', 'vomiting_frequency', 'nausea', 'vomiting_bilious', 'vomiting_projectile'],
  preloadFromCC: [
    { featureId: 'vomiting', extractKeyword: ['vomit', 'throwing up', 'sick to stomach', 'puke'] },
    { featureId: 'nausea', extractKeyword: ['nause', 'feeling sick', 'queasy'] },
    { featureId: 'vomiting_timing', extractKeyword: ['vomiting before pain', 'sick before pain'] },
    { featureId: 'vomiting_description', extractKeyword: ['bile', 'blood in vomit', 'coffee ground', 'yellow vomit'] },
  ],
};

// ── ABDOMINAL DISTENSION SYMPTOM HIGHWAY ──────────────────────
// Activated when distension/bloating is the chief complaint or co-presents.
// Covers all 6 Fs: Fat, Fluid, Flatus, Feces, Fetus, Fatal growth.

function buildDistensionDiseaseIds(): string[] {
  const ids = new Set(DISTENSION_NODES.map(n => n.id));
  for (const did of getDistensionDiseaseIds()) {
    ids.add(did);
  }
  return Array.from(ids);
}

export const distensionHighway: SymptomHighway = {
  id: 'abdominal_distension',
  label: 'Abdominal Distension / Bloating',
  diseaseIds: buildDistensionDiseaseIds(),
  initialQuestionIds: [
    'distension_onset', 'distension_site', 'distension_character',
    'distension_pain_relation', 'abdominal_distension', 'obstipation',
    'distension_gas_passage_relief',
  ],
  preloadFromCC: [
    { featureId: 'abdominal_distension', extractKeyword: ['distension', 'bloating', 'swollen', 'enlarged', 'full', 'big', 'gas'] },
    { featureId: 'bloating', extractKeyword: ['bloating', 'full', 'gas', 'distension'] },
    { featureId: 'constipation', extractKeyword: ['constipat', 'not passed stool', 'hard stool'] },
    { featureId: 'obstipation', extractKeyword: ['no gas', 'no stool', 'can\'t pass', 'obstipat'] },
    { featureId: 'vomiting', extractKeyword: ['vomit', 'nause'] },
    { featureId: 'weight_loss', extractKeyword: ['weight loss', 'lost weight', 'unintentional weight'] },
    { featureId: 'early_satiety', extractKeyword: ['full soon', 'early full', 'can\'t finish meal'] },
    { featureId: 'leg_swelling', extractKeyword: ['leg swelling', 'ankle swelling', 'oedema', 'edema'] },
    { featureId: 'dyspnea', extractKeyword: ['short of breath', 'breathless', 'difficulty breathing'] },
    { featureId: 'fever', extractKeyword: ['fever', 'feverish', 'temperature', 'hot'] },
    { featureId: 'jaundice', extractKeyword: ['jaundice', 'yellow', 'yellowing'] },
    { featureId: 'diarrhea', extractKeyword: ['diarrhoea', 'diarrhea', 'loose stool'] },
    { featureId: 'hematochezia', extractKeyword: ['blood in stool', 'bloody stool', 'blood per rectum'] },
    { featureId: 'hematemesis', extractKeyword: ['vomit blood', 'blood in vomit'] },
    { featureId: 'urinary_retention', extractKeyword: ['cannot pass urine', 'unable to urinate', 'retention'] },
  ],
};

// ── DIARRHOEA SYMPTOM HIGHWAY ────────────────────────────────
// Activated when diarrhoea is the chief complaint or co-presents.
// Covers infectious, inflammatory, malabsorptive, secretory, functional, endocrine causes.

function buildDiarrhoeaDiseaseIds(): string[] {
  const ids = new Set(DIARRHOEA_NODES.map(n => n.id));
  for (const did of getDiarrhoeaDiseaseIds()) {
    ids.add(did);
  }
  return Array.from(ids);
}

export const diarrhoeaHighway: SymptomHighway = {
  id: 'diarrhoea',
  label: 'Diarrhoea / Loose Stools',
  diseaseIds: buildDiarrhoeaDiseaseIds(),
  initialQuestionIds: [
    'diarrhoea_duration', 'diarrhoea_stool_type', 'diarrhoea_frequency',
    'diarrhoea_nocturnal', 'diarrhoea_fever', 'diarrhoea_dehydration',
  ],
  preloadFromCC: [
    { featureId: 'diarrhea', extractKeyword: ['diarrhoea', 'diarrhea', 'loose stool', 'watery stool', 'runny stool', 'frequent stool'] },
    { featureId: 'diarrhoea_duration', extractKeyword: ['acute diarrhoea', 'chronic diarrhoea', 'persistent diarrhoea'] },
    { featureId: 'diarrhoea_stool_type', extractKeyword: ['bloody diarrhoea', 'blood in stool', 'mucus', 'watery diarrhoea', 'fatty stool'] },
    { featureId: 'vomiting', extractKeyword: ['vomit', 'nause'] },
    { featureId: 'fever', extractKeyword: ['fever', 'feverish', 'temperature'] },
    { featureId: 'weight_loss', extractKeyword: ['weight loss', 'lost weight'] },
    { featureId: 'abdominal_distension', extractKeyword: ['bloating', 'distension', 'swollen'] },
    { featureId: 'hematochezia', extractKeyword: ['blood in stool', 'bloody stool', 'blood per rectum'] },
    { featureId: 'steatorrhea', extractKeyword: ['fatty stool', 'pale stool', 'foul stool', 'floating stool'] },
    { featureId: 'diarrhoea_antibiotics_related', extractKeyword: ['after antibiotics', 'post antibiotic', 'antibiotic'] },
    { featureId: 'diarrhoea_travel_related', extractKeyword: ['traveller', 'travel', 'abroad', 'foreign'] },
    { featureId: 'diarrhoea_flushing', extractKeyword: ['flushing', 'facial flush'] },
  ],
};

// ── CONSTIPATION SYMPTOM HIGHWAY ────────────────────────────
// Activated when constipation is the chief complaint or co-presents.
// Covers functional, mechanical, neurological, endocrine, drug-induced, and congenital causes.

function buildConstipationDiseaseIds(): string[] {
  const ids = new Set(CONSTIPATION_NODES.map(n => n.id));
  for (const did of getConstipationDiseaseIds()) {
    ids.add(did);
  }
  return Array.from(ids);
}

export const constipationHighway: SymptomHighway = {
  id: 'constipation',
  label: 'Constipation / Difficulty Passing Stool',
  diseaseIds: buildConstipationDiseaseIds(),
  initialQuestionIds: [
    'constipation_duration', 'constipation_stool_frequency', 'constipation_stool_consistency',
    'constipation_obstipation', 'constipation_abdominal_pain', 'constipation_weight_loss',
  ],
  preloadFromCC: [
    { featureId: 'constipation', extractKeyword: ['constipat', 'hard stool', 'difficult to pass stool', 'infrequent stool', 'irregular bowel'] },
    { featureId: 'constipation_duration', extractKeyword: ['acute constipation', 'chronic constipation', 'since birth', 'lifelong'] },
    { featureId: 'constipation_stool_consistency', extractKeyword: ['hard pellet', 'pencil thin', 'ribbon like', 'overflow', 'rabbit'] },
    { featureId: 'constipation_obstipation', extractKeyword: ['no gas', 'no stool', 'can\'t pass', 'obstipat', 'absolute constipation'] },
    { featureId: 'vomiting', extractKeyword: ['vomit', 'nause'] },
    { featureId: 'weight_loss', extractKeyword: ['weight loss', 'lost weight', 'unintentional weight'] },
    { featureId: 'abdominal_distension', extractKeyword: ['bloating', 'distension', 'swollen', 'big stomach'] },
    { featureId: 'hematochezia', extractKeyword: ['blood in stool', 'bloody stool', 'blood per rectum', 'rectal bleeding'] },
    { featureId: 'constipation_medication_related', extractKeyword: ['opioid', 'morphine', 'codeine', 'iron', 'antidepressant', 'verapamil'] },
    { featureId: 'constipation_neurological', extractKeyword: ['numbness', 'weak legs', 'urinary retention', 'spinal', 'parkinson'] },
    { featureId: 'constipation_endocrine', extractKeyword: ['cold intolerance', 'weight gain', 'fatigue', 'thyroid'] },
    { featureId: 'constipation_painful_defecation', extractKeyword: ['painful defecation', 'pain when passing stool', 'anal pain'] },
  ],
};

// ── DYSPHAGIA / ODYNOPHAGIA SYMPTOM HIGHWAY ─────────────────
// Activated when difficulty swallowing or painful swallowing is the chief complaint or co-presents.
// Covers oropharyngeal, esophageal mechanical, motility, infectious, inflammatory, and neurological causes.

function buildDysphagiaDiseaseIds(): string[] {
  const ids = new Set(DYSPHAGIA_NODES.map(n => n.id));
  for (const did of getDysphagiaDiseaseIds()) {
    ids.add(did);
  }
  return Array.from(ids);
}

export const dysphagiaHighway: SymptomHighway = {
  id: 'dysphagia',
  label: 'Dysphagia / Difficulty Swallowing',
  diseaseIds: buildDysphagiaDiseaseIds(),
  initialQuestionIds: [
    'dysphagia', 'dysphagia_solids_liquids', 'dysphagia_progressive',
    'dysphagia_odynophagia', 'dysphagia_onset', 'dysphagia_aspiration',
    'dysphagia_level', 'dysphagia_weight_loss',
  ],
  preloadFromCC: [
    { featureId: 'dysphagia', extractKeyword: ['difficulty swallowing', 'trouble swallowing', 'dysphagia', 'can\'t swallow', 'swallowing problem', 'food gets stuck', 'choke on food'] },
    { featureId: 'odynophagia', extractKeyword: ['painful swallowing', 'pain when swallow', 'odynophagia', 'hurt to swallow', 'sharp pain swallowing'] },
    { featureId: 'dysphagia_solids_liquids', extractKeyword: ['solid food sticks', 'can\'t eat solids', 'liquids go down wrong', 'only liquids'] },
    { featureId: 'dysphagia_progressive', extractKeyword: ['getting worse', 'progressively worse', 'worsening swallow', 'started with solids now liquids'] },
    { featureId: 'dysphagia_aspiration', extractKeyword: ['cough when eating', 'choke on food', 'food goes into lungs', 'aspiration', 'cough while drinking'] },
    { featureId: 'dysphagia_weight_loss', extractKeyword: ['weight loss', 'lost weight', 'unintentional weight', 'can\'t eat enough'] },
    { featureId: 'dysphagia_regurgitation', extractKeyword: ['food comes back', 'regurgitate', 'brings up food', 'undigested food'] },
    { featureId: 'dysphagia_neck_mass', extractKeyword: ['neck lump', 'neck swelling', 'mass in neck', 'thyroid swelling', 'goiter'] },
    { featureId: 'dysphagia_hoarseness', extractKeyword: ['hoarse', 'voice change', 'raspy voice', 'loss of voice'] },
    { featureId: 'dysphagia_heartburn', extractKeyword: ['heartburn', 'acid reflux', 'GERD', 'burning in chest', 'indigestion'] },
    { featureId: 'dysphagia_neurological', extractKeyword: ['slurred speech', 'weakness', 'numbness', 'stroke', 'parkinson', 'multiple sclerosis'] },
    { featureId: 'dysphagia_nasal_regurgitation', extractKeyword: ['food comes through nose', 'nasal regurgitation', 'liquid out nose'] },
    { featureId: 'dysphagia_caustic', extractKeyword: ['swallowed chemical', 'drank bleach', 'cleaning product', 'caustic ingestion'] },
    { featureId: 'dysphagia_alcohol_smoking', extractKeyword: ['smoker', 'alcoholic', 'heavy drinker', 'tobacco', 'cigarette'] },
    { featureId: 'odynophagia_fever', extractKeyword: ['fever', 'temperature', 'feverish', 'hot'] },
    { featureId: 'odynophagia_immunocompromised', extractKeyword: ['hiv', 'aids', 'immunocompromised', 'chemotherapy', 'transplant', 'steroids'] },
    { featureId: 'vomiting', extractKeyword: ['vomit', 'nause'] },
    { featureId: 'weight_loss', extractKeyword: ['weight loss', 'lost weight', 'unintentional weight'] },
  ],
};

// ── GI BLEEDING SYMPTOM HIGHWAY ────────────────────────────
// Activated when hematemesis, melena, or hematochezia is the chief complaint or co-presents.
// Covers upper GI bleeding (esophageal, gastric, duodenal), lower GI bleeding (colonic, anorectal, small bowel),
// and obscure/occult bleeding across all age groups.

function buildGiBleedingDiseaseIds(): string[] {
  const ids = new Set(GI_BLEEDING_NODES.map(n => n.id));
  for (const did of getGiBleedingDiseaseIds()) {
    ids.add(did);
  }
  return Array.from(ids);
}

export const giBleedingHighway: SymptomHighway = {
  id: 'gi_bleeding',
  label: 'GI Bleeding (Hematemesis / Melena / Hematochezia)',
  diseaseIds: buildGiBleedingDiseaseIds(),
  initialQuestionIds: [
    'hematemesis', 'melena', 'hematochezia',
    'hematemesis_color', 'hematemesis_volume', 'hematochezia_color',
    'hematochezia_volume', 'melena_volume',
    'gi_bleeding_painless', 'gi_bleeding_vomiting_first',
    'gi_bleeding_syncope', 'abdominal_pain',
  ],
  preloadFromCC: [
    { featureId: 'hematemesis', extractKeyword: ['vomit blood', 'blood in vomit', 'threw up blood', 'coffee ground vomit', 'haematemesis', 'hematemesis'] },
    { featureId: 'melena', extractKeyword: ['black stool', 'tarry stool', 'melena', 'black poop', 'dark stool', 'sticky black'] },
    { featureId: 'hematochezia', extractKeyword: ['blood in stool', 'bloody stool', 'blood per rectum', 'PR bleed', 'rectal bleeding', 'maroon stool', 'bright red blood'] },
    { featureId: 'hematemesis_color', extractKeyword: ['coffee ground', 'bright red vomit', 'dark red vomit'] },
    { featureId: 'hematemesis_volume', extractKeyword: ['gushing blood', 'massive vomit blood', 'cup of blood'] },
    { featureId: 'hematochezia_color', extractKeyword: ['bright red blood', 'maroon stool', 'dark blood'] },
    { featureId: 'hematochezia_volume', extractKeyword: ['clots', 'running off', 'profuse', 'massive bleed'] },
    { featureId: 'gi_bleeding_syncope', extractKeyword: ['fainted', 'passed out', 'lightheaded', 'dizzy', 'syncope'] },
    { featureId: 'gi_bleeding_vomiting_first', extractKeyword: ['vomited before blood', 'violent vomiting', 'retching'] },
    { featureId: 'gi_bleeding_liver_disease', extractKeyword: ['cirrhosis', 'liver disease', 'hepatitis', 'liver failure', 'alcoholic'] },
    { featureId: 'gi_bleeding_known_varices', extractKeyword: ['known varices', 'esophageal varices', 'banding'] },
    { featureId: 'gi_bleeding_known_aaa', extractKeyword: ['aortic aneurysm', 'AAA repair', 'aortic graft', 'aortic surgery'] },
    { featureId: 'abdominal_pain', extractKeyword: ['stomach pain', 'belly pain', 'abdominal pain', 'epigastric pain'] },
    { featureId: 'weight_loss', extractKeyword: ['weight loss', 'lost weight'] },
    { featureId: 'nsaid_use', extractKeyword: ['ibuprofen', 'aspirin', 'naproxen', 'NSAID', 'painkiller'] },
    { featureId: 'anticoagulant_use', extractKeyword: ['blood thinner', 'warfarin', 'apixaban', 'rivaroxaban', 'heparin', 'anticoagulant'] },
    { featureId: 'alcohol_use', extractKeyword: ['alcohol', 'drinking', 'drunk', 'alcoholic'] },
    { featureId: 'known_cancer', extractKeyword: ['cancer', 'malignancy', 'tumor', 'GI cancer'] },
    { featureId: 'gi_bleeding_iron_deficiency', extractKeyword: ['anemia', 'low iron', 'iron deficiency'] },
  ],
};

/** Mapping from legacy symptom IDs (from symptomLibrary) to highway IDs */
export const SYMPTOM_TO_HIGHWAY: Record<string, string> = {
  'abdominal_pain': 'abdominal_pain',
  'nausea_vomiting': 'vomiting',
  'bloating': 'abdominal_distension',
  'diarrhea': 'diarrhoea',
  'constipation': 'constipation',
  'dysphagia': 'dysphagia',
  'odynophagia': 'dysphagia',
  'hematemesis': 'gi_bleeding',
  'melena': 'gi_bleeding',
  'hematochezia': 'gi_bleeding',
  'gi_bleeding': 'gi_bleeding',
};

/** All implemented highways (includes vomiting + distension + diarrhoea + constipation + dysphagia for cross-symptom support) */
export const HIGHWAYS: Map<string, SymptomHighway> = new Map([
  ['abdominal_pain', abdominalPainHighway],
  ['vomiting', vomitingHighway],
  ['abdominal_distension', distensionHighway],
  ['diarrhoea', diarrhoeaHighway],
  ['constipation', constipationHighway],
  ['dysphagia', dysphagiaHighway],
  ['gi_bleeding', giBleedingHighway],
]);

/** Check if a chief complaint text contains multiple symptoms that should activate cross-highways */
export function getActiveHighways(symptomId: string, complaintText: string): SymptomHighway[] {
  // Map legacy symptom IDs to highway IDs
  const highwayId = SYMPTOM_TO_HIGHWAY[symptomId] || symptomId;
  const primary = getHighway(highwayId);
  const highways: SymptomHighway[] = primary ? [primary] : [];

  const lower = complaintText.toLowerCase();

  // Cross-highway activation: vomiting keywords activate vomiting highway
  const vomitingKeywords = ['vomit', 'nause', 'throwing up', 'sick to stomach', 'puke'];
  if (highwayId !== 'vomiting' && vomitingKeywords.some(kw => lower.includes(kw))) {
    const vomitHighway = getHighway('vomiting');
    if (vomitHighway) highways.push(vomitHighway);
  }

  // Cross-highway activation: distension keywords activate distension highway
  const distensionKeywords = ['distension', 'bloating', 'swollen', 'enlarged', 'full', 'gas', 'big stomach'];
  if (highwayId !== 'abdominal_distension' && distensionKeywords.some(kw => lower.includes(kw))) {
    const distHighway = getHighway('abdominal_distension');
    if (distHighway) highways.push(distHighway);
  }

  // Cross-highway: when distension is primary, also check for vomiting keywords
  if (highwayId === 'abdominal_distension' && vomitingKeywords.some(kw => lower.includes(kw))) {
    const vomitHighway = getHighway('vomiting');
    if (vomitHighway && !highways.some(h => h.id === 'vomiting')) highways.push(vomitHighway);
  }

  // Cross-highway: when vomiting is primary, also check for distension keywords
  if (highwayId === 'vomiting' && distensionKeywords.some(kw => lower.includes(kw))) {
    const distHighway = getHighway('abdominal_distension');
    if (distHighway && !highways.some(h => h.id === 'abdominal_distension')) highways.push(distHighway);
  }

  // Cross-highway activation: diarrhoea keywords activate diarrhoea highway
  const diarrhoeaKeywords = ['diarrhoea', 'diarrhea', 'loose stool', 'watery stool', 'bloody stool', 'frequent stool'];
  if (highwayId !== 'diarrhoea' && diarrhoeaKeywords.some(kw => lower.includes(kw))) {
    const diarrHighway = getHighway('diarrhoea');
    if (diarrHighway) highways.push(diarrHighway);
  }

  // Cross-highway: when diarrhoea is primary, also check for other keywords
  if (highwayId === 'diarrhoea' && vomitingKeywords.some(kw => lower.includes(kw))) {
    const vomitHighway = getHighway('vomiting');
    if (vomitHighway && !highways.some(h => h.id === 'vomiting')) highways.push(vomitHighway);
  }
  if (highwayId === 'diarrhoea' && distensionKeywords.some(kw => lower.includes(kw))) {
    const distHighway = getHighway('abdominal_distension');
    if (distHighway && !highways.some(h => h.id === 'abdominal_distension')) highways.push(distHighway);
  }

  // Cross-highway activation: constipation keywords activate constipation highway
  const constipationKeywords = ['constipat', 'hard stool', 'difficult pass stool', 'infrequent stool', 'no bowel', 'not passed stool'];
  if (highwayId !== 'constipation' && constipationKeywords.some(kw => lower.includes(kw))) {
    const constipHighway = getHighway('constipation');
    if (constipHighway) highways.push(constipHighway);
  }

  // Cross-highway: when constipation is primary, also check for other keywords
  if (highwayId === 'constipation' && vomitingKeywords.some(kw => lower.includes(kw))) {
    const vomitHighway = getHighway('vomiting');
    if (vomitHighway && !highways.some(h => h.id === 'vomiting')) highways.push(vomitHighway);
  }
  if (highwayId === 'constipation' && distensionKeywords.some(kw => lower.includes(kw))) {
    const distHighway = getHighway('abdominal_distension');
    if (distHighway && !highways.some(h => h.id === 'abdominal_distension')) highways.push(distHighway);
  }
  if (highwayId === 'constipation' && diarrhoeaKeywords.some(kw => lower.includes(kw))) {
    const diarrHighway = getHighway('diarrhoea');
    if (diarrHighway && !highways.some(h => h.id === 'diarrhoea')) highways.push(diarrHighway);
  }

  // Cross-highway activation: dysphagia/odynophagia keywords activate dysphagia highway
  const dysphagiaKeywords = ['difficulty swallowing', 'trouble swallow', 'dysphagia', 'can\'t swallow', 'painful swallow', 'odynophagia', 'food stuck', 'choke food', 'swallowing problem', 'aspiration'];
  if (highwayId !== 'dysphagia' && dysphagiaKeywords.some(kw => lower.includes(kw))) {
    const dysphHighway = getHighway('dysphagia');
    if (dysphHighway) highways.push(dysphHighway);
  }

  // Cross-highway: when dysphagia is primary, also check for other keywords
  if (highwayId === 'dysphagia' && vomitingKeywords.some(kw => lower.includes(kw))) {
    const vomitHighway = getHighway('vomiting');
    if (vomitHighway && !highways.some(h => h.id === 'vomiting')) highways.push(vomitHighway);
  }
  if (highwayId === 'dysphagia' && constipationKeywords.some(kw => lower.includes(kw))) {
    const constipHighway = getHighway('constipation');
    if (constipHighway && !highways.some(h => h.id === 'constipation')) highways.push(constipHighway);
  }

  // Cross-highway activation: GI bleeding keywords activate GI bleeding highway
  const giBleedingKeywords = ['vomit blood', 'blood in vomit', 'black stool', 'tarry stool', 'blood in stool', 'bloody stool', 'blood per rectum', 'rectal bleeding', 'haematemesis', 'hematemesis', 'melena', 'hematochezia', 'maroon stool', 'bright red blood', 'coffee ground vomit'];
  if (highwayId !== 'gi_bleeding' && giBleedingKeywords.some(kw => lower.includes(kw))) {
    const giBleedHighway = getHighway('gi_bleeding');
    if (giBleedHighway) highways.push(giBleedHighway);
  }

  // Cross-highway: when GI bleeding is primary, also check for other keywords
  if (highwayId === 'gi_bleeding' && vomitingKeywords.some(kw => lower.includes(kw))) {
    const vomitHighway = getHighway('vomiting');
    if (vomitHighway && !highways.some(h => h.id === 'vomiting')) highways.push(vomitHighway);
  }
  if (highwayId === 'gi_bleeding' && constipationKeywords.some(kw => lower.includes(kw))) {
    const constipHighway = getHighway('constipation');
    if (constipHighway && !highways.some(h => h.id === 'constipation')) highways.push(constipHighway);
  }
  if (highwayId === 'gi_bleeding' && diarrhoeaKeywords.some(kw => lower.includes(kw))) {
    const diarrHighway = getHighway('diarrhoea');
    if (diarrHighway && !highways.some(h => h.id === 'diarrhoea')) highways.push(diarrHighway);
  }

  return highways;
}

/** Lookup table for specialized node sets */
const VOMIT_NODE_MAP = new Map(VOMITING_NODES.map(n => [n.id, n]));
const DISTENSION_NODE_MAP = new Map(DISTENSION_NODES.map(n => [n.id, n]));
const DIARRHOEA_NODE_MAP = new Map(DIARRHOEA_NODES.map(n => [n.id, n]));
const CONSTIPATION_NODE_MAP = new Map(CONSTIPATION_NODES.map(n => [n.id, n]));
const DYSPHAGIA_NODE_MAP = new Map(DYSPHAGIA_NODES.map(n => [n.id, n]));
const GI_BLEEDING_NODE_MAP = new Map(GI_BLEEDING_NODES.map(n => [n.id, n]));

/** Look up a disease node by ID from any source */
function lookupDisease(diseaseId: string): DiseaseNode | undefined {
  return EXTENDED_DISEASE_MAP.get(diseaseId)
    || VOMIT_NODE_MAP.get(diseaseId)
    || DISTENSION_NODE_MAP.get(diseaseId)
    || DIARRHOEA_NODE_MAP.get(diseaseId)
    || CONSTIPATION_NODE_MAP.get(diseaseId)
    || DYSPHAGIA_NODE_MAP.get(diseaseId)
    || GI_BLEEDING_NODE_MAP.get(diseaseId);
}

/** Merge disease nodes from multiple highways into a single map */
export function getMergedDiseaseMap(highways: SymptomHighway[]): Map<string, DiseaseNode> {
  const merged = new Map(ABDOMINAL_PAIN_DISEASE_MAP);
  for (const hw of highways) {
    if (hw.id === 'abdominal_pain') continue; // already included
    for (const diseaseId of hw.diseaseIds) {
      const disease = lookupDisease(diseaseId);
      if (disease && !merged.has(diseaseId)) {
        merged.set(diseaseId, disease);
      }
    }
  }
  return merged;
}
