'use client';
import { useEffect, useState } from 'react';
import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { WORKSPACE_DATA, getDepartmentTotalActiveCases, getDepartmentTotalEncountersToday } from '@/lib/workspaceData';

export interface LiveOrgStats {
  activeCases: number;
  todayEncounters: number;
  departmentCount: number;
  unitCount: number;
  avgWaitMinutes: number;
  isLive: boolean;
}

export interface LiveDeptStats {
  activeCases: number;
  todayEncounters: number;
}

export function useLiveOrgStats(): LiveOrgStats {
  const [encounters, setEncounters] = useState<any[] | null>(null);

  useEffect(() => {
    const q = query(
      collectionGroup(db, 'encounters'),
      where('status', '==', 'active'),
    );
    const unsub = onSnapshot(q,
      (snap) => setEncounters(snap.docs.map(d => d.data())),
      () => setEncounters([]),
    );
    return unsub;
  }, []);

  if (encounters === null) {
    return {
      activeCases: getDepartmentTotalActiveCases(),
      todayEncounters: getDepartmentTotalEncountersToday(),
      departmentCount: WORKSPACE_DATA.length,
      unitCount: WORKSPACE_DATA.reduce((a, d) => a + d.units.length, 0),
      avgWaitMinutes: WORKSPACE_DATA.reduce((a, d) => a + d.avgWaitMinutes, 0) / WORKSPACE_DATA.length,
      isLive: false,
    };
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();
  const activeCases = encounters.length;
  const todayEncounters = encounters.filter((e: any) => (e.createdAt || 0) >= todayTs).length;

  return {
    activeCases,
    todayEncounters,
    departmentCount: WORKSPACE_DATA.length,
    unitCount: WORKSPACE_DATA.reduce((a, d) => a + d.units.length, 0),
    avgWaitMinutes: WORKSPACE_DATA.reduce((a, d) => a + d.avgWaitMinutes, 0) / WORKSPACE_DATA.length,
    isLive: true,
  };
}

export function useLiveDeptStats(deptKey: string): LiveDeptStats {
  const [encounters, setEncounters] = useState<any[] | null>(null);
  const dept = WORKSPACE_DATA.find(d => d.key === deptKey);

  useEffect(() => {
    if (!deptKey) return;
    const q = query(
      collectionGroup(db, 'encounters'),
      where('departmentId', '==', deptKey),
      where('status', '==', 'active'),
    );
    const unsub = onSnapshot(q,
      (snap) => setEncounters(snap.docs.map(d => d.data())),
      () => setEncounters([]),
    );
    return unsub;
  }, [deptKey]);

  if (encounters === null) {
    return { activeCases: dept?.activeCases || 0, todayEncounters: dept?.todayEncounters || 0 };
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();
  return {
    activeCases: encounters.length,
    todayEncounters: encounters.filter((e: any) => (e.createdAt || 0) >= todayTs).length,
  };
}
