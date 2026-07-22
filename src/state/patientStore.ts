// ═══════════════════════════════════════════════════════════════════════════════
// DEPRECATED — replaced by lib/amexan/encounter/EncounterContext.tsx
// ═══════════════════════════════════════════════════════════════════════════════
// This file is kept as a compatibility shim during migration.
// It now delegates all data to EncounterState via useEncounter().
// Import useEncounter() directly for new code.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEncounter } from '@/lib/amexan/encounter';
import { PatientForm, INIT_FORM } from '@/src/types';

// ── Adapter: converts old PatientForm shape to new EncounterState shape ─────

export function usePatientStore() {
  const ctx = useEncounter();
  const { state, dispatch } = ctx;

  // Map old flat form shape to new structured state
  const form: PatientForm = {
    ...INIT_FORM,
    complaints: state.chiefComplaint.text ? [state.chiefComplaint.text] : [],
    hpi: { ...INIT_FORM.hpi, ...mapSymptomsToFlatHPI(state) },
    pmh: { ...INIT_FORM.pmh, chronicIllnesses: state.history.pmh.conditions },
    vitals: { ...INIT_FORM.vitals, ...state.examination.vitals } as any,
  };

  const setField = (path: string, value: any) => {
    // Map old path-based updates to new typed actions
    const [section, ...rest] = path.split('.');
    const field = rest.join('.');
    switch (section) {
      case 'name': dispatch({ type: 'SET_DEMOGRAPHICS', payload: { name: value } }); break;
      case 'age_months': dispatch({ type: 'SET_DEMOGRAPHICS', payload: { ageMonths: value, ageYears: Math.floor(value / 12) } }); break;
      case 'sex': dispatch({ type: 'SET_DEMOGRAPHICS', payload: { sex: value } }); break;
      case 'complaints': dispatch({ type: 'SET_CHIEF_COMPLAINT', payload: { text: Array.isArray(value) ? value[0] || '' : value } }); break;
      default: break;
    }
  };

  const toggleArrayItem = (path: string, item: string) => {
    // No-op during migration — old toggle logic is replaced by structured symptom objects
  };

  const setForm = (f: any) => {
    if (f.name) dispatch({ type: 'SET_DEMOGRAPHICS', payload: { name: f.name } });
    if (f.age_months !== undefined) dispatch({ type: 'SET_DEMOGRAPHICS', payload: { ageMonths: f.age_months, ageYears: Math.floor(f.age_months / 12) } });
    if (f.sex) dispatch({ type: 'SET_DEMOGRAPHICS', payload: { sex: f.sex } });
  };

  const reset = () => dispatch({ type: 'RESET_ENCOUNTER' });

  return { form, setField, toggleArrayItem, setForm, updateForm: setForm, reset };
}

// ── Helper: flatten structured symptoms to old HPI shape ────────────────────

function mapSymptomsToFlatHPI(state: any): Record<string, any> {
  const hpi: Record<string, any> = {};
  for (const [id, symptom] of Object.entries(state.symptoms)) {
    if (symptom && (symptom as any).present) {
      hpi[id] = { ...(symptom as any) };
      delete hpi[id].id;
      delete hpi[id].present;
    }
  }
  return hpi;
}
