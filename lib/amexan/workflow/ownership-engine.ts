import type { OwnershipTransfer, Workflow } from './types'

const transfers = new Map<string, OwnershipTransfer>()
const workflowOwners = new Map<string, { patientOwner?: string; workflowOwner?: string; episodeOwner?: string }>()

export function assignOwner(workflowId: string, level: 'patient' | 'workflow' | 'episode', owner: string): void {
  const entry = workflowOwners.get(workflowId) ?? {}
  if (level === 'patient') entry.patientOwner = owner
  else if (level === 'workflow') entry.workflowOwner = owner
  else if (level === 'episode') entry.episodeOwner = owner
  workflowOwners.set(workflowId, entry)
}

export function transferOwnership(workflowId: string, fromOwner: string, toOwner: string, type: OwnershipTransfer['type'], reason?: string): OwnershipTransfer {
  const transfer: OwnershipTransfer = {
    id: `tr_${crypto.randomUUID()}`,
    workflowId,
    fromOwner,
    toOwner,
    type,
    status: 'pending',
    reason,
    createdAt: Date.now(),
  }
  transfers.set(transfer.id, transfer)
  return transfer
}

export function acceptTransfer(transferId: string): boolean {
  const t = transfers.get(transferId)
  if (!t || t.status !== 'pending') return false
  t.status = 'accepted'
  return true
}

export function rejectTransfer(transferId: string): boolean {
  const t = transfers.get(transferId)
  if (!t || t.status !== 'pending') return false
  t.status = 'rejected'
  return true
}

export function getOwnershipChain(workflowId: string): { patientOwner?: string; workflowOwner?: string; episodeOwner?: string } {
  return workflowOwners.get(workflowId) ?? {}
}

export function getPendingTransfers(ownerId: string): OwnershipTransfer[] {
  return Array.from(transfers.values()).filter(t => t.toOwner === ownerId && t.status === 'pending')
}

export function getTransferHistory(workflowId: string): OwnershipTransfer[] {
  return Array.from(transfers.values()).filter(t => t.workflowId === workflowId)
}
