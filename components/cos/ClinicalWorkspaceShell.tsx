'use client';

// AMEXAN COS — Clinical Operating Shell
// Hosts: identity/top bar, clinical status strip, Dashboard (No.1),
// Ward Round (No.2), command palette, patient open-frame, and toasts.
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, BedDouble, ClipboardPlus, ClipboardList, FileText,
  Network, ChartNoAxesCombined, Search, Bell, UserRound,
  FlaskConical, Microscope, HeartPulse, MessageSquare, ListChecks,
  Activity, CheckCircle2, X, ChevronRight, type LucideIcon,
} from 'lucide-react';
import WorkspaceGuard from '@/components/workspace/WorkspaceGuard';
import { useClinicalWorkspace } from './useClinicalWorkspace';
import { COS_CSS } from './cos-styles';
import ClinicianDashboard, { shiftLabel } from './ClinicianDashboard';
import WardRoundView from './WardRoundView';
import ClinicalStatusStrip from './ClinicalStatusStrip';
import CommandPalette from './CommandPalette';
import { ClinicalEncounter } from '@/components/clinical-encounter/ClinicalEncounter';
import {
  loadEncounter,
  type SavedEncounter,
} from '@/lib/amexan/encounter/encounterPersistence';
import { getActiveOrganizationId } from '@/lib/firebase/orgContext';
import type { ActionGrant } from '@/lib/amexan/cos/authorization';
import type { ClinicalOrder, ClinicalNote, TimelineEvent } from '@/lib/amexan/cos/types';
import type { EncounterOrchestratorState } from '@/lib/amexan/encounter-engine/engines/orchestrator';
import type { Biodata } from '@/lib/amexan/encounter-engine/types/ces';

type LoadedEncounter = { state: EncounterOrchestratorState; answers: Record<string, unknown> };

type TabId = 'dashboard' | 'wardround' | 'encounters' | 'results' | 'messages' | 'timeline' | 'docs' | 'knowledge' | 'analytics';

type LiveStats = {
  critical: number;
  newAdmissions: number;
  pendingDecisions: number;
  patients: number;
  resultsReady: number;
  tasksDue: number;
};

const NAV_OPERATIONS: { id: TabId; label: string; icon: LucideIcon; badge?: (s: LiveStats) => string | undefined }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wardround', label: 'Ward Round', icon: BedDouble, badge: (s) => (s.pendingDecisions ? String(s.pendingDecisions) : undefined) },
  { id: 'encounters', label: 'Encounters', icon: ClipboardPlus, badge: (s) => (s.patients ? String(s.patients) : undefined) },
];

const NAV_CLINICAL: { id: TabId; label: string; icon: LucideIcon; badge?: (s: LiveStats) => string | undefined }[] = [
  { id: 'results', label: 'Results', icon: FlaskConical, badge: (s) => (s.resultsReady ? String(s.resultsReady) : undefined) },
  { id: 'timeline', label: 'Timeline', icon: Activity },
  { id: 'docs', label: 'Documentation', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
];

const NAV_INTEL: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'knowledge', label: 'Knowledge Graph', icon: Network },
  { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
];

