'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { Unsubscribe } from 'firebase/firestore';
import { useEncounterState } from './useEncounterState';
import { listenEncounter, listenEncounterEvents, addEncounterEvent, updateEncounter, savePhaseData, ORG_ID } from '@/lib/firebase/encounterService';
import type { DocumentEvent, DocumentEventType } from '@/lib/encounterTypes';
import type { EncounterData } from '@/lib/firebase/encounterService';

interface UseEncounterRealtimeOptions {
  deptId: string;
  unitId: string;
  encounterId: string;
  actorName?: string;
  actorRole?: 'doctor' | 'nurse' | 'admin' | 'system';
  orgId?: string;
}

export function useEncounterRealtime({ deptId, unitId, encounterId, actorName = 'Dr. Grace Mwangi', actorRole = 'doctor', orgId }: UseEncounterRealtimeOptions) {
  const store = useEncounterState();
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubsRef = useRef<Unsubscribe[]>([]);

  useEffect(() => {
    const unsub = listenEncounter(deptId, unitId, encounterId,
      (data) => {
        if (data) {
          store.setDepartment(deptId);
          store.setUnit(unitId);
          store.setPatientName(data.patientName);
          store.setActivePhase(data.activePhase || 'triage');
          setIsLive(true);
          setError(null);
        }
      },
      (err) => {
        setError(err.message);
        setIsLive(false);
      },
      orgId,
    );
    unsubsRef.current.push(unsub);
    return () => { unsubsRef.current.forEach(u => u()); unsubsRef.current = []; };
  }, [deptId, unitId, encounterId, orgId]);

  useEffect(() => {
    const unsub = listenEncounterEvents(deptId, unitId, encounterId,
      (events) => {
        const state = useEncounterState.getState();
        const existingIds = new Set(state.events.map(e => e.id));
        const newEvents = events.filter(e => !existingIds.has(e.id));
        if (newEvents.length > 0) {
          useEncounterState.setState({ events: [...state.events, ...newEvents].sort((a, b) => a.timestamp - b.timestamp) });
        }
      },
      undefined, 100, orgId,
    );
    unsubsRef.current.push(unsub);
    return () => { unsubsRef.current.forEach(u => u()); unsubsRef.current = []; };
  }, [deptId, unitId, encounterId, orgId]);

  const addLiveEvent = useCallback(async (event: {
    type: string;
    description: string;
    severity?: 'info' | 'warning' | 'critical';
    details?: Record<string, unknown>;
  }) => {
    const docEvent = { ...event, type: event.type as DocumentEventType, actorName, actorRole };
    try {
      await addEncounterEvent(deptId, unitId, encounterId, docEvent, orgId);
    } catch {}
    store.addEvent(docEvent);
  }, [deptId, unitId, encounterId, actorName, actorRole, orgId]);

  const changePhase = useCallback(async (phaseId: string) => {
    store.setActivePhase(phaseId);
    try {
      await updateEncounter(deptId, unitId, encounterId, { activePhase: phaseId } as any, orgId);
      await addEncounterEvent(deptId, unitId, encounterId, {
        type: 'note_added' as DocumentEventType,
        description: `Phase: ${phaseId.replace(/_/g, ' ')} opened`,
        actorName, actorRole,
      }, orgId);
    } catch {}
  }, [deptId, unitId, encounterId, actorName, actorRole, orgId]);

  const savePhase = useCallback(async (phaseId: string, data: Record<string, unknown>) => {
    try {
      await savePhaseData(deptId, unitId, encounterId, phaseId, data, orgId);
    } catch {}
  }, [deptId, unitId, encounterId, orgId]);

  return { isLive, error, addLiveEvent, changePhase, savePhase };
}

