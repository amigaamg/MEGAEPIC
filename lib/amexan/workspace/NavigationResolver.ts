// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Engine — Navigation Resolver
// Resolves navigation tree based on resolved workspace context
// Constitutional Principle: Navigation derives from workspace, not hardcoded
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  ResolvedWorkspace,
  NavigationTree,
  NavigationNode,
  ResolverResult,
} from './types';
import type { AmxUid, ProfessionalCategory, Permission, AssignmentType } from '@/lib/amexan/constitution/types';
import { can } from '@/lib/amexan';

export class NavigationResolver {
  // Base navigation by professional category
  private static readonly KNOWN_RESOURCES = new Set([
    'patient', 'encounter', 'prescription', 'lab_order', 'imaging_order',
    'clinical_note', 'discharge_summary', 'discharge', 'referral', 'consent',
    'vitals', 'observations', 'assessment', 'care_plan', 'staff', 'department',
    'organization', 'finance', 'admin', 'system_config', 'audit_log', 'reports',
    'inventory', 'pharmacy', 'theatre', 'blood_bank', 'research_data',
    'ai_insights', 'telemedicine', 'schedule', 'hr', 'training', 'quality',
    'view_analytics', 'manage_staff', 'manage_org', 'manage_roles', 'view_finance',
  ]);

