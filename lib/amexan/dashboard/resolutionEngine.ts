// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN DASHBOARD RESOLUTION ENGINE (BOOK VIII · Volume VIII-A)
//
// The first engine executed after login. The dashboard comes LAST — never first.
//
//   Authentication → Identity → Actor → Organization → Employment → Assignment
//     → Capability → Preference → Presentation Engine → Dashboard
//
// Constitutional rules enforced here:
//   • Authentication / Identity / roles alone never choose a dashboard
//   • Assignment has higher priority than employment
//   • The Presentation Engine never contains clinical reasoning
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  ActorObject, AssignmentKind, AuthResult, CapabilityProfile, CurrentAssignment,
  DashboardFamilyId, EmploymentProfile, HeaderState, IntelligenceItem,
  NavigationItem, OrganizationChoice, PreferenceSet, QuickAction,
  ResolvedDashboard, ResolutionContext, UniversalIdentity,
} from './types';
import {
  FAMILY_NAVIGATION, FAMILY_QUICK_ACTIONS, familyLabel, resolveFamily,
  workspaceForAssignment,
} from './constitution';
import { filterByPermission, hasPermission, type WidgetEngine } from './widgetEngine';

// ── Pipeline input: raw outputs of the upstream constitutional engines ─────────

export interface ResolutionInput {
  auth: AuthResult;
  identity: UniversalIdentity;
  actor: ActorObject;
  organizationChoices?: OrganizationChoice[];
  activeOrganizationId?: string;
  employments: EmploymentProfile[];
  assignment?: CurrentAssignment;
  capabilities?: CapabilityProfile;
  preferences?: PreferenceSet;
  notificationCount?: number;
  tasksCount?: number;
  criticalAlertsCount?: number;
  hospitalStatus?: Record<string, unknown>;
}

// Assignment → family override (constitutional: assignment beats employment).
// An emergency call hands the actor the Emergency operating system; a theatre
// list hands them the Theatre operating system. Everything else keeps the base
// family resolved from employment roles.

export const ASSIGNMENT_FAMILY_OVERRIDE: Readonly<Partial<Record<AssignmentKind, DashboardFamilyId>>> = {
  emergency_call: 'emergency',
  laboratory: 'laboratory',
  pharmacy: 'pharmacy',
  radiology: 'radiology',
  telemedicine: 'telemedicine',
  research: 'research',
};

export function defaultCapabilities(actor: ActorObject): CapabilityProfile {
  const caps = new Set(actor.capabilities.map(c => c.toLowerCase()));
  return {
    actorId: actor.actorId,
    clinical: caps.has('clinical'),
    administration: caps.has('administration') || caps.has('admin'),
    teaching: caps.has('teaching'),
    research: caps.has('research'),
    telemedicine: caps.has('telemedicine'),
    prescribe: caps.has('prescribe'),
    orderLab: caps.has('order_lab') || caps.has('order_lab_orders'),
    orderImaging: caps.has('order_imaging'),
    admit: caps.has('admit'),
    discharge: caps.has('discharge'),
    signOff: caps.has('sign_off') || caps.has('signoff'),
    flags: actor.capabilities,
  };
}

export function defaultPreferences(actor: ActorObject): PreferenceSet {
  return {
    actorId: actor.actorId,
    language: 'en',
    theme: 'light',
    favoriteWidgets: [],
    widgetOrder: [],
    protocols: true,
    density: 'comfortable',
  };
}

export class ResolutionEngine {
  constructor(private readonly widgetEngine: WidgetEngine) {}

  // ── Phases 1–8: resolve the constitutional context ──────────────────────────
  resolve(input: ResolutionInput): ResolutionContext {
    // Phase 4 — Organization: the active workspace is always one organization.
    const choices = input.organizationChoices ?? [];
    const activeOrganization =
      input.activeOrganizationId
      ?? choices.find(c => c.isActive)?.organizationId
      ?? choices[0]?.organizationId;

    // Phase 5 — Employment: profiles belonging to the active organization.
    const employments = activeOrganization
      ? input.employments.filter(e => e.organizationId === activeOrganization)
      : input.employments;

    // Phase 7 — Capability: role is never enough; capabilities determine function.
    const capabilities = input.capabilities ?? defaultCapabilities(input.actor);

    // Phase 8 — Preference: personalizes presentation, never business logic.
    const preferences = input.preferences ?? defaultPreferences(input.actor);

    return {
      auth: input.auth,
      identity: input.identity,
      actor: input.actor,
      activeOrganization,
      organizationChoices: choices,
      employments,
      assignment: input.assignment,
      capabilities,
      preferences,
      notificationCount: input.notificationCount ?? 0,
      tasksCount: input.tasksCount ?? 0,
      criticalAlertsCount: input.criticalAlertsCount ?? 0,
      hospitalStatus: input.hospitalStatus ?? {},
    };
  }

