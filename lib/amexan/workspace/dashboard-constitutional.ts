// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace → Dashboard Constitutional Adapter (BOOK VIII · Volume VIII-A)
//
// Unifies the two dashboard engines into ONE constitutional path.
//
// Constitutional dependency (one direction only):
//
//   Constitution → Engines → Services → Workspace Resolver
//        → Dashboard Builder → Widgets → Pages
//
// The Workspace layer resolves WHO/WHERE/WHEN (identity, memberships, employment,
// assignment, capabilities). The Book VIII dashboard engine decides WHAT to show
// (families → workspaces → widgets → layers). This adapter is the single bridge:
// it converts a resolved Workspace into a Book VIII ResolutionInput and produces
// the constitutional ResolvedDashboard. The legacy DashboardConfig is derived from
// that same ResolvedDashboard, so there is no second source of truth.
//
// The workspace layer never contains presentation logic; the dashboard engine never
// contains business logic. Both remain pure.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  PresentationEngine, defaultCapabilities, defaultPreferences,
  type ActorObject, type AssignmentKind, type AuthResult,
  type DashboardFamilyId, type EmploymentProfile, type OrganizationChoice,
  type PreferenceSet, type PresentationWidget, type ResolutionInput,
  type ResolvedDashboard, type UniversalIdentity,
} from '@/lib/amexan/dashboard';
import type { AmxUid } from '@/lib/amexan/constitution/types';
import type {
  AssignmentType, DashboardConfig, DashboardSection, DashboardWidget,
  ResolverResult, ResolvedWorkspace,
} from './types';

// ── Category → Book VIII role tokens (so the family engine resolves correctly) ─

const CATEGORY_TO_ROLE: Readonly<Record<string, string[]>> = {
  facility_admin: ['facility_administrator'],
  super_admin: ['facility_administrator'],
  administrator: ['facility_administrator'],
  medical_doctor: [],
  consultant: ['consultant'],
  specialist: ['specialist'],
  clinical_officer: ['clinical_officer'],
  nurse: ['registered_nurse'],
  enrolled_nurse: ['enrolled_nurse'],
  midwife: ['midwife'],
  pharmacist: ['pharmacist'],
  chief_pharmacist: ['pharmacist'],
  pharmacy_technologist: ['pharmacy_technologist'],
  lab_technologist: ['laboratory_technologist'],
  medical_laboratory_scientist: ['laboratory_scientist'],
  pathologist: ['pathologist'],
  radiographer: ['radiographer'],
  radiologist: ['radiologist'],
  sonographer: ['sonographer'],
  surgeon: ['surgeon'],
  anaesthetist: ['anaesthetist'],
  dentist: ['dentist'],
  medical_student: ['student'],
  nursing_student: ['student'],
  pharmacy_student: ['student'],
  student: ['student'],
  intern: ['intern'],
  resident: ['resident'],
  registrar: ['registrar'],
  researcher: ['researcher'],
  biostatistician: ['biostatistician'],
  study_coordinator: ['study_coordinator'],
  educator: ['student'],
  finance_staff: ['finance_officer'],
  insurance_officer: ['finance_officer'],
  finance_officer: ['finance_officer'],
  billing_officer: ['billing_officer'],
  finance: ['finance_officer'],
  hr_staff: ['hr_officer'],
  hr_officer: ['hr_officer'],
  hr: ['hr_officer'],
  it_staff: ['ict_officer'],
  ict_officer: ['ict_officer'],
  ict: ['ict_officer'],
  department_head: ['department_head'],
  ward_in_charge: ['ward_in_charge'],
  patient: ['patient'],
  guardian: ['guardian'],
};

const POSITION_TO_ROLE: Readonly<Record<string, string[]>> = {
  consult: ['consultant'],
  registrar: ['registrar'],
  resident: ['resident'],
  intern: ['intern'],
  student: ['student'],
  officer: ['medical_officer'],
};

// ── Permission resource → capability token (so capabilities gate the dashboard) ─

const RESOURCE_TO_CAPABILITY: Readonly<Record<string, string>> = {
  patient: 'clinical', encounter: 'clinical', clinical_note: 'clinical',
  vitals: 'clinical', observations: 'clinical', assessment: 'clinical',
  care_plan: 'clinical', referral: 'clinical', consent: 'clinical',
  prescription: 'prescribe', lab_order: 'order_lab', imaging_order: 'order_imaging',
  discharge: 'discharge', discharge_summary: 'discharge',
  staff: 'administration', department: 'administration', organization: 'administration',
  finance: 'administration', admin: 'administration', system_config: 'administration',
  audit_log: 'administration', reports: 'administration',
};

