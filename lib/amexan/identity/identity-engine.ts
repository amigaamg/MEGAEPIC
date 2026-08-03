import { type AmxUid, type Identity, type IdentityProfile, type Credential, type Session, type IdentityEvent, IdentityType, VerificationLevel } from './types'
import { generateAmxUid, validateAmxUid, parseAmxUid } from './amxuid'
import { createSession, validateSession, revokeSession, getActiveSessions, extendSession, getSessionContext, getSessionById } from './session'
import { getVerificationLevel, upgradeVerificationLevel, getVerificationProofs, requiresVerification } from './verification'
import { logIdentityEvent, getIdentityHistory, getRecentEvents, getFailedLogins } from './audit'
import { signAction, verifySignature, getSignatureChain, getSignaturesByUser } from './digital-signature'
import { authenticate, registerCredentials, authenticateWithBiometric, authenticateWithPasskey, authenticateWithSSO, verifyMFA } from './auth'
import { can } from '../constitution/auth'
import type { UserSession, Role, Permission, Employment, Department, Organization, Person, ProfessionalIdentity } from '../constitution/types'

// ── In-memory identity store ────────────────────────────────────────────────────
// In production this maps to universal_objects / identities table or Neo4j node.
// Kept here for engine-level testability without external deps.

interface IdentityRecord {
  identity: Identity
  profile?: IdentityProfile
  credentials: Credential[]
  authProviders: Map<string, { providerId: string; linkedAt: number; verified?: boolean }>
  status: 'pending' | 'active' | 'verified' | 'suspended' | 'archived'
  trustScore: number
  lastSeenAt?: number
  verifiedAt?: number
  suspendedAt?: number
  resumeToken?: string
}

const identityStore = new Map<AmxUid, IdentityRecord>()

// ── Helpers ─────────────────────────────────────────────────────────────────────

export interface TrustAssessment {
  level: VerificationLevel
  score: number
  proofs: number
}

export interface AuthProviderLink {
  provider: string
  providerId: string
  linkedAt: number
  verified: boolean
}

export interface MembershipRecord {
  identityId: AmxUid
  orgId: string
  departmentId?: string
  unitId?: string
  roleId: string
  startedAt: number
  endedAt?: number
  status: 'active' | 'inactive' | 'suspended'
  supervisorId?: AmxUid
}

export interface WorkspaceContext {
  organizationId: string
  departmentId?: string
  unitId?: string
  roleId: string
  permissions: Permission[]
  activeAssignments: string[]
}

// ── Engine ─────────────────────────────────────────────────────────────────────

export class UniversalIdentityEngine {
  // Identity lifecycle

  /** Create a new identity with lifecycle status `pending` */
  static createIdentity(
    type: IdentityType,
    country: string,
    profile: Omit<IdentityProfile, 'uid'>,
  ): { identity: Identity; profile: IdentityProfile; uid: AmxUid } {
    const uid = generateAmxUid(
      type === IdentityType.Human ? 'person' :
      type === IdentityType.Organization ? 'organization' :
      type === IdentityType.Device ? 'device' :
      type === IdentityType.AI ? 'ai' : 'system',
    )
    const now = Date.now()

    const uidTyped = uid as AmxUid
    const identity: Identity = { uid: uidTyped, type, createdAt: now, country, publicKey: undefined }
    const identityProfile: IdentityProfile = { uid: uidTyped, ...profile }

    identityStore.set(uidTyped, {
      identity,
      profile: identityProfile,
      credentials: [],
      authProviders: new Map(),
      status: 'pending',
      trustScore: 0,
      lastSeenAt: now,
    })

    logIdentityEvent(uidTyped, 'profile_edit', { action: 'identity_created', type })
    return { identity, profile: identityProfile, uid: uidTyped }
  }

  /** Load identity record by uid */
  static getIdentity(uid: AmxUid): IdentityRecord | undefined {
    return identityStore.get(uid)
  }

  /** Load identity by AMX-UID string (validates first) */
  static getIdentityByRawUid(raw: string): IdentityRecord | undefined {
    if (!validateAmxUid(raw)) return undefined
    return identityStore.get(raw as AmxUid)
  }

