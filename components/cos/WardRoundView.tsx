'use client';

// AMEXAN COS — Ward Round (No. 2)
// A workflow engine, not a list. Assembles the round, prioritises patients,
// generates a verifiable DRAFT summary, and routes every action through the
// authorization engine + executor. No emoji; Lucide icons only.
import { useEffect, useMemo, useState } from 'react';
import {
  BedDouble, Radio, CheckCircle2, Circle, AlertTriangle,
  ClipboardList, FlaskConical, HeartPulse,
  Plus, Square, Clock, Activity, ShieldAlert, ShieldCheck,
  Sparkles, X, FilePlus2, ListChecks, type LucideIcon,
} from 'lucide-react';
import type { SavedEncounter } from '@/lib/amexan/encounter/encounterPersistence';
import type { LiveWorkspace } from './useClinicalWorkspace';
import {
  assembleRound, defaultReviewInterval, draftNoteFrom,
  type RoundBucket, type RoundPatient,
} from '@/lib/amexan/cos/wardRound';
import type { AmexanNoteStructured, ClinicalNote, ClinicalOrder, RoundReview, TimelineEvent, TriggerFlag } from '@/lib/amexan/cos/types';
import type { ActionGrant } from '@/lib/amexan/cos/authorization';
import { newId, now } from '@/lib/amexan/cos/executor';

export interface WardRoundProps {
  ws: LiveWorkspace;
  encounters: SavedEncounter[];
  onOpenPatient: (e: SavedEncounter) => void;
  toast: (msg: string, kind?: 'ok' | 'err') => void;
}

const BUCKET_META: Record<RoundBucket, { label: string; tone: string; icon: LucideIcon }> = {
  immediate: { label: 'Immediate attention', tone: 'red', icon: AlertTriangle },
  new: { label: 'New admissions', tone: 'amber', icon: FilePlus2 },
  decision: { label: 'Require decision', tone: 'blue', icon: ListChecks },
  stable: { label: 'Stable follow-up', tone: 'green', icon: CheckCircle2 },
};

function encounterToRoundPatient(e: SavedEncounter): RoundPatient {
  const phase = (e.currentPhase || 'triage').toLowerCase();
  const triggers: TriggerFlag[] = [];
  if (/critical|emergency|icu/i.test(phase)) triggers.push({ severy: 'critical', label: 'Critical phase' });
  if (/result|lab|imaging/i.test(phase)) triggers.push({ severy: 'warning', label: 'Investigation pending' });
  return {
    patientId: e.encounterId,
    encounterId: e.encounterId,
    mrn: e.hospitalNumber,
    name: e.patientName,
    age: 0,
    sex: 'undisclosed',
    bed: `Bed ${Math.abs(e.encounterId.charCodeAt(0) % 24) + 1}`,
    status: e.status === 'completed' ? 'discharged' : 'active',
    bucket: 'stable',
    priorityReason: [],
    triggers,
    observations: [],
    episodeDay: 0,
    sinceLast: [],
    lastReview: e.updatedAt,
  };
}

