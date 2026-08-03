export type * from './types'

// ── Constitution (frozen rules) ────────────────────────────────────────────
export * from './constitution/index'

// ── Tokens (data) ──────────────────────────────────────────────────────────
export * from './tokens/index'

export {
  VIEWPORT_CLASSES,
  VIEWPORT_ORDER,
  HEIGHT_BOUNDS,
  VIEWPORT_EXAMPLES,
  VIEWPORT_RULES,
  detectViewportClass,
  detectHeightClass,
  detectOrientation,
  detectPointerType,
  detectInteractionMode,
  detectBrowserEngine,
  detectColorScheme,
  detectPrefersReducedMotion,
  detectPrefersHighContrast,
  getDeviceInfo,
  getViewportRules,
} from './device-constitution'

export {
  MIN_TOUCH_SIZE,
  MIN_MOUSE_SIZE,
  MIN_PEN_SIZE,
  INTERACTION_RULES,
  getInteractionRules,
  getMinTouchTarget,
} from './interaction-constitution'

export {
  VISIBILITY_ORDER,
  isVisible,
  isInteractive,
  isExpandable,
  resolveVisibility,
} from './visibility-constitution'

export {
  SEMANTIC_COLORS,
  DARK_MODE_OVERRIDES,
  contrastRatio,
  meetsWCAGAA,
  getColor,
} from './color-constitution'

export {
  MIN_FONT_SIZE,
  getAccessibilityRules,
  validateContrast,
  getFontSize,
  shouldReduceMotion,
  getAnimDuration,
} from './accessibility-constitution'

export {
  PERFORMANCE_BUDGETS,
  PERFORMANCE_TARGETS,
  getPerformanceBudget,
  checkPerformance,
} from './performance-constitution'

export {
  BROWSER_ENGINES,
  FEATURE_SUPPORT,
  getSupportedFeatures,
  getBrowserInfo,
  getProgressiveEnhancement,
} from './browser-constitution'

export {
  getOfflineState,
  isOffline,
  shouldShowOfflineBadge,
  shouldShowPendingQueue,
  getSyncStrategy,
} from './offline-constitution'

export {
  getSidebarConfig,
  getNavigationStyle,
  getCardConfig,
  getButtonConfig,
  getFormConfig,
  getTableConfig,
  getModalConfig,
  getChartConfig,
  getColumnCount,
  getCardWidth,
  getMaxActions,
  getScrollConfig,
} from './layout-constitution'

export {
  createPresentationContext,
  renderPresentation,
  withPresentation,
} from './presentation-engine'
export type { EngineOutput, EngineCard, EngineSection, EngineAction, PresentationOutput } from './presentation-engine'

export {
  getBrand,
  getRoleTheme,
  buildThemeContext,
  generateCssVariables,
  getLayoutForRole,
} from './theme-engine'
export type { BrandConfig, ThemeOverride, RoleTheme, ThemeContext } from './theme-engine'

export {
  getCurrentViewport,
  refreshViewport,
  getCachedViewport,
  getViewport,
  isViewportAtLeast,
  viewportEngine,
} from './viewport-engine'
export type { ViewportSnapshot, ViewportEngine } from './viewport-engine'

export {
  generatePage,
  composePage,
  pageEngine,
} from './page-engine'
export type { PageBlueprint, PageRequest, PageSectionSpec, PageNavigationSpec } from './page-engine'
