import { type AmxUid, type Session, type IdentityEvent } from './types'

const sessions = new Map<string, Session>()
const eventLog: IdentityEvent[] = []

export function createSession(uid: AmxUid, device: string, orgId?: string, deptId?: string, role?: string): Session {
  const session: Session = {
    id: `sess_${crypto.randomUUID()}`,
    uid,
    device,
    orgId,
    deptId,
    role,
    createdAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    lastActivity: Date.now(),
    revoked: false,
  }
  sessions.set(session.id, session)
  return session
}

export function validateSession(sessionToken: string): Session | null {
  const session = sessions.get(sessionToken)
  if (!session) return null
  if (session.revoked) return null
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionToken)
    return null
  }
  session.lastActivity = Date.now()
  return session
}

export function revokeSession(sessionId: string): boolean {
  const session = sessions.get(sessionId)
  if (!session) return false
  session.revoked = true
  return true
}

export function getActiveSessions(uid: AmxUid): Session[] {
  return Array.from(sessions.values()).filter(s => s.uid === uid && !s.revoked && Date.now() < s.expiresAt)
}

export function extendSession(sessionId: string, hours: number = 8): boolean {
  const session = sessions.get(sessionId)
  if (!session || session.revoked) return false
  session.expiresAt = Date.now() + hours * 60 * 60 * 1000
  return true
}

export function getSessionContext(sessionId: string): { orgId?: string; deptId?: string; role?: string } | null {
  const session = sessions.get(sessionId)
  if (!session || session.revoked) return null
  return { orgId: session.orgId, deptId: session.deptId, role: session.role }
}
