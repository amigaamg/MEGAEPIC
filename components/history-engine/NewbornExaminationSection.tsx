'use client';
import { useState } from 'react';
import { useHistoryStore } from '@/lib/history-engine/useHistoryStore';

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

function CheckboxField({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="accent-teal-500" />
      {label}
    </label>
  );
}

function TextAreaField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-secondary)] mb-1 block">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
        className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-teal-500 resize-y" />
    </div>
  );
}

export default function NewbornExaminationSection() {
  const exam = useHistoryStore(s => s.newbornExamination);
  const setNewbornVital = useHistoryStore(s => s.setNewbornVital);
  const setNewbornHeadToToe = useHistoryStore(s => s.setNewbornHeadToToe);

  const vitals = exam?.vitals;
  const h2t = exam?.headToToe;
  const ga = exam?.gestationalAgeAssessment ?? '';
  const oa = exam?.overallAssessment ?? '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-teal-400 rounded-full" />
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Newborn Examination</h2>
      </div>

      {/* Vitals */}
      <Collapsible title="Vitals" defaultOpen>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <NumberField label="Temperature" unit="℃" value={vitals?.temperature ?? null} onChange={v => setNewbornVital('temperature', v)} min={30} max={42} step={0.1} />
          <NumberField label="Heart Rate" unit="bpm" value={vitals?.heartRate ?? null} onChange={v => setNewbornVital('heartRate', v)} min={60} max={220} />
          <NumberField label="Respiratory Rate" unit="breaths/min" value={vitals?.respiratoryRate ?? null} onChange={v => setNewbornVital('respiratoryRate', v)} min={20} max={80} />
          <NumberField label="Oxygen Saturation" unit="%" value={vitals?.oxygenSaturation ?? null} onChange={v => setNewbornVital('oxygenSaturation', v)} min={50} max={100} />
          <NumberField label="Blood Sugar" unit="mmol/L" value={vitals?.bloodSugar ?? null} onChange={v => setNewbornVital('bloodSugar', v)} min={0} max={30} step={0.1} />
        </div>
      </Collapsible>

      {/* Head & Neck */}
      <Collapsible title="Head & Neck">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <NumberField label="Head Circumference" unit="cm" value={h2t?.headCircumference ?? null} onChange={v => setNewbornHeadToToe('headCircumference', String(v))} min={20} max={50} step={0.1} />
          <SelectField label="Fontanelles" value={h2t?.fontanelles ?? 'normal'} onChange={v => setNewbornHeadToToe('fontanelles', v)} options={['normal', 'bulging', 'sunken']} />
          <SelectField label="Sutures" value={h2t?.sutures ?? 'normal'} onChange={v => setNewbornHeadToToe('sutures', v)} options={['normal', 'overlapping', 'widely_separated']} />
          <CheckboxField label="Caput Succedaneum" checked={h2t?.caput ?? false} onChange={v => setNewbornHeadToToe('caput', v)} />
          <CheckboxField label="Cephalhematoma" checked={h2t?.cephalhematoma ?? false} onChange={v => setNewbornHeadToToe('cephalhematoma', v)} />
          <TextField label="Eyes" value={h2t?.eyes ?? ''} onChange={v => setNewbornHeadToToe('eyes', v)} />
          <TextField label="Ears" value={h2t?.ears ?? ''} onChange={v => setNewbornHeadToToe('ears', v)} />
          <TextField label="Nose" value={h2t?.nose ?? ''} onChange={v => setNewbornHeadToToe('nose', v)} />
          <TextField label="Mouth" value={h2t?.mouth ?? ''} onChange={v => setNewbornHeadToToe('mouth', v)} />
          <SelectField label="Palate" value={h2t?.palate ?? 'intact'} onChange={v => setNewbornHeadToToe('palate', v)} options={['intact', 'cleft']} />
          <TextField label="Neck" value={h2t?.neck ?? ''} onChange={v => setNewbornHeadToToe('neck', v)} />
        </div>
      </Collapsible>

      {/* Chest */}
      <Collapsible title="Chest">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <TextField label="Chest Shape" value={h2t?.chestShape ?? ''} onChange={v => setNewbornHeadToToe('chestShape', v)} />
          <CheckboxField label="Breast Engorgement" checked={h2t?.breastEngorgement ?? false} onChange={v => setNewbornHeadToToe('breastEngorgement', v)} />
          <TextField label="Chest Auscultation" value={h2t?.chestAuscultation ?? ''} onChange={v => setNewbornHeadToToe('chestAuscultation', v)} />
        </div>
      </Collapsible>

      {/* Abdomen */}
      <Collapsible title="Abdomen">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <TextField label="Abdomen" value={h2t?.abdomen ?? ''} onChange={v => setNewbornHeadToToe('abdomen', v)} />
          <SelectField label="Umbilical Cord" value={h2t?.umbilicalCord ?? 'normal'} onChange={v => setNewbornHeadToToe('umbilicalCord', v)} options={['normal', 'infected', 'bleeding', 'hernia']} />
          <CheckboxField label="Liver Palpable" checked={h2t?.liverPalpable ?? false} onChange={v => setNewbornHeadToToe('liverPalpable', v)} />
          <CheckboxField label="Spleen Palpable" checked={h2t?.spleenPalpable ?? false} onChange={v => setNewbornHeadToToe('spleenPalpable', v)} />
          <SelectField label="Anus" value={h2t?.anus ?? 'normal'} onChange={v => setNewbornHeadToToe('anus', v)} options={['normal', 'imperforate', 'stenosis']} />
        </div>
      </Collapsible>

      {/* Genitalia */}
      <Collapsible title="Genitalia">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <TextField label="Genitalia" value={h2t?.genitalia ?? ''} onChange={v => setNewbornHeadToToe('genitalia', v)} />
          <CheckboxField label="Testes Descended" checked={h2t?.testesDescended ?? false} onChange={v => setNewbornHeadToToe('testesDescended', v)} />
          <TextField label="Labia" value={h2t?.labia ?? ''} onChange={v => setNewbornHeadToToe('labia', v)} />
        </div>
      </Collapsible>

      {/* Limbs & Spine */}
      <Collapsible title="Limbs & Spine">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <TextField label="Spine" value={h2t?.spine ?? ''} onChange={v => setNewbornHeadToToe('spine', v)} />
          <SelectField label="Hips" value={h2t?.hips ?? 'normal'} onChange={v => setNewbornHeadToToe('hips', v)} options={['normal', 'dysplasia', 'dislocated']} />
          <TextField label="Limbs" value={h2t?.limbs ?? ''} onChange={v => setNewbornHeadToToe('limbs', v)} />
          <TextField label="Digits" value={h2t?.digits ?? ''} onChange={v => setNewbornHeadToToe('digits', v)} />
          <TextField label="Palmar Creases" value={h2t?.palmarCreases ?? ''} onChange={v => setNewbornHeadToToe('palmarCreases', v)} />
        </div>
      </Collapsible>

      {/* Skin */}
      <Collapsible title="Skin">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <SelectField label="Skin Color" value={h2t?.skinColor ?? 'pink'} onChange={v => setNewbornHeadToToe('skinColor', v)} options={['pink', 'pale', 'jaundiced', 'cyanosed', 'mottled']} />
          <TextField label="Rash" value={h2t?.rash ?? ''} onChange={v => setNewbornHeadToToe('rash', v)} />
          <TextField label="Birth Marks" value={h2t?.birthMarks ?? ''} onChange={v => setNewbornHeadToToe('birthMarks', v)} />
          <CheckboxField label="Vernix Caseosa" checked={h2t?.vernix ?? false} onChange={v => setNewbornHeadToToe('vernix', v)} />
          <CheckboxField label="Lanugo" checked={h2t?.lanugo ?? false} onChange={v => setNewbornHeadToToe('lanugo', v)} />
        </div>
      </Collapsible>

      {/* Neurological */}
      <Collapsible title="Neurological">
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <SelectField label="Tone" value={h2t?.tone ?? 'normal'} onChange={v => setNewbornHeadToToe('tone', v)} options={['normal', 'hypertonic', 'hypotonic', 'floppy']} />
            <SelectField label="Cry" value={h2t?.cry ?? 'normal'} onChange={v => setNewbornHeadToToe('cry', v)} options={['normal', 'weak', 'high_pitched', 'absent']} />
            <SelectField label="Activity" value={h2t?.activity ?? 'active'} onChange={v => setNewbornHeadToToe('activity', v)} options={['active', 'lethargic', 'irritable']} />
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <span className="text-xs font-medium text-[var(--text-secondary)] mb-2 block">Reflexes</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <SelectField label="Moro" value={(h2t as any)?.moro ?? 'present'} onChange={v => setNewbornHeadToToe('moro', v)} options={['present', 'absent', 'asymmetric']} />
              <SelectField label="Rooting" value={(h2t as any)?.rooting ?? 'present'} onChange={v => setNewbornHeadToToe('rooting', v)} options={['present', 'absent']} />
              <SelectField label="Sucking" value={(h2t as any)?.sucking ?? 'present'} onChange={v => setNewbornHeadToToe('sucking', v)} options={['present', 'absent']} />
              <SelectField label="Grasping" value={(h2t as any)?.grasping ?? 'present'} onChange={v => setNewbornHeadToToe('grasping', v)} options={['present', 'absent']} />
              <SelectField label="Stepping" value={(h2t as any)?.stepping ?? 'present'} onChange={v => setNewbornHeadToToe('stepping', v)} options={['present', 'absent']} />
              <SelectField label="Babinski" value={(h2t as any)?.babinski ?? 'present'} onChange={v => setNewbornHeadToToe('babinski', v)} options={['present', 'absent']} />
            </div>
          </div>
        </div>
      </Collapsible>

      {/* Gestational Age Assessment */}
      <Collapsible title="Gestational Age Assessment">
        <TextAreaField label="Assessment (Ballard / Dubowitz)" value={ga} onChange={v => {
          const val = exam ? { ...exam, gestationalAgeAssessment: v } : null;
          if (val) useHistoryStore.getState().setNewbornExamination(val);
        }} />
      </Collapsible>

      {/* Overall Assessment */}
      <Collapsible title="Overall Assessment">
        <TextAreaField label="Overall Assessment" value={oa} onChange={v => {
          const val = exam ? { ...exam, overallAssessment: v } : null;
          if (val) useHistoryStore.getState().setNewbornExamination(val);
        }} />
      </Collapsible>
    </div>
  );
}
