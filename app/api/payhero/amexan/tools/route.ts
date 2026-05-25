import { NextRequest, NextResponse } from "next/server";

const ALL_TOOLS: any[] = [
  {
    id:                  "tool_htn_john",
    patientId:           "patient_john_mwangi",
    toolType:            "hypertension",
    diagnosis:           "Resistant Hypertension",
    assignedAt:          "2026-01-10T08:00:00Z",
    assignedBy:          "doctor_sarah_kimani",
    doctorId:            "doctor_sarah_kimani",
    status:              "active",
    targetBP:            "<130/80",
    monitoringFrequency: "daily",
    clinicalNotes:       "10-year history of hypertension. Poorly controlled on monotherapy. Combination therapy initiated Jan 2026.",
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
  },
];

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("patientId");
  const result    = patientId
    ? ALL_TOOLS.filter(t => t.patientId === patientId)
    : ALL_TOOLS;
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tool = { id: `tool_${Date.now()}`, ...body };
  ALL_TOOLS.push(tool);
  return NextResponse.json(tool, { status: 201 });
}