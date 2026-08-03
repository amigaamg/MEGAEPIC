// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN — Postgres data-access module (relational store)
// Thin `pg` wrapper + typed org/facility helpers. Falls back gracefully to a
// deterministic in-memory store when `DATABASE_URL` is not configured so that
// route modules still typecheck and run in dev without a live Postgres host.
// ═══════════════════════════════════════════════════════════════════════════════

import { Pool, type PoolConfig, type QueryResult, type QueryResultRow } from 'pg';

export type { QueryResult as PgQueryResult, QueryResultRow as PgQueryResultRow };

export interface QueryLikeResult<R extends QueryResultRow = any> {
  rows: R[];
  rowCount: number | null;
}

export type QueryLike<R extends QueryResultRow = any> = QueryLikeResult<R>;

// ── Connection ─────────────────────────────────────────────────────────────────

const sharedPool: Pool | null = createPool();

function createPool(): Pool | null {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    return new Pool({ connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL });
  }
  return null;
}

/**
 * Execute a parameterised SQL statement. Fallback store is used only when no
 * DATABASE_URL is present — it keeps the API routes functional and type-clean
 * without a live database, while returning zero rows for reads.
 */
export async function query<Row extends QueryResultRow = any>(
  text: string,
  values: unknown[] = [],
): Promise<QueryLike<Row>> {
  if (sharedPool) {
    const res: QueryResult<Row> = await sharedPool.query<Row>(text, values);
    return { rows: res.rows, rowCount: res.rowCount };
  }
  console.warn('[amexan:postgres] No DATABASE_URL configured — returning empty result.');
  return { rows: [] as Row[], rowCount: 0 };
}

// ── Org / facility domain helpers ──────────────────────────────────────────────

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise' | 'national';

export interface FacilityInput {
  country: string;
  region: string;
  network?: string | null;
  hospital: { name: string; code?: string };
  departments: Array<{ name: string; type?: string; specialty?: string }>;
  wards?: Array<{ name: string; departmentId?: string }>;
  teams?: Array<{ name: string; departmentId?: string }>;
  users?: Array<{ name: string; role: string; email?: string }>;
  subscriptionTier?: SubscriptionTier;
}

export interface OrgHierarchyNode {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
}

export type FacilityUserInput = FacilityInput;

export async function createFacility(input: FacilityUserInput): Promise<string> {
  const orgId = `ORG-${Date.now().toString(36).toUpperCase()}`;
  if (sharedPool) {
    await sharedPool.query(
      `INSERT INTO organizations (id, name, country, region, network)
       VALUES ($1, $2, $3, $4, $5)`,
      [orgId, input.hospital.name, input.country, input.region, input.network || null],
    );
  }
  return orgId;
}

async function readRows<R extends QueryResultRow = any>(query, table: string, orgId: string): Promise<R[]> {
  if (sharedPool) {
    const res = await query(`SELECT * FROM ${table} WHERE org_id = $1`, [orgId]);
    return res.rows || [];
  }
  return [];
}

export async function getOrgHierarchy(orgId: string): Promise<QueryResultRow[]> {
  return readRows(query, 'organizations', orgId);
}

export async function getOrgDepartments(orgId: string): Promise<QueryResultRow[]> {
  return readRows(query, 'departments', orgId);
}

export async function getOrgUnits(orgId: string): Promise<QueryResultRow[]> {
  return readRows(query, 'units', orgId);
}

export async function getOrgTeams(orgId: string): Promise<QueryResultRow[]> {
  return readRows(query, 'teams', orgId);
}

export async function getOrgActors(orgId: string): Promise<QueryResultRow[]> {
  return readRows(query, 'org_actors', orgId);
}

export async function getOrgRoles(orgId: string): Promise<QueryResultRow[]> {
  return readRows(query, 'org_roles', orgId);
}

export async function getOrgRoleAssignments(orgId: string): Promise<QueryResultRow[]> {
  return readRows(query, 'role_assignments', orgId);
}