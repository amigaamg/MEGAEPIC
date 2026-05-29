'use client';
import { useState, useEffect } from 'react';
import { WORKSPACE_DATA, type DepartmentInfo } from '@/lib/workspaceData';

export interface UseDepartmentStatsResult {
  departments: DepartmentInfo[];
  loading: boolean;
  totalActive: number;
  totalToday: number;
}

export function useDepartmentStats(): UseDepartmentStatsResult {
  const [departments, setDepartments] = useState<DepartmentInfo[]>(WORKSPACE_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch('/api/clinical/encounters/stats');
        if (!res.ok) throw new Error('API unavailable');
        const json = await res.json();
        if (cancelled) return;

        const remoteMap = new Map<string, { activeCases: number; todayEncounters: number; avgWaitMinutes: number; units: { id: string; activeCases: number }[] }>();
        for (const d of json.departments) {
          remoteMap.set(d.key, d);
        }

        const merged: DepartmentInfo[] = WORKSPACE_DATA.map((dept) => {
          const remote = remoteMap.get(dept.key);
          if (!remote) return dept;

          const unitMap = new Map<string, number>();
          if (remote.units) {
            for (const u of remote.units) {
              unitMap.set(u.id, u.activeCases);
            }
          }

          return {
            ...dept,
            activeCases: remote.activeCases,
            todayEncounters: remote.todayEncounters,
            avgWaitMinutes: remote.avgWaitMinutes,
            units: dept.units.map((u) => ({
              ...u,
              activeCases: unitMap.has(u.id) ? unitMap.get(u.id)! : u.activeCases,
            })),
          };
        });

        setDepartments(merged);
      } catch {
        if (!cancelled) setDepartments(WORKSPACE_DATA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const totalActive = departments.reduce((sum, d) => sum + d.activeCases, 0);
  const totalToday = departments.reduce((sum, d) => sum + d.todayEncounters, 0);

  return { departments, loading, totalActive, totalToday };
}
