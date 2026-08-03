// AMEXAN Presentation Renderer - Widget Renderer
// Constitutional Principle: The Presentation Engine never imports React.
// Renderers draw. Engines decide. Renderers are the only layer that touches UI.

import type { DeviceInfo, SemanticColor, VisibilityState } from '../types';
import type { WidgetRuntime } from '../engine/widget-engine';
import type { ComponentState } from '../constitution/presentation.states';

export type WidgetRenderElement = 'card' | 'button' | 'chart' | 'list' | 'table' | 'timeline' | 'panel';

export interface RenderedWidget {
  widgetId: string;
  element: WidgetRenderElement;
  state: ComponentState;
  visibility: VisibilityState;
  priority: string;
  semanticColor: SemanticColor;
  title: string;
  ariaLabel: string;
  keyboardNav: boolean;
  focusable: boolean;
  responsive: { desktop: string; tablet: string; phone: string };
  actions: string[];
  data: unknown;
}

export function renderWidgetView(runtime: WidgetRuntime, device: DeviceInfo): RenderedWidget {
  const w = runtime.widget;
  const compact = device.viewportClass === 'xs' || device.viewportClass === 'sm';
  return {
    widgetId: w.id,
    element: compact ? 'card' : elementFor(w.id),
    state: runtime.state,
    visibility: runtime.visibility,
    priority: w.priority,
    semanticColor: w.semanticColor,
    title: w.name,
    ariaLabel: w.accessibility.ariaLabel,
    keyboardNav: w.accessibility.keyboardNav,
    focusable: w.accessibility.keyboardNav,
    responsive: w.responsive,
    actions: runtime.actions,
    data: runtime.data,
  };
}

function elementFor(widgetId: string): WidgetRenderElement {
  if (widgetId.includes('chart') || widgetId.includes('analytics')) return 'chart';
  if (widgetId.includes('list') || widgetId.includes('medication') || widgetId.includes('occupancy')) return 'list';
  if (widgetId.includes('calendar')) return 'table';
  if (widgetId.includes('timeline')) return 'timeline';
  return 'card';
}

export function widgetIsRenderable(runtime: WidgetRuntime): boolean {
  if (runtime.state === 'error' || runtime.state === 'offline' || runtime.state === 'empty') return true;
  return runtime.visibility !== 'hidden';
}

export const widgetRenderer = {
  render: renderWidgetView,
  renderable: widgetIsRenderable,
};

export type WidgetRenderer = typeof widgetRenderer;
