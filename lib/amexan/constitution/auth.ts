// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitution — Auth Service
// Builds the full user session and resolves permissions/roles.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  AmxUid, Identity, Person, ProfessionalIdentity, Organization,
  Employment, Department, Assignment, Role, Permission,
  Responsibility, UserSession, DashboardTemplate, DashboardSection,
  DashboardItem, QuickAction, DashboardNotification, DashboardLink,
  ResourceType, Action, PermissionScope
} from './types';

// ── Permission checker ────────────────────────────────────────────────────────

export function can(
  permissions: Permission[],
  resource: ResourceType,
  action: Action,
  scope?: { organizationId?: string; departmentId?: string; wardId?: string }
): boolean {
  for (const p of permissions) {
    if (p.deny) {
      if (matchesPermission(p, resource, action, scope)) return false;
      continue;
    }
    if (matchesPermission(p, resource, action, scope)) return true;
  }
  return false;
}

function matchesPermission(
  p: Permission,
  resource: ResourceType,
  action: Action,
  scope?: { organizationId?: string; departmentId?: string; wardId?: string }
): boolean {
  if (p.resource !== resource && p.resource !== 'admin') return false;
  if (!p.actions.includes(action) && !p.actions.includes('admin')) return false;

  if (scope && p.scope.type !== 'global') {
    if (p.scope.type === 'organization' && scope.organizationId) {
      return p.scope.organizationIds?.includes(scope.organizationId) ?? false;
    }
    if (p.scope.type === 'department' && scope.departmentId) {
      return p.scope.departmentIds?.includes(scope.departmentId) ?? false;
    }
    if (p.scope.type === 'ward' && scope.wardId) {
      return p.scope.wardIds?.includes(scope.wardId) ?? false;
    }
  }
  return true;
}

// ── Dashboard generators ──────────────────────────────────────────────────────

export function generateDashboard(session: UserSession): DashboardTemplate {
  const { person, professional, currentEmployment, currentOrganization, currentDepartment, currentAssignments, onDuty } = session;
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const name = person?.fullName ?? 'User';

  const sections: DashboardSection[] = [];
  const title = getDashboardTitle(session);
  const quickActions = getQuickActions(session);
  const notifications: DashboardNotification[] = [];
  const workspaceLinks = getWorkspaceLinks(session);

  // Section 1: Today's Assignments (always first)
  const safeAssignments = currentAssignments || [];
  const activeAssignments = safeAssignments.filter(a => a.status === 'active' || a.status === 'scheduled');
  sections.push({
    id: 'today',
    title: onDuty ? 'Today\'s Assignments' : 'Off Duty — No Active Assignments',
    type: 'tasks',
    items: activeAssignments.map(a => ({
      id: a.id,
      type: a.type,
      title: a.title,
      subtitle: a.location?.type ? `${a.location.type} — ${a.startTime ? formatTime(a.startTime) : ''}` : undefined,
      status: a.status === 'active' ? 'active' : 'pending',
      priority: a.priority === 'emergency' ? 'urgent' : a.priority === 'urgent' ? 'high' : 'medium',
      time: a.startTime ? formatTime(a.startTime) : undefined,
      link: `/assignments/${a.id}`,
    })),
    priority: 1,
    emptyMessage: 'No assignments for today.',
  });

  // Section 2: Critical / Urgent items
  const urgentItems: DashboardItem[] = [];
  if (safeAssignments.some(a => a.priority === 'emergency' || a.priority === 'critical')) {
    urgentItems.push(...safeAssignments
      .filter(a => a.priority === 'emergency' || a.priority === 'critical')
      .map(a => ({
        id: a.id,
        type: 'urgent',
        title: a.title,
        status: 'critical' as const,
        priority: 'urgent' as const,
        link: `/assignments/${a.id}`,
      })));
  }

  // Add clinical alerts based on role
  if (professional?.categories.includes('medical_doctor') || professional?.categories.includes('nurse')) {
    urgentItems.push({
      id: 'pending-results',
      type: 'alert',
      title: 'Pending Lab/Imaging Results',
      status: 'urgent' as const,
      priority: 'high' as const,
      link: '/results',
    });
  }

  if (urgentItems.length > 0) {
    sections.push({
      id: 'urgent',
      title: 'Requires Attention',
      type: 'alerts',
      items: urgentItems,
      priority: 0,
    });
  }

  // Section 3: Active Patients (contextual)
  const patientItems: DashboardItem[] = [];
  const safeActivePatientIds = session.activePatientIds || [];
  if (safeActivePatientIds.length > 0) {
    patientItems.push(...safeActivePatientIds.slice(0, 10).map((pid, i) => ({
      id: `patient-${pid}`,
      type: 'patient',
      title: `Patient ${pid}`,
      subtitle: `Updated ${i === 0 ? '2 min ago' : '15 min ago'}`,
      status: 'active' as const,
      priority: 'medium' as const,
      patientId: pid,
      link: `/patient/${pid}`,
    })));
  }

  if (patientItems.length > 0) {
    sections.push({
      id: 'patients',
      title: 'Active Patients',
      type: 'patients',
      items: patientItems,
      priority: 2,
    });
  }

  return {
    title,
    greeting: `${greeting} ${name}`,
    sections,
    quickActions,
    notifications,
    workspaceLinks,
  };
}

