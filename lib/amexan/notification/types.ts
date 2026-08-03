export enum NotificationCategory {
  System = 'system',
  Clinical = 'clinical',
  Administrative = 'administrative',
  Security = 'security',
  Patient = 'patient',
  Workflow = 'workflow',
}

export enum NotificationSeverity {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low',
  Informational = 'informational',
}

export enum NotificationChannel {
  Email = 'email',
  SMS = 'sms',
  Push = 'push',
  InApp = 'in_app',
  Webhook = 'webhook',
  FHIR = 'fhir',
}

export enum NotificationStatus {
  Pending = 'pending',
  Sent = 'sent',
  Delivered = 'delivered',
  Failed = 'failed',
  Read = 'read',
  Acknowledged = 'acknowledged',
  Expired = 'expired',
}

export interface Notification {
  id: string
  userId: string
  patientId?: string
  organizationId: string
  category: NotificationCategory
  severity: NotificationSeverity
  channel: NotificationChannel
  status: NotificationStatus
  title: string
  body: string
  data: Record<string, unknown>
  priority: 'critical' | 'high' | 'medium' | 'low'
  source: string
  version: string
  createdAt: number
  sentAt?: number
  deliveredAt?: number
  readAt?: number
  expiresAt?: number
  metadata: Record<string, unknown>
}

export interface NotificationTemplate {
  id: string
  name: string
  category: NotificationCategory
  channel: NotificationChannel
  subject: string
  body: string
  variables: string[]
  organizationId: string
  version: string
  status: 'draft' | 'active' | 'archived'
  createdAt: number
  updatedAt: number
}

export interface NotificationPreference {
  id: string
  userId: string
  organizationId: string
  category: NotificationCategory
  channel: NotificationChannel
  enabled: boolean
  severity: NotificationSeverity[]
  quietHoursStart?: string
  quietHoursEnd?: string
  createdAt: number
  updatedAt: number
}

export interface NotificationDelivery {
  id: string
  notificationId: string
  channel: NotificationChannel
  status: NotificationStatus
  provider: string
  providerMessageId?: string
  errorCode?: string
  errorMessage?: string
  attempts: number
  maxAttempts: number
  createdAt: number
  updatedAt: number
}

export interface NotificationSchedule {
  id: string
  notificationId: string
  userId: string
  scheduledAt: number
  sentAt?: number
  recurring: boolean
  recurrencePattern?: string
  timezone: string
  createdAt: number
}

export interface NotificationAudit {
  id: string
  notificationId: string
  action: string
  userId: string
  organizationId: string
  timestamp: number
  details: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export interface NotificationMetrics {
  totalSent: number
  totalDelivered: number
  totalFailed: number
  totalRead: number
  totalAcknowledged: number
  deliveryRate: number
  readRate: number
  acknowledgmentRate: number
  failureRate: number
  averageDeliveryTimeMs: number
  channelBreakdown: Record<NotificationChannel, number>
  categoryBreakdown: Record<NotificationCategory, number>
  severityBreakdown: Record<NotificationSeverity, number>
}

export interface NotificationConfig {
  enableEmail: boolean
  enableSMS: boolean
  enablePush: boolean
  enableInApp: boolean
  enableWebhook: boolean
  enableFHIR: boolean
  maxRetries: number
  retryDelayMs: number
  batchSize: number
  rateLimitPerMinute: number
  defaultTTLMs: number
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
}