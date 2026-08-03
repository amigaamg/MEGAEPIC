// AMEXAN Presentation Constitution - Relationships
// Version 1.0 (Frozen)
// Constitutional Principle: Everything relates through explicit relationships. Never hidden.

export type PresentationRelationshipType =
  | 'renders'
  | 'contains'
  | 'composes'
  | 'depends_on'
  | 'extends'
  | 'overrides'
  | 'decorates'
  | 'supplies_data_to'
  | 'consumes_from'
  | 'links_to'
  | 'navigates_to'
  | 'activates'
  | 'observes'
  | 'synchronizes_with';

export interface PresentationRelationship {
  from: string;
  to: string;
  type: PresentationRelationshipType;
  description?: string;
  optional?: boolean;
}

export const presentationRelationshipsConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'Everything relates through explicit relationships. Never hidden.',
  relationshipTypes: [
    'renders',
    'contains',
    'composes',
    'depends_on',
    'extends',
    'overrides',
    'decorates',
    'supplies_data_to',
    'consumes_from',
    'links_to',
    'navigates_to',
    'activates',
    'observes',
    'synchronizes_with',
  ] as PresentationRelationshipType[],
};

// The canonical layering relationships that must never be reversed.
export const canonicalLayering: PresentationRelationship[] = [
  { from: 'clinical_engine', to: 'presentation_engine', type: 'supplies_data_to', description: 'Clinical engines feed presentation. Never the reverse.' },
  { from: 'presentation_engine', to: 'widget_registry', type: 'consumes_from', description: 'Presentation asks the registry for widgets.' },
  { from: 'widget_registry', to: 'widget_renderer', type: 'renders', description: 'Registry resolves, renderer draws.' },
  { from: 'workspace_engine', to: 'presentation_engine', type: 'composes', description: 'Workspaces assemble presentation objects.' },
  { from: 'navigation_engine', to: 'presentation_engine', type: 'supplies_data_to', description: 'Navigation is generated, never hardcoded.' },
  { from: 'dashboard_engine', to: 'layout_engine', type: 'depends_on', description: 'Dashboards require layout rules.' },
  { from: 'theme_engine', to: 'presentation_engine', type: 'extends', description: 'Themes extend default presentation.' },
];

export const forbiddenRelationships: PresentationRelationshipType[] = [
  'depends_on', // guarded in UI direction
];

export function assertNoReverseDependency(relationships: PresentationRelationship[]): boolean {
  const uiSources = new Set(['react_component', 'page', 'widget_renderer', 'layout_renderer']);
  return relationships.every((r) => {
    if (uiSources.has(r.from)) return r.to !== 'clinical_engine';
    return true;
  });
}
