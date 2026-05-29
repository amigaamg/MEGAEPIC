/**
 * AMEXAN — Supplementary Seed Script
 * Adds: weight_tracker, hba1c_tracker tool assignments + readings
 *        Additional clinical notes, SOAP note for both conditions
 *        Comprehensive care plan data
 *
 * Usage:
 *   npx tsx scripts/seed-supplement.ts
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
const auth = admin.auth();

const PATIENT_ID = "YZTUZM4F";

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

async function seed() {
  console.log("\n🌱 AMEXAN Supplementary Seed — Starting...\n");

  let DOCTOR_UID: string;
  try {
    const userRecord = await auth.getUserByEmail("amgamiga1@gmail.com");
    DOCTOR_UID = userRecord.uid;
    console.log(`  ✓ Found doctor: ${DOCTOR_UID}`);
  } catch {
    DOCTOR_UID = "doctor_amexan";
    console.log(`  ⚠ Using placeholder: ${DOCTOR_UID}`);
  }

  const ASSIGNMENT_WT = `assg_wt_${PATIENT_ID}`;
  const ASSIGNMENT_HB = `assg_hba1c_${PATIENT_ID}`;

  // ═════════════════════════════════════════════════════════════
  // 1. WEIGHT TRACKER — toolAssignments + tool_assignments
  // ═════════════════════════════════════════════════════════════
  await upsert("toolAssignments", ASSIGNMENT_WT, {
    toolType: "weight_tracker",
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    active: true,
    assignedAt: ts(2025, 11, 15),
    instructions: "Weigh yourself at the same time each day, preferably in the morning before eating, after toileting.",
    frequency: "Daily or weekly as directed",
    targetValues: { weight: { min: 70, max: 85 }, bmi: { min: 18.5, max: 25 } },
    alertThresholds: { rapidGain24h: 2, rapidLossWeek: 5 },
  });

  await upsert("tool_assignments", ASSIGNMENT_WT, {
    toolType: "weight_tracker",
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    active: true,
    assignedAt: ts(2025, 11, 15),
    instructions: "Weigh yourself at the same time each day, preferably in the morning before eating.",
    frequency: "Daily or weekly as directed",
    targetValues: { weight: { min: 70, max: 85 }, bmi: { min: 18.5, max: 25 } },
    alertThresholds: { rapidGain24h: 2, rapidLossWeek: 5 },
  });

  // ═════════════════════════════════════════════════════════════
  // 2. HbA1c TRACKER — toolAssignments + tool_assignments
  // ═════════════════════════════════════════════════════════════
  await upsert("toolAssignments", ASSIGNMENT_HB, {
    toolType: "hba1c_tracker",
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    active: true,
    assignedAt: ts(2025, 12, 1),
    instructions: "Enter your HbA1c result from your latest lab report. This is a 3-month average of blood sugar.",
    frequency: "Every 3 months (after lab test)",
    targetValues: { hba1c: { min: 4, max: 7 } },
    alertThresholds: { critical: 10, warning: 8 },
  });

  await upsert("tool_assignments", ASSIGNMENT_HB, {
    toolType: "hba1c_tracker",
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    active: true,
    assignedAt: ts(2025, 12, 1),
    instructions: "Enter your HbA1c result from your latest lab report.",
    frequency: "Every 3 months (after lab test)",
    targetValues: { hba1c: { min: 4, max: 7 } },
    alertThresholds: { critical: 10, warning: 8 },
  });

  // ═════════════════════════════════════════════════════════════
  // 3. WEIGHT READINGS (8 weekly readings)
  // ═════════════════════════════════════════════════════════════
  const weightReadings = [
    { val: 82.0, bmi: 27.1, note: "Initial baseline weight" },
    { val: 81.5, bmi: 26.9, note: "Week 1 — slight decrease" },
    { val: 81.8, bmi: 27.0, note: "Week 2 — stable" },
    { val: 80.9, bmi: 26.7, note: "Week 3 — good progress" },
    { val: 80.5, bmi: 26.6, note: "Week 4 — reduced salt intake helping" },
    { val: 80.2, bmi: 26.5, note: "Week 5 — continuing trend" },
    { val: 79.8, bmi: 26.4, note: "Week 6 — feeling lighter" },
    { val: 79.5, bmi: 26.3, note: "Week 8 — 2.5kg total loss!" },
  ];

  for (let i = 0; i < weightReadings.length; i++) {
    const r = weightReadings[i];
    const bmiLabel = r.bmi >= 30 ? "⚠️ Obese" : r.bmi >= 25 ? "👀 Overweight" : "✅ Normal Weight";
    await upsert("toolReadings", `wt_${PATIENT_ID}_${i}`, {
      toolType: "weight_tracker",
      patientId: PATIENT_ID,
      doctorId: DOCTOR_UID,
      assignmentId: ASSIGNMENT_WT,
      enteredBy: "patient",
      data: { value: r.val, height: 174, waist: r.val < 81 ? 94 : 98, time: "morning_before_eating" },
      recordedAt: daysAgo(i * 7 + 2),
      triage: {
        level: r.bmi >= 30 ? "watch" : r.bmi >= 25 ? "watch" : "normal",
        label: bmiLabel,
        message: `Weight ${r.val} kg (BMI ${r.bmi}) — ${r.bmi >= 25 ? "above ideal. Target BMI <25" : "within healthy range"}`,
        urgency: "routine",
        alertDoctor: r.bmi >= 30,
        alertPatient: true,
      },
    });
  }

  // ═════════════════════════════════════════════════════════════
  // 4. HbA1c READINGS (3 quarterly readings)
  // ═════════════════════════════════════════════════════════════
  const hba1cReadings = [
    { val: 8.2, lab: "Lancet Laboratories", note: "Baseline HbA1c at diagnosis" },
    { val: 7.5, lab: "Lancet Laboratories", note: "3-month review — improvement on Metformin" },
    { val: 7.2, lab: "Lancet Laboratories", note: "Latest — approaching target but still above 7.0%" },
  ];

  for (let i = 0; i < hba1cReadings.length; i++) {
    const r = hba1cReadings[i];
    const level = r.val >= 10 ? "hospital" : r.val >= 8 ? "clinic" : r.val >= 7 ? "video" : r.val >= 6.5 ? "watch" : "normal";
    const label = r.val >= 10 ? "🚨 Critical" : r.val >= 8 ? "⚠️ Poor Control" : r.val >= 7 ? "📹 Borderline" : r.val >= 6.5 ? "👀 Approaching" : "✅ Good";
    await upsert("toolReadings", `hba1c_${PATIENT_ID}_${i}`, {
      toolType: "hba1c_tracker",
      patientId: PATIENT_ID,
      doctorId: DOCTOR_UID,
      assignmentId: ASSIGNMENT_HB,
      enteredBy: "doctor",
      data: { value: r.val, lab: r.lab, labDate: new Date(Date.now() - i * 90 * 86400000).toLocaleDateString("en-GB") },
      recordedAt: daysAgo(i * 90 + 10),
      doctorReviewed: true,
      doctorNote: r.note,
      triage: {
        level,
        label,
        message: `HbA1c ${r.val}% — ${r.val >= 7 ? "above target. Medication/lifestyle review recommended." : "within target. Continue current plan."}`,
        urgency: level === "clinic" ? "urgent" : "routine",
        alertDoctor: level === "clinic" || level === "video",
        alertPatient: true,
      },
    });
  }

  // Update disease_readings with additional weight data
  await upsert("disease_readings", `dr_${PATIENT_ID}_wt_current`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    diseaseType: "hypertension",
    metricKey: "weight",
    value: 79.5,
    unit: "kg",
    note: "Latest — ongoing weight loss from lifestyle modification",
    recordedAt: daysAgo(1),
    recordedBy: "patient",
  });

  await upsert("disease_readings", `dr_${PATIENT_ID}_hba1c_latest`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    diseaseType: "diabetes_t2",
    metricKey: "hba1c",
    value: 7.2,
    unit: "%",
    note: "Latest HbA1c — approaching target of <7.0%",
    recordedAt: daysAgo(10),
    recordedBy: "doctor",
  });

  // Update milestones
  const enrSnapshot = await db.collection("disease_enrollments")
    .where("patientId", "==", PATIENT_ID)
    .where("diseaseType", "==", "hypertension")
    .get();
  if (!enrSnapshot.empty) {
    const enr = enrSnapshot.docs[0];
    const milestones = enr.data().milestones || [];
    const bmiIdx = milestones.findIndex((m: any) => m.label === "Lifestyle Modified");
    if (bmiIdx >= 0 && !milestones[bmiIdx].achieved) {
      milestones[bmiIdx] = { ...milestones[bmiIdx], achieved: true, achievedAt: ts(2026, 1, 15) };
      await enr.ref.update({ milestones });
      console.log("  ✓ Updated hypertension milestones (Lifestyle Modified → achieved)");
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 5. COMPREHENSIVE SOAP CLINICAL NOTE
  // ═════════════════════════════════════════════════════════════
  await upsert("clinicalNotes", `note_comprehensive_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    doctorName: "Dr. AMEXAN",
    type: "soap",
    tags: ["Hypertension", "Diabetes", "Review", "Medication Change"],
    private: false,
    content: {
      subjective: "Patient presents for routine 3-month review. Reports feeling generally well but notes occasional morning headaches (2-3/week). BP readings at home averaging 145-155/85-92 mmHg. Fasting glucose readings 6.5-7.2 mmol/L. Compliant with all medications. No chest pain, palpitations, or dyspnoea. Mild ankle swelling from Amlodipine but tolerable. No hypoglycaemic episodes. Appetite good, diet has improved with reduced salt and sugar intake. Exercise: walking 20 min daily.",
      objective: "BP 150/90 mmHg (left arm, sitting after 5 min rest), HR 76 bpm regular. Weight 79.5 kg (BMI 26.3) — down 2.5 kg from baseline. Cardiac exam: normal S1/S2, no murmurs, no JVP elevation. Chest clear. Mild bilateral ankle oedema (1+). Fundoscopy: cup-disc ratio 0.7 OU (stable). Fasting glucose 7.0 mmol/L (today's POC). Recent HbA1c: 7.2% (3 months ago was 7.5%). eGFR 82 mL/min, K+ 4.6 mmol/L (last lab).",
      assessment: "1. Essential Hypertension Stage 2 (I10) — Partially controlled. BP 150/90 on Amlodipine 10mg + Losartan 100mg. Still above target of <130/80. Target organ damage: LVH on echo (LVMI 112), mild diastolic dysfunction. Contributing factors: overweight (BMI 26.3), dietary sodium intake.\n2. Type 2 Diabetes Mellitus (E11) — Fair control. HbA1c 7.2% trending down from 8.2% at diagnosis. Approaching target of <7.0%. On Metformin 1000mg BD + Empagliflozin 10mg OD. Fasting glucose still borderline.\n3. Primary Open Angle Glaucoma (H40.1) — Stable on Dorzolamide TID. Visual fields pending.\n4. LVH due to chronic HTN — Requires aggressive BP control to promote regression.",
      plan: "1. Continue Amlodipine 10mg OD + Losartan 100mg OD — maintain current doses.\n2. Continue Metformin 1000mg BD + Empagliflozin 10mg OD.\n3. Continue Dorzolamide 2% 1 drop TID OU.\n4. Intensify lifestyle: target 30 min exercise daily, DASH diet (<2g Na/day), weight loss goal 5% (to 75.5 kg).\n5. Repeat labs in 1 month: U&E, eGFR, K+, HbA1c, Urine ACR.\n6. Follow-up in 4 weeks — earlier if BP > 160/100 or symptoms.\n7. Video consultation in 2 weeks for interim medication review.\n8. Ophthalmology follow-up in 6 weeks for IOP check and visual fields.\n9. Annual foot exam + retinal screening due in 3 months.",
    },
    createdAt: ts(2026, 3, 5),
    updatedAt: ts(2026, 3, 5),
  });

  // ═════════════════════════════════════════════════════════════
  // 6. PROGRESS NOTE
  // ═════════════════════════════════════════════════════════════
  await upsert("clinicalNotes", `note_progress_${PATIENT_ID}`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    doctorName: "Dr. AMEXAN",
    type: "progress",
    tags: ["Hypertension", "Diabetes", "Medication Change"],
    private: false,
    content: {
      text: "Progress Note (5 Mar 2026):\n\nHTN: BP 150/90 — still above target. Compliance good with dual therapy (Amlodipine 10mg + Losartan 100mg). Mild ankle oedema from CCB. BP trending downward from 168/102 at initiation (4 months ago). Continue current regimen. Consider adding HCTZ 12.5mg at next visit if still not at target.\n\nDM: HbA1c 7.2% — good improvement from 8.2% at diagnosis. Fasting glucose still borderline at 7.0 mmol/L. Metformin well tolerated at 1000mg BD. Empagliflozin 10mg OD continues. No hypoglycaemia reported.\n\nWeight: 79.5 kg (BMI 26.3) — lost 2.5 kg. Encouraging. Continue lifestyle counselling.\n\nPlan: Book video consultation in 2 weeks to review BP trends. Follow-up clinic in 4 weeks with labs.",
    },
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  });

  // ═════════════════════════════════════════════════════════════
  // 7. ADDITIONAL ALERTS
  // ═════════════════════════════════════════════════════════════
  await upsert("alerts", `alert_wt_${PATIENT_ID}_1`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "triage",
    title: "⚖️ Weight Trend — Positive Progress",
    message: "Patient has lost 2.5 kg over 8 weeks. Encouraging trend. Continue lifestyle support.",
    urgency: "routine",
    read: false,
    createdAt: daysAgo(1),
    toolType: "weight_tracker",
  });

  await upsert("alerts", `alert_hba1c_${PATIENT_ID}_1`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "triage",
    title: "📊 HbA1c — Approaching Target",
    message: "HbA1c 7.2% — improved from 8.2%. Close to target of <7.0%. Continue current diabetes regimen.",
    urgency: "routine",
    read: false,
    createdAt: daysAgo(5),
    toolType: "hba1c_tracker",
  });

  await upsert("alerts", `alert_comprehensive_${PATIENT_ID}_1`, {
    patientId: PATIENT_ID,
    doctorId: DOCTOR_UID,
    type: "doctor_message",
    title: "📋 Comprehensive Care Plan: HTN + T2DM",
    message: "This patient has two active chronic conditions requiring coordinated management: Hypertension (Stage 2, partially controlled) and Type 2 Diabetes (improving, approaching target). Key priorities: BP <130/80, HbA1c <7.0%, weight loss 5%, annual complication screening. Next review: 2 weeks video + 4 weeks clinic.",
    urgency: "routine",
    read: false,
    createdAt: daysAgo(1),
    toolType: "bp_monitor",
  });

  // ═════════════════════════════════════════════════════════════
  // 8. ADDITIONAL DISEASE READINGS FOR BETTER MILESTONE MATCH
  // ═════════════════════════════════════════════════════════════
  const extraReadings = [
    // HTN extra readings
    { dx: "hypertension", metric: "systolic", val: 148, unit: "mmHg", days: 3 },
    { dx: "hypertension", metric: "diastolic", val: 88, unit: "mmHg", days: 3 },
    { dx: "hypertension", metric: "systolic", val: 145, unit: "mmHg", days: 7 },
    { dx: "hypertension", metric: "diastolic", val: 86, unit: "mmHg", days: 7 },
    { dx: "hypertension", metric: "heartRate", val: 76, unit: "bpm", days: 5 },
    // DM extra readings
    { dx: "diabetes_t2", metric: "fastingGlucose", val: 6.8, unit: "mmol/L", days: 2 },
    { dx: "diabetes_t2", metric: "fastingGlucose", val: 7.2, unit: "mmol/L", days: 6 },
    { dx: "diabetes_t2", metric: "postPrandial", val: 7.8, unit: "mmol/L", days: 4 },
    { dx: "diabetes_t2", metric: "postPrandial", val: 8.5, unit: "mmol/L", days: 8 },
  ];

  for (let i = 0; i < extraReadings.length; i++) {
    const r = extraReadings[i];
    await upsert("disease_readings", `dr_${PATIENT_ID}_extra_${i}`, {
      patientId: PATIENT_ID,
      doctorId: DOCTOR_UID,
      diseaseType: r.dx,
      metricKey: r.metric,
      value: r.val,
      unit: r.unit,
      note: "Routine monitoring",
      recordedAt: daysAgo(r.days),
      recordedBy: "patient",
    });
  }

  // ═════════════════════════════════════════════════════════════
  // 9. TIMELINE EVENTS FOR NEW TOOLS
  // ═════════════════════════════════════════════════════════════
  const newTimelineEvents = [
    { type: "tool_assigned", desc: "Weight & BMI Tracker assigned — weekly monitoring", daysAgo: 135 },
    { type: "tool_assigned", desc: "HbA1c Tracker assigned — quarterly lab tracking", daysAgo: 120 },
    { type: "reading", desc: "Weight 79.5 kg — 2.5kg total loss! Great progress!", daysAgo: 1 },
    { type: "milestone", desc: "HbA1c 7.2% — approaching target of <7.0%", daysAgo: 10 },
    { type: "milestone", desc: "Diabetes — Medication Optimised (Metformin 1000mg BD)", daysAgo: 90 },
    { type: "milestone", desc: "Annual complication screening due in 3 months", daysAgo: 90 },
  ];

  for (let i = 0; i < newTimelineEvents.length; i++) {
    const ev = newTimelineEvents[i];
    await upsert("timeline_events", `tl_supp_${PATIENT_ID}_${i}`, {
      patientId: PATIENT_ID,
      doctorId: DOCTOR_UID,
      eventType: ev.type,
      description: ev.desc,
      eventDate: daysAgo(ev.daysAgo),
      metadata: {},
    });
  }

  console.log("\n✅ Supplementary Seed complete!");
  console.log(`   New tool assignments:  2 (weight_tracker, hba1c_tracker)`);
  console.log(`   Weight readings:       ${weightReadings.length}`);
  console.log(`   HbA1c readings:        ${hba1cReadings.length}`);
  console.log(`   Extra disease readings: ${extraReadings.length}`);
  console.log(`   New clinical notes:    2 (SOAP + Progress)`);
  console.log(`   New alerts:            3`);
  console.log(`   New timeline events:   ${newTimelineEvents.length}`);
  console.log(`   Total tool assignments: 5\n`);
  console.log(`   All 5 tools now active:`);
  console.log(`     1. bp_monitor           — 14 readings`);
  console.log(`     2. glucose_tracker      — 10 readings`);
  console.log(`     3. medication_adherence — 7 readings`);
  console.log(`     4. weight_tracker       — 8 readings`);
  console.log(`     5. hba1c_tracker        — 3 readings`);
  console.log(`   2 disease enrollments: hypertension + diabetes_t2\n`);
}

seed().catch((err) => {
  console.error("❌ Supplementary seed failed:", err);
  process.exit(1);
});
