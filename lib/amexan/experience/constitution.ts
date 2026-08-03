// AMEXAN Experience Constitution
// Version 1.0 (Frozen)
// Constitutional Principle: The same intelligence. The appropriate interface.
// Experience is adaptive: journey, focus, fatigue, trust, continuity, recovery, guidance.

export const experienceConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'The same intelligence. The appropriate interface.',
  guarantees: {
    journeyAlwaysPresent: true,
    focusOnTheTask: true,
    fatigueAware: true,
    trustTransparent: true,
    continuityPreserved: true,
  } as const,
};

export const experienceGuarantees = [
  'journey_always_present',
  'focus_on_the_task',
  'fatigue_aware',
  'trust_transparent',
  'continuity_preserved',
] as const;

export type ExperienceGuarantee = (typeof experienceGuarantees)[number];

export const fatigueTiers = [
  'alert',
  'fatigued',
  'very_fatigued',
] as const;

export type FatigueTier = (typeof fatigueTiers)[number];

export const focusModes = [
  'command_center',
  'focused',
  'productive',
  'professional',
] as const;

export type FocusMode = (typeof focusModes)[number];
