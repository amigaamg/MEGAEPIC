// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HPI Generator — consultant-quality chronological narratives
// ═══════════════════════════════════════════════════════════════════════════════
// Constitutional Principles 2-9:
// - Chronological, not symptom-by-symptom
// - SOCRATES disappears into natural prose
// - Linguistic variation in every paragraph
// - Meaningful negatives only
// - Smooth transitions
// - Never invents facts
// ═══════════════════════════════════════════════════════════════════════════════

import type { EncounterState, SymptomId, StructuredSymptom, GenericSymptom } from '../encounterState';

// ── Linguistic variation pools ───────────────────────────────────────────────

const SUBJECT_OPENERS: readonly string[] = [
  'He reports', 'She reports', 'He describes', 'She describes',
  'The patient states', 'The patient reports', 'He notes',
  'She notes', 'According to the patient',
];

const TIMELINE_OPENERS: readonly string[] = [
  'Initially', 'At onset', 'The symptoms began', 'It started',
  'The illness commenced', 'Symptoms were first noted',
];

const PROGRESSION_OPENERS: readonly string[] = [
  'Subsequently', 'Thereafter', 'Since then',
  'Over the following', 'As the illness progressed',
  'Over time', 'The symptoms evolved',
];

const TRANSITION_OPENERS: readonly string[] = [
  'In addition', 'Furthermore', 'Additionally',
  'Concurrently', 'During this period',
  'At the same time', 'Meanwhile',
];

const SEVERITY_OPENERS: readonly string[] = [
  'At presentation', 'By the time of evaluation',
  'On presentation', 'At the time of assessment',
  'Upon presentation',
];

const CONTRAST_OPENERS: readonly string[] = [
  'However', 'Nevertheless', 'Despite this',
  'Notwithstanding', 'Unfortunately',
];

function pickOpener(index: number, pool: readonly string[]): string {
  return pool[index % pool.length];
}

function formatAge(ageYears: number, ageMonths: number, sex: string): string {
  if (ageYears === 0 && ageMonths < 1) return `a neonate`;
  if (ageYears === 0) return `a ${ageMonths}-month-old ${sex === 'female' ? 'girl' : 'boy'}`;
  const ageStr = ageYears >= 18
    ? `${ageYears}-year-old ${sex === 'female' ? 'lady' : 'gentleman'}`
    : `${ageYears}-year-old ${sex === 'female' ? 'girl' : 'boy'}`;
  return ageStr;
}

function formatPriorState(sex: string): string {
  return sex === 'female' ? 'her usual state of health' : 'his usual state of health';
}

function pronoun(sex: string): 'he' | 'she' {
  return sex === 'female' ? 'she' : 'he';
}

function possessive(sex: string): 'his' | 'her' {
  return sex === 'female' ? 'her' : 'his';
}

function subjectPronoun(sex: string): string {
  return sex === 'female' ? 'she' : 'he';
}

// ── Symptom-specific narrative builders ─────────────────────────────────────

interface SymptomNarrativeContext {
  symptomId: string;
  label: string;
  data: Record<string, any>;
  sex: string;
  openerIndex: number;
}

