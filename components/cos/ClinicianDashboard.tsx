'use client';

// AMEXAN COS — Clinician Dashboard (No. 1)
// Clinical command center: My Clinical Work, Priority Board, Today's Agenda,
// Clinical Inbox, authorized Quick Actions, Clinical Status Strip.
import {
  AlertTriangle, FlaskConical, ClipboardList, BedDouble,
  Activity, ListChecks, MessageSquare,
  ChevronRight, Plus, Pill, Clock, Users, Stethoscope,
  CheckCircle2, Sparkles, Send, Lock,
  Microscope, FileSignature, Inbox as InboxIcon, CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import type { SavedEncounter } from '@/lib/amexan/encounter/encounterPersistence';
import type { LiveWorkspace } from './useClinicalWorkspace';
import type { ActionGrant } from '@/lib/amexan/cos/authorization';

export interface DashboardProps {
  ws: LiveWorkspace;
  onStartRound: () => void;
  onOpenPatient: (e: SavedEncounter) => void;
  onQuickAction: (kind: string) => void;
  onRunAction: (action: ActionGrant, label: string) => void;
}

const AGENDA = [
  { time: '07:30', title: 'Ward Round', activity: 'ward_round', location: 'Male Medical Ward' },
  { time: '08:30', title: 'MDT — Breast Unit', activity: 'mdt', location: 'Conference Rm 2' },
  { time: '10:00', title: 'Outpatient Clinic', activity: 'clinic', location: 'OPD B' },
  { time: '12:30', title: 'Theatre', activity: 'theatre', location: 'OT 2' },
  { time: '14:00', title: 'Follow-up reviews', activity: 'followup', location: 'Ward 3' },
  { time: '16:00', title: 'Teaching', activity: 'teaching', location: 'Lecture Hall' },
];

const AGENDA_ICON: Record<string, LucideIcon> = {
  ward_round: BedDouble,
  mdt: Users,
  clinic: Stethoscope,
  theatre: Microscope,
  followup: CheckCircle2,
  teaching: Activity,
};

export default function ClinicianDashboard({
  ws,
  onOpenPatient,
  onQuickAction,
  onRunAction,
}: DashboardProps) {
  const { stats, encounters, facilityName } = ws;

  const activeEncounters = encounters.filter((e) => e.status === 'active');
  const criticalEnc = activeEncounters.filter((e) => /critical|emergency|icu/i.test(e.currentPhase || ''));

  const quickActions: { key: string; label: string; icon: LucideIcon; action: ActionGrant }[] = [
    { key: 'encounter', label: 'New Encounter', icon: Plus, action: 'order.create' },
    { key: 'admit', label: 'Admit', icon: BedDouble, action: 'admit' },
    { key: 'result', label: 'Review Result', icon: FlaskConical, action: 'review' },
    { key: 'order', label: 'Create Order', icon: ClipboardList, action: 'order.create' },
    { key: 'prescribe', label: 'Prescribe', icon: Pill, action: 'prescribe' },
    { key: 'refer', label: 'Refer', icon: Send, action: 'refer' },
    { key: 'round', label: 'Start Ward Round', icon: BedDouble, action: 'review' },
  ];

  return (
    <div className="cos-content">
      <div className="cos-section-title">
        <Activity size={16} color="var(--sky-500)" /> My Clinical Work
      </div>
      <div className="cos-section-sub">
        What needs you right now · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>

      <div className="cos-stats-row">
        <StatCard icon={AlertTriangle} tone="red" num={stats.critical} label="Critical" onClick={() => onQuickAction('critical')} />
        <StatCard icon={ClipboardList} tone="amber" num={stats.newAdmissions} label="New admissions" onClick={() => onQuickAction('admissions')} />
        <StatCard icon={ListChecks} tone="sky" num={stats.pendingDecisions} label="Pending decisions" onClick={() => onQuickAction('decisions')} />
        <StatCard icon={Users} tone="green" num={stats.patients} label="Patients" onClick={() => onQuickAction('patients')} />
        <StatCard icon={FlaskConical} tone="blue" num={stats.resultsReady} label="Results ready" onClick={() => onQuickAction('results')} />
        <StatCard icon={Clock} tone="amber" num={stats.tasksDue} label="Tasks due" onClick={() => onQuickAction('tasks')} />
      </div>

      <div className="cos-grid-2">
        {/* PRIORITY BOARD */}
        <div className="cos-card" style={{ gridColumn: '1 / -1' }}>
          <div className="cos-card-title">
            <Users size={13} color="var(--red)" /> My Patients · Priority Board
          </div>

          {criticalEnc.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>
                Critical — require attention now
              </div>
              {criticalEnc.slice(0, 3).map((e) => (
                <PriorityRow key={e.encounterId} enc={e} tone="red" onClick={() => onOpenPatient(e)}>
                  <span className="cos-pill red">Immediate review</span>
                </PriorityRow>
              ))}
            </div>
          )}

          {activeEncounters.slice(0, 6).map((e) => (
            <PriorityRow key={e.encounterId} enc={e} tone="sky" onClick={() => onOpenPatient(e)}>
              <span className="cos-pill blue">Active</span>
            </PriorityRow>
          ))}

          {activeEncounters.length === 0 && (
            <div className="cos-empty" style={{ padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sky-700)' }}>No active patients assigned</div>
              <div style={{ fontSize: 12, color: 'var(--f-500)', margin: '8px 0 12px' }}>
                Your priority board assembles from active encounters at {facilityName || 'your facility'}.
              </div>
              <button className="cos-btn primary" onClick={() => onQuickAction('encounter')}>
                <Plus size={13} /> Start an encounter
              </button>
            </div>
          )}
        </div>

        {/* TODAY'S AGENDA */}
        <div className="cos-card">
          <div className="cos-card-title">
            <CalendarDays size={13} /> Today&apos;s Clinical Agenda
          </div>
          {AGENDA.map((a) => {
            const Icon = AGENDA_ICON[a.activity] || Activity;
            return (
              <div key={a.time} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 4px', borderBottom: '1px solid var(--f-100)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sky-600)', fontFamily: 'monospace' }}>{a.time}</span>
                <Icon size={13} color="var(--sky-500)" />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{a.title}</span>
                {a.location && <span style={{ fontSize: 10, color: 'var(--f-400)' }}>{a.location}</span>}
              </div>
            );
          })}
        </div>

        {/* CLINICAL INBOX */}
        <InboxCard ws={ws} onRunAction={onRunAction} />
      </div>

      {/* AUTHORIZED QUICK ACTIONS */}
      <div className="cos-card">
        <div className="cos-card-title">
          <Plus size={13} /> Authorized Quick Actions
        </div>
        <div className="cos-chip-row" style={{ marginBottom: 0 }}>
          {quickActions.map((qa) => {
            const decision = ws.authorizer.authorize({
              action: qa.action,
              actor: { id: ws.clinicianId, roleId: ws.roleId, isConsultant: ws.isConsultant, credential: ws.credential },
              env: ws.env,
            });
            const Icon = qa.icon;
            return (
              <button
                key={qa.key}
                className="cos-chip"
                disabled={!decision.allowed}
                title={decision.allowed ? qa.label : decision.reason}
                onClick={() => onQuickAction(qa.key)}
                style={decision.allowed ? undefined : { opacity: .45, cursor: 'not-allowed' }}
              >
                <Icon size={13} /> {qa.label}
                {!decision.allowed && <span style={{ fontSize: 9 }}>· locked</span>}
              </button>
            );
          })}
        </div>
        {!ws.isConsultant && (
          <div className="cos-denied-note">
            <Lock size={12} /> Some actions are gated pending credential &amp; consultant privileges. The engine authorizes — the UI only renders.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, tone, num, label, onClick }: { icon: LucideIcon; tone: string; num: number | string; label: string; onClick: () => void }) {
  return (
    <div className="cos-stat-card" onClick={onClick}>
      <div className={`cos-stat-icon ${tone}`}><Icon size={18} /></div>
      <div>
        <div className="cos-stat-num">{num}</div>
        <div className="cos-stat-label">{label}</div>
      </div>
    </div>
  );
}

function PriorityRow({ enc, tone, onClick, children }: { enc: SavedEncounter; tone: 'red' | 'sky'; onClick: () => void; children?: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
        border: '1.5px solid var(--f-200)', borderRadius: 'var(--r)', marginBottom: 6,
        cursor: 'pointer', transition: 'all .1s', background: 'var(--white)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--sky-300)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--f-200)')}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: tone === 'red' ? 'var(--red-bg)' : 'var(--sky-100)',
        color: tone === 'red' ? 'var(--red-text)' : 'var(--sky-700)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0,
      }}>
        {enc.patientName.charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{enc.patientName}</div>
        <div style={{ fontSize: 11, color: 'var(--f-500)' }}>{enc.hospitalNumber || '—'} · {enc.currentPhase || 'triage'}</div>
        {children && <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>{children}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--sky-500)', fontSize: 12, fontWeight: 600 }}>
        Open <ChevronRight size={13} />
      </div>
    </div>
  );
}

