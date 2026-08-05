import { describe, it, expect } from 'vitest';
import {
  OrganizationEngine,
  levelSystemFor,
  isKnownOrganizationType,
  coerceOrganizationLevel,
  DEFAULT_LEVEL_SYSTEMS,
} from '@/lib/amexan/organization/OrganizationEngine';
import {
  CONSTITUTIONAL_RULES,
  ORGANIZATION_DOMAINS,
} from '@/lib/amexan/organization/types';
import type { AmxUid } from '@/lib/amexan/constitution/types';

const ACTOR = 'amx-actor-1' as AmxUid;

const baseInput = () => ({
  name: 'Aga Khan University Hospital',
  legalName: 'Aga Khan University Hospital Ltd',
  type: 'teaching_hospital',
  ownership: 'university' as const,
  country: 'Kenya',
  county: 'Nairobi',
  city: 'Nairobi',
  level: 'level_6',
  registrationNumbers: [
    { authority: 'KMPDC', number: 'KMPDC/HS/0001', type: 'facility' as const },
    { authority: 'KRA', number: 'P051234567X', type: 'tax' as const },
  ],
  phone: '+254700000000',
  email: 'info@aku.ac.ke',
  website: 'https://hospital.aku.edu',
  mission: 'To provide compassionate, evidence-based care.',
  actorId: ACTOR,
});

describe('Facility Organization Engine — Creation', () => {
  it('builds a full constitutional model with a single identity (Rule 2)', () => {
    const model = OrganizationEngine.create(baseInput());
    expect(model.identity.officialName).toBe('Aga Khan University Hospital');
    expect(model.identity.legalName).toBe('Aga Khan University Hospital Ltd');
    expect(model.identity.aliases).toEqual([]);
    expect(model.identity.registrationNumbers).toHaveLength(2);
    expect(model.identity.ownership).toBe('university');
    expect(model.identity.isCustomType).toBe(false);
    expect(model.createdBy).toBe(ACTOR);
  });

  it('starts in draft lifecycle with pending verification status', () => {
    const model = OrganizationEngine.create(baseInput());
    expect(model.lifecycle.status).toBe('draft');
    expect(model.status).toBe('pending_verification');
  });

  it('seeds all thirteen constitutional domain containers as empty', () => {
    const model = OrganizationEngine.create(baseInput());
    const domains = Object.keys(ORGANIZATION_DOMAINS);
    expect(domains).toHaveLength(13);
    for (const domain of domains) {
      const container = model.domains[domain as keyof typeof ORGANIZATION_DOMAINS];
      expect(container.status).toBe('empty');
      expect(container.engine).toBe(ORGANIZATION_DOMAINS[domain as keyof typeof ORGANIZATION_DOMAINS]);
    }
  });

  it('records a created event in history (Principle V: time-aware)', () => {
    const model = OrganizationEngine.create(baseInput());
    expect(model.history).toHaveLength(1);
    expect(model.history[0].type).toBe('created');
    expect(model.history[0].actorId).toBe(ACTOR);
  });

  it('rejects an organization without a name', () => {
    expect(() => OrganizationEngine.create({ name: '' })).toThrow(/Validation failed/);
  });

  it('allows custom organization types — types are a registry, never hardcoded', () => {
    const model = OrganizationEngine.create({ ...baseInput(), type: 'heart_centre' });
    expect(model.identity.isCustomType).toBe(true);
    expect(model.identity.type).toBe('heart_centre');
    expect(isKnownOrganizationType('heart_centre')).toBe(false);
    expect(isKnownOrganizationType('teaching_hospital')).toBe(true);
  });

  it('defaults level from the country level system', () => {
    expect(levelSystemFor('Kenya')).toEqual(['level_2', 'level_3', 'level_4', 'level_5', 'level_6']);
    const model = OrganizationEngine.create({ ...baseInput(), level: undefined });
    expect(model.identity.level).toBe('level_4');
    expect(coerceOrganizationLevel('level_3')).toBe('level_3');
    expect(coerceOrganizationLevel('teaching')).toBe('level_1');
  });

  it('keeps the country level systems registry', () => {
    expect(DEFAULT_LEVEL_SYSTEMS.map(s => s.country)).toEqual(['Kenya', 'UK', 'USA']);
  });
});

