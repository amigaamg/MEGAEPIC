// AMEXAN Presentation Constitution - Layout
// Version 1.0 (Frozen)
// Constitutional Principle: There are NO pages. There are only Workspaces. Every workspace has the same skeleton.

import { getSidebarConfig } from '../layout-constitution';
import type { DeviceInfo } from '../types';

export const layoutConstitution = {
  version: '1.0' as const,
  frozen: true as const,
  principle: 'There are NO pages. There are only Workspaces.',
};

export const workspaceZones = [
  'global_header',
  'workspace_navigation',
  'primary_workspace',
  'supporting_panel',
  'background_services',
] as const;

export type WorkspaceZone = (typeof workspaceZones)[number];

export const workspaceZoneDescriptions: Record<WorkspaceZone, string> = {
  global_header: 'Logo, organization, search, notifications, profile, command palette. Never changes.',
  workspace_navigation: 'Role-specific: doctor patients/orders/results; patient appointments/health/medications.',
  primary_workspace: 'The main work. One focus. No distractions.',
  supporting_panel: 'Always contextual: patient summary, vitals, alerts, timeline, AI, protocol.',
  background_services: 'Invisible: sync, notifications, offline queue, autosave, telemetry, documentation.',
};

export const layoutTypes = [
  'HeroLayout',
  'DashboardLayout',
  'WorkspaceLayout',
  'PortalLayout',
  'DocumentationLayout',
  'AdminLayout',
  'LandingLayout',
  'PatientLayout',
  'MobileLayout',
  'WizardLayout',
] as const;

export type LayoutType = (typeof layoutTypes)[number];

export const layoutZones: Record<LayoutType, WorkspaceZone[]> = {
  LandingLayout: ['global_header', 'primary_workspace', 'background_services'],
  HeroLayout: ['global_header', 'primary_workspace'],
  DashboardLayout: ['global_header', 'workspace_navigation', 'primary_workspace', 'background_services'],
  WorkspaceLayout: ['global_header', 'workspace_navigation', 'primary_workspace', 'supporting_panel', 'background_services'],
  PortalLayout: ['global_header', 'workspace_navigation', 'primary_workspace', 'background_services'],
  DocumentationLayout: ['global_header', 'workspace_navigation', 'primary_workspace', 'background_services'],
  AdminLayout: ['global_header', 'workspace_navigation', 'primary_workspace', 'supporting_panel', 'background_services'],
  PatientLayout: ['global_header', 'workspace_navigation', 'primary_workspace', 'supporting_panel', 'background_services'],
  MobileLayout: ['global_header', 'primary_workspace', 'background_services'],
  WizardLayout: ['global_header', 'primary_workspace'],
};

export const workspaceSkeleton = {
  headerHeight: 56,
  sidebarWidthDesktop: 240,
  sidebarWidthWide: 280,
  supportingPanelWidth: 320,
  mobileTopBarHeight: 48,
  mobileBottomTabHeight: 56,
} as const;

export function getWorkspaceLayout(device: DeviceInfo) {
  const sidebar = getSidebarConfig(device);
  return {
    zones: workspaceZones,
    sidebar,
    headerHeight: workspaceSkeleton.headerHeight,
    supportingPanelWidth: device.viewportClass === 'xl' || device.viewportClass === 'xxl' || device.viewportClass === 'ultra'
      ? workspaceSkeleton.supportingPanelWidth
      : 0,
  };
}
