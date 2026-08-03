import SchedulingEngine from '../scheduling-engine'
import { NotificationCategory, NotificationChannel, NotificationSeverity, NotificationStatus } from '../types'

describe('SchedulingEngine', () => {
  test('should schedule a notification', () => {
    const schedule = SchedulingEngine.scheduleNotification({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.InApp,
      status: NotificationStatus.Pending,
      title: 'Test',
      body: 'Test',
      data: {},
      priority: 'medium',
      source: 'test',
      version: '1.0.0',
      createdAt: Date.now(),
      metadata: {},
    })

    expect(schedule.id).toBeDefined()
    expect(schedule.notificationId).toBe('notif-1')
  })

  test('should schedule a recurring notification', () => {
    const schedule = SchedulingEngine.scheduleRecurringNotification({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.InApp,
      status: NotificationStatus.Pending,
      title: 'Test',
      body: 'Test',
      data: {},
      priority: 'medium',
      source: 'test',
      version: '1.0.0',
      createdAt: Date.now(),
      metadata: {},
    }, 'daily')

    expect(schedule.recurring).toBe(true)
    expect(schedule.recurrencePattern).toBe('daily')
  })

  test('should get schedule by ID', () => {
    const schedule = SchedulingEngine.scheduleNotification({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.InApp,
      status: NotificationStatus.Pending,
      title: 'Test',
      body: 'Test',
      data: {},
      priority: 'medium',
      source: 'test',
      version: '1.0.0',
      createdAt: Date.now(),
      metadata: {},
    })

    const result = SchedulingEngine.getSchedule(schedule.id)
    expect(result).toBeDefined()
  })

  test('should get pending notifications', () => {
    SchedulingEngine.scheduleNotification({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.InApp,
      status: NotificationStatus.Pending,
      title: 'Test',
      body: 'Test',
      data: {},
      priority: 'medium',
      source: 'test',
      version: '1.0.0',
      createdAt: Date.now(),
      metadata: {},
    })

    const pending = SchedulingEngine.getPendingNotifications()
    expect(pending.length).toBeGreaterThan(0)
  })

  test('should cancel a schedule', () => {
    const schedule = SchedulingEngine.scheduleNotification({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.InApp,
      status: NotificationStatus.Pending,
      title: 'Test',
      body: 'Test',
      data: {},
      priority: 'medium',
      source: 'test',
      version: '1.0.0',
      createdAt: Date.now(),
      metadata: {},
    })

    const cancelled = SchedulingEngine.cancelSchedule(schedule.id)
    expect(cancelled).toBe(true)
  })
})
