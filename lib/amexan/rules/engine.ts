import type {
  RuleDefinition, RuleCondition, RuleAction, RuleType,
  RuleContext, RuleEvaluationResult, RuleValidation, RuleSuggestion,
} from './types';

export class RuleEngine {
  private rules: Map<string, RuleDefinition> = new Map();

  constructor(rules: RuleDefinition[] = []) {
    for (const r of rules) this.addRule(r);
  }

  addRule(rule: RuleDefinition): void {
    this.rules.set(rule.id, rule);
  }

  addRules(rules: RuleDefinition[]): void {
    for (const r of rules) this.addRule(r);
  }

  getRule(id: string): RuleDefinition | undefined {
    return this.rules.get(id);
  }

  getRulesByType(type: RuleType): RuleDefinition[] {
    return Array.from(this.rules.values()).filter(r => r.type === type && r.active);
  }

  getRulesByDomain(domain: string): RuleDefinition[] {
    return Array.from(this.rules.values()).filter(r => r.domain === domain && r.active);
  }

  getAllActiveRules(): RuleDefinition[] {
    return Array.from(this.rules.values()).filter(r => r.active);
  }

  private resolveFact(factPath: string, context: RuleContext): unknown {
    if (factPath === 'true') return true;
    if (factPath === 'false') return false;
    const parts = factPath.split('.');
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

  private evaluateCondition(cond: RuleCondition, context: RuleContext): boolean {
    const actual = this.resolveFact(cond.fact, context);
    const expected = cond.value;

    switch (cond.operator) {
      case 'eq': return actual === expected;
      case 'neq': return actual !== expected;
      case 'gt': return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
      case 'gte': return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
      case 'lt': return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
      case 'lte': return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
      case 'in': return Array.isArray(expected) && expected.includes(actual);
      case 'not_in': return Array.isArray(expected) && !expected.includes(actual);
      case 'contains':
        if (typeof actual === 'string' && typeof expected === 'string') return actual.includes(expected);
        if (Array.isArray(actual)) return actual.includes(expected);
        return false;
      case 'matches':
        return typeof actual === 'string' && typeof expected === 'string' && new RegExp(expected).test(actual);
      case 'exists': return actual !== null && actual !== undefined;
      case 'not_exists': return actual === null || actual === undefined;
      case 'empty':
        if (actual === null || actual === undefined) return true;
        if (typeof actual === 'string') return actual.length === 0;
        if (Array.isArray(actual)) return actual.length === 0;
        return false;
      case 'not_empty':
        if (actual === null || actual === undefined) return false;
        if (typeof actual === 'string') return actual.length > 0;
        if (Array.isArray(actual)) return actual.length > 0;
        return true;
      case 'between':
        if (Array.isArray(expected) && expected.length === 2 && typeof actual === 'number') {
          return actual >= expected[0] && actual <= expected[1];
        }
        return false;
      case 'one_of':
        if (Array.isArray(expected) && Array.isArray(actual)) {
          return expected.some(e => actual.includes(e));
        }
        return false;
      case 'every':
        if (Array.isArray(expected) && Array.isArray(actual)) {
          return expected.every(e => actual.includes(e));
        }
        return false;
      default: return false;
    }
  }

  private contextMatches(rule: RuleDefinition, context: RuleContext): boolean {
    if (rule.contexts.length === 0) return true;
    return rule.contexts.every(c => this.evaluateCondition(c, context));
  }

  private conditionsMatch(rule: RuleDefinition, context: RuleContext): boolean {
    if (rule.conditions.length === 0) return true;
    return rule.conditions.every(c => this.evaluateCondition(c, context));
  }

  evaluate(context: RuleContext): RuleEvaluationResult[] {
    const results: RuleEvaluationResult[] = [];
    const now = Date.now();

    for (const rule of this.rules.values()) {
      if (!rule.active) continue;
      if (!this.contextMatches(rule, context)) continue;

      const matched = this.conditionsMatch(rule, context);
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type,
        priority: rule.priority,
        matched,
        actions: matched ? rule.actions : [],
        context,
        timestamp: now,
      });
    }

