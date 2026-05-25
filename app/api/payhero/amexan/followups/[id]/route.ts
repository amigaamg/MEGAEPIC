import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json();
  const { id } = await params;

  // In production:
  // await db.query("UPDATE follow_ups SET status=?, attended_date=?, notes=?, updated_at=NOW() WHERE id=?", [...body, id])

  return NextResponse.json({
    id,
    ...body,
    updatedAt: new Date().toISOString(),
  });
}