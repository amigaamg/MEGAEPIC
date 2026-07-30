/**
 * AMEXAN — Comprehensive Developer Seed Script
 *
 * Seeds the complete development environment:
 *   - Firebase Auth users (all roles)
 *   - Firestore documents (identities, persons, professionals, organizations, patients)
 *   - Verification states, subscriptions, API tokens, demo clinical cases
 *
 * Usage:
 *   npx tsx scripts/seed-all.ts
 *
 * Requires .env.local with Firebase Admin credentials.
 */

import * as admin from "firebase-admin";

// ── Init Admin SDK ────────────────────────────────────────────────────────────

const app =
  admin.apps.length > 0
    ? admin.apps[0]!
    : admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "telemed-a98cf",
          clientEmail:
            process.env.FIREBASE_CLIENT_EMAIL ||
            "firebase-adminsdk-fbsvc@telemed-a98cf.iam.gserviceaccount.com",
          privateKey: (
            process.env.FIREBASE_PRIVATE_KEY || ""
          ).replace(/\\n/g, "\n"),
        }),
      });

const auth = admin.auth(app);
const db = admin.firestore(app);

// ── Seed Data ─────────────────────────────────────────────────────────────────

const NOW = Date.now();

// Platform Super Users
const PLATFORM_USERS = [
  { email: "superadmin@amexan.dev", password: "Dev123!", name: "AMEXAN Super Admin", role: "super_admin" },
  { email: "architect@amexan.dev", password: "Dev123!", name: "Platform Architect", role: "platform_architect" },
  { email: "constitution@amexan.dev", password: "Dev123!", name: "Constitution Team", role: "constitution_team" },
  { email: "knowledge@amexan.dev", password: "Dev123!", name: "Medical Knowledge Team", role: "knowledge_team" },
  { email: "rules@amexan.dev", password: "Dev123!", name: "Rules Engineering", role: "rules_engineer" },
  { email: "graph@amexan.dev", password: "Dev123!", name: "Graph Engineering", role: "graph_engineer" },
  { email: "aisafety@amexan.dev", password: "Dev123!", name: "AI Safety Team", role: "ai_safety" },
  { email: "docs@amexan.dev", password: "Dev123!", name: "Documentation Team", role: "documentation" },
  { email: "qa@amexan.dev", password: "Dev123!", name: "Clinical QA Team", role: "qa" },
  { email: "ux@amexan.dev", password: "Dev123!", name: "UX Research", role: "ux_research" },
  { email: "success@amexan.dev", password: "Dev123!", name: "Customer Success", role: "customer_success" },
  { email: "finance@amexan.dev", password: "Dev123!", name: "Finance", role: "finance" },
  { email: "marketplace@amexan.dev", password: "Dev123!", name: "Marketplace Review", role: "marketplace_review" },
  { email: "deploy@amexan.dev", password: "Dev123!", name: "Deployment Engineer", role: "deployment" },
];

// Organizations
const ORGANIZATIONS = [
  { id: "ktrh", name: "Kisii Teaching & Referral Hospital", type: "teaching_hospital", level: "level_5", departments: ["Emergency", "Medicine", "Surgery", "Pediatrics", "OBGYN", "Psychiatry", "Radiology", "Laboratory", "Pharmacy", "ICU", "Theatre", "Outpatient"] },
  { id: "knh", name: "Kenyatta National Hospital", type: "hospital", level: "level_6", departments: ["Emergency", "Medicine", "Surgery", "Pediatrics", "OBGYN", "Cardiology", "Neurology", "Oncology", "Radiology", "Laboratory", "Pharmacy", "ICU", "Theatre", "Outpatient"] },
  { id: "nrb", name: "Nairobi Hospital", type: "hospital", level: "level_5", departments: ["Emergency", "Medicine", "Surgery", "Pediatrics", "OBGYN", "Cardiology", "Radiology", "Laboratory", "Pharmacy", "ICU"] },
  { id: "akuh", name: "Aga Khan University Hospital", type: "teaching_hospital", level: "level_6", departments: ["Emergency", "Medicine", "Surgery", "Pediatrics", "OBGYN", "Cardiology", "Neurology", "Oncology", "Radiology", "Laboratory", "Pharmacy", "ICU", "Theatre", "Research"] },
  { id: "mtrh", name: "Moi Teaching & Referral Hospital", type: "teaching_hospital", level: "level_5", departments: ["Emergency", "Medicine", "Surgery", "Pediatrics", "OBGYN", "Radiology", "Laboratory", "Pharmacy", "ICU"] },
  { id: "fmc", name: "Family Medical Centre", type: "clinic", level: "level_2", departments: ["Outpatient", "Pharmacy", "Laboratory"] },
  { id: "nhc", name: "Nyamira Health Centre", type: "rural_health_centre", level: "level_2", departments: ["Outpatient", "Maternity", "Pharmacy", "Laboratory"] },
  { id: "fdea", name: "Flying Doctors East Africa", type: "mobile_outreach", level: "level_4", departments: ["Emergency", "Surgery", "Radiology"] },
  { id: "avc", name: "AMEXAN Virtual Care", type: "telemedicine", level: "level_3", departments: ["Telemedicine", "Pharmacy"] },
];

