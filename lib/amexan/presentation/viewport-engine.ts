// AMEXAN Presentation Engine - Viewport Engine
// Constitutional Principle: Nothing knows screen size. Only the Viewport Engine knows.
// Components ask viewport.current(), never media queries.

import { detectViewportClass, detectHeightClass, detectOrientation, getDeviceInfo, getViewportRules } from './device-constitution';
import { getCurrentBreakpoint, breakpointOrder, isBreakpointAtLeast } from './tokens';
import type { ViewportClass, DeviceInfo, HeightClass, Orientation } from './types';

export interface ViewportSnapshot {
  device: DeviceInfo
  viewportClass: ViewportClass
  heightClass: HeightClass
  orientation: Orientation
  breakpoint: ReturnType<typeof getCurrentBreakpoint>
  width: number
  height: number
  columns: 1 | 2 | 3 | 4
  sidebarMode: string
  navigation: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

let cached: ViewportSnapshot | null = null;

function buildSnapshot(device: DeviceInfo): ViewportSnapshot {
  const vc = device.viewportClass;
  const rules = getViewportRules(vc);
  const breakpoint = getCurrentBreakpoint(device.width);
  const isMobile = vc === 'xs' || vc === 'sm' || vc === 'md';
  const isTablet = vc === 'lg';
  return {
    device,
    viewportClass: vc,
    heightClass: device.heightClass,
    orientation: device.orientation,
    breakpoint,
    width: device.width,
    height: device.height,
    columns: rules.columns,
    sidebarMode: rules.sidebar,
    navigation: rules.navigation,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
  };
}

// Components ask current(). The engine decides. Never direct window access in components.
export function getCurrentViewport(): ViewportSnapshot {
  const device = getDeviceInfo();
  cached = buildSnapshot(device);
  return cached;
}

export function refreshViewport(): ViewportSnapshot {
  const device = getDeviceInfo();
  cached = buildSnapshot(device);
  return cached;
}

export function getCachedViewport(): ViewportSnapshot | null {
  return cached;
}

export function getViewport(width: number, height: number): ViewportSnapshot {
  return buildSnapshot({
    ...getDeviceInfo(),
    width,
    height,
    viewportClass: detectViewportClass(width),
    heightClass: detectHeightClass(height),
    orientation: detectOrientation(width, height),
  });
}

export function isViewportAtLeast(vc: ViewportClass, target: ViewportClass): boolean {
  return isBreakpointAtLeast(getCurrentBreakpoint(vcToWidth(vc)), getCurrentBreakpoint(vcToWidth(target)));
}

function vcToWidth(vc: ViewportClass): number {
  switch (vc) {
    case 'xs': return 300;
    case 'sm': return 400;
    case 'md': return 600;
    case 'lg': return 900;
    case 'xl': return 1200;
    case 'xxl': return 1600;
    case 'ultra': return 3000;
  }
}

export const viewportEngine = {
  current: getCurrentViewport,
  refresh: refreshViewport,
  cached: getCachedViewport,
  fromSize: getViewport,
  atLeast: isViewportAtLeast,
  breakpointOrder,
};

export type ViewportEngine = typeof viewportEngine;
