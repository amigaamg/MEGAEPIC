import type {
  EncounterState,
  StructuredSymptom,
  GenericSymptom,
  SymptomId,
} from './encounterState';

// The structured result produced by parsing a free-text clinical narrative.
export interface ConversationParseResult {
  chiefComplaint: {
    text: string;
    duration?: string;
    severity?: number;
  } | null;
  durationText?: string;
  symptoms: {
    symptomId: SymptomId;
    matchedText: string;
    fields: Record<string, string | boolean | number>;
  }[];
  negatives: string[];
  uncertainties: string[];
}

export interface AppliedConversationState {
  symptoms: Partial<Record<SymptomId, StructuredSymptom>>;
  denials: SymptomId[];
  chiefComplaint: {
    text: string;
    duration?: string;
    severity?: number;
  } | null;
}

const EMPTY_STATE: Pick<EncounterState, 'symptoms'> = { symptoms: {} as Record<SymptomId, StructuredSymptom | GenericSymptom> };

// Lexicon: symptom keyword → canonical constitutional SymptomId.
const SYMPTOM_LEXICON: Array<{ keywords: string[]; id: SymptomId }> = [
  { keywords: ['abdominal pain', 'stomach pain', 'belly ache', 'abdomen pain'], id: 'abdominal_pain' },
  { keywords: ['chest pain', 'chest tightness', 'retrosternal pain'], id: 'chest_pain' },
  { keywords: ['cough', 'coughing'], id: 'cough' },
  { keywords: ['fever', 'febrile', 'high temperature'], id: 'fever' },
  { keywords: ['shortness of breath', 'difficulty breathing', 'breathless', 'sob', 'dyspnoea', 'dyspnea'], id: 'dyspnea' },
  { keywords: ['nausea', 'vomiting', 'vomited', 'vomit', 'throwing up'], id: 'nausea_vomiting' },
  { keywords: ['diarrhea', 'diarrhoea', 'watery stools', 'loose stools'], id: 'diarrhea' },
  { keywords: ['constipation', 'hard stools', 'constipated'], id: 'constipation' },
  { keywords: ['difficulty swallowing', 'dysphagia'], id: 'dysphagia' },
  { keywords: ['blood in stool', 'bloody stool', 'melena', 'haematochezia', 'hematochezia'], id: 'gi_bleeding' },
  { keywords: ['jaundice', 'yellow eyes', 'yellow skin'], id: 'jaundice' },
  { keywords: ['abdominal swelling', 'distension', 'bloating'], id: 'distension' },
  { keywords: ['headache', 'head pain'], id: 'headache' },
  { keywords: ['dizziness', 'lightheaded'], id: 'dizziness' },
  { keywords: ['fainting', 'syncope', 'passed out', 'loss of consciousness', 'blacked out'], id: 'syncope' },
  { keywords: ['palpitations', 'heart racing', 'heart pounding'], id: 'palpitations' },
  { keywords: ['painful urination', 'burning urination', 'dysuria'], id: 'dysuria' },
  { keywords: ['frequent urination', 'urinary frequency'], id: 'frequency' },
  { keywords: ['blood in urine', 'hematuria', 'haematuria'], id: 'hematuria' },
  { keywords: ['vaginal bleeding', 'abnormal bleeding'], id: 'vaginal_bleeding' },
  { keywords: ['vaginal discharge', 'abnormal discharge'], id: 'vaginal_discharge' },
  { keywords: ['rash', 'skin rash', 'hives'], id: 'rash' },
  { keywords: ['joint pain', 'painful joints', 'arthralgia'], id: 'joint_pain' },
  { keywords: ['back pain', 'lower back pain'], id: 'back_pain' },
  { keywords: ['seizure', 'seizures', 'fits', 'convulsions'], id: 'seizure' },
  { keywords: ['weakness', 'weakness in'], id: 'weakness' },
  { keywords: ['numbness', 'tingling', 'parasthesia'], id: 'numbness' },
  { keywords: ['weight loss', 'losing weight', 'loss of weight'], id: 'weight_loss' },
  { keywords: ['fatigue', 'tiredness', 'exhaustion'], id: 'fatigue' },
  { keywords: ['night sweats', 'night sweating'], id: 'night_sweats' },
  { keywords: ['poor feeding', 'reduced feeding'], id: 'reduced_feeding' },
  { keywords: ['lethargy', 'lethargic', 'drowsy'], id: 'lethargy' },
  { keywords: ['cyanosis', 'bluish'], id: 'cyanosis' },
  { keywords: ['stridor', 'noisy breathing'], id: 'stridor' },
];

