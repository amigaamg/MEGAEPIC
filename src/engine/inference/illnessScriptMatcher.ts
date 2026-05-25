import { PatientForm } from '../../types';
import { DiseaseNode } from '../knowledge-graph/types';
import { ALL_DISEASES } from '../knowledge-graph/loadDiseases';
import { ClinicalInterpretation } from './clinicalInterpreter';
import { SyndromeResult } from './syndromeEngine';
import { LocalizationResult } from './localizationEngine';
import { symptomMap, signMap } from './scorer';

export interface ScriptMatchResult {
  diseaseId: string;
  diseaseName: string;
  matchScore: number;
  syndromeAlignment: number;
  featureCoverage: number;
  temporalFit: number;
  severityAlignment: number;
  contradictoryFeatures: string[];
  missingCriticalFeatures: string[];
  confidence: 'high' | 'moderate' | 'low';
}

interface PatientContext {
  ageMonths: number;
  isHIVPositive: boolean;
  isMalnourished: boolean;
  hasAtopy: boolean;
  hasFamilyAsthma: boolean;
  isSmokingExposure: boolean;
  hasTbContact: boolean;
  isOvercrowding: boolean;
  isUnvaccinated: boolean;
}

function extractContext(form: PatientForm): PatientContext {
  return {
    ageMonths: parseInt(form.biodata.ageMonths) || 0,
    isHIVPositive: !!form.pmh.hiv,
    isMalnourished: parseFloat(form.vitals.muac) < 12.5 || (form.nutrition.malnutritionSigns?.length ?? 0) > 0,
    hasAtopy: !!(form.family.atopyFamily || form.pmh.asthmaDx),
    hasFamilyAsthma: !!(form.family.asthmaFamily),
    isSmokingExposure: !!(form.family.smokingExposure),
    hasTbContact: !!(form.hpi.tbContact),
    isOvercrowding: !!(form.family.housingConditions?.toLowerCase().includes('crowded')),
    isUnvaccinated: !!(form.immunization.status?.toLowerCase() === 'none' || form.immunization.status?.toLowerCase() === 'incomplete'),
  };
}

// ─── ANATOMICAL PRESENTATION DETECTION ───────────────────────────────────

type AnatomicalPresentation =
  | 'lower_airway_obstructive'   // wheeze, prolonged expiration
  | 'upper_airway_obstructive'   // stridor, barking cough
  | 'alveolar_parenchymal'       // crackles, bronchial breathing, hypoxia
  | 'pleural'                    // dullness, reduced breath sounds
  | 'air_leak'                   // hyperresonance, tracheal deviation
  | 'cardiac'                    // murmur, hepatomegaly, gallop
  | 'cns'                        // seizures, neck stiffness
  | 'general_respiratory'        // cough, difficulty breathing without specific pattern
  | 'non_respiratory';           // no respiratory features

function detectPresentation(form: PatientForm): AnatomicalPresentation {
  const hasWheeze = form.complaints.includes('wheeze');
  const hasStridor = form.complaints.includes('stridor');
  const hasCrackles = !!form.vitals.examCrackles || !!form.vitals.examBronchial;
  const hasDullness = !!form.vitals.examDullness;
  const hasReducedBS = !!form.vitals.examReducedBS;
  const hasHyperresonance = !!form.vitals.examHyperResonance;
  const hasTrachealDev = !!form.vitals.examTrachealDeviation;
  const hasMurmur = !!form.vitals.examMurmur && form.vitals.examMurmur !== 'none';
  const hasHepatomegaly = !!form.vitals.examHepatomegaly;
  const hasSeizures = form.complaints.includes('lethargy') || form.complaints.includes('seizures');
  const hasNeckStiffness = !!form.vitals.examNeckStiffness;
  const hasBarkingCough = form.hpi.coughChar === 'barking';
  const hasCough = form.complaints.includes('cough');
  const hasDifficultyBreathing = form.complaints.includes('difficulty_breathing');

  if (hasWheeze) return 'lower_airway_obstructive';
  if (hasStridor || hasBarkingCough) return 'upper_airway_obstructive';
  if (hasCrackles) return 'alveolar_parenchymal';
  if (hasHyperresonance || hasTrachealDev) return 'air_leak';
  if (hasDullness || hasReducedBS) return 'pleural';
  if (hasMurmur || hasHepatomegaly) return 'cardiac';
  if (hasSeizures || hasNeckStiffness) return 'cns';
  if (hasCough || hasDifficultyBreathing) return 'general_respiratory';

  return 'non_respiratory';
}

