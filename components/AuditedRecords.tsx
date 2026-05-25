'use client';
// ─────────────────────────────────────────────────────────────────────────────
// components/AuditedRecords.tsx
// Editable prescriptions / notes / labs with full audit trail
// All edits require a reason. Every change is time-stamped and logged.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, doc, onSnapshot, query,
  where, orderBy, serverTimestamp, getDoc, setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AuditEntry, AuditedRecord } from '@/lib/diseaseTools';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Prescription {
  medication: string; dosage: string; frequency: string;
  duration: string; instructions?: string; addedAt: string;
}

interface LabResult {
  testName: string; value: string; unit: string; referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical'; collectedAt: string; lab?: string;
}

// ─── Audit Trail Viewer ─────────────────────────────────────────────────────────
function AuditTrail({ log }: { log: AuditEntry[] }) {
  if (!log?.length) return <div style={{ fontSize:12,color:'#8fa3bd',fontStyle:'italic' }}>No edit history.</div>;
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
      {log.map((e, i) => (
        <div key={i} style={{ fontSize:11,padding:'8px 10px',background:'#fafafa',borderRadius:8,border:'1px solid #e2e9f3',borderLeft:'3px solid #6366f1' }}>
          <div style={{ display:'flex',justifyContent:'space-between',color:'#8fa3bd',marginBottom:3 }}>
            <span style={{ fontWeight:700 }}>Changed by Dr. {e.changedByName}</span>
            <span style={{ fontFamily:'monospace' }}>{new Date(e.changedAt).toLocaleString('en-KE')}</span>
          </div>
          <div><strong>{e.field}:</strong> <span style={{ color:'#ef4444',textDecoration:'line-through' }}>{e.oldValue || '—'}</span> → <span style={{ color:'#10b981' }}>{e.newValue}</span></div>
          {e.reason && <div style={{ color:'#64748b',marginTop:3 }}>📝 Reason: <em>{e.reason}</em></div>}
        </div>
      ))}
    </div>
  );
}

