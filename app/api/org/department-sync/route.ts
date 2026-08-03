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
      `SELECT * FROM department_sync_map WHERE org_id = $1 ORDER BY hmis_department_name`,
      [orgId]
    );

    return NextResponse.json({ mappings: result.rows });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch department sync maps', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, hmisDepartmentId, emrDepartmentId, hmisDepartmentName, emrDepartmentName, syncEnabled, syncDirection } = body;

    if (!orgId || !hmisDepartmentId || !emrDepartmentId) {
      return NextResponse.json({ error: 'orgId, hmisDepartmentId, and emrDepartmentId are required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO department_sync_map (
        org_id, hmis_department_id, emr_department_id,
        hmis_department_name, emr_department_name,
        sync_enabled, sync_direction
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (hmis_department_id, org_id) DO UPDATE SET
        emr_department_id = EXCLUDED.emr_department_id,
        hmis_department_name = EXCLUDED.hmis_department_name,
        emr_department_name = EXCLUDED.emr_department_name,
        sync_enabled = EXCLUDED.sync_enabled,
        sync_direction = EXCLUDED.sync_direction,
        last_synced_at = NOW()
      RETURNING *`,
      [orgId, hmisDepartmentId, emrDepartmentId, hmisDepartmentName, emrDepartmentName, syncEnabled !== false, syncDirection || 'bidirectional']
    );

    return NextResponse.json({ success: true, mapping: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error('Department sync error:', e);
    return NextResponse.json(
      { error: 'Failed to create department sync map', details: (e as Error).message },
      { status: 500 }
    );
  }
}