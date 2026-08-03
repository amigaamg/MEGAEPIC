// AMEXAN Authentication & Session Engine
// Phase 4.2.3 - Foundation Implementation
// Constitutional: Authentication is the gateway, identity is permanent

import { create } from 'zustand'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, getAuth, sendEmailVerification, sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { generateId, hashPassword } from '@/lib/utils'
import { Identity } from '../identity/identity-engine'

export type AuthProvider = 
  | 'email'
  | 'google'
  | 'microsoft'
  | 'phone'
  | 'biometric'
  | 'saml'
  | 'oidc'
  | 'ldap'
  | 'national'

export interface Session {
  // Constitutional: Sessions are temporary, authentication is permanent
  id: string
  identityId: string
  provider: AuthProvider
  identifier: string
  device: DeviceInfo
  ipAddress: string
  userAgent: string
  issuedAt: Date
  expiresAt: Date
  lastActive: Date
  isTrusted: boolean
  factors: AuthFactors
  securityLevel: 'basic' | 'verified' | 'trusted' | 'enterprise'
  isActive: boolean
  emergencyAccess?: EmergencyAccess
}

export interface DeviceInfo {
  type: 'mobile' | 'desktop' | 'tablet' | 'wearable' | 'unknown'
  os: string
  browser: string
  model?: string
  uniqueId: string
}

export interface AuthFactors {
  emailVerified: boolean
  phoneVerified: boolean
  identityVerified: boolean
  twoFactorEnabled: boolean
  recoveryEnabled: boolean
}

export interface AuthSession {
  id: string
  identityId: string
  provider: AuthProvider
  token: string
  refreshToken?: string
  expiresAt: Date
  scope: string[]
  permissions: string[]
  metadata: Record<string, any>
}

export interface MFASettings {
  secret: string
  verified: boolean
  lastUsed?: Date
  recoveryCodes: string[]
}

export interface RecoveryInfo {
  email?: string
  phone?: string
  recoveryCodes: string[]
  tempTokens: TempToken[]
}

export interface TempToken {
  token: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

export interface EmergencyAccess {
  approvedContact: string
  duration: number
  purpose: string
  grantedAt: Date
  expiresAt: Date
  active: boolean
}

export interface FailedLogin {
  timestamp: Date
  ipAddress: string
  userAgent: string
  reason: string
  source: 'manual' | 'automated'
}

export interface TrustedDevice {
  id: string
  name: string
  type: string
  fingerprint: string
  lastUsed: Date
  createdAt: Date
  riskScore: number
  approved: boolean
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface AuthState {
  // Constitutional: Authentication is the gateway to identity
  currentSession: Session | null
  currentIdentity: Identity | null
  isLoading: boolean
  isAuthenticated: boolean
  authError: string | null
  mfaRequired: boolean
  recoveryRequired: boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentSession: null,
  currentIdentity: null,
  isLoading: false,
  isAuthenticated: false,
  authError: null,
  mfaRequired: false,
  recoveryRequired: false,

  // Core authentication actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, authError: null })
    try {
      // Firebase Auth authentication
      const firebaseUser = await signInWithEmailAndPassword(
        firebaseAuth,
        credentials.email,
        credentials.password
      )
      
      if (!firebaseUser) {
        throw new Error('Authentication failed')
      }
      
      // Get or create identity
      let identity = await getIdentityByAmxId(firebaseUser.user.uid)
      
      if (!identity) {
        // Create new identity for this auth user
        identity = await createIdentityFromAuth(firebaseUser.user.uid, credentials)
      }
      
      // Create session
      const session = await createAuthSession(firebaseUser.user.uid, credentials)
      
      set({
        currentSession: session,
        currentIdentity: identity,
        isAuthenticated: true,
        isLoading: false,
        mfaRequired: false,
        recoveryRequired: false,
      })
    } catch (error) {
      set({ 
        authError: (error as Error).message, 
        isLoading: false,
        isAuthenticated: false,
      })
      throw error
    }
  },

