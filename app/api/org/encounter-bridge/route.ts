import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/amexan/db/postgres';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const result = await query(
      `SELECT eb.*, d.name as department_name, u.name as unit_name
       FROM encounter_bridge eb
       LEFT JOIN departments d ON d.id = eb.department_id
       LEFT JOIN units u ON u.id = eb.unit_id
       WHERE eb.org_id = $1
       ORDER BY eb.last_synced_at DESC
       LIMIT 200`,
      [orgId]
    );

    return NextResponse.json({ encounters: result.rows });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch encounters', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, hmisEncounterId, emrEncounterId, patientId, departmentId, unitId, visitType, status, syncDirection } = body;

    if (!orgId || !hmisEncounterId || !emrEncounterId) {
      return NextResponse.json({ error: 'orgId, hmisEncounterId, and emrEncounterId are required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO encounter_bridge (
        org_id, hmis_encounter_id, emr_encounter_id, patient_id,
        department_id, unit_id, visit_type, status, sync_direction
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (hmis_encounter_id) DO UPDATE SET
        emr_encounter_id = EXCLUDED.emr_encounter_id,
        status = EXCLUDED.status,
        sync_direction = EXCLUDED.sync_direction,
        last_synced_at = NOW(),
        sync_version = encounter_bridge.sync_version + 1
      RETURNING *`,
      [orgId, hmisEncounterId, emrEncounterId, patientId, departmentId, unitId, visitType, status || 'synced', syncDirection || 'bidirectional']
    );

    return NextResponse.json({ success: true, encounter: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error('Encounter bridge error:', e);
    return NextResponse.json(
      { error: 'Failed to create encounter bridge', details: (e as Error).message },
      { status: 500 }
    );
  }
}