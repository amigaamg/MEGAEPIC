export type AmxUid = string & { readonly __brand: 'AMX-UID' }

export enum IdentityType {
  Human = 'human',
  Organization = 'org',
  Device = 'device',
  AI = 'ai',
  System = 'system',
}

export enum VerificationLevel {
  Anonymous = 0,
  EmailVerified = 1,
  GovernmentIdVerified = 2,
  ProfessionalLicenseVerified = 3,
  InstitutionalVerified = 4,
  SystemTrust = 5,
}

export interface Identity {
  uid: AmxUid
  type: IdentityType
  createdAt: number
  country: string
  publicKey?: string
}

export interface IdentityProfile {
  uid: AmxUid
  name: string
  phone: string
  email: string
  photo?: string
  address?: string
  emergencyContact?: { name: string; phone: string; relation: string }
}

export interface Credential {
  type: 'password' | 'biometric' | 'passkey' | 'sso'
  hash: string
  salt: string
  updatedAt: number
}

export interface Session {
  id: string
  uid: AmxUid
  device: string
  orgId?: string
  deptId?: string
  role?: string
  assignmentId?: string
  createdAt: number
  expiresAt: number
  lastActivity: number
  revoked: boolean
}

export interface IdentityEvent {
  id: string
  uid: AmxUid
  eventType: 'login' | 'logout' | 'failed_login' | 'password_change' | 'profile_edit' | 'verification_change' | 'recovery_initiated' | 'recovery_completed' | 'signature_created'
  details: Record<string, any>
  timestamp: number
  ip?: string
  userAgent?: string
}
