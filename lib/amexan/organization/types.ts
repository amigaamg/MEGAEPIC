import { type AmxUid } from '@/lib/amexan/constitution/types'

// ═══════════════════════════════════════════════════════════════════════════════
// Facility Organization Engine — Constitutional Domain Types
//
// The Facility Organization Engine is the constitutional engine responsible for
// creating, governing, evolving, validating, and digitally representing every
// healthcare organization inside AMEXAN throughout its entire lifetime.
//
// It is NOT an EMR. It is NOT HMIS. It is the soil upon which EMR and HMIS grow.
// It answers only one question: "What is this healthcare organization?"
// ═══════════════════════════════════════════════════════════════════════════════

// ── Ownership Models (Principle: different governance, same engine) ──────────
export type OwnershipModel =
  | 'government'
  | 'private'
  | 'mission'
  | 'faith_based'
  | 'university'
  | 'ngo'
  | 'insurance'
  | 'military'
  | 'corporate'
  | 'community'
  | 'hybrid';

export const OWNERSHIP_MODELS: readonly OwnershipModel[] = [
  'government', 'private', 'mission', 'faith_based', 'university',
  'ngo', 'insurance', 'military', 'corporate', 'community', 'hybrid',
];

// ── Organization Lifecycle (Principle V: organizations are time-aware) ────────
export type OrganizationLifecycleStatus =
  | 'draft'
  | 'registered'
  | 'verified'
  | 'operational'
  | 'expanding'
  | 'merged'
  | 'archived'
  | 'closed';

/**
 * Allowed lifecycle transitions. Organization never disappears: a closed,
 * merged, or archived organization is preserved forever with its full history.
 *
 * Merging and closing are terminal and reachable from any non-terminal stage —
 * an organization may be absorbed into a parent or decommissioned the day it is
 * drafted, exactly as it may after decades of operation.
 */
export const ORGANIZATION_LIFECYCLE: Readonly<Record<OrganizationLifecycleStatus, readonly OrganizationLifecycleStatus[]>> = {
  draft: ['registered', 'merged', 'archived', 'closed'],
  registered: ['verified', 'merged', 'closed'],
  verified: ['operational', 'expanding', 'merged', 'archived', 'closed'],
  operational: ['expanding', 'merged', 'archived', 'closed'],
  expanding: ['operational', 'merged', 'archived', 'closed'],
  merged: [],
  archived: ['closed'],
  closed: [],
};

// ── Registration / Verification ───────────────────────────────────────────────
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'revoked';

export interface RegistrationNumber {
  authority: string;          // issuing authority, e.g. 'KMPDC'
  number: string;
  type: 'facility' | 'tax' | 'business' | 'license' | 'national' | 'accreditation';
  issuedAt?: number;
  expiresAt?: number;
}

// ── Organization Identity (Principle: exactly one constitutional identity) ────
export interface OrganizationIdentity {
  officialName: string;       // the single constitutional name
  legalName: string;
  shortName?: string;
  aliases: string[];
  registrationNumbers: RegistrationNumber[];
  type: string;               // registry type OR custom type (Rule: no hardcoding)
  isCustomType: boolean;
  ownership: OwnershipModel;
  level: string;              // country-specific level (Kenya L2-L6, UK, USA…)
  parentOrganizationId?: AmxUid;
  coordinates?: { lat: number; lng: number };
  verification: {
    status: VerificationStatus;
    verifiedAt?: number;
    verifiedBy?: AmxUid;
    documents: string[];
  };
  createdAt: number;
}

// ── Organizational Geography ──────────────────────────────────────────────────
export interface OrganizationGeography {
  country: string;
  province?: string;
  county?: string;
  district?: string;
  city?: string;
  campus?: { id: string; name: string };
  building?: { id: string; name: string };
  floor?: { id: string; name: string };
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  holidays?: string;
}

export interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
}

export interface OrganizationMetadata {
  mission?: string;
  vision?: string;
  coreValues: string[];
  tagline?: string;
  website?: string;
  socials: string[];
  languages: string[];
  timezone: string;
  businessHours: BusinessHours;
  emergencyContacts: EmergencyContact[];
  publicInformation: {
    isPublic: boolean;
    shortDescription?: string;
    foundedYear?: number;
  };
}

// ── Constitutional Domains (empty containers the other engines populate) ──────
export type ConstitutionalDomain =
  | 'governance'
  | 'clinical'
  | 'operations'
  | 'finance'
  | 'infrastructure'
  | 'research'
  | 'teaching'
  | 'quality'
  | 'technology'
  | 'communication'
  | 'analytics'
  | 'compliance'
  | 'knowledge';