export default function WardRoundView({ ws, encounters, toast }: WardRoundProps) {
  const [roundActive, setRoundActive] = useState(false);
  const [filter, setFilter] = useState<RoundBucket | 'all'>('all');
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [noteDraft, setNoteDraft] = useState<AmexanNoteStructured>({});
  const [plan, setPlan] = useState('');
  const [pendingOrders, setPendingOrders] = useState<{ name: string; kind: ClinicalOrder['kind'] }[]>([]);
  const [orderInput, setOrderInput] = useState('');
  const [showTimeline, setShowTimeline] = useState<string | null>(null);

  const assembly = useMemo(() => {
    const input = encounters.filter((e) => e.status === 'active').map(encounterToRoundPatient);
    return assembleRound(input);
  }, [encounters]);

  const display = filter === 'all' ? assembly.patients : assembly.patients.filter((p) => p.bucket === filter);
  const activePatient = assembly.patients.find((p) => p.patientId === activePatientId) || null;

  const startRound = () => {
    setRoundActive(true);
    setReviewed(new Set());
    setActivePatientId(null);
    toast('Ward round assembled from the current ward census.', 'ok');
  };

  const endRound = () => {
    setRoundActive(false);
    setActivePatientId(null);
    toast('Round ended. Summary and timeline persisted.', 'ok');
  };

  const openPatient = (p: RoundPatient) => {
    if (!roundActive) return;
    setActivePatientId(p.patientId ?? p.encounterId ?? null);
    setNoteDraft(draftNoteFrom(p.sinceLast, p.vitals, p.triggers.map((t) => t.label)));
    setPlan('');
    setPendingOrders([]);
  };

  const addOrder = () => {
    if (!orderInput.trim() || !activePatient) return;
    setPendingOrders((prev) => [...prev, { name: orderInput.trim(), kind: inferKind(orderInput.trim()) }]);
    setOrderInput('');
  };

  const submitReview = async (mode: 'verify' | 'sign') => {
    if (!activePatient || !roundActive) return;
    const action: ActionGrant = mode === 'sign' ? 'note.sign' : 'note.create';
    const actor = { id: ws.clinicianId, roleId: ws.roleId, isConsultant: ws.isConsultant, credential: ws.credential };
    const decision = ws.authorizer.authorize({ action, actor, env: ws.env });
    if (!decision.allowed) {
      toast(`Denied: ${decision.reason}`, 'err');
      return;
    }
    const note: ClinicalNote = {
      id: newId('note'),
      patientId: activePatient.patientId,
      encounterId: activePatient.encounterId,
      contextId: `ward_round_${now()}`,
      type: 'ward_round',
      phase: mode === 'sign' ? 'signed' : 'verified',
      clinician: { id: ws.clinicianId, name: ws.clinicianName, roleId: ws.roleId },
      structured: { ...noteDraft, plan: plan || noteDraft.plan },
      createdAt: now(),
      updatedAt: now(),
      env: ws.env,
    };
    const res = await ws.executor.saveNote(note, action, { actor, env: ws.env });
    if (res.ok) {
      // Persist orders created during this review.
      for (const o of pendingOrders) {
        const order: ClinicalOrder = {
          id: newId('ord'),
          patientId: activePatient.patientId,
          encounterId: activePatient.encounterId,
          clinicianId: ws.clinicianId,
          clinicianName: ws.clinicianName,
          contextId: `ward_round_${now()}`,
          kind: o.kind,
          name: o.name,
          priority: 'routine',
          status: 'active',
          createdAt: now(),
          updatedAt: now(),
          env: ws.env,
        };
        await ws.executor.createOrder(order, { actor, env: ws.env });
      }
      const review: RoundReview = {
        patientId: activePatient.patientId || activePatient.encounterId || '',
        encounterId: activePatient.encounterId,
        reviewedAt: now(),
        reviewer: { id: ws.clinicianId, name: ws.clinicianName },
        noteId: note.id,
        decisions: [],
        status: 'reviewed',
      };
      await ws.executor.recordDecision(review, { actor, env: ws.env });
      setReviewed((prev) => new Set(prev).add(activePatient.patientId ?? activePatient.encounterId ?? ''));
      toast(mode === 'sign' ? `Review signed & documented for ${activePatient.name}.` : 'Review verified. Ready to sign.', 'ok');
      setActivePatientId(null);
    } else {
      toast(`Note not persisted: ${res.reason}`, 'err');
    }
  };

  return (
    <div className="cos-content">
      <div className="cos-section-title">
        <BedDouble size={16} color="var(--sky-500)" /> Ward Round
      </div>
      <div className="cos-section-sub">
        {assembly.counts.total} patients in census · {assembly.pendingRequiringDecision} require review
      </div>

      {/* Command Center */}
      <div className="cos-card" style={{ border: roundActive ? '2px solid var(--sky-400)' : '1px solid var(--f-200)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--sky-700)' }}>{ws.wardName || 'Current Ward'}</span>
            {roundActive && (
              <span className="cos-round-badge"><span className="cos-dot" /> Round active · {reviewed.size}/{assembly.counts.total}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!roundActive ? (
              <button className="cos-btn primary" onClick={startRound}><PlayIcon size={13} /> Start Round</button>
            ) : (
              <button className="cos-btn danger" onClick={endRound}><Square size={13} /> End Round</button>
            )}
          </div>
        </div>

        <div className="cos-chip-row" style={{ marginTop: 12, marginBottom: 0 }}>
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>All ({assembly.counts.total})</Chip>
          {(Object.keys(BUCKET_META) as RoundBucket[]).map((b) => {
            const BucketMeta = BUCKET_META[b];
            const BucketIcon = BucketMeta.icon;
            return (
              <Chip key={b} active={filter === b} onClick={() => setFilter(b)}>
                <BucketIcon size={11} /> {BucketMeta.label} ({assembly.counts[b]})
              </Chip>
            );
          })}
        </div>
      </div>

      {/* Patient cards */}
      {!roundActive ? (
        <div className="cos-card">
          <div style={{ textAlign: 'center', padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sky-700)', marginBottom: 6 }}>Start the round to begin</div>
            <div style={{ fontSize: 12, color: 'var(--f-500)', marginBottom: 16 }}>
              AMEXAN assembles the ward census, prioritises patients, and opens each clinical workspace in turn.
            </div>
            <button className="cos-btn primary" onClick={startRound}><BedDouble size={13} /> Start Ward Round</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {display.map((p) => {
            const meta = BUCKET_META[p.bucket];
            const isReviewed = reviewed.has(p.patientId ?? p.encounterId ?? '');
            const isActive = (p.patientId ?? p.encounterId) === activePatientId;
            return (
              <div key={p.patientId ?? p.encounterId} style={{
                border: `1.5px solid ${isActive ? 'var(--sky-500)' : isReviewed ? 'var(--green)' : 'var(--f-200)'}`,
                borderRadius: 'var(--r)', background: 'var(--white)', padding: 14,
                opacity: isReviewed ? .78 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`cos-pill ${meta.tone}`}><meta.icon size={10} /> {meta.label}</span>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--f-500)' }}>{p.mrn || '—'} · {p.bed}</span>
                  <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <span className="cos-pill gray">{p.triggers.length} trigger(s)</span>
                    {isReviewed && <span className="cos-pill green"><CheckCircle2 size={10} /> Reviewed</span>}
                  </span>
                </div>

                {p.triggers.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {p.triggers.map((t, i) => (
                      <span key={i} className={`cos-pill ${t.severy === 'critical' ? 'red' : 'amber'}`}>
                        {t.severy === 'critical' ? <AlertTriangle size={10} /> : <Clock size={10} />} {t.label}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {!isReviewed && (
                    <button className="cos-btn primary" onClick={() => openPatient(p)}>
                      <StethoscopeIcon size={13} /> Review
                    </button>
                  )}
                  <button className="cos-btn ghost" onClick={() => setShowTimeline((prev) => (prev === (p.encounterId ?? p.patientId ?? null) ? null : (p.encounterId ?? p.patientId ?? null)))}>
                    <Clock size={13} /> Timeline
                  </button>
                  {isReviewed && (
                    <button className="cos-btn ghost" onClick={() => { setReviewed((prev) => { const n = new Set(prev); n.delete(p.patientId ?? p.encounterId ?? ''); return n; }); }}>
                      <Circle size={13} /> Reopen
                    </button>
                  )}
                </div>

                {showTimeline === p.encounterId && (
                  <PatientTimelineMini ws={ws} patientId={p.patientId} encounterId={p.encounterId} />
                )}
              </div>
            );
          })}

          {display.length === 0 && (
            <div className="cos-empty" style={{ padding: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sky-700)' }}>No patients in this bucket</div>
            </div>
          )}
        </div>
      )}

      {/* Review Workspace */}
      {roundActive && activePatient && (
        <div className="cos-card" style={{ border: '2px solid var(--sky-300)', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>{activePatient.name}</span>
            <span style={{ fontSize: 11, color: 'var(--f-500)' }}>{activePatient.mrn || '—'} · {activePatient.bed}</span>
            <span style={{ marginLeft: 'auto' }}>
              <button className="cos-btn ghost" onClick={() => setActivePatientId(null)}><X size={13} /> Close</button>
            </span>
          </div>

          {/* Since-last / observations strip */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <span className="cos-pill blue"><Clock size={10} /> Next review {defaultReviewInterval(activePatient)}</span>
            <span className="cos-pill amber"><Activity size={10} /> Vitals pending</span>
          </div>

          {/* DRAFT NOTE — clinician verifies; never auto-signs */}
          <div style={{ background: 'var(--sky-50)', border: '1px solid var(--sky-200)', borderRadius: 'var(--r)', padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--sky-600)', marginBottom: 8 }}>
              <Sparkles size={12} /> Draft clinical summary — verify, modify, then sign
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <NoteField label="Subjective" value={noteDraft.subjective || ''} onChange={(v) => setNoteDraft((p) => ({ ...p, subjective: v }))} />
              <NoteField label="Objective" value={noteDraft.objective || ''} onChange={(v) => setNoteDraft((p) => ({ ...p, objective: v }))} />
              <NoteField label="Assessment" value={noteDraft.assessment || ''} onChange={(v) => setNoteDraft((p) => ({ ...p, assessment: v }))} />
              <NoteField label="Plan / Today's orders" value={plan} onChange={setPlan} />
            </div>
          </div>

          {/* Universal Orders inline */}
          <div style={{ marginBottom: 12 }}>
            <div className="cos-card-title"><ClipboardList size={13} /> Universal Orders</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input className="cos-input" style={{ flex: 1 }} placeholder="e.g. CBC, CXR, U&E, IV Ceftriaxone…"
                value={orderInput} onChange={(e) => setOrderInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addOrder()} />
              <button className="cos-btn" onClick={addOrder}><Plus size={13} /> Add</button>
            </div>
            {pendingOrders.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {pendingOrders.map((o, i) => (
                  <span key={i} className="cos-pill purple"><FlaskConical size={10} /> {o.name}</span>
                ))}
              </div>
            )}
          </div>

          {/* Decision buttons — authorization aware */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <AuthButton action="note.create" label="Verify (unverified draft)" ws={ws} onClick={() => submitReview('verify')} icon={ShieldCheck} />
            <AuthButton action="note.sign" label="Accept & Sign" ws={ws} onClick={() => submitReview('sign')} icon={ShieldAlert} primary />
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`cos-chip ${active ? 'active' : ''}`} onClick={onClick}>{children}</button>
  );
}

function NoteField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="cos-field">
      <label>{label}</label>
      <textarea className="cos-textarea" value={value} onChange={(e) => onChange(e.target.value)} style={{ minHeight: 64 }} />
    </div>
  );
}

function AuthButton({ action, label, ws, onClick, icon: Icon, primary }: {
  action: ActionGrant; label: string; ws: LiveWorkspace; onClick: () => void; icon: LucideIcon; primary?: boolean;
}) {
  const decision = ws.authorizer.authorize({
    action,
    actor: { id: ws.clinicianId, roleId: ws.roleId, isConsultant: ws.isConsultant, credential: ws.credential },
    env: ws.env,
  });
  if (!decision.allowed) return null; // the engine decides what is rendered
  return (
    <button className={`cos-btn ${primary ? 'primary' : 'ghost'}`} onClick={onClick}>
      <Icon size={13} /> {label}
    </button>
  );
}

function PatientTimelineMini({ ws, patientId, encounterId }: { ws: LiveWorkspace; patientId?: string; encounterId?: string }) {
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);
  const key = patientId || encounterId || 'global';
  useEffect(() => {
    let alive = true;
    ws.executor.loadTimeline(key)
      .then((l) => { if (alive) setEvents(l); })
      .catch(() => { if (alive) setEvents([]); });
    return () => { alive = false; };
  }, [ws.executor, key]);
  return (
    <div style={{ marginTop: 10, paddingLeft: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--f-500)', marginBottom: 6 }}>Timeline</div>
      {events === null ? (
        <div style={{ fontSize: 11, color: 'var(--f-400)' }}>Loading…</div>
      ) : events.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--f-400)' }}>No events yet — actions you take here appear here.</div>
      ) : (
        events.slice().reverse().slice(0, 8).map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '2px 0', fontSize: 11 }}>
            <span style={{ fontFamily: 'monospace', color: 'var(--f-400)', fontSize: 10 }}>
              {new Date(ev.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ fontWeight: 600 }}>{ev.title}</span>
            {ev.detail && <span style={{ color: 'var(--f-500)' }}>· {ev.detail}</span>}
          </div>
        ))
      )}
    </div>
  );
}

function PlayIcon({ size }: { size?: number }) { return <Radio size={size || 13} />; }
function StethoscopeIcon({ size }: { size?: number }) { return <HeartPulse size={size || 13} />; }

function inferKind(name: string): ClinicalOrder['kind'] {
  const n = name.toLowerCase();
  if (/(ct|mri|x-ray|ultrasound|usg|cxr|imaging)/.test(n)) return 'imaging';
  if (/(cbc|fbc|electrolyte|u&e|glucose|hb|culture|esr|crp|urine|stool|lab)/.test(n)) return 'lab';
  if (/(tab|mg|g |ml |iv|infusion|syrup|ointment)/.test(n)) return 'medication';
  if (/(dress|suture|aspir|drain|biopsy|catheter)/.test(n)) return 'procedure';
  if (/(diet|nil|oral|fluids)/.test(n)) return 'diet';
  return 'service';
}

export function bucketOrder(b: RoundBucket): number { return ['immediate', 'new', 'decision', 'stable'].indexOf(b); }