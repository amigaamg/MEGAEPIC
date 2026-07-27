import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/amexan/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const department = searchParams.get('department') || undefined;
    const id = searchParams.get('id') || undefined;

    if (id) {
      const patient = await db.getPatientById(id);
      if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      return NextResponse.json({ patient });
    }

    const patients = await db.getPatients(search, department);
    return NextResponse.json({ patients, total: patients.length });
  } catch (e) {
    console.error('[API patients]', e);
    return NextResponse.json({ error: 'Database query failed', details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { given_name, family_name, sex_at_birth, date_of_birth, age, residence, occupation, phone } = body;

    if (!given_name || !family_name || !sex_at_birth) {
      return NextResponse.json({ error: 'given_name, family_name, and sex_at_birth are required' }, { status: 400 });
    }

    const id = await db.createPatient({
      given_name, family_name, sex_at_birth, date_of_birth,
      age: age ? parseInt(age) : undefined,
      residence, occupation, phone,
    });

    return NextResponse.json({ patient_id: id }, { status: 201 });
  } catch (e) {
    console.error('[API patients POST]', e);
    return NextResponse.json({ error: 'Failed to create patient', details: String(e) }, { status: 500 });
  }
}
