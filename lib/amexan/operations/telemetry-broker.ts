// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN TELEMETRY BROKER
// Engines emit UniversalEngineEvents here. The broker routes to the OI Database.
// NO ENGINE KNOWS THE BROKER EXISTS — they call a static emit() function.
// NO ENGINE IMPORTS AGOC TYPES — the broker is the only bridge.
// ═══════════════════════════════════════════════════════════════════════════════

import { UniversalEngineEvent, OIStoreConfig, DEFAULT_OI_CONFIG } from './operations-constitution';
import { OIDatabase } from './oi-database';

export type TelemetryMiddleware = (event: UniversalEngineEvent) => UniversalEngineEvent | null;

export class TelemetryBroker {
  private oiDb: OIDatabase;
  private config: OIStoreConfig;
  private middlewares: TelemetryMiddleware[] = [];
  private emittedCount = 0;
  private droppedCount = 0;
  private enabled = true;

  constructor(oiDb: OIDatabase, config: Partial<OIStoreConfig> = {}) {
    this.oiDb = oiDb;
    this.config = { ...DEFAULT_OI_CONFIG, ...config };
  }

  emit(event: UniversalEngineEvent): void {
    if (!this.enabled) return;

    let processed: UniversalEngineEvent | null = event;
    for (const middleware of this.middlewares) {
      processed = middleware(processed);
      if (processed === null) {
        this.droppedCount++;
        return;
      }
    }

    this.emittedCount++;
    this.oiDb.storeEvent(processed);
  }

  emitBatch(events: UniversalEngineEvent[]): void {
    for (const event of events) this.emit(event);
  }

  use(middleware: TelemetryMiddleware): void {
    this.middlewares.push(middleware);
  }

  pause(): void {
    this.enabled = false;
  }

  resume(): void {
    this.enabled = true;
  }

  getStats(): { emitted: number; dropped: number; enabled: boolean; activeMiddlewares: number } {
    return {
      emitted: this.emittedCount,
      dropped: this.droppedCount,
      enabled: this.enabled,
      activeMiddlewares: this.middlewares.length,
    };
  }

  clearStats(): void {
    this.emittedCount = 0;
    this.droppedCount = 0;
  }

  reset(): void {
    this.middlewares = [];
    this.emittedCount = 0;
    this.droppedCount = 0;
    this.enabled = true;
  }
}

let _instance: TelemetryBroker | null = null;

export function initTelemetryBroker(oiDb: OIDatabase, config?: Partial<OIStoreConfig>): TelemetryBroker {
  _instance = new TelemetryBroker(oiDb, config);
  return _instance;
}

export function getTelemetryBroker(): TelemetryBroker {
  if (!_instance) throw new Error('TelemetryBroker not initialized. Call initTelemetryBroker() first.');
  return _instance;
}

export function telemetryEmit(event: UniversalEngineEvent): void {
  if (_instance) _instance.emit(event);
}

export function telemetryEmitBatch(events: UniversalEngineEvent[]): void {
  if (_instance) _instance.emitBatch(events);
}

export function isTelemetryInitialized(): boolean {
  return _instance !== null;
}