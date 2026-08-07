import { describe, it, expect } from 'vitest';
import { CommunicationEngine } from '../CommunicationEngine';
import { EMERGENCY_TYPES, PURPOSE_DEFINITIONS } from '../registry';
import type { AnnouncementRecord, CommunicationModel } from '../constitutional-types';

const author = { uid: 'AMX-PER-ADMIN-1', name: 'Facility Admin', role: 'facility_administrator', departmentName: 'Administration' };

function fresh(): CommunicationModel {
  return CommunicationEngine.create({ organizationId: 'org-kenyatta' });
}

function announce(model: CommunicationModel, title = 'Hospital Anniversary') {
  return CommunicationEngine.createAnnouncement(model, 'AMX-PER-ADMIN-1', {
    title,
    body: 'Celebrating 25 years of service.',
    author,
    audience: { everyone: true },
    requiresAcknowledgement: false,
  });
}

describe('CommunicationEngine — C1 · Owner & Purpose', () => {
  it('every purpose in the registry is a valid constitutional purpose', () => {
    expect(PURPOSE_DEFINITIONS.length).toBeGreaterThanOrEqual(12);
    expect(EMERGENCY_TYPES.length).toBeGreaterThanOrEqual(13);
  });

  it('rejects an unknown purpose', () => {
    const model = fresh();
    expect(() =>
      (CommunicationEngine as any).base(model, 'actor', {
        kind: 'meme', title: 'x', body: 'y', author,
      })
    ).toThrow(/Unknown purpose/);
  });

  it('records the author and purpose on every item', () => {
    const model = fresh();
    const { item } = announce(model);
    expect(item.kind).toBe('announcement');
    expect(item.createdBy).toBe('AMX-PER-ADMIN-1');
    expect(item.author.name).toBe('Facility Admin');
  });
});

describe('CommunicationEngine — C3 · Right Audience', () => {
  it('rejects a communication with no audience (never everyone by default)', () => {
    const model = fresh();
    expect(() =>
      CommunicationEngine.createAnnouncement(model, 'actor', {
        title: 'No Audience', body: 'x', author,
      })
    ).toThrow(/target a specific audience/);
  });

  it('explicit everyone is allowed', () => {
    const model = fresh();
    const { item } = announce(model);
    expect(item.audience.everyone).toBe(true);
  });

  it('emergency broadcasts get a registry-driven audience suggestion', () => {
    const model = fresh();
    const { item } = CommunicationEngine.createEmergency(model, 'actor', {
      title: 'Oxygen Failure', body: 'Bulk tank low.', emergencyType: 'oxygen_failure', author,
    });
    expect(item.audience.departments).toContain('ICU');
    expect(item.audience.departments).toContain('HDU');
    expect(item.status).toBe('published');
    expect(item.requiresAcknowledgement).toBe(true);
  });
});

describe('CommunicationEngine — announcements, circulars, policies', () => {
  it('creates a circular with a permanent number and version', () => {
    const model = fresh();
    const { item } = CommunicationEngine.createCircular(model, 'actor', {
      title: 'Leave Procedure', body: '…', author, audience: { everyone: true },
    });
    expect(item.circularNumber).toMatch(/^CIR-\d{4}-\d{3}$/);
    expect(item.version).toBe('1.0');
    expect(item.purpose).toBe('circular');
  });

  it('creates and revises a policy — old revision is superseded', () => {
    let model = fresh();
    const first = CommunicationEngine.createPolicy(model, 'actor', { title: 'Consent Policy', body: 'v1', author, audience: { everyone: true } });
    model = first.model;
    const second = CommunicationEngine.revisePolicy(model, 'actor', first.item.id, 'v2 body');
    model = second.model;
    const old = model.items.find((i) => i.id === first.item.id) as any;
    const newest = model.items.find((i) => i.id === second.item.id) as any;
    expect(old.status).toBe('superseded');
    expect(newest.version).toBe('2.0');
    expect(newest.policyCode).toBe(old.policyCode);
  });

  it('moves through draft → pending_approval → published lifecycle', () => {
    let model = fresh();
    let created = announce(model);
    model = created.model;
    let item = created.item;
    model = CommunicationEngine.requestApproval(model, 'actor', item.id);
    model = CommunicationEngine.publish(model, 'actor', item.id);
    item = model.items.find((i) => i.id === item.id) as AnnouncementRecord;
    expect(item.status).toBe('published');
    expect(item.approvedBy).toBe('actor');
  });
});

describe('CommunicationEngine — C4 · Acknowledgement measured', () => {
  it('records acknowledgement only when required', () => {
    let model = fresh();
    const created = CommunicationEngine.createCircular(model, 'actor', {
      title: 'New Infection Policy', body: '…', author, audience: { everyone: true }, requiresAcknowledgement: true,
    });
    model = created.model;
    model = CommunicationEngine.publish(model, 'actor', created.item.id);
    const res = CommunicationEngine.acknowledge(model, {
      communicationId: created.item.id, personId: 'P1', personName: 'Dr A', department: 'Medicine', signature: 'sig',
    });
    model = res.model;
    expect(res.record.state).toBe('acknowledged');
    expect(CommunicationEngine.acknowledgementRate(model, created.item.id, 10)).toBe(10);
    expect(CommunicationEngine.acknowledgementRate(model, created.item.id, 0)).toBe(0);
  });

  it('rejects acknowledgement when not required', () => {
    const created = announce(fresh());
    expect(() => CommunicationEngine.acknowledge(created.model, { communicationId: created.item.id, personId: 'P1', personName: 'x', department: 'y' })).toThrow(/does not require/);
  });

  it('computes per-department acknowledgement rates', () => {
    let model = fresh();
    const created = CommunicationEngine.createCircular(model, 'actor', {
      title: 'Roster Policy', body: '…', author, audience: { everyone: true }, requiresAcknowledgement: true,
    });
    model = created.model;
    model = CommunicationEngine.publish(model, 'actor', created.item.id);
    model = CommunicationEngine.acknowledge(model, { communicationId: created.item.id, personId: 'P1', personName: 'Dr A', department: 'Medicine' }).model;
    model = CommunicationEngine.acknowledge(model, { communicationId: created.item.id, personId: 'P2', personName: 'Nurse B', department: 'Medicine' }).model;
    model = CommunicationEngine.acknowledge(model, { communicationId: created.item.id, personId: 'P3', personName: 'Dr C', department: 'ICU' }).model;
    const rates = CommunicationEngine.acknowledgementRatesByDepartment(model);
    const medicine = rates.find((r) => r.department === 'Medicine');
    expect(medicine?.acked).toBe(2);
    expect(medicine?.rate).toBe(100);
  });
});

