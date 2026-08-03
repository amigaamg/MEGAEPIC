import { type NotificationPreference, NotificationCategory, NotificationChannel, NotificationSeverity } from './types'

const preferences: NotificationPreference[] = []

export function createPreference(preference: Omit<NotificationPreference, 'id' | 'createdAt' | 'updatedAt'>): NotificationPreference {
  const newPreference: NotificationPreference = {
    ...preference,
    id: `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  preferences.push(newPreference)
  return newPreference
}

export function getPreference(id: string): NotificationPreference | undefined {
  return preferences.find(p => p.id === id)
}

export function getPreferencesByUser(userId: string): NotificationPreference[] {
  return preferences.filter(p => p.userId === userId)
}

export function getPreferencesByOrganization(orgId: string): NotificationPreference[] {
  return preferences.filter(p => p.organizationId === orgId)
}

export function getPreferencesByCategory(category: NotificationCategory): NotificationPreference[] {
  return preferences.filter(p => p.category === category)
}

export function getPreferencesByChannel(channel: NotificationChannel): NotificationPreference[] {
  return preferences.filter(p => p.channel === channel)
}

export function updatePreference(id: string, updates: Partial<NotificationPreference>): NotificationPreference | undefined {
  const preference = preferences.find(p => p.id === id)
  if (preference) {
    Object.assign(preference, updates, { updatedAt: Date.now() })
    return preference
  }
  return undefined
}

export function deletePreference(id: string): boolean {
  const index = preferences.findIndex(p => p.id === id)
  if (index >= 0) {
    preferences.splice(index, 1)
    return true
  }
  return false
}

export function setChannelEnabled(userId: string, channel: NotificationChannel, enabled: boolean): NotificationPreference | undefined {
  const preference = preferences.find(p => p.userId === userId && p.channel === channel)
  if (preference) {
    preference.enabled = enabled
    preference.updatedAt = Date.now()
    return preference
  }
  return createPreference({
    userId,
    organizationId: '',
    category: NotificationCategory.System,
    channel,
    enabled,
    severity: [],
  })
}

export function getAllPreferences(): NotificationPreference[] {
  return [...preferences]
}

export function clearPreferences(): void {
  preferences.length = 0
}

export default {
  createPreference,
  getPreference,
  getPreferencesByUser,
  getPreferencesByOrganization,
  getPreferencesByCategory,
  getPreferencesByChannel,
  updatePreference,
  deletePreference,
  setChannelEnabled,
  getAllPreferences,
  clearPreferences,
}