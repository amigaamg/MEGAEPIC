'use client'

import { useState } from 'react'
import { C } from '@/lib/colors'
import { UserPlus, Search, Check, Calendar, Phone, MapPin, FileText } from 'lucide-react'

export default function RegisterPatientPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '', dob: '', gender: '', phone: '', email: '',
    idType: 'national_id', idNumber: '', county: '', subCounty: '', village: '', nextOfKin: '', nextOfKinPhone: '', relationship: '',
  })

  const update = (f: string, v: string) => setForm({ ...form, [f]: v })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <UserPlus size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Patient Registration</span>
      </div>
      <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
          {['Demographics', 'Contact & ID', 'Next of Kin', 'Review'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= i + 1 ? C.sky : 'var(--surface-border)', color: step >= i + 1 ? C.white : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
              <span style={{ fontSize: 11, fontWeight: step >= i + 1 ? 600 : 400, color: step >= i + 1 ? C.sky : 'var(--text-muted)' }}>{s}</span>
              {i < 3 && <div style={{ flex: 1, height: 1, background: step >= i + 2 ? C.sky : 'var(--surface-border)' }} />}
            </div>
          ))}
        </div>
        <div style={{ padding: 20, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Demographics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ f: 'firstName', l: 'First Name' }, { f: 'middleName', l: 'Middle Name' }, { f: 'lastName', l: 'Last Name' }, { f: 'gender', l: 'Gender', t: 'select', o: ['Male', 'Female', 'Other'] }, { f: 'dob', l: 'Date of Birth', t: 'date' }].map(f => (
                  <div key={f.f}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>{f.l}</div>
                    {f.t === 'select' ? (
                      <select style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} value={form[f.f as keyof typeof form]} onChange={e => update(f.f, e.target.value)}><option value="">Select...</option>{f.o?.map(o => <option key={o}>{o}</option>)}</select>
                    ) : (
                      <input type={f.t || 'text'} style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} value={form[f.f as keyof typeof form]} onChange={e => update(f.f, e.target.value)} placeholder={f.l} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Contact & ID</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ f: 'phone', l: 'Phone Number' }, { f: 'email', l: 'Email' }, { f: 'idType', l: 'ID Type', t: 'select', o: ['National ID', 'Passport', 'Birth Certificate', 'Huduma Namba'] }, { f: 'idNumber', l: 'ID Number' }, { f: 'county', l: 'County' }, { f: 'subCounty', l: 'Sub-County' }, { f: 'village', l: 'Village/Estate' }].map(f => (
                  <div key={f.f}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>{f.l}</div>
                    {f.t === 'select' ? (
                      <select style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} value={form[f.f as keyof typeof form]} onChange={e => update(f.f, e.target.value)}><option value="">Select...</option>{f.o?.map(o => <option key={o}>{o}</option>)}</select>
                    ) : (
                      <input style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} value={form[f.f as keyof typeof form]} onChange={e => update(f.f, e.target.value)} placeholder={f.l} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Next of Kin</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ f: 'nextOfKin', l: 'Next of Kin Name' }, { f: 'nextOfKinPhone', l: 'Next of Kin Phone' }, { f: 'relationship', l: 'Relationship', t: 'select', o: ['Spouse', 'Parent', 'Sibling', 'Child', 'Guardian', 'Friend'] }].map(f => (
                  <div key={f.f}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase' }}>{f.l}</div>
                    {f.t === 'select' ? (
                      <select style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} value={form[f.f as keyof typeof form]} onChange={e => update(f.f, e.target.value)}><option value="">Select...</option>{f.o?.map(o => <option key={o}>{o}</option>)}</select>
                    ) : (
                      <input style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }} value={form[f.f as keyof typeof form]} onChange={e => update(f.f, e.target.value)} placeholder={f.l} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Review & Submit</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>Name:</strong> {form.firstName} {form.middleName} {form.lastName}</div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>DOB/Gender:</strong> {form.dob} / {form.gender}</div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>Phone:</strong> {form.phone} {form.email && `| Email: ${form.email}`}</div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>ID:</strong> {form.idType}: {form.idNumber}</div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>Location:</strong> {form.county}, {form.subCounty}, {form.village}</div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)' }}><strong>Next of Kin:</strong> {form.nextOfKin} ({form.relationship}) · {form.nextOfKinPhone}</div>
              </div>
              <button onClick={() => alert('Patient registered successfully. AMX-PAT-' + String(Math.floor(Math.random() * 90000 + 10000)))} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}>Register Patient</button>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: step === 1 ? 'not-allowed' : 'pointer', fontSize: 12, opacity: step === 1 ? 0.5 : 1 }}>Back</button>
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Next</button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
