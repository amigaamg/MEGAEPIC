// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN EncounterContext — single React provider replacing three state systems
// ═══════════════════════════════════════════════════════════════════════════════
// Replaces: ClinicalContext (src/store/ClinicalContext.tsx)
//           patientStore (src/state/patientStore.ts — Zustand)
//           uiStore phase tracking (src/state/uiStore.ts)
//           Firestore encounter writes (src/services/encounterService.ts)
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { saveEncounter as localSave, loadEncounter as localLoad } from '@/lib/amexan/persistence/localStorage';
import type { EncounterState, WorkflowStep } from './encounterState';
import { createEncounterState } from './encounterState';
import type { EncounterAction } from './encounterReducer';
import { encounterReducer } from './encounterReducer';
import { evaluateCompleteness, canEnterStep, questionsExhausted } from './completionEngine';
import type { SymptomId, StructuredSymptom } from './encounterState';
import { runDDX, type DDXOutput } from './engines/ddxEngine';

// ── Context shape ─────────────────────────────────────────────────────────────

interface EncounterContextValue {
  state: EncounterState;
  dispatch: React.Dispatch<EncounterAction>;

  // Convenience methods (all call dispatch internally)
  setPatientInfo: (info: { name: string; ageYears: number; ageMonths: number; sex: 'male' | 'female' | 'other'; mrn: string }) => void;
  setChiefComplaint: (text: string, duration: string, severity: number) => void;
  activateSymptom: (symptom: StructuredSymptom) => void;
  advanceStep: (step: WorkflowStep) => void;
  answerQuestion: (symptomId: SymptomId, fieldId: string, value: any) => void;
  markAbsent: (symptomId: SymptomId) => void;
  computeDDX: () => DDXOutput;

  // Completion
  completeness: ReturnType<typeof evaluateCompleteness>;
  canAdvance: boolean;

  // Persistence
  saveToFirestore: () => Promise<void>;
  loadFromFirestore: (id: string) => Promise<void>;
  reset: () => void;
}

const EncounterCtx = createContext<EncounterContextValue | null>(null);

// ── Persistence helpers ───────────────────────────────────────────────────────

const STORAGE_KEY = 'amexan_encounter_v1';

function persistToLocal(state: EncounterState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function loadFromLocal(): EncounterState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function EncounterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    encounterReducer,
    null,
    () => loadFromLocal() ?? createEncounterState()
  );

  const completeness = useMemo(() => evaluateCompleteness(state), [state]);
  const [ddxResult, setDdxResult] = useState<DDXOutput | null>(null);
  // Auto-save to localStorage on every state change (debounced 500ms)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => persistToLocal(state), 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [state]);

  // ── Convenience methods ──────────────────────────────────────────────

  const setPatientInfo = useCallback((info: {
    name: string; ageYears: number; ageMonths: number; sex: 'male' | 'female' | 'other'; mrn: string;
  }) => {
    dispatch({
      type: 'SET_DEMOGRAPHICS',
      payload: {
        name: info.name,
        ageYears: info.ageYears,
        ageMonths: info.ageMonths,
        sex: info.sex,
        mrn: info.mrn,
      },
    });
  }, []);

  const setChiefComplaint = useCallback((text: string, duration: string, severity: number) => {
    dispatch({ type: 'SET_CHIEF_COMPLAINT', payload: { text, duration, severity } });
  }, []);

  const activateSymptom = useCallback((symptom: StructuredSymptom) => {
    dispatch({ type: 'ACTIVATE_SYMPTOM', payload: symptom });
  }, []);

  const advanceStep = useCallback((step: WorkflowStep) => {
    if (canEnterStep(state, step)) {
      dispatch({ type: 'ADVANCE_WORKFLOW', step });
    }
  }, [state]);

  const answerQuestion = useCallback((symptomId: SymptomId, fieldId: string, value: any) => {
    const current = state.symptoms[symptomId];
    if (current) {
      dispatch({
        type: 'UPDATE_SYMPTOM',
        payload: { ...current, [fieldId]: value } as any,
      });
    }
  }, [state.symptoms]);

  const markAbsent = useCallback((symptomId: SymptomId) => {
    dispatch({ type: 'MARK_SYMPTOM_ABSENT', symptomId });
  }, []);

  const computeDDX = useCallback(() => {
    const result = runDDX(state);
    setDdxResult(result);
    if (result.differentials.length > 0) {
      dispatch({ type: 'SET_DIFFERENTIALS', payload: result.differentials });
      dispatch({ type: 'SET_DANGER_RANKED', payload: result.dangerRanked });
      dispatch({ type: 'SET_MUST_NOT_MISS', payload: result.mustNotMissDiseases });
    }
    return result;
  }, [state]);

  const saveToFirestore = useCallback(async () => {
    const orgId = state.demographics.organizationId || 'telemed-a98cf';
    const encounterId = state.id || `enc_${Date.now()}`;
    localSave(orgId, encounterId, {
      biodata: {
        patientName: state.demographics.name,
        hospitalNumber: state.demographics.mrn,
        age: state.demographics.ageYears,
      },
      currentPhase: state.workflow.currentStep,
      questionEngine: { answers: {} },
      hpiNarrative: '',
      aiNarrative: '',
      chiefComplaints: state.chiefComplaint ? [{ complaint: state.chiefComplaint.text, duration: state.chiefComplaint.duration }] : [],
      timeline: [],
      problemList: [],
      differentials: [],
      redFlags: [],
      missingInfo: [],
      objectives: [],
      completedPhases: [],
    });
    console.log('[EncounterContext] Saved to localStorage:', encounterId);
  }, [state]);

  const loadFromFirestore = useCallback(async (id: string) => {
    const orgId = state.demographics.organizationId || 'telemed-a98cf';
    const result = localLoad(orgId, id);
    if (result?.state?.biodata) {
      dispatch({ type: 'SET_DEMOGRAPHICS', payload: { name: result.state.biodata.patientName, ageYears: result.state.biodata.age, ageMonths: 0, sex: result.state.biodata.sex, mrn: result.state.biodata.hospitalNumber } });
      console.log('[EncounterContext] Loaded from localStorage:', id);
    }
  }, [state.demographics.organizationId]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET_ENCOUNTER' });
  }, []);

  // ── Context value ───────────────────────────────────────────────────

  const value = useMemo<EncounterContextValue>(() => ({
    state,
    dispatch,
    setPatientInfo,
    setChiefComplaint,
    activateSymptom,
    advanceStep,
    answerQuestion,
    markAbsent,
    computeDDX,
    completeness,
    canAdvance: completeness.canAdvance,
    saveToFirestore,
    loadFromFirestore,
    reset,
  }), [state, completeness, setPatientInfo, setChiefComplaint, activateSymptom, advanceStep, answerQuestion, markAbsent, computeDDX, saveToFirestore, loadFromFirestore, reset]);

  return (
    <EncounterCtx.Provider value={value}>
      {children}
    </EncounterCtx.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useEncounter(): EncounterContextValue {
  const ctx = useContext(EncounterCtx);
  if (!ctx) throw new Error('useEncounter must be used within EncounterProvider');
  return ctx;
}