function CosShell() {
  const ws = useClinicalWorkspace();
  const [tab, setTab] = useState<TabId>('dashboard');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [openEncounter, setOpenEncounter] = useState<SavedEncounter | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: 'ok' | 'err' }[]>([]);

  const toast = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openPatient = useCallback((e: SavedEncounter) => {
    setOpenEncounter(e);
  }, []);

  const handleQuickAction = useCallback((kind: string) => {
    switch (kind) {
      case 'wardround':
      case 'round':
        setTab('wardround');
        break;
      case 'encounter':
        window.location.href = '/encounter-center';
        break;
      case 'admit':
        toast('Admission — start a new encounter to admit a patient.', 'ok');
        setTab('encounters');
        break;
      case 'result':
      case 'results':
      case 'critical':
      case 'signatures':
        setTab('results');
        break;
      case 'order':
        toast('Create order — open a patient to place a lab, imaging, or medication order.', 'ok');
        setTab('encounters');
        break;
      case 'prescribe':
        toast('Prescribe — open a patient to write a prescription through the rules engine.', 'ok');
        setTab('encounters');
        break;
      case 'refer':
        toast('Referral — consult requests open in the messages center.', 'ok');
        setTab('messages');
        break;
      case 'admissions':
      case 'patients':
      case 'search':
        setTab('encounters');
        break;
      case 'tasks':
      case 'decisions':
        setTab('wardround');
        break;
      default:
        toast(`Action '${kind}' — routed to ${kind} engine.`, 'ok');
    }
  }, [toast]);

  const runAuthorizedAction = useCallback((_action: ActionGrant, label: string) => {
    const bucketMap: Record<string, TabId> = {
      results: 'results',
      tasks: 'wardround',
      messages: 'messages',
      consult_requests: 'messages',
      referrals: 'messages',
      signatures: 'docs',
      ai_observations: 'analytics',
    };
    if (bucketMap[label]) setTab(bucketMap[label]);
    toast(`${label} — opened via authorized engine.`, 'ok');
  }, [toast]);

  const initials = (ws.clinicianName || 'Dr').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const roleLabel = ws.roleId ? ws.roleId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Clinician';

  return (
    <>
      <style>{COS_CSS}</style>
      <div className="cos-layout">
        {/* SIDEBAR */}
        <aside className="cos-sidebar">
          <div className="cos-brand"><span className="cos-brand-name">AMEXAN</span><span className="cos-brand-badge">COS</span></div>
          <nav className="cos-nav">
            <div className="cos-nav-section">Operations</div>
            {NAV_OPERATIONS.map((item) => (
              <button key={item.id} className={`cos-nav-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
                <item.icon className="cos-nav-icon" size={15} />
                {item.label}
                {item.badge && item.badge(ws.stats) && <span className="cos-badge blue">{item.badge(ws.stats)}</span>}
              </button>
            ))}
            <div className="cos-nav-section">Clinical Care</div>
            {NAV_CLINICAL.map((item) => (
              <button key={item.id} className={`cos-nav-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
                <item.icon className="cos-nav-icon" size={15} />
                {item.label}
                {item.badge && item.badge(ws.stats) && <span className="cos-badge red">{item.badge(ws.stats)}</span>}
              </button>
            ))}
            <div className="cos-nav-section">Clinical Intelligence</div>
            {NAV_INTEL.map((item) => (
              <button key={item.id} className={`cos-nav-item ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
                <item.icon className="cos-nav-icon" size={15} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="cos-profile">
            <div className="cos-avatar">{initials}</div>
            <div className="cos-profile-info">
              <div className="cos-profile-name">{ws.clinicianName}</div>
              <div className="cos-profile-role">{roleLabel}{ws.isConsultant ? ' · Consultant' : ''}</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="cos-main">
          <header className="cos-topbar">
            <div className="cos-greeting">Good {hourGreeting()}, <strong>{first(ws.clinicianName)}</strong></div>
            <div className="cos-search" onClick={() => setCmdOpen(true)}>
              <Search size={15} color="var(--f-500)" />
              <span className="cos-search-placeholder">Search patient, MRN, order, encounter…</span>
              <kbd className="cos-search-kbd">Ctrl K</kbd>
            </div>
            <div className="cos-topbar-right">
              <span className="cos-ctx-pill on"><span className="cos-dot" style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--green)', borderRadius: 99, marginRight: 4 }} />{shiftLabel()}</span>
              <button className="cos-topbar-btn" onClick={() => setTab('messages')}><Bell size={16} /><span className="cos-notif-dot" /></button>
              <button className="cos-topbar-btn" onClick={() => setTab('dashboard')}><UserRound size={16} /></button>
            </div>
          </header>

          <ClinicalStatusStrip ws={ws} onJump={handleQuickAction} />

          {/* VIEWS */}
          {tab === 'dashboard' && (
            <ClinicianDashboard
              ws={ws}
              onStartRound={() => setTab('wardround')}
              onOpenPatient={openPatient}
              onQuickAction={handleQuickAction}
              onRunAction={runAuthorizedAction}
            />
          )}

          {tab === 'wardround' && (
            <WardRoundView ws={ws} encounters={ws.encounters} onOpenPatient={openPatient} toast={toast} />
          )}

          {tab === 'encounters' && (
            <EncounterList ws={ws} onOpenPatient={openPatient} onQuickAction={handleQuickAction} />
          )}

          {(tab === 'results' || tab === 'timeline' || tab === 'docs' || tab === 'messages') && (
            <EngineBoards tab={tab} ws={ws} onOpenPatient={openPatient} />
          )}

          {tab === 'knowledge' && <KnowledgeView ws={ws} onOpenPatient={openPatient} />}

          {tab === 'analytics' && <AnalyticsView ws={ws} />}
        </div>
      </div>

      {/* COMMAND PALETTE */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        encounters={ws.encounters}
        onOpenPatient={openPatient}
        onQuickAction={handleQuickAction}
      />

      {/* TOASTS */}
      <div className="cos-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`cos-toast ${t.kind}`}>
            {t.kind === 'ok' ? <CheckCircle2 size={14} /> : <X size={14} />} {t.msg}
          </div>
        ))}
      </div>

      {/* OPEN PATIENT FRAME */}
      {openEncounter && (
        <OpenPatientFrame key={openEncounter.encounterId} enc={openEncounter} ws={ws} onClose={() => setOpenEncounter(null)} />
      )}
    </>
  );
}

function OpenPatientFrame({ enc, ws, onClose }: { enc: SavedEncounter; ws: ReturnType<typeof useClinicalWorkspace>; onClose: () => void }) {
  const [loaded, setLoaded] = useState<LoadedEncounter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const orgId = getActiveOrganizationId() || ws.organizationId;
    (orgId
      ? loadEncounter(orgId, enc.encounterId)
      : Promise.resolve(null)
    )
      .then((res) => {
        if (!alive) return;
        if (res && res.state && (res.state.biodata || res.state.questionEngine || Object.keys(res.state).length > 0)) {
          setLoaded(res);
        }
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [enc, ws.organizationId]);

  const s = loaded?.state;
  const biodata: Partial<Biodata> = s?.biodata ?? {};

  return (
    <div className="enc-open-frame" style={openFrameStyle}>
      <div style={{ height: 52, background: 'var(--white)', borderBottom: '1px solid var(--f-200)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', flexShrink: 0 }}>
        <button className="cos-btn" onClick={onClose}><X size={13} /> Back to Workspace</button>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{biodata.patientName || enc.patientName}</span>
        <span style={{ fontSize: 11, color: 'var(--f-500)' }}>{biodata.hospitalNumber || enc.hospitalNumber || '—'} · {biodata.encounterType || enc.currentPhase || 'triage'}</span>
        <Link href="/encounter-center" className="cos-btn ghost" style={{ marginLeft: 'auto', textDecoration: 'none' }}>
          Open Encounters Center <ClipboardPlus size={13} />
        </Link>
      </div>
      {loading ? (
        <div className="cos-card" style={{ maxWidth: 1080, margin: '20px auto', textAlign: 'center', padding: 32 }}>
          Loading full clinical workspace for {enc.patientName}…
        </div>
      ) : loaded ? (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <ClinicalEncounter
            patientName={biodata.patientName || enc.patientName}
            patientAge={typeof biodata.age === 'number' ? biodata.age : 30}
            patientSex={biodata.sex === 'female' ? 'female' : 'male'}
            hospitalNumber={biodata.hospitalNumber || enc.hospitalNumber || '—'}
            initialState={loaded.state}
            encounterId={enc.encounterId}
          />
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto', padding: 20, maxWidth: 1080, margin: '0 auto', width: '100%' }}>
          <PatientClinicalOverview ws={ws} enc={enc} />
        </div>
      )}
    </div>
  );
}

function PatientClinicalOverview({ ws, enc }: { ws: ReturnType<typeof useClinicalWorkspace>; enc: SavedEncounter }) {
  const [tab, setTab] = useState<'overview' | 'timeline' | 'orders' | 'notes'>('overview');
  const [orders, setOrders] = useState<ClinicalOrder[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const patientId = enc.encounterId;
    if (!patientId) return;
    ws.executor.loadOrders(patientId).then(setOrders).catch(() => setOrders([]));
    ws.executor.loadNotes(patientId).then(setNotes).catch(() => setNotes([]));
    ws.executor.loadTimeline(patientId).then(setEvents).catch(() => setEvents([]));
  }, [enc, ws.executor]);

  return (
    <div className="cos-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--sky-100)', color: 'var(--sky-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
          {enc.patientName.charAt(0)}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{enc.patientName}</div>
          <div style={{ fontSize: 11, color: 'var(--f-500)' }}>{enc.hospitalNumber || '—'} · {enc.status} · {enc.currentPhase}</div>
        </div>
        <span className="cos-pill blue" style={{ marginLeft: 'auto' }}><Activity size={10} /> Live workspace</span>
      </div>

      <div className="cos-chip-row">
        {([['overview', 'Overview', LayoutDashboard], ['timeline', 'Timeline', Activity], ['orders', 'Orders', ClipboardList], ['notes', 'Notes', FileText]] as const).map(([id, label, Icon]) => (
          <button key={id} className={`cos-chip ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="cos-grid-2">
          <div className="cos-card" style={{ marginBottom: 0 }}>
            <div className="cos-card-title"><Activity size={13} /> Clinical story</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--f-600)' }}>
              Active encounter in <strong>{enc.currentPhase || 'triage'}</strong> phase. This workspace keeps every action
              traceable to the patient, encounter, clinician, facility, and time.
            </div>
          </div>
          <div className="cos-card" style={{ marginBottom: 0 }}>
            <div className="cos-card-title"><ClipboardList size={13} /> Recent timeline</div>
            {events.slice().reverse().slice(0, 5).map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11, padding: '3px 0' }}>
                <span style={{ fontFamily: 'monospace', color: 'var(--f-400)', fontSize: 10 }}>{new Date(ev.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ fontWeight: 600 }}>{ev.title}</span>
              </div>
            ))}
            {events.length === 0 && <div style={{ fontSize: 11, color: 'var(--f-400)' }}>No traced events yet.</div>}
          </div>
        </div>
      )}

      {tab === 'timeline' && <TimelinePanel events={events} />}
      {tab === 'orders' && <OrdersPanel orders={orders} />}
      {tab === 'notes' && <NotesPanel notes={notes} />}
    </div>
  );
}