  // ── Phase 9: presentation resolution ─────────────────────────────────────────
  present(context: ResolutionContext, opts: { intelligence?: IntelligenceItem[]; forceFamily?: DashboardFamilyId } = {}): ResolvedDashboard {
    const familyId = opts.forceFamily ?? this.familyForContext(context);
    const workspace = workspaceForAssignment(context.assignment?.kind);
    workspace.familyId = familyId;

    const { widgets, layers } = this.widgetEngine.compose({
      familyId,
      assignment: context.assignment,
      capabilities: context.capabilities,
      preferences: context.preferences,
      context,
    });

    return {
      actorId: context.actor.actorId,
      familyId,
      familyLabel: familyLabel(familyId),
      context: workspace,
      header: this.buildHeader(context, familyId),
      navigation: this.buildNavigation(familyId, context.capabilities),
      workspace: { widgets },
      intelligence: this.buildIntelligence(context, opts.intelligence),
      quickActions: this.buildQuickActions(familyId, context.capabilities, context.assignment),
      layers,
      generatedAt: Date.now(),
      offlineRecoverable: true,
    };
  }

  // Rule 4 — Assignment has higher priority than employment.
  private familyForContext(context: ResolutionContext): DashboardFamilyId {
    const override = context.assignment ? ASSIGNMENT_FAMILY_OVERRIDE[context.assignment.kind] : undefined;
    if (override) return override;
    const roles = context.employments.flatMap(e => e.roles);
    return resolveFamily(roles) ?? 'clinician';
  }

  // Context switching — one actor, many contexts, no logout, no second account.
  switchWorkspace(context: ResolutionContext, assignment: CurrentAssignment): ResolvedDashboard {
    return this.present({ ...context, assignment });
  }

  // ── Header (universal; only values change) ───────────────────────────────────
  private buildHeader(context: ResolutionContext, familyId: DashboardFamilyId): HeaderState {
    const organization = context.organizationChoices.find(o => o.organizationId === context.activeOrganization);
    const employment = context.employments.find(e => e.organizationId === context.activeOrganization);
    return {
      actorId: context.actor.actorId,
      name: context.actor.name,
      amxid: context.actor.amxid,
      organizationId: context.activeOrganization,
      organizationName: organization?.name,
      departmentId: employment?.departmentId,
      departmentName: employment?.departmentId,
      currentAssignment: context.assignment?.label,
      notificationCount: context.notificationCount,
      searchEnabled: true,
      emergencyShortcut: true,
      aiEnabled: context.capabilities.clinical || context.capabilities.administration,
      workspaceSwitcher: context.organizationChoices.map(choice => ({
        id: choice.organizationId,
        label: choice.name,
        familyId,
      })),
      language: context.preferences.language,
      theme: context.preferences.theme,
    };
  }

  // ── Navigation (constitutional; filtered by capability) ──────────────────────
  private buildNavigation(familyId: DashboardFamilyId, capabilities: CapabilityProfile): NavigationItem[] {
    return filterByPermission(FAMILY_NAVIGATION[familyId] ?? [], capabilities);
  }

  // ── Quick actions (contextual; filtered by capability) ───────────────────────
  private buildQuickActions(familyId: DashboardFamilyId, capabilities: CapabilityProfile, assignment?: CurrentAssignment): QuickAction[] {
    const actions = filterByPermission(FAMILY_QUICK_ACTIONS[familyId] ?? [], capabilities);
    if (!assignment) return actions;
    return [...actions].sort((a, b) => {
      const matchA = a.context === assignment.kind ? 0 : 1;
      const matchB = b.context === assignment.kind ? 0 : 1;
      return matchA - matchB;
    });
  }

  // ── Intelligence panel (context aware, never clinical reasoning) ─────────────
  private buildIntelligence(context: ResolutionContext, extras: IntelligenceItem[] = []): IntelligenceItem[] {
    const items: IntelligenceItem[] = [...extras];

    if (context.criticalAlertsCount > 0) {
      items.push({
        id: 'alerts-summary',
        kind: 'alert',
        title: `${context.criticalAlertsCount} critical alerts require attention`,
        priority: context.criticalAlertsCount > 2 ? 'critical' : 'urgent',
      });
    }
    if (context.tasksCount > 0) {
      items.push({ id: 'tasks-summary', kind: 'task', title: `${context.tasksCount} open tasks`, priority: 'normal' });
    }
    if (context.notificationCount > 0) {
      items.push({ id: 'notifications-summary', kind: 'notification', title: `${context.notificationCount} notifications`, priority: 'info' });
    }

    // Operational status flags are passed through from upstream engines unchanged.
    const status = context.hospitalStatus ?? {};
    const operationalAlerts: { key: string; title: string; priority: IntelligenceItem['priority'] }[] = [
      { key: 'blood_stock_low', title: 'Blood stock low', priority: 'urgent' },
      { key: 'icu_full', title: 'ICU at capacity', priority: 'urgent' },
      { key: 'power_outage', title: 'Power outage reported', priority: 'urgent' },
      { key: 'internet_issue', title: 'Network connectivity issue', priority: 'normal' },
      { key: 'staff_shortage', title: 'Staff shortage', priority: 'urgent' },
      { key: 'budget_alert', title: 'Budget alert', priority: 'normal' },
    ];
    for (const alert of operationalAlerts) {
      if (status[alert.key]) items.push({ id: `status-${alert.key}`, kind: 'alert', title: alert.title, priority: alert.priority });
    }

    return items;
  }
}

export { hasPermission };
