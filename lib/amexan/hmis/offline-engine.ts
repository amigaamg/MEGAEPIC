// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XXII: Offline Engine
// Offline data sync, conflict resolution, local storage management.
// ═══════════════════════════════════════════════════════════════════════════════

export interface OfflineQueue {
  id: string;
  deviceId: string;
  userId: string;
  items: OfflineQueueItem[];
  status: QueueStatus;
  lastSyncAt?: number;
  totalItems: number;
  pendingItems: number;
  failedItems: number;
  createdAt: number;
  updatedAt: number;
}

export interface OfflineQueueItem {
  id: string;
  queueId: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete' | 'read';
  payload: Record<string, unknown>;
  priority: SyncPriority;
  status: ItemStatus;
  createdAt: number;
  syncedAt?: number;
  retryCount: number;
  maxRetries: number;
  error?: string;
  conflictResolution?: ConflictResolution;
  dependencies: string[];
  checksum: string;
}

export enum SyncPriority {
  Critical = 'critical',
  High = 'high',
  Normal = 'normal',
  Low = 'low',
  Background = 'background',
}

export enum QueueStatus {
  Active = 'active',
  Syncing = 'syncing',
  Paused = 'paused',
  Error = 'error',
  Disabled = 'disabled',
}

export enum ItemStatus {
  Pending = 'pending',
  Syncing = 'syncing',
  Synced = 'synced',
  Failed = 'failed',
  Conflict = 'conflict',
  Skipped = 'skipped',
  Cancelled = 'cancelled',
}

export interface ConflictResolution {
  type: ConflictType;
  localValue?: unknown;
  serverValue?: unknown;
  resolvedValue?: unknown;
  resolution: 'local_wins' | 'server_wins' | 'manual' | 'merge' | 'skip';
  resolvedBy?: string;
  resolvedAt?: number;
}

export enum ConflictType {
  VersionMismatch = 'version_mismatch',
  ConcurrentEdit = 'concurrent_edit',
  EntityDeleted = 'entity_deleted',
  ConstraintViolation = 'constraint_violation',
  ReferenceMissing = 'reference_missing',
  DataDrift = 'data_drift',
}

export interface LocalCache {
  id: string;
  deviceId: string;
  userId: string;
  entities: CachedEntity[];
  lastSyncAt?: number;
  storageSize: number;
  maxSize: number;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
}

export interface CachedEntity {
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  version: number;
  lastAccessed: number;
  lastModified: number;
  expiresAt: number;
  size: number;
}

export interface SyncStats {
  totalQueued: number;
  pending: number;
  synced: number;
  failed: number;
  conflicts: number;
  averageSyncTime: number;
  lastSyncDuration?: number;
  dataTransferred: number;
  byEntityType: Record<string, { queued: number; synced: number; failed: number }>;
}

export function createOfflineQueue(deviceId: string, userId: string): OfflineQueue {
  return {
    id: `OQ-${Date.now().toString(36).toUpperCase()}`,
    deviceId, userId, items: [], status: QueueStatus.Active,
    totalItems: 0, pendingItems: 0, failedItems: 0,
    createdAt: Date.now(), updatedAt: Date.now(),
  };
}

export function addToQueue(queue: OfflineQueue, params: {
  entityType: string; entityId: string; operation: OfflineQueueItem['operation'];
  payload: Record<string, unknown>; priority?: SyncPriority; dependencies?: string[];
}): OfflineQueue {
  const payloadStr = JSON.stringify(params.payload);
  let checksum = 0;
  for (let i = 0; i < payloadStr.length; i++) { checksum = ((checksum << 5) - checksum) + payloadStr.charCodeAt(i); checksum &= checksum; }
  const item: OfflineQueueItem = {
    id: `OQI-${Date.now().toString(36).toUpperCase()}-${queue.items.length}`,
    queueId: queue.id, entityType: params.entityType, entityId: params.entityId,
    operation: params.operation, payload: params.payload,
    priority: params.priority || SyncPriority.Normal,
    status: ItemStatus.Pending, createdAt: Date.now(),
    retryCount: 0, maxRetries: 3, dependencies: params.dependencies || [],
    checksum: Math.abs(checksum).toString(16),
  };
  queue.items.push(item);
  queue.totalItems++;
  queue.pendingItems++;
  queue.updatedAt = Date.now();
  return queue;
}

export function resolveConflict(item: OfflineQueueItem, resolution: ConflictResolution['resolution'], resolvedValue?: unknown): OfflineQueueItem {
  item.conflictResolution = {
    type: ConflictType.ConcurrentEdit, resolution, resolvedValue, resolvedAt: Date.now(),
  };
  if (resolution === 'local_wins') item.status = ItemStatus.Pending;
  else if (resolution === 'server_wins') item.status = ItemStatus.Synced;
  else if (resolution === 'skip') item.status = ItemStatus.Skipped;
  return item;
}

export function getSyncStats(queue: OfflineQueue): SyncStats {
  const byEntityType: Record<string, { queued: number; synced: number; failed: number }> = {};
  for (const item of queue.items) {
    if (!byEntityType[item.entityType]) byEntityType[item.entityType] = { queued: 0, synced: 0, failed: 0 };
    byEntityType[item.entityType].queued++;
    if (item.status === ItemStatus.Synced) byEntityType[item.entityType].synced++;
    else if (item.status === ItemStatus.Failed) byEntityType[item.entityType].failed++;
  }
  const syncedItems = queue.items.filter(i => i.status === ItemStatus.Synced);
  const syncTimes = syncedItems.filter(i => i.syncedAt && i.createdAt).map(i => i.syncedAt! - i.createdAt);
  return {
    totalQueued: queue.totalItems, pending: queue.pendingItems,
    synced: syncedItems.length,
    failed: queue.failedItems,
    conflicts: queue.items.filter(i => i.status === ItemStatus.Conflict).length,
    averageSyncTime: syncTimes.length > 0 ? Math.round(syncTimes.reduce((a, b) => a + b, 0) / syncTimes.length) : 0,
    dataTransferred: syncedItems.length * 1024,
    byEntityType,
  };
}
