// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Facility Engine (Principle IV: Organization ≠ Facility)
//
// One organization owns many facilities. A university owns hospitals, medical
// schools, research institutes and laboratories. This engine is the constitutional
// owner of that facility ecosystem:
//
//   Organization
//     └── Campuses
//     └── Branches
//     └── Facilities (recursive: a facility may contain facilities)
//           └── Buildings
//                 └── Floors
//
// The Facility Engine owns:
//   Facility Identity            — name, kind, address, contacts, business hours
//   Facility Lifecycle           — draft → active → inactive / closed
//   Facility Licenses            — authority, number, expiry, status
//   Facility Accreditation       — body, level, award, expiry, status
//   Facility Branding            — logo, colors, fonts, templates
//   Campus / Branch / Building / Floor  — the physical geography of the organization
//   Facility Tree Integration    — every entity is mirrored in the OrganizationTree
//
// Constitutional rules enforced here:
//   Rule 3  — a facility may only reference parents inside its own organization
//   Rule 4  — facilities inherit the organization's constitutional engines
//   Rule 5  — facilities may customize appearance, never constitutional logic
//   Rule 9  — facilities may grow indefinitely, one engine
//   Rule 10 — every facility ultimately belongs to exactly one organization
//
// This engine is pure and deterministic like OrganizationEngine. It never reads
// or writes Firestore itself; persistence is orchestrated by provisioning.ts.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type {
  Building,
  Branch,
  Campus,
  Facility,
  FacilityAccreditation,
  FacilityBranding,
  FacilityBusinessHours,
  FacilityContact,
  FacilityKind,
  FacilityLicense,
  FacilityStatus,
  Floor,
  OrganizationModel,
} from './types';

export interface CreateFacilityInput {
  name: string;
  kind?: FacilityKind;
  parentFacilityId?: string;
  campusId?: string;
  address?: Facility['address'];
  phone?: string;
  email?: string;
  website?: string;
  contacts?: FacilityContact[];
  businessHours?: FacilityBusinessHours;
  actorId?: AmxUid;
}

export interface UpdateFacilityInput {
  name?: string;
  kind?: FacilityKind;
  address?: Facility['address'];
  phone?: string;
  email?: string;
  website?: string;
  contacts?: FacilityContact[];
  businessHours?: FacilityBusinessHours;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function hasNode(model: OrganizationModel, category: keyof OrganizationModel['tree'], nodeId: string): boolean {
  return (model.tree[category] as { id: string }[]).some(n => n.id === nodeId);
}

export class FacilityEngine {
  // ── Facility creation ────────────────────────────────────────────────────────

  static createFacility(model: OrganizationModel, input: CreateFacilityInput): OrganizationModel {
    const name = (input.name ?? '').trim();
    if (!name) throw new Error('[FacilityEngine] Facility name is required (Rule 2)');
    if (name.length < 2) throw new Error('[FacilityEngine] Facility name must be at least 2 characters');

    if (input.parentFacilityId && !hasNode(model, 'facilities', input.parentFacilityId)) {
      throw new Error(`[FacilityEngine] Parent facility "${input.parentFacilityId}" does not exist in this organization (Rule 3)`);
    }
    if (input.campusId && !hasNode(model, 'campuses', input.campusId)) {
      throw new Error(`[FacilityEngine] Campus "${input.campusId}" does not exist in this organization (Rule 3)`);
    }

    const now = Date.now();
    const kind: FacilityKind = input.kind ?? 'other';
    const id = nextId('fac');

    const facility: Facility = {
      id,
      organizationId: model.id ?? '',
      name,
      kind,
      isCustomKind: !STANDARD_FACILITY_KINDS.includes(kind),
      status: 'draft',
      parentFacilityId: input.parentFacilityId,
      campusId: input.campusId,
      address: input.address,
      phone: input.phone,
      email: input.email,
      website: input.website,
      contacts: input.contacts ?? [],
      businessHours: input.businessHours,
      licenses: [],
      accreditations: [],
      verification: { status: 'unverified', documents: [] },
      createdAt: now,
      updatedAt: now,
    };

    return {
      ...model,
      facilities: [...model.facilities, facility],
      tree: {
        ...model.tree,
        facilities: [
          ...model.tree.facilities,
          { id, name, parentId: input.campusId ?? input.parentFacilityId, status: 'draft', createdAt: now },
        ],
      },
      history: [
        ...model.history,
        { at: now, type: 'entity_attached', actorId: input.actorId, note: `Facility "${name}" created (${kind})` },
      ],
      updatedAt: now,
    };
  }

