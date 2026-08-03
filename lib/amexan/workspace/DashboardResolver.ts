// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Engine — Dashboard Resolver
// Resolves the dashboard configuration based on resolved workspace context
// Constitutional Principle: Dashboard is derived from workspace, not hardcoded
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  ResolvedWorkspace,
  DashboardConfig,
  DashboardSection,
  DashboardItem,
  DashboardWidget,
  QuickAction,
  NavigationNode,
  ResolverResult,
} from './types';
import type { AmxUid, ProfessionalCategory, AssignmentType } from '@/lib/amexan/constitution/types';
import { computeWorkspaceCompleteness } from './completeness';

export class DashboardResolver {
  // Dashboard layout mappings by professional category and assignment type
  private static readonly DASHBOARD_LAYOUTS: Record<string, Partial<DashboardConfig>> = {
    medical_doctor: {
      layout: 'clinical',
      theme: 'light',
    },
    nurse: {
      layout: 'nursing',
      theme: 'light',
    },
    pharmacist: {
      layout: 'pharmacy',
      theme: 'light',
    },
    lab_technologist: {
      layout: 'laboratory',
      theme: 'light',
    },
    radiographer: {
      layout: 'radiology',
      theme: 'dark',
    },
    facility_admin: {
      layout: 'administrative',
      theme: 'light',
    },
    receptionist: {
      layout: 'reception',
      theme: 'light',
    },
  };

