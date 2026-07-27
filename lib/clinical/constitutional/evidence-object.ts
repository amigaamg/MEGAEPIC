// ─────────────────────────────────────────────────────────────────
// AMEXAN Evidence Object Schema
// Every examination finding is a formal evidence object.
// Documentation is output, not input.
// ─────────────────────────────────────────────────────────────────

export type Certainty = 'observed' | 'confirmed' | 'probable' | 'possible' | 'unable_to_assess' | 'not_tested';

export type Severity = 'none' | 'mild' | 'moderate' | 'severe' | 'critical';

export type ExamTechnique = 'inspection' | 'palpation' | 'percussion' | 'auscultation' | 'measurement' | 'special_test' | 'provocation' | 'observation';

export type BodySide = 'left' | 'right' | 'bilateral' | 'midline' | 'not_applicable';

export interface EvidenceLocation {
  system: string;
  section: string;
  anatomicalSite?: string;
  side?: BodySide;
  quadrant?: string;
  dermatome?: string;
  nerveDistribution?: string;
  joint?: string;
  distanceFromLandmark?: { value: number; unit: 'cm' | 'mm' };
}

export interface EvidenceQualifier {
  onset?: 'acute' | 'subacute' | 'chronic' | 'recurrent' | 'intermittent';
  duration?: string;
  character?: string;
  radiation?: string;
  aggravatingFactors?: string[];
  relievingFactors?: string[];
  associatedSymptoms?: string[];
}

export interface EvidenceObject {
  id: string;
  findingId: string;
  findingLabel: string;
  value: unknown;
  displayValue: string;

  // Identity
  encounterId: string;
  examinerId: string;
  examinedAt: string;

  // Context
  technique: ExamTechnique[];
  location: EvidenceLocation;
  qualifier?: EvidenceQualifier;

  // Certainty & severity
  certainty: Certainty;
  severity: Severity;

  // Links (built from evidence graph)
  mechanisms: string[];
  phenotypes: string[];
  diseases: string[];
  investigations: string[];

  // Temporal
  isNew: boolean;
  trend: 'stable' | 'improving' | 'worsening' | 'new' | 'resolved' | 'not_applicable';

  // Quality
  completenessScore: number;
  isCritical: boolean;
  requiresFollowUp: boolean;
  followUpInterval?: string;

  // Documentation
  narrativePhrase: string;
}

export type EvidenceCollection = Record<string, EvidenceObject>;

let _evidenceCtr = 0;

export function generateEvidenceId(): string {
  _evidenceCtr++;
  const ts = Date.now().toString(36);
  return `ev_${ts}_${_evidenceCtr}`;
}

export function createEvidenceObject(
  findingId: string,
  findingLabel: string,
  value: unknown,
  system: string,
  section: string,
  encounterId: string,
  examinerId: string,
  certainty: Certainty = 'observed',
  severity: Severity = 'none',
  technique?: ExamTechnique[],
  side?: BodySide,
): EvidenceObject {
  const strVal = value != null ? String(value) : '';
  return {
    id: generateEvidenceId(),
    findingId,
    findingLabel,
    value,
    displayValue: strVal.replace(/_/g, ' '),
    encounterId,
    examinerId,
    examinedAt: new Date().toISOString(),
    technique: technique || ['observation'],
    location: {
      system,
      section,
      side,
    },
    certainty,
    severity,
    mechanisms: [],
    phenotypes: [],
    diseases: [],
    investigations: [],
    isNew: true,
    trend: 'not_applicable',
    completenessScore: 0,
    isCritical: false,
    requiresFollowUp: false,
    narrativePhrase: strVal,
  };
}

export function classifyCertainty(value: unknown): Certainty {
  if (value == null || value === '' || value === false) return 'not_tested';
  if (value === 'unable') return 'unable_to_assess';
  return 'observed';
}

export function classifySeverity(
  value: unknown,
  cardId: string,
): Severity {
  const str = String(value || '');
  const severeKeywords = ['severe', 'critical', 'fixed', 'hard', 'irregular', 'fixed', 'chest_wall_fixation', 'necrotic', 'absent', 'massive', 'copious'];
  const moderateKeywords = ['moderate', 'restricted', 'firm', 'warm', 'reduced', 'palpable'];
  const mildKeywords = ['mild', 'soft', 'minimal', 'slight'];

  for (const kw of severeKeywords) {
    if (str.includes(kw)) return 'severe';
  }
  for (const kw of moderateKeywords) {
    if (str.includes(kw)) return 'moderate';
  }
  for (const kw of mildKeywords) {
    if (str.includes(kw)) return 'mild';
  }
  if (str && str !== 'none' && str !== 'normal' && str !== 'not_palpable') return 'mild';
  return 'none';
}

