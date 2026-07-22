import type {
  SystemId, SystemExamState, SystemExamFieldDef, NextSystemExamStep,
  SystemContext, SystemActivationRule, SystemExaminations, ExamPhase,
  SystemFieldValue, SystemMeasurement,
} from '../examination/systemExaminationTypes';
import { EXAM_PHASE_ORDER, SYSTEM_PHASE_MAP, SYSTEM_LABELS } from '../examination/systemExaminationTypes';
import { RESPIRATORY_FIELDS } from '../examination/systems/respiratorySchema';
import { CARDIOVASCULAR_FIELDS } from '../examination/systems/cardiovascularSchema';
import { GASTROINTESTINAL_FIELDS } from '../examination/systems/gastrointestinalSchema';
import { NEUROLOGICAL_FIELDS } from '../examination/systems/neurologicalSchema';
import { MUSCULOSKELETAL_FIELDS } from '../examination/systems/musculoskeletalSchema';
import {
  RENAL_FIELDS,
  ENDOCRINE_FIELDS,
  BREAST_FIELDS,
  ENT_FIELDS,
  EYE_FIELDS,
  SKIN_FIELDS,
  OBSTETRIC_FIELDS,
  NEONATAL_FIELDS,
} from '../examination/systems/otherSystemsSchema';

// ── Field registry ────────────────────────────────────────────────────────────

export const SYSTEM_FIELD_REGISTRY: Record<SystemId, readonly SystemExamFieldDef[]> = {
  respiratory: RESPIRATORY_FIELDS,
  cardiovascular: CARDIOVASCULAR_FIELDS,
  gastrointestinal: GASTROINTESTINAL_FIELDS,
  neurological: NEUROLOGICAL_FIELDS,
  musculoskeletal: MUSCULOSKELETAL_FIELDS,
  renal: RENAL_FIELDS,
  endocrine: ENDOCRINE_FIELDS,
  breast: BREAST_FIELDS,
  ent: ENT_FIELDS,
  eye: EYE_FIELDS,
  skin: SKIN_FIELDS,
  obstetric: OBSTETRIC_FIELDS,
  neonatal: NEONATAL_FIELDS,
};

// ── Activation rules ─────────────────────────────────────────────────────────

