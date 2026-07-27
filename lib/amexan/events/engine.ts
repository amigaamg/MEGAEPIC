import type {
  ClinicalEvent, EventType, EventHandler, EventSubscription,
  CascadeRule, CascadeEffect, EventFilter,
} from './types';
import { EVENT_LABELS, EVENT_CATEGORIES } from './types';

let _eventIdCounter = 0;
function uid(): string {
  _eventIdCounter++;
  return `evt_${_eventIdCounter}_${Date.now()}`;
}

export class EventEngine {
  private subscriptions: Map<string, Set<EventSubscription>> = new Map();
  private cascadeRules: Map<string, CascadeRule> = new Map();
  private history: ClinicalEvent[] = [];
  private maxHistory = 10000;
  private onCascadeCallbacks: Array<(effect: CascadeEffect, trigger: ClinicalEvent) => void> = [];

  subscribe(
    eventType: EventType | '*',
    handler: EventHandler,
    opts?: { filter?: (event: ClinicalEvent) => boolean; priority?: number; description?: string; once?: boolean },
  ): () => void {
    const subId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const sub: EventSubscription = {
      id: subId,
      eventType,
      handler,
      filter: opts?.filter,
      priority: opts?.priority || 0,
      description: opts?.description || '',
      once: opts?.once,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    this.subscriptions.get(eventType)!.add(sub);

    return () => {
      const subs = this.subscriptions.get(eventType);
      if (subs) subs.delete(sub);
    };
  }

  onCascade(cb: (effect: CascadeEffect, trigger: ClinicalEvent) => void): () => void {
    this.onCascadeCallbacks.push(cb);
    return () => {
      const idx = this.onCascadeCallbacks.indexOf(cb);
      if (idx >= 0) this.onCascadeCallbacks.splice(idx, 1);
    };
  }

  addCascadeRule(rule: CascadeRule): void {
    this.cascadeRules.set(rule.id, rule);
  }

  addCascadeRules(rules: CascadeRule[]): void {
    for (const r of rules) this.cascadeRules.set(r.id, r);
  }

  removeCascadeRule(id: string): void {
    this.cascadeRules.delete(id);
  }

  emit(
    type: EventType,
    payload: unknown,
    opts?: {
      source?: string;
      actor?: { id: string; type: ClinicalEvent['actor']['type']; name?: string; role?: string };
      patient?: { id: string; encounterId?: string; mrn?: string };
      context?: Record<string, unknown>;
      provenance?: ClinicalEvent['metadata']['provenance'];
      tags?: string[];
      correlationId?: string;
      previousEventId?: string;
    },
  ): ClinicalEvent {
    const event: ClinicalEvent = {
      id: uid(),
      type,
      timestamp: Date.now(),
      source: opts?.source || 'clinical_workspace',
      actor: opts?.actor || { id: 'system', type: 'system', name: 'AMEXAN System' },
      patient: opts?.patient || { id: 'unknown' },
      context: opts?.context || {},
      payload,
      previousEventId: opts?.previousEventId,
      metadata: {
        version: '2.0.0',
        provenance: opts?.provenance || 'user_input',
        tags: opts?.tags || [],
        correlationId: opts?.correlationId,
      },
    };

    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    this.dispatch(event);
    this.processCascade(event);

    return event;
  }

  private dispatch(event: ClinicalEvent): void {
    const specific = this.subscriptions.get(event.type);
    if (specific) {
      for (const sub of Array.from(specific).sort((a, b) => b.priority - a.priority)) {
        if (sub.filter && !sub.filter(event)) continue;
        try { sub.handler(event); } catch { /* swallow handler errors */ }
        if (sub.once) specific.delete(sub);
      }
    }

    const wildcard = this.subscriptions.get('*');
    if (wildcard) {
      for (const sub of Array.from(wildcard).sort((a, b) => b.priority - a.priority)) {
        if (sub.filter && !sub.filter(event)) continue;
        try { sub.handler(event); } catch { /* swallow handler errors */ }
        if (sub.once) wildcard.delete(sub);
      }
    }
  }

  private processCascade(event: ClinicalEvent): void {
    const sorted = Array.from(this.cascadeRules.values())
      .filter(r => r.active && r.triggerEvent === event.type)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sorted) {
      if (rule.condition && !rule.condition(event)) continue;

      for (const effect of rule.effects) {
        this.onCascadeCallbacks.forEach(cb => cb(effect, event));
      }
    }
  }

  getHistory(filter?: EventFilter): ClinicalEvent[] {
    let events = this.history;

    if (filter) {
      if (filter.types && filter.types.length > 0) {
        events = events.filter(e => filter.types!.includes(e.type));
      }
      if (filter.patientId) {
        events = events.filter(e => e.patient.id === filter.patientId);
      }
      if (filter.actorId) {
        events = events.filter(e => e.actor.id === filter.actorId);
      }
      if (filter.startTime) {
        events = events.filter(e => e.timestamp >= filter.startTime!);
      }
      if (filter.endTime) {
        events = events.filter(e => e.timestamp <= filter.endTime!);
      }
      if (filter.source) {
        events = events.filter(e => e.source === filter.source);
      }
      if (filter.limit) {
        events = events.slice(-filter.limit);
      }
    }

    return events;
  }

  getPatientStream(patientId: string): ClinicalEvent[] {
    return this.history.filter(e => e.patient.id === patientId);
  }

  getEncounterStream(encounterId: string): ClinicalEvent[] {
    return this.history.filter(e => e.patient.encounterId === encounterId);
  }

  getEventsByType(type: EventType): ClinicalEvent[] {
    return this.history.filter(e => e.type === type);
  }

  clear(): void {
    this.history = [];
  }

  getStats(): { total: number; byType: Record<string, number>; byCategory: Record<string, number> } {
    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    for (const event of this.history) {
      byType[event.type] = (byType[event.type] || 0) + 1;

      for (const [cat, types] of Object.entries(EVENT_CATEGORIES)) {
        if ((types as EventType[]).includes(event.type)) {
          byCategory[cat] = (byCategory[cat] || 0) + 1;
          break;
        }
      }
    }

    return { total: this.history.length, byType, byCategory };
  }
}
