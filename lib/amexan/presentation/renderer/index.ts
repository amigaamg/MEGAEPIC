// AMEXAN Presentation Renderer - Barrel
// Constitutional Principle: Renderers draw. Engines decide. UI never reasons.

export { widgetRenderer, renderWidgetView, widgetIsRenderable } from './widget-renderer';
export type { WidgetRenderElement, RenderedWidget, WidgetRenderer } from './widget-renderer';

export { layoutRenderer, renderLayoutView, zoneOrder, sortZonesByOrder } from './layout-renderer';
export type { RenderedZone, RenderedLayout, LayoutRenderer } from './layout-renderer';

export { dashboardRenderer, renderDashboardView, dashboardHasContent } from './dashboard-renderer';
export type { RenderedSection, RenderedDashboard, DashboardRenderer } from './dashboard-renderer';
