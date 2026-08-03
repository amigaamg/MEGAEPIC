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
      `SELECT pm.*, oa.name as merged_by_name
       FROM patient_merge_log pm
       LEFT JOIN org_actors oa ON oa.id = pm.merged_by
       WHERE pm.org_id = $1
       ORDER BY pm.merged_at DESC
       LIMIT 100`,
      [orgId]
    );

    return NextResponse.json({ merges: result.rows });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch patient merge log', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, hmisPatientId, emrPatientId, mergeStrategy, mergedBy, notes } = body;

    if (!orgId || !hmisPatientId || !emrPatientId) {
      return NextResponse.json({ error: 'orgId, hmisPatientId, and emrPatientId are required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO patient_merge_log (
        org_id, hmis_patient_id, emr_patient_id,
        merge_strategy, merged_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [orgId, hmisPatientId, emrPatientId, mergeStrategy || 'emr_primary', mergedBy || null, notes || null]
    );

    return NextResponse.json({ success: true, merge: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error('Patient merge error:', e);
    return NextResponse.json(
      { error: 'Failed to create patient merge record', details: (e as Error).message },
      { status: 500 }
    );
  }
}