describe('Facility Organization Engine — Lifecycle', () => {
  const registeredModel = () =>
    OrganizationEngine.register(OrganizationEngine.create({
      ...baseInput(),
      registrationNumbers: [{ authority: 'KMPDC', number: 'KMPDC/HS/0001', type: 'facility' }],
    }), ACTOR);

  it('transitions draft → registered → verified → operational', () => {
    const model = OrganizationEngine.create(baseInput());
    const reg = OrganizationEngine.register(model, ACTOR);
    expect(reg.lifecycle.status).toBe('registered');
    const ver = OrganizationEngine.verify(reg, ACTOR);
    expect(ver.lifecycle.status).toBe('verified');
    expect(ver.identity.verification.status).toBe('verified');
    expect(ver.identity.verification.verifiedBy).toBe(ACTOR);
    expect(ver.status).toBe('active');
    const op = OrganizationEngine.operationalize(ver, ACTOR);
    expect(op.lifecycle.status).toBe('operational');
  });

  it('rejects invalid lifecycle transitions', () => {
    const model = OrganizationEngine.create(baseInput());
    expect(() => OrganizationEngine.verify(model)).toThrow(/Invalid lifecycle transition draft → verified/);
    expect(() => OrganizationEngine.operationalize(registeredModel())).toThrow(/Invalid lifecycle transition/);
  });

  it('cannot verify without at least one registration number', () => {
    const model = OrganizationEngine.create({ ...baseInput(), registrationNumbers: [] });
    const reg = OrganizationEngine.register(model, ACTOR);
    expect(() => OrganizationEngine.verify(reg, ACTOR)).toThrow(/registration number/);
  });

  it('cannot close without a reason', () => {
    const model = OrganizationEngine.create(baseInput());
    expect(() => OrganizationEngine.close(model, '')).toThrow(/reason/);
  });

  it('merge records history and sets the parent organization (Principle IV)', () => {
    const model = OrganizationEngine.create(baseInput());
    const merged = OrganizationEngine.merge(model, { intoOrganizationId: 'org-mother', actorId: ACTOR });
    expect(merged.lifecycle.status).toBe('merged');
    expect(merged.identity.parentOrganizationId).toBe('org-mother');
    expect(merged.status).toBe('inactive');
    const closed = OrganizationEngine.close(model, 'Facility decommissioned', ACTOR);
    expect(closed.history.some(h => h.type === 'closed' && h.note === 'Facility decommissioned')).toBe(true);
  });
});

describe('Facility Organization Engine — Document & Tree', () => {
  it('builds a constitution-compatible persisted document', () => {
    const model = OrganizationEngine.operationalize(
      OrganizationEngine.verify(
        OrganizationEngine.register(OrganizationEngine.create(baseInput()), ACTOR),
        ACTOR,
      ),
      ACTOR,
    );
    const doc = OrganizationEngine.buildDocument(model, { phone: '+254700000000', email: 'info@aku.ac.ke', ownedBy: ACTOR, pricingTier: 'enterprise' });
    expect(doc.name).toBe('Aga Khan University Hospital');
    expect(doc.type).toBe('teaching_hospital');
    expect(doc.registrationNumber).toBe('KMPDC/HS/0001');
    expect(doc.taxId).toBe('P051234567X');
    expect(doc.status).toBe('active');
    expect(doc.verified).toBe(true);
    expect(doc.verifiedBy).toBe(ACTOR);
    expect(doc.ownedBy).toBe(ACTOR);
    expect(doc.pricingTier).toBe('enterprise');
    expect(doc.config?.branding.primaryColor).toBe('#2F80ED');
    expect(doc.license?.issuingAuthority).toBe('KMPDC');
  });

  it('coerces engine types onto the constitution union', () => {
    const hospital = OrganizationEngine.create({ ...baseInput(), type: 'county_hospital' });
    expect(OrganizationEngine.buildDocument(hospital).type).toBe('hospital');
    const lab = OrganizationEngine.create({ ...baseInput(), type: 'laboratory' });
    expect(OrganizationEngine.buildDocument(lab).type).toBe('laboratory');
  });

  it('builds a recursive tree with validated parents (Rule 3)', () => {
    let model = OrganizationEngine.create(baseInput());
    model = OrganizationEngine.addTreeNode(model, 'campuses', { name: 'Main Campus' });
    const campus = model.tree.campuses[0];
    model = OrganizationEngine.addTreeNode(model, 'facilities', { name: 'University Hospital', parentId: campus.id });
    const facility = model.tree.facilities[0];
    model = OrganizationEngine.addTreeNode(model, 'buildings', { name: 'Block A', parentId: facility.id });
    model = OrganizationEngine.addTreeNode(model, 'departments', { name: 'Surgery', parentId: model.tree.buildings[0].id });
    expect(model.tree.departments[0].name).toBe('Surgery');
    expect(() =>
      OrganizationEngine.addTreeNode(model, 'departments', { name: 'Ghost', parentId: 'no-such-building' }),
    ).toThrow(/Rule 3/);
  });

  it('cannot hang a child under a non-parent category', () => {
    const model = OrganizationEngine.create(baseInput());
    expect(() =>
      OrganizationEngine.addTreeNode(model, 'campuses', { name: 'Bad', parentId: 'x' }),
    ).toThrow(/does not accept a parent/);
  });
});

describe('Facility Organization Engine — Constitutional Rules', () => {
  it('exposes the ten constitutional rules', () => {
    expect(CONSTITUTIONAL_RULES).toHaveLength(10);
    expect(CONSTITUTIONAL_RULES[0].name).toBe('Organization Before Users');
    expect(CONSTITUTIONAL_RULES[9].name).toBe('Universal Containment');
  });

  it('reports a compliant model as clean', () => {
    let model = OrganizationEngine.create({ ...baseInput(), id: undefined });
    model = { ...model, id: 'org-1', tree: { ...model.tree, organizationId: 'org-1' } };
    expect(OrganizationEngine.checkConstitutionalRules(model)).toEqual([]);
  });

  it('detects orphan tree entities (Rule 3 / Rule 10 violations)', () => {
    let model = OrganizationEngine.create(baseInput());
    model = { ...model, id: 'org-1', tree: { ...model.tree, organizationId: 'org-1' } };
    model = {
      ...model,
      tree: {
        ...model.tree,
        units: [
          ...model.tree.units,
          { id: 'unit-orphan', name: 'ICU', parentId: 'ghost-parent', status: 'active', createdAt: Date.now() },
        ],
      },
    };
    const violations = OrganizationEngine.checkConstitutionalRules(model);
    expect(violations.some(v => v.includes('Rule 3'))).toBe(true);
  });
});