  // Base navigation by professional category
  private static readonly CATEGORY_NAVIGATION: Partial<Record<ProfessionalCategory, NavigationNode[]>> = {
    medical_doctor: [
      { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', order: 1, permission: 'dashboard:read', visibility: 'always' },
      { id: 'patients', label: 'My Patients', route: '/patients', icon: 'Users', order: 2, permission: 'patient:read', visibility: 'on_duty' },
      { id: 'encounters', label: 'Encounters', route: '/encounters', icon: 'FileText', order: 3, permission: 'encounter:read', visibility: 'on_duty' },
      { id: 'prescriptions', label: 'Prescriptions', route: '/prescriptions', icon: 'Pill', order: 4, permission: 'prescription:read', visibility: 'on_duty' },
      { id: 'orders', label: 'Orders', route: '/orders', icon: 'ClipboardList', order: 5, permission: 'lab_order:read', visibility: 'on_duty', children: [
        { id: 'lab-orders', label: 'Lab Orders', route: '/orders/lab', icon: 'FlaskConical', order: 1, permission: 'lab_order:read', visibility: 'on_duty' },
        { id: 'imaging-orders', label: 'Imaging Orders', route: '/orders/imaging', icon: 'Scan', order: 2, permission: 'imaging_order:read', visibility: 'on_duty' },
      ]},
      { id: 'schedule', label: 'Schedule', route: '/schedule', icon: 'Calendar', order: 6, permission: 'schedule:read', visibility: 'on_duty' },
      { id: 'ward-rounds', label: 'Ward Rounds', route: '/ward-rounds', icon: 'Stethoscope', order: 7, permission: 'encounter:read', visibility: 'on_duty' },
      { id: 'clinics', label: 'Clinics', route: '/clinics', icon: 'Building2', order: 8, permission: 'encounter:read', visibility: 'on_duty' },
    ],
    nurse: [
      { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', order: 1, permission: 'dashboard:read', visibility: 'always' },
      { id: 'patients', label: 'My Patients', route: '/patients', icon: 'Users', order: 2, permission: 'patient:read', visibility: 'on_duty' },
      { id: 'vitals', label: 'Vitals', route: '/vitals', icon: 'Activity', order: 3, permission: 'vitals:create', visibility: 'on_duty' },
      { id: 'medications', label: 'Medications', route: '/medications', icon: 'Pill', order: 4, permission: 'prescription:administer', visibility: 'on_duty' },
      { id: 'handover', label: 'Handover', route: '/handover', icon: 'ArrowRight', order: 5, permission: 'clinical_note:create', visibility: 'on_duty' },
      { id: 'care-plans', label: 'Care Plans', route: '/care-plans', icon: 'ClipboardList', order: 6, permission: 'care_plan:read', visibility: 'on_duty' },
      { id: 'schedule', label: 'Schedule', route: '/schedule', icon: 'Calendar', order: 7, permission: 'schedule:read', visibility: 'on_duty' },
    ],
    pharmacist: [
      { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', order: 1, permission: 'dashboard:read', visibility: 'always' },
      { id: 'verification', label: 'Verification Queue', route: '/pharmacy/verify', icon: 'CheckCircle', order: 2, permission: 'prescription:verify', visibility: 'on_duty' },
      { id: 'dispensing', label: 'Dispensing', route: '/pharmacy/dispense', icon: 'Package', order: 3, permission: 'prescription:dispense', visibility: 'on_duty' },
      { id: 'inventory', label: 'Inventory', route: '/pharmacy/inventory', icon: 'Boxes', order: 4, permission: 'inventory:read', visibility: 'always' },
      { id: 'compounding', label: 'Compounding', route: '/pharmacy/compounding', icon: 'FlaskConical', order: 5, permission: 'prescription:create', visibility: 'on_duty' },
      { id: 'reports', label: 'Reports', route: '/pharmacy/reports', icon: 'BarChart3', order: 6, permission: 'view_reports:read', visibility: 'always' },
    ],
    lab_technologist: [
      { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', order: 1, permission: 'dashboard:read', visibility: 'always' },
      { id: 'specimens', label: 'Specimens', route: '/lab/specimens', icon: 'FlaskConical', order: 2, permission: 'lab_order:read', visibility: 'on_duty' },
      { id: 'results', label: 'Results', route: '/lab/results', icon: 'FileText', order: 3, permission: 'lab_order:update', visibility: 'on_duty' },
      { id: 'qc', label: 'Quality Control', route: '/lab/qc', icon: 'CheckSquare', order: 4, permission: 'lab_order:read', visibility: 'always' },
      { id: 'inventory', label: 'Inventory', route: '/lab/inventory', icon: 'Boxes', order: 5, permission: 'inventory:read', visibility: 'always' },
    ],
    radiographer: [
      { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', order: 1, permission: 'dashboard:read', visibility: 'always' },
      { id: 'worklist', label: 'Worklist', route: '/radiology/worklist', icon: 'ClipboardList', order: 2, permission: 'imaging_order:read', visibility: 'on_duty' },
      { id: 'pacs', label: 'PACS', route: '/radiology/pacs', icon: 'Image', order: 3, permission: 'imaging_order:read', visibility: 'on_duty' },
      { id: 'reporting', label: 'Reporting', route: '/radiology/report', icon: 'FileText', order: 4, permission: 'imaging_order:create', visibility: 'on_duty' },
      { id: 'qc', label: 'QC/QA', route: '/radiology/qc', icon: 'CheckSquare', order: 5, permission: 'imaging_order:read', visibility: 'always' },
    ],
    facility_admin: [
      { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', order: 1, permission: 'dashboard:read', visibility: 'always' },
      { id: 'staff', label: 'Staff Management', route: '/admin/staff', icon: 'Users', order: 2, permission: 'manage_staff:read', visibility: 'always' },
      { id: 'departments', label: 'Departments', route: '/admin/departments', icon: 'Building2', order: 3, permission: 'manage_org:read', visibility: 'always' },
      { id: 'beds', label: 'Bed Management', route: '/admin/beds', icon: 'Bed', order: 4, permission: 'manage_org:read', visibility: 'always' },
      { id: 'scheduling', label: 'Scheduling', route: '/admin/schedule', icon: 'Calendar', order: 5, permission: 'schedule:read', visibility: 'always' },
      { id: 'finance', label: 'Finance', route: '/admin/finance', icon: 'CreditCard', order: 6, permission: 'view_finance:read', visibility: 'always' },
      { id: 'reports', label: 'Reports', route: '/admin/reports', icon: 'BarChart3', order: 7, permission: 'view_reports:read', visibility: 'always' },
      { id: 'settings', label: 'Settings', route: '/admin/settings', icon: 'Settings', order: 8, permission: 'manage_org:update', visibility: 'always' },
    ],
    receptionist: [
      { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', order: 1, permission: 'dashboard:read', visibility: 'always' },
      { id: 'registration', label: 'Patient Registration', route: '/patient/register', icon: 'UserPlus', order: 2, permission: 'patient:create', visibility: 'always' },
      { id: 'appointments', label: 'Appointments', route: '/appointments', icon: 'Calendar', order: 3, permission: 'schedule:read', visibility: 'always' },
      { id: 'billing', label: 'Billing', route: '/billing', icon: 'CreditCard', order: 4, permission: 'view_finance:read', visibility: 'always' },
      { id: 'checkin', label: 'Check-in', route: '/checkin', icon: 'CheckCircle', order: 5, permission: 'encounter:create', visibility: 'on_duty' },
      { id: 'insurance', label: 'Insurance', route: '/insurance', icon: 'ShieldCheck', order: 6, permission: 'view_finance:read', visibility: 'always' },
    ],
    super_admin: [
      { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', order: 1, permission: 'dashboard:read', visibility: 'always' },
      { id: 'organizations', label: 'Organizations', route: '/super-admin/orgs', icon: 'Building2', order: 2, permission: 'manage_org:read', visibility: 'always' },
      { id: 'users', label: 'User Management', route: '/super-admin/users', icon: 'Users', order: 3, permission: 'manage_staff:read', visibility: 'always' },
      { id: 'roles', label: 'Roles & Permissions', route: '/super-admin/roles', icon: 'ShieldCheck', order: 4, permission: 'manage_roles:read', visibility: 'always' },
      { id: 'audit', label: 'Audit Logs', route: '/super-admin/audit', icon: 'FileText', order: 5, permission: 'audit_log:read', visibility: 'always' },
      { id: 'system', label: 'System Config', route: '/super-admin/system', icon: 'Settings', order: 6, permission: 'manage_system:read', visibility: 'always' },
    ],
    other: [
      { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'LayoutDashboard', order: 1, permission: 'dashboard:read', visibility: 'always' },
      { id: 'profile', label: 'Profile', route: '/profile', icon: 'User', order: 2, permission: 'patient:read', visibility: 'always' },
    ],
  };

  // Assignment-specific navigation additions
  private static readonly ASSIGNMENT_NAVIGATION: Record<AssignmentType, NavigationNode[]> = {
    ward_round: [
      { id: 'round-progress', label: 'Round Progress', route: '/ward-round/progress', icon: 'TrendingUp', order: 100, permission: 'encounter:read', visibility: 'on_duty' },
      { id: 'patient-queue', label: 'Patient Queue', route: '/ward-round/queue', icon: 'List', order: 101, permission: 'patient:read', visibility: 'on_duty' },
    ],
    clinic: [
      { id: 'clinic-queue', label: 'Clinic Queue', route: '/clinic/queue', icon: 'List', order: 100, permission: 'patient:read', visibility: 'on_duty' },
      { id: 'waiting-room', label: 'Waiting Room', route: '/clinic/waiting', icon: 'Users', order: 101, permission: 'patient:read', visibility: 'on_duty' },
    ],
    theatre: [
      { id: 'theatre-list', label: 'Theatre List', route: '/theatre/list', icon: 'ClipboardList', order: 100, permission: 'encounter:read', visibility: 'on_duty' },
      { id: 'pre-op', label: 'Pre-op Checklist', route: '/theatre/preop', icon: 'CheckSquare', order: 101, permission: 'encounter:read', visibility: 'on_duty' },
    ],
    emergency_call: [
      { id: 'triage', label: 'Triage', route: '/emergency/triage', icon: 'AlertTriangle', order: 100, permission: 'patient:create', visibility: 'on_duty' },
      { id: 'resus', label: 'Resus Bay', route: '/emergency/resus', icon: 'Activity', order: 101, permission: 'patient:read', visibility: 'on_duty' },
    ],
    icu_duty: [
      { id: 'icu-beds', label: 'ICU Beds', route: '/icu/beds', icon: 'Bed', order: 100, permission: 'patient:read', visibility: 'on_duty' },
      { id: 'ventilators', label: 'Ventilators', route: '/icu/ventilators', icon: 'Cpu', order: 101, permission: 'patient:read', visibility: 'on_duty' },
    ],
    consultation: [],
    administration: [],
    teleconsultation: [
      { id: 'virtual-queue', label: 'Virtual Queue', route: '/telemedicine/queue', icon: 'Video', order: 100, permission: 'patient:read', visibility: 'on_duty' },
    ],
    admission: [
      { id: 'admissions', label: 'Admissions', route: '/admissions', icon: 'UserPlus', order: 100, permission: 'encounter:create', visibility: 'on_duty' },
    ],
    discharge: [
      { id: 'discharges', label: 'Discharges', route: '/discharges', icon: 'ArrowRight', order: 100, permission: 'discharge:create', visibility: 'on_duty' },
    ],
    procedure: [],
    home_visit: [],
    lecture: [],
    research: [],
    supervision: [],
    on_call: [],
    standby: [],
    outreach: [],
    other: [],
  };

  // Quick access items (always shown)
  private static readonly QUICK_ACCESS: NavigationNode[] = [
    { id: 'search', label: 'Search', route: '/search', icon: 'Search', order: 0, permission: null, visibility: 'always' },
    { id: 'messages', label: 'Messages', route: '/messages', icon: 'MessageSquare', order: 1, permission: null, visibility: 'always' },
    { id: 'notifications', label: 'Notifications', route: '/notifications', icon: 'Bell', order: 2, permission: null, visibility: 'always' },
    { id: 'help', label: 'Help', route: '/help', icon: 'LifeBuoy', order: 3, permission: null, visibility: 'always' },
  ];

  async resolve(workspace: ResolvedWorkspace): Promise<ResolverResult<NavigationTree>> {
    try {
      const category = workspace.professional?.primaryCategory || 'other';
      const assignmentType = workspace.activeAssignment?.type || 'other';
      const isOnDuty = workspace.isOnDuty;
      const permissions = workspace.permissions || [];

      // Get base navigation for category
      const baseNav = NavigationResolver.CATEGORY_NAVIGATION[category] ?? NavigationResolver.CATEGORY_NAVIGATION.other ?? [];

      // Get assignment-specific navigation
      const assignmentNav = NavigationResolver.ASSIGNMENT_NAVIGATION[assignmentType] ?? NavigationResolver.ASSIGNMENT_NAVIGATION.other ?? [];

      // Filter by permissions and visibility
      const filterNav = (nodes: NavigationNode[]): NavigationNode[] => {
        return nodes
          .filter(node => {
            // Check visibility
            if (node.visibility === 'on_duty' && !isOnDuty) return false;
            if (node.visibility === 'off_duty' && isOnDuty) return false;
            if (node.visibility === 'admin' && !permissions.some(p => p.resource === 'admin')) return false;

            // Check permission — but only filter for known constitutional
            // resources. Capability strings like "dashboard:read" reference a
            // page, not a data permission, so they never gate the item.
            if (node.permission) {
              const [resource, action] = node.permission.split(':');
              if (resource && NavigationResolver.KNOWN_RESOURCES.has(resource)) {
                if (!can(permissions, resource as any, action as any)) return false;
              }
            }

            // Recursively filter children
            if (node.children) {
              node.children = filterNav(node.children);
            }
            return true;
          })
          .map(node => ({
            ...node,
            isActive: false, // Will be set by router
          }))
          .sort((a, b) => a.order - b.order);
      };

      const primary = filterNav([...baseNav, ...assignmentNav]);
      const secondary = this.buildSecondaryNav(workspace, permissions);
      const quickAccess = NavigationResolver.QUICK_ACCESS.filter(q => {
        if (q.permission) {
          const [resource, action] = q.permission.split(':');
          return can(permissions, resource as any, action as any);
        }
        return true;
      });

      const tree: NavigationTree = {
        primary,
        secondary,
        quickAccess,
      };

      return { data: tree, error: null, fromCache: false, resolvedAt: Date.now() };
    } catch (error) {
      return { data: null, error: error as Error, fromCache: false, resolvedAt: Date.now() };
    }
  }

  private buildSecondaryNav(workspace: ResolvedWorkspace, permissions: Permission[]): NavigationNode[] {
    const secondary: NavigationNode[] = [];

    // Organization switcher
    if (workspace.memberships.length > 1) {
      secondary.push({
        id: 'switch-org',
        label: 'Switch Organization',
        route: '/switch-organization',
        icon: 'Building2',
        order: 1,
        permission: null,
        visibility: 'always',
      });
    }

    // Facility switcher
    if (workspace.facility && workspace.organization) {
      secondary.push({
        id: 'switch-facility',
        label: 'Switch Facility',
        route: '/switch-facility',
        icon: 'MapPin',
        order: 2,
        permission: null,
        visibility: 'always',
      });
    }

    // Department switcher
    if (workspace.department) {
      secondary.push({
        id: 'switch-dept',
        label: 'Switch Department',
        route: '/switch-department',
        icon: 'Building2',
        order: 3,
        permission: null,
        visibility: 'on_duty',
      });
    }

    // Role switcher (if multiple roles)
    if (workspace.responsibilities.length > 1) {
      secondary.push({
        id: 'switch-role',
        label: 'Switch Role',
        route: '/switch-role',
        icon: 'UserCog',
        order: 4,
        permission: null,
        visibility: 'always',
      });
    }

    // Settings
    secondary.push({
      id: 'settings',
      label: 'Settings',
      route: '/settings',
      icon: 'Settings',
      order: 100,
      permission: null,
      visibility: 'always',
    });

    // Profile
    secondary.push({
      id: 'profile',
      label: 'Profile',
      route: '/profile',
      icon: 'User',
      order: 101,
      permission: null,
      visibility: 'always',
    });

    return secondary.sort((a, b) => a.order - b.order);
  }
}

export const navigationResolver = new NavigationResolver();