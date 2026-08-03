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

    const roles = await query(
      `SELECT * FROM org_roles WHERE org_id = $1 ORDER BY type, name`,
      [orgId]
    );

    return NextResponse.json({ roles: roles.rows });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch roles', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, name, description, type, permissions, inheritsFrom, maxAssignments, isAssignable } = body;

    if (!orgId || !name || !type) {
      return NextResponse.json({ error: 'orgId, name, and type are required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO org_roles (org_id, name, description, type, permissions, inherits_from, max_assignments, is_assignable, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        orgId,
        name,
        description || '',
        type,
        JSON.stringify(permissions || []),
        inheritsFrom || null,
        maxAssignments || null,
        isAssignable !== false,
        null,
      ]
    );

    return NextResponse.json({ success: true, role: result.rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to create role', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, roleId, updates } = body;

    if (!orgId || !roleId) {
      return NextResponse.json({ error: 'orgId and roleId are required' }, { status: 400 });
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
    values.push(orgId, roleId);

    const result = await query(
      `UPDATE org_roles SET ${setClauses.join(', ')}
       WHERE org_id = $${paramIndex} AND id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, role: result.rows[0] });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to update role', details: (e as Error).message },
      { status: 500 }
    );
  }
}