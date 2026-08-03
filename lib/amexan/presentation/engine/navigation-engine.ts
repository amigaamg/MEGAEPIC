// AMEXAN Presentation Engine - Navigation Engine
// Constitutional Principle: Navigation is generated, never hardcoded.
// Identity -> Membership -> Role -> Permissions -> Subscriptions -> Organization -> Context -> Menu tree.

import { getRoleNavigation } from '../constitution/navigation.constitution';
import type { NavigationType } from '../constitution/navigation.constitution';
import type { DeviceInfo } from '../types';

export interface NavigationItem {
  id: string;
  title: string;
  route: string;
  icon?: string;
  order: number;
  children?: NavigationItem[];
  permission?: string;
  hiddenWhen?: string[];
}

export interface NavigationTree {
  type: NavigationType;
  items: NavigationItem[];
  breadcrumbs: { label: string; route?: string }[];
  quickActions: NavigationItem[];
  searchEnabled: boolean;
  commandEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface NavigationRequest {
  role: string;
  organizationId?: string;
  viewportClass: DeviceInfo['viewportClass'];
  permissions?: string[];
  context?: string;
}

const ROLE_NAV: Record<string, { items: { id: string; title: string; route: string; icon?: string }[] }> = {
  doctor: {
    items: [
      { id: 'patients', title: 'Patients', route: '/patients', icon: 'users' },
      { id: 'ward', title: 'Ward', route: '/ward', icon: 'bed' },
      { id: 'orders', title: 'Orders', route: '/orders', icon: 'clipboard' },
      { id: 'results', title: 'Results', route: '/results', icon: 'flask' },
      { id: 'education', title: 'Education', route: '/education', icon: 'book' },
      { id: 'research', title: 'Research', route: '/research', icon: 'flask-conical' },
    ],
  },
  nurse: {
    items: [
      { id: 'patients', title: 'Assigned Patients', route: '/patients', icon: 'users' },
      { id: 'medications', title: 'Medication Round', route: '/medications', icon: 'pill' },
      { id: 'vitals', title: 'Vitals', route: '/vitals', icon: 'activity' },
      { id: 'handover', title: 'Handover', route: '/handover', icon: 'refresh' },
    ],
  },
  patient: {
    items: [
      { id: 'appointments', title: 'Appointments', route: '/appointments', icon: 'calendar' },
      { id: 'medicines', title: 'Medicines', route: '/medicines', icon: 'pill' },
      { id: 'telemedicine', title: 'Telemedicine', route: '/telemedicine', icon: 'video' },
      { id: 'insurance', title: 'Insurance', route: '/insurance', icon: 'shield' },
      { id: 'payments', title: 'Payments', route: '/payments', icon: 'credit-card' },
      { id: 'education', title: 'Health Education', route: '/education', icon: 'book' },
      { id: 'family', title: 'Family', route: '/family', icon: 'users' },
      { id: 'timeline', title: 'Health Timeline', route: '/timeline', icon: 'history' },
    ],
  },
  student: {
    items: [
      { id: 'patients', title: 'Assigned Patients', route: '/patients', icon: 'users' },
      { id: 'objectives', title: 'Learning Objectives', route: '/objectives', icon: 'target' },
      { id: 'cases', title: 'Cases', route: '/cases', icon: 'folder' },
      { id: 'feedback', title: 'Feedback', route: '/feedback', icon: 'message' },
      { id: 'portfolio', title: 'Portfolio', route: '/portfolio', icon: 'briefcase' },
    ],
  },
  researcher: {
    items: [
      { id: 'studies', title: 'Studies', route: '/studies', icon: 'folder' },
      { id: 'cohorts', title: 'Cohorts', route: '/cohorts', icon: 'users' },
      { id: 'analytics', title: 'Analytics', route: '/analytics', icon: 'chart' },
      { id: 'education', title: 'Education', route: '/education', icon: 'book' },
    ],
  },
  administrator: {
    items: [
      { id: 'overview', title: 'Overview', route: '/overview', icon: 'layout' },
      { id: 'occupancy', title: 'Occupancy', route: '/occupancy', icon: 'bed' },
      { id: 'finance', title: 'Finance', route: '/finance', icon: 'dollar' },
      { id: 'reports', title: 'Reports', route: '/reports', icon: 'file' },
    ],
  },
};

export function generateNavigation(request: NavigationRequest): NavigationTree {
  const constitutionalNav = getRoleNavigation(request.role);
  const configured = ROLE_NAV[request.role];

  const items: NavigationItem[] = (configured?.items ?? []).map((item, i) => {
    const mobile = request.viewportClass === 'xs' || request.viewportClass === 'sm';
    const visible = !mobile || i < 4;
    return {
      id: item.id,
      title: item.title,
      route: item.route,
      icon: item.icon,
      order: i,
      hiddenWhen: visible ? undefined : ['xs', 'sm'],
    };
  });

  const type: NavigationType =
    configured && constitutionalNav.length > 0 ? 'workspace_navigation' : 'global_navigation';

  return {
    type,
    items,
    breadcrumbs: [{ label: 'Home', route: '/' }],
    quickActions: items.slice(0, 3),
    searchEnabled: request.permissions === undefined || request.permissions.some((p) => p.startsWith('search') || p === 'read:*'),
    commandEnabled: true,
    notificationsEnabled: true,
  };
}

export function filterNavigationByPermission(tree: NavigationTree, permissions: string[]): NavigationTree {
  return {
    ...tree,
    items: tree.items.filter((item) => !item.permission || permissions.includes(item.permission)),
  };
}

export const navigationEngine = {
  generate: generateNavigation,
  filter: filterNavigationByPermission,
};

export type NavigationEngine = typeof navigationEngine;
