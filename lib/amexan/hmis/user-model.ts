// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book II: Universal User Model
// Every human is an Actor. One person may hold many roles simultaneously.
// Role changes. Identity never changes.
// ═══════════════════════════════════════════════════════════════════════════════

export interface Actor {
  id: string;
  identityId: string;
  personId: string;
  type: ActorType;
  activeRoles: ActorRole[];
  currentSession?: SessionInfo;
  permissions: string[];
  tasks: TaskAssignment[];
  status: ActorStatus;
  lastActiveAt: number;
  createdAt: number;
}

export enum ActorType {
  Person = 'person',
  Patient = 'patient',
  Clinician = 'clinician',
  Nurse = 'nurse',
  Pharmacist = 'pharmacist',
  LabScientist = 'lab_scientist',
  Radiographer = 'radiographer',
  Receptionist = 'receptionist',
  Administrator = 'administrator',
  FacilityAdmin = 'facility_admin',
  SuperAdmin = 'super_admin',
  Researcher = 'researcher',
  Student = 'student',
  Consultant = 'consultant',
  TelemedicineProvider = 'telemedicine_provider',
  Caregiver = 'caregiver',
  Guardian = 'guardian',
  ITStaff = 'it_staff',
  FinanceStaff = 'finance_staff',
  HRStaff = 'hr_staff',
  RecordsOfficer = 'records_officer',
  Physiotherapist = 'physiotherapist',
  Nutritionist = 'nutritionist',
  SocialWorker = 'social_worker',
  Chaplain = 'chaplain',
  Volunteer = 'volunteer',
  Vendor = 'vendor',
  Auditor = 'auditor',
  System = 'system',
}

export enum ActorStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Terminated = 'terminated',
  OnLeave = 'on_leave',
  OffDuty = 'off_duty',
  Away = 'away',
  Busy = 'busy',
}

export interface ActorRole {
  roleId: string;
  roleName: string;
  organizationId: string;
  departmentId?: string;
  unitId?: string;
  isPrimary: boolean;
  startedAt: number;
  endedAt?: number;
  permissions: string[];
  scope: RoleScope;
}

export interface RoleScope {
  type: 'global' | 'organization' | 'department' | 'unit' | 'self';
  organizationIds?: string[];
  departmentIds?: string[];
  unitIds?: string[];
}

export interface SessionInfo {
  sessionId: string;
  startedAt: number;
  lastActivityAt: number;
  deviceInfo: DeviceInfo;
  location?: string;
  ipAddress?: string;
  authMethod: UserAuthMethod;
  expiresAt: number;
  isActive: boolean;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet' | 'kiosk' | 'integration';
  os?: string;
  browser?: string;
  appVersion?: string;
  deviceId?: string;
  userAgent?: string;
}

export enum UserAuthMethod {
  Password = 'password',
  Biometric = 'biometric',
  TwoFactor = 'two_factor',
  SSO = 'sso',
  QRCode = 'qr_code',
  RFID = 'rfid',
  ApiKey = 'api_key',
  BreakGlass = 'break_glass',
}

import { TaskType, TaskPriority, TaskStatus, TaskSource } from './task-engine';

export interface TaskAssignment {
  taskId: string;
  taskType: TaskType;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  source: TaskSource;
  sourceId: string;
  assignedBy: string;
  assignedAt: number;
  startedAt?: number;
  completedAt?: number;
  dueBy?: number;
  dependsOn: string[];
  departmentId?: string;
  patientId?: string;
  encounterId?: string;
  metadata: Record<string, unknown>;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  defaultDepartment?: string;
  defaultWorkType?: string;
  shortcuts: Record<string, string>;
  dashboardLayout?: string;
  signature?: string;
}

export interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
  quietHoursFrom?: string;
  quietHoursTo?: string;
  criticalOnly: boolean;
}

export interface ActorWithIdentity {
  actor: Actor;
  identity: {
    amxUid: string;
    email: string;
    phone: string;
    fullName: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    nationalId: string;
    photoUrl?: string;
  };
  professional?: {
    licenseNumber: string;
    councilNumber: string;
    qualifications: string[];
    specialties: string[];
    yearsOfExperience: number;
  };
  organizations: {
    id: string;
    name: string;
    role: string;
    department: string;
    isPrimary: boolean;
  }[];
}

export function createActor(
  actorId: string,
  identityId: string,
  personId: string,
  type: ActorType,
): Actor {
  return {
    id: actorId,
    identityId,
    personId,
    type,
    activeRoles: [],
    permissions: [],
    tasks: [],
    status: ActorStatus.Active,
    lastActiveAt: Date.now(),
    createdAt: Date.now(),
  };
}

export function assignRole(actor: Actor, role: ActorRole): Actor {
  const existing = actor.activeRoles.findIndex(r => r.roleId === role.roleId);
  if (existing >= 0) {
    actor.activeRoles[existing] = role;
  } else {
    actor.activeRoles.push(role);
  }
  const merged = [...actor.permissions, ...role.permissions];
  actor.permissions = merged.filter((p, i) => merged.indexOf(p) === i);
  return actor;
}

export function removeRole(actor: Actor, roleId: string): Actor {
  actor.activeRoles = actor.activeRoles.filter(r => r.roleId !== roleId);
  actor.permissions = actor.activeRoles.flatMap(r => r.permissions);
  return actor;
}

export function hasPermission(actor: Actor, permission: string): boolean {
  return actor.permissions.includes(permission) || actor.permissions.includes('*');
}

export function hasAnyPermission(actor: Actor, permissions: string[]): boolean {
  return permissions.some(p => hasPermission(actor, p));
}

export function hasAllPermissions(actor: Actor, permissions: string[]): boolean {
  return permissions.every(p => hasPermission(actor, p));
}

export function getActiveTaskCount(actor: Actor): number {
  return actor.tasks.filter(t =>
    t.status === TaskStatus.Assigned ||
    t.status === TaskStatus.Accepted ||
    t.status === TaskStatus.InProgress
  ).length;
}

export function getTaskByPriority(actor: Actor): TaskAssignment[] {
  const priorityOrder = [TaskPriority.STAT, TaskPriority.Emergency, TaskPriority.Urgent, TaskPriority.High, TaskPriority.Medium, TaskPriority.Low, TaskPriority.Routine];
  return [...actor.tasks].sort((a, b) => {
    const aIdx = priorityOrder.indexOf(a.priority);
    const bIdx = priorityOrder.indexOf(b.priority);
    return aIdx - bIdx;
  });
}

export function getActorTaskSummary(actor: Actor): {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
} {
  const now = Date.now();
  return {
    total: actor.tasks.length,
    pending: actor.tasks.filter(t => t.status === TaskStatus.Assigned).length,
    inProgress: actor.tasks.filter(t => t.status === TaskStatus.InProgress || t.status === TaskStatus.Accepted).length,
    completed: actor.tasks.filter(t => t.status === TaskStatus.Completed).length,
    overdue: actor.tasks.filter(t => t.dueBy && t.dueBy < now && t.status !== TaskStatus.Completed).length,
  };
}

export function createSession(actorId: string, deviceInfo: DeviceInfo, authMethod: UserAuthMethod): SessionInfo {
  return {
    sessionId: `SES-${Date.now().toString(36).toUpperCase()}`,
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    deviceInfo,
    authMethod,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
    isActive: true,
  };
}