// ─── ANATOMICAL COMPATIBILITY ────────────────────────────────────────────

// Maps each presentation type to syndrome tags that indicate compatibility.
// A disease is "anatomically compatible" if it has ANY of these tags.
const COMPATIBLE_TAGS: Record<AnatomicalPresentation, string[]> = {
  lower_airway_obstructive: [
    'lower_airway_obstruction', 'reversible_airway_disease',
    'viral_infant_respiratory_distress', 'airway_obstruction',
  ],
  upper_airway_obstructive: [
    'upper_airway_obstruction',
  ],
  alveolar_parenchymal: [
    'alveolar_disease', 'respiratory_distress',
    'infected_pleural_space', 'pleural_space_fluid',
  ],
  pleural: [
    'pleural_syndrome', 'pleural_space_fluid',
    'infected_pleural_space',
  ],
  air_leak: [
    'air_leak_syndrome', 'air_leak_emergency',
  ],
  cardiac: [
    'cardiac_murmur', 'cardiac_failure',
  ],
  cns: [
    'meningism', 'seizure',
  ],
  general_respiratory: [
    'respiratory_distress', 'alveolar_disease',
    'lower_airway_obstruction', 'upper_airway_obstruction',
    'viral_infant_respiratory_distress', 'pleural_syndrome',
    'infected_pleural_space', 'airway_obstruction',
    'pleural_space_fluid', 'air_leak_syndrome', 'air_leak_emergency',
    'reversible_airway_disease', 'chronic_respiratory_disease',
    'granulomatous_disease', 'systemic_infection',
  ],
  non_respiratory: [],
};

function isAnatomicallyCompatible(
  disease: DiseaseNode,
  presentation: AnatomicalPresentation,
): boolean {
  const tags = disease.syndromeTags || [];
  if (tags.length === 0) return false; // no tags → can't confirm compatibility
  const compatible = COMPATIBLE_TAGS[presentation] || [];
  return tags.some(t => compatible.includes(t));
}

// ─── AGE SCORE ───────────────────────────────────────────────────────────

function getAgeWeight(disease: DiseaseNode, ageMonths: number): number {
  const aw = (disease as any).ageWeighting || (disease as any).ageLogic?.ageWeighting;
  if (aw) {
    for (const [range, w] of Object.entries(aw)) {
      const [lo, hi] = range.split('-').map(Number);
      if (!isNaN(lo) && !isNaN(hi) && ageMonths >= lo && ageMonths <= hi) return w as number;
      if (range.endsWith('+') && ageMonths >= parseInt(range)) return w as number;
    }
  }
  // Fallback: use agePeak
  const peak = (disease as any).agePeak_months || (disease as any).agePeak || (disease as any).ageLogic?.peak;
  if (peak && Array.isArray(peak) && peak.length >= 2) {
    const [lo, hi] = peak;
    const halfSpan = (hi - lo) / 2;
    const mid = (lo + hi) / 2;
    const dist = Math.abs(ageMonths - mid);
    if (dist <= halfSpan) return 1.0;
    if (dist <= halfSpan * 2) return 0.5;
    return 0.2;
  }
  return 0.7;
}

// ─── HISTORY FEATURE COVERAGE (HPI-ONLY) ─────────────────────────────────

