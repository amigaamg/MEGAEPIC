import { NextResponse } from 'next/server';
import { WORKSPACE_DATA } from '@/lib/workspaceData';

export interface DepartmentStats {
  key: string;
  activeCases: number;
  todayEncounters: number;
  avgWaitMinutes: number;
  units: { id: string; activeCases: number }[];
}

export async function GET() {
  const stats: DepartmentStats[] = WORKSPACE_DATA.map((d) => ({
    key: d.key,
    activeCases: d.activeCases,
    todayEncounters: d.todayEncounters,
    avgWaitMinutes: d.avgWaitMinutes,
    units: d.units.map((u) => ({
      id: u.id,
      activeCases: u.activeCases,
    })),
  }));

  return NextResponse.json({ departments: stats, source: 'static' });
}
