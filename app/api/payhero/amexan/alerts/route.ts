import { NextRequest, NextResponse } from "next/server";

const COMPLICATIONS: any[] = [
  {
    id: "comp1", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    name: "Primary Open Angle Glaucoma",
    dateDetected: "2026-04-02",
    severity: "moderate",
    status: "active",
    referral: "Ophthalmology",
    referralDate: "2026-04-02",
    notes: "Early glaucomatous cupping bilateral on fundoscopy. Cup-disc ratio 0.7 OU. Confirmed by ophthalmology. IOP elevated — Dorzolamide started. Likely hypertension-related microvascular changes.",
    reportedBy: "doctor_sarah_kimani",
    createdAt: "2026-04-02T09:00:00Z",
    updatedAt: "2026-04-02T09:00:00Z",
  },
  {
    id: "comp2", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    name: "Left Ventricular Hypertrophy",
    dateDetected: "2026-02-03",
    severity: "moderate",
    status: "active",
    referral: "Cardiology",
    referralDate: "2026-02-03",
    notes: "Echo confirmed LVH — LVMI 112 g/m². Diastolic dysfunction Grade 1. Preserved EF 60%. Target-organ damage from chronic hypertension. Aggressive BP control required to promote LV regression.",
    reportedBy: "doctor_sarah_kimani",
    createdAt: "2026-02-03T09:00:00Z",
    updatedAt: "2026-02-03T09:00:00Z",
  },
];

export async function GET(req: NextRequest) {
  const toolId    = req.nextUrl.searchParams.get("toolId");
  const patientId = req.nextUrl.searchParams.get("patientId");

  let result = [...COMPLICATIONS];
  if (toolId)    result = result.filter(c => c.toolId    === toolId);
  if (patientId) result = result.filter(c => c.patientId === patientId);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const comp = {
    id:        `comp_${Date.now()}`,
    ...body,
    status:    body.status ?? "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  COMPLICATIONS.push(comp);
  return NextResponse.json(comp, { status: 201 });
}