  register: async (credentials: RegisterCredentials, invitationCode?: string) => {
    set({ isLoading: true, authError: null })
    try {
      // Create user with Firebase
      const firebaseUser = await createUserWithEmailAndPassword(
        firebaseAuth,
        credentials.email,
        credentials.password
      )
      
      if (!firebaseUser) {
        throw new Error('User creation failed')
      }
      
      // Verify email if required
      if (credentials.requireEmailVerification) {
        await sendEmailVerification(firebaseUser.user)
      }
      
      // Create identity
      const identity = await createIdentityFromAuth(firebaseUser.user.uid, credentials)
      
      // Handle invitation
      if (invitationCode) {
        await applyInvitation(invitationCode, firebaseUser.user.uid)
      }
      
      // Create session
      const session = await createAuthSession(firebaseUser.user.uid, credentials)
      
      set({
        currentSession: session,
        currentIdentity: identity,
        isAuthenticated: true,
        isLoading: false,
        mfaRequired: false,
        recoveryRequired: false,
      })
    } catch (error) {
      set({ 
        authError: (error as Error).message, 
        isLoading: false,
        isAuthenticated: false,
      })
      throw error
    }
  },

  logout: async () => {
    try {
      await signOut(firebaseAuth)
      set({
        currentSession: null,
        currentIdentity: null,
        isAuthenticated: false,
        mfaRequired: false,
        recoveryRequired: false,
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  verifyMfa: async (code: string) => {
    try {
      const session = get().currentSession
      if (!session) throw new Error('No active session')
      
      // Verify MFA code
      const verified = await verifyMfaCode(session.id, code)
      
      if (verified) {
        set({ mfaRequired: false })
      } else {
        set({ authError: 'Invalid MFA code' })
      }
    } catch (error) {
      set({ authError: (error as Error).message })
      throw error
    }
  },

  recoverPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email)
      set({ recoveryRequired: true })
    } catch (error) {
      set({ authError: (error as Error).message })
      throw error
    }
  },

  resetPassword: async (code: string, newPassword: string) => {
    try {
      await confirmPasswordReset(firebaseAuth, code, newPassword)
      set({ recoveryRequired: false })
    } catch (error) {
      set({ authError: (error as Error).message })
      throw error
    }
  },

  linkAuthMethod: async (provider: AuthProvider) => {
    try {
      const session = get().currentSession
      if (!session) throw new Error('No active session')
      
      // Link auth provider to existing user
      const linkedSession = await linkAuthProvider(session.id, provider)
      
      set({ currentSession: linkedSession })
    } catch (error) {
      set({ authError: (error as Error).message })
      throw error
    }
  },

  enableTwoFactor: async (secret: string, code: string) => {
    try {
      const session = get().currentSession
      if (!session) throw new Error('No active session')
      
      // Enable 2FA
      const mfaSettings: MFASettings = {
        secret,
        verified: true,
        lastUsed: new Date(),
        recoveryCodes: generateRecoveryCodes(8),
      }
      
      const updatedSession = await updateSessionMfa(session.id, mfaSettings)
      
      set({ currentSession: updatedSession })
    } catch (error) {
      set({ authError: (error as Error).message })
      throw error
    }
  },

  disableTwoFactor: async () => {
    try {
      const session = get().currentSession
      if (!session) throw new Error('No active session')
      
      const mfaSettings: MFASettings = {
        secret: '',
        verified: false,
        lastUsed: undefined,
        recoveryCodes: [],
      }
      
      const updatedSession = await updateSessionMfa(session.id, mfaSettings)
      
      set({ currentSession: updatedSession })
    } catch (error) {
      set({ authError: (error as Error).message })
      throw error
    }
  },

  emergencyAccess: async (contactEmail: string) => {
    try {
      const session = get().currentSession
      if (!session) throw new Error('No active session')
      
      // Grant emergency access to contact
      const emergencyAccess: EmergencyAccess = {
        approvedContact: contactEmail,
        duration: 60,
        purpose: 'Emergency clinical access',
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        active: true,
      }
      
      const updatedSession = await updateSessionEmergencyAccess(session.id, emergencyAccess)
      
      set({ currentSession: updatedSession })
    } catch (error) {
      set({ authError: (error as Error).message })
      throw error
    }
  },

  // Session management
  refreshSession: async () => {
    try {
      const session = get().currentSession
      if (!session) throw new Error('No active session')
      
      const refreshedSession = await refreshAuthSession(session.id)
      
      set({ currentSession: refreshedSession })
    } catch (error) {
      console.error('Session refresh error:', error)
      // Attempt to re-authenticate
      await logout()
    }
  },

  // Utility functions
  getCurrentUser: () => {
    return get().currentIdentity?.profile.name || null
  },

  getCurrentEmail: () => {
    return get().currentIdentity?.profile.contact.email || null
  },

  isEmailVerified: () => {
    return get().currentIdentity?.authentication.factors.emailVerified || false
  },

  isTwoFactorEnabled: () => {
    return get().currentSession?.factors.twoFactorEnabled || false
  },

  isEmergencyAccessActive: () => {
    return get().currentSession?.emergencyAccess?.active || false
  },
}) as const)

