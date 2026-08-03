// AMEXAN Presentation Registry - Layout Registry
// Constitutional Principle: Layouts are constitutional objects, not CSS.
// The Layout Engine selects from this registry. Never invent layouts.

import type { ViewportClass } from '../types';
import type { LayoutType } from '../constitution/layout.constitution';

export type LayoutKind =
  | 'single'
  | 'split'
  | 'triple'
  | 'grid'
  | 'cards'
  | 'timeline'
  | 'kanban'
  | 'workspace'
  | 'dashboard'
  | 'mobile_stack'
  | 'wizard'
  | 'modal'
  | 'drawer'
  | 'command_palette'
  | 'focus';

export interface LayoutZoneAllocation {
  zone: string;
  weight: number;
  order: number;
  hiddenWhen?: ViewportClass[];
}

export interface LayoutDefinition {
  id: LayoutKind;
  name: string;
  purpose: string;
  zones: LayoutZoneAllocation[];
  defaultColumns: Record<ViewportClass, 1 | 2 | 3 | 4>;
  maxContentWidth: number;
  responsive: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    ultra: string;
  };
  scroll: 'page' | 'panel' | 'workspace';
  variant?: LayoutType;
}

const DEFAULT_COLUMNS = (n: 1 | 2 | 3 | 4): LayoutDefinition['defaultColumns'] => ({
  xs: n === 4 ? 1 : 1,
  sm: 1,
  md: n >= 2 ? 2 : 1,
  lg: n >= 2 ? 2 : 1,
  xl: n >= 3 ? 3 : n,
  xxl: n,
  ultra: n >= 4 ? 4 : n,
});

