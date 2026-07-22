// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Constitution — Public API
// ═══════════════════════════════════════════════════════════════════════════════

export type * from './types';

export {
  can,
  generateDashboard,
  buildEmptySession,
} from './auth';

export {
  validateIdentityStep,
  validateProfessionalStep,
  validateOrganizationCreateStep,
  REGISTRATION_STEPS,
} from './registration';

export type {
  RegistrationStep,
  RegistrationState,
  RegistrationData,
  RegistrationErrors,
  StepConfig,
} from './registration';

// ── Firestore Service ─────────────────────────────────────────────────────────
export {
  identityRef, identitiesCol,
  personRef, personsCol,
  professionalRef, professionalsCol,
  orgRef, orgsCol,
  orgDeptRef, orgDeptsCol,
  orgEmploymentRef, orgEmploymentsCol,
  orgAssignmentRef, orgAssignmentsCol,
  roleRef, rolesCol,
  orgRoleRef, orgRolesCol,
  orgMemberRef, orgMembersCol,
  createIdentity, getIdentity, updateIdentity,
  createPerson, getPerson, updatePerson,
  createProfessional, getProfessional, updateProfessional,
  createOrganization, getOrganization, updateOrganization, listOrganizations, searchOrganizations,
  createDepartment, getDepartment, updateDepartment, deleteDepartment, listDepartments,
  createEmployment, getEmployment, updateEmployment, listEmployments, listPersonEmployments,
  createAssignment, getAssignment, updateAssignment, listAssignments, listPersonAssignments,
  createRole, createOrgRole, getRole, getOrgRole, updateRole, listRoles,
  addOrgMember, getOrgMember, updateOrgMember, removeOrgMember, listOrgMembers, listUserOrganizations,
} from './firestoreService';

export type { OrgMemberRecord } from './firestoreService';

// ── Audit Trail ───────────────────────────────────────────────────────────────
export {
  computeIntegrityHash,
  createAuditEntry,
  verifyAuditEntryIntegrity,
  verifyAuditChain,
  getAuditLogs,
  recordAccess,
} from './audit';

// ── Session Management ─────────────────────────────────────────────────────────
export type {
  SessionToken,
  DeviceInfo,
} from './session';
export {
  createSessionToken,
  validateSessionToken,
  refreshSessionToken,
  computeTrustScore,
  composeUserSession,
} from './session';

// ── Organization Engines ───────────────────────────────────────────────────────
export type {
  OrgTree, DeptTreeNode, UnitNode,
} from './hierarchy';
export type {
  BrandedDocument, BrandingPreview,
} from './branding';
export type {
  Bed, BedOccupancyReport,
} from './bed-management';
export type {
  WorkerRegistration,
} from './organization-admin';
export {
  buildOrgTree, findDepartmentById, getDepartmentChain,
  getBedsInWard, formatAddress, getOrgStats,
} from './hierarchy';
export {
  applyBranding, getBrandingPreview,
} from './branding';
export {
  createBed, assignBed, releaseBed, markBedCleaned,
  getAvailableBeds, getBedOccupancyReport, getBedsByStatus,
} from './bed-management';
export {
  registerWorker, transferWorker, suspendWorker, terminateWorker,
  getDepartmentStats, getOrgCapacity,
} from './organization-admin';

// ── Workforce Engines ──────────────────────────────────────────────────────────
export type { Shift } from './shift-engine';
export type { SchedulePattern, ScheduleException, WeeklyRoster } from './schedule-engine';
export type { AssignmentTemplate } from './assignment-engine';
export type { Credential } from './credential-engine';
export type { PositionLevel, PositionInfo } from './positions';
export {
  createShift, clockIn, clockOut, startBreak, endBreak,
  getCurrentShift, getActiveWorkers, getShiftsByDate,
  requestShiftSwap, approveShiftSwap,
} from './shift-engine';
export {
  createSchedulePattern, getTodaySchedule, getOnCallWorkers,
  detectScheduleConflicts, generateWeeklyRoster,
} from './schedule-engine';
export {
  makeAssignment, getCurrentAssignment, getAssignmentQueue,
  startAssignment, completeAssignment, cancelAssignment,
  ASSIGNMENT_TEMPLATES,
} from './assignment-engine';
export {
  verifyLicense, getExpiredCredentials, addCredential,
  verifyCredential, rejectCredential, checkCredentialExpiry,
  getPendingVerifications,
} from './credential-engine';
export {
  getPositionInfo, getPositionAuthority, getSupervisorChain,
  getPositionsByCategory, getAllPositions, canSuperviseLevel,
} from './positions';

// ── Authorization & Policy Engine ─────────────────────────────────────────────
export type {
  Policy, PolicySubject, PolicyResource, PolicyCondition,
  PolicyEvaluationRequest, PolicyEvaluationResult,
  BreakGlassEvent, DualAuthRequest, Delegation,
} from './policy-engine';
export {
  evaluatePolicy, evaluatePolicies, createPolicy,
  breakGlassAccess, requireDualAuth, authorizeDual,
  delegateAuthority, revokeDelegation, getActiveDelegations,
  getPatientRelationship,
} from './policy-engine';

// ── Workspace Engine ───────────────────────────────────────────────────────────
export type {
  WorkspaceLayout, WorkspacePane, WorkspaceContext,
} from './workspace-engine';
export {
  generateWorkspace, getWorkspaceModules, ASSIGNMENT_LAYOUTS,
} from './workspace-engine';

// ── Data Constitution ──────────────────────────────────────────────────────────
export type {
  ClinicalEvent, ClinicalEventType, ClinicalProvenance,
  TerminologyMapping, DocumentVersion, SearchIndexEntry,
} from './data-constitution';
export {
  appendEvent, getPatientTimeline, reconstructState,
  mapToSystem, getConceptDisplay,
  createVersion, addVersion, getVersionHistory, compareVersions,
  indexEntry, search,
} from './data-constitution';

// ── AMX-UID Generator ─────────────────────────────────────────────────────────
export {
  generateAmxUid,
  validateAmxUid,
  getAmxUidType,
} from './amxuid';

// ── Verification Engine ────────────────────────────────────────────────────────
export type {
  VerificationLevel,
  VerificationState,
  VerificationLevelInfo,
} from './verification';
export {
  getVerificationLevelLabel,
  getVerificationRequirements,
  createVerificationState,
  upgradeVerificationLevel,
  canAccessFeature,
  getNextRequiredLevel,
  isVerificationExpired,
} from './verification';

// ── Account Recovery ───────────────────────────────────────────────────────────
export type {
  RecoveryRequest,
  RecoveryEvent,
} from './recovery';
export {
  generateRecoveryCode,
  createRecoveryRequest,
  initiateRecovery,
  isRecoveryExpired,
  isRecoveryBlocked,
  verifyRecoveryCode,
  getBackupCodes,
} from './recovery';

// ── Digital Signature ─────────────────────────────────────────────────────────
export {
  signDocument,
  verifySignature,
  revokeSignature,
  getDocumentSignatures,
  getPersonSignatures,
} from './signatureService';
