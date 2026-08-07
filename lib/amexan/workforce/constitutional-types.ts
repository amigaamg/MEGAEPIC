// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Workforce Constitutional Engine — Engine II — Constitutional Types
// Constitutional principle: Authentication ≠ Identity ≠ Employment ≠ Privileges
//   ≠ Assignments ≠ Sessions. Each is a SEPARATE, first-class constitutional
//   object that is related — never merged. Everything starts from Person.
//
// NOTE: these live in `constitutional-types.ts` (not `types.ts`) because a
// pre-existing Book IV workforce module owns `types.ts` with its own legacy
// Employment/Shift/Schedule shapes. Engine II builds alongside it.
// ═══════════════════════════════════════════════════════════════════════════════

/** One human, one identity, forever (AMX-PER-XXXX). Never duplicated. */
export interface Person {
  id: string; // AMX-PER-XXXX
  nationalId: string;
  passport: string;
  givenName: string;
  familyName: string;
  otherNames: string[];
  dob: string; // ISO date
  gender: 'male' | 'female' | 'undisclosed' | 'other';
  email: string;
  phone: string;
  addresses: { type: 'home' | 'work' | 'postal'; line1: string; county: string; country: string }[];
  emergencyContact: { name: string; phone: string; relationship: string };
  photoUrl: string;
  signatureUrl: string;
  biometricHash: string;
  languages: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ProfessionalIdentity {
  personId: string;             // === person.id (the AMX-PER)
  category: string;             // registered in the Professional Registry
  primaryCategory: string;
  categories: string[];
  professionalNumber: string;   // e.g. medical council number
  council: string;              // e.g. Kenya Medical Practitioners Council
  board: string;
  licenseRefs: string[];
  licenseStatus: 'active' | 'expired' | 'suspended' | 'provisional';
  licenseExpiry: string;
  qualifications: { degree: string; institution: string; year: number }[];
  specialties: string[];
  subspecialties: string[];
  competencies: string[];       // registry competency ids
  credits: number;              // CPD credits
  verified: boolean;
}

export interface Employment {
  /** belongs to a Facility/Organization, NOT the person. */
  id: string; // AMX-EMP-XXXX
  organizationId: string;
  personId: string;
  facilityId?: string;          // node id in the Digital Twin
  departmentId?: string;        // node id
  employeeNumber: string;
  jobTitle: string;
  professionalCategory: string;
  employmentType: 'permanent' | 'contract' | 'locum' | 'visiting' | 'intern' | 'trainee' | 'volunteer';
  rank: string;
  salaryScale: string;
  supervisorId?: string;        // another personId
  startDate: string;
  endDate?: string;
  status: 'active' | 'on_leave' | 'suspended' | 'terminated' | 'retired';
  contractRef: string;
  benefits: string[];
}

/** A day-level work commitment. Employment ≠ what happens *today*. */
export interface Assignment {
  id: string; // AMX-ASSIGN-XXXX
  employmentId: string;
  personId: string;
  locationNodeId: string; // Ward / Clinic / Department node in the Digital Twin
  locationName: string;
  assignedPatientsIds: string[];
  shiftStart: string; // ISO datetime
  shiftEnd: string;
  shiftType: 'day' | 'night' | 'call' | 'weekend' | 'oncall' | 'theatre';
  coverage: string[];
  role: string;
}

/** Granular, computable capability — never derived from role alone. */
export interface Privilege {
  id: string; // privilege catalog id
  name: string;
  scope: string;   // 'global' | orgId | department node id
  granted: boolean;
  grantedBy: string; // role / employment / department / competency / local policy
  grantedAt: number;
  expiresAt?: number;
}

export interface Competency {
  id: string; // registry competency id or procedure id
  name: string;
  category: string;
  level: 'observed' | 'supervised' | 'independent' | 'expert';
  count: number;    // e.g. 15 appendectomies
  verifiedAt: string;
  verifiedBy: string;
}

export interface Credential {
  id: string;
  name: string;      // e.g. BLS, ACLS, medical license
  type: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  status: 'valid' | 'expired' | 'expiring' | 'revoked';
  documents: string[];
}

export interface WorkforceScheduleEntry {
  date: string;              // YYYY-MM-DD
  shift: string;             // 'day' | 'night' | 'call' …
  startTime: string;
  endTime: string;
  assignmentId?: string;
  locationNodeId: string;
  status: 'scheduled' | 'confirmed' | 'leave' | 'swapped' | 'overtime' | 'holiday';
}

/** Workspace is COMPUTED — never chosen: Role × Privileges × Assignment × Department. */
export interface Workspace {
  actorId: string;
  family: string;       // executive / clinical / nursing / lab / pharmacy / … (WorkspaceGuard family)
  primaryRoute: string; // dashboard route
  allowedEngines: string[];
  activeAssignmentId?: string;
}