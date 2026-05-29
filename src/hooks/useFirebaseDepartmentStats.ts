'use client';
import { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WORKSPACE_DATA, type DepartmentInfo } from '@/lib/workspaceData';

export interface OrgDeptStat {
  deptKey: string;
  unitId: string;
}

export interface UseDeptStatsResult {
  departments: DepartmentInfo[];
  loading: boolean;
  totalActive: number;
  totalToday: number;
  deptStats: Map<string, { active: number; today: number }>;
}

const ORG_ID = 'telemed-a98cf';

function getTodayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function useFirebaseDepartmentStats(): UseDeptStatsResult {
  const [stats, setStats] = useState<Map<string, number>>(new Map());
  const [todayStats, setTodayStats] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const q = query(
      collectionGroup(db, 'encounters'),
      where('status', '==', 'active'),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const activeMap = new Map<string, number>();
        const todayMap = new Map<string, number>();
        const todayStart = getTodayStart();

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const deptKey = data.departmentId as string;
          if (deptKey) {
            activeMap.set(deptKey, (activeMap.get(deptKey) || 0) + 1);
            if ((data.createdAt || 0) >= todayStart) {
              todayMap.set(deptKey, (todayMap.get(deptKey) || 0) + 1);
            }
          }
        });

        setStats(activeMap);
        setTodayStats(todayMap);
        setLoading(false);
        setError(false);
      },
      (err) => {
        console.error('Firebase stats error, using static fallback:', err);
        setError(true);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  const merged: DepartmentInfo[] = WORKSPACE_DATA.map((dept) => ({
    ...dept,
    activeCases: stats.has(dept.key) ? stats.get(dept.key)! : dept.activeCases,
    todayEncounters: todayStats.has(dept.key) ? todayStats.get(dept.key)! : dept.todayEncounters,
    units: dept.units.map((u) => ({
      ...u,
      activeCases: u.activeCases,
    })),
  }));

  const deptStats = new Map<string, { active: number; today: number }>();
  merged.forEach((d) => {
    deptStats.set(d.key, { active: d.activeCases, today: d.todayEncounters });
  });

  const totalActive = merged.reduce((s, d) => s + d.activeCases, 0);
  const totalToday = merged.reduce((s, d) => s + d.todayEncounters, 0);

  return {
    departments: merged,
    loading: loading && !error,
    totalActive,
    totalToday,
    deptStats,
  };
}

export function useSingleDepartmentStats(deptKey: string): {
  activeCases: number;
  todayEncounters: number;
  avgWaitMinutes: number;
  loading: boolean;
} {
  const { departments, loading } = useFirebaseDepartmentStats();
  const dept = departments.find((d) => d.key === deptKey);
  return {
    activeCases: dept?.activeCases ?? 0,
    todayEncounters: dept?.todayEncounters ?? 0,
    avgWaitMinutes: dept?.avgWaitMinutes ?? 0,
    loading,
  };
}