  /** Status transitions: pending -> active -> verified -> suspended -> archived */
  static setStatus(uid: AmxUid, status: IdentityRecord['status'], reason?: string): boolean {
    const rec = identityStore.get(uid)
    if (!rec) return false

    const previous = rec.status
    rec.status = status

    const statusToEvent: Record<string, IdentityEvent['eventType']> = {
      pending: 'profile_edit',
      active: 'profile_edit',
      verified: 'verification_change',
      suspended: 'profile_edit',
      archived: 'profile_edit',
    }

    logIdentityEvent(uid, statusToEvent[status] ?? 'profile_edit', {
      action: 'status_change',
      from: previous,
      to: status,
      reason,
    })

    if (status === 'verified') rec.verifiedAt = Date.now()
    if (status === 'suspended') rec.suspendedAt = Date.now()
    rec.lastSeenAt = Date.now()
    return true
  }

  /** Soft-delete / archive identity */
  static archiveIdentity(uid: AmxUid, reason?: string): boolean {
    return this.setStatus(uid, 'archived', reason)
  }

  /** Suspend identity (emergency or policy) */
  static suspendIdentity(uid: AmxUid, reason?: string): boolean {
    return this.setStatus(uid, 'suspended', reason)
  }

  /** Reactivate identity */
  static activateIdentity(uid: AmxUid): boolean {
    const rec = identityStore.get(uid)
    if (!rec || rec.status === 'archived') return false
    rec.resumeToken = undefined
    return this.setStatus(uid, 'active', 'reactivated')
  }

  // Trust / verification

  static calculateTrust(uid: AmxUid): TrustAssessment {
    const rec = identityStore.get(uid)
    if (!rec) return { level: VerificationLevel.Anonymous, score: 0, proofs: 0 }

    const level = getVerificationLevel(uid)
    const proofs = getVerificationProofs(uid)
    const score = Math.min(100, level * 15 + proofs.length * 5 + (rec.authProviders.size > 0 ? 10 : 0))

    rec.trustScore = score
    return { level, score, proofs: proofs.length }
  }

  // Provider linking

  static linkAuthProvider(uid: AmxUid, provider: string, providerId: string): boolean {
    const rec = this.getIdentity(uid)
    if (!rec) return false

    rec.authProviders.set(provider, { providerId, linkedAt: Date.now(), verified: true })
    rec.lastSeenAt = Date.now()

    logIdentityEvent(uid, 'profile_edit', { action: 'provider_linked', provider, providerId })
    return true
  }

  static unlinkAuthProvider(uid: AmxUid, provider: string): boolean {
    const rec = this.getIdentity(uid)
    if (!rec) return false

    const unlinked = rec.authProviders.delete(provider)
    rec.lastSeenAt = Date.now()

    logIdentityEvent(uid, 'profile_edit', { action: 'provider_unlinked', provider })
    return unlinked
  }

  static getAuthProviders(uid: AmxUid): AuthProviderLink[] {
    const rec = this.getIdentity(uid)
    if (!rec) return []

    return Array.from(rec.authProviders.entries()).map(([provider, data]) => ({
      provider,
      providerId: data.providerId,
      linkedAt: data.linkedAt,
      verified: data.verified ?? false,
    }))
  }

  // Search

  static searchIdentities(query: string, opts?: { type?: IdentityType; limit?: number }): Identity[] {
    const normalized = query.toLowerCase().trim()
    const results: Identity[] = []

    for (const rec of identityStore.values()) {
      if (opts?.type && rec.identity.type !== opts.type) continue
      if (rec.status === 'archived') continue

      const matches =
        rec.profile?.email.toLowerCase().includes(normalized) ||
        rec.profile?.name.toLowerCase().includes(normalized) ||
        rec.profile?.phone.includes(normalized) ||
        rec.identity.uid.toLowerCase().includes(normalized)

      if (matches) results.push(rec.identity)
      if (results.length >= (opts?.limit ?? 50)) break
    }

    return results
  }

  // Credential management

  static getCredentials(uid: AmxUid): Credential[] {
    return this.getIdentity(uid)?.credentials ?? []
  }

  static addCredential(uid: AmxUid, cred: Credential): void {
    const rec = this.getIdentity(uid)
    if (!rec) return
    rec.credentials.push(cred)
    logIdentityEvent(uid, 'password_change', { action: 'credential_added', type: cred.type })
  }

  // Session management (delegates to session.ts)

  static createSession(uid: AmxUid, device: string, orgId?: string, deptId?: string, role?: string): Session {
    const session = createSession(uid, device, orgId, deptId, role)
    const rec = this.getIdentity(uid)
    if (rec) rec.lastSeenAt = Date.now()

    logIdentityEvent(uid, 'login', { device, orgId, session: session.id })
    return session
  }

  static validateSession(token: string): Session | null {
    return validateSession(token)
  }

