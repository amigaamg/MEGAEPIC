/**
 * AMEXAN — Full Production Firestore Seed Script
 * Seeds the complete organization tree + admin identity.
 *
 * Usage:
 *   npx tsx scripts/seed-full-production.ts
 *
 * Credentials from .env.local
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY is not set in .env.local");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const ORG_ID = "telemed-a98cf";

// ── Department + Unit definitions ──────────────────────────────────────────

interface UnitDef {
  id: string;
  label: string;
  description: string;
  icon: string;
  encounterTypes: string[];
  pathways: string[];
}

interface DeptDef {
  key: string;
  label: string;
  color: string;
  icon: string;
  description: string;
  units: UnitDef[];
}

const DEPTS: DeptDef[] = [
  {
    key: "IM", label: "Internal Medicine", color: "#3b82f6", icon: "🏥",
    description: "Comprehensive adult medical care for complex multi-system diseases.",
    units: [
      { id: "general-medicine", label: "General Medicine Ward", description: "Complex multi-system adult medical care, FUO, unexplained symptoms", icon: "🏥", encounterTypes: ["inpatient","ward_round","follow_up","mdt_review"], pathways: ["sepsis"] },
      { id: "hypertension-risk", label: "Hypertension & Cardiovascular Risk", description: "Essential hypertension, secondary hypertension, dyslipidaemia, metabolic syndrome", icon: "🩸", encounterTypes: ["outpatient","telemedicine","follow_up"], pathways: [] },
      { id: "infectious-disease", label: "Infectious Disease Unit", description: "HIV, TB, tropical medicine, antimicrobial stewardship", icon: "🦠", encounterTypes: ["outpatient","inpatient","ward_round","telemedicine"], pathways: ["sepsis"] },
    ],
  },
  {
    key: "CARD", label: "Cardiology", color: "#ef4444", icon: "❤️",
    description: "Comprehensive cardiac care from prevention to intervention.",
    units: [
      { id: "general-cardiology", label: "Cardiology Clinic", description: "Chest pain, dyspnoea, palpitations, valvular disease, cardiac risk assessment", icon: "❤️", encounterTypes: ["outpatient","emergency","follow_up","telemedicine"], pathways: ["chest-pain"] },
      { id: "coronary-artery-disease", label: "Coronary Artery Disease Unit", description: "Stable angina, acute coronary syndrome, post-MI care, PCI, CABG follow-up", icon: "💔", encounterTypes: ["outpatient","emergency","inpatient","ward_round","icu_review","follow_up"], pathways: ["chest-pain"] },
      { id: "heart-failure", label: "Heart Failure Unit", description: "HFrEF, HFpEF, acute decompensation, cardiogenic shock", icon: "💔", encounterTypes: ["inpatient","ward_round","icu_review","follow_up"], pathways: [] },
      { id: "cardiac-ep", label: "Electrophysiology", description: "Atrial fibrillation, SVT, VT, bradyarrhythmias, device therapy", icon: "⚡", encounterTypes: ["outpatient","procedure","operative_note","follow_up"], pathways: [] },
    ],
  },
  {
    key: "RESP", label: "Respiratory", color: "#06b6d4", icon: "🫁",
    description: "Comprehensive respiratory medicine across the care spectrum.",
    units: [
      { id: "pulmonology", label: "Pulmonology Unit", description: "COPD, asthma, bronchiectasis, ILD, pulmonary hypertension", icon: "🫁", encounterTypes: ["outpatient","inpatient","ward_round","follow_up"], pathways: ["severe-pneumonia"] },
      { id: "respiratory-infections", label: "Respiratory Infections", description: "Pneumonia, TB, empyema, lung abscess", icon: "🦠", encounterTypes: ["outpatient","emergency","inpatient","ward_round"], pathways: [] },
      { id: "pleural-disease", label: "Pleural Disease Unit", description: "Pleural effusion, pneumothorax, empyema", icon: "🫁", encounterTypes: ["outpatient","inpatient","procedure"], pathways: [] },
      { id: "respiratory-failure", label: "Respiratory Failure & Ventilation", description: "Acute respiratory failure, NIV, respiratory weaning", icon: "💨", encounterTypes: ["inpatient","icu_review","ward_round"], pathways: [] },
    ],
  },
  {
    key: "NEURO", label: "Neurology", color: "#ec4899", icon: "🧠",
    description: "Comprehensive neurological care across all subspecialties.",
    units: [
      { id: "stroke-unit", label: "Stroke Unit", description: "Ischaemic stroke, haemorrhagic stroke, TIA, cerebral venous thrombosis", icon: "🩸", encounterTypes: ["emergency","inpatient","icu_review","ward_round","discharge_summary"], pathways: ["stroke"] },
      { id: "epilepsy-monitoring", label: "Epilepsy & Seizure Disorders", description: "Generalised epilepsy, focal epilepsy, status epilepticus, febrile seizures", icon: "⚡", encounterTypes: ["outpatient","inpatient","follow_up"], pathways: [] },
      { id: "general-neurology", label: "General Neurology", description: "Headache, dizziness, neuropathy - general referrals", icon: "🧠", encounterTypes: ["outpatient","follow_up","telemedicine"], pathways: [] },
    ],
  },
  {
    key: "SURG", label: "Surgery", color: "#94a3b8", icon: "🔪",
    description: "Comprehensive surgical services from emergency to elective.",
    units: [
      { id: "acute-care-surgery", label: "Acute Care & Emergency Surgery", description: "Appendicitis, peritonitis, bowel obstruction, acute abdomen", icon: "🔪", encounterTypes: ["outpatient","emergency","inpatient","ward_round","operative_note","post_op","discharge_summary"], pathways: ["acute-abdomen"] },
      { id: "upper-gi-surgery", label: "Upper GI Surgery", description: "Oesophageal, gastric, peptic ulcer, hiatal hernia", icon: "🍽️", encounterTypes: ["outpatient","inpatient","operative_note","ward_round","post_op"], pathways: [] },
      { id: "colorectal-surgery", label: "Colorectal Surgery", description: "Colorectal cancer, diverticulitis, IBD, anal conditions", icon: "🔄", encounterTypes: ["outpatient","inpatient","operative_note","ward_round","post_op"], pathways: [] },
      { id: "trauma", label: "Trauma Unit", description: "Major trauma, resuscitation, damage control, splenic/liver injury", icon: "🚑", encounterTypes: ["emergency","inpatient","icu_review","operative_note","ward_round"], pathways: ["polytrauma"] },
    ],
  },
  {
    key: "EM", label: "Emergency Medicine", color: "#ef4444", icon: "🚨",
    description: "Emergency care for acute presentations across all specialties.",
    units: [
      { id: "resus", label: "Resuscitation Bay", description: "Cardiac arrest, shock, major trauma, anaphylaxis", icon: "🚨", encounterTypes: ["emergency","procedure","icu_review"], pathways: ["polytrauma","sepsis"] },
      { id: "majors", label: "Majors (Acute Care)", description: "Acute medical & surgical presentations", icon: "🏥", encounterTypes: ["emergency","inpatient","referral"], pathways: ["sepsis","chest-pain","acute-abdomen"] },
      { id: "minors", label: "Minors (Urgent Care)", description: "Minor injuries, infections, low-acuity walk-in", icon: "🩹", encounterTypes: ["emergency","follow_up"], pathways: [] },
    ],
  },
  {
    key: "OB", label: "Obstetrics", color: "#f97316", icon: "🤰",
    description: "Comprehensive obstetric care from antenatal to postnatal.",
    units: [
      { id: "antenatal", label: "Antenatal Clinic", description: "Routine pregnancy care, screening, hyperemesis, multiple gestation", icon: "🤰", encounterTypes: ["outpatient","antenatal","telemedicine"], pathways: [] },
      { id: "labour-delivery", label: "Labour & Delivery Ward", description: "Normal labour, obstructed labour, fetal distress", icon: "🏥", encounterTypes: ["emergency","inpatient","ward_round"], pathways: [] },
      { id: "postnatal", label: "Postnatal Ward", description: "Postpartum haemorrhage, puerperal sepsis, lactation, postpartum depression", icon: "👩‍👧", encounterTypes: ["inpatient","post_op","discharge_summary"], pathways: [] },
    ],
  },
  {
    key: "PAED", label: "Paediatrics", color: "#22d3ee", icon: "👶",
    description: "Comprehensive paediatric care from neonate to adolescent.",
    units: [
      { id: "paediatric-emergency", label: "Paediatric Emergency", description: "Acute presentations, trauma, poisoning, resuscitation", icon: "🚨", encounterTypes: ["emergency","procedure","referral"], pathways: ["severe-pneumonia"] },
      { id: "paediatric-respiratory", label: "Paediatric Respiratory Unit", description: "Cough, wheeze, respiratory distress, TB, asthma, bronchiolitis", icon: "🫁", encounterTypes: ["outpatient","emergency","inpatient","ward_round","follow_up"], pathways: ["severe-pneumonia"] },
      { id: "neonatology", label: "Neonatology Unit", description: "Newborn care, prematurity, NICU, neonatal jaundice", icon: "👶", encounterTypes: ["inpatient","ward_round","icu_review","discharge_summary"], pathways: [] },
    ],
  },
  {
    key: "ICU", label: "Critical Care", color: "#e11d48", icon: "💓",
    description: "Intensive care for critically ill patients across all specialties.",
    units: [
      { id: "icu-medical", label: "General Medical ICU", description: "General medical critical care", icon: "💓", encounterTypes: ["icu_review","ward_round","inpatient"], pathways: [] },
      { id: "icu-sepsis", label: "Sepsis & Multi-Organ Failure ICU", description: "Sepsis bundle, multiorgan dysfunction, haemodynamic monitoring", icon: "🦠", encounterTypes: ["icu_review","ward_round","inpatient"], pathways: ["sepsis"] },
    ],
  },
  {
    key: "GYN", label: "Gynecology", color: "#f472b6", icon: "🌸",
    description: "Comprehensive gynaecological care.",
    units: [
      { id: "general-gyne", label: "General Gynecology Clinic", description: "Menstrual disorders, pelvic pain, fibroids, endometriosis, PCOS", icon: "🌸", encounterTypes: ["outpatient","follow_up","telemedicine"], pathways: [] },
      { id: "gynae-oncology-unit", label: "Gynaecological Oncology", description: "Ovarian, cervical, endometrial, vulvar cancer", icon: "⚕️", encounterTypes: ["outpatient","inpatient","ward_round","operative_note","mdt_review"], pathways: [] },
    ],
  },
];

export async function seedFullProduction(): Promise<void> {
  console.log(`\n🌱 Seeding organization: ${ORG_ID}\n`);

  // ── 1. Organization document ────────────────────────────────────────────
  const orgRef = db.collection("organizations").doc(ORG_ID);
  await orgRef.set({
    id: ORG_ID,
    name: "AMEXAN Teaching Hospital",
    type: "hospital",
    tier: 4,
    country: "Kenya",
    region: "East Africa",
    timezone: "Africa/Nairobi",
    currency: "KES",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    settings: {
      clinicalTier: 4,
      defaultEncounterType: "outpatient",
      enableTelemedicine: true,
      enableClinicalDecisionSupport: true,
      enableAutoBilling: false,
      enableInventory: true,
      enableNursing: true,
      enableTheatre: true,
      language: "en",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
    },
  });
  console.log(`  ✅ Organization: ${ORG_ID}`);

  // ── 2. Departments + Units ─────────────────────────────────────────────
  for (const dept of DEPTS) {
    const deptRef = db.collection("organizations").doc(ORG_ID).collection("departments").doc(dept.key);
    await deptRef.set({
      key: dept.key,
      label: dept.label,
      color: dept.color,
      icon: dept.icon,
      description: dept.description,
      activeCases: 0,
      todayEncounters: 0,
      avgWaitMinutes: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    for (const unit of dept.units) {
      const unitRef = deptRef.collection("units").doc(unit.id);
      await unitRef.set({
        id: unit.id,
        label: unit.label,
        description: unit.description,
        icon: unit.icon,
        encounterTypes: unit.encounterTypes,
        pathways: unit.pathways,
        activeCases: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    console.log(`  ✅ ${dept.key}: ${dept.units.length} units`);
  }

  // ── 3. Admin user ──────────────────────────────────────────────────────
  const ADMIN_EMAIL = "admin@amexan.com";
  try {
    const existingUser = await admin.auth().getUserByEmail(ADMIN_EMAIL).catch(() => null);
    if (!existingUser) {
      const userRecord = await admin.auth().createUser({
        email: ADMIN_EMAIL,
        password: "Admin123!",
        displayName: "Dr. AMEXAN Admin",
        emailVerified: true,
      });
      const userRef = db.collection("users").doc(userRecord.uid);
      await userRef.set({
        uid: userRecord.uid,
        email: ADMIN_EMAIL,
        displayName: "Dr. AMEXAN Admin",
        role: "admin",
        activeOrganizationId: ORG_ID,
        organizations: [ORG_ID],
        departments: [],
        specialties: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const memberRef = db.collection("organizations").doc(ORG_ID).collection("members").doc(userRecord.uid);
      await memberRef.set({
        userId: userRecord.uid,
        email: ADMIN_EMAIL,
        displayName: "Dr. AMEXAN Admin",
        role: "admin",
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✅ Admin user created: ${ADMIN_EMAIL} / Admin123!`);
    } else {
      console.log(`  ⏭️  Admin user already exists: ${ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error(`  ❌ Failed to create admin user:`, err);
  }

  // ── 4. Organization settings ────────────────────────────────────────────
  const settingsRef = db.collection("organizations").doc(ORG_ID).collection("settings").doc("general");
  await settingsRef.set({
    clinicalTier: 4,
    defaultEncounterType: "outpatient",
    enableTelemedicine: true,
    enableClinicalDecisionSupport: true,
    enableAutoBilling: false,
    enableInventory: true,
    enableNursing: true,
    enableTheatre: true,
    language: "en",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
  }, { merge: true });
  console.log(`  ✅ Settings configured`);

  // ── 5. Fallback: create user + docs via client SDK REST API ──────────
  if (!existingUser) {
    console.log(`\n  ⚠️  Admin user creation may time out via Admin SDK due to network restrictions.`);
    console.log(`  If the admin user was not created above, run the REST API fallback:`);
    console.log(`\n    curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCCUEUTX4jtj6NieEgvUVG5pNEJYcTg94g"`);
    console.log(`      -H "Content-Type: application/json"`);
    console.log(`      -d '{"email":"${ADMIN_EMAIL}","password":"Admin123!","displayName":"Dr. AMEXAN Admin"}'`);
    console.log(`\n  Then create the Firestore user doc via the encounter-center UI login.`);
  }

  console.log(`\n✅✅✅ Full production seed complete!\n`);
  console.log(`  Organization: ${ORG_ID}`);
  console.log(`  Departments: ${DEPTS.length}`);
  console.log(`  Total units: ${DEPTS.reduce((s, d) => s + d.units.length, 0)}`);
  console.log(`  Admin login: ${ADMIN_EMAIL} / Admin123!`);
  console.log(`\n  Visit: http://localhost:3456/encounter-center\n`);
}

seedFullProduction().catch(console.error);
