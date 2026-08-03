// AMEXAN Presentation Engine - Responsive Engine
// Constitutional Principle: The same intelligence. The appropriate interface.
// Responsiveness is experience adaptation, not CSS shrinking.

import { getViewportRules } from '../device-constitution';
import type { DeviceInfo } from '../types';
import type { LayoutKind } from '../registry/layout-registry';

export type ResponsiveMode = 'focused' | 'productive' | 'professional' | 'command_center';
export type WidgetPresentation = 'visible' | 'collapsed' | 'stacked' | 'expanded' | 'hidden' | 'docked' | 'drawer';

export interface ResponsiveDecision {
  mode: ResponsiveMode;
  columns: 1 | 2 | 3 | 4;
  navigation: 'bottom_tabs' | 'top_bar' | 'sidebar' | 'drawer';
  sidebar: 'none' | 'permanent' | 'collapsible' | 'drawer';
  widgets: { id: string; presentation: WidgetPresentation }[];
  touchTarget: number;
  reduceMotion: boolean;
  chartDetail: 'simplified' | 'interactive' | 'full';
  tableDisplay: 'cards' | 'adaptive' | 'table';
}

export function getResponsiveMode(device: DeviceInfo): ResponsiveMode {
  switch (device.viewportClass) {
    case 'xs':
    case 'sm':
    case 'md':
      return 'focused';
    case 'lg':
      return 'productive';
    case 'xl':
    case 'xxl':
      return 'professional';
    case 'ultra':
      return 'command_center';
  }
}

// Content priority: critical stays, important collapses, useful stacks, optional hides.
export function presentWidget(priority: 'critical' | 'high' | 'medium' | 'low', device: DeviceInfo): WidgetPresentation {
  const mode = getResponsiveMode(device);
  switch (mode) {
    case 'focused':
      if (priority === 'critical') return 'visible';
      if (priority === 'high') return 'collapsed';
      return 'hidden';
    case 'productive':
      if (priority === 'critical') return 'visible';
      if (priority === 'high') return 'visible';
      if (priority === 'medium') return 'collapsed';
      return 'stacked';
    case 'professional':
      return 'visible';
    case 'command_center':
      return 'expanded';
  }
}

export function resolveResponsive(device: DeviceInfo, widgetPriorities: { id: string; priority: 'critical' | 'high' | 'medium' | 'low' }[]): ResponsiveDecision {
  const rules = getViewportRules(device.viewportClass);
  return {
    mode: getResponsiveMode(device),
    columns: rules.columns,
    navigation: rules.navigation,
    sidebar: rules.sidebar,
    widgets: widgetPriorities.map((w) => ({ id: w.id, presentation: presentWidget(w.priority, device) })),
    touchTarget: device.viewportClass === 'xs' || device.viewportClass === 'sm' ? 64 : 48,
    reduceMotion: device.prefersReducedMotion,
    chartDetail: rules.charts,
    tableDisplay: rules.tables,
  };
}

export function responsiveForLayout(kind: LayoutKind, device: DeviceInfo): LayoutKind {
  if (device.viewportClass === 'xs' || device.viewportClass === 'sm') return 'mobile_stack';
  if (kind === 'dashboard' && device.viewportClass === 'lg') return 'cards';
  return kind;
}

export const responsiveEngine = {
  mode: getResponsiveMode,
  present: presentWidget,
  resolve: resolveResponsive,
  forLayout: responsiveForLayout,
};

export type ResponsiveEngine = typeof responsiveEngine;
