// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Facility Organization Engine (Book: Facility Organization Ecosystem)
//
// The constitutional engine responsible for creating, governing, evolving,
// validating, and digitally representing every healthcare organization inside
// AMEXAN throughout its entire lifetime.
//
//   It is NOT an EMR. It is NOT HMIS. It is the soil upon which EMR and HMIS grow.
//   It answers only one question: "What is this healthcare organization?"
//
// Constitutional principles:
//   I.   Organization Before Users      — organizations own users, never the reverse
//   II.  Organizations are Living Systems — identity, purpose, structure, knowledge,
//        communication, growth — never a bare name/address/phone row
//   III. Organizations are Recursive   — a hospital contains hospitals; every node
//        behaves like a miniature organization under the same constitutional rules
//   IV.  Organization ≠ Facility       — one organization (e.g. a university) owns
//        many facilities (hospitals, schools, institutes, laboratories)
//   V.   Organizations are Time-aware  — the engine preserves full history forever
//
// This engine is a pure, deterministic constitutional model. It does NOT read or
// write Firestore itself (persistence is an explicit, opt-in step). It is the
// conductor's first instrument: provisioning.ts calls OrganizationEngine.create()
// and then orchestrates the remaining engines.
// ═══════════════════════════════════════════════════════════════════════════════

import type {
  AmxUid,
  Organization,
  OrganizationConfig,
  OrganizationLicense,
  OrganizationLevel,
  OrganizationType,
  PricingTier,
} from '@/lib/amexan/constitution/types';
import {
  type ConstitutionalDomain,
  type CreateOrganizationInput,
  type OrganizationDomainContainer,
  type OrganizationGeography,
  type OrganizationHistoryEvent,
  type OrganizationHistoryEventType,
  type OrganizationIdentity,
  type OrganizationLifecycleStatus,
  type OrganizationMetadata,
  type OrganizationModel,
  type OrganizationTree,
  type OwnershipModel,
  type RegistrationNumber,
  type TreeEntityNode,
  type VerificationStatus,
  CONSTITUTIONAL_RULES,
  ORGANIZATION_DOMAINS,
  ORGANIZATION_LIFECYCLE,
  OWNERSHIP_MODELS,
} from './types';

// ── Registries (Rule: no hardcoding of types — a registry, not a switch) ──────

/** Standard organization types the engine understands. Custom types inherit. */
export const STANDARD_ORGANIZATION_TYPES: readonly string[] = [
  'national_ministry', 'county_ministry', 'referral_network', 'teaching_university',
  'teaching_hospital', 'general_hospital', 'private_hospital', 'mission_hospital',
  'military_hospital', 'county_hospital', 'health_centre', 'clinic', 'dispensary',
  'diagnostic_centre', 'imaging_centre', 'laboratory', 'blood_bank', 'dialysis_centre',
  'dental_centre', 'mental_health_centre', 'ngo', 'insurance_company',
  'research_institute', 'telemedicine_network', 'mobile_clinic', 'other',
] as const;

/** Country-aware facility levels. The country decides; the engine stores all. */
export interface LevelSystem {
  country: string;
  levels: readonly string[];
}

export const DEFAULT_LEVEL_SYSTEMS: readonly LevelSystem[] = [
  { country: 'Kenya', levels: ['level_2', 'level_3', 'level_4', 'level_5', 'level_6'] },
  { country: 'UK', levels: ['primary_care', 'district', 'regional', 'teaching'] },
  { country: 'USA', levels: ['clinic', 'community_hospital', 'regional_medical_center', 'academic_medical_center'] },
];

const CONSTITUTION_TYPE_VALUES: readonly OrganizationType[] = [
  'hospital', 'clinic', 'specialist_center', 'telemedicine', 'teaching_hospital',
  'research_institute', 'university', 'pharmacy', 'laboratory', 'radiology_center',
  'blood_bank', 'ambulance_service', 'home_care', 'nursing_home', 'hospice',
  'rehabilitation_center', 'mental_health_facility', 'insurance_company', 'ngo',
  'government', 'regulatory_body', 'medical_supplier', 'individual_practice', 'other',
];

