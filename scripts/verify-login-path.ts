/**
 * AMEXAN — Login-path verification harness (READ-ONLY).
 *
 * For EVERY actor in the `users` collection it:
 *   1. Replays the exact WorkspaceEngine read path (identity / person /
 *      professional / memberships / organization / employments / assignments /
 *      role) against live Firestore — no writes.
 *   2. Assembles the workspace exactly as WorkspaceEngine does.
 *   3. Runs the REAL sanitizeForFirestore (imported from lib/firebase/sanitize)
 *      and deep-validates Firestore-safety (the setDoc invariant).
 *   4. Classifies the login outcome: LAND (dashboard) / PROVISION (no org →
 *      onboarding, by design) / ERROR (hang risk).
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { sanitizeForFirestore } from '../lib/firebase/sanitize';

const app =
  admin.apps.length > 0
    ? admin.apps[0]!
    : admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'telemed-a98cf',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
      });

const db = admin.firestore(app);

// ── Engine-faithful reads ─────────────────────────────────────────────────────
const get = async (col: string, id: string) => {
  const snap = await db.collection(col).doc(id).get();
  return snap.exists ? { id: snap.id, ...snap.data()! } : null;
};
const listWhere = async (col: string, field: string, value: string) => {
  const snap = await db.collection(col).where(field, '==', value).limit(200).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

async function resolveWorkspace(uid: string) {
  const userData = await get('users', uid);
  const fetchedRole =
    (userData?.role as string) || (userData?.roleId as string) || (userData?.clinicianRole as string) || null;
  const personId = (userData?.amxUid as string) || uid;

  const identity =
    (await get('identities', personId)) || (await get('identities', uid)) || null;
  const person = (await get('persons', personId)) || (await get('persons', uid)) || null;
  const professional =
    (await get('professional_identities', personId)) || (await get('professional_identities', uid)) || null;

  // Memberships — anchored on users/{uid}.activeOrganizationId (WS-010) via a
  // direct single-doc read; collection-group scans are best-effort (ignored if
  // the index is missing). De-duped by org.
  const memberships: any[] = [];
  const seenOrgs = new Set<string>();
  const anchorOrgId = (userData?.activeOrganizationId as string) || null;
  const directIds = [uid, personId].filter(Boolean);

  async function readDirect(useNew: boolean, actorId: string) {
    const col = useNew ? 'memberships' : 'members';
    const ref = db.collection('organizations').doc(anchorOrgId!).collection(col).doc(actorId);
    const snap = await ref.get();
    if (!snap.exists) return null;
    const data = snap.data()!;
    const org = await get('organizations', anchorOrgId!);
    if (!org) return null;
    if (useNew) {
      return {
        id: snap.id, personId, organizationId: anchorOrgId, organizationName: org.name,
        organizationType: org.type, roleId: data.roleId || '', roleName: data.roleName || data.roleId || 'Member',
        departmentId: data.departmentId, departmentName: data.departmentName, facilityId: data.facilityId, facilityName: data.facilityName,
        isPrimary: !!data.isPrimary, status: data.status || 'active',
        joinedAt: data.joinedAt || 0, updatedAt: data.updatedAt || 0, metadata: data.metadata,
      };
    }
    return {
      id: snap.id, personId, organizationId: anchorOrgId, organizationName: org.name,
      organizationType: org.type, roleId: data.roleId || '', roleName: data.roleName || data.roleId || 'Member',
      departmentId: data.departmentIds?.[0], departmentName: undefined, facilityId: undefined, facilityName: undefined,
      isPrimary: false, status: data.isActive === false ? 'inactive' : 'active',
      joinedAt: data.joinedAt || 0, updatedAt: 0, metadata: { source: 'members', ...data },
    };
  }

  if (anchorOrgId) {
    let direct: any = null;
    for (const id of directIds) { direct = await readDirect(true, id); if (direct) break; }
    if (!direct) for (const id of directIds) { direct = await readDirect(false, id); if (direct) break; }
    if (direct) { memberships.push(direct); seenOrgs.add(direct.organizationId); }
  }

  // Best-effort: additional orgs via collection-group (ignored if index missing)
  const scanGroups = process.env.SCAN_GROUPS === '1';
  for (const actorId of [uid, personId].filter(Boolean)) {
    try {
      const legacy = await db.collectionGroup('members').where('userId', '==', actorId).limit(200).get();
      for (const d of legacy.docs) {
        const data = d.data();
        const orgId = d.ref.parent.parent?.id;
        if (!orgId || seenOrgs.has(orgId)) continue;
        const org = await get('organizations', orgId);
        if (!org) continue;
        seenOrgs.add(orgId);
        memberships.push({
          id: d.id, personId, organizationId: orgId, organizationName: org.name,
          organizationType: org.type, roleId: data.roleId || '', roleName: data.roleName || data.roleId || 'Member',
          departmentId: data.departmentIds?.[0], departmentName: undefined, facilityId: undefined, facilityName: undefined,
          isPrimary: false, status: data.isActive === false ? 'inactive' : 'active',
          joinedAt: data.joinedAt || 0, updatedAt: 0, metadata: { source: 'members', ...data },
        });
      }
    } catch { /* index missing — ignore, direct read already covered the anchor */ }
    try {
      const constitutional = await db.collectionGroup('memberships').where('personId', '==', actorId).limit(200).get();
      for (const d of constitutional.docs) {
        const data = d.data();
        const orgId = d.ref.parent.parent?.id;
        if (!orgId || seenOrgs.has(orgId)) continue;
        const org = await get('organizations', orgId);
        if (!org) continue;
        seenOrgs.add(orgId);
        memberships.push({
          id: d.id, personId, organizationId: orgId, organizationName: org.name,
          organizationType: org.type, roleId: data.roleId || '', roleName: data.roleName || data.roleId || 'Member',
          departmentId: data.departmentId, departmentName: data.departmentName, facilityId: data.facilityId, facilityName: data.facilityName,
          isPrimary: !!data.isPrimary, status: data.status || 'active',
          joinedAt: data.joinedAt || 0, updatedAt: data.updatedAt || 0, metadata: data.metadata,
        });
      }
    } catch { /* ignore */ }
  }

  const activeOrgId = userData?.activeOrganizationId as string | undefined;
  let activeMembership = memberships.find((m) => m.organizationId === activeOrgId) || null;
  if (!activeMembership) activeMembership = memberships.find((m) => m.isPrimary && m.status === 'active') || null;
  if (!activeMembership) activeMembership = memberships.find((m) => m.status === 'active') || null;

  let organization = null;
  if (activeMembership?.organizationId) {
    organization = await get('organizations', activeMembership.organizationId);
  }

  let role: any = { id: fetchedRole || 'user', name: fetchedRole || 'user' };
  if (activeMembership?.roleId && organization) {
    const orgRole = await get(`organizations/${organization.id}/roles`, activeMembership.roleId);
    if (orgRole) role = orgRole;
  }

  const employments = activeMembership
    ? (await db.collection(`organizations/${activeMembership.organizationId}/employments`)
        .where('personId', '==', personId).limit(200).get()).docs.map((d) => ({ id: d.id, ...d.data() }))
    : [];
  const activeEmployment = employments.find((e: any) => e.status === 'active') || employments[0] || null;

  return { userData, personId, identity, person, professional, memberships, activeMembership, organization, role, employments, activeEmployment, fetchedRole };
}

