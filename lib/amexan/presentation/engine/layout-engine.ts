// AMEXAN Presentation Engine - Layout Engine
// Constitutional Principle: Layouts are chosen, never written by hand.
// The engine selects from the layout registry based on workspace, viewport, and content.

import type { ViewportClass } from '../types';
import { getLayout, getLayoutForWorkspace, listLayouts } from '../registry/layout-registry';
import type { LayoutKind } from '../registry/layout-registry';

export interface LayoutRequest {
  workspaceId?: string;
  layoutKind?: LayoutKind;
  viewportClass: ViewportClass;
  contentKind?: 'form' | 'table' | 'timeline' | 'dashboard' | 'detail' | 'list';
  density?: 'comfortable' | 'compact' | 'spacious';
}

export interface LayoutDecision {
  kind: LayoutKind;
  columns: 1 | 2 | 3 | 4;
  zones: { zone: string; visible: boolean; weight: number; order: number }[];
  maxContentWidth: number;
  scroll: 'page' | 'panel' | 'workspace';
  responsiveMode: string;
  density: string;
}

export function resolveLayout(request: LayoutRequest): LayoutDecision {
  const kind = request.layoutKind ?? (request.workspaceId ? getLayoutForWorkspace(request.workspaceId) : 'single');
  const layout = getLayout(kind);
  const columns = layout.defaultColumns[request.viewportClass];
  const density = request.density ?? (request.viewportClass === 'xs' || request.viewportClass === 'sm' ? 'compact' : 'comfortable');

  const zones = layout.zones.map((zone) => {
    const hidden = zone.hiddenWhen?.includes(request.viewportClass) ?? false;
    return {
      zone: zone.zone,
      visible: !hidden,
      weight: zone.weight,
      order: zone.order,
    };
  });

  return {
    kind,
    columns,
    zones,
    maxContentWidth: layout.maxContentWidth,
    scroll: layout.scroll,
    responsiveMode: layout.responsive[request.viewportClass],
    density,
  };
}

export const layoutEngine = {
  resolve: resolveLayout,
  forWorkspace: (workspaceId: string, viewportClass: ViewportClass): LayoutDecision =>
    resolveLayout({ workspaceId, viewportClass }),
  available: () => listLayouts(),
};

export type LayoutEngine = typeof layoutEngine;