function getDashboardTitle(session: UserSession): string {
  const { professional, currentEmployment } = session;
  if (professional?.primaryCategory === 'facility_admin') return 'Facility Admin Dashboard';
  if (professional?.primaryCategory === 'super_admin') return 'System Admin Dashboard';
  if (professional?.primaryCategory === 'medical_doctor') return 'Clinician Dashboard';
  if (professional?.primaryCategory === 'nurse') return 'Nursing Dashboard';
  if (professional?.primaryCategory === 'pharmacist') return 'Pharmacy Dashboard';
  if (professional?.primaryCategory === 'lab_technologist') return 'Laboratory Dashboard';
  if (professional?.primaryCategory === 'radiographer') return 'Radiology Dashboard';
  if (professional?.primaryCategory === 'receptionist') return 'Front Desk Dashboard';
  if (professional?.primaryCategory === 'finance_staff') return 'Finance Dashboard';
  if (professional?.primaryCategory === 'it_staff') return 'IT Dashboard';
  if (professional?.primaryCategory === 'hr_staff') return 'HR Dashboard';
  if (currentEmployment?.jobTitle) return `${currentEmployment.jobTitle} Dashboard`;
  return 'Dashboard';
}

// ── Actor dashboard (role-aware) ──────────────────────────────────────────────
// Same as generateDashboard, but derives role from either the professional
// identity or the session role id (which the legacy AuthContext path sets).
export function generateActorDashboard(session: UserSession): DashboardTemplate {
  const derivedCategory =
    session.professional?.primaryCategory ||
    (session.role?.id ? ROLE_TO_CATEGORY[session.role.id] : undefined);

  const augmented: UserSession = {
    ...session,
    professional: session.professional ?? {
      uid: session.identity?.uid ?? ('' as AmxUid),
      personId: session.person?.uid ?? ('' as AmxUid),
      categories: (derivedCategory ? [derivedCategory] : ['other']) as ProfessionalIdentity['categories'],
      primaryCategory: (derivedCategory || 'other') as ProfessionalIdentity['primaryCategory'],
      specialties: [],
      qualifications: [],
      yearsOfExperience: 0,
      verified: false,
      verificationDocuments: [],
    },
  };
  return generateDashboard(augmented);
}

const ROLE_TO_CATEGORY: Record<string, string> = {
  doctor: 'medical_doctor',
  consultant: 'consultant',
  nurse: 'nurse',
  midwife: 'midwife',
  pharmacist: 'pharmacist',
  lab_tech: 'lab_technologist',
  receptionist: 'receptionist',
  admin: 'facility_admin',
  super_admin: 'super_admin',
};

