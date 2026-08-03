// AMEXAN Presentation Renderer - Layout Renderer
// Constitutional Principle: Layouts are constitutional objects, never CSS.
// The renderer emits a zone tree the UI layer can mount.

import type { DeviceInfo } from '../types';
import type { LayoutDecision } from '../engine/layout-engine';
import type { ViewportClass } from '../types';

export interface RenderedZone {
  zone: string;
  visible: boolean;
  weight: number;
  order: number;
  slot: string;
}

export interface RenderedLayout {
  kind: string;
  columns: 1 | 2 | 3 | 4;
  zones: RenderedZone[];
  maxContentWidth: number;
  scroll: string;
  responsiveMode: string;
  density: string;
  containerClass: string;
  viewport: ViewportClass;
}

export function renderLayoutView(decision: LayoutDecision, device: DeviceInfo): RenderedLayout {
  return {
    kind: decision.kind,
    columns: decision.columns,
    zones: decision.zones.map((z) => ({ ...z, slot: z.zone.toLowerCase().replace(/\s+/g, '_') })),
    maxContentWidth: decision.maxContentWidth,
    scroll: decision.scroll,
    responsiveMode: decision.responsiveMode,
    density: decision.density,
    containerClass: `layout-${decision.kind}`,
    viewport: device.viewportClass,
  };
}

export function zoneOrder(zone: string): number {
  switch (zone) {
    case 'primary':
      return 0;
    case 'sidebar':
    case 'side':
      return 1;
    case 'context':
      return 2;
    case 'header':
    case 'toolbar':
      return 3;
    case 'footer':
      return 4;
    default:
      return 5;
  }
}

export function sortZonesByOrder(zones: RenderedZone[]): RenderedZone[] {
  return [...zones].sort((a, b) => a.order - b.order);
}

export const layoutRenderer = {
  render: renderLayoutView,
  zoneOrder,
  sort: sortZonesByOrder,
};

export type LayoutRenderer = typeof layoutRenderer;