export interface OrganizationDomainContainer {
  domain: ConstitutionalDomain;
  status: 'empty' | 'initialized' | 'active';
  engine: string;             // owning engine name
  createdAt: number;
  updatedAt: number;
}

export const ORGANIZATION_DOMAINS: Readonly<Record<ConstitutionalDomain, string>> = {
  governance: 'GovernanceEngine',
  clinical: 'ClinicalEngine',
  operations: 'OperationsEngine',
  finance: 'FinanceEngine',
  infrastructure: 'InfrastructureEngine',
  research: 'ResearchEngine',
  teaching: 'TeachingEngine',
  quality: 'QualityEngine',
  technology: 'TechnologyEngine',
  communication: 'CommunicationEngine',
  analytics: 'AnalyticsEngine',
  compliance: 'ComplianceEngine',
  knowledge: 'KnowledgeEngine',
};

// ── History (Principle V: organizations preserve history) ─────────────────────
export type OrganizationHistoryEventType =
  | 'created'
  | 'registered'
  | 'verified'
  | 'status_changed'
  | 'identity_updated'
  | 'geography_updated'
  | 'merged'
  | 'archived'
  | 'closed'
  | 'entity_attached';

export interface OrganizationHistoryEvent {
  at: number;
  type: OrganizationHistoryEventType;
  actorId?: AmxUid;
  from?: string;
  to?: string;
  note?: string;
}

// ── Organization Tree (Principle III: organizations are recursive) ────────────
export interface TreeEntityNode {
  id: string;
  name: string;
  parentId?: string;
  status: 'draft' | 'active' | 'inactive' | 'closed';
  createdAt: number;
}

export interface OrganizationTree {
  organizationId: string;
  campuses: TreeEntityNode[];
  facilities: TreeEntityNode[];
  buildings: TreeEntityNode[];
  departments: TreeEntityNode[];
  units: TreeEntityNode[];
  services: TreeEntityNode[];
  teams: TreeEntityNode[];
  workspaces: TreeEntityNode[];
}

// ── Facility (Principle IV: Organization ≠ Facility) ──────────────────────────
// One organization (e.g. a university) owns many facilities (hospitals, medical
// schools, research institutes, laboratories). A facility is a physically or
// operationally distinct member of the organization tree.

export type FacilityKind =
  | 'hospital'
  | 'medical_school'
  | 'nursing_school'
  | 'research_institute'
  | 'laboratory'
  | 'imaging_centre'
  | 'blood_bank'
  | 'pharmacy'
  | 'clinic'
  | 'health_centre'
  | 'dispensary'
  | 'dialysis_centre'
  | 'dental_centre'
  | 'mental_health_centre'
  | 'ambulance_service'
  | 'outreach_program'
  | 'satellite_clinic'
  | 'mobile_clinic'
  | 'training_centre'
  | 'administrative_office'
  | 'warehouse'
  | 'other';

export type FacilityStatus = 'draft' | 'active' | 'inactive' | 'closed';

export interface FacilityAddress {
  country?: string;
  province?: string;
  county?: string;
  district?: string;
  city?: string;
  street?: string;
  postalCode?: string;
  coordinates?: { lat: number; lng: number };
}

export interface FacilityContact {
  name: string;
  role: string;
  phone: string;
  email?: string;
  isEmergency?: boolean;
}

export interface FacilityBusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  holidays?: string;
  emergency?: string;
}

/** A facility operates under its own licences, accreditations and status. */
export interface Facility {
  id: string;
  organizationId: string;
  name: string;
  kind: FacilityKind;
  isCustomKind: boolean;
  status: FacilityStatus;
  parentFacilityId?: string;         // Principle IV: a facility may contain facilities
  campusId?: string;                 // the campus (if any) this facility belongs to
  address?: FacilityAddress;
  phone?: string;
  email?: string;
  website?: string;
  contacts: FacilityContact[];
  businessHours?: FacilityBusinessHours;
  licenses: FacilityLicense[];
  accreditations: FacilityAccreditation[];
  branding?: FacilityBranding;
  verification: {
    status: VerificationStatus;
    verifiedAt?: number;
    verifiedBy?: AmxUid;
    documents: string[];
  };
  createdAt: number;
  updatedAt: number;
}

export interface FacilityLicense {
  id: string;
  authority: string;                 // issuing authority, e.g. 'KMPDC'
  number: string;
  type: 'facility' | 'pharmacy' | 'laboratory' | 'imaging' | 'blood_bank' | 'controlled_drugs' | 'business' | 'radiation' | 'other';
  issuedAt?: number;
  expiresAt?: number;
  status: 'active' | 'expired' | 'revoked' | 'pending' | 'suspended';
}