  private static readonly ASSIGNMENT_DASHBOARDS: Record<AssignmentType, Partial<DashboardConfig>> = {
    ward_round: {
      title: 'Ward Round',
      layout: 'clinical',
      sections: [
        { id: 'ward-patients', title: 'Ward Patients', type: 'patients', priority: 1, items: [] },
        { id: 'tasks', title: 'Tasks', type: 'tasks', priority: 2, items: [] },
        { id: 'alerts', title: 'Alerts', type: 'alerts', priority: 3, items: [] },
      ],
    },
    clinic: {
      title: 'Clinic',
      layout: 'clinical',
      sections: [
        { id: 'clinic-queue', title: 'Clinic Queue', type: 'queue', priority: 1, items: [] },
        { id: 'consultations', title: 'Consultations', type: 'tasks', priority: 2, items: [] },
        { id: 'prescriptions', title: 'Prescriptions', type: 'tasks', priority: 3, items: [] },
      ],
    },
    theatre: {
      title: 'Theatre',
      layout: 'clinical',
      sections: [
        { id: 'theatre-list', title: 'Theatre List', type: 'schedule', priority: 1, items: [] },
        { id: 'pre-op', title: 'Pre-operative', type: 'tasks', priority: 2, items: [] },
        { id: 'post-op', title: 'Post-operative', type: 'patients', priority: 3, items: [] },
      ],
    },
    emergency_call: {
      title: 'Emergency',
      layout: 'clinical',
      sections: [
        { id: 'resus-bay', title: 'Resus Bay', type: 'patients', priority: 1, items: [] },
        { id: 'triage', title: 'Triage Queue', type: 'queue', priority: 2, items: [] },
        { id: 'stat-orders', title: 'Stat Orders', type: 'tasks', priority: 3, items: [] },
      ],
    },
    icu_duty: {
      title: 'ICU Duty',
      layout: 'clinical',
      sections: [
        { id: 'icu-beds', title: 'ICU Beds', type: 'patients', priority: 1, items: [] },
        { id: 'ventilators', title: 'Ventilators', type: 'stats', priority: 2, items: [] },
        { id: 'alerts', title: 'Critical Alerts', type: 'alerts', priority: 3, items: [] },
      ],
    },
    consultation: {
      title: 'Consultation',
      layout: 'clinical',
      sections: [
        { id: 'referrals', title: 'Referrals', type: 'tasks', priority: 1, items: [] },
        { id: 'reviews', title: 'Case Reviews', type: 'patients', priority: 2, items: [] },
      ],
    },
    administration: {
      title: 'Administration',
      layout: 'administrative',
      sections: [
        { id: 'admin-tasks', title: 'Administrative Tasks', type: 'tasks', priority: 1, items: [] },
        { id: 'reports', title: 'Reports', type: 'stats', priority: 2, items: [] },
        { id: 'staffing', title: 'Staffing', type: 'schedule', priority: 3, items: [] },
      ],
    },
    teleconsultation: {
      title: 'Telemedicine',
      layout: 'clinical',
      sections: [
        { id: 'virtual-queue', title: 'Virtual Queue', type: 'queue', priority: 1, items: [] },
        { id: 'active-calls', title: 'Active Calls', type: 'patients', priority: 2, items: [] },
      ],
    },
    admission: {
      title: 'Admissions',
      layout: 'clinical',
      sections: [
        { id: 'pending-admissions', title: 'Pending Admissions', type: 'queue', priority: 1, items: [] },
        { id: 'bed-management', title: 'Bed Management', type: 'stats', priority: 2, items: [] },
      ],
    },
    discharge: {
      title: 'Discharges',
      layout: 'clinical',
      sections: [
        { id: 'pending-discharges', title: 'Pending Discharges', type: 'tasks', priority: 1, items: [] },
        { id: 'discharge-summaries', title: 'Discharge Summaries', type: 'tasks', priority: 2, items: [] },
      ],
    },
    procedure: {
      title: 'Procedures',
      layout: 'clinical',
      sections: [
        { id: 'scheduled-procedures', title: 'Scheduled Procedures', type: 'schedule', priority: 1, items: [] },
        { id: 'pre-procedure', title: 'Pre-procedure', type: 'tasks', priority: 2, items: [] },
      ],
    },
    home_visit: {
      title: 'Home Visits',
      layout: 'clinical',
      sections: [
        { id: 'visit-schedule', title: 'Visit Schedule', type: 'schedule', priority: 1, items: [] },
        { id: 'patient-notes', title: 'Patient Notes', type: 'tasks', priority: 2, items: [] },
      ],
    },
    lecture: {
      title: 'Teaching',
      layout: 'administrative',
      sections: [
        { id: 'schedule', title: 'Lecture Schedule', type: 'schedule', priority: 1, items: [] },
        { id: 'materials', title: 'Materials', type: 'tasks', priority: 2, items: [] },
      ],
    },
    research: {
      title: 'Research',
      layout: 'administrative',
      sections: [
        { id: 'studies', title: 'Active Studies', type: 'tasks', priority: 1, items: [] },
        { id: 'data-collection', title: 'Data Collection', type: 'tasks', priority: 2, items: [] },
      ],
    },
    supervision: {
      title: 'Supervision',
      layout: 'clinical',
      sections: [
        { id: 'trainees', title: 'Trainees', type: 'patients', priority: 1, items: [] },
        { id: 'assessments', title: 'Assessments', type: 'tasks', priority: 2, items: [] },
      ],
    },
    on_call: {
      title: 'On Call',
      layout: 'clinical',
      sections: [
        { id: 'call-log', title: 'Call Log', type: 'activity', priority: 1, items: [] },
        { id: 'handover', title: 'Handover', type: 'tasks', priority: 2, items: [] },
      ],
    },
    standby: {
      title: 'Standby',
      layout: 'clinical',
      sections: [
        { id: 'alerts', title: 'Alerts', type: 'alerts', priority: 1, items: [] },
        { id: 'readiness', title: 'Readiness', type: 'stats', priority: 2, items: [] },
      ],
    },
    outreach: {
      title: 'Outreach',
      layout: 'clinical',
      sections: [
        { id: 'camp-schedule', title: 'Camp Schedule', type: 'schedule', priority: 1, items: [] },
        { id: 'patients', title: 'Patients Seen', type: 'patients', priority: 2, items: [] },
      ],
    },
    other: {
      title: 'Workspace',
      layout: 'clinical',
      sections: [
        { id: 'tasks', title: 'Tasks', type: 'tasks', priority: 1, items: [] },
        { id: 'schedule', title: 'Schedule', type: 'schedule', priority: 2, items: [] },
      ],
    },
  };

