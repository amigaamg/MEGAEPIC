// AMEXAN Presentation Constitution - Responsiveness
// Version 1.0 (Frozen)
// Constitutional Principle: Nothing knows screen size. Only the Viewport Engine knows. Components ask, never assume.

import { VIEWPORT_CLASSES, VIEWPORT_ORDER, VIEWPORT_RULES } from '../device-constitution';
import type { ViewportClass } from '../types';

export const responsivenessConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'Nothing knows screen size. Only the Viewport Engine knows.',
};

export const viewportClasses = VIEWPORT_ORDER;

export const viewportBounds: Record<ViewportClass, { min: number; max: number }> = VIEWPORT_CLASSES;

export const viewportLabels: Record<ViewportClass, string> = {
  xs: 'XS 280–359',
  sm: 'SM 360–479',
  md: 'MD 480–767',
  lg: 'LG 768–1023',
  xl: 'XL 1024–1439',
  xxl: 'XXL 1440–2559',
  ultra: 'ULTRA 2560+',
};

export const componentResponsiveContract = {
  minimumUsableWidth: true,
  preferredWidth: true,
  collapseBehavior: true,
  stackingBehavior: true,
  scrollingBehavior: true,
  touchBehavior: true,
} as const;

export interface ResponsiveContract {
  minWidth: number
  preferredWidth: number
  collapseAt: ViewportClass
  stackAt: ViewportClass
  scrollAt: ViewportClass
  touchAt: ViewportClass
}

// The engine decides layout. Components declare their contract.
export function resolveResponsiveContract(contract: Partial<ResponsiveContract> & { minWidth: number; preferredWidth: number }): ResponsiveContract {
  return {
    minWidth: contract.minWidth,
    preferredWidth: contract.preferredWidth,
    collapseAt: contract.collapseAt || 'sm',
    stackAt: contract.stackAt || 'md',
    scrollAt: contract.scrollAt || 'lg',
    touchAt: contract.touchAt || 'md',
  };
}

export function getViewportBehavior(vc: ViewportClass) {
  return VIEWPORT_RULES[vc];
}
