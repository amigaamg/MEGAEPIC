// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Question Selection Engine
// Picks the single best next question using Expected Information Gain
// with pathophysiological phase-gating.
// Never asks a feature already answered or covered by a chief complaint.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pathophysiological phases that every symptom workup follows.
 * Questions are constrained to their phase — the engine only advances
 * when the current phase has sufficient answers. This ensures the
 * clinical narrative unfolds in the correct order:
 *
 * ONSET → LOCATION → CHARACTER → EVOLUTION → ASSOCIATED → CONFIRM → RISK → EXAM
 */
const PATHOPHYS_PHASES = [
  { id: 'onset',       label: 'Onset & Timing',        minAnswers: 1, features: ['pain_onset', 'pain_onset_sudden', 'vomiting_onset', 'distension_onset', 'diarrhoea_onset', 'constipation_onset', 'dysphagia_onset', 'hematemesis_onset'] },
  { id: 'location',    label: 'Location & Radiation',  minAnswers: 1, features: ['pain_initial_location', 'pain_location_now', 'pain_migration', 'pain_radiation', 'distension_site', 'dysphagia_level', 'hematemesis_origin'] },
  { id: 'character',   label: 'Character & Severity',  minAnswers: 1, features: ['pain_character', 'pain_severity', 'pain_worsening_factors', 'pain_relieving_factors', 'vomiting_description', 'vomiting_bilious', 'vomiting_projectile', 'vomiting_frequency', 'vomiting_force', 'distension_character', 'diarrhoea_stool_type', 'diarrhoea_frequency', 'constipation_stool_consistency', 'constipation_stool_frequency', 'dysphagia_solids_liquids', 'dysphagia_odynophagia', 'hematemesis_color', 'hematemesis_volume', 'melena_volume', 'hematochezia_color', 'hematochezia_volume'] },
  { id: 'evolution',   label: 'Evolution & Timing',    minAnswers: 0, features: ['pain_location_now', 'pain_migration', 'vomiting_timing', 'vomiting_relation_to_eating', 'vomiting_relief', 'distension_pain_relation', 'distension_gas_passage_relief', 'diarrhoea_duration', 'diarrhoea_nocturnal', 'constipation_duration', 'dysphagia_progressive', 'dysphagia_duration', 'hematemesis_timing', 'melena_timing'] },
  { id: 'associated',  label: 'Associated Symptoms',   minAnswers: 0, features: ['nausea', 'vomiting', 'anorexia', 'fever', 'fever_chills', 'abdominal_distension', 'obstipation', 'diarrhea', 'constipation', 'melena', 'hematochezia', 'hematemesis', 'dysuria', 'hematuria', 'chest_pain', 'dyspnea', 'cough', 'syncope', 'jaundice', 'flank_pain', 'dyspareunia', 'vaginal_bleeding', 'vaginal_discharge', 'last_menstrual_period', 'rebound_history', 'early_satiety', 'belching', 'heartburn', 'leg_swelling', 'steatorrhea', 'diarrhoea_fever', 'diarrhoea_dehydration', 'diarrhoea_travel_related', 'diarrhoea_antibiotics_related', 'diarrhoea_flushing', 'diarrhoea_weight_loss', 'diarrhoea_perianal', 'diarrhoea_oral_ulcers', 'diarrhoea_arthritis'] },
  { id: 'confirm',     label: 'Confirmation',           minAnswers: 0, features: ['peritonism', 'rigidity', 'guarding', 'rebound_history', 'bowel_habits', 'obstipation', 'vomiting_bilious', 'vomiting_feculent', 'anorexia', 'distension_site', 'distension_character'] },
  { id: 'risk',        label: 'Risk Factors',           minAnswers: 0, features: ['prior_abdominal_surgery', 'smoking', 'alcohol_use', 'nsaid_use', 'steroid_use', 'anticoagulant_use', 'recent_travel', 'family_history_gi_cancer', 'known_gallstones', 'diabetes', 'htn_cad', 'previous_similar_episodes', 'pregnancy_status'] },
  { id: 'impact',      label: 'Impact & Context',       minAnswers: 0, features: ['weight_loss', 'fatigue', 'night_sweats', 'pain_duration_hours', 'cough', 'dyspnea', 'urinary_frequency', 'urinary_retention'] },
];

import type {
  DiseaseNode, EncounterState, CandidateDiseaseState,
  FeatureRecord, AnswerRecord, ConvergenceState,
} from '../knowbase/diseaseNode';
import { ABDOMINAL_PAIN_DISEASE_MAP } from '../knowbase/diseases/abdominalPainNodes';
import { FEATURES } from '../knowbase/features/featureLibrary';
import { getLrPlus, getLrMinus } from '../knowbase/features/featureLibrary';
import { getHighway, getActiveHighways } from '../highways/abdominalPain';
import { selectNextQuestionClinical, type ClinicalReasoningStep } from './clinicalReasoningEngine';

export interface NextQuestion {
  featureId: string;
  label: string;
  shortLabel: string;
  type: 'boolean' | 'select' | 'multi_select' | 'number' | 'text';
  options?: string[];
  rationale: string;               // Why this question is being asked
  sourceDiseaseId: string;         // Which disease this most helps discriminate
  informationGain: number;         // Raw EIG score
  priority: number;                // clinical round 1-5
  clinicalGuide?: string;
}

/** Compute expected information gain for a single feature.
 *  Falls back to the feature library's own sens/spec if not found in a specific disease node. */
