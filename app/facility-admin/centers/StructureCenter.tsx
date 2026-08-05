'use client';

import { useState } from 'react';
import { Boxes } from 'lucide-react';
import { C, Card, AddBtn, ActionBtn } from '../ui';
import { STRUCTURE_KINDS } from '../centers';
import type { StructureEntry } from '../structure-types';

// Center — Organization Structure (Book V §2). The administrator creates
// departments, units, clinics, wards, theatres, laboratories and pharmacies —
// never by hand-typing staff, but by defining the constitutional structure the
// hospital already has.

const KIND_ICONS: Record<string, string> = {
  departments: '🏢', units: '🧩', wards: '🛏️', clinics: '🩺', theatres: '🔬', laboratories: '🧪', pharmacies: '💊',
};

export function StructureCenter({ entries, onChange }: { entries: StructureEntry[]; onChange: (next: StructureEntry[]) => void }) {
  const [kind, setKind] = useState('departments');
  const [name, setName] = useState('');
  const add = () => {
    if (!name.trim()) return;
    onChange([...entries, { id: `str-${Date.now()}`, kind: kind as StructureEntry['kind'], name: name.trim(), active: true, createdAt: Date.now() }]);
    setName('');
  };
  const active = entries.filter(e => e.kind === kind);
  return (
    <Card title="Organizational Structure" subtitle="Departments, units, clinics, wards, theatres, laboratories, pharmacies — the skeleton of the digital hospital.">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {STRUCTURE_KINDS.map(k => (
          <button key={k.id} onClick={() => setKind(k.id)} style={{ padding: '7px 12px', borderRadius: 20, border: 'none', background: kind === k.id ? C.sky : '#eef2f7', color: kind === k.id ? '#fff' : C.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
            {KIND_ICONS[k.id]} {k.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={`New ${kind.replace(/s$/, '')} name`} style={{ flex: 1, height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 12, outline: 'none' }} />
        <AddBtn label={`Add ${kind.replace(/s$/, '')}`} onClick={add} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {active.map(e => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
            <span>{KIND_ICONS[kind]}</span>
            <span style={{ fontWeight: 700, flex: 1 }}>{e.name}</span>
            <span style={{ color: e.active ? C.green : C.slate, fontWeight: 600 }}>{e.active ? '● Active' : '○ Inactive'}</span>
            <ActionBtn label={e.active ? 'Deactivate' : 'Activate'} onClick={() => onChange(entries.map(x => x.id === e.id ? { ...x, active: !x.active } : x))} />
            <ActionBtn label="Remove" danger onClick={() => onChange(entries.filter(x => x.id !== e.id))} />
          </div>
        ))}
        {active.length === 0 && <div style={{ fontSize: 12, color: C.muted, padding: '12px 0' }}>No {kind} yet. Create the structure above.</div>}
      </div>
    </Card>
  );
}