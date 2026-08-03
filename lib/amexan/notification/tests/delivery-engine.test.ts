import DeliveryEngine from '../delivery-engine'
import { NotificationCategory, NotificationChannel, NotificationSeverity, NotificationStatus } from '../types'

describe('DeliveryEngine', () => {
  test('should deliver a notification via email', async () => {
    const result = await DeliveryEngine.deliverNotification({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.Email,
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

    expect(result.status).toBe(NotificationStatus.Sent)
  })

  test('should deliver a notification via SMS', async () => {
    const result = await DeliveryEngine.deliverNotification({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.SMS,
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

    expect(result.status).toBe(NotificationStatus.Sent)
  })

  test('should get delivery history', async () => {
    await DeliveryEngine.deliverNotification({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.Email,
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

    const history = DeliveryEngine.getDeliveryHistory('notif-1')
    expect(history.length).toBeGreaterThan(0)
  })

  test('should get delivery stats', async () => {
    await DeliveryEngine.deliverNotification({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.Email,
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

    const stats = DeliveryEngine.getDeliveryStats()
    expect(stats.totalDeliveries).toBeGreaterThan(0)
  })

  test('should clear delivery history', async () => {
    await DeliveryEngine.deliverNotification({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.Email,
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

    DeliveryEngine.clearDeliveryHistory()
    const history = DeliveryEngine.getDeliveryHistory()
    expect(history.length).toBe(0)
  })
})