export const LAYOUTS: Record<LayoutKind, LayoutDefinition> = {
  single: {
    id: 'single', name: 'Single', purpose: 'One focused task.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
    ],
    defaultColumns: DEFAULT_COLUMNS(1), maxContentWidth: 900,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'single', xl: 'single', xxl: 'single', ultra: 'single' },
    scroll: 'page',
  },
  split: {
    id: 'split', name: 'Split', purpose: 'Two panels: comparison or reference.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
      { zone: 'supporting_panel', weight: 1, order: 2 },
    ],
    defaultColumns: DEFAULT_COLUMNS(2), maxContentWidth: 1400,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'left_center', xl: 'left_center', xxl: 'left_center', ultra: 'left_center' },
    scroll: 'page',
  },
  triple: {
    id: 'triple', name: 'Triple', purpose: 'Three simultaneous panels.', zones: [
      { zone: 'workspace_navigation', weight: 1, order: 1 },
      { zone: 'primary_workspace', weight: 2, order: 2 },
      { zone: 'supporting_panel', weight: 1, order: 3 },
    ],
    defaultColumns: DEFAULT_COLUMNS(3), maxContentWidth: 1600,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'left_center', xl: 'triple', xxl: 'triple', ultra: 'triple' },
    scroll: 'workspace',
  },
  grid: {
    id: 'grid', name: 'Grid', purpose: 'Uniform tiles.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
    ],
    defaultColumns: DEFAULT_COLUMNS(4), maxContentWidth: 1800,
    responsive: { xs: 'stack', sm: 'stack', md: 'grid_2', lg: 'grid_2', xl: 'grid_3', xxl: 'grid_4', ultra: 'grid_4' },
    scroll: 'page',
  },
  cards: {
    id: 'cards', name: 'Cards', purpose: 'List of cards.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
    ],
    defaultColumns: DEFAULT_COLUMNS(3), maxContentWidth: 1600,
    responsive: { xs: 'stack', sm: 'stack', md: 'grid_2', lg: 'grid_2', xl: 'grid_3', xxl: 'grid_3', ultra: 'grid_4' },
    scroll: 'page',
  },
  timeline: {
    id: 'timeline', name: 'Timeline', purpose: 'Chronological events.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
      { zone: 'supporting_panel', weight: 1, order: 2, hiddenWhen: ['xs', 'sm', 'md'] },
    ],
    defaultColumns: DEFAULT_COLUMNS(2), maxContentWidth: 1400,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'left_center', xl: 'left_center', xxl: 'left_center', ultra: 'left_center' },
    scroll: 'page',
  },
  kanban: {
    id: 'kanban', name: 'Kanban', purpose: 'Columnar work states.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
    ],
    defaultColumns: DEFAULT_COLUMNS(4), maxContentWidth: 1800,
    responsive: { xs: 'stack', sm: 'stack', md: 'horizontal_scroll', lg: 'horizontal_scroll', xl: 'kanban', xxl: 'kanban', ultra: 'kanban' },
    scroll: 'panel',
  },
  workspace: {
    id: 'workspace', name: 'Workspace', purpose: 'Contextual work environment.', zones: [
      { zone: 'global_header', weight: 1, order: 0 },
      { zone: 'workspace_navigation', weight: 1, order: 1 },
      { zone: 'primary_workspace', weight: 3, order: 2 },
      { zone: 'supporting_panel', weight: 1, order: 3, hiddenWhen: ['xs', 'sm', 'md'] },
    ],
    defaultColumns: DEFAULT_COLUMNS(3), maxContentWidth: 1600,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'left_center', xl: 'workspace', xxl: 'workspace', ultra: 'workspace' },
    scroll: 'workspace',
    variant: 'WorkspaceLayout',
  },
  dashboard: {
    id: 'dashboard', name: 'Dashboard', purpose: 'Generated KPI overview.', zones: [
      { zone: 'global_header', weight: 1, order: 0 },
      { zone: 'workspace_navigation', weight: 1, order: 1, hiddenWhen: ['xs', 'sm'] },
      { zone: 'primary_workspace', weight: 2, order: 2 },
    ],
    defaultColumns: DEFAULT_COLUMNS(4), maxContentWidth: 1800,
    responsive: { xs: 'stack', sm: 'stack', md: 'grid_2', lg: 'grid_2', xl: 'grid_3', xxl: 'grid_4', ultra: 'grid_4' },
    scroll: 'page',
    variant: 'DashboardLayout',
  },
  mobile_stack: {
    id: 'mobile_stack', name: 'Mobile Stack', purpose: 'Single-column phone experience.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
    ],
    defaultColumns: DEFAULT_COLUMNS(1), maxContentWidth: 640,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'single', xl: 'single', xxl: 'single', ultra: 'single' },
    scroll: 'page',
  },
  wizard: {
    id: 'wizard', name: 'Wizard', purpose: 'Step-by-step completion.', zones: [
      { zone: 'global_header', weight: 1, order: 0 },
      { zone: 'primary_workspace', weight: 1, order: 1 },
    ],
    defaultColumns: DEFAULT_COLUMNS(1), maxContentWidth: 900,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'single', xl: 'single', xxl: 'single', ultra: 'single' },
    scroll: 'page',
    variant: 'WizardLayout',
  },
  modal: {
    id: 'modal', name: 'Modal', purpose: 'Focused overlay.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
    ],
    defaultColumns: DEFAULT_COLUMNS(1), maxContentWidth: 560,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'centered', xl: 'centered', xxl: 'centered', ultra: 'centered' },
    scroll: 'page',
  },
  drawer: {
    id: 'drawer', name: 'Drawer', purpose: 'Side overlay.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
    ],
    defaultColumns: DEFAULT_COLUMNS(1), maxContentWidth: 400,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'sidebar', xl: 'sidebar', xxl: 'sidebar', ultra: 'sidebar' },
    scroll: 'panel',
  },
  command_palette: {
    id: 'command_palette', name: 'Command Palette', purpose: 'Keyboard-first universal actions.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
    ],
    defaultColumns: DEFAULT_COLUMNS(1), maxContentWidth: 640,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'centered', xl: 'centered', xxl: 'centered', ultra: 'centered' },
    scroll: 'page',
  },
  focus: {
    id: 'focus', name: 'Focus', purpose: 'Hide everything irrelevant to the mission.', zones: [
      { zone: 'primary_workspace', weight: 1, order: 1 },
    ],
    defaultColumns: DEFAULT_COLUMNS(1), maxContentWidth: 700,
    responsive: { xs: 'stack', sm: 'stack', md: 'stack', lg: 'single', xl: 'single', xxl: 'single', ultra: 'single' },
    scroll: 'page',
  },
};

export function getLayout(id: LayoutKind): LayoutDefinition {
  return LAYOUTS[id];
}

export function listLayouts(): LayoutDefinition[] {
  return Object.values(LAYOUTS);
}

export function getLayoutForWorkspace(workspaceId: string): LayoutKind {
  const map: Record<string, LayoutKind> = {
    ward_round: 'workspace',
    clinic: 'split',
    icu: 'workspace',
    theatre: 'workspace',
    emergency: 'focus',
    consultation: 'split',
    admission: 'wizard',
    discharge: 'wizard',
    teleconsultation: 'split',
    administration: 'dashboard',
    executive: 'dashboard',
    patient_portal: 'cards',
    learning: 'cards',
    research: 'dashboard',
    pharmacy: 'cards',
    laboratory: 'timeline',
    radiology: 'timeline',
  };
  return map[workspaceId] ?? 'workspace';
}

export const layoutRegistry = {
  get: getLayout,
  list: listLayouts,
  forWorkspace: getLayoutForWorkspace,
};

export type LayoutRegistry = typeof layoutRegistry;
