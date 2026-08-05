// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN ICT Engine (BOOK VI-S · Constitutional Engine No. 29)
//
// "The Engine of Digital Infrastructure"
//
// ICT keeps the entire Healthcare Operating System alive. The engine governs:
// devices, servers, networks, cloud, backups, cybersecurity, integrations,
// monitoring, support, incident response, and business continuity.
//
// This engine is pure and deterministic. Persistence is orchestrated by the
// provisioning conductor, never by this file.
// ═══════════════════════════════════════════════════════════════════════════════

import type { AmxUid } from '@/lib/amexan/constitution/types';

// ── Constitutional authority / restriction tables ──────────────────────────────

export const ICT_AUTHORITY: readonly string[] = [
  'manage_devices', 'manage_infrastructure', 'manage_integrations',
  'perform_cybersecurity_operations', 'respond_to_incidents',
  'manage_support_tickets', 'manage_backups', 'manage_cloud',
  'monitor_systems', 'lead_digital_governance',
];

export const ICT_RESTRICTIONS: readonly string[] = [
  'access_patient_data_for_non_operational_reasons', 'disable_audit_logs',
  'override_constitutional_governance', 'expose_credentials',
  'downtime_without_communication', 'bypass_cybersecurity_controls',
];

// ── Device engine ──────────────────────────────────────────────────────────────

export type DeviceKind =
  | 'computer' | 'tablet' | 'mobile' | 'printer' | 'scanner'
  | 'biomedical_interface' | 'iot';

export interface Device {
  id: string;
  kind: DeviceKind;
  name: string;
  serialNumber: string;
  location?: string;
  assignedTo?: AmxUid;
  status: 'online' | 'offline' | 'maintenance' | 'retired';
  registeredAt: number;
  lastSeenAt?: number;
}

// ── Infrastructure (servers / networks / cloud / backups) ──────────────────────

export type InfrastructureKind =
  | 'server' | 'network' | 'cloud' | 'backup' | 'storage';

export interface InfrastructureAsset {
  id: string;
  kind: InfrastructureKind;
  name: string;
  status: 'operational' | 'degraded' | 'offline' | 'maintenance';
  capacity?: string;
  utilizationPercent?: number;
  lastBackupAt?: number;
  lastCheckAt: number;
}

// ── Integration engine ─────────────────────────────────────────────────────────

export type IntegrationKind =
  | 'fhir' | 'hl7' | 'pacs' | 'ris' | 'lis' | 'erp' | 'insurance'
  | 'government' | 'banking' | 'payment_gateway' | 'national_registry';

export interface Integration {
  id: string;
  kind: IntegrationKind;
  name: string;
  endpoint: string;
  status: 'connected' | 'disconnected' | 'degraded' | 'configuring';
  lastSyncAt?: number;
  connectedAt?: number;
}

// ── Cybersecurity engine ───────────────────────────────────────────────────────

export type CyberEventKind =
  | 'authentication_failure' | 'authorization_denial' | 'encryption_issue'
  | 'audit_log_anomaly' | 'threat_detected' | 'phishing' | 'malware' | 'data_breach';

export interface CyberEvent {
  id: string;
  kind: CyberEventKind;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: number;
  response: 'monitoring' | 'contained' | 'resolved';
  resolvedAt?: number;
  reportedTo?: string;
}

// ── Support engine ─────────────────────────────────────────────────────────────

export interface SupportTicket {
  id: string;
  reporterId: AmxUid;
  subject: string;
  description: string;
  assignedTo?: AmxUid;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  openedAt: number;
  resolvedAt?: number;
  resolution?: string;
  kbArticleIds: string[];
  satisfactionScore?: number;
}

// ── Knowledge base ─────────────────────────────────────────────────────────────

export interface KnowledgeArticle {
  id: string;
  title: string;
  body: string;
  category: string;
  createdBy?: AmxUid;
  createdAt: number;
  updatedAt: number;
}

