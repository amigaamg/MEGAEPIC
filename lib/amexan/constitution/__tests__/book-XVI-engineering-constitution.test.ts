import { describe, it, expect } from 'vitest';

import {
  SOFTWARE_ENGINEERING_CONSTITUTION_VERSION,
  CR_SC_001,
  SC_001,
  SC_002,
  SC_003,
  SC_004,
  SC_005,
  SC_006,
  SC_007,
  SC_008,
  SC_009,
  SC_010,
  SC_011,
  SC_012,
  SC_013,
  SC_014,
  SC_015,
  SOFTWARE_ENGINEERING_CONSTITUTIONAL_RULES,
  getSoftwareEngineeringRule,
  isSoftwareEngineeringConstitutionalRule,
} from '../books/book-XVI-engineering-constitution';

import { RuleAction, RuleCategory } from '../books/book-IV-rules';

describe('Book XVI — Software Engineering Constitution v1.0 (SC-1/CSEF)', () => {
  it('is version 1.0.0', () => {
    expect(SOFTWARE_ENGINEERING_CONSTITUTION_VERSION).toBe('1.0.0');
  });

  it('declares the supreme rule CR-SC-001', () => {
    expect(CR_SC_001.id).toBe('CR-SC-001');
    expect(CR_SC_001.action).toBe(RuleAction.Block);
    expect(CR_SC_001.priority).toBeGreaterThanOrEqual(100);
    expect(CR_SC_001.explanation).toContain('untrusted presentation layer');
  });

  it('defines SC-001 through SC-015', () => {
    const ids = SOFTWARE_ENGINEERING_CONSTITUTIONAL_RULES.map(r => r.id);
    expect(ids).toContain('SC-001');
    expect(ids).toContain('SC-015');
    expect(ids).toHaveLength(16); // CR-SC-001 + SC-001..SC-015
  });

  it('orders rules by priority, highest first', () => {
    for (let i = 1; i < SOFTWARE_ENGINEERING_CONSTITUTIONAL_RULES.length; i++) {
      expect(SOFTWARE_ENGINEERING_CONSTITUTIONAL_RULES[i - 1].priority)
        .toBeGreaterThanOrEqual(SOFTWARE_ENGINEERING_CONSTITUTIONAL_RULES[i].priority);
    }
  });

  it('CR-SC-001 blocks sensitive logic in the presentation layer', () => {
    expect(CR_SC_001.conditions).toEqual([
      { field: 'layer', operator: 'eq', value: 'presentation' },
      { field: 'logic', operator: 'in', value: ['permission', 'pricing', 'rules', 'clinical_decision', 'role_decision', 'token', 'secret', 'business_logic'] },
    ]);
    expect(CR_SC_001.explanation).toContain('obfuscation creates a false sense of security');
  });

  it('SC-004 blocks private imports', () => {
    expect(SC_004.action).toBe(RuleAction.Block);
    expect(SC_004.category).toBe(RuleCategory.Security);
  });

  it('SC-009 bans shared chaos folders', () => {
    expect(SC_009.action).toBe(RuleAction.Block);
    expect(SC_009.conditions).toEqual([{ field: 'path', operator: 'matches', value: '^(helpers|utils|misc|shared|common)/' }]);
  });

  it('SC-011 requires tests before merge', () => {
    expect(SC_011.conditions).toEqual([{ field: 'event', operator: 'eq', value: 'merge' }]);
    expect(SC_011.explanation).toContain('cannot merge');
    expect(SC_011.explanation).toContain('No exceptions');
  });

  it('SC-012 mandates design tokens as single source of truth', () => {
    expect(SC_012.category).toBe(RuleCategory.UI);
    expect(SC_012.name).toBe('Design Tokens Are the Single Source of Truth');
  });

  it('every rule is a governance-relevant constitutional rule', () => {
    for (const rule of SOFTWARE_ENGINEERING_CONSTITUTIONAL_RULES) {
      expect([RuleCategory.Workflow, RuleCategory.Security, RuleCategory.UI, RuleCategory.Audit]).toContain(rule.category);
    }
  });

  it('looks up rules by id', () => {
    expect(getSoftwareEngineeringRule('SC-001')?.name).toBe('Bounded Contribution');
    expect(getSoftwareEngineeringRule('NOPE')).toBeUndefined();
    expect(isSoftwareEngineeringConstitutionalRule('CR-SC-001')).toBe(true);
    expect(isSoftwareEngineeringConstitutionalRule('NOPE')).toBe(false);
  });
});
