import { type IntelligenceEvent, IntelligenceDomain } from './types'

const eventListeners = new Map<string, Set<(event: IntelligenceEvent) => void>>()
const eventHistory: IntelligenceEvent[] = []

export function on(eventType: string, listener: (event: IntelligenceEvent) => void): () => void {
  if (!eventListeners.has(eventType)) {
    eventListeners.set(eventType, new Set())
  }
  eventListeners.get(eventType)!.add(listener)

  return () => {
    eventListeners.get(eventType)?.delete(listener)
  }
}

export function emit(eventType: string, payload: unknown): void {
  const event: IntelligenceEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: eventType,
    category: IntelligenceDomain.History,
    source: 'intelligence-engine',
    timestamp: Date.now(),
    payload,
    priority: 'normal',
    version: '1.0.0',
  }

  eventHistory.push(event)

  const listeners = eventListeners.get(eventType)
  if (listeners) {
    for (const listener of listeners) {
      try {
        listener(event)
      } catch {
        // Silently handle listener errors
      }
    }
  }
}

export function emitIntelligenceEvent(event: IntelligenceEvent): void {
  eventHistory.push(event)

  const listeners = eventListeners.get(event.type)
  if (listeners) {
    for (const listener of listeners) {
      try {
        listener(event)
      } catch {
        // Silently handle listener errors
      }
    }
  }
}

export function getEventHistory(limit: number = 100): IntelligenceEvent[] {
  return eventHistory.slice(-limit)
}

export function getEventHistoryByType(eventType: string): IntelligenceEvent[] {
  return eventHistory.filter(e => e.type === eventType)
}

export function clearEventHistory(): void {
  eventHistory.length = 0
}

export function getListenerCount(eventType?: string): number {
  if (eventType) {
    return eventListeners.get(eventType)?.size || 0
  }
  let total = 0
  for (const [, listeners] of eventListeners) {
    total += listeners.size
  }
  return total
}

export default {
  on,
  emit,
  emitIntelligenceEvent,
  getEventHistory,
  getEventHistoryByType,
  clearEventHistory,
  getListenerCount,
}