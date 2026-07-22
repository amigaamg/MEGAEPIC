'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Receipt, Search, Plus, Printer, Download, FileText, Building, CreditCard, AlertTriangle, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'

const color = '#0EA5E9'

export default function BillingPage() {
  const [tab, setTab] = useState('invoices')
  const [search, setSearch] = useState('')
  const invoices = [
    { id: 'INV-001', patient: 'Grace Mwangi', date: '11 Jul', items: 4, total: 5800, paid: 5800, balance: 0, status: 'paid', method: 'M-Pesa', dept: 'Consultation' },
    { id: 'INV-002', patient: 'John Kamau', date: '11 Jul', items: 2, total: 3200, paid: 0, balance: 3200, status: 'pending', method: '-', dept: 'Laboratory' },
    { id: 'INV-003', patient: 'Samuel Ochieng', date: '10 Jul', items: 6, total: 12400, paid: 12400, balance: 0, status: 'paid', method: 'Cash', dept: 'Pharmacy' },
    { id: 'INV-004', patient: 'Nancy Wambui', date: '10 Jul', items: 3, total: 8500, paid: 3500, balance: 5000, status: 'partial', method: 'M-Pesa', dept: 'Radiology' },
    { id: 'INV-005', patient: 'Peter Kiprop', date: '09 Jul', items: 8, total: 32000, paid: 0, balance: 32000, status: 'pending', method: '-', dept: 'Ward' },
    { id: 'INV-006', patient: 'Faith Chebet', date: '09 Jul', items: 5, total: 18000, paid: 18000, balance: 0, status: 'paid', method: 'Insurance', dept: 'Theatre' },
    { id: 'INV-007', patient: 'Joseph Maina', date: '08 Jul', items: 10, total: 45000, paid: 45000, balance: 0, status: 'paid', method: 'Insurance', dept: 'ICU' },
    { id: 'INV-008', patient: 'Amina Hassan', date: '08 Jul', items: 2, total: 2500, paid: 0, balance: 2500, status: 'overdue', method: '-', dept: 'Consultation' },
  ]

  const chargeItems = [
    { service: 'General Consultation', qty: 1, price: 1500, total: 1500 },
    { service: 'CBC + Malaria RDT', qty: 1, price: 1300, total: 1300 },
    { service: 'Chest X-ray', qty: 1, price: 3000, total: 3000 },
    { service: 'Artemether-Lumefantrine', qty: 1, price: 1200, total: 1200 },
    { service: 'Ward Admission (per day)', qty: 3, price: 4000, total: 12000 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Receipt size={18} color={color} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Billing & Invoicing</span>
        <div style={{ flex: 1 }} />
        <button style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: color, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> New Invoice</button>
      </div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {[{key:'invoices',label:'Invoices',icon:<Receipt size={14} />},{key:'charge',label:'Charge Capture',icon:<CreditCard size={14} />},{key:'insurance',label:'Insurance Billing',icon:<Building size={14} />}].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t.key ? color : 'transparent'}`, background: 'transparent', color: tab === t.key ? color : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
        {tab === 'invoices' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              <BStat label="Total Invoices" value={invoices.length.toString()} color={color} />
              <BStat label="Total Billed" value={`KES ${invoices.reduce((s,i) => s + i.total, 0).toLocaleString()}`} color="#059669" />
              <BStat label="Total Collected" value={`KES ${invoices.reduce((s,i) => s + i.paid, 0).toLocaleString()}`} color="#10B981" />
              <BStat label="Outstanding" value={`KES ${invoices.reduce((s,i) => s + i.balance, 0).toLocaleString()}`} color="#EF4444" />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['all','paid','partial','pending','overdue'].map(s => <button key={s} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize' }}>{s}</button>)}
              </div>
            </div>
            <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Invoices</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 120px 80px 80px 80px 80px 80px 80px 80px 60px', gap: 4, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  <span>ID</span><span>Patient</span><span>Date</span><span>Items</span><span>Total</span><span>Paid</span><span>Balance</span><span>Method</span><span>Status</span><span />
                </div>
                {invoices.filter(i => !search || i.patient.toLowerCase().includes(search.toLowerCase())).map((inv, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 120px 80px 80px 80px 80px 80px 80px 80px 60px', gap: 4, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{inv.id}</span>
                    <span style={{ fontWeight: 600 }}>{inv.patient}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{inv.date}</span>
                    <span>{inv.items}</span>
                    <span style={{ fontWeight: 700 }}>KES {inv.total.toLocaleString()}</span>
                    <span style={{ color: '#10B981' }}>KES {inv.paid.toLocaleString()}</span>
                    <span style={{ color: inv.balance > 0 ? '#EF4444' : 'var(--text-muted)' }}>KES {inv.balance.toLocaleString()}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{inv.method}</span>
                    <span style={{ padding: '2px 5px', borderRadius: 3, fontSize: 9, fontWeight: 600, background: inv.status === 'paid' ? 'rgba(16,185,129,0.1)' : inv.status === 'partial' ? 'rgba(245,158,11,0.1)' : inv.status === 'overdue' ? 'rgba(239,68,68,0.1)' : 'rgba(100,116,139,0.1)', color: inv.status === 'paid' ? '#10B981' : inv.status === 'partial' ? '#F59E0B' : inv.status === 'overdue' ? '#EF4444' : '#64748B', textAlign: 'center', textTransform: 'capitalize' }}>{inv.status}</span>
                    <button style={{ padding: '3px 6px', borderRadius: 4, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 9 }}><ArrowRight size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'charge' && (
          <div>
            <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Patient Charge Capture</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Patient</label>
                  <select style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}>
                    <option>Grace Mwangi</option><option>John Kamau</option><option>Samuel Ochieng</option></select></div>
                <div><label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Encounter ID</label>
                  <input placeholder="ENC-001" style={{ width: '100%', height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} /></div>
              </div>
              <h4 style={{ fontSize: 12, fontWeight: 600, margin: '0 0 8px' }}>Charge Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 80px 80px 40px', gap: 6, padding: '6px 8px', fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  <span>Service</span><span>Qty</span><span>Unit Price</span><span>Total</span><span /></div>
                {chargeItems.map((ci, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 50px 80px 80px 40px', gap: 6, padding: '7px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 10 }}>
                    <span style={{ fontWeight: 600 }}>{ci.service}</span>
                    <span>{ci.qty}</span>
                    <span>KES {ci.price.toLocaleString()}</span>
                    <span style={{ fontWeight: 700 }}>KES {ci.total.toLocaleString()}</span>
                    <button style={{ padding: '2px 6px', borderRadius: 4, border: 'none', background: '#EF444415', color: '#EF4444', cursor: 'pointer', fontSize: 9 }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--surface-border)' }}>
                <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Add Item</button>
                <div style={{ fontSize: 16, fontWeight: 700, color }}>KES {chargeItems.reduce((s, c) => s + c.total, 0).toLocaleString()}</div>
              </div>
              <button style={{ marginTop: 12, padding: '8px 20px', borderRadius: 8, border: 'none', background: color, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%' }}>Generate Invoice</button>
            </div>
          </div>
        )}
        {tab === 'insurance' && (
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Insurance Claims</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { provider: 'NHIF', claim: 'CLM-2024-001', patient: 'Peter Kiprop', amount: 32000, status: 'submitted', date: '09 Jul' },
                { provider: 'AAR', claim: 'CLM-2024-002', patient: 'Joseph Maina', amount: 45000, status: 'approved', date: '08 Jul' },
                { provider: 'Jubilee', claim: 'CLM-2024-003', patient: 'Samuel Kioko', amount: 18000, status: 'pending', date: '11 Jul' },
                { provider: 'NHIF', claim: 'CLM-2024-004', patient: 'Nancy Wambui', amount: 8500, status: 'rejected', date: '05 Jul' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 140px 1fr 80px 100px 60px', gap: 6, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ fontWeight: 600 }}>{c.provider}</span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 10 }}>{c.claim}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{c.patient}</span>
                  <span style={{ fontWeight: 700 }}>KES {c.amount.toLocaleString()}</span>
                  <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: c.status === 'approved' ? 'rgba(16,185,129,0.1)' : c.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: c.status === 'approved' ? '#10B981' : c.status === 'rejected' ? '#EF4444' : '#F59E0B', textAlign: 'center', textTransform: 'capitalize' }}>{c.status}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{c.date}</span>
                </div>
              ))}
            </div>
            <button style={{ marginTop: 14, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={14} /> Submit New Claim</button>
          </div>
        )}
      </div>
    </div>
  )
}

function BStat({ label, value, color: c }) {
  return <div style={{ padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
    <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{value}</div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
  </div>
}
