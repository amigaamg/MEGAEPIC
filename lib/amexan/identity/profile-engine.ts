// ── Profile & Preferences Engine ────────────────────────────────────────────────
// Manages identity profile attributes and user preferences with persistence hooks.

import type { AmxUid, IdentityProfile, VerificationLevel } from './types'
import { UniversalIdentityEngine } from './identity-engine'
import { getVerificationLevel, requiresVerification, upgradeVerificationLevel } from './verification'
import { logIdentityEvent } from './audit'

// ── Preference Types ────────────────────────────────────────────────────────────

export interface UserProfileData {
  uid: AmxUid
  fullName: string
  givenName: string
  familyName: string
  email: string
  phone: string
  photoUrl?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'undisclosed'
  nationality?: string
  country?: string
  address?: string
  emergencyContact?: { name: string; phone: string; relation: string }
  preferredName?: string
  pronouns?: string
  language?: string
  timezone?: string
  accessibility?: {
    highContrast?: boolean
    largeFonts?: boolean
    reducedMotion?: boolean
    screenReader?: boolean
  }
  theme?: 'light' | 'dark' | 'system'
  density?: 'compact' | 'standard' | 'comfortable'
}

export interface UserPreferences {
  uid: AmxUid
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  units: {
    weight: 'kg' | 'lb'
    height: 'cm' | 'inch'
    temperature: 'celsius' | 'fahrenheit'
    pressure: 'mmhg' | 'kpa'
  }
  density: 'compact' | 'standard' | 'comfortable'
  notifications: {
    clinical: boolean
    administrative: boolean
    educational: boolean
    research: boolean
    marketing: boolean
  }
  accessibility: {
    highContrast: boolean
    largeFonts: boolean
    reducedMotion: boolean
    screenReader: boolean
  }
  keyboard: {
    enableShortcuts: boolean
    vimMode: boolean
  }
  dashboard: {
    defaultLayout: string
    compactMode: boolean
  }
  updatedAt: number
}

export interface TrustProfile {
  uid: AmxUid
  level: VerificationLevel
  score: number
  proofs: number
  nextUpgrade?: { level: VerificationLevel; requirements: string[] }
  verifiedAt?: number
}

// ── Defaults ─────────────────────────────────────────────────────────────────────

const DEFAULT_PREFERENCES: UserPreferences = {
  uid: '' as AmxUid,
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  units: { weight: 'kg', height: 'cm', temperature: 'celsius', pressure: 'mmhg' },
  density: 'standard',
  notifications: { clinical: true, administrative: true, educational: false, research: false, marketing: false },
  accessibility: { highContrast: false, largeFonts: false, reducedMotion: false, screenReader: false },
  keyboard: { enableShortcuts: true, vimMode: false },
  dashboard: { defaultLayout: 'standard', compactMode: false },
  updatedAt: Date.now(),
}

// ── In-memory store ─────────────────────────────────────────────────────────────

const profileStore = new Map<string, UserProfileData>()
const preferenceStore = new Map<AmxUid, UserPreferences>()

// ── Engine ─────────────────────────────────────────────────────────────────────

export class UniversalProfileEngine {
  // Profile operations

  static getProfile(uid: AmxUid): UserProfileData | undefined {
    return profileStore.get(uid) ?? this.buildProfileFromIdentity(uid)
  }

  static updateProfile(uid: AmxUid, updates: Partial<UserProfileData>): UserProfileData | undefined {
    let profile = profileStore.get(uid)
    if (!profile) {
      profile = this.buildProfileFromIdentity(uid)
      if (!profile) return undefined
    }

    Object.assign(profile, updates)
    profile.uid = uid
    profileStore.set(uid, profile)

    logIdentityEvent(uid, 'profile_edit', { updated: Object.keys(updates) })
    return profile
  }

  static createProfile(uid: AmxUid, data: Omit<UserProfileData, 'uid'>): UserProfileData {
    const profile: UserProfileData = { uid, ...data }
    profileStore.set(uid, profile)
    logIdentityEvent(uid, 'profile_edit', { action: 'profile_created' })
    return profile
  }

  static deleteProfile(uid: AmxUid): boolean {
    const deleted = profileStore.delete(uid)
    if (deleted) logIdentityEvent(uid, 'profile_edit', { action: 'profile_deleted' })
    return deleted
  }

