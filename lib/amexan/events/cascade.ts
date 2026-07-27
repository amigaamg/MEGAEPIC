import type { CascadeRule } from './types';
import { RuleEngine } from '../rules/engine';
import type { RuleContext } from '../rules/types';

export function buildCascadeRules(ruleEngine?: RuleEngine): CascadeRule[] {
  return [
    // ── Symptom → Rule Evaluation ──────────────────────────────
    {
      id: 'cascade_symptom_evaluate_rules',
      triggerEvent: 'symptom.recorded',
      condition: (event) => {
        const payload = event.payload as Record<string, unknown> | undefined;
        return !!payload?.symptomId;
      },
      effects: [
        { type: 'evaluate_rules', params: { domain: '${payload.symptomId}' }, target: 'rule_engine' },
        { type: 'update_differential', params: {}, target: 'reasoning_engine' },
      ],
      priority: 90, active: true,
      description: 'When a symptom is recorded, evaluate clinical rules and update differential',
    },
    {
      id: 'cascade_symptom_red_flags',
      triggerEvent: 'symptom.recorded',
      condition: (event) => {
        const payload = event.payload as Record<string, unknown> | undefined;
        const flags = payload?.redFlags as string[] | undefined;
        return !!flags && flags.length > 0;
      },
      effects: [
        { type: 'flag_red_flag', params: {}, target: 'clinical_alerts' },
        { type: 'generate_task', params: { type: 'review_red_flag', priority: 'high' } },
      ],
      priority: 95, active: true,
      description: 'When red flags are present in symptom, trigger review task',
    },

    // ── Vital → Alerts ─────────────────────────────────────────
    {
      id: 'cascade_vital_alert',
      triggerEvent: 'vital.recorded',
      condition: (event) => {
        const p = event.payload as Record<string, unknown> | undefined;
        const alerts = p?.alerts as string[] | undefined;
        return !!alerts && alerts.length > 0;
      },
      effects: [
        { type: 'flag_red_flag', params: {}, target: 'vital_alerts' },
        { type: 'send_notification', params: { channel: 'in_app' } },
      ],
      priority: 90, active: true,
      description: 'When vital sign triggers an alert, notify clinician',
    },

    // ── Investigation Result → Diagnosis ───────────────────────
    {
      id: 'cascade_investigation_result',
      triggerEvent: 'investigation.resulted',
      condition: (event) => {
        const p = event.payload as Record<string, unknown> | undefined;
        return !!p?.investigationId && !!p?.result;
      },
      effects: [
        { type: 'evaluate_rules', params: { domain: 'investigation' }, target: 'rule_engine' },
        { type: 'update_differential', params: {}, target: 'reasoning_engine' },
        { type: 'calculate_score', params: {}, target: 'severity_scores' },
      ],
      priority: 85, active: true,
      description: 'When investigation results arrive, update reasoning and scores',
    },

    // ── Diagnosis → Cascade Actions ────────────────────────────
    {
      id: 'cascade_diagnosis_notifiable',
      triggerEvent: 'diagnosis.added',
      condition: (event) => {
        const p = event.payload as Record<string, unknown> | undefined;
        const notifiable = p?.notifiable as boolean | undefined;
        return notifiable === true;
      },
      effects: [
        { type: 'publish_public_health', params: {}, target: 'public_health_registry' },
        { type: 'generate_task', params: { type: 'public_health_notification', priority: 'high' } },
      ],
      priority: 95, active: true,
      description: 'When a notifiable diagnosis is added, publish to public health',
    },
    {
      id: 'cascade_diagnosis_treatment',
      triggerEvent: 'diagnosis.added',
      effects: [
        { type: 'suggest_treatment', params: {}, target: 'management_engine' },
        { type: 'generate_document', params: { type: 'clinical_summary' } },
      ],
      priority: 80, active: true,
      description: 'When diagnosis is added, suggest treatments and update documentation',
    },

    // ── Treatment → Workflow ───────────────────────────────────
    {
      id: 'cascade_treatment_workflow',
      triggerEvent: 'treatment.prescribed',
      effects: [
        { type: 'trigger_workflow', params: { step: 'pharmacy' }, target: 'workflow_engine' },
        { type: 'generate_task', params: { type: 'dispense_medication', priority: 'normal' } },
      ],
      priority: 80, active: true,
      description: 'When treatment is prescribed, trigger pharmacy workflow',
    },

    // ── Admission → Monitoring ─────────────────────────────────
    {
      id: 'cascade_admission_monitoring',
      triggerEvent: 'admission.ordered',
      effects: [
        { type: 'trigger_workflow', params: { step: 'ward_assignment' }, target: 'workflow_engine' },
        { type: 'generate_task', params: { type: 'admit_patient', priority: 'high' } },
      ],
      priority: 85, active: true,
      description: 'When admission is ordered, initiate ward workflow',
    },

    // ── Discharge → Documentation ──────────────────────────────
    {
      id: 'cascade_discharge_documentation',
      triggerEvent: 'discharge.ordered',
      effects: [
        { type: 'generate_document', params: { type: 'discharge_summary' }, target: 'documentation_engine' },
        { type: 'generate_task', params: { type: 'complete_discharge', priority: 'high' } },
      ],
      priority: 90, active: true,
      description: 'When discharge is ordered, generate discharge summary',
    },

    // ── Guideline Activation ───────────────────────────────────
    {
      id: 'cascade_guideline_activate',
      triggerEvent: 'guideline.activated',
      effects: [
        { type: 'evaluate_rules', params: { domain: 'guideline' }, target: 'rule_engine' },
        { type: 'generate_task', params: { type: 'review_guideline', priority: 'normal' } },
      ],
      priority: 75, active: true,
      description: 'When a guideline is activated, evaluate guideline rules',
    },

    // ── Score Threshold ────────────────────────────────────────
    {
      id: 'cascade_score_threshold',
      triggerEvent: 'score.threshold_exceeded',
      condition: (event) => {
        const p = event.payload as Record<string, unknown> | undefined;
        const threshold = p?.threshold as string | undefined;
        return threshold === 'critical' || threshold === 'high';
      },
      effects: [
        { type: 'flag_red_flag', params: {}, target: 'score_alerts' },
        { type: 'send_notification', params: { channel: 'in_app', urgency: 'critical' } },
        { type: 'generate_task', params: { type: 'clinical_review', priority: 'critical' } },
      ],
      priority: 95, active: true,
      description: 'When a critical score threshold is exceeded, alert and create review task',
    },
  ];
}

export function connectEventEngineToRules(
  eventEngine: { onCascade: (cb: (effect: { type: string; params: Record<string, unknown>; target?: string }, trigger: import('./types').ClinicalEvent) => void) => () => void },
  ruleEngine: RuleEngine,
): () => void {
  return eventEngine.onCascade((effect, trigger) => {
    if (effect.type === 'evaluate_rules') {
      const context: RuleContext = {
        patient: trigger.patient?.id ? { age: trigger.context?.patientAge as number } : undefined,
        encounter: trigger.patient?.encounterId ? { phase: trigger.context?.phase as string } : undefined,
        facts: { eventType: trigger.type, payload: trigger.payload as Record<string, unknown> },
      };
      ruleEngine.evaluate(context);
    }
  });
}