// Clinical Users (all at KTRH)
const CLINICAL_USERS = [
  { email: "consultant.med@kisii.dev", password: "Dev123!", name: "Dr. Consultant Physician", role: "consultant_physician", orgId: "ktrh", specialty: "Internal Medicine", license: "KMPDC-TEST-00001", dept: "Medicine" },
  { email: "mo@kisii.dev", password: "Dev123!", name: "Dr. Medical Officer", role: "medical_officer", orgId: "ktrh", license: "KMPDC-TEST-00002", dept: "Emergency" },
  { email: "intern@kisii.dev", password: "Dev123!", name: "Dr. Intern", role: "intern", orgId: "ktrh", license: "KMPDC-TEST-00003", dept: "Medicine" },
  { email: "resident@kisii.dev", password: "Dev123!", name: "Dr. Resident", role: "resident", orgId: "ktrh", license: "KMPDC-TEST-00004", dept: "Surgery" },
  { email: "surgery@kisii.dev", password: "Dev123!", name: "Dr. Surgeon", role: "consultant_surgeon", orgId: "ktrh", specialty: "General Surgery", license: "KMPDC-TEST-00005", dept: "Surgery" },
  { email: "paeds@kisii.dev", password: "Dev123!", name: "Dr. Pediatrician", role: "pediatrician", orgId: "ktrh", specialty: "Pediatrics", license: "KMPDC-TEST-00006", dept: "Pediatrics" },
  { email: "obgyn@kisii.dev", password: "Dev123!", name: "Dr. Obstetrician", role: "obstetrician", orgId: "ktrh", specialty: "Obstetrics & Gynecology", license: "KMPDC-TEST-00007", dept: "OBGYN" },
  { email: "psych@kisii.dev", password: "Dev123!", name: "Dr. Psychiatrist", role: "psychiatrist", orgId: "ktrh", specialty: "Psychiatry", license: "KMPDC-TEST-00008", dept: "Psychiatry" },
  { email: "anaesthesia@kisii.dev", password: "Dev123!", name: "Dr. Anaesthesiologist", role: "anaesthesiologist", orgId: "ktrh", license: "KMPDC-TEST-00009", dept: "Theatre" },
  { email: "emergency@kisii.dev", password: "Dev123!", name: "Dr. Emergency Physician", role: "emergency_physician", orgId: "ktrh", license: "KMPDC-TEST-00010", dept: "Emergency" },
  { email: "radiology@kisii.dev", password: "Dev123!", name: "Dr. Radiologist", role: "radiologist", orgId: "ktrh", specialty: "Radiology", license: "KMPDC-TEST-00011", dept: "Radiology" },
  { email: "pathology@kisii.dev", password: "Dev123!", name: "Dr. Pathologist", role: "pathologist", orgId: "ktrh", license: "KMPDC-TEST-00012", dept: "Laboratory" },
];