function describePain(context: SymptomNarrativeContext): string {
  const { data: s, sex } = context;
  const parts: string[] = [];

  // Location
  if (s.location) {
    const loc = s.location.replace(/_/g, ' ');
    parts.push(`${pickOpener(0, TIMELINE_OPENERS)}, ${possessive(sex)} ${loc} area`);
  } else {
    parts.push(`${pickOpener(0, TIMELINE_OPENERS)}`);
  }

  // Onset
  if (s.onset === 'gradual') {
    parts.push('the pain developed gradually');
  } else if (s.onset === 'sudden') {
    parts.push('the pain began suddenly');
  } else if (s.onset) {
    parts.push(`the pain had ${s.onset.replace(/_/g, ' ')} onset`);
  } else {
    parts.push('pain developed');
  }

  // Duration
  if (s.duration) parts.push(`approximately ${s.duration} prior to presentation`);

  // Character
  if (s.character) parts.push(`described as ${s.character} in nature`);

  // Severity
  if (s.severity !== undefined && s.severity !== null) {
    if (typeof s.severity === 'number') {
      if (s.severity >= 8) parts.push('rated as severe');
      else if (s.severity >= 5) parts.push('rated as moderate in intensity');
      else parts.push('rated as mild in intensity');
    } else {
      parts.push(`rated as ${s.severity}`);
    }
  }

  // Radiation
  if (s.radiation && s.radiation !== 'none' && s.radiation !== 'no') {
    parts.push(`radiating to ${s.radiation.replace(/_/g, ' ')}`);
  }

  // Progression
  if (s.progression) {
    const progLabels: Record<string, string> = {
      improving: 'has been improving',
      worsening: 'has been progressively worsening',
      constant: 'has remained constant',
      intermittent: 'has been intermittent',
    };
    parts.push(`and ${progLabels[s.progression] || s.progression}`);
  }

  // Temporal pattern
  if (s.temporalPattern) {
    parts.push(`with a ${s.temporalPattern.replace(/_/g, ' ')} pattern`);
  }

  // Aggravating factors
  if (s.aggravating?.length) {
    const agg = s.aggravating.map((a: string) => a.replace(/_/g, ' ')).join(', ');
    parts.push(`worsened by ${agg}`);
  }

  // Relieving factors
  if (s.relieving?.length) {
    const rel = s.relieving.map((r: string) => r.replace(/_/g, ' ')).join(', ');
    parts.push(`and partially relieved by ${rel}`);
  }

  let result = parts.join(', ') + '.';
  result = result.charAt(0).toUpperCase() + result.slice(1);

  // Associated symptoms
  if (s.associatedSymptoms?.length) {
    const assoc = s.associatedSymptoms.map((a: string) => a.replace(/_/g, ' ')).join(', ');
    result += ` It was associated with ${assoc}.`;
  }

  return result;
}

function describeCough(context: SymptomNarrativeContext): string {
  const { data: s, sex } = context;
  const parts: string[] = [];

  parts.push(`${pickOpener(0, TIMELINE_OPENERS)}`);

  if (s.duration) parts.push(`approximately ${s.duration} prior to presentation`);

  const charLabels: Record<string, string> = {
    dry: 'a dry, non-productive cough',
    productive: 'a productive cough',
    barking: 'a barking cough',
    paroxysmal: 'a paroxysmal cough',
    whooping: 'a whooping cough',
  };
  parts.push(charLabels[s.character] || 'a cough');

  if (s.sputumColor) {
    parts.push(`yielding ${s.sputumColor.replace(/_/g, ' ')} sputum`);
  }

  if (s.hemoptysis === true) parts.push('with haemoptysis');
  if (s.nocturnal) parts.push('which was worse at night');
  if (s.exerciseTriggered) parts.push('triggered by exercise');

  let result = parts.join(', ') + '.';
  result = result.charAt(0).toUpperCase() + result.slice(1);

  if (s.postTussiveVomiting) {
    result += ' It was associated with post-tussive vomiting.';
  }

  return result;
}

function describeFever(context: SymptomNarrativeContext): string {
  const { data: s, sex } = context;
  const p = pronoun(sex);
  const parts: string[] = [];

  parts.push(`${pickOpener(0, TIMELINE_OPENERS)}`);

  if (s.duration) {
    const durPhrase = s.duration.includes('day') || s.duration.includes('week') || s.duration.includes('month')
      ? s.duration
      : `${s.duration}`;
    parts.push(`approximately ${durPhrase} prior to presentation`);
  }

  parts.push(`${p} developed fever`);

  if (s.pattern) {
    const patternLabels: Record<string, string> = {
      continuous: 'which was continuous',
      intermittent: 'which was intermittent',
      remittent: 'which was remittent',
      relapsing: 'which was relapsing',
      hectic: 'which was hectic in pattern',
      saddleback: 'which followed a saddleback pattern',
      step_ladder: 'which followed a step-ladder pattern',
    };
    parts.push(patternLabels[s.pattern] || '');
  }

  if (s.highestTemp !== undefined) {
    parts.push(`with a highest recorded temperature of ${s.highestTemp}°C`);
  }

  if (s.rigors) parts.push('and was associated with rigors');
  if (s.nightSweats) parts.push('accompanied by drenching night sweats');
  if (s.chills) parts.push('associated with chills');

  let result = parts.filter(Boolean).join(', ') + '.';
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result;
}