export const SYSTEM_ACTIVATION_RULES: SystemActivationRule[] = [
  {
    systemId: 'respiratory',
    priority: 10,
    condition: (ctx) =>
      ctx.activeSymptoms.some(s => /cough|dyspnoea|wheeze|haemoptysis|sputum|sob|breathless|chest_pain/i.test(s)) ||
      ctx.constitutionalSigns.includes('tachypnoea') ||
      ctx.constitutionalSigns.includes('hypoxia'),
    reason: 'Respiratory symptoms, tachypnoea, or hypoxia',
  },
  {
    systemId: 'cardiovascular',
    priority: 10,
    condition: (ctx) =>
      ctx.activeSymptoms.some(s => /chest_pain|palpitations|syncope|oedema|dyspnoea|orthopnoea|pnd|cyanosis/i.test(s)) ||
      ctx.constitutionalSigns.includes('tachycardia') ||
      ctx.constitutionalSigns.includes('hypertension') ||
      ctx.constitutionalSigns.includes('hypotension'),
    reason: 'Cardiovascular symptoms, tachycardia, or BP abnormality',
  },
  {
    systemId: 'gastrointestinal',
    priority: 10,
    condition: (ctx) =>
      ctx.activeSymptoms.some(s => /abdominal_pain|nausea|vomiting|diarrhoea|constipation|dysphagia|haematemesis|melena|distension|heartburn|jaundice/i.test(s)) ||
      ctx.constitutionalSigns.includes('abdominal_tenderness') ||
      ctx.constitutionalSigns.includes('hepatomegaly'),
    reason: 'GI symptoms, abdominal tenderness, or hepatomegaly',
  },
  {
    systemId: 'neurological',
    priority: 9,
    condition: (ctx) =>
      ctx.activeSymptoms.some(s => /headache|dizziness|seizure|stroke|numbness|weakness|tremor|gait|speech|vision|memory|confusion|loss_of_consciousness/i.test(s)) ||
      ctx.constitutionalSigns.includes('altered_consciousness') ||
      ctx.constitutionalSigns.includes('pupil_abnormality'),
    reason: 'Neurological symptoms or altered consciousness',
  },
  {
    systemId: 'musculoskeletal',
    priority: 9,
    condition: (ctx) =>
      ctx.activeSymptoms.some(s => /joint_pain|back_pain|swelling|myalgia|fracture|trauma|fall|stiffness|gait|mobility/i.test(s)) ||
      ctx.specialty === 'orthopaedics' ||
      ctx.specialty === 'rheumatology',
    reason: 'Musculoskeletal symptoms or orthopaedic/rheumatology specialty',
  },
  {
    systemId: 'renal',
    priority: 8,
    condition: (ctx) =>
      ctx.activeSymptoms.some(s => /urinary|dysuria|oliguria|polyuria|nocturia|loin_pain|flank_pain|haematuria|oedema/i.test(s)) ||
      ctx.constitutionalSigns.includes('oedema') ||
      ctx.specialty === 'nephrology',
    reason: 'Renal/urinary symptoms, oedema, or nephrology specialty',
  },
  {
    systemId: 'endocrine',
    priority: 8,
    condition: (ctx) =>
      ctx.activeSymptoms.some(s => /weight_loss|weight_gain|fatigue|tremor|heat_intolerance|cold_intolerance|polydipsia|polyuria|goitre|hirsutism/i.test(s)) ||
      ctx.specialty === 'endocrinology',
    reason: 'Endocrine symptoms or endocrinology specialty',
  },
  {
    systemId: 'breast',
    priority: 8,
    condition: (ctx) =>
      ctx.sex === 'female' && ctx.activeSymptoms.some(s => /breast_lump|breast_pain|nipple_discharge|skin_change|axillary_mass/i.test(s)) ||
      ctx.specialty === 'breast_surgery',
    reason: 'Breast symptoms or breast surgery specialty',
  },
  {
    systemId: 'ent',
    priority: 7,
    condition: (ctx) =>
      ctx.activeSymptoms.some(s => /ear_pain|hearing|tinnitus|vertigo|sore_throat|hoarseness|dysphagia|nasal|sinus|epistaxis|tonsil|neck_mass/i.test(s)) ||
      ctx.specialty === 'ent',
    reason: 'ENT symptoms or ENT specialty',
  },
  {
    systemId: 'eye',
    priority: 7,
    condition: (ctx) =>
      ctx.activeSymptoms.some(s => /vision|blurred|eye_pain|red_eye|floaters|flashes|photophobia|diplopia|field/i.test(s)) ||
      ctx.specialty === 'ophthalmology',
    reason: 'Ocular symptoms or ophthalmology specialty',
  },
  {
    systemId: 'skin',
    priority: 7,
    condition: (ctx) =>
      ctx.activeSymptoms.some(s => /rash|itch|lesion|ulcer|blister|nail|hair_loss|skin|mole|pigment|swelling/i.test(s)) ||
      ctx.specialty === 'dermatology',
    reason: 'Skin/hair/nail symptoms or dermatology specialty',
  },
  {
    systemId: 'obstetric',
    priority: 6,
    condition: (ctx) =>
      ctx.isPregnant &&
      (ctx.specialty === 'obstetrics' || ctx.activeSymptoms.some(s => /contraction|bleeding_pv|leaking_liquor|reduced_movement|abdominal_pain_preg/i.test(s))),
    reason: 'Pregnant patient with obstetric specialty or pregnancy-related symptoms',
  },
  {
    systemId: 'neonatal',
    priority: 6,
    condition: (ctx) => ctx.ageMonths <= 2 || ctx.specialty === 'neonatology' || ctx.specialty === 'paediatrics',
    reason: 'Neonate ≤2 months old or neonatology/paediatrics specialty',
  },
];

// ── Helper: Get fields for a given system and phase ──────────────────────────

export function getSystemFields(systemId: SystemId, phase: ExamPhase): SystemExamFieldDef[] {
  const fields = SYSTEM_FIELD_REGISTRY[systemId];
  if (!fields) return [];
  return fields.filter(f => f.phase === phase);
}

export function getFieldDefinition(systemId: SystemId, fieldId: string): SystemExamFieldDef | undefined {
  return SYSTEM_FIELD_REGISTRY[systemId]?.find(f => f.id === fieldId);
}

// ── Create initial empty state for a system ──────────────────────────────────

export function createInitialSystemState(): SystemExamState {
  return {
    examined: false,
    normal: false,
    phases: {},
    measurements: {},
    narrative: '',
    summary: '',
  };
}

export function createInitialSystemPhaseState(): { completed: boolean; fields: Record<string, SystemFieldValue> } {
  return { completed: false, fields: {} };
}

// ── Determine which systems should be active ─────────────────────────────────

export function getActiveSystems(context: SystemContext): { systemId: SystemId; priority: number; reason: string }[] {
  const activated: { systemId: SystemId; priority: number; reason: string }[] = [];

  for (const rule of SYSTEM_ACTIVATION_RULES) {
    if (rule.condition(context)) {
      activated.push({ systemId: rule.systemId, priority: rule.priority, reason: rule.reason });
    }
  }

  activated.sort((a, b) => b.priority - a.priority);
  return activated;
}

// ── Get next step across all active systems ──────────────────────────────────

