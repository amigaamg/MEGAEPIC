/**
 * AMEXAN — Production Firestore Seed Script
 * Populates complete patient monitoring data for Dr. AMEXAN's patient YZTUZM4F.
 * Covers: Hypertension (HTN) + Type 2 Diabetes (T2DM)
 *         toolAssignments, toolReadings, disease_enrollments, care_pathways, alerts
 *
 * Usage:
 *   npx tsx scripts/seed-production.ts
 *
 * Credentials from .env.local
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

// ── Load .env.local ─────────────────────────────────────────────
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// ── Init Admin SDK from .env.local ──────────────────────────────
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY is not set in .env.local");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
const auth = admin.auth();

// ── IDs ─────────────────────────────────────────────────────────
const PATIENT_ID  = "YZTUZM4F";

// ── Helpers ─────────────────────────────────────────────────────
function ts(year: number, month: number, day: number, hour = 8, min = 0): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromDate(new Date(year, month - 1, day, hour, min));
}

function daysAgo(n: number): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromMillis(Date.now() - n * 86_400_000);
}

function hoursAgo(n: number): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromMillis(Date.now() - n * 3_600_000);
}

async function upsert(col: string, id: string, data: Record<string, unknown>) {
  await db.collection(col).doc(id).set(data, { merge: true });
  console.log(`  ✓ ${col}/${id}`);
}

// ─────────────────────────────────────────────────────────────
// MAIN SEED
// ─────────────────────────────────────────────────────────────
async function seed() {
  console.log("\n🌱 AMEXAN Production Seed — Starting...\n");

  // ── Resolve DOCTOR_UID from Firebase Auth ──────────────────
  let DOCTOR_UID: string;
  try {
    const userRecord = await auth.getUserByEmail("amgamiga1@gmail.com");
    DOCTOR_UID = userRecord.uid;
    console.log(`  ✓ Found doctor in Auth: ${DOCTOR_UID} (amgamiga1@gmail.com)`);
  } catch {
    // Doctor not in Auth yet — create a placeholder
    DOCTOR_UID = "doctor_amexan";
    console.log(`  ⚠ Doctor not found in Auth — using placeholder ID: ${DOCTOR_UID}`);
  }

  const ASSIGNMENT_BP  = `assg_bp_${PATIENT_ID}`;
  const ASSIGNMENT_GLU = `assg_glu_${PATIENT_ID}`;
  const ASSIGNMENT_MED = `assg_med_${PATIENT_ID}`;

  // ═════════════════════════════════════════════════════════════
  // 1. USERS (for role resolution)
  // ═════════════════════════════════════════════════════════════
  await upsert("users", PATIENT_ID, { role: "patient" });
  await upsert("users", DOCTOR_UID, { role: "doctor" });

  // ═════════════════════════════════════════════════════════════
  // 2. DOCTOR PROFILE
  // ═════════════════════════════════════════════════════════════
  await upsert("doctors", DOCTOR_UID, {
    name: "Dr. AMEXAN",
    email: "amgamiga1@gmail.com",
    phone: "+254 700 000 000",
    specialization: "Plastic Surgeon / Chronic Disease Management",
    licenseNumber: "KE-MED-2020-0001",
    facilityName: "AMEXAN Health Clinic",
    facilityId: "facility_amexan",
    createdAt: ts(2024, 6, 1),
  });

  // ═════════════════════════════════════════════════════════════
  // 3. PATIENT PROFILE
  // ═════════════════════════════════════════════════════════════
  await upsert("patients", PATIENT_ID, {
    name: "User",
    dob: ts(1986, 7, 22),
    gender: "male",
    phone: "+254 712 345 000",
    email: "user.yztuzm4f@email.com",
    nationalId: "KE-0000000",
    assignedDoctorId: DOCTOR_UID,
    riskLevel: "high",
    activeToolTypes: ["hypertension", "diabetes"],
    createdAt: ts(2025, 11, 1),
    updatedAt: ts(2026, 3, 5),
  });

  // ═════════════════════════════════════════════════════════════
  // 4. PATIENT TOOLS (legacy — old system)
  // ═════════════════════════════════════════════════════════════
  await upsert("patientTools", `tool_htn_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    toolType: "hypertension",
    diagnosis: "Essential Hypertension Stage 2 — uncontrolled on monotherapy",
    assignedAt: ts(2025, 11, 1),
    assignedBy: DOCTOR_UID,
    doctorId: DOCTOR_UID,
    status: "active",
    targetBP: "<130/80",
    alertThresholds: {
      systolicCritical: 180, diastolicCritical: 120,
      systolicWarning: 160, diastolicWarning: 100,
      systolicTarget: 130, diastolicTarget: 80,
      hypotensionSystolic: 90, adherenceLow: 70,
      bpReadingGapDays: 3, uncontrolledReadingsCount: 7,
      uncontrolledReadingsDays: 14,
    },
    monitoringFrequency: "daily",
    clinicalNotes: "Stage 2 HTN. Currently on Amlodipine 10mg + Losartan 100mg. BP 150/90 at last visit. Target <130/80.",
    updatedAt: ts(2026, 3, 5),
  });

  await upsert("patientTools", `tool_dm_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    toolType: "diabetes",
    diagnosis: "Type 2 Diabetes Mellitus — on oral hypoglycaemics",
    assignedAt: ts(2025, 12, 1),
    assignedBy: DOCTOR_UID,
    doctorId: DOCTOR_UID,
    status: "active",
    targetBP: "<130/80",
    alertThresholds: {
      systolicCritical: 180, diastolicCritical: 120,
      systolicWarning: 160, diastolicWarning: 100,
      systolicTarget: 130, diastolicTarget: 80,
      hypotensionSystolic: 90, adherenceLow: 70,
      bpReadingGapDays: 3, uncontrolledReadingsCount: 7,
      uncontrolledReadingsDays: 14,
    },
    monitoringFrequency: "daily",
    clinicalNotes: "T2DM diagnosed 2025. HbA1c 7.2% at last check. On Metformin 1000mg BD + Empagliflozin 10mg OD. Glucose 7 mmol/L fasting.",
    updatedAt: ts(2026, 3, 5),
  });

  // ═════════════════════════════════════════════════════════════
  // 5. TOOL ASSIGNMENTS (camelCase — used by PatientHealthDashboard)
  // ═════════════════════════════════════════════════════════════
  await upsert("toolAssignments", ASSIGNMENT_BP, {
    toolType: "bp_monitor",
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    active: true,
    assignedAt: ts(2025, 11, 1),
    instructions: "Sit quietly for 5 minutes before measuring. Record both values from your BP cuff. Measure twice daily — morning before meds and evening before dinner.",
    frequency: "Twice daily (morning & evening)",
    targetValues: { systolic: { min: 90, max: 130 }, diastolic: { min: 60, max: 80 } },
    alertThresholds: { systolicHigh: 160, systolicCritical: 180, diastolicHigh: 100, diastolicCritical: 120 },
  });

  await upsert("toolAssignments", ASSIGNMENT_GLU, {
    toolType: "glucose_tracker",
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    active: true,
    assignedAt: ts(2025, 12, 1),
    instructions: "Record reading type (fasting, before meal, after meal). Always note what you ate if post-meal. Check fasting glucose each morning before breakfast.",
    frequency: "Per doctor's instruction (usually 2–4× daily)",
    targetValues: { fasting: { min: 4.0, max: 7.0 }, postMeal: { min: 0, max: 8.5 } },
    alertThresholds: { hypoglycemia: 3.9, hyperglycemia: 13.9, criticalHigh: 20 },
  });

  await upsert("toolAssignments", ASSIGNMENT_MED, {
    toolType: "medication_adherence",
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    active: true,
    assignedAt: ts(2025, 11, 1),
    instructions: "Check off each medication as you take it. Log any side effects or missed doses. Take Amlodipine 10mg, Losartan 100mg, Metformin 1000mg, Empagliflozin 10mg daily.",
    frequency: "Daily",
    targetValues: { adherenceRate: { min: 95, max: 100 } },
  });

  // ═════════════════════════════════════════════════════════════
  // 5b. TOOL ASSIGNMENTS (snake_case — used by MonitoringDashboard)
  // ═════════════════════════════════════════════════════════════
  await upsert("tool_assignments", ASSIGNMENT_BP, {
    toolType: "bp_monitor",
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    active: true,
    assignedAt: ts(2025, 11, 1),
    instructions: "Sit quietly for 5 minutes before measuring. Record both values from your BP cuff.",
    frequency: "Twice daily (morning & evening)",
    targetValues: { systolic: { min: 90, max: 130 }, diastolic: { min: 60, max: 80 } },
    alertThresholds: { systolicHigh: 160, systolicCritical: 180, diastolicHigh: 100, diastolicCritical: 120 },
  });

  await upsert("tool_assignments", ASSIGNMENT_GLU, {
    toolType: "glucose_tracker",
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    active: true,
    assignedAt: ts(2025, 12, 1),
    instructions: "Record reading type (fasting, before meal, after meal). Check fasting glucose each morning.",
    frequency: "Per doctor's instruction (usually 2–4× daily)",
    targetValues: { fasting: { min: 4.0, max: 7.0 }, postMeal: { min: 0, max: 8.5 } },
    alertThresholds: { hypoglycemia: 3.9, hyperglycemia: 13.9, criticalHigh: 20 },
  });

  await upsert("tool_assignments", ASSIGNMENT_MED, {
    toolType: "medication_adherence",
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    active: true,
    assignedAt: ts(2025, 11, 1),
    instructions: "Check off each medication as you take it. Log any side effects or missed doses.",
    frequency: "Daily",
    targetValues: { adherenceRate: { min: 95, max: 100 } },
  });

  // ═════════════════════════════════════════════════════════════
  // 6. BP TOOL READINGS (14 readings — 2 weeks of data)
  // ═════════════════════════════════════════════════════════════
  const bpReadings = [
    // Latest readings first (desc order for display)
    { sys:150, dia:90,  pulse:78, arm:"left", position:"sitting", note:"Morning reading" },
    { sys:148, dia:88,  pulse:76, arm:"left", position:"sitting", note:"Evening reading, feeling well" },
    { sys:152, dia:92,  pulse:80, arm:"left", position:"sitting", note:"After work stress" },
    { sys:146, dia:86,  pulse:74, arm:"left", position:"sitting", note:"Resting at home" },
    { sys:155, dia:94,  pulse:82, arm:"left", position:"sitting", note:"Morning reading — headache" },
    { sys:144, dia:85,  pulse:72, arm:"right", position:"sitting", note:"Evening, after medication" },
    { sys:149, dia:89,  pulse:77, arm:"left", position:"sitting", note:"Before dinner" },
    { sys:151, dia:91,  pulse:79, arm:"left", position:"sitting", note:"Morning, before medications" },
    { sys:147, dia:87,  pulse:75, arm:"left", position:"sitting", note:"Afternoon rest" },
    { sys:153, dia:93,  pulse:81, arm:"left", position:"sitting", note:"Evening — feeling anxious" },
    { sys:145, dia:86,  pulse:73, arm:"right", position:"sitting", note:"Morning, well rested" },
    { sys:150, dia:90,  pulse:78, arm:"left", position:"sitting", note:"Clinic visit — Dr. AMEXAN" },
    { sys:156, dia:95,  pulse:83, arm:"left", position:"sitting", note:"Feeling stressed about work" },
    { sys:143, dia:84,  pulse:71, arm:"left", position:"sitting", note:"Good day, took all meds" },
  ];

  for (let i = 0; i < bpReadings.length; i++) {
    const r = bpReadings[i];
    const label = r.sys >= 180 || r.dia >= 120 ? "🚨 Hypertensive Crisis"
      : r.sys >= 160 || r.dia >= 100 ? "⚠️ Stage 2 Hypertension"
      : r.sys >= 140 || r.dia >= 90 ? "📹 Stage 1 Hypertension"
      : r.sys >= 130 || r.dia >= 80 ? "👀 Elevated BP"
      : "✅ Normal BP";
    const level = r.sys >= 180 || r.dia >= 120 ? "hospital"
      : r.sys >= 160 || r.dia >= 100 ? "clinic"
      : r.sys >= 140 || r.dia >= 90 ? "video"
      : r.sys >= 130 || r.dia >= 80 ? "watch"
      : "normal";
    const urgency = level === "hospital" ? "emergency" : level === "clinic" ? "urgent" : "routine";
    const alertDoctor = level === "hospital" || level === "clinic" || level === "video";

    await upsert("toolReadings", `bp_${PATIENT_ID}_${i}`, {
      toolType: "bp_monitor",
      patientId: PATIENT_ID,
      doctorId: DOCTOR_UID,
      assignmentId: ASSIGNMENT_BP,
      enteredBy: "patient",
      data: {
        systolic: r.sys,
        diastolic: r.dia,
        pulse: r.pulse,
        arm: r.arm,
        position: r.position,
        note: r.note,
      },
      recordedAt: daysAgo(i * 1 + 0.5), // ~every 1-2 days spaced out
      doctorReviewed: i === 0,
      ...(i === 0 ? { doctorNote: "book video" } : {}),
      triage: {
        level,
        label,
        message: `BP ${r.sys}/${r.dia} mmHg — ${label}`,
        urgency,
        alertDoctor,
        alertPatient: true,
      },
    });
  }

  // ═════════════════════════════════════════════════════════════
  // 7. GLUCOSE TOOL READINGS (10 readings)
  // ═════════════════════════════════════════════════════════════
  const glucoseReadings = [
    { val:7.0,  type:"fasting",   meal:"",             insulin:"none", note:"Fasting morning" },
    { val:7.2,  type:"fasting",   meal:"",             insulin:"none", note:"Woke up slightly higher" },
    { val:6.8,  type:"fasting",   meal:"",             insulin:"none", note:"Good reading" },
    { val:6.5,  type:"fasting",   meal:"",             insulin:"none", note:"Fasting — well controlled" },
    { val:8.1,  type:"post_meal", meal:"ugali and sukuma", insulin:"none", note:"After lunch" },
    { val:7.8,  type:"post_meal", meal:"2 chapattis and beans", insulin:"none", note:"After dinner" },
    { val:6.3,  type:"pre_meal",  meal:"",             insulin:"none", note:"Before lunch" },
    { val:7.5,  type:"random",    meal:"rice and beef", insulin:"none", note:"Random afternoon" },
    { val:6.9,  type:"fasting",   meal:"",             insulin:"none", note:"Fasting — normal" },
    { val:7.1,  type:"fasting",   meal:"",             insulin:"none", note:"Morning reading" },
  ];

  for (let i = 0; i < glucoseReadings.length; i++) {
    const r = glucoseReadings[i];
    const threshold = r.type === "fasting" ? 7.0 : 11.1;
    const label = r.val >= 20 ? "🚨 Severe Hyperglycaemia"
      : r.val >= 15 ? "⚠️ Very High Glucose"
      : r.val >= threshold ? "📹 High Glucose"
      : r.val <= 3.0 ? "🚨 Severe Hypoglycaemia"
      : r.val <= 3.9 ? "⬇️ Low Glucose"
      : "✅ Normal Glucose";
    const level = r.val >= 20 ? "hospital"
      : r.val >= 15 ? "clinic"
      : r.val >= threshold ? "video"
      : "normal";
    const urgency = level === "hospital" ? "emergency" : level === "clinic" ? "urgent" : "routine";
    const alertDoctor = level === "hospital" || level === "clinic" || level === "video";

    await upsert("toolReadings", `glu_${PATIENT_ID}_${i}`, {
      toolType: "glucose_tracker",
      patientId: PATIENT_ID,
      doctorId: DOCTOR_UID,
      assignmentId: ASSIGNMENT_GLU,
      enteredBy: "patient",
      data: {
        value: r.val,
        readingType: r.type,
        meal: r.meal || undefined,
        insulin: r.insulin,
        note: r.note,
      },
      recordedAt: daysAgo(i * 1.2 + 0.3),
      doctorReviewed: i === 0,
      triage: {
        level,
        label,
        message: `Glucose ${r.val} mmol/L — ${level === "video" ? "above target. Medication review recommended." : level === "normal" ? "within target range." : ""}`,
        urgency,
        alertDoctor,
        alertPatient: alertDoctor,
      },
    });
  }

  // ═════════════════════════════════════════════════════════════
  // 8. MEDICATION ADHERENCE READINGS (7 days)
  // ═════════════════════════════════════════════════════════════
  const medReadings = [
    { taken:"all", missed:"", reason:"", sideEffects:"", refillNeeded:"no" },
    { taken:"all", missed:"", reason:"", sideEffects:"", refillNeeded:"no" },
    { taken:"all", missed:"", reason:"", sideEffects:"", refillNeeded:"no" },
    { taken:"some", missed:"Evening Metformin", reason:"forgot", sideEffects:"", refillNeeded:"no" },
    { taken:"all", missed:"", reason:"", sideEffects:"", refillNeeded:"no" },
    { taken:"all", missed:"", reason:"", sideEffects:"Slight nausea after Metformin", refillNeeded:"soon" },
    { taken:"all", missed:"", reason:"", sideEffects:"", refillNeeded:"no" },
  ];

  for (let i = 0; i < medReadings.length; i++) {
    const r = medReadings[i];
    const compliance = r.taken === "all" ? "✅ Good" : "⚠️ Partial";
    await upsert("toolReadings", `med_${PATIENT_ID}_${i}`, {
      toolType: "medication_adherence",
      patientId: PATIENT_ID,
      doctorId: DOCTOR_UID,
      assignmentId: ASSIGNMENT_MED,
      enteredBy: "patient",
      data: {
        taken: r.taken,
        missed: r.missed || undefined,
        reason: r.reason || undefined,
        side_effects: r.sideEffects || undefined,
        refill_needed: r.refillNeeded,
      },
      recordedAt: daysAgo(i * 1),
      doctorReviewed: false,
      triage: {
        level: r.taken === "all" ? "normal" : "watch",
        label: `${compliance} Adherence`,
        message: r.taken === "all" ? "All medications taken today" : "Some medications missed — review needed",
        urgency: "routine",
        alertDoctor: r.taken !== "all",
        alertPatient: true,
      },
    });
  }

  // ═════════════════════════════════════════════════════════════
  // 9. DISEASE ENROLLMENTS
  // ═════════════════════════════════════════════════════════════
  await upsert("disease_enrollments", `enr_htn_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    diseaseType: "hypertension",
    status: "active",
    enrolledAt: ts(2025, 11, 1),
    diagnosis: "Essential Hypertension Stage 2 (ICD: I10)",
    riskLevel: "high",
    milestones: [
      { label: "BP Controlled (<130/80)", achieved: false },
      { label: "On Single Agent", achieved: false },
      { label: "Lifestyle Modified", achieved: true, achievedAt: ts(2025, 12, 1) },
      { label: "6-month Target", achieved: false },
      { label: "CV Risk Assessed", achieved: true, achievedAt: ts(2026, 1, 15) },
    ],
    notes: "Stage 2 HTN. On dual therapy (Amlodipine 10mg + Losartan 100mg). BP trending down but still above target. Monitor monthly.",
  });

  await upsert("disease_enrollments", `enr_dm_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    diseaseType: "diabetes_t2",
    status: "active",
    enrolledAt: ts(2025, 12, 1),
    diagnosis: "Type 2 Diabetes Mellitus (ICD: E11)",
    riskLevel: "moderate",
    milestones: [
      { label: "HbA1c < 7.0%", achieved: false },
      { label: "Monotherapy", achieved: false },
      { label: "Foot Exam Done", achieved: false },
      { label: "Eye Screening", achieved: false },
      { label: "Nephropathy Screening", achieved: false },
    ],
    notes: "T2DM diagnosed Dec 2025. On Metformin 1000mg BD + Empagliflozin 10mg OD. Glucose 7.0 mmol/L fasting. Working on diet modification.",
  });

  // ═════════════════════════════════════════════════════════════
  // 10. DISEASE READINGS (metricKeys match ChronicDiseaseMonitor.DISEASE_CONFIGS)
  // ═════════════════════════════════════════════════════════════
  const diseaseReadings = [
    // Hypertension metrics
    { dx:"hypertension", metric:"systolic", val:150, unit:"mmHg", note:"Latest clinic reading", days:1 },
    { dx:"hypertension", metric:"diastolic", val:90, unit:"mmHg", note:"Latest clinic reading", days:1 },
    { dx:"hypertension", metric:"heartRate", val:78, unit:"bpm", note:"Resting", days:2 },
    { dx:"hypertension", metric:"weight", val:82, unit:"kg", note:"This month", days:3 },
    // Diabetes metrics
    { dx:"diabetes_t2", metric:"hba1c", val:7.2, unit:"%", note:"Last lab result", days:45 },
    { dx:"diabetes_t2", metric:"fastingGlucose", val:7.0, unit:"mmol/L", note:"Fasting morning", days:1 },
    { dx:"diabetes_t2", metric:"postPrandial", val:8.1, unit:"mmol/L", note:"2h after lunch", days:5 },
    { dx:"diabetes_t2", metric:"weight", val:82, unit:"kg", note:"Monthly check", days:5 },
  ];

  for (let i = 0; i < diseaseReadings.length; i++) {
    const r = diseaseReadings[i];
    await upsert("disease_readings", `dr_${PATIENT_ID}_${i}`, {
      patientId: PATIENT_ID,
      doctorId: DOCTOR_UID,
      diseaseType: r.dx,
      metricKey: r.metric,
      value: r.val,
      unit: r.unit,
      note: r.note,
      recordedAt: daysAgo(r.days),
      recordedBy: "doctor",
    });
  }

  // ═════════════════════════════════════════════════════════════
  // 11. CARE PATHWAYS
  // ═════════════════════════════════════════════════════════════
  await upsert("care_pathways", `cp_htn_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    pathwayId: "hypertension",
    pathwayName: "Hypertension Care",
    status: "active",
    startDate: ts(2025, 11, 1),
    currentMilestone: 3,
    milestones: [
      { id:0, label:"Initial Assessment", completed:true, completedAt:ts(2025,11,1) },
      { id:1, label:"Lifestyle Modification", completed:true, completedAt:ts(2025,11,15) },
      { id:2, label:"Medication Optimisation", completed:true, completedAt:ts(2025,12,15) },
      { id:3, label:"BP Control Target", completed:false, dueDate:ts(2026,6,1) },
      { id:4, label:"Annual Complication Screening", completed:false, dueDate:ts(2026,11,1) },
      { id:5, label:"Long-term Maintenance", completed:false, dueDate:ts(2026,12,31) },
    ],
    lastReviewDate: ts(2026, 3, 5),
    nextReviewDate: ts(2026, 4, 5),
    notes: "BP 150/90 at last visit. Continue Amlodipine + Losartan. Review in 1 month.",
  });

  await upsert("care_pathways", `cp_dm_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    pathwayId: "diabetes_t2",
    pathwayName: "Type 2 Diabetes Care",
    status: "active",
    startDate: ts(2025, 12, 1),
    currentMilestone: 2,
    milestones: [
      { id:0, label:"Initial Assessment", completed:true, completedAt:ts(2025,12,1) },
      { id:1, label:"Medication Initiation", completed:true, completedAt:ts(2025,12,15) },
      { id:2, label:"Glucose Monitoring Established", completed:true, completedAt:ts(2026,1,15) },
      { id:3, label:"HbA1c Target <7.0%", completed:false, dueDate:ts(2026,6,1) },
      { id:4, label:"Annual Complication Screening", completed:false, dueDate:ts(2026,12,1) },
      { id:5, label:"Long-term Maintenance", completed:false, dueDate:ts(2027,12,1) },
    ],
    lastReviewDate: ts(2026, 3, 5),
    nextReviewDate: ts(2026, 4, 5),
    notes: "Fasting glucose 7.0 mmol/L. HbA1c 7.2% — close to target. Diet intensification needed.",
  });

  // ═════════════════════════════════════════════════════════════
  // 12. ALERTS
  // ═════════════════════════════════════════════════════════════
  await upsert("alerts", `alert_bp_${PATIENT_ID}_1`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "triage",
    title: "❤️ Blood Pressure Alert — Stage 1 Hypertension",
    message: "BP 150/90 mmHg — elevated. Doctor review recommended within 48h.",
    urgency: "urgent",
    read: false,
    createdAt: daysAgo(0.5),
    toolType: "bp_monitor",
  });

  await upsert("alerts", `alert_bp_${PATIENT_ID}_2`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "triage",
    title: "❤️ Blood Pressure Alert — Stage 1 Hypertension",
    message: "BP 148/88 mmHg — monitoring. Continue current plan.",
    urgency: "routine",
    read: true,
    createdAt: daysAgo(2),
    toolType: "bp_monitor",
  });

  await upsert("alerts", `alert_bp_${PATIENT_ID}_3`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "triage",
    title: "❤️ Blood Pressure Alert — Elevated",
    message: "BP 152/92 mmHg — elevated. Review salt intake and stress management.",
    urgency: "routine",
    read: true,
    createdAt: daysAgo(4),
    toolType: "bp_monitor",
  });

  await upsert("alerts", `alert_glu_${PATIENT_ID}_1`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "triage",
    title: "🩸 Blood Glucose Alert — High Glucose",
    message: "Glucose 7.0 mmol/L (fasting) — above target. Medication review recommended.",
    urgency: "urgent",
    read: false,
    createdAt: daysAgo(0.5),
    toolType: "glucose_tracker",
  });

  await upsert("alerts", `alert_glu_${PATIENT_ID}_2`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "triage",
    title: "🩸 Blood Glucose Alert — Post-meal High",
    message: "Glucose 8.1 mmol/L — elevated after lunch. Consider lower-carb meal option.",
    urgency: "routine",
    read: true,
    createdAt: daysAgo(3),
    toolType: "glucose_tracker",
  });

  await upsert("alerts", `alert_glu_${PATIENT_ID}_3`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "triage",
    title: "🩸 Blood Glucose Alert — Post-meal High",
    message: "Glucose 7.8 mmol/L — slightly elevated post-meal. Monitor portion sizes.",
    urgency: "routine",
    read: false,
    createdAt: daysAgo(5),
    toolType: "glucose_tracker",
  });

  await upsert("alerts", `alert_med_${PATIENT_ID}_1`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "triage",
    title: "💊 Medication Alert — Missed Dose",
    message: "Evening Metformin dose was missed today. Please take as soon as remembered.",
    urgency: "routine",
    read: false,
    createdAt: daysAgo(3),
    toolType: "medication_adherence",
  });

  await upsert("alerts", `alert_med_${PATIENT_ID}_2`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "triage",
    title: "💊 Medication Refill Needed",
    message: "Metformin running out soon. Please arrange refill within 1 week.",
    urgency: "routine",
    read: false,
    createdAt: daysAgo(1),
    toolType: "medication_adherence",
  });

  // ═════════════════════════════════════════════════════════════
  // 13. PRESCRIPTIONS & APPOINTMENTS (via appointments data)
  // ═════════════════════════════════════════════════════════════
  await upsert("prescriptions", `rx_amlodipine_${PATIENT_ID}`, {
    toolId: `tool_htn_${PATIENT_ID}`,
    patientId: PATIENT_ID,
    drug: "Amlodipine",
    drugClass: "CCB",
    dose: "10 mg",
    frequency: "once daily",
    route: "oral",
    startDate: ts(2025, 11, 1),
    prescribedBy: DOCTOR_UID,
    status: "active",
    indication: "Stage 2 Hypertension — calcium channel blocker",
    instructions: "Take every morning. Ankle swelling is common — report if persistent.",
    sideEffectsToWatch: ["ankle oedema", "flushing", "headache", "dizziness"],
    doseChanges: [],
    createdAt: ts(2025, 11, 1),
    updatedAt: ts(2025, 11, 1),
  });

  await upsert("prescriptions", `rx_losartan_${PATIENT_ID}`, {
    toolId: `tool_htn_${PATIENT_ID}`,
    patientId: PATIENT_ID,
    drug: "Losartan",
    drugClass: "ARB",
    dose: "100 mg",
    frequency: "once daily",
    route: "oral",
    startDate: ts(2025, 12, 15),
    prescribedBy: DOCTOR_UID,
    status: "active",
    indication: "Resistant Hypertension — ARB added for dual therapy and renal protection",
    instructions: "Take every morning with or without food. Report dizziness when standing.",
    sideEffectsToWatch: ["hyperkalaemia", "dizziness", "renal impairment"],
    doseChanges: [{
      date: ts(2025, 12, 15),
      previousDose: "",
      newDose: "50 mg",
      reason: "Initiated ARB therapy for resistant HTN",
      changedBy: DOCTOR_UID,
    }, {
      date: ts(2026, 2, 1),
      previousDose: "50 mg",
      newDose: "100 mg",
      reason: "BP not at target on 50mg — escalated to 100mg",
      changedBy: DOCTOR_UID,
    }],
    createdAt: ts(2025, 12, 15),
    updatedAt: ts(2026, 2, 1),
  });

  await upsert("prescriptions", `rx_metformin_${PATIENT_ID}`, {
    toolId: `tool_dm_${PATIENT_ID}`,
    patientId: PATIENT_ID,
    drug: "Metformin",
    drugClass: "Biguanide",
    dose: "1000 mg",
    frequency: "twice daily (with meals)",
    route: "oral",
    startDate: ts(2025, 12, 1),
    prescribedBy: DOCTOR_UID,
    status: "active",
    indication: "Type 2 Diabetes — first-line therapy",
    instructions: "Take with breakfast and dinner. GI side effects common initially — usually resolve.",
    sideEffectsToWatch: ["nausea", "diarrhoea", "metallic taste", "lactic acidosis (rare)"],
    doseChanges: [{
      date: ts(2025, 12, 1),
      previousDose: "",
      newDose: "500 mg BD",
      reason: "Initiated Metformin for T2DM",
      changedBy: DOCTOR_UID,
    }, {
      date: ts(2026, 1, 15),
      previousDose: "500 mg BD",
      newDose: "1000 mg BD",
      reason: "Glucose not at target — escalated to maximum dose",
      changedBy: DOCTOR_UID,
    }],
    createdAt: ts(2025, 12, 1),
    updatedAt: ts(2026, 1, 15),
  });

  await upsert("prescriptions", `rx_empagliflozin_${PATIENT_ID}`, {
    toolId: `tool_dm_${PATIENT_ID}`,
    patientId: PATIENT_ID,
    drug: "Empagliflozin",
    drugClass: "SGLT2 Inhibitor",
    dose: "10 mg",
    frequency: "once daily (morning)",
    route: "oral",
    startDate: ts(2026, 1, 15),
    prescribedBy: DOCTOR_UID,
    status: "active",
    indication: "Type 2 Diabetes — SGLT2i for glucose control + CV/renal protection",
    instructions: "Take every morning. Increase fluid intake. Monitor for UTI symptoms.",
    sideEffectsToWatch: ["UTI", "genital mycotic infection", "dehydration", "hypoglycaemia (if on insulin/SU)"],
    doseChanges: [],
    createdAt: ts(2026, 1, 15),
    updatedAt: ts(2026, 1, 15),
  });

  // ═════════════════════════════════════════════════════════════
  // 14. CONSULTATIONS (for appointment prescriptions)
  // ═════════════════════════════════════════════════════════════
  const CONSULT_HTN = `consult_htn_${PATIENT_ID}`;
  const CONSULT_DM  = `consult_dm_${PATIENT_ID}`;
  const CONSULT_FU  = `consult_fu_${PATIENT_ID}`;

  await upsert("consultations", CONSULT_HTN, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    doctorName: "Dr. AMEXAN",
    date: ts(2025, 11, 1),
    type: "clinic",
    status: "completed",
    chiefComplaint: "Routine HTN assessment — BP 165/95 on monotherapy",
    diagnosis: "Essential Hypertension Stage 2 (I10)",
    prescriptions: [
      { medication:"Amlodipine", dosage:"10 mg", frequency:"once daily", route:"oral", duration:"3 months", instructions:"Take every morning" },
      { medication:"Losartan", dosage:"50 mg", frequency:"once daily", route:"oral", duration:"3 months", instructions:"Take every morning" },
    ],
    notes: "Initiated dual therapy. BP target <130/80. Review in 4 weeks.",
    createdAt: ts(2025, 11, 1),
    updatedAt: ts(2025, 11, 1),
  });

  await upsert("consultations", CONSULT_DM, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    doctorName: "Dr. AMEXAN",
    date: ts(2025, 12, 1),
    type: "clinic",
    status: "completed",
    chiefComplaint: "New diagnosis T2DM — HbA1c 8.2%, fasting glucose 9.5 mmol/L",
    diagnosis: "Type 2 Diabetes Mellitus (E11)",
    prescriptions: [
      { medication:"Metformin", dosage:"500 mg", frequency:"twice daily with meals", route:"oral", duration:"3 months", instructions:"Take with breakfast and dinner" },
      { medication:"Empagliflozin", dosage:"10 mg", frequency:"once daily morning", route:"oral", duration:"3 months", instructions:"Take every morning. Increase fluid intake" },
    ],
    notes: "Initiated Metformin 500mg BD, will escalate to 1000mg BD at 4 weeks if tolerated. Added Empagliflozin 10mg OD for CV protection.",
    createdAt: ts(2025, 12, 1),
    updatedAt: ts(2025, 12, 1),
  });

  await upsert("consultations", CONSULT_FU, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    doctorName: "Dr. AMEXAN",
    date: ts(2026, 3, 5),
    type: "review",
    status: "completed",
    chiefComplaint: "Follow-up — BP 150/90, glucose 7.0 mmol/L fasting",
    diagnosis: "HTN + T2DM — partial control",
    prescriptions: [
      { medication:"Amlodipine", dosage:"10 mg", frequency:"once daily", route:"oral", duration:"3 months", instructions:"Take every morning" },
      { medication:"Losartan", dosage:"100 mg", frequency:"once daily", route:"oral", duration:"3 months", instructions:"Take every morning" },
      { medication:"Metformin", dosage:"1000 mg", frequency:"twice daily with meals", route:"oral", duration:"3 months", instructions:"Take with breakfast and dinner" },
      { medication:"Empagliflozin", dosage:"10 mg", frequency:"once daily morning", route:"oral", duration:"3 months", instructions:"Take every morning" },
    ],
    notes: "BP 150/90 — still above target. Losartan escalated to 100mg. Metformin at 1000mg BD. Video consult booked for medication review. Continue monitoring.",
    createdAt: ts(2026, 3, 5),
    updatedAt: ts(2026, 3, 5),
  });

  // ═════════════════════════════════════════════════════════════
  // 15. APPOINTMENTS (feeds medication timeline in PatientHealthDashboard)
  // ═════════════════════════════════════════════════════════════
  await upsert("appointments", `appt_htn_initial_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    doctorName: "Dr. AMEXAN",
    date: ts(2025, 11, 1, 10, 0),
    type: "clinic",
    status: "completed",
    specialty: "Chronic Disease Management",
    consultationId: CONSULT_HTN,
    paymentStatus: "paid",
    notes: "Initial HTN assessment",
    createdAt: ts(2025, 11, 1),
  });

  await upsert("appointments", `appt_dm_initial_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    doctorName: "Dr. AMEXAN",
    date: ts(2025, 12, 1, 11, 0),
    type: "clinic",
    status: "completed",
    specialty: "Chronic Disease Management",
    consultationId: CONSULT_DM,
    paymentStatus: "paid",
    notes: "Initial T2DM assessment",
    createdAt: ts(2025, 12, 1),
  });

  await upsert("appointments", `appt_followup_mar_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    doctorName: "Dr. AMEXAN",
    date: ts(2026, 3, 5, 9, 30),
    type: "review",
    status: "completed",
    specialty: "Chronic Disease Management",
    consultationId: CONSULT_FU,
    paymentStatus: "paid",
    notes: "Routine 3-month review. BP 150/90, glucose 7.0. Losartan increased to 100mg.",
    createdAt: ts(2026, 3, 5),
  });

  await upsert("appointments", `appt_next_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    doctorName: "Dr. AMEXAN",
    date: ts(2026, 4, 5, 10, 30),
    type: "review",
    status: "scheduled",
    specialty: "Chronic Disease Management",
    paymentStatus: "pending",
    notes: "Routine 4-week review — check BP trends and glucose logs",
    createdAt: ts(2026, 3, 5),
  });

  // ═════════════════════════════════════════════════════════════
  // 16. TIMELINE EVENTS
  // ═════════════════════════════════════════════════════════════
  const timelineEvents = [
    { type:"pathway_enrolled", desc:"Enrolled in Hypertension Care pathway", daysAgo:150 },
    { type:"pathway_enrolled", desc:"Enrolled in Type 2 Diabetes Care pathway", daysAgo:120 },
    { type:"milestone", desc:"Hypertension — Initial Assessment completed", daysAgo:150 },
    { type:"milestone", desc:"Hypertension — Lifestyle Modifications initiated", daysAgo:135 },
    { type:"milestone", desc:"Hypertension — Medication Optimised (Losartan added)", daysAgo:105 },
    { type:"milestone", desc:"Diabetes — Glucose Monitoring established", daysAgo:90 },
    { type:"reading", desc:"BP 150/90 — Stage 1 Hypertension alert", daysAgo:1 },
    { type:"reading", desc:"Glucose 7.0 mmol/L — above target alert", daysAgo:1 },
    { type:"alert", desc:"Missed medication dose logged", daysAgo:3 },
    { type:"doctor_action", desc:"Doctor reviewed BP trends — video consult booked", daysAgo:1 },
    { type:"tool_assigned", desc:"Blood Pressure Monitor assigned — twice daily", daysAgo:150 },
    { type:"tool_assigned", desc:"Blood Glucose Tracker assigned — daily fasting", daysAgo:120 },
    { type:"tool_assigned", desc:"Medication Tracker assigned — daily logging", daysAgo:150 },
  ];

  for (let i = 0; i < timelineEvents.length; i++) {
    const ev = timelineEvents[i];
    await upsert("timeline_events", `tl_${PATIENT_ID}_${i}`, {
      patientId: PATIENT_ID,
      doctorId: DOCTOR_UID,
      eventType: ev.type,
      description: ev.desc,
      eventDate: daysAgo(ev.daysAgo),
      metadata: {},
    });
  }

  console.log("\n✅ AMEXAN Production Seed complete!");
  console.log(`   Patient:          ${PATIENT_ID}`);
  console.log(`   Doctor:           ${DOCTOR_UID}`);
  console.log(`   Tool Assignments: 3`);
  console.log(`     → bp_monitor    ${ASSIGNMENT_BP}`);
  console.log(`     → glucose       ${ASSIGNMENT_GLU}`);
  console.log(`     → medication    ${ASSIGNMENT_MED}`);
  console.log(`   BP Readings:      ${bpReadings.length}`);
  console.log(`   Glucose Readings: ${glucoseReadings.length}`);
  console.log(`   Med Adherence:    ${medReadings.length}`);
  console.log(`   Disease Enroll:   2`);
  console.log(`   Disease Readings: ${diseaseReadings.length}`);
  console.log(`   Care Pathways:    2`);
  console.log(`   Alerts:           8`);
  console.log(`   Prescriptions:    4`);
  console.log(`   Timeline Events:  ${timelineEvents.length}\n`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});