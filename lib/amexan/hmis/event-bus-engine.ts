// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XXIII: Real-Time Event Bus Engine
// Event-driven architecture with pub/sub, WebSocket management, and routing.
// ═══════════════════════════════════════════════════════════════════════════════

export interface EventMessage {
  id: string;
  eventType: EventType;
  source: string;
  sourceId: string;
  timestamp: number;
  payload: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
  priority: EventPriority;
  ttl: number;
  version: string;
  headers: Record<string, string>;
}

export enum EventType {
  // Clinical events
  PatientCreated = 'patient.created',
  PatientUpdated = 'patient.updated',
  EncounterCreated = 'encounter.created',
  EncounterStateChanged = 'encounter.state_changed',
  EncounterClosed = 'encounter.closed',
  DiagnosisAdded = 'diagnosis.added',
  DiagnosisUpdated = 'diagnosis.updated',
  OrderPlaced = 'order.placed',
  OrderCompleted = 'order.completed',
  ResultAvailable = 'result.available',
  ResultCritical = 'result.critical',
  ResultVerified = 'result.verified',
  PrescriptionWritten = 'prescription.written',
  PrescriptionDispensed = 'prescription.dispensed',
  MedicationAdministered = 'medication.administered',
  TaskAssigned = 'task.assigned',
  TaskCompleted = 'task.completed',
  TaskEscalated = 'task.escalated',
  AppointmentBooked = 'appointment.booked',
  AppointmentStarted = 'appointment.started',
  AppointmentCompleted = 'appointment.completed',
  AdmissionRequested = 'admission.requested',
  AdmissionCompleted = 'admission.completed',
  DischargeInitiated = 'discharge.initiated',
  DischargeCompleted = 'discharge.completed',
  TransferRequested = 'transfer.requested',
  TransferCompleted = 'transfer.completed',
  ReferralSent = 'referral.sent',
  ReferralAccepted = 'referral.accepted',
  VitalSignRecorded = 'vital_sign.recorded',
  VitalSignAbnormal = 'vital_sign.abnormal',
  AlertTriggered = 'alert.triggered',
  SafetyIncident = 'safety.incident',

  // Billing events
  InvoiceCreated = 'invoice.created',
  InvoicePaid = 'invoice.paid',
  PaymentReceived = 'payment.received',
  InsuranceClaimSubmitted = 'insurance_claim.submitted',
  InsuranceClaimApproved = 'insurance_claim.approved',

  // System events
  UserLoggedIn = 'user.logged_in',
  UserLoggedOut = 'user.logged_out',
  PermissionChanged = 'permission.changed',
  SystemHealthCheck = 'system.health_check',
  SystemError = 'system.error',
  DatabaseBackup = 'database.backup',
  IntegrationSync = 'integration.sync',
  IntegrationFailed = 'integration.failed',
  ConfigChanged = 'config.changed',
  SyncCompleted = 'sync.completed',
  OfflineQueueProcessed = 'offline_queue.processed',

  // Laboratory events
  LabOrdered = 'lab.ordered',
  SampleCollected = 'lab.sample_collected',
  SampleReceived = 'lab.sample_received',
  SampleRejected = 'lab.sample_rejected',
  LabCompleted = 'lab.completed',
  LabResultVerified = 'lab.result_verified',

  // Inventory events
  StockLow = 'stock.low',
  StockOut = 'stock.out',
  StockExpired = 'stock.expired',
  StockReceived = 'stock.received',
}

export enum EventPriority {
  Critical = 'critical',
  High = 'high',
  Normal = 'normal',
  Low = 'low',
}

export interface EventSubscription {
  id: string;
  subscriberId: string;
  subscriberType: 'service' | 'websocket' | 'webhook' | 'queue' | 'function';
  eventTypes: EventType[];
  filter?: EventFilter;
  endpoint?: string;
  status: SubscriptionStatus;
  createdAt: number;
  updatedAt: number;
}

export enum SubscriptionStatus {
  Active = 'active',
  Paused = 'paused',
  Error = 'error',
  Disabled = 'disabled',
}

export interface EventFilter {
  sourcePattern?: string;
  sourceIds?: string[];
  priority?: EventPriority[];
  departments?: string[];
  patientIds?: string[];
  customFilter?: Record<string, unknown>;
}

export interface WebSocketConnection {
  id: string;
  userId: string;
  sessionId: string;
  deviceId: string;
  connectedAt: number;
  lastPingAt: number;
  subscriptions: string[];
  status: 'connected' | 'disconnected' | 'expired';
  metadata: Record<string, unknown>;
}

export interface EventBusStats {
  totalEventsPublished: number;
  eventsInLastHour: number;
  activeSubscriptions: number;
  activeConnections: number;
  failedDeliveries: number;
  averageLatency: number;
  byEventType: Record<string, number>;
  byPriority: Record<string, number>;
}

export function createEvent(eventType: EventType, source: string, sourceId: string, payload: Record<string, unknown>, params?: { correlationId?: string; priority?: EventPriority; ttl?: number }): EventMessage {
  return {
    id: `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    eventType, source, sourceId, timestamp: Date.now(), payload,
    correlationId: params?.correlationId,
    priority: params?.priority || EventPriority.Normal,
    ttl: params?.ttl || 86400000,
    version: '1.0', headers: {},
  };
}

export function getEventBusStats(events: EventMessage[], subscriptions: EventSubscription[], connections: WebSocketConnection[]): EventBusStats {
  const byEventType: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const lastHour = Date.now() - 3600000;
  for (const e of events) {
    byEventType[e.eventType] = (byEventType[e.eventType] || 0) + 1;
    byPriority[e.priority] = (byPriority[e.priority] || 0) + 1;
  }
  return {
    totalEventsPublished: events.length,
    eventsInLastHour: events.filter(e => e.timestamp >= lastHour).length,
    activeSubscriptions: subscriptions.filter(s => s.status === SubscriptionStatus.Active).length,
    activeConnections: connections.filter(c => c.status === 'connected').length,
    failedDeliveries: 0,
    averageLatency: 0,
    byEventType, byPriority,
  };
}
