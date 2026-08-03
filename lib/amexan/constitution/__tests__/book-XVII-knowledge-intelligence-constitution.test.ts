import { describe, it, expect } from 'vitest';

import {
  KNOWLEDGE_INTELLIGENCE_CONSTITUTION_VERSION,
  CR_KI_001,
  KI_001,
  KI_002,
  KI_003,
  KI_004,
  KI_005,
  KI_006,
  KI_007,
  KI_008,
  KI_009,
  KI_010,
  KI_011,
  KNOWLEDGE_INTELLIGENCE_CONSTITUTIONAL_RULES,
  getKnowledgeIntelligenceRule,
  isKnowledgeIntelligenceConstitutionalRule,
} from '../books/book-XVII-knowledge-intelligence-constitution';

import { RuleAction, RuleCategory } from '../books/book-IV-rules';

describe('Book XVII — Knowledge & Intelligence Constitution v1.0 (KI-1/CKIF)', () => {
  it('is version 1.0.0', () => {
    expect(KNOWLEDGE_INTELLIGENCE_CONSTITUTION_VERSION).toBe('1.0.0');
  });

  it('declares the supreme rule CR-KI-001', () => {
    expect(CR_KI_001.id).toBe('CR-KI-001');
    expect(CR_KI_001.explanation).toContain('assists reasoning');
    expect(CR_KI_001.explanation).toContain('never replaces it');
  });

  it('defines KI-001 through KI-011', () => {
    const ids = KNOWLEDGE_INTELLIGENCE_CONSTITUTIONAL_RULES.map(r => r.id);
    expect(ids).toContain('KI-001');
    expect(ids).toContain('KI-011');
    expect(ids).toHaveLength(12); // CR-KI-001 + KI-001..KI-011
  });

  it('orders rules by priority, highest first', () => {
    for (let i = 1; i < KNOWLEDGE_INTELLIGENCE_CONSTITUTIONAL_RULES.length; i++) {
      expect(KNOWLEDGE_INTELLIGENCE_CONSTITUTIONAL_RULES[i - 1].priority)
        .toBeGreaterThanOrEqual(KNOWLEDGE_INTELLIGENCE_CONSTITUTIONAL_RULES[i].priority);
    }
  });

  it('KI-001 pipelines raw information into structured knowledge', () => {
    expect(KI_001.action).toBe(RuleAction.CreateTask);
    expect(KI_001.name).toBe('Nothing Remains Raw Forever');
    expect(KI_001.explanation).toContain('Constitutional Processing Pipeline');
  });

  it('KI-003 makes context mandatory for reasoning', () => {
    expect(KI_003.action).toBe(RuleAction.Block);
    expect(KI_003.explanation).toContain('age, sex, pregnancy, geography');
  });

  it('KI-004 requires knowledge to explain itself', () => {
    expect(KI_004.action).toBe(RuleAction.Require);
    expect(KI_004.explanation).toContain('Why? Based on what?');
  });

  it('KI-006 treats documentation as computation', () => {
    expect(KI_006.category).toBe(RuleCategory.Documentation);
    expect(KI_006.explanation).toContain('structured knowledge');
  });

  it('KI-007 preserves evidence traceability', () => {
    expect(KI_007.action).toBe(RuleAction.Require);
    expect(KI_007.explanation).toContain('source guideline, publication, version');
  });

  it('KI-009 triggers reflection on completed cases', () => {
    expect(KI_009.conditions).toEqual([{ field: 'event', operator: 'eq', value: 'case_completed' }]);
  });

  it('looks up rules by id', () => {
    expect(getKnowledgeIntelligenceRule('KI-001')?.name).toBe('Nothing Remains Raw Forever');
    expect(getKnowledgeIntelligenceRule('NOPE')).toBeUndefined();
    expect(isKnowledgeIntelligenceConstitutionalRule('CR-KI-001')).toBe(true);
    expect(isKnowledgeIntelligenceConstitutionalRule('NOPE')).toBe(false);
  });
});
