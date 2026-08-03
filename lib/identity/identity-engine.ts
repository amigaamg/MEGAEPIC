// AMEXAN Universal Identity Engine
// Phase 4.2.1 - Foundation Implementation
// Constitutional: Identity is permanent, authentication is temporary

import { create } from 'zustand'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { createId, generateAmxId } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, getAuth } from 'firebase/auth'

export type IdentityType = 
  | 'patient' 
  | 'doctor' 
  | 'nurse' 
  | 'researcher' 
  | 'administrator' 
  | 'student' 
  | 'government' 
  | 'ngo' 
  | 'insurance' 
  | 'facility' 
  | 'corporate' 
  | 'private_practice'

export interface Identity {
  // Constitutional: Identity never changes
  id: string                      // AMXID - permanent, unique, never reused
  amxpId: string                  // AMXPID - patient-facing ID
  amxfid: string                  // AMXFID - external-facing ID
  amxorg: string                  // AMXORG - primary organization
  type: IdentityType
  profile: IdentityProfile
  authentication: AuthenticationProfile
  memberships: Membership[]
  preferences: IdentityPreferences
  security: IdentitySecurity
  verification: IdentityVerificationStatus
  activity: IdentityActivity
  audit: IdentityAuditTrail
  status: 'active' | 'suspended' | 'verified' | 'unverified' | 'archived'
  createdAt: Date
  lastLogin?: Date
  migratedFrom?: string        // If migrating from external systems
}

export interface IdentityProfile {
  // Constitutional: Not roles - what the person is
  name: {
    first: string
    last: string
    preferred?: string
    formal?: string
  }
  demographics: {
    sex?: 'male' | 'female' | 'other' | 'unknown'
    dateOfBirth?: Date
    age?: number
    nationality?: string
    language?: string
    religion?: string
    education?: string
    occupation?: string
  }
  contact: {
    email: string
    phone?: string
    secondaryEmail?: string
    emergencyContact?: ContactInfo
    address?: Address
  }
  identifiers: {
    nationalId?: string
    passport?: string
    driversLicense?: string
    insuranceId?: string
    medicalRecordNumber?: string
  }
  permissions: string[]
}

export interface AuthenticationProfile {
  // Constitutional: Authentication methods can change, identity never
  methods: AuthMethod[]
  lastValidated: Date
  verifiedAt: Date
  factors: AuthFactors
  recovery: RecoverySettings
  sessions: AuthSession[]
  securityLevel: 'basic' | 'verified' | 'trusted' | 'enterprise'
}

export interface AuthMethod {
  provider: 'email' | 'google' | 'microsoft' | 'phone' | 'biometric' | 'saml' | 'oidc' | 'ldap' | 'national'
  identifier: string
  isPrimary: boolean
  verified: boolean
  lastUsed?: Date
  metadata?: Record<string, any>
}

export interface AuthFactors {
  emailVerified: boolean
  phoneVerified: boolean
  identityVerified: boolean
  professionVerified?: boolean
  organizationVerified?: boolean
}

export interface RecoverySettings {
  recoveryEmail?: string
  tempCodes?: TempCode[]
  twoFactorEnabled: boolean
  emergencyAccess: EmergencyAccess
}

export interface TempCode {
  code: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

export interface EmergencyAccess {
  approvedContacts: string[]
  limitedTime: number
  purpose: string
}

export interface AuthSession {
  id: string
  device: string
  ipAddress: string
  location: string
  userAgent: string
  expiresAt: Date
  lastActive: Date
  isTrusted: boolean
}

export interface Membership {
  // Constitutional: Organizations belong to identity, not vice versa
  organizationId: string
  organizationName: string
  amxorg: string
  role: OrganizationRole
  department?: string
  unit?: string
  ward?: string
  startDate: Date
  endDate?: Date
  status: 'active' | 'suspended' | 'invited' | 'pending'
  permissions: string[]
  supervisor?: string
  badgeNumber?: string
  title?: string
  grade?: string
}

export type OrganizationRole = 
  | 'doctor' 
  | 'nurse' 
  | 'resident' 
  | 'consultant' 
  | 'staff' 
  | 'intern' 
  | 'student' 
  | 'researcher' 
  | 'administrator' 
  | 'manager' 
  | 'supervisor'

export interface IdentityPreferences {
  theme: 'light' | 'dark' | 'hospital' | 'university' | 'government' | 'custom'
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    clinical: boolean
    administrative: boolean
  }
  accessibility: {
    highContrast: boolean
    screenReader: boolean
    reducedMotion: boolean
    largeText: boolean
    keyboardNavigation: boolean
  }
  workspace: {
    layout: 'standard' | 'compact' | 'fullscreen'
    panels: string[]
    favorites: string[]
  }
  privacy: {
    shareData: boolean
    analytics: boolean
    research: boolean
    marketing: boolean
  }
}

