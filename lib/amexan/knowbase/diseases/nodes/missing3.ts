import type { DiseaseNode, FeatureRecord, VomitingManifestation } from '../../diseaseNode';
import { getFeature, getLrPlus, getLrMinus } from '../../features/featureLibrary';

function feat(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  const base = getFeature(id);
  return { ...base, sensitivity: sens, specificity: spec, LR_positive: getLrPlus({ ...base, sensitivity: sens, specificity: spec }), LR_negative: getLrMinus({ ...base, sensitivity: sens, specificity: spec }), ...overrides };
}
function sym(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  return feat(id, sens, spec, { ...overrides, category: 'symptom' });
}

export const meningitis: DiseaseNode = {
  id: 'meningitis', name: 'Meningitis', icdCode: 'G03.9', system: 'medical',
  organSystem: 'neurological', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 0, ageMax: 90, agePeak: [0, 25], sexRisk: { male: 1.2, female: 0.8 }, backgroundPrevalence: 0.0005, riskFactors: [{ featureId: 'hiv_status', label: 'Immunosuppression', LR_positive: 3.0, prevalenceInDisease: 0.15 }, { featureId: 'recent_travel', label: 'Close contact with case', LR_positive: 5.0, prevalenceInDisease: 0.1 }] },
  pathophysiology: { mechanism: 'Inflammation of the meninges caused by bacterial (N. meningitidis, S. pneumoniae, H. influenzae), viral, or fungal infection. Presents with fever, severe headache, neck stiffness, photophobia, and vomiting. Vomiting is often projectile and may precede other symptoms.', timelineStages: [{ stageId: 1, label: 'Early meningitis', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('fever', 0.9, 0.5), sym('headache', 0.9, 0.5), sym('vomiting', 0.7, 0.5)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Severe headache is the dominant symptom', painLocationTypical: 'Head (may have abdominal pain in children)', painRadiationTypical: 'Neck' }], progressionRule: 'Rapid progression over hours to days. Mortality 10-50% without treatment.' },
  features: { symptoms: [sym('fever', 0.9, 0.5, { stageRelevance: [1] }), sym('headache', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.7, 0.5, { stageRelevance: [1] }), sym('vomiting_timing', 0.4, 0.5, { stageRelevance: [1] }), sym('vomiting_projectile', 0.3, 0.8, { stageRelevance: [1] }), sym('vomiting_frequency', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.3, 0.5, { stageRelevance: [1] }), sym('syncope', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['migraine', 'raised_icp', 'gastroenteritis', 'sepsis'], distinguishingFeatures: [{ fromDiseaseId: 'migraine', featureIds: ['fever', 'syncope'] }, { fromDiseaseId: 'raised_icp', featureIds: ['fever', 'headache'] }], neverCloseConditions: [] },
  complications: [{ name: 'Septic shock', warningFeatures: ['syncope', 'fever'], riskFactors: [], timeWindowHours: [0, 48], severityTier: 'critical', description: 'Meningococcal sepsis with purpura fulminans.' }, { name: 'Raised ICP', warningFeatures: ['syncope', 'vomiting_projectile'], riskFactors: [], timeWindowHours: [12, 72], severityTier: 'critical', description: 'Cerebral oedema causing herniation.' }],
  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
  vomitingManifestation: {
    timingRelativeToPain: 'before', typicalFrequency: 'moderate_3_5',
    bilious: 'sometimes', projectile: 'often', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'unrelated',
    morningPredominance: true, typicalAppearance: 'stomach_contents',
    associatedNausea: 'always', vomitingIsPrimary: false,
    typicalDescription: 'Vomiting may precede headache. Often projectile. Worse in the morning. Associated with severe headache, fever, and neck stiffness. Does not relieve symptoms.',
  },
};

export const sepsis: DiseaseNode = {
  id: 'sepsis', name: 'Sepsis / Systemic Inflammatory Response Syndrome', icdCode: 'R65.2', system: 'medical',
  organSystem: 'infectious', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 0, ageMax: 90, agePeak: [0, 65], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [{ featureId: 'hiv_status', label: 'Immunosuppression', LR_positive: 3.0, prevalenceInDisease: 0.2 }, { featureId: 'diabetes', label: 'Diabetes', LR_positive: 2.0, prevalenceInDisease: 0.2 }, { featureId: 'known_cancer', label: 'Malignancy', LR_positive: 2.5, prevalenceInDisease: 0.15 }] },
  pathophysiology: { mechanism: 'Life-threatening organ dysfunction caused by a dysregulated host response to infection. Can present with abdominal pain from an intra-abdominal source. Vomiting is common due to systemic inflammation, ileus, and metabolic disturbance.', timelineStages: [{ stageId: 1, label: 'Early sepsis', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('fever', 0.8, 0.5), sym('vomiting', 0.5, 0.5)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Variable — depends on source', painLocationTypical: 'Depends on source', painRadiationTypical: 'None' }], progressionRule: 'Can progress to septic shock and multi-organ failure within hours.' },
  features: { symptoms: [sym('fever', 0.8, 0.5, { stageRelevance: [1] }), sym('fever_chills', 0.6, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.4, 0.5, { stageRelevance: [1] }), sym('nausea', 0.6, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.3, 0.5, { stageRelevance: [1] }), sym('syncope', 0.4, 0.8, { stageRelevance: [1] }), sym('headache', 0.3, 0.5, { stageRelevance: [1] }), sym('anorexia', 0.5, 0.5, { stageRelevance: [1] }), sym('diarrhea', 0.3, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['gastroenteritis', 'pancreatitis', 'meningitis', 'dka'], distinguishingFeatures: [{ fromDiseaseId: 'gastroenteritis', featureIds: ['syncope', 'fever_chills'] }], neverCloseConditions: [] },
  complications: [{ name: 'Septic shock', warningFeatures: ['syncope'], riskFactors: [], timeWindowHours: [0, 24], severityTier: 'critical', description: 'Refractory hypotension requiring vasopressors.' }, { name: 'Multi-organ failure', warningFeatures: ['syncope'], riskFactors: [], timeWindowHours: [12, 72], severityTier: 'critical', description: 'Renal, respiratory, and cardiovascular failure.' }],
  clinicalScores: [{ name: 'qSOFA', items: [{ featureId: 'syncope', label: 'Altered mentation', pointsWhenPresent: 1 }, { featureId: 'urgency', label: 'RR >=22', pointsWhenPresent: 1 }, { featureId: 'syncope', label: 'SBP <=100', pointsWhenPresent: 1 }], interpretationThresholds: [{ maxScore: 1, label: 'Low risk' }, { maxScore: 2, label: 'Moderate risk' }, { maxScore: 3, label: 'High risk — sepsis likely' }], maxScore: 3 }],
  redFlagFeatureIds: ['syncope'],
  vomitingManifestation: {
    timingRelativeToPain: 'after', typicalFrequency: 'moderate_3_5',
    bilious: 'sometimes', projectile: 'sometimes', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'unrelated',
    morningPredominance: false, typicalAppearance: 'stomach_contents',
    associatedNausea: 'always', vomitingIsPrimary: false,
    typicalDescription: 'Vomiting is common in sepsis due to systemic inflammation, ileus, and metabolic disturbance. Typically non-projectile, may be bilious. Does not relieve symptoms.',
  },
};

export const pyloricStenosis: DiseaseNode = {
  id: 'pyloric_stenosis', name: 'Infantile Hypertrophic Pyloric Stenosis', icdCode: 'Q40.0', system: 'surgical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 0.05, ageMax: 0.5, agePeak: [0.1, 0.2], sexRisk: { male: 4, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [{ featureId: 'family_history_gi_cancer', label: 'Family history', LR_positive: 3.0, prevalenceInDisease: 0.15 }, { featureId: 'prior_abdominal_surgery', label: 'First-born male', LR_positive: 2.0, prevalenceInDisease: 0.4 }] },
  pathophysiology: { mechanism: 'Hypertrophy and hyperplasia of the pyloric muscle causing gastric outlet obstruction in infants 3-6 weeks old. Presents with progressive, non-bilious projectile vomiting after feeds. The infant remains hungry after vomiting (classic distinguishing feature from gastroenteritis).', timelineStages: [{ stageId: 1, label: 'Progressive obstruction', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('vomiting', 0.95, 0.5), sym('vomiting_projectile', 0.9, 0.7), sym('vomiting_relation_to_eating', 0.8, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'No abdominal pain — hungry after vomiting', painLocationTypical: 'Epigastric visible peristalsis', painRadiationTypical: 'None' }], progressionRule: 'Progressive dehydration and weight loss. Electrolyte disturbance (hypochloraemic metabolic alkalosis).' },
  features: { symptoms: [sym('vomiting', 0.95, 0.5, { stageRelevance: [1] }), sym('vomiting_projectile', 0.9, 0.7, { stageRelevance: [1] }), sym('vomiting_relation_to_eating', 0.8, 0.6, { stageRelevance: [1] }), sym('vomiting_frequency', 0.7, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.6, 0.6, { stageRelevance: [1] }), sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.4, 0.7, { stageRelevance: [1] }), sym('anorexia', 0.2, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('vomiting_bilious', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.4, label: 'Non-bilious vomiting supports gastric outlet cause' })], supporting: [] },
  differential: { mimics: ['gastroenteritis', 'gastric_outlet_obstruction', 'malrotation', 'gerd'], distinguishingFeatures: [{ fromDiseaseId: 'gastroenteritis', featureIds: ['vomiting_projectile', 'diarrhea', 'age'] }, { fromDiseaseId: 'malrotation', featureIds: ['vomiting_bilious', 'age'] }], neverCloseConditions: ['malrotation'] },
  complications: [{ name: 'Severe dehydration', warningFeatures: ['vomiting_frequency', 'weight_loss'], riskFactors: [], timeWindowHours: [24, 168], severityTier: 'severe', description: 'Hypochloraemic metabolic alkalosis requiring IV resuscitation.' }],
  clinicalScores: [],
  redFlagFeatureIds: ['weight_loss'],
  vomitingManifestation: {
    timingRelativeToPain: 'before', typicalFrequency: 'severe_5_plus',
    bilious: 'never', projectile: 'always', feculent: 'never',
    reliefAfterVomiting: true, relationToEating: 'after_immediate',
    morningPredominance: false, typicalAppearance: 'stomach_contents',
    associatedNausea: 'sometimes', vomitingIsPrimary: true,
    typicalDescription: 'Classic projectile, non-bilious vomiting immediately after feeds in an infant 3-6 weeks old. The infant remains hungry and eager to feed again. Vomiting is progressively more forceful.',
  },
};

export const esophagealCancer: DiseaseNode = {
  id: 'esophageal_cancer', name: 'Esophageal Cancer', icdCode: 'C15', system: 'surgical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 40, ageMax: 85, agePeak: [60, 75], sexRisk: { male: 3, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [{ featureId: 'smoking', label: 'Smoking', LR_positive: 3.0, prevalenceInDisease: 0.5 }, { featureId: 'alcohol_use', label: 'Alcohol', LR_positive: 2.5, prevalenceInDisease: 0.4 }, { featureId: 'family_history_gi_cancer', label: 'GERD / Barrett oesophagus', LR_positive: 4.0, prevalenceInDisease: 0.1 }] },
  pathophysiology: { mechanism: 'Malignancy of the oesophageal epithelium (squamous cell or adenocarcinoma). Progressive dysphagia first to solids then liquids, odynophagia, and weight loss. Regurgitation and vomiting of undigested food occurs as the lumen narrows.', timelineStages: [{ stageId: 1, label: 'Early dysphagia', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('dysphagia', 0.8, 0.6), sym('weight_loss', 0.6, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Retrosternal discomfort during swallowing', painLocationTypical: 'Chest/retrosternal', painRadiationTypical: 'Back' }, { stageId: 2, label: 'Advanced obstruction', typicalHoursFromOnset: [1080, 10800], dominantSymptoms: [sym('dysphagia', 0.95, 0.7), sym('vomiting', 0.5, 0.6), sym('weight_loss', 0.8, 0.8)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Persistent retrosternal pain', painLocationTypical: 'Chest/retrosternal', painRadiationTypical: 'Back' }], progressionRule: 'Progressive dysphagia over months. Late-stage presents with regurgitation, aspiration pneumonia, and tracheo-oesophageal fistula.' },
  features: { symptoms: [sym('dysphagia', 0.8, 0.6, { stageRelevance: [1, 2] }), sym('dysphagia_solids_liquids', 0.7, 0.6, { stageRelevance: [1, 2] }), sym('dysphagia_progressive', 0.8, 0.6, { stageRelevance: [1, 2] }), sym('dysphagia_odynophagia', 0.5, 0.6, { stageRelevance: [1, 2] }), sym('dysphagia_level', 0.5, 0.5, { stageRelevance: [1, 2] }), sym('dysphagia_regurgitation', 0.4, 0.6, { stageRelevance: [2] }), sym('weight_loss', 0.6, 0.7, { stageRelevance: [1, 2] }), sym('weight_loss_amount_kg', 0.5, 0.6, { stageRelevance: [2] }), sym('weight_loss_period_weeks', 0.5, 0.5, { stageRelevance: [2] }), sym('anorexia', 0.5, 0.5, { stageRelevance: [1, 2] }), sym('vomiting', 0.5, 0.6, { stageRelevance: [2] }), sym('vomiting_description', 0.3, 0.7, { stageRelevance: [2] }), sym('vomiting_relation_to_eating', 0.5, 0.6, { stageRelevance: [2] }), sym('nausea', 0.3, 0.5, { stageRelevance: [1, 2] }), sym('heartburn', 0.4, 0.5, { stageRelevance: [1] }), sym('smoking', 0.4, 0.7, { stageRelevance: [1] }), sym('alcohol_use', 0.3, 0.6, { stageRelevance: [1] }), sym('family_history_gi_cancer', 0.1, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['gerd', 'esophagitis', 'achalasia', 'boerhaave', 'functional_dyspepsia'], distinguishingFeatures: [{ fromDiseaseId: 'gerd', featureIds: ['dysphagia_progressive', 'weight_loss', 'age'] }], neverCloseConditions: [] },
  complications: [{ name: 'Complete obstruction', warningFeatures: ['vomiting', 'dysphagia'], riskFactors: ['advanced_disease'], timeWindowHours: [4320, 21600], severityTier: 'severe', description: 'Complete oesophageal obstruction requiring stenting.' }, { name: 'Aspiration pneumonia', warningFeatures: ['vomiting', 'cough'], riskFactors: ['regurgitation'], timeWindowHours: [2160, 10800], severityTier: 'severe', description: 'Pulmonary aspiration of regurgitated food.' }],
  clinicalScores: [],
  redFlagFeatureIds: ['weight_loss', 'dysphagia'],
  vomitingManifestation: {
    timingRelativeToPain: 'before', typicalFrequency: 'moderate_3_5',
    bilious: 'never', projectile: 'never', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'after_delayed',
    morningPredominance: false, typicalAppearance: 'stomach_contents',
    associatedNausea: 'often', vomitingIsPrimary: true,
    typicalDescription: 'Regurgitation of undigested food hours after eating, associated with progressive dysphagia first to solids then liquids. Weight loss is prominent. Does not contain bile.',
  },
};

export const cannabisHyperemesis: DiseaseNode = {
  id: 'cannabis_hyperemesis', name: 'Cannabinoid Hyperemesis Syndrome', icdCode: 'T40.7', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 55, agePeak: [20, 40], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [{ featureId: 'smoking', label: 'Chronic cannabis use', LR_positive: 10.0, prevalenceInDisease: 0.95 }, { featureId: 'smoking', label: 'Daily use', LR_positive: 5.0, prevalenceInDisease: 0.8 }] },
  pathophysiology: { mechanism: 'A syndrome of cyclic vomiting in chronic cannabis users, driven by cannabinoid receptor (CB1) dysregulation in the hypothalamus and brainstem. Paradoxically, hot showers or baths provide temporary relief — a near-pathognomonic feature.', timelineStages: [{ stageId: 1, label: 'Hyperemetic phase', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('vomiting', 0.95, 0.5), sym('nausea', 0.9, 0.5), sym('pain_character', 0.5, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric or diffuse abdominal pain', painLocationTypical: 'Epigastric/diffuse', painRadiationTypical: 'None' }], progressionRule: 'Cyclic episodes lasting 24-72 hours. Asymptomatic between episodes. Only definitive treatment is cannabis cessation.' },
  features: { symptoms: [sym('vomiting', 0.95, 0.5, { stageRelevance: [1] }), sym('nausea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.7, 0.5, { stageRelevance: [1] }), sym('vomiting_timing', 0.4, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.3, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.5, { stageRelevance: [1] }), sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.8, 0.7, { stageRelevance: [1] }), sym('anorexia', 0.4, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.3, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('previous_similar_episodes', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Episodic — recurrent presentations' })] },
  differential: { mimics: ['cyclic_vomiting', 'gastroenteritis', 'gastroparesis', 'pancreatitis'], distinguishingFeatures: [{ fromDiseaseId: 'cyclic_vomiting', featureIds: ['previous_similar_episodes', 'smoking'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe dehydration', warningFeatures: ['vomiting_frequency', 'syncope'], riskFactors: [], timeWindowHours: [24, 72], severityTier: 'moderate', description: 'Requiring IV rehydration.' }],
  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
  vomitingManifestation: {
    timingRelativeToPain: 'before', typicalFrequency: 'severe_5_plus',
    bilious: 'sometimes', projectile: 'sometimes', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'unrelated',
    morningPredominance: false, typicalAppearance: 'stomach_contents',
    associatedNausea: 'always', vomitingIsPrimary: true,
    typicalDescription: 'Cyclic episodes of severe vomiting lasting 24-72 hours in chronic cannabis users. Classic pathognomonic feature: COMPULSIVE HOT SHOWERS/BATHS provide temporary relief. Cyclical pattern with asymptomatic intervals.',
  },
};

export const cholera: DiseaseNode = {
  id: 'cholera', name: 'Cholera', icdCode: 'A00', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 1, ageMax: 70, agePeak: [2, 15], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [{ featureId: 'recent_travel', label: 'Endemic area travel', LR_positive: 10.0, prevalenceInDisease: 0.8 }, { featureId: 'recent_travel', label: 'Contaminated water', LR_positive: 5.0, prevalenceInDisease: 0.6 }] },
  pathophysiology: { mechanism: 'Acute secretory diarrhoea caused by Vibrio cholerae, producing cholera toxin that activates adenylate cyclase in intestinal epithelium. Profuse, painless rice-water diarrhoea (up to 1 L/hour) with vomiting. Rapid onset of severe dehydration.', timelineStages: [{ stageId: 1, label: 'Acute cholera', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('diarrhea', 0.95, 0.5), sym('vomiting', 0.8, 0.5), sym('syncope', 0.5, 0.8)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Minimal or no abdominal pain', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Death from dehydration within hours if untreated.' },
  features: { symptoms: [sym('diarrhea', 0.95, 0.5, { stageRelevance: [1] }), sym('diarrhea_frequency', 0.8, 0.5, { stageRelevance: [1] }), sym('diarrhea_consistency', 0.7, 0.6, { stageRelevance: [1] }), sym('diarrhea_volume', 0.8, 0.6, { stageRelevance: [1] }), sym('vomiting', 0.8, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.6, 0.5, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('syncope', 0.5, 0.8, { stageRelevance: [1] }), sym('recent_travel', 0.7, 0.7, { stageRelevance: [1] }), sym('anorexia', 0.3, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('fever', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.5, label: 'Afebrile — cholera typically does not cause fever' })], supporting: [] },
  differential: { mimics: ['gastroenteritis', 'food_poisoning', 'infectious_colitis', 'dka'], distinguishingFeatures: [{ fromDiseaseId: 'gastroenteritis', featureIds: ['diarrhea_volume', 'recent_travel', 'fever'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe dehydration', warningFeatures: ['syncope', 'vomiting_frequency', 'diarrhea_frequency'], riskFactors: ['children', 'elderly'], timeWindowHours: [0, 24], severityTier: 'critical', description: 'Profound hypovolaemic shock requiring aggressive IV rehydration.' }],
  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
  vomitingManifestation: {
    timingRelativeToPain: 'before', typicalFrequency: 'severe_5_plus',
    bilious: 'often', projectile: 'never', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'unrelated',
    morningPredominance: false, typicalAppearance: 'bile',
    associatedNausea: 'always', vomitingIsPrimary: true,
    typicalDescription: 'Vomiting follows profuse watery diarrhea (rice-water stool) in a patient from an endemic area. Vomiting is persistent and severe, leading to rapid dehydration. Minimal or no abdominal pain. Afebrile.',
  },
};

export const meniereDisease: DiseaseNode = {
  id: 'meniere_disease', name: 'Ménière Disease', icdCode: 'H81.0', system: 'medical',
  organSystem: 'neurological', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 60, agePeak: [30, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'A disorder of the inner ear characterised by endolymphatic hydrops causing episodic vertigo, fluctuating sensorineural hearing loss, tinnitus, and aural fullness. Nausea and vomiting are severe during acute vertigo attacks. Attacks last 20 minutes to 12 hours.', timelineStages: [{ stageId: 1, label: 'Acute Meniere attack', typicalHoursFromOnset: [0, 12], dominantSymptoms: [sym('nausea', 0.9, 0.5), sym('vomiting', 0.8, 0.5), sym('headache', 0.3, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'No abdominal pain — vertigo is the dominant symptom', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Episodic attacks with progressive hearing loss over years.' },
  features: { symptoms: [sym('nausea', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.8, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting_timing', 0.3, 0.5, { stageRelevance: [1] }), sym('headache', 0.3, 0.5, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.7, 0.7, { stageRelevance: [1] }), sym('syncope', 0.1, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['vestibular_neuritis', 'labyrinthitis', 'migraine', 'raised_icp'], distinguishingFeatures: [{ fromDiseaseId: 'vestibular_neuritis', featureIds: ['headache', 'previous_similar_episodes'] }], neverCloseConditions: [] },
  complications: [{ name: 'Falls and injury', warningFeatures: ['syncope'], riskFactors: ['elderly'], timeWindowHours: [0, 12], severityTier: 'moderate', description: 'Falls during acute vertigo attacks.' }],
  clinicalScores: [],
  redFlagFeatureIds: ['syncope'],
  vomitingManifestation: {
    timingRelativeToPain: 'no_pain', typicalFrequency: 'moderate_3_5',
    bilious: 'sometimes', projectile: 'never', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'unrelated',
    morningPredominance: false, typicalAppearance: 'stomach_contents',
    associatedNausea: 'always', vomitingIsPrimary: false,
    typicalDescription: 'Severe nausea and vomiting accompany acute vertigo attacks that last 20 minutes to 12 hours. Associated with fluctuating hearing loss, tinnitus, and aural fullness. No abdominal pain.',
  },
};

export const benignPositionalVertigo: DiseaseNode = {
  id: 'benign_positional_vertigo', name: 'Benign Paroxysmal Positional Vertigo', icdCode: 'H81.1', system: 'medical',
  organSystem: 'neurological', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 80, agePeak: [50, 70], sexRisk: { male: 0.7, female: 1.3 }, backgroundPrevalence: 0.02, riskFactors: [{ featureId: 'prior_abdominal_surgery', label: 'Head trauma', LR_positive: 3.0, prevalenceInDisease: 0.15 }] },
  pathophysiology: { mechanism: 'Brief episodes of vertigo triggered by head position changes, caused by displaced otoconia (calcium carbonate crystals) in the semicircular canals. Nausea may accompany vertigo but vomiting is less common than in vestibular neuritis. No hearing loss.', timelineStages: [{ stageId: 1, label: 'Positional vertigo', typicalHoursFromOnset: [0, 1], dominantSymptoms: [sym('nausea', 0.5, 0.5), sym('vomiting', 0.2, 0.6)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'No abdominal pain', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Self-limited episodes lasting seconds to minutes. May recur for weeks to months.' },
  features: { symptoms: [sym('nausea', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.2, 0.6, { stageRelevance: [1] }), sym('headache', 0.1, 0.5, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['vestibular_neuritis', 'meniere_disease', 'labyrinthitis', 'migraine'], distinguishingFeatures: [{ fromDiseaseId: 'vestibular_neuritis', featureIds: ['previous_similar_episodes', 'headache'] }], neverCloseConditions: [] },
  complications: [], clinicalScores: [], redFlagFeatureIds: [],
  vomitingManifestation: {
    timingRelativeToPain: 'no_pain', typicalFrequency: 'mild_1_3',
    bilious: 'never', projectile: 'never', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'unrelated',
    morningPredominance: false, typicalAppearance: 'stomach_contents',
    associatedNausea: 'often', vomitingIsPrimary: false,
    typicalDescription: 'Mild nausea and occasional vomiting triggered by head position changes (rolling in bed, looking up). Episodes last seconds to minutes. No abdominal pain. No hearing loss.',
  },
};

export const thyrotoxicosis: DiseaseNode = {
  id: 'thyrotoxicosis', name: 'Thyrotoxicosis / Thyroid Storm', icdCode: 'E05.5', system: 'medical',
  organSystem: 'endocrine', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 15, ageMax: 60, agePeak: [20, 40], sexRisk: { male: 0.2, female: 1.8 }, backgroundPrevalence: 0.005, riskFactors: [{ featureId: 'prior_abdominal_surgery', label: 'Graves disease', LR_positive: 5.0, prevalenceInDisease: 0.7 }] },
  pathophysiology: { mechanism: 'Excess thyroid hormone causing hypermetabolic state. Presents with tachycardia, hypertension, fever, tremor, anxiety, and weight loss. Nausea and vomiting are common in thyroid storm (life-threatening escalation). Abdominal pain may be present.', timelineStages: [{ stageId: 1, label: 'Thyrotoxicosis', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('nausea', 0.4, 0.5), sym('vomiting', 0.3, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric discomfort', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'Can escalate to thyroid storm (fever >38.5, tachycardia >140, altered mental state, vomiting) with 20-50% mortality.' },
  features: { symptoms: [sym('nausea', 0.4, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.3, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.3, 0.5, { stageRelevance: [1] }), sym('headache', 0.2, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.2, 0.5, { stageRelevance: [1] }), sym('diarrhea', 0.4, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.7, { stageRelevance: [1] }), sym('syncope', 0.2, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['dka', 'sepsis', 'pancreatitis', 'phaeochromocytoma'], distinguishingFeatures: [{ fromDiseaseId: 'dka', featureIds: ['weight_loss', 'diarrhea', 'syncope'] }], neverCloseConditions: [] },
  complications: [{ name: 'Thyroid storm', warningFeatures: ['syncope', 'vomiting_frequency', 'fever'], riskFactors: ['infection', 'surgery'], timeWindowHours: [24, 168], severityTier: 'critical', description: 'Life-threatening hypermetabolic state requiring intensive care.' }],
  clinicalScores: [{ name: 'Burch-Wartofsky', items: [{ featureId: 'fever', label: 'Temperature 37.2-37.8', pointsWhenPresent: 5 }, { featureId: 'syncope', label: 'CNS effect', pointsWhenPresent: 10 }], interpretationThresholds: [{ maxScore: 25, label: 'Low risk' }, { maxScore: 45, label: 'Moderate risk' }, { maxScore: 100, label: 'High risk — storm likely' }], maxScore: 100 }],
  redFlagFeatureIds: ['syncope'],
  vomitingManifestation: {
    timingRelativeToPain: 'after', typicalFrequency: 'mild_1_3',
    bilious: 'sometimes', projectile: 'never', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'after_immediate',
    morningPredominance: false, typicalAppearance: 'stomach_contents',
    associatedNausea: 'always', vomitingIsPrimary: false,
    typicalDescription: 'Nausea and vomiting accompany thyrotoxic symptoms — tachycardia, tremor, heat intolerance, weight loss. Vomiting is more prominent in thyroid storm with high fever and altered mental state.',
  },
};

export const psychogenicVomiting: DiseaseNode = {
  id: 'psychogenic_vomiting', name: 'Psychogenic / Anxiety-Induced Vomiting', icdCode: 'F50.8', system: 'psychiatric',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 10, ageMax: 60, agePeak: [15, 35], sexRisk: { male: 0.5, female: 1.5 }, backgroundPrevalence: 0.01, riskFactors: [{ featureId: 'prior_abdominal_surgery', label: 'Anxiety disorder', LR_positive: 4.0, prevalenceInDisease: 0.5 }, { featureId: 'prior_abdominal_surgery', label: 'Panic disorder', LR_positive: 3.0, prevalenceInDisease: 0.3 }] },
  pathophysiology: { mechanism: 'Vomiting triggered by psychological stress, anxiety, or panic without organic cause. The vomiting centre is activated by cortical input (limbic system) rather than peripheral stimuli. Often associated with situational triggers and may be self-induced.', timelineStages: [{ stageId: 1, label: 'Acute episode', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('vomiting', 0.8, 0.5), sym('nausea', 0.7, 0.5), sym('headache', 0.3, 0.5)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'No abdominal pain or mild epigastric discomfort', painLocationTypical: 'None or epigastric', painRadiationTypical: 'None' }], progressionRule: 'Episodic, triggered by stress. No progressive organic pathology.' },
  features: { symptoms: [sym('vomiting', 0.8, 0.5, { stageRelevance: [1] }), sym('nausea', 0.7, 0.5, { stageRelevance: [1] }), sym('vomiting_timing', 0.3, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.4, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.2, 0.6, { stageRelevance: [1] }), sym('headache', 0.3, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.15, 0.5, { stageRelevance: [1] }), sym('previous_similar_episodes', 0.7, 0.7, { stageRelevance: [1] }), sym('anorexia', 0.3, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('pain_character', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Minimal abdominal pain — organic cause less likely' })], supporting: [] },
  differential: { mimics: ['cyclic_vomiting', 'bulimia_nervosa', 'functional_dyspepsia', 'medication_induced'], distinguishingFeatures: [{ fromDiseaseId: 'cyclic_vomiting', featureIds: ['previous_similar_episodes'] }], neverCloseConditions: [] },
  complications: [{ name: 'Dehydration', warningFeatures: ['vomiting_frequency'], riskFactors: [], timeWindowHours: [24, 168], severityTier: 'mild', description: 'Mild electrolyte disturbance from recurrent vomiting.' }],
  clinicalScores: [],
  redFlagFeatureIds: [],
  vomitingManifestation: {
    timingRelativeToPain: 'no_pain', typicalFrequency: 'mild_1_3',
    bilious: 'never', projectile: 'never', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'after_immediate',
    morningPredominance: true, typicalAppearance: 'stomach_contents',
    associatedNausea: 'always', vomitingIsPrimary: true,
    typicalDescription: 'Vomiting triggered by psychological stress, anxiety, or panic attacks. Often occurs before stressful events or during meals. May be self-induced. Minimal abdominal pain. No organic pathology found.',
  },
};

export const postoperativeNv: DiseaseNode = {
  id: 'postoperative_nv', name: 'Postoperative Nausea and Vomiting', icdCode: 'T81.7', system: 'surgical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [20, 60], sexRisk: { male: 0.5, female: 1.5 }, backgroundPrevalence: 0.3, riskFactors: [{ featureId: 'prior_abdominal_surgery', label: 'Previous PONV', LR_positive: 3.0, prevalenceInDisease: 0.3 }, { featureId: 'smoking', label: 'Non-smoker', LR_positive: 2.0, prevalenceInDisease: 0.5 }] },
  pathophysiology: { mechanism: 'Nausea and vomiting occurring after surgery, caused by anaesthetic agents (volatiles, opioids), surgical manipulation (especially abdominal, gynaecological, ENT), and pain. Vagal and chemoreceptor trigger zone pathways are activated.', timelineStages: [{ stageId: 1, label: 'Immediate postoperative', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('nausea', 0.8, 0.5), sym('vomiting', 0.6, 0.5)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Surgical wound pain — not abdominal pain from disease', painLocationTypical: 'Surgical site', painRadiationTypical: 'None' }], progressionRule: 'Self-limiting in most cases. Resolves within 24 hours of surgery.' },
  features: { symptoms: [sym('nausea', 0.8, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.6, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.4, 0.5, { stageRelevance: [1] }), sym('vomiting_timing', 0.3, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.2, 0.5, { stageRelevance: [1] }), sym('prior_abdominal_surgery', 0.9, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('pain_character', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.3, label: 'Surgical wound pain is expected — not new pathology' })], supporting: [sym('prior_abdominal_surgery', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'Recent surgery is diagnostic' })] },
  differential: { mimics: ['ileus', 'intestinal_obstruction', 'medication_induced'], distinguishingFeatures: [{ fromDiseaseId: 'intestinal_obstruction', featureIds: ['abdominal_distension', 'obstipation'] }], neverCloseConditions: ['intestinal_obstruction'] },
  complications: [{ name: 'Aspiration', warningFeatures: ['vomiting_frequency'], riskFactors: ['reduced_gag_reflex'], timeWindowHours: [0, 6], severityTier: 'severe', description: 'Pulmonary aspiration of gastric contents.' }],
  clinicalScores: [{ name: 'Apfel score', items: [{ featureId: 'smoking', label: 'Non-smoker', pointsWhenPresent: 1 }, { featureId: 'prior_abdominal_surgery', label: 'Previous PONV', pointsWhenPresent: 1 }], interpretationThresholds: [{ maxScore: 1, label: 'Low risk (30%)' }, { maxScore: 2, label: 'Moderate risk (50%)' }, { maxScore: 3, label: 'High risk (70%)' }], maxScore: 3 }],
  redFlagFeatureIds: [],
  vomitingManifestation: {
    timingRelativeToPain: 'after', typicalFrequency: 'mild_1_3',
    bilious: 'sometimes', projectile: 'never', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'unrelated',
    morningPredominance: false, typicalAppearance: 'stomach_contents',
    associatedNausea: 'always', vomitingIsPrimary: false,
    typicalDescription: 'Postoperative nausea and vomiting triggered by anaesthetic agents, opioid analgesics, or surgical manipulation (especially abdominal/gynaecological/ENT surgery). Typically resolves within 24 hours.',
  },
};

export const acuteLiverFailure: DiseaseNode = {
  id: 'acute_liver_failure', name: 'Acute Liver Failure / Fulminant Hepatitis', icdCode: 'K72.0', system: 'medical',
  organSystem: 'hepatobiliary', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 0, ageMax: 80, agePeak: [20, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0001, riskFactors: [{ featureId: 'recent_travel', label: 'Viral hepatitis', LR_positive: 5.0, prevalenceInDisease: 0.5 }, { featureId: 'nsaid_use', label: 'Drug-induced (paracetamol)', LR_positive: 10.0, prevalenceInDisease: 0.4 }] },
  pathophysiology: { mechanism: 'Rapid deterioration of liver function with hepatic encephalopathy and coagulopathy in a patient without pre-existing liver disease. Causes include viral hepatitis, drug toxicity (paracetamol), and autoimmune hepatitis. Vomiting is prominent due to hepatic encephalopathy and metabolic disturbance.', timelineStages: [{ stageId: 1, label: 'Acute hepatic injury', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('vomiting', 0.7, 0.5), sym('jaundice', 0.6, 0.6), sym('nausea', 0.7, 0.5)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'RUQ discomfort', painLocationTypical: 'Right upper quadrant', painRadiationTypical: 'None' }], progressionRule: 'Progression to encephalopathy, cerebral oedema, and multi-organ failure within days.' },
  features: { symptoms: [sym('vomiting', 0.7, 0.5, { stageRelevance: [1] }), sym('vomiting_frequency', 0.5, 0.5, { stageRelevance: [1] }), sym('vomiting_description', 0.3, 0.6, { stageRelevance: [1] }), sym('nausea', 0.7, 0.5, { stageRelevance: [1] }), sym('jaundice', 0.6, 0.6, { stageRelevance: [1] }), sym('jaundice_onset', 0.4, 0.5, { stageRelevance: [1] }), sym('jaundice_dark_urine', 0.5, 0.6, { stageRelevance: [1] }), sym('jaundice_pale_stool', 0.4, 0.6, { stageRelevance: [1] }), sym('pain_character', 0.3, 0.5, { stageRelevance: [1] }), sym('pain_initial_location', 0.3, 0.5, { stageRelevance: [1] }), sym('anorexia', 0.6, 0.5, { stageRelevance: [1] }), sym('syncope', 0.4, 0.8, { stageRelevance: [1] }), sym('fever', 0.4, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hepatitis', 'alcoholic_hepatitis', 'liver_abscess', 'hcc', 'budd_chiari'], distinguishingFeatures: [{ fromDiseaseId: 'hepatitis', featureIds: ['syncope', 'vomiting_frequency'] }], neverCloseConditions: [] },
  complications: [{ name: 'Cerebral oedema', warningFeatures: ['syncope', 'vomiting_projectile'], riskFactors: [], timeWindowHours: [24, 96], severityTier: 'critical', description: 'Life-threatening raised ICP requiring ICP monitoring.' }, { name: 'Coagulopathy', warningFeatures: ['hematemesis', 'melena'], riskFactors: [], timeWindowHours: [12, 72], severityTier: 'critical', description: 'Spontaneous bleeding from clotting factor deficiency.' }],
  clinicalScores: [{ name: 'King\'s College Criteria', items: [{ featureId: 'syncope', label: 'Encephalopathy', pointsWhenPresent: 1 }, { featureId: 'jaundice', label: 'Bilirubin >300', pointsWhenPresent: 1 }], interpretationThresholds: [{ maxScore: 1, label: 'Consider transplant' }, { maxScore: 2, label: 'Transplant indicated' }], maxScore: 2 }],
  redFlagFeatureIds: ['syncope'],
  vomitingManifestation: {
    timingRelativeToPain: 'after', typicalFrequency: 'moderate_3_5',
    bilious: 'sometimes', projectile: 'never', feculent: 'never',
    reliefAfterVomiting: false, relationToEating: 'unrelated',
    morningPredominance: false, typicalAppearance: 'stomach_contents',
    associatedNausea: 'always', vomitingIsPrimary: false,
    typicalDescription: 'Vomiting is common in acute liver failure due to hepatic encephalopathy and metabolic disturbance. Associated with jaundice, coagulopathy, and altered mental state. May become projectile if cerebral oedema develops.',
  },
};

export const MISSING3_NODES: DiseaseNode[] = [
  meningitis, sepsis, pyloricStenosis, esophagealCancer, cannabisHyperemesis,
  cholera, meniereDisease, benignPositionalVertigo, thyrotoxicosis,
  psychogenicVomiting, postoperativeNv, acuteLiverFailure,
];
