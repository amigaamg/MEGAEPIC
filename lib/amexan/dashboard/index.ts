// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN DASHBOARD CONSTITUTION — Public barrel (BOOK VIII · Volume VIII-A)
//
// The Dashboard Engine is the constitutional gateway that resolves any actor —
// Facility Administrator, Department Head, Ward In-Charge, Consultant, Medical
// Officer, Resident, Nurse, Pharmacist, Laboratory Scientist, Radiologist, Theatre,
// Emergency, Telemedicine, Researcer, Finance, HR or ICT — into a generated live
// operating environment. It never contains business logic or UI; it only composes
// the output of the upstream constitutional engines into families, workspaces,
// widgets, layers and intelligence.
//
//   50 roles → 18 dashboard families → dynamic widgets
// ═══════════════════════════════════════════════════════════════════════════════

export * from './types';

export {
  DASHBOARD_FAMILIES, DASHBOARD_LAYERS, FAMILY_NAVIGATION, FAMILY_QUICK_ACTIONS,
  PRESENTATION_RULES, buildWidget, familyLabel, resolveFamily, workspaceForAssignment,
} from './constitution';

export {
  ResolutionEngine, ASSIGNMENT_FAMILY_OVERRIDE, defaultCapabilities, defaultPreferences,
} from './resolutionEngine';
export type { ResolutionInput } from './resolutionEngine';

export {
  WidgetEngine, FAMILY_WIDGETS, CAPABILITY_FOR_PERMISSION, hasPermission, filterByPermission,
} from './widgetEngine';
export type { WidgetSpec, WidgetCompositionInput } from './widgetEngine';

export { PresentationEngine } from './PresentationEngine';
export type { PresentOptions, PresentationEngineOptions } from './PresentationEngine';