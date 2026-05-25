import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { reason, doctorId } = await req.json();
  const { id } = await params;

  if (!reason) {
    return NextResponse.json({ error: "reason is required" }, { status: 400 });
  }

  // In production:
  // await db.query(
  //   "UPDATE prescriptions SET status='stopped', stop_date=NOW(), stop_reason=?, stopped_by=? WHERE id=?",
  //   [reason, doctorId, id]
  // );

  return NextResponse.json({
    ok:        true,
    id,
    status:    "stopped",
    stopReason: reason,
    stoppedBy:  doctorId,
    stopDate:   new Date().toISOString(),
  });
}