// Nurses
const NURSES = [
  { email: "nurse@kisii.dev", password: "Dev123!", name: "Staff Nurse", role: "nurse", orgId: "ktrh", license: "NCK-TEST-00001", dept: "Medicine" },
  { email: "snurse@kisii.dev", password: "Dev123!", name: "Senior Nurse", role: "senior_nurse", orgId: "ktrh", license: "NCK-TEST-00002", dept: "Surgery" },
  { email: "icu.nurse@kisii.dev", password: "Dev123!", name: "ICU Nurse", role: "icu_nurse", orgId: "ktrh", license: "NCK-TEST-00003", dept: "ICU" },
  { email: "theatre@kisii.dev", password: "Dev123!", name: "Theatre Nurse", role: "theatre_nurse", orgId: "ktrh", license: "NCK-TEST-00004", dept: "Theatre" },
];

// Allied Health
const ALLIED_HEALTH = [
  { email: "lab@kisii.dev", password: "Dev123!", name: "Laboratory Scientist", role: "lab_scientist", orgId: "ktrh", license: "KMLTTB-TEST-00001", dept: "Laboratory" },
  { email: "labtech@kisii.dev", password: "Dev123!", name: "Lab Technician", role: "lab_technician", orgId: "ktrh", license: "KMLTTB-TEST-00002", dept: "Laboratory" },
  { email: "pharmacy@kisii.dev", password: "Dev123!", name: "Pharmacist", role: "pharmacist", orgId: "ktrh", license: "PPB-TEST-00001", dept: "Pharmacy" },
  { email: "nutrition@kisii.dev", password: "Dev123!", name: "Nutritionist", role: "nutritionist", orgId: "ktrh", license: "KNDI-TEST-00001", dept: "Medicine" },
  { email: "physio@kisii.dev", password: "Dev123!", name: "Physiotherapist", role: "physiotherapist", orgId: "ktrh", license: "KPTRB-TEST-00001", dept: "Medicine" },
  { email: "ot@kisii.dev", password: "Dev123!", name: "Occupational Therapist", role: "occupational_therapist", orgId: "ktrh", license: "KOTRB-TEST-00001", dept: "Medicine" },
  { email: "speech@kisii.dev", password: "Dev123!", name: "Speech Therapist", role: "speech_therapist", orgId: "ktrh", license: "KSTRB-TEST-00001", dept: "Medicine" },
  { email: "social@kisii.dev", password: "Dev123!", name: "Social Worker", role: "social_worker", orgId: "ktrh", license: "KSWB-TEST-00001", dept: "Psychiatry" },
];

// Staff
const STAFF_USERS = [
  { email: "reception@kisii.dev", password: "Dev123!", name: "Receptionist", role: "receptionist", orgId: "ktrh", dept: "Outpatient" },
  { email: "cashier@kisii.dev", password: "Dev123!", name: "Cashier", role: "cashier", orgId: "ktrh", dept: "Outpatient" },
  { email: "admin@kisii.dev", password: "Dev123!", name: "Facility Administrator", role: "facility_administrator", orgId: "ktrh", dept: "Administration" },
];

// Students
const STUDENTS = [
  { email: "student@kisii.dev", password: "Dev123!", name: "Medical Student Year 4", role: "medical_student", orgId: "ktrh", dept: "Medicine" },
];