// ── Book XV assignment type → Book VIII assignment kind (best-effort) ──────────

const ASSIGNMENT_KIND: Readonly<Record<AssignmentType, AssignmentKind | undefined>> = {
  ward_round: 'ward_round',
  clinic: 'clinic',
  theatre: 'theatre',
  emergency_call: 'emergency_call',
  icu_duty: 'icu',
  consultation: 'clinic',
  admission: 'clinic',
  discharge: 'clinic',
  procedure: 'theatre',
  home_visit: 'community_health',
  teleconsultation: 'telemedicine',
  lecture: 'teaching',
  research: 'research',
  administration: 'administration',
  supervision: 'teaching',
  on_call: 'on_call',
  standby: 'on_call',
  outreach: 'community_health',
  other: undefined,
};

// ── Family → legacy layout id (for the backward-compatible DashboardConfig) ────

function layoutForFamily(familyId: DashboardFamilyId): DashboardConfig['layout'] {
  switch (familyId) {
    case 'clinical_leadership':
    case 'executive':
    case 'department':
    case 'finance':
    case 'hr':
    case 'ict': return 'administrative';
    case 'ward':
    case 'nursing': return 'nursing';
    case 'pharmacy': return 'pharmacy';
    case 'laboratory': return 'laboratory';
    case 'radiology': return 'radiology';
    case 'patient': return 'custom';
    default: return 'clinical';
  }
}

const SECTION_TYPE: Readonly<Record<string, DashboardSection['type']>> = {
  overview: 'stats',
  operations: 'tasks',
  communication: 'activity',
  learning: 'custom',
  analytics: 'stats',
};

const WIDGET_TYPE: Readonly<Record<string, DashboardWidget['type']>> = {
  kpi_card: 'metric',
  metric: 'metric',
  financial_card: 'metric',
  chart: 'chart',
  patient_list: 'list',
  ward_map: 'list',
  calendar: 'calendar',
  timeline: 'list',
  task_list: 'list',
  notifications: 'alert',
  messages: 'list',
  ai_card: 'list',
  research_card: 'list',
  education_card: 'list',
  inventory_card: 'list',
  report_list: 'list',
  protocol_card: 'list',
};

function widgetPosition(w: PresentationWidget, index: number): DashboardWidget['position'] {
  const width = w.size === 'xl' ? 16 : w.size === 'lg' ? 8 : 4;
  return { x: (index % 4) * 4, y: Math.floor(index / 4) * 4, w: width, h: 4 };
}

function greetingFor(workspace: ResolvedWorkspace): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = workspace.person?.givenName || workspace.person?.fullName || 'Clinician';
  const role = workspace.professional?.primaryCategory?.replace('_', ' ') || 'Clinician';
  const location = workspace.facility?.name
    ? ` at ${workspace.facility.name}`
    : workspace.organization?.name
      ? ` at ${workspace.organization.name}`
      : '';
  if (workspace.activeAssignment) return `${timeOfDay}, ${name}. ${workspace.activeAssignment.title}${location}`;
  if (workspace.activeShift) return `${timeOfDay}, ${name}. ${workspace.activeShift.name} shift${location}`;
  return `${timeOfDay}, ${name}. ${role}${location}`;
}

// ── Role / capability derivation ───────────────────────────────────────────────

// Pure, testable derivation of the constitutional role tokens for a given
// professional category + role name. Public so the guarantee test can assert that
// EVERY constitution ProfessionalCategory and clinician sub-role resolves to a
// Book VIII family.
export function roleTokensFor(
  category: string,
  roleName?: string | null,
): string[] {
  const tokens: string[] = [];
  tokens.push(...(CATEGORY_TO_ROLE[category] ?? []));
  if (!category) return [...new Set(tokens)];

  const normalizedRole = (roleName ?? '').toLowerCase().replace(/\s+/g, '_');
  // The position-keyword sweep (Medical Officer / Clinical Officer / Registrar /
  // Resident / Intern / Student) describes the DOCTOR training-and-grade scheme.
  // It must only run for doctor categories, otherwise a role name like
  // "ICT Officer" or "Finance Officer" would falsely also yield 'medical_officer'
  // and override the explicit category → family mapping.
  if (category === 'medical_doctor') {
    const search = `${category} ${normalizedRole}`;
    for (const [keyword, roles] of Object.entries(POSITION_TO_ROLE)) {
      if (search.includes(keyword)) tokens.push(...roles);
    }
  }
  // A raw role-name token may refine the category's tokens (e.g. a role name of
  // "medical_officer"), BUT a stale 'patient' role (legacy accounts where
  // users/{uid}.role was never promoted past the registration default) must NOT
  // contaminate a staff actor's tokens — otherwise every clinician/admin would
  // resolve to the Patient family dashboard.
  if (CATEGORY_TO_ROLE[normalizedRole] && !(normalizedRole === 'patient' && category && category !== 'patient')) {
    tokens.push(normalizedRole);
  }

  return [...new Set(tokens)];
}