export interface FacilityAccreditation {
  id: string;
  body: string;                      // accrediting body, e.g. 'JCI', 'KQMH'
  name: string;
  level: string;                     // certification level / standard
  awardedAt: number;
  expiresAt?: number;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  certificateUrl?: string;
}

export interface FacilityBranding {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerTemplate?: string;
  footerTemplate?: string;
}

// ── Campus / Branch / Building / Floor (Organizational Geography) ────────────

export interface Campus {
  id: string;
  organizationId: string;
  name: string;
  status: 'active' | 'inactive';
  address?: FacilityAddress;
  createdAt: number;
  updatedAt: number;
}

export interface Branch {
  id: string;
  organizationId: string;
  campusId?: string;
  name: string;
  type: 'main' | 'satellite' | 'mobile' | 'outreach';
  status: 'active' | 'inactive' | 'closed';
  address?: FacilityAddress;
  phone?: string;
  email?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Building {
  id: string;
  organizationId: string;
  campusId: string;
  name: string;
  floors: number;
  status: 'active' | 'inactive' | 'under_construction' | 'closed';
  address?: FacilityAddress;
  createdAt: number;
  updatedAt: number;
}

export interface Floor {
  id: string;
  buildingId: string;
  level: number;
  name: string;
  status: 'active' | 'inactive' | 'closed';
  createdAt: number;
  updatedAt: number;
}

// ── Engine Model ──────────────────────────────────────────────────────────────
export interface OrganizationModel {
  id?: string;                            // Firestore id once persisted
  identity: OrganizationIdentity;
  geography: OrganizationGeography;
  lifecycle: { status: OrganizationLifecycleStatus; enteredAt: number };
  metadata: OrganizationMetadata;
  domains: Record<ConstitutionalDomain, OrganizationDomainContainer>;
  tree: OrganizationTree;
  facilities: Facility[];
  campuses: Campus[];
  branches: Branch[];
  buildings: Building[];
  floors: Floor[];
  history: OrganizationHistoryEvent[];
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  createdAt: number;
  updatedAt: number;
  createdBy?: AmxUid;
}

// ── Engine Input ──────────────────────────────────────────────────────────────
export interface CreateOrganizationInput {
  id?: string;
  name: string;
  legalName?: string;
  shortName?: string;
  aliases?: string[];
  type?: string;
  ownership?: OwnershipModel;
  level?: string;
  country?: string;
  province?: string;
  county?: string;
  district?: string;
  city?: string;
  coordinates?: { lat: number; lng: number };
  registrationNumbers?: RegistrationNumber[];
  parentOrganizationId?: AmxUid;
  phone?: string;
  email?: string;
  website?: string;
  mission?: string;
  vision?: string;
  coreValues?: string[];
  tagline?: string;
  socials?: string[];
  languages?: string[];
  timezone?: string;
  businessHours?: BusinessHours;
  emergencyContacts?: EmergencyContact[];
  foundedYear?: number;
  actorId?: AmxUid;
}

// ── Constitutional Rules ──────────────────────────────────────────────────────
export interface ConstitutionalRule {
  id: number;
  name: string;
  statement: string;
}

/**
 * The ten constitutional rules of the Facility Organization Engine.
 * Every rule is enforced by the engine, never left as a comment.
 */
export const CONSTITUTIONAL_RULES: readonly ConstitutionalRule[] = [
  { id: 1, name: 'Organization Before Users', statement: 'No clinician exists outside an organization. Organizations own users; users never own organizations.' },
  { id: 2, name: 'Single Constitutional Identity', statement: 'Every organization has exactly one constitutional identity.' },
  { id: 3, name: 'Data Isolation', statement: 'Organizations never share data accidentally.' },
  { id: 4, name: 'Engine Inheritance', statement: 'Organizations inherit constitutional engines.' },
  { id: 5, name: 'Appearance Only', statement: 'Organizations customize appearance. Never constitutional logic.' },
  { id: 6, name: 'Override Boundaries', statement: 'Organizations may override protocols, templates, reports, and branding. Never reasoning, identity, knowledge graph, or evidence engine.' },
  { id: 7, name: 'Local Policy Ownership', statement: 'Organizations own local policies. AMEXAN owns constitutional policies.' },
  { id: 8, name: 'Workflow Ownership', statement: 'Organizations own their workflows. AMEXAN owns workflow engines.' },
  { id: 9, name: 'Unbounded Growth', statement: 'Organizations may grow indefinitely. One clinic. One hundred hospitals. Same engine.' },
  { id: 10, name: 'Universal Containment', statement: 'Everything inside AMEXAN ultimately belongs to an organization.' },
];
