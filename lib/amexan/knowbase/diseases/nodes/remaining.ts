import type { DiseaseNode, FeatureRecord } from '../../diseaseNode';
import { getFeature, getLrPlus, getLrMinus } from '../../features/featureLibrary';

function feat(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  const base = getFeature(id);
  return { ...base, sensitivity: sens, specificity: spec, LR_positive: getLrPlus({ ...base, sensitivity: sens, specificity: spec }), LR_negative: getLrMinus({ ...base, sensitivity: sens, specificity: spec }), ...overrides };
}
function sym(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  return feat(id, sens, spec, { ...overrides, category: 'symptom' });
}

// ── OESOPHAGEAL ─────────────────────────────────────────────

export const gerd: DiseaseNode = {
  id: 'gerd', name: 'Gastro-oesophageal Reflux Disease', icdCode: 'K21', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 0, ageMax: 90, agePeak: [30, 60], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.15, riskFactors: [] },
  pathophysiology: { mechanism: 'Lower oesophageal sphincter incompetence allows gastric acid reflux into the oesophagus, causing heartburn, regurgitation, and chest pain. Chronic reflux can lead to oesophagitis, strictures, and Barrett oesophagus.', timelineStages: [{ stageId: 1, label: 'Symptomatic reflux', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('heartburn', 0.8, 0.7), sym('belching', 0.5, 0.6), sym('pain_character', 0.5, 0.5), sym('dysphagia', 0.3, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Burning, retrosternal', painLocationTypical: 'Epigastric/retrosternal', painRadiationTypical: 'To throat or back' }], progressionRule: 'Chronic relapsing condition. May respond to lifestyle measures and acid suppression.' },
  features: { symptoms: [sym('heartburn', 0.8, 0.7, { stageRelevance: [1] }), sym('belching', 0.5, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }), sym('dysphagia', 0.3, 0.8, { stageRelevance: [1] }), sym('chest_pain', 0.4, 0.7, { stageRelevance: [1] }), sym('cough', 0.3, 0.7, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.7, 0.7, { stageRelevance: [1] }), sym('eating_worsens', 0.6, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('heartburn', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1 })], supporting: [] },
  differential: { mimics: ['peptic_ulcer_disease', 'gastritis', 'mi', 'cholecystitis'], distinguishingFeatures: [{ fromDiseaseId: 'peptic_ulcer_disease', featureIds: ['heartburn', 'belching', 'eating_worsens'] }], neverCloseConditions: [] },
  complications: [{ name: 'Barrett oesophagus', warningFeatures: ['dysphagia'], riskFactors: ['longstanding_gerd'], timeWindowHours: [43800, 175200], severityTier: 'moderate', description: 'Metaplastic change predisposing to oesophageal adenocarcinoma.' }],
  clinicalScores: [], redFlagFeatureIds: ['dysphagia', 'weight_loss'],
};

export const esophagitis: DiseaseNode = {
  id: 'esophagitis', name: 'Oesophagitis', icdCode: 'K20', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [30, 60], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'Inflammation of the oesophageal mucosa from acid reflux, infection (Candida, HSV, CMV), or medications. Presents with retrosternal pain, odynophagia, and dysphagia.', timelineStages: [{ stageId: 1, label: 'Acute oesophagitis', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('chest_pain', 0.6, 0.7), sym('dysphagia', 0.7, 0.8), sym('pain_character', 0.5, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Burning, retrosternal', painLocationTypical: 'Retrosternal/epigastric', painRadiationTypical: 'To back' }], progressionRule: 'May progress to stricture if chronic.' },
  features: { symptoms: [sym('chest_pain', 0.6, 0.7, { stageRelevance: [1] }), sym('dysphagia', 0.7, 0.8, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }), sym('heartburn', 0.6, 0.6, { stageRelevance: [1] }), sym('cough', 0.3, 0.7, { stageRelevance: [1] }), sym('hiv_status', 0.2, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('dysphagia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15 })], supporting: [] },
  differential: { mimics: ['gerd', 'peptic_ulcer_disease', 'mi', 'boerhaave'], distinguishingFeatures: [{ fromDiseaseId: 'gerd', featureIds: ['dysphagia'] }], neverCloseConditions: [] },
  complications: [{ name: 'Stricture', warningFeatures: ['dysphagia', 'weight_loss'], riskFactors: ['chronic'], timeWindowHours: [8760, 43800], severityTier: 'moderate', description: 'Fibrotic narrowing requiring dilatation.' }],
  clinicalScores: [], redFlagFeatureIds: ['dysphagia', 'weight_loss'],
};

export const achalasia: DiseaseNode = {
  id: 'achalasia', name: 'Achalasia Cardia', icdCode: 'K22.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 70, agePeak: [30, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Loss of inhibitory neurons in the oesophageal myenteric plexus causes failure of LOS relaxation and absent peristalsis. Presents with progressive dysphagia to solids and liquids, regurgitation of undigested food, and chest pain.', timelineStages: [{ stageId: 1, label: 'Symptomatic', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('dysphagia', 0.9, 0.85), sym('chest_pain', 0.5, 0.7), sym('vomiting', 0.6, 0.5), sym('cough', 0.3, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Retrosternal pressure', painLocationTypical: 'Retrosternal/epigastric', painRadiationTypical: 'To back' }], progressionRule: 'Slowly progressive over years. Risk of megaoesophagus and aspiration.' },
  features: { symptoms: [sym('dysphagia', 0.9, 0.85, { stageRelevance: [1] }), sym('chest_pain', 0.5, 0.7, { stageRelevance: [1] }), sym('pain_character', 0.4, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.6, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.4, 0.7, { stageRelevance: [1] }), sym('cough', 0.3, 0.7, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('dysphagia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05 })], supporting: [] },
  differential: { mimics: ['gerd', 'esophagitis', 'esophageal_cancer', 'boerhaave'], distinguishingFeatures: [{ fromDiseaseId: 'gerd', featureIds: ['dysphagia', 'heartburn'] }], neverCloseConditions: [] },
  complications: [{ name: 'Aspiration pneumonia', warningFeatures: ['cough', 'dyspnea', 'fever'], riskFactors: [], timeWindowHours: [0, 720], severityTier: 'severe', description: 'Regurgitated food aspirated into lungs.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
};

export const malloryWeiss: DiseaseNode = {
  id: 'mallory_weiss', name: 'Mallory-Weiss Tear', icdCode: 'K22.6', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 60], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'A longitudinal mucosal tear at the gastro-oesophageal junction caused by forceful retching, vomiting, or coughing. Presents with haematemesis following episodes of non-bloody vomiting. Most stop bleeding spontaneously.', timelineStages: [{ stageId: 1, label: 'Acute bleed', typicalHoursFromOnset: [0, 6], dominantSymptoms: [sym('hematemesis', 0.9, 0.9), sym('vomiting', 0.8, 0.5), sym('vomiting_description', 0.6, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Epigastric discomfort', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'Usually self-limiting. Re-bleeding uncommon.' },
  features: { symptoms: [sym('hematemesis', 0.9, 0.9, { stageRelevance: [1] }), sym('vomiting', 0.8, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.6, 0.8, { stageRelevance: [1] }), sym('vomiting_frequency', 0.5, 0.6, { stageRelevance: [1] }), sym('melena', 0.4, 0.85, { stageRelevance: [1] }), sym('syncope', 0.3, 0.85, { stageRelevance: [1] }), sym('alcohol_use', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('hematemesis', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05 })], supporting: [] },
  differential: { mimics: ['boerhaave', 'peptic_ulcer_disease', 'gastritis', 'esophageal_varices'], distinguishingFeatures: [{ fromDiseaseId: 'boerhaave', featureIds: ['pain_onset', 'chest_pain', 'pain_character'] }], neverCloseConditions: [] },
  complications: [{ name: 'Significant haemorrhage', warningFeatures: ['syncope', 'melena'], riskFactors: ['anticoagulant_use'], timeWindowHours: [0, 24], severityTier: 'critical', description: 'Ongoing bleeding requiring endoscopic intervention.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope', 'hematemesis'],
};

// ── STOMACH ─────────────────────────────────────────────────

export const functionalDyspepsia: DiseaseNode = {
  id: 'functional_dyspepsia', name: 'Functional Dyspepsia', icdCode: 'K30', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 60, agePeak: [20, 40], sexRisk: { male: 0.7, female: 1.3 }, backgroundPrevalence: 0.1, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic or recurrent epigastric pain or burning with no organic cause identified. Believed to involve visceral hypersensitivity, impaired gastric accommodation, and delayed gastric emptying.', timelineStages: [{ stageId: 1, label: 'Symptomatic', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('pain_character', 0.5, 0.5), sym('heartburn', 0.4, 0.6), sym('bloating', 0.5, 0.55)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Epigastric burning or ache', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'Chronic relapsing. Responds to acid suppression or prokinetics.' },
  features: { symptoms: [sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.5, { stageRelevance: [1] }), sym('heartburn', 0.4, 0.6, { stageRelevance: [1] }), sym('bloating', 0.5, 0.55, { stageRelevance: [1] }), sym('belching', 0.4, 0.6, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.7, 0.7, { stageRelevance: [1] }), sym('eating_worsens', 0.4, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['peptic_ulcer_disease', 'gastritis', 'gerd', 'cholecystitis', 'ibs'], distinguishingFeatures: [{ fromDiseaseId: 'peptic_ulcer_disease', featureIds: ['previous_similar_episodes', 'heartburn'] }], neverCloseConditions: [] },
  complications: [], clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'melena', 'hematemesis'],
};

export const gastricCancer: DiseaseNode = {
  id: 'gastric_cancer', name: 'Gastric Cancer', icdCode: 'C16', system: 'surgical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 40, ageMax: 90, agePeak: [60, 80], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Adenocarcinoma of the stomach. Often asymptomatic early. Presents with epigastric pain, weight loss, early satiety, anorexia. Late presentation is common. Risk factors: H. pylori, smoking, family history.', timelineStages: [{ stageId: 1, label: 'Early', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('pain_initial_location', 0.6, 0.5), sym('anorexia', 0.6, 0.5), sym('weight_loss', 0.7, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull epigastric ache', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'Advanced at diagnosis in most patients.' },
  features: { symptoms: [sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.4, 0.5, { stageRelevance: [1] }), sym('anorexia', 0.6, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }), sym('melena', 0.3, 0.85, { stageRelevance: [1] }), sym('dysphagia', 0.2, 0.8, { stageRelevance: [1] }), sym('fatigue', 0.5, 0.5, { stageRelevance: [1] }), sym('family_history_gi_cancer', 0.2, 0.85, { stageRelevance: [1] }), sym('smoking', 0.4, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['peptic_ulcer_disease', 'gastritis', 'functional_dyspepsia', 'pancreatic_cancer'], distinguishingFeatures: [{ fromDiseaseId: 'peptic_ulcer_disease', featureIds: ['weight_loss', 'anorexia', 'age'] }], neverCloseConditions: [] },
  complications: [{ name: 'Gastric outlet obstruction', warningFeatures: ['vomiting', 'abdominal_distension'], riskFactors: [], timeWindowHours: [720, 4320], severityTier: 'severe', description: 'Tumour obstructing the pylorus.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'melena', 'hematemesis'],
};

// ── LIVER ────────────────────────────────────────────────────

export const liverAbscess: DiseaseNode = {
  id: 'liver_abscess', name: 'Liver Abscess', icdCode: 'K75.0', system: 'medical',
  organSystem: 'hepatobiliary', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [30, 60], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.002, geographicFlags: ['endemic_amoebic', 'tropical'], riskFactors: [] },
  pathophysiology: { mechanism: 'A pus-filled cavity in the liver caused by bacterial (pyogenic, often E. coli, anaerobes) or amoebic (E. histolytica) infection. Presents with RUQ pain, high fever, rigors, and tender hepatomegaly.', timelineStages: [{ stageId: 1, label: 'Acute abscess', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('pain_initial_location', 0.8, 0.55), sym('fever_chills', 0.8, 0.85), sym('fever', 0.8, 0.55)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Constant, dull RUQ', painLocationTypical: 'Right upper quadrant', painRadiationTypical: 'Right shoulder' }], progressionRule: 'Can rupture into peritoneum or pleural space if untreated.' },
  features: { symptoms: [sym('pain_initial_location', 0.8, 0.55, { stageRelevance: [1] }), sym('pain_location_now', 0.8, 0.55, { stageRelevance: [1] }), sym('fever_chills', 0.8, 0.85, { stageRelevance: [1] }), sym('fever', 0.8, 0.55, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }), sym('anorexia', 0.6, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.8, { stageRelevance: [1] }), sym('diarrhea', 0.3, 0.7, { stageRelevance: [1] }), sym('jaundice', 0.3, 0.85, { stageRelevance: [1] }), sym('cough', 0.3, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['cholecystitis', 'cholangitis', 'hepatitis', 'pancreatitis', 'pneumonia'], distinguishingFeatures: [{ fromDiseaseId: 'cholecystitis', featureIds: ['fever_chills', 'jaundice'] }, { fromDiseaseId: 'cholangitis', featureIds: ['fever_chills', 'jaundice'] }], neverCloseConditions: [] },
  complications: [{ name: 'Rupture', warningFeatures: ['peritonism', 'fever_chills'], riskFactors: [], timeWindowHours: [72, 168], severityTier: 'critical', description: 'Abscess ruptures into peritoneum causing peritonitis.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever_chills', 'peritonism'],
};

export const hcc: DiseaseNode = {
  id: 'hcc', name: 'Hepatocellular Carcinoma', icdCode: 'C22.0', system: 'medical',
  organSystem: 'hepatobiliary', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 90, agePeak: [50, 70], sexRisk: { male: 3, female: 1 }, backgroundPrevalence: 0.002, geographicFlags: ['hbv_endemic'], riskFactors: [] },
  pathophysiology: { mechanism: 'Malignant transformation of hepatocytes in the setting of chronic liver disease (cirrhosis from HBV, HCV, alcohol, NAFLD). Presents with RUQ pain, weight loss, abdominal distension from ascites, and jaundice.', timelineStages: [{ stageId: 1, label: 'Symptomatic', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('pain_initial_location', 0.6, 0.5), sym('weight_loss', 0.7, 0.85), sym('abdominal_distension', 0.5, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull ache', painLocationTypical: 'Right upper quadrant', painRadiationTypical: 'Right shoulder' }], progressionRule: 'Advanced at diagnosis often. Surveillance in cirrhotics improves detection.' },
  features: { symptoms: [sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('abdominal_distension', 0.5, 0.7, { stageRelevance: [1] }), sym('jaundice', 0.4, 0.85, { stageRelevance: [1] }), sym('anorexia', 0.6, 0.5, { stageRelevance: [1] }), sym('fatigue', 0.6, 0.5, { stageRelevance: [1] }), sym('nausea', 0.3, 0.5, { stageRelevance: [1] }), sym('fever', 0.2, 0.55, { stageRelevance: [1] }), sym('alcohol_use', 0.4, 0.7, { stageRelevance: [1] }), sym('prior_abdominal_surgery', 0.1, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hepatitis', 'liver_abscess', 'pancreatic_cancer', 'metastatic_liver_disease'], distinguishingFeatures: [{ fromDiseaseId: 'hepatitis', featureIds: ['weight_loss', 'fever'] }], neverCloseConditions: [] },
  complications: [{ name: 'Tumour rupture', warningFeatures: ['syncope', 'peritonism'], riskFactors: ['large_tumour'], timeWindowHours: [0, 24], severityTier: 'critical', description: 'Haemoperitoneum from ruptured HCC.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'jaundice', 'abdominal_distension'],
};

export const buddChiari: DiseaseNode = {
  id: 'budd_chiari', name: 'Budd-Chiari Syndrome', icdCode: 'I82.0', system: 'medical',
  organSystem: 'hepatobiliary', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 60, agePeak: [30, 45], sexRisk: { male: 0.8, female: 1.2 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Hepatic venous outflow obstruction causing hepatomegaly, abdominal pain, and ascites. Can be acute or chronic. Associated with hypercoagulable states (thrombophilia, pregnancy, OCPs, myeloproliferative disorders).', timelineStages: [{ stageId: 1, label: 'Acute', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('pain_onset', 0.7, 0.5), sym('pain_initial_location', 0.7, 0.5), sym('abdominal_distension', 0.8, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Constant, RUQ', painLocationTypical: 'Right upper quadrant', painRadiationTypical: 'None' }], progressionRule: 'Rapid onset of ascites and liver failure without intervention.' },
  features: { symptoms: [sym('pain_onset', 0.7, 0.5, { stageRelevance: [1] }), sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }), sym('abdominal_distension', 0.8, 0.7, { stageRelevance: [1] }), sym('jaundice', 0.5, 0.85, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }), sym('fever', 0.3, 0.55, { stageRelevance: [1] }), sym('htn_cad', 0.2, 0.65, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.3, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hepatitis', 'liver_abscess', 'hcc', 'congestive_hepatomegaly', 'cirrhosis'], distinguishingFeatures: [{ fromDiseaseId: 'hepatitis', featureIds: ['abdominal_distension', 'pain_onset'] }], neverCloseConditions: [] },
  complications: [{ name: 'Fulminant liver failure', warningFeatures: ['jaundice', 'abdominal_distension'], riskFactors: [], timeWindowHours: [72, 168], severityTier: 'critical', description: 'Rapidly progressive liver failure requiring transplant.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope'],
};

// ── PANCREATIC ───────────────────────────────────────────────

export const chronicPancreatitis: DiseaseNode = {
  id: 'chronic_pancreatitis', name: 'Chronic Pancreatitis', icdCode: 'K86.1', system: 'medical',
  organSystem: 'pancreatic', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 80, agePeak: [40, 60], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Progressive fibroinflammatory destruction of the pancreas, most commonly from chronic alcohol consumption. Presents with chronic epigastric pain radiating to back, steatorrhoea, and diabetes. Pain is often relapsing and may be severe.', timelineStages: [{ stageId: 1, label: 'Relapsing pain', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('pain_initial_location', 0.8, 0.5), sym('pain_character', 0.6, 0.55), sym('pain_radiation', 0.7, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Boring epigastric, radiates to back', painLocationTypical: 'Epigastrium', painRadiationTypical: 'Straight through to back' }], progressionRule: 'Progressive with loss of exocrine and endocrine function.' },
  features: { symptoms: [sym('pain_initial_location', 0.8, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.55, { stageRelevance: [1] }), sym('pain_radiation', 0.7, 0.85, { stageRelevance: [1] }), sym('pain_severity', 0.6, 0.4, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.8, { stageRelevance: [1] }), sym('diarrhea', 0.4, 0.6, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.7, 0.7, { stageRelevance: [1] }), sym('alcohol_use', 0.7, 0.75, { stageRelevance: [1] }), sym('smoking', 0.5, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('pain_radiation', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'No back radiation less likely pancreatic' })] },
  differential: { mimics: ['acute_pancreatitis', 'peptic_ulcer_disease', 'pancreatic_cancer', 'cholecystitis'], distinguishingFeatures: [{ fromDiseaseId: 'acute_pancreatitis', featureIds: ['previous_similar_episodes', 'alcohol_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Pseudocyst', warningFeatures: ['abdominal_distension', 'pain_location_now'], riskFactors: ['alcohol_use'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Fluid collection requiring drainage.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss'],
};

export const pancreaticPseudocyst: DiseaseNode = {
  id: 'pancreatic_pseudocyst', name: 'Pancreatic Pseudocyst', icdCode: 'K86.3', system: 'medical',
  organSystem: 'pancreatic', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 70, agePeak: [30, 50], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'A fluid collection with a fibrous wall in or near the pancreas, usually complicating acute pancreatitis 4-6 weeks after onset. Presents with epigastric pain, fullness, and nausea.', timelineStages: [{ stageId: 1, label: 'Formed pseudocyst', typicalHoursFromOnset: [672, 1008], dominantSymptoms: [sym('pain_initial_location', 0.7, 0.5), sym('abdominal_distension', 0.5, 0.6), sym('nausea', 0.5, 0.5)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Dull, epigastric', painLocationTypical: 'Epigastrium', painRadiationTypical: 'To back' }], progressionRule: 'May resolve, persist, or become infected/rupture.' },
  features: { symptoms: [sym('pain_initial_location', 0.7, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.4, 0.5, { stageRelevance: [1] }), sym('abdominal_distension', 0.5, 0.6, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }), sym('fever', 0.3, 0.55, { stageRelevance: [1] }), sym('weight_loss', 0.3, 0.7, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.5, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['acute_pancreatitis', 'pancreatic_cancer', 'chronic_pancreatitis', 'splenic_abscess'], distinguishingFeatures: [{ fromDiseaseId: 'acute_pancreatitis', featureIds: ['previous_similar_episodes', 'abdominal_distension'] }], neverCloseConditions: [] },
  complications: [{ name: 'Infection', warningFeatures: ['fever_chills', 'peritonism'], riskFactors: [], timeWindowHours: [168, 720], severityTier: 'severe', description: 'Infected pseudocyst requiring drainage.' }, { name: 'Rupture', warningFeatures: ['peritonism', 'syncope'], riskFactors: [], timeWindowHours: [0, 24], severityTier: 'critical', description: 'Pseudocyst rupture causing peritonitis.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever_chills', 'peritonism'],
};

// ── RENAL ─────────────────────────────────────────────────────

export const renalAbscess: DiseaseNode = {
  id: 'renal_abscess', name: 'Renal / Perinephric Abscess', icdCode: 'N15.1', system: 'urological',
  organSystem: 'renal', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 70, agePeak: [30, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Localised pus collection within the renal parenchyma or perinephric space, often complicating pyelonephritis or renal stones. Presents with flank pain, high fever, rigors, and dysuria.', timelineStages: [{ stageId: 1, label: 'Acute abscess', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('flank_pain', 0.8, 0.75), sym('fever_chills', 0.8, 0.85), sym('fever', 0.8, 0.55)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Constant, severe flank', painLocationTypical: 'Flank / CVA angle', painRadiationTypical: 'To groin or abdomen' }], progressionRule: 'Can progress to sepsis without drainage.' },
  features: { symptoms: [sym('flank_pain', 0.8, 0.75, { stageRelevance: [1] }), sym('fever_chills', 0.8, 0.85, { stageRelevance: [1] }), sym('fever', 0.8, 0.55, { stageRelevance: [1] }), sym('dysuria', 0.5, 0.7, { stageRelevance: [1] }), sym('urinary_frequency', 0.4, 0.65, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }), sym('pain_initial_location', 0.6, 0.5, { stageRelevance: [1] }), sym('pain_radiation', 0.4, 0.7, { stageRelevance: [1] }), sym('diabetes', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['pyelonephritis', 'ureteric_colic', 'cholecystitis', 'pancreatitis'], distinguishingFeatures: [{ fromDiseaseId: 'pyelonephritis', featureIds: ['fever_chills', 'pain_character'] }], neverCloseConditions: [] },
  complications: [{ name: 'Sepsis', warningFeatures: ['fever_chills', 'syncope'], riskFactors: ['diabetes'], timeWindowHours: [24, 72], severityTier: 'critical', description: 'Systemic infection from renal source.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever_chills', 'syncope'],
};

export const hydronephrosis: DiseaseNode = {
  id: 'hydronephrosis', name: 'Hydronephrosis', icdCode: 'N13.3', system: 'urological',
  organSystem: 'renal', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [30, 60], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Dilation of the renal pelvis and calyces due to obstruction of urine outflow. Causes include stones, tumours, strictures, and BPH. Presents with flank pain, urinary symptoms, and if severe, renal impairment.', timelineStages: [{ stageId: 1, label: 'Obstructed', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('flank_pain', 0.7, 0.7), sym('pain_character', 0.5, 0.5), sym('urinary_retention', 0.4, 0.8)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull ache or colicky', painLocationTypical: 'Flank', painRadiationTypical: 'To groin' }], progressionRule: 'Prolonged obstruction causes irreversible renal damage.' },
  features: { symptoms: [sym('flank_pain', 0.7, 0.7, { stageRelevance: [1] }), sym('pain_initial_location', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_radiation', 0.4, 0.7, { stageRelevance: [1] }), sym('urinary_retention', 0.4, 0.8, { stageRelevance: [1] }), sym('dysuria', 0.3, 0.7, { stageRelevance: [1] }), sym('hematuria', 0.3, 0.8, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ureteric_colic', 'pyelonephritis', 'renal_abscess', 'ovarian_torsion'], distinguishingFeatures: [{ fromDiseaseId: 'ureteric_colic', featureIds: ['pain_character', 'fever'] }], neverCloseConditions: [] },
  complications: [{ name: 'Renal failure', warningFeatures: ['urinary_retention'], riskFactors: ['solitary_kidney', 'bilateral_obstruction'], timeWindowHours: [72, 720], severityTier: 'severe', description: 'Irreversible renal damage from prolonged obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever_chills', 'urinary_retention'],
};

// ── INFECTIOUS SYSTEMIC ───────────────────────────────────────

export const malaria: DiseaseNode = {
  id: 'malaria', name: 'Malaria', icdCode: 'B50', system: 'infectious',
  organSystem: 'infectious', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 0, ageMax: 90, agePeak: [0, 10], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.01, geographicFlags: ['endemic_malaria', 'tropical'], riskFactors: [] },
  pathophysiology: { mechanism: 'Plasmodium infection transmitted by Anopheles mosquito. Causes cyclical fevers, rigors, and haemolysis. Abdominal pain occurs from splenic enlargement, infarction, or rupture, and from hepatic congestion.', timelineStages: [{ stageId: 1, label: 'Acute malaria', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('fever_chills', 0.9, 0.85), sym('fever', 0.9, 0.55), sym('pain_initial_location', 0.3, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull, diffuse', painLocationTypical: 'Diffuse, LUQ if splenic', painRadiationTypical: 'None' }], progressionRule: 'Can progress to severe malaria with organ failure.' },
  features: { symptoms: [sym('fever_chills', 0.9, 0.85, { stageRelevance: [1] }), sym('fever', 0.9, 0.55, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }), sym('diarrhea', 0.3, 0.7, { stageRelevance: [1] }), sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }), sym('fatigue', 0.7, 0.5, { stageRelevance: [1] }), sym('headache', 0.7, 0.5, { stageRelevance: [1] }), sym('recent_travel', 0.8, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('fever_chills', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No fever/rigors makes malaria unlikely' })], supporting: [] },
  differential: { mimics: ['gastroenteritis', 'hepatitis', 'typhoid', 'dengue', 'leptospirosis', 'pneumonia'], distinguishingFeatures: [{ fromDiseaseId: 'gastroenteritis', featureIds: ['fever_chills', 'recent_travel'] }], neverCloseConditions: [] },
  complications: [{ name: 'Cerebral malaria', warningFeatures: ['syncope'], riskFactors: ['p_falciparum'], timeWindowHours: [24, 72], severityTier: 'critical', description: 'Parasitised RBCs sequester in cerebral microvasculature.' }, { name: 'Splenic rupture', warningFeatures: ['syncope', 'peritonism'], riskFactors: ['massive_splenomegaly'], timeWindowHours: [72, 336], severityTier: 'critical', description: 'Spontaneous rupture of enlarged spleen.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope'],
};

export const dengue: DiseaseNode = {
  id: 'dengue', name: 'Dengue Fever', icdCode: 'A90', system: 'infectious',
  organSystem: 'infectious', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 0, ageMax: 90, agePeak: [5, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, geographicFlags: ['endemic_dengue', 'tropical'], riskFactors: [] },
  pathophysiology: { mechanism: 'Flavivirus transmitted by Aedes mosquito. Causes high fever, severe myalgia (breakbone fever), retro-orbital pain, and rash. Abdominal pain can occur from hepatitis, plasma leakage, or gall bladder oedema in severe dengue.', timelineStages: [{ stageId: 1, label: 'Febrile phase', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('fever', 0.9, 0.55), sym('pain_character', 0.3, 0.5), sym('skin_rash', 0.5, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Diffuse myalgia and arthralgia', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Can progress to severe dengue with plasma leakage, haemorrhage, organ impairment.' },
  features: { symptoms: [sym('fever', 0.9, 0.55, { stageRelevance: [1] }), sym('fever_chills', 0.6, 0.8, { stageRelevance: [1] }), sym('skin_rash', 0.5, 0.85, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }), sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }), sym('abdominal_distension', 0.3, 0.6, { stageRelevance: [1] }), sym('hematochezia', 0.2, 0.9, { stageRelevance: [1] }), sym('recent_travel', 0.8, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['malaria', 'typhoid', 'gastroenteritis', 'hepatitis', 'leptospirosis'], distinguishingFeatures: [{ fromDiseaseId: 'malaria', featureIds: ['skin_rash'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe dengue / DSS', warningFeatures: ['syncope', 'abdominal_distension', 'hematochezia'], riskFactors: ['children', 'second_infection'], timeWindowHours: [72, 168], severityTier: 'critical', description: 'Plasma leakage causing shock and organ failure.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope', 'hematochezia'],
};

export const leptospirosis: DiseaseNode = {
  id: 'leptospirosis', name: 'Leptospirosis', icdCode: 'A27', system: 'infectious',
  organSystem: 'infectious', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 10, ageMax: 70, agePeak: [20, 50], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.001, geographicFlags: ['endemic_leptospirosis', 'tropical', 'farming_regions'], riskFactors: [] },
  pathophysiology: { mechanism: 'Spirochaete infection from water contaminated with rodent urine. Causes biphasic illness: acute leptospiraemic phase with fever, myalgia, conjunctival suffusion, then immune phase with meningitis, uveitis, and organ dysfunction. Abdominal pain from hepatitis, myositis, or renal involvement.', timelineStages: [{ stageId: 1, label: 'Leptospiraemic', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('fever_chills', 0.8, 0.8), sym('fever', 0.8, 0.55), sym('pain_initial_location', 0.3, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Diffuse muscle and abdominal pain', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Can progress to Weil disease with jaundice, renal failure, and haemorrhage.' },
  features: { symptoms: [sym('fever_chills', 0.8, 0.8, { stageRelevance: [1] }), sym('fever', 0.8, 0.55, { stageRelevance: [1] }), sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }), sym('jaundice', 0.5, 0.85, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.55, { stageRelevance: [1] }), sym('cough', 0.4, 0.7, { stageRelevance: [1] }), sym('joint_pain', 0.5, 0.8, { stageRelevance: [1] }), sym('headache', 0.7, 0.5, { stageRelevance: [1] }), sym('recent_travel', 0.5, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['malaria', 'dengue', 'hepatitis', 'typhoid', 'brucellosis'], distinguishingFeatures: [{ fromDiseaseId: 'malaria', featureIds: ['jaundice', 'joint_pain'] }], neverCloseConditions: [] },
  complications: [{ name: 'Weil disease', warningFeatures: ['jaundice', 'syncope'], riskFactors: [], timeWindowHours: [72, 168], severityTier: 'critical', description: 'Severe form with jaundice, renal failure, and haemorrhage.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope', 'jaundice'],
};

export const brucellosis: DiseaseNode = {
  id: 'brucellosis', name: 'Brucellosis', icdCode: 'A23', system: 'infectious',
  organSystem: 'infectious', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 10, ageMax: 70, agePeak: [20, 50], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.001, geographicFlags: ['endemic_brucellosis', 'mediterranean'], riskFactors: [] },
  pathophysiology: { mechanism: 'Brucella species infection from unpasteurised dairy or animal contact. Presents with undulant fever, night sweats, arthralgia, and abdominal pain from hepatosplenomegaly, lymphadenitis, or spinal involvement.', timelineStages: [{ stageId: 1, label: 'Acute', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('fever', 0.9, 0.55), sym('night_sweats', 0.7, 0.85), sym('joint_pain', 0.7, 0.8)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull, diffuse', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'May become chronic with relapsing symptoms.' },
  features: { symptoms: [sym('fever', 0.9, 0.55, { stageRelevance: [1] }), sym('night_sweats', 0.7, 0.85, { stageRelevance: [1] }), sym('joint_pain', 0.7, 0.8, { stageRelevance: [1] }), sym('fatigue', 0.8, 0.5, { stageRelevance: [1] }), sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.8, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.3, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['malaria', 'typhoid', 'abdominal_tb', 'hcc', 'lymphoma'], distinguishingFeatures: [{ fromDiseaseId: 'malaria', featureIds: ['night_sweats', 'joint_pain'] }], neverCloseConditions: [] },
  complications: [{ name: 'Spondylodiscitis', warningFeatures: ['joint_pain'], riskFactors: [], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Spinal infection causing back pain.' }],
  clinicalScores: [], redFlagFeatureIds: [],
};

// ── CARDIOTHORACIC ────────────────────────────────────────────

export const pericarditis: DiseaseNode = {
  id: 'pericarditis', name: 'Acute Pericarditis', icdCode: 'I30', system: 'medical',
  organSystem: 'cardiovascular', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 70, agePeak: [20, 50], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Inflammation of the pericardium causing sharp retrosternal or epigastric pain that is pleuritic and positional (worse supine, better sitting forward). Can radiate to the abdomen, mimicking an acute abdomen.', timelineStages: [{ stageId: 1, label: 'Acute', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('chest_pain', 0.9, 0.8), sym('pain_character', 0.6, 0.55), sym('pain_radiation', 0.4, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Sharp, pleuritic, worse lying flat', painLocationTypical: 'Retrosternal or epigastric', painRadiationTypical: 'To left shoulder or abdomen' }], progressionRule: 'Usually self-limiting. Can recur or progress to constrictive pericarditis.' },
  features: { symptoms: [sym('chest_pain', 0.9, 0.8, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.55, { stageRelevance: [1] }), sym('pain_initial_location', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_radiation', 0.4, 0.7, { stageRelevance: [1] }), sym('dyspnea', 0.5, 0.7, { stageRelevance: [1] }), sym('fever', 0.5, 0.55, { stageRelevance: [1] }), sym('cough', 0.3, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('chest_pain', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05 })], supporting: [] },
  differential: { mimics: ['mi', 'pleurisy', 'pneumonia', 'gerd', 'peptic_ulcer_disease'], distinguishingFeatures: [{ fromDiseaseId: 'mi', featureIds: ['pain_character', 'pain_relieving_factors'] }], neverCloseConditions: ['mi'] },
  complications: [{ name: 'Cardiac tamponade', warningFeatures: ['dyspnea', 'syncope'], riskFactors: [], timeWindowHours: [24, 168], severityTier: 'critical', description: 'Pericardial effusion causing haemodynamic compromise.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope', 'dyspnea'],
};

// ── PAEDIATRIC ────────────────────────────────────────────────

export const nec: DiseaseNode = {
  id: 'nec', name: 'Necrotising Enterocolitis', icdCode: 'P77', system: 'paediatric',
  organSystem: 'GI', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 0, ageMax: 0, agePeak: [0, 0], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Ischaemic necrosis of the intestinal mucosa in premature neonates. Presents with abdominal distension, feeding intolerance, bloody stools, and pneumatosis intestinalis. Surgical emergency.', timelineStages: [{ stageId: 1, label: 'Suspected NEC', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('abdominal_distension', 0.8, 0.7), sym('hematochezia', 0.5, 0.9), sym('vomiting', 0.6, 0.5)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Infant distress', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Can progress rapidly to perforation and peritonitis.' },
  features: { symptoms: [sym('abdominal_distension', 0.8, 0.7, { stageRelevance: [1] }), sym('hematochezia', 0.5, 0.9, { stageRelevance: [1] }), sym('vomiting', 0.6, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.3, 0.7, { stageRelevance: [1] }), sym('fever', 0.4, 0.55, { stageRelevance: [1] }), sym('fever_chills', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['intussusception', 'meconium_ileus', 'malrotation', 'hirschsprung'], distinguishingFeatures: [{ fromDiseaseId: 'intussusception', featureIds: ['abdominal_distension', 'hematochezia'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal perforation', warningFeatures: ['peritonism', 'syncope'], riskFactors: ['prematurity'], timeWindowHours: [24, 72], severityTier: 'critical', description: 'Bowel perforation requiring surgical resection.' }],
  clinicalScores: [], redFlagFeatureIds: ['peritonism', 'hematochezia'],
};

export const malrotation: DiseaseNode = {
  id: 'malrotation', name: 'Intestinal Malrotation with Midgut Volvulus', icdCode: 'Q43.3', system: 'paediatric',
  organSystem: 'GI', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 0, ageMax: 1, agePeak: [0, 0], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Incomplete rotation of the midgut during embryogenesis leaves the bowel prone to twisting (volvulus) around the SMA. Presents in the first weeks of life with bilious vomiting, abdominal distension, and shock. Surgical emergency.', timelineStages: [{ stageId: 1, label: 'Volvulus', typicalHoursFromOnset: [0, 12], dominantSymptoms: [sym('vomiting_description', 0.8, 0.8), sym('vomiting', 0.9, 0.5), sym('abdominal_distension', 0.6, 0.6)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Infant distress', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Can progress to bowel necrosis within hours.' },
  features: { symptoms: [sym('vomiting', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.8, 0.8, { stageRelevance: [1] }), sym('vomiting_timing', 0.6, 0.6, { stageRelevance: [1] }), sym('abdominal_distension', 0.6, 0.6, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.85, { stageRelevance: [1] }), sym('fever', 0.3, 0.55, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['intussusception', 'nec', 'meconium_ileus', 'gastric_outlet_obstruction'], distinguishingFeatures: [{ fromDiseaseId: 'intussusception', featureIds: ['vomiting_description', 'age'] }], neverCloseConditions: [] },
  complications: [{ name: 'Bowel necrosis', warningFeatures: ['peritonism', 'syncope', 'hematochezia'], riskFactors: ['delayed_surgery'], timeWindowHours: [6, 24], severityTier: 'critical', description: 'Ischaemic necrosis requiring massive resection.' }],
  clinicalScores: [], redFlagFeatureIds: ['peritonism', 'syncope'],
};

export const hirschsprung: DiseaseNode = {
  id: 'hirschsprung', name: 'Hirschsprung Disease', icdCode: 'Q43.1', system: 'paediatric',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 0, ageMax: 10, agePeak: [0, 0], sexRisk: { male: 4, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Congenital absence of ganglion cells in the distal colonic myenteric plexus, causing functional obstruction. Presents in neonates with failure to pass meconium within 48h, abdominal distension, and bilious vomiting.', timelineStages: [{ stageId: 1, label: 'Neonatal obstruction', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('abdominal_distension', 0.8, 0.7), sym('obstipation', 0.7, 0.8), sym('vomiting', 0.6, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Infant distress', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Can present later in childhood with chronic constipation.' },
  features: { symptoms: [sym('abdominal_distension', 0.8, 0.7, { stageRelevance: [1] }), sym('obstipation', 0.7, 0.8, { stageRelevance: [1] }), sym('constipation', 0.8, 0.7, { stageRelevance: [1] }), sym('vomiting', 0.6, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['meconium_ileus', 'intestinal_obstruction', 'constipation_simple', 'nec'], distinguishingFeatures: [{ fromDiseaseId: 'constipation_simple', featureIds: ['obstipation', 'age'] }], neverCloseConditions: [] },
  complications: [{ name: 'Enterocolitis', warningFeatures: ['fever', 'hematochezia', 'abdominal_distension'], riskFactors: [], timeWindowHours: [72, 720], severityTier: 'critical', description: 'Life-threatening inflammation of the colon.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever_chills'],
};

export const ascariasis: DiseaseNode = {
  id: 'ascariasis', name: 'Ascariasis (Worm Infestation)', icdCode: 'B77', system: 'infectious',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 60, agePeak: [2, 15], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.01, geographicFlags: ['tropical'], riskFactors: [] },
  pathophysiology: { mechanism: 'Ascaris lumbricoides infection from faecal-oral transmission. Worms in the small intestine can cause abdominal pain, malnutrition, and intestinal obstruction when heavy burden. Migration can cause biliary obstruction or pancreatitis.', timelineStages: [{ stageId: 1, label: 'Intestinal phase', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('pain_character', 0.4, 0.5), sym('pain_initial_location', 0.3, 0.5), sym('vomiting', 0.3, 0.5)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Cramping, periumbilical', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Chronic burden leads to malnutrition and obstruction.' },
  features: { symptoms: [sym('pain_character', 0.4, 0.5, { stageRelevance: [1] }), sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.3, 0.5, { stageRelevance: [1] }), sym('diarrhea', 0.3, 0.6, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.7, { stageRelevance: [1] }), sym('abdominal_distension', 0.3, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['gastroenteritis', 'ibs', 'coeliac_disease', 'food_poisoning'], distinguishingFeatures: [{ fromDiseaseId: 'gastroenteritis', featureIds: ['recent_travel', 'age'] }], neverCloseConditions: [] },
  complications: [{ name: 'Bowel obstruction', warningFeatures: ['vomiting', 'obstipation', 'abdominal_distension'], riskFactors: ['heavy_burden'], timeWindowHours: [720, 4320], severityTier: 'severe', description: 'Worm ball causes mechanical obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
};

// ── PSYCHIATRIC / FUNCTIONAL ──────────────────────────────────

export const functionalAbdominalPain: DiseaseNode = {
  id: 'functional_abdominal_pain', name: 'Functional Abdominal Pain', icdCode: 'R10.8', system: 'psychiatric',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 5, ageMax: 60, agePeak: [10, 30], sexRisk: { male: 0.6, female: 1.4 }, backgroundPrevalence: 0.05, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic or recurrent abdominal pain without identifiable organic pathology. Believed to involve visceral hyperalgesia, altered brain-gut signalling, and psychosocial stressors. Pain is real but no structural disease is found.', timelineStages: [{ stageId: 1, label: 'Symptomatic', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('pain_character', 0.4, 0.5), sym('pain_initial_location', 0.3, 0.5), sym('previous_similar_episodes', 0.8, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Vague, variable', painLocationTypical: 'Variable, diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic course. No progression to organic disease.' },
  features: { symptoms: [sym('pain_character', 0.4, 0.5, { stageRelevance: [1] }), sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.8, 0.7, { stageRelevance: [1] }), sym('pain_severity', 0.4, 0.4, { stageRelevance: [1] }), sym('nausea', 0.3, 0.5, { stageRelevance: [1] }), sym('bloating', 0.4, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ibs', 'functional_dyspepsia', 'endometriosis', 'chronic_pancreatitis'], distinguishingFeatures: [{ fromDiseaseId: 'ibs', featureIds: ['bowel_habits', 'stool_relief'] }], neverCloseConditions: [] },
  complications: [], clinicalScores: [], redFlagFeatureIds: [],
};

// ── TOXICOLOGICAL ─────────────────────────────────────────────

export const organophosphate: DiseaseNode = {
  id: 'organophosphate', name: 'Organophosphate Poisoning', icdCode: 'T60.0', system: 'toxicological',
  organSystem: 'toxicological', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 0, ageMax: 90, agePeak: [20, 50], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.001, geographicFlags: ['farming_regions'], riskFactors: [] },
  pathophysiology: { mechanism: 'Acetylcholinesterase inhibition by organophosphate compounds (pesticides) causes cholinergic crisis with excessive muscarinic and nicotinic stimulation. Presents with abdominal pain, vomiting, diarrhoea, excessive secretions, miosis, and muscle fasciculations.', timelineStages: [{ stageId: 1, label: 'Cholinergic crisis', typicalHoursFromOnset: [0, 6], dominantSymptoms: [sym('vomiting', 0.7, 0.5), sym('diarrhea', 0.6, 0.7), sym('pain_character', 0.4, 0.5)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Cramping diffuse', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Respiratory failure and death without prompt atropine and pralidoxime.' },
  features: { symptoms: [sym('vomiting', 0.7, 0.5, { stageRelevance: [1] }), sym('diarrhea', 0.6, 0.7, { stageRelevance: [1] }), sym('pain_character', 0.4, 0.5, { stageRelevance: [1] }), sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }), sym('nausea', 0.6, 0.5, { stageRelevance: [1] }), sym('dyspnea', 0.6, 0.7, { stageRelevance: [1] }), sym('cough', 0.5, 0.7, { stageRelevance: [1] }), sym('syncope', 0.4, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['gastroenteritis', 'food_poisoning', 'pancreatitis', 'dka'], distinguishingFeatures: [{ fromDiseaseId: 'gastroenteritis', featureIds: ['dyspnea', 'syncope'] }], neverCloseConditions: [] },
  complications: [{ name: 'Respiratory failure', warningFeatures: ['dyspnea', 'syncope'], riskFactors: [], timeWindowHours: [0, 6], severityTier: 'critical', description: 'Respiratory muscle paralysis and secretions causing airway compromise.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope', 'dyspnea'],
};

// ── VASCULAR ──────────────────────────────────────────────────

export const vasculitis: DiseaseNode = {
  id: 'vasculitis_pan', name: 'Polyarteritis Nodosa / Vasculitis', icdCode: 'M30.0', system: 'medical',
  organSystem: 'cardiovascular', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 70, agePeak: [40, 60], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Systemic necrotising vasculitis of medium-sized arteries causing ischaemia, infarction, and inflammation in multiple organs. Abdominal pain from mesenteric involvement (ischaemia), hepatic, or renal infarction, or gastrointestinal bleeding.', timelineStages: [{ stageId: 1, label: 'Active vasculitis', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('pain_character', 0.3, 0.5), sym('fever', 0.5, 0.55), sym('joint_pain', 0.6, 0.8)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Diffuse, variable', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Can cause life-threatening organ ischaemia.' },
  features: { symptoms: [sym('pain_character', 0.3, 0.5, { stageRelevance: [1] }), sym('fever', 0.5, 0.55, { stageRelevance: [1] }), sym('joint_pain', 0.6, 0.8, { stageRelevance: [1] }), sym('skin_rash', 0.4, 0.8, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.8, { stageRelevance: [1] }), sym('fatigue', 0.6, 0.5, { stageRelevance: [1] }), sym('hematochezia', 0.2, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['henoch_schonlein_purpura', 'mesenteric_ischaemia', 'sickle_cell_crisis', 'porphyria'], distinguishingFeatures: [{ fromDiseaseId: 'henoch_schonlein_purpura', featureIds: ['joint_pain', 'skin_rash'] }], neverCloseConditions: [] },
  complications: [{ name: 'Mesenteric ischaemia', warningFeatures: ['pain_severity', 'hematochezia', 'peritonism'], riskFactors: [], timeWindowHours: [72, 720], severityTier: 'critical', description: 'Vasculitic involvement of mesenteric vessels causing bowel ischaemia.' }],
  clinicalScores: [], redFlagFeatureIds: ['hematochezia', 'peritonism'],
};

// ── EXPORT ────────────────────────────────────────────────────
export const REMAINING_NODES: DiseaseNode[] = [
  gerd, esophagitis, achalasia, malloryWeiss,
  functionalDyspepsia, gastricCancer,
  liverAbscess, hcc, buddChiari,
  chronicPancreatitis, pancreaticPseudocyst,
  renalAbscess, hydronephrosis,
  malaria, dengue, leptospirosis, brucellosis,
  pericarditis,
  nec, malrotation, hirschsprung, ascariasis,
  functionalAbdominalPain,
  organophosphate,
  vasculitis,
];
