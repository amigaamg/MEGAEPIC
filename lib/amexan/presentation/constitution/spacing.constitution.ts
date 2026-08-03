// AMEXAN Presentation Constitution - Spacing
// Version 1.0 (Frozen)
// Constitutional Principle: Only 2/4/8/12/16/24/32/40/48/64/80/96. Nothing else.

import { spacingTokens } from '../tokens';

export const spacingConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'Only the canonical spacing scale. Never padding:17px.',
};

export const spacingValues = {
  2: '2px',
  4: spacingTokens[1],
  8: spacingTokens[2],
  12: spacingTokens[3],
  16: spacingTokens[4],
  24: spacingTokens[6],
  32: spacingTokens[7],
  40: spacingTokens[8],
  48: spacingTokens[9],
  64: spacingTokens[10],
  80: spacingTokens[11],
  96: spacingTokens[12],
} as const;

export type SpacingToken = keyof typeof spacingValues;

export const spacingScale = [2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96] as const;

export const spacingSemantics = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 64,
  page: 96,
} as const;

export const getSpacing = (token: SpacingToken | number): string => {
  return spacingValues[token as SpacingToken] || spacingTokens[4];
};

// Section/component vertical rhythm. Never inline margins.
export const layoutRhythm = {
  componentGap: spacingSemantics.md,
  sectionGap: spacingSemantics.section,
  cardPadding: spacingSemantics.lg,
  cardPaddingCompact: spacingSemantics.md,
  pagePadding: spacingSemantics.xxl,
  tableCellPadding: spacingSemantics.sm,
  controlPadding: spacingSemantics.sm,
} as const;
