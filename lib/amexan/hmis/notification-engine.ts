// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book VI: Universal Notification Engine
// Every event may generate notifications through configurable channels.
// ═══════════════════════════════════════════════════════════════════════════════

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  source: NotificationSource;
  sourceId: string;
  patientId?: string;
  encounterId?: string;
  orderId?: string;
  taskId?: string;
  resultId?: string;
  recipients: NotificationRecipient[];
  channels: NotificationChannel[];
  status: NotificationDeliveryStatus;
  readBy: string[];
  acknowledgedBy: string[];
  actions: NotificationAction[];
  scheduledAt?: number;
  expiresAt?: number;
  createdAt: number;
  deliveredAt?: number[];
}

export enum NotificationType {
  LabResultAvailable = 'lab_result_available',
  CriticalLabResult = 'critical_lab_result',
  RadiologyReportAvailable = 'radiology_report_available',
  PrescriptionReady = 'prescription_ready',
  MedicationDue = 'medication_due',
  MedicationOverdue = 'medication_overdue',
  VitalSignAbnormal = 'vital_sign_abnormal',
  PatientDeteriorating = 'patient_deteriorating',
  TaskAssigned = 'task_assigned',
  TaskOverdue = 'task_overdue',
  TaskEscalated = 'task_escalated',
  AppointmentReminder = 'appointment_reminder',
  AppointmentMissed = 'appointment_missed',
  AdmissionScheduled = 'admission_scheduled',
  DischargeReady = 'discharge_ready',
  TransferRequested = 'transfer_requested',
  TransferAccepted = 'transfer_accepted',
  ReferralReceived = 'referral_received',
  ReferralAccepted = 'referral_accepted',
  ReferralDeclined = 'referral_declined',
  BloodAvailable = 'blood_available',
  BloodRequested = 'blood_requested',
  ICUbedAvailable = 'icu_bed_available',
  WardBedAvailable = 'ward_bed_available',
  EquipmentReady = 'equipment_ready',
  EquipmentUnavailable = 'equipment_unavailable',
  DrugInteractionAlert = 'drug_interaction_alert',
  DrugStockLow = 'drug_stock_low',
  DrugExpiring = 'drug_expiring',
  BillingPending = 'billing_pending',
  InsuranceClaimStatus = 'insurance_claim_status',
  PaymentReceived = 'payment_received',
  ConsentRequired = 'consent_required',
  FollowUpDue = 'follow_up_due',
  FormRequired = 'form_required',
  CertificateReady = 'certificate_ready',
  DeathNotification = 'death_notification',
  SafetyIncident = 'safety_incident',
  SystemAlert = 'system_alert',
  General = 'general',
}

export enum NotificationCategory {
  Clinical = 'clinical',
  Critical = 'critical',
  Administrative = 'administrative',
  Appointment = 'appointment',
  Billing = 'billing',
  Inventory = 'inventory',
  System = 'system',
  Safety = 'safety',
  Task = 'task',
}

export enum NotificationSeverity {
  Critical = 'critical',
  Urgent = 'urgent',
  Important = 'important',
  Routine = 'routine',
  Informational = 'informational',
  Silent = 'silent',
}

export interface NotificationSource {
  type: 'system' | 'user' | 'integration' | 'schedule' | 'protocol';
  userId?: string;
  integrationName?: string;
}

export interface NotificationRecipient {
  userId: string;
  role?: string;
  departmentId?: string;
  email?: string;
  phone?: string;
  deviceToken?: string;
}

export interface NotificationChannel {
  type: ChannelType;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: number;
  error?: string;
}

export enum ChannelType {
  InApp = 'in_app',
  Email = 'email',
  SMS = 'sms',
  Push = 'push',
  WhatsApp = 'whatsapp',
  Pager = 'pager',
  Dashboard = 'dashboard',
  SoundAlarm = 'sound_alarm',
  LightAlarm = 'light_alarm',
  Broadcast = 'broadcast',
}

