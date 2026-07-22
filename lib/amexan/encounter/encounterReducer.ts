// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN EncounterReducer — single state machine for all encounter mutations
// ═══════════════════════════════════════════════════════════════════════════════
// Every state change goes through exactly one function.
// No engine mutates state directly. No component calls setState on slices.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  EncounterState,
  WorkflowStep,
  EncounterPhase,
  StructuredSymptom,
  GenericSymptom,
  SymptomId,
  Demographics,
  ChiefComplaint,
  Vitals,
  PastMedicalHistory,
  ObstetricHistory,
  GynecologicalHistory,
  Medications,
  FamilyHistory,
  SocialHistory,
  ReviewOfSystems,
  InvestigationOrder,
  ImagingOrder,
  BedsideScore,
  DifferentialCandidate,
  ManagementPlan,
  GiExam,
} from './encounterState';

import type { SystemId, ExamPhase, SystemFieldValue } from './examination/systemExaminationTypes';
import { updateSystemExamField, completeSystemExamPhase } from './engines/systemExaminationEngine';

// ── Actions ───────────────────────────────────────────────────────────────────
// Every possible state change is an action. No direct mutation.

export type EncounterAction =
  // Workflow — legacy
  | { type: 'ADVANCE_WORKFLOW'; step: WorkflowStep }
  | { type: 'SET_WORKFLOW_STEP'; step: WorkflowStep }

  // Workflow — phase-level
  | { type: 'NAVIGATE_TO_PHASE'; phase: EncounterPhase }
  | { type: 'MARK_PHASE_COMPLETE'; phase: EncounterPhase }

  // Demographics
  | { type: 'SET_DEMOGRAPHICS'; payload: Partial<Demographics> }

  // Chief Complaint
  | { type: 'SET_CHIEF_COMPLAINT'; payload: Partial<ChiefComplaint> }
  | { type: 'SET_ACTIVE_HIGHWAYS'; payload: string[] }

  // Symptoms
  | { type: 'ACTIVATE_SYMPTOM'; payload: StructuredSymptom }
  | { type: 'UPDATE_SYMPTOM'; payload: StructuredSymptom | GenericSymptom }
  | { type: 'MARK_SYMPTOM_ABSENT'; symptomId: SymptomId }

  // History
  | { type: 'SET_PMH'; payload: Partial<PastMedicalHistory> }
  | { type: 'SET_OBSTETRIC'; payload: ObstetricHistory }
  | { type: 'SET_GYNECOLOGICAL'; payload: GynecologicalHistory }
  | { type: 'SET_MEDICATIONS'; payload: Partial<Medications> }
  | { type: 'ADD_MEDICATION'; payload: Medications['current'][0] }
  | { type: 'ADD_ALLERGY'; payload: Medications['allergies'][0] }
  | { type: 'SET_FAMILY_HISTORY'; payload: Partial<FamilyHistory> }
  | { type: 'SET_SOCIAL_HISTORY'; payload: Partial<SocialHistory> }
  | { type: 'UPDATE_ROS'; payload: Partial<ReviewOfSystems> }
  | { type: 'UPDATE_ROS_SYSTEM'; system: keyof ReviewOfSystems; payload: Record<string, boolean | string> }

  // Examination
  | { type: 'SET_VITALS'; payload: Partial<Vitals> }
  | { type: 'UPDATE_EXAM'; section: string; payload: Record<string, boolean | string> }
  | { type: 'SET_GI_EXAM'; payload: Partial<GiExam> }
  | { type: 'ADD_BEDSIDE_SCORE'; payload: BedsideScore }

  // Investigations
  | { type: 'ORDER_LAB'; payload: InvestigationOrder }
  | { type: 'UPDATE_LAB_RESULT'; testId: string; payload: Partial<InvestigationOrder> }
  | { type: 'ORDER_IMAGING'; payload: ImagingOrder }
  | { type: 'COMPLETE_IMAGING'; studyId: string; payload: Partial<ImagingOrder> }

  // Assessment
  | { type: 'SET_DIFFERENTIALS'; payload: DifferentialCandidate[] }
  | { type: 'SET_DANGER_RANKED'; payload: DifferentialCandidate[] }
  | { type: 'SET_MUST_NOT_MISS'; payload: DifferentialCandidate[] }
  | { type: 'SET_FINAL_DIAGNOSIS'; payload: string | null }
  | { type: 'SET_SEVERITY'; payload: EncounterState['assessment']['severity'] }
  | { type: 'ADD_RED_FLAG'; payload: string }

  // Plan
  | { type: 'SET_MANAGEMENT_PLAN'; payload: Partial<ManagementPlan> }
  | { type: 'ADD_TREATMENT'; payload: ManagementPlan['treatments'][0] }
  | { type: 'ADD_MEDICATION_ORDER'; payload: ManagementPlan['medications'][0] }

  // System examination
  | { type: 'SET_SYSTEM_EXAM_FIELD'; systemId: SystemId; fieldId: string; value: SystemFieldValue }
  | { type: 'COMPLETE_SYSTEM_EXAM_PHASE'; systemId: SystemId; phase: ExamPhase }
  | { type: 'MARK_SYSTEM_NORMAL'; systemId: SystemId }
  | { type: 'SET_SYSTEM_NARRATIVE'; systemId: SystemId; narrative: string; summary: string }

  // Completion tracking
  | { type: 'MARK_DOMAIN_COMPLETE'; domain: string; complete: boolean }
  | { type: 'SET_COMPLETENESS_SCORE'; payload: number }
  | { type: 'MARK_HISTORY_COMPLETE'; payload: boolean }
  | { type: 'MARK_EXAM_COMPLETE'; payload: boolean }
  | { type: 'MARK_QUESTIONS_EXHAUSTED'; payload: boolean }

  // Bulk operations
  | { type: 'LOAD_ENCOUNTER'; payload: EncounterState }
  | { type: 'RESET_ENCOUNTER' };

