// AMEXAN Presentation Tokens - Shadows
// Constitutional Principle: Elevation is a communication layer. Never decoration.
// Spec: Only Flat / Low / Medium / High / Floating / Overlay.

export const shadowValues = {
  flat: 'none',
  low: '0 1px 2px rgba(15, 23, 42, 0.05)',
  medium: '0 2px 8px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
  high: '0 10px 20px rgba(15, 23, 42, 0.12), 0 4px 8px rgba(15, 23, 42, 0.06)',
  floating: '0 16px 32px rgba(15, 23, 42, 0.16), 0 6px 12px rgba(15, 23, 42, 0.08)',
  overlay: '0 24px 48px rgba(15, 23, 42, 0.20), 0 10px 16px rgba(15, 23, 42, 0.10)',
} as const;

export type Shadow = keyof typeof shadowValues;

export const shadowScale = ['flat', 'low', 'medium', 'high', 'floating', 'overlay'] as const;

export const shadowSemantics = {
  resting: 'low',
  hover: 'medium',
  popover: 'medium',
  card: 'low',
  drawer: 'high',
  modal: 'floating',
  toast: 'floating',
  overlay: 'overlay',
} as const;

export const getShadow = (shadow: Shadow | string): string => {
  return shadowValues[shadow as Shadow] || shadowValues.flat;
};
