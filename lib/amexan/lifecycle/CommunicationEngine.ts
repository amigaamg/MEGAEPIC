// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN COMMUNICATION ENGINE (BOOK VIII — Communication Constitution)
//
// Everything communicates through events. Nobody manually refreshes. Every event
// is routed to the engines and actors that must react:
//
//   Doctor requests CBC → Lab notified → Result ready → Doctor notified →
//   Patient notified → Analytics updated → Research updated → Quality updated.
//
// Pure and deterministic. Persistence is orchestrated by the conductor.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';
import type { CommunicationModel, DomainEvent, EventPriority, NotificationRecord } from './types';

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface EmitEventInput {
  type: string;
  sourceEngine: string;
  entityType: string;
  entityId: string;
  payload?: Record<string, string>;
  priority?: EventPriority;
  recipientActorIds?: AmxUid[];
  channels?: ('push' | 'sms' | 'in_app' | 'email')[];
  title: string;
  message: string;
}

export class CommunicationEngine {
  static create(): CommunicationModel {
    return { events: [], notifications: {}, updatedAt: Date.now() };
  }

  /** Emit a domain event and fan out notifications to every recipient actor. */
  static emit(model: CommunicationModel, input: EmitEventInput): { model: CommunicationModel; event: DomainEvent } {
    const now = Date.now();
    const event: DomainEvent = {
      id: nextId('evt'),
      type: input.type,
      sourceEngine: input.sourceEngine,
      entityType: input.entityType,
      entityId: input.entityId,
      payload: input.payload ?? {},
      priority: input.priority ?? 'normal',
      emittedAt: now,
      recipientActorIds: input.recipientActorIds ?? [],
      channels: input.channels ?? ['in_app'],
      delivered: input.recipientActorIds ? input.recipientActorIds.length > 0 : false,
    };
    let notifications = model.notifications;
    if (input.recipientActorIds && input.recipientActorIds.length) {
      for (const actorId of input.recipientActorIds) {
        const record: NotificationRecord = {
          id: nextId('ntf'),
          actorId,
          eventId: event.id,
          title: input.title,
          message: input.message,
          createdAt: now,
          read: false,
          actionable: input.priority === 'urgent' || input.priority === 'critical',
          actionLink: input.entityType === 'encounter' ? `/encounter/${input.entityId}` : `/${input.entityType}/${input.entityId}`,
        };
        const existing = notifications[actorId] ?? [];
        notifications = { ...notifications, [actorId]: [...existing, record] };
      }
    }
    return { model: { events: [...model.events, event], notifications, updatedAt: now }, event };
  }

  static getNotifications(model: CommunicationModel, actorId: AmxUid): NotificationRecord[] {
    const all = model.notifications[actorId] ?? [];
    return [...all].sort((a, b) => b.createdAt - a.createdAt);
  }

  static getUnreadCount(model: CommunicationModel, actorId: AmxUid): number {
    return (model.notifications[actorId] ?? []).filter(n => !n.read).length;
  }

  static markRead(model: CommunicationModel, actorId: AmxUid, notificationId: string): CommunicationModel {
    const notifications = (model.notifications[actorId] ?? []).map(n => (n.id === notificationId ? { ...n, read: true, readAt: Date.now() } : n));
    return { ...model, notifications: { ...model.notifications, [actorId]: notifications }, updatedAt: Date.now() };
  }

  static markAllRead(model: CommunicationModel, actorId: AmxUid): CommunicationModel {
    const notifications = (model.notifications[actorId] ?? []).map(n => ({ ...n, read: true, readAt: n.readAt ?? Date.now() }));
    return { ...model, notifications: { ...model.notifications, [actorId]: notifications }, updatedAt: Date.now() };
  }

  static getEventsByEntity(model: CommunicationModel, entityType: string, entityId: string): DomainEvent[] {
    return model.events.filter(e => e.entityType === entityType && e.entityId === entityId).sort((a, b) => a.emittedAt - b.emittedAt);
  }

  static getEventsByType(model: CommunicationModel, type: string): DomainEvent[] {
    return model.events.filter(e => e.type === type).sort((a, b) => a.emittedAt - b.emittedAt);
  }

  static getCriticalEvents(model: CommunicationModel): DomainEvent[] {
    return model.events.filter(e => e.priority === 'critical' || e.priority === 'urgent').sort((a, b) => b.emittedAt - a.emittedAt);
  }

  static getActivityFeed(model: CommunicationModel, actorId: AmxUid, limit = 20): NotificationRecord[] {
    return CommunicationEngine.getNotifications(model, actorId).slice(0, limit);
  }
}

export default CommunicationEngine;
