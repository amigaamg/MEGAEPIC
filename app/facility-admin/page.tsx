'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Building, Users, MapPin, Settings, Search, Plus, Shield, ArrowRight, Activity, Bed, Palette, Briefcase } from 'lucide-react'

export default function FacilityAdminPage() {
  const tabs = [
    { key: 'overview', label: 'Overview', icon: <Building size={14} /> },
    { key: 'departments', label: 'Departments', icon: <MapPin size={14} /> },
    { key: 'workers', label: 'Workers', icon: <Users size={14} /> },
    { key: 'branding', label: 'Branding', icon: <Palette size={14} /> },
    { key: 'beds', label: 'Bed Management', icon: <Bed size={14} /> },
  ]
  const [tab, setTab] = useState('overview')
  const stats = { depts: 12, workers: 86, beds: 120, occupied: 94, branches: 2 }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Building size={18} color={C.sky} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Facility Administration</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Settings size={14} /> Configure
        </button>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t.key ? C.sky : 'transparent'}`, background: 'transparent', color: tab === t.key ? C.sky : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
          <AStat label="Departments" value={stats.depts} color={C.sky} />
          <AStat label="Workers" value={stats.workers} color="#10B981" />
          <AStat label="Total Beds" value={stats.beds} color="#8B5CF6" />
          <AStat label="Occupied" value={stats.occupied} color="#F59E0B" />
          <AStat label="Branches" value={stats.branches} color="#EC4899" />
        </div>
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card title="Quick Actions">
              {[{ icon: <Plus size={14} />, label: 'Add Department', desc: 'Create a new department or unit' },
                { icon: <Users size={14} />, label: 'Register Worker', desc: 'Add staff to a department' },
                { icon: <Bed size={14} />, label: 'Manage Beds', desc: 'View bed occupancy and status' },
                { icon: <Palette size={14} />, label: 'Update Branding', desc: 'Logo, colors, document templates' },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'var(--surface-elevated)', cursor: 'pointer' }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: `${C.sky}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sky }}>{a.icon}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{a.label}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.desc}</div></div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              ))}
            </Card>
            <Card title="Facility Info">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                {[
                  { label: 'Organization', value: 'Nairobi Teaching Hospital' },
                  { label: 'Type', value: 'Hospital' },
                  { label: 'License', value: 'NTH-2026-001' },
                  { label: 'Country', value: 'Kenya' },
                  { label: 'Active Since', value: 'Jan 2026' },
                  { label: 'AMX-UID', value: 'AMX-ORG-A1B2C3-4F-GH' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--surface-border)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                    <span style={{ fontWeight: 600 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
        {tab === 'departments' && <DepartmentsView />}
        {tab === 'workers' && <WorkersView />}
        {tab === 'branding' && <BrandingView />}
        {tab === 'beds' && <BedsView />}
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
    <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>{title}</h3>
    {children}
  </div>
}

function AStat({ label, value, color }: { label: string; value: number; color: string }) {
  return <div style={{ padding: '14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', textAlign: 'center' }}>
    <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
  </div>
}

function DepartmentsView() {
  const depts = ['Emergency Medicine', 'Internal Medicine', 'Cardiology', 'Pediatrics', 'OB/GYN', 'Surgery', 'Orthopedics', 'Neurology', 'Psychiatry', 'Radiology', 'Laboratory', 'Pharmacy']
  return <Card title="All Departments (12)">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {depts.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.sky }} />
          <span style={{ fontWeight: 600, flex: 1 }}>{d}</span>
          <span style={{ color: 'var(--text-muted)' }}>{(8 + i * 3)} workers</span>
          <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)' }}>Manage</button>
        </div>
      ))}
    </div>
  </Card>
}

function WorkersView() {
  const [search, setSearch] = useState('')
  const workers = [
    { name: 'Dr. Grace Kamau', role: 'Consultant Cardiologist', dept: 'Cardiology', status: 'active' },
    { name: 'Dr. John Mwangi', role: 'Medical Officer', dept: 'Emergency', status: 'active' },
    { name: 'Nurse Ann Wanjiku', role: 'Senior Nurse', dept: 'ICU', status: 'active' },
    { name: 'Dr. Peter Ochieng', role: 'Registrar', dept: 'Surgery', status: 'active' },
    { name: 'Pharm. David Kiprop', role: 'Clinical Pharmacist', dept: 'Pharmacy', status: 'active' },
    { name: 'Lab Tech. Nancy Wambui', role: 'Senior Technologist', dept: 'Laboratory', status: 'suspended' },
  ]
  return <Card title="Workers">
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search workers..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-sans)' }} />
      </div>
      <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: C.sky, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add Worker</button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {workers.filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase())).map((w, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px 80px 60px', gap: 8, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 12 }}>
          <span style={{ fontWeight: 600 }}>{w.name}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{w.role}</span>
          <span style={{ color: 'var(--text-muted)' }}>{w.dept}</span>
          <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: w.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: w.status === 'active' ? '#10B981' : '#EF4444', textAlign: 'center', textTransform: 'capitalize' }}>{w.status}</span>
          <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)' }}>Edit</button>
        </div>
      ))}
    </div>
  </Card>
}

function BrandingView() {
  return <Card title="Organization Branding">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div><label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Primary Color</label><input defaultValue="#2F80ED" style={{ width: '100%', height: 40, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} /></div>
      <div><label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Secondary Color</label><input defaultValue="#1A5CC7" style={{ width: '100%', height: 40, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'monospace' }} /></div>
      <div><label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Logo URL</label><input placeholder="https://..." style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)' }} /></div>
      <div><label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Header Template</label><input defaultValue="--- Nairobi Teaching Hospital ---" style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)' }} /></div>
      <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Legal Disclaimer</label><textarea defaultValue="This document contains confidential patient information. If you are not the intended recipient, please notify the sender immediately." rows={3} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)', resize: 'vertical' }} /></div>
    </div>
    <button style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, border: 'none', background: C.sky, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save Branding</button>
  </Card>
}

function BedsView() {
  const wards = [
    { name: 'Ward 3A - Medical', total: 24, occupied: 20, cleaning: 2, available: 2 },
    { name: 'Ward 4A - Cardiology', total: 20, occupied: 18, cleaning: 1, available: 1 },
    { name: 'Ward 5A - Pediatric', total: 18, occupied: 14, cleaning: 2, available: 2 },
    { name: 'ICU', total: 12, occupied: 10, cleaning: 1, available: 1 },
    { name: 'HDU', total: 8, occupied: 6, cleaning: 1, available: 1 },
    { name: 'NICU', total: 10, occupied: 8, cleaning: 1, available: 1 },
    { name: 'Ward 6A - Surgical', total: 28, occupied: 18, cleaning: 4, available: 6 },
  ]
  return <Card title="Bed Management">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {wards.map((w, i) => {
        const pct = Math.round((w.occupied / w.total) * 100)
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 60px 60px 60px', gap: 8, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 12 }}>
            <span style={{ fontWeight: 600 }}>{w.name}</span>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--surface-border)', display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, background: pct > 85 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#10B981' }} />
            </div>
            <span style={{ fontWeight: 700, textAlign: 'right', color: pct > 85 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#10B981' }}>{pct}%</span>
            <span style={{ color: 'var(--text-muted)', textAlign: 'right' }}>{w.available} free</span>
            <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)' }}>View</button>
          </div>
        )
      })}
    </div>
  </Card>
}
