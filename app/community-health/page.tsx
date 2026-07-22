'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Users, Map, Activity, Search, Plus, Calendar, Heart, Home, Syringe, Baby, ArrowRight } from 'lucide-react'

const color = '#F59E0B'

export default function CommunityHealthPage() {
  const [tab, setTab] = useState('overview')
  const [search, setSearch] = useState('')

  const chws = [
    { name: 'Grace Muthoni', zone: 'Kibera - Ward A', households: 45, patients: 120, visits: 18, pending: 5, lastActive: 'Today' },
    { name: 'John Kiprop', zone: 'Kibera - Ward B', households: 38, patients: 95, visits: 12, pending: 8, lastActive: 'Yesterday' },
    { name: 'Nancy Wambui', zone: 'Dagoretti - North', households: 52, patients: 140, visits: 22, pending: 3, lastActive: 'Today' },
    { name: 'Samuel Kioko', zone: 'Dagoretti - South', households: 40, patients: 105, visits: 15, pending: 6, lastActive: '2 days ago' },
    { name: 'Faith Chebet', zone: 'Kawangware - East', households: 48, patients: 130, visits: 20, pending: 4, lastActive: 'Today' },
  ]

  const campaigns = [
    { name: 'Diabetes Screening', zone: 'Kibera', date: '15 Jul', target: 200, screened: 145, positives: 18, defaulters: 22 },
    { name: 'Immunization Drive', zone: 'Dagoretti', date: '18 Jul', target: 150, screened: 98, positives: 0, defaulters: 35 },
    { name: 'Malaria Prevention', zone: 'Kawangware', date: '22 Jul', target: 300, screened: 0, positives: 0, defaulters: 0 },
    { name: 'HIV Testing & Counselling', zone: 'All Zones', date: '25 Jul', target: 250, screened: 62, positives: 4, defaulters: 0 },
  ]

  const homeVisits = [
    { patient: 'Peter Kiprop', age: 68, condition: 'Hypertension, DM', risk: 'high', lastVisit: '5d ago', nextVisit: '14 Jul', chw: 'Grace Muthoni' },
    { patient: 'Esther Wanjiku', age: 72, condition: 'CKD, HF', risk: 'high', lastVisit: '1w ago', nextVisit: '16 Jul', chw: 'John Kiprop' },
    { patient: 'Baby Ochieng', age: '4mo', condition: 'Malnutrition', risk: 'moderate', lastVisit: '3d ago', nextVisit: '13 Jul', chw: 'Nancy Wambui' },
    { patient: 'Grace Kamau', age: 58, condition: 'Diabetes', risk: 'moderate', lastVisit: '2w ago', nextVisit: '18 Jul', chw: 'Samuel Kioko' },
    { patient: 'Joseph Maina', age: 65, condition: 'Post-stroke', risk: 'high', lastVisit: '4d ago', nextVisit: '15 Jul', chw: 'Faith Chebet' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Home size={18} color={color} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Community Health</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Map size={14} /> Zones</button>
        <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: color, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> New Campaign</button>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {[{key:'overview',label:'Overview',icon:<Activity size={14} />},{key:'chws',label:'CHWs',icon:<Users size={14} />},{key:'visits',label:'Home Visits',icon:<Heart size={14} />},{key:'campaigns',label:'Campaigns',icon:<Calendar size={14} />}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t.key ? color : 'transparent'}`, background: 'transparent', color: tab === t.key ? color : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
              <CStat label="Active CHWs" value="12" color={color} />
              <CStat label="Households" value="2,450" color="#10B981" />
              <CStat label="Patients Enrolled" value="6,820" color={C.sky} />
              <CStat label="Visits This Week" value="187" color="#8B5CF6" />
              <CStat label="Defaulters" value="42" color="#EF4444" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Zone Coverage</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { zone: 'Kibera', hh: 850, target: 1000, pct: 85 },
                    { zone: 'Dagoretti', hh: 720, target: 900, pct: 80 },
                    { zone: 'Kawangware', hh: 540, target: 700, pct: 77 },
                    { zone: 'Mathare', hh: 340, target: 500, pct: 68 },
                  ].map((z, i) => (
                    <div key={i} style={{ padding: '6px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 11 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{z.zone}</span>
                        <span style={{ color: z.pct >= 80 ? '#10B981' : '#F59E0B' }}>{z.pct}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-border)', overflow: 'hidden' }}>
                        <div style={{ width: `${z.pct}%`, height: '100%', borderRadius: 2, background: z.pct >= 80 ? '#10B981' : '#F59E0B' }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{z.hh} / {z.target} households</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Service Delivery</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { icon: <Heart size={14} />, label: 'NCD Screening', value: '342', trend: '+8%' },
                    { icon: <Syringe size={14} />, label: 'Immunization', value: '187', trend: '+5%' },
                    { icon: <Baby size={14} />, label: 'Maternal Visits', value: '96', trend: '+12%' },
                    { icon: <Activity size={14} />, label: 'TB Screening', value: '145', trend: '-3%' },
                    { icon: <Home size={14} />, label: 'Home Visits', value: '420', trend: '+15%' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 11 }}>
                      <span style={{ color: color }}>{s.icon}</span>
                      <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{s.label}</span>
                      <span style={{ fontWeight: 700 }}>{s.value}</span>
                      <span style={{ color: s.trend.startsWith('+') ? '#10B981' : '#EF4444', fontSize: 10 }}>{s.trend}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'chws' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search CHWs..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: color, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add CHW</button>
            </div>
            <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Community Health Workers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 80px 80px 80px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  <span>Name</span><span>Zone</span><span>Households</span><span>Patients</span><span>Visits</span><span>Pending</span></div>
                {chws.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map((c, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 80px 80px 80px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{c.zone}</span>
                    <span>{c.households}</span><span>{c.patients}</span>
                    <span style={{ color: '#10B981' }}>{c.visits}</span>
                    <span style={{ color: c.pending > 5 ? '#EF4444' : '#F59E0B' }}>{c.pending}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'visits' && (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>High-Risk Home Visits</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 40px 1fr 50px 60px 60px 120px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                <span>Patient</span><span>Age</span><span>Condition</span><span>Risk</span><span>Last Visit</span><span>Next</span><span>CHW</span></div>
              {homeVisits.map((v, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 40px 1fr 50px 60px 60px 120px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                  <span style={{ fontWeight: 600 }}>{v.patient}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{v.age}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{v.condition}</span>
                  <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 9, background: v.risk === 'high' ? '#EF444415' : '#F59E0B15', color: v.risk === 'high' ? '#EF4444' : '#F59E0B', textAlign: 'center', textTransform: 'capitalize' }}>{v.risk}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{v.lastVisit}</span>
                  <span style={{ fontWeight: 600, color: v.nextVisit === '13 Jul' || v.nextVisit === '14 Jul' ? '#EF4444' : 'var(--text-primary)' }}>{v.nextVisit}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{v.chw}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'campaigns' && (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Outreach Campaigns</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '180px 80px 60px 60px 60px 60px 60px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                <span>Campaign</span><span>Zone</span><span>Date</span><span>Target</span><span>Done</span><span>Positives</span><span>Defaulters</span></div>
              {campaigns.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 80px 60px 60px 60px 60px 60px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c.zone}</span>
                  <span>{c.date}</span>
                  <span>{c.target}</span>
                  <span style={{ color: '#10B981' }}>{c.screened}</span>
                  <span style={{ color: c.positives > 0 ? '#EF4444' : '#10B981', fontWeight: c.positives > 0 ? 600 : 400 }}>{c.positives}</span>
                  <span style={{ color: '#F59E0B' }}>{c.defaulters}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CStat({ label, value, color: c }) {
  return <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
    <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{value}</div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
  </div>
}
