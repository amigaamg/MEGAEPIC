// AMEXAN Experience Engine - Barrel
// Constitutional Principle: The same intelligence. The appropriate interface.

export { experienceConstitution, experienceGuarantees, fatigueTiers, focusModes } from './constitution';
export type { ExperienceGuarantee, FatigueTier, FocusMode } from './constitution';

export { journeyEngine, getJourney, initializeJourney, advancePhase, journeyProgress } from './journey-engine';
export type { JourneyPhase, JourneyDefinition, JourneyState, JourneyEngine } from './journey-engine';

export { focusEngine, focusModeFor, initialFocus, setActiveTask, deferInterruptions, isFocused } from './focus-engine';
export type { FocusState, FocusEngine } from './focus-engine';

export { fatigueEngine, assessFatigue, fatigueSlowsMotion, fatigueReducesChrome } from './fatigue-engine';
export type { FatigueInput, FatigueDecision, FatigueEngine } from './fatigue-engine';

export { trustEngine, assessTrust, everyAiOutputLabeled } from './trust-engine';
export type { TrustInput, TrustDecision, TrustEngine } from './trust-engine';

export { continuityEngine, captureSnapshot, resumeFromSnapshot, isSnapshotFresh, continuityGuarantee } from './continuity-engine';
export type { ContinuitySnapshot, ContinuityState, ContinuityEngine } from './continuity-engine';
