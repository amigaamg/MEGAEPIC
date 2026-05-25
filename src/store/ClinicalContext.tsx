'use client';
import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import { DiseaseId, DiseaseScore } from '@/src/types';
import { ClinicalContext as ClinicalContextType, VitalsData, ExamFindings, SeverityScore, ClinicalNarrative, DdxExplanation } from '@/src/types/clinical';
import { ClinicalQuestionEngine, ClinicalInterviewPhase } from '@/src/engine/respiratory/questionEngine';
import { DdxEngine } from '@/src/engine/respiratory/ddxEngine';
import { NarrativeEngine } from '@/src/engine/respiratory/narrativeEngine';
import { SeverityEngine } from '@/src/engine/respiratory/severityEngine';
import { KenyaGuidelinesEngine } from '@/src/engine/respiratory/guidelines';

interface ClinicalState {
  patientName: string;
  ageMonths: number;
  sex: 'male' | 'female' | 'unknown';
  symptoms: string[];
  answers: Record<string, string | string[] | boolean | number>;
  askedQuestions: string[];
  vitals: VitalsData;
  exam: ExamFindings;
  riskFactors: string[];
  interviewPhase: ClinicalInterviewPhase;
  durationDays: number;
  diseaseScores: DiseaseScore[];
  explanations: DdxExplanation[];
  severity: SeverityScore | null;
  narrative: ClinicalNarrative | null;
  isLoading: boolean;
  error: string | null;
  history: Array<{
    questionId: string;
    questionText: string;
    answer: string | string[] | boolean | number;
    scores: DiseaseScore[];
    timestamp: number;
  }>;
  conversationMessages: Array<{
    role: 'system' | 'assistant' | 'user';
    content: string;
    questionId?: string;
    timestamp: number;
  }>;
}

