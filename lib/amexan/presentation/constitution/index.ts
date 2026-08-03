// AMEXAN Presentation Constitution - Index
// Version 1.0 (Frozen)

export { presentationConstitution } from './presentation.constitution';
export type { ConstitutionDocument } from './presentation.constitution';

export {
  colorConstitution,
  semanticColorNames,
  colorRoles,
  semanticColorPalette,
  baseColorTokens,
  getBrandColor,
} from './colors.constitution';
export type { ColorRole, BrandColorSet } from './colors.constitution';

export {
  typographyConstitution,
  typeScale,
  fontFamilies,
  fontWeights,
  lineHeights,
  typeScaleValues,
  getTypeStyle,
} from './typography.constitution';
export type { TypeRole } from './typography.constitution';

export {
  spacingConstitution,
  spacingValues,
  spacingSemantics,
  layoutRhythm,
  getSpacing,
} from './spacing.constitution';
export type { SpacingToken } from './spacing.constitution';

export {
  layoutConstitution,
  workspaceZones,
  workspaceZoneDescriptions,
  layoutTypes,
  layoutZones,
  workspaceSkeleton,
  getWorkspaceLayout,
} from './layout.constitution';
export type { WorkspaceZone, LayoutType } from './layout.constitution';

export {
  navigationConstitution,
  navigationTypes,
  navigationPriorities,
  globalHeaderItems,
  roleNavigation,
  navigationPatterns,
  defaultCommands,
  getRoleNavigation,
} from './navigation.constitution';
export type { NavigationType } from './navigation.constitution';

export {
  accessibilityConstitution,
  accessibilityStandards,
  inputMethods,
  focusVisibility,
  reducedMotionRules,
  contrastRules,
  getAccessibilitySpec,
} from './accessibility.constitution';

export {
  responsivenessConstitution,
  viewportClasses,
  viewportBounds,
  viewportLabels,
  componentResponsiveContract,
  resolveResponsiveContract,
  getViewportBehavior,
} from './responsiveness.constitution';
export type { ResponsiveContract } from './responsiveness.constitution';

export {
  animationConstitution,
  allowedAnimations,
  forbiddenAnimations,
  animationDurations,
  animationMaxDurations,
  animationEasing,
  motionJustifications,
  isAllowedAnimation,
  getAnimationDuration,
} from './animation.constitution';
export type { AllowedAnimation } from './animation.constitution';

export {
  themesConstitution,
  themeSections,
  customizationLevels,
  baseThemeId,
  isThemeInheritanceValid,
  whiteLabelGuarantees,
} from './themes.constitution';
export type { ThemeSection, ThemeDocument, CustomizationLevel } from './themes.constitution';