function TimelinePanel({ events }: { events: TimelineEvent[] }) {
  return (
    <div>
      {events.length === 0 && <div style={{ fontSize: 12, color: 'var(--f-400)' }}>No events recorded for this patient yet.</div>}
      {events.slice().reverse().map((ev, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--f-100)', fontSize: 12 }}>
          <span style={{ fontFamily: 'monospace', color: 'var(--f-400)', fontSize: 11, whiteSpace: 'nowrap' }}>
            {new Date(ev.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
          <div>
            <div style={{ fontWeight: 700 }}>{ev.title}</div>
            {ev.detail && <div style={{ color: 'var(--f-500)', fontSize: 11 }}>{ev.detail}</div>}
            <div style={{ color: 'var(--f-400)', fontSize: 10 }}>actor: {ev.actorName || ev.actor || 'system'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersPanel({ orders }: { orders: ClinicalOrder[] }) {
  return (
    <div>
      {orders.length === 0 && <div style={{ fontSize: 12, color: 'var(--f-400)' }}>No orders yet.</div>}
      {orders.map((o, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--f-100)', fontSize: 12 }}>
          <span className={`cos-pill ${o.kind === 'medication' ? 'purple' : o.kind === 'lab' ? 'green' : o.kind === 'imaging' ? 'blue' : 'gray'}`}>{o.kind}</span>
          <span style={{ fontWeight: 600, flex: 1 }}>{o.name}</span>
          <span className="cos-pill green">{o.status}</span>
        </div>
      ))}
    </div>
  );
}

function NotesPanel({ notes }: { notes: ClinicalNote[] }) {
  return (
    <div>
      {notes.length === 0 && <div style={{ fontSize: 12, color: 'var(--f-400)' }}>No clinical notes yet.</div>}
      {notes.slice().reverse().map((n, i) => (
        <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--f-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{n.type}</span>
            <span className={`cos-pill ${n.phase === 'signed' ? 'green' : 'amber'}`}>{n.phase}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--f-400)' }}>
              {new Date(n.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--f-600)', marginTop: 4, lineHeight: 1.6 }}>
            {n.structured?.assessment || n.structured?.plan || '—'}
          </div>
        </div>
      ))}
    </div>
  );
}

function EncounterList({ ws, onOpenPatient, onQuickAction }: {
  ws: ReturnType<typeof useClinicalWorkspace>;
  onOpenPatient: (e: SavedEncounter) => void;
  onQuickAction: (k: string) => void;
}) {
  if (ws.encountersLoading) {
    return (
      <div className="cos-content">
        <div className="cos-card" style={{ textAlign: 'center', padding: 32 }}>Loading encounters…</div>
      </div>
    );
  }
  if (ws.encounters.length === 0) {
    return (
      <div className="cos-content">
        <div className="cos-empty">
          <ClipboardPlus size={28} color="var(--sky-500)" />
          <div className="cos-empty-title">No encounters yet</div>
          <div className="cos-empty-text">Start a clinical encounter to build the patient record — guided by the clinical rules engine.</div>
          <button className="cos-btn primary" onClick={() => onQuickAction('encounter')}><ClipboardPlus size={13} /> New Encounter</button>
        </div>
      </div>
    );
  }
  return (
    <div className="cos-content">
      <div className="cos-section-title"><ClipboardPlus size={16} color="var(--sky-500)" /> Encounters</div>
      <div className="cos-section-sub">{ws.encounters.filter((e) => e.status === 'active').length} active · {ws.encounters.length} total</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ws.encounters.map((e) => (
          <div key={e.encounterId} className="cos-prio-row" onClick={() => onOpenPatient(e)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1.5px solid var(--f-200)',
            borderRadius: 'var(--r)', cursor: 'pointer', background: 'var(--white)', transition: 'all .1s',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sky-600)', fontFamily: 'monospace', minWidth: 100 }}>{e.hospitalNumber || '—'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{e.patientName}</div>
              <div style={{ fontSize: 11, color: 'var(--f-500)' }}>Phase: {e.currentPhase || 'triage'}</div>
            </div>
            <span className={`cos-pill ${e.status === 'active' ? 'green' : 'gray'}`}>{e.status}</span>
            <span style={{ fontSize: 11, color: 'var(--f-400)' }}>
              {e.updatedAt ? new Date(e.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--sky-500)', fontSize: 12, fontWeight: 600 }}>
              Open <ClipboardPlus size={13} style={{ marginLeft: 4 }} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const openFrameStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 100, background: 'var(--f-50)',
  display: 'flex', flexDirection: 'column',
};

// ═══════════════════════════════════════════════════════════════════════════════
// Engine boards — real data pulled from the Clinical Executor (orders, notes,
// timeline) across the live encounter list. No dead placeholders.
// ═══════════════════════════════════════════════════════════════════════════════

type Enriched<T> = T & { enc: SavedEncounter };

function useEngineData(ws: ReturnType<typeof useClinicalWorkspace>) {
  const [data, setData] = useState<{
    orders: Enriched<ClinicalOrder>[];
    notes: Enriched<ClinicalNote>[];
    events: Enriched<TimelineEvent>[];
  }>({ orders: [], notes: [], events: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const rows = ws.encounters.slice(0, 12);
    Promise.all(
      rows.map(async (e) => {
        const pid = e.encounterId;
        const [orders, notes, events] = await Promise.all([
          ws.executor.loadOrders(pid).catch(() => []),
          ws.executor.loadNotes(pid).catch(() => []),
          ws.executor.loadTimeline(pid).catch(() => []),
        ]);
        return { orders, notes, events, enc: e };
      }),
    )
      .then((res) => {
        if (!alive) return;
        setData({
          orders: res.flatMap((r) => r.orders.map((o) => ({ ...o, enc: r.enc }))),
          notes: res.flatMap((r) => r.notes.map((n) => ({ ...n, enc: r.enc }))),
          events: res.flatMap((r) => r.events.map((ev) => ({ ...ev, enc: r.enc }))),
        });
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [ws.encounters, ws.executor]);

  return { ...data, loading };
}

function EngineBoards({ tab, ws, onOpenPatient }: {
  tab: 'results' | 'timeline' | 'docs' | 'messages' | 'knowledge' | 'analytics';
  ws: ReturnType<typeof useClinicalWorkspace>;
  onOpenPatient: (e: SavedEncounter) => void;
}) {
  const { orders, notes, events, loading } = useEngineData(ws);

  if (loading) {
    return (
      <div className="cos-content">
        <div className="cos-card" style={{ textAlign: 'center', padding: 32 }}>Loading clinical engine data…</div>
      </div>
    );
  }

  if (tab === 'results') return <ResultsBoard orders={orders} onOpenPatient={onOpenPatient} />;
  if (tab === 'timeline') return <TimelineBoard events={events} />;
  if (tab === 'docs') return <DocsBoard notes={notes} />;
  if (tab === 'knowledge') return <IntelligenceBoard title="Knowledge Graph" tone="purple" icon={Network} events={events} />;
  if (tab === 'analytics') return <IntelligenceBoard title="Analytics" tone="sky" icon={ChartNoAxesCombined} events={events} />;
  return <MessagesBoard notes={notes} events={events} onOpenPatient={onOpenPatient} />;
}

function IntelligenceBoard({ title, tone, icon: Icon, events }: {
  title: string; tone: string; icon: LucideIcon; events: Enriched<TimelineEvent>[];
}) {
  return (
    <div className="cos-content">
      <div className="cos-section-title"><Icon size={16} color={`var(--${tone})`} /> {title}</div>
      <div className="cos-section-sub">
        {events.length} traced clinical event{events.length === 1 ? '' : 's'} are feeding the {title.toLowerCase()} surface from the Clinical Executor.
      </div>
      <div className="cos-grid-3">
        {[
          { label: 'Orders placed', value: events.filter((e) => e.category === 'ordering').length },
          { label: 'Documentation', value: events.filter((e) => e.category === 'documentation').length },
          { label: 'Clinical events', value: events.filter((e) => e.category === 'clinical').length },
        ].map((s) => (
          <div key={s.label} className="cos-card" style={{ marginBottom: 0 }}>
            <div className="cos-stat-num">{s.value}</div>
            <div className="cos-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="cos-card">
        <div style={{ fontSize: 11, color: 'var(--f-500)', lineHeight: 1.7 }}>
          The {title.toLowerCase()} engine aggregates the traced, traceable actions you take. As the clinical operating loop
          fills with data — orders, results, notes, reviews — this surface renders the derived intelligence. The system assists;
          the authorized clinician decides.
        </div>
      </div>
    </div>
  );
}

function ResultsBoard({ orders, onOpenPatient }: { orders: Enriched<ClinicalOrder>[]; onOpenPatient: (e: SavedEncounter) => void }) {
  const rows = orders.filter((o) => o.kind === 'lab' || o.kind === 'imaging');
  return (
    <div className="cos-content">
      <div className="cos-section-title"><FlaskConical size={16} color="var(--sky-500)" /> Results Board</div>
      <div className="cos-section-sub">{rows.length} lab &amp; imaging order{rows.length === 1 ? '' : 's'} across your encounters — linked to the investigations engine.</div>
      {rows.length === 0 ? (
        <div className="cos-empty">
          <Microscope size={28} color="var(--sky-500)" />
          <div className="cos-empty-title">No lab or imaging orders yet</div>
          <div className="cos-empty-text">Orders you place during an encounter (Investigations phase) appear here with their result status.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map((o, i) => (
            <div key={i} className="cos-prio-row" onClick={() => onOpenPatient(o.enc)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1.5px solid var(--f-200)',
              borderRadius: 'var(--r)', cursor: 'pointer', background: 'var(--white)',
            }}>
              <span className={`cos-pill ${o.kind === 'lab' ? 'green' : 'blue'}`}>{o.kind}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{o.name}</div>
                <div style={{ fontSize: 11, color: 'var(--f-500)' }}>{o.enc.patientName} · {o.priority} · {o.reason || o.detail || '—'}</div>
              </div>
              <span className="cos-pill amber">{o.status}</span>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--sky-500)', fontSize: 12, fontWeight: 600 }}>
                Open <ChevronRight size={13} style={{ marginLeft: 4 }} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineBoard({ events }: { events: Enriched<TimelineEvent>[] }) {
  const sorted = events.slice().sort((a, b) => (b.at || 0) - (a.at || 0));
  return (
    <div className="cos-content">
      <div className="cos-section-title"><Activity size={16} color="var(--sky-500)" /> Clinical Timeline</div>
      <div className="cos-section-sub">{sorted.length} traced event{sorted.length === 1 ? '' : 's'} — every action is logged with patient, clinician, and time.</div>
      {sorted.length === 0 ? (
        <div className="cos-empty">
          <Activity size={28} color="var(--sky-500)" />
          <div className="cos-empty-title">No traced events yet</div>
          <div className="cos-empty-text">Orders, notes, reviews, and prescriptions you act on inside the workspace are recorded here automatically.</div>
        </div>
      ) : (
        <div className="cos-card">
          {sorted.map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--f-100)', fontSize: 12, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'monospace', color: 'var(--f-400)', fontSize: 11, whiteSpace: 'nowrap', minWidth: 92 }}>
                {new Date(ev.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className={`cos-pill ${ev.category === 'ordering' ? 'blue' : ev.category === 'documentation' ? 'purple' : ev.category === 'communication' ? 'sky' : ev.category === 'result' ? 'green' : 'gray'}`}>{ev.category}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{ev.title}</div>
                {ev.detail && <div style={{ color: 'var(--f-500)', fontSize: 11 }}>{ev.detail}</div>}
              </div>
              <span style={{ fontSize: 10, color: 'var(--f-400)', textAlign: 'right' }}>{ev.enc?.patientName || ev.patientId || ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocsBoard({ notes }: { notes: Enriched<ClinicalNote>[] }) {
  const sorted = notes.slice().sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  const signed = notes.filter((n) => n.phase === 'signed').length;
  return (
    <div className="cos-content">
      <div className="cos-section-title"><FileText size={16} color="var(--sky-500)" /> Documentation</div>
      <div className="cos-section-sub">{notes.length} note{notes.length === 1 ? '' : 's'} · {signed} signed — authored through the documentation engine.</div>
      {sorted.length === 0 ? (
        <div className="cos-empty">
          <FileText size={28} color="var(--sky-500)" />
          <div className="cos-empty-title">No clinical notes yet</div>
          <div className="cos-empty-text">Notes you draft, verify, and sign during encounters appear here, with their signature phase tracked.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.map((n, i) => (
            <div key={i} style={{ padding: '12px 14px', border: '1.5px solid var(--f-200)', borderRadius: 'var(--r)', background: 'var(--white)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{n.type}</span>
                <span className={`cos-pill ${n.phase === 'signed' ? 'green' : 'amber'}`}>{n.phase}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--f-400)' }}>
                  {new Date(n.updatedAt || n.createdAt || 0).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--f-600)', marginTop: 4, lineHeight: 1.6 }}>
                {n.structured?.assessment || n.structured?.plan || n.structured?.subjective || '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesBoard({ notes, events, onOpenPatient }: {
  notes: Enriched<ClinicalNote>[];
  events: Enriched<TimelineEvent>[];
  onOpenPatient: (e: SavedEncounter) => void;
}) {
  const referrals = notes.filter((n) => n.type === 'referral');
  const comms = events.filter((ev) => ev.category === 'communication');
  const rows = [
    ...referrals.map((n) => ({ id: n.id, kind: 'referral', title: `Referral — ${n.type}`, detail: n.structured?.assessment || n.structured?.plan || '', enc: n.enc, at: n.updatedAt || n.createdAt })),
    ...comms.map((ev) => ({ id: ev.id, kind: 'message', title: ev.title, detail: ev.detail || '', enc: ev.enc, at: ev.at })),
  ].sort((a, b) => (b.at || 0) - (a.at || 0));

  return (
    <div className="cos-content">
      <div className="cos-section-title"><MessageSquare size={16} color="var(--sky-500)" /> Messages &amp; Consult Requests</div>
      <div className="cos-section-sub">{rows.length} consult request{rows.length === 1 ? '' : 's'} and message{rows.length === 1 ? '' : 's'} across your patient list.</div>
      {rows.length === 0 ? (
        <div className="cos-empty">
          <HeartPulse size={28} color="var(--sky-500)" />
          <div className="cos-empty-title">No consults or messages yet</div>
          <div className="cos-empty-text">Referrals you create and communication events logged on an encounter land here. Nothing is sent without an encounter behind it.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map((r, i) => (
            <div key={i} className="cos-prio-row" onClick={() => onOpenPatient(r.enc)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1.5px solid var(--f-200)',
              borderRadius: 'var(--r)', cursor: 'pointer', background: 'var(--white)',
            }}>
              <span className="cos-pill sky">{r.kind}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: 'var(--f-500)' }}>{r.enc.patientName} · {r.detail || '—'}</div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--f-400)' }}>
                {new Date(r.at || 0).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KnowledgeView({ ws, onOpenPatient }: { ws: ReturnType<typeof useClinicalWorkspace>; onOpenPatient: (e: SavedEncounter) => void }) {
  const active = ws.encounters.filter((e) => e.status === 'active');
  const modules: { icon: LucideIcon; name: string; scope: string }[] = [
    { icon: ListChecks, name: 'Question Engine', scope: `${active.length} active encounter${active.length === 1 ? '' : 's'} drive contextual questions` },
    { icon: FileText, name: 'Documentation Engine', scope: 'Generates HPI, history, and assessment narratives per format' },
    { icon: Network, name: 'Symptom Knowledge Graph', scope: 'Bayesian differentials wired into each active encounter' },
    { icon: FlaskConical, name: 'Investigations Engine', scope: 'Lab and imaging orders stay linked to the results board' },
  ];
  return (
    <div className="cos-content">
      <div className="cos-section-title"><Network size={16} color="var(--sky-500)" /> Knowledge Graph</div>
      <div className="cos-section-sub">Clinical intelligence modules are applied live inside each encounter — open a patient to query them.</div>
      <div className="cos-grid-2" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        {modules.map((m) => (
          <div key={m.name} className="cos-card" style={{ marginBottom: 0 }}>
            <div className="cos-card-title"><m.icon size={13} color="var(--sky-500)" /> {m.name}</div>
            <div style={{ fontSize: 11, color: 'var(--f-600)', lineHeight: 1.6 }}>{m.scope}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {active.slice(0, 3).map((e) => (
          <button key={e.encounterId} className="cos-chip" onClick={() => onOpenPatient(e)}>
            <ClipboardPlus size={13} /> {e.patientName}
          </button>
        ))}
      </div>
    </div>
  );
}

function AnalyticsView({ ws }: { ws: ReturnType<typeof useClinicalWorkspace> }) {
  const { encounters, stats } = ws;
  const byPhase = new Map<string, number>();
  encounters.forEach((e) => {
    const p = e.currentPhase || 'triage';
    byPhase.set(p, (byPhase.get(p) || 0) + 1);
  });
  const topPhases = [...byPhase.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <div className="cos-content">
      <div className="cos-section-title"><ChartNoAxesCombined size={16} color="var(--sky-500)" /> Analytics</div>
      <div className="cos-section-sub">Computed live from your encounter list and engine counters — no mocked figures.</div>
      <div className="cos-stats-row">
        <StatMini num={encounters.length} label="Total encounters" tone="sky" />
        <StatMini num={stats.patients} label="Active patients" tone="green" />
        <StatMini num={stats.pendingDecisions} label="Pending decisions" tone="amber" />
        <StatMini num={stats.resultsReady} label="Results ready" tone="blue" />
        <StatMini num={stats.critical} label="Critical" tone="red" />
      </div>
      <div className="cos-card">
        <div className="cos-card-title"><ListChecks size={13} /> Encounters by phase</div>
        {topPhases.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--f-400)' }}>No encounters to aggregate yet.</div>
        ) : (
          topPhases.map(([phase, count]) => (
            <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--f-100)', fontSize: 12 }}>
              <span style={{ flex: 1, fontWeight: 600, textTransform: 'capitalize' }}>{phase}</span>
              <div style={{ flex: 2, height: 8, background: 'var(--sky-50)', borderRadius: 99 }}>
                <div style={{ height: 8, width: `${Math.round((count / encounters.length) * 100)}%`, background: 'var(--sky-400)', borderRadius: 99 }} />
              </div>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--f-500)', minWidth: 24, textAlign: 'right' }}>{count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatMini({ num, label, tone }: { num: number | string; label: string; tone: string }) {
  return (
    <div className="cos-stat-card">
      <div className={`cos-stat-icon ${tone}`}><Activity size={18} /></div>
      <div>
        <div className="cos-stat-num">{num}</div>
        <div className="cos-stat-label">{label}</div>
      </div>
    </div>
  );
}

function hourGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function first(name: string): string {
  return name.split(' ')[0] || 'Clinician';
}

const SUPPORTED_ROLES = ['clinical', 'telemedicine', 'teaching', 'clinical_leadership'] as const;

export default function CosClinicianWorkspace() {
  return (
    <WorkspaceGuard supportedRoles={SUPPORTED_ROLES}>
      <CosShell />
    </WorkspaceGuard>
  );
}