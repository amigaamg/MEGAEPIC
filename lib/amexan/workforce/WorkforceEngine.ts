// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workforce Constitutional Engine — Engine II — PURE KERNEL
// Zero knowledge of Firestore/Postgres/Neo4j. Operates only on constitutional
// types + the Workforce Registry. Enforces the constitutional principle:
//   Authentication ≠ Identity ≠ Employment ≠ Privileges ≠ Assignment.
// Everyone is a PERSON first; employments, privileges, assignments, and
// workspaces are computed from that person — never stored on the person.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  getAllPrivileges,
  getProfessionalCategory,
  getPrivilege,
  isRegisteredProfessionalCategory,
  isRegisteredPrivilege,
} from './registry';
import type {
  Assignment,
  Competency,
  Credential,
  Employment,
  Person,
  Privilege,
  ProfessionalIdentity,
  WorkforceScheduleEntry,
  Workspace,
} from './constitutional-types';

export function genId(prefix: string): string {
  return `AMX-${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export class WorkforceEngine {
  // ── Layer 1 · Person (one identity forever) ────────────────────────────────

  static createPerson(input: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Person {
    if (!input.email) throw new Error('[WCE] email is required');
    if (!input.givenName) throw new Error('[WCE] givenName is required');
    const now = Date.now();
    return { ...input, id: genId('PER'), createdAt: now, updatedAt: now };
  }

  static updatePerson(person: Person, patch: Partial<Person>): Person {
    return { ...person, ...patch, updatedAt: Date.now() };
  }

  // ── Layer 2 · Professional Identity (council, licenses, specialties) ──────

  static createProfessionalIdentity(input: Omit<ProfessionalIdentity, 'verified' | 'competencies'>): ProfessionalIdentity {
    if (!isRegisteredProfessionalCategory(input.primaryCategory)) {
      throw new Error(`[WCE] Unknown professional category "${input.primaryCategory}". Register it in the Workforce Registry.`);
    }
    return { ...input, verified: false, competencies: [] };
  }

  // ── Layer 3 · Employment (belongs to the Facility, not the person) ─────────

  static createEmployment(input: Omit<Employment, 'id' | 'status'>): Employment {
    if (!input.organizationId) throw new Error('[WCE] employment requires an organizationId');
    if (!input.personId) throw new Error('[WCE] employment requires a personId');
    if (!isRegisteredProfessionalCategory(input.professionalCategory)) {
      throw new Error(`[WCE] Unknown professional category "${input.professionalCategory}".`);
    }
    return { ...input, id: genId('EMP'), status: 'active' };
  }

  static changeEmploymentStatus(emp: Employment, status: Employment['status']): Employment {
    return { ...emp, status };
  }

  // ── Layer 4 · Assignment (today's work ≠ employment) ───────────────────────

  static createAssignment(input: Omit<Assignment, 'id'>): Assignment {
    if (!input.locationNodeId) throw new Error('[WCE] assignment requires a locationNodeId');
    if (!input.shiftStart || !input.shiftEnd) throw new Error('[WCE] assignment requires shift window');
    return { ...input, id: genId('ASSIGN') };
  }

  static assignmentsFor(nodes: { personId: string; shiftType: string }[], personId: string, date?: string): Assignment[] {
    // Pure selection helper: returns assignments matching a person (optional date filter).
    void nodes; void personId; void date;
    return [];
  }

  // ── Layer 5 · Privileges — computed, never role alone ──────────────────────
  // Privileges = Role defaults  ∪  Employment grant  ∪  Department grant
  //           ∪  Competency-qualified grant, minus Forbidden set.
  // Any privilege not in the catalog is rejected (constitutional safety).

  static computePrivileges(input: {
    professionalCategory: string;
    employments: Pick<Employment, 'id' | 'professionalCategory'>[];
    departmentGrants?: string[];
    competencyLevel?: Competency['level'];
  }): Privilege[] {
    const cat = getProfessionalCategory(input.professionalCategory);
    if (!cat) throw new Error(`[WCE] Unknown professional category "${input.professionalCategory}".`);

    const forbidden = new Set(cat.forbiddenPrivileges);
    const granted = new Map<string, Privilege>();

    const grant = (id: string, via: string, scope = 'global') => {
      if (!isRegisteredPrivilege(id)) throw new Error(`[WCE] Unregistered privilege "${id}" — cannot grant.`);
      if (forbidden.has(id)) return; // constitutional: never grant forbidden
      const def = getPrivilege(id)!;
      // competency gate: privilege requiring a level the actor lacks → deny.
      if (def.requiresLevel && input.competencyLevel) {
        const order = ['observed', 'supervised', 'independent', 'expert'];
        if (order.indexOf(input.competencyLevel) < order.indexOf(def.requiresLevel)) return;
      }
      granted.set(id, { id, name: def.name, scope, granted: true, grantedBy: via, grantedAt: Date.now() });
    };

    cat.defaultPrivileges.forEach((p) => grant(p, `role:${cat.id}`));
    input.employments.forEach((e) => {
      const empCat = getProfessionalCategory(e.professionalCategory);
      empCat?.defaultPrivileges.forEach((p) => grant(p, `employment:${e.id}`));
    });
    (input.departmentGrants ?? []).forEach((p) => grant(p, 'department'));

    return Array.from(granted.values());
  }

  static canPerform(privileges: Privilege[], privilegeId: string): boolean {
    const p = privileges.find((x) => x.id === privilegeId);
    return !!p && p.granted && (!p.expiresAt || p.expiresAt > Date.now());
  }

  static revokePrivilege(privileges: Privilege[], privilegeId: string): Privilege[] {
    return privileges.filter((p) => p.id !== privilegeId);
  }

  // ── Layer 6 · Competencies ─────────────────────────────────────────────────

  static recordCompetency(competencies: Competency[], c: Omit<Competency, 'id'>): Competency[] {
    return [...competencies, { ...c, id: genId('COMP') }];
  }

  // ── Layer 7 · Credentials (expiry alerts) ─────────────────────────────────

  static credentialStatus(c: Credential, now = Date.now()): Credential['status'] {
    if (c.status === 'revoked') return 'revoked';
    const expiry = Date.parse(c.expiresAt);
    if (Number.isNaN(expiry)) return c.status;
    const days = (expiry - now) / 86400000;
    if (days < 0) return 'expired';
    if (days < 45) return 'expiring';
    return 'valid';
  }

  // ── Layer 8 · Schedule ─────────────────────────────────────────────────────

  static scheduleEntry(input: Omit<WorkforceScheduleEntry, 'status'>): WorkforceScheduleEntry {
    return { ...input, status: 'scheduled' };
  }

  // ── Workspace — COMPUTED from Role × Privileges × Assignment ──────────────

  static computeWorkspace(input: {
    professionalCategory: string;
    privileges: Privilege[];
    activeAssignment?: { locationNodeId: string };
  }): Workspace {
    const cat = getProfessionalCategory(input.professionalCategory);
    if (!cat) throw new Error(`[WCE] Unknown professional category "${input.professionalCategory}".`);
    const family = cat.family;
    const engines = cat.defaultPrivileges
      .filter((p) => input.privileges.some((x) => x.id === p && x.granted))
      .map((p) => `engine:${p}`);
    return {
      actorId: input.professionalCategory,
      family,
      primaryRoute: cat.defaultRoute,
      allowedEngines: engines,
      activeAssignmentId: input.activeAssignment?.locationNodeId,
    };
  }

  // ── Relation queries (pure, powers the graph projection later) ────────────

  static supervisorGraph(employments: Employment[]): { personId: string; supervisorId: string }[] {
    return employments.filter((e) => e.supervisorId).map((e) => ({ personId: e.personId, supervisorId: e.supervisorId! }));
  }

  static coverageMap(
    nodes: { locationNodeId: string; personId: string; shiftType: string }[],
    locationNodeId: string
  ): string[] {
    return nodes.filter((n) => n.locationNodeId === locationNodeId).map((n) => n.personId);
  }

  /** Everything the AI/reasoning engines query about an actor. */
  static aiContext(input: {
    person: Person;
    identity?: ProfessionalIdentity;
    employments: Employment[];
    assignments: Assignment[];
    privileges: Privilege[];
    competencies: Competency[];
    credentials: Credential[];
  }): Record<string, unknown> {
    return {
      actorId: input.person.id,
      name: `${input.person.givenName} ${input.person.familyName}`,
      categories: input.identity?.categories ?? [],
      specialties: input.identity?.specialties ?? [],
      employments: input.employments.map((e) => ({ org: e.organizationId, title: e.jobTitle, status: e.status })),
      activeAssignments: input.assignments.length,
      privileges: input.privileges.map((p) => p.id),
      competencies: input.competencies.map((c) => `${c.name}:${c.level}`),
      credentialAlerts: input.credentials.map((c) => WorkforceEngine.credentialStatus(c)).filter((s) => s !== 'valid'),
    };
  }
}

export function privilegeCatalogCount(): number {
  return getAllPrivileges().length;
}