'use client';
import { useMemo } from 'react';
import {
  COUGH_KNOWLEDGE,
  type CoughContextCondition,
  type CoughQuestion as CKQuestion,
  type CoughUrgency,
} from '@/lib/clinical/symptom-knowledge/cough/cough-knowledge';
import {
  resolveCoughContext,
  resolveAdaptedQuestionText,
  generateCoughHPINarrative,
  type CoughScoredDisease,
  type CoughHPIOutput,
} from '@/lib/clinical/symptom-knowledge/cough/cough-engine';

export interface CoughCardItem {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'chips' | 'boolean' | 'text';
  chips?: string[];
  options?: { value: string; label: string }[];
  groupLabel?: string;
}

export interface CoughBridgeResult {
  isCoughActive: boolean;
  cards: CoughCardItem[];
  hpiNarrative: string;
  clinicalNote: string;
  patientSummary: string;
  differentials: CoughScoredDisease[];
  patientDesc: string;
}

function extractCoughAnswers(answers: Record<string, unknown>): Record<string, unknown> {
  const coughPrefixes = [
    'cough_', 'q_cough_',
  ];
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(answers)) {
    if (coughPrefixes.some(p => key.startsWith(p))) {
      result[key] = value;
    }
  }
  return result;
}

function buildPatientContext(
  age: number,
  sex: string,
  ageGroup: string,
  pregnant: boolean,
): CoughContextCondition {
  const ctx: CoughContextCondition = {
    ageGroup: (ageGroup as any) || (age < 1 ? 'infant' : age < 5 ? 'child' : age < 13 ? 'child' : age < 18 ? 'adolescent' : age < 65 ? 'adult' : 'older_adult'),
    sex: sex === 'male' ? 'male' : 'female',
  };
  if (pregnant) ctx.pregnant = true;
  return ctx;
}

function ckQuestionToCard(
  q: CKQuestion,
  adapted: { text: string; options: { value: string; label: string; documentationPhrase: string }[] | undefined },
): CoughCardItem {
  const cardType = q.inputType === 'boolean' ? 'boolean'
    : (q.inputType as string) === 'single_choice' ? 'chips'
    : (q.inputType as string) === 'multi_choice' ? 'chips'
    : 'text';

  return {
    id: q.id,
    question: adapted.text,
    type: cardType,
    chips: adapted.options?.map(o => o.label),
    options: adapted.options?.map(o => ({ value: o.value, label: o.label })),
  };
}

function getCoughQuestionsAdapted(ageGroup: string): CoughCardItem[] {
  const questions = COUGH_KNOWLEDGE.questions;
  return questions.map(q => {
    const adapted = resolveAdaptedQuestionText(q, ageGroup);
    return ckQuestionToCard(q, adapted);
  });
}

export function useCoughEngine(
  age: number,
  sex: string,
  ageGroup: string,
  pregnant: boolean,
  chiefComplaints: string[],
  answers: Record<string, unknown>,
): CoughBridgeResult {
  return useMemo(() => {
    const isCoughActive = chiefComplaints.some(c =>
      c.toLowerCase().includes('cough') || c.toLowerCase().includes('kikohozi'),
    );
    if (!isCoughActive) {
      return {
        isCoughActive: false,
        cards: [],
        hpiNarrative: '',
        clinicalNote: '',
        patientSummary: '',
        differentials: [],
        patientDesc: '',
      };
    }

    const patientContext = buildPatientContext(age, sex, ageGroup, pregnant);
    const { behaviour } = resolveCoughContext(patientContext);
    const coughAnswers = extractCoughAnswers(answers);

    const facts: { attribute: string; value: unknown; isActive: boolean; isStale: boolean }[] = [];
    for (const [attr, value] of Object.entries(coughAnswers)) {
      facts.push({ attribute: attr.replace(/^q_/, ''), value, isActive: true, isStale: false });
    }
    for (const cc of chiefComplaints) {
      facts.push({ attribute: 'chief_complaint', value: cc, isActive: true, isStale: false });
    }

    const patientDesc = [
      ageGroup === 'neonate' ? 'newborn' : ageGroup === 'infant' ? 'infant' : ageGroup === 'child' ? 'child' : ageGroup === 'adolescent' ? 'adolescent' : ageGroup === 'older_adult' ? 'elderly' : 'adult',
      sex === 'male' ? 'male' : 'female',
      pregnant ? 'pregnant' : '',
    ].filter(Boolean).join(' ');

    const cards = getCoughQuestionsAdapted(ageGroup);

    const activePhenotypes: { id: string; label: string; score: number; urgency: CoughUrgency }[] = [];
    const activeMechanisms: { id: string; label: string; score: number }[] = [];
    const topEtiologies: { id: string; name: string; score: number; mechanism: string }[] = [];
    const differentials: CoughScoredDisease[] = [];

    const narrativeResult: CoughHPIOutput = generateCoughHPINarrative(
      facts as any,
      patientContext,
      behaviour,
      activeMechanisms,
      activePhenotypes,
      topEtiologies,
      differentials,
    );

    return {
      isCoughActive: true,
      patientDesc,
      cards,
      hpiNarrative: narrativeResult.hpiNarrative || `${patientDesc} presents with a cough. Further details being captured.`,
      clinicalNote: narrativeResult.clinicalNote,
      patientSummary: narrativeResult.patientSummary,
      differentials,
    };
  }, [age, sex, ageGroup, pregnant, chiefComplaints.join(','), JSON.stringify(answers)]);
}