/** Score from history features only — reflects what we know from the HPI phase */
function computeHistoryCoverage(disease: DiseaseNode, form: PatientForm, ctx: PatientContext): number {
  const hf = disease.historyFeatures || [];
  if (hf.length === 0) return 0;

  let weightedPresent = 0;
  let weightedTotal = 0;

  for (const feat of hf) {
    const w = feat.weight || 1;
    weightedTotal += w;
    if (symptomMap[feat.symptomId]?.(form, ctx)) {
      weightedPresent += w;
    }
  }

  return weightedTotal > 0 ? weightedPresent / weightedTotal : 0;
}

/** Score from exam features — only applies when there's actual exam data.
 *  Before exam data is entered, chief complaints that match exam feature IDs
 *  contribute proportionally. */
function computeExamCoverage(disease: DiseaseNode, form: PatientForm): number {
  const ef = disease.examFeatures || [];
  if (ef.length === 0) return 0;

  // Check if any exam data has been entered
  const hasExamData = !!form.vitals.rr || !!form.vitals.spo2 || !!form.vitals.hr ||
    !!form.vitals.temp || !!form.vitals.examCrackles || !!form.vitals.examWheeze ||
    !!form.vitals.examIndrawing || !!form.vitals.examStridor ||
    !!form.vitals.examBronchial || !!form.vitals.examReducedBS ||
    !!form.vitals.examDullness || !!form.vitals.examHyperResonance ||
    !!form.vitals.examTrachealDeviation;

  let weightedPresent = 0;
  let weightedTotal = 0;

  for (const feat of ef) {
    const w = feat.baseWeight || 1;
    const effectiveW = (feat as any).doubleWeight ? w * 2 : w;
    weightedTotal += effectiveW;
    if (signMap[feat.signId]?.(form)) {
      weightedPresent += effectiveW;
    } else if (!hasExamData && form.complaints.includes(feat.signId)) {
      // Before exam is done, treat chief complaints matching exam features as "reported"
      weightedPresent += effectiveW * 0.7; // 70% credit — reported but not confirmed
    }
  }

  if (weightedTotal === 0) return 0;
  const raw = weightedPresent / weightedTotal;
  if (!hasExamData) return Math.min(raw, 0.7); // cap pre-exam at 0.7
  return raw;
}

// ─── SYNDROME ALIGNMENT ──────────────────────────────────────────────────────

const TAG_TO_SYNDROME: Record<string, string> = {
  'alveolar_disease': 'Lower Respiratory Tract Infection',
  'lower_airway_obstruction': 'Lower Respiratory Tract Infection',
  'upper_airway_obstruction': 'Upper Airway Obstruction',
  'respiratory_distress': 'Acute Respiratory Distress',
  'viral_infant_respiratory_distress': 'Lower Respiratory Tract Infection',
  'pleural_syndrome': 'Lower Respiratory Tract Infection',
  'fever': 'Systemic Inflammatory Response / Sepsis',
  'cardiac_murmur': 'Cardiac Failure',
  'cardiac_failure': 'Cardiac Failure',
  'meningism': 'Meningeal Irritation',
  'air_leak_syndrome': 'Air Leak Syndrome',
  'seizure': 'Meningeal Irritation',
  'sepsis': 'Systemic Inflammatory Response / Sepsis',
  'infected_pleural_space': 'Lower Respiratory Tract Infection',
  'airway_obstruction': 'Upper Airway Obstruction',
  'mechanical': 'Acute Respiratory Distress',
  'pleural_space_fluid': 'Lower Respiratory Tract Infection',
  'chronic_respiratory_disease': 'Lower Respiratory Tract Infection',
  'granulomatous_disease': 'Lower Respiratory Tract Infection',
  'systemic_infection': 'Systemic Inflammatory Response / Sepsis',
  'reversible_airway_disease': 'Lower Respiratory Tract Infection',
  'air_leak_emergency': 'Air Leak Syndrome',
};

