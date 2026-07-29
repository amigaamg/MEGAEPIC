'use client';
import { useState, useMemo } from 'react';
import { ChargeCategory, InvoiceStatus, PaymentMethod, PaymentStatus, InsuranceClaimStatus, calculateInvoiceTotal, splitPayment, applyPayment } from '@/lib/amexan/hmis/billing-engine';
import type { ChargeItem, Invoice, Payment, InsuranceClaim } from '@/lib/amexan/hmis/billing-engine';

const MOCK_CHARGES: ChargeItem[] = [
  { id: 'CHG-001', code: 'CONS-001', name: 'General Consultation', category: ChargeCategory.Consultation, departmentId: 'DEPT-002', unitPrice: 1000, currency: 'KES', isPackage: false, insuranceCovered: true, insuranceCoveragePercent: 90, requiresAuthorization: false, taxPercent: 0, isActive: true },
  { id: 'CHG-002', code: 'LAB-FBC', name: 'Full Blood Count', category: ChargeCategory.Laboratory, departmentId: 'DEPT-006', unitPrice: 500, currency: 'KES', isPackage: false, insuranceCovered: true, insuranceCoveragePercent: 100, requiresAuthorization: false, taxPercent: 0, isActive: true },
  { id: 'CHG-003', code: 'IMG-Chest', name: 'Chest X-Ray', category: ChargeCategory.Imaging, departmentId: 'DEPT-007', unitPrice: 1500, currency: 'KES', isPackage: false, insuranceCovered: true, insuranceCoveragePercent: 85, requiresAuthorization: true, taxPercent: 0, isActive: true },
  { id: 'CHG-004', code: 'SURG-APP', name: 'Appendicectomy', category: ChargeCategory.Surgery, departmentId: 'DEPT-004', unitPrice: 50000, currency: 'KES', isPackage: true, packageItems: ['SURG-APP-SUR', 'SURG-APP-ANA', 'SURG-APP-THE'], insuranceCovered: true, insuranceCoveragePercent: 80, requiresAuthorization: true, taxPercent: 0, isActive: true },
  { id: 'CHG-005', code: 'WARD-A', name: 'General Ward (per day)', category: ChargeCategory.Ward, departmentId: 'DEPT-002', unitPrice: 3000, currency: 'KES', isPackage: false, insuranceCovered: true, insuranceCoveragePercent: 100, requiresAuthorization: false, taxPercent: 0, isActive: true },
  { id: 'CHG-006', code: 'MED-AMOX', name: 'Amoxicillin 500mg (per tab)', category: ChargeCategory.Pharmacy, departmentId: 'DEPT-005', unitPrice: 25, currency: 'KES', isPackage: false, insuranceCovered: true, insuranceCoveragePercent: 100, requiresAuthorization: false, taxPercent: 0, isActive: true },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', patientId: 'P-001', encounterId: 'ENC-001', invoiceNumber: 'INV-2024-0001', items: [{ chargeCode: 'CONS-001', chargeName: 'General Consultation', quantity: 1, unitPrice: 1000, totalPrice: 1000, isInsuranceCovered: true, insuranceCoveredAmount: 900 }, { chargeCode: 'LAB-FBC', chargeName: 'Full Blood Count', quantity: 1, unitPrice: 500, totalPrice: 500, isInsuranceCovered: true, insuranceCoveredAmount: 500 }, { chargeCode: 'IMG-Chest', chargeName: 'Chest X-Ray', quantity: 1, unitPrice: 1500, totalPrice: 1500, isInsuranceCovered: true, insuranceCoveredAmount: 1275 }], subtotal: 3000, discount: 0, tax: 0, total: 3000, amountPaid: 3000, balance: 0, status: InvoiceStatus.Paid, notes: 'NHIF cover', issuedAt: Date.now() - 86400000, closedAt: Date.now() - 43200000 },
  { id: 'INV-002', patientId: 'P-003', encounterId: 'ENC-003', invoiceNumber: 'INV-2024-0002', items: [{ chargeCode: 'WARD-A', chargeName: 'General Ward (3 days)', quantity: 3, unitPrice: 3000, totalPrice: 9000, isInsuranceCovered: true, insuranceCoveredAmount: 9000 }, { chargeCode: 'LAB-FBC', chargeName: 'Full Blood Count', quantity: 2, unitPrice: 500, totalPrice: 1000, isInsuranceCovered: true, insuranceCoveredAmount: 1000 }], subtotal: 10000, discount: 0, tax: 0, total: 10000, amountPaid: 5000, balance: 5000, status: InvoiceStatus.Partial, notes: 'Partial payment via M-Pesa', issuedAt: Date.now() - 604800000 },
  { id: 'INV-003', patientId: 'P-005', encounterId: 'ENC-005', invoiceNumber: 'INV-2024-0003', items: [{ chargeCode: 'SURG-APP', chargeName: 'Appendicectomy', quantity: 1, unitPrice: 50000, totalPrice: 50000, isInsuranceCovered: true, insuranceCoveredAmount: 40000 }], subtotal: 50000, discount: 0, tax: 0, total: 50000, amountPaid: 0, balance: 50000, status: InvoiceStatus.InsurancePending, insuranceClaimId: 'CLM-001', issuedAt: Date.now() - 172800000 },
];