export enum NotificationDeliveryStatus {
  Pending = 'pending',
  Partial = 'partial',
  Delivered = 'delivered',
  Failed = 'failed',
  Expired = 'expired',
  Cancelled = 'cancelled',
}

export interface NotificationAction {
  label: string;
  type: 'link' | 'button' | 'api';
  url?: string;
  apiEndpoint?: string;
  payload?: Record<string, unknown>;
  confirmRequired: boolean;
}

export interface NotificationRule {
  id: string;
  trigger: NotificationTrigger;
  filters: NotificationFilter[];
  recipients: NotificationRecipient[];
  channels: ChannelType[];
  template: NotificationTemplate;
  isActive: boolean;
  priority: number;
}

export interface NotificationTrigger {
  type: NotificationType;
  sourcePattern?: string;
  severityPattern?: NotificationSeverity[];
  departmentScope?: string[];
}

export interface NotificationFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: unknown;
}

export interface NotificationTemplate {
  titleTemplate: string;
  bodyTemplate: string;
  variables: string[];
  actions: NotificationAction[];
}

export function createNotification(params: {
  type: NotificationType;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  source: NotificationSource;
  sourceId: string;
  recipients: NotificationRecipient[];
  channels?: NotificationChannel[];
  patientId?: string;
  encounterId?: string;
  orderId?: string;
  taskId?: string;
  resultId?: string;
  scheduledAt?: number;
  expiresAt?: number;
}): Notification {
  const now = Date.now();
  return {
    id: `NOTIF-${now.toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    type: params.type,
    category: params.category,
    severity: params.severity,
    title: params.title,
    body: params.body,
    source: params.source,
    sourceId: params.sourceId,
    patientId: params.patientId,
    encounterId: params.encounterId,
    orderId: params.orderId,
    taskId: params.taskId,
    resultId: params.resultId,
    recipients: params.recipients,
    channels: params.channels || [{ type: ChannelType.InApp, status: 'pending' }],
    status: NotificationDeliveryStatus.Pending,
    readBy: [],
    acknowledgedBy: [],
    actions: [],
    scheduledAt: params.scheduledAt,
    expiresAt: params.expiresAt,
    createdAt: now,
  };
}

export function deliverNotification(notification: Notification): Notification {
  const now = Date.now();
  notification.status = NotificationDeliveryStatus.Delivered;
  notification.deliveredAt = [now];
  notification.channels = notification.channels.map(c => ({ ...c, status: 'sent' as const, sentAt: now }));
  return notification;
}

export function markAsRead(notification: Notification, userId: string): Notification {
  if (!notification.readBy.includes(userId)) {
    notification.readBy.push(userId);
  }
  return notification;
}

export function acknowledgeNotification(notification: Notification, userId: string): Notification {
  if (!notification.acknowledgedBy.includes(userId)) {
    notification.acknowledgedBy.push(userId);
  }
  return notification;
}

export function getUnreadNotifications(notifications: Notification[], userId: string): Notification[] {
  return notifications.filter(n => !n.readBy.includes(userId));
}

export function getUnacknowledgedCritical(notifications: Notification[], userId: string): Notification[] {
  return notifications.filter(n =>
    n.severity === NotificationSeverity.Critical &&
    !n.acknowledgedBy.includes(userId)
  );
}

export function getNotificationsByType(notifications: Notification[], type: NotificationType): Notification[] {
  return notifications.filter(n => n.type === type);
}

export function getNotificationSummary(notifications: Notification[]): {
  total: number;
  unread: number;
  critical: number;
  urgent: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  for (const n of notifications) {
    byCategory[n.category] = (byCategory[n.category] || 0) + 1;
    bySeverity[n.severity] = (bySeverity[n.severity] || 0) + 1;
  }
  return {
    total: notifications.length,
    unread: notifications.filter(n => n.readBy.length === 0).length,
    critical: notifications.filter(n => n.severity === NotificationSeverity.Critical).length,
    urgent: notifications.filter(n => n.severity === NotificationSeverity.Urgent).length,
    byCategory, bySeverity,
  };
}