function computeSyndromeAlignment(disease: DiseaseNode, syndromes: SyndromeResult): number {
  const tags = disease.syndromeTags || [];
  if (tags.length === 0) return 0;

  let matched = 0;
  for (const tag of tags) {
    const mapped = TAG_TO_SYNDROME[tag];
    if (!mapped) continue;
    const syndrome = syndromes.syndromes.find(s => s.name === mapped);
    if (syndrome && syndrome.score > 0.2) matched += syndrome.score;
  }

  return matched > 0 ? matched / tags.length : 0;
}

// ─── TEMPORAL FIT ────────────────────────────────────────────────────────

const ACUTE = new Set(['foreign_body_aspiration', 'pneumothorax', 'epiglottitis', 'pneumonia', 'croup']);
const CHRONIC = new Set(['pulmonary_tuberculosis', 'empyema', 'pleural_effusion', 'chf']);

function computeTemporalFit(disease: DiseaseNode, form: PatientForm): number {
  const onset = form.hpi.onsetType;
  let fit = 1.0;
  if (onset === 'sudden') {
    if (ACUTE.has(disease.id)) fit = 1.3;
    else if (CHRONIC.has(disease.id)) fit = 0.4;
    else fit = 0.8;
  }
  if (onset === 'gradual') {
    if (CHRONIC.has(disease.id)) fit = 1.3;
    else if (ACUTE.has(disease.id)) fit = 0.5;
    else fit = 0.8;
  }
  return Math.min(1, fit);
}

// ─── SEVERITY ALIGNMENT ───────────────────────────────────────────────────

function computeSeverityAlignment(disease: DiseaseNode, interpretation: ClinicalInterpretation): number {
  let align = 1.0;
  const ds = disease.severityAssessment;
  if (ds?.immediateDangerSigns && ds.immediateDangerSigns.length > 0) {
    const patientDangers = interpretation.dangerSigns.immediateDangerSigns.length;
    const expected = ds.immediateDangerSigns.length;
    if (patientDangers >= expected) align = 1.2;
    else if (patientDangers === 0) align = 0.7;
  }
  if (disease.mustNotMiss && interpretation.dangerSigns.immediateDangerSigns.length > 0) {
    align *= 1.3;
  }
  return Math.min(1, align);
}

// ─── TEXTBOOK-BASED CLINICAL BOOSTS ───────────────────────────────────────
// References: WHO IMCI Pneumonia Guidelines, Nelson's Textbook of Pediatrics,
// Kenyan Paediatric Management Protocols (2022)

/** Apply clinical knowledge boosts based on textbook clinical reasoning.
 *  Each disease has specific pattern-recognition rules derived from:
 *  - WHO IMCI: cough + chest indrawing = severe pneumonia; cough + fast breathing = pneumonia
 *  - Nelson's: first wheeze <24mo with viral prodrome = bronchiolitis; recurrent wheeze + atopy = asthma
 *  - Kenyan Guidelines: TB must be considered in all chronic cough; HIV+TB co-infection common */