/** Engine type → persisted constitution OrganizationType. */
const TYPE_COERCION: Readonly<Record<string, OrganizationType>> = {
  national_ministry: 'government',
  county_ministry: 'government',
  referral_network: 'other',
  teaching_university: 'university',
  teaching_hospital: 'teaching_hospital',
  general_hospital: 'hospital',
  private_hospital: 'hospital',
  mission_hospital: 'hospital',
  military_hospital: 'hospital',
  county_hospital: 'hospital',
  health_centre: 'clinic',
  clinic: 'clinic',
  dispensary: 'clinic',
  diagnostic_centre: 'other',
  imaging_centre: 'radiology_center',
  laboratory: 'laboratory',
  blood_bank: 'blood_bank',
  dialysis_centre: 'specialist_center',
  dental_centre: 'specialist_center',
  mental_health_centre: 'mental_health_facility',
  ngo: 'ngo',
  insurance_company: 'insurance_company',
  research_institute: 'research_institute',
  telemedicine_network: 'telemedicine',
  mobile_clinic: 'other',
  other: 'other',
};

// ── Small pure helpers ─────────────────────────────────────────────────────────

export function levelSystemFor(country: string): readonly string[] {
  const system = DEFAULT_LEVEL_SYSTEMS.find(s => s.country.toLowerCase() === country.trim().toLowerCase());
  return system ? system.levels : [];
}

export function isKnownOrganizationType(type: string): boolean {
  return (STANDARD_ORGANIZATION_TYPES as readonly string[]).includes(type) || (CONSTITUTION_TYPE_VALUES as readonly string[]).includes(type as OrganizationType);
}

export function coerceOrganizationType(type: string): OrganizationType {
  if (TYPE_COERCION[type]) return TYPE_COERCION[type];
  if ((CONSTITUTION_TYPE_VALUES as readonly string[]).includes(type as OrganizationType)) return type as OrganizationType;
  return 'other';
}

