import PreferenceEngine from '../preference-engine'
import { NotificationCategory, NotificationChannel } from '../types'

describe('PreferenceEngine', () => {
  test('should create a preference', () => {
    const preference = PreferenceEngine.createPreference({
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      enabled: true,
      severity: [],
    })

    expect(preference.id).toBeDefined()
    expect(preference.enabled).toBe(true)
  })

  test('should get preferences by user', () => {
    PreferenceEngine.createPreference({
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      enabled: true,
      severity: [],
    })

    const preferences = PreferenceEngine.getPreferencesByUser('user-1')
    expect(preferences.length).toBeGreaterThan(0)
  })

  test('should update a preference', () => {
    const preference = PreferenceEngine.createPreference({
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      enabled: true,
      severity: [],
    })

    const updated = PreferenceEngine.updatePreference(preference.id, { enabled: false })
    expect(updated).toBeDefined()
    expect(updated!.enabled).toBe(false)
  })

  test('should delete a preference', () => {
    const preference = PreferenceEngine.createPreference({
      userId: 'user-1',
      organizationId: 'org-1',
      category: NotificationCategory.System,
      channel: NotificationChannel.Email,
      enabled: true,
      severity: [],
    })

    const deleted = PreferenceEngine.deletePreference(preference.id)
    expect(deleted).toBe(true)
  })

  test('should set channel enabled', () => {
    const preference = PreferenceEngine.setChannelEnabled('user-1', NotificationChannel.Email, false)
    expect(preference).toBeDefined()
  })
})
