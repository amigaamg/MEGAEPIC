import { NextRequest, NextResponse } from "next/server";

const TOOLS: Record<string, any> = {
  "tool_htn_john": {
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
    clinicalNotes:       "10-year history of hypertension. Poorly controlled on monotherapy.",
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
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tool = TOOLS[id];
  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  return NextResponse.json(tool);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  if (TOOLS[id]) {
    Object.assign(TOOLS[id], body);
  }
  return NextResponse.json(TOOLS[id] ?? body);
}