// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workspace Guard (Book XV, WS-011..WS-016)
//
// The WorkspaceMismatchError + role-family guard that makes it IMPOSSIBLE for an
// actor to land on the wrong dashboard by design. Every renderable page declares
// `SupportedRoles` (a list of role families it may render). The guard compares
// the actor's resolved role family against that declaration and, on a mismatch,
// raises WorkspaceMismatchError, logs it, and (in UI code) redirects.
//
//  render-flow:
//    DashboardResolver (WS-012/013)  → resolves the actor's workspace
//    → role family                   → the dashboards that may render it
//    → <WorkspaceGuard supportedRoles=... />  (WS-014/015/016)
//    → render | WorkspaceMismatchError → redirect
//
// This is LAW, not convention. No page bypasses it.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The constitutional role families. A dashboard family owns exactly one of these;
 * a page declares the families it may render. Values mirror Book VIII families.
 */
export type WorkspaceFamily =
  | 'executive'        // Facility / Sub / National / Regional administrators
  | 'clinical_leadership'
  | 'department'       // Department heads, ward in-charge
  | 'clinical'         // doctors, consultants, residents, medical officers
  | 'nursing'
  | 'pharmacy'
  | 'laboratory'
  | 'radiology'
  | 'finance'
  | 'hr'
  | 'ict'
  | 'research'
  | 'teaching'
  | 'telemedicine'
  | 'community_health'
  | 'patient';

export type SupportedRoles = readonly WorkspaceFamily[];

/**
 * Raised when an authenticated actor's resolved role family does not match the
 * dashboard/component they tried to render. Per WS-012/WS-014/WS-015/WS-016 this
 * is a hard error: log it, redirect, never continue rendering.
 */
export class WorkspaceMismatchError extends Error {
  readonly role: string;
  readonly family: WorkspaceFamily | null;
  readonly supportedRoles: readonly WorkspaceFamily[];
  constructor(role: string, family: WorkspaceFamily | null, supportedRoles: readonly WorkspaceFamily[]) {
    super(
      `WorkspaceMismatchError: role "${role}" resolved to family "${family ?? 'none'}", ` +
      `which cannot render ${supportedRoles.join(', ')}. (WS-014/WS-015/WS-016)`,
    );
    this.name = 'WorkspaceMismatchError';
    this.role = role;
    this.family = family;
    this.supportedRoles = supportedRoles;
  }
}

// ── Category → family mapping (single source of truth for the guard) ──────────
// Mirrors the WorkspaceEngine role-family table (which feeds the facility_admin
// resolution) plus the Book VIII family vocabulary.

const CATEGORY_FAMILY: Readonly<Record<string, WorkspaceFamily>> = {
  facility_admin: 'executive',
  facility_administrator: 'executive',
  super_admin: 'executive',
  administrator: 'executive',
  hospital_admin: 'executive',
  hospital_director: 'executive',
  medical_superintendent: 'executive',
  county_director: 'executive',
  regional_director: 'executive',
  national_director: 'executive',
  medical_director: 'clinical_leadership',
  nursing_director: 'clinical_leadership',
  department_head: 'department',
  ward_in_charge: 'department',
  ward_manager: 'department',
  medical_doctor: 'clinical',
  consultant: 'clinical',
  specialist: 'clinical',
  clinical_officer: 'clinical',
  resident: 'clinical',
  registrar: 'clinical',
  intern: 'clinical',
  medical_officer: 'clinical',
  surgeon: 'clinical',
  anaesthetist: 'clinical',
  dentist: 'clinical',
  nurse: 'nursing',
  enrolled_nurse: 'nursing',
  midwife: 'nursing',
  pharmacist: 'pharmacy',
  chief_pharmacist: 'pharmacy',
  pharmacy_technologist: 'pharmacy',
  lab_technologist: 'laboratory',
  medical_laboratory_scientist: 'laboratory',
  pathologist: 'laboratory',
  radiographer: 'radiology',
  radiologist: 'radiology',
  sonographer: 'radiology',
  finance_staff: 'finance',
  insurance_officer: 'finance',
  finance_officer: 'finance',
  billing_officer: 'finance',
  finance: 'finance',
  hr_staff: 'hr',
  hr_officer: 'hr',
  hr: 'hr',
  it_staff: 'ict',
  ict_officer: 'ict',
  ict: 'ict',
  researcher: 'research',
  biostatistician: 'research',
  study_coordinator: 'research',
  educator: 'teaching',
  medical_student: 'teaching',
  nursing_student: 'teaching',
  pharmacy_student: 'teaching',
  student: 'teaching',
  telemedicine_officer: 'telemedicine',
  community_health_officer: 'community_health',
  outreach_officer: 'community_health',
  patient: 'patient',
  guardian: 'patient',
};

