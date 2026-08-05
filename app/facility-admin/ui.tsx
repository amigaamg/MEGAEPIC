'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const C = {
  bg: '#eff4fa',
  card: '#ffffff',
  border: '#e3e9f2',
  navy: '#0b2c4d',
  slate: '#5b6b80',
  muted: '#8a98ac',
  sky: '#0ea5e9',
  skyLight: '#e0f2fe',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  purple: '#8b5cf6',
};

export const S = {
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 },
  title: { fontSize: 15, fontWeight: 800, color: C.navy, margin: 0 },
  sub: { fontSize: 11, color: C.muted, marginTop: 2 },
  banner: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, marginBottom: 16 },
  input: { width: '100%', height: 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 12px', fontSize: 12, outline: 'none', background: '#fff', color: C.navy, fontFamily: 'inherit' },
};

export function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', background: C.bg, color: C.slate, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>{children}</div>;
}

export function Kpi({ label, value, color = C.navy, accent }: { label: string; value: string | number; color?: string; accent?: 'green' | 'red' | 'amber' }) {
  const tone = accent === 'green' ? C.green : accent === 'red' ? C.red : accent === 'amber' ? C.amber : color;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', minWidth: 150 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: tone }}>{value}</div>
      <div style={{ fontSize: 10, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
    </div>
  );
}

export function Card({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={S.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={S.title}>{title}</div>
          {subtitle && <div style={S.sub}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone = status === 'active' || status === 'connected' || status === 'operational' || status === 'live' || status === 'installed' ? C.green : status === 'suspended' || status === 'deactivated' || status === 'error' || status === 'faulted' || status === 'critical' ? C.red : C.amber;
  return <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${tone}18`, color: tone, textTransform: 'capitalize', textAlign: 'center' }}>{status}</span>;
}

export function ActionBtn({ label, onClick, danger, primary }: { label: string; onClick: () => void; danger?: boolean; primary?: boolean }) {
  return <button onClick={onClick} style={{ padding: '5px 10px', borderRadius: 6, border: primary ? 'none' : `1px solid ${danger ? C.red : C.border}`, background: primary ? C.sky : '#fff', color: primary ? '#fff' : danger ? C.red : C.slate, fontSize: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{label}</button>;
}

export function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{label}</button>;
}

export function NumberFields({ title, sub, fields, onSave }: { title: string; sub: string; fields: { id: string; label: string; value: number }[]; onSave: (patch: any) => void }) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const apply = () => {
    const patch: any = {};
    Object.entries(vals).forEach(([k, v]) => { const n = Number(v); if (!Number.isNaN(n)) patch[k] = n; });
    setVals({});
    onSave(patch);
  };
  return (
    <Card title={title} subtitle={sub}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {fields.map(f => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: C.muted }}>{f.label}</div><div style={{ fontSize: 16, fontWeight: 700 }}>{f.value}</div></div>
            <input value={vals[f.id] ?? ''} placeholder={String(f.value)} onChange={e => setVals({ ...vals, [f.id]: e.target.value })} style={{ width: 80, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, padding: '0 8px', outline: 'none' }} />
          </div>
        ))}
      </div>
      <button onClick={apply} style={{ marginTop: 14, padding: '8px 18px', borderRadius: 8, border: 'none', background: C.sky, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Update</button>
    </Card>
  );
}

export function Spinner({ label }: { label: string }) {
  return <div style={{ minHeight: 300, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', color: C.slate, fontSize: 13 }}><Loader2 className="spin" size={28} color={C.sky} /><span>{label}</span></div>;
}