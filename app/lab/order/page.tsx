'use client'

import { useState, useEffect } from 'react'
import { collection, addDoc, query, getDocs, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { C } from '@/lib/colors'
import { FlaskConical, Search, Check, X, AlertTriangle, Loader2 } from 'lucide-react'

const TEST_CATEGORIES = [
  {
    cat: 'Haematology', items: [
      { id: 'cbc', name: 'CBC', ref: 'Full blood count: RBC, Hb, Hct, MCV, MCH, MCHC, RDW, WBC + differential, platelets', specimen: 'Whole blood EDTA' },
      { id: 'hb', name: 'Hb', ref: '13-17 g/dL (M), 12-15.5 g/dL (F)', specimen: 'Whole blood EDTA' },
      { id: 'wbc_diff', name: 'WBC + Diff', ref: '4.0-11.0 x10^9/L', specimen: 'Whole blood EDTA' },
      { id: 'platelets', name: 'Platelets', ref: '150-450 x10^9/L', specimen: 'Whole blood EDTA' },
      { id: 'esr', name: 'ESR', ref: '0-15 mm/hr (M), 0-20 mm/hr (F)', specimen: 'Whole blood citrate' },
      { id: 'pt_inr', name: 'PT/INR', ref: '11-14 sec, INR 0.9-1.2', specimen: 'Whole blood citrate' },
      { id: 'aptt', name: 'APTT', ref: '25-35 sec', specimen: 'Whole blood citrate' },
      { id: 'blood_group', name: 'Blood Group', ref: 'A/B/AB/O + Rh', specimen: 'Whole blood EDTA' },
      { id: 'retic', name: 'Reticulocyte Count', ref: '0.5-2.5%', specimen: 'Whole blood EDTA' },
      { id: 'peripheral_smear', name: 'Peripheral Smear', ref: 'Normocytic/normochromic', specimen: 'Blood smear' },
      { id: 'malaria_bs', name: 'Malaria BS', ref: 'Negative', specimen: 'Whole blood EDTA / Finger prick' },
      { id: 'blood_culture', name: 'Blood Culture', ref: 'Negative after 5 days', specimen: 'BacT/ALERT bottles x2 sets' },
    ],
  },
  {
    cat: 'Biochemistry', items: [
      { id: 'ue', name: 'U&E', ref: 'Na 135-145, K 3.5-5.1, Cl 98-107 mmol/L', specimen: 'Serum SST' },
      { id: 'creatinine', name: 'Creatinine', ref: '60-110 umol/L (M), 45-90 umol/L (F)', specimen: 'Serum SST' },
      { id: 'urea', name: 'Urea', ref: '2.5-6.7 mmol/L', specimen: 'Serum SST' },
      { id: 'lft', name: 'LFT', ref: 'ALT <40, AST <40, ALP 40-130, GGT <60, TBil <21, Alb 35-50', specimen: 'Serum SST' },
      { id: 'glucose_fasting', name: 'Fasting Glucose', ref: '3.9-6.1 mmol/L', specimen: 'Fluoride oxalate' },
      { id: 'glucose_random', name: 'Random Glucose', ref: '<11.1 mmol/L', specimen: 'Fluoride oxalate' },
      { id: 'hba1c', name: 'HbA1c', ref: '<5.7% normal, 5.7-6.4% pre-diabetes, >=6.5% diabetes', specimen: 'Whole blood EDTA' },
      { id: 'lipid_profile', name: 'Lipid Profile', ref: 'TC <5.2, LDL <3.0, HDL >1.0, TG <1.7 mmol/L', specimen: 'Serum SST (fasting)' },
      { id: 'crp', name: 'CRP', ref: '<5 mg/L', specimen: 'Serum SST' },
      { id: 'procalcitonin', name: 'Procalcitonin', ref: '<0.5 ng/mL', specimen: 'Serum SST' },
      { id: 'troponin', name: 'Troponin I/T', ref: '<14 ng/L (hs-cTnI), <99th percentile URL', specimen: 'Serum SST' },
      { id: 'bnp_ntprobnp', name: 'BNP/NT-proBNP', ref: 'BNP <100, NT-proBNP <125 pg/mL', specimen: 'Serum SST' },
      { id: 'tsh', name: 'TSH', ref: '0.4-4.0 mIU/L', specimen: 'Serum SST' },
      { id: 'vitamin_d', name: 'Vitamin D', ref: '25-OH D: 50-125 nmol/L', specimen: 'Serum SST' },
      { id: 'ferritin', name: 'Ferritin', ref: '30-400 ug/L (M), 15-150 ug/L (F)', specimen: 'Serum SST' },
      { id: 'b12', name: 'Vitamin B12', ref: '150-700 pmol/L', specimen: 'Serum SST' },
      { id: 'folate', name: 'Folate', ref: '>7 nmol/L', specimen: 'Serum SST' },
      { id: 'lactate', name: 'Lactate', ref: '0.5-2.0 mmol/L', specimen: 'Whole blood fluoride oxalate (on ice)' },
      { id: 'abg', name: 'Arterial Blood Gas', ref: 'pH 7.35-7.45, pCO2 35-45, pO2 80-100, HCO3 22-26, BE -2 to +2', specimen: 'Heparinised syringe (arterial)' },
    ],
  },
  {
    cat: 'Microbiology & Serology', items: [
      { id: 'urine_cs', name: 'Urine C&S', ref: '<10^4 CFU/mL mixed flora', specimen: 'Midstream urine (sterile container)' },
      { id: 'wound_swab', name: 'Wound Swab C&S', ref: 'No significant growth', specimen: 'Swab in transport medium' },
      { id: 'sputum_cs', name: 'Sputum C&S', ref: 'Normal respiratory flora', specimen: 'Expectorated sputum (sterile container)' },
      { id: 'sputum_afb', name: 'Sputum AFB / GeneXpert', ref: 'Negative for MTB', specimen: 'Sputum (2-3 samples)' },
      { id: 'hiv_ag_ab', name: 'HIV Ag/Ab Combo', ref: 'Non-reactive', specimen: 'Serum/Plasma' },
      { id: 'hbsag', name: 'HBsAg', ref: 'Non-reactive', specimen: 'Serum SST' },
      { id: 'hcv_ab', name: 'HCV Ab', ref: 'Non-reactive', specimen: 'Serum SST' },
      { id: 'vdrl_rpr', name: 'VDRL/RPR', ref: 'Non-reactive', specimen: 'Serum SST' },
      { id: 'malaria_rdt', name: 'Malaria RDT', ref: 'Negative', specimen: 'Finger prick whole blood' },
      { id: 'dengue_ns1', name: 'Dengue NS1/IgM/IgG', ref: 'Negative', specimen: 'Serum SST' },
      { id: 'brucella', name: 'Brucella Ab', ref: 'Titre <1:80', specimen: 'Serum SST' },
    ],
  },
  {
    cat: 'Other', items: [
      { id: 'urinalysis', name: 'Urinalysis', ref: 'pH 4.5-8.0, SG 1.005-1.030, glucose/blood/protein/ketones negative', specimen: 'Midstream urine' },
      { id: 'stool_analysis', name: 'Stool Analysis', ref: 'No ova/cysts/parasites seen', specimen: 'Fresh stool' },
      { id: 'pregnancy_test', name: 'Pregnancy Test (hCG)', ref: 'Negative', specimen: 'Urine / Serum' },
      { id: 'psa', name: 'PSA', ref: '<4 ng/mL', specimen: 'Serum SST' },
      { id: 'csf_analysis', name: 'CSF Analysis', ref: 'Clear, glucose 2.2-3.9, protein 15-45, WBC <5, no organisms', specimen: 'CSF (tubes 1-4, sterile)' },
      { id: 'semen_analysis', name: 'Semen Analysis', ref: 'Volume >1.5, count >15M, motility >40%, normal forms >4%', specimen: 'Masturbation (sterile container)' },
    ],
  },
]

interface PatientResult {
  id: string
  name: string
  mrn: string
  age: number
  sex: string
}

export default function LabOrderPage() {
  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState<PatientResult[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null)
  const [selectedTests, setSelectedTests] = useState<{ id: string; name: string }[]>([])
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    if (!patientSearch.trim() || patientSearch.trim().length < 2) {
      setPatients([])
      return
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      setSearchError('')
      try {
        const q = query(
          collection(db, 'patients'),
          where('displayName', '>=', patientSearch.trim()),
          where('displayName', '<=', patientSearch.trim() + '\uf8ff')
        )
        const snap = await getDocs(q)
        setPatients(snap.docs.map(d => {
          const data = d.data()
          return {
            id: d.id,
            name: data.displayName || data.name || 'Unknown',
            mrn: data.mrn || data.medicalRecordNumber || 'N/A',
            age: data.age || 0,
            sex: data.sex || 'U',
          }
        }))
      } catch (e) {
        setSearchError('Search failed. Ensure Firestore "patients" collection exists.')
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [patientSearch])

  const toggleTest = (test: { id: string; name: string }) => {
    setSelectedTests(prev =>
      prev.some(t => t.id === test.id)
        ? prev.filter(t => t.id !== test.id)
        : [...prev, test]
    )
  }

  const handleSubmit = async () => {
    if (!selectedPatient || selectedTests.length === 0) return
    setSubmitting(true)
    try {
      const orderData = {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientAge: selectedPatient.age,
        patientSex: selectedPatient.sex,
        patientMRN: selectedPatient.mrn,
        tests: selectedTests.map(t => ({ testId: t.id, testName: t.name })),
        clinicalNotes,
        status: 'ordered',
        priority: 'routine',
        orderedAt: Timestamp.now(),
        orderedBy: 'current-user',
        orderedByName: 'Doctor',
      }
      await addDoc(collection(db, 'labOrders'), orderData)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
      setShowConfirm(false)
      setSelectedTests([])
      setClinicalNotes('')
    } catch (e) {
      alert('Failed to submit lab order. Check Firestore permissions.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <FlaskConical size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Lab Order</span>
        <div style={{ flex: 1 }} />
        {submitted && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10B981' }}><Check size={14} /> Order submitted to lab</span>}
        <button onClick={() => selectedPatient && selectedTests.length > 0 && setShowConfirm(true)}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: selectedPatient && selectedTests.length > 0 ? C.sky : 'var(--surface-border)', color: selectedPatient && selectedTests.length > 0 ? C.white : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: selectedPatient && selectedTests.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check size={14} /> Submit Order
        </button>
      </div>
      <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Patient</div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input style={{ width: '100%', height: 36, padding: '0 10px 0 30px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                placeholder="Search patient name or MRN..." value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
            </div>
            {searching && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}><Loader2 size={12} style={{ display: 'inline', marginRight: 4, animation: 'spin 1s linear infinite' }} />Searching...</div>}
            {searchError && <div style={{ marginTop: 8, fontSize: 11, color: '#EF4444' }}>{searchError}</div>}
            {patients.length > 0 && !selectedPatient && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {patients.map(p => (
                  <div key={p.id} onClick={() => { setSelectedPatient(p); setPatients([]); setPatientSearch('') }}
                    style={{ padding: '6px 10px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', cursor: 'pointer', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{p.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{p.sex}/{p.age} · {p.mrn}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedPatient && (
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 6, background: 'var(--surface)', border: '1px solid var(--surface-border)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={14} color="#10B981" />
                <span>{selectedPatient.name} · {selectedPatient.sex}/{selectedPatient.age} · {selectedPatient.mrn}</span>
                <button onClick={() => setSelectedPatient(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: 2 }}>×</button>
              </div>
            )}
          </div>
          <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Ordering Clinician</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Doctor (current user)</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-assigned · {new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div style={{ padding: 16, background: 'var(--surface-card)', borderRadius: 12, border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Select Tests {selectedTests.length > 0 && <span style={{ color: C.sky }}>({selectedTests.length} selected)</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TEST_CATEGORIES.map(cat => (
              <div key={cat.cat}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>{cat.cat}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {cat.items.map(test => {
                    const isSelected = selectedTests.some(t => t.id === test.id)
                    return (
                      <button key={test.id} onClick={() => toggleTest({ id: test.id, name: test.name })}
                        title={`${test.ref}\nSpecimen: ${test.specimen}`}
                        style={{
                          padding: '5px 10px', borderRadius: 6,
                          border: isSelected ? `2px solid ${C.sky}` : '1px solid var(--surface-border)',
                          background: isSelected ? C.sky + '15' : 'var(--surface)',
                          color: isSelected ? C.sky : 'var(--text-secondary)',
                          fontSize: 11, cursor: 'pointer', fontWeight: isSelected ? 600 : 400,
                        }}>
                        {isSelected ? <Check size={10} style={{ display: 'inline', marginRight: 4 }} /> : null}
                        {test.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Clinical Notes</div>
            <textarea style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'inherit' }}
              value={clinicalNotes} onChange={e => setClinicalNotes(e.target.value)} placeholder="Relevant clinical information for the lab..." />
          </div>
        </div>
      </div>
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ padding: 24, background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)', width: 400, maxWidth: '90vw' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>Confirm Lab Order</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px' }}>{selectedTests.length} tests for {selectedPatient?.name}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
              {selectedTests.map(t => <span key={t.id} style={{ padding: '3px 8px', borderRadius: 4, background: C.sky + '15', color: C.sky, fontSize: 10 }}>{t.name}</span>)}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirm(false)} disabled={submitting}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.sky, color: C.white, fontSize: 12, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                {submitting ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`
      }} />
    </div>
  )
}
