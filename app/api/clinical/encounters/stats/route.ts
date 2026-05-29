import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { WORKSPACE_DATA } from '@/lib/workspaceData';

export interface DepartmentStats {
  key: string;
  activeCases: number;
  todayEncounters: number;
  avgWaitMinutes: number;
  units: { id: string; activeCases: number }[];
}

export async function GET(_req: NextRequest) {
  try {
    if (!prisma) throw new Error('Prisma not available');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const departments = await prisma.department.findMany({
      include: {
        units: true,
        encounters: {
          where: { status: 'active' },
          select: { id: true, unitId: true, startedAt: true, status: true, type: true },
        },
      },
    });

    const stats: DepartmentStats[] = departments.map((dept: any) => {
      const activeEncounters = dept.encounters.filter((e: any) => e.status === 'active');
      const todayEncounters = dept.encounters.filter(
        (e: any) => new Date(e.startedAt) >= today,
      );
      const unitMap = new Map<string, number>();
      for (const unit of dept.units) {
        unitMap.set(unit.id, 0);
      }
      for (const enc of activeEncounters) {
        if (enc.unitId && unitMap.has(enc.unitId)) {
          unitMap.set(enc.unitId, (unitMap.get(enc.unitId) || 0) + 1);
        }
      }

      return {
        key: dept.key,
        activeCases: activeEncounters.length,
        todayEncounters: todayEncounters.length,
        avgWaitMinutes: 0,
        units: dept.units.map((u: any) => ({
          id: u.id,
          activeCases: unitMap.get(u.id) || 0,
        })),
      };
    });

    return NextResponse.json({ departments: stats, source: 'database' });
  } catch {
    const fallback: DepartmentStats[] = WORKSPACE_DATA.map((d) => ({
      key: d.key,
      activeCases: d.activeCases,
      todayEncounters: d.todayEncounters,
      avgWaitMinutes: d.avgWaitMinutes,
      units: d.units.map((u) => ({
        id: u.id,
        activeCases: u.activeCases,
      })),
    }));

    return NextResponse.json({ departments: fallback, source: 'static' });
  }
}
