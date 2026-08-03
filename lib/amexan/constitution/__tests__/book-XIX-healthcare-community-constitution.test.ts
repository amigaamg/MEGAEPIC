import { describe, it, expect } from 'vitest';

import {
  HEALTHCARE_COMMUNITY_CONSTITUTION_VERSION,
  CR_HC_001,
  HC_001,
  HC_002,
  HC_003,
  HC_004,
  HC_005,
  HC_006,
  HC_007,
  HC_008,
  HC_009,
  HC_010,
  HC_011,
  HC_012,
  HC_013,
  HC_014,
  HC_015,
  HEALTHCARE_COMMUNITY_CONSTITUTIONAL_RULES,
  getHealthcareCommunityRule,
  isHealthcareCommunityConstitutionalRule,
} from '../books/book-XIX-healthcare-community-constitution';

import { RuleAction, RuleCategory } from '../books/book-IV-rules';

describe('Book XIX — Healthcare Community Constitution v1.0 (HC-1/CHCF)', () => {
  it('is version 1.0.0', () => {
    expect(HEALTHCARE_COMMUNITY_CONSTITUTION_VERSION).toBe('1.0.0');
  });

  it('declares the supreme rule CR-HC-001', () => {
    expect(CR_HC_001.id).toBe('CR-HC-001');
    expect(CR_HC_001.action).toBe(RuleAction.Block);
    expect(CR_HC_001.priority).toBeGreaterThanOrEqual(100);
    expect(CR_HC_001.explanation).toContain('never optimize for engagement');
  });

  it('defines HC-001 through HC-015', () => {
    const ids = HEALTHCARE_COMMUNITY_CONSTITUTIONAL_RULES.map(r => r.id);
    expect(ids).toContain('HC-001');
    expect(ids).toContain('HC-015');
    expect(ids).toHaveLength(16); // CR-HC-001 + HC-001..HC-015
  });

  it('orders rules by priority, highest first', () => {
    for (let i = 1; i < HEALTHCARE_COMMUNITY_CONSTITUTIONAL_RULES.length; i++) {
      expect(HEALTHCARE_COMMUNITY_CONSTITUTIONAL_RULES[i - 1].priority)
        .toBeGreaterThanOrEqual(HEALTHCARE_COMMUNITY_CONSTITUTIONAL_RULES[i].priority);
    }
  });

  it('HC-001 mandates a healthcare community, not a social network', () => {
    expect(HC_001.action).toBe(RuleAction.Require);
    expect(HC_001.name).toBe('A Healthcare Community, Not a Social Network');
  });

  it('HC-002 replaces social posts with community objects', () => {
    expect(HC_002.action).toBe(RuleAction.Require);
    expect(HC_002.explanation).toContain('clinical case, journal club item');
  });

  it('HC-004 requires verified professional identity', () => {
    expect(HC_004.action).toBe(RuleAction.Require);
    expect(HC_004.explanation).toContain('never anonymous');
  });

  it('HC-010 protects patient communities', () => {
    expect(HC_010.category).toBe(RuleCategory.Privacy);
    expect(HC_010.action).toBe(RuleAction.Require);
  });

  it('CR-HC-001 blocks engagement-optimizing metrics', () => {
    expect(CR_HC_001.conditions[0]).toEqual({ field: 'metric', operator: 'in', value: ['engagement', 'time_spent', 'ad_views', 'impressions', 'dwell_time', 'scroll_depth', 'sessions_per_day'] });
    expect(CR_HC_001.explanation).toContain('Success is measured only by healthcare improvement');
  });

  it('HC-014 ties reputation to contribution, never popularity', () => {
    expect(HC_014.action).toBe(RuleAction.SetValue);
    expect(HC_014.explanation).toContain('Never through likes, followers, or popularity');
  });

  it('HC-015 escalates moderation violations', () => {
    expect(HC_015.action).toBe(RuleAction.Block);
    expect(HC_015.conditions).toEqual([{ field: 'content.report', operator: 'eq', value: 'violation' }]);
  });

  it('looks up rules by id', () => {
    expect(getHealthcareCommunityRule('HC-001')?.name).toBe('A Healthcare Community, Not a Social Network');
    expect(getHealthcareCommunityRule('NOPE')).toBeUndefined();
    expect(isHealthcareCommunityConstitutionalRule('CR-HC-001')).toBe(true);
    expect(isHealthcareCommunityConstitutionalRule('NOPE')).toBe(false);
  });
});
