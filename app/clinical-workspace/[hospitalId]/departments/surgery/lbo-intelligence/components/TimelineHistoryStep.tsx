'use client';
import React, { useMemo } from 'react';
import type { HistoryData, RegistrationData, SymptomStream, StreamRole } from '@/src/engine/domains/lbo/lbo-records';
import { synthesizeStreamsFromHistory, syncHistoryFromStreams } from '@/src/engine/domains/lbo/lbo-records';
import { compileTimelineNarrative } from '@/src/engine/domains/lbo/reasoning/lbo-history-reasoning';

// ── Gender helpers (inline to avoid import cycle) ──────────────────────────

type G = { sub: string; obj: string; pos: string; title: string };
const GENDER_MAP: Record<string, G> = {
  male: { sub: 'He', obj: 'him', pos: 'his', title: 'gentleman' },
  female: { sub: 'She', obj: 'her', pos: 'her', title: 'lady' },
  other: { sub: 'They', obj: 'them', pos: 'their', title: 'patient' },
};

// ── UI Helpers ─────────────────────────────────────────────────────────────

function Chk({ label, checked, onChange, cl }: { label: string; checked: boolean; onChange: (v: boolean) => void; cl?: string }) {
  return (
    <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-all ${checked ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 ring-1 ring-gray-200'} ${cl || ''}`}>
      <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
      {checked ? '✓' : '○'} {label}
    </label>
  );
}

function Pill({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}
      style={active && color ? { backgroundColor: color, borderColor: color } : {}}>
      {label}
    </button>
  );
}

