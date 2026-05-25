import { NextRequest, NextResponse } from "next/server";

// Shared store reference — in production this would be your DB
// Import your db client here and run an UPDATE query instead
const PRESCRIPTIONS_STORE: Record<string, any> = {};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { newDose, reason, doctorId } = await req.json();
  const { id } = await params;

  if (!newDose || !reason) {
    return NextResponse.json(
      { error: "newDose and reason are required" },
      { status: 400 }
    );
  }

  // In production:
  // await db.query(
  //   "UPDATE prescriptions SET dose = ?, dose_changes = JSON_ARRAY_APPEND(dose_changes, '$', JSON_OBJECT(...)), updated_at = NOW() WHERE id = ?",
  //   [newDose, id]
  // );

  return NextResponse.json({
    ok:      true,
    id,
    newDose,
    reason,
    changedBy:   doctorId,
    changedAt:   new Date().toISOString(),
  });
}