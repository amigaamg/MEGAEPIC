'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { Pill, Search, Plus, Trash2, Printer, Check, AlertTriangle, X } from 'lucide-react'

const S = {
  wrap: { minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' },
  head: { height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 },
  logo: { fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' },
  sep: { width: 1, height: 20, background: 'var(--surface-border)' },
  body: { padding: 24, maxWidth: 1000, margin: '0 auto' },
  card: { padding: 20, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' },
  label: { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' as const },
  input: { width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' },
  select: { width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit' },
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  btnSec: { padding: '6px 12px', borderRadius: 6, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
}

interface MedItem {
  id: string
  drug: string
  dose: string
  unit: string
  route: string
  frequency: string
  duration: string
  quantity: number
  instructions: string
}

export default function PrescribePage() {
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [items, setItems] = useState<MedItem[]>([
    { id: '1', drug: 'Amlodipine', dose: '5', unit: 'mg', route: 'PO', frequency: 'OD', duration: '30 days', quantity: 30, instructions: 'Take in the morning' },
  ])
  const [showConfirm, setShowConfirm] = useState(false)

  const addItem = () => {
    const id = String(Date.now())
    setItems([...items, { id, drug: '', dose: '5', unit: 'mg', route: 'PO', frequency: 'OD', duration: '7 days', quantity: 0, instructions: '' }])
  }

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id))

  const updateItem = (id: string, field: keyof MedItem, value: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const drugOptions = [
    'Amlodipine', 'Metformin', 'Atorvastatin', 'Lisinopril', 'Omeprazole',
    'Paracetamol', 'Amoxicillin', 'Cetirizine', 'Salbutamol', 'Ibuprofen',
    'Losartan', 'Hydrochlorothiazide', 'Aspirin', 'Metoprolol', 'Furosemide',
  ]

  return (
    <div style={S.wrap}>
      <div style={S.head}>
        <Pill size={18} color={C.sky} /><span style={S.logo}>AMEXAN</span>
        <span style={S.sep} /><span style={{ fontSize: 13, fontWeight: 600 }}>Prescribe</span>
        <div style={{ flex: 1 }} />
        <button style={S.btnSec}><Printer size={12} /> Preview</button>
        <button style={S.btn} onClick={() => setShowConfirm(true)}><Check size={14} /> Sign & Dispense</button>
      </div>
      <div style={S.body}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={S.card}>
            <div style={S.label}>Patient</div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input style={{ ...S.input, paddingLeft: 30 }} placeholder="Search patient by name or ID..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
            </div>
            {selectedPatient && <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Check size={14} color="#10B981" /> John Mwangi · M/68 · AMX-PAT-00872</div>}
          </div>
          <div style={S.card}>
            <div style={S.label}>Prescriber</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Dr. James Kamau</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>KMPDC 5678 · General Surgery · Kisii TRH</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>12 Jul 2026</div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={S.label}>Medication Orders</div>
            <button style={S.btnSec} onClick={addItem}><Plus size={12} /> Add Drug</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item) => (
              <div key={item.id} style={{ padding: 12, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 60px 80px 80px 80px 40px', gap: 8, alignItems: 'end' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Drug</div>
                    <select style={S.select} value={item.drug} onChange={e => updateItem(item.id, 'drug', e.target.value)}>
                      <option value="">Select...</option>
                      {drugOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Dose</div>
                    <input style={S.input} value={item.dose} onChange={e => updateItem(item.id, 'dose', e.target.value)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Unit</div>
                    <select style={S.select} value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)}>
                      <option>mg</option><option>g</option><option>mcg</option><option>mL</option><option>IU</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Route</div>
                    <select style={S.select} value={item.route} onChange={e => updateItem(item.id, 'route', e.target.value)}>
                      <option>PO</option><option>IV</option><option>IM</option><option>SC</option><option>SL</option><option>PR</option><option>Topical</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Frequency</div>
                    <select style={S.select} value={item.frequency} onChange={e => updateItem(item.id, 'frequency', e.target.value)}>
                      <option>OD</option><option>BD</option><option>TDS</option><option>QDS</option><option>Q4H</option><option>Q6H</option><option>Q8H</option><option>PRN</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Duration</div>
                    <input style={S.input} value={item.duration} onChange={e => updateItem(item.id, 'duration', e.target.value)} />
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #EF444430', background: '#EF444410', color: '#EF4444', cursor: 'pointer', fontSize: 11 }}><Trash2 size={12} /></button>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Special Instructions</div>
                  <textarea style={{ ...S.textarea, height: 36 }} value={item.instructions} onChange={e => updateItem(item.id, 'instructions', e.target.value)} placeholder="e.g. Take with food, avoid grapefruit..." />
                </div>
              </div>
            ))}
          </div>
        </div>
        {items.length > 0 && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#F59E0B10', border: '1px solid #F59E0B30', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#92400E' }}>
            <AlertTriangle size={14} /> Please verify all medications for allergies, interactions, and correct dosing before signing.
          </div>
        )}
      </div>
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ padding: 24, background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)', width: 400, maxWidth: '90vw' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>Confirm Prescription</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px' }}>Signing as Dr. James Kamau (KMPDC 5678). This action will be digitally signed and recorded in the audit log.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirm(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
              <button onClick={() => { setShowConfirm(false); alert('Prescription signed and sent to pharmacy.') }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Sign & Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
