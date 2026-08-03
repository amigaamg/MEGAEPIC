// AMEXAN Experience Engine - Journey Engine
// Constitutional Principle: Every journey is always present. The interface adapts to phase.

export type JourneyPhase =
  | 'registration'
  | 'assessment'
  | 'diagnosis'
  | 'treatment'
  | 'monitoring'
  | 'discharge'
  | 'followup';

export interface JourneyDefinition {
  id: string;
  name: string;
  phases: JourneyPhase[];
  defaultPhase: JourneyPhase;
}

export interface JourneyState {
  journeyId: string;
  currentPhase: JourneyPhase;
  completedPhases: JourneyPhase[];
  nextPhase: JourneyPhase | null;
}

export const JOURNEYS: JourneyDefinition[] = [
  { id: 'patient_care', name: 'Patient Care', phases: ['assessment', 'diagnosis', 'treatment', 'monitoring', 'discharge', 'followup'], defaultPhase: 'assessment' },
  { id: 'admission', name: 'Admission', phases: ['registration', 'assessment'], defaultPhase: 'registration' },
  { id: 'education', name: 'Health Education', phases: ['assessment', 'followup'], defaultPhase: 'assessment' },
];

export function getJourney(id: string): JourneyDefinition | undefined {
  return JOURNEYS.find((j) => j.id === id);
}

export function initializeJourney(journeyId: string): JourneyState {
  const journey = getJourney(journeyId) ?? JOURNEYS[0]!;
  return {
    journeyId: journey.id,
    currentPhase: journey.defaultPhase,
    completedPhases: [],
    nextPhase: journey.phases[journey.phases.indexOf(journey.defaultPhase) + 1] ?? null,
  };
}

export function advancePhase(state: JourneyState): JourneyState {
  const journey = getJourney(state.journeyId);
  if (!journey) return state;
  const idx = journey.phases.indexOf(state.currentPhase);
  if (idx === -1 || idx === journey.phases.length - 1) return state;
  const next = journey.phases[idx + 1]!;
  return {
    ...state,
    currentPhase: next,
    completedPhases: [...state.completedPhases, state.currentPhase],
    nextPhase: journey.phases[idx + 2] ?? null,
  };
}

export function journeyProgress(state: JourneyState): number {
  const journey = getJourney(state.journeyId);
  if (!journey) return 0;
  const total = journey.phases.length;
  const current = journey.phases.indexOf(state.currentPhase) + 1;
  return Math.round((current / total) * 100);
}

export const journeyEngine = {
  get: getJourney,
  init: initializeJourney,
  advance: advancePhase,
  progress: journeyProgress,
};

export type JourneyEngine = typeof journeyEngine;