  async resolve(workspace: ResolvedWorkspace): Promise<ResolverResult<DashboardConfig>> {
    try {
      const category = workspace.professional?.primaryCategory || 'other';
      const assignmentType = workspace.activeAssignment?.type || 'other';
      const isOnDuty = workspace.isOnDuty;

      // Base config from professional category
      const baseConfig = DashboardResolver.DASHBOARD_LAYOUTS[category] || DashboardResolver.DASHBOARD_LAYOUTS.other;

      // Assignment-specific config
      const assignmentConfig = DashboardResolver.ASSIGNMENT_DASHBOARDS[assignmentType] || DashboardResolver.ASSIGNMENT_DASHBOARDS.other;

      // Generate greeting
      const greeting = this.generateGreeting(workspace);
      const title = assignmentConfig.title || `${category.replace('_', ' ')} Dashboard`;

      // Build sections - merge base with assignment-specific
      const sections: DashboardSection[] = (assignmentConfig.sections || []).map((s, i) => ({
        ...s,
        id: s.id || `section-${i}`,
        items: s.items || [],
      }));

      // Add default sections if none from assignment
      if (sections.length === 0) {
        sections.push(
          { id: 'tasks', title: 'My Tasks', type: 'tasks', priority: 1, items: [] },
          { id: 'schedule', title: 'Today\'s Schedule', type: 'schedule', priority: 2, items: [] },
          { id: 'patients', title: 'My Patients', type: 'patients', priority: 3, items: [] },
          { id: 'alerts', title: 'Alerts', type: 'alerts', priority: 4, items: [] },
        );
      }

      // Build widgets
      const widgets: DashboardWidget[] = this.buildWidgets(workspace, assignmentType);

      // Build quick actions
      const quickActions = this.buildQuickActions(workspace, category, assignmentType);

      const config: DashboardConfig = {
        title,
        greeting,
        layout: assignmentConfig.layout || baseConfig.layout || 'clinical',
        sections,
        widgets,
        theme: baseConfig.theme || 'light',
      };

      return { data: config, error: null, fromCache: false, resolvedAt: Date.now() };
    } catch (error) {
      return { data: null, error: error as Error, fromCache: false, resolvedAt: Date.now() };
    }
  }

  private generateGreeting(workspace: ResolvedWorkspace): string {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const name = workspace.person?.givenName || workspace.person?.fullName || 'Clinician';
    const role = workspace.professional?.primaryCategory?.replace('_', ' ') || 'Clinician';

    let location = '';
    if (workspace.facility?.name) {
      location = ` at ${workspace.facility.name}`;
    } else if (workspace.organization?.name) {
      location = ` at ${workspace.organization.name}`;
    }

    if (workspace.activeAssignment) {
      return `${timeOfDay}, ${name}. ${workspace.activeAssignment.title}${location}`;
    }

    if (workspace.activeShift) {
      return `${timeOfDay}, ${name}. ${workspace.activeShift.name} shift${location}`;
    }

    return `${timeOfDay}, ${name}. ${role}${location}`;
  }

