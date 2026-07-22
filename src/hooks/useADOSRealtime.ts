'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection, doc, query, where, onSnapshot, orderBy, limit,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

import {
  buildDoctorContext,
  generateDoctorWorkspace,
  buildCareTeamContext,
  generateCareTeamWorkspace,
  triageNotifications,
  triageCareTeamNotifications,
} from '@/lib/amexan';

import type {
  DoctorContext, DoctorShift, DoctorAssignment, DoctorLocation,
  ActivePatient, QueueItem, ClinicalTask, DoctorNotification,
  WorkflowInstance,
  CareTeamContext, CareTeamProfession, CareTeamShift,
  CareTeamAssignment, CareTeamLocation, CareTeamNotification,
} from '@/lib/amexan/clinical-constitution/types';

// ── Realtime Hook for Doctor ADOS ─────────────────────────────────────────────
// Subscribes to Firestore collections and builds DoctorContext reactively.

export interface UseADOSDoctorOptions {
  doctorId: string;
  doctorName: string;
  organizationId: string;
  organizationName: string;
  departmentId?: string;
  departmentName?: string;
  unitId?: string;
  unitName?: string;
  shift: DoctorShift;
  assignment: DoctorAssignment;
  currentLocation: DoctorLocation;
}

export interface UseADOSDoctorResult {
  context: DoctorContext | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useADOSDoctor(options: UseADOSDoctorOptions): UseADOSDoctorResult {
  const [context, setContext] = useState<DoctorContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribers = useRef<Unsubscribe[]>([]);
  const refreshCounter = useRef(0);

  const refetch = useCallback(() => {
    refreshCounter.current++;
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const activePatients: ActivePatient[] = [];
    const patientQueue: QueueItem[] = [];
    const pendingTasks: ClinicalTask[] = [];
    const notifications: DoctorNotification[] = [];
    const workflows: WorkflowInstance[] = [];

    let loaded = 0;
    const totalSubs = 3;
    let hasError = false;

    function tryBuild() {
      if (hasError) return;
      loaded++;
      if (loaded < totalSubs) return;

      const workspace = generateDoctorWorkspace(options.assignment.type, options.currentLocation);

      const ctx = buildDoctorContext({
        doctorId: options.doctorId as any,
        doctorName: options.doctorName,
        organizationId: options.organizationId,
        organizationName: options.organizationName,
        departmentId: options.departmentId,
        departmentName: options.departmentName,
        unitId: options.unitId,
        unitName: options.unitName,
        shift: options.shift,
        assignment: options.assignment,
        currentLocation: options.currentLocation,
        activePatients: [...activePatients],
        patientQueue: [...patientQueue],
        pendingTasks: [...pendingTasks],
        notifications: [...notifications],
        workflows: workflows.length > 0 ? [...workflows] : undefined,
      });

      setContext(ctx);
      setLoading(false);
    }

    // 1. Active workflows (active patients)
    const workflowsUnsub = onSnapshot(
      query(
        collection(db, 'organizations', options.organizationId, 'workflows'),
        where('status', '==', 'active'),
      ),
      (snap) => {
        workflows.length = 0;
        activePatients.length = 0;
        snap.forEach((d) => {
          const wf = { id: d.id, ...d.data() } as WorkflowInstance;
          workflows.push(wf);
          activePatients.push({
            patientId: wf.patientId,
            name: (wf as any).patientName ?? 'Unknown',
            age: (wf as any).patientAge ?? 0,
            sex: (wf as any).patientSex ?? '',
            bed: (wf as any).bed ?? (wf as any).currentLocation?.bed,
            diagnosis: (wf as any).diagnosis ?? '',
            hospitalDay: (wf as any).hospitalDay,
            status: wf.currentState === 'resuscitation' ? 'critical' as const : wf.currentState === 'icu' ? 'critical' as const : 'stable' as const,
            alerts: [],
            updatedAt: Date.now(),
          });
        });
        tryBuild();
      },
      (err) => { hasError = true; setError(err); setLoading(false); },
    );
    unsubscribers.current.push(workflowsUnsub);

    // 2. Queues
    const queueUnsub = onSnapshot(
      query(
        collection(db, 'queues'),
        where('departmentId', '==', options.departmentId ?? ''),
      ),
      (snap) => {
        patientQueue.length = 0;
        snap.forEach((d) => {
          const q = { id: d.id, ...d.data() } as any;
          const items: QueueItem[] = q.items ?? [];
          patientQueue.push(...items);
        });
        tryBuild();
      },
      (err) => { hasError = true; setError(err); setLoading(false); },
    );
    unsubscribers.current.push(queueUnsub);

    // 3. Tasks assigned to this doctor
    const tasksUnsub = onSnapshot(
      query(
        collection(db, 'organizations', options.organizationId, 'tasks'),
        where('assignedTo', '==', options.doctorId),
        where('status', 'in', ['pending', 'in_progress', 'overdue', 'escalated']),
      ),
      (snap) => {
        pendingTasks.length = 0;
        snap.forEach((d) => {
          pendingTasks.push({ id: d.id, ...d.data() } as ClinicalTask);
        });
        tryBuild();
      },
      (err) => { hasError = true; setError(err); setLoading(false); },
    );
    unsubscribers.current.push(tasksUnsub);

    return () => {
      unsubscribers.current.forEach((u) => u());
      unsubscribers.current = [];
    };
  }, [
    options.doctorId,
    options.organizationId,
    options.departmentId,
    options.shift.type,
    options.shift.startTime,
    options.shift.endTime,
    options.assignment.type,
    options.assignment.location,
    options.currentLocation.departmentId,
    refreshCounter.current,
  ]);

  return { context, loading, error, refetch };
}

// ── Realtime Hook for Care Team ADOS ──────────────────────────────────────────
// Subscribes to Firestore and builds CareTeamContext reactively.

export interface UseADOSCareTeamOptions {
  clinicianId: string;
  clinicianName: string;
  profession: CareTeamProfession;
  organizationId: string;
  organizationName: string;
  departmentId?: string;
  departmentName?: string;
  unitId?: string;
  unitName?: string;
  shift: CareTeamShift;
  assignment: CareTeamAssignment;
  currentLocation: CareTeamLocation;
}

export interface UseADOSCareTeamResult {
  context: CareTeamContext | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useADOSCareTeam(options: UseADOSCareTeamOptions): UseADOSCareTeamResult {
  const [context, setContext] = useState<CareTeamContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribers = useRef<Unsubscribe[]>([]);
  const refreshCounter = useRef(0);

  const refetch = useCallback(() => {
    refreshCounter.current++;
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const activePatients: ActivePatient[] = [];
    const patientQueue: QueueItem[] = [];
    const pendingTasks: ClinicalTask[] = [];
    const notifications: CareTeamNotification[] = [];

    let loaded = 0;
    const totalSubs = 3;
    let hasError = false;

    function tryBuild() {
      if (hasError) return;
      loaded++;
      if (loaded < totalSubs) return;

      const ctx = buildCareTeamContext({
        clinicianId: options.clinicianId as any,
        clinicianName: options.clinicianName,
        profession: options.profession,
        organizationId: options.organizationId,
        organizationName: options.organizationName,
        departmentId: options.departmentId,
        departmentName: options.departmentName,
        unitId: options.unitId,
        unitName: options.unitName,
        shift: options.shift,
        assignment: options.assignment,
        currentLocation: options.currentLocation,
        activePatients: [...activePatients],
        patientQueue: [...patientQueue],
        pendingTasks: [...pendingTasks],
        notifications: [...notifications],
      });

      setContext(ctx);
      setLoading(false);
    }

    // 1. Active workflows (active patients)
    const workflowsUnsub = onSnapshot(
      query(
        collection(db, 'organizations', options.organizationId, 'workflows'),
        where('status', '==', 'active'),
      ),
      (snap) => {
        activePatients.length = 0;
        snap.forEach((d) => {
          const wf = { id: d.id, ...d.data() } as WorkflowInstance;
          activePatients.push({
            patientId: wf.patientId,
            name: (wf as any).patientName ?? 'Unknown',
            age: (wf as any).patientAge ?? 0,
            sex: (wf as any).patientSex ?? '',
            bed: (wf as any).bed ?? (wf as any).currentLocation?.bed,
            diagnosis: (wf as any).diagnosis ?? '',
            hospitalDay: (wf as any).hospitalDay,
            status: 'stable' as const,
            alerts: [],
            updatedAt: Date.now(),
          });
        });
        tryBuild();
      },
      (err) => { hasError = true; setError(err); setLoading(false); },
    );
    unsubscribers.current.push(workflowsUnsub);

    // 2. Queues
    const queueUnsub = onSnapshot(
      query(
        collection(db, 'queues'),
        where('departmentId', '==', options.departmentId ?? ''),
      ),
      (snap) => {
        patientQueue.length = 0;
        snap.forEach((d) => {
          const q = { id: d.id, ...d.data() } as any;
          const items: QueueItem[] = q.items ?? [];
          patientQueue.push(...items);
        });
        tryBuild();
      },
      (err) => { hasError = true; setError(err); setLoading(false); },
    );
    unsubscribers.current.push(queueUnsub);

    // 3. Tasks assigned to this clinician
    const tasksUnsub = onSnapshot(
      query(
        collection(db, 'organizations', options.organizationId, 'tasks'),
        where('assignedTo', '==', options.clinicianId),
        where('status', 'in', ['pending', 'in_progress', 'overdue', 'escalated']),
      ),
      (snap) => {
        pendingTasks.length = 0;
        snap.forEach((d) => {
          pendingTasks.push({ id: d.id, ...d.data() } as ClinicalTask);
        });
        tryBuild();
      },
      (err) => { hasError = true; setError(err); setLoading(false); },
    );
    unsubscribers.current.push(tasksUnsub);

    return () => {
      unsubscribers.current.forEach((u) => u());
      unsubscribers.current = [];
    };
  }, [
    options.clinicianId,
    options.organizationId,
    options.departmentId,
    options.profession,
    options.shift.type,
    options.shift.startTime,
    options.shift.endTime,
    options.assignment.type,
    options.assignment.location,
    options.currentLocation.departmentId,
    refreshCounter.current,
  ]);

  return { context, loading, error, refetch };
}
