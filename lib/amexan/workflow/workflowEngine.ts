import type {
  WorkflowState,
  WorkflowStep,
  WorkflowStepMeta,
  EncounterBrainState,
  QuestionGroup,
} from '../encounter-brain/types';
import {
  WORKFLOW_STEPS,
  WORKFLOW_STEP_META,
} from '../encounter-brain/types';
import type { InformationGap } from '../encounter-brain/types';

function now(): number {
  return Date.now();
}

export function createWorkflow(): WorkflowState {
  return {
    currentStep: 'registration',
    completedSteps: [],
    skippedSteps: [],
    startedAt: now(),
    updatedAt: now(),
    owner: 'encounter_brain',
  };
}

export function getCurrentStepMeta(state: WorkflowState): WorkflowStepMeta {
  return WORKFLOW_STEP_META[state.currentStep];
}

function evaluateActivationRule(rule: string, brain: EncounterBrainState): boolean {
  try {
    const fn = new Function('encounter', 'patient', `return ${rule}`);
    return Boolean(fn(brain.encounter, brain.patient));
  } catch {
    return false;
  }
}

export function advanceToNextStep(
  workflow: WorkflowState,
  brain: EncounterBrainState,
): WorkflowState {
  const completedSteps = workflow.completedSteps.includes(workflow.currentStep)
    ? workflow.completedSteps
    : [...workflow.completedSteps, workflow.currentStep];
  const skippedSteps = [...workflow.skippedSteps];

  const currentIdx = WORKFLOW_STEPS.indexOf(workflow.currentStep);
  let nextStep: WorkflowStep | null = null;

  for (let i = currentIdx + 1; i < WORKFLOW_STEPS.length; i++) {
    const candidate = WORKFLOW_STEPS[i];
    if (completedSteps.includes(candidate) || skippedSteps.includes(candidate)) {
      continue;
    }

    const meta = WORKFLOW_STEP_META[candidate];
    const depsMet = meta.dependsOn.every(
      d => completedSteps.includes(d) || skippedSteps.includes(d),
    );
    if (!depsMet) continue;

    if (meta.activationRule) {
      const ruleMet = evaluateActivationRule(meta.activationRule, brain);
      if (!ruleMet) {
        skippedSteps.push(candidate);
        continue;
      }
    }

    nextStep = candidate;
    break;
  }

  if (!nextStep) {
    return {
      ...workflow,
      completedSteps,
      skippedSteps,
      updatedAt: now(),
    };
  }

  return {
    ...workflow,
    currentStep: nextStep,
    completedSteps,
    skippedSteps,
    updatedAt: now(),
  };
}

export function canAdvance(
  workflow: WorkflowState,
  brain: EncounterBrainState,
): boolean {
  const step = workflow.currentStep;
  const questions = getStepQuestions(step, brain);
  if (questions.length === 0) return true;

  const answeredFeatures = new Set<string>();
  for (const symptom of Object.values(brain.symptoms)) {
    for (const attr of Object.values(symptom.attributes)) {
      answeredFeatures.add(attr.featureId);
    }
  }
  for (const q of brain.questionsAsked) answeredFeatures.add(q);

  const answered = questions.filter(f => answeredFeatures.has(f));
  const threshold = Math.max(1, Math.ceil(questions.length * 0.5));
  return answered.length >= threshold;
}

export function getWorkflowProgress(workflow: WorkflowState): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = workflow.completedSteps.length;
  const total = WORKFLOW_STEPS.length;
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export interface WorkflowTimelineEntry {
  step: WorkflowStep;
  label: string;
  status: 'completed' | 'skipped' | 'current' | 'pending';
  timestamp?: number;
}

export function getWorkflowTimeline(workflow: WorkflowState): WorkflowTimelineEntry[] {
  return WORKFLOW_STEPS.map(step => {
    const meta = WORKFLOW_STEP_META[step];
    if (workflow.completedSteps.includes(step)) {
      return { step, label: meta.label, status: 'completed' as const, timestamp: workflow.updatedAt };
    }
    if (workflow.skippedSteps.includes(step)) {
      return { step, label: meta.label, status: 'skipped' as const, timestamp: workflow.updatedAt };
    }
    if (step === workflow.currentStep) {
      return { step, label: meta.label, status: 'current' as const };
    }
    return { step, label: meta.label, status: 'pending' as const };
  });
}

const STEP_FEATURES: Partial<Record<WorkflowStep, string[]>> = {
  registration: ['patient_name', 'age', 'sex', 'residence', 'occupation', 'informant'],
  chief_complaint: ['complaint_text', 'complaint_duration', 'complaint_severity'],
  timeline: ['symptom_onset_date', 'symptom_onset_nature', 'symptom_progression'],
  past_history: ['known_chronic_diseases', 'past_admissions', 'past_surgeries'],
  drug_history: ['current_medications', 'medication_compliance', 'previous_medications'],
  allergies: ['drug_allergies', 'allergy_reactions', 'allergy_severity'],
  family_history: ['family_diabetes', 'family_hypertension', 'family_cancer', 'family_tb', 'family_asthma'],
  social_history: ['smoking', 'alcohol', 'occupation', 'housing', 'water_source', 'sanitation'],
  review_of_systems: ['ros_all_systems'],
  vitals: ['spo2', 'rr', 'hr', 'bp', 'temp', 'weight', 'height', 'muac', 'avpu', 'blood_glucose'],
  abcde: ['airway_patent', 'breathing_effort', 'circulation_status', 'disability_gcs', 'exposure_temp'],
  general_examination: ['appearance', 'pallor', 'jaundice', 'cyanosis', 'clubbing', 'lymphadenopathy', 'edema', 'dehydration'],
  diagnosis: ['final_diagnosis', 'working_diagnosis'],
  disposition: ['admission_decision', 'discharge_plan', 'follow_up_plan'],
};

export function getStepQuestions(
  step: WorkflowStep,
  brain: EncounterBrainState,
): string[] {
  switch (step) {
    case 'hpi':
      return brain.gaps.map((g: InformationGap) => g.featureId);
    case 'functional_status':
      return ['functional_impact', 'occupation', 'daily_activities', 'caregiver_available', 'work_impact'];
    case 'system_examination':
      return brain.symptoms[brain.primarySymptomId]
        ? Object.keys(brain.symptoms[brain.primarySymptomId].attributes)
        : [];
    case 'differentials':
      return Object.values(brain.diseaseStates).flatMap(ds =>
        ds.supportingEvidence.map(e => e.featureId),
      );
    case 'investigations':
      return [];
    case 'management':
      return [];
    case 'documentation':
      return brain.documentationGraph
        ? brain.documentationGraph.nodes.flatMap(n => n.sourceFacts)
        : [];
    default:
      return STEP_FEATURES[step] ?? [];
  }
}

export function getAdaptiveQuestionGroups(
  workflow: WorkflowState,
  brain: EncounterBrainState,
): QuestionGroup[] {
  const step = workflow.currentStep;
  const questions = getStepQuestions(step, brain);
  if (questions.length === 0) return [];

  const meta = getCurrentStepMeta(workflow);

  return [
    {
      id: `${step}_group`,
      label: meta.label,
      description: meta.description,
      questions,
      order: 1,
      minRequired: Math.max(1, Math.ceil(questions.length * 0.5)),
    },
  ];
}