  private buildWidgets(workspace: ResolvedWorkspace, assignmentType: string): DashboardWidget[] {
    const widgets: DashboardWidget[] = [];
    let y = 0;

    // On-duty status widget
    widgets.push({
      id: 'duty-status',
      type: 'metric',
      title: 'Duty Status',
      config: {
        value: workspace.isOnDuty ? 'On Duty' : 'Off Duty',
        status: workspace.isOnDuty ? 'success' : 'warning',
        icon: workspace.isOnDuty ? 'CheckCircle' : 'Clock',
      },
      position: { x: 0, y: y++, w: 6, h: 4 },
    });

    // Current assignment widget
    if (workspace.activeAssignment) {
      widgets.push({
        id: 'current-assignment',
        type: 'metric',
        title: 'Current Assignment',
        config: {
          value: workspace.activeAssignment.title,
          subtitle: `${workspace.activeAssignment.location?.wardId || workspace.activeAssignment.location?.clinicId || 'N/A'}`,
          time: `${new Date(workspace.activeAssignment.startTime).toLocaleTimeString()} - ${new Date(workspace.activeAssignment.endTime).toLocaleTimeString()}`,
        },
        position: { x: 6, y: 0, w: 6, h: 4 },
      });
    }

    // Shift widget
    if (workspace.activeShift) {
      widgets.push({
        id: 'current-shift',
        type: 'metric',
        title: 'Current Shift',
        config: {
          value: workspace.activeShift.name,
          subtitle: `${workspace.activeShift.startTime} - ${workspace.activeShift.endTime}`,
          type: workspace.activeShift.type,
        },
        position: { x: 12, y: 0, w: 6, h: 4 },
      });
    }

    // Patient count widget
    if (workspace.currentAssignments.length > 0) {
      const patientCount = new Set(workspace.currentAssignments.flatMap(a => a.linkedPatientIds || [])).size;
      widgets.push({
        id: 'patient-count',
        type: 'metric',
        title: 'Patients Today',
        config: {
          value: patientCount,
          trend: 'neutral',
        },
        position: { x: 18, y: 0, w: 6, h: 4 },
      });
    }

    // Assignment-type specific widgets
    if (assignmentType === 'ward_round') {
      widgets.push({
        id: 'ward-round-progress',
        type: 'chart',
        title: 'Round Progress',
        config: {
          type: 'progress',
          completed: workspace.currentAssignments.filter(a => a.status === 'completed').length,
          total: workspace.currentAssignments.length,
        },
        position: { x: 0, y: y++, w: 12, h: 6 },
      });
    } else if (assignmentType === 'clinic') {
      widgets.push({
        id: 'clinic-queue',
        type: 'queue',
        title: 'Clinic Queue',
        config: {
          showWaitTime: true,
          maxItems: 10,
        },
        position: { x: 0, y: y++, w: 12, h: 8 },
      });
    } else if (assignmentType === 'emergency_call') {
      widgets.push({
        id: 'triage-alerts',
        type: 'alert',
        title: 'Triage Alerts',
        config: {
          severity: 'critical',
          autoRefresh: true,
        },
        position: { x: 0, y: y++, w: 12, h: 6 },
      });
    }

    return widgets;
  }

