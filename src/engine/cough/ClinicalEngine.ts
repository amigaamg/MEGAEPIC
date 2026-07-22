// ═══════════════════════════════════════════════════════════════════════════════
// DEPRECATED — replaced by lib/amexan/encounter/
// ═══════════════════════════════════════════════════════════════════════════════
// This file is a compatibility shim that delegates to the new EncounterState
// architecture. Import from lib/amexan/encounter for new code.
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import {
  createEncounterState,
  encounterReducer,
  getNextQuestion,
  SYMPTOM_SCHEMAS,
  buildHPINarrative,
  evaluateRedFlags,
} from '@/lib/amexan/encounter';
import type { EncounterState, SymptomId } from '@/lib/amexan/encounter';
import { runInference, type ConsultantDiagnosis } from '../inference/scorer';

export interface ClinicalQuestion {
  id: string;
  text: string;
  type: 'boolean' | 'select' | 'multiselect' | 'number';
  options?: { label: string; value: string }[];
  symptomId: string;
  tier: 0 | 1 | 2 | 3;
  ageMinMonths?: number;
  ageMaxMonths?: number;
  gender?: 'M' | 'F';
  dependsOn?: { questionId: string; value: any }[];
  section?: string;
}

export const QUESTION_REGISTRY: ClinicalQuestion[] = [];

type Listener = () => void;

export class ClinicalEngine {
  private state: EncounterState;
  private listeners: Set<Listener> = new Set();
  private _askedCount = 0;

  constructor(opts: {
    patientName?: string;
    ageMonths?: number;
    gender?: string;
    chiefComplaint?: string;
    initialAnswers?: Record<string, any>;
  }) {
    this.state = createEncounterState({
      demographics: {
        patientId: '',
        encounterId: '',
        name: opts.patientName || '',
        ageMonths: opts.ageMonths || 0,
        ageYears: Math.floor((opts.ageMonths || 0) / 12),
        sex: (opts.gender as any) || 'other',
        mrn: '',
        residence: '',
        informant: '',
        informantRelation: '',
        historyReliability: 'unknown',
        geographicRegion: '',
        organizationId: '',
        departmentSlug: '',
        unitSlug: '',
      },
      chiefComplaint: {
        text: opts.chiefComplaint || '',
        duration: '',
        severity: 0,
        priority: 'medium',
        activeHighways: [],
      },
    });

    if (opts.initialAnswers) {
      for (const [key, value] of Object.entries(opts.initialAnswers)) {
        this.state = encounterReducer(this.state, {
          type: 'UPDATE_SYMPTOM',
          payload: { id: key as SymptomId, present: true } as any,
        });
      }
    }
  }

  getAgeMonths(): number { return this.state.demographics.ageMonths; }
  getGender(): string { return this.state.demographics.sex; }
  get askedCount(): number { return this._askedCount; }

  getNextQuestion(): ClinicalQuestion | null {
    const next = getNextQuestion(this.state);
    if (!next) return null;
    return {
      id: `${next.symptomId}.${next.field.id}`,
      text: next.field.label,
      type: next.field.type === 'multi_select' ? 'multiselect' : next.field.type as any,
      options: next.field.options?.map(o => ({ label: o.replace(/_/g, ' '), value: o })),
      symptomId: next.symptomId,
      tier: next.priority === 'danger' ? 0 : next.priority === 'mandatory' ? 1 : 2,
    };
  }

  answer(questionId: string, value: any) {
    const [symptomId, fieldId] = questionId.split('.') as [SymptomId, string];
    const current = this.state.symptoms[symptomId];
    if (current) {
      this.state = encounterReducer(this.state, {
        type: 'UPDATE_SYMPTOM',
        payload: { ...current, [fieldId]: value } as any,
      });
    } else {
      this.state = encounterReducer(this.state, {
        type: 'ACTIVATE_SYMPTOM',
        payload: { id: symptomId, present: true, [fieldId]: value } as any,
      });
    }
    this._askedCount++;
    this.notify();
  }

  getDDX(): ConsultantDiagnosis[] {
    try {
      const form = {
        complaints: this.state.chiefComplaint.text ? [this.state.chiefComplaint.text] : [],
        hpi: this.mapSymptomsToFlatHPI(),
        age_months: this.state.demographics.ageMonths,
        name: this.state.demographics.name,
        sex: this.state.demographics.sex,
      };
      return runInference(form as any);
    } catch { return []; }
  }

  private mapSymptomsToFlatHPI(): Record<string, any> {
    const hpi: Record<string, any> = {};
    for (const [id, symptom] of Object.entries(this.state.symptoms)) {
      if (symptom && (symptom as any).present) {
        hpi[id] = { ...(symptom as any) };
        delete hpi[id].id;
        delete hpi[id].present;
      }
    }
    return hpi;
  }

  getProgress(): { answered: number; total: number; percent: number } {
    const symptomIds = Object.keys(this.state.symptoms) as SymptomId[];
    let total = 0;
    let answered = 0;
    for (const sid of symptomIds) {
      const schema = SYMPTOM_SCHEMAS[sid];
      if (schema) {
        const symptom = this.state.symptoms[sid];
        if (symptom?.present) {
          total += schema.fields.filter(f => f.mandatory).length;
          for (const field of schema.fields) {
            if (field.mandatory && (symptom as any)[field.id] !== undefined) {
              answered++;
            }
          }
        }
      }
    }
    return {
      answered,
      total: Math.max(total, 1),
      percent: Math.round((answered / Math.max(total, 1)) * 100),
    };
  }

  isComplete(): boolean {
    return getNextQuestion(this.state) === null;
  }

  generateNarrative(): string {
    return buildHPINarrative(this.state);
  }

  getAllAnswers(): Record<string, any> {
    const answers: Record<string, any> = {};
    for (const [sid, symptom] of Object.entries(this.state.symptoms)) {
      if (symptom && (symptom as any).present) {
        answers[sid] = { ...symptom as any };
        delete answers[sid].id;
        delete answers[sid].present;
      }
    }
    return answers;
  }

  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of Array.from(this.listeners)) listener();
  }
}
