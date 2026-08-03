// AMEXAN Presentation Engine - Barrel
// Constitutional Principle: Engines decide. Renderers draw. Never the reverse.

export { layoutEngine, resolveLayout } from './layout-engine';
export type { LayoutRequest, LayoutDecision, LayoutEngine } from './layout-engine';

export { widgetEngine, renderWidget, renderWidgetsForWorkspace, transitionWidgetState, assertStateContract, isWidgetOfflineSafe } from './widget-engine';
export type { WidgetRuntime, WidgetRenderRequest, WidgetEngine } from './widget-engine';

export { navigationEngine, generateNavigation, filterNavigationByPermission } from './navigation-engine';
export type { NavigationItem, NavigationTree, NavigationRequest, NavigationEngine } from './navigation-engine';

export { dashboardEngine, generateDashboard, isDashboardGenerated } from './dashboard-engine';
export type { DashboardSectionSpec, DashboardObject, DashboardRequest, DashboardEngine } from './dashboard-engine';

export { responsiveEngine, getResponsiveMode, presentWidget, resolveResponsive, responsiveForLayout } from './responsive-engine';
export type { ResponsiveMode, WidgetPresentation, ResponsiveDecision, ResponsiveEngine } from './responsive-engine';

export { accessibilityEngine, computeAccessibilityProfile, auditContrast, ensureTouchTargets, isAccessibleComposition } from './accessibility-engine';
export type { AccessibilityProfile, ContrastViolation, AccessibilityEngine } from './accessibility-engine';

export { animationEngine, planMotion, hasForbiddenMotion, suggestMotion } from './animation-engine';
export type { MotionTrigger, MotionSpec, MotionPlan, AnimationEngine } from './animation-engine';

export { brandingEngine, computeBrandSurface, brandIsWhiteLabelSafe, effectiveTheme } from './branding-engine';
export type { BrandSurface, BrandRequest, BrandingEngine } from './branding-engine';
