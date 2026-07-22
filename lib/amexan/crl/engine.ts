// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN CRL Engine — evaluates clinical rules against context
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  ClinicalRule,
  ConditionGroup,
  Condition,
  RuleContext,
  RuleEvaluation,
  RuleEngineResult,
  RuleAction,
  RuleRegistry,
  ActivatedContext,
} from './types';

// ── Utilities ─────────────────────────────────────────────────────────────

function resolveField(context: RuleContext, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = context;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function compareValues(actual: unknown, operator: string, expected: unknown): boolean {
  switch (operator) {
    case 'eq': return actual === expected;
    case 'neq': return actual !== expected;
    case 'gt': return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
    case 'gte': return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
    case 'lt': return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
    case 'lte': return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
    case 'in': return Array.isArray(expected) && expected.includes(actual);
    case 'not_in': return Array.isArray(expected) && !expected.includes(actual);
    case 'contains': {
      if (typeof actual === 'string' && typeof expected === 'string') {
        return actual.toLowerCase().includes(expected.toLowerCase());
      }
      if (Array.isArray(actual)) {
        const expectedStr = String(expected).toLowerCase();
        return actual.some(item => {
          if (typeof item === 'string') return item.toLowerCase().includes(expectedStr);
          if (item && typeof item === 'object') {
            const obj = item as Record<string, unknown>;
            if (typeof obj.normalizedConcept === 'string') return obj.normalizedConcept.toLowerCase().includes(expectedStr);
            if (typeof obj.value === 'string') return obj.value.toLowerCase().includes(expectedStr);
          }
          return false;
        });
      }
      return false;
    }
    case 'starts_with':
      return typeof actual === 'string' && typeof expected === 'string' && actual.toLowerCase().startsWith(expected.toLowerCase());
    case 'exists': return actual !== null && actual !== undefined;
    case 'not_exists': return actual === null || actual === undefined;
    case 'between':
      if (!Array.isArray(expected) || expected.length !== 2) return false;
      return typeof actual === 'number' && actual >= Number(expected[0]) && actual <= Number(expected[1]);
    case 'matches':
      return typeof actual === 'string' && typeof expected === 'string' && new RegExp(expected).test(actual);
    default: return false;
  }
}

// ── Condition Evaluation ───────────────────────────────────────────────────

function evaluateCondition(condition: Condition, context: RuleContext): boolean {
  const actualValue = resolveField(context, condition.field);
  return compareValues(actualValue, condition.operator, condition.value);
}

function evaluateConditionGroup(group: ConditionGroup, context: RuleContext): boolean {
  const results = group.conditions.map(c => {
    if ('logic' in c && 'conditions' in c) {
      return evaluateConditionGroup(c as ConditionGroup, context);
    }
    return evaluateCondition(c as Condition, context);
  });

  switch (group.logic) {
    case 'AND': return results.every(Boolean);
    case 'OR': return results.some(Boolean);
    case 'NOT': return !results[0];
    default: return results.every(Boolean);
  }
}

// ── Single Rule Evaluation ─────────────────────────────────────────────────

function evaluateRule(rule: ClinicalRule, context: RuleContext): RuleEvaluation {
  const start = performance.now();

  // Check exceptions first
  let exceptionTriggered = false;
  if (rule.exceptions) {
    exceptionTriggered = rule.exceptions.some(ex => evaluateConditionGroup(ex, context));
  }

  const matched = !exceptionTriggered && evaluateConditionGroup(rule.conditions, context);

  return {
    rule: rule.identity,
    matched,
    exceptionTriggered,
    actions: matched ? rule.actions : [],
    executionTime: performance.now() - start,
  };
}

// ── Full Rule Engine ───────────────────────────────────────────────────────

export function evaluateAllRules(
  rules: ClinicalRule[],
  context: RuleContext,
): RuleEngineResult {
  const start = performance.now();
  const evaluations: RuleEvaluation[] = [];
  const aggregatedActions = new Map<string, RuleAction[]>();
  const warnings: string[] = [];

  // Sort by priority (lower = higher)
  const sorted = [...rules].sort((a, b) => a.identity.priority - b.identity.priority);

  for (const rule of sorted) {
    if (!rule.identity.enabled) continue;
    const evaluation = evaluateRule(rule, context);
    evaluations.push(evaluation);

    if (evaluation.matched) {
      for (const action of evaluation.actions) {
        const key = `${action.type}:${action.target}`;
        if (!aggregatedActions.has(key)) {
          aggregatedActions.set(key, []);
        }
        aggregatedActions.get(key)!.push(action);
      }
    }
  }

  // Detect conflicting actions
  for (const [key, actions] of aggregatedActions) {
    const types = new Set(actions.map(a => a.type));
    if (types.has('show_section') && types.has('hide_section')) {
      warnings.push(`Conflicting actions for ${key}: both show and hide`);
    }
    if (types.has('lock_step') && types.has('unlock_step')) {
      warnings.push(`Conflicting actions for ${key}: both lock and unlock`);
    }
  }

  return {
    evaluations,
    aggregatedActions,
    totalRules: sorted.length,
    matchedRules: evaluations.filter(e => e.matched).length,
    executionTime: performance.now() - start,
    warnings,
  };
}

// ── Convert Engine Result to Activated Context ─────────────────────────────

export function toActivatedContext(result: RuleEngineResult): ActivatedContext {
  const ctx: ActivatedContext = {
    visibleSections: new Set<string>(),
    requiredFields: {},
    activePathways: [],
    activeSymptomSchemas: [],
    activeRosSystems: [],
    recommendedQuestions: [],
    recommendedExams: [],
    recommendedInvestigations: [],
    alerts: [],
    warnings: [],
    derivedValues: {},
    lockedSteps: [],
    skippedSteps: [],
    insertedSteps: [],
  };

  for (const [, actions] of result.aggregatedActions) {
    for (const action of actions) {
      switch (action.type) {
        case 'show_section':
          ctx.visibleSections.add(action.target);
          break;
        case 'hide_section':
          ctx.visibleSections.delete(action.target);
          break;
        case 'require_field': {
          const [section, field] = action.target.split('.');
          if (!ctx.requiredFields[section]) ctx.requiredFields[section] = [];
          if (!ctx.requiredFields[section].includes(field)) {
            ctx.requiredFields[section].push(field);
          }
          break;
        }
        case 'activate_pathway':
          if (!ctx.activePathways.includes(action.target)) {
            ctx.activePathways.push(action.target);
          }
          break;
        case 'deactivate_pathway':
          ctx.activePathways = ctx.activePathways.filter(p => p !== action.target);
          break;
        case 'activate_symptom_schema':
          if (!ctx.activeSymptomSchemas.includes(action.target)) {
            ctx.activeSymptomSchemas.push(action.target);
          }
          break;
        case 'activate_ros_system':
          if (!ctx.activeRosSystems.includes(action.target)) {
            ctx.activeRosSystems.push(action.target);
          }
          break;
        case 'recommend_question':
          if (!ctx.recommendedQuestions.includes(action.target)) {
            ctx.recommendedQuestions.push(action.target);
          }
          break;
        case 'recommend_exam':
          if (!ctx.recommendedExams.includes(action.target)) {
            ctx.recommendedExams.push(action.target);
          }
          break;
        case 'recommend_investigation':
          if (!ctx.recommendedInvestigations.includes(action.target)) {
            ctx.recommendedInvestigations.push(action.target);
          }
          break;
        case 'trigger_alert':
          ctx.alerts.push(action.target);
          break;
        case 'raise_warning':
          ctx.warnings.push(action.target);
          break;
        case 'derive_field':
          if (action.value !== undefined) {
            ctx.derivedValues[action.target] = action.value;
          }
          break;
        case 'lock_step':
          if (!ctx.lockedSteps.includes(action.target)) {
            ctx.lockedSteps.push(action.target);
          }
          break;
        case 'unlock_step':
          ctx.lockedSteps = ctx.lockedSteps.filter(s => s !== action.target);
          break;
        case 'skip_step':
          if (!ctx.skippedSteps.includes(action.target)) {
            ctx.skippedSteps.push(action.target);
          }
          break;
        case 'insert_step':
          if (!ctx.insertedSteps.includes(action.target)) {
            ctx.insertedSteps.push(action.target);
          }
          break;
      }
    }
  }

  return ctx;
}

// ── Rule Registry (In-Memory) ─────────────────────────────────────────────

export function createRuleRegistry(): RuleRegistry {
  const rules = new Map<string, ClinicalRule>();

  return {
    rules,
    getRule(id: string) { return rules.get(id); },
    getRulesByCategory(category) {
      return Array.from(rules.values()).filter(r => r.identity.category === category);
    },
    getRulesByTag(tag) {
      return Array.from(rules.values()).filter(r => r.identity.tags.includes(tag));
    },
    addRule(rule: ClinicalRule) {
      rules.set(rule.identity.id, rule);
    },
    removeRule(id: string) { rules.delete(id); },
    enableRule(id: string) {
      const rule = rules.get(id);
      if (rule) rule.identity.enabled = true;
    },
    disableRule(id: string) {
      const rule = rules.get(id);
      if (rule) rule.identity.enabled = false;
    },
  };
}
