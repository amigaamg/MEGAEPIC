import Validators from '../validators'
import { NotificationCategory, NotificationChannel, NotificationSeverity, NotificationStatus } from '../types'

describe('Validators', () => {
  test('should validate a complete notification', () => {
    const result = Validators.validateNotification({
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

    expect(result.valid).toBe(true)
  })

  test('should invalidate notification without userId', () => {
    const result = Validators.validateNotification({
      id: 'notif-1',
      userId: '',
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

    expect(result.valid).toBe(false)
  })

  test('should validate a template', () => {
    const result = Validators.validateTemplate({
      name: 'Test Template',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      subject: 'Subject',
      body: 'Body',
      organizationId: 'org-1',
    })

    expect(result.valid).toBe(true)
  })

  test('should invalidate template without name', () => {
    const result = Validators.validateTemplate({
      name: '',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      subject: 'Subject',
      body: 'Body',
      organizationId: 'org-1',
    })

    expect(result.valid).toBe(false)
  })

  test('should validate a preference', () => {
    const result = Validators.validatePreference({
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      enabled: true,
    })

    expect(result.valid).toBe(true)
  })
})
