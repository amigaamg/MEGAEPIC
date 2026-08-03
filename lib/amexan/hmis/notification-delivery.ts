// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS — Notification Delivery Module
// Channel config + delivery orchestration. Kept thin and deterministic so the
// admin UI can test delivery even before real providers are wired up.
// ═══════════════════════════════════════════════════════════════════════════════

import { ChannelType, deliverNotification, type Notification, type NotificationRecipient } from './notification-engine';

export interface ChannelProviderConfig {
  provider?: string;
  apiKey?: string;
  senderEmail?: string;
  senderName?: string;
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  serverKey?: string;
  senderId?: string;
  enabled: boolean;
}

export interface DeliveryConfig {
  email: ChannelProviderConfig;
  sms: ChannelProviderConfig;
  whatsapp: ChannelProviderConfig;
  push: ChannelProviderConfig;
  pager: ChannelProviderConfig;
}

export interface DeliveryResult {
  channel: string;
  recipient: string;
  status: 'sent' | 'failed';
  error?: string;
  messageId?: string;
}

const DEFAULT_CONFIG: DeliveryConfig = {
  email: { enabled: false },
  sms: { enabled: false },
  whatsapp: { enabled: false },
  push: { enabled: false },
  pager: { enabled: false },
};

let deliveryConfig: DeliveryConfig = { ...DEFAULT_CONFIG };

export function getDeliveryConfig(): DeliveryConfig {
  return deliveryConfig;
}

export function updateDeliveryConfig(config: DeliveryConfig): void {
  deliveryConfig = config;
}

export function getDeliveryConfigSummary(): Record<string, ChannelProviderConfig | 'not configured'> {
  const summary: Record<string, ChannelProviderConfig | 'not configured'> = {};
  for (const key of Object.keys(deliveryConfig) as (keyof DeliveryConfig)[]) {
    const cfg = deliveryConfig[key];
    summary[key] = cfg?.provider ? cfg : 'not configured';
  }
  return summary;
}

export function getDeliveryStats(results: DeliveryResult[]): DeliveryResult[] {
  return results;
}

function providerReady(segment: ChannelProviderConfig | undefined): boolean {
  return Boolean(segment && segment.enabled && segment.provider);
}

/**
 * Deliver a notification through a single channel and return a testable result.
 * Deterministic for now — no external side-effects from the browser context.
 */
export async function deliverViaChannel(
  notification: Notification,
  channel: ChannelType,
  recipient: NotificationRecipient,
): Promise<DeliveryResult> {
  const segment = deliveryConfig[channelKey(channel)];
  const ready = providerReady(segment);

  if (!ready) {
    return {
      channel: channel as string,
      recipient: recipient.userId,
      status: 'failed',
      error: `${channel} channel not configured`,
    };
  }

  deliverNotification(notification);
  return {
    channel: channel as string,
    recipient: recipient.userId,
    status: 'sent',
    messageId: `MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
  };
}

function channelKey(channel: ChannelType): keyof DeliveryConfig {
  switch (channel) {
    case ChannelType.Email: return 'email';
    case ChannelType.SMS: return 'sms';
    case ChannelType.WhatsApp: return 'whatsapp';
    case ChannelType.Push: return 'push';
    case ChannelType.Pager: return 'pager';
    default: return 'email';
  }
}