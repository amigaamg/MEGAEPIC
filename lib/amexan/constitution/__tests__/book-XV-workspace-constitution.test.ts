import { describe, it, expect } from 'vitest';

import {
  WORKSPACE_CONSTITUTION_VERSION,
  CR_WS_001,
  WS_001,
  WS_002,
  WS_003,
  WS_004,
  WS_005,
  WS_006,
  WS_007,
  WS_008,
  WS_009,
  WS_010,
  WORKSPACE_CONSTITUTIONAL_RULES,
  getWorkspaceRule,
  isWorkspaceConstitutionalRule,
} from '../books/book-XV-workspace-constitution';

import { RuleAction, RuleCategory } from '../books/book-IV-rules';

describe('Book XV — Workspace Resolution Constitution v1.0', () => {
  it('is version 1.0.0', () => {
    expect(WORKSPACE_CONSTITUTION_VERSION).toBe('1.0.0');
  });

  it('declares the supreme rule CR-WS-001', () => {
    expect(CR_WS_001.id).toBe('CR-WS-001');
    expect(CR_WS_001.action).toBe(RuleAction.Block);
    expect(CR_WS_001.priority).toBeGreaterThanOrEqual(100);
    expect(CR_WS_001.explanation).toContain('shall ever land on a dashboard');
  });

  it('defines WS-001 through WS-010', () => {
    const ids = WORKSPACE_CONSTITUTIONAL_RULES.map(r => r.id);
    expect(ids).toContain('WS-001');
    expect(ids).toContain('WS-010');
    expect(ids).toHaveLength(11); // CR-WS-001 + WS-001..WS-010
  });

  it('orders rules by priority, highest first', () => {
    for (let i = 1; i < WORKSPACE_CONSTITUTIONAL_RULES.length; i++) {
      expect(WORKSPACE_CONSTITUTIONAL_RULES[i - 1].priority)
        .toBeGreaterThanOrEqual(WORKSPACE_CONSTITUTIONAL_RULES[i].priority);
    }
  });

  it('enforces the dependency order WS-003 → WS-004 → WS-005', () => {
    const rank = (id: string) => WORKSPACE_CONSTITUTIONAL_RULES.findIndex(r => r.id === id);
    expect(rank('WS-003')).toBeLessThan(rank('WS-004'));
    expect(rank('WS-004')).toBeLessThan(rank('WS-005'));
  });

  it('WS-002 launches onboarding on incomplete workspace', () => {
    expect(WS_002.action).toBe(RuleAction.CreateTask);
    expect(WS_002.conditions).toEqual([{ field: 'workspace.complete', operator: 'eq', value: false }]);
  });

  it('WS-006/007/008 chain assignment → dashboard → navigation → permissions', () => {
    expect(WS_006.action).toBe(RuleAction.SetValue);
    expect(WS_007.action).toBe(RuleAction.SetValue);
    expect(WS_008.action).toBe(RuleAction.SetValue);
    expect(WS_008.explanation).toContain('constrains the permissions');
  });

  it('WS-010 allows switching without re-authentication', () => {
    expect(WS_010.action).toBe(RuleAction.Allow);
    expect(WS_010.conditions).toEqual([{ field: 'event', operator: 'eq', value: 'workspace_switch' }]);
  });

  it('every rule is a workflow/security/UI constitutional rule', () => {
    for (const rule of WORKSPACE_CONSTITUTIONAL_RULES) {
      expect([RuleCategory.Workflow, RuleCategory.Security, RuleCategory.UI]).toContain(rule.category);
    }
  });

  it('looks up rules by id', () => {
    expect(getWorkspaceRule('WS-001')?.name).toBe('Dashboard Requires Resolved Workspace');
    expect(getWorkspaceRule('NOPE')).toBeUndefined();
    expect(isWorkspaceConstitutionalRule('CR-WS-001')).toBe(true);
    expect(isWorkspaceConstitutionalRule('NOPE')).toBe(false);
  });
});
