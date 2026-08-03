import { type Notification, NotificationCategory, NotificationSeverity, NotificationChannel, NotificationStatus } from './types'

export function validateNotification(notification: Notification): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!notification.id) errors.push('Notification ID is required')
  if (!notification.userId) errors.push('User ID is required')
  if (!notification.organizationId) errors.push('Organization ID is required')
  if (!notification.title) errors.push('Notification title is required')
  if (!notification.body) errors.push('Notification body is required')
  if (!Object.values(NotificationCategory).includes(notification.category as NotificationCategory)) {
    errors.push('Invalid notification category')
  }
  if (!Object.values(NotificationSeverity).includes(notification.severity as NotificationSeverity)) {
    errors.push('Invalid notification severity')
  }
  if (!Object.values(NotificationChannel).includes(notification.channel as NotificationChannel)) {
    errors.push('Invalid notification channel')
  }
  if (!Object.values(NotificationStatus).includes(notification.status as NotificationStatus)) {
    errors.push('Invalid notification status')
  }
  if (!notification.priority) errors.push('Notification priority is required')
  if (!notification.source) errors.push('Notification source is required')
  if (!notification.version) errors.push('Notification version is required')
  return { valid: errors.length === 0, errors }
}

export function validateTemplate(template: { name: string; category: NotificationCategory; channel: NotificationChannel; subject: string; body: string; organizationId: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!template.name) errors.push('Template name is required')
  if (!template.category) errors.push('Template category is required')
  if (!template.channel) errors.push('Template channel is required')
  if (!template.subject) errors.push('Template subject is required')
  if (!template.body) errors.push('Template body is required')
  if (!template.organizationId) errors.push('Organization ID is required')
  return { valid: errors.length === 0, errors }
}

export function validatePreference(preference: { userId: string; organizationId: string; category: NotificationCategory; channel: NotificationChannel; enabled: boolean }): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!preference.userId) errors.push('User ID is required')
  if (!preference.organizationId) errors.push('Organization ID is required')
  if (!preference.category) errors.push('Category is required')
  if (!preference.channel) errors.push('Channel is required')
  if (typeof preference.enabled !== 'boolean') errors.push('Enabled must be a boolean')
  return { valid: errors.length === 0, errors }
}

export function validateSchedule(schedule: { notificationId: string; userId: string; scheduledAt: number; timezone: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!schedule.notificationId) errors.push('Notification ID is required')
  if (!schedule.userId) errors.push('User ID is required')
  if (!schedule.scheduledAt || schedule.scheduledAt < Date.now()) errors.push('Scheduled time must be in the future')
  if (!schedule.timezone) errors.push('Timezone is required')
  return { valid: errors.length === 0, errors }
}

export default {
  validateNotification,
  validateTemplate,
  validatePreference,
  validateSchedule,
}