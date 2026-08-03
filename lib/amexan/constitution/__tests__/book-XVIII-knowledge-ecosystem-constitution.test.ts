import { describe, it, expect } from 'vitest';

import {
  KNOWLEDGE_ECOSYSTEM_CONSTITUTION_VERSION,
  CR_KE_001,
  KE_001,
  KE_002,
  KE_003,
  KE_004,
  KE_005,
  KE_006,
  KE_007,
  KE_008,
  KE_009,
  KE_010,
  KE_011,
  KE_012,
  KNOWLEDGE_ECOSYSTEM_CONSTITUTIONAL_RULES,
  getKnowledgeEcosystemRule,
  isKnowledgeEcosystemConstitutionalRule,
} from '../books/book-XVIII-knowledge-ecosystem-constitution';

import { RuleAction, RuleCategory } from '../books/book-IV-rules';

describe('Book XVIII — Knowledge Ecosystem Constitution v1.0 (KE-1/CKEF)', () => {
  it('is version 1.0.0', () => {
    expect(KNOWLEDGE_ECOSYSTEM_CONSTITUTION_VERSION).toBe('1.0.0');
  });

  it('declares the supreme rule CR-KE-001', () => {
    expect(CR_KE_001.id).toBe('CR-KE-001');
    expect(CR_KE_001.action).toBe(RuleAction.Block);
    expect(CR_KE_001.priority).toBeGreaterThanOrEqual(100);
    expect(CR_KE_001.explanation).toContain('provenance');
  });

  it('defines KE-001 through KE-012', () => {
    const ids = KNOWLEDGE_ECOSYSTEM_CONSTITUTIONAL_RULES.map(r => r.id);
    expect(ids).toContain('KE-001');
    expect(ids).toContain('KE-012');
    expect(ids).toHaveLength(13); // CR-KE-001 + KE-001..KE-012
  });

  it('orders rules by priority, highest first', () => {
    for (let i = 1; i < KNOWLEDGE_ECOSYSTEM_CONSTITUTIONAL_RULES.length; i++) {
      expect(KNOWLEDGE_ECOSYSTEM_CONSTITUTIONAL_RULES[i - 1].priority)
        .toBeGreaterThanOrEqual(KNOWLEDGE_ECOSYSTEM_CONSTITUTIONAL_RULES[i].priority);
    }
  });

  it('KE-001 declares knowledge as a living organizational asset', () => {
    expect(KE_001.action).toBe(RuleAction.CreateTask);
    expect(KE_001.name).toBe('Knowledge Is a Living Organizational Asset');
  });

  it('KE-002 transforms isolated resources into usable knowledge', () => {
    expect(KE_002.conditions).toEqual([{ field: 'resource.format', operator: 'in', value: ['pdf', 'docx', 'pptx', 'email', 'folder'] }]);
  });

  it('KE-003 grants every department a living knowledge base', () => {
    expect(KE_003.action).toBe(RuleAction.Require);
    expect(KE_003.explanation).toContain('Living Knowledge Base');
  });

  it('KE-005 layers guidelines without duplication', () => {
    expect(KE_005.action).toBe(RuleAction.Require);
    expect(KE_005.explanation).toContain('inheritance');
  });

  it('KE-007 adapts patient education', () => {
    expect(KE_007.conditions).toEqual([{ field: 'patient', operator: 'exists', value: true }]);
  });

  it('KE-008 creates education journeys for chronic disease', () => {
    expect(KE_008.conditions).toEqual([{ field: 'diagnosis', operator: 'in', value: ['diabetes', 'hypertension', 'asthma', 'copd', 'heart_failure', 'ckd', 'cancer', 'hiv', 'tuberculosis'] }]);
  });

  it('CR-KE-001 blocks knowledge outputs lacking provenance', () => {
    expect(CR_KE_001.conditions[0]).toEqual({ field: 'output.type', operator: 'in', value: ['guideline', 'educational_material', 'summary', 'poster', 'brochure', 'visualization'] });
    expect(CR_KE_001.conditions[1]).toEqual({ field: 'output.provenance', operator: 'not_exists', value: true });
  });

  it('looks up rules by id', () => {
    expect(getKnowledgeEcosystemRule('KE-001')?.name).toBe('Knowledge Is a Living Organizational Asset');
    expect(getKnowledgeEcosystemRule('NOPE')).toBeUndefined();
    expect(isKnowledgeEcosystemConstitutionalRule('CR-KE-001')).toBe(true);
    expect(isKnowledgeEcosystemConstitutionalRule('NOPE')).toBe(false);
  });
});
