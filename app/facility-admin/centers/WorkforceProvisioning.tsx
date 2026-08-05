'use client';

import { useState } from 'react';
import { UserPlus, KeyRound, Loader2, Copy } from 'lucide-react';
import { C, Card, ActionBtn, AddBtn } from '../ui';
import type { StructureEntry } from '../structure-types';

// Center — Workforce Provisioning (Book V, Principle: Staff Activate, never
// register). The Facility Administrator creates the hospital's people.
//
//  Source 1 · AUTO-CREATE — pick a department + role + count, create that many
//    real Auth logins in one click. Every account resolves to its constitutional
//    dashboard by role (executive → /facility-admin, clinical → /workspace, …).
//  Source 2 · ROSTER & LINKS — load the org's provisioned members and copy a
//    login route for each. Sub-admins (hospital_admin, department_head, …) are
//    created here too and delegated permissions by role.
//
//  Principle: staff are ACTIVATED by the administrator, not self-registered.

const DEPARTMENTS = [
  'Surgery', 'Medicine', 'Paediatrics', 'Obstetrics & Gynaecology',
  'Emergency', 'Anaesthesia', 'Laboratory', 'Radiology', 'Pharmacy',
  'Human Resources', 'ICT',
];

const ROLE_OPTIONS: { role: string; label: string; family: string }[] = [
  { role: 'facility_administrator', label: 'Facility Administrator', family: 'executive' },
  { role: 'hospital_admin', label: 'Hospital Admin (Sub-Admin)', family: 'executive' },
  { role: 'department_head', label: 'Department Head', family: 'department' },
  { role: 'ward_in_charge', label: 'Ward In-charge', family: 'department' },
  { role: 'consultant', label: 'Consultant', family: 'clinical' },
  { role: 'registrar', label: 'Registrar', family: 'clinical' },
  { role: 'medical_officer', label: 'Medical Officer', family: 'clinical' },
  { role: 'clinical_officer', label: 'Clinical Officer', family: 'clinical' },
  { role: 'surgeon', label: 'Surgeon', family: 'clinical' },
  { role: 'anaesthetist', label: 'Anaesthetist', family: 'clinical' },
  { role: 'nurse', label: 'Nurse', family: 'nursing' },
  { role: 'midwife', label: 'Midwife', family: 'nursing' },
  { role: 'pharmacist', label: 'Pharmacist', family: 'pharmacy' },
  { role: 'lab_technologist', label: 'Lab Technologist', family: 'laboratory' },
  { role: 'medical_laboratory_scientist', label: 'Medical Lab Scientist', family: 'laboratory' },
  { role: 'radiographer', label: 'Radiographer', family: 'radiology' },
  { role: 'radiologist', label: 'Radiologist', family: 'radiology' },
  { role: 'finance_officer', label: 'Finance Officer', family: 'finance' },
  { role: 'hr_officer', label: 'HR Officer', family: 'hr' },
  { role: 'ict_officer', label: 'ICT Officer', family: 'ict' },
  { role: 'researcher', label: 'Researcher', family: 'research' },
  { role: 'medical_student', label: 'Medical Student', family: 'teaching' },
  { role: 'telemedicine_officer', label: 'Telemedicine Officer', family: 'telemedicine' },
  { role: 'community_health_officer', label: 'Community Health Officer', family: 'community_health' },
];

const ORDINALS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

const lbl: React.CSSProperties = {
  fontSize: 10, color: C.muted, display: 'block', marginBottom: 4,
  textTransform: 'uppercase', fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: '100%', height: 34, borderRadius: 8, border: `1px solid ${C.border}`,
  padding: '0 10px', fontSize: 12, outline: 'none', background: '#fff', color: C.navy, fontFamily: 'inherit',
};

function deptName(structures: StructureEntry[]): string {
  const d = structures.find(s => s.kind === 'departments');
  return d?.name || DEPARTMENTS[0];
}

