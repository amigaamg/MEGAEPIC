// AMEXAN Design Tokens - Radius
// Constitutional Principle: Radius is standardized. Never arbitrary.
// Spec: 4 / 8 / 12 / 16 / 24 / 999.

export const radiusValues = {
  4: '4px',
  8: '8px',
  12: '12px',
  16: '16px',
  24: '24px',
  999: '999px',
} as const;

export type Radius = keyof typeof radiusValues;

export const radiusScale = [4, 8, 12, 16, 24, 999] as const;

export const radiusSemantics = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  xxl: 24,
  pill: 999,
} as const;

export const getRadius = (radius: Radius | number): string => {
  return radiusValues[radius as Radius] || radiusValues[8];
};
