'use client'

import { useState, useEffect } from 'react'
import { collection, addDoc, query, getDocs, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { C } from '@/lib/colors'
import { Scan, Search, Check, X, AlertTriangle, Loader2 } from 'lucide-react'

const MODALITIES = [
  {
    name: 'X-Ray', items: [
      { id: 'cxr_pa', name: 'Chest PA', protocol: 'PA erect, full inspiration', contrast: 'None', prep: 'Remove chest jewellery' },
      { id: 'cxr_ap', name: 'Chest AP', protocol: 'AP erect/supine (portable)', contrast: 'None', prep: 'Remove chest jewellery' },
      { id: 'abd_supine', name: 'Abdomen Supine', protocol: 'KUB (kidneys-ureters-bladder)', contrast: 'None', prep: 'None' },
      { id: 'abd_erect', name: 'Abdomen Erect', protocol: 'Erect AP', contrast: 'None', prep: 'None' },
      { id: 'pelvis_ap', name: 'Pelvis AP', protocol: 'AP', contrast: 'None', prep: 'None' },
      { id: 'cspine', name: 'C-spine AP/Lat', protocol: 'AP + lateral + odontoid', contrast: 'None', prep: 'Remove neck jewellery' },
      { id: 'tspine', name: 'T-spine AP/Lat', protocol: 'AP + lateral', contrast: 'None', prep: 'None' },
      { id: 'lspine', name: 'L-spine AP/Lat', protocol: 'AP + lateral', contrast: 'None', prep: 'None' },
      { id: 'sinus_om', name: 'Sinus OM', protocol: 'Occipitomental', contrast: 'None', prep: 'None' },
    ],
  },
  {
    name: 'Ultrasound', items: [
      { id: 'us_abdomen', name: 'Abdomen', protocol: 'Full abdomen survey: liver, GB, pancreas, spleen, kidneys, aorta', contrast: 'None', prep: 'Fast 6h' },
      { id: 'us_pelvis', name: 'Pelvis', protocol: 'Transabdominal / transvaginal', contrast: 'None', prep: 'Full bladder' },
      { id: 'us_obstetric', name: 'Obstetric', protocol: 'Fetal survey + biometry + Doppler', contrast: 'None', prep: 'Full bladder (early)' },
      { id: 'us_renal', name: 'Renal', protocol: 'Both kidneys + ureters + bladder + residual volume', contrast: 'None', prep: 'Full bladder' },
      { id: 'us_thyroid', name: 'Thyroid', protocol: 'Neck: thyroid gland + lymph nodes', contrast: 'None', prep: 'None' },
      { id: 'us_echo', name: 'Echocardiogram', protocol: '2D + M-mode + Doppler + colour flow', contrast: 'If bubble study needed', prep: 'None' },
      { id: 'us_doppler_ll', name: 'Doppler Lower Limb', protocol: 'B-mode + colour + spectral Doppler: DVT assessment', contrast: 'None', prep: 'None' },
    ],
  },
  {
    name: 'CT', items: [
      { id: 'ct_head_nc', name: 'CT Head (Non-contrast)', protocol: 'Axial 5mm + MPR', contrast: 'None', prep: 'None' },
      { id: 'ct_head_c', name: 'CT Head (Contrast)', protocol: 'Pre + post-contrast axial', contrast: 'Iodinated IV 1.5 mL/kg', prep: 'Check Cr/GFR' },
      { id: 'ct_chest', name: 'CT Chest', protocol: 'Helical chest + IV contrast', contrast: 'Iodinated IV 1.5 mL/kg', prep: 'Check Cr/GFR' },
      { id: 'ct_abd_pelvis', name: 'CT Abdomen/Pelvis', protocol: 'Portal venous phase + delayed', contrast: 'Iodinated IV 1.5 mL/kg', prep: 'Fast 4h, oral contrast optional, check Cr/GFR' },
      { id: 'ct_kub', name: 'CT KUB', protocol: 'Low-dose non-contrast KUB', contrast: 'None', prep: 'None' },
      { id: 'ct_pulmonary_angio', name: 'CT Pulmonary Angio', protocol: 'CTA chest, bolus tracking, thin collimation', contrast: 'Iodinated IV 4 mL/s', prep: 'Check Cr/GFR, peripheral IV 18G' },
      { id: 'ct_spine', name: 'CT Spine', protocol: 'Axial + sagittal + coronal MPR', contrast: 'None', prep: 'None' },
    ],
  },
  {
    name: 'MRI', items: [
      { id: 'mri_brain', name: 'MRI Brain', protocol: 'Axial T1, T2, FLAIR, DWI + ADC, SWI, post-contrast T1', contrast: 'Gadolinium IV 0.1 mmol/kg', prep: 'Check eGFR >30, remove metal' },
      { id: 'mri_spine', name: 'MRI Spine', protocol: 'Sagittal T1, T2, STIR; axial T2', contrast: 'If tumour/infection suspected', prep: 'Remove metal' },
      { id: 'mri_knee', name: 'MRI Knee', protocol: 'Coronal T1, T2, sagittal PD fat sat, axial PD', contrast: 'None', prep: 'None' },
      { id: 'mri_shoulder', name: 'MRI Shoulder', protocol: 'Coronal T1, T2, sagittal T2, axial PD', contrast: 'Intra-articular if MR arthrogram', prep: 'None' },
      { id: 'mrcp', name: 'MRCP', protocol: 'Thick slab T2 + 3D T2', contrast: 'None', prep: 'Fast 4h' },
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

export default function ImagingOrderPage() {
  const [patientSearch, setPatientSearch] = useState('')
  const [patients, setPatients] = useState<PatientResult[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null)
  const [selectedImaging, setSelectedImaging] = useState<{ id: string; name: string }[]>([])
  const [clinicalHistory, setClinicalHistory] = useState('')
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
          return { id: d.id, name: data.displayName || data.name || 'Unknown', mrn: data.mrn || data.medicalRecordNumber || 'N/A', age: data.age || 0, sex: data.sex || 'U' }
        }))
      } catch (e) {
        setSearchError('Search failed. Ensure Firestore "patients" collection exists.')
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [patientSearch])

  const toggleImaging = (img: { id: string; name: string }) => {
    setSelectedImaging(prev =>
      prev.some(t => t.id === img.id) ? prev.filter(t => t.id !== img.id) : [...prev, img]
    )
  }

  const handleSubmit = async () => {
    if (!selectedPatient || selectedImaging.length === 0) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'imagingOrders'), {
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientAge: selectedPatient.age,
        patientSex: selectedPatient.sex,
        patientMRN: selectedPatient.mrn,
        studies: selectedImaging.map(i => ({ studyId: i.id, studyName: i.name })),
        clinicalHistory,
        status: 'ordered',
        priority: 'routine',
        orderedAt: Timestamp.now(),
        orderedBy: 'current-user',
        orderedByName: 'Doctor',
      })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
      setShowConfirm(false)
      setSelectedImaging([])
      setClinicalHistory('')
    } catch (e) {
      alert('Failed to submit imaging order. Check Firestore permissions.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-elevated)', fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
      <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
        <Scan size={18} color={C.sky} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--sky-800)' }}>AMEXAN</span>
        <span style={{ width: 1, height: 20, background: 'var(--surface-border)' }} /><span style={{ fontSize: 13, fontWeight: 600 }}>Imaging Order</span>
        <div style={{ flex: 1 }} />
        {submitted && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10B981' }}><Check size={14} /> Order sent to radiology</span>}
        <button onClick={() => selectedPatient && selectedImaging.length > 0 && setShowConfirm(true)}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: selectedPatient && selectedImaging.length > 0 ? C.sky : 'var(--surface-border)', color: selectedPatient && selectedImaging.length > 0 ? C.white : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: selectedPatient && selectedImaging.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
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
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
            Select Imaging {selectedImaging.length > 0 && <span style={{ color: C.sky }}>({selectedImaging.length} selected)</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {MODALITIES.map(mod => (
              <div key={mod.name}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>{mod.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {mod.items.map(img => {
                    const isSelected = selectedImaging.some(t => t.id === img.id)
                    return (
                      <button key={img.id} onClick={() => toggleImaging({ id: img.id, name: img.name })}
                        title={`Protocol: ${img.protocol}\nContrast: ${img.contrast}\nPrep: ${img.prep}`}
                        style={{
                          padding: '5px 10px', borderRadius: 6,
                          border: isSelected ? `2px solid ${C.sky}` : '1px solid var(--surface-border)',
                          background: isSelected ? C.sky + '15' : 'var(--surface)',
                          color: isSelected ? C.sky : 'var(--text-secondary)',
                          fontSize: 11, cursor: 'pointer', fontWeight: isSelected ? 600 : 400,
                        }}>
                        {isSelected ? <Check size={10} style={{ display: 'inline', marginRight: 4 }} /> : null}
                        {img.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Clinical History</div>
            <textarea style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'inherit' }}
              value={clinicalHistory} onChange={e => setClinicalHistory(e.target.value)} placeholder="Relevant clinical history and indication for imaging..." />
          </div>
        </div>
      </div>
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ padding: 24, background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)', width: 400, maxWidth: '90vw' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>Confirm Imaging Order</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px' }}>{selectedImaging.length} study/studies for {selectedPatient?.name}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
              {selectedImaging.map(i => <span key={i.id} style={{ padding: '3px 8px', borderRadius: 4, background: C.sky + '15', color: C.sky, fontSize: 10 }}>{i.name}</span>)}
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