  // ── Facility mutation ────────────────────────────────────────────────────────

  static updateFacility(model: OrganizationModel, facilityId: string, patch: UpdateFacilityInput, actorId?: AmxUid): OrganizationModel {
    const index = model.facilities.findIndex(f => f.id === facilityId);
    if (index === -1) throw new Error(`[FacilityEngine] Facility "${facilityId}" does not exist`);
    const existing = model.facilities[index];
    if (patch.name !== undefined && (patch.name ?? '').trim().length < 2) {
      throw new Error('[FacilityEngine] Facility name must be at least 2 characters');
    }
    const now = Date.now();
    const kind = patch.kind ?? existing.kind;
    const updated: Facility = {
      ...existing,
      ...patch,
      name: patch.name?.trim() ?? existing.name,
      kind,
      isCustomKind: !STANDARD_FACILITY_KINDS.includes(kind),
      updatedAt: now,
    };
    return {
      ...model,
      facilities: [...model.facilities.slice(0, index), updated, ...model.facilities.slice(index + 1)],
      tree: {
        ...model.tree,
        facilities: model.tree.facilities.map(n => n.id === facilityId ? { ...n, name: updated.name, status: n.status } : n),
      },
      history: [
        ...model.history,
        { at: now, type: 'identity_updated', actorId, note: `Facility "${updated.name}" updated` },
      ],
      updatedAt: now,
    };
  }

  static setFacilityStatus(model: OrganizationModel, facilityId: string, status: FacilityStatus, actorId?: AmxUid): OrganizationModel {
    const index = model.facilities.findIndex(f => f.id === facilityId);
    if (index === -1) throw new Error(`[FacilityEngine] Facility "${facilityId}" does not exist`);
    if (status === 'active') {
      // A facility cannot become active unless at least one valid licence exists.
      const facility = model.facilities[index];
      if (!facility.licenses.some(l => l.status === 'active')) {
        throw new Error('[FacilityEngine] Facility cannot become active without an active licence (Compliance)');
      }
    }
    const now = Date.now();
    const updated: Facility = { ...model.facilities[index], status, updatedAt: now };
    return {
      ...model,
      facilities: [...model.facilities.slice(0, index), updated, ...model.facilities.slice(index + 1)],
      tree: {
        ...model.tree,
        facilities: model.tree.facilities.map(n => n.id === facilityId ? { ...n, status } : n),
      },
      history: [
        ...model.history,
        { at: now, type: 'status_changed', actorId, from: model.facilities[index].status, to: status, note: `Facility "${updated.name}" → ${status}` },
      ],
      updatedAt: now,
    };
  }

  static removeFacility(model: OrganizationModel, facilityId: string, actorId?: AmxUid): OrganizationModel {
    const index = model.facilities.findIndex(f => f.id === facilityId);
    if (index === -1) throw new Error(`[FacilityEngine] Facility "${facilityId}" does not exist`);
    const facility = model.facilities[index];
    const hasChildren = model.facilities.some(f => f.parentFacilityId === facilityId);
    if (hasChildren) throw new Error(`[FacilityEngine] Cannot remove "${facility.name}": it still contains child facilities (Rule 3)`);
    const hasBuildings = model.tree.buildings.some(b => b.parentId === facilityId);
    if (hasBuildings) throw new Error(`[FacilityEngine] Cannot remove "${facility.name}": it still has buildings`);
    const now = Date.now();
    return {
      ...model,
      facilities: model.facilities.filter(f => f.id !== facilityId),
      tree: {
        ...model.tree,
        facilities: model.tree.facilities.filter(n => n.id !== facilityId),
      },
      history: [
        ...model.history,
        { at: now, type: 'status_changed', actorId, note: `Facility "${facility.name}" removed from organization` },
      ],
      updatedAt: now,
    };
  }

