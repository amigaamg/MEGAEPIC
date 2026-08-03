// AMEXAN Universal Design System (AUDS) - Entry Point
// Phase 4.1. Unifies all design engines behind one import surface.
// Constitutional Principle: One system. Tokens are data. Engines never live in React.

// ── Tokens ────────────────────────────────────────────────────────────────────
export * from './tokens/colors';
export * from './tokens/typography';
export * from './tokens/spacing';
export * from './tokens/breakpoints';
export * from './tokens/radius';
export * from './tokens/elevation';
export * from './tokens/motion';
export * from './tokens/icons';

// ── Theme Engine ─────────────────────────────────────────────────────────────
export {
  themes,
  getTheme,
  baseTheme,
  radiusTokens as themeRadiusTokens,
  shadowTokens,
  animationTokens,
} from './theme-engine';
export type { Theme } from './theme-engine';

// ── Responsive Engine ────────────────────────────────────────────────────────
export { responsiveEngine, responsiveProfiles } from './responsive-engine';
export type { ViewportInfo, ViewportEngineOptions, InputMode, ResponsiveProfile } from './responsive-engine';

// ── Navigation Engine ────────────────────────────────────────────────────────
export { navigationEngine, navigationLayers } from './navigation-engine';
export type {
  NavigationType,
  NavigationVariant,
  NavigationItemVariant,
  NavigationItem,
  NavigationConfig,
  Breadcrumb,
  SmartBackTarget,
  NavigationTelemetryEvent,
} from './navigation-engine';

// ── Layout Engine ────────────────────────────────────────────────────────────
export { LayoutEngine, createLayoutConfig, layoutKinds, workspaceRegions } from './layout-engine';
export type { LayoutKind, LayoutConfig, WorkspaceRegion } from './layout-engine';

// ── Motion Engine ────────────────────────────────────────────────────────────
export { motionEngine, motionLevels } from './motion-engine';
export type { MotionLevel, MotionSpec, MotionDecision } from './motion-engine';

// ── Accessibility Engine ─────────────────────────────────────────────────────
export { accessibilityEngine, accessibilityProfiles, profileRequirements, isRtlLanguage } from './accessibility-engine';
export type { AccessibilityProfile, ProfileRequirements, LocaleDirection, LocaleEngine } from './accessibility-engine';

// ── Component Registry ───────────────────────────────────────────────────────
export { componentRegistry, universalStates, universalSizes } from './component-registry';
export type {
  UniversalState,
  UniversalSize,
  ComponentContract,
  ComponentVersion,
  RegisteredComponent,
  AccessibilityContract,
  TelemetryContract,
} from './component-registry';
