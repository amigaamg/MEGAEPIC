// AMEXAN Presentation Registry - Barrel
// Constitutional Principle: Engines never import widgets/layouts directly.
// They ask the registry. Registry finds. Renderer draws.

export {
  getWidget,
  findWidgets,
  listWidgetsByPriority,
  widgetWorksIn,
  widgetRegistry,
} from './widget-registry';
export type { WidgetCategory, WidgetDefinition, WidgetRegistry } from './widget-registry';

export {
  getLayout,
  listLayouts,
  getLayoutForWorkspace,
  layoutRegistry,
} from './layout-registry';
export type {
  LayoutKind,
  LayoutZoneAllocation,
  LayoutDefinition,
  LayoutRegistry,
} from './layout-registry';

export {
  getTheme,
  getThemeTokens,
  listThemes,
  themeIsWhiteLabelSafe,
  generateThemeCssVariables,
  themeRegistry,
  THEMES,
} from './theme-registry';
export type { ThemeId, ThemeTokens, ThemeDefinition, ThemeRegistry } from './theme-registry';
