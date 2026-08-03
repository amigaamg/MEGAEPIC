// AMEXAN Presentation Engine - Page Engine
// Constitutional Principle: Every page is generated. Never handcrafted.
// A page is a composition of sections, each rendered by the Page Builder from constitutional rules.

import type { LayoutType } from './constitution/layout.constitution';
import { getWorkspaceLayout, layoutZones } from './constitution/layout.constitution';
import type { NavigationType } from './constitution/navigation.constitution';
import { navigationPriorities, getRoleNavigation } from './constitution/navigation.constitution';
import { getViewportRules } from './device-constitution';
import type { ViewportSnapshot } from './viewport-engine';

export interface PageSectionSpec {
  id: string
  component: string
  title?: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  order: number
  zone: string
  hiddenWhen?: string[]
}

export interface PageNavigationSpec {
  type: NavigationType
  items: string[]
  visible: boolean
}

export interface PageBlueprint {
  id: string
  title: string
  layout: LayoutType
  zones: string[]
  navigation: PageNavigationSpec[]
  sections: PageSectionSpec[]
  columns: number
  maxActions: number
}

export interface PageRequest {
  id: string
  title: string
  layout: LayoutType
  role: string
  sections: PageSectionSpec[]
  navigation?: NavigationType[]
}

// Constitutional Principle 3: Every page is generated from a request + role + viewport.
export function generatePage(request: PageRequest, viewport: ViewportSnapshot): PageBlueprint {
  const layout = request.layout;
  const zones = layoutZones[layout];
  const workspace = getWorkspaceLayout(viewport.device);
  const rules = getViewportRules(viewport.viewportClass);

  const sortedSections = [...request.sections].sort((a, b) => a.order - b.order);
  const effectiveSections = sortedSections.filter(section => {
    if (!section.hiddenWhen) return true;
    return !section.hiddenWhen.includes(viewport.viewportClass);
  });

  const navigationTypes: PageNavigationSpec[] = (request.navigation || ['global_navigation', 'workspace_navigation']).map(type => ({
    type,
    items: type === 'workspace_navigation' ? getRoleNavigation(request.role) : [],
    visible: !(type === 'workspace_navigation' && viewport.isMobile && workspace.sidebar.mode !== 'drawer'),
  }));

  return {
    id: request.id,
    title: request.title,
    layout,
    zones,
    navigation: navigationTypes.sort((a, b) => navigationPriorities[a.type] - navigationPriorities[b.type]),
    sections: effectiveSections,
    columns: rules.columns,
    maxActions: rules.maxFabs,
  };
}

export function composePage(
  id: string,
  title: string,
  layout: LayoutType,
  role: string,
  sectionComponents: Record<string, { order: number; priority: 'critical' | 'high' | 'medium' | 'low'; zone?: string; hiddenWhen?: string[] }>,
  viewport: ViewportSnapshot,
): PageBlueprint {
  const sections: PageSectionSpec[] = Object.entries(sectionComponents).map(([component, spec]) => ({
    id: `${id}-${component}`,
    component,
    order: spec.order,
    priority: spec.priority,
    zone: spec.zone || 'primary_workspace',
    hiddenWhen: spec.hiddenWhen,
  }));

  return generatePage({ id, title, layout, role, sections }, viewport);
}

export const pageEngine = {
  generate: generatePage,
  compose: composePage,
};