export interface IdentitySecurity {
  // Constitutional: Security events tracked permanently
  failedLogins: FailedLogin[]
  mfaEnabled: boolean
  deviceTrust: TrustedDevice[]
  ipRestrictions?: string[]
  roleBasedAccess: boolean
}

export interface FailedLogin {
  timestamp: Date
  ipAddress: string
  userAgent: string
  success: boolean
  reason?: string
}

export interface TrustedDevice {
  deviceId: string
  name: string
  lastUsed: Date
  createdAt: Date
  riskScore: number
}

export interface IdentityVerificationStatus {
  email: boolean
  phone: boolean
  identity: boolean
  profession?: boolean
  organization?: boolean
  background?: boolean
  documents?: VerificationDocument[]
}

export interface VerificationDocument {
  type: string
  number: string
  expiry?: Date
  verifiedAt?: Date
  verifiedBy?: string
}

export interface IdentityActivity {
  sessions: AuthSession[]
  lastActions: ActivityLog[]
  patterns: BehavioralPattern[]
  feedback: UserFeedback[]
}

export interface ActivityLog {
  timestamp: Date
  action: string
  resource: string
  ipAddress: string
  userAgent: string
  success: boolean
}

export interface BehavioralPattern {
  typicalLoginTimes: { dayOfWeek: number, hour: number }[]
  devicePatterns: string[]
  locationPatterns: string[]
  anomalyScore: number
}

export interface UserFeedback {
  type: 'survey' | 'support' | 'feature'
  rating: number
  comment?: string
  timestamp: Date
  category: string
}

export interface IdentityAuditTrail {
  events: AuditEvent[]
  lastUpdatedBy?: string
  lastUpdatedAt?: Date
  version: number
}

export interface AuditEvent {
  timestamp: Date
  eventType: string
  userId: string
  performedBy: string
  changes: Record<string, any>
  ipAddress: string
  userAgent: string
}

export interface ContactInfo {
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  timezone: string
}

// ─── Store ────────────────────────────────────────────────────────────────────

const firebaseAuth = getAuth()

export interface IdentityState {
  // Constitutional: Identity is the foundation - never reset
  currentIdentity: Identity | null
  isLoading: boolean
  isAuthenticated: boolean
  authError: string | null
}