function computeClinicalBoost(disease: DiseaseNode, form: PatientForm, ctx: PatientContext): number {
  let boost = 1.0;
  const age = ctx.ageMonths;
  const complaints = new Set(form.complaints);

  // ═══════════════════════════════════════════════════════════════════════
  // PNEUMONIA & SEVERE PNEUMONIA (WHO IMCI Classification)
  // IMCI: cough + chest indrawing = SEVERE pneumonia -> admit + antibiotics
  // IMCI: cough + fast breathing = pneumonia -> oral antibiotics
  // IMCI: cough + no signs = no pneumonia -> home care
  // ═══════════════════════════════════════════════════════════════════════
  if (disease.id === 'pneumonia') {
    const hasCough = complaints.has('cough') || form.hpi.coughChar !== '';
    const hasFever = complaints.has('fever');
    const hasChestIndrawing = form.hpi.chestIndrawing || !!form.vitals.examIndrawing;
    const hasFastBreathing = (form.vitals.rr && parseInt(form.vitals.rr) > 40) || complaints.has('fast_breathing');
    const hasGrunting = form.hpi.grunting || !!form.vitals.examGrunting;
    const hasHypoxia = form.vitals.spo2 && parseFloat(form.vitals.spo2) < 92;

    // WHO IMCI Severe pneumonia: cough + chest indrawing (with or without fast breathing)
    if (hasChestIndrawing && (hasCough || complaints.has('difficulty_breathing'))) {
      boost += 0.40; // Major IMCI severe pneumonia criterion
      if (hasGrunting) boost += 0.15; // Grunting = severe distress marker
      if (hasHypoxia) boost += 0.15; // Hypoxia = severity indicator
      if (hasFever) boost += 0.10; // Fever supports infectious aetiology
      if (form.hpi.feedingDiff) boost += 0.10; // Feeding difficulty = severe pneumonia red flag
    }
    // WHO IMCI Pneumonia: cough + fast breathing (NO chest indrawing)
    else if (hasFastBreathing && (hasCough || hasFever)) {
      boost += 0.25; // IMCI pneumonia criterion
      if (hasFever) boost += 0.10;
    }
    // Cough + fever without severity signs -> still possible pneumonia
    else if (hasCough && hasFever) {
      boost += 0.10;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BRONCHIOLITIS (Nelson's: acute viral LRTI in infants <24mo)
  // Key features: first wheeze, viral prodrome, age <12mo peak, chest indrawing
  // ═══════════════════════════════════════════════════════════════════════
  if (disease.id === 'bronchiolitis') {
    const hasWheeze = complaints.has('wheeze');
    const isInAgeRange = age < 24;

    if (hasWheeze && isInAgeRange) {
      // Nelson's: first wheezing episode in infant = bronchiolitis until proven otherwise
      const isFirstEpisode = form.hpi.wheezePattern === 'first' || !form.hpi.wheezePattern;
      if (isFirstEpisode) boost += 0.35;

      // Nelson's: viral prodrome (coryza, nasal congestion, low-grade fever) precedes wheeze
      const hasViralProdrome = form.hpi.recentURTI || complaints.has('nasal_discharge') || form.ros.nasalDischargeRos;
      if (hasViralProdrome) boost += 0.20;

      // WHO IMCI severity markers for bronchiolitis
      if (form.hpi.chestIndrawing) boost += 0.15;
      if (form.hpi.feedingDiff) boost += 0.15;
      if (form.hpi.grunting) boost += 0.10;

      // Nelson's: RSV seasonality (implicit — if winter/rainy season in Kenya)
      // Age gradient: younger = more typical
      if (age < 6) boost += 0.10;
      else if (age < 12) boost += 0.05;

      // Apnoea = severe bronchiolitis (especially in preterm/young infants)
      if (form.hpi.cyanoticEpisodes) boost += 0.10;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ASTHMA (Nelson's: chronic airway inflammation + reversible obstruction)
  // Key features: recurrent wheeze, atopy, nocturnal cough, trigger sensitivity
  // ═══════════════════════════════════════════════════════════════════════
  if (disease.id === 'asthma') {
    // Nelson's: recurrent wheeze is the hallmark
    if (form.hpi.wheezePattern === 'recurrent') boost += 0.30;

    // Atopic triad: asthma, eczema, allergic rhinitis
    if (ctx.hasAtopy || ctx.hasFamilyAsthma) boost += 0.20;

    // Nelson's: nocturnal cough is a common asthma equivalent
    if (form.hpi.nocturnalCough) boost += 0.15;

    // Triggers: exercise, allergens, URI (but URI-induced is less specific)
    if (form.hpi.exerciseTriggered) boost += 0.10;
    if (form.hpi.allergenTrigger) boost += 0.10;

    // Bronchodilator response = hallmark of reversible airway obstruction
    const txResp = form.hpi.txResponse?.toLowerCase() || '';
    if (txResp.includes('improved') || txResp.includes('resolved')) boost += 0.25;

    // Chest tightness = common asthma symptom in older children
    if (complaints.has('chest_tightness')) boost += 0.10;

    // Age-based probability (Nelson's: asthma diagnosis increases after 12mo)
    if (age < 12) boost -= 0.25; // Asthma extremely rare <12mo (bronchiolitis dominates)
    else if (age < 18 && form.hpi.wheezePattern !== 'recurrent') boost -= 0.10;
    else if (age >= 36) boost += 0.10; // Older child makes asthma more likely
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PULMONARY TUBERCULOSIS (Kenyan Guidelines: high-burden setting)
  // TB must be considered in ALL children with chronic respiratory symptoms
  // ═══════════════════════════════════════════════════════════════════════
  if (disease.id === 'tuberculosis') {
    // Kenyan Guidelines: TB contact is the strongest predictor
    if (ctx.hasTbContact) boost += 0.35;

    // Kenyan Guidelines: chronic cough >2 weeks is a TB screening criteria
    if (form.hpi.coughDuration === 'chronic' || form.hpi.coughChar === 'chronic') boost += 0.25;

    // Kenyan Guidelines: weight loss / failure to thrive + cough = suspect TB
    if (form.hpi.weightLoss) boost += 0.20;

    // Kenyan Guidelines: night sweats = classic TB symptom
    if (form.hpi.nightSweats) boost += 0.20;

    // Kenyan Guidelines: HIV is major TB co-factor (multiplier in riskFactors)
    // Also: fatigue, recurrent pneumonia, lymphadenopathy
    if (form.hpi.weightLoss && form.hpi.nightSweats) boost += 0.15; // Constitutional symptoms together

    // Kenyan Guidelines: prolonged fever + respiratory symptoms not responding to antibiotics
    if (form.pmh.recurrentChest) boost += 0.15;

    // Not acutely presenting (TB is subacute-chronic)
    if (form.hpi.onsetType === 'gradual') boost += 0.10;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CROUP (Nelson's: acute laryngotracheobronchitis, age 6-36mo peak)
  // ═══════════════════════════════════════════════════════════════════════
  if (disease.id === 'croup') {
    // Barking cough = pathognomonic
    if (form.hpi.coughChar === 'barking') boost += 0.35;

    // Inspiratory stridor = hallmark of upper airway obstruction
    if (complaints.has('stridor') || form.hpi.stridor) boost += 0.25;

    // Age peak 6-36 months
    if (age >= 6 && age <= 36) boost += 0.10;

    // Viral prodrome (URI symptoms) preceding stridor
    if (form.hpi.recentURTI || complaints.has('nasal_discharge')) boost += 0.10;

    // Hoarseness = laryngeal involvement
    if (form.hpi.hoarseness) boost += 0.10;

    // No drooling + no toxic appearance (differentiates from epiglottitis)
    if (!form.hpi.drooling) boost += 0.05; // Pertinent negative
  }

  // ═══════════════════════════════════════════════════════════════════════
  // FOREIGN BODY ASPIRATION (mustNotMiss, peak age 6mo-4yr)
  // ═══════════════════════════════════════════════════════════════════════
  if (disease.id === 'foreign_body_aspiration') {
    // Choking episode = sentinel event
    if (form.hpi.suddenOnset) boost += 0.30;
    if (complaints.has('choking_episode') || form.hpi.suddenOnset) boost += 0.35;

    // Unilateral wheeze = highly suggestive
    if (form.hpi.unilateralWheeze) boost += 0.30;

    // Sudden onset in a toddler (peak 12-48mo)
    if (age >= 6 && age <= 48) boost += 0.10;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EMPYEMA (failed pneumonia + pus in pleural space)
  // ═══════════════════════════════════════════════════════════════════════
  if (disease.id === 'empyema') {
    // Persistent fever despite antibiotics = defining feature
    if (complaints.has('fever') && form.hpi.prevTx?.toLowerCase().includes('antibiotic')) boost += 0.20;

    // Stony dullness + reduced breath sounds (from exam coverage)

    // Toxic appearance + chest pain + respiratory distress
    if (form.vitals.generalCondition === 'toxic' || form.vitals.generalCondition === 'severe') boost += 0.15;
    if (complaints.has('chest_pain')) boost += 0.10;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PLEURAL EFFUSION
  // ═══════════════════════════════════════════════════════════════════════
  if (disease.id === 'pleural_effusion') {
    if (complaints.has('difficulty_breathing') && complaints.has('chest_pain')) boost += 0.15;
    if (form.hpi.orthopnea) boost += 0.10; // Large effusion → orthopnea
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PNEUMOTHORAX (mustNotMiss)
  // ═══════════════════════════════════════════════════════════════════════
  if (disease.id === 'pneumothorax') {
    if (complaints.has('chest_pain') && form.hpi.suddenOnset) boost += 0.25;
    if (form.hpi.orthopnea) boost += 0.10;
  }

  return Math.max(0, Math.min(boost, 2.0));
}

// ─── NEGATIVE FEATURE PENALTY ────────────────────────────────────────────

function computeNegativePenalty(disease: DiseaseNode, form: PatientForm, ctx: PatientContext): number {
  let penalty = 0;

  // Array-style negative predictors (asthma, bronchiolitis, pneumonia, TB)
  const nps = (disease as any).negativePredictors;
  if (Array.isArray(nps)) {
    for (const np of nps) {
      const fid = np.feature || np.symptomId;
      if ((symptomMap[fid]?.(form, ctx) || signMap[fid]?.(form)) && !form.complaints.includes(fid)) {
        penalty += (np.scoreReduction || 5) / 10;
      }
    }
  }

  // Object-style negative weights (croup, empyema, FBA, pleural effusion, pneumothorax)
  const nw = (disease as any).negativeWeights;
  if (nw && typeof nw === 'object' && !Array.isArray(nw)) {
    for (const [fid, val] of Object.entries(nw)) {
      const reduction = typeof val === 'number' && val < 0 ? Math.abs(val) : 0;
      if (reduction > 0 && (symptomMap[fid]?.(form, ctx) || signMap[fid]?.(form))) {
        penalty += reduction / 10;
      }
    }
  }

  // Inline negativePredictor in historyFeatures
  for (const feat of disease.historyFeatures || []) {
    if (feat.negativePredictor && symptomMap[feat.symptomId]?.(form, ctx)) {
      penalty += (feat.negativePredictor.scoreReduction || 4) / 10;
    }
  }

  return Math.min(penalty, 0.6);
}

// ─── MISSING CRITICAL FEATURES ────────────────────────────────────────────

function findMissingCriticalFeatures(disease: DiseaseNode, _form: PatientForm, _ctx: PatientContext): string[] {
  const missing: string[] = [];
  for (const feat of disease.historyFeatures || []) {
    if ((feat.weight || 1) >= 4 && !_form.complaints.includes(feat.symptomId)) {
      missing.push(feat.symptomId);
    }
  }
  return missing;
}

// ─── MAIN ENTRY ──────────────────────────────────────────────────────────

export function matchIllnessScripts(
  form: PatientForm,
  interpretation: ClinicalInterpretation,
  syndromes: SyndromeResult,
  localization: LocalizationResult,
): ScriptMatchResult[] {
  const ctx = extractContext(form);
  const presentation = detectPresentation(form);
  const results: ScriptMatchResult[] = [];

  for (const disease of ALL_DISEASES) {
    // ── Age gate (very wide) ─────────────────────────────────────────────
    const peak = (disease as any).agePeak_months || (disease as any).agePeak || (disease as any).ageLogic?.peak;
    if (peak && Array.isArray(peak) && peak.length >= 2) {
      const [lo, hi] = peak;
      const extLo = Math.round(lo * 0.3);
      const extHi = Math.round(hi * 3);
      if (ctx.ageMonths < extLo || ctx.ageMonths > extHi) continue;
    }

    // ── Anatomical compatibility ─────────────────────────────────────────
    const compatible = isAnatomicallyCompatible(disease, presentation);
    const isRespiratory = presentation !== 'non_respiratory' && presentation !== 'cardiac' && presentation !== 'cns';

    // ── Component scores ─────────────────────────────────────────────────
    const historyCoverage = computeHistoryCoverage(disease, form, ctx);
    const examCoverage = computeExamCoverage(disease, form);
    const syndromeScore = computeSyndromeAlignment(disease, syndromes);
    const temporalFit = computeTemporalFit(disease, form);
    const severityAlign = computeSeverityAlignment(disease, interpretation);
    const ageScore = getAgeWeight(disease, ctx.ageMonths);
    const clinicalBoost = computeClinicalBoost(disease, form, ctx);
    const negativePenalty = computeNegativePenalty(disease, form, ctx);
    const missingCrit = findMissingCriticalFeatures(disease, form, ctx);

    // ── Stub penalty ────────────────────────────────────────────────────
    const isStub =
      (!disease.historyFeatures || disease.historyFeatures.length === 0) &&
      (!disease.examFeatures || disease.examFeatures.length === 0) &&
      (!disease.syndromeTags || disease.syndromeTags.length === 0) &&
      !disease.severityAssessment;
    const stubPenalty = isStub ? 0.8 : 0;

    // ── Compatibility multiplier ─────────────────────────────────────────
    let compatMultiplier: number;
    if (presentation === 'non_respiratory') {
      compatMultiplier = 0.8;
    } else if (compatible) {
      // Disease matches the anatomical presentation → boost
      compatMultiplier = 1.25;
    } else if (!isRespiratory) {
      // Non-respiratory disease during a respiratory presentation → heavy penalty
      compatMultiplier = 0.2;
    } else {
      // Respiratory disease but wrong anatomical pattern → moderate penalty
      compatMultiplier = 0.4;
    }

    // ── Composite score ─────────────────────────────────────────────────
    // Blend history + exam coverage. Pre-exam: examCoverage reports chief-complaint matches at 70%
    const featureScore = historyCoverage * 0.50 + examCoverage * 0.50;

    let score =
      featureScore * 0.40 +
      syndromeScore * 0.10 +
      ageScore * 0.15 +
      temporalFit * 0.10 +
      severityAlign * 0.15;

    // Apply compatibility multiplier
    score *= compatMultiplier;

    // Apply clinical boost (additive — textbook knowledge)
    const boostValue = clinicalBoost - 1.0; // converts from 1.x to 0.x range
    score += boostValue * 0.15;

    // Apply negative penalty (subtractive)
    score = Math.max(0, score - negativePenalty);

    // Apply stub penalty (subtractive — eliminates empty diseases)
    score = Math.max(0, score - stubPenalty);

    // Missing critical features penalty
    score = Math.max(0, score - missingCrit.length * 0.04);

    // Cap at 1.0
    score = Math.min(1.0, score);

    // ── Confidence ──────────────────────────────────────────────────────
    let confidence: ScriptMatchResult['confidence'] = 'low';
    if (score >= 0.55) confidence = 'high';
    else if (score >= 0.30) confidence = 'moderate';

    const contradictory: string[] = [];
    for (const feat of disease.examFeatures || []) {
      if ((feat as any).excludePneumonia && signMap[feat.signId]?.(form)) {
        contradictory.push(`${feat.signId} excludes this diagnosis`);
      }
    }

    results.push({
      diseaseId: disease.id,
      diseaseName: disease.name,
      matchScore: score,
      syndromeAlignment: syndromeScore,
      featureCoverage: featureScore,
      temporalFit,
      severityAlignment: severityAlign,
      contradictoryFeatures: contradictory,
      missingCriticalFeatures: missingCrit,
      confidence,
    });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results.slice(0, 15);
}
