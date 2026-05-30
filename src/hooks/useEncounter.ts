'use client';
import { useState, useEffect } from 'react';
import { listenEncounter, updateEncounter, addTimelineEvent } from '@/services/encounterService';

export function useEncounter(encounterId: string, deptSlug: string, unitSlug: string, orgId?: string) {
  const [encounter, setEncounter] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = listenEncounter(
      encounterId, deptSlug, unitSlug,
      (data) => {
        setEncounter(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      orgId,
    );
    return unsub;
  }, [encounterId, deptSlug, unitSlug, orgId]);

  const update = async (updates: Record<string, any>) => {
    try {
      await updateEncounter(encounterId, deptSlug, unitSlug, updates, orgId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addEvent = async (event: string, details: string, userId: string, userName: string) => {
    try {
      await addTimelineEvent(encounterId, deptSlug, unitSlug, event, details, userId, userName, orgId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const completePhase = async (phase: string, userId: string, userName: string) => {
    const completed = encounter?.completedPhases || [];
    if (!completed.includes(phase)) {
      completed.push(phase);
    }
    const phaseOrder = ['registration','presenting_complaint','hpi','examination','bedside_scores','ddx','investigations','imaging','treatment','operative_note','ward_rounds','disposition'];
    const idx = phaseOrder.indexOf(phase);
    const nextPhase = idx >= 0 && idx < phaseOrder.length - 1 ? phaseOrder[idx + 1] : 'disposition';

    await Promise.all([
      updateEncounter(encounterId, deptSlug, unitSlug, {
        completedPhases: completed,
        activePhase: nextPhase,
      }, orgId),
      addTimelineEvent(encounterId, deptSlug, unitSlug, `Phase completed: ${phase}`, `Completed by ${userName}`, userId, userName, orgId),
    ]);
  };

  return { encounter, loading, error, update, addEvent, completePhase };
}
