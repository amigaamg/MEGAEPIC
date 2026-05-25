import { PatientForm } from '../../types';
import { ScoredDisease } from './types';
import { formatAge } from '../knowledge-graph/reference';

// ── EXPORTED TYPES ──────────────────────────────────────────────────────────

export interface TimelineEvent {
  symptomId: string;
  label: string;
  day: number | null;
  duration?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
  isRedFlag: boolean;
}

export interface PrioritizedSymptom {
  symptomId: string;
  label: string;
  priority: number;
  reason: string;
  isRedFlag: boolean;
}

export interface SocratesFields {
  site?: string;
  onset?: string;
  character?: string;
  radiation?: string;
  associated: string[];
  timing?: string;
  exacerbating: string[];
  relieving: string[];
  severity?: string;
  impact: string[];
}

export interface SymptomDeepDive {
  symptomId: string;
  label: string;
  socrates: SocratesFields;
  ddxLinks: string[];
  ddxAgainst: string[];
  discussionNarrative: string;
}

export interface HPIEngineOutput {
  timeline: TimelineEvent[];
  prioritizedSymptoms: PrioritizedSymptom[];
  narrative: string;
  openingStatement: string;
  summaryStatement: string;
  missingCriticalQuestions: string[];
  ddxDrivenQuestions: string[];
  symptomDeepDives: SymptomDeepDive[];
  ddxDiscussion: string;
  complicationsDiscussion: string;
}

// ── SYMPTOM LABELS ──────────────────────────────────────────────────────────

const SYMPTOM_LABEL: Record<string, string> = {
  cough: 'Cough',
  fever: 'Fever',
  wheeze: 'Wheeze',
  difficulty_breathing: 'Difficulty breathing',
  stridor: 'Stridor',
  chest_pain: 'Chest pain',
  hemoptysis: 'Coughing blood',
  noisy_breathing: 'Noisy breathing',
  reduced_feeding: 'Reduced feeding',
  lethargy: 'Lethargy',
  cyanosis: 'Cyanosis',
  night_sweats: 'Night sweats',
  weight_loss: 'Weight loss',
  nasal_discharge: 'Nasal discharge',
  sore_throat: 'Sore throat',
  chest_tightness: 'Chest tightness',
  rash: 'Rash',
  ear_pain: 'Ear pain',
  abdominal_pain: 'Abdominal pain',
  fast_breathing: 'Fast breathing',
  poor_feeding: 'Poor feeding',
  difficulty_feeding: 'Difficult feeding',
};

