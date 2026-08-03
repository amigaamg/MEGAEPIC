import { describe, it, expect } from 'vitest';

import {
  CORE_CONSTITUTION_VERSION,
  CONSTITUTIONAL_DOMAINS,
  CONSTITUTIONAL_ENGINES,
  CONSTITUTIONAL_LIFECYCLES,
  GOLDEN_RULES,
  DEPENDENCY_PYRAMID,
  EXTENSION_POINTS,
  CONSTITUTIONAL_OATH,
  ConstitutionalEngine,
  ConstitutionalDomain,
  LifecycleSubject,
  ExtensionPoint,
  RelationshipCategory,
  assertObjectConstitutional,
  assertExtensionConforms,
  getEngineDomain,
  getLifecycleStates,
  isSupportedRuleCategory,
  isRelationshipCategory,
} from '../books/book-I-core-constitution';

import { ObjectType } from '../books/book-I-objects';

describe('Book I — Core Constitution v1.0', () => {
  it('is version 1.0.0', () => {
    expect(CORE_CONSTITUTION_VERSION).toBe('1.0.0');
  });

  it('declares the oath', () => {
    expect(CONSTITUTIONAL_OATH.length).toBeGreaterThan(0);
    expect(CONSTITUTIONAL_OATH).toContain('preserve the Constitution');
  });

  it('defines 20 constitutional domains', () => {
    expect(CONSTITUTIONAL_DOMAINS.length).toBeGreaterThanOrEqual(20);
    expect(CONSTITUTIONAL_DOMAINS).toContain(ConstitutionalDomain.Identity);
    expect(CONSTITUTIONAL_DOMAINS).toContain(ConstitutionalDomain.Presentation);
  });

  it('defines the 24 core constitutional engines', () => {
    expect(CONSTITUTIONAL_ENGINES.length).toBeGreaterThanOrEqual(24);
    expect(CONSTITUTIONAL_ENGINES).toContain(ConstitutionalEngine.IdentityEngine);
    expect(CONSTITUTIONAL_ENGINES).toContain(ConstitutionalEngine.ReasoningEngine);
    expect(CONSTITUTIONAL_ENGINES).toContain(ConstitutionalEngine.ExperienceEngine);
  });

  it('maps every engine to exactly one domain', () => {
    for (const engine of CONSTITUTIONAL_ENGINES) {
      expect(getEngineDomain(engine)).toBeDefined();
    }
    expect(getEngineDomain(ConstitutionalEngine.ReasoningEngine)).toBe(ConstitutionalDomain.Clinical);
  });

  it('defines constitutional lifecycles for every subject', () => {
    for (const subject of Object.values(LifecycleSubject)) {
      const lifecycle = CONSTITUTIONAL_LIFECYCLES[subject as LifecycleSubject];
      expect(lifecycle).toBeDefined();
      expect(lifecycle.states.length).toBeGreaterThan(0);
    }
    expect(getLifecycleStates(LifecycleSubject.Patient)).toContain('discharged');
    expect(getLifecycleStates(LifecycleSubject.Organization)).toContain('activated');
  });

  it('enforces the golden rules', () => {
    expect(GOLDEN_RULES.length).toBeGreaterThanOrEqual(15);
  });

  it('fixes the dependency pyramid order forever', () => {
    expect(DEPENDENCY_PYRAMID[0]).toBe('Core Constitution');
    expect(DEPENDENCY_PYRAMID).toContain('Engines');
    expect(DEPENDENCY_PYRAMID).toContain('Experience');
    expect(DEPENDENCY_PYRAMID[DEPENDENCY_PYRAMID.length - 1]).toBe('Future Technologies');
  });

  it('exposes the extension framework points', () => {
    expect(EXTENSION_POINTS.length).toBeGreaterThanOrEqual(18);
    expect(EXTENSION_POINTS).toContain(ExtensionPoint.FutureTechnologies);
  });

  it('validates a constitutional object', () => {
    const valid = assertObjectConstitutional({
      id: 'amx:encounter:1',
      name: 'Test Encounter',
      owner: ConstitutionalEngine.ReasoningEngine,
      domain: ConstitutionalDomain.Clinical,
      objectType: ObjectType.Encounter,
      lifecycle: 'opened',
      relationships: [],
      events: { emits: [], consumes: [] },
      permissions: [],
      version: 1,
      telemetry: true,
    });
    expect(valid.conforms).toBe(true);
    expect(valid.violations).toEqual([]);
  });

  it('rejects a non-constitutional object', () => {
    const invalid = assertObjectConstitutional({
      id: '',
      name: '',
      owner: 'some-component',
      domain: 'not_a_domain' as ConstitutionalDomain,
      objectType: ObjectType.Encounter,
      lifecycle: '',
      relationships: [],
      events: { emits: [], consumes: [] },
      permissions: [],
      version: 0,
      telemetry: false,
    });
    expect(invalid.conforms).toBe(false);
    expect(invalid.violations.length).toBeGreaterThan(0);
  });

  it('validates extensions against known extension points', () => {
    const valid = assertExtensionConforms({
      id: 'ext:kenya-package',
      name: 'Kenya Package',
      extensionPoint: ExtensionPoint.NewCountries,
      conformsTo: CORE_CONSTITUTION_VERSION,
      version: '1.0.0',
      owner: 'amx:governance',
    });
    expect(valid.conforms).toBe(true);

    const invalid = assertExtensionConforms({
      id: 'ext:bad',
      name: 'Bad',
      extensionPoint: 'not_an_extension_point' as ExtensionPoint,
      conformsTo: '1.0.0',
      version: '1.0.0',
      owner: 'amx:governance',
    });
    expect(invalid.conforms).toBe(false);
  });

  it('supports all constitutional rule categories', () => {
    expect(isSupportedRuleCategory('clinical')).toBe(true);
    expect(isSupportedRuleCategory('experience')).toBe(true);
    expect(isSupportedRuleCategory('unknown' as Parameters<typeof isSupportedRuleCategory>[0])).toBe(false);
  });

  it('recognises the constitutional relationship categories', () => {
    expect(isRelationshipCategory(RelationshipCategory.Owns)).toBe(true);
    expect(isRelationshipCategory(RelationshipCategory.Supersedes)).toBe(true);
    expect(isRelationshipCategory('unknown' as RelationshipCategory)).toBe(false);
  });
});