type ClinicalAction =
  | { type: 'SET_PATIENT_INFO'; payload: { name: string; ageMonths: number; sex: 'male' | 'female' | 'unknown'; symptoms: string[]; durationDays: number } }
  | { type: 'ANSWER_QUESTION'; payload: { questionId: string; questionText: string; answer: string | string[] | boolean | number } }
  | { type: 'SET_VITALS'; payload: Partial<VitalsData> }
  | { type: 'SET_EXAM'; payload: Partial<ExamFindings> }
  | { type: 'SET_RISK_FACTORS'; payload: string[] }
  | { type: 'SET_PHASE'; payload: ClinicalInterviewPhase }
  | { type: 'SET_DISEASE_SCORES'; payload: { scores: DiseaseScore[]; explanations: DdxExplanation[] } }
  | { type: 'SET_SEVERITY'; payload: SeverityScore }
  | { type: 'SET_NARRATIVE'; payload: ClinicalNarrative }
  | { type: 'ADD_MESSAGE'; payload: { role: 'system' | 'assistant' | 'user'; content: string; questionId?: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const defaultExam: ExamFindings = {
  chestIndrawing: false, nasalFlaring: false, grunting: false, headNodding: false,
  wheeze: false, crackles: false, stridor: false, cyanosis: false,
  lymphadenopathy: false, abdominalDistension: false, hepatomegaly: false,
  splenomegaly: false, pallor: false, oedema: false, rash: false, meningism: false,
};

const initialState: ClinicalState = {
  patientName: '', ageMonths: 24, sex: 'unknown', symptoms: [], answers: {},
  askedQuestions: [], vitals: {}, exam: { ...defaultExam }, riskFactors: [],
  interviewPhase: 'triage', durationDays: 3,
  diseaseScores: [], explanations: [], severity: null, narrative: null,
  isLoading: false, error: null, history: [], conversationMessages: [],
};

function clinicalReducer(state: ClinicalState, action: ClinicalAction): ClinicalState {
  switch (action.type) {
    case 'SET_PATIENT_INFO':
      return { ...state, ...action.payload, interviewPhase: 'triage', history: [], conversationMessages: [], diseaseScores: [], explanations: [], severity: null, narrative: null };
    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: { ...state.answers, [action.payload.questionId]: action.payload.answer },
        askedQuestions: [...state.askedQuestions, action.payload.questionId],
      };
    case 'SET_VITALS':
      return { ...state, vitals: { ...state.vitals, ...action.payload } };
    case 'SET_EXAM':
      return { ...state, exam: { ...state.exam, ...action.payload } };
    case 'SET_RISK_FACTORS':
      return { ...state, riskFactors: action.payload };
    case 'SET_PHASE':
      return { ...state, interviewPhase: action.payload };
    case 'SET_DISEASE_SCORES':
      return { ...state, diseaseScores: action.payload.scores, explanations: action.payload.explanations };
    case 'SET_SEVERITY':
      return { ...state, severity: action.payload };
    case 'SET_NARRATIVE':
      return { ...state, narrative: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, conversationMessages: [...state.conversationMessages, { ...action.payload, timestamp: Date.now() }] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

interface ClinicalContextValue {
  state: ClinicalState;
  dispatch: React.Dispatch<ClinicalAction>;
  engines: {
    question: ClinicalQuestionEngine;
    ddx: DdxEngine;
    narrative: NarrativeEngine;
    severity: SeverityEngine;
    guidelines: KenyaGuidelinesEngine;
  };
  processAnswer: (questionId: string, questionText: string, answer: string | string[] | boolean | number) => void;
  setPatientInfo: (name: string, ageMonths: number, sex: 'male' | 'female' | 'unknown', symptoms: string[], durationDays: number) => void;
  setVitals: (v: Partial<VitalsData>) => void;
  setExam: (e: Partial<ExamFindings>) => void;
  advancePhase: (phase: ClinicalInterviewPhase) => void;
  resetConsultation: () => void;
}

const ClinicalCtx = createContext<ClinicalContextValue | null>(null);

const STORAGE_KEY = 'amexan_clinical_state';

export function ClinicalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(clinicalReducer, initialState, () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...JSON.parse(saved), isLoading: false, error: null };
      } catch { /* ignore */ }
    }
    return initialState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);

  const engines = useMemo(() => ({
    question: new ClinicalQuestionEngine(),
    ddx: new DdxEngine(),
    narrative: new NarrativeEngine(),
    severity: new SeverityEngine(),
    guidelines: new KenyaGuidelinesEngine(),
  }), []);

  const processAnswer = useCallback((
    questionId: string,
    questionText: string,
    answer: string | string[] | boolean | number
  ) => {
    dispatch({ type: 'ANSWER_QUESTION', payload: { questionId, questionText, answer } });
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', content: String(answer), questionId } });

    const updatedAnswers = { ...state.answers, [questionId]: answer };

    const scores = engines.ddx.calculate(updatedAnswers, state.symptoms);
    const explanations = engines.ddx.generateExplanations(scores);
    dispatch({ type: 'SET_DISEASE_SCORES', payload: { scores, explanations } });

    const ctx: ClinicalContextType = {
      patientName: state.patientName, ageMonths: state.ageMonths, sex: state.sex,
      symptoms: state.symptoms as any[], answers: updatedAnswers, askedQuestions: [...state.askedQuestions, questionId],
      vitals: state.vitals, exam: state.exam, riskFactors: state.riskFactors,
      interviewPhase: state.interviewPhase, durationDays: state.durationDays,
    };
    const severityResult = engines.severity.assess(ctx);
    dispatch({ type: 'SET_SEVERITY', payload: severityResult });

    if (scores.length > 0 && scores[0].score > 0) {
      const narrative = engines.narrative.generateNote(ctx, scores, explanations, severityResult);
      dispatch({ type: 'SET_NARRATIVE', payload: narrative });
    }
  }, [state, engines]);

  const setPatientInfo = useCallback((
    name: string, ageMonths: number, sex: 'male' | 'female' | 'unknown',
    symptoms: string[], durationDays: number
  ) => {
    dispatch({ type: 'SET_PATIENT_INFO', payload: { name, ageMonths, sex, symptoms, durationDays } });
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'system', content: `New consultation: ${name}, ${ageMonths}mo, ${sex}. Symptoms: ${symptoms.join(', ')}` } });
  }, []);

  const setVitals = useCallback((v: Partial<VitalsData>) => {
    dispatch({ type: 'SET_VITALS', payload: v });
  }, []);

  const setExam = useCallback((e: Partial<ExamFindings>) => {
    dispatch({ type: 'SET_EXAM', payload: e });
  }, []);

  const advancePhase = useCallback((phase: ClinicalInterviewPhase) => {
    dispatch({ type: 'SET_PHASE', payload: phase });
  }, []);

  const resetConsultation = useCallback(() => {
    dispatch({ type: 'RESET' });
    engines.question.reset();
    localStorage.removeItem(STORAGE_KEY);
  }, [engines]);

  const value = useMemo(() => ({
    state, dispatch, engines,
    processAnswer, setPatientInfo, setVitals, setExam,
    advancePhase, resetConsultation,
  }), [state, engines, processAnswer, setPatientInfo, setVitals, setExam, advancePhase, resetConsultation]);

  return (
    <ClinicalCtx.Provider value={value}>
      {children}
    </ClinicalCtx.Provider>
  );
}

export function useClinical(): ClinicalContextValue {
  const ctx = useContext(ClinicalCtx);
  if (!ctx) throw new Error('useClinical must be used within ClinicalProvider');
  return ctx;
}
