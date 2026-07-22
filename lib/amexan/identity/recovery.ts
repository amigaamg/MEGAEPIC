import { type AmxUid } from './types'

interface RecoveryRequest {
  id: string
  uid?: AmxUid
  email: string
  code: string
  codeExpires: number
  attempts: number
  completed: boolean
  createdAt: number
}

const recoveryRequests = new Map<string, RecoveryRequest>()

function generateRecoveryCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function initiateRecovery(email: string): { success: boolean; requestId?: string; error?: string } {
  const requestId = `rec_${crypto.randomUUID()}`
  const code = generateRecoveryCode()
  recoveryRequests.set(requestId, {
    id: requestId,
    email,
    code,
    codeExpires: Date.now() + 15 * 60 * 1000,
    attempts: 0,
    completed: false,
    createdAt: Date.now(),
  })
  return { success: true, requestId }
}

export function verifyRecoveryCode(requestId: string, code: string): { success: boolean; uid?: AmxUid; error?: string } {
  const req = recoveryRequests.get(requestId)
  if (!req) return { success: false, error: 'Invalid recovery request' }
  if (req.completed) return { success: false, error: 'Code already used' }
  if (Date.now() > req.codeExpires) return { success: false, error: 'Code expired' }
  req.attempts++
  if (req.attempts > 5) {
    recoveryRequests.delete(requestId)
    return { success: false, error: 'Too many attempts' }
  }
  if (req.code !== code.toUpperCase()) return { success: false, error: 'Invalid code' }
  req.completed = true
  return { success: true, uid: req.uid }
}

export function resetIdentity(uid: AmxUid, newAuth: Record<string, any>): boolean {
  if (!newAuth.password && !newAuth.biometricToken) return false
  return true
}

export function getRecoveryStatus(requestId: string): { email?: string; completed: boolean; expiresIn?: number } | null {
  const req = recoveryRequests.get(requestId)
  if (!req) return null
  return { email: req.email, completed: req.completed, expiresIn: req.codeExpires - Date.now() }
}
