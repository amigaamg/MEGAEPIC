/**
 * AMEXAN — Firebase Seed Script
 * Seeds complete John Mwangi patient record with 4 months of HTN data.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/seed.ts
 *
 * Or with tsx (recommended):
 *   npx tsx scripts/seed.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service
 * account JSON, or run inside a Firebase emulator environment.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";

// ── Init admin SDK ─────────────────────────────────────────────────────────

if (!getApps().length) {
  initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
    projectId:  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = getFirestore();

// ── Helpers ────────────────────────────────────────────────────────────────

function ts(year: number, month: number, day: number): Timestamp {
  return Timestamp.fromDate(new Date(year, month - 1, day));
}

function daysAgo(n: number): Timestamp {
  return Timestamp.fromMillis(Date.now() - n * 86_400_000);
}

async function upsert(col: string, id: string, data: Record<string, unknown>) {
  await db.collection(col).doc(id).set(data, { merge: true });
  console.log(`  ✓ ${col}/${id}`);
}

// ─────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────

const DOCTOR_ID   = "doctor_sarah_kimani";
const PATIENT_ID  = "patient_john_mwangi";
const TOOL_ID     = "tool_htn_john";

async function seed() {
  console.log("\n🌱 AMEXAN Seed Script — Starting...\n");

  // ── DOCTOR ──────────────────────────────────────────────────────────────
  await upsert("doctors", DOCTOR_ID, {
    name:           "Dr. Sarah Kimani",
    email:          "s.kimani@amexan.health",
    phone:          "+254 700 123 456",
    specialization: "Internal Medicine / Hypertension",
    licenseNumber:  "KE-MED-2018-4421",
    facilityName:   "AMEXAN Specialist Clinic",
    facilityId:     "facility_amexan_nbi",
    createdAt:      ts(2024, 1, 1),
  });

  // ── PATIENT ──────────────────────────────────────────────────────────────
  await upsert("patients", PATIENT_ID, {
    name:             "John Mwangi",
    dob:              ts(1965, 3, 14),
    gender:           "male",
    phone:            "+254 712 345 678",
    email:            "john.mwangi@email.com",
    nationalId:       "KE-2394871",
    address:          "14 Kileleshwa Road, Nairobi",
    nextOfKin: {
      name:         "Mary Mwangi",
      phone:        "+254 712 345 679",
      relationship: "Wife",
    },
    assignedDoctorId: DOCTOR_ID,
    riskLevel:        "high",
    activeToolTypes:  ["hypertension", "glaucoma"],
    createdAt:        ts(2026, 1, 10),
    updatedAt:        ts(2026, 1, 10),
  });

  // ── PATIENT TOOL: HYPERTENSION ───────────────────────────────────────────
  await upsert("patientTools", TOOL_ID, {
    patientId:   PATIENT_ID,
    toolType:    "hypertension",
    diagnosis:   "Resistant Hypertension",
    assignedAt:  ts(2026, 1, 10),
    assignedBy:  DOCTOR_ID,
    doctorId:    DOCTOR_ID,
    status:      "active",
    targetBP:    "<130/80",
    alertThresholds: {
      systolicCritical:          180,
      diastolicCritical:         120,
      systolicWarning:           160,
      diastolicWarning:          100,
      systolicTarget:            130,
      diastolicTarget:            80,
      hypotensionSystolic:        90,
      adherenceLow:               70,
      bpReadingGapDays:            3,
      uncontrolledReadingsCount:   7,
      uncontrolledReadingsDays:   14,
    },
    monitoringFrequency: "daily",
    clinicalNotes: "10-year history of hypertension, poorly controlled on Amlodipine 5mg. Early glaucomatous changes on fundoscopy. Creatinine 1.0, eGFR 88 — renal function adequate for ARB. Initiating combination therapy.",
    updatedAt:   ts(2026, 1, 10),
  });

  // ── BP ENTRIES ────────────────────────────────────────────────────────────
  const bpReadings = [
    { date: ts(2026,1,10), sys:168, dia:102, notes:"Tool assigned, baseline reading", by:"doctor" },
    { date: ts(2026,1,13), sys:170, dia:104, notes:"Morning reading", by:"patient" },
    { date: ts(2026,1,16), sys:165, dia:100, notes:"", by:"patient" },
    { date: ts(2026,1,20), sys:165, dia:100, notes:"Clinic visit", by:"doctor" },
    { date: ts(2026,1,23), sys:162, dia:99,  notes:"", by:"patient" },
    { date: ts(2026,1,27), sys:160, dia:98,  notes:"After evening walk", by:"patient" },
    { date: ts(2026,1,30), sys:163, dia:101, notes:"", by:"patient" },
    { date: ts(2026,2,3),  sys:158, dia:97,  notes:"Feeling slightly better", by:"patient" },
    { date: ts(2026,2,7),  sys:155, dia:96,  notes:"", by:"patient" },
    { date: ts(2026,2,10), sys:158, dia:96,  notes:"Morning reading", by:"patient" },
    { date: ts(2026,2,14), sys:150, dia:95,  notes:"Clinic — Losartan started", by:"doctor" },
    { date: ts(2026,2,17), sys:148, dia:93,  notes:"", by:"patient" },
    { date: ts(2026,2,20), sys:144, dia:90,  notes:"", by:"patient" },
    { date: ts(2026,2,24), sys:145, dia:91,  notes:"Missed dose yesterday", by:"patient" },
    { date: ts(2026,2,28), sys:140, dia:89,  notes:"", by:"patient" },
    { date: ts(2026,3,3),  sys:138, dia:88,  notes:"", by:"patient" },
    { date: ts(2026,3,7),  sys:136, dia:86,  notes:"Feeling much better", by:"patient" },
    { date: ts(2026,3,10), sys:138, dia:87,  notes:"", by:"patient" },
    { date: ts(2026,3,15), sys:158, dia:90,  notes:"Missed appointment, stressed", by:"patient" },
    { date: ts(2026,3,20), sys:155, dia:92,  notes:"Work stress", by:"patient" },
    { date: ts(2026,3,25), sys:148, dia:88,  notes:"", by:"patient" },
    { date: ts(2026,4,1),  sys:150, dia:90,  notes:"Clinic — glaucoma dx, Losartan to 100mg", by:"doctor" },
    { date: ts(2026,4,5),  sys:147, dia:88,  notes:"Dorzolamide started for glaucoma", by:"patient" },
    { date: ts(2026,4,8),  sys:144, dia:87,  notes:"", by:"patient" },
    { date: ts(2026,4,10), sys:142, dia:86,  notes:"Clinic visit — better control", by:"doctor" },
    { date: ts(2026,4,13), sys:140, dia:85,  notes:"", by:"patient" },
    { date: ts(2026,4,16), sys:138, dia:84,  notes:"", by:"patient" },
    { date: ts(2026,4,19), sys:141, dia:86,  notes:"After a meal", by:"patient" },
    { date: ts(2026,4,22), sys:139, dia:84,  notes:"", by:"patient" },
    { date: ts(2026,4,25), sys:137, dia:83,  notes:"", by:"patient" },
    { date: ts(2026,4,28), sys:138, dia:86,  notes:"", by:"patient" },
    { date: ts(2026,5,1),  sys:136, dia:84,  notes:"", by:"patient" },
    { date: ts(2026,5,4),  sys:135, dia:83,  notes:"Feeling well", by:"patient" },
    { date: ts(2026,5,7),  sys:138, dia:85,  notes:"", by:"patient" },
    { date: ts(2026,5,10), sys:142, dia:85,  notes:"Morning reading, feeling well", by:"patient" },
  ];

  for (let i = 0; i < bpReadings.length; i++) {
    const r = bpReadings[i];
    const status =
      r.sys >= 180 || r.dia >= 120 ? "crisis" :
      r.sys >= 160 || r.dia >= 100 ? "high" :
      r.sys > 130  || r.dia > 80   ? "elevated" : "controlled";
    await upsert("bpEntries", `bp_${PATIENT_ID}_${i + 1}`, {
      toolId:      TOOL_ID,
      patientId:   PATIENT_ID,
      systolic:    r.sys,
      diastolic:   r.dia,
      heartRate:   72 + Math.floor(Math.random() * 12),
      loggedBy:    r.by,
      loggedByUid: r.by === "doctor" ? DOCTOR_ID : PATIENT_ID,
      timestamp:   r.date,
      notes:       r.notes,
      flagged:     r.sys >= 160,
      status,
      arm:         "left",
      position:    "sitting",
    });
  }

  // ── PRESCRIPTIONS ─────────────────────────────────────────────────────────
  await upsert("prescriptions", `rx_amlodipine_${PATIENT_ID}`, {
    toolId:      TOOL_ID,
    patientId:   PATIENT_ID,
    drug:        "Amlodipine",
    drugClass:   "CCB",
    dose:        "10 mg",
    frequency:   "once daily",
    route:       "oral",
    startDate:   ts(2026,1,10),
    prescribedBy: DOCTOR_ID,
    status:      "active",
    indication:  "Resistant hypertension — dose escalation from 5mg",
    instructions: "Take every morning with or without food. Ankle swelling is a known side effect — report if persistent.",
    sideEffectsToWatch: ["ankle oedema", "flushing", "headache", "reflex tachycardia"],
    doseChanges: [{
      date:         ts(2026,1,10),
      previousDose: "5 mg",
      newDose:      "10 mg",
      reason:       "BP uncontrolled at 168/102 on 5mg. Escalated to maximum dose.",
      changedBy:    DOCTOR_ID,
    }],
    createdAt:   ts(2026,1,10),
    updatedAt:   ts(2026,1,10),
  });

  await upsert("prescriptions", `rx_losartan_${PATIENT_ID}`, {
    toolId:      TOOL_ID,
    patientId:   PATIENT_ID,
    drug:        "Losartan",
    drugClass:   "ARB",
    dose:        "100 mg",
    frequency:   "once daily",
    route:       "oral",
    startDate:   ts(2026,2,14),
    prescribedBy: DOCTOR_ID,
    status:      "active",
    indication:  "Resistant hypertension — added as second agent. Also provides renal protection given glaucoma dx.",
    instructions: "Take every morning. Monitor for dizziness when standing. Avoid potassium supplements.",
    sideEffectsToWatch: ["hyperkalaemia", "dizziness", "renal impairment", "dry cough (rare for ARB)"],
    doseChanges: [{
      date:         ts(2026,4,2),
      previousDose: "50 mg",
      newDose:      "100 mg",
      reason:       "BP 150/90 at clinic. Glaucoma diagnosis — ARB provides renal protection. Escalated to 100mg.",
      changedBy:    DOCTOR_ID,
    }],
    createdAt:   ts(2026,2,14),
    updatedAt:   ts(2026,4,2),
  });

  await upsert("prescriptions", `rx_dorzolamide_${PATIENT_ID}`, {
    toolId:      TOOL_ID,
    patientId:   PATIENT_ID,
    drug:        "Dorzolamide",
    drugClass:   "Carbonic Anhydrase Inhibitor (Eye Drops)",
    dose:        "1 drop",
    frequency:   "three times daily (both eyes)",
    route:       "topical",
    startDate:   ts(2026,4,5),
    prescribedBy: DOCTOR_ID,
    status:      "active",
    indication:  "Early glaucoma — reduce intraocular pressure",
    instructions: "Instil 1 drop in each eye three times daily. Wait 5 minutes between eye drops if using multiple.",
    sideEffectsToWatch: ["burning sensation", "blurred vision", "bitter taste", "allergic conjunctivitis"],
    doseChanges: [],
    createdAt:   ts(2026,4,5),
    updatedAt:   ts(2026,4,5),
  });

  // ── MEDICATION ADHERENCE (Amlodipine 50 days) ─────────────────────────────
  const amlodipineAdherence = [
    true,true,true,true,true,true,true,true,true,true,
    true,true,false,true,true,true,true,true,true,true,
    true,true,true,true,true,true,true,true,true,true,
    true,true,true,true,true,true,true,true,true,true,
    true,true,true,true,true,true,true,false,true,true,
  ];
  for (let i = 0; i < amlodipineAdherence.length; i++) {
    await upsert("medicationAdherence", `adh_aml_${PATIENT_ID}_${i}`, {
      prescriptionId: `rx_amlodipine_${PATIENT_ID}`,
      toolId:    TOOL_ID,
      patientId: PATIENT_ID,
      date:      Timestamp.fromMillis(ts(2026,1,10).toMillis() + i * 86_400_000),
      taken:     amlodipineAdherence[i],
      loggedBy:  "patient",
    });
  }

  // ── FOLLOW-UPS ────────────────────────────────────────────────────────────
  const followUps = [
    { id:"fu1", date:ts(2026,1,10), status:"attended", type:"clinic",  notes:"Tool assigned. Baseline assessment done. Started combo therapy.", linkedNote:"note_jan10" },
    { id:"fu2", date:ts(2026,1,20), status:"attended", type:"clinic",  notes:"BP 165/100. Medication compliance good. Continue plan.", linkedNote:"note_jan20" },
    { id:"fu3", date:ts(2026,2,14), status:"attended", type:"clinic",  notes:"BP 150/95. Added Losartan 50mg. Review in 4 weeks.", linkedNote:"note_feb14" },
    { id:"fu4", date:ts(2026,3,15), status:"missed",   type:"clinic",  notes:"Patient did not attend. Phone call unanswered. Rescheduled.", linkedNote:null },
    { id:"fu5", date:ts(2026,4,2),  status:"attended", type:"clinic",  notes:"BP 150/90. Glaucoma diagnosed. Losartan increased to 100mg. Ophthalmology referred.", linkedNote:"note_apr2" },
    { id:"fu6", date:ts(2026,4,10), status:"attended", type:"clinic",  notes:"BP 140/88. Good improvement. Continue current regimen.", linkedNote:"note_apr10" },
    { id:"fu7", date:ts(2026,5,12), status:"scheduled",type:"clinic",  notes:"Routine 4-week review. Check eGFR + K⁺.", linkedNote:null },
  ];
  for (const f of followUps) {
    await upsert("followUps", `fu_${PATIENT_ID}_${f.id}`, {
      toolId:        TOOL_ID,
      patientId:     PATIENT_ID,
      scheduledDate: f.date,
      scheduledBy:   DOCTOR_ID,
      type:          f.type,
      status:        f.status,
      attendedDate:  f.status === "attended" ? f.date : null,
      notes:         f.notes,
      linkedNoteId:  f.linkedNote,
      reminderSent:  f.status !== "scheduled",
      patientConfirmed: f.status === "attended",
      createdAt:     f.date,
      updatedAt:     f.date,
    });
  }

  // ── CLINICAL NOTES ────────────────────────────────────────────────────────
  await upsert("clinicalNotes", "note_jan10", {
    toolId:    TOOL_ID,
    patientId: PATIENT_ID,
    doctorId:  DOCTOR_ID,
    visitDate: ts(2026,1,10),
    type:      "visit",
    subjective: "60-year-old male presents with 10-year history of hypertension, poorly controlled on Amlodipine 5mg daily. Complains of persistent headaches and occasional blurred vision. No chest pain, no dyspnoea at rest.",
    objective:  "BP 168/102 mmHg (left arm, sitting). HR 78 bpm. BMI 26.2. Fundoscopy: early glaucomatous changes bilaterally. Creatinine 1.0 mg/dL, eGFR 88 mL/min/1.73m², K⁺ 4.2 mmol/L, Fasting Glucose 98 mg/dL.",
    assessment: "Resistant Hypertension on monotherapy. Possible early glaucoma — refer ophthalmology. Renal function adequate.",
    plan:       "1. Increase Amlodipine 5mg → 10mg daily.\n2. Add Losartan 50mg once daily for combination therapy and renal protection.\n3. Home BP monitoring twice daily (morning and evening).\n4. Ophthalmology referral for glaucoma evaluation.\n5. Repeat U&E, eGFR in 4 weeks.\n6. Follow up in 2 weeks.",
    vitals: { bp:"168/102", hr:78, weight:76, height:172, bmi:26.2 },
    linkedFollowUpId: `fu_${PATIENT_ID}_fu1`,
    isLocked:   true,
    createdAt:  ts(2026,1,10),
    updatedAt:  ts(2026,1,10),
  });

  await upsert("clinicalNotes", "note_feb14", {
    toolId:    TOOL_ID,
    patientId: PATIENT_ID,
    doctorId:  DOCTOR_ID,
    visitDate: ts(2026,2,14),
    type:      "visit",
    subjective: "Patient returns for follow-up. BP improving but still above target. Tolerating Amlodipine 10mg well — mild ankle oedema noted but not troubling. Headaches less frequent.",
    objective:  "BP 150/95 mmHg. HR 74 bpm. Mild bilateral ankle oedema (1+). No signs of heart failure.",
    assessment: "Partially controlled hypertension on dual therapy. Ankle oedema acceptable given BP improvement. Needs further reduction. Adding ARB for third drug step and renal protection.",
    plan:       "1. Add Losartan 50mg once daily.\n2. Advise patient on potassium-containing foods to avoid.\n3. Monitor for dizziness (hypotension risk with triple therapy in future).\n4. Repeat K⁺ and creatinine in 2 weeks.\n5. Follow up in 6 weeks.",
    vitals: { bp:"150/95", hr:74, weight:75.5 },
    linkedFollowUpId: `fu_${PATIENT_ID}_fu3`,
    linkedPrescriptionIds: [`rx_losartan_${PATIENT_ID}`],
    isLocked:   true,
    createdAt:  ts(2026,2,14),
    updatedAt:  ts(2026,2,14),
  });

  await upsert("clinicalNotes", "note_apr2", {
    toolId:    TOOL_ID,
    patientId: PATIENT_ID,
    doctorId:  DOCTOR_ID,
    visitDate: ts(2026,4,2),
    type:      "visit",
    subjective: "Follow-up. Patient missed March appointment due to work commitments. Reports some improvement in BP readings at home. Noticed blurring of left eye periphery over past 3 weeks.",
    objective:  "BP 150/90 mmHg. Fundoscopy: confirmed early glaucomatous cupping bilaterally. Cup-disc ratio 0.7 OU. IOP estimated high on direct exam. Ophthalmology report received — confirms Open Angle Glaucoma Grade 1.",
    assessment: "1. Hypertension — partially controlled, needs further optimisation.\n2. Primary Open Angle Glaucoma — newly diagnosed, Grade 1.",
    plan:       "1. Increase Losartan 50mg → 100mg (BP not at target + renal protection for glaucoma workup).\n2. Start Dorzolamide 2% eye drops 1 drop TID OU for IOP reduction.\n3. Ophthalmology follow-up in 8 weeks.\n4. Repeat visual fields test.\n5. HTN review in 5 weeks.",
    vitals: { bp:"150/90", hr:76 },
    linkedFollowUpId: `fu_${PATIENT_ID}_fu5`,
    linkedPrescriptionIds: [`rx_losartan_${PATIENT_ID}`, `rx_dorzolamide_${PATIENT_ID}`],
    isLocked:   true,
    createdAt:  ts(2026,4,2),
    updatedAt:  ts(2026,4,2),
  });

  // ── LAB ORDERS ────────────────────────────────────────────────────────────
  await upsert("labOrders", `lab1_${PATIENT_ID}`, {
    toolId:    TOOL_ID,
    patientId: PATIENT_ID,
    orderedBy: DOCTOR_ID,
    tests:     ["Creatinine", "eGFR", "Potassium", "Sodium", "Urea", "Full Blood Count"],
    priority:  "routine",
    indication:"Baseline renal function before starting ARB/ACEi combination therapy",
    orderedAt: ts(2026,1,10),
    results: [
      { test:"Creatinine",    value:"1.0",  unit:"mg/dL",          referenceRange:"0.6–1.2",  flag:"normal",  resultDate:ts(2026,1,12) },
      { test:"eGFR",          value:"88",   unit:"mL/min/1.73m²",  referenceRange:">60",       flag:"normal",  resultDate:ts(2026,1,12) },
      { test:"Potassium",     value:"4.2",  unit:"mmol/L",         referenceRange:"3.5–5.0",  flag:"normal",  resultDate:ts(2026,1,12) },
      { test:"Sodium",        value:"138",  unit:"mmol/L",         referenceRange:"135–145",  flag:"normal",  resultDate:ts(2026,1,12) },
      { test:"Urea",          value:"5.2",  unit:"mmol/L",         referenceRange:"2.5–7.8",  flag:"normal",  resultDate:ts(2026,1,12) },
      { test:"Full Blood Count", value:"Normal", unit:"—",         referenceRange:"—",         flag:"normal",  resultDate:ts(2026,1,12) },
    ],
    resultsDate: ts(2026,1,12),
    status:     "reviewed",
    reviewedBy: DOCTOR_ID,
    reviewedAt: ts(2026,1,14),
    reviewNotes:"All within normal limits. Safe to proceed with ARB therapy.",
    linkedNoteId: "note_jan10",
  });

  await upsert("labOrders", `lab2_${PATIENT_ID}`, {
    toolId:    TOOL_ID,
    patientId: PATIENT_ID,
    orderedBy: DOCTOR_ID,
    tests:     ["Creatinine", "eGFR", "Potassium", "Urine ACR", "Lipid Profile", "HbA1c"],
    priority:  "routine",
    indication:"4-week review on Losartan — check renal function and electrolytes. Extended metabolic screen.",
    orderedAt: ts(2026,3,15),
    results: [
      { test:"Creatinine",  value:"1.1",  unit:"mg/dL",         referenceRange:"0.6–1.2",  flag:"normal",  resultDate:ts(2026,3,17) },
      { test:"eGFR",        value:"82",   unit:"mL/min/1.73m²", referenceRange:">60",       flag:"normal",  resultDate:ts(2026,3,17) },
      { test:"Potassium",   value:"4.6",  unit:"mmol/L",        referenceRange:"3.5–5.0",  flag:"normal",  resultDate:ts(2026,3,17) },
      { test:"Urine ACR",   value:"28",   unit:"mg/g",          referenceRange:"<30",       flag:"normal",  resultDate:ts(2026,3,17) },
      { test:"LDL",         value:"3.2",  unit:"mmol/L",        referenceRange:"<3.0",      flag:"high",    resultDate:ts(2026,3,17) },
      { test:"HDL",         value:"1.2",  unit:"mmol/L",        referenceRange:">1.0",      flag:"normal",  resultDate:ts(2026,3,17) },
      { test:"HbA1c",       value:"5.8",  unit:"%",             referenceRange:"<5.7",      flag:"high",    resultDate:ts(2026,3,17) },
    ],
    resultsDate: ts(2026,3,17),
    status:     "reviewed",
    reviewedBy: DOCTOR_ID,
    reviewedAt: ts(2026,4,2),
    reviewNotes:"Renal function stable. LDL mildly elevated — dietary advice given. HbA1c 5.8% — pre-diabetic range, monitor. Consider statin at next visit.",
    linkedNoteId: "note_apr2",
  });

  await upsert("labOrders", `lab3_${PATIENT_ID}`, {
    toolId:    TOOL_ID,
    patientId: PATIENT_ID,
    orderedBy: DOCTOR_ID,
    tests:     ["Creatinine", "eGFR", "Potassium", "Urine ACR"],
    priority:  "routine",
    indication:"Routine 4-week review — check renal function after Losartan dose increase to 100mg",
    orderedAt: ts(2026,5,1),
    status:    "pending",
  });

  // ── IMAGING ORDERS ────────────────────────────────────────────────────────
  await upsert("imagingOrders", `img1_${PATIENT_ID}`, {
    toolId:     TOOL_ID,
    patientId:  PATIENT_ID,
    modality:   "Echocardiogram",
    indication: "Assess for hypertensive heart disease — LV hypertrophy, diastolic dysfunction",
    priority:   "routine",
    orderedBy:  DOCTOR_ID,
    orderedAt:  ts(2026,1,10),
    reportText: "Left ventricular hypertrophy present. LVMI 112 g/m² (normal <95). Mild concentric remodelling. Diastolic dysfunction Grade 1. EF 60% — preserved systolic function. No valvular disease.",
    reportDate: ts(2026,2,3),
    reportedBy: "Dr. Aisha Osei, Cardiologist",
    keyFindings:["LV hypertrophy (LVMI 112)", "Diastolic dysfunction Grade 1", "Preserved EF 60%"],
    interpretationNotes:"LVH confirms chronic pressure overload from longstanding HTN. Strengthens case for aggressive BP control. Target SBP <130 mmHg to promote LV regression.",
    status:     "reviewed",
    linkedNoteId:"note_jan10",
  });

  await upsert("imagingOrders", `img2_${PATIENT_ID}`, {
    toolId:     TOOL_ID,
    patientId:  PATIENT_ID,
    modality:   "Renal Ultrasound",
    indication: "Exclude secondary causes of hypertension — renal artery stenosis, polycystic kidney",
    priority:   "routine",
    orderedBy:  DOCTOR_ID,
    orderedAt:  ts(2026,2,14),
    reportText: "Both kidneys normal size and echotexture. Right kidney 11.2cm, Left kidney 11.0cm. No hydronephrosis. No renal masses. Bladder normal.",
    reportDate: ts(2026,3,1),
    reportedBy: "Dr. Moses Kariuki, Radiologist",
    keyFindings:["Bilateral normal-sized kidneys", "No renal artery stenosis features", "No secondary cause identified"],
    interpretationNotes:"No structural renal cause for hypertension. Primary (essential) hypertension confirmed.",
    status:     "reviewed",
  });

  // ── COMPLICATIONS ─────────────────────────────────────────────────────────
  await upsert("complications", `comp1_${PATIENT_ID}`, {
    toolId:      TOOL_ID,
    patientId:   PATIENT_ID,
    name:        "Primary Open Angle Glaucoma",
    dateDetected:ts(2026,4,2),
    severity:    "moderate",
    status:      "active",
    referral:    "Ophthalmology",
    referralDate:ts(2026,4,2),
    notes:       "Early glaucomatous cupping bilateral on fundoscopy. Cup-disc ratio 0.7 OU. Confirmed by ophthalmology. Likely hypertension-related microvascular changes contributing. IOP elevated — started Dorzolamide.",
    linkedImagingIds: [],
    reportedBy:  DOCTOR_ID,
    createdAt:   ts(2026,4,2),
    updatedAt:   ts(2026,4,2),
  });

  await upsert("complications", `comp2_${PATIENT_ID}`, {
    toolId:      TOOL_ID,
    patientId:   PATIENT_ID,
    name:        "Left Ventricular Hypertrophy",
    dateDetected:ts(2026,2,3),
    severity:    "moderate",
    status:      "active",
    referral:    "Cardiology",
    referralDate:ts(2026,2,3),
    notes:       "Echo confirmed LVH — LVMI 112 g/m². Diastolic dysfunction Grade 1. Target-organ damage from chronic hypertension. Aggressive BP control required to promote LV regression.",
    linkedImagingIds: [`img1_${PATIENT_ID}`],
    reportedBy:  DOCTOR_ID,
    createdAt:   ts(2026,2,3),
    updatedAt:   ts(2026,2,3),
  });

  // ── SYSTEM ALERTS (historical) ────────────────────────────────────────────
  await upsert("systemAlerts", `alert1_${PATIENT_ID}`, {
    toolId:    TOOL_ID,
    patientId: PATIENT_ID,
    doctorId:  DOCTOR_ID,
    type:      "warning",
    trigger:   "uncontrolled_bp_pattern",
    value:     { aboveTarget:8, totalReadings:10, target:"130/80" },
    message:   "⚠️ UNCONTROLLED HTN: 8 of 10 readings above target over 14 days. Consider medication adjustment.",
    patientMessage: "Your blood pressure has been above the target level several times. Your doctor has been notified.",
    sentAt:    ts(2026,1,25),
    acknowledgedBy:  DOCTOR_ID,
    acknowledgedAt:  ts(2026,1,26),
    isActive:  false,
    notificationChannels: ["push","in_app"],
    deliveredAt: ts(2026,1,25),
  });

  await upsert("systemAlerts", `alert2_${PATIENT_ID}`, {
    toolId:    TOOL_ID,
    patientId: PATIENT_ID,
    doctorId:  DOCTOR_ID,
    type:      "warning",
    trigger:   "missed_follow_up",
    value:     { scheduledDate:"2026-03-15", type:"clinic" },
    message:   "📅 MISSED VISIT: Scheduled follow-up on 15 Mar 2026 was not attended.",
    patientMessage: "You missed your scheduled visit. Please contact the clinic to reschedule.",
    sentAt:    ts(2026,3,17),
    acknowledgedBy:  DOCTOR_ID,
    acknowledgedAt:  ts(2026,3,18),
    isActive:  false,
    notificationChannels: ["push","sms","in_app"],
    deliveredAt: ts(2026,3,17),
  });

  // ── DOCTOR → PATIENT MESSAGES ─────────────────────────────────────────────
  await upsert("doctorMessages", `msg1_${PATIENT_ID}`, {
    toolId:    TOOL_ID,
    patientId: PATIENT_ID,
    doctorId:  DOCTOR_ID,
    subject:   "Your blood pressure is improving — keep going!",
    body:      "Dear John,\n\nI wanted to let you know that your blood pressure readings over the last two weeks have shown good improvement. Keep taking your medications every day at the same time.\n\nRemember:\n• Amlodipine 10mg — every morning\n• Losartan 100mg — every morning\n• Dorzolamide eye drops — 3 times daily (both eyes)\n\nYour next appointment is 12 May 2026. Please bring your home BP log.\n\nDr. Sarah Kimani",
    type:      "instruction",
    priority:  "normal",
    sentAt:    ts(2026,5,1),
    isRead:    false,
  });

  console.log("\n✅ AMEXAN Seed complete!");
  console.log(`   Patient:  ${PATIENT_ID}`);
  console.log(`   Doctor:   ${DOCTOR_ID}`);
  console.log(`   Tool:     ${TOOL_ID}`);
  console.log(`   BP entries seeded: ${bpReadings.length}`);
  console.log(`   Prescriptions:     3`);
  console.log(`   Follow-ups:        7`);
  console.log(`   Clinical notes:    3`);
  console.log(`   Lab orders:        3`);
  console.log(`   Imaging orders:    2`);
  console.log(`   Complications:     2`);
  console.log(`   Alerts:            2`);
  console.log(`   Messages:          1\n`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});