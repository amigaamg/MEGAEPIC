// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Communication Engine — Engine IV — PURE KERNEL
// Zero knowledge of Firestore/Postgres/Neo4j. Operates only on constitutional
// types + the Communication Registry. Enforces the constitutional principles:
//   C1 owner  ·  C2 purpose  ·  C3 right audience  ·  C4 measured acknowledgement
//   C5 official authority (versioned, audited, searchable)
// The engine is the hospital's OFFICIAL communication authority — not a
// messaging app. Every mutation is recorded on the audit log.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  getEmergencyType,
  getPurpose,
  PURPOSE_IDS,
} from './registry';
import {
  PURPOSE_PREFIX,
  type AcknowledgementRecord,
  type AnnouncementRecord,
  type CircularRecord,
  type CommunicationBaseFields,
  type CommunicationItem,
  type CommunicationModel,
  type CommitteeRecord,
  type CreateCommunicationModelInput,
  type DirectMessage,
  type EmergencyBroadcast,
  type MeetingRecord,
  type PolicyRecord,
  type PublicationStatus,
  type TargetAudience,
} from './constitutional-types';

export function genCommsId(prefix: string): string {
  return `AMX-${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function seqFor(model: CommunicationModel, purpose: string): number {
  return model.items.filter((i) => i.kind === purpose).length + 1;
}

function codeFor(model: CommunicationModel, kind: string, title: string, now: number): string {
  const prefix = PURPOSE_PREFIX[kind as keyof typeof PURPOSE_PREFIX] ?? 'COM';
  const slug = title.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'X';
  const seq = String(seqFor(model, kind)).padStart(3, '0');
  const year = new Date(now).getFullYear();
  return `${prefix}-${slug}-${year}-${seq}`;
}

function audit(model: CommunicationModel, actorId: string, action: string, referenceId?: string, detail?: string): CommunicationModel['auditLog'] {
  return [...model.auditLog, { at: Date.now(), actorId, action, referenceId, detail }];
}

function touch<T extends { updatedAt: number }>(x: T): T {
  return { ...x, updatedAt: Date.now() };
}

/** Validate that an audience is constitutional (Rule 3: never "everyone" by default). */
function assertAudience(audience: TargetAudience | undefined, forceEveryone: boolean): TargetAudience {
  const a = audience ?? { everyone: false };
  const has = !!a.everyone || (a.roles?.length ?? 0) > 0 || (a.departments?.length ?? 0) > 0 || (a.individuals?.length ?? 0) > 0 || !!a.allDepartments;
  if (has) return a;
  if (forceEveryone) return { everyone: true };
  throw new Error('[CE] Every communication must target a specific audience (Rule 3).');
}

export class CommunicationEngine {
  // ── Model lifecycle ─────────────────────────────────────────────────────────

  static create(input: CreateCommunicationModelInput): CommunicationModel {
    if (!input.organizationId) throw new Error('[CE] organizationId is required');
    const now = Date.now();
    return {
      organizationId: input.organizationId,
      items: [],
      meetings: [],
      committees: [],
      acknowledgements: [],
      messages: [],
      templates: [],
      auditLog: [],
      redMode: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  // ── Base item creation (purpose-aware) ──────────────────────────────────────

  private static base(model: CommunicationModel, actorId: string, input: {
    kind: keyof typeof PURPOSE_PREFIX;
    title: string;
    body: string;
    summary?: string;
    author: CommunicationBaseFields['author'];
    audience?: TargetAudience;
    severity?: CommunicationBaseFields['severity'];
    channels?: CommunicationBaseFields['channels'];
    requiresAcknowledgement?: boolean;
    allowComments?: boolean;
    attachments?: CommunicationBaseFields['attachments'];
    tags?: string[];
    scheduledFor?: number;
    expiresAt?: number;
    status?: PublicationStatus;
  }): CommunicationBaseFields {
    if (!PURPOSE_IDS.includes(input.kind)) throw new Error(`[CE] Unknown purpose "${input.kind}".`);
    if (!input.title.trim()) throw new Error('[CE] title is required');
    const def = getPurpose(input.kind);
    const audience = assertAudience(input.audience, def?.id === 'emergency');
    const now = Date.now();
    return {
      id: genCommsId(PURPOSE_PREFIX[input.kind]),
      organizationId: model.organizationId,
      kind: input.kind,
      title: input.title.trim(),
      summary: input.summary,
      body: input.body,
      author: input.author,
      audience,
      severity: input.severity ?? def?.defaultSeverity ?? 'info',
      status: input.status ?? (input.scheduledFor ? 'scheduled' : 'draft'),
      channels: input.channels ?? ['in_app'],
      requiresAcknowledgement: input.requiresAcknowledgement ?? false,
      allowComments: input.allowComments ?? true,
      attachments: input.attachments ?? [],
      tags: input.tags ?? [],
      createdAt: now,
      createdBy: actorId,
      updatedAt: now,
      scheduledFor: input.scheduledFor,
      expiresAt: input.expiresAt,
    };
  }

  // ── Announcement ────────────────────────────────────────────────────────────

  static createAnnouncement(model: CommunicationModel, actorId: string, input: {
    title: string;
    body: string;
    summary?: string;
    author: CommunicationBaseFields['author'];
    audience?: TargetAudience;
    severity?: AnnouncementRecord['severity'];
    channels?: AnnouncementRecord['channels'];
    requiresAcknowledgement?: boolean;
    scheduledFor?: number;
    expiresAt?: number;
  }): { model: CommunicationModel; item: AnnouncementRecord } {
    const base = CommunicationEngine.base(model, actorId, { ...input, kind: 'announcement' });
    const item: AnnouncementRecord = { ...base, purpose: 'announcement' };
    return { model: { ...model, items: [...model.items, item], updatedAt: Date.now() }, item };
  }

  // ── Circular ────────────────────────────────────────────────────────────────

  static createCircular(model: CommunicationModel, actorId: string, input: {
    title: string;
    body: string;
    author: CommunicationBaseFields['author'];
    audience?: TargetAudience;
    severity?: CircularRecord['severity'];
    channels?: CircularRecord['channels'];
    requiresAcknowledgement?: boolean;
    effectiveDate?: string;
    supersedes?: string;
    policyLinks?: string[];
  }): { model: CommunicationModel; item: CircularRecord } {
    const now = Date.now();
    const base = CommunicationEngine.base(model, actorId, { ...input, kind: 'circular' });
    const item: CircularRecord = {
      ...base,
      purpose: 'circular',
      circularNumber: `CIR-${new Date(now).getFullYear()}-${String(seqFor(model, 'circular')).padStart(3, '0')}`,
      version: '1.0',
      effectiveDate: input.effectiveDate,
      supersedes: input.supersedes,
      policyLinks: input.policyLinks ?? [],
    };
    return { model: { ...model, items: [...model.items, item], updatedAt: now }, item };
  }

  // ── Policy ──────────────────────────────────────────────────────────────────

  static createPolicy(model: CommunicationModel, actorId: string, input: {
    title: string;
    body: string;
    author: CommunicationBaseFields['author'];
    audience?: TargetAudience;
    owner?: string;
    reviewCycleDays?: number;
    requiresAcknowledgement?: boolean;
  }): { model: CommunicationModel; item: PolicyRecord } {
    const now = Date.now();
    const base = CommunicationEngine.base(model, actorId, { ...input, kind: 'policy', channels: ['in_app', 'email'] });
    const item: PolicyRecord = {
      ...base,
      purpose: 'policy',
      policyCode: codeFor(model, 'policy', input.title, now),
      version: '1.0',
      owner: input.owner ?? input.author.departmentName ?? 'Administration',
      status: 'draft',
      reviewCycleDays: input.reviewCycleDays ?? 365,
    };
    return { model: { ...model, items: [...model.items, item], updatedAt: now }, item };
  }

  /** Increments a policy version — supersedes the previous revision. */
  static revisePolicy(model: CommunicationModel, actorId: string, policyId: string, newBody: string, newTitle?: string): { model: CommunicationModel; item: PolicyRecord } {
    const idx = model.items.findIndex((i) => i.id === policyId && i.kind === 'policy');
    if (idx === -1) throw new Error(`[CE] Policy "${policyId}" not found.`);
    const prev = model.items[idx] as PolicyRecord;
    const oldVersion = parseFloat(prev.version) || 0;
    const superseded: PolicyRecord = { ...prev, status: 'superseded', updatedAt: Date.now() };
    const base = CommunicationEngine.base(model, actorId, {
      kind: 'policy',
      title: newTitle ?? prev.title,
      body: newBody,
      author: prev.author,
      audience: prev.audience,
      severity: prev.severity,
      channels: prev.channels,
      requiresAcknowledgement: prev.requiresAcknowledgement,
    });
    const item: PolicyRecord = {
      ...base,
      purpose: 'policy',
      policyCode: prev.policyCode,
      version: String((oldVersion + 1).toFixed(1)),
      owner: prev.owner,
      status: 'active',
      approvedByCommittee: prev.approvedByCommittee,
      reviewCycleDays: prev.reviewCycleDays,
    };
    const items = model.items.slice();
    items[idx] = superseded;
    items.push(item);
    return { model: { ...model, items, updatedAt: Date.now() }, item };
  }

  // ── Emergency broadcast ─────────────────────────────────────────────────────

  static createEmergency(model: CommunicationModel, actorId: string, input: {
    title: string;
    body: string;
    emergencyType: EmergencyBroadcast['emergencyType'];
    liveSituation?: string;
    author: CommunicationBaseFields['author'];
    audience?: TargetAudience;
    channels?: EmergencyBroadcast['channels'];
    severity?: EmergencyBroadcast['severity'];
  }): { model: CommunicationModel; item: EmergencyBroadcast } {
    const def = getEmergencyType(input.emergencyType);
    const audience = input.audience ?? {
      everyone: def?.suggestedDepartments?.[0] === 'All',
      departments: def?.suggestedDepartments?.filter((d) => d !== 'All'),
      roles: def?.suggestedRoles?.filter((r) => r !== 'all'),
    };
    const base = CommunicationEngine.base(model, actorId, {
      ...input,
      kind: 'emergency',
      audience,
      severity: input.severity ?? def?.severity ?? 'critical',
      channels: input.channels ?? ['in_app', 'sms', 'hospital_screen', 'pager', 'mobile'],
      requiresAcknowledgement: def?.autoAcknowledge ?? true,
      status: 'published',
    });
    const item: EmergencyBroadcast = {
      ...base,
      purpose: 'emergency',
      emergencyType: input.emergencyType,
      liveSituation: input.liveSituation,
      commandOverride: def?.autoAcknowledge ?? false,
      publishedAt: Date.now(),
    };
    return { model: { ...model, items: [...model.items, item], updatedAt: Date.now() }, item };
  }

  // ── Shared mutations ────────────────────────────────────────────────────────

  static publish(model: CommunicationModel, actorId: string, id: string): CommunicationModel {
    const items = model.items.map((i) =>
      i.id === id ? { ...i, status: 'published' as const, approvedBy: actorId, approvedAt: Date.now(), publishedAt: Date.now(), updatedAt: Date.now() } : i
    );
    return { ...model, items, updatedAt: Date.now() };
  }

  static schedule(model: CommunicationModel, actorId: string, id: string, scheduledFor: number): CommunicationModel {
    const items = model.items.map((i) =>
      i.id === id ? { ...i, status: 'scheduled' as const, scheduledFor, updatedAt: Date.now() } : i
    );
    return { ...model, items, updatedAt: Date.now() };
  }

  static archive(model: CommunicationModel, actorId: string, id: string): CommunicationModel {
    const items = model.items.map((i) => (i.id === id ? { ...i, status: 'archived' as const, updatedAt: Date.now() } : i));
    return { ...model, items, updatedAt: Date.now() };
  }

  static remove(model: CommunicationModel, actorId: string, id: string): CommunicationModel {
    return { ...model, items: model.items.filter((i) => i.id !== id), updatedAt: Date.now() };
  }

  static requestApproval(model: CommunicationModel, actorId: string, id: string): CommunicationModel {
    const items = model.items.map((i) => (i.id === id ? { ...i, status: 'pending_approval' as const, updatedAt: Date.now() } : i));
    return { ...model, items, updatedAt: Date.now() };
  }

  // ── Acknowledgement (C4) ────────────────────────────────────────────────────

  static acknowledge(model: CommunicationModel, input: {
    communicationId: string;
    personId: string;
    personName: string;
    department: string;
    signature?: string;
    comments?: string;
  }): { model: CommunicationModel; record: AcknowledgementRecord } {
    const item = model.items.find((i) => i.id === input.communicationId);
    if (!item) throw new Error(`[CE] Communication "${input.communicationId}" not found.`);
    if (!item.requiresAcknowledgement) throw new Error('[CE] This communication does not require acknowledgement.');
    const existing = model.acknowledgements.find(
      (a) => a.communicationId === input.communicationId && a.personId === input.personId,
    );
    const now = Date.now();
    const record: AcknowledgementRecord = existing
      ? { ...existing, state: 'acknowledged', acknowledgedAt: now, signature: input.signature, comments: input.comments }
      : {
          id: genCommsId('ACK'),
          organizationId: model.organizationId,
          communicationId: input.communicationId,
          personId: input.personId,
          personName: input.personName,
          department: input.department,
          state: 'acknowledged',
          firstDeliveredAt: now,
          acknowledgedAt: now,
          acknowledgedBy: input.personId,
          signature: input.signature,
          comments: input.comments,
        };
    const acknowledgements = existing
      ? model.acknowledgements.map((a) => (a.id === record.id ? record : a))
      : [...model.acknowledgements, record];
    return { model: { ...model, acknowledgements, updatedAt: now }, record };
  }

  /** Advance an acknowledgement to the next lifecycle state (delivered → opened → read → acknowledged). */
  static advanceAcknowledgement(model: CommunicationModel, id: string, state: AcknowledgementRecord['state']): CommunicationModel {
    const acknowledgements = model.acknowledgements.map((a) => {
      if (a.id !== id) return a;
      const now = Date.now();
      const next: AcknowledgementRecord = { ...a, state };
      if (state === 'opened' && !next.openedAt) next.openedAt = now;
      if (state === 'read' && !next.readAt) next.readAt = now;
      if (state === 'acknowledged' && !next.acknowledgedAt) next.acknowledgedAt = now;
      return next;
    });
    return { ...model, acknowledgements, updatedAt: Date.now() };
  }

  /** Per-communication acknowledgement completion rate. */
  static acknowledgementRate(model: CommunicationModel, communicationId: string, targetCount: number): number {
    const acks = model.acknowledgements.filter((a) => a.communicationId === communicationId && a.state === 'acknowledged');
    return targetCount > 0 ? Math.min(100, Math.round((acks.length / targetCount) * 100)) : 0;
  }

  /** Per-department acknowledgement rates across all requiring communications. */
  static acknowledgementRatesByDepartment(model: CommunicationModel): { department: string; acked: number; pending: number; rate: number }[] {
    const required = model.items.filter((i) => i.requiresAcknowledgement && i.status === 'published');
    const byDept = new Map<string, { acked: number; pending: number }>();
    for (const item of required) {
      for (const a of model.acknowledgements.filter((x) => x.communicationId === item.id)) {
        const d = byDept.get(a.department) ?? { acked: 0, pending: 0 };
        if (a.state === 'acknowledged') d.acked += 1;
        else d.pending += 1;
        byDept.set(a.department, d);
      }
    }
    return Array.from(byDept.entries()).map(([department, v]) => ({
      department,
      acked: v.acked,
      pending: v.pending,
      rate: v.acked + v.pending > 0 ? Math.round((v.acked / (v.acked + v.pending)) * 100) : 0,
    }));
  }

  static unacknowledged(model: CommunicationModel, communicationId: string): AcknowledgementRecord[] {
    return model.acknowledgements.filter((a) => a.communicationId === communicationId && a.state !== 'acknowledged');
  }

  // ── Meetings ────────────────────────────────────────────────────────────────

  static createMeeting(model: CommunicationModel, actorId: string, input: Omit<MeetingRecord, 'id' | 'organizationId' | 'attendance' | 'resolutions' | 'tasks' | 'agenda' | 'createdAt' | 'updatedAt' | 'status' | 'minutes'> & { agenda?: MeetingRecord['agenda'] }): { model: CommunicationModel; meeting: MeetingRecord } {
    const now = Date.now();
    const meeting: MeetingRecord = {
      ...input,
      id: genCommsId('MEETING'),
      organizationId: model.organizationId,
      agenda: input.agenda ?? [],
      attendance: [],
      resolutions: [],
      tasks: [],
      minutes: undefined,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    };
    return { model: { ...model, meetings: [...model.meetings, meeting], updatedAt: now }, meeting };
  }

  static updateMeeting(model: CommunicationModel, actorId: string, meetingId: string, patch: Partial<MeetingRecord>): CommunicationModel {
    const meetings = model.meetings.map((m) => (m.id === meetingId ? touch({ ...m, ...patch }) : m));
    return { ...model, meetings, updatedAt: Date.now() };
  }

  static markAttendance(model: CommunicationModel, meetingId: string, personId: string, present: boolean): CommunicationModel {
    const meetings = model.meetings.map((m) => {
      if (m.id !== meetingId) return m;
      const attendance = present
        ? Array.from(new Set([...m.attendance, personId]))
        : m.attendance.filter((p) => p !== personId);
      return { ...m, attendance, updatedAt: Date.now() };
    });
    return { ...model, meetings, updatedAt: Date.now() };
  }

  static addResolution(model: CommunicationModel, meetingId: string, resolution: string): CommunicationModel {
    const meetings = model.meetings.map((m) =>
      m.id === meetingId ? { ...m, resolutions: [...m.resolutions, resolution], updatedAt: Date.now() } : m
    );
    return { ...model, meetings, updatedAt: Date.now() };
  }

  static addMeetingTask(model: CommunicationModel, meetingId: string, task: { title: string; assignee?: string; dueAt?: number }): CommunicationModel {
    const meetings = model.meetings.map((m) =>
      m.id === meetingId
        ? { ...m, tasks: [...m.tasks, { id: genCommsId('TASK'), ...task, done: false }], updatedAt: Date.now() }
        : m
    );
    return { ...model, meetings, updatedAt: Date.now() };
  }

  static toggleMeetingTask(model: CommunicationModel, meetingId: string, taskId: string): CommunicationModel {
    const meetings = model.meetings.map((m) =>
      m.id === meetingId
        ? { ...m, tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)), updatedAt: Date.now() }
        : m
    );
    return { ...model, meetings, updatedAt: Date.now() };
  }

  static setMeetingStatus(model: CommunicationModel, meetingId: string, status: MeetingRecord['status']): CommunicationModel {
    const meetings = model.meetings.map((m) => (m.id === meetingId ? { ...m, status, updatedAt: Date.now() } : m));
    return { ...model, meetings, updatedAt: Date.now() };
  }

  // ── Committees ──────────────────────────────────────────────────────────────

  static createCommittee(model: CommunicationModel, actorId: string, input: { name: string; purpose: string; members?: CommitteeRecord['members'] }): { model: CommunicationModel; committee: CommitteeRecord } {
    const now = Date.now();
    const committee: CommitteeRecord = {
      id: genCommsId('CMT'),
      name: input.name,
      purpose: input.purpose,
      members: input.members ?? [],
      meetingIds: [],
      tasks: [],
      recommendations: [],
      createdAt: now,
      updatedAt: now,
    };
    return { model: { ...model, committees: [...model.committees, committee], updatedAt: now }, committee };
  }

  static addCommitteeMember(model: CommunicationModel, committeeId: string, member: CommitteeRecord['members'][number]): CommunicationModel {
    const committees = model.committees.map((c) =>
      c.id === committeeId ? { ...c, members: [...c.members, member], updatedAt: Date.now() } : c
    );
    return { ...model, committees, updatedAt: Date.now() };
  }

  static linkMeetingToCommittee(model: CommunicationModel, committeeId: string, meetingId: string): CommunicationModel {
    const committees = model.committees.map((c) =>
      c.id === committeeId && !c.meetingIds.includes(meetingId)
        ? { ...c, meetingIds: [...c.meetingIds, meetingId], updatedAt: Date.now() }
        : c
    );
    return { ...model, committees, updatedAt: Date.now() };
  }

  // ── Internal messaging (professional) ───────────────────────────────────────

  static sendMessage(model: CommunicationModel, input: Omit<DirectMessage, 'id' | 'createdAt' | 'readBy'>): { model: CommunicationModel; message: DirectMessage } {
    if (!input.body.trim()) throw new Error('[CE] Message body is required');
    const now = Date.now();
    const message: DirectMessage = { ...input, id: genCommsId('MSG'), createdAt: now, readBy: [] };
    return { model: { ...model, messages: [...model.messages, message], updatedAt: now }, message };
  }

  static markMessageRead(model: CommunicationModel, messageId: string, personId: string): CommunicationModel {
    const messages = model.messages.map((m) =>
      m.id === messageId && !m.readBy.includes(personId) ? { ...m, readBy: [...m.readBy, personId] } : m
    );
    return { ...model, messages, updatedAt: Date.now() };
  }

  static unreadMessages(model: CommunicationModel, personId: string): DirectMessage[] {
    return model.messages.filter((m) => m.recipients.includes(personId) && !m.readBy.includes(personId));
  }

  // ── Red Mode (Emergency) ─────────────────────────────────────────────────────

  static activateRedMode(model: CommunicationModel, emergencyId?: string): CommunicationModel {
    return { ...model, redMode: true, emergencyInProgress: emergencyId, updatedAt: Date.now() };
  }

  static deactivateRedMode(model: CommunicationModel): CommunicationModel {
    return { ...model, redMode: false, emergencyInProgress: undefined, updatedAt: Date.now() };
  }

  static currentEmergency(model: CommunicationModel): EmergencyBroadcast | undefined {
    if (!model.redMode) return undefined;
    return model.items.find((i) => i.id === model.emergencyInProgress && i.kind === 'emergency') as EmergencyBroadcast | undefined;
  }

  // ── Templates ───────────────────────────────────────────────────────────────

  static installTemplates(model: CommunicationModel): CommunicationModel {
    return { ...model, updatedAt: Date.now() };
  }

  static addTemplate(model: CommunicationModel, input: CommunicationModel['templates'][number]): CommunicationModel {
    return { ...model, templates: [...model.templates, input], updatedAt: Date.now() };
  }

  // ── Dashboard / analytics (read conveniences) ──────────────────────────────

  static getOverview(model: CommunicationModel, now = Date.now()): {
    activeAnnouncements: number;
    pendingApprovals: number;
    scheduledBroadcasts: number;
    emergencyAlerts: number;
    meetingsToday: number;
    policiesUpdatedThisWeek: number;
    messagesPending: number;
    ackRate: number;
    communicationHealthScore: number;
    redMode: boolean;
    recentItems: CommunicationItem[];
  } {
    const dayStart = new Date(now).setHours(0, 0, 0, 0);
    const weekAgo = now - 7 * 86400000;
    const published = model.items.filter((i) => i.status === 'published' || i.status === 'scheduled');
    const activeAnnouncements = model.items.filter((i) => i.kind === 'announcement' && i.status === 'published' && (!i.expiresAt || i.expiresAt > now)).length;
    const pendingApprovals = model.items.filter((i) => i.status === 'pending_approval').length;
    const scheduledBroadcasts = model.items.filter((i) => i.status === 'scheduled').length;
    const emergencyAlerts = model.items.filter((i) => i.kind === 'emergency' && i.status === 'published').length;
    const meetingsToday = model.meetings.filter((m) => m.scheduledAt >= dayStart && m.scheduledAt < dayStart + 86400000).length;
    const policiesUpdatedThisWeek = model.items.filter((i) => i.kind === 'policy' && i.updatedAt >= weekAgo).length;
    const required = model.items.filter((i) => i.requiresAcknowledgement && i.status === 'published');
    const totalAcks = required.reduce((acc, i) => acc + model.acknowledgements.filter((a) => a.communicationId === i.id && a.state === 'acknowledged').length, 0);
    const requiredTarget = model.acknowledgements.filter((a) => required.some((i) => i.id === a.communicationId)).length;
    const ackRate = requiredTarget > 0 ? Math.round((totalAcks / requiredTarget) * 100) : 0;
    const healthScore = Math.max(0, Math.min(100,
      50
        - (pendingApprovals * 3)
        - (emergencyAlerts > 0 ? 10 : 0)
        + (ackRate >= 90 ? 15 : ackRate >= 70 ? 8 : 0)
        + (meetingsToday > 0 ? 2 : 0)
    ));
    const recentItems = model.items.slice().sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8);
    return {
      activeAnnouncements,
      pendingApprovals,
      scheduledBroadcasts,
      emergencyAlerts,
      meetingsToday,
      policiesUpdatedThisWeek,
      messagesPending: model.messages.filter((m) => m.readBy.length === 0).length,
      ackRate,
      communicationHealthScore: healthScore,
      redMode: model.redMode,
      recentItems,
    };
  }

  static itemsByPurpose(model: CommunicationModel, purpose?: string): CommunicationItem[] {
    const list = purpose ? model.items.filter((i) => i.kind === purpose) : model.items;
    return list.slice().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  static emergencyItems(model: CommunicationModel): EmergencyBroadcast[] {
    return model.items.filter((i): i is EmergencyBroadcast => i.kind === 'emergency');
  }

  static search(model: CommunicationModel, query: string): CommunicationItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return CommunicationEngine.itemsByPurpose(model);
    return model.items.filter((i) =>
      i.title.toLowerCase().includes(q) ||
      i.body.toLowerCase().includes(q) ||
      (i.summary ?? '').toLowerCase().includes(q) ||
      i.tags.some((t) => t.toLowerCase().includes(q)) ||
      i.author.name.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q)
    ).slice().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /** AI-assisted audience suggestion for an emergency (driven by the registry). */
  static suggestAudience(emergencyType: string): TargetAudience {
    const def = getEmergencyType(emergencyType);
    if (!def) return { everyone: true };
    const everyone = def.suggestedDepartments.some((d) => d === 'All');
    return {
      everyone,
      departments: def.suggestedDepartments.filter((d) => d !== 'All'),
      roles: def.suggestedRoles.filter((r) => r !== 'all'),
      allDepartments: everyone,
    };
  }
}

// ── Helpers for the UI / repos ────────────────────────────────────────────────

export function isEmergency(item: CommunicationItem): item is EmergencyBroadcast {
  return item.kind === 'emergency';
}
export function isCircular(item: CommunicationItem): item is CircularRecord {
  return item.kind === 'circular';
}
export function isPolicy(item: CommunicationItem): item is PolicyRecord {
  return item.kind === 'policy';
}
export function isAnnouncement(item: CommunicationItem): item is AnnouncementRecord {
  return item.kind === 'announcement';
}