export function getNextSystemExamStep(
  state: SystemExaminations,
  context: SystemContext,
): NextSystemExamStep | null {
  const activeSystems = getActiveSystems(context);
  const activeSystemIds = new Set(activeSystems.map(s => s.systemId));

  let best: { step: NextSystemExamStep; priority: number } | null = null;

  for (const { systemId, priority } of activeSystems) {
    const examState = state[systemId];
    const fields = SYSTEM_FIELD_REGISTRY[systemId];
    if (!fields) continue;

    const phases = SYSTEM_PHASE_MAP[systemId];

    for (const phase of phases) {
      const phaseState = examState?.phases[phase];
      const phaseCompleted = phaseState?.completed ?? false;
      if (phaseCompleted) continue;

      const phaseFields = fields.filter(f => f.phase === phase);
      for (const field of phaseFields) {
        const value = phaseState?.fields[field.id];
        // Skip completed fields
        if (value !== undefined && value !== '' && value !== false) continue;

        // Check age/sex restrictions
        if (field.ageMinMonths !== undefined && context.ageMonths < field.ageMinMonths) continue;
        if (field.ageMaxMonths !== undefined && context.ageMonths > field.ageMaxMonths) continue;
        if (field.sexRequired !== undefined && context.sex !== field.sexRequired) continue;
        if (field.isAbnormalOnly) continue; // Only show if system marked abnormal

        const stepPriority = field.mandatory ? priority + 1 : priority;
        const step: NextSystemExamStep = {
          systemId,
          phase,
          fieldId: field.id,
          fieldLabel: field.label,
          priority: field.mandatory ? 'mandatory' : 'routine',
          clinicalGuide: field.clinicalGuide,
          observation: field.observation,
        };

        if (!best || stepPriority > best.priority) {
          best = { step, priority: stepPriority };
        }
      }
    }
  }

  return best?.step ?? null;
}

// ── Update a field value in a system exam state ──────────────────────────────

export function updateSystemExamField(
  state: SystemExaminations,
  systemId: SystemId,
  fieldId: string,
  value: SystemFieldValue,
  measurement?: { value: number; unit: string },
): SystemExaminations {
  const next = { ...state };
  const systemState = { ...(next[systemId] ?? createInitialSystemState()) };
  const fieldDef = getFieldDefinition(systemId, fieldId);
  if (!fieldDef) return state;

  const phaseState = {
    ...(systemState.phases[fieldDef.phase] ?? createInitialSystemPhaseState()),
    fields: { ...(systemState.phases[fieldDef.phase]?.fields ?? {}) },
  };

  phaseState.fields[fieldId] = value;
  systemState.phases = { ...systemState.phases, [fieldDef.phase]: phaseState };
  systemState.examined = true;

  if (value !== undefined && value !== '' && value !== false && value !== 'normal') {
    systemState.normal = false;
  }

  if (measurement) {
    systemState.measurements = {
      ...systemState.measurements,
      [fieldId]: { value: measurement.value, unit: measurement.unit },
    };
  }

  next[systemId] = systemState;
  return next;
}

// ── Mark a phase as completed for a given system ─────────────────────────────

export function completeSystemExamPhase(
  state: SystemExaminations,
  systemId: SystemId,
  phase: ExamPhase,
): SystemExaminations {
  const next = { ...state };
  const systemState = { ...(next[systemId] ?? createInitialSystemState()) };

  systemState.phases = {
    ...systemState.phases,
    [phase]: {
      completed: true,
      fields: systemState.phases[phase]?.fields ?? {},
    },
  };

  next[systemId] = systemState;
  return next;
}

// ── Get completeness for a specific system ───────────────────────────────────

export function getSystemCompleteness(
  state: SystemExaminations,
  systemId: SystemId,
  context: SystemContext,
): { total: number; completed: number; percentage: number } {
  const fields = SYSTEM_FIELD_REGISTRY[systemId];
  if (!fields) return { total: 0, completed: 0, percentage: 0 };

  const examState = state[systemId];
  const applicable = fields.filter(f => {
    if (f.ageMinMonths !== undefined && context.ageMonths < f.ageMinMonths) return false;
    if (f.ageMaxMonths !== undefined && context.ageMonths > f.ageMaxMonths) return false;
    if (f.sexRequired !== undefined && context.sex !== f.sexRequired) return false;
    return true;
  });

  let completed = 0;
  for (const field of applicable) {
    const value = examState?.phases[field.phase]?.fields[field.id];
    if (value !== undefined && value !== '' && value !== false) {
      completed++;
    }
  }

  const total = applicable.length;
  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 100,
  };
}

// ── Get short clinical summary of a system examination ───────────────────────

export function getSystemExamSummary(
  state: SystemExaminations,
  systemId: SystemId,
): string {
  const examState = state[systemId];
  if (!examState?.examined) return `${SYSTEM_LABELS[systemId]}: Not examined`;
  if (examState.normal) return `${SYSTEM_LABELS[systemId]}: Normal examination`;

  return examState.summary || `${SYSTEM_LABELS[systemId]}: Abnormal findings — see narrative`;
}