  // ── Licences ─────────────────────────────────────────────────────────────────

  static addLicense(model: OrganizationModel, facilityId: string, license: Omit<FacilityLicense, 'id' | 'status'>, actorId?: AmxUid): OrganizationModel {
    const index = model.facilities.findIndex(f => f.id === facilityId);
    if (index === -1) throw new Error(`[FacilityEngine] Facility "${facilityId}" does not exist`);
    const facility = model.facilities[index];
    if (facility.licenses.some(l => l.number === license.number)) return model; // idempotent
    const now = Date.now();
    const full: FacilityLicense = { ...license, id: nextId('lic'), status: 'pending' };
    const updated: Facility = { ...facility, licenses: [...facility.licenses, full], updatedAt: now };
    return {
      ...model,
      facilities: [...model.facilities.slice(0, index), updated, ...model.facilities.slice(index + 1)],
      history: [
        ...model.history,
        { at: now, type: 'entity_attached', actorId, note: `Licence ${license.number} added to "${facility.name}" (${license.authority})` },
      ],
      updatedAt: now,
    };
  }

  static approveLicense(model: OrganizationModel, facilityId: string, licenseId: string, actorId?: AmxUid): OrganizationModel {
    return FacilityEngine.mutateLicense(model, facilityId, licenseId, { status: 'active' }, actorId);
  }

  static suspendLicense(model: OrganizationModel, facilityId: string, licenseId: string, actorId?: AmxUid): OrganizationModel {
    return FacilityEngine.mutateLicense(model, facilityId, licenseId, { status: 'suspended' }, actorId);
  }

  static revokeLicense(model: OrganizationModel, facilityId: string, licenseId: string, actorId?: AmxUid): OrganizationModel {
    return FacilityEngine.mutateLicense(model, facilityId, licenseId, { status: 'revoked' }, actorId);
  }

  private static mutateLicense(
    model: OrganizationModel,
    facilityId: string,
    licenseId: string,
    patch: Partial<Pick<FacilityLicense, 'status' | 'expiresAt'>>,
    actorId?: AmxUid,
  ): OrganizationModel {
    const index = model.facilities.findIndex(f => f.id === facilityId);
    if (index === -1) throw new Error(`[FacilityEngine] Facility "${facilityId}" does not exist`);
    const facility = model.facilities[index];
    const licIndex = facility.licenses.findIndex(l => l.id === licenseId);
    if (licIndex === -1) throw new Error(`[FacilityEngine] Licence "${licenseId}" does not exist`);
    const now = Date.now();
    const licenses = [...facility.licenses];
    licenses[licIndex] = { ...licenses[licIndex], ...patch };
    const updated: Facility = { ...facility, licenses, updatedAt: now };
    return {
      ...model,
      facilities: [...model.facilities.slice(0, index), updated, ...model.facilities.slice(index + 1)],
      history: [
        ...model.history,
        { at: now, type: 'status_changed', actorId, note: `Licence ${licenseId} for "${facility.name}" → ${patch.status ?? 'updated'}` },
      ],
      updatedAt: now,
    };
  }

  // ── Accreditation ────────────────────────────────────────────────────────────

  static addAccreditation(model: OrganizationModel, facilityId: string, accreditation: Omit<FacilityAccreditation, 'id'>, actorId?: AmxUid): OrganizationModel {
    const index = model.facilities.findIndex(f => f.id === facilityId);
    if (index === -1) throw new Error(`[FacilityEngine] Facility "${facilityId}" does not exist`);
    const facility = model.facilities[index];
    const now = Date.now();
    const full: FacilityAccreditation = { ...accreditation, id: nextId('acc') };
    const updated: Facility = { ...facility, accreditations: [...facility.accreditations, full], updatedAt: now };
    return {
      ...model,
      facilities: [...model.facilities.slice(0, index), updated, ...model.facilities.slice(index + 1)],
      history: [
        ...model.history,
        { at: now, type: 'entity_attached', actorId, note: `Accreditation "${full.name}" (${full.body}) added to "${facility.name}"` },
      ],
      updatedAt: now,
    };
  }

