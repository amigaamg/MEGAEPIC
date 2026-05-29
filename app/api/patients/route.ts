import { NextRequest, NextResponse } from 'next/server';

const MOCK_PATIENTS = [
  { id: 'P001', name: 'Amara Nwosu', age: 34, sex: 'F', department: 'Cardiology', admission: '2026-05-27', status: 'active' },
  { id: 'P002', name: 'John Kamau', age: 52, sex: 'M', department: 'Internal Medicine', admission: '2026-05-26', status: 'active' },
  { id: 'P003', name: 'Mary Wanjiku', age: 28, sex: 'F', department: 'OB/GYN', admission: '2026-05-25', status: 'active' },
  { id: 'P004', name: 'Baby Ochieng', age: 0.1, sex: 'M', department: 'Neonatology', admission: '2026-05-28', status: 'active' },
  { id: 'P005', name: 'Samuel Ochieng', age: 45, sex: 'M', department: 'Surgery', admission: '2026-05-24', status: 'discharged' },
  { id: 'P006', name: 'Grace Mwangi', age: 31, sex: 'F', department: 'Endocrinology', admission: '2026-05-23', status: 'active' },
  { id: 'P007', name: 'Fatima Hassan', age: 67, sex: 'F', department: 'Geriatrics', admission: '2026-05-22', status: 'active' },
  { id: 'P008', name: 'Kwame Osei', age: 8, sex: 'M', department: 'Paediatrics', admission: '2026-05-21', status: 'discharged' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase();
  const department = searchParams.get('department');

  let results = [...MOCK_PATIENTS];
  if (search) {
    results = results.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.id.toLowerCase().includes(search)
    );
  }
  if (department) {
    results = results.filter(p =>
      p.department.toLowerCase() === department.toLowerCase()
    );
  }

  return NextResponse.json({ patients: results, total: results.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, age, sex, department } = body;

    if (!name || !age || !sex) {
      return NextResponse.json({ error: 'Name, age, and sex are required' }, { status: 400 });
    }

    const newPatient = {
      id: `P${String(MOCK_PATIENTS.length + 1).padStart(3, '0')}`,
      name,
      age,
      sex,
      department: department || 'General',
      admission: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    return NextResponse.json({ patient: newPatient }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
