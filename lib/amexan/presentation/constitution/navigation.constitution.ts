// AMEXAN Presentation Constitution - Navigation
// Version 1.0 (Frozen)
// Constitutional Principle: Navigation never reloads. Workspaces morph. Everything has context. Nothing floats.

export const navigationConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'Navigation never reloads. Workspaces morph.',
};

export const navigationTypes = [
  'global_navigation',
  'workspace_navigation',
  'context_navigation',
  'breadcrumb',
  'quick_actions',
  'command_palette',
  'recent_items',
  'favorites',
] as const;

export type NavigationType = (typeof navigationTypes)[number];

export const navigationPriorities: Record<NavigationType, number> = {
  global_navigation: 0,
  workspace_navigation: 1,
  context_navigation: 2,
  breadcrumb: 3,
  quick_actions: 4,
  command_palette: 5,
  recent_items: 6,
  favorites: 7,
};

export const globalHeaderItems = [
  'logo',
  'organization',
  'search',
  'notifications',
  'messages',
  'profile',
  'command_palette',
  'quick_switch',
  'language',
  'theme',
] as const;

export const roleNavigation: Record<string, string[]> = {
  doctor: ['patients', 'encounters', 'orders', 'results', 'rounds', 'analytics'],
  nurse: ['patients', 'tasks', 'observations', 'medications', 'handover', 'analytics'],
  patient: ['appointments', 'health', 'medications', 'education', 'messages', 'payments'],
  administrator: ['departments', 'users', 'roles', 'reports', 'inventory', 'billing'],
  researcher: ['cohorts', 'queries', 'statistics', 'studies', 'exports'],
  pharmacist: ['dispensing', 'inventory', 'interactions', 'analytics'],
  lab_technician: ['queue', 'results', 'quality', 'instruments'],
  radiologist: ['studies', 'reports', 'queue', 'comparison'],
};

export function getRoleNavigation(role: string): string[] {
  return roleNavigation[role] || roleNavigation.patient;
}

export const navigationPatterns = {
  morph: true,
  keepState: true,
  commands: true,
  quickActions: true,
  contextual: true,
  noReload: true,
} as const;

// Universal command palette shortcuts.
export const defaultCommands = {
  patientSearch: 'CTRL + P',
  orders: 'CTRL + O',
  documentation: 'CTRL + D',
  newEncounter: 'CTRL + SHIFT + N',
} as const;
