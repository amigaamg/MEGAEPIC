'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { DollarSign, TrendingUp, CreditCard, Receipt, FileText, Wallet, Search, Plus, Printer, CheckCircle, XCircle, Clock, AlertTriangle, Building } from 'lucide-react'

const color = '#10B981'

const transactions = [
  { id: 'INV-001', patient: 'Grace Mwangi', date: '11 Jul 2026', service: 'Consultation - Cardiology', total: 2500, paid: 2500, balance: 0, status: 'paid', method: 'M-Pesa', insurance: null },
  { id: 'INV-002', patient: 'John Kamau', date: '11 Jul 2026', service: 'Lab - Full Hemogram', total: 1800, paid: 0, balance: 1800, status: 'pending', method: null, insurance: null },
  { id: 'INV-003', patient: 'Samuel Ochieng', date: '10 Jul 2026', service: 'Pharmacy - Artemether-Lumefantrine', total: 1200, paid: 1200, balance: 0, status: 'paid', method: 'Cash', insurance: null },
  { id: 'INV-004', patient: 'Nancy Wambui', date: '10 Jul 2026', service: 'Radiology - Chest X-ray', total: 3500, paid: 1500, balance: 2000, status: 'partial', method: 'M-Pesa', insurance: null },
  { id: 'INV-005', patient: 'Peter Kiprop', date: '09 Jul 2026', service: 'Admission - Ward 4A (3 days)', total: 15000, paid: 0, balance: 15000, status: 'pending', method: null, insurance: 'NHIF' },
  { id: 'INV-006', patient: 'Faith Chebet', date: '09 Jul 2026', service: 'Theatre - Appendectomy', total: 45000, paid: 20000, balance: 25000, status: 'partial', method: 'M-Pesa', insurance: 'NHIF' },
  { id: 'INV-007', patient: 'Joseph Maina', date: '08 Jul 2026', service: 'ICU - 5 days', total: 85000, paid: 85000, balance: 0, status: 'paid', method: 'Insurance', insurance: 'AAR' },
  { id: 'INV-008', patient: 'Amina Hassan', date: '08 Jul 2026', service: 'Consultation - OB/GYN', total: 2000, paid: 0, balance: 2000, status: 'overdue', method: null, insurance: null },
  { id: 'INV-009', patient: 'David Kiprop', date: '07 Jul 2026', service: 'Physiotherapy (4 sessions)', total: 4000, paid: 4000, balance: 0, status: 'paid', method: 'Cash', insurance: null },
  { id: 'INV-010', patient: 'Grace Muthoni', date: '07 Jul 2026', service: 'CT Scan - Head', total: 12000, paid: 5000, balance: 7000, status: 'partial', method: 'M-Pesa', insurance: null },
]

const priceList = [
  { service: 'General Consultation', department: 'Outpatient', price: 1500, code: 'CONS-GEN' },
  { service: 'Specialist Consultation', department: 'Outpatient', price: 2500, code: 'CONS-SPC' },
  { service: 'Full Hemogram (CBC)', department: 'Laboratory', price: 800, code: 'LAB-CBC' },
  { service: 'Malaria RDT', department: 'Laboratory', price: 500, code: 'LAB-MRD' },
  { service: 'Chest X-ray (2 views)', department: 'Radiology', price: 3000, code: 'RAD-CXR' },
  { service: 'Abdominal Ultrasound', department: 'Radiology', price: 5000, code: 'RAD-AUS' },
  { service: 'CT Scan - Head (non-contrast)', department: 'Radiology', price: 10000, code: 'RAD-CTH' },
  { service: 'Ward Admission (per day)', department: 'Ward', price: 4000, code: 'WRD-DAY' },
  { service: 'ICU Admission (per day)', department: 'ICU', price: 15000, code: 'ICU-DAY' },
  { service: 'Appendectomy', department: 'Theatre', price: 35000, code: 'THR-APP' },
  { service: 'C-section', department: 'Theatre', price: 45000, code: 'THR-CSE' },
  { service: 'ECG', department: 'Cardiology', price: 1500, code: 'CRD-ECG' },
  { service: 'Echocardiogram', department: 'Cardiology', price: 8000, code: 'CRD-ECHO' },
  { service: 'Physiotherapy Session', department: 'Physiotherapy', price: 1000, code: 'PHY-SES' },
  { service: 'NHIF Registration', department: 'Administration', price: 500, code: 'ADM-NHIF' },
]

const insuranceClaims = [
  { id: 'CLM-001', patient: 'Peter Kiprop', provider: 'NHIF', amount: 15000, status: 'submitted', date: '09 Jul', expected: '30 Jul' },
  { id: 'CLM-002', patient: 'Faith Chebet', provider: 'NHIF', amount: 25000, status: 'pending', date: '10 Jul', expected: '05 Aug' },
  { id: 'CLM-003', patient: 'Joseph Maina', provider: 'AAR', amount: 85000, status: 'approved', date: '08 Jul', expected: '15 Jul' },
  { id: 'CLM-004', patient: 'Nancy Wambui', provider: 'NHIF', amount: 8000, status: 'rejected', date: '05 Jul', expected: '-' },
  { id: 'CLM-005', patient: 'Samuel Kioko', provider: 'Jubilee', amount: 35000, status: 'submitted', date: '11 Jul', expected: '01 Aug' },
]

