import type { EncounterState, AnswerRecord, DomainCompleteness } from '../knowbase/diseaseNode';

const DOMAIN_FEATURES: Record<keyof DomainCompleteness, string[]> = {
  timeline: ['pain_onset', 'pain_onset_sudden', 'pain_duration_hours', 'pain_duration_days'],
  location: ['pain_initial_location', 'pain_location_now'],
  character: ['pain_character', 'pain_severity'],
  severity: ['pain_severity'],
  radiation: ['pain_radiation'],
  aggravating: ['pain_worsening_factors'],
  relieving: ['pain_relieving_factors'],
  temporal_pattern: ['pain_temporal_pattern'],
  functional_impact: ['functional_impact', 'impact_daily_activity', 'impact_sleep'],
  associated_gi: ['nausea', 'vomiting', 'anorexia', 'abdominal_distension', 'obstipation', 'diarrhea', 'constipation', 'melena', 'hematochezia', 'hematemesis'],
  associated_fever: ['fever', 'fever_chills', 'fever_pattern'],
  associated_urinary: ['dysuria', 'hematuria', 'flank_pain', 'urinary_frequency'],
  associated_gynae: ['last_menstrual_period', 'vaginal_bleeding', 'vaginal_discharge', 'dyspareunia'],
  red_flags: ['syncope', 'peritonism', 'rigidity', 'gi_bleeding_syncope'],
  risk_factors: ['prior_abdominal_surgery', 'nsaid_use', 'alcohol_use', 'smoking', 'known_gallstones', 'previous_similar_episodes', 'anticoagulant_use', 'family_history_gi_cancer'],
};

export function computeCompleteness(state: EncounterState): DomainCompleteness {
  const answeredIds = new Set(state.answers.map(a => a.featureId));
  for (const pf of state.chiefComplaint.preFiledFeatures) {
    answeredIds.add(pf.featureId);
  }

  const result: DomainCompleteness = {
    timeline: false,
    location: false,
    character: false,
    severity: false,
    radiation: false,
    aggravating: false,
    relieving: false,
    temporal_pattern: false,
    functional_impact: false,
    associated_gi: false,
    associated_fever: false,
    associated_urinary: false,
    associated_gynae: false,
    red_flags: false,
    risk_factors: false,
  };

  for (const [domain, features] of Object.entries(DOMAIN_FEATURES)) {
    const answered = features.filter(f => answeredIds.has(f)).length;
    const target = domain === 'severity' ? 1 : domain === 'timeline' ? 1 : domain === 'location' ? 1 : domain === 'character' ? 2 : 1;
    (result as any)[domain] = answered >= target;
  }

  // Special: associated_gi needs at least 2 answered
  const giAnswered = DOMAIN_FEATURES.associated_gi.filter(f => answeredIds.has(f)).length;
  result.associated_gi = giAnswered >= 2;

  // Special: associated_gynae only matters for reproductive-age females
  // Don't mark as incomplete for males/children too young

  return result;
}

export function getIncompleteDomains(completeness: DomainCompleteness): (keyof DomainCompleteness)[] {
  const incomplete: (keyof DomainCompleteness)[] = [];
  for (const [domain, complete] of Object.entries(completeness)) {
    if (!complete) incomplete.push(domain as keyof DomainCompleteness);
  }
  return incomplete;
}

export function getCompletenessScore(completeness: DomainCompleteness): number {
  const total = Object.keys(completeness).length;
  const completed = Object.values(completeness).filter(Boolean).length;
  return completed / total;
}

export function isHistoryCompleteEnough(
  completeness: DomainCompleteness,
  convergenceProb: number,
): boolean {
  // Must have: timeline, location, severity, red_flags
  const mandatory = completeness.timeline && completeness.location && completeness.severity && completeness.red_flags;
  if (!mandatory) return false;

  // If convergence >85% and character done, we can stop
  if (convergenceProb >= 0.85 && completeness.character) return true;

  // Must have at least 70% of domains
  const score = getCompletenessScore(completeness);
  return score >= 0.7;
}

export function getNextMissingDomain(
  completeness: DomainCompleteness,
  state: EncounterState,
): keyof DomainCompleteness | null {
  const order: (keyof DomainCompleteness)[] = [
    'timeline',
    'location',
    'character',
    'severity',
    'radiation',
    'aggravating',
    'relieving',
    'temporal_pattern',
    'functional_impact',
    'associated_gi',
    'associated_fever',
    'associated_urinary',
    'red_flags',
    'risk_factors',
  ];

  // Skip gynae for males/children
  const isFemaleReproAge = state.patient.sex === 'female' && state.patient.age >= 10 && state.patient.age <= 55;
  const relevantDomains = isFemaleReproAge
    ? order
    : order.filter(d => d !== 'associated_gynae');

  for (const domain of relevantDomains) {
    if (!completeness[domain]) return domain;
  }

  return null;
}
