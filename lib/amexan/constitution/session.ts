import type { AmxUid, UserSession, Identity, Person, ProfessionalIdentity, Organization, Employment, Department, Assignment, Role, Permission, Responsibility, WorkSchedule } from './types';
import { buildEmptySession } from './auth';

export interface SessionToken {
  token: string;
  uid: AmxUid;
  deviceId: string;
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
  trustScore: number;
}

export interface DeviceInfo {
  id: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  name: string;
  os?: string;
  browser?: string;
  ip?: string;
  trusted: boolean;
  lastUsedAt: number;
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function computeTrustScore(device: DeviceInfo, identity: Identity): number {
  let score = 50;
  if (device.trusted) score += 20;
  if (identity.twoFactorEnabled) score += 15;
  if (identity.verified) score += 10;
  if (device.type !== 'unknown') score += 5;
  return Math.min(score, 100);
}

export function createSessionToken(
  uid: AmxUid,
  device: DeviceInfo,
  identity: Identity,
): SessionToken {
  const now = Date.now();
  return {
    token: generateToken(),
    uid,
    deviceId: device.id,
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    lastActivityAt: now,
    trustScore: computeTrustScore(device, identity),
  };
}

export function validateSessionToken(token: SessionToken): { valid: boolean; reason?: string } {
  if (Date.now() > token.expiresAt) {
    return { valid: false, reason: 'Session expired' };
  }
  if (token.trustScore < 30) {
    return { valid: false, reason: 'Device trust score too low' };
  }
  return { valid: true };
}

export function refreshSessionToken(token: SessionToken): SessionToken {
  return {
    ...token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    lastActivityAt: Date.now(),
  };
}

export function composeUserSession(params: {
  identity: Identity;
  person: Person;
  professional: ProfessionalIdentity | null;
  organizations: Organization[];
  employments: Employment[];
  currentEmployment: Employment | null;
  currentOrganization: Organization | null;
  currentDepartment: Department | null;
  currentAssignments: Assignment[];
  role: Role;
  permissions: Permission[];
  responsibilities: Responsibility[];
}): UserSession {
  const now = new Date();
  const hour = now.getHours();

  const isOnDuty = params.currentAssignments.some(
    a => a.status === 'active' || a.status === 'scheduled'
  );

  return {
    identity: params.identity,
    person: params.person,
    professional: params.professional,
    employments: params.employments,
    currentEmployment: params.currentEmployment,
    currentOrganization: params.currentOrganization,
    currentDepartment: params.currentDepartment,
    currentAssignments: params.currentAssignments,
    role: params.role,
    permissions: params.permissions,
    responsibilities: params.responsibilities,
    isAuthenticated: true,
    isLoading: false,
    onDuty: isOnDuty,
    currentShift: params.currentEmployment?.schedule,
    activePatientIds: [],
    activeEncounterIds: [],
  };
}
