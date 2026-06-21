import type { AmexanEvent, EngineInterface } from './core/types';

type EventHandler = (event: AmexanEvent) => void;

class EventBus {
  private subscribers = new Map<string, Set<EventHandler>>();
  private engines = new Map<string, EngineInterface>();
  private history: AmexanEvent[] = [];
  private maxHistory = 500;

  subscribe(type: string, handler: EventHandler): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(handler);
    return () => this.subscribers.get(type)?.delete(handler);
  }

  unsubscribe(type: string, handler: EventHandler): void {
    this.subscribers.get(type)?.delete(handler);
  }

  emit(type: string, payload: unknown, source = 'system'): void {
    const event: AmexanEvent = { type, payload, timestamp: Date.now(), source };
    this.history.push(event);
    if (this.history.length > this.maxHistory) this.history.shift();
    this.subscribers.get(type)?.forEach((handler) => handler(event));
    this.subscribers.get('*')?.forEach((handler) => handler(event));
  }

  registerEngine(engine: EngineInterface): void {
    this.engines.set(engine.name, engine);
    engine.init();
    this.emit('engine:registered', { name: engine.name });
  }

  unregisterEngine(name: string): void {
    const engine = this.engines.get(name);
    if (engine) {
      engine.destroy();
      this.engines.delete(name);
      this.emit('engine:unregistered', { name });
    }
  }

  getEngine(name: string): EngineInterface | undefined {
    return this.engines.get(name);
  }

  getHistory(): AmexanEvent[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

export const amexanBus = new EventBus();
export type { EventHandler };
export default EventBus;
