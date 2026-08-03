// AMEXAN Design Tokens - Icons
// Constitutional Principle: Icon sizes are tokenized. Never inline numbers.
// Spec: 20 / 24 / 28 / 32.

export const iconSizes = {
  20: '20px',
  24: '24px',
  28: '28px',
  32: '32px',
} as const;

export type IconSize = keyof typeof iconSizes;

export const iconSizeValues = [20, 24, 28, 32] as const;

export const iconSizeSemantics = {
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

export const getIconSize = (size: IconSize | number): string => {
  return iconSizes[size as IconSize] || iconSizes[24];
};
