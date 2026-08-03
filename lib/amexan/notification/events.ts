import { type Notification } from './types'

const eventListeners = new Map<string, Set<(notification: Notification) => void>>()
const eventHistory: { type: string; notification: Notification; timestamp: number }[] = []

export function on(eventType: string, listener: (notification: Notification) => void): () => void {
  if (!eventListeners.has(eventType)) {
    eventListeners.set(eventType, new Set())
  }
  eventListeners.get(eventType)!.add(listener)

  return () => {
    eventListeners.get(eventType)?.delete(listener)
  }
}

export function emit(eventType: string, notification: Notification): void {
  eventHistory.push({ type: eventType, notification, timestamp: Date.now() })

  const listeners = eventListeners.get(eventType)
  if (listeners) {
    for (const listener of listeners) {
      try {
        listener(notification)
      } catch {
        // Silently handle listener errors
      }
    }
  }
}

export function emitNotificationEvent(eventType: string, notification: Notification): void {
  emit(eventType, notification)
}

export function getEventHistory(limit: number = 100): typeof eventHistory {
  return eventHistory.slice(-limit)
}

export function getEventHistoryByType(eventType: string): typeof eventHistory {
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
  emitNotificationEvent,
  getEventHistory,
  getEventHistoryByType,
  clearEventHistory,
  getListenerCount,
}