  // Public so the WorkspaceEngine can also resolve quick actions
  buildQuickActions(workspace: ResolvedWorkspace, category: string, assignmentType: string): QuickAction[] {
    const actions: QuickAction[] = [];

    // Base actions by category
    const categoryActions: Record<string, QuickAction[]> = {
      medical_doctor: [
        { id: 'new-encounter', label: 'New Encounter', icon: 'PlusCircle', route: '/encounter/new', color: 'blue', shortcut: 'n', requiresContext: true, category: 'clinical' },
        { id: 'write-note', label: 'Write Note', icon: 'FileText', route: '/notes/new', color: 'green', shortcut: 'w', requiresContext: true, category: 'clinical' },
        { id: 'prescribe', label: 'Prescribe', icon: 'Pill', route: '/prescribe', color: 'purple', shortcut: 'p', requiresContext: true, category: 'clinical' },
        { id: 'order-lab', label: 'Order Lab', icon: 'FlaskConical', route: '/lab/order', color: 'orange', shortcut: 'l', requiresContext: true, category: 'clinical' },
        { id: 'order-imaging', label: 'Order Imaging', icon: 'Scan', route: '/imaging/order', color: 'red', shortcut: 'i', requiresContext: true, category: 'clinical' },
      ],
      nurse: [
        { id: 'vitals', label: 'Record Vitals', icon: 'Activity', route: '/vitals', color: 'blue', shortcut: 'v', requiresContext: true, category: 'clinical' },
        { id: 'med-admin', label: 'Med Admin', icon: 'Pill', route: '/medication/administer', color: 'green', shortcut: 'm', requiresContext: true, category: 'clinical' },
        { id: 'handover', label: 'Handover', icon: 'ArrowRight', route: '/handover', color: 'purple', shortcut: 'h', requiresContext: true, category: 'clinical' },
        { id: 'care-plan', label: 'Care Plan', icon: 'ClipboardList', route: '/care-plan', color: 'orange', shortcut: 'c', requiresContext: true, category: 'clinical' },
      ],
      pharmacist: [
        { id: 'verify-rx', label: 'Verify Prescription', icon: 'CheckCircle', route: '/pharmacy/verify', color: 'blue', shortcut: 'v', requiresContext: true, category: 'clinical' },
        { id: 'dispense', label: 'Dispense', icon: 'Package', route: '/pharmacy/dispense', color: 'green', shortcut: 'd', requiresContext: true, category: 'clinical' },
        { id: 'inventory', label: 'Inventory', icon: 'Boxes', route: '/pharmacy/inventory', color: 'purple', shortcut: 'i', requiresContext: false, category: 'clinical' },
      ],
      lab_technologist: [
        { id: 'specimen', label: 'Receive Specimen', icon: 'FlaskConical', route: '/lab/specimen', color: 'blue', shortcut: 's', requiresContext: true, category: 'clinical' },
        { id: 'results', label: 'Enter Results', icon: 'FileText', route: '/lab/results', color: 'green', shortcut: 'r', requiresContext: true, category: 'clinical' },
        { id: 'qc', label: 'Quality Control', icon: 'CheckSquare', route: '/lab/qc', color: 'purple', shortcut: 'q', requiresContext: false, category: 'clinical' },
      ],
      radiographer: [
        { id: 'imaging-order', label: 'New Order', icon: 'PlusCircle', route: '/radiology/order', color: 'blue', shortcut: 'o', requiresContext: true, category: 'clinical' },
        { id: 'report', label: 'Create Report', icon: 'FileText', route: '/radiology/report', color: 'green', shortcut: 'r', requiresContext: true, category: 'clinical' },
        { id: 'pacs', label: 'PACS', icon: 'Image', route: '/radiology/pacs', color: 'purple', shortcut: 'p', requiresContext: false, category: 'clinical' },
      ],
      facility_admin: [
        { id: 'staffing', label: 'Staffing', icon: 'Users', route: '/admin/staffing', color: 'blue', shortcut: 's', requiresContext: false, category: 'administrative' },
        { id: 'reports', label: 'Reports', icon: 'BarChart3', route: '/admin/reports', color: 'green', shortcut: 'r', requiresContext: false, category: 'administrative' },
        { id: 'beds', label: 'Bed Management', icon: 'Bed', route: '/admin/beds', color: 'purple', shortcut: 'b', requiresContext: false, category: 'administrative' },
        { id: 'schedule', label: 'Scheduling', icon: 'Calendar', route: '/admin/schedule', color: 'orange', shortcut: 'c', requiresContext: false, category: 'administrative' },
      ],
      receptionist: [
        { id: 'register', label: 'Register Patient', icon: 'UserPlus', route: '/patient/register', color: 'blue', shortcut: 'r', requiresContext: false, category: 'clinical' },
        { id: 'appointments', label: 'Appointments', icon: 'Calendar', route: '/appointments', color: 'green', shortcut: 'a', requiresContext: false, category: 'clinical' },
        { id: 'billing', label: 'Billing', icon: 'CreditCard', route: '/billing', color: 'purple', shortcut: 'b', requiresContext: false, category: 'administrative' },
      ],
    };

    actions.push(...(categoryActions[category] || []));

    // Assignment-specific actions
    const assignmentActions: Record<string, QuickAction[]> = {
      ward_round: [
        { id: 'next-patient', label: 'Next Patient', icon: 'ArrowRight', route: '/ward-round/next', color: 'blue', shortcut: 'n', requiresContext: true, category: 'clinical' },
        { id: 'complete-round', label: 'Complete Round', icon: 'CheckCircle', route: '/ward-round/complete', color: 'green', shortcut: 'c', requiresContext: true, category: 'clinical' },
      ],
      clinic: [
        { id: 'next-patient', label: 'Next Patient', icon: 'ArrowRight', route: '/clinic/next', color: 'blue', shortcut: 'n', requiresContext: true, category: 'clinical' },
        { id: 'refer', label: 'Refer', icon: 'ArrowUpRight', route: '/referral/new', color: 'purple', shortcut: 'r', requiresContext: true, category: 'clinical' },
      ],
      emergency_call: [
        { id: 'alert-team', label: 'Alert Team', icon: 'AlertTriangle', route: '/emergency/alert', color: 'red', shortcut: 'a', requiresContext: true, category: 'communication' },
        { id: 'stat-lab', label: 'Stat Lab', icon: 'FlaskConical', route: '/lab/stat', color: 'red', shortcut: 'l', requiresContext: true, category: 'clinical' },
        { id: 'call-consultant', label: 'Call Consultant', icon: 'Phone', route: '/emergency/consult', color: 'orange', shortcut: 'c', requiresContext: true, category: 'communication' },
      ],
      icu_duty: [
        { id: 'vitals-check', label: 'Vitals Check', icon: 'Activity', route: '/icu/vitals', color: 'blue', shortcut: 'v', requiresContext: true, category: 'clinical' },
        { id: 'ventilator', label: 'Ventilator Settings', icon: 'Cpu', route: '/icu/ventilator', color: 'purple', shortcut: 'e', requiresContext: true, category: 'clinical' },
        { id: 'abg', label: 'ABG', icon: 'Droplet', route: '/icu/abg', color: 'green', shortcut: 'a', requiresContext: true, category: 'clinical' },
      ],
    };

    actions.push(...(assignmentActions[assignmentType] || []));

    // Always available actions
    actions.push(
      { id: 'search', label: 'Search', icon: 'Search', route: '/search', color: 'gray', shortcut: '/', requiresContext: false, category: 'navigation' },
      { id: 'messages', label: 'Messages', icon: 'MessageSquare', route: '/messages', color: 'gray', shortcut: 'm', requiresContext: false, category: 'communication' },
      { id: 'profile', label: 'Profile', icon: 'User', route: '/profile', color: 'gray', shortcut: 'p', requiresContext: false, category: 'navigation' },
    );

    return actions.slice(0, 12); // Limit to 12 quick actions
  }

