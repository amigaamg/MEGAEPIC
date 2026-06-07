/**
 * LBO History Reasoning Engine — Consultant-Grade Narrative
 *
 * Produces:
 *   1. Auto-generated HPI narrative in polished surgical English
 *   2. Risk factor extraction (positive and negative)
 *   3. Complication screening from history alone
 *   4. DDX clues from history (what favours/opposes each diagnosis)
 */

import type { RegistrationData, HistoryData, SymptomStream, StreamRole } from '../lbo-records';

// ── Output Types ───────────────────────────────────────────────────────────

export interface HistoryReasoningOutput {
  summary: string;
  riskFactors: {
    present: { factor: string; significance: 'major' | 'minor' }[];
    absent: { factor: string; significance: 'major' | 'minor' }[];
  };
  complicationScreening: {
    complication: string;
    suspicion: 'low' | 'moderate' | 'high';
    triggerFindings: string[];
  }[];
  ddxClues: {
    diagnosis: string;
    inFavor: { finding: string; reasoning: string; weight: number }[];
    against: { finding: string; reasoning: string; weight: number }[];
    netScore: number;
  }[];
}

type G = { sub: string; obj: string; pos: string; title: string };

const GENDER_MAP: Record<string, G> = {
  male:   { sub: 'He', obj: 'him', pos: 'his',  title: 'gentleman' },
  female: { sub: 'She',obj: 'her',pos: 'her',  title: 'lady' },
  other:  { sub: 'They',obj:'them',pos:'their', title: 'patient' },
};

function g(reg: RegistrationData): G {
  return GENDER_MAP[reg.sex] || GENDER_MAP.other;
}

// ── Clinical Language Helpers ─────────────────────────────────────────────

function ageRange(a: number): string {
  if (a < 18) return 'child';
  if (a < 40) return 'young adult';
  if (a < 60) return 'middle-aged';
  return 'elderly';
}

/** Compress an array of present findings into a single fluent sentence. */
function compressPresent(items: string[], prefix = ''): string {
  if (items.length === 0) return '';
  if (items.length === 1) return `${prefix}${items[0]}`;
  const last = items.pop()!;
  return `${prefix}${items.join(', ')} and ${last}`;
}

/** Compress an array of negative findings: "There is no history of X, Y, or Z." */
function compressNegatives(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return `There is no history of ${items[0]}.`;
  const last = items.pop()!;
  return `There is no history of ${items.join(', ')} or ${last}.`;
}

// ── Temporal Sort Engine ─────────────────────────────────────────────────────
// Sorts symptom streams by onset_day (ascending), then by role priority:
//   first → dominant → progressive → secondary → late → complication

const ROLE_ORDER: Record<StreamRole, number> = {
  first: 0, dominant: 1, progressive: 2, secondary: 3, late: 4, complication: 5,
};

function sortStreamsByTimeline(streams: SymptomStream[]): SymptomStream[] {
  return [...streams].sort((a, b) => {
    if (a.onset_day !== b.onset_day) return a.onset_day - b.onset_day;
    return (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9);
  });
}

// ── Surgical Story Engine ─────────────────────────────────────────────────
// A surgeon does not hear "pain." A surgeon hears a physiological process
// unfolding inside the abdomen over time. This engine reconstructs that story:
//   Context → First sensation → Evolution → Pattern → Function → Negatives
//   → Red flags → Physiological impact → Summary

const ONSET_SPEED: Record<string, string> = {
  sudden: 'sudden', acute: 'acute', subacute: 'subacute', gradual: 'gradual',
};

const PROG_LABELS: Record<string, string> = {
  worsening: 'progressively worsening', stable: 'stable',
  intermittent: 'intermittent', resolving: 'gradually resolving',
};

const PAIN_CHAR_MAP: Record<string, string> = {
  colicky: 'colicky (cramping) in nature',
  constant: 'constant and unremitting in nature',
  colicky_then_constant: 'initially colicky but has since become constant',
  sharp: 'sharp and stabbing in nature',
  burning: 'burning in nature',
};



const VOMIT_CONTENT_MAP: Record<string, string> = {
  bilious: 'bilious (green/yellow) fluid, indicating gastric and duodenal contents',
  faeculent: 'faeculent (brown) material — the classic feature of a distal large bowel obstruction',
  undigested_food: 'undigested food particles',
  clear: 'clear fluid',
  blood_stained: 'blood-stained material — raise concern for strangulation',
};

const BLEEDING_TYPE_MAP: Record<string, string> = {
  fresh_blood: 'fresh (bright red) blood per rectum',
  dark_blood: 'dark blood/clots per rectum',
  melaena: 'melaena (black, tarry stool)',
  mixed: 'blood mixed with stool',
  on_tissue: 'blood on wiping only',
};