export function isFindingCritical(value: unknown, cardId: string): boolean {
  const str = String(value || '');
  const criticalFindings = [
    'absent_breath_sounds', 'gcs_less_than_8', 'fixed_dilated_pupil',
    'unconscious', 'unresponsive', 'cardiac_arrest', 'no_pulse',
    'severe_haemorrhage', 'airway_obstruction', 'stridor', 'chest_wall_fixation',
    'necrotic', 'acute_limb_ischaemia', 'meningism', 'sepsis',
  ];
  for (const cf of criticalFindings) {
    if (str.includes(cf) || cardId.includes(cf)) return true;
  }
  return false;
}

export function evidenceCollectionFromFindings(
  findings: Record<string, unknown>,
  system: string,
  encounterId: string,
  examinerId: string,
  findingLabels: Record<string, string>,
): EvidenceCollection {
  const collection: EvidenceCollection = {};
  for (const [findingId, value] of Object.entries(findings)) {
    if (value == null || value === '' || value === false) continue;
    const label = findingLabels[findingId] || findingId;
    const certainty = classifyCertainty(value);
    const severity = classifySeverity(value, findingId);
    const critical = isFindingCritical(value, findingId);
    const side = extractSide(findingId, value);
    collection[findingId] = createEvidenceObject(
      findingId, label, value, system, findSectionForCard(findingId),
      encounterId, examinerId, certainty, severity, undefined, side,
    );
    collection[findingId].isCritical = critical;
    collection[findingId].severity = severity;
    if (severity === 'severe' || severity === 'critical') {
      collection[findingId].requiresFollowUp = true;
    }
  }
  return collection;
}

function extractSide(findingId: string, value: unknown): BodySide | undefined {
  const str = String(value || '');
  if (str.includes('left') || findingId.includes('left')) return 'left';
  if (str.includes('right') || findingId.includes('right')) return 'right';
  if (str.includes('bilateral')) return 'bilateral';
  return undefined;
}

const SECTION_MAP: Record<string, string> = {
  resp: 'respiratory',
  abd: 'abdominal',
  cvs: 'cardiovascular',
  neuro: 'neurological',
  breast: 'breast',
  ge: 'general_examination',
  ueo: 'universal_object',
};

function findSectionForCard(cardId: string): string {
  for (const [prefix, section] of Object.entries(SECTION_MAP)) {
    if (cardId.startsWith(prefix)) return section;
  }
  return 'unknown';
}

export interface EvidenceDelta {
  findingId: string;
  findingLabel: string;
  previousValue: unknown;
  currentValue: unknown;
  changed: boolean;
  trend: 'stable' | 'improving' | 'worsening' | 'new' | 'resolved';
}

export function computeEvidenceDelta(
  previous: EvidenceCollection,
  current: EvidenceCollection,
): EvidenceDelta[] {
  const allIds = new Set([...Object.keys(previous), ...Object.keys(current)]);
  const deltas: EvidenceDelta[] = [];
  for (const id of allIds) {
    const prev = previous[id];
    const curr = current[id];
    if (!prev && curr) {
      deltas.push({ findingId: id, findingLabel: curr.findingLabel, previousValue: undefined, currentValue: curr.value, changed: true, trend: 'new' });
    } else if (prev && !curr) {
      deltas.push({ findingId: id, findingLabel: prev.findingLabel, previousValue: prev.value, currentValue: undefined, changed: true, trend: 'resolved' });
    } else if (prev && curr) {
      const changed = JSON.stringify(prev.value) !== JSON.stringify(curr.value);
      const trend = !changed ? 'stable' : classifyTrend(prev.value, curr.value, id);
      if (changed || trend !== 'stable') {
        deltas.push({ findingId: id, findingLabel: curr.findingLabel, previousValue: prev.value, currentValue: curr.value, changed, trend });
      }
    }
  }
  return deltas;
}

function classifyTrend(prev: unknown, curr: unknown, _cardId: string): EvidenceDelta['trend'] {
  const prevStr = String(prev || '');
  const currStr = String(curr || '');
  const improveMap: Record<string, string[]> = {
    severity: ['severe', 'moderate', 'mild', 'none'],
    size: ['massive', 'large', 'moderate', 'small', 'none'],
    mobility: ['fixed', 'restricted', 'mobile'],
  };
  const prevIdx = improveMap.severity.indexOf(prevStr);
  const currIdx = improveMap.severity.indexOf(currStr);
  if (prevIdx >= 0 && currIdx >= 0) {
    if (currIdx < prevIdx) return 'improving';
    if (currIdx > prevIdx) return 'worsening';
  }
  if (!prev && curr) return 'new';
  if (prev && (!curr || curr === '')) return 'resolved';
  return 'stable';
}
