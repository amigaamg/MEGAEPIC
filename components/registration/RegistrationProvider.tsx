'use client';
import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { createRegistrationEngine } from '@/lib/clinical/constitutional/registration-engine';
import type { RegistrationState, Answer, ClinicalContext } from '@/lib/clinical/constitutional/registration-engine/types';

interface RegistrationContextValue {
  state: RegistrationState;
  clinicalContext: ClinicalContext | null;
  setField: (fieldId: string, value: unknown) => void;
  setAnswerState: (fieldId: string, state: 'captured' | 'unknown' | 'unable' | 'declined' | 'not_applicable') => void;
  nextStage: () => void;
  previousStage: () => void;
  initialize: () => void;
  getField: (fieldId: string) => Answer | undefined;
  isStageActive: (stageId: string) => boolean;
  isStageComplete: (stageId: string) => boolean;
  progress: { completed: number; total: number; percent: number };
}

const RegistrationCtx = createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [engine] = useState(() => createRegistrationEngine());
  const [state, setState] = useState<RegistrationState>(() => engine.initialize());
  const [clinicalContext, setClinicalContext] = useState<ClinicalContext | null>(null);

  const setField = useCallback((fieldId: string, value: unknown) => {
    const newState = engine.setField(fieldId, value);
    setState({ ...newState });
    if (newState.stage === 'registration_complete') {
      setClinicalContext(engine.getClinicalContext());
    }
  }, [engine]);

  const setAnswerStateValue = useCallback((
    fieldId: string,
    ansState: 'captured' | 'unknown' | 'unable' | 'declined' | 'not_applicable'
  ) => {
    const newState = engine.setAnswerState(fieldId, ansState);
    setState({ ...newState });
  }, [engine]);

  const nextStage = useCallback(() => {
    const newState = engine.nextStage();
    setState({ ...newState });
    if (newState.stage === 'registration_complete') {
      setClinicalContext(engine.getClinicalContext());
    }
  }, [engine]);

  const previousStage = useCallback(() => {
    setState({ ...engine.previousStage() });
  }, [engine]);

  const initialize = useCallback(() => {
    setState({ ...engine.initialize() });
  }, [engine]);

  const getField = useCallback((fieldId: string) => state.data[fieldId], [state.data]);

  const isStageActive = useCallback((stageId: string) => state.stage === stageId, [state.stage]);
  const isStageComplete = useCallback((stageId: string) => state.stageStatuses[stageId] === 'completed', [state.stageStatuses]);

  const progress = useMemo(() => {
    const stages = ['identity', 'patient_context', 'encounter_context', 'clinical_context', 'registration_complete'];
    const completed = stages.filter(s => state.stageStatuses[s] === 'completed').length;
    const total = stages.length;
    return { completed, total, percent: Math.round((completed / total) * 100) };
  }, [state.stageStatuses]);

  const value = useMemo(() => ({
    state, clinicalContext, setField, setAnswerState: setAnswerStateValue,
    nextStage, previousStage, initialize, getField,
    isStageActive, isStageComplete, progress,
  }), [state, clinicalContext, setField, setAnswerStateValue, nextStage, previousStage, initialize, getField, isStageActive, isStageComplete, progress]);

  return (
    <RegistrationCtx.Provider value={value}>
      {children}
    </RegistrationCtx.Provider>
  );
}

export function useRegistration() {
  const ctx = useContext(RegistrationCtx);
  if (!ctx) throw new Error('useRegistration must be used within RegistrationProvider');
  return ctx;
}