// ─── Helper Functions ───────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
  mfaCode?: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: {
    first: string
    last: string
  }
  requireEmailVerification?: boolean
  termsAccepted: boolean
  privacyAccepted: boolean
  type?: 'patient' | 'doctor' | 'nurse' | 'researcher' | 'administrator' | 'student'
}

export interface VerificationData {
  code: string
  email?: string
  phone?: string
}

export interface CreateIdentityData {
  email: string
  type: 'patient' | 'doctor' | 'nurse' | 'researcher' | 'administrator' | 'student'
  name: {
    first: string
    last: string
  }
  organizationId?: string
}

// ─── API Functions ──────────────────────────────────────────────────────────────

export const getIdentityByAmxId = async (amxId: string): Promise<Identity | null> => {
  try {
    const docRef = doc(db, 'identities', amxId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as Identity
    }
    return null
  } catch (error) {
    console.error('Get identity by AMXPID error:', error)
    return null
  }
}

export const createIdentityFromAuth = async (
  authUserId: string,
  credentials: RegisterCredentials | LoginCredentials
): Promise<Identity> => {
  const amxid = generateId()
  const name = 'name' in credentials && credentials.name ? credentials.name : { first: 'New', last: 'User' }
  
  const identity: Identity = {
    id: amxid,
    amxpId: `PAT-${amxid.slice(-8)}`,
    amxfid: `FID-${amxid.slice(-8)}`,
    amxorg: 'AMEXAN-GLOBAL',
    type: 'type' in credentials && credentials.type ? credentials.type : 'patient',
    profile: {
      name,
      demographics: {},
      contact: { email: credentials.email },
      identifiers: {},
      permissions: [],
    },
    authentication: {
      methods: [{ provider: 'email', identifier: credentials.email, isPrimary: true, verified: true }],
      lastValidated: new Date(),
      verifiedAt: new Date(),
      factors: { emailVerified: true, phoneVerified: false, identityVerified: true },
      recovery: {
        recoveryEmail: credentials.email,
        tempCodes: [],
        twoFactorEnabled: false,
        emergencyAccess: {
          approvedContacts: [],
          limitedTime: 60,
          purpose: '',
        },
      },
      sessions: [],
      securityLevel: 'verified',
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
      email: true,
      phone: false,
      identity: true,
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
    status: 'verified',
    createdAt: new Date(),
  }
  
  await setDoc(doc(db, 'identities', amxid), identity)
  
  return identity
}

export const createAuthSession = async (
  identityId: string,
  credentials: LoginCredentials
): Promise<Session> => {
  const sessionId = generateId()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + (credentials.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000)
  
  const session: Session = {
    id: sessionId,
    identityId,
    provider: 'email',
    identifier: credentials.email,
    device: {
      type: 'unknown',
      os: 'unknown',
      browser: 'unknown',
      model: undefined,
      uniqueId: sessionId,
    },
    ipAddress: 'unknown',
    userAgent: 'unknown',
    issuedAt: now,
    expiresAt,
    lastActive: now,
    isTrusted: false,
    factors: {
      emailVerified: true,
      phoneVerified: false,
      identityVerified: true,
      twoFactorEnabled: false,
      recoveryEnabled: false,
    },
    securityLevel: 'basic',
    isActive: true,
  }
  
  await setDoc(doc(db, 'sessions', sessionId), session)
  
  return session
}

export const getIdentityBySession = async (sessionId: string): Promise<Identity | null> => {
  try {
    const sessionDoc = await getDoc(doc(db, 'sessions', sessionId))
    if (!sessionDoc.exists()) return null
    
    const session = sessionDoc.data() as Session
    return await getIdentityByAmxId(session.identityId)
  } catch (error) {
    console.error('Get identity by session error:', error)
    return null
  }
}

// ─── API Functions ──────────────────────────────────────────────────────

export const firebaseAuth = getAuth()

export const linkAuthProvider = async (sessionId: string, provider: AuthProvider): Promise<Session> => {
  const sessionDoc = await getDoc(doc(db, 'sessions', sessionId))
  if (!sessionDoc.exists()) throw new Error('Session not found')
  const session = sessionDoc.data() as Session
  const updatedSession: Session = {
    ...session,
    provider,
    lastActive: new Date(),
  }
  await updateDoc(doc(db, 'sessions', sessionId), updatedSession as any)
  return updatedSession
}

export const verifyMfaCode = async (sessionId: string, code: string): Promise<boolean> => {
  try {
    const session = await getDoc(doc(db, 'sessions', sessionId))
    if (!session.exists()) return false
    
    // Verify MFA code (simplified)
    return code === '123456' // In real implementation, verify against stored codes
  } catch (error) {
    console.error('Verify MFA code error:', error)
    return false
  }
}

export const updateSessionMfa = async (
  sessionId: string,
  mfaSettings: MFASettings
): Promise<Session> => {
  const sessionDoc = await getDoc(doc(db, 'sessions', sessionId))
  if (!sessionDoc.exists()) throw new Error('Session not found')
  
  const session = sessionDoc.data() as Session
  const updatedSession: Session = {
    ...session,
    factors: { ...session.factors, twoFactorEnabled: mfaSettings.verified },
  }
  
  await updateDoc(doc(db, 'sessions', sessionId), updatedSession as any)
  return updatedSession
}

export const updateSessionEmergencyAccess = async (
  sessionId: string,
  emergencyAccess: EmergencyAccess
): Promise<Session> => {
  const sessionDoc = await getDoc(doc(db, 'sessions', sessionId))
  if (!sessionDoc.exists()) throw new Error('Session not found')
  
  const session = sessionDoc.data() as Session
  const updatedSession: Session = {
    ...session,
    emergencyAccess,
  }
  
  await updateDoc(doc(db, 'sessions', sessionId), updatedSession as any)
  return updatedSession
}

export const refreshAuthSession = async (sessionId: string): Promise<Session> => {
  const sessionDoc = await getDoc(doc(db, 'sessions', sessionId))
  if (!sessionDoc.exists()) throw new Error('Session not found')
  
  const session = sessionDoc.data() as Session
  const now = new Date()
  const updatedSession: Session = {
    ...session,
    lastActive: now,
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Extend by 24 hours
  }
  
  await updateDoc(doc(db, 'sessions', sessionId), updatedSession as any)
  return updatedSession
}

export const generateRecoveryCodes = (count: number): string[] => {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    codes.push(code)
  }
  return codes
}

