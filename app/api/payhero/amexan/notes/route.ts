import { NextRequest, NextResponse } from "next/server";

const NOTES: any[] = [
  {
    id: "note_apr10", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    doctorId: "doctor_sarah_kimani",
    visitDate: "2026-04-10T09:00:00Z", type: "visit",
    subjective:  "Patient reports improved BP readings at home. No dizziness or headaches. Taking all medications regularly. Ankle swelling has resolved. Eye drops well tolerated.",
    objective:   "BP 140/88 mmHg (left arm, sitting). HR 70 bpm. Weight 75 kg. No ankle oedema. Eye drops technique reviewed — correct instillation confirmed.",
    assessment:  "1. Hypertension — improving on triple therapy. Approaching target BP.\n2. Primary Open Angle Glaucoma — stable on Dorzolamide. Ophthalmology review pending.",
    plan:        "1. Continue Amlodipine 10mg, Losartan 100mg, Dorzolamide TID.\n2. Repeat U&E + K⁺ + eGFR in 4 weeks.\n3. Ophthalmology review next month.\n4. Follow up 12 May 2026.",
    vitals:      { bp: "140/88", hr: 70, weight: 75 },
    isLocked:    true,
    createdAt:   "2026-04-10T09:00:00Z", updatedAt: "2026-04-10T09:00:00Z",
  },
  {
    id: "note_apr2", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    doctorId: "doctor_sarah_kimani",
    visitDate: "2026-04-02T09:00:00Z", type: "visit",
    subjective:  "Patient missed March appointment due to work. Reports some improvement in home BP readings. Noticed blurring of left eye periphery over past 3 weeks.",
    objective:   "BP 150/90 mmHg. Fundoscopy: confirmed early glaucomatous cupping bilaterally. Cup-disc ratio 0.7 OU. Ophthalmology report received — Open Angle Glaucoma Grade 1.",
    assessment:  "1. Hypertension — partially controlled, needs further optimisation.\n2. Primary Open Angle Glaucoma — newly diagnosed, Grade 1.",
    plan:        "1. Increase Losartan 50mg → 100mg.\n2. Start Dorzolamide 2% eye drops TID OU.\n3. Ophthalmology follow-up 8 weeks.\n4. Repeat visual fields.\n5. HTN review 5 weeks.",
    vitals:      { bp: "150/90", hr: 76 },
    isLocked:    true,
    createdAt:   "2026-04-02T09:00:00Z", updatedAt: "2026-04-02T09:00:00Z",
  },
  {
    id: "note_feb14", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    doctorId: "doctor_sarah_kimani",
    visitDate: "2026-02-14T09:00:00Z", type: "visit",
    subjective:  "BP improving but still above target. Tolerating Amlodipine 10mg well — mild ankle oedema noted but not troubling. Headaches less frequent.",
    objective:   "BP 150/95 mmHg. HR 74 bpm. Mild bilateral ankle oedema 1+. No signs of heart failure.",
    assessment:  "Partially controlled hypertension on dual therapy. Adding ARB for third drug step and renal protection.",
    plan:        "1. Add Losartan 50mg once daily.\n2. Advise on low-potassium diet.\n3. Monitor for dizziness.\n4. Repeat K⁺ + Creatinine in 2 weeks.\n5. Follow up 6 weeks.",
    vitals:      { bp: "150/95", hr: 74 },
    isLocked:    true,
    createdAt:   "2026-02-14T09:00:00Z", updatedAt: "2026-02-14T09:00:00Z",
  },
  {
    id: "note_jan10", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    doctorId: "doctor_sarah_kimani",
    visitDate: "2026-01-10T09:00:00Z", type: "visit",
    subjective:  "60-year-old male with 10-year history of hypertension, poorly controlled on Amlodipine 5mg daily. Complains of persistent headaches and occasional blurred vision. No chest pain.",
    objective:   "BP 168/102 mmHg (left arm, sitting). HR 78 bpm. BMI 26.2. Fundoscopy: early glaucomatous changes bilaterally. Creatinine 1.0 mg/dL, eGFR 88, K⁺ 4.2 mmol/L.",
    assessment:  "Resistant Hypertension on monotherapy. Possible early glaucoma — refer ophthalmology. Renal function adequate for ARB.",
    plan:        "1. Increase Amlodipine 5mg → 10mg.\n2. Add Losartan 50mg once daily.\n3. Home BP monitoring twice daily.\n4. Ophthalmology referral.\n5. Repeat U&E in 4 weeks.\n6. Follow up 2 weeks.",
    vitals:      { bp: "168/102", hr: 78, weight: 76, bmi: 26.2 },
    isLocked:    true,
    createdAt:   "2026-01-10T09:00:00Z", updatedAt: "2026-01-10T09:00:00Z",
  },
];

export async function GET(req: NextRequest) {
  const toolId    = req.nextUrl.searchParams.get("toolId");
  const patientId = req.nextUrl.searchParams.get("patientId");

  let result = [...NOTES];
  if (toolId)    result = result.filter(n => n.toolId    === toolId);
  if (patientId) result = result.filter(n => n.patientId === patientId);

  result.sort((a, b) =>
    new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const note = {
    id:        `note_${Date.now()}`,
    ...body,
    visitDate: new Date().toISOString(),
    isLocked:  false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  NOTES.unshift(note);
  return NextResponse.json(note, { status: 201 });
}