export const useIdentityStore = create<IdentityState>((set, get) => ({
  currentIdentity: null,
  isLoading: false,
  isAuthenticated: false,
  authError: null,

  // Core actions
  login: async (email: string, password: string, rememberMe?: boolean) => {
    set({ isLoading: true, authError: null })
    try {
      // Firebase Auth integration
      const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password)
      
      // Get/create identity
      const identity = await getOrCreateIdentity(user.uid, email)
      
      set({
        currentIdentity: identity,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ authError: (error as Error).message, isLoading: false })
      throw error
    }
  },

  register: async (data: RegisterData, invitationCode?: string) => {
    set({ isLoading: true, authError: null })
    try {
      // Create user with Firebase
      const { user } = await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password)
      
      // Create identity profile
      const identity = await createIdentity(user.uid, {
        email: data.email,
        type: data.type,
        name: data.name,
        organizationId: data.organizationId,
      })
      
      set({
        currentIdentity: identity,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ authError: (error as Error).message, isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await signOut(firebaseAuth)
      set({
        currentIdentity: null,
        isAuthenticated: false,
        authError: null,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  verifyIdentity: async (identityId: string, verificationData: VerificationData) => {
    try {
      const identity = await getIdentity(identityId)
      if (!identity) throw new Error('Identity not found')
      
      // Update verification status
      const updatedIdentity = await updateIdentity(identityId, {
        verification: {
          ...identity.verification,
          identity: true,
        },
        status: 'verified',
      })
      
      set({
        currentIdentity: updatedIdentity,
      })
    } catch (error) {
      console.error('Identity verification error:', error)
      throw error
    }
  },

  switchWorkspace: async (organizationId: string, role?: string) => {
    try {
      const identity = await switchOrganization(get().currentIdentity?.id || '', organizationId, role)
      set({ currentIdentity: identity })
    } catch (error) {
      console.error('Workspace switch error:', error)
      throw error
    }
  },

  updateProfile: async (updates: Partial<IdentityProfile>) => {
    try {
      const identity = get().currentIdentity
      if (!identity) throw new Error('No identity found')
      
      const updatedIdentity = await updateIdentity(identity.id, {
        profile: { ...identity.profile, ...updates },
      })
      
      set({ currentIdentity: updatedIdentity })
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  },

  // Auth methods
  linkAuthMethod: async (provider: AuthMethod) => {
    try {
      // Firebase Auth link provider
      const identity = get().currentIdentity
      if (!identity) throw new Error('No identity found')
      
      // Implement link provider logic
      const updatedIdentity = await updateIdentity(identity.id, {
        authentication: {
          ...identity.authentication,
          methods: [...identity.authentication.methods, provider],
        },
      })
      
      set({ currentIdentity: updatedIdentity })
    } catch (error) {
      console.error('Link auth method error:', error)
      throw error
    }
  },

  enableTwoFactor: async (secret: string, code: string) => {
    try {
      const identity = get().currentIdentity
      if (!identity) throw new Error('No identity found')
      
      // Verify and enable 2FA
      const updatedIdentity = await updateIdentity(identity.id, {
        authentication: {
          ...identity.authentication,
          factors: { ...identity.authentication.factors, emailVerified: true },
          recovery: { ...identity.authentication.recovery, twoFactorEnabled: true },
        },
      })
      
      set({ currentIdentity: updatedIdentity })
    } catch (error) {
      console.error('2FA enable error:', error)
      throw error
    }
  },

  // Query functions
  getIdentityByAmxid: async (amxid: string) => {
    try {
      const q = query(collection(db, 'identities'), where('amxpId', '==', amxid))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(d => d.data()) as Identity[]
    } catch (error) {
      console.error('Get identity by AMXPID error:', error)
      return null
    }
  },

  getIdentityByOrg: async (organizationId: string) => {
    try {
      const memberships = await getMembershipsByOrg(organizationId)
      // Return first membership's identity
      if (memberships.length > 0) {
        return await getIdentity(memberships[0].organizationId)
      }
      return null
    } catch (error) {
      console.error('Get identity by org error:', error)
      return null
    }
  },

  getMemberships: async (identityId: string) => {
    try {
      const q = query(collection(db, 'memberships'), where('identityId', '==', identityId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(d => d.data()) as Membership[]
    } catch (error) {
      console.error('Get memberships error:', error)
      return []
    }
  },

  // Computed properties
  getCurrentOrganization: () => {
    return get().currentIdentity?.memberships[0]?.organizationId || null
  },

  getCurrentRole: () => {
    return get().currentIdentity?.memberships[0]?.role || null
  },

  isVerified: () => {
    return get().currentIdentity?.verification?.identity || false
  },

  hasPermission: (permission: string) => {
    const identity = useIdentityStore.getState().currentIdentity
    if (!identity) return false
    
    // Check organization permissions
    const currentOrg = identity.memberships[0]
    if (currentOrg?.permissions?.includes(permission)) return true
    
    // Check global permissions
    return identity.profile?.permissions?.includes(permission) || false
  },
} as const))

// ─── Helper Functions ───────────────────────────────────────────────────────────

export interface RegisterData {
  email: string
  password: string
  name: {
    first: string
    last: string
  }
  type: IdentityType
  organizationId?: string
  invitationCode?: string
  termsAccepted: boolean
  privacyAccepted: boolean
}

export interface VerificationData {
  type: 'email' | 'phone' | 'identity' | 'profession' | 'organization'
  value: string
  documentUrl?: string
}

// ─── Initialization ───────────────────────────────────────────────────────────

export const initializeIdentity = async () => {
  // Listen to auth state changes
  onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
    if (firebaseUser) {
      // User is signed in
      const identity = await getIdentity(firebaseUser.uid)
      if (identity) {
        useIdentityStore.setState({
          currentIdentity: identity,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        // Create new identity
        const newIdentity = await createIdentity(firebaseUser.uid, {
          email: firebaseUser.email || '',
          type: 'patient', // Default, will be updated during registration
          name: { first: '', last: '' },
        })
        
        useIdentityStore.setState({
          currentIdentity: newIdentity,
          isAuthenticated: true,
          isLoading: false,
        })
      }
    } else {
      // User is signed out
      useIdentityStore.setState({
        currentIdentity: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  })
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getIdentity = async (identityId: string): Promise<Identity | null> => {
  try {
    const docRef = doc(db, 'identities', identityId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as Identity
    }
    return null
  } catch (error) {
    console.error('Get identity error:', error)
    return null
  }
}

export const updateIdentity = async (
  identityId: string,
  updates: Partial<Identity>
): Promise<Identity> => {
  try {
    const docRef = doc(db, 'identities', identityId)
    await updateDoc(docRef, updates as any)
    const updated = await getIdentity(identityId)
    if (!updated) throw new Error('Identity not found after update')
    return updated
  } catch (error) {
    console.error('Update identity error:', error)
    throw error
  }
}

export const getOrCreateIdentity = async (authUserId: string, email: string): Promise<Identity> => {
  const existing = await getIdentity(authUserId)
  if (existing) return existing
  return createIdentity(authUserId, {
    email,
    type: 'patient',
    name: { first: '', last: '' },
  })
}

export const createIdentity = async (
  authUserId: string,
  data: Partial<Identity> & { type: IdentityType; email?: string; organizationId?: string; name?: { first: string; last: string } }
): Promise<Identity> => {
  const amxid = generateAmxId()
  const amxpId = generateAmxId('PAT')
  const amxfid = generateAmxId('FID')
  
  const identity: Identity = {
    id: amxid,
    amxpId: amxpId,
    amxfid: amxfid,
    amxorg: data.organizationId || 'global',
    type: data.type,
    profile: data.profile || {
      name: data.name || { first: '', last: '' },
      demographics: {},
      contact: { email: data.email || '' },
      identifiers: {},
    } as IdentityProfile,
    authentication: {
      methods: [],
      lastValidated: new Date(),
      verifiedAt: new Date(),
      factors: { emailVerified: false, phoneVerified: false, identityVerified: false },
      recovery: {
        recoveryEmail: data.email,
        tempCodes: [],
        twoFactorEnabled: false,
        emergencyAccess: {
          approvedContacts: [],
          limitedTime: 60,
          purpose: '',
        },
      },
      sessions: [],
      securityLevel: 'basic',
    },
    memberships: [],
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
        clinical: true,
        administrative: false,
      },
      accessibility: {
        highContrast: false,
        screenReader: false,
        reducedMotion: false,
        largeText: false,
        keyboardNavigation: true,
      },
      workspace: {
        layout: 'standard',
        panels: [],
        favorites: [],
      },
      privacy: {
        shareData: false,
        analytics: false,
        research: false,
        marketing: false,
      },
    },
    security: {
      failedLogins: [],
      mfaEnabled: false,
      deviceTrust: [],
      roleBasedAccess: false,
    },
    verification: {
      email: false,
      phone: false,
      identity: false,
    },
    activity: {
      sessions: [],
      lastActions: [],
      patterns: [{ typicalLoginTimes: [], devicePatterns: [], locationPatterns: [], anomalyScore: 0 }],
      feedback: [],
    },
    audit: {
      events: [],
      lastUpdatedBy: authUserId,
      lastUpdatedAt: new Date(),
      version: 1,
    },
    status: 'unverified',
    createdAt: new Date(),
  }
  
  await setDoc(doc(db, 'identities', amxid), identity)
  
  // Create membership in organization
  const membership: Membership = {
    organizationId: identity.amxorg,
    organizationName: 'AMEXAN Global',
    amxorg: identity.amxorg,
    role: (data.type === 'doctor' ? 'doctor' : 'staff') as OrganizationRole,
    startDate: new Date(),
    status: 'active',
    permissions: [],
  }
  
  await setDoc(doc(db, 'memberships', `${amxid}-${identity.amxorg}`), membership)
  
  return identity
}

export const switchOrganization = async (
  identityId: string,
  organizationId: string,
  role?: string
): Promise<Identity | null> => {
  try {
    const identity = await getIdentity(identityId)
    if (!identity) return null
    
    const newMembership: Membership = {
      organizationId,
      organizationName: 'Organization Name', // Fetch from org engine
      amxorg: organizationId,
      role: (role || 'staff') as OrganizationRole,
      startDate: new Date(),
      status: 'active',
      permissions: [],
    }
    
    const updatedIdentity = {
      ...identity,
      amxorg: organizationId,
      memberships: [...identity.memberships, newMembership],
    }
    
    await updateDoc(doc(db, 'identities', identityId), updatedIdentity)
    return updatedIdentity
  } catch (error) {
    console.error('Switch organization error:', error)
    return null
  }
}

export const getMembershipsByOrg = async (organizationId: string): Promise<Membership[]> => {
  try {
    const q = query(collection(db, 'memberships'), where('organizationId', '==', organizationId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()) as Membership[]
  } catch (error) {
    console.error('Get memberships by org error:', error)
    return []
  }
}
