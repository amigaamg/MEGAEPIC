import { NextRequest, NextResponse } from "next/server";

const MESSAGES: any[] = [];

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("patientId");
  const result = patientId ? MESSAGES.filter(m => m.patientId === patientId) : MESSAGES;
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const msg = {
    id:     `msg_${Date.now()}`,
    ...body,
    sentAt: new Date().toISOString(),
    isRead: false,
  };
  MESSAGES.unshift(msg);
  return NextResponse.json(msg, { status: 201 });
}