const MOCK_PAYMENTS: Payment[] = [
  { id: 'PAY-001', invoiceId: 'INV-001', amount: 3000, method: PaymentMethod.Insurance, reference: 'NHIF-REF-001', status: PaymentStatus.Completed, receivedAt: Date.now() - 43200000, receivedBy: 'cashier-01' },
  { id: 'PAY-002', invoiceId: 'INV-002', amount: 5000, method: PaymentMethod.MPesa, reference: 'MPESA-REF-001', status: PaymentStatus.Completed, receivedAt: Date.now() - 259200000, receivedBy: 'cashier-01' },
];

const MOCK_CLAIMS: InsuranceClaim[] = [
  { id: 'CLM-001', invoiceId: 'INV-003', provider: 'NHIF', memberNumber: 'NH-987654', claimItems: [{ chargeCode: 'SURG-APP', chargeName: 'Appendicectomy', amount: 50000, isApproved: false }], totalAmount: 50000, status: InsuranceClaimStatus.Submitted, submittedAt: Date.now() - 172800000 },
];

export default function BillingPage() {
  const [charges] = useState(MOCK_CHARGES);
  const [invoices] = useState(MOCK_INVOICES);
  const [payments] = useState(MOCK_PAYMENTS);
  const [claims] = useState(MOCK_CLAIMS);
  const [tab, setTab] = useState<'invoices' | 'charges' | 'payments'>('invoices');

  const totalBilled = useMemo(() => invoices.reduce((s, i) => s + i.total, 0), [invoices]);
  const totalPaid = useMemo(() => invoices.reduce((s, i) => s + i.amountPaid, 0), [invoices]);
  const totalBalance = useMemo(() => invoices.reduce((s, i) => s + i.balance, 0), [invoices]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>Billing Engine</h1>
          <p style={{ fontSize: 13, color: '#64748B' }}>Book XV — Charge capture, invoices, M-Pesa, insurance claims, split payments</p>
        </div>
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#34D399,#10B981)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + New Invoice
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[{ label: 'Total Billed', value: `KES ${totalBilled.toLocaleString()}`, color: '#34D399' },
          { label: 'Total Paid', value: `KES ${totalPaid.toLocaleString()}`, color: '#10B981' },
          { label: 'Outstanding', value: `KES ${totalBalance.toLocaleString()}`, color: '#EF4444' },
          { label: 'Invoices', value: invoices.length, color: '#3B82F6' },
          { label: 'Pending Claims', value: claims.filter(c => c.status === InsuranceClaimStatus.Submitted || c.status === InsuranceClaimStatus.UnderReview).length, color: '#F59E0B' },
        ].map(stat => (
          <div key={stat.label} style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: stat.color, fontFamily: "'Syne',sans-serif" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 8 }}>
        {(['invoices', 'charges', 'payments'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: tab === t ? 'rgba(52,211,153,0.15)' : 'transparent', color: tab === t ? '#34D399' : '#64748B', fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: 'pointer' }}>
            {t === 'invoices' ? '📄 Invoices' : t === 'charges' ? '💰 Charge Items' : '💳 Payments'}
          </button>
        ))}
      </div>

      {tab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {invoices.map(inv => (
            <div key={inv.id} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{inv.invoiceNumber} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· Patient: {inv.patientId}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{inv.items.length} items · Issued: {new Date(inv.issuedAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: 16, fontWeight: 700, color: inv.balance > 0 ? '#EF4444' : '#10B981' }}>KES {inv.total.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Paid: KES {inv.amountPaid.toLocaleString()} · Balance: KES {inv.balance.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: inv.status === InvoiceStatus.Paid ? 'rgba(16,185,129,0.15)' : inv.status === InvoiceStatus.Partial ? 'rgba(245,158,11,0.15)' : inv.status === InvoiceStatus.InsurancePending ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', color: inv.status === InvoiceStatus.Paid ? '#10B981' : inv.status === InvoiceStatus.Partial ? '#F59E0B' : inv.status === InvoiceStatus.InsurancePending ? '#3B82F6' : '#94A3B8' }}>
                  {inv.status}
                </span>
                {inv.insuranceClaimId && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>Claim: {inv.insuranceClaimId}</span>}
                <span style={{ fontSize: 10, color: '#64748B' }}>{inv.notes}</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {inv.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#94A3B8', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                    {item.chargeName} × {item.quantity} = KES {item.totalPrice.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'charges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8 }}>
          {charges.map(c => (
            <div key={c.id} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{c.name}</div>
              <div style={{ fontSize: 13, color: '#34D399', margin: '4px 0' }}>KES {c.unitPrice.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>{c.category} · {c.code}</div>
              <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: c.insuranceCovered ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: c.insuranceCovered ? '#10B981' : '#EF4444' }}>{c.insuranceCovered ? `${c.insuranceCoveragePercent}% covered` : 'Not covered'}</span>
                {c.isPackage && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>Package</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {payments.map(p => (
            <div key={p.id} style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>{p.id} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 400 }}>· {p.method} · Ref: {p.reference}</span></div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Invoice: {p.invoiceId} · Received by: {p.receivedBy} · {new Date(p.receivedAt).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#34D399' }}>KES {p.amount.toLocaleString()}</div>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: p.status === PaymentStatus.Completed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: p.status === PaymentStatus.Completed ? '#10B981' : '#EF4444' }}>{p.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