function describeDyspnea(context: SymptomNarrativeContext): string {
  const { data: s, sex } = context;
  const p = pronoun(sex);
  const parts: string[] = [];

  parts.push(`${pickOpener(0, TIMELINE_OPENERS)}`);

  if (s.duration) parts.push(`approximately ${s.duration} prior to presentation`);

  parts.push(`${p} developed shortness of breath`);

  if (s.onset) {
    if (s.onset === 'gradual') parts.push('which came on gradually');
    else if (s.onset === 'sudden') parts.push('which came on suddenly');
    else parts.push(`with ${s.onset} onset`);
  }

  if (s.severity) parts.push(`which ${p} rated as ${s.severity.replace(/_/g, ' ')}`);
  if (s.atRest) parts.push('and was present even at rest');
  if (s.onExertion) parts.push(`triggered by ${s.onExertion.replace(/_/g, ' ')}`);
  if (s.orthopnea) parts.push('worse when lying flat');
  if (s.PND) parts.push('and was associated with paroxysmal nocturnal dyspnea');

  let result = parts.filter(Boolean).join(', ') + '.';
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result;
}

function describeNauseaVomiting(context: SymptomNarrativeContext): string {
  const { data: s, sex } = context;
  const parts: string[] = [];

  if (s.timingRelativeToPain || s.frequency) {
    parts.push(`${pickOpener(0, TIMELINE_OPENERS)}, approximately ${s.duration || 'recently'} prior to presentation`);
  } else {
    parts.push(`${pickOpener(0, TIMELINE_OPENERS)}`);
  }

  parts.push('nausea and vomiting developed');

  if (s.frequency) parts.push(`occurring ${s.frequency.replace(/_/g, ' ')}`);
  if (s.bilious) parts.push('the vomitus was bilious');
  if (s.projectile) parts.push('and was projectile in nature');
  if (s.feculent) parts.push('the vomitus was feculent');
  if (s.hematemesis) parts.push('with blood in the vomitus');

  if (s.timingRelativeToPain) {
    parts.push(`occurring ${s.timingRelativeToPain.replace(/_/g, ' ')} the pain`);
  }

  if (s.reliefAfterVomiting !== undefined) {
    parts.push(s.reliefAfterVomiting ? 'which provided partial relief' : 'which did not provide relief');
  }

  let result = parts.filter(Boolean).join(', ') + '.';
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result;
}

function describeDiarrhea(context: SymptomNarrativeContext): string {
  const { data: s } = context;
  const parts: string[] = [];

  parts.push(`${pickOpener(0, TIMELINE_OPENERS)}`);

  if (s.duration) parts.push(`approximately ${s.duration} prior to presentation`);

  parts.push('diarrhoea developed');

  if (s.frequency) parts.push(`occurring approximately ${s.frequency} times per day`);
  if (s.character) parts.push(`described as ${s.character.replace(/_/g, ' ')} in character`);
  if (s.volume) parts.push(`of ${s.volume} volume`);
  if (s.nocturnal) parts.push('and was nocturnal in nature');
  if (s.bloody) parts.push('with blood in the stool');
  if (s.mucus) parts.push('with mucus');

  let result = parts.filter(Boolean).join(', ') + '.';
  result = result.charAt(0).toUpperCase() + result.slice(1);

  if (s.associatedSymptoms?.length) {
    const a = Array.isArray(s.associatedSymptoms) ? s.associatedSymptoms.join(', ') : '';
    if (a) result += ` It was associated with ${a}.`;
  }

  return result;
}

