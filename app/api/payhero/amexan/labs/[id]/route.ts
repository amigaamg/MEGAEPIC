import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await req.json();
  const { id } = await params;
  // In production: UPDATE lab_orders SET ... WHERE id = ?
  return NextResponse.json({ id, ...body, updatedAt: new Date().toISOString() });
}