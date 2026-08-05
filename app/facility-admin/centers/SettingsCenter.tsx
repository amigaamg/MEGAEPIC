'use client';

import { Palette, CreditCard, ShieldCheck, DatabaseBackup } from 'lucide-react';
import { C, Card } from '../ui';
import type { FacilityAdminSettings } from '../structure-types';

// Center — Settings: Branding, Subscription, Compliance, Disaster Recovery.
// The Facility Administrator governs the platform (never the medicine).

export function SettingsCenter({ settings, onChange }: { settings: FacilityAdminSettings; onChange: (next: FacilityAdminSettings) => void }) {
  const b = settings.branding;
  const sub = settings.subscription;
  const comp = settings.compliance;
  const dr = settings.disasterRecovery;

  const toggle = (key: keyof FacilityAdminSettings['compliance'] | keyof FacilityAdminSettings['disasterRecovery']) =>
    (next: boolean) => onChange({
      ...settings,
      compliance: { ...settings.compliance, [key]: next },
      ...(key in settings.disasterRecovery ? {} : {}),
    });

  const toggleComp = (k: keyof FacilityAdminSettings['compliance']) => onChange({ ...settings, compliance: { ...settings.compliance, [k]: !settings.compliance[k] } });
  const toggleDr = (k: keyof FacilityAdminSettings['disasterRecovery']) => onChange({ ...settings, disasterRecovery: { ...settings.disasterRecovery, [k]: !settings.disasterRecovery[k] } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card title="Facility Branding" subtitle="Logo, colors, fonts, document templates — the Experience Configuration.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Field label="Primary Color" value={b.primaryColor} onChange={v => onChange({ ...settings, branding: { ...b, primaryColor: v } })} type="color" />
          <Field label="Secondary Color" value={b.secondaryColor} onChange={v => onChange({ ...settings, branding: { ...b, secondaryColor: v } })} type="color" />
          <Field label="Logo URL" value={b.logoUrl} onChange={v => onChange({ ...settings, branding: { ...b, logoUrl: v } })} />
          <Field label="Font Family" value={b.fontFamily} onChange={v => onChange({ ...settings, branding: { ...b, fontFamily: v } })} />
          <Field label="Header Template" value={b.headerTemplate} onChange={v => onChange({ ...settings, branding: { ...b, headerTemplate: v } })} />
          <Field label="Legal Disclaimer" value={b.disclaimer} onChange={v => onChange({ ...settings, branding: { ...b, disclaimer: v } })} />
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>Preview color: <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: b.primaryColor, verticalAlign: 'middle', marginLeft: 4 }} /></div>
      </Card>

      <Card title="Subscription" subtitle="Tier, status, seats, renewal — configuration, not billing entry.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <Stat label="Tier" value={sub.tier} />
          <Stat label="Status" value={sub.status} tone={sub.status === 'active' ? C.green : C.amber} />
          <Stat label="Seats" value={sub.seats} />
          <Stat label="Renewed" value={new Date(sub.renewedAt).toLocaleDateString()} />
          <Stat label="Expires" value={new Date(sub.expiresAt).toLocaleDateString()} />
        </div>
      </Card>

      <Card title="Compliance" subtitle="Facility license, accreditation, infection control, quality assurance, clinical governance.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <Field label="License Number" value={comp.licenseNumber} onChange={v => onChange({ ...settings, compliance: { ...comp, licenseNumber: v } })} />
          <Field label="Regulatory Body" value={comp.regulatoryBody} onChange={v => onChange({ ...settings, compliance: { ...comp, regulatoryBody: v } })} />
          <Field label="Accreditation" value={comp.accreditation} onChange={v => onChange({ ...settings, compliance: { ...comp, accreditation: v } })} />
          <Field label="Insurance Panel" value={comp.insurance} onChange={v => onChange({ ...settings, compliance: { ...comp, insurance: v } })} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <Toggle label="Infection Control" on={comp.infectionControl} onClick={() => toggleComp('infectionControl')} />
          <Toggle label="Quality Assurance" on={comp.qualityAssurance} onClick={() => toggleComp('qualityAssurance')} />
          <Toggle label="Clinical Governance" on={comp.clinicalGovernance} onClick={() => toggleComp('clinicalGovernance')} />
        </div>
      </Card>

      <Card title="Disaster Recovery" subtitle="Backup, restore, failover, downtime mode, recovery testing.">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <Toggle label="Automatic Backup" on={dr.backupEnabled} onClick={() => toggleDr('backupEnabled')} />
          <Toggle label="Failover" on={dr.failoverEnabled} onClick={() => toggleDr('failoverEnabled')} />
          <Toggle label="Downtime Mode" on={dr.downtimeMode} onClick={() => toggleDr('downtimeMode')} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Stat label="Backup Frequency (h)" value={dr.backupFrequencyHours} />
          <Stat label="Last Backup" value={new Date(dr.lastBackupAt).toLocaleDateString()} />
          <Stat label="Last Recovery Test" value={new Date(dr.recoveryTestingAt).toLocaleDateString()} />
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type?: 'color' }) {
  return (
    <div>
      <label style={{ fontSize: 10, color: C.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', fontWeight: 700 }}>{label}</label>
      <input value={value} type={type} onChange={e => onChange(e.target.value)} style={{ width: '100%', height: type === 'color' ? 34 : 34, borderRadius: 8, border: `1px solid ${C.border}`, padding: '0 10px', fontSize: 12, outline: 'none', fontFamily: type === 'color' ? 'monospace' : 'inherit' }} />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}><div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', fontWeight: 700 }}>{label}</div><div style={{ fontSize: 15, fontWeight: 800, color: tone || C.navy, textTransform: 'capitalize' }}>{value}</div></div>;
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return <button onClick={onClick} style={{ padding: '8px 14px', borderRadius: 20, border: 'none', background: on ? `${C.green}18` : '#eef2f7', color: on ? C.green : C.slate, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>{on ? '✓ ' : ''}{label}</button>;
}