export function coerceOrganizationLevel(level: string): OrganizationLevel {
  return /^level_[1-6]$/.test(level) ? (level as OrganizationLevel) : 'level_1';
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── The Engine ────────────────────────────────────────────────────────────────

export class OrganizationEngine {
  // ── Validation ───────────────────────────────────────────────────────────────

  static validate(input: CreateOrganizationInput): string[] {
    const errors: string[] = [];
    const name = (input.name ?? '').trim();
    if (!name) errors.push('Organization name is required (Rule 2: a single constitutional identity needs a name)');
    else if (name.length < 2) errors.push('Organization name must be at least 2 characters');

    if (input.ownership && !(OWNERSHIP_MODELS as readonly OwnershipModel[]).includes(input.ownership)) {
      errors.push(`Unknown ownership model: ${input.ownership}`);
    }
    if (input.languages !== undefined && input.languages.length === 0) {
      errors.push('languages cannot be an empty array');
    }
    if (input.coordinates && (Number.isNaN(input.coordinates.lat) || Number.isNaN(input.coordinates.lng))) {
      errors.push('coordinates must contain numeric lat/lng');
    }
    const regs = input.registrationNumbers ?? [];
    const seen = new Set<string>();
    for (const r of regs) {
      const key = `${r.authority}:${r.type}:${r.number}`;
      if (seen.has(key)) errors.push(`Duplicate registration number: ${r.number}`);
      seen.add(key);
    }
    return errors;
  }

  // ── Creation (Principle II: living system, not a bare row) ──────────────────

  static create(input: CreateOrganizationInput): OrganizationModel {
    const errors = OrganizationEngine.validate(input);
    if (errors.length > 0) {
      throw new Error(`[OrganizationEngine] Validation failed: ${errors.join('; ')}`);
    }

    const now = Date.now();
    const name = input.name.trim();
    const country = (input.country ?? '').trim();
    const level = (input.level ?? '').trim() || defaultLevelFor(country);
    const type = (input.type ?? 'general_hospital').trim();
    const isCustomType = !isKnownOrganizationType(type);
    const actorId = input.actorId;

    const identity: OrganizationIdentity = {
      officialName: name,
      legalName: (input.legalName ?? name).trim(),
      shortName: input.shortName?.trim(),
      aliases: (input.aliases ?? []).map(a => a.trim()).filter(Boolean),
      registrationNumbers: (input.registrationNumbers ?? []),
      type,
      isCustomType,
      ownership: input.ownership ?? 'private',
      level,
      parentOrganizationId: input.parentOrganizationId,
      coordinates: input.coordinates,
      verification: {
        status: 'unverified',
        documents: [],
      },
      createdAt: now,
    };

    const geography: OrganizationGeography = {
      country,
      province: input.province?.trim(),
      county: input.county?.trim(),
      district: input.district?.trim(),
      city: input.city?.trim(),
    };

    const metadata = OrganizationEngine.buildMetadata(input);

    const domains = OrganizationEngine.emptyDomains(now);

    const tree: OrganizationTree = {
      organizationId: '',
      campuses: [],
      facilities: [],
      buildings: [],
      departments: [],
      units: [],
      services: [],
      teams: [],
      workspaces: [],
    };

    const history: OrganizationHistoryEvent[] = [{
      at: now,
      type: 'created',
      actorId,
      note: `Organization "${name}" created as ${type} (${identity.ownership})`,
    }];

    return {
      identity,
      geography,
      metadata,
      domains,
      tree,
      facilities: [],
      campuses: [],
      branches: [],
      buildings: [],
      floors: [],
      history,
      lifecycle: { status: 'draft', enteredAt: now },
      status: 'pending_verification',
      createdAt: now,
      updatedAt: now,
      createdBy: actorId,
    };
  }

  static buildMetadata(input: CreateOrganizationInput): OrganizationMetadata {
    const timezone =
      input.timezone ||
      (input.country?.toLowerCase() === 'kenya' ? 'Africa/Nairobi' : 'UTC');
    const languages = input.languages ?? [];
    return {
      mission: input.mission?.trim(),
      vision: input.vision?.trim(),
      coreValues: (input.coreValues ?? []).map(v => v.trim()).filter(Boolean),
      tagline: input.tagline?.trim(),
      website: input.website?.trim(),
      socials: (input.socials ?? []).map(s => s.trim()).filter(Boolean),
      languages: languages.length ? languages : ['en'],
      timezone,
      businessHours: input.businessHours ?? {
        monday: '08:00-17:00', tuesday: '08:00-17:00', wednesday: '08:00-17:00',
        thursday: '08:00-17:00', friday: '08:00-17:00', saturday: '09:00-13:00',
      },
      emergencyContacts: input.emergencyContacts ?? [],
      publicInformation: {
        isPublic: false,
        foundedYear: input.foundedYear,
      },
    };
  }

  /** The thirteen constitutional domain containers, all empty until populated. */
  static emptyDomains(now: number): Record<ConstitutionalDomain, OrganizationDomainContainer> {
    const domains = {} as Record<ConstitutionalDomain, OrganizationDomainContainer>;
    (Object.keys(ORGANIZATION_DOMAINS) as ConstitutionalDomain[]).forEach(domain => {
      domains[domain] = {
        domain,
        status: 'empty',
        engine: ORGANIZATION_DOMAINS[domain],
        createdAt: now,
        updatedAt: now,
      };
    });
    return domains;
  }

  // ── Lifecycle (Principle V: time-aware, never disappears) ───────────────────

  private static transition(
    model: OrganizationModel,
    to: OrganizationLifecycleStatus,
    opts: { actorId?: AmxUid; note?: string; reason?: string } = {},
  ): OrganizationModel {
    const from = model.lifecycle.status;
    const allowed = ORGANIZATION_LIFECYCLE[from];
    if (!(allowed as readonly OrganizationLifecycleStatus[]).includes(to)) {
      throw new Error(`[OrganizationEngine] Invalid lifecycle transition ${from} → ${to}`);
    }
    OrganizationEngine.guardTransition(model, to, opts.reason);

    const eventType: OrganizationHistoryEventType =
      to === 'registered' ? 'registered' :
      to === 'verified' ? 'verified' :
      to === 'merged' ? 'merged' :
      to === 'archived' ? 'archived' :
      to === 'closed' ? 'closed' :
      'status_changed';

    const now = Date.now();
    return {
      ...model,
      lifecycle: { status: to, enteredAt: now },
      status: lifecycleToConstitutionStatus(to),
      history: [
        ...model.history,
        {
          at: now,
          type: eventType,
          actorId: opts.actorId,
          from,
          to,
          note: opts.note ?? (to === 'closed' ? opts.reason : undefined),
        },
      ],
      updatedAt: now,
    };
  }

  private static guardTransition(model: OrganizationModel, to: OrganizationLifecycleStatus, reason?: string): void {
    const identity = model.identity;
    if (to === 'registered' && !identity.officialName) {
      throw new Error('[OrganizationEngine] Cannot register: identity name missing (Rule 2)');
    }
    if (to === 'verified' && identity.verification.status === 'verified') {
      return; // idempotent
    }
    if (to === 'verified' && identity.registrationNumbers.length === 0) {
      throw new Error('[OrganizationEngine] Cannot verify: at least one registration number is required');
    }
    if (to === 'operational' && model.lifecycle.status !== 'verified') {
      throw new Error('[OrganizationEngine] Cannot operationalize: organization must be verified first');
    }
    if (to === 'closed' && !reason) {
      throw new Error('[OrganizationEngine] Cannot close: a reason is required');
    }
  }

  static register(model: OrganizationModel, actorId?: AmxUid): OrganizationModel {
    return OrganizationEngine.transition(model, 'registered', { actorId });
  }

  static verify(model: OrganizationModel, actorId?: AmxUid): OrganizationModel {
    const verified = OrganizationEngine.transition(model, 'verified', { actorId });
    const now = Date.now();
    return {
      ...verified,
      identity: {
        ...verified.identity,
        verification: {
          ...verified.identity.verification,
          status: 'verified',
          verifiedAt: now,
          verifiedBy: actorId,
        },
      },
    };
  }

  static operationalize(model: OrganizationModel, actorId?: AmxUid): OrganizationModel {
    return OrganizationEngine.transition(model, 'operational', { actorId });
  }

  static expand(model: OrganizationModel, actorId?: AmxUid): OrganizationModel {
    return OrganizationEngine.transition(model, 'expanding', { actorId });
  }

  static merge(model: OrganizationModel, opts: { intoOrganizationId?: string; actorId?: AmxUid; note?: string } = {}): OrganizationModel {
    const merged = OrganizationEngine.transition(model, 'merged', {
      actorId: opts.actorId,
      note: opts.note ?? (opts.intoOrganizationId ? `Merged into ${opts.intoOrganizationId}` : 'Merged'),
    });
    return {
      ...merged,
      identity: {
        ...merged.identity,
        parentOrganizationId: opts.intoOrganizationId ? opts.intoOrganizationId as AmxUid : merged.identity.parentOrganizationId,
      },
    };
  }

  static archive(model: OrganizationModel, note?: string, actorId?: AmxUid): OrganizationModel {
    return OrganizationEngine.transition(model, 'archived', { actorId, note });
  }

  static close(model: OrganizationModel, reason: string, actorId?: AmxUid): OrganizationModel {
    return OrganizationEngine.transition(model, 'closed', { actorId, reason, note: reason });
  }

  // ── Organization Tree (Principle III: recursive, Principle IX: unbounded) ───

  static addTreeNode(
    model: OrganizationModel,
    category: keyof Omit<OrganizationTree, 'organizationId'>,
    node: Omit<TreeEntityNode, 'id' | 'createdAt' | 'status'> & { status?: TreeEntityNode['status'] },
  ): OrganizationModel {
    const parentCategory = TREE_PARENT[category];
    if (node.parentId) {
      if (!parentCategory) {
        throw new Error(`[OrganizationEngine] Category "${category}" does not accept a parent node`);
      }
      const parents = model.tree[parentCategory];
      if (!parents.some(p => p.id === node.parentId)) {
        throw new Error(`[OrganizationEngine] Parent ${parentCategory} "${node.parentId}" does not exist in this organization (Rule 3: isolation)`);
      }
    }
    const now = Date.now();
    const entity: TreeEntityNode = { ...node, status: node.status ?? 'active', id: nextId(category.slice(0, 3)), createdAt: now };
    return {
      ...model,
      tree: {
        ...model.tree,
        [category]: [...(model.tree[category] as TreeEntityNode[]), entity],
      },
      updatedAt: now,
    };
  }

  static updateTreeNode(
    model: OrganizationModel,
    category: keyof Omit<OrganizationTree, 'organizationId'>,
    nodeId: string,
    patch: Partial<Pick<TreeEntityNode, 'name' | 'status' | 'parentId'>>,
  ): OrganizationModel {
    const now = Date.now();
    const list = model.tree[category] as TreeEntityNode[];
    const index = list.findIndex(n => n.id === nodeId);
    if (index === -1) {
      throw new Error(`[OrganizationEngine] ${category} node "${nodeId}" does not exist`);
    }
    const updated: TreeEntityNode = { ...list[index], ...patch, id: nodeId };
    if (updated.parentId === updated.id) {
      throw new Error(`[OrganizationEngine] A ${category} node cannot be its own parent`);
    }
    return {
      ...model,
      tree: {
        ...model.tree,
        [category]: [...list.slice(0, index), updated, ...list.slice(index + 1)],
      },
      updatedAt: now,
    };
  }

  static removeTreeNode(
    model: OrganizationModel,
    category: keyof Omit<OrganizationTree, 'organizationId'>,
    nodeId: string,
  ): OrganizationModel {
    const now = Date.now();
    const list = model.tree[category] as TreeEntityNode[];
    if (!list.some(n => n.id === nodeId)) {
      throw new Error(`[OrganizationEngine] ${category} node "${nodeId}" does not exist`);
    }
    const childCategory = CHILD_CATEGORY[category];
    if (childCategory && (model.tree[childCategory] as TreeEntityNode[]).some(n => n.parentId === nodeId)) {
      throw new Error(`[OrganizationEngine] Cannot remove "${nodeId}": it still has ${childCategory} children`);
    }
    return {
      ...model,
      tree: {
        ...model.tree,
        [category]: list.filter(n => n.id !== nodeId),
      },
      updatedAt: now,
    };
  }

  // ── Identity evolution (Principle V: organizations are time-aware) ───────────

  static updateIdentity(
    model: OrganizationModel,
    patch: Partial<Pick<OrganizationIdentity, 'officialName' | 'legalName' | 'shortName' | 'aliases' | 'type' | 'level'>>,
    opts: { actorId?: AmxUid } = {},
  ): OrganizationModel {
    if (patch.officialName !== undefined) {
      const name = patch.officialName.trim();
      if (!name) throw new Error('[OrganizationEngine] officialName cannot be empty');
      patch = { ...patch, officialName: name };
    }
    const now = Date.now();
    return {
      ...model,
      identity: {
        ...model.identity,
        ...patch,
        type: patch.type ?? model.identity.type,
        isCustomType: patch.type !== undefined ? !isKnownOrganizationType(patch.type) : model.identity.isCustomType,
      },
      history: [
        ...model.history,
        { at: now, type: 'identity_updated', actorId: opts.actorId, note: 'Organization identity updated' },
      ],
      updatedAt: now,
    };
  }

  static updateGeography(
    model: OrganizationModel,
    patch: Partial<OrganizationGeography>,
    opts: { actorId?: AmxUid } = {},
  ): OrganizationModel {
    const now = Date.now();
    return {
      ...model,
      geography: { ...model.geography, ...patch },
      history: [
        ...model.history,
        { at: now, type: 'geography_updated', actorId: opts.actorId, note: 'Organizational geography updated' },
      ],
      updatedAt: now,
    };
  }

  static updateMetadata(
    model: OrganizationModel,
    patch: Partial<OrganizationMetadata>,
    opts: { actorId?: AmxUid } = {},
  ): OrganizationModel {
    const now = Date.now();
    return {
      ...model,
      metadata: { ...model.metadata, ...patch },
      history: [
        ...model.history,
        { at: now, type: 'identity_updated', actorId: opts.actorId, note: 'Organization metadata updated' },
      ],
      updatedAt: now,
    };
  }

  static changeOwnership(
    model: OrganizationModel,
    ownership: OwnershipModel,
    opts: { actorId?: AmxUid } = {},
  ): OrganizationModel {
    if (!(OWNERSHIP_MODELS as readonly OwnershipModel[]).includes(ownership)) {
      throw new Error(`[OrganizationEngine] Unknown ownership model: ${ownership}`);
    }
    const now = Date.now();
    return {
      ...model,
      identity: { ...model.identity, ownership },
      history: [
        ...model.history,
        { at: now, type: 'identity_updated', actorId: opts.actorId, from: model.identity.ownership, to: ownership, note: 'Ownership model changed' },
      ],
      updatedAt: now,
    };
  }

  static addRegistrationNumber(
    model: OrganizationModel,
    registration: RegistrationNumber,
    opts: { actorId?: AmxUid } = {},
  ): OrganizationModel {
    const { identity } = model;
    const key = `${registration.authority}:${registration.type}:${registration.number}`;
    const exists = identity.registrationNumbers.some(r => `${r.authority}:${r.type}:${r.number}` === key);
    if (exists) return model; // idempotent
    const now = Date.now();
    return {
      ...model,
      identity: { ...identity, registrationNumbers: [...identity.registrationNumbers, registration] },
      history: [
        ...model.history,
        { at: now, type: 'identity_updated', actorId: opts.actorId, note: `Registration ${registration.type} ${registration.number} added (${registration.authority})` },
      ],
      updatedAt: now,
    };
  }

  static removeRegistrationNumber(
    model: OrganizationModel,
    registrationId: string,
    opts: { actorId?: AmxUid } = {},
  ): OrganizationModel {
    const { identity } = model;
    const remaining = identity.registrationNumbers.filter(r => r.number !== registrationId);
    if (remaining.length === identity.registrationNumbers.length) return model; // nothing removed
    const now = Date.now();
    return {
      ...model,
      identity: { ...identity, registrationNumbers: remaining },
      history: [
        ...model.history,
        { at: now, type: 'identity_updated', actorId: opts.actorId, note: `Registration ${registrationId} removed` },
      ],
      updatedAt: now,
    };
  }

  static addVerificationDocument(
    model: OrganizationModel,
    documentUrl: string,
    opts: { actorId?: AmxUid } = {},
  ): OrganizationModel {
    const now = Date.now();
    return {
      ...model,
      identity: {
        ...model.identity,
        verification: {
          ...model.identity.verification,
          documents: [...model.identity.verification.documents, documentUrl],
        },
      },
      history: [
        ...model.history,
        { at: now, type: 'identity_updated', actorId: opts.actorId, note: 'Verification document attached' },
      ],
      updatedAt: now,
    };
  }

  static setVerificationStatus(
    model: OrganizationModel,
    status: VerificationStatus,
    opts: { actorId?: AmxUid; reason?: string } = {},
  ): OrganizationModel {
    const now = Date.now();
    return {
      ...model,
      identity: {
        ...model.identity,
        verification: {
          ...model.identity.verification,
          status,
          verifiedAt: status === 'verified' ? now : model.identity.verification.verifiedAt,
          verifiedBy: status === 'verified' ? (opts.actorId ?? model.identity.verification.verifiedBy) : undefined,
        },
      },
      history: [
        ...model.history,
        { at: now, type: 'status_changed', actorId: opts.actorId, from: model.identity.verification.status, to: status, note: opts.reason },
      ],
      updatedAt: now,
    };
  }

  // ── Constitutional Rule enforcement ──────────────────────────────────────────

  /**
   * Returns the list of constitutional rules currently violated by the model.
   * An empty array means the organization is in full compliance.
   */
  static checkConstitutionalRules(model: OrganizationModel): string[] {
    const violations: string[] = [];

    if (!model.identity) violations.push('Rule 2: every organization must have exactly one constitutional identity');
    if (model.identity?.verification.status === 'verified' && !model.identity.verification.verifiedAt) {
      violations.push('Rule 2: verified identity must carry a verification timestamp');
    }
    if (model.id) {
      const nodes = OrganizationEngine.allTreeNodes(model);
      for (const n of nodes) {
        if (n.id.includes(':') && n.parentId === undefined && n.id !== model.id) {
          violations.push(`Rule 10: entity "${n.name}" must belong to exactly one organization`);
        }
      }
      const orphan = nodes.some(n => n.parentId && !OrganizationEngine.parentExists(model, n));
      if (orphan) violations.push('Rule 3: no tree entity may reference a parent outside this organization');
    }
    if (model.lifecycle.status === 'closed' && model.history.filter(h => h.type === 'closed').length === 0) {
      violations.push('Rule V: a closed organization must preserve its closure in history');
    }
    return violations;
  }

  private static allTreeNodes(model: OrganizationModel): TreeEntityNode[] {
    const { campuses, facilities, buildings, departments, units, services, teams, workspaces } = model.tree;
    return [...campuses, ...facilities, ...buildings, ...departments, ...units, ...services, ...teams, ...workspaces];
  }

  private static parentExists(model: OrganizationModel, node: TreeEntityNode): boolean {
    return OrganizationEngine.allTreeNodes(model).some(n => n.id === node.parentId);
  }

  // ── Persisted document (compatible with the constitution Organization) ───────

  static buildDocument(
    model: OrganizationModel,
    opts: {
      phone?: string;
      email?: string;
      ownedBy?: AmxUid;
      config?: OrganizationConfig;
      license?: OrganizationLicense;
      pricingTier?: PricingTier;
    } = {},
  ): Omit<Organization, 'id'> {
    const identity = model.identity;
    const facilityReg = identity.registrationNumbers.find(r => r.type === 'facility' || r.type === 'license') ?? identity.registrationNumbers[0];
    const now = Date.now();

    return {
      name: identity.officialName,
      legalName: identity.legalName,
      type: coerceOrganizationType(identity.type),
      level: coerceOrganizationLevel(identity.level),
      registrationNumber: facilityReg?.number ?? '',
      taxId: identity.registrationNumbers.find(r => r.type === 'tax')?.number,
      address: {
        country: model.geography.country,
        county: model.geography.county ?? '',
        city: model.geography.city ?? '',
        postalCode: '',
        street: '',
      },
      phone: opts.phone ?? '',
      email: opts.email ?? '',
      website: model.metadata.website,
      parentOrganizationId: identity.parentOrganizationId,
      branches: OrganizationEngine.buildBranches(model),
      departments: [],
      status: lifecycleToConstitutionStatus(model.lifecycle.status),
      verified: identity.verification.status === 'verified',
      verifiedAt: identity.verification.verifiedAt,
      verifiedBy: identity.verification.verifiedBy,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      ownedBy: (opts.ownedBy ?? model.createdBy ?? '') as AmxUid,
      config: opts.config ?? OrganizationEngine.defaultConfig(model, opts.phone ?? '', opts.email ?? ''),
      license: opts.license ?? OrganizationEngine.defaultLicense(model, facilityReg),
      pricingTier: opts.pricingTier ?? 'free',
    };
  }

  static defaultConfig(model: OrganizationModel, phone: string, email: string): OrganizationConfig {
    const name = model.identity.officialName;
    return {
      documentHeader: {
        logoUrl: '',
        facilityName: name,
        facilityAddress: '',
        facilityPhone: phone,
        facilityEmail: email,
        headerTemplate: '',
        footerTemplate: '',
      },
      branding: {
        primaryColor: '#2F80ED',
        secondaryColor: '#1a5bbf',
        accentColor: '#2F80ED',
        fontFamily: 'Inter',
      },
      clinical: {
        defaultWards: [],
        defaultClinics: [],
        defaultTheatres: [],
        diagnosisCodeSystem: 'icd_10',
        medicationCodeSystem: 'local',
        labCodeSystem: 'local',
        imagingCodeSystem: 'local',
        enableTelemedicine: false,
        enableAI: true,
        enableResearch: false,
      },
      billing: {
        currency: 'USD',
        taxRate: 0,
        consultationFees: {},
        bedCharges: {},
        pharmacyMarkup: 0,
        labMarkup: 0,
        imagingMarkup: 0,
        insuranceAccepted: [],
        paymentMethods: ['cash', 'card', 'mpesa'],
      },
      integrations: {
        fhirEnabled: false,
        hl7Enabled: false,
        externalHmisEnabled: false,
        aiServicesEnabled: true,
        apiEnabled: false,
      },
    };
  }

  static defaultLicense(model: OrganizationModel, registration?: RegistrationNumber): OrganizationLicense {
    const now = Date.now();
    return {
      licenseNumber: registration?.number ?? '',
      licenseType: 'health_facility',
      issuingAuthority: registration?.authority ?? 'Regulatory Authority',
      issuedAt: now,
      expiresAt: now + 365 * 86400000,
      renewedAt: now,
      status: 'pending',
    };
  }

  /** Map first-class facilities onto the constitution document's branch list. */
  static buildBranches(model: OrganizationModel): Organization['branches'] {
    return model.facilities
      .filter(f => f.status !== 'closed')
      .map(f => ({
        id: f.id,
        name: f.name,
        address: {
          country: f.address?.country ?? model.geography.country ?? '',
          county: f.address?.county ?? model.geography.county ?? '',
          city: f.address?.city ?? model.geography.city ?? '',
          postalCode: f.address?.postalCode ?? '',
          street: f.address?.street ?? '',
        },
        phone: f.phone ?? '',
        email: f.email ?? '',
        type: coerceOrganizationType(f.kind),
        status: f.status === 'active' ? 'active' as const : 'inactive' as const,
        departments: [],
      }));
  }

  // ── Persistence (opt-in; keeps the engine pure for testing) ─────────────────

  static async persist(orgId: string, model: OrganizationModel): Promise<OrganizationModel> {
    const { doc, setDoc, collection, addDoc } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');
    const { cleanFirestore } = await import('@/lib/amexan/constitution/firestoreService');

    const identified: OrganizationModel = { ...model, id: orgId, tree: { ...model.tree, organizationId: orgId } };

    await setDoc(doc(db, 'organizations', orgId, 'identity', 'main'), cleanFirestore(identified.identity));
    await setDoc(doc(db, 'organizations', orgId, 'geography', 'main'), cleanFirestore(identified.geography));
    await setDoc(doc(db, 'organizations', orgId, 'metadata', 'main'), cleanFirestore(identified.metadata));

    await Promise.all(
      (Object.keys(identified.domains) as ConstitutionalDomain[]).map(domain =>
        setDoc(doc(db, 'organizations', orgId, 'domains', domain), cleanFirestore(identified.domains[domain])),
      ),
    );

    // Facility ecosystem (Principle IV: Organization ≠ Facility).
    await Promise.all(identified.facilities.map(f => setDoc(doc(db, 'organizations', orgId, 'facilities', f.id), cleanFirestore(f))));
    await Promise.all(identified.campuses.map(c => setDoc(doc(db, 'organizations', orgId, 'campuses', c.id), cleanFirestore(c))));
    await Promise.all(identified.branches.map(b => setDoc(doc(db, 'organizations', orgId, 'branches', b.id), cleanFirestore(b))));
    await Promise.all(identified.buildings.map(b => setDoc(doc(db, 'organizations', orgId, 'buildings', b.id), cleanFirestore(b))));
    await Promise.all(identified.floors.map(f => setDoc(doc(db, 'organizations', orgId, 'floors', f.id), cleanFirestore(f))));

    const historyCol = collection(db, 'organizations', orgId, 'history');
    await Promise.all(identified.history.map(event => addDoc(historyCol, cleanFirestore(event))));

    return identified;
  }

  // ── Read conveniences ────────────────────────────────────────────────────────

  static getIdentity(model: OrganizationModel): OrganizationIdentity { return model.identity; }
  static getGeography(model: OrganizationModel): OrganizationGeography { return model.geography; }
  static getDomains(model: OrganizationModel): Record<ConstitutionalDomain, OrganizationDomainContainer> { return model.domains; }
  static getHistory(model: OrganizationModel): OrganizationHistoryEvent[] { return model.history; }
  static getStatus(model: OrganizationModel): OrganizationLifecycleStatus { return model.lifecycle.status; }
  static getRules(): readonly (typeof CONSTITUTIONAL_RULES)[number][] { return CONSTITUTIONAL_RULES; }
}

// ── Module-level helpers ───────────────────────────────────────────────────────

function defaultLevelFor(country: string): string {
  const levels = levelSystemFor(country);
  if (levels.length === 0) return 'level_4';
  return levels[Math.floor((levels.length - 1) / 2)];
}

function lifecycleToConstitutionStatus(status: OrganizationLifecycleStatus): Organization['status'] {
  switch (status) {
    case 'verified':
    case 'operational':
    case 'expanding':
      return 'active';
    case 'merged':
    case 'archived':
    case 'closed':
      return 'inactive';
    default:
      return 'pending_verification';
  }
}

/** Which tree category a given category may hang beneath. */
const TREE_PARENT: Readonly<Partial<Record<keyof Omit<OrganizationTree, 'organizationId'>, keyof Omit<OrganizationTree, 'organizationId'>>>> = {
  facilities: 'campuses',
  buildings: 'facilities',
  departments: 'buildings',
  units: 'departments',
  services: 'units',
  teams: 'services',
  workspaces: 'teams',
};

/** Inverse of TREE_PARENT — which category may hang beneath a given category. */
const CHILD_CATEGORY: Readonly<Partial<Record<keyof Omit<OrganizationTree, 'organizationId'>, keyof Omit<OrganizationTree, 'organizationId'>>>> = {
  campuses: 'facilities',
  facilities: 'buildings',
  buildings: 'departments',
  departments: 'units',
  units: 'services',
  services: 'teams',
  teams: 'workspaces',
};

export default OrganizationEngine;