describe('CommunicationEngine — Meetings, Committees, Messaging, Red Mode', () => {
  it('creates a meeting with agenda, attendance, resolutions and tasks', () => {
    let model = fresh();
    const created = CommunicationEngine.createMeeting(model, 'actor', {
      title: 'Mortality Review',
      kind: 'mortality',
      organizer: author,
      scheduledAt: Date.now() + 86400000,
      durationMinutes: 60,
      participants: ['P1', 'P2'],
      agenda: [{ id: 'a1', title: 'Case 1 review', order: 1 }],
    });
    model = created.model;
    model = CommunicationEngine.updateMeeting(model, 'actor', created.meeting.id, {});
    model = CommunicationEngine.markAttendance(model, created.meeting.id, 'P1', true);
    model = CommunicationEngine.addResolution(model, created.meeting.id, 'Implement sepsis bundle');
    model = CommunicationEngine.addMeetingTask(model, created.meeting.id, { title: 'Update sepsis pathway', assignee: 'P2' });
    model = CommunicationEngine.setMeetingStatus(model, created.meeting.id, 'completed');
    const meeting = model.meetings.find((m) => m.id === created.meeting.id)!;
    expect(meeting.attendance).toContain('P1');
    expect(meeting.resolutions).toHaveLength(1);
    expect(meeting.tasks).toHaveLength(1);
    expect(meeting.status).toBe('completed');
  });

  it('creates a committee and links members and meetings', () => {
    let model = fresh();
    model = CommunicationEngine.createCommittee(model, 'actor', { name: 'Ethics Committee', purpose: 'Ethics approvals' }).model;
    const committee = model.committees[0];
    model = CommunicationEngine.addCommitteeMember(model, committee.id, { personId: 'P1', name: 'Dr Chair', role: 'chair', since: Date.now() });
    const meeting = CommunicationEngine.createMeeting(model, 'actor', {
      title: 'Ethics Review', kind: 'committee', organizer: author, scheduledAt: Date.now(), durationMinutes: 45, participants: ['P1'],
    }).meeting;
    model = CommunicationEngine.linkMeetingToCommittee(model, committee.id, meeting.id);
    const c = model.committees.find((x) => x.id === committee.id)!;
    expect(c.members).toHaveLength(1);
    expect(c.meetingIds).toContain(meeting.id);
  });

  it('sends professional messages with read receipts', () => {
    let model = fresh();
    const sent = CommunicationEngine.sendMessage(model, {
      organizationId: model.organizationId,
      senderName: 'Admin', senderUid: 'A1',
      recipients: ['P1'], channel: 'individual',
      body: 'Meeting rescheduled', priority: 'warning',
    });
    model = sent.model;
    expect(CommunicationEngine.unreadMessages(model, 'P1')).toHaveLength(1);
    model = CommunicationEngine.markMessageRead(model, sent.message.id, 'P1');
    expect(CommunicationEngine.unreadMessages(model, 'P1')).toHaveLength(0);
  });

  it('activates and deactivates Red Mode around an emergency', () => {
    let model = fresh();
    const created = CommunicationEngine.createEmergency(model, 'actor', {
      title: 'Mass Casualty', body: 'Multiple casualties incoming.', emergencyType: 'mass_casualty', author,
    });
    model = created.model;
    model = CommunicationEngine.activateRedMode(model, created.item.id);
    expect(model.redMode).toBe(true);
    expect(CommunicationEngine.currentEmergency(model)?.emergencyType).toBe('mass_casualty');
    model = CommunicationEngine.deactivateRedMode(model);
    expect(CommunicationEngine.currentEmergency(model)).toBeUndefined();
  });

  it('computes an overview / communication health score', () => {
    let model = fresh();
    let created = announce(model);
    model = CommunicationEngine.publish(created.model, 'actor', created.item.id);
    model = CommunicationEngine.createAnnouncement(model, 'actor', {
      title: 'New Parking Rules', body: '…', author, audience: { everyone: true }, scheduledFor: Date.now() + 86400000,
    }).model;
    model = CommunicationEngine.createCircular(model, 'actor', {
      title: 'HR Circular', body: '…', author, audience: { everyone: true }, requiresAcknowledgement: true,
    }).model;
    const overview = CommunicationEngine.getOverview(model);
    expect(overview.activeAnnouncements).toBe(1);
    expect(overview.scheduledBroadcasts).toBe(1);
    expect(overview.communicationHealthScore).toBeGreaterThanOrEqual(0);
  });

  it('searches across items by title, body, and author', () => {
    let model = fresh();
    model = announce(model).model;
    const results = CommunicationEngine.search(model, 'anniversary');
    expect(results).toHaveLength(1);
    const empty = CommunicationEngine.search(model, 'zzz');
    expect(empty).toHaveLength(0);
  });
});
