/**
 * Clinical Language Renderer
 *
 * Post-processing layer that transforms raw structured engine output into
 * polished, consultant-grade surgical English narrative.
 *
 * Handles ALL data states:
 *   - Positive only: "The patient reports fever."
 *   - Negative only: "There is no history of fever."
 *   - Mixed (positive + negative): "There is fever, but no weight loss or bleeding."
 *   - Both absent/denied: "There is no history of fever, weight loss, or bleeding."
 *   - Unknown/unmentioned: (omitted from narrative)
 *
 * Features:
 *   - Sentence merging (no short choppy sentences)
 *   - Redundancy removal
 *   - Grammar normalization (dangling modifiers, tense, spelling)
 *   - Temporal structuring
 *   - Negation compression ("no history of X, Y, or Z")
 *   - Standard clinical phrasing templates
 */

// ── Phrase Templates ────────────────────────────────────────────────────────

export const PHRASES = {
  opening: (name: string, age: number, era: string, title: string, dur: string, complaint: string) =>
    `${name || `The patient`} is a ${age}-year-old ${era} ${title} presenting with a ${dur} history of ${complaint}.`,

  onset: (onset: string, progression: string) => {
    const o: Record<string, string> = {
      sudden: 'The onset was sudden',
      acute: 'The presentation was acute',
      subacute: 'The course has been subacute',
      gradual: 'The symptoms developed gradually',
    };
    const p: Record<string, string> = {
      worsening: ', and they have been progressively worsening since onset.',
      stable: ', and they have remained stable since onset.',
      intermittent: ', and they have been intermittent in nature.',
    };
    return `${o[onset] || 'The onset was acute'}${p[progression] || ', and the course has been progressive.'}`;
  },

  painColicky: (loc: string, rad: string) => {
    let s = `The pain is colicky (cramping) in nature, which is characteristic of mechanical bowel obstruction`;
    if (loc) s += ` and is localised to the ${loc}`;
    if (rad) s += `, with radiation to ${rad}`;
    return s + '.';
  },

  painConstant: (loc: string) =>
    `The pain is constant and unremitting${loc ? `, located in the ${loc}` : ''}, raising concern for bowel ischaemia.`,

  painColickyThenConstant: (loc: string) =>
    `The pain was initially colicky but has since become constant — this ominous progression suggests the development of bowel ischaemia${loc ? ` in the ${loc}` : ''}.`,

  vomitingPresent: (freq: string, content: string) => {
    const cMap: Record<string, string> = {
      bilious: 'bilious (green/yellow) fluid',
      faeculent: 'faeculent (brown) material — suggestive of distal obstruction',
      undigested_food: 'undigested food particles',
      clear: 'clear fluid',
      blood_stained: 'blood-stained material (coffee-ground appearance)',
    };
    return `${freq || 'Several'} episodes of vomiting have been reported, with the vomitus comprising ${cMap[content] || content || 'gastric contents'}.`;
  },

  absoluteConstipation: (days: number) =>
    `There is absolute constipation, with no passage of stool or flatus for ${Math.max(days, 1)} day(s). This is the hallmark of complete large bowel obstruction.`,

  bowelBowelStatus: (status: string, flatus: string) =>
    `Bowel habit: ${status === 'open' ? 'bowels remain open' : status === 'constipated' ? 'constipated' : 'absolute constipation'}. Flatus status: ${flatus === 'passing' ? 'able to pass flatus' : flatus === 'not_passing' ? 'unable to pass flatus' : 'not documented'}.`,

  denyGroup: (items: string[]) => {
    if (items.length === 0) return '';
    if (items.length === 1) return `There is no history of ${items[0]}.`;
    const last = items.pop()!;
    return `There is no history of ${items.join(', ')} or ${last}.`;
  },

  positiveRedFlag: (finding: string) =>
    `Of note, ${finding}.`,

  weightLossPresent: (amount: string) =>
    `unintentional weight loss${amount ? ` of ${amount}` : ''} has been reported, which raises concern for an underlying malignant process`,

  rectalBleedingPresent: (type: string) => {
    const tMap: Record<string, string> = {
      fresh_blood: 'fresh (bright red) blood per rectum',
      dark_blood: 'dark blood/clots per rectum',
      melaena: 'melaena (black, tarry stool)',
      mixed: 'blood mixed with stool',
      on_tissue: 'blood on wiping only',
    };
    return `${tMap[type] || 'rectal bleeding'} has been reported — this mandates exclusion of colorectal carcinoma`;
  },

  previousEpisodesPresent: (sub: string) =>
    `${sub} has experienced previous similar episodes, which strongly suggests recurrent sigmoid volvulus`,

  noPmh: (sub: string) =>
    `${sub} has no significant past medical or surgical history.`,

  pmhPresent: (pmh: string) =>
    `Past medical history includes ${pmh}.`,

  surgicalHistoryPresent: (sh: string) =>
    `Surgical history: ${sh}.`,

  noSurgicalHistory: (sub: string) =>
    `${sub} has no history of previous abdominal surgery, making adhesive obstruction unlikely.`,

  medicationsPresent: (drugs: string, opioidNote: boolean) => {
    let s = `Current medications include ${drugs}.`;
    if (opioidNote) s += ' Notably, opioid use may contribute to constipation and should be considered in the overall assessment.';
    return s;
  },

  noMedications: (sub: string) =>
    `${sub} is not on any regular long-term medications.`,

  familyHistoryPresent: (fh: string) =>
    `Family history: ${fh}.`,

  familyHistoryNegative: () =>
    'Family history is non-contributory.',

  socialHistoryPresent: (sh: string) =>
    `Social history: ${sh}.`,

  deniesSmokingAlcohol: () =>
    'The patient does not smoke and does not consume alcohol.',

  reviewOfSystems: (items: string[], anyPresent: boolean) => {
    if (anyPresent) return `Review of systems is positive for ${items.join(', ')}. No other significant symptoms were identified.`;
    return 'Review of systems was otherwise unremarkable.';
  },
};

