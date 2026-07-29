import type { DeviceInfo } from './types'

export interface OfflineState {
  online: boolean
  lastOnline: number
  queue: QueuedAction[]
  pendingCount: number
  syncInProgress: boolean
  conflictCount: number
}

export interface QueuedAction {
  id: string
  type: string
  payload: unknown
  timestamp: number
  retries: number
  maxRetries: number
  status: 'pending' | 'syncing' | 'completed' | 'failed'
}

export function getOfflineState(device: DeviceInfo): OfflineState {
  return {
    online: device.online,
    lastOnline: device.online ? Date.now() : 0,
    queue: [],
    pendingCount: 0,
    syncInProgress: false,
    conflictCount: 0,
  }
}

export function isOffline(device: DeviceInfo): boolean {
  return !device.online
}

export function shouldShowOfflineBadge(device: DeviceInfo): boolean {
  return !device.online
}

export function shouldShowPendingQueue(queue: QueuedAction[]): boolean {
  return queue.length > 0
}

export function getSyncStrategy(device: DeviceInfo): 'immediate' | 'batch' | 'on_reconnect' {
  if (device.online && device.viewportClass !== 'xs') return 'immediate'
  if (device.online) return 'batch'
  return 'on_reconnect'
}

export function getMaxRetries(device: DeviceInfo): number {
  if (device.viewportClass === 'xs' || device.viewportClass === 'sm') return 5
  return 3
}

export function getConflictResolutionStrategy(): 'last_write_wins' | 'manual' | 'merge' {
  return 'last_write_wins'
}
