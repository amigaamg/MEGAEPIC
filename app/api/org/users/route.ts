import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/amexan/db/postgres';
import { can } from '@/lib/amexan/constitution/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const actors = await query(
      `SELECT oa.*, d.name as department, u.name as unit, t.name as team
       FROM org_actors oa
       LEFT JOIN departments d ON d.id = oa.department_id
       LEFT JOIN units u ON u.id = oa.unit_id
       LEFT JOIN teams t ON t.id = oa.team_id
       WHERE oa.org_id = $1
       ORDER BY oa.role, oa.name`,
      [orgId]
    );

    return NextResponse.json({ actors: actors.rows });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch users', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, amxUid, name, email, phone, role, departmentId, unitId, teamId, employmentType } = body;

    if (!orgId || !name || !role) {
      return NextResponse.json({ error: 'orgId, name, and role are required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO org_actors (org_id, amx_uid, identity_id, user_id, department_id, unit_id, team_id, role, title, employment_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
       RETURNING *`,
      [
        orgId,
        amxUid || `AMX-ACT-${uuidv4().slice(0, 8).toUpperCase()}`,
        null,
        null,
        departmentId || null,
        unitId || null,
        teamId || null,
        role,
        name,
        employmentType || 'permanent',
      ]
    );

    return NextResponse.json({ success: true, actor: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error('Create actor error:', e);
    return NextResponse.json(
      { error: 'Failed to create user', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, amxUid, updates } = body;

    if (!orgId || !amxUid) {
      return NextResponse.json({ error: 'orgId and amxUid are required' }, { status: 400 });
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(orgId, amxUid);

    const result = await query(
      `UPDATE org_actors SET ${setClauses.join(', ')}
       WHERE org_id = $${paramIndex} AND amx_uid = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Actor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, actor: result.rows[0] });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to update user', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const amxUid = searchParams.get('amxUid');

    if (!orgId || !amxUid) {
      return NextResponse.json({ error: 'orgId and amxUid are required' }, { status: 400 });
    }

    await query(
      `UPDATE org_actors SET status = 'terminated', left_at = NOW(), updated_at = NOW()
       WHERE org_id = $1 AND amx_uid = $2`,
      [orgId, amxUid]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to deactivate user', details: (e as Error).message },
      { status: 500 }
    );
  }
}