  static expireAccreditation(model: OrganizationModel, facilityId: string, accreditationId: string, actorId?: AmxUid): OrganizationModel {
    return FacilityEngine.mutateAccreditation(model, facilityId, accreditationId, { status: 'expired' }, actorId);
  }

  static revokeAccreditation(model: OrganizationModel, facilityId: string, accreditationId: string, actorId?: AmxUid): OrganizationModel {
    return FacilityEngine.mutateAccreditation(model, facilityId, accreditationId, { status: 'revoked' }, actorId);
  }

  private static mutateAccreditation(
    model: OrganizationModel,
    facilityId: string,
    accreditationId: string,
    patch: Partial<Pick<FacilityAccreditation, 'status' | 'expiresAt'>>,
    actorId?: AmxUid,
  ): OrganizationModel {
    const index = model.facilities.findIndex(f => f.id === facilityId);
    if (index === -1) throw new Error(`[FacilityEngine] Facility "${facilityId}" does not exist`);
    const facility = model.facilities[index];
    const accIndex = facility.accreditations.findIndex(a => a.id === accreditationId);
    if (accIndex === -1) throw new Error(`[FacilityEngine] Accreditation "${accreditationId}" does not exist`);
    const now = Date.now();
    const accreditations = [...facility.accreditations];
    accreditations[accIndex] = { ...accreditations[accIndex], ...patch };
    const updated: Facility = { ...facility, accreditations, updatedAt: now };
    return {
      ...model,
      facilities: [...model.facilities.slice(0, index), updated, ...model.facilities.slice(index + 1)],
      history: [
        ...model.history,
        { at: now, type: 'status_changed', actorId, note: `Accreditation ${accreditationId} for "${facility.name}" → ${patch.status ?? 'updated'}` },
      ],
      updatedAt: now,
    };
  }

  // ── Branding (Rule 5: appearance only, never constitutional logic) ───────────

  static setBranding(model: OrganizationModel, facilityId: string, branding: Partial<FacilityBranding>, actorId?: AmxUid): OrganizationModel {
    const index = model.facilities.findIndex(f => f.id === facilityId);
    if (index === -1) throw new Error(`[FacilityEngine] Facility "${facilityId}" does not exist`);
    const facility = model.facilities[index];
    const now = Date.now();
    const base: FacilityBranding = {
      primaryColor: '#2F80ED',
      secondaryColor: '#1a5bbf',
      accentColor: '#2F80ED',
      fontFamily: 'Inter',
      ...(facility.branding ?? {}),
      ...branding,
    };
    const updated: Facility = { ...facility, branding: base, updatedAt: now };
    return {
      ...model,
      facilities: [...model.facilities.slice(0, index), updated, ...model.facilities.slice(index + 1)],
      history: [
        ...model.history,
        { at: now, type: 'identity_updated', actorId, note: `Branding updated for "${facility.name}" (appearance only, Rule 5)` },
      ],
      updatedAt: now,
    };
  }

  static verifyFacility(model: OrganizationModel, facilityId: string, actorId?: AmxUid): OrganizationModel {
    const index = model.facilities.findIndex(f => f.id === facilityId);
    if (index === -1) throw new Error(`[FacilityEngine] Facility "${facilityId}" does not exist`);
    const facility = model.facilities[index];
    if (facility.licenses.length === 0) {
      throw new Error('[FacilityEngine] Cannot verify a facility without at least one licence');
    }
    const now = Date.now();
    const updated: Facility = {
      ...facility,
      verification: {
        status: 'verified',
        verifiedAt: now,
        verifiedBy: actorId,
        documents: facility.verification.documents,
      },
      updatedAt: now,
    };
    return {
      ...model,
      facilities: [...model.facilities.slice(0, index), updated, ...model.facilities.slice(index + 1)],
      history: [
        ...model.history,
        { at: now, type: 'verified', actorId, note: `Facility "${facility.name}" verified` },
      ],
      updatedAt: now,
    };
  }