export function compileTimelineNarrative(streams: SymptomStream[], p: G, history: HistoryData): string | null {
  const present = streams.filter(s => s.present && s.type !== 'previous_episodes');
  if (present.length === 0) return null;

  const sorted = sortStreamsByTimeline(present);
  const blocks: string[] = [];
  const first = sorted[0];
  const duration = first.onset_day;
  const durationStr = duration <= 1 ? 'one day' : `${duration} days`;

  // ── 1. OPENING: C/C + context + first sensation ──
  const keySymptomsAll = [...new Set(sorted.filter(s => s.type !== 'previous_episodes').map(s => s.label.toLowerCase()))];
  const lastSymAll = keySymptomsAll.pop()!;
  const ccStr = keySymptomsAll.length > 0 ? `${keySymptomsAll.join(', ')}, and ${lastSymAll}` : lastSymAll;
  blocks.push(`${p.sub} presents with a ${durationStr} history of ${ccStr}.`);

  const context = history.contextAtOnset ? `while ${history.contextAtOnset}` : 'otherwise in good health';
  if (history.firstSensation) {
    blocks.push(`${p.sub} was in ${p.pos} usual state of good health until ${durationStr} prior to presentation when, ${context}, ${p.sub.toLowerCase()} first experienced ${history.firstSensation}.`);
  } else {
    blocks.push(`${p.sub} was in ${p.pos} usual state of good health until ${durationStr} prior to presentation when, ${context}, symptoms first developed.`);
  }

  // ── 2. FIRST EVENT DETAILED DESCRIPTION ──
  if (first.type === 'pain') {
    const char = first.character ? PAIN_CHAR_MAP[first.character] : 'abdominal discomfort';
    const loc = first.location ? `localised to the ${first.location}` : 'in the abdomen';
    const onset = first.onset_speed ? `The onset was ${ONSET_SPEED[first.onset_speed] || first.onset_speed}` : 'It began';
    blocks.push(`${onset} in nature — initially ${char} — and was ${loc}. At this stage, it was not yet severe enough to interfere with ${p.pos} routine activities.`);
  } else if (first.type === 'distension') {
    const onset = first.onset_speed ? `${ONSET_SPEED[first.onset_speed] || first.onset_speed} ` : '';
    blocks.push(`The initial manifestation was ${onset}abdominal distension, which ${p.sub.toLowerCase()} described as a feeling of fullness and tightness.`);
  } else if (first.type === 'vomiting') {
    const content = first.content ? VOMIT_CONTENT_MAP[first.content] || first.content : 'gastric contents';
    const freq = first.frequency || 'several';
    blocks.push(`The first symptom was vomiting — with ${freq} episodes of ${content}. ${p.pos} nausea preceded each episode, and the vomiting did not provide relief.`);
  } else {
    blocks.push(`The first symptom was ${first.label}.`);
  }

  // ── 3. SUBSEQUENT EVENTS: pure chronological facts ──
  for (let i = 1; i < sorted.length; i++) {
    const s = sorted[i];
    const prev = sorted[i - 1];
    const sameDay = s.onset_day === prev.onset_day;
    const gap = s.onset_day - prev.onset_day;

    const transition = sameDay ? 'Within the same period,'
      : gap === 1 ? 'By the following day,'
      : `By Day ${s.onset_day},`;

    let eventDesc = '';
    if (s.type === 'pain') {
      const char = s.character ? PAIN_CHAR_MAP[s.character] : '';
      const loc = s.location ? `localised to the ${s.location}` : '';
      const prog = s.progression === 'worsening' ? ' and has been progressively intensifying' : '';
      eventDesc = `the abdominal pain became more pronounced. ${char}${loc ? `, ${loc}` : ''}${prog}`;
      if (s.character && s.character !== first.character) {
        const charNote = s.character === 'colicky_then_constant' ? ' The patient reports the pain had changed — initially coming in waves but now constant.' : '';
        eventDesc += charNote;
      }
    } else if (s.type === 'distension') {
      const prog = s.progression === 'worsening' ? ', progressive' : '';
      eventDesc = `${p.sub.toLowerCase()} noticed${prog} abdominal distension, which became increasingly marked. The abdomen felt tense and swollen, interfering with breathing and movement`;
      if (history.distensionEvolution?.painWithDistension) eventDesc += ', and the distension itself was painful';
      eventDesc += `. ${p.pos} abdomen became visibly larger, and clothing no longer fit properly`;
    } else if (s.type === 'vomiting') {
      const content = s.content ? VOMIT_CONTENT_MAP[s.content] || s.content : 'gastric contents';
      const freq = s.frequency ? `${s.frequency} episodes of ` : '';
      const relief = history.vomitingEvolution?.vomitingRelievesPain === false ? '. The vomiting did not relieve the pain or distension' : '';
      const nauseaBefore = history.vomitingEvolution?.nauseaBeforeVomiting === true ? ' Nausea preceded each episode' : '';
      eventDesc = `${freq}vomiting developed, with vomitus consisting of ${content}${relief}${nauseaBefore}`;
    } else if (s.type === 'constipation') {
      const days = s.lastBowelDays ? ` for ${s.lastBowelDays} day(s)` : '';
      eventDesc = `${p.sub.toLowerCase()} became constipated${days}. Initially, small amounts of stool could still be passed, but this eventually ceased`;
    } else if (s.type === 'flatus_loss') {
      eventDesc = `flatus ceased — ${p.sub.toLowerCase()} could no longer pass wind. Neither stool nor flatus was being passed`;
    } else if (s.type === 'fever') {
      eventDesc = `fever developed`;
    } else if (s.type === 'weight_loss') {
      const amt = s.weightLossAmount ? ` of ${s.weightLossAmount}` : '';
      eventDesc = `unintentional weight loss${amt} was noted`;
    } else if (s.type === 'bleeding') {
      const bt = s.bleedingType ? BLEEDING_TYPE_MAP[s.bleedingType] || 'rectal bleeding' : 'rectal bleeding';
      eventDesc = `${bt} was reported`;
    } else {
      eventDesc = `${s.label} developed`;
    }

    blocks.push(`${transition} ${eventDesc}.`);
  }

  // ── 4. PAIN CHARACTER CHANGE (facts only — no interpretation) ──
  const painStream = sorted.find(s => s.type === 'pain');
  if (painStream) {
    const char = painStream.character || history.hpiPainCharacter;
    if (char === 'colicky_then_constant') {
      blocks.push(`The pain initially came in waves (colicky) but later became constant and unremitting. The patient reports this change clearly.`);
    } else if (char === 'constant') {
      blocks.push(`The pain is constant and does not go away.`);
    } else if (char === 'colicky') {
      blocks.push(`The pain remains intermittent, coming in waves.`);
    }
    if (history.painEvolution?.hasGeneralized) {
      blocks.push(`The pain, which was initially localised, has since spread across the entire abdomen.`);
    }
  }

  // ── 5. FUNCTIONAL IMPACT ──
  const funcParts: string[] = [];
  if (history.functionalImpact) funcParts.push(history.functionalImpact);
  if (history.eatingImpact === 'stopped') funcParts.push(`${p.sub} has stopped eating`);
  else if (history.eatingImpact === 'reduced') funcParts.push(`oral intake is reduced`);
  if (history.sleepImpact === 'unable') funcParts.push(`and has been unable to sleep`);
  else if (history.sleepImpact === 'disturbed') funcParts.push(`sleep is disturbed`);
  if (history.workCapacity === 'stopped') funcParts.push(`${p.sub} has stopped all usual activities`);
  else if (history.workCapacity === 'limited') funcParts.push(`daily activities are limited`);
  if (funcParts.length > 0) {
    blocks.push(`The impact on ${p.pos.toLowerCase()} daily function has been marked. ${funcParts.join('. ')}.`);
  }

  // ── 6. NEGATIVES (explicit denials only) ──
  const denied: string[] = [];
  if (history.deniesNausea && !history.hpiAssociatedVomiting) denied.push('nausea');
  if (history.deniesVomiting && !history.hpiAssociatedVomiting) denied.push('vomiting');
  if (history.deniesFever) denied.push('fever');
  if (history.deniesWeightLoss) denied.push('unintentional weight loss');
  if (history.deniesRectalBleeding) denied.push('rectal bleeding');
  if (history.deniesPreviousEpisodes) denied.push('previous similar episodes');
  if (history.deniesChronicConstipation) denied.push('chronic constipation');
  if (history.deniesFamilyHistoryCRC) denied.push('family history of colorectal cancer');
  if (history.deniesAbdominalSurgery) denied.push('previous abdominal surgery');
  for (const s of streams) {
    if (s.denied) {
      const label = s.label.toLowerCase();
      if (!denied.includes(label)) denied.push(label);
    }
  }
  if (denied.length === 1) blocks.push(`There is no history of ${denied[0]}.`);
  else if (denied.length > 1) {
    const last = denied.pop()!;
    blocks.push(`There is no history of ${denied.join(', ')} or ${last}.`);
  }

  return blocks.join(' ');
}

