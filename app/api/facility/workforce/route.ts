import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';
import type { WorkspaceFamily } from '@/lib/amexan/workspace/WorkspaceGuard';

/**
 * Facility Administrator Workforce Provisioning (Book V § Workforce).
 *
 * POST  /api/facility/workforce  — create staff accounts. Each staff row becomes a
 *   real Firebase Auth login + a full Firestore identity/profile/membership/
 *   employment/assignment/actor chain. The chosen role fixes the constitutional
 *   family, which the WorkspaceGuard (Book XV) uses to route each new account to
 *   its own dashboard/workflow. Also writes activation-link records so the staff
 *   can be sent login links.
 *   Body: { orgId, facilityId, staff: [{ fullName, email?, phone?, role, department?, departmentId? }] }
 *   → returns created accounts incl. uid, amxUid, email, family, and the guard route.
 *
 * GET  /api/facility/workforce?orgId=…  — list provisioned staff with role + route.
 *
 * PATCH /api/facility/workforce  — reassign a staff member's role (Sub-Admin
 *   delegation). Body: { orgId, uid, newRole, departmentId? }.
 */

const ROLE_FAMILY: Record<string, WorkspaceFamily> = {
  facility_administrator: 'executive',
  facility_admin: 'executive',
  hospital_admin: 'executive',
  hospital_director: 'executive',
  medical_superintendent: 'executive',
  county_director: 'executive',
  regional_director: 'executive',
  national_director: 'executive',
  department_head: 'department',
  unit_head: 'department',
  section_lead: 'department',
  ward_in_charge: 'department',
  ward_manager: 'department',
  consultant: 'clinical',
  specialist: 'clinical',
  medical_officer: 'clinical',
  clinical_officer: 'clinical',
  resident: 'clinical',
  registrar: 'clinical',
  intern: 'clinical',
  surgeon: 'clinical',
  anaesthetist: 'clinical',
  dentist: 'clinical',
  medical_doctor: 'clinical',
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
  finance_officer: 'finance',
  insurance_officer: 'finance',
  billing_officer: 'finance',
  hr_officer: 'hr',
  recruitment_officer: 'hr',
  ict_officer: 'ict',
  researcher: 'research',
  biostatistician: 'research',
  study_coordinator: 'research',
  medical_student: 'teaching',
  nursing_student: 'teaching',
  pharmacy_student: 'teaching',
  student: 'teaching',
  telemedicine_officer: 'telemedicine',
  community_health_officer: 'community_health',
  outreach_officer: 'community_health',
  patient: 'patient',
};

const FAMILY_ROUTE: Record<WorkspaceFamily, string> = {
  executive: '/facility-admin',
  clinical_leadership: '/dashboard',
  department: '/workspace',
  clinical: '/workspace',
  nursing: '/workspace',
  pharmacy: '/workspace',
  laboratory: '/workspace',
  radiology: '/workspace',
  finance: '/dashboard',
  hr: '/dashboard',
  ict: '/dashboard',
  research: '/dashboard',
  teaching: '/dashboard',
  telemedicine: '/dashboard',
  community_health: '/dashboard',
  patient: '/dashboard/patient',
};

export const FACILITY_STAFF_ROLES = Object.keys(ROLE_FAMILY) as string[];

function ensureEmail(name: string, role: string, index: number, orgId: string, provided?: string): string {
  if (provided?.includes('@')) return provided.trim();
  const base = name.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '') || role;
  const org = orgId.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `${base}${index > 0 ? index : ''}@staff.${org}.amexan`;
}

function generatePassword(): string {
  return `Facility${Math.floor(100000 + Math.random() * 900000)}`;
}