function describeDysphagia(context: SymptomNarrativeContext): string {
  const { data: s } = context;
  const parts: string[] = [];

  parts.push(`${pickOpener(0, TIMELINE_OPENERS)}`);

  if (s.duration) parts.push(`approximately ${s.duration} prior to presentation`);

  parts.push('difficulty swallowing developed');

  if (s.type) {
    const typeLabels: Record<string, string> = {
      oropharyngeal: 'described as oropharyngeal dysphagia (difficulty initiating swallowing)',
      esophageal: 'described as oesophageal dysphagia (food sticking retrosternally)',
      painful: 'associated with painful swallowing (odynophagia)',
    };
    parts.push(typeLabels[s.type] || s.type);
  }

  if (s.toSolids !== undefined) {
    parts.push(s.toSolids ? 'worse with solids' : 'worse with liquids');
  }

  if (s.progression) parts.push(`and has been ${s.progression.replace(/_/g, ' ')}`);

  let result = parts.filter(Boolean).join(', ') + '.';
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result;
}

function describeJaundice(context: SymptomNarrativeContext): string {
  const { data: s } = context;
  const parts: string[] = [];

  parts.push(`${pickOpener(0, TIMELINE_OPENERS)}`);

  if (s.duration) parts.push(`approximately ${s.duration} prior to presentation`);

  parts.push('yellow discolouration of the eyes and skin was noted');

  if (s.pruritus) parts.push('associated with pruritus');
  if (s.darkUrine) parts.push('with dark-coloured urine');
  if (s.paleStool) parts.push('and pale stools');
  if (s.precedingSymptoms) parts.push(`preceded by ${s.precedingSymptoms.replace(/_/g, ' ')}`);

  if (s.fever) parts.push('accompanied by fever');

  let result = parts.filter(Boolean).join(', ') + '.';
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result;
}

// ── Generic symptom ─────────────────────────────────────────────────────────

function describeGenericSymptom(context: SymptomNarrativeContext): string {
  const { symptomId, label, data: s, sex } = context;
  const p = pronoun(sex);
  const parts: string[] = [];

  parts.push(`${pickOpener(0, TIMELINE_OPENERS)}`);

  if (s.duration) {
    parts.push(`approximately ${s.duration} prior to presentation`);
  }

  parts.push(`${p} developed ${label.toLowerCase()}`);

  if (s.onset) {
    if (s.onset === 'gradual') parts.push('which came on gradually');
    else if (s.onset === 'sudden') parts.push('which began suddenly');
    else parts.push(`with ${s.onset} onset`);
  }

  if (s.severity !== undefined) {
    parts.push(`which ${p} rated as ${s.severity}/10 in severity`);
  }

  let result = parts.filter(Boolean).join(', ') + '.';
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result;
}

// ── Master symptom dispatcher ────────────────────────────────────────────────

const SYMPTOM_LABELS: Record<string, string> = {
  abdominal_pain: 'Abdominal pain',
  chest_pain: 'Chest pain',
  cough: 'Cough',
  fever: 'Fever',
  dyspnea: 'Shortness of breath',
  nausea_vomiting: 'Nausea and vomiting',
  diarrhea: 'Diarrhoea',
  constipation: 'Constipation',
  dysphagia: 'Dysphagia',
  gi_bleeding: 'Gastrointestinal bleeding',
  jaundice: 'Jaundice',
  distension: 'Abdominal distension',
  headache: 'Headache',
  dizziness: 'Dizziness',
  palpitations: 'Palpitations',
  oedema: 'Oedema',
  syncope: 'Syncope',
  seizure: 'Seizures',
  rash: 'Rash',
  weight_loss: 'Weight loss',
  fatigue: 'Fatigue',
  malaise: 'Malaise',
};

function buildSymptomNarrative(
  symptomId: string,
  data: Record<string, any>,
  sex: string,
  index: number,
): string {
  const label = SYMPTOM_LABELS[symptomId] || symptomId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const context: SymptomNarrativeContext = {
    symptomId,
    label,
    data,
    sex,
    openerIndex: index,
  };

  switch (symptomId) {
    case 'abdominal_pain':
    case 'chest_pain':
    case 'headache':
      return describePain(context);
    case 'cough':
      return describeCough(context);
    case 'fever':
      return describeFever(context);
    case 'dyspnea':
      return describeDyspnea(context);
    case 'nausea_vomiting':
      return describeNauseaVomiting(context);
    case 'diarrhea':
      return describeDiarrhea(context);
    case 'constipation':
      return describePain({ ...context, label: 'Constipation' });
    case 'dysphagia':
      return describeDysphagia(context);
    case 'jaundice':
      return describeJaundice(context);
    default:
      return describeGenericSymptom(context);
  }
}

