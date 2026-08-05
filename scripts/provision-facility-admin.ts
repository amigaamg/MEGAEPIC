/**
 * AMEXAN — Provision Facility Administrator login (idempotent)
 *
 * Creates a verified Facility Administrator account that resolves to the
 * Executive / Facility Administration dashboards with full visibility.
 *
 * Usage:
 *   npx tsx scripts/provision-facility-admin.ts
 *
 * Requires .env.local with Firebase Admin credentials.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as admin from "firebase-admin";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const FACILITY_ADMIN = {
  email: "admin@amexan.dev",
  password: "FacilityAdmin123!",
  name: "Facility Administrator",
  role: "facility_administrator",
  orgId: "ktrh",
  dept: "Administration",
};

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

function generateAmxUid(type: string): string {
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `AMX-${type.toUpperCase()}-${rand}`;
}

async function upsert(col: string, id: string, data: Record<string, unknown>) {
  await db.collection(col).doc(id).set(data, { merge: true });
}

async function main() {
  console.log("\n============================================");
  console.log("  AMEXAN — Facility Administrator Provisioning");
  console.log("============================================\n");

  // 1. Ensure the organization exists (ktrh teaching hospital).
  const orgRef = db.collection("organizations").doc(FACILITY_ADMIN.orgId);
  const orgSnap = await orgRef.get();
  if (!orgSnap.exists) {
    await orgRef.set({
      id: FACILITY_ADMIN.orgId,
      name: "Kisii Teaching & Referral Hospital",
      type: "hospital",
      level: "national",
      departments: [FACILITY_ADMIN.dept],
      address: { country: "Kenya", county: "Kisii" },
      phone: "",
      email: `info@${FACILITY_ADMIN.orgId}.org`,
      status: "active",
      verified: true,
      ownedBy: "provision",
      config: {
        documentHeader: { logoUrl: "", facilityName: "Kisii Teaching & Referral Hospital" },
      },
      license: {
        licenseNumber: `LIC-${FACILITY_ADMIN.orgId.toUpperCase()}`,
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
    console.log(`  ✓ Organization ${FACILITY_ADMIN.orgId} created`);
  } else {
    console.log(`  ✓ Organization ${FACILITY_ADMIN.orgId} already exists`);
  }

  // 2. Create the Auth user (idempotent), force email verified.
  let uid: string;
  const existing = await auth.getUserByEmail(FACILITY_ADMIN.email).catch(() => null);
  if (existing) {
    uid = existing.uid;
    await auth.updateUser(uid, { emailVerified: true, displayName: FACILITY_ADMIN.name });
    console.log(`  ✓ Auth user exists: ${FACILITY_ADMIN.email} (verified)`);
  } else {
    const record = await auth.createUser({
      email: FACILITY_ADMIN.email,
      password: FACILITY_ADMIN.password,
      displayName: FACILITY_ADMIN.name,
      emailVerified: true,
    });
    uid = record.uid;
    console.log(`  ✓ Auth user created: ${FACILITY_ADMIN.email}`);
  }

  // 3. Write the Firestore docs AMEXAN resolves.
  const amxUid = generateAmxUid("person");

  await upsert("users", uid, {
    amxUid,
    email: FACILITY_ADMIN.email,
    name: FACILITY_ADMIN.name,
    role: FACILITY_ADMIN.role,
    registrationStep: "complete",
    activeOrganizationId: FACILITY_ADMIN.orgId,
    emailVerified: true,
    createdAt: NOW,
    updatedAt: NOW,
  });

  await upsert("identities", amxUid, {
    uid: amxUid,
    email: FACILITY_ADMIN.email,
    phone: "",
    createdAt: NOW,
    updatedAt: NOW,
    lastLoginAt: NOW,
    verified: true,
    twoFactorEnabled: false,
    securityKeys: [],
    authProvider: "email",
    status: "active",
    recoveryEmail: FACILITY_ADMIN.email,
    verification: {
      emailVerified: true,
      phoneVerified: false,
      identityVerified: true,
      licenseVerified: true,
      facilityVerified: true,
      level: "super_verified",
    },
  });

  await upsert("persons", amxUid, {
    uid: amxUid,
    identityId: amxUid,
    fullName: FACILITY_ADMIN.name,
    givenName: FACILITY_ADMIN.name,
    familyName: "",
    dateOfBirth: "",
    gender: "undisclosed",
    nationality: "Kenya",
    nationalId: "",
    address: { country: "Kenya", county: "Kisii" },
  });

  await upsert("professional_identities", amxUid, {
    uid: amxUid,
    personId: amxUid,
    categories: [FACILITY_ADMIN.role],
    primaryCategory: FACILITY_ADMIN.role,
    specialties: [],
    qualifications: [],
    yearsOfExperience: 5,
    licenseNumber: `KMPDC-ADMIN-${amxUid.slice(-4)}`,
    councilNumber: "",
    verified: true,
    verificationDocuments: [],
  });

  await db
    .collection("organizations")
    .doc(FACILITY_ADMIN.orgId)
    .collection("members")
    .doc(uid)
    .set(
      {
        userId: uid,
        email: FACILITY_ADMIN.email,
        displayName: FACILITY_ADMIN.name,
        roleId: FACILITY_ADMIN.role,
        roleName: "Facility Administrator",
        departmentIds: [FACILITY_ADMIN.dept],
        isActive: true,
        joinedAt: NOW,
      },
      { merge: true },
    );

  await upsert("actors", uid, {
    uid,
    actorId: uid,
    personId: amxUid,
    amxUid,
    name: FACILITY_ADMIN.name,
    email: FACILITY_ADMIN.email,
    actorType: "administrator",
    roles: [FACILITY_ADMIN.role],
    organizations: [{ id: FACILITY_ADMIN.orgId, roleId: FACILITY_ADMIN.role }],
    createdAt: NOW,
    updatedAt: NOW,
  });

  console.log("\n============================================");
  console.log("  Facility Administrator READY");
  console.log("============================================");
  console.log(`  Email:    ${FACILITY_ADMIN.email}`);
  console.log(`  Password: ${FACILITY_ADMIN.password}`);
  console.log(`  Role:     ${FACILITY_ADMIN.role} → Executive / Facility Administration dashboard`);
  console.log(`  Org:      ${FACILITY_ADMIN.orgId}`);
  console.log(`  AMXID:    ${amxUid}`);
  console.log("  Login at: /login  (Email method)");
  console.log("============================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Provisioning failed:", err);
    process.exit(1);
  });