// Pragmatic segmentation: split into natural-language sentence-like fragments so
// that a negation applies only to its own clause, not to the whole story.
function segment(text: string): string[] {
  return text
    .split(/[.;,?]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractDuration(segment: string): string | undefined {
  const m = segment.match(
    /(?:for|of|over|since)?\s*(\d+(?:\.\d+)?)\s*(years?|yrs|weeks?|wks|months?|mths?|days?|hours?|hrs?|minutes?|mins?)/i,
  );
  if (!m) return undefined;
  return `${m[1]} ${m[2].toLowerCase()}`;
}

function extractSeverity(text: string): number | undefined {
  if (/(?:severe|excruciating|worst|intense)/i.test(text)) return 9;
  if (/(?:moderate|fairly severe)/i.test(text)) return 5;
  if (/(?:mild|slight|minor)/i.test(text)) return 2;
  return undefined;
}

function normalize(text: string): string {
  return ' ' + text.toLowerCase().replace(/\s+/g, ' ').trim() + ' ';
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Parse a free-text presenting complaint into structured, constitutional symptom
 * candidates. Rule-based and deterministic — it never invents fields beyond the
 * evidence present in the narrative.
 */
export function parseClinicalConversation(text: string): ConversationParseResult {
  const fragments = segment(text);
  const body = normalize(text.replace(/\bpatient\b|he|she\b/gi, ' '));

  const symptoms: ConversationParseResult['symptoms'] = [];
  const negatives: string[] = [];
  const seen = new Set<SymptomId>();

  const NEGATION_MARKERS = [
    'no ',
    'denies ',
    'denied ',
    'without ',
    'absence of ',
    'does not have ',
    'doesn\'t have ',
    'has not had ',
    'never had ',
    'no history of ',
    'no previous ',
  ];

  // First pass: preserve clause-level context by tokenising within each fragment.
  const isNegated = (fragment: string, keyword: string): boolean => {
    const idx = normalize(fragment).indexOf(keyword);
    if (idx === -1) return false;
    const preceding = fragment.trim().slice(0, idx).toLowerCase() + ' ';
    return NEGATION_MARKERS.some((m) => preceding.endsWith(m));
  };

  for (const entry of SYMPTOM_LEXICON) {
    for (const kw of entry.keywords) {
      const owningFragment = fragments.find((f) => normalize(f).indexOf(kw) !== -1);
      if (!owningFragment) continue;

      if (isNegated(owningFragment, kw)) {
        if (!negatives.includes(entry.id)) negatives.push(entry.id);
        break;
      }

      if (seen.has(entry.id)) break;
      seen.add(entry.id);

      const seg = normalize(owningFragment);
      const duration = extractDuration(seg);
      const start = seg.match(/(?:years?|weeks?|days?|hours?|months?)\s+ago/i)?.[0] ?? '';

      symptoms.push({
        symptomId: entry.id,
        matchedText: kw,
        fields: {
          present: true,
          ...(duration ? { duration } : {}),
          ...(start ? { start } : {}),
          ...(extractSeverity(seg) !== undefined ? { severity: extractSeverity(seg) } : {}),
        },
      });
      break;
    }
  }

  const uncertainties: string[] = [];
  if (/(\bunknown\b|\bfairly sure\b|\bcould be\b)/i.test(text)) {
    uncertainties.push('ambiguous clinical detail — confirm with the patient');
  }

  const durationText = extractDuration(body);
  const chief: ConversationParseResult['chiefComplaint'] = {
    text: capitalize((fragments[0] || text).trim()),
    ...(durationText ? { duration: durationText } : {}),
    ...(extractSeverity(body) !== undefined ? { severity: extractSeverity(body) } : {}),
  };

  return {
    chiefComplaint: chief,
    ...(durationText ? { durationText } : {}),
    symptoms,
    negatives,
    uncertainties,
  };
}

/**
 * Transform a parse result into a set of symptom updates + chief complaint ready
 * to be dispatched onto the encounter through the constitutional reducer.
 */
export function applyConversationToState(
  state: Pick<EncounterState, 'symptoms'>,
  result: ConversationParseResult,
): AppliedConversationState {
  const symptoms: AppliedConversationState['symptoms'] = {};
  const denials: SymptomId[] = [];
  const existing = state?.symptoms || EMPTY_STATE.symptoms;

  for (const s of result.symptoms) {
    // Preserve any fields a clinician may already have entered on this symptom.
    const prior = existing[s.symptomId] as unknown as Record<string, unknown> | undefined;
    symptoms[s.symptomId] = {
      present: true,
      ...(prior || {}),
      ...(s.fields as Record<string, never>),
    } as StructuredSymptom;
  }

  for (const id of result.negatives) {
    if (id) denials.push(id as SymptomId);
  }

  return {
    symptoms,
    denials,
    chiefComplaint: result.chiefComplaint,
  };
}