// Patients
const PATIENTS = [
  { email: "patient.healthy.male@demo.dev", name: "John Mwangi", context: "Adult male - Healthy", age: 32, sex: "male", conditions: [] },
  { email: "patient.healthy.female@demo.dev", name: "Sarah Wanjiku", context: "Adult female - Healthy", age: 27, sex: "female", conditions: [] },
  { email: "patient.pregnant@demo.dev", name: "Mary Wanjiku", context: "Pregnant - 12 weeks", age: 28, sex: "female", conditions: ["pregnancy"], pregnant: true, weeksPregnant: 12 },
  { email: "patient.term@demo.dev", name: "Jane Akinyi", context: "Pregnant - 39 weeks", age: 31, sex: "female", conditions: ["pregnancy"], pregnant: true, weeksPregnant: 39 },
  { email: "patient.postpartum@demo.dev", name: "Grace Kamau", context: "Postpartum", age: 26, sex: "female", conditions: [] },
  { email: "patient.neonate@demo.dev", name: "Baby Kamau", context: "Neonate - Day 1", age: 0, sex: "male", conditions: [] },
  { email: "patient.premature@demo.dev", name: "Baby Otieno", context: "Premature neonate - 32 weeks", age: 0, sex: "male", conditions: ["prematurity"] },
  { email: "patient.infant@demo.dev", name: "Kevin Otieno", context: "Infant - 6 months", age: 0, sex: "male", conditions: [] },
  { email: "patient.toddler@demo.dev", name: "Amina Hassan", context: "Toddler - 2 years", age: 2, sex: "female", conditions: [] },
  { email: "patient.child@demo.dev", name: "Sarah Chebet", context: "School child - 8 years, Asthma", age: 8, sex: "female", conditions: ["asthma"] },
  { email: "patient.child.healthy@demo.dev", name: "Peter Kamau", context: "School child - 10 years, Healthy", age: 10, sex: "male", conditions: [] },
  { email: "patient.adolescent@demo.dev", name: "James Kiprop", context: "Adolescent - 15 years", age: 15, sex: "male", conditions: [] },
  { email: "patient.adult@demo.dev", name: "Michael Omondi", context: "Adult - 45 years", age: 45, sex: "male", conditions: [] },
  { email: "patient.hiv@demo.dev", name: "David Ochieng", context: "HIV - Stable on ART", age: 42, sex: "male", conditions: ["hiv"] },
  { email: "patient.tb@demo.dev", name: "Samuel Mutua", context: "TB - New diagnosis", age: 38, sex: "male", conditions: ["tb"] },
  { email: "patient.diabetes@demo.dev", name: "Peter Njenga", context: "Diabetes Type 2", age: 55, sex: "male", conditions: ["diabetes", "hypertension"] },
  { email: "patient.htn@demo.dev", name: "Elizabeth Wambui", context: "Hypertension", age: 60, sex: "female", conditions: ["hypertension"] },
  { email: "patient.hf@demo.dev", name: "Joseph Barasa", context: "Heart Failure", age: 70, sex: "male", conditions: ["heart failure", "hypertension"] },
  { email: "patient.ckd@demo.dev", name: "Alice Nyambura", context: "CKD Stage 4", age: 48, sex: "female", conditions: ["ckd", "hypertension"] },
  { email: "patient.copd@demo.dev", name: "John Kiplagat", context: "COPD", age: 65, sex: "male", conditions: ["copd"] },
  { email: "patient.asthma@demo.dev", name: "Faith Nyokabi", context: "Asthma - Moderate Persistent", age: 24, sex: "female", conditions: ["asthma"] },
  { email: "patient.cancer@demo.dev", name: "Robert Onyango", context: "Cancer - Newly diagnosed", age: 52, sex: "male", conditions: ["cancer"] },
  { email: "patient.psych@demo.dev", name: "Esther Wanjala", context: "Depression", age: 35, sex: "female", conditions: ["depression", "mental health"] },
  { email: "patient.trauma@demo.dev", name: "Kevin Mwangi", context: "Polytrauma - MVA", age: 29, sex: "male", conditions: [] },
  { email: "patient.icu@demo.dev", name: "Patrick Omondi", context: "ICU - Septic Shock", age: 50, sex: "male", conditions: ["sepsis", "respiratory failure"] },
  { email: "patient.elderly@demo.dev", name: "Grace Nyambura", context: "Elderly - 80 years", age: 80, sex: "female", conditions: ["hypertension"] },
  { email: "patient.palliative@demo.dev", name: "Samuel Kioko", context: "Palliative Care - Advanced Cancer", age: 58, sex: "male", conditions: ["cancer"] },
  { email: "patient.terminal@demo.dev", name: "Rose Achieng", context: "Terminal illness - End stage liver disease", age: 62, sex: "female", conditions: ["cirrhosis", "liver failure"] },
];