function roleTokens(workspace: ResolvedWorkspace): string[] {
  return roleTokensFor(
    workspace.professional?.primaryCategory ?? '',
    workspace.role?.name ?? '',
  );
}

function capabilityTokens(workspace: ResolvedWorkspace): string[] {
  const set = new Set<string>();
  const category = workspace.professional?.primaryCategory ?? '';
  set.add(category === 'facility_admin' || category === 'super_admin' ? 'administration' : 'clinical');
  if (['lab_technologist', 'medical_laboratory_scientist', 'pathologist'].includes(category)) set.add('order_lab');

  const addRaw = (raw: unknown) => {
    if (typeof raw !== 'string') return;
    const base = raw.split(':')[0]?.split('.')[0];
    if (base) set.add(base.toLowerCase());
  };
  for (const permission of workspace.permissions ?? []) {
    addRaw(RESOURCE_TO_CAPABILITY[permission.resource]);
    for (const action of permission.actions ?? []) addRaw(action);
  }

  const roleName = `${category} ${workspace.role?.name ?? ''}`.toLowerCase();
  for (const token of ['prescribe', 'order_lab', 'order_imaging', 'admit', 'discharge', 'sign_off', 'telemedicine', 'research', 'teaching']) {
    if (roleName.includes(token)) set.add(token);
  }
  return [...set];
}

function actorIdOf(workspace: ResolvedWorkspace): AmxUid {
  return workspace.identity?.uid ?? workspace.professional?.uid ?? ('anon' as AmxUid);
}

function toActor(workspace: ResolvedWorkspace, capabilities: string[]): ActorObject {
  const actorId = actorIdOf(workspace);
  const name = workspace.person?.givenName ?? workspace.person?.fullName ?? actorId;
  return {
    actorId,
    personId: actorId,
    name: String(name),
    amxid: `AMX-${actorId}`,
    professionalIdentity: workspace.professional?.primaryCategory,
    administrativeIdentity: undefined,
    capabilities,
    organizations: (workspace.memberships ?? []).map(m => m.organizationName),
  };
}

// ── The adapter engine ─────────────────────────────────────────────────────────

export class DashboardConstitutionalEngine {
  private readonly presentation: PresentationEngine;

  constructor(presentation?: PresentationEngine) {
    this.presentation = presentation ?? new PresentationEngine();
  }

  buildResolutionInput(workspace: ResolvedWorkspace): ResolutionInput {
    const actor = toActor(workspace, capabilityTokens(workspace));
    const organizationChoices: OrganizationChoice[] = (workspace.memberships ?? []).map((m, index) => ({
      organizationId: m.organizationId,
      name: m.organizationName,
      type: m.organizationType ?? 'other',
      isActive: workspace.activeMembership?.id === m.id || (index === 0 && !workspace.activeMembership),
      context: 'manual' as const,
    }));

    const activeOrg = workspace.activeMembership?.organizationId ?? workspace.memberships?.[0]?.organizationId;
    const roles = roleTokens(workspace);
    const employments: EmploymentProfile[] = workspace.employments.length > 0
      ? workspace.employments.map(e => ({
          organizationId: e.organizationId ?? activeOrg ?? 'org',
          departmentId: e.departmentId ?? workspace.department?.id,
          roles,
          rank: workspace.professional?.primaryCategory,
          employmentType: 'permanent' as const,
          reportingStructure: [],
          status: 'active' as const,
        }))
      : [{ organizationId: activeOrg ?? 'org', departmentId: workspace.department?.id, roles, rank: workspace.professional?.primaryCategory, employmentType: 'permanent' as const, reportingStructure: [], status: 'active' as const }];

    const assignment = workspace.activeAssignment;
    const assignmentKind = assignment ? ASSIGNMENT_KIND[assignment.type] : undefined;
    const activeAssignmentContext = assignment && assignmentKind ? {
      id: assignment.id,
      kind: assignmentKind,
      label: assignment.title ?? assignment.type.replace('_', ' '),
      departmentId: workspace.department?.id,
      wardId: workspace.ward?.id,
      startedAt: assignment.startTime,
      endsAt: assignment.endTime,
    } : undefined;

    const prefs = defaultPreferences(actor);
    if (workspace.facility?.config?.language) prefs.language = workspace.facility.config.language;

    const ec = workspace.extendedContext;

    const identity: UniversalIdentity = {
      personId: actor.actorId,
      actorId: actor.actorId,
      amxPer: actor.amxid,
      name: actor.name,
      identities: [],
      licenses: [],
      capabilities: actor.capabilities,
      preferences: {},
    };

    const auth: AuthResult = {
      uid: actor.actorId,
      sessionId: `ws-${actor.actorId}`,
      token: '',
      authenticatedAt: workspace.lastResolvedAt ?? Date.now(),
    };

    return {
      auth,
      identity,
      actor,
      organizationChoices,
      activeOrganizationId: activeOrg,
      employments,
      assignment: activeAssignmentContext,
      capabilities: defaultCapabilities(actor),
      preferences: prefs,
      notificationCount: ec?.notifications?.length ?? 0,
      tasksCount: ec?.tasks?.length ?? 0,
      criticalAlertsCount: ec?.patientContext?.criticalPatients?.length ?? 0,
      hospitalStatus: {
        facility_status: workspace.facility?.status ?? undefined,
        occupancy: workspace.activePatientIds?.length ?? undefined,
      },
    };
  }