const FAMILY_ALIASES: Readonly<Record<string, WorkspaceFamily>> = {
  administrative: 'executive',
  admin: 'executive',
  executive: 'executive',
  leadership: 'clinical_leadership',
  clinical_leadership: 'clinical_leadership',
  department: 'department',
  ward: 'department',
  clinical: 'clinical',
  doctor: 'clinical',
  physician: 'clinical',
  nursing: 'nursing',
  pharmacy: 'pharmacy',
  laboratory: 'laboratory',
  lab: 'laboratory',
  radiology: 'radiology',
  imaging: 'radiology',
  finance: 'finance',
  hr: 'hr',
  human_resources: 'hr',
  ict: 'ict',
  it: 'ict',
  research: 'research',
  teaching: 'teaching',
  education: 'teaching',
  telemedicine: 'telemedicine',
  community_health: 'community_health',
  patient: 'patient',
};

/**
 * Resolve the constitutional family for an actor from their professional category
 * and role name. The family is the antecedent of the (single) dashboard family an
 * actor may render (WS-013). Returns null for unknown categories (guards treat
 * null as a mismatch — WS-016).
 */
export function resolveFamily(
  category: string | null | undefined,
  roleName?: string | null,
): WorkspaceFamily | null {
  if (!category) return null;
  const direct = CATEGORY_FAMILY[category];
  if (direct) return direct;
  const normalized = category.toLowerCase().replace(/\s+/g, '_');
  if (FAMILY_ALIASES[normalized]) return FAMILY_ALIASES[normalized];
  if (roleName) {
    const nameNorm = roleName.toLowerCase().replace(/\s+/g, '_');
    if (FAMILY_ALIASES[nameNorm]) return FAMILY_ALIASES[nameNorm];
  }
  return null;
}

/**
 * Pure guard: asserts a resolved family may render a page declaring `supportedRoles`.
 * Returns null when allowed; returns a WorkspaceMismatchError when not.
 * Logging/redirect is the caller's responsibility (UI adds the redirect).
 */
export function guardFamily(
  category: string | null | undefined,
  roleName: string | null | undefined,
  supportedRoles: SupportedRoles,
): WorkspaceMismatchError | null {
  const family = resolveFamily(category, roleName);
  if (family === null) {
    return new WorkspaceMismatchError(category ?? 'unknown', null, supportedRoles);
  }
  if (supportedRoles.includes(family)) return null;
  return new WorkspaceMismatchError(category ?? 'unknown', family, supportedRoles);
}

export interface WorkspaceGuardResult {
  ok: boolean;
  family: WorkspaceFamily | null;
  error: WorkspaceMismatchError | null;
  redirectTo: string | null;
}

/**
 * Convenience for server/test flows: return a structured outcome without throwing.
 */
export function guardWorkspace(
  category: string | null | undefined,
  roleName?: string | null,
  supportedRoles?: SupportedRoles,
): WorkspaceGuardResult {
  const family = resolveFamily(category, roleName);
  const supported = supportedRoles ?? [];
  const error = family !== null && supported.length > 0 && !supported.includes(family)
    ? new WorkspaceMismatchError(category ?? 'unknown', family, supported)
    : null;
  const ok = error === null;
  return { ok, family, error, redirectTo: ok ? null : familyRedirect(family) };
}

/**
 * Where a mismatched actor should be redirected. Executive family must land in
 * the Facility Administration Command Center; clinical roles land in the
 * workspace resolver / dashboard.
 */
export function familyRedirect(family: WorkspaceFamily | null): string {
  if (family === 'executive') return '/facility-admin';
  if (
    family === 'nursing' || family === 'pharmacy' || family === 'laboratory' ||
    family === 'radiology' || family === 'clinical' || family === 'department'
  ) {
    return '/workspace';
  }
  if (family === 'patient') return '/dashboard/patient';
  return '/dashboard';
}

/**
 * Post-login destination for a role name. Executives land directly in the
 * Facility Administration Command Center (no /dashboard bounce); clinical
 * support families go to the workspace resolver; everyone else to /dashboard.
 */
export function loginRedirectForRole(role: string | null | undefined): string {
  const family = resolveFamily(role ?? null, role ?? null);
  return family ? familyRedirect(family) : '/dashboard';
}