function label(id: string): string {
  return SYMPTOM_LABEL[id] || id.replace(/_/g, ' ');
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pron(form: PatientForm) {
  return form.biodata.sex === 'Female'
    ? { sub: 'She', obj: 'her', pos: 'her', ref: 'herself' }
    : { sub: 'He', obj: 'him', pos: 'his', ref: 'himself' };
}

function listEn(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

// ── RED FLAG SYMPTOMS ───────────────────────────────────────────────────────

const RED_FLAG_SYMPTOMS = new Set([
  'cyanosis', 'lethargy', 'stridor', 'hemoptysis', 'difficulty_breathing', 'chest_pain',
]);

// ── SEVERITY WEIGHTS FOR PRIORITIZATION ─────────────────────────────────────

const SYMPTOM_PRIORITY_WEIGHTS: Record<string, number> = {
  cyanosis: 100,
  stridor: 90,
  hemoptysis: 85,
  lethargy: 80,
  difficulty_breathing: 75,
  chest_pain: 60,
  wheeze: 50,
  fever: 40,
  cough: 30,
  noisy_breathing: 35,
  nasal_discharge: 10,
  sore_throat: 15,
  rash: 20,
  ear_pain: 15,
  abdominal_pain: 25,
  reduced_feeding: 45,
  weight_loss: 30,
  night_sweats: 25,
};

// ── HELPERS FOR SOCRATES / DEEP DIVES ───────────────────────────────────────

function parseList(val: string | undefined): string[] {
  if (!val) return [];
  return val.split(/[,;]\s*/).filter(Boolean);
}

function getSymptomCharacter(symptomId: string, form: PatientForm): string | undefined {
  if (symptomId === 'cough') return form.hpi.coughChar || form.hpi.character || undefined;
  if (symptomId === 'fever') return form.hpi.feverPattern || form.hpi.character || undefined;
  if (symptomId === 'wheeze') {
    const parts: string[] = [];
    if (form.hpi.wheezePattern) parts.push(form.hpi.wheezePattern.replace(/_/g, ' '));
    if (form.hpi.unilateralWheeze) parts.push('unilateral');
    return parts.length > 0 ? parts.join(', ') : form.hpi.character || undefined;
  }
  return form.hpi.character || undefined;
}

function getSymptomOnset(symptomId: string, form: PatientForm): string | undefined {
  if (symptomId === 'wheeze' || symptomId === 'difficulty_breathing') {
    if (form.hpi.suddenOnset) return 'sudden';
  }
  return form.hpi.onsetType || undefined;
}

function getSymptomTiming(symptomId: string, form: PatientForm): string | undefined {
  const parts: string[] = [];
  if (form.hpi.timeCourse) parts.push(form.hpi.timeCourse.replace(/_/g, ' '));
  if (symptomId === 'cough' && form.hpi.coughDuration) parts.push(`present for ${form.hpi.coughDuration}`);
  if (symptomId === 'fever' && form.hpi.feverDuration) parts.push(`present for ${form.hpi.feverDuration}`);
  if (symptomId === 'cough' && form.hpi.nocturnalCough) parts.push('predominantly nocturnal');
  if (symptomId === 'wheeze' && form.hpi.exerciseTriggered) parts.push('exercise-triggered');
  if (form.hpi.orthopnea) parts.push('worse when lying flat');
  return parts.length > 0 ? parts.join('; ') : undefined;
}

function getSymptomSeverity(symptomId: string, form: PatientForm): string | undefined {
  if (symptomId === 'fever' && form.hpi.highFever) return 'high-grade';
  if (form.hpi.severity) return form.hpi.severity;
  return undefined;
}

function buildExacerbating(symptomId: string, form: PatientForm): string[] {
  const items = parseList(form.hpi.exacerbating);
  if (symptomId === 'cough') {
    if (form.hpi.exerciseTriggered) items.push('exercise');
    if (form.hpi.allergenTrigger) items.push('allergen exposure');
  }
  if (symptomId === 'wheeze') {
    if (form.hpi.exerciseTriggered) items.push('exercise');
    if (form.hpi.allergenTrigger) items.push('allergen exposure');
  }
  return items;
}

function buildRelieving(form: PatientForm): string[] {
  return parseList(form.hpi.relieving);
}

function buildImpactArray(form: PatientForm): string[] {
  const impacts: string[] = [];
  if (form.hpi.feedingDiff) impacts.push('feeding difficulty');
  if (form.nutrition.appetite?.toLowerCase().includes('poor') || form.nutrition.appetite?.toLowerCase().includes('decreased')) {
    impacts.push('poor appetite');
  }
  if (form.hpi.nocturnalCough) impacts.push('sleep disturbance from nocturnal cough');
  if (form.ros.lethargyRos) impacts.push('reduced play and activity');
  if (form.family.schoolAttendance?.toLowerCase().includes('miss') || form.family.schoolAttendance?.toLowerCase().includes('absent')) {
    impacts.push('school absenteeism');
  }
  if (form.hpi.sweatingFeeds) impacts.push('sweating during feeds');
  return impacts;
}

function findHistoryFeature(symptomId: string, disease: { historyFeatures?: { symptomId: string; weight: number; negativePredictor?: { description: string; scoreReduction: number; considerMimic?: string[] } }[] }): { weight: number; negativePredictor?: { description: string; scoreReduction: number; considerMimic?: string[] } } | undefined {
  const hf = (disease.historyFeatures || []).find(f => f.symptomId === symptomId);
  if (hf) {
    return { weight: hf.weight || 1, negativePredictor: hf.negativePredictor };
  }
  return undefined;
}

// ── NEW: BUILD SOCRATES FOR A SYMPTOM ───────────────────────────────────────

function buildSocratesForSymptom(symptomId: string, form: PatientForm): SocratesFields {
  const site = form.hpi.site || undefined;
  const onset = getSymptomOnset(symptomId, form);
  const character = getSymptomCharacter(symptomId, form);
  const radiation = form.hpi.radiation || undefined;
  const associated = parseList(form.hpi.associated);
  const timing = getSymptomTiming(symptomId, form);
  const exacerbating = buildExacerbating(symptomId, form);
  const relieving = buildRelieving(form);
  const severity = getSymptomSeverity(symptomId, form);
  const impact = buildImpactArray(form);
  return { site, onset, character, radiation, associated, timing, exacerbating, relieving, severity, impact };
}

function buildDdxLinks(
  symptomId: string,
  form: PatientForm,
  differentials: ScoredDisease[],
): string[] {
  const links: string[] = [];
  for (const d of differentials.slice(0, 3)) {
    const disease = d.disease;
    const feature = findHistoryFeature(symptomId, disease);
    if (feature) {
      const diseaseName = disease.name;
      if (feature.weight >= 4) {
        links.push(`Strongly supports ${diseaseName} (weight ${feature.weight})`);
      } else if (feature.weight >= 2) {
        links.push(`Moderately supports ${diseaseName} (weight ${feature.weight})`);
      } else {
        links.push(`Weakly supports ${diseaseName} (weight ${feature.weight})`);
      }
      if (feature.negativePredictor) {
        // This symptom is actually a negative predictor for this disease
        const np = feature.negativePredictor;
        links.push(`However, in context: ${np.description}`);
      }
    }
    // Check if disease mimics reference this symptom
    for (const mimic of disease.mimics || []) {
      if (mimic.discriminators.some(d => d.includes(symptomId) || d.includes(symptomId.replace(/_/g, '_')))) {
        const mimicDx = differentials.find(md => md.disease.id === mimic.diseaseId);
        if (mimicDx) {
          links.push(`This symptom is a discriminator for ${mimicDx.disease.name} (mimic of ${disease.name})`);
        }
      }
    }
  }
  return links;
}

function buildDdxAgainst(
  symptomId: string,
  form: PatientForm,
  differentials: ScoredDisease[],
): string[] {
  const against: string[] = [];
  for (const d of differentials.slice(0, 3)) {
    const disease = d.disease;
    const feature = findHistoryFeature(symptomId, disease);
    if (feature?.negativePredictor) {
      const np = feature.negativePredictor;
      const mimicNames = (np.considerMimic || []).map(m => {
        const found = differentials.find(md => md.disease.id === m);
        return found ? found.disease.name : m;
      });
      const againstStr = `${np.description} — reduces ${disease.name} probability (score reduction: ${np.scoreReduction})`;
      against.push(againstStr);
      if (mimicNames.length > 0) {
        against.push(`Consider alternative: ${listEn(mimicNames)}`);
      }
    }
    // Check diagnostic / exclusion clues
    if (disease.exclusionClues?.some(c => c.toLowerCase().includes(symptomId))) {
      against.push(`Exclusion clue for ${disease.name}: symptom appears in exclusion criteria`);
    }
  }
  return against;
}

function buildDiscussionNarrative(
  symptomId: string,
  socrates: SocratesFields,
  ddxLinks: string[],
  ddxAgainst: string[],
  form: PatientForm,
): string {
  const parts: string[] = [];
  const symptomLabel = SYMPTOM_LABEL[symptomId] || symptomId.replace(/_/g, ' ');

  // Build description from SOCRATES
  const descParts: string[] = [];
  if (socrates.onset) descParts.push(`${socrates.onset} onset`);
  if (socrates.character) descParts.push(`${socrates.character} in character`);
  if (socrates.site) descParts.push(`localised to ${socrates.site}`);
  if (socrates.severity) descParts.push(`${socrates.severity} in severity`);
  if (socrates.radiation) descParts.push(`radiating to ${socrates.radiation}`);
  if (socrates.timing) descParts.push(`timing: ${socrates.timing}`);
  if (socrates.associated.length > 0) descParts.push(`associated with ${listEn(socrates.associated)}`);
  if (socrates.exacerbating.length > 0) descParts.push(`exacerbated by ${listEn(socrates.exacerbating)}`);
  if (socrates.relieving.length > 0) descParts.push(`relieved by ${listEn(socrates.relieving)}`);

  if (descParts.length > 0) {
    parts.push(`The ${symptomLabel.toLowerCase()} is characterised by ${descParts.join('; ')}.`);
  } else {
    parts.push(`The ${symptomLabel.toLowerCase()} was reported.`);
  }

  // Add symptom-specific context
  if (symptomId === 'cough') {
    if (form.hpi.postTussiveVomiting) parts.push('There is associated post-tussive vomiting.');
    if (form.hpi.pertussisContact) parts.push('There is documented pertussis contact.');
    if (form.hpi.hoarseness) parts.push('Hoarseness is also noted.');
    if (form.hpi.pleuriticPain) parts.push('Pleuritic chest pain is reported.');
  }
  if (symptomId === 'fever') {
    if (form.hpi.nightSweats) parts.push('Drenching night sweats are reported.');
    if (form.hpi.tbContact) parts.push('There is known TB contact.');
  }
  if (symptomId === 'wheeze') {
    if (form.hpi.unilateralWheeze) parts.push('The wheeze is unilateral, raising suspicion for foreign body aspiration.');
    if (form.hpi.allergenTrigger) parts.push('Allergen triggers are identified.');
  }
  if (symptomId === 'difficulty_breathing') {
    const distress: string[] = [];
    if (form.hpi.chestIndrawing) distress.push('chest indrawing');
    if (form.hpi.grunting) distress.push('grunting');
    if (form.hpi.nasalFlaring) distress.push('nasal flaring');
    if (form.hpi.headBobbing) distress.push('head bobbing');
    if (form.hpi.tripodPosition) distress.push('tripod positioning');
    if (form.hpi.drooling) distress.push('drooling');
    if (form.hpi.orthopnea) distress.push('orthopnea');
    if (form.hpi.sweatingFeeds) distress.push('sweating during feeds');
    if (distress.length > 0) {
      parts.push(`Respiratory distress is evidenced by ${listEn(distress)}.`);
    }
  }

  // DDX reasoning
  if (ddxLinks.length > 0) {
    const linkStr = ddxLinks.join('. ');
    parts.push(linkStr.endsWith('.') ? linkStr : linkStr + '.');
  }
  if (ddxAgainst.length > 0) {
    const againstStr = ddxAgainst.join('. ');
    parts.push(againstStr.endsWith('.') ? againstStr : againstStr + '.');
  }

  return parts.join(' ');
}

// ── NEW: BUILD SYMPTOM DEEP DIVE ────────────────────────────────────────────

export function buildSymptomDeepDive(
  symptomId: string,
  form: PatientForm,
  differentials: ScoredDisease[],
): SymptomDeepDive {
  const lbl = SYMPTOM_LABEL[symptomId] || symptomId.replace(/_/g, ' ');
  const socrates = buildSocratesForSymptom(symptomId, form);
  const ddxLinks = buildDdxLinks(symptomId, form, differentials);
  const ddxAgainst = buildDdxAgainst(symptomId, form, differentials);
  const discussionNarrative = buildDiscussionNarrative(symptomId, socrates, ddxLinks, ddxAgainst, form);
  return {
    symptomId,
    label: lbl,
    socrates,
    ddxLinks,
    ddxAgainst,
    discussionNarrative,
  };
}

// ── NEW: BUILD ALL DEEP DIVES ───────────────────────────────────────────────

export function buildAllDeepDives(
  form: PatientForm,
  differentials: ScoredDisease[],
): SymptomDeepDive[] {
  const deepDives: SymptomDeepDive[] = [];
  for (const cid of form.complaints) {
    deepDives.push(buildSymptomDeepDive(cid, form, differentials));
  }
  // Sort chronologically by complaint durations
  const durations = form.complaintDurations || {};
  deepDives.sort((a, b) => {
    const aDay = parseInt(durations[a.symptomId] || '999') || 999;
    const bDay = parseInt(durations[b.symptomId] || '999') || 999;
    return aDay - bDay;
  });
  return deepDives;
}

// ── NEW: BUILD DDX DISCUSSION ───────────────────────────────────────────────

export function buildDDXDiscussion(
  form: PatientForm,
  differentials: ScoredDisease[],
): string {
  if (differentials.length === 0) return 'No differential diagnoses available.';

  const parts: string[] = [];

  for (const d of differentials.slice(0, 4)) {
    const disease = d.disease;
    const diseaseName = disease.name;
    const subParts: string[] = [];

    // Diagnostic clues
    if (disease.diagnosticClues && disease.diagnosticClues.length > 0) {
      const matchingClues = disease.diagnosticClues.filter(clue =>
        form.complaints.some(c => clue.toLowerCase().includes(c.replace(/_/g, ''))),
      );
      if (matchingClues.length > 0) {
        subParts.push(`Diagnostic clues present: ${listEn(matchingClues.map(c => c.toLowerCase()))}`);
      } else {
        subParts.push(`No matching diagnostic clues from: ${listEn(disease.diagnosticClues.map(c => c.toLowerCase()))}`);
      }
    }

    // Exclusion clues
    if (disease.exclusionClues && disease.exclusionClues.length > 0) {
      const matchingExclusions = disease.exclusionClues.filter(clue =>
        form.complaints.some(c => clue.toLowerCase().includes(c.replace(/_/g, ''))),
      );
      if (matchingExclusions.length > 0) {
        subParts.push(`Exclusion clues noted: ${listEn(matchingExclusions.map(c => c.toLowerCase()))}`);
      }
    }

    // History features
    const presentFeatures = (disease.historyFeatures || [])
      .filter(hf => form.complaints.includes(hf.symptomId))
      .sort((a, b) => (b.weight || 1) - (a.weight || 1));
    if (presentFeatures.length > 0) {
      const featureDesc = presentFeatures.map(f =>
        `${label(f.symptomId).toLowerCase()} (weight ${f.weight || 1})`,
      );
      subParts.push(`Supporting features: ${listEn(featureDesc)}`);
    }

    if (subParts.length > 0) {
      parts.push(`For ${diseaseName}: ${subParts.join('; ')}.`);
    } else {
      parts.push(`For ${diseaseName}: no specific symptom match from the history features or diagnostic clues.`);
    }
  }

  return parts.join(' ');
}

// ── NEW: BUILD COMPLICATIONS DISCUSSION ─────────────────────────────────────

export function buildComplicationsDiscussion(
  differentials: ScoredDisease[],
): string {
  if (differentials.length === 0) return 'No complications data available.';

  const parts: string[] = [];

  for (const d of differentials.slice(0, 4)) {
    const disease = d.disease;
    const complications = disease.complications || [];
    if (complications.length === 0) continue;

    const complicationStrs = complications.map(c => {
      const compName = c.diseaseId || (c as any).id || 'unknown';
      const pct = Math.round((c.probability || 0) * 100);
      let str = `${compName.replace(/_/g, ' ')} (${pct}%)`;
      if (c.clues && c.clues.length > 0) {
        const clueStr = c.clues.slice(0, 2).map(cl => cl.replace(/_/g, ' ')).join(', ');
        str += ` — clues: ${clueStr}`;
      }
      return str;
    });

    if (complicationStrs.length > 0) {
      parts.push(`${disease.name} carries risk of ${listEn(complicationStrs)}.`);
    }
  }

  return parts.join(' ');
}

// ── NEW: BUILD IMPACT ON LIFE ───────────────────────────────────────────────

export function buildImpactOnLife(form: PatientForm): string {
  const impacts: string[] = [];

  if (form.hpi.feedingDiff) {
    impacts.push('feeding has been significantly affected');
  } else if (form.nutrition.appetite?.toLowerCase().includes('poor') || form.nutrition.appetite?.toLowerCase().includes('decreased')) {
    impacts.push('appetite is reduced');
  }

  if (form.hpi.nocturnalCough) {
    impacts.push('sleep is disturbed by nocturnal cough');
  }

  if (form.ros.lethargyRos) {
    impacts.push('play and activity levels are reduced due to lethargy');
  }

  if (form.family.schoolAttendance?.toLowerCase().includes('miss') || form.family.schoolAttendance?.toLowerCase().includes('absent')) {
    impacts.push('school attendance has been affected');
  }

  if (impacts.length === 0) return '';

  const name = form.biodata.patientName || 'The patient';
  return `${name}'s current illness has impacted daily life: ${listEn(impacts)}.`;
}

// ── 1. TIMELINE BUILDER ─────────────────────────────────────────────────────

export function buildTimeline(form: PatientForm): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const durations = form.complaintDurations || {};

  // Build from complaint durations
  for (const cid of form.complaints) {
    const raw = durations[cid];
    const day = raw ? parseInt(raw) || null : null;
    const dur = raw ? `${raw} days` : undefined;

    // Infer severity from HPI context
    let severity: TimelineEvent['severity'] | undefined;
    if (cid === 'difficulty_breathing') {
      if (form.hpi.chestIndrawing || form.hpi.grunting) severity = 'severe';
      else if (form.hpi.nasalFlaring) severity = 'moderate';
      else severity = 'mild';
    } else if (cid === 'fever') {
      severity = form.hpi.highFever ? 'severe' : 'moderate';
    } else if (cid === 'cough') {
      severity = form.hpi.nocturnalCough ? 'moderate' : 'mild';
    } else if (cid === 'wheeze') {
      severity = form.hpi.wheezePattern === 'first' ? 'moderate' : 'mild';
    }

    events.push({
      symptomId: cid,
      label: label(cid),
      day,
      duration: dur,
      severity,
      isRedFlag: RED_FLAG_SYMPTOMS.has(cid),
    });
  }

  // Add inferred events from HPI
  if (form.hpi.chestIndrawing && !form.complaints.includes('difficulty_breathing')) {
    events.push({
      symptomId: 'chest_indrawing',
      label: 'Chest indrawing',
      day: null,
      duration: undefined,
      severity: 'severe',
      isRedFlag: true,
    });
  }
  if (form.hpi.cyanoticEpisodes && !form.complaints.includes('cyanosis')) {
    events.push({
      symptomId: 'cyanotic_episodes',
      label: 'Cyanotic episodes',
      day: null,
      duration: undefined,
      severity: 'critical',
      isRedFlag: true,
    });
  }
  if (form.hpi.feedingDiff) {
    events.push({
      symptomId: 'feeding_diff',
      label: 'Feeding difficulty',
      day: null,
      duration: undefined,
      severity: 'moderate',
      isRedFlag: true,
    });
  }
  if (form.hpi.seizureHPI) {
    events.push({
      symptomId: 'seizures',
      label: 'Seizures',
      day: null,
      duration: undefined,
      severity: 'critical',
      isRedFlag: true,
    });
  }

  // Sort by day descending (longest duration = earliest onset = first)
  events.sort((a, b) => {
    if (a.day !== null && b.day !== null) return b.day - a.day;
    if (a.day !== null) return -1;
    if (b.day !== null) return 1;
    return 0;
  });

  return events;
}

// ── 2. PRIORITIZE SYMPTOMS ──────────────────────────────────────────────────

export function prioritizeSymptoms(
  form: PatientForm,
  differentials: ScoredDisease[],
): PrioritizedSymptom[] {
  const result: PrioritizedSymptom[] = [];
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;

  for (const cid of form.complaints) {
    const weight = SYMPTOM_PRIORITY_WEIGHTS[cid] || 20;
    const isRedFlag = RED_FLAG_SYMPTOMS.has(cid);

    let reason = isRedFlag ? 'Red flag symptom' : 'Reported symptom';

    // Boost if top differential expects it
    if (differentials.length > 0) {
      const topDx = differentials[0];
      const expectedFeature = (topDx.disease.historyFeatures || []).find(f => f.symptomId === cid);
      if (expectedFeature) {
        reason = `Key feature for ${topDx.disease.name}`;
      }
    }

    // Age-based boost
    if (cid === 'wheeze' && ageMonths < 12) {
      reason = 'Common in this age group (bronchiolitis)';
    }
    if (cid === 'stridor' && ageMonths < 6) {
      reason = 'Congenital airway anomaly until proven otherwise';
    }

    result.push({
      symptomId: cid,
      label: label(cid),
      priority: weight,
      reason,
      isRedFlag,
    });
  }

  // Sort by priority descending
  result.sort((a, b) => b.priority - a.priority);

  return result;
}

// ── 3. BUILD CONSULTANT-LEVEL HPI NARRATIVE ────────────────────────────────

export function buildHPINarrative(
  form: PatientForm,
  timeline: TimelineEvent[],
  differentials: ScoredDisease[],
  deepDives?: SymptomDeepDive[],
  impactOnLife?: string,
): string {
  const p = pron(form);
  const name = form.biodata.patientName || 'The patient';
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;
  const ageStr = formatAge(ageMonths).replace(/^a\s+/i, '');
  const parts: string[] = [];

  if (timeline.length === 0) {
    return 'The history of presenting illness was not elicited.';
  }

  // Opening statement: age + sex + background + first symptom
  const bgParts: string[] = [];
  if (form.pmh.prevAdmissions || form.pmh.chronicIllnesses?.length) {
    bgParts.push('with a history of prior illness');
  }
  if (!form.pmh.hiv && form.family.smokingExposure) {
    bgParts.push('with passive smoke exposure at home');
  }
  if (form.birth.gestAgeWeeks && parseInt(form.birth.gestAgeWeeks) < 37) {
    bgParts.push('born prematurely');
  }
  const bgStr = bgParts.length > 0 ? `, ${listEn(bgParts)},` : '';

  const firstEvent = timeline[0];
  const hasDurations = timeline.some(e => e.day !== null);

  if (hasDurations && firstEvent) {
    const maxDay = Math.max(...timeline.filter(e => e.day !== null).map(e => e.day as number), 0);
    parts.push(
      `${name}, a ${ageStr} ${p.sub.toLowerCase()} child${bgStr}, presented with a ${maxDay}-day history of ${firstEvent.label.toLowerCase()}.`,
    );
  } else if (firstEvent) {
    parts.push(
      `${name}, a ${ageStr} ${p.sub.toLowerCase()} child${bgStr}, presented with ${firstEvent.label.toLowerCase()}.`,
    );
  } else {
    parts.push(`${name}, a ${ageStr} ${p.sub.toLowerCase()} child${bgStr}, presented with respiratory symptoms.`);
  }

  // Chronological progression
  if (hasDurations && timeline.length >= 2) {
    const progression: string[] = [];
    for (let i = 1; i < timeline.length; i++) {
      const e = timeline[i];
      if (e.day !== null && firstEvent?.day !== null) {
        const lag = e.day - (firstEvent?.day ?? 0);
        if (lag > 0) {
          progression.push(`${e.label.toLowerCase()} developed ${lag} day(s) later`);
        } else {
          progression.push(`${e.label.toLowerCase()} was also present`);
        }
      } else {
        progression.push(`${e.label.toLowerCase()} was also noted`);
      }
    }
    if (progression.length > 0) {
      parts.push(`The illness evolved progressively: ${listEn(progression)}.`);
    }
  } else if (timeline.length >= 2) {
    const allLabels = timeline.slice(1).map(e => e.label.toLowerCase());
    parts.push(`Associated symptoms included ${listEn(allLabels)}.`);
  }

  // Per-symptom SOCRATES deep dives
  if (deepDives && deepDives.length > 0) {
    for (const dd of deepDives) {
      parts.push(dd.discussionNarrative);
    }
  }

  // Impact on life
  if (impactOnLife) {
    parts.push(impactOnLife);
  }

  // Red flag overlay
  const redFlags: string[] = [];
  if (form.hpi.cyanoticEpisodes) redFlags.push('cyanotic episodes');
  if (form.hpi.feedingDiff) redFlags.push('reduced feeding');
  if (form.hpi.drooling) redFlags.push('drooling');
  if (form.hpi.tripodPosition) redFlags.push('tripod positioning');
  if (form.hpi.seizureHPI) redFlags.push('seizures');
  if (form.ros.lethargyRos) redFlags.push('lethargy');
  if (redFlags.length > 0) {
    parts.push(`Red flag features: ${listEn(redFlags)}.`);
  }

  // Notable negatives
  const negs: string[] = [];
  if (form.hpi.suddenOnset === false && !form.complaints.includes('stridor') && !form.hpi.drooling) {
    negs.push('no sudden onset/choking episode');
  }
  if (form.hpi.cyanoticEpisodes === false) negs.push('no cyanosis');
  if (form.hpi.seizureHPI === false) negs.push('no seizures');
  if (form.hpi.nightSweats === false && form.hpi.tbContact === false) negs.push('no TB contact or night sweats');
  if (form.hpi.vomitingHPI === false) negs.push('no vomiting');
  if (form.hpi.feedingDiff === false) negs.push('feeding preserved');
  if (negs.length > 0) {
    parts.push(`The caregiver specifically noted ${listEn(negs)}.`);
  }

  // Treatment response
  if (form.hpi.prevTx) {
    const response = form.hpi.txResponse ? `, with ${form.hpi.txResponse}` : '';
    parts.push(`Prior to presentation, the child had received ${form.hpi.prevTx}${response}.`);
  }

  return parts.join(' ');
}

// ── 4. MISSING QUESTION DETECTOR ────────────────────────────────────────────

export function detectMissingQuestions(
  form: PatientForm,
  differentials: ScoredDisease[],
): string[] {
  const questions: string[] = [];
  const complaints = new Set(form.complaints);

  if (complaints.has('cough')) {
    if (!form.hpi.coughDuration) questions.push('Duration and character of cough?');
    if (!form.hpi.nocturnalCough && !form.hpi.coughChar) questions.push('Is the cough nocturnal or exercise-triggered?');
    if (!form.hpi.postTussiveVomiting) questions.push('Is there post-tussive vomiting?');
  }

  if (complaints.has('fever')) {
    if (!form.hpi.feverPattern) questions.push('What is the fever pattern?');
    if (!form.hpi.feverDuration) questions.push('Duration of fever?');
    if (!form.hpi.nightSweats) questions.push('Are there night sweats?');
  }

  if (complaints.has('wheeze') || form.hpi.wheeze) {
    if (!form.hpi.wheezePattern) questions.push('Is this the first wheezing episode or recurrent?');
    if (form.hpi.unilateralWheeze === undefined) questions.push('Is the wheeze unilateral? (to exclude foreign body)');
  }

  if (complaints.has('difficulty_breathing') || form.hpi.chestIndrawing) {
    if (!form.hpi.feedingDiff) questions.push('Is there feeding difficulty? (critical severity marker)');
    if (!form.hpi.cyanoticEpisodes) questions.push('Were there cyanotic episodes?');
    if (!form.hpi.sweatingFeeds && form.hpi.feedingDiff) questions.push('Is there sweating during feeds? (suggests cardiac cause)');
  }

  // DDX-driven questions
  for (const d of differentials.slice(0, 3)) {
    const disease = d.disease;
    // Check for missing critical features
    for (const hf of disease.historyFeatures || []) {
      const featureId = hf.symptomId;
      const weight = hf.weight || 1;
      if (weight >= 3 && !complaints.has(featureId)) {
        const l = SYMPTOM_LABEL[featureId] || featureId.replace(/_/g, ' ');
        questions.push(`For ${disease.name}: is ${l} present? (high-weight feature)`);
      }
    }
    // Check for mimics
    for (const mimic of disease.mimics || []) {
      questions.push(`Consider ${mimic.diseaseId} as mimic — any discriminators present?`);
    }
  }

  // Deduplicate
  return [...new Set(questions)];
}

// ── 5. BUILD SUMMARY STATEMENT ──────────────────────────────────────────────

export function buildSummaryStatement(
  form: PatientForm,
  timeline: TimelineEvent[],
  differentials: ScoredDisease[],
): string {
  const ageMonths = parseInt(form.biodata.ageMonths) || 0;
  const ageStr = formatAge(ageMonths).replace(/^a\s+/i, '');
  const sex = form.biodata.sex?.toLowerCase() === 'male' ? 'male' : 'female';

  // Background
  const bg: string[] = [];
  if (form.biodata.residence) bg.push(`from ${form.biodata.residence}`);
  if (form.family.housingConditions?.toLowerCase().includes('slum') || form.family.housingConditions?.toLowerCase().includes('crowd')) {
    bg.push('overcrowded housing');
  }
  const bgStr = bg.length > 0 ? ` (${listEn(bg)})` : '';

  // Duration and complaints
  const maxDay = timeline.length > 0 && timeline.some(e => e.day !== null)
    ? Math.max(...timeline.filter(e => e.day !== null).map(e => e.day as number), 0)
    : null;

  const ccList = timeline.slice(0, 3).map(e => e.label.toLowerCase());
  const ccStr = ccList.length > 0 ? listEn(ccList) : 'no clear chief complaints';

  const durationStr = maxDay !== null ? `${maxDay}-day history of ` : '';

  // Severity context from timeline
  const critical = timeline.filter(e => e.severity === 'critical').map(e => e.label.toLowerCase());
  const severe = timeline.filter(e => e.severity === 'severe').map(e => e.label.toLowerCase());
  const severityStr: string[] = [];
  if (critical.length > 0) severityStr.push(`critical features (${listEn(critical)})`);
  if (severe.length > 0) severityStr.push(`severe features (${listEn(severe)})`);

  // Risk factors
  const rf: string[] = [];
  if (form.birth.gestAgeWeeks && parseInt(form.birth.gestAgeWeeks) < 37) rf.push('prematurity');
  if (form.pmh.hiv) rf.push('HIV-positive');
  if (form.family.smokingExposure) rf.push('smoke exposure');
  if (form.hpi.tbContact) rf.push('TB contact');
  if (form.immunization.status?.toLowerCase().includes('incomplete')) rf.push('incomplete immunisation');
  const rfStr = rf.length > 0 ? ` in the context of ${listEn(rf)}` : '';

  // Impression from top differential
  let impression = '';
  if (differentials.length > 0) {
    const top = differentials[0];
    const topName = top.disease.name;
    impression = `, most consistent with ${topName}`;
  }

  return `A ${ageStr} ${sex} child${bgStr} presented with ${durationStr}${ccStr}${rfStr}${severityStr.length > 0 ? ', with ' + listEn(severityStr) : ''}${impression}.`;
}

// ── 6. ORCHESTRATOR ─────────────────────────────────────────────────────────

export function runHPIEngine(
  form: PatientForm,
  differentials: ScoredDisease[],
): HPIEngineOutput {
  const timeline = buildTimeline(form);
  const prioritizedSymptoms = prioritizeSymptoms(form, differentials);
  const symptomDeepDives = buildAllDeepDives(form, differentials);
  const impactOnLife = buildImpactOnLife(form);
  const ddxDiscussion = buildDDXDiscussion(form, differentials);
  const complicationsDiscussion = buildComplicationsDiscussion(differentials);
  const narrative = buildHPINarrative(form, timeline, differentials, symptomDeepDives, impactOnLife);
  const openingStatement = timeline.length > 0
    ? `A ${formatAge(parseInt(form.biodata.ageMonths) || 0).replace(/^a\s+/i, '')} ${form.biodata.sex?.toLowerCase() === 'male' ? 'male' : 'female'} child presented with ${listEn(timeline.slice(0, 3).map(e => e.label.toLowerCase()))}.`
    : 'History of presenting illness not available.';
  const summaryStatement = buildSummaryStatement(form, timeline, differentials);
  const missingCriticalQuestions = detectMissingQuestions(form, differentials);
  const ddxDrivenQuestions = differentials.slice(0, 3).flatMap(d =>
    (d.disease.historyFeatures || [])
      .filter(hf => (hf.weight || 1) >= 3 && !form.complaints.includes(hf.symptomId))
      .map(hf => `Is ${label(hf.symptomId)} present? (high-yield for ${d.disease.name})`),
  );

  return {
    timeline,
    prioritizedSymptoms,
    narrative,
    openingStatement,
    summaryStatement,
    missingCriticalQuestions,
    ddxDrivenQuestions: [...new Set(ddxDrivenQuestions)],
    symptomDeepDives,
    ddxDiscussion,
    complicationsDiscussion,
  };
}
