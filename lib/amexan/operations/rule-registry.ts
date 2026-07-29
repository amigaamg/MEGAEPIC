// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN RULE REGISTRY
// Central catalog of every rule across all engines — visibility, activation,
// priority, context, ordering, safety, contraindication.
// ═══════════════════════════════════════════════════════════════════════════════

import { RuleRegistration } from './operations-constitution';

export class RuleRegistry {
  private rules: Map<string, RuleRegistration> = new Map();
  private triggerHistory: Map<string, number> = new Map();

  register(rule: Omit<RuleRegistration, 'triggerCount' | 'createdAt'>): RuleRegistration {
    const created: RuleRegistration = {
      ...rule,
      triggerCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.rules.set(created.ruleId, created);
    return created;
  }

  registerBatch(rules: Array<Omit<RuleRegistration, 'triggerCount' | 'createdAt'>>): RuleRegistration[] {
    return rules.map(r => this.register(r));
  }

  get(ruleId: string): RuleRegistration | undefined {
    return this.rules.get(ruleId);
  }

  getAll(category?: RuleRegistration['category'], status?: RuleRegistration['status']): RuleRegistration[] {
    let results = Array.from(this.rules.values());
    if (category) results = results.filter(r => r.category === category);
    if (status) results = results.filter(r => r.status === status);
    return results;
  }

  getByEngine(engineId: string): RuleRegistration[] {
    return Array.from(this.rules.values()).filter(r => r.engineId === engineId);
  }

  recordTrigger(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (!rule) return;
    this.rules.set(ruleId, {
      ...rule,
      triggerCount: rule.triggerCount + 1,
      lastTriggeredAt: new Date().toISOString(),
    });
    this.triggerHistory.set(ruleId, (this.triggerHistory.get(ruleId) || 0) + 1);
  }

  deprecate(ruleId: string, supersededBy?: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;
    this.rules.set(ruleId, { ...rule, status: 'deprecated', supersededBy });
    return true;
  }

  supersede(ruleId: string, newRuleId: string): boolean {
    return this.deprecate(ruleId, newRuleId);
  }

  getConflicts(): Array<{ ruleA: RuleRegistration; ruleB: RuleRegistration; reason: string }> {
    const conflicts: Array<{ ruleA: RuleRegistration; ruleB: RuleRegistration; reason: string }> = [];
    const rules = Array.from(this.rules.values()).filter(r => r.status === 'active');

    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        if (rules[i].engineId === rules[j].engineId && rules[i].category === rules[j].category) {
          if (rules[i].conditions === rules[j].conditions && rules[i].effect !== rules[j].effect) {
            conflicts.push({ ruleA: rules[i], ruleB: rules[j], reason: 'Same conditions produce different effects' });
          }
        }
      }
    }
    return conflicts;
  }

  getOrphanedRules(allEngineIds: string[]): RuleRegistration[] {
    const engineSet = new Set(allEngineIds);
    return Array.from(this.rules.values()).filter(r => !engineSet.has(r.engineId));
  }

  getNeverTriggeredRules(): RuleRegistration[] {
    return Array.from(this.rules.values()).filter(r => r.triggerCount === 0 && r.status === 'active');
  }

  getRuleCoverage(): { total: number; active: number; deprecated: number; superseded: number; byCategory: Record<string, number>; byEngine: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    const byEngine: Record<string, number> = {};
    let active = 0, deprecated = 0, superseded = 0;

    for (const rule of this.rules.values()) {
      byCategory[rule.category] = (byCategory[rule.category] || 0) + 1;
      byEngine[rule.engineId] = (byEngine[rule.engineId] || 0) + 1;
      if (rule.status === 'active') active++;
      else if (rule.status === 'deprecated') deprecated++;
      else if (rule.status === 'superseded') superseded++;
    }

    return { total: this.rules.size, active, deprecated, superseded, byCategory, byEngine };
  }

  search(query: string): RuleRegistration[] {
    const q = query.toLowerCase();
    return Array.from(this.rules.values()).filter(r =>
      r.ruleId.toLowerCase().includes(q) ||
      r.ruleName.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.conditions.toLowerCase().includes(q) ||
      r.effect.toLowerCase().includes(q),
    );
  }

  getTriggerFrequency(): Array<{ ruleId: string; count: number }> {
    return Array.from(this.triggerHistory.entries())
      .map(([ruleId, count]) => ({ ruleId, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const ruleRegistry = new RuleRegistry();