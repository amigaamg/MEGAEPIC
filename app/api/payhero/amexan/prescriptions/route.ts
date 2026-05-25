import { NextRequest, NextResponse } from "next/server";

const PRESCRIPTIONS: any[] = [
  {
    id: "rx_amlodipine", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    drug: "Amlodipine", drugClass: "CCB", dose: "10 mg",
    frequency: "once daily", route: "oral",
    startDate: "2026-01-10T00:00:00Z",
    prescribedBy: "doctor_sarah_kimani", status: "active",
    indication: "Resistant hypertension — dose escalation from 5mg",
    instructions: "Take every morning with or without food. Report ankle swelling.",
    sideEffectsToWatch: ["ankle oedema", "flushing", "headache"],
    doseChanges: [
      {
        date: "2026-01-10T00:00:00Z",
        previousDose: "5 mg", newDose: "10 mg",
        reason: "BP uncontrolled at 168/102 on 5mg",
        changedBy: "doctor_sarah_kimani",
      },
    ],
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "rx_losartan", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    drug: "Losartan", drugClass: "ARB", dose: "100 mg",
    frequency: "once daily", route: "oral",
    startDate: "2026-02-14T00:00:00Z",
    prescribedBy: "doctor_sarah_kimani", status: "active",
    indication: "Resistant HTN + renal protection (glaucoma dx)",
    instructions: "Take every morning. Avoid potassium supplements.",
    sideEffectsToWatch: ["hyperkalaemia", "dizziness", "renal impairment"],
    doseChanges: [
      {
        date: "2026-04-02T00:00:00Z",
        previousDose: "50 mg", newDose: "100 mg",
        reason: "BP 150/90 at clinic. Glaucoma diagnosis — ARB renal protection.",
        changedBy: "doctor_sarah_kimani",
      },
    ],
    createdAt: "2026-02-14T00:00:00Z",
    updatedAt: "2026-04-02T00:00:00Z",
  },
  {
    id: "rx_dorzolamide", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    drug: "Dorzolamide", drugClass: "Carbonic Anhydrase Inhibitor (Eye Drops)", dose: "1 drop",
    frequency: "three times daily (both eyes)", route: "topical",
    startDate: "2026-04-05T00:00:00Z",
    prescribedBy: "doctor_sarah_kimani", status: "active",
    indication: "Early Primary Open Angle Glaucoma — reduce IOP",
    instructions: "Instil 1 drop in each eye 3x daily. Wait 5 min between drops.",
    sideEffectsToWatch: ["burning sensation", "blurred vision", "bitter taste"],
    doseChanges: [],
    createdAt: "2026-04-05T00:00:00Z",
    updatedAt: "2026-04-05T00:00:00Z",
  },
];

export async function GET(req: NextRequest) {
  const toolId    = req.nextUrl.searchParams.get("toolId");
  const patientId = req.nextUrl.searchParams.get("patientId");

  let result = [...PRESCRIPTIONS];
  if (toolId)    result = result.filter(p => p.toolId    === toolId);
  if (patientId) result = result.filter(p => p.patientId === patientId);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rx = {
    id:          `rx_${Date.now()}`,
    ...body,
    startDate:   new Date().toISOString(),
    status:      "active",
    doseChanges: [],
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  };
  PRESCRIPTIONS.push(rx);
  return NextResponse.json(rx, { status: 201 });
}