/**
 * AMEXAN — Seed "AMEXAN University Hospital" Demo Workspace (Book XV, WS-017)
 *
 * Creates the developer/test organization `ORG-DEMO-001` and all documented
 * seeded identities so a developer can log directly into any constitutional
 * workspace WITHOUT completing onboarding. No onboarding runs for these
 * accounts: every account is wired with users / identities / persons /
 * professional_identities / memberships / employments / assignments /
 * facilities / departments, all marked registrationStep=complete and
 * workspaceChoice=organization.
 *
 * The role => workspace-family mapping mirrors WorkspaceGuard so each account
 * lands on its own constitutional workspace and can never render another's.
 *
 * Usage:
 *   npx tsx scripts/seed-demo-hospital.ts
 *
 * Requires .env.local with Firebase Admin credentials.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as admin from "firebase-admin";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const DEMO_ORG = {
  id: "ORG-DEMO-001",
  name: "AMEXAN University Hospital",
  type: "hospital",
  level: "national",
  departments: [
    "Surgery", "Medicine", "Paediatrics", "Obstetrics & Gynaecology",
    "Emergency", "Anaesthesia", "Laboratory", "Radiology", "Pharmacy",
    "Finance", "Human Resources", "ICT",
  ],
};

const DEMO_FAC = { id: "FAC-DEMO-001" };
const DEMO_PASSWORD = "Demo@123456";

const app =
  admin.apps.length > 0
    ? admin.apps[0]!
    : admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "telemed-a98cf",
          clientEmail:
            process.env.FIREBASE_CLIENT_EMAIL ||
            "firebase-adminsdk-fbsvc@telemed-a98cf.iam.gserviceaccount.com",
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        }),
      });

const auth = admin.auth(app);
const db = admin.firestore(app);
const NOW = Date.now();

// Each seeded identity declares its constitutional role, expected workspace
// family, department, and assignment kind so onboarding is fully bypassed and
// the WorkspaceGuard lands the actor home.
interface DemoUser {
  email: string;
  name: string;
  role: string;
  family: string;
  dept: string;
  assignment: string;
}

const DEMO_USERS: DemoUser[] = [
  { email: "facility.admin@demo.amexan", name: "Alan Facility", role: "facility_administrator", family: "executive", dept: "Administration", assignment: "administration" },
  { email: "subadmin@demo.amexan", name: "Sue Badmin", role: "hospital_admin", family: "executive", dept: "Administration", assignment: "administration" },
  { email: "surgery.head@demo.amexan", name: "Sam Head", role: "department_head", family: "department", dept: "Surgery", assignment: "administration" },
  { email: "ward.a@demo.amexan", name: "Wanda Charge", role: "ward_in_charge", family: "department", dept: "General Surgery", assignment: "ward_round" },
  { email: "consultant@demo.amexan", name: "Cole Consultant", role: "consultant", family: "clinical", dept: "Surgery", assignment: "consultation" },
  { email: "resident@demo.amexan", name: "Reena Resident", role: "resident", family: "clinical", dept: "Medicine", assignment: "ward_round" },
  { email: "mo@demo.amexan", name: "Moe Officer", role: "medical_officer", family: "clinical", dept: "Emergency", assignment: "emergency_call" },
  { email: "nurse@demo.amexan", name: "Nora Nurse", role: "nurse", family: "nursing", dept: "Obstetrics & Gynaecology", assignment: "ward_round" },
  { email: "pharmacy@demo.amexan", name: "Phil Pharmacy", role: "pharmacist", family: "pharmacy", dept: "Pharmacy", assignment: "clinic" },
  { email: "lab@demo.amexan", name: "Lana Lab", role: "lab_technologist", family: "laboratory", dept: "Laboratory", assignment: "clinic" },
  { email: "radiology@demo.amexan", name: "Ray Radiology", role: "radiographer", family: "radiology", dept: "Radiology", assignment: "clinic" },
  { email: "finance@demo.amexan", name: "Fay Finance", role: "finance_officer", family: "finance", dept: "Finance", assignment: "administration" },
  { email: "hr@demo.amexan", name: "Harry R", role: "hr_officer", family: "hr", dept: "Human Resources", assignment: "administration" },
  { email: "ict@demo.amexan", name: "Ian Technician", role: "ict_officer", family: "ict", dept: "ICT", assignment: "administration" },
  { email: "researcher@demo.amexan", name: "Riva Researcher", role: "researcher", family: "research", dept: "Medicine", assignment: "research" },
  { email: "telemed@demo.amexan", name: "Terry Telemed", role: "telemedicine_officer", family: "telemedicine", dept: "Telemedicine", assignment: "teleconsultation" },
  { email: "student@demo.amexan", name: "Stella Student", role: "medical_student", family: "teaching", dept: "Medicine", assignment: "supervision" },
  { email: "patient@demo.amexan", name: "Pat P. Ient", role: "patient", family: "patient", dept: "Registration", assignment: "other" },
];

function generateAmxUid(type: string): string {
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `AMX-${type.toUpperCase()}-${rand}`;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function upsert(col: string, id: string, data: Record<string, unknown>) {
  await db.collection(col).doc(id).set(data, { merge: true });
}

async function seedActor(u: DemoUser): Promise<void> {
  const email = u.email;
  const pwd = DEMO_PASSWORD;

  // Auth user (idempotent).
  let uid: string;
  const existing = await auth.getUserByEmail(email).catch(() => null);
  if (existing) {
    uid = existing.uid;
    await auth.updateUser(uid, { emailVerified: true, displayName: u.name });
  } else {
    const record = await auth.createUser({ email, password: pwd, displayName: u.name, emailVerified: true });
    uid = record.uid;
  }

  const amxUid = generateAmxUid("person");
  const deptId = `dept-${normalize(u.dept)}`;
  const empId = `emp-${uid.slice(0, 8)}`;

  // users/uid — registrationStep=complete + workspaceChoice=organization ===
  // the constitution's proof that the actor intentionally completed a workspace,
  // so the CR-WS-001 completeness gate reports ready. No onboarding runs.
  await upsert("users", uid, {
    amxUid,
    email,
    name: u.name,
    role: u.role,
    registrationStep: "complete",
    workspaceChoice: "organization",
    activeOrganizationId: DEMO_ORG.id,
    emailVerified: true,
    approved: true,
    createdAt: NOW,
    updatedAt: NOW,
  });

  await upsert("identities", amxUid, {
    uid: amxUid,
    email,
    phone: "",
    createdAt: NOW,
    updatedAt: NOW,
    lastLoginAt: NOW,
    verified: true,
    twoFactorEnabled: false,
    securityKeys: [],
    authProvider: "email",
    status: "active",
    verification: { emailVerified: true, phoneVerified: false, identityVerified: true, level: "demo" },
  });

  await upsert("persons", amxUid, {
    uid: amxUid,
    identityId: amxUid,
    fullName: u.name,
    givenName: u.name,
    familyName: "",
    dateOfBirth: "",
    gender: "undisclosed",
    nationality: "Kenya",
    nationalId: "",
    address: { country: "Kenya", county: "Nairobi" },
  });

  await upsert("professional_identities", amxUid, {
    uid: amxUid,
    personId: amxUid,
    categories: [u.role],
    primaryCategory: u.role,
    specialties: [],
    qualifications: [],
    yearsOfExperience: 1,
    verified: true,
    verificationDocuments: [],
  });

  // Memberships (with an active one so the gate sees a workspace).
  await db
    .collection("organizations")
    .doc(DEMO_ORG.id)
    .collection("members")
    .doc(uid)
    .set(
      {
        userId: uid,
        email,
        displayName: u.name,
        roleId: u.role,
        roleName: u.role,
        departmentIds: [u.dept],
        isActive: true,
        joinedAt: NOW,
      },
      { merge: true },
    );

  // WorkspaceEngine membership row (organizations/{orgId}/memberships/{personId}).
  // The MembershipResolver reads BOTH `members` (legacy) and `memberships`; an
  // active membership here is what flips the completeness gate to 'ready'.
  await db
    .collection("organizations")
    .doc(DEMO_ORG.id)
    .collection("memberships")
    .doc(amxUid)
    .set(
      {
        id: amxUid,
        personId: amxUid,
        organizationId: DEMO_ORG.id,
        orgId: DEMO_ORG.id,
        organizationName: DEMO_ORG.name,
        organizationType: "hospital",
        roleId: u.role,
        roleName: u.role,
        departmentId: deptId,
        departmentName: u.dept,
        facilityId: DEMO_FAC.id,
        facilityName: `${DEMO_ORG.name} · Main Campus`,
        isPrimary: true,
        status: "active",
        joinedAt: NOW,
        updatedAt: NOW,
        metadata: { source: "demo-seed", services: [] },
      },
      { merge: true },
    );

  // Employment + active assignment so the clinical chain is complete. Writes are
  // org-scoped (organizations/{orgId}/employments, /assignments) — the resolvers
  // read collections nested under the org, NOT top-level collections.
  if (u.role !== "patient") {
    await db.collection("organizations").doc(DEMO_ORG.id).collection("employments").doc(`${uid}-emp`).set(
      {
        id: empId,
        personId: amxUid,
        organizationId: DEMO_ORG.id,
        departmentId: deptId,
        professionalIdentityId: amxUid,
        employeeId: `EMP-${uid.slice(0, 8).toUpperCase()}`,
        jobTitle: u.role.replace("_", " "),
        employmentType: "permanent",
        startDate: NOW - 30 * 86400000,
        isPrimary: true,
        schedule: { type: "full_time", weeklyHours: 40, workingDays: [1, 2, 3, 4, 5], leaveBalance: {} },
        privileges: [],
        status: "active",
        createdAt: NOW,
        updatedAt: NOW,
      },
      { merge: true },
    );

    const isWard = ["ward_round", "supervision"].includes(u.assignment);
    const locType =
      isWard ? "ward"
        : u.assignment === "emergency_call" ? "emergency"
        : u.assignment === "teleconsultation" ? "remote"
        : u.assignment === "theatre" ? "theatre"
        : "clinic";
    const location: Record<string, unknown> = {
      type: locType,
      clinicId: "clinic-demo-1",
    };
    if (isWard) location.wardId = "ward-demo-1";

    await db.collection("organizations").doc(DEMO_ORG.id).collection("assignments").doc(`${uid}-${u.assignment}`).set(
      {
        id: `${uid}-${u.assignment}`,
        personId: amxUid,
        employmentId: empId,
        organizationId: DEMO_ORG.id,
        departmentId: deptId,
        type: u.assignment,
        title: u.assignment.replace("_", " "),
        startTime: NOW - 3600000,
        endTime: NOW + 7 * 3600000,
        location,
        status: "active",
        priority: "routine",
        assignedBy: amxUid,
        assignedAt: NOW,
        requiresSignature: false,
        linkedPatientIds: [],
        linkedEncounterIds: [],
      },
      { merge: true },
    );
  }

  await upsert("actors", uid, {
    uid,
    actorId: uid,
    personId: amxUid,
    amxUid,
    name: u.name,
    email,
    actorType: u.role === "patient" ? "patient" : "healthcare_professional",
    roles: [u.role],
    organizations: [{ id: DEMO_ORG.id, roleId: u.role }],
    createdAt: NOW,
    updatedAt: NOW,
  });

  console.log(`  ✓ ${email.padEnd(32)} → ${u.family.padEnd(10)} ${u.role}`);
}

async function main() {
  console.log("\n============================================");
  console.log("  AMEXAN — Seed Demo Hospital (All Workspaces)");
  console.log("============================================\n");

  // 1. Organization + facility + departments.
  const orgRef = db.collection("organizations").doc(DEMO_ORG.id);
  const orgSnap = await orgRef.get();
  if (!orgSnap.exists) {
    await orgRef.set({
      id: DEMO_ORG.id,
      name: DEMO_ORG.name,
      type: "hospital",
      level: "national",
      departments: DEMO_ORG.departments,
      address: { country: "Kenya", county: "Nairobi" },
      phone: "",
      email: "info@demo.amexan",
      status: "active",
      verified: true,
      ownedBy: "demo-seed",
      config: { documentHeader: { logoUrl: "", facilityName: DEMO_ORG.name } },
      license: {
        licenseNumber: "LIC-DEMO-001",
        licenseType: "health_facility",
        issuingAuthority: "MOH",
        issuedAt: NOW,
        expiresAt: NOW + 365 * 86400000,
        status: "approved",
      },
      pricingTier: "enterprise",
      createdAt: NOW,
      updatedAt: NOW,
    });
    console.log("  ✓ Org ORG-DEMO-001 created");
  } else {
    console.log("  ✓ Org ORG-DEMO-001 already exists");
  }

  await upsert("facilities", DEMO_FAC.id, {
    id: DEMO_FAC.id,
    organizationId: DEMO_ORG.id,
    name: `${DEMO_ORG.name} · Main Campus`,
    facilityType: "teaching_hospital",
    status: "active",
    departments: DEMO_ORG.departments,
    createdAt: NOW,
    updatedAt: NOW,
  });

  for (const dep of DEMO_ORG.departments) {
    const depId = `dept-${normalize(dep)}`;
    await upsert("departments", depId, {
      id: depId,
      organizationId: DEMO_ORG.id,
      facilityId: DEMO_FAC.id,
      name: dep,
      status: "active",
      createdAt: NOW,
    });
    // Org-scoped row — listDepartments reads organizations/{orgId}/departments.
    await db.collection("organizations").doc(DEMO_ORG.id).collection("departments").doc(depId).set({
      id: depId,
      organizationId: DEMO_ORG.id,
      facilityId: DEMO_FAC.id,
      name: dep,
      type: dep.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
      status: "active",
      createdAt: NOW,
    }, { merge: true });
  }

  // 2. Seed each demo actor with a full, complete workspace.
  for (const u of DEMO_USERS) {
    await seedActor(u);
  }

  console.log("\n============================================");
  console.log("  DEMO HOSPITAL READY — all accounts bypass onboarding");
  console.log("============================================");
  console.log(`  Org: ${DEMO_ORG.id} (${DEMO_ORG.name})`);
  for (const u of DEMO_USERS) {
    console.log(`  ${u.email}  / ${DEMO_PASSWORD}  → family "${u.family}"`);
  }
  console.log("  Demo login UI at: /demo-login (dev only)");
  console.log("============================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Demo seed failed:", err);
    process.exit(1);
  });