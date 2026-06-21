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
// SECTION 1: FUNCTIONAL (4 nodes)
// -------------------------------------------------------------------------------

export const functional_constipation: DiseaseNode = {
  id: 'functional_constipation', name: 'Functional Constipation (Chronic Idiopathic)', icdCode: 'K59.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [20, 60], sexRisk: { male: 0.7, female: 1.5 }, backgroundPrevalence: 0.15, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic idiopathic constipation is a functional bowel disorder defined by symptoms of difficult or infrequent bowel movements without an identifiable organic cause. Rome IV criteria include straining, lumpy stools, sensation of incomplete evacuation, and <3 bowel movements per week.', timelineStages: [{ stageId: 1, label: 'Chronic constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.9, 0.5), sym('constipation_straining', 0.8, 0.65)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild lower abdominal discomfort', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Chronic and stable, with periods of worsening that may require laxative adjustment.' },
  features: { symptoms: [sym('constipation', 0.9, 0.5, { stageRelevance: [1] }), sym('constipation_duration', 0.85, 0.7, { stageRelevance: [1] }), sym('constipation_stool_frequency', 0.8, 0.6, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.85, 0.7, { stageRelevance: [1] }), sym('constipation_straining', 0.8, 0.65, { stageRelevance: [1] }), sym('constipation_incomplete_evacuation', 0.7, 0.65, { stageRelevance: [1] }), sym('constipation_bloating', 0.6, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.5, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('constipation_weight_loss', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No weight loss favours functional over organic cause' }), sym('constipation_rectal_bleeding', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'Absence of rectal bleeding favours functional aetiology' })], supporting: [] },
  differential: { mimics: ['ibs_constipation', 'slow_transit_constipation', 'pelvic_floor_dyssynergia', 'hypothyroidism_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_constipation', featureIds: ['alternat_bowel', 'constipation_abdominal_pain'] }, { fromDiseaseId: 'slow_transit_constipation', featureIds: ['constipation_stool_frequency'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_overflow', 'constipation_abdominal_distension'], riskFactors: ['elderly', 'none'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Prolonged constipation leads to accumulation of hard stool in the rectum requiring manual or medical disimpaction.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding'],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'functional', typicalDescription: 'Chronic constipation with infrequent, hard stools that require straining. Sensation of incomplete evacuation is common. No alarm features or organic cause identified.' },
};

export const ibs_constipation: DiseaseNode = {
  id: 'ibs_constipation', name: 'Irritable Bowel Syndrome with Constipation (IBS-C)', icdCode: 'K58.1', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 10, ageMax: 80, agePeak: [20, 50], sexRisk: { male: 0.5, female: 2 }, backgroundPrevalence: 0.05, riskFactors: [] },
  pathophysiology: { mechanism: 'IBS-C is a disorder of gut-brain interaction characterised by abdominal pain related to defecation, altered bowel habits (predominantly constipation), and bloating. Pathophysiology involves visceral hypersensitivity, altered motility, and dysbiosis.', timelineStages: [{ stageId: 1, label: 'IBS-C', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.9, 0.5), sym('constipation_abdominal_pain', 0.85, 0.65)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Cramping relieved by defecation', painLocationTypical: 'Lower abdomen, variable', painRadiationTypical: 'None' }], progressionRule: 'Chronic relapsing-remitting course. Symptoms fluctuate with stress, diet, and hormonal changes.' },
  features: { symptoms: [sym('constipation', 0.9, 0.5, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.85, 0.65, { stageRelevance: [1] }), sym('alternat_bowel', 0.6, 0.8, { stageRelevance: [1] }), sym('bloating', 0.7, 0.55, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.7, 0.7, { stageRelevance: [1] }), sym('constipation_straining', 0.6, 0.65, { stageRelevance: [1] }), sym('constipation_incomplete_evacuation', 0.6, 0.65, { stageRelevance: [1] }), sym('stool_relief', 0.5, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('constipation_weight_loss', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No weight loss favours IBS over organic pathology' }), sym('constipation_rectal_bleeding', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.15, label: 'Absence of rectal bleeding favours IBS over IBD or malignancy' })], supporting: [] },
  differential: { mimics: ['functional_constipation', 'slow_transit_constipation', 'pelvic_floor_dyssynergia', 'colorectal_cancer_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation', featureIds: ['constipation_abdominal_pain', 'alternat_bowel', 'stool_relief'] }, { fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding'] }], neverCloseConditions: ['colorectal_cancer_constipation'] },
  complications: [{ name: 'Impact on quality of life', warningFeatures: ['constipation_abdominal_pain', 'bloating'], riskFactors: ['severe_symptoms'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Chronic pain and bowel dysfunction significantly reduce quality of life and may lead to anxiety and depression.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding'],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'ibs', typicalDescription: 'Abdominal pain that improves with defecation, associated with constipation-predominant bowel habit. Bloating and alternating bowel pattern are common. No alarm features.' },
};

export const slow_transit_constipation: DiseaseNode = {
  id: 'slow_transit_constipation', name: 'Slow Transit Constipation (Colonic Inertia)', icdCode: 'K59.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 10, ageMax: 70, agePeak: [20, 50], sexRisk: { male: 0.3, female: 3 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Slow transit constipation results from reduced colonic motor activity, with prolonged transit time through the colon. Stool moves too slowly, leading to excessive water absorption and hard, infrequent stools. Often associated with reduced high-amplitude propagated contractions.', timelineStages: [{ stageId: 1, label: 'Slow transit', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.95, 0.5), sym('constipation_stool_frequency', 0.9, 0.6)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild diffuse discomfort', painLocationTypical: 'Generalised abdomen', painRadiationTypical: 'None' }], progressionRule: 'Chronic and often refractory to standard laxatives. May require prokinetics or surgical intervention (subtotal colectomy) in severe cases.' },
  features: { symptoms: [sym('constipation', 0.95, 0.5, { stageRelevance: [1] }), sym('constipation_stool_frequency', 0.9, 0.6, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.85, 0.7, { stageRelevance: [1] }), sym('constipation_bloating', 0.7, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.4, 0.65, { stageRelevance: [1] }), sym('constipation_duration', 0.85, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('constipation_straining', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.2, label: 'Minimal straining favours slow transit over outlet obstruction' })], supporting: [] },
  differential: { mimics: ['functional_constipation', 'pelvic_floor_dyssynergia', 'ibs_constipation', 'colonic_inertia'], distinguishingFeatures: [{ fromDiseaseId: 'pelvic_floor_dyssynergia', featureIds: ['constipation_straining', 'constipation_manual_maneuvers'] }, { fromDiseaseId: 'functional_constipation', featureIds: ['constipation_stool_frequency'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_overflow', 'constipation_abdominal_distension'], riskFactors: ['prolonged_transit'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Severe delay in colonic transit leads to impaction that may require hospital-based disimpaction.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding'],
  constipationManifestation: { duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['abdominal_distension'], mechanism: 'slow_transit', typicalDescription: 'Infrequent bowel movements with stools occurring less than once weekly. Bloating is prominent. Straining and sensation of incomplete evacuation are absent - the primary problem is infrequency.' },
};

export const pelvic_floor_dyssynergia: DiseaseNode = {
  id: 'pelvic_floor_dyssynergia', name: 'Dyssynergic Defecation (Pelvic Floor Dysfunction)', icdCode: 'K59.4', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 70, agePeak: [30, 60], sexRisk: { male: 0.5, female: 2 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'Dyssynergic defecation is a learned behavioural disorder where the pelvic floor muscles paradoxically contract (instead of relax) during attempted defecation. This creates functional outlet obstruction despite normal colonic transit. Often follows painful defecation events.', timelineStages: [{ stageId: 1, label: 'Outlet obstruction', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.9, 0.5), sym('constipation_straining', 0.95, 0.65)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Rectal/pelvic pressure', painLocationTypical: 'Rectum/perineum', painRadiationTypical: 'None' }], progressionRule: 'Chronic condition requiring biofeedback therapy. Without treatment, symptoms persist indefinitely.' },
  features: { symptoms: [sym('constipation', 0.9, 0.5, { stageRelevance: [1] }), sym('constipation_straining', 0.95, 0.65, { stageRelevance: [1] }), sym('constipation_incomplete_evacuation', 0.9, 0.65, { stageRelevance: [1] }), sym('constipation_manual_maneuvers', 0.7, 0.85, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.6, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.4, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'slow_transit_constipation', 'rectocele', 'anal_stenosis'], distinguishingFeatures: [{ fromDiseaseId: 'slow_transit_constipation', featureIds: ['constipation_straining', 'constipation_manual_maneuvers', 'constipation_stool_frequency'] }], neverCloseConditions: [] },
  complications: [{ name: 'Rectocele development', warningFeatures: ['constipation_manual_maneuvers'], riskFactors: ['chronic_straining'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Chronic straining may lead to development or worsening of rectocele.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'yes', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'outlet_obstruction', typicalDescription: 'Severe straining with defecation despite normal stool frequency. Sensation of incomplete evacuation is prominent, often requiring manual manoeuvres or digital evacuation to pass stool.' },
};

// -------------------------------------------------------------------------------
// SECTION 2: DIETARY / LIFESTYLE (4 nodes)
// -------------------------------------------------------------------------------

export const low_fiber_constipation: DiseaseNode = {
  id: 'low_fiber_constipation', name: 'Low Dietary Fiber Constipation', icdCode: 'K59.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 2, ageMax: 90, agePeak: [20, 60], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.1, riskFactors: [] },
  pathophysiology: { mechanism: 'Inadequate dietary fiber intake reduces stool bulk and slows colonic transit. Fiber increases stool water content and stimulates colonic motility. Low-fiber diets are a common cause of constipation, especially in Western populations.', timelineStages: [{ stageId: 1, label: 'Dietary constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.8, 0.5), sym('constipation_dietary_fiber', 0.9, 0.5)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild discomfort', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Gradual onset over weeks to months. Reversible with increased fiber intake.' },
  features: { symptoms: [sym('constipation', 0.8, 0.5, { stageRelevance: [1] }), sym('constipation_dietary_fiber', 0.9, 0.5, { stageRelevance: [1] }), sym('constipation_fluid_intake', 0.5, 0.5, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.7, 0.7, { stageRelevance: [1] }), sym('constipation_stool_frequency', 0.6, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('constipation_weight_loss', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No weight loss - purely dietary aetiology' })], supporting: [] },
  differential: { mimics: ['dehydration_constipation', 'functional_constipation', 'ibs_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation', featureIds: ['constipation_dietary_fiber', 'constipation_fluid_intake'] }], neverCloseConditions: [] },
  complications: [{ name: 'Haemorrhoidal exacerbation', warningFeatures: ['constipation_straining', 'constipation_rectal_bleeding'], riskFactors: ['chronic_straining'], timeWindowHours: [2160, 21600], severityTier: 'mild', description: 'Chronic straining from low-fibre stools can worsen or precipitate haemorrhoids.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'functional', typicalDescription: 'Constipation associated with inadequate dietary fiber intake. Stools are hard and infrequent. Responds well to dietary modification.' },
};

export const dehydration_constipation: DiseaseNode = {
  id: 'dehydration_constipation', name: 'Dehydration-Related Constipation', icdCode: 'K59.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [20, 70], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.05, riskFactors: [] },
  pathophysiology: { mechanism: 'Inadequate fluid intake reduces the water content of stool, leading to harder, drier stools that are more difficult to pass. The colon absorbs water from stool; dehydration accentuates this process, resulting in slow transit and constipation.', timelineStages: [{ stageId: 1, label: 'Dehydration constipation', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('constipation', 0.8, 0.5), sym('constipation_fluid_intake', 0.9, 0.5)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Reversible with increased fluid intake. Rapid onset when fluid restriction is severe.' },
  features: { symptoms: [sym('constipation', 0.8, 0.5, { stageRelevance: [1] }), sym('constipation_fluid_intake', 0.9, 0.5, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.7, 0.7, { stageRelevance: [1] }), sym('constipation_straining', 0.6, 0.65, { stageRelevance: [1] }), sym('constipation_dietary_fiber', 0.4, 0.5, { stageRelevance: [1] }), sym('constipation_endocrine', 0.3, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['low_fiber_constipation', 'functional_constipation', 'hypercalcemia_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'low_fiber_constipation', featureIds: ['constipation_dietary_fiber'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_overflow'], riskFactors: ['elderly', 'none'], timeWindowHours: [168, 720], severityTier: 'moderate', description: 'Chronic dehydration can lead to hard stool accumulation and impaction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'variable', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'functional', typicalDescription: 'Constipation developing in the setting of poor fluid intake. Stools are dry and hard. Promptly improves with rehydration.' },
};


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: MECHANICAL LARGE BOWEL OBSTRUCTION (6 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const colorectal_cancer_constipation: DiseaseNode = {
  id: 'colorectal_cancer_constipation', name: 'Colorectal Carcinoma with Obstruction', icdCode: 'C18.9', system: 'surgical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 40, ageMax: 90, agePeak: [60, 80], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Colorectal carcinoma causes progressive luminal narrowing leading to partial or complete large bowel obstruction. Left-sided tumours present earlier with constipation, whereas right-sided tumours present later with anaemia. Obstruction occurs when the tumour encircles the bowel lumen.', timelineStages: [{ stageId: 1, label: 'Partial obstruction', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('constipation_rectal_bleeding', 0.6, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Colicky abdominal pain', painLocationTypical: 'Periumbilical / lower abdomen', painRadiationTypical: 'None' }, { stageId: 2, label: 'Complete obstruction', typicalHoursFromOnset: [2160, 4320], dominantSymptoms: [sym('constipation_obstipation', 0.9, 0.8), sym('constipation_abdominal_distension', 0.85, 0.75)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe colicky then constant', painLocationTypical: 'Generalised', painRadiationTypical: 'Back' }], progressionRule: 'Gradual onset over months. Complete obstruction is a surgical emergency requiring immediate decompression.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1, 2] }), sym('constipation_rectal_bleeding', 0.6, 0.9, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.5, 0.9, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.6, 0.65, { stageRelevance: [1, 2] }), sym('constipation_abdominal_distension', 0.7, 0.75, { stageRelevance: [2] }), sym('constipation_obstipation', 0.6, 0.8, { stageRelevance: [2] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['diverticular_stricture', 'ibs_constipation', 'sigmoid_volvulus', 'fecal_impaction'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_constipation', featureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding', 'constipation_duration'] }, { fromDiseaseId: 'fecal_impaction', featureIds: ['constipation_rectal_bleeding'] }], neverCloseConditions: ['ibs_constipation'] },
  complications: [{ name: 'Complete large bowel obstruction', warningFeatures: ['constipation_obstipation', 'constipation_abdominal_distension', 'constipation_vomiting'], riskFactors: ['left_sided_tumour'], timeWindowHours: [336, 2160], severityTier: 'critical', description: 'Complete obstruction leads to closed-loop obstruction, perforation, peritonitis, and death if not urgently decompressed.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding', 'constipation_obstipation'],
  constipationManifestation: { duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'ribbon_like', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'yes', associatedSymptoms: ['weight_loss', 'abdominal_distension'], mechanism: 'mechanical_obstruction', typicalDescription: 'Progressive constipation with decreasing stool calibre (ribbon-like stools), rectal bleeding, weight loss, and abdominal pain. Later stages present with complete obstruction with obstipation, distension, and vomiting.' },
};

export const diverticular_stricture: DiseaseNode = {
  id: 'diverticular_stricture', name: 'Diverticular Stricture', icdCode: 'K57.8', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 40, ageMax: 90, agePeak: [55, 75], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Recurrent episodes of diverticulitis cause chronic inflammation and fibrosis of the colonic wall, resulting in a fixed stricture (most commonly in the sigmoid colon). The stricture causes progressive narrowing of the colonic lumen, leading to constipation, ribbon-like stools, and potential obstruction.', timelineStages: [{ stageId: 1, label: 'Stricture formation', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('diverticulitis_history', 0.85, 0.8)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Left lower quadrant discomfort', painLocationTypical: 'Left lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'Slowly progressive over months to years. May eventually cause complete obstruction.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('diverticulitis_history', 0.85, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.5, 0.75, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.5, 0.65, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.6, 0.7, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.2, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'crohn_stricture', 'radiation_stricture', 'sigmoid_volvulus'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['diverticulitis_history', 'constipation_weight_loss'] }], neverCloseConditions: ['colorectal_cancer_constipation'] },
  complications: [{ name: 'Complete colonic obstruction', warningFeatures: ['constipation_obstipation', 'constipation_abdominal_distension'], riskFactors: ['recurrent_diverticulitis'], timeWindowHours: [720, 4320], severityTier: 'severe', description: 'Progression to complete obstruction requiring surgical resection.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss'],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'ribbon_like', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'mechanical_obstruction', typicalDescription: 'Progressive constipation with narrowing stools in a patient with prior diverticulitis episodes. Left lower quadrant pain and bloating are common.' },
};

export const radiation_stricture: DiseaseNode = {
  id: 'radiation_stricture', name: 'Radiation-Induced Colonic Stricture', icdCode: 'K62.5', system: 'surgical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 75], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Pelvic radiation therapy (commonly for prostate, cervical, bladder or rectal cancer) causes progressive obliterative endarteritis, ischaemia, and fibrosis of the bowel wall. This leads to chronic radiation proctocolitis and the formation of strictures months to years after treatment.', timelineStages: [{ stageId: 1, label: 'Radiation fibrosis', typicalHoursFromOnset: [720, 8760], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('constipation_rectal_bleeding', 0.4, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Rectal pain / tenesmus', painLocationTypical: 'Rectum / pelvis', painRadiationTypical: 'None' }], progressionRule: 'Typically presents 6-24 months after pelvic radiotherapy. Slowly progressive.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.4, 0.9, { stageRelevance: [1] }), sym('pelvic_radiation_history', 0.95, 0.9, { stageRelevance: [1] }), sym('constipation_tenesmus', 0.5, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.4, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'diverticular_stricture', 'radiation_proctitis', 'pelvic_malignancy_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['pelvic_radiation_history', 'constipation_weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Complete obstruction', warningFeatures: ['constipation_obstipation', 'constipation_abdominal_distension'], riskFactors: ['high_dose_radiation'], timeWindowHours: [720, 4320], severityTier: 'severe', description: 'Radiation strictures progress slowly but may eventually cause complete obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_rectal_bleeding'],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'ribbon_like', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'yes', associatedSymptoms: ['tenesmus'], mechanism: 'mechanical_obstruction', typicalDescription: 'Progressive constipation following pelvic radiation. Rectal bleeding, tenesmus, and ribbon-like stools develop months to years after treatment.' },
};

export const crohn_stricture: DiseaseNode = {
  id: 'crohn_stricture', name: 'Crohn Disease with Colonic Stricture', icdCode: 'K50.1', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 60, agePeak: [20, 40], sexRisk: { male: 1, female: 1.1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Crohn disease causes transmural inflammation of the bowel wall, which leads to fibrosis and stricture formation. Strictures in Crohn can be inflammatory (oedematous) or fibrotic (fixed). The colon and terminal ileum are most commonly affected, causing chronic constipation with abdominal pain.', timelineStages: [{ stageId: 1, label: 'Active stricture', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('constipation_abdominal_pain', 0.7, 0.65)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Cramping postprandial', painLocationTypical: 'Right lower quadrant / periumbilical', painRadiationTypical: 'None' }], progressionRule: 'Episodic inflammation with progressive fibrotic narrowing. May respond to medical therapy if primarily inflammatory.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.7, 0.65, { stageRelevance: [1] }), sym('chronic_diarrhoea', 0.6, 0.7, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.5, 0.9, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.3, 0.9, { stageRelevance: [1] }), sym('perianal_fistula', 0.3, 0.95, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'diverticular_stricture', 'ibs_constipation', 'radiation_stricture'], distinguishingFeatures: [{ fromDiseaseId: 'diverticular_stricture', featureIds: ['chronic_diarrhoea', 'perianal_fistula', 'constipation_weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Complete small bowel/colonic obstruction', warningFeatures: ['constipation_abdominal_pain', 'constipation_abdominal_distension', 'constipation_vomiting'], riskFactors: ['longstanding_disease'], timeWindowHours: [336, 2160], severityTier: 'severe', description: 'Chronic stricturing Crohn disease may progress to complete obstruction requiring surgical resection.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding'],
  constipationManifestation: { duration: 'chronic', frequency: 'variable', stoolConsistency: 'variable', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'yes', associatedSymptoms: ['abdominal_distension', 'weight_loss', 'none'], mechanism: 'mechanical_obstruction', typicalDescription: 'Constipation in known Crohn disease with colonic stricture. May alternate with diarrhoea. Abdominal pain, weight loss, and fistulae suggest active disease.' },
};

export const sigmoid_volvulus: DiseaseNode = {
  id: 'sigmoid_volvulus', name: 'Sigmoid Volvulus', icdCode: 'K56.2', system: 'surgical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 50, ageMax: 95, agePeak: [65, 85], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Sigmoid volvulus occurs when a redundant sigmoid colon twists around its mesenteric axis, causing a closed-loop obstruction. This leads to rapid accumulation of gas and fluid, severe distension, and ischaemia. Predisposing factors include chronic constipation, a long sigmoid mesentery, and institutionalisation.', timelineStages: [{ stageId: 1, label: 'Volvulus', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('constipation_obstipation', 0.95, 0.8), sym('constipation_abdominal_distension', 0.95, 0.75)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe cramping then constant', painLocationTypical: 'Lower abdomen, left > right', painRadiationTypical: 'Back' }], progressionRule: 'Rapid onset over hours. Requires urgent endoscopic or surgical detorsion. Recurrence is common.' },
  features: { symptoms: [sym('constipation_obstipation', 0.95, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.95, 0.75, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.8, 0.65, { stageRelevance: [1] }), sym('constipation_vomiting', 0.5, 0.85, { stageRelevance: [1] }), sym('prior_volvulus', 0.4, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['cecal_volvulus', 'colorectal_cancer_constipation', 'large_bowel_obstruction', 'fecal_impaction'], distinguishingFeatures: [{ fromDiseaseId: 'cecal_volvulus', featureIds: ['constipation_abdominal_pain'] }], neverCloseConditions: [] },
  complications: [{ name: 'Bowel ischaemia and perforation', warningFeatures: ['peritonitis', 'sepsis', 'constipation_abdominal_distension'], riskFactors: ['delayed_detorsion'], timeWindowHours: [24, 72], severityTier: 'critical', description: 'Strangulation of the twisted segment leads to ischaemia, gangrene, and perforation within hours.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_obstipation', 'constipation_abdominal_distension'],
  constipationManifestation: { duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'variable', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'abdominal_distension'], mechanism: 'mechanical_obstruction', typicalDescription: 'Acute onset of obstipation and massive abdominal distension in elderly or institutionalised patients. Severe cramping pain. "Coffee bean" sign on abdominal X-ray.' },
};

export const cecal_volvulus: DiseaseNode = {
  id: 'cecal_volvulus', name: 'Cecal Volvulus', icdCode: 'K56.2', system: 'surgical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 30, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Cecal volvulus occurs when the caecum and ascending colon twist around their mesenteric axis, causing closed-loop obstruction. Unlike sigmoid volvulus, it tends to occur in younger patients. The caecum becomes massively distended and risk of perforation is high.', timelineStages: [{ stageId: 1, label: 'Cecal volvulus', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('constipation_obstipation', 0.8, 0.8), sym('constipation_abdominal_pain', 0.9, 0.65)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe cramping then constant', painLocationTypical: 'Right lower quadrant / mid-abdomen', painRadiationTypical: 'None' }], progressionRule: 'Acute onset. High risk of perforation. Requires surgical intervention.' },
  features: { symptoms: [sym('constipation_obstipation', 0.8, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.9, 0.65, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.85, 0.75, { stageRelevance: [1] }), sym('constipation_vomiting', 0.6, 0.85, { stageRelevance: [1] }), sym('prior_abdominal_surgery', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['sigmoid_volvulus', 'appendicitis', 'colorectal_cancer_constipation', 'large_bowel_obstruction'], distinguishingFeatures: [{ fromDiseaseId: 'sigmoid_volvulus', featureIds: ['constipation_abdominal_pain'] }], neverCloseConditions: [] },
  complications: [{ name: 'Cecal perforation', warningFeatures: ['peritonitis', 'sepsis'], riskFactors: ['delayed_surgery'], timeWindowHours: [24, 72], severityTier: 'critical', description: 'Cecal volvulus rapidly progresses to ischaemia and perforation without surgical intervention.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_obstipation', 'constipation_abdominal_distension'],
  constipationManifestation: { duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'variable', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'vomiting'], mechanism: 'mechanical_obstruction', typicalDescription: 'Acute obstipation with severe right-sided or periumbilical pain, abdominal distension, and vomiting. "Comma sign" on abdominal X-ray.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: FAECAL / RECTAL (4 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const fecal_impaction: DiseaseNode = {
  id: 'fecal_impaction', name: 'Faecal Impaction', icdCode: 'K56.4', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 95, agePeak: [65, 85], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'Faecal impaction is the accumulation of hard, dry stool in the rectum that cannot be spontaneously evacuated. The stool mass becomes progressively harder and larger as water is absorbed. Impaction leads to overflow incontinence as liquid stool seeps around the mass. Common in elderly, institutionalised, and constipated patients.', timelineStages: [{ stageId: 1, label: 'Impaction', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('constipation', 0.9, 0.5), sym('constipation_overflow', 0.6, 0.8)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Rectal discomfort / pressure', painLocationTypical: 'Rectum / sacrum', painRadiationTypical: 'None' }], progressionRule: 'Progressive without treatment. May lead to stercoral ulcer, perforation, or megacolon.' },
  features: { symptoms: [sym('constipation', 0.9, 0.5, { stageRelevance: [1] }), sym('constipation_overflow', 0.6, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.5, 0.65, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.6, 0.75, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.2, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'sigmoid_volvulus', 'rectal_prolapse', 'severe_hemorrhoids'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['constipation_overflow'] }], neverCloseConditions: [] },
  complications: [{ name: 'Stercoral ulcer / perforation', warningFeatures: ['constipation_abdominal_pain', 'peritonitis', 'constipation_rectal_bleeding'], riskFactors: ['prolonged_impaction'], timeWindowHours: [336, 2160], severityTier: 'critical', description: 'Prolonged faecal impaction can cause pressure necrosis of the rectal wall, leading to stercoral ulceration and perforation.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_rectal_bleeding'],
  constipationManifestation: { duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'mechanical_obstruction', typicalDescription: 'Chronic constipation culminating in a large, hard faecal mass in the rectum. Overflow incontinence with liquid stool leakage occurs as the hallmark sign.' },
};

export const rectocele: DiseaseNode = {
  id: 'rectocele', name: 'Rectocele', icdCode: 'N81.6', system: 'gynaecological',
  organSystem: 'reproductive_female', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 35, ageMax: 85, agePeak: [50, 75], sexRisk: { male: 0, female: 1 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'A rectocele is a herniation of the anterior rectal wall into the posterior vagina, caused by weakness of the rectovaginal septum. It creates a pouch that traps stool during attempted defecation, requiring digitation or splinting of the vagina to evacuate. Vaginal childbirth is the primary risk factor.', timelineStages: [{ stageId: 1, label: 'Rectocele', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('constipation_incomplete_evacuation', 0.8, 0.65)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Pelvic pressure', painLocationTypical: 'Pelvis / vagina', painRadiationTypical: 'None' }], progressionRule: 'May progress with age and further childbirth. Surgical repair possible for symptomatic cases.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('constipation_incomplete_evacuation', 0.8, 0.65, { stageRelevance: [1] }), sym('constipation_manual_maneuvers', 0.6, 0.85, { stageRelevance: [1] }), sym('none', 0.7, 0.8, { stageRelevance: [1] }), sym('constipation_straining', 0.6, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['enterocele', 'rectal_prolapse', 'pelvic_floor_dyssynergia', 'uterine_fibroids_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'pelvic_floor_dyssynergia', featureIds: ['none'] }], neverCloseConditions: [] },
  complications: [{ name: 'Vaginal ulceration', warningFeatures: ['none', 'bleeding'], riskFactors: ['prolonged_prolapse'], timeWindowHours: [4320, 43200], severityTier: 'mild', description: 'Mucosal ulceration of the rectocele may occur with chronic prolapse.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'yes', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'outlet_obstruction', typicalDescription: 'Constipation with a sensation of incomplete evacuation and the need to splint the posterior vagina or perineum to pass stool. A visible or palpable vaginal bulge is present.' },
};

export const enterocele: DiseaseNode = {
  id: 'enterocele', name: 'Enterocele', icdCode: 'N81.5', system: 'gynaecological',
  organSystem: 'reproductive_female', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 40, ageMax: 80, agePeak: [55, 75], sexRisk: { male: 0, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'An enterocele is a herniation of the peritoneal sac containing small bowel into the rectovaginal or rectouterine space. It causes a sensation of pelvic pressure and incomplete evacuation. Unlike rectocele, splinting does not typically help. Small bowel loops compress the rectum during defecation.', timelineStages: [{ stageId: 1, label: 'Enterocele', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('constipation_incomplete_evacuation', 0.7, 0.65)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Pelvic pressure / dragging', painLocationTypical: 'Pelvis / lower back', painRadiationTypical: 'None' }], progressionRule: 'Slowly progressive. Associated with pelvic floor weakness.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('constipation_incomplete_evacuation', 0.7, 0.65, { stageRelevance: [1] }), sym('none', 0.7, 0.7, { stageRelevance: [1] }), sym('low_back_pain', 0.4, 0.65, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.3, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['rectocele', 'rectal_prolapse', 'pelvic_floor_dyssynergia', 'pelvic_malignancy_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'rectocele', featureIds: ['constipation_manual_maneuvers', 'none'] }], neverCloseConditions: [] },
  complications: [{ name: 'Incarceration', warningFeatures: ['constipation_abdominal_pain', 'constipation_vomiting'], riskFactors: ['large_enterocele'], timeWindowHours: [336, 2160], severityTier: 'moderate', description: 'Small bowel may become incarcerated within the enterocele sac.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining', straining: 'no', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'outlet_obstruction', typicalDescription: 'Constipation with pelvic pressure and incomplete evacuation. Unlike rectocele, splinting does not help. Small bowel loops herniate into the rectovaginal space.' },
};

export const rectal_prolapse: DiseaseNode = {
  id: 'rectal_prolapse', name: 'Complete Rectal Prolapse (Procidentia)', icdCode: 'K62.3', system: 'surgical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 5, ageMax: 90, agePeak: [60, 80], sexRisk: { male: 0.2, female: 5 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Complete rectal prolapse involves full-thickness protrusion of the rectal wall through the anal canal. Chronic constipation and straining are both causes and consequences. The prolapse causes a sensation of a mass, mucous discharge, bleeding, and faecal incontinence.', timelineStages: [{ stageId: 1, label: 'Rectal prolapse', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('tenesmus', 0.9, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dragging sensation', painLocationTypical: 'Rectum / perineum', painRadiationTypical: 'None' }], progressionRule: 'Slowly progressive. May worsen with continued straining.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('tenesmus', 0.9, 0.9, { stageRelevance: [1] }), sym('none', 0.4, 0.85, { stageRelevance: [1] }), sym('mucous_discharge', 0.6, 0.8, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.3, 0.9, { stageRelevance: [1] }), sym('constipation_incomplete_evacuation', 0.5, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['severe_hemorrhoids', 'rectocele', 'enterocele', 'anal_mucosal_prolapse'], distinguishingFeatures: [{ fromDiseaseId: 'severe_hemorrhoids', featureIds: ['tenesmus'] }], neverCloseConditions: [] },
  complications: [{ name: 'Strangulated prolapse', warningFeatures: ['tenesmus', 'pain', 'ischaemia'], riskFactors: ['complete_prolapse'], timeWindowHours: [24, 168], severityTier: 'severe', description: 'Incarcerated and strangulated rectal prolapse is a surgical emergency.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'variable', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'yes', associatedSymptoms: ['tenesmus', 'mucus', 'none'], mechanism: 'outlet_obstruction', typicalDescription: 'Constipation with visible rectal protrusion during defecation. Mucous discharge, bleeding, and faecal incontinence are associated.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: ANORECTAL (4 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const anal_stenosis: DiseaseNode = {
  id: 'anal_stenosis', name: 'Anal Stenosis', icdCode: 'K62.4', system: 'surgical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Anal stenosis is a narrowing of the anal canal, often post-surgical (haemorrhoidectomy), post-radiation, or due to chronic anal fissures. The narrowed canal causes difficulty passing stool, leading to constipation, straining, and painful defecation.', timelineStages: [{ stageId: 1, label: 'Anal stenosis', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('tenesmus', 0.8, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Sharp / tearing with defecation', painLocationTypical: 'Anal canal', painRadiationTypical: 'None' }], progressionRule: 'May progress with continued scarring. Responds to anal dilatation or surgical repair.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('tenesmus', 0.8, 0.8, { stageRelevance: [1] }), sym('constipation_straining', 0.7, 0.65, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.6, 0.7, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.3, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['anal_fissure', 'severe_hemorrhoids', 'pelvic_floor_dyssynergia', 'anorectal_malformation'], distinguishingFeatures: [{ fromDiseaseId: 'anal_fissure', featureIds: ['tenesmus'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_obstipation'], riskFactors: ['severe_stenosis'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Severe anal stenosis may prevent passage of any formed stool, leading to impaction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'yes', associatedSymptoms: ['tenesmus'], mechanism: 'outlet_obstruction', typicalDescription: 'Constipation with painful, difficult passage of stool due to a narrowed anal canal. Often post-surgical or post-radiation.' },
};

export const severe_hemorrhoids: DiseaseNode = {
  id: 'severe_hemorrhoids', name: 'Severe Internal Haemorrhoids with Prolapse', icdCode: 'I84.2', system: 'surgical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.05, riskFactors: [] },
  pathophysiology: { mechanism: 'Large, prolapsing internal haemorrhoids can obstruct the anal canal and cause a sensation of incomplete evacuation. Patients may withhold stool due to pain and bleeding, leading to constipation. Straining worsens haemorrhoids, creating a vicious cycle.', timelineStages: [{ stageId: 1, label: 'Haemorrhoidal prolapse', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.4, 0.5), sym('constipation_rectal_bleeding', 0.8, 0.9)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Sharp / aching with defecation', painLocationTypical: 'Anal canal', painRadiationTypical: 'None' }], progressionRule: 'Chronic, with intermittent exacerbations. May require surgical intervention for Grade III-IV haemorrhoids.' },
  features: { symptoms: [sym('constipation', 0.4, 0.5, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.8, 0.9, { stageRelevance: [1] }), sym('anal_pruritus', 0.5, 0.7, { stageRelevance: [1] }), sym('constipation_straining', 0.5, 0.65, { stageRelevance: [1] }), sym('tenesmus', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['anal_fissure', 'colorectal_cancer_constipation', 'rectal_prolapse', 'anal_stenosis'], distinguishingFeatures: [{ fromDiseaseId: 'anal_fissure', featureIds: ['constipation_rectal_bleeding'] }], neverCloseConditions: [] },
  complications: [{ name: 'Thrombosed haemorrhoid', warningFeatures: ['tenesmus', 'anal_swelling'], riskFactors: ['straining'], timeWindowHours: [24, 168], severityTier: 'mild', description: 'Acute thrombosis of haemorrhoidal vessels causes severe anal pain.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_rectal_bleeding'],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'variable', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'yes', associatedSymptoms: ['tenesmus', 'none'], mechanism: 'outlet_obstruction', typicalDescription: 'Constipation with bright red rectal bleeding, anal pain, and prolapsing haemorrhoidal tissue. Straining aggravates both the constipation and the haemorrhoids.' },
};

export const anal_fissure: DiseaseNode = {
  id: 'anal_fissure', name: 'Chronic Anal Fissure', icdCode: 'K60.1', system: 'surgical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 60, agePeak: [25, 45], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'An anal fissure is a tear in the anal mucosa, typically posterior midline. The pain during and after defecation causes patients to withhold stool, leading to constipation. Hard stools exacerbate the fissure, leading to a cycle of pain, withholding, and harder stools. Chronic fissures develop fibrosis and a sentinel tag.', timelineStages: [{ stageId: 1, label: 'Anal fissure', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('tenesmus', 0.9, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Sharp / tearing on defecation, burning for hours after', painLocationTypical: 'Anal verge', painRadiationTypical: 'None' }], progressionRule: 'May heal with conservative measures (fiber, topical nifedipine/glyceryl trinitrate). Chronic fissures may require lateral internal sphincterotomy.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('tenesmus', 0.9, 0.7, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.7, 0.9, { stageRelevance: [1] }), sym('constipation_straining', 0.5, 0.65, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['severe_hemorrhoids', 'anal_stenosis', 'anorectal_malformation', 'anal_tuberculosis_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'severe_hemorrhoids', featureIds: ['tenesmus'] }], neverCloseConditions: [] },
  complications: [{ name: 'Chronic fissure / fibrosis', warningFeatures: ['tenesmus', 'anal_stenosis'], riskFactors: ['delayed_healing'], timeWindowHours: [720, 4320], severityTier: 'mild', description: 'Untreated chronic fissure leads to fibrosis and may progress to anal stenosis.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'yes', associatedSymptoms: ['tenesmus'], mechanism: 'functional', typicalDescription: 'Constipation driven by fear of anal pain during defecation. The underlying cause is a chronic anal tear causing sharp pain with bowel movements.' },
};

export const anorectal_malformation: DiseaseNode = {
  id: 'anorectal_malformation', name: 'Anorectal Malformation (Postsurgical Sequelae)', icdCode: 'Q42.9', system: 'paediatric',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 0, ageMax: 50, agePeak: [0, 10], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Anorectal malformations (imperforate anus, cloacal anomalies) require surgical correction in infancy. Long-term sequelae include constipation from (1) surgically altered anatomy, (2) impaired sensation, (3) rectal dysmotility, and (4) associated sacral nerve abnormalities.', timelineStages: [{ stageId: 1, label: 'ARM constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.8, 0.5), sym('congenital_anorectal_malformation', 0.95, 0.5)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Variable', painLocationTypical: 'Perineal / rectal', painRadiationTypical: 'None' }], progressionRule: 'Lifelong. Managed with bowel management programs.' },
  features: { symptoms: [sym('constipation', 0.8, 0.5, { stageRelevance: [1] }), sym('congenital_anorectal_malformation', 0.95, 0.5, { stageRelevance: [1] }), sym('none', 0.5, 0.85, { stageRelevance: [1] }), sym('constipation_incomplete_evacuation', 0.5, 0.65, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.3, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation_child', 'hirschsprung_disease', 'spina_bifida_constipation', 'anal_stenosis'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation_child', featureIds: ['congenital_anorectal_malformation'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_abdominal_pain', 'constipation_overflow'], riskFactors: ['altered_anatomy'], timeWindowHours: [336, 2160], severityTier: 'mild', description: 'Patients with surgically corrected ARM are prone to faecal impaction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'mixed', typicalDescription: 'Constipation in a patient with history of surgically corrected anorectal malformation. Associated with faecal incontinence and altered rectal sensation.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: NEUROLOGICAL CNS (5 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const parkinson_constipation: DiseaseNode = {
  id: 'parkinson_constipation', name: 'Parkinson Disease Constipation', icdCode: 'G20', system: 'medical',
  organSystem: 'neurological', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 50, ageMax: 90, agePeak: [60, 80], sexRisk: { male: 1.3, female: 1 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'Constipation in Parkinson disease results from (1) Lewy body pathology in the enteric nervous system (predating CNS symptoms by years), (2) reduced colonic motility due to autonomic dysfunction, (3) pelvic floor dystonia causing outlet obstruction, and (4) anticholinergic medications used for treatment.', timelineStages: [{ stageId: 1, label: 'PD constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.8, 0.5), sym('neurological', 0.7, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'May precede motor symptoms by years. Gradually worsens with disease progression.' },
  features: { symptoms: [sym('constipation', 0.8, 0.5, { stageRelevance: [1] }), sym('neurological', 0.7, 0.85, { stageRelevance: [1] }), sym('neurological', 0.7, 0.85, { stageRelevance: [1] }), sym('neurological', 0.6, 0.85, { stageRelevance: [1] }), sym('constipation_straining', 0.6, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['multiple_sclerosis_constipation', 'dementia_constipation', 'functional_constipation', 'hypothyroidism_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation', featureIds: ['neurological', 'neurological', 'neurological'] }], neverCloseConditions: [] },
  complications: [{ name: 'Megacolon', warningFeatures: ['constipation_abdominal_distension', 'constipation_overflow'], riskFactors: ['longstanding_disease'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Severe, prolonged constipation in PD can lead to megacolon.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['neurological', 'neurological', 'neurological'], mechanism: 'mixed', typicalDescription: 'Chronic constipation in a patient with Parkinson disease. Often begins years before motor symptoms. Both slow transit and outlet obstruction components contribute.' },
};

export const multiple_sclerosis_constipation: DiseaseNode = {
  id: 'multiple_sclerosis_constipation', name: 'Multiple Sclerosis Constipation', icdCode: 'G35', system: 'medical',
  organSystem: 'neurological', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 60, agePeak: [30, 50], sexRisk: { male: 0.4, female: 2.5 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Constipation in multiple sclerosis results from demyelinating lesions in the spinal cord that disrupt the neural pathways controlling colonic motility and defecation. Pelvic floor dyssynergia is common. Reduced mobility and anticholinergic medications for bladder symptoms exacerbate constipation.', timelineStages: [{ stageId: 1, label: 'MS constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('optic_neuritis', 0.4, 0.9)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Variable', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'May fluctuate with relapses. Usually worsens with disease progression.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('optic_neuritis', 0.4, 0.9, { stageRelevance: [1] }), sym('numbness_tingling', 0.6, 0.8, { stageRelevance: [1] }), sym('none', 0.7, 0.75, { stageRelevance: [1] }), sym('neurological', 0.4, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['parkinson_constipation', 'stroke_constipation', 'spinal_cord_injury_constipation', 'functional_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'parkinson_constipation', featureIds: ['optic_neuritis', 'numbness_tingling'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_overflow', 'constipation_abdominal_distension'], riskFactors: ['spinal_lesions', 'none'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Severe constipation in MS frequently leads to faecal impaction requiring disimpaction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'neurological', 'neurological'], mechanism: 'mixed', typicalDescription: 'Constipation in a patient with known MS. Spinal cord lesions impair colonic motility and pelvic floor coordination.' },
};

export const stroke_constipation: DiseaseNode = {
  id: 'stroke_constipation', name: 'Post-Stroke Constipation', icdCode: 'I69.3', system: 'medical',
  organSystem: 'neurological', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 45, ageMax: 95, agePeak: [65, 85], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'Constipation after stroke is multifactorial: (1) reduced mobility and bed rest, (2) impaired ability to sense or communicate the urge to defecate, (3) dysphagia leading to poor oral intake, (4) medications (opioids, anticholinergics), and (5) direct disruption of central pathways controlling defecation.', timelineStages: [{ stageId: 1, label: 'Post-stroke', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('neurological', 0.8, 0.85)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Variable', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Often improves with rehabilitation and mobilisation. May become chronic in severely disabled patients.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('neurological', 0.8, 0.85, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.8, { stageRelevance: [1] }), sym('dysarthria', 0.5, 0.75, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.3, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['dementia_constipation', 'parkinson_constipation', 'functional_constipation', 'immobility_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'parkinson_constipation', featureIds: ['neurological'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_overflow', 'constipation_abdominal_distension'], riskFactors: ['severe_stroke', 'none'], timeWindowHours: [168, 720], severityTier: 'moderate', description: 'Post-stroke patients are at high risk for faecal impaction due to immobility and poor intake.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['neurological', 'vomiting'], mechanism: 'mixed', typicalDescription: 'Constipation developing after a stroke due to immobility, poor intake, medications, and impaired defecation sensation.' },
};

export const dementia_constipation: DiseaseNode = {
  id: 'dementia_constipation', name: 'Constipation in Dementia', icdCode: 'F02.8', system: 'psychiatric',
  organSystem: 'neurological', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 60, ageMax: 100, agePeak: [75, 90], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'Constipation in dementia results from (1) inability to recognise or communicate the urge to defecate, (2) forgetting to drink or eat adequately, (3) inability to toilet independently, (4) refusal to use unfamiliar toilets, and (5) medications used for behavioural symptoms (antipsychotics, antidepressants). Faecal impaction is common.', timelineStages: [{ stageId: 1, label: 'Dementia constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('constipation_overflow', 0.5, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'None / unrecognised', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Chronic. Risk increases with dementia severity.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('constipation_overflow', 0.5, 0.8, { stageRelevance: [1] }), sym('cognitive_impairment', 0.9, 0.85, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.3, 0.75, { stageRelevance: [1] }), sym('neurological', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['geriatric_multifactorial_constipation', 'fecal_impaction', 'colorectal_cancer_constipation', 'dehydration_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'geriatric_multifactorial_constipation', featureIds: ['cognitive_impairment', 'neurological'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction with overflow', warningFeatures: ['constipation_overflow', 'neurological'], riskFactors: ['severe_dementia'], timeWindowHours: [336, 2160], severityTier: 'moderate', description: 'Behavioural disturbance may be the first sign of faecal impaction in dementia.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'neurological'], mechanism: 'functional', typicalDescription: 'Constipation in a patient with dementia, often unrecognised until overflow soiling or behavioural change occurs.' },
};

export const brain_tumor_constipation: DiseaseNode = {
  id: 'brain_tumor_constipation', name: 'Brain Tumour Related Constipation', icdCode: 'C71.9', system: 'medical',
  organSystem: 'neurological', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 1.1, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Brain tumours can cause constipation through (1) increased intracranial pressure causing vomiting and reduced oral intake, (2) neurological deficits affecting mobility and toileting, (3) focal deficits affecting defecation sensation, (4) medications (opioids, corticosteroids), and (5) hypothalamic/pituitary tumours affecting autonomic function.', timelineStages: [{ stageId: 1, label: 'Tumour constipation', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.4, 0.5), sym('neurological', 0.7, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Headache-related', painLocationTypical: 'Head / variable', painRadiationTypical: 'None' }], progressionRule: 'May progress with tumour growth or treatment side effects.' },
  features: { symptoms: [sym('constipation', 0.4, 0.5, { stageRelevance: [1] }), sym('neurological', 0.7, 0.7, { stageRelevance: [1] }), sym('nausea_vomiting', 0.5, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.3, 0.65, { stageRelevance: [1] }), sym('neurological', 0.6, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['stroke_constipation', 'dementia_constipation', 'functional_constipation', 'dehydration_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'stroke_constipation', featureIds: ['neurological', 'nausea_vomiting'] }], neverCloseConditions: [] },
  complications: [{ name: 'Raised intracranial pressure', warningFeatures: ['neurological', 'nausea_vomiting', 'papilloedema'], riskFactors: ['mass_effect'], timeWindowHours: [24, 168], severityTier: 'critical', description: 'Progressive tumour growth may cause life-threatening raised ICP.' }],
  clinicalScores: [], redFlagFeatureIds: ['neurological', 'nausea_vomiting'],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['neurological', 'neurological'], mechanism: 'functional', typicalDescription: 'Constipation in a patient with known brain tumour, exacerbated by poor intake, vomiting, and medications.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: SPINAL (4 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const spinal_cord_injury_constipation: DiseaseNode = {
  id: 'spinal_cord_injury_constipation', name: 'Spinal Cord Injury Constipation', icdCode: 'G82.2', system: 'medical',
  organSystem: 'neurological', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 80, agePeak: [20, 50], sexRisk: { male: 3, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Spinal cord injury disrupts the descending pathways that coordinate colonic motility and defecation. Lesions above the sacral centre (S2-S4) cause loss of voluntary control but intact reflex defecation. Lesions at the cauda equina destroy the sacral reflex arc, causing a flaccid, areflexic bowel.', timelineStages: [{ stageId: 1, label: 'Neurogenic bowel', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.85, 0.5), sym('spinal_cord_injury', 0.95, 0.9)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'None / absent sensation', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Chronic. Bowel program is required for long-term management.' },
  features: { symptoms: [sym('constipation', 0.85, 0.5, { stageRelevance: [1] }), sym('spinal_cord_injury', 0.95, 0.9, { stageRelevance: [1] }), sym('none', 0.4, 0.85, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.4, 0.75, { stageRelevance: [1] }), sym('neurological', 0.3, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['cauda_equina_constipation', 'spina_bifida_constipation', 'multiple_sclerosis_constipation', 'functional_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'cauda_equina_constipation', featureIds: ['neurological'] }], neverCloseConditions: [] },
  complications: [{ name: 'Autonomic dysreflexia', warningFeatures: ['constipation_abdominal_distension', 'neurological', 'hypertension'], riskFactors: ['lesion_above_T6'], timeWindowHours: [0, 24], severityTier: 'severe', description: 'Faecal impaction is the most common trigger of autonomic dysreflexia in SCI patients with lesions above T6, causing dangerous hypertension.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'yes', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'neurological'], mechanism: 'mixed', typicalDescription: 'Constipation following spinal cord injury requiring a structured bowel program including digital stimulation and manual evacuation.' },
};

export const cauda_equina_constipation: DiseaseNode = {
  id: 'cauda_equina_constipation', name: 'Cauda Equina Syndrome with Constipation', icdCode: 'G83.4', system: 'medical',
  organSystem: 'neurological', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Cauda equina syndrome (CES) results from compression of the lumbosacral nerve roots, causing a flaccid, areflexic bowel. Patients lose the ability to sense rectal distension and cannot initiate defecation. This leads to severe constipation with overflow incontinence. Surgical emergency to prevent permanent neurological damage.', timelineStages: [{ stageId: 1, label: 'CES', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('neurological', 0.9, 0.95)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe low back pain / radicular', painLocationTypical: 'Lower back / legs', painRadiationTypical: 'Legs' }], progressionRule: 'Rapid progression over hours to days. Requires emergency surgical decompression.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('neurological', 0.9, 0.95, { stageRelevance: [1] }), sym('neurological', 0.8, 0.8, { stageRelevance: [1] }), sym('low_back_pain', 0.8, 0.65, { stageRelevance: [1] }), sym('neurological', 0.7, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['spinal_cord_injury_constipation', 'spina_bifida_constipation', 'spinal_tumor_constipation', 'pelvic_malignancy_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'spinal_cord_injury_constipation', featureIds: ['neurological', 'neurological'] }], neverCloseConditions: [] },
  complications: [{ name: 'Permanent neurological deficit', warningFeatures: ['neurological', 'neurological', 'none'], riskFactors: ['delayed_surgery'], timeWindowHours: [24, 72], severityTier: 'critical', description: 'CES requires decompression within 48 hours for best neurological recovery.' }],
  clinicalScores: [], redFlagFeatureIds: ['neurological', 'neurological'],
  constipationManifestation: { duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['neurological', 'neurological', 'neurological'], mechanism: 'outlet_obstruction', typicalDescription: 'Acute or subacute onset of constipation in a patient with low back pain, saddle anaesthesia, and urinary retention. This is a surgical emergency.' },
};

export const spina_bifida_constipation: DiseaseNode = {
  id: 'spina_bifida_constipation', name: 'Spina Bifida / Myelomeningocoele', icdCode: 'Q05.9', system: 'paediatric',
  organSystem: 'neurological', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 0, ageMax: 60, agePeak: [0, 20], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Spina bifida with myelomeningocoele causes congenital damage to the sacral spinal cord and nerve roots, resulting in neurogenic bowel dysfunction. The external anal sphincter is denervated, the internal sphincter is spastic, and colonic motility is impaired. Most patients require a bowel management program with antegrade continence enema (ACE) or enema protocols.', timelineStages: [{ stageId: 1, label: 'Spina bifida bowel', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.8, 0.5), sym('none', 0.5, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'None', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Lifelong. Managed with bowel programs.' },
  features: { symptoms: [sym('constipation', 0.8, 0.5, { stageRelevance: [1] }), sym('none', 0.5, 0.85, { stageRelevance: [1] }), sym('spina_bifida', 0.95, 0.5, { stageRelevance: [1] }), sym('neurological', 0.6, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.3, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation_child', 'spinal_cord_injury_constipation', 'hirschsprung_disease', 'anorectal_malformation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation_child', featureIds: ['spina_bifida', 'neurological'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_abdominal_distension', 'constipation_overflow'], riskFactors: ['neurogenic_bowel'], timeWindowHours: [336, 2160], severityTier: 'mild', description: 'Impaired sensation and motility predispose to faecal impaction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'yes', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'neurological'], mechanism: 'mixed', typicalDescription: 'Lifelong constipation in a patient with spina bifida due to congenital neurogenic bowel. Bowel programs often include daily enemas or ACE procedure.' },
};

export const spinal_tumor_constipation: DiseaseNode = {
  id: 'spinal_tumor_constipation', name: 'Spinal Cord / Cauda Equina Tumour', icdCode: 'C72.0', system: 'medical',
  organSystem: 'neurological', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Intramedullary (ependymoma, astrocytoma) or extramedullary (meningioma, schwannoma) spinal tumours compress the spinal cord or cauda equina, causing progressive neurological deficits including constipation. Extramedullary tumours often present with radicular pain and long tract signs.', timelineStages: [{ stageId: 1, label: 'Spinal tumour', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('neurological', 0.85, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Radicular / back pain worse at night', painLocationTypical: 'Back / legs', painRadiationTypical: 'Legs' }], progressionRule: 'Slowly progressive. May cause CES acutely if rapid growth or haemorrhage.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('neurological', 0.85, 0.7, { stageRelevance: [1] }), sym('neurological', 0.7, 0.75, { stageRelevance: [1] }), sym('sensory_level', 0.6, 0.85, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.3, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['cauda_equina_constipation', 'spinal_cord_injury_constipation', 'multiple_sclerosis_constipation', 'pelvic_malignancy_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'cauda_equina_constipation', featureIds: ['neurological', 'sensory_level'] }], neverCloseConditions: [] },
  complications: [{ name: 'Spinal cord compression / CES', warningFeatures: ['neurological', 'sensory_level', 'neurological', 'neurological'], riskFactors: ['tumour_growth'], timeWindowHours: [168, 720], severityTier: 'critical', description: 'Progressive spinal cord compression leads to irreversible paraplegia and loss of bowel/bladder control.' }],
  clinicalScores: [], redFlagFeatureIds: ['neurological', 'sensory_level'],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['neurological', 'neurological', 'neurological'], mechanism: 'outlet_obstruction', typicalDescription: 'Progressive constipation in a patient with back pain, leg weakness, and sensory loss suggesting spinal cord or cauda equina compression.' },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: ENTERIC NERVOUS SYSTEM (2 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const hirschsprung_disease: DiseaseNode = {
  id: 'hirschsprung_disease', name: 'Hirschsprung Disease (Congenital Aganglionic Megacolon)', icdCode: 'Q43.1', system: 'paediatric',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 0, ageMax: 18, agePeak: [0, 1], sexRisk: { male: 4, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Hirschsprung disease is a congenital disorder characterised by absence of ganglionic cells in the distal colon due to failure of neural crest cell migration. The aganglionic segment is spastic and non-relaxing, causing functional obstruction. This presents as failure to pass meconium within 48 hours in newborns, with progressive constipation.', timelineStages: [{ stageId: 1, label: 'Neonatal', typicalHoursFromOnset: [0, 720], dominantSymptoms: [sym('constipation', 0.95, 0.5), sym('constipation_abdominal_distension', 0.7, 0.75)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Distension', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Requires surgical resection of the aganglionic segment. Toxic megacolon is a life-threatening complication.' },
  features: { symptoms: [sym('constipation', 0.95, 0.5, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.7, 0.75, { stageRelevance: [1] }), sym('constipation_vomiting', 0.5, 0.85, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.85, { stageRelevance: [1] }), sym('constipation_overflow', 0.2, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation_child', 'meconium_ileus', 'anal_stenosis', 'spina_bifida_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation_child', featureIds: ['weight_loss', 'constipation_overflow'] }], neverCloseConditions: ['functional_constipation_child'] },
  complications: [{ name: 'Toxic megacolon / enterocolitis', warningFeatures: ['constipation_abdominal_distension', 'fever_chills'], riskFactors: ['delayed_diagnosis'], timeWindowHours: [72, 720], severityTier: 'critical', description: 'Hirschsprung-associated enterocolitis is a life-threatening complication with high mortality.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'constipation_abdominal_distension'],
  constipationManifestation: { duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['weight_loss', 'abdominal_distension'], mechanism: 'mechanical_obstruction', typicalDescription: 'Failure to pass meconium in the newborn period, chronic severe constipation, abdominal distension, and poor weight gain.' },
};

export const chagas_constipation: DiseaseNode = {
  id: 'chagas_constipation', name: 'Chagas Disease (Trypanosoma cruzi) Mega-colon', icdCode: 'B57.3', system: 'infectious',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'Chagas disease is caused by Trypanosoma cruzi infection, transmitted by reduviid bugs (kissing bugs). Chronic infection leads to destruction of the enteric nervous system (myenteric plexus), resulting in denervation and loss of peristalsis. The colon becomes dilated (megacolon), severely constipated, and prone to volvulus.', timelineStages: [{ stageId: 1, label: 'Chagas megacolon', typicalHoursFromOnset: [720, 8760], dominantSymptoms: [sym('constipation', 0.85, 0.5), sym('constipation_abdominal_distension', 0.7, 0.75)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Diffuse distension', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Progresses over years to decades. Megacolon may become complicated by volvulus.' },
  features: { symptoms: [sym('constipation', 0.85, 0.5, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.7, 0.75, { stageRelevance: [1] }), sym('chagas_endemic_area', 0.9, 0.8, { stageRelevance: [1] }), sym('constipation_bloating', 0.6, 0.7, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['chronic_intestinal_pseudo_obstruction', 'functional_constipation', 'systemic_sclerosis_constipation', 'amyloidosis_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'chronic_intestinal_pseudo_obstruction', featureIds: ['chagas_endemic_area'] }], neverCloseConditions: [] },
  complications: [{ name: 'Sigmoid volvulus', warningFeatures: ['constipation_abdominal_distension', 'constipation_obstipation', 'constipation_abdominal_pain'], riskFactors: ['megacolon'], timeWindowHours: [168, 2160], severityTier: 'severe', description: 'Chagas megacolon predisposes to sigmoid volvulus, a surgical emergency.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_abdominal_distension'],
  constipationManifestation: { duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['abdominal_distension', 'vomiting'], mechanism: 'mixed', typicalDescription: 'Chronic, progressive constipation in a patient with history of Chagas disease or endemic exposure. Severe abdominal distension with megacolon visible on imaging.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: ENDOCRINE (5 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const hypothyroidism_constipation: DiseaseNode = {
  id: 'hypothyroidism_constipation', name: 'Hypothyroidism Constipation', icdCode: 'E03.9', system: 'medical',
  organSystem: 'endocrine', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 10, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 0.3, female: 3 }, backgroundPrevalence: 0.015, riskFactors: [] },
  pathophysiology: { mechanism: 'Hypothyroidism reduces metabolic rate and slows gastrointestinal motility through decreased thyroid hormone levels. Myxoedema can infiltrate the bowel wall. Constipation is one of the most common GI symptoms and may be the presenting complaint.', timelineStages: [{ stageId: 1, label: 'Hypothyroid constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('none', 0.85, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Improves with thyroid hormone replacement therapy.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('none', 0.85, 0.8, { stageRelevance: [1] }), sym('constipation_endocrine', 0.7, 0.75, { stageRelevance: [1] }), sym('dry_skin', 0.6, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'ibs_constipation', 'diabetic_constipation', 'dehydration_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation', featureIds: ['none', 'endocrine', 'endocrine'] }], neverCloseConditions: [] },
  complications: [{ name: 'Myxoedema coma', warningFeatures: ['none', 'endocrine', 'altered_mental_status'], riskFactors: ['severe_hypothyroidism'], timeWindowHours: [2160, 21600], severityTier: 'critical', description: 'Severe, untreated hypothyroidism may rarely progress to myxoedema coma.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'endocrine', 'endocrine'], mechanism: 'slow_transit', typicalDescription: 'Chronic constipation with fatigue, weight gain, and cold intolerance suggesting an underactive thyroid.' },
};

export const diabetic_constipation: DiseaseNode = {
  id: 'diabetic_constipation', name: 'Diabetic Autonomic Neuropathy Constipation', icdCode: 'E11.4', system: 'medical',
  organSystem: 'endocrine', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 85, agePeak: [40, 70], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic hyperglycaemia damages the autonomic nerves supplying the GI tract (autonomic neuropathy). This reduces colonic motility and impairs the gastrocolic reflex. Associated with other diabetic complications including retinopathy, nephropathy, and peripheral neuropathy.', timelineStages: [{ stageId: 1, label: 'Diabetic constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('diabetes_duration', 0.8, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Usually develops 5-10 years after diagnosis. May improve with strict glycaemic control.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('diabetes_duration', 0.8, 0.7, { stageRelevance: [1] }), sym('neurological', 0.6, 0.85, { stageRelevance: [1] }), sym('neurological', 0.5, 0.8, { stageRelevance: [1] }), sym('postural_hypotension', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'ibs_constipation', 'hypothyroidism_constipation', 'uremia_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'hypothyroidism_constipation', featureIds: ['diabetes_duration', 'neurological', 'neurological'] }], neverCloseConditions: [] },
  complications: [{ name: 'Diabetic gastroparesis', warningFeatures: ['nausea_vomiting', 'constipation_bloating'], riskFactors: ['longstanding_diabetes'], timeWindowHours: [2160, 21600], severityTier: 'moderate', description: 'Autonomic neuropathy also affects gastric emptying, causing gastroparesis that compounds constipation symptoms.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['neurological', 'neurological'], mechanism: 'slow_transit', typicalDescription: 'Constipation in a patient with longstanding diabetes and other microvascular complications. Autonomic neuropathy causes delayed colonic transit.' },
};

export const hyperparathyroid_constipation: DiseaseNode = {
  id: 'hyperparathyroid_constipation', name: 'Hyperparathyroidism Constipation', icdCode: 'E21.0', system: 'medical',
  organSystem: 'endocrine', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 80, agePeak: [50, 70], sexRisk: { male: 0.3, female: 3 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Hyperparathyroidism causes hypercalcaemia, which reduces smooth muscle contractility in the GI tract and slows colonic transit. Hypercalcaemia also affects the autonomic nervous system. Patients present with constipation, abdominal pain, nausea, and fatigue.', timelineStages: [{ stageId: 1, label: 'HyperPTH constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.4, 0.5), sym('none', 0.7, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Vague abdominal ache', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Improves with correction of hypercalcaemia.' },
  features: { symptoms: [sym('constipation', 0.4, 0.5, { stageRelevance: [1] }), sym('none', 0.7, 0.8, { stageRelevance: [1] }), sym('nephrolithiasis', 0.5, 0.85, { stageRelevance: [1] }), sym('none', 0.4, 0.75, { stageRelevance: [1] }), sym('constipation_endocrine', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hypercalcemia_constipation', 'hypothyroidism_constipation', 'functional_constipation', 'dehydration_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'hypercalcemia_constipation', featureIds: ['nephrolithiasis', 'none'] }], neverCloseConditions: [] },
  complications: [{ name: 'Hypercalcaemic crisis', warningFeatures: ['constipation', 'nausea_vomiting', 'altered_mental_status', 'dehydration'], riskFactors: ['severe_hypercalcaemia'], timeWindowHours: [168, 720], severityTier: 'severe', description: 'Severe, acute hypercalcaemia causes altered mental status, dehydration, and cardiac arrhythmias.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['none', 'none', 'none'], mechanism: 'slow_transit', typicalDescription: 'Constipation with fatigue, kidney stones, and bone pain suggesting hyperparathyroidism.' },
};

export const pregnancy_constipation: DiseaseNode = {
  id: 'pregnancy_constipation', name: 'Pregnancy-Related Constipation', icdCode: 'O26.8', system: 'obstetric',
  organSystem: 'endocrine', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 45, agePeak: [20, 35], sexRisk: { male: 0, female: 1 }, backgroundPrevalence: 0.2, riskFactors: [] },
  pathophysiology: { mechanism: 'Constipation in pregnancy is multifactorial: (1) elevated progesterone slows colonic transit, (2) mechanical compression by the gravid uterus in later trimesters, (3) iron supplements used for anaemia, (4) reduced physical activity.', timelineStages: [{ stageId: 1, label: 'Pregnancy', typicalHoursFromOnset: [0, 6720], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('pregnancy_status', 0.95, 0.5)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Diffuse abdomen', painRadiationTypical: 'None' }], progressionRule: 'Commonly starts in first trimester and worsens during third. Resolves postpartum.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('pregnancy_status', 0.95, 0.5, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.5, 0.75, { stageRelevance: [1] }), sym('heartburn', 0.5, 0.7, { stageRelevance: [1] }), sym('morning_sickness', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'ibs_constipation', 'ovarian_mass_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'ovarian_mass_constipation', featureIds: ['pregnancy_status'] }], neverCloseConditions: [] },
  complications: [{ name: 'Fecal impaction', warningFeatures: ['constipation_overflow'], riskFactors: ['iron_supplements', 'dehydration'], timeWindowHours: [336, 2160], severityTier: 'mild', description: 'Severe constipation in pregnancy may lead to faecal impaction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'mixed', typicalDescription: 'Constipation during pregnancy due to hormonal changes, uterine compression, and iron supplements.' },
};

export const hypopituitarism_constipation: DiseaseNode = {
  id: 'hypopituitarism_constipation', name: 'Hypopituitarism Constipation', icdCode: 'E23.0', system: 'medical',
  organSystem: 'endocrine', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Hypopituitarism results in deficiency of multiple pituitary hormones (TSH, ACTH, LH/FSH, GH). Constipation arises from secondary hypothyroidism (decreased TSH) and secondary adrenal insufficiency (decreased cortisol causing poor appetite, dehydration, and electrolyte disturbances).', timelineStages: [{ stageId: 1, label: 'Hypopituitary constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.4, 0.5), sym('none', 0.8, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Improves with hormone replacement therapy.' },
  features: { symptoms: [sym('constipation', 0.4, 0.5, { stageRelevance: [1] }), sym('none', 0.8, 0.8, { stageRelevance: [1] }), sym('constipation_endocrine', 0.5, 0.8, { stageRelevance: [1] }), sym('loss_of_body_hair', 0.5, 0.85, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.4, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hypothyroidism_constipation', 'functional_constipation', 'anorexia_nervosa_constipation', 'adrenal_insufficiency'], distinguishingFeatures: [{ fromDiseaseId: 'hypothyroidism_constipation', featureIds: ['loss_of_body_hair'] }], neverCloseConditions: [] },
  complications: [{ name: 'Adrenal crisis', warningFeatures: ['constipation_weight_loss', 'none', 'hypotension', 'altered_mental_status'], riskFactors: ['stress', 'infection'], timeWindowHours: [24, 168], severityTier: 'critical', description: 'Secondary adrenal insufficiency may lead to adrenal crisis under physiological stress.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss'],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['none', 'endocrine', 'endocrine'], mechanism: 'slow_transit', typicalDescription: 'Constipation due to secondary hypothyroidism and adrenal insufficiency from panhypopituitarism.' },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: METABOLIC (5 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const hypercalcemia_constipation: DiseaseNode = {
  id: 'hypercalcemia_constipation', name: 'Hypercalcaemia Constipation', icdCode: 'E83.5', system: 'medical',
  organSystem: 'endocrine', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 85, agePeak: [50, 75], sexRisk: { male: 1, female: 2 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Hypercalcaemia reduces smooth muscle contractility in the GI tract, leading to delayed colonic transit and constipation. It also impairs neuronal function. Common causes include primary hyperparathyroidism, malignancy (bone metastases, PTHrP), and excessive vitamin D/calcium intake.', timelineStages: [{ stageId: 1, label: 'Hypercalcaemia', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('constipation_endocrine', 0.6, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Vague', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Improves with correction of serum calcium levels.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('constipation_endocrine', 0.6, 0.7, { stageRelevance: [1] }), sym('none', 0.6, 0.8, { stageRelevance: [1] }), sym('nausea_vomiting', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hyperparathyroid_constipation', 'dehydration_constipation', 'hypothyroidism_constipation', 'uremia_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'hyperparathyroid_constipation', featureIds: ['nephrolithiasis', 'none'] }], neverCloseConditions: [] },
  complications: [{ name: 'Hypercalcaemic crisis', warningFeatures: ['constipation', 'nausea_vomiting', 'altered_mental_status'], riskFactors: ['severe_hypercalcaemia'], timeWindowHours: [168, 720], severityTier: 'severe', description: 'Severe hypercalcaemia (>3.5 mmol/L) causes altered mental status, dehydration, and cardiac arrhythmias.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['endocrine', 'endocrine'], mechanism: 'slow_transit', typicalDescription: 'Constipation associated with elevated serum calcium. Often accompanied by polyuria, polydipsia, and fatigue.' },
};

export const hypokalemia_constipation: DiseaseNode = {
  id: 'hypokalemia_constipation', name: 'Hypokalaemia Constipation', icdCode: 'E87.6', system: 'medical',
  organSystem: 'endocrine', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 10, ageMax: 80, agePeak: [30, 65], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Hypokalaemia impairs smooth muscle contractility in the colon by altering membrane potential and reducing calcium influx. This leads to decreased peristalsis and prolonged colonic transit. Hypokalaemia may be caused by diuretics, diarrhoea, vomiting, laxative abuse, or hyperaldosteronism.', timelineStages: [{ stageId: 1, label: 'Hypokalaemia', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('neurological', 0.6, 0.75)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Reversible with potassium repletion.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('neurological', 0.6, 0.75, { stageRelevance: [1] }), sym('none', 0.5, 0.8, { stageRelevance: [1] }), sym('palpitations', 0.3, 0.75, { stageRelevance: [1] }), sym('diuretic_use', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hypercalcemia_constipation', 'hypothyroidism_constipation', 'uremia_constipation', 'dehydration_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'hypercalcemia_constipation', featureIds: ['neurological', 'diuretic_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Cardiac arrhythmia', warningFeatures: ['palpitations', 'ecg_changes'], riskFactors: ['severe_hypokalaemia'], timeWindowHours: [24, 168], severityTier: 'severe', description: 'Severe hypokalaemia causes ECG changes (U waves, prolonged QT) and predisposes to ventricular arrhythmias.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'acute', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['neurological', 'none'], mechanism: 'slow_transit', typicalDescription: 'Constipation in the setting of low potassium, often from diuretic use or diarrhoea. Muscle weakness and fatigue are associated.' },
};

export const uremia_constipation: DiseaseNode = {
  id: 'uremia_constipation', name: 'Uraemic Constipation', icdCode: 'N18.9', system: 'medical',
  organSystem: 'renal', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 75], sexRisk: { male: 1.3, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic kidney disease (CKD) causes constipation through (1) uraemic toxins impairing smooth muscle and neuronal function, (2) fluid restriction and electrolyte abnormalities, (3) phosphate binders (calcium, aluminium), (4) iron supplements, (5) dialysis-related fluid shifts, and (6) comorbid diabetes.', timelineStages: [{ stageId: 1, label: 'Uraemic constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('none', 0.7, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Variable', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic. May worsen as CKD progresses.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('none', 0.7, 0.8, { stageRelevance: [1] }), sym('none', 0.5, 0.75, { stageRelevance: [1] }), sym('peripheral_oedema', 0.6, 0.75, { stageRelevance: [1] }), sym('nausea_vomiting', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hypercalcemia_constipation', 'hypothyroidism_constipation', 'diabetic_constipation', 'dehydration_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'hypercalcemia_constipation', featureIds: ['none', 'peripheral_oedema'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_overflow', 'constipation_abdominal_distension'], riskFactors: ['phosphate_binders', 'fluid_restriction'], timeWindowHours: [336, 2160], severityTier: 'moderate', description: 'CKD patients on phosphate binders and fluid restriction are at high risk for impaction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'none', 'endocrine'], mechanism: 'mixed', typicalDescription: 'Constipation in chronic kidney disease, exacerbated by phosphate binders, iron supplements, and fluid restrictions.' },
};

export const porphyria_constipation: DiseaseNode = {
  id: 'porphyria_constipation', name: 'Acute Intermittent Porphyria Constipation', icdCode: 'E80.2', system: 'medical',
  organSystem: 'endocrine', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 50, agePeak: [20, 40], sexRisk: { male: 0.3, female: 3 }, backgroundPrevalence: 0.00005, riskFactors: [] },
  pathophysiology: { mechanism: 'Acute intermittent porphyria causes attacks of severe abdominal pain and neurovisceral symptoms. Constipation is prominent during attacks due to autonomic dysfunction and reduced bowel motility from porphyrin accumulation. Attacks are triggered by medications (barbiturates, sulfonamides, oestrogens), alcohol, or fasting.', timelineStages: [{ stageId: 1, label: 'Acute attack', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('constipation_abdominal_pain', 0.9, 0.65)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Severe, poorly localised', painLocationTypical: 'Diffuse abdomen', painRadiationTypical: 'Back / legs' }], progressionRule: 'Episodic attacks lasting days to weeks. Constipation resolves between attacks.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.9, 0.65, { stageRelevance: [1] }), sym('neurological', 0.6, 0.8, { stageRelevance: [1] }), sym('tachycardia', 0.7, 0.7, { stageRelevance: [1] }), sym('none', 0.5, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ibs_constipation', 'surgical_abdomen', 'lead_poisoning_constipation', 'sigmoid_volvulus'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_constipation', featureIds: ['none', 'tachycardia', 'neurological'] }], neverCloseConditions: [] },
  complications: [{ name: 'Acute porphyric crisis', warningFeatures: ['constipation_abdominal_pain', 'neurological', 'tachycardia', 'hypertension'], riskFactors: ['trigger_drugs', 'fasting'], timeWindowHours: [24, 168], severityTier: 'severe', description: 'Severe porphyric attack may cause respiratory paralysis, seizures, and coma.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_abdominal_pain', 'neurological'],
  constipationManifestation: { duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'variable', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['abdominal_distension', 'none', 'neurological'], mechanism: 'slow_transit', typicalDescription: 'Acute constipation with severe abdominal pain, psychiatric disturbance, and dark urine during a porphyric attack.' },
};

export const hypermagnesemia_constipation: DiseaseNode = {
  id: 'hypermagnesemia_constipation', name: 'Hypermagnesaemia Constipation', icdCode: 'E83.4', system: 'medical',
  organSystem: 'endocrine', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 85, agePeak: [50, 75], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Hypermagnesaemia reduces smooth muscle contractility and impairs neuromuscular transmission. It slows colonic transit and can exacerbate constipation. Most commonly seen in CKD (reduced magnesium excretion), excessive magnesium-containing antacid use, or magnesium supplementation.', timelineStages: [{ stageId: 1, label: 'Hypermagnesemia', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('none', 0.5, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'None', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Reversible with magnesium restriction or dialysis.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('none', 0.5, 0.8, { stageRelevance: [1] }), sym('constipation_bloating', 0.4, 0.7, { stageRelevance: [1] }), sym('nausea_vomiting', 0.3, 0.7, { stageRelevance: [1] }), sym('neurological', 0.3, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hypercalcemia_constipation', 'hypokalemia_constipation', 'uremia_constipation', 'functional_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'hypercalcemia_constipation', featureIds: ['neurological'] }], neverCloseConditions: [] },
  complications: [{ name: 'Cardiac arrest', warningFeatures: ['neurological', 'hypotension', 'bradycardia', 'ecg_changes'], riskFactors: ['severe_hypermagnesaemia'], timeWindowHours: [24, 168], severityTier: 'critical', description: 'Severe hypermagnesaemia (>3 mmol/L) causes hypotension, bradycardia, and cardiac arrest.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'slow_transit', typicalDescription: 'Constipation due to high serum magnesium, often from antacid use or CKD.' },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: DRUG-INDUCED (8 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const opioid_constipation: DiseaseNode = {
  id: 'opioid_constipation', name: 'Opioid-Induced Constipation', icdCode: 'F11.2', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 90, agePeak: [30, 70], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.1, riskFactors: [] },
  pathophysiology: { mechanism: 'Opioids bind to mu-receptors in the enteric nervous system, reducing peristalsis, increasing non-propulsive contractions, and inhibiting water and electrolyte secretion. Sphincter of Oddi spasm and increased anal sphincter tone further impair defecation. Tolerance to constipation does not develop.', timelineStages: [{ stageId: 1, label: 'OIC', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('constipation', 0.9, 0.5), sym('constipation_straining', 0.7, 0.65)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Cramping', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Persists as long as opioids are used. Does not resolve with tolerance. Requires bowel regimen.' },
  features: { symptoms: [sym('constipation', 0.9, 0.5, { stageRelevance: [1] }), sym('constipation_straining', 0.7, 0.65, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.8, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.5, 0.65, { stageRelevance: [1] }), sym('none', 0.95, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'ibs_constipation', 'slow_transit_constipation', 'tca_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation', featureIds: ['none'] }], neverCloseConditions: [] },
  complications: [{ name: 'Opioid bowel dysfunction / ileus', warningFeatures: ['constipation_abdominal_distension', 'constipation_vomiting', 'constipation_obstipation'], riskFactors: ['high_dose_opioids', 'postoperative'], timeWindowHours: [24, 168], severityTier: 'moderate', description: 'Opioid-induced ileus may cause profound gut stasis, distension, nausea, and vomiting.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'slow_transit', typicalDescription: 'Constipation developing or worsening after starting opioid therapy. Hard, dry stools with straining and incomplete evacuation.' },
};

export const anticholinergic_constipation: DiseaseNode = {
  id: 'anticholinergic_constipation', name: 'Anticholinergic-Induced Constipation', icdCode: 'Y46.9', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 90, agePeak: [50, 80], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'Anticholinergic drugs block muscarinic acetylcholine receptors in the GI tract, reducing smooth muscle contraction and slowing peristalsis. Common agents include oxybutynin, tolterodine, benztropine, and tricyclic antidepressants (TCAs) with strong anticholinergic activity. Elderly patients are most vulnerable.', timelineStages: [{ stageId: 1, label: 'Anticholinergic constipation', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('anticholinergic_drug_use', 0.9, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Gradual improvement after drug discontinuation. May require weeks to fully resolve.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('anticholinergic_drug_use', 0.9, 0.8, { stageRelevance: [1] }), sym('none', 0.7, 0.75, { stageRelevance: [1] }), sym('neurological', 0.4, 0.7, { stageRelevance: [1] }), sym('neurological', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['opioid_constipation', 'tca_constipation', 'functional_constipation', 'dehydration_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'opioid_constipation', featureIds: ['none', 'anticholinergic_drug_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_abdominal_distension', 'constipation_overflow'], riskFactors: ['elderly', 'none'], timeWindowHours: [336, 2160], severityTier: 'moderate', description: 'Anticholinergic burden in elderly patients frequently leads to severe constipation and impaction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'neurological'], mechanism: 'slow_transit', typicalDescription: 'Constipation starting after initiation of anticholinergic medication for overactive bladder, Parkinson disease, or other indications.' },
};

export const tca_constipation: DiseaseNode = {
  id: 'tca_constipation', name: 'Tricyclic Antidepressant-Induced Constipation', icdCode: 'Y49.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 18, ageMax: 80, agePeak: [30, 60], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'Tricyclic antidepressants (amitriptyline, nortriptyline, clomipramine, imipramine) have potent anticholinergic properties that slow colonic transit. Their antihistaminergic and anti-serotonergic effects also contribute. TCAs are often prescribed for depression, neuropathic pain, and functional bowel disorders, sometimes specifically for their constipating effect in diarrhoea-predominant IBS.', timelineStages: [{ stageId: 1, label: 'TCA constipation', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('tca_use', 0.9, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Dose-dependent. Onset within days to weeks of starting therapy.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('tca_use', 0.9, 0.85, { stageRelevance: [1] }), sym('none', 0.6, 0.75, { stageRelevance: [1] }), sym('sedation', 0.5, 0.7, { stageRelevance: [1] }), sym('constipation_bloating', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['opioid_constipation', 'anticholinergic_constipation', 'antipsychotic_constipation', 'functional_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'opioid_constipation', featureIds: ['tca_use', 'none'] }], neverCloseConditions: [] },
  complications: [{ name: 'Severe constipation with impaction', warningFeatures: ['constipation_abdominal_distension', 'constipation_obstipation'], riskFactors: ['high_dose_tca', 'elderly'], timeWindowHours: [336, 2160], severityTier: 'moderate', description: 'High doses of TCAs, especially in elderly patients, can cause severe constipation leading to impaction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'slow_transit', typicalDescription: 'Constipation developing after starting a tricyclic antidepressant. Dry mouth and sedation are common accompanying side effects.' },
};

export const antipsychotic_constipation: DiseaseNode = {
  id: 'antipsychotic_constipation', name: 'Antipsychotic-Induced Constipation', icdCode: 'Y49.9', system: 'psychiatric',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 80, agePeak: [25, 55], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'Antipsychotics cause constipation through (1) anticholinergic effects (especially low-potency agents like chlorpromazine, clozapine, olanzapine), (2) anti-serotonergic (5-HT2) effects reducing colonic motility, (3) sedation reducing physical activity and oral intake. Clozapine causes the highest rate of severe constipation.', timelineStages: [{ stageId: 1, label: 'Antipsychotic constipation', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('antipsychotic_use', 0.9, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Dose-related. Some tolerance may develop but often persists with treatment.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('antipsychotic_use', 0.9, 0.8, { stageRelevance: [1] }), sym('sedation', 0.5, 0.7, { stageRelevance: [1] }), sym('none', 0.5, 0.75, { stageRelevance: [1] }), sym('constipation_bloating', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['tca_constipation', 'anticholinergic_constipation', 'opioid_constipation', 'functional_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'tca_constipation', featureIds: ['antipsychotic_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Ileus / intestinal obstruction', warningFeatures: ['constipation_obstipation', 'constipation_abdominal_distension'], riskFactors: ['clozapine', 'high_dose', 'none'], timeWindowHours: [168, 720], severityTier: 'critical', description: 'Clozapine-induced severe constipation can progress to life-threatening ileus or obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_obstipation'],
  constipationManifestation: { duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'slow_transit', typicalDescription: 'Constipation in a patient taking antipsychotic medication. Clozapine carries the highest risk of severe, even life-threatening constipation.' },
};

export const ccb_constipation: DiseaseNode = {
  id: 'ccb_constipation', name: 'Calcium Channel Blocker-Induced Constipation', icdCode: 'Y52.1', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 90, agePeak: [50, 75], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'CCBs (especially verapamil) block L-type calcium channels in enteric smooth muscle cells, reducing contractile strength and slowing colonic transit. Verapamil has the strongest constipating effect, followed by diltiazem. Dihydropyridines (amlodipine, nifedipine) cause less constipation.', timelineStages: [{ stageId: 1, label: 'CCB constipation', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('ccb_use', 0.9, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Dose-dependent. May improve with switching to dihydropyridine CCB.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('ccb_use', 0.9, 0.85, { stageRelevance: [1] }), sym('constipation_bloating', 0.4, 0.7, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.5, 0.7, { stageRelevance: [1] }), sym('peripheral_oedema', 0.4, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['opioid_constipation', 'anticholinergic_constipation', 'tca_constipation', 'functional_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'opioid_constipation', featureIds: ['ccb_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_abdominal_distension', 'constipation_overflow'], riskFactors: ['verapamil_use', 'elderly'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Verapamil is the most constipating CCB and may cause severe impaction in elderly patients.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'slow_transit', typicalDescription: 'Constipation starting after initiation of a calcium channel blocker, especially verapamil. Bloating and hard stools are typical.' },
};

export const iron_constipation: DiseaseNode = {
  id: 'iron_constipation', name: 'Iron Supplement-Induced Constipation', icdCode: 'Y44.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 90, agePeak: [20, 50], sexRisk: { male: 1, female: 3 }, backgroundPrevalence: 0.03, riskFactors: [] },
  pathophysiology: { mechanism: 'Oral iron supplements cause constipation through (1) iron-induced bowel wall irritation, (2) slowing of colonic transit, (3) unabsorbed iron binding with stool making it harder, and (4) constipating effect is greater with ferrous sulphate than ferrous gluconate or fumarate. Often leads to poor compliance with supplementation.', timelineStages: [{ stageId: 1, label: 'Iron constipation', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('iron_supplement_use', 0.9, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Cramping', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Onset within days of starting iron. Persists with continued use.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('iron_supplement_use', 0.9, 0.85, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.6, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.4, 0.65, { stageRelevance: [1] }), sym('vomiting', 0.4, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['opioid_constipation', 'pregnancy_constipation', 'functional_constipation', 'ccb_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'pregnancy_constipation', featureIds: ['iron_supplement_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Iron deficiency anaemia treatment failure', warningFeatures: ['constipation'], riskFactors: ['poor_compliance'], timeWindowHours: [720, 4320], severityTier: 'mild', description: 'Constipation from iron supplements leads to poor compliance and inadequate treatment of anaemia.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'acute', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'no', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'mixed', typicalDescription: 'Constipation developing after starting iron supplements, often with abdominal cramping and hard, dark-coloured stools.' },
};

export const aluminum_antacid_constipation: DiseaseNode = {
  id: 'aluminum_antacid_constipation', name: 'Aluminum Antacid-Induced Constipation', icdCode: 'Y46.9', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 85, agePeak: [40, 70], sexRisk: { male: 1, female: 1.2 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Aluminum-containing antacids (aluminium hydroxide) bind phosphate in the gut, forming insoluble aluminium phosphate complexes that harden stools. They also slow colonic transit through direct effects on smooth muscle. Common in CKD patients using aluminium-based phosphate binders.', timelineStages: [{ stageId: 1, label: 'Aluminum antacid', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('aluminum_antacid_use', 0.9, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'None', painLocationTypical: 'None', painRadiationTypical: 'None' }], progressionRule: 'Persists with continued use. May improve with calcium-based antacids.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('aluminum_antacid_use', 0.9, 0.85, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.6, 0.7, { stageRelevance: [1] }), sym('constipation_bloating', 0.4, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.3, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['iron_constipation', 'ccb_constipation', 'opioid_constipation', 'uremia_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'iron_constipation', featureIds: ['aluminum_antacid_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Hypophosphataemia', warningFeatures: ['none', 'neurological'], riskFactors: ['high_dose'], timeWindowHours: [720, 4320], severityTier: 'mild', description: 'Aluminium antacids bind phosphate, potentially causing hypophosphataemia.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'mixed', typicalDescription: 'Constipation in a patient taking aluminium-containing antacids or phosphate binders. Stools become exceptionally hard and dry.' },
};

export const chemotherapy_constipation: DiseaseNode = {
  id: 'chemotherapy_constipation', name: 'Chemotherapy-Induced Constipation', icdCode: 'T45.1', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 85, agePeak: [40, 75], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'Chemotherapy causes constipation through (1) neurotoxicity (vinca alkaloids, taxanes, platinum agents damage enteric nerves), (2) antiemetic use (5-HT3 antagonists, NK1 antagonists), (3) opioid analgesics for pain, (4) mucositis causing painful defecation, (5) reduced oral intake and dehydration.', timelineStages: [{ stageId: 1, label: 'Chemo constipation', typicalHoursFromOnset: [0, 336], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('chemotherapy_exposure', 0.95, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Variable', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Frequently complicates chemotherapy cycles. May be severe with vinca alkaloids.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('chemotherapy_exposure', 0.95, 0.85, { stageRelevance: [1] }), sym('nausea_vomiting', 0.7, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.4, 0.65, { stageRelevance: [1] }), sym('constipation_bloating', 0.4, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['opioid_constipation', 'dehydration_constipation', 'anticholinergic_constipation', 'tca_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'opioid_constipation', featureIds: ['chemotherapy_exposure', 'nausea_vomiting'] }], neverCloseConditions: [] },
  complications: [{ name: 'Paralytic ileus', warningFeatures: ['constipation_obstipation', 'constipation_abdominal_distension', 'constipation_vomiting'], riskFactors: ['vinca_alkaloids', 'concomitant_opioids'], timeWindowHours: [168, 720], severityTier: 'severe', description: 'Vincristine and other vinca alkaloids can cause severe neurotoxicity leading to paralytic ileus.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'acute', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['vomiting', 'vomiting'], mechanism: 'mixed', typicalDescription: 'Constipation during chemotherapy, exacerbated by antiemetics, opioids, and reduced oral intake. Vinca alkaloids are particularly constipating.' },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: GI DYSMOTILITY (4 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const chronic_intestinal_pseudo_obstruction: DiseaseNode = {
  id: 'chronic_intestinal_pseudo_obstruction', name: 'Chronic Intestinal Pseudo-Obstruction', icdCode: 'K59.8', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 10, ageMax: 70, agePeak: [20, 50], sexRisk: { male: 0.5, female: 2 }, backgroundPrevalence: 0.0002, riskFactors: [] },
  pathophysiology: { mechanism: 'Chronic intestinal pseudo-obstruction (CIPO) is a severe motility disorder characterised by recurrent episodes of intestinal obstruction without a mechanical cause. It results from dysfunction of the enteric nerves, smooth muscle, or interstitial cells of Cajal. Presents with chronic constipation, abdominal distension, and vomiting.', timelineStages: [{ stageId: 1, label: 'Pseudo-obstruction', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.9, 0.5), sym('constipation_abdominal_distension', 0.85, 0.75)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Severe distension and pain', painLocationTypical: 'Generalised', painRadiationTypical: 'None' }], progressionRule: 'Recurrent episodes of pseudo-obstruction. May progress to chronic intestinal failure requiring parenteral nutrition.' },
  features: { symptoms: [sym('constipation', 0.9, 0.5, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.85, 0.75, { stageRelevance: [1] }), sym('constipation_vomiting', 0.7, 0.85, { stageRelevance: [1] }), sym('constipation_bloating', 0.7, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.6, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['postoperative_ileus', 'large_bowel_obstruction', 'colonic_inertia', 'systemic_sclerosis_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'postoperative_ileus', featureIds: ['constipation_duration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal failure', warningFeatures: ['constipation_vomiting', 'constipation_weight_loss'], riskFactors: ['severe_motility_disorder'], timeWindowHours: [2160, 21600], severityTier: 'critical', description: 'Chronic pseudo-obstruction may cause intestinal failure requiring long-term parenteral nutrition.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_vomiting', 'constipation_weight_loss'],
  constipationManifestation: { duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'variable', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['vomiting', 'abdominal_distension', 'weight_loss'], mechanism: 'mixed', typicalDescription: 'Episodic or chronic constipation with massive abdominal distension, vomiting, and pain. Episodes mimic mechanical obstruction but no blockage is found.' },
};

export const postoperative_ileus: DiseaseNode = {
  id: 'postoperative_ileus', name: 'Postoperative Ileus', icdCode: 'K56.0', system: 'surgical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 1, ageMax: 90, agePeak: [40, 70], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Temporary impairment of GI motility following abdominal or pelvic surgery. Caused by surgical manipulation, anaesthetic agents, opioids, and inflammatory mediators. Results in accumulation of gas and fluid, abdominal distension, inability to pass stool or flatus.', timelineStages: [{ stageId: 1, label: 'Postoperative ileus', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('constipation_obstipation', 0.9, 0.8), sym('constipation_abdominal_distension', 0.8, 0.75)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Mild to moderate distension', painLocationTypical: 'Diffuse abdomen', painRadiationTypical: 'None' }], progressionRule: 'Usually self-limiting, resolving within 3-5 days. Prolonged ileus requires investigation.' },
  features: { symptoms: [sym('constipation_obstipation', 0.9, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.8, 0.75, { stageRelevance: [1] }), sym('prior_abdominal_surgery', 0.95, 0.7, { stageRelevance: [1] }), sym('constipation_vomiting', 0.4, 0.85, { stageRelevance: [1] }), sym('constipation_bloating', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['large_bowel_obstruction', 'sigmoid_volvulus', 'cecal_volvulus', 'chronic_intestinal_pseudo_obstruction'], distinguishingFeatures: [{ fromDiseaseId: 'sigmoid_volvulus', featureIds: ['prior_abdominal_surgery', 'constipation_duration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Prolonged ileus', warningFeatures: ['constipation_obstipation', 'constipation_abdominal_distension'], riskFactors: ['open_surgery', 'high_opioid_use'], timeWindowHours: [120, 336], severityTier: 'moderate', description: 'Ileus persisting beyond 5 days postoperatively, requiring investigation to exclude mechanical obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_obstipation'],
  constipationManifestation: { duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'variable', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['vomiting', 'abdominal_distension'], mechanism: 'slow_transit', typicalDescription: 'Inability to pass stool or flatus following abdominal surgery, with abdominal distension and discomfort. Typically resolves within 3-5 days.' },
};

export const colonic_inertia: DiseaseNode = {
  id: 'colonic_inertia', name: 'Colonic Inertia (Severe Slow Transit)', icdCode: 'K59.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 60, agePeak: [25, 50], sexRisk: { male: 0.2, female: 5 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Colonic inertia represents the severe end of the slow transit constipation spectrum. There is marked reduction in colonic motor activity with absent or severely diminished high-amplitude propagated contractions. Patients have extremely infrequent bowel movements (less than once per week) and are refractory to medical therapy.', timelineStages: [{ stageId: 1, label: 'Colonic inertia', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.95, 0.5), sym('constipation_stool_frequency', 0.95, 0.6)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild', painLocationTypical: 'Generalised', painRadiationTypical: 'None' }], progressionRule: 'Chronic and severe. Often requires subtotal colectomy in refractory cases.' },
  features: { symptoms: [sym('constipation', 0.95, 0.5, { stageRelevance: [1] }), sym('constipation_stool_frequency', 0.95, 0.6, { stageRelevance: [1] }), sym('constipation_bloating', 0.7, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.6, 0.75, { stageRelevance: [1] }), sym('constipation_duration', 0.9, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['slow_transit_constipation', 'functional_constipation', 'chronic_intestinal_pseudo_obstruction', 'pelvic_floor_dyssynergia'], distinguishingFeatures: [{ fromDiseaseId: 'slow_transit_constipation', featureIds: ['constipation_stool_frequency', 'constipation_duration'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction with megacolon', warningFeatures: ['constipation_abdominal_distension', 'constipation_overflow'], riskFactors: ['refractory_disease'], timeWindowHours: [720, 4320], severityTier: 'severe', description: 'Severe colonic inertia leads to massive faecal loading and megacolon.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['abdominal_distension'], mechanism: 'slow_transit', typicalDescription: 'Extremely infrequent bowel movements (less than once per week) with massive bloating. Minimally responsive to laxatives. Often requires colectomy.' },
};

export const systemic_sclerosis_constipation: DiseaseNode = {
  id: 'systemic_sclerosis_constipation', name: 'Systemic Sclerosis (Scleroderma) Dysmotility', icdCode: 'M34.8', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 30, ageMax: 70, agePeak: [40, 60], sexRisk: { male: 0.2, female: 5 }, backgroundPrevalence: 0.0005, riskFactors: [] },
  pathophysiology: { mechanism: 'Systemic sclerosis causes smooth muscle atrophy and fibrosis throughout the GI tract. In the colon, this leads to reduced motility, wide-mouthed diverticula, and constipation. Small bowel involvement causes pseudo-obstruction. Oesophageal dysmotility (dysphagia, reflux) often coexists.', timelineStages: [{ stageId: 1, label: 'Scleroderma constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('vomiting', 0.5, 0.8)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Slowly progressive. GI involvement correlates with disease duration.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.5, 0.8, { stageRelevance: [1] }), sym('heartburn', 0.6, 0.7, { stageRelevance: [1] }), sym('constipation_bloating', 0.5, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.4, 0.75, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['chronic_intestinal_pseudo_obstruction', 'functional_constipation', 'slow_transit_constipation', 'amyloidosis_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation', featureIds: ['vomiting', 'heartburn'] }], neverCloseConditions: [] },
  complications: [{ name: 'Pseudo-obstruction', warningFeatures: ['constipation_abdominal_distension', 'constipation_vomiting'], riskFactors: ['severe_GI_involvement'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Severe small bowel dysmotility in systemic sclerosis can cause recurrent pseudo-obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['abdominal_distension'], mechanism: 'slow_transit', typicalDescription: 'Chronic constipation in a patient with known systemic sclerosis. Dysphagia, reflux, and bloating are commonly associated.' },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13: EXTRINSIC COMPRESSION (4 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const ovarian_mass_constipation: DiseaseNode = {
  id: 'ovarian_mass_constipation', name: 'Ovarian Tumor/Mass Compressing Bowel', icdCode: 'D27', system: 'gynaecological',
  organSystem: 'reproductive_female', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 15, ageMax: 80, agePeak: [40, 65], sexRisk: { male: 0, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'An ovarian mass (benign or malignant) can compress the rectosigmoid colon, causing mechanical obstruction and constipation. Malignant ovarian tumours may also cause malignant ascites and peritoneal carcinomatosis. Ovarian cancer is notorious for presenting with vague GI symptoms.', timelineStages: [{ stageId: 1, label: 'Compression', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('constipation_abdominal_distension', 0.7, 0.75)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Pelvic pressure / dull ache', painLocationTypical: 'Lower abdomen / pelvis', painRadiationTypical: 'None' }], progressionRule: 'Progressive as mass enlarges. Urgent if complete obstruction develops.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.7, 0.75, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.5, 0.65, { stageRelevance: [1] }), sym('last_menstrual_period', 0.4, 0.8, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.3, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'pelvic_malignancy_constipation', 'uterine_fibroids_constipation', 'functional_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['last_menstrual_period'] }], neverCloseConditions: [] },
  complications: [{ name: 'Ovarian torsion', warningFeatures: ['pain_onset_sudden', 'pain_character'], riskFactors: ['large_mass'], timeWindowHours: [24, 72], severityTier: 'severe', description: 'Large ovarian mass may undergo torsion causing acute surgical abdomen.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss'],
  constipationManifestation: { duration: 'chronic', frequency: 'variable', stoolConsistency: 'ribbon_like', straining: 'no', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['weight_loss', 'abdominal_distension'], mechanism: 'mechanical_obstruction', typicalDescription: 'Constipation with progressive abdominal distension and pelvic pressure in a woman. Ovarian masses often present with vague GI symptoms.' },
};

export const uterine_fibroids_constipation: DiseaseNode = {
  id: 'uterine_fibroids_constipation', name: 'Uterine Fibroids Compressing Rectum', icdCode: 'D25.9', system: 'gynaecological',
  organSystem: 'reproductive_female', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 25, ageMax: 55, agePeak: [35, 50], sexRisk: { male: 0, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Large uterine fibroids, particularly posterior or cervical fibroids, can compress the rectosigmoid colon causing constipation and tenesmus. The degree of constipation correlates with fibroid size and location. Other symptoms include menorrhagia and pelvic pressure.', timelineStages: [{ stageId: 1, label: 'Fibroid compression', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('menorrhagia', 0.6, 0.75)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Pelvic pressure', painLocationTypical: 'Pelvis / lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Slowly progressive with fibroid growth. May worsen during pregnancy.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('menorrhagia', 0.6, 0.75, { stageRelevance: [1] }), sym('none', 0.5, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.4, 0.65, { stageRelevance: [1] }), sym('constipation_tenesmus', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ovarian_mass_constipation', 'pelvic_malignancy_constipation', 'endometriosis_constipation', 'colorectal_cancer_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'ovarian_mass_constipation', featureIds: ['menorrhagia', 'none'] }], neverCloseConditions: [] },
  complications: [{ name: 'Fibroid degeneration', warningFeatures: ['pain_character'], riskFactors: ['pregnancy', 'large_fibroid'], timeWindowHours: [24, 168], severityTier: 'moderate', description: 'Red degeneration or torsion of a fibroid causing acute pain.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'ribbon_like', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['tenesmus'], mechanism: 'mechanical_obstruction', typicalDescription: 'Constipation from a large posterior or cervical fibroid compressing the rectum. Associated with heavy menstrual bleeding and pelvic pressure.' },
};

export const pelvic_malignancy_constipation: DiseaseNode = {
  id: 'pelvic_malignancy_constipation', name: 'Pelvic Malignancy Causing Constipation', icdCode: 'C76.3', system: 'surgical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 40, ageMax: 85, agePeak: [55, 75], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Pelvic malignancies (bladder, prostate, cervical, uterine, rectal) can directly invade or externally compress the rectosigmoid colon, causing progressive constipation. Additionally, malignant infiltration of the sacral plexus can cause neurogenic constipation.', timelineStages: [{ stageId: 1, label: 'Tumor compression', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('constipation_weight_loss', 0.6, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Pelvic / sacral pain', painLocationTypical: 'Pelvis / lower back', painRadiationTypical: 'Legs' }], progressionRule: 'Progressive. Depends on tumour growth rate and response to treatment.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.6, 0.9, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.4, 0.9, { stageRelevance: [1] }), sym('constipation_tenesmus', 0.4, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.5, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'ovarian_mass_constipation', 'prostate_enlargement_constipation', 'radiation_stricture'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['constipation_weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Complete large bowel obstruction', warningFeatures: ['constipation_obstipation', 'constipation_abdominal_distension', 'constipation_vomiting'], riskFactors: ['advanced_malignancy'], timeWindowHours: [336, 2160], severityTier: 'critical', description: 'Pelvic malignancy causing complete colonic obstruction requiring diverting colostomy.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding'],
  constipationManifestation: { duration: 'chronic', frequency: 'variable', stoolConsistency: 'ribbon_like', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'yes', associatedSymptoms: ['weight_loss', 'tenesmus'], mechanism: 'mechanical_obstruction', typicalDescription: 'Progressive constipation in a patient with known or suspected pelvic malignancy. Pelvic or sacral pain, weight loss, and rectal bleeding are associated.' },
};

export const prostate_enlargement_constipation: DiseaseNode = {
  id: 'prostate_enlargement_constipation', name: 'Enlarged Prostate Causing Constipation', icdCode: 'N40', system: 'urological',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 50, ageMax: 90, agePeak: [60, 80], sexRisk: { male: 1, female: 0 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Benign prostatic hyperplasia (BPH) or prostate cancer can cause mechanical compression of the rectum due to the anatomic proximity of the prostate to the anterior rectal wall. This causes a sensation of incomplete evacuation, tenesmus, and constipation. Urinary symptoms (hesitancy, weak stream) typically coexist.', timelineStages: [{ stageId: 1, label: 'Prostatic compression', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.4, 0.5), sym('neurological', 0.6, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Pelvic discomfort', painLocationTypical: 'Pelvis / perineum', painRadiationTypical: 'None' }], progressionRule: 'Slowly progressive with prostate enlargement.' },
  features: { symptoms: [sym('constipation', 0.4, 0.5, { stageRelevance: [1] }), sym('neurological', 0.6, 0.8, { stageRelevance: [1] }), sym('urinary_retention_hesitancy', 0.5, 0.75, { stageRelevance: [1] }), sym('urinary_retention_weak_stream', 0.5, 0.75, { stageRelevance: [1] }), sym('constipation_incomplete_evacuation', 0.5, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'pelvic_malignancy_constipation', 'functional_constipation', 'pelvic_floor_dyssynergia'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['neurological', 'urinary_retention_hesitancy'] }], neverCloseConditions: [] },
  complications: [{ name: 'Acute urinary retention', warningFeatures: ['neurological'], riskFactors: ['large_prostate'], timeWindowHours: [336, 2160], severityTier: 'moderate', description: 'Progressive prostate enlargement may cause acute urinary retention requiring catheterisation.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'mechanical_obstruction', typicalDescription: 'Constipation in an older man with coexisting urinary symptoms (hesitancy, weak stream, frequency). Incomplete evacuation and tenesmus are common.' },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 14: GYNAECOLOGICAL (2 nodes - unique, no pregnancy_constipation duplicate)
// ═══════════════════════════════════════════════════════════════════════════════

export const endometriosis_constipation: DiseaseNode = {
  id: 'endometriosis_constipation', name: 'Endometriosis Affecting Bowel', icdCode: 'N80.5', system: 'gynaecological',
  organSystem: 'reproductive_female', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 18, ageMax: 50, agePeak: [25, 40], sexRisk: { male: 0, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Endometriosis can infiltrate the bowel wall (most commonly rectosigmoid), causing fibrosis, serosal inflammation, and adhesions that impair normal motility and lumen calibre. Symptoms are often cyclical, worsening during menstruation.', timelineStages: [{ stageId: 1, label: 'Bowel endometriosis', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('none', 0.8, 0.85)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Cyclical cramping pelvic pain', painLocationTypical: 'Lower abdomen / pelvis', painRadiationTypical: 'Rectum / lower back' }], progressionRule: 'Symptoms often worsen perimenstrually. Disease may progress slowly over years.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('none', 0.8, 0.85, { stageRelevance: [1] }), sym('none', 0.6, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.6, 0.65, { stageRelevance: [1] }), sym('constipation_tenesmus', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'ibs_constipation', 'uterine_fibroids_constipation', 'pelvic_malignancy_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'fibroids_constipation', featureIds: ['none'] }], neverCloseConditions: [] },
  complications: [{ name: 'Bowel obstruction', warningFeatures: ['constipation_obstipation', 'constipation_vomiting'], riskFactors: ['severe_bowel_involvement'], timeWindowHours: [720, 4320], severityTier: 'severe', description: 'Deep infiltrating bowel endometriosis may cause stricture and obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining', straining: 'no', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'none'], mechanism: 'mixed', typicalDescription: 'Constipation that worsens during menstruation, associated with painful periods and intercourse.' },
};

export const pelvic_congestion_constipation: DiseaseNode = {
  id: 'pelvic_congestion_constipation', name: 'Pelvic Congestion Syndrome', icdCode: 'N94.8', system: 'gynaecological',
  organSystem: 'cardiovascular', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 25, ageMax: 55, agePeak: [30, 45], sexRisk: { male: 0, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Pelvic congestion syndrome results from chronic venous insufficiency of the pelvic veins, causing pelvic pain, heaviness, and referred symptoms including constipation and tenesmus due to venous engorgement of the rectum. Symptoms worsen with prolonged standing and improve with lying down.', timelineStages: [{ stageId: 1, label: 'Pelvic congestion', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.3, 0.5), sym('pelvic_pain', 0.8, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Dull ache / heaviness', painLocationTypical: 'Pelvis / lower abdomen', painRadiationTypical: 'Thighs / back' }], progressionRule: 'Chronic, intermittent. May worsen with multiparity.' },
  features: { symptoms: [sym('constipation', 0.3, 0.5, { stageRelevance: [1] }), sym('pelvic_pain', 0.8, 0.7, { stageRelevance: [1] }), sym('none', 0.5, 0.7, { stageRelevance: [1] }), sym('none', 0.5, 0.7, { stageRelevance: [1] }), sym('constipation_tenesmus', 0.3, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['endometriosis_constipation', 'uterine_fibroids_constipation', 'ibs_constipation', 'pelvic_floor_dyssynergia'], distinguishingFeatures: [{ fromDiseaseId: 'endometriosis_constipation', featureIds: ['pelvic_pain'] }], neverCloseConditions: [] },
  complications: [{ name: 'Chronic pelvic pain syndrome', warningFeatures: ['pelvic_pain'], riskFactors: ['multiparity'], timeWindowHours: [2160, 21600], severityTier: 'mild', description: 'Persistent pelvic pain and congestion impacting quality of life.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'no', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'functional', typicalDescription: 'Constipation with pelvic heaviness, worsened by standing. Associated with dysmenorrhea and dyspareunia.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 15: INFECTIOUS (2 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const diverticulitis_constipation: DiseaseNode = {
  id: 'diverticulitis_constipation', name: 'Diverticulitis', icdCode: 'K57.9', system: 'medical',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 35, ageMax: 90, agePeak: [50, 75], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.01, riskFactors: [] },
  pathophysiology: { mechanism: 'Diverticulitis is inflammation of colonic diverticula, typically in the sigmoid colon. The inflammatory process can cause (1) reflex ileus or constipation due to inflammation, (2) mechanical narrowing from inflammatory mass or stricture, and (3) painful defecation. Prior episodes of diverticulitis can cause fibrotic strictures.', timelineStages: [{ stageId: 1, label: 'Acute diverticulitis', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('constipation', 0.4, 0.5), sym('lower_abdominal_pain_right', 0.2, 0.85), sym('lower_abdominal_pain_left', 0.7, 0.85)], examFindings: [], severityTrajectory: 'improving', painCharacterTypical: 'Constant, localised', painLocationTypical: 'Left lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'Acute episodes resolve with antibiotics. Recurrent episodes or complicated disease may require surgery.' },
  features: { symptoms: [sym('constipation', 0.4, 0.5, { stageRelevance: [1] }), sym('lower_abdominal_pain_left', 0.7, 0.85, { stageRelevance: [1] }), sym('fever_chills', 0.6, 0.7, { stageRelevance: [1] }), sym('leucocytosis', 0.7, 0.75, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.15, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['ibs_constipation', 'colorectal_cancer_constipation', 'appendicitis', 'diverticular_stricture'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_constipation', featureIds: ['leucocytosis', 'fever_chills'] }], neverCloseConditions: [] },
  complications: [{ name: 'Diverticular stricture', warningFeatures: ['constipation_obstipation'], riskFactors: ['recurrent_diverticulitis'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Recurrent diverticulitis may result in a fibrotic stricture causing progressive constipation.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'acute', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'yes', associatedSymptoms: ['fever', 'none'], mechanism: 'functional', typicalDescription: 'Constipation during an acute episode of diverticulitis with left lower quadrant pain, fever, and bloating.' },
};

export const anal_tuberculosis_constipation: DiseaseNode = {
  id: 'anal_tuberculosis_constipation', name: 'Anorectal Tuberculosis', icdCode: 'A18.3', system: 'infectious',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 15, ageMax: 80, agePeak: [25, 50], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'Anorectal TB is a rare form of extrapulmonary tuberculosis involving the anal canal and perianal region, causing chronic ulcers, fistulae, fissures, and strictures. Results in painful defecation, bleeding, and constipation. Often misdiagnosed as Crohn\'s disease.', timelineStages: [{ stageId: 1, label: 'Anorectal TB', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.4, 0.5), sym('constipation_rectal_bleeding', 0.5, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Burning / sharp with defecation', painLocationTypical: 'Perianal', painRadiationTypical: 'None' }], progressionRule: 'Slowly progressive without treatment. Responds to standard anti-TB therapy.' },
  features: { symptoms: [sym('constipation', 0.4, 0.5, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.5, 0.9, { stageRelevance: [1] }), sym('nocturnal_sweats', 0.6, 0.85, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.5, 0.9, { stageRelevance: [1] }), sym('tenesmus', 0.5, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['anal_fissure', 'crohn_stricture', 'anal_stenosis', 'chagas_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'anal_fissure', featureIds: ['nocturnal_sweats', 'constipation_weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Anal stricture', warningFeatures: ['tenesmus', 'constipation_obstipation'], riskFactors: ['delayed_treatment'], timeWindowHours: [1080, 4320], severityTier: 'moderate', description: 'Untreated anal TB may cause severe anal stricture requiring surgical intervention.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss'],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'normal_with_straining', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'yes', associatedSymptoms: ['mucus', 'weight_loss', 'fever'], mechanism: 'mechanical_obstruction', typicalDescription: 'Constipation with painful defecation, rectal bleeding, and systemic B-symptoms in a patient from a TB-endemic area or immunocompromised.' },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 16: CONNECTIVE TISSUE (2 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const amyloidosis_constipation: DiseaseNode = {
  id: 'amyloidosis_constipation', name: 'GI Amyloidosis', icdCode: 'E85.4', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 40, ageMax: 80, agePeak: [55, 70], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'Amyloid deposition in the GI tract causes impaired motility due to infiltration of the enteric nerves and smooth muscle. This can present as chronic constipation, pseudo-obstruction, or diarrhoea depending on the site of deposition. Macroglossia, hepatomegaly, and proteinuria may coexist.', timelineStages: [{ stageId: 1, label: 'GI amyloidosis', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.4, 0.5), sym('constipation_weight_loss', 0.5, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Variable / nonspecific', painLocationTypical: 'Diffuse abdomen', painRadiationTypical: 'None' }], progressionRule: 'Slowly progressive. Prognosis depends on cardiac involvement.' },
  features: { symptoms: [sym('constipation', 0.4, 0.5, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.5, 0.9, { stageRelevance: [1] }), sym('none', 0.4, 0.8, { stageRelevance: [1] }), sym('macroglossia', 0.2, 0.85, { stageRelevance: [1] }), sym('proteinuria', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'chronic_intestinal_pseudo_obstruction', 'systemic_sclerosis_constipation', 'malabsorption_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation', featureIds: ['macroglossia', 'none', 'proteinuria'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal pseudo-obstruction', warningFeatures: ['constipation_abdominal_distension', 'constipation_vomiting'], riskFactors: ['systemic_amyloidosis'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Amyloid deposits can cause severe dysmotility and pseudo-obstruction.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss'],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'variable', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['weight_loss', 'none'], mechanism: 'slow_transit', typicalDescription: 'Chronic constipation in a patient with known or suspected amyloidosis, accompanied by weight loss, fatigue, and organomegaly.' },
};

export const dermatomyositis_constipation: DiseaseNode = {
  id: 'dermatomyositis_constipation', name: 'Dermatomyositis/Polymyositis Dysmotility', icdCode: 'M33.9', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 20, ageMax: 75, agePeak: [40, 60], sexRisk: { male: 0.5, female: 2 }, backgroundPrevalence: 0.0001, riskFactors: [] },
  pathophysiology: { mechanism: 'Dermatomyositis and polymyositis can involve the GI tract, causing dysphagia (most common GI symptom) and constipation due to smooth muscle involvement. The pharyngeal and oesophageal muscles are most affected, but colonic involvement can also occur.', timelineStages: [{ stageId: 1, label: 'Myositis GI', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.3, 0.5), sym('vomiting', 0.6, 0.8)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Nonspecific', painLocationTypical: 'Abdomen', painRadiationTypical: 'None' }], progressionRule: 'Chronic. May improve with immunosuppressive therapy.' },
  features: { symptoms: [sym('constipation', 0.3, 0.5, { stageRelevance: [1] }), sym('vomiting', 0.6, 0.8, { stageRelevance: [1] }), sym('proximal_muscle_weakness', 0.8, 0.9, { stageRelevance: [1] }), sym('heliotrope_rash', 0.4, 0.9, { stageRelevance: [1] }), sym('myalgia', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'systemic_sclerosis_constipation', 'myasthenia_gravis_constipation', 'dementia_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'systemic_sclerosis_constipation', featureIds: ['proximal_muscle_weakness', 'heliotrope_rash'] }], neverCloseConditions: [] },
  complications: [{ name: 'Aspiration pneumonia', warningFeatures: ['vomiting'], riskFactors: ['severe_dysphagia'], timeWindowHours: [336, 2160], severityTier: 'severe', description: 'Severe dysphagia in dermatomyositis increases aspiration risk.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'normal_with_straining', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['vomiting', 'neurological'], mechanism: 'slow_transit', typicalDescription: 'Constipation with dysphagia in a patient with proximal muscle weakness and characteristic rash.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 17: PAEDIATRIC (4 nodes - unique, no hirschsprung_disease duplicate)
// ═══════════════════════════════════════════════════════════════════════════════

export const functional_constipation_child: DiseaseNode = {
  id: 'functional_constipation_child', name: 'Childhood Functional Constipation', icdCode: 'K59.0', system: 'paediatric',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 18, agePeak: [1, 5], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.15, riskFactors: [] },
  pathophysiology: { mechanism: 'Childhood functional constipation is common and multifactorial. Causes include poor dietary fibre, low fluid intake, stool withholding behaviour after a painful bowel movement, and psychological factors. Stool retention leads to a megarectum, further exacerbating constipation.', timelineStages: [{ stageId: 1, label: 'Childhood constipation', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.9, 0.5), sym('constipation_overflow', 0.5, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Cramping', painLocationTypical: 'Diffuse abdomen', painRadiationTypical: 'None' }], progressionRule: 'Often self-limited if addressed early. Chronic cases may persist into adulthood.' },
  features: { symptoms: [sym('constipation', 0.9, 0.5, { stageRelevance: [1] }), sym('constipation_overflow', 0.5, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.5, 0.65, { stageRelevance: [1] }), sym('constipation_bloating', 0.4, 0.7, { stageRelevance: [1] }), sym('constipation_stool_frequency', 0.8, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hirschsprung_disease', 'celiac_disease_constipation', 'hypothyroidism_constipation', 'spina_bifida_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'hirschsprung_disease', featureIds: ['constipation_overflow'] }], neverCloseConditions: ['hirschsprung_disease'] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_overflow', 'constipation_abdominal_pain'], riskFactors: ['stool_withholding'], timeWindowHours: [336, 2160], severityTier: 'mild', description: 'Chronic stool withholding leads to faecal impaction and overflow incontinence.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'functional', typicalDescription: 'Common childhood constipation often triggered by painful defecation, with stool withholding, hard pellets, and occasional overflow soiling.' },
};

export const meconium_ileus: DiseaseNode = {
  id: 'meconium_ileus', name: 'Meconium Ileus', icdCode: 'P76.0', system: 'paediatric',
  organSystem: 'GI', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 0, ageMax: 1, agePeak: [0, 0.02], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0002, riskFactors: [] },
  pathophysiology: { mechanism: 'Meconium ileus is a neonatal intestinal obstruction caused by inspissated, thick meconium that obstructs the distal ileum. It is a presenting feature of cystic fibrosis (CF) in 10-20% of newborns with CF. The underlying CFTR mutation leads to abnormal intestinal secretions.', timelineStages: [{ stageId: 1, label: 'Meconium ileus', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('constipation', 0.95, 0.5), sym('constipation_vomiting', 0.8, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Abdominal distension', painLocationTypical: 'Generalised', painRadiationTypical: 'None' }], progressionRule: 'Requires medical (Gastrografin enema) or surgical intervention. Indicates underlying cystic fibrosis.' },
  features: { symptoms: [sym('constipation', 0.95, 0.5, { stageRelevance: [1] }), sym('constipation_vomiting', 0.8, 0.85, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.9, 0.75, { stageRelevance: [1] }), sym('weight_loss', 0.3, 0.85, { stageRelevance: [1] }), sym('none', 0.1, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['hirschsprung_disease', 'meconium_plug_syndrome', 'anal_stenosis', 'intestinal_atresia'], distinguishingFeatures: [{ fromDiseaseId: 'hirschsprung_disease', featureIds: ['none'] }], neverCloseConditions: [] },
  complications: [{ name: 'Intestinal perforation', warningFeatures: ['constipation_abdominal_distension', 'sepsis'], riskFactors: ['delayed_treatment'], timeWindowHours: [48, 168], severityTier: 'critical', description: 'Untreated meconium ileus may lead to volvulus, perforation, and peritonitis.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_abdominal_distension', 'constipation_vomiting'],
  constipationManifestation: { duration: 'acute', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['vomiting', 'abdominal_distension'], mechanism: 'mechanical_obstruction', typicalDescription: 'Neonatal intestinal obstruction with failure to pass meconium, progressive abdominal distension, and bilious vomiting.' },
};

export const celiac_disease_constipation: DiseaseNode = {
  id: 'celiac_disease_constipation', name: 'Coeliac Disease with Constipation', icdCode: 'K90.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 70, agePeak: [2, 10], sexRisk: { male: 0.7, female: 1.3 }, backgroundPrevalence: 0.008, riskFactors: [] },
  pathophysiology: { mechanism: 'Coeliac disease causes autoimmune damage to the small intestinal mucosa. While diarrhoea is classic, constipation also occurs, especially in children. Possible mechanisms include altered motility from chronic inflammation, dysbiosis, and concurrent IBS. Nutritional deficiencies (iron, B12) are common.', timelineStages: [{ stageId: 1, label: 'Coeliac constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.3, 0.5), sym('constipation_bloating', 0.5, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Variable', painLocationTypical: 'Diffuse abdomen', painRadiationTypical: 'None' }], progressionRule: 'Symptoms improve on a gluten-free diet. Untreated may cause long-term complications.' },
  features: { symptoms: [sym('constipation', 0.3, 0.5, { stageRelevance: [1] }), sym('constipation_bloating', 0.5, 0.7, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.3, 0.9, { stageRelevance: [1] }), sym('chronic_fatigue', 0.6, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.4, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation_child', 'ibs_constipation', 'ibs_diarrhoea', 'hypothyroidism_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_constipation', featureIds: ['constipation_weight_loss', 'chronic_fatigue'] }], neverCloseConditions: [] },
  complications: [{ name: 'Iron deficiency anaemia', warningFeatures: ['chronic_fatigue'], riskFactors: ['persistent_gluten_exposure'], timeWindowHours: [2160, 21600], severityTier: 'mild', description: 'Chronic malabsorption in coeliac disease causes iron deficiency and anaemia.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss'],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'variable', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'weight_loss'], mechanism: 'mixed', typicalDescription: 'Constipation in coeliac disease, may alternate with diarrhoea. Bloating, fatigue, and weight loss are associated.' },
};

export const cystic_fibrosis_constipation: DiseaseNode = {
  id: 'cystic_fibrosis_constipation', name: 'Cystic Fibrosis Bowel Dysmotility', icdCode: 'E84.1', system: 'paediatric',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 0, ageMax: 50, agePeak: [5, 30], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.0003, riskFactors: [] },
  pathophysiology: { mechanism: 'Cystic fibrosis causes thickened intestinal secretions due to CFTR dysfunction, leading to slow transit, distal intestinal obstruction syndrome (DIOS), and constipation. Pancreatic insufficiency contributes with maldigestion of fats. DIOS is a partial or complete obstruction of the terminal ileum and caecum by viscid faecal material.', timelineStages: [{ stageId: 1, label: 'CF constipation / DIOS', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.6, 0.5), sym('constipation_abdominal_pain', 0.5, 0.65)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Cramping / colicky', painLocationTypical: 'Right lower quadrant', painRadiationTypical: 'None' }], progressionRule: 'Chronic. Episodes of DIOS may be recurrent. Responds to pancreatic enzymes and laxatives.' },
  features: { symptoms: [sym('constipation', 0.6, 0.5, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.5, 0.65, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.5, 0.75, { stageRelevance: [1] }), sym('none', 0.6, 0.85, { stageRelevance: [1] }), sym('weight_loss', 0.5, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['meconium_ileus', 'functional_constipation', 'coeliac_disease_constipation', 'ibs_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_constipation', featureIds: ['none', 'weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Distal intestinal obstruction syndrome (DIOS)', warningFeatures: ['constipation_abdominal_pain', 'constipation_abdominal_distension', 'constipation_vomiting'], riskFactors: ['pancreatic_insufficiency', 'dehydration'], timeWindowHours: [168, 720], severityTier: 'severe', description: 'Complete or partial obstruction of the distal ileum by viscous faecal material, requiring aggressive medical or surgical management.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'weight_loss', 'none'], mechanism: 'slow_transit', typicalDescription: 'Constipation in cystic fibrosis with thick, hard stools, abdominal pain, and steatorrhea. Episodes of DIOS may occur with severe colicky pain.' },
};
// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 18: PSYCHIATRIC (3 nodes)
// ═══════════════════════════════════════════════════════════════════════════════

export const depression_constipation: DiseaseNode = {
  id: 'depression_constipation', name: 'Depression-Associated Constipation', icdCode: 'F32.9', system: 'psychiatric',
  organSystem: 'psychiatric', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 12, ageMax: 85, agePeak: [25, 55], sexRisk: { male: 0.7, female: 1.3 }, backgroundPrevalence: 0.02, riskFactors: [] },
  pathophysiology: { mechanism: 'Constipation in depression results from (1) altered autonomic nervous system activity reducing colonic motility, (2) poor dietary and fluid intake, (3) reduced physical activity, (4) TCAs and SSRIs used in treatment that may worsen constipation. Many patients present with prominent GI symptoms as their main complaint.', timelineStages: [{ stageId: 1, label: 'Depression constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.4, 0.5), sym('neurological', 0.9, 0.85)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Vague', painLocationTypical: 'Generalised', painRadiationTypical: 'None' }], progressionRule: 'Chronic. May fluctuate with mood and medication changes.' },
  features: { symptoms: [sym('constipation', 0.4, 0.5, { stageRelevance: [1] }), sym('neurological', 0.9, 0.85, { stageRelevance: [1] }), sym('anhedonia', 0.8, 0.85, { stageRelevance: [1] }), sym('insomnia', 0.6, 0.7, { stageRelevance: [1] }), sym('chronic_fatigue', 0.7, 0.8, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'ibs_constipation', 'hypothyroidism_constipation', 'anorexia_nervosa_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation', featureIds: ['neurological', 'anhedonia'] }], neverCloseConditions: [] },
  complications: [{ name: 'Antidepressant-induced worsening', warningFeatures: ['constipation'], riskFactors: ['tca_use', 'ssri_use'], timeWindowHours: [336, 2160], severityTier: 'mild', description: 'Antidepressants, especially TCAs, may worsen constipation.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'no', associatedSymptoms: ['neurological', 'none', 'none'], mechanism: 'slow_transit', typicalDescription: 'Constipation in a patient with depression, with reduced appetite and physical activity. Confirm with mood symptoms.' },
};

export const eating_disorder_constipation: DiseaseNode = {
  id: 'eating_disorder_constipation', name: 'Eating Disorder (Anorexia Nervosa) Constipation', icdCode: 'F50.0', system: 'psychiatric',
  organSystem: 'psychiatric', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 12, ageMax: 40, agePeak: [15, 25], sexRisk: { male: 0.05, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Severe constipation in anorexia nervosa is caused by (1) markedly reduced food intake leading to diminished faecal bulk, (2) delayed gastric emptying and prolonged colonic transit from starvation, (3) laxative abuse causing colonic dysmotility upon withdrawal, (4) electrolyte disturbances (hypokalaemia), and (5) dehydration.', timelineStages: [{ stageId: 1, label: 'Anorexia constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('constipation_weight_loss', 0.9, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Variable / mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Improves with nutritional rehabilitation. Laxative withdrawal may cause transient worsening.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.9, 0.9, { stageRelevance: [1] }), sym('constipation_bloating', 0.5, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.4, 0.65, { stageRelevance: [1] }), sym('neurological', 0.4, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'ibs_constipation', 'hypercalcemia_constipation', 'hypothyroidism_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_constipation', featureIds: ['constipation_weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Refeeding syndrome', warningFeatures: ['constipation_bloating'], riskFactors: ['rapid_refeeding'], timeWindowHours: [24, 168], severityTier: 'severe', description: 'Life-threatening electrolyte shifts during refeeding.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss'],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['weight_loss', 'neurological'], mechanism: 'slow_transit', typicalDescription: 'Severe constipation in anorexia nervosa due to starvation, dehydration, and electrolyte abnormalities. Improves with refeeding.' },
};

export const somatic_symptom_constipation: DiseaseNode = {
  id: 'somatic_symptom_constipation', name: 'Somatic Symptom Disorder (Constipation-Predominant)', icdCode: 'F45.0', system: 'psychiatric',
  organSystem: 'psychiatric', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 18, ageMax: 70, agePeak: [25, 55], sexRisk: { male: 0.5, female: 2 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Somatic symptom disorder involves excessive attention and distress focused on bodily symptoms such as constipation. There is no identifiable organic cause. The constipation may be physiologically mild but perceived as severe. Anxiety and health-care-seeking behaviour are prominent.', timelineStages: [{ stageId: 1, label: 'Somatic constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.8, 0.5), sym('neurological', 0.7, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Variable', painLocationTypical: 'Variable', painRadiationTypical: 'None' }], progressionRule: 'Chronic, with multiple healthcare visits and normal investigations.' },
  features: { symptoms: [sym('constipation', 0.8, 0.5, { stageRelevance: [1] }), sym('neurological', 0.7, 0.7, { stageRelevance: [1] }), sym('neurological', 0.7, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.5, 0.65, { stageRelevance: [1] }), sym('constipation_bloating', 0.5, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'ibs_constipation', 'pelvic_floor_dyssynergia', 'slow_transit_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_constipation', featureIds: ['neurological', 'neurological'] }], neverCloseConditions: [] },
  complications: [{ name: 'Healthcare overutilisation', warningFeatures: ['constipation'], riskFactors: ['psychiatric_comorbidities'], timeWindowHours: [2160, 21600], severityTier: 'mild', description: 'Excessive healthcare visits and investigations despite normal findings.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'variable', stoolConsistency: 'variable', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['neurological', 'neurological'], mechanism: 'functional', typicalDescription: 'Constipation with excessive distress and health-concern out of proportion to objective findings. Multiple normal investigations.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 19: GERIATRIC (1 node - unique, no duplicates)
// ═══════════════════════════════════════════════════════════════════════════════

export const geriatric_multifactorial_constipation: DiseaseNode = {
  id: 'geriatric_multifactorial_constipation', name: 'Geriatric Multifactorial Constipation', icdCode: 'K59.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 65, ageMax: 100, agePeak: [70, 85], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.4, riskFactors: [] },
  pathophysiology: { mechanism: 'Constipation in the elderly is almost always multifactorial, involving (1) reduced colonic motility from ageing, (2) polypharmacy (opioids, anticholinergics, CCBs, iron), (3) reduced dietary fibre and fluid intake, (4) reduced mobility, (5) dementia affecting toileting behaviour, and (6) pelvic floor weakness.', timelineStages: [{ stageId: 1, label: 'Geriatric constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.9, 0.5), sym('constipation_overflow', 0.4, 0.8)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Variable / mild', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Often progressive. Responds to laxatives and lifestyle measures.' },
  features: { symptoms: [sym('constipation', 0.9, 0.5, { stageRelevance: [1] }), sym('constipation_overflow', 0.4, 0.8, { stageRelevance: [1] }), sym('constipation_bloating', 0.5, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.4, 0.75, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.3, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'slow_transit_constipation', 'fecal_impaction', 'hypothyroidism_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['constipation_overflow'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction with overflow', warningFeatures: ['constipation_overflow', 'constipation_abdominal_distension'], riskFactors: ['none', 'none'], timeWindowHours: [336, 2160], severityTier: 'moderate', description: 'Common in institutionalised elderly patients, leading to overflow incontinence.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'yes_relieved_by_defecation', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none', 'none'], mechanism: 'mixed', typicalDescription: 'Chronic constipation in an elderly patient on multiple medications, with reduced mobility and fluid intake.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// RESTORED: MISSING FROM TRUNCATED SECTION 2
// ═══════════════════════════════════════════════════════════════════════════════

export const immobility_constipation: DiseaseNode = {
  id: 'immobility_constipation', name: 'Immobility-Associated Constipation', icdCode: 'Z74.0', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 50, ageMax: 100, agePeak: [70, 90], sexRisk: { male: 1, female: 1.5 }, backgroundPrevalence: 0.1, riskFactors: [] },
  pathophysiology: { mechanism: 'Prolonged immobility (bed rest, wheelchair dependence) reduces colonic motility due to lack of gravitational and physical activity stimuli. Loss of abdominal muscle tone further impairs defecation. Common in frailty, stroke, Parkinson\'s disease, and after hip fracture.', timelineStages: [{ stageId: 1, label: 'Immobility constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.8, 0.5), sym('constipation_bloating', 0.4, 0.7)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Variable', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Chronic. Improves with mobilisation.' },
  features: { symptoms: [sym('constipation', 0.8, 0.5, { stageRelevance: [1] }), sym('constipation_bloating', 0.4, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_distension', 0.4, 0.75, { stageRelevance: [1] }), sym('none', 0.7, 0.8, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.3, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['geriatric_multifactorial_constipation', 'dementia_constipation', 'functional_constipation', 'dehydration_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'dementia_constipation', featureIds: ['none'] }], neverCloseConditions: [] },
  complications: [{ name: 'Faecal impaction', warningFeatures: ['constipation_abdominal_distension', 'constipation_overflow'], riskFactors: ['prolonged_bed_rest'], timeWindowHours: [336, 2160], severityTier: 'moderate', description: 'Prolonged immobility combined with poor fluid intake leads to faecal impaction.' }],
  clinicalScores: [], redFlagFeatureIds: [],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'slow_transit', typicalDescription: 'Constipation in a bedridden or wheelchair-bound patient due to lack of physical activity and poor fluid intake.' },
};

export const anorexia_nervosa_constipation: DiseaseNode = {
  id: 'anorexia_nervosa_constipation', name: 'Anorexia Nervosa Constipation', icdCode: 'F50.0', system: 'psychiatric',
  organSystem: 'psychiatric', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 12, ageMax: 40, agePeak: [15, 25], sexRisk: { male: 0.05, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Severe constipation in anorexia nervosa is caused by (1) markedly reduced food intake leading to diminished faecal bulk, (2) delayed gastric emptying and prolonged colonic transit from starvation, (3) laxative abuse leading to colonic dysmotility upon withdrawal, (4) electrolyte disturbances (hypokalaemia), and (5) dehydration.', timelineStages: [{ stageId: 1, label: 'Anorexia constipation', typicalHoursFromOnset: [0, 8760], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('constipation_weight_loss', 0.9, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Variable', painLocationTypical: 'Diffuse', painRadiationTypical: 'None' }], progressionRule: 'Improves with nutritional rehabilitation. Laxative withdrawal may cause transient worsening.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.9, 0.9, { stageRelevance: [1] }), sym('constipation_bloating', 0.5, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.4, 0.65, { stageRelevance: [1] }), sym('neurological', 0.4, 0.6, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'ibs_constipation', 'hypercalcemia_constipation', 'hypothyroidism_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'ibs_constipation', featureIds: ['constipation_weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Refeeding syndrome', warningFeatures: ['constipation_bloating'], riskFactors: ['rapid_refeeding'], timeWindowHours: [24, 168], severityTier: 'severe', description: 'Life-threatening electrolyte shifts during refeeding.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss'],
  constipationManifestation: { duration: 'chronic', frequency: 'moderate_1_2_per_week', stoolConsistency: 'hard_pellets', straining: 'no', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['weight_loss', 'neurological'], mechanism: 'slow_transit', typicalDescription: 'Severe constipation in anorexia nervosa due to starvation, dehydration, and electrolyte abnormalities. Improves with refeeding.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── SECTION 20: ONCOLOGICAL (additional) ─────────────────────

export const rectal_cancer: DiseaseNode = {
  id: 'rectal_cancer', name: 'Rectal Carcinoma', icdCode: 'C20', system: 'surgical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 3,
  epidemiology: { ageMin: 40, ageMax: 90, agePeak: [60, 80], sexRisk: { male: 1.2, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'Rectal adenocarcinoma arises from the mucosal epithelium of the rectum. As the tumour grows, it causes narrowing of the rectal lumen, leading to progressive constipation, tenesmus, and pencil-thin stools. Unlike left colon cancer, rectal cancer often presents early with tenesmus and bleeding due to the rectal ampulla\'s sensory innervation.', timelineStages: [{ stageId: 1, label: 'Local disease', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('constipation_rectal_bleeding', 0.8, 0.9)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Rectal pressure or dull ache', painLocationTypical: 'Rectum / sacrum', painRadiationTypical: 'None' }], progressionRule: 'Slowly progressive over months. Risk of local invasion and distant metastasis increases with delay.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('constipation_rectal_bleeding', 0.8, 0.9, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.7, 0.7, { stageRelevance: [1] }), sym('constipation_tenesmus', 0.8, 0.8, { stageRelevance: [1] }), sym('constipation_weight_loss', 0.5, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'anal_stenosis', 'severe_hemorrhoids', 'prostate_enlargement_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['constipation_tenesmus', 'constipation_stool_consistency'] }], neverCloseConditions: [] },
  complications: [{ name: 'Bowel obstruction', warningFeatures: ['constipation_obstipation', 'constipation_vomiting', 'constipation_abdominal_distension'], riskFactors: ['advanced_tumour'], timeWindowHours: [720, 4320], severityTier: 'severe', description: 'Advanced rectal cancer can cause complete large bowel obstruction requiring emergency stoma formation.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_rectal_bleeding', 'constipation_weight_loss'],
  constipationManifestation: { duration: 'chronic', frequency: 'variable', stoolConsistency: 'ribbon_like', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'no', bleeding: 'yes', associatedSymptoms: ['weight_loss', 'tenesmus'], mechanism: 'mechanical_obstruction', typicalDescription: 'Chronic progressive constipation with pencil-thin stools, tenesmus, and rectal bleeding. Weight loss indicates advanced disease.' },
};

export const pancreatic_cancer_constipation: DiseaseNode = {
  id: 'pancreatic_cancer_constipation', name: 'Pancreatic Carcinoma (Constipation Presentation)', icdCode: 'C25', system: 'surgical',
  organSystem: 'pancreatic', acuity: 'urgent', acuityTier: 3,
  epidemiology: { ageMin: 50, ageMax: 85, agePeak: [65, 80], sexRisk: { male: 1.3, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Pancreatic cancer causes constipation through multiple mechanisms: extrinsic compression of the duodenum or transverse colon by the pancreatic mass, autonomic nerve infiltration disrupting enteric motility, and malabsorption from exocrine pancreatic insufficiency leading to bulky stool that is difficult to pass.', timelineStages: [{ stageId: 1, label: 'Constipation phase', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('weight_loss', 0.9, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Epigastric boring pain radiating to back', painLocationTypical: 'Epigastrium', painRadiationTypical: 'Back' }], progressionRule: 'Rapidly progressive. Constipation worsens as the tumour enlarges and metastatic spread occurs.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.9, 0.85, { stageRelevance: [1] }), sym('jaundice', 0.7, 0.9, { stageRelevance: [1] }), sym('anorexia', 0.8, 0.7, { stageRelevance: [1] }), sym('pain_character', 0.7, 0.65, { stageRelevance: [1] }), sym('steatorrhea', 0.4, 0.9, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'pelvic_malignancy_constipation', 'chronic_pancreatitis'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['jaundice', 'steatorrhea'] }, { fromDiseaseId: 'pelvic_malignancy_constipation', featureIds: ['pain_character', 'jaundice'] }], neverCloseConditions: [] },
  complications: [{ name: 'Duodenal obstruction', warningFeatures: ['vomiting', 'constipation_obstipation'], riskFactors: ['head_of_pancreas_tumour'], timeWindowHours: [720, 4320], severityTier: 'severe', description: 'Pancreatic head tumours can obstruct the duodenum causing gastric outlet obstruction with vomiting.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'jaundice'],
  constipationManifestation: { duration: 'chronic', frequency: 'variable', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['weight_loss', 'vomiting', 'abdominal_distension'], mechanism: 'mechanical_obstruction', typicalDescription: 'Constipation with profound weight loss, epigastric pain radiating to the back, and jaundice. Steatorrhoea and anorexia are common accompaniments.' },
};

// ── SECTION 21: DRUG-INDUCED (additional) ────────────────────

export const antiepileptic_constipation: DiseaseNode = {
  id: 'antiepileptic_constipation', name: 'Antiepileptic Drug-Induced Constipation', icdCode: 'K59.4', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 1, ageMax: 80, agePeak: [20, 60], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.005, riskFactors: [] },
  pathophysiology: { mechanism: 'Many antiepileptic drugs (phenytoin, carbamazepine, valproate, gabapentin, pregabalin) cause constipation through effects on smooth muscle contractility and enteric nervous system function. The mechanism is often multifactorial including direct smooth muscle relaxation and autonomic effects.', timelineStages: [{ stageId: 1, label: 'Drug-induced constipation', typicalHoursFromOnset: [0, 168], dominantSymptoms: [sym('constipation', 0.8, 0.5), sym('constipation_medication_related', 0.9, 0.75)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild cramping', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Persists while medication is continued. May require dose adjustment or bowel regimen.' },
  features: { symptoms: [sym('constipation', 0.8, 0.5, { stageRelevance: [1] }), sym('constipation_medication_related', 0.9, 0.75, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.6, 0.7, { stageRelevance: [1] }), sym('constipation_bloating', 0.4, 0.7, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.3, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('constipation_weight_loss', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No weight loss suggests drug effect rather than organic disease' })], supporting: [] },
  differential: { mimics: ['functional_constipation', 'opioid_constipation', 'iron_constipation', 'colorectal_cancer_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation', featureIds: ['constipation_medication_related'] }, { fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding'] }], neverCloseConditions: [] },
  complications: [{ name: 'Poor medication adherence', warningFeatures: ['constipation_severe'], riskFactors: ['no_bowel_regimen'], timeWindowHours: [168, 2160], severityTier: 'mild', description: 'Constipation may lead patients to reduce or stop their antiepileptic medication, risking seizure recurrence.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding'],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'drug_induced', typicalDescription: 'Constipation that began after starting antiepileptic medication. Stools are hard and require straining. No alarm features.' },
};

export const antihistamine_constipation: DiseaseNode = {
  id: 'antihistamine_constipation', name: 'Antihistamine-Induced Constipation', icdCode: 'K59.4', system: 'medical',
  organSystem: 'GI', acuity: 'routine', acuityTier: 4,
  epidemiology: { ageMin: 10, ageMax: 80, agePeak: [30, 60], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.003, riskFactors: [] },
  pathophysiology: { mechanism: 'First-generation antihistamines (diphenhydramine, hydroxyzine) have significant anticholinergic properties that reduce gastrointestinal smooth muscle contractility and slow colonic transit. Second-generation antihistamines have minimal anticholinergic effect and rarely cause constipation.', timelineStages: [{ stageId: 1, label: 'Antihistamine constipation', typicalHoursFromOnset: [0, 72], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('constipation_medication_related', 0.85, 0.75)], examFindings: [], severityTrajectory: 'stable', painCharacterTypical: 'Mild lower abdominal discomfort', painLocationTypical: 'Lower abdomen', painRadiationTypical: 'None' }], progressionRule: 'Reversible upon discontinuation. Constipation persists while medication is taken.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('constipation_medication_related', 0.85, 0.75, { stageRelevance: [1] }), sym('constipation_stool_consistency', 0.5, 0.7, { stageRelevance: [1] }), sym('dry_mouth', 0.6, 0.7, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [sym('constipation_weight_loss', 0, 0, { sensitivity: 0, specificity: 0, LR_negative: 0.1, label: 'No weight loss suggests drug effect rather than organic disease' })], supporting: [] },
  differential: { mimics: ['functional_constipation', 'opioid_constipation', 'anticholinergic_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'functional_constipation', featureIds: ['constipation_medication_related'] }, { fromDiseaseId: 'anticholinergic_constipation', featureIds: ['dry_mouth', 'medication_history'] }], neverCloseConditions: [] },
  complications: [{ name: 'Fecal impaction in elderly', warningFeatures: ['constipation_overflow', 'constipation_abdominal_distension'], riskFactors: ['elderly', 'polypharmacy'], timeWindowHours: [720, 4320], severityTier: 'moderate', description: 'Elderly patients on antihistamines are at increased risk of fecal impaction due to combined anticholinergic effect and reduced mobility.' }],
  clinicalScores: [], redFlagFeatureIds: ['constipation_weight_loss', 'constipation_rectal_bleeding'],
  constipationManifestation: { duration: 'chronic', frequency: 'mild_3_5_per_week', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'no', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'no', associatedSymptoms: ['none'], mechanism: 'drug_induced', typicalDescription: 'Constipation temporally related to starting antihistamine medication. Associated dry mouth suggests anticholinergic effect. No alarm features.' },
};

// ── SECTION 22: HEPATOBILIARY ────────────────────────────────

export const hepatobiliary_constipation: DiseaseNode = {
  id: 'hepatobiliary_constipation', name: 'Advanced Liver Disease / Ascites (Constipation Presentation)', icdCode: 'K74.6', system: 'medical',
  organSystem: 'hepatobiliary', acuity: 'semi_urgent', acuityTier: 3,
  epidemiology: { ageMin: 30, ageMax: 80, agePeak: [45, 70], sexRisk: { male: 1.5, female: 1 }, backgroundPrevalence: 0.002, riskFactors: [] },
  pathophysiology: { mechanism: 'Advanced liver disease causes constipation through multiple mechanisms: (1) massive ascites increases intra-abdominal pressure, compressing the colon and impairing peristalsis; (2) hepatic encephalopathy and its treatment (lactulose) cause alternating diarrhoea and constipation; (3) reduced oral intake, electrolyte disturbances, and autonomic dysfunction contribute.', timelineStages: [{ stageId: 1, label: 'Cirrhosis with altered bowel habit', typicalHoursFromOnset: [0, 4320], dominantSymptoms: [sym('constipation', 0.5, 0.5), sym('abdominal_distension', 0.9, 0.7)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull diffuse abdominal discomfort', painLocationTypical: 'Generalised abdomen', painRadiationTypical: 'None' }], progressionRule: 'Constipation fluctuates with ascites volume and encephalopathy treatment. Paracentesis may temporarily improve symptoms.' },
  features: { symptoms: [sym('constipation', 0.5, 0.5, { stageRelevance: [1] }), sym('abdominal_distension', 0.9, 0.7, { stageRelevance: [1] }), sym('leg_swelling', 0.7, 0.7, { stageRelevance: [1] }), sym('jaundice', 0.6, 0.9, { stageRelevance: [1] }), sym('weight_loss', 0.6, 0.85, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['functional_constipation', 'colorectal_cancer_constipation', 'ovarian_mass_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['leg_swelling', 'jaundice'] }, { fromDiseaseId: 'ovarian_mass_constipation', featureIds: ['jaundice', 'alcohol_use'] }], neverCloseConditions: [] },
  complications: [{ name: 'Spontaneous bacterial peritonitis', warningFeatures: ['fever', 'abdominal_pain', 'confusion'], riskFactors: ['ascites', 'low_protein_ascites'], timeWindowHours: [24, 168], severityTier: 'severe', description: 'Constipation with ascites can precipitate bacterial translocation. SBP is a life-threatening complication of cirrhosis.' }],
  clinicalScores: [], redFlagFeatureIds: ['fever', 'abdominal_distension', 'hematemesis'],
  constipationManifestation: { duration: 'chronic', frequency: 'variable', stoolConsistency: 'hard_pellets', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'no', bloating: 'yes', bleeding: 'variable', associatedSymptoms: ['abdominal_distension', 'weight_loss'], mechanism: 'mixed', typicalDescription: 'Constipation in a patient with known liver disease, associated with abdominal distension from ascites, leg swelling, and jaundice. Bowel habit may alternate with lactulose-induced diarrhoea.' },
};

// ── SECTION 23: METASTATIC DISEASE ───────────────────────────

export const metastatic_constipation: DiseaseNode = {
  id: 'metastatic_constipation', name: 'Metastatic Malignancy Causing Constipation', icdCode: 'C78.6', system: 'surgical',
  organSystem: 'GI', acuity: 'urgent', acuityTier: 2,
  epidemiology: { ageMin: 30, ageMax: 90, agePeak: [50, 75], sexRisk: { male: 1, female: 1 }, backgroundPrevalence: 0.001, riskFactors: [] },
  pathophysiology: { mechanism: 'Metastatic disease causes constipation through: (1) peritoneal carcinomatosis causing extrinsic compression or tethering of bowel loops; (2) malignant ascites increasing intra-abdominal pressure; (3) retroperitoneal lymphadenopathy compressing the rectum or sigmoid; (4) malignant infiltration of the enteric nerve plexus; (5) paraneoplastic autonomic dysfunction.', timelineStages: [{ stageId: 1, label: 'Metastatic constipation', typicalHoursFromOnset: [0, 2160], dominantSymptoms: [sym('constipation', 0.7, 0.5), sym('weight_loss', 0.9, 0.85)], examFindings: [], severityTrajectory: 'worsening', painCharacterTypical: 'Dull, progressive abdominal pain', painLocationTypical: 'Variable, depending on metastasis site', painRadiationTypical: 'Varies' }], progressionRule: 'Progressive as metastatic burden increases. May require palliative stenting or diversion.' },
  features: { symptoms: [sym('constipation', 0.7, 0.5, { stageRelevance: [1] }), sym('weight_loss', 0.9, 0.85, { stageRelevance: [1] }), sym('anorexia', 0.8, 0.7, { stageRelevance: [1] }), sym('abdominal_distension', 0.6, 0.75, { stageRelevance: [1] }), sym('constipation_abdominal_pain', 0.6, 0.65, { stageRelevance: [1] })], signs: [], investigations: [] },
  importantNegatives: { rulingOut: [], supporting: [] },
  differential: { mimics: ['colorectal_cancer_constipation', 'rectal_cancer', 'ovarian_mass_constipation', 'pelvic_malignancy_constipation'], distinguishingFeatures: [{ fromDiseaseId: 'colorectal_cancer_constipation', featureIds: ['known_malignancy', 'anorexia'] }, { fromDiseaseId: 'pelvic_malignancy_constipation', featureIds: ['weight_loss'] }], neverCloseConditions: [] },
  complications: [{ name: 'Malignant bowel obstruction', warningFeatures: ['constipation_obstipation', 'constipation_vomiting', 'feculent_vomiting'], riskFactors: ['peritoneal_carcinomatosis'], timeWindowHours: [168, 2160], severityTier: 'severe', description: 'Metastatic disease frequently causes malignant bowel obstruction requiring palliative surgical or endoscopic intervention.' }],
  clinicalScores: [], redFlagFeatureIds: ['weight_loss', 'constipation_obstipation', 'constipation_vomiting'],
  constipationManifestation: { duration: 'chronic', frequency: 'severe_less_than_1_per_week', stoolConsistency: 'ribbon_like', straining: 'yes', incompleteEvacuation: 'yes', manualManeuvers: 'no', abdominalPain: 'yes_not_relieved', bloating: 'yes', bleeding: 'variable', associatedSymptoms: ['weight_loss', 'vomiting', 'abdominal_distension'], mechanism: 'mechanical_obstruction', typicalDescription: 'Progressive constipation in a patient with known malignancy. Profound weight loss, anorexia, and abdominal distension suggest peritoneal or retroperitoneal metastatic involvement.' },
};

// EXPORT LIST
// ═══════════════════════════════════════════════════════════════════════════════

export const CONSTIPATION_NODES: DiseaseNode[] = [
  functional_constipation,
  ibs_constipation,
  slow_transit_constipation,
  pelvic_floor_dyssynergia,
  low_fiber_constipation,
  dehydration_constipation,
  colorectal_cancer_constipation,
  diverticular_stricture,
  radiation_stricture,
  crohn_stricture,
  sigmoid_volvulus,
  cecal_volvulus,
  fecal_impaction,
  rectocele,
  enterocele,
  rectal_prolapse,
  anal_stenosis,
  severe_hemorrhoids,
  anal_fissure,
  anorectal_malformation,
  parkinson_constipation,
  multiple_sclerosis_constipation,
  stroke_constipation,
  dementia_constipation,
  brain_tumor_constipation,
  spinal_cord_injury_constipation,
  cauda_equina_constipation,
  spina_bifida_constipation,
  spinal_tumor_constipation,
  hirschsprung_disease,
  chagas_constipation,
  hypothyroidism_constipation,
  diabetic_constipation,
  hyperparathyroid_constipation,
  pregnancy_constipation,
  hypopituitarism_constipation,
  hypercalcemia_constipation,
  hypokalemia_constipation,
  uremia_constipation,
  porphyria_constipation,
  hypermagnesemia_constipation,
  opioid_constipation,
  anticholinergic_constipation,
  tca_constipation,
  antipsychotic_constipation,
  ccb_constipation,
  iron_constipation,
  aluminum_antacid_constipation,
  chemotherapy_constipation,
  chronic_intestinal_pseudo_obstruction,
  postoperative_ileus,
  colonic_inertia,
  systemic_sclerosis_constipation,
  ovarian_mass_constipation,
  uterine_fibroids_constipation,
  pelvic_malignancy_constipation,
  prostate_enlargement_constipation,
  endometriosis_constipation,
  pelvic_congestion_constipation,
  diverticulitis_constipation,
  anal_tuberculosis_constipation,
  amyloidosis_constipation,
  dermatomyositis_constipation,
  functional_constipation_child,
  meconium_ileus,
  celiac_disease_constipation,
  cystic_fibrosis_constipation,
  depression_constipation,
  eating_disorder_constipation,
  somatic_symptom_constipation,
  geriatric_multifactorial_constipation,
  immobility_constipation,
  anorexia_nervosa_constipation,
  rectal_cancer,
  pancreatic_cancer_constipation,
  antiepileptic_constipation,
  antihistamine_constipation,
  hepatobiliary_constipation,
  metastatic_constipation
];
