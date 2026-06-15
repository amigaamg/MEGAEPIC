'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';
import { LEOPOLD_MANEUVERS } from '@/lib/history-engine/examination/leopoldManeuversRegistry';

function NumberField({ label, unit, value, onChange, min, max, step }: {
  label: string; unit?: string; value: number | null; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-secondary)] mb-1 block">
        {label} {unit && <span className="text-[var(--text-muted)]">({unit})</span>}
      </label>
      <input type="number" value={value ?? ''} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }}
        min={min} max={max} step={step ?? 1}
        className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-teal-500" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-secondary)] mb-1 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-teal-500">
        {options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1).replace(/_/g, ' ')}</option>)}
      </select>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-secondary)] mb-1 block">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-teal-500" />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-secondary)] mb-1 block">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-teal-500 resize-y" />
    </div>
  );
}

function Collapsible({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
        {title}
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

export default function ObstetricExaminationSection() {
  const exam = useHistoryStore(s => s.obstetricExamination);
  const setLeopoldManeuver = useHistoryStore(s => s.setLeopoldManeuver);
  const setObstetricExamination = useHistoryStore(s => s.setObstetricExamination);

  const leopold = exam?.leopold;

  const sectionHeading = (label: string, color?: string) => (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-1 h-5 rounded-full ${color ?? 'bg-teal-400'}`} />
      <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">{label}</h3>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Obstetric Examination</h2>
      </div>

      {/* Basic Measurements */}
      <Collapsible title="Measurements" defaultOpen>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <NumberField label="Fundal Height" unit="cm" value={exam?.fundalHeight ?? null} onChange={v => {
            const e = exam ? { ...exam, fundalHeight: v } : null;
            if (e) setObstetricExamination(e);
          }} min={10} max={60} step={0.5} />
          <NumberField label="Abdominal Girth" unit="cm" value={exam?.abdominalGirth ?? null} onChange={v => {
            const e = exam ? { ...exam, abdominalGirth: v } : null;
            if (e) setObstetricExamination(e);
          }} min={40} max={200} step={0.5} />
        </div>
        <TextAreaField label="Scar Inspection" value={exam?.scarInspection ?? ''} onChange={v => {
          const e = exam ? { ...exam, scarInspection: v } : null;
          if (e) setObstetricExamination(e);
        }} placeholder="Describe any abdominal scars..." />
        <TextAreaField label="Uterine Activity" value={exam?.uterineActivity ?? ''} onChange={v => {
          const e = exam ? { ...exam, uterineActivity: v } : null;
          if (e) setObstetricExamination(e);
        }} placeholder="Frequency, duration, strength of contractions..." />
        <TextAreaField label="Pelvic Examination" value={exam?.pelvicExamination ?? ''} onChange={v => {
          const e = exam ? { ...exam, pelvicExamination: v } : null;
          if (e) setObstetricExamination(e);
        }} placeholder="Cervical os, effacement, dilation, station..." />
      </Collapsible>

      {/* Leopold's Maneuvers */}
      <Collapsible title="Leopold's Maneuvers" defaultOpen>
        <div className="space-y-4">
          {LEOPOLD_MANEUVERS.filter(m => m.id !== 'summary').map((maneuver) => (
            <div key={maneuver.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-[var(--text-primary)]">{maneuver.label}</span>
                <span className="text-[10px] text-[var(--text-muted)]">({maneuver.subtitle})</span>
              </div>
              <TextField label="Findings"
                value={leopold ? String(leopold[`${maneuver.id}Maneuver` as keyof typeof leopold] ?? '') : ''}
                onChange={v => setLeopoldManeuver(`${maneuver.id}Maneuver` as any, v)}
                placeholder={`Describe ${maneuver.label.toLowerCase()} findings...`} />
            </div>
          ))}
        </div>
      </Collapsible>

      {/* Summary Fields */}
      <Collapsible title="Summary" defaultOpen>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <SelectField label="Fetal Lie" value={leopold?.fetalLie ?? 'longitudinal'} onChange={v => setLeopoldManeuver('fetalLie', v)}
            options={['longitudinal', 'transverse', 'oblique', 'unstable']} />
          <SelectField label="Presentation" value={leopold?.presentation ?? 'cephalic'} onChange={v => setLeopoldManeuver('presentation', v)}
            options={['cephalic', 'breech', 'shoulder', 'face', 'compound']} />
          <TextField label="Position" value={leopold?.position ?? ''} onChange={v => setLeopoldManeuver('position', v)}
            placeholder="e.g. LOA, ROA..." />
          <SelectField label="Engagement" value={leopold?.engagement ?? 'not_engaged'} onChange={v => setLeopoldManeuver('engagement', v)}
            options={['not_engaged', 'engaged', 'fixed']} />
          <NumberField label="Fetal Heart Rate" unit="bpm" value={leopold?.fetalHeartRate ?? null}
            onChange={v => setLeopoldManeuver('fetalHeartRate', v)} min={60} max={220} />
          <TextField label="Contractions" value={leopold?.contractions ?? ''} onChange={v => setLeopoldManeuver('contractions', v)}
            placeholder="Frequency, duration, strength..." />
          <TextField label="Amniotic Fluid" value={leopold?.amnioticFluid ?? ''} onChange={v => setLeopoldManeuver('amnioticFluid', v)}
            placeholder="Adequate, reduced, or excessive..." />
        </div>
      </Collapsible>
    </div>
  );
}
