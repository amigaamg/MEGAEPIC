import { type Notification, type NotificationSchedule, NotificationStatus } from './types'

const schedules: NotificationSchedule[] = []
const pendingNotifications: Notification[] = []

export function scheduleNotification(notification: Notification): NotificationSchedule {
  const schedule: NotificationSchedule = {
    id: `sched_${notification.id}_${Date.now()}`,
    notificationId: notification.id,
    userId: notification.userId,
    scheduledAt: Date.now(),
    recurring: false,
    timezone: 'UTC',
    createdAt: Date.now(),
  }

  schedules.push(schedule)
  pendingNotifications.push(notification)

  return schedule
}

export function scheduleRecurringNotification(
  notification: Notification,
  recurrencePattern: string,
): NotificationSchedule {
  const schedule: NotificationSchedule = {
    id: `sched_${notification.id}_${Date.now()}`,
    notificationId: notification.id,
    userId: notification.userId,
    scheduledAt: Date.now(),
    recurring: true,
    recurrencePattern,
    timezone: 'UTC',
    createdAt: Date.now(),
  }

  schedules.push(schedule)
  pendingNotifications.push(notification)

  return schedule
}

export function getSchedule(id: string): NotificationSchedule | undefined {
  return schedules.find(s => s.id === id)
}

export function getSchedulesByUser(userId: string): NotificationSchedule[] {
  return schedules.filter(s => s.userId === userId)
}

export function getSchedulesByNotification(notificationId: string): NotificationSchedule[] {
  return schedules.filter(s => s.notificationId === notificationId)
}

export function getPendingNotifications(): Notification[] {
  return [...pendingNotifications]
}

export function processPendingNotifications(): Notification[] {
  const now = Date.now()
  const ready = pendingNotifications.filter(n => {
    const schedule = schedules.find(s => s.notificationId === n.id)
    return schedule && schedule.scheduledAt <= now
  })

  for (const notification of ready) {
    const index = pendingNotifications.indexOf(notification)
    if (index >= 0) {
      pendingNotifications.splice(index, 1)
    }
  }

  return ready
}

export function cancelSchedule(id: string): boolean {
  const scheduleIndex = schedules.findIndex(s => s.id === id)
  if (scheduleIndex >= 0) {
    schedules.splice(scheduleIndex, 1)
    const notifIndex = pendingNotifications.findIndex(n => n.id === schedules[scheduleIndex]?.notificationId)
    if (notifIndex >= 0) {
      pendingNotifications.splice(notifIndex, 1)
    }
    return true
  }
  return false
}

export function clearSchedules(): void {
  schedules.length = 0
  pendingNotifications.length = 0
}

export default {
  scheduleNotification,
  scheduleRecurringNotification,
  getSchedule,
  getSchedulesByUser,
  getSchedulesByNotification,
  getPendingNotifications,
  processPendingNotifications,
  cancelSchedule,
  clearSchedules,
}