  // Backward compatibility with existing generateActorDashboard
  async resolveFromSession(session: any): Promise<ResolverResult<DashboardConfig>> {
    const workspace: ResolvedWorkspace = {
      identity: session.identity,
      person: session.person,
      professional: session.professional,
      memberships: [],
      activeMembership: session.currentOrganization ? {
        id: session.currentOrganization.id,
        personId: session.identity.uid,
        organizationId: session.currentOrganization.id,
        organizationName: session.currentOrganization.name,
        organizationType: session.currentOrganization.type,
        roleId: session.role.id,
        roleName: session.role.name,
        isPrimary: true,
        status: 'active',
        joinedAt: Date.now(),
        updatedAt: Date.now(),
      } : null,
      organization: session.currentOrganization,
      facility: null,
      campus: null,
      building: null,
      floor: null,
      department: session.currentDepartment,
      unit: null,
      ward: null,
      clinic: null,
      employments: session.employments || [],
      activeEmployment: session.currentEmployment,
      assignments: session.currentAssignments || [],
      activeAssignment: session.currentAssignments?.find((a: any) => a.status === 'active'),
      currentAssignments: session.currentAssignments || [],
      shifts: [],
      activeShift: session.currentShift,
      shiftAssignment: null,
      teams: [],
      activeTeam: null,
      role: session.role,
      permissions: session.permissions,
      responsibilities: session.responsibilities || [],
      isOnDuty: session.onDuty,
      isLoading: false,
      lastResolvedAt: Date.now(),
      completeness: computeWorkspaceCompleteness({
        professional: session.professional,
        activeMembership: session.currentOrganization ? {
          id: session.currentOrganization.id,
          personId: session.identity.uid,
          organizationId: session.currentOrganization.id,
          organizationName: session.currentOrganization.name,
          organizationType: session.currentOrganization.type,
          roleId: session.role.id,
          roleName: session.role.name,
          isPrimary: true,
          status: 'active',
          joinedAt: Date.now(),
          updatedAt: Date.now(),
        } : null,
        organization: session.currentOrganization,
        facility: null,
        department: session.currentDepartment,
        activeEmployment: session.currentEmployment,
        activeAssignment: session.currentAssignments?.find((a: any) => a.status === 'active'),
        activeShift: session.currentShift,
      }),
      navigation: { primary: [], secondary: [], quickAccess: [] },
      dashboard: { title: '', greeting: '', layout: 'clinical', sections: [], widgets: [], theme: 'light' },
      quickActions: [],
      activePatientIds: [],
      activeEncounterIds: [],
    };

    return this.resolve(workspace);
  }
}

export const dashboardResolver = new DashboardResolver();