function computeEig(
  featureId: string,
  candidates: CandidateDiseaseState[],
  diseaseMap: Map<string, DiseaseNode>,
): number {
  let eig = 0;
  const libFeature = FEATURES[featureId];

  for (const candidate of candidates) {
    const disease = diseaseMap.get(candidate.diseaseId);
    if (!disease || candidate.currentProb < 0.01) continue;

    // Find matching feature in the disease's feature table
    const allFeatures = [
      ...disease.features.symptoms,
      ...disease.features.signs,
      ...disease.features.investigations,
    ];
    const feature = allFeatures.find(f => f.featureId === featureId) || libFeature;
    if (!feature) continue;

    const p = candidate.currentProb;
    const lrp = feature.LR_positive ?? (feature.sensitivity / (1 - feature.specificity));
    const lrm = feature.LR_negative ?? ((1 - feature.sensitivity) / feature.specificity);

    const pPresent = feature.sensitivity * p + (1 - feature.specificity) * (1 - p);
    const pAbsent = 1 - pPresent;

    const postPresent = (p * lrp) / (p * lrp + (1 - p));
    const postAbsent = (p * lrm) / (p * lrm + (1 - p));

    const currentEntropy = -p * Math.log2(p + 0.0001) - (1 - p) * Math.log2(1 - p + 0.0001);
    const entPresent = -postPresent * Math.log2(postPresent + 0.0001) - (1 - postPresent) * Math.log2(1 - postPresent + 0.0001);
    const entAbsent = -postAbsent * Math.log2(postAbsent + 0.0001) - (1 - postAbsent) * Math.log2(1 - postAbsent + 0.0001);

    const gain = currentEntropy - (pPresent * entPresent + pAbsent * entAbsent);
    eig += gain * p;
  }

  return eig;
}

/** Map a feature to its clinical round priority */
function getFeaturePriority(featureId: string): number {
  // Round 1: Triage — onset, location, severity, red flags
  const triage = ['pain_onset', 'pain_onset_sudden', 'pain_initial_location',
    'pain_severity', 'syncope', 'peritonism', 'rigidity', 'pain_character',
    'pain_location_now', 'pain_migration'];
  // Round 2: Evolution — character, radiation, associated GI
  const evolution = ['pain_character', 'pain_radiation', 'pain_migration',
    'nausea', 'vomiting', 'vomiting_timing', 'vomiting_description', 'vomiting_bilious',
    'vomiting_projectile', 'vomiting_frequency', 'anorexia', 'fever',
    'pain_worsening_factors', 'pain_relieving_factors', 'pain_location_now'];
  // Round 3: Confirmation — disease-specific features
  const confirmation = ['vomiting_relation_to_eating', 'vomiting_relief', 'vomiting_force',
    'fever_chills', 'rebound_history', 'guarding', 'peritonism',
    'bowel_habits', 'diarrhea', 'constipation', 'obstipation',
    'melena', 'hematochezia', 'hematemesis', 'dysuria', 'hematuria',
    'flank_pain', 'vaginal_discharge', 'vaginal_bleeding',
    'last_menstrual_period', 'dyspareunia', 'abdominal_distension',
    'jaundice', 'heartburn', 'belching', 'chest_pain', 'dyspnea'];
  // Round 4: Risk factors
  const risk = ['prior_abdominal_surgery', 'smoking', 'alcohol_use',
    'nsaid_use', 'steroid_use', 'recent_travel', 'family_history_gi_cancer',
    'known_gallstones', 'diabetes', 'htn_cad', 'anticoagulant_use',
    'previous_similar_episodes', 'pregnancy_status'];
  // Round 5: Impact / treatment
  const impact = ['pain_duration_hours', 'weight_loss', 'fatigue', 'night_sweats',
    'cough', 'dyspnea', 'urinary_frequency', 'urinary_retention'];

  if (triage.includes(featureId)) return 1;
  if (evolution.includes(featureId)) return 2;
  if (confirmation.includes(featureId)) return 3;
  if (risk.includes(featureId)) return 4;
  if (impact.includes(featureId)) return 5;
  return 3; // default to confirmation
}