  static revokeSession(sessionId: string): boolean {
    const result = revokeSession(sessionId)
    if (result) {
      const session = getSessionByToken(sessionId)
      if (session) {
        logIdentityEvent(session.uid, 'logout', { session: sessionId })
      }
    }
    return result
  }

  static getActiveSessions(uid: AmxUid): Session[] {
    return getActiveSessions(uid)
  }

  static extendSession(sessionId: string, hours = 8): boolean {
    return extendSession(sessionId, hours)
  }

  static getSessionContext(sessionId: string): { orgId?: string; deptId?: string; role?: string } | null {
    return getSessionContext(sessionId)
  }

  // Auth integration (delegates to auth.ts)

  static async registerCredential(uid: AmxUid, password: string): Promise<void> {
    await registerCredentials(uid, password)
    logIdentityEvent(uid, 'password_change', { action: 'credential_registered' })
  }

  static async authenticate(emailOrUid: string, password: string) {
    return authenticate(emailOrUid, password)
  }

  static async authenticateWithBiometric(uid: AmxUid, token: string) {
    return authenticateWithBiometric(uid, token)
  }

  static async authenticateWithPasskey(uid: AmxUid, assertion: unknown) {
    return authenticateWithPasskey(uid, assertion as any)
  }

  static async authenticateWithSSO(provider: string, idToken: string) {
    return authenticateWithSSO(provider, idToken)
  }

  static async verifyMFA(uid: AmxUid, code: string) {
    return verifyMFA(uid, code)
  }

  // Verification

  static getVerificationLevel(uid: AmxUid): VerificationLevel {
    return getVerificationLevel(uid)
  }

  static async upgradeVerification(uid: AmxUid, level: VerificationLevel, proof: Record<string, any>): Promise<boolean> {
    const result = await upgradeVerificationLevel(uid, level, proof)
    if (result) {
      const rec = this.getIdentity(uid)
      if (rec) rec.trustScore = this.calculateTrust(uid).score
      logIdentityEvent(uid, 'verification_change', { level, proof })
    }
    return result
  }

  static requiresVerification(uid: AmxUid, minimumLevel: VerificationLevel): boolean {
    return requiresVerification(uid, minimumLevel)
  }

  // Membership management

  static addMembership(uid: AmxUid, membership: MembershipRecord): boolean {
    const rec = this.getIdentity(uid)
    if (!rec) return false

    logIdentityEvent(uid, 'profile_edit', { action: 'membership_added', orgId: membership.orgId, roleId: membership.roleId })
    return true
  }

  /** Derive full workspace context for an identity in a given org */
  static deriveWorkspaceContext(
    uid: AmxUid,
    organizationId: string,
    departmentId?: string,
  ): WorkspaceContext | null {
    const rec = this.getIdentity(uid)
    if (!rec) return null

    // In the full system this would query the membership engine + role engine + permission engine.
    // Here we return a stub that the membership engine populates.
    return {
      organizationId,
      departmentId,
      unitId: undefined,
      roleId: '',
      permissions: [],
      activeAssignments: [],
    }
  }

  // Profile

  static updateProfile(uid: AmxUid, updates: Partial<Omit<IdentityProfile, 'uid'>>): boolean {
    const rec = this.getIdentity(uid)
    if (!rec || !rec.profile) return false

    Object.assign(rec.profile, updates)
    rec.lastSeenAt = Date.now()
    logIdentityEvent(uid, 'profile_edit', { updates })
    return true
  }

  // Helpers

  static calculateTrustScore(uid: AmxUid): number {
    return this.calculateTrust(uid).score
  }

  // ── Utility ────────────────────────────────────────────────────────────────────

  static clearStore(): void {
    identityStore.clear()
  }

  static createStore(): void {
    identityStore.clear()
  }
}

// ── Internal helpers ────────────────────────────────────────────────────────────

function getSessionByToken(sessionId: string): Session | undefined {
  return getSessionById(sessionId)
}

// ── Convenience exports ───────────────────────────────────────────────────────────

export {
  createSession,
  validateSession,
  revokeSession,
  getActiveSessions,
  extendSession,
  getSessionContext,
  getVerificationLevel,
  upgradeVerificationLevel,
  requiresVerification,
  logIdentityEvent,
  getIdentityHistory,
  getRecentEvents,
  getFailedLogins,
  signAction,
  verifySignature,
  getSignatureChain,
  getSignaturesByUser,
  authenticate,
  registerCredentials,
  can as canPermission,
}