export function WorkforceProvisioning({
  orgId,
  structures,
  onProvisioned,
}: {
  orgId: string;
  structures: StructureEntry[];
  onProvisioned?: () => void;
}) {
  const [mode, setMode] = useState<'auto' | 'roster'>('auto');
  const [department, setDepartment] = useState(() => deptName(structures));
  const [role, setRole] = useState('medical_officer');
  const [count, setCount] = useState(4);
  const [seedName, setSeedName] = useState('');
  const [busy, setBusy] = useState(false);
  const [listBusy, setListBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'ok' | 'err'>('ok');
  const [lastAccounts, setLastAccounts] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[] | null>(null);

  const label = (r: string) => ROLE_OPTIONS.find(o => o.role === r)?.label || r.replace(/_/g, ' ');
  const show = (m: string, t: 'ok' | 'err' = 'ok') => { setMessage(m); setTone(t); };

  async function createAuto() {
    setBusy(true); setMessage(''); setLastAccounts([]);
    const base = seedName.trim() || label(role);
    const rows = Array.from({ length: count }, (_, i) => ({
      fullName: seedName.trim() ? base : `${base} ${ORDINALS[Math.min(i, ORDINALS.length - 1)]}`,
      role,
      department,
      departmentId: department,
    }));
    try {
      const res = await fetch('/api/facility/workforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, staff: rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create staff');
      setLastAccounts(data?.accounts || []);
      if (data?.errors?.length) show(data.errors.join(' · '), 'err');
      else show(`Created ${data.created} account(s).`, 'ok');
      onProvisioned?.();
    } catch (err: any) {
      show(err?.message || 'Request failed', 'err');
    } finally {
      setBusy(false);
    }
  }

  async function copyLogin(a: any) {
    const payload = `${a.email} — AMEXAN login → ${window.location.origin}${a.route}`;
    try {
      await navigator.clipboard?.writeText(payload);
      show(`Login link copied for ${a.fullName} (→ ${a.route})`, 'ok');
    } catch {
      show(payload, 'ok');
    }
  }

  async function loadRoster() {
    setListBusy(true);
    try {
      const res = await fetch(`/api/facility/workforce?orgId=${encodeURIComponent(orgId)}`);
      const data = await res.json();
      setRoster(data?.accounts || []);
    } catch {
      setRoster([]);
    } finally {
      setListBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => { setMode('auto'); setMessage(''); }}
          style={{ padding: '7px 14px', borderRadius: 20, border: 'none', background: mode === 'auto' ? C.sky : '#eef2f7', color: mode === 'auto' ? '#fff' : C.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserPlus size={13} /> Auto-Create by Department
        </button>
        <button onClick={() => { setMode('roster'); setMessage(''); setRoster(null); }}
          style={{ padding: '7px 14px', borderRadius: 20, border: 'none', background: mode === 'roster' ? C.sky : '#eef2f7', color: mode === 'roster' ? '#fff' : C.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <KeyRound size={14} /> Invitation Links &amp; Roster
        </button>
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: tone === 'err' ? `${C.red}12` : `${C.green}12`, color: tone === 'err' ? C.red : C.green }}>
          {message}
        </div>
      )}

      {mode === 'auto' && (
        <>
          <Card title="Auto-create Staff Logins" subtitle="One department + one role + a count → that many real Auth logins, each routed to its own constitutional workspace.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={lbl}>Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)} style={inputStyle}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Role (drives their dashboard)</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                  {ROLE_OPTIONS.map(o => <option key={o.role} value={o.role}>{o.label} — {o.family}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>How many?</label>
                <input type="number" min={1} max={50} value={count} onChange={e => setCount(Math.max(1, Number(e.target.value) || 1))} style={inputStyle} />
              </div>
              <div>
                <label style={lbl}>Name seed (optional)</label>
                <input value={seedName} onChange={e => setSeedName(e.target.value)} placeholder="e.g. Dr. Kamau" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <AddBtn label={busy ? 'Creating…' : `Create ${count} login${count !== 1 ? 's' : ''}`} onClick={createAuto} />
              {busy && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} color={C.sky} />}
            </div>
          </Card>

          {lastAccounts.length > 0 && (
            <Card title="Created Accounts" subtitle="Copy each login link — the staff claim it from the sent invitation.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {lastAccounts.map(a => (
                  <div key={a.email} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 110px', gap: 8, alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.fullName}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{a.role}{a.isNew ? '' : ' · existing'}</div>
                    </div>
                    <span style={{ fontSize: 11, color: C.slate }}>{a.email}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${C.sky}18`, color: C.sky, textAlign: 'center' }}>{a.family} · {a.route}</span>
                    <ActionBtn label="Copy login" onClick={() => copyLogin(a)} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {mode === 'roster' && (
        <Card title="Provisioned Staff & Invitation Links" subtitle="Existing members, their role, and where each logs in.">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <AddBtn label={listBusy ? 'Loading…' : 'Load roster'} onClick={loadRoster} />
          </div>
          {roster !== null && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {roster.length === 0 && <div style={{ fontSize: 12, color: C.muted }}>No provisioned members to show.</div>}
              {roster.map(a => (
                <div key={a.uid} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 110px', gap: 8, alignItems: 'center', padding: '6px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 12 }}>
                  <span style={{ fontWeight: 700 }}>{a.name}</span>
                  <span style={{ fontSize: 10, color: C.muted }}>{a.role}</span>
                  <span style={{ fontSize: 10, color: C.muted }}>{a.route || '—'}</span>
                  <ActionBtn label="Copy" onClick={() => copyLogin(a)} />
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
