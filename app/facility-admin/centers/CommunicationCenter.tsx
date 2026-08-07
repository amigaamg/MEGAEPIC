'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN Hospital Communication Center — Engine IV · the official communication
// authority of the hospital. NOT a messaging app. Every announcement, circular,
// policy, emergency alert, meeting, and directive originates here — version-
// controlled, targeted, acknowledged, measurable, and searchable.
//
// Layout mirrors the Facility Command Center: a sub-sidebar of communication
// channels, a live work area, Red Mode for emergencies, and a shared audit
// trail. Pure engine + repository, optimistic writes with rollback.
// ═══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard, Megaphone, ScrollText, CalendarDays, Siren,
  Users, MessageSquare, BadgeCheck, ListChecks, Radar, Plus, Search, Loader2,
  Clock, AlertTriangle, Send, CheckCheck,
} from 'lucide-react';
import { CommunicationEngine } from '@/lib/amexan/communication/CommunicationEngine';
import { FirestoreCommunicationRepository } from '@/lib/amexan/communication/FirestoreCommunicationRepository';
import { DEFAULT_TEMPLATES, EMERGENCY_TYPES, getEmergencyType, getPurpose } from '@/lib/amexan/communication/registry';
import type {
  CommunicationAuthor,
  CommunicationBaseFields,
  CommunicationItem,
  CommunicationModel,
  CommunicationTemplate,
  TargetAudience,
} from '@/lib/amexan/communication/constitutional-types';
import { C } from '../ui';

type CommTab =
  | 'dashboard' | 'announcements' | 'circulars' | 'meetings' | 'policies'
  | 'emergency' | 'committees' | 'messaging' | 'acknowledgements'
  | 'templates' | 'analytics';

const NAV: { id: CommTab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'circulars', label: 'Circulars', icon: ScrollText },
  { id: 'meetings', label: 'Meetings', icon: CalendarDays },
  { id: 'policies', label: 'Policies', icon: ListChecks },
  { id: 'emergency', label: 'Emergency Broadcast', icon: Siren },
  { id: 'committees', label: 'Committees', icon: Users },
  { id: 'messaging', label: 'Internal Messaging', icon: MessageSquare },
  { id: 'acknowledgements', label: 'Acknowledgements', icon: BadgeCheck },
  { id: 'templates', label: 'Templates', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: Radar },
];