    results.sort((a, b) => b.priority - a.priority);
    return results;
  }

  evaluateByType(context: RuleContext, type: RuleType): RuleEvaluationResult[] {
    return this.evaluate(context).filter(r => r.ruleType === type);
  }

  evaluateByDomain(context: RuleContext, domain: string): RuleEvaluationResult[] {
    const domainRules = this.getRulesByDomain(domain);
    const engine = new RuleEngine(domainRules);
    return engine.evaluate(context);
  }

  validate(context: RuleContext): RuleValidation {
    const results = this.evaluateByType(context, 'data');
    const errors: RuleValidation['errors'] = [];
    const warnings: RuleValidation['warnings'] = [];

    for (const result of results) {
      if (!result.matched) continue;
      for (const action of result.actions) {
        if (action.type === 'validate_range') {
          const actual = this.resolveFact(action.target, context);
          const params = action.params || {};
          const min = params.min as number | undefined;
          const max = params.max as number | undefined;

          if (actual != null && typeof actual === 'number') {
            if ((min !== undefined && actual < min) || (max !== undefined && actual > max)) {
              errors.push({
                field: action.target,
                message: action.message || `Value ${actual} is outside range${min !== undefined ? ` (min: ${min})` : ''}${max !== undefined ? ` (max: ${max})` : ''}`,
                code: `${result.ruleId}`,
              });
            }
          }
        }

        if (action.type === 'error') {
          errors.push({
            field: action.target,
            message: action.message || `Validation failed for ${action.target}`,
            code: `${result.ruleId}`,
          });
        }

        if (action.type === 'warn') {
          warnings.push({
            field: action.target,
            message: action.message || `Warning for ${action.target}`,
            code: `${result.ruleId}`,
          });
        }

        if (action.type === 'require') {
          const actual = this.resolveFact(action.target, context);
          if (actual === null || actual === undefined || actual === '' || (Array.isArray(actual) && actual.length === 0)) {
            errors.push({
              field: action.target,
              message: action.message || `${action.target} is required`,
              code: `${result.ruleId}`,
            });
          }
        }

        if (action.type === 'block') {
          errors.push({
            field: action.target,
            message: action.message || `Blocked: ${action.target}`,
            code: `${result.ruleId}`,
          });
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  getSuggestions(context: RuleContext): RuleSuggestion[] {
    const results = this.evaluateByType(context, 'clinical');
    const suggestions: RuleSuggestion[] = [];

    for (const result of results) {
      if (!result.matched) continue;
      for (const action of result.actions) {
        if (action.type === 'suggest_investigation') {
          suggestions.push({
            id: `sug_${result.ruleId}_${action.target}`,
            type: 'investigation',
            label: action.target,
            description: action.message || `Suggested investigation: ${action.target}`,
            urgency: (action.severity === 'critical' ? 'emergency' : action.severity === 'warning' ? 'urgent' : 'routine') as 'routine' | 'urgent' | 'emergency',
            source: result.ruleId,
            actions: [action],
          });
        }
        if (action.type === 'suggest_treatment') {
          suggestions.push({
            id: `sug_${result.ruleId}_${action.target}`,
            type: 'treatment',
            label: action.target,
            description: action.message || `Suggested treatment: ${action.target}`,
            urgency: 'routine',
            source: result.ruleId,
            actions: [action],
          });
        }
        if (action.type === 'flag_red_flag') {
          suggestions.push({
            id: `sug_${result.ruleId}_red_flag`,
            type: 'alert',
            label: `Red Flag: ${action.target}`,
            description: action.message || `Red flag detected: ${action.target}`,
            urgency: 'emergency',
            source: result.ruleId,
            actions: [action],
          });
        }
      }
    }

    return suggestions;
  }

  getActiveModules(context: RuleContext): string[] {
    const results = this.evaluateByType(context, 'ui');
    const modules: string[] = [];

    for (const result of results) {
      if (!result.matched) continue;
      for (const action of result.actions) {
        if (action.type === 'activate_module') modules.push(action.target);
      }
    }

    return modules;
  }

  getVisibleSections(context: RuleContext): string[] {
    const results = this.evaluateByType(context, 'ui');
    const visible: string[] = [];
    const hidden: string[] = [];

    for (const result of results) {
      if (!result.matched) continue;
      for (const action of result.actions) {
        if (action.type === 'show') visible.push(action.target);
        if (action.type === 'activate_module') visible.push(`module.${action.target}`);
        if (action.type === 'hide') hidden.push(action.target);
      }
    }

    return visible.filter(v => !hidden.includes(v));
  }
}
