import type { DiseaseNode, FeatureRecord } from '../../diseaseNode';
import { getFeature, getLrPlus, getLrMinus } from '../../features/featureLibrary';

function feat(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  const base = getFeature(id);
  return { ...base, sensitivity: sens, specificity: spec, LR_positive: getLrPlus({ ...base, sensitivity: sens, specificity: spec }), LR_negative: getLrMinus({ ...base, sensitivity: sens, specificity: spec }), ...overrides };
}
function sym(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  return feat(id, sens, spec, { ...overrides, category: 'symptom' });
}

export const cyclicVomiting: DiseaseNode = {
  id: 'cyclic_vomiting', name: 'Cyclic Vomiting Syndrome', icdCode: 'G43.A', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 2, ageMax: 60, agePeak: [5, 15], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'A functional disorder characterised by recurrent, stereotypical episodes of intense vomiting separated by weeks to months of normal health. Each episode begins abruptly, often at night or early morning, and self-resolves. Migraine pathway implicated.', timelineStages: [{ stageId: 1, label: 'Prodrome', typicalHoursFromOnset: [0, 4], dominantSymptoms: [sym('nausea', 0.9, 0.5), sym('vomiting', 0.9, 0.5), sym('pain_character', 0.3, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric discomfort', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting episodes lasting 1-5 days. Asymptomatic between episodes.' },
  features: { symptoms: [sym('nausea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.7, 0.6, { stageRelevance: [1] }), sym('vomiting_timing', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.4, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.3, 0.5, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.9, 0.8, { stageRelevance: [1] }), sym('anorexia', 0.5, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('previous_similar_episodes', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05 })], supporting: [] },
  differential: { mimics: ['gastroenteritis', 'food_poisoning', 'malrotation', 'raised_icp', 'gastroparesis'], distinguishingFeatures: [{ fromDiseaseId: 'gastroenteritis', featureIds: ['previous_similar_episodes', 'diarrhea'] }], neverCloseConditions: [] },
  complications: [{ name: 'Dehydration', warningFeatures: ['vomiting_frequency', 'syncope'], riskFactors: ['children'], timeWindowHours: [24, 72], severityTier: 'moderate', description: 'Fluid loss requiring IV rehydration.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope'],
};

export const gastroparesis: DiseaseNode = {
  id: 'gastroparesis', name: 'Gastroparesis', icdCode: 'K31.84', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 70, agePeak: [20, 40], sexRisk: { male: 0.4, female: 1.6 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Delayed gastric emptying without mechanical obstruction. Most commonly idiopathic, diabetic (vagal neuropathy), or post-surgical (vagotomy). Presents with postprandial fullness, nausea, vomiting of undigested food eaten hours earlier, and epigastric pain.', timelineStages: [{ stageId: 1, label: 'Symptomatic', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('nausea', 0.8, 0.5), sym('vomiting', 0.7, 0.5), sym('vomiting_description', 0.6, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric fullness/discomfort', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'Chronic, progressive in diabetics. Weight loss and malnutrition with prolonged disease.' },
  features: { symptoms: [sym('nausea', 0.8, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.7, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.6, 0.7, { stageRelevance: [1] }), sym('vomiting_timing', 0.6, 0.6, { stageRelevance: [1] }), sym('vomiting_frequency', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.4, 0.5, { stageRelevance: [1] }), sym('bloating', 0.6, 0.6, { stageRelevance: [1] }), sym('anorexia', 0.5, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.7, { stageRelevance: [1] }), sym('diabetes', 0.4, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_dyspepsia', 'gastric_outlet_obstruction', 'cyclic_vomiting', 'gastritis', 'pancreatic_cancer'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_outlet_obstruction', featureIds: ['vomiting_description', 'diabetes'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe malnutrition', warningFeatures: ['weight_loss', 'vomiting_frequency'], riskFactors: ['diabetes'], timeWindowHours: [2160, 21600], severityTier: 'moderate', description: 'Chronic vomiting leads to weight loss and nutritional deficiencies.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
};

export const hyperemesisGravidarum: DiseaseNode = {
  id: 'hyperemesis_gravidarum', name: 'Hyperemesis Gravidarum', icdCode: 'O21.1', system: 'obstetric',
  organSystem: 'reproductive_female', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 45, agePeak: [20, 35], sexRisk: { male: 0, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Severe, persistent nausea and vomiting in pregnancy, beyond the typical first trimester. Believed to be driven by high hCG levels, oestrogen, and progesterone. Can cause dehydration, electrolyte abnormalities, and weight loss.', timelineStages: [{ stageId: 1, label: 'Severe vomiting', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('vomiting', 0.9, 0.5), sym('nausea', 0.9, 0.5), sym('vomiting_frequency', 0.7, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric discomfort', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'May persist beyond first trimester. Typically resolves by 20 weeks.' },
  features: { symptoms: [sym('nausea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.7, 0.6, { stageRelevance: [1] }), sym('vomiting_timing', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.4, 0.6, { stageRelevance: [1] }), sym('anorexia', 0.6, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.8, { stageRelevance: [1] }), sym('pregnancy_status', 0.95, 0.9, { stageRelevance: [1] }), sym('last_menstrual_period', 0.85, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('pregnancy_status', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.02, label: 'Not pregnant — hyperemesis excluded' })], supporting: [] },
  differential: { mimics: ['gastroenteritis', 'cyclic_vomiting', 'gastroparesis', 'peptic_ulcer_disease'], distinguishingFeatures: [{ fromDiseaseId: 'gastroenteritis', featureIds: ['pregnancy_status', 'last_menstrual_period', 'diarrhea'] }], neverCloseConditions: [] },
  complications: [{ name: 'Wernicke encephalopathy', warningFeatures: ['syncope', 'vomiting_frequency'], riskFactors: ['prolonged_vomiting'], timeWindowHours: [336, 1008], severityTier: 'critical', description: 'Thiamine deficiency causing neurological damage.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope'],
};

export const raisedIcp: DiseaseNode = {
  id: 'raised_icp', name: 'Raised Intracranial Pressure / Brain Tumour', icdCode: 'G93.2', system: 'medical',
  organSystem: 'neurological', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [40, 70], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Increased intracranial pressure from a space-occupying lesion (tumour, abscess, haemorrhage, oedema). Presents with headache worse in morning, vomiting (projectile, often without nausea), and neurological deficits. Vomiting is caused by direct stimulation of the medullary vomiting centre.', timelineStages: [{ stageId: 1, label: 'Early raised ICP', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('vomiting', 0.6, 0.5), sym('vomiting_timing', 0.5, 0.5), sym('vomiting_description', 0.4, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Headache, not abdominal pain', painLocationTypical: 'Head/abdomen', painRadiationTypical: 'None' }], progressionRule: 'Progressive neurological deterioration without treatment.' },
  features: { symptoms: [sym('vomiting', 0.6, 0.5, { stageRelevance: [1] }), sym('vomiting_timing', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.4, 0.6, { stageRelevance: [1] }), sym('nausea', 0.3, 0.5, { stageRelevance: [1] }), sym('syncope', 0.3, 0.8, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.2, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('vomiting_timing', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.3, label: 'Vomiting after pain onset suggests surgical abdomen over neurological cause' })] },
  differential: { mimics: ['cyclic_vomiting', 'gastroparesis', 'migraine'], distinguishingFeatures: [{ fromDiseaseId: 'cyclic_vomiting', featureIds: ['nausea', 'vomiting_timing'] }], neverCloseConditions: [] },
  complications: [{ name: 'Brain herniation', warningFeatures: ['syncope', 'vomiting_frequency'], riskFactors: [], timeWindowHours: [24, 168], severityTier: 'critical', description: 'Fatal herniation from uncontrolled raised ICP.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope'],
};

export const bulimiaNervosa: DiseaseNode = {
  id: 'bulimia_nervosa', name: 'Bulimia Nervosa / Purging Disorder', icdCode: 'F50.2', system: 'psychiatric',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 12, ageMax: 45, agePeak: [15, 30], sexRisk: { male: 0.1, female: 1.9 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'An eating disorder characterised by binge eating followed by purging (self-induced vomiting, laxative abuse). Presents with recurrent vomiting, abdominal pain, dental erosion, parotid swelling, and metabolic alkalosis. Patients often secretive about purging.', timelineStages: [{ stageId: 1, label: 'Active purging', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('vomiting', 0.9, 0.5), sym('vomiting_timing', 0.5, 0.5), sym('pain_character', 0.3, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric discomfort after binges', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'Chronic disorder requiring psychiatric treatment.' },
  features: { symptoms: [sym('vomiting', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting_timing', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.7, 0.6, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.3, 0.5, { stageRelevance: [1] }), sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }), sym('anorexia', 0.4, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.3, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['gastroenteritis', 'cyclic_vomiting', 'gastroparesis', 'hyperemesis_gravidarum', 'mallory_weiss'], distinguishingFeatures: [{ fromDiseaseId: 'gastroenteritis', featureIds: ['vomiting_frequency', 'previous_similar_episodes'] }], neverCloseConditions: [] },
  complications: [{ name: 'Mallory-Weiss tear', warningFeatures: ['hematemesis'], riskFactors: ['frequent_purging'], timeWindowHours: [0, 72], severityTier: 'moderate', description: 'Oesophageal tear from forceful vomiting.' }, { name: 'Hypokalaemia', warningFeatures: ['fatigue', 'syncope'], riskFactors: ['frequent_purging'], timeWindowHours: [168, 2160], severityTier: 'severe', description: 'Potassium depletion causing cardiac arrhythmia.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope'],
};

// ── VESTIBULAR DISEASES (standalone vomiting causes) ──────────

export const vestibularNeuritis: DiseaseNode = {
  id: 'vestibular_neuritis', name: 'Vestibular Neuritis', icdCode: 'H81.2', system: 'medical',
  organSystem: 'neurological', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 60, agePeak: [30, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Viral inflammation of the vestibular nerve causing sudden, severe vertigo with nausea and vomiting. Presents with acute onset of rotational vertigo, nystagmus, and postural instability. No hearing loss — this distinguishes it from labyrinthitis.', timelineStages: [{ stageId: 1, label: 'Acute vestibular crisis', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('nausea', 0.9, 0.5), sym('vomiting', 0.8, 0.5), sym('vomiting_frequency', 0.6, 0.6)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'No abdominal pain — vertigo is the chief complaint', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Self-limited. Acute phase resolves in 1-3 days. Postural instability may persist for weeks.' },
  features: { symptoms: [sym('nausea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.8, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.6, 0.6, { stageRelevance: [1] }), sym('vomiting_timing', 0.4, 0.5, { stageRelevance: [1] }), sym('headache', 0.3, 0.6, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.2, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('headache', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.3, label: 'Minimal headache — against raised ICP or migraine' })] },
  differential: { mimics: ['labyrinthitis', 'raised_icp', 'migraine', 'gastroenteritis'], distinguishingFeatures: [{ fromDiseaseId: 'labyrinthitis', featureIds: ['headache'] }], neverCloseConditions: [] },
  complications: [{ name: 'Falls/injury', warningFeatures: ['syncope'], riskFactors: ['elderly'], timeWindowHours: [0, 72], severityTier: 'moderate', description: 'Fall risk during acute vertigo.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope'],
};

export const labyrinthitis: DiseaseNode = {
  id: 'labyrinthitis', name: 'Labyrinthitis', icdCode: 'H83.0', system: 'medical',
  organSystem: 'neurological', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 60, agePeak: [30, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Viral or bacterial infection of the inner ear (labyrinth) causing vertigo, hearing loss, and tinnitus. Nausea and vomiting are proportional to vertigo severity. Unlike vestibular neuritis, labyrinthitis involves HEARING LOSS.', timelineStages: [{ stageId: 1, label: 'Acute labyrinthitis', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('nausea', 0.9, 0.5), sym('vomiting', 0.8, 0.5), sym('vomiting_frequency', 0.6, 0.6)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'No abdominal pain — vertigo + hearing loss', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Self-limited. Hearing loss may be permanent.' },
  features: { symptoms: [sym('nausea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.8, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.6, 0.6, { stageRelevance: [1] }), sym('vomiting_timing', 0.4, 0.5, { stageRelevance: [1] }), sym('headache', 0.4, 0.6, { stageRelevance: [1] }), sym('fever', 0.3, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('headache', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Hearing loss distinguishes labyrinthitis from vestibular neuritis' })] },
  differential: { mimics: ['vestibular_neuritis', 'raised_icp', 'migraine', 'gastroenteritis'], distinguishingFeatures: [{ fromDiseaseId: 'vestibular_neuritis', featureIds: ['fever'] }], neverCloseConditions: [] },
  complications: [{ name: 'Permanent hearing loss', warningFeatures: ['fever'], riskFactors: ['bacterial'], timeWindowHours: [72, 336], severityTier: 'moderate', description: 'Irreversible sensorineural hearing loss.' }],
  clinicalScores: [], redFlagFeatureIds: [],
};

// These are cross-highway candidates activated when vomiting co-presents with abdominal pain
// They help distinguish "vomiting caused by abdominal disease" from "independent vomiting + separate abdominal pain"
export const VOMITING_NODES: DiseaseNode[] = [
  cyclicVomiting, gastroparesis, hyperemesisGravidarum, raisedIcp, bulimiaNervosa,
  vestibularNeuritis, labyrinthitis,
];
