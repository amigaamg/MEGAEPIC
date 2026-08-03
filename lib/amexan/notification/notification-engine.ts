import { type Notification, type NotificationConfig, type NotificationPreference, NotificationCategory, NotificationSeverity, NotificationStatus, NotificationChannel } from './types'
import { sendViaChannel } from './channel-engine'
import { scheduleNotification } from './scheduling-engine'
import { validateNotification } from './validators'
import { emitNotificationEvent } from './events'
import { getPreferencesByUser } from './preference-engine'
import { auditNotification } from './audit-engine'

const notifications: Notification[] = []

export function getConfig(): NotificationConfig {
  return {
    enableEmail: true,
    enableSMS: true,
    enablePush: true,
    enableInApp: true,
    enableWebhook: true,
    enableFHIR: true,
    maxRetries: 3,
    retryDelayMs: 5000,
    batchSize: 100,
    rateLimitPerMinute: 1000,
    defaultTTLMs: 86400000,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  }
}

export async function sendNotification(notification: Notification): Promise<Notification> {
  const validation = validateNotification(notification)
  if (!validation.valid) {
    throw new Error(`Notification validation failed: ${validation.errors.join(', ')}`)
  }

  notifications.push(notification)
  emitNotificationEvent('notification_created', notification)

  const preferences = getPreferencesByUser(notification.userId).filter(p => p.organizationId === notification.organizationId)

  if (!isChannelEnabled(notification.channel, preferences)) {
    notification.status = NotificationStatus.Failed
    return notification
  }

  if (isQuietHours(notification)) {
    notification.status = NotificationStatus.Pending
    scheduleNotification(notification)
    return notification
  }

  const delivery = await sendViaChannel(notification)
  notification.status = delivery.status === NotificationStatus.Sent ? NotificationStatus.Sent : NotificationStatus.Failed
  notification.sentAt = Date.now()

  auditNotification(notification, 'sent', notification.userId, notification.organizationId)
  emitNotificationEvent('notification_sent', notification)

  return notification
}

export async function sendBatch(notifications: Notification[]): Promise<Notification[]> {
  const results: Notification[] = []

  for (const notification of notifications) {
    try {
      const result = await sendNotification(notification)
      results.push(result)
    } catch {
      notification.status = NotificationStatus.Failed
      results.push(notification)
    }
  }

  return results
}

export function getNotification(id: string): Notification | undefined {
  return notifications.find(n => n.id === id)
}

export function getNotificationsByUser(userId: string): Notification[] {
  return notifications.filter(n => n.userId === userId)
}

export function getNotificationsByPatient(patientId: string): Notification[] {
  return notifications.filter(n => n.patientId === patientId)
}

export function getNotificationsByOrganization(orgId: string): Notification[] {
  return notifications.filter(n => n.organizationId === orgId)
}

export function getNotificationsByCategory(category: NotificationCategory): Notification[] {
  return notifications.filter(n => n.category === category)
}

export function getNotificationsBySeverity(severity: NotificationSeverity): Notification[] {
  return notifications.filter(n => n.severity === severity)
}

export function getNotificationsByStatus(status: NotificationStatus): Notification[] {
  return notifications.filter(n => n.status === status)
}

export function getNotificationsByChannel(channel: NotificationChannel): Notification[] {
  return notifications.filter(n => n.channel === channel)
}

export function updateNotificationStatus(id: string, status: NotificationStatus): Notification | undefined {
  const notification = notifications.find(n => n.id === id)
  if (notification) {
    notification.status = status
    if (status === NotificationStatus.Delivered) {
      notification.deliveredAt = Date.now()
    }
    if (status === NotificationStatus.Read) {
      notification.readAt = Date.now()
    }
    auditNotification(notification, 'status_updated', notification.userId, notification.organizationId)
    emitNotificationEvent('notification_updated', notification)
  }
  return notification
}

