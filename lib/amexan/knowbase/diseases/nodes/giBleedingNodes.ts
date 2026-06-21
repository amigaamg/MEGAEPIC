import type { DiseaseNode, FeatureRecord } from '../../diseaseNode';
import { getFeature, getLrPlus, getLrMinus } from '../../features/featureLibrary';

function feat(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  const base = getFeature(id);
  return { ...base, sensitivity: sens, specificity: spec, LR_positive: getLrPlus({ ...base, sensitivity: sens, specificity: spec }), LR_negative: getLrMinus({ ...base, sensitivity: sens, specificity: spec }), ...overrides };
}
function sym(id: string, sens: number, spec: number, overrides?: Partial<FeatureRecord>): FeatureRecord {
  return feat(id, sens, spec, { ...overrides, category: 'symptom' });
}

// -------------------------------------------------------------------------------
// SECTION 1: UGIB � ESOPHAGEAL (8 nodes)
// -------------------------------------------------------------------------------

export const esophagealVaricesBleeding: DiseaseNode = {
  id: 'esophageal_varices_bleeding', name: 'Esophageal Variceal Hemorrhage', icdCode: 'I85.01', system: 'medical',
  organSystem: 'GI', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 25, ageMax: 80, agePeak: [45, 65], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [{ featureId: 'gi_bleeding_liver_disease', label: 'Known cirrhosis or chronic liver disease', LR_positive: 8, prevalenceInDisease: 0.9 }, { featureId: 'alcohol_use', label: 'Chronic alcohol use', LR_positive: 3, prevalenceInDisease: 0.7 }, { featureId: 'gi_bleeding_known_varices', label: 'Known esophageal varices', LR_positive: 12, prevalenceInDisease: 0.4 }] },
  pathophysiology: { mechanism: 'Portal hypertension from cirrhosis leads to esophageal varices. Rupture causes massive life-threatening UGIB. Mortality ~15-20% per episode.', timelineStages: [{ stageId: 1, label: 'Acute variceal hemorrhage', typicalHoursFromOnset: [0, 6], dominantSymptoms: [sym('hematemesis', 0.9, 0.95), sym('gi_bleeding_painless', 0.9, 0.7), sym('gi_bleeding_liver_disease', 0.9, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Painless', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'Without urgent endoscopic therapy, bleeding continues. Mortality increases each hour.' },
  features: { symptoms: [sym('hematemesis', 0.9, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.85, 0.8, { stageRelevance: [1] }), sym('hematemesis_color', 0.7, 0.8, { stageRelevance: [1] }), sym('hematemesis_frequency', 0.85, 0.75, { stageRelevance: [1] }), sym('melena', 0.6, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.9, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_liver_disease', 0.9, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_known_varices', 0.4, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.6, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_prior_gi_bleed', 0.5, 0.8, { stageRelevance: [1] }), sym('alcohol_use', 0.7, 0.7, { stageRelevance: [1] }), sym('nausea', 0.3, 0.5, { stageRelevance: [1] }), sym('jaundice', 0.4, 0.9, { stageRelevance: [1] }), sym('dyspnea', 0.3, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_liver_disease', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.12, label: 'No known liver disease' })], supporting: [] },
  differential: { mimics: ['gastric_varices_bleeding', 'gastric_ulcer_bleeding', 'duodenal_ulcer_bleeding', 'mallory_weiss_tear'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['gi_bleeding_liver_disease', 'gi_bleeding_known_varices', 'alcohol_use'] }, { fromDiseaseId: 'mallory_weiss_tear', featureIds: ['gi_bleeding_vomiting_first', 'hematemesis_volume'] }], neverCloseConditions: ['aortoenteric_fistula', 'boerhaave_syndrome'] },
  complications: [{ name: 'Hypovolemic shock', warningFeatures: ['syncope', 'hematemesis_volume'], riskFactors: [], timeWindowHours: [0, 6], severityTier: 'critical', description: 'Massive blood loss leading to collapse.' }, { name: 'Aspiration pneumonia', warningFeatures: ['dyspnea', 'hematemesis_frequency'], riskFactors: ['altered_mental_status'], timeWindowHours: [2, 24], severityTier: 'severe', description: 'Blood aspiration during vomiting.' }, { name: 'Hepatic encephalopathy', warningFeatures: ['jaundice'], riskFactors: ['cirrhosis'], timeWindowHours: [24, 72], severityTier: 'moderate', description: 'Blood in GI tract precipitates encephalopathy.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope', 'hematemesis'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'esophageal', onset: 'acute', severity: 'massive_shock', character: 'bright_red', painPattern: 'painless', associatedSymptoms: ['vomiting', 'jaundice', 'ascites', 'syncope'], riskContext: ['portal_hypertension', 'alcohol', 'prior_gi_bleed'], mechanism: 'portal_hypertension', typicalDescription: 'Painless massive hematemesis in a patient with known liver disease. Rapid hemodynamic compromise.' },
};
export const gastricVaricesBleeding: DiseaseNode = {
  id: 'gastric_varices_bleeding', name: 'Gastric Variceal Hemorrhage', icdCode: 'I86.4', system: 'medical',
  organSystem: 'GI', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 25, ageMax: 80, agePeak: [45, 65], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [{ featureId: 'gi_bleeding_liver_disease', label: 'Known cirrhosis', LR_positive: 8, prevalenceInDisease: 0.85 }, { featureId: 'alcohol_use', label: 'Chronic alcohol use', LR_positive: 3, prevalenceInDisease: 0.65 }, { featureId: 'gi_bleeding_known_varices', label: 'Known gastric varices', LR_positive: 15, prevalenceInDisease: 0.3 }] },
  pathophysiology: { mechanism: 'Gastric varices in portal hypertension, usually fundus/cardia. Less common than esophageal varices but bleed more severely and are harder to treat. Mortality exceeds 30% per bleed.', timelineStages: [{ stageId: 1, label: 'Acute gastric variceal bleed', typicalHoursFromOnset: [0, 8], dominantSymptoms: [sym('hematemesis', 0.85, 0.95), sym('melena', 0.7, 0.9), sym('gi_bleeding_painless', 0.8, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Painless', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'Bleeding is often torrential. TIPS or surgery may be required.' },
  features: { symptoms: [sym('hematemesis', 0.85, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.8, 0.8, { stageRelevance: [1] }), sym('hematemesis_color', 0.6, 0.8, { stageRelevance: [1] }), sym('melena', 0.7, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.8, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_liver_disease', 0.85, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.7, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_prior_gi_bleed', 0.5, 0.8, { stageRelevance: [1] }), sym('alcohol_use', 0.65, 0.7, { stageRelevance: [1] }), sym('jaundice', 0.35, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_liver_disease', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No known liver disease' })], supporting: [] },
  differential: { mimics: ['esophageal_varices_bleeding', 'gastric_ulcer_bleeding', 'dieulafoy_lesion', 'gastric_cancer_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'esophageal_varices_bleeding', featureIds: ['hematemesis_color', 'hematemesis_volume'] }], neverCloseConditions: ['aortoenteric_fistula'] },
  complications: [{ name: 'Hypovolemic shock', warningFeatures: ['syncope', 'hematemesis_volume'], riskFactors: [], timeWindowHours: [0, 6], severityTier: 'critical', description: 'Exsanguination from torrential variceal bleeding.' }, { name: 'Rebleeding', warningFeatures: ['hematemesis_frequency'], riskFactors: ['high_portal_pressure'], timeWindowHours: [48, 168], severityTier: 'critical', description: 'High rebleeding rate without portal decompression.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope', 'hematemesis'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'gastric', onset: 'acute', severity: 'massive_shock', character: 'dark_red_maroon', painPattern: 'painless', associatedSymptoms: ['vomiting', 'jaundice', 'ascites', 'syncope'], riskContext: ['portal_hypertension', 'alcohol'], mechanism: 'portal_hypertension', typicalDescription: 'Massive UGIB from gastric fundal varices. More severe than esophageal varices.' },
};

export const malloryWeissTear: DiseaseNode = {
  id: 'mallory_weiss_tear', name: 'Mallory-Weiss Syndrome', icdCode: 'K22.6', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 70, agePeak: [30, 50], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [{ featureId: 'alcohol_use', label: 'Heavy alcohol / binge drinking', LR_positive: 4, prevalenceInDisease: 0.6 }, { featureId: 'recent_binge', label: 'Recent binge drinking', LR_positive: 5, prevalenceInDisease: 0.5 }] },
  pathophysiology: { mechanism: 'Linear mucosal tear at the gastroesophageal junction caused by forceful retching/vomiting. Most common after binge drinking. Hematemesis follows several episodes of non-bloody vomiting. Most heal spontaneously.', timelineStages: [{ stageId: 1, label: 'Tear with active bleeding', typicalHoursFromOnset: [0, 12], dominantSymptoms: [sym('hematemesis', 0.9, 0.5), sym('vomiting', 0.8, 0.55), sym('gi_bleeding_vomiting_first', 0.85, 0.8)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Epigastric / retrosternal discomfort', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'Majority stop spontaneously within 24-48 hours.' },
  features: { symptoms: [sym('hematemesis', 0.9, 0.5, { stageRelevance: [1] }), sym('hematemesis_volume', 0.4, 0.8, { stageRelevance: [1] }), sym('hematemesis_color', 0.5, 0.7, { stageRelevance: [1] }), sym('hematemesis_frequency', 0.5, 0.75, { stageRelevance: [1] }), sym('melena', 0.2, 0.9, { stageRelevance: [1] }), sym('vomiting', 0.8, 0.55, { stageRelevance: [1] }), sym('gi_bleeding_vomiting_first', 0.85, 0.8, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.3, 0.7, { stageRelevance: [1] }), sym('alcohol_use', 0.6, 0.7, { stageRelevance: [1] }), sym('nausea', 0.6, 0.5, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.2, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_vomiting_first', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'Vomiting began after bleeding' })], supporting: [] },
  differential: { mimics: ['esophageal_varices_bleeding', 'reflux_esophagitis_bleeding', 'boerhaave_syndrome', 'gastric_ulcer_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'esophageal_varices_bleeding', featureIds: ['gi_bleeding_liver_disease', 'gi_bleeding_vomiting_first'] }, { fromDiseaseId: 'boerhaave_syndrome', featureIds: ['pain_severity', 'fever'] }], neverCloseConditions: ['boerhaave_syndrome'] },
  complications: [{ name: 'Persistent bleeding', warningFeatures: ['hematemesis_frequency', 'gi_bleeding_syncope'], riskFactors: ['anticoagulant_use'], timeWindowHours: [12, 48], severityTier: 'moderate', description: 'Bleeding requires endoscopic intervention.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope'],
  giBleedingManifestation: { bleedingType: ['hematemesis'], site: 'esophageal', onset: 'acute', severity: 'moderate', character: 'bright_red', painPattern: 'epigastric_pain', associatedSymptoms: ['vomiting', 'nausea'], riskContext: ['alcohol'], mechanism: 'mechanical_trauma', typicalDescription: 'Hematemesis after forceful non-bloody vomiting, often after binge drinking. Typically self-limited.' },
};

export const refluxEsophagitisBleeding: DiseaseNode = {
  id: 'reflux_esophagitis_bleeding', name: 'Erosive Reflux Esophagitis', icdCode: 'K21.0', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 60], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.02, riskFactors: [{ featureId: 'heartburn', label: 'GERD / chronic heartburn', LR_positive: 5, prevalenceInDisease: 0.8 }] },
  pathophysiology: { mechanism: 'Chronic GERD causes erosive esophagitis. Severe disease (LA Grade C/D) can cause bleeding, typically mild hematemesis or occult blood loss. Rarely massive.', timelineStages: [{ stageId: 1, label: 'Erosive esophagitis with bleeding', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('heartburn', 0.8, 0.7), sym('hematemesis', 0.3, 0.95), sym('gi_bleeding_dysphagia', 0.3, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Burning retrosternal pain', painLocationTypical: 'Retrosternal', painRadiationTypical: 'None' }], progressionRule: 'Chronic. Bleeding stops with acid suppression.' },
  features: { symptoms: [sym('hematemesis', 0.3, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.2, 0.8, { stageRelevance: [1] }), sym('hematemesis_color', 0.3, 0.7, { stageRelevance: [1] }), sym('heartburn', 0.8, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_dysphagia', 0.3, 0.8, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.3, 0.85, { stageRelevance: [1] }), sym('nausea', 0.3, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('heartburn', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No reflux history' })], supporting: [] },
  differential: { mimics: ['pill_esophagitis_bleeding', 'infectious_esophagitis_bleeding', 'esophageal_cancer_bleeding', 'gastric_ulcer_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'pill_esophagitis_bleeding', featureIds: ['heartburn', 'gi_bleeding_dysphagia'] }], neverCloseConditions: ['esophageal_cancer_bleeding'] },
  complications: [{ name: 'Esophageal stricture', warningFeatures: ['gi_bleeding_dysphagia'], riskFactors: ['chronic_gerd'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Scarring from chronic inflammation.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_dysphagia'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'occult'], site: 'esophageal', onset: 'chronic_occult', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'epigastric_pain', associatedSymptoms: ['dysphagia', 'nausea'], riskContext: ['gerd'], mechanism: 'acid_related', typicalDescription: 'Chronic heartburn with occasional small hematemesis or occult blood loss causing iron deficiency.' },
};

export const infectiousEsophagitisBleeding: DiseaseNode = {
  id: 'infectious_esophagitis_bleeding', name: 'Infectious Esophagitis (Candida / CMV / HSV)', icdCode: 'B37.81', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [25, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [{ featureId: 'hiv_status', label: 'HIV / AIDS', LR_positive: 10, prevalenceInDisease: 0.5 }, { featureId: 'steroid_use', label: 'Immunosuppression', LR_positive: 5, prevalenceInDisease: 0.3 }, { featureId: 'diabetes', label: 'Diabetes', LR_positive: 2.5, prevalenceInDisease: 0.2 }] },
  pathophysiology: { mechanism: 'Candida, CMV, or HSV cause ulcerative esophagitis in immunocompromised patients. Odynophagia, dysphagia, retrosternal pain. Bleeding from ulcer erosion into submucosal vessels.', timelineStages: [{ stageId: 1, label: 'Infectious esophagitis with bleeding', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('gi_bleeding_dysphagia', 0.8, 0.8), sym('hematemesis', 0.4, 0.95), sym('fever', 0.4, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe retrosternal pain on swallowing', painLocationTypical: 'Retrosternal', painRadiationTypical: 'None' }], progressionRule: 'Requires specific antimicrobial therapy.' },
  features: { symptoms: [sym('hematemesis', 0.4, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.2, 0.8, { stageRelevance: [1] }), sym('gi_bleeding_dysphagia', 0.8, 0.8, { stageRelevance: [1] }), sym('fever', 0.4, 0.6, { stageRelevance: [1] }), sym('hiv_status', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('hiv_status', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No immunosuppression' })], supporting: [] },
  differential: { mimics: ['reflux_esophagitis_bleeding', 'pill_esophagitis_bleeding', 'esophageal_cancer_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'reflux_esophagitis_bleeding', featureIds: ['hiv_status', 'fever'] }], neverCloseConditions: [] },
  complications: [{ name: 'Esophageal perforation', warningFeatures: ['pain_severity', 'fever'], riskFactors: ['cmv'], timeWindowHours: [168, 720], severityTier: 'critical', description: 'Deep ulceration leads to perforation.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_dysphagia', 'hiv_status'],
  giBleedingManifestation: { bleedingType: ['hematemesis'], site: 'esophageal', onset: 'subacute', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'epigastric_pain', associatedSymptoms: ['dysphagia', 'fever'], riskContext: ['none'], mechanism: 'infectious', typicalDescription: 'Odynophagia and dysphagia in an immunocompromised patient with minor hematemesis.' },
};

export const esophagealCancerBleeding: DiseaseNode = {
  id: 'esophageal_cancer_bleeding', name: 'Esophageal Cancer (SCC / Adenocarcinoma)', icdCode: 'C15.9', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 40, ageMax: 85, agePeak: [60, 75], sexRisk: { male: 3, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [{ featureId: 'smoking', label: 'Smoking', LR_positive: 3, prevalenceInDisease: 0.6 }, { featureId: 'alcohol_use', label: 'Heavy alcohol', LR_positive: 3, prevalenceInDisease: 0.5 }, { featureId: 'gi_bleeding_dysphagia', label: 'Progressive dysphagia', LR_positive: 10, prevalenceInDisease: 0.8 }] },
  pathophysiology: { mechanism: 'SCC or adenocarcinoma causing progressive dysphagia, weight loss, and bleeding. Bleeding is usually chronic/occult but can be acute with tumor friability.', timelineStages: [{ stageId: 1, label: 'Bleeding from esophageal tumor', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('gi_bleeding_dysphagia', 0.8, 0.8), sym('gi_bleeding_weight_loss', 0.7, 0.85), sym('hematemesis', 0.4, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Progressive dysphagia', painLocationTypical: 'Retrosternal', painRadiationTypical: 'Back' }], progressionRule: 'Progressive. Bleeding increases as tumor invades vessels.' },
  features: { symptoms: [sym('hematemesis', 0.4, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.3, 0.8, { stageRelevance: [1] }), sym('gi_bleeding_dysphagia', 0.8, 0.8, { stageRelevance: [1] }), sym('gi_bleeding_weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.4, 0.85, { stageRelevance: [1] }), sym('smoking', 0.6, 0.65, { stageRelevance: [1] }), sym('alcohol_use', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_dysphagia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.08, label: 'No dysphagia' })], supporting: [] },
  differential: { mimics: ['reflux_esophagitis_bleeding', 'pill_esophagitis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'reflux_esophagitis_bleeding', featureIds: ['gi_bleeding_dysphagia', 'gi_bleeding_weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Esophago-airway fistula', warningFeatures: ['dyspnea', 'cough'], riskFactors: ['tumor_location'], timeWindowHours: [2160, 21600], severityTier: 'critical', description: 'Tumor erodes into trachea.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_dysphagia', 'gi_bleeding_weight_loss'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'occult'], site: 'esophageal', onset: 'chronic_occult', severity: 'occult', character: 'bright_red', painPattern: 'epigastric_pain', associatedSymptoms: ['dysphagia', 'weight_loss', 'anemia'], riskContext: ['alcohol', 'smoking'], mechanism: 'neoplastic', typicalDescription: 'Progressive dysphagia with weight loss and occult blood loss causing iron deficiency anemia.' },
};

export const boerhaaveSyndrome: DiseaseNode = {
  id: 'boerhaave_syndrome', name: 'Boerhaave Syndrome (Esophageal Rupture)', icdCode: 'K22.3', system: 'medical',
  organSystem: 'GI', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 30, ageMax: 80, agePeak: [45, 65], sexRisk: { male: 3, female: 1 }, backgroundPrevalence: 0.0001, riskFactors: [{ featureId: 'alcohol_use', label: 'Heavy alcohol / binge', LR_positive: 5, prevalenceInDisease: 0.6 }] },
  pathophysiology: { mechanism: 'Full-thickness esophageal perforation from sudden increased intraesophageal pressure during forceful vomiting. Mackler triad: vomiting, pain, subcutaneous emphysema. Surgical emergency with >50% mortality without surgery within 24h.', timelineStages: [{ stageId: 1, label: 'Acute perforation', typicalHoursFromOnset: [0, 6], dominantSymptoms: [sym('hematemesis', 0.6, 0.95), sym('vomiting', 0.8, 0.55), sym('pain_severity', 0.9, 0.5)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Excruciating tearing retrosternal pain', painLocationTypical: 'Retrosternal', painRadiationTypical: 'Back or left shoulder' }], progressionRule: 'Mediastinitis and septic shock within 12-24h without surgery.' },
  features: { symptoms: [sym('hematemesis', 0.6, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.4, 0.8, { stageRelevance: [1] }), sym('vomiting', 0.8, 0.55, { stageRelevance: [1] }), sym('pain_severity', 0.9, 0.5, { stageRelevance: [1] }), sym('pain_onset', 0.85, 0.7, { stageRelevance: [1] }), sym('dyspnea', 0.5, 0.75, { stageRelevance: [1] }), sym('fever', 0.5, 0.6, { stageRelevance: [1] }), sym('alcohol_use', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('pain_severity', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'Mild pain very unlikely' })], supporting: [] },
  differential: { mimics: ['mallory_weiss_tear', 'perforated_peptic_ulcer', 'acute_pancreatitis', 'acute_myocardial_infarction'], distinguishingFeatures: [{ fromDiseaseId: 'mallory_weiss_tear', featureIds: ['pain_severity', 'fever', 'dyspnea'] }], neverCloseConditions: ['aortic_dissection'] },
  complications: [{ name: 'Mediastinitis / septic shock', warningFeatures: ['fever', 'dyspnea'], riskFactors: ['delayed_treatment'], timeWindowHours: [6, 24], severityTier: 'critical', description: 'Necrotizing mediastinitis from gastric contents.' }],
  clinicalScores: [], redFlagFeatureIds: ['pain_severity', 'syncope'],
  giBleedingManifestation: { bleedingType: ['hematemesis'], site: 'esophageal', onset: 'acute', severity: 'massive_shock', character: 'bright_red', painPattern: 'epigastric_pain', associatedSymptoms: ['vomiting', 'fever'], riskContext: ['alcohol'], mechanism: 'mechanical_trauma', typicalDescription: 'Excruciating retrosternal pain after forceful vomiting with hematemesis. Surgical emergency.' },
};

export const pillEsophagitisBleeding: DiseaseNode = {
  id: 'pill_esophagitis_bleeding', name: 'Pill Esophagitis', icdCode: 'K22.1', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 85, agePeak: [40, 65], sexRisk: { male: 0.6, female: 1.4 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Medication-induced esophageal injury from pills (alendronate, KCl, NSAIDs, doxycycline). Causes odynophagia, retrosternal pain, minor hematemesis.', timelineStages: [{ stageId: 1, label: 'Mucosal injury', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('gi_bleeding_dysphagia', 0.7, 0.8), sym('hematemesis', 0.3, 0.95)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Severe retrosternal pain on swallowing', painLocationTypical: 'Retrosternal', painRadiationTypical: 'None' }], progressionRule: 'Self-limited after stopping medication.' },
  features: { symptoms: [sym('hematemesis', 0.3, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.15, 0.8, { stageRelevance: [1] }), sym('gi_bleeding_dysphagia', 0.7, 0.8, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('gi_bleeding_dysphagia', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'No odynophagia' })] },
  differential: { mimics: ['reflux_esophagitis_bleeding', 'infectious_esophagitis_bleeding', 'esophageal_cancer_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'reflux_esophagitis_bleeding', featureIds: ['pain_severity'] }], neverCloseConditions: [] },
  complications: [{ name: 'Esophageal stricture', warningFeatures: ['gi_bleeding_dysphagia'], riskFactors: ['alendronate'], timeWindowHours: [336, 2160], severityTier: 'moderate', description: 'Cicatricial narrowing from deep ulceration.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematemesis'], site: 'esophageal', onset: 'acute', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'epigastric_pain', associatedSymptoms: ['dysphagia'], riskContext: ['none'], mechanism: 'acid_related', typicalDescription: 'Acute odynophagia after taking pills with minor hematemesis.' },
};

// -------------------------------------------------------------------------------
// SECTION 2: UGIB - GASTRODUODENAL (9 nodes)
// -------------------------------------------------------------------------------

export const gastricUlcerBleeding: DiseaseNode = {
  id: 'gastric_ulcer_bleeding', name: 'Bleeding Gastric Ulcer', icdCode: 'K25.4', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 70], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.015, riskFactors: [{ featureId: 'nsaid_use', label: 'NSAID use', LR_positive: 4, prevalenceInDisease: 0.5 }, { featureId: 'smoking', label: 'Smoking', LR_positive: 2, prevalenceInDisease: 0.5 }] },
  pathophysiology: { mechanism: 'Gastric ulcers erode into submucosal vessels (most commonly left gastric artery). H. pylori and NSAIDs are dominant causes. PUD is the most common cause of UGIB (~50%).', timelineStages: [{ stageId: 1, label: 'Active ulcer bleeding', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('hematemesis', 0.7, 0.95), sym('melena', 0.8, 0.9), sym('gi_bleeding_painless', 0.4, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Gnawing epigastric pain', painLocationTypical: 'Epigastrium', painRadiationTypical: 'Back' }], progressionRule: '~80% stop spontaneously. Rebleeding 15-20% without endoscopic therapy.' },
  features: { symptoms: [sym('hematemesis', 0.7, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.5, 0.8, { stageRelevance: [1] }), sym('hematemesis_color', 0.6, 0.8, { stageRelevance: [1] }), sym('melena', 0.8, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.4, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_prior_gi_bleed', 0.4, 0.8, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.4, 0.9, { stageRelevance: [1] }), sym('nsaid_use', 0.5, 0.75, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('nsaid_use', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'No NSAID use or H pylori risk' })], supporting: [] },
  differential: { mimics: ['duodenal_ulcer_bleeding', 'acute_gastritis_bleeding', 'gastric_cancer_bleeding', 'dieulafoy_lesion'], distinguishingFeatures: [{ fromDiseaseId: 'duodenal_ulcer_bleeding', featureIds: ['melena', 'pain_character'] }, { fromDiseaseId: 'gastric_cancer_bleeding', featureIds: ['gi_bleeding_weight_loss'] }], neverCloseConditions: ['aortoenteric_fistula'] },
  complications: [{ name: 'Hemorrhagic shock', warningFeatures: ['gi_bleeding_syncope', 'hematemesis_volume'], riskFactors: ['anticoagulant_use'], timeWindowHours: [0, 24], severityTier: 'critical', description: 'Arterial bleed from left gastric artery.' }, { name: 'Ulcer perforation', warningFeatures: ['pain_severity', 'peritonism'], riskFactors: ['nsaid_use'], timeWindowHours: [24, 168], severityTier: 'critical', description: 'Ulcer penetrates gastric wall.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'gastric', onset: 'acute', severity: 'moderate', character: 'coffee_ground', painPattern: 'epigastric_pain', associatedSymptoms: ['vomiting', 'nausea', 'syncope', 'anemia'], riskContext: ['nsaid', 'alcohol', 'smoking', 'h_pylori', 'prior_gi_bleed'], mechanism: 'acid_related', typicalDescription: 'Epigastric pain with coffee-ground emesis and melena. Pain relieved by food. NSAID or H pylori associated.' },
};

export const duodenalUlcerBleeding: DiseaseNode = {
  id: 'duodenal_ulcer_bleeding', name: 'Bleeding Duodenal Ulcer', icdCode: 'K26.4', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 85, agePeak: [40, 65], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.02, riskFactors: [{ featureId: 'nsaid_use', label: 'NSAID use', LR_positive: 3, prevalenceInDisease: 0.4 }, { featureId: 'smoking', label: 'Smoking', LR_positive: 2, prevalenceInDisease: 0.5 }] },
  pathophysiology: { mechanism: 'Duodenal bulb ulcers erode into the gastroduodenal artery. Most common cause of melena. Hematemesis less frequent than with gastric ulcers.', timelineStages: [{ stageId: 1, label: 'Active bleeding', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('melena', 0.9, 0.9), sym('hematemesis', 0.5, 0.95), sym('gi_bleeding_painless', 0.3, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Gnawing epigastric pain relieved by food', painLocationTypical: 'Epigastrium', painRadiationTypical: 'Back' }], progressionRule: '~80-90% stop spontaneously. High rebleeding rate without PPI and H pylori eradication.' },
  features: { symptoms: [sym('melena', 0.9, 0.9, { stageRelevance: [1] }), sym('melena_frequency', 0.7, 0.75, { stageRelevance: [1] }), sym('melena_volume', 0.6, 0.7, { stageRelevance: [1] }), sym('melena_duration_days', 0.5, 0.6, { stageRelevance: [1] }), sym('hematemesis', 0.5, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.3, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_prior_gi_bleed', 0.4, 0.8, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.4, 0.9, { stageRelevance: [1] }), sym('nsaid_use', 0.4, 0.75, { stageRelevance: [1] }), sym('pain_character', 0.5, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('melena', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No melena' })], supporting: [] },
  differential: { mimics: ['gastric_ulcer_bleeding', 'dieulafoy_lesion', 'gastric_cancer_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['melena', 'hematemesis'] }], neverCloseConditions: ['aortoenteric_fistula'] },
  complications: [{ name: 'Hemorrhagic shock', warningFeatures: ['gi_bleeding_syncope', 'melena_volume'], riskFactors: ['anticoagulant_use'], timeWindowHours: [0, 24], severityTier: 'critical', description: 'Gastroduodenal artery bleed.' }, { name: 'Duodenal perforation', warningFeatures: ['pain_severity', 'peritonism'], riskFactors: ['nsaid_use'], timeWindowHours: [24, 168], severityTier: 'critical', description: 'Perforation into peritoneal cavity.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope'],
  giBleedingManifestation: { bleedingType: ['melena', 'hematemesis'], site: 'duodenal', onset: 'acute', severity: 'moderate', character: 'black_tarry', painPattern: 'epigastric_pain', associatedSymptoms: ['nausea', 'syncope', 'anemia'], riskContext: ['nsaid', 'smoking', 'h_pylori', 'prior_gi_bleed'], mechanism: 'acid_related', typicalDescription: 'Black tarry melena with gnawing epigastric pain relieved by food. Most common cause of melena.' },
};

export const acuteGastritisBleeding: DiseaseNode = {
  id: 'acute_gastritis_bleeding', name: 'Acute Hemorrhagic Gastritis', icdCode: 'K29.0', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [30, 55], sexRisk: { male: 1.3, female: 1 }, backgroundPrevalence: 0.01, riskFactors: [{ featureId: 'nsaid_use', label: 'NSAID use', LR_positive: 5, prevalenceInDisease: 0.6 }, { featureId: 'alcohol_use', label: 'Heavy alcohol', LR_positive: 4, prevalenceInDisease: 0.5 }] },
  pathophysiology: { mechanism: 'Acute gastric mucosal inflammation from NSAIDs, alcohol, or stress. Diffuse oozing rather than single arterial bleed. Coffee-ground emesis or melena.', timelineStages: [{ stageId: 1, label: 'Acute gastritis', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('hematemesis', 0.5, 0.95), sym('melena', 0.4, 0.9), sym('nausea', 0.7, 0.5)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Burning epigastric pain', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'Self-limited after removing offending agent.' },
  features: { symptoms: [sym('hematemesis', 0.5, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.3, 0.8, { stageRelevance: [1] }), sym('hematemesis_color', 0.4, 0.8, { stageRelevance: [1] }), sym('melena', 0.4, 0.9, { stageRelevance: [1] }), sym('nausea', 0.7, 0.5, { stageRelevance: [1] }), sym('nsaid_use', 0.6, 0.75, { stageRelevance: [1] }), sym('alcohol_use', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('nsaid_use', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No NSAID or alcohol trigger' })], supporting: [] },
  differential: { mimics: ['gastric_ulcer_bleeding', 'gastric_erosions_nsaid', 'stress_gastritis_icu_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['hematemesis_volume'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe hemorrhage', warningFeatures: ['hematemesis_frequency', 'gi_bleeding_syncope'], riskFactors: ['anticoagulant_use'], timeWindowHours: [24, 72], severityTier: 'moderate', description: 'Diffuse bleeding can become significant.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'gastric', onset: 'acute', severity: 'mild_self_limited', character: 'coffee_ground', painPattern: 'epigastric_pain', associatedSymptoms: ['nausea'], riskContext: ['nsaid', 'alcohol'], mechanism: 'acid_related', typicalDescription: 'Epigastric burning with coffee-ground emesis after NSAIDs or alcohol. Mild self-limited bleeding.' },
};

export const stressGastritisIcuBleeding: DiseaseNode = {
  id: 'stress_gastritis_icu_bleeding', name: 'Stress-Related Mucosal Disease', icdCode: 'K29.1', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 18, ageMax: 90, agePeak: [50, 75], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'ICU patients develop mucosal ischemia from splanchnic hypoperfusion. Stress ulcers in gastric fundus/body. Clinically significant bleeding in ~5% of ICU patients.', timelineStages: [{ stageId: 1, label: 'Stress-related bleeding', typicalHoursFromOnset: [72, 168], dominantSymptoms: [sym('hematemesis', 0.6, 0.95), sym('melena', 0.6, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Painless', painLocationTypical: 'Epigastric', painRadiationTypical: 'None' }], progressionRule: 'Bleeding 3-7 days after ICU admission. High mortality.' },
  features: { symptoms: [sym('hematemesis', 0.6, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.5, 0.8, { stageRelevance: [1] }), sym('melena', 0.6, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.9, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.5, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['gastric_ulcer_bleeding', 'acute_gastritis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['gi_bleeding_painless'] }], neverCloseConditions: [] },
  complications: [{ name: 'Multiorgan failure', warningFeatures: ['gi_bleeding_syncope'], riskFactors: ['sepsis'], timeWindowHours: [24, 168], severityTier: 'critical', description: 'Exacerbates ICU hemodynamic instability.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'gastric', onset: 'subacute', severity: 'moderate', character: 'coffee_ground', painPattern: 'painless', associatedSymptoms: ['none'], riskContext: ['none'], mechanism: 'acid_related', typicalDescription: 'Painless UGIB in ICU patient 3-7 days after admission from splanchnic ischemia.' },
};

export const gastricCancerBleeding: DiseaseNode = {
  id: 'gastric_cancer_bleeding', name: 'Gastric Cancer (Adenocarcinoma)', icdCode: 'C16.9', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [55, 75], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [{ featureId: 'smoking', label: 'Smoking', LR_positive: 2, prevalenceInDisease: 0.5 }] },
  pathophysiology: { mechanism: 'Gastric adenocarcinoma causing bleeding from tumor friability. Usually occult with iron deficiency anemia. Overt bleeding in advanced disease.', timelineStages: [{ stageId: 1, label: 'Bleeding from gastric tumor', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('hematemesis', 0.4, 0.95), sym('melena', 0.5, 0.9), sym('gi_bleeding_weight_loss', 0.8, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull epigastric pain', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'Progressive. Early stage >90% 5yr survival; advanced <30%.' },
  features: { symptoms: [sym('hematemesis', 0.4, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.3, 0.8, { stageRelevance: [1] }), sym('melena', 0.5, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_weight_loss', 0.8, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.6, 0.85, { stageRelevance: [1] }), sym('anorexia', 0.6, 0.5, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_weight_loss', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No weight loss' })], supporting: [] },
  differential: { mimics: ['gastric_ulcer_bleeding', 'gastric_lymphoma', 'gi_lymphoma_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['gi_bleeding_weight_loss', 'nsaid_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Gastric outlet obstruction', warningFeatures: ['vomiting', 'gi_bleeding_weight_loss'], riskFactors: ['antral_tumor'], timeWindowHours: [2160, 21600], severityTier: 'moderate', description: 'Tumor obstructs pylorus.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_weight_loss', 'gi_bleeding_iron_deficiency'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena', 'occult'], site: 'gastric', onset: 'chronic_occult', severity: 'occult', character: 'coffee_ground', painPattern: 'epigastric_pain', associatedSymptoms: ['weight_loss', 'nausea', 'anemia'], riskContext: ['smoking', 'h_pylori'], mechanism: 'neoplastic', typicalDescription: 'Chronic occult blood loss with iron deficiency anemia, weight loss, and early satiety.' },
};

export const dieulafoyLesion: DiseaseNode = {
  id: 'dieulafoy_lesion', name: 'Dieulafoy Lesion', icdCode: 'K31.82', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 40, ageMax: 85, agePeak: [55, 75], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Abnormally large (1-3mm) submucosal artery protruding through a small mucosal defect, typically in proximal stomach. Causes recurrent massive painless UGIB. Bleeding is intermittent due to clot formation/dissolution.', timelineStages: [{ stageId: 1, label: 'Acute massive bleed', typicalHoursFromOnset: [0, 12], dominantSymptoms: [sym('hematemesis', 0.8, 0.95), sym('melena', 0.7, 0.9), sym('gi_bleeding_painless', 0.95, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Painless', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Intermittent massive bleeds. High rebleeding rate.' },
  features: { symptoms: [sym('hematemesis', 0.8, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.85, 0.8, { stageRelevance: [1] }), sym('hematemesis_color', 0.7, 0.7, { stageRelevance: [1] }), sym('melena', 0.7, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.95, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.7, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_painless', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'Pain present - unlikely' })], supporting: [] },
  differential: { mimics: ['gastric_ulcer_bleeding', 'esophageal_varices_bleeding', 'mallory_weiss_tear'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['gi_bleeding_painless'] }], neverCloseConditions: ['aortoenteric_fistula'] },
  complications: [{ name: 'Recurrent massive hemorrhage', warningFeatures: ['hematemesis_volume', 'gi_bleeding_syncope'], riskFactors: [], timeWindowHours: [12, 72], severityTier: 'critical', description: 'Lesion rebleeds after initial hemostasis.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'gastric', onset: 'acute', severity: 'massive_shock', character: 'bright_red', painPattern: 'painless', associatedSymptoms: ['syncope', 'anemia'], riskContext: ['none'], mechanism: 'vascular_malformation', typicalDescription: 'Recurrent massive painless hematemesis in elderly. Intermittent bleeding requires precise timing of endoscopy.' },
};

export const cameronUlcers: DiseaseNode = {
  id: 'cameron_ulcers', name: 'Cameron Ulcers (Hiatal Hernia)', icdCode: 'K44.9', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 40, ageMax: 85, agePeak: [60, 80], sexRisk: { male: 0.6, female: 1.4 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Linear gastric erosions at the diaphragmatic hiatus in large hiatal hernias. Chronic occult blood loss and iron deficiency anemia rather than overt bleeding.', timelineStages: [{ stageId: 1, label: 'Chronic erosions', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('hematemesis', 0.2, 0.95), sym('gi_bleeding_iron_deficiency', 0.7, 0.85), sym('heartburn', 0.6, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Minimal', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Chronic waxing and waning.' },
  features: { symptoms: [sym('hematemesis', 0.2, 0.95, { stageRelevance: [1] }), sym('melena', 0.15, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.7, 0.85, { stageRelevance: [1] }), sym('heartburn', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('gi_bleeding_iron_deficiency', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No iron deficiency' })] },
  differential: { mimics: ['reflux_esophagitis_bleeding', 'gastric_ulcer_bleeding', 'colorectal_cancer_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['gi_bleeding_iron_deficiency', 'heartburn'] }], neverCloseConditions: ['colorectal_cancer_bleeding'] },
  complications: [{ name: 'Severe iron deficiency anemia', warningFeatures: ['gi_bleeding_iron_deficiency'], riskFactors: ['large_hiatal_hernia'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Chronic blood loss causing anemia.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_iron_deficiency'],
  giBleedingManifestation: { bleedingType: ['occult', 'hematemesis'], site: 'gastric', onset: 'chronic_occult', severity: 'occult', character: 'occult', painPattern: 'painless', associatedSymptoms: ['anemia'], riskContext: ['gerd'], mechanism: 'mechanical_trauma', typicalDescription: 'Chronic iron deficiency anemia in elderly with large hiatal hernia from linear erosions at the hiatus.' },
};

export const gastricErosionsNsaid: DiseaseNode = {
  id: 'gastric_erosions_nsaid', name: 'NSAID-Induced Gastric Erosions', icdCode: 'K29.6', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 70], sexRisk: { male: 0.8, female: 1.2 }, backgroundPrevalence: 0.015, riskFactors: [{ featureId: 'nsaid_use', label: 'NSAID use', LR_positive: 8, prevalenceInDisease: 0.9 }, { featureId: 'anticoagulant_use', label: 'Anticoagulant use', LR_positive: 3, prevalenceInDisease: 0.2 }] },
  pathophysiology: { mechanism: 'NSAIDs inhibit COX-1/2 reducing mucosal prostaglandins. Shallow erosions (not reaching muscularis mucosae) cause bleeding, especially with anticoagulants.', timelineStages: [{ stageId: 1, label: 'Erosive gastropathy', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('hematemesis', 0.4, 0.95), sym('melena', 0.3, 0.9), sym('nsaid_use', 0.9, 0.75)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Epigastric burning', painLocationTypical: 'Epigastrium', painRadiationTypical: 'None' }], progressionRule: 'Reversible upon NSAID cessation.' },
  features: { symptoms: [sym('hematemesis', 0.4, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.2, 0.8, { stageRelevance: [1] }), sym('melena', 0.3, 0.9, { stageRelevance: [1] }), sym('nsaid_use', 0.9, 0.75, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.3, 0.85, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('nsaid_use', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No NSAID use' })], supporting: [] },
  differential: { mimics: ['gastric_ulcer_bleeding', 'acute_gastritis_bleeding', 'duodenal_ulcer_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['hematemesis_volume', 'nsaid_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Progression to gastric ulcer', warningFeatures: ['hematemesis_frequency'], riskFactors: ['continued_nsaid_use', 'anticoagulant_use'], timeWindowHours: [168, 2160], severityTier: 'moderate', description: 'Erosions deepen into ulcers with continued NSAID use.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'gastric', onset: 'subacute', severity: 'mild_self_limited', character: 'coffee_ground', painPattern: 'epigastric_pain', associatedSymptoms: ['nausea'], riskContext: ['nsaid'], mechanism: 'acid_related', typicalDescription: 'Epigastric burning with coffee-ground emesis in a patient taking NSAIDs.' },
};

export const gaveWatermelonStomach: DiseaseNode = {
  id: 'gave_watermelon_stomach', name: 'GAVE / Watermelon Stomach', icdCode: 'K31.7', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 40, ageMax: 85, agePeak: [60, 75], sexRisk: { male: 0.3, female: 1.7 }, backgroundPrevalence: 0.001, riskFactors: [{ featureId: 'cirrhosis', label: 'Cirrhosis', LR_positive: 4, prevalenceInDisease: 0.3 }] },
  pathophysiology: { mechanism: 'Dilated tortuous vessels in gastric antrum creating a watermelon appearance. Causes chronic GI bleeding and iron deficiency anemia. Associated with cirrhosis, autoimmune disease, renal failure.', timelineStages: [{ stageId: 1, label: 'Chronic bleeding', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('hematemesis', 0.2, 0.95), sym('melena', 0.3, 0.9), sym('gi_bleeding_iron_deficiency', 0.8, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Painless', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Chronic waxing and waning. Endoscopic ablation may be needed.' },
  features: { symptoms: [sym('hematemesis', 0.2, 0.95, { stageRelevance: [1] }), sym('melena', 0.3, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.8, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_liver_disease', 0.3, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.8, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_iron_deficiency', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No iron deficiency' })], supporting: [] },
  differential: { mimics: ['colonic_angiodysplasia', 'cameron_ulcers', 'gastric_ulcer_bleeding', 'colorectal_cancer_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'colonic_angiodysplasia', featureIds: ['hematemesis'] }], neverCloseConditions: [] },
  complications: [{ name: 'Transfusion-dependent anemia', warningFeatures: ['gi_bleeding_iron_deficiency'], riskFactors: ['cirrhosis'], timeWindowHours: [4320, 43200], severityTier: 'moderate', description: 'Chronic blood loss requiring transfusions.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_iron_deficiency'],
  giBleedingManifestation: { bleedingType: ['occult', 'melena'], site: 'gastric', onset: 'chronic_occult', severity: 'occult', character: 'occult', painPattern: 'painless', associatedSymptoms: ['anemia'], riskContext: ['portal_hypertension'], mechanism: 'vascular_malformation', typicalDescription: 'Chronic iron deficiency anemia with watermelon appearance of gastric antrum on endoscopy.' },
};

// -------------------------------------------------------------------------------
// SECTION 3: UGIB - VASCULAR/EMERGENCY (3 nodes)
// -------------------------------------------------------------------------------

export const aortoentericFistula: DiseaseNode = {
  id: 'aortoenteric_fistula', name: 'Aortoenteric Fistula', icdCode: 'I77.2', system: 'surgical',
  organSystem: 'cardiovascular', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 50, ageMax: 85, agePeak: [65, 80], sexRisk: { male: 2.5, female: 1 }, backgroundPrevalence: 0.0001, riskFactors: [{ featureId: 'prior_abdominal_surgery', label: 'Prior AAA repair', LR_positive: 20, prevalenceInDisease: 0.7 }, { featureId: 'gi_bleeding_known_aaa', label: 'Known AAA', LR_positive: 10, prevalenceInDisease: 0.3 }] },
  pathophysiology: { mechanism: 'Communication between aorta and duodenum (3rd portion). Usually after AAA repair. Sentinel bleed followed by catastrophic hemorrhage. Mortality >80% without emergency surgery.', timelineStages: [{ stageId: 1, label: 'Sentinel bleed', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('hematemesis', 0.6, 0.95), sym('melena', 0.5, 0.9), sym('gi_bleeding_known_aaa', 0.7, 0.95)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Mild epigastric/back pain', painLocationTypical: 'Epigastrium', painRadiationTypical: 'Back' }], progressionRule: 'Catastrophic hemorrhage follows sentinel bleed within hours to days.' },
  features: { symptoms: [sym('hematemesis', 0.6, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.7, 0.8, { stageRelevance: [1] }), sym('melena', 0.5, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_known_aaa', 0.7, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.3, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.5, 0.9, { stageRelevance: [1] }), sym('prior_abdominal_surgery', 0.7, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_known_aaa', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No AAA or aortic surgery' })], supporting: [] },
  differential: { mimics: ['gastric_ulcer_bleeding', 'duodenal_ulcer_bleeding', 'esophageal_varices_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['gi_bleeding_known_aaa', 'prior_abdominal_surgery'] }], neverCloseConditions: ['boerhaave_syndrome'] },
  complications: [{ name: 'Exsanguination', warningFeatures: ['gi_bleeding_syncope', 'hematemesis_volume'], riskFactors: ['delayed_diagnosis'], timeWindowHours: [6, 48], severityTier: 'critical', description: 'Catastrophic hemorrhage from aortoenteric communication.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope', 'gi_bleeding_known_aaa'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'duodenal', onset: 'acute', severity: 'massive_shock', character: 'bright_red', painPattern: 'abdominal_pain', associatedSymptoms: ['syncope'], riskContext: ['aaa'], mechanism: 'mechanical_trauma', typicalDescription: 'Sentinel bleed then catastrophic hemorrhage in a patient with prior AAA repair.' },
};

export const hemobilia: DiseaseNode = {
  id: 'hemobilia', name: 'Hemobilia (Biliary Bleeding)', icdCode: 'K83.8', system: 'medical',
  organSystem: 'hepatobiliary', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [{ featureId: 'prior_abdominal_surgery', label: 'Recent ERCP / biliary intervention', LR_positive: 10, prevalenceInDisease: 0.5 }, { featureId: 'known_gallstones', label: 'Gallstones', LR_positive: 2, prevalenceInDisease: 0.3 }] },
  pathophysiology: { mechanism: 'Bleeding into biliary tree from liver/gallbladder/bile ducts. Quincke triad: biliary colic, jaundice, GI bleeding via ampulla of Vater.', timelineStages: [{ stageId: 1, label: 'Active hemobilia', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('hematemesis', 0.5, 0.95), sym('melena', 0.6, 0.9), sym('jaundice', 0.5, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'RUQ colicky pain', painLocationTypical: 'Right upper quadrant', painRadiationTypical: 'Right shoulder' }], progressionRule: 'May stop spontaneously. Angiography with embolization often needed.' },
  features: { symptoms: [sym('hematemesis', 0.5, 0.95, { stageRelevance: [1] }), sym('melena', 0.6, 0.9, { stageRelevance: [1] }), sym('jaundice', 0.5, 0.9, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('known_gallstones', 0.3, 0.85, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('jaundice', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No jaundice' })], supporting: [] },
  differential: { mimics: ['gastric_ulcer_bleeding', 'duodenal_ulcer_bleeding', 'acute_cholangitis'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['jaundice', 'pain_character'] }], neverCloseConditions: [] },
  complications: [{ name: 'Obstructive cholangitis', warningFeatures: ['fever', 'jaundice'], riskFactors: ['clot_in_bile_duct'], timeWindowHours: [24, 72], severityTier: 'severe', description: 'Blood clots obstruct biliary tree.' }],
  clinicalScores: [], redFlagFeatureIds: ['jaundice'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'duodenal', onset: 'acute', severity: 'moderate', character: 'dark_red_maroon', painPattern: 'abdominal_pain', associatedSymptoms: ['jaundice'], riskContext: ['none'], mechanism: 'mechanical_trauma', typicalDescription: 'Quincke triad: RUQ colicky pain, jaundice, GI bleeding via ampulla after biliary instrumentation.' },
};

export const pancreaticPseudocystBleeding: DiseaseNode = {
  id: 'pancreatic_pseudocyst_bleeding', name: 'Bleeding Pancreatic Pseudocyst', icdCode: 'K86.3', system: 'medical',
  organSystem: 'pancreatic', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 25, ageMax: 70, agePeak: [35, 55], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.0003, riskFactors: [{ featureId: 'alcohol_use', label: 'Chronic alcohol / pancreatitis', LR_positive: 5, prevalenceInDisease: 0.6 }] },
  pathophysiology: { mechanism: 'Pseudocyst erodes into peripancreatic vessel (splenic artery). Hemorrhage into pseudocyst (pseudoaneurysm) decompresses via pancreatic duct (hemosuccus pancreaticus).', timelineStages: [{ stageId: 1, label: 'Hemorrhage', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('hematemesis', 0.5, 0.95), sym('melena', 0.6, 0.9), sym('pain_severity', 0.7, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe epigastric pain to back', painLocationTypical: 'Epigastrium / LUQ', painRadiationTypical: 'Back' }], progressionRule: 'High mortality without intervention.' },
  features: { symptoms: [sym('hematemesis', 0.5, 0.95, { stageRelevance: [1] }), sym('hematemesis_volume', 0.5, 0.8, { stageRelevance: [1] }), sym('melena', 0.6, 0.9, { stageRelevance: [1] }), sym('pain_severity', 0.7, 0.5, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('alcohol_use', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('alcohol_use', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'No pancreatitis history' })] },
  differential: { mimics: ['gastric_ulcer_bleeding', 'duodenal_ulcer_bleeding', 'hemobilia', 'acute_pancreatitis'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_ulcer_bleeding', featureIds: ['pain_radiation', 'alcohol_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Hemorrhagic shock', warningFeatures: ['gi_bleeding_syncope', 'hematemesis_volume'], riskFactors: ['delayed_diagnosis'], timeWindowHours: [6, 48], severityTier: 'critical', description: 'Massive hemorrhage into pseudocyst.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'duodenal', onset: 'acute', severity: 'moderate', character: 'dark_red_maroon', painPattern: 'epigastric_pain', associatedSymptoms: ['vomiting'], riskContext: ['alcohol'], mechanism: 'vascular_malformation', typicalDescription: 'Epigastric pain to back in known pancreatitis patient with hematemesis from pseudoaneurysm eroding into pancreatic duct.' },
};

// -------------------------------------------------------------------------------
// SECTION 4: LGIB - COLONIC (10 nodes)
// -------------------------------------------------------------------------------

export const diverticularBleeding: DiseaseNode = {
  id: 'diverticular_bleeding', name: 'Diverticular Hemorrhage', icdCode: 'K57.3', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 40, ageMax: 90, agePeak: [65, 85], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.015, riskFactors: [{ featureId: 'constipation', label: 'Diverticulosis', LR_positive: 3, prevalenceInDisease: 0.8 }, { featureId: 'nsaid_use', label: 'NSAID use', LR_positive: 2.5, prevalenceInDisease: 0.4 }, { featureId: 'anticoagulant_use', label: 'Anticoagulant use', LR_positive: 2, prevalenceInDisease: 0.2 }] },
  pathophysiology: { mechanism: 'Diverticulum rupture of vasa recta artery causing painless massive hematochezia. Most common LGIB (40-50%). Right-sided diverticula bleed more severely.', timelineStages: [{ stageId: 1, label: 'Active bleeding', typicalHoursFromOnset: [0, 12], dominantSymptoms: [sym('hematochezia', 0.9, 0.95), sym('gi_bleeding_painless', 0.85, 0.7)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Painless', painLocationTypical: 'Left lower quadrant', painRadiationTypical: 'None' }], progressionRule: '~80% stop spontaneously. Rebleeding ~20-30%.' },
  features: { symptoms: [sym('hematochezia', 0.9, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.8, 0.7, { stageRelevance: [1] }), sym('hematochezia_color', 0.7, 0.7, { stageRelevance: [1] }), sym('hematochezia_frequency', 0.6, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.85, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.5, 0.9, { stageRelevance: [1] }), sym('nsaid_use', 0.4, 0.75, { stageRelevance: [1] }), sym('anticoagulant_use', 0.2, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_painless', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'Painful hematochezia' })], supporting: [] },
  differential: { mimics: ['colonic_angiodysplasia', 'colorectal_cancer_bleeding', 'ischemic_colitis_bleeding', 'hemorrhoids_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'colonic_angiodysplasia', featureIds: ['hematochezia_volume'] }, { fromDiseaseId: 'ischemic_colitis_bleeding', featureIds: ['gi_bleeding_painless'] }], neverCloseConditions: ['colorectal_cancer_bleeding'] },
  complications: [{ name: 'Hemorrhagic shock', warningFeatures: ['gi_bleeding_syncope', 'hematochezia_volume'], riskFactors: ['anticoagulant_use'], timeWindowHours: [0, 12], severityTier: 'critical', description: 'Arterial rupture into diverticulum.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope'],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'colonic', onset: 'acute', severity: 'moderate', character: 'bright_red', painPattern: 'painless', associatedSymptoms: ['syncope', 'anemia'], riskContext: ['nsaid', 'anticoagulant', 'prior_gi_bleed'], mechanism: 'vascular_malformation', typicalDescription: 'Painless massive hematochezia in elderly. Most common cause of LGIB. Typically self-limited.' },
};

export const colorectalCancerBleeding: DiseaseNode = {
  id: 'colorectal_cancer_bleeding', name: 'Colorectal Cancer with Bleeding', icdCode: 'C18.9', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 40, ageMax: 90, agePeak: [60, 80], sexRisk: { male: 1.3, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [{ featureId: 'family_history_gi_cancer', label: 'Family history of CRC', LR_positive: 3, prevalenceInDisease: 0.2 }, { featureId: 'smoking', label: 'Smoking', LR_positive: 1.5, prevalenceInDisease: 0.3 }] },
  pathophysiology: { mechanism: 'Colorectal adenocarcinoma causes chronic occult blood loss. Right-sided tumors present with iron deficiency anemia; left-sided with visible hematochezia.', timelineStages: [{ stageId: 1, label: 'Bleeding from tumor', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('hematochezia', 0.6, 0.95), sym('gi_bleeding_iron_deficiency', 0.7, 0.85), sym('gi_bleeding_weight_loss', 0.5, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Often painless', painLocationTypical: 'Variable', painRadiationTypical: 'None' }], progressionRule: 'Progressive. Early >90% 5yr survival; advanced <15%.' },
  features: { symptoms: [sym('hematochezia', 0.6, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.3, 0.7, { stageRelevance: [1] }), sym('hematochezia_color', 0.5, 0.7, { stageRelevance: [1] }), sym('hematochezia_relation_to_stool', 0.5, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.7, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_weight_loss', 0.5, 0.85, { stageRelevance: [1] }), sym('alternat_bowel', 0.3, 0.8, { stageRelevance: [1] }), sym('constipation', 0.3, 0.75, { stageRelevance: [1] }), sym('tenesmus', 0.2, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_iron_deficiency', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No iron deficiency' })], supporting: [] },
  differential: { mimics: ['diverticular_bleeding', 'colonic_angiodysplasia', 'hemorrhoids_bleeding', 'rectal_polyps_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'diverticular_bleeding', featureIds: ['gi_bleeding_weight_loss'] }, { fromDiseaseId: 'hemorrhoids_bleeding', featureIds: ['gi_bleeding_iron_deficiency', 'hematochezia_relation_to_stool'] }], neverCloseConditions: [] },
  complications: [{ name: 'Bowel obstruction', warningFeatures: ['constipation', 'abdominal_distension'], riskFactors: ['left_sided_tumor'], timeWindowHours: [4320, 43200], severityTier: 'moderate', description: 'Tumor obstructs colonic lumen.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_weight_loss', 'gi_bleeding_iron_deficiency'],
  giBleedingManifestation: { bleedingType: ['hematochezia', 'occult'], site: 'colonic', onset: 'chronic_occult', severity: 'occult', character: 'dark_red_maroon', painPattern: 'painless', associatedSymptoms: ['weight_loss', 'tenesmus', 'anemia'], riskContext: ['smoking', 'prior_gi_bleed'], mechanism: 'neoplastic', typicalDescription: 'Chronic occult blood loss causing iron deficiency anemia. Left-sided tumors may show visible blood.' },
};

export const colonicAngiodysplasia: DiseaseNode = {
  id: 'colonic_angiodysplasia', name: 'Colonic Angiodysplasia', icdCode: 'K55.2', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 50, ageMax: 90, agePeak: [65, 85], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [{ featureId: 'htn_cad', label: 'Vascular disease', LR_positive: 2, prevalenceInDisease: 0.6 }, { featureId: 'aortic_stenosis', label: 'Aortic stenosis (Heyde)', LR_positive: 3, prevalenceInDisease: 0.2 }] },
  pathophysiology: { mechanism: 'Degenerative vascular ectasias in cecum/ascending colon. Second most common LGIB in elderly. Painless, can be occult or acute. Heyde syndrome: aortic stenosis + angiodysplasia.', timelineStages: [{ stageId: 1, label: 'Angiodysplasia bleeding', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('hematochezia', 0.85, 0.95), sym('gi_bleeding_painless', 0.9, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Painless', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Intermittent bleeding episodes.' },
  features: { symptoms: [sym('hematochezia', 0.85, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.6, 0.7, { stageRelevance: [1] }), sym('hematochezia_color', 0.6, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.9, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_painless', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.08, label: 'Painful bleeding' })], supporting: [] },
  differential: { mimics: ['diverticular_bleeding', 'colorectal_cancer_bleeding', 'small_bowel_angiodysplasia'], distinguishingFeatures: [{ fromDiseaseId: 'diverticular_bleeding', featureIds: ['hematochezia_volume'] }], neverCloseConditions: [] },
  complications: [{ name: 'Chronic anemia', warningFeatures: ['gi_bleeding_iron_deficiency'], riskFactors: ['multiple_lesions'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Recurrent intermittent bleeding.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematochezia', 'occult'], site: 'colonic', onset: 'intermittent', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'painless', associatedSymptoms: ['anemia'], riskContext: ['none'], mechanism: 'vascular_malformation', typicalDescription: 'Painless recurrent hematochezia in elderly from right colon angiodysplasia. May be associated with aortic stenosis.' },
};

export const ischemicColitisBleeding: DiseaseNode = {
  id: 'ischemic_colitis_bleeding', name: 'Ischemic Colitis', icdCode: 'K55.1', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 50, ageMax: 85, agePeak: [60, 80], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.008, riskFactors: [{ featureId: 'htn_cad', label: 'Hypertension / vascular disease', LR_positive: 3, prevalenceInDisease: 0.5 }] },
  pathophysiology: { mechanism: 'Colonic hypoperfusion causing mucosal inflammation at watershed areas (splenic flexure, rectosigmoid). Sudden crampy LLQ pain then bloody diarrhea. ~85% resolve spontaneously.', timelineStages: [{ stageId: 1, label: 'Acute ischemia', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('hematochezia', 0.8, 0.95), sym('pain_severity', 0.7, 0.5), sym('diarrhea', 0.6, 0.7)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Sudden cramping LLQ pain', painLocationTypical: 'Left lower quadrant', painRadiationTypical: 'None' }], progressionRule: '~85% resolve. Gangrenous form requires surgery.' },
  features: { symptoms: [sym('hematochezia', 0.8, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.5, 0.7, { stageRelevance: [1] }), sym('pain_character', 0.7, 0.6, { stageRelevance: [1] }), sym('pain_severity', 0.7, 0.5, { stageRelevance: [1] }), sym('diarrhea', 0.6, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.1, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_painless', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'Painless - against ischemic colitis' })], supporting: [] },
  differential: { mimics: ['diverticular_bleeding', 'colorectal_cancer_bleeding', 'ulcerative_colitis_bleeding', 'infectious_colitis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'diverticular_bleeding', featureIds: ['pain_character'] }, { fromDiseaseId: 'infectious_colitis_bleeding', featureIds: ['fever'] }], neverCloseConditions: ['mesenteric_ischemia'] },
  complications: [{ name: 'Colonic gangrene / perforation', warningFeatures: ['pain_severity', 'peritonism', 'fever'], riskFactors: ['hypotension'], timeWindowHours: [24, 72], severityTier: 'critical', description: 'Full-thickness necrosis causing peritonitis.' }],
  clinicalScores: [], redFlagFeatureIds: ['pain_severity'],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'colonic', onset: 'acute', severity: 'moderate', character: 'bright_red', painPattern: 'abdominal_pain', associatedSymptoms: ['diarrhea'], riskContext: ['none'], mechanism: 'ischemic', typicalDescription: 'Sudden crampy LLQ pain followed by bloody diarrhea in elderly with vascular risk factors.' },
};

export const ulcerativeColitisBleeding: DiseaseNode = {
  id: 'ulcerative_colitis_bleeding', name: 'Ulcerative Colitis (Active Flare)', icdCode: 'K51.9', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 65, agePeak: [20, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [{ featureId: 'family_history_gi_cancer', label: 'Family history of IBD', LR_positive: 3, prevalenceInDisease: 0.15 }] },
  pathophysiology: { mechanism: 'Chronic mucosal inflammation starting in rectum extending proximally. Friability causes bloody diarrhea with mucus, tenesmus, urgency.', timelineStages: [{ stageId: 1, label: 'Active colitis flare', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('hematochezia', 0.85, 0.95), sym('diarrhea', 0.9, 0.7), sym('tenesmus', 0.7, 0.8)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping lower abdominal pain', painLocationTypical: 'Left lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'May progress to fulminant colitis / toxic megacolon if untreated.' },
  features: { symptoms: [sym('hematochezia', 0.85, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.4, 0.7, { stageRelevance: [1] }), sym('hematochezia_relation_to_stool', 0.6, 0.7, { stageRelevance: [1] }), sym('hematochezia_frequency', 0.6, 0.7, { stageRelevance: [1] }), sym('diarrhea', 0.9, 0.7, { stageRelevance: [1] }), sym('tenesmus', 0.7, 0.8, { stageRelevance: [1] }), sym('mucus_stool', 0.5, 0.85, { stageRelevance: [1] }), sym('diarrhoea_nocturnal', 0.6, 0.85, { stageRelevance: [1] }), sym('fever', 0.3, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('diarrhea', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No diarrhea' })] },
  differential: { mimics: ['crohn_colitis_bleeding', 'infectious_colitis_bleeding', 'ischemic_colitis_bleeding', 'proctitis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'infectious_colitis_bleeding', featureIds: ['diarrhoea_nocturnal', 'tenesmus'] }, { fromDiseaseId: 'crohn_colitis_bleeding', featureIds: ['perianal_disease'] }], neverCloseConditions: ['colorectal_cancer_bleeding'] },
  complications: [{ name: 'Toxic megacolon', warningFeatures: ['fever', 'abdominal_distension'], riskFactors: ['severe_flare'], timeWindowHours: [72, 336], severityTier: 'critical', description: 'Colonic dilation >6cm requiring emergency colectomy.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'gi_bleeding_weight_loss'],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'colonic', onset: 'subacute', severity: 'moderate', character: 'bright_red', painPattern: 'abdominal_pain', associatedSymptoms: ['diarrhea', 'tenesmus', 'fever'], riskContext: ['smoking'], mechanism: 'inflammatory', typicalDescription: 'Bloody diarrhea with mucus, tenesmus, urgency starting in rectum. Relapsing-remitting chronic condition.' },
};

export const crohnColitisBleeding: DiseaseNode = {
  id: 'crohn_colitis_bleeding', name: 'Crohn Colitis with Bleeding', icdCode: 'K50.1', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 65, agePeak: [20, 40], sexRisk: { male: 0.9, female: 1.1 }, backgroundPrevalence: 0.003, riskFactors: [{ featureId: 'smoking', label: 'Smoking', LR_positive: 2, prevalenceInDisease: 0.4 }] },
  pathophysiology: { mechanism: 'Transmural colonic inflammation with deep fissuring ulcers, cobblestoning. Bleeding less common than UC but can be severe. Perianal fistulas and strictures may co-exist.', timelineStages: [{ stageId: 1, label: 'Crohn colitis flare', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('hematochezia', 0.5, 0.95), sym('diarrhea', 0.85, 0.7), sym('pain_severity', 0.6, 0.5)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping RLQ or diffuse pain', painLocationTypical: 'Right lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'Chronic relapsing. May progress to stricture/fistula.' },
  features: { symptoms: [sym('hematochezia', 0.5, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.3, 0.7, { stageRelevance: [1] }), sym('diarrhea', 0.85, 0.7, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.85, { stageRelevance: [1] }), sym('fever', 0.4, 0.6, { stageRelevance: [1] }), sym('nausea', 0.3, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('diarrhea', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No diarrhea' })], supporting: [] },
  differential: { mimics: ['ulcerative_colitis_bleeding', 'infectious_colitis_bleeding', 'ischemic_colitis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'ulcerative_colitis_bleeding', featureIds: ['pain_character', 'fever'] }], neverCloseConditions: ['colorectal_cancer_bleeding'] },
  complications: [{ name: 'Colonic stricture / obstruction', warningFeatures: ['constipation', 'abdominal_distension'], riskFactors: ['chronic_inflammation'], timeWindowHours: [4320, 43200], severityTier: 'moderate', description: 'Fibrotic narrowing from transmural inflammation.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'gi_bleeding_weight_loss'],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'colonic', onset: 'subacute', severity: 'moderate', character: 'bright_red', painPattern: 'abdominal_pain', associatedSymptoms: ['diarrhea', 'fever', 'weight_loss'], riskContext: ['smoking'], mechanism: 'inflammatory', typicalDescription: 'RLQ cramping with bloody diarrhea in a young adult. May have perianal fistulas.' },
};

export const infectiousColitisBleeding: DiseaseNode = {
  id: 'infectious_colitis_bleeding', name: 'Infectious Colitis', icdCode: 'A09', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 85, agePeak: [15, 45], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.02, riskFactors: [{ featureId: 'recent_travel', label: 'Recent travel', LR_positive: 3, prevalenceInDisease: 0.4 }, { featureId: 'hiv_status', label: 'HIV / immunosuppression', LR_positive: 2.5, prevalenceInDisease: 0.1 }] },
  pathophysiology: { mechanism: 'Shigella, Salmonella, Campylobacter, EHEC, C diff, amoeba cause inflammatory colitis. Bloody diarrhea with fever, tenesmus, abdominal cramping. EHEC can cause HUS in children.', timelineStages: [{ stageId: 1, label: 'Acute infectious colitis', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('hematochezia', 0.6, 0.95), sym('diarrhea', 0.9, 0.7), sym('fever', 0.8, 0.6)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Cramping lower abdominal pain', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Typically self-limited 3-7 days.' },
  features: { symptoms: [sym('hematochezia', 0.6, 0.95, { stageRelevance: [1] }), sym('hematochezia_frequency', 0.5, 0.7, { stageRelevance: [1] }), sym('diarrhea', 0.9, 0.7, { stageRelevance: [1] }), sym('fever', 0.8, 0.6, { stageRelevance: [1] }), sym('tenesmus', 0.5, 0.8, { stageRelevance: [1] }), sym('nausea', 0.5, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('fever', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No fever' })], supporting: [] },
  differential: { mimics: ['ulcerative_colitis_bleeding', 'crohn_colitis_bleeding', 'ischemic_colitis_bleeding', 'diverticular_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'ulcerative_colitis_bleeding', featureIds: ['fever', 'recent_travel'] }], neverCloseConditions: ['hemolytic_uremic_syndrome'] },
  complications: [{ name: 'Hemolytic uremic syndrome', warningFeatures: ['fever', 'hematochezia_frequency'], riskFactors: ['children'], timeWindowHours: [72, 168], severityTier: 'critical', description: 'Shiga toxin causes microangiopathic hemolytic anemia and renal failure.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever'],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'colonic', onset: 'acute', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'abdominal_pain', associatedSymptoms: ['diarrhea', 'fever', 'tenesmus'], riskContext: ['none'], mechanism: 'infectious', typicalDescription: 'Acute bloody diarrhea with fever and abdominal cramping. Often travel or food related.' },
};

export const radiationColitisBleeding: DiseaseNode = {
  id: 'radiation_colitis_bleeding', name: 'Radiation Colitis / Proctitis', icdCode: 'K52.0', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 35, ageMax: 80, agePeak: [55, 75], sexRisk: { male: 0.3, female: 1.7 }, backgroundPrevalence: 0.002, riskFactors: [{ featureId: 'prior_abdominal_surgery', label: 'Prior pelvic radiation', LR_positive: 15, prevalenceInDisease: 0.9 }] },
  pathophysiology: { mechanism: 'Pelvic radiation causes obliterative endarteritis, leading to chronic mucosal ischemia, telangiectasias, and fibrosis. Bleeding 6-24 months post-radiation.', timelineStages: [{ stageId: 1, label: 'Chronic radiation injury', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('hematochezia', 0.8, 0.95), sym('gi_bleeding_painless', 0.7, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Painless or mild rectal discomfort', painLocationTypical: 'Rectal', painRadiationTypical: 'None' }], progressionRule: 'Chronic waxing and waning.' },
  features: { symptoms: [sym('hematochezia', 0.8, 0.95, { stageRelevance: [1] }), sym('tenesmus', 0.5, 0.8, { stageRelevance: [1] }), sym('mucus_stool', 0.4, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.7, 0.7, { stageRelevance: [1] }), sym('prior_abdominal_surgery', 0.9, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('prior_abdominal_surgery', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No pelvic radiation' })], supporting: [] },
  differential: { mimics: ['colorectal_cancer_bleeding', 'ulcerative_colitis_bleeding', 'proctitis_bleeding', 'infectious_colitis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_bleeding', featureIds: ['prior_abdominal_surgery', 'gi_bleeding_weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Radiation stricture', warningFeatures: ['constipation', 'tenesmus'], riskFactors: ['high_dose_radiation'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Fibrotic narrowing from chronic radiation injury.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'colonic', onset: 'chronic_occult', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'painless', associatedSymptoms: ['tenesmus'], riskContext: ['none'], mechanism: 'ischemic', typicalDescription: 'Painless hematochezia starting 6-24 months after pelvic radiation. Chronic course with telangiectasias.' },
};

export const solitaryRectalUlcerSyndrome: DiseaseNode = {
  id: 'solitary_rectal_ulcer_syndrome', name: 'Solitary Rectal Ulcer Syndrome', icdCode: 'K62.6', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 60, agePeak: [25, 45], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.001, riskFactors: [{ featureId: 'constipation', label: 'Chronic constipation / dyssynergic defecation', LR_positive: 3, prevalenceInDisease: 0.6 }] },
  pathophysiology: { mechanism: 'Benign rectal ulcer from rectal prolapse or dyssynergic defecation causing mucosal trauma. Presents with rectal bleeding, mucus, tenesmus, and a sense of incomplete evacuation.', timelineStages: [{ stageId: 1, label: 'Rectal ulceration', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('hematochezia', 0.6, 0.95), sym('tenesmus', 0.6, 0.8), sym('mucus_stool', 0.5, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Rectal discomfort / tenesmus', painLocationTypical: 'Rectal', painRadiationTypical: 'None' }], progressionRule: 'Chronic. Biofeedback and bowel retraining are mainstays of treatment.' },
  features: { symptoms: [sym('hematochezia', 0.6, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.2, 0.7, { stageRelevance: [1] }), sym('hematochezia_relation_to_stool', 0.4, 0.7, { stageRelevance: [1] }), sym('tenesmus', 0.6, 0.8, { stageRelevance: [1] }), sym('mucus_stool', 0.5, 0.85, { stageRelevance: [1] }), sym('constipation', 0.5, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('tenesmus', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'No tenesmus or straining' })] },
  differential: { mimics: ['colorectal_cancer_bleeding', 'hemorrhoids_bleeding', 'proctitis_bleeding', 'rectal_polyps_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_bleeding', featureIds: ['gi_bleeding_weight_loss', 'tenesmus', 'constipation'] }], neverCloseConditions: ['colorectal_cancer_bleeding'] },
  complications: [{ name: 'Rectal stenosis', warningFeatures: ['constipation', 'tenesmus'], riskFactors: ['chronic_ulceration'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Fibrotic narrowing from chronic ulceration.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'rectal', onset: 'chronic_occult', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'rectal_pain', associatedSymptoms: ['tenesmus'], riskContext: ['none'], mechanism: 'mechanical_trauma', typicalDescription: 'Rectal bleeding with mucus and tenesmus in a young patient with chronic constipation and straining.' },
};

export const stercoralUlcerBleeding: DiseaseNode = {
  id: 'stercoral_ulcer_bleeding', name: 'Stercoral Ulcer', icdCode: 'K63.3', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 50, ageMax: 90, agePeak: [65, 85], sexRisk: { male: 0.7, female: 1.3 }, backgroundPrevalence: 0.001, riskFactors: [{ featureId: 'constipation', label: 'Severe chronic constipation', LR_positive: 5, prevalenceInDisease: 0.8 }, { featureId: 'nsaid_use', label: 'NSAID use', LR_positive: 2, prevalenceInDisease: 0.3 }] },
  pathophysiology: { mechanism: 'Pressure necrosis of the colonic/rectal wall from impacted fecal mass. Typically in the rectum or sigmoid colon of elderly, immobile, or constipated patients. Can cause massive bleeding or perforation.', timelineStages: [{ stageId: 1, label: 'Ulcer with bleeding', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('hematochezia', 0.7, 0.95), sym('constipation', 0.8, 0.75), sym('gi_bleeding_painless', 0.5, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Rectal or lower abdominal discomfort', painLocationTypical: 'Rectal / suprapubic', painRadiationTypical: 'None' }], progressionRule: 'May progress to perforation if fecal impaction not relieved.' },
  features: { symptoms: [sym('hematochezia', 0.7, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.4, 0.7, { stageRelevance: [1] }), sym('constipation', 0.8, 0.75, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.5, 0.7, { stageRelevance: [1] }), sym('abdominal_distension', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('constipation', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No chronic constipation' })], supporting: [] },
  differential: { mimics: ['colorectal_cancer_bleeding', 'diverticular_bleeding', 'solitary_rectal_ulcer_syndrome', 'ischemic_colitis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_bleeding', featureIds: ['constipation', 'gi_bleeding_weight_loss'] }], neverCloseConditions: ['colonic_perforation'] },
  complications: [{ name: 'Colonic perforation', warningFeatures: ['pain_severity', 'peritonism', 'fever'], riskFactors: ['severe_constipation'], timeWindowHours: [24, 72], severityTier: 'critical', description: 'Pressure necrosis leads to full-thickness perforation.' }],
  clinicalScores: [], redFlagFeatureIds: ['pain_severity'],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'colonic', onset: 'subacute', severity: 'moderate', character: 'bright_red', painPattern: 'abdominal_pain', associatedSymptoms: ['none'], riskContext: ['none'], mechanism: 'ischemic', typicalDescription: 'Hematochezia in an elderly constipated patient from pressure necrosis by fecal impaction. Can cause massive bleeding or perforation.' },
};

// -------------------------------------------------------------------------------
// SECTION 5: LGIB - ANORECTAL (4 nodes)
// -------------------------------------------------------------------------------

export const hemorrhoidsBleeding: DiseaseNode = {
  id: 'hemorrhoids_bleeding', name: 'Hemorrhoidal Bleeding', icdCode: 'K64.9', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 80, agePeak: [30, 60], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.1, riskFactors: [{ featureId: 'constipation', label: 'Chronic constipation / straining', LR_positive: 3, prevalenceInDisease: 0.5 }] },
  pathophysiology: { mechanism: 'Engorged vascular cushions in the anal canal. Straining causes rupture of superficial vessels, producing painless bright red blood on toilet paper or on stool surface. Most common cause of hematochezia in young adults.', timelineStages: [{ stageId: 1, label: 'Hemorrhoidal bleeding', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('hematochezia', 0.8, 0.95), sym('gi_bleeding_painless', 0.85, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Painless unless thrombosed', painLocationTypical: 'Anal', painRadiationTypical: 'None' }], progressionRule: 'Intermittent, self-limited. May recur with straining.' },
  features: { symptoms: [sym('hematochezia', 0.8, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.2, 0.7, { stageRelevance: [1] }), sym('hematochezia_color', 0.6, 0.7, { stageRelevance: [1] }), sym('hematochezia_relation_to_stool', 0.8, 0.7, { stageRelevance: [1] }), sym('hematochezia_frequency', 0.3, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.85, 0.7, { stageRelevance: [1] }), sym('constipation', 0.5, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_painless', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'Painful defecation with blood' })], supporting: [] },
  differential: { mimics: ['anal_fissure_bleeding', 'colorectal_cancer_bleeding', 'rectal_polyps_bleeding', 'proctitis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'anal_fissure_bleeding', featureIds: ['pain_character', 'constipation'] }, { fromDiseaseId: 'colorectal_cancer_bleeding', featureIds: ['gi_bleeding_iron_deficiency', 'hematochezia_volume', 'hematochezia_relation_to_stool'] }], neverCloseConditions: ['colorectal_cancer_bleeding'] },
  complications: [{ name: 'Thrombosed hemorrhoid', warningFeatures: ['pain_severity'], riskFactors: ['constipation'], timeWindowHours: [24, 72], severityTier: 'mild', description: 'Acute painful anal mass from thrombosis.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'anal', onset: 'intermittent', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'painless', associatedSymptoms: ['none'], riskContext: ['none'], mechanism: 'vascular_malformation', typicalDescription: 'Painless bright red blood on toilet paper or on stool surface after straining. Most common cause of hematochezia in young adults.' },
};

export const analFissureBleeding: DiseaseNode = {
  id: 'anal_fissure_bleeding', name: 'Anal Fissure', icdCode: 'K60.2', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 70, agePeak: [20, 50], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.01, riskFactors: [{ featureId: 'constipation', label: 'Constipation / hard stools', LR_positive: 4, prevalenceInDisease: 0.7 }] },
  pathophysiology: { mechanism: 'Linear tear of the anal mucosa below the dentate line, most commonly posterior midline. Caused by passage of hard stool. Severe sharp anal pain during and after defecation with streaks of bright red blood on toilet paper.', timelineStages: [{ stageId: 1, label: 'Acute anal fissure', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('hematochezia', 0.5, 0.95), sym('constipation', 0.7, 0.75), sym('pain_severity', 0.7, 0.5)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Sharp tearing anal pain with defecation', painLocationTypical: 'Anal', painRadiationTypical: 'None' }], progressionRule: 'Acute fissures heal in 2-4 weeks with conservative measures. Chronic fissures may require surgery.' },
  features: { symptoms: [sym('hematochezia', 0.5, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.15, 0.7, { stageRelevance: [1] }), sym('hematochezia_relation_to_stool', 0.6, 0.7, { stageRelevance: [1] }), sym('constipation', 0.7, 0.75, { stageRelevance: [1] }), sym('pain_character', 0.8, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('pain_character', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No anal pain with defecation' })], supporting: [] },
  differential: { mimics: ['hemorrhoids_bleeding', 'rectal_polyps_bleeding', 'proctitis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'hemorrhoids_bleeding', featureIds: ['pain_character', 'gi_bleeding_painless'] }], neverCloseConditions: [] },
  complications: [{ name: 'Chronic fissure / abscess', warningFeatures: ['pain_severity', 'fever'], riskFactors: ['delayed_healing'], timeWindowHours: [336, 2160], severityTier: 'mild', description: 'Fissure fails to heal and may become complicated by infection.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'anal', onset: 'acute', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'rectal_pain', associatedSymptoms: ['none'], riskContext: ['none'], mechanism: 'mechanical_trauma', typicalDescription: 'Sharp tearing anal pain during passage of hard stool with streaks of bright red blood on toilet paper.' },
};

export const rectalPolypsBleeding: DiseaseNode = {
  id: 'rectal_polyps_bleeding', name: 'Rectal Polyps (Adenomatous / Juvenile)', icdCode: 'K63.5', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 2, ageMax: 80, agePeak: [3, 10], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [{ featureId: 'family_history_gi_cancer', label: 'Family history of polyps / CRC', LR_positive: 3, prevalenceInDisease: 0.2 }] },
  pathophysiology: { mechanism: 'Adenomatous polyps (adults) or juvenile polyps (children) cause bleeding from surface friability. Juvenile polyps are hamartomatous, often prolapse through the anus, and cause painless hematochezia.', timelineStages: [{ stageId: 1, label: 'Polyp bleeding', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('hematochezia', 0.6, 0.95), sym('gi_bleeding_painless', 0.8, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Painless', painLocationTypical: 'Rectal', painRadiationTypical: 'None' }], progressionRule: 'Intermittent. Polyps may auto-amputate (juvenile). Adenomatous polyps require polypectomy.' },
  features: { symptoms: [sym('hematochezia', 0.6, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.2, 0.7, { stageRelevance: [1] }), sym('hematochezia_color', 0.5, 0.7, { stageRelevance: [1] }), sym('hematochezia_relation_to_stool', 0.5, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.8, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('gi_bleeding_painless', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Painful bleeding' })] },
  differential: { mimics: ['hemorrhoids_bleeding', 'colorectal_cancer_bleeding', 'proctitis_bleeding', 'juvenile_polyps_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'hemorrhoids_bleeding', featureIds: ['constipation', 'hematochezia_relation_to_stool'] }], neverCloseConditions: ['colorectal_cancer_bleeding'] },
  complications: [{ name: 'Malignant transformation', warningFeatures: ['gi_bleeding_iron_deficiency'], riskFactors: ['adenomatous_polyps', 'size_>1cm'], timeWindowHours: [43200, 432000], severityTier: 'moderate', description: 'Adenomatous polyps may progress to carcinoma over years.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'rectal', onset: 'intermittent', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'painless', associatedSymptoms: ['none'], riskContext: ['none'], mechanism: 'neoplastic', typicalDescription: 'Painless bright red blood per rectum. Juvenile polyps in children may prolapse. Adenomatous polyps in older adults require colonoscopic removal.' },
};

export const proctitisBleeding: DiseaseNode = {
  id: 'proctitis_bleeding', name: 'Proctitis (Infectious / IBD)', icdCode: 'K62.8', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 65, agePeak: [20, 45], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [{ featureId: 'hiv_status', label: 'HIV / STI risk', LR_positive: 3, prevalenceInDisease: 0.3 }] },
  pathophysiology: { mechanism: 'Inflammation of the rectal mucosa from IBD (ulcerative proctitis), infection (gonorrhea, chlamydia, herpes, syphilis), or radiation. Presents with rectal bleeding, mucus, tenesmus, and urgency.', timelineStages: [{ stageId: 1, label: 'Active proctitis', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('hematochezia', 0.7, 0.95), sym('tenesmus', 0.7, 0.8), sym('mucus_stool', 0.5, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Rectal pain / tenesmus', painLocationTypical: 'Rectal', painRadiationTypical: 'None' }], progressionRule: 'Chronic or relapsing depending on etiology.' },
  features: { symptoms: [sym('hematochezia', 0.7, 0.95, { stageRelevance: [1] }), sym('hematochezia_relation_to_stool', 0.5, 0.7, { stageRelevance: [1] }), sym('tenesmus', 0.7, 0.8, { stageRelevance: [1] }), sym('mucus_stool', 0.5, 0.85, { stageRelevance: [1] }), sym('diarrhea', 0.3, 0.7, { stageRelevance: [1] }), sym('fever', 0.2, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('tenesmus', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No tenesmus' })], supporting: [] },
  differential: { mimics: ['ulcerative_colitis_bleeding', 'colorectal_cancer_bleeding', 'hemorrhoids_bleeding', 'infectious_colitis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'hemorrhoids_bleeding', featureIds: ['tenesmus', 'mucus_stool'] }], neverCloseConditions: [] },
  complications: [{ name: 'Rectal stricture', warningFeatures: ['constipation', 'tenesmus'], riskFactors: ['chronic_proctitis'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Chronic inflammation leads to fibrotic narrowing.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever'],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'rectal', onset: 'subacute', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'rectal_pain', associatedSymptoms: ['tenesmus'], riskContext: ['none'], mechanism: 'inflammatory', typicalDescription: 'Rectal bleeding with mucus, tenesmus, and urgency. May be from IBD (ulcerative proctitis) or infection (STI).' },
};

// -------------------------------------------------------------------------------
// SECTION 6: SMALL BOWEL (8 nodes)
// -------------------------------------------------------------------------------

export const meckelDiverticulumBleeding: DiseaseNode = {
  id: 'meckel_diverticulum_bleeding', name: 'Meckel Diverticulum (Bleeding)', icdCode: 'Q43.0', system: 'paediatric',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 0, ageMax: 30, agePeak: [1, 5], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Meckel diverticulum (remnant of omphalomesenteric duct) containing ectopic gastric mucosa. Acid secretion causes ulceration in adjacent ileal mucosa, leading to painless bleeding. Rule of 2s: 2% prevalence, 2% symptomatic, 2 inches long, within 2 feet of ileocecal valve, age <2 years.', timelineStages: [{ stageId: 1, label: 'Bleeding from Meckel ulcer', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('hematochezia', 0.7, 0.95), sym('melena', 0.3, 0.9), sym('gi_bleeding_painless', 0.9, 0.7)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Painless', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Bleeding is often self-limited but recurrent. Meckel scan (Tc-99m pertechnetate) diagnoses ectopic gastric mucosa.' },
  features: { symptoms: [sym('hematochezia', 0.7, 0.95, { stageRelevance: [1] }), sym('hematochezia_color', 0.5, 0.7, { stageRelevance: [1] }), sym('melena', 0.3, 0.9, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.9, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.3, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_painless', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'Painful bleeding - against Meckel' })], supporting: [] },
  differential: { mimics: ['intussusception_bleeding', 'juvenile_polyps_bleeding', 'small_bowel_angiodysplasia', 'crohn_enteritis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'intussusception_bleeding', featureIds: ['pain_character', 'pain_severity'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intussusception', warningFeatures: ['pain_severity', 'vomiting'], riskFactors: ['children'], timeWindowHours: [24, 72], severityTier: 'critical', description: 'Diverticulum can serve as lead point for intussusception.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope'],
  giBleedingManifestation: { bleedingType: ['hematochezia', 'melena'], site: 'small_bowel', onset: 'acute', severity: 'moderate', character: 'dark_red_maroon', painPattern: 'painless', associatedSymptoms: ['anemia'], riskContext: ['none'], mechanism: 'acid_related', typicalDescription: 'Painless dark red or maroon hematochezia in a child under 5 years. Classically described as currant jelly stools.' },
};

export const crohnEnteritisBleeding: DiseaseNode = {
  id: 'crohn_enteritis_bleeding', name: 'Crohn Enteritis (Small Bowel)', icdCode: 'K50.0', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 10, ageMax: 65, agePeak: [15, 35], sexRisk: { male: 0.9, female: 1.1 }, backgroundPrevalence: 0.003, riskFactors: [{ featureId: 'smoking', label: 'Smoking', LR_positive: 2.5, prevalenceInDisease: 0.5 }, { featureId: 'family_history_gi_cancer', label: 'Family history of IBD', LR_positive: 3, prevalenceInDisease: 0.15 }] },
  pathophysiology: { mechanism: 'Crohn disease of the small bowel (most commonly terminal ileum) causing transmural inflammation, deep fissuring ulcers, and strictures. Bleeding is less common than in colonic Crohn but can present as melena or hematochezia.', timelineStages: [{ stageId: 1, label: 'Active small bowel Crohn', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('melena', 0.3, 0.9), sym('hematochezia', 0.3, 0.95), sym('diarrhea', 0.8, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping RLQ pain', painLocationTypical: 'Right lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'Chronic relapsing. May progress to stricture or fistula.' },
  features: { symptoms: [sym('melena', 0.3, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('diarrhea', 0.8, 0.7, { stageRelevance: [1] }), sym('pain_character', 0.6, 0.6, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.85, { stageRelevance: [1] }), sym('fever', 0.4, 0.6, { stageRelevance: [1] }), sym('nausea', 0.4, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('diarrhea', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'No chronic diarrhea' })] },
  differential: { mimics: ['crohn_colitis_bleeding', 'ulcerative_colitis_bleeding', 'infectious_colitis_bleeding', 'small_bowel_tumor_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'infectious_colitis_bleeding', featureIds: ['weight_loss', 'diarrhea'] }], neverCloseConditions: ['appendicitis'] },
  complications: [{ name: 'Small bowel stricture / obstruction', warningFeatures: ['vomiting', 'abdominal_distension', 'constipation'], riskFactors: ['chronic_inflammation'], timeWindowHours: [4320, 43200], severityTier: 'moderate', description: 'Transmural inflammation causes fibrotic narrowing.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'gi_bleeding_weight_loss'],
  giBleedingManifestation: { bleedingType: ['melena', 'hematochezia'], site: 'small_bowel', onset: 'chronic_occult', severity: 'mild_self_limited', character: 'dark_red_maroon', painPattern: 'abdominal_pain', associatedSymptoms: ['diarrhea', 'fever', 'weight_loss'], riskContext: ['smoking'], mechanism: 'inflammatory', typicalDescription: 'Chronic RLQ cramping pain with diarrhea, weight loss, and occasional melena or hematochezia in a young adult.' },
};

export const smallBowelTumorBleeding: DiseaseNode = {
  id: 'small_bowel_tumor_bleeding', name: 'Small Bowel Tumor (GIST / Lymphoma / Adenocarcinoma)', icdCode: 'C17.9', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 70], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [{ featureId: 'known_cancer', label: 'Known cancer / genetic syndrome', LR_positive: 3, prevalenceInDisease: 0.2 }, { featureId: 'family_history_gi_cancer', label: 'Family history of GI cancer', LR_positive: 2, prevalenceInDisease: 0.15 }] },
  pathophysiology: { mechanism: 'Small bowel tumors (GIST, lymphoma, adenocarcinoma, carcinoid) cause bleeding from central necrosis, mucosal ulceration, or tumor friability. Often presents as obscure bleeding with negative upper/lower endoscopy. GISTs often bleed massively.', timelineStages: [{ stageId: 1, label: 'Tumor bleeding', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('melena', 0.5, 0.9), sym('hematochezia', 0.3, 0.95), sym('gi_bleeding_iron_deficiency', 0.6, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull abdominal pain or painless', painLocationTypical: 'Variable / periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Progressive. GISTs have malignant potential.' },
  features: { symptoms: [sym('melena', 0.5, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.6, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_weight_loss', 0.4, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.5, 0.7, { stageRelevance: [1] }), sym('nausea', 0.3, 0.5, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('gi_bleeding_iron_deficiency', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No iron deficiency anemia' })] },
  differential: { mimics: ['small_bowel_angiodysplasia', 'nsaid_enteropathy_bleeding', 'crohn_enteritis_bleeding', 'obscure_gi_bleeding', 'gi_lymphoma_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'small_bowel_angiodysplasia', featureIds: ['gi_bleeding_weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Small bowel obstruction', warningFeatures: ['vomiting', 'abdominal_distension'], riskFactors: ['large_tumor'], timeWindowHours: [2160, 21600], severityTier: 'moderate', description: 'Tumor growth may obstruct the small bowel lumen.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_weight_loss', 'gi_bleeding_iron_deficiency'],
  giBleedingManifestation: { bleedingType: ['melena', 'hematochezia', 'occult'], site: 'small_bowel', onset: 'chronic_occult', severity: 'occult', character: 'dark_red_maroon', painPattern: 'abdominal_pain', associatedSymptoms: ['weight_loss', 'anemia'], riskContext: ['none'], mechanism: 'neoplastic', typicalDescription: 'Occult GI bleeding or melena from a small bowel tumor. Often diagnosed at capsule endoscopy after negative upper and lower endoscopy.' },
};

export const smallBowelAngiodysplasia: DiseaseNode = {
  id: 'small_bowel_angiodysplasia', name: 'Small Bowel Angiodysplasia', icdCode: 'K55.2', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 50, ageMax: 90, agePeak: [65, 85], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [{ featureId: 'htn_cad', label: 'Vascular disease', LR_positive: 2, prevalenceInDisease: 0.5 }, { featureId: 'chronic_renal_failure', label: 'Chronic renal failure', LR_positive: 3, prevalenceInDisease: 0.15 }] },
  pathophysiology: { mechanism: 'Degenerative vascular malformations of the small bowel, most common cause of obscure GI bleeding in patients >65 years. Often multiple, in the jejunum and ileum. Bleeding is intermittent, painless, and can be occult or overt.', timelineStages: [{ stageId: 1, label: 'Angiodysplasia bleeding', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('melena', 0.5, 0.9), sym('hematochezia', 0.4, 0.95), sym('gi_bleeding_painless', 0.9, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Painless', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Intermittent bleeding. May cause chronic iron deficiency anemia.' },
  features: { symptoms: [sym('melena', 0.5, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.4, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.9, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.6, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_prior_gi_bleed', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_painless', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'Painful bleeding' })], supporting: [] },
  differential: { mimics: ['colonic_angiodysplasia', 'small_bowel_tumor_bleeding', 'nsaid_enteropathy_bleeding', 'obscure_gi_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'small_bowel_tumor_bleeding', featureIds: ['gi_bleeding_weight_loss', 'gi_bleeding_painless'] }], neverCloseConditions: [] },
  complications: [{ name: 'Chronic iron deficiency anemia', warningFeatures: ['gi_bleeding_iron_deficiency'], riskFactors: ['multiple_lesions'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Intermittent bleeding leads to transfusion-dependent anemia.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_iron_deficiency'],
  giBleedingManifestation: { bleedingType: ['melena', 'hematochezia', 'occult'], site: 'small_bowel', onset: 'intermittent', severity: 'mild_self_limited', character: 'dark_red_maroon', painPattern: 'painless', associatedSymptoms: ['anemia'], riskContext: ['none'], mechanism: 'vascular_malformation', typicalDescription: 'Intermittent painless melena or hematochezia in an elderly patient. Most common cause of obscure GI bleeding after age 65.' },
};

export const nsaidEnteropathyBleeding: DiseaseNode = {
  id: 'nsaid_enteropathy_bleeding', name: 'NSAID Enteropathy', icdCode: 'K52.82', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 70], sexRisk: { male: 0.8, female: 1.2 }, backgroundPrevalence: 0.005, riskFactors: [{ featureId: 'nsaid_use', label: 'Chronic NSAID use', LR_positive: 8, prevalenceInDisease: 0.9 }, { featureId: 'anticoagulant_use', label: 'Anticoagulant use', LR_positive: 3, prevalenceInDisease: 0.2 }] },
  pathophysiology: { mechanism: 'Chronic NSAID use causes small bowel inflammation, erosions, and ulcerations leading to protein loss and bleeding. Increasingly recognized cause of obscure GI bleeding. Can cause multiple diaphragmatic strictures and erosions throughout the small bowel.', timelineStages: [{ stageId: 1, label: 'NSAID enteropathy', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('melena', 0.3, 0.9), sym('gi_bleeding_iron_deficiency', 0.7, 0.85), sym('nsaid_use', 0.9, 0.75)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Vague abdominal discomfort', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Chronic. Improves with NSAID cessation.' },
  features: { symptoms: [sym('melena', 0.3, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.2, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.7, 0.85, { stageRelevance: [1] }), sym('nsaid_use', 0.9, 0.75, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.6, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_weight_loss', 0.2, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('nsaid_use', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No NSAID use' })], supporting: [] },
  differential: { mimics: ['small_bowel_angiodysplasia', 'small_bowel_tumor_bleeding', 'crohn_enteritis_bleeding', 'obscure_gi_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'small_bowel_angiodysplasia', featureIds: ['nsaid_use', 'gi_bleeding_painless'] }], neverCloseConditions: [] },
  complications: [{ name: 'Iron deficiency anemia', warningFeatures: ['gi_bleeding_iron_deficiency'], riskFactors: ['chronic_nsaid_use'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Chronic blood loss from small bowel erosions.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_iron_deficiency'],
  giBleedingManifestation: { bleedingType: ['occult', 'melena'], site: 'small_bowel', onset: 'chronic_occult', severity: 'occult', character: 'occult', painPattern: 'painless', associatedSymptoms: ['anemia'], riskContext: ['nsaid'], mechanism: 'acid_related', typicalDescription: 'Chronic iron deficiency anemia in a patient on long-term NSAIDs. Negative upper and lower endoscopy leads to diagnosis via capsule endoscopy.' },
};

export const tuberculousEnteritisBleeding: DiseaseNode = {
  id: 'tuberculous_enteritis_bleeding', name: 'Tuberculous Enteritis', icdCode: 'A18.32', system: 'infectious',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 60, agePeak: [20, 40], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [{ featureId: 'hiv_status', label: 'HIV / immunosuppression', LR_positive: 5, prevalenceInDisease: 0.3 }, { featureId: 'recent_travel', label: 'Endemic area / recent travel', LR_positive: 4, prevalenceInDisease: 0.6 }] },
  pathophysiology: { mechanism: 'Mycobacterium tuberculosis infection of the small bowel (most commonly terminal ileum and cecum). Causes ulcerating granulomatous inflammation leading to pain, obstruction, fistulas, and bleeding. May mimic Crohns disease.', timelineStages: [{ stageId: 1, label: 'TB enteritis with bleeding', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('melena', 0.3, 0.9), sym('hematochezia', 0.2, 0.95), sym('diarrhea', 0.6, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Cramping RLQ pain', painLocationTypical: 'Right lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'Progressive without anti-TB therapy.' },
  features: { symptoms: [sym('melena', 0.3, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.2, 0.95, { stageRelevance: [1] }), sym('diarrhea', 0.6, 0.7, { stageRelevance: [1] }), sym('fever', 0.7, 0.6, { stageRelevance: [1] }), sym('weight_loss', 0.7, 0.85, { stageRelevance: [1] }), sym('night_sweats', 0.5, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('fever', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No fever or night sweats' })], supporting: [] },
  differential: { mimics: ['crohn_enteritis_bleeding', 'small_bowel_tumor_bleeding', 'typhoid_intestinal_bleeding', 'appendicitis'], distinguishingFeatures: [{ fromDiseaseId: 'crohn_enteritis_bleeding', featureIds: ['fever', 'night_sweats', 'hiv_status'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal perforation', warningFeatures: ['pain_severity', 'peritonism', 'fever'], riskFactors: ['advanced_disease'], timeWindowHours: [720, 4320], severityTier: 'critical', description: 'TB ulcer perforation leading to peritonitis.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'gi_bleeding_weight_loss'],
  giBleedingManifestation: { bleedingType: ['hematochezia', 'melena', 'occult'], site: 'small_bowel', onset: 'chronic_occult', severity: 'occult', character: 'dark_red_maroon', painPattern: 'abdominal_pain', associatedSymptoms: ['diarrhea', 'fever', 'weight_loss'], riskContext: ['none'], mechanism: 'infectious', typicalDescription: 'Chronic RLQ pain with diarrhea, fever, night sweats, weight loss, and GI bleeding in a patient from endemic area.' },
};

export const typhoidIntestinalBleeding: DiseaseNode = {
  id: 'typhoid_intestinal_bleeding', name: 'Typhoid Intestinal Bleeding', icdCode: 'A01.0', system: 'infectious',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 1, ageMax: 50, agePeak: [5, 25], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [{ featureId: 'recent_travel', label: 'Endemic area travel', LR_positive: 5, prevalenceInDisease: 0.8 }, { featureId: 'fever', label: 'Prolonged fever', LR_positive: 4, prevalenceInDisease: 0.9 }] },
  pathophysiology: { mechanism: 'Salmonella typhi causes hyperplasia of Peyers patches in the terminal ileum. Necrosis and sloughing of these patches in the 2nd-3rd week leads to ulceration and bleeding from the ileal arteries. A complication of untreated typhoid fever.', timelineStages: [{ stageId: 1, label: 'Intestinal hemorrhage', typicalHoursFromOnset: [336, 504], dominantSymptoms: [sym('hematochezia', 0.5, 0.95), sym('melena', 0.4, 0.9), sym('fever', 0.9, 0.6)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Abdominal pain / tenderness', painLocationTypical: 'Right lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'Complication of untreated typhoid in the 2nd-3rd week. May also lead to perforation.' },
  features: { symptoms: [sym('hematochezia', 0.5, 0.95, { stageRelevance: [1] }), sym('melena', 0.4, 0.9, { stageRelevance: [1] }), sym('fever', 0.9, 0.6, { stageRelevance: [1] }), sym('diarrhea', 0.6, 0.7, { stageRelevance: [1] }), sym('abdominal_pain', 0.7, 0.6, { stageRelevance: [1] }), sym('recent_travel', 0.8, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('fever', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No fever or travel history' })], supporting: [] },
  differential: { mimics: ['tuberculous_enteritis_bleeding', 'infectious_colitis_bleeding', 'appendicitis', 'crohn_enteritis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'tuberculous_enteritis_bleeding', featureIds: ['fever', 'recent_travel'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal perforation', warningFeatures: ['pain_severity', 'peritonism'], riskFactors: ['delayed_treatment'], timeWindowHours: [336, 504], severityTier: 'critical', description: 'Necrotic Peyers patches perforate causing peritonitis.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever'],
  giBleedingManifestation: { bleedingType: ['hematochezia', 'melena'], site: 'small_bowel', onset: 'subacute', severity: 'moderate', character: 'dark_red_maroon', painPattern: 'abdominal_pain', associatedSymptoms: ['diarrhea', 'fever'], riskContext: ['none'], mechanism: 'infectious', typicalDescription: 'GI bleeding in the 2nd-3rd week of untreated typhoid fever. Fever, abdominal pain, and hematochezia in a returned traveler from endemic area.' },
};

export const jejunalDiverticulosisBleeding: DiseaseNode = {
  id: 'jejunal_diverticulosis_bleeding', name: 'Jejunal Diverticulosis (Bleeding)', icdCode: 'K57.1', system: 'medical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 50, ageMax: 90, agePeak: [65, 85], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Acquired diverticula of the jejunum, usually in elderly patients. Can cause obscure GI bleeding from erosion into vasa recta. Rare but potentially massive bleeding.', timelineStages: [{ stageId: 1, label: 'Jejunal diverticular bleed', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('melena', 0.5, 0.9), sym('hematochezia', 0.4, 0.95), sym('gi_bleeding_painless', 0.7, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Painless or mild abdominal discomfort', painLocationTypical: 'Periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Massive bleeding may require angiography with embolization or surgical resection.' },
  features: { symptoms: [sym('melena', 0.5, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.4, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.7, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.4, 0.9, { stageRelevance: [1] }), sym('abdominal_distension', 0.2, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('gi_bleeding_painless', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Painful bleeding' })] },
  differential: { mimics: ['diverticular_bleeding', 'small_bowel_angiodysplasia', 'small_bowel_tumor_bleeding', 'obscure_gi_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'diverticular_bleeding', featureIds: ['melena', 'hematochezia_color'] }], neverCloseConditions: [] },
  complications: [{ name: 'Massive hemorrhage', warningFeatures: ['gi_bleeding_syncope', 'hematochezia_volume'], riskFactors: ['elderly'], timeWindowHours: [0, 24], severityTier: 'critical', description: 'Arterial bleeding from jejunal diverticulum.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope'],
  giBleedingManifestation: { bleedingType: ['melena', 'hematochezia'], site: 'small_bowel', onset: 'acute', severity: 'moderate', character: 'dark_red_maroon', painPattern: 'painless', associatedSymptoms: ['anemia'], riskContext: ['none'], mechanism: 'vascular_malformation', typicalDescription: 'Painless melena or hematochezia in an elderly patient from a rare jejunal diverticulum bleed. Often diagnosed on angiography.' },
};

// -------------------------------------------------------------------------------
// SECTION 7: PEDIATRIC / NEONATAL (5 nodes)
// -------------------------------------------------------------------------------

export const necrotizingEnterocolitisBleeding: DiseaseNode = {
  id: 'necrotizing_enterocolitis_bleeding', name: 'Necrotizing Enterocolitis (NEC)', icdCode: 'P77', system: 'paediatric',
  organSystem: 'GI', acuity: 'immediately_life_threatening', acuityTier: 1,
  epidemiology: { ageMin: 0, ageMax: 1, agePeak: [0.02, 0.08], sexRisk: { male: 1.1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [{ featureId: 'prematurity', label: 'Prematurity', LR_positive: 10, prevalenceInDisease: 0.8 }] },
  pathophysiology: { mechanism: 'Ischemic necrosis of the neonatal bowel wall, most common in preterm infants. Presents with feeding intolerance, abdominal distension, and bloody stools. Can rapidly progress to perforation and peritonitis. Mortality ~20-30%.', timelineStages: [{ stageId: 1, label: 'Early NEC', typicalHoursFromOnset: [0, 48], dominantSymptoms: [sym('hematochezia', 0.5, 0.95), sym('vomiting', 0.6, 0.55), sym('fever', 0.4, 0.6)], examFindings: [], severityTrajectory: 'rapidly_worsening', painCharacterTypical: 'Abdominal distension / tenderness', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Rapid progression to bowel necrosis and perforation within hours without surgical intervention.' },
  features: { symptoms: [sym('hematochezia', 0.5, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.3, 0.7, { stageRelevance: [1] }), sym('vomiting', 0.6, 0.55, { stageRelevance: [1] }), sym('fever', 0.4, 0.6, { stageRelevance: [1] }), sym('abdominal_distension', 0.8, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('abdominal_distension', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No distension in neonate' })] },
  differential: { mimics: ['intussusception_bleeding', 'swallowed_maternal_blood', 'vitamin_k_deficiency_bleeding', 'malrotation'], distinguishingFeatures: [{ fromDiseaseId: 'intussusception_bleeding', featureIds: ['prematurity', 'abdominal_distension', 'fever'] }], neverCloseConditions: ['malrotation_with_volvulus'] },
  complications: [{ name: 'Bowel perforation / peritonitis', warningFeatures: ['fever', 'abdominal_distension'], riskFactors: ['prematurity'], timeWindowHours: [12, 48], severityTier: 'critical', description: 'Full-thickness necrosis leads to perforation.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'abdominal_distension'],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'small_bowel', onset: 'acute', severity: 'moderate', character: 'bright_red', painPattern: 'abdominal_pain', associatedSymptoms: ['vomiting', 'fever'], riskContext: ['none'], mechanism: 'ischemic', typicalDescription: 'Bloody stools, abdominal distension, and feeding intolerance in a preterm neonate. Surgical emergency.' },
};

export const intussusceptionBleeding: DiseaseNode = {
  id: 'intussusception_bleeding', name: 'Intussusception (Currant Jelly Stools)', icdCode: 'K56.1', system: 'paediatric',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 0.25, ageMax: 3, agePeak: [0.5, 1.5], sexRisk: { male: 2, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Telescoping of one segment of bowel into another, most commonly ileocolic. Intermittent severe colicky pain with drawing up of legs. Currant jelly stools (blood and mucus) from venous congestion. Can progress to bowel ischemia and perforation.', timelineStages: [{ stageId: 1, label: 'Intussusception with ischemia', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('hematochezia', 0.6, 0.95), sym('pain_severity', 0.9, 0.5), sym('vomiting', 0.7, 0.55)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Intermittent severe colicky pain', painLocationTypical: 'Periumbilical / diffuse', painRadiationTypical: 'None' }], progressionRule: 'Reducible by air enema in early stages. Delayed presentation leads to bowel necrosis.' },
  features: { symptoms: [sym('hematochezia', 0.6, 0.95, { stageRelevance: [1] }), sym('hematochezia_color', 0.5, 0.7, { stageRelevance: [1] }), sym('hematochezia_relation_to_stool', 0.4, 0.7, { stageRelevance: [1] }), sym('pain_character', 0.9, 0.6, { stageRelevance: [1] }), sym('pain_severity', 0.9, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.7, 0.55, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('pain_character', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'No colicky pain pattern' })], supporting: [] },
  differential: { mimics: ['necrotizing_enterocolitis_bleeding', 'meckel_diverticulum_bleeding', 'juvenile_polyps_bleeding', 'malrotation'], distinguishingFeatures: [{ fromDiseaseId: 'necrotizing_enterocolitis_bleeding', featureIds: ['prematurity', 'pain_character'] }], neverCloseConditions: ['malrotation_with_volvulus'] },
  complications: [{ name: 'Bowel necrosis / perforation', warningFeatures: ['pain_severity', 'fever', 'peritonism'], riskFactors: ['delayed_presentation'], timeWindowHours: [12, 48], severityTier: 'critical', description: 'Ischemic necrosis from prolonged intussusception.' }],
  clinicalScores: [], redFlagFeatureIds: ['pain_severity'],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'small_bowel', onset: 'acute', severity: 'moderate', character: 'dark_red_maroon', painPattern: 'colicky_pain', associatedSymptoms: ['vomiting'], riskContext: ['none'], mechanism: 'ischemic', typicalDescription: 'Intermittent severe colicky abdominal pain in an infant with drawing up of legs, followed by currant jelly stools from venous congestion.' },
};

export const juvenilePolypsBleeding: DiseaseNode = {
  id: 'juvenile_polyps_bleeding', name: 'Juvenile Polyps (Child)', icdCode: 'K63.5', system: 'paediatric',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 2, ageMax: 12, agePeak: [3, 7], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Benign hamartomatous polyps of the colorectum in children. Usually solitary, located in the rectum or sigmoid. Present with painless hematochezia. Polyps may prolapse through the anus or auto-amputate.', timelineStages: [{ stageId: 1, label: 'Polyp bleeding', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('hematochezia', 0.7, 0.95), sym('gi_bleeding_painless', 0.9, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Painless', painLocationTypical: 'Rectal', painRadiationTypical: 'None' }], progressionRule: 'Self-limited. Polyps may auto-amputate. Colonoscopic polypectomy is curative.' },
  features: { symptoms: [sym('hematochezia', 0.7, 0.95, { stageRelevance: [1] }), sym('hematochezia_volume', 0.2, 0.7, { stageRelevance: [1] }), sym('hematochezia_color', 0.5, 0.7, { stageRelevance: [1] }), sym('hematochezia_relation_to_stool', 0.6, 0.7, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.9, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('gi_bleeding_painless', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'Painful bleeding' })], supporting: [] },
  differential: { mimics: ['meckel_diverticulum_bleeding', 'intussusception_bleeding', 'hemorrhoids_bleeding', 'rectal_polyps_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'meckel_diverticulum_bleeding', featureIds: ['hematochezia_relation_to_stool', 'gi_bleeding_painless'] }], neverCloseConditions: [] },
  complications: [{ name: 'Polyp prolapse', warningFeatures: ['hematochezia_frequency'], riskFactors: ['large_polyp'], timeWindowHours: [336, 2160], severityTier: 'mild', description: 'Polyp may prolapse through the anus causing discomfort.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematochezia'], site: 'rectal', onset: 'intermittent', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'painless', associatedSymptoms: ['none'], riskContext: ['none'], mechanism: 'neoplastic', typicalDescription: 'Painless bright red blood per rectum in a child aged 2-10 years. The most common cause of pediatric hematochezia.' },
};

export const vitaminKDeficiencyBleeding: DiseaseNode = {
  id: 'vitamin_k_deficiency_bleeding', name: 'Vitamin K Deficiency Bleeding (VKDB)', icdCode: 'P53', system: 'paediatric',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 0, ageMax: 0.25, agePeak: [0.008, 0.06], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Deficiency of vitamin K-dependent clotting factors (II, VII, IX, X) in neonates. Can cause widespread bleeding including GI bleeding, intracranial hemorrhage, and umbilical stump bleeding. Classic form presents at day 2-7; late form at 2-12 weeks in exclusively breastfed infants.', timelineStages: [{ stageId: 1, label: 'Neonatal bleeding', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('hematemesis', 0.3, 0.95), sym('melena', 0.3, 0.9), sym('hematochezia', 0.3, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'No abdominal pain', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Prevented by vitamin K prophylaxis at birth. Without prophylaxis, can progress to intracranial hemorrhage.' },
  features: { symptoms: [sym('hematemesis', 0.3, 0.95, { stageRelevance: [1] }), sym('melena', 0.3, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.9, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('vitamin_k_prophylaxis', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.05, label: 'Received vitamin K at birth' })], supporting: [] },
  differential: { mimics: ['swallowed_maternal_blood', 'necrotizing_enterocolitis_bleeding', 'intussusception_bleeding', 'coagulopathy'], distinguishingFeatures: [{ fromDiseaseId: 'swallowed_maternal_blood', featureIds: ['gi_bleeding_painless', 'symptoms'] }], neverCloseConditions: ['intracranial_hemorrhage'] },
  complications: [{ name: 'Intracranial hemorrhage', warningFeatures: ['syncope', 'vomiting'], riskFactors: ['late_onset', 'no_prophylaxis'], timeWindowHours: [48, 336], severityTier: 'critical', description: 'Life-threatening intracranial bleeding from coagulopathy.' }],
  clinicalScores: [], redFlagFeatureIds: ['syncope'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena', 'hematochezia'], site: 'variable', onset: 'acute', severity: 'moderate', character: 'variable', painPattern: 'painless', associatedSymptoms: ['none'], riskContext: ['none'], mechanism: 'coagulopathy', typicalDescription: 'Neonatal GI bleeding from vitamin K deficiency. Usually involves multiple sites including umbilical stump. Preventable with vitamin K prophylaxis at birth.' },
};

export const swallowedMaternalBlood: DiseaseNode = {
  id: 'swallowed_maternal_blood', name: 'Swallowed Maternal Blood (Neonate)', icdCode: 'P78.2', system: 'paediatric',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 0, ageMax: 0.08, agePeak: [0, 0.02], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Benign neonatal condition where blood swallowed during delivery (from maternal vaginal tract or from cracked nipples during breastfeeding) is passed in stool or vomited. Apt test differentiates fetal (HbF) from maternal (HbA) hemoglobin.', timelineStages: [{ stageId: 1, label: 'Neonatal bloody output', typicalHoursFromOnset: [0, 24], dominantSymptoms: [sym('hematemesis', 0.4, 0.95), sym('melena', 0.4, 0.9), sym('gi_bleeding_painless', 0.95, 0.7)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'No pain - benign', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Self-limited. Reassurance only.' },
  features: { symptoms: [sym('hematemesis', 0.4, 0.95, { stageRelevance: [1] }), sym('melena', 0.4, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.2, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.95, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('fever', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'No fever or signs of illness' })], supporting: [] },
  differential: { mimics: ['vitamin_k_deficiency_bleeding', 'necrotizing_enterocolitis_bleeding', 'intussusception_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'vitamin_k_deficiency_bleeding', featureIds: ['fever', 'symptoms'] }], neverCloseConditions: ['necrotizing_enterocolitis_bleeding'] },
  complications: [{ name: 'None - benign condition', warningFeatures: [], riskFactors: [], timeWindowHours: [0, 48], severityTier: 'mild', description: 'No complications. Reassurance and observation only.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena'], site: 'variable', onset: 'acute', severity: 'mild_self_limited', character: 'bright_red', painPattern: 'painless', associatedSymptoms: ['none'], riskContext: ['none'], mechanism: 'mechanical_trauma', typicalDescription: 'Blood in vomit or stool of a newborn in the first 24-48 hours of life. Benign, self-limited. Apt test confirms maternal blood.' },
};

// -------------------------------------------------------------------------------
// SECTION 8: OBSCURE / OTHER (3 nodes)
// -------------------------------------------------------------------------------

export const obscureGiBleeding: DiseaseNode = {
  id: 'obscure_gi_bleeding', name: 'Obscure GI Bleeding (Small Bowel Source)', icdCode: 'K92.2', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 40, ageMax: 90, agePeak: [60, 80], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [{ featureId: 'nsaid_use', label: 'Chronic NSAID use', LR_positive: 3, prevalenceInDisease: 0.3 }, { featureId: 'anticoagulant_use', label: 'Anticoagulant use', LR_positive: 2, prevalenceInDisease: 0.2 }] },
  pathophysiology: { mechanism: 'Persistent or recurrent GI bleeding after negative upper endoscopy and colonoscopy. Small bowel is the source in ~75% of cases. Etiologies include angiodysplasia, NSAID enteropathy, small bowel tumors, Crohns disease, and Meckel diverticulum. Capsule endoscopy is the diagnostic test of choice.', timelineStages: [{ stageId: 1, label: 'Obscure bleeding', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('melena', 0.5, 0.9), sym('hematochezia', 0.3, 0.95), sym('gi_bleeding_iron_deficiency', 0.7, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Often painless', painLocationTypical: 'Variable', painRadiationTypical: 'None' }], progressionRule: 'Recurrent intermittent bleeding. Requires capsule endoscopy or deep enteroscopy for diagnosis.' },
  features: { symptoms: [sym('melena', 0.5, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.7, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.6, 0.7, { stageRelevance: [1] }), sym('nsaid_use', 0.3, 0.75, { stageRelevance: [1] }), sym('gi_bleeding_syncope', 0.3, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('gi_bleeding_iron_deficiency', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No iron deficiency' })] },
  differential: { mimics: ['small_bowel_angiodysplasia', 'small_bowel_tumor_bleeding', 'nsaid_enteropathy_bleeding', 'meckel_diverticulum_bleeding', 'crohn_enteritis_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'small_bowel_angiodysplasia', featureIds: ['nsaid_use', 'gi_bleeding_painless'] }], neverCloseConditions: [] },
  complications: [{ name: 'Transfusion-dependent anemia', warningFeatures: ['gi_bleeding_iron_deficiency', 'gi_bleeding_syncope'], riskFactors: ['unidentified_source'], timeWindowHours: [2160, 21600], severityTier: 'moderate', description: 'Persistent bleeding without identified source requiring recurrent transfusions.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_syncope', 'gi_bleeding_iron_deficiency'],
  giBleedingManifestation: { bleedingType: ['melena', 'hematochezia', 'occult'], site: 'small_bowel', onset: 'intermittent', severity: 'moderate', character: 'dark_red_maroon', painPattern: 'painless', associatedSymptoms: ['anemia', 'syncope'], riskContext: ['nsaid', 'anticoagulant', 'prior_gi_bleed'], mechanism: 'variable', typicalDescription: 'Recurrent or persistent GI bleeding with negative upper and lower endoscopy. Small bowel source suspected. May be overt or occult.' },
};

export const giLymphomaBleeding: DiseaseNode = {
  id: 'gi_lymphoma_bleeding', name: 'Primary GI Lymphoma', icdCode: 'C85.9', system: 'haematological',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [50, 70], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [{ featureId: 'hiv_status', label: 'HIV / immunosuppression', LR_positive: 5, prevalenceInDisease: 0.3 }, { featureId: 'known_cancer', label: 'Known lymphoma', LR_positive: 8, prevalenceInDisease: 0.2 }] },
  pathophysiology: { mechanism: 'Non-Hodgkin lymphoma (most commonly B-cell) arising in the GI tract. Stomach is the most common site, followed by small bowel. Presents with abdominal pain, weight loss, bleeding, and often a palpable mass. Bleeding from mucosal ulceration.', timelineStages: [{ stageId: 1, label: 'GI lymphoma with bleeding', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('hematemesis', 0.3, 0.95), sym('melena', 0.4, 0.9), sym('hematochezia', 0.2, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull abdominal pain', painLocationTypical: 'Variable', painRadiationTypical: 'None' }], progressionRule: 'Progressive. Responds to chemotherapy in early stages.' },
  features: { symptoms: [sym('hematemesis', 0.3, 0.95, { stageRelevance: [1] }), sym('melena', 0.4, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.2, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_weight_loss', 0.6, 0.85, { stageRelevance: [1] }), sym('fever', 0.4, 0.6, { stageRelevance: [1] }), sym('night_sweats', 0.3, 0.9, { stageRelevance: [1] }), sym('hiv_status', 0.3, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [sym('gi_bleeding_weight_loss', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'No B symptoms' })] },
  differential: { mimics: ['gastric_cancer_bleeding', 'small_bowel_tumor_bleeding', 'gastric_ulcer_bleeding', 'colorectal_cancer_bleeding'], distinguishingFeatures: [{ fromDiseaseId: 'gastric_cancer_bleeding', featureIds: ['fever', 'night_sweats', 'hiv_status'] }], neverCloseConditions: [] },
  complications: [{ name: 'GI perforation', warningFeatures: ['pain_severity', 'peritonism', 'fever'], riskFactors: ['chemotherapy'], timeWindowHours: [720, 4320], severityTier: 'critical', description: 'Tumor necrosis from chemotherapy can lead to perforation.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'gi_bleeding_weight_loss'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena', 'hematochezia'], site: 'variable', onset: 'chronic_occult', severity: 'occult', character: 'dark_red_maroon', painPattern: 'abdominal_pain', associatedSymptoms: ['weight_loss', 'fever'], riskContext: ['none'], mechanism: 'neoplastic', typicalDescription: 'Abdominal pain with weight loss, fever, night sweats, and GI bleeding. Stomach is the most common site of primary GI lymphoma.' },
};

export const hereditaryHemorrhagicTelangiectasia: DiseaseNode = {
  id: 'hereditary_hemorrhagic_telangiectasia', name: 'Hereditary Hemorrhagic Telangiectasia (Osler-Weber-Rendu)', icdCode: 'I78.0', system: 'medical',
  organSystem: 'cardiovascular', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 10, ageMax: 80, agePeak: [30, 60], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [{ featureId: 'family_history_gi_cancer', label: 'Family history of HHT', LR_positive: 10, prevalenceInDisease: 0.6 }] },
  pathophysiology: { mechanism: 'Autosomal dominant disorder causing multi-site telangiectasias and arteriovenous malformations (AVMs). GI involvement occurs in ~30% of patients, causing recurrent bleeding from mucosal telangiectasias (stomach, small bowel, colon). Also causes epistaxis, pulmonary AVMs, and cerebral AVMs. Recurrent GI bleeding leads to iron deficiency anemia.', timelineStages: [{ stageId: 1, label: 'GI telangiectasia bleeding', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('hematemesis', 0.2, 0.95), sym('melena', 0.3, 0.9), sym('hematochezia', 0.3, 0.95)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Painless', painLocationTypical: 'Variable', painRadiationTypical: 'None' }], progressionRule: 'Chronic recurrent bleeding. Epistaxis and GI bleeds increase with age.' },
  features: { symptoms: [sym('hematemesis', 0.2, 0.95, { stageRelevance: [1] }), sym('melena', 0.3, 0.9, { stageRelevance: [1] }), sym('hematochezia', 0.3, 0.95, { stageRelevance: [1] }), sym('gi_bleeding_iron_deficiency', 0.7, 0.85, { stageRelevance: [1] }), sym('gi_bleeding_painless', 0.8, 0.7, { stageRelevance: [1] }), sym('prior_gi_bleed', 0.6, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('familial_hht', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.08, label: 'No family history of HHT' })], supporting: [] },
  differential: { mimics: ['colonic_angiodysplasia', 'small_bowel_angiodysplasia', 'obscure_gi_bleeding', 'gave_watermelon_stomach'], distinguishingFeatures: [{ fromDiseaseId: 'colonic_angiodysplasia', featureIds: ['epistaxis', 'family_history'] }], neverCloseConditions: ['aortoenteric_fistula'] },
  complications: [{ name: 'Severe iron deficiency anemia', warningFeatures: ['gi_bleeding_iron_deficiency'], riskFactors: ['pulmonary_avm'], timeWindowHours: [4320, 43200], severityTier: 'moderate', description: 'Recurrent GI bleeding leads to chronic anemia requiring iron and transfusions.' }, { name: 'Pulmonary AVM hemorrhage', warningFeatures: ['hemoptysis', 'dyspnea'], riskFactors: ['pulmonary_avm'], timeWindowHours: [4320, 43200], severityTier: 'critical', description: 'Pulmonary AVMs may rupture causing hemothorax.' }],
  clinicalScores: [], redFlagFeatureIds: ['gi_bleeding_iron_deficiency'],
  giBleedingManifestation: { bleedingType: ['hematemesis', 'melena', 'hematochezia'], site: 'variable', onset: 'intermittent', severity: 'mild_self_limited', character: 'variable', painPattern: 'painless', associatedSymptoms: ['anemia'], riskContext: ['none'], mechanism: 'vascular_malformation', typicalDescription: 'Recurrent multi-site GI bleeding in a patient with known HHT (Osler-Weber-Rendu). Also has epistaxis and family history. Telangiectasias throughout the GI tract.' },
};

// -------------------------------------------------------------------------------
// EXPORT ALL NODES
// -------------------------------------------------------------------------------

export const GI_BLEEDING_NODES: DiseaseNode[] = [
  esophagealVaricesBleeding,
  gastricVaricesBleeding,
  malloryWeissTear,
  refluxEsophagitisBleeding,
  infectiousEsophagitisBleeding,
  esophagealCancerBleeding,
  boerhaaveSyndrome,
  pillEsophagitisBleeding,
  gastricUlcerBleeding,
  duodenalUlcerBleeding,
  acuteGastritisBleeding,
  stressGastritisIcuBleeding,
  gastricCancerBleeding,
  dieulafoyLesion,
  cameronUlcers,
  gastricErosionsNsaid,
  gaveWatermelonStomach,
  aortoentericFistula,
  hemobilia,
  pancreaticPseudocystBleeding,
  diverticularBleeding,
  colorectalCancerBleeding,
  colonicAngiodysplasia,
  ischemicColitisBleeding,
  ulcerativeColitisBleeding,
  crohnColitisBleeding,
  infectiousColitisBleeding,
  radiationColitisBleeding,
  solitaryRectalUlcerSyndrome,
  stercoralUlcerBleeding,
  hemorrhoidsBleeding,
  analFissureBleeding,
  rectalPolypsBleeding,
  proctitisBleeding,
  meckelDiverticulumBleeding,
  crohnEnteritisBleeding,
  smallBowelTumorBleeding,
  smallBowelAngiodysplasia,
  nsaidEnteropathyBleeding,
  tuberculousEnteritisBleeding,
  typhoidIntestinalBleeding,
  jejunalDiverticulosisBleeding,
  necrotizingEnterocolitisBleeding,
  intussusceptionBleeding,
  juvenilePolypsBleeding,
  vitaminKDeficiencyBleeding,
  swallowedMaternalBlood,
  obscureGiBleeding,
  giLymphomaBleeding,
  hereditaryHemorrhagicTelangiectasia,
];