  // The single constitutional dashboard resolution path: Workspace → Book VIII.
  resolveConstitutional(workspace: ResolvedWorkspace): ResolverResult<ResolvedDashboard> {
    try {
      const input = this.buildResolutionInput(workspace);
      const dashboard = this.presentation.presentContext(
        this.presentation.resolve(input),
        { intelligence: this.intelligenceFor(workspace) },
      );
      return { data: dashboard, error: null, fromCache: false, resolvedAt: Date.now() };
    } catch (error) {
      return { data: null, error: error as Error, fromCache: false, resolvedAt: Date.now() };
    }
  }

  // Backward-compatible config derived from the single constitutional dashboard.
  buildConfig(workspace: ResolvedWorkspace): ResolverResult<DashboardConfig> {
    const resolved = this.resolveConstitutional(workspace);
    if (resolved.error || !resolved.data) {
      return { data: null, error: resolved.error, fromCache: false, resolvedAt: resolved.resolvedAt };
    }
    const dash = resolved.data;

    const sections: DashboardSection[] = dash.layers.map((layer, i) => ({
      id: layer.id,
      title: layer.label,
      type: SECTION_TYPE[layer.id] ?? 'custom',
      items: [],
      priority: i + 1,
    }));

    const widgets: DashboardWidget[] = dash.workspace.widgets.map((widget, index) => ({
      id: widget.id,
      type: WIDGET_TYPE[widget.type] ?? 'custom',
      title: widget.title,
      config: { ...widget.data, refreshIntervalSeconds: widget.refreshIntervalSeconds, size: widget.size },
      position: widgetPosition(widget, index),
    }));

    const config: DashboardConfig = {
      title: dash.familyLabel,
      greeting: greetingFor(workspace),
      layout: layoutForFamily(dash.familyId),
      sections,
      widgets,
      theme: dash.header.theme === 'system' ? 'auto' : (dash.header.theme as DashboardConfig['theme']),
    };

    return { data: config, error: null, fromCache: false, resolvedAt: resolved.resolvedAt };
  }

  private intelligenceFor(workspace: ResolvedWorkspace) {
    const ec = workspace.extendedContext;
    const items: { id: string; kind: 'alert' | 'task' | 'ai' | 'recommendation' | 'learning' | 'research' | 'protocol' | 'notification'; title: string; priority: 'info' | 'normal' | 'urgent' | 'critical' }[] = [];
    if (ec?.emergency?.active) {
      items.push({ id: 'emergency', kind: 'alert', title: `ACTIVE: ${ec.emergency.title}`, priority: 'critical' });
    }
    for (const notification of ec?.notifications ?? []) {
      items.push({
        id: `n-${notification.id}`,
        kind: notification.type === 'clinical' ? 'alert' : 'notification',
        title: notification.title,
        priority: notification.severity === 'critical' || notification.severity === 'urgent' ? notification.severity : 'normal',
      });
    }
    return items;
  }
}

export const dashboardConstitutionalEngine = new DashboardConstitutionalEngine();