export function acknowledgeNotification(id: string, userId: string): Notification | undefined {
  const notification = notifications.find(n => n.id === id)
  if (notification) {
    notification.status = NotificationStatus.Acknowledged
    notification.readAt = Date.now()
    auditNotification(notification, 'acknowledged', userId, notification.organizationId)
    emitNotificationEvent('notification_acknowledged', notification)
  }
  return notification
}

export function deleteNotification(id: string): boolean {
  const index = notifications.findIndex(n => n.id === id)
  if (index >= 0) {
    notifications.splice(index, 1)
    return true
  }
  return false
}

export function clearNotifications(orgId?: string): void {
  if (orgId) {
    const index = notifications.findIndex(n => n.organizationId === orgId)
    if (index >= 0) {
      notifications.splice(index)
    }
  } else {
    notifications.length = 0
  }
}

export function getNotificationStats(): {
  total: number
  byStatus: Record<NotificationStatus, number>
  byChannel: Record<NotificationChannel, number>
  byCategory: Record<NotificationCategory, number>
  bySeverity: Record<NotificationSeverity, number>
} {
  const byStatus: Record<NotificationStatus, number> = {
    [NotificationStatus.Pending]: 0,
    [NotificationStatus.Sent]: 0,
    [NotificationStatus.Delivered]: 0,
    [NotificationStatus.Failed]: 0,
    [NotificationStatus.Read]: 0,
    [NotificationStatus.Acknowledged]: 0,
    [NotificationStatus.Expired]: 0,
  }
  const byChannel: Record<NotificationChannel, number> = {
    [NotificationChannel.Email]: 0,
    [NotificationChannel.SMS]: 0,
    [NotificationChannel.Push]: 0,
    [NotificationChannel.InApp]: 0,
    [NotificationChannel.Webhook]: 0,
    [NotificationChannel.FHIR]: 0,
  }
  const byCategory: Record<NotificationCategory, number> = {
    [NotificationCategory.System]: 0,
    [NotificationCategory.Clinical]: 0,
    [NotificationCategory.Administrative]: 0,
    [NotificationCategory.Security]: 0,
    [NotificationCategory.Patient]: 0,
    [NotificationCategory.Workflow]: 0,
  }
  const bySeverity: Record<NotificationSeverity, number> = {
    [NotificationSeverity.Critical]: 0,
    [NotificationSeverity.High]: 0,
    [NotificationSeverity.Medium]: 0,
    [NotificationSeverity.Low]: 0,
    [NotificationSeverity.Informational]: 0,
  }

  for (const n of notifications) {
    byStatus[n.status]++
    byChannel[n.channel]++
    byCategory[n.category]++
    bySeverity[n.severity]++
  }

  return {
    total: notifications.length,
    byStatus,
    byChannel,
    byCategory,
    bySeverity,
  }
}

function isChannelEnabled(channel: NotificationChannel, preferences: NotificationPreference[]): boolean {
  const pref = preferences.find(p => p.channel === channel)
  return pref ? pref.enabled : true
}

function isQuietHours(notification: Notification): boolean {
  const config = getConfig()
  if (!config.quietHoursEnabled) return false

  const now = new Date()
  const currentHour = now.getHours()
  const [startHour, startMinute] = config.quietHoursStart.split(':').map(Number)
  const [endHour, endMinute] = config.quietHoursEnd.split(':').map(Number)
  const currentMinutes = currentHour * 60 + now.getMinutes()
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  }
  return currentMinutes >= startMinutes || currentMinutes < endMinutes
}

export default {
  getConfig,
  sendNotification,
  sendBatch,
  getNotification,
  getNotificationsByUser,
  getNotificationsByPatient,
  getNotificationsByOrganization,
  getNotificationsByCategory,
  getNotificationsBySeverity,
  getNotificationsByStatus,
  getNotificationsByChannel,
  updateNotificationStatus,
  acknowledgeNotification,
  deleteNotification,
  clearNotifications,
  getNotificationStats,
}