/** Generate rationale for asking this question */
function generateRationale(
  featureId: string,
  topCandidate: CandidateDiseaseState | null,
  candidates: CandidateDiseaseState[],
): string {
  // Red flag override
  if (featureId === 'syncope') return 'CRITICAL: Syncope suggests haemodynamic instability. Must be addressed immediately.';
  if (featureId === 'peritonism') return 'CRITICAL: Peritoneal irritation indicates a surgical abdomen. Requires immediate evaluation.';
  if (featureId === 'rigidity') return 'CRITICAL: Abdominal rigidity suggests generalised peritonitis. Surgical emergency.';

  if (!topCandidate) return 'Characterising the pain to narrow the differential.';

  // For the leading candidate, explain what we're trying to confirm/rule out
  const diseaseName = topCandidate.diseaseName;
  const prob = Math.round(topCandidate.currentProb * 100);

  switch (featureId) {
    case 'pain_initial_location':
      return `The initial pain site tells us which organ was first involved. Midgut → periumbilical, Foregut → epigastric. Currently, ${diseaseName} is leading (${prob}%).`;
    case 'pain_migration':
      return `Pain migration patterns are pathognomonic. Periumbilical → RLQ is classic for appendicitis. This is the single most discriminating feature.`;
    case 'pain_character':
      return `Colicky pain suggests hollow viscus obstruction. Constant sharp pain suggests inflammation. Tearing suggests vascular catastrophe.`;
    case 'pain_radiation':
      return `Radiation follows the affected organ's nerve supply. Back → pancreas/shoulder → biliary/groin → ureter.`;
    case 'pain_onset':
      return `Sudden onset suggests perforation, rupture, or ischaemia. Gradual onset suggests inflammation.`;
    case 'anorexia':
      return `Anorexia is a sensitive indicator of surgical pathology. Absence of anorexia reduces appendicitis likelihood (LR− 0.35).`;
    case 'vomiting_timing':
      return `Vomiting before pain suggests gastroenteritis. Vomiting after pain onset suggests surgical cause (obstruction, appendicitis).`;
    case 'last_menstrual_period':
      return `Essential for all reproductive-age women — ectopic pregnancy is a surgical emergency and must be excluded.`;
    case 'peritonism':
      return `Peritoneal irritation means inflammation has reached the parietal peritoneum — this is a surgical abdomen.`;
    case 'obstipation':
      return `Obstipation (no gas or stool) is the hallmark of intestinal obstruction. Its absence strongly rules out complete obstruction (LR− 0.05).`;
    case 'fever_chills':
      return `Rigors suggest systemic infection or abscess formation — a marker of complicated disease.`;
    case 'syncope':
      return `Fainting suggests significant volume loss (ruptured AAA, ectopic, GI bleed) or vagal response. Requires immediate attention.`;
    case 'pain_location_now':
      return `Current pain location compared with initial location reveals the disease's progression.`;
    case 'vomiting_bilious':
      return `Bilious (green) vomiting suggests obstruction distal to the ampulla of Vater. This is a critical feature for distinguishing surgical from medical causes.`;
    case 'vomiting_projectile':
      return `Projectile vomiting suggests raised intracranial pressure or pyloric stenosis. This is a high-risk neurological or surgical feature.`;
    case 'vomiting_relation_to_eating':
      return `The relationship of vomiting to meals helps distinguish gastric outlet obstruction (postprandial) from inflammatory causes (unrelated).`;
    case 'vomiting_relief':
      return `Vomiting that relieves pain is classic for bowel obstruction. Vomiting that does NOT relieve suggests inflammation (pancreatitis, appendicitis).`;
    case 'vomiting_force':
      return `The force of vomiting helps distinguish projectile (CNS/pyloric) from non-projectile (most other causes).`;
    case 'vomiting_frequency':
      return `Frequency of vomiting indicates severity. Continuous vomiting suggests high-grade obstruction or severe metabolic disturbance.`;
    case 'distension_site':
      return `Localising the distension (generalised vs upper vs lower) immediately narrows the differential from over 100 to fewer than 10 causes.`;
    case 'distension_onset':
      return `Sudden distension suggests obstruction or ileus. Gradual distension suggests ascites, tumour, or pregnancy.`;
    case 'distension_character':
      return `Tight/tense distension suggests ascites or obstruction. Soft bloating suggests IBS or functional causes.`;
    case 'distension_pain_relation':
      return `Pain preceding distension suggests inflammation → ileus. Distension preceding pain suggests obstruction.`;
    case 'distension_gas_passage_relief':
      return `Distension relieved by passing gas suggests IBS or non-obstructive gas. No relief raises suspicion for ascites or fixed distension.`;
    case 'obstipation':
      return `Complete absence of stool and flatus is the hallmark of intestinal obstruction until proven otherwise.`;
    case 'early_satiety':
      return `Early satiety with distension is a red flag for ovarian cancer, gastric cancer, or massive ascites.`;
    case 'leg_swelling':
      return `Leg swelling with abdominal distension suggests systemic fluid overload — cirrhosis, heart failure, or nephrotic syndrome.`;
    case 'abdominal_distension':
      return `Abdominal distension is one of the most anatomically informative symptoms. The associated features will narrow the differential.`;
    case 'diarrhoea_duration':
      return `Duration is the first branch point for diarrhoea: acute (<14 days) suggests infection, chronic (>4 weeks) suggests inflammatory, malabsorptive, or functional causes.`;
    case 'diarrhoea_stool_type':
      return `Stool character is the single most discriminating feature: watery → secretory, bloody → inflammatory/infectious, fatty → malabsorptive, mucoid → IBS/IBD.`;
    case 'diarrhoea_frequency':
      return `Frequency correlates with severity and helps distinguish secretory (high volume) from inflammatory (low volume, high frequency) causes.`;
    case 'diarrhoea_nocturnal':
      return `Nocturnal diarrhoea is a key distinguishing feature: present in IBD and secretory causes, absent in functional IBS-D.`;
    case 'diarrhoea_fever':
      return `Fever with diarrhoea suggests invasive bacterial infection, perforation, or systemic inflammation — a marker of complicated disease.`;
    case 'diarrhoea_dehydration':
      return `Dehydration severity is the critical determinant of treatment urgency in acute diarrhoea — drives the need for IV fluids and hospitalisation.`;
    case 'steatorrhea':
      return `Steatorrhoea (fatty, pale, foul, floating stools) is pathognomonic for malabsorption — pancreatic insufficiency, coeliac, SIBO, bile acid malabsorption.`;
    case 'diarrhoea_travel_related':
      return `Travel history dramatically shifts the differential to infectious causes — ETEC, giardia, cryptosporidium, amoebic dysentery, typhoid.`;
    case 'diarrhoea_antibiotics_related':
      return `Antibiotic-associated diarrhoea raises the critical possibility of C. difficile colitis — requires specific testing and isolation.`;
    case 'diarrhoea_flushing':
      return `Flushing with diarrhoea is highly suggestive of carcinoid syndrome or VIPoma — rare but important neuroendocrine causes.`;
    case 'diarrhoea_weight_loss':
      return `Weight loss with diarrhoea suggests malabsorption, IBD, malignancy, or chronic infection — never dismiss as functional.`;
    case 'diarrhoea_perianal':
      return `Perianal involvement (fissures, fistulae) with diarrhoea strongly suggests Crohn disease.`;
    case 'diarrhoea_oral_ulcers':
      return `Oral ulcers with diarrhoea suggest Crohn disease or Behçet disease.`;
    case 'diarrhoea_arthritis':
      return `Arthritis with diarrhoea suggests reactive arthritis, IBD, or Whipple disease.`;
    case 'diarrhoea_rash':
      return `Rash with diarrhoea suggests HSP, coeliac (DH), carcinoid, or infectious exanthems.`;
    case 'constipation_duration':
      return `Duration is the first branch point: acute constipation suggests obstruction, lifelong suggests Hirschsprung, chronic suggests functional/endocrine/neurological.`;
    case 'constipation_stool_frequency':
      return `Frequency helps distinguish slow transit (rare stools) from outlet obstruction (normal frequency but difficulty).`;
    case 'constipation_stool_consistency':
      return `Stool consistency is highly discriminating: hard pellets suggest slow transit, ribbon-like suggests distal obstruction, overflow suggests impaction.`;
    case 'constipation_straining':
      return `Straining suggests functional constipation or outlet obstruction — helps distinguish from slow transit where the urge is absent.`;
    case 'constipation_incomplete_evacuation':
      return `Incomplete evacuation suggests rectal or pelvic floor dysfunction rather than colonic slow transit.`;
    case 'constipation_manual_maneuvers':
      return `Need for manual maneuvers is pathognomonic for pelvic floor dyssynergia or rectocele — a highly specific feature.`;
    case 'constipation_obstipation':
      return `Absolute constipation (no gas or stool) is a surgical emergency — complete bowel obstruction until proven otherwise.`;
    case 'constipation_abdominal_pain':
      return `Pain relieved by defecation suggests IBS-C. Pain not relieved raises suspicion for mechanical obstruction or malignancy.`;
    case 'constipation_bloating':
      return `Bloating with constipation is common in IBS-C and functional constipation but also suggests obstruction or pseudo-obstruction.`;
    case 'constipation_rectal_bleeding':
      return `Rectal bleeding with constipation is a red flag — colorectal cancer, anal fissure, or haemorrhoids until proven otherwise.`;
    case 'constipation_overflow':
      return `Overflow diarrhoea (watery leakage around hard stool) is a classic exam trap — patient reports diarrhoea but is severely constipated.`;
    case 'constipation_neurological':
      return `Neurological symptoms with constipation suggest spinal cord pathology, Parkinson disease, or MS — a red flag for CNS disease.`;
    case 'constipation_endocrine':
      return `Endocrine symptoms (cold intolerance, weight gain, fatigue) point to hypothyroidism as the underlying cause.`;
    case 'constipation_medication_related':
      return `Medication history is essential — opioids, iron, calcium channel blockers, and anticholinergics are common reversible causes.`;
    case 'constipation_weight_loss':
      return `Weight loss with constipation is a red flag for colorectal cancer, ovarian cancer, or advanced systemic disease.`;
    case 'constipation_vomiting':
      return `Vomiting with constipation suggests mechanical bowel obstruction until proven otherwise — a surgical emergency.`;
    case 'constipation_abdominal_distension':
      return `Abdominal distension with constipation raises suspicion for obstruction, volvulus, megacolon, or faecal impaction.`;
    case 'constipation_painful_defecation':
      return `Painful defecation suggests anal fissure — the pain → fear → retention → worse constipation cycle is classic.`;
    case 'constipation_dietary_fiber':
      return `Low dietary fibre is the most common reversible cause of constipation — always ask before investigating.`;
    case 'constipation_fluid_intake':
      return `Inadequate fluid intake is a common reversible contributor — always establish baseline hydration.`;
    case 'dysphagia':
      return `Dysphagia is the entry feature — the first discriminator is oropharyngeal (difficulty initiating swallow, coughing, nasal regurgitation) versus esophageal (food sticking retrosternally).`;
    case 'dysphagia_solids_liquids':
      return `Dysphagia to solids only suggests mechanical obstruction (stricture, ring, web, tumour). Dysphagia to both solids and liquids from onset suggests motility disorder (achalasia, DES, scleroderma).`;
    case 'dysphagia_progressive':
      return `Progressive dysphagia is the hallmark of malignancy or benign stricture. Intermittent dysphagia favours Schatzki ring, eosinophilic esophagitis, or diffuse esophageal spasm.`;
    case 'dysphagia_odynophagia':
      return `Painful swallowing (odynophagia) points to infectious esophagitis (Candida, HSV, CMV), pill esophagitis, or severe reflux — features of mucosal inflammation.`;
    case 'dysphagia_regurgitation':
      return `Regurgitation of undigested food suggests achalasia or Zenker diverticulum. Regurgitation of sour/bitter fluid suggests GERD.`;
    case 'dysphagia_onset':
      return `Acute onset (hours-days) suggests foreign body, stroke, or acute infection. Subacute (weeks) suggests malignancy or stricture. Chronic (months-years) suggests motility disorder or benign process.`;
    case 'dysphagia_aspiration':
      return `Coughing/choking during swallowing is the hallmark of oropharyngeal dysphagia — neurological, ENT, or structural pharyngeal causes. Silent aspiration is a critical finding.`;
    case 'dysphagia_level':
      return `The level where food gets stuck is highly localising: throat/neck suggests oropharyngeal pathology, retrosternal suggests mid-esophagus, lower chest suggests distal esophageal disease.`;
    case 'dysphagia_weight_loss':
      return `Weight loss with dysphagia is a red flag for malignancy (esophageal, gastric, oropharyngeal), achalasia, or severe inflammatory stricture — must be investigated urgently.`;
    case 'dysphagia_neck_mass':
      return `A neck mass with dysphagia raises suspicion for thyroid malignancy, goiter, oropharyngeal tumour, or Zenker diverticulum — requires imaging.`;
    case 'dysphagia_hoarseness':
      return `Hoarseness with dysphagia suggests recurrent laryngeal nerve involvement by esophageal/lung/thyroid malignancy — a sign of advanced disease.`;
    case 'dysphagia_heartburn':
      return `Heartburn with dysphagia suggests peptic stricture from chronic GERD, or eosinophilic esophagitis — the reflux history is key.`;
    case 'dysphagia_neurological':
      return `Neurological symptoms with dysphagia suggest bulbar/pseudobulbar palsy, stroke, MND/ALS, Parkinson, or MS — oropharyngeal dysphagia needs full neurological evaluation.`;
    case 'dysphagia_nasal_regurgitation':
      return `Nasal regurgitation is pathognomonic for oropharyngeal dysphagia — suggests CVA, bulbar palsy, myasthenia gravis, or structural palatal defect.`;
    case 'dysphagia_drooling':
      return `Difficulty managing saliva suggests severe oropharyngeal dysphagia with high aspiration risk — seen in advanced neurological disease or epiglottitis.`;
    case 'dysphagia_alcohol_smoking':
      return `Smoking and alcohol are the two strongest risk factors for squamous cell esophageal and oropharyngeal carcinoma — essential risk stratification.`;
    case 'dysphagia_caustic':
      return `Previous caustic ingestion is a high-risk factor for chronic esophageal stricture — and increases the risk of squamous cell carcinoma decades later.`;
    case 'dysphagia_medication_induced':
      return `Several medications cause pill esophagitis (doxycycline, bisphosphonates, KCl, NSAIDs, iron) — always review drug history.`;
    case 'odynophagia':
      return `Odynophagia without significant dysphagia suggests mucosal inflammation — infectious esophagitis, pill injury, or GERD. In immunocompromised patients, this is a red flag.`;
    case 'odynophagia_location':
      return `The location of pain on swallowing helps localise the inflammation — throat suggests pharyngitis, retrosternal suggests esophagitis, radiating to back suggests deep ulcer or perforation.`;
    case 'odynophagia_pain_character':
      return `Burning pain suggests reflux or Candida esophagitis. Sharp/stabbing pain suggests HSV or pill-induced ulceration. Deep ache suggests deep ulcer or malignancy.`;
    case 'odynophagia_fever':
      return `Fever with odynophagia suggests infectious esophagitis (Candida, HSV, CMV) or deep neck infection (retropharyngeal abscess, epiglottitis) — requires urgent evaluation.`;
    case 'odynophagia_immunocompromised':
      return `Immunocompromised status (HIV, chemotherapy, transplant, steroids) dramatically shifts the differential to opportunistic infections — Candida, HSV, CMV, and aphthous esophagitis.`;
    case 'hematemesis':
      return `Hematemesis (vomiting blood) is always upper GI bleeding until proven otherwise. The colour and volume are the first critical discriminators.`;
    case 'hematemesis_color':
      return `Coffee-ground appearance suggests slower gastric bleeding (partially digested blood). Bright red suggests active arterial bleeding or variceal rupture.`;
    case 'hematemesis_volume':
      return `Volume is the primary severity marker: massive/gushing suggests varices or Dieulafoy lesion; small streaks suggest gastritis or esophagitis.`;
    case 'hematemesis_frequency':
      return `Recurrent episodes suggest an ongoing source (ulcer, varices). Single episode may be from a Mallory-Weiss tear.`;
    case 'melena':
      return `Melena (black tarry stool) indicates digested blood and is classically upper GI bleeding. The volume and duration help estimate total blood loss.`;
    case 'melena_volume':
      return `Profuse melena suggests active UGIB. Spotty melena suggests self-limited bleeding or slow ooze from ulcer/gastritis.`;
    case 'melena_duration_days':
      return `Persistent melena over days indicates ongoing or intermittent bleeding — a marker for recurrent PUD, variceal rebleed, or malignancy.`;
    case 'melena_hematemesis_association':
      return `Concurrent melena and hematemesis suggests a significant upper GI bleed (usually PUD or varices) requiring urgent endoscopy.`;
    case 'hematochezia':
      return `Hematochezia (fresh blood per rectum) is lower GI bleeding until proven otherwise — but a massive UGIB can present as hematochezia due to rapid transit.`;
    case 'hematochezia_color':
      return `Bright red blood suggests distal colonic/rectal/anal source. Maroon suggests right colon or small bowel. Dark red suggests left colon.`;
    case 'hematochezia_volume':
      return `Massive/profuse hematochezia is a surgical emergency — think diverticular bleed, angiodysplasia, or aortoenteric fistula. Streaks suggest hemorrhoids or fissure.`;
    case 'hematochezia_relation_to_stool':
      return `Blood on toilet paper only suggests hemorrhoids. Mixed throughout suggests proximal source. On surface suggests distal colonic or rectal.`;
    case 'hematochezia_frequency':
      return `Single episode may be diverticular. Continuous oozing suggests cancer or angiodysplasia. With every stool suggests IBD.`;
    case 'gi_bleeding_vomiting_first':
      return `Vomiting before blood is the hallmark of Mallory-Weiss tear — the forceful vomiting causes a mucosal tear that then bleeds.`;
    case 'gi_bleeding_painless':
      return `Painless GI bleeding is characteristic of varices, diverticulosis, angiodysplasia, hemorrhoids, and slow-bleeding malignancies. Painful bleeding suggests PUD, IBD, or ischemic colitis.`;
    case 'gi_bleeding_liver_disease':
      return `Liver disease with GI bleeding is a red flag for portal hypertension and variceal hemorrhage — the most immediately life-threatening cause.`;
    case 'gi_bleeding_known_varices':
      return `Known varices with any GI bleeding means variceal rupture until proven otherwise — highest mortality risk, needs urgent endoscopy.`;
    case 'gi_bleeding_known_aaa':
      return `AAA history with GI bleeding is aortoenteric fistula until proven otherwise — a surgical catastrophe requiring immediate CT angiography.`;
    case 'gi_bleeding_dysphagia':
      return `Dysphagia with GI bleeding suggests esophageal pathology — cancer, severe esophagitis, or Mallory-Weiss tear.`;
    case 'gi_bleeding_weight_loss':
      return `Weight loss with GI bleeding is a red flag for malignancy — esophageal, gastric, or colorectal cancer until proven otherwise.`;
    case 'gi_bleeding_prior_gi_bleed':
      return `Prior GI bleeding increases recurrence risk — especially for varices, PUD, and diverticular disease.`;
    case 'gi_bleeding_syncope':
      return `Syncope with GI bleeding indicates massive blood loss with hemodynamic compromise — varices, aortoenteric fistula, or massive ulcer until proven otherwise.`;
    case 'gi_bleeding_iron_deficiency':
      return `Iron deficiency anemia with GI bleeding suggests chronic occult blood loss — colorectal cancer is the primary concern in adults over 50.`;
    default:
      if (featureId.includes('vomiting')) return 'Characterising the vomiting pattern helps distinguish surgical from medical causes and identifies the likely organ system involved.';
      if (featureId.includes('distension') || featureId.includes('bloating')) return 'Characterising the distension pattern helps distinguish obstruction, ascites, tumour, and functional causes.';
      if (featureId.includes('diarrhoea')) return 'Characterising the diarrhoea pattern helps distinguish infectious, inflammatory, malabsorptive, secretory, and functional causes.';
      if (featureId.includes('constipation')) return 'Characterising the constipation pattern helps distinguish functional, mechanical, neurological, endocrine, and drug-induced causes.';
      if (featureId.includes('dysphagia')) return 'Characterising the dysphagia pattern helps distinguish oropharyngeal from esophageal causes and mechanical from motility disorders.';
      if (featureId.includes('odynophagia')) return 'Odynophagia suggests mucosal inflammation — infectious esophagitis, pill injury, GERD, or eosinophilic esophagitis are the key considerations.';
      if (featureId.includes('hematemesis') || featureId.includes('hematochezia') || featureId.includes('melena') || featureId.includes('gi_bleeding')) return 'Characterising the GI bleeding pattern helps localise the source (upper vs lower), estimate severity, and identify the underlying mechanism (acid, varices, vascular, inflammatory, neoplastic).';
      if (featureId.includes('pain')) return 'Pain characterisation is essential for narrowing the differential.';
      return `This feature helps confirm or refute ${diseaseName} (currently ${prob}% probability).`;
  }
}