// ── Business continuity ────────────────────────────────────────────────────────

export interface ContinuityPlan {
  id: string;
  scenario: string;
  runbookSteps: string[];
  rtoMinutes: number;
  rpoMinutes: number;
  testedAt?: number;
  lastTestOutcome?: 'passed' | 'failed';
  status: 'active' | 'draft';
}

// ── Engine model ───────────────────────────────────────────────────────────────

export interface IctModel {
  organizationId: string;
  facilityId?: string;
  chiefInformationOfficerId?: AmxUid;
  devices: Device[];
  infrastructure: InfrastructureAsset[];
  integrations: Integration[];
  cyberEvents: CyberEvent[];
  tickets: SupportTicket[];
  knowledgeBase: KnowledgeArticle[];
  continuityPlans: ContinuityPlan[];
  auditLog: { at: number; actorId: AmxUid; action: string; detail?: string }[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateIctModelInput {
  organizationId: string;
  facilityId?: string;
  chiefInformationOfficerId?: AmxUid;
  actorId?: AmxUid;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── The Engine ─────────────────────────────────────────────────────────────────

export class IctEngine {
  // ── Model creation ───────────────────────────────────────────────────────────

  static create(input: CreateIctModelInput): IctModel {
    if (!input.organizationId) throw new Error('[IctEngine] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      facilityId: input.facilityId,
      chiefInformationOfficerId: input.chiefInformationOfficerId,
      devices: [],
      infrastructure: [],
      integrations: [],
      cyberEvents: [],
      tickets: [],
      knowledgeBase: [],
      continuityPlans: [],
      auditLog: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Constitutional guard & audit ─────────────────────────────────────────────

  static canIctPerform(action: string): { allowed: boolean; reason?: string } {
    if (ICT_AUTHORITY.includes(action)) return { allowed: true };
    if (ICT_RESTRICTIONS.includes(action)) {
      const reasons: Record<string, string> = {
        access_patient_data_for_non_operational_reasons: 'ICT access to patient data is limited to operational support.',
        disable_audit_logs: 'Audit logs may never be disabled.',
        override_constitutional_governance: 'Constitutional governance may not be overridden.',
        expose_credentials: 'Credentials must never be exposed.',
        downtime_without_communication: 'Planned downtime requires prior communication.',
        bypass_cybersecurity_controls: 'Cybersecurity controls may not be bypassed.',
      };
      return { allowed: false, reason: reasons[action] };
    }
    return { allowed: false, reason: `Action "${action}" is not within ICT authority.` };
  }

  static guard(model: IctModel, actorId: AmxUid, action: string): void {
    if (!actorId) throw new Error('[IctEngine] actorId is required for ICT actions');
    const verdict = IctEngine.canIctPerform(action);
    if (!verdict.allowed) throw new Error(`[IctEngine] ${verdict.reason}`);
  }

  static audit(model: IctModel, actorId: AmxUid | undefined, action: string, detail?: string): IctModel {
    const now = Date.now();
    const actor = actorId ?? model.chiefInformationOfficerId;
    if (!actor) return { ...model, updatedAt: now };
    return { ...model, auditLog: [...model.auditLog, { at: now, actorId: actor, action, detail }], updatedAt: now };
  }

  // ── Device Engine ────────────────────────────────────────────────────────────

  static registerDevice(model: IctModel, actorId: AmxUid | undefined, input: Omit<Device, 'id' | 'registeredAt' | 'status'>): { model: IctModel; device: Device } {
    IctEngine.guard(model, actorId ?? model.chiefInformationOfficerId ?? ('' as AmxUid), 'manage_devices');
    const device: Device = { ...input, id: nextId('dev'), registeredAt: Date.now(), status: 'online' };
    return {
      model: { ...IctEngine.audit(model, actorId, 'device_registered', input.kind), devices: [...model.devices, device], updatedAt: Date.now() },
      device,
    };
  }

  static updateDeviceStatus(model: IctModel, deviceId: string, status: Device['status']): IctModel {
    const index = model.devices.findIndex(d => d.id === deviceId);
    if (index === -1) throw new Error(`[IctEngine] Device "${deviceId}" does not exist`);
    const updated = { ...model.devices[index], status, lastSeenAt: Date.now() };
    return { ...model, devices: [...model.devices.slice(0, index), updated, ...model.devices.slice(index + 1)], updatedAt: Date.now() };
  }

  static getOfflineDevices(model: IctModel): Device[] {
    return model.devices.filter(d => d.status === 'offline');
  }

  // ── Infrastructure Engine ────────────────────────────────────────────────────

  static registerInfrastructure(model: IctModel, actorId: AmxUid | undefined, input: Omit<InfrastructureAsset, 'id' | 'lastCheckAt'>): { model: IctModel; asset: InfrastructureAsset } {
    IctEngine.guard(model, actorId ?? model.chiefInformationOfficerId ?? ('' as AmxUid), 'manage_infrastructure');
    const asset: InfrastructureAsset = { ...input, id: nextId('inf'), lastCheckAt: Date.now() };
    return {
      model: { ...IctEngine.audit(model, actorId, 'infrastructure_registered', input.kind), infrastructure: [...model.infrastructure, asset], updatedAt: Date.now() },
      asset,
    };
  }

  static updateInfrastructureStatus(model: IctModel, assetId: string, status: InfrastructureAsset['status'], utilizationPercent?: number): IctModel {
    const index = model.infrastructure.findIndex(a => a.id === assetId);
    if (index === -1) throw new Error(`[IctEngine] Infrastructure asset "${assetId}" does not exist`);
    const updated = { ...model.infrastructure[index], status, utilizationPercent: utilizationPercent ?? model.infrastructure[index].utilizationPercent, lastCheckAt: Date.now() };
    return { ...model, infrastructure: [...model.infrastructure.slice(0, index), updated, ...model.infrastructure.slice(index + 1)], updatedAt: Date.now() };
  }

  static recordBackup(model: IctModel, backupId: string): IctModel {
    const index = model.infrastructure.findIndex(a => a.id === backupId);
    if (index === -1) throw new Error(`[IctEngine] Infrastructure asset "${backupId}" does not exist`);
    const updated = { ...model.infrastructure[index], lastBackupAt: Date.now() };
    return { ...model, infrastructure: [...model.infrastructure.slice(0, index), updated, ...model.infrastructure.slice(index + 1)], updatedAt: Date.now() };
  }

  static getDegradedInfrastructure(model: IctModel): InfrastructureAsset[] {
    return model.infrastructure.filter(a => a.status === 'degraded' || a.status === 'offline');
  }

  // ── Integration Engine ───────────────────────────────────────────────────────

  static connectIntegration(model: IctModel, actorId: AmxUid | undefined, input: Omit<Integration, 'id' | 'status'>): { model: IctModel; integration: Integration } {
    IctEngine.guard(model, actorId ?? model.chiefInformationOfficerId ?? ('' as AmxUid), 'manage_integrations');
    const integration: Integration = { ...input, id: nextId('int'), status: 'connected', connectedAt: Date.now(), lastSyncAt: Date.now() };
    return {
      model: { ...IctEngine.audit(model, actorId, 'integration_connected', input.kind), integrations: [...model.integrations, integration], updatedAt: Date.now() },
      integration,
    };
  }

  static recordIntegrationSync(model: IctModel, integrationId: string, status?: Integration['status']): IctModel {
    const index = model.integrations.findIndex(i => i.id === integrationId);
    if (index === -1) throw new Error(`[IctEngine] Integration "${integrationId}" does not exist`);
    const updated = { ...model.integrations[index], status: status ?? 'connected', lastSyncAt: Date.now() };
    return { ...model, integrations: [...model.integrations.slice(0, index), updated, ...model.integrations.slice(index + 1)], updatedAt: Date.now() };
  }

  static getActiveIntegrations(model: IctModel): Integration[] {
    return model.integrations.filter(i => i.status === 'connected');
  }

  // ── Cybersecurity Engine ─────────────────────────────────────────────────────

  static reportCyberEvent(model: IctModel, actorId: AmxUid | undefined, input: Omit<CyberEvent, 'id' | 'detectedAt' | 'response'>): { model: IctModel; event: CyberEvent } {
    IctEngine.guard(model, actorId ?? model.chiefInformationOfficerId ?? ('' as AmxUid), 'perform_cybersecurity_operations');
    const event: CyberEvent = { ...input, id: nextId('cyb'), detectedAt: Date.now(), response: 'monitoring' };
    return {
      model: { ...IctEngine.audit(model, actorId, 'cyber_event_reported', input.kind), cyberEvents: [...model.cyberEvents, event], updatedAt: Date.now() },
      event,
    };
  }

  static resolveCyberEvent(model: IctModel, eventId: string): IctModel {
    const index = model.cyberEvents.findIndex(e => e.id === eventId);
    if (index === -1) throw new Error(`[IctEngine] Cyber event "${eventId}" does not exist`);
    const updated = { ...model.cyberEvents[index], response: 'resolved' as const, resolvedAt: Date.now() };
    return { ...model, cyberEvents: [...model.cyberEvents.slice(0, index), updated, ...model.cyberEvents.slice(index + 1)], updatedAt: Date.now() };
  }

  static getOpenCyberEvents(model: IctModel, severity?: CyberEvent['severity']): CyberEvent[] {
    return model.cyberEvents.filter(e => e.response !== 'resolved' && (!severity || e.severity === severity));
  }

  static getSecurityPosture(model: IctModel): { openCritical: number; openHigh: number; resolved: number; total: number } {
    const all = model.cyberEvents;
    return {
      openCritical: all.filter(e => e.response !== 'resolved' && e.severity === 'critical').length,
      openHigh: all.filter(e => e.response !== 'resolved' && e.severity === 'high').length,
      resolved: all.filter(e => e.response === 'resolved').length,
      total: all.length,
    };
  }

  // ── Support Engine ───────────────────────────────────────────────────────────

  static openTicket(model: IctModel, actorId: AmxUid | undefined, input: Omit<SupportTicket, 'id' | 'status' | 'openedAt' | 'kbArticleIds'>): { model: IctModel; ticket: SupportTicket } {
    const ticket: SupportTicket = { ...input, id: nextId('tkt'), status: 'open', openedAt: Date.now(), kbArticleIds: [] };
    return {
      model: { ...IctEngine.audit(model, actorId, 'ticket_opened', input.subject), tickets: [...model.tickets, ticket], updatedAt: Date.now() },
      ticket,
    };
  }

  static assignTicket(model: IctModel, ticketId: string, assignedTo: AmxUid): IctModel {
    const index = model.tickets.findIndex(t => t.id === ticketId);
    if (index === -1) throw new Error(`[IctEngine] Ticket "${ticketId}" does not exist`);
    const updated = { ...model.tickets[index], assignedTo, status: 'assigned' as const };
    return { ...model, tickets: [...model.tickets.slice(0, index), updated, ...model.tickets.slice(index + 1)], updatedAt: Date.now() };
  }

  static resolveTicket(model: IctModel, ticketId: string, resolution: string): IctModel {
    const index = model.tickets.findIndex(t => t.id === ticketId);
    if (index === -1) throw new Error(`[IctEngine] Ticket "${ticketId}" does not exist`);
    const updated = { ...model.tickets[index], resolution, status: 'resolved' as const, resolvedAt: Date.now() };
    return { ...model, tickets: [...model.tickets.slice(0, index), updated, ...model.tickets.slice(index + 1)], updatedAt: Date.now() };
  }

  static closeTicket(model: IctModel, ticketId: string, satisfactionScore?: number): IctModel {
    const index = model.tickets.findIndex(t => t.id === ticketId);
    if (index === -1) throw new Error(`[IctEngine] Ticket "${ticketId}" does not exist`);
    const updated = { ...model.tickets[index], status: 'closed' as const, satisfactionScore };
    return { ...model, tickets: [...model.tickets.slice(0, index), updated, ...model.tickets.slice(index + 1)], updatedAt: Date.now() };
  }

  static getOpenTickets(model: IctModel): SupportTicket[] {
    return model.tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved');
  }

  // ── Knowledge base ───────────────────────────────────────────────────────────

  static publishArticle(model: IctModel, actorId: AmxUid | undefined, input: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>): { model: IctModel; article: KnowledgeArticle } {
    const now = Date.now();
    const article: KnowledgeArticle = { ...input, id: nextId('kb'), createdAt: now, updatedAt: now };
    return {
      model: { ...IctEngine.audit(model, actorId, 'knowledge_article_published', input.title), knowledgeBase: [...model.knowledgeBase, article], updatedAt: now },
      article,
    };
  }

  static linkTicketArticle(model: IctModel, ticketId: string, articleId: string): IctModel {
    const index = model.tickets.findIndex(t => t.id === ticketId);
    if (index === -1) throw new Error(`[IctEngine] Ticket "${ticketId}" does not exist`);
    const updated = { ...model.tickets[index], kbArticleIds: [...model.tickets[index].kbArticleIds, articleId] };
    return { ...model, tickets: [...model.tickets.slice(0, index), updated, ...model.tickets.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Business continuity ──────────────────────────────────────────────────────

  static createContinuityPlan(model: IctModel, actorId: AmxUid | undefined, input: Omit<ContinuityPlan, 'id' | 'status'>): { model: IctModel; plan: ContinuityPlan } {
    IctEngine.guard(model, actorId ?? model.chiefInformationOfficerId ?? ('' as AmxUid), 'respond_to_incidents');
    const plan: ContinuityPlan = { ...input, id: nextId('bcm'), status: 'draft' };
    return {
      model: { ...IctEngine.audit(model, actorId, 'continuity_plan_created', input.scenario), continuityPlans: [...model.continuityPlans, plan], updatedAt: Date.now() },
      plan,
    };
  }

  static testContinuityPlan(model: IctModel, planId: string, passed: boolean): IctModel {
    const index = model.continuityPlans.findIndex(p => p.id === planId);
    if (index === -1) throw new Error(`[IctEngine] Continuity plan "${planId}" does not exist`);
    const updated = { ...model.continuityPlans[index], testedAt: Date.now(), lastTestOutcome: passed ? ('passed' as const) : ('failed' as const), status: 'active' as const };
    return { ...model, continuityPlans: [...model.continuityPlans.slice(0, index), updated, ...model.continuityPlans.slice(index + 1)], updatedAt: Date.now() };
  }

  // ── Read conveniences / dashboard ────────────────────────────────────────────

  static getDashboardSummary(model: IctModel): {
    devicesOnline: number;
    devicesOffline: number;
    degradedInfrastructure: number;
    activeIntegrations: number;
    openCyberEvents: number;
    openTickets: number;
    securityPosture: { openCritical: number; openHigh: number; resolved: number; total: number };
  } {
    return {
      devicesOnline: model.devices.filter(d => d.status === 'online').length,
      devicesOffline: IctEngine.getOfflineDevices(model).length,
      degradedInfrastructure: IctEngine.getDegradedInfrastructure(model).length,
      activeIntegrations: IctEngine.getActiveIntegrations(model).length,
      openCyberEvents: IctEngine.getOpenCyberEvents(model).length,
      openTickets: IctEngine.getOpenTickets(model).length,
      securityPosture: IctEngine.getSecurityPosture(model),
    };
  }
}

export default IctEngine;
