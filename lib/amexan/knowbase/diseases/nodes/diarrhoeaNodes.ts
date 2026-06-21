import type { DiseaseNode, FeatureRecord } from '../../diseaseNode';
import { getFeature, getLrPlus, getLrMinus } from '../../features/featureLibrary';

function feat(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  const base = getFeature(id);
  return { ...base, sensitivity: sens, specificity: spec, LR_positive: getLrPlus({ ...base, sensitivity: sens, specificity: spec }), LR_negative: getLrMinus({ ...base, sensitivity: sens, specificity: spec }), ...overrides };
}
function sym(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  return feat(id, sens, spec, { ...overrides, category: 'symptom' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: VIRAL GASTROENTERITIS (5 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const viral_gastroenteritis_norovirus: DiseaseNode = {
  id: 'viral_gastroenteritis_norovirus', name: 'Norovirus Gastroenteritis', icdCode: 'A08.1', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [5, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'Norovirus causes acute-onset vomiting and watery diarrhoea through direct damage to intestinal villi and activation of enteric nervous system. Highly contagious, transmitted via faecal-oral route. Incubation 12–48 hours. Self-limiting in 24–72 hours.', timelineStages: [{ stageId: 1, label: 'Acute gastroenteritis', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('vomiting', 0.8, 0.5)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting; symptoms resolve within 24–72 hours. No chronic stage.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.8, 0.5, { stageRelevance: [1] }), sym('nausea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.6, 0.6, { stageRelevance: [1] }), sym('fever', 0.3, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.8, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.6, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('diarrhoea_weight_loss', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No weight loss — acute viral gastroenteritis is self-limiting, not chronic' })] },
  differential: { mimics: ['rotavirus', 'adenovirus_enteritis', 'astrovirus_enteritis', 'viral_gastroenteritis_generic', 'staph_food_poisoning', 'etec_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'staph_food_poisoning', featureIds: ['vomiting_timing', 'diarrhoea_duration'] }, { fromDiseaseId: 'etec_diarrhoea', featureIds: ['diarrhoea_travel_related'] }], neverCloseConditions: [] },
  complications: [{ name: 'Dehydration requiring IV fluids', warningFeatures: ['diarrhoea_dehydration', 'syncope'], riskFactors: ['elderly', 'infants'], timeWindowHours: [12, 48], severityTier: 'moderate', description: 'Significant fluid loss, especially in extremes of age.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration', 'syncope'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['vomiting', 'abdominal_pain', 'dehydration'], mechanism: 'secretory', typicalDescription: 'Acute onset of watery diarrhoea and vomiting after a short incubation period. Stools are non-bloody and may be profuse. Typically lasts 24–72 hours and resolves spontaneously.' },
};

export const viral_gastroenteritis_rotavirus: DiseaseNode = {
  id: 'viral_gastroenteritis_rotavirus', name: 'Rotavirus Gastroenteritis', icdCode: 'A08.0', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 0, ageMax: 10, agePeak: [0, 3], sexRisk: { male: 1.1, female: 1 }, backgroundPrevalence: 0.03, riskFactors: [] },
  pathophysiology: { mechanism: 'Rotavirus infects mature enterocytes at the tips of small intestinal villi, causing cell destruction and malabsorptive diarrhoea. Most common cause of severe dehydrating diarrhoea in infants and young children. Incubation 1–3 days. Vomiting precedes diarrhoea.', timelineStages: [{ stageId: 1, label: 'Acute gastroenteritis', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('vomiting', 0.8, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting, resolves in 3–7 days. Dehydration is the main risk.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.8, 0.5, { stageRelevance: [1] }), sym('nausea', 0.8, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.7, 0.6, { stageRelevance: [1] }), sym('fever', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.7, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('diarrhoea_dehydration', 0.6, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('diarrhoea_weight_loss', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'Absence of weight loss favours acute viral infection' })] },
  differential: { mimics: ['norovirus', 'adenovirus_enteritis', 'astrovirus_enteritis', 'etec_diarrhoea', 'giardiasis'], distinguishingFeatures: [{ fromDiseaseId: 'norovirus', featureIds: ['vomiting_frequency'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe dehydration', warningFeatures: ['diarrhoea_dehydration', 'syncope'], riskFactors: ['infants', 'malnutrition'], timeWindowHours: [12, 48], severityTier: 'severe', description: 'Life-threatening dehydration in infants, requiring urgent rehydration.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration', 'syncope'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'severe_10_plus', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['vomiting', 'fever', 'dehydration'], mechanism: 'secretory', typicalDescription: 'Profuse watery diarrhoea in a young child with prominent vomiting. Stools are typically watery and non-bloody, with high risk of dehydration.' },
};

export const viral_gastroenteritis_adenovirus: DiseaseNode = {
  id: 'viral_gastroenteritis_adenovirus', name: 'Adenovirus Gastroenteritis', icdCode: 'A08.2', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 0, ageMax: 10, agePeak: [0, 4], sexRisk: { male: 1.1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Adenovirus (types 40/41) infects intestinal epithelium causing watery diarrhoea, often prolonged compared to other viral gastroenteritides. Incubation 3–10 days. Associated with mild fever and respiratory symptoms.', timelineStages: [{ stageId: 1, label: 'Acute gastroenteritis', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('vomiting', 0.6, 0.5)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting but may persist for 1–2 weeks, longer than other viral gastroenteritides.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.6, 0.5, { stageRelevance: [1] }), sym('nausea', 0.6, 0.5, { stageRelevance: [1] }), sym('fever', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.7, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['rotavirus', 'norovirus', 'astrovirus_enteritis', 'giardiasis'], distinguishingFeatures: [{ fromDiseaseId: 'rotavirus', featureIds: ['diarrhoea_duration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Prolonged diarrhoea', warningFeatures: ['diarrhoea_duration', 'diarrhoea_dehydration'], riskFactors: ['immunocompromised'], timeWindowHours: [168, 336], severityTier: 'moderate', description: 'Diarrhoea may persist for 1–2 weeks leading to dehydration.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['fever', 'vomiting', 'dehydration'], mechanism: 'secretory', typicalDescription: 'Watery diarrhoea lasting 1–2 weeks with mild vomiting and low-grade fever. More prolonged than typical viral gastroenteritis.' },
};

export const viral_gastroenteritis_astrovirus: DiseaseNode = {
  id: 'viral_gastroenteritis_astrovirus', name: 'Astrovirus Gastroenteritis', icdCode: 'A08.3', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 0, ageMax: 10, agePeak: [0, 3], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Astrovirus causes mild, self-limiting watery diarrhoea primarily in young children and the elderly. Incubation 3–4 days. Typically milder than rotavirus with less vomiting.', timelineStages: [{ stageId: 1, label: 'Acute gastroenteritis', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('vomiting', 0.4, 0.5)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Mild self-limiting illness resolving within 2–4 days.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.5, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] }), sym('fever', 0.3, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['rotavirus', 'norovirus', 'adenovirus_enteritis', 'viral_gastroenteritis_generic'], distinguishingFeatures: [{ fromDiseaseId: 'rotavirus', featureIds: ['vomiting_frequency'] }], neverCloseConditions: [] },
  complications: [{ name: 'Dehydration', warningFeatures: ['diarrhoea_dehydration'], riskFactors: ['elderly', 'infants'], timeWindowHours: [24, 72], severityTier: 'mild', description: 'Mild dehydration from fluid losses.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['fever', 'dehydration'], mechanism: 'secretory', typicalDescription: 'Mild watery diarrhoea in a young child with minimal vomiting. Illness is typically less severe than rotavirus or norovirus.' },
};

export const viral_gastroenteritis_generic: DiseaseNode = {
  id: 'viral_gastroenteritis_generic', name: 'Acute Viral Gastroenteritis', icdCode: 'A09', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [5, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.05, riskFactors: [] },
  pathophysiology: { mechanism: 'Acute inflammation of the stomach and intestines caused by viral infection (most commonly norovirus, rotavirus, or adenovirus). Presents with acute onset of diarrhoea, vomiting, abdominal cramps, and sometimes fever. Self-limiting in immunocompetent individuals.', timelineStages: [{ stageId: 1, label: 'Acute gastroenteritis', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('vomiting', 0.7, 0.5)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Cramping abdominal pain', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting; complete recovery within 1–7 days.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.7, 0.5, { stageRelevance: [1] }), sym('nausea', 0.8, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.5, 0.6, { stageRelevance: [1] }), sym('fever', 0.4, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('diarrhoea_duration', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: "Chronic diarrhoea (>4 weeks) effectively rules out acute viral gastroenteritis" })], supporting: [] },
  differential: { mimics: ['norovirus', 'rotavirus', 'adenovirus_enteritis', 'etec_diarrhoea', 'staph_food_poisoning', 'giardiasis'], distinguishingFeatures: [{ fromDiseaseId: 'etec_diarrhoea', featureIds: ['diarrhoea_travel_related'] }], neverCloseConditions: [] },
  complications: [{ name: 'Dehydration', warningFeatures: ['diarrhoea_dehydration', 'syncope'], riskFactors: ['elderly', 'infants', 'immunocompromised'], timeWindowHours: [12, 72], severityTier: 'moderate', description: 'Fluid loss requiring oral or IV rehydration.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration', 'syncope'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['vomiting', 'abdominal_pain', 'fever', 'dehydration'], mechanism: 'secretory', typicalDescription: 'Acute watery diarrhoea with vomiting and abdominal cramps. Non-bloody, self-limiting, with complete recovery within one week.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: BACTERIAL DIARRHOEA (8 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const shigellosis: DiseaseNode = {
  id: 'shigellosis', name: 'Shigellosis (Bacillary Dysentery)', icdCode: 'A03.9', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [5, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Shigella species invade the colonic mucosa causing intense inflammation with microabscesses and superficial ulceration. Presents with dysentery: frequent small-volume bloody mucoid stools with tenesmus, high fever, and abdominal cramps. Incubation 1–4 days.', timelineStages: [{ stageId: 1, label: 'Acute dysentery', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('fever', 0.8, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe cramping', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Without treatment, symptoms peak at 3–5 days then gradually resolve over 1–2 weeks.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('fever', 0.8, 0.6, { stageRelevance: [1] }), sym('fever_chills', 0.5, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.6, 0.95, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.7, 0.75, { stageRelevance: [1] }), sym('diarrhoea_tenesmus', 0.7, 0.8, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.6, 0.6, { stageRelevance: [1] }), sym('diarrhoea_mucus', 0.6, 0.85, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('diarrhoea_fever', 0.7, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No bloody stool makes shigellosis unlikely' })], supporting: [] },
  differential: { mimics: ['salmonellosis', 'campylobacter_enteritis', 'ehec_diarrhoea', 'amoebic_dysentery', 'ulcerative_colitis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'amoebic_dysentery', featureIds: ['diarrhoea_fever', 'diarrhoea_tenesmus'] }, { fromDiseaseId: 'ulcerative_colitis_diarrhoea', featureIds: ['diarrhoea_duration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Haemolytic uraemic syndrome (HUS)', warningFeatures: ['diarrhoea_dehydration', 'fever'], riskFactors: ['children', 'S. dysenteriae type 1'], timeWindowHours: [72, 168], severityTier: 'critical', description: 'Shiga toxin-producing Shigella can cause HUS with renal failure.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia', 'fever_chills'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'mixed', volume: 'small', frequency: 'severe_10_plus', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'mucus', 'tenesmus', 'dehydration'], mechanism: 'inflammatory', typicalDescription: 'Frequent small-volume bloody mucoid stools with high fever, severe abdominal cramps, and tenesmus. Classic bacillary dysentery presentation.' },
};

export const salmonellosis: DiseaseNode = {
  id: 'salmonellosis', name: 'Salmonella Gastroenteritis', icdCode: 'A02.0', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [5, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Non-typhoidal Salmonella (often S. enteritidis, S. typhimurium) invades the ileum and colon causing inflammatory diarrhoea. Incubation 6–72 hours from ingestion of contaminated food (eggs, poultry). Presents with watery or bloody diarrhoea, fever, abdominal cramps.', timelineStages: [{ stageId: 1, label: 'Acute enterocolitis', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('fever', 0.7, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting in immunocompetent patients, resolving within 4–7 days.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('fever', 0.7, 0.6, { stageRelevance: [1] }), sym('fever_chills', 0.4, 0.9, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.5, { stageRelevance: [1] }), sym('nausea', 0.6, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.5, 0.75, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.5, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['campylobacter_enteritis', 'shigellosis', 'etec_diarrhoea', 'viral_gastroenteritis_generic'], distinguishingFeatures: [{ fromDiseaseId: 'shigellosis', featureIds: ['hematochezia', 'diarrhoea_tenesmus'] }, { fromDiseaseId: 'etec_diarrhoea', featureIds: ['fever'] }], neverCloseConditions: [] },
  complications: [{ name: 'Bacteraemia and extra-intestinal infection', warningFeatures: ['fever_chills', 'fever'], riskFactors: ['immunocompromised', 'sickle_cell', 'elderly', 'neonates'], timeWindowHours: [48, 168], severityTier: 'severe', description: 'Salmonella can cause bacteraemia, endovascular infection, osteomyelitis.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever_chills'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'vomiting', 'dehydration'], mechanism: 'inflammatory', typicalDescription: 'Acute onset of watery (sometimes bloody) diarrhoea with fever and abdominal cramps after incubation period. Self-limiting but may cause bacteraemia in vulnerable hosts.' },
};

export const campylobacter_enteritis: DiseaseNode = {
  id: 'campylobacter_enteritis', name: 'Campylobacter jejuni Enteritis', icdCode: 'A04.5', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [10, 40], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: "Campylobacter jejuni, commonly from undercooked poultry, causes inflammatory enterocolitis. Incubation 1–7 days. Presents with fever, profuse watery or bloody diarrhoea, and severe abdominal cramps that may mimic appendicitis. Prodrome of fever, malaise, and myalgias.", timelineStages: [{ stageId: 1, label: 'Acute enterocolitis', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('fever', 0.8, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe cramping/colicky', painLocationTypical: 'Periumbilical/RLQ', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting, resolves within 5–10 days. Antibiotics shorten duration.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('fever', 0.8, 0.6, { stageRelevance: [1] }), sym('fever_chills', 0.5, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.4, 0.95, { stageRelevance: [1] }), sym('vomiting', 0.3, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.5, 0.75, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_fever', 0.7, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['salmonellosis', 'shigellosis', 'appendicitis', 'ehec_diarrhoea', 'ulcerative_colitis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'salmonellosis', featureIds: ['pain_character'] }], neverCloseConditions: [] },
  complications: [{ name: 'Guillain-Barre syndrome', warningFeatures: ['fever'], riskFactors: ['campylobacter_infection'], timeWindowHours: [168, 840], severityTier: 'severe', description: 'Post-infectious polyneuropathy caused by molecular mimicry.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever_chills'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'dehydration'], mechanism: 'inflammatory', typicalDescription: 'Acute diarrhoea with high fever and severe abdominal cramps, often with blood. Cramps can be severe enough to mimic other surgical conditions.' },
};

export const etec_diarrhoea: DiseaseNode = {
  id: 'etec_diarrhoea', name: "Enterotoxigenic E. coli (Traveller's Diarrhoea)", icdCode: 'A04.1', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [20, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'ETEC produces heat-labile (LT) and heat-stable (ST) enterotoxins that cause increased cAMP/cGMP in enterocytes, resulting in profuse watery secretion. Major cause of traveller diarrhoea. Incubation 12–72 hours. Watery diarrhoea without blood or mucus.', timelineStages: [{ stageId: 1, label: 'Acute secretory diarrhoea', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_travel_related', 0.7, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting, resolves within 3–5 days. May be shortened with antibiotics.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('diarrhoea_travel_related', 0.7, 0.85, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.3, 0.5, { stageRelevance: [1] }), sym('fever', 0.3, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_dehydration', 0.5, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('diarrhoea_travel_related', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No recent travel makes ETEC less likely' })], supporting: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Absence of blood supports non-invasive ETEC diarrhoea' })] },
  differential: { mimics: ['viral_gastroenteritis_generic', 'cholera', 'ehec_diarrhoea', 'giardiasis', 'staph_food_poisoning'], distinguishingFeatures: [{ fromDiseaseId: 'viral_gastroenteritis_generic', featureIds: ['diarrhoea_travel_related'] }, { fromDiseaseId: 'cholera', featureIds: ['diarrhoea_volume', 'diarrhoea_dehydration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Dehydration', warningFeatures: ['diarrhoea_dehydration'], riskFactors: ['infants', 'elderly'], timeWindowHours: [12, 72], severityTier: 'moderate', description: 'Profuse watery diarrhoea leading to significant fluid loss.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'dehydration'], mechanism: 'secretory', typicalDescription: 'Watery non-bloody diarrhoea in a traveller, often with mild cramps. Stools are profuse but without fever or systemic toxicity.' },
};

export const ehec_diarrhoea: DiseaseNode = {
  id: 'ehec_diarrhoea', name: 'Enterohemorrhagic E. coli (STEC)', icdCode: 'A04.3', system: 'infectious',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [5, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Shiga toxin-producing E. coli (O157:H7) causes haemorrhagic colitis with bloody diarrhoea. Toxin causes endothelial damage leading to HUS in 5–15% of cases. Incubation 3–8 days from contaminated beef or produce. Pain is disproportionately severe.', timelineStages: [{ stageId: 1, label: 'Haemorrhagic colitis', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('hematochezia', 0.9, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Symptoms peak at 3–5 days. HUS develops 5–10 days after onset.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.9, 0.95, { stageRelevance: [1] }), sym('fever', 0.3, 0.6, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.8, 0.75, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_dehydration', 0.5, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No blood in stool makes STEC very unlikely' })], supporting: [] },
  differential: { mimics: ['shigellosis', 'campylobacter_enteritis', 'salmonellosis', 'ischaemic_colitis_diarrhoea', 'ulcerative_colitis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'shigellosis', featureIds: ['fever'] }, { fromDiseaseId: 'ischaemic_colitis_diarrhoea', featureIds: ['pain_character', 'htn_cad'] }], neverCloseConditions: [] },
  complications: [{ name: 'Haemolytic uraemic syndrome (HUS)', warningFeatures: ['diarrhoea_dehydration', 'fever'], riskFactors: ['children <5', 'elderly'], timeWindowHours: [72, 240], severityTier: 'critical', description: 'Microangiopathic haemolytic anaemia, thrombocytopenia, renal failure.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'bloody', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'blood', 'vomiting', 'dehydration'], mechanism: 'inflammatory', typicalDescription: 'Acute onset of bloody diarrhoea with severe abdominal cramps but often no fever. Stools are blood-streaked and may initially be watery before becoming frankly bloody.' },
};

export const cholera: DiseaseNode = {
  id: 'cholera', name: 'Cholera', icdCode: 'A00.9', system: 'infectious',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [5, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [], geographicFlags: ['endemic_areas'] },
  pathophysiology: { mechanism: 'Vibrio cholerae colonises the small intestine and produces cholera toxin (CT), which ADP-ribosylates Gs protein causing constitutive activation of adenylate cyclase. Massive fluid and electrolyte secretion into the bowel lumen produces the classic rice-water stool. Incubation 12–72 hours.', timelineStages: [{ stageId: 1, label: 'Acute secretory diarrhoea', typicalHoursFromOnset: [0, 12], dominantSymptoms: [sym('diarrhea', 0.95, 0.5), sym('diarrhoea_dehydration', 0.9, 0.75)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Mild or no pain', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Rapid progression to severe dehydration within hours if untreated.' },
  features: { symptoms: [sym('diarrhea', 0.95, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.5, 0.5, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.8, 0.75, { stageRelevance: [1] }), sym('diarrhoea_volume', 0.9, 0.7, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.8, 0.6, { stageRelevance: [1] }), sym('diarrhoea_dehydration', 0.9, 0.75, { stageRelevance: [1] }), sym('diarrhoea_travel_related', 0.6, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('diarrhoea_volume', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'Small-volume diarrhoea makes cholera unlikely' })], supporting: [] },
  differential: { mimics: ['etec_diarrhoea', 'viral_gastroenteritis_generic', 'vipoma', 'carcinoid_syndrome_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'etec_diarrhoea', featureIds: ['diarrhoea_volume', 'diarrhoea_dehydration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe dehydration and hypovolaemic shock', warningFeatures: ['diarrhoea_dehydration', 'syncope'], riskFactors: ['delayed_rehydration'], timeWindowHours: [6, 24], severityTier: 'critical', description: 'Volume loss can exceed 1 L/hour. Death from shock within hours if untreated.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration', 'syncope'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'massive', frequency: 'continuous', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['vomiting', 'dehydration'], mechanism: 'secretory', typicalDescription: 'Massive, painless watery diarrhoea — classic rice-water stools. Volume loss is dramatic with rapid dehydration. Minimal abdominal pain.' },
};

export const staph_food_poisoning: DiseaseNode = {
  id: 'staph_food_poisoning', name: 'Staphylococcus aureus Food Poisoning', icdCode: 'A05.0', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [10, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Preformed enterotoxins (A–E) produced by Staphylococcus aureus in contaminated food (mayonnaise, dairy, meats) are ingested and stimulate the emetic centre and intestinal secretion. Incubation is extremely short (30 minutes to 6 hours). Presents with abrupt onset of vomiting, diarrhoea, and cramps.', timelineStages: [{ stageId: 1, label: 'Acute food poisoning', typicalHoursFromOnset: [0, 6], dominantSymptoms: [sym('vomiting', 0.9, 0.5), sym('diarrhea', 0.7, 0.5)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Rapid onset, rapid resolution. Symptoms resolve within 24 hours.' },
  features: { symptoms: [sym('vomiting', 0.9, 0.5, { stageRelevance: [1] }), sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('nausea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.7, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['bacillus_cereus_diarrhoea', 'viral_gastroenteritis_generic', 'norovirus', 'etec_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'viral_gastroenteritis_generic', featureIds: ['vomiting_frequency', 'diarrhoea_duration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Dehydration', warningFeatures: ['vomiting_frequency', 'diarrhoea_dehydration'], riskFactors: ['elderly', 'infants'], timeWindowHours: [6, 24], severityTier: 'mild', description: 'Fluid loss from vomiting and diarrhoea.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['vomiting', 'abdominal_pain'], mechanism: 'secretory', typicalDescription: 'Acute onset of prominent vomiting and diarrhoea within hours of eating contaminated food. Vomiting is the dominant symptom. Rapidly self-limiting.' },
};

export const bacillus_cereus_diarrhoea: DiseaseNode = {
  id: 'bacillus_cereus_diarrhoea', name: 'Bacillus cereus Diarrhoeal Toxin', icdCode: 'A05.4', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [10, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Diarrhoeal-type toxin from Bacillus cereus (often from reheated rice, pasta, or meat) causes intestinal secretion with a longer incubation (8–16 hours) than the emetic form. Presents with watery diarrhoea, abdominal cramps, and some nausea.', timelineStages: [{ stageId: 1, label: 'Acute diarrhoeal illness', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('pain_character', 0.6, 0.6)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting, resolving within 24–36 hours.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('nausea', 0.6, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.3, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['staph_food_poisoning', 'viral_gastroenteritis_generic', 'etec_diarrhoea', 'salmonellosis'], distinguishingFeatures: [{ fromDiseaseId: 'staph_food_poisoning', featureIds: ['vomiting_frequency', 'diarrhoea_duration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Dehydration', warningFeatures: ['diarrhoea_dehydration'], riskFactors: ['elderly'], timeWindowHours: [12, 36], severityTier: 'mild', description: 'Mild to moderate dehydration.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'dehydration'], mechanism: 'secretory', typicalDescription: 'Watery diarrhoea with abdominal cramps starting 8–16 hours after eating contaminated food. Vomiting is less prominent than the staph form.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: ANTIBIOTIC-ASSOCIATED (2 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const c_diff_colitis: DiseaseNode = {
  id: 'c_diff_colitis', name: 'Clostridioides difficile Colitis', icdCode: 'A04.7', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 10, ageMax: 90, agePeak: [60, 85], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'C. difficile overgrowth following antibiotic disruption of colonic flora. Toxins A and B cause colonic inflammation with pseudomembrane formation. Ranges from mild diarrhoea to fulminant colitis with toxic megacolon. Recurrence is common.', timelineStages: [{ stageId: 1, label: 'C. difficile colitis', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_antibiotics_related', 0.8, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping lower abdominal pain', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Without treatment, may progress to pseudomembranous colitis and toxic megacolon.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('diarrhoea_antibiotics_related', 0.8, 0.9, { stageRelevance: [1] }), sym('fever', 0.5, 0.6, { stageRelevance: [1] }), sym('hematochezia', 0.2, 0.95, { stageRelevance: [1] }), sym('diarrhoea_mucus', 0.5, 0.85, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.6, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.5, 0.75, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_dehydration', 0.5, 0.75, { stageRelevance: [1] }), sym('diarrhoea_fever', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('diarrhoea_antibiotics_related', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No antibiotic history makes C. diff unlikely' })], supporting: [] },
  differential: { mimics: ['aad_generic', 'shigellosis', 'ulcerative_colitis_diarrhoea', 'ehec_diarrhoea', 'salmonellosis'], distinguishingFeatures: [{ fromDiseaseId: 'aad_generic', featureIds: ['diarrhoea_fever', 'diarrhoea_mucus'] }], neverCloseConditions: [] },
  complications: [{ name: 'Toxic megacolon', warningFeatures: ['diarrhoea_dehydration', 'abdominal_distension', 'fever'], riskFactors: ['severe_cdiff'], timeWindowHours: [72, 336], severityTier: 'critical', description: 'Life-threatening colonic dilation. Requires surgical colectomy.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration', 'abdominal_distension'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'severe_10_plus', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['fever', 'abdominal_pain', 'mucus', 'dehydration'], mechanism: 'inflammatory', typicalDescription: 'Watery diarrhoea starting during or after antibiotic treatment, often with lower abdominal cramps and systemic symptoms. Stools may be mucoid.' },
};

export const aad_generic: DiseaseNode = {
  id: 'aad_generic', name: 'Antibiotic-Associated Diarrhoea (General)', icdCode: 'K52.1', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [30, 70], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'Non-C. difficile antibiotic-associated diarrhoea results from disruption of colonic flora leading to reduced carbohydrate fermentation and altered bile acid metabolism. Usually mild and self-limiting. More common with broad-spectrum antibiotics.', timelineStages: [{ stageId: 1, label: 'Antibiotic diarrhoea', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_antibiotics_related', 0.7, 0.9)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting; resolves when antibiotics are stopped or course completed.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('diarrhoea_antibiotics_related', 0.7, 0.9, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.4, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.5, 0.75, { stageRelevance: [1] }), sym('pain_character', 0.3, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('fever', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.3, label: 'Absence of fever favours mild AAD over C. diff colitis' })] },
  differential: { mimics: ['c_diff_colitis', 'viral_gastroenteritis_generic'], distinguishingFeatures: [{ fromDiseaseId: 'c_diff_colitis', featureIds: ['fever', 'diarrhoea_mucus'] }], neverCloseConditions: [] },
  complications: [{ name: 'Persistent diarrhoea', warningFeatures: ['diarrhoea_duration'], riskFactors: ['prolonged_antibiotics'], timeWindowHours: [168, 720], severityTier: 'mild', description: 'Diarrhoea may persist for several weeks after antibiotic cessation.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain'], mechanism: 'osmotic', typicalDescription: 'Mild watery diarrhoea during or after antibiotic use. Stools are non-bloody and not associated with systemic symptoms.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: PARASITIC (7 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const giardiasis: DiseaseNode = {
  id: 'giardiasis', name: 'Giardiasis', icdCode: 'A07.1', system: 'infectious',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [20, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Giardia lamblia (intestinalis) colonises the duodenum and proximal jejunum, coating the epithelium and disrupting brush border enzymes. Causes malabsorptive diarrhoea with steatorrhoea, bloating, and foul-smelling stools. Incubation 1–3 weeks. Often waterborne.', timelineStages: [{ stageId: 1, label: 'Acute giardiasis', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('steatorrhea', 0.6, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric/upper abdominal cramps', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'May become chronic if untreated, with persistent diarrhoea and weight loss.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('steatorrhea', 0.6, 0.85, { stageRelevance: [1] }), sym('bloating', 0.7, 0.55, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.85, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.5, 0.7, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.4, 0.6, { stageRelevance: [1] }), sym('diarrhoea_improves_fasting', 0.5, 0.8, { stageRelevance: [1] }), sym('diarrhoea_travel_related', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Absence of blood favours giardiasis over invasive bacterial infections' })] },
  differential: { mimics: ['cryptosporidiosis', 'tropical_sprue', 'celiac_disease_diarrhoea', 'sibo_diarrhoea', 'cyclospora_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'celiac_disease_diarrhoea', featureIds: ['diarrhoea_travel_related'] }], neverCloseConditions: [] },
  complications: [{ name: 'Chronic diarrhoea and malnutrition', warningFeatures: ['weight_loss', 'diarrhoea_duration'], riskFactors: ['immunocompromised', 'children'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Persistent malabsorption leading to weight loss and nutritional deficiencies.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'persistent', stoolType: 'fatty_steatorrhea', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'weight_loss'], mechanism: 'malabsorptive', typicalDescription: 'Foul-smelling, greasy, floating stools with bloating and upper abdominal cramps. Diarrhoea is persistent and worse after eating. Classic steatorrhoea.' },
};

export const amoebic_dysentery: DiseaseNode = {
  id: 'amoebic_dysentery', name: 'Amoebic Dysentery (Entamoeba histolytica)', icdCode: 'A06.0', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 10, ageMax: 70, agePeak: [20, 45], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Entamoeba histolytica invades the colonic mucosa causing flask-shaped ulcers with minimal systemic inflammation. Presents with dysentery: bloody mucoid stools, tenesmus, and abdominal pain, but often WITHOUT significant fever — a key distinction from shigellosis.', timelineStages: [{ stageId: 1, label: 'Amoebic colitis', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('hematochezia', 0.7, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping lower abdominal pain', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'May become chronic or progress to fulminant colitis and amoeboma.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.7, 0.95, { stageRelevance: [1] }), sym('diarrhoea_mucus', 0.7, 0.85, { stageRelevance: [1] }), sym('diarrhoea_tenesmus', 0.6, 0.8, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.7, 0.75, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.5, 0.6, { stageRelevance: [1] }), sym('fever', 0.3, 0.6, { stageRelevance: [1] }), sym('diarrhoea_travel_related', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('fever', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.3, label: 'Absence of high fever suggests amoebic rather than bacillary dysentery' })] },
  differential: { mimics: ['shigellosis', 'ulcerative_colitis_diarrhoea', 'ehec_diarrhoea', 'campylobacter_enteritis', 'c_diff_colitis'], distinguishingFeatures: [{ fromDiseaseId: 'shigellosis', featureIds: ['fever'] }], neverCloseConditions: [] },
  complications: [{ name: 'Amoebic liver abscess', warningFeatures: ['fever', 'pain_character'], riskFactors: ['delayed_treatment'], timeWindowHours: [336, 4320], severityTier: 'severe', description: 'Haematogenous spread to liver causing abscess formation.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'mixed', volume: 'small', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'blood', 'mucus', 'tenesmus'], mechanism: 'inflammatory', typicalDescription: 'Bloody mucoid stools with tenesmus and lower abdominal pain but relatively little fever. Stools resemble anchovy paste.' },
};

export const cryptosporidiosis: DiseaseNode = {
  id: 'cryptosporidiosis', name: 'Cryptosporidium Diarrhoea', icdCode: 'A07.2', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [5, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Cryptosporidium parvum/hominis infects small intestinal epithelial cells, causing watery diarrhoea through a combination of malabsorption and secretion. Incubation 2–10 days. Waterborne (cryptosporidiosis is chlorine-resistant). In immunocompetent patients, self-limiting over 1–2 weeks.', timelineStages: [{ stageId: 1, label: 'Acute cryptosporidiosis', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_volume', 0.7, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting in immunocompetent; chronic in immunocompromised.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.85, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('diarrhoea_volume', 0.7, 0.7, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.5, 0.7, { stageRelevance: [1] }), sym('diarrhoea_travel_related', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['giardiasis', 'cyclospora_diarrhoea', 'viral_gastroenteritis_generic', 'etec_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'giardiasis', featureIds: ['steatorrhea'] }], neverCloseConditions: [] },
  complications: [{ name: 'Chronic wasting diarrhoea in HIV', warningFeatures: ['weight_loss', 'diarrhoea_duration'], riskFactors: ['hiv_status'], timeWindowHours: [336, 4320], severityTier: 'severe', description: 'Profuse persistent diarrhoea causing severe wasting in AIDS.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'persistent', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'], mechanism: 'mixed', typicalDescription: 'Profuse watery diarrhoea lasting 1–3 weeks with abdominal cramps. In immunocompromised patients, can become chronic and life-threatening.' },
};

export const cyclospora_diarrhoea: DiseaseNode = {
  id: 'cyclospora_diarrhoea', name: 'Cyclospora Diarrhoea', icdCode: 'A07.4', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [20, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Cyclospora cayetanensis is a coccidian parasite that infects small intestinal epithelium, causing watery diarrhoea with prolonged course (weeks if untreated). Incubation about 7 days. Associated with imported fresh produce. Can relapse.', timelineStages: [{ stageId: 1, label: 'Acute cyclosporiasis', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_volume', 0.6, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'May become prolonged and relapsing if untreated.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.3, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.85, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_travel_related', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['cryptosporidiosis', 'giardiasis', 'tropical_sprue', 'celiac_disease_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'cryptosporidiosis', featureIds: ['diarrhoea_duration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Prolonged diarrhoea and weight loss', warningFeatures: ['weight_loss', 'diarrhoea_duration'], riskFactors: ['immunocompromised'], timeWindowHours: [336, 2160], severityTier: 'moderate', description: 'Chronic diarrhoea lasting weeks without treatment.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'persistent', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'], mechanism: 'mixed', typicalDescription: 'Prolonged watery diarrhoea with profound fatigue and weight loss. Often has a relapsing pattern if untreated.' },
};

export const strongyloides_diarrhoea: DiseaseNode = {
  id: 'strongyloides_diarrhoea', name: 'Strongyloides Infection', icdCode: 'B78.0', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 10, ageMax: 80, agePeak: [20, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Strongyloides stercoralis is a unique nematode capable of autoinfection. Infects duodenum and jejunum causing watery diarrhoea, abdominal pain, and eosinophilia. In immunocompromised, can cause hyperinfection syndrome with dissemination and high mortality.', timelineStages: [{ stageId: 1, label: 'Intestinal strongyloidiasis', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('diarrhea', 0.7, 0.5), sym('pain_character', 0.5, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric pain', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'Chronic infection with ongoing autoinfection. Can remain asymptomatic for decades.' },
  features: { symptoms: [sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.4, 0.75, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.85, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['giardiasis', 'celiac_disease_diarrhoea', 'peptic_ulcer_disease', 'sibo_diarrhoea', 'hookworm_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'giardiasis', featureIds: ['steatorrhea'] }], neverCloseConditions: [] },
  complications: [{ name: 'Hyperinfection syndrome', warningFeatures: ['fever', 'weight_loss'], riskFactors: ['hiv_status', 'steroid_use', 'immunocompromised'], timeWindowHours: [168, 2160], severityTier: 'critical', description: 'Massive larval dissemination causing Gram-negative sepsis, meningitis, and death.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'weight_loss'], mechanism: 'mixed', typicalDescription: 'Chronic watery diarrhoea with epigastric pain and weight loss. May have intermittent symptoms due to autoinfection cycle.' },
};

export const hookworm_diarrhoea: DiseaseNode = {
  id: 'hookworm_diarrhoea', name: 'Hookworm Infection', icdCode: 'B76.9', system: 'infectious',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 5, ageMax: 70, agePeak: [10, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Ancylostoma duodenale and Necator americanus attach to the small intestinal mucosa and suck blood. Heavy infections cause iron-deficiency anaemia and, in some cases, diarrhoea with abdominal pain. Ground itch at larval entry site.', timelineStages: [{ stageId: 1, label: 'Intestinal hookworm', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('diarrhea', 0.4, 0.5), sym('pain_character', 0.4, 0.6)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Vague epigastric pain', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'Chronic infection with progressive anaemia over months to years.' },
  features: { symptoms: [sym('diarrhea', 0.4, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.3, 0.85, { stageRelevance: [1] }), sym('pain_character', 0.4, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['strongyloides_diarrhoea', 'giardiasis', 'peptic_ulcer_disease'], distinguishingFeatures: [{ fromDiseaseId: 'giardiasis', featureIds: ['steatorrhea'] }], neverCloseConditions: [] },
  complications: [{ name: 'Iron-deficiency anaemia', warningFeatures: ['weight_loss'], riskFactors: ['heavy_burden'], timeWindowHours: [2160, 21600], severityTier: 'moderate', description: 'Chronic blood loss from hookworm feeding.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain'], mechanism: 'mixed', typicalDescription: 'Mild chronic diarrhoea with epigastric discomfort. Anaemia is often the dominant clinical feature.' },
};

export const trichuriasis: DiseaseNode = {
  id: 'trichuriasis', name: 'Trichuris (Whipworm) Infection', icdCode: 'B79', system: 'infectious',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 60, agePeak: [5, 20], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Trichuris trichiura (whipworm) inhabits the caecum and colon. Heavy infections cause mucoid bloody diarrhoea, tenesmus, and rectal prolapse (especially in children). Dysentery-like syndrome is called Trichuris dysentery syndrome.', timelineStages: [{ stageId: 1, label: 'Trichuriasis', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('diarrhea', 0.5, 0.5), sym('diarrhoea_mucus', 0.5, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Lower abdominal cramps', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Chronic infection without treatment. Heavy burdens cause dysentery.' },
  features: { symptoms: [sym('diarrhea', 0.5, 0.5, { stageRelevance: [1] }), sym('diarrhoea_mucus', 0.5, 0.85, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('diarrhoea_tenesmus', 0.4, 0.8, { stageRelevance: [1] }), sym('pain_character', 0.3, 0.6, { stageRelevance: [1] }), sym('weight_loss', 0.3, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['amoebic_dysentery', 'shigellosis', 'ulcerative_colitis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'shigellosis', featureIds: ['fever', 'diarrhoea_fever'] }], neverCloseConditions: [] },
  complications: [{ name: 'Rectal prolapse', warningFeatures: ['diarrhoea_mucus', 'hematochezia'], riskFactors: ['heavy_burden', 'children'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Prolapse from straining and heavy worm burden.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'mucoid', volume: 'small', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'blood', 'mucus', 'tenesmus'], mechanism: 'inflammatory', typicalDescription: 'Chronic mucoid diarrhoea with tenesmus and rectal pain. Heavy infections cause dysentery-like picture with bloody mucoid stools.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: INFLAMMATORY BOWEL DISEASE (4 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const ulcerative_colitis_diarrhoea: DiseaseNode = {
  id: 'ulcerative_colitis_diarrhoea', name: 'Ulcerative Colitis (Active)', icdCode: 'K51.9', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 10, ageMax: 80, agePeak: [15, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic idiopathic inflammation confined to the colonic mucosa, starting in the rectum and extending proximally. Active disease presents with bloody mucoid diarrhoea, tenesmus, urgency, and nocturnal symptoms. Extraintestinal manifestations include arthritis, uveitis, and skin lesions.', timelineStages: [{ stageId: 1, label: 'Active colitis', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('hematochezia', 0.8, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping lower abdominal pain', painLocationTypical: 'Left lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'Relapsing-remitting course. May progress from proctitis to pancolitis.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.8, 0.95, { stageRelevance: [1] }), sym('diarrhoea_mucus', 0.6, 0.85, { stageRelevance: [1] }), sym('diarrhoea_tenesmus', 0.7, 0.8, { stageRelevance: [1] }), sym('diarrhoea_nocturnal', 0.7, 0.85, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.6, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.85, { stageRelevance: [1] }), sym('diarrhoea_perianal', 0.1, 0.85, { stageRelevance: [1] }), sym('diarrhoea_arthritis', 0.2, 0.85, { stageRelevance: [1] }), sym('diarrhoea_rash', 0.1, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No blood makes active UC unlikely' })], supporting: [] },
  differential: { mimics: ['crohns_diarrhoea', 'shigellosis', 'amoebic_dysentery', 'c_diff_colitis', 'ehec_diarrhoea', 'ischaemic_colitis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'crohns_diarrhoea', featureIds: ['diarrhoea_perianal', 'diarrhoea_oral_ulcers'] }, { fromDiseaseId: 'shigellosis', featureIds: ['diarrhoea_duration', 'diarrhoea_nocturnal'] }], neverCloseConditions: [] },
  complications: [{ name: 'Toxic megacolon', warningFeatures: ['diarrhoea_frequency', 'abdominal_distension', 'fever'], riskFactors: ['severe_pancolitis'], timeWindowHours: [72, 336], severityTier: 'critical', description: 'Life-threatening colonic dilation requiring colectomy.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia', 'weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'mixed', volume: 'small', frequency: 'severe_10_plus', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['blood', 'mucus', 'tenesmus', 'abdominal_pain', 'weight_loss', 'arthritis'], mechanism: 'inflammatory', typicalDescription: 'Chronic relapsing bloody mucoid diarrhoea with urgency and tenesmus. Nocturnal symptoms are characteristic, distinguishing from functional disorders.' },
};

export const crohns_diarrhoea: DiseaseNode = {
  id: 'crohns_diarrhoea', name: 'Crohn Disease (Active)', icdCode: 'K50.9', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 10, ageMax: 80, agePeak: [15, 35], sexRisk: { male: 0.9, female: 1.1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic transmural inflammation affecting any part of the GI tract (most commonly terminal ileum). Skip lesions, fistulae, and strictures are hallmarks. Active disease causes diarrhoea from inflammation, malabsorption, and bile salt malabsorption. Presents with pain, diarrhoea, weight loss, and fatigue.', timelineStages: [{ stageId: 1, label: 'Active Crohn disease', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('diarrhea', 0.8, 0.5), sym('pain_character', 0.7, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Colicky right lower quadrant pain', painLocationTypical: 'RLQ', painRadiationTypical: 'None' }], progressionRule: 'Relapsing-remitting. Progressive over time with stricturing and fistulising phenotypes.' },
  features: { symptoms: [sym('diarrhea', 0.8, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }), sym('weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('fever', 0.4, 0.6, { stageRelevance: [1] }), sym('night_sweats', 0.3, 0.9, { stageRelevance: [1] }), sym('diarrhoea_nocturnal', 0.5, 0.85, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.4, 0.75, { stageRelevance: [1] }), sym('diarrhoea_perianal', 0.4, 0.85, { stageRelevance: [1] }), sym('diarrhoea_oral_ulcers', 0.3, 0.85, { stageRelevance: [1] }), sym('diarrhoea_arthritis', 0.3, 0.85, { stageRelevance: [1] }), sym('steatorrhea', 0.3, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ulcerative_colitis_diarrhoea', 'intestinal_tuberculosis_diarrhoea', 'small_bowel_lymphoma', 'sibo_diarrhoea', 'appendicitis'], distinguishingFeatures: [{ fromDiseaseId: 'ulcerative_colitis_diarrhoea', featureIds: ['diarrhoea_perianal', 'diarrhoea_oral_ulcers', 'steatorrhea'] }, { fromDiseaseId: 'intestinal_tuberculosis_diarrhoea', featureIds: ['diarrhoea_perianal'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal stricture and obstruction', warningFeatures: ['obstipation', 'abdominal_distension'], riskFactors: ['chronic_inflammation'], timeWindowHours: [4320, 43200], severityTier: 'severe', description: 'Fibrotic strictures causing bowel obstruction.' }, { name: 'Fistula formation', warningFeatures: ['diarrhoea_perianal'], riskFactors: ['transmural_inflammation'], timeWindowHours: [2160, 21600], severityTier: 'severe', description: 'Abnormal connections between bowel and other structures.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'night_sweats'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'weight_loss', 'fever', 'arthritis'], mechanism: 'inflammatory', typicalDescription: 'Chronic diarrhoea with right lower quadrant pain, weight loss, and fatigue. Stools may be watery or semiformed. Perianal disease and fistulae are distinguishing features.' },
};

export const microscopic_colitis: DiseaseNode = {
  id: 'microscopic_colitis', name: 'Microscopic Colitis (Collagenous/Lymphocytic)', icdCode: 'K52.83', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 75], sexRisk: { male: 0.3, female: 1.7 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic watery diarrhoea with normal colonoscopy but characteristic histology: thickened subepithelial collagen band (collagenous) or intraepithelial lymphocytosis (lymphocytic). Associated with NSAIDs, PPIs, SSRIs, smoking, and autoimmune conditions.', timelineStages: [{ stageId: 1, label: 'Chronic diarrhoea', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_volume', 0.5, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic but not progressive. Fluctuates in severity. May remit spontaneously.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.7, 0.7, { stageRelevance: [1] }), sym('diarrhoea_nocturnal', 0.5, 0.85, { stageRelevance: [1] }), sym('diarrhoea_weight_loss', 0.3, 0.8, { stageRelevance: [1] }), sym('weight_loss', 0.3, 0.85, { stageRelevance: [1] }), sym('nsaid_use', 0.4, 0.75, { stageRelevance: [1] }), sym('smoking', 0.5, 0.65, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Absence of blood supports microscopic colitis over IBD' })] },
  differential: { mimics: ['ibs_diarrhoea', 'functional_diarrhoea', 'ulcerative_colitis_diarrhoea', 'celiac_disease_diarrhoea', 'bile_acid_malabsorption'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_diarrhoea', featureIds: ['diarrhoea_nocturnal', 'weight_loss'] }, { fromDiseaseId: 'ulcerative_colitis_diarrhoea', featureIds: ['hematochezia'] }], neverCloseConditions: [] },
  complications: [{ name: 'Dehydration and electrolyte disturbance', warningFeatures: ['diarrhoea_dehydration'], riskFactors: ['severe_diarrhoea'], timeWindowHours: [720, 4320], severityTier: 'mild', description: 'Chronic watery diarrhoea can lead to recurrent dehydration.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'severe_10_plus', relationToFood: 'improves_with_fasting', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'], mechanism: 'mixed', typicalDescription: 'Chronic watery, non-bloody diarrhoea with nocturnal symptoms and urgency. Diarrhoea may be dramatically improved by fasting. Associated with NSAID and PPI use.' },
};

export const toxic_megacolon_diarrhoea: DiseaseNode = {
  id: 'toxic_megacolon_diarrhoea', name: 'Toxic Megacolon', icdCode: 'K59.3', system: 'medical',
  organSystem: 'GI', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 10, ageMax: 80, agePeak: [20, 60], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'Life-threatening complication of severe colitis (IBD, C. difficile, ischaemia, infection) where the colon dilates to >6 cm with systemic toxicity. Inflammatory mediators paralyse colonic muscle. May present with decreased stool frequency as ileus develops, but often preceded by profuse bloody diarrhoea.', timelineStages: [{ stageId: 1, label: 'Pre-toxic megacolon', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('diarrhea', 0.6, 0.5), sym('fever', 0.9, 0.6)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Severe constant abdominal pain', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Rapid progression to perforation and peritonitis within hours.' },
  features: { symptoms: [sym('fever', 0.9, 0.6, { stageRelevance: [1] }), sym('fever_chills', 0.6, 0.9, { stageRelevance: [1] }), sym('diarrhea', 0.6, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.5, 0.95, { stageRelevance: [1] }), sym('abdominal_distension', 0.8, 0.7, { stageRelevance: [1] }), sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }), sym('syncope', 0.4, 0.9, { stageRelevance: [1] }), sym('rigidity', 0.5, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('abdominal_distension', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No distension makes toxic megacolon unlikely' })], supporting: [] },
  differential: { mimics: ['ogilvie_syndrome', 'sbo_volvulus', 'septic_ileus', 'ulcerative_colitis_diarrhoea', 'c_diff_colitis'], distinguishingFeatures: [{ fromDiseaseId: 'ogilvie_syndrome', featureIds: ['fever', 'hematochezia'] }], neverCloseConditions: [] },
  complications: [{ name: 'Colonic perforation', warningFeatures: ['rigidity', 'peritonism', 'syncope'], riskFactors: ['delayed_surgery'], timeWindowHours: [6, 24], severityTier: 'critical', description: 'Free perforation leading to faecal peritonitis and septic shock.' }],
  clinicalScores: [], redFlagFeatureIds: ['rigidity', 'syncope', 'fever_chills'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'mixed', volume: 'small', frequency: 'variable', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'dehydration'], mechanism: 'inflammatory', typicalDescription: 'Initial profuse bloody diarrhoea that may decrease as colonic dilation and ileus develop. High fever, severe abdominal pain, and distension signal impending catastrophe.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: MALABSORPTION (5 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const celiac_disease_diarrhoea: DiseaseNode = {
  id: 'celiac_disease_diarrhoea', name: 'Coeliac Disease', icdCode: 'K90.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [20, 50], sexRisk: { male: 0.7, female: 1.3 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'Immune-mediated enteropathy triggered by gluten in genetically susceptible individuals (HLA-DQ2/DQ8). Villous atrophy in the proximal small bowel leads to malabsorption of nutrients, fat, iron, folate, calcium. Classic presentation: steatorrhoea, weight loss, bloating, and anaemia.', timelineStages: [{ stageId: 1, label: 'Active coeliac disease', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('diarrhea', 0.7, 0.5), sym('steatorrhea', 0.6, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Bloating/discomfort', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic. Symptoms fluctuate with gluten exposure. Strict gluten-free diet leads to remission.' },
  features: { symptoms: [sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('steatorrhea', 0.6, 0.85, { stageRelevance: [1] }), sym('bloating', 0.7, 0.55, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.85, { stageRelevance: [1] }), sym('diarrhoea_relation_to_food', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_nocturnal', 0.2, 0.85, { stageRelevance: [1] }), sym('diarrhoea_weight_loss', 0.5, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Absence of blood supports coeliac over IBD' })] },
  differential: { mimics: ['tropical_sprue', 'whipple_disease', 'sibo_diarrhoea', 'chronic_pancreatitis_diarrhoea', 'ibs_diarrhoea', 'giardiasis'], distinguishingFeatures: [{ fromDiseaseId: 'tropical_sprue', featureIds: ['diarrhoea_relation_to_food'] }, { fromDiseaseId: 'chronic_pancreatitis_diarrhoea', featureIds: ['diarrhoea_relation_to_food'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal lymphoma', warningFeatures: ['weight_loss', 'night_sweats', 'fever'], riskFactors: ['refractory coeliac'], timeWindowHours: [43200, 86400], severityTier: 'critical', description: 'Enteropathy-associated T-cell lymphoma (EATL).' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'night_sweats'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'fatty_steatorrhea', volume: 'large', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'weight_loss'], mechanism: 'malabsorptive', typicalDescription: 'Chronic steatorrhoea with pale, bulky, foul-smelling stools that float. Worse after gluten ingestion, improves with fasting. Associated with bloating, weight loss, and anaemia.' },
};

export const tropical_sprue: DiseaseNode = {
  id: 'tropical_sprue', name: 'Tropical Sprue', icdCode: 'K90.1', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 10, ageMax: 70, agePeak: [20, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Idiopathic malabsorption syndrome affecting residents or visitors of tropical regions (Caribbean, India, Southeast Asia). Small intestinal mucosal abnormalities with villous blunting. Presents with chronic watery diarrhoea, steatorrhoea, weight loss, and megaloblastic anaemia (B12/folate deficiency).', timelineStages: [{ stageId: 1, label: 'Tropical sprue', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('diarrhea', 0.8, 0.5), sym('weight_loss', 0.7, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic; requires treatment with tetracycline and folate for resolution.' },
  features: { symptoms: [sym('diarrhea', 0.8, 0.5, { stageRelevance: [1] }), sym('steatorrhea', 0.5, 0.85, { stageRelevance: [1] }), sym('weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.7, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.5, 0.75, { stageRelevance: [1] }), sym('diarrhoea_travel_related', 0.7, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('diarrhoea_travel_related', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No tropical travel makes sprue unlikely' })], supporting: [] },
  differential: { mimics: ['celiac_disease_diarrhoea', 'giardiasis', 'whipple_disease', 'sibo_diarrhoea', 'chronic_pancreatitis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'celiac_disease_diarrhoea', featureIds: ['diarrhoea_travel_related'] }], neverCloseConditions: [] },
  complications: [{ name: 'Megaloblastic anaemia', warningFeatures: ['weight_loss', 'fatigue'], riskFactors: ['prolonged_disease'], timeWindowHours: [2160, 21600], severityTier: 'moderate', description: 'Vitamin B12 and folate deficiency from malabsorption.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'fatty_steatorrhea', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'weight_loss'], mechanism: 'malabsorptive', typicalDescription: 'Chronic diarrhoea with steatorrhoea in a tropical resident or traveller. Associated with progressive weight loss, anaemia, and nutritional deficiencies.' },
};

export const whipple_disease: DiseaseNode = {
  id: 'whipple_disease', name: 'Whipple Disease', icdCode: 'K90.81', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 70, agePeak: [40, 60], sexRisk: { male: 4, female: 1 }, backgroundPrevalence: 0.00001, riskFactors: [] },
  pathophysiology: { mechanism: 'Rare systemic infection caused by Tropheryma whipplei. Affects the small intestinal mucosa causing malabsorption, steatorrhoea, weight loss, and arthralgias. Also involves joints, CNS, heart, and eyes. PAS-positive macrophages in duodenal biopsy.', timelineStages: [{ stageId: 1, label: 'Whipple disease', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('diarrhea', 0.7, 0.5), sym('weight_loss', 0.8, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Vague abdominal discomfort', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'Chronic progressive disease. Fatal if untreated. Responds to antibiotics.' },
  features: { symptoms: [sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('steatorrhea', 0.5, 0.85, { stageRelevance: [1] }), sym('weight_loss', 0.8, 0.85, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.7, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.5, 0.75, { stageRelevance: [1] }), sym('joint_pain', 0.6, 0.8, { stageRelevance: [1] }), sym('fever', 0.4, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['celiac_disease_diarrhoea', 'tropical_sprue', 'small_bowel_lymphoma', 'sarcoidosis', 'intestinal_tuberculosis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'celiac_disease_diarrhoea', featureIds: ['joint_pain'] }], neverCloseConditions: [] },
  complications: [{ name: 'CNS Whipple disease', warningFeatures: ['weight_loss', 'fever'], riskFactors: ['delayed_treatment'], timeWindowHours: [4320, 43200], severityTier: 'severe', description: 'Progressive neurological involvement including dementia, ophthalmoplegia, myoclonus.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'fatty_steatorrhea', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'weight_loss', 'arthritis'], mechanism: 'malabsorptive', typicalDescription: 'Chronic steatorrhoea with dramatic weight loss and migratory arthralgias. A rare but important treatable cause of malabsorption.' },
};

export const chronic_pancreatitis_diarrhoea: DiseaseNode = {
  id: 'chronic_pancreatitis_diarrhoea', name: 'Chronic Pancreatitis (Steatorrhoea)', icdCode: 'K86.1', system: 'medical',
  organSystem: 'pancreatic', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 70], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Progressive pancreatic destruction from chronic inflammation (most commonly from alcohol), leading to exocrine insufficiency. When pancreatic enzyme output falls below 10% of normal, maldigestion of fats and proteins causes steatorrhoea, weight loss, and fat-soluble vitamin deficiencies.', timelineStages: [{ stageId: 1, label: 'Exocrine insufficiency', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('steatorrhea', 0.8, 0.85), sym('weight_loss', 0.7, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric pain radiating to back', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'Progressive exocrine and endocrine insufficiency over years.' },
  features: { symptoms: [sym('steatorrhea', 0.8, 0.85, { stageRelevance: [1] }), sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('alcohol_use', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('diarrhoea_improves_fasting', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Absence of blood supports pancreatic over colonic cause' })] },
  differential: { mimics: ['celiac_disease_diarrhoea', 'sibo_diarrhoea', 'cystic_fibrosis_diarrhoea', 'pancreatic_cancer'], distinguishingFeatures: [{ fromDiseaseId: 'celiac_disease_diarrhoea', featureIds: ['alcohol_use', 'pain_character'] }], neverCloseConditions: [] },
  complications: [{ name: 'Pancreatic diabetes', warningFeatures: ['weight_loss'], riskFactors: ['alcohol_use', 'calcific_pancreatitis'], timeWindowHours: [21600, 86400], severityTier: 'moderate', description: 'Type 3c diabetes from endocrine insufficiency.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'fatty_steatorrhea', volume: 'large', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'weight_loss'], mechanism: 'malabsorptive', typicalDescription: 'Chronic steatorrhoea with bulky, greasy, foul-smelling stools that float and are difficult to flush. Often accompanied by epigastric pain radiating to the back.' },
};

export const cystic_fibrosis_diarrhoea: DiseaseNode = {
  id: 'cystic_fibrosis_diarrhoea', name: 'Cystic Fibrosis (Pancreatic Insufficiency)', icdCode: 'E84.9', system: 'paediatric',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 0, ageMax: 50, agePeak: [0, 10], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0003, riskFactors: [] },
  pathophysiology: { mechanism: 'CFTR mutation causes defective chloride transport, leading to thick secretions, pancreatic duct obstruction, and progressive pancreatic destruction. Exocrine insufficiency develops in 85% of CF patients, causing steatorrhoea, malnutrition, and fat-soluble vitamin deficiency.', timelineStages: [{ stageId: 1, label: 'Pancreatic insufficiency', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('steatorrhea', 0.8, 0.85), sym('diarrhea', 0.7, 0.5)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Life-long, managed with pancreatic enzyme replacement therapy.' },
  features: { symptoms: [sym('steatorrhea', 0.8, 0.85, { stageRelevance: [1] }), sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.85, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['chronic_pancreatitis_diarrhoea', 'celiac_disease_diarrhoea', 'sibo_diarrhoea', 'short_bowel_syndrome'], distinguishingFeatures: [{ fromDiseaseId: 'chronic_pancreatitis_diarrhoea', featureIds: ['alcohol_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Failure to thrive', warningFeatures: ['weight_loss'], riskFactors: ['pancreatic_insufficiency'], timeWindowHours: [2160, 21600], severityTier: 'moderate', description: 'Chronic malnutrition and growth failure from malabsorption.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'fatty_steatorrhea', volume: 'large', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['weight_loss'], mechanism: 'malabsorptive', typicalDescription: 'Chronic steatorrhoea in a child with known cystic fibrosis. Stools are greasy, bulky, and foul-smelling despite pancreatic enzyme therapy if non-compliant.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: FUNCTIONAL (2 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const ibs_diarrhoea: DiseaseNode = {
  id: 'ibs_diarrhoea', name: 'IBS with Diarrhoea (IBS-D)', icdCode: 'K58.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 60, agePeak: [20, 45], sexRisk: { male: 0.6, female: 1.4 }, backgroundPrevalence: 0.05, riskFactors: [] },
  pathophysiology: { mechanism: 'Functional disorder of gut-brain interaction characterised by abdominal pain related to defecation and altered bowel habits. Visceral hypersensitivity, abnormal motility, and altered gut microbiota contribute. Stress and dietary triggers are common.', timelineStages: [{ stageId: 1, label: 'IBS flare', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('diarrhea', 0.8, 0.5), sym('pain_character', 0.7, 0.6)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Cramping relieved by defecation', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Chronic relapsing-remitting. No progression to organic disease.' },
  features: { symptoms: [sym('diarrhea', 0.8, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }), sym('bloating', 0.6, 0.55, { stageRelevance: [1] }), sym('stool_relief', 0.6, 0.75, { stageRelevance: [1] }), sym('alternat_bowel', 0.3, 0.8, { stageRelevance: [1] }), sym('diarrhoea_nocturnal', 0.1, 0.85, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.4, 0.6, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.7, 0.8, { stageRelevance: [1] }), sym('diarrhoea_relation_to_food', 0.5, 0.7, { stageRelevance: [1] }), sym('diarrhoea_mucus', 0.3, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('diarrhoea_nocturnal', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'No nocturnal diarrhoea strongly supports functional IBS-D over organic disease' }), sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No blood rules out IBD' })] },
  differential: { mimics: ['functional_diarrhoea', 'microscopic_colitis', 'celiac_disease_diarrhoea', 'bile_acid_malabsorption', 'lactose_intolerance_diarrhoea', 'food_allergy_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'functional_diarrhoea', featureIds: ['pain_character', 'stool_relief'] }, { fromDiseaseId: 'microscopic_colitis', featureIds: ['diarrhoea_nocturnal'] }], neverCloseConditions: [] },
  complications: [{ name: 'Reduced quality of life', warningFeatures: ['diarrhoea_frequency'], riskFactors: ['psychological_distress'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Chronic symptoms causing social and occupational impairment.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'variable', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'mucus'], mechanism: 'dysmotility', typicalDescription: 'Chronic relapsing diarrhoea with abdominal cramps that are relieved by defecation. Stools are typically small-volume and may contain mucus. Symptoms are never nocturnal — a key distinguishing feature.' },
};

export const functional_diarrhoea: DiseaseNode = {
  id: 'functional_diarrhoea', name: 'Functional Diarrhoea', icdCode: 'K59.1', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 60, agePeak: [20, 50], sexRisk: { male: 0.8, female: 1.2 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic or recurrent passage of loose (mushy) or watery stools without abdominal pain (distinguishing from IBS-D). Altered motility, accelerated colonic transit, and possibly bile acid malabsorption contribute.', timelineStages: [{ stageId: 1, label: 'Functional diarrhoea', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_duration', 0.7, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'None', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Chronic but benign. No disease progression or nutritional compromise.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.7, 0.7, { stageRelevance: [1] }), sym('diarrhoea_nocturnal', 0.1, 0.85, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.5, 0.6, { stageRelevance: [1] }), sym('bloating', 0.4, 0.55, { stageRelevance: [1] }), sym('diarrhoea_relation_to_food', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('pain_character', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'Absence of abdominal pain distinguishes functional diarrhoea from IBS-D and organic disease' })], supporting: [] },
  differential: { mimics: ['ibs_diarrhoea', 'microscopic_colitis', 'bile_acid_malabsorption', 'lactose_intolerance_diarrhoea', 'food_allergy_diarrhoea', 'sibo_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_diarrhoea', featureIds: ['pain_character'] }, { fromDiseaseId: 'microscopic_colitis', featureIds: ['diarrhoea_nocturnal'] }], neverCloseConditions: [] },
  complications: [{ name: 'Impaired quality of life', warningFeatures: ['diarrhoea_frequency'], riskFactors: [], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Chronic diarrhoea causing inconvenience and anxiety.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'variable', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['none'], mechanism: 'dysmotility', typicalDescription: 'Chronic painless passage of loose stools without nocturnal symptoms. No blood, no weight loss, no abdominal pain — the benign nature is the key feature.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: COLONIC (4 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const ischaemic_colitis_diarrhoea: DiseaseNode = {
  id: 'ischaemic_colitis_diarrhoea', name: 'Ischaemic Colitis', icdCode: 'K55.0', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 50, ageMax: 90, agePeak: [60, 80], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Acute colonic ischaemia, usually in the watershed area (splenic flexure, rectosigmoid) from low-flow states or vascular occlusion. Causes sudden cramping left lower quadrant pain, followed by bloody diarrhoea or haematochezia. Often self-limiting but can progress to gangrene.', timelineStages: [{ stageId: 1, label: 'Ischaemic colitis', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('diarrhea', 0.6, 0.5), sym('hematochezia', 0.8, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Sudden severe left-sided pain', painLocationTypical: 'Left lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'May progress to gangrene and perforation within hours if severe.' },
  features: { symptoms: [sym('hematochezia', 0.8, 0.95, { stageRelevance: [1] }), sym('diarrhea', 0.6, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }), sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] }), sym('htn_cad', 0.7, 0.65, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('abdominal_distension', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('fever', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.3, label: 'Absence of fever supports ischaemia over infection' })] },
  differential: { mimics: ['ehec_diarrhoea', 'shigellosis', 'ulcerative_colitis_diarrhoea', 'c_diff_colitis', 'diverticulitis'], distinguishingFeatures: [{ fromDiseaseId: 'ehec_diarrhoea', featureIds: ['htn_cad'] }, { fromDiseaseId: 'ulcerative_colitis_diarrhoea', featureIds: ['htn_cad', 'agePeak'] }], neverCloseConditions: [] },
  complications: [{ name: 'Colonic gangrene and perforation', warningFeatures: ['rigidity', 'abdominal_distension', 'fever'], riskFactors: ['hypotension', 'vasculopathy'], timeWindowHours: [12, 72], severityTier: 'critical', description: 'Transmural necrosis requiring surgical resection.' }],
  clinicalScores: [], redFlagFeatureIds: ['rigidity', 'fever'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'bloody', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'blood'], mechanism: 'inflammatory', typicalDescription: 'Sudden onset of left-sided abdominal pain followed by bloody diarrhoea or passage of blood. The pain is often out of proportion to the degree of diarrhoea.' },
};

export const radiation_colitis: DiseaseNode = {
  id: 'radiation_colitis', name: 'Radiation Colitis/Proctitis', icdCode: 'K52.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 75], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Ionising radiation damages colonic epithelium, causing acute or chronic inflammation. Acute phase occurs during or shortly after radiotherapy. Chronic radiation colitis develops months to years after pelvic irradiation due to progressive obliterative endarteritis and fibrosis.', timelineStages: [{ stageId: 1, label: 'Radiation colitis', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('diarrhea', 0.8, 0.5), sym('hematochezia', 0.5, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Acute: self-limiting. Chronic: progressive over years with strictures and fistulae.' },
  features: { symptoms: [sym('diarrhea', 0.8, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.5, 0.95, { stageRelevance: [1] }), sym('diarrhoea_tenesmus', 0.5, 0.8, { stageRelevance: [1] }), sym('tenesmus', 0.5, 0.8, { stageRelevance: [1] }), sym('pain_character', 0.4, 0.6, { stageRelevance: [1] }), sym('diarrhoea_mucus', 0.3, 0.85, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ulcerative_colitis_diarrhoea', 'c_diff_colitis', 'ischaemic_colitis_diarrhoea', 'cmv_colitis', 'colorectal_cancer_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'ulcerative_colitis_diarrhoea', featureIds: ['known_cancer'] }], neverCloseConditions: [] },
  complications: [{ name: 'Colonic stricture', warningFeatures: ['obstipation', 'diarrhoea_duration'], riskFactors: ['radiation_dose'], timeWindowHours: [4320, 43200], severityTier: 'moderate', description: 'Fibrotic stricture from chronic radiation damage.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'bloody', volume: 'small', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['blood', 'mucus', 'tenesmus'], mechanism: 'inflammatory', typicalDescription: 'Chronic bloody mucoid diarrhoea and tenesmus following pelvic radiation. Symptoms may begin months to years after treatment.' },
};

export const cmv_colitis: DiseaseNode = {
  id: 'cmv_colitis', name: 'CMV Colitis', icdCode: 'B25.8', system: 'infectious',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [30, 60], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Cytomegalovirus reactivation causes colitis in immunocompromised patients (HIV, transplant recipients, IBD patients on immunosuppressants). Presents with watery or bloody diarrhoea, abdominal pain, fever, and weight loss. Colonic ulcers can lead to perforation.', timelineStages: [{ stageId: 1, label: 'CMV colitis', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('diarrhea', 0.8, 0.5), sym('fever', 0.7, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping lower abdominal pain', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Without treatment, progressive colitis with risk of perforation.' },
  features: { symptoms: [sym('diarrhea', 0.8, 0.5, { stageRelevance: [1] }), sym('fever', 0.7, 0.6, { stageRelevance: [1] }), sym('hematochezia', 0.4, 0.95, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.85, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.5, 0.75, { stageRelevance: [1] }), sym('hiv_status', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('hiv_status', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'Immunocompetent patient makes CMV colitis less likely' })], supporting: [] },
  differential: { mimics: ['c_diff_colitis', 'ulcerative_colitis_diarrhoea', 'hiv_cmv_colitis', 'shigellosis', 'ischaemic_colitis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'c_diff_colitis', featureIds: ['diarrhoea_antibiotics_related'] }], neverCloseConditions: [] },
  complications: [{ name: 'Colonic perforation', warningFeatures: ['rigidity', 'abdominal_distension', 'fever'], riskFactors: ['immunocompromised'], timeWindowHours: [72, 336], severityTier: 'critical', description: 'Deep colonic ulcers can perforate requiring emergency surgery.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'weight_loss'],
  diarrhoeaManifestation: { duration: 'persistent', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'weight_loss'], mechanism: 'inflammatory', typicalDescription: 'Watery or bloody diarrhoea in an immunocompromised patient with fever and lower abdominal pain. May be indistinguishable from C. diff or IBD without endoscopic biopsy.' },
};

export const colorectal_cancer_diarrhoea: DiseaseNode = {
  id: 'colorectal_cancer_diarrhoea', name: 'Colorectal Carcinoma (Diarrhoea Presentation)', icdCode: 'C18.9', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 40, ageMax: 90, agePeak: [60, 80], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.004, riskFactors: [] },
  pathophysiology: { mechanism: 'Colon adenocarcinoma can present with altered bowel habit including diarrhoea, especially with right-sided or transverse colon tumours where liquid stool passes through. Left-sided lesions more typically cause constipation and obstruction. Diarrhoea may be mixed with blood and mucus.', timelineStages: [{ stageId: 1, label: 'Colorectal cancer', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('bowel_habits', 0.65, 0.6), sym('hematochezia', 0.5, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Slowly progressive over months to years.' },
  features: { symptoms: [sym('bowel_habits', 0.65, 0.6, { stageRelevance: [1] }), sym('diarrhea', 0.4, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.5, 0.95, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.85, { stageRelevance: [1] }), sym('anorexia', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.4, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.5, 0.75, { stageRelevance: [1] }), sym('family_history_gi_cancer', 0.2, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('fever', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.3, label: 'Absence of fever favours malignancy over acute infection' })] },
  differential: { mimics: ['ulcerative_colitis_diarrhoea', 'diverticular_stricture', 'ibs_diarrhoea', 'ischaemic_colitis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_diarrhoea', featureIds: ['weight_loss', 'hematochezia', 'diarrhoea_nocturnal'] }, { fromDiseaseId: 'ulcerative_colitis_diarrhoea', featureIds: ['agePeak', 'family_history_gi_cancer'] }], neverCloseConditions: [] },
  complications: [{ name: 'Bowel obstruction', warningFeatures: ['obstipation', 'abdominal_distension'], riskFactors: ['advanced_tumour'], timeWindowHours: [4320, 43200], severityTier: 'severe', description: 'Progressive luminal narrowing leading to obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia', 'weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'mixed', volume: 'small', frequency: 'variable', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'blood', 'weight_loss'], mechanism: 'mixed', typicalDescription: 'Chronic change in bowel habit with alternating diarrhoea and constipation. Stools may contain blood. Weight loss and anaemia are associated red flags.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: SMALL BOWEL (3 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const small_bowel_lymphoma: DiseaseNode = {
  id: 'small_bowel_lymphoma', name: 'Small Bowel Lymphoma', icdCode: 'C17.2', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 30, ageMax: 80, agePeak: [50, 70], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'Primary small bowel lymphoma (often B-cell NHL, or enteropathy-associated T-cell lymphoma in coeliac disease) presents with abdominal pain, diarrhoea from malabsorption, weight loss, and sometimes obstruction. Can be mistaken for Crohn disease.', timelineStages: [{ stageId: 1, label: 'Small bowel lymphoma', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('diarrhea', 0.5, 0.5), sym('weight_loss', 0.7, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Colicky intermittent pain', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Progressive disease without treatment.' },
  features: { symptoms: [sym('diarrhea', 0.5, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('night_sweats', 0.5, 0.9, { stageRelevance: [1] }), sym('fever', 0.4, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.3, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.3, label: 'Absence of blood helps distinguish from colonic causes' })] },
  differential: { mimics: ['crohns_diarrhoea', 'intestinal_tuberculosis_diarrhoea', 'celiac_disease_diarrhoea', 'sibo_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'crohns_diarrhoea', featureIds: ['night_sweats'] }], neverCloseConditions: [] },
  complications: [{ name: 'Bowel perforation', warningFeatures: ['rigidity', 'pain_character', 'fever'], riskFactors: ['chemotherapy'], timeWindowHours: [720, 4320], severityTier: 'critical', description: 'Tumour necrosis or transmural invasion leading to perforation.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'night_sweats'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'mild_3_5', relationToFood: 'worse_after_eating', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'weight_loss'], mechanism: 'malabsorptive', typicalDescription: 'Chronic watery diarrhoea with weight loss, night sweats, and colicky abdominal pain. B symptoms suggest underlying lymphoma.' },
};

export const sibo_diarrhoea: DiseaseNode = {
  id: 'sibo_diarrhoea', name: 'Small Intestinal Bacterial Overgrowth (SIBO)', icdCode: 'K90.4', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 70], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Excessive bacteria in the small intestine ferment carbohydrates producing gas, bloating, and diarrhoea. Bacteria deconjugate bile salts causing fat malabsorption and steatorrhoea. Predisposed by hypochlorhydria, impaired motility, anatomical abnormalities (blind loops, strictures).', timelineStages: [{ stageId: 1, label: 'SIBO', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.7, 0.5), sym('bloating', 0.8, 0.55)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Bloating/distension', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Chronic, relapsing. Fluctuates with diet and prokinetic therapy.' },
  features: { symptoms: [sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('bloating', 0.8, 0.55, { stageRelevance: [1] }), sym('steatorrhea', 0.4, 0.85, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.85, { stageRelevance: [1] }), sym('abdominal_distension', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_improves_fasting', 0.5, 0.8, { stageRelevance: [1] }), sym('diarrhoea_relation_to_food', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ibs_diarrhoea', 'celiac_disease_diarrhoea', 'giardiasis', 'chronic_pancreatitis_diarrhoea', 'functional_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_diarrhoea', featureIds: ['steatorrhea', 'weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Nutritional deficiencies', warningFeatures: ['weight_loss', 'steatorrhea'], riskFactors: ['chronic_sibo'], timeWindowHours: [4320, 43200], severityTier: 'moderate', description: 'Vitamin B12, fat-soluble vitamin, and iron deficiencies.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'weight_loss'], mechanism: 'mixed', typicalDescription: 'Chronic diarrhoea with bloating and abdominal distension that worsens after eating. Stools may be watery or semiformed with some steatorrhoea. Improves with fasting.' },
};

export const radiation_enteritis: DiseaseNode = {
  id: 'radiation_enteritis', name: 'Radiation Enteritis', icdCode: 'K52.0', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 75], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Acute or chronic damage to the small intestine from ionising radiation (typically for pelvic, abdominal, or retroperitoneal malignancies). Acute phase: mucosal injury causing diarrhoea and malabsorption. Chronic phase: progressive fibrosis leading to obstruction, fistulae, and persistent diarrhoea.', timelineStages: [{ stageId: 1, label: 'Radiation enteritis', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('diarrhea', 0.8, 0.5), sym('pain_character', 0.5, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Acute: resolves over weeks. Chronic: progressive over years.' },
  features: { symptoms: [sym('diarrhea', 0.8, 0.5, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.3, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.85, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.4, 0.75, { stageRelevance: [1] }), sym('steatorrhea', 0.3, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['crohns_diarrhoea', 'sibo_diarrhoea', 'celiac_disease_diarrhoea', 'small_bowel_lymphoma'], distinguishingFeatures: [{ fromDiseaseId: 'crohns_diarrhoea', featureIds: ['known_cancer'] }], neverCloseConditions: [] },
  complications: [{ name: 'Small bowel obstruction', warningFeatures: ['obstipation', 'abdominal_distension'], riskFactors: ['radiation_dose'], timeWindowHours: [4320, 43200], severityTier: 'severe', description: 'Fibrotic stricture causing obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'weight_loss'], mechanism: 'malabsorptive', typicalDescription: 'Chronic diarrhoea after radiation therapy with malabsorption, weight loss, and cramping. Can be a debilitating late effect of cancer treatment.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: GASTRIC (2 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const dumping_syndrome: DiseaseNode = {
  id: 'dumping_syndrome', name: 'Dumping Syndrome (Post-Gastrectomy)', icdCode: 'K91.1', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [30, 60], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Rapid gastric emptying after gastrectomy or gastric bypass surgery causes a hyperosmolar load in the small intestine, drawing fluid into the lumen (early dumping: 15–30 min post-meal). Late dumping (1–3 hours) is due to reactive hypoglycaemia from excessive insulin release.', timelineStages: [{ stageId: 1, label: 'Dumping', typicalHoursFromOnset: [0, 3], dominantSymptoms: [sym('diarrhea', 0.7, 0.5), sym('pain_character', 0.4, 0.6)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Cramping', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'Many patients improve with dietary measures over time.' },
  features: { symptoms: [sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('nausea', 0.6, 0.5, { stageRelevance: [1] }), sym('syncope', 0.3, 0.9, { stageRelevance: [1] }), sym('pain_character', 0.4, 0.6, { stageRelevance: [1] }), sym('diarrhoea_relation_to_food', 0.7, 0.7, { stageRelevance: [1] }), sym('prior_abdominal_surgery', 0.8, 0.7, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('prior_abdominal_surgery', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No prior gastric surgery makes dumping syndrome very unlikely' })], supporting: [] },
  differential: { mimics: ['zollinger_ellison', 'functional_diarrhoea', 'ibs_diarrhoea', 'dumping_syndrome'], distinguishingFeatures: [{ fromDiseaseId: 'zollinger_ellison', featureIds: ['prior_abdominal_surgery'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe hypoglycaemia', warningFeatures: ['syncope'], riskFactors: ['late_dumping'], timeWindowHours: [1, 3], severityTier: 'moderate', description: 'Reactive hypoglycaemia causing dizziness, sweating, and syncope.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'mild_3_5', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'palpitations'], mechanism: 'osmotic', typicalDescription: 'Watery diarrhoea immediately after meals (15–30 minutes) with cramping, sweating, and palpitations. Late phase causes hypoglycaemic symptoms. Occurs after gastric surgery.' },
};

export const zollinger_ellison: DiseaseNode = {
  id: 'zollinger_ellison', name: 'Zollinger-Ellison Syndrome (Gastrinoma)', icdCode: 'E16.4', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 70, agePeak: [30, 50], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'Gastrin-secreting tumour (gastrinoma) usually in the duodenum or pancreas (part of MEN1 syndrome). Massive gastric acid hypersecretion overwhelms pancreatic bicarbonate, causing peptic ulcers and diarrhoea. High acid inactivates pancreatic lipase causing steatorrhoea.', timelineStages: [{ stageId: 1, label: 'Zollinger-Ellison', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('diarrhea', 0.6, 0.5), sym('pain_character', 0.7, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric burning', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'Chronic progressive disease without surgical resection of gastrinoma.' },
  features: { symptoms: [sym('diarrhea', 0.6, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }), sym('heartburn', 0.6, 0.7, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.85, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.5, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.4, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['peptic_ulcer_disease', 'chronic_pancreatitis_diarrhoea', 'celiac_disease_diarrhoea', 'ibs_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'peptic_ulcer_disease', featureIds: ['diarrhea'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe peptic ulcer disease', warningFeatures: ['hematemesis', 'melena', 'pain_character'], riskFactors: ['gastrinoma'], timeWindowHours: [720, 4320], severityTier: 'severe', description: 'Refractory ulcers causing bleeding, perforation, or obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematemesis', 'melena'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'weight_loss'], mechanism: 'mixed', typicalDescription: 'Chronic watery diarrhoea with epigastric burning, heartburn, and weight loss. Diarrhoea is due to acid-induced inactivation of pancreatic enzymes and direct mucosal injury.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: ENDOCRINE (5 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const hyperthyroid_diarrhoea: DiseaseNode = {
  id: 'hyperthyroid_diarrhoea', name: 'Hyperthyroidism Causing Diarrhoea', icdCode: 'E05.9', system: 'endocrine',
  organSystem: 'endocrine', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 70, agePeak: [20, 50], sexRisk: { male: 0.3, female: 1.7 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Excess thyroid hormone increases gastrointestinal motility, leading to frequent loose stools. Also causes increased appetite (polyphagia) with weight loss, tachycardia, heat intolerance, and tremor. Diarrhoea resolves with treatment of hyperthyroidism.', timelineStages: [{ stageId: 1, label: 'Hyperthyroidism', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('diarrhea', 0.4, 0.5), sym('weight_loss', 0.7, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'None', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Chronic; reversible with antithyroid treatment.' },
  features: { symptoms: [sym('diarrhea', 0.4, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.4, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ibs_diarrhoea', 'functional_diarrhoea', 'diabetic_diarrhoea', 'carcinoid_syndrome_diarrhoea', 'vipoma'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_diarrhoea', featureIds: ['pain_character'] }], neverCloseConditions: [] },
  complications: [{ name: 'Thyroid storm', warningFeatures: ['fever', 'syncope'], riskFactors: ['untreated_hyperthyroidism'], timeWindowHours: [72, 336], severityTier: 'critical', description: 'Life-threatening exacerbation of hyperthyroidism.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'syncope'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['weight_loss'], mechanism: 'dysmotility', typicalDescription: 'Chronic, mildly increased stool frequency without abdominal pain, blood, or mucus. Weight loss despite increased appetite is the key associated feature.' },
};

export const addison_disease_diarrhoea: DiseaseNode = {
  id: 'addison_disease_diarrhoea', name: 'Addison Disease with Diarrhoea', icdCode: 'E27.4', system: 'endocrine',
  organSystem: 'endocrine', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 10, ageMax: 70, agePeak: [20, 50], sexRisk: { male: 0.8, female: 1.2 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'Primary adrenal insufficiency causes deficient cortisol and aldosterone. GI symptoms include chronic diarrhoea, nausea, abdominal pain, and weight loss. Hyperpigmentation, fatigue, and salt craving are characteristic. Can present acutely as addisonian crisis with vomiting and hypotension.', timelineStages: [{ stageId: 1, label: 'Addison disease', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('diarrhea', 0.3, 0.5), sym('weight_loss', 0.5, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Vague abdominal pain', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Progressive without glucocorticoid replacement therapy.' },
  features: { symptoms: [sym('diarrhea', 0.3, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.85, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.3, 0.5, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ibs_diarrhoea', 'celiac_disease_diarrhoea', 'chronic_pancreatitis_diarrhoea', 'functional_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_diarrhoea', featureIds: ['weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Addisonian crisis', warningFeatures: ['syncope', 'vomiting'], riskFactors: ['infection', 'stress', 'surgery'], timeWindowHours: [24, 168], severityTier: 'critical', description: 'Acute adrenal insufficiency causing hypotension, shock, and death.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'weight_loss'], mechanism: 'mixed', typicalDescription: 'Chronic mild diarrhoea with vague abdominal pain, fatigue, weight loss, and hyperpigmentation. The diarrhoea is often overshadowed by other systemic features.' },
};

export const diabetic_diarrhoea: DiseaseNode = {
  id: 'diabetic_diarrhoea', name: 'Diabetic Autonomic Neuropathy with Diarrhoea', icdCode: 'E10.44', system: 'endocrine',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 70], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic diabetes causes autonomic neuropathy affecting gastrointestinal motility. Manifestations include diarrhoea (often nocturnal), gastroparesis, and constipation. Abnormal bacterial overgrowth and bile acid malabsorption may contribute. More common in type 1 diabetes with poor glycaemic control.', timelineStages: [{ stageId: 1, label: 'Diabetic diarrhoea', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('diarrhea', 0.6, 0.5), sym('diarrhoea_nocturnal', 0.6, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic and fluctuating. May alternate with constipation.' },
  features: { symptoms: [sym('diarrhea', 0.6, 0.5, { stageRelevance: [1] }), sym('diarrhoea_nocturnal', 0.6, 0.85, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diabetes', 0.9, 0.8, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.4, 0.6, { stageRelevance: [1] }), sym('weight_loss', 0.3, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('diabetes', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No diabetes makes diabetic diarrhoea very unlikely' })], supporting: [] },
  differential: { mimics: ['ibs_diarrhoea', 'functional_diarrhoea', 'sibo_diarrhoea', 'bile_acid_malabsorption'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_diarrhoea', featureIds: ['diarrhoea_nocturnal', 'diabetes'] }], neverCloseConditions: [] },
  complications: [{ name: 'Diabetic ketoacidosis', warningFeatures: ['vomiting', 'syncope'], riskFactors: ['dehydration_from_diarrhoea'], timeWindowHours: [48, 168], severityTier: 'critical', description: 'Profound metabolic acidosis from volume depletion.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'variable', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['dehydration'], mechanism: 'dysmotility', typicalDescription: 'Chronic watery diarrhoea, often nocturnal, in a patient with poorly controlled diabetes. May alternate with constipation and gastroparesis.' },
};

export const vipoma: DiseaseNode = {
  id: 'vipoma', name: 'VIPoma (WDHA Syndrome)', icdCode: 'E34.8', system: 'endocrine',
  organSystem: 'pancreatic', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 70, agePeak: [40, 60], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.00001, riskFactors: [] },
  pathophysiology: { mechanism: 'Pancreatic neuroendocrine tumour secreting vasoactive intestinal peptide (VIP). Causes WDHA syndrome: Watery Diarrhoea, Hypokalaemia, Achlorhydria. VIP stimulates intestinal chloride and water secretion while inhibiting gastric acid production. Massive volumes of watery diarrhoea (up to 3–5 L/day).', timelineStages: [{ stageId: 1, label: 'VIPoma', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('diarrhea', 0.95, 0.5), sym('diarrhoea_volume', 0.9, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Progressive. Metastatic at diagnosis in 50–70%.' },
  features: { symptoms: [sym('diarrhea', 0.95, 0.5, { stageRelevance: [1] }), sym('diarrhoea_volume', 0.9, 0.7, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.8, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.6, 0.75, { stageRelevance: [1] }), sym('diarrhoea_dehydration', 0.7, 0.75, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.85, { stageRelevance: [1] }), sym('diarrhoea_flushing', 0.3, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['cholera', 'carcinoid_syndrome_diarrhoea', 'etec_diarrhoea', 'medullary_thyroid_cancer'], distinguishingFeatures: [{ fromDiseaseId: 'cholera', featureIds: ['diarrhoea_duration', 'diarrhoea_flushing'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe hypokalaemia', warningFeatures: ['diarrhoea_dehydration', 'syncope'], riskFactors: ['massive_diarrhoea'], timeWindowHours: [48, 168], severityTier: 'critical', description: 'Life-threatening potassium depletion causing cardiac arrhythmia and muscle weakness.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration', 'syncope'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'massive', frequency: 'continuous', relationToFood: 'persists_despite_fasting', nocturnal: 'yes', associatedSymptoms: ['dehydration', 'flushing'], mechanism: 'secretory', typicalDescription: 'Massive secretory diarrhoea persisting despite fasting. Stool volume can exceed 3 L/day. Associated with hypokalaemia and flushing. The diarrhoea does not stop when the patient stops eating.' },
};

export const carcinoid_syndrome_diarrhoea: DiseaseNode = {
  id: 'carcinoid_syndrome_diarrhoea', name: 'Carcinoid Syndrome with Diarrhoea', icdCode: 'E34.0', system: 'endocrine',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 30, ageMax: 80, agePeak: [50, 70], sexRisk: { male: 1, female: 1.1 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'Carcinoid tumours (usually midgut with liver metastases) secrete serotonin, bradykinin, and other vasoactive substances causing flushing, secretory diarrhoea, wheezing, and right-sided heart disease. Serotonin stimulates intestinal secretion and motility. Symptoms are episodic.', timelineStages: [{ stageId: 1, label: 'Carcinoid syndrome', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('diarrhea', 0.7, 0.5), sym('diarrhoea_flushing', 0.8, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Usually indolent; tumour growth is slow but metastatic disease is progressive.' },
  features: { symptoms: [sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('diarrhoea_flushing', 0.8, 0.9, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.4, 0.75, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.85, { stageRelevance: [1] }), sym('dyspnea', 0.3, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('diarrhoea_flushing', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No flushing makes carcinoid syndrome unlikely' })], supporting: [] },
  differential: { mimics: ['vipoma', 'hyperthyroid_diarrhoea', 'ibs_diarrhoea', 'medullary_thyroid_cancer', 'mastocytosis'], distinguishingFeatures: [{ fromDiseaseId: 'vipoma', featureIds: ['diarrhoea_volume'] }], neverCloseConditions: [] },
  complications: [{ name: 'Carcinoid heart disease', warningFeatures: ['dyspnea', 'leg_swelling'], riskFactors: ['metastatic_disease'], timeWindowHours: [4320, 43200], severityTier: 'severe', description: 'Right-sided valvular fibrosis leading to heart failure.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_flushing', 'dyspnea'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'variable', relationToFood: 'worse_after_eating', nocturnal: 'yes', associatedSymptoms: ['flushing', 'palpitations', 'abdominal_pain'], mechanism: 'secretory', typicalDescription: 'Episodic watery diarrhoea triggered by alcohol or food, associated with facial flushing and palpitations. The flushing-diarrhoea combination is pathognomonic.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: METABOLIC (2 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const uraemic_diarrhoea: DiseaseNode = {
  id: 'uraemic_diarrhoea', name: 'Uraemic Enteritis', icdCode: 'N18.9', system: 'metabolic',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 75], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Uraemic toxins from chronic kidney disease cause inflammation and ulceration of the gastrointestinal mucosa. Presents with diarrhoea, often bloody, with nausea and anorexia. An important sign of advanced uraemia before or during dialysis.', timelineStages: [{ stageId: 1, label: 'Uraemic enteritis', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('diarrhea', 0.5, 0.5), sym('nausea', 0.6, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Vague abdominal discomfort', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Resolves with dialysis. Persistent if inadequate dialysis.' },
  features: { symptoms: [sym('diarrhea', 0.5, 0.5, { stageRelevance: [1] }), sym('nausea', 0.6, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.5, { stageRelevance: [1] }), sym('anorexia', 0.6, 0.5, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['aad_generic', 'c_diff_colitis', 'ischaemic_colitis_diarrhoea', 'viral_gastroenteritis_generic'], distinguishingFeatures: [{ fromDiseaseId: 'aad_generic', featureIds: ['prior_abdominal_surgery'] }], neverCloseConditions: [] },
  complications: [{ name: 'Gastrointestinal bleeding', warningFeatures: ['hematemesis', 'melena'], riskFactors: ['uraemia'], timeWindowHours: [168, 2160], severityTier: 'severe', description: 'Uraemic platelet dysfunction exacerbates GI bleeding.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia', 'melena'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain'], mechanism: 'mixed', typicalDescription: 'Mild chronic diarrhoea with nausea and anorexia in a patient with advanced renal disease. May be bloody from uraemic colitis.' },
};

export const amyloidosis_diarrhoea: DiseaseNode = {
  id: 'amyloidosis_diarrhoea', name: 'Amyloidosis with Diarrhoea', icdCode: 'E85.4', system: 'metabolic',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 40, ageMax: 85, agePeak: [55, 75], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'AL (primary) or AA (secondary) amyloid deposition in the gastrointestinal tract disrupts motility and absorption. Can cause diarrhoea, malabsorption, protein-losing enteropathy, constipation, and pseudo-obstruction. Also causes macroglossia, neuropathy, and cardiomyopathy.', timelineStages: [{ stageId: 1, label: 'GI amyloidosis', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('diarrhea', 0.4, 0.5), sym('weight_loss', 0.6, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Vague abdominal discomfort', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Progressive without treatment of underlying amyloidosis.' },
  features: { symptoms: [sym('diarrhea', 0.4, 0.5, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.85, { stageRelevance: [1] }), sym('leg_swelling', 0.5, 0.75, { stageRelevance: [1] }), sym('dyspnea', 0.3, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ibs_diarrhoea', 'celiac_disease_diarrhoea', 'sibo_diarrhoea', 'chronic_pancreatitis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'celiac_disease_diarrhoea', featureIds: ['leg_swelling'] }], neverCloseConditions: [] },
  complications: [{ name: 'Cardiac amyloidosis', warningFeatures: ['dyspnea', 'syncope', 'leg_swelling'], riskFactors: ['AL_amyloidosis'], timeWindowHours: [4320, 43200], severityTier: 'critical', description: 'Restrictive cardiomyopathy leading to heart failure.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'dyspnea'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['weight_loss'], mechanism: 'dysmotility', typicalDescription: 'Chronic diarrhoea with weight loss, autonomic dysfunction, and protein-losing enteropathy. Often accompanied by signs of multisystem disease including macroglossia and neuropathy.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13: DRUG-INDUCED (1 node)
// ═══════════════════════════════════════════════════════════════════════════════

export const drug_induced_diarrhoea: DiseaseNode = {
  id: 'drug_induced_diarrhoea', name: 'Drug-Induced Diarrhoea (General)', icdCode: 'K52.2', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [30, 70], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'Many medications cause diarrhoea through various mechanisms: osmotic (metformin, colchicine, lactulose, antacids), secretory (misoprostol, chemotherapeutic agents), altered motility (prokinetics, macrolide antibiotics), or mucosal damage (NSAIDs, methotrexate, mycophenolate).', timelineStages: [{ stageId: 1, label: 'Drug diarrhoea', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_duration', 0.5, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Resolves upon discontinuation of the offending drug.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.5, 0.7, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.4, 0.75, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.4, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.3, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['aad_generic', 'c_diff_colitis', 'microscopic_colitis', 'ibs_diarrhoea', 'functional_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'c_diff_colitis', featureIds: ['diarrhoea_fever', 'diarrhoea_mucus'] }], neverCloseConditions: [] },
  complications: [{ name: 'Dehydration and electrolyte imbalance', warningFeatures: ['diarrhoea_dehydration'], riskFactors: ['elderly'], timeWindowHours: [168, 720], severityTier: 'mild', description: 'Chronic drug-induced diarrhoea can lead to volume depletion.' }],
  clinicalScores: [], redFlagFeatureIds: ['diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain'], mechanism: 'osmotic', typicalDescription: 'Chronic mild diarrhoea temporally related to medication use (metformin, colchicine, PPIs, NSAIDs, etc.). Typically non-bloody and without nocturnal symptoms.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 14: HIV-RELATED (3 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const hiv_enteropathy: DiseaseNode = {
  id: 'hiv_enteropathy', name: 'HIV Enteropathy', icdCode: 'B23.8', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 60, agePeak: [25, 45], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic diarrhoea in HIV patients without identifiable enteric pathogen. HIV infects intestinal CD4+ cells and macrophages causing villous atrophy and increased intestinal permeability. Altered gut microbiome and immune dysregulation contribute. Improves with ART.', timelineStages: [{ stageId: 1, label: 'HIV enteropathy', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('diarrhea', 0.7, 0.5), sym('weight_loss', 0.6, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic. Improves with antiretroviral therapy (ART).' },
  features: { symptoms: [sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.85, { stageRelevance: [1] }), sym('diarrhoea_stool_type', 0.4, 0.75, { stageRelevance: [1] }), sym('hiv_status', 0.9, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('hiv_status', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'HIV-negative patient makes HIV enteropathy impossible' })], supporting: [] },
  differential: { mimics: ['hiv_cryptosporidium', 'hiv_cmv_colitis', 'giardiasis', 'whipple_disease', 'ibs_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'hiv_cryptosporidium', featureIds: ['diarrhoea_volume', 'diarrhoea_dehydration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe wasting', warningFeatures: ['weight_loss', 'diarrhoea_duration'], riskFactors: ['low_cd4'], timeWindowHours: [720, 4320], severityTier: 'severe', description: 'Profound weight loss and malnutrition from chronic diarrhoea.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'], mechanism: 'mixed', typicalDescription: 'Chronic watery diarrhoea in an HIV-positive patient without identifiable pathogen. Wasting and weight loss are prominent. Improves with antiretroviral therapy.' },
};

export const hiv_cryptosporidium: DiseaseNode = {
  id: 'hiv_cryptosporidium', name: 'HIV-Associated Cryptosporidiosis', icdCode: 'B20', system: 'infectious',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 60, agePeak: [25, 45], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Cryptosporidium infection in HIV patients with low CD4 (<100) causes severe, chronic, life-threatening diarrhoea. Unlike immunocompetent hosts where it is self-limiting, in AIDS patients it causes profuse watery diarrhoea leading to severe wasting, dehydration, and death.', timelineStages: [{ stageId: 1, label: 'HIV cryptosporidiosis', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_volume', 0.8, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Chronic progressive without immune restoration (ART).' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('diarrhoea_volume', 0.8, 0.7, { stageRelevance: [1] }), sym('diarrhoea_frequency', 0.7, 0.6, { stageRelevance: [1] }), sym('weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('diarrhoea_dehydration', 0.7, 0.75, { stageRelevance: [1] }), sym('hiv_status', 0.95, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('hiv_status', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No HIV makes this diagnosis unlikely' })], supporting: [] },
  differential: { mimics: ['hiv_enteropathy', 'hiv_cmv_colitis', 'cryptosporidiosis', 'giardiasis', 'microsporidiosis'], distinguishingFeatures: [{ fromDiseaseId: 'hiv_enteropathy', featureIds: ['diarrhoea_volume', 'diarrhoea_dehydration'] }], neverCloseConditions: [] },
  complications: [{ name: 'AIDS wasting syndrome', warningFeatures: ['weight_loss', 'diarrhoea_dehydration'], riskFactors: ['cd4 < 100'], timeWindowHours: [336, 2160], severityTier: 'critical', description: 'Profound wasting and electrolyte depletion requiring parenteral nutrition.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'massive', frequency: 'severe_10_plus', relationToFood: 'persists_despite_fasting', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'], mechanism: 'secretory', typicalDescription: 'Profuse, chronic watery diarrhoea in a profoundly immunocompromised HIV patient. Massive volumes cause severe dehydration and wasting. Does not improve with fasting.' },
};

export const hiv_cmv_colitis: DiseaseNode = {
  id: 'hiv_cmv_colitis', name: 'HIV-Associated CMV Colitis', icdCode: 'B20', system: 'infectious',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 60, agePeak: [25, 45], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.0003, riskFactors: [] },
  pathophysiology: { mechanism: 'CMV reactivation in HIV patients with severely depressed CD4 counts (<50) causes colitis with deep mucosal ulcers. Presents with watery or bloody diarrhoea, severe abdominal pain, fever, and weight loss. Risk of perforation is high.', timelineStages: [{ stageId: 1, label: 'CMV colitis', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('diarrhea', 0.8, 0.5), sym('fever', 0.7, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe lower abdominal pain', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Progressive without antiviral therapy. Risk of perforation.' },
  features: { symptoms: [sym('diarrhea', 0.8, 0.5, { stageRelevance: [1] }), sym('fever', 0.7, 0.6, { stageRelevance: [1] }), sym('hematochezia', 0.5, 0.95, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.85, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('hiv_status', 0.95, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('hiv_status', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No HIV makes CMV colitis unlikely' })], supporting: [] },
  differential: { mimics: ['cmv_colitis', 'hiv_enteropathy', 'hiv_cryptosporidium', 'c_diff_colitis', 'shigellosis'], distinguishingFeatures: [{ fromDiseaseId: 'cmv_colitis', featureIds: ['hiv_status'] }, { fromDiseaseId: 'hiv_enteropathy', featureIds: ['fever', 'hematochezia'] }], neverCloseConditions: [] },
  complications: [{ name: 'Colonic perforation', warningFeatures: ['rigidity', 'abdominal_distension', 'fever'], riskFactors: ['low_cd4'], timeWindowHours: [72, 336], severityTier: 'critical', description: 'Deep ulceration leads to free perforation requiring emergency colectomy.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'hematochezia', 'weight_loss'],
  diarrhoeaManifestation: { duration: 'persistent', stoolType: 'bloody', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'weight_loss'], mechanism: 'inflammatory', typicalDescription: 'Bloody diarrhoea with high fever and severe abdominal pain in an AIDS patient with CD4 <50. Deep colonic ulcers carry high perforation risk.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 15: PAEDIATRIC (5 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const nec_diarrhoea: DiseaseNode = {
  id: 'nec_diarrhoea', name: 'Necrotising Enterocolitis (NEC)', icdCode: 'P77', system: 'paediatric',
  organSystem: 'GI', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 0, ageMax: 1, agePeak: [0, 0.08], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'NEC is a neonatal emergency, primarily affecting preterm infants. Ischaemia, inflammation, and bacterial invasion of the intestinal wall lead to necrosis, pneumatosis intestinalis, and perforation. Presents with bloody stools, abdominal distension, feed intolerance, and systemic instability.', timelineStages: [{ stageId: 1, label: 'NEC', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('hematochezia', 0.6, 0.95), sym('abdominal_distension', 0.8, 0.7)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Irritability (neonate)', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Rapid progression to perforation and peritonitis within hours.' },
  features: { symptoms: [sym('hematochezia', 0.6, 0.95, { stageRelevance: [1] }), sym('diarrhea', 0.3, 0.5, { stageRelevance: [1] }), sym('abdominal_distension', 0.8, 0.7, { stageRelevance: [1] }), sym('fever', 0.4, 0.6, { stageRelevance: [1] }), sym('vomiting', 0.3, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hirschsprung_enterocolitis', 'malrotation_with_volvulus', 'sepsis_neonatal'], distinguishingFeatures: [{ fromDiseaseId: 'hirschsprung_enterocolitis', featureIds: ['constipation'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal perforation', warningFeatures: ['rigidity', 'abdominal_distension', 'fever'], riskFactors: ['prematurity'], timeWindowHours: [12, 48], severityTier: 'critical', description: 'Bowel necrosis leading to pneumoperitoneum requiring surgical resection.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia', 'abdominal_distension'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'bloody', volume: 'small', frequency: 'mild_3_5', relationToFood: 'worse_after_eating', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'blood'], mechanism: 'inflammatory', typicalDescription: 'Bloody stools in a preterm neonate with abdominal distension, feed intolerance, and systemic signs. A surgical emergency.' },
};

export const hirschsprung_enterocolitis: DiseaseNode = {
  id: 'hirschsprung_enterocolitis', name: 'Hirschsprung-Associated Enterocolitis', icdCode: 'Q43.1', system: 'paediatric',
  organSystem: 'GI', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 0, ageMax: 10, agePeak: [0, 1], sexRisk: { male: 4, female: 1 }, backgroundPrevalence: 0.0002, riskFactors: [] },
  pathophysiology: { mechanism: 'Life-threatening complication of Hirschsprung disease. Stasis proximal to the aganglionic segment allows bacterial overgrowth, translocation, and sepsis. Presents with explosive bloody diarrhoea, abdominal distension, fever, and shock. High mortality without prompt treatment.', timelineStages: [{ stageId: 1, label: 'Enterocolitis', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('diarrhea', 0.8, 0.5), sym('fever', 0.8, 0.6)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Crying/irritability', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Rapid progression to septic shock within hours.' },
  features: { symptoms: [sym('diarrhea', 0.8, 0.5, { stageRelevance: [1] }), sym('fever', 0.8, 0.6, { stageRelevance: [1] }), sym('abdominal_distension', 0.7, 0.7, { stageRelevance: [1] }), sym('hematochezia', 0.4, 0.95, { stageRelevance: [1] }), sym('vomiting', 0.5, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['nec_diarrhoea', 'intussusception', 'sepsis_neonatal', 'malrotation_with_volvulus'], distinguishingFeatures: [{ fromDiseaseId: 'nec_diarrhoea', featureIds: ['prematurity'] }], neverCloseConditions: [] },
  complications: [{ name: 'Septic shock', warningFeatures: ['fever_chills', 'syncope'], riskFactors: ['delayed_treatment'], timeWindowHours: [12, 48], severityTier: 'critical', description: 'Gram-negative sepsis from bacterial translocation.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'syncope'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'bloody', volume: 'moderate', frequency: 'severe_10_plus', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['fever', 'abdominal_pain', 'blood', 'dehydration'], mechanism: 'inflammatory', typicalDescription: 'Explosive bloody diarrhoea in a neonate or infant with known Hirschsprung disease. Abdominal distension and fever indicate life-threatening enterocolitis.' },
};

export const cow_milk_protein_allergy: DiseaseNode = {
  id: 'cow_milk_protein_allergy', name: "Cow's Milk Protein Allergy", icdCode: 'K52.2', system: 'paediatric',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 0, ageMax: 5, agePeak: [0, 1], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'Immune-mediated reaction to cow milk protein (whey or casein) in infants. Presents with diarrhoea (often with blood and mucus), vomiting, colic, and failure to thrive. Can cause iron-deficiency anaemia from occult GI bleeding. Symptoms resolve with elimination of dairy.', timelineStages: [{ stageId: 1, label: 'CMPA', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('diarrhea', 0.8, 0.5), sym('hematochezia', 0.3, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Colic', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Resolves with dairy elimination. Most children outgrow by age 3–5.' },
  features: { symptoms: [sym('diarrhea', 0.8, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('vomiting', 0.5, 0.5, { stageRelevance: [1] }), sym('diarrhoea_mucus', 0.5, 0.85, { stageRelevance: [1] }), sym('diarrhoea_relation_to_food', 0.7, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['viral_gastroenteritis_generic', 'lactose_intolerance_diarrhoea', 'food_allergy_diarrhoea', 'giardiasis'], distinguishingFeatures: [{ fromDiseaseId: 'viral_gastroenteritis_generic', featureIds: ['diarrhoea_duration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Failure to thrive', warningFeatures: ['weight_loss'], riskFactors: ['delayed_diagnosis'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Chronic diarrhoea and malabsorption causing growth failure.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'bloody', volume: 'small', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'blood', 'mucus'], mechanism: 'inflammatory', typicalDescription: 'Chronic diarrhoea with blood and mucus in an infant, temporally related to cow milk ingestion. Colic and irritability are associated.' },
};

export const congenital_enteropathy: DiseaseNode = {
  id: 'congenital_enteropathy', name: 'Congenital Enteropathy', icdCode: 'Q43.8', system: 'paediatric',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 0, ageMax: 2, agePeak: [0, 0.5], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.00001, riskFactors: [] },
  pathophysiology: { mechanism: 'Rare congenital disorders of intestinal epithelium including microvillus inclusion disease, tufting enteropathy, and epithelial dysplasia. Present in infancy with intractable diarrhoea beginning in the first days of life, requiring parenteral nutrition.', timelineStages: [{ stageId: 1, label: 'Congenital diarrhoea', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.95, 0.5), sym('diarrhoea_volume', 0.8, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'None', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Persistent lifelong; requires parenteral nutrition in severe cases.' },
  features: { symptoms: [sym('diarrhea', 0.95, 0.5, { stageRelevance: [1] }), sym('diarrhoea_volume', 0.8, 0.7, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.8, 0.7, { stageRelevance: [1] }), sym('weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('diarrhoea_dehydration', 0.8, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['cow_milk_protein_allergy', 'giardiasis', 'celiac_disease_diarrhoea', 'cystic_fibrosis_diarrhoea', 'short_bowel_syndrome'], distinguishingFeatures: [{ fromDiseaseId: 'cow_milk_protein_allergy', featureIds: ['diarrhoea_relation_to_food'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal failure', warningFeatures: ['weight_loss', 'diarrhoea_dehydration'], riskFactors: ['severe_mutation'], timeWindowHours: [168, 2160], severityTier: 'critical', description: 'Life-long dependence on parenteral nutrition.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'large', frequency: 'severe_10_plus', relationToFood: 'persists_despite_fasting', nocturnal: 'yes', associatedSymptoms: ['dehydration', 'weight_loss'], mechanism: 'secretory', typicalDescription: 'Intractable watery diarrhoea starting in the first days of life. Massive volumes persist despite fasting. Requires parenteral nutrition for survival.' },
};

export const hsp_diarrhoea: DiseaseNode = {
  id: 'hsp_diarrhoea', name: 'Henoch-Schonlein Purpura with GI Involvement', icdCode: 'D69.0', system: 'paediatric',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 2, ageMax: 20, agePeak: [4, 12], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'IgA vasculitis (Henoch-Schonlein purpura) affecting skin, joints, GI tract, and kidneys. GI involvement causes abdominal pain, nausea, vomiting, and diarrhoea (often bloody). Vasculitis leads to submucosal haemorrhage/oedema that can intussuscept. Palpable purpura on lower extremities is diagnostic.', timelineStages: [{ stageId: 1, label: 'HSP GI involvement', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('pain_character', 0.8, 0.6), sym('diarrhea', 0.4, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Colicky abdominal pain', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting over 4–6 weeks. Renal involvement determines long-term prognosis.' },
  features: { symptoms: [sym('pain_character', 0.8, 0.6, { stageRelevance: [1] }), sym('diarrhea', 0.4, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('joint_pain', 0.7, 0.8, { stageRelevance: [1] }), sym('diarrhoea_rash', 0.5, 0.85, { stageRelevance: [1] }), sym('fever', 0.3, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('diarrhoea_rash', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'Absence of rash makes HSP less likely' })] },
  differential: { mimics: ['intussusception', 'appendicitis', 'shigellosis', 'ibd_diarrhoea', 'ehec_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'intussusception', featureIds: ['diarrhoea_rash', 'joint_pain'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intussusception', warningFeatures: ['hematochezia', 'pain_character'], riskFactors: ['GI_vasculitis'], timeWindowHours: [24, 168], severityTier: 'severe', description: 'Vasculitic bowel wall thickening can act as lead point for intussusception.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'bloody', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'blood', 'rash', 'arthritis'], mechanism: 'inflammatory', typicalDescription: 'Colicky abdominal pain with bloody diarrhoea, palpable purpura on legs/buttocks, and arthralgia. Classic triad of HSP in a child.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 16: TROPICAL (3 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const typhoid_diarrhoea: DiseaseNode = {
  id: 'typhoid_diarrhoea', name: 'Typhoid Fever (Enteric Fever)', icdCode: 'A01.0', system: 'infectious',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 1, ageMax: 60, agePeak: [5, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [], geographicFlags: ['endemic_areas'] },
  pathophysiology: { mechanism: 'Salmonella typhi causes systemic infection with high fever, abdominal pain, and diarrhoea (or constipation in early stages). Bacteria invade Peyer patches in the ileum causing hyperplasia and necrosis. Rose spots, relative bradycardia, and hepatosplenomegaly are classic.', timelineStages: [{ stageId: 1, label: 'Typhoid fever', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('fever', 0.95, 0.6), sym('diarrhea', 0.5, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull abdominal pain', painLocationTypical: 'Right lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'Progressive systemic illness. Intestinal perforation at 2–4 weeks without treatment.' },
  features: { symptoms: [sym('fever', 0.95, 0.6, { stageRelevance: [1] }), sym('fever_chills', 0.5, 0.9, { stageRelevance: [1] }), sym('diarrhea', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('headache', 0.7, 0.7, { stageRelevance: [1] }), sym('diarrhoea_travel_related', 0.7, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['salmonellosis', 'intestinal_tuberculosis_diarrhoea', 'malaria', 'dengue', 'rickettsial_infection'], distinguishingFeatures: [{ fromDiseaseId: 'salmonellosis', featureIds: ['fever', 'headache'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal perforation', warningFeatures: ['rigidity', 'abdominal_distension', 'fever'], riskFactors: ['delayed_treatment'], timeWindowHours: [336, 672], severityTier: 'critical', description: 'Necrosis of Peyer patches leads to ileal perforation and peritonitis.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever_chills', 'rigidity'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'unrelated', nocturnal: 'yes', associatedSymptoms: ['fever', 'abdominal_pain'], mechanism: 'inflammatory', typicalDescription: 'Watery diarrhoea (or constipation) as part of a systemic febrile illness with step-ladder temperature pattern, headache, and abdominal pain. Classic rose spots may be present.' },
};

export const intestinal_tuberculosis_diarrhoea: DiseaseNode = {
  id: 'intestinal_tuberculosis_diarrhoea', name: 'Intestinal Tuberculosis', icdCode: 'A18.3', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 70, agePeak: [20, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Mycobacterium tuberculosis infection of the GI tract, most commonly the ileocaecal region. Causes chronic diarrhoea, abdominal pain, weight loss, night sweats, and fever. Can cause strictures, fistulae, and a mass lesion mimicking Crohn disease.', timelineStages: [{ stageId: 1, label: 'Intestinal TB', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('diarrhea', 0.6, 0.5), sym('weight_loss', 0.8, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Colicky RLQ pain', painLocationTypical: 'Right lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'Chronic progressive disease. Responds to antituberculous therapy.' },
  features: { symptoms: [sym('diarrhea', 0.6, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.8, 0.85, { stageRelevance: [1] }), sym('night_sweats', 0.6, 0.9, { stageRelevance: [1] }), sym('fever', 0.6, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.7, 0.7, { stageRelevance: [1] }), sym('diarrhoea_relation_to_food', 0.3, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.3, label: 'Absence of blood supports TB over IBD' })] },
  differential: { mimics: ['crohns_diarrhoea', 'amoebic_dysentery', 'small_bowel_lymphoma', 'typhoid_diarrhoea', 'whipple_disease'], distinguishingFeatures: [{ fromDiseaseId: 'crohns_diarrhoea', featureIds: ['diarrhoea_perianal'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal stricture/obstruction', warningFeatures: ['obstipation', 'abdominal_distension'], riskFactors: ['fibrotic_healing'], timeWindowHours: [4320, 43200], severityTier: 'severe', description: 'Fibrotic strictures from healing TB ulcers cause obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'night_sweats'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'yes', associatedSymptoms: ['fever', 'abdominal_pain', 'weight_loss'], mechanism: 'inflammatory', typicalDescription: 'Chronic diarrhoea with constitutional symptoms (fever, night sweats, weight loss) and right lower quadrant pain. Can mimic Crohn disease with strictures and fistulae.' },
};

export const schistosomiasis_diarrhoea: DiseaseNode = {
  id: 'schistosomiasis_diarrhoea', name: 'Schistosomiasis (Intestinal)', icdCode: 'B65.9', system: 'infectious',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 5, ageMax: 60, agePeak: [10, 30], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [], geographicFlags: ['endemic_areas'] },
  pathophysiology: { mechanism: 'Schistosoma mansoni and S. japonicum eggs deposited in the intestinal venules cause granulomatous inflammation, fibrosis, and polyposis. Chronic infection causes abdominal pain, diarrhoea (often bloody), hepatosplenic disease, and portal hypertension in advanced cases.', timelineStages: [{ stageId: 1, label: 'Intestinal schistosomiasis', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('diarrhea', 0.6, 0.5), sym('pain_character', 0.4, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Vague abdominal pain', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic progressive hepatosplenic disease without treatment.' },
  features: { symptoms: [sym('diarrhea', 0.6, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('pain_character', 0.4, 0.6, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_travel_related', 0.7, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('diarrhoea_travel_related', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No freshwater exposure in endemic area makes schistosomiasis unlikely' })], supporting: [] },
  differential: { mimics: ['amoebic_dysentery', 'ulcerative_colitis_diarrhoea', 'intestinal_tuberculosis_diarrhoea', 'typhoid_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'amoebic_dysentery', featureIds: ['diarrhoea_mucus'] }], neverCloseConditions: [] },
  complications: [{ name: 'Portal hypertension', warningFeatures: ['splenomegaly', 'hematemesis'], riskFactors: ['chronic_infection'], timeWindowHours: [43200, 86400], severityTier: 'severe', description: 'Periportal fibrosis (Symmers pipestem fibrosis) causing variceal bleeding.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia', 'splenomegaly'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'bloody', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'blood'], mechanism: 'inflammatory', typicalDescription: 'Chronic mild bloody diarrhoea with abdominal pain in a patient with freshwater exposure in an endemic area. Hepatosplenomegaly develops in advanced disease.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 17: RHEUMATOLOGICAL (2 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const scleroderma_diarrhoea: DiseaseNode = {
  id: 'scleroderma_diarrhoea', name: 'Systemic Sclerosis with Diarrhoea', icdCode: 'M34.8', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 70, agePeak: [35, 60], sexRisk: { male: 0.3, female: 1.7 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Systemic sclerosis causes progressive fibrosis and atrophy of GI smooth muscle, leading to dysmotility. Small intestinal involvement causes pseudo-obstruction, SIBO, and diarrhoea/steatorrhoea from bacterial overgrowth. Oesophageal dysmotility and reflux are almost universal.', timelineStages: [{ stageId: 1, label: 'GI scleroderma', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('diarrhea', 0.4, 0.5), sym('bloating', 0.6, 0.55)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Bloating/distension', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic progressive GI involvement over years.' },
  features: { symptoms: [sym('diarrhea', 0.4, 0.5, { stageRelevance: [1] }), sym('bloating', 0.6, 0.55, { stageRelevance: [1] }), sym('abdominal_distension', 0.5, 0.7, { stageRelevance: [1] }), sym('steatorrhea', 0.3, 0.85, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ibs_diarrhoea', 'sibo_diarrhoea', 'chronic_pseudo_obstruction', 'celiac_disease_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_diarrhoea', featureIds: ['steatorrhea'] }], neverCloseConditions: [] },
  complications: [{ name: 'Pseudo-obstruction', warningFeatures: ['abdominal_distension', 'obstipation'], riskFactors: ['severe_dysmotility'], timeWindowHours: [4320, 43200], severityTier: 'severe', description: 'Acute-on-chronic intestinal pseudo-obstruction requiring decompression.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain'], mechanism: 'dysmotility', typicalDescription: 'Chronic diarrhoea with bloating and distension in a patient with known systemic sclerosis. Secondary SIBO from small intestinal dysmotility is a major contributor.' },
};

export const behcet_diarrhoea: DiseaseNode = {
  id: 'behcet_diarrhoea', name: 'Behcet Disease with Intestinal Involvement', icdCode: 'M35.2', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 60, agePeak: [20, 40], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'Systemic vasculitis of unknown cause affecting arteries and veins. Intestinal Behcet causes deep, punched-out ulcers, most commonly in the ileocaecal region. Presents with abdominal pain, diarrhoea (often bloody), and oral/genital ulcerations. Can perforate.', timelineStages: [{ stageId: 1, label: 'Intestinal Behcet', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('diarrhea', 0.5, 0.5), sym('pain_character', 0.7, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Right lower quadrant pain', painLocationTypical: 'RLQ', painRadiationTypical: 'None' }], progressionRule: 'Relapsing-remitting. May progress to perforation and fistula formation.' },
  features: { symptoms: [sym('diarrhea', 0.5, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }), sym('diarrhoea_oral_ulcers', 0.7, 0.85, { stageRelevance: [1] }), sym('diarrhoea_arthritis', 0.5, 0.85, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('diarrhoea_oral_ulcers', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No oral or genital ulcers makes intestinal Behcet unlikely' })], supporting: [] },
  differential: { mimics: ['crohns_diarrhoea', 'intestinal_tuberculosis_diarrhoea', 'amoebic_dysentery', 'ulcerative_colitis_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'crohns_diarrhoea', featureIds: ['diarrhoea_perianal'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal perforation', warningFeatures: ['rigidity', 'fever', 'pain_character'], riskFactors: ['deep_ulcers'], timeWindowHours: [168, 720], severityTier: 'critical', description: 'Deep penetrating ulcers can perforate requiring emergency surgery.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'bloody', volume: 'small', frequency: 'mild_3_5', relationToFood: 'unrelated', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'blood', 'arthritis'], mechanism: 'inflammatory', typicalDescription: 'Chronic relapsing diarrhoea with right lower quadrant pain and oral/genital ulcers. Deep ileocaecal ulcers carry perforation risk mimicking Crohn disease.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 18: SURGICAL (2 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const short_bowel_syndrome: DiseaseNode = {
  id: 'short_bowel_syndrome', name: 'Short Bowel Syndrome', icdCode: 'K91.2', system: 'surgical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [30, 70], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Intestinal failure resulting from extensive small bowel resection (<200 cm remaining). Loss of absorptive surface area causes malabsorption, diarrhoea, steatorrhoea, dehydration, and nutritional deficiencies. Adaptation occurs over months to years.', timelineStages: [{ stageId: 1, label: 'Short bowel', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_volume', 0.8, 0.7)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Improves with intestinal adaptation over 1-2 years. Some require lifelong parenteral nutrition.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('diarrhoea_volume', 0.8, 0.7, { stageRelevance: [1] }), sym('steatorrhea', 0.5, 0.85, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.85, { stageRelevance: [1] }), sym('prior_abdominal_surgery', 0.9, 0.7, { stageRelevance: [1] }), sym('diarrhoea_dehydration', 0.6, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('prior_abdominal_surgery', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No prior bowel resection makes short bowel syndrome very unlikely' })], supporting: [] },
  differential: { mimics: ['bile_acid_malabsorption', 'sibo_diarrhoea', 'chronic_pancreatitis_diarrhoea', 'celiac_disease_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'bile_acid_malabsorption', featureIds: ['prior_abdominal_surgery'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal failure requiring parenteral nutrition', warningFeatures: ['weight_loss', 'diarrhoea_dehydration'], riskFactors: ['<100_cm_remaining'], timeWindowHours: [168, 2160], severityTier: 'severe', description: 'Inability to maintain nutritional autonomy.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'diarrhoea_dehydration'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'large', frequency: 'severe_10_plus', relationToFood: 'worse_after_eating', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain', 'weight_loss', 'dehydration'], mechanism: 'malabsorptive', typicalDescription: 'High-volume watery diarrhoea after extensive small bowel resection. Malabsorption of nutrients, fluids, and electrolytes requires aggressive replacement therapy.' },
};

export const bile_acid_malabsorption: DiseaseNode = {
  id: 'bile_acid_malabsorption', name: 'Bile Acid Malabsorption', icdCode: 'K90.4', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 70], sexRisk: { male: 0.8, female: 1.2 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Failure of the terminal ileum to reabsorb bile acids leads to excess bile acids entering the colon, where they stimulate chloride secretion and water loss (secretory diarrhoea). Causes: ileal resection, Crohn disease, post-cholecystectomy, or idiopathic (primary BAM). Bile acid sequestrants (colesevelam) are diagnostic and therapeutic.', timelineStages: [{ stageId: 1, label: 'BAM', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('diarrhea', 0.9, 0.5), sym('diarrhoea_stool_type', 0.4, 0.75)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic. Responsive to bile acid sequestrants.' },
  features: { symptoms: [sym('diarrhea', 0.9, 0.5, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhoea_nocturnal', 0.4, 0.85, { stageRelevance: [1] }), sym('steatorrhea', 0.3, 0.85, { stageRelevance: [1] }), sym('prior_abdominal_surgery', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Absence of blood favours BAM over IBD' })] },
  differential: { mimics: ['ibs_diarrhoea', 'microscopic_colitis', 'sibo_diarrhoea', 'functional_diarrhoea', 'short_bowel_syndrome'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_diarrhoea', featureIds: ['prior_abdominal_surgery'] }, { fromDiseaseId: 'functional_diarrhoea', featureIds: ['prior_abdominal_surgery'] }], neverCloseConditions: [] },
  complications: [{ name: 'Fat-soluble vitamin deficiency', warningFeatures: ['weight_loss'], riskFactors: ['chronic_severe_bam'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Deficiency of vitamins A, D, E, K from fat malabsorption.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
  diarrhoeaManifestation: { duration: 'chronic', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'yes', associatedSymptoms: ['abdominal_pain'], mechanism: 'secretory', typicalDescription: 'Chronic watery diarrhoea often following ileal resection, cholecystectomy, or in Crohn disease. Diarrhoea is typically postprandial and may be accompanied by urgency.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 19: FOOD INTOLERANCE (2 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const lactose_intolerance_diarrhoea: DiseaseNode = {
  id: 'lactose_intolerance_diarrhoea', name: 'Lactose Intolerance (Diarrhoea)', icdCode: 'E73.9', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [20, 60], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.1, riskFactors: [] },
  pathophysiology: { mechanism: 'Lactase deficiency causes undigested lactose to reach the colon where bacteria ferment it, producing gas, bloating, cramps, and osmotic diarrhoea. Prevalence varies by ethnicity. Symptoms are dose-dependent.', timelineStages: [{ stageId: 1, label: 'Lactose intolerance', typicalHoursFromOnset: [0, 8], dominantSymptoms: [sym('diarrhea', 0.7, 0.5), sym('bloating', 0.7, 0.55)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Life-long but managed with dietary lactose restriction.' },
  features: { symptoms: [sym('diarrhea', 0.7, 0.5, { stageRelevance: [1] }), sym('bloating', 0.7, 0.55, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('diarrhoea_relation_to_food', 0.8, 0.7, { stageRelevance: [1] }), sym('diarrhoea_duration', 0.4, 0.7, { stageRelevance: [1] }), sym('diarrhoea_improves_fasting', 0.6, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('hematochezia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Absence of blood favours food intolerance over IBD' })] },
  differential: { mimics: ['ibs_diarrhoea', 'food_allergy_diarrhoea', 'celiac_disease_diarrhoea', 'sibo_diarrhoea', 'functional_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_diarrhoea', featureIds: ['diarrhoea_relation_to_food', 'diarrhoea_improves_fasting'] }, { fromDiseaseId: 'food_allergy_diarrhoea', featureIds: ['diarrhoea_improves_fasting'] }], neverCloseConditions: [] },
  complications: [{ name: 'Nutritional calcium deficiency', warningFeatures: [], riskFactors: ['strict_dairy_avoidance'], timeWindowHours: [21600, 86400], severityTier: 'mild', description: 'Reduced calcium intake from dairy avoidance.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'moderate', frequency: 'moderate_5_10', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain'], mechanism: 'osmotic', typicalDescription: 'Watery diarrhoea, bloating, and cramps starting 30 minutes to 2 hours after consuming dairy. Self-limiting. Improves with fasting and resolves with dairy elimination.' },
};

export const food_allergy_diarrhoea: DiseaseNode = {
  id: 'food_allergy_diarrhoea', name: 'Food Allergy (General)', icdCode: 'T78.4', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 60, agePeak: [5, 30], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'IgE-mediated or non-IgE-mediated immune response to specific food proteins (peanut, egg, soy, wheat, fish, shellfish). GI symptoms include acute diarrhoea, vomiting, abdominal pain within minutes to hours of ingestion. May present with urticaria, angioedema, and anaphylaxis.', timelineStages: [{ stageId: 1, label: 'Food allergy reaction', typicalHoursFromOnset: [0, 4], dominantSymptoms: [sym('diarrhea', 0.6, 0.5), sym('vomiting', 0.6, 0.5)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Cramping', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Resolves with allergen avoidance. Re-exposure triggers recurrence.' },
  features: { symptoms: [sym('diarrhea', 0.6, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.6, 0.5, { stageRelevance: [1] }), sym('nausea', 0.6, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] }), sym('diarrhoea_relation_to_food', 0.7, 0.7, { stageRelevance: [1] }), sym('diarrhoea_rash', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['lactose_intolerance_diarrhoea', 'ibs_diarrhoea', 'viral_gastroenteritis_generic', 'staph_food_poisoning', 'celiac_disease_diarrhoea'], distinguishingFeatures: [{ fromDiseaseId: 'lactose_intolerance_diarrhoea', featureIds: ['diarrhoea_rash'] }, { fromDiseaseId: 'viral_gastroenteritis_generic', featureIds: ['diarrhoea_relation_to_food'] }], neverCloseConditions: [] },
  complications: [{ name: 'Anaphylaxis', warningFeatures: ['dyspnea', 'syncope'], riskFactors: ['known_allergy'], timeWindowHours: [0, 2], severityTier: 'critical', description: 'Life-threatening systemic allergic reaction requiring epinephrine.' }],
  clinicalScores: [], redFlagFeatureIds: ['dyspnea', 'syncope'],
  diarrhoeaManifestation: { duration: 'acute', stoolType: 'watery', volume: 'small', frequency: 'mild_3_5', relationToFood: 'worse_after_eating', nocturnal: 'no', associatedSymptoms: ['abdominal_pain', 'rash', 'vomiting'], mechanism: 'mixed', typicalDescription: 'Acute diarrhoea with vomiting and abdominal pain shortly after ingestion of an allergenic food. May be accompanied by urticaria, angioedema, or respiratory symptoms.' },
};

export const DIARRHOEA_NODES: DiseaseNode[] = [
  viral_gastroenteritis_norovirus,
  viral_gastroenteritis_rotavirus,
  viral_gastroenteritis_adenovirus,
  viral_gastroenteritis_astrovirus,
  viral_gastroenteritis_generic,
  shigellosis,
  salmonellosis,
  campylobacter_enteritis,
  etec_diarrhoea,
  ehec_diarrhoea,
  cholera,
  staph_food_poisoning,
  bacillus_cereus_diarrhoea,
  c_diff_colitis,
  aad_generic,
  giardiasis,
  amoebic_dysentery,
  cryptosporidiosis,
  cyclospora_diarrhoea,
  strongyloides_diarrhoea,
  hookworm_diarrhoea,
  trichuriasis,
  ulcerative_colitis_diarrhoea,
  crohns_diarrhoea,
  microscopic_colitis,
  toxic_megacolon_diarrhoea,
  celiac_disease_diarrhoea,
  tropical_sprue,
  whipple_disease,
  chronic_pancreatitis_diarrhoea,
  cystic_fibrosis_diarrhoea,
  ibs_diarrhoea,
  functional_diarrhoea,
  ischaemic_colitis_diarrhoea,
  radiation_colitis,
  cmv_colitis,
  colorectal_cancer_diarrhoea,
  small_bowel_lymphoma,
  sibo_diarrhoea,
  radiation_enteritis,
  dumping_syndrome,
  zollinger_ellison,
  hyperthyroid_diarrhoea,
  addison_disease_diarrhoea,
  diabetic_diarrhoea,
  vipoma,
  carcinoid_syndrome_diarrhoea,
  uraemic_diarrhoea,
  amyloidosis_diarrhoea,
  drug_induced_diarrhoea,
  hiv_enteropathy,
  hiv_cryptosporidium,
  hiv_cmv_colitis,
  nec_diarrhoea,
  hirschsprung_enterocolitis,
  cow_milk_protein_allergy,
  congenital_enteropathy,
  hsp_diarrhoea,
  typhoid_diarrhoea,
  intestinal_tuberculosis_diarrhoea,
  schistosomiasis_diarrhoea,
  scleroderma_diarrhoea,
  behcet_diarrhoea,
  short_bowel_syndrome,
  bile_acid_malabsorption,
  lactose_intolerance_diarrhoea,
  food_allergy_diarrhoea,
];
