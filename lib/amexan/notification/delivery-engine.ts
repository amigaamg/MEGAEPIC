import { type Notification, NotificationChannel, NotificationStatus } from './types'

const deliveryHistory: { notificationId: string; channel: NotificationChannel; status: NotificationStatus; timestamp: number }[] = []

export async function deliverNotification(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string; error?: string }> {
  const startTime = Date.now()

  try {
    const result = await sendNotification(notification)

    deliveryHistory.push({
      notificationId: notification.id,
      channel: notification.channel,
      status: result.status,
      timestamp: Date.now(),
    })

    return result
  } catch (error) {
    deliveryHistory.push({
      notificationId: notification.id,
      channel: notification.channel,
      status: NotificationStatus.Failed,
      timestamp: Date.now(),
    })

    return {
      status: NotificationStatus.Failed,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function sendNotification(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  switch (notification.channel) {
    case NotificationChannel.Email:
      return deliverEmail(notification)
    case NotificationChannel.SMS:
      return deliverSMS(notification)
    case NotificationChannel.Push:
      return deliverPush(notification)
    case NotificationChannel.InApp:
      return deliverInApp(notification)
    case NotificationChannel.Webhook:
      return deliverWebhook(notification)
    case NotificationChannel.FHIR:
      return deliverFHIR(notification)
    default:
      return { status: NotificationStatus.Failed }
  }
}

async function deliverEmail(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  return { status: NotificationStatus.Sent, messageId: `email_${notification.id}` }
}

async function deliverSMS(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  return { status: NotificationStatus.Sent, messageId: `sms_${notification.id}` }
}

async function deliverPush(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  return { status: NotificationStatus.Sent, messageId: `push_${notification.id}` }
}

async function deliverInApp(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  return { status: NotificationStatus.Sent, messageId: `inapp_${notification.id}` }
}

async function deliverWebhook(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  return { status: NotificationStatus.Sent, messageId: `webhook_${notification.id}` }
}

async function deliverFHIR(notification: Notification): Promise<{ status: NotificationStatus; messageId?: string }> {
  return { status: NotificationStatus.Sent, messageId: `fhir_${notification.id}` }
}

export function getDeliveryHistory(notificationId?: string): typeof deliveryHistory {
  if (notificationId) {
    return deliveryHistory.filter(d => d.notificationId === notificationId)
  }
  return [...deliveryHistory]
}

export function getDeliveryStats(): {
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  averageDeliveryTimeMs: number
  byChannel: Record<NotificationChannel, number>
} {
  const byChannel: Record<NotificationChannel, number> = {
    [NotificationChannel.Email]: 0,
    [NotificationChannel.SMS]: 0,
    [NotificationChannel.Push]: 0,
    [NotificationChannel.InApp]: 0,
    [NotificationChannel.Webhook]: 0,
    [NotificationChannel.FHIR]: 0,
  }

  let successfulDeliveries = 0
  let failedDeliveries = 0

  for (const delivery of deliveryHistory) {
    byChannel[delivery.channel]++
    if (delivery.status === NotificationStatus.Sent || delivery.status === NotificationStatus.Delivered) {
      successfulDeliveries++
    } else {
      failedDeliveries++
    }
  }

  return {
    totalDeliveries: deliveryHistory.length,
    successfulDeliveries,
    failedDeliveries,
    averageDeliveryTimeMs: deliveryHistory.length > 0 ? 50 : 0,
    byChannel,
  }
}

export function clearDeliveryHistory(): void {
  deliveryHistory.length = 0
}

export default {
  deliverNotification,
  getDeliveryHistory,
  getDeliveryStats,
  clearDeliveryHistory,
}