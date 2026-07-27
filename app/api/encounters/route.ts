import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/amexan/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department') || undefined;
    const phase = searchParams.get('phase') || undefined;
    const id = searchParams.get('id') || undefined;

    if (id) {
      const result = await db.queryOne(
        `SELECT e.*, p.given_name || ' ' || p.family_name as patient_name,
                d.name as department_name
         FROM encounters e
         JOIN patients p ON p.id = e.patient_id
         JOIN departments d ON d.id = e.department_id
         WHERE e.id = $1 AND e.deleted = false`,
        [id],
      );
      if (!result) return NextResponse.json({ error: 'Encounter not found' }, { status: 404 });
      return NextResponse.json({ encounter: result });
    }

    const encounters = await db.getEncounters(department, phase);
    return NextResponse.json({ encounters, total: encounters.length });
  } catch (e) {
    console.error('[API encounters]', e);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, providerId, departmentId, facilityId, visitType, priority, reasonForVisit } = body;

    if (!patientId || !providerId || !departmentId || !facilityId) {
      return NextResponse.json({ error: 'patientId, providerId, departmentId, facilityId required' }, { status: 400 });
    }

    const id = await db.createEncounter({
      patientId, providerId, departmentId, facilityId,
      visitType, priority, reasonForVisit,
    });

    return NextResponse.json({ encounter_id: id }, { status: 201 });
  } catch (e) {
    console.error('[API encounters POST]', e);
    return NextResponse.json({ error: 'Failed to create encounter' }, { status: 500 });
  }
}
