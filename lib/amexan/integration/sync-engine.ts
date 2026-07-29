import type { OfflineQueue, OfflineQueueItem, SyncStats } from '../hmis/offline-engine';
import { ItemStatus, QueueStatus } from '../hmis/offline-engine';
import type { IntegrationEndpoint } from '../hmis/integration-engine';
import { EndpointStatus } from '../hmis/integration-engine';
import { FHIRAdapter } from './adapters/fhir-adapter';
import type { IntegrationLog } from '../hmis/integration-engine';

export interface SyncEngineConfig {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
  concurrentSyncs: number;
}

export class SyncEngine {
  private config: SyncEngineConfig;
  private activeSyncs = 0;
  private logs: IntegrationLog[] = [];
  private fhirAdapters = new Map<string, FHIRAdapter>();

  constructor(config?: Partial<SyncEngineConfig>) {
    this.config = {
      batchSize: config?.batchSize || 50,
      maxRetries: config?.maxRetries || 3,
      retryDelay: config?.retryDelay || 5000,
      concurrentSyncs: config?.concurrentSyncs || 3,
    };
  }

  async syncQueue(queue: OfflineQueue, endpoints: IntegrationEndpoint[]): Promise<{ queue: OfflineQueue; stats: SyncStats }> {
    if (this.activeSyncs >= this.config.concurrentSyncs) {
      this.logs.push({ at: Date.now(), type: 'warning', message: 'Max concurrent syncs reached, queuing sync' });
      return { queue, stats: this.computeStats(queue) };
    }

    this.activeSyncs++;
    queue.status = QueueStatus.Syncing;
    const pendingItems = queue.items.filter(i => i.status === ItemStatus.Pending || (i.status === ItemStatus.Failed && i.retryCount < i.maxRetries));
    const batch = pendingItems.slice(0, this.config.batchSize);

    this.logs.push({ at: Date.now(), type: 'info', message: `Syncing ${batch.length} items (${pendingItems.length} pending total)`, duration: 0 });

    for (const item of batch) {
      item.status = ItemStatus.Syncing;
      try {
        await this.processItem(item, endpoints);
        item.status = ItemStatus.Synced;
        item.syncedAt = Date.now();
        queue.pendingItems = Math.max(0, queue.pendingItems - 1);
        this.logs.push({ at: Date.now(), type: 'info', message: `Synced ${item.entityType}[${item.entityId}] operation=${item.operation}` });
      } catch (error) {
        item.retryCount++;
        if (item.retryCount >= this.config.maxRetries) {
          item.status = ItemStatus.Failed;
          queue.failedItems++;
          queue.pendingItems = Math.max(0, queue.pendingItems - 1);
        }
        item.error = (error as Error).message;
        this.logs.push({ at: Date.now(), type: 'error', message: `Sync failed ${item.entityType}[${item.entityId}]: ${(error as Error).message}` });
      }
    }

    queue.updatedAt = Date.now();
    if (queue.items.filter(i => i.status === ItemStatus.Pending || i.status === ItemStatus.Failed).length === 0) {
      queue.status = QueueStatus.Active;
    } else {
      queue.status = QueueStatus.Error;
    }
    this.activeSyncs--;

    return { queue, stats: this.computeStats(queue) };
  }

  private async processItem(item: OfflineQueueItem, endpoints: IntegrationEndpoint[]): Promise<void> {
    const fhirEndpoint = endpoints.find(e => e.type === 'fhir' as any && e.status === EndpointStatus.Connected);
    if (!fhirEndpoint) throw new Error('No connected FHIR endpoint available');

    let adapter = this.fhirAdapters.get(fhirEndpoint.id);
    if (!adapter) {
      adapter = new FHIRAdapter({
        baseUrl: fhirEndpoint.config.baseUrl || 'http://localhost:8080/fhir',
        version: 'R4',
        timeout: fhirEndpoint.config.timeout || 30000,
        authToken: fhirEndpoint.credentials?.apiKey,
      });
      this.fhirAdapters.set(fhirEndpoint.id, adapter);
    }

    switch (item.entityType) {
      case 'Patient':
        await this.syncPatient(adapter, item);
        break;
      case 'Encounter':
        await this.syncEncounter(adapter, item);
        break;
      case 'Observation':
        await this.syncObservation(adapter, item);
        break;
      case 'DocumentReference':
        await this.syncDocument(adapter, item);
        break;
      default:
        await this.syncGeneric(adapter, item);
    }
  }