  // ── Campuses / Branches / Buildings / Floors (Organizational Geography) ──────

  static createCampus(model: OrganizationModel, name: string, opts: { address?: Campus['address']; actorId?: AmxUid } = {}): OrganizationModel {
    const trimmed = (name ?? '').trim();
    if (!trimmed) throw new Error('[FacilityEngine] Campus name is required');
    const now = Date.now();
    const id = nextId('cam');
    const campus: Campus = {
      id,
      organizationId: model.id ?? '',
      name: trimmed,
      status: 'active',
      address: opts.address,
      createdAt: now,
      updatedAt: now,
    };
    return {
      ...model,
      campuses: [...model.campuses, campus],
      tree: {
        ...model.tree,
        campuses: [...model.tree.campuses, { id, name: trimmed, status: 'active', createdAt: now }],
      },
      history: [...model.history, { at: now, type: 'entity_attached', actorId: opts.actorId, note: `Campus "${trimmed}" created` }],
      updatedAt: now,
    };
  }

  static createBranch(model: OrganizationModel, input: { name: string; campusId?: string; type?: Branch['type']; address?: Branch['address']; phone?: string; email?: string; actorId?: AmxUid }): OrganizationModel {
    const trimmed = (input.name ?? '').trim();
    if (!trimmed) throw new Error('[FacilityEngine] Branch name is required');
    if (input.campusId && !hasNode(model, 'campuses', input.campusId)) {
      throw new Error(`[FacilityEngine] Campus "${input.campusId}" does not exist in this organization (Rule 3)`);
    }
    const now = Date.now();
    const id = nextId('brn');
    const branch: Branch = {
      id,
      organizationId: model.id ?? '',
      campusId: input.campusId,
      name: trimmed,
      type: input.type ?? 'main',
      status: 'active',
      address: input.address,
      phone: input.phone,
      email: input.email,
      createdAt: now,
      updatedAt: now,
    };
    return {
      ...model,
      branches: [...model.branches, branch],
      history: [...model.history, { at: now, type: 'entity_attached', actorId: input.actorId, note: `Branch "${trimmed}" created` }],
      updatedAt: now,
    };
  }

  static createBuilding(model: OrganizationModel, input: { name: string; campusId: string; floors?: number; address?: Building['address']; actorId?: AmxUid }): OrganizationModel {
    const trimmed = (input.name ?? '').trim();
    if (!trimmed) throw new Error('[FacilityEngine] Building name is required');
    if (!hasNode(model, 'campuses', input.campusId)) {
      throw new Error(`[FacilityEngine] Campus "${input.campusId}" does not exist in this organization (Rule 3)`);
    }
    const now = Date.now();
    const id = nextId('bld');
    const floors = Math.max(0, input.floors ?? 0);
    const building: Building = {
      id,
      organizationId: model.id ?? '',
      campusId: input.campusId,
      name: trimmed,
      floors,
      status: 'active',
      address: input.address,
      createdAt: now,
      updatedAt: now,
    };
    return {
      ...model,
      buildings: [...model.buildings, building],
      tree: {
        ...model.tree,
        buildings: [...model.tree.buildings, { id, name: trimmed, parentId: input.campusId, status: 'active', createdAt: now }],
      },
      history: [...model.history, { at: now, type: 'entity_attached', actorId: input.actorId, note: `Building "${trimmed}" created (${floors} floors)` }],
      updatedAt: now,
    };
  }