// ── Helper: deep merge two objects ────────────────────────────────────────────

function merge<T extends Record<string, any>>(a: T, b: Partial<T>): T {
  const result = { ...a };
  for (const key of Object.keys(b) as Array<keyof T>) {
    const val = b[key];
    if (val !== undefined) {
      if (typeof val === 'object' && val !== null && !Array.isArray(val) && typeof result[key] === 'object' && result[key] !== null) {
        (result as any)[key] = { ...(result[key] as any), ...val };
      } else {
        result[key] = val as T[keyof T];
      }
    }
  }
  return result;
}

import { createEncounterState } from './encounterState';

// ── Reducer ───────────────────────────────────────────────────────────────────

export function encounterReducer(state: EncounterState, action: EncounterAction): EncounterState {
  const now = Date.now();

  switch (action.type) {
    // ── Workflow ──────────────────────────────────────────────────────
    case 'ADVANCE_WORKFLOW': {
      const completed = [...state.workflow.completedSteps, state.workflow.currentStep];
      return {
        ...state,
        workflow: { ...state.workflow, currentStep: action.step, completedSteps: completed, updatedAt: now },
        updatedAt: now,
      };
    }
    case 'SET_WORKFLOW_STEP': {
      return {
        ...state,
        workflow: { ...state.workflow, currentStep: action.step, updatedAt: now },
        updatedAt: now,
      };
    }

    // ── Phase-level workflow ──────────────────────────────────────────
    case 'NAVIGATE_TO_PHASE': {
      return {
        ...state,
        workflow: { ...state.workflow, currentPhase: action.phase, updatedAt: now },
        updatedAt: now,
      };
    }
    case 'MARK_PHASE_COMPLETE': {
      const alreadyComplete = state.workflow.completedPhases.includes(action.phase);
      return {
        ...state,
        workflow: {
          ...state.workflow,
          completedPhases: alreadyComplete
            ? state.workflow.completedPhases
            : [...state.workflow.completedPhases, action.phase],
          updatedAt: now,
        },
        updatedAt: now,
      };
    }

    // ── Demographics ──────────────────────────────────────────────────
    case 'SET_DEMOGRAPHICS':
      return { ...state, demographics: { ...state.demographics, ...action.payload }, updatedAt: now };

    // ── Chief Complaint ───────────────────────────────────────────────
    case 'SET_CHIEF_COMPLAINT':
      return { ...state, chiefComplaint: { ...state.chiefComplaint, ...action.payload }, updatedAt: now };
    case 'SET_ACTIVE_HIGHWAYS':
      return { ...state, chiefComplaint: { ...state.chiefComplaint, activeHighways: action.payload }, updatedAt: now };

    // ── Symptoms ──────────────────────────────────────────────────────
    case 'ACTIVATE_SYMPTOM':
      return {
        ...state,
        symptoms: { ...state.symptoms, [action.payload.id]: action.payload },
        updatedAt: now,
      };
    case 'UPDATE_SYMPTOM':
      return {
        ...state,
        symptoms: { ...state.symptoms, [action.payload.id]: action.payload },
        updatedAt: now,
      };
    case 'MARK_SYMPTOM_ABSENT': {
      const existing = state.symptoms[action.symptomId];
      if (existing) {
        return {
          ...state,
          symptoms: { ...state.symptoms, [action.symptomId]: { ...existing, present: false } },
          updatedAt: now,
        };
      }
      return state;
    }

    // ── History ───────────────────────────────────────────────────────
    case 'SET_PMH':
      return { ...state, history: { ...state.history, pmh: { ...state.history.pmh, ...action.payload } }, updatedAt: now };
    case 'SET_OBSTETRIC':
      return { ...state, history: { ...state.history, obstetric: action.payload }, updatedAt: now };
    case 'SET_GYNECOLOGICAL':
      return { ...state, history: { ...state.history, gynecological: action.payload }, updatedAt: now };
    case 'SET_MEDICATIONS':
      return { ...state, history: { ...state.history, medications: { ...state.history.medications, ...action.payload } }, updatedAt: now };
    case 'ADD_MEDICATION':
      return {
        ...state,
        history: {
          ...state.history,
          medications: { ...state.history.medications, current: [...state.history.medications.current, action.payload] },
        },
        updatedAt: now,
      };
    case 'ADD_ALLERGY':
      return {
        ...state,
        history: {
          ...state.history,
          medications: { ...state.history.medications, allergies: [...state.history.medications.allergies, action.payload] },
        },
        updatedAt: now,
      };
    case 'SET_FAMILY_HISTORY':
      return { ...state, history: { ...state.history, family: { ...state.history.family, ...action.payload } }, updatedAt: now };
    case 'SET_SOCIAL_HISTORY':
      return { ...state, history: { ...state.history, social: { ...state.history.social, ...action.payload } }, updatedAt: now };
    case 'UPDATE_ROS':
      return { ...state, history: { ...state.history, ros: merge(state.history.ros, action.payload) }, updatedAt: now };
    case 'UPDATE_ROS_SYSTEM':
      return {
        ...state,
        history: {
          ...state.history,
          ros: { ...state.history.ros, [action.system]: { ...(state.history.ros[action.system] as any), ...action.payload } },
        },
        updatedAt: now,
      };

    // ── Examination ───────────────────────────────────────────────────
    case 'SET_VITALS':
      return { ...state, examination: { ...state.examination, vitals: { ...state.examination.vitals, ...action.payload, recordedAt: now } }, updatedAt: now };
    case 'UPDATE_EXAM':
      return {
        ...state,
        examination: {
          ...state.examination,
          physical: { ...state.examination.physical, [action.section]: { ...(state.examination.physical as any)[action.section], ...action.payload } },
        },
        updatedAt: now,
      };
    case 'SET_GI_EXAM':
      return {
        ...state,
        examination: {
          ...state.examination,
          physical: {
            ...state.examination.physical,
            abdominal: { ...state.examination.physical.abdominal, ...action.payload },
          },
        },
        updatedAt: now,
      };
    case 'ADD_BEDSIDE_SCORE':
      return { ...state, examination: { ...state.examination, scores: [...state.examination.scores, action.payload] }, updatedAt: now };

    // ── System Examinations (Volume IIB) ──────────────────────────────
    case 'SET_SYSTEM_EXAM_FIELD':
      return {
        ...state,
        examination: {
          ...state.examination,
          systemExaminations: updateSystemExamField(
            state.examination.systemExaminations,
            action.systemId,
            action.fieldId,
            action.value,
          ),
        },
        updatedAt: now,
      };
    case 'COMPLETE_SYSTEM_EXAM_PHASE':
      return {
        ...state,
        examination: {
          ...state.examination,
          systemExaminations: completeSystemExamPhase(
            state.examination.systemExaminations,
            action.systemId,
            action.phase,
          ),
        },
        updatedAt: now,
      };
    case 'MARK_SYSTEM_NORMAL': {
      const sysState = { ...(state.examination.systemExaminations[action.systemId] ?? { examined: true, normal: true, phases: {}, measurements: {}, narrative: '', summary: '' }) };
      sysState.examined = true;
      sysState.normal = true;
      return {
        ...state,
        examination: {
          ...state.examination,
          systemExaminations: { ...state.examination.systemExaminations, [action.systemId]: sysState },
        },
        updatedAt: now,
      };
    }
    case 'SET_SYSTEM_NARRATIVE': {
      const existing = state.examination.systemExaminations[action.systemId] ?? { examined: true, normal: true, phases: {}, measurements: {}, narrative: '', summary: '' };
      return {
        ...state,
        examination: {
          ...state.examination,
          systemExaminations: {
            ...state.examination.systemExaminations,
            [action.systemId]: { ...existing, narrative: action.narrative, summary: action.summary },
          },
        },
        updatedAt: now,
      };
    }

    // ── Investigations ───────────────────────────────────────────────
    case 'ORDER_LAB':
      return { ...state, investigations: { ...state.investigations, labs: [...state.investigations.labs, action.payload] }, updatedAt: now };
    case 'UPDATE_LAB_RESULT':
      return {
        ...state,
        investigations: {
          ...state.investigations,
          labs: state.investigations.labs.map(l => l.testId === action.testId ? { ...l, ...action.payload } : l),
        },
        updatedAt: now,
      };
    case 'ORDER_IMAGING':
      return { ...state, investigations: { ...state.investigations, imaging: [...state.investigations.imaging, action.payload] }, updatedAt: now };
    case 'COMPLETE_IMAGING':
      return {
        ...state,
        investigations: {
          ...state.investigations,
          imaging: state.investigations.imaging.map(i => i.studyId === action.studyId ? { ...i, ...action.payload } : i),
        },
        updatedAt: now,
      };

    // ── Assessment ────────────────────────────────────────────────────
    case 'SET_DIFFERENTIALS':
      return { ...state, assessment: { ...state.assessment, differentials: action.payload }, updatedAt: now };
    case 'SET_DANGER_RANKED':
      return { ...state, assessment: { ...state.assessment, dangerRanked: action.payload }, updatedAt: now };
    case 'SET_MUST_NOT_MISS':
      return { ...state, assessment: { ...state.assessment, mustNotMissDiseases: action.payload }, updatedAt: now };
    case 'SET_FINAL_DIAGNOSIS':
      return { ...state, assessment: { ...state.assessment, finalDiagnosis: action.payload }, updatedAt: now };
    case 'SET_SEVERITY':
      return { ...state, assessment: { ...state.assessment, severity: action.payload }, updatedAt: now };
    case 'ADD_RED_FLAG':
      return {
        ...state,
        assessment: {
          ...state.assessment,
          severity: { ...state.assessment.severity, redFlags: [...state.assessment.severity.redFlags, action.payload] },
        },
        updatedAt: now,
      };

    // ── Plan ──────────────────────────────────────────────────────────
    case 'SET_MANAGEMENT_PLAN':
      return { ...state, plan: { ...state.plan, ...action.payload }, updatedAt: now };
    case 'ADD_TREATMENT':
      return { ...state, plan: { ...state.plan, treatments: [...state.plan.treatments, action.payload] }, updatedAt: now };
    case 'ADD_MEDICATION_ORDER':
      return { ...state, plan: { ...state.plan, medications: [...state.plan.medications, action.payload] }, updatedAt: now };

    // ── Completion ────────────────────────────────────────────────────
    case 'MARK_DOMAIN_COMPLETE':
      return {
        ...state,
        completion: { ...state.completion, domainsComplete: { ...state.completion.domainsComplete, [action.domain]: action.complete } },
        updatedAt: now,
      };
    case 'SET_COMPLETENESS_SCORE':
      return { ...state, completion: { ...state.completion, completenessScore: action.payload }, updatedAt: now };
    case 'MARK_HISTORY_COMPLETE':
      return { ...state, completion: { ...state.completion, historyComplete: action.payload }, updatedAt: now };
    case 'MARK_EXAM_COMPLETE':
      return { ...state, completion: { ...state.completion, examinationComplete: action.payload }, updatedAt: now };
    case 'MARK_QUESTIONS_EXHAUSTED':
      return { ...state, completion: { ...state.completion, questionsExhausted: action.payload }, updatedAt: now };

    // ── Bulk ──────────────────────────────────────────────────────────
    case 'LOAD_ENCOUNTER':
      return { ...action.payload, updatedAt: now };
    case 'RESET_ENCOUNTER':
      return { ...state, ...createEncounterState(), id: state.id, demographics: { ...state.demographics }, updatedAt: now };

    default:
      return state;
  }
}