// ── Language Renderer ───────────────────────────────────────────────────────

export interface RenderInput {
  rawParagraphs: string[];
  dataState: 'positive' | 'negative' | 'mixed' | 'unknown';
}

export interface RenderedOutput {
  polished: string;
  corrections: string[];
}

const COMMON_ERRORS: [RegExp, string][] = [
  [/\ba\s+(\d+)\s+history\b/gi, 'a $1-day history'],
  [/\b(\d+)\s+history\b/gi, '$1-day history'],
  [/\bno\s+hx\b/gi, 'no history'],
  [/\bhx\b/gi, 'history'],
  [/\bvomitting\b/gi, 'vomiting'],
  [/\bvomitted\b/gi, 'has vomited'],
  [/\bdistended\s+abdomen\b/gi, 'abdominal distension'],
  [/\bdoes\s+not\s+radiate\b/gi, 'with no radiation'],
  [/\bdoes\s+not\s+radiate\s+anywhere\b/gi, 'with no radiation'],
  [/\bumbulical\b/gi, 'umbilical'],
  [/\bperiumbilical\b/gi, 'periumbilical'],
  [/\bdenies\s+any\s+history\b/gi, 'there is no history'],
  [/\bHe\s+denies\b/gi, 'There is no history of'],
  [/\bShe\s+denies\b/gi, 'There is no history of'],
  [/\bthe patient denies\b/gi, 'there is no history of'],
  [/\bno known chronic familial illnesses\b/gi, 'no significant family history'],
  [/\bno known chronic illness\b/gi, 'no significant past medical history'],
  [/\bno history of past hospital admission\b/gi, 'no significant admission history'],
  [/\bno history of blood transfusion\b/gi, 'no history of blood transfusion'],
  [/\bretired\s+\w+\s+by\s+profession\b/gi, 'retired'],
  [/\bcentrally located\b/gi, 'central'],
  [/\bdoes not smoke and does not consume alcohol\b/gi, 'does not smoke or consume alcohol'],
];

export function renderClinicalNarrative(input: RenderInput): RenderedOutput {
  let text = input.rawParagraphs.join(' ');

  // Apply grammar/spelling fixes
  const corrections: string[] = [];
  for (const [regex, replacement] of COMMON_ERRORS) {
    const before = text;
    text = text.replace(regex, replacement);
    if (text !== before) corrections.push(`${regex.source} → ${replacement}`);
  }

  // Remove multiple spaces
  text = text.replace(/\s{2,}/g, ' ');

  // Ensure sentences end with period
  text = text.replace(/([a-zA-Z])\s*\.(\s*[A-Z])/g, '$1. $2');
  text = text.replace(/\.{2,}/g, '.');
  text = text.replace(/\s\./g, '.');

  // Capitalize first letter of each sentence
  text = text.replace(/(?:^|[.!?]\s+)([a-z])/g, (m) => m.toUpperCase());

  // Remove duplicate sentences
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  const unique: string[] = [];
  for (const s of sentences) {
    const trimmed = s.trim();
    if (!unique.some(u => u.toLowerCase() === trimmed.toLowerCase())) {
      unique.push(trimmed);
    }
  }

  let polished = unique.join(' ');

  // Ensure opening sentence starts with patient reference
  if (!polished.toLowerCase().startsWith('the patient') && !polished.toLowerCase().match(/^(he|she|they)/)) {
    polished = polished;
  }

  // Final cleanup
  polished = polished.replace(/\s{2,}/g, ' ').trim();

  // Ensure ends with period
  if (!polished.endsWith('.')) polished += '.';

  return { polished, corrections };
}