  static addFloor(model: OrganizationModel, input: { buildingId: string; level: number; name?: string; actorId?: AmxUid }): OrganizationModel {
    const building = model.buildings.find(b => b.id === input.buildingId);
    if (!building) throw new Error(`[FacilityEngine] Building "${input.buildingId}" does not exist`);
    if (model.floors.some(f => f.buildingId === input.buildingId && f.level === input.level)) {
      throw new Error(`[FacilityEngine] Floor level ${input.level} already exists in building "${building.name}"`);
    }
    const now = Date.now();
    const floor: Floor = {
      id: nextId('flr'),
      buildingId: input.buildingId,
      level: input.level,
      name: input.name ?? `Floor ${input.level}`,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    return {
      ...model,
      floors: [...model.floors, floor],
      buildings: model.buildings.map(b => b.id === input.buildingId ? { ...b, floors: Math.max(b.floors, input.level + 1), updatedAt: now } : b),
      history: [...model.history, { at: now, type: 'entity_attached', actorId: input.actorId, note: `Floor ${input.level} added to "${building.name}"` }],
      updatedAt: now,
    };
  }

  // ── Read conveniences ────────────────────────────────────────────────────────

  static getFacilities(model: OrganizationModel): Facility[] { return model.facilities; }
  static getFacility(model: OrganizationModel, facilityId: string): Facility | undefined {
    return model.facilities.find(f => f.id === facilityId);
  }
  static getFacilitiesByKind(model: OrganizationModel, kind: FacilityKind): Facility[] {
    return model.facilities.filter(f => f.kind === kind);
  }
  static getCampuses(model: OrganizationModel): Campus[] { return model.campuses; }
  static getBranches(model: OrganizationModel): Branch[] { return model.branches; }
  static getBuildings(model: OrganizationModel): Building[] { return model.buildings; }
  static getFloors(model: OrganizationModel): Floor[] { return model.floors; }
  static getFloorsForBuilding(model: OrganizationModel, buildingId: string): Floor[] {
    return model.floors.filter(f => f.buildingId === buildingId);
  }
  static getActiveFacilities(model: OrganizationModel): Facility[] {
    return model.facilities.filter(f => f.status === 'active');
  }
  static countFacilities(model: OrganizationModel): number { return model.facilities.length; }
  static countActiveFacilities(model: OrganizationModel): number {
    return model.facilities.filter(f => f.status === 'active').length;
  }
  static countLicenses(model: OrganizationModel): number {
    return model.facilities.reduce((sum, f) => sum + f.licenses.length, 0);
  }
  static countAccreditations(model: OrganizationModel): number {
    return model.facilities.reduce((sum, f) => sum + f.accreditations.length, 0);
  }
  static countActiveAccreditations(model: OrganizationModel): number {
    return model.facilities.reduce((sum, f) => sum + f.accreditations.filter(a => a.status === 'active').length, 0);
  }
  static getFacilitySummary(model: OrganizationModel): {
    facilities: number;
    activeFacilities: number;
    campuses: number;
    branches: number;
    buildings: number;
    floors: number;
    licences: number;
    accreditations: number;
  } {
    return {
      facilities: FacilityEngine.countFacilities(model),
      activeFacilities: FacilityEngine.countActiveFacilities(model),
      campuses: model.campuses.length,
      branches: model.branches.length,
      buildings: model.buildings.length,
      floors: model.floors.length,
      licences: FacilityEngine.countLicenses(model),
      accreditations: FacilityEngine.countAccreditations(model),
    };
  }
}

/** Standard facility kinds the engine understands. Custom kinds inherit. */
export const STANDARD_FACILITY_KINDS: readonly FacilityKind[] = [
  'hospital', 'medical_school', 'nursing_school', 'research_institute', 'laboratory',
  'imaging_centre', 'blood_bank', 'pharmacy', 'clinic', 'health_centre', 'dispensary',
  'dialysis_centre', 'dental_centre', 'mental_health_centre', 'ambulance_service',
  'outreach_program', 'satellite_clinic', 'mobile_clinic', 'training_centre',
  'administrative_office', 'warehouse', 'other',
];

export default FacilityEngine;