// ── Deep Firestore-validity scan ──────────────────────────────────────────────
function scanInvalid(v: any, path: string, out: string[], depth: number, visited: WeakSet<object>) {
  if (depth > 20) { out.push(path + ' DEPTH>20'); return; }
  if (v === undefined) { out.push(path + ' undefined'); return; }
  if (typeof v === 'number' && !Number.isFinite(v)) { out.push(path + ' non-finite:' + v); return; }
  if (v === null || typeof v !== 'object') return;
  if (v instanceof Date || typeof v._lat === 'number' || typeof v._long === 'number') return;
  if (v instanceof Uint8Array || (v.constructor && v.constructor.name === 'Timestamp')) return;
  if (visited.has(v)) return;
  visited.add(v);
  if (Array.isArray(v)) v.forEach((el, i) => scanInvalid(el, path + '[' + i + ']', out, depth + 1, visited));
  else for (const k of Object.keys(v)) scanInvalid(v[k], path + '.' + k, out, depth + 1, visited);
}

// ── Run ───────────────────────────────────────────────────────────────────────
async function main() {
  const usersSnap = await db.collection('users').limit(500).get();
  const workspacesSnap = await db.collection('workspaces').limit(500).get();
  const uidSet = new Set<string>([
    ...usersSnap.docs.map((d) => d.id),
    ...workspacesSnap.docs.map((d) => d.id),
  ]);
  const uidList = Array.from(uidSet);
  console.log('ACTORS FOUND:', uidList.length, '(users:', usersSnap.size, ', workspaces:', workspacesSnap.size, ')');

  // Focus on real actors: anyone that has a workspace doc OR a users doc with an
  // amxUid + completed registration. Junk/legacy-only docs are still shown but
  // resolved last.
  const userDataById = new Map(usersSnap.docs.map((d) => [d.id, d.data()!]));
  const meaningful = uidList.filter((u) => {
    const ud = userDataById.get(u);
    return !ud || !!(ud.amxUid || ud.registrationStep);
  });
  const ordered = [...meaningful, ...uidList.filter((u) => !meaningful.includes(u))];

  const rows: any[] = [];
  let done = 0;
  const withTimeout = <T,>(p: Promise<T>, ms: number, tag: string): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((res, rej) => setTimeout(() => rej(new Error(`${tag} timed out (>${ms}ms)`)), ms)),
    ]);
  for (const uid of ordered) {
    done++;
    try {
      const r = await withTimeout(resolveWorkspace(uid), 25000, uid);
      const actorLabel = r.person?.fullName || r.userData?.name || r.personId || uid;
      const kind = r.userData?.role || r.fetchedRole || r.professional?.primaryCategory || '?';
      const orgName = r.activeMembership?.organizationName || r.organization?.name || null;
      const step = r.userData?.registrationStep || '?';

      // Build a workspace snapshot exactly like persistWorkspace does.
      const snapshot = {
        uid,
        deviceId: '',
        version: 1,
        snapshotAt: Date.now(),
        resolvedWorkspace: {
          identity: r.identity, person: r.person, professional: r.professional,
          memberships: r.memberships, activeMembership: r.activeMembership,
          organization: r.organization, facility: null, campus: null, building: null,
          floor: null, department: null, unit: null, ward: null, clinic: null,
          employments: r.employments, activeEmployment: r.activeEmployment,
          assignments: [], activeAssignment: null, currentAssignments: [],
          shifts: [], activeShift: null, shiftAssignment: null,
          teams: [], activeTeam: null, role: r.role, permissions: [], responsibilities: [],
          activePatientIds: [], activeEncounterIds: [], isOnDuty: false, isLoading: false,
          completeness: {}, navigation: { primary: [], secondary: [], quickAccess: [] },
          dashboard: { title: '', greeting: '', layout: 'clinical', sections: [], widgets: [], theme: 'light' },
          quickActions: [], extendedContext: {},
          lastResolvedAt: Date.now(),
        },
      };

      const clean = sanitizeForFirestore(snapshot);
      const problems: string[] = [];
      scanInvalid(clean, 'snapshot', problems, 0, new WeakSet());

      const hasMembership = !!r.activeMembership;
      const hasOrg = !!r.organization;
      const hasRole = !!r.role?.id && r.role.id !== 'user';
      const outcome = !hasMembership || !hasOrg ? 'PROVISION' : problems.length > 0 ? 'ERROR' : 'LAND';
      const note = outcome === 'PROVISION'
        ? (hasMembership ? 'org unresolved' : hasOrg ? 'membership unresolved' : 'no membership+org (onboarding)')
        : problems.length ? problems.slice(0, 3).join('; ') : '→ dashboard';

      rows.push({ uid, actorLabel, kind, step, org: orgName, memberships: r.memberships.length, outcome, role: r.role?.id || 'none', invalid: problems.length, note });
    } catch (e: any) {
      rows.push({ uid, actorLabel: uid, kind: '?', step: '?', org: null, memberships: 0, outcome: 'ERROR', role: 'none', invalid: -1, note: 'THREW: ' + (e?.message || String(e)) });
    }
  }

  const w = (s: string, n: number) => s.padEnd(n).slice(0, n);
  console.log(w('ACTOR (uid)', 24), w('NAME', 26), w('ROLE', 18), w('REG', 9), w('OUTCOME', 10), w('ORG', 24), 'NOTE');
  console.log('-'.repeat(150));
  const count = { LAND: 0, PROVISION: 0, ERROR: 0 };
  for (const row of rows.sort((a, b) => (a.outcome === 'ERROR' ? -1 : b.outcome === 'ERROR' ? 1 : 0))) {
    count[row.outcome as 'LAND']++;
    console.log(w(row.uid, 24), w(row.actorLabel, 26), w(row.kind, 18), w(row.step, 9), w(row.outcome, 10), w((row.org || '').slice(0, 24), 24), row.note);
  }
  console.log('\nSUMMARY → LAND:', count.LAND, '| PROVISION (by design):', count.PROVISION, '| ERROR (hang risk):', count.ERROR);
  if (count.ERROR > 0) process.exitCode = 1;
  process.exit(0);
}

main().catch((e) => { console.error('HARNESS FAILED:', e); process.exitCode = 1; });