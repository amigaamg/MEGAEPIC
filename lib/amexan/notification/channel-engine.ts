import { type Notification, NotificationChannel, NotificationStatus } from './types'

const channelProviders = new Map<NotificationChannel, string>()

export function registerChannelProvider(channel: NotificationChannel, provider: string): void {
  channelProviders.set(channel, provider)
}

export function getChannelProvider(channel: NotificationChannel): string | undefined {
  return channelProviders.get(channel)
}

export async function sendViaChannel(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  switch (notification.channel) {
    case NotificationChannel.Email:
      return sendEmail(notification)
    case NotificationChannel.SMS:
      return sendSMS(notification)
    case NotificationChannel.Push:
      return sendPush(notification)
    case NotificationChannel.InApp:
      return sendInApp(notification)
    case NotificationChannel.Webhook:
      return sendWebhook(notification)
    case NotificationChannel.FHIR:
      return sendFHIR(notification)
    default:
      return { status: NotificationStatus.Failed }
  }
}

async function sendEmail(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  try {
    const messageId = `email_${notification.id}_${Date.now()}`
    return { status: NotificationStatus.Sent, messageId }
  } catch {
    return { status: NotificationStatus.Failed }
  }
}

async function sendSMS(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  try {
    const messageId = `sms_${notification.id}_${Date.now()}`
    return { status: NotificationStatus.Sent, messageId }
  } catch {
    return { status: NotificationStatus.Failed }
  }
}

async function sendPush(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  try {
    const messageId = `push_${notification.id}_${Date.now()}`
    return { status: NotificationStatus.Sent, messageId }
  } catch {
    return { status: NotificationStatus.Failed }
  }
}

async function sendInApp(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  try {
    const messageId = `inapp_${notification.id}_${Date.now()}`
    return { status: NotificationStatus.Sent, messageId }
  } catch {
    return { status: NotificationStatus.Failed }
  }
}

async function sendWebhook(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  try {
    const messageId = `webhook_${notification.id}_${Date.now()}`
    return { status: NotificationStatus.Sent, messageId }
  } catch {
    return { status: NotificationStatus.Failed }
  }
}

async function sendFHIR(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  try {
    const messageId = `fhir_${notification.id}_${Date.now()}`
    return { status: NotificationStatus.Sent, messageId }
  } catch {
    return { status: NotificationStatus.Failed }
  }
}

export function getSupportedChannels(): NotificationChannel[] {
  return [
    NotificationChannel.Email,
    NotificationChannel.SMS,
    NotificationChannel.Push,
    NotificationChannel.InApp,
    NotificationChannel.Webhook,
    NotificationChannel.FHIR,
  ]
}

export function getChannelName(channel: NotificationChannel): string {
  switch (channel) {
    case NotificationChannel.Email:
      return 'Email'
    case NotificationChannel.SMS:
      return 'SMS'
    case NotificationChannel.Push:
      return 'Push Notification'
    case NotificationChannel.InApp:
      return 'In-App'
    case NotificationChannel.Webhook:
      return 'Webhook'
    case NotificationChannel.FHIR:
      return 'FHIR'
    default:
      return 'Unknown'
  }
}

export default {
  registerChannelProvider,
  getChannelProvider,
  sendViaChannel,
  getSupportedChannels,
  getChannelName,
}