import { create } from 'zustand';
import { PatientForm, INIT_FORM } from '@/src/types';
import type { DocumentEvent, AIInsight, EncounterType } from '@/lib/encounterTypes';

let evtSeq = 0, insSeq = 0;

export interface EncounterState {
  form: PatientForm;
  encounterType: EncounterType | null;
  departmentKey: string;
  unitId: string;
  patientName: string;
  activePhase: string;
  completedPhases: string[];
  events: DocumentEvent[];
  insights: AIInsight[];

  setForm: (f: PatientForm) => void;
  setField: (path: string, value: unknown) => void;
  toggleArray: (path: string, item: string) => void;
  setEncounterType: (t: EncounterType) => void;
  setDepartment: (k: string) => void;
  setUnit: (id: string) => void;
  setPatientName: (n: string) => void;
  setActivePhase: (id: string) => void;
  completePhase: (id: string) => void;
  addEvent: (e: Partial<DocumentEvent>) => void;
  addInsight: (i: Partial<AIInsight>) => void;
  setInsights: (insights: AIInsight[]) => void;
  acknowledgeInsight: (id: string) => void;
  reset: () => void;
}

export const useEncounterState = create<EncounterState>((set, get) => ({
  form: INIT_FORM,
  encounterType: null,
  departmentKey: '',
  unitId: '',
  patientName: 'Unnamed Patient',
  activePhase: 'triage',
  completedPhases: [],
  events: [],
  insights: [],

  setForm: (form) => set({ form }),

  setField: (path, value) => set((s) => {
    const copy = JSON.parse(JSON.stringify(s.form)) as PatientForm;
    const keys = path.split('.');
    let obj: any = copy;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    return { form: copy };
  }),

  toggleArray: (path, item) => set((s) => {
    const copy = JSON.parse(JSON.stringify(s.form)) as PatientForm;
    const keys = path.split('.');
    let obj: any = copy;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    const arr: string[] = obj[keys[keys.length - 1]] || [];
    obj[keys[keys.length - 1]] = arr.includes(item) ? arr.filter((x: string) => x !== item) : [...arr, item];
    return { form: copy };
  }),

  setEncounterType: (t) => set({ encounterType: t }),
  setDepartment: (k) => set({ departmentKey: k }),
  setUnit: (id) => set({ unitId: id }),
  setPatientName: (n) => set({ patientName: n }),

  setActivePhase: (id) => set({ activePhase: id }),

  completePhase: (id) => set((s) => {
    if (s.completedPhases.includes(id)) return s;
    return { completedPhases: [...s.completedPhases, id] };
  }),

  addEvent: (partial) => set((s) => ({
    events: [...s.events, {
      id: `evt-${++evtSeq}`, timestamp: Date.now(), actorName: 'Dr. Grace Mwangi',
      actorRole: 'doctor', severity: 'info', ...partial,
    } as DocumentEvent],
  })),

  addInsight: (partial) => set((s) => ({
    insights: [...s.insights, {
      id: `ins-${++insSeq}`, timestamp: Date.now(), acknowledged: false, source: 'AMEXAN Engine',
      ...partial,
    } as AIInsight],
  })),

  setInsights: (insights) => set({ insights }),

  acknowledgeInsight: (id) => set((s) => ({
    insights: s.insights.map(i => i.id === id ? { ...i, acknowledged: true } : i),
  })),

  reset: () => set({
    form: INIT_FORM, activePhase: 'triage', completedPhases: [], events: [], insights: [],
  }),
}));