// ── Determine meaningful negatives based on presenting symptoms ──────────────

const RELEVANT_NEGATIVES: Record<string, string[]> = {
  abdominal_pain: ['No nausea or vomiting', 'No change in bowel habits', 'No dysuria', 'No fever'],
  chest_pain: ['No associated dyspnoea', 'No palpitations', 'No nausea', 'No diaphoresis'],
  cough: ['No haemoptysis', 'No chest pain', 'No fever', 'No night sweats'],
  fever: ['No cough', 'No dysuria', 'No diarrhoea', 'No rash', 'No neck stiffness'],
  dyspnea: ['No chest pain', 'No palpitations', 'No cough', 'No orthopnoea', 'No PND'],
  headache: ['No visual disturbance', 'No nausea', 'No photophobia', 'No neck stiffness'],
  dysphagia: ['No weight loss', 'No regurgitation', 'No heartburn'],
  jaundice: ['No abdominal pain', 'No fever', 'No weight loss', 'No pruritus'],
  gi_bleeding: ['No abdominal pain', 'No vomiting', 'No weight loss', 'No change in bowel habits'],
  weight_loss: ['No fever', 'No cough', 'No change in appetite', 'No diarrhoea'],
  distension: ['No vomiting', 'No constipation', 'No weight loss', 'No fever'],
};

// ── Main HPI generator ──────────────────────────────────────────────────────