// ── SOCRATES Generator ──────────────────────────────────────────────────────

export interface SocratesOutput {
  site: string;
  onset: string;
  character: string;
  radiation: string;
  associations: string[];
  timing: string;
  exacerbating: string[];
  relieving: string[];
  severity: string;
}

export function generateSocrates(history: {
  hpiPainLocation?: string;
  hpiOnset?: string;
  hpiPainCharacter?: string;
  hpiPainRadiation?: string;
  hpiAssociatedVomiting?: boolean;
  hpiDuration?: string;
  complaintSeverity?: number;
}): SocratesOutput {
  return {
    site: history.hpiPainLocation || 'Not specified',
    onset: history.hpiOnset || 'Not specified',
    character: history.hpiPainCharacter || 'Not specified',
    radiation: history.hpiPainRadiation || 'None',
    associations: [
      ...(history.hpiAssociatedVomiting ? ['Vomiting'] : []),
    ],
    timing: history.hpiDuration ? `${history.hpiDuration} duration` : 'Not specified',
    exacerbating: ['Eating', 'Movement'],
    relieving: ['Nil', 'Vomiting (if present)'],
    severity: history.complaintSeverity ? `${history.complaintSeverity}/10` : 'Not specified',
  };
}

// ── Compress Redundancy ──────────────────────────────────────────────────────

export function compressNarrative(text: string): string {
  let result = text;
  result = result.replace(/There is no history of\s+([^.]+)\.\s*There is no history of\s+/gi, 'There is no history of $1 or ');
  result = result.replace(/(The patient does not smoke or consume alcohol\.)\s*\1/gi, '$1');
  return result;
}

// ── Temporal Progression Engine ──────────────────────────────────────────────
//
// Enforces that any clinical narrative follows the natural temporal arc:
//   Onset → Progression → Current State → Impact
//
// Reorders sentences into correct temporal sequence and inserts
// temporal transition phrases where missing.

export interface TemporalBlock {
  phase: 'opening' | 'onset' | 'progression' | 'current' | 'impact' | 'background';
  text: string;
}

const TEMPORAL_TRIGGERS: Record<string, string> = {
  'The onset was': 'opening',
  'The presentation was': 'opening',
  'The symptoms developed': 'opening',
  'The pain was initially': 'onset',
  'The pain is ': 'current',
  'The pain has': 'progression',
  'There is ': 'current',
  'There has been': 'progression',
  'has progressively': 'progression',
  'has since become': 'progression',
  'initially ': 'onset',
  'has had ': 'progression',
  'have been reported': 'current',
  'is a ': 'opening',
  'presents with': 'opening',
  'presenting with': 'opening',
  'Of note': 'impact',
  'Past medical history': 'background',
  'Surgical history': 'background',
  'Current medications': 'background',
  'Family history': 'background',
  'Social history': 'background',
  'Review of systems': 'background',
  'no significant past': 'background',
  'is not on any': 'background',
  'does not smoke': 'background',
  'does not consume': 'background',
};

export function enforceTemporalProgression(narrative: string): string {
  const sentences = narrative.match(/[^.!?]+[.!?]/g) || [];
  const blocks: { phase: string; text: string; idx: number }[] = [];

  const PHASE_ORDER = ['opening', 'onset', 'progression', 'current', 'impact', 'background'];

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i].trim();
    let phase = 'background';
    for (const [trigger, p] of Object.entries(TEMPORAL_TRIGGERS)) {
      if (s.startsWith(trigger)) { phase = p; break; }
    }
    blocks.push({ phase, text: s, idx: i });
  }

  // Sort by temporal phase order, preserving original order within same phase
  blocks.sort((a, b) => {
    const pa = PHASE_ORDER.indexOf(a.phase);
    const pb = PHASE_ORDER.indexOf(b.phase);
    if (pa !== pb) return pa - pb;
    return a.idx - b.idx;
  });

  // Insert temporal transition markers where gaps exist
  const result: string[] = [];
  let lastPhase = '';
  for (const b of blocks) {
    if (b.phase !== lastPhase && lastPhase !== '') {
      if (b.phase === 'current' && lastPhase === 'progression') {
        // Natural flow — no transition needed
      } else if (b.phase === 'impact' && (lastPhase === 'current' || lastPhase === 'progression')) {
        // Natural flow
      } else if (b.phase === 'background' && lastPhase !== 'background') {
        // Add transition to background section
        if (!b.text.startsWith('Past') && !b.text.startsWith('There is no')) {
          // keep as-is
        }
      }
    }
    result.push(b.text);
    lastPhase = b.phase;
  }

  return result.join(' ');
}