const lbl: React.CSSProperties = { fontSize: 10, color: C.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 };
const inputStyle: React.CSSProperties = { width: '100%', height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 10px', fontSize: 12, outline: 'none', background: '#fff', color: C.navy, fontFamily: 'inherit' };

const AUDIENCE: TargetAudience = { everyone: true };

function toneFor(item: CommunicationItem): string {
  if (item.severity === 'life_threatening' || item.severity === 'critical') return C.red;
  if (item.severity === 'warning') return C.amber;
  return C.sky;
}

function StatusPill({ status }: { status: string }) {
  const tone = status === 'published' || status === 'active' ? C.green : status === 'pending_approval' || status === 'scheduled' || status === 'review' ? C.amber : status === 'superseded' || status === 'archived' ? C.muted : C.slate;
  return <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${tone}18`, color: tone, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{status.replace('_', ' ')}</span>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={lbl}>{label}</label>{children}</div>;
}

function Panel({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, margin: 0 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddBtn({ label, onClick, disabled, danger }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: danger ? C.red : C.sky, color: '#fff', fontSize: 11, fontWeight: 700, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> {label}</button>;
}

function ActionTiny({ label, onClick, tone = C.sky }: { label: string; onClick: () => void; tone?: string }) {
  return <button onClick={onClick} style={{ padding: '4px 9px', borderRadius: 6, border: `1px solid ${tone === C.red ? C.red : C.border}`, background: '#fff', color: tone, fontSize: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{label}</button>;
}

function AudienceSummary({ audience }: { audience: TargetAudience }) {
  const parts: string[] = [];
  if (audience.everyone) parts.push('All staff');
  else {
    if (audience.allDepartments) parts.push('All departments');
    else if (audience.departments?.length) parts.push(audience.departments.join(', '));
    if (audience.roles?.length) parts.push(`roles: ${audience.roles.join(', ')}`);
    if (audience.individuals?.length) parts.push(`${audience.individuals.length} individual(s)`);
  }
  return <span style={{ fontSize: 10, color: C.muted }}>{parts.join(' · ') || 'Unspecified'}</span>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main center
// ═══════════════════════════════════════════════════════════════════════════

export function CommunicationCenter({ orgId, actorId, actorName, actorRole }: {
  orgId: string;
  actorId: string;
  actorName: string;
  actorRole?: string;
}) {
  const [model, setModel] = useState<CommunicationModel | null>(null);
  const [tab, setTab] = useState<CommTab>('dashboard');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const repoRef = useRef(new FirestoreCommunicationRepository(orgId));

  const load = useCallback(async () => {
    const m = await repoRef.current.loadAll();
    setModel(m ?? CommunicationEngine.create({ organizationId: orgId }));
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok });
    window.setTimeout(() => setToast(null), 2600);
  };

  const mutate = useCallback(async (next: CommunicationModel | ((m: CommunicationModel) => CommunicationModel)) => {
    if (!model) return;
    setSaving(true);
    const prev = model;
    const applied = typeof next === 'function' ? next(model) : next;
    setModel(applied);
    try {
      await repoRef.current.save(applied);
      notify('Saved');
    } catch (e: any) {
      setModel(prev);
      notify(`Save failed — ${e?.message || 'unknown'}`, false);
    } finally {
      setSaving(false);
    }
  }, [model, notify]);

  const author = useMemo<CommunicationAuthor>(() => ({ uid: actorId, name: actorName, role: actorRole, departmentName: 'Administration' }), [actorId, actorName, actorRole]);

  if (!model) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: '50vh', color: C.slate }}><Loader2 className="spin" size={22} color={C.sky} /> Loading Communication Center…</div>;
  }

  const overview = CommunicationEngine.getOverview(model);
  const searches = query.trim() ? CommunicationEngine.search(model, query) : null;

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 'calc(100vh - 150px)' }}>
      {/* LEFT · communication channel rail */}
      <aside style={{ width: 208, flexShrink: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '10px 8px', overflowY: 'auto' }}>
        <div style={{ padding: '6px 10px', fontSize: 11, fontWeight: 800, color: C.navy }}>Hospital Communication</div>
        <div style={{ fontSize: 10, color: C.muted, padding: '0 10px 8px' }}>Official authority · Engine IV</div>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = tab === n.id;
          const isEmergency = n.id === 'emergency';
          return (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8,
              fontSize: 12, fontWeight: active ? 700 : 500, color: isEmergency ? C.red : active ? C.sky : C.slate,
              background: active ? (isEmergency ? `${C.red}14` : C.skyLight) : 'transparent', cursor: 'pointer', border: 'none', textAlign: 'left',
            }}>
              <Icon size={15} /> {n.label}
            </button>
          );
        })}
        {model.redMode && (
          <div style={{ marginTop: 10, padding: '10px', borderRadius: 10, background: C.red, color: '#fff', fontSize: 11, fontWeight: 800, textAlign: 'center' }}>🔴 RED MODE</div>
        )}
      </aside>

      {/* MAIN WORK AREA */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 300 }}>
            <Search size={13} color={C.muted} style={{ position: 'absolute', left: 8, top: 10 }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search all communications…" style={{ ...inputStyle, paddingLeft: 28 }} />
          </div>
          {saving && <span style={{ fontSize: 11, color: C.slate, display: 'flex', alignItems: 'center', gap: 6 }}><Loader2 size={12} className="spin" /> Persisting…</span>}
          <span style={{ flex: 1 }} />
          {model.redMode && <button onClick={() => mutate(m => CommunicationEngine.deactivateRedMode(m))} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: C.red, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>End Emergency · Leave Red Mode</button>}
        </div>

        {model.redMode && <RedModeBanner model={model} />}

        {query.trim() && searches ? (
          <Panel title={`Search results (${searches.length})`} subtitle={`for "${query}"`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {searches.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No matches.</div>}
              {searches.map(item => <ItemRow key={item.id} item={item} />)}
            </div>
          </Panel>
        ) : (
          <>
            {tab === 'dashboard' && <DashboardView model={model} overview={overview} onGo={setTab} />}
            {tab === 'announcements' && <AnnouncementsView model={model} author={author} onMutate={mutate} />}
            {tab === 'circulars' && <CircularsView model={model} author={author} onMutate={mutate} />}
            {tab === 'policies' && <PoliciesView model={model} author={author} onMutate={mutate} />}
            {tab === 'meetings' && <MeetingsView model={model} author={author} onMutate={mutate} />}
            {tab === 'emergency' && <EmergencyView model={model} author={author} onMutate={mutate} />}
            {tab === 'committees' && <CommitteesView model={model} author={author} onMutate={mutate} />}
            {tab === 'messaging' && <MessagingView model={model} author={author} onMutate={mutate} />}
            {tab === 'acknowledgements' && <AcknowledgementsView model={model} onMutate={mutate} />}
            {tab === 'templates' && <TemplatesView model={model} author={author} onMutate={mutate} />}
            {tab === 'analytics' && <AnalyticsView model={model} />}
          </>
        )}
      </main>

      {toast && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: toast.ok ? C.green : C.red, color: '#fff', padding: '8px 18px', borderRadius: 20, fontSize: 12, fontWeight: 700, zIndex: 60, boxShadow: '0 8px 24px rgba(0,0,0,.15)' }}>{toast.msg}</div>
      )}
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return <span style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,.18)', fontSize: 11, fontWeight: 700 }}>{label}</span>;
}

function RedModeBanner({ model }: { model: CommunicationModel }) {
  const em = CommunicationEngine.currentEmergency(model);
  const def = em ? getEmergencyType(em.emergencyType) : undefined;
  return (
    <div style={{ background: '#7f1d1d', color: '#fff', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Siren size={22} />
        <div style={{ fontSize: 16, fontWeight: 800 }}>EMERGENCY — {def?.label ?? em?.emergencyType ?? 'Active Incident'}</div>
      </div>
      {em && <div style={{ fontSize: 13, lineHeight: 1.5 }}>{em.body}</div>}
      {em?.liveSituation && <div style={{ fontSize: 12, opacity: 0.9 }}>Live situation: {em.liveSituation}</div>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
        <Chip label={`Published ${new Date(em?.publishedAt ?? Date.now()).toLocaleTimeString()}`} />
        <Chip label={em?.audience.everyone ? 'Broadcast: All staff' : `Targeted: ${(em?.audience.departments ?? []).join(', ') || 'specific audience'}`} />
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: CommunicationItem }) {
  const def = getPurpose(item.kind);
  const tone = toneFor(item);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
      <span style={{ fontSize: 16 }}>{def?.icon ?? '📄'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
        <div style={{ fontSize: 10, color: C.muted }}>{def?.label} · by {item.author.name}{item.audience.everyone ? ' · all staff' : ''}</div>
      </div>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: tone }} />
      <StatusPill status={item.status} />
      <span style={{ fontSize: 10, color: C.muted }}>{new Date(item.updatedAt).toLocaleDateString()}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════════════════════════════

function DashboardView({ model, overview, onGo }: { model: CommunicationModel; overview: ReturnType<typeof CommunicationEngine.getOverview>; onGo: (t: CommTab) => void }) {
  const kpis = [
    { label: 'Active Announcements', value: overview.activeAnnouncements, color: C.sky, go: 'announcements' as CommTab },
    { label: 'Pending Approvals', value: overview.pendingApprovals, color: C.amber, go: 'announcements' as CommTab },
    { label: 'Scheduled Broadcasts', value: overview.scheduledBroadcasts, color: C.purple, go: 'announcements' as CommTab },
    { label: 'Emergency Alerts', value: overview.emergencyAlerts, color: C.red, go: 'emergency' as CommTab },
    { label: 'Meetings Today', value: overview.meetingsToday, color: C.sky, go: 'meetings' as CommTab },
    { label: 'Policies Updated', value: overview.policiesUpdatedThisWeek, color: '#0891b2', go: 'policies' as CommTab },
    { label: 'Messages Pending', value: overview.messagesPending, color: C.slate, go: 'messaging' as CommTab },
  ];
  const health = overview.communicationHealthScore;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {kpis.map(k => (
          <button key={k.label} onClick={() => onGo(k.go)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{String(k.value)}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k.label}</div>
          </button>
        ))}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: health >= 70 ? C.green : health >= 40 ? C.amber : C.red }}>{health}%</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>Communication Health</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <QuickAction label="+ Announcement" go="announcements" onGo={onGo} icon={Megaphone} />
        <QuickAction label="+ Schedule Broadcast" go="announcements" onGo={onGo} icon={Clock} />
        <QuickAction label="+ Emergency Alert" go="emergency" onGo={onGo} icon={Siren} primary />
        <QuickAction label="+ Meeting" go="meetings" onGo={onGo} icon={CalendarDays} />
        <QuickAction label="+ Policy" go="policies" onGo={onGo} icon={ListChecks} />
        <QuickAction label="+ Circular" go="circulars" onGo={onGo} icon={ScrollText} />
      </div>

      <Panel title="Recent Communications" subtitle="Latest from every channel — versioned, targeted, auditable.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {overview.recentItems.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '12px 0' }}>No communications yet. Create your first announcement, circular, or policy.</div>}
          {overview.recentItems.map(item => <ItemRow key={item.id} item={item} />)}
        </div>
      </Panel>

      {overview.pendingApprovals > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${C.amber}12`, color: C.amber, padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
          <AlertTriangle size={15} /> {overview.pendingApprovals} communication(s) awaiting approval.
        </div>
      )}
    </div>
  );
}

