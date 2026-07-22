// ═══════════════════════════════════════════════════════════════════════════════
// DEPRECATED — replaced by lib/amexan/encounter/engines/documentationEngine.ts
// ═══════════════════════════════════════════════════════════════════════════════
// Compatibility shim: converts old PatientForm → new EncounterState → narrative
// ═══════════════════════════════════════════════════════════════════════════════

import { buildHPINarrative, createEncounterState, SYMPTOM_SCHEMAS } from '@/lib/amexan/encounter';
import type { EncounterState, SymptomId } from '@/lib/amexan/encounter';
import type { PatientForm } from '../../types';
import type { ConsultantDiagnosis } from './scorer';

function formToState(form: PatientForm): EncounterState {
  const state = createEncounterState({
    demographics: {
      patientId: '',
      encounterId: '',
      name: (form as any).name || (form as any).biodata?.patientName || '',
      ageMonths: parseInt((form as any).age_months || (form as any).biodata?.ageMonths || '0'),
      ageYears: Math.floor(parseInt((form as any).age_months || '0') / 12),
      sex: ((form as any).sex || (form as any).biodata?.sex || 'other') as any,
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
      text: (form.complaints || []).join(', '),
      duration: '',
      severity: 0,
      priority: 'medium',
      activeHighways: [],
    },
  });

  // Map old flat HPI fields to structured symptoms
  const hpi = (form as any).hpi || {};
  for (const [symptomIdStr, symptomData] of Object.entries(hpi)) {
    const sid = symptomIdStr as SymptomId;
    const schema = SYMPTOM_SCHEMAS[sid];
    if (schema) {
      (state.symptoms as any)[sid] = {
        id: sid,
        present: true,
        ...(symptomData as any),
      };
    }
  }

  (state as any).updatedAt = Date.now();
  return state;
}

export function buildHPI(form: PatientForm, differentials?: ConsultantDiagnosis[]): string {
  try {
    const state = formToState(form);
    return buildHPINarrative(state);
  } catch {
    return 'Unable to generate HPI narrative.';
  }
}

export function buildClinicalNote(form: PatientForm, differentials: ConsultantDiagnosis[]): string {
  try {
    const state = formToState(form);
    const hpi = buildHPINarrative(state);

    const name = state.demographics.name || 'Unknown';
    const ageStr = state.demographics.ageMonths < 12
      ? `${state.demographics.ageMonths}-month-old`
      : `${Math.floor(state.demographics.ageMonths / 12)}-year-old`;

    const lines: string[] = [];
    lines.push('━'.repeat(60));
    lines.push('AMEXAN CLINICAL NOTE');
    lines.push(`${name}, ${ageStr}, ${state.demographics.sex}`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push('━'.repeat(60));
    lines.push('');
    lines.push('HISTORY OF PRESENTING COMPLAINT');
    lines.push(hpi);
    lines.push('');
    if (differentials && differentials.length > 0) {
      lines.push('DIFFERENTIAL DIAGNOSES');
      differentials.slice(0, 5).forEach(d => {
        lines.push(`  - ${d.diseaseName}: ${((d.probability || 0) * 100).toFixed(0)}%`);
      });
    }
    return lines.join('\n');
  } catch {
    return 'Unable to generate clinical note.';
  }
}
