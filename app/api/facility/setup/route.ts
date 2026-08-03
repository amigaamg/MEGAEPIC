import { NextRequest, NextResponse } from 'next/server';
import { createFacility, getOrgHierarchy, getOrgDepartments, getOrgUnits, getOrgTeams, getOrgActors, getOrgRoles, getOrgRoleAssignments } from '@/lib/amexan/db/postgres';
import { seedOrgHierarchy, addOrgNode, addDepartmentNode, addActorNode, queryOrgHierarchy } from '@/lib/amexan/db/neo4j';
import { registerHierarchyNode, type OrgHierarchyNode } from '@/lib/firebase/orgContext';
import { can } from '@/lib/amexan/constitution/auth';
import type { SubscriptionTier } from '@/lib/amexan/constitution/capability-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      country,
      region,
      network,
      hospital,
      departments,
      wards,
      teams,
      users,
      subscriptionTier,
    } = body;

    if (!country || !region || !hospital?.name) {
      return NextResponse.json(
        { error: 'Missing required fields: country, region, hospital.name' },
        { status: 400 }
      );
    }

    const orgId = await createFacility({
      country,
      region,
      network: network || null,
      hospital,
      departments: departments || [{ name: 'General Medicine', type: 'medical', specialty: 'General' }],
      wards: wards || [],
      teams: teams || [],
      users: users || [],
      subscriptionTier: (subscriptionTier as SubscriptionTier) || 'starter',
    });

    await seedOrgHierarchy(orgId, hospital.name, 'level_2_organization');

    const hierarchyNode: OrgHierarchyNode = {
      id: orgId,
      name: hospital.name,
      type: 'hospital',
      parentId: null,
      children: [],
      country,
      region,
      network: network || '',
      hospital: hospital.name,
      department: '',
      ward: '',
      status: 'active',
      createdAt: Date.now(),
    };
    registerHierarchyNode(hierarchyNode);

    const hierarchy = await getOrgHierarchy(orgId);
    const depts = await getOrgDepartments(orgId);
    const units = await getOrgUnits(orgId);
    const teamsData = await getOrgTeams(orgId);
    const actors = await getOrgActors(orgId);
    const roles = await getOrgRoles(orgId);
    const assignments = await getOrgRoleAssignments(orgId);

    return NextResponse.json({
      success: true,
      orgId,
      hierarchy,
      departments: depts,
      units,
      teams: teamsData,
      actors,
      roles,
      assignments,
    });
  } catch (e) {
    console.error('Facility setup error:', e);
    return NextResponse.json(
      { error: 'Failed to create facility', details: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const hierarchy = await getOrgHierarchy(orgId);
    const depts = await getOrgDepartments(orgId);
    const units = await getOrgUnits(orgId);
    const teamsData = await getOrgTeams(orgId);
    const actors = await getOrgActors(orgId);
    const roles = await getOrgRoles(orgId);
    const assignments = await getOrgRoleAssignments(orgId);

    return NextResponse.json({
      orgId,
      hierarchy,
      departments: depts,
      units,
      teams: teamsData,
      actors,
      roles,
      assignments,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch facility', details: (e as Error).message },
      { status: 500 }
    );
  }
}