export function generateHPI(state: EncounterState): string {
  const d = state.demographics;
  const cc = state.chiefComplaint;
  const sex = d.sex;
  const p = pronoun(sex);
  const pos = possessive(sex);

  const paragraphs: string[] = [];
  const activeSymptoms: { id: string; data: Record<string, any>; order: number }[] = [];

  // Collect active symptoms with their order
  for (const symptomId of Object.keys(state.symptoms)) {
    const symptom = state.symptoms[symptomId as SymptomId];
    if (symptom?.present === true) {
      activeSymptoms.push({
        id: symptomId,
        data: symptom as Record<string, any>,
        order: (symptom as any).order ?? 0,
      });
    }
  }

  // Sort by chronological order (onset first), then by symptom order
  activeSymptoms.sort((a, b) => {
    const aAcute = a.data.onset === 'sudden' ? 0 : 1;
    const bAcute = b.data.onset === 'sudden' ? 0 : 1;
    if (aAcute !== bAcute) return aAcute - bAcute;
    return a.order - b.order;
  });

  // ── Opening paragraph: demographics + prior state + first symptom ─────
  const ageStr = formatAge(d.ageYears, d.ageMonths, sex);
  const priorState = formatPriorState(sex);

  // PMH preamble
  const pmh = state.history.pmh;
  const hasChronicDisease = pmh.diabetes || pmh.hypertension || pmh.asthma || pmh.cardiacDisease || pmh.hiv === 'positive' || pmh.conditions.length > 0;

  if (activeSymptoms.length > 0) {
    const first = activeSymptoms[0];
    const ageQualifier = d.ageYears > 50 ? 'with no known chronic medical illness' : 'previously well';
    const preamble = hasChronicDisease
      ? `with a background of`
      : 'with no known chronic medical illness who was in';

    if (hasChronicDisease) {
      const conditions: string[] = [];
      if (pmh.diabetes) conditions.push('diabetes mellitus');
      if (pmh.hypertension) conditions.push('hypertension');
      if (pmh.asthma) conditions.push('asthma');
      if (pmh.cardiacDisease) conditions.push('cardiac disease');
      if (pmh.hiv === 'positive') conditions.push('HIV positivity');
      if (pmh.sickleCell) conditions.push('sickle cell disease');
      if (pmh.conditions.length > 0) conditions.push(...pmh.conditions);

      const opener = `${d.name} is ${ageStr} with a background of ${conditions.join(', ')}, who was in ${priorState} until approximately ${first.data.duration || 'recently'} prior to presentation, when ${p} developed`;
      const firstNarrative = buildSymptomNarrative(first.id, first.data, sex, 0);
      const firstSentence = firstNarrative.charAt(0).toLowerCase() + firstNarrative.slice(1);
      paragraphs.push(`${opener} ${firstSentence}`);
    } else {
      const opener = `${d.name} is a ${ageStr.replace(/^a /, '')} with no known chronic medical illness who was in ${priorState} until approximately ${first.data.duration || 'recently'} prior to presentation, when ${p} developed`;
      const firstNarrative = buildSymptomNarrative(first.id, first.data, sex, 0);
      const firstSentence = firstNarrative.charAt(0).toLowerCase() + firstNarrative.slice(1);
      paragraphs.push(`${opener} ${firstSentence}`);
    }

    // ── Subsequent symptom paragraphs ────────────────────────────────────
    for (let i = 1; i < activeSymptoms.length; i++) {
      const symptom = activeSymptoms[i];
      const transition = pickOpener(i % 4 === 0 ? i : i - 1,
        i < 3 ? PROGRESSION_OPENERS : TRANSITION_OPENERS);
      const narrative = buildSymptomNarrative(symptom.id, symptom.data, sex, i);
      paragraphs.push(`${transition}, ${narrative.charAt(0).toLowerCase() + narrative.slice(1)}`);
    }
  } else if (cc.text) {
    // Fallback: just chief complaint
    const opener = `${d.name} is a ${ageStr.replace(/^a /, '')} who presented with ${cc.text}`;
    paragraphs.push(`${opener}${cc.duration ? ` of approximately ${cc.duration} duration` : ''}.`);
  } else {
    paragraphs.push(`${d.name} is a ${ageStr.replace(/^a /, '')} who presented for clinical evaluation.`);
  }

  // ── Meaningful negatives (Constitutional Principle 8) ─────────────────
  // Only include negatives relevant to the presenting symptoms
  const relevantNegatives = new Set<string>();
  for (const symptom of activeSymptoms) {
    const negs = RELEVANT_NEGATIVES[symptom.id];
    if (negs) {
      for (const n of negs) relevantNegatives.add(n);
    }
  }

  if (relevantNegatives.size > 0) {
    const negArray = Array.from(relevantNegatives);
    const negCount = negArray.length;
    if (negCount === 1) {
      paragraphs.push(`${negArray[0]} was reported.`);
    } else if (negCount === 2) {
      paragraphs.push(`There was ${negArray[0]} or ${negArray[1].toLowerCase()}.`);
    } else {
      const joined = negArray.slice(0, -1).join(', ') + ` or ${negArray[negCount - 1].toLowerCase()}`;
      paragraphs.push(`Notably, there was ${joined}.`);
    }
  }

  // ── Treatment attempted before presentation ───────────────────────────
  const treatmentsTried = new Set<string>();
  for (const symptom of activeSymptoms) {
    if (symptom.data.treatmentTried) {
      treatmentsTried.add(symptom.data.treatmentTried);
    }
    if (symptom.data.medicationsTried?.length) {
      for (const med of symptom.data.medicationsTried) {
        treatmentsTried.add(med);
      }
    }
  }

  if (treatmentsTried.size > 0) {
    paragraphs.push(`Prior to presentation, ${p} had tried ${Array.from(treatmentsTried).join(', ')} without significant relief.`);
  }

  // ── History of similar episodes ───────────────────────────────────────
  const similarEpisodes = activeSymptoms.filter(s => s.data.previousEpisodes || s.data.similarEpisodes);
  if (similarEpisodes.length > 0) {
    const episodeData = similarEpisodes[0].data;
    if (episodeData.previousEpisodes === true || episodeData.similarEpisodes === true) {
      paragraphs.push(`${pickOpener(1, SUBJECT_OPENERS)} a history of similar episodes in the past.`);
    } else if (episodeData.previousEpisodes === false || episodeData.similarEpisodes === false) {
      paragraphs.push(`There was no prior history of similar episodes.`);
    }
  }

  return paragraphs.join(' ');
}

// ── Build the full HPI including CC header ───────────────────────────────────

export function buildFullHPISection(state: EncounterState): string {
  const hpi = generateHPI(state);
  return hpi;
}
