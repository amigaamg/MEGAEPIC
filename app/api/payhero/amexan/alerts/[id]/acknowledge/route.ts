import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // In production: UPDATE system_alerts SET is_active=0, acknowledged_at=NOW() WHERE id=?
  return NextResponse.json({ ok: true, id, acknowledgedAt: new Date().toISOString() });
}