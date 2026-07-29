import { JourneyId, ActorId, SectionId } from '@/lib/amexan/constitution/books/book-II-experience';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  journeyId: JourneyId;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  version: string;
}

export interface WorkflowTrigger {
  type: 'phase_entry' | 'phase_complete' | 'card_submit' | 'event' | 'schedule';
  target: string;
  condition?: string;
}

export interface WorkflowStep {
  id: string;
  type: 'section_auto_fill' | 'card_auto_submit' | 'navigation' | 'alert' | 'ai_call' | 'webhook';
  target?: string;
  config: Record<string, unknown>;
  dependsOn?: string[];
  timeout?: number;
}

const WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf_triage_to_registration',
    name: 'Auto-fill from Triage',
    description: 'When triage is complete, pre-fill registration biodata',
    journeyId: 'clinical_care',
    trigger: { type: 'phase_complete', target: 'registration' },
    steps: [
      { id: 'step_fill_biodata', type: 'section_auto_fill', config: { sourceSection: 'triage_assessment', targetSection: 'biodata', fieldMap: { name: 'name', age: 'age', gender: 'gender' } } },
    ],
    version: '1.0.0',
  },
  {
    id: 'wf_critical_alert',
    name: 'Critical Value Alert',
    description: 'Alert doctor when critical lab result is posted',
    journeyId: 'clinical_care',
    trigger: { type: 'event', target: 'critical_lab_result' },
    steps: [
      { id: 'step_alert', type: 'alert', config: { severity: 'critical', message: 'Critical lab result received: {{result}}', targetActor: 'doctor' } },
      { id: 'step_notify', type: 'navigation', config: { target: '/alerts', autoNavigate: false } },
    ],
    version: '1.0.0',
  },
  {
    id: 'wf_medication_interaction',
    name: 'Drug Interaction Check',
    description: 'AI check when medication is prescribed',
    journeyId: 'clinical_care',
    trigger: { type: 'card_submit', target: 'medication_form' },
    steps: [
      { id: 'step_ai_check', type: 'ai_call', config: { endpoint: 'drug_interaction', inputSource: 'medications' }, timeout: 5000 },
      { id: 'step_show_warning', type: 'alert', config: { severity: 'warning', message: 'Potential interaction detected', autoShow: true } },
    ],
    version: '1.0.0',
  },
  {
    id: 'wf_nursing_handover',
    name: 'Shift Handover Prep',
    description: 'Pre-populate handover at end of shift',
    journeyId: 'nursing_care',
    trigger: { type: 'schedule', target: '12:00', condition: 'shift_type==day' },
    steps: [
      { id: 'step_collect', type: 'section_auto_fill', config: { sourceSection: 'observations', targetSection: 'handover_report', fieldMap: { vitals_summary: 'vitals', pending: 'pending_tasks' } } },
      { id: 'step_notify', type: 'alert', config: { severity: 'info', message: 'Handover report ready for review', targetActor: 'nurse' } },
    ],
    version: '1.0.0',
  },
  {
    id: 'wf_learning_case_assign',
    name: 'Assign Case to Student',
    description: 'Auto-assign case when student enters learning',
    journeyId: 'learning',
    trigger: { type: 'phase_entry', target: 'dashboard' },
    steps: [
      { id: 'step_assign', type: 'ai_call', config: { endpoint: 'case_assignment', criteria: { difficulty: 'appropriate', topic: 'curriculum' } } },
    ],
    version: '1.0.0',
  },
];

export function getWorkflowsForJourney(journeyId: JourneyId): WorkflowDefinition[] {
  return WORKFLOWS.filter(w => w.journeyId === journeyId);
}

export function getWorkflowsForTrigger(triggerType: WorkflowTrigger['type'], target: string): WorkflowDefinition[] {
  return WORKFLOWS.filter(w => w.trigger.type === triggerType && w.trigger.target === target);
}

export function getWorkflowById(id: string): WorkflowDefinition | undefined {
  return WORKFLOWS.find(w => w.id === id);
}

export function evaluateTrigger(workflow: WorkflowDefinition, context: Record<string, unknown>): boolean {
  if (!workflow.trigger.condition) return true;
  const [field, expected] = workflow.trigger.condition.split('==');
  return String(context[field?.trim() || '']) === (expected?.trim() || '');
}

export function resolveWorkflowStep(step: WorkflowStep, context: Record<string, unknown>): Record<string, unknown> {
  let config = { ...step.config } as Record<string, unknown>;
  const configStr = JSON.stringify(config);
  const resolved = configStr.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return String(context[key] ?? `{{${key}}}`);
  });
  try { config = JSON.parse(resolved); } catch { /* keep original */ }
  return config;
}

export const ALL_WORKFLOWS = WORKFLOWS;