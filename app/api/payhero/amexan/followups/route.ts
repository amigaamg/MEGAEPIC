import { NextRequest, NextResponse } from "next/server";

const FOLLOWUPS: any[] = [
  {
    id: "fu1", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    scheduledDate: "2026-01-10T09:00:00Z", scheduledBy: "doctor_sarah_kimani",
    type: "clinic", status: "attended",
    notes: "Tool assigned. Baseline assessment done. Combination therapy started.",
    reminderSent: true, patientConfirmed: true,
    attendedDate: "2026-01-10T09:00:00Z",
    createdAt: "2026-01-10T00:00:00Z", updatedAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "fu2", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    scheduledDate: "2026-01-20T09:00:00Z", scheduledBy: "doctor_sarah_kimani",
    type: "clinic", status: "attended",
    notes: "BP 165/100. Good compliance. Continue plan.",
    reminderSent: true, patientConfirmed: true,
    attendedDate: "2026-01-20T09:00:00Z",
    createdAt: "2026-01-10T00:00:00Z", updatedAt: "2026-01-20T00:00:00Z",
  },
  {
    id: "fu3", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    scheduledDate: "2026-02-14T09:00:00Z", scheduledBy: "doctor_sarah_kimani",
    type: "clinic", status: "attended",
    notes: "Losartan added. BP 150/95. Review in 4 weeks.",
    linkedNoteId: "note_feb14",
    reminderSent: true, patientConfirmed: true,
    attendedDate: "2026-02-14T09:00:00Z",
    createdAt: "2026-01-20T00:00:00Z", updatedAt: "2026-02-14T00:00:00Z",
  },
  {
    id: "fu4", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    scheduledDate: "2026-03-15T09:00:00Z", scheduledBy: "doctor_sarah_kimani",
    type: "clinic", status: "missed",
    notes: "Patient did not attend. Phone call unanswered.",
    reasonForMissing: "Patient work commitments",
    reminderSent: true, patientConfirmed: false,
    createdAt: "2026-02-14T00:00:00Z", updatedAt: "2026-03-17T00:00:00Z",
  },
  {
    id: "fu5", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    scheduledDate: "2026-04-10T09:00:00Z", scheduledBy: "doctor_sarah_kimani",
    type: "clinic", status: "attended",
    notes: "BP 140/88. Better control. Continue current regimen.",
    linkedNoteId: "note_apr10",
    reminderSent: true, patientConfirmed: true,
    attendedDate: "2026-04-10T09:00:00Z",
    createdAt: "2026-03-17T00:00:00Z", updatedAt: "2026-04-10T00:00:00Z",
  },
  {
    id: "fu6", toolId: "tool_htn_john", patientId: "patient_john_mwangi",
    scheduledDate: "2026-05-12T09:00:00Z", scheduledBy: "doctor_sarah_kimani",
    type: "clinic", status: "scheduled",
    notes: "Routine 4-week review. Check eGFR + K⁺.",
    reminderSent: false, patientConfirmed: false,
    createdAt: "2026-04-10T00:00:00Z", updatedAt: "2026-04-10T00:00:00Z",
  },
];

export async function GET(req: NextRequest) {
  const toolId    = req.nextUrl.searchParams.get("toolId");
  const patientId = req.nextUrl.searchParams.get("patientId");

  let result = [...FOLLOWUPS];
  if (toolId)    result = result.filter(f => f.toolId    === toolId);
  if (patientId) result = result.filter(f => f.patientId === patientId);

  result.sort((a, b) =>
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const fu = {
    id:               `fu_${Date.now()}`,
    ...body,
    scheduledDate:    body.scheduledDate
      ? new Date(body.scheduledDate).toISOString()
      : new Date().toISOString(),
    status:           "scheduled",
    reminderSent:     false,
    patientConfirmed: false,
    createdAt:        new Date().toISOString(),
    updatedAt:        new Date().toISOString(),
  };
  FOLLOWUPS.push(fu);
  return NextResponse.json(fu, { status: 201 });
}