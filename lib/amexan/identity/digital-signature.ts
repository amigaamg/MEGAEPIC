import { type AmxUid } from './types'

interface DigitalSignature {
  id: string
  uid: AmxUid
  action: string
  resourceId: string
  timestamp: number
  licenseNumber?: string
  orgId?: string
  deptId?: string
  hash: string
  previousSignatureId?: string
}

const signatures: DigitalSignature[] = []
const signatureChains = new Map<string, string[]>()

export async function signAction(uid: AmxUid, action: string, resourceId: string, context?: { licenseNumber?: string; orgId?: string; deptId?: string }): Promise<DigitalSignature> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${uid}:${action}:${resourceId}:${Date.now()}:${context?.licenseNumber ?? ''}:${context?.orgId ?? ''}:${context?.deptId ?? ''}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

  const chain = signatureChains.get(resourceId) ?? []
  const previousSignatureId = chain.length > 0 ? chain[chain.length - 1] : undefined

  const signature: DigitalSignature = {
    id: `sig_${crypto.randomUUID()}`,
    uid,
    action,
    resourceId,
    timestamp: Date.now(),
    licenseNumber: context?.licenseNumber,
    orgId: context?.orgId,
    deptId: context?.deptId,
    hash,
    previousSignatureId,
  }

  signatures.push(signature)
  chain.push(signature.id)
  signatureChains.set(resourceId, chain)

  return signature
}

export function verifySignature(signatureId: string): { valid: boolean; signature?: DigitalSignature; error?: string } {
  const sig = signatures.find(s => s.id === signatureId)
  if (!sig) return { valid: false, error: 'Signature not found' }
  if (!sig.licenseNumber) return { valid: false, error: 'No professional license attached' }
  return { valid: true, signature: sig }
}

export function getSignatureChain(resourceId: string): DigitalSignature[] {
  const chain = signatureChains.get(resourceId) ?? []
  return chain.map(id => signatures.find(s => s.id === id)!).filter(Boolean)
}

export function getSignaturesByUser(uid: AmxUid, limit = 50): DigitalSignature[] {
  return signatures.filter(s => s.uid === uid).slice(-limit)
}

export function clearSignatures(): void {
  signatures.length = 0
  signatureChains.clear()
}