export default function FinancePage() {
  const [tab, setTab] = useState('dashboard')
  const [search, setSearch] = useState('')
  const totalRevenue = transactions.reduce((s, t) => s + t.total, 0)
  const totalPaid = transactions.reduce((s, t) => s + t.paid, 0)
  const totalBalance = transactions.reduce((s, t) => s + t.balance, 0)
  const pendingInvoices = transactions.filter(t => t.status === 'pending').length
  const overdueInvoices = transactions.filter(t => t.status === 'overdue').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Wallet size={18} color={color} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Finance & Billing</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Printer size={14} /> Report
        </button>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--surface-border)', padding: '0 24px', background: 'var(--surface-card)' }}>
        {[
          { key: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={14} /> },
          { key: 'billing', label: 'Billing', icon: <Receipt size={14} /> },
          { key: 'payments', label: 'Payments', icon: <CreditCard size={14} /> },
          { key: 'insurance', label: 'Insurance', icon: <Building size={14} /> },
          { key: 'pricing', label: 'Pricing', icon: <FileText size={14} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 16px', border: 'none', borderBottom: `2px solid ${tab === t.key ? color : 'transparent'}`, background: 'transparent', color: tab === t.key ? color : 'var(--text-secondary)', fontSize: 12, fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {tab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
              <FStat label="Revenue (30d)" value={`KES ${(totalRevenue).toLocaleString()}`} color={color} icon={<DollarSign size={16} />} />
              <FStat label="Collected" value={`KES ${(totalPaid).toLocaleString()}`} color="#059669" icon={<TrendingUp size={16} />} />
              <FStat label="Outstanding" value={`KES ${(totalBalance).toLocaleString()}`} color="#F59E0B" icon={<AlertTriangle size={16} />} />
              <FStat label="Pending" value={pendingInvoices.toString()} color="#EF4444" icon={<Clock size={16} />} />
              <FStat label="Overdue" value={overdueInvoices.toString()} color="#DC2626" icon={<XCircle size={16} />} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Revenue Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { dept: 'Consultations', amount: 125000, pct: 28 },
                    { dept: 'Laboratory', amount: 98000, pct: 22 },
                    { dept: 'Pharmacy', amount: 72000, pct: 16 },
                    { dept: 'Radiology', amount: 55000, pct: 12 },
                    { dept: 'Theatre', amount: 45000, pct: 10 },
                    { dept: 'Ward/ICU', amount: 35000, pct: 8 },
                    { dept: 'Other', amount: 18000, pct: 4 },
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 11 }}>
                      <span style={{ fontWeight: 600, width: 100, color: 'var(--text-primary)' }}>{d.dept}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--surface-border)', overflow: 'hidden' }}>
                        <div style={{ width: `${d.pct}%`, height: '100%', borderRadius: 3, background: color, opacity: 0.7 }} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', width: 80, textAlign: 'right' }}>KES {d.amount.toLocaleString()}</span>
                      <span style={{ color: 'var(--text-muted)', width: 40, textAlign: 'right' }}>{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Payment Methods (30d)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { method: 'M-Pesa', amount: 285000, pct: 55, icon: '📱' },
                    { method: 'Cash', amount: 98000, pct: 19, icon: '💵' },
                    { method: 'Insurance', amount: 85000, pct: 16, icon: '🏛️' },
                    { method: 'Bank Transfer', amount: 32000, pct: 6, icon: '🏦' },
                    { method: 'Card', amount: 21000, pct: 4, icon: '💳' },
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 11 }}>
                      <span>{d.icon}</span>
                      <span style={{ fontWeight: 600, width: 100, color: 'var(--text-primary)' }}>{d.method}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--surface-border)', overflow: 'hidden' }}>
                        <div style={{ width: `${d.pct}%`, height: '100%', borderRadius: 3, background: '#0EA5E9', opacity: 0.7 }} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', width: 80, textAlign: 'right' }}>KES {d.amount.toLocaleString()}</span>
                      <span style={{ color: 'var(--text-muted)', width: 40, textAlign: 'right' }}>{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Recent Transactions</h3>
              <TransactionTable transactions={transactions.slice(0, 5)} />
            </div>
          </div>
        )}

        {tab === 'billing' && (
          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'paid', 'partial', 'pending', 'overdue'].map(s => (
                  <button key={s} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize' }}>{s}</button>
                ))}
              </div>
              <button style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, border: 'none', background: color, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> New Invoice
              </button>
            </div>
            <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <TransactionTable transactions={transactions} />
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Record Payment</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Invoice ID</label>
                  <input placeholder="e.g. INV-005" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)' }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Amount (KES)</label>
                  <input type="number" placeholder="0.00" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)' }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Payment Method</label>
                  <select style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)' }}>
                    <option>M-Pesa</option><option>Cash</option><option>Bank Transfer</option><option>Card</option><option>Insurance</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Reference / Transaction ID</label>
                  <input placeholder="e.g. QK2F8M9P" style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-sans)' }} />
                </div>
                <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: color, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Record Payment</button>
              </div>
            </div>
            <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>M-Pesa Payments</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {transactions.filter(t => t.method === 'M-Pesa').map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', fontSize: 11 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.status === 'paid' ? '#10B981' : t.status === 'partial' ? '#F59E0B' : '#EF4444' }} />
                    <span style={{ fontWeight: 600, width: 120, color: 'var(--text-primary)' }}>{t.patient}</span>
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{t.service}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', width: 80, textAlign: 'right' }}>KES {t.paid.toLocaleString()}</span>
                    <span style={{ color: 'var(--text-muted)', width: 60, textAlign: 'right', textTransform: 'capitalize' }}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'insurance' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              <FStat label="Total Claims" value={insuranceClaims.length.toString()} color={C.sky} icon={<FileText size={16} />} />
              <FStat label="Approved" value={insuranceClaims.filter(c => c.status === 'approved').length.toString()} color="#10B981" icon={<CheckCircle size={16} />} />
              <FStat label="Pending" value={insuranceClaims.filter(c => c.status === 'pending' || c.status === 'submitted').length.toString()} color="#F59E0B" icon={<Clock size={16} />} />
              <FStat label="Rejected" value={insuranceClaims.filter(c => c.status === 'rejected').length.toString()} color="#EF4444" icon={<XCircle size={16} />} />
            </div>
            <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Insurance Claims</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 120px 80px 100px 80px 80px 80px', gap: 6, padding: '6px 10px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span>Claim ID</span><span>Patient</span><span>Provider</span><span>Amount</span><span>Status</span><span>Submitted</span><span />
                </div>
                {insuranceClaims.map((c, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 120px 80px 100px 80px 80px 80px', gap: 6, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.id}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{c.patient}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{c.provider}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>KES {c.amount.toLocaleString()}</span>
                    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: c.status === 'approved' ? 'rgba(16,185,129,0.1)' : c.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: c.status === 'approved' ? '#10B981' : c.status === 'rejected' ? '#EF4444' : '#F59E0B', textAlign: 'center', textTransform: 'capitalize' }}>{c.status}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{c.date}</span>
                    <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)' }}>View</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'pricing' && (
          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input placeholder="Search services..." style={{ width: '100%', height: 34, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none' }} />
              </div>
              <button style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, border: 'none', background: color, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> Add Service
              </button>
            </div>
            <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px' }}>Service Catalog</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 120px 80px 100px 60px', gap: 6, padding: '6px 10px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span>Service</span><span>Department</span><span>Code</span><span>Price (KES)</span><span />
                </div>
                {priceList.map((p, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '150px 120px 80px 100px 60px', gap: 6, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.service}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{p.department}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.code}</span>
                    <span style={{ fontWeight: 700, color: color }}>{p.price.toLocaleString()}</span>
                    <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 10, color: 'var(--text-secondary)' }}>Edit</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FStat({ label, value, color: c, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return <div style={{ padding: '14px 16px', background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: c, opacity: 0.7 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{value}</div>
  </div>
}

function TransactionTable({ transactions: txns }: { transactions: any[] }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{ display: 'grid', gridTemplateColumns: '90px 120px 1fr 80px 80px 80px 80px', gap: 6, padding: '6px 10px', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <span>Invoice</span><span>Patient</span><span>Service</span><span>Total</span><span>Paid</span><span>Balance</span><span>Status</span>
    </div>
    {txns.map((t, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 120px 1fr 80px 80px 80px 80px', gap: 6, padding: '8px 10px', borderRadius: 6, background: i % 2 === 0 ? 'var(--surface-elevated)' : 'transparent', alignItems: 'center', fontSize: 11 }}>
        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{t.id}</span>
        <span style={{ color: 'var(--text-secondary)' }}>{t.patient}</span>
        <span style={{ color: 'var(--text-secondary)' }}>{t.service}</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.total.toLocaleString()}</span>
        <span style={{ color: '#10B981' }}>{t.paid.toLocaleString()}</span>
        <span style={{ color: t.balance > 0 ? '#EF4444' : 'var(--text-muted)' }}>{t.balance.toLocaleString()}</span>
        <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: t.status === 'paid' ? 'rgba(16,185,129,0.1)' : t.status === 'partial' ? 'rgba(245,158,11,0.1)' : t.status === 'overdue' ? 'rgba(239,68,68,0.1)' : 'rgba(100,116,139,0.1)', color: t.status === 'paid' ? '#10B981' : t.status === 'partial' ? '#F59E0B' : t.status === 'overdue' ? '#EF4444' : '#64748B', textAlign: 'center', textTransform: 'capitalize' }}>{t.status}</span>
      </div>
    ))}
  </div>
}