function InboxCard({ ws, onRunAction }: { ws: LiveWorkspace; onRunAction: (a: ActionGrant, l: string) => void }) {
  const rows = [
    { bucket: 'results', icon: FlaskConical, label: 'Results', count: ws.stats.resultsReady, tone: 'var(--sky-500)' },
    { bucket: 'consult_requests', icon: MessageSquare, label: 'Consult requests', count: 2, tone: 'var(--purple)' },
    { bucket: 'messages', icon: MessageSquare, label: 'Messages', count: 7, tone: 'var(--blue)' },
    { bucket: 'tasks', icon: ListChecks, label: 'Tasks', count: ws.stats.tasksDue, tone: 'var(--amber)' },
    { bucket: 'referrals', icon: Send, label: 'Referrals', count: 2, tone: 'var(--sky-600)' },
    { bucket: 'signatures', icon: FileSignature, label: 'Documents to sign', count: 3, tone: 'var(--green)' },
    { bucket: 'ai_observations', icon: Sparkles, label: 'Protocol observations', count: 4, tone: 'var(--red)' },
  ];
  return (
    <div className="cos-card">
      <div className="cos-card-title">
        <InboxIcon size={13} /> Clinical Inbox
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.map((r) => (
          <button
            key={r.bucket}
            onClick={() => onRunAction('review', r.bucket)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 8, border: 'none',
              background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: "'Inter',sans-serif", transition: 'background .1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sky-50)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <r.icon size={13} color={r.tone} />
            <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{r.label}</span>
            <span style={{ background: r.tone, color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 99 }}>{r.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function shiftLabel(now = new Date()): string {
  const h = now.getHours();
  if (h >= 6 && h < 14) return 'Day Shift';
  if (h >= 14 && h < 22) return 'Evening Shift';
  return 'Night Shift';
}