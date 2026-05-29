import { NextRequest, NextResponse } from 'next/server';

const MOCK_ENCOUNTERS = [
  { id: 'ENC-001', patientId: 'P001', patientName: 'Amara Nwosu', department: 'Cardiology', phase: 'DDx', priority: 'urgent', openedAt: '2026-05-28T08:00:00Z' },
  { id: 'ENC-002', patientId: 'P002', patientName: 'John Kamau', department: 'Internal Medicine', phase: 'Treatment', priority: 'routine', openedAt: '2026-05-28T07:30:00Z' },
  { id: 'ENC-003', patientId: 'P003', patientName: 'Mary Wanjiku', department: 'OB/GYN', phase: 'Triage', priority: 'routine', openedAt: '2026-05-28T09:00:00Z' },
  { id: 'ENC-004', patientId: 'P004', patientName: 'Baby Ochieng', department: 'Neonatology', phase: 'Exam', priority: 'urgent', openedAt: '2026-05-28T06:00:00Z' },
  { id: 'ENC-005', patientId: 'P006', patientName: 'Grace Mwangi', department: 'Endocrinology', phase: 'History', priority: 'routine', openedAt: '2026-05-27T14:00:00Z' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const department = searchParams.get('department');
  const phase = searchParams.get('phase');

  let results = [...MOCK_ENCOUNTERS];
  if (department) results = results.filter(e => e.department.toLowerCase() === department.toLowerCase());
  if (phase) results = results.filter(e => e.phase.toLowerCase() === phase.toLowerCase());

  return NextResponse.json({ encounters: results, total: results.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, patientName, department } = body;

    if (!patientId || !patientName || !department) {
      return NextResponse.json({ error: 'patientId, patientName, and department are required' }, { status: 400 });
    }

    const newEncounter = {
      id: `ENC-${String(MOCK_ENCOUNTERS.length + 1).padStart(3, '0')}`,
      patientId,
      patientName,
      department,
      phase: 'Triage',
      priority: 'routine',
      openedAt: new Date().toISOString(),
    };

    return NextResponse.json({ encounter: newEncounter }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
