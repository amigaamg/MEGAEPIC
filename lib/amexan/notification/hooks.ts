import { type Notification, NotificationCategory, NotificationSeverity, NotificationChannel, NotificationStatus } from './types'
import { sendNotification } from './notification-engine'
import { getPreferencesByUser } from './preference-engine'
import { emitNotificationEvent } from './events'

export function useNotification(
  userId: string,
  organizationId: string,
): {
  notifications: Notification[]
  send: (notification: Omit<Notification, 'id' | 'status' | 'createdAt'>) => Promise<Notification>
  sendBatch: (notifications: Omit<Notification, 'id' | 'status' | 'createdAt'>[]) => Promise<Notification[]>
  markAsRead: (id: string) => Notification | undefined
  acknowledge: (id: string) => Notification | undefined
  clear: () => void
  getStats: () => { total: number; unread: number; byCategory: Record<NotificationCategory, number> }
} {
  const state = {
    notifications: [] as Notification[],
  }

  async function send(notification: Omit<Notification, 'id' | 'status' | 'createdAt'>): Promise<Notification> {
    const fullNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: NotificationStatus.Pending,
      createdAt: Date.now(),
    }

    const result = await sendNotification(fullNotification)
    state.notifications.push(result)
    return result
  }

  async function sendBatch(notifications: Omit<Notification, 'id' | 'status' | 'createdAt'>[]): Promise<Notification[]> {
    const results: Notification[] = []
    for (const notification of notifications) {
      const result = await send(notification)
      results.push(result)
    }
    return results
  }

  function markAsRead(id: string): Notification | undefined {
    const notification = state.notifications.find(n => n.id === id)
    if (notification) {
      notification.status = NotificationStatus.Read
      notification.readAt = Date.now()
      emitNotificationEvent('notification_read', notification)
    }
    return notification
  }

  function acknowledge(id: string): Notification | undefined {
    const notification = state.notifications.find(n => n.id === id)
    if (notification) {
      notification.status = NotificationStatus.Acknowledged
      notification.readAt = Date.now()
      emitNotificationEvent('notification_acknowledged', notification)
    }
    return notification
  }

  function clear(): void {
    state.notifications.length = 0
  }

  function getStats(): { total: number; unread: number; byCategory: Record<NotificationCategory, number> } {
    const byCategory: Record<NotificationCategory, number> = {
      [NotificationCategory.System]: 0,
      [NotificationCategory.Clinical]: 0,
      [NotificationCategory.Administrative]: 0,
      [NotificationCategory.Security]: 0,
      [NotificationCategory.Patient]: 0,
      [NotificationCategory.Workflow]: 0,
    }

    let unread = 0
    for (const n of state.notifications) {
      byCategory[n.category]++
      if (n.status !== NotificationStatus.Read && n.status !== NotificationStatus.Acknowledged) {
        unread++
      }
    }

    return { total: state.notifications.length, unread, byCategory }
  }

  return {
    notifications: state.notifications,
    send,
    sendBatch,
    markAsRead,
    acknowledge,
    clear,
    getStats,
  }
}

export function useNotificationPreferences(
  userId: string,
  organizationId: string,
): {
  preferences: { channel: NotificationChannel; enabled: boolean }[]
  setChannelEnabled: (channel: NotificationChannel, enabled: boolean) => void
} {
  const preferences = getPreferencesByUser(userId)

  function setChannelEnabled(channel: NotificationChannel, enabled: boolean): void {
    const pref = preferences.find(p => p.channel === channel)
    if (pref) {
      pref.enabled = enabled
    }
  }

  return {
    preferences: preferences.map(p => ({ channel: p.channel, enabled: p.enabled })),
    setChannelEnabled,
  }
}

export default {
  useNotification,
  useNotificationPreferences,
}