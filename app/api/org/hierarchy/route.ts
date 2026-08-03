import { NextRequest, NextResponse } from 'next/server';
import { getOrgHierarchy, getOrgDepartments, getOrgUnits, getOrgTeams, getOrgActors, getOrgRoles, getOrgRoleAssignments } from '@/lib/amexan/db/postgres';
import { queryOrgHierarchy, addDepartmentNode, addActorNode } from '@/lib/amexan/db/neo4j';
import { can } from '@/lib/amexan/constitution/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const [pgHierarchy, neo4jHierarchy, depts, units, teams, actors, roles, assignments] = await Promise.all([
      getOrgHierarchy(orgId),
      queryOrgHierarchy(orgId),
      getOrgDepartments(orgId),
      getOrgUnits(orgId),
      getOrgTeams(orgId),
      getOrgActors(orgId),
      getOrgRoles(orgId),
      getOrgRoleAssignments(orgId),
    ]);

    return NextResponse.json({
      orgId,
      postgresHierarchy: pgHierarchy,
      neo4jHierarchy,
      departments: depts,
      units,
      teams,
      actors,
      roles,
      assignments,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch hierarchy', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, action, data } = body;

    if (!orgId || !action) {
      return NextResponse.json({ error: 'orgId and action are required' }, { status: 400 });
    }

    switch (action) {
      case 'add_department': {
        const dept = await addDepartmentNode(data.id, data.name, data.type, orgId);
        return NextResponse.json({ success: true, department: dept });
      }
      case 'add_actor': {
        const actor = await addActorNode(data.amxUid, data.name, data.role, data.departmentId);
        return NextResponse.json({ success: true, actor });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to update hierarchy', details: (e as Error).message },
      { status: 500 }
    );
  }
}