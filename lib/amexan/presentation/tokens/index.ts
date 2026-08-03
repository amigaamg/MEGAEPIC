// AMEXAN Presentation Tokens - Index
// Constitutional Principle: Everything is token driven. Never hardcoded values.

// Colors
export { colorTokens } from '@/lib/design/tokens/colors';
export type { } from '@/lib/design/tokens/colors';

// Typography
export { typographyTokens } from '@/lib/design/tokens/typography';

// Spacing
export { spacingTokens, spacingScale } from '@/lib/design/tokens/spacing';

// Shadows (presentation-native)
export {
  shadowValues,
  shadowScale,
  shadowSemantics,
  getShadow,
} from './shadows';
export type { Shadow } from './shadows';

// Radius
export {
  radiusValues,
  radiusScale,
  radiusSemantics,
  getRadius,
} from '@/lib/design/tokens/radius';
export type { Radius } from '@/lib/design/tokens/radius';

// Z-Index (presentation-native)
export {
  zIndexValues,
  zIndexOrder,
  getZIndex,
} from './zindex';
export type { ZIndexLayer } from './zindex';

// Icons
export {
  iconSizes,
  iconSizeValues,
  iconSizeSemantics,
  getIconSize,
} from '@/lib/design/tokens/icons';
export type { IconSize } from '@/lib/design/tokens/icons';

// Motion
export {
  motionDurations,
  motionDurationScale,
  motionDurationsSemantics,
  motionEasings,
  motionMaxDurations,
  forbiddenMotions,
  getMotionDuration,
  isForbiddenMotion,
} from '@/lib/design/tokens/motion';
export type { MotionDuration, MotionEasing, ForbiddenMotion } from '@/lib/design/tokens/motion';

// Breakpoints
export {
  breakpoints,
  getCurrentBreakpoint,
  breakpointOrder,
  isBreakpointAtLeast,
  isBreakpointAtMost,
} from '@/lib/design/tokens/breakpoints';
export type { BreakpointName } from '@/lib/design/tokens/breakpoints';