/** Check if a feature's dependsOn conditions are satisfied by current answers */
function isDependsOnSatisfied(featureId: string, answers: AnswerRecord[]): boolean {
  const feature = FEATURES[featureId];
  if (!feature?.dependsOn) return true;
  const parentAnswer = answers.find(a => a.featureId === feature.dependsOn!.featureId);
  if (!parentAnswer) return false; // parent not yet answered
  // Check if parent answer matches the required value
  const reqVal = feature.dependsOn!.value;
  const actualVal = parentAnswer.value;
  if (typeof reqVal === 'boolean') {
    if (typeof actualVal === 'boolean') return actualVal === reqVal;
    // string boolean like "Yes" or "true"
    if (typeof actualVal === 'string') return (actualVal.toLowerCase() === 'true' || actualVal.startsWith('Yes')) === reqVal;
    return false;
  }
  return String(actualVal) === String(reqVal);
}

/** Get all dependency-satisfied features from the FEATURES library (for characterization follow-ups) */
function getSatisfiedDependentFeatures(answers: AnswerRecord[]): FeatureRecord[] {
  const result: FeatureRecord[] = [];
  for (const [id, feat] of Object.entries(FEATURES)) {
    if (feat.dependsOn && isDependsOnSatisfied(id, answers)) {
      result.push(feat);
    }
  }
  return result;
}