function ModuleCard({ title, icon, children, open, onToggle }: { title: string; icon: string; children: React.ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span>{icon}</span>
        <span className="flex-1">{title}</span>
        <span className={`transform transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {open && <div className="p-3 space-y-2 bg-white">{children}</div>}
    </div>
  );
}

// ── Symptom Type Config ────────────────────────────────────────────────────

interface SymptomTypeConfig {
  type: SymptomStream['type'];
  label: string;
  icon: string;
  defaultDay: number;
  defaultRole: StreamRole;
}

const SYMPTOM_TYPES: SymptomTypeConfig[] = [
  { type: 'pain', label: 'Abdominal pain', icon: '🔥', defaultDay: 1, defaultRole: 'first' },
  { type: 'distension', label: 'Abdominal distension', icon: '🎈', defaultDay: 1, defaultRole: 'progressive' },
  { type: 'vomiting', label: 'Vomiting', icon: '🤢', defaultDay: 2, defaultRole: 'secondary' },
  { type: 'constipation', label: 'Constipation', icon: '💩', defaultDay: 2, defaultRole: 'late' },
  { type: 'flatus_loss', label: 'Failure to pass flatus', icon: '💨', defaultDay: 3, defaultRole: 'late' },
  { type: 'nausea', label: 'Nausea', icon: '😖', defaultDay: 2, defaultRole: 'secondary' },
  { type: 'fever', label: 'Fever', icon: '🌡️', defaultDay: 3, defaultRole: 'complication' },
  { type: 'weight_loss', label: 'Weight loss', icon: '⬇️', defaultDay: 0, defaultRole: 'complication' },
  { type: 'bleeding', label: 'Rectal bleeding', icon: '🩸', defaultDay: 0, defaultRole: 'complication' },
];

const ROLE_OPTIONS: { value: StreamRole; label: string }[] = [
  { value: 'first', label: 'First' },
  { value: 'dominant', label: 'Dominant' },
  { value: 'progressive', label: 'Progressive' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'late', label: 'Late' },
  { value: 'complication', label: 'Complication' },
];

const ROLE_COLORS: Record<StreamRole, string> = {
  first: '#3b82f6', dominant: '#8b5cf6', progressive: '#f59e0b',
  secondary: '#10b981', late: '#ef4444', complication: '#dc2626',
};

// ── Main Component ─────────────────────────────────────────────────────────

interface Props {
  data: HistoryData;
  onChange: (d: HistoryData) => void;
  registration?: RegistrationData;
}

let streamIdCounter = 0;
function newStreamId() { return `ts_${++streamIdCounter}_${Date.now().toString(36)}`; }

export default function TimelineHistoryStep({ data, onChange, registration }: Props) {
  const streams = data.symptomStreams || [];

  const sync = (newStreams: SymptomStream[]) => {
    onChange(syncHistoryFromStreams({ ...data, symptomStreams: newStreams }, newStreams));
  };
  const set = <K extends keyof HistoryData>(k: K, v: HistoryData[K]) => onChange({ ...data, [k]: v });

  const addStream = (type: SymptomStream['type']) => {
    const cfg = SYMPTOM_TYPES.find(s => s.type === type)!;
    const newStream: SymptomStream = {
      id: newStreamId(), type, label: cfg.label, present: true,
      onset_day: cfg.defaultDay, role: cfg.defaultRole,
    };
    // If this is the first symptom, set role to 'first'
    if (streams.length === 0) newStream.role = 'first';
    sync([...streams, newStream]);
  };

  const removeStream = (id: string) => sync(streams.filter(s => s.id !== id));

  const updateStream = (id: string, patch: Partial<SymptomStream>) =>
    sync(streams.map(s => s.id === id ? { ...s, ...patch } : s));

  // Auto-narrative
  const p = registration ? (GENDER_MAP[registration.sex] || GENDER_MAP.other) : GENDER_MAP.other;
  const narrative = useMemo(() => streams.length > 0 ? compileTimelineNarrative(streams, p, data) : null, [streams, p, data]);

  // Module toggle state
  const [openModules, setOpenModules] = React.useState<Record<string, boolean>>({});
  const toggleModule = (key: string) => setOpenModules(p => ({ ...p, [key]: !p[key] }));

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Page heading ───────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">🧠 Disease Timeline Builder</h3>
          <p className="text-xs text-gray-500">Build the chronological symptom evolution graph</p>
        </div>
      </div>

      {/* ── Story Context: Onset + Function ───────────────── */}
      <div className="border border-purple-200 bg-purple-50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-purple-700">📋 Onset Context & Story</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-gray-500 mb-1">What was the patient doing when it started?</p>
            <input type="text" value={data.contextAtOnset} onChange={e => set('contextAtOnset', e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 w-full bg-white"
              placeholder="e.g. working on farm, resting at home, lifting a heavy object" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 mb-1">What was the very first sensation noticed?</p>
            <input type="text" value={data.firstSensation} onChange={e => set('firstSensation', e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 w-full bg-white"
              placeholder="e.g. bloating, fullness, mild ache, feeling 'off'" />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1">How has the illness affected daily function?</p>
          <textarea value={data.functionalImpact} onChange={e => set('functionalImpact', e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 w-full bg-white resize-none" rows={2}
            placeholder="e.g. unable to walk comfortably, stopped working, can no longer ride motorcycle to clinic, bedbound since onset" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Eating</p>
            <div className="flex gap-1">
              {(['normal', 'reduced', 'stopped'] as const).map(v => (
                <button key={v} type="button" onClick={() => set('eatingImpact', v)}
                  className={`text-[10px] px-2 py-1 rounded border ${data.eatingImpact === v ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                  {v === 'normal' ? 'Normal' : v === 'reduced' ? 'Reduced' : 'Stopped'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Sleep</p>
            <div className="flex gap-1">
              {(['normal', 'disturbed', 'unable'] as const).map(v => (
                <button key={v} type="button" onClick={() => set('sleepImpact', v)}
                  className={`text-[10px] px-2 py-1 rounded border ${data.sleepImpact === v ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                  {v === 'normal' ? 'Normal' : v === 'disturbed' ? 'Disturbed' : 'Unable'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Work / Daily Activity</p>
            <div className="flex gap-1">
              {(['normal', 'limited', 'stopped'] as const).map(v => (
                <button key={v} type="button" onClick={() => set('workCapacity', v)}
                  className={`text-[10px] px-2 py-1 rounded border ${data.workCapacity === v ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                  {v === 'normal' ? 'Normal' : v === 'limited' ? 'Limited' : 'Stopped'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Step 1: Chief Complaint Timeline ────────────────── */}
      <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-700 mb-2">1. Chief Complaint Timeline</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {SYMPTOM_TYPES.map(cfg => {
            const active = streams.some(s => s.type === cfg.type && s.present);
            return (
              <Pill key={cfg.type} label={`${cfg.icon} ${cfg.label}`}
                active={active}
                onClick={() => active ? removeStream(streams.find(s => s.type === cfg.type)!.id) : addStream(cfg.type)}
                color={active ? ROLE_COLORS[streams.find(s => s.type === cfg.type)?.role || 'secondary'] : undefined} />
            );
          })}
        </div>

        {/* Timeline Table */}
        {streams.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="text-left px-2 py-1 font-medium text-blue-800">Symptom</th>
                  <th className="text-left px-2 py-1 font-medium text-blue-800">Day</th>
                  <th className="text-left px-2 py-1 font-medium text-blue-800">Role</th>
                  <th className="text-left px-2 py-1 font-medium text-blue-800">Status</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody>
                {streams.filter(s => s.present).sort((a, b) => a.onset_day - b.onset_day || 0).map(s => (
                  <tr key={s.id} className="border-t border-blue-100">
                    <td className="px-2 py-1 text-gray-700">{(SYMPTOM_TYPES.find(t => t.type === s.type)?.icon || '')} {s.label}</td>
                    <td className="px-2 py-1">
                      <select value={s.onset_day} onChange={e => updateStream(s.id, { onset_day: parseInt(e.target.value) || 0 })}
                        className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white w-16">
                        {[0,1,2,3,4,5,6,7,10,14].map(d => <option key={d} value={d}>Day {d}{d===0?' (prior)':''}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <select value={s.role} onChange={e => updateStream(s.id, { role: e.target.value as StreamRole })}
                        className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white">
                        {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ backgroundColor: `${ROLE_COLORS[s.role]}20`, color: ROLE_COLORS[s.role] }}>
                        {s.present ? 'Active' : 'Denied'}
                      </span>
                    </td>
                    <td className="px-1 py-1">
                      <button onClick={() => removeStream(s.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Negative pack — one-click deny all unselected */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          <button type="button" onClick={() => {
            const deniedSymptoms = SYMPTOM_TYPES
              .filter(cfg => !streams.some(s => s.type === cfg.type && s.present))
              .map(cfg => ({ id: newStreamId(), type: cfg.type, label: cfg.label, present: false, denied: true, onset_day: 0, role: 'complication' as StreamRole }));
            sync([...streams, ...deniedSymptoms]);
          }} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
            ➖ Deny all unselected
          </button>
          <button type="button" onClick={() => {
            const present = streams.filter(s => s.present);
            const denied = streams.filter(s => !s.present && s.denied);
            sync(present);
          }} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
            🗑️ Clear denied
          </button>
        </div>
      </div>

      {/* ── Auto-Narrative Preview ──────────────────────────── */}
      {narrative && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-[10px] font-semibold text-green-700 mb-1">📖 Auto-Generated HPI</p>
          <p className="text-xs text-green-800 leading-relaxed">{narrative}</p>
        </div>
      )}

      {/* ── Detail Modules (expandable) ─────────────────────── */}
      <div className="space-y-2">
        {/* 2. Pain Evolution */}
        {streams.some(s => s.type === 'pain' && s.present) && (
          <ModuleCard title="2. Pain Evolution" icon="🔥" open={!!openModules['pain']} onToggle={() => toggleModule('pain')}>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Onset speed</p>
                <select value={streams.find(s => s.type === 'pain')?.onset_speed || ''}
                  onChange={e => { const s = streams.find(s => s.type === 'pain'); if (s) updateStream(s.id, { onset_speed: e.target.value as any }); }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full bg-white">
                  <option value="">Select</option>
                  <option value="sudden">Sudden</option>
                  <option value="acute">Acute</option>
                  <option value="subacute">Subacute</option>
                  <option value="gradual">Gradual</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Initial character</p>
                <select value={data.painEvolution?.characterInitial || ''}
                  onChange={e => set('painEvolution', { ...(data.painEvolution || {} as any), characterInitial: e.target.value as any })}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full bg-white">
                  <option value="">Select</option>
                  <option value="colicky">Colicky</option>
                  <option value="constant">Constant</option>
                  <option value="sharp">Sharp</option>
                  <option value="burning">Burning</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Current character</p>
                <select value={streams.find(s => s.type === 'pain')?.character || ''}
                  onChange={e => { const s = streams.find(s => s.type === 'pain'); if (s) updateStream(s.id, { character: e.target.value as any }); }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full bg-white">
                  <option value="">Select</option>
                  <option value="colicky">Colicky</option>
                  <option value="constant">Constant</option>
                  <option value="colicky_then_constant">Colicky → Constant</option>
                  <option value="sharp">Sharp</option>
                  <option value="burning">Burning</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Chk label="Become continuous" checked={data.painEvolution?.hasBecomeContinuous || false} onChange={v => set('painEvolution', { ...data.painEvolution!, hasBecomeContinuous: v })} />
              <Chk label="Become generalized" checked={data.painEvolution?.hasGeneralized || false} onChange={v => set('painEvolution', { ...data.painEvolution!, hasGeneralized: v })} />
              <Chk label="Worse with movement" checked={data.painEvolution?.worseWithMovement || false} onChange={v => set('painEvolution', { ...data.painEvolution!, worseWithMovement: v })} />
              <Chk label="Better with position" checked={data.painEvolution?.betterWithPosition || false} onChange={v => set('painEvolution', { ...data.painEvolution!, betterWithPosition: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Initial severity (1-10)</p>
                <input type="range" min={1} max={10} value={data.painEvolution?.severityInitial || 5}
                  onChange={e => set('painEvolution', { ...data.painEvolution!, severityInitial: parseInt(e.target.value) })}
                  className="w-full" />
                <span className="text-xs text-gray-600 ml-1">{data.painEvolution?.severityInitial || 5}/10</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Current severity (1-10)</p>
                <input type="range" min={1} max={10} value={data.painEvolution?.severityCurrent || 5}
                  onChange={e => set('painEvolution', { ...data.painEvolution!, severityCurrent: parseInt(e.target.value) })}
                  className="w-full" />
                <span className="text-xs text-gray-600 ml-1">{data.painEvolution?.severityCurrent || 5}/10</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Location</p>
                <input type="text" value={streams.find(s => s.type === 'pain')?.location || ''}
                  onChange={e => { const s = streams.find(s => s.type === 'pain'); if (s) updateStream(s.id, { location: e.target.value }); }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full" placeholder="e.g. Central abdomen" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Radiation</p>
                <input type="text" value={streams.find(s => s.type === 'pain')?.radiation || ''}
                  onChange={e => { const s = streams.find(s => s.type === 'pain'); if (s) updateStream(s.id, { radiation: e.target.value }); }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full" placeholder="e.g. To back" />
              </div>
            </div>
          </ModuleCard>
        )}

        {/* 3. Distension Evolution */}
        {streams.some(s => s.type === 'distension' && s.present) && (
          <ModuleCard title="3. Distension Evolution" icon="🎈" open={!!openModules['distension']} onToggle={() => toggleModule('distension')}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Progression rate</p>
                <select value={data.distensionEvolution?.progressionRate || 'slow_days'}
                  onChange={e => set('distensionEvolution', { ...data.distensionEvolution!, progressionRate: e.target.value as any })}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full bg-white">
                  <option value="rapid_hours">Rapid (hours)</option>
                  <option value="slow_days">Slow (days)</option>
                  <option value="insidious_weeks">Insidious (weeks)</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Severity</p>
                <select value={streams.find(s => s.type === 'distension')?.severity || 5}
                  onChange={e => { const s = streams.find(s => s.type === 'distension'); if (s) updateStream(s.id, { severity: parseInt(e.target.value) }); }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full bg-white">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}/10</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Chk label="Affecting breathing" checked={data.distensionEvolution?.affectingBreathing || false} onChange={v => set('distensionEvolution', { ...data.distensionEvolution!, affectingBreathing: v })} />
              <Chk label="Pain with distension" checked={data.distensionEvolution?.painWithDistension || false} onChange={v => set('distensionEvolution', { ...data.distensionEvolution!, painWithDistension: v })} />
              <Chk label="Relieved by vomiting" checked={data.distensionEvolution?.distensionRelievedByVomiting || false} onChange={v => set('distensionEvolution', { ...data.distensionEvolution!, distensionRelievedByVomiting: v })} />
            </div>
          </ModuleCard>
        )}

        {/* 4. Vomiting Evolution */}
        {streams.some(s => s.type === 'vomiting' && s.present) && (
          <ModuleCard title="4. Vomiting Evolution" icon="🤢" open={!!openModules['vomiting']} onToggle={() => toggleModule('vomiting')}>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Current content</p>
                <select value={data.vomitingEvolution?.contentCurrent || 'food'}
                  onChange={e => set('vomitingEvolution', { ...data.vomitingEvolution!, contentCurrent: e.target.value as any })}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full bg-white">
                  <option value="food">Food / undigested</option>
                  <option value="bilious">Bilious (green/yellow)</option>
                  <option value="faeculent">Faeculent (brown)</option>
                  <option value="blood_stained">Blood-stained</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Frequency</p>
                <input type="text" value={streams.find(s => s.type === 'vomiting')?.frequency || ''}
                  onChange={e => { const s = streams.find(s => s.type === 'vomiting'); if (s) updateStream(s.id, { frequency: e.target.value }); }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full" placeholder="e.g. 5 times/day" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Chk label="Frequency increasing" checked={data.vomitingEvolution?.frequencyIncreasing || false} onChange={v => set('vomitingEvolution', { ...data.vomitingEvolution!, frequencyIncreasing: v })} />
              <Chk label="Nausea before vomiting" checked={data.vomitingEvolution?.nauseaBeforeVomiting || false} onChange={v => set('vomitingEvolution', { ...data.vomitingEvolution!, nauseaBeforeVomiting: v })} />
              <Chk label="Vomiting relieves pain" checked={data.vomitingEvolution?.vomitingRelievesPain || false} onChange={v => set('vomitingEvolution', { ...data.vomitingEvolution!, vomitingRelievesPain: v })} />
            </div>
          </ModuleCard>
        )}

        {/* 5. Bowel Function */}
        {(streams.some(s => (s.type === 'constipation' || s.type === 'flatus_loss') && s.present)) && (
          <ModuleCard title="5. Bowel Function Timeline" icon="💩" open={!!openModules['bowel']} onToggle={() => toggleModule('bowel')}>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Last normal stool (days)</p>
                <input type="number" min={0} value={data.bowelFunction?.lastNormalStoolDays || 0}
                  onChange={e => set('bowelFunction', { ...data.bowelFunction!, lastNormalStoolDays: parseInt(e.target.value) || 0 })}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Last stool passed (days)</p>
                <input type="number" min={0} value={data.bowelFunction?.lastStoolDays || 0}
                  onChange={e => set('bowelFunction', { ...data.bowelFunction!, lastStoolDays: parseInt(e.target.value) || 0 })}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Last flatus (days)</p>
                <input type="number" min={0} value={data.bowelFunction?.lastFlatusDays || 0}
                  onChange={e => set('bowelFunction', { ...data.bowelFunction!, lastFlatusDays: parseInt(e.target.value) || 0 })}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Chk label="Stool caliber reduced (pencil stools)" checked={data.bowelFunction?.stoolCaliberReduced || false} onChange={v => set('bowelFunction', { ...data.bowelFunction!, stoolCaliberReduced: v })} cl="text-[10px]" />
              <Chk label="Alternating constipation/diarrhea" checked={data.bowelFunction?.alternatingConstipationDiarrhea || false} onChange={v => set('bowelFunction', { ...data.bowelFunction!, alternatingConstipationDiarrhea: v })} />
              <Chk label="Progressive constipation (months)" checked={data.bowelFunction?.progressiveConstipationMonths || false} onChange={v => set('bowelFunction', { ...data.bowelFunction!, progressiveConstipationMonths: v })} />
              <Chk label="Straining" checked={data.bowelFunction?.straining || false} onChange={v => set('bowelFunction', { ...data.bowelFunction!, straining: v })} />
              <Chk label="Incomplete evacuation" checked={data.bowelFunction?.incompleteEvacuation || false} onChange={v => set('bowelFunction', { ...data.bowelFunction!, incompleteEvacuation: v })} />
            </div>
          </ModuleCard>
        )}

        {/* 6. Cancer Screening */}
        <ModuleCard title="6. Colorectal Cancer Screening" icon="🔬" open={!!openModules['cancer']} onToggle={() => toggleModule('cancer')}>
          <div className="flex flex-wrap gap-1.5">
            <Chk label="Unintentional weight loss" checked={data.cancerScreening?.weightLoss || false} onChange={v => set('cancerScreening', { ...data.cancerScreening!, weightLoss: v })} />
            <Chk label="Appetite loss" checked={data.cancerScreening?.appetiteLoss || false} onChange={v => set('cancerScreening', { ...data.cancerScreening!, appetiteLoss: v })} />
            <Chk label="Blood per rectum" checked={data.cancerScreening?.bloodPerRectum || false} onChange={v => set('cancerScreening', { ...data.cancerScreening!, bloodPerRectum: v })} />
            <Chk label="Pencil stools" checked={data.cancerScreening?.pencilStools || false} onChange={v => set('cancerScreening', { ...data.cancerScreening!, pencilStools: v })} />
            <Chk label="Progressive constipation" checked={data.cancerScreening?.progressiveConstipation || false} onChange={v => set('cancerScreening', { ...data.cancerScreening!, progressiveConstipation: v })} />
            <Chk label="Family history CRC" checked={data.cancerScreening?.familyHistoryCRC || false} onChange={v => set('cancerScreening', { ...data.cancerScreening!, familyHistoryCRC: v })} />
          </div>
          {data.cancerScreening?.weightLoss && (
            <div className="mt-2">
              <p className="text-[10px] text-gray-500 mb-1">Weight loss amount</p>
              <input type="text" value={data.cancerScreening?.weightLossAmount || ''}
                onChange={e => set('cancerScreening', { ...data.cancerScreening!, weightLossAmount: e.target.value })}
                className="text-xs border border-gray-300 rounded px-2 py-1 w-32" placeholder="e.g. 5 kg in 3 mo" />
            </div>
          )}
        </ModuleCard>

        {/* 7. Volvulus Risk */}
        <ModuleCard title="7. Volvulus Risk Factors" icon="🔄" open={!!openModules['volvulus']} onToggle={() => toggleModule('volvulus')}>
          <div className="flex flex-wrap gap-1.5">
            <Chk label="Previous similar attacks" checked={data.volvulusRisk?.previousAttacks || false} onChange={v => set('volvulusRisk', { ...data.volvulusRisk!, previousAttacks: v })} />
            <Chk label="Chronic constipation" checked={data.volvulusRisk?.chronicConstipation || false} onChange={v => set('volvulusRisk', { ...data.volvulusRisk!, chronicConstipation: v })} />
            <Chk label="High-fiber diet" checked={data.volvulusRisk?.highFiberDiet || false} onChange={v => set('volvulusRisk', { ...data.volvulusRisk!, highFiberDiet: v })} />
            <Chk label="Psychiatric disease" checked={data.volvulusRisk?.psychiatricDisease || false} onChange={v => set('volvulusRisk', { ...data.volvulusRisk!, psychiatricDisease: v })} />
            <Chk label="Parkinson's disease" checked={data.volvulusRisk?.parkinsons || false} onChange={v => set('volvulusRisk', { ...data.volvulusRisk!, parkinsons: v })} />
            <Chk label="Institutionalized" checked={data.volvulusRisk?.institutionalized || false} onChange={v => set('volvulusRisk', { ...data.volvulusRisk!, institutionalized: v })} />
          </div>
        </ModuleCard>

        {/* 8. Ischemia / Perforation Screen */}
        <ModuleCard title="8. 🚨 Ischemia / Perforation Screen" icon="🚨" open={!!openModules['ischemia']} onToggle={() => toggleModule('ischemia')}>
          <div className="grid grid-cols-2 gap-1">
            <Chk label="Pain now constant" checked={data.ischemiaPerforation?.painNowConstant || false} onChange={v => set('ischemiaPerforation', { ...data.ischemiaPerforation!, painNowConstant: v })} />
            <Chk label="Pain worse than before" checked={data.ischemiaPerforation?.painWorseThanBefore || false} onChange={v => set('ischemiaPerforation', { ...data.ischemiaPerforation!, painWorseThanBefore: v })} />
            <Chk label="Fever" checked={data.ischemiaPerforation?.fever || false} onChange={v => set('ischemiaPerforation', { ...data.ischemiaPerforation!, fever: v })} />
            <Chk label="Rigors" checked={data.ischemiaPerforation?.rigors || false} onChange={v => set('ischemiaPerforation', { ...data.ischemiaPerforation!, rigors: v })} />
            <Chk label="Confusion" checked={data.ischemiaPerforation?.confusion || false} onChange={v => set('ischemiaPerforation', { ...data.ischemiaPerforation!, confusion: v })} />
            <Chk label="Reduced urine output" checked={data.ischemiaPerforation?.reducedUrine || false} onChange={v => set('ischemiaPerforation', { ...data.ischemiaPerforation!, reducedUrine: v })} />
            <Chk label="Unable to stand" checked={data.ischemiaPerforation?.unableToStand || false} onChange={v => set('ischemiaPerforation', { ...data.ischemiaPerforation!, unableToStand: v })} />
            <Chk label="Severe weakness" checked={data.ischemiaPerforation?.severeWeakness || false} onChange={v => set('ischemiaPerforation', { ...data.ischemiaPerforation!, severeWeakness: v })} />
            <Chk label="Tachycardia (reported)" checked={data.ischemiaPerforation?.tachycardia || false} onChange={v => set('ischemiaPerforation', { ...data.ischemiaPerforation!, tachycardia: v })} />
            <Chk label="Hypotension (reported)" checked={data.ischemiaPerforation?.hypotension || false} onChange={v => set('ischemiaPerforation', { ...data.ischemiaPerforation!, hypotension: v })} />
          </div>
        </ModuleCard>

        {/* 9. Dehydration / Renal */}
        <ModuleCard title="9. Dehydration / Renal Assessment" icon="💧" open={!!openModules['dehydration']} onToggle={() => toggleModule('dehydration')}>
          <div className="flex flex-wrap gap-1.5">
            <Chk label="Thirst" checked={data.dehydrationRenal?.thirst || false} onChange={v => set('dehydrationRenal', { ...data.dehydrationRenal!, thirst: v })} />
            <Chk label="Dry mouth" checked={data.dehydrationRenal?.dryMouth || false} onChange={v => set('dehydrationRenal', { ...data.dehydrationRenal!, dryMouth: v })} />
            <Chk label="Dizziness" checked={data.dehydrationRenal?.dizziness || false} onChange={v => set('dehydrationRenal', { ...data.dehydrationRenal!, dizziness: v })} />
            <Chk label="Reduced urine output" checked={data.dehydrationRenal?.reducedUrine || false} onChange={v => set('dehydrationRenal', { ...data.dehydrationRenal!, reducedUrine: v })} />
            <Chk label="Dark urine" checked={data.dehydrationRenal?.darkUrine || false} onChange={v => set('dehydrationRenal', { ...data.dehydrationRenal!, darkUrine: v })} />
            <Chk label="Syncope / near-syncope" checked={data.dehydrationRenal?.syncope || false} onChange={v => set('dehydrationRenal', { ...data.dehydrationRenal!, syncope: v })} />
          </div>
        </ModuleCard>
      </div>

      {/* ── 10. Past Medical & Surgical History ─────────────── */}
      <div className="border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">10. Past Medical & Surgical History</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Medical history</p>
            <input type="text" value={data.pmh} onChange={e => set('pmh', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 w-full" placeholder="e.g. DM, HTN, CKD" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Surgical history</p>
            <input type="text" value={data.surgicalHistory} onChange={e => set('surgicalHistory', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 w-full" placeholder="e.g. Appendectomy 2018" />
          </div>
        </div>
      </div>

      {/* ── 11. Drug + Family + Social ──────────────────────── */}
      <div className="border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">11. Drug & Social History</p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Current medications</p>
            <input type="text" value={data.drugHistory} onChange={e => set('drugHistory', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 w-full" placeholder="Drugs" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Family history</p>
            <input type="text" value={data.familyHistory} onChange={e => set('familyHistory', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 w-full" placeholder="Family history" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Social history</p>
            <input type="text" value={data.socialHistory} onChange={e => set('socialHistory', e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 w-full" placeholder="Smoking, alcohol, mobility" />
          </div>
        </div>
      </div>

      {/* ── 12. Focused ROS (3 zones) ───────────────────────── */}
      <div className="border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">12. Focused ROS</p>
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-medium text-amber-700 mb-1">A. Confirmatory (LBO-supporting)</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'nausea', label: 'Nausea' },
                { key: 'anorexia', label: 'Anorexia' },
                { key: 'bloating', label: 'Bloating' },
                { key: 'early_satiety', label: 'Early satiety' },
              ].map(item => {
                const ros = data.focusedRos?.confirmedLbo || [];
                const active = ros.includes(item.key);
                return <Chk key={item.key} label={item.label} checked={active} onChange={v => {
                  const cur = data.focusedRos?.confirmedLbo || [];
                  set('focusedRos', { ...data.focusedRos!, confirmedLbo: v ? [...cur, item.key] : cur.filter(k => k !== item.key) });
                }} />;
              })}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-red-700 mb-1">B. Red Flag Systemic</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'fever', label: 'Fever' },
                { key: 'chills', label: 'Chills/rigors' },
                { key: 'weakness', label: 'Weakness' },
                { key: 'dizziness', label: 'Dizziness' },
                { key: 'oliguria', label: 'Oliguria' },
                { key: 'confusion', label: 'Confusion' },
              ].map(item => {
                const ros = data.focusedRos?.redFlagSystemic || [];
                const active = ros.includes(item.key);
                return <Chk key={item.key} label={item.label} checked={active} onChange={v => {
                  const cur = data.focusedRos?.redFlagSystemic || [];
                  set('focusedRos', { ...data.focusedRos!, redFlagSystemic: v ? [...cur, item.key] : cur.filter(k => k !== item.key) });
                }} />;
              })}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-600 mb-1">C. Alternative Diagnosis Filter</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'dysuria', label: 'Dysuria / frequency' },
                { key: 'chest_pain', label: 'Chest pain' },
                { key: 'dyspnea', label: 'Dyspnea' },
                { key: 'headache', label: 'Headache' },
                { key: 'back_pain', label: 'Back pain' },
              ].map(item => {
                const ros = data.focusedRos?.alternativeDiagnosis || [];
                const active = ros.includes(item.key);
                return <Chk key={item.key} label={item.label} checked={active} onChange={v => {
                  const cur = data.focusedRos?.alternativeDiagnosis || [];
                  set('focusedRos', { ...data.focusedRos!, alternativeDiagnosis: v ? [...cur, item.key] : cur.filter(k => k !== item.key) });
                }} />;
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
