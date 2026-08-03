import NotificationEngine from '../notification-engine'
import { type Notification, NotificationCategory, NotificationSeverity, NotificationChannel, NotificationStatus } from '../types'

describe('NotificationEngine', () => {
  let engine: typeof NotificationEngine

  beforeEach(() => {
    engine = NotificationEngine
    engine.clearNotifications()
  })

  test('should send a notification', async () => {
    const notification: Notification = {
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.InApp,
      status: NotificationStatus.Pending,
      title: 'Test Notification',
      body: 'This is a test',
      data: {},
      priority: 'medium',
      source: 'test',
      version: '1.0.0',
      createdAt: Date.now(),
      metadata: {},
    }

    const result = await engine.sendNotification(notification)

    expect(result.id).toBe('notif-1')
    expect(result.status).toBe(NotificationStatus.Sent)
  })

  test('should get notification by ID', async () => {
    const notification: Notification = {
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
    }

    await engine.sendNotification(notification)
    const result = engine.getNotification('notif-1')

    expect(result).toBeDefined()
    expect(result!.title).toBe('Test')
  })

  test('should get notifications by user', async () => {
    const notification: Notification = {
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
    }

    await engine.sendNotification(notification)
    const results = engine.getNotificationsByUser('user-1')

    expect(results.length).toBeGreaterThan(0)
  })

  test('should get notification stats', async () => {
    const notification: Notification = {
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.InApp,
      status: NotificationStatus.Sent,
      title: 'Test',
      body: 'Test',
      data: {},
      priority: 'medium',
      source: 'test',
      version: '1.0.0',
      createdAt: Date.now(),
      metadata: {},
    }

    await engine.sendNotification(notification)
    const stats = engine.getNotificationStats()

    expect(stats.total).toBeGreaterThan(0)
  })

  test('should update notification status', async () => {
    const notification: Notification = {
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
    }

    await engine.sendNotification(notification)
    const result = engine.updateNotificationStatus('notif-1', NotificationStatus.Read)

    expect(result).toBeDefined()
    expect(result!.status).toBe(NotificationStatus.Read)
  })
})