// ── Main Engine ───────────────────────────────────────────────────────────

export function reasonHistory(history: HistoryData, reg: RegistrationData): HistoryReasoningOutput {
  const p = g(reg);
  const m = (s: string) => s.toLowerCase();
  const pmhLower = (history.pmh || '').toLowerCase();
  const fhLower = (history.familyHistory || '').toLowerCase();
  const dhLower = (history.drugHistory || '').toLowerCase();
  const shLower = (history.surgicalHistory || '').toLowerCase();

  const era = ageRange(reg.age);
  const complaint = history.presentingComplaint || 'abdominal distension and constipation';
  const duration = history.complaintDuration || 'several-day';
  const cleanDuration = duration.replace(/\b(\d+)\s+(?!day)/g, '$1-day ');

  // ── 1. NARRATIVE SUMMARY ── Consultant-Grade Surgical English ──────────────
  const blocks: string[] = [];

  // --- Opening ---
  blocks.push(`${p.sub} is a ${reg.age}-year-old ${era} ${p.title} presenting with a ${cleanDuration} history of ${complaint}.`);

  // ── Chronological Timeline Narrative ───────────────────────────────────────
  // Uses symptom streams as a time-anchored disease evolution graph, sorted by
  // onset_day then role priority. Falls back to flat-field narrative when streams absent.
  if (history.symptomStreams && history.symptomStreams.length > 0) {
    const timeline = compileTimelineNarrative(history.symptomStreams, p, history);
    if (timeline) blocks.push(timeline);
  } else {
    // ── Fallback to flat-field narrative (single-complaint mode) ─────────────
    // --- Onset & Progression ---
    if (history.hpiOnset) {
    const onsetPhrases: Record<string, string> = {
      sudden: 'The onset was sudden',
      acute: 'The presentation was acute',
      subacute: 'The course has been subacute',
      gradual: 'The symptoms developed gradually',
    };
    const progPhrases: Record<string, string> = {
      worsening: ', and they have been progressively worsening since onset.',
      stable: ', and they have remained stable since onset.',
      intermittent: ', and they have been intermittent in nature.',
    };
    blocks.push(`${onsetPhrases[history.hpiOnset] || 'The onset was acute'}${progPhrases[history.hpiProgression] || ', and the course has been progressive.'}`);
  }

  // --- Pain Character (SOCRATES: Site, Character, Radiation) ---
  // Handles states: character specified, location specified/not, radiation specified/not
  if (history.hpiPainCharacter) {
    const painMap: Record<string, string> = {
      colicky: 'colicky (cramping) in nature, characteristic of mechanical bowel obstruction',
      constant: 'constant and unremitting in nature, raising concern for bowel ischaemia',
      'colicky_then_constant': 'initially colicky but has since become constant — this ominous progression suggests the development of bowel ischaemia',
      sharp: 'sharp and stabbing in nature',
      burning: 'burning in nature',
    };
    let ps = `The pain is ${painMap[history.hpiPainCharacter] || history.hpiPainCharacter}`;
    if (history.hpiPainLocation) ps += ` and is localised to the ${history.hpiPainLocation}`;
    else ps += '. It is primarily abdominal';
    if (history.hpiPainRadiation) ps += `, with radiation to ${history.hpiPainRadiation}`;
    else if (history.hpiPainLocation) ps += ', with no radiation';
    blocks.push(ps.endsWith('.') ? ps : ps + '.');
  }

  // --- Vomiting (SOCRATES: Associations) ---
  // Handles states: A) vomiting present, B) vomiting absent with nausea denied, C) vomiting absent without nausea denied, D) vomiting unknown
  if (history.hpiAssociatedVomiting) {
    const freq = history.hpiVomitingFrequency || 'Several';
    const content = history.hpiVomitContent
      ? ({ bilious: 'bilious (green/yellow) fluid', faeculent: 'faeculent (brown) material — suggestive of distal obstruction', undigested_food: 'undigested food particles', clear: 'clear fluid', blood_stained: 'blood-stained material' }[history.hpiVomitContent] || history.hpiVomitContent)
      : 'gastric contents';
    blocks.push(`${freq} episodes of vomiting have been reported, with the vomitus consisting of ${content}.`);
  } else if (history.deniesNausea && history.deniesVomiting) {
    blocks.push('There is no history of nausea or vomiting.');
  } else if (history.deniesVomiting) {
    blocks.push('There is no history of vomiting, although nausea may be present.');
  } else if (history.deniesNausea) {
    blocks.push('Nausea is denied, and vomiting has not occurred.');
  }
  // else: no data entered — omit

  // --- Bowel Habit & Flatus ---
  // Handles states: A) absolute constipation (no stool + no flatus), B) no flatus + constipated/open, C) passing flatus + any bowel status, D) unknown
  const absConst = history.hpiFlatusStatus === 'not_passing' && history.hpiBowelStatus === 'absolute_constipation';
  if (absConst) {
    blocks.push(`There is absolute constipation — ${p.sub.toLowerCase()} has passed neither stool nor flatus for ${Math.max(history.hpiLastBowelDays, 1)} day(s). This is the hallmark of complete large bowel obstruction.`);
  } else if (history.hpiFlatusStatus === 'not_passing') {
    blocks.push(`${p.sub} is not passing flatus and reports ${history.hpiBowelStatus === 'open' ? 'that bowel movements are occurring' : history.hpiBowelStatus === 'constipated' ? 'constipation' : 'absolute constipation'}.`);
  } else if (history.hpiFlatusStatus === 'passing') {
    blocks.push(`Bowel habit: ${history.hpiBowelStatus === 'open' ? 'bowels remain open' : history.hpiBowelStatus === 'constipated' ? 'constipated' : history.hpiBowelStatus === 'absolute_constipation' ? 'absolute constipation' : 'not specified'}. Flatus is being passed.`);
  }
  // else unknown — omit

  // --- Fever Assessment (critical for surgery inevitability) ---
  // Handles states: A) fever positive (ROS), B) denies explicitly, C) no data
  if (history.rosFever) {
    blocks.push('Fever has been reported — this raises concern for ischaemia, perforation, or sepsis, any of which would mandate urgent surgical intervention.');
  } else if (history.deniesFever) {
    blocks.push('There is no history of fever.');
  }
  // else: no data — omit (fever is commonly absent early in LBO)

  // --- Grouped Negatives: Weight Loss, Rectal Bleeding, Previous Episodes ---
  // Handles states: A) explicitly denied, B) not reported (missing), C) positive (handled below as red flags)
  const negGroup: string[] = [];
  if ((history.deniesWeightLoss || (!history.hpiWeightLoss && history.deniesWeightLoss === undefined)) && !history.hpiWeightLoss) negGroup.push('weight loss');
  else if (history.deniesWeightLoss) negGroup.push('weight loss');
  if ((history.deniesRectalBleeding || (!history.hpiBleeding && history.deniesRectalBleeding === undefined)) && !history.hpiBleeding) negGroup.push('rectal bleeding');
  else if (history.deniesRectalBleeding) negGroup.push('rectal bleeding');
  if ((history.deniesPreviousEpisodes || (!history.hpiPreviousEpisodes && history.deniesPreviousEpisodes === undefined)) && !history.hpiPreviousEpisodes) negGroup.push('previous similar episodes');
  else if (history.deniesPreviousEpisodes) negGroup.push('previous similar episodes');
  if (history.deniesChronicConstipation) negGroup.push('chronic constipation');
  if (history.deniesFamilyHistoryCRC) negGroup.push('family history of colorectal cancer');
  if (history.deniesAbdominalSurgery) negGroup.push('previous abdominal surgery');

  if (negGroup.length > 0) {
    if (negGroup.length <= 3) {
      blocks.push(compressNegatives([...negGroup]));
    } else {
      const first = negGroup.slice(0, 3);
      const rest = negGroup.slice(3);
      blocks.push(compressNegatives(first));
      blocks.push(`Furthermore, there is no history of ${rest.join(', ')}.`);
    }
  }

  // --- Positive Red Flags (weight loss, bleeding, previous episodes) ---
  // Handles states: positive only; if absent, handled above in grouped negatives
  const redFlagPhrases: string[] = [];
  if (history.hpiWeightLoss) {
    redFlagPhrases.push(`unintentional weight loss${history.hpiWeightLossAmount ? ` of ${history.hpiWeightLossAmount}` : ''} has been reported, which raises concern for an underlying malignant process`);
  }
  if (history.hpiBleeding) {
    const bt = history.hpiBleedingType
      ? ({ fresh_blood: 'fresh (bright red) blood per rectum', dark_blood: 'dark blood/clots per rectum', melaena: 'melaena (black, tarry stool)', mixed: 'blood mixed with stool', on_tissue: 'blood on wiping only' }[history.hpiBleedingType] || 'rectal bleeding')
      : 'rectal bleeding';
    redFlagPhrases.push(`${bt} has been reported — this mandates exclusion of colorectal carcinoma`);
  }
  if (history.hpiPreviousEpisodes) {
    redFlagPhrases.push(`${p.sub.toLowerCase()} has experienced previous similar episodes, which strongly suggests recurrent sigmoid volvulus`);
  }
  if (redFlagPhrases.length === 1) {
    blocks.push(`Of note, ${redFlagPhrases[0]}.`);
  } else if (redFlagPhrases.length > 1) {
    const last = redFlagPhrases.pop()!;
    blocks.push(`Of note, ${redFlagPhrases.join(', ')}, and ${last}.`);
  }

  // --- Fever as surgical red flag ---
  if (history.rosFever && !history.hpiWeightLoss && !history.hpiBleeding) {
    // Already pushed above as solitary note
  }

  // --- Past Medical & Surgical History ---
  const pmhItems = history.pmh.split(',').map(s => s.trim()).filter(Boolean);
  const hasPmh = pmhItems.length > 0;
  const hasSh = !!(history.surgicalHistory && history.surgicalHistory.trim());

  if (hasPmh && hasSh) {
    blocks.push(`Past medical history includes ${history.pmh}. Surgical history: ${history.surgicalHistory}.`);
  } else if (hasPmh) {
    blocks.push(`Past medical history includes ${history.pmh}. There is no history of previous abdominal surgery.`);
  } else if (hasSh) {
    blocks.push(`${p.sub} has no significant past medical history. Surgical history: ${history.surgicalHistory}.`);
  } else {
    blocks.push(`${p.sub} has no significant past medical or surgical history.`);
  }

  // --- Drug History ---
  if (history.drugHistory && history.drugHistory.trim()) {
    const hasOpioid = /(?:opioid|morphine|tramadol|codeine|fentanyl|oxycodone)/i.test(dhLower);
    blocks.push(`Current medications include ${history.drugHistory}.${hasOpioid ? ' Notably, opioid use may contribute to constipation and should be considered in the overall assessment.' : ''}`);
  } else {
    blocks.push(`${p.sub} is not on any regular medications.`);
  }

  // --- Family History ---
  if (history.familyHistory && history.familyHistory.trim()) {
    blocks.push(`Family history: ${history.familyHistory}.`);
  } else if (!negGroup.some(n => n.includes('family history'))) {
    blocks.push('Family history is non-contributory.');
  }

  // --- Social History ---
  // Handles states: A) social history entered, B) denied smoking/alcohol, C) no data
  if (history.socialHistory && history.socialHistory.trim()) {
    blocks.push(`Social history: ${history.socialHistory}.`);
  }
  if (history.deniesSmoking && history.deniesAlcohol) {
    blocks.push(`${p.sub} does not smoke or consume alcohol.`);
  } else if (history.deniesSmoking) {
    blocks.push(`${p.sub} does not smoke.`);
  } else if (history.deniesAlcohol) {
    blocks.push(`${p.sub} does not consume alcohol.`);
  }

  // --- Review of Systems ---
  // Handles states: A) positive items, B) all negative, C) mixed
  const rosPos: string[] = [];
  if (history.rosFever) rosPos.push('fever');
  if (history.rosWeightLoss && !history.hpiWeightLoss) rosPos.push('weight loss');
  if (history.rosNightSweats) rosPos.push('night sweats');
  if (history.rosFatigue) rosPos.push('fatigue');
  if (history.rosNausea && !history.hpiAssociatedVomiting) rosPos.push('nausea');
  if (history.rosDysphagia) rosPos.push('dysphagia');
  if (history.rosEarlySatiety) rosPos.push('early satiety');
  if (history.rosAbdominalPain) rosPos.push('chronic abdominal pain');
  if (history.rosChangeBowelHabit) rosPos.push('change in bowel habit');
  if (history.rosPalpitations) rosPos.push('palpitations');
  if (history.rosChestPain) rosPos.push('chest pain');
  if (history.rosDyspnoea) rosPos.push('dyspnoea');
  if (history.rosCough) rosPos.push('cough');
  if (history.rosUrinarySymptoms) rosPos.push('urinary symptoms');
  if (history.rosHeadache) rosPos.push('headache');
  if (history.rosDizziness) rosPos.push('dizziness');
  if (history.rosSyncope) rosPos.push('syncope');
  if (history.rosRash) rosPos.push('rash');
  if (history.rosJointPain) rosPos.push('joint pain');
  if (history.rosBackPain) rosPos.push('back pain');

  if (rosPos.length > 0) {
    blocks.push(`Review of systems is positive for ${rosPos.join(', ')}. No other significant symptoms were identified.`);
  } else if (history.rosFever || history.rosWeightLoss || history.rosFatigue || history.rosNausea) {
    // Some ROS was entered but all negative — don't repeat negatives already mentioned
  }
  // else: no ROS data entered — omit
  } // end else (flat-field fallback)

  // --- Final: Run through language renderer for grammar polish ---
  let summary = blocks.join(' ');

  // Grammar fixes (inline without import to avoid circular dependency)
  summary = summary
    .replace(/\b(\d+)\s+history\b/gi, (_m: string, d: string) => `a ${d}-day history`)
    .replace(/\bno hx\b/gi, 'no history')
    .replace(/\bhx\b/gi, 'history')
    .replace(/\bvomitting\b/gi, 'vomiting')
    .replace(/\bumbulical\b/gi, 'umbilical')
    .replace(/\bperiumbilical\b/gi, 'periumbilical')
    .replace(/\bdoes not radiate\b/gi, 'with no radiation')
    .replace(/\bdenies any history\b/gi, 'there is no history of')
    .replace(/\b(He|She) denies\b/gi, 'There is no history of')
    .replace(/\bretired \w+ by profession\b/gi, 'retired')
    // Fix "does not X and does not Y" → "does not X or Y"
    .replace(/(does not \w+) and does not /gi, '$1 or ')
    // Fix double spaces
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Ensure sentences end properly
  if (!summary.endsWith('.') && !summary.endsWith('?') && !summary.endsWith('!')) summary += '.';

  // ── 2. RISK FACTOR EXTRACTION ─────────────────────────────────────────────
  const presentFactors: { factor: string; significance: 'major' | 'minor' }[] = [];
  const absentFactors: { factor: string; significance: 'major' | 'minor' }[] = [];

  if (reg.age > 60) presentFactors.push({ factor: 'Age >60 years', significance: 'major' });
  else if (reg.age > 40) presentFactors.push({ factor: 'Age >40 years', significance: 'minor' });

  if (reg.sex === 'male') presentFactors.push({ factor: 'Male sex', significance: 'minor' });

  if (history.hpiBowelStatus === 'constipated' || history.hpiBowelStatus === 'absolute_constipation') {
    presentFactors.push({ factor: 'Constipation (from history)', significance: 'major' });
  }
  if (history.hpiPreviousEpisodes) {
    presentFactors.push({ factor: 'Previous episode of volvulus', significance: 'major' });
  }
  if (history.hpiWeightLoss) {
    presentFactors.push({ factor: 'Unintentional weight loss — suspect malignancy', significance: 'major' });
  }
  if (history.hpiBleeding) {
    presentFactors.push({ factor: 'Rectal bleeding — suspect colorectal cancer', significance: 'major' });
  }

  // PMH parsing
  if (pmhLower.includes('diabetes')) presentFactors.push({ factor: 'Diabetes mellitus', significance: 'minor' });
  if (pmhLower.includes('constipation')) presentFactors.push({ factor: 'Chronic constipation', significance: 'major' });
  if (pmhLower.includes('parkinson')) presentFactors.push({ factor: 'Parkinson disease', significance: 'minor' });
  if (pmhLower.includes('hypertension')) presentFactors.push({ factor: 'Hypertension', significance: 'minor' });
  if (pmhLower.includes('ckd') || pmhLower.includes('chronic kidney')) presentFactors.push({ factor: 'Chronic kidney disease', significance: 'minor' });
  if (pmhLower.includes('ibd') || pmhLower.includes('crohn') || pmhLower.includes('colitis')) presentFactors.push({ factor: 'Inflammatory bowel disease', significance: 'minor' });
  if (pmhLower.includes('diverticul')) presentFactors.push({ factor: 'Diverticular disease', significance: 'minor' });

  // Family history
  if (fhLower.includes('cancer') || fhLower.includes('crc') || fhLower.includes('colon')) {
    presentFactors.push({ factor: 'Family history of colorectal cancer', significance: 'major' });
  }

  // Surgical history
  if (shLower.includes('abdominal') || shLower.includes('laparotomy') || shLower.includes('resection')) {
    presentFactors.push({ factor: 'Previous abdominal surgery', significance: 'minor' });
  }

  // Drug history
  if (dhLower.includes('anticholinergic') || dhLower.includes('antipsychotic') || dhLower.includes('tricyclic')) {
    presentFactors.push({ factor: 'Anticholinergic medications', significance: 'minor' });
  }

  // ── 3. COMPLICATION SCREENING ─────────────────────────────────────────────
  const ischaemiaTriggers: string[] = [];
  if (history.hpiPainCharacter === 'constant' || history.hpiPainCharacter === 'colicky_then_constant') {
    ischaemiaTriggers.push('Pain progression from colicky to constant — classic for ischaemia');
  }
  if (history.rosFever) ischaemiaTriggers.push('Fever reported');
  const perforationTriggers: string[] = [];
  if (history.rosFever) perforationTriggers.push('Fever suggests peritonitis');
  const malignancyTriggers: string[] = [];
  if (history.hpiWeightLoss) malignancyTriggers.push('Unintentional weight loss');
  if (history.hpiBleeding) malignancyTriggers.push('Rectal bleeding');
  if (reg.age > 60) malignancyTriggers.push('Age >60');
  if (fhLower.includes('cancer') || fhLower.includes('crc') || fhLower.includes('colon')) {
    malignancyTriggers.push('Family history of colorectal cancer');
  }
  const dehydrationTriggers: string[] = [];
  if (history.hpiAssociatedVomiting) dehydrationTriggers.push('Vomiting leading to fluid loss');
  if (history.hpiBowelStatus === 'absolute_constipation' && history.hpiLastBowelDays > 3) {
    dehydrationTriggers.push('Prolonged obstruction >3 days — third spacing');
  }

  const complicationScreening: HistoryReasoningOutput['complicationScreening'] = [
    {
      complication: 'Bowel Ischaemia / Gangrene',
      suspicion: ischaemiaTriggers.length >= 2 ? 'high' : ischaemiaTriggers.length === 1 ? 'moderate' : 'low',
      triggerFindings: ischaemiaTriggers.length > 0 ? ischaemiaTriggers : ['No ischaemic features from history'],
    },
    {
      complication: 'Bowel Perforation',
      suspicion: perforationTriggers.length >= 2 ? 'high' : perforationTriggers.length === 1 ? 'moderate' : 'low',
      triggerFindings: perforationTriggers.length > 0 ? perforationTriggers : ['No perforation features from history'],
    },
    {
      complication: 'Underlying Malignancy',
      suspicion: malignancyTriggers.length >= 2 ? 'high' : malignancyTriggers.length === 1 ? 'moderate' : 'low',
      triggerFindings: malignancyTriggers.length > 0 ? malignancyTriggers : ['No malignancy features from history'],
    },
    {
      complication: 'AKI / Dehydration',
      suspicion: dehydrationTriggers.length >= 1 ? 'moderate' : 'low',
      triggerFindings: dehydrationTriggers.length > 0 ? dehydrationTriggers : ['No dehydration features from history'],
    },
  ];

  // ── Temporal DDX Helpers ───────────────────────────────────────────────────
  // Extract per-stream timing data for temporal DDX logic
  const painStream = history.symptomStreams?.find(s => s.type === 'pain' && s.present);
  const vomitingStream = history.symptomStreams?.find(s => s.type === 'vomiting' && s.present);
  const distensionStream = history.symptomStreams?.find(s => s.type === 'distension' && s.present);
  const constipationStream = history.symptomStreams?.find(s => s.type === 'constipation' && s.present);
  const flatusStream = history.symptomStreams?.find(s => s.type === 'flatus_loss' && s.present);

  // Temporal logic: vomiting onset relative to pain onset
  const hasVomitingTiming = !!(vomitingStream && painStream);
  const vomitingIsLate = hasVomitingTiming && vomitingStream!.onset_day > painStream!.onset_day + 1;
  const vomitingIsEarly = hasVomitingTiming && vomitingStream!.onset_day <= painStream!.onset_day;
  const vomitingIsIntermediate = hasVomitingTiming && !vomitingIsLate && !vomitingIsEarly;

  // Distension timing relative to pain
  const hasDistensionTiming = !!(distensionStream && painStream);
  const distensionIsRapid = hasDistensionTiming && distensionStream!.onset_day <= painStream!.onset_day;
  const distensionIsSlow = hasDistensionTiming && distensionStream!.onset_day > painStream!.onset_day + 1;

  // Progression speed from streams
  const painProgression = painStream?.progression;

  // ── 4. DDX CLUES FROM HISTORY ─────────────────────────────────────────────
  const ddxClues: HistoryReasoningOutput['ddxClues'] = [];

  // Sigmoid Volvulus
  const volvInFavor: { finding: string; reasoning: string; weight: number }[] = [];
  const volvAgainst: { finding: string; reasoning: string; weight: number }[] = [];
  if (history.hpiPreviousEpisodes) {
    volvInFavor.push({ finding: 'Previous similar episodes', reasoning: 'Recurrent episodes are classic for sigmoid volvulus; recurrence rate exceeds 50% without definitive resection', weight: 30 });
  } else {
    volvAgainst.push({ finding: 'No previous episodes', reasoning: 'First presentation makes volvulus less likely, although it can still occur de novo', weight: 10 });
  }
  if (history.hpiOnset === 'sudden') {
    volvInFavor.push({ finding: 'Sudden onset', reasoning: 'Volvulus typically presents acutely as the sigmoid colon twists, causing sudden-onset pain and distension', weight: 15 });
  } else {
    volvAgainst.push({ finding: 'Non-sudden onset', reasoning: 'A gradual onset is less characteristic of volvulus, which classically presents suddenly', weight: 5 });
  }
  if (history.hpiPainCharacter === 'colicky') {
    volvInFavor.push({ finding: 'Colicky pain', reasoning: 'Colicky pain is consistent with mechanical obstruction; volvulus produces intermittent colic initially', weight: 10 });
  } else if (history.hpiPainCharacter === 'colicky_then_constant') {
    volvInFavor.push({ finding: 'Colicky then constant pain', reasoning: 'Progression from colicky to constant pain suggests ischaemia complicating volvulus — an ominous sign', weight: 20 });
  }
  if (history.hpiFlatusStatus === 'not_passing' && (history.hpiBowelStatus === 'absolute_constipation' || history.hpiBowelStatus === 'constipated')) {
    volvInFavor.push({ finding: 'Absolute constipation (no stool nor flatus)', reasoning: 'Complete large bowel occlusion is the hallmark of volvulus causing a closed-loop obstruction', weight: 20 });
  }
  if (history.hpiWeightLoss) volvAgainst.push({ finding: 'Weight loss present', reasoning: 'Unintentional weight loss is not typical of simple volvulus and suggests an alternative diagnosis such as malignancy', weight: 15 });
  if (history.hpiBleeding) volvAgainst.push({ finding: 'Rectal bleeding', reasoning: 'Rectal bleeding is not a feature of uncomplicated volvulus; raises suspicion for colorectal carcinoma', weight: 15 });
  // Temporal DDX — Volvulus
  if (distensionIsRapid) volvInFavor.push({ finding: 'Rapid distension (same timeline as pain)', reasoning: 'Volvulus produces rapid, massive distension as the closed loop fills with gas — distension develops within hours of onset', weight: 15 });
  if (vomitingIsLate) volvInFavor.push({ finding: 'Late vomiting relative to pain onset', reasoning: 'In large bowel obstruction, vomiting is a late feature; volvulus typically presents with pain and distension before vomiting ensues', weight: 10 });
  if (vomitingIsEarly) volvAgainst.push({ finding: 'Early vomiting relative to pain onset', reasoning: 'Early vomiting suggests a more proximal obstruction (SBO or proximal LBO), less characteristic of sigmoid volvulus', weight: 10 });
  if (painProgression === 'worsening') volvInFavor.push({ finding: 'Rapidly progressive pain', reasoning: 'Volvulus causes progressive pain as the closed loop distends and ischaemia threatens', weight: 10 });
  ddxClues.push({
    diagnosis: 'Sigmoid Volvulus',
    inFavor: volvInFavor,
    against: volvAgainst,
    netScore: volvInFavor.reduce((s, f) => s + f.weight, 0) - volvAgainst.reduce((s, f) => s + f.weight, 0),
  });

  // Obstructing Colorectal Cancer
  const caInFavor: { finding: string; reasoning: string; weight: number }[] = [];
  const caAgainst: { finding: string; reasoning: string; weight: number }[] = [];
  if (history.hpiWeightLoss) caInFavor.push({ finding: 'Unintentional weight loss', reasoning: 'Weight loss is a cardinal symptom of colorectal malignancy, often reflecting chronic blood loss or metabolic effects of cancer', weight: 25 });
  if (history.hpiBleeding) caInFavor.push({ finding: 'Rectal bleeding', reasoning: 'Rectal bleeding is a presenting symptom in 30-50% of colorectal cancers', weight: 25 });
  if (reg.age > 60) caInFavor.push({ finding: `Age ${reg.age} > 60 years`, reasoning: 'Colorectal cancer incidence rises sharply after age 50, with peak incidence in the seventh and eighth decades', weight: 15 });
  if (reg.age < 40) caAgainst.push({ finding: `Age ${reg.age} < 40 years`, reasoning: 'Colorectal cancer is uncommon under age 40 in the absence of a hereditary predisposition', weight: 10 });
  if (fhLower.includes('cancer') || fhLower.includes('crc') || fhLower.includes('colon')) {
    caInFavor.push({ finding: 'Family history of colorectal cancer', reasoning: 'A positive family history increases lifetime risk by 2-4 fold', weight: 20 });
  }
  if (history.hpiOnset === 'gradual') {
    caInFavor.push({ finding: 'Gradual onset', reasoning: 'Malignant strictures develop insidiously over weeks to months, producing progressive obstructive symptoms', weight: 15 });
  } else if (history.hpiOnset === 'sudden') {
    caAgainst.push({ finding: 'Sudden onset', reasoning: 'Acute onset is atypical for malignant obstruction, which is slowly progressive', weight: 10 });
  }
  if (history.hpiProgression === 'worsening' || history.hpiProgression === 'stable') {
    caInFavor.push({ finding: 'Progressive symptoms', reasoning: 'Malignant obstruction causes unremitting, progressive symptoms once the lumen is critically narrowed', weight: 10 });
  }
  if (history.hpiPreviousEpisodes) caAgainst.push({ finding: 'Previous similar episodes', reasoning: 'Recurrent episodes are more suggestive of volvulus; carcinoma causes progressive unremitting obstruction', weight: 15 });
  if (history.hpiBowelStatus === 'constipated' || history.hpiBowelStatus === 'absolute_constipation') {
    caInFavor.push({ finding: 'Change in bowel habit', reasoning: 'Altered bowel habit is a classic early symptom of left-sided colorectal cancer', weight: 15 });
  }
  // Temporal DDX — Colorectal Cancer
  if (distensionIsSlow) caInFavor.push({ finding: 'Slowly progressive distension', reasoning: 'Malignant strictures narrow the lumen gradually over weeks to months, producing insidious distension that the patient accommodates before decompensation', weight: 20 });
  if (distensionIsRapid) caAgainst.push({ finding: 'Rapid distension', reasoning: 'Rapid-onset distension is atypical for malignant obstruction, which develops slowly as the tumour grows', weight: 10 });
  if (painProgression === 'worsening') caInFavor.push({ finding: 'Persistent progressive symptoms', reasoning: 'Malignant obstruction causes unremitting, progressive deterioration without the waxing-waning pattern of volvulus', weight: 10 });
  ddxClues.push({
    diagnosis: 'Obstructing Colorectal Carcinoma',
    inFavor: caInFavor,
    against: caAgainst,
    netScore: caInFavor.reduce((s, f) => s + f.weight, 0) - caAgainst.reduce((s, f) => s + f.weight, 0),
  });

  // Pseudo-obstruction (Ogilvie's Syndrome)
  const pseudoInFavor: { finding: string; reasoning: string; weight: number }[] = [];
  const pseudoAgainst: { finding: string; reasoning: string; weight: number }[] = [];
  if (!history.hpiPainCharacter || history.hpiPainCharacter === 'colicky') {
    pseudoInFavor.push({ finding: 'Minimal or colicky pain without progression', reasoning: 'Pseudo-obstruction typically presents with painless distension; significant pain is not a dominant feature', weight: 20 });
  }
  if (!history.hpiAssociatedVomiting) {
    pseudoInFavor.push({ finding: 'No vomiting', reasoning: 'Vomiting is less prominent in pseudo-obstruction compared to mechanical obstruction', weight: 10 });
  }
  if (history.hpiFlatusStatus === 'passing') {
    pseudoInFavor.push({ finding: 'Still passing flatus', reasoning: 'Pseudo-obstruction often allows passage of some flatus, unlike complete mechanical occlusion', weight: 15 });
  }
  if (history.hpiBowelStatus === 'constipated') {
    pseudoInFavor.push({ finding: 'Partial constipation (not absolute)', reasoning: 'Absolute constipation suggests complete mechanical blockage; pseudo-obstruction is typically incomplete', weight: 10 });
  }
  if (history.hpiPreviousEpisodes) pseudoAgainst.push({ finding: 'Previous similar episodes', reasoning: 'Recurrent episodes suggest recurrent volvulus, not pseudo-obstruction', weight: 10 });
  if (history.hpiWeightLoss) pseudoAgainst.push({ finding: 'Weight loss', reasoning: 'Weight loss suggests an organic cause such as malignancy, not pseudo-obstruction', weight: 10 });
  if (history.hpiBleeding) pseudoAgainst.push({ finding: 'Rectal bleeding', reasoning: 'Bleeding is not a feature of pseudo-obstruction and suggests mucosal pathology', weight: 10 });
  // Temporal DDX — Pseudo-obstruction
  if (painProgression === 'stable' || painProgression === 'intermittent') pseudoInFavor.push({ finding: 'Non-progressive or intermittent pain', reasoning: 'Pseudo-obstruction typically lacks the progressive crescendo pattern of mechanical obstruction', weight: 10 });
  if (distensionIsSlow) pseudoInFavor.push({ finding: 'Gradual distension without pain escalation', reasoning: 'Ogilvie syndrome produces a pain-distension dissociation — distension out of proportion to pain', weight: 15 });
  if (vomitingIsLate) pseudoInFavor.push({ finding: 'Late or absent vomiting', reasoning: 'Vomiting is a minimal feature in pseudo-obstruction, consistent with the lack of true mechanical blockage', weight: 10 });
  ddxClues.push({
    diagnosis: "Pseudo-obstruction (Ogilvie's Syndrome)",
    inFavor: pseudoInFavor,
    against: pseudoAgainst,
    netScore: pseudoInFavor.reduce((s, f) => s + f.weight, 0) - pseudoAgainst.reduce((s, f) => s + f.weight, 0),
  });

  // Adhesive Small Bowel Obstruction
  const sboInFavor: { finding: string; reasoning: string; weight: number }[] = [];
  const sboAgainst: { finding: string; reasoning: string; weight: number }[] = [];
  if (shLower.includes('abdominal') || shLower.includes('laparotomy') || shLower.includes('resection')) {
    sboInFavor.push({ finding: 'Previous abdominal surgery', reasoning: 'Adhesive SBO is the most common cause of obstruction after abdominal or pelvic surgery', weight: 30 });
  } else {
    sboAgainst.push({ finding: 'No previous abdominal surgery', reasoning: 'Adhesive obstruction is unlikely in the absence of prior laparotomy', weight: 25 });
  }
  if (history.hpiAssociatedVomiting) sboInFavor.push({ finding: 'Vomiting present', reasoning: 'Vomiting is more prominent in SBO than in LBO due to proximal obstruction', weight: 15 });
  // Temporal DDX — Adhesive SBO
  if (vomitingIsEarly) sboInFavor.push({ finding: 'Early vomiting relative to pain onset', reasoning: 'In small bowel obstruction, vomiting occurs early as the proximal bowel distends and triggers the vomiting reflex', weight: 15 });
  if (vomitingIsLate) sboAgainst.push({ finding: 'Late vomiting relative to pain onset', reasoning: 'Late vomiting is more characteristic of large bowel obstruction; SBO typically produces vomiting early in the course', weight: 10 });
  if (distensionIsSlow) sboAgainst.push({ finding: 'Slowly progressive distension', reasoning: 'SBO produces less pronounced distension than LBO, and the distension does not dominate the clinical picture', weight: 5 });
  sboAgainst.push({ finding: 'Distension is the dominant feature', reasoning: 'Massive distension is more characteristic of LBO; SBO presents with more vomiting and less pronounced distension', weight: 10 });
  ddxClues.push({
    diagnosis: 'Adhesive Small Bowel Obstruction',
    inFavor: sboInFavor,
    against: sboAgainst,
    netScore: sboInFavor.reduce((s, f) => s + f.weight, 0) - sboAgainst.reduce((s, f) => s + f.weight, 0),
  });

  return {
    summary,
    riskFactors: { present: presentFactors, absent: absentFactors },
    complicationScreening,
    ddxClues,
  };
}