/** Select the next best question to ask */
export function selectNextQuestion(
  state: EncounterState,
  previousQuestionIds: string[],
  diseaseMap: Map<string, DiseaseNode> = ABDOMINAL_PAIN_DISEASE_MAP,
): NextQuestion | null {
  const candidates = state.ddx.activeCandidates;
  const topCandidate = state.ddx.leadingDiagnosis;
  const convergence = state.ddx.convergenceState;

  // Build set of already-answered feature IDs
  const answeredIds = new Set(state.answers.map(a => a.featureId));
  // Also mark features pre-filled from chief complaints as answered
  for (const pf of state.chiefComplaint.preFiledFeatures) {
    answeredIds.add(pf.featureId);
  }

  // ── CLINICAL REASONING ENGINE (checked FIRST -- replaces EIG with rules) ──
  const clinicalStep = selectNextQuestionClinical(state, previousQuestionIds);
  if (clinicalStep) {
    const feature = FEATURES[clinicalStep.featureId];
    if (feature) {
      return {
        featureId: clinicalStep.featureId,
        label: feature.label,
        shortLabel: feature.shortLabel,
        type: feature.type,
        options: feature.options,
        rationale: clinicalStep.rationale,
        sourceDiseaseId: topCandidate?.diseaseId || state.ddx.activeCandidates[0]?.diseaseId || 'abdominal_pain',
        informationGain: 99,
        priority: clinicalStep.priority,
        clinicalGuide: feature.clinicalGuide,
      };
    }
  }

  // ── Override rules (checked in priority order) ─────────────────────────

  // Rule 1: Red flag escalation (only fires when a red flag is ALREADY triggered by a positive answer)
  for (const c of candidates) {
    if (!c.isRedFlagTriggered) continue;
    const disease = diseaseMap.get(c.diseaseId);
    if (!disease) continue;
    // Ask the most discriminating unanswered feature for this red-flagged disease
    const topUnanswered = disease.features.symptoms
      .filter(f => !answeredIds.has(f.featureId))
      .sort((a, b) => (getLrPlus(b) - getLrPlus(a)));
    if (topUnanswered.length > 0) {
      const best = topUnanswered[0];
      return {
        featureId: best.featureId, label: best.label, shortLabel: best.shortLabel,
        type: best.type, options: best.options,
        rationale: `RED FLAG: ${c.diseaseName} is suspected. This feature helps confirm urgently.`,
        sourceDiseaseId: c.diseaseId, informationGain: 999, priority: 1,
        clinicalGuide: best.clinicalGuide,
      };
    }
  }

  // Triage priority: ask initial questions from active highways
  const activeHighways = getActiveHighways(state.chiefComplaint.symptomId, state.chiefComplaint.text);
  const hasInitialAnswer = state.answers.some(a =>
    ['pain_onset', 'pain_initial_location', 'pain_character', 'pain_severity', 'pain_location_now',
      'vomiting_timing', 'vomiting_description', 'vomiting_frequency', 'nausea',
      'distension_onset', 'distension_site', 'distension_character',
      'abdominal_distension', 'obstipation',
      'diarrhoea_duration', 'diarrhoea_stool_type', 'diarrhoea_frequency',
      'constipation_duration', 'constipation_stool_frequency', 'constipation_stool_consistency',
      'constipation_obstipation', 'constipation_abdominal_pain',
      'dysphagia', 'dysphagia_solids_liquids', 'dysphagia_progressive',
      'dysphagia_odynophagia', 'dysphagia_onset', 'dysphagia_aspiration',
      'dysphagia_level', 'dysphagia_weight_loss',
      'hematemesis', 'melena', 'hematochezia',
      'hematemesis_color', 'hematemesis_volume', 'hematochezia_color',
      'hematochezia_volume', 'melena_volume'].includes(a.featureId)
  );
  if (!hasInitialAnswer) {
    // Get initial questions from all active highways
    const initialIds: string[] = [];
    for (const hw of activeHighways) {
      for (const iqId of hw.initialQuestionIds) {
        if (!initialIds.includes(iqId)) initialIds.push(iqId);
      }
    }
    for (const iniId of initialIds) {
      if (!answeredIds.has(iniId)) {
        const feature = FEATURES[iniId];
        if (feature) {
          return {
            featureId: iniId, label: feature.label, shortLabel: feature.shortLabel,
            type: feature.type, options: feature.options,
            rationale: generateRationale(iniId, topCandidate, candidates),
            sourceDiseaseId: activeHighways[0]?.id || 'abdominal_pain', informationGain: 99, priority: 1,
            clinicalGuide: feature.clinicalGuide,
          };
        }
      }
    }
  }

  // Rule 2: Never-close conditions — keep the discriminating question in play
  if (topCandidate) {
    const topDisease = diseaseMap.get(topCandidate.diseaseId);
    if (topDisease && topDisease.differential.neverCloseConditions.length > 0) {
      for (const ncId of topDisease.differential.neverCloseConditions) {
        const ncDisease = diseaseMap.get(ncId);
        if (!ncDisease) continue;
        // Check if any never-close is still in the top 5
        const ncInTop5 = candidates.slice(0, 5).find(c => c.diseaseId === ncId);
        if (ncInTop5) {
          // Find a distinguishing feature not yet asked
          for (const df of topDisease.differential.distinguishingFeatures) {
            if (df.fromDiseaseId === ncId) {
              for (const featureId of df.featureIds) {
                if (!answeredIds.has(featureId) && !previousQuestionIds.includes(featureId)) {
                  const feature = FEATURES[featureId];
                  if (feature) {
                    return {
                      featureId, label: feature.label, shortLabel: feature.shortLabel,
                      type: feature.type, options: feature.options,
                      rationale: `Helpful for distinguishing ${topCandidate.diseaseName} from ${ncDisease.name}.`,
                      sourceDiseaseId: topCandidate.diseaseId, informationGain: 100,
                      priority: 3, clinicalGuide: feature.clinicalGuide,
                    };
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Rule 3: In confirmation mode, ask disease-specific features
  if (convergence === 'confirming' && topCandidate) {
    const disease = diseaseMap.get(topCandidate.diseaseId);
    if (disease) {
      // Ask the highest-LR+ symptom not yet answered
      const unanswered = disease.features.symptoms
        .filter(f => !answeredIds.has(f.featureId) && !previousQuestionIds.includes(f.featureId))
        .sort((a, b) => (getLrPlus(b) - getLrPlus(a)));

      if (unanswered.length > 0) {
        const best = unanswered[0];
        return {
          featureId: best.featureId, label: best.label, shortLabel: best.shortLabel,
          type: best.type, options: best.options,
          rationale: `Confirming ${topCandidate.diseaseName} (${Math.round(topCandidate.currentProb * 100)}%). This feature has LR+ ${getLrPlus(best).toFixed(1)}.`,
          sourceDiseaseId: disease.id, informationGain: 80, priority: 3,
          clinicalGuide: best.clinicalGuide,
        };
      }
    }
  }

  // ── Pathophysiological phase-gating ────────────────────────
  // Determine which phase we are in based on answered questions.
  // Only consider features from the current phase (and earlier phases).
  // This ensures the clinical narrative unfolds in the correct order:
  //   ONSET → LOCATION → CHARACTER → EVOLUTION → ASSOCIATED → CONFIRM → RISK → EXAM
  let currentPhaseIdx = 0;
  for (let i = 0; i < PATHOPHYS_PHASES.length; i++) {
    const phase = PATHOPHYS_PHASES[i];
    const answeredInPhase = phase.features.filter(f => answeredIds.has(f)).length;
    // Advance to next phase only when this phase has enough answers
    if (answeredInPhase >= phase.minAnswers && i < PATHOPHYS_PHASES.length - 1) {
      currentPhaseIdx = i + 1;
    } else {
      break;
    }
  }
  // If EIG-optimal feature is beyond current phase, only allow it if
  // all earlier phases are satisfied AND convergence is ≥ converging.

  // Collect features allowed in current or earlier phases
  const allowedFeatures = new Set<string>();
  for (let i = 0; i <= currentPhaseIdx; i++) {
    for (const f of PATHOPHYS_PHASES[i].features) {
      allowedFeatures.add(f);
    }
  }
  // Also include all disease-specific features from candidates (they may be in any phase)
  const candidateFeatures = new Set<string>();
  for (const c of candidates) {
    const disease = diseaseMap.get(c.diseaseId);
    if (!disease) continue;
    for (const f of disease.features.symptoms) {
      candidateFeatures.add(f.featureId);
      // Add candidate-specific features to allowed set (they'll be checked against phase later)
    }
  }
  // Include dependency-satisfied features
  const dependentFeatures = getSatisfiedDependentFeatures(state.answers);
  for (const df of dependentFeatures) {
    candidateFeatures.add(df.featureId);
  }

  // Compute EIG for each unanswered feature with phase-gating
  const eigResults: { featureId: string; eig: number }[] = [];
  for (const featureId of candidateFeatures) {
    if (answeredIds.has(featureId) || previousQuestionIds.includes(featureId)) continue;

    // PHASE GATE: Features beyond current phase are penalized (not blocked completely,
    // but heavily penalized unless convergence is high enough)
    const featurePhase = PATHOPHYS_PHASES.findIndex(p => p.features.includes(featureId));
    const isBeyondCurrent = featurePhase > currentPhaseIdx;
    const convergence = state.ddx.convergenceState;
    const isConverged = convergence === 'converging' || convergence === 'confirming';

    // Allow ahead-of-phase only if convergence is progressing (we have strong leads)
    if (isBeyondCurrent && !isConverged) continue;  // Block completely if still exploring

    const eig = computeEig(featureId, candidates, diseaseMap);
    if (eig > 0.001) {
      let adjustedEig = eig;
      // Penalize ahead-of-phase features even if converged
      if (isBeyondCurrent) adjustedEig *= 0.3;
      // Apply stage relevance penalty
      const feature = FEATURES[featureId];
      if (feature && feature.stageRelevance.length > 0 && feature.stageRelevance.every(s => s >= 3)) {
        adjustedEig *= 0.3;  // Late-stage features get penalty
      }
      eigResults.push({ featureId, eig: adjustedEig });
    }
  }

  // Sort by EIG descending
  eigResults.sort((a, b) => b.eig - a.eig);

  if (eigResults.length > 0) {
    const best = eigResults[0];
    const feature = FEATURES[best.featureId];
    if (feature) {
      return {
        featureId: best.featureId,
        label: feature.label,
        shortLabel: feature.shortLabel,
        type: feature.type,
        options: feature.options,
        rationale: generateRationale(best.featureId, topCandidate, candidates),
        sourceDiseaseId: topCandidate?.diseaseId || 'abdominal_pain',
        informationGain: best.eig,
        priority: getFeaturePriority(best.featureId),
        clinicalGuide: feature.clinicalGuide,
      };
    }
  }

  return null;
}

/** Select top N next questions, respecting override rules for the first result */
export function selectNextQuestions(
  state: EncounterState,
  previousQuestionIds: string[],
  diseaseMap: Map<string, DiseaseNode> = ABDOMINAL_PAIN_DISEASE_MAP,
  count: number = 5,
): NextQuestion[] {
  const best = selectNextQuestion(state, previousQuestionIds, diseaseMap);
  if (!best) return [];

  const answeredIds = new Set(state.answers.map(a => a.featureId));
  for (const pf of state.chiefComplaint.preFiledFeatures) {
    answeredIds.add(pf.featureId);
  }

  // Build a full candidate feature set from all active diseases + dependent characterization features
  const candidates = state.ddx.activeCandidates;
  const candidateFeatures = new Set<string>();
  for (const c of candidates) {
    const disease = diseaseMap.get(c.diseaseId);
    if (!disease) continue;
    for (const f of disease.features.symptoms) {
      candidateFeatures.add(f.featureId);
    }
  }
  // Add dependency-satisfied characterization features
  const dependentFeatures = getSatisfiedDependentFeatures(state.answers);
  for (const df of dependentFeatures) {
    candidateFeatures.add(df.featureId);
  }

  // Phase-gating for batch questions (same logic as in selectNextQuestion)
  let currentPhaseIdx = 0;
  for (let i = 0; i < PATHOPHYS_PHASES.length; i++) {
    const phase = PATHOPHYS_PHASES[i];
    const answeredInPhase = phase.features.filter(f => answeredIds.has(f)).length;
    if (answeredInPhase >= phase.minAnswers && i < PATHOPHYS_PHASES.length - 1) {
      currentPhaseIdx = i + 1;
    } else break;
  }
  const convergence = state.ddx.convergenceState;
  const isConverged = convergence === 'converging' || convergence === 'confirming';

  const eigResults: { featureId: string; eig: number }[] = [];
  for (const featureId of candidateFeatures) {
    if (answeredIds.has(featureId) || previousQuestionIds.includes(featureId)) continue;
    if (featureId === best.featureId) continue;
    const featurePhase = PATHOPHYS_PHASES.findIndex(p => p.features.includes(featureId));
    const isBeyondCurrent = featurePhase > currentPhaseIdx;
    if (isBeyondCurrent && !isConverged) continue;
    const eig = computeEig(featureId, candidates, diseaseMap);
    if (eig > 0.001) {
      let adjustedEig = eig;
      if (isBeyondCurrent) adjustedEig *= 0.3;
      const feature = FEATURES[featureId];
      if (feature && feature.stageRelevance.length > 0 && feature.stageRelevance.every(s => s >= 3)) {
        adjustedEig *= 0.3;
      }
      eigResults.push({ featureId, eig: adjustedEig });
    }
  }

  eigResults.sort((a, b) => b.eig - a.eig);

  // Build the result: best + top N-1 by EIG
  const result: NextQuestion[] = [best];
  for (const er of eigResults) {
    if (result.length >= count) break;
    const feature = FEATURES[er.featureId];
    if (feature) {
      result.push({
        featureId: er.featureId,
        label: feature.label,
        shortLabel: feature.shortLabel,
        type: feature.type,
        options: feature.options,
        rationale: generateRationale(er.featureId, state.ddx.leadingDiagnosis, candidates),
        sourceDiseaseId: state.ddx.leadingDiagnosis?.diseaseId || 'abdominal_pain',
        informationGain: er.eig,
        priority: getFeaturePriority(er.featureId),
        clinicalGuide: feature.clinicalGuide,
      });
    }
  }

  return result;
}

/** Check if any red flags are active and should be asked immediately */
export function hasOutstandingRedFlags(
  state: EncounterState,
  diseaseMap: Map<string, DiseaseNode> = ABDOMINAL_PAIN_DISEASE_MAP,
): string[] {
  const answeredIds = new Set(state.answers.map(a => a.featureId));
  const redFlags: string[] = [];

  for (const c of state.ddx.activeCandidates) {
    const disease = diseaseMap.get(c.diseaseId);
    if (!disease) continue;
    for (const rfId of disease.redFlagFeatureIds) {
      if (!answeredIds.has(rfId) && !redFlags.includes(rfId)) {
        redFlags.push(rfId);
      }
    }
  }

  return redFlags;
}