// Subscriptions per organization
const SUBSCRIPTIONS: Record<string, string> = {
  ktrh: "enterprise",
  knh: "enterprise",
  nrb: "professional",
  akuh: "enterprise",
  mtrh: "enterprise",
  fmc: "starter",
  nhc: "ngo",
  fdea: "professional",
  avc: "professional",
};

// API Tokens
const API_TOKENS = [
  { name: "FHIR Integration - KTRH", token: "amx_fhir_ktrh_dev_001", scopes: ["patient.read", "encounter.read", "observation.read", "condition.read", "medication.read"], orgId: "ktrh", type: "fhir" },
  { name: "HL7 Interface - KNH", token: "amx_hl7_knh_dev_002", scopes: ["adt.send", "orm.send", "oru.receive", "dfn.send"], orgId: "knh", type: "hl7" },
  { name: "DICOM Gateway - AKUH", token: "amx_dicom_akuh_dev_003", scopes: ["modality.read", "study.read", "series.read", "instance.read", "store"], orgId: "akuh", type: "dicom" },
  { name: "PACS Viewer - KTRH", token: "amx_pacs_ktrh_dev_004", scopes: ["study.read", "series.read", "wado.read", "stow.write"], orgId: "ktrh", type: "pacs" },
  { name: "LIS Integration - NRB", token: "amx_lis_nrb_dev_005", scopes: ["order.create", "order.read", "result.read", "result.write"], orgId: "nrb", type: "lis" },
  { name: "Insurance Claims - NHIF", token: "amx_ins_nhif_dev_006", scopes: ["claim.create", "claim.read", "eligibility.check", "authorization.read"], orgId: "ktrh", type: "insurance" },
  { name: "AI Diagnosis Engine", token: "amx_ai_diag_dev_007", scopes: ["patient.read", "encounter.read", "diagnosis.read", "recommendation.create"], orgId: "avc", type: "ai" },
  { name: "Marketplace API", token: "amx_mkt_global_dev_008", scopes: ["listing.read", "listing.create", "order.read", "order.create", "review.read"], orgId: "amexan", type: "marketplace" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

let created = 0;
let skipped = 0;
let errors: string[] = [];

function generateAmxUid(type: string): string {
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `AMX-${type.toUpperCase()}-${rand}`;
}

async function upsert(col: string, id: string, data: Record<string, unknown>) {
  await db.collection(col).doc(id).set(data, { merge: true });
}

async function createAuthUser(email: string, password: string, displayName: string) {
  try {
    const existing = await auth.getUserByEmail(email).catch(() => null);
    if (existing) {
      skipped++;
      return { uid: existing.uid, existed: true };
    }
    const record = await auth.createUser({ email, password, displayName });
    created++;
    return { uid: record.uid, existed: false };
  } catch (err: any) {
    errors.push(`Auth ${email}: ${err.message}`);
    return null;
  }
}

async function seedOrganization(org: (typeof ORGANIZATIONS)[number]) {
  const existing = await db.collection("organizations").doc(org.id).get().catch(() => null);
  if (existing?.exists) return;

  await db.collection("organizations").doc(org.id).set({
    id: org.id,
    name: org.name,
    type: org.type,
    level: org.level,
    departments: org.departments,
    address: { country: "Kenya", county: "" },
    phone: "",
    email: `info@${org.id}.org`,
    status: "active",
    verified: true,
    ownedBy: "seed",
    config: {
      documentHeader: { logoUrl: "", facilityName: org.name, facilityAddress: "", facilityPhone: "", facilityEmail: "", headerTemplate: "", footerTemplate: "" },
      branding: { primaryColor: "#2F80ED", secondaryColor: "#1a5bbf", accentColor: "#14b8a6", fontFamily: "Inter" },
      clinical: { defaultWards: [], defaultClinics: [], defaultTheatres: [], diagnosisCodeSystem: "icd_10", medicationCodeSystem: "local", labCodeSystem: "local", imagingCodeSystem: "local", enableTelemedicine: false, enableAI: true, enableResearch: false },
      billing: { currency: "KES", taxRate: 0, consultationFees: {}, bedCharges: {}, pharmacyMarkup: 0, labMarkup: 0, imagingMarkup: 0, insuranceAccepted: [], paymentMethods: ["cash", "mpesa"] },
      integrations: { fhirEnabled: false, hl7Enabled: false, externalHmisEnabled: false, aiServicesEnabled: true, apiEnabled: false },
    },
    license: { licenseNumber: `LIC-${org.id.toUpperCase()}`, licenseType: "health_facility", issuingAuthority: "MOH", issuedAt: NOW, expiresAt: NOW + 365 * 86400000, renewedAt: NOW, status: "approved" },
    pricingTier: SUBSCRIPTIONS[org.id] || "free",
    createdAt: NOW,
    updatedAt: NOW,
  });
}

async function seedClinicalUser(user: {
  email: string; password: string; name: string; role: string;
  orgId: string; license?: string; specialty?: string; dept: string;
}) {
  const authResult = await createAuthUser(user.email, user.password, user.name);
  if (!authResult) return;

  const { uid } = authResult;
  const amxUid = generateAmxUid("person");

  await upsert("users", uid, {
    amxUid,
    email: user.email,
    name: user.name,
    role: user.role,
    registrationStep: "complete",
    createdAt: NOW,
    updatedAt: NOW,
  });

  await upsert("identities", amxUid, {
    uid: amxUid,
    email: user.email,
    phone: "",
    createdAt: NOW,
    updatedAt: NOW,
    lastLoginAt: NOW,
    verified: true,
    twoFactorEnabled: false,
    securityKeys: [],
    authProvider: "email",
    status: "active",
    recoveryEmail: user.email,
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
    fullName: user.name,
    givenName: user.name,
    familyName: "",
    dateOfBirth: "",
    gender: "undisclosed",
    nationality: "Kenya",
    nationalId: "",
    address: { country: "Kenya", county: "" },
  });

  await upsert("professional_identities", amxUid, {
    uid: amxUid,
    personId: amxUid,
    categories: [user.role],
    primaryCategory: user.role,
    specialties: user.specialty ? [user.specialty] : [],
    qualifications: [],
    yearsOfExperience: 5,
    licenseNumber: user.license || "",
    councilNumber: "",
    verified: true,
    verificationDocuments: [],
  });

  await db
    .collection("organizations")
    .doc(user.orgId)
    .collection("members")
    .doc(uid)
    .set(
      {
        userId: uid,
        email: user.email,
        displayName: user.name,
        roleId: user.role,
        roleName: user.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        departmentIds: [],
        isActive: true,
        joinedAt: NOW,
      },
      { merge: true },
    );
}

async function seedPatient(patient: {
  email: string; name: string; context: string;
  age: number; sex: string; conditions: string[];
  pregnant?: boolean; weeksPregnant?: number;
}) {
  const authResult = await createAuthUser(patient.email, "Patient123!", patient.name);
  if (!authResult) return;

  const { uid } = authResult;
  const amxUid = generateAmxUid("patient");
  const amxpId = `AMXPID-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  await upsert("users", uid, {
    amxUid,
    email: patient.email,
    name: patient.name,
    role: "patient",
    registrationStep: "complete",
    createdAt: NOW,
    updatedAt: NOW,
  });

  await upsert("identities", amxUid, {
    uid: amxUid,
    email: patient.email,
    phone: "",
    createdAt: NOW,
    updatedAt: NOW,
    lastLoginAt: NOW,
    verified: true,
    twoFactorEnabled: false,
    securityKeys: [],
    authProvider: "email",
    status: "active",
    recoveryEmail: patient.email,
    verification: {
      emailVerified: true,
      phoneVerified: false,
      identityVerified: false,
      licenseVerified: false,
      facilityVerified: false,
      level: 2,
    },
  });

  await upsert("persons", amxUid, {
    uid: amxUid,
    identityId: amxUid,
    fullName: patient.name,
    givenName: patient.name.split(" ")[0] || patient.name,
    familyName: patient.name.split(" ").slice(1).join(" ") || "",
    dateOfBirth: `${new Date(NOW - patient.age * 365 * 86400000).getFullYear()}-01-01`,
    gender: patient.sex,
    nationality: "Kenya",
    nationalId: "",
    address: { country: "Kenya", county: "" },
  });

  await upsert("patients", amxUid, {
    amxpId,
    amxUid,
    fullName: patient.name,
    givenName: patient.name.split(" ")[0] || patient.name,
    familyName: patient.name.split(" ").slice(1).join(" ") || "",
    dateOfBirth: `${new Date(NOW - patient.age * 365 * 86400000).getFullYear()}-01-01`,
    sex: patient.sex,
    nationality: "Kenya",
    phone: "",
    email: patient.email,
    address: { country: "Kenya", county: "" },
    context: patient.context,
    age: patient.age,
    conditions: patient.conditions,
    pregnant: patient.pregnant || false,
    weeksPregnant: patient.weeksPregnant || 0,
    emergencyContact: { name: "", relationship: "", phone: "" },
    preferredLanguage: "English",
    createdAt: NOW,
    updatedAt: NOW,
  });
}

async function seedApiTokens() {
  for (const token of API_TOKENS) {
    const id = `api_token_${token.type}_${token.orgId}`;
    await upsert("api_tokens", id, {
      name: token.name,
      token: token.token,
      scopes: token.scopes,
      organizationId: token.orgId,
      type: token.type,
      active: true,
      createdAt: NOW,
      expiresAt: NOW + 365 * 86400000,
    });
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n============================================");
  console.log("  AMEXAN — Developer Seed Script");
  console.log("============================================\n");

  // 1. Seed Organizations
  console.log("📋 Seeding organizations...");
  for (const org of ORGANIZATIONS) {
    await seedOrganization(org);
    console.log(`  ✓ ${org.name}`);
  }

  // 2. Seed Platform Super Users
  console.log("\n👑 Seeding platform super users...");
  for (const user of PLATFORM_USERS) {
    await seedClinicalUser({
      ...user,
      orgId: "amexan",
      license: `SYS-${user.role.toUpperCase()}`,
      dept: "Administration",
    });
  }

  // 3. Seed Clinical Users
  console.log("\n🩺 Seeding clinical users...");
  for (const user of CLINICAL_USERS) {
    await seedClinicalUser(user);
  }

  // 4. Seed Nurses
  console.log("\n👩‍⚕️ Seeding nurses...");
  for (const user of NURSES) {
    await seedClinicalUser(user);
  }

  // 5. Seed Allied Health
  console.log("\n🔬 Seeding allied health...");
  for (const user of ALLIED_HEALTH) {
    await seedClinicalUser(user);
  }

  // 6. Seed Staff
  console.log("\n🧑‍💼 Seeding staff...");
  for (const user of STAFF_USERS) {
    await seedClinicalUser(user);
  }

  // 7. Seed Students
  console.log("\n🎓 Seeding students...");
  for (const user of STUDENTS) {
    await seedClinicalUser(user);
  }

  // 8. Seed Patients
  console.log("\n🏥 Seeding patients...");
  for (const patient of PATIENTS) {
    await seedPatient(patient);
    console.log(`  ✓ ${patient.name} (${patient.context})`);
  }

  // 9. Seed API Tokens
  console.log("\n🔑 Seeding API tokens...");
  await seedApiTokens();
  console.log(`  ✓ ${API_TOKENS.length} tokens created`);

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log("\n============================================");
  console.log("  Seed Complete!");
  console.log("============================================");
  console.log(`  Users created:  ${created}`);
  console.log(`  Users skipped (existing): ${skipped}`);
  console.log(`  Errors:         ${errors.length}`);
  if (errors.length > 0) {
    console.log("\n  Errors:");
    errors.forEach((e) => console.log(`    ✗ ${e}`));
  }
  console.log(`\n  Total seed accounts: ${created + skipped}`);
  console.log(`  Organizations: ${ORGANIZATIONS.length}`);
  console.log(`  Patients: ${PATIENTS.length}`);
  console.log(`  API Tokens: ${API_TOKENS.length}`);
  console.log("============================================\n");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
