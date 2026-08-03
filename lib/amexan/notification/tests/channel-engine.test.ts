import ChannelEngine from '../channel-engine'
import { NotificationCategory, NotificationChannel, NotificationSeverity, NotificationStatus } from '../types'

describe('ChannelEngine', () => {
  test('should send via email channel', async () => {
    const result = await ChannelEngine.sendViaChannel({
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

    expect(result.status).toBe('sent')
  })

  test('should send via SMS channel', async () => {
    const result = await ChannelEngine.sendViaChannel({
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

    expect(result.status).toBe('sent')
  })

  test('should send via push channel', async () => {
    const result = await ChannelEngine.sendViaChannel({
      id: 'notif-1',
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      severity: NotificationSeverity.Medium,
      channel: NotificationChannel.Push,
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

    expect(result.status).toBe('sent')
  })

  test('should get supported channels', () => {
    const channels = ChannelEngine.getSupportedChannels()
    expect(channels.length).toBeGreaterThan(0)
  })

  test('should get channel name', () => {
    expect(ChannelEngine.getChannelName(NotificationChannel.Email)).toBe('Email')
    expect(ChannelEngine.getChannelName(NotificationChannel.SMS)).toBe('SMS')
    expect(ChannelEngine.getChannelName(NotificationChannel.Push)).toBe('Push Notification')
  })
})
