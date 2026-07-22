import { type AmxUid } from './types'

export interface AuthResult {
  success: boolean
  sessionToken?: string
  uid?: AmxUid
  error?: string
  requiresMFA?: boolean
  mfaMethod?: 'totp' | 'sms' | 'email'
}

const fakeUsers: Record<string, { uid: AmxUid; hash: string; mfaEnabled: boolean }> = {}

export async function registerCredentials(uid: AmxUid, password: string): Promise<void> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + uid)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  fakeUsers[uid] = { uid, hash, mfaEnabled: false }
}

export async function authenticate(emailOrUid: string, password: string): Promise<AuthResult> {
  const user = Object.values(fakeUsers).find(u => u.uid === emailOrUid)
  if (!user) return { success: false, error: 'Invalid credentials' }
  const encoder = new TextEncoder()
  const data = encoder.encode(password + user.uid)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  if (hash !== user.hash) return { success: false, error: 'Invalid credentials' }
  if (user.mfaEnabled) return { success: true, requiresMFA: true, mfaMethod: 'totp', uid: user.uid }
  const token = `sess_${crypto.randomUUID()}`
  return { success: true, sessionToken: token, uid: user.uid }
}

export async function authenticateWithBiometric(uid: AmxUid, biometricToken: string): Promise<AuthResult> {
  if (!biometricToken || biometricToken.length < 10) return { success: false, error: 'Invalid biometric' }
  const token = `sess_${crypto.randomUUID()}`
  return { success: true, sessionToken: token, uid }
}

export async function authenticateWithPasskey(uid: AmxUid, passkeyAssertion: any): Promise<AuthResult> {
  if (!passkeyAssertion) return { success: false, error: 'Invalid passkey' }
  const token = `sess_${crypto.randomUUID()}`
  return { success: true, sessionToken: token, uid }
}

export async function authenticateWithSSO(provider: string, idToken: string): Promise<AuthResult> {
  if (!idToken) return { success: false, error: 'Invalid SSO token' }
  const token = `sess_${crypto.randomUUID()}`
  return { success: true, sessionToken: token }
}

export async function verifyMFA(uid: AmxUid, code: string): Promise<AuthResult> {
  if (code.length !== 6) return { success: false, error: 'Invalid code' }
  const token = `sess_${crypto.randomUUID()}`
  return { success: true, sessionToken: token, uid }
}