  // Preferences

  static getPreferences(uid: AmxUid): UserPreferences {
    const existing = preferenceStore.get(uid)
    if (existing) return existing

    const defaults = { ...DEFAULT_PREFERENCES, uid }
    preferenceStore.set(uid, defaults)
    return defaults
  }

  static updatePreferences(uid: AmxUid, updates: Partial<Omit<UserPreferences, 'uid' | 'updatedAt'>>): UserPreferences {
    const current = this.getPreferences(uid)
    const updated: UserPreferences = {
      ...current,
      ...updates,
      updatedAt: Date.now(),
    }
    preferenceStore.set(uid, updated)
    return updated
  }

  static resetPreferences(uid: AmxUid): UserPreferences {
    const defaults = { ...DEFAULT_PREFERENCES, uid }
    preferenceStore.set(uid, defaults)
    return defaults
  }

  // Trust profile

  static getTrustProfile(uid: AmxUid): TrustProfile | undefined {
    const level = getVerificationLevel(uid)
    const verification = UniversalIdentityEngine.getIdentity(uid)
    const proofs = verification ? verification.credentials.length + verification.authProviders.size : 0

    return {
      uid,
      level,
      score: UniversalIdentityEngine.calculateTrustScore(uid),
      proofs,
      verifiedAt: level >= 3 ? verification?.verifiedAt : undefined,
    }
  }

  static async requestVerificationUpgrade(
    uid: AmxUid,
    targetLevel: VerificationLevel,
    proof: Record<string, any>,
  ): Promise<{ success: boolean; error?: string }> {
    const current = getVerificationLevel(uid)
    if (current >= targetLevel) {
      return { success: false, error: 'Already at or above requested level' }
    }

    const ok = await upgradeVerificationLevel(uid, targetLevel, proof)
    if (ok) {
      logIdentityEvent(uid, 'verification_change', { targetLevel, proof })
      return { success: true }
    }
    return { success: false, error: 'Verification upgrade failed' }
  }

  // Privacy / consent settings

  static getPrivacySettings(uid: AmxUid): { anonymousResearch: boolean; shareWithInsurance: boolean; shareWithPublicHealth: boolean } {
    // In production loads from preferences store or consent engine
    const prefs = this.getPreferences(uid)
    return {
      anonymousResearch: prefs.notifications.research,
      shareWithInsurance: true,
      shareWithPublicHealth: true,
    }
  }

  static updatePrivacySettings(
    uid: AmxUid,
    settings: Partial<{ anonymousResearch: boolean; shareWithInsurance: boolean; shareWithPublicHealth: boolean }>,
  ): boolean {
    const prefs = this.getPreferences(uid)
    if (settings.anonymousResearch !== undefined) {
      prefs.notifications.research = settings.anonymousResearch
    }
    preferenceStore.set(uid, prefs)
    logIdentityEvent(uid, 'profile_edit', { action: 'privacy_settings_updated', settings })
    return true
  }

  // ── Internal helpers ───────────────────────────────────────────────────────────

  private static buildProfileFromIdentity(uid: AmxUid): UserProfileData | undefined {
    const rec = UniversalIdentityEngine.getIdentity(uid)
    if (!rec) return undefined
    return {
      uid,
      fullName: rec.profile?.name ?? '',
      givenName: '',
      familyName: '',
      email: rec.profile?.email ?? '',
      phone: rec.profile?.phone ?? '',
      photoUrl: rec.profile?.photo,
      address: rec.profile?.address,
      emergencyContact: rec.profile?.emergencyContact
        ? {
            name: rec.profile.emergencyContact.name,
            phone: rec.profile.emergencyContact.phone,
            relation: rec.profile.emergencyContact.relation,
          }
        : undefined,
    }
  }

  // ── Utilities ──────────────────────────────────────────────────────────────────

  static clearStore(): void {
    profileStore.clear()
    preferenceStore.clear()
  }
}

// ── Convenience exports ───────────────────────────────────────────────────────────

export {
  getVerificationLevel as getIdentityVerificationLevel,
  requiresVerification as identityRequiresVerification,
  upgradeVerificationLevel as identityUpgradeVerification,
  logIdentityEvent as logIdentityEvent,
}