function getQuickActions(session: UserSession): QuickAction[] {
  const actions: QuickAction[] = [];
  const perms = session.permissions;

  if (can(perms, 'encounter', 'create')) {
    actions.push({ id: 'new-encounter', label: 'New Patient Encounter', icon: 'PlusCircle', link: '/patient/new', requiresContext: false });
  }
  if (can(perms, 'prescription', 'create')) {
    actions.push({ id: 'prescribe', label: 'Write Prescription', icon: 'Pill', link: '/prescribe', requiresContext: true });
  }
  if (can(perms, 'lab_order', 'create')) {
    actions.push({ id: 'order-lab', label: 'Order Lab Test', icon: 'FlaskConical', link: '/lab/order', requiresContext: true });
  }
  if (can(perms, 'imaging_order', 'create')) {
    actions.push({ id: 'order-imaging', label: 'Order Imaging', icon: 'Scan', link: '/imaging/order', requiresContext: true });
  }
  if (can(perms, 'clinical_note', 'create')) {
    actions.push({ id: 'write-note', label: 'Write Clinical Note', icon: 'FileText', link: '/notes/new', requiresContext: true });
  }
  if (can(perms, 'schedule', 'create')) {
    actions.push({ id: 'schedule', label: 'View Schedule', icon: 'Calendar', link: '/schedule', requiresContext: false });
  }
  if (can(perms, 'patient', 'create')) {
    actions.push({ id: 'register', label: 'Register Patient', icon: 'UserPlus', link: '/patient/register', requiresContext: false });
  }
  if (can(perms, 'referral', 'create')) {
    actions.push({ id: 'refer', label: 'Refer Patient', icon: 'ArrowRight', link: '/referral/new', requiresContext: true });
  }
  if (can(perms, 'discharge', 'update')) {
    actions.push({ id: 'discharge', label: 'Discharge Summary', icon: 'LogOut', link: '/discharge', requiresContext: true });
  }

  return actions;
}

function getWorkspaceLinks(session: UserSession): DashboardLink[] {
  const perms = session.permissions;
  const links: DashboardLink[] = [
    { id: 'patients', label: 'All Patients', href: '/patients', icon: 'Users' },
  ];

  if (can(perms, 'encounter', 'read'))
    links.push({ id: 'encounters', label: 'Encounters', href: '/encounters', icon: 'Clipboard' });
  if (can(perms, 'prescription', 'read'))
    links.push({ id: 'prescriptions', label: 'Prescriptions', href: '/prescriptions', icon: 'Pill' });
  if (can(perms, 'lab_order', 'read'))
    links.push({ id: 'lab', label: 'Laboratory', href: '/doctor/lab', icon: 'FlaskConical' });
  if (can(perms, 'imaging_order', 'read'))
    links.push({ id: 'imaging', label: 'Radiology', href: '/imaging', icon: 'Scan' });
  if (can(perms, 'clinical_note', 'read'))
    links.push({ id: 'notes', label: 'Clinical Notes', href: '/notes', icon: 'FileText' });
  if (can(perms, 'schedule', 'read'))
    links.push({ id: 'schedule', label: 'Schedule', href: '/schedule', icon: 'Calendar' });
  if (can(perms, 'reports', 'read'))
    links.push({ id: 'reports', label: 'Reports', href: '/reports', icon: 'BarChart3' });
  if (can(perms, 'view_analytics', 'read'))
    links.push({ id: 'analytics', label: 'Analytics', href: '/analytics', icon: 'TrendingUp' });
  if (can(perms, 'manage_staff', 'update'))
    links.push({ id: 'staff', label: 'Staff Management', href: '/admin/staff', icon: 'UserCog' });
  if (can(perms, 'manage_org', 'update'))
    links.push({ id: 'admin', label: 'Organization Settings', href: '/admin/settings', icon: 'Settings' });

  return links;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ── Session builder (loads from Firestore or cache) ──────────────────────────

export function buildEmptySession(): UserSession {
  return {
    identity: null as any,
    person: null as any,
    professional: null,
    employments: [],
    currentEmployment: null,
    currentOrganization: null,
    currentDepartment: null,
    currentAssignments: [],
    role: { id: 'anonymous', name: 'Anonymous', description: 'Unauthenticated user', type: 'system', permissions: [], isAssignable: false, createdBy: '' as AmxUid, createdAt: 0, updatedAt: 0 },
    permissions: [],
    responsibilities: [],
    isAuthenticated: false,
    isLoading: true,
    onDuty: false,
    activePatientIds: [],
    activeEncounterIds: [],
  };
}
