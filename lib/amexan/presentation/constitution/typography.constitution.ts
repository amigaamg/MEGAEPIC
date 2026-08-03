// AMEXAN Presentation Constitution - Typography
// Version 1.0 (Frozen)
// Constitutional Principle: Only Display, Heading XL/S, Body Large/Body, Caption, Micro, Numeric, Code. No random sizes.

import { typographyTokens } from '../tokens';

export const typographyConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'Only a fixed type scale. No random sizes.',
};

export const typeScale = {
  display: 'display',
  headingXL: 'hero',
  headingL: 'h1',
  headingM: 'h2',
  headingS: 'h3',
  bodyLarge: 'bodyLarge',
  body: 'body',
  caption: 'caption',
  micro: 'caption',
  numeric: 'mono',
  code: 'mono',
} as const;

export type TypeRole = keyof typeof typeScale;

export const fontFamilies = {
  sans: typographyTokens.display.fontFamily,
  mono: typographyTokens.mono.fontFamily,
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6,
} as const;

export const typeScaleValues: Record<TypeRole, { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string; letterSpacing: string }> = {
  display: typographyTokens.display,
  headingXL: typographyTokens.hero,
  headingL: typographyTokens.h1,
  headingM: typographyTokens.h2,
  headingS: typographyTokens.h3,
  bodyLarge: typographyTokens.bodyLarge,
  body: typographyTokens.body,
  caption: typographyTokens.caption,
  micro: typographyTokens.caption,
  numeric: typographyTokens.mono,
  code: typographyTokens.mono,
};

export function getTypeStyle(role: TypeRole) {
  const token = typeScaleValues[role];
  const key = typeScale[role];
  return {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    fontWeight: token.fontWeight,
    lineHeight: token.lineHeight,
    letterSpacing: token.letterSpacing,
    scaleKey: key,
  };
}