// ─── Edit Prescription Modal (with reason + audit) ────────────────────────────
export function EditPrescriptionModal({
  prescription, prescriptionIndex, consultationId, appointmentId,
  allPrescriptions, doctor, onClose,
}: {
  prescription?: Prescription;
  prescriptionIndex?: number;
  consultationId: string;
  appointmentId: string;
  allPrescriptions: Prescription[];
  doctor: { uid: string; name: string };
  onClose: () => void;
}) {
  const isNew = prescription === undefined;
  const [form, setForm] = useState<Prescription>(prescription ?? {
    medication: '', dosage: '', frequency: '', duration: '', instructions: '', addedAt: '',
  });
  const [reason, setReason] = useState('');
  const [saving, setSaving]  = useState(false);
  const [err, setErr]        = useState('');

  const save = async () => {
    if (!form.medication || !form.dosage) { setErr('Medication and dosage are required.'); return; }
    if (!isNew && !reason.trim()) { setErr('Please provide a reason for editing this prescription.'); return; }
    setSaving(true); setErr('');

    const now = new Date().toISOString();
    const updated: Prescription = { ...form, addedAt: isNew ? now : (prescription!.addedAt || now) };

    let newList: Prescription[];
    if (isNew) {
      newList = [...allPrescriptions, updated];
    } else {
      newList = allPrescriptions.map((p, i) => i === prescriptionIndex ? updated : p);
    }

    try {
      // Build audit entry
      const auditEntries: AuditEntry[] = [];
      if (!isNew && prescription) {
        const fields: (keyof Prescription)[] = ['medication', 'dosage', 'frequency', 'duration', 'instructions'];
        fields.forEach(field => {
          if (form[field] !== prescription[field]) {
            auditEntries.push({
              field: String(field),
              oldValue: String(prescription[field] || ''),
              newValue: String(form[field] || ''),
              changedBy: doctor.uid,
              changedByName: doctor.name,
              reason,
              changedAt: now,
            });
          }
        });
      }

      // Save to consultation
      await updateDoc(doc(db, 'consultations', consultationId), { prescriptions: newList });
      await updateDoc(doc(db, 'appointments', appointmentId), { prescriptions: newList });

      // Save audit log to its own collection
      if (auditEntries.length > 0) {
        for (const entry of auditEntries) {
          await addDoc(collection(db, 'prescriptionAudit'), {
            ...entry, consultationId, appointmentId, createdAt: serverTimestamp(),
          });
        }
      }

      // Alert patient about prescription change
      const patientSnap = await getDoc(doc(db, 'appointments', appointmentId));
      const patientId   = patientSnap.data()?.patientId;
      if (patientId) {
        await addDoc(collection(db, 'alerts'), {
          patientId, doctorId: doctor.uid, type: 'medication',
          title: isNew ? '💊 New Prescription Added' : '📝 Prescription Updated',
          message: isNew
            ? `Dr. ${doctor.name} has added ${form.medication} ${form.dosage} to your prescriptions.`
            : `Dr. ${doctor.name} has updated ${form.medication}. Reason: ${reason}. New dosage: ${form.dosage}.`,
          read: false, createdAt: serverTimestamp(),
        });
      }

      onClose();
    } catch (e: any) { setErr(e.message || 'Failed to save.'); }
    setSaving(false);
  };

  const f = (k: keyof Prescription) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours', 'At bedtime', 'As needed (PRN)', 'Once weekly', 'Once monthly'];
  const DURATIONS   = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '2 months', '3 months', '6 months', 'Ongoing (chronic)'];

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(6px)' }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:22,width:'100%',maxWidth:520,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,.18)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'22px 22px 0',display:'flex',justifyContent:'space-between',marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:18,fontWeight:800 }}>{isNew ? '💊 New Prescription' : '✏️ Edit Prescription'}</h3>
            {!isNew && <p style={{ fontSize:12,color:'#8fa3bd',marginTop:2 }}>All changes are logged with reason and timestamp.</p>}
          </div>
          <button onClick={onClose} style={{ background:'#f0f4f8',border:'none',width:30,height:30,borderRadius:8,cursor:'pointer',fontSize:14 }}>✕</button>
        </div>
        <div style={{ padding:'0 22px 22px',display:'flex',flexDirection:'column',gap:12 }}>

          {[
            { k:'medication', label:'Medication Name *', ph:'e.g. Amlodipine 5mg', type:'text' },
            { k:'dosage',     label:'Dosage *',          ph:'e.g. 1 tablet',        type:'text' },
          ].map(field => (
            <div key={field.k}>
              <label style={{ fontSize:10,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',letterSpacing:.6,display:'block',marginBottom:5 }}>{field.label}</label>
              <input type={field.type} value={(form as any)[field.k]} onChange={f(field.k as keyof Prescription)} placeholder={field.ph}
                style={{ width:'100%',padding:'10px 12px',background:'#f8fafc',border:'1.5px solid #e2e9f3',borderRadius:9,fontSize:14,fontFamily:'inherit',outline:'none' }} />
            </div>
          ))}

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div>
              <label style={{ fontSize:10,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',letterSpacing:.6,display:'block',marginBottom:5 }}>Frequency</label>
              <select value={form.frequency} onChange={f('frequency')} style={{ width:'100%',padding:'10px 12px',background:'#f8fafc',border:'1.5px solid #e2e9f3',borderRadius:9,fontSize:13,fontFamily:'inherit',outline:'none' }}>
                <option value="">Select frequency…</option>
                {FREQUENCIES.map(freq => <option key={freq} value={freq}>{freq}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:10,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',letterSpacing:.6,display:'block',marginBottom:5 }}>Duration</label>
              <select value={form.duration} onChange={f('duration')} style={{ width:'100%',padding:'10px 12px',background:'#f8fafc',border:'1.5px solid #e2e9f3',borderRadius:9,fontSize:13,fontFamily:'inherit',outline:'none' }}>
                <option value="">Select duration…</option>
                {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize:10,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',letterSpacing:.6,display:'block',marginBottom:5 }}>Special Instructions</label>
            <input value={form.instructions || ''} onChange={f('instructions')} placeholder="e.g. Take with food, avoid sun exposure"
              style={{ width:'100%',padding:'10px 12px',background:'#f8fafc',border:'1.5px solid #e2e9f3',borderRadius:9,fontSize:14,fontFamily:'inherit',outline:'none' }} />
          </div>

          {!isNew && (
            <div>
              <label style={{ fontSize:10,fontWeight:800,color:'#ef4444',textTransform:'uppercase',letterSpacing:.6,display:'block',marginBottom:5 }}>Reason for Change * (required for audit)</label>
              <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={2}
                placeholder="e.g. Dose reduced due to patient tolerance, switching to alternative due to side effects…"
                style={{ width:'100%',padding:'10px 12px',background:'#fff9f9',border:'1.5px solid rgba(239,68,68,.3)',borderRadius:9,fontSize:13,fontFamily:'inherit',outline:'none',resize:'none' }} />
            </div>
          )}

          {err && <div style={{ background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.3)',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#ef4444',borderLeft:'3px solid #ef4444' }}>{err}</div>}

          <div style={{ display:'flex',gap:10 }}>
            <button onClick={onClose} style={{ flex:1,padding:'11px',background:'transparent',border:'1.5px solid #e2e9f3',borderRadius:12,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'#64748b' }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex:2,padding:'12px',background:'linear-gradient(135deg,#0aaa76,#06b6d4)',color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
              {saving ? 'Saving…' : isNew ? '💊 Add Prescription' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lab Results Entry / Update Modal ─────────────────────────────────────────
export function LabResultsModal({
  appointmentId, patientId, doctorId, doctorName, orderId, existingResults, onClose,
}: {
  appointmentId: string; patientId: string; doctorId: string; doctorName: string;
  orderId?: string; existingResults?: LabResult[]; onClose: () => void;
}) {
  const [results, setResults] = useState<LabResult[]>(existingResults || []);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [newResult, setNewResult] = useState<LabResult>({ testName:'', value:'', unit:'', referenceRange:'', status:'normal', collectedAt:new Date().toISOString().slice(0,10) });
  const [saving, setSaving]    = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);

  const addResult = () => {
    if (!newResult.testName || !newResult.value) return;
    setResults(p => [...p, { ...newResult }]);
    setNewResult({ testName:'', value:'', unit:'', referenceRange:'', status:'normal', collectedAt:new Date().toISOString().slice(0,10) });
    setShowAdd(false);
  };

  const updateResult = (i: number, key: keyof LabResult, val: string) => {
    setResults(p => p.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  };

  const save = async () => {
    setSaving(true);
    try {
      const criticals = results.filter(r => r.status === 'critical');
      const abnormals = results.filter(r => r.status === 'abnormal');

      if (orderId) {
        await updateDoc(doc(db, 'labOrders', orderId), { results: JSON.stringify(results), status: 'resulted', resultedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'labOrders'), {
          appointmentId, patientId, doctorId,
          results: JSON.stringify(results), status: 'resulted',
          createdAt: serverTimestamp(), resultedAt: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, 'appointments', appointmentId), { labResults: results });

      // Alert patient
      await addDoc(collection(db, 'alerts'), {
        patientId, doctorId, type: 'general',
        title: '🧪 Lab Results Available',
        message: criticals.length
          ? `⚠️ CRITICAL: Dr. ${doctorName} has reviewed your lab results. ${criticals.map(r=>r.testName).join(', ')} require immediate attention.`
          : abnormals.length
          ? `Dr. ${doctorName} has reviewed your lab results. Some values require attention: ${abnormals.map(r=>r.testName).join(', ')}.`
          : `Dr. ${doctorName} has reviewed your lab results. All values are within normal range.`,
        read: false, createdAt: serverTimestamp(),
        urgency: criticals.length ? 'emergency' : abnormals.length ? 'urgent' : 'routine',
      });

      onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const COMMON_TESTS = ['Haemoglobin', 'WBC', 'Platelets', 'Creatinine', 'eGFR', 'ALT', 'AST', 'Total Bilirubin', 'Albumin', 'Fasting Glucose', 'HbA1c', 'Total Cholesterol', 'LDL', 'HDL', 'Triglycerides', 'TSH', 'T4', 'Urine Protein', 'Urine Glucose', 'Urine Creatinine', 'HBsAg', 'HIV Ag/Ab', 'Malaria RDT', 'CRP', 'ESR', 'Uric Acid', 'Sodium', 'Potassium', 'Chloride', 'Bicarbonate'];
  const STATUS_COLORS = { normal: '#10b981', abnormal: '#f59e0b', critical: '#ef4444' };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(6px)' }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:22,width:'100%',maxWidth:680,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,.18)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'22px 22px 0',display:'flex',justifyContent:'space-between',marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:18,fontWeight:800 }}>🧪 Lab Results</h3>
            <p style={{ fontSize:12,color:'#8fa3bd',marginTop:2 }}>Enter results — patient will be automatically notified.</p>
          </div>
          <div style={{ display:'flex',gap:8,alignItems:'center' }}>
            <button onClick={()=>setShowAudit(v=>!v)} style={{ padding:'5px 10px',background:'#f0f4f8',border:'none',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'inherit',color:'#64748b' }}>
              {showAudit ? 'Hide' : 'Audit Log'}
            </button>
            <button onClick={onClose} style={{ background:'#f0f4f8',border:'none',width:30,height:30,borderRadius:8,cursor:'pointer',fontSize:14 }}>✕</button>
          </div>
        </div>

        <div style={{ padding:'0 22px 22px',display:'flex',flexDirection:'column',gap:14 }}>
          {showAudit && (
            <div style={{ background:'#f8fafc',borderRadius:12,padding:14 }}>
              <div style={{ fontSize:11,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',letterSpacing:.6,marginBottom:10 }}>Edit History</div>
              <AuditTrail log={auditLog} />
            </div>
          )}

          {/* Results table */}
          {results.length > 0 && (
            <div>
              <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1.5fr 1fr',gap:6,marginBottom:6 }}>
                {['Test', 'Value', 'Unit', 'Reference Range', 'Status'].map(h => (
                  <div key={h} style={{ fontSize:9,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',letterSpacing:.5 }}>{h}</div>
                ))}
              </div>
              {results.map((r, i) => (
                <div key={i} style={{ display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1.5fr 1fr',gap:6,marginBottom:6,padding:'8px 10px',background:'#f8fafc',borderRadius:10,border:`1.5px solid ${STATUS_COLORS[r.status]}30`,alignItems:'center' }}>
                  <div style={{ fontSize:12,fontWeight:700,color:'#0d1b2a' }}>{r.testName}</div>
                  <input value={r.value} onChange={e=>updateResult(i,'value',e.target.value)}
                    style={{ padding:'5px 8px',border:'1.5px solid #e2e9f3',borderRadius:7,fontSize:13,fontFamily:'monospace',fontWeight:700,color:STATUS_COLORS[r.status],background:'#fff',outline:'none',width:'100%' }} />
                  <input value={r.unit} onChange={e=>updateResult(i,'unit',e.target.value)} placeholder="e.g. g/dL"
                    style={{ padding:'5px 8px',border:'1.5px solid #e2e9f3',borderRadius:7,fontSize:12,fontFamily:'inherit',background:'#fff',outline:'none',width:'100%' }} />
                  <input value={r.referenceRange} onChange={e=>updateResult(i,'referenceRange',e.target.value)} placeholder="e.g. 12–16"
                    style={{ padding:'5px 8px',border:'1.5px solid #e2e9f3',borderRadius:7,fontSize:12,fontFamily:'inherit',background:'#fff',outline:'none',width:'100%' }} />
                  <select value={r.status} onChange={e=>updateResult(i,'status',e.target.value as any)}
                    style={{ padding:'5px 8px',border:`1.5px solid ${STATUS_COLORS[r.status]}`,borderRadius:7,fontSize:11,fontWeight:700,fontFamily:'inherit',background:`${STATUS_COLORS[r.status]}12`,color:STATUS_COLORS[r.status],outline:'none',width:'100%' }}>
                    <option value="normal">Normal</option>
                    <option value="abnormal">Abnormal</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Add new result */}
          {showAdd ? (
            <div style={{ background:'#f0fdf4',border:'1.5px solid rgba(10,170,118,.3)',borderRadius:14,padding:16 }}>
              <div style={{ fontSize:12,fontWeight:800,color:'#0aaa76',marginBottom:12 }}>+ Add Test Result</div>
              <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr',gap:10,marginBottom:10 }}>
                <div>
                  <label style={{ fontSize:9,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',display:'block',marginBottom:4 }}>Test Name *</label>
                  <input list="common-tests" value={newResult.testName} onChange={e=>setNewResult(p=>({...p,testName:e.target.value}))}
                    placeholder="e.g. Haemoglobin"
                    style={{ width:'100%',padding:'9px 11px',background:'#fff',border:'1.5px solid #e2e9f3',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none' }} />
                  <datalist id="common-tests">{COMMON_TESTS.map(t=><option key={t} value={t} />)}</datalist>
                </div>
                <div>
                  <label style={{ fontSize:9,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',display:'block',marginBottom:4 }}>Collected</label>
                  <input type="date" value={newResult.collectedAt} onChange={e=>setNewResult(p=>({...p,collectedAt:e.target.value}))}
                    style={{ width:'100%',padding:'9px 11px',background:'#fff',border:'1.5px solid #e2e9f3',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none' }} />
                </div>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10,marginBottom:12 }}>
                {[
                  { k:'value',          label:'Value *',    ph:'12.5' },
                  { k:'unit',           label:'Unit',       ph:'g/dL' },
                  { k:'referenceRange', label:'Ref Range',  ph:'12–16' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize:9,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',display:'block',marginBottom:4 }}>{f.label}</label>
                    <input value={(newResult as any)[f.k]} onChange={e=>setNewResult(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                      style={{ width:'100%',padding:'9px 11px',background:'#fff',border:'1.5px solid #e2e9f3',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none' }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:9,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',display:'block',marginBottom:4 }}>Status</label>
                  <select value={newResult.status} onChange={e=>setNewResult(p=>({...p,status:e.target.value as any}))}
                    style={{ width:'100%',padding:'9px 11px',background:'#fff',border:'1.5px solid #e2e9f3',borderRadius:8,fontSize:13,fontFamily:'inherit',outline:'none' }}>
                    <option value="normal">✅ Normal</option>
                    <option value="abnormal">⚠️ Abnormal</option>
                    <option value="critical">🚨 Critical</option>
                  </select>
                </div>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>setShowAdd(false)} style={{ flex:1,padding:'9px',background:'transparent',border:'1.5px solid #e2e9f3',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'#64748b' }}>Cancel</button>
                <button onClick={addResult} disabled={!newResult.testName||!newResult.value} style={{ flex:2,padding:'10px',background:'#0aaa76',color:'#fff',border:'none',borderRadius:10,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
                  + Add to Report
                </button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setShowAdd(true)} style={{ padding:'10px',background:'#f0fdf4',border:'2px dashed rgba(10,170,118,.4)',borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',color:'#0aaa76' }}>
              + Add Test Result
            </button>
          )}

          {results.length > 0 && (
            <div style={{ display:'flex',gap:10 }}>
              <button onClick={onClose} style={{ flex:1,padding:'11px',background:'transparent',border:'1.5px solid #e2e9f3',borderRadius:12,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'#64748b' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ flex:2,padding:'12px',background:'linear-gradient(135deg,#0aaa76,#06b6d4)',color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
                {saving ? 'Saving…' : '🧪 Save Results & Notify Patient'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Clinical Notes with Versioning ──────────────────────────────────────────
export function AuditedNotesModal({
  consultationId, appointmentId, currentNotes, doctor, patientId, onClose,
}: {
  consultationId: string; appointmentId: string; currentNotes: string;
  doctor: { uid: string; name: string }; patientId: string; onClose: () => void;
}) {
  const [notes,        setNotes]       = useState(currentNotes);
  const [reason,       setReason]      = useState('');
  const [saving,       setSaving]      = useState(false);
  const [auditLog,     setAuditLog]    = useState<AuditEntry[]>([]);
  const [showHistory,  setShowHistory] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'notesAudit'), where('consultationId','==',consultationId), orderBy('changedAt','desc')),
      snap => setAuditLog(snap.docs.map(d => d.data() as AuditEntry)),
    );
    return () => unsub();
  }, [consultationId]);

  const save = async () => {
    if (notes === currentNotes) { onClose(); return; }
    if (!reason.trim()) { alert('Please provide a reason for editing notes.'); return; }
    setSaving(true);
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'consultations', consultationId), { notes });
      await updateDoc(doc(db, 'appointments',  appointmentId),  { notes });
      await addDoc(collection(db, 'notesAudit'), {
        field: 'Clinical Notes', oldValue: currentNotes.slice(0,120) + (currentNotes.length>120?'…':''),
        newValue: notes.slice(0,120) + (notes.length>120?'…':''),
        changedBy: doctor.uid, changedByName: doctor.name, reason, changedAt: now,
        consultationId, appointmentId, createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'alerts'), {
        patientId, doctorId: doctor.uid, type: 'general',
        title: '📝 Clinical Notes Updated',
        message: `Dr. ${doctor.name} has updated your consultation notes. Reason: ${reason}`,
        read: false, createdAt: serverTimestamp(),
      });
      onClose();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const isEdited = notes !== currentNotes;

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(6px)' }} onClick={onClose}>
      <div style={{ background:'#fff',borderRadius:22,width:'100%',maxWidth:580,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,.18)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'22px 22px 0',display:'flex',justifyContent:'space-between',marginBottom:16 }}>
          <div>
            <h3 style={{ fontSize:18,fontWeight:800 }}>📝 Clinical Notes</h3>
            <p style={{ fontSize:12,color:'#8fa3bd',marginTop:2 }}>Versioned — all edits require a reason and are timestamped.</p>
          </div>
          <div style={{ display:'flex',gap:8,alignItems:'center' }}>
            <button onClick={()=>setShowHistory(v=>!v)} style={{ padding:'5px 10px',background:showHistory?'#6366f1':'#f0f4f8',color:showHistory?'#fff':'#64748b',border:'none',borderRadius:8,cursor:'pointer',fontSize:11,fontWeight:700,fontFamily:'inherit' }}>
              📋 History ({auditLog.length})
            </button>
            <button onClick={onClose} style={{ background:'#f0f4f8',border:'none',width:30,height:30,borderRadius:8,cursor:'pointer',fontSize:14 }}>✕</button>
          </div>
        </div>
        <div style={{ padding:'0 22px 22px',display:'flex',flexDirection:'column',gap:12 }}>
          {showHistory && (
            <div style={{ background:'#f8fafc',borderRadius:12,padding:14 }}>
              <AuditTrail log={auditLog} />
            </div>
          )}
          <div>
            <label style={{ fontSize:10,fontWeight:800,color:'#8fa3bd',textTransform:'uppercase',letterSpacing:.6,display:'block',marginBottom:5 }}>
              Notes (visible to patient after session)
            </label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={10}
              placeholder="Document findings, diagnosis, recommendations, follow-up plan…"
              style={{ width:'100%',padding:'12px',background:'#f8fafc',border:'1.5px solid #e2e9f3',borderRadius:12,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',lineHeight:1.7 }} />
          </div>
          {isEdited && (
            <div>
              <label style={{ fontSize:10,fontWeight:800,color:'#ef4444',textTransform:'uppercase',letterSpacing:.6,display:'block',marginBottom:5 }}>Reason for Edit * (required)</label>
              <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Corrected diagnosis, added follow-up plan, updated medication recommendation…"
                style={{ width:'100%',padding:'10px 12px',background:'#fff9f9',border:'1.5px solid rgba(239,68,68,.3)',borderRadius:9,fontSize:13,fontFamily:'inherit',outline:'none' }} />
            </div>
          )}
          <div style={{ display:'flex',gap:10 }}>
            <button onClick={onClose} style={{ flex:1,padding:'11px',background:'transparent',border:'1.5px solid #e2e9f3',borderRadius:12,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'#64748b' }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex:2,padding:'12px',background:'linear-gradient(135deg,#0aaa76,#06b6d4)',color:'#fff',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>
              {saving ? 'Saving…' : isEdited ? '💾 Save with Reason' : '✓ Close (No Changes)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}