function genAmxUid(prefix: string): string {
  return `AMX-${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, staff } = body as {
      orgId?: string;
      staff?: { fullName: string; email?: string; phone?: string; role: string; department?: string; departmentId?: string }[];
    };

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }
    if (!Array.isArray(staff) || staff.length === 0) {
      return NextResponse.json({ error: 'staff must be a non-empty array' }, { status: 400 });
    }

    const auth = getAdminAuth();
    const db = getAdminDb();
    const now = Date.now();
    const created: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < staff.length; i++) {
      const s = staff[i];
      const role = s.role;
      if (!ROLE_FAMILY[role]) {
        errors.push(`Unknown role "${role}"`);
        continue;
      }
      const fullName = s.fullName?.trim() || `New Staff ${i + 1}`;
      const email = ensureEmail(fullName, role, i, orgId, s.email);
      const family = ROLE_FAMILY[role];
      const route = FAMILY_ROUTE[family];

      try {
        let uid: string;
        let isNew = false;
        const existing = await auth.getUserByEmail(email).catch(() => null);
        if (existing) {
          uid = existing.uid;
        } else {
          const rec = await auth.createUser({
            email,
            password: generatePassword(),
            displayName: fullName,
            emailVerified: true,
          });
          uid = rec.uid;
          isNew = true;
        }

        const amxUid = genAmxUid('PERSON');
        const departmentId = s.departmentId || s.department || '';

        const batch = db.batch();

        batch.set(db.doc(`users/${uid}`), {
          amxUid, email, name: fullName, role,
          registrationStep: 'complete',
          workspaceChoice: 'organization',
          activeOrganizationId: orgId,
          emailVerified: true, approved: true,
          createdAt: now, updatedAt: now,
        }, { merge: true });

        batch.set(db.doc(`identities/${amxUid}`), {
          uid: amxUid, email, phone: s.phone || '',
          createdAt: now, updatedAt: now, lastLoginAt: now,
          verified: true, twoFactorEnabled: false, authProvider: 'email', status: 'active',
        }, { merge: true });

        batch.set(db.doc(`persons/${amxUid}`), {
          uid: amxUid, identityId: amxUid,
          fullName, givenName: fullName.split(' ')[0] || fullName,
          familyName: fullName.split(' ').slice(1).join(' '),
          dateOfBirth: '', gender: 'undisclosed', nationality: 'Kenya', nationalId: '',
          address: { country: 'Kenya', county: '' },
        }, { merge: true });

        if (role !== 'patient') {
          batch.set(db.doc(`professional_identities/${amxUid}`), {
            uid: amxUid, personId: amxUid,
            categories: [role],
            primaryCategory: role,
            specialties: [], qualifications: [], yearsOfExperience: 1,
            verified: true, verificationDocuments: [],
          }, { merge: true });
        }

        batch.set(db.doc(`organizations/${orgId}/members/${uid}`), {
          userId: uid, email, displayName: fullName,
          roleId: role, roleName: role,
          departmentIds: departmentId ? [departmentId] : [],
          departmentAccess: departmentId ? [departmentId] : [],
          isActive: true, joinedAt: now,
        }, { merge: true });

        batch.set(db.doc(`actors/${uid}`), {
          uid, actorId: uid, personId: amxUid, amxUid,
          name: fullName, email,
          actorType: role === 'patient' ? 'patient' : 'healthcare_professional',
          roles: [role],
          organizations: [{ id: orgId, roleId: role }],
          createdAt: now, updatedAt: now,
        }, { merge: true });

        await batch.commit();

        // Activation link the coordinator can send to the new staff.
        if (isNew) {
          const linkId = `act-${uid.slice(0, 8)}-${Date.now().toString(36)}`;
          await db.doc(`organizations/${orgId}/facility-activation-links/${linkId}`).set({
            id: linkId, uid, amxUid, fullName, email, role, family,
            token: `tok-${Math.random().toString(36).slice(2, 16)}`,
            status: 'generated', generatedAt: now, expiresAt: now + 7 * 86400000,
          });
        }

        if (role !== 'patient') {
          await db.doc(`organizations/${orgId}/employees/${uid}`).set({
            uid, personId: amxUid, organizationId: orgId,
            departmentId,
            professionalIdentityId: amxUid,
            jobTitle: role.replace(/_/g, ' '),
            employmentType: 'permanent', status: 'active',
            isPrimary: true, createdAt: now, updatedAt: now,
          }, { merge: true });
        }

        created.push({
          uid, userId: uid, amxUid, email, fullName, role, family,
          route, department: departmentId || null,
          isNew,
        });
      } catch (err: any) {
        errors.push(`${email}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      created: created.length,
      accounts: created,
      errors,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('orgId');
    if (!orgId) return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    const db = getAdminDb();
    const snap = await db.collection('organizations').doc(orgId).collection('members').get();
    const accounts = snap.docs.map(d => {
      const m = d.data();
      const role = (m.roleId || m.role || '') as string;
      const family = ROLE_FAMILY[role] || null;
      return {
        uid: (m.uid as string) || d.id,
        amxUid: (m.amxUid as string) || null,
        email: (m.email as string) || '',
        name: (m.displayName as string) || (m.name as string) || '',
        role,
        family,
        department: (m.departmentIds?.[0] as string) || (m.departmentAccess?.[0] as string) || null,
        route: family ? FAMILY_ROUTE[family] : null,
        isActive: m.isActive !== false,
      };
    });
    return NextResponse.json({ success: true, accounts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, uid, newRole, departmentId } = body;
    if (!orgId || !uid || !newRole) {
      return NextResponse.json({ error: 'orgId, uid, and newRole are required' }, { status: 400 });
    }
    if (!ROLE_FAMILY[newRole]) {
      return NextResponse.json({ error: `Unknown role "${newRole}"` }, { status: 400 });
    }
    const db = getAdminDb();
    const memberRef = db.doc(`organizations/${orgId}/members/${uid}`);
    const memSnap = await memberRef.get();
    if (!memSnap.exists) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

    const data = memSnap.data() || {};
    const amxUid = (data.amxUid as string) || (data.personId as string);
    const family = ROLE_FAMILY[newRole];

    await memberRef.update({
      roleId: newRole,
      roleName: newRole,
      ...(departmentId ? { departmentIds: [departmentId], departmentAccess: [departmentId] } : {}),
      updatedAt: Date.now(),
    });

    if (amxUid) {
      const profRef = db.doc(`professional_identities/${amxUid}`);
      const profSnap = await profRef.get();
      if (profSnap.exists) {
        await profRef.update({ primaryCategory: newRole, categories: [newRole] });
      }
    }

    await db.doc(`users/${uid}`).update({ role: newRole, updatedAt: Date.now() }).catch(() => undefined);

    return NextResponse.json({
      success: true,
      uid, newRole, family, route: FAMILY_ROUTE[family],
      message: `Reassigned to ${newRole} — now routes to ${FAMILY_ROUTE[family]}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}