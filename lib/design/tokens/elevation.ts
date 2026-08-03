// AMEXAN Design Tokens - Elevation
// Constitutional Principle: Elevation is a communication layer. Never decoration.
// Spec: Elevation 0-5. 0 = flat. 5 = topmost overlay.

export const elevationTokens: Record<0 | 1 | 2 | 3 | 4 | 5, string> = {
  0: 'none',
  1: '0 1px 2px rgba(15, 23, 42, 0.05)',
  2: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
  3: '0 4px 6px rgba(15, 23, 42, 0.07), 0 2px 4px rgba(15, 23, 42, 0.05)',
  4: '0 10px 15px rgba(15, 23, 42, 0.10), 0 4px 6px rgba(15, 23, 42, 0.05)',
  5: '0 20px 25px rgba(15, 23, 42, 0.15), 0 10px 10px rgba(15, 23, 42, 0.04)',
};

export type Elevation = keyof typeof elevationTokens;

export const elevationScale = [0, 1, 2, 3, 4, 5] as const;

export const elevationSemantics = {
  flat: 0,
  resting: 1,
  hover: 2,
  popover: 3,
  modal: 4,
  overlay: 5,
} as const;

export const getElevation = (level: Elevation | number): string => {
  return elevationTokens[level as Elevation] || elevationTokens[0];
};