// ─── Event Listeners ────────────────────────────────────────────────────────────

export const setupAuthListeners = () => {
  onAuthStateChanged(firebaseAuth, (firebaseUser) => {
    if (firebaseUser) {
      // User is signed in
      getIdentityByAmxId(firebaseUser.uid).then(identity => {
        if (identity) {
          useAuthStore.setState({
            currentIdentity: identity,
            isAuthenticated: true,
            isLoading: false,
          })
        }
      })
    } else {
      // User is signed out
      useAuthStore.setState({
        currentIdentity: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  })
}

// ─── Missing Functions ──────────────────────────────────────────────────

export const initializeAuth = async () => {
  try {
    const currentUser = firebaseAuth.currentUser
    if (currentUser) {
      await getIdentityByAmxId(currentUser.uid)
    }
  } catch (error) {
    console.error('Initialize auth error:', error)
  }
}

export const applyInvitation = async (invitationCode: string, userId: string): Promise<void> => {
  try {
    const invRef = doc(db, 'invitations', invitationCode)
    const invSnap = await getDoc(invRef)
    if (invSnap.exists()) {
      const invData = invSnap.data()
      await updateDoc(invRef, {
        acceptedBy: userId,
        acceptedAt: new Date(),
        status: 'accepted',
      })
    }
  } catch (error) {
    console.error('Apply invitation error:', error)
  }
}

export const logout = async (): Promise<void> => {
  try {
    await signOut(firebaseAuth)
    useAuthStore.setState({
      currentSession: null,
      currentIdentity: null,
      isAuthenticated: false,
      mfaRequired: false,
      recoveryRequired: false,
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
}
