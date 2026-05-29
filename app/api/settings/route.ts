import { NextResponse } from 'next/server';

const DEFAULT_SETTINGS = {
  autoPopulateDdx: true,
  showProtocolAlerts: true,
  enableDrugInteractions: true,
  noteAutoSave: true,
  compactMode: false,
  showSidebarLabels: true,
  highContrast: false,
};

export async function GET() {
  return NextResponse.json({ settings: DEFAULT_SETTINGS });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const settings = { ...DEFAULT_SETTINGS, ...body };
    return NextResponse.json({ settings, saved: true });
  } catch {
    return NextResponse.json({ error: 'Invalid settings body' }, { status: 400 });
  }
}