  private async syncPatient(adapter: FHIRAdapter, item: OfflineQueueItem): Promise<void> {
    const patient = item.payload as any;
    switch (item.operation) {
      case 'create':
        await adapter.createPatient(patient as any);
        break;
      case 'update':
        await adapter.updatePatient(item.entityId, patient as any);
        break;
      case 'delete':
        await adapter.request('DELETE', `Patient/${item.entityId}`);
        break;
    }
  }

  private async syncEncounter(adapter: FHIRAdapter, item: OfflineQueueItem): Promise<void> {
    const encounter = item.payload as any;
    switch (item.operation) {
      case 'create':
        await adapter.createEncounter(encounter as any);
        break;
      case 'update':
        await adapter.updateEncounter(item.entityId, encounter as any);
        break;
    }
  }

  private async syncObservation(adapter: FHIRAdapter, item: OfflineQueueItem): Promise<void> {
    const observation = item.payload as any;
    await adapter.createObservation(observation as any);
  }

  private async syncDocument(adapter: FHIRAdapter, item: OfflineQueueItem): Promise<void> {
    await adapter.request('POST', 'DocumentReference', item.payload);
  }

  private async syncGeneric(adapter: FHIRAdapter, item: OfflineQueueItem): Promise<void> {
    const resourceType = item.entityType;
    await adapter.request(item.operation === 'delete' ? 'DELETE' : 'POST', `${resourceType}`, item.payload);
  }

  async processSyncLoop(queue: OfflineQueue, endpoints: IntegrationEndpoint[]): Promise<void> {
    let iterations = 0;
    const maxIterations = 10;
    while (iterations < maxIterations) {
      const pendingCount = queue.items.filter(
        i => i.status === ItemStatus.Pending || (i.status === ItemStatus.Failed && i.retryCount < i.maxRetries),
      ).length;
      if (pendingCount === 0) break;
      await this.syncQueue(queue, endpoints);
      iterations++;
      if (iterations < maxIterations && queue.items.some(i => i.status === ItemStatus.Failed && i.retryCount < i.maxRetries)) {
        await new Promise(r => setTimeout(r, this.config.retryDelay));
      }
    }
  }

  computeStats(queue: OfflineQueue): SyncStats {
    const synced = queue.items.filter(i => i.status === ItemStatus.Synced).length;
    const failed = queue.items.filter(i => i.status === ItemStatus.Failed).length;
    const conflicts = queue.items.filter(i => i.status === ItemStatus.Conflict).length;
    const syncTimes = queue.items.filter(i => i.syncedAt && i.createdAt).map(i => i.syncedAt! - i.createdAt);
    const byEntityType: Record<string, { queued: number; synced: number; failed: number }> = {};
    for (const item of queue.items) {
      if (!byEntityType[item.entityType]) byEntityType[item.entityType] = { queued: 0, synced: 0, failed: 0 };
      byEntityType[item.entityType].queued++;
      if (item.status === ItemStatus.Synced) byEntityType[item.entityType].synced++;
      else if (item.status === ItemStatus.Failed) byEntityType[item.entityType].failed++;
    }
    return {
      totalQueued: queue.totalItems,
      pending: queue.pendingItems,
      synced,
      failed,
      conflicts,
      averageSyncTime: syncTimes.length > 0 ? Math.round(syncTimes.reduce((a, b) => a + b, 0) / syncTimes.length) : 0,
      lastSyncDuration: undefined,
      dataTransferred: synced * 2048,
      byEntityType,
    };
  }

  getLogs(): IntegrationLog[] {
    return [...this.logs];
  }
}
