// AMEXAN Design Tokens - Motion
// Constitutional Principle: Motion is communication only. Never decoration.
// Spec: Animation durations 100 / 150 / 200 / 300 / 500ms.

export const motionDurations = {
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
} as const;

export type MotionDuration = keyof typeof motionDurations;

export const motionDurationScale = [100, 150, 200, 300, 500] as const;

export const motionDurationsSemantics = {
  micro: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  slowest: 500,
} as const;

export const motionEasings = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 0.6, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

export type MotionEasing = keyof typeof motionEasings;

// Maximum motion durations per interaction tier. Never exceed these.
export const motionMaxDurations = {
  button: 80,
  control: 150,
  panel: 200,
  page: 300,
  dashboard: 300,
  hardLimit: 400,
} as const;

// Forbidden motions in a clinical operating system.
export const forbiddenMotions = ['bounce', 'spin', 'flash', 'shake', 'confetti'] as const;

export type ForbiddenMotion = (typeof forbiddenMotions)[number];

export const getMotionDuration = (duration: MotionDuration | number): string => {
  return motionDurations[duration as MotionDuration] || motionDurations[200];
};

export const isForbiddenMotion = (motion: string): boolean => {
  return (forbiddenMotions as readonly string[]).includes(motion);
};