function QuickAction({ label, icon: Icon, onGo, go, primary }: { label: string; icon: any; onGo: (t: CommTab) => void; go: CommTab; primary?: boolean }) {
  return <button onClick={() => onGo(go)} style={{ padding: '9px 14px', borderRadius: 10, border: primary ? 'none' : `1px solid ${C.border}`, background: primary ? C.red : C.card, color: primary ? '#fff' : C.navy, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Icon size={14} /> {label}</button>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Announcements
// ═══════════════════════════════════════════════════════════════════════════

function AnnouncementsView({ model, author, onMutate }: { model: CommunicationModel; author: CommunicationAuthor; onMutate: (f: (m: CommunicationModel) => CommunicationModel) => void }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [severity, setSeverity] = useState<CommunicationBaseFields['severity']>('info');
  const [schedule, setSchedule] = useState('');
  const [requireAck, setRequireAck] = useState(false);
  const items = CommunicationEngine.itemsByPurpose(model, 'announcement');

  const create = () => {
    if (!title.trim() || !body.trim()) return;
    onMutate(m => CommunicationEngine.createAnnouncement(m, author.uid, {
      title, summary, body, author, severity, audience: AUDIENCE,
      requiresAcknowledgement: requireAck,
      ...(schedule ? { scheduledFor: new Date(schedule).getTime() } : {}),
    }).model);
    setTitle(''); setSummary(''); setBody(''); setSchedule(''); setRequireAck(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Panel title="Publish Announcement" subtitle="General information — anniversary, new staff, welfare, parking, cafeteria.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Field label="Title"><input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="e.g. Hospital Anniversary" /></Field>
          <Field label="Summary"><input value={summary} onChange={e => setSummary(e.target.value)} style={inputStyle} placeholder="Short headline" /></Field>
          <Field label="Severity">
            <select value={severity} onChange={e => setSeverity(e.target.value as any)} style={inputStyle}>
              <option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Schedule (optional)"><input value={schedule} onChange={e => setSchedule(e.target.value)} type="datetime-local" style={inputStyle} /></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <label style={lbl}>Full message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} style={{ ...inputStyle, height: 'auto', padding: '10px', fontFamily: 'inherit', resize: 'vertical' }} placeholder="Write the full announcement…" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.slate }}>
            <input type="checkbox" checked={requireAck} onChange={e => setRequireAck(e.target.checked)} /> Requires acknowledgement
          </label>
          <AddBtn label="Create Announcement" onClick={create} />
        </div>
      </Panel>
      <Panel title={`Announcements (${items.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '10px 0' }}>No announcements yet.</div>}
          {items.map(it => (
            <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
              <Megaphone size={15} color={toneFor(it)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{it.title}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{it.summary || it.body}</div>
              </div>
              <AudienceSummary audience={it.audience} />
              <StatusPill status={it.status} />
              <div style={{ display: 'flex', gap: 4 }}>
                {it.status === 'draft' && <ActionTiny label="Request approval" onClick={() => onMutate(m => CommunicationEngine.requestApproval(m, author.uid, it.id))} />}
                {it.status === 'pending_approval' && <ActionTiny label="Approve & publish" tone={C.green} onClick={() => onMutate(m => CommunicationEngine.publish(m, author.uid, it.id))} />}
                {(it.status === 'published' || it.status === 'scheduled') && <ActionTiny label="Archive" onClick={() => onMutate(m => CommunicationEngine.archive(m, author.uid, it.id))} />}
                {it.status !== 'published' && it.status !== 'scheduled' && <ActionTiny label="Delete" tone={C.red} onClick={() => onMutate(m => CommunicationEngine.remove(m, author.uid, it.id))} />}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Circulars
// ═══════════════════════════════════════════════════════════════════════════

function CircularsView({ model, author, onMutate }: { model: CommunicationModel; author: CommunicationAuthor; onMutate: (f: (m: CommunicationModel) => CommunicationModel) => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [requireAck, setRequireAck] = useState(true);
  const items = CommunicationEngine.itemsByPurpose(model, 'circular');

  const create = () => {
    if (!title.trim() || !body.trim()) return;
    onMutate(m => CommunicationEngine.createCircular(m, author.uid, {
      title, body, author, audience: AUDIENCE, requiresAcknowledgement: requireAck,
      ...(effectiveDate ? { effectiveDate } : {}),
    }).model);
    setTitle(''); setBody(''); setEffectiveDate('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Panel title="Issue Circular" subtitle="Formal administrative directive — becomes a permanent institutional document.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Field label="Title"><input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="e.g. Leave Procedure" /></Field>
          <Field label="Effective date (optional)"><input value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} type="date" style={inputStyle} /></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <label style={lbl}>Circular body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} style={{ ...inputStyle, height: 'auto', padding: '10px', fontFamily: 'inherit', resize: 'vertical' }} placeholder="Write the directive…" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.slate }}>
            <input type="checkbox" checked={requireAck} onChange={e => setRequireAck(e.target.checked)} /> Staff must acknowledge
          </label>
          <AddBtn label="Issue Circular" onClick={create} />
        </div>
      </Panel>
      <Panel title={`Circulars (${items.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '10px 0' }}>No circulars issued yet.</div>}
          {items.map(it => {
            const c = it as Extract<CommunicationItem, { purpose: 'circular' }>;
            return (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
                <ScrollText size={15} color={C.purple} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{it.title}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{c.circularNumber} · v{c.version}{c.supersedes ? ` · supersedes ${c.supersedes}` : ''}</div>
                </div>
                <AudienceSummary audience={it.audience} />
                <StatusPill status={it.status} />
                <div style={{ display: 'flex', gap: 4 }}>
                  {it.status === 'draft' && <ActionTiny label="Publish" tone={C.green} onClick={() => onMutate(m => CommunicationEngine.publish(m, author.uid, it.id))} />}
                  {it.status !== 'published' && <ActionTiny label="Delete" tone={C.red} onClick={() => onMutate(m => CommunicationEngine.remove(m, author.uid, it.id))} />}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Policies
// ═══════════════════════════════════════════════════════════════════════════

function PoliciesView({ model, author, onMutate }: { model: CommunicationModel; author: CommunicationAuthor; onMutate: (f: (m: CommunicationModel) => CommunicationModel) => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [owner, setOwner] = useState('');
  const items = CommunicationEngine.itemsByPurpose(model, 'policy');

  const create = () => {
    if (!title.trim() || !body.trim()) return;
    onMutate(m => CommunicationEngine.createPolicy(m, author.uid, {
      title, body, author, audience: AUDIENCE, owner: owner || undefined, requiresAcknowledgement: true,
    }).model);
    setTitle(''); setBody(''); setOwner('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Panel title="New Policy" subtitle="The hospital's living policy library — admission, discharge, consent, privacy, fire, infection prevention.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Field label="Policy title"><input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="e.g. Admission Policy" /></Field>
          <Field label="Owner (department / committee)"><input value={owner} onChange={e => setOwner(e.target.value)} style={inputStyle} placeholder="e.g. Medical Directorate" /></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <label style={lbl}>Policy text</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} style={{ ...inputStyle, height: 'auto', padding: '10px', fontFamily: 'inherit', resize: 'vertical' }} placeholder="Full policy text…" />
        </div>
        <div style={{ marginTop: 10 }}>
          <AddBtn label="Create Policy" onClick={create} />
        </div>
      </Panel>
      <Panel title={`Policy Library (${items.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '10px 0' }}>No policies yet.</div>}
          {items.map(it => {
            const p = it as Extract<CommunicationItem, { purpose: 'policy' }>;
            return (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
                <ListChecks size={15} color={C.purple} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{it.title}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{p.policyCode} · v{p.version} · owner: {p.owner}</div>
                </div>
                <StatusPill status={p.status} />
                <div style={{ display: 'flex', gap: 4 }}>
                  {p.status === 'draft' && <ActionTiny label="Activate" tone={C.green} onClick={() => onMutate(m => CommunicationEngine.publish(m, author.uid, it.id))} />}
                  {p.status === 'active' && <ActionTiny label="Revise (new version)" onClick={() => onMutate(m => { const r = CommunicationEngine.revisePolicy(m, author.uid, it.id, p.body); return r.model; })} />}
                  <ActionTiny label="Archive" onClick={() => onMutate(m => CommunicationEngine.archive(m, author.uid, it.id))} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Meetings
// ═══════════════════════════════════════════════════════════════════════════

function MeetingsView({ model, author, onMutate }: { model: CommunicationModel; author: CommunicationAuthor; onMutate: (f: (m: CommunicationModel) => CommunicationModel) => void }) {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('department');
  const [venue, setVenue] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [participants, setParticipants] = useState('');
  const meetings = model.meetings.slice().sort((a, b) => a.scheduledAt - b.scheduledAt);

  const create = () => {
    if (!title.trim() || !scheduledAt) return;
    onMutate(m => CommunicationEngine.createMeeting(m, author.uid, {
      title,
      kind: kind as any,
      organizer: author,
      venue: venue || undefined,
      scheduledAt: new Date(scheduledAt).getTime(),
      durationMinutes: 60,
      participants: participants.split(',').map(s => s.trim()).filter(Boolean),
    }).model);
    setTitle(''); setVenue(''); setScheduledAt(''); setParticipants('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Panel title="Schedule Meeting" subtitle="Board, mortality, morbidity, department, MDT, research, CPD, teaching, committee, emergency briefing.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Field label="Meeting name"><input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="e.g. Mortality & Morbidity" /></Field>
          <Field label="Kind">
            <select value={kind} onChange={e => setKind(e.target.value)} style={inputStyle}>
              {['board', 'mortality', 'morbidity', 'department', 'mdt', 'research', 'cpd', 'teaching', 'committee', 'emergency_briefing'].map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          <Field label="Venue"><input value={venue} onChange={e => setVenue(e.target.value)} style={inputStyle} placeholder="Board Room / Teams link" /></Field>
          <Field label="When"><input value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} type="datetime-local" style={inputStyle} /></Field>
          <Field label="Participants (ids, comma-sep)"><input value={participants} onChange={e => setParticipants(e.target.value)} style={inputStyle} placeholder="P1, P2" /></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <AddBtn label="Schedule Meeting" onClick={create} />
        </div>
      </Panel>
      <Panel title={`Meetings (${meetings.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {meetings.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '10px 0' }}>No meetings scheduled.</div>}
          {meetings.map(mt => (
            <div key={mt.id} style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CalendarDays size={15} color={C.amber} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{mt.title}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{mt.kind} · {mt.venue || 'no venue'} · {new Date(mt.scheduledAt).toLocaleString()}</div>
                </div>
                <StatusPill status={mt.status} />
                <div style={{ display: 'flex', gap: 4 }}>
                  <ActionTiny label="Start" tone={C.green} onClick={() => onMutate(m => CommunicationEngine.setMeetingStatus(m, mt.id, 'in_progress'))} />
                  <ActionTiny label="Complete" onClick={() => onMutate(m => CommunicationEngine.setMeetingStatus(m, mt.id, 'completed'))} />
                </div>
              </div>
              {mt.agenda.length > 0 && (
                <div style={{ marginTop: 8, paddingLeft: 8, borderLeft: `2px solid ${C.border}` }}>
                  {mt.agenda.map(a => <div key={a.id} style={{ fontSize: 11, color: C.slate, padding: '2px 0' }}>• {a.title}</div>)}
                </div>
              )}
              {mt.resolutions.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 11, color: C.green }}>Resolutions: {mt.resolutions.join(' · ')}</div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Emergency
// ═══════════════════════════════════════════════════════════════════════════

function EmergencyView({ model, author, onMutate }: { model: CommunicationModel; author: CommunicationAuthor; onMutate: (f: (m: CommunicationModel) => CommunicationModel) => void }) {
  const [etype, setEtype] = useState('code_blue');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [liveSituation, setLiveSituation] = useState('');
  const emergencyItems = CommunicationEngine.emergencyItems(model);
  const def = getEmergencyType(etype);
  const suggestion = CommunicationEngine.suggestAudience(etype);

  const launch = () => {
    if (!body.trim()) return;
    onMutate(m => {
      const res = CommunicationEngine.createEmergency(m, author.uid, {
        title: title.trim() || (def?.label ?? 'Emergency'),
        body, liveSituation: liveSituation || undefined,
        emergencyType: etype as any,
        author,
      });
      return CommunicationEngine.activateRedMode(res.model, res.item.id);
    });
    setTitle(''); setBody(''); setLiveSituation('');
  };

  const emergencyTypeDefs = EMERGENCY_TYPES;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Panel
        title="Emergency Broadcast"
        subtitle="The most important tool. AI suggests the exact audience from the emergency type."
        action={model.redMode ? <span style={{ color: C.red, fontSize: 11, fontWeight: 800 }}>🔴 RED MODE ACTIVE</span> : undefined}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10, marginBottom: 12 }}>
          {emergencyTypeDefs.map(t => (
            <button key={t.id} onClick={() => setEtype(t.id)} style={{
              textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              border: etype === t.id ? `2px solid ${t.severity === 'life_threatening' ? C.red : C.amber}` : `1px solid ${C.border}`,
              background: etype === t.id ? (t.severity === 'life_threatening' ? `${C.red}12` : `${C.amber}12`) : '#fff', color: C.navy,
            }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span> {t.label}
              <div style={{ fontSize: 10, fontWeight: 500, color: C.muted, marginTop: 2 }}>{t.severity}</div>
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Field label="Title (optional)"><input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder={def?.label} /></Field>
          <Field label="Live situation"><input value={liveSituation} onChange={e => setLiveSituation(e.target.value)} style={inputStyle} placeholder="Current status on ground…" /></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <label style={lbl}>Broadcast message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} style={{ ...inputStyle, height: 'auto', padding: '10px', fontFamily: 'inherit', resize: 'vertical' }} placeholder="Instructions for all affected staff…" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
          <AddBtn label={model.redMode ? 'Update Emergency' : 'Launch Emergency · Red Mode'} danger onClick={launch} />
          <span style={{ fontSize: 11, color: C.slate }}>AI-suggested audience: <AudienceSummary audience={suggestion} /></span>
        </div>
      </Panel>

      <Panel title={`Emergency History (${emergencyItems.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {emergencyItems.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '10px 0' }}>No emergencies broadcast.</div>}
          {emergencyItems.map(em => (
            <div key={em.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
              <Siren size={15} color={C.red} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{em.title}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{em.emergencyType} · {new Date(em.publishedAt ?? em.updatedAt).toLocaleString()}</div>
              </div>
              <AudienceSummary audience={em.audience} />
              <StatusPill status={em.status} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Committees
// ═══════════════════════════════════════════════════════════════════════════

function CommitteesView({ model, author, onMutate }: { model: CommunicationModel; author: CommunicationAuthor; onMutate: (f: (m: CommunicationModel) => CommunicationModel) => void }) {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');

  const create = () => {
    if (!name.trim()) return;
    onMutate(m => CommunicationEngine.createCommittee(m, author.uid, { name, purpose }).model);
    setName(''); setPurpose('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Panel title="Create Committee" subtitle="Committees are constitutional objects — members, meetings, tasks, recommendations, policies.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <Field label="Committee name"><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="e.g. Ethics Committee" /></Field>
          <Field label="Purpose"><input value={purpose} onChange={e => setPurpose(e.target.value)} style={inputStyle} placeholder="What this committee governs" /></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <AddBtn label="Create Committee" onClick={create} />
        </div>
      </Panel>
      <Panel title={`Committees (${model.committees.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {model.committees.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '10px 0' }}>No committees yet.</div>}
          {model.committees.map(c => (
            <div key={c.id} style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={15} color={C.purple} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{c.purpose}</div>
                </div>
                <span style={{ fontSize: 10, color: C.slate }}>{c.members.length} members · {c.meetingIds.length} meetings</span>
              </div>
              {c.members.length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {c.members.map(m => <span key={m.personId} style={{ padding: '3px 8px', borderRadius: 12, background: `${C.sky}14`, color: C.sky, fontSize: 10, fontWeight: 600 }}>{m.name} · {m.role}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Internal Messaging
// ═══════════════════════════════════════════════════════════════════════════

function MessagingView({ model, author, onMutate }: { model: CommunicationModel; author: CommunicationAuthor; onMutate: (f: (m: CommunicationModel) => CommunicationModel) => void }) {
  const [recipients, setRecipients] = useState('');
  const [channel, setChannel] = useState<'department' | 'committee' | 'role' | 'individual' | 'hospital'>('hospital');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'info' | 'warning' | 'critical' | 'life_threatening'>('info');
  const messages = model.messages.slice().sort((a, b) => b.createdAt - a.createdAt);

  const send = () => {
    if (!body.trim()) return;
    onMutate(m => CommunicationEngine.sendMessage(m, {
      organizationId: m.organizationId,
      senderName: author.name,
      senderUid: author.uid,
      recipients: recipients.split(',').map(s => s.trim()).filter(Boolean),
      channel,
      body, priority,
    }).model);
    setBody('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Panel title="Internal Messaging" subtitle="Professional, permission-controlled — individual, department, committee, role, or whole hospital.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
          <Field label="Channel">
            <select value={channel} onChange={e => setChannel(e.target.value as any)} style={inputStyle}>
              <option value="hospital">Entire hospital</option>
              <option value="department">Department</option>
              <option value="committee">Committee</option>
              <option value="role">Role</option>
              <option value="individual">Individual</option>
            </select>
          </Field>
          <Field label="Recipients (ids / dept / role)"><input value={recipients} onChange={e => setRecipients(e.target.value)} style={inputStyle} placeholder={channel === 'hospital' ? 'All staff' : 'P1, P2 or "Surgery" or "doctor"'} /></Field>
          <Field label="Priority">
            <select value={priority} onChange={e => setPriority(e.target.value as any)} style={inputStyle}>
              <option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option><option value="life_threatening">Life threatening</option>
            </select>
          </Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <label style={lbl}>Message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={2} style={{ ...inputStyle, height: 'auto', padding: '10px', fontFamily: 'inherit', resize: 'vertical' }} placeholder="Write a professional message…" />
        </div>
        <div style={{ marginTop: 10 }}>
          <AddBtn label="Send Message" onClick={send} />
        </div>
      </Panel>
      <Panel title={`Message log (${messages.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {messages.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '10px 0' }}>No messages sent.</div>}
          {messages.map(msg => (
            <div key={msg.id} style={{ padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Send size={13} color={toneByPrio(msg.priority)} />
                <span style={{ fontWeight: 700 }}>{msg.senderName}</span>
                <span style={{ fontSize: 10, color: C.muted }}>→ {msg.channel}{msg.recipients.length ? ` (${msg.recipients.join(', ')})` : ''}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 10, color: C.muted }}>{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ marginTop: 4, color: C.slate }}>{msg.body}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function toneByPrio(p: string) {
  return p === 'critical' || p === 'life_threatening' ? C.red : p === 'warning' ? C.amber : C.sky;
}

// ═══════════════════════════════════════════════════════════════════════════
// Acknowledgements
// ═══════════════════════════════════════════════════════════════════════════

function AcknowledgementsView({ model, onMutate }: { model: CommunicationModel; onMutate: (f: (m: CommunicationModel) => CommunicationModel) => void }) {
  const required = model.items.filter(i => i.requiresAcknowledgement && (i.status === 'published' || i.status === 'active'));
  const rates = CommunicationEngine.acknowledgementRatesByDepartment(model);
  const unacked = CommunicationEngine.unacknowledged;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Panel title="Department Acknowledgement Rates" subtitle="Who has read and acknowledged — instantly know who has not.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rates.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '6px 0' }}>No acknowledgement data yet.</div>}
          {rates.map(r => (
            <div key={r.department} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 140, fontSize: 12, fontWeight: 700 }}>{r.department}</span>
              <div style={{ flex: 1, height: 14, borderRadius: 7, background: '#eef2f7', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${r.rate}%`, background: r.rate >= 90 ? C.green : r.rate >= 60 ? C.amber : C.red, borderRadius: 7 }} />
              </div>
              <span style={{ width: 80, fontSize: 11, color: C.slate, textAlign: 'right' }}>{r.rate}%</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title={`Awaiting Acknowledgement (${required.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {required.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '10px 0' }}>No communications currently awaiting acknowledgement.</div>}
          {required.map(item => {
            const count = model.acknowledgements.filter(a => a.communicationId === item.id && a.state !== 'acknowledged').length;
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
                <CheckCheck size={15} color={count > 0 ? C.amber : C.green} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{item.title}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>by {item.author.name} · {new Date(item.publishedAt ?? item.updatedAt).toLocaleDateString()}</div>
                </div>
                <span style={{ fontSize: 11, color: count > 0 ? C.amber : C.green, fontWeight: 700 }}>{count} unacknowledged</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Templates
// ═══════════════════════════════════════════════════════════════════════════

function TemplatesView({ model, author, onMutate }: { model: CommunicationModel; author: CommunicationAuthor; onMutate: (f: (m: CommunicationModel) => CommunicationModel) => void }) {
  const templates: CommunicationTemplate[] = model.templates.length > 0 ? model.templates : DEFAULT_TEMPLATES;
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [purpose, setPurpose] = useState('announcement');

  const save = () => {
    if (!name.trim() || !body.trim()) return;
    onMutate(m => CommunicationEngine.addTemplate(m, {
      id: `tpl-${Date.now()}`,
      name, subject, body,
      purpose: purpose as any,
      audience: AUDIENCE,
      channels: ['in_app'],
      requiresAcknowledgement: false,
    }));
    setName(''); setSubject(''); setBody('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Panel title="Save Template" subtitle="Holiday notice, meeting invite, emergency alert, maintenance, research, CPD, policy update.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Field label="Template name"><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="e.g. CPD Announcement" /></Field>
          <Field label="Purpose">
            <select value={purpose} onChange={e => setPurpose(e.target.value)} style={inputStyle}>
              {['announcement', 'circular', 'meeting', 'emergency', 'reminder', 'training', 'research', 'maintenance'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Subject"><input value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} placeholder="Subject line" /></Field>
        </div>
        <div style={{ marginTop: 10 }}>
          <label style={lbl}>Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} style={{ ...inputStyle, height: 'auto', padding: '10px', fontFamily: 'inherit', resize: 'vertical' }} placeholder="Template body…" />
        </div>
        <div style={{ marginTop: 10 }}>
          <AddBtn label="Save Template" onClick={save} />
        </div>
      </Panel>
      <Panel title={`Templates (${templates.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {templates.map(t => (
            <div key={t.id} style={{ padding: '9px 12px', borderRadius: 10, background: '#f8fafc', fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ListChecks size={14} color={C.sky} />
                <span style={{ fontWeight: 700 }}>{t.name}</span>
                <span style={{ fontSize: 10, color: C.muted }}>{t.purpose}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 10, color: C.muted }}>{t.subject}</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: C.slate }}>{t.body}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Analytics
// ═══════════════════════════════════════════════════════════════════════════

function AnalyticsView({ model }: { model: CommunicationModel }) {
  const o = CommunicationEngine.getOverview(model);
  const byPurpose = PURPOSE_COUNTS(model);
  const rates = CommunicationEngine.acknowledgementRatesByDepartment(model);
  const total = model.items.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <Metric label="Total Communications" value={total} />
        <Metric label="Ack Rate" value={`${o.ackRate}%`} />
        <Metric label="Meetings Today" value={o.meetingsToday} />
        <Metric label="Pending Approvals" value={o.pendingApprovals} />
        <Metric label="Health Score" value={`${o.communicationHealthScore}%`} />
      </div>
      <Panel title="Volume by Purpose" subtitle="Announcements, circulars, policies, meetings, emergencies, alerts, tasks, reminders, training, research, maintenance, public notices.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {byPurpose.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No data yet.</div>}
          {byPurpose.map(([purpose, count]) => {
            const def = getPurpose(purpose);
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={purpose} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 110, fontSize: 12, fontWeight: 700 }}>{def?.icon} {def?.label}</span>
                <div style={{ flex: 1, height: 14, borderRadius: 7, background: '#eef2f7', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: def?.color ?? C.sky, borderRadius: 7 }} />
                </div>
                <span style={{ width: 60, fontSize: 11, color: C.slate, textAlign: 'right' }}>{count} · {pct}%</span>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel title="Department Acknowledgement" subtitle="Response by department across all requiring-acknowledgement items.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rates.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No acknowledgement data yet.</div>}
          {rates.map(r => (
            <div key={r.department} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 140, fontSize: 12, fontWeight: 700 }}>{r.department}</span>
              <div style={{ flex: 1, height: 14, borderRadius: 7, background: '#eef2f7', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${r.rate}%`, background: r.rate >= 90 ? C.green : r.rate >= 60 ? C.amber : C.red, borderRadius: 7 }} />
              </div>
              <span style={{ width: 80, fontSize: 11, color: C.slate, textAlign: 'right' }}>{r.rate}%</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function PURPOSE_COUNTS(model: CommunicationModel): [string, number][] {
  const map = new Map<string, number>();
  for (const i of model.items) map.set(i.kind, (map.get(i.kind) ?? 0) + 1);
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px' }}>
    <div style={{ fontSize: 26, fontWeight: 800, color: C.navy }}>{